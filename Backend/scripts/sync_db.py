#Para ejecutarlo: python scripts/sync_db.py
import os
import sys
import datetime

# Asegurar que los imports del proyecto funcionen
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from alembic.config import Config
from alembic import command
from alembic.script import ScriptDirectory
from alembic.runtime.migration import MigrationContext
from sqlalchemy import create_engine, pool

# ─── Importar modelos para que Alembic los conozca ───────────────────────────
from config.database import Base
import models  # Carga: Usuario, Clase, Inscripcion, Archivo, HistorialCalculo, Notificacion

# ─── Preparar URL sincrona (Alembic necesita pymysql, no asyncmy) ─────────────
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/estadistica_db")
if DATABASE_URL.startswith("mysql+asyncmy://"):
    DATABASE_URL = DATABASE_URL.replace("mysql+asyncmy://", "mysql+pymysql://", 1)
elif DATABASE_URL.startswith("mysql://"):
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)

connect_args = {}
if "aivencloud" in DATABASE_URL:
    connect_args = {"ssl": {"ca": "ca.pem"}}

# ─── Detectar si hay cambios pendientes ──────────────────────────────────────
def hay_cambios_pendientes(engine) -> bool:
    """Compara los modelos con la BD y devuelve True si hay diferencias."""
    from alembic.autogenerate import compare_metadata
    with engine.connect() as conn:
        ctx = MigrationContext.configure(conn)
        diferencias = compare_metadata(ctx, Base.metadata)
    return len(diferencias) > 0

# ─── Script principal ─────────────────────────────────────────────────────────
def main():
    print("=" * 55)
    print("  SINCRONIZACION DE BASE DE DATOS")
    print("=" * 55)

    # Verificar conexion
    print("\n[1/3] Conectando a la base de datos...")
    try:
        engine = create_engine(DATABASE_URL, poolclass=pool.NullPool, connect_args=connect_args)
        with engine.connect():
            pass
        print("      Conexion exitosa.")
    except Exception as e:
        print(f"      ERROR: No se pudo conectar: {e}")
        sys.exit(1)

    # Verificar si hay cambios
    print("\n[2/3] Detectando cambios en los modelos...")
    try:
        if not hay_cambios_pendientes(engine):
            print("      Sin cambios. La base de datos ya esta actualizada.")
            print("\n" + "=" * 55)
            return
        print("      Se encontraron cambios. Generando migracion...")
    except Exception as e:
        print(f"      Advertencia al comparar: {e}")
        print("      Continuando con la sincronizacion de todas formas...")

    # Aplicar cambios con Alembic
    print("\n[3/3] Aplicando cambios a la base de datos...")
    try:
        # Configurar Alembic apuntando al alembic.ini en la raiz del Backend
        alembic_cfg = Config(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "alembic.ini"))

        # Generar la migracion automaticamente con timestamp
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        command.revision(
            alembic_cfg,
            autogenerate=True,
            message=f"sync_{timestamp}"
        )

        # Aplicar todas las migraciones pendientes
        command.upgrade(alembic_cfg, "head")

        print("      Cambios aplicados correctamente.")
    except Exception as e:
        print(f"      ERROR al aplicar cambios: {e}")
        sys.exit(1)

    print("\n Base de datos sincronizada con exito.")
    print("=" * 55)


if __name__ == "__main__":
    main()
