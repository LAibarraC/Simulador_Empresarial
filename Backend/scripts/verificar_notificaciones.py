import config.database as database
import models
from sqlalchemy import or_

print("Iniciando pruebas de verificación de la arquitectura de notificaciones...")
db = database.SessionLocal()
try:
    # 1. Verificar si existe la columna ultimo_aviso_global_id
    usuario = db.query(models.Usuario).first()
    if usuario:
        print(f"Columna 'ultimo_aviso_global_id' leída con éxito: {usuario.ultimo_aviso_global_id}")
    else:
        print("No hay usuarios en la base de datos.")

    # 2. Agregar una notificación de prueba (personal)
    notif_pers = models.Notificacion(
        tipo="matriculacion",
        mensaje="Prueba matriculación estudiante",
        usuario_id=usuario.id if usuario else None,
        leido=False
    )
    db.add(notif_pers)
    
    # 3. Agregar una notificación de prueba (sistema)
    notif_glob = models.Notificacion(
        tipo="sistema",
        mensaje="Prueba actualización global sistema",
        usuario_id=None,
        leido=False
    )
    db.add(notif_glob)
    
    db.commit()
    print("Notificaciones de prueba creadas exitosamente.")
    
    # 4. Verificar consultas
    notificaciones = db.query(models.Notificacion).filter(
        or_(
            models.Notificacion.usuario_id == (usuario.id if usuario else None),
            models.Notificacion.tipo == "sistema"
        )
    ).all()
    print(f"Notificaciones leídas de la base de datos: {len(notificaciones)}")
    
    # Limpieza
    db.delete(notif_pers)
    db.delete(notif_glob)
    db.commit()
    print("Notificaciones de prueba eliminadas tras verificación.")
    print("¡Prueba de base de datos exitosa!")

except Exception as e:
    print(f"Error en la verificación: {e}")
    db.rollback()
finally:
    db.close()
