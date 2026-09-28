import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
load_dotenv()  # Cargar variables de entorno desde .env

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from routers import auth, archivos, calculos, historial, grupos, notificaciones, tareas, qr as qr_router, admin_credenciales
from MAT251.Tema2 import routers_simbolicos as mat251_tema2_simbolicos
from MAT251.Tema5 import simulacion as mat251_simulacion
from config.database import async_engine, get_db
import models

# --- Lifespan: crea tablas al arrancar usando el motor asíncrono (asyncmy) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    async with async_engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE tareas ADD COLUMN archivo_nombre_fijo VARCHAR(255) NULL"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE credenciales_autorizadas ADD COLUMN fecha_carga DATETIME NULL"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("UPDATE credenciales_autorizadas SET fecha_carga = CURRENT_TIMESTAMP WHERE fecha_carga IS NULL"))
        except Exception:
            pass
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE usuarios ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT 0"))
        except Exception:
            pass
    yield

_is_production = os.getenv("ENVIRONMENT") == "production"
app = FastAPI(
    lifespan=lifespan,
    docs_url=None if _is_production else "/docs",
    redoc_url=None if _is_production else "/redoc",
    openapi_url=None if _is_production else "/openapi.json",
    root_path="/api",
)

#base de datos aiven
# Configuración de CORS
origins = [
    "http://localhost:5173",         # Desarrollo local (Vite)
    "http://127.0.0.1:5173",         # Desarrollo local alternativo
    "http://localhost:3000",         # Desarrollo local (React alternativo)
    "http://127.0.0.1:3000",         # Desarrollo local (React alternativo)
    "https://adminusfx.jboris.org",  # Enlace de hosting en producción
    "https://sice.jboris.org", #enlace de temporal
]                               

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Permite GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Permite todas las cabeceras
)

# Incluir los Routers modulares del proyecto
app.include_router(auth.router)
app.include_router(archivos.router)
app.include_router(calculos.router)
app.include_router(historial.router)
app.include_router(grupos.router)
app.include_router(notificaciones.router)
app.include_router(tareas.router)
app.include_router(mat251_tema2_simbolicos.router)
app.include_router(mat251_simulacion.router)
# 🆕 Router de QR para matriculación por código
# Las rutas internas del router ya están declaradas con el prefijo "/api/qr/...",
# por lo que se registra sin prefix para evitar duplicarlo.
app.include_router(qr_router.router)
app.include_router(admin_credenciales.router)

# Utilidades globales del núcleo
VISITAS_FILE = "visitas.txt"

@app.get("/")
async def root():
    return {"message": "API de Estadistica unificada y modularizada funcionando correctamente. Revisa /docs."}

@app.get("/favicon.ico")
async def favicon():
    return {}

@app.get("/visitas")
async def visitas():
    count = 1
    if os.path.exists(VISITAS_FILE):
        try:
            with open(VISITAS_FILE, "r") as f:
                content = f.read().strip()
                if content:
                    count = int(content) + 1
        except Exception:
            pass
    try:
        with open(VISITAS_FILE, "w") as f:
            f.write(str(count))
    except Exception:
        pass
    return {"visitas": count}

@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        from sqlalchemy import text
        await db.execute(text("SELECT 1"))
        return {"status": "OK"}
    except Exception as e:
        return {"status": "error", "message": "Database connection failed"} 