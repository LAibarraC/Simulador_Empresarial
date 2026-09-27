import numpy as np
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import scipy.stats as stats

router = APIRouter(prefix="/mat251/tema5", tags=["MAT251 - Tema 5"])


class SimulacionRequest(BaseModel):
    distribucion: str
    paramsDist: dict
    n: int
    numSimulaciones: int
    parametro: str


@router.post("/simulacion")
def ejecutar_simulacion(data: SimulacionRequest):
    """
    Ejecuta la simulacion de estimacion puntual en el servidor usando NumPy.
    Reemplaza el Web Worker del frontend para mayor precision y consistencia.
    """
    distribucion = data.distribucion
    params = data.paramsDist
    n = data.n
    num_sim = data.numSimulaciones
    parametro = data.parametro

    # Validaciones
    if n <= 0:
        return {"success": False, "error": "El tamano de muestra debe ser mayor a 0."}
    if num_sim <= 0 or num_sim > 100000:
        return {"success": False, "error": "Numero de simulaciones invalido (1 - 100000)."}
    if parametro == "varianza" and n < 2:
        return {"success": False, "error": "El tamano de muestra debe ser al menos 2 para varianza."}

    # Calcular parametro verdadero
    parametro_verdadero = None
    if parametro == "media":
        if distribucion == "normal":    parametro_verdadero = params.get("mu")
        if distribucion == "uniforme":  parametro_verdadero = (params.get("a", 0) + params.get("b", 1)) / 2
        if distribucion == "poisson":   parametro_verdadero = params.get("lambda")
        if distribucion == "bernoulli": parametro_verdadero = params.get("p")
        if distribucion == "binomial":  parametro_verdadero = params.get("n_ensayos", 1) * params.get("p", 0)
    elif parametro == "proporcion":
        if distribucion in ("bernoulli", "binomial"): parametro_verdadero = params.get("p")
    elif parametro == "varianza":
        if distribucion == "normal":
            parametro_verdadero = params.get("sigma", 1) ** 2
        if distribucion == "poisson":
            parametro_verdadero = params.get("lambda")
        if distribucion == "bernoulli":
            p_val = params.get("p", 0)
            parametro_verdadero = p_val * (1 - p_val)
        if distribucion == "uniforme":
            parametro_verdadero = (params.get("b", 1) - params.get("a", 0)) ** 2 / 12

    try:
        rng = np.random.default_rng()

        # Generar matriz de muestras: (num_sim, n) — vectorizado, muy rapido
        if distribucion == "normal":
            muestras = rng.normal(loc=params["mu"], scale=params["sigma"], size=(num_sim, n))
        elif distribucion == "uniforme":
            muestras = rng.uniform(low=params["a"], high=params["b"], size=(num_sim, n))
        elif distribucion == "poisson":
            muestras = rng.poisson(lam=params["lambda"], size=(num_sim, n))
        elif distribucion == "bernoulli":
            muestras = rng.binomial(n=1, p=params["p"], size=(num_sim, n))
        elif distribucion == "binomial":
            muestras = rng.binomial(n=int(params["n_ensayos"]), p=params["p"], size=(num_sim, n))
        else:
            return {"success": False, "error": f"Distribucion '{distribucion}' no soportada."}

        # Calcular estimador para cada simulacion
        if parametro == "media":
            estimadores = np.mean(muestras, axis=1)
        elif parametro == "proporcion":
            estimadores = np.mean(muestras, axis=1)
        elif parametro == "varianza":
            estimadores = np.var(muestras, axis=1, ddof=1)
        else:
            return {"success": False, "error": f"Parametro '{parametro}' no soportado."}

        estimadores_list = estimadores.tolist()
        media_estimadores = float(np.mean(estimadores))
        var_estimadores = float(np.var(estimadores, ddof=1)) if num_sim > 1 else 0.0
        sesgo = float(media_estimadores - parametro_verdadero) if parametro_verdadero is not None else None

        return {
            "success": True,
            "resultado": {
                "simulaciones": estimadores_list,
                "media_estimadores": media_estimadores,
                "varianza_estimadores": var_estimadores,
                "parametro_verdadero": parametro_verdadero,
                "sesgo": sesgo,
                "n": n,
                "numSimulaciones": num_sim,
                "distribucion": distribucion,
                "parametro": parametro,
            }
        }

    except KeyError as e:
        return {"success": False, "error": f"Parametro faltante para la distribucion: {e}"}
    except Exception as e:
        return {"success": False, "error": f"Error durante la simulacion: {str(e)}"}


# ============================================================
# SIMULACION DE INTERVALOS DE CONFIANZA
# ============================================================

class SimulacionIntervalosRequest(BaseModel):
    distribucion: str
    paramsDist: dict
    n: int
    numSimulaciones: int
    parametro: str
    confianza: float
    sigmaConocida: bool = False

@router.post("/simulacion-intervalos")
def ejecutar_simulacion_intervalos(data: SimulacionIntervalosRequest):
    distribucion = data.distribucion
    params = data.paramsDist
    n = data.n
    num_sim = data.numSimulaciones
    parametro = data.parametro
    confianza = data.confianza
    sigma_conocida = data.sigmaConocida

    # Validaciones
    if n <= 0:
        return {"success": False, "error": "El tamano de muestra debe ser mayor a 0."}
    if num_sim <= 0 or num_sim > 100000:
        return {"success": False, "error": "Numero de simulaciones invalido (1 - 100000)."}

    # Calcular parametro verdadero
    parametro_verdadero = None
    sigma_poblacional = None

    if distribucion == "normal":
        if parametro == "media": parametro_verdadero = params.get("mu")
        if parametro == "varianza": parametro_verdadero = params.get("sigma", 1) ** 2
        sigma_poblacional = params.get("sigma", 1)
    elif distribucion == "bernoulli":
        p_val = params.get("p", 0)
        if parametro in ("media", "proporcion"): parametro_verdadero = p_val
        if parametro == "varianza": parametro_verdadero = p_val * (1 - p_val)
    elif distribucion == "poisson":
        if parametro in ("media", "varianza"): parametro_verdadero = params.get("lambda")
    elif distribucion == "uniforme":
        a_val = params.get("a", 0)
        b_val = params.get("b", 1)
        if parametro == "media": parametro_verdadero = (a_val + b_val) / 2
        if parametro == "varianza": parametro_verdadero = (b_val - a_val) ** 2 / 12
    elif distribucion == "binomial":
        p_val = params.get("p", 0)
        n_ens = params.get("n_ensayos", 1)
        if parametro == "media": parametro_verdadero = n_ens * p_val
        if parametro == "proporcion": parametro_verdadero = p_val
        if parametro == "varianza": parametro_verdadero = n_ens * p_val * (1 - p_val)

    try:
        rng = np.random.default_rng()

        # Generar matriz de muestras: (num_sim, n)
        if distribucion == "normal":
            muestras = rng.normal(loc=params["mu"], scale=params["sigma"], size=(num_sim, n))
        elif distribucion == "uniforme":
            muestras = rng.uniform(low=params["a"], high=params["b"], size=(num_sim, n))
        elif distribucion == "poisson":
            muestras = rng.poisson(lam=params["lambda"], size=(num_sim, n))
        elif distribucion == "bernoulli":
            muestras = rng.binomial(n=1, p=params["p"], size=(num_sim, n))
        elif distribucion == "binomial":
            muestras = rng.binomial(n=int(params["n_ensayos"]), p=params["p"], size=(num_sim, n))
        else:
            return {"success": False, "error": f"Distribucion '{distribucion}' no soportada."}

        alpha = 1.0 - (confianza / 100.0)
        
        simulaciones = []
        contienen_verdadero = 0

        # Calcular estimadores base vectorizados (mas rapido que iterar uno por uno)
        if parametro == "media":
            medias = np.mean(muestras, axis=1)
            desviaciones = np.std(muestras, axis=1, ddof=1) if n > 1 else np.zeros(num_sim)
            
            for i in range(num_sim):
                x_bar = float(medias[i])
                s_val = float(sigma_poblacional) if sigma_conocida else float(desviaciones[i])
                error_estandar = s_val / np.sqrt(n)
                
                if sigma_conocida:
                    valor_critico = stats.norm.ppf(1 - alpha/2)
                else:
                    if n >= 30:
                        valor_critico = stats.norm.ppf(1 - alpha/2)
                    else:
                        if n < 2:
                            raise ValueError("Para t de Student, n debe ser al menos 2.")
                        valor_critico = stats.t.ppf(1 - alpha/2, df=n-1)
                    
                margen_error = float(valor_critico * error_estandar)
                LI = float(x_bar - margen_error)
                LS = float(x_bar + margen_error)
                
                contiene = False
                if parametro_verdadero is not None:
                    contiene = (LI <= parametro_verdadero <= LS)
                    if contiene: contienen_verdadero += 1
                    
                simulaciones.append({
                    "simulacion": i + 1,
                    "muestra": None, # se optimiza la red
                    "estimacionPuntual": float(x_bar),
                    "LI": LI,
                    "LS": LS,
                    "errorEstandar": float(error_estandar),
                    "margenError": margen_error,
                    "contiene": contiene,
                    "error": None
                })
                
        elif parametro == "proporcion":
            exitos = np.sum(muestras, axis=1)
            total_ensayos = n
            if distribucion == "binomial":
                total_ensayos = n * params["n_ensayos"]
                
            for i in range(num_sim):
                x_val = float(exitos[i])
                p_hat = x_val / total_ensayos
                
                valor_critico = stats.norm.ppf(1 - alpha/2)
                error_estandar = np.sqrt((p_hat * (1 - p_hat)) / total_ensayos)
                margen_error = float(valor_critico * error_estandar)
                
                LI = float(p_hat - margen_error)
                LS = float(p_hat + margen_error)
                
                contiene = False
                if parametro_verdadero is not None:
                    contiene = (LI <= parametro_verdadero <= LS)
                    if contiene: contienen_verdadero += 1
                    
                simulaciones.append({
                    "simulacion": i + 1,
                    "muestra": None,
                    "estimacionPuntual": float(p_hat),
                    "LI": LI,
                    "LS": LS,
                    "errorEstandar": float(error_estandar),
                    "margenError": margen_error,
                    "contiene": contiene,
                    "error": None
                })
                
        elif parametro == "varianza":
            if n < 2:
                return {"success": False, "error": "Para estimar varianza n debe ser al menos 2."}
            varianzas = np.var(muestras, axis=1, ddof=1)
            gl = n - 1
            critico_inf = stats.chi2.ppf(alpha/2, gl)
            critico_sup = stats.chi2.ppf(1 - alpha/2, gl)
            
            for i in range(num_sim):
                s2 = float(varianzas[i])
                numerador = gl * s2
                
                # Cuidado: chi2 critico inf divide a LS, critico sup divide a LI (al reves)
                LI = float(numerador / critico_sup)
                LS = float(numerador / critico_inf)
                
                contiene = False
                if parametro_verdadero is not None:
                    contiene = (LI <= parametro_verdadero <= LS)
                    if contiene: contienen_verdadero += 1
                    
                simulaciones.append({
                    "simulacion": i + 1,
                    "muestra": None,
                    "estimacionPuntual": float(s2),
                    "LI": LI,
                    "LS": LS,
                    "errorEstandar": None,
                    "margenError": None,
                    "contiene": contiene,
                    "error": None
                })
                
        cobertura = (contienen_verdadero / num_sim) * 100 if num_sim > 0 else 0

        return {
            "success": True,
            "resultado": {
                "parametro": parametro,
                "parametroVerdadero": parametro_verdadero,
                "distribucion": distribucion,
                "paramsDist": params,
                "confianza": confianza,
                "n": n,
                "simulaciones": simulaciones,
                "resumen": {
                    "total": num_sim,
                    "contienen": contienen_verdadero,
                    "noContienen": num_sim - contienen_verdadero,
                    "cobertura": cobertura
                }
            }
        }

    except Exception as e:
        return {"success": False, "error": f"Error durante la simulacion de intervalos: {str(e)}"}
