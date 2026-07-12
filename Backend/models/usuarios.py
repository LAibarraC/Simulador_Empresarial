from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.sql import func
from config.database import Base 

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, index=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    password = Column(String(100), nullable=False)
    rol = Column(String(50), default="Estudiante")
    perfil = Column(String(50), default="Estudiante Externo")
    institucion = Column(String(100), default="")
    activo = Column(Boolean, default=True, nullable=False)
    ultimo_aviso_global_id = Column(Integer, default=0, nullable=False)
    fecha_creacion = Column(DateTime, default=func.now())