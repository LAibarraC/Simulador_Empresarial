import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import '../styles/GuiaMAT251.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// ─── SUBMÓDULOS HIJOS DE GUÍA POR TEMA ───
import {
    pasosConteo,
    pasosTema1,
    pasosSimulacionClasica,
    pasosExperimentosSimple,
    pasosExperimentosCompuesto,
    pasosProbabilidadTotalMatriz,
    pasosProbabilidadTotalManual,
    pasosReglaAdicionMatriz,
    pasosReglaAdicionManual,
    pasosReglaMultiplicacionMatriz,
    pasosReglaMultiplicacionManual
} from './Guia_Tema1';

import {
    pasosDistribucionDiscretaMatriz,
    pasosDistribucionDiscretaManual,
    pasosDistribucionContinua
} from './Guia_Tema2';

import {
    pasosBernoulliMatriz,
    pasosBinomialMatriz,
    pasosPoissonMatriz,
    pasosHipergeometricaMatriz,
    pasosModelosDiscretosMatriz,
    pasosBernoulliManual,
    pasosBinomialManual,
    pasosPoissonManual,
    pasosHipergeometricaManual,
    pasosModelosDiscretosManual,
    pasosUniformeMatriz,
    pasosNormalMatriz,
    pasosChiCuadradoMatriz,
    pasosFFisherMatriz,
    pasosTStudentMatriz,
    pasosModelosContinuosMatriz,
    pasosUniformeManual,
    pasosNormalManual,
    pasosNormalEstandarManual,
    pasosChiCuadradoManual,
    pasosFFisherManual,
    pasosTStudentManual,
    pasosModelosContinuosManual
} from './Guia_Tema3';

import {
    pasosDistribucionesMuestralesEmpirica,
    pasosDistribucionesMuestralesCalculadora,
    pasosCalculadoraMediaVarianzaConocida,
    pasosCalculadoraProporcion,
    pasosCalculadoraVarianzaMuestral,
    pasosCalculadoraDiferenciaMedias,
    pasosCalculadoraDiferenciaProporciones,
    pasosDistribucionesTyF,
    pasosTyFMediaVarianzaDesconocida,
    pasosTyFDiferenciaMediasDesconocidas,
    pasosTyFRazonVarianzas
} from './Guia_Tema4';

import {
    pasosEstimacionPuntualMatriz,
    pasosEstimacionPuntualManual,
    pasosEstimacionPuntualSimulacion,
    pasosEstimacionPuntual,
    pasosEstimacionIntervalosMatriz,
    pasosEstimacionIntervalosManual,
    pasosEstimacionIntervalosSimulacion,
    pasosEstimacionIntervalos
} from './Guia_Tema5';

import {
    pasosHipotesisParametricasMatriz,
    pasosHipotesisParametricasManual,
    pasosHipotesisParametricasSimulacion,
    pasosHipotesisParametricas,
    pasosHPSimulacionMediaZ,
    pasosHPSimulacionMediaT,
    pasosHPSimulacionProporcion,
    pasosHPSimulacionVarianza,
    pasosHipotesisNoParametricasMatriz,
    pasosHNPMatrizChiBondad,
    pasosHNPMatrizChiIndependencia,
    pasosHNPMatrizSignos,
    pasosHNPMatrizRachas,
    pasosHipotesisNoParametricasManual,
    pasosHNPManualChiBondad,
    pasosHNPManualChiIndependencia,
    pasosHNPManualSignos,
    pasosHNPManualRachas,
    pasosHipotesisNoParametricasSimulacion,
    pasosHNPSimulacionSignos,
    pasosHNPSimulacionRachas,
    pasosHNPSimulacionChiBondad,
    pasosHNPSimulacionChiIndependencia,
    pasosHipotesisNoParametricas
} from './Guia_Tema6';

// ─── RE-EXPORTACIÓN PARA COMPATIBILIDAD HACIA ATRÁS ───
export {
    pasosConteo,
    pasosTema1,
    pasosSimulacionClasica,
    pasosExperimentosSimple,
    pasosExperimentosCompuesto,
    pasosProbabilidadTotalMatriz,
    pasosProbabilidadTotalManual,
    pasosReglaAdicionMatriz,
    pasosReglaAdicionManual,
    pasosReglaMultiplicacionMatriz,
    pasosReglaMultiplicacionManual
} from './Guia_Tema1';

export {
    pasosDistribucionDiscretaMatriz,
    pasosDistribucionDiscretaManual,
    pasosDistribucionContinua
} from './Guia_Tema2';

export {
    pasosBernoulliMatriz,
    pasosBinomialMatriz,
    pasosPoissonMatriz,
    pasosHipergeometricaMatriz,
    pasosModelosDiscretosMatriz,
    pasosBernoulliManual,
    pasosBinomialManual,
    pasosPoissonManual,
    pasosHipergeometricaManual,
    pasosModelosDiscretosManual,
    pasosUniformeMatriz,
    pasosNormalMatriz,
    pasosChiCuadradoMatriz,
    pasosFFisherMatriz,
    pasosTStudentMatriz,
    pasosModelosContinuosMatriz,
    pasosUniformeManual,
    pasosNormalManual,
    pasosNormalEstandarManual,
    pasosChiCuadradoManual,
    pasosFFisherManual,
    pasosTStudentManual,
    pasosModelosContinuosManual
} from './Guia_Tema3';

export {
    pasosDistribucionesMuestralesEmpirica,
    pasosDistribucionesMuestralesCalculadora,
    pasosCalculadoraMediaVarianzaConocida,
    pasosCalculadoraProporcion,
    pasosCalculadoraVarianzaMuestral,
    pasosCalculadoraDiferenciaMedias,
    pasosCalculadoraDiferenciaProporciones,
    pasosDistribucionesTyF,
    pasosTyFMediaVarianzaDesconocida,
    pasosTyFDiferenciaMediasDesconocidas,
    pasosTyFRazonVarianzas
} from './Guia_Tema4';

export {
    pasosEstimacionPuntualMatriz,
    pasosEstimacionPuntualManual,
    pasosEstimacionPuntualSimulacion,
    pasosEstimacionPuntual,
    pasosEstimacionIntervalosMatriz,
    pasosEstimacionIntervalosManual,
    pasosEstimacionIntervalosSimulacion,
    pasosEstimacionIntervalos
} from './Guia_Tema5';

export {
    pasosHipotesisParametricasMatriz,
    pasosHipotesisParametricasManual,
    pasosHipotesisParametricasSimulacion,
    pasosHipotesisParametricas,
    pasosHPSimulacionMediaZ,
    pasosHPSimulacionMediaT,
    pasosHPSimulacionProporcion,
    pasosHPSimulacionVarianza,
    pasosHipotesisNoParametricasMatriz,
    pasosHNPMatrizChiBondad,
    pasosHNPMatrizChiIndependencia,
    pasosHNPMatrizSignos,
    pasosHNPMatrizRachas,
    pasosHipotesisNoParametricasManual,
    pasosHNPManualChiBondad,
    pasosHNPManualChiIndependencia,
    pasosHNPManualSignos,
    pasosHNPManualRachas,
    pasosHipotesisNoParametricasSimulacion,
    pasosHNPSimulacionSignos,
    pasosHNPSimulacionRachas,
    pasosHNPSimulacionChiBondad,
    pasosHNPSimulacionChiIndependencia,
    pasosHipotesisNoParametricas
} from './Guia_Tema6';

/**
 * Renderiza una expresión matemática en HTML usando KaTeX
 * @param {string} math Expresión LaTeX
 * @param {boolean} display Modo bloque (true) o inline (false)
 */
export const k = (math, display = false) => {
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
 * GUÍA INTERACTIVA DE APRENDIZAJE - MODULO MAT251
 * ==============================================================================
 * Presentación de MAT251 y Orquestador Principal de Guías por Tema
 * Estilo unificado:
 * - Radio universal: 5px (border-radius: 5px)
 * - Tipografía y colores: var(--text-pure)
 * - Clase aislada: mat251-driver-popover
 */

// ─── TOUR 1: PRESENTACIÓN GENERAL DE MAT251 (PANTALLA DE INICIO) ───
export const pasosPresentacionMAT251 = [
    {
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Estadística Matemática - MAT251',
            description: 'Bienvenido al módulo MAT251 — Estadística Matemática. Este simulador interactivo integra los 6 temas del programa académico, permitiéndote resolver problemas mediante análisis computacional, espacios muestrales y visualización pedagógica de fórmulas.',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-mat251-card-tema1',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 1: Cálculo de probabilidades e introducción al muestreo',
            description: 'Este tema abarca 5 operaciones fundamentales:\n<b>-</b> Técnicas de Conteo\n<b>-</b> Cálculo de Probabilidad\n<b>-</b> Teorema de Probabilidad Total\n<b>-</b> Axiomas y Regla de la Adición\n<b>-</b> Regla de la Multiplicación',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-mat251-card-tema2',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 2: Variables aleatorias',
            description: 'Este tema abarca 2 operaciones fundamentales:\n<b>-</b> Variables Aleatorias Discretas\n<b>-</b> Calculadora de Funciones Continuas',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-mat251-card-tema3',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 3: Distribuciones discretas y continuas importantes',
            description: 'Este tema abarca 2 operaciones fundamentales:\n<b>-</b> Distribuciones Discretas\n<b>-</b> Distribuciones Continuas',
            side: 'bottom',
            align: 'center'
        }
    },
    {
        element: '#tour-mat251-card-tema4',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 4: Distribuciones en el muestreo estadístico',
            description: 'Este tema abarca 2 operaciones fundamentales:\n<b>-</b> Distribuciones Muestrales\n<b>-</b> Distribuciones T y F',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-mat251-card-tema5',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 5: Estimación e inferencia estadística',
            description: 'Este tema abarca 2 operaciones fundamentales:\n<b>-</b> Estimación Puntual\n<b>-</b> Estimación por Intervalos',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-mat251-card-tema6',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Tema 6: Pruebas de hipótesis paramétricas y no paramétricas',
            description: 'Este tema abarca 2 operaciones fundamentales:\n<b>-</b> Hipótesis Paramétricas\n<b>-</b> Hipótesis No Paramétricas',
            side: 'top',
            align: 'center'
        }
    },
    {
        element: '#tour-mat251-operacion',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Selección de Operación',
            description: 'Haz clic en este selector para desplegar la lista de temas. Selecciona cualquiera de las operaciones disponibles para cargar su espacio de trabajo y comenzar a calcular.',
            side: 'bottom',
            align: 'start'
        }
    },
    {
        element: '#tour-mat251-toggle-panel',
        popover: {
            popoverClass: 'mat251-driver-popover',
            title: 'Ocultar Panel de Parámetros',
            description: 'Haz clic en este botón si deseas contraer el panel lateral para ampliar el área de trabajo y visualización de temas.',
            side: 'right',
            align: 'center'
        }
    }
];

