import json
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse
import models
from validators.historial import RegistroHistorial

def guardar_historial_db(db: Session, registro: RegistroHistorial, current_user: models.Usuario):
    try:
        snapshot_str = json.dumps(registro.snapshot) if registro.snapshot else "{}"
        
        nuevo_registro = models.HistorialCalculo(
            tipo_analisis=registro.calculo,
            nombre_trabajo=registro.archivo_origen,
            parametros_json="{}",
            resultados_json=snapshot_str,
            usuario_id=current_user.id
        )
        
        db.add(nuevo_registro)
        db.commit()
        db.refresh(nuevo_registro)
        
        return {
            "message": "Historial guardado con éxito",
            "registro": {
                "id": nuevo_registro.id,
                "fecha": nuevo_registro.fecha_creacion.strftime("%d/%m/%Y"),
                "hora": nuevo_registro.fecha_creacion.strftime("%H:%M:%S"),
                "calculo": nuevo_registro.tipo_analisis,
                "archivo_origen": nuevo_registro.nombre_trabajo,
                "snapshot": registro.snapshot
            }
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

def obtener_historial_db(db: Session, current_user: models.Usuario):
    try:
        registros = db.query(models.HistorialCalculo).filter(
            models.HistorialCalculo.usuario_id == current_user.id
        ).order_by(models.HistorialCalculo.fecha_creacion.desc()).all()
        
        historial = []
        for reg in registros:
            try:
                snapshot_data = json.loads(reg.resultados_json) if reg.resultados_json else {}
            except Exception:
                snapshot_data = {}
                
            historial.append({
                "id": reg.id,
                "fecha": reg.fecha_creacion.strftime("%d/%m/%Y") if reg.fecha_creacion else "",
                "hora": reg.fecha_creacion.strftime("%H:%M:%S") if reg.fecha_creacion else "",
                "calculo": reg.tipo_analisis,
                "archivo_origen": reg.nombre_trabajo,
                "snapshot": snapshot_data
            })
            
        return {"historial": historial}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

def eliminar_historial_db(db: Session, registro_id: int, current_user: models.Usuario):
    try:
        registro = db.query(models.HistorialCalculo).filter(
            models.HistorialCalculo.id == registro_id,
            models.HistorialCalculo.usuario_id == current_user.id
        ).first()
        
        if not registro:
            return JSONResponse(status_code=404, content={"error": "Historial no encontrado o no pertenece al usuario actual"})
            
        db.delete(registro)
        db.commit()
        
        return {"message": "Registro eliminado con éxito"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
