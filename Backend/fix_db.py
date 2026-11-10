from sqlalchemy import create_engine, text
from config.database import SYNC_DATABASE_URL, connect_args

engine = create_engine(SYNC_DATABASE_URL, connect_args=connect_args)
with engine.begin() as conn:
    try:
        conn.execute(text('ALTER TABLE entregas_tareas ADD COLUMN detalle_calificaciones LONGTEXT NULL'))
        print("Columna 'detalle_calificaciones' agregada a 'entregas_tareas'.")
    except Exception as e:
        print(f"Info/Error entregas_tareas: {e}")

    try:
        conn.execute(text('ALTER TABLE usuarios ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0'))
        print("Columna 'must_change_password' agregada a 'usuarios'.")
    except Exception as e:
        print(f"Info/Error usuarios: {e}")

