import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renderiza una expresión matemática en HTML usando KaTeX para los tooltips de Tema 4
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
 * GUÍA INTERACTIVA DE APRENDIZAJE - TEMA 4: DISTRIBUCIONES EN EL MUESTREO
 * ==============================================================================
 * Submódulo hijo importado por Guia.js (padre).
 * Controla:
 * 1. Distribuciones Muestrales (Demostración Empírica)
 * 2. Distribuciones Muestrales (Calculadora de Probabilidades)
 * 3. Distribuciones T y F
 */

// ─── TOUR 4A: DISTRIBUCIONES MUESTRALES (DEMOSTRACIÓN EMPÍRICA) ───
export const pasosDistribucionesMuestralesEmpirica = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 4: Distribuciones Muestrales',
            description: `Sirve para estudiar el comportamiento probabilístico de los estadísticos muestrales (${k('\\bar{X}')}, ${k('S^2')}, ${k('\\hat{p}')}) generados exhaustivamente a partir de todas las muestras posibles de tamaño ${k('n')} de una población finita.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Variable Poblacional',
            description: 'Sirve para elegir la variable que contiene los datos cuantitativos o cualitativos de la población a muestrear.',
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
        element: '#tour-t4-modos-muestrales',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Distribución Muestral',
            description: 'Sirve para alternar entre la Demostración Empírica (generación exhaustiva de todas las muestras posibles) y la Calculadora de Probabilidades Muestrales teórica.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-datos-resumen',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Población y Edición de Datos',
            description: `Muestra el tamaño de la población ${k('N')} cargada y el botón Editar Datos para modificar o agregar valores al espacio muestral poblacional.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-parametro-calculo',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetro / Estadístico a Calcular',
            description: `Sirve para seleccionar el estadístico a evaluar: Promedios (${k('\\bar{X}')}), Proporciones (${k('\\hat{p}')}) o Varianzas (${k('S^2')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-atributo-exito',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Atributo de Éxito',
            description: `Sirve para definir qué categoría de la variable cualitativa se considerará como éxito para calcular la proporción muestral ${k('\\hat{p} = \\frac{x}{n}')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-tamano-muestra',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tamaño de la Muestra (n)',
            description: `Sirve para ingresar el tamaño de muestra ${k('n')}. En muestreo sin reemplazo no puede superar al total poblacional ${k('N')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-tipo-muestreo',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Muestreo',
            description: `Sirve para elegir si el muestreo es Con Reemplazo (${k('N^n')} muestras) o Sin Reemplazo (${k('\\binom{N}{n}')} muestras con factor de corrección por población finita).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Generar Distribución Muestral',
            description: 'Haz clic aquí para extraer exhaustivamente todas las muestras posibles, tabular sus estadísticos y comparar los valores empíricos con los parámetros teóricos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-tabla-muestras',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Muestras Posibles y Estadísticos',
            description: `Muestra cada muestra extraída sistemáticamente junto a los valores observados y el cálculo individual de su estadístico (${k('\\bar{x}')}, ${k('S^2')} o ${k('\\hat{p}')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-tabla-distribucion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución de Probabilidad del Estadístico',
            description: 'Muestra los valores únicos obtenidos del estadístico junto a sus frecuencias relativas y probabilidades puntuales asociadas.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-esperanza-muestral',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Muestral (Insesgadez)',
            description: `Demuestra matemáticamente que el valor esperado del estadístico muestral coincide exactamente con el parámetro poblacional (${k('E(\\bar{X}) = \\mu')}, ${k('E(S^2) = \\sigma^2')} o ${k('E(\\hat{p}) = P')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-varianza-muestral',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza de la Distribución Muestral',
            description: `Muestra la dispersión del estadístico y confirma la aplicación del factor de corrección por población finita (${k('\\frac{N-n}{N-1}')}) cuando el muestreo es sin reemplazo.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-distribucion-aproximada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Teórica Límite',
            description: `Muestra el modelo teórico (${k('\\bar{X} \\sim N(\\mu, \\sigma^2/n)')} o Chi-cuadrada con ${k('n-1')} grados de libertad) predicho por el Teorema del Límite Central.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 4B: CALCULADORA DE PROBABILIDADES MUESTRALES (FALLBACK GENÉRICO) ───
export const pasosDistribucionesMuestralesCalculadora = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calculadora de Probabilidades Muestrales',
            description: 'Sirve para calcular probabilidades acumuladas e intervalos para estadísticos muestrales bajo supuestos de normalidad o muestras grandes.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de trabajo.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-modos-muestrales',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Distribución Muestral',
            description: 'Muestra seleccionado el modo Calculadora de Probabilidades para inferencia directa sobre medias, varianzas y proporciones.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-selector-distribucion-teorica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selector de Distribución Muestral',
            description: 'Sirve para seleccionar el escenario muestral: Normal (Medias), Proporciones, Diferencia de Medias, Varianza Muestral o Diferencia de Proporciones.',
            side: 'bottom',
            align: 'center'
        }
    }
];

// ─── TOUR 4B.1: MEDIA CON VARIANZA CONOCIDA (NORMAL) ───
export const pasosCalculadoraMediaVarianzaConocida = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 4: Media con Varianza Conocida',
            description: `Sirve para estudiar el comportamiento probabilístico de la media muestral ${k('\\bar{X}')} cuando se extraen muestras de tamaño ${k('n')} de una población con media ${k('\\mu')} y varianza conocida ${k('\\sigma^2')}.\nMuestra la aplicación analítica del Teorema del Límite Central y las propiedades de la distribución normal.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de visualización del gráfico y los resultados analíticos.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-modos-muestrales',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modo Calculadora de Probabilidades',
            description: 'Sirve para alternar entre la demostración empírica de muestras finitas y la calculadora analítica de probabilidades muestrales teóricas.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-selector-distribucion-teorica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución de la Media con Varianza Conocida',
            description: `Muestra seleccionada la distribución de la media muestral ${k('\\bar{X} \\sim N\\left(\\mu, \\frac{\\sigma^2}{n}\\right)')}.\nHaz clic en este selector para cambiar entre las 5 distribuciones muestrales disponibles.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4calc-tipo-poblacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Población (Infinita o Finita)',
            description: `Sirve para definir si el muestreo proviene de una población infinita o de una población finita de tamaño ${k('N')}.\nDetermina si es necesario aplicar el factor de corrección por población finita ${k('\\sqrt{\\frac{N-n}{N-1}}')} al error estándar ${k('\\sigma_{\\bar{X}}')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4calc-media-poblacional',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Media Poblacional (${k('\\mu')})`,
            description: `Sirve para ingresar el promedio o valor esperado de la población original.\nMuestra el parámetro central ${k('\\mu')}, el cual coincide con el valor esperado de la media muestral ${k('E(\\bar{X}) = \\mu')} por propiedad de insesgadez.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4calc-dispersion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Dispersión Poblacional (${k('\\sigma^2')} o ${k('\\sigma')})`,
            description: `Sirve para ingresar la varianza poblacional conocida ${k('\\sigma^2')} o la desviación estándar ${k('\\sigma')}.\nPermite alternar entre ambas unidades mediante los botones selectores para mayor comodidad.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4calc-tamano-muestra',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Tamaño de la Muestra (${k('n')})`,
            description: `Sirve para definir el número de observaciones muestrales recolectadas.\nMuestra el valor de ${k('n')}, el cual modula la precisión de la estimación dividiendo la dispersión entre ${k('\\sqrt{n}')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4calc-tamano-poblacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Tamaño de la Población (${k('N')})`,
            description: `Sirve para especificar el total de elementos de la población finita cuando se muestrea sin reemplazo.\nEs requerido para calcular el factor de corrección finita ${k('\\sqrt{\\frac{N-n}{N-1}}')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4calc-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Parámetros Muestrales',
            description: `Sirve para procesar los datos ingresados y calcular la media de medias ${k('E(\\bar{X})')}, la varianza muestral ${k('V(\\bar{X})')} y el error estándar ${k('\\sigma_{\\bar{X}}')}.\nHabilita inmediatamente el panel de formulación de probabilidades y el gráfico.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4calc-parametros-estimados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros de la Media Muestral',
            description: `Muestra las tarjetas con los parámetros teóricos calculados:\n<b>-</b> <b>Media esperada:</b> ${k('E(\\bar{X}) = \\mu')}\n<b>-</b> <b>Varianza muestral:</b> ${k('V(\\bar{X}) = \\frac{\\sigma^2}{n}')}\n<b>-</b> <b>Error estándar:</b> ${k('\\sigma_{\\bar{X}} = \\frac{\\sigma}{\\sqrt{n}}')}`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4calc-condicion-busqueda',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición de Probabilidad y Valores Críticos',
            description: `Sirve para definir la pregunta de probabilidad seleccionando la región de interés:\n<b>-</b> Menor o igual: ${k('P(\\bar{X} \\le x)')}\n<b>-</b> Mayor o igual: ${k('P(\\bar{X} \\ge x)')}\n<b>-</b> Intervalo: ${k('P(x_1 \\le \\bar{X} \\le x_2)')}\nPermite ingresar los valores críticos de ${k('\\bar{X}')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4calc-btn-graficar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Graficar y Calcular Probabilidad',
            description: `Sirve para ejecutar la estandarización tipificada ${k('Z = \\frac{\\bar{X} - \\mu}{\\sigma/\\sqrt{n}}')}, computar la probabilidad exacta y dibujar la curva de densidad con su área sombreada.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4calc-grafica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfica de la Curva Normal Muestral',
            description: `Muestra la campana de Gauss centrada en ${k('\\mu')} con su escala en unidades de ${k('\\bar{X}')}.\nVisualiza con precisión los puntos críticos y resalta el área bajo la curva que representa la probabilidad acumulada requerida.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4calc-resultados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Estandarización Z y Probabilidad Final',
            description: `Muestra el desarrollo analítico paso a paso:\n<b>-</b> La fórmula de transformación a la escala estándar ${k('Z')}.\n<b>-</b> Los valores tipificados ${k('z')}.\n<b>-</b> La probabilidad acumulada final ${k('P')}.\nIncluye un botón interactivo para consultar la tabla de la distribución normal estándar.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 4B.2: PROPORCIÓN MUESTRAL ───
export const pasosCalculadoraProporcion = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 4: Distribución de una Proporción',
            description: `Sirve para estudiar el comportamiento probabilístico de la proporción muestral ${k('\\hat{p} = \\frac{x}{n}')} de éxitos en muestras aleatorias de tamaño ${k('n')}.\nMuestra la aproximación de la distribución binomial a la normal bajo el supuesto ${k('np \\ge 5')} y ${k('n(1-p) \\ge 5')}.`,
            side: 'bottom',
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
        element: '#tour-t4-modos-muestrales',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Distribución Muestral',
            description: 'Sirve para alternar entre la Demostración Empírica y la Calculadora de Probabilidades analítica.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-selector-distribucion-teorica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución de una Proporción Muestral',
            description: `Muestra seleccionada la distribución de proporciones ${k('\\hat{p} \\sim N\\left(p, \\frac{p(1-p)}{n}\\right)')}.\nPuedes desplegar el selector para navegar entre los otros modelos muestrales.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4prop-tipo-poblacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Población (Infinita o Finita)',
            description: `Sirve para definir si el muestreo de proporciones proviene de una población infinita o finita de tamaño ${k('N')}.\nDetermina si se aplicará el factor de corrección por finitud ${k('\\sqrt{\\frac{N-n}{N-1}}')} al error estándar ${k('\\sigma_{\\hat{p}}')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4prop-proporcion-poblacional',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Proporción Poblacional (${k('p')})`,
            description: `Sirve para ingresar la probabilidad teórica de éxito en la población de origen (valor entre 0 y 1).\nMuestra el parámetro ${k('p')}, el cual coincide con el valor esperado de la proporción muestral ${k('E(\\hat{p}) = p')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4prop-tamano-muestra',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Tamaño de la Muestra (${k('n')})`,
            description: `Sirve para ingresar la cantidad de observaciones o ensayos independientes de la muestra.\nMuestra el valor de ${k('n')}, el cual modula el error estándar ${k('\\sigma_{\\hat{p}} = \\sqrt{\\frac{p(1-p)}{n}}')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4prop-tamano-poblacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Tamaño de la Población (${k('N')})`,
            description: `Sirve para indicar el tamaño total de la población finita cuando se muestrea sin reposición.\nMuestra el valor de ${k('N')} necesario para ajustar el cálculo por población finita.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4prop-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Parámetros de la Proporción',
            description: `Sirve para evaluar la media esperada ${k('E(\\hat{p})')}, la varianza ${k('V(\\hat{p})')} y el error estándar ${k('\\sigma_{\\hat{p}}')}.\nHabilita los controles de cálculo de probabilidad y visualización gráfica.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4prop-parametros-estimados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros de la Proporción Muestral',
            description: `Muestra las tarjetas con las propiedades de la distribución muestral de proporciones:\n<b>-</b> <b>Media esperada:</b> ${k('E(\\hat{p}) = p')}\n<b>-</b> <b>Varianza:</b> ${k('V(\\hat{p}) = \\frac{p(1-p)}{n}')}\n<b>-</b> <b>Error estándar:</b> ${k('\\sigma_{\\hat{p}} = \\sqrt{\\frac{p(1-p)}{n}}')}`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4prop-condicion-busqueda',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición de Probabilidad sobre la Proporción',
            description: `Sirve para especificar el rango de proporciones a evaluar:\n<b>-</b> Menor o igual: ${k('P(\\hat{p} \\le x)')}\n<b>-</b> Mayor o igual: ${k('P(\\hat{p} \\ge x)')}\n<b>-</b> Intervalo: ${k('P(x_1 \\le \\hat{p} \\le x_2)')}\nPermite ingresar los umbrales de proporción entre 0 y 1.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4prop-btn-graficar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Graficar y Calcular Probabilidad',
            description: `Sirve para estandarizar el valor mediante ${k('Z = \\frac{\\hat{p} - p}{\\sigma_{\\hat{p}}}')}, calcular la probabilidad normal y trazar el gráfico de densidad sombreado.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4prop-grafica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfica de la Distribución de la Proporción',
            description: `Muestra la curva normal representativa de la proporción muestral centrada en ${k('p')}.\nResalta visualmente los valores de corte de proporción y el área bajo la curva equivalente a la probabilidad calculada.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4prop-resultados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Estandarización Z y Probabilidad de la Proporción',
            description: `Muestra el desarrollo formal del cálculo probabilístico:\n<b>-</b> Fórmula de estandarización ${k('Z = \\frac{\\hat{p} - p}{\\sigma_{\\hat{p}}}')}.\n<b>-</b> Valores tipificados ${k('z')}.\n<b>-</b> Probabilidad final acumulada ${k('P(\\hat{p})')}.\nIncluye acceso a la tabla normal estándar Z.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 4B.3: VARIANZA MUESTRAL (CHI-CUADRADA) ───
export const pasosCalculadoraVarianzaMuestral = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 4: Distribución de la Varianza Muestral',
            description: `Sirve para estudiar el comportamiento probabilístico de la varianza muestral ${k('S^2')} extraída de una población con distribución normal y varianza ${k('\\sigma^2')}.\nMuestra la aplicación de la distribución Chi-cuadrada basada en la propiedad ${k('\\frac{(n-1)S^2}{\\sigma^2} \\sim \\chi^2_{(n-1)}')}.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de trabajo y visualización.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-modos-muestrales',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Distribución Muestral',
            description: 'Sirve para alternar entre la Demostración Empírica y la Calculadora de Probabilidades analítica.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-selector-distribucion-teorica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución de la Varianza Muestral',
            description: `Muestra seleccionada la distribución de la varianza muestral ${k('S^2')}.\nPermite modelar analíticamente la variabilidad y dispersión esperada de las muestras.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4chi-dispersion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Dispersión Poblacional (${k('\\sigma^2')} o ${k('\\sigma')})`,
            description: `Sirve para ingresar la varianza ${k('\\sigma^2')} o la desviación estándar ${k('\\sigma')} conocida de la población normal de referencia.\nPuedes conmutar entre varianza o desviación con los botones de opción.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4chi-tamano-muestra',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Tamaño de la Muestra (${k('n')})`,
            description: `Sirve para ingresar el número de observaciones muestrales recolectadas (${k('n \\ge 2')}).\nDetermina directamente los grados de libertad de la distribución Chi-cuadrada: ${k('\\nu = n - 1')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4chi-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Parámetros de la Varianza Muestral',
            description: `Sirve para calcular los grados de libertad ${k('\\nu')}, la esperanza ${k('E(S^2)')}, la varianza ${k('V(S^2)')} y la desviación estándar ${k('\\sigma_{S^2}')}.\nHabilita la formulación de probabilidades y la visualización gráfica.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4chi-parametros-estimados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros de la Distribución de la Varianza',
            description: `Muestra las tarjetas con las propiedades teóricas de la varianza muestral:\n<b>-</b> <b>Grados de libertad:</b> ${k('\\nu = n - 1')}\n<b>-</b> <b>Media esperada:</b> ${k('E(S^2) = \\sigma^2')} (insesgadez)\n<b>-</b> <b>Varianza de ${k('S^2')}:</b> ${k('V(S^2) = \\frac{2\\sigma^4}{n-1}')}\n<b>-</b> <b>Desviación estándar:</b> ${k('\\sigma_{S^2}')}`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4chi-condicion-busqueda',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición de Probabilidad para la Varianza Muestral',
            description: `Sirve para plantear la probabilidad requerida sobre el estadístico ${k('S^2')}:\n<b>-</b> Menor o igual: ${k('P(S^2 \\le s^2)')}\n<b>-</b> Mayor o igual: ${k('P(S^2 \\ge s^2)')}\n<b>-</b> Intervalo: ${k('P(s_1^2 \\le S^2 \\le s_2^2)')}\nPermite ingresar los límites de varianza a contrastar.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4chi-btn-graficar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Graficar y Calcular Probabilidad Chi-cuadrada',
            description: `Sirve para transformar los valores de ${k('S^2')} a valores críticos ${k('\\chi^2 = \\frac{(n-1)S^2}{\\sigma^2}')}, integrar la función de densidad y trazar la curva asimétrica con el área sombreada.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4chi-grafica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfica de Densidad Chi-cuadrada',
            description: `Muestra la curva asimétrica positiva de la distribución Chi-cuadrada con ${k('n - 1')} grados de libertad.\nResalta las abscisas en escala de ${k('S^2')} y el área sombreada correspondiente a la probabilidad calculada.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4chi-resultados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Conversión Chi-cuadrada y Probabilidad Final',
            description: `Muestra el desarrollo analítico:\n<b>-</b> Relación de transformación ${k('\\chi^2 = \\frac{(n-1)S^2}{\\sigma^2}')}.\n<b>-</b> Estadísticos críticos tipificados ${k('\\chi^2')}.\n<b>-</b> Probabilidad final acumulada ${k('P(S^2)')}.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 4B.4: DIFERENCIA DE MEDIAS (VARIANZAS CONOCIDAS) ───
export const pasosCalculadoraDiferenciaMedias = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 4: Diferencia de Medias (Varianzas Conocidas)',
            description: `Sirve para calcular probabilidades asociadas a la diferencia entre las medias muestrales de dos poblaciones normales e independientes (${k('\\bar{X}_1 - \\bar{X}_2')}) con varianzas conocidas ${k('\\sigma_1^2')} y ${k('\\sigma_2^2')}.\nMuestra el modelo ${k('(\\bar{X}_1 - \\bar{X}_2) \\sim N\\left(\\mu_1 - \\mu_2, \\frac{\\sigma_1^2}{n_1} + \\frac{\\sigma_2^2}{n_2}\\right)')}.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de trabajo.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-modos-muestrales',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Distribución Muestral',
            description: 'Sirve para alternar entre la Demostración Empírica y la Calculadora de Probabilidades analítica.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-selector-distribucion-teorica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Diferencia de Medias con Varianzas Conocidas',
            description: 'Muestra seleccionada la distribución de la diferencia de medias muestrales. Permite contrastar dos tratamientos, grupos o poblaciones independientes.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4difmed-poblacion1',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros de la Población 1',
            description: `Sirve para ingresar los parámetros de la primera población o grupo:\n<b>-</b> Media poblacional: ${k('\\mu_1')}\n<b>-</b> Varianza o Desviación: ${k('\\sigma_1^2')} o ${k('\\sigma_1')}\n<b>-</b> Tamaño de muestra: ${k('n_1')}`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4difmed-poblacion2',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros de la Población 2',
            description: `Sirve para ingresar los parámetros de la segunda población o grupo independiente:\n<b>-</b> Media poblacional: ${k('\\mu_2')}\n<b>-</b> Varianza o Desviación: ${k('\\sigma_2^2')} o ${k('\\sigma_2')}\n<b>-</b> Tamaño de muestra: ${k('n_2')}`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4difmed-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Parámetros Combinados',
            description: `Sirve para calcular la diferencia esperada ${k('E(\\bar{X}_1 - \\bar{X}_2) = \\mu_1 - \\mu_2')}, la varianza conjunta ${k('V(\\bar{X}_1 - \\bar{X}_2)')} y el error estándar combinado.\nHabilita la sección de condición de probabilidad y graficación.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4difmed-parametros-estimados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Parámetros Combinados de ${k('\\bar{X}_1 - \\bar{X}_2')}`,
            description: `Muestra las tarjetas con los parámetros resultantes de la distribución combinada:\n<b>-</b> <b>Media esperada:</b> ${k('E(\\bar{X}_1 - \\bar{X}_2) = \\mu_1 - \\mu_2')}\n<b>-</b> <b>Varianza combinada:</b> ${k('V = \\frac{\\sigma_1^2}{n_1} + \\frac{\\sigma_2^2}{n_2}')}\n<b>-</b> <b>Error estándar:</b> ${k('\\sigma_{\\bar{X}_1 - \\bar{X}_2} = \\sqrt{\\frac{\\sigma_1^2}{n_1} + \\frac{\\sigma_2^2}{n_2}}')}`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4difmed-condicion-busqueda',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición de Comparación entre Medias',
            description: `Sirve para definir la probabilidad sobre la magnitud de la diferencia:\n<b>-</b> Menor o igual: ${k('P(\\bar{X}_1 - \\bar{X}_2 \\le d)')}\n<b>-</b> Mayor o igual: ${k('P(\\bar{X}_1 - \\bar{X}_2 \\ge d)')}\n<b>-</b> Intervalo: ${k('P(d_1 \\le \\bar{X}_1 - \\bar{X}_2 \\le d_2)')}\nPermite evaluar si una media supera a la otra por cierta diferencia ${k('d')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4difmed-btn-graficar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Graficar y Calcular Probabilidad de la Diferencia',
            description: `Sirve para tipificar la diferencia mediante ${k('Z = \\frac{(\\bar{X}_1 - \\bar{X}_2) - (\\mu_1 - \\mu_2)}{\\sigma_{\\bar{X}_1 - \\bar{X}_2}}')}, obtener la probabilidad en la tabla normal y graficar el área bajo la curva.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4difmed-grafica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfica de la Diferencia de Medias',
            description: `Muestra la curva normal centrada en ${k('\\mu_1 - \\mu_2')}.\nVisualiza los límites de corte ${k('d')} y resalta el área sombreada representativa de la probabilidad calculada.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4difmed-resultados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resultados y Estandarización de la Diferencia',
            description: `Muestra el procedimiento detallado:\n<b>-</b> Estandarización a la escala normal ${k('Z')}.\n<b>-</b> Valores críticos ${k('z')}.\n<b>-</b> Probabilidad resultante ${k('P(\\bar{X}_1 - \\bar{X}_2)')}.\nIncluye botón para consultar la tabla de la normal estándar.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 4B.5: DIFERENCIA DE PROPORCIONES ───
export const pasosCalculadoraDiferenciaProporciones = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 4: Diferencia de Proporciones Muestrales',
            description: `Sirve para calcular probabilidades sobre la diferencia entre dos proporciones muestrales independientes (${k('\\hat{p}_1 - \\hat{p}_2')}) provenientes de poblaciones con proporciones ${k('p_1')} y ${k('p_2')}.\nMuestra el modelo aproximado normal ${k('(\\hat{p}_1 - \\hat{p}_2) \\sim N\\left(p_1 - p_2, \\frac{p_1(1-p_1)}{n_1} + \\frac{p_2(1-p_2)}{n_2}\\right)')}.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de trabajo.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-modos-muestrales',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Distribución Muestral',
            description: 'Sirve para alternar entre la Demostración Empírica y la Calculadora de Probabilidades analítica.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4-selector-distribucion-teorica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Diferencia entre Dos Proporciones',
            description: 'Muestra seleccionada la distribución de la diferencia de proporciones muestrales. Permite contrastar la efectividad o porcentajes de éxito entre dos grupos independientes.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4difprop-muestra1',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros de la Muestra 1',
            description: `Sirve para ingresar los parámetros de la primera muestra:\n<b>-</b> Proporción poblacional de éxito: ${k('p_1')} (entre 0 y 1)\n<b>-</b> Tamaño de la muestra: ${k('n_1')}`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4difprop-muestra2',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros de la Muestra 2',
            description: `Sirve para ingresar los parámetros de la segunda muestra independiente:\n<b>-</b> Proporción poblacional de éxito: ${k('p_2')} (entre 0 y 1)\n<b>-</b> Tamaño de la muestra: ${k('n_2')}`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4difprop-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Parámetros de la Diferencia de Proporciones',
            description: `Sirve para calcular la diferencia esperada ${k('E(\\hat{p}_1 - \\hat{p}_2) = p_1 - p_2')}, la varianza conjunta ${k('V(\\hat{p}_1 - \\hat{p}_2)')} y el error estándar de la diferencia.\nHabilita la formulación de la condición de probabilidad y la graficación.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4difprop-parametros-estimados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Parámetros Combinados de ${k('\\hat{p}_1 - \\hat{p}_2')}`,
            description: `Muestra las tarjetas con los valores teóricos de la distribución conjunta:\n<b>-</b> <b>Diferencia esperada:</b> ${k('E(\\hat{p}_1 - \\hat{p}_2) = p_1 - p_2')}\n<b>-</b> <b>Varianza combinada:</b> ${k('V = \\frac{p_1(1-p_1)}{n_1} + \\frac{p_2(1-p_2)}{n_2}')}\n<b>-</b> <b>Error estándar:</b> ${k('\\sigma_{\\hat{p}_1 - \\hat{p}_2} = \\sqrt{\\frac{p_1(1-p_1)}{n_1} + \\frac{p_2(1-p_2)}{n_2}}')}`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4difprop-condicion-busqueda',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición de Comparación entre Proporciones',
            description: `Sirve para formular la pregunta probabilística sobre la brecha entre las dos proporciones:\n<b>-</b> Menor o igual: ${k('P(\\hat{p}_1 - \\hat{p}_2 \\le d)')}\n<b>-</b> Mayor o igual: ${k('P(\\hat{p}_1 - \\hat{p}_2 \\ge d)')}\n<b>-</b> Intervalo: ${k('P(d_1 \\le \\hat{p}_1 - \\hat{p}_2 \\le d_2)')}\nPermite ingresar los umbrales de diferencia ${k('d')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4difprop-btn-graficar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Graficar y Calcular Probabilidad de Proporciones',
            description: `Sirve para estandarizar la diferencia con ${k('Z = \\frac{(\\hat{p}_1 - \\hat{p}_2) - (p_1 - p_2)}{\\sigma_{\\hat{p}_1 - \\hat{p}_2}}')}, calcular la probabilidad en la curva normal y renderizar el gráfico interactivo.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4difprop-grafica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfica de la Diferencia de Proporciones',
            description: `Muestra la distribución normal representativa de la diferencia $(\\hat{p}_1 - \\hat{p}_2)$ centrada en ${k('p_1 - p_2')}.\nResalta las líneas de corte en la escala de diferencias y el área sombreada representativa de la probabilidad.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4difprop-resultados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resultados y Estandarización de Diferencia de Proporciones',
            description: `Muestra el desarrollo analítico del cálculo:\n<b>-</b> Fórmula de estandarización ${k('Z')}.\n<b>-</b> Valores críticos calculados ${k('z')}.\n<b>-</b> Probabilidad final resultante ${k('P(\\hat{p}_1 - \\hat{p}_2)')}.\nIncluye acceso a la tabla normal estándar interactiva.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 4C.1: DISTRIBUCIÓN DE LA MEDIA CON VARIANZA DESCONOCIDA (t-STUDENT) ───
export const pasosTyFMediaVarianzaDesconocida = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 4: Media con Varianza Desconocida (t-Student)',
            description: `Sirve para calcular probabilidades sobre la media muestral ${k('\\bar{X}')} cuando se desconoce la varianza poblacional ${k('\\sigma^2')} y se utiliza en su lugar la dispersión muestral ${k('S')}.\nMuestra la aplicación analítica de la distribución t de Student con ${k('v = n - 1')} grados de libertad.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de visualización de la curva t de Student y los resultados del cálculo.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-selector',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selector de Distribución T y F',
            description: `Muestra seleccionada la Distribución de la Media con varianza desconocida (${k('t')}-Student). Permite alternar entre la Media individual, la Diferencia de Medias y la Razón de Varianzas (${k('F')}-Fisher).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-student-media-poblacional',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Media Poblacional (${k('\\mu')})`,
            description: `Sirve para ingresar el valor de la media de la población de referencia ${k('\\mu')}.\nMuestra el centro teórico de la distribución sobre el cual se evalúan las desviaciones muestrales.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-student-dispersion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Dispersión Muestral (${k('S')} o ${k('S^2')})`,
            description: `Sirve para definir la dispersión observada en la muestra seleccionando entre Desviación Estándar muestral (${k('S')}) o Varianza muestral (${k('S^2')}).\nAl ser desconocida la varianza poblacional, este estimador puntual sustituye a ${k('\\sigma')} introduciendo mayor incertidumbre.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-student-tamano-muestra',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Tamaño de la Muestra (${k('n')})`,
            description: `Sirve para ingresar el número de observaciones de la muestra ${k('n')}.\nDetermina directamente los grados de libertad ${k('v = n - 1')} que definen la forma y el grosor de las colas en la curva ${k('t')}-Student.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-student-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Parámetros de la Distribución t-Student',
            description: `Sirve para calcular los grados de libertad ${k('v = n - 1')}, la esperanza ${k('E(\\bar{X}) = \\mu')}, la varianza muestral estimada ${k('V(\\bar{X}) = \\frac{S^2}{n}')} y el error estándar ${k('S_{\\bar{X}} = \\frac{S}{\\sqrt{n}}')}.\nHabilita la formulación de la condición de probabilidad.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-student-parametros-estimados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Parámetros Estimados de ${k('t')}-Student`,
            description: `Muestra las tarjetas con los parámetros teóricos calculados:\n<b>-</b> <b>Grados de libertad:</b> ${k('v = n - 1')}\n<b>-</b> <b>Esperanza:</b> ${k('E(\\bar{X}) = \\mu')}\n<b>-</b> <b>Varianza de la media:</b> ${k('V(\\bar{X}) = \\frac{S^2}{n}')}\n<b>-</b> <b>Error estándar:</b> ${k('S_{\\bar{X}} = \\frac{S}{\\sqrt{n}}')}\n<b>-</b> <b>Modelo estadístico:</b> ${k('T = \\frac{\\bar{X} - \\mu}{S / \\sqrt{n}} \\sim t_{(v)}')}`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-student-condicion-busqueda',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición de Búsqueda Probabilística',
            description: `Sirve para formular la pregunta probabilística sobre la media muestral:\n<b>-</b> Menor o igual: ${k('P(\\bar{X} \\le x)')}\n<b>-</b> Mayor o igual: ${k('P(\\bar{X} \\ge x)')}\n<b>-</b> Intervalo entre dos valores: ${k('P(x_1 \\le \\bar{X} \\le x_2)')}\nPermite ingresar el o los valores límites ${k('x')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-student-btn-graficar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Graficar y Calcular Probabilidad t-Student',
            description: `Sirve para estandarizar el valor muestral a estadístico ${k('t = \\frac{\\bar{x} - \\mu}{S / \\sqrt{n}}')}, computar la probabilidad acumulada mediante la función de distribución ${k('t')} y generar el gráfico interactivo.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-student-grafica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfica Interactiva t-Student',
            description: `Muestra la función de densidad de la distribución t de Student simétrica y acampanada con colas más pesadas que la normal.\nResalta las líneas de corte en los valores ${k('x')} y el área sombreada representativa de la probabilidad calculada.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-student-resultados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resultados y Estandarización t-Student',
            description: `Muestra el desarrollo analítico paso a paso:\n<b>-</b> Fórmula de estandarización ${k('T')} con los valores del problema.\n<b>-</b> Valor(es) crítico(s) ${k('t')} calculados.\n<b>-</b> Probabilidad final resultante ${k('P(\\bar{X})')} en formato decimal y porcentual.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 4C.2: DIFERENCIA DE MEDIAS CON VARIANZAS DESCONOCIDAS ───
export const pasosTyFDiferenciaMediasDesconocidas = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 4: Diferencia de Medias con Varianzas Desconocidas',
            description: `Sirve para evaluar la diferencia entre dos medias muestrales ${k('\\bar{X}_1 - \\bar{X}_2')} provenientes de poblaciones normales cuando se desconocen las varianzas poblacionales ${k('\\sigma_1^2, \\sigma_2^2')}.\nMuestra el comportamiento probabilístico distinguiendo entre muestras grandes (Z) y muestras pequeñas con varianzas iguales o distintas (T de Student).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de visualización del gráfico y el desarrollo analítico.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-selector',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selector de Distribución T y F',
            description: 'Muestra seleccionada la Distribución de la Diferencia de Medias Muestrales con Varianzas Desconocidas. Permite comparar las medias de dos poblaciones independientes.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-difmed-poblacion1',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros de la Población 1',
            description: `Sirve para ingresar los datos muestrales del primer grupo:\n<b>-</b> Media poblacional hipotética: ${k('\\mu_1')}\n<b>-</b> Desviación estándar muestral: ${k('S_1')}\n<b>-</b> Tamaño de la muestra: ${k('n_1')}`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-difmed-poblacion2',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros de la Población 2',
            description: `Sirve para ingresar los datos muestrales del segundo grupo independiente:\n<b>-</b> Media poblacional hipotética: ${k('\\mu_2')}\n<b>-</b> Desviación estándar muestral: ${k('S_2')}\n<b>-</b> Tamaño de la muestra: ${k('n_2')}`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-difmed-escenario',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Escenario de Evaluación Teórica',
            description: `Sirve para seleccionar el modelo matemático correspondiente según los supuestos muestrales:\n<b>1. Muestras grandes (${k('n_1 + n_2 > 30')}):</b> Se aplica la distribución normal estándar ${k('Z')}.\n<b>2. Varianzas iguales (${k('\\sigma_1^2 = \\sigma_2^2')}, ${k('n_1 + n_2 \\le 30')}):</b> Varianza ponderada ${k('S_p^2')} y distribución ${k('t')} con ${k('v = n_1 + n_2 - 2')} grados de libertad.\n<b>3. Varianzas distintas (${k('\\sigma_1^2 \\neq \\sigma_2^2')}, ${k('n_1 + n_2 \\le 30')}):</b> Aproximación de Welch-Satterthwaite con grados de libertad ajustados.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-difmed-condicion-busqueda',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición de Búsqueda de Diferencia de Medias',
            description: `Sirve para formular la pregunta probabilística sobre la brecha entre las medias muestrales:\n<b>-</b> Menor o igual: ${k('P(\\bar{X}_1 - \\bar{X}_2 \\le x)')}\n<b>-</b> Mayor o igual: ${k('P(\\bar{X}_1 - \\bar{X}_2 \\ge x)')}\n<b>-</b> Intervalo: ${k('P(x_1 \\le \\bar{X}_1 - \\bar{X}_2 \\le x_2)')}\nPermite ingresar los umbrales de diferencia ${k('x')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-difmed-btn-graficar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Graficar y Resolver Diferencia de Medias',
            description: `Sirve para estandarizar el estadístico según el escenario elegido (${k('Z')} o ${k('T')}), calcular la probabilidad y renderizar la curva de densidad interactiva.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-difmed-grafica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfica de Densidad de la Diferencia de Medias',
            description: `Muestra la curva de densidad (Normal o t-Student según el escenario) centrada en ${k('\\mu_1 - \\mu_2')}.\nResalta las líneas de corte en los valores ingresados y el área sombreada representativa de la probabilidad calculada.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-difmed-resultados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resultados y Desarrollo Matemático',
            description: `Muestra el análisis exhaustivo del cálculo:\n<b>-</b> Grados de libertad y varianza conjunta (${k('S_p^2')} en varianzas iguales o fórmula de Welch en distintas).\n<b>-</b> Estadístico estandarizado calculado (${k('z')} o ${k('t')}).\n<b>-</b> Probabilidad final ${k('P(\\bar{X}_1 - \\bar{X}_2)')} en formato decimal y porcentual.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 4C.3: DISTRIBUCIÓN DE LA RAZÓN DE DOS VARIANZAS MUESTRALES (F DE FISHER) ───
export const pasosTyFRazonVarianzas = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 4: Razón de Varianzas Muestrales (F de Fisher)',
            description: `Sirve para contrastar la dispersión o variabilidad entre dos poblaciones independientes mediante el cociente de sus varianzas muestrales ${k('\\frac{S_1^2}{S_2^2}')}.\nMuestra la aplicación analítica de la distribución F de Snedecor con ${k('v_1 = n_1 - 1')} y ${k('v_2 = n_2 - 1')} grados de libertad.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de visualización de la curva asimétrica F de Fisher y los resultados analíticos.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-selector',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selector de Distribución T y F',
            description: `Muestra seleccionada la Distribución de la Razón de dos Varianzas Muestrales (${k('F')}-Fisher). Permite evaluar la homogeneidad de varianzas entre dos poblaciones normales.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-fisher-poblacion1',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros de la Población 1 (Numerador)',
            description: `Sirve para ingresar los datos de la primera población:\n<b>-</b> Varianza poblacional: ${k('\\sigma_1^2')}\n<b>-</b> Tamaño de la muestra: ${k('n_1')}\nDefine los grados de libertad del numerador: ${k('v_1 = n_1 - 1')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-fisher-poblacion2',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros de la Población 2 (Denominador)',
            description: `Sirve para ingresar los datos de la segunda población:\n<b>-</b> Varianza poblacional: ${k('\\sigma_2^2')}\n<b>-</b> Tamaño de la muestra: ${k('n_2')}\nDefine los grados de libertad del denominador: ${k('v_2 = n_2 - 1')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-fisher-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Parámetros de la Distribución F',
            description: `Sirve para computar los grados de libertad ${k('v_1')} y ${k('v_2')} y parametrizar la función de densidad ${k('F \\sim F(v_1, v_2)')}.\nHabilita la formulación de la condición de probabilidad sobre la razón ${k('\\frac{S_1^2}{S_2^2}')}.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-fisher-parametros-estimados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Grados de Libertad y Modelo F de Fisher',
            description: `Muestra las tarjetas con los parámetros teóricos calculados:\n<b>-</b> <b>Grados de libertad numerador:</b> ${k('v_1 = n_1 - 1')}\n<b>-</b> <b>Grados de libertad denominador:</b> ${k('v_2 = n_2 - 1')}\n<b>-</b> <b>Estadístico de prueba:</b> ${k('F = \\frac{S_1^2 / \\sigma_1^2}{S_2^2 / \\sigma_2^2} \\sim F(v_1, v_2)')}`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-fisher-condicion-busqueda',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Condición de Probabilidad sobre la Razón ${k('\\frac{S_1^2}{S_2^2}')}`,
            description: `Sirve para formular la hipótesis probabilística sobre el cociente de varianzas muestrales:\n<b>-</b> Menor o igual: ${k('P\\left(\\frac{S_1^2}{S_2^2} \\le x\\right)')}\n<b>-</b> Mayor o igual: ${k('P\\left(\\frac{S_1^2}{S_2^2} \\ge x\\right)')}\n<b>-</b> Intervalo: ${k('P\\left(x_1 \\le \\frac{S_1^2}{S_2^2} \\le x_2\\right)')}\nPermite ingresar el o los valores umbrales ${k('x')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-fisher-btn-graficar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Graficar y Calcular Probabilidad F de Fisher',
            description: `Sirve para calcular el valor ${k('f')} estandarizado, integrar la densidad asimétrica F de Fisher y representar visualmente las regiones de probabilidad.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-fisher-grafica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfica Interactiva F de Fisher',
            description: `Muestra la curva de densidad asimétrica positiva con dominio en ${k('[0, \\infty)')}.\nResalta las líneas de corte en los valores del estadístico y sombrea el área correspondiente a la probabilidad calculada.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t4tyf-fisher-resultados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resultados y Estandarización F de Fisher',
            description: `Muestra el desarrollo analítico paso a paso:\n<b>-</b> Grados de libertad ${k('v_1')} y ${k('v_2')}.\n<b>-</b> Fórmula y cálculo del estadístico ${k('F')}.\n<b>-</b> Probabilidad final resultante ${k('P(F)')} en formato decimal y porcentual.`,
            side: 'top',
            align: 'center'
        }
    }
];

// Fallback genérico para Distribuciones T y F
export const pasosDistribucionesTyF = pasosTyFMediaVarianzaDesconocida;
