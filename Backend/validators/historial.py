from pydantic import BaseModel
from typing import Any, Dict, Optional

class RegistroHistorial(BaseModel):
    autor: str
    calculo: str
    archivo_origen: str
    snapshot: Optional[Dict[str, Any]] = None