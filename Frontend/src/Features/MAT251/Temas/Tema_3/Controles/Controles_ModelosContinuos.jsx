import React, { useState, useEffect, useMemo } from 'react';
import '../../../styles/Temas/Tema3.css';
import { calcularDistribucionContinua, generarDatosGraficoContinua } from '../../../Matematicas/logica_Tema3';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { IconoMas, IconoBasura, EditarDatos } from '../../../../../ui/iconos';
import ModalAlerta from '../../../ui/ModalAlerta';
import { FONT, FS, RADIUS } from '../../../Principal/Constantes';
import StatLabel from '../../../ui/StatLabel';

export default function Controles_ModelosContinuos({
    varSeleccionada,
    filas,
    statsDatos,
    abrirEditor,
    onCalcular,
    children
}) {
    const initialModelosState = {
        Uniforme: {
            modo: 'matriz',
            manual: { a: '', b: '' },
            matriz: { col: 0, col2: 1, stats: null, a: '', b: '' },
            directa: { tipo: 'menor_igual', x: '', x2: '', intervals: [{ id: 1, min: '', max: '' }, { id: 2, min: '', max: '' }] },
            inversa: { tipo: 'inversa_menor', p: '' },
            calcMode: 'directa',
            yaCalculado: false,
        },
        Normal: {
            modo: 'matriz',
            manual: { mu: '', sigma: '' },
            matriz: { col: 0, col2: 1, stats: null, mu: '', sigma: '' },
            directa: { tipo: 'menor_igual', x: '', x2: '', intervals: [{ id: 1, min: '', max: '' }, { id: 2, min: '', max: '' }] },
            inversa: { tipo: 'inversa_menor', p: '' },
            calcMode: 'directa',
            yaCalculado: false,
        },
        NormalEstandar: {
            modo: 'manual',
            manual: { mu: '0', sigma: '1' },
            matriz: { col: 0, col2: 1, stats: null },
            directa: { tipo: 'menor_igual', x: '', x2: '', intervals: [{ id: 1, min: '', max: '' }, { id: 2, min: '', max: '' }] },
            inversa: { tipo: 'inversa_menor', p: '' },
            calcMode: 'directa',
            yaCalculado: false,
        },
        ChiCuadrado: {
            modo: 'matriz',
            manual: { k: '' },
            matriz: { col: 0, col2: 1, stats: null, k: '' },
            directa: { tipo: 'menor_igual', x: '', x2: '', intervals: [{ id: 1, min: '', max: '' }, { id: 2, min: '', max: '' }] },
            inversa: { tipo: 'inversa_menor', p: '' },
            calcMode: 'directa',
            yaCalculado: false,
        },
        FFisher: {
            modo: 'manual',
            manual: { v1: '', v2: '' },
            matriz: { col: 0, col2: 1, stats: null, v1: '', v2: '' },
            directa: { tipo: 'menor_igual', x: '', x2: '', intervals: [{ id: 1, min: '', max: '' }, { id: 2, min: '', max: '' }] },
            inversa: { tipo: 'inversa_menor', p: '' },
            calcMode: 'directa',
            yaCalculado: false,
        },
        TStudent: {
            modo: 'matriz',
            manual: { n: '' },
            matriz: { col: 0, col2: 1, stats: null, n: '' },
            directa: { tipo: 'menor_igual', x: '', x2: '', intervals: [{ id: 1, min: '', max: '' }, { id: 2, min: '', max: '' }] },
            inversa: { tipo: 'inversa_menor', p: '' },
            calcMode: 'directa',
            yaCalculado: false,
        }
    };

    const [modelo, setModelo] = useState('Uniforme');
    const [modelosState, setModelosState] = useState(initialModelosState);
    const [alerta, setAlerta] = useState({ isOpen: false, mensaje: '' });

    const activeState = modelosState[modelo] || initialModelosState[modelo];
    const modo = activeState.modo;
    const calcMode = activeState.calcMode;
    const yaCalculado = activeState.yaCalculado;

    // Parámetros activos según modo (manual o matriz)
    const isMatriz = modo === 'matriz';
    const paramA = isMatriz ? (activeState.matriz.a ?? '') : (activeState.manual.a ?? '');
    const paramB = isMatriz ? (activeState.matriz.b ?? '') : (activeState.manual.b ?? '');
    const paramMu = isMatriz ? (activeState.matriz.mu ?? '') : (activeState.manual.mu ?? '');
    const paramSigma = isMatriz ? (activeState.matriz.sigma ?? '') : (activeState.manual.sigma ?? '');
    const paramK = isMatriz ? (activeState.matriz.k ?? '') : (activeState.manual.k ?? '');
    const paramV1 = isMatriz ? (activeState.matriz.v1 ?? '') : (activeState.manual.v1 ?? '');
    const paramV2 = isMatriz ? (activeState.matriz.v2 ?? '') : (activeState.manual.v2 ?? '');
    const paramNStudent = isMatriz ? (activeState.matriz.n ?? '') : (activeState.manual.n ?? '');

    // Condición activa según calcMode (directa o inversa)
    const tipoCondicion = calcMode === 'directa' ? activeState.directa.tipo : activeState.inversa.tipo;
    const valorX = activeState.directa.x;
    const valorX2 = activeState.directa.x2;
    const intervals = activeState.directa.intervals;
    const valorP = activeState.inversa.p;

    // Matriz activa
    const columnaSeleccionada = activeState.matriz.col ?? 0;
    const columnaSeleccionada2 = activeState.matriz.col2 ?? 1;
    const statsEstimados = activeState.matriz.stats ?? null;

    const renderLatex = (str) => {
        return <span style={{ fontSize: '0.9em' }} dangerouslySetInnerHTML={{ __html: katex.renderToString(str, { throwOnError: false }) }} />;
    };

    const updateActive = (updater) => {
        setModelosState(prev => {
            const cur = prev[modelo] || initialModelosState[modelo];
            const next = typeof updater === 'function' ? updater(cur) : { ...cur, ...updater };
            return { ...prev, [modelo]: next };
        });
    };

    const setModo = (nuevoModo) => {
        updateActive(cur => ({ ...cur, modo: nuevoModo }));
        if (onCalcular) onCalcular(null);
    };

    const setCalcMode = (nuevoCalcMode) => {
        updateActive(cur => ({ ...cur, calcMode: nuevoCalcMode }));
    };

    const setYaCalculado = (val) => {
        updateActive(cur => ({ ...cur, yaCalculado: val }));
    };

    const setTipoCondicion = (val) => {
        updateActive(cur => {
            if (cur.calcMode === 'directa') {
                return { ...cur, directa: { ...cur.directa, tipo: val } };
            } else {
                return { ...cur, inversa: { ...cur.inversa, tipo: val } };
            }
        });
    };

    const setValorX = (val) => {
        updateActive(cur => ({ ...cur, directa: { ...cur.directa, x: val } }));
    };

    const setValorX2 = (val) => {
        updateActive(cur => ({ ...cur, directa: { ...cur.directa, x2: val } }));
    };

    const setIntervals = (newIntervals) => {
        updateActive(cur => ({
            ...cur,
            directa: {
                ...cur.directa,
                intervals: typeof newIntervals === 'function' ? newIntervals(cur.directa.intervals) : newIntervals
            }
        }));
    };

    const setValorP = (val) => {
        updateActive(cur => ({ ...cur, inversa: { ...cur.inversa, p: val } }));
    };

    const setParamA = (val) => {
        updateActive(cur => ({ ...cur, manual: { ...cur.manual, a: val }, yaCalculado: false }));
    };

    const setParamB = (val) => {
        updateActive(cur => ({ ...cur, manual: { ...cur.manual, b: val }, yaCalculado: false }));
    };

    const setParamMu = (val) => {
        updateActive(cur => ({ ...cur, manual: { ...cur.manual, mu: val }, yaCalculado: false }));
    };

    const setParamSigma = (val) => {
        updateActive(cur => ({ ...cur, manual: { ...cur.manual, sigma: val }, yaCalculado: false }));
    };

    const setParamK = (val) => {
        updateActive(cur => ({ ...cur, manual: { ...cur.manual, k: val }, yaCalculado: false }));
    };

    const setParamV1 = (val) => {
        updateActive(cur => ({ ...cur, manual: { ...cur.manual, v1: val }, yaCalculado: false }));
    };

    const setParamV2 = (val) => {
        updateActive(cur => ({ ...cur, manual: { ...cur.manual, v2: val }, yaCalculado: false }));
    };

    const setParamNStudent = (val) => {
        updateActive(cur => ({ ...cur, manual: { ...cur.manual, n: val }, yaCalculado: false }));
    };

    const setColumnaSeleccionada = (col) => {
        updateActive(cur => ({ ...cur, matriz: { ...cur.matriz, col }, yaCalculado: false }));
    };

    const setColumnaSeleccionada2 = (col2) => {
        updateActive(cur => ({ ...cur, matriz: { ...cur.matriz, col2 }, yaCalculado: false }));
    };

    const setStatsEstimados = (stats) => {
        updateActive(cur => ({ ...cur, matriz: { ...cur.matriz, stats } }));
    };

    useEffect(() => {
        setModelosState(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(k => {
                next[k] = {
                    ...next[k],
                    matriz: { ...next[k].matriz, col: 0, col2: 1, stats: null, a: '', b: '', mu: '', sigma: '', k: '', v1: '', v2: '', n: '' },
                    yaCalculado: next[k].modo === 'matriz' ? false : next[k].yaCalculado
                };
            });
            return next;
        });
        if (onCalcular) onCalcular(null);
    }, [varSeleccionada, filas]);

    const handleCambiarModelo = (nuevoModelo) => {
        if (modelo === nuevoModelo) return;
        setModelo(nuevoModelo);
        setAlerta({ isOpen: false, mensaje: '' });
        if (onCalcular) onCalcular(null);
    };

    // Extraer datos
    const columnasDisponibles = useMemo(() => {
        return (varSeleccionada?.nombresColumnas && varSeleccionada.nombresColumnas.length > 0)
            ? varSeleccionada.nombresColumnas
            : (varSeleccionada ? [varSeleccionada.nombre || 'Datos'] : []);
    }, [varSeleccionada]);

    const colActiva = (typeof columnaSeleccionada === 'number' && columnaSeleccionada < columnasDisponibles.length) ? columnaSeleccionada : 0;
    const colActiva2 = (typeof columnaSeleccionada2 === 'number' && columnaSeleccionada2 < columnasDisponibles.length) ? columnaSeleccionada2 : (columnasDisponibles.length > 1 ? 1 : 0);

    const datosColumna = useMemo(() => {
        if (!varSeleccionada || !filas || filas.length === 0) return [];
        const validas = filas.filter(f => (f.valor || '').toString().trim() !== '');
        return validas.map(f => {
            if (varSeleccionada.nombresColumnas && varSeleccionada.nombresColumnas.length > 1) {
                const partes = (f.valor || '').toString().split(' | ');
                return partes[colActiva] ? partes[colActiva].trim() : '';
            }
            return (f.valor || '').toString().trim();
        }).map(v => parseFloat(v)).filter(v => !isNaN(v));
    }, [varSeleccionada, filas, colActiva]);

    // Datos de la segunda columna (para FFisher)
    const datosColumna2 = useMemo(() => {
        if (!varSeleccionada || !filas || filas.length === 0) return [];
        const validas = filas.filter(f => (f.valor || '').toString().trim() !== '');
        return validas.map(f => {
            if (varSeleccionada.nombresColumnas && varSeleccionada.nombresColumnas.length > 1) {
                const partes = (f.valor || '').toString().split(' | ');
                return partes[colActiva2] ? partes[colActiva2].trim() : '';
            }
            return '';
        }).map(v => parseFloat(v)).filter(v => !isNaN(v));
    }, [varSeleccionada, filas, colActiva2]);

    // Estimar desde datos
    const estimarDesdeDatos = () => {
        if (!varSeleccionada || !filas || filas.length === 0) {
            setAlerta({ isOpen: true, mensaje: 'No hay datos cargados en la variable seleccionada.' });
            return;
        }

        if (modelo === 'FFisher') {
            if (columnasDisponibles.length < 2) {
                setAlerta({ isOpen: true, mensaje: 'La Distribución F de Fisher requiere una matriz con al menos 2 columnas numéricas (Grupo 1 y Grupo 2).' });
                return;
            }
            if (colActiva === colActiva2) {
                setAlerta({ isOpen: true, mensaje: 'Debes seleccionar columnas diferentes para el Grupo 1 y el Grupo 2.' });
                return;
            }
            if (datosColumna.length === 0 || datosColumna2.length === 0) {
                setAlerta({
                    isOpen: true,
                    mensaje: (
                        <span>
                            Una o ambas columnas seleccionadas contienen datos <strong>cualitativos (texto)</strong> o sin valores numéricos válidos.
                            <br />
                            Las distribuciones continuas requieren <strong>datos cuantitativos (números)</strong>.
                        </span>
                    )
                });
                return;
            }
            const n1 = datosColumna.length;
            const n2 = datosColumna2.length;
            if (n1 < 2) {
                setAlerta({ isOpen: true, mensaje: <span>La columna del Grupo 1 requiere al menos 2 datos numéricos ({renderLatex('v_1')} = n_1 - 1).</span> });
                return;
            }
            if (n2 < 2) {
                setAlerta({ isOpen: true, mensaje: <span>La columna del Grupo 2 requiere al menos 2 datos numéricos ({renderLatex('v_2')} = n_2 - 1).</span> });
                return;
            }
            const v1 = n1 - 1;
            const v2 = n2 - 1;
            updateActive(cur => ({
                ...cur,
                matriz: {
                    ...cur.matriz,
                    stats: { total1: n1, total2: n2, v1, v2 },
                    v1: v1.toString(),
                    v2: v2.toString()
                }
            }));
            setAlerta({ isOpen: false, mensaje: '' });
            if (onCalcular) onCalcular(null);
            return;
        }

        // Validación de datos numéricos
        if (datosColumna.length === 0) {
            setAlerta({
                isOpen: true,
                mensaje: (
                    <span>
                        La variable o columna seleccionada contiene datos <strong>cualitativos (texto)</strong> o no numéricos.
                        <br />
                        Las distribuciones continuas requieren <strong>datos cuantitativos (números)</strong>.
                    </span>
                )
            });
            return;
        }

        if (modelo === 'Uniforme') {
            const min = Math.min(...datosColumna);
            const max = Math.max(...datosColumna);

            if (min >= max) {
                setAlerta({
                    isOpen: true,
                    mensaje: (
                        <span>
                            Para estimar la Distribución Uniforme se requieren al menos dos valores numéricos diferentes ({renderLatex('a < b')}). Todos los datos son iguales a <strong>{min}</strong>.
                        </span>
                    )
                });
                return;
            }

            updateActive(cur => ({
                ...cur,
                matriz: {
                    ...cur.matriz,
                    stats: {
                        total: datosColumna.length,
                        min: min,
                        max: max
                    },
                    a: min.toString(),
                    b: max.toString()
                }
            }));
        } else if (modelo === 'Normal') {
            if (datosColumna.length < 2) {
                setAlerta({
                    isOpen: true,
                    mensaje: (
                        <span>
                            La Distribución Normal requiere al menos 2 datos numéricos para calcular la desviación estándar muestral ({renderLatex('\\sigma')}).
                        </span>
                    )
                });
                return;
            }

            const sum = datosColumna.reduce((a, b) => a + b, 0);
            const media = sum / datosColumna.length;
            const variance = datosColumna.reduce((a, b) => a + Math.pow(b - media, 2), 0) / (datosColumna.length - 1);
            const dev = Math.sqrt(variance);

            if (dev <= 0) {
                setAlerta({
                    isOpen: true,
                    mensaje: (
                        <span>
                            La desviación estándar calculada es 0 (todos los datos son idénticos). La Distribución Normal requiere variabilidad en los datos ({renderLatex('\\sigma > 0')}).
                        </span>
                    )
                });
                return;
            }

            updateActive(cur => ({
                ...cur,
                matriz: {
                    ...cur.matriz,
                    stats: {
                        total: datosColumna.length,
                        media: media,
                        desviacion: dev
                    },
                    mu: media.toFixed(4),
                    sigma: dev.toFixed(4)
                }
            }));
        } else if (modelo === 'ChiCuadrado' || modelo === 'TStudent') {
            const num = datosColumna.length - 1;
            if (num <= 0) {
                setAlerta({ isOpen: true, mensaje: <span>Se requieren al menos 2 datos numéricos para estimar los grados de libertad ({renderLatex('n')} = total - 1).</span> });
                return;
            }
            updateActive(cur => ({
                ...cur,
                matriz: {
                    ...cur.matriz,
                    stats: { total: datosColumna.length, n: num },
                    k: modelo === 'ChiCuadrado' ? num.toString() : cur.matriz.k,
                    n: modelo === 'TStudent' ? num.toString() : cur.matriz.n
                }
            }));
        }

        setAlerta({ isOpen: false, mensaje: '' });
        setYaCalculado(false);
        if (onCalcular) onCalcular(null);
    };

    const manejarCalculo = (isGraficarOnly = false) => {
        setAlerta({ isOpen: false, mensaje: '' });

        const parseNum = (val) => {
            if (val === undefined || val === null || val === '') return NaN;
            return parseFloat(val.toString().replace(',', '.'));
        };

        const parseIntNum = (val) => {
            if (val === undefined || val === null || val === '') return NaN;
            return parseInt(val.toString().replace(',', '.'), 10);
        };

        let params = {};

        if (modelo === 'Uniforme') {
            const a = parseNum(paramA);
            const b = parseNum(paramB);
            if (isNaN(a) || isNaN(b)) return setAlerta({ isOpen: true, mensaje: <span>En Uniforme, &quot;{renderLatex('a')}&quot; y &quot;{renderLatex('b')}&quot; deben ser números válidos.</span> });
            if (a >= b) return setAlerta({ isOpen: true, mensaje: <span>El parámetro &quot;{renderLatex('a')}&quot; (mínimo) debe ser estrictamente menor que &quot;{renderLatex('b')}&quot; (máximo).</span> });
            params = { a, b };
        } else if (modelo === 'Normal') {
            const mu = parseNum(paramMu);
            const sigma = parseNum(paramSigma);
            if (isNaN(mu) || isNaN(sigma)) return setAlerta({ isOpen: true, mensaje: <span>En Normal, la media ({renderLatex('\\mu')}) y desviación ({renderLatex('\\sigma')}) deben ser números válidos.</span> });
            if (sigma <= 0) return setAlerta({ isOpen: true, mensaje: <span>La desviación estándar ({renderLatex('\\sigma')}) debe ser mayor a 0.</span> });
            params = { mu, sigma };
        } else if (modelo === 'NormalEstandar') {
            params = { mu: 0, sigma: 1 };
        } else if (modelo === 'ChiCuadrado') {
            const k = parseIntNum(paramK);
            if (isNaN(k) || k <= 0) return setAlerta({ isOpen: true, mensaje: <span>En Chi-cuadrada, los grados de libertad ({renderLatex('v')}) deben ser un número entero mayor a 0.</span> });
            params = { k };
        } else if (modelo === 'FFisher') {
            const v1 = parseIntNum(paramV1);
            const v2 = parseIntNum(paramV2);
            if (isNaN(v1) || v1 <= 0 || isNaN(v2) || v2 <= 0) return setAlerta({ isOpen: true, mensaje: <span>En F de Fisher, los grados de libertad ({renderLatex('v_1')} y {renderLatex('v_2')}) deben ser enteros mayores a 0.</span> });
            params = { v1, v2 };
        } else if (modelo === 'TStudent') {
            const n = parseIntNum(paramNStudent);
            if (isNaN(n) || n <= 0) return setAlerta({ isOpen: true, mensaje: <span>En T de Student, los grados de libertad ({renderLatex('n')}) deben ser un número entero mayor a 0.</span> });
            params = { n };
        } else {
            return setAlerta({ isOpen: true, mensaje: 'Este modelo continuo aún está en construcción.' });
        }

        let condicionCalculo = null;
        let condicionVisual = null;

        if (!isGraficarOnly) {
            if (calcMode === 'directa') {
                if (tipoCondicion === 'suma_intervalos') {
                    const hasValidInterval = intervals.some(i => i.min !== '' && i.max !== '');
                    if (!hasValidInterval) return setAlerta({ isOpen: true, mensaje: 'Ingresa al menos un intervalo válido.' });
                    const parsedIntervals = intervals.map(i => ({
                        ...i,
                        min: i.min !== '' ? parseNum(i.min) : '',
                        max: i.max !== '' ? parseNum(i.max) : ''
                    }));
                    condicionVisual = { tipo: tipoCondicion, intervals: parsedIntervals };
                    condicionCalculo = { tipo: tipoCondicion, intervals: parsedIntervals };
                } else {
                    if (valorX === '') {
                        return setAlerta({ isOpen: true, mensaje: <span>Por favor, ingresa el <strong>valor objetivo {renderLatex('x')}</strong> para la condición de búsqueda.</span> });
                    }
                    let x = parseNum(valorX);
                    if (isNaN(x)) return setAlerta({ isOpen: true, mensaje: <span>El valor objetivo &quot;{renderLatex('x')}&quot; debe ser numérico.</span> });

                    let valB = '';
                    if (['entre', 'exterior', 'intervalo'].includes(tipoCondicion)) {
                        if (valorX2 === '') {
                            return setAlerta({ isOpen: true, mensaje: <span>Por favor, ingresa el <strong>límite superior {renderLatex('b')}</strong> para el intervalo.</span> });
                        }
                        valB = parseNum(valorX2);
                        if (isNaN(valB) || valB <= x) return setAlerta({ isOpen: true, mensaje: 'El límite superior debe ser mayor que el límite inferior.' });
                    }

                    condicionVisual = { tipo: tipoCondicion, valX: x, valX2: valB };
                    condicionCalculo = { tipo: tipoCondicion, valX: x, valX2: valB };
                }
            } else { // calcMode === 'inversa'
                if (valorP === '') {
                    return setAlerta({ isOpen: true, mensaje: <span>Por favor, ingresa la <strong>probabilidad {renderLatex('p')}</strong> para la condición inversa.</span> });
                }
                let p = parseNum(valorP);
                if (isNaN(p) || p <= 0 || p >= 1) return setAlerta({ isOpen: true, mensaje: <span>La probabilidad ({renderLatex('P')}) debe ser un número entre 0 y 1.</span> });
                condicionVisual = { tipo: tipoCondicion, valP: p };
                condicionCalculo = { tipo: tipoCondicion, valP: p };
            }
        }

        const resultados = calcularDistribucionContinua(modelo, params, condicionCalculo);
        const datosGrafico = generarDatosGraficoContinua(modelo, params, condicionCalculo, resultados);

        if (isGraficarOnly) setYaCalculado(true);
        onCalcular({ modelo, params, condicion: condicionVisual, resultados, datosGrafico });
    };

    const limpiarCondicionCalculada = () => {
        if (yaCalculado) {
            manejarCalculo(true);
        }
    };

    const renderParametrosManuales = () => {
        const isMatriz = modo === 'matriz';
        const modelSupportsMatriz = modelo === 'Uniforme' || modelo === 'Normal' || modelo === 'ChiCuadrado' || modelo === 'TStudent' || modelo === 'FFisher';
        const readOnlyParams = isMatriz && modelSupportsMatriz;

        const disabledStyle = {
            backgroundColor: 'var(--bg-input, #f1f5f9)',
            color: 'var(--text-muted, #475569)',
            border: '1px dashed var(--border-color, #94a3b8)',
            cursor: 'not-allowed',
            fontWeight: 600,
            opacity: 0.7
        };

        const nombresDistribucion = {
            Uniforme: 'Distribución Uniforme',
            Normal: 'Distribución Normal',
            NormalEstandar: 'Distribución Normal Estándar',
            ChiCuadrado: 'Distribución Chi-cuadrada',
            FFisher: 'Distribución F de Fisher',
            TStudent: 'Distribución T de Student'
        };

        if (modelo === 'Normal') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px', width: '100%' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-pure)', marginBottom: '10px', textAlign: 'center', fontFamily: FONT, marginTop: '5px' }}>
                        Función de Densidad - {nombresDistribucion[modelo]}
                    </span>
                    <div className="t3-formula-scroll" style={{ display: 'block', color: 'var(--text-pure)', background: 'var(--bg-input, #f8fafc)', padding: '12px 20px', borderRadius: RADIUS, fontSize: '1.1rem', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '0 auto 15px auto', maxWidth: '100%', boxSizing: 'border-box' }}>
                        <div className="t3-formula-inner">
                            {(() => {
                                const muNum = parseFloat(paramMu);
                                const sigmaNum = parseFloat(paramSigma);
                                if (paramMu !== '' && paramSigma !== '' && !isNaN(muNum) && !isNaN(sigmaNum) && sigmaNum > 0) {
                                    const muStr = muNum < 0 ? `(${paramMu})` : paramMu;
                                    return renderLatex(`f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2} \\quad \\implies \\quad \\frac{1}{${paramSigma} \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-${muStr}}{${paramSigma}}\\right)^2}`);
                                }
                                return renderLatex(`f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}`);
                            })()}
                        </div>
                    </div>
                    <div className="t3-parametros-fila-manual" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'nowrap', width: '100%', maxWidth: '360px', margin: '0 auto' }}>
                        <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}>
                            <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                {renderLatex('\\mu:')}
                            </label>
                            <input
                                type="number" className="input-mat251 placeholder-small" step="any"
                                value={paramMu} onChange={e => { setParamMu(e.target.value); setYaCalculado(false); if (onCalcular) onCalcular(null); }}
                                placeholder="Media"
                                disabled={readOnlyParams}
                                style={{ ...readOnlyParams ? disabledStyle : {}, padding: '6px 8px', fontSize: FS.sm, fontFamily: FONT, borderRadius: RADIUS, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-pure)', textAlign: 'center', width: '100%', maxWidth: '130px', minWidth: '0', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}>
                            <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                {renderLatex('\\sigma:')}
                            </label>
                            <input
                                type="number" className="input-mat251 placeholder-small" step="any"
                                value={paramSigma} onChange={e => { setParamSigma(e.target.value); setYaCalculado(false); if (onCalcular) onCalcular(null); }}
                                placeholder="Desviación"
                                disabled={readOnlyParams}
                                style={{ ...readOnlyParams ? disabledStyle : {}, padding: '6px 8px', fontSize: FS.sm, fontFamily: FONT, borderRadius: RADIUS, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-pure)', textAlign: 'center', width: '100%', maxWidth: '130px', minWidth: '0', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        if (modelo === 'NormalEstandar') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px', width: '100%' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-pure)', marginBottom: '10px', textAlign: 'center', fontFamily: FONT, marginTop: '5px' }}>
                        Función de Densidad - {nombresDistribucion[modelo]}
                    </span>
                    <div className="t3-formula-scroll" style={{ display: 'block', color: 'var(--text-pure)', background: 'var(--bg-input, #f8fafc)', padding: '12px 20px', borderRadius: RADIUS, fontSize: '1.1rem', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '0 auto 15px auto', maxWidth: '100%', boxSizing: 'border-box' }}>
                        <div className="t3-formula-inner">
                            {renderLatex(`f(z) = \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{1}{2}z^2}`)}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap', width: '100%' }}>
                        <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px', width: 'auto' }}>
                            <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', minWidth: '24px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                {renderLatex('\\mu:')}
                            </label>
                            <input
                                type="text" className="input-mat251"
                                value="0"
                                disabled={true}
                                style={{ ...disabledStyle, padding: '6px 12px', fontSize: FS.sm, fontFamily: FONT, borderRadius: RADIUS, border: '1px dashed var(--border-color, #94a3b8)', textAlign: 'center', width: '110px', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px', width: 'auto' }}>
                            <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', minWidth: '24px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                {renderLatex('\\sigma:')}
                            </label>
                            <input
                                type="text" className="input-mat251"
                                value="1"
                                disabled={true}
                                style={{ ...disabledStyle, padding: '6px 12px', fontSize: FS.sm, fontFamily: FONT, borderRadius: RADIUS, border: '1px dashed var(--border-color, #94a3b8)', textAlign: 'center', width: '110px', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        if (modelo === 'ChiCuadrado') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px', width: '100%' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-pure)', marginBottom: '10px', textAlign: 'center', fontFamily: FONT, marginTop: '5px' }}>
                        Función de Densidad - {nombresDistribucion[modelo]}
                    </span>
                    <div className="t3-formula-scroll" style={{ display: 'block', color: 'var(--text-pure)', background: 'var(--bg-input, #f8fafc)', padding: '12px 20px', borderRadius: RADIUS, fontSize: '1.1rem', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '0 auto 15px auto', maxWidth: '100%', boxSizing: 'border-box' }}>
                        <div className="t3-formula-inner">
                            {(() => {
                                const kNum = parseInt(paramK);
                                if (paramK !== '' && !isNaN(kNum) && kNum > 0) {
                                    return renderLatex(`f(x) = \\frac{1}{2^{v/2}\\Gamma(\\frac{v}{2})}x^{v/2-1}e^{-x/2} \\quad \\implies \\quad \\frac{1}{2^{${paramK}/2}\\Gamma(\\frac{${paramK}}{2})}x^{\\frac{${paramK}}{2}-1}e^{-x/2}`);
                                }
                                return renderLatex(`f(x) = \\frac{1}{2^{v/2}\\Gamma(\\frac{v}{2})}x^{v/2-1}e^{-x/2}`);
                            })()}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap', width: '100%' }}>
                        <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px', width: 'auto' }}>
                            <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', minWidth: '24px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                {renderLatex('v:')}
                            </label>
                            <input
                                type="number" className="input-mat251 placeholder-small" step="1" min="1"
                                value={paramK} onChange={e => { setParamK(e.target.value); setYaCalculado(false); if (onCalcular) onCalcular(null); }}
                                placeholder="Grados de libertad"
                                disabled={readOnlyParams}
                                style={{ ...readOnlyParams ? disabledStyle : {}, padding: '6px 12px', fontSize: FS.sm, fontFamily: FONT, borderRadius: RADIUS, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-pure)', textAlign: 'center', width: '160px', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        if (modelo === 'FFisher') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px', width: '100%' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-pure)', marginBottom: '10px', textAlign: 'center', fontFamily: FONT, marginTop: '5px' }}>
                        Función de Densidad - {nombresDistribucion[modelo]}
                    </span>
                    <div className="t3-formula-scroll" style={{ display: 'block', color: 'var(--text-pure)', background: 'var(--bg-input, #f8fafc)', padding: '12px 20px', borderRadius: RADIUS, fontSize: '1.1rem', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '0 auto 15px auto', maxWidth: '100%', boxSizing: 'border-box' }}>
                        <div className="t3-formula-inner">
                            {(() => {
                                const v1Num = parseInt(paramV1);
                                const v2Num = parseInt(paramV2);
                                if (paramV1 !== '' && paramV2 !== '' && !isNaN(v1Num) && !isNaN(v2Num) && v1Num > 0 && v2Num > 0) {
                                    return renderLatex(`f(x) = \\frac{\\Gamma\\left(\\frac{n+m}{2}\\right)\\left(\\frac{n}{m}\\right)^{n/2}}{\\Gamma\\left(\\frac{n}{2}\\right)\\Gamma\\left(\\frac{m}{2}\\right)} \\frac{x^{\\frac{n}{2}-1}}{\\left(1+\\frac{n}{m}x\\right)^{(n+m)/2}} \\quad \\implies \\quad \\frac{\\Gamma\\left(\\frac{${paramV1}+${paramV2}}{2}\\right)\\left(\\frac{${paramV1}}{${paramV2}}\\right)^{${paramV1}/2}}{\\Gamma\\left(\\frac{${paramV1}}{2}\\right)\\Gamma\\left(\\frac{${paramV2}}{2}\\right)} \\frac{x^{\\frac{${paramV1}}{2}-1}}{\\left(1+\\frac{${paramV1}}{${paramV2}}x\\right)^{(${paramV1}+${paramV2})/2}}`);
                                }
                                return renderLatex(`f(x) = \\frac{\\Gamma\\left(\\frac{n+m}{2}\\right)\\left(\\frac{n}{m}\\right)^{n/2}}{\\Gamma\\left(\\frac{n}{2}\\right)\\Gamma\\left(\\frac{m}{2}\\right)} \\frac{x^{\\frac{n}{2}-1}}{\\left(1+\\frac{n}{m}x\\right)^{(n+m)/2}}`);
                            })()}
                        </div>
                    </div>
                    <div className="t3-parametros-fila-manual" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'nowrap', width: '100%', maxWidth: '380px', margin: '0 auto' }}>
                        <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}>
                            <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                {renderLatex('n:')}
                            </label>
                            <input
                                type="number" className="input-mat251 placeholder-small" step="1" min="1"
                                value={paramV1} onChange={e => { setParamV1(e.target.value); setYaCalculado(false); if (onCalcular) onCalcular(null); }}
                                placeholder="Grados num."
                                title="Grados de libertad del numerador (n)"
                                disabled={readOnlyParams}
                                style={{ ...readOnlyParams ? disabledStyle : {}, padding: '6px 8px', fontSize: FS.sm, fontFamily: FONT, borderRadius: RADIUS, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-pure)', textAlign: 'center', width: '100%', maxWidth: '140px', minWidth: '0', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}>
                            <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                {renderLatex('m:')}
                            </label>
                            <input
                                type="number" className="input-mat251 placeholder-small" step="1" min="1"
                                value={paramV2} onChange={e => { setParamV2(e.target.value); setYaCalculado(false); if (onCalcular) onCalcular(null); }}
                                placeholder="Grados den."
                                title="Grados de libertad del denominador (m)"
                                disabled={readOnlyParams}
                                style={{ ...readOnlyParams ? disabledStyle : {}, padding: '6px 8px', fontSize: FS.sm, fontFamily: FONT, borderRadius: RADIUS, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-pure)', textAlign: 'center', width: '100%', maxWidth: '140px', minWidth: '0', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        if (modelo === 'TStudent') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px', width: '100%' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-pure)', marginBottom: '10px', textAlign: 'center', fontFamily: FONT, marginTop: '5px' }}>
                        Función de Densidad - {nombresDistribucion[modelo]}
                    </span>
                    <div className="t3-formula-scroll" style={{ display: 'block', color: 'var(--text-pure)', background: 'var(--bg-input, #f8fafc)', padding: '12px 20px', borderRadius: RADIUS, fontSize: '1.1rem', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '0 auto 15px auto', maxWidth: '100%', boxSizing: 'border-box' }}>
                        <div className="t3-formula-inner">
                            {(() => {
                                const nNum = parseInt(paramNStudent);
                                if (paramNStudent !== '' && !isNaN(nNum) && nNum > 0) {
                                    return renderLatex(`f(t) = \\frac{\\Gamma\\!\\left(\\frac{n+1}{2}\\right)}{\\Gamma\\!\\left(\\frac{n}{2}\\right)\\sqrt{n\\pi}}\\left(1+\\frac{t^2}{n}\\right)^{-\\frac{n+1}{2}} \\quad \\implies \\quad \\frac{\\Gamma\\!\\left(\\frac{${paramNStudent}+1}{2}\\right)}{\\Gamma\\!\\left(\\frac{${paramNStudent}}{2}\\right)\\sqrt{${paramNStudent}\\pi}}\\left(1+\\frac{t^2}{${paramNStudent}}\\right)^{-\\frac{${paramNStudent}+1}{2}}`);
                                }
                                return renderLatex(`f(t) = \\frac{\\Gamma\\!\\left(\\frac{n+1}{2}\\right)}{\\Gamma\\!\\left(\\frac{n}{2}\\right)\\sqrt{n\\pi}}\\left(1+\\frac{t^2}{n}\\right)^{-\\frac{n+1}{2}}`);
                            })()}
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap', width: '100%' }}>
                        <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px', width: 'auto' }}>
                            <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', minWidth: '24px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                {renderLatex('n:')}
                            </label>
                            <input
                                type="number" className="input-mat251 placeholder-small" step="1" min="1"
                                value={paramNStudent} onChange={e => { setParamNStudent(e.target.value); setYaCalculado(false); if (onCalcular) onCalcular(null); }}
                                placeholder="Grados de libertad"
                                disabled={readOnlyParams}
                                style={{ ...readOnlyParams ? disabledStyle : {}, padding: '6px 12px', fontSize: FS.sm, fontFamily: FONT, borderRadius: RADIUS, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-pure)', textAlign: 'center', width: '160px', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px', width: '100%' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-pure)', marginBottom: '10px', textAlign: 'center', fontFamily: FONT, marginTop: '5px' }}>
                    Función de Densidad - {nombresDistribucion[modelo] || 'Distribución Uniforme'}
                </span>
                <div className="t3-formula-scroll" style={{ display: 'block', color: 'var(--text-pure)', background: 'var(--bg-input, #f8fafc)', padding: '12px 20px', borderRadius: RADIUS, fontSize: '1.1rem', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '0 auto 15px auto', maxWidth: '100%', boxSizing: 'border-box' }}>
                    <div className="t3-formula-inner">
                        {(() => {
                            const aNum = parseFloat(paramA);
                            const bNum = parseFloat(paramB);
                            if (paramA !== '' && paramB !== '' && !isNaN(aNum) && !isNaN(bNum) && bNum > aNum) {
                                const aStr = aNum < 0 ? `(${paramA})` : paramA;
                                const bStr = bNum < 0 ? `(${paramB})` : paramB;
                                return renderLatex(`f(x) = \\frac{1}{b - a} \\quad \\implies \\quad \\frac{1}{${bStr} - ${aStr}}`);
                            }
                            if (paramA !== '' || paramB !== '') {
                                const aStr = paramA !== '' ? (parseFloat(paramA) < 0 ? `(${paramA})` : paramA) : 'a';
                                const bStr = paramB !== '' ? (parseFloat(paramB) < 0 ? `(${paramB})` : paramB) : 'b';
                                return renderLatex(`f(x) = \\frac{1}{b - a} \\quad \\implies \\quad \\frac{1}{${bStr} - ${aStr}}`);
                            }
                            return renderLatex('f(x) = \\frac{1}{b - a}');
                        })()}
                    </div>
                </div>
                <div className="t3-parametros-fila-manual" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '16px', flexWrap: 'nowrap', width: '100%', maxWidth: '360px', margin: '0 auto' }}>
                    <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}>
                        <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
                            {renderLatex('a:')}
                        </label>
                        <input
                            type="number" className="input-mat251 placeholder-small" step="any"
                            value={paramA} onChange={e => { setParamA(e.target.value); setYaCalculado(false); if (onCalcular) onCalcular(null); }}
                            placeholder="Mínimo"
                            disabled={readOnlyParams}
                            style={{ ...readOnlyParams ? disabledStyle : {}, padding: '6px 8px', fontSize: FS.sm, fontFamily: FONT, borderRadius: RADIUS, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-pure)', textAlign: 'center', width: '100%', maxWidth: '130px', minWidth: '0', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}>
                        <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
                            {renderLatex('b:')}
                        </label>
                        <input
                            type="number" className="input-mat251 placeholder-small" step="any"
                            value={paramB} onChange={e => { setParamB(e.target.value); setYaCalculado(false); if (onCalcular) onCalcular(null); }}
                            placeholder="Máximo"
                            disabled={readOnlyParams}
                            style={{ ...readOnlyParams ? disabledStyle : {}, padding: '6px 8px', fontSize: FS.sm, fontFamily: FONT, borderRadius: RADIUS, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-pure)', textAlign: 'center', width: '100%', maxWidth: '130px', minWidth: '0', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* GRUPO DE SELECTORES (MODELO Y MODO) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '10px', marginTop: '10px' }}>

                {/* SELECTOR DE MODELO CONTINUO */}
                <div className="tema3-scrollable-tabs" style={{ display: 'flex', overflowX: 'auto', width: '100%', maxWidth: '850px', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: RADIUS, border: '1px solid var(--border-color, #e2e8f0)' }}>
                    {[
                        { id: 'Uniforme', label: 'Uniforme' },
                        { id: 'Normal', label: 'Normal' },
                        { id: 'NormalEstandar', label: 'Normal Estándar' },
                        { id: 'ChiCuadrado', label: 'Chi-cuadrada' },
                        { id: 'FFisher', label: 'F de Fisher' },
                        { id: 'TStudent', label: 'T de Student' }
                    ].map(tipo => (
                        <button
                            key={tipo.id}
                            type="button"
                            className={`btn-mat251-modo ${modelo === tipo.id ? 'active' : ''}`}
                            onClick={() => handleCambiarModelo(tipo.id)}
                            style={{ flex: '1 0 140px', whiteSpace: 'nowrap', fontFamily: FONT }}
                        >
                            {tipo.label}
                        </button>
                    ))}
                </div>

                {modelo !== 'NormalEstandar' && (
                    <div style={{ display: 'inline-flex', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: RADIUS, border: '1px solid var(--border-color, #e2e8f0)' }}>
                        <button
                            type="button"
                            className={`btn-mat251-modo ${modo === 'matriz' ? 'active' : ''}`}
                            onClick={() => { setModo('matriz'); setAlerta({ isOpen: false, mensaje: '' }); }}
                            style={{ flex: 1, fontFamily: FONT, borderRadius: RADIUS }}
                        >
                            Análisis de Matriz
                        </button>
                        <button
                            type="button"
                            className={`btn-mat251-modo ${modo === 'manual' ? 'active' : ''}`}
                            onClick={() => { setModo('manual'); setAlerta({ isOpen: false, mensaje: '' }); }}
                            style={{ flex: 1, fontFamily: FONT, borderRadius: RADIUS }}
                        >
                            Modo Manual
                        </button>
                    </div>
                )}
            </div>

            <div className="tema3-card">
                {modo === 'matriz' && (modelo === 'Uniforme' || modelo === 'Normal' || modelo === 'ChiCuadrado' || modelo === 'TStudent' || modelo === 'FFisher') && (
                    <div style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', padding: '10px 15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', marginBottom: '15px' }}>
                            <div>
                                <span style={{ fontSize: FS.sm, fontWeight: 700, color: 'var(--text-pure)', margin: 0, fontFamily: FONT }}>Datos:</span>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '2px', flexWrap: 'wrap' }}>
                                    <small title="Datos provenientes de variables externas" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help', fontFamily: FONT }}>
                                        Cargados: <strong style={{ color: 'var(--text-pure)' }}>{statsDatos ? statsDatos.cargados : 0}</strong>
                                    </small>
                                    <small title="Datos ingresados manualmente" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help', fontFamily: FONT }}>
                                        Agregados: <strong style={{ color: 'var(--text-pure)' }}>{statsDatos ? statsDatos.agregados : 0}</strong>
                                    </small>
                                    <small title="Total de datos válidos" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help', fontFamily: FONT }}>
                                        Total: <strong style={{ color: 'var(--text-pure)' }}>{statsDatos ? statsDatos.total : 0}</strong>
                                    </small>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={abrirEditor}
                                className="btn-primary"
                                style={{
                                    borderRadius: RADIUS,
                                    fontSize: FS.sm,
                                    fontFamily: FONT,
                                    fontWeight: 600,
                                    padding: '5px 14px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    flexShrink: 0
                                }}
                            >
                                <EditarDatos />
                                Editar Datos
                            </button>
                        </div>
                        {columnasDisponibles.length > 0 ? (
                            <>
                                {/* Selector de columna: FFisher usa dos, resto uno */}
                                {modelo === 'FFisher' ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap', marginBottom: '15px' }}>
                                        <div style={{ width: '220px', minWidth: '180px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: FS.sm, fontWeight: 600, color: 'var(--text-pure)', marginBottom: '6px', fontFamily: FONT, whiteSpace: 'nowrap' }}>
                                                Grupo 1 {renderLatex('v_1 = n_1 - 1')}
                                            </label>
                                            <CustomSelect
                                                value={colActiva}
                                                onChange={val => {
                                                    const numVal = val === "" ? "" : Number(val);
                                                    if (numVal !== "" && numVal === columnaSeleccionada2) {
                                                        setColumnaSeleccionada2(columnaSeleccionada);
                                                    }
                                                    setColumnaSeleccionada(numVal);
                                                    setStatsEstimados(null);
                                                    setYaCalculado(false);
                                                    if (onCalcular) onCalcular(null);
                                                }}
                                                options={columnasDisponibles.map((col, idx) => ({ value: idx, label: col }))}
                                                placeholder="Seleccionar columna..."
                                            />
                                        </div>
                                        <div style={{ width: '220px', minWidth: '180px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: FS.sm, fontWeight: 600, color: 'var(--text-pure)', marginBottom: '6px', fontFamily: FONT, whiteSpace: 'nowrap' }}>
                                                Grupo 2 {renderLatex('v_2 = n_2 - 1')}
                                            </label>
                                            <CustomSelect
                                                value={colActiva2}
                                                onChange={val => {
                                                    const numVal = val === "" ? "" : Number(val);
                                                    if (numVal !== "" && numVal === columnaSeleccionada) {
                                                        setColumnaSeleccionada(columnaSeleccionada2);
                                                    }
                                                    setColumnaSeleccionada2(numVal);
                                                    setStatsEstimados(null);
                                                    setYaCalculado(false);
                                                    if (onCalcular) onCalcular(null);
                                                }}
                                                options={columnasDisponibles.map((col, idx) => ({ value: idx, label: col }))}
                                                placeholder="Seleccionar columna..."
                                            />
                                        </div>
                                    </div>
                                ) : columnasDisponibles.length > 1 ? (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '15px' }}>
                                        <label style={{ fontSize: FS.sm, fontWeight: 600, color: 'var(--text-pure)', margin: 0, whiteSpace: 'nowrap', fontFamily: FONT }}>
                                            Columna:
                                        </label>
                                        <div style={{ width: '200px' }}>
                                            <CustomSelect
                                                value={colActiva}
                                                onChange={val => {
                                                    const numVal = val === "" ? "" : Number(val);
                                                    setColumnaSeleccionada(numVal);
                                                    setStatsEstimados(null);
                                                    setYaCalculado(false);
                                                    if (onCalcular) onCalcular(null);
                                                }}
                                                options={columnasDisponibles.map((col, idx) => ({ value: idx, label: col }))}
                                                placeholder="Seleccionar columna..."
                                            />
                                        </div>
                                    </div>
                                ) : null}

                                <button
                                    type="button"
                                    className="button_calcular"
                                    onClick={estimarDesdeDatos}
                                    style={{
                                        width: 'fit-content',
                                        margin: '0 auto 12px auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '5px 20px',
                                        borderRadius: RADIUS,
                                        fontSize: FS.sm,
                                        fontWeight: 600,
                                        fontFamily: FONT,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Estimar Parámetros
                                </button>

                                {statsEstimados && (
                                    <div className="t3-tabla-estimados-wrapper">
                                        <table className="t3-tabla-estimados" style={{
                                            fontSize: FS.sm,
                                            fontFamily: FONT
                                        }}>
                                            <thead style={{ backgroundColor: 'var(--bg-input)' }}>
                                                <tr>
                                                    {modelo === 'FFisher' ? (
                                                        <>
                                                            <th className="t3-col-param-sm">
                                                                <StatLabel formulaKey="n_1" formulaLatex="n_1" customTexto="Tamaño de Muestra Grupo 1" align="center" position="top" />
                                                            </th>
                                                            <th className="t3-col-param-sm">
                                                                <StatLabel formulaKey="v_1" formulaLatex="v_1" customTexto="Grados de Libertad Grupo 1" align="center" position="top" />
                                                            </th>
                                                            <th className="t3-col-param-sm">
                                                                <StatLabel formulaKey="n_2" formulaLatex="n_2" customTexto="Tamaño de Muestra Grupo 2" align="center" position="top" />
                                                            </th>
                                                            <th className="t3-col-param-sm">
                                                                <StatLabel formulaKey="v_2" formulaLatex="v_2" customTexto="Grados de Libertad Grupo 2" align="center" position="top" />
                                                            </th>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <th className="t3-col-param-sm">
                                                                <StatLabel formulaKey="N" formulaLatex="N" align="center" position="top" />
                                                            </th>
                                                            {modelo === 'Uniforme' && (
                                                                <>
                                                                    <th className="t3-col-param-sm">
                                                                        <StatLabel formulaKey="a" formulaLatex="a" align="center" position="top" />
                                                                    </th>
                                                                    <th className="t3-col-param-sm">
                                                                        <StatLabel formulaKey="b" formulaLatex="b" align="center" position="top" />
                                                                    </th>
                                                                </>
                                                            )}
                                                            {modelo === 'Normal' && (
                                                                <>
                                                                    <th className="t3-col-param-sm">
                                                                        <StatLabel formulaKey="mu" formulaLatex="\mu" align="center" position="top" />
                                                                    </th>
                                                                    <th className="t3-col-param-sm">
                                                                        <StatLabel formulaKey="sigma" formulaLatex="\sigma" align="center" position="top" />
                                                                    </th>
                                                                </>
                                                            )}
                                                            {(modelo === 'ChiCuadrado' || modelo === 'TStudent') && (
                                                                <th className="t3-col-param-sm">
                                                                    <StatLabel formulaKey="v" formulaLatex="v" align="center" position="top" />
                                                                </th>
                                                            )}
                                                        </>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr style={{ backgroundColor: 'var(--bg-card)' }}>
                                                    {modelo === 'FFisher' ? (
                                                        <>
                                                            <td className="t3-col-param-sm" style={{ fontSize: FS.md, fontWeight: 'normal' }}>
                                                                {renderLatex(`${statsEstimados.total1}`)}
                                                            </td>
                                                            <td className="t3-col-param-sm" style={{ fontSize: FS.md, fontWeight: 'normal' }}>
                                                                {renderLatex(`${statsEstimados.v1}`)}
                                                            </td>
                                                            <td className="t3-col-param-sm" style={{ fontSize: FS.md, fontWeight: 'normal' }}>
                                                                {renderLatex(`${statsEstimados.total2}`)}
                                                            </td>
                                                            <td className="t3-col-param-sm" style={{ fontSize: FS.md, fontWeight: 'normal' }}>
                                                                {renderLatex(`${statsEstimados.v2}`)}
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="t3-col-param-sm" style={{ fontSize: FS.md, fontWeight: 'normal' }}>
                                                                {renderLatex(`${statsEstimados.total}`)}
                                                            </td>
                                                            {modelo === 'Uniforme' && (
                                                                <>
                                                                    <td className="t3-col-param-sm" style={{ fontSize: FS.md, fontWeight: 'normal' }}>
                                                                        {renderLatex(`${statsEstimados.min?.toFixed(4)}`)}
                                                                    </td>
                                                                    <td className="t3-col-param-sm" style={{ fontSize: FS.md, fontWeight: 'normal' }}>
                                                                        {renderLatex(`${statsEstimados.max?.toFixed(4)}`)}
                                                                    </td>
                                                                </>
                                                            )}
                                                            {modelo === 'Normal' && (
                                                                <>
                                                                    <td className="t3-col-param-sm" style={{ fontSize: FS.md, fontWeight: 'normal' }}>
                                                                        {renderLatex(`${statsEstimados.media?.toFixed(4)}`)}
                                                                    </td>
                                                                    <td className="t3-col-param-sm" style={{ fontSize: FS.md, fontWeight: 'normal' }}>
                                                                        {renderLatex(`${statsEstimados.desviacion?.toFixed(4)}`)}
                                                                    </td>
                                                                </>
                                                            )}
                                                            {(modelo === 'ChiCuadrado' || modelo === 'TStudent') && (
                                                                <td className="t3-col-param-sm" style={{ fontSize: FS.md, fontWeight: 'normal' }}>
                                                                    {renderLatex(`${statsEstimados.n}`)}
                                                                </td>
                                                            )}
                                                        </>
                                                    )}
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>

                        ) : (
                            <p style={{ fontSize: FS.xs, color: 'var(--text-muted)', fontFamily: FONT }}>No hay datos cargados en el estado global. Ve a Gestión de Datos para importar.</p>
                        )}
                    </div>
                )}

                {(modo === 'manual' || (modo === 'matriz' && statsEstimados)) && (
                    <>
                        {renderParametrosManuales()}

                        {(modelo === 'Uniforme' || modelo === 'Normal' || modelo === 'NormalEstandar' || modelo === 'ChiCuadrado' || modelo === 'FFisher' || modelo === 'TStudent') && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0px' }}>
                                <button className="button_calcular" onClick={() => manejarCalculo(true)} style={{ width: 'fit-content', padding: '5px 20px', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: RADIUS, fontSize: FS.sm, fontWeight: 'bold', fontFamily: FONT, cursor: 'pointer' }}>
                                    GRAFICAR
                                </button>
                            </div>
                        )}
                    </>
                )}

                {yaCalculado && (modo === 'manual' || (modo === 'matriz' && statsEstimados)) && (
                    <>
                        <div style={{ margin: '15px 0 5px 0' }}></div>

                        <h4 style={{ color: 'var(--text-pure)', fontSize: FS.md, margin: '0 0 12px 0', fontFamily: FONT, fontWeight: 700 }}>Condición de Búsqueda:</h4>

                        {/* Toggle de Modo de Cálculo */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                            <div className="contenedor-selector-modos-mat251" style={{ display: 'flex', width: '100%', maxWidth: '350px' }}>
                                <button 
                                    type="button"
                                    className={`btn-mat251-modo ${calcMode === 'directa' ? 'active' : ''}`}
                                    onClick={() => {
                                        setCalcMode('directa');
                                        limpiarCondicionCalculada();
                                    }}
                                    style={{ flex: 1, fontFamily: FONT }}
                                >
                                    Calcular Probabilidad
                                </button>
                                <button 
                                    type="button"
                                    className={`btn-mat251-modo ${calcMode === 'inversa' ? 'active' : ''}`}
                                    onClick={() => {
                                        setCalcMode('inversa');
                                        limpiarCondicionCalculada();
                                    }}
                                    style={{ flex: 1, fontFamily: FONT }}
                                >
                                    Calcular Valor Inverso
                                </button>
                            </div>
                        </div>

                        {/* FILA 1: Condición lógica y su dropdown en una sola fila centrada */}
                        <div className="t3-condicion-fila">
                            <label className="t3-condicion-label">
                                {calcMode === 'inversa' ? 'Condición inversa:' : 'Condición lógica:'}
                            </label>
                            <div className="t3-condicion-select-wrapper" style={{ width: tipoCondicion === 'suma_intervalos' ? '210px' : (calcMode === 'inversa' ? '200px' : '170px') }}>
                                <CustomSelect
                                    value={tipoCondicion}
                                    onChange={val => { 
                                        setTipoCondicion(val); 
                                        limpiarCondicionCalculada();
                                    }}
                                    options={(() => {
                                        const isContinua = true; 
                                        const vari = modelo === 'NormalEstandar' ? 'Z' : (modelo === 'ChiCuadrado' ? '\\chi^2' : (modelo === 'FFisher' ? 'F' : (modelo === 'TStudent' ? 'T' : 'X')));
                                        const val = modelo === 'NormalEstandar' ? 'z' : (modelo === 'TStudent' ? 't' : (modelo === 'FFisher' ? 'x' : 'x'));

                                        if (calcMode === 'directa') {
                                            const opts = [];
                                            if (!isContinua) {
                                                opts.push({ value: 'igual', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{renderLatex(`P(${vari} = ${val})`)}</div> });
                                            }
                                            
                                            // Cola Izquierda
                                            opts.push({ value: 'menor_igual', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{renderLatex(`P(${vari} \\leq ${val})`)}</div> });
                                            if (!isContinua) {
                                                opts.push({ value: 'menor', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{renderLatex(`P(${vari} < ${val})`)}</div> });
                                            }

                                            // Cola Derecha
                                            opts.push({ value: 'mayor_igual', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{renderLatex(`P(${vari} \\geq ${val})`)}</div> });
                                            if (!isContinua) {
                                                opts.push({ value: 'mayor', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{renderLatex(`P(${vari} > ${val})`)}</div> });
                                            }

                                            // Intervalos
                                            opts.push({ value: 'entre', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{renderLatex(isContinua ? `P(a \\leq ${vari} \\leq b)` : `P(a < ${vari} < b)`)}</div> });
                                            opts.push({ value: 'exterior', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{renderLatex(isContinua ? `P(a > ${vari} > b)` : `P(${vari} < a \\cup ${vari} > b)`)}</div> });
                                            opts.push({ value: 'suma_intervalos', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{renderLatex(`P(a_i \\leq ${vari} \\leq b_i) + \\dots`)}</div> });
                                            
                                            return opts;
                                        } else {
                                            return [
                                                { value: 'inversa_menor', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{renderLatex(isContinua ? `P(${vari} \\leq c) = p` : `P(${vari} < c) = p`)}</div> },
                                                { value: 'inversa_mayor', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{renderLatex(isContinua ? `P(${vari} \\geq c) = p` : `P(${vari} > c) = p`)}</div> },
                                                { value: 'inversa_entre', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{renderLatex(isContinua ? `P(c_1 \\leq ${vari} \\leq c_2) = p` : `P(c_1 < ${vari} < c_2) = p`)}</div> },
                                                { value: 'inversa_exterior', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{renderLatex(isContinua ? `P(c_1 > ${vari} > c_2) = p` : `P(${vari} < c_1 \\cup ${vari} > c_2) = p`)}</div> }
                                            ];
                                        }
                                    })()}
                                />
                            </div>
                        </div>

                        {/* FILA 2: Valor(es) x (y b si intervalo) o p para inversa */}
                        {calcMode === 'inversa' && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                flexWrap: 'nowrap',
                                justifyContent: 'center',
                                gap: '10px',
                                marginBottom: '14px',
                                width: '100%',
                                maxWidth: '200px',
                                margin: '0 auto 14px auto',
                                boxSizing: 'border-box'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                                    <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                        {renderLatex('\\mathbf{p}:')}
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.0001"
                                        max="0.9999"
                                        className="input-mat251 placeholder-small"
                                        value={valorP}
                                        onChange={e => {
                                            setValorP(e.target.value);
                                            limpiarCondicionCalculada();
                                        }}
                                        placeholder="Probabilidad"
                                        style={{
                                            padding: '6px 12px',
                                            fontSize: FS.sm,
                                            fontFamily: FONT,
                                            borderRadius: RADIUS,
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-input)',
                                            color: 'var(--text-pure)',
                                            height: '36px',
                                            flex: 1,
                                            minWidth: 0,
                                            textAlign: 'center',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {calcMode === 'directa' && tipoCondicion !== 'suma_intervalos' && (
                            <div style={{
                                display: 'flex',
                                flexDirection: 'row',
                                flexWrap: 'nowrap',
                                justifyContent: 'center',
                                gap: '10px',
                                marginBottom: '14px',
                                width: '100%',
                                maxWidth: ['entre', 'intervalo', 'exterior'].includes(tipoCondicion) ? '360px' : '200px',
                                margin: '0 auto 14px auto',
                                boxSizing: 'border-box'
                            }}>
                                {/* x o a */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                                    <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                        {['entre', 'intervalo', 'exterior'].includes(tipoCondicion)
                                            ? renderLatex('\\mathbf{a}:')
                                            : renderLatex(`\\mathbf{${modelo === 'NormalEstandar' ? 'z' : (modelo === 'ChiCuadrado' ? '\\chi^2' : (modelo === 'FFisher' ? 'F' : (modelo === 'TStudent' ? 't' : 'x')))}:}`)}
                                    </label>
                                    <input
                                        type="number"
                                        step="any"
                                        className="input-mat251 placeholder-small"
                                        value={valorX}
                                        onChange={e => {
                                            setValorX(e.target.value);
                                            limpiarCondicionCalculada();
                                        }}
                                        placeholder={
                                            tipoCondicion === 'exterior' ? 'Límite izquierdo'
                                                : ['entre', 'intervalo'].includes(tipoCondicion) ? 'Límite inferior'
                                                    : 'Valor'
                                        }
                                        style={{
                                            padding: '6px 12px',
                                            fontSize: FS.sm,
                                            fontFamily: FONT,
                                            borderRadius: RADIUS,
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-input)',
                                            color: 'var(--text-pure)',
                                            height: '36px',
                                            flex: 1,
                                            minWidth: 0,
                                            textAlign: 'center',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                {/* b (solo si entre, exterior o intervalo) */}
                                {['entre', 'exterior', 'intervalo'].includes(tipoCondicion) && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                                        <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                            {renderLatex('\\mathbf{b}:')}
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            className="input-mat251 placeholder-small"
                                            value={valorX2}
                                            onChange={e => {
                                                setValorX2(e.target.value);
                                                limpiarCondicionCalculada();
                                            }}
                                            placeholder={tipoCondicion === 'exterior' ? 'Límite derecho' : 'Límite superior'}
                                            style={{
                                                padding: '6px 12px',
                                                fontSize: FS.sm,
                                                fontFamily: FONT,
                                                borderRadius: RADIUS,
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-input)',
                                                color: 'var(--text-pure)',
                                                height: '36px',
                                                flex: 1,
                                                minWidth: 0,
                                                textAlign: 'center',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Interfaz para Suma de Intervalos */}
                        {calcMode === 'directa' && tipoCondicion === 'suma_intervalos' && (
                            <div className="t3-tabla-intervalos-wrapper">
                                <div className="t3-tabla-intervalos-card">
                                    <table className="t3-tabla-intervalos" style={{ fontFamily: FONT }}>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '20%', fontSize: FS.sm }}>Intervalo</th>
                                                <th style={{ width: '35%', fontSize: FS.sm }}>
                                                    <StatLabel formulaKey="a_i" formulaLatex="a_i" customTexto="Límite Inferior" customMath="a_i" align="center" position="bottom" />
                                                </th>
                                                <th style={{ width: '35%', fontSize: FS.sm }}>
                                                    <StatLabel formulaKey="b_i" formulaLatex="b_i" customTexto="Límite Superior" customMath="b_i" align="center" position="bottom" />
                                                </th>
                                                <th style={{ width: '10%', fontSize: FS.sm }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {intervals.map((inv, index) => (
                                                <tr key={inv.id}>
                                                    <td className="td-intervalo-idx" style={{ fontSize: FS.sm }}>
                                                        {index + 1}
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={inv.min}
                                                            onChange={e => {
                                                                const newIntervals = [...intervals];
                                                                newIntervals[index].min = e.target.value;
                                                                setIntervals(newIntervals);
                                                                limpiarCondicionCalculada();
                                                            }}
                                                            placeholder="Inferior"
                                                            className="input-mat251 placeholder-small"
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={inv.max}
                                                            onChange={e => {
                                                                const newIntervals = [...intervals];
                                                                newIntervals[index].max = e.target.value;
                                                                setIntervals(newIntervals);
                                                                limpiarCondicionCalculada();
                                                            }}
                                                            placeholder="Superior"
                                                            className="input-mat251 placeholder-small"
                                                        />
                                                    </td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="btn-eliminar-fila-mat251"
                                                            onClick={() => {
                                                                if (intervals.length > 1) {
                                                                    setIntervals(intervals.filter(i => i.id !== inv.id));
                                                                    limpiarCondicionCalculada();
                                                                }
                                                            }}
                                                            disabled={intervals.length === 1}
                                                            title="Eliminar intervalo"
                                                            style={{
                                                                padding: '4px',
                                                                borderRadius: RADIUS,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                margin: '0 auto'
                                                            }}
                                                        >
                                                            <IconoBasura width="16" height="16" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={() => {
                                        setIntervals([...intervals, { id: Date.now(), min: '', max: '' }]);
                                        limpiarCondicionCalculada();
                                    }}
                                    style={{
                                        padding: '5px 20px',
                                        borderRadius: RADIUS,
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: FS.sm,
                                        fontFamily: FONT,
                                        width: 'fit-content',
                                        margin: '0 auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    Agregar otro intervalo
                                </button>
                            </div>
                        )}

                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <button
                                className="button_calcular"
                                onClick={() => manejarCalculo(false)}
                                style={{
                                    width: 'fit-content',
                                    padding: '5px 20px',
                                    borderRadius: RADIUS,
                                    fontSize: FS.md,
                                    fontWeight: 'bold',
                                    fontFamily: FONT,
                                    cursor: 'pointer'
                                }}
                            >
                                CALCULAR CONDICIÓN
                            </button>
                        </div>
                    </>
                )}

                {/* SECCIÓN DE GRAFICADO Y RESULTADOS */}
                <div style={{ margin: '20px 0' }}>
                    {children}
                </div>
            </div>
            <ModalAlerta
                isOpen={alerta.isOpen}
                mensaje={alerta.mensaje}
                onClose={() => setAlerta({ ...alerta, isOpen: false })}
            />
        </div>
    );
}

function CustomSelect({ value, onChange, options = [], placeholder = "Seleccionar..." }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const selectRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value);
    const displayText = selectedOption ? selectedOption.label : placeholder;

    return (
        <div ref={selectRef} style={{ position: 'relative', width: '100%', fontFamily: FONT }}>
            <div
                className="custom-select-trigger"
                onClick={() => setIsOpen(o => !o)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    minHeight: '38px',
                    boxSizing: 'border-box',
                    background: 'var(--bg-input, white)',
                    border: `1px solid ${isOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    borderRadius: RADIUS,
                    cursor: 'pointer',
                    boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    color: 'var(--text-pure)',
                    userSelect: 'none',
                    fontSize: FS.sm,
                    fontFamily: FONT
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', flex: 1, minWidth: 0 }}>
                    <span style={{
                        fontWeight: 500,
                        fontSize: FS.sm,
                        color: selectedOption ? 'var(--text-pure)' : 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {displayText}
                    </span>
                </div>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        color: 'var(--text-muted, #64748b)',
                        flexShrink: 0
                    }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        background: 'var(--bg-card, white)',
                        border: '1px solid var(--border-color)',
                        borderRadius: RADIUS,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                        zIndex: 1000,
                        maxHeight: '260px',
                        overflowY: 'auto',
                        animation: 'fadeInDropdown 0.2s ease'
                    }}
                    className="thin-scrollbar"
                >
                    {options.length === 0 ? (
                        <div style={{ padding: '9px 12px', color: 'var(--text-muted)', fontSize: FS.sm, fontStyle: 'italic', fontFamily: FONT }}>
                            Sin opciones
                        </div>
                    ) : (
                        options.map((op, idx) => {
                            const active = value === op.value;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => { onChange(op.value); setIsOpen(false); }}
                                    onMouseEnter={e => {
                                        if (!active) {
                                            e.currentTarget.style.background = 'var(--bg-input, rgba(0,0,0,0.04))';
                                            e.currentTarget.style.color = 'var(--primary-color)';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!active) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = 'var(--text-pure)';
                                        }
                                    }}
                                    style={{
                                        padding: '9px 12px',
                                        fontSize: FS.sm,
                                        fontFamily: FONT,
                                        color: active ? 'var(--primary-color)' : 'var(--text-pure)',
                                        fontWeight: active ? 600 : 400,
                                        background: active ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        transition: 'background 0.15s ease, color 0.15s ease',
                                        borderBottom: idx < options.length - 1 ? '1px solid var(--border-color)' : 'none',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {op.label}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
