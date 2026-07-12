from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.sql import func
from config.database import Base

class Inscripcion(Base):
    __tablename__ = "inscripciones"
    # Esta es la tabla puente. Une a un estudiante con una clase.
    
    id = Column(Integer, primary_key=True, index=True)
    clase_id = Column(Integer, ForeignKey("clases.id"))
    estudiante_id = Column(Integer, ForeignKey("usuarios.id"))
    fecha_creacion = Column(DateTime, default=func.now())
