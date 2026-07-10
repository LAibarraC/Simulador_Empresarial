import statistics
import math
import numpy as np  # Para percentiles

# ================================
# Funciones Tema 2 (Distribución de Frecuencias)
# ================================

def calcular_desviacion(datos):
    return {"resultado": statistics.stdev(datos)}

def calcular_frecuencia_absoluta(datos):
    tabla = {}
    for x in datos:
        tabla[x] = tabla.get(x, 0) + 1
    return {"resultado": [{"valor": k, "f": v} for k, v in sorted(tabla.items())]}

def calcular_frecuencia_relativa(datos):
    tabla = {}
    for x in datos:
        tabla[x] = tabla.get(x, 0) + 1
    n = len(datos)
    return {"resultado": [{"valor": k, "h": v / n} for k, v in sorted(tabla.items())]}

def calcular_frecuencia_acumulada(datos):
    tabla = {}
    for x in datos:
        tabla[x] = tabla.get(x, 0) + 1
    acumulada = 0
    resultado = []
    for k, v in sorted(tabla.items()):
        acumulada += v
        resultado.append({"valor": k, "F": acumulada})
    return {"resultado": resultado}

def calcular_frecuencia_acumulada_relativa(datos):
    tabla = {}
    for x in datos:
        tabla[x] = tabla.get(x, 0) + 1
    n = len(datos)
    acumulada = 0
    resultado = []
    for k, v in sorted(tabla.items()):
        acumulada += v / n
        resultado.append({"valor": k, "H": acumulada})
    return {"resultado": resultado}

# ================================
# Intervalos de clase y marcas
# ================================

def calcular_numero_clases(datos):
    """Número de clases por la regla de Sturges"""
    n = len(datos)
    if n <= 1:
        return 1
    return round(1 + 3.322 * math.log10(n))

def tabla_por_clases(datos):
    """
    Construye tabla de distribución de frecuencias por intervalos (agrupados)
    con marcas de clase, frecuencias absolutas, relativas y acumuladas.
    """
    n = len(datos)
    if n == 0:
        return []

    minimo = min(datos)
    maximo = max(datos)
    R = maximo - minimo               # Rango
    k = calcular_numero_clases(datos) # Número de clases
    c = math.ceil(R / k)              # Amplitud (redondeada hacia arriba)

    # Construir intervalos (último cerrado)
    intervalos = []
    inicio = minimo
    for i in range(k):
        fin = inicio + c
        if i == k - 1:
            # Último intervalo cerrado
            intervalos.append((inicio, maximo))
        else:
            intervalos.append((inicio, fin))
        inicio = fin

    # Calcular frecuencias
    tabla = []
    F = 0
    Fr = 0
    for i, (a, b) in enumerate(intervalos):
        if i == len(intervalos) - 1:
            # último intervalo cerrado: incluye el máximo
            freq = sum(1 for x in datos if a <= x <= b)
        else:
            # intervalos semiabiertos [a, b)
            freq = sum(1 for x in datos if a <= x < b)

        F += freq
        fr = freq / n
        Fr += fr
        xi = (a + b) / 2
        ancho = b - a if (b - a) != 0 else 1
        densidad = freq / ancho

        tabla.append({
            "intervalo": f"{a}-{b}",
            "xi": xi,
            "f": freq,
            "fr": round(fr, 3),
            "F": F,
            "Fr": round(Fr, 3),
            "densidad": round(densidad, 6)
        })

    return tabla


# ========================
# Cálculos nuevos para Tema2
# ========================

# Mínimo
def calcular_minimo(datos):
    if len(datos) == 0:
        return {"error": "No se enviaron datos"}
    return {"resultado": min(datos)}

# Máximo
def calcular_maximo(datos):
    if len(datos) == 0:
        return {"error": "No se enviaron datos"}
    return {"resultado": max(datos)}

# Cuartiles (Q1, Q2, Q3)
def calcular_cuartiles(datos):
    if len(datos) == 0:
        return {"error": "No se enviaron datos"}
    Q1 = np.percentile(datos, 25)
    Q2 = np.percentile(datos, 50)  # Mediana
    Q3 = np.percentile(datos, 75)
    return {"Q1": Q1, "Q2": Q2, "Q3": Q3}

# Percentil general
def calcular_percentil(datos, p):
    """
    p: porcentaje entre 0 y 100
    """
    if len(datos) == 0:
        return {"error": "No se enviaron datos"}
    if not (0 <= p <= 100):
        return {"error": "Percentil debe estar entre 0 y 100"}
    valor = np.percentile(datos, p)
    return {"percentil": p, "valor": valor}

# Rango intercuartílico (IQR = Q3 - Q1)
def calcular_rango_intercuartilico(datos):
    if len(datos) == 0:
        return {"error": "No se enviaron datos"}
    Q1 = np.percentile(datos, 25)
    Q3 = np.percentile(datos, 75)
    IQR = Q3 - Q1
    return {"IQR": IQR, "Q1": Q1, "Q3": Q3}