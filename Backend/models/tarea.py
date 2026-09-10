from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base
from models.archivo import Archivo

class Tarea(Base):
    __tablename__ = "tareas"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)
    clase_id = Column(Integer, ForeignKey("clases.id"), nullable=False)
    docente_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    archivo_id = Column(Integer, ForeignKey("archivos.id"), nullable=True)
    archivo_nombre_fijo = Column(String(255), nullable=True)
    ejercicios_seleccionados = Column(Text(length=4294967295), nullable=True) # JSON guardado como string
    fecha_limite = Column(DateTime, nullable=True)
    fecha_creacion = Column(DateTime, default=func.now())

    archivo = relationship("Archivo", lazy="joined")

    @property
    def archivo_nombre(self):
        if self.archivo and self.archivo.nombre_original:
            return self.archivo.nombre_original
        return getattr(self, "archivo_nombre_fijo", None)

class EntregaTarea(Base):
    __tablename__ = "entregas_tareas"

    id = Column(Integer, primary_key=True, index=True)
    tarea_id = Column(Integer, ForeignKey("tareas.id"), nullable=False)
    estudiante_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    archivo_entrega_id = Column(Integer, ForeignKey("archivos.id"), nullable=True)
    datos_respuesta = Column(Text(length=4294967295), nullable=True) # JSON guardado como string con las respuestas de la calculadora
    estado = Column(String(50), default="Pendiente") # Pendiente, Entregado, Revisado
    calificacion = Column(Integer, nullable=True)
    comentarios = Column(Text, nullable=True)
    detalle_calificaciones = Column(Text(length=4294967295), nullable=True) # JSON guardado como string con las notas por ejercicio
    fecha_entrega = Column(DateTime, nullable=True)
    fecha_creacion = Column(DateTime, default=func.now())

    estudiante = relationship("Usuario", lazy="joined")

    @property
    def estudiante_nombre(self):
        return self.estudiante.nombre if self.estudiante else None

    @property
    def estudiante_email(self):
        return self.estudiante.email if self.estudiante else None