/**
 * Inicia el tour interactivo de MAT251:
 * - Si está en la pantalla inicial (sin operación activa), lanza la Presentación General de MAT251.
 * - Si la operación activa es Técnicas de Conteo, lanza su tour dedicado.
 * - Si está en Experimentos, lanza el tour correspondiente a Simple o Compuesto.
 * - Si está en Teorema de Probabilidad Total, lanza el tour de Matriz o Manual.
 * - Si está en Axiomas y Regla de la Adición, lanza el tour de Matriz o Manual.
 * - Si está en Regla de la Multiplicación, lanza el tour de Matriz o Manual.
 * - Si está en Tema 2 Variables Aleatorias Discretas, lanza su tour de Matriz o Manual.
 * - Si está en Tema 2 Calculadora de Funciones Continuas, lanza su tour continuo.
 * - Si está en Tema 3 Distribuciones Discretas, lanza su tour de Matriz o Manual.
 * - Si está en Tema 3 Distribuciones Continuas, lanza su tour de Matriz o Manual.
 * - Si está en Cálculo de Probabilidad general, lanza el flujo de trabajo del Tema 1.
 */
export const iniciarGuiaMAT251 = () => {
    const operacionTxt = document.querySelector('#tour-mat251-operacion')?.textContent?.toLowerCase() || '';

    const esPresentacionGeneral = document.querySelector('#tour-mat251-contenedor-temas') !== null;
    const esConteo = document.querySelector('#tour-conteo-valores') !== null || operacionTxt.includes('conteo');
    const esExperimentos = document.querySelector('#tour-exp-tipo-selector') !== null ||
        document.querySelector('.mat251-experimentos') !== null;
    const esSimulacion = document.querySelector('#tour-sim-selector-exp') !== null;
    const esProbabilidadTotal = document.querySelector('#tour-total-modos-entrada') !== null ||
        document.querySelector('#tour-total-datos') !== null ||
        operacionTxt.includes('probabilidad total');
    const esAdicion = document.querySelector('#tour-adicion-modos-entrada') !== null ||
        document.querySelector('#tour-adicion-datos') !== null ||
        operacionTxt.includes('adición') ||
        operacionTxt.includes('adicion');
    const esMultiplicacion = document.querySelector('#tour-mult-modos-entrada') !== null ||
        document.querySelector('#tour-mult-datos') !== null ||
        operacionTxt.includes('multiplicación') ||
        operacionTxt.includes('multiplicacion');

    // Detección Tema 3: Distribuciones Discretas y Continuas
    const esTema3Discreto = document.querySelector('#tour-t3discreta-modelos') !== null ||
        operacionTxt.includes('distribuciones discretas') ||
        operacionTxt.includes('modelos discretos');

    const esTema3Continuo = document.querySelector('#tour-t3continua-modelos') !== null ||
        operacionTxt.includes('distribuciones continuas') ||
        operacionTxt.includes('modelos continuos');

    // Detección Tema 2: Variables Aleatorias Discretas y Continuas
    const esDiscreta = !esTema3Discreto && (
        document.querySelector('#tour-discreta-modos-entrada') !== null ||
        document.querySelector('#tour-discreta-matriz-datos') !== null ||
        document.querySelector('#tour-discreta-manual-tabla') !== null ||
        operacionTxt.includes('discreta')
    );
    const esContinua = !esTema3Continuo && (
        document.querySelector('#tour-continua-lienzo-formula') !== null ||
        document.querySelector('#tour-continua-teclado') !== null ||
        operacionTxt.includes('continua')
    );

    let listaPasos = pasosTema1;
    if (esPresentacionGeneral) {
        listaPasos = pasosPresentacionMAT251;
    } else if (esConteo) {
        listaPasos = pasosConteo;
    } else if (esExperimentos) {
        const esCompuesto = document.querySelector('#tour-exp-btn-tipo-compuesto')?.classList.contains('active') ||
            document.querySelector('#tour-exp-config-compuesto') !== null;
        listaPasos = esCompuesto ? pasosExperimentosCompuesto : pasosExperimentosSimple;
    } else if (esSimulacion) {
        listaPasos = pasosSimulacionClasica;
    } else if (esProbabilidadTotal) {
        const esManualTotal = document.querySelector('#tour-total-manual-ramas') !== null;
        listaPasos = esManualTotal ? pasosProbabilidadTotalManual : pasosProbabilidadTotalMatriz;
    } else if (esAdicion) {
        const esManualAdicion = document.querySelector('#tour-adicion-manual-evento-a') !== null;
        listaPasos = esManualAdicion ? pasosReglaAdicionManual : pasosReglaAdicionMatriz;
    } else if (esMultiplicacion) {
        const esManualMult = document.querySelector('#tour-mult-manual-eventos') !== null;
        listaPasos = esManualMult ? pasosReglaMultiplicacionManual : pasosReglaMultiplicacionMatriz;
    } else if (esTema3Discreto) {
        const esManualT3Discreto = document.querySelector('#tour-t3discreta-matriz-datos') === null;
        const modeloActivo = document.querySelector('#tour-t3discreta-modelos button.active')?.textContent?.trim().toLowerCase() || '';
        if (modeloActivo.includes('bernoulli')) {
            listaPasos = esManualT3Discreto ? pasosBernoulliManual : pasosBernoulliMatriz;
        } else if (modeloActivo.includes('poisson')) {
            listaPasos = esManualT3Discreto ? pasosPoissonManual : pasosPoissonMatriz;
        } else if (modeloActivo.includes('hiper')) {
            listaPasos = esManualT3Discreto ? pasosHipergeometricaManual : pasosHipergeometricaMatriz;
        } else {
            listaPasos = esManualT3Discreto ? pasosBinomialManual : pasosBinomialMatriz;
        }
    } else if (esTema3Continuo) {
        const esManualT3Continuo = document.querySelector('#tour-t3continua-matriz-datos') === null;
        const modeloActivo = document.querySelector('#tour-t3continua-modelos button.active')?.textContent?.trim().toLowerCase() || '';
        if (modeloActivo.includes('uniforme')) {
            listaPasos = esManualT3Continuo ? pasosUniformeManual : pasosUniformeMatriz;
        } else if (modeloActivo.includes('estándar') || modeloActivo.includes('estandar')) {
            listaPasos = pasosNormalEstandarManual;
        } else if (modeloActivo.includes('chi')) {
            listaPasos = esManualT3Continuo ? pasosChiCuadradoManual : pasosChiCuadradoMatriz;
        } else if (modeloActivo.includes('fisher')) {
            listaPasos = esManualT3Continuo ? pasosFFisherManual : pasosFFisherMatriz;
        } else if (modeloActivo.includes('student')) {
            listaPasos = esManualT3Continuo ? pasosTStudentManual : pasosTStudentMatriz;
        } else {
            listaPasos = esManualT3Continuo ? pasosNormalManual : pasosNormalMatriz;
        }
    } else if (esDiscreta) {
        const esManualDiscreta = document.querySelector('#tour-discreta-manual-tabla') !== null;
        listaPasos = esManualDiscreta ? pasosDistribucionDiscretaManual : pasosDistribucionDiscretaMatriz;
    } else if (esContinua) {
        listaPasos = pasosDistribucionContinua;
    } else if (operacionTxt.includes('muestrales') || document.querySelector('#tour-t4-modos-muestrales') !== null) {
        // Detección Tema 4: Distribuciones Muestrales
        const esModoCalculadora = document.querySelector('#tour-t4-modos-muestrales button:nth-child(2)')?.classList.contains('active');
        if (esModoCalculadora) {
            const selectText = document.querySelector('#tour-t4-selector-distribucion-teorica .tema4-select-text')?.textContent?.toLowerCase() || '';
            const tieneControlesProp = document.querySelector('#tour-t4prop-proporcion-poblacional') !== null;
            const tieneControlesChi = document.querySelector('#tour-t4chi-tamano-muestra') !== null;
            const tieneControlesDifMed = document.querySelector('#tour-t4difmed-poblacion1') !== null;
            const tieneControlesDifProp = document.querySelector('#tour-t4difprop-muestra1') !== null;

            if (tieneControlesProp || selectText.includes('una proporción') || selectText.includes('proporcion')) {
                listaPasos = pasosCalculadoraProporcion;
            } else if (tieneControlesChi || selectText.includes('varianza muestral') || selectText.includes('chi')) {
                listaPasos = pasosCalculadoraVarianzaMuestral;
            } else if (tieneControlesDifMed || selectText.includes('diferencia de medias')) {
                listaPasos = pasosCalculadoraDiferenciaMedias;
            } else if (tieneControlesDifProp || selectText.includes('diferencia entre dos proporciones')) {
                listaPasos = pasosCalculadoraDiferenciaProporciones;
            } else {
                listaPasos = pasosCalculadoraMediaVarianzaConocida;
            }
        } else {
            listaPasos = pasosDistribucionesMuestralesEmpirica;
        }
    } else if (operacionTxt.includes('t y f') || operacionTxt.includes('tyf') || document.querySelector('.tema4-select-tyf') !== null || document.querySelector('#tour-t4tyf-selector') !== null) {
        // Detección Tema 4: Distribuciones T y F
        const selectText = document.querySelector('#tour-t4tyf-selector .tema4-select-text')?.textContent?.toLowerCase() || '';
        const tieneDifMed = document.querySelector('#tour-t4tyf-difmed-escenario') !== null || document.querySelector('#tour-t4tyf-difmed-poblacion1') !== null;
        const tieneFisher = document.querySelector('#tour-t4tyf-fisher-poblacion1') !== null;

        if (tieneDifMed || selectText.includes('diferencia de medias')) {
            listaPasos = pasosTyFDiferenciaMediasDesconocidas;
        } else if (tieneFisher || selectText.includes('razón') || selectText.includes('razon') || selectText.includes('varianzas')) {
            listaPasos = pasosTyFRazonVarianzas;
        } else {
            listaPasos = pasosTyFMediaVarianzaDesconocida;
        }
    } else if (operacionTxt.includes('puntual') || document.querySelector('#tour-t5-modos-estimacion') !== null || document.querySelector('#tour-t5-parametro-estimacion') !== null) {
        // Detección Tema 5: Estimación Puntual
        const esSim = document.querySelector('#tour-t5-modos-estimacion .btn-mat251-modo.active')?.textContent?.toLowerCase()?.includes('simulaci') || document.querySelector('#tour-t5-sim-distribucion') !== null;
        const esManual = document.querySelector('#tour-t5-modos-estimacion .btn-mat251-modo.active')?.textContent?.toLowerCase()?.includes('manual') || document.querySelector('#tour-t5-manual-tamano-muestra') !== null;

        if (esSim) {
            listaPasos = pasosEstimacionPuntualSimulacion;
        } else if (esManual) {
            listaPasos = pasosEstimacionPuntualManual;
        } else {
            listaPasos = pasosEstimacionPuntualMatriz;
        }
    } else if (operacionTxt.includes('intervalo') || document.querySelector('#tour-t5-modos-intervalos') !== null || document.querySelector('#tour-t5-parametro-intervalos') !== null || document.querySelector('#tour-t5-nivel-confianza') !== null) {
        // Detección Tema 5: Estimación por Intervalos
        const esSim = document.querySelector('#tour-t5-modos-intervalos .btn-mat251-modo.active')?.textContent?.toLowerCase()?.includes('simulaci') || document.querySelector('#tour-t5-intervalos-sim-distribucion') !== null;
        const esManual = document.querySelector('#tour-t5-modos-intervalos .btn-mat251-modo.active')?.textContent?.toLowerCase()?.includes('manual') || document.querySelector('#tour-t5-intervalos-manual-n') !== null;

        if (esSim) {
            listaPasos = pasosEstimacionIntervalosSimulacion;
        } else if (esManual) {
            listaPasos = pasosEstimacionIntervalosManual;
        } else {
            listaPasos = pasosEstimacionIntervalosMatriz;
        }
    } else if (operacionTxt.includes('no paramétrica') || operacionTxt.includes('noparametricas') || document.querySelector('#tour-t6-hnp-modos') !== null || document.querySelector('#tour-t6-hnp-selector-prueba') !== null) {
        // Detección Tema 6: Hipótesis No Paramétricas
        const esSim = document.querySelector('#tour-t6-hnp-modos .btn-mat251-modo.active')?.textContent?.toLowerCase()?.includes('simulaci') || document.querySelector('#tour-t6-hnp-sim-btn-ejecutar') !== null;
        const esManual = document.querySelector('#tour-t6-hnp-modos .btn-mat251-modo.active')?.textContent?.toLowerCase()?.includes('manual') || document.querySelector('#tour-t6-hnp-manual-btn-calcular') !== null;

        let detectedPruebaHNP = '';
        const btnPruebaHNP = document.querySelector('#tour-t6-hnp-selector-prueba .btn-mat251-modo.active');
        if (btnPruebaHNP) {
            const txt = btnPruebaHNP.textContent.toLowerCase();
            if (txt.includes('chi')) detectedPruebaHNP = 'chi_cuadrada';
            else if (txt.includes('signo')) detectedPruebaHNP = 'signos';
            else if (txt.includes('racha')) detectedPruebaHNP = 'rachas';
        }

        if (!detectedPruebaHNP) {
            if (
                document.querySelector('#tour-t6-hnp-signos-vref') !== null ||
                document.querySelector('#tour-t6-hnp-signos-tabla') !== null ||
                document.querySelector('input[placeholder="Positivos"]') !== null ||
                document.querySelector('#widget-grafica-hp-simulacion-signos') !== null ||
                document.querySelector('#tour-t6-hnp-sim-parametros input[placeholder="Tamaño de muestra"]') !== null
            ) {
                detectedPruebaHNP = 'signos';
            } else if (
                document.querySelector('#tour-t6-hnp-rachas-corte') !== null ||
                document.querySelector('#tour-t6-hnp-rachas-tabla') !== null ||
                document.querySelector('#tour-t6-hnp-rachas-resumen') !== null ||
                document.querySelector('#tour-t6-hnp-sim-grafico-rachas-z') !== null ||
                document.querySelector('input[placeholder="Rachas"]') !== null ||
                document.querySelector('input[placeholder="Símbolo 1"]') !== null
            ) {
                detectedPruebaHNP = 'rachas';
            } else {
                detectedPruebaHNP = 'chi_cuadrada';
            }
        }

        const subtipoChiText = document.querySelector('#tour-t6-hnp-subtipo-chi')?.textContent?.toLowerCase() || '';
        const esIndependencia = subtipoChiText.includes('independencia') ||
            document.querySelector('input[placeholder="Filas"]') !== null ||
            document.querySelector('input[min="2"][max="1000"]') !== null ||
            document.querySelector('.hnp-independencia-manual-table') !== null ||
            document.querySelector('#tour-t6-hnp-matriz-contingencia') !== null;

        if (esSim) {
            if (detectedPruebaHNP === 'signos') {
                listaPasos = pasosHNPSimulacionSignos;
            } else if (detectedPruebaHNP === 'rachas') {
                listaPasos = pasosHNPSimulacionRachas;
            } else if (esIndependencia) {
                listaPasos = pasosHNPSimulacionChiIndependencia;
            } else {
                listaPasos = pasosHNPSimulacionChiBondad;
            }
        } else if (esManual) {
            if (detectedPruebaHNP === 'signos') {
                listaPasos = pasosHNPManualSignos;
            } else if (detectedPruebaHNP === 'rachas') {
                listaPasos = pasosHNPManualRachas;
            } else if (esIndependencia) {
                listaPasos = pasosHNPManualChiIndependencia;
            } else {
                listaPasos = pasosHNPManualChiBondad;
            }
        } else {
            if (detectedPruebaHNP === 'signos') {
                listaPasos = pasosHNPMatrizSignos;
            } else if (detectedPruebaHNP === 'rachas') {
                listaPasos = pasosHNPMatrizRachas;
            } else if (esIndependencia) {
                listaPasos = pasosHNPMatrizChiIndependencia;
            } else {
                listaPasos = pasosHNPMatrizChiBondad;
            }
        }
    } else if ((!operacionTxt.includes('no param') && !operacionTxt.includes('noparam')) && (operacionTxt.includes('paramétrica') || operacionTxt.includes('parametricas') || document.querySelector('#tour-t6-hp-modos') !== null || document.querySelector('#tour-t6-hp-selector-prueba') !== null)) {
        // Detección Tema 6: Hipótesis Paramétricas
        const esSim = document.querySelector('#tour-t6-hp-modos .btn-mat251-modo.active')?.textContent?.toLowerCase()?.includes('simulaci') || document.querySelector('#tour-t6-hp-sim-btn-ejecutar') !== null;
        const esManual = document.querySelector('#tour-t6-hp-modos .btn-mat251-modo.active')?.textContent?.toLowerCase()?.includes('manual') || document.querySelector('#tour-t6-hp-manual-btn-calcular') !== null;

        let detectedPruebaHP = '';
        const btnPruebaHP = document.querySelector('#tour-t6-hp-selector-prueba .btn-mat251-modo.active');
        if (btnPruebaHP) {
            const txt = btnPruebaHP.textContent.toLowerCase();
            if (txt.includes('proporci')) detectedPruebaHP = 'proporcion';
            else if (txt.includes('varianza')) detectedPruebaHP = 'varianza';
            else if (txt.includes('media (z)') || txt.includes('media z') || (txt.includes('media') && txt.includes('(z)'))) detectedPruebaHP = 'media_z';
            else if (txt.includes('media (t)') || txt.includes('media t') || (txt.includes('media') && txt.includes('(t)'))) detectedPruebaHP = 'media_t';
        }

        if (!detectedPruebaHP) {
            if (
                document.querySelector('input[placeholder="Proporción real"]') !== null ||
                document.querySelector('input[placeholder="Casos favorables (x)"]') !== null ||
                document.querySelector('#tour-t6-hp-exito-selector') !== null
            ) {
                detectedPruebaHP = 'proporcion';
            } else if (
                document.querySelector('input[placeholder="Varianza poblacional real"]') !== null ||
                document.querySelector('input[placeholder="Varianza hipotética"]') !== null ||
                document.querySelector('input[placeholder="Varianza muestral (S²)"]') !== null
            ) {
                detectedPruebaHP = 'varianza';
            } else if (
                document.querySelector('input[placeholder="Desviación Estándar"]') !== null ||
                document.querySelector('input[placeholder="Desv. estándar (σ)"]') !== null
            ) {
                detectedPruebaHP = 'media_z';
            } else {
                detectedPruebaHP = 'media_t';
            }
        }

        if (esSim) {
            if (detectedPruebaHP === 'media_z') {
                listaPasos = pasosHPSimulacionMediaZ;
            } else if (detectedPruebaHP === 'media_t') {
                listaPasos = pasosHPSimulacionMediaT;
            } else if (detectedPruebaHP === 'proporcion') {
                listaPasos = pasosHPSimulacionProporcion;
            } else {
                listaPasos = pasosHPSimulacionVarianza;
            }
        } else if (esManual) {
            listaPasos = pasosHipotesisParametricasManual;
        } else {
            listaPasos = pasosHipotesisParametricasMatriz;
        }
    }

    // Clonar pasos para garantizar que cada ejecución de la guía tenga popovers limpios e independientes
    listaPasos = listaPasos.map(p => ({
        ...p,
        popover: p.popover ? { ...p.popover } : undefined
    }));

    // Gestión del botón de alternancia del panel lateral (toggle: abierto o cerrado)
    const botonToggle = document.querySelector('#tour-mat251-toggle-panel');
    if (botonToggle) {
        const estaCerrado = botonToggle.classList.contains('cerrado');
        if (estaCerrado) {
            // Si está cerrado, colocar al inicio para que el usuario sepa cómo desplegar el panel
            const sinToggle = listaPasos.filter(p => p.element !== '#tour-mat251-toggle-panel');
            listaPasos = [
                {
                    element: '#tour-mat251-toggle-panel',
                    popover: {
                        popoverClass: 'mat251-driver-popover',
                        title: 'Panel de Parámetros (Oculto)',
                        description: 'Haz clic en este botón si deseas desplegar el panel lateral de operaciones y parámetros.',
                        side: 'right',
                        align: 'center'
                    }
                },
                ...sinToggle
            ];
        } else {
            // Si está abierto, asegurarse de que el paso del toggle esté configurado para contraer el panel
            const pasoToggle = listaPasos.find(p => p.element === '#tour-mat251-toggle-panel');
            if (pasoToggle?.popover) {
                pasoToggle.popover.title = 'Ocultar Panel de Parámetros';
                pasoToggle.popover.description = 'Haz clic en este botón si deseas contraer el panel lateral para ampliar el área de trabajo y visualización de resultados.';
            } else {
                const pasoToggleAbierto = {
                    element: '#tour-mat251-toggle-panel',
                    popover: {
                        popoverClass: 'mat251-driver-popover',
                        title: 'Ocultar Panel de Parámetros',
                        description: 'Haz clic en este botón si deseas contraer el panel lateral para ampliar el área de trabajo y visualización de resultados.',
                        side: 'right',
                        align: 'center'
                    }
                };

                const idxModos = listaPasos.findIndex(p => 
                    p.element === '#tour-mat251-modos-entrada' || 
                    p.element === '#tour-total-modos-entrada' ||
                    p.element === '#tour-adicion-modos-entrada' ||
                    p.element === '#tour-mult-modos-entrada' ||
                    p.element === '#tour-discreta-modos-entrada' ||
                    p.element === '#tour-t3discreta-modos-entrada' ||
                    p.element === '#tour-t3continua-modos-entrada' ||
                    p.element === '#tour-t4-modos-muestrales' ||
                    p.element === '#tour-t5-modos-estimacion' ||
                    p.element === '#tour-t5-modos-intervalos' ||
                    p.element === '#tour-t6-hp-modos' ||
                    p.element === '#tour-t6-hnp-modos'
                );
                if (idxModos !== -1) {
                    listaPasos = [
                        ...listaPasos.slice(0, idxModos),
                        pasoToggleAbierto,
                        ...listaPasos.slice(idxModos)
                    ];
                } else {
                    const idxConteo = listaPasos.findIndex(p => p.element === '#tour-conteo-tipo-elementos');
                    const idxExp = listaPasos.findIndex(p => p.element === '#tour-exp-tipo-selector');
                    const idxContinua = listaPasos.findIndex(p => p.element === '#tour-continua-lienzo-formula');
                    const pos = idxConteo !== -1 ? idxConteo + 1 : (idxExp !== -1 ? idxExp + 1 : (idxContinua !== -1 ? idxContinua : listaPasos.length));
                    listaPasos = [
                        ...listaPasos.slice(0, pos),
                        pasoToggleAbierto,
                        ...listaPasos.slice(pos)
                    ];
                }
            }
        }
    }

    // Adaptar dinámicamente títulos de campos manuales según las etiquetas reales en pantalla
    const elNum = document.querySelector('#tour-mat251-manual-numerador');
    if (elNum) {
        const txtNum = elNum.querySelector('label')?.textContent?.trim();
        const pasoNum = listaPasos.find(p => p.element === '#tour-mat251-manual-numerador');
        if (pasoNum?.popover && txtNum) {
            pasoNum.popover.title = txtNum;
            pasoNum.popover.description = `Sirve para ingresar el valor de ${txtNum.toLowerCase()} para realizar el cálculo.`;
        }
    }
    const elDen = document.querySelector('#tour-mat251-manual-denominador');
    if (elDen) {
        const txtDen = elDen.querySelector('label')?.textContent?.trim();
        const pasoDen = listaPasos.find(p => p.element === '#tour-mat251-manual-denominador');
        if (pasoDen?.popover && txtDen) {
            pasoDen.popover.title = txtDen;
            pasoDen.popover.description = `Sirve para ingresar el valor de ${txtDen.toLowerCase()} que actúa como base del cálculo.`;
        }
    }

    // Adaptar dinámicamente la descripción de Modos de Entrada según los botones visibles en pantalla
    const contenedorModos = document.querySelector('#tour-mat251-modos-entrada');
    if (contenedorModos) {
        const botones = Array.from(contenedorModos.querySelectorAll('button')).map(b => b.textContent.trim().toLowerCase());
        const tieneSim = botones.some(txt => txt.includes('simulaci'));
        const tieneExp = botones.some(txt => txt.includes('experimento'));

        const pasoModos = listaPasos.find(p => p.element === '#tour-mat251-modos-entrada');
        if (pasoModos?.popover) {
            if (tieneSim && tieneExp) {
                pasoModos.popover.description = 'Permite estructurar el espacio muestral mediante matriz de datos, simulación, modo manual o experimentos interactivos.';
            } else if (tieneSim) {
                pasoModos.popover.description = 'Permite estructurar el espacio muestral mediante matriz de datos, simulación o modo manual.';
            } else {
                pasoModos.popover.description = 'Permite estructurar el espacio muestral mediante análisis de matriz de datos o modo manual.';
            }
        }
    }

    // Adaptar dinámicamente títulos y descripciones de Tema 6 según la prueba paramétrica o no paramétrica activa
    let tipoPruebaHP = '';
    const botonPruebaHP = document.querySelector('#tour-t6-hp-selector-prueba .btn-mat251-modo.active');
    if (botonPruebaHP) {
        const txt = botonPruebaHP.textContent.toLowerCase();
        if (txt.includes('proporci')) tipoPruebaHP = 'proporcion';
        else if (txt.includes('varianza')) tipoPruebaHP = 'varianza';
        else if (txt.includes('media z') || txt.includes('conocida')) tipoPruebaHP = 'media_z';
        else if (txt.includes('media t') || txt.includes('desconocida')) tipoPruebaHP = 'media_t';
    }

    // Si el panel lateral está cerrado o no se detectó el botón, deducir por los elementos del área central:
    if (!tipoPruebaHP) {
        if (
            document.querySelector('#tour-t6-hp-exito-selector') !== null ||
            document.querySelector('input[placeholder*="Proporción"]') !== null ||
            document.querySelector('input[placeholder*="Casos favorables"]') !== null ||
            document.querySelector('#tour-t6-hp-manual-entradas')?.textContent?.includes('p_0') ||
            document.querySelector('input[placeholder="Proporción real"]') !== null
        ) {
            tipoPruebaHP = 'proporcion';
        } else if (
            document.querySelector('input[placeholder*="Varianza"]') !== null ||
            document.querySelector('#tour-t6-hp-manual-entradas')?.textContent?.includes('S²') ||
            document.querySelector('#tour-t6-hp-manual-entradas')?.textContent?.includes('σ_0²') ||
            document.querySelector('input[placeholder="Varianza poblacional real"]') !== null
        ) {
            tipoPruebaHP = 'varianza';
        } else if (
            document.querySelector('input[placeholder*="poblacional"]') !== null ||
            document.querySelector('input[placeholder*="Desv. est. poblacional"]') !== null ||
            document.querySelector('#tour-t6-hp-param-hipotesis')?.textContent?.includes('σ:') ||
            document.querySelector('#tour-t6-hp-manual-entradas')?.textContent?.includes('σ:') ||
            document.querySelector('input[placeholder="Desviación Estándar"]') !== null
        ) {
            tipoPruebaHP = 'media_z';
        } else if (
            document.querySelector('input[placeholder*="muestral"]') !== null ||
            document.querySelector('input[placeholder*="Desv. est. muestral"]') !== null ||
            document.querySelector('#tour-t6-hp-manual-entradas')?.textContent?.includes('S:') ||
            document.querySelector('input[placeholder*="Media"]') !== null ||
            document.querySelector('#tour-t6-hp-param-hipotesis')?.textContent?.includes('μ_0') ||
            document.querySelector('input[placeholder="Desv. est. real"]') !== null
        ) {
            tipoPruebaHP = 'media_t';
        } else {
            const tablaResultados = document.querySelector('#tour-t6-hp-tabla-minitab, #tour-t6-hp-manual-tabla-minitab');
            if (tablaResultados) {
                const txt = tablaResultados.textContent.toLowerCase();
                if (txt.includes('proporción') || txt.includes('proporcion')) tipoPruebaHP = 'proporcion';
                else if (txt.includes('varianza')) tipoPruebaHP = 'varianza';
                else if (txt.includes('z de una muestra')) tipoPruebaHP = 'media_z';
                else if (txt.includes('t de una muestra')) tipoPruebaHP = 'media_t';
            }
        }
    }

    if (tipoPruebaHP) {
        const pasoTabla = listaPasos.find(p => p.element === '#tour-t6-hp-tabla-minitab' || p.element === '#tour-t6-hp-manual-tabla-minitab');
        const pasoResumen = listaPasos.find(p => p.element === '#tour-t6-hp-tabla-resumen-muestra');
        const pasoParamHip = listaPasos.find(p => p.element === '#tour-t6-hp-param-hipotesis');
        const pasoPlanteamiento = listaPasos.find(p => p.element === '#tour-t6-hp-planteamiento' || p.element === '#tour-t6-hp-manual-planteamiento');
        const pasoManualEntradas = listaPasos.find(p => p.element === '#tour-t6-hp-manual-entradas');
        const pasoMetricas = listaPasos.find(p => p.element === '#tour-t6-hp-resumen-estadistico' || p.element === '#tour-t6-hp-manual-resumen-estadistico');
        const pasoGrafico = listaPasos.find(p => p.element === '#tour-t6-hp-grafico' || p.element === '#tour-t6-hp-manual-grafico');
        const pasoDecision = listaPasos.find(p => p.element === '#tour-t6-hp-decision' || p.element === '#tour-t6-hp-manual-decision');
        const pasoSimParametros = listaPasos.find(p => p.element === '#tour-t6-hp-sim-parametros');
        const pasoSimMetricas = listaPasos.find(p => p.element === '#tour-t6-hp-sim-metricas');
        const pasoSimGrafico = listaPasos.find(p => p.element === '#tour-t6-hp-sim-grafico');

        if (tipoPruebaHP === 'proporcion') {
            if (pasoResumen?.popover) {
                pasoResumen.popover.title = 'Estadísticos Muestrales de Proporción';
                pasoResumen.popover.description = `Presenta el tamaño de la muestra seleccionada (${k('n')}), el conteo de casos favorables (${k('x')}) y la proporción muestral calculada (${k('\\hat{p} = \\frac{x}{n}')}).`;
            }
            if (pasoParamHip?.popover) {
                pasoParamHip.popover.title = 'Proporción Hipotética Poblacional';
                pasoParamHip.popover.description = `Permite definir la proporción de referencia bajo la hipótesis nula (${k('H_0: p = p_0')}) para evaluar si la proporción observada en la muestra difiere significativamente.`;
            }
            if (pasoPlanteamiento?.popover) {
                pasoPlanteamiento.popover.title = 'Planteamiento Formal de Hipótesis (Proporción)';
                pasoPlanteamiento.popover.description = `Muestra la formalización matemática del contraste de proporción: ${k('H_0: p = p_0')} frente a la alternativa ${k('H_1: p \\neq p_0')} (o unilateral ${k('>')}, ${k('<')}).`;
            }
            if (pasoManualEntradas?.popover) {
                pasoManualEntradas.popover.title = 'Parámetros Muestrales e Hipótesis de Proporción';
                pasoManualEntradas.popover.description = `Campos para ingresar el tamaño de muestra (${k('n')}), la cantidad de casos favorables observados (${k('x')}) y la proporción hipotética poblacional (${k('p_0')}).`;
            }
            if (pasoSimParametros?.popover) {
                pasoSimParametros.popover.title = 'Parámetros de Simulación de Proporción';
                pasoSimParametros.popover.description = `Permite configurar la proporción poblacional real (${k('p')}) con la que se simularán los ensayos Bernoulli y la proporción hipotética (${k('p_0')}) bajo ${k('H_0')}.`;
            }
            if (pasoSimMetricas?.popover) {
                pasoSimMetricas.popover.title = 'Tasa Empírica de Rechazo (Proporción)';
                pasoSimMetricas.popover.description = `Contabiliza en tiempo real el porcentaje de muestras simuladas donde se rechazó ${k('H_0: p = p_0')}. Si ${k('p = p_0')}, estima el Error Tipo I empírico.`;
            }
            if (pasoSimGrafico?.popover) {
                pasoSimGrafico.popover.title = 'Aproximación Normal y Estadísticos Simulados';
                pasoSimGrafico.popover.description = `Visualiza la distribución normal asintótica de la proporción muestral con los estadísticos calculados en cada réplica proyectados sobre las regiones de decisión.`;
            }
            if (pasoTabla?.popover) {
                pasoTabla.popover.title = 'Tabla de Resultados de la Prueba de Proporción';
                pasoTabla.popover.description = `Presenta el resumen cuantitativo del contraste: tamaño de muestra (${k('n')}), casos favorables observados (${k('x')}), proporción muestral (${k('\\hat{p}')}), error estándar (${k('EE_{\\hat{p}}')}), intervalo o límite de confianza, estadístico de contraste calculado (${k('Z_c')}) y el ${k('p')}-valor.`;
            }
            if (pasoMetricas?.popover) {
                pasoMetricas.popover.title = 'Resumen de Estadísticos de Proporción';
                pasoMetricas.popover.description = `Muestra las métricas determinantes de la prueba: el estadístico tipificado calculado (${k('Z_c')}), el valor crítico delimitador (${k('z_{\\alpha}')}) y el ${k('p')}-valor.`;
            }
            if (pasoGrafico?.popover) {
                pasoGrafico.popover.title = 'Aproximación Normal a la Proporción y Región Crítica';
                pasoGrafico.popover.description = `Visualiza la distribución normal asintótica de la proporción con las áreas de rechazo coloreadas en rojo (${k('\\alpha')}) y la posición del estadístico ${k('Z_c')}.`;
            }
            if (pasoDecision?.popover) {
                pasoDecision.popover.title = 'Decisión Estadística sobre la Proporción';
                pasoDecision.popover.description = `Detalla el dictamen final sobre ${k('H_0: p = p_0')}, la regla de rechazo formal y la justificación probabilística basada en la comparación del ${k('p')}-valor frente a ${k('\\alpha')}.`;
            }
        } else if (tipoPruebaHP === 'varianza') {
            if (pasoResumen?.popover) {
                pasoResumen.popover.title = 'Estadísticos Muestrales de Varianza';
                pasoResumen.popover.description = `Presenta los estadísticos de dispersión observados en la muestra seleccionada: tamaño muestral (${k('n')}), varianza muestral (${k('S^2')}) y desviación estándar (${k('S')}).`;
            }
            if (pasoParamHip?.popover) {
                pasoParamHip.popover.title = 'Varianza Hipotética Poblacional';
                pasoParamHip.popover.description = `Permite definir el valor de referencia de la hipótesis nula (${k('H_0: \\sigma^2 = \\sigma_0^2')}) para evaluar la dispersión o variabilidad de la población.`;
            }
            if (pasoPlanteamiento?.popover) {
                pasoPlanteamiento.popover.title = 'Planteamiento Formal de Hipótesis (Varianza)';
                pasoPlanteamiento.popover.description = `Muestra la formalización matemática del contraste de varianza: ${k('H_0: \\sigma^2 = \\sigma_0^2')} frente a la alternativa ${k('H_1: \\sigma^2 \\neq \\sigma_0^2')} (o unilateral ${k('>')}, ${k('<')}).`;
            }
            if (pasoManualEntradas?.popover) {
                pasoManualEntradas.popover.title = 'Parámetros Muestrales e Hipótesis de Varianza';
                pasoManualEntradas.popover.description = `Campos para ingresar el tamaño de muestra (${k('n')}), la varianza muestral observada (${k('S^2')}) y la varianza hipotética poblacional (${k('\\sigma_0^2')}).`;
            }
            if (pasoSimParametros?.popover) {
                pasoSimParametros.popover.title = 'Parámetros de Simulación de Varianza';
                pasoSimParametros.popover.description = `Permite definir la media (${k('\\mu')}) y varianza real (${k('\\sigma^2')}) de la población simulada, y la varianza hipotética (${k('\\sigma_0^2')}) a contrastar con ${k('\\chi^2')}.`;
            }
            if (pasoSimMetricas?.popover) {
                pasoSimMetricas.popover.title = 'Tasa Empírica de Rechazo (Varianza)';
                pasoSimMetricas.popover.description = `Contabiliza en tiempo real el porcentaje de muestras simuladas donde se rechazó ${k('H_0: \\sigma^2 = \\sigma_0^2')}. Si ${k('\\sigma^2 = \\sigma_0^2')}, estima el Error Tipo I empírico.`;
            }
            if (pasoSimGrafico?.popover) {
                pasoSimGrafico.popover.title = 'Distribución Chi-Cuadrada y Varianzas Simuladas';
                pasoSimGrafico.popover.description = `Muestra la curva teórica ${k('\\chi^2')} con ${k('n - 1')} grados de libertad y los estadísticos calculados en cada muestra simulada.`;
            }
            if (pasoTabla?.popover) {
                pasoTabla.popover.title = 'Tabla de Resultados de la Prueba de Varianza';
                pasoTabla.popover.description = `Presenta el resumen cuantitativo del contraste: tamaño de muestra (${k('n')}), varianza muestral (${k('S^2')}), grados de libertad (${k('n - 1')}), intervalo de confianza para ${k('\\sigma^2')}, estadístico calculado (${k('\\chi_c^2')}) y el ${k('p')}-valor.`;
            }
            if (pasoMetricas?.popover) {
                pasoMetricas.popover.title = 'Resumen de Estadísticos Chi-Cuadrada';
                pasoMetricas.popover.description = `Muestra las métricas determinantes de la prueba: el estadístico de contraste calculado (${k('\\chi_c^2')}), los grados de libertad (${k('n - 1')}), los valores críticos y el ${k('p')}-valor.`;
            }
            if (pasoGrafico?.popover) {
                pasoGrafico.popover.title = 'Distribución Chi-Cuadrada y Región Crítica';
                pasoGrafico.popover.description = `Visualiza la curva de densidad asimétrica ${k('\\chi^2')} con ${k('n - 1')} grados de libertad, delimitando las zonas críticas de rechazo en rojo y la posición de ${k('\\chi_c^2')}.`;
            }
            if (pasoDecision?.popover) {
                pasoDecision.popover.title = 'Decisión Estadística sobre la Varianza';
                pasoDecision.popover.description = `Detalla el dictamen final sobre ${k('H_0: \\sigma^2 = \\sigma_0^2')}, justificando la conclusión mediante la comparación del estadístico ${k('\\chi_c^2')} con el umbral crítico y el ${k('p')}-valor.`;
            }
        } else if (tipoPruebaHP === 'media_z') {
            if (pasoResumen?.popover) {
                pasoResumen.popover.title = 'Estadísticos Muestrales de Media Z';
                pasoResumen.popover.description = `Presenta los estadísticos descriptivos calculados directamente de la muestra: tamaño de muestra (${k('n')}) y media aritmética muestral (${k('\\bar{X}')}). La desviación estándar (${k('\\sigma')}) es un parámetro poblacional conocido.`;
            }
            if (pasoParamHip?.popover) {
                pasoParamHip.popover.title = 'Media Hipotética y Desviación Conocida';
                pasoParamHip.popover.description = `Permite ingresar el valor de referencia de la hipótesis nula (${k('\\mu_0')}) y la desviación estándar poblacional conocida (${k('\\sigma')}) requerida para la prueba Z.`;
            }
            if (pasoPlanteamiento?.popover) {
                pasoPlanteamiento.popover.title = 'Planteamiento Formal de Hipótesis (Media Z)';
                pasoPlanteamiento.popover.description = `Muestra la formalización matemática del contraste sobre la media poblacional: ${k('H_0: \\mu = \\mu_0')} frente a ${k('H_1: \\mu \\neq \\mu_0')} (o unilateral ${k('>')}, ${k('<')}) con varianza conocida.`;
            }
            if (pasoManualEntradas?.popover) {
                pasoManualEntradas.popover.title = 'Parámetros Muestrales de Media (Z)';
                pasoManualEntradas.popover.description = `Campos para ingresar el tamaño de muestra (${k('n')}), la media muestral observada (${k('\\bar{X}')}), la desviación estándar conocida (${k('\\sigma')}) y la media hipotética (${k('\\mu_0')}).`;
            }
            if (pasoSimParametros?.popover) {
                pasoSimParametros.popover.title = 'Parámetros de Simulación (Media Z)';
                pasoSimParametros.popover.description = `Permite configurar la media poblacional real (${k('\\mu')}) para generar las muestras, el valor hipotético (${k('\\mu_0')}) de ${k('H_0')} y la desviación estándar conocida (${k('\\sigma')}).`;
            }
            if (pasoSimMetricas?.popover) {
                pasoSimMetricas.popover.title = 'Tasa Empírica de Rechazo (Z)';
                pasoSimMetricas.popover.description = `Contabiliza en tiempo real el porcentaje de muestras simuladas donde se rechazó ${k('H_0: \\mu = \\mu_0')}. Si ${k('\\mu = \\mu_0')}, estima el Error Tipo I empírico.`;
            }
            if (pasoSimGrafico?.popover) {
                pasoSimGrafico.popover.title = 'Distribución Normal y Estadísticos Z Simulados';
                pasoSimGrafico.popover.description = `Muestra la curva teórica ${k('Z')} con los estadísticos calculados en cada iteración, clasificando en verde las retenciones y en rojo los rechazos.`;
            }
            if (pasoTabla?.popover) {
                pasoTabla.popover.title = 'Tabla de Resultados de la Prueba Z';
                pasoTabla.popover.description = `Presenta el resumen cuantitativo del contraste: tamaño de muestra (${k('n')}), media observada (${k('\\bar{X}')}), desviación supuesta (${k('\\sigma')}), error estándar (${k('EE_{\\bar{x}}')}), intervalo o límite de confianza para ${k('\\mu')}, estadístico calculado (${k('Z_c')}) y el ${k('p')}-valor.`;
            }
            if (pasoMetricas?.popover) {
                pasoMetricas.popover.title = 'Resumen de Estadísticos del Contraste Z';
                pasoMetricas.popover.description = `Muestra las métricas determinantes de la prueba: el valor del estadístico tipificado observado (${k('Z_c')}), el umbral del valor crítico delimitador (${k('z_{\\alpha}')}) y el ${k('p')}-valor.`;
            }
            if (pasoGrafico?.popover) {
                pasoGrafico.popover.title = 'Distribución Normal Estándar y Región Crítica';
                pasoGrafico.popover.description = `Visualiza la curva de densidad normal estándar ${k('Z')} con la región de retención en azul, las zonas de rechazo en rojo (${k('\\alpha')}) y la ubicación exacta del estadístico calculado ${k('Z_c')}.`;
            }
            if (pasoDecision?.popover) {
                pasoDecision.popover.title = 'Decisión Estadística sobre la Media';
                pasoDecision.popover.description = `Detalla el dictamen final sobre ${k('H_0: \\mu = \\mu_0')}, comparando el estadístico ${k('Z_c')} con el valor crítico y contrastando el ${k('p')}-valor frente a ${k('\\alpha')}.`;
            }
        } else if (tipoPruebaHP === 'media_t') {
            if (pasoResumen?.popover) {
                pasoResumen.popover.title = 'Estadísticos Muestrales de Media t';
                pasoResumen.popover.description = `Presenta los estadísticos descriptivos observados en la muestra seleccionada: tamaño de muestra (${k('n')}), media aritmética (${k('\\bar{X}')}) y desviación estándar muestral (${k('S')}).`;
            }
            if (pasoParamHip?.popover) {
                pasoParamHip.popover.title = 'Media Hipotética Poblacional';
                pasoParamHip.popover.description = `Permite definir el valor de referencia de la hipótesis nula (${k('H_0: \\mu = \\mu_0')}). La dispersión se estima a partir de la desviación estándar muestral (${k('S')}).`;
            }
            if (pasoPlanteamiento?.popover) {
                pasoPlanteamiento.popover.title = 'Planteamiento Formal de Hipótesis (Media t)';
                pasoPlanteamiento.popover.description = `Muestra la formalización matemática del contraste sobre la media con varianza desconocida: ${k('H_0: \\mu = \\mu_0')} frente a ${k('H_1: \\mu \\neq \\mu_0')} (o unilateral ${k('>')}, ${k('<')}).`;
            }
            if (pasoManualEntradas?.popover) {
                pasoManualEntradas.popover.title = 'Parámetros Muestrales de Media (t)';
                pasoManualEntradas.popover.description = `Campos para ingresar el tamaño de muestra (${k('n')}), la media observada (${k('\\bar{X}')}), la desviación estándar muestral (${k('S')}) y la media hipotética (${k('\\mu_0')}).`;
            }
            if (pasoSimParametros?.popover) {
                pasoSimParametros.popover.title = 'Parámetros de Simulación (Media t)';
                pasoSimParametros.popover.description = `Permite configurar la media real (${k('\\mu')}) y la dispersión (${k('\\sigma')}) de la población generadora, junto con la media hipotética (${k('\\mu_0')}) a contrastar.`;
            }
            if (pasoSimMetricas?.popover) {
                pasoSimMetricas.popover.title = 'Tasa Empírica de Rechazo (t)';
                pasoSimMetricas.popover.description = `Contabiliza en tiempo real el porcentaje de muestras simuladas donde se rechazó ${k('H_0: \\mu = \\mu_0')}. Si ${k('\\mu = \\mu_0')}, estima el Error Tipo I empírico.`;
            }
            if (pasoSimGrafico?.popover) {
                pasoSimGrafico.popover.title = 'Distribución t de Student y Estadísticos Simulados';
                pasoSimGrafico.popover.description = `Muestra la curva teórica ${k('t')} con los estadísticos calculados en cada muestra simulada, proyectando las decisiones respecto a las zonas críticas.`;
            }
            if (pasoTabla?.popover) {
                pasoTabla.popover.title = 'Tabla de Resultados de la Prueba t de Student';
                pasoTabla.popover.description = `Presenta el resumen cuantitativo del contraste: tamaño (${k('n')}), media observada (${k('\\bar{X}')}), desviación muestral (${k('S')}), error estándar (${k('EE_{\\bar{x}}')}), intervalo o límite de confianza para ${k('\\mu')}, estadístico calculado (${k('t_c')}) y el ${k('p')}-valor.`;
            }
            if (pasoMetricas?.popover) {
                pasoMetricas.popover.title = 'Resumen de Estadísticos de la Prueba t';
                pasoMetricas.popover.description = `Muestra las métricas determinantes: el valor del estadístico de Student (${k('t_c')}), el valor crítico según los grados de libertad (${k('t_{\\alpha, n-1}')}) y el ${k('p')}-valor.`;
            }
            if (pasoGrafico?.popover) {
                pasoGrafico.popover.title = 'Distribución t de Student y Región Crítica';
                pasoGrafico.popover.description = `Visualiza la curva de densidad ${k('t')} con ${k('n - 1')} grados de libertad, delimitando las colas de rechazo en rojo (${k('\\alpha')}) y la posición del estadístico ${k('t_c')}.`;
            }
            if (pasoDecision?.popover) {
                pasoDecision.popover.title = 'Decisión Estadística sobre la Media (t)';
                pasoDecision.popover.description = `Detalla el dictamen final sobre ${k('H_0: \\mu = \\mu_0')}, comparando ${k('t_c')} frente al umbral crítico y evaluando el ${k('p')}-valor respecto a ${k('\\alpha')}.`;
            }
        }
    }

    let tipoPruebaHNP = '';
    const botonPruebaHNP = document.querySelector('#tour-t6-hnp-selector-prueba .btn-mat251-modo.active');
    if (botonPruebaHNP) {
        const txtHNP = botonPruebaHNP.textContent.toLowerCase();
        if (txtHNP.includes('chi')) tipoPruebaHNP = 'chi_cuadrada';
        else if (txtHNP.includes('signo')) tipoPruebaHNP = 'signos';
        else if (txtHNP.includes('racha')) tipoPruebaHNP = 'rachas';
    }

    if (!tipoPruebaHNP) {
        if (
            document.querySelector('#tour-t6-hnp-subtipo-chi') !== null ||
            document.querySelector('#tour-t6-hnp-manual-tipo-chi') !== null ||
            document.querySelector('#tour-t6-hnp-manual-btn-agregar-fila') !== null ||
            document.querySelector('.hnp-frecuencias-manual-table') !== null ||
            document.querySelector('.hnp-independencia-manual-table') !== null ||
            document.querySelector('#tour-t6-hnp-tabla-esperadas') !== null ||
            document.querySelector('#tour-t6-hnp-matriz-contingencia') !== null ||
            document.querySelector('input[placeholder="Número de categorías"]') !== null
        ) {
            tipoPruebaHNP = 'chi_cuadrada';
        } else if (
            document.querySelector('#tour-t6-hnp-signos-vref') !== null ||
            document.querySelector('#tour-t6-hnp-signos-tabla') !== null ||
            document.querySelector('input[placeholder="Positivos"]') !== null ||
            document.querySelector('input[placeholder="Tamaño de muestra"]') !== null
        ) {
            tipoPruebaHNP = 'signos';
        } else if (
            document.querySelector('#tour-t6-hnp-rachas-corte') !== null ||
            document.querySelector('#tour-t6-hnp-rachas-tabla') !== null ||
            document.querySelector('#tour-t6-hnp-rachas-resumen') !== null ||
            document.querySelector('input[placeholder="Rachas"]') !== null ||
            document.querySelector('input[placeholder="Símbolo 1"]') !== null
        ) {
            tipoPruebaHNP = 'rachas';
        } else {
            const tablaHNP = document.querySelector('#tour-t6-hnp-tabla-minitab, #tour-t6-hnp-manual-tabla-minitab');
            if (tablaHNP) {
                const txt = tablaHNP.textContent.toLowerCase();
                if (txt.includes('ajuste') || txt.includes('independencia') || txt.includes('chi')) tipoPruebaHNP = 'chi_cuadrada';
                else if (txt.includes('signos')) tipoPruebaHNP = 'signos';
                else if (txt.includes('rachas')) tipoPruebaHNP = 'rachas';
            }
        }
    }

    if (tipoPruebaHNP) {
        const pasoTablaHNP = listaPasos.find(p => p.element === '#tour-t6-hnp-tabla-minitab' || p.element === '#tour-t6-hnp-manual-tabla-minitab');
        const pasoGraficoHNP = listaPasos.find(p => p.element === '#tour-t6-hnp-grafico' || p.element === '#tour-t6-hnp-manual-grafico');
        const pasoDecisionHNP = listaPasos.find(p => p.element === '#tour-t6-hnp-decision' || p.element === '#tour-t6-hnp-manual-decision');
        const pasoManualEntradasHNP = listaPasos.find(p => p.element === '#tour-t6-hnp-manual-entradas');
        const pasoManualConfigHNP = listaPasos.find(p => p.element === '#tour-t6-hnp-manual-config');
        const pasoManualBtnAgregarFilaHNP = listaPasos.find(p => p.element === '#tour-t6-hnp-manual-btn-agregar-fila');
        const pasoSimParametrosHNP = listaPasos.find(p => p.element === '#tour-t6-hnp-sim-parametros');
        const pasoSimConfigHNP = listaPasos.find(p => p.element === '#tour-t6-hnp-sim-config');
        const pasoSimResumenHNP = listaPasos.find(p => p.element === '#tour-t6-hnp-sim-resumen');

        if (tipoPruebaHNP === 'chi_cuadrada') {
            const esIndependencia = document.querySelector('input[placeholder="Filas"]') !== null || document.querySelector('input[min="2"][max="1000"]') !== null || document.querySelector('.hnp-independencia-manual-table') !== null;
            if (pasoManualConfigHNP?.popover) {
                pasoManualConfigHNP.popover.title = 'Configuración de Chi-Cuadrada';
                pasoManualConfigHNP.popover.description = `Permite fijar el nivel de significancia (${k('\\alpha')}) y alternar entre la prueba de Bondad de Ajuste o la prueba de Independencia.`;
            }
            if (pasoManualEntradasHNP?.popover) {
                if (esIndependencia) {
                    pasoManualEntradasHNP.popover.title = 'Tabla de Contingencia (Independencia)';
                    pasoManualEntradasHNP.popover.description = `Permite configurar las dimensiones de filas y columnas e ingresar las frecuencias observadas en cada celda para evaluar la asociación de variables.`;
                } else {
                    pasoManualEntradasHNP.popover.title = 'Frecuencias Observadas y Esperadas';
                    pasoManualEntradasHNP.popover.description = `Tabla editable para registrar las frecuencias observadas (${k('O_i')}) y frecuencias esperadas teóricas (${k('E_i')}) de cada categoría.`;
                }
            }
            if (pasoManualBtnAgregarFilaHNP?.popover) {
                pasoManualBtnAgregarFilaHNP.popover.title = 'Agregar Nueva Fila o Categoría';
                pasoManualBtnAgregarFilaHNP.popover.description = 'Haz clic en este botón si tu ejercicio tiene más categorías observadas y requieres incorporar filas adicionales a la prueba de bondad de ajuste.';
            }
            if (pasoSimParametrosHNP?.popover) {
                if (esIndependencia) {
                    pasoSimParametrosHNP.popover.title = 'Dimensiones de la Tabla Simulada';
                    pasoSimParametrosHNP.popover.description = `Permite configurar el número de filas (${k('F')}) y columnas (${k('C')}) para simular tablas de contingencia bivariadas y contrastar la hipótesis de independencia.`;
                } else {
                    pasoSimParametrosHNP.popover.title = 'Número de Categorías Simuladas';
                    pasoSimParametrosHNP.popover.description = `Permite establecer la cantidad de categorías (${k('k')}) a simular en la distribución multinomial para contrastar la bondad de ajuste.`;
                }
            }
            if (pasoSimConfigHNP?.popover) {
                pasoSimConfigHNP.popover.title = 'Nivel de Significancia y Subtipo Chi-Cuadrada';
                pasoSimConfigHNP.popover.description = `Permite fijar el nivel de significancia (${k('\\alpha')}) y alternar entre la simulación de Bondad de Ajuste o Independencia.`;
            }
            if (pasoSimResumenHNP?.popover) {
                pasoSimResumenHNP.popover.title = 'Resumen de Rechazos Chi-Cuadrada';
                pasoSimResumenHNP.popover.description = `Muestra en tiempo real el porcentaje de muestras donde se rechazó ${k('H_0')} comparando el estadístico ${k('\\chi_c^2')} con el umbral crítico.`;
            }
            if (pasoTablaHNP?.popover) {
                pasoTablaHNP.popover.title = 'Tabla de Resultados de la Prueba Chi-Cuadrada';
                pasoTablaHNP.popover.description = `Presenta los grados de libertad (${k('gl')}), el estadístico de prueba calculado (${k('\\chi_c^2')}), el valor crítico delimitador (${k('\\chi_{\\alpha}^2')}) y el ${k('p')}-valor.`;
            }
            if (pasoGraficoHNP?.popover) {
                pasoGraficoHNP.popover.title = 'Distribución Chi-Cuadrada y Región Crítica';
                pasoGraficoHNP.popover.description = `Visualiza la curva asimétrica ${k('\\chi^2')} con los grados de libertad correspondientes y la zona crítica de rechazo en rojo (${k('\\alpha')}).`;
            }
            if (pasoDecisionHNP?.popover) {
                pasoDecisionHNP.popover.title = 'Decisión Estadística (Chi-Cuadrada)';
                pasoDecisionHNP.popover.description = `Expone el dictamen formal sobre la hipótesis nula de bondad de ajuste o independencia a partir del ${k('p')}-valor.`;
            }
        } else if (tipoPruebaHNP === 'signos') {
            if (pasoManualConfigHNP?.popover) {
                pasoManualConfigHNP.popover.title = 'Configuración de la Prueba de Signos';
                pasoManualConfigHNP.popover.description = `Permite seleccionar el nivel de significancia (${k('\\alpha')}) y el sentido de la hipótesis alternativa (${k('H_1: \\neq, >, <')}).`;
            }
            if (pasoManualEntradasHNP?.popover) {
                pasoManualEntradasHNP.popover.title = 'Conteos de Signos Positivos y Negativos';
                pasoManualEntradasHNP.popover.description = `Permite ingresar el total de observaciones mayores (+) y menores (-) respecto al valor de referencia para contrastar la mediana.`;
            }
            if (pasoSimParametrosHNP?.popover) {
                pasoSimParametrosHNP.popover.title = 'Tamaño Muestral de la Simulación';
                pasoSimParametrosHNP.popover.description = `Permite definir el tamaño de muestra (${k('n')}) para generar réplicas independientes bajo la hipótesis nula de la mediana y contabilizar los signos observados.`;
            }
            if (pasoSimConfigHNP?.popover) {
                pasoSimConfigHNP.popover.title = 'Significancia e Hipótesis Alternativa';
                pasoSimConfigHNP.popover.description = `Permite seleccionar el nivel de significancia (${k('\\alpha')}) y la dirección de la hipótesis alternativa (${k('H_1: \\neq, >, <')}) para evaluar las réplicas de signos.`;
            }
            if (pasoSimResumenHNP?.popover) {
                pasoSimResumenHNP.popover.title = 'Resumen de Rechazos de la Prueba de Signos';
                pasoSimResumenHNP.popover.description = `Muestra en tiempo real la tasa empírica de rechazo de ${k('H_0')} para la mediana a lo largo de las réplicas simuladas.`;
            }
            if (pasoTablaHNP?.popover) {
                pasoTablaHNP.popover.title = 'Tabla de Resultados de la Prueba de Signos';
                pasoTablaHNP.popover.description = `Resume el tamaño de muestra (${k('n')}), empates excluidos, muestra efectiva, recuento de signos positivos y negativos, estadístico de prueba (${k('S')} o ${k('Z_c')}) y el ${k('p')}-valor.`;
            }
            if (pasoGraficoHNP?.popover) {
                pasoGraficoHNP.popover.title = 'Distribución de Signos y Región Crítica';
                pasoGraficoHNP.popover.description = `Visualiza la distribución de probabilidad (Binomial o aproximación Normal) del estadístico de signos con las zonas de rechazo coloreadas en rojo.`;
            }
            if (pasoDecisionHNP?.popover) {
                pasoDecisionHNP.popover.title = 'Decisión Estadística (Prueba de Signos)';
                pasoDecisionHNP.popover.description = `Detalla el dictamen final sobre la mediana hipotética contrastada frente al valor de referencia.`;
            }
        } else if (tipoPruebaHNP === 'rachas') {
            if (pasoManualConfigHNP?.popover) {
                pasoManualConfigHNP.popover.title = 'Configuración de la Prueba de Rachas';
                pasoManualConfigHNP.popover.description = `Permite fijar el nivel de significancia (${k('\\alpha')}) para evaluar la aleatoriedad de la secuencia.`;
            }
            if (pasoManualEntradasHNP?.popover) {
                pasoManualEntradasHNP.popover.title = 'Parámetros Muestrales de Rachas';
                pasoManualEntradasHNP.popover.description = `Permite ingresar el recuento de elementos del grupo 1 (${k('n_1')}), grupo 2 (${k('n_2')}) y el número total de rachas alternadas observadas (${k('R')}).`;
            }
            if (pasoSimParametrosHNP?.popover) {
                pasoSimParametrosHNP.popover.title = 'Cantidades por Grupo para Rachas';
                pasoSimParametrosHNP.popover.description = `Permite fijar la cantidad de elementos del símbolo 1 (${k('n_1')}) y símbolo 2 (${k('n_2')}) para simular secuencias binarias y evaluar su aleatoriedad.`;
            }
            if (pasoSimConfigHNP?.popover) {
                pasoSimConfigHNP.popover.title = 'Significancia e Hipótesis Alternativa';
                pasoSimConfigHNP.popover.description = `Permite seleccionar el nivel de significancia (${k('\\alpha')}) y la orientación de la prueba (${k('H_1: \\neq, >, <')}) para contrastar las rachas simuladas.`;
            }
            if (pasoSimResumenHNP?.popover) {
                pasoSimResumenHNP.popover.title = 'Resumen de Rechazos de la Prueba de Rachas';
                pasoSimResumenHNP.popover.description = `Muestra en tiempo real la tasa empírica de rechazo de la hipótesis de aleatoriedad a lo largo de las réplicas simuladas.`;
            }
            if (pasoTablaHNP?.popover) {
                pasoTablaHNP.popover.title = 'Tabla de Resultados de la Prueba de Rachas';
                pasoTablaHNP.popover.description = `Resume las observaciones divididas en ambos grupos (${k('n_1, n_2')}), el total de rachas alternadas (${k('R')}), el estadístico tipificado (${k('Z_c')}) y el ${k('p')}-valor.`;
            }
            if (pasoGraficoHNP?.popover) {
                pasoGraficoHNP.popover.title = 'Distribución de Rachas y Región Crítica';
                pasoGraficoHNP.popover.description = `Visualiza la curva normal del estadístico de rachas con las áreas de rechazo demarcadas en rojo.`;
            }
            if (pasoDecisionHNP?.popover) {
                pasoDecisionHNP.popover.title = 'Decisión Estadística sobre Aleatoriedad';
                pasoDecisionHNP.popover.description = `Detalla la conclusión sobre si la secuencia de datos observada es estadísticamente aleatoria o muestra patrones de agolpamiento.`;
            }
        }
    }

    const pasosValidos = listaPasos.filter(paso => {
        if (!paso.element) return true;
        const el = document.querySelector(paso.element);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        return true;
    });

    if (pasosValidos.length === 0) {
        console.warn('No hay elementos visibles para iniciar el tour de MAT251.');
        return;
    }

    const driverObj = driver({
        popoverClass: 'mat251-driver-popover',
        showProgress: true,
        nextBtnText: 'Siguiente <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
        prevBtnText: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> Anterior',
        doneBtnText: '¡Entendido!',
        progressText: 'Paso {{current}} de {{total}}',
        animate: true,
        allowClose: true,
        overlayColor: 'rgba(0, 0, 0, 0.65)',
        stagePadding: 6,
        stageRadius: 5,
        popoverOffset: 28,
        onPopoverRender: (popover) => {
            if (popover?.wrapper) {
                popover.wrapper.classList.add('mat251-driver-popover');
            }
            if (popover?.title) {
                popover.title.innerHTML = popover.title.innerHTML.replace(/^\d+\.\s*/, '');
            }
        },
        steps: pasosValidos
    });

    driverObj.drive();
};

