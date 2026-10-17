import React, { useState, useEffect, useMemo } from 'react';
import '../../../styles/Temas/Tema3.css';
import { calcularDistribucionModelo, generarDatosGrafico } from '../../../Matematicas/logica_Tema3';
import ModalAlerta from '../../../ui/ModalAlerta';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { FONT, FS, RADIUS } from '../../../Principal/Constantes';
import { EditarDatos } from '../../../../../ui/iconos';
import StatLabel from '../../../ui/StatLabel';

export default function Controles_ModelosDiscretos({
    varSeleccionada,
    filas,
    statsDatos,
    abrirEditor,
    onCalcular,
    children
}) {
    const initialModelosDiscretosState = {
        Bernoulli: {
            modo: 'matriz',
            manual: { p: '' },
            matriz: { col: 0, valorExito: '', stats: null, p: '' },
            condicion: { tipo: 'exacta', x: '', b: '' },
            yaCalculado: false
        },
        Binomial: {
            modo: 'matriz',
            manual: { n: '', p: '' },
            matriz: { col: 0, valorExito: '', modoEstimacion: 'especifico', nArriba: '', muestraN: '', stats: null, n: '', p: '' },
            condicion: { tipo: 'exacta', x: '', b: '' },
            yaCalculado: false
        },
        Poisson: {
            modo: 'matriz',
            manual: { lambda: '' },
            matriz: { col: 0, stats: null, lambda: '' },
            condicion: { tipo: 'exacta', x: '', b: '' },
            yaCalculado: false
        },
        Hipergeometrica: {
            modo: 'matriz',
            manual: { N: '', K: '', n: '' },
            matriz: { col: 0, valorExito: '', muestraN: '', stats: null, N: '', K: '', n: '' },
            condicion: { tipo: 'exacta', x: '', b: '' },
            yaCalculado: false
        }
    };

    const [modelo, setModelo] = useState('Bernoulli');
    const [modelosState, setModelosState] = useState(initialModelosDiscretosState);
    const [alerta, setAlerta] = useState({ isOpen: false, mensaje: '' });

    const activeState = modelosState[modelo] || initialModelosDiscretosState[modelo];
    const modo = activeState.modo;
    const yaCalculado = activeState.yaCalculado;

    // Parámetros según modo
    const isMatriz = modo === 'matriz';
    const paramP_ber = isMatriz ? (activeState.matriz.p ?? '') : (activeState.manual.p ?? '');
    const paramN_bin = isMatriz ? (activeState.matriz.n ?? '') : (activeState.manual.n ?? '');
    const paramP_bin = isMatriz ? (activeState.matriz.p ?? '') : (activeState.manual.p ?? '');
    const paramLambda = isMatriz ? (activeState.matriz.lambda ?? '') : (activeState.manual.lambda ?? '');
    const paramN_hip = isMatriz ? (activeState.matriz.N ?? '') : (activeState.manual.N ?? '');
    const paramK_hip = isMatriz ? (activeState.matriz.K ?? '') : (activeState.manual.K ?? '');
    const paramn_hip = isMatriz ? (activeState.matriz.n ?? '') : (activeState.manual.n ?? '');

    // Condición activa
    const tipoCondicion = activeState.condicion.tipo;
    const valorX = activeState.condicion.x;
    const valorB = activeState.condicion.b;

    // Matriz activa
    const columnaSeleccionada = activeState.matriz.col ?? 0;
    const valorExito = activeState.matriz.valorExito ?? '';
    const modoEstimacionBinomial = activeState.matriz.modoEstimacion ?? 'especifico';
    const statsEstimados = activeState.matriz.stats ?? null;
    const nArriba = activeState.matriz.nArriba ?? '';
    const muestraN = activeState.matriz.muestraN ?? '';

    const renderLatex = (str) => {
        return <span style={{ fontSize: '0.9em' }} dangerouslySetInnerHTML={{ __html: katex.renderToString(str, { throwOnError: false }) }} />;
    };

    const updateActive = (updater) => {
        setModelosState(prev => {
            const cur = prev[modelo] || initialModelosDiscretosState[modelo];
            const next = typeof updater === 'function' ? updater(cur) : { ...cur, ...updater };
            return { ...prev, [modelo]: next };
        });
    };

    const setModo = (nuevoModo) => {
        updateActive(cur => ({ ...cur, modo: nuevoModo }));
        if (onCalcular) onCalcular(null);
    };

    const setYaCalculado = (val) => {
        updateActive(cur => ({ ...cur, yaCalculado: val }));
    };

    const setTipoCondicion = (tipo) => {
        updateActive(cur => ({ ...cur, condicion: { ...cur.condicion, tipo } }));
    };

    const setValorX = (x) => {
        updateActive(cur => ({ ...cur, condicion: { ...cur.condicion, x } }));
    };

    const setValorB = (b) => {
        updateActive(cur => ({ ...cur, condicion: { ...cur.condicion, b } }));
    };

    const setParamP_ber = (p) => {
        updateActive(cur => ({ ...cur, manual: { ...cur.manual, p }, yaCalculado: false }));
    };

    const setParamN_bin = (n) => {
        updateActive(cur => ({ ...cur, manual: { ...cur.manual, n }, yaCalculado: false }));
    };

    const setParamP_bin = (p) => {
        updateActive(cur => ({ ...cur, manual: { ...cur.manual, p }, yaCalculado: false }));
    };

    const setParamLambda = (lambda) => {
        updateActive(cur => ({ ...cur, manual: { ...cur.manual, lambda }, yaCalculado: false }));
    };

    const setParamN_hip = (N) => {
        updateActive(cur => ({ ...cur, manual: { ...cur.manual, N }, yaCalculado: false }));
    };

    const setParamK_hip = (K) => {
        updateActive(cur => ({ ...cur, manual: { ...cur.manual, K }, yaCalculado: false }));
    };

    const setParamn_hip = (n) => {
        updateActive(cur => ({ ...cur, manual: { ...cur.manual, n }, yaCalculado: false }));
    };

    const setColumnaSeleccionada = (col) => {
        updateActive(cur => ({ ...cur, matriz: { ...cur.matriz, col }, yaCalculado: false }));
    };

    const setValorExito = (valorExito) => {
        updateActive(cur => ({ ...cur, matriz: { ...cur.matriz, valorExito }, yaCalculado: false }));
    };

    const setModoEstimacionBinomial = (modoEstimacion) => {
        updateActive(cur => ({ ...cur, matriz: { ...cur.matriz, modoEstimacion }, yaCalculado: false }));
    };

    const setStatsEstimados = (stats) => {
        updateActive(cur => ({ ...cur, matriz: { ...cur.matriz, stats } }));
    };

    const setNArriba = (nArriba) => {
        updateActive(cur => ({ ...cur, matriz: { ...cur.matriz, nArriba }, yaCalculado: false }));
    };

    const setMuestraN = (muestraN) => {
        updateActive(cur => ({ ...cur, matriz: { ...cur.matriz, muestraN }, yaCalculado: false }));
    };

    useEffect(() => {
        setModelosState(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(k => {
                next[k] = {
                    ...next[k],
                    matriz: { ...next[k].matriz, col: 0, valorExito: '', stats: null, p: '', n: '', lambda: '', N: '', K: '' },
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

    // Extraer datos de la matriz
    const columnasDisponibles = useMemo(() => {
        return (varSeleccionada?.nombresColumnas && varSeleccionada.nombresColumnas.length > 0)
            ? varSeleccionada.nombresColumnas
            : (varSeleccionada ? [varSeleccionada.nombre || 'Datos'] : []);
    }, [varSeleccionada]);

    const datosColumna = useMemo(() => {
        if (!varSeleccionada || !filas || filas.length === 0) return [];
        const validas = filas.filter(f => (f.valor || '').toString().trim() !== '');

        return validas.map(f => {
            if (varSeleccionada.nombresColumnas && varSeleccionada.nombresColumnas.length > 1) {
                const partes = (f.valor || '').toString().split(' | ');
                return partes[columnaSeleccionada] ? partes[columnaSeleccionada].trim() : '';
            }
            return (f.valor || '').toString().trim();
        }).filter(val => val !== '');
    }, [varSeleccionada, filas, columnaSeleccionada]);

    const esColumnaNumerica = useMemo(() => {
        if (datosColumna.length === 0) return false;
        return !isNaN(parseFloat(datosColumna[0]));
    }, [datosColumna]);

    const valoresUnicos = useMemo(() => {
        if (datosColumna.length === 0) return [];
        return [...new Set(datosColumna)].sort((a, b) => {
            const numA = parseFloat(a);
            const numB = parseFloat(b);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            return String(a).localeCompare(String(b));
        });
    }, [datosColumna]);

    // Estimar desde datos
    const estimarDesdeDatos = () => {
        if (datosColumna.length === 0) {
            setAlerta({ isOpen: true, mensaje: 'No hay datos válidos en la columna.' });
            return;
        }

        const totalDatos = datosColumna.length;
        let p = 0;
        let K = 0;
        let media = 0;

        if (modelo === 'Binomial') {
            const n_lote = parseInt(nArriba);
            if (isNaN(n_lote) || n_lote <= 0) {
                setAlerta({ isOpen: true, mensaje: <span>Por favor, ingresa el Tamaño del ensayo ({renderLatex('n')}) mayor a 0 antes de estimar.</span> });
                return;
            }

            const esTexto = isNaN(parseFloat(datosColumna[0]));

            if (esTexto || modoEstimacionBinomial === 'especifico') {
                // Modo 1: Evaluar un valor específico (o columna de texto)
                if (valorExito === '' || valorExito === null || valorExito === undefined) {
                    setAlerta({ isOpen: true, mensaje: <span>Debe seleccionar el &quot;Valor a evaluar ({renderLatex('x')})&quot;.</span> });
                    return;
                }

                const conteoExito = datosColumna.filter(v => {
                    const numV = parseFloat(v);
                    const numExito = parseFloat(valorExito);
                    if (!isNaN(numV) && !isNaN(numExito)) {
                        return numV === numExito;
                    }
                    return String(v).trim() === String(valorExito).trim();
                }).length;

                p = conteoExito / totalDatos;

                updateActive(cur => ({
                    ...cur,
                    matriz: {
                        ...cur.matriz,
                        stats: {
                            total: totalDatos,
                            exitos: conteoExito,
                            p: p
                        },
                        n: n_lote.toString(),
                        p: p.toFixed(4)
                    }
                }));
            } else {
                // Modo 2: "Datos como conteos por lote"
                const numeros = datosColumna.map(v => parseFloat(v)).filter(v => !isNaN(v));

                if (numeros.length === 0) {
                    setAlerta({ isOpen: true, mensaje: 'No hay datos numéricos válidos en la columna seleccionada.' });
                    return;
                }

                const tieneNegativos = numeros.some(v => v < 0);
                if (tieneNegativos) {
                    setAlerta({ isOpen: true, mensaje: 'Los valores registrados en la columna no pueden ser menores a 0.' });
                    return;
                }

                const maxValor = Math.max(...numeros);
                if (maxValor > n_lote) {
                    setAlerta({
                        isOpen: true,
                        mensaje: (
                            <span>
                                El tamaño del lote ({renderLatex('n')}) no puede ser menor que los valores registrados en la columna (valor máximo encontrado: <strong>{maxValor}</strong>).
                            </span>
                        )
                    });
                    return;
                }

                const sumaTotal = numeros.reduce((acc, curr) => acc + curr, 0);
                const totalEnsayos = numeros.length * n_lote;
                p = sumaTotal / totalEnsayos;

                updateActive(cur => ({
                    ...cur,
                    matriz: {
                        ...cur.matriz,
                        stats: {
                            total: totalEnsayos,
                            exitos: sumaTotal,
                            p: p
                        },
                        n: n_lote.toString(),
                        p: p.toFixed(4)
                    }
                }));
            }
        } else if (modelo === 'Hipergeometrica' || modelo === 'Bernoulli') {
            if (modelo === 'Hipergeometrica') {
                const n_muestra = parseInt(muestraN);
                if (isNaN(n_muestra) || n_muestra <= 0) {
                    setAlerta({ isOpen: true, mensaje: <span>Por favor, ingresa la Muestra a extraer ({renderLatex('n')}) mayor a 0 antes de estimar.</span> });
                    return;
                }
                if (n_muestra > totalDatos) {
                    setAlerta({ isOpen: true, mensaje: <span>La muestra &quot;{renderLatex('n')}&quot; ({n_muestra}) no puede ser mayor que la población total &quot;{renderLatex('N')}&quot; ({totalDatos}).</span> });
                    return;
                }
            }

            if (!valorExito) {
                setAlerta({ isOpen: true, mensaje: 'Debe seleccionar qué valor representa el "Éxito".' });
                return;
            }
            const conteoExito = datosColumna.filter(v => v === valorExito).length;
            p = conteoExito / totalDatos;
            K = conteoExito;

            if (modelo === 'Bernoulli') {
                updateActive(cur => ({
                    ...cur,
                    matriz: {
                        ...cur.matriz,
                        stats: {
                            total: totalDatos,
                            exitos: conteoExito,
                            p: p,
                            K: K
                        },
                        p: p.toFixed(4)
                    }
                }));
            } else {
                updateActive(cur => ({
                    ...cur,
                    matriz: {
                        ...cur.matriz,
                        stats: {
                            total: totalDatos,
                            exitos: conteoExito,
                            p: p,
                            K: K
                        },
                        N: totalDatos.toString(),
                        K: K.toString(),
                        n: muestraN.toString()
                    }
                }));
            }
        } else if (modelo === 'Poisson') {
            const numeros = datosColumna.map(v => parseFloat(v)).filter(v => !isNaN(v));
            if (numeros.length === 0) {
                setAlerta({ isOpen: true, mensaje: 'Para Poisson se requieren datos numéricos.' });
                return;
            }
            const sum = numeros.reduce((acc, curr) => acc + curr, 0);
            media = sum / numeros.length;

            updateActive(cur => ({
                ...cur,
                matriz: {
                    ...cur.matriz,
                    stats: {
                        total: numeros.length,
                        suma: sum,
                        media: media
                    },
                    lambda: media.toFixed(2)
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

        // Parsear parámetros
        let params = {};

        if (modelo === 'Binomial') {
            const n = parseIntNum(paramN_bin);
            const p = parseNum(paramP_bin);
            if (isNaN(n) || n <= 0) return setAlerta({ isOpen: true, mensaje: <span>En Binomial, &quot;{renderLatex('n')}&quot; debe ser entero positivo.</span> });
            if (isNaN(p) || p < 0 || p > 1) return setAlerta({ isOpen: true, mensaje: <span>En Binomial, &quot;{renderLatex('p')}&quot; debe estar entre 0 y 1.</span> });
            params = { n, p };
        } else if (modelo === 'Poisson') {
            const lambda = parseNum(paramLambda);
            if (isNaN(lambda) || lambda <= 0) return setAlerta({ isOpen: true, mensaje: <span>En Poisson, lambda ({renderLatex('\\lambda')}) debe ser mayor a 0.</span> });
            params = { lambda };
        } else if (modelo === 'Hipergeometrica') {
            const N = parseIntNum(paramN_hip);
            const K = parseIntNum(paramK_hip);
            const n = parseIntNum(paramn_hip);
            if (isNaN(n) || n <= 0) return setAlerta({ isOpen: true, mensaje: <span>Por favor, ingresa un tamaño de muestra ({renderLatex('n')}) mayor a 0 para generar la gráfica.</span> });
            if (isNaN(N) || N <= 0) return setAlerta({ isOpen: true, mensaje: <span>{renderLatex('N')} (población) debe ser entero positivo.</span> });
            if (isNaN(K) || K < 0 || K > N) return setAlerta({ isOpen: true, mensaje: <span>{renderLatex('K')} (éxitos) debe estar entre 0 y {renderLatex('N')}.</span> });
            if (n <= 0 || K < 0 || N <= 0 || n > N || K > N) return setAlerta({ isOpen: true, mensaje: <span>Parámetros Hipergeométrica inválidos. {renderLatex('n, K \\leq N')}, etc.</span> });
            params = { N, K, n };
        } else if (modelo === 'Bernoulli') {
            const p = parseNum(paramP_ber);
            if (isNaN(p) || p < 0 || p > 1) return setAlerta({ isOpen: true, mensaje: <span>La probabilidad {renderLatex('p')} debe estar entre 0 y 1.</span> });
            params = { p };
        }

        // Parsear condición
        let condicionCalculo = null;
        let condicionVisual = null;
        if (!isGraficarOnly && valorX !== '') {
            let x = parseIntNum(valorX);
            if (isNaN(x) || x < 0) return setAlerta({ isOpen: true, mensaje: <span>El valor objetivo &quot;{renderLatex('x')}&quot; debe ser un entero no negativo.</span> });
            if (modelo === 'Bernoulli' && x !== 0 && x !== 1) return setAlerta({ isOpen: true, mensaje: <span>En el modelo Bernoulli, {renderLatex('x')} solo puede ser <strong>0</strong> (fracaso) o <strong>1</strong> (éxito).</span> });

            let b = 0;
            if (tipoCondicion.includes('intervalo')) {
                if (valorB === '') {
                    return setAlerta({ isOpen: true, mensaje: <span>Por favor, ingresa el <strong>Límite Superior {renderLatex('b')}</strong> para el intervalo de búsqueda.</span> });
                }
                b = parseIntNum(valorB);
                if (isNaN(b) || b <= x) return setAlerta({ isOpen: true, mensaje: 'El límite superior del intervalo debe ser mayor que el límite inferior.' });
            }

            condicionVisual = { tipo: tipoCondicion, valorX: x, valorB: b };

            // Lógica de traducción estricta a inclusiva
            let tipoAjustado = tipoCondicion;
            switch (tipoCondicion) {
                case 'menor_estricto':
                    x = x - 1;
                    if (x < 0) return setAlerta({ isOpen: true, mensaje: <span>Al evaluar {renderLatex('P(X < x)')}, el límite inclusivo ({renderLatex('x-1')}) es negativo. La probabilidad es 0.</span> });
                    tipoAjustado = 'menor_igual';
                    break;
                case 'mayor_estricto':
                    x = x + 1;
                    tipoAjustado = 'mayor_igual';
                    break;
                case 'intervalo_estricto':
                    x = x + 1;
                    b = b - 1;
                    if (b < x) return setAlerta({ isOpen: true, mensaje: 'El intervalo estricto ingresado no contiene ningún número entero válido.' });
                    tipoAjustado = 'intervalo';
                    break;
                default:
                    break;
            }

            // Validar límites de x según modelo
            if (modelo === 'Binomial' && x > params.n) return setAlerta({ isOpen: true, mensaje: <span>&quot;{renderLatex('x')}&quot; ajustado no puede ser mayor que {renderLatex('n')} ({params.n}).</span> });
            if (modelo === 'Hipergeometrica' && x > Math.min(params.K, params.n)) {
                return setAlerta({ isOpen: true, mensaje: <span>&quot;{renderLatex('x')}&quot; ajustado no puede ser mayor que el mínimo entre {renderLatex('K')} y {renderLatex('n')} ({Math.min(params.K, params.n)}).</span> });
            }

            condicionCalculo = { tipo: tipoAjustado, valorX: x, valorB: b };
        } else {
            if (isGraficarOnly !== true) {
                return setAlerta({ isOpen: true, mensaje: <span>Por favor, ingresa el <strong>Número de éxitos {renderLatex('x')}</strong> para la Condición de Búsqueda.</span> });
            }
        }

        // Calcular
        const resultados = calcularDistribucionModelo(modelo, params, condicionCalculo);
        const datosGrafico = generarDatosGrafico(modelo, params);

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
        const readOnlyParams = isMatriz;

        const disabledStyle = {
            backgroundColor: 'var(--bg-input, #f1f5f9)',
            color: 'var(--text-muted, #475569)',
            border: '1px dashed var(--border-color, #94a3b8)',
            cursor: 'not-allowed',
            fontWeight: 600
        };

        return (
            <div className="tema3-grid" style={{ marginBottom: '5px', gap: '10px' }}>
                {modelo === 'Bernoulli' && (
                    <>
                        <div className="tema3-form-group" style={{ marginBottom: '0', gridColumn: '1 / -1', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                {renderLatex('\\mathbf{p}:')}
                            </label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                step="0.01" min="0" max="1"
                                value={paramP_ber}
                                onChange={e => {
                                    setParamP_ber(e.target.value);
                                    if (onCalcular) onCalcular(null);
                                }}
                                placeholder="Probabilidad"
                                disabled={readOnlyParams}
                                style={{
                                    ...readOnlyParams ? disabledStyle : {},
                                    padding: '6px 12px',
                                    fontSize: FS.sm,
                                    fontFamily: FONT,
                                    borderRadius: RADIUS,
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-input)',
                                    color: 'var(--text-pure)',
                                    width: '180px',
                                    textAlign: 'center'
                                }}
                            />
                        </div>
                        <div className="t3-formula-scroll" style={{ gridColumn: '1 / -1', display: 'block', color: 'var(--text-pure)', padding: '8px', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '15px auto 0 auto', maxWidth: '100%', boxSizing: 'border-box' }}>
                            <div className="t3-formula-inner">
                                {renderLatex(paramP_ber !== '' ? `P(X=x) = p^x (1 - p)^{1-x} \\quad \\implies \\quad ${paramP_ber}^x (1 - ${paramP_ber})^{1-x}` : `P(X=x) = p^x (1 - p)^{1-x}`)}
                            </div>
                        </div>
                    </>
                )}
                {modelo === 'Binomial' && (
                    <>
                        <div className="t3-parametros-fila-manual" style={{
                            gridColumn: '1 / -1',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '16px',
                            width: '100%',
                            maxWidth: '360px',
                            margin: '0 auto',
                            flexWrap: 'nowrap'
                        }}>
                            <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}>
                                <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                    {renderLatex('\\mathbf{n}:')}
                                </label>
                                <input
                                    type="number"
                                    className="input-mat251 placeholder-small"
                                    min="1"
                                    value={paramN_bin}
                                    onChange={e => {
                                        setParamN_bin(e.target.value);
                                        setYaCalculado(false);
                                        if (onCalcular) onCalcular(null);
                                    }}
                                    placeholder="Muestra total"
                                    disabled={readOnlyParams}
                                    style={{
                                        ...readOnlyParams ? disabledStyle : {},
                                        padding: '6px 8px',
                                        fontSize: FS.sm,
                                        fontFamily: FONT,
                                        borderRadius: RADIUS,
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-input)',
                                        color: 'var(--text-pure)',
                                        width: '100%',
                                        maxWidth: '130px',
                                        minWidth: '0',
                                        textAlign: 'center',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}>
                                <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                    {renderLatex('\\mathbf{p}:')}
                                </label>
                                <input
                                    type="number"
                                    className="input-mat251 placeholder-small"
                                    step="0.01" min="0" max="1"
                                    value={paramP_bin}
                                    onChange={e => {
                                        setParamP_bin(e.target.value);
                                        setYaCalculado(false);
                                        if (onCalcular) onCalcular(null);
                                    }}
                                    placeholder="Probabilidad"
                                    disabled={readOnlyParams}
                                    style={{
                                        ...readOnlyParams ? disabledStyle : {},
                                        padding: '6px 8px',
                                        fontSize: FS.sm,
                                        fontFamily: FONT,
                                        borderRadius: RADIUS,
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-input)',
                                        color: 'var(--text-pure)',
                                        width: '100%',
                                        maxWidth: '130px',
                                        minWidth: '0',
                                        textAlign: 'center',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="t3-formula-scroll" style={{ gridColumn: '1 / -1', display: 'block', color: 'var(--text-pure)', padding: '8px', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '15px auto 0 auto', maxWidth: '100%', boxSizing: 'border-box' }}>
                            <div className="t3-formula-inner">
                                {renderLatex((paramN_bin !== '' && paramP_bin !== '') ? `P(X=x) = \\binom{n}{x} p^x (1 - p)^{n-x} \\quad \\implies \\quad \\binom{${paramN_bin}}{x} ${paramP_bin}^x (1 - ${paramP_bin})^{${paramN_bin}-x}` : `P(X=x) = \\binom{n}{x} p^x (1 - p)^{n-x}`)}
                            </div>
                        </div>
                    </>
                )}
                {modelo === 'Poisson' && (
                    <>
                        <div className="tema3-form-group" style={{ marginBottom: '0', gridColumn: '1 / -1', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                {renderLatex('\\mathbf{\\lambda}:')}
                            </label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                step="0.1" min="0"
                                value={paramLambda}
                                onChange={e => {
                                    setParamLambda(e.target.value);
                                    if (onCalcular) onCalcular(null);
                                }}
                                placeholder="Tasa media"
                                disabled={readOnlyParams}
                                style={{
                                    ...readOnlyParams ? disabledStyle : {},
                                    padding: '6px 12px',
                                    fontSize: FS.sm,
                                    fontFamily: FONT,
                                    borderRadius: RADIUS,
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-input)',
                                    color: 'var(--text-pure)',
                                    width: '180px',
                                    textAlign: 'center'
                                }}
                            />
                        </div>
                        <div className="t3-formula-scroll" style={{ gridColumn: '1 / -1', display: 'block', color: 'var(--text-pure)', padding: '8px', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '15px auto 0 auto', maxWidth: '100%', boxSizing: 'border-box' }}>
                            <div className="t3-formula-inner">
                                {renderLatex(paramLambda !== '' ? `P(X=x) = \\frac{\\lambda^x e^{-\\lambda}}{x!} \\quad \\implies \\quad \\frac{${paramLambda}^x e^{-${paramLambda}}}{x!}` : `P(X=x) = \\frac{\\lambda^x e^{-\\lambda}}{x!}`)}
                            </div>
                        </div>
                    </>
                )}
                {modelo === 'Hipergeometrica' && (
                    <>
                        <div className="t3-grid-hipergeometrica">
                            <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, width: '100%' }}>
                                <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', minWidth: '24px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                    {renderLatex('\\mathbf{N}')}:
                                </label>
                                <input
                                    type="number"
                                    className="input-mat251 placeholder-small"
                                    min="1"
                                    value={paramN_hip}
                                    onChange={e => {
                                        setParamN_hip(e.target.value);
                                        if (onCalcular) onCalcular(null);
                                    }}
                                    placeholder="Población"
                                    disabled={readOnlyParams}
                                    style={{
                                        ...readOnlyParams ? disabledStyle : {},
                                        padding: '8px 12px',
                                        fontSize: FS.sm,
                                        fontFamily: FONT,
                                        borderRadius: RADIUS,
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-input)',
                                        color: 'var(--text-pure)',
                                        flex: 1,
                                        minWidth: 0,
                                        width: '100%',
                                        height: '38px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, width: '100%' }}>
                                <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', minWidth: '24px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                    {renderLatex('\\mathbf{N_1}')}:
                                </label>
                                <input
                                    type="number"
                                    className="input-mat251 placeholder-small"
                                    min="0"
                                    value={paramK_hip}
                                    onChange={e => {
                                        setParamK_hip(e.target.value);
                                        if (onCalcular) onCalcular(null);
                                    }}
                                    placeholder="Éxitos"
                                    disabled={readOnlyParams}
                                    style={{
                                        ...readOnlyParams ? disabledStyle : {},
                                        padding: '8px 12px',
                                        fontSize: FS.sm,
                                        fontFamily: FONT,
                                        borderRadius: RADIUS,
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-input)',
                                        color: 'var(--text-pure)',
                                        flex: 1,
                                        minWidth: 0,
                                        width: '100%',
                                        height: '38px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, width: '100%' }}>
                                <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', minWidth: '24px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                    {renderLatex('\\mathbf{N_2}')}:
                                </label>
                                <input
                                    type="number"
                                    className="input-mat251 placeholder-small"
                                    value={(paramN_hip !== '' && paramK_hip !== '') ? Math.max(0, parseInt(paramN_hip) - parseInt(paramK_hip)) : ''}
                                    readOnly
                                    disabled
                                    placeholder="N - N₁"
                                    style={{
                                        ...disabledStyle,
                                        padding: '8px 12px',
                                        fontSize: FS.sm,
                                        fontFamily: FONT,
                                        borderRadius: RADIUS,
                                        border: '1px solid var(--border-color)',
                                        flex: 1,
                                        minWidth: 0,
                                        width: '100%',
                                        height: '38px',
                                        boxSizing: 'border-box',
                                        backgroundColor: 'var(--bg-input, #e2e8f0)',
                                        color: 'var(--text-muted, #64748b)'
                                    }}
                                />
                            </div>
                            <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, width: '100%' }}>
                                <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', minWidth: '24px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                    {renderLatex('\\mathbf{n}')}:
                                </label>
                                <input
                                    type="number"
                                    className="input-mat251 placeholder-small"
                                    min="1"
                                    value={paramn_hip}
                                    onChange={e => {
                                        setParamn_hip(e.target.value);
                                        if (onCalcular) onCalcular(null);
                                    }}
                                    placeholder="Muestra"
                                    style={{
                                        padding: '8px 12px',
                                        fontSize: FS.sm,
                                        fontFamily: FONT,
                                        borderRadius: RADIUS,
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-input)',
                                        color: 'var(--text-pure)',
                                        flex: 1,
                                        minWidth: 0,
                                        width: '100%',
                                        height: '38px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>
                        <div className="t3-formula-scroll" style={{ gridColumn: '1 / -1', display: 'block', color: 'var(--text-pure)', padding: '8px', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '15px auto 0 auto', maxWidth: '100%', boxSizing: 'border-box' }}>
                            <div className="t3-formula-inner">
                                {renderLatex((paramN_hip !== '' && paramK_hip !== '' && paramn_hip !== '')
                                    ? `P(X=x) = \\frac{\\binom{N_1}{x} \\binom{N_2}{n-x}}{\\binom{N}{n}} \\quad \\implies \\quad \\frac{\\binom{${paramK_hip}}{x} \\binom{${Math.max(0, parseInt(paramN_hip) - parseInt(paramK_hip))}}{${paramn_hip}-x}}{\\binom{${paramN_hip}}{${paramn_hip}}}`
                                    : `P(X=x) = \\frac{\\binom{N_1}{x} \\binom{N_2}{n-x}}{\\binom{N}{n}}`
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* GRUPO DE SELECTORES (MODELO Y MODO) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '10px', marginTop: '10px' }}>

                {/* SELECTOR DE MODELO */}
                <div style={{ display: 'flex', width: '100%', maxWidth: '600px', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: RADIUS, border: '1px solid var(--border-color, #e2e8f0)' }}>
                    {[
                        { id: 'Bernoulli', label: 'Bernoulli' },
                        { id: 'Binomial', label: 'Binomial' },
                        { id: 'Poisson', label: 'Poisson' },
                        { id: 'Hipergeometrica', label: 'Hipergeométrica' }
                    ].map(tipo => (
                        <button
                            key={tipo.id}
                            type="button"
                            className={`btn-mat251-modo ${modelo === tipo.id ? 'active' : ''}`}
                            onClick={() => handleCambiarModelo(tipo.id)}
                            style={{ flex: 1, fontFamily: FONT, borderRadius: RADIUS }}
                        >
                            {tipo.label}
                        </button>
                    ))}
                </div>

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
            </div>

            <div className="tema3-card">



                {modo === 'matriz' && (
                    <div style={{ marginBottom: '20px' }}>
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
                                {/* 1. LO PRIMERO: Selector de Columna (si hay 2 o más columnas) */}
                                {columnasDisponibles.length > 1 && (
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '10px'
                                    }}>
                                        <label style={{
                                            fontSize: FS.sm,
                                            fontWeight: 600,
                                            color: 'var(--text-pure)',
                                            margin: 0,
                                            whiteSpace: 'nowrap',
                                            fontFamily: FONT
                                        }}>
                                            Columna:
                                        </label>
                                        <div style={{ width: '160px' }}>
                                            <CustomSelect
                                                value={columnaSeleccionada}
                                                onChange={val => {
                                                    setColumnaSeleccionada(Number(val));
                                                    setModoEstimacionBinomial('especifico');
                                                    setStatsEstimados(null);
                                                    setValorExito('');
                                                    setYaCalculado(false);
                                                    if (onCalcular) onCalcular(null);
                                                }}
                                                options={columnasDisponibles.map((col, idx) => ({ value: idx, label: col }))}
                                                placeholder="Seleccione columna..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* 2. DEBAJO: Selector de modo para Binomial con columna numérica */}
                                {modelo === 'Binomial' && esColumnaNumerica && (
                                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '15px' }}>
                                        <div className="contenedor-selector-modos-mat251">
                                            <button
                                                type="button"
                                                className={`btn-mat251-modo ${modoEstimacionBinomial === 'especifico' ? 'active' : ''}`}
                                                onClick={() => {
                                                    if (modoEstimacionBinomial !== 'especifico') {
                                                        setModoEstimacionBinomial('especifico');
                                                        setStatsEstimados(null);
                                                        setYaCalculado(false);
                                                        if (onCalcular) onCalcular(null);
                                                    }
                                                }}
                                                style={{ fontFamily: FONT, borderRadius: RADIUS, flex: 1, textAlign: 'center' }}
                                            >
                                                Evaluar un valor específico
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn-mat251-modo ${modoEstimacionBinomial === 'lote' ? 'active' : ''}`}
                                                onClick={() => {
                                                    if (modoEstimacionBinomial !== 'lote') {
                                                        setModoEstimacionBinomial('lote');
                                                        setStatsEstimados(null);
                                                        setYaCalculado(false);
                                                        if (onCalcular) onCalcular(null);
                                                    }
                                                }}
                                                style={{ fontFamily: FONT, borderRadius: RADIUS, flex: 1, textAlign: 'center' }}
                                            >
                                                Datos como conteos por lote
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* 3. DEBAJO DE ESO: Lo demás (campos de entrada según el modelo y modo) */}
                                {modelo !== 'Poisson' && (
                                    <div className="t3-fila-controles-matriz">

                                        {(modelo === 'Hipergeometrica' || modelo === 'Bernoulli') && (
                                            <>
                                                <div className="t3-control-item">
                                                    <label style={{
                                                        fontSize: FS.sm,
                                                        fontWeight: 600,
                                                        color: 'var(--text-pure)',
                                                        margin: 0,
                                                        fontFamily: FONT,
                                                        whiteSpace: 'nowrap',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}>
                                                        Valor a evaluar ({renderLatex('x')}):
                                                    </label>
                                                    <div className="t3-control-input-wrapper">
                                                        <CustomSelect
                                                            value={valorExito}
                                                            onChange={val => {
                                                                setValorExito(val);
                                                                setStatsEstimados(null);
                                                                setYaCalculado(false);
                                                                if (onCalcular) onCalcular(null);
                                                            }}
                                                            options={valoresUnicos.map(val => ({ value: val, label: String(val) }))}
                                                            placeholder="Seleccione un valor..."
                                                        />
                                                    </div>
                                                </div>
                                                {modelo === 'Hipergeometrica' && (
                                                    <div className="t3-control-item">
                                                        <label style={{
                                                            fontSize: FS.md,
                                                            fontWeight: 700,
                                                            color: 'var(--text-pure)',
                                                            margin: 0,
                                                            fontFamily: FONT,
                                                            whiteSpace: 'nowrap',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}>
                                                            {renderLatex('n:')}
                                                        </label>
                                                        <div className="t3-control-input-wrapper">
                                                            <input
                                                                type="number"
                                                                className="input-mat251 placeholder-small"
                                                                value={muestraN}
                                                                onChange={e => {
                                                                    setMuestraN(e.target.value);
                                                                    setStatsEstimados(null);
                                                                    setYaCalculado(false);
                                                                    if (onCalcular) onCalcular(null);
                                                                }}
                                                                placeholder="Muestra a extraer (Ej. 5)"
                                                                min="1"
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '8px 12px',
                                                                    borderRadius: RADIUS,
                                                                    border: '1px solid var(--border-color)',
                                                                    background: 'var(--bg-input)',
                                                                    color: 'var(--text-pure)',
                                                                    fontSize: FS.sm,
                                                                    fontFamily: FONT,
                                                                    boxSizing: 'border-box',
                                                                    height: '38px'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {modelo === 'Binomial' && (
                                            <>
                                                {(!esColumnaNumerica || modoEstimacionBinomial === 'especifico') && (
                                                    <div className="t3-control-item">
                                                        <label style={{
                                                            fontSize: FS.sm,
                                                            fontWeight: 600,
                                                            color: 'var(--text-pure)',
                                                            margin: 0,
                                                            fontFamily: FONT,
                                                            whiteSpace: 'nowrap',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}>
                                                            Valor a evaluar ({renderLatex('x')}):
                                                        </label>
                                                        <div className="t3-control-input-wrapper">
                                                            <CustomSelect
                                                                value={valorExito}
                                                                onChange={val => {
                                                                    setValorExito(val);
                                                                    setStatsEstimados(null);
                                                                    setYaCalculado(false);
                                                                    if (onCalcular) onCalcular(null);
                                                                }}
                                                                options={valoresUnicos.map(val => ({ value: val, label: String(val) }))}
                                                                placeholder="Seleccione un valor..."
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="t3-control-item">
                                                    <label style={{
                                                        fontSize: FS.md,
                                                        fontWeight: 700,
                                                        color: 'var(--text-pure)',
                                                        margin: 0,
                                                        fontFamily: FONT,
                                                        whiteSpace: 'nowrap',
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}>
                                                        {renderLatex('n:')}
                                                    </label>
                                                    <div className="t3-control-input-wrapper">
                                                        <input
                                                            type="number"
                                                            className="input-mat251 placeholder-small"
                                                            value={nArriba}
                                                            onChange={e => {
                                                                setNArriba(e.target.value);
                                                                setStatsEstimados(null);
                                                                setYaCalculado(false);
                                                                if (onCalcular) onCalcular(null);
                                                            }}
                                                            placeholder="Tamaño del ensayo / Lote (Ej. 10)"
                                                            min="1"
                                                            style={{
                                                                width: '100%',
                                                                padding: '8px 12px',
                                                                borderRadius: RADIUS,
                                                                border: '1px solid var(--border-color)',
                                                                background: 'var(--bg-input)',
                                                                color: 'var(--text-pure)',
                                                                fontSize: FS.sm,
                                                                fontFamily: FONT,
                                                                boxSizing: 'border-box',
                                                                height: '38px'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                                    <button
                                        className="button_calcular"
                                        onClick={estimarDesdeDatos}
                                        style={{
                                            width: 'fit-content',
                                            padding: '5px 20px',
                                            borderRadius: RADIUS,
                                            fontSize: FS.md,
                                            fontWeight: 600,
                                            fontFamily: FONT,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        ESTIMAR PARÁMETROS
                                    </button>
                                </div>

                                {statsEstimados && (
                                    <div className="t3-tabla-estimados-wrapper">
                                        <table className="t3-tabla-estimados" style={{
                                            fontSize: FS.sm,
                                            fontFamily: FONT
                                        }}>
                                            <thead style={{ backgroundColor: 'var(--bg-input)' }}>
                                                <tr>
                                                    <th className="t3-col-param-sm">
                                                        <StatLabel formulaKey="N" formulaLatex="N" align="center" position="top" />
                                                    </th>
                                                    {modelo !== 'Poisson' ? (
                                                        <>
                                                            <th className="t3-col-param-sm">
                                                                {modelo === 'Hipergeometrica' ? (
                                                                    <StatLabel formulaKey="K" formulaLatex="K" align="center" position="top" />
                                                                ) : (
                                                                    <StatLabel formulaKey="x" formulaLatex="x" align="center" position="top" />
                                                                )}
                                                            </th>
                                                            {modelo !== 'Hipergeometrica' && (
                                                                <th className="t3-col-param-lg">
                                                                    <StatLabel formulaKey="p" formulaLatex="p" align="center" position="top" />
                                                                </th>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <th className="t3-col-param-lg">
                                                            <StatLabel formulaKey="lambda" formulaLatex="\lambda" align="center" position="top" />
                                                        </th>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr style={{ backgroundColor: 'var(--bg-card)' }}>
                                                    <td className="t3-col-param-sm" style={{
                                                        fontSize: FS.md,
                                                        fontWeight: 'normal'
                                                    }}>
                                                        {renderLatex(`${statsEstimados.total}`)}
                                                    </td>
                                                    {modelo !== 'Poisson' ? (
                                                        <>
                                                            <td className="t3-col-param-sm" style={{
                                                                fontSize: FS.md,
                                                                fontWeight: 'normal'
                                                            }}>
                                                                {renderLatex(`${statsEstimados.exitos}`)}
                                                            </td>
                                                            {modelo !== 'Hipergeometrica' && (
                                                                <td className="t3-col-param-lg" style={{
                                                                    fontSize: FS.md,
                                                                    fontWeight: 'normal'
                                                                }}>
                                                                    {renderLatex(`\\frac{${statsEstimados.exitos}}{${statsEstimados.total}} = ${statsEstimados.p?.toFixed(4)} \\rightarrow ${parseFloat((statsEstimados.p * 100).toFixed(2))}\\%`)}
                                                                </td>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <td className="t3-col-param-lg" style={{
                                                            fontSize: FS.md,
                                                            fontWeight: 'normal'
                                                        }}>
                                                            {renderLatex(`\\frac{${statsEstimados.suma}}{${statsEstimados.total}} = ${statsEstimados.media?.toFixed(4)}`)}
                                                        </td>
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

                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '0px' }}>
                            <button
                                className="button_calcular"
                                onClick={() => manejarCalculo(true)}
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
                                CALCULAR
                            </button>
                        </div>
                    </>
                )}

                {yaCalculado && (modo === 'manual' || (modo === 'matriz' && statsEstimados)) && (
                    <>
                        <div style={{ margin: '15px 0 5px 0' }}></div>

                        <h4 style={{ color: 'var(--text-pure)', fontSize: FS.md, margin: '0 0 12px 0', fontFamily: FONT }}>Condición de Búsqueda:</h4>

                        {/* FILA 1: Condición lógica y su dropdown en una sola fila centrada */}
                        <div className="t3-condicion-fila">
                            <label className="t3-condicion-label">
                                Condición lógica:
                            </label>
                            <div className="t3-condicion-select-wrapper" style={{ width: '160px' }}>
                                <CustomSelect
                                    value={tipoCondicion}
                                    onChange={val => {
                                        setTipoCondicion(val);
                                        limpiarCondicionCalculada();
                                    }}
                                    options={[
                                        { value: 'exacta', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{renderLatex('P(X = x)')}</div> },
                                        { value: 'menor_igual', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{renderLatex('P(X \\leq x)')}</div> },
                                        { value: 'mayor_igual', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{renderLatex('P(X \\geq x)')}</div> },
                                        { value: 'intervalo', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{renderLatex('P(a \\leq X \\leq b)')}</div> },
                                        { value: 'menor_estricto', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{renderLatex('P(X < x)')}</div> },
                                        { value: 'mayor_estricto', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{renderLatex('P(X > x)')}</div> },
                                        { value: 'intervalo_estricto', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{renderLatex('P(a < X < b)')}</div> },
                                    ]}
                                />
                            </div>
                        </div>

                        {/* FILA 2: Valor(es) x (y b si intervalo) */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'nowrap',
                            justifyContent: 'center',
                            gap: '10px',
                            marginBottom: '14px',
                            width: '100%',
                            maxWidth: tipoCondicion.includes('intervalo') ? '360px' : '200px',
                            margin: '0 auto 14px auto',
                            boxSizing: 'border-box'
                        }}>
                            {/* x o a */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                                <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                    {tipoCondicion.includes('intervalo')
                                        ? renderLatex('\\mathbf{a}:')
                                        : renderLatex('\\mathbf{x}:')}
                                </label>
                                <input
                                    type="number"
                                    className="input-mat251 placeholder-small"
                                    min="0"
                                    value={valorX}
                                    onChange={e => {
                                        setValorX(e.target.value);
                                        limpiarCondicionCalculada();
                                    }}
                                    placeholder={
                                        tipoCondicion.includes('intervalo') ? 'Límite inferior'
                                            : modelo === 'Bernoulli' ? 'Éxito (0 o 1)'
                                                : 'Número de éxitos'
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
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>

                            {/* b (solo si intervalo) */}
                            {tipoCondicion.includes('intervalo') && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                                    <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                        {renderLatex('\\mathbf{b}:')}
                                    </label>
                                    <input
                                        type="number"
                                        className="input-mat251 placeholder-small"
                                        min="0"
                                        value={valorB}
                                        onChange={e => {
                                            setValorB(e.target.value);
                                            limpiarCondicionCalculada();
                                        }}
                                        placeholder="Límite superior"
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
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            )}
                        </div>


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

function CustomSelect({ value, onChange, options = [], placeholder = 'Selecciona una opción...' }) {
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
