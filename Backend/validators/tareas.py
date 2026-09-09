from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TareaCreate(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    clase_id: int
    archivo_id: Optional[int] = None
    ejercicios_seleccionados: Optional[str] = None # JSON string
    fecha_limite: Optional[datetime] = None

class TareaResponse(BaseModel):
    id: int
    titulo: str
    descripcion: Optional[str] = None
    clase_id: int
    docente_id: int
    archivo_id: Optional[int] = None
    archivo_nombre: Optional[str] = None
    ejercicios_seleccionados: Optional[str] = None
    fecha_limite: Optional[datetime] = None
    fecha_creacion: datetime

    class Config:
        from_attributes = True

class EntregaTareaCreate(BaseModel):
    tarea_id: int
    archivo_entrega_id: Optional[int] = None
    datos_respuesta: Optional[str] = None # JSON string

class CalificarEntregaRequest(BaseModel):
    calificacion: Optional[int] = None
    comentarios: Optional[str] = None
    estado: Optional[str] = "Revisado"
    detalle_calificaciones: Optional[str] = None

class EntregaTareaResponse(BaseModel):
    id: int
    tarea_id: int
    estudiante_id: int
    estudiante_nombre: Optional[str] = None
    estudiante_email: Optional[str] = None
    archivo_entrega_id: Optional[int] = None
    datos_respuesta: Optional[str] = None
    estado: str
    calificacion: Optional[int] = None
    comentarios: Optional[str] = None
    detalle_calificaciones: Optional[str] = None
    fecha_entrega: Optional[datetime] = None
    fecha_creacion: datetime

    class Config:
        from_attributes = True
