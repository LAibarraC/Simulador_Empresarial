import asyncio
import json
import time

import jwt
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import AsyncSessionLocal, get_db
import models
from middlewares.auth import get_current_user, security, SECRET_KEY, ALGORITHM
from utils.notificaciones_sse import canal_notificaciones

# Importamos nuestro validador y controlador
from validators.notificaciones import NotificacionCrear
from controllers import notificaciones as notificaciones_controller

router = APIRouter()

@router.post("/notificaciones", status_code=status.HTTP_201_CREATED)
async def crear_notificacion(datos: NotificacionCrear, db: AsyncSession = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    return await notificaciones_controller.crear_notificacion_db(db, datos, current_user)

@router.get("/notificaciones")
async def obtener_notificaciones(db: AsyncSession = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    try:
        return await notificaciones_controller.obtener_notificaciones_db(db, current_user)
    except Exception as e:
        print("Error en obtener_notificaciones:", str(e))
        return []

def _evento_sse(nombre, datos):
    return "event: " + nombre + "\ndata: " + json.dumps(
        datos, ensure_ascii=False, separators=(",", ":")
    ) + "\n\n"


async def _estado_notificaciones(usuario_id):
    # Cada lectura libera su conexión; una conexión SSE no retiene una sesión SQL.
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(models.Usuario).where(models.Usuario.id == usuario_id))
        usuario = result.scalars().first()
        if usuario is None or not usuario.activo:
            return None
        return await notificaciones_controller.obtener_notificaciones_db(db, usuario)


async def _flujo_notificaciones(request, usuario_id, caducidad):
    suscripcion = canal_notificaciones.suscribir(usuario_id)
    cola = suscripcion[1]
    actualizar = True
    try:
        while not await request.is_disconnected():
            restante = caducidad - time.time()
            if restante <= 0:
                yield _evento_sse("sesion_expirada", {})
                return
            if actualizar:
                notificaciones = await _estado_notificaciones(usuario_id)
                if notificaciones is None or time.time() >= caducidad:
                    yield _evento_sse("sesion_expirada", {})
                    return
                yield _evento_sse("notificaciones", notificaciones)
            restante = caducidad - time.time()
            if restante <= 0:
                continue
            try:
                actualizar = await asyncio.wait_for(cola.get(), timeout=min(25, restante))
                if not actualizar:  # Cierre ordenado del servidor.
                    return
            except asyncio.TimeoutError:
                actualizar = False
                yield ": ping\n\n"
    finally:
        canal_notificaciones.desuscribir(usuario_id, suscripcion)


@router.get("/notificaciones/eventos")
async def eventos_notificaciones(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    # Bearer en cabecera: no se expone el token en URL ni en los logs de acceso.
    async with AsyncSessionLocal() as db:
        usuario = await get_current_user(credentials, db)
        usuario_id = usuario.id
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        caducidad = float(payload["exp"])
    except (jwt.PyJWTError, KeyError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Sesión inválida o expirada")

    return StreamingResponse(
        _flujo_notificaciones(request, usuario_id, caducidad),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    )


@router.put("/notificaciones/{notificacion_id}/leer")
async def marcar_como_leida(notificacion_id: int, db: AsyncSession = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    return await notificaciones_controller.marcar_como_leida_db(db, notificacion_id, current_user)

@router.put("/notificaciones/leer_todas")
async def marcar_todas_como_leidas(db: AsyncSession = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    try:
        return await notificaciones_controller.marcar_todas_como_leidas_db(db, current_user)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
