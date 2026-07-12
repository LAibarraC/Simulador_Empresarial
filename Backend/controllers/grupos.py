import random
import os
import shutil
from datetime import datetime
import string
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from models import Clase, Inscripcion, Usuario, Archivo, HistorialCalculo, Notificacion
from validators.grupos import NuevaClase, UnirseClase, ActualizarClase

def crear_clase_db(db: Session, datos: NuevaClase):
    docente = db.query(Usuario).filter(Usuario.email == datos.docente_email).first()
    if not docente:
        return JSONResponse(status_code=404, content={"error": "Docente no encontrado"})

    prefijo = datos.nombre.replace(" ", "")[:3].upper()
    prefijo = prefijo.ljust(3, 'X')
    
    codigo = f"{prefijo}-{random.randint(1000, 9999)}"

    nueva_clase = Clase(
        nombre=datos.nombre,
        docente_id=docente.id,
        codigo_acceso=codigo,
        fecha_limite_matriculacion=datos.fecha_limite_matriculacion
    )
    db.add(nueva_clase)
    db.commit()
    db.refresh(nueva_clase)
    return {"message": "Clase creada exitosamente", "codigo_acceso": codigo}

def actualizar_clase_db(db: Session, datos: ActualizarClase):
    clase = db.query(Clase).filter(Clase.id == datos.id).first()
    if not clase:
        return JSONResponse(status_code=404, content={"error": "Clase no encontrada"})
    
    clase.nombre = datos.nombre
    clase.fecha_limite_matriculacion = datos.fecha_limite_matriculacion
    
    if datos.resetear_codigo:
        caracteres_aleatorios = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
        codigo_nuevo = f"MAT-{clase.id}-{caracteres_aleatorios}"
        
        while db.query(Clase).filter(Clase.codigo_acceso == codigo_nuevo).first() is not None:
            caracteres_aleatorios = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
            codigo_nuevo = f"MAT-{clase.id}-{caracteres_aleatorios}"
            
        clase.codigo_acceso = codigo_nuevo
        
    db.commit()
    return {
        "message": "Clase actualizada exitosamente",
        "id": clase.id,
        "nombre": clase.nombre,
        "fecha_limite_matriculacion": clase.fecha_limite_matriculacion,
        "codigo_acceso": clase.codigo_acceso
    }

def unirse_clase_db(db: Session, datos: UnirseClase):
    estudiante = db.query(Usuario).filter(Usuario.email == datos.estudiante_email).first()
    if not estudiante:
        return JSONResponse(status_code=404, content={"error": "Estudiante no encontrado"})

    clase = db.query(Clase).filter(Clase.codigo_acceso == datos.codigo_acceso).first()
    if not clase:
        return JSONResponse(status_code=404, content={"error": "Código de clase inválido"})

    if clase.fecha_limite_matriculacion:
        try:
            limite = datetime.strptime(clase.fecha_limite_matriculacion, "%Y-%m-%d").date()
            if datetime.now().date() > limite:
                return JSONResponse(
                    status_code=400,
                    content={"error": f"El periodo de matriculación para este curso ha finalizado (Fecha límite: {clase.fecha_limite_matriculacion})."}
                )
        except ValueError:
            pass
        
    inscrito = db.query(Inscripcion).filter(
        Inscripcion.clase_id == clase.id,
        Inscripcion.estudiante_id == estudiante.id
    ).first()
    
    if inscrito:
        return JSONResponse(status_code=400, content={"error": "Ya estás inscrito en esta clase"})
        
    nueva_inscripcion = Inscripcion(clase_id=clase.id, estudiante_id=estudiante.id)
    db.add(nueva_inscripcion)
    
    nueva_notificacion = Notificacion(
        tipo="matriculacion",
        mensaje=f"El estudiante {estudiante.nombre} ({estudiante.email}) se ha inscrito a tu clase '{clase.nombre}'.",
        usuario_id=clase.docente_id,
        leido=False
    )
    db.add(nueva_notificacion)
    
    db.commit()
    return {"message": f"Te has unido a {clase.nombre} exitosamente"}

def obtener_clases_docente_db(db: Session, email: str):
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario: return []
    
    if usuario.rol == "Administrador":
        clases = db.query(Clase).all()
    else:
        clases = db.query(Clase).filter(Clase.docente_id == usuario.id).all()
        
    res_list = []
    for c in clases:
        docente_creador = db.query(Usuario).filter(Usuario.id == c.docente_id).first()
        docente_nombre = docente_creador.nombre if docente_creador else "Desconocido"
        docente_email = docente_creador.email if docente_creador else ""
        res_list.append({
            "id": c.id,
            "nombre": c.nombre,
            "codigo": c.codigo_acceso,
            "alumnos": 0,
            "archivos": 0,
            "fecha_limite_matriculacion": c.fecha_limite_matriculacion,
            "docente_nombre": docente_nombre,
            "docente_email": docente_email
        })
    return res_list