export const iniciarGuiaTema1 = iniciarGuiaMAT251;
export const iniciarGuiaConteo = iniciarGuiaMAT251;
export const iniciarGuiaExperimentos = iniciarGuiaMAT251;
export const iniciarGuiaSimulacion = iniciarGuiaMAT251;
export const iniciarGuiaProbabilidadTotal = iniciarGuiaMAT251;
export const iniciarGuiaReglaAdicion = iniciarGuiaMAT251;
export const iniciarGuiaAdicion = iniciarGuiaMAT251;
export const iniciarGuiaReglaMultiplicacion = iniciarGuiaMAT251;
export const iniciarGuiaMultiplicacion = iniciarGuiaMAT251;

export const iniciarGuiaTema2 = iniciarGuiaMAT251;
export const iniciarGuiaDiscreta = iniciarGuiaMAT251;
export const iniciarGuiaDistribucionDiscreta = iniciarGuiaMAT251;
export const iniciarGuiaContinua = iniciarGuiaMAT251;
export const iniciarGuiaDistribucionContinua = iniciarGuiaMAT251;

export const iniciarGuiaTema3 = iniciarGuiaMAT251;
export const iniciarGuiaModelosDiscretos = iniciarGuiaMAT251;
export const iniciarGuiaDistribucionesDiscretas = iniciarGuiaMAT251;
export const iniciarGuiaBernoulli = iniciarGuiaMAT251;
export const iniciarGuiaBinomial = iniciarGuiaMAT251;
export const iniciarGuiaPoisson = iniciarGuiaMAT251;
export const iniciarGuiaHipergeometrica = iniciarGuiaMAT251;
export const iniciarGuiaModelosContinuos = iniciarGuiaMAT251;
export const iniciarGuiaDistribucionesContinuas = iniciarGuiaMAT251;
export const iniciarGuiaUniforme = iniciarGuiaMAT251;
export const iniciarGuiaNormal = iniciarGuiaMAT251;
export const iniciarGuiaNormalEstandar = iniciarGuiaMAT251;
export const iniciarGuiaChiCuadrada = iniciarGuiaMAT251;
export const iniciarGuiaChiCuadrado = iniciarGuiaMAT251;
export const iniciarGuiaFFisher = iniciarGuiaMAT251;
export const iniciarGuiaTStudent = iniciarGuiaMAT251;

export const iniciarGuiaTema4 = iniciarGuiaMAT251;
export const iniciarGuiaDistribucionesMuestrales = iniciarGuiaMAT251;
export const iniciarGuiaMediaVarianzaConocida = iniciarGuiaMAT251;
export const iniciarGuiaProporcion = iniciarGuiaMAT251;
export const iniciarGuiaVarianzaMuestral = iniciarGuiaMAT251;
export const iniciarGuiaDiferenciaMedias = iniciarGuiaMAT251;
export const iniciarGuiaDiferenciaProporciones = iniciarGuiaMAT251;
export const iniciarGuiaDistribucionesTyF = iniciarGuiaMAT251;
export const iniciarGuiaTyFMediaVarianzaDesconocida = iniciarGuiaMAT251;
export const iniciarGuiaTyFDiferenciaMedias = iniciarGuiaMAT251;
export const iniciarGuiaTyFRazonVarianzas = iniciarGuiaMAT251;

export const iniciarGuiaTema5 = iniciarGuiaMAT251;
export const iniciarGuiaEstimacionPuntual = iniciarGuiaMAT251;
export const iniciarGuiaEstimacionIntervalos = iniciarGuiaMAT251;
export const iniciarGuiaIntervalosConfianza = iniciarGuiaMAT251;

export const iniciarGuiaTema6 = iniciarGuiaMAT251;
export const iniciarGuiaHipotesisParametricas = iniciarGuiaMAT251;
export const iniciarGuiaHipotesisNoParametricas = iniciarGuiaMAT251;

if (import.meta.hot) {
    import.meta.hot.accept();
}

export default iniciarGuiaMAT251;
