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
    foto_perfil = Column(String(500), nullable=True) # URL de la foto (Google u otros)
    must_change_password = Column(Boolean, default=False, nullable=False)

class CredencialAutorizada(Base):
    __tablename__ = "credenciales_autorizadas"

    id = Column(Integer, primary_key=True, index=True)
    cu = Column(String(255), nullable=True, index=True) # Encrypted
    cu_hash = Column(String(64), nullable=True, index=True) # Blind Index for search
    ci = Column(String(255), nullable=False, index=True) # Encrypted
    ci_hash = Column(String(64), nullable=False, index=True) # Blind Index for search
    nombre = Column(String(255), nullable=False) # Encrypted
    rol = Column(String(50), nullable=False) # 'Docente' o 'Estudiante'
    registrado = Column(Boolean, default=False, nullable=False)
    fecha_carga = Column(DateTime, server_default=func.now(), nullable=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True) # Relación con el usuario creado
