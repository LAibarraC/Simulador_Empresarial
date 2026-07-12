# api_admin/descripciones.py

descripciones = {
    "MAT151": {
        "tema2": {
            "frecuencia_absoluta": {
                "descripcion": "Número de veces que un dato aparece en el conjunto.",
                "formula": "fi = número de repeticiones de xi",
                "uso": "Se usa para resumir cuántas veces ocurre cada valor."
            },
            "frecuencia_relativa": {
                "descripcion": "Proporción de veces que aparece un dato respecto al total.",
                "formula": "hi = fi / n",
                "uso": "Permite comparar frecuencias en distintos tamaños de muestra."
            },
            "frecuencia_acumulada": {
                "descripcion": "Suma progresiva de las frecuencias absolutas.",
                "formula": "Fi = Σ fi",
                "uso": "Sirve para ver cuántos datos están por debajo de cierto valor."
            },
            "frecuencia_acumulada_relativa": {
                "descripcion": "Suma progresiva de las frecuencias relativas.",
                "formula": "Hi = Σ hi",
                "uso": "Se usa para obtener distribuciones porcentuales acumuladas."
            },
            "tabla_intervalos": {
                "descripcion": "Agrupación de los datos en intervalos con su frecuencia y marca de clase.",
                "formula": "k = 1 + 3.322 * log10(n) (Regla de Sturges)",
                "uso": "Permite organizar grandes volúmenes de datos de manera resumida."
            }
        },
        "tema3": {
            "media": {
                "descripcion": "La media aritmética es el promedio de los datos.",
                "formula": "x̄ = (Σ xi) / n",
                "uso": "Se usa para representar el valor central de un conjunto de datos."
            },
            "media_ponderada": {
                "descripcion": "Promedio que toma en cuenta la importancia (pesos) de cada dato.",
                "formula": "x̄p = (Σ xi·wi) / Σ wi",
                "uso": "Se aplica cuando los datos tienen diferente relevancia o peso."
            },
            "media_geometrica": {
                "descripcion": "Promedio multiplicativo de un conjunto de números positivos.",
                "formula": "x̄g = (Π xi)^(1/n)",
                "uso": "Se usa en tasas de crecimiento, interés compuesto y porcentajes."
            },
            "mediana": {
                "descripcion": "Valor central de los datos ordenados.",
                "formula": "Si n impar → Me = x((n+1)/2), Si n par → Me = (x(n/2) + x((n/2)+1))/2",
                "uso": "Es útil cuando hay valores atípicos que distorsionan la media."
            },
            "moda": {
                "descripcion": "El valor que más se repite en el conjunto de datos.",
                "formula": "Mo = valor con mayor frecuencia",
                "uso": "Se usa en distribuciones categóricas o discretas."
            }
        },
        "tema4": {
            "varianza": {
                "descripcion": "Medida de dispersión que indica la variabilidad de los datos respecto a la media.",
                "formula": "σ² = (Σ (xi - x̄)²) / n",
                "uso": "Permite analizar la variabilidad de los datos."
            },
            "desviacion_estandar": {
                "descripcion": "Raíz cuadrada de la varianza. Expresada en las mismas unidades que los datos.",
                "formula": "σ = √((Σ (xi - x̄)²) / n)",
                "uso": "Se usa para interpretar la variabilidad de manera más clara que la varianza."
            },
            "rango": {
                "descripcion": "Diferencia entre el valor máximo y el mínimo de los datos.",
                "formula": "R = Xmax - Xmin",
                "uso": "Se usa como medida rápida de dispersión, aunque sensible a valores extremos."
            },
            "coeficiente_variacion": {
                "descripcion": "Medida relativa de dispersión expresada en porcentaje.",
                "formula": "CV = (σ / x̄) × 100%",
                "uso": "Permite comparar la variabilidad entre conjuntos de datos con diferentes escalas."
            }
        },
        "tema5": {
            "covarianza": {
                "descripcion": "Indica cómo varían conjuntamente dos variables.",
                "formula": "Cov(X,Y) = (Σ (xi - x̄)(yi - ȳ)) / n",
                "uso": "Mide la relación lineal entre dos variables (positiva, negativa o nula)."
            },
            "correlacion": {
                "descripcion": "Mide la fuerza y dirección de la relación lineal entre dos variables.",
                "formula": "r = Cov(X,Y) / (σx·σy)",
                "uso": "Se usa para cuantificar la relación entre dos variables (entre -1 y 1)."
            },
            "regresion_lineal": {
                "descripcion": "Encuentra la recta que mejor ajusta la relación entre X e Y.",
                "formula": "y = a + bx",
                "uso": "Se aplica para predecir valores de Y en función de X."
            }
        }
    }
}
