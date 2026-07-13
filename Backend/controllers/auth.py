import os
import random
import hashlib
import bcrypt
import jwt
import urllib.parse
from datetime import datetime, timedelta, timezone
import asyncio
from dotenv import load_dotenv

from fastapi import HTTPException, status, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from config.database import get_db
import models
from validators.auth import (
    UsuarioRegistro, UsuarioLogin, RecuperarPassword, ResetearPassword,
    CambiarPasswordPerfil, ForgotPasswordRequest, ResetPasswordRequest,
    CambiarRol, CambiarEstado, VerificarEmailRequest
)

load_dotenv()

FECHA_LIMITE_MATRICULACION = "2026-06-30"
recovery_tokens = {}

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY no está definida en las variables de entorno. Configúrala en el archivo .env")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# --- UTILIDADES DE SEGURIDAD ---

def get_password_hash(password: str) -> str:
    password_truncated = password[:72]
    pre_hashed = hashlib.sha256(password_truncated.encode("utf-8")).hexdigest()
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pre_hashed.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_truncated = plain_password[:72]
    try:
        pre_hashed = hashlib.sha256(plain_truncated.encode("utf-8")).hexdigest()
        if bcrypt.checkpw(pre_hashed.encode("utf-8"), hashed_password.encode("utf-8")):
            return True
    except Exception:
        pass
    try:
        if bcrypt.checkpw(plain_truncated.encode("utf-8"), hashed_password.encode("utf-8")):
            return True
    except Exception:
        pass
    return plain_password == hashed_password

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_reset_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode = {"sub": email, "exp": expire, "purpose": "password_reset"}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_reset_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("purpose") != "password_reset":
            return None
        return payload.get("sub")
    except jwt.PyJWTError:
        return None

# Los middlewares get_current_user y require_role se han movido a middlewares/auth.py

# --- LÓGICA DE CONTROLADORES ---

async def verificar_email_logic(req: VerificarEmailRequest, db: AsyncSession):
    result = await db.execute(select(models.Usuario).filter(models.Usuario.email == req.email))
    usuario_existente = result.scalars().first()
    return {"existe": True} if usuario_existente else {"existe": False}

