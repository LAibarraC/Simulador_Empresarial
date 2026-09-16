from typing import Literal, Optional
from fastapi import APIRouter, Depends, UploadFile, File
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from config.database import get_db
from controllers.admin_credenciales import cargar_credenciales_logic, obtener_credenciales_logic, crear_credencial_logic, eliminar_credencial_logic
from middlewares.auth import require_role


class CredencialCrear(BaseModel):
    ci: str = Field(..., min_length=1, max_length=50)
    cu: Optional[str] = Field(default=None, max_length=50)
    nombre: str = Field(..., min_length=1, max_length=255)
    rol: Literal["Estudiante", "Docente", "Docente Sustituto"]

router = APIRouter()

@router.get("/credenciales", dependencies=[Depends(require_role("Administrador"))])
async def obtener_credenciales(db: AsyncSession = Depends(get_db)):
    return await obtener_credenciales_logic(db)

@router.post("/credenciales", dependencies=[Depends(require_role("Administrador"))])
async def crear_credencial(datos: CredencialCrear, db: AsyncSession = Depends(get_db)):
    return await crear_credencial_logic(datos.ci, datos.cu, datos.nombre, datos.rol, db)


@router.delete("/credenciales/{ci}", dependencies=[Depends(require_role("Administrador"))])
async def eliminar_credencial(ci: str, db: AsyncSession = Depends(get_db)):
    return await eliminar_credencial_logic(ci, db)

@router.post("/cargar_credenciales", dependencies=[Depends(require_role("Administrador"))])
async def cargar_credenciales(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    content = await file.read()
    return await cargar_credenciales_logic(content, file.filename, db)
