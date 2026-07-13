from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, func, update
from fastapi import HTTPException
import models
from validators.notificaciones import NotificacionCrear

async def crear_notificacion_db(db: AsyncSession, datos: NotificacionCrear, current_user: models.Usuario):
    # Lógica de permisos
    if datos.tipo == "sistema" and current_user.rol != "Administrador":
        raise HTTPException(status_code=403, detail="Solo los administradores pueden crear notificaciones globales de sistema")
    
    # Validar usuario si es personal
    if datos.tipo != "sistema" and datos.usuario_id:
        result = await db.execute(select(models.Usuario).filter(models.Usuario.id == datos.usuario_id))
        usuario = result.scalars().first()
        if not usuario:
            raise HTTPException(status_code=404, detail="El usuario destino no existe")
            
    nueva_notificacion = models.Notificacion(
        tipo=datos.tipo,
        mensaje=datos.mensaje,
        usuario_id=datos.usuario_id if datos.tipo != "sistema" else None,
        leido=False
    )
    db.add(nueva_notificacion)
    await db.commit()
    await db.refresh(nueva_notificacion)
    
    return {
        "id": nueva_notificacion.id,
        "tipo": nueva_notificacion.tipo,
        "mensaje": nueva_notificacion.mensaje,
        "leido": nueva_notificacion.leido,
        "fecha_creacion": nueva_notificacion.fecha_creacion.strftime("%Y-%m-%d %H:%M:%S") if nueva_notificacion.fecha_creacion else ""
    }


async def obtener_notificaciones_db(db: AsyncSession, current_user: models.Usuario):
    result = await db.execute(
        select(models.Notificacion).filter(
            or_(
                models.Notificacion.usuario_id == current_user.id,
                models.Notificacion.tipo == "sistema"
            )
        ).order_by(models.Notificacion.fecha_creacion.desc())
    )
    notificaciones = result.scalars().all()
    
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


async def marcar_como_leida_db(db: AsyncSession, notificacion_id: int, current_user: models.Usuario):
    result = await db.execute(select(models.Notificacion).filter(models.Notificacion.id == notificacion_id))
    notif = result.scalars().first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
        
    if notif.tipo != "sistema" and notif.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para leer esta notificación")
        
    if notif.tipo == "sistema":
        ultimo_id = current_user.ultimo_aviso_global_id or 0
        current_user.ultimo_aviso_global_id = max(ultimo_id, notif.id)
    else:
        notif.leido = True
        
    await db.commit()
    return {"message": "Notificación marcada como leída"}

async def marcar_todas_como_leidas_db(db: AsyncSession, current_user: models.Usuario):
    # Marcar personales
    await db.execute(
        update(models.Notificacion).where(
            models.Notificacion.usuario_id == current_user.id,
            models.Notificacion.tipo != "sistema",
            models.Notificacion.leido == False
        ).values(leido=True)
    )
    
    # Marcar globales
    result = await db.execute(select(func.max(models.Notificacion.id)).filter(models.Notificacion.tipo == "sistema"))
    max_global_id = result.scalar()
    
    if max_global_id:
        ultimo_id = current_user.ultimo_aviso_global_id or 0
        current_user.ultimo_aviso_global_id = max(ultimo_id, max_global_id)
        
    await db.commit()
    return {"message": "Todas las notificaciones fueron marcadas como leídas"}
