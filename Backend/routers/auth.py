import urllib.parse
from fastapi import APIRouter, Request, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from config.database import get_db
import models

# Importamos todo de nuestro controlador
from controllers.auth import (
    FECHA_LIMITE_MATRICULACION,
    verificar_email_logic, registrar_usuario_logic, login_local_logic,
    forgot_password_logic, reset_password_logic, recuperar_password_logic,
    resetear_password_logic, cambiar_password_perfil_logic, eliminar_cuenta_logic,
    cambiar_rol_logic, cambiar_estado_logic, admin_eliminar_usuario_logic, obtener_usuarios_logic
)

# Importamos de nuestro validador
from validators.auth import (
    VerificarEmailRequest, UsuarioRegistro, UsuarioLogin, ForgotPasswordRequest, 
    ResetPasswordRequest, RecuperarPassword, ResetearPassword, CambiarPasswordPerfil, 
    CambiarRol, CambiarEstado
)

from middlewares.auth import get_current_user, require_role

router = APIRouter()

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

@router.post("/verificar_email")
async def verificar_email(req: VerificarEmailRequest, db: Session = Depends(get_db)):
    return verificar_email_logic(req, db)

@router.post("/registrar_usuario")
async def registrar_usuario(usuario: UsuarioRegistro, db: Session = Depends(get_db)):
    return registrar_usuario_logic(usuario, db)

@router.post("/login_local")
async def login_local(credentials: UsuarioLogin, db: Session = Depends(get_db)):
    return login_local_logic(credentials, db)

@router.get("/me")
async def read_users_me(current_user: models.Usuario = Depends(get_current_user)):
    return {
        "id": current_user.email,
        "nombre": current_user.nombre,
        "rol": current_user.rol,
        "email": current_user.email,
        "perfil": current_user.perfil,
        "institucion": current_user.institucion
    }

@router.get("/docente-only")
async def test_docente_only(current_user: models.Usuario = Depends(require_role("Docente"))):
    return {"message": f"Acceso concedido al docente {current_user.nombre}."}

@router.post("/api/auth/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    return forgot_password_logic(data, db)

@router.post("/api/auth/reset-password")
async def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    return reset_password_logic(data, db)

@router.post("/recuperar_password")
async def recuperar_password(data: RecuperarPassword, db: Session = Depends(get_db)):
    return recuperar_password_logic(data, db)

@router.post("/resetear_password")
async def resetear_password(data: ResetearPassword, db: Session = Depends(get_db)):
    return resetear_password_logic(data, db)

@router.put("/cambiar_password_perfil")
async def cambiar_password_perfil(data: CambiarPasswordPerfil, db: Session = Depends(get_db)):
    return cambiar_password_perfil_logic(data, db)

@router.post("/eliminar_cuenta")
async def eliminar_cuenta(datos: UsuarioLogin, db: Session = Depends(get_db)):
    return eliminar_cuenta_logic(datos, db)

@router.put("/cambiar_rol")
async def cambiar_rol(datos: CambiarRol, db: Session = Depends(get_db), current_user: models.Usuario = Depends(require_role("Administrador"))):
    return cambiar_rol_logic(datos, db)

@router.put("/cambiar_estado")
async def cambiar_estado(datos: CambiarEstado, db: Session = Depends(get_db), current_user: models.Usuario = Depends(require_role("Administrador"))):
    return cambiar_estado_logic(datos, db, current_user.id)

@router.delete("/eliminar_usuario/{email}")
async def admin_eliminar_usuario(email: str, db: Session = Depends(get_db), current_user: models.Usuario = Depends(require_role("Administrador"))):
    return admin_eliminar_usuario_logic(email, db, current_user.id)

@router.get("/usuarios")
async def obtener_usuarios(db: Session = Depends(get_db), current_user: models.Usuario = Depends(require_role("Administrador"))):
    return obtener_usuarios_logic(db)
