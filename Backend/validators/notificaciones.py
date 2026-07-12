from pydantic import BaseModel
from typing import Optional, List

class NotificacionCrear(BaseModel):
    tipo: str  # "personal" o "sistema"
    mensaje: str
    usuario_id: Optional[int] = None