import statistics
from typing import List

# Covarianza
def calcular_covarianza(x: List[float], y: List[float]):
    if len(x) != len(y) or len(x) == 0:
        return {"error": "Las listas deben tener la misma longitud y no estar vacías"}
    
    n = len(x)
    media_x = statistics.mean(x)
    media_y = statistics.mean(y)
    cov = sum((xi - media_x)*(yi - media_y) for xi, yi in zip(x, y)) / n
    return {"resultado": cov}

# Coeficiente de correlación de Pearson
def calcular_correlacion(x: List[float], y: List[float]):
    if len(x) != len(y) or len(x) == 0:
        return {"error": "Las listas deben tener la misma longitud y no estar vacías"}
    
    n = len(x)
    media_x = statistics.mean(x)
    media_y = statistics.mean(y)
    cov = sum((xi - media_x)*(yi - media_y) for xi, yi in zip(x, y)) / n
    std_x = statistics.stdev(x)
    std_y = statistics.stdev(y)
    if std_x == 0 or std_y == 0:
        return {"error": "Desviación estándar cero, correlación no definida"}
    r = cov / (std_x * std_y)
    return {"resultado": r}

# Regresión lineal simple
def calcular_regresion_lineal(x: List[float], y: List[float]):
    if len(x) != len(y) or len(x) == 0:
        return {"error": "Las listas deben tener la misma longitud y no estar vacías"}
    
    n = len(x)
    media_x = statistics.mean(x)
    media_y = statistics.mean(y)
    
    numerador = sum((xi - media_x)*(yi - media_y) for xi, yi in zip(x, y))
    denominador = sum((xi - media_x)**2 for xi in x)
    
    if denominador == 0:
        return {"error": "No se puede calcular pendiente, denominador cero"}
    
    b = numerador / denominador  # pendiente
    a = media_y - b * media_x    # intercepto
    return {"pendiente": b, "intercepto": a}
