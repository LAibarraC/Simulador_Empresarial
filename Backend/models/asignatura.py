from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.sql import func
from config.database import Base

# --- TABLAS PARA GESTIÓN DE CLASES ---

class Clase(Base):
    __tablename__ = "clases"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False) # Ej: Estadística MAT151 - Grupo A
    codigo_acceso = Column(String(20), unique=True, index=True) # Código para que el alumno se una
    fecha_limite_matriculacion = Column(String(10), nullable=True) # Formato YYYY-MM-DD
    activa = Column(Boolean, nullable=False, default=True, server_default="1")
    
    modulo = Column(String(50), nullable=True) # Ej: MAT151, MAT251
    # Llave foránea: Vincula esta clase con el ID del docente que la creó
    docente_id = Column(Integer, ForeignKey("usuarios.id")) 
    fecha_creacion = Column(DateTime, default=func.now())

class DocenteModulo(Base):
    __tablename__ = "docente_modulos"

    id = Column(Integer, primary_key=True, index=True)
    docente_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    modulo = Column(String(50), nullable=False) # 'MAT151', 'MAT251'
    activo = Column(Boolean, nullable=False, default=True)
    fecha_asignacion = Column(DateTime, default=func.now())

class EstudianteModulo(Base):
    __tablename__ = "estudiante_modulos"

    id = Column(Integer, primary_key=True, index=True)
    estudiante_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    modulo = Column(String(50), nullable=False) # 'MAT151', 'MAT251'
    fecha_habilitacion = Column(DateTime, default=func.now())