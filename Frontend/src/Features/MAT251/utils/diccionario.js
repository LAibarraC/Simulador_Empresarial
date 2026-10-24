// src/features/MAT251/utils/diccionario.js
// Glosario estadístico y probabilístico interactivo para MAT251 (Probabilidad y Estadística)

export const glosarioMAT251 = {
    // ==========================================
    // TEMA 2: VARIABLES ALEATORIAS DISCRETAS
    // ==========================================
    "X": {
        texto: "Variable Aleatoria Discreta",
        math: "X \\in \\{x_1, x_2, \\dots, x_n\\}"
    },
    "x_i": {
        texto: "Valor de la Variable Aleatoria",
        math: "x_i"
    },
    "P(X)": {
        texto: "Función de Probabilidad P(X)",
        math: "P(X = x_i) = p_i, \\quad \\sum p_i = 1"
    },
    "p_i": {
        texto: "Probabilidad Puntual",
        math: "P(X = x_i) \\ge 0"
    },
    "f_i": {
        texto: "Frecuencia Absoluta (Conteo)",
        math: "f_i"
    },
    "F(x)": {
        texto: "Función de Distribución Acumulada (FDA)",
        math: "F(x) = P(X \\le x) = \\sum_{x_i \\le x} P(X = x_i)"
    },
    "E(X)": {
        texto: "Esperanza Matemática (Media)",
        math: "E(X) = \\mu = \\sum x_i \\cdot P(X = x_i)"
    },
    "xi_pi": {
        texto: "Ponderación para la Esperanza",
        math: "x_i \\cdot P(x_i)"
    },
    "xi2_pi": {
        texto: "Ponderación del Segundo Momento",
        math: "x_i^2 \\cdot P(x_i)"
    },
    "E(X^2)": {
        texto: "Segundo Momento Respecto al Origen",
        math: "E(X^2) = \\sum x_i^2 \\cdot P(X = x_i)"
    },
    "V(X)": {
        texto: "Varianza de la Variable Aleatoria",
        math: "V(X) = \\sigma^2 = E(X^2) - [E(X)]^2"
    },
    "sigma": {
        texto: "Desviación Estándar",
        math: "\\sigma = \\sqrt{V(X)}"
    },
    "CV": {
        texto: "Coeficiente de Variación",
        math: "CV = \\frac{\\sigma}{\\mu} \\times 100\\%"
    },
    "E(aX+b)": {
        texto: "Propiedad Lineal de la Esperanza",
        math: "E(aX + b) = a \\cdot E(X) + b"
    },
    "V(aX+b)": {
        texto: "Propiedad de Escala de la Varianza",
        math: "V(aX + b) = a^2 \\cdot V(X)"
    },
    "Momento_r": {
        texto: "Momento de Orden r Respecto al Origen",
        math: "\\alpha_r = E(X^r) = \\sum x_i^r \\cdot P(X = x_i)"
    },

    // ==========================================
    // TEMA 2: VARIABLES ALEATORIAS CONTINUAS
    // ==========================================
    "f(x)": {
        texto: "Función de Densidad de Probabilidad (FDP)",
        math: "f(x) \\ge 0, \\quad \\int_{-\\infty}^{\\infty} f(x)\\,dx = 1"
    },
    "F_continua": {
        texto: "Distribución Acumulada Continua",
        math: "F(x) = \\int_{-\\infty}^{x} f(t)\\,dt"
    },
    "E_continua": {
        texto: "Esperanza Matemática Continua",
        math: "E(X) = \\int_{-\\infty}^{\\infty} x \\cdot f(x)\\,dx"
    },
    "V_continua": {
        texto: "Varianza Continua",
        math: "V(X) = \\int_{-\\infty}^{\\infty} (x - \\mu)^2 f(x)\\,dx"
    },

    // ==========================================
    // TEMA 1: TEORÍA DE PROBABILIDAD
    // ==========================================
    "Omega": {
        texto: "Espacio muestral",
        math: "\\Omega = \\{\\omega_1, \\omega_2, \\ldots, \\omega_n\\}"
    },
    "P(A)": {
        texto: "Probabilidad Clásica del Evento A",
        math: "P(A) = \\frac{n(A)}{n(S)}"
    },
    "P(A_union_B)": {
        texto: "Regla de Adición de Probabilidades",
        math: "P(A \\cup B) = P(A) + P(B) - P(A \\cap B)"
    },
    "P(A_inter_B)": {
        texto: "Regla de Multiplicación (Intersección)",
        math: "P(A \\cap B) = P(A) \\cdot P(B|A)"
    },
    "P(A|B)": {
        texto: "Probabilidad Condicional",
        math: "P(A|B) = \\frac{P(A \\cap B)}{P(B)}, \\quad P(B) > 0"
    },
    "Prob_Total": {
        texto: "Teorema de la Probabilidad Total",
        math: "P(B) = \\sum_{i=1}^k P(A_i) \\cdot P(B|A_i)"
    },
    "Bayes": {
        texto: "Teorema de Bayes",
        math: "P(A_i|B) = \\frac{P(A_i) \\cdot P(B|A_i)}{\\sum P(A_j) \\cdot P(B|A_j)}"
    },

    // ==========================================
    // TEMA 3: MODELOS DE DISTRIBUCIÓN
    // ==========================================
    "N": {
        texto: "Total de Registros",
        math: "N"
    },
    "x": {
        texto: "Ocurrencias (Éxito)",
        math: "x"
    },
    "p": {
        texto: "Probabilidad de Éxito",
        math: "p = \\frac{x}{N}"
    },
    "K": {
        texto: "Éxitos en Población",
        math: "K"
    },
    "lambda": {
        texto: "Media de Ocurrencias",
        math: "\\lambda = \\frac{\\sum x_i}{N}"
    },
    "a": {
        texto: "Límite Inferior (Mínimo)",
        math: "a = \\min(X)"
    },
    "b": {
        texto: "Límite Superior (Máximo)",
        math: "b = \\max(X)"
    },
    "a_i": {
        texto: "Límite Inferior",
        math: "a_i"
    },
    "b_i": {
        texto: "Límite Superior",
        math: "b_i"
    },
    "mu": {
        texto: "Media Aritmética (Localización)",
        math: "\\mu = \\bar{X}"
    },
    "v": {
        texto: "Grados de Libertad",
        math: "v"
    },

    // Bernoulli
    "Bernoulli": {
        texto: "Distribución de Bernoulli",
        math: "P(X = x) = p^x (1-p)^{1-x}, \\quad x \\in \\{0, 1\\}"
    },
    "P_Bernoulli": {
        texto: "Distribución de Bernoulli",
        math: "P(X = x) = p^x (1-p)^{1-x}, \\quad x \\in \\{0, 1\\}"
    },
    "E_Bernoulli": {
        texto: "Esperanza Matemática (Bernoulli)",
        math: "E(X) = p"
    },
    "V_Bernoulli": {
        texto: "Varianza (Bernoulli)",
        math: "V(X) = p(1 - p)"
    },
    "sigma_Bernoulli": {
        texto: "Desviación Estándar (Bernoulli)",
        math: "\\sigma = \\sqrt{p(1 - p)}"
    },

    // Binomial
    "Binomial": {
        texto: "Distribución Binomial",
        math: "P(X = x) = \\binom{n}{x} p^x (1-p)^{n-x}"
    },
    "P_Binomial": {
        texto: "Distribución Binomial",
        math: "P(X = x) = \\binom{n}{x} p^x (1-p)^{n-x}"
    },
    "E_Binomial": {
        texto: "Esperanza Matemática (Binomial)",
        math: "E(X) = n \\cdot p"
    },
    "V_Binomial": {
        texto: "Varianza (Binomial)",
        math: "V(X) = n \\cdot p(1 - p)"
    },
    "sigma_Binomial": {
        texto: "Desviación Estándar (Binomial)",
        math: "\\sigma = \\sqrt{n \\cdot p(1 - p)}"
    },

    // Poisson
    "Poisson": {
        texto: "Distribución de Poisson",
        math: "P(X = x) = \\frac{\\lambda^x e^{-\\lambda}}{x!}"
    },
    "P_Poisson": {
        texto: "Distribución de Poisson",
        math: "P(X = x) = \\frac{\\lambda^x e^{-\\lambda}}{x!}"
    },
    "E_Poisson": {
        texto: "Esperanza Matemática (Poisson)",
        math: "E(X) = \\lambda"
    },
    "V_Poisson": {
        texto: "Varianza (Poisson)",
        math: "V(X) = \\lambda"
    },
    "sigma_Poisson": {
        texto: "Desviación Estándar (Poisson)",
        math: "\\sigma = \\sqrt{\\lambda}"
    },

    // Hipergeométrica
    "Hipergeometrica": {
        texto: "Distribución Hipergeométrica",
        math: "P(X = x) = \\frac{\\binom{K}{x}\\binom{N-K}{n-x}}{\\binom{N}{n}}"
    },
    "P_Hipergeometrica": {
        texto: "Distribución Hipergeométrica",
        math: "P(X = x) = \\frac{\\binom{K}{x}\\binom{N-K}{n-x}}{\\binom{N}{n}}"
    },
    "E_Hipergeometrica": {
        texto: "Esperanza Matemática (Hipergeométrica)",
        math: "E(X) = n \\cdot \\frac{K}{N}"
    },
    "V_Hipergeometrica": {
        texto: "Varianza (Hipergeométrica)",
        math: "V(X) = n \\cdot \\frac{K}{N} \\left(1 - \\frac{K}{N}\\right) \\frac{N - n}{N - 1}"
    },
    "sigma_Hipergeometrica": {
        texto: "Desviación Estándar (Hipergeométrica)",
        math: "\\sigma = \\sqrt{V(X)}"
    },

    // Geométrica
    "Geometrica": {
        texto: "Distribución Geométrica",
        math: "P(X = x) = (1-p)^{x-1} p"
    },
    "P_Geometrica": {
        texto: "Distribución Geométrica",
        math: "P(X = x) = (1-p)^{x-1} p"
    },
    "E_Geometrica": {
        texto: "Esperanza Matemática (Geométrica)",
        math: "E(X) = \\frac{1}{p}"
    },
    "V_Geometrica": {
        texto: "Varianza (Geométrica)",
        math: "V(X) = \\frac{1 - p}{p^2}"
    },
    "sigma_Geometrica": {
        texto: "Desviación Estándar (Geométrica)",
        math: "\\sigma = \\frac{\\sqrt{1 - p}}{p}"
    },

    // Normal
    "Normal": {
        texto: "Distribución Normal Tipificada (Z)",
        math: "Z = \\frac{X - \\mu}{\\sigma}"
    },
    "P_Normal": {
        texto: "Distribución Normal",
        math: "f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x - \\mu}{\\sigma}\\right)^2}"
    },
    "E_Normal": {
        texto: "Esperanza Matemática (Normal)",
        math: "E(X) = \\mu"
    },
    "V_Normal": {
        texto: "Varianza (Normal)",
        math: "V(X) = \\sigma^2"
    },
    "sigma_Normal": {
        texto: "Desviación Estándar (Normal)",
        math: "\\sigma = \\sqrt{V(X)} = \\sqrt{\\sigma^2}"
    },
    "inv_Normal": {
        texto: "Valor Inverso / Cuantil (Normal)",
        math: "c = \\mu + Z \\cdot \\sigma"
    },
    "Z": {
        texto: "Variable Normal Estándar (Tipificación)",
        math: "Z = \\frac{X - \\mu}{\\sigma} \\sim N(0, 1)"
    },
    "z": {
        texto: "Cuantil Normal Estándar",
        math: "z = \\Phi^{-1}(p)"
    },
    "Z_1": {
        texto: "Puntuación Z (Cola Inferior)",
        math: "Z_1 = \\frac{c_1 - \\mu}{\\sigma}"
    },
    "Z_2": {
        texto: "Puntuación Z (Cola Superior)",
        math: "Z_2 = \\frac{c_2 - \\mu}{\\sigma}"
    },

    // Normal Estándar
    "NormalEstandar": {
        texto: "Distribución Normal Estándar",
        math: "Z \\sim N(0, 1)"
    },
    "P_NormalEstandar": {
        texto: "Variable Normal Estándar",
        math: "Z = \\frac{X - \\mu}{\\sigma} \\sim N(0, 1)"
    },
    "inv_NormalEstandar": {
        texto: "Valor Inverso / Cuantil (Normal Estándar)",
        math: "z = \\Phi^{-1}(p)"
    },
    "E_NormalEstandar": {
        texto: "Esperanza (Normal Estándar)",
        math: "E(Z) = 0"
    },
    "V_NormalEstandar": {
        texto: "Varianza (Normal Estándar)",
        math: "V(Z) = 1"
    },
    "sigma_NormalEstandar": {
        texto: "Desviación (Normal Estándar)",
        math: "\\sigma = 1"
    },

    // Uniforme Continua
    "Uniforme": {
        texto: "Distribución Uniforme Continua",
        math: "f(x) = \\frac{1}{b - a}, \\quad a \\le x \\le b"
    },
    "P_Uniforme": {
        texto: "Distribución Uniforme Continua",
        math: "P(x_1 \\le X \\le x_2) = \\frac{x_2 - x_1}{b - a}"
    },
    "inv_Uniforme": {
        texto: "Valor Inverso / Cuantil (Uniforme)",
        math: "c = a + p(b - a)"
    },
    "E_Uniforme": {
        texto: "Esperanza Matemática (Uniforme)",
        math: "E(X) = \\frac{a + b}{2}"
    },
    "V_Uniforme": {
        texto: "Varianza (Uniforme)",
        math: "V(X) = \\frac{(b - a)^2}{12}"
    },
    "sigma_Uniforme": {
        texto: "Desviación Estándar (Uniforme)",
        math: "\\sigma = \\frac{b - a}{\\sqrt{12}}"
    },

    // Exponencial
    "Exponencial": {
        texto: "Distribución Exponencial",
        math: "f(x) = \\lambda e^{-\\lambda x}, \\quad x \\ge 0"
    },
    "P_Exponencial": {
        texto: "Distribución Exponencial",
        math: "f(x) = \\lambda e^{-\\lambda x}, \\quad x \\ge 0"
    },
    "E_Exponencial": {
        texto: "Esperanza Matemática (Exponencial)",
        math: "E(X) = \\frac{1}{\\lambda}"
    },
    "V_Exponencial": {
        texto: "Varianza (Exponencial)",
        math: "V(X) = \\frac{1}{\\lambda^2}"
    },
    "sigma_Exponencial": {
        texto: "Desviación Estándar (Exponencial)",
        math: "\\sigma = \\frac{1}{\\lambda}"
    },

    // Chi-Cuadrado
    "ChiCuadrado": {
        texto: "Distribución Chi-Cuadrado",
        math: "\\chi^2(v)"
    },
    "P_ChiCuadrado": {
        texto: "Distribución Chi-Cuadrado",
        math: "P(\\chi^2 \\le x)"
    },
    "inv_ChiCuadrado": {
        texto: "Valor Inverso (Chi-Cuadrado)",
        math: "P(\\chi^2 \\le c) = p"
    },
    "E_ChiCuadrado": {
        texto: "Esperanza (Chi-Cuadrado)",
        math: "E(\\chi^2) = v"
    },
    "V_ChiCuadrado": {
        texto: "Varianza (Chi-Cuadrado)",
        math: "V(\\chi^2) = 2v"
    },
    "sigma_ChiCuadrado": {
        texto: "Desviación (Chi-Cuadrado)",
        math: "\\sigma = \\sqrt{2v}"
    },

    // t-Student
    "TStudent": {
        texto: "Distribución t-Student",
        math: "t(v)"
    },
    "P_TStudent": {
        texto: "Distribución t-Student",
        math: "P(T \\le t)"
    },
    "inv_TStudent": {
        texto: "Valor Inverso (t-Student)",
        math: "P(T \\le c) = p"
    },
    "E_TStudent": {
        texto: "Esperanza (t-Student)",
        math: "E(T) = 0, \\quad v > 1"
    },
    "V_TStudent": {
        texto: "Varianza (t-Student)",
        math: "V(T) = \\frac{v}{v - 2}, \\quad v > 2"
    },
    "sigma_TStudent": {
        texto: "Desviación (t-Student)",
        math: "\\sigma = \\sqrt{\\frac{v}{v - 2}}"
    },

    // F-Fisher
    "FFisher": {
        texto: "Distribución F de Fisher",
        math: "F(v_1, v_2)"
    },
    "P_FFisher": {
        texto: "Distribución F de Fisher",
        math: "P(F \\le x)"
    },
    "inv_FFisher": {
        texto: "Valor Inverso / Cuantil (F de Fisher)",
        math: "P(F \\le c) = p"
    },
    "E_FFisher": {
        texto: "Esperanza (F de Fisher)",
        math: "E(F) = \\frac{v_2}{v_2 - 2}, \\quad v_2 > 2"
    },
    "V_FFisher": {
        texto: "Varianza (F de Fisher)",
        math: "V(F) = \\frac{2v_2^2(v_1 + v_2 - 2)}{v_1(v_2 - 2)^2(v_2 - 4)}, \\quad v_2 > 4"
    },
    "sigma_FFisher": {
        texto: "Desviación (F de Fisher)",
        math: "\\sigma = \\sqrt{V(F)}"
    },

    // ==========================================
    // TEMA 4, 5 Y 6: INFERENCIA ESTADÍSTICA
    // ==========================================
    "E_x_barra": {
        texto: "Esperanza matemática de la media muestral",
        math: "E(\\bar{X}) = \\mu"
    },
    "V_x_barra": {
        texto: "Varianza de la media muestral",
        math: "V(\\bar{X}) = \\frac{\\sigma^2}{n}"
    },
    "sigma_x_barra": {
        texto: "Error estándar de la media muestral",
        math: "\\sigma_{\\bar{X}} = \\frac{\\sigma}{\\sqrt{n}}"
    },
    "E(X_barra)": {
        texto: "Esperanza matemática de la media muestral",
        math: "E(\\bar{X}) = \\mu"
    },
    "V(X_barra)": {
        texto: "Varianza de la media muestral",
        math: "V(\\bar{X}) = \\frac{\\sigma^2}{n}"
    },
    "sigma_X_barra": {
        texto: "Error estándar de la media muestral",
        math: "\\sigma_{\\bar{X}} = \\frac{\\sigma}{\\sqrt{n}}"
    },
    "Z_media_muestral": {
        texto: "Estandarización de la Media Muestral",
        math: "Z = \\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}}"
    },
    "P_x_barra_final": {
        texto: "Cálculo de Probabilidad Normal Estándar",
        math: "P(\\bar{X} \\le x) = P(Z \\le z)"
    },
    "E_p_gorro": {
        texto: "Esperanza matemática de la proporción muestral",
        math: "E(\\hat{p}) = p"
    },
    "V_p_gorro": {
        texto: "Varianza de la proporción muestral",
        math: "V(\\hat{p}) = \\frac{pq}{n}"
    },
    "sigma_p_gorro": {
        texto: "Error estándar de la proporción muestral",
        math: "\\sigma_{\\hat{p}} = \\sqrt{\\frac{pq}{n}}"
    },
    "Z_proporcion": {
        texto: "Estandarización de la Proporción Muestral",
        math: "Z = \\frac{\\hat{p} - p}{\\sqrt{\\frac{pq}{n}}}"
    },
    "P_p_gorro_final": {
        texto: "Cálculo de Probabilidad Normal Estándar",
        math: "P(\\hat{p} \\le x) = P(Z \\le z)"
    },
    "x_barra": {
        texto: "Media Muestral",
        math: "\\bar{X} = \\frac{1}{n} \\sum_{i=1}^n X_i"
    },
    "n_muestra": {
        texto: "Tamaño de la Muestra",
        math: "n = \\text{número de observaciones}"
    },
    "frecuencia_observada": {
        texto: "Frecuencia observada de la categoría i en los datos",
        math: "O_i = \\text{conteo de la categoría } i"
    },
    "frecuencia_esperada": {
        texto: "Frecuencia que se espera para la categoría i bajo la hipótesis nula",
        math: "E_i = n p_i; \\quad E_i = \\frac{n}{k} \\text{ si la distribución es uniforme}"
    },
    "x_barra_observada": {
        texto: "Media aritmética de la muestra observada",
        math: "\\bar{x} = \\frac{1}{n} \\sum_{i=1}^{n} x_i"
    },
    "conteo_eventos": {
        texto: "Cantidad de observaciones que cumplen la condición de éxito",
        math: "x = n\\hat{p}"
    },
    "proporcion_muestral": {
        texto: "Proporción de éxitos observada en la muestra",
        math: "\\hat{p} = \\frac{x}{n}"
    },
    "varianza_muestral": {
        texto: "Varianza calculada a partir de las observaciones de la muestra",
        math: "S^2 = \\frac{1}{n-1}\\sum_{i=1}^{n}(x_i-\\bar{x})^2"
    },
    "grados_libertad": {
        texto: "Grados de libertad de la muestra",
        math: "gl = n - 1"
    },
    "error_estandar_media": {
        texto: "Error estándar de la media muestral bajo la hipótesis nula",
        math: "EE_{\\bar{x}} = \\frac{\\sigma}{\\sqrt{n}} \\text{ o } \\frac{S}{\\sqrt{n}}"
    },
    "error_estandar_proporcion": {
        texto: "Error estándar de la proporción muestral bajo la hipótesis nula",
        math: "EE_{\\hat{p}} = \\sqrt{\\frac{p_0(1-p_0)}{n}}"
    },
    "intervalo_confianza": {
        texto: "Intervalo de confianza asociado a la prueba de hipótesis",
        math: "IC = [LI, LS]"
    },
    "estadistico_prueba": {
        texto: "Estadístico de prueba calculado con los datos muestrales para evaluar la hipótesis nula",
        math: "Z_c = \\frac{\\bar{x}-\\mu_0}{\\sigma/\\sqrt{n}}"
    },
    "p_valor": {
        texto: "Probabilidad, bajo la hipótesis nula, de obtener un resultado tan extremo o más que el observado",
        math: "p = P(\\text{resultado tan extremo o más} \\mid H_0)"
    },
    "valor_referencia_signos": {
        texto: "Valor de referencia con el que se compara cada dato en la prueba de signos",
        math: "D_i = X_i - v_{ref}"
    },
    "rachas_n_efectivo": {
        texto: "Datos que cuentan en la prueba; no incluye empates",
        math: "n = n_1 + n_2"
    },
    "rachas_n1": {
        texto: "Cantidad de datos con signo +",
        math: "n_1 = \\text{cantidad de } +"
    },
    "rachas_n2": {
        texto: "Cantidad de datos con signo −",
        math: "n_2 = \\text{cantidad de } -"
    },
    "rachas_R": {
        texto: "Cantidad de rachas observadas, donde c es el número de cambios de signo",
        math: "R = 1 + c"
    },
    "rachas_media_esperada": {
        texto: "Cantidad promedio de rachas esperada al azar",
        math: "\\mu_R = \\frac{2n_1n_2}{n_1+n_2} + 1"
    },
    "rachas_desviacion": {
        texto: "Variación esperada del número de rachas",
        math: "\\sigma_R = \\sqrt{\\frac{2n_1n_2(2n_1n_2-n)}{n^2(n-1)}}"
    },
    "rachas_Z": {
        texto: "Distancia entre las rachas observadas y esperadas",
        math: "Z = \\frac{R \\pm 0.5 - \\mu_R}{\\sigma_R}"
    },
    "rachas_Zcrit": {
        texto: "Límite de decisión según el nivel de significación",
        math: "Z_{crit} = z_{\\alpha/2}"
    },
    "suma_muestral": {
        texto: "Suma de los Valores de la Muestra",
        math: "\\sum_{i=1}^{n} X_i"
    },
    "desviacion_muestral": {
        texto: "Desviación Estándar Muestral",
        math: "S = \\sqrt{\\frac{1}{n-1}\\sum_{i=1}^{n}(X_i-\\bar{X})^2}"
    },
    "estimador_media_puntual": {
        texto: "Estimador Puntual de la Media Poblacional",
        math: "\\hat{\\mu}=\\bar{X}"
    },
    "indice_muestra": {
        texto: "Índice de la Observación",
        math: "i = 1, 2, \\dots, n"
    },
    "desviacion_observacion": {
        texto: "Desviación de la Observación respecto a la Media Muestral",
        math: "x_i - \\bar{X}"
    },
    "desviacion_observacion_cuadrado": {
        texto: "Desviación Cuadrática de la Observación",
        math: "(x_i - \\bar{X})^2"
    },
    "s2": {
        texto: "Varianza Muestral",
        math: "S^2 = \\frac{1}{n-1} \\sum_{i=1}^n (X_i - \\bar{X})^2"
    },
    "p_sombrero": {
        texto: "Proporción Muestral",
        math: "\\hat{p} = \\frac{X}{n}"
    },
    "indicador_exito": {
        texto: "Indicador de Éxito",
        math: "I_i = \\begin{cases}1, & x_i = a \\\\ 0, & x_i \\ne a\\end{cases}"
    },
    "P_x_barra": {
        texto: "Distribución de la Media Muestral",
        math: "P(\\bar{X} = \\bar{x}_i) = p_i"
    },
    "P_s2": {
        texto: "Distribución de la Varianza Muestral",
        math: "P(S^2 = s^2_i) = p_i"
    },
    "P_p_sombrero": {
        texto: "Distribución de la Proporción Muestral",
        math: "P(\\hat{p} = \\hat{p}_i) = p_i"
    },
    "IC_media": {
        texto: "Intervalo de Confianza para la Media",
        math: "\\bar{X} \\pm Z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}}"
    },
    "IC_media_t": {
        texto: "Intervalo de confianza para la media con desviación estándar desconocida",
        math: "\\bar{X} \\pm t_{\\alpha/2, n-1} \\frac{S}{\\sqrt{n}}"
    },
    "IC_media_z": {
        texto: "Intervalo de confianza para la media con desviación estándar poblacional conocida",
        math: "\\bar{X} \\pm Z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}}"
    },
    "IC_proporcion": {
        texto: "Intervalo de confianza para la proporción poblacional",
        math: "\\hat{p} \\pm Z_{\\alpha/2} \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}"
    },
    "IC_varianza": {
        texto: "Intervalo de confianza para la varianza poblacional",
        math: "\\left[\\frac{(n-1)S^2}{\\chi^2_{1-\\alpha/2}}, \\frac{(n-1)S^2}{\\chi^2_{\\alpha/2}}\\right]"
    },
    "E_media_t": {
        texto: "Margen de error para la media con desviación estándar desconocida",
        math: "E = t_{\\alpha/2, n-1} \\frac{S}{\\sqrt{n}}"
    },
    "E_media_z": {
        texto: "Margen de error para la media con desviación estándar poblacional conocida",
        math: "E = Z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}}"
    },
    "E_proporcion": {
        texto: "Margen de error para una proporción poblacional",
        math: "E = Z_{\\alpha/2} \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}"
    },
    "H0": {
        texto: "Hipótesis Nula",
        math: "H_0: \\theta = \\theta_0"
    },
    "H1": {
        texto: "Hipótesis Alternativa",
        math: "H_1: \\theta \\ne \\theta_0"
    },
    "E_dif_medias": {
        texto: "Esperanza de la diferencia de medias muestrales",
        math: "E(\\bar{X} - \\bar{Y}) = \\mu_X - \\mu_Y"
    },
    "V_dif_medias": {
        texto: "Varianza de la diferencia de medias muestrales independientes",
        math: "V(\\bar{X} - \\bar{Y}) = \\frac{\\sigma_X^2}{n_X} + \\frac{\\sigma_Y^2}{n_Y}"
    },
    "sigma_dif_medias": {
        texto: "Error estándar de la diferencia de medias muestrales",
        math: "\\sigma_{\\bar{X} - \\bar{Y}} = \\sqrt{\\frac{\\sigma_X^2}{n_X} + \\frac{\\sigma_Y^2}{n_Y}}"
    },
    "Z_dif_medias": {
        texto: "Estandarización de la Diferencia de Medias",
        math: "Z = \\frac{(\\bar{X} - \\bar{Y}) - (\\mu_X - \\mu_Y)}{\\sqrt{\\frac{\\sigma_X^2}{n_X} + \\frac{\\sigma_Y^2}{n_Y}}}"
    },
    "P_dif_medias_final": {
        texto: "Cálculo de Probabilidad Diferencia de Medias",
        math: "P(\\bar{X} - \\bar{Y} \\le x) = P(Z \\le z)"
    },
    "E_dif_proporciones": {
        texto: "Esperanza de la diferencia de proporciones muestrales",
        math: "E(\\hat{p}_1 - \\hat{p}_2) = p_1 - p_2"
    },
    "V_dif_proporciones": {
        texto: "Varianza de la diferencia de proporciones muestrales independientes",
        math: "V(\\hat{p}_1 - \\hat{p}_2) = \\frac{p_1q_1}{n_1} + \\frac{p_2q_2}{n_2}"
    },
    "sigma_dif_proporciones": {
        texto: "Error estándar de la diferencia de proporciones muestrales",
        math: "\\sigma_{\\hat{p}_1 - \\hat{p}_2} = \\sqrt{\\frac{p_1q_1}{n_1} + \\frac{p_2q_2}{n_2}}"
    },
    "Z_dif_proporciones": {
        texto: "Estandarización de la Diferencia de Proporciones",
        math: "Z = \\frac{(\\hat{p}_1 - \\hat{p}_2) - (p_1 - p_2)}{\\sqrt{\\frac{p_1 q_1}{n_1} + \\frac{p_2 q_2}{n_2}}}"
    },
    "P_dif_proporciones_final": {
        texto: "Cálculo de Probabilidad Diferencia de Proporciones",
        math: "P(\\hat{p}_1 - \\hat{p}_2 \\le x) = P(Z \\le z)"
    },
    "T_student_est": {
        texto: "Estandarización t-Student",
        math: "T = \\frac{\\bar{X} - \\mu}{\\frac{S}{\\sqrt{n}}}"
    },
    "F_razon_varianzas": {
        texto: "Razón de Varianzas Muestrales",
        math: "F = \\frac{S_1^2 / \\sigma_1^2}{S_2^2 / \\sigma_2^2}"
    },
    "v_grados_libertad": {
        texto: "Grados de Libertad",
        math: "v = n - 1"
    },
    "E_s2_muestral": {
        texto: "Esperanza de la Varianza Muestral",
        math: "E(S^2) = \\sigma^2"
    },
    "Var_s2_muestral": {
        texto: "Varianza de la Varianza Muestral",
        math: "V(S^2) = \\frac{2\\sigma^4}{n - 1}"
    },
    "chi2_transformacion": {
        texto: "Transformación a Chi-Cuadrada",
        math: "\\chi^2 = \\frac{(n - 1)S^2}{\\sigma^2}, \\quad v = n - 1"
    },
    "P_s2_condicion": {
        texto: "Cálculo de Probabilidad Chi-Cuadrada",
        math: "P(S^2 \\le x) = P(\\chi^2 \\le \\chi^2_0)"
    }
};
