from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.sql import func
from config.database import Base

class HistorialCalculo(Base):
    """
    Guarda el registro de cada análisis estadístico realizado en la aplicación.
    Almacena los parámetros configurados y los resultados para mostrarlos en la página de Historial.
    """
    __tablename__ = "historial_calculos"

    id = Column(Integer, primary_key=True, index=True)
    tipo_analisis = Column(String(100), nullable=False)  # Ej: "Tendencia Central", "Bivariado", "Frecuencias"
    nombre_trabajo = Column(String(150), nullable=False)  # Título que el usuario le da a su cálculo
    fecha_creacion = Column(DateTime, default=func.now())
    
    # 📝 Guardamos configuraciones (columnas seleccionadas) y los resultados (medias, tablas, etc.) como texto estructurado (JSON string)
    parametros_json = Column(Text, nullable=False)
    resultados_json = Column(Text, nullable=False)
    
    # Relaciones
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)  # Quién ejecutó el cálculo
    clase_id = Column(Integer, ForeignKey("clases.id"), nullable=True)  # Opcional (por si calculó de forma libre sin estar en clase)
    archivo_id = Column(Integer, ForeignKey("archivos.id"), nullable=True)  # Qué archivo Excel se utilizó para este análisis
