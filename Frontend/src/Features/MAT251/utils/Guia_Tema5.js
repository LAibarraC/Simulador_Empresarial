import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renderiza una expresión matemática en HTML usando KaTeX para los tooltips de Tema 5
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
 * GUÍA INTERACTIVA DE APRENDIZAJE - TEMA 5: ESTIMACIÓN E INFERENCIA ESTADÍSTICA
 * ==============================================================================
 * Submódulo hijo importado por Guia.js (padre).
 * Controla:
 * 1. Estimación Puntual (Matriz, Manual, Simulación)
 * 2. Estimación por Intervalos (Matriz, Manual, Simulación)
 */

// ─── TOUR 5A-1: ESTIMACIÓN PUNTUAL (ANÁLISIS DE MATRIZ) ───
export const pasosEstimacionPuntualMatriz = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 5: Estimación Puntual',
            description: `Permite calcular un valor numérico muestral único que actúa como la mejor aproximación de un parámetro desconocido de la población (${k('\\mu')}, ${k('p')} o ${k('\\sigma^2')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t5-parametro-estimacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetro a Estimar',
            description: `Sirve para seleccionar el parámetro poblacional a inferir: Media poblacional (${k('\\mu')}), Proporción poblacional (${k('p')}) o Varianza poblacional (${k('\\sigma^2')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Variable Poblacional',
            description: 'Sirve para elegir la variable de la base de datos cuyos datos cuantitativos o cualitativos serán analizados.',
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
        element: '#tour-t5-modos-estimacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Estimación Puntual',
            description: 'Permite alternar entre el Análisis de Matriz con datos cargados, Simulación muestral y Modo Manual de cálculo.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-datos-resumen',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Población y Edición de Datos',
            description: 'Muestra el recuento de datos cargados, agregados y totales, junto al botón Editar Datos para modificar o agregar observaciones.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-proporcion-exito',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Atributo o Categoría de Éxito',
            description: `Sirve para seleccionar qué categoría de la variable cualitativa se contabilizará como éxito (${k('x')}) para calcular la proporción muestral ${k('\\hat{p} = \\frac{x}{n}')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-btn-calcular-matriz',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Estimación Puntual',
            description: 'Haz clic aquí para procesar los datos de la muestra, calcular el estimador puntual insesgado y desplegar la resolución detallada.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-resultados-matriz',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resultados de la Estimación',
            description: `Muestra la tabla resumida con el tamaño muestral ${k('n')}, estadísticos muestrales y la estimación puntual calculada con tooltips pedagógicos.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-resolucion-paso-a-paso',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desarrollo Paso a Paso',
            description: 'Muestra el desglose algebraico detallado de cada observación individual, sumatorias intermedias y la sustitución formal en la fórmula matemática.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 5A-2: ESTIMACIÓN PUNTUAL (MODO MANUAL) ───
export const pasosEstimacionPuntualManual = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 5: Estimación Puntual (Modo Manual)',
            description: 'Permite calcular directamente el estimador puntual ingresando valores numéricos agregados sin necesidad de cargar una base de datos.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t5-parametro-estimacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetro a Estimar',
            description: `Sirve para seleccionar si se desea estimar la Proporción (${k('p')}) o la Varianza (${k('\\sigma^2')}).`,
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
        element: '#tour-t5-modos-estimacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modo de Entrada Manual',
            description: 'Muestra seleccionado el modo manual para el cálculo rápido mediante estadísticos directos.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-manual-tamano-muestra',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tamaño de la Muestra (n)',
            description: `Sirve para ingresar el número total de observaciones contenidas en la muestra (${k('n > 0')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-manual-valor-parametro',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Valor del Estadístico Muestral',
            description: `Sirve para introducir los casos favorables (${k('x')}) si se estima una proporción, o la varianza muestral calculada (${k('S^2')}) para varianza.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-btn-calcular-manual',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Estimación Puntual',
            description: 'Haz clic aquí para procesar los valores manuales y obtener el estimador puntual con su interpretación formal.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-resultados-manual',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resultados de Estimación Manual',
            description: 'Muestra la estimación puntual calculada en formato decimal y porcentual junto con los parámetros base.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 5A-3: ESTIMACIÓN PUNTUAL (SIMULACIÓN MONTE CARLO) ───
export const pasosEstimacionPuntualSimulacion = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 5: Simulación de Estimación Puntual',
            description: 'Permite comprobar empíricamente las propiedades de los estimadores puntuales (como la insesgadez y consistencia) mediante muestreo repetido de Monte Carlo.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t5-parametro-estimacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetro a Simular',
            description: `Sirve para seleccionar el parámetro a contrastar en la simulación: Media (${k('\\mu')}), Proporción (${k('p')}) o Varianza (${k('\\sigma^2')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de visualización gráfica.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-modos-estimacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modo Simulación Muestral',
            description: 'Muestra activo el entorno experimental para generar réplicas muestrales aleatorias en tiempo real.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-sim-distribucion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Poblacional Teórica',
            description: 'Permite elegir el modelo probabilístico del cual se extraerán las muestras: Normal, Bernoulli, Binomial, Poisson o Uniforme.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t5-sim-parametros-dist',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros Poblacionales Reales',
            description: `Sirve para fijar los valores verdaderos de la población (${k('\\mu')}, ${k('\\sigma')}, ${k('p')}, ${k('\\lambda')}, etc.) contra los que se compararán las estimaciones.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-sim-tamano-muestra',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tamaño de Muestra (n)',
            description: 'Sirve para definir cuántas observaciones contendrá cada una de las muestras individuales simuladas.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-sim-num-simulaciones',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Número de Simulaciones (N)',
            description: 'Sirve para establecer el número de réplicas o muestras independientes a generar (de 1 a 10.000).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-sim-btn-ejecutar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ejecutar Simulación',
            description: `Haz clic aquí para generar las ${k('N')} muestras aleatorias, computar sus estimadores y graficar la distribución empírica.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-sim-estado',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Estado de la Simulación',
            description: 'Informa el progreso del experimento, confirmando el total de muestras generadas y los parámetros poblacionales configurados.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-sim-tarjetas-resumen',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Métricas del Estimador (Insesgadez)',
            description: `Permite comparar el Parámetro Real con el Promedio de las Estimaciones (${k('\\bar{\\hat{\\theta}}')}) para verificar empíricamente la propiedad de insesgadez, junto a la desviación estándar del estimador.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-sim-grafico-evolucion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Evolución de las Estimaciones',
            description: `Muestra la fluctuación de las estimaciones (${k('\\bar{X}')}, ${k('\\hat{p}')} o ${k('S^2')}) a lo largo de las ${k('N')} simulaciones frente a la línea horizontal del parámetro real.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-sim-grafico-distribucion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución de las Estimaciones',
            description: `Muestra el histograma de frecuencias de las estimaciones (${k('\\bar{X}')}, ${k('\\hat{p}')} o ${k('S^2')}) y su concentración alrededor del parámetro poblacional verdadero.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-sim-tabla-muestras',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Registro Individual de Muestras',
            description: 'Muestra la tabla interactiva con cada muestra generada, sus datos específicos y el valor puntual estimado.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-sim-btn-exportar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Exportación de Datos',
            description: 'Permite guardar las muestras en el espacio de trabajo o descargarlas directamente en una hoja de cálculo Excel.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 5B-1: ESTIMACIÓN POR INTERVALOS (ANÁLISIS DE MATRIZ) ───
export const pasosEstimacionIntervalosMatriz = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 5: Estimación por Intervalos de Confianza',
            description: `Permite construir un rango o intervalo ${k('[L_i, L_s]')} que contiene al parámetro poblacional verdadero con un nivel de certeza probabilístico fijado (${k('1 - \\alpha')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t5-parametro-intervalos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetro a Estimar',
            description: `Sirve para seleccionar el parámetro a acotar por intervalo: Media (${k('\\mu')}), Proporción (${k('p')}) o Varianza (${k('\\sigma^2')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t5-nivel-confianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Nivel de Confianza (1 - α)',
            description: `Sirve para seleccionar el nivel de confianza: 90% (${k('Z = 1.645')}), 95% (${k('Z = 1.96')}) o 99% (${k('Z = 2.576')}). A mayor confianza, mayor amplitud tendrá el intervalo para garantizar la cobertura.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Variable Poblacional',
            description: 'Sirve para elegir la variable de la base de datos cuyos datos serán procesados para construir el intervalo.',
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
        element: '#tour-t5-modos-intervalos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Intervalos de Confianza',
            description: 'Permite alternar entre el Análisis de Matriz de datos, Simulación interactiva de cobertura y Modo Manual.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-datos-resumen',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Población y Edición de Datos',
            description: 'Muestra la cantidad de observaciones válidas y da acceso al editor de datos para modificar o agregar valores.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-sigma-opcion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición de la Desviación Estándar',
            description: `Permite indicar si ${k('\\sigma')} es conocida o desconocida. Si es desconocida con muestra pequeña se usa t-Student (${k('t_{\\alpha/2, n-1}')}); si es conocida se utiliza la distribución normal Z.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-proporcion-exito',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Atributo o Categoría de Éxito',
            description: `Sirve para definir cuál categoría de la variable cualitativa representa el éxito para calcular la proporción muestral ${k('\\hat{p}')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-btn-calcular-matriz',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Intervalo de Confianza',
            description: 'Haz clic aquí para calcular el error estándar, el valor crítico correspondiente, el margen de error y los límites del intervalo.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-resultados-resumen',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen del Intervalo',
            description: `Muestra el tamaño muestral ${k('n')}, estimación puntual, margen de error ${k('E')} y los límites definitivos del intervalo ${k('[L_i, L_s]')}.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-resolucion-detalle',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desarrollo Matemático del Intervalo',
            description: `Muestra el desarrollo analítico formal paso a paso con los valores críticos tabulados (${k('Z')}, ${k('t')} o ${k('\\chi^2')}) y las fórmulas algebraicas aplicadas.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Visualización Gráfica de la Confianza',
            description: `Muestra la curva de densidad probabilística con la región central de confianza sombreada (${k('1 - \\alpha')}) y la ubicación exacta de los límites inferior y superior.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 5B-2: ESTIMACIÓN POR INTERVALOS (MODO MANUAL) ───
export const pasosEstimacionIntervalosManual = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 5: Intervalos de Confianza (Modo Manual)',
            description: 'Permite calcular intervalos de confianza ingresando directamente los datos resumidos de un problema estadístico sin necesidad de una base de datos.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t5-parametro-intervalos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetro a Estimar',
            description: `Sirve para seleccionar el parámetro de interés: Media (${k('\\mu')}), Proporción (${k('p')}) o Varianza (${k('\\sigma^2')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t5-nivel-confianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Nivel de Confianza (1 - α)',
            description: 'Sirve para fijar el nivel de confianza (90%, 95% o 99%) para determinar el valor crítico y el margen de error.',
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
        element: '#tour-t5-modos-intervalos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modo Manual',
            description: 'Muestra seleccionado el modo manual para el ingreso de parámetros estadísticos directos.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-manual-n',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tamaño de Muestra (n)',
            description: `Sirve para ingresar el tamaño muestral ${k('n')} del problema estadístico.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-manual-param-val',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Estadístico Muestral Observado',
            description: `Sirve para ingresar el estadístico muestral: Media muestral (${k('\\bar{X}')}), Casos favorables (${k('x')}) o Varianza muestral (${k('S^2')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-manual-sigma-selector',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo y Valor de Desviación Estándar',
            description: `Permite seleccionar si la desviación es Poblacional (${k('\\sigma')}, normal Z) o Muestral (${k('S')}, t-Student), e ingresar su valor numérico.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-btn-calcular-manual',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Intervalo',
            description: 'Haz clic aquí para procesar los datos manuales y obtener el intervalo de confianza formal con su desarrollo matemático.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-resultados-resumen',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen del Intervalo',
            description: `Muestra los límites inferior y superior ${k('[L_i, L_s]')}, el margen de error y la estimación puntual.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-resolucion-detalle',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desarrollo Matemático',
            description: 'Muestra el cálculo del valor crítico, error estándar y margen de error con las fórmulas aplicadas.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Curva de Confianza',
            description: 'Muestra la curva probabilística con la región de confianza sombreada y los límites calculados.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 5B-3: ESTIMACIÓN POR INTERVALOS (SIMULACIÓN DE COBERTURA) ───
export const pasosEstimacionIntervalosSimulacion = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 5: Simulación de Intervalos de Confianza',
            description: `Permite comprender el significado frecuentista del Nivel de Confianza: al generar ${k('N')} muestras, aproximadamente el ${k('(1 - \\alpha)\\%')} de los intervalos contendrán al verdadero parámetro poblacional.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t5-parametro-intervalos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetro a Simular',
            description: `Sirve para definir el parámetro objeto de simulación: Media (${k('\\mu')}), Proporción (${k('p')}) o Varianza (${k('\\sigma^2')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t5-nivel-confianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Nivel de Confianza Nominal (1 - α)',
            description: 'Define el porcentaje teórico de cobertura deseado (90%, 95% o 99%) contra el cual se contrastará la cobertura observada empírica.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para visualizar a pantalla completa el gráfico de intervalos.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-modos-intervalos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modo Simulación Muestral',
            description: 'Muestra activo el laboratorio Monte Carlo para construir múltiples intervalos simultáneos.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-sim-distribucion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Poblacional Teórica',
            description: 'Permite elegir el modelo probabilístico de donde se generarán las muestras: Normal, Bernoulli, Binomial, Poisson o Uniforme.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t5-intervalos-sim-parametros-dist',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros Poblacionales Reales',
            description: `Sirve para fijar los valores reales de la población (${k('\\mu')}, ${k('\\sigma')}, ${k('p')}, etc.), que actuarán como la línea de referencia verdadera.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-sim-tamano-muestra',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tamaño de Muestra (n)',
            description: 'Sirve para definir el número de observaciones de cada muestra. Muestras más grandes producen intervalos más precisos y estrechos.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-sim-num-simulaciones',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Número de Intervalos a Generar (N)',
            description: 'Sirve para establecer la cantidad de réplicas independientes y sus correspondientes intervalos (de 1 a 10.000).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-sim-sigma-conocida',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condición de Sigma en la Simulación',
            description: `Para media normal, permite elegir si los intervalos asumen ${k('\\sigma')} conocida (Z) o desconocida (t-Student con desviación muestral ${k('S')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-sim-btn-ejecutar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Generar Intervalos',
            description: 'Haz clic aquí para generar todas las muestras aleatorias y construir sus respectivos intervalos de confianza.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-sim-estado',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Estado de la Simulación',
            description: 'Informa el total de intervalos generados, el nivel de confianza fijado y los parámetros de la distribución.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-sim-tarjetas-resumen',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Cobertura Observada y Amplitud',
            description: `Muestra la Cobertura Observada (porcentaje real de intervalos que atraparon al parámetro verdadero frente al ${k('1 - \\alpha')} nominal) y el ancho promedio de los intervalos.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-sim-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfico de Franjas de Confianza',
            description: 'Muestra cada intervalo como una línea horizontal: en verde los que capturan al parámetro poblacional real (línea vertical), y en rojo los que no lo contienen.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-sim-tabla',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Intervalos Simulados',
            description: 'Muestra la tabla detallada con el límite inferior, límite superior, estimación puntual y si el parámetro quedó contenido en cada réplica.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t5-intervalos-sim-btn-exportar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Guardar y Exportar Datos',
            description: 'Permite guardar los intervalos en el espacio de trabajo o descargarlos en una hoja de cálculo Excel.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR FALLBACKS PARA COMPATIBILIDAD DIRECTA ───
export const pasosEstimacionPuntual = pasosEstimacionPuntualMatriz;
export const pasosEstimacionIntervalos = pasosEstimacionIntervalosMatriz;
