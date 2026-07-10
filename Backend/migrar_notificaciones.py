import sys
from database import engine
from sqlalchemy import text

print("Iniciando migración del sistema de notificaciones...")
try:
    with engine.connect() as con:
        # 1. Verificar si la columna ultimo_aviso_global_id existe en usuarios
        res = con.execute(text("SHOW COLUMNS FROM usuarios LIKE 'ultimo_aviso_global_id'"))
        if not res.fetchone():
            con.execute(text("ALTER TABLE usuarios ADD COLUMN ultimo_aviso_global_id INT NOT NULL DEFAULT 0;"))
            print("Columna 'ultimo_aviso_global_id' agregada a la tabla 'usuarios'.")
        else:
            print("La columna 'ultimo_aviso_global_id' ya existe en la tabla 'usuarios'.")
            
        print("¡Migración de notificaciones completada con éxito!")

except Exception as e:
    print(f"Error durante la migración: {e}")
    sys.exit(1)
