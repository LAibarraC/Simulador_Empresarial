from config.database import SyncSessionLocal, engine
from models import Usuario, Base

# ¡ESTA ES LA LÍNEA MÁGICA QUE FALTABA! 
# Crea las tablas en MySQL automáticamente si aún no existen.
Base.metadata.create_all(bind=engine)

# Abrimos la conexión a MySQL
db = SyncSessionLocal()

# Definimos los 3 usuarios que necesitas
usuarios_iniciales = [
    Usuario(
        email="alberto@usfx.bo", 
        nombre="alberto", 
        password="123", 
        rol="Administrador", 
        perfil="Administrador", 
        institucion="USFX"
    ),
    Usuario(
        email="diego@usfx.bo", 
        nombre="diego", 
        password="123", 
        rol="Administrador", 
        perfil="Administrador", 
        institucion="USFX"
    ),
    Usuario(
    email="ulises@usfx.bo",
    nombre="Ulises Mancilla",
    password="123",
    rol="Administrador",
    perfil="Administrador",
    institucion="USFX"
),
]

# Recorremos la lista y los guardamos
for u in usuarios_iniciales:
    existente = db.query(Usuario).filter(Usuario.email == u.email).first()
    if not existente:
        db.add(u)
        print(f"Usuario {u.nombre} agregado.")
    else:
        print(f"El usuario {u.nombre} ya existía.")

db.commit()
print("¡Base de datos actualizada con éxito!")
db.close()