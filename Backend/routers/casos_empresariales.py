import io
import os
import re
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from config.database import get_db
from models.caso_empresarial import CasoEmpresarial
from middlewares.auth import get_current_user
from pydantic import BaseModel
from typing import Optional, Any
import pypdf
import docx

UPLOAD_CASOS_DIR = os.path.join("uploads", "casos_documentos")
os.makedirs(UPLOAD_CASOS_DIR, exist_ok=True)

router = APIRouter(prefix="/casos_empresariales", tags=["Casos Empresariales"])

class DetallesCaso(BaseModel):
    sector: str
    desafioPrincipal: str

class CasoEmpresarialCreate(BaseModel):
    titulo: str
    categoria: str
    tag: Optional[str] = ""
    dificultad: str
    estrellas: int
    capital: str
    descripcion: str
    foco: Optional[str] = ""
    detalles: dict

def puede_gestionar_caso(usuario, caso) -> bool:
    """Cada usuario (docente, estudiante o administrador) solo ve y gestiona los casos que él mismo creó."""
    return caso.creado_por is not None and caso.creado_por == usuario.id

@router.post("/", status_code=status.HTTP_201_CREATED)
async def crear_caso_empresarial(
    caso: CasoEmpresarialCreate,
    usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Cualquier usuario autenticado (docente, estudiante, administrador) puede crear casos
    nuevo_caso = CasoEmpresarial(
        titulo=caso.titulo,
        categoria=caso.categoria,
        tag=caso.tag,
        dificultad=caso.dificultad,
        estrellas=caso.estrellas,
        capital=caso.capital,
        descripcion=caso.descripcion,
        foco=caso.foco,
        detalles=caso.detalles,
        creado_por=usuario.id
    )
    
    db.add(nuevo_caso)
    await db.commit()
    await db.refresh(nuevo_caso)
    
    return {"message": "Caso de estudio creado exitosamente", "caso": nuevo_caso.id}

@router.get("/")
async def obtener_casos_empresariales(
    usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Cada usuario solo recibe sus propios casos
    result = await db.execute(select(CasoEmpresarial).filter(CasoEmpresarial.creado_por == usuario.id))
    casos = result.scalars().all()
    return casos

@router.delete("/{id}")
async def eliminar_caso_empresarial(
    id: int,
    usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(CasoEmpresarial).filter(CasoEmpresarial.id == id))
    caso = result.scalars().first()
    if not caso:
        raise HTTPException(status_code=404, detail="Caso no encontrado")
    if not puede_gestionar_caso(usuario, caso):
        raise HTTPException(status_code=403, detail="Solo puedes eliminar los casos que tú creaste")

    await db.delete(caso)
    await db.commit()
    return {"message": "Caso eliminado exitosamente"}

@router.put("/{id}", status_code=status.HTTP_200_OK)
async def editar_caso_empresarial(
    id: int,
    caso_data: CasoEmpresarialCreate,
    usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(CasoEmpresarial).filter(CasoEmpresarial.id == id))
    caso = result.scalars().first()
    
    if not caso:
        raise HTTPException(status_code=404, detail="Caso no encontrado")
    if not puede_gestionar_caso(usuario, caso):
        raise HTTPException(status_code=403, detail="Solo puedes editar los casos que tú creaste")

    caso.titulo = caso_data.titulo
    caso.categoria = caso_data.categoria
    caso.tag = caso_data.tag
    caso.dificultad = caso_data.dificultad
    caso.estrellas = caso_data.estrellas
    caso.capital = caso_data.capital
    caso.descripcion = caso_data.descripcion
    caso.foco = caso_data.foco
    caso.detalles = caso_data.detalles

    caso_id = caso.id
    await db.commit()
    return {"message": "Caso de estudio actualizado exitosamente", "caso": caso_id}

def limpiar_y_reconstruir_texto(texto: str) -> str:
    if not texto:
        return ""
    # Normalizar saltos de línea y eliminar caracteres de control
    texto = texto.replace("\r\n", "\n").replace("\r", "\n")
    texto = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', texto)
    
    # Eliminar encabezados y pies de página típicos de PDF como "Página 1 de 5" o "Page 1 of 4"
    texto = re.sub(r'(?i)\b(?:p[aá]gina|page)\s+\d+(?:\s*(?:de|of|\/)\s*\d+)?\b', '', texto)
    
    # Corregir palabras divididas por guión al final de una línea física (ej: "innova- \nción" -> "innovación")
    texto = re.sub(r'(\b[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)-\s*\n\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ]+\b)', r'\1\2', texto)
    
    # Dividir en bloques por dobles saltos existentes
    bloques = re.split(r'\n\s*\n', texto)
    parrafos_limpios = []
    
    for bloque in bloques:
        lineas = [l.strip() for l in bloque.split('\n') if l.strip()]
        if not lineas:
            continue
        
        parrafo_acumulado = []
        for linea in lineas:
            # Si es viñeta o ítem numerado (•, -, *, 1., a)), iniciar nuevo párrafo
            es_item_lista = bool(re.match(r'^(?:[•\-*–—]|\d+[\.\)]|[a-zA-Z][\.\)])\s+', linea))
            
            if es_item_lista and parrafo_acumulado:
                p_txt = " ".join(parrafo_acumulado)
                p_txt = re.sub(r'[ \t]+', ' ', p_txt).strip()
                if p_txt:
                    parrafos_limpios.append(p_txt)
                parrafo_acumulado = [linea]
            else:
                parrafo_acumulado.append(linea)
                
        if parrafo_acumulado:
            p_txt = " ".join(parrafo_acumulado)
            p_txt = re.sub(r'[ \t]+', ' ', p_txt).strip()
            if p_txt:
                parrafos_limpios.append(p_txt)
                
    return "\n\n".join(parrafos_limpios)

@router.post("/extraer-documento")
async def extraer_documento_caso(
    file: UploadFile = File(...),
    usuario = Depends(get_current_user)
):
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()

    if ext not in [".pdf", ".docx", ".txt", ".md"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Formato '{ext}' no compatible. Por favor sube un documento PDF (.pdf), Word (.docx) o Texto (.txt, .md)."
        )

    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="El archivo seleccionado está vacío.")

        texto = ""
        paginas = None

        if ext == ".pdf":
            try:
                reader = pypdf.PdfReader(io.BytesIO(contents))
                paginas = len(reader.pages)
                texto_paginas = []
                for page in reader.pages:
                    t = page.extract_text()
                    if t and t.strip():
                        texto_paginas.append(t.strip())
                texto = "\n\n".join(texto_paginas)
            except Exception as e:
                raise HTTPException(
                    status_code=400, 
                    detail=f"No se pudo extraer texto del PDF. Asegúrate de que no esté corrupto ni protegido con contraseña. Detalle: {str(e)}"
                )

        elif ext == ".docx":
            try:
                doc = docx.Document(io.BytesIO(contents))
                parrafos = []
                for p in doc.paragraphs:
                    if p.text and p.text.strip():
                        parrafos.append(p.text.strip())
                
                # También extraer celdas de tablas si el informe contiene cuadros o datos
                for table in doc.tables:
                    for row in table.rows:
                        celdas = [cell.text.strip() for cell in row.cells if cell.text and cell.text.strip()]
                        if celdas:
                            celdas_limpias = []
                            for c in celdas:
                                if not celdas_limpias or celdas_limpias[-1] != c:
                                    celdas_limpias.append(c)
                            parrafos.append(" | ".join(celdas_limpias))
                
                texto = "\n\n".join(parrafos)
            except Exception as e:
                raise HTTPException(
                    status_code=400, 
                    detail=f"No se pudo leer el archivo Word (.docx). Detalle: {str(e)}"
                )

        elif ext in [".txt", ".md"]:
            try:
                texto = contents.decode("utf-8")
            except UnicodeDecodeError:
                texto = contents.decode("latin-1", errors="replace")

        # Limpiar y reconstruir el texto en párrafos fluidos y limpios
        texto = limpiar_y_reconstruir_texto(texto)

        if not texto:
            raise HTTPException(
                status_code=400, 
                detail="No se encontró texto extraíble en el documento. Puede tratarse de un PDF escaneado (solo imágenes) sin capa de texto OCR."
            )

        palabras = len(texto.split())
        lineas = len([l for l in texto.split("\n\n") if l.strip()])

        return {
            "success": True,
            "texto": texto,
            "nombre_archivo": filename,
            "formato": ext,
            "tamano_bytes": len(contents),
            "num_caracteres": len(texto),
            "num_palabras": palabras,
            "num_lineas": lineas,
            "num_paginas": paginas
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error inesperado al procesar el archivo: {str(e)}"
        )

@router.post("/subir-documento")
async def subir_documento_caso(
    file: UploadFile = File(...),
    usuario = Depends(get_current_user)
):
    """
    Sube directamente un archivo de caso (PDF, DOCX, TXT) sin extraer ni limpiar texto.
    Guarda el archivo en el servidor y retorna metadatos y URL de visualización.
    """
    filename = file.filename or "documento_caso"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in [".pdf", ".docx", ".doc", ".txt", ".md"]:
        raise HTTPException(
            status_code=400,
            detail=f"Formato '{ext}' no compatible. Por favor sube un documento PDF (.pdf), Word (.docx) o Texto (.txt)."
        )

    try:
        contents = await file.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="El archivo seleccionado está vacío.")

        unique_id = uuid.uuid4().hex[:10]
        nombre_limpio = re.sub(r'[^a-zA-Z0-9_\.-]', '_', filename)
        archivo_guardado = f"{unique_id}_{nombre_limpio}"
        file_path = os.path.join(UPLOAD_CASOS_DIR, archivo_guardado)

        with open(file_path, "wb") as f:
            f.write(contents)

        file_size = len(contents)
        url_documento = f"/casos_empresariales/documento/{archivo_guardado}"

        return {
            "success": True,
            "nombre_archivo": filename,
            "archivo_guardado": archivo_guardado,
            "url": url_documento,
            "extension": ext,
            "tamano_bytes": file_size
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al subir documento: {str(e)}")

@router.get("/documento/{nombre_archivo}")
async def descargar_o_ver_documento_caso(nombre_archivo: str):
    """
    Permite abrir en línea (ej. PDFs en el navegador) o descargar los documentos de casos subidos.
    """
    file_path = os.path.join(UPLOAD_CASOS_DIR, nombre_archivo)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="El documento no existe o fue eliminado.")

    ext = os.path.splitext(nombre_archivo)[1].lower()
    mime = "application/octet-stream"
    if ext == ".pdf":
        mime = "application/pdf"
    elif ext == ".docx":
        mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    elif ext in [".txt", ".md"]:
        mime = "text/plain; charset=utf-8"

    original_name = nombre_archivo.split("_", 1)[-1] if "_" in nombre_archivo else nombre_archivo
    return FileResponse(
        path=file_path,
        media_type=mime,
        filename=original_name,
        content_disposition_type="inline" if ext == ".pdf" else "attachment"
    )


