import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

# 1. Leemos la URL completa directamente (en Render será la de Aiven, en tu PC la de XAMPP)
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "mysql+pymysql://root:23luis99@localhost:3306/estadistica_db"
)

# 2. Forzamos el driver pymysql si no viene en la URL
if SQLALCHEMY_DATABASE_URL.startswith("mysql://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)

# 3. Configuramos los parámetros extra (como el certificado SSL para Aiven)
connect_args = {}
# Si la URL es de Aiven, le inyectamos la configuración SSL
if "aivencloud" in SQLALCHEMY_DATABASE_URL:
    connect_args = {
        "ssl": {
            "ca": "ca.pem"  # <-- Asegúrate de que ca.pem esté guardado junto a este archivo
        }
    }

# 4. Creamos el engine pasándole el connect_args
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_pre_ping=True, 
    pool_recycle=3600,
    connect_args=connect_args
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