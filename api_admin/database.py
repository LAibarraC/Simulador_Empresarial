from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# --- NUEVAS LÍNEAS AQUÍ ---
from dotenv import load_dotenv
load_dotenv()  # Esto obliga a Python a leer el archivo .env
# --------------------------

# En producción, leemos la URL de la base de datos desde variables de entorno.
# Si no está definida, usamos la conexión por defecto de XAMPP local.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL") or "mysql+pymysql://root:23luis99@localhost:3306/estadistica_db"

# Si la URL empieza con mysql:// (sin especificar driver), forzamos mysql+pymysql:// para SQLAlchemy
if SQLALCHEMY_DATABASE_URL.startswith("mysql://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_pre_ping=True, 
    pool_recycle=3600
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Esta función nos dará la conexión en cada petición de FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()