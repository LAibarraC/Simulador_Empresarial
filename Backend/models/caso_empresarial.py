from sqlalchemy import Column, Integer, String, Text, JSON
from config.database import Base

class CasoEmpresarial(Base):
    __tablename__ = "casos_empresariales"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    categoria = Column(String(100), nullable=False)
    tag = Column(String(100), nullable=True)
    dificultad = Column(String(50), nullable=False)
    estrellas = Column(Integer, default=1)
    capital = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=False)
    foco = Column(String(255), nullable=True)
    detalles = Column(JSON, nullable=True)
    creado_por = Column(Integer, nullable=True)  # id del usuario que creó el caso (NULL en casos anteriores)
