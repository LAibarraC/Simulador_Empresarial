import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renderiza una expresión matemática en HTML usando KaTeX para los tooltips de Tema 1
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
 * GUÍA INTERACTIVA DE APRENDIZAJE - TEMA 1: INTRODUCCIÓN A LA PROBABILIDAD
 * ==============================================================================
 * Submódulo hijo importado por Guia.js (padre).
 * Controla:
 * 1. Técnicas de Conteo (Permutaciones y Combinaciones)
 * 2. Cálculo de Probabilidades (Clásica, Frecuentista, Condicional)
 * 3. Simulación de Probabilidad Clásica
 * 4. Experimentos de Probabilidad (Simple y Compuesto)
 * 5. Teorema de Probabilidad Total y Teorema de Bayes (Matriz y Manual)
 * 6. Axiomas y Regla de la Adición (Matriz y Manual)
 * 7. Regla de la Multiplicación (Matriz y Manual)
 */

// ─── TOUR 2: TÉCNICAS DE CONTEO (TEMA 1) ───
export const pasosConteo = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Técnicas de Conteo',
            description: 'Sirve para calcular de cuántas formas se pueden ordenar o agrupar los elementos de un conjunto, tanto si importa el orden (Permutaciones) como si no importa el orden (Combinaciones).',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-conteo-valores',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Total (${k('n')}) y Muestra (${k('r')})`,
            description: `Sirve para definir el tamaño de tu conjunto:\n<b>-</b> <b>Total (${k('n')}):</b> Cantidad total de elementos disponibles.\n<b>-</b> <b>Muestra (${k('r')}):</b> Cantidad de elementos que vas a tomar en cada grupo.\nPuedes escribir el número o usar los botones <b>+</b> y <b>−</b>.`,
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#tour-conteo-tipo-elementos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Elementos',
            description: `Sirve para elegir cómo representar los elementos en los resultados: con letras (${k('A, B, C, \\dots')}), con números (${k('1, 2, 3, \\dots')}) o con nombres personalizados que tú escribas separados por comas.`,
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#tour-conteo-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Botón Calcular',
            description: 'Haz clic aquí para realizar el cálculo. Te mostrará las fórmulas resueltas y todos los arreglos posibles de Permutaciones y Combinaciones.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-conteo-resultados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Panel de Resultados',
            description: 'Muestra las tarjetas con los resultados de Permutaciones y Combinaciones, sus fórmulas desarrolladas y la lista de todos los grupos formados.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-conteo-permutaciones',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Permutaciones ${k('(P)')}: Importa el orden`,
            description: `Muestra el resultado cuando el orden de los elementos sí importa (por ejemplo, ${k('AB')} es diferente de ${k('BA')}). Incluye la fórmula resuelta, el número total de arreglos y la lista visual de agrupaciones.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-conteo-combinaciones',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Combinaciones ${k('(C)')}: No importa el orden`,
            description: `Muestra el resultado cuando el orden no importa (por ejemplo, ${k('AB')} y ${k('BA')} representan el mismo grupo). Incluye la fórmula resuelta, el total de grupos y la lista de agrupaciones.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 3: FLUJO DE TRABAJO DEL TEMA 1 (CÁLCULO DE PROBABILIDADES) ───
export const pasosTema1 = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Cálculo de Probabilidad',
            description: 'Sirve para calcular la probabilidad de que ocurran eventos dentro de un espacio muestral usando el enfoque clásico, frecuentista o condicional.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-tipo-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Probabilidad',
            description: 'Sirve para elegir el enfoque de cálculo:\n<b>-</b> <b>Clásica:</b> Divide los casos favorables entre los casos posibles cuando todos tienen la misma opción de salir.\n<b>-</b> <b>Frecuentista:</b> Se basa en los datos reales que tienes cargados.\n<b>-</b> <b>Condicional:</b> Calcula la probabilidad de un evento sabiendo que ya ocurrió otro.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Variable',
            description: 'Sirve para elegir la columna de datos sobre la cual deseas realizar el análisis de probabilidad.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral y tener más espacio para ver tus resultados.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-mat251-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para elegir cómo ingresar los datos: analizando tu matriz de datos cargada o ingresando valores manualmente.',
            side: 'bottom',
            align: 'center'
        }
    },
    // Pasos para Análisis de Matriz:
    {
        element: '#tour-mat251-espacio-muestral',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Espacio Muestral (Ω)',
            description: 'Muestra todos los valores posibles y el total de casos observados en los datos. Puedes usar "Editar Datos" para modificarlos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-mat251-evento-condicion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Evento Condición (B)',
            description: 'Sirve para elegir la condición previa que ya ocurrió, la cual reduce el espacio muestral en la probabilidad condicional.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-mat251-evento-favorable',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Evento Favorable (A)',
            description: 'Sirve para seleccionar el evento del cual quieres calcular la probabilidad.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-mat251-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Botón Calcular',
            description: 'Haz clic aquí para procesar los datos y ver el resultado final con la fórmula resuelta.',
            side: 'top',
            align: 'center'
        }
    },
    // Pasos para Modo Manual:
    {
        element: '#tour-mat251-manual-numerador',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Casos Favorables (Numerador)',
            description: 'Sirve para ingresar la cantidad de casos a favor de tu evento o la probabilidad del suceso.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-manual-denominador',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Total de Casos (Denominador)',
            description: 'Sirve para ingresar el total de casos posibles en el espacio muestral.',
            side: 'bottom',
            align: 'start'
        }
    },
    // Fórmulas y Resultados:
    {
        element: '#tour-mat251-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Fórmula y Desarrollo Matemático',
            description: 'Muestra la fórmula matemática paso a paso sustituyendo los valores numéricos y el resultado en decimal y porcentaje.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-mat251-resultados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tarjetas de Resultados',
            description: 'Muestra el resumen con el total de casos posibles, casos favorables y el porcentaje final de probabilidad.',
            side: 'top',
            align: 'center'
        }
    },
    // Pasos para Simulación Clásica:
    {
        element: '#tour-sim-tabla-historial',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Historial de Simulaciones',
            description: 'Muestra una tabla con cada ensayo o lanzamiento simulado, el resultado obtenido y si contó como caso favorable.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-sim-botones-exportar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Guardar y Descargar (.xlsx)',
            description: `Sirve para exportar y almacenar tus resultados:\n<b>-</b> <b>Guardar:</b> Almacena la hoja de cálculo en la nube en tu <b>Espacio Personal</b> de SICE.\n<b>-</b> <b>Descargar (.xlsx):</b> Descarga directamente el archivo Excel a tu computadora o celular.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 6: SIMULACIÓN DE PROBABILIDAD (CLÁSICA) ───
