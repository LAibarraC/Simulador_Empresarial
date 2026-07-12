import config.database as database
import models

print("Creando aviso global en la base de datos activa...")
db = database.SessionLocal()
try:
    aviso = models.Notificacion(
        tipo="sistema",
        mensaje="📢 ¡Atención! Se ha desplegado una nueva versión del Software Estadístico con mejoras de responsividad.",
        usuario_id=None,
        leido=False
    )
    db.add(aviso)
    db.commit()
    db.refresh(aviso)
    print(f"¡Aviso global creado con éxito! ID: {aviso.id}")
    print("Abre tu frontend, inicia sesión con cualquier cuenta y revisa la campana del Navbar.")
except Exception as e:
    print(f"Error al crear el aviso: {e}")
    db.rollback()
finally:
    db.close()
