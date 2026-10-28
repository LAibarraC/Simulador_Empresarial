import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renderiza una expresión matemática en HTML usando KaTeX para los tooltips de Tema 6
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
 * GUÍA INTERACTIVA DE APRENDIZAJE - TEMA 6: PRUEBAS DE HIPÓTESIS
 * PARAMÉTRICAS Y NO PARAMÉTRICAS
 * ==============================================================================
 * Submódulo hijo importado por Guia.js (padre).
 * Controla:
 * 1. Hipótesis Paramétricas (Matriz, Manual, Simulación)
 * 2. Hipótesis No Paramétricas (Matriz, Manual, Simulación)
 */

// ─── TOUR 6A-1: HIPÓTESIS PARAMÉTRICAS (ANÁLISIS DE MATRIZ) ───
export const pasosHipotesisParametricasMatriz = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 6: Pruebas de Hipótesis Paramétricas',
            description: `Permite contrastar hipótesis estadísticas sobre parámetros poblacionales (${k('\\mu')}, ${k('p')}, ${k('\\sigma^2')}) asumiendo normalidad teórica, determinando estadísticos de prueba, valores críticos, regiones de rechazo y ${k('p')}-valores.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t6-hp-selector-prueba',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Prueba Paramétrica',
            description: `Sirve para seleccionar la prueba estadística a contrastar: Media con varianza conocida (curva ${k('Z')}), Media con varianza desconocida (distribución ${k('t')} de Student), Proporción muestral (${k('Z')}) o Varianza muestral (${k('\\chi^2')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Variable Poblacional',
            description: 'Permite elegir la variable de la base de datos cuyos registros cuantitativos o cualitativos serán contrastados.',
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
        element: '#tour-t6-hp-modos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Permite alternar entre el Análisis de Matriz de datos cargados, el Modo Manual con datos resumen y la Simulación muestral iterativa.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-datos-resumen',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Datos Cargados',
            description: 'Muestra el conteo de observaciones cargadas, agregadas y totales, junto con el botón Editar Datos para gestionar las observaciones.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-exito-selector',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Categoría o Atributo de Éxito',
            description: `Sirve para seleccionar qué categoría de la variable cualitativa se considerará como éxito para contrastar la hipótesis de proporción poblacional (${k('p')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-tabla-resumen-muestra',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Estadísticos Muestrales Observados',
            description: `Presenta los estadísticos descriptivos calculados directamente de las observaciones muestrales para la prueba seleccionada.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-param-hipotesis',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetro de la Hipótesis Nula',
            description: `Permite ingresar el parámetro hipotético poblacional de referencia a contrastar y los valores requeridos para la prueba.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-alpha',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Nivel de Significancia',
            description: `Permite fijar el nivel de significancia (${k('\\alpha')}), que representa la probabilidad máxima tolerable de cometer un Error Tipo I (rechazar ${k('H_0')} siendo verdadera).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-h1',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Hipótesis Alternativa',
            description: `Sirve para seleccionar la dirección del contraste en la hipótesis alternativa (${k('H_1')}): Bilateral (${k('\\neq')}), Unilateral Derecha (${k('>')}) o Unilateral Izquierda (${k('<')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Prueba de Hipótesis',
            description: 'Ejecuta el cómputo formal del estadístico de contraste, determina la región crítica, calcula el p-valor y genera la conclusión estadística.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-planteamiento',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Planteamiento Formal de Hipótesis',
            description: `Muestra la formalización matemática del contraste con las hipótesis nula (${k('H_0')}) y alternativa (${k('H_1')}) configuradas.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-tabla-minitab',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Resultados de la Prueba',
            description: `Presenta el resumen cuantitativo del contraste: tamaño de muestra (${k('n')}), estadísticos muestrales observados (${k('\\bar{X}')}, ${k('\\hat{p}')} o ${k('S^2')}), error estándar, intervalo o límite de confianza, estadístico de contraste calculado y el ${k('p')}-valor.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Curva de Distribución Teórica y Región Crítica',
            description: `Visualiza la curva de densidad de probabilidad con la región de retención en azul, la región de rechazo en rojo (${k('\\alpha')}), las líneas de los valores críticos y la ubicación exacta del estadístico de prueba observado.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-resumen-estadistico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen Estadístico del Contraste',
            description: `Presenta las métricas determinantes de la prueba: el valor del estadístico de contraste, el umbral del valor crítico delimitador y el ${k('p')}-valor.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-decision',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Decisión e Interpretación Estadística',
            description: `Detalla el dictamen final sobre la hipótesis nula (${k('H_0')}), la regla de rechazo formal y la justificación matemática basada en la comparación del estadístico frente al valor crítico y el ${k('p')}-valor.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 6A-2: HIPÓTESIS PARAMÉTRICAS (MODO MANUAL) ───
export const pasosHipotesisParametricasManual = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 6: Pruebas de Hipótesis Paramétricas (Modo Manual)',
            description: `Permite realizar contrastes de hipótesis ingresando directamente estadísticos muestrales (${k('n')}, ${k('\\bar{X}')}, ${k('S')}, ${k('x')}) y parámetros hipotéticos sin depender de una base de datos externa.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t6-hp-selector-prueba',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Prueba Paramétrica',
            description: `Sirve para seleccionar el tipo de prueba a contrastar: Media (Z), Media (t), Proporción (Z) o Varianza (${k('\\chi^2')}).`,
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
        element: '#tour-t6-hp-modos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Permite alternar entre el análisis de matriz, modo manual con entradas directas y simulación.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-manual-entradas',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros Muestrales e Hipótesis',
            description: `Campos para ingresar el tamaño de muestra (${k('n')}), los estadísticos observados y el parámetro hipotético a contrastar.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-manual-alpha',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Nivel de Significancia',
            description: `Permite seleccionar el nivel de significancia (${k('\\alpha')}) para definir la tolerancia a errores de decisión y delimitar la zona de rechazo.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-manual-h1',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Dirección de la Hipótesis Alternativa',
            description: `Define el sentido de la prueba: Bilateral (${k('\\neq')}), Unilateral Derecha (${k('>')}) o Unilateral Izquierda (${k('<')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-manual-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Prueba de Hipótesis',
            description: 'Procesa los parámetros ingresados y calcula el estadístico, valor crítico, p-valor y genera los resultados visuales.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-manual-planteamiento',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Planteamiento Formal de Hipótesis',
            description: `Muestra la especificación matemática del contraste con las hipótesis nula (${k('H_0')}) y alternativa (${k('H_1')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-manual-tabla-minitab',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Resultados de la Prueba',
            description: `Presenta el resumen cuantitativo del contraste: tamaño de muestra (${k('n')}), estadístico observado (${k('\\bar{X}')}, ${k('\\hat{p}')} o ${k('S^2')}), error estándar, intervalo de confianza, estadístico de prueba calculado (${k('Z_c')}, ${k('t_c')} o ${k('\\chi_c^2')}) y el ${k('p')}-valor.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-manual-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Teórica y Región Crítica',
            description: `Representa gráficamente la curva de densidad con las áreas de rechazo pintadas en rojo y la posición del estadístico calculado.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-manual-resumen-estadistico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Estadísticos del Contraste',
            description: `Presenta los indicadores clave de decisión: estadístico de prueba, valores críticos y ${k('p')}-valor.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-manual-decision',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Conclusión y Justificación Estadística',
            description: `Expone la decisión formal de rechazo o no rechazo de ${k('H_0')} junto con el criterio matemático aplicado.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 6A-3: HIPÓTESIS PARAMÉTRICAS (SIMULACIÓN) ───
// ─── TOUR 6A-3A: HIPÓTESIS PARAMÉTRICAS - MEDIA (Z) (SIMULACIÓN) ───
export const pasosHPSimulacionMediaZ = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 6: Simulación de Hipótesis de Media (Z)',
            description: `Permite generar experimentalmente ${k('N')} muestras normales con desviación conocida (${k('\\sigma')}) bajo ${k('H_0: \\mu = \\mu_0')} para evaluar empíricamente la tasa de rechazo y el Error Tipo I.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t6-hp-selector-prueba',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Prueba Paramétrica',
            description: `Muestra seleccionada la prueba Media (Z) para contrastar la media con varianza poblacional conocida.`,
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
        element: '#tour-t6-hp-modos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Permite alternar entre los modos de análisis: matriz, manual y simulación.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tema6-ayuda-hipotesis-simulador',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Guía Pedagógica del Simulador',
            description: 'Ofrece explicaciones conceptuales sobre cómo se generan las muestras, cómo se contrasta cada iteración y el significado de los errores de decisión.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-parametros',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros Poblacionales e Hipótesis (Media Z)',
            description: `Permite configurar la media poblacional real (${k('\\mu')}) para generar las muestras, la media hipotética (${k('\\mu_0')}) bajo ${k('H_0')} y la desviación estándar conocida (${k('\\sigma')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-alpha',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Nivel de Significancia',
            description: `Fija el nivel de significancia (${k('\\alpha')}), que determina el valor crítico teórico con el que se evaluará cada muestra simulada.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-h1',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Hipótesis Alternativa',
            description: `Define la orientación de la región crítica: Bilateral (${k('\\neq')}), Derecha (${k('>')}) o Izquierda (${k('<')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-muestras',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tamaño Muestral y Cantidad de Simulaciones',
            description: `Permite especificar el tamaño de cada muestra individual (${k('n')}) y el número total de repeticiones (${k('N')}) a simular.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-btn-ejecutar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ejecutar Simulación Monte Carlo',
            description: 'Inicia el motor de generación muestral y evaluación probabilística iteración por iteración.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-progreso',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Barra de Progreso y Control de Animación',
            description: 'Muestra el avance de las muestras simuladas y permite pausar, reanudar o acelerar la velocidad de animación (1x, 2x, 4x, MAX).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-metricas',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tasa Empírica de Rechazo (Z)',
            description: `Contabiliza en tiempo real el porcentaje de muestras simuladas donde se rechazó ${k('H_0: \\mu = \\mu_0')}. Si ${k('\\mu = \\mu_0')}, estima el Error Tipo I empírico.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Normal y Estadísticos Z Simulados',
            description: `Muestra la curva teórica ${k('Z')} con los estadísticos calculados en cada iteración, clasificando en verde las retenciones y en rojo los rechazos.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-tabla',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Historial de Muestras Simuladas (Z)',
            description: `Tabla dinámica que detalla cada simulación con su número de iteración, media muestral (${k('\\bar{X}')}), estadístico tipificado (${k('Z_c')}), ${k('p')}-valor y veredicto de decisión.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-acciones',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Exportación y Respaldo de Datos',
            description: 'Permite guardar el experimento en el espacio de trabajo o descargarlo en formato Excel (.xlsx) con todas las iteraciones.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 6A-3B: HIPÓTESIS PARAMÉTRICAS - MEDIA (t) (SIMULACIÓN) ───
export const pasosHPSimulacionMediaT = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 6: Simulación de Hipótesis de Media (t)',
            description: `Permite generar experimentalmente ${k('N')} muestras aleatorias para contrastar la media poblacional (${k('\\mu')}) con varianza desconocida mediante la distribución ${k('t')} de Student.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t6-hp-selector-prueba',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Prueba Paramétrica',
            description: `Muestra seleccionada la prueba Media (t de Student) para contrastar ${k('H_0: \\mu = \\mu_0')} con ${k('n - 1')} grados de libertad.`,
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
        element: '#tour-t6-hp-modos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Permite alternar entre los modos de análisis: matriz, manual y simulación.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tema6-ayuda-hipotesis-simulador',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Guía Pedagógica del Simulador',
            description: 'Ofrece explicaciones conceptuales sobre cómo se generan las muestras, cómo se contrasta cada iteración y el significado de los errores de decisión.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-parametros',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros de Simulación (Media t)',
            description: `Permite configurar la media real (${k('\\mu')}) y la dispersión (${k('\\sigma')}) de la población generadora, junto con la media hipotética (${k('\\mu_0')}) a contrastar.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-alpha',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Nivel de Significancia',
            description: `Fija el nivel de significancia (${k('\\alpha')}), que determina el valor crítico teórico con el que se evaluará cada muestra simulada.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-h1',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Hipótesis Alternativa',
            description: `Define la orientación de la región crítica: Bilateral (${k('\\neq')}), Derecha (${k('>')}) o Izquierda (${k('<')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-muestras',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tamaño Muestral y Cantidad de Simulaciones',
            description: `Permite especificar el tamaño de cada muestra individual (${k('n')}) y el número total de repeticiones (${k('N')}) a simular.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-btn-ejecutar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ejecutar Simulación Monte Carlo',
            description: 'Inicia el motor de generación muestral y evaluación probabilística iteración por iteración.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-progreso',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Barra de Progreso y Control de Animación',
            description: 'Muestra el avance de las muestras simuladas y permite pausar, reanudar o acelerar la velocidad de animación (1x, 2x, 4x, MAX).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-metricas',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tasa Empírica de Rechazo (t)',
            description: `Contabiliza en tiempo real el porcentaje de muestras donde se rechazó ${k('H_0: \\mu = \\mu_0')}. Si ${k('\\mu = \\mu_0')}, estima el Error Tipo I empírico.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución t de Student y Estadísticos Simulados',
            description: `Muestra la curva teórica ${k('t')} con ${k('n - 1')} grados de libertad con cada estadístico simulado y las regiones críticas.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-tabla',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Historial de Muestras Simuladas (t)',
            description: `Tabla interactiva con la media (${k('\\bar{X}')}), desviación (${k('S')}), estadístico calculado (${k('t_c')}), ${k('p')}-valor y dictamen formal.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-acciones',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Exportación y Respaldo de Datos',
            description: 'Permite guardar el experimento en el espacio de trabajo o descargarlo en formato Excel (.xlsx) con todas las iteraciones.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 6A-3C: HIPÓTESIS PARAMÉTRICAS - PROPORCIÓN (SIMULACIÓN) ───
export const pasosHPSimulacionProporcion = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 6: Simulación de Hipótesis de Proporción',
            description: `Permite simular experimentalmente ${k('N')} muestras Bernoulli para contrastar la proporción poblacional (${k('p')}) contra un valor hipotético (${k('p_0')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t6-hp-selector-prueba',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Prueba Paramétrica',
            description: `Muestra seleccionada la prueba de Proporción (Z) para contrastar hipótesis sobre proporciones o tasas de éxito.`,
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
        element: '#tour-t6-hp-modos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Permite alternar entre los modos de análisis: matriz, manual y simulación.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tema6-ayuda-hipotesis-simulador',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Guía Pedagógica del Simulador',
            description: 'Ofrece explicaciones conceptuales sobre cómo se generan las muestras, cómo se contrasta cada iteración y el significado de los errores de decisión.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-parametros',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros de Simulación de Proporción',
            description: `Permite configurar la proporción poblacional real (${k('p')}) con la que se simularán los ensayos Bernoulli y la proporción hipotética (${k('p_0')}) bajo ${k('H_0')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-alpha',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Nivel de Significancia',
            description: `Fija el nivel de significancia (${k('\\alpha')}), que determina el valor crítico teórico con el que se evaluará cada muestra simulada.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-h1',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Hipótesis Alternativa',
            description: `Define la orientación de la región crítica: Bilateral (${k('\\neq')}), Derecha (${k('>')}) o Izquierda (${k('<')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-muestras',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tamaño Muestral y Cantidad de Simulaciones',
            description: `Permite especificar el tamaño de cada muestra individual (${k('n')}) y el número total de repeticiones (${k('N')}) a simular.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-btn-ejecutar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ejecutar Simulación Monte Carlo',
            description: 'Inicia el motor de generación muestral y evaluación probabilística iteración por iteración.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-progreso',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Barra de Progreso y Control de Animación',
            description: 'Muestra el avance de las muestras simuladas y permite pausar, reanudar o acelerar la velocidad de animación (1x, 2x, 4x, MAX).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-metricas',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tasa Empírica de Rechazo (Proporción)',
            description: `Contabiliza en tiempo real el porcentaje de muestras simuladas donde se rechazó ${k('H_0: p = p_0')}. Si ${k('p = p_0')}, estima el Error Tipo I empírico.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Aproximación Normal y Estadísticos Simulados',
            description: `Visualiza la distribución normal asintótica de la proporción muestral con los estadísticos calculados en cada réplica proyectados sobre las regiones de decisión.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-tabla',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Historial de Muestras Simuladas (Proporción)',
            description: `Detalla cada réplica con el número de éxitos observados (${k('x')}), proporción muestral (${k('\\hat{p}')}), estadístico ${k('Z_c')}, ${k('p')}-valor y veredicto de decisión.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-acciones',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Exportación y Respaldo de Datos',
            description: 'Permite guardar el experimento en el espacio de trabajo o descargarlo en formato Excel (.xlsx) con todas las iteraciones.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 6A-3D: HIPÓTESIS PARAMÉTRICAS - VARIANZA (SIMULACIÓN) ───
export const pasosHPSimulacionVarianza = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 6: Simulación de Hipótesis de Varianza (\\chi^2)',
            description: `Permite simular experimentalmente ${k('N')} muestras normales para contrastar la dispersión poblacional (${k('\\sigma^2')}) frente a una varianza hipotética (${k('\\sigma_0^2')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t6-hp-selector-prueba',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Prueba Paramétrica',
            description: `Muestra seleccionada la prueba de Varianza (${k('\\chi^2')}) para evaluar la variabilidad del proceso respecto a un valor de referencia.`,
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
        element: '#tour-t6-hp-modos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Permite alternar entre los modos de análisis: matriz, manual y simulación.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tema6-ayuda-hipotesis-simulador',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Guía Pedagógica del Simulador',
            description: 'Ofrece explicaciones conceptuales sobre cómo se generan las muestras, cómo se contrasta cada iteración y el significado de los errores de decisión.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-parametros',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros de Simulación de Varianza',
            description: `Permite definir la media (${k('\\mu')}) y varianza real (${k('\\sigma^2')}) de la población simulada, y la varianza hipotética (${k('\\sigma_0^2')}) a contrastar con ${k('\\chi^2')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-alpha',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Nivel de Significancia',
            description: `Fija el nivel de significancia (${k('\\alpha')}), que determina el valor crítico teórico con el que se evaluará cada muestra simulada.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-h1',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Hipótesis Alternativa',
            description: `Define la orientación de la región crítica: Bilateral (${k('\\neq')}), Derecha (${k('>')}) o Izquierda (${k('<')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-muestras',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tamaño Muestral y Cantidad de Simulaciones',
            description: `Permite especificar el tamaño de cada muestra individual (${k('n')}) y el número total de repeticiones (${k('N')}) a simular.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-btn-ejecutar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ejecutar Simulación Monte Carlo',
            description: 'Inicia el motor de generación muestral y evaluación probabilística iteración por iteración.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-progreso',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Barra de Progreso y Control de Animación',
            description: 'Muestra el avance de las muestras simuladas y permite pausar, reanudar o acelerar la velocidad de animación (1x, 2x, 4x, MAX).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-metricas',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tasa Empírica de Rechazo (Varianza)',
            description: `Contabiliza en tiempo real el porcentaje de muestras simuladas donde se rechazó ${k('H_0: \\sigma^2 = \\sigma_0^2')}. Si ${k('\\sigma^2 = \\sigma_0^2')}, estima el Error Tipo I empírico.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Chi-Cuadrada y Varianzas Simuladas',
            description: `Muestra la curva teórica ${k('\\chi^2')} con ${k('n - 1')} grados de libertad y los estadísticos calculados en cada muestra simulada.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-tabla',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Historial de Muestras Simuladas (Varianza)',
            description: `Detalla cada simulación con la varianza muestral calculada (${k('S^2')}), estadístico ${k('\\chi_c^2')}, ${k('p')}-valor y resolución estadística.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hp-sim-acciones',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Exportación y Respaldo de Datos',
            description: 'Permite guardar el experimento en el espacio de trabajo o descargarlo en formato Excel (.xlsx) con todas las iteraciones.',
            side: 'top',
            align: 'center'
        }
    }
];

export const pasosHipotesisParametricasSimulacion = pasosHPSimulacionMediaZ;
export const pasosHipotesisParametricas = pasosHipotesisParametricasMatriz;

// ─── TOUR 6B-1A: CHI-CUADRADA BONDAD DE AJUSTE (ANÁLISIS DE MATRIZ) ───
export const pasosHNPMatrizChiBondad = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 6: Bondad de Ajuste Chi-Cuadrada (Análisis de Matriz)',
            description: `Permite contrastar si las frecuencias observadas en la muestra siguen una distribución teórica esperada (${k('E_i')}) sin asumir normalidad poblacional.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t6-hnp-selector-prueba',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Prueba No Paramétrica',
            description: `Muestra seleccionada la Prueba Chi-Cuadrada (${k('\\chi^2')}) para contrastar frecuencias observadas contra frecuencias teóricas esperadas.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Variable',
            description: 'Permite seleccionar la variable categórica de la base de datos cuyas frecuencias observadas serán sometidas a la prueba.',
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
        element: '#tour-t6-hnp-modos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Permite cambiar entre el análisis de matriz con datos reales, el modo manual estructurado y la simulación probabilística.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-datos-resumen',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Observaciones',
            description: 'Indica el número de observaciones cargadas, agregadas y totales, junto con el acceso al editor de la matriz.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-alpha',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Nivel de Significancia',
            description: `Permite establecer el nivel de significancia (${k('\\alpha')}) para definir la probabilidad máxima admisible de cometer un Error Tipo I.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-subtipo-chi',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Subtipo de Prueba Chi-Cuadrada',
            description: 'Permite alternar entre la Prueba de Bondad de Ajuste (frecuencias observadas vs esperadas) y la Prueba de Independencia (asociación entre dos factores categóricos).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-tabla-esperadas',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Frecuencias Esperadas Teóricas',
            description: `Permite verificar y ajustar las frecuencias esperadas teóricas (${k('E_i')}) o probabilidades para cada categoría observada (${k('O_i')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Bondad de Ajuste',
            description: 'Ejecuta el cómputo del estadístico chi-cuadrada, grados de libertad, valor crítico, p-valor y veredicto de decisión.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-tabla-minitab',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Resultados Chi-Cuadrada',
            description: `Presenta los grados de libertad (${k('gl = k - 1')}), estadístico calculado (${k('\\chi_c^2')}), valor crítico delimitador (${k('\\chi_{\\alpha}^2')}) y el ${k('p')}-valor.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Chi-Cuadrada y Región Crítica',
            description: `Visualiza la curva asimétrica ${k('\\chi^2')} con sus grados de libertad, la zona crítica de rechazo en rojo (${k('\\alpha')}) y la ubicación del estadístico calculado.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-decision',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Decisión Estadística (Chi-Cuadrada)',
            description: `Expone la conclusión formal del contraste (Rechazar o No Rechazar ${k('H_0')}), la región de rechazo y la justificación matemática.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 6B-1B: CHI-CUADRADA INDEPENDENCIA (ANÁLISIS DE MATRIZ) ───
export const pasosHNPMatrizChiIndependencia = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 6: Independencia Chi-Cuadrada (Análisis de Matriz)',
            description: `Permite contrastar la hipótesis de independencia entre dos variables categóricas o factores cruzados a partir de los datos observados en la matriz.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t6-hnp-selector-prueba',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Prueba No Paramétrica',
            description: `Muestra seleccionada la Prueba Chi-Cuadrada (${k('\\chi^2')}) para evaluar asociación e independencia factorial.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Variables Categóricas',
            description: 'Permite seleccionar el par de variables cualitativas o categóricas que formarán las filas y columnas de la tabla de contingencia.',
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
        element: '#tour-t6-hnp-modos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Permite cambiar entre el análisis de matriz con datos reales, el modo manual estructurado y la simulación probabilística.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-datos-resumen',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Observaciones',
            description: 'Indica el total de pares de observaciones cargadas y agregadas disponibles para el análisis cruzado.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-alpha',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Nivel de Significancia',
            description: `Permite fijar el nivel de significancia (${k('\\alpha')}) para definir la frontera de decisión en la distribución ${k('\\chi^2')}.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-subtipo-chi',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Subtipo de Prueba Chi-Cuadrada',
            description: 'Confirmado el subtipo Independencia para evaluar si dos variables cualitativas son estadísticamente independientes.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-matriz-contingencia',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Matriz de Contingencia Bidimensional',
            description: `Presenta la distribución cruzada de frecuencias observadas (${k('O_{ij}')}) entre las categorías de filas y columnas (${k('r \\times c')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Independencia Chi-Cuadrada',
            description: `Calcula las frecuencias esperadas conjuntas (${k('E_{ij}')}), el estadístico ${k('\\chi_c^2')}, grados de libertad y p-valor.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-tabla-minitab',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Resultados de Independencia',
            description: `Resume los grados de libertad (${k('gl = (r - 1)(c - 1)')}), el estadístico calculado (${k('\\chi_c^2')}), el valor crítico (${k('\\chi_{\\alpha}^2')}) y el ${k('p')}-valor.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Chi-Cuadrada y Región Crítica',
            description: `Visualiza la curva teórica ${k('\\chi^2')} con la región crítica de rechazo en rojo y la posición del estadístico calculado.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-decision',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Decisión Estadística sobre Independencia',
            description: `Detalla el dictamen final: si las variables están asociadas estadísticamente o son mutuamente independientes según el nivel ${k('\\alpha')}.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 6B-1C: PRUEBA DE SIGNOS (ANÁLISIS DE MATRIZ) ───
export const pasosHNPMatrizSignos = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 6: Prueba de Signos (Análisis de Matriz)',
            description: `Permite contrastar la hipótesis sobre la mediana poblacional (${k('\\eta = \\eta_0')}) o muestras pareadas analizando únicamente los signos positivos (+) y negativos (−).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t6-hnp-selector-prueba',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Prueba No Paramétrica',
            description: 'Muestra seleccionada la Prueba de Signos para contrastes de ubicación de la mediana sin suponer normalidad.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Variable',
            description: 'Permite elegir la variable cuantitativa individual o las dos columnas de muestras pareadas a contrastar.',
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
        element: '#tour-t6-hnp-modos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Permite alternar entre el análisis de matriz con datos reales, el modo manual estructurado y la simulación probabilística.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-datos-resumen',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Observaciones',
            description: 'Indica el número de observaciones cargadas, agregadas y totales, junto con el botón para gestionar o editar los datos.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-alpha',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Nivel de Significancia',
            description: `Permite establecer el nivel de significancia (${k('\\alpha')}) para definir la probabilidad máxima de Error Tipo I.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-h1',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Dirección de la Hipótesis Alternativa',
            description: `Permite seleccionar la dirección del contraste (${k('H_1: \\neq, >, <')}) respecto a la mediana de referencia.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-columna-evaluar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Columna a Evaluar',
            description: 'Permite elegir la columna específica de la matriz cuyos registros serán restados contra el valor de referencia.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-signos-vref',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Valor de Referencia (Mediana Hipotética)',
            description: `Sirve para definir la constante o mediana hipotética (${k('v_{ref}')}) contra la que se calcularán las diferencias (${k('D_i = X_i - v_{ref}')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-signos-tabla',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Diferencias y Signos Calculados',
            description: `Muestra la resolución paso a paso con las diferencias y la asignación del signo positivo (+) o negativo (−), excluyendo empates.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Prueba de Signos',
            description: 'Ejecuta el conteo de signos positivos y negativos, determina el estadístico, p-valor y genera la conclusión.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-tabla-minitab',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Resultados de la Prueba de Signos',
            description: `Resume el tamaño de muestra (${k('n')}), empates excluidos, muestra efectiva, recuento de signos positivos y negativos, estadístico (${k('S')} o ${k('Z_c')}) y el ${k('p')}-valor.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución de Signos y Región Crítica',
            description: `Visualiza la distribución de probabilidad (Binomial exacta o aproximación Normal) del estadístico de signos con las zonas de rechazo coloreadas en rojo.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-decision',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Decisión Estadística (Prueba de Signos)',
            description: `Detalla el dictamen final sobre la mediana hipotética contrastada frente al valor de referencia y el ${k('p')}-valor.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 6B-1D: PRUEBA DE RACHAS (ANÁLISIS DE MATRIZ) ───
export const pasosHNPMatrizRachas = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 6: Prueba de Rachas (Análisis de Matriz)',
            description: 'Permite contrastar la hipótesis de aleatoriedad en una secuencia de observaciones cuantitativas o cualitativas dicotómicas a partir de los datos de la matriz.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t6-hnp-selector-prueba',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Prueba No Paramétrica',
            description: `Muestra seleccionada la Prueba de Rachas para evaluar si los datos siguen un ordenamiento aleatorio o presentan tendencias o agrupamientos.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Variable',
            description: 'Permite elegir la variable de la base de datos cuyas observaciones serán evaluadas en la prueba de rachas.',
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
        element: '#tour-t6-hnp-modos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Permite alternar entre el análisis de matriz con datos reales, el modo manual con estadísticos resumen y la simulación probabilística.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-datos-resumen',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Observaciones',
            description: 'Indica el número de observaciones cargadas, agregadas y totales, junto con el botón para gestionar o editar los datos.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-alpha',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Nivel de Significancia',
            description: `Permite fijar el nivel de significancia (${k('\\alpha')}) para definir la probabilidad máxima tolerable de Error Tipo I y determinar los valores críticos.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-h1',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Dirección de la Hipótesis Alternativa',
            description: `Permite seleccionar la dirección del contraste (${k('H_1: \\neq, >, <')}) para contrastar si la secuencia presenta agolpamiento o alternancia anormal.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-columna-evaluar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Columna a Evaluar',
            description: 'Permite seleccionar la columna específica de la variable elegida que se analizará para la prueba de rachas.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-rachas-corte',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Punto de Corte para Rachas',
            description: 'Permite definir el criterio de dicotomización cuantitativa: respecto a la Mediana, la Media Aritmética o un valor numérico Personalizado.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-rachas-tabla',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Datos y Resolución de la Prueba de Rachas',
            description: `Muestra cada observación clasificada en los dos grupos (${k('n_1')} y ${k('n_2')}) y el conteo acumulado de rachas alternadas (${k('R')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Prueba de Rachas',
            description: 'Ejecuta el cálculo formal del estadístico tipificado Z, determina la región crítica, calcula el p-valor y genera la conclusión estadística.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-rachas-resumen',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Extracción de Rachas',
            description: `Presenta la muestra inicial, empates ignorados, muestra efectiva, recuentos de símbolos (${k('n_1, n_2')}), total de rachas (${k('R')}) y la secuencia dicotómica observada.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-tabla-minitab',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Resultados de Rachas',
            description: `Condensa el número de rachas (${k('R')}), media esperada (${k('\\mu_R')}), desviación estándar (${k('\\sigma_R')}), estadístico tipificado (${k('Z_c')}), valor crítico (${k('Z_{crit}')}) y el ${k('p')}-valor.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Normal y Región Crítica',
            description: `Visualiza la curva normal estandarizada con la región de retención en azul, las zonas de rechazo en rojo (${k('\\alpha')}) y la ubicación exacta del estadístico tipificado ${k('Z_c')}.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-decision',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Decisión Estadística sobre Aleatoriedad',
            description: `Detalla el dictamen final sobre la hipótesis nula (${k('H_0')}), la regla de rechazo formal y la conclusión de si la secuencia de observaciones es aleatoria o no.`,
            side: 'top',
            align: 'center'
        }
    }
];

export const pasosHipotesisNoParametricasMatriz = pasosHNPMatrizChiBondad;

// ─── TOUR 6B-2A: CHI-CUADRADA BONDAD DE AJUSTE (MODO MANUAL) ───
export const pasosHNPManualChiBondad = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 6: Bondad de Ajuste Chi-Cuadrada (Modo Manual)',
            description: `Permite contrastar si las frecuencias observadas en ${k('k')} categorías siguen una distribución teórica esperada ingresando directamente los recuentos manuales.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t6-hnp-selector-prueba',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Prueba No Paramétrica',
            description: `Muestra seleccionada la prueba Chi-Cuadrada (${k('\\chi^2')}) para contrastar frecuencias observadas contra esperadas.`,
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
        element: '#tour-t6-hnp-modos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Permite alternar entre análisis de matriz, modo manual y simulación.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-config',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Configuración de Chi-Cuadrada',
            description: `Permite fijar el nivel de significancia (${k('\\alpha')}) y confirmar el subtipo de prueba: Bondad de Ajuste.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-entradas',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Frecuencias Observadas y Esperadas',
            description: `Tabla editable para registrar las frecuencias observadas (${k('O_i')}) y frecuencias esperadas teóricas (${k('E_i')}) de cada categoría.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-btn-agregar-fila',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Agregar Nueva Fila o Categoría',
            description: 'Haz clic en este botón si tu ejercicio tiene más categorías observadas y requieres incorporar filas adicionales a la prueba de bondad de ajuste.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Bondad de Ajuste',
            description: 'Procesa las frecuencias ingresadas y calcula el estadístico de prueba, valor crítico, p-valor y genera la conclusión.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-tabla-minitab',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Resultados de la Prueba Chi-Cuadrada',
            description: `Presenta los grados de libertad (${k('gl')}), el estadístico de prueba calculado (${k('\\chi_c^2')}), el valor crítico delimitador (${k('\\chi_{\\alpha}^2')}) y el ${k('p')}-valor.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Chi-Cuadrada y Región Crítica',
            description: `Visualiza la curva asimétrica ${k('\\chi^2')} con los grados de libertad correspondientes y la zona crítica de rechazo en rojo (${k('\\alpha')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-decision',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Decisión Estadística (Chi-Cuadrada)',
            description: `Expone el dictamen formal sobre la hipótesis nula de bondad de ajuste a partir de la comparación del estadístico y el ${k('p')}-valor.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 6B-2B: CHI-CUADRADA INDEPENDENCIA (MODO MANUAL) ───
export const pasosHNPManualChiIndependencia = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 6: Independencia Chi-Cuadrada (Modo Manual)',
            description: `Permite contrastar la hipótesis de independencia o asociación entre dos variables categóricas ingresando una tabla de contingencia manual.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t6-hnp-selector-prueba',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Prueba No Paramétrica',
            description: `Muestra seleccionada la prueba Chi-Cuadrada (${k('\\chi^2')}) para evaluar la independencia de factores categóricos.`,
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
        element: '#tour-t6-hnp-modos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Permite alternar entre análisis de matriz, modo manual y simulación.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-config',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Configuración de Chi-Cuadrada',
            description: `Permite fijar el nivel de significancia (${k('\\alpha')}) y confirmar el subtipo de prueba: Independencia.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-entradas',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Contingencia (Independencia)',
            description: `Permite configurar las dimensiones de filas (${k('F')}) y columnas (${k('C')}) e ingresar las frecuencias observadas en cada celda para evaluar la asociación.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Prueba de Independencia',
            description: 'Procesa la tabla de contingencia y calcula las frecuencias marginales, frecuencias esperadas y el estadístico Chi-cuadrada.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-tabla-minitab',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Resultados de Independencia',
            description: `Presenta los grados de libertad (${k('(F-1)(C-1)')}), el estadístico de prueba calculado (${k('\\chi_c^2')}), el valor crítico delimitador y el ${k('p')}-valor.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Chi-Cuadrada y Región Crítica',
            description: `Visualiza la curva asimétrica ${k('\\chi^2')} con los grados de libertad de la tabla y la zona crítica de rechazo en rojo (${k('\\alpha')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-decision',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Decisión Estadística (Independencia)',
            description: `Expone la conclusión formal sobre la independencia entre las dos variables evaluadas a partir del ${k('p')}-valor.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 6B-2C: PRUEBA DE SIGNOS (MODO MANUAL) ───
export const pasosHNPManualSignos = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 6: Prueba de Signos (Modo Manual)',
            description: `Permite contrastar hipótesis sobre la mediana de una población ingresando directamente el conteo de signos positivos y negativos observados.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t6-hnp-selector-prueba',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Prueba No Paramétrica',
            description: 'Muestra seleccionada la Prueba de Signos para evaluar la mediana a través de recuentos dicotómicos (+ / -).',
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
        element: '#tour-t6-hnp-modos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Permite alternar entre análisis de matriz, modo manual y simulación.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-config',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Configuración de la Prueba de Signos',
            description: `Permite seleccionar el nivel de significancia (${k('\\alpha')}) y el sentido de la hipótesis alternativa (${k('H_1: \\neq, >, <')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-entradas',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Conteos de Signos Positivos y Negativos',
            description: 'Permite ingresar el total de observaciones mayores (+) y menores (-) respecto al valor de referencia para contrastar la mediana.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Prueba de Signos',
            description: 'Calcula la probabilidad binomial exacta o aproximación normal y determina la decisión sobre la hipótesis nula.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-tabla-minitab',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Resultados de la Prueba de Signos',
            description: `Resume el tamaño de muestra (${k('n')}), recuentos de signos positivos y negativos, estadístico de prueba (${k('S')} o ${k('Z_c')}) y el ${k('p')}-valor.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución de Signos y Región Crítica',
            description: `Visualiza la distribución de probabilidad (Binomial o aproximación Normal) del estadístico de signos con las zonas de rechazo coloreadas en rojo.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-decision',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Decisión Estadística (Prueba de Signos)',
            description: `Detalla el dictamen final sobre la mediana hipotética contrastada frente al valor de referencia.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 6B-2D: PRUEBA DE RACHAS (MODO MANUAL) ───
export const pasosHNPManualRachas = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 6: Prueba de Rachas (Modo Manual)',
            description: `Permite contrastar la hipótesis de aleatoriedad en una secuencia de datos binarios ingresando el recuento de elementos de cada grupo y las rachas observadas.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t6-hnp-selector-prueba',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Prueba No Paramétrica',
            description: 'Muestra seleccionada la Prueba de Rachas para evaluar la aleatoriedad e independencia de la secuencia.',
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
        element: '#tour-t6-hnp-modos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Permite alternar entre análisis de matriz, modo manual y simulación.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-config',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Configuración de la Prueba de Rachas',
            description: `Permite fijar el nivel de significancia (${k('\\alpha')}) para evaluar la aleatoriedad de la secuencia.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-entradas',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros Muestrales de Rachas',
            description: `Permite ingresar el recuento de elementos del grupo 1 (${k('n_1')}), grupo 2 (${k('n_2')}) y el número total de rachas alternadas observadas (${k('R')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Calcular Prueba de Rachas',
            description: 'Calcula el número esperado de rachas, la varianza teórica y el estadístico tipificado Z.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-tabla-minitab',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Resultados de la Prueba de Rachas',
            description: `Resume las observaciones divididas en ambos grupos (${k('n_1, n_2')}), el total de rachas alternadas (${k('R')}), el estadístico tipificado (${k('Z_c')}) y el ${k('p')}-valor.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-grafico',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución de Rachas y Región Crítica',
            description: `Visualiza la curva normal del estadístico de rachas con las áreas de rechazo demarcadas en rojo.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-manual-decision',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Decisión Estadística sobre Aleatoriedad',
            description: `Detalla la conclusión sobre si la secuencia de datos observada es estadísticamente aleatoria o muestra patrones de agolpamiento.`,
            side: 'top',
            align: 'center'
        }
    }
];

export const pasosHipotesisNoParametricasManual = pasosHNPManualChiBondad;

// ─── TOUR 6B-3A: PRUEBA DE SIGNOS (SIMULACIÓN) ───
export const pasosHNPSimulacionSignos = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 6: Simulación de la Prueba de Signos',
            description: `Permite generar experimentalmente ${k('N')} muestras aleatorias bajo la hipótesis nula de la mediana para evaluar la tasa empírica de rechazo del estadístico de signos (${k('S')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t6-hnp-selector-prueba',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Prueba No Paramétrica',
            description: `Muestra seleccionada la Prueba de Signos para contrastar la mediana poblacional mediante recuentos dicotómicos (+ / -).`,
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
        element: '#tour-t6-hnp-modos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Permite alternar entre los modos de trabajo: matriz, manual y simulación.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tema6-ayuda-hipotesis-no-parametrica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Guía Pedagógica de la Prueba de Signos',
            description: `Explica los conceptos de la distribución binomial con probabilidad ${k('p = 0.5')}, el conteo de signos y la regla de decisión formal.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-parametros',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tamaño Muestral de la Simulación',
            description: `Permite ingresar el tamaño de muestra (${k('n')}) para generar las observaciones independientes y contabilizar los signos positivos y negativos.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-config',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Significancia y Sentido del Contraste',
            description: `Permite seleccionar el nivel de significancia (${k('\\alpha')}) y la dirección de la hipótesis alternativa (${k('H_1: \\neq, >, <')}) para evaluar las réplicas de signos.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-muestras',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Número de Simulaciones',
            description: `Permite establecer la cantidad de repeticiones (${k('N')}) a generar en el experimento estocástico de signos.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-btn-ejecutar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ejecutar Simulación de Signos',
            description: `Inicia la generación Monte Carlo de las ${k('N')} réplicas y el conteo de signos positivos y negativos en cada una.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-progreso',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Control de Ejecución y Velocidad',
            description: 'Permite pausar, reanudar y graduar la velocidad de animación de la simulación en tiempo real (1x, 2x, 4x, MAX).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-resumen',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Rechazos de la Prueba de Signos',
            description: `Muestra en tiempo real la tasa empírica de rechazo de ${k('H_0')} para la mediana frente a las retenciones observadas.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#widget-grafica-hp-simulacion-signos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución de Estadísticos de Signos',
            description: `Visualiza la distribución de probabilidad (Binomial o aproximación Normal) del estadístico de signos (${k('S')}) proyectando cada muestra en su región correspondiente.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#widget-histograma-puro-signos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Histograma de Frecuencias de Signos',
            description: `Muestra la distribución de frecuencias empíricas de los éxitos (${k('S')}) obtenidos a lo largo de las réplicas simuladas.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-tabla',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Historial de Muestras de Signos',
            description: `Detalla cada simulación con su número de iteración, conteo de signos positivos (+), signos negativos (-), estadístico observado, ${k('p')}-valor y veredicto de decisión.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-paginacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Controles de Paginación',
            description: 'Permite navegar entre las páginas del historial de réplicas de la prueba de signos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-acciones',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Guardar o Exportar Resultados',
            description: 'Permite almacenar el experimento de signos en el espacio de trabajo o descargarlo en formato Excel (.xlsx).',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 6B-3B: PRUEBA DE RACHAS (SIMULACIÓN) ───
export const pasosHNPSimulacionRachas = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 6: Simulación de la Prueba de Rachas',
            description: `Permite simular computacionalmente ${k('N')} secuencias con dos grupos de símbolos para evaluar empíricamente la distribución de las rachas (${k('R')}) y contrastar la aleatoriedad.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t6-hnp-selector-prueba',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Prueba No Paramétrica',
            description: `Muestra seleccionada la Prueba de Rachas para evaluar si una secuencia binaria sigue un patrón aleatorio o presenta agrupamientos.`,
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
        element: '#tour-t6-hnp-modos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Permite alternar entre los modos de trabajo: matriz, manual y simulación.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tema6-ayuda-hipotesis-no-parametrica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Guía Pedagógica de la Prueba de Rachas',
            description: `Explica los fundamentos del ordenamiento aleatorio, el conteo de secuencias de elementos contiguos (${k('R')}) y el estadístico normal tipificado.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-parametros',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Cantidades por Grupo para Rachas',
            description: `Permite fijar la cantidad de elementos del símbolo 1 (${k('n_1')}) y símbolo 2 (${k('n_2')}) para generar las secuencias permutadas.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-config',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Significancia y Dirección de la Hipótesis',
            description: `Permite fijar el nivel de significancia (${k('\\alpha')}) y la dirección del contraste (${k('H_1: \\neq, >, <')}) para evaluar si hay agolpamiento o alternancia excesiva.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-muestras',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Número de Simulaciones',
            description: `Permite establecer el número de secuencias aleatorias (${k('N')}) a generar en la simulación de rachas.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-btn-ejecutar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ejecutar Simulación de Rachas',
            description: `Dispara el algoritmo de permutación aleatoria (Fisher-Yates) para generar las secuencias y contabilizar las rachas alternadas ${k('R')}.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-progreso',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Control de Ejecución y Velocidad',
            description: 'Permite pausar, reanudar y graduar la velocidad de animación en tiempo real (1x, 2x, 4x, MAX).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-resumen',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Rechazos de la Prueba de Rachas',
            description: `Muestra en tiempo real la tasa empírica de rechazo de la hipótesis de aleatoriedad a lo largo de las secuencias simuladas.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-grafico-rachas-z',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Normal del Estadístico Z',
            description: `Presenta la curva normal estandarizada teórica con el estadístico tipificado ${k('Z_c')} evaluado en cada iteración y las zonas de rechazo definidas por ${k('\\alpha')}.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-grafico-rachas-r',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución de Rachas Observadas',
            description: `Grafica la dispersión e histograma del número de rachas observadas (${k('R')}) registradas en cada secuencia simulada.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-tabla',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Historial de Secuencias de Rachas',
            description: `Detalla cada iteración con el número de rachas (${k('R')}), tamaños de grupo (${k('n_1, n_2')}), estadístico tipificado (${k('Z_c')}), ${k('p')}-valor y veredicto de aleatoriedad.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-paginacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Controles de Paginación',
            description: 'Permite navegar entre las páginas del historial de simulaciones de rachas.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-acciones',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Guardar o Exportar Resultados',
            description: 'Permite almacenar la simulación en el espacio de trabajo o descargarla en formato Excel (.xlsx).',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 6B-3C: CHI-CUADRADA BONDAD DE AJUSTE (SIMULACIÓN) ───
export const pasosHNPSimulacionChiBondad = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 6: Simulación de Bondad de Ajuste (\\chi^2)',
            description: `Permite generar experimentalmente ${k('N')} muestras multinomiales para evaluar empíricamente el comportamiento del estadístico ${k('\\chi_c^2')} frente a frecuencias esperadas uniformes.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t6-hnp-selector-prueba',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Prueba No Paramétrica',
            description: `Muestra seleccionada la Prueba Chi-Cuadrada para contrastar la concordancia entre frecuencias observadas y esperadas.`,
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
        element: '#tour-t6-hnp-modos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Permite alternar entre los modos de trabajo: matriz, manual y simulación.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tema6-ayuda-hipotesis-no-parametrica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Guía Pedagógica de Bondad de Ajuste',
            description: `Explica los principios de la distribución multinomial, las discrepancias al cuadrado ponderadas y los grados de libertad (${k('k - 1')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-parametros',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Número de Categorías Simuladas',
            description: `Permite establecer la cantidad de categorías (${k('k')}) a simular en la distribución multinomial para contrastar la bondad de ajuste.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-config',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Significancia y Subtipo Chi-Cuadrada',
            description: `Permite fijar el nivel de significancia (${k('\\alpha')}) y confirmar el subtipo de prueba: Bondad de Ajuste.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-muestras',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tamaño Muestral y Número de Simulaciones',
            description: `Permite ingresar el tamaño de muestra (${k('n')}) a clasificar entre las ${k('k')} categorías y la cantidad de repeticiones (${k('N')}) a simular.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-btn-ejecutar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ejecutar Simulación Chi-Cuadrada',
            description: `Inicia la generación estocástica de frecuencias multinomiales y el cálculo del estadístico ${k('\\chi_c^2')} para cada réplica.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-progreso',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Control de Ejecución y Velocidad',
            description: 'Permite pausar, reanudar y controlar la velocidad de animación de la simulación en tiempo real (1x, 2x, 4x, MAX).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-resumen',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Rechazos Chi-Cuadrada',
            description: `Muestra en tiempo real la tasa de rechazo de ${k('H_0')} comparando el estadístico ${k('\\chi_c^2')} con el umbral crítico (${k('\\chi_{\\alpha, k-1}^2')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#widget-grafica-hp-simulacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Teórica y Estadísticos Simulados',
            description: `Muestra la curva de densidad ${k('\\chi^2')} con ${k('k - 1')} grados de libertad y los puntos de cada iteración superpuestos, clasificados en retención (verde) y rechazo (rojo).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#widget-histograma-puro',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Histograma de Frecuencias Absolutas',
            description: `Presenta el histograma de frecuencias de los estadísticos ${k('\\chi_c^2')} calculados en todas las simulaciones para contrastar la distribución observada contra la forma teórica.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-tabla',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Historial de Réplicas Chi-Cuadrada',
            description: `Detalla cada simulación con las frecuencias observadas en las categorías, el estadístico calculado (${k('\\chi_c^2')}), el ${k('p')}-valor y la decisión adoptada.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-paginacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Controles de Paginación',
            description: 'Permite navegar entre las páginas del historial de simulaciones para inspeccionar réplicas anteriores o posteriores.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-acciones',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Guardar o Exportar Resultados',
            description: 'Permite almacenar la simulación en el espacio de trabajo activo o descargarla a un libro de Excel (.xlsx).',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 6B-3D: CHI-CUADRADA INDEPENDENCIA (SIMULACIÓN) ───
export const pasosHNPSimulacionChiIndependencia = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 6: Simulación de Independencia (\\chi^2)',
            description: `Permite generar experimentalmente ${k('N')} tablas de contingencia bivariadas bajo el supuesto de independencia para evaluar empíricamente el estadístico ${k('\\chi_c^2')}.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-t6-hnp-selector-prueba',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Prueba No Paramétrica',
            description: `Muestra seleccionada la Prueba Chi-Cuadrada para contrastar la hipótesis de independencia entre dos factores categóricos.`,
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
        element: '#tour-t6-hnp-modos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Permite alternar entre los modos de trabajo: matriz, manual y simulación.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tema6-ayuda-hipotesis-no-parametrica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Guía Pedagógica de Independencia',
            description: `Explica cómo se generan las frecuencias conjuntas bajo independencia de factores y el cálculo de grados de libertad (${k('(F - 1)(C - 1)')}).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-parametros',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Dimensiones de la Tabla de Contingencia',
            description: `Permite configurar el número de filas (${k('F')}) y columnas (${k('C')}) para simular tablas bivariadas y contrastar la hipótesis de independencia.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-config',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Significancia y Subtipo Chi-Cuadrada',
            description: `Permite fijar el nivel de significancia (${k('\\alpha')}) y confirmar el subtipo de prueba: Independencia.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-muestras',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tamaño Muestral y Número de Simulaciones',
            description: `Permite ingresar el total de observaciones (${k('n')}) a distribuir en las celdas de la tabla y la cantidad de repeticiones (${k('N')}) a simular.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-btn-ejecutar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ejecutar Simulación de Independencia',
            description: `Dispara la simulación de tablas de contingencia bivariadas y el cómputo de la discrepancia de frecuencias conjuntas.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-progreso',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Control de Ejecución y Velocidad',
            description: 'Permite pausar, reanudar y controlar la velocidad de animación de la simulación en tiempo real (1x, 2x, 4x, MAX).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-resumen',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Rechazos de Independencia',
            description: `Muestra en tiempo real la tasa de rechazo de la hipótesis de independencia a lo largo de las tablas simuladas.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#widget-grafica-hp-simulacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Distribución Chi-Cuadrada Teórica',
            description: `Muestra la curva ${k('\\chi^2')} con ${k('(F - 1)(C - 1)')} grados de libertad y los estadísticos calculados.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#widget-histograma-puro',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Histograma de Frecuencias Absolutas',
            description: `Histograma de frecuencias de los estadísticos ${k('\\chi_c^2')} generados bajo la hipótesis de independencia.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-tabla',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Historial de Tablas Simuladas',
            description: `Detalla cada tabla bivariada simulada, el estadístico calculado (${k('\\chi_c^2')}), el ${k('p')}-valor y la decisión de independencia.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-paginacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Controles de Paginación',
            description: 'Permite navegar entre las páginas del historial de simulaciones de independencia.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-t6-hnp-sim-acciones',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Guardar o Exportar Resultados',
            description: 'Permite almacenar la simulación en el espacio de trabajo activo o descargarla a un libro de Excel (.xlsx).',
            side: 'top',
            align: 'center'
        }
    }
];

export const pasosHipotesisNoParametricasSimulacion = pasosHNPSimulacionChiBondad;
export const pasosHipotesisNoParametricas = pasosHipotesisNoParametricasMatriz;