export const pasosSimulacionClasica = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Cálculo de Probabilidad',
            description: 'Sirve para simular experimentos aleatorios mediante repeticiones por computadora y comprobar la probabilidad teórica.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-tipo-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Enfoque de Probabilidad',
            description: 'Muestra que la simulación se aplica sobre la probabilidad clásica en experimentos con resultados de igual probabilidad.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o mostrar el panel lateral y tener más espacio para ver tus resultados.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-mat251-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada: Simulación',
            description: 'Sirve para ejecutar ensayos aleatorios por computadora y comparar la frecuencia obtenida con la probabilidad teórica.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-sim-selector-exp',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Experimento',
            description: 'Sirve para elegir qué experimento deseas simular: lanzamiento de moneda, lanzamiento de dado o extracción de cartas.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-sim-selector-evento',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Evento de Interés',
            description: 'Sirve para elegir el suceso que quieres contar como éxito en cada repetición (por ejemplo: cara, número par o as).',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-sim-repeticiones',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Repeticiones (${k('N')})`,
            description: 'Sirve para ingresar cuántas veces se repetirá el experimento en la simulación.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-sim-btn-iniciar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Iniciar Simulación',
            description: 'Haz clic aquí para iniciar los lanzamientos con animación interactiva.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-sim-progreso-controles',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Control y Velocidad',
            description: 'Muestra el número de lanzamiento actual y sirve para cambiar la velocidad o pausar la simulación.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-sim-comparacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Comparación Teórica vs. Simulada',
            description: 'Muestra la comparación directa entre la probabilidad teórica exacta y la probabilidad obtenida en la simulación.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-sim-exitos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Éxitos Obtenidos',
            description: 'Muestra la cantidad de veces que salió el resultado que estabas buscando.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-sim-metricas-empiricas',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Métricas Empíricas',
            description: `Muestra los estimadores de los datos simulados:\n<b>-</b> Esperanza Empírica (${k('E(X)')})\n<b>-</b> Varianza Empírica (${k('V(X)')})\n<b>-</b> Desviación Estándar (${k('\\sigma')})`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-sim-grafica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfica de Convergencia',
            description: 'Muestra cómo la probabilidad de la simulación se aproxima a la probabilidad teórica conforme se realizan más lanzamientos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-sim-tabla-historial',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Historial de Lanzamientos',
            description: 'Muestra una tabla con cada lanzamiento, el resultado obtenido y si fue un caso favorable.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-sim-botones-exportar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Guardar y Descargar (.xlsx)',
            description: `Sirve para guardar el historial en tu espacio personal en la nube o descargarlo directamente en Excel a tu dispositivo.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 4: EXPERIMENTOS DE PROBABILIDAD (SIMPLE) ───
export const pasosExperimentosSimple = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Cálculo de Probabilidad',
            description: 'Sirve para modelar y calcular la probabilidad de eventos en experimentos aleatorios simples.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-tipo-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Enfoque Clásico',
            description: 'Muestra que el cálculo se realiza dividiendo los casos favorables entre los casos posibles cuando todos los resultados tienen la misma opción de salir.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada: Experimentos',
            description: 'Sirve para definir las opciones posibles de tu experimento y las condiciones que debe cumplir el evento.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-tipo-selector',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Experimento',
            description: 'Sirve para elegir si trabajas con un solo experimento (Simple, como un dado) o con dos o más al mismo tiempo (Compuesto, como dos dados).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-config-simple',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Definición del Experimento',
            description: `Sirve para escribir el nombre de tu experimento y los resultados posibles separados por comas (por ejemplo: ${k('1, 2, 3, 4, 5, 6')} o Cara, Cruz).`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-espacio-muestral',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Espacio Muestral (${k('\\Omega')})`,
            description: 'Muestra la lista de todos los resultados posibles del experimento y el número total de casos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-condiciones',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condiciones del Evento',
            description: 'Sirve para indicar qué resultado estás buscando (por ejemplo: igual a, mayor que, menor que) para evaluar su probabilidad.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Botón Calcular',
            description: 'Haz clic aquí para calcular la probabilidad teórica, ver qué resultados cumplen la condición y activar la simulación.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-resultados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resultado del Evento',
            description: 'Muestra cuántos casos salieron a favor, el total de casos posibles, la probabilidad en porcentaje y la fórmula resuelta.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-espacio-resultado',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Espacio Muestral con Resultados',
            description: 'Muestra el espacio muestral destacando en color verde los resultados que cumplieron tu condición.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-sim-repeticiones',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Repeticiones de Simulación (${k('N')})`,
            description: 'Sirve para indicar cuántas veces quieres repetir el experimento al azar en la computadora para comprobar el resultado de forma experimental.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-btn-iniciar-sim',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Iniciar Simulación',
            description: 'Haz clic aquí para comenzar los lanzamientos simulados y ver el avance en tiempo real.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-sim-progreso',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Control y Velocidad',
            description: 'Muestra el número de lanzamiento actual y sirve para cambiar la velocidad de la animación o pausar la simulación.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-sim-comparacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Teórica vs Simulada',
            description: 'Muestra la comparación entre la Probabilidad Teórica calculada y la Probabilidad Simulada que se va obteniendo con los lanzamientos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-sim-exitos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Éxitos Obtenidos',
            description: 'Muestra cuántas veces se cumplió la condición favorable a lo largo de todos los lanzamientos realizados.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-sim-metricas-empiricas',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Métricas Empíricas',
            description: `Muestra el promedio (Esperanza), la varianza y la desviación estándar calculadas a partir de los datos simulados:\n<b>-</b> Esperanza Empírica (${k('E(X)')})\n<b>-</b> Varianza Empírica (${k('V(X)')})\n<b>-</b> Desviación Estándar (${k('\\sigma')})`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-sim-grafica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfica de Convergencia',
            description: 'Muestra una gráfica interactiva de cómo la probabilidad simulada se va acercando a la teórica a medida que aumentan los lanzamientos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-sim-tabla',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Historial de Lanzamientos',
            description: 'Muestra una tabla con cada lanzamiento simulado, el resultado obtenido y si contó como éxito.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-sim-botones',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Guardar y Descargar (.xlsx)',
            description: `Sirve para guardar el historial de la simulación en tu espacio personal en la nube o descargarlo en un archivo Excel.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 5: EXPERIMENTOS DE PROBABILIDAD (COMPUESTO) ───
