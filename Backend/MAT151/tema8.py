import pandas as pd

# Datos originales
datos = [
    6, 8, 8, 15, 6, 6, 7, 1, 8, 20,
    5, 2, 4, 5, 4, 6, 4, 6, 8, 2,
    7, 4, 4, 2, 1, 15, 1, 4, 30, 1
]

# Paso 1: convertir a DataFrame
df = pd.DataFrame({"x_i": datos})
N = len(datos)

# Paso 2: tabla de frecuencias absolutas
frecuencias = df["x_i"].value_counts().sort_index().reset_index()
frecuencias.columns = ["x_i", "f_i"]

# Frecuencia acumulada
frecuencias["F_i"] = frecuencias["f_i"].cumsum()

# Frecuencia acumulada inversa
frecuencias["F_i_inv"] = frecuencias["f_i"][::-1].cumsum()[::-1].reset_index(drop=True)

# Paso 3: porcentajes
frecuencias["p_i (%)"] = frecuencias["f_i"] / N * 100
frecuencias["P_i (%)"] = frecuencias["p_i (%)"].cumsum()
frecuencias["P_i_inv (%)"] = frecuencias["p_i (%)"][::-1].cumsum()[::-1].reset_index(drop=True)

# Mostrar tablas
print("=== Datos originales ===")
print(df.to_string(index=False))

print("\n=== Tabla de frecuencias absolutas ===")
print(frecuencias[["x_i", "f_i", "F_i", "F_i_inv"]])

print("\n=== Tabla de porcentajes ===")
print(frecuencias[["x_i", "f_i", "F_i", "F_i_inv", "p_i (%)", "P_i (%)", "P_i_inv (%)"]])
