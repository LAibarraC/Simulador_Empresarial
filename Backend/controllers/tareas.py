from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from models.tarea import Tarea, EntregaTarea
from models import Clase, Inscripcion, Notificacion, Usuario
from validators.tareas import TareaCreate, EntregaTareaCreate
from datetime import datetime

async def crear_tarea(db: AsyncSession, tarea: TareaCreate, docente_id: int):
    db_tarea = Tarea(
        titulo=tarea.titulo,
        descripcion=tarea.descripcion,
        clase_id=tarea.clase_id,
        docente_id=docente_id,
        archivo_id=tarea.archivo_id,
        ejercicios_seleccionados=tarea.ejercicios_seleccionados,
        fecha_limite=tarea.fecha_limite
    )
    db.add(db_tarea)
    await db.flush()  # Asigna db_tarea.id sin expirar la sesión aún
    tarea_id = db_tarea.id

    # Notificar a todos los estudiantes matriculados en el curso
    try:
        res_clase = await db.execute(select(Clase).filter(Clase.id == tarea.clase_id))
        clase_obj = res_clase.scalars().first()
        nombre_clase = clase_obj.nombre if clase_obj else "tu curso"

        res_insc = await db.execute(select(Inscripcion).filter(Inscripcion.clase_id == tarea.clase_id))
        inscripciones = res_insc.scalars().all()

        fecha_limite_txt = ""
        if tarea.fecha_limite:
            try:
                fecha_limite_txt = f" (Plazo límite: {tarea.fecha_limite.strftime('%d/%m/%Y %H:%M')})"
            except Exception:
                pass

        for insc in inscripciones:
            notif = Notificacion(
                tipo="tarea",
                mensaje=f"Tu docente ha asignado una nueva tarea en '{nombre_clase}': {tarea.titulo}{fecha_limite_txt}.",
                usuario_id=insc.estudiante_id,
                leido=False
            )
            db.add(notif)
    except Exception as e:
        print(f"Error generando notificaciones de tarea para estudiantes: {e}")

    await db.commit()

    result = await db.execute(
        select(Tarea)
        .options(joinedload(Tarea.archivo))
        .filter(Tarea.id == tarea_id)
    )
    return result.scalars().first()

async def obtener_tareas_por_clase(db: AsyncSession, clase_id: int):
    result = await db.execute(select(Tarea).options(joinedload(Tarea.archivo)).filter(Tarea.clase_id == clase_id))
    return result.scalars().all()

async def obtener_tarea_por_id(db: AsyncSession, tarea_id: int):
    result = await db.execute(select(Tarea).options(joinedload(Tarea.archivo)).filter(Tarea.id == tarea_id))
    return result.scalars().first()

async def crear_entrega(db: AsyncSession, entrega: EntregaTareaCreate, estudiante_id: int):
    db_entrega = EntregaTarea(
        tarea_id=entrega.tarea_id,
        estudiante_id=estudiante_id,
        archivo_entrega_id=entrega.archivo_entrega_id,
        datos_respuesta=entrega.datos_respuesta,
        estado="Entregado",
        fecha_entrega=datetime.now()
    )
    db.add(db_entrega)
    await db.flush()
    entrega_id = db_entrega.id

    # Notificar al docente que el estudiante entregó la tarea
    try:
        res_t = await db.execute(select(Tarea).filter(Tarea.id == entrega.tarea_id))
        tarea_obj = res_t.scalars().first()
        if tarea_obj and tarea_obj.docente_id:
            res_est = await db.execute(select(Usuario).filter(Usuario.id == estudiante_id))
            est_obj = res_est.scalars().first()
            nombre_est = est_obj.nombre if est_obj else "Un estudiante"
            notif_doc = Notificacion(
                tipo="tarea",
                mensaje=f"El estudiante {nombre_est} ha entregado la tarea '{tarea_obj.titulo}'.",
                usuario_id=tarea_obj.docente_id,
                leido=False
            )
            db.add(notif_doc)
    except Exception as e:
        print(f"Error generando notificación de entrega para docente: {e}")

    await db.commit()

    result = await db.execute(
        select(EntregaTarea)
        .options(joinedload(EntregaTarea.estudiante))
        .filter(EntregaTarea.id == entrega_id)
    )
    return result.scalars().first()

async def obtener_entregas_por_estudiante(db: AsyncSession, estudiante_id: int, clase_id: int = None):
    query = select(EntregaTarea).options(joinedload(EntregaTarea.estudiante)).filter(EntregaTarea.estudiante_id == estudiante_id)
    if clase_id:
        query = query.join(Tarea).filter(Tarea.clase_id == clase_id)
    result = await db.execute(query)
    return result.scalars().all()

async def obtener_entregas_por_tarea(db: AsyncSession, tarea_id: int):
    result = await db.execute(
        select(EntregaTarea)
        .options(joinedload(EntregaTarea.estudiante))
        .filter(EntregaTarea.tarea_id == tarea_id)
        .order_by(EntregaTarea.fecha_entrega.desc())
    )
    return result.scalars().all()

async def obtener_entrega_estudiante_tarea(db: AsyncSession, estudiante_id: int, tarea_id: int):
    result = await db.execute(
        select(EntregaTarea)
        .options(joinedload(EntregaTarea.estudiante))
        .filter(EntregaTarea.estudiante_id == estudiante_id, EntregaTarea.tarea_id == tarea_id)
    )
    return result.scalars().first()

async def calificar_entrega(db: AsyncSession, entrega_id: int, calificacion: int = None, comentarios: str = None, estado: str = "Revisado", detalle_calificaciones: str = None):
    result = await db.execute(
        select(EntregaTarea)
        .options(joinedload(EntregaTarea.estudiante))
        .filter(EntregaTarea.id == entrega_id)
    )
    entrega = result.scalars().first()
    if not entrega:
        return None
    if calificacion is not None:
        entrega.calificacion = calificacion
    if comentarios is not None:
        entrega.comentarios = comentarios
    if detalle_calificaciones is not None:
        entrega.detalle_calificaciones = detalle_calificaciones
    if estado:
        entrega.estado = estado

    # Notificar al estudiante que su tarea ha sido calificada
    try:
        res_t = await db.execute(select(Tarea).filter(Tarea.id == entrega.tarea_id))
        tarea_obj = res_t.scalars().first()
        titulo_t = tarea_obj.titulo if tarea_obj else "tu tarea"
        nota_txt = f" con nota {calificacion}/100" if calificacion is not None else ""
        notif_est = Notificacion(
            tipo="tarea",
            mensaje=f"Tu entrega para la tarea '{titulo_t}' ha sido calificada{nota_txt}.",
            usuario_id=entrega.estudiante_id,
            leido=False
        )
        db.add(notif_est)
    except Exception as e:
        print(f"Error generando notificación de calificación: {e}")

    await db.commit()

    result = await db.execute(
        select(EntregaTarea)
        .options(joinedload(EntregaTarea.estudiante))
        .filter(EntregaTarea.id == entrega_id)
    )
    return result.scalars().first()

async def eliminar_tarea(db: AsyncSession, tarea_id: int):
    result = await db.execute(select(Tarea).filter(Tarea.id == tarea_id))
    tarea = result.scalars().first()
    if not tarea:
        return False
    
    # Eliminar todas las entregas asociadas a esta tarea
    result_entregas = await db.execute(select(EntregaTarea).filter(EntregaTarea.tarea_id == tarea_id))
    entregas = result_entregas.scalars().all()
    for e in entregas:
        await db.delete(e)
        
    await db.delete(tarea)
    await db.commit()
    return True

