from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import numpy as np
from sklearn.linear_model import LinearRegression

# Importamos tus módulos matemáticos existentes
from MAT151 import tema3, tema4, tema5, tema6

router = APIRouter()

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

tema3_funciones = {
    "media": tema3.calcular_media,
    "media_geometrica": tema3.calcular_media_geometrica,
    "media_ponderada": tema3.calcular_media_ponderada,
    "mediana": tema3.calcular_mediana,
    "moda": tema3.calcular_moda,
    "media_agrupada": tema3.media_agrupada,
    "mediana_agrupada": tema3.mediana_agrupada,
    "moda_agrupada": tema3.moda_agrupada
}

tema4_funciones = {
    "varianza": tema4.calcular_varianza,
    "desviacion": tema4.calcular_desviacion,
    "rango": tema4.calcular_rango,
    "coef_variacion": tema4.calcular_coef_variacion,
}

temas_dict = {
    "tema3": tema3_funciones,
    "tema4": tema4_funciones,
}

@router.post("/calcular")
async def calcular(data: DataInput):
    datos = data.datos
    tema = data.tema.lower()
    tipo = data.tipo.lower()

    if not datos:
        return {"error": "No se enviaron datos"}

    funciones = temas_dict.get(tema)
    if not funciones:
        return {"error": f"Tema '{tema}' no soportado o manejado en cliente"}

    funcion = funciones.get(tipo)
    if not funcion:
        return {"error": f"Tipo de cálculo '{tipo}' no reconocido"}

    try:
        if tema == "tema3" and tipo == "media_ponderada":
            if not data.pesos:
                return {"error": "Se requieren los pesos para calcular la media ponderada"}
            return funcion(datos, data.pesos)
        if tema == "tema3" and tipo in ["media_agrupada", "mediana_agrupada", "moda_agrupada"]:
            return funcion(datos)
        
        return funcion(datos)
    except Exception as e:
        return {"error": str(e)}

@router.post("/calcular_bivariada")
async def calcular_bivariada(data: DataBivariada):
    x, y, tipo = data.x, data.y, data.tipo.lower()
    try:
        if tipo == "covarianza":
            return tema5.calcular_covarianza(x, y)
        elif tipo == "correlacion":
            return tema5.calcular_correlacion(x, y)
        elif tipo in ("regresion", "recta_regresion"):
            return tema5.calcular_regresion_lineal(x, y)
        elif tipo == "regresion_lineal":
            return tema6.regresion_lineal(x, y)
        elif tipo == "regresion_no_lineal":
            return tema6.regresion_no_lineal(x, y)
        elif tipo == "regresion_multivariante":
            return tema6.regresion_multivariante(x, y)
        else:
            return {"error": f"Tipo de cálculo '{tipo}' no reconocido"}
    except Exception as e:
        return {"error": str(e)}

@router.post("/calcular_multivariante")
async def calcular_multivariante(data: DataMultivariante):
    X, y, tipo = data.X, data.y, data.tipo.lower()
    if tipo != "regresion_multivariante":
        return {"error": f"Tipo de cálculo '{tipo}' no soportado"}

    try:
        X_array = np.array(X).T  
        y_array = np.array(y)

        modelo = LinearRegression()
        modelo.fit(X_array, y_array)

        coef = modelo.coef_.tolist()
        intercept = modelo.intercept_.item() if hasattr(modelo.intercept_, 'item') else modelo.intercept_

        return {"intercepto": intercept, "coeficientes": coef}
    except Exception as e:
        return {"error": str(e)}