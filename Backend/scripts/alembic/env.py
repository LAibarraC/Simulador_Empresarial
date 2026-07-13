import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context
from dotenv import load_dotenv

# ─── Agregar el raiz del Backend al path para que los imports funcionen ───────
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

load_dotenv()

# ─── Importar todos los modelos para que Alembic los detecte ─────────────────
# IMPORTANTE: si agregas un nuevo modelo, importalo aqui tambien
from config.database import Base
import models  # Carga: Usuario, Clase, Inscripcion, Archivo, HistorialCalculo, Notificacion

# ─── Configuracion de Alembic ─────────────────────────────────────────────────
config = context.config

# Sobreescribir la URL desde el .env (usa pymysql sincrono, Alembic no necesita asyncmy)
DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/estadistica_db")
if DATABASE_URL.startswith("mysql+asyncmy://"):
    DATABASE_URL = DATABASE_URL.replace("mysql+asyncmy://", "mysql+pymysql://", 1)
elif DATABASE_URL.startswith("mysql://"):
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)

config.set_main_option("sqlalchemy.url", DATABASE_URL)

# SSL para Aiven (produccion)
connect_args = {}
if "aivencloud" in DATABASE_URL:
    connect_args = {"ssl": {"ca": "ca.pem"}}

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Aqui Alembic lee todos los modelos importados arriba para comparar con la BD
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Genera el SQL sin conectarse a la BD (modo dry-run)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,      # detecta cambios de tipo de columna
        compare_server_default=True,  # detecta cambios en valores por defecto
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Aplica los cambios directamente a la BD."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        connect_args=connect_args,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
