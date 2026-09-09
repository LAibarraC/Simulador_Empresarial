from sqlalchemy import create_engine, text

engine = create_engine('mysql+pymysql://root:@localhost:3306/estadistica_db')
with engine.begin() as conn:
    try:
        conn.execute(text('ALTER TABLE entregas_tareas ADD COLUMN detalle_calificaciones LONGTEXT NULL'))
        print("Columna 'detalle_calificaciones' agregada a 'entregas_tareas'.")
    except Exception as e:
        print(f"Error agregando detalle_calificaciones: {e}")
