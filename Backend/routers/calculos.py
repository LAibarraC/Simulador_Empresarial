from fastapi import APIRouter

# Importamos el validador y controlador
from validators.calculos import DataInput, DataBivariada, DataMultivariante
from controllers import calculos as calculos_controller

router = APIRouter()

@router.post("/calcular")
async def calcular(data: DataInput):
    return calculos_controller.ejecutar_calculo(data)

@router.post("/calcular_bivariada")
async def calcular_bivariada(data: DataBivariada):
    return calculos_controller.ejecutar_calculo_bivariada(data)

@router.post("/calcular_multivariante")
async def calcular_multivariante(data: DataMultivariante):
    return calculos_controller.ejecutar_calculo_multivariante(data)
