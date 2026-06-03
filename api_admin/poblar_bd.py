import os
from dotenv import load_dotenv
from database import SessionLocal, engine
from models import Usuario, Base

# --- 1. IMPORTAR LA LIBRERÍA DE ENCRIPTACIÓN ---
from passlib.context import CryptContext

# --- 2. CONFIGURAR EL ENCRIPTADOR (BCRYPT) ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def obtener_hash_password(password):
    return pwd_context.hash(password)

# Cargar las variables del archivo .env
load_dotenv()

# Crea las tablas en MySQL automáticamente si aún no existen.
Base.metadata.create_all(bind=engine)

# Abrimos la conexión a MySQL
db = SessionLocal()

# Obtenemos las contraseñas del .env (si por algún error no existe el .env, usará "123" por defecto para no fallar)
pass_admin1 = os.getenv("ADMIN_1_PASSWORD", "123")
pass_admin2 = os.getenv("ADMIN_2_PASSWORD", "123")
pass_admin3 = os.getenv("ADMIN_3_PASSWORD", "123")

# Definimos los 3 usuarios que necesitas
usuarios_iniciales = [
    Usuario(
        email="Diego@usfx.bo", 
        nombre="Diego Coa", 
        # --- 3. ENCRIPTAR LA CONTRASEÑA ANTES DE GUARDARLA ---
        password=obtener_hash_password(pass_admin1), 
        rol="Administrador", 
        perfil="Desarrollador", 
        institucion="USFX"
    ),
    Usuario(
        email="Alberto@usfx.bo", 
        nombre="Luis Alberto Ibarra Calderon", 
        # --- 3. ENCRIPTAR LA CONTRASEÑA ANTES DE GUARDARLA ---
        password=obtener_hash_password(pass_admin2), 
        rol="Administrador", 
        perfil="Desarrollador", 
        institucion="USFX"
    ),
    Usuario(
        email="AdministracionEmpresas@usfx.bo", 
        nombre="Roberto Rivera Salazar", 
        # --- 3. ENCRIPTAR LA CONTRASEÑA ANTES DE GUARDARLA ---
        password=obtener_hash_password(pass_admin3), 
        rol="Administrador", 
        perfil="Director", 
        institucion="USFX"
    )
]

# Recorremos la lista y los guardamos
for u in usuarios_iniciales:
    existente = db.query(Usuario).filter(Usuario.email == u.email).first()
    if not existente:
        db.add(u)
        print(f"Usuario {u.nombre} agregado (con contraseña encriptada).")
    else:
        print(f"El usuario {u.nombre} ya existía.")

db.commit()
print("¡Base de datos actualizada con éxito y de forma segura!")
db.close()