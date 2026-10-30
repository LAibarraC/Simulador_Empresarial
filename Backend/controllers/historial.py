import json
import math
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi.responses import JSONResponse
import models
from validators.historial import RegistroHistorial

def obtener_datos_matriz_historial(snapshot):
    datos = snapshot.get("datos")
    if isinstance(datos, dict) and isinstance(datos.get("valores"), list):
        return datos["valores"], datos.get("variable") or {}
    return snapshot.get("filas") or [], snapshot.get("varSeleccionada") or {}


def obtener_nombre_calculo_historial(snapshot, calculo, modulo):
    snapshot = snapshot if isinstance(snapshot, dict) else {}
    if str(modulo or snapshot.get("modulo") or "").strip().upper() == "MAT251":
        operacion = str(calculo or snapshot.get("operacion") or "").strip().lower()
        if operacion == "probabilidad":
            legado = (snapshot.get("tema1") or {}).get("probabilidad") or {}
            subtipo = snapshot.get("subTipo") or snapshot.get("subTipoProbabilidad") or legado.get("subTipo")
            return {
                "clasica": "Probabilidad Clásica",
                "frecuentista": "Probabilidad Frecuentista",
                "condicional": "Probabilidad Condicional",
            }.get(str(subtipo or "").strip().lower(), "Probabilidad (tipo no registrado)")
        if operacion in ("probabilidad_total", "simulador_total"):
            return "Teorema de Probabilidad Total"
        if operacion == "regla_adicion":
            return "Axiomas y Regla de la Adición"
        if operacion == "regla_multiplicacion":
            return "Regla de la Multiplicación"
        if operacion == "conteo":
            return "Técnicas de Conteo"
        if operacion == "dist_discreta":
            return "Variables Aleatorias Discretas"
        if operacion == "dist_continua":
            return "Calculadora de Funciones Continuas"
        if operacion in ("distribuciones_discretas", "discretas", "modelos_discretos"):
            modelo = snapshot.get("modelo") or ((snapshot.get("tema3") or {}).get("discretos") or {}).get("modelo")
            return {"Bernoulli": "Distribución de Bernoulli", "Binomial": "Distribución Binomial",
                    "Poisson": "Distribución de Poisson", "Hipergeometrica": "Distribución Hipergeométrica"}.get(modelo, "Distribuciones Discretas")
        if operacion in ("distribuciones_continuas", "continuas", "modelos_continuos"):
            modelo = snapshot.get("modelo") or ((snapshot.get("tema3") or {}).get("continuos") or {}).get("modelo")
            return {"Uniforme": "Distribución Uniforme", "Normal": "Distribución Normal", "NormalEstandar": "Normal Estándar",
                    "ChiCuadrado": "Distribución Chi-cuadrado", "FFisher": "Distribución F de Fisher", "TStudent": "Distribución T de Student"}.get(modelo, "Distribuciones Continuas")
        if operacion == "tyf":
            distribucion = snapshot.get("distribucion")
            nombre = {"student": "Media con Varianza Desconocida", "dif_medias_desc": "Diferencia de Medias con Varianzas Desconocidas", "razon_varianzas": "Razón de Varianzas"}.get(distribucion, "Tipo no registrado")
            escenario = {"grandes": "Muestras grandes", "iguales": "Varianzas iguales", "distintas": "Varianzas distintas"}.get((snapshot.get("parametros") or {}).get("escenario")) if distribucion == "dif_medias_desc" else None
            return "T y F: " + nombre + (" - " + escenario if escenario else "")
        if operacion == "estimacion_puntual":
            parametro = snapshot.get("parametro") or (snapshot.get("tema5") or {}).get("paramEstimacion")
            return "Estimación Puntual: " + {"media": "Media", "proporcion": "Proporción", "varianza": "Varianza"}.get(parametro, "Tipo no registrado")
        if operacion == "hipotesis_noparametricas":
            prueba = snapshot.get("prueba") or (snapshot.get("tema6") or {}).get("pruebaHNP")
            nombre = {"bondad": "Chi-cuadrada: Bondad de Ajuste", "independencia": "Chi-cuadrada: Independencia"}.get(snapshot.get("subtipo")) if prueba == "chi_cuadrada" else {"signos": "Prueba de Signos", "rachas": "Prueba de Rachas"}.get(prueba)
            return "Hipótesis No Paramétricas: " + (nombre or "Tipo no registrado")
        if operacion == "hipotesis_parametricas":
            prueba = snapshot.get("prueba") or (snapshot.get("tema6") or {}).get("pruebaHP")
            return "Hipótesis Paramétricas: " + {"media_z": "Media Z (σ conocida)", "media_t": "Media T (σ desconocida)", "proporcion": "Proporción", "varianza": "Varianza"}.get(prueba, "Tipo no registrado")
        if operacion == "estimacion_intervalos":
            parametro = snapshot.get("parametro") or (snapshot.get("tema5") or {}).get("paramIntervalos")
            return "Estimación por Intervalos: " + {"media": "Media", "proporcion": "Proporción", "varianza": "Varianza"}.get(parametro, "Tipo no registrado")
        if operacion == "distribuciones_muestrales":
            distribucion = snapshot.get("distribucion")
            if not distribucion:
                return "Distribuciones Muestrales (tipo no registrado)"
            if distribucion == "empirica":
                parametro = (snapshot.get("parametros") or {}).get("parametroCalculo")
                return "Demostración Empírica: " + {"media": "Medias", "varianza": "Varianzas", "proporcion": "Proporciones"}.get(parametro, "Datos")
            return "Probabilidad Muestral: " + {
                "normal": "Media con Varianza Conocida", "proporcion": "Una Proporción", "chi": "Varianza Muestral",
                "dif_medias": "Diferencia de Medias con Varianzas Conocidas", "dif_proporciones": "Diferencia de Proporciones",
            }.get(distribucion, "Tipo no registrado")
    return str(calculo or "").replace("_", " ")


def obtener_fuente_historial(snapshot, archivo_guardado, modulo):
    if str(modulo or "").upper() != "MAT251" or not isinstance(snapshot, dict):
        return archivo_guardado
    if str(snapshot.get("operacion", "")).lower() == "dist_continua":
        return "Modo Manual"
    legado = (snapshot.get("tema1") or {}).get("probabilidad") or {}
    modo = snapshot.get("modo") or legado.get("modo")
    if str(snapshot.get("operacion", "")).lower() == "regla_multiplicacion":
        configuracion = snapshot.get("parametros") or (snapshot.get("tema1") or {}).get("reglaMultiplicacion") or {}
        resultado = configuracion.get("resultado") or {}
        if isinstance(configuracion.get("eventos"), list) or isinstance(resultado.get("events"), list):
            modo = "manual"
        elif "colA" in configuracion or resultado.get("modo") == "matriz":
            modo = "matriz"
    experimento = snapshot.get("experimento") or {}
    if modo == "manual":
        return "Modo Manual"
    if modo == "simulacion":
        return "Simulación"
    if modo == "experimentos" and experimento.get("fuente") != "encuesta":
        return "Experimentos"
    etiquetas = {
        "Modo Manual", "Análisis de Matriz", "Matriz sin archivo",
        "Experimentos", "Experimentos (Encuesta)", "Simulación"
    }
    referencia = snapshot.get("referenciaArchivo") or {}
    for archivo in (snapshot.get("archivo"), referencia.get("nombre"), archivo_guardado):
        if isinstance(archivo, str) and archivo.strip() and archivo.strip() not in etiquetas:
            return archivo
    if modo == "matriz":
        return "Análisis de Matriz"
    if modo == "experimentos":
        return "Experimentos (Encuesta)"
    return archivo_guardado or "Modo Manual"


def validar_receta_muestral(snapshot):
    distribucion = snapshot.get("distribucion")
    modo = snapshot.get("modo")
    p = snapshot.get("parametros")
    if not isinstance(p, dict) or distribucion not in ("empirica", "normal", "proporcion", "chi", "dif_medias", "dif_proporciones"):
        return False
    if modo != ("matriz" if distribucion == "empirica" else "manual"):
        return False
    def numero(valor):
        if isinstance(valor, bool):
            raise ValueError("Número inválido")
        valor = float(str(valor).replace(",", "."))
        if not math.isfinite(valor):
            raise ValueError("Número no finito")
        return valor
    def entero(valor):
        valor = numero(valor)
        return valor.is_integer() and 0 < valor <= 9007199254740991
    try:
        if distribucion == "empirica":
            filas, variable = obtener_datos_matriz_historial(snapshot)
            valores = [str(fila.get("valor", "") if isinstance(fila, dict) else fila).strip() for fila in filas]
            valores = [valor for valor in valores if valor]
            if not valores or len(variable.get("nombresColumnas") or []) > 1 or any(" | " in valor or "," in valor for valor in valores):
                return False
            n = numero(p["n"])
            parametro = p["parametroCalculo"]
            if not entero(n) or not isinstance(p["conReemplazo"], bool) or parametro not in ("media", "varianza", "proporcion"):
                return False
            if not p["conReemplazo"] and n > len(valores):
                return False
            if parametro == "varianza" and (n < 2 or len(valores) < 2):
                return False
            if parametro == "proporcion":
                return bool(p.get("atributoExito")) and str(p["atributoExito"]).strip() in valores
            return all(math.isfinite(numero(valor)) for valor in valores)
        campos = {
            "normal": ("mediaPoblacional", "desviacion", "tamañoMuestra"),
            "proporcion": ("pPoblacional", "tamanoMuestra"),
            "chi": ("varianzaPoblacional", "tamañoMuestra"),
            "dif_medias": ("mu1", "sigma1", "n1", "mu2", "sigma2", "n2"),
            "dif_proporciones": ("p1", "n1", "p2", "n2"),
        }[distribucion]
        v = {campo: numero(p[campo]) for campo in campos}
        if distribucion in ("normal", "chi"):
            if p.get("tipoDispersion") not in ("varianza", "desviacion") or not entero(v["tamañoMuestra"]):
                return False
            dispersion = v["desviacion" if distribucion == "normal" else "varianzaPoblacional"]
            if dispersion <= 0 or not math.isfinite(dispersion ** 2) or (distribucion == "chi" and v["tamañoMuestra"] < 2):
                return False
        if distribucion in ("normal", "proporcion"):
            n = v["tamañoMuestra" if distribucion == "normal" else "tamanoMuestra"]
            if not entero(n) or p.get("tipoPoblacion") not in ("infinita", "finita"):
                return False
            if p["tipoPoblacion"] == "finita":
                N = numero(p["poblacionN" if distribucion == "normal" else "tamanoPoblacion"])
                if not entero(N) or N <= n:
                    return False
        if distribucion == "proporcion" and not 0 < v["pPoblacional"] < 1:
            return False
        if distribucion in ("dif_medias", "dif_proporciones"):
            if not entero(v["n1"]) or not entero(v["n2"]):
                return False
            if distribucion == "dif_medias":
                if v["sigma1"] <= 0 or v["sigma2"] <= 0 or not math.isfinite(v["sigma1"] ** 2 / v["n1"] + v["sigma2"] ** 2 / v["n2"]):
                    return False
            elif not (0 <= v["p1"] <= 1 and 0 <= v["p2"] <= 1) or v["p1"] * (1 - v["p1"]) / v["n1"] + v["p2"] * (1 - v["p2"]) / v["n2"] <= 0:
                return False
        condicion = snapshot.get("condicion")
        if condicion is not None:
            tipo = condicion["tipo"]
            x1 = numero(condicion["x1"])
            if tipo not in ("menor_que", "mayor_que", "entre"):
                return False
            if tipo == "entre" and numero(condicion["x2"]) <= x1:
                return False
            if distribucion == "chi" and x1 < 0:
                return False
            if distribucion == "proporcion" and not (0 <= x1 <= 1 and (tipo != "entre" or 0 <= numero(condicion["x2"]) <= 1)):
                return False
        return True
    except (KeyError, TypeError, ValueError, AttributeError, OverflowError, ZeroDivisionError):
        return False


def validar_receta_puntual(snapshot):
    if not isinstance(snapshot, dict):
        return False
    modo = snapshot.get("modo")
    parametro = snapshot.get("parametro")
    p = snapshot.get("parametros") or {}
    if modo not in ("matriz", "manual") or parametro not in ("media", "proporcion", "varianza") or (modo == "manual" and parametro == "media") or not isinstance(p, dict):
        return False
    def numero(valor):
        if isinstance(valor, bool):
            raise ValueError("Número inválido")
        valor = float(str(valor).replace(",", "."))
        if not math.isfinite(valor):
            raise ValueError("Número no finito")
        return valor
    try:
        if modo == "matriz":
            filas, variable = obtener_datos_matriz_historial(snapshot)
            valores = [str(fila.get("valor", "") if isinstance(fila, dict) else fila).strip() for fila in filas]
            valores = [valor for valor in valores if valor]
            if not valores or len(variable.get("nombresColumnas") or []) > 1 or any(" | " in valor for valor in valores):
                return False
            if parametro == "proporcion":
                return bool(p.get("valorExito")) and str(p["valorExito"]).strip() in valores
            if parametro == "varianza" and len(valores) < 2:
                return False
            return all(math.isfinite(numero(valor)) for valor in valores)
        n = numero(p["n"])
        if not n.is_integer() or n < (2 if parametro == "varianza" else 1) or n > 9007199254740991:
            return False
        if parametro == "proporcion":
            x = numero(p["x"])
            return x.is_integer() and 0 <= x <= n
        return numero(p["s2"]) >= 0
    except (KeyError, TypeError, ValueError, AttributeError, OverflowError):
        return False


def validar_receta_hnp(snapshot):
    if not isinstance(snapshot, dict):
        return False
    modo, prueba, p = snapshot.get("modo"), snapshot.get("prueba"), snapshot.get("parametros")
    if modo not in ("matriz", "manual") or prueba not in ("chi_cuadrada", "signos", "rachas") or not isinstance(p, dict):
        return False
    def numero(valor):
        if isinstance(valor, bool) or valor is None or str(valor).strip() == "":
            raise ValueError("Número inválido")
        v = float(str(valor).replace(",", "."))
        if not math.isfinite(v):
            raise ValueError("Número no finito")
        return v
    def entero(v, minimo=0):
        return v.is_integer() and minimo <= v <= 9007199254740991
    def rachas_validas(n1, n2, r):
        return entero(n1, 1) and entero(n2, 1) and entero(n1 + n2, 2) and entero(r, 2) and r <= 2 * min(n1, n2) + (0 if n1 == n2 else 1)
    def contingencia_valida(matriz):
        if not isinstance(matriz, list) or len(matriz) < 2 or not isinstance(matriz[0], list) or len(matriz[0]) < 2 or len(matriz) * len(matriz[0]) > 1000:
            return False
        if any(not isinstance(fila, list) or len(fila) != len(matriz[0]) for fila in matriz):
            return False
        m = [[numero(v) for v in fila] for fila in matriz]
        return (all(entero(v) for fila in m for v in fila) and entero(sum(sum(fila) for fila in m), 1)
                and all(sum(fila) > 0 for fila in m) and all(sum(fila[j] for fila in m) > 0 for j in range(len(m[0]))))
    try:
        if numero(p.get("alpha")) not in (0.1, 0.05, 0.01):
            return False
        if prueba != "chi_cuadrada" and p.get("tipoPrueba") not in ("bilateral", "izquierda", "derecha"):
            return False
        valores, variable, cantidad = [], {}, 1
        if modo == "matriz":
            filas, variable = obtener_datos_matriz_historial(snapshot)
            valores = [str(fila.get("valor", "") if isinstance(fila, dict) else fila).strip() for fila in filas]
            valores = [v for v in valores if v]
            cantidad = max(1, len(variable.get("nombresColumnas") or []))
            if not valores:
                return False
        if prueba == "chi_cuadrada":
            subtipo = snapshot.get("subtipo")
            if subtipo not in ("bondad", "independencia"):
                return False
            if subtipo == "bondad":
                if modo == "matriz":
                    if cantidad > 2:
                        return False
                    conteos = {}
                    for v in valores:
                        partes = [parte.strip() for parte in v.split("|")]
                        if len(partes) != cantidad or any(not parte for parte in partes):
                            return False
                        frecuencia = 1.0 if cantidad == 1 else numero(partes[1])
                        if not entero(frecuencia):
                            return False
                        conteos[partes[0]] = conteos.get(partes[0], 0) + frecuencia
                    observadas = list(conteos.values())
                else:
                    if not isinstance(p.get("observadas"), list):
                        return False
                    observadas = [numero(v) for v in p["observadas"]]
                if not isinstance(p.get("esperadas"), list):
                    return False
                esperadas = [numero(v) for v in p["esperadas"]]
                categorias = p.get("categorias")
                return (len(observadas) >= 2 and len(observadas) == len(esperadas) and all(entero(v) for v in observadas)
                        and all(v > 0 for v in esperadas) and entero(sum(observadas), 1) and math.isfinite(sum(esperadas))
                        and abs(sum(observadas) - sum(esperadas)) <= 0.1
                        and (categorias is None or isinstance(categorias, list) and len(categorias) == len(observadas) and all(isinstance(v, str) for v in categorias)))
            if modo == "matriz":
                if cantidad != 2:
                    return False
                pares = [[parte.strip() for parte in v.split("|")] for v in valores]
                if any(len(par) != 2 or not all(par) for par in pares):
                    return False
                return len(set(par[0] for par in pares)) >= 2 and len(set(par[1] for par in pares)) >= 2 and len(set(par[0] for par in pares)) * len(set(par[1] for par in pares)) <= 1000
            matriz = p.get("matriz")
            if not contingencia_valida(matriz):
                return False
            return all(p.get(clave) is None or isinstance(p[clave], list) and len(p[clave]) == dimension and all(isinstance(v, str) for v in p[clave]) for clave, dimension in (("nombresFilas", len(matriz)), ("nombresCols", len(matriz[0]))))
        if modo == "manual":
            if prueba == "signos":
                positivos, negativos = numero(p["positivos"]), numero(p["negativos"])
                return entero(positivos) and entero(negativos) and entero(positivos + negativos, 1)
            return rachas_validas(numero(p["n1"]), numero(p["n2"]), numero(p["rachas"]))
        pares = [[parte.strip() for parte in v.split("|")] for v in valores]
        if any(len(par) != cantidad or not all(par) for par in pares):
            return False
        col = numero(p.get("columna", 0))
        if not entero(col) or col >= cantidad:
            return False
        if prueba == "signos":
            referencia = 0 if cantidad == 2 else numero(p["referencia"])
            datos = [numero(par[1]) - numero(par[0]) if cantidad == 2 else numero(par[int(col)]) for par in pares]
            return all(math.isfinite(v) for v in datos) and any(v != referencia for v in datos)
        raw = [par[int(col)] for par in pares]
        nums = []
        for v in raw:
            try:
                nums.append(float(v))
            except ValueError:
                nums.append(None)
        if all(v is not None and math.isfinite(v) for v in nums):
            unicos = sorted(set(nums))
            if len(unicos) < 2:
                return False
            if len(unicos) == 2:
                grupos = [1 if v == unicos[1] else -1 for v in nums]
            else:
                corte = p.get("corte")
                if corte not in ("mediana", "media", "personalizado"):
                    return False
                orden = sorted(nums)
                mitad = len(orden) // 2
                if corte == "media":
                    valor = sum(nums) / len(nums)
                elif corte == "mediana":
                    valor = orden[mitad] if len(orden) % 2 else (orden[mitad - 1] + orden[mitad]) / 2
                else:
                    valor = numero(p["valorCorte"])
                if not math.isfinite(valor):
                    return False
                grupos = [1 if v > valor else -1 for v in nums if v != valor]
        elif all(v is None or math.isnan(v) for v in nums) and len(set(raw)) == 2:
            grupos = [1 if v == raw[0] else -1 for v in raw]
        else:
            return False
        n1 = float(grupos.count(1))
        n2 = float(grupos.count(-1))
        r = float(sum(1 for i, grupo in enumerate(grupos) if i == 0 or grupo != grupos[i - 1]))
        return rachas_validas(n1, n2, r)
    except (KeyError, TypeError, ValueError, AttributeError, OverflowError, IndexError):
        return False

def validar_receta_hp(snapshot):
    if not isinstance(snapshot, dict):
        return False
    modo = snapshot.get("modo")
    prueba = snapshot.get("prueba")
    p = snapshot.get("parametros")
    if modo not in ("matriz", "manual") or prueba not in ("media_z", "media_t", "proporcion", "varianza") or not isinstance(p, dict):
        return False
    def numero(valor):
        if isinstance(valor, bool):
            raise ValueError("Número inválido")
        valor = float(str(valor).replace(",", "."))
        if not math.isfinite(valor):
            raise ValueError("Número no finito")
        return valor
    try:
        if numero(p.get("alpha")) not in (0.1, 0.05, 0.01) or p.get("tipoPrueba") not in ("bilateral", "izquierda", "derecha"):
            return False
        if prueba in ("media_z", "media_t"):
            numero(p["mu0"])
        if prueba == "media_z" and numero(p["sigma"]) <= 0:
            return False
        if prueba == "proporcion" and not 0 < numero(p["p0"]) < 1:
            return False
        if prueba == "varianza" and numero(p["sigma02"]) <= 0:
            return False
        minimo = 2 if prueba in ("media_t", "varianza") else 1
        if modo == "matriz":
            filas, variable = obtener_datos_matriz_historial(snapshot)
            valores = [str(fila.get("valor", "") if isinstance(fila, dict) else fila).strip() for fila in filas]
            valores = [valor for valor in valores if valor]
            if len(valores) < minimo or len(variable.get("nombresColumnas") or []) > 1 or any(" | " in valor for valor in valores):
                return False
            if prueba == "proporcion":
                return bool(p.get("valorExito")) and str(p["valorExito"]).strip() in valores
            datos = [float(valor) for valor in valores]
            return all(math.isfinite(valor) for valor in datos) and (prueba != "media_t" or any(valor != datos[0] for valor in datos))
        n = numero(p["n"])
        if not n.is_integer() or not minimo <= n <= 9007199254740991:
            return False
        if prueba in ("media_z", "media_t"):
            numero(p["xBar"])
            return prueba != "media_t" or numero(p["s"]) > 0
        if prueba == "proporcion":
            x = numero(p["x"])
            return x.is_integer() and 0 <= x <= n
        return numero(p["s2"]) >= 0
    except (KeyError, TypeError, ValueError, AttributeError, OverflowError):
        return False

def validar_receta_intervalos(snapshot):
    if not isinstance(snapshot, dict):
        return False
    modo = snapshot.get("modo")
    parametro = snapshot.get("parametro")
    p = snapshot.get("parametros") or {}
    if modo not in ("matriz", "manual") or parametro not in ("media", "proporcion", "varianza") or not isinstance(p, dict):
        return False
    def numero(valor):
        if isinstance(valor, bool):
            raise ValueError("Número inválido")
        valor = float(str(valor).replace(",", "."))
        if not math.isfinite(valor):
            raise ValueError("Número no finito")
        return valor
    try:
        if numero(snapshot.get("confianza")) not in (90, 95, 99):
            return False
        if parametro == "media" and not isinstance(p.get("sigmaConocida"), bool):
            return False
        minimo = 2 if parametro == "varianza" or (parametro == "media" and not p.get("sigmaConocida")) else 1
        if modo == "matriz":
            filas, variable = obtener_datos_matriz_historial(snapshot)
            valores = [str(fila.get("valor", "") if isinstance(fila, dict) else fila).strip() for fila in filas]
            valores = [valor for valor in valores if valor]
            if len(valores) < minimo or len(variable.get("nombresColumnas") or []) > 1 or any(" | " in valor for valor in valores):
                return False
            if parametro == "proporcion":
                return bool(p.get("valorExito")) and str(p["valorExito"]).strip() in valores
            if not all(math.isfinite(float(valor)) for valor in valores):
                return False
            return parametro != "media" or not p["sigmaConocida"] or numero(p["sigmaPoblacional"]) > 0
        n = numero(p["n"])
        if not n.is_integer() or not minimo <= n <= 9007199254740991:
            return False
        if parametro == "media":
            numero(p["xBar"])
            desviacion = numero(p["desviacion"])
            return desviacion > 0 if p["sigmaConocida"] else desviacion >= 0
        if parametro == "proporcion":
            x = numero(p["x"])
            return x.is_integer() and 0 <= x <= n
        return numero(p["s2"]) >= 0
    except (KeyError, TypeError, ValueError, AttributeError, OverflowError):
        return False

def validar_receta_tyf(snapshot):
    if not isinstance(snapshot, dict) or snapshot.get("modo") != "manual":
        return False
    distribucion = snapshot.get("distribucion")
    p = snapshot.get("parametros")
    if not isinstance(p, dict) or distribucion not in ("student", "dif_medias_desc", "razon_varianzas"):
        return False
    def numero(valor):
        if isinstance(valor, bool):
            raise ValueError("Número inválido")
        valor = float(str(valor).replace(",", "."))
        if not math.isfinite(valor):
            raise ValueError("Número no finito")
        return valor
    def muestra(n):
        return n.is_integer() and 2 <= n <= 9007199254740991
    try:
        campos = {"student": ("mu", "s", "n"), "dif_medias_desc": ("mu1", "s1", "n1", "mu2", "s2", "n2"), "razon_varianzas": ("varPob1", "n1", "varPob2", "n2")}[distribucion]
        v = {campo: numero(p[campo]) for campo in campos}
        if distribucion == "student":
            if not muestra(v["n"]) or v["s"] <= 0 or p.get("tipoDispersion") not in ("varianza", "desviacion"):
                return False
            escala = v["s"] if p["tipoDispersion"] == "varianza" else v["s"] ** 2
            if not math.isfinite(escala) or escala <= 0:
                return False
        else:
            if not muestra(v["n1"]) or not muestra(v["n2"]):
                return False
            if distribucion == "razon_varianzas":
                if v["varPob1"] <= 0 or v["varPob2"] <= 0 or not math.isfinite(v["varPob2"] / v["varPob1"]) or v["varPob2"] / v["varPob1"] <= 0:
                    return False
            else:
                escenario = p.get("escenario")
                if v["s1"] < 0 or v["s2"] < 0 or (v["s1"] == 0 and v["s2"] == 0) or escenario not in ("grandes", "iguales", "distintas"):
                    return False
                if (escenario == "grandes") != (v["n1"] + v["n2"] > 30):
                    return False
                a = v["s1"] ** 2 / v["n1"]
                b = v["s2"] ** 2 / v["n2"]
                if not math.isfinite(a + b) or a + b <= 0:
                    return False
                if escenario == "distintas":
                    grados = (a + b) ** 2 / (a ** 2 / (v["n1"] + 1) + b ** 2 / (v["n2"] + 1)) - 2
                    if not math.isfinite(grados) or round(grados, 2) <= 0:
                        return False
        condicion = snapshot.get("condicion")
        if condicion is not None:
            tipo = condicion["tipo"]
            x1 = numero(condicion["x1"])
            if tipo not in ("menor_que", "mayor_que", "entre") or (distribucion == "razon_varianzas" and x1 < 0):
                return False
            if tipo == "entre" and numero(condicion["x2"]) <= x1:
                return False
        return True
    except (KeyError, TypeError, ValueError, AttributeError, OverflowError, ZeroDivisionError):
        return False


async def guardar_historial_db(db: AsyncSession, registro: RegistroHistorial, current_user: models.Usuario):
    try:
        modulo_registro = (registro.modulo or "MAT151").upper()
        if modulo_registro == "MAT251":
            operacion_guardada = str(registro.calculo or "").lower()
            snapshot_guardado = registro.snapshot if isinstance(registro.snapshot, dict) else {}
            modo_guardado = snapshot_guardado.get("modo") or (snapshot_guardado.get("tema5") or {}).get("modoEstimacion" if operacion_guardada == "estimacion_puntual" else "modoIntervalos")
            if operacion_guardada in ("estimacion_puntual", "estimacion_intervalos") and modo_guardado == "simulacion":
                return JSONResponse(status_code=400, content={"error": "Las simulaciones de estimación no se guardan en el historial"})
            if operacion_guardada == "hipotesis_noparametricas":
                modo_hnp = snapshot_guardado.get("modo") or (snapshot_guardado.get("tema6") or {}).get("modoHNP")
                if modo_hnp == "simulacion":
                    return JSONResponse(status_code=400, content={"error": "Las simulaciones de hipótesis no paramétricas no se guardan en el historial"})
                if not validar_receta_hnp(snapshot_guardado):
                    return JSONResponse(status_code=400, content={"error": "Datos o parámetros inválidos para guardar la prueba no paramétrica"})
            if operacion_guardada == "hipotesis_parametricas":
                modo_hp = snapshot_guardado.get("modo") or (snapshot_guardado.get("tema6") or {}).get("modoHP")
                if modo_hp == "simulacion":
                    return JSONResponse(status_code=400, content={"error": "Las simulaciones de hipótesis paramétricas no se guardan en el historial"})
                if not validar_receta_hp(snapshot_guardado):
                    return JSONResponse(status_code=400, content={"error": "Datos o parámetros inválidos para guardar la prueba paramétrica"})
            if operacion_guardada == "estimacion_puntual" and not validar_receta_puntual(snapshot_guardado):
                return JSONResponse(status_code=400, content={"error": "Datos o parámetros inválidos para guardar la estimación puntual"})
            if operacion_guardada == "estimacion_intervalos" and not validar_receta_intervalos(snapshot_guardado):
                return JSONResponse(status_code=400, content={"error": "Datos o parámetros inválidos para guardar el intervalo"})
            if operacion_guardada == "tyf" and not validar_receta_tyf(snapshot_guardado):
                return JSONResponse(status_code=400, content={"error": "Parámetros o condición inválidos para guardar T y F"})
        snapshot_str = (
            json.dumps(registro.snapshot, ensure_ascii=False, separators=(",", ":"))
            if modulo_registro == "MAT251" and registro.snapshot
            else json.dumps(registro.snapshot) if registro.snapshot else "{}"
        )

        nuevo_registro = models.HistorialCalculo(
            modulo=modulo_registro,
            tipo_analisis=registro.calculo,
            nombre_trabajo=obtener_fuente_historial(registro.snapshot, registro.archivo_origen, modulo_registro),
            parametros_json=snapshot_str,
            resultados_json="{}",
            usuario_id=current_user.id
        )

        db.add(nuevo_registro)
        await db.commit()
        await db.refresh(nuevo_registro)

        return {
            "message": "Historial guardado con éxito",
            "registro": {
                "id": nuevo_registro.id,
                "fecha": nuevo_registro.fecha_creacion.strftime("%d/%m/%Y"),
                "hora": nuevo_registro.fecha_creacion.strftime("%H:%M:%S"),
                "modulo": nuevo_registro.modulo,
                "calculo": nuevo_registro.tipo_analisis,
                **({"nombre_calculo": obtener_nombre_calculo_historial(registro.snapshot, nuevo_registro.tipo_analisis, nuevo_registro.modulo)}
                   if str(nuevo_registro.modulo or "").upper() == "MAT251" else {}),
                "archivo_origen": nuevo_registro.nombre_trabajo,
                "snapshot": registro.snapshot
            }
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

async def actualizar_historial_db(db: AsyncSession, registro_id: int, datos: RegistroHistorial, current_user: models.Usuario):
    try:
        result = await db.execute(
            select(models.HistorialCalculo).filter(
                models.HistorialCalculo.id == registro_id,
                models.HistorialCalculo.usuario_id == current_user.id
            )
        )
        registro = result.scalars().first()
        if not registro:
            return JSONResponse(status_code=404, content={"error": "Historial no encontrado o no pertenece al usuario actual"})

        operacion = registro.tipo_analisis.lower()
        if (registro.modulo or "").upper() != "MAT251" or operacion not in ("conteo", "probabilidad", "probabilidad_total", "simulador_total", "regla_adicion", "regla_multiplicacion", "dist_discreta", "dist_continua", "distribuciones_discretas", "discretas", "modelos_discretos", "distribuciones_continuas", "continuas", "modelos_continuos", "distribuciones_muestrales", "estimacion_puntual", "estimacion_intervalos", "tyf", "hipotesis_parametricas", "hipotesis_noparametricas"):
            return JSONResponse(status_code=400, content={"error": "Esta operación todavía no admite actualizar el historial"})
        snapshot = datos.snapshot or {}
        if ((datos.modulo or "").upper() != "MAT251"
                or datos.calculo.lower() != operacion
                or snapshot.get("modulo") != "MAT251"
                or str(snapshot.get("operacion", "")).lower() != operacion):
            return JSONResponse(status_code=400, content={"error": "No puedes cambiar la operación ni el módulo del historial"})

        parametros = snapshot.get("parametros")
        if operacion == "conteo":
            if not isinstance(parametros, dict):
                return JSONResponse(status_code=400, content={"error": "Faltan los parámetros de conteo"})
            try:
                n = float(parametros.get("n", ""))
                r = float(parametros.get("r", ""))
                validos = n.is_integer() and r.is_integer() and 0 <= r <= n <= 9007199254740991
            except (TypeError, ValueError, OverflowError):
                validos = False
            if not validos:
                return JSONResponse(status_code=400, content={"error": "n y r deben ser enteros no negativos, con r menor o igual que n"})
        elif operacion == "tyf":
            anterior = json.loads(registro.parametros_json or "{}")
            if snapshot.get("distribucion") != anterior.get("distribucion") or snapshot.get("modo") != (anterior.get("modo") or "manual"):
                return JSONResponse(status_code=400, content={"error": "No puedes cambiar la herramienta ni el modo del historial"})
            if not validar_receta_tyf(snapshot):
                return JSONResponse(status_code=400, content={"error": "Parámetros o condición inválidos para actualizar T y F"})
        elif operacion == "hipotesis_noparametricas":
            anterior = json.loads(registro.parametros_json or "{}")
            legado = anterior.get("tema6") or {}
            prueba_previa = anterior.get("prueba") or legado.get("pruebaHNP")
            modo_previo = anterior.get("modo") or legado.get("modoHNP") or "matriz"
            if snapshot.get("prueba") != prueba_previa or snapshot.get("modo") != modo_previo or (prueba_previa == "chi_cuadrada" and snapshot.get("subtipo") != anterior.get("subtipo")):
                return JSONResponse(status_code=400, content={"error": "No puedes cambiar la prueba, el subtipo ni el modo del historial"})
            if not validar_receta_hnp(snapshot):
                return JSONResponse(status_code=400, content={"error": "Datos o parámetros inválidos para actualizar la prueba no paramétrica"})
        elif operacion == "hipotesis_parametricas":
            anterior = json.loads(registro.parametros_json or "{}")
            legado = anterior.get("tema6") or {}
            prueba_previa = anterior.get("prueba") or legado.get("pruebaHP")
            modo_previo = anterior.get("modo") or legado.get("modoHP") or "matriz"
            if snapshot.get("prueba") != prueba_previa or snapshot.get("modo") != modo_previo:
                return JSONResponse(status_code=400, content={"error": "No puedes cambiar la prueba ni el modo del historial"})
            if not validar_receta_hp(snapshot):
                return JSONResponse(status_code=400, content={"error": "Datos o parámetros inválidos para actualizar la prueba paramétrica"})
        elif operacion == "estimacion_intervalos":
            anterior = json.loads(registro.parametros_json or "{}")
            legado = anterior.get("tema5") or {}
            parametro_previo = anterior.get("parametro") or legado.get("paramIntervalos") or "media"
            modo_previo = anterior.get("modo") or legado.get("modoIntervalos") or "matriz"
            if snapshot.get("parametro") != parametro_previo or snapshot.get("modo") != modo_previo:
                return JSONResponse(status_code=400, content={"error": "No puedes cambiar el parámetro ni el modo del historial"})
            if not validar_receta_intervalos(snapshot):
                return JSONResponse(status_code=400, content={"error": "Datos o parámetros inválidos para actualizar el intervalo"})
        elif operacion == "estimacion_puntual":
            anterior = json.loads(registro.parametros_json or "{}")
            legado = anterior.get("tema5") or {}
            parametro_previo = anterior.get("parametro") or legado.get("paramEstimacion") or "media"
            modo_previo = anterior.get("modo") or legado.get("modoEstimacion") or "matriz"
            if snapshot.get("parametro") != parametro_previo or snapshot.get("modo") != modo_previo:
                return JSONResponse(status_code=400, content={"error": "No puedes cambiar el parámetro ni el modo del historial"})
            if not validar_receta_puntual(snapshot):
                return JSONResponse(status_code=400, content={"error": "Datos o parámetros inválidos para actualizar la estimación puntual"})
        elif operacion == "distribuciones_muestrales":
            anterior = json.loads(registro.parametros_json or "{}")
            distribucion_previa = anterior.get("distribucion") or "empirica"
            modo_previo = "matriz" if distribucion_previa == "empirica" else "manual"
            if snapshot.get("distribucion") != distribucion_previa or snapshot.get("modo") != modo_previo:
                return JSONResponse(status_code=400, content={"error": "No puedes cambiar la herramienta ni el modo del historial"})
            if not validar_receta_muestral(snapshot):
                return JSONResponse(status_code=400, content={"error": "Datos, parámetros o condición inválidos para la distribución muestral"})
        elif operacion in ("distribuciones_continuas", "continuas", "modelos_continuos"):
            modelo = snapshot.get("modelo")
            modo = snapshot.get("modo")
            tipo_calculo = snapshot.get("calcMode", "directa")
            anterior = json.loads(registro.parametros_json or "{}")
            legado = (anterior.get("tema3") or {}).get("continuos") or {}
            modelo_previo = anterior.get("modelo") or legado.get("modelo") or "Uniforme"
            modo_previo = "manual" if modelo == "NormalEstandar" else anterior.get("modo") or legado.get("modo") or "manual"
            if (modelo not in ("Uniforme", "Normal", "NormalEstandar", "ChiCuadrado", "FFisher", "TStudent")
                    or modelo != modelo_previo or modo not in ("manual", "matriz") or modo != modo_previo
                    or tipo_calculo not in ("directa", "inversa") or (modelo == "NormalEstandar" and modo != "manual")):
                return JSONResponse(status_code=400, content={"error": "No puedes cambiar la distribución ni el modo del historial"})
            def numero_continuo(valor):
                return float(str(valor).replace(",", "."))
            try:
                if modelo == "NormalEstandar":
                    fijos = snapshot.get("parametros") or {}
                    validos = numero_continuo(fijos.get("mu", 0)) == 0 and numero_continuo(fijos.get("sigma", 1)) == 1
                    p = {"mu": 0.0, "sigma": 1.0}
                elif modo == "manual":
                    campos = {"Uniforme": ("a", "b"), "Normal": ("mu", "sigma"), "ChiCuadrado": ("k",), "FFisher": ("v1", "v2"), "TStudent": ("n",)}[modelo]
                    p = {clave: numero_continuo(snapshot["parametros"][clave]) for clave in campos}
                    validos = True
                else:
                    filas, variable = obtener_datos_matriz_historial(snapshot)
                    columnas = variable.get("nombresColumnas") or ["Valores"]
                    indices = (snapshot.get("estimacion") or {}).get("columnas")
                    cantidad = 2 if modelo == "FFisher" else 1
                    validos = isinstance(indices, list) and len(indices) == cantidad and all(
                        isinstance(indice, int) and not isinstance(indice, bool) and 0 <= indice < len(columnas) for indice in indices
                    )
                    if not validos or (cantidad == 2 and indices[0] == indices[1]):
                        raise ValueError("Columnas inválidas")
                    partes = [str(fila.get("valor", "") if isinstance(fila, dict) else fila).split(" | ") for fila in filas]
                    grupos = [[numero_continuo(fila[indice].strip()) for fila in partes if len(fila) > indice and fila[indice].strip()] for indice in indices]
                    if any(not grupo or any(not math.isfinite(valor) for valor in grupo) for grupo in grupos):
                        raise ValueError("Datos no numéricos")
                    valores = grupos[0]
                    total = len(valores)
                    if modelo == "Uniforme":
                        p = {"a": min(valores), "b": max(valores)}
                    elif modelo == "Normal":
                        if total < 2:
                            raise ValueError("Faltan observaciones")
                        media, m2 = 0.0, 0.0
                        for indice, valor in enumerate(valores, 1):
                            diferencia = valor - media
                            media += diferencia / indice
                            m2 += diferencia * (valor - media)
                        p = {"mu": media, "sigma": math.sqrt(m2 / (total - 1))}
                    elif modelo == "FFisher":
                        p = {"v1": float(len(grupos[0]) - 1), "v2": float(len(grupos[1]) - 1)}
                    else:
                        p = {"k" if modelo == "ChiCuadrado" else "n": float(total - 1)}
                validos = validos and all(math.isfinite(valor) for valor in p.values())
                if modelo == "Uniforme":
                    validos = validos and p["a"] < p["b"]
                elif modelo in ("Normal", "NormalEstandar"):
                    validos = validos and p["sigma"] > 0
                else:
                    validos = validos and all(valor.is_integer() and 0 < valor <= 9007199254740991 for valor in p.values())
                condicion = snapshot.get("condicion")
                if condicion is not None:
                    tipo = condicion.get("tipo")
                    if tipo_calculo == "inversa":
                        probabilidad = numero_continuo(condicion["valP"])
                        validos = validos and tipo in ("inversa_menor", "inversa_mayor", "inversa_entre", "inversa_exterior") and 0 < probabilidad < 1
                    elif tipo == "suma_intervalos":
                        intervalos = condicion.get("intervals")
                        validos = validos and isinstance(intervalos, list) and bool(intervalos)
                        validos = validos and all(isinstance(par, list) and len(par) == 2
                            and all(math.isfinite(numero_continuo(valor)) for valor in par)
                            and numero_continuo(par[0]) <= numero_continuo(par[1]) for par in intervalos)
                    else:
                        x = numero_continuo(condicion["valX"])
                        validos = validos and tipo in ("menor", "menor_igual", "mayor", "mayor_igual", "entre", "intervalo", "exterior") and math.isfinite(x)
                        if tipo in ("entre", "intervalo", "exterior"):
                            x2 = numero_continuo(condicion["valX2"])
                            validos = validos and math.isfinite(x2) and x <= x2
            except (KeyError, TypeError, ValueError, AttributeError, OverflowError, ZeroDivisionError):
                validos = False
            if not validos:
                return JSONResponse(status_code=400, content={"error": "Parámetros, columnas o condición inválidos para la distribución continua"})
        elif operacion in ("distribuciones_discretas", "discretas", "modelos_discretos"):
            modelo = snapshot.get("modelo")
            modo = snapshot.get("modo")
            anterior = json.loads(registro.parametros_json or "{}")
            legado = (anterior.get("tema3") or {}).get("discretos") or {}
            if (modelo not in ("Bernoulli", "Binomial", "Poisson", "Hipergeometrica")
                    or modo not in ("manual", "matriz")
                    or modelo != (anterior.get("modelo") or legado.get("modelo") or "Bernoulli")
                    or modo != (anterior.get("modo") or legado.get("modo") or "manual")):
                return JSONResponse(status_code=400, content={"error": "No puedes cambiar la distribución ni el modo del historial"})
            def numero_modelo(valor):
                return float(str(valor).replace(",", "."))
            def entero_modelo(valor):
                return math.isfinite(valor) and valor.is_integer() and 0 <= valor <= 9007199254740991
            try:
                if modo == "manual":
                    campos = {"Bernoulli": ("p",), "Binomial": ("n", "p"), "Poisson": ("lambda",), "Hipergeometrica": ("N", "K", "n")}[modelo]
                    parametros_modelo = {clave: numero_modelo(snapshot["parametros"][clave]) for clave in campos}
                else:
                    filas, variable = obtener_datos_matriz_historial(snapshot)
                    columnas = variable.get("nombresColumnas") or ["Valores"]
                    estimacion = snapshot.get("estimacion") or {}
                    indice = estimacion.get("columna")
                    if not isinstance(indice, int) or isinstance(indice, bool) or not 0 <= indice < len(columnas):
                        raise ValueError("Columna inválida")
                    partes = [str(fila.get("valor", "") if isinstance(fila, dict) else fila).split(" | ") for fila in filas]
                    valores = [fila[indice].strip() for fila in partes if len(fila) > indice and fila[indice].strip()]
                    if not valores:
                        raise ValueError("Sin datos")
                    total = len(valores)
                    if modelo == "Poisson" or (modelo == "Binomial" and estimacion.get("modo") == "lote"):
                        numeros = [numero_modelo(valor) for valor in valores]
                        if not all(entero_modelo(valor) for valor in numeros):
                            raise ValueError("Los conteos deben ser enteros no negativos")
                        if modelo == "Poisson":
                            parametros_modelo = {"lambda": sum(numeros) / total}
                        else:
                            n = numero_modelo(estimacion["n"])
                            if not entero_modelo(n) or n < 1 or any(valor > n for valor in numeros):
                                raise ValueError("Tamaño de ensayo inválido")
                            parametros_modelo = {"n": n, "p": sum(numeros) / (total * n)}
                    else:
                        exito = str(estimacion.get("valorExito", ""))
                        if not exito.strip() or (modelo == "Binomial" and estimacion.get("modo") != "especifico"):
                            raise ValueError("Selecciona el éxito y la estimación")
                        def coincide(valor):
                            if modelo == "Binomial":
                                try:
                                    a, b = numero_modelo(valor), numero_modelo(exito)
                                    if math.isfinite(a) and math.isfinite(b):
                                        return a == b
                                except (ValueError, TypeError, OverflowError):
                                    pass
                            return valor == exito
                        exitos = sum(1 for valor in valores if coincide(valor))
                        if modelo == "Bernoulli":
                            parametros_modelo = {"p": exitos / total}
                        elif modelo == "Binomial":
                            parametros_modelo = {"n": numero_modelo(estimacion["n"]), "p": exitos / total}
                        else:
                            parametros_modelo = {"N": float(total), "K": float(exitos), "n": numero_modelo(estimacion["n"])}
                validos = all(math.isfinite(valor) for valor in parametros_modelo.values())
                if modelo in ("Bernoulli", "Binomial"):
                    validos = validos and 0 <= parametros_modelo["p"] <= 1
                    if modelo == "Binomial":
                        validos = validos and entero_modelo(parametros_modelo["n"]) and (modo == "manual" or parametros_modelo["n"] >= 1)
                elif modelo == "Poisson":
                    validos = validos and parametros_modelo["lambda"] >= 0
                else:
                    N, K, n = (parametros_modelo[clave] for clave in ("N", "K", "n"))
                    validos = validos and all(entero_modelo(valor) for valor in (N, K, n)) and N >= 1 and K <= N and n <= N
                    validos = validos and (modo == "manual" or n >= 1)
                condicion = snapshot.get("condicion")
                if condicion is not None:
                    tipo = condicion.get("tipo")
                    x = numero_modelo(condicion["valorX"])
                    validos = validos and tipo in ("exacta", "menor_igual", "mayor_igual", "intervalo", "menor_estricto", "mayor_estricto", "intervalo_estricto")
                    validos = validos and math.isfinite(x) and x.is_integer() and abs(x) <= 9007199254740991
                    if "intervalo" in str(tipo):
                        b = numero_modelo(condicion["valorB"])
                        validos = validos and math.isfinite(b) and b.is_integer() and x <= b <= 9007199254740991
            except (KeyError, TypeError, ValueError, AttributeError, OverflowError, ZeroDivisionError):
                validos = False
            if not validos:
                return JSONResponse(status_code=400, content={"error": "Parámetros, datos o condición inválidos para la distribución discreta"})
        elif operacion == "dist_continua":
            if snapshot.get("modo") != "manual":
                return JSONResponse(status_code=400, content={"error": "La calculadora de funciones continuas utiliza modo manual"})
            tipos = {"incognita_dinamica", "pi", "signo", "paren_abre", "paren_cierra", "corchete_abre", "corchete_cierra",
                     "fraccion", "euler", "absoluto", "constante", "termino_lineal", "termino_cuadratico", "termino_potencia"}
            def bloques_validos(bloques, nivel=0):
                return isinstance(bloques, list) and nivel <= 50 and all(
                    isinstance(bloque, dict) and bloque.get("tipo") in tipos
                    and all(isinstance(bloque.get(clave, ""), (str, int, float)) for clave in ("coef", "exp", "valor", "exp_adjunto"))
                    and bloques_validos(bloque.get("numerador", []), nivel + 1)
                    and bloques_validos(bloque.get("denominador", []), nivel + 1)
                    for bloque in bloques
                )
            limites = snapshot.get("limites")
            if (not snapshot.get("bloques") or not bloques_validos(snapshot.get("bloques"))
                    or not isinstance(limites, list) or len(limites) != 2
                    or not all(isinstance(limite, str) and limite.strip() for limite in limites)
                    or snapshot.get("etapa", "completo") not in ("constante", "completo")):
                return JSONResponse(status_code=400, content={"error": "Faltan la función o los límites del cálculo continuo"})
        elif operacion == "dist_discreta":
            modo = snapshot.get("modo")
            anterior = json.loads(registro.parametros_json or "{}")
            legado = (anterior.get("tema2") or {}).get("discretos") or {}
            modo_previo = "manual" if isinstance(anterior.get("tabla"), list) else legado.get("modo") or anterior.get("modo") or "matriz"
            if modo not in ("manual", "matriz") or modo != modo_previo:
                return JSONResponse(status_code=400, content={"error": "No puedes cambiar el modo del historial de variables discretas"})
            if modo == "manual":
                tabla = snapshot.get("tabla")
                try:
                    validos = isinstance(tabla, list) and len(tabla) > 0
                    validos = validos and all(isinstance(fila, list) and len(fila) == 2 for fila in tabla)
                    if validos:
                        pares = [(float(fila[0]), float(fila[1])) for fila in tabla]
                        validos = all(math.isfinite(x) and 0 <= p <= 1 for x, p in pares)
                        validos = validos and abs(sum(p for _, p in pares) - 1) <= 0.0001
                except (TypeError, ValueError, OverflowError):
                    validos = False
                if not validos:
                    return JSONResponse(status_code=400, content={"error": "La tabla necesita valores X finitos y probabilidades entre 0 y 1 cuya suma sea 1"})
            else:
                filas, variable = obtener_datos_matriz_historial(snapshot)
                columnas = variable.get("nombresColumnas") or ([variable.get("nombre") or "Datos"] if variable else ["Valores"])
                indice = snapshot.get("columna")
                if not isinstance(indice, int) or isinstance(indice, bool) or not 0 <= indice < len(columnas):
                    return JSONResponse(status_code=400, content={"error": "Selecciona una columna válida para la variable discreta"})
                try:
                    valores = [str(fila.get("valor", "") if isinstance(fila, dict) else fila).split(" | ") for fila in filas]
                    seleccionados = [fila[indice].strip() for fila in valores if len(fila) > indice and fila[indice].strip()]
                    validos = bool(seleccionados) and all(math.isfinite(float(valor)) for valor in seleccionados)
                except (TypeError, ValueError, OverflowError):
                    validos = False
                if not validos:
                    return JSONResponse(status_code=400, content={"error": "La columna seleccionada necesita datos numéricos finitos"})
            vista = snapshot.get("vista") or {}
            try:
                orden = float(vista.get("ordenMomento", 1))
                validos = orden.is_integer() and 1 <= orden <= 9007199254740991
                validos = validos and all(math.isfinite(float(vista.get(clave, valor))) for clave, valor in (("propA", 2), ("propB", 3)))
            except (TypeError, ValueError, AttributeError, OverflowError):
                validos = False
            if not validos:
                return JSONResponse(status_code=400, content={"error": "El orden del momento y los parámetros de la vista no son válidos"})
        elif operacion == "regla_multiplicacion":
            modo = snapshot.get("modo")
            parametros = parametros if isinstance(parametros, dict) else {}
            reemplazo = parametros.get("modReemplazo")
            if modo not in ("manual", "matriz") or reemplazo not in ("con_reemplazo", "sin_reemplazo"):
                return JSONResponse(status_code=400, content={"error": "Modo o tipo de extracción inválido"})
            anterior = json.loads(registro.parametros_json or "{}")
            legado = (anterior.get("tema1") or {}).get("reglaMultiplicacion") or {}
            previos = anterior.get("parametros") or legado
            resultado_previo = legado.get("resultado") or {}
            eventos_previos = previos.get("eventos") or resultado_previo.get("events")
            modo_previo = "manual" if isinstance(eventos_previos, list) else (
                resultado_previo.get("modo") or ("matriz" if "colA" in previos else anterior.get("modo"))
            )
            if modo != modo_previo:
                return JSONResponse(status_code=400, content={"error": "No puedes cambiar el modo del historial"})
            if modo == "manual":
                eventos = parametros.get("eventos")
                try:
                    validos = isinstance(eventos, list) and len(eventos) >= 2
                    validos = validos and all(
                        str(evento.get("name", "")).strip() and 0 <= float(evento["prob"]) <= 1
                        for evento in eventos
                    )
                except (KeyError, TypeError, ValueError, AttributeError, OverflowError):
                    validos = False
                if not validos:
                    return JSONResponse(status_code=400, content={"error": "Se necesitan al menos dos eventos con nombres y probabilidades válidas"})
            else:
                filas, variable = obtener_datos_matriz_historial(snapshot)
                columnas = variable.get("nombresColumnas") or ["Valores"]
                if (not filas or parametros.get("colA") not in columnas
                        or parametros.get("colB") not in columnas
                        or not str(parametros.get("valA", "")).strip()
                        or not str(parametros.get("valB", "")).strip()):
                    return JSONResponse(status_code=400, content={"error": "Faltan los datos o las condiciones de las extracciones"})
                indice_a = columnas.index(parametros["colA"])
                indice_b = columnas.index(parametros["colB"])
                valores = [str(fila.get("valor", "") if isinstance(fila, dict) else fila).split(" | ") for fila in filas]
                pares = [fila for fila in valores if len(fila) > max(indice_a, indice_b)
                         and fila[indice_a].strip() and fila[indice_b].strip()]
                if len(pares) < (2 if reemplazo == "sin_reemplazo" else 1):
                    return JSONResponse(status_code=400, content={"error": "No hay suficientes filas válidas para estas extracciones"})
                if reemplazo == "sin_reemplazo" and not any(
                    fila[indice_a].strip() == str(parametros["valA"]) for fila in pares
                ):
                    return JSONResponse(status_code=400, content={"error": "El evento A no tiene casos válidos para condicionar la segunda extracción"})
        elif operacion == "regla_adicion":
            modo = snapshot.get("modo")
            parametros = parametros if isinstance(parametros, dict) else {}
            if modo == "manual":
                try:
                    a, b, interseccion = [float(parametros[clave]) for clave in ("pA", "pB", "pAB")]
                    validos = all(0 <= valor <= 1 for valor in (a, b, interseccion))
                    validos = validos and max(0, a + b - 1) - 1e-12 <= interseccion <= min(a, b)
                except (KeyError, TypeError, ValueError, OverflowError):
                    validos = False
                if not validos:
                    return JSONResponse(status_code=400, content={"error": "Las probabilidades de adición o su intersección no son válidas"})
            elif modo == "matriz":
                filas, variable = obtener_datos_matriz_historial(snapshot)
                columnas = variable.get("nombresColumnas") or ["Valores"]
                if (not filas or parametros.get("colA") not in columnas
                        or parametros.get("colB") not in columnas
                        or parametros.get("colA") == parametros.get("colB")
                        or not str(parametros.get("valA", "")).strip()
                        or not str(parametros.get("valB", "")).strip()):
                    return JSONResponse(status_code=400, content={"error": "Faltan datos o selecciones de los eventos A y B"})
            else:
                return JSONResponse(status_code=400, content={"error": "Modo de adición inválido"})
        elif operacion in ("probabilidad_total", "simulador_total"):
            modo = snapshot.get("modo")
            if modo == "manual":
                ramas = snapshot.get("ramasManuales")
                try:
                    nombres = [str(rama.get("name", "")).strip() for rama in ramas]
                    probabilidades = [(float(rama["pA"]), float(rama["pBA"])) for rama in ramas]
                    validos = len(ramas) >= 2 and all(nombres) and len(set(nombres)) == len(nombres)
                    validos = validos and all(0 <= p <= 1 and 0 <= condicion <= 1 for p, condicion in probabilidades)
                    validos = validos and abs(sum(p for p, _ in probabilidades) - 1) <= 0.0001
                except (TypeError, ValueError, KeyError, AttributeError, OverflowError):
                    validos = False
                if not validos:
                    return JSONResponse(status_code=400, content={"error": "Las causas necesitan nombres únicos y probabilidades válidas cuya suma P(B_i) sea 1"})
            elif modo == "matriz":
                filas, variable = obtener_datos_matriz_historial(snapshot)
                columnas = variable.get("nombresColumnas") or []
                if (not filas or len(columnas) < 2
                        or snapshot.get("colCausa") not in columnas
                        or snapshot.get("colEvento") not in columnas
                        or snapshot.get("colCausa") == snapshot.get("colEvento")
                        or str(snapshot.get("valExito", "")).strip() == ""):
                    return JSONResponse(status_code=400, content={"error": "Faltan datos o selecciones válidas para la matriz de probabilidad total"})
            else:
                return JSONResponse(status_code=400, content={"error": "Modo de probabilidad total inválido"})
        else:
            subtipo = snapshot.get("subTipo")
            modo = snapshot.get("modo")
            if subtipo not in ("clasica", "frecuentista", "condicional") or modo not in ("matriz", "manual", "experimentos"):
                return JSONResponse(status_code=400, content={"error": "Tipo o modo de probabilidad inválido"})
            if modo == "manual":
                try:
                    n = float((parametros or {}).get("manualN", ""))
                    f = float((parametros or {}).get("manualF", ""))
                    validos = 0 <= f <= n and n > 0 and n < float("inf")
                    if subtipo == "condicional":
                        validos = validos and n <= 1
                    else:
                        validos = validos and n.is_integer() and f.is_integer() and n <= 9007199254740991
                except (TypeError, ValueError, OverflowError, AttributeError):
                    validos = False
                if not validos:
                    return JSONResponse(status_code=400, content={"error": "Parámetros manuales de probabilidad inválidos"})
            elif modo == "matriz":
                filas, _ = obtener_datos_matriz_historial(snapshot)
                if not isinstance(filas, list) or not filas or not snapshot.get("eventoFavorable"):
                    return JSONResponse(status_code=400, content={"error": "Faltan los datos o los eventos de la matriz"})
                if subtipo == "condicional" and not snapshot.get("eventoCondicion"):
                    return JSONResponse(status_code=400, content={"error": "Falta la condición B"})
            else:
                experimento = snapshot.get("experimento")
                if subtipo != "clasica" or not isinstance(experimento, dict):
                    return JSONResponse(status_code=400, content={"error": "Configuración de experimento inválida"})
                reglas = experimento.get("reglas")
                fuente = experimento.get("fuente")
                if not isinstance(reglas, list) or not reglas or fuente not in ("teorico", "encuesta"):
                    return JSONResponse(status_code=400, content={"error": "Faltan el origen o las condiciones del experimento"})
                if fuente == "teorico":
                    componentes = experimento.get("componentes")
                    if (not isinstance(componentes, list) or not componentes
                            or any(not isinstance(c, dict) or not c.get("id")
                                   or not str(c.get("nombre", "")).strip()
                                   or not str(c.get("eventos", "")).strip() for c in componentes)):
                        return JSONResponse(status_code=400, content={"error": "Faltan los nombres o eventos de los componentes"})
                else:
                    filas, _ = obtener_datos_matriz_historial(snapshot)
                    if not filas:
                        return JSONResponse(status_code=400, content={"error": "Faltan los datos de la encuesta"})

        # Mantener ID, propietario, operación y fecha de creación del registro.
        registro.nombre_trabajo = obtener_fuente_historial(snapshot, datos.archivo_origen, registro.modulo)
        registro.parametros_json = json.dumps(snapshot, ensure_ascii=False, separators=(",", ":"))
        registro.resultados_json = "{}"
        await db.commit()
        await db.refresh(registro)
        return {
            "message": "Historial actualizado con éxito",
            "registro": {
                "id": registro.id,
                "fecha": registro.fecha_creacion.strftime("%d/%m/%Y") if registro.fecha_creacion else "",
                "hora": registro.fecha_creacion.strftime("%H:%M:%S") if registro.fecha_creacion else "",
                "modulo": registro.modulo,
                "calculo": registro.tipo_analisis,
                **({"nombre_calculo": obtener_nombre_calculo_historial(snapshot, registro.tipo_analisis, registro.modulo)}
                   if str(registro.modulo or "").upper() == "MAT251" else {}),
                "archivo_origen": registro.nombre_trabajo,
                "snapshot": snapshot
            }
        }
    except Exception as e:
        await db.rollback()
        return JSONResponse(status_code=500, content={"error": str(e)})


async def obtener_historial_db(db: AsyncSession, current_user: models.Usuario, modulo: Optional[str] = None):
    try:
        query = (
            select(models.HistorialCalculo)
            .filter(models.HistorialCalculo.usuario_id == current_user.id)
        )

        if modulo and modulo.upper() != "TODOS":
            query = query.filter(models.HistorialCalculo.modulo == modulo.upper())

        query = query.order_by(models.HistorialCalculo.fecha_creacion.desc())

        result = await db.execute(query)
        registros = result.scalars().all()

        historial = []
        for reg in registros:
            # Compatibilidad: si parametros_json tiene datos se usa ese, sino resultados_json
            data_raw = reg.parametros_json if (reg.parametros_json and reg.parametros_json != "{}") else reg.resultados_json
            try:
                snapshot_data = json.loads(data_raw) if data_raw else {}
            except Exception:
                snapshot_data = {}

            historial.append({
                "id": reg.id,
                "fecha": reg.fecha_creacion.strftime("%d/%m/%Y") if reg.fecha_creacion else "",
                "hora": reg.fecha_creacion.strftime("%H:%M:%S") if reg.fecha_creacion else "",
                "modulo": reg.modulo or "MAT151",
                "calculo": reg.tipo_analisis,
                **({"nombre_calculo": obtener_nombre_calculo_historial(snapshot_data, reg.tipo_analisis, reg.modulo)}
                   if str(reg.modulo or "").upper() == "MAT251" else {}),
                "archivo_origen": obtener_fuente_historial(snapshot_data, reg.nombre_trabajo, reg.modulo),
                "snapshot": snapshot_data
            })

        return {"historial": historial}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

async def eliminar_historial_db(db: AsyncSession, registro_id: int, current_user: models.Usuario):
    try:
        result = await db.execute(
            select(models.HistorialCalculo)
            .filter(models.HistorialCalculo.id == registro_id, models.HistorialCalculo.usuario_id == current_user.id)
        )
        registro = result.scalars().first()

        if not registro:
            return JSONResponse(status_code=404, content={"error": "Historial no encontrado o no pertenece al usuario actual"})

        await db.delete(registro)
        await db.commit()

        return {"message": "Registro eliminado con éxito"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
