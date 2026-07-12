from pydantic import BaseModel
from typing import Optional, List

class DataInput(BaseModel):
    datos: List[float]
    tipo: str   
    tema: str
    pesos: Optional[List[float]] = None

class DataBivariada(BaseModel):
    x: List[float]
    y: List[float]
    tipo: str  

class DataMultivariante(BaseModel):
    X: List[List[float]]  
    y: List[float]        
    tipo: str             
