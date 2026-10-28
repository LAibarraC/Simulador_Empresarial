import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renderiza una expresión matemática en HTML usando KaTeX para los tooltips de Tema 3
 * @param {string} math Expresión LaTeX
 * @param {boolean} display Modo bloque (true) o inline (false)
 */
const k = (math, display = false) => {
    try {
        return katex.renderToString(math, {
            throwOnError: false,
            displayMode: display
        });
    } catch {
        return math;
    }
};

/**
 * ==============================================================================
 * GUÍA INTERACTIVA DE APRENDIZAJE - TEMA 3: MODELOS DE DISTRIBUCIÓN
 * ==============================================================================
 * Submódulo hijo importado por Guia.js (padre).
 * Controla:
 * - Modelos Discretos (Bernoulli, Binomial, Poisson, Hipergeométrica) en Matriz y Manual
 * - Modelos Continuos (Uniforme, Normal, Normal Estándar, Chi-cuadrada, F de Fisher, T de Student) en Matriz y Manual
 */

// ─── TOUR 14A: DISTRIBUCIÓN DE BERNOULLI (ANÁLISIS DE MATRIZ) ───
export const pasosBernoulliMatriz = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución de Bernoulli (Análisis de Matriz)',
            description: 'Sirve para estimar la probabilidad de éxito a partir de los datos registrados en una columna de tu matriz y ajustar el modelo de Bernoulli.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Matriz de Datos',
            description: 'Sirve para elegir la matriz de datos de la cual se estimará la probabilidad de éxito.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de trabajo y visualización de resultados.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-modelos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modelos de Distribución Discreta',
            description: 'Sirve para seleccionar la distribución a evaluar. Actualmente tienes seleccionada la distribución de Bernoulli.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre estimar los parámetros a partir de una matriz de datos reales (Análisis de Matriz) o ingresarlos de forma manual.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-matriz-datos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Datos',
            description: 'Muestra la cantidad de observaciones cargadas y agregadas de la matriz seleccionada, con opción de editar los registros mediante el botón "Editar Datos".',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-matriz-columna',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Columna de la Matriz',
            description: 'Sirve para seleccionar la columna que contiene los registros binarios o categorías a analizar.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-matriz-controles',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Valor de Éxito (x)',
            description: `Sirve para seleccionar cuál de los valores presentes en la columna será considerado como éxito (${k('x = 1')}). Los demás valores serán tratados como fracasos.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-estimar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Estimar Probabilidad',
            description: `Haz clic aquí para calcular en la muestra la proporción de éxitos y obtener la probabilidad estimada ${k('p')}.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-tabla-estimados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Parámetros Estimados',
            description: `Muestra el tamaño total de la muestra (${k('N')}), el conteo de registros con éxito y la probabilidad resultante (${k('p')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-parametros',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros del Modelo de Bernoulli',
            description: `Muestra el parámetro estimado ${k('p')} asignado al modelo y su fórmula matemática.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Generar Distribución',
            description: 'Haz clic aquí para validar la probabilidad y habilitar la consulta de condiciones de probabilidad y gráficos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición de Búsqueda',
            description: `Sirve para seleccionar el resultado a consultar (${k('x = 0')} para fracaso o ${k('x = 1')} para éxito) y calcular su probabilidad.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-calcular-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Condición',
            description: 'Haz clic aquí para calcular la probabilidad del resultado seleccionado y actualizar el gráfico.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-resultado-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad Calculada',
            description: 'Muestra el desarrollo matemático de la fórmula de Bernoulli con el valor evaluado y el resultado en decimal y porcentaje.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra el valor esperado de la distribución de Bernoulli (${k('E(X) = p')}), obtenido a partir de la estimación muestral.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra la varianza de la distribución (${k('V(X) = p(1-p)')}), que mide la dispersión del resultado dicotómico.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Muestra la desviación típica de la variable de Bernoulli (${k('\\sigma = \\sqrt{p(1-p)}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfico de Bastones',
            description: `Muestra en bastones verticales las probabilidades para el fracaso (${k('x = 0')}) y el éxito (${k('x = 1')}), resaltando en color naranja la condición evaluada.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 14B: DISTRIBUCIÓN BINOMIAL (ANÁLISIS DE MATRIZ) ───