async def registrar_usuario_logic(usuario: UsuarioRegistro, db: AsyncSession):
    try:
        password_plana = usuario.password[:72]
        result = await db.execute(select(models.Usuario).filter(models.Usuario.email == usuario.email))
        usuario_existente = result.scalars().first()
        
        if usuario_existente:
            return JSONResponse(status_code=400, content={"error": "Este correo electrónico ya está registrado."})
        
        password_hasheada = get_password_hash(password_plana)
        nuevo_usuario = models.Usuario(
            email=usuario.email, nombre=usuario.nombre, password=password_hasheada,
            rol="Estudiante", perfil="Estudiante", institucion=""
        )
        
        db.add(nuevo_usuario)
        await db.commit()
        await db.refresh(nuevo_usuario)
        
        return {"message": "Usuario registrado con éxito"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno al registrar usuario: {str(e)}")

async def login_local_logic(credentials: UsuarioLogin, db: AsyncSession):
    result = await db.execute(select(models.Usuario).filter(models.Usuario.email == credentials.email))
    user_info = result.scalars().first()
    
    if not user_info or not verify_password(credentials.password, user_info.password):
        return JSONResponse(status_code=401, content={"error": "Correo o contraseña incorrectos"})
    
    if not getattr(user_info, "activo", True):
        return JSONResponse(status_code=403, content={"error": "Cuenta suspendida"})
        
    access_token = create_access_token(data={"id": user_info.id, "email": user_info.email, "rol": user_info.rol})
    
    return {
        "token": access_token, "id": user_info.email, "nombre": user_info.nombre,
        "rol": user_info.rol, "email": user_info.email, "perfil": user_info.perfil,
        "institucion": user_info.institucion
    }

async def forgot_password_logic(data: ForgotPasswordRequest, db: AsyncSession):
    result = await db.execute(select(models.Usuario).filter(models.Usuario.email == data.email))
    usuario = result.scalars().first()
    
    if usuario:
        token = create_reset_token(usuario.email)
        reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
        
        email_sender = os.getenv("EMAIL_SENDER")
        email_password = os.getenv("EMAIL_PASSWORD")
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        
        if email_sender and email_password:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = "Recuperacion de Contrasena - Software Estadistico"
                msg["From"] = email_sender
                msg["To"] = usuario.email
                
                html = f"""
                <html>
                  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f6f9; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 30px; background-color: white; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                      <h2 style="color: #2c3e50; text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 15px; margin-top: 0;">Restablecer Contrasena</h2>
                      <p>Hola, <strong>{usuario.nombre}</strong>:</p>
                      <p>Has solicitado restablecer tu contraseña para acceder a nuestro Software Estadístico.</p>
                      <p>Por favor, haz clic en el botón de abajo para restablecer tus credenciales. Este enlace expirará en <strong>15 minutos</strong> por tu seguridad.</p>
                      <div style="text-align: center; margin: 35px 0;">
                        <a href="{reset_link}" style="background-color: #3498db; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(52,152,219,0.2);">Restablecer Contrasena</a>
                      </div>
                      <p>Si el botón de arriba no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
                      <p style="word-break: break-all; color: #3498db;"><a href="{reset_link}" style="color: #3498db; text-decoration: none;">{reset_link}</a></p>
                      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
                      <p style="font-size: 0.85em; color: #7f8c8d; text-align: center; margin-bottom: 0;">Si tu no has solicitado este cambio, por favor ignora este correo electronico de forma segura.</p>
                    </div>
                  </body>
                </html>
                """
                msg.attach(MIMEText(html, "html"))
                
                # SMTP en un thread separado para no bloquear el event loop
                def _send_email():
                    with smtplib.SMTP(smtp_server, smtp_port) as server:
                        server.starttls()
                        server.login(email_sender, email_password)
                        server.sendmail(email_sender, usuario.email, msg.as_string())
                
                loop = asyncio.get_running_loop()
                await loop.run_in_executor(None, _send_email)
            except Exception as e:
                raise HTTPException(status_code=500, detail="Error interno al procesar el envio de correo.")
                
    return {"message": "Si el correo está registrado, recibirás un enlace en tu bandeja de entrada"}

async def reset_password_logic(data: ResetPasswordRequest, db: AsyncSession):
    email = verify_reset_token(data.token)
    if not email:
        raise HTTPException(status_code=400, detail="El token de recuperacion es invalido o ha expirado.")
        
    result = await db.execute(select(models.Usuario).filter(models.Usuario.email == email))
    usuario = result.scalars().first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
        
    usuario.password = get_password_hash(data.nueva_contrasena)
    await db.commit()
    return {"message": "Contrasena restablecida exitosamente."}

async def recuperar_password_logic(data: RecuperarPassword, db: AsyncSession):
    result = await db.execute(select(models.Usuario).filter(models.Usuario.email == data.email))
    usuario = result.scalars().first()
    if not usuario:
        return JSONResponse(status_code=404, content={"error": "No existe ningún usuario registrado con este correo."})
    
    token = str(random.randint(100000, 999999))
    expiry = datetime.now(timezone.utc) + timedelta(minutes=15)
    recovery_tokens[data.email] = (token, expiry)  # Guardamos el token con su fecha de expiración
    return {"message": "Token de recuperación generado con éxito.", "token": token}

async def resetear_password_logic(data: ResetearPassword, db: AsyncSession):
    entry = recovery_tokens.get(data.email)
    if not entry:
        return JSONResponse(status_code=400, content={"error": "Token de recuperación inválido o vencido."})
    token_valido, expiry = entry
    if token_valido != data.token or datetime.now(timezone.utc) > expiry:
        recovery_tokens.pop(data.email, None)  # Limpiar token inválido/expirado
        return JSONResponse(status_code=400, content={"error": "Token de recuperación inválido o vencido."})
    
    result = await db.execute(select(models.Usuario).filter(models.Usuario.email == data.email))
    usuario = result.scalars().first()
    if not usuario:
        return JSONResponse(status_code=404, content={"error": "Usuario no encontrado."})
    
    usuario.password = get_password_hash(data.nuevo_password)
    await db.commit()
    recovery_tokens.pop(data.email, None)
    return {"message": "Contraseña restablecida correctamente."}

async def cambiar_password_perfil_logic(data: CambiarPasswordPerfil, db: AsyncSession):
    result = await db.execute(select(models.Usuario).filter(models.Usuario.email == data.email))
    usuario = result.scalars().first()
    if not usuario or not verify_password(data.password_actual, usuario.password):
        return JSONResponse(status_code=400, content={"error": "La contraseña actual es incorrecta."})
    
    usuario.password = get_password_hash(data.password_nuevo)
    await db.commit()
    return {"message": "Contraseña cambiada exitosamente."}

async def eliminar_cuenta_logic(datos: UsuarioLogin, db: AsyncSession):
    from sqlalchemy import delete
    result = await db.execute(select(models.Usuario).filter(models.Usuario.email == datos.email))
    usuario = result.scalars().first()
    if not usuario or not verify_password(datos.password, usuario.password):
        return JSONResponse(status_code=401, content={"error": "Contraseña de confirmación incorrecta"})
    
    await db.execute(delete(models.Inscripcion).filter(models.Inscripcion.estudiante_id == usuario.id))
    await db.execute(delete(models.HistorialCalculo).filter(models.HistorialCalculo.usuario_id == usuario.id))
    await db.execute(delete(models.Archivo).filter(models.Archivo.usuario_id == usuario.id))
    
    result = await db.execute(select(models.Clase).filter(models.Clase.docente_id == usuario.id))
    clases_docente = result.scalars().all()
    for clase in clases_docente:
        await db.execute(delete(models.Inscripcion).filter(models.Inscripcion.clase_id == clase.id))
        await db.execute(delete(models.Archivo).filter(models.Archivo.clase_id == clase.id))
        await db.execute(delete(models.HistorialCalculo).filter(models.HistorialCalculo.clase_id == clase.id))
        await db.delete(clase)
        
    await db.delete(usuario)
    await db.commit()
    return {"message": "Cuenta eliminada con éxito"}

async def cambiar_rol_logic(datos: CambiarRol, db: AsyncSession):
    result = await db.execute(select(models.Usuario).filter(models.Usuario.email == datos.email))
    usuario = result.scalars().first()
    if not usuario:
        return JSONResponse(status_code=404, content={"error": "Usuario no encontrado"})
    
    usuario.rol = datos.nuevo_rol
    usuario.perfil = datos.nuevo_rol
    
    nueva_notificacion = models.Notificacion(
        tipo="rol_update",
        mensaje=f"Tu cuenta ha sido actualizada. Tu nuevo rol en la plataforma es: {datos.nuevo_rol}.",
        usuario_id=usuario.id,
        leido=False
    )
    db.add(nueva_notificacion)
    await db.commit()
    return {"message": f"El rol del usuario ha sido actualizado a {datos.nuevo_rol}"}

async def cambiar_estado_logic(datos: CambiarEstado, db: AsyncSession, current_user_id: int):
    result = await db.execute(select(models.Usuario).filter(models.Usuario.email == datos.email))
    usuario = result.scalars().first()
    if not usuario:
        return JSONResponse(status_code=404, content={"error": "Usuario no encontrado"})
        
    if usuario.id == current_user_id:
        return JSONResponse(status_code=400, content={"error": "No puedes suspender tu propia cuenta"})
        
    usuario.activo = datos.activo
    await db.commit()
    return {"message": f"El usuario ha sido {'activado' if datos.activo else 'suspendido'} con éxito"}

async def admin_eliminar_usuario_logic(email: str, db: AsyncSession, current_user_id: int):
    from sqlalchemy import delete
    result = await db.execute(select(models.Usuario).filter(models.Usuario.email == email))
    usuario = result.scalars().first()
    if not usuario:
        return JSONResponse(status_code=404, content={"error": "Usuario no encontrado"})
        
    if usuario.id == current_user_id:
        return JSONResponse(status_code=400, content={"error": "No puedes eliminar tu propia cuenta"})
        
    await db.execute(delete(models.Inscripcion).filter(models.Inscripcion.estudiante_id == usuario.id))
    await db.execute(delete(models.HistorialCalculo).filter(models.HistorialCalculo.usuario_id == usuario.id))
    await db.execute(delete(models.Archivo).filter(models.Archivo.usuario_id == usuario.id))
    
    result = await db.execute(select(models.Clase).filter(models.Clase.docente_id == usuario.id))
    clases_docente = result.scalars().all()
    for clase in clases_docente:
        await db.execute(delete(models.Inscripcion).filter(models.Inscripcion.clase_id == clase.id))
        await db.execute(delete(models.Archivo).filter(models.Archivo.clase_id == clase.id))
        await db.execute(delete(models.HistorialCalculo).filter(models.HistorialCalculo.clase_id == clase.id))
        await db.delete(clase)
        
    await db.delete(usuario)
    await db.commit()
    return {"message": "Usuario eliminado con éxito"}

async def obtener_usuarios_logic(db: AsyncSession):
    result = await db.execute(select(models.Usuario))
    usuarios = result.scalars().all()
    return [{
        "id": u.id, "email": u.email, "nombre": u.nombre, "rol": u.rol, 
        "perfil": u.perfil, "institucion": u.institucion, "activo": u.activo,
        "fecha_creacion": u.fecha_creacion.strftime("%Y-%m-%d %H:%M:%S") if u.fecha_creacion else None
    } for u in usuarios]