def obtener_clases_estudiante_db(db: Session, email: str):
    estudiante = db.query(Usuario).filter(Usuario.email == email).first()
    if not estudiante: return []
    inscripciones = db.query(Inscripcion).filter(Inscripcion.estudiante_id == estudiante.id).all()
    clases_inscritas = []
    for ins in inscripciones:
        clase = db.query(Clase).filter(Clase.id == ins.clase_id).first()
        if clase:
            clases_inscritas.append({
                "id": clase.id,
                "nombre": clase.nombre,
                "codigo": clase.codigo_acceso,
                "fecha_limite_matriculacion": clase.fecha_limite_matriculacion
            })
    return clases_inscritas

def eliminar_clase_db(db: Session, clase_id: int, user_email: str):
    usuario = db.query(Usuario).filter(Usuario.email == user_email).first()
    if not usuario:
        return JSONResponse(status_code=404, content={"error": "Usuario no encontrado"})
        
    clase = db.query(Clase).filter(Clase.id == clase_id).first()
    if not clase:
        return JSONResponse(status_code=404, content={"error": "Clase no encontrada"})
        
    if usuario.rol != "Administrador" and clase.docente_id != usuario.id:
        return JSONResponse(
            status_code=403, 
            content={"error": "No tienes permisos para eliminar este curso. Solo el docente creador o un administrador pueden hacerlo."}
        )
        
    db.query(Inscripcion).filter(Inscripcion.clase_id == clase.id).delete(synchronize_session=False)
    db.query(Archivo).filter(Archivo.clase_id == clase.id).delete(synchronize_session=False)
    db.query(HistorialCalculo).filter(HistorialCalculo.clase_id == clase.id).delete(synchronize_session=False)
    
    target_folder = os.path.join("excels", "_cursos", str(clase.id))
    if os.path.exists(target_folder):
        try:
            shutil.rmtree(target_folder)
        except Exception as e:
            print(f"Error al eliminar la carpeta física de la clase {clase.id}: {e}")
            
    db.delete(clase)
    db.commit()
    
    return {"message": "Curso eliminado exitosamente"}

def obtener_estudiantes_clase_db(db: Session, clase_id: int, user_email: str):
    usuario = db.query(Usuario).filter(Usuario.email == user_email).first()
    if not usuario:
        return JSONResponse(status_code=404, content={"error": "Usuario no encontrado"})
        
    clase = db.query(Clase).filter(Clase.id == clase_id).first()
    if not clase:
        return JSONResponse(status_code=404, content={"error": "Clase no encontrada"})
        
    if usuario.rol != "Administrador" and clase.docente_id != usuario.id:
        return JSONResponse(
            status_code=403, 
            content={"error": "No tienes permisos para ver los alumnos de esta clase"}
        )
        
    inscripciones = db.query(Inscripcion).filter(Inscripcion.clase_id == clase_id).all()
    estudiantes_list = []
    for ins in inscripciones:
        est = db.query(Usuario).filter(Usuario.id == ins.estudiante_id).first()
        if est:
            estudiantes_list.append({
                "id": est.id,
                "nombre": est.nombre,
                "email": est.email,
                "fecha_creacion": ins.fecha_creacion.strftime("%Y-%m-%d %H:%M:%S") if ins.fecha_creacion else "N/A"
            })
    return estudiantes_list

def desmatricular_estudiante_db(db: Session, clase_id: int, estudiante_id: int, user_email: str):
    usuario = db.query(Usuario).filter(Usuario.email == user_email).first()
    if not usuario:
        return JSONResponse(status_code=404, content={"error": "Usuario no encontrado"})
        
    clase = db.query(Clase).filter(Clase.id == clase_id).first()
    if not clase:
        return JSONResponse(status_code=404, content={"error": "Clase no encontrada"})
        
    if usuario.rol != "Administrador" and clase.docente_id != usuario.id:
        return JSONResponse(
            status_code=403, 
            content={"error": "No tienes permisos para modificar esta clase"}
        )
        
    inscripcion = db.query(Inscripcion).filter(
        Inscripcion.clase_id == clase_id,
        Inscripcion.estudiante_id == estudiante_id
    ).first()
    
    if not inscripcion:
        return JSONResponse(status_code=404, content={"error": "Inscripción no encontrada"})
        
    db.delete(inscripcion)
    db.commit()
    return {"message": "Estudiante desmatriculado exitosamente"}

def obtener_mis_clases_docente_db(db: Session, current_user: Usuario):
    if current_user.rol == "Administrador":
        clases = db.query(Clase).all()
    else:
        clases = db.query(Clase).filter(Clase.docente_id == current_user.id).all()
        
    res_list = []
    for c in clases:
        docente_creador = db.query(Usuario).filter(Usuario.id == c.docente_id).first()
        docente_nombre = docente_creador.nombre if docente_creador else "Desconocido"
        docente_email = docente_creador.email if docente_creador else ""
        res_list.append({
            "id": c.id,
            "nombre": c.nombre,
            "codigo": c.codigo_acceso,
            "alumnos": db.query(Inscripcion).filter(Inscripcion.clase_id == c.id).count(),
            "archivos": 0,
            "fecha_limite_matriculacion": c.fecha_limite_matriculacion,
            "docente_nombre": docente_nombre,
            "docente_email": docente_email
        })
    return res_list
