from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.sql import func
from config.database import Base


class Notificacion(Base):
    """
    Registra notificaciones para los usuarios, ya sean personales o globales de sistema.
    """
    __tablename__ = "notificaciones"

    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(50), nullable=False)  # "personal" o "sistema"
    mensaje = Column(Text, nullable=False)
    leido = Column(Boolean, default=False, nullable=False)
    fecha_creacion = Column(DateTime, default=func.now())
    
    # Relación opcional con Usuario (si es personal)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)