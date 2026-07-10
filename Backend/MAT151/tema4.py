
import statistics


def calcular_varianza(datos):
    if len(datos) < 2:
        return {"error": "Se requieren al menos 2 datos para calcular varianza"}
    var = statistics.variance(datos)
    return {"resultado": var}

def calcular_desviacion(datos):
    if len(datos) < 2:
        return {"error": "Se requieren al menos 2 datos para calcular desviación estándar"}
    std = statistics.stdev(datos)
    return {"resultado": std}

def calcular_rango(datos):
    if len(datos) == 0:
        return {"error": "No se enviaron datos"}
    rango = max(datos) - min(datos)
    return {"resultado": rango}

# Opcional: coeficiente de variación
def calcular_coef_variacion(datos):
    if len(datos) < 2:
        return {"error": "Se requieren al menos 2 datos"}
    media = statistics.mean(datos)
    if media == 0:
        return {"error": "No se puede calcular coeficiente de variación con media cero"}
    std = statistics.stdev(datos)
    cv = std / media
    return {"resultado": cv}