export const pasosExperimentosCompuesto = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Cálculo de Probabilidad',
            description: 'Sirve para modelar y calcular la probabilidad de eventos en experimentos aleatorios compuestos.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-tipo-probabilidad',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Enfoque Clásico',
            description: 'Muestra que el cálculo se realiza dividiendo los casos favorables entre los casos posibles cuando todos los resultados tienen la misma opción de salir.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada: Experimentos',
            description: 'Sirve para definir las opciones posibles de tus experimentos y las condiciones que debe cumplir el evento compuesto.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-tipo-selector',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Experimento',
            description: 'Estás en modo Compuesto (dos o más experimentos simultáneos, por ejemplo dos dados). Puedes alternar a Simple para trabajar con uno solo.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-config-compuesto',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Etapas del Experimento',
            description: `Sirve para configurar cada etapa de tu experimento (por ejemplo, Dado 1 y Dado 2): define sus posibles resultados, clona etapas idénticas o elimina las que no necesites.`,
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-btn-agregar-componente',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Agregar Etapa',
            description: 'Sirve para añadir otra etapa o elemento al experimento compuesto (por ejemplo, una moneda adicional).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-espacio-muestral',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Espacio Muestral Compuesto (${k('\\Omega')})`,
            description: 'Muestra todas las combinaciones posibles de resultados entre las diferentes etapas y el total de casos del espacio muestral.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-condiciones',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Condiciones del Evento',
            description: 'Sirve para definir qué resultado estás buscando, ya sea en un experimento individual o en la suma de varios experimentos numéricos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Botón Calcular',
            description: 'Haz clic aquí para calcular la probabilidad teórica, ver qué combinaciones cumplen la condición y habilitar la simulación.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-resultados',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resultado del Evento',
            description: 'Muestra la cantidad de casos favorables, el total de combinaciones posibles, el porcentaje obtenido y la fórmula resuelta.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-espacio-resultado',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Espacio Muestral con Resultados',
            description: 'Muestra la tabla de combinaciones destacando en color verde los resultados que cumplieron tu condición.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-sim-repeticiones',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Repeticiones de Simulación (${k('N')})`,
            description: 'Sirve para configurar el número de repeticiones de la simulación de todos los experimentos combinados.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-btn-iniciar-sim',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Iniciar Simulación',
            description: 'Haz clic aquí para iniciar la simulación y observar el comportamiento de los experimentos en tiempo real.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-sim-progreso',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Control y Velocidad',
            description: 'Muestra el lanzamiento en curso y sirve para cambiar la velocidad de la animación o pausar la simulación.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-sim-comparacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Teórica vs Simulada',
            description: 'Muestra la comparación entre la Probabilidad Teórica calculada y la Probabilidad Simulada acumulada de los experimentos.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-sim-exitos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Éxitos Obtenidos',
            description: 'Muestra cuántas veces se cumplió la condición favorable a lo largo de las repeticiones simuladas.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-sim-metricas-empiricas',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Métricas Empíricas',
            description: `Muestra el promedio (Esperanza), la varianza y la desviación estándar calculadas a partir de los datos simulados:\n<b>-</b> Esperanza Empírica (${k('E(X)')})\n<b>-</b> Varianza Empírica (${k('V(X)')})\n<b>-</b> Desviación Estándar (${k('\\sigma')})`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-sim-grafica',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Gráfica de Convergencia',
            description: 'Muestra cómo la probabilidad de la simulación se aproxima a la probabilidad teórica conforme aumentan las repeticiones.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-sim-tabla',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Historial de Lanzamientos',
            description: 'Muestra una tabla con los resultados obtenidos en cada etapa por lanzamiento y los éxitos acumulados.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-exp-sim-botones',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Guardar y Descargar (.xlsx)',
            description: `Sirve para guardar el historial en tu espacio personal en la nube o descargarlo directamente en Excel a tu dispositivo.`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 7: TEOREMA DE PROBABILIDAD TOTAL (ANÁLISIS DE MATRIZ) ───
