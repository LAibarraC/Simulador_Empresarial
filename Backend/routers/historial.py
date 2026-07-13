from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from config.database import get_db
import models
from middlewares.auth import get_current_user

# Importamos nuestro validador y controlador
from validators.historial import RegistroHistorial
from controllers import historial as historial_controller

router = APIRouter()

@router.post("/guardar_historial")
async def guardar_historial(registro: RegistroHistorial, db: AsyncSession = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    return await historial_controller.guardar_historial_db(db, registro, current_user)

@router.get("/obtener_historial")
async def obtener_historial(autor: Optional[str] = None, db: AsyncSession = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    return await historial_controller.obtener_historial_db(db, current_user)

@router.delete("/eliminar_historial/{registro_id}")
async def eliminar_historial(registro_id: int, autor: Optional[str] = None, db: AsyncSession = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    return await historial_controller.eliminar_historial_db(db, registro_id, current_user)