export const pasosBinomialMatriz = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Binomial (Análisis de Matriz)',
            description: `Sirve para estimar los parámetros ${k('n')} y ${k('p')} a partir de los datos de la matriz y ajustar la distribución binomial.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Matriz de Datos',
            description: 'Sirve para elegir la matriz de datos de la cual se estimarán los parámetros binomiales.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de trabajo y visualización de resultados.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-modelos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modelos de Distribución Discreta',
            description: 'Sirve para seleccionar la distribución a evaluar. Actualmente tienes seleccionada la distribución Binomial.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre estimar los parámetros a partir de una matriz de datos reales (Análisis de Matriz) o ingresarlos de forma manual.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-matriz-datos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Datos',
            description: 'Muestra la cantidad de observaciones cargadas y agregadas de la matriz seleccionada, con opción de editar los registros mediante el botón "Editar Datos".',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-matriz-columna',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Columna de la Matriz',
            description: 'Sirve para seleccionar la columna que contiene los registros para la estimación binomial.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-matriz-controles',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Criterios del Ensayo y Éxito',
            description: `Sirve para ingresar el tamaño del ensayo o lote (${k('n')}) y seleccionar cuál valor representa el éxito (${k('x')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-estimar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Estimar Parámetros',
            description: `Haz clic aquí para calcular la frecuencia de éxitos en la muestra y obtener los parámetros ${k('n')} y ${k('p')}.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-tabla-estimados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Parámetros Estimados',
            description: `Muestra el total de registros analizados, los éxitos observados y las estimaciones de ${k('n')} y ${k('p')}.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-parametros',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros del Modelo Binomial',
            description: `Muestra los parámetros resultantes de la estimación (${k('n')} y ${k('p')}) y la fórmula binomial sustituida.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Generar Distribución',
            description: 'Haz clic aquí para construir la distribución teórica de probabilidad y habilitar la evaluación de condiciones y visualización de gráficos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición de Búsqueda',
            description: `Sirve para definir la probabilidad que deseas consultar (puntual ${k('X = x')}, acumulada ${k('X \\le x')}, complementaria ${k('X \\ge x')} o por intervalo) indicando el número de éxitos.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-calcular-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Condición',
            description: 'Haz clic aquí para calcular la probabilidad exacta de la condición seleccionada y actualizar el gráfico.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-resultado-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad Calculada',
            description: 'Muestra el desarrollo matemático de la fórmula binomial con los parámetros estimados y el resultado en valor decimal y porcentaje.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra la media teórica de éxitos esperados (${k('E(X) = n \\cdot p')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra la varianza teórica de la distribución binomial (${k('V(X) = n \\cdot p \\cdot (1 - p)')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Muestra la dispersión estándar (${k('\\sigma = \\sqrt{n \\cdot p \\cdot (1 - p)}')}) de la cantidad de éxitos.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfico de Bastones',
            description: `Muestra las probabilidades de obtener desde 0 hasta ${k('n')} éxitos, resaltando en color naranja las barras de la condición calculada.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 14C: DISTRIBUCIÓN DE POISSON (ANÁLISIS DE MATRIZ) ───
export const pasosPoissonMatriz = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución de Poisson (Análisis de Matriz)',
            description: `Sirve para estimar la tasa media ${k('\\lambda')} a partir de una columna de conteos u ocurrencias observadas en tu matriz.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Matriz de Datos',
            description: 'Sirve para elegir la matriz de datos de la cual se estimará la tasa media de Poisson.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de trabajo y visualización de resultados.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-modelos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modelos de Distribución Discreta',
            description: 'Sirve para seleccionar la distribución a evaluar. Actualmente tienes seleccionada la distribución de Poisson.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre estimar los parámetros a partir de una matriz de datos reales (Análisis de Matriz) o ingresarlos de forma manual.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-matriz-datos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Datos',
            description: 'Muestra la cantidad de observaciones cargadas y agregadas de la matriz seleccionada, con opción de editar los registros mediante el botón "Editar Datos".',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-matriz-columna',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Columna de Conteos',
            description: 'Sirve para seleccionar la columna que registra el número de ocurrencias por período o unidad de medición.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-estimar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Estimar Tasa Media (λ)',
            description: `Haz clic aquí para calcular el promedio de la columna seleccionada y asignarlo como parámetro ${k('\\lambda')}.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-tabla-estimados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Parámetros Estimados',
            description: `Muestra el tamaño muestral (${k('N')}) y la tasa media estimada (${k('\\lambda')}) calculada a partir de los datos.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-parametros',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros del Modelo de Poisson',
            description: `Muestra la tasa media estimada ${k('\\lambda')} y la fórmula de Poisson sustituida.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Generar Distribución',
            description: 'Haz clic aquí para construir la distribución teórica de probabilidad y habilitar la evaluación de condiciones y visualización de gráficos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición de Búsqueda',
            description: `Sirve para indicar el número de eventos a consultar (${k('X = x')}, ${k('X \\le x')}, ${k('X \\ge x')} o intervalo) en el intervalo analizado.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-calcular-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Condición',
            description: 'Haz clic aquí para calcular la probabilidad exacta de la condición seleccionada y actualizar el gráfico.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-resultado-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad Calculada',
            description: 'Muestra el desarrollo de la fórmula de Poisson con la constante de Euler e y el factorial de x sustituidos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra la media teórica de ocurrencias (${k('E(X) = \\lambda')}), que es exactamente igual a la tasa media estimada.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra la varianza de la distribución (${k('V(X) = \\lambda')}). En el modelo de Poisson, la varianza es idéntica a la media.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Muestra la dispersión estándar típica (${k('\\sigma = \\sqrt{\\lambda}')}) en el conteo de eventos.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfico de Bastones',
            description: `Muestra las probabilidades de ocurrencia para cada cantidad de eventos ${k('x')}, con el área de la condición consultada destacada en naranja.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 14D: DISTRIBUCIÓN HIPERGEOMÉTRICA (ANÁLISIS DE MATRIZ) ───
export const pasosHipergeometricaMatriz = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Hipergeométrica (Análisis de Matriz)',
            description: 'Sirve para cuantificar la población total, los éxitos existentes y definir el tamaño de muestra a partir de los datos de la matriz.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Matriz de Datos',
            description: 'Sirve para elegir la matriz de datos de la cual se cuantificará la población y los éxitos.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de trabajo y visualización de resultados.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-modelos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modelos de Distribución Discreta',
            description: 'Sirve para seleccionar la distribución a evaluar. Actualmente tienes seleccionada la distribución Hipergeométrica.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre estimar los parámetros a partir de una matriz de datos reales (Análisis de Matriz) o ingresarlos de forma manual.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-matriz-datos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Datos',
            description: 'Muestra la cantidad de observaciones cargadas y agregadas de la matriz seleccionada, con opción de editar los registros mediante el botón "Editar Datos".',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-matriz-columna',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Columna del Lote o Población',
            description: 'Sirve para seleccionar la columna que representa los elementos que componen el lote o población total.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-matriz-controles',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Criterios de Éxito y Muestra',
            description: `Sirve para indicar cuál categoría se considerará éxito y establecer el tamaño de muestra (${k('n')}) a extraer.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-estimar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Estimar Parámetros',
            description: `Haz clic aquí para cuantificar el tamaño de población (${k('N')}) y la cantidad de éxitos (${k('N_1')}) en los datos.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-tabla-estimados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Parámetros Estimados',
            description: `Muestra la población total encontrada (${k('N')}), el conteo de éxitos (${k('N_1')}) y la muestra establecida (${k('n')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-parametros',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros del Modelo Hipergeométrico',
            description: 'Muestra los parámetros hipergeométricos calculados y listos para evaluar probabilidades.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Generar Distribución',
            description: 'Haz clic aquí para construir la distribución teórica de probabilidad y habilitar la evaluación de condiciones y visualización de gráficos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición de Búsqueda',
            description: 'Sirve para definir la probabilidad que deseas consultar indicando el número de éxitos en la muestra evaluada.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-calcular-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Condición',
            description: 'Haz clic aquí para calcular la probabilidad exacta de la condición seleccionada y actualizar el gráfico.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-resultado-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad Calculada',
            description: 'Muestra el desarrollo de los números combinatorios para la muestra sin reemplazo y el resultado final en decimal y porcentaje.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra el valor esperado de éxitos en la muestra (${k('E(X) = n \\cdot \\frac{N_1}{N}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra la varianza de la distribución hipergeométrica incluyendo el factor de corrección por población finita (${k('\\frac{N-n}{N-1}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Muestra la dispersión estándar típica (${k('\\sigma = \\sqrt{V(X)}')}) de los éxitos en la muestra.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfico de Bastones',
            description: 'Muestra las probabilidades para cada posible cantidad de éxitos en la extracción sin reemplazo.',
            side: 'top',
            align: 'center'
        }
    }
];

// Alias para compatibilidad hacia atrás
export const pasosModelosDiscretosMatriz = pasosBinomialMatriz;

// ─── TOUR 15A: DISTRIBUCIÓN DE BERNOULLI (MODO MANUAL) ───
export const pasosBernoulliManual = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución de Bernoulli (Modo Manual)',
            description: `Sirve para calcular probabilidades de un experimento dicotómico simple con dos únicos resultados (éxito o fracaso) a partir del parámetro ${k('p')}.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de visualización.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-modelos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modelos de Distribución Discreta',
            description: 'Sirve para seleccionar el modelo discreto Bernoulli, evaluando un único ensayo dicotómico.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre el ingreso manual de la probabilidad de éxito y el ajuste mediante matriz de datos.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-bernoulli-p',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad de Éxito (p)',
            description: `Sirve para ingresar la probabilidad de ocurrencia del evento de éxito (${k('0 \\le p \\le 1')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-bernoulli-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Función de Probabilidad de Bernoulli',
            description: `Muestra la expresión matemática ${k('P(X=x) = p^x (1-p)^{1-x}')} con el parámetro sustituido para los dos valores posibles (${k('x \\in \\{0, 1\\}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Generar Distribución',
            description: 'Haz clic aquí para validar el parámetro y habilitar la consulta de condiciones de probabilidad y gráficos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición de Búsqueda',
            description: `Sirve para indicar si deseas consultar el resultado de éxito (${k('x = 1')}) o fracaso (${k('x = 0')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-calcular-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Condición',
            description: 'Haz clic aquí para calcular la probabilidad del evento seleccionado y resaltarlo en el gráfico.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-resultado-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad Calculada',
            description: 'Muestra la probabilidad del evento consultado en formato decimal y porcentual.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra el valor esperado del ensayo dicotómico (${k('E(X) = p')}), equivalente a la probabilidad de éxito.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra la varianza del modelo de Bernoulli (${k('V(X) = p \\cdot (1 - p)')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Muestra la dispersión estándar típica (${k('\\sigma = \\sqrt{p \\cdot (1 - p)}')}) del experimento.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfico de Bastones',
            description: `Muestra las probabilidades puntuales para fracaso (${k('x = 0')}) y éxito (${k('x = 1')}), con la barra seleccionada destacada en naranja.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 15B: DISTRIBUCIÓN BINOMIAL (MODO MANUAL) ───
export const pasosBinomialManual = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Binomial (Modo Manual)',
            description: `Sirve para calcular la probabilidad de obtener una cantidad de éxitos en ${k('n')} ensayos independientes e idénticos con probabilidad constante ${k('p')}.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de visualización.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-modelos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modelos de Distribución Discreta',
            description: 'Sirve para seleccionar el modelo Binomial para evaluar conteos de éxitos en ensayos repetidos.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre el ingreso manual de los parámetros y el ajuste mediante matriz de datos.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-binomial-n',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Número de Ensayos (n)',
            description: `Sirve para ingresar el número total de ensayos o repeticiones independientes (${k('n \\ge 1')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-binomial-p',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad de Éxito (p)',
            description: `Sirve para ingresar la probabilidad de éxito constante en cada ensayo individual (${k('0 \\le p \\le 1')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-binomial-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Función de Probabilidad Binomial',
            description: `Muestra la fórmula binomial ${k('P(X=x) = \\binom{n}{x} p^x (1-p)^{n-x}')} con los valores de ${k('n')} y ${k('p')} sustituidos.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Generar Distribución',
            description: 'Haz clic aquí para validar los parámetros y habilitar la consulta de condiciones de probabilidad y gráficos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición de Búsqueda',
            description: `Sirve para indicar el número de éxitos a consultar (${k('X = x')}, ${k('X \\le x')}, ${k('X \\ge x')} o intervalo).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-calcular-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Condición',
            description: 'Haz clic aquí para calcular la probabilidad exacta de la condición seleccionada y actualizar el gráfico.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-resultado-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad Calculada',
            description: 'Muestra el desglose del combinatorio, las potencias de probabilidad y el resultado final en decimal y porcentaje.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra el número promedio esperado de éxitos (${k('E(X) = n \\cdot p')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra la varianza del modelo binomial (${k('V(X) = n \\cdot p \\cdot (1 - p)')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Muestra la dispersión estándar (${k('\\sigma = \\sqrt{n \\cdot p \\cdot (1 - p)}')}) de la cantidad de éxitos.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfico de Bastones',
            description: `Muestra las probabilidades de obtener desde 0 hasta ${k('n')} éxitos, resaltando en color naranja las barras de la condición calculada.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 15C: DISTRIBUCIÓN DE POISSON (MODO MANUAL) ───
export const pasosPoissonManual = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución de Poisson (Modo Manual)',
            description: `Sirve para calcular la probabilidad de ocurrencias de un evento en un intervalo continuo con tasa promedio constante ${k('\\lambda')}.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de visualización.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-modelos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modelos de Distribución Discreta',
            description: 'Sirve para seleccionar el modelo de Poisson para el conteo de eventos independientes por unidad de tiempo o espacio.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre el ingreso manual de la tasa media y el ajuste sobre matriz de datos.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-poisson-lambda',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tasa Media (λ)',
            description: `Sirve para ingresar el promedio esperado de ocurrencias (${k('\\lambda > 0')}) en el intervalo de referencia.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-poisson-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Función de Probabilidad de Poisson',
            description: `Muestra la fórmula de Poisson ${k('P(X=x) = \\frac{\\lambda^x e^{-\\lambda}}{x!}')} con la tasa media sustituida.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Generar Distribución',
            description: 'Haz clic aquí para validar el parámetro y habilitar la consulta de condiciones de probabilidad y gráficos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición de Búsqueda',
            description: `Sirve para indicar el número de eventos a consultar (${k('X = x')}, ${k('X \\le x')}, ${k('X \\ge x')} o intervalo).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-calcular-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Condición',
            description: 'Haz clic aquí para calcular la probabilidad exacta de la condición seleccionada y actualizar el gráfico.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-resultado-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad Calculada',
            description: 'Muestra el desarrollo de la fórmula de Poisson con la constante de Euler e y el factorial sustituidos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra la media teórica de ocurrencias (${k('E(X) = \\lambda')}), idéntica a la tasa ingresada.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra la varianza del modelo (${k('V(X) = \\lambda')}), que en Poisson es exactamente igual a la media.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Muestra la dispersión estándar típica (${k('\\sigma = \\sqrt{\\lambda}')}) en el conteo de eventos.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfico de Bastones',
            description: 'Muestra las probabilidades de ocurrencia para cada cantidad de eventos x, con la condición destacada en naranja.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 15D: DISTRIBUCIÓN HIPERGEOMÉTRICA (MODO MANUAL) ───
export const pasosHipergeometricaManual = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Hipergeométrica (Modo Manual)',
            description: 'Sirve para calcular probabilidades en muestreos sin reemplazo de una población finita dividida en éxitos y fracasos.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de visualización.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-modelos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modelos de Distribución Discreta',
            description: 'Sirve para seleccionar la distribución Hipergeométrica para extracciones dependientes sin reposición.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre el ingreso manual de los parámetros poblacionales y el ajuste sobre matriz de datos.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-hiper-N',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tamaño de la Población (N)',
            description: `Sirve para ingresar el total de elementos que componen la población finita (${k('N')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-hiper-K',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Éxitos en la Población (N₁)',
            description: `Sirve para ingresar la cantidad de elementos en la población que poseen la característica de éxito (${k('N_1')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-hiper-N2',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Fracasos en la Población (N₂)',
            description: `Muestra la cantidad de elementos clasificados como fracaso (${k('N_2 = N - N_1')}) calculada automáticamente.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-hiper-n',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tamaño de la Muestra (n)',
            description: `Sirve para ingresar el número de elementos extraídos de la población sin reemplazo (${k('n')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-hiper-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Función de Probabilidad Hipergeométrica',
            description: `Muestra la fórmula hipergeométrica ${k('P(X=x) = \\frac{\\binom{N_1}{x}\\binom{N_2}{n-x}}{\\binom{N}{n}}')} con los parámetros poblacionales sustituidos.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Generar Distribución',
            description: 'Haz clic aquí para validar los parámetros y habilitar la consulta de condiciones de probabilidad y gráficos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición de Búsqueda',
            description: 'Sirve para definir el número de éxitos en la muestra que se desea consultar.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-btn-calcular-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Condición',
            description: 'Haz clic aquí para calcular la probabilidad exacta de la condición seleccionada y actualizar el gráfico.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-resultado-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad Calculada',
            description: 'Muestra la resolución combinatoria sin reemplazo y la probabilidad resultante en decimal y porcentaje.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra el valor esperado de éxitos en la muestra (${k('E(X) = n \\cdot \\frac{N_1}{N}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra la varianza de la distribución hipergeométrica incluyendo el factor de corrección por población finita (${k('\\frac{N-n}{N-1}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Muestra la dispersión estándar típica (${k('\\sigma = \\sqrt{V(X)}')}) de los éxitos en la muestra.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3discreta-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfico de Bastones',
            description: 'Muestra las probabilidades para cada posible cantidad de éxitos en la extracción sin reemplazo.',
            side: 'top',
            align: 'center'
        }
    }
];

// Alias para compatibilidad hacia atrás
export const pasosModelosDiscretosManual = pasosBinomialManual;

// ─── TOUR 16A: DISTRIBUCIÓN UNIFORME CONTINUA (ANÁLISIS DE MATRIZ) ───
export const pasosUniformeMatriz = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Uniforme Continua (Análisis de Matriz)',
            description: `Sirve para ajustar una distribución continua donde todos los intervalos de igual longitud tienen idéntica probabilidad entre los límites ${k('a')} y ${k('b')} estimados de la matriz.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Matriz de Datos',
            description: `Sirve para elegir la matriz de valores cuantitativos de la cual se estimarán los límites mínimo (${k('a')}) y máximo (${k('b')}).`,
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de trabajo y visualización de resultados.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modelos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modelos de Distribución Continua',
            description: 'Sirve para seleccionar la distribución Uniforme continua.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre estimar los parámetros a partir de datos cuantitativos de la matriz o ingresarlos manualmente.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-matriz-datos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Datos',
            description: 'Muestra el total de registros numéricos disponibles para estimar la distribución y permite editar la información mediante el botón "Editar Datos".',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-matriz-columna',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Columna de Análisis',
            description: 'Sirve para elegir la columna numérica de la cual se obtendrán el valor mínimo y máximo de la muestra.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-estimar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Estimar Parámetros',
            description: `Haz clic aquí para encontrar automáticamente el límite inferior (${k('a')}) y el límite superior (${k('b')}) en los datos.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-tabla-estimados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Parámetros Estimados',
            description: `Muestra el límite inferior (${k('a')}) y superior (${k('b')}) derivados de la columna de datos analizada.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-uniforme-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Función de Densidad Uniforme',
            description: `Muestra la expresión analítica ${k('f(x) = \\frac{1}{b - a}')} con los límites estimados de la muestra sustituidos.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Graficar Distribución',
            description: 'Haz clic aquí para trazar la función de densidad uniforme rectangular y habilitar la consulta de probabilidades.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-tipo-calculo',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Cálculo',
            description: `Sirve para elegir si se calculará una probabilidad acumulada directa (${k('P(X \\le x)')}) o un valor cuantil inverso para una probabilidad dada (${k('p')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición Lógica y Valores',
            description: 'Sirve para seleccionar el operador relacional e ingresar los límites numéricos de evaluación en la distribución uniforme.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Condición',
            description: 'Haz clic aquí para calcular el área bajo la curva o cuantil y sombrear la región en el gráfico.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-resultado-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad o Cuantil Calculado',
            description: `Muestra el cálculo de probabilidad o cuantil sobre el soporte continuo ${k('[a, b]')}.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra el centro de masa o punto medio del intervalo (${k('E(X) = \\frac{a + b}{2}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra la varianza de la distribución uniforme (${k('V(X) = \\frac{(b - a)^2}{12}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Muestra la dispersión estándar (${k('\\sigma = \\frac{b - a}{\\sqrt{12}}')}) en las unidades de los datos.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Curva de Densidad Rectangular',
            description: 'Muestra la forma gráfica constante de la distribución uniforme con el área de probabilidad resaltada.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 16B: DISTRIBUCIÓN NORMAL (ANÁLISIS DE MATRIZ) ───
export const pasosNormalMatriz = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Normal (Análisis de Matriz)',
            description: `Sirve para ajustar la curva de campana de Gauss estimando la media (${k('\\mu')}) y la desviación típica (${k('\\sigma')}) a partir de los datos de la matriz.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Matriz de Datos',
            description: 'Sirve para seleccionar la matriz de valores cuantitativos que se usará para calcular los parámetros de la curva normal.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de trabajo y visualización de resultados.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modelos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modelos de Distribución Continua',
            description: 'Sirve para seleccionar la distribución Normal de Gauss.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre estimar los parámetros a partir de datos numéricos reales (Análisis de Matriz) o ingresarlos de forma manual.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-matriz-datos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Datos',
            description: 'Muestra el total de registros numéricos disponibles para estimar la distribución y permite editar la información mediante el botón "Editar Datos".',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-matriz-columna',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Columna de Análisis',
            description: 'Sirve para seleccionar la columna numérica a partir de la cual se estimarán la media y desviación típica.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-estimar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Estimar Parámetros',
            description: `Haz clic aquí para calcular la media muestral (${k('\\bar{X}')}) y la desviación estándar (${k('S')}) de la columna seleccionada.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-tabla-estimados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Parámetros Estimados',
            description: `Muestra la media (${k('\\mu')}) y la desviación típica (${k('\\sigma')}) obtenidas de la muestra.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-normal-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Función de Densidad Normal',
            description: `Muestra la ecuación de la campana de Gauss ${k('f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}')} con la media y desviación estimadas sustituidas.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Graficar Distribución',
            description: 'Haz clic aquí para trazar la campana de Gauss y habilitar la sección de cálculo de probabilidades.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-tipo-calculo',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Cálculo',
            description: `Sirve para definir si calcularás una probabilidad directa acumulada (${k('P(X \\le x)')}) o un valor crítico inverso para una probabilidad dada (${k('p')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición Lógica y Valores',
            description: `Sirve para seleccionar el operador relacional (${k('P(X \\le x)')}, ${k('P(a \\le X \\le b)')}) e ingresar los valores numéricos correspondientes (${k('x')}, ${k('a')}, ${k('b')} o ${k('p')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Condición',
            description: 'Haz clic aquí para calcular el área bajo la curva normal o el cuantil inverso y colorear la región.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-resultado-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad o Valor Crítico Calculado',
            description: `Muestra el proceso de tipificación a la variable estándar (${k('Z = \\frac{x - \\mu}{\\sigma}')}) y el resultado numérico obtenido.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra el centro de simetría de la campana (${k('E(X) = \\mu')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra la varianza de la distribución normal (${k('V(X) = \\sigma^2')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Muestra la dispersión estándar (${k('\\sigma')}) que define el ancho de la campana.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Campana de Gauss',
            description: 'Muestra la forma gráfica continua de la distribución normal simétrica con el área coloreada calculada.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 16C: DISTRIBUCIÓN CHI-CUADRADA (ANÁLISIS DE MATRIZ) ───
export const pasosChiCuadradoMatriz = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Chi-cuadrada (Análisis de Matriz)',
            description: `Sirve para modelar varianzas muestrales y contrastes estadísticos estimando los grados de libertad (${k('v')}) a partir de la muestra en la matriz.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Matriz de Datos',
            description: 'Sirve para seleccionar la matriz de valores continuos de la cual se calcularán los grados de libertad.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de trabajo y visualización de resultados.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modelos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modelos de Distribución Continua',
            description: `Sirve para seleccionar la distribución Chi-cuadrada (${k('\\chi^2')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre estimar los grados de libertad a partir de los datos o ingresarlos de forma manual.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-matriz-datos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Datos',
            description: 'Muestra el número de datos numéricos disponibles en la matriz para la estimación del modelo.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-matriz-columna',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Columna de Análisis',
            description: 'Sirve para elegir la columna cuantitativa de la cual se cuantificará el tamaño muestral.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-estimar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Estimar Parámetros',
            description: `Haz clic aquí para calcular el número de observaciones y obtener los grados de libertad (${k('v = N - 1')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-tabla-estimados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Parámetros Estimados',
            description: `Muestra los grados de libertad (${k('v')}) obtenidos de la muestra.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-chi-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Función de Densidad Chi-cuadrada',
            description: `Muestra la función de densidad con la función Gamma y los grados de libertad ${k('v')} sustituidos.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Graficar Distribución',
            description: 'Haz clic aquí para trazar la curva asimétrica Chi-cuadrada y habilitar la consulta de probabilidades.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-tipo-calculo',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Cálculo',
            description: `Sirve para alternar entre calcular la probabilidad acumulada bajo la curva o el valor crítico inverso ${k('\\chi^2')} para una probabilidad dada (${k('p')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición Lógica y Valores',
            description: `Sirve para seleccionar el tipo de cola (menor o igual, mayor o igual, intervalo) e ingresar el valor numérico ${k('\\chi^2')} o la probabilidad ${k('p')}.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Condición',
            description: 'Haz clic aquí para calcular el área bajo la curva o cuantil y sombrear la región en el gráfico.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-resultado-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad o Valor Crítico Calculado',
            description: 'Muestra el área bajo la curva o el cuantil crítico Chi-cuadrada resultante.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra la media teórica (${k('E(X) = v')}), que coincide exactamente con los grados de libertad.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra la varianza del modelo Chi-cuadrada (${k('V(X) = 2v')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Muestra la dispersión estándar típica (${k('\\sigma = \\sqrt{2v}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Curva de Densidad Chi-cuadrada',
            description: 'Muestra la forma gráfica asimétrica positiva de la curva Chi-cuadrada con el área evaluada sombreada.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 16D: DISTRIBUCIÓN F DE FISHER (ANÁLISIS DE MATRIZ) ───
export const pasosFFisherMatriz = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución F de Fisher (Análisis de Matriz)',
            description: `Sirve para comparar las varianzas de dos grupos de datos independientes estimando sus grados de libertad (${k('n')} y ${k('m')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Matriz de Datos',
            description: 'Sirve para elegir la matriz de datos cuantitativos que contiene las variables a contrastar.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de trabajo y visualización de resultados.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modelos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modelos de Distribución Continua',
            description: 'Sirve para seleccionar la distribución F de Fisher.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre estimar los parámetros a partir de datos numéricos o ingresarlos de forma manual.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-matriz-datos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Datos',
            description: 'Muestra el total de registros numéricos disponibles para la estimación de los dos grupos muestrales.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-matriz-columna',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Columnas de Análisis',
            description: 'Sirve para seleccionar las dos columnas numéricas a comparar (numerador y denominador).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-estimar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Estimar Parámetros',
            description: `Haz clic aquí para calcular los tamaños de muestra y grados de libertad (${k('n = n_1 - 1')}, ${k('m = n_2 - 1')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-tabla-estimados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Parámetros Estimados',
            description: `Muestra los grados de libertad del numerador (${k('n')}) y denominador (${k('m')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-fisher-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Función de Densidad F de Fisher',
            description: 'Muestra la expresión analítica de la distribución F con los grados de libertad sustituidos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Graficar Distribución',
            description: 'Haz clic aquí para trazar la curva de densidad F y habilitar el panel de cálculo de probabilidades.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-tipo-calculo',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Cálculo',
            description: `Sirve para seleccionar si calcularás la probabilidad acumulada bajo la curva F o el valor crítico inverso para una significancia dada (${k('p')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición Lógica y Valores',
            description: `Sirve para elegir la desigualdad relacional (${k('P(F \\le x)')}, ${k('P(F \\ge x)')}) e ingresar el cuantil ${k('F')} o la probabilidad ${k('p')}.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Condición',
            description: 'Haz clic aquí para calcular el área bajo la curva o cuantil crítico F y colorear la región.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-resultado-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad o Valor Crítico Calculado',
            description: 'Muestra el valor de probabilidad o el cuantil crítico F resultante del modelo.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra la media teórica (${k('E(X) = \\frac{m}{m - 2}')} para ${k('m > 2')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra la varianza teórica de la distribución F (${k('V(X) = \\frac{2m^2(n+m-2)}{n(m-2)^2(m-4)}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Muestra la dispersión estándar (${k('\\sigma = \\sqrt{V(X)}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Curva de Densidad F',
            description: 'Muestra la forma gráfica continua de la distribución F con el área correspondiente sombreada.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 16E: DISTRIBUCIÓN T DE STUDENT (ANÁLISIS DE MATRIZ) ───
export const pasosTStudentMatriz = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución T de Student (Análisis de Matriz)',
            description: `Sirve para inferencias sobre la media en muestras con varianza desconocida estimando los grados de libertad (${k('n')}) a partir de la matriz.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Matriz de Datos',
            description: 'Sirve para elegir la matriz de valores cuantitativos a analizar.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de trabajo y visualización de resultados.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modelos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modelos de Distribución Continua',
            description: 'Sirve para seleccionar la distribución T de Student.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre estimar los grados de libertad a partir de datos numéricos o ingresarlos manualmente.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-matriz-datos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Datos',
            description: 'Muestra el número de datos numéricos disponibles en la matriz para la estimación de los grados de libertad.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-matriz-columna',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Columna de Análisis',
            description: 'Sirve para seleccionar la columna numérica de la cual se determinarán los grados de libertad.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-estimar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Estimar Parámetros',
            description: `Haz clic aquí para obtener los grados de libertad (${k('n = N - 1')}) de la columna de datos.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-tabla-estimados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Parámetros Estimados',
            description: `Muestra los grados de libertad (${k('n')}) calculados de la muestra.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-student-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Función de Densidad T de Student',
            description: 'Muestra la curva simétrica de Student con los grados de libertad calculados sustituidos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Graficar Distribución',
            description: 'Haz clic aquí para trazar la curva acampanada de Student y habilitar el panel de probabilidades.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-tipo-calculo',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Cálculo',
            description: `Sirve para definir si calcularás una probabilidad directa (${k('P(T \\le t)')}) o el valor crítico inverso ${k('t')} para una probabilidad acumulada dada (${k('p')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición Lógica y Valores',
            description: `Sirve para seleccionar el tipo de cola e ingresar el valor de prueba ${k('t')} o el nivel de probabilidad ${k('p')}.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Condición',
            description: 'Haz clic aquí para calcular el área bajo la curva o cuantil t y sombrear la región.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-resultado-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad o Valor Crítico Calculado',
            description: 'Muestra la probabilidad o el cuantil crítico t resultante del modelo.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra la media simétrica (${k('E(X) = 0')} para ${k('n > 1')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra la varianza teórica (${k('V(X) = \\frac{n}{n - 2}')} para ${k('n > 2')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Muestra la dispersión estándar típica (${k('\\sigma = \\sqrt{\\frac{n}{n - 2}}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Curva de Densidad T de Student',
            description: 'Muestra la forma gráfica simétrica con las colas pesadas de la distribución T de Student y el área sombreada.',
            side: 'top',
            align: 'center'
        }
    }
];

// Alias para compatibilidad hacia atrás
export const pasosModelosContinuosMatriz = pasosNormalMatriz;

// ─── TOUR 17A: DISTRIBUCIÓN UNIFORME CONTINUA (MODO MANUAL) ───
export const pasosUniformeManual = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Uniforme Continua (Modo Manual)',
            description: `Sirve para calcular probabilidades de una variable continua con función de densidad constante en el intervalo ${k('[a, b]')} ingresando sus límites directamente.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de visualización.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modelos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modelos de Distribución Continua',
            description: 'Sirve para seleccionar la distribución Uniforme continua.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre el ingreso manual de los límites y el ajuste sobre matriz de datos.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-uniforme-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Función de Densidad Uniforme',
            description: `Muestra la función de densidad constante ${k('f(x) = \\frac{1}{b - a}')} válida en el intervalo ${k('[a, b]')}.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-uniforme-a',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Límite Inferior (a)',
            description: `Sirve para ingresar el valor mínimo posible (${k('a')}) de la variable en el intervalo.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-uniforme-b',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Límite Superior (b)',
            description: `Sirve para ingresar el valor máximo posible (${k('b')}) de la variable (${k('b > a')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Graficar Distribución',
            description: 'Haz clic aquí para trazar la función de densidad y habilitar la sección de consulta de probabilidades.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-tipo-calculo',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Cálculo',
            description: `Sirve para elegir entre calcular la probabilidad acumulada directa o el cuantil inverso para un valor de probabilidad dado (${k('p')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición Lógica y Valores',
            description: 'Sirve para definir el intervalo de evaluación e ingresar los límites numéricos a evaluar dentro del rango uniforme.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Condición',
            description: 'Haz clic aquí para calcular el área bajo la curva o cuantil y sombrear la región en el gráfico.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-resultado-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad o Cuantil Calculado',
            description: `Muestra el procedimiento de cálculo sobre el soporte ${k('[a, b]')} y el resultado final obtenido.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra el punto medio del intervalo (${k('E(X) = \\frac{a+b}{2}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra la varianza del modelo uniforme (${k('V(X) = \\frac{(b-a)^2}{12}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Muestra la dispersión estándar típica (${k('\\sigma = \\frac{b-a}{\\sqrt{12}}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Curva de Densidad Rectangular',
            description: 'Muestra la forma gráfica constante de la distribución uniforme con el área de probabilidad sombreada.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 17B: DISTRIBUCIÓN NORMAL (MODO MANUAL) ───
export const pasosNormalManual = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Normal (Modo Manual)',
            description: `Sirve para calcular probabilidades bajo la campana de Gauss especificando manualmente la media (${k('\\mu')}) y la desviación típica (${k('\\sigma')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de visualización.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modelos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modelos de Distribución Continua',
            description: 'Sirve para seleccionar la distribución Normal de Gauss.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre el ingreso manual de parámetros teóricos y el análisis sobre matriz de datos.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-normal-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Función de Densidad Normal',
            description: `Muestra la ecuación de la campana de Gauss ${k('f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}')} con la media y desviación sustituidas.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-normal-mu',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Media (μ)',
            description: `Sirve para ingresar la media o centro de simetría de la distribución (${k('\\mu')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-normal-sigma',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Sirve para ingresar la desviación estándar (${k('\\sigma > 0')}) que define la amplitud de la campana.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Graficar Distribución',
            description: 'Haz clic aquí para trazar la campana de Gauss y habilitar la sección de consulta de probabilidades.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-tipo-calculo',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Cálculo',
            description: `Sirve para definir si calcularás una probabilidad acumulada directa (${k('P(X \\le x)')}) o un valor crítico inverso para una probabilidad dada (${k('p')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición Lógica y Valores',
            description: `Sirve para seleccionar la desigualdad o intervalo e ingresar los valores numéricos correspondientes (${k('x')}, ${k('a')}, ${k('b')} o ${k('p')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Condición',
            description: 'Haz clic aquí para calcular el área bajo la curva normal o el cuantil inverso y colorear la región.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-resultado-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad o Valor Crítico Calculado',
            description: `Muestra el proceso de tipificación a la variable estándar (${k('Z = \\frac{x - \\mu}{\\sigma}')}) y el resultado numérico obtenido.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra el centro de simetría de la campana (${k('E(X) = \\mu')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra la varianza de la distribución normal (${k('V(X) = \\sigma^2')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Muestra la dispersión estándar (${k('\\sigma')}) que define el ancho de la campana.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Campana de Gauss',
            description: 'Muestra la forma gráfica continua de la distribución normal simétrica con el área de probabilidad resaltada.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 17C: DISTRIBUCIÓN NORMAL ESTÁNDAR (MODO MANUAL) ───
export const pasosNormalEstandarManual = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Normal Estándar (Modo Manual)',
            description: `Sirve para calcular probabilidades o cuantiles sobre la curva de Gauss estandarizada con parámetros fijos ${k('\\mu = 0')} y ${k('\\sigma = 1')}.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de visualización.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modelos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modelos de Distribución Continua',
            description: `Sirve para seleccionar la distribución Normal Estándar (${k('Z')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Muestra que el modelo estándar opera en modo manual al tener sus parámetros fijos por definición.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-estandar-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Función de Densidad Normal Estándar',
            description: `Muestra la expresión analítica canónica ${k('f(z) = \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{1}{2}z^2}')}.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-estandar-params',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros Canónicos Fijos',
            description: `Muestra los parámetros universales inmutables de la normal estándar: media nula (${k('\\mu = 0')}) y desviación unitaria (${k('\\sigma = 1')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Graficar Distribución',
            description: 'Haz clic aquí para trazar la campana normal tipificada y habilitar la sección de probabilidades.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-tipo-calculo',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Cálculo',
            description: `Sirve para elegir si calcularás una probabilidad acumulada tipificada (${k('P(Z \\le z)')}) o el valor crítico tipificado inverso (${k('z')}) para una probabilidad dada (${k('p')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición Lógica y Valores',
            description: `Sirve para seleccionar el tipo de cola o intervalo e ingresar el valor tipificado ${k('z')} o la probabilidad ${k('p')}.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Condición',
            description: 'Haz clic aquí para calcular el área tipificada o el cuantil z y colorear la región en el gráfico.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-resultado-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad o Valor Crítico Calculado',
            description: 'Muestra el valor de la integral de Gauss tipificada o el cuantil z obtenido.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra la media nula de la normal estándar (${k('E(Z) = 0')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra la varianza unitaria del modelo tipificado (${k('V(Z) = 1')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Muestra la desviación estándar unitaria (${k('\\sigma = 1')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Campana Estándar Z',
            description: 'Muestra la campana simétrica centrada en cero con la probabilidad calculada resaltada.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 17D: DISTRIBUCIÓN CHI-CUADRADA (MODO MANUAL) ───
export const pasosChiCuadradoManual = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Chi-cuadrada (Modo Manual)',
            description: `Sirve para evaluar probabilidades y valores críticos de la distribución Chi-cuadrada ingresando directamente los grados de libertad (${k('v')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de visualización.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modelos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modelos de Distribución Continua',
            description: `Sirve para seleccionar la distribución Chi-cuadrada (${k('\\chi^2')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre el ingreso manual de los grados de libertad y el ajuste sobre matriz de datos.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-chi-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Función de Densidad Chi-cuadrada',
            description: `Muestra la expresión matemática de la curva basada en la función Gamma con los grados de libertad ${k('v')} sustituidos.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-chi-k',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Grados de Libertad (v)',
            description: `Sirve para ingresar el número de grados de libertad enteros (${k('v \\ge 1')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Graficar Distribución',
            description: 'Haz clic aquí para trazar la curva asimétrica Chi-cuadrada y habilitar la consulta de probabilidades.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-tipo-calculo',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Cálculo',
            description: `Sirve para alternar entre el cálculo de probabilidad acumulada directa o el valor crítico inverso ${k('\\chi^2')} para una probabilidad dada (${k('p')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición Lógica y Valores',
            description: `Sirve para definir el sentido de la desigualdad e ingresar el cuantil ${k('\\chi^2')} o la probabilidad ${k('p')} correspondiente.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Condición',
            description: 'Haz clic aquí para calcular el área bajo la curva o cuantil y sombrear la región en el gráfico.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-resultado-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad o Valor Crítico Calculado',
            description: 'Muestra el área bajo la curva o el cuantil crítico Chi-cuadrada obtenido.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra la media teórica (${k('E(X) = v')}), idéntica a los grados de libertad ingresados.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra la varianza del modelo Chi-cuadrada (${k('V(X) = 2v')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Muestra la dispersión estándar típica (${k('\\sigma = \\sqrt{2v}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Curva de Densidad Chi-cuadrada',
            description: 'Muestra la forma gráfica asimétrica positiva con el área de la probabilidad calculada coloreada.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 17E: DISTRIBUCIÓN F DE FISHER (MODO MANUAL) ───
export const pasosFFisherManual = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución F de Fisher (Modo Manual)',
            description: `Sirve para calcular probabilidades y cuantiles críticos de la razón F indicando los grados de libertad de ambos grupos (${k('n')} y ${k('m')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de visualización.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modelos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modelos de Distribución Continua',
            description: 'Sirve para seleccionar la distribución F de Fisher.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre el ingreso manual de los grados de libertad y el ajuste sobre matriz de datos.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-fisher-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Función de Densidad F de Fisher',
            description: 'Muestra la fórmula de densidad de Fisher con los grados de libertad del numerador y denominador sustituidos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-fisher-v1',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Grados de Libertad del Numerador (n)',
            description: `Sirve para ingresar los grados de libertad del primer grupo o numerador (${k('n \\ge 1')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-fisher-v2',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Grados de Libertad del Denominador (m)',
            description: `Sirve para ingresar los grados de libertad del segundo grupo o denominador (${k('m \\ge 1')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Graficar Distribución',
            description: 'Haz clic aquí para trazar la curva de densidad F y habilitar el cálculo de probabilidades.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-tipo-calculo',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Cálculo',
            description: `Sirve para seleccionar si se evaluará la probabilidad acumulada directa o el valor crítico inverso ${k('F')} para pruebas estadísticas de varianzas.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición Lógica y Valores',
            description: `Sirve para elegir el operador de cola e ingresar el cuantil ${k('F')} o la probabilidad ${k('p')} deseada.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Condición',
            description: 'Haz clic aquí para calcular el área bajo la curva o cuantil crítico F y colorear la región.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-resultado-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad o Valor Crítico Calculado',
            description: 'Muestra el valor de probabilidad o el cuantil crítico F resultante del modelo.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra la media teórica (${k('E(X) = \\frac{m}{m - 2}')} para ${k('m > 2')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra la varianza teórica de la distribución F (${k('V(X) = \\frac{2m^2(n+m-2)}{n(m-2)^2(m-4)}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Muestra la dispersión estándar (${k('\\sigma = \\sqrt{V(X)}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Curva de Densidad F',
            description: 'Muestra la forma gráfica continua de la distribución F con el área correspondiente sombreada.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 17F: DISTRIBUCIÓN T DE STUDENT (MODO MANUAL) ───
export const pasosTStudentManual = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución T de Student (Modo Manual)',
            description: `Sirve para inferencias estadísticas en muestras con varianza desconocida ingresando directamente sus grados de libertad (${k('n')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de visualización.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modelos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modelos de Distribución Continua',
            description: 'Sirve para seleccionar la distribución T de Student.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre el ingreso manual de los grados de libertad y el ajuste sobre matriz de datos.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-student-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Función de Densidad T de Student',
            description: 'Muestra la fórmula analítica de Student con los grados de libertad sustituidos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-student-n',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Grados de Libertad (n)',
            description: `Sirve para ingresar el número de grados de libertad (${k('n \\ge 1')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Graficar Distribución',
            description: 'Haz clic aquí para trazar la curva acampanada de Student y habilitar la sección de consulta de probabilidades.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-tipo-calculo',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Cálculo',
            description: `Sirve para elegir si se calculará una probabilidad directa bajo la curva T o el cuantil inverso para un nivel de probabilidad dado (${k('p')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición Lógica y Valores',
            description: `Sirve para seleccionar la desigualdad o intervalo e ingresar el valor ${k('t')} o la probabilidad ${k('p')}.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-btn-calcular-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Condición',
            description: 'Haz clic aquí para calcular el área bajo la curva o cuantil t y sombrear la región.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-resultado-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad o Valor Crítico Calculado',
            description: 'Muestra la probabilidad o el cuantil crítico t resultante del modelo.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra la media simétrica (${k('E(X) = 0')} para ${k('n > 1')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra la varianza teórica (${k('V(X) = \\frac{n}{n - 2}')} para ${k('n > 2')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar (σ)',
            description: `Muestra la dispersión estándar típica (${k('\\sigma = \\sqrt{\\frac{n}{n - 2}}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t3continua-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Curva de Densidad T de Student',
            description: 'Muestra la forma gráfica simétrica con las colas pesadas de la distribución T de Student y el área sombreada.',
            side: 'top',
            align: 'center'
        }
    }
];

// Alias para compatibilidad hacia atrás
export const pasosModelosContinuosManual = pasosNormalManual;
