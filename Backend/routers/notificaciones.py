from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from config.database import get_db
import models
from routers.auth import get_current_user

# Importamos nuestro validador y controlador
from validators.notificaciones import NotificacionCrear
from controllers import notificaciones as notificaciones_controller

router = APIRouter()

@router.post("/notificaciones", status_code=status.HTTP_201_CREATED)
async def crear_notificacion(datos: NotificacionCrear, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    return notificaciones_controller.crear_notificacion_db(db, datos, current_user)

@router.get("/notificaciones")
async def obtener_notificaciones(db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    try:
        return notificaciones_controller.obtener_notificaciones_db(db, current_user)
    except Exception as e:
        print("Error en obtener_notificaciones:", str(e))
        return []

@router.put("/notificaciones/{notificacion_id}/leer")
async def marcar_como_leida(notificacion_id: int, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    return notificaciones_controller.marcar_como_leida_db(db, notificacion_id, current_user)

@router.put("/notificaciones/leer_todas")
async def marcar_todas_como_leidas(db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    try:
        return notificaciones_controller.marcar_todas_como_leidas_db(db, current_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
