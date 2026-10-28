import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renderiza una expresión matemática en HTML usando KaTeX para los tooltips de Tema 2
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
 * GUÍA INTERACTIVA DE APRENDIZAJE - TEMA 2: VARIABLES ALEATORIAS
 * ==============================================================================
 * Submódulo hijo importado por Guia.js (padre).
 * Controla:
 * 1. Variables Aleatorias Discretas (Análisis de Matriz)
 * 2. Variables Aleatorias Discretas (Modo Manual)
 * 3. Calculadora de Funciones Continuas
 */

// ─── TOUR 13: VARIABLES ALEATORIAS DISCRETAS (ANÁLISIS DE MATRIZ) ───
export const pasosDistribucionDiscretaMatriz = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Variables Aleatorias Discretas',
            description: 'Sirve para estudiar una variable aleatoria que toma valores aislados o enteros, calculando su distribución de probabilidades, su valor esperado y su dispersión a partir de los datos cargados.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Matriz de Datos',
            description: 'Sirve para elegir la matriz de datos que contiene los registros numéricos que deseas evaluar.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para ampliar el área de visualización de las tablas y gráficos.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-discreta-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre procesar una columna de tu matriz de datos (Análisis de Matriz) o escribir directamente los valores y sus probabilidades (Modo Manual).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-discreta-matriz-datos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Datos',
            description: 'Muestra la cantidad total de registros disponibles en tu matriz. El botón "Editar Datos" sirve para modificar, agregar o depurar los datos numéricos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-discreta-matriz-columna',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Columna a Evaluar',
            description: 'Sirve para seleccionar la columna numérica específica de tu matriz con la que se construirá la distribución de frecuencias y probabilidades.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-discreta-matriz-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Botón Calcular',
            description: 'Haz clic aquí para procesar los datos de la columna seleccionada, generar la tabla completa de distribución, calcular la esperanza, varianza y trazar el gráfico de bastones.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-discreta-tabla-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Distribución de Probabilidad',
            description: `Muestra cada valor único (${k('x_i')}), las veces que se repite (${k('f_i')}), su probabilidad (${k('P(x_i)')}), y las columnas de cálculo ponderado (${k('x_i \\cdot P(x_i)')} y ${k('x_i^2 \\cdot P(x_i)')}) junto con sus sumatorias totales.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-discreta-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra el promedio ponderado o centro de gravedad de la distribución (${k('\\mu = E(X)')}), obtenido sumando los productos de cada valor por su respectiva probabilidad.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-discreta-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra el cálculo de la dispersión de los datos mediante la fórmula ${k('V(X) = E(X^2) - [E(X)]^2')}. Sirve para medir qué tan alejados están los valores respecto al centro esperado.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-discreta-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar \\sigma',
            description: `Muestra la raíz cuadrada de la varianza (${k('\\sigma = \\sqrt{V(X)}')}). Sirve para expresar la dispersión en las mismas unidades de la variable original.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-discreta-momentos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Momentos de la Variable Aleatoria',
            description: `Sirve para calcular cualquier momento de orden ${k('r')} respecto al origen (${k('\\mu\'_r = E(X^r)')}). Puedes cambiar el valor de ${k('r')} para obtener momentos de órdenes superiores de forma inmediata.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-discreta-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfico de Bastones',
            description: 'Muestra de forma visual la función de masa de probabilidad mediante líneas verticales o bastones, donde la altura de cada bastón representa la probabilidad de cada valor.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 14: VARIABLES ALEATORIAS DISCRETAS (MODO MANUAL) ───
export const pasosDistribucionDiscretaManual = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Variables Aleatorias Discretas (Modo Manual)',
            description: `Sirve para analizar una variable aleatoria ingresando directamente pares de valores (${k('X')}) y sus respectivas probabilidades (${k('P(X)')}), sin necesidad de cargar una matriz de datos.`,
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
        element: '#tour-discreta-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre el análisis automático con datos de matriz y el ingreso manual de la distribución.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-discreta-manual-tabla',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Ingreso de Probabilidades',
            description: `Sirve para escribir cada valor de la variable en la columna ${k('X')} y su probabilidad asociada en la columna ${k('P(X)')}. Recuerda que la suma total de todas las probabilidades debe ser exactamente 1.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-discreta-manual-btn-agregar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Agregar Nueva Fila',
            description: 'Sirve para añadir más valores a la variable aleatoria si tu distribución contiene más puntos discretos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-discreta-manual-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Botón Calcular',
            description: 'Haz clic aquí para validar que las probabilidades sumen 1 y calcular la esperanza, varianza, desviación estándar y generar el gráfico de bastones.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-discreta-tabla-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Distribución y Desglose',
            description: `Muestra la distribución completa organizada con las columnas de cálculo ponderado (${k('x_i \\cdot P(x_i)')} y ${k('x_i^2 \\cdot P(x_i)')}) y las sumatorias finales.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-discreta-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: 'Muestra el valor esperado o media poblacional calculado a partir de los valores y probabilidades que ingresaste.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-discreta-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra las medidas de dispersión de tu distribución calculadas paso a paso a partir de la fórmula ${k('V(X) = E(X^2) - [E(X)]^2')}.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-discreta-desviacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Desviación Estándar \\sigma',
            description: `Muestra la raíz cuadrada de la varianza (${k('\\sigma = \\sqrt{V(X)}')}), expresando la dispersión en las mismas unidades de la variable.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-discreta-momentos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Momentos de la Variable Aleatoria',
            description: `Sirve para calcular momentos de orden ${k('r')} ingresando el exponente deseado en la casilla correspondiente.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-discreta-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfico de Bastones',
            description: 'Muestra la representación gráfica de las probabilidades de cada valor discreto de la variable.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 15: CALCULADORA DE FUNCIONES CONTINUAS ───
export const pasosDistribucionContinua = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calculadora de Funciones Continuas',
            description: `Sirve para evaluar variables aleatorias continuas mediante su función de densidad ${k('f(x)')}, calculando integrales definidas, valor esperado, varianza y constantes de normalización.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral para tener una vista más amplia de la expresión matemática y sus resultados.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-continua-lienzo-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Lienzo de la Función e Integral',
            description: `Muestra la función de densidad construida dentro del signo de integral (${k('\\int_a^b f(x) dx')}). Puedes hacer clic en cualquier parte de la expresión para modificar valores o insertar nuevos términos.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-continua-limites',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Límites de Integración',
            description: `Sirve para definir el intervalo de validez de la variable continua ingresando el límite inferior (${k('a')}) y el límite superior (${k('b')}). Puedes ingresar números reales o el símbolo de infinito (${k('\\infty')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-continua-barra-estado',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Guía y Estado de Inserción',
            description: 'Muestra indicaciones en tiempo real sobre la posición actual del cursor (por ejemplo, si estás escribiendo en el numerador o denominador de una fracción) para facilitar la edición.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-continua-teclado',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Teclado Matemático Virtual',
            description: `Sirve para insertar expresiones matemáticas complejas con un solo clic: números, operadores, fracciones, potencias, la función exponencial (${k('e^x')}), valor absoluto (${k('|x|')}) y la incógnita (${k('k')}) para encontrar constantes desconocidas.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-continua-procedimiento-k',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Cálculo de la Constante de Normalización',
            description: `Muestra el despeje matemático paso a paso cuando la función incluye una constante desconocida (${k('k')}), aplicando la condición de que el área total bajo la curva debe ser igual a 1.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-continua-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Botón Calcular',
            description: 'Haz clic aquí para resolver la integral, verificar si es una función de densidad válida, calcular las métricas estadísticas y trazar la gráfica del área bajo la curva.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-continua-metricas',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Métricas Estadísticas',
            description: `Muestra los valores calculados de la Esperanza Matemática (${k('E[X]')}), la Varianza (${k('V[X]')}) y la Desviación Estándar (${k('\\sigma')}) en tarjetas de resumen.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-continua-desarrollo-area',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Validación de Área',
            description: `Muestra la resolución paso a paso de la integral en el dominio definido (${k('\\int_a^b f(x) dx')}). Sirve para verificar que el área total bajo la curva sea igual a 1 para asegurar que es una función de densidad válida.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-continua-desarrollo-esperanza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Esperanza Matemática E(X)',
            description: `Muestra la resolución paso a paso de la integral ${k('E[X] = \\int_a^b x \\cdot f(x) dx')}. Sirve para determinar el valor promedio o esperado de la variable continua.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-continua-desarrollo-varianza',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Varianza V(X)',
            description: `Muestra el cálculo detallado de ${k('E[X^2] = \\int_a^b x^2 \\cdot f(x) dx')} y la aplicación de la fórmula ${k('V[X] = E[X^2] - (E[X])^2')} para medir la dispersión de la distribución.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-continua-grafica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfica de la Función de Densidad',
            description: 'Muestra la curva continua de la función y el área sombreada correspondiente al intervalo de probabilidad evaluado.',
            side: 'top',
            align: 'center'
        }
    }
];
