from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from config.database import get_db
from validators.tareas import (
    TareaCreate, 
    TareaResponse, 
    EntregaTareaCreate, 
    EntregaTareaResponse,
    CalificarEntregaRequest
)
from controllers.tareas import (
    crear_tarea,
    obtener_tareas_por_clase,
    obtener_tarea_por_id,
    crear_entrega,
    obtener_entregas_por_tarea,
    obtener_entregas_por_estudiante,
    obtener_entrega_estudiante_tarea,
    calificar_entrega,
    eliminar_tarea
)
from middlewares.auth import get_current_user

router = APIRouter(
    prefix="/tareas",
    tags=["Tareas"],
    responses={404: {"description": "Not found"}},
)

from datetime import datetime, timezone

def es_fecha_pasada(dt: datetime) -> bool:
    if not dt:
        return False
    if dt.tzinfo is not None:
        return dt < datetime.now(dt.tzinfo)
    return dt < datetime.now()

@router.post("/", response_model=TareaResponse)
async def crear_nueva_tarea(tarea: TareaCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user_rol = (current_user.rol or "").strip().lower()
    if user_rol not in ["docente", "profesor", "administrador", "admin"]:
        raise HTTPException(status_code=403, detail="No autorizado para crear tareas")
    
    if tarea.fecha_limite and es_fecha_pasada(tarea.fecha_limite):
        raise HTTPException(status_code=400, detail="La fecha límite no puede ser anterior a la fecha y hora actual.")

    return await crear_tarea(db=db, tarea=tarea, docente_id=current_user.id)

@router.get("/clase/{clase_id}", response_model=List[TareaResponse])
async def listar_tareas_clase(clase_id: int, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return await obtener_tareas_por_clase(db=db, clase_id=clase_id)

@router.get("/{tarea_id}", response_model=TareaResponse)
async def obtener_tarea(tarea_id: int, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    tarea = await obtener_tarea_por_id(db=db, tarea_id=tarea_id)
    if not tarea:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    return tarea

@router.post("/entregas/", response_model=EntregaTareaResponse)
async def entregar_tarea(entrega: EntregaTareaCreate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user_rol = (current_user.rol or "").strip().lower()
    if user_rol in ["docente", "profesor"]:
        raise HTTPException(status_code=403, detail="Los docentes no pueden entregar tareas.")
    
    # Validar que la tarea exista y que no esté vencida
    tarea = await obtener_tarea_por_id(db=db, tarea_id=entrega.tarea_id)
    if not tarea:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    
    if tarea.fecha_limite and es_fecha_pasada(tarea.fecha_limite):
        raise HTTPException(status_code=400, detail="El plazo de entrega para esta tarea ha vencido.")
    
    # Check if already submitted
    existente = await obtener_entrega_estudiante_tarea(db, current_user.id, entrega.tarea_id)
    if existente:
        raise HTTPException(status_code=400, detail="Ya has entregado esta tarea")
        
    return await crear_entrega(db=db, entrega=entrega, estudiante_id=current_user.id)

@router.get("/entregas/tarea/{tarea_id}", response_model=List[EntregaTareaResponse])
async def listar_entregas_tarea(tarea_id: int, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user_rol = (current_user.rol or "").strip().lower()
    if user_rol not in ["docente", "profesor", "administrador", "admin"]:
        raise HTTPException(status_code=403, detail="No autorizado para ver entregas de otros")
    return await obtener_entregas_por_tarea(db=db, tarea_id=tarea_id)

@router.get("/entregas/estudiante/{clase_id}", response_model=List[EntregaTareaResponse])
async def listar_entregas_estudiante(clase_id: int, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return await obtener_entregas_por_estudiante(db=db, estudiante_id=current_user.id, clase_id=clase_id)

@router.get("/entregas/{tarea_id}/mi-entrega", response_model=EntregaTareaResponse)
async def obtener_mi_entrega(tarea_id: int, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    entrega = await obtener_entrega_estudiante_tarea(db=db, estudiante_id=current_user.id, tarea_id=tarea_id)
    if not entrega:
        raise HTTPException(status_code=404, detail="Entrega no encontrada")
    return entrega

@router.put("/entregas/{entrega_id}/calificar", response_model=EntregaTareaResponse)
async def calificar_entrega_endpoint(
    entrega_id: int, 
    body: CalificarEntregaRequest, 
    db: AsyncSession = Depends(get_db), 
    current_user: dict = Depends(get_current_user)
):
    user_rol = (current_user.rol or "").strip().lower()
    if user_rol not in ["docente", "profesor", "administrador", "admin"]:
        raise HTTPException(status_code=403, detail="No autorizado para calificar entregas")
    
    entrega = await calificar_entrega(
        db=db, 
        entrega_id=entrega_id, 
        calificacion=body.calificacion, 
        comentarios=body.comentarios, 
        estado=body.estado or "Revisado",
        detalle_calificaciones=body.detalle_calificaciones
    )
    if not entrega:
        raise HTTPException(status_code=404, detail="Entrega no encontrada")
    return entrega

@router.delete("/{tarea_id}")
async def borrar_tarea(tarea_id: int, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user_rol = (current_user.rol or "").strip().lower()
    if user_rol not in ["docente", "profesor", "administrador", "admin"]:
        raise HTTPException(status_code=403, detail="No autorizado para eliminar tareas")
    
    exito = await eliminar_tarea(db=db, tarea_id=tarea_id)
    if not exito:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    return {"message": "Tarea eliminada correctamente", "id": tarea_id}

