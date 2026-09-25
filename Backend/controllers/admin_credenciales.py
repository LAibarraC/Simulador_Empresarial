from datetime import datetime
import unicodedata
import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from fastapi import HTTPException, status
import models
import io
from utils.security import security
from controllers.auth import get_password_hash


def clean_id(val):
    """Normaliza identificadores numéricos provenientes de formularios o archivos."""
    if val is None:
        return ""
    value = str(val).strip()
    if not value:
        return ""
    try:
        return str(int(float(value))).strip()
    except (TypeError, ValueError):
        return value


async def obtener_credenciales_logic(db: AsyncSession):
    try:
        result = await db.execute(select(models.CredencialAutorizada))
        credenciales = result.scalars().all()

        # Descifrar datos antes de enviar al cliente
        lista_descifrada = []
        for c in credenciales:
            lista_descifrada.append({
                "id": c.id,
                "ci": security.decrypt(c.ci),
                "cu": security.decrypt(c.cu),
                "nombre": security.decrypt(c.nombre),
                "rol": c.rol,
                "registrado": c.registrado,
                "fecha_carga": c.fecha_carga.isoformat() if c.fecha_carga else None
            })
        return lista_descifrada
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener credenciales: {str(e)}")

async def crear_precuenta_docente_logic(nombre: str, email: str, password: str, db: AsyncSession):
    nombre = nombre.strip()
    email = email.strip().lower()
    if not nombre or not email or not password:
        raise HTTPException(status_code=400, detail="Nombre, correo y contraseña son obligatorios")

    existente = await db.execute(select(models.Usuario).filter(models.Usuario.email == email))
    if existente.scalars().first():
        raise HTTPException(status_code=409, detail="Ya existe un usuario con ese correo")

    usuario = models.Usuario(
        nombre=nombre,
        email=email,
        password=get_password_hash(password),
        rol="Docente",
        perfil="Docente",
        institucion="",
        must_change_password=True,
    )
    db.add(usuario)
    try:
        await db.commit()
        await db.refresh(usuario)
        return {"message": "Pre-cuenta docente creada correctamente", "id": usuario.id}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al crear la pre-cuenta: {str(e)}")


async def crear_credencial_logic(ci: str, cu: str | None, nombre: str, rol: str, db: AsyncSession):
    ci_plain = clean_id(ci)[:20]
    cu_plain = clean_id(cu)[:20] if cu else None
    nombre_plain = nombre.strip()

    if not ci_plain:
        raise HTTPException(status_code=400, detail="El CI es obligatorio")
    if not nombre_plain:
        raise HTTPException(status_code=400, detail="El nombre es obligatorio")

    try:
        ci_hash = security.generate_blind_index(ci_plain)
        existente = await db.execute(
            select(models.CredencialAutorizada).filter(
                models.CredencialAutorizada.ci_hash == ci_hash
            )
        )
        if existente.scalars().first():
            raise HTTPException(status_code=409, detail="Ya existe una credencial con ese CI")

        credencial = models.CredencialAutorizada(
            ci=security.encrypt(ci_plain),
            ci_hash=ci_hash,
            cu=security.encrypt(cu_plain) if cu_plain else None,
            cu_hash=security.generate_blind_index(cu_plain) if cu_plain else None,
            nombre=security.encrypt(nombre_plain),
            rol=rol,
            registrado=False,
            fecha_carga=datetime.now(),
        )
        db.add(credencial)
        # Obtiene el ID dentro del contexto async antes de que commit expire el objeto.
        await db.flush()
        credencial_id = credencial.id
        await db.commit()
        return {"message": "Credencial creada correctamente", "id": credencial_id}
    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al crear credencial: {str(e)}")


async def eliminar_credencial_logic(ci: str, db: AsyncSession):
    try:
        # Buscar usando el Blind Index (hash) del CI
        ci_hash = security.generate_blind_index(ci)
        result = await db.execute(select(models.CredencialAutorizada).filter(models.CredencialAutorizada.ci_hash == ci_hash))
        credencial = result.scalars().first()
        if not credencial:
            raise HTTPException(status_code=404, detail="Credencial no encontrada")

        await db.delete(credencial)
        await db.commit()
        return {"message": f"Credencial con CI {ci} eliminada correctamente"}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Error al eliminar credencial: {str(e)}")

async def cargar_credenciales_logic(file_content: bytes, filename: str, db: AsyncSession):
    try:
        # Leer todas las filas para detectar encabezados aunque no estén en la primera.
        if filename.lower().endswith('.csv'):
            try:
                content_str = file_content.decode('utf-8', errors='ignore')
                delimiter = ';' if content_str.count(';') > content_str.count(',') else ','
                df_raw = pd.read_csv(io.BytesIO(file_content), sep=delimiter, header=None, dtype=str)
            except Exception:
                df_raw = pd.read_csv(io.BytesIO(file_content), header=None, dtype=str)
        elif filename.lower().endswith('.xlsx'):
            df_raw = pd.read_excel(io.BytesIO(file_content), engine='openpyxl', header=None, dtype=str)
        elif filename.lower().endswith('.xls'):
            df_raw = pd.read_excel(io.BytesIO(file_content), engine='xlrd', header=None, dtype=str)
        else:
            raise HTTPException(status_code=400, detail="Formato de archivo no soportado. Use .csv, .xlsx o .xls")

        cols_required = {
            "ci": ["ci", "carnet", "cedula", "id", "identidad", "dni"],
            "cu": ["cu", "universitario", "carnet universitario"],
            "nombre_completo": ["nombre", "nombres", "apellido", "apellidos", "nombre completo", "persona"]
        }

        def normalize_header(value):
            value = "" if pd.isna(value) else str(value).strip().lower()
            return "".join(c for c in unicodedata.normalize("NFD", value) if unicodedata.category(c) != "Mn")

        def header_score(row):
            headers = [normalize_header(value) for value in row.tolist()]
            score = 0
            for options in cols_required.values():
                if any(any(option == header or option in header for option in options) for header in headers):
                    score += 1
            return score

        max_header_rows = min(10, len(df_raw))
        header_candidates = [(header_score(df_raw.iloc[index]), index) for index in range(max_header_rows)]
        header_score_value, header_index = max(header_candidates, key=lambda candidate: (candidate[0], -candidate[1])) if header_candidates else (0, 0)
        if header_score_value == 0:
            raise HTTPException(status_code=400, detail="No se encontraron encabezados CI, CU o Nombre en las primeras 10 filas")

        df = df_raw.iloc[header_index + 1:].copy()
        df.columns = [str(value).strip() if not pd.isna(value) else f"columna_{index}" for index, value in enumerate(df_raw.iloc[header_index].tolist())]
        df = df.reset_index(drop=True)

        # Helper para limpiar IDs (evita que 12345 se convierta en "12345.0")
        def clean_id(val):
            if pd.isna(val) or val is None: return ""
            try:
                return str(int(float(val))).strip()
            except:
                return str(val).strip()

        def find_column(options):
            columns = [(column, normalize_header(column)) for column in df.columns]
            normalized_options = [normalize_header(option) for option in options]
            for option in normalized_options:
                for column, normalized_column in columns:
                    if option == normalized_column or option in normalized_column:
                        return column
            return None

        mapping = {key: find_column(options) for key, options in cols_required.items()}

        if mapping["ci"] is None:
            cols_detected = ", ".join(list(df.columns))
            raise HTTPException(
                status_code=400,
                detail=f"No se encontró la columna de CI. Columnas detectadas: [{cols_detected}]"
            )

        registros_creados = 0
        registros_actualizados = 0
        col_rol = find_column(["Rol", "ROL", "rol"])

        for _, row in df.iterrows():
            ci_plain = clean_id(row[mapping["ci"]])[:20] if mapping["ci"] else None
            cu_plain = clean_id(row[mapping["cu"]])[:20] if mapping["cu"] and pd.notna(row[mapping["cu"]]) else None

            if not ci_plain: continue

            if mapping["nombre_completo"] and pd.notna(row[mapping["nombre_completo"]]):
                nombre_plain = str(row[mapping["nombre_completo"]]).strip()
            else:
                nombre_plain = "No proporcionado"

            if col_rol:
                rol = str(row[col_rol]).strip()[:50]
            else:
                rol = "Estudiante"

            if rol not in ["Docente", "Estudiante"]:
                rol_lower = rol.lower()
                if "doc" in rol_lower: rol = "Docente"
                elif "est" in rol_lower: rol = "Estudiante"
                else: rol = "Estudiante"

            # Cifrado y Generación de Blind Indexes
            ci_encrypted = security.encrypt(ci_plain)
            ci_hash = security.generate_blind_index(ci_plain)

            cu_encrypted = security.encrypt(cu_plain) if cu_plain else None
            cu_hash = security.generate_blind_index(cu_plain) if cu_plain else None

            nombre_encrypted = security.encrypt(nombre_plain)

            # Buscar registro usando el hash del CI
            result = await db.execute(select(models.CredencialAutorizada).filter(models.CredencialAutorizada.ci_hash == ci_hash))
            credencial = result.scalars().first()

            if credencial:
                credencial.cu = cu_encrypted
                credencial.cu_hash = cu_hash
                credencial.nombre = nombre_encrypted
                credencial.rol = rol
                credencial.fecha_carga = datetime.now()
                registros_actualizados += 1
            else:
                nueva_cred = models.CredencialAutorizada(
                    ci=ci_encrypted,
                    ci_hash=ci_hash,
                    cu=cu_encrypted,
                    cu_hash=cu_hash,
                    nombre=nombre_encrypted,
                    rol=rol,
                    registrado=False,
                    fecha_carga=datetime.now()
                )
                db.add(nueva_cred)
                registros_creados += 1

        await db.commit()
        return {"message": f"Carga completada. {registros_creados} creados, {registros_actualizados} actualizados."}

    except Exception as e:
        import traceback
        print(f"ERROR CRÍTICO en cargar_credenciales: {traceback.format_exc()}")
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Error procesando el archivo: {str(e)}")
