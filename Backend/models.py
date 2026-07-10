from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime, Boolean
from sqlalchemy.sql import func
from database import Base

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

# --- TABLAS PARA GESTIÓN DE CLASES ---

class Clase(Base):
    __tablename__ = "clases"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False) # Ej: Estadística MAT151 - Grupo A
    codigo_acceso = Column(String(20), unique=True, index=True) # Código para que el alumno se una
    fecha_limite_matriculacion = Column(String(10), nullable=True) # Formato YYYY-MM-DD
    
    # Llave foránea: Vincula esta clase con el ID del docente que la creó
    docente_id = Column(Integer, ForeignKey("usuarios.id")) 
    fecha_creacion = Column(DateTime, default=func.now())

class Inscripcion(Base):
    __tablename__ = "inscripciones"
    # Esta es la tabla puente. Une a un estudiante con una clase.
    
    id = Column(Integer, primary_key=True, index=True)
    clase_id = Column(Integer, ForeignKey("clases.id"))
    estudiante_id = Column(Integer, ForeignKey("usuarios.id"))
    fecha_creacion = Column(DateTime, default=func.now())


# --- 🆕 NUEVAS TABLAS: ARCHIVOS HISTORIAL DE CÁLCULOS ---

class Archivo(Base):
    """
    Registra los metadatos de los archivos Excel subidos al sistema.
    El archivo físico se guarda en una carpeta del servidor, y aquí guardamos la ruta.
    """
    __tablename__ = "archivos"

    id = Column(Integer, primary_key=True, index=True)
    nombre_original = Column(String(255), nullable=False)  # Ej: datos_ventas.xlsx
    ruta_servidor = Column(String(550), nullable=False)    # Ej: uploads/clase_1/datos_ventas.xlsx
    fecha_subida = Column(DateTime, default=func.now())
    
    # Relaciones obligatorias
    clase_id = Column(Integer, ForeignKey("clases.id"), nullable=False)  # A qué clase pertenece
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)  # Quién lo subió (Docente/Admin)


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