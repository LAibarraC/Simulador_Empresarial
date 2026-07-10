import os
import json
import urllib.parse
from fastapi import APIRouter, Request, Body
from fastapi.responses import JSONResponse, RedirectResponse
from pydantic import BaseModel

router = APIRouter()

USUARIOS_FILE = "usuarios.json"

class UsuarioRegistro(BaseModel):
    nombre: str
    email: str
    password: str

class UsuarioLogin(BaseModel):
    email: str
    password: str

def cargar_usuarios():
    if not os.path.exists(USUARIOS_FILE):
        default_users = {
            "admin@usfx.bo": {
                "nombre": "Diego (Administrador)",
                "password": "123",
                "rol": "Administrador",
                "perfil": "Administrador",
                "institucion": "USFX"
            }
        }
        with open(USUARIOS_FILE, "w") as f:
            json.dump(default_users, f)
        return default_users
    
    with open(USUARIOS_FILE, "r") as f:
        return json.load(f)

def guardar_usuarios(usuarios_dict):
    with open(USUARIOS_FILE, "w") as f:
        json.dump(usuarios_dict, f)

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

@router.post("/registrar_usuario")
async def registrar_usuario(user_data: UsuarioRegistro):
    usuarios = cargar_usuarios()
    if user_data.email in usuarios:
        return JSONResponse(status_code=400, content={"error": "Este correo electrónico ya está registrado."})
    
    usuarios[user_data.email] = {
        "nombre": user_data.nombre,
        "email": user_data.email,
        "password": user_data.password, 
        "rol": "Estudiante"
    }
    guardar_usuarios(usuarios)
    return {"message": "Usuario registrado con éxito"}

@router.post("/login_local")
async def login_local(credentials: UsuarioLogin):
    usuarios = cargar_usuarios()
    user_info = usuarios.get(credentials.email)
    
    if not user_info or user_info["password"] != credentials.password:
        return JSONResponse(status_code=401, content={"error": "Correo o contraseña incorrectos"})
    
    return {
        "id": credentials.email,
        "nombre": user_info.get("nombre"),
        "rol": user_info.get("rol"),
        "email": credentials.email,
        "perfil": user_info.get("perfil", "Estudiante Externo"),
        "institucion": user_info.get("institucion", "")
    }