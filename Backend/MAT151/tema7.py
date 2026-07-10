# MAT151/tema7.py
import numpy as np
import pandas as pd

# ======================
# Promedio Móvil Simple
# ======================
def promedio_movil_simple(datos, n=3):
    if len(datos) < n:
        return {"error": "La serie es más corta que la ventana del promedio móvil"}
    series = pd.Series(datos)
    pm = series.rolling(window=n).mean().tolist()
    return {"tipo": "promedio_movil_simple", "resultado": [round(x, 5) if x is not None else None for x in pm]}

# ======================
# Promedio Móvil Ponderado
# ======================
def promedio_movil_ponderado(datos, pesos=None):
    datos = np.array(datos)
    if pesos is None:
        pesos = np.arange(1, len(datos)+1)
    else:
        pesos = np.array(pesos)
        if len(pesos) != len(datos):
            return {"error": "La lista de pesos debe tener el mismo tamaño que los datos"}
    wma = np.cumsum(datos * pesos) / np.cumsum(pesos)
    return {"tipo": "promedio_movil_ponderado", "resultado": [round(x, 5) for x in wma.tolist()]}

# ======================
# Suavizamiento Exponencial Simple
# ======================
def suavizamiento_exponencial(datos, alpha=0.5):
    datos = np.array(datos)
    S = [datos[0]]
    for t in range(1, len(datos)):
        S.append(alpha * datos[t] + (1 - alpha) * S[-1])
    return {"tipo": "suavizamiento_exponencial", "resultado": [round(x, 5) for x in S]}

# ======================
# Índices Estacionales
# ======================
def indices_estacionales(datos, periodo=12):
    datos = np.array(datos)
    n = len(datos)
    if n < periodo:
        return {"error": "La serie es más corta que el período estacional"}
    indices = [datos[i] / np.mean(datos[i::periodo]) for i in range(n)]
    return {"tipo": "indices_estacionales", "resultado": [round(x,5) for x in indices]}

# ======================
# Autocorrelación
# ======================
def autocorrelacion(datos, k=1):
    datos = np.array(datos)
    n = len(datos)
    if k >= n:
        return {"error": "El desfase k debe ser menor que el tamaño de la serie"}
    datos_mean = np.mean(datos)
    num = np.sum((datos[:n-k] - datos_mean) * (datos[k:] - datos_mean))
    den = np.sum((datos - datos_mean)**2)
    ac = num / den
    return {"tipo": f"autocorrelacion_k_{k}", "resultado": round(float(ac), 5)}

# ======================
# Pronóstico Básico
# ======================
def pronostico_basico(datos, n=1):
    datos = np.array(datos)
    if len(datos) == 0:
        return {"error": "No se enviaron datos"}
    media = np.mean(datos)
    pred = [media] * n
    return {"tipo": "pronostico_basico", "resultado": [round(x, 5) for x in pred]}