export const pasosProbabilidadTotalMatriz = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Teorema de Probabilidad Total',
            description: 'Sirve para calcular la probabilidad global de un evento a partir de varias causas posibles, considerando la probabilidad de cada causa y su efecto.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Matriz de Datos',
            description: 'Sirve para elegir la matriz de datos que contiene las causas y el evento que deseas evaluar.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para ocultar o mostrar el panel lateral y tener más espacio para ver tus resultados.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-total-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para elegir si deseas calcular a partir de una matriz de datos cargada o ingresar las probabilidades manualmente.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-total-datos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Datos',
            description: 'Muestra la cantidad total de registros en tu matriz. El botón "Editar Datos" sirve para modificar, agregar o borrar filas.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-total-causa',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Variable Causa (${k('B_i')})`,
            description: 'Sirve para seleccionar la columna que divide a los datos en diferentes grupos o causas.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-total-evento',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Variable Evento (${k('A')})`,
            description: 'Sirve para seleccionar la columna donde se observa el resultado o evento que deseas analizar.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-total-exito',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Valor de Interés (Éxito)',
            description: 'Sirve para elegir el valor específico del evento cuya probabilidad total deseas calcular.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-total-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Botón Calcular',
            description: 'Haz clic aquí para realizar el cálculo. Te mostrará la tabla de causas, la fórmula resuelta, el Teorema de Bayes y el árbol de probabilidades.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-total-tabla-desglose',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Causas y Probabilidades',
            description: 'Muestra las distintas causas observadas, cuántas veces aparece cada una, su probabilidad y la probabilidad condicional del evento.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-total-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Fórmula de Probabilidad Total',
            description: 'Muestra la fórmula desarrollada paso a paso con los valores calculados y el resultado global en decimal y porcentaje.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-total-bayes',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Teorema de Bayes',
            description: 'Sirve para calcular la probabilidad hacia atrás: sabiendo que el evento ya ocurrió, calcular la probabilidad de que haya sido causado por un grupo específico.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-total-arbol',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Árbol de Probabilidades',
            description: 'Muestra un diagrama de árbol con las ramas de cada causa y sus respectivos eventos condicionales con sus probabilidades.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 8: TEOREMA DE PROBABILIDAD TOTAL (MODO MANUAL) ───
export const pasosProbabilidadTotalManual = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Teorema de Probabilidad Total (Modo Manual)',
            description: 'Sirve para calcular la probabilidad global de un evento ingresando directamente las probabilidades de cada causa y de cada condición.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o mostrar el panel lateral y tener más espacio para visualizar los resultados.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-total-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre el cálculo automático con matriz y el ingreso manual de probabilidades.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-total-manual-ramas',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: `Causas y Probabilidades (${k('B_i')})`,
            description: `Sirve para ingresar cada causa, su probabilidad inicial (todas las causas deben sumar 1 o 100%) y la probabilidad condicional del evento.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-total-manual-btn-agregar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Agregar Nueva Causa',
            description: 'Sirve para añadir otra fila si tu ejercicio tiene 3 o más causas posibles.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-total-manual-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Botón Calcular',
            description: 'Haz clic aquí para calcular la probabilidad total, ver la fórmula resuelta, la sección de Bayes y el árbol de probabilidades.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-total-tabla-desglose',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Probabilidades',
            description: 'Muestra el resumen de las causas ingresadas con sus probabilidades iniciales, condicionales y ponderadas.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-total-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Fórmula de Probabilidad Total',
            description: 'Muestra la suma de todos los productos de cada causa por su probabilidad condicional y el resultado final.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-total-bayes',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Teorema de Bayes',
            description: 'Sirve para calcular la probabilidad de que una causa específica haya sido la responsable del evento una vez ocurrido.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-total-arbol',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Árbol de Probabilidades',
            description: 'Muestra un diagrama de árbol que organiza visualmente las ramas de las causas y las ramas condicionales del evento.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 9: AXIOMAS Y REGLA DE LA ADICIÓN (ANÁLISIS DE MATRIZ) ───
export const pasosReglaAdicionMatriz = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Axiomas y Regla de la Adición',
            description: `Sirve para calcular la probabilidad de que ocurra el evento ${k('A')}, el evento ${k('B')} o ambos a la vez (${k('P(A \\cup B)')}) utilizando los datos de tu matriz.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Matriz de Datos',
            description: 'Sirve para elegir la matriz de datos sobre la cual vas a evaluar los eventos.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral si necesitas más espacio para ver tus resultados.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-adicion-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para elegir entre calcular a partir de las frecuencias de tu matriz (Análisis de Matriz) o escribir directamente los valores de probabilidad (Modo Manual).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-adicion-datos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Datos',
            description: 'Muestra el número total de registros disponibles en tu matriz. El botón "Editar Datos" sirve para agregar, modificar o borrar filas.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-adicion-evento-a',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Configuración del Evento A',
            description: `Sirve para seleccionar la columna de tu matriz correspondiente al evento ${k('A')} y elegir la categoría o valor específico que deseas evaluar.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-adicion-evento-b',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Configuración del Evento B',
            description: `Sirve para seleccionar la columna del segundo evento (${k('B')}) y su condición de interés para calcular la probabilidad individual y la intersección con ${k('A')}.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-adicion-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Botón Calcular',
            description: 'Haz clic aquí para realizar el cálculo. Te mostrará la tabla de frecuencias, la fórmula resuelta paso a paso y el Diagrama de Venn.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-adicion-tabla-desglose',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Frecuencias y Probabilidades',
            description: `Muestra cuántas veces ocurrió cada evento de forma individual (${k('n(A)')}, ${k('n(B)')}) y cuántas veces coincidieron (${k('n(A \\cap B)')}), junto con sus probabilidades calculadas respecto al total.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-adicion-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Fórmula y Desarrollo Matemático',
            description: `Muestra la fórmula de la adición resuelta con los valores numéricos calculados para obtener la probabilidad de la unión.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-adicion-venn',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Diagrama de Venn',
            description: `Muestra de forma visual los círculos de cada evento y la zona compartida. Si los círculos están separados, los eventos son mutuamente excluyentes (no pueden ocurrir juntos).`,
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 10: AXIOMAS Y REGLA DE LA ADICIÓN (MODO MANUAL) ───
export const pasosReglaAdicionManual = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Axiomas y Regla de la Adición (Modo Manual)',
            description: `Sirve para calcular la probabilidad de la unión de dos eventos (${k('P(A \\cup B)')}) ingresando directamente las probabilidades conocidas, sin necesidad de cargar una matriz de datos.`,
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
        element: '#tour-adicion-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre el análisis con matriz y el ingreso manual de probabilidades.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-adicion-manual-evento-a',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros del Evento A',
            description: `Sirve para escribir el nombre del primer evento y su valor de probabilidad (${k('P(A)')}), ingresando un número entre 0 y 1.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-adicion-manual-evento-b',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Parámetros del Evento B',
            description: `Sirve para escribir el nombre del segundo evento y su valor de probabilidad (${k('P(B)')}), ingresando un número entre 0 y 1.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-adicion-manual-interseccion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Probabilidad de la Intersección',
            description: `Sirve para ingresar la probabilidad de que ambos eventos ocurran al mismo tiempo (${k('P(A \\cap B)')}). Si los eventos nunca ocurren juntos (son mutuamente excluyentes), ingresa 0.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-adicion-manual-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Botón Calcular',
            description: 'Haz clic aquí para calcular la probabilidad de la unión, ver la fórmula desarrollada y visualizar el Diagrama de Venn.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-adicion-tabla-desglose',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Probabilidades',
            description: `Muestra en una tabla las probabilidades ingresadas para cada evento (${k('P(A)')}, ${k('P(B)')}) y para su intersección conjunta (${k('P(A \\cap B)')}).`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-adicion-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Fórmula y Desarrollo Matemático',
            description: `Muestra la fórmula de la adición resuelta paso a paso con los valores ingresados para dar el resultado final en decimal y porcentaje.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-adicion-venn',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Diagrama de Venn',
            description: 'Muestra de forma gráfica los círculos de cada evento y el área que comparten en el espacio muestral.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 11: REGLA DE LA MULTIPLICACIÓN (ANÁLISIS DE MATRIZ) ───
export const pasosReglaMultiplicacionMatriz = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Regla de la Multiplicación',
            description: `Sirve para calcular la probabilidad de que ocurran dos eventos en secuencia o de forma conjunta (${k('P(A \\cap B)')}), considerando si son independientes o dependientes.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-variables',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Matriz de Datos',
            description: 'Sirve para elegir la matriz de datos de la cual se tomarán los registros para realizar las extracciones.',
            side: 'right',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Sirve para contraer o desplegar el panel lateral y tener más espacio para ver tus resultados.',
            side: 'right',
            align: 'center'
        }
    },
    {
        element: '#tour-mult-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para elegir entre calcular automáticamente a partir de los datos de tu matriz (Análisis de Matriz) o escribir directamente las probabilidades (Modo Manual).',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-mult-datos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Resumen de Datos',
            description: 'Muestra la cantidad total de registros disponibles en tu matriz. El botón "Editar Datos" sirve para modificar, agregar o borrar registros.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-mult-tipo-extraccion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Extracción',
            description: `Sirve para definir cómo se realiza la extracción:\n<b>-</b> <b>Con Reemplazo:</b> El elemento extraído regresa al conjunto. El total de datos no cambia y los eventos son independientes.\n<b>-</b> <b>Sin Reemplazo:</b> El elemento no regresa. El total disminuye en 1 y la segunda probabilidad queda condicionada a lo ocurrido en la primera (${k('P(B|A)')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mult-extraccion-1',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Primera Extracción (Evento A)',
            description: `Sirve para seleccionar la columna y el valor específico que esperas obtener en el primer intento (${k('A')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mult-extraccion-2',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Segunda Extracción (Evento B)',
            description: `Sirve para seleccionar la columna y el valor específico que esperas obtener en el segundo intento (${k('B')}).`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mult-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Botón Calcular',
            description: 'Haz clic aquí para procesar los datos. Te mostrará la tabla de probabilidades, la fórmula resuelta, el diagrama de flujo y el árbol de probabilidades.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-mult-tabla-desglose',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Probabilidades Sucesivas',
            description: `Muestra los resultados paso a paso: el evento obtenido en cada extracción, los casos favorables sobre el total disponible (${k('n/N')}) y su probabilidad calculada.`,
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-mult-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Fórmula y Desarrollo Matemático',
            description: 'Muestra la fórmula de la multiplicación resuelta con los valores numéricos correspondientes para obtener el resultado final en decimal y porcentaje.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-mult-flujo',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Diagrama de Flujo Sucesivo',
            description: 'Muestra de forma visual la secuencia de las extracciones y cómo se pasa de la primera etapa a la segunda.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-mult-arbol',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Árbol de Probabilidades',
            description: 'Muestra un diagrama de árbol con los posibles caminos de la primera y segunda extracción, indicando las probabilidades de cada rama.',
            side: 'top',
            align: 'center'
        }
    }
];

// ─── TOUR 12: REGLA DE LA MULTIPLICACIÓN (MODO MANUAL) ───
export const pasosReglaMultiplicacionManual = [
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Regla de la Multiplicación (Modo Manual)',
            description: `Sirve para calcular la probabilidad de una serie de extracciones sucesivas (${k('P(A \\cap B \\cap \\dots)')}) ingresando directamente los valores de probabilidad de cada etapa.`,
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
        element: '#tour-mult-modos-entrada',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Modos de Entrada',
            description: 'Sirve para alternar entre el cálculo automático con matriz y el ingreso manual de probabilidades.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-mult-manual-tipo-extraccion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tipo de Extracción',
            description: `Sirve para definir el comportamiento de la secuencia:\n<b>-</b> <b>Con Reemplazo:</b> Cada extracción es independiente de las anteriores.\n<b>-</b> <b>Sin Reemplazo:</b> Cada probabilidad depende de lo ocurrido en las extracciones anteriores.`,
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mult-manual-eventos',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Valores de las Extracciones',
            description: 'Sirve para escribir el nombre de cada evento y su valor de probabilidad (un número entre 0 y 1).',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-mult-manual-btn-agregar',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Agregar Nueva Extracción',
            description: 'Sirve para añadir otra fila a la secuencia si tu ejercicio tiene 3 o más extracciones consecutivas.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-mult-manual-btn-calcular',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Botón Calcular',
            description: 'Haz clic aquí para calcular la probabilidad conjunta de que ocurran todas las extracciones en orden.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-mult-tabla-desglose',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tabla de Probabilidades',
            description: 'Muestra la lista ordenada de cada extracción con la probabilidad asignada a cada paso.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-mult-formula',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Fórmula y Desarrollo Matemático',
            description: 'Muestra la multiplicación de todas las probabilidades ingresadas y el resultado final en decimal y porcentaje.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-mult-flujo',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Diagrama de Flujo Sucesivo',
            description: 'Muestra de forma gráfica el paso de una extracción a la siguiente a lo largo de la secuencia.',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-mult-arbol',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Árbol de Probabilidades',
            description: 'Muestra un diagrama de árbol con las ramas de la secuencia para visualizar los caminos posibles y sus probabilidades.',
            side: 'top',
            align: 'center'
        }
    }
];
