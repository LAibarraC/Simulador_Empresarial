from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from pydantic import BaseModel
from typing import Optional, List

from database import get_db
import models
from routers.auth import get_current_user

router = APIRouter()

class NotificacionCrear(BaseModel):
    tipo: str  # "personal" o "sistema"
    mensaje: str
    usuario_id: Optional[int] = None

@router.post("/notificaciones", status_code=status.HTTP_201_CREATED)
async def crear_notificacion(datos: NotificacionCrear, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    # Opcionalmente podemos limitar la creación de notificaciones de sistema a los administradores
    if datos.tipo == "sistema" and current_user.rol != "Administrador":
        raise HTTPException(status_code=403, detail="Solo los administradores pueden crear notificaciones globales de sistema")
    
    # Si es personal, verificamos que el usuario exista
    if datos.tipo != "sistema" and datos.usuario_id:
        usuario = db.query(models.Usuario).filter(models.Usuario.id == datos.usuario_id).first()
        if not usuario:
            raise HTTPException(status_code=404, detail="El usuario destino no existe")
            
    nueva_notificacion = models.Notificacion(
        tipo=datos.tipo,
        mensaje=datos.mensaje,
        usuario_id=datos.usuario_id if datos.tipo != "sistema" else None,
        leido=False
    )
    db.add(nueva_notificacion)
    db.commit()
    db.refresh(nueva_notificacion)
    return {
        "id": nueva_notificacion.id,
        "tipo": nueva_notificacion.tipo,
        "mensaje": nueva_notificacion.mensaje,
        "leido": nueva_notificacion.leido,
        "fecha_creacion": nueva_notificacion.fecha_creacion.strftime("%Y-%m-%d %H:%M:%S") if nueva_notificacion.fecha_creacion else ""
    }

@router.get("/notificaciones")
async def obtener_notificaciones(db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    try:
        # Retorna notificaciones globales de "sistema" y las personales/dirigidas del usuario
        notificaciones = db.query(models.Notificacion).filter(
            or_(
                models.Notificacion.usuario_id == current_user.id,
                models.Notificacion.tipo == "sistema"
            )
        ).order_by(models.Notificacion.fecha_creacion.desc()).all()
        
        res = []
        for n in notificaciones:
            ultimo_id = current_user.ultimo_aviso_global_id or 0
            leido_status = n.leido if n.tipo != "sistema" else (n.id <= ultimo_id)
            res.append({
                "id": n.id,
                "tipo": n.tipo,
                "mensaje": n.mensaje,
                "leido": leido_status,
                "fecha_creacion": n.fecha_creacion.strftime("%d/%m/%Y %H:%M:%S") if n.fecha_creacion else ""
            })
        return res
    except Exception as e:
        print("Error en obtener_notificaciones:", str(e))
        return []

@router.put("/notificaciones/{notificacion_id}/leer")
async def marcar_como_leida(notificacion_id: int, db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    notif = db.query(models.Notificacion).filter(models.Notificacion.id == notificacion_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
        
    # Verificamos que sea del usuario o global
    if notif.tipo != "sistema" and notif.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para leer esta notificación")
        
    if notif.tipo == "sistema":
        ultimo_id = current_user.ultimo_aviso_global_id or 0
        current_user.ultimo_aviso_global_id = max(ultimo_id, notif.id)
    else:
        notif.leido = True
        
    db.commit()
    return {"message": "Notificación marcada como leída"}

@router.put("/notificaciones/leer_todas")
async def marcar_todas_como_leidas(db: Session = Depends(get_db), current_user: models.Usuario = Depends(get_current_user)):
    try:
        # 1. Marcar personales
        db.query(models.Notificacion).filter(
            models.Notificacion.usuario_id == current_user.id,
            models.Notificacion.tipo != "sistema",
            models.Notificacion.leido == False
        ).update({models.Notificacion.leido: True}, synchronize_session=False)
        
        # 2. Encontrar máximo de sistema y actualizar
        max_global_id = db.query(func.max(models.Notificacion.id)).filter(
            models.Notificacion.tipo == "sistema"
        ).scalar()
        
        if max_global_id:
            ultimo_id = current_user.ultimo_aviso_global_id or 0
            current_user.ultimo_aviso_global_id = max(ultimo_id, max_global_id)
            
        db.commit()
        return {"message": "Todas las notificaciones fueron marcadas como leídas"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
