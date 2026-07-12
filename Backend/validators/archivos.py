from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class HojaDict(BaseModel):
    nombre: Optional[str] = "Hoja"
    datos: Optional[List[Dict[str, Any]]] = []
    columnas: Optional[List[str]] = []

class SaveTableHojasRequest(BaseModel):
    nombre: Optional[str] = "Ejemplo"
    autor: Optional[str] = "Desconocido"
    hojas: Optional[List[HojaDict]] = []

class SaveTableRequest(BaseModel):
    nombre: Optional[str] = "Ejemplo"
    tabla: Optional[List[Dict[str, Any]]] = []
    autor: Optional[str] = "Desconocido"

class UpdateExcelRequest(BaseModel):
    filename: str
    hoja_index: Optional[int] = 0
    datos: Optional[List[Dict[str, Any]]] = []
    autor: Optional[str] = None
    curso: Optional[str] = None
    estrategia_guardado: Optional[str] = "overwrite"

class AddEditSheetRequest(BaseModel):
    filename: str
    datos: Optional[List[Dict[str, Any]]] = []
    autor: Optional[str] = None
    curso: Optional[str] = None
