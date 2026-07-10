import urllib.parse
import random
import os
import hashlib
import bcrypt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import jwt

from fastapi import APIRouter, Request, Depends, HTTPException, status
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Importamos la base de datos y modelos
from database import get_db
from models import Usuario, Inscripcion, Archivo, HistorialCalculo, Clase, Notificacion

load_dotenv()

router = APIRouter()

# Configuración global de matriculación
FECHA_LIMITE_MATRICULACION = "2026-06-30"  # Formato YYYY-MM-DD
recovery_tokens = {}

# Configuración de JWT
SECRET_KEY = os.getenv("SECRET_KEY", "943e8bb8ef8f8a846174a7d77b4d18ea65bf6b1424e6a066cf8b22a613589b3f")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

def get_password_hash(password: str) -> str:
    # Truncado de seguridad: limitamos a 72 caracteres
    password_truncated = password[:72]
    # Pre-hash con SHA-256 para evitar el límite de 72 bytes de bcrypt
    pre_hashed = hashlib.sha256(password_truncated.encode("utf-8")).hexdigest()
    # Hasheamos con bcrypt directamente para evitar incompatibilidad de passlib
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pre_hashed.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Truncado de seguridad: limitamos a 72 caracteres
    plain_truncated = plain_password[:72]

    # 1. Intentamos verificar con pre-hash de SHA-256 (nuevo método)
    try:
        pre_hashed = hashlib.sha256(plain_truncated.encode("utf-8")).hexdigest()
        if bcrypt.checkpw(pre_hashed.encode("utf-8"), hashed_password.encode("utf-8")):
            return True
    except Exception:
        pass

    # 2. Si falla, intentamos verificar en plano contra bcrypt (método antiguo para retrocompatibilidad)
    try:
        if bcrypt.checkpw(plain_truncated.encode("utf-8"), hashed_password.encode("utf-8")):
            return True
    except Exception:
        pass

    # 3. Fallback final para texto plano puro sin hash
    return plain_password == hashed_password

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_reset_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode = {"sub": email, "exp": expire, "purpose": "password_reset"}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_reset_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("purpose") != "password_reset":
            return None
        return payload.get("sub")
    except jwt.PyJWTError:
        return None

# Dependencia para obtener el usuario autenticado a través de JWT
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar la credencial de acceso. Sesión inválida o expirada.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("email")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if user is None:
        raise credentials_exception
        
    # Verificar si el usuario está activo
    if not getattr(user, "activo", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta suspendida",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return user

# Dependencia para validar roles (RBAC)
def require_role(allowed_roles: list[str] | str):
    if isinstance(allowed_roles, str):
        allowed_roles = [allowed_roles]
        
    async def role_checker(current_user: Usuario = Depends(get_current_user)):
        if current_user.rol not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere uno de los siguientes roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker

class UsuarioRegistro(BaseModel):
    nombre: str
    email: str
    password: str

class UsuarioLogin(BaseModel):
    email: str
    password: str

class RecuperarPassword(BaseModel):
    email: str

class ResetearPassword(BaseModel):
    email: str
    token: str
    nuevo_password: str

class CambiarPasswordPerfil(BaseModel):
    email: str
    password_actual: str
    password_nuevo: str

@router.post("/lti/launch")
async def lti_launch(request: Request):
    try:
        form_data = await request.form()
        user_id = form_data.get("user_id", "ID_USFX_001")
        full_name = form_data.get("lis_person_name_full", "Estudiante de Prueba")
        roles = form_data.get("roles", "Learner")
        
        safe_name = urllib.parse.quote(full_name)
        safe_role = urllib.parse.quote(roles)
        
        target_url = f"http://localhost:5173/lti-tester?name={safe_name}&role={safe_role}&id={user_id}"
        return RedirectResponse(url=target_url, status_code=303)
    except Exception as e:
        return {"error": f"Fallo en la conexión LTI: {str(e)}"}

@router.get("/fecha_limite")
async def obtener_fecha_limite():
    return {"fecha_limite": FECHA_LIMITE_MATRICULACION}

class VerificarEmailRequest(BaseModel):
    email: str

@router.post("/verificar_email")
async def verificar_email(req: VerificarEmailRequest, db: Session = Depends(get_db)):
    usuario_existente = db.query(Usuario).filter(Usuario.email == req.email).first()
    if usuario_existente:
        return {"existe": True}
    return {"existe": False}

@router.post("/registrar_usuario")
async def registrar_usuario(usuario: UsuarioRegistro, db: Session = Depends(get_db)):
    try:
        # Truncado de seguridad opcional (máximo 72 caracteres)
        password_plana = usuario.password[:72]
        
        # Imprimir la contraseña recibida justo antes de la encriptación para depuración
        print(f"Password recibida: {password_plana}")
        
        # 1. Buscamos si el correo ya existe en MySQL
        usuario_existente = db.query(Usuario).filter(Usuario.email == usuario.email).first()
        
        if usuario_existente:
            return JSONResponse(status_code=400, content={"error": "Este correo electrónico ya está registrado."})
        
        # 2. Encriptamos la contraseña una sola vez y creamos el nuevo usuario
        password_hasheada = get_password_hash(password_plana)
        
        nuevo_usuario = Usuario(
            email=usuario.email,
            nombre=usuario.nombre,
            password=password_hasheada,
            rol="Estudiante",
            perfil="Estudiante",
            institucion=""
        )
        
        # 3. Lo guardamos en la base de datos
        db.add(nuevo_usuario)
        db.commit()
        db.refresh(nuevo_usuario)
        
        return {"message": "Usuario registrado con éxito"}
    except Exception as e:
        print(f"Error interno en registrar_usuario: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error interno al registrar usuario: {str(e)}"
        )

@router.post("/login_local")
async def login_local(credentials: UsuarioLogin, db: Session = Depends(get_db)):
    # 1. Buscamos al usuario por su email
    user_info = db.query(Usuario).filter(Usuario.email == credentials.email).first()
    
    # 2. Verificamos que exista y que la contraseña coincida (con hash o fallback plano)
    if not user_info or not verify_password(credentials.password, user_info.password):
        return JSONResponse(status_code=401, content={"error": "Correo o contraseña incorrectos"})
    
    # 3. Verificamos si el usuario está activo
    if not getattr(user_info, "activo", True):
        return JSONResponse(status_code=403, content={"error": "Cuenta suspendida"})
        
    # 4. Generamos el token JWT firmado
    access_token = create_access_token(
        data={"id": user_info.id, "email": user_info.email, "rol": user_info.rol}
    )
    
    # 5. Devolvemos los datos y el token al frontend
    return {
        "token": access_token,
        "id": user_info.email,
        "nombre": user_info.nombre,
        "rol": user_info.rol,
        "email": user_info.email,
        "perfil": user_info.perfil,
        "institucion": user_info.institucion
    }

@router.get("/me")
async def read_users_me(current_user: Usuario = Depends(get_current_user)):
    """Retorna los datos del usuario logueado en base a su token JWT"""
    return {
        "id": current_user.email,
        "nombre": current_user.nombre,
        "rol": current_user.rol,
        "email": current_user.email,
        "perfil": current_user.perfil,
        "institucion": current_user.institucion
    }

@router.get("/docente-only")
async def test_docente_only(current_user: Usuario = Depends(require_role("Docente"))):
    """Ruta protegida por rol de prueba"""
    return {"message": f"Acceso concedido al docente {current_user.nombre}."}

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    nueva_contrasena: str

@router.post("/api/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = data.email
    print(f"Buscando usuario: {email}")
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    
    if usuario:
        print("Usuario encontrado, generando token...")
        token = create_reset_token(usuario.email)
        reset_link = f"http://localhost:5173/reset-password?token={token}"
        
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
                
                with smtplib.SMTP(smtp_server, smtp_port) as server:
                    server.starttls()
                    server.login(email_sender, email_password)
                    server.sendmail(email_sender, usuario.email, msg.as_string())
                print("Correo enviado exitosamente a través de Gmail.")
            except Exception as e:
                print(f"Error crítico al enviar correo SMTP: {e}")
                raise HTTPException(status_code=500, detail="Error interno al procesar el envio de correo.")
                
    return {"message": "Si el correo está registrado, recibirás un enlace en tu bandeja de entrada"}

@router.post("/api/auth/reset-password")
async def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    email = verify_reset_token(data.token)
    if not email:
        raise HTTPException(status_code=400, detail="El token de recuperacion es invalido o ha expirado.")
        
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
        
    usuario.password = get_password_hash(data.nueva_contrasena)
    db.commit()
    return {"message": "Contrasena restablecida exitosamente."}

@router.post("/recuperar_password")
async def recuperar_password(data: RecuperarPassword, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == data.email).first()
    if not usuario:
        return JSONResponse(status_code=404, content={"error": "No existe ningún usuario registrado con este correo."})
    
    # Generamos un token simple de 6 dígitos
    token = str(random.randint(100000, 999999))
    recovery_tokens[data.email] = token
    
    # Retornamos el token en la respuesta para facilitar la prueba en el frontend
    return {
        "message": "Token de recuperación generado con éxito.",
        "token": token
    }

@router.post("/resetear_password")
async def resetear_password(data: ResetearPassword, db: Session = Depends(get_db)):
    token_valido = recovery_tokens.get(data.email)
    if not token_valido or token_valido != data.token:
        return JSONResponse(status_code=400, content={"error": "Token de recuperación inválido o vencido."})
    
    usuario = db.query(Usuario).filter(Usuario.email == data.email).first()
    if not usuario:
        return JSONResponse(status_code=404, content={"error": "Usuario no encontrado."})
    
    # Hasheamos la nueva contraseña al resetearla
    usuario.password = get_password_hash(data.nuevo_password)
    db.commit()
    
    recovery_tokens.pop(data.email, None)
    return {"message": "Contraseña restablecida correctamente."}

@router.put("/cambiar_password_perfil")
async def cambiar_password_perfil(data: CambiarPasswordPerfil, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == data.email).first()
    if not usuario or not verify_password(data.password_actual, usuario.password):
        return JSONResponse(status_code=400, content={"error": "La contraseña actual es incorrecta."})
    
    # Hasheamos la nueva contraseña
    usuario.password = get_password_hash(data.password_nuevo)
    db.commit()
    return {"message": "Contraseña cambiada exitosamente."}

@router.post("/eliminar_cuenta")
async def eliminar_cuenta(datos: UsuarioLogin, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if not usuario or not verify_password(datos.password, usuario.password):
        return JSONResponse(status_code=401, content={"error": "Contraseña de confirmación incorrecta"})
    
    # 1. Eliminar inscripciones de este estudiante
    db.query(Inscripcion).filter(Inscripcion.estudiante_id == usuario.id).delete(synchronize_session=False)
    
    # 2. Eliminar historial de cálculos de este usuario
    db.query(HistorialCalculo).filter(HistorialCalculo.usuario_id == usuario.id).delete(synchronize_session=False)
    
    # 3. Eliminar archivos subidos por este usuario
    db.query(Archivo).filter(Archivo.usuario_id == usuario.id).delete(synchronize_session=False)
    
    # 4. Manejar las clases que tiene si es docente
    clases_docente = db.query(Clase).filter(Clase.docente_id == usuario.id).all()
    for clase in clases_docente:
        # Borrar inscripciones de los alumnos a esta clase
        db.query(Inscripcion).filter(Inscripcion.clase_id == clase.id).delete(synchronize_session=False)
        # Borrar archivos de esta clase
        db.query(Archivo).filter(Archivo.clase_id == clase.id).delete(synchronize_session=False)
        # Borrar historial de cálculos vinculados a esta clase
        db.query(HistorialCalculo).filter(HistorialCalculo.clase_id == clase.id).delete(synchronize_session=False)
        db.delete(clase)
        
    # 5. Eliminar al usuario
    db.delete(usuario)
    db.commit()
    
    return {"message": "Cuenta eliminada con éxito"}

class CambiarRol(BaseModel):
    email: str
    nuevo_rol: str

class CambiarEstado(BaseModel):
    email: str
    activo: bool

@router.put("/cambiar_rol")
async def cambiar_rol(datos: CambiarRol, db: Session = Depends(get_db), current_user: Usuario = Depends(require_role("Administrador"))):
    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if not usuario:
        return JSONResponse(status_code=404, content={"error": "Usuario no encontrado"})
    
    usuario.rol = datos.nuevo_rol
    usuario.perfil = datos.nuevo_rol
    
    # Crear notificación para el usuario sobre su cambio de rol
    nueva_notificacion = Notificacion(
        tipo="rol_update",
        mensaje=f"Tu cuenta ha sido actualizada. Tu nuevo rol en la plataforma es: {datos.nuevo_rol}.",
        usuario_id=usuario.id,
        leido=False
    )
    db.add(nueva_notificacion)
    
    db.commit()
    return {"message": f"El rol del usuario ha sido actualizado a {datos.nuevo_rol}"}

@router.put("/cambiar_estado")
async def cambiar_estado(datos: CambiarEstado, db: Session = Depends(get_db), current_user: Usuario = Depends(require_role("Administrador"))):
    usuario = db.query(Usuario).filter(Usuario.email == datos.email).first()
    if not usuario:
        return JSONResponse(status_code=404, content={"error": "Usuario no encontrado"})
        
    if usuario.id == current_user.id:
        return JSONResponse(status_code=400, content={"error": "No puedes suspender tu propia cuenta"})
        
    usuario.activo = datos.activo
    db.commit()
    estado_str = "activado" if datos.activo else "suspendido"
    return {"message": f"El usuario ha sido {estado_str} con éxito"}

@router.delete("/eliminar_usuario/{email}")
async def admin_eliminar_usuario(email: str, db: Session = Depends(get_db), current_user: Usuario = Depends(require_role("Administrador"))):
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        return JSONResponse(status_code=404, content={"error": "Usuario no encontrado"})
        
    if usuario.id == current_user.id:
        return JSONResponse(status_code=400, content={"error": "No puedes eliminar tu propia cuenta"})
        
    # 1. Eliminar inscripciones
    db.query(Inscripcion).filter(Inscripcion.estudiante_id == usuario.id).delete(synchronize_session=False)
    # 2. Eliminar historial
    db.query(HistorialCalculo).filter(HistorialCalculo.usuario_id == usuario.id).delete(synchronize_session=False)
    # 3. Eliminar archivos
    db.query(Archivo).filter(Archivo.usuario_id == usuario.id).delete(synchronize_session=False)
    
    # 4. Manejar las clases que tiene si es docente
    clases_docente = db.query(Clase).filter(Clase.docente_id == usuario.id).all()
    for clase in clases_docente:
        db.query(Inscripcion).filter(Inscripcion.clase_id == clase.id).delete(synchronize_session=False)
        db.query(Archivo).filter(Archivo.clase_id == clase.id).delete(synchronize_session=False)
        db.query(HistorialCalculo).filter(HistorialCalculo.clase_id == clase.id).delete(synchronize_session=False)
        db.delete(clase)
        
    db.delete(usuario)
    db.commit()
    return {"message": "Usuario eliminado con éxito"}

@router.get("/usuarios")
async def obtener_usuarios(db: Session = Depends(get_db), current_user: Usuario = Depends(require_role("Administrador"))):
    usuarios = db.query(Usuario).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "nombre": u.nombre,
            "rol": u.rol,
            "perfil": u.perfil,
            "institucion": u.institucion,
            "activo": u.activo,
            "fecha_creacion": u.fecha_creacion.strftime("%Y-%m-%d %H:%M:%S") if u.fecha_creacion else None
        }
        for u in usuarios
    ]