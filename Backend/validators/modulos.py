from pydantic import BaseModel, Field
from typing import List

class AsignarModulosDocente(BaseModel):
    modulos: List[str] = Field(default_factory=list)
