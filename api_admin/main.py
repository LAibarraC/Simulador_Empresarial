import os
from dotenv import load_dotenv
load_dotenv() # Cargar variables de entorno desde .env

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, archivos, calculos, historial, grupos
from database import engine
import models


app = FastAPI()

# Configuración de CORS
origins = [
    "http://localhost:5173",         # Desarrollo local (Vite)
    "http://127.0.0.1:5173",         # Desarrollo local alternativo
    "https://calculadora-estadistica-3inh.onrender.com",  # Producción en Render
    "https://administracion-calculadora.vercel.app",  # Enlace oficial Vercel
    "https://proyecto-shc-170-54eovb4bb-coadiegos-projects.vercel.app", # Enlace temporal Vercel
    "https://proyecto-shc-170.vercel.app", # Enlace limpio Vercel
    "https://administracion-empresas-usfx.vercel.app",
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

# Utilidades globales del núcleo
VISITAS_FILE = "visitas.txt"

@app.get("/")
async def root():
    return {"message": "API de Estadística unificada y modularizada funcionando correctamente. Revisa /docs."}

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