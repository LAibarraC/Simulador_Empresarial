
import statistics
import math


def calcular_media(datos):
    return {"resultado": statistics.mean(datos)}

# Media ponderada
def calcular_media_ponderada(datos, pesos):
    if len(datos) != len(pesos) or len(datos) == 0:
        return {"error": "Los datos y pesos deben tener la misma longitud y no estar vacíos"}
    suma_pesos = sum(pesos)
    media = sum(x * w for x, w in zip(datos, pesos)) / suma_pesos
    return {"resultado": media}

# Media geométrica
def calcular_media_geometrica(datos):
    if any(x <= 0 for x in datos):
        return {"error": "Todos los datos deben ser positivos para la media geométrica"}
    producto = math.prod(datos)
    n = len(datos)
    media = producto ** (1/n)
    return {"resultado": media}

def calcular_mediana(datos):
    return {"resultado": statistics.median(datos)}

def calcular_moda(datos):
    return {"resultado": statistics.mode(datos)}

# ================================
# Tema 3 - Medidas para datos agrupados
# ================================

import math

# ============================
# MEDIA AGRUPADA
# ============================
def media_agrupada(datos: list[float]) -> dict:
    datos.sort()
    n = len(datos)

    # Número de clases (regla de Sturges)
    k = int(1 + 3.322 * math.log10(n))
    rango = max(datos) - min(datos)
    amplitud = math.ceil(rango / k)

    # Construcción de intervalos
    li = min(datos)
    tabla = []
    for i in range(k):
        ls = li + amplitud
        marca = (li + ls) / 2
        fi = sum(1 for d in datos if li <= d < ls) if i < k-1 else sum(1 for d in datos if li <= d <= ls)
        tabla.append({"li": li, "ls": ls, "marca": marca, "fi": fi})
        li = ls

    # Cálculo de la media agrupada
    N = sum(f["fi"] for f in tabla)
    suma_fx = sum(f["marca"] * f["fi"] for f in tabla)
    media = suma_fx / N if N > 0 else None

    return {"media_agrupada": media, "tabla": tabla}


# ============================
# MEDIANA AGRUPADA
# ============================
def mediana_agrupada(datos: list[float]) -> dict:
    datos.sort()
    n = len(datos)

    k = int(1 + 3.322 * math.log10(n))
    rango = max(datos) - min(datos)
    amplitud = math.ceil(rango / k)

    li = min(datos)
    tabla = []
    for i in range(k):
        ls = li + amplitud
        marca = (li + ls) / 2
        fi = sum(1 for d in datos if li <= d < ls) if i < k-1 else sum(1 for d in datos if li <= d <= ls)
        tabla.append({"li": li, "ls": ls, "marca": marca, "fi": fi})
        li = ls

    N = sum(f["fi"] for f in tabla)
    F = 0
    mediana = None
    for f in tabla:
        if F + f["fi"] >= N/2:
            Li = f["li"]
            Fi = F
            f_med = f["fi"]
            mediana = Li + ((N/2 - Fi) / f_med) * amplitud
            break
        F += f["fi"]

    return {"mediana_agrupada": mediana, "tabla": tabla}


# ============================
# MODA AGRUPADA
# ============================
def moda_agrupada(datos: list[float]) -> dict:
    datos.sort()
    n = len(datos)

    k = int(1 + 3.322 * math.log10(n))
    rango = max(datos) - min(datos)
    amplitud = math.ceil(rango / k)

    li = min(datos)
    tabla = []
    for i in range(k):
        ls = li + amplitud
        marca = (li + ls) / 2
        fi = sum(1 for d in datos if li <= d < ls) if i < k-1 else sum(1 for d in datos if li <= d <= ls)
        tabla.append({"li": li, "ls": ls, "marca": marca, "fi": fi})
        li = ls

    # Encontrar clase modal
    f_max = max(tabla, key=lambda f: f["fi"])
    i = tabla.index(f_max)
    Li = f_max["li"]
    fm = f_max["fi"]
    f1 = tabla[i-1]["fi"] if i > 0 else 0
    f2 = tabla[i+1]["fi"] if i < len(tabla)-1 else 0

    moda = Li + ((fm - f1) / ((fm - f1) + (fm - f2))) * amplitud if fm > 0 else None

    return {"moda_agrupada": moda, "tabla": tabla}
