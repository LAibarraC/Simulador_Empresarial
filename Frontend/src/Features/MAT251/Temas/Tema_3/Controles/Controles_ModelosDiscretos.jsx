import React, { useState, useMemo } from 'react';
import '../../../styles/Temas/Tema3.css';
import {
  crearEstadoModelosDiscretos, columnasModelosDiscretos, valoresColumnaModelo,
} from '../../../Historial/historial_Tema3';
import ModalAlerta from '../../../ui/ModalAlerta';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { FONT, FS, RADIUS } from '../../../Principal/Constantes';
import { EditarDatos } from '../../../../../ui/iconos';
import StatLabel from '../../../ui/StatLabel';
import { formatearParametroDiscreto } from '../../../Matematicas/logica_Tema3';

export default function Controles_ModelosDiscretos({
    varSeleccionada,
    filas,
    statsDatos,
    abrirEditor,
    onCalcular, onEstimar, onInvalidar, modelo, setModelo, modelosState, setModelosState, bloquearModo = false,
    children
}) {
    const initialModelosDiscretosState = crearEstadoModelosDiscretos();
    const [alerta, setAlerta] = useState({ isOpen: false, mensaje: '' });

    const activeState = modelosState[modelo] || initialModelosDiscretosState[modelo];
    const modo = activeState.modo;
    const yaCalculado = activeState.yaCalculado;

    // Parámetros según modo
    const isMatriz = modo === 'matriz';
    const paramP_ber = isMatriz ? formatearParametroDiscreto(activeState.matriz.p) : (activeState.manual.p ?? '');
    const paramN_bin = isMatriz ? (activeState.matriz.n ?? '') : (activeState.manual.n ?? '');
    const paramP_bin = isMatriz ? formatearParametroDiscreto(activeState.matriz.p) : (activeState.manual.p ?? '');
    const paramLambda = isMatriz ? formatearParametroDiscreto(activeState.matriz.lambda) : (activeState.manual.lambda ?? '');
    const paramN_hip = isMatriz ? (activeState.matriz.N ?? '') : (activeState.manual.N ?? '');
    const paramK_hip = isMatriz ? (activeState.matriz.K ?? '') : (activeState.manual.K ?? '');
    const paramn_hip = isMatriz ? (activeState.matriz.n ?? '') : (activeState.manual.n ?? '');

    // Condición activa
    const tipoCondicion = activeState.condicion.tipo;
    const valorX = activeState.condicion.x;
    const valorB = activeState.condicion.b;

    // Matriz activa
    const columnaSeleccionada = varSeleccionada?.nombresColumnas?.length > 1 ? activeState.matriz.col ?? 0 : 0;
    const valorExito = activeState.matriz.valorExito ?? '';
    const modoEstimacionBinomial = activeState.matriz.modoEstimacion ?? 'especifico';
    const statsEstimados = activeState.matriz.stats ?? null;
    const nArriba = activeState.matriz.nArriba ?? '';
    const muestraN = activeState.matriz.muestraN ?? '';

    const renderLatex = (str) => {
        return <span style={{ fontSize: '0.9em' }} dangerouslySetInnerHTML={{ __html: katex.renderToString(str, { throwOnError: false }) }} />;
    };

    const updateActive = (updater, soloCondicion = false) => {
        setModelosState(prev => {
            const cur = prev[modelo] || initialModelosDiscretosState[modelo];
            const next = typeof updater === 'function' ? updater(cur) : { ...cur, ...updater };
            return { ...prev, [modelo]: next };
        }, soloCondicion);
    };

    const setModo = (nuevoModo) => {
        if (bloquearModo || nuevoModo === modo) return;
        updateActive(cur => ({ ...cur, modo: nuevoModo }));
        onInvalidar?.();
    };

    const setYaCalculado = (val) => {
        updateActive(cur => ({ ...cur, yaCalculado: val }));
    };

    const setTipoCondicion = (tipo) => {
        updateActive(cur => ({ ...cur, condicion: { ...cur.condicion, tipo } }), true);
    };

    const setValorX = (x) => {
        updateActive(cur => ({ ...cur, condicion: { ...cur.condicion, x } }), true);
    };

    const setValorB = (b) => {
        updateActive(cur => ({ ...cur, condicion: { ...cur.condicion, b } }), true);
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

    const handleCambiarModelo = (nuevoModelo) => {
        if (bloquearModo || modelo === nuevoModelo) return;
        setModelo(nuevoModelo);
        setAlerta({ isOpen: false, mensaje: '' });
        onInvalidar?.();
    };

    // Extraer datos de la matriz
    const columnasDisponibles = useMemo(() => columnasModelosDiscretos(varSeleccionada, filas), [varSeleccionada, filas]);
    const datosColumna = useMemo(() => valoresColumnaModelo(filas, columnaSeleccionada), [filas, columnaSeleccionada]);
    const esColumnaNumerica = datosColumna.length > 0 && datosColumna.every(valor => Number.isFinite(Number(valor)));
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
        const estimacion = onEstimar();
        setAlerta({ isOpen: !!estimacion.error, mensaje: estimacion.error || '' });
    };
    const manejarCalculo = (soloGrafico = false) => {
        const calculo = onCalcular(soloGrafico);
        setAlerta({ isOpen: !!calculo.error, mensaje: calculo.error || '' });
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
            <div id="tour-t3discreta-parametros" className="tema3-grid" style={{ marginBottom: '5px', gap: '10px' }}>
                {modelo === 'Bernoulli' && (
                    <>
                        <div id="tour-t3discreta-bernoulli-p" className="tema3-form-group" style={{ marginBottom: '0', gridColumn: '1 / -1', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                {renderLatex('\\boldsymbol{p}:')}
                            </label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                step="0.01" min="0" max="1"
                                value={paramP_ber}
                                onChange={e => {
                                    setParamP_ber(e.target.value);
                                    onInvalidar?.();
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
                        <div id="tour-t3discreta-bernoulli-formula" className="t3-formula-scroll" style={{ gridColumn: '1 / -1', display: 'block', color: 'var(--text-pure)', padding: '8px', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '15px auto 0 auto', maxWidth: '100%', boxSizing: 'border-box' }}>
                            <div className="t3-formula-inner">
                                {renderLatex(paramP_ber !== '' ? `P(X=x) = p^x (1 - p)^{1-x} \\quad \\implies \\quad ${formatearParametroDiscreto(paramP_ber)}^x (1 - ${formatearParametroDiscreto(paramP_ber)})^{1-x}` : `P(X=x) = p^x (1 - p)^{1-x}`)}
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
                            <div id="tour-t3discreta-binomial-n" className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}>
                                <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                    {renderLatex('\\boldsymbol{n}:')}
                                </label>
                                <input
                                    type="number"
                                    className="input-mat251 placeholder-small"
                                    min="1"
                                    value={paramN_bin}
                                    onChange={e => {
                                        setParamN_bin(e.target.value);
                                        setYaCalculado(false);
                                        onInvalidar?.();
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
                            <div id="tour-t3discreta-binomial-p" className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '6px', flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}>
                                <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                    {renderLatex('\\boldsymbol{p}:')}
                                </label>
                                <input
                                    type="number"
                                    className="input-mat251 placeholder-small"
                                    step="0.01" min="0" max="1"
                                    value={paramP_bin}
                                    onChange={e => {
                                        setParamP_bin(e.target.value);
                                        setYaCalculado(false);
                                        onInvalidar?.();
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
                        <div id="tour-t3discreta-binomial-formula" className="t3-formula-scroll" style={{ gridColumn: '1 / -1', display: 'block', color: 'var(--text-pure)', padding: '8px', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '15px auto 0 auto', maxWidth: '100%', boxSizing: 'border-box' }}>
                            <div className="t3-formula-inner">
                                {renderLatex((paramN_bin !== '' && paramP_bin !== '') ? `P(X=x) = \\binom{n}{x} p^x (1 - p)^{n-x} \\quad \\implies \\quad \\binom{${paramN_bin}}{x} ${formatearParametroDiscreto(paramP_bin)}^x (1 - ${formatearParametroDiscreto(paramP_bin)})^{${paramN_bin}-x}` : `P(X=x) = \\binom{n}{x} p^x (1 - p)^{n-x}`)}
                            </div>
                        </div>
                    </>
                )}
                {modelo === 'Poisson' && (
                    <>
                        <div id="tour-t3discreta-poisson-lambda" className="tema3-form-group" style={{ marginBottom: '0', gridColumn: '1 / -1', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                {renderLatex('\\boldsymbol{\\lambda}:')}
                            </label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                step="0.1" min="0"
                                value={paramLambda}
                                onChange={e => {
                                    setParamLambda(e.target.value);
                                    onInvalidar?.();
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
                        <div id="tour-t3discreta-poisson-formula" className="t3-formula-scroll" style={{ gridColumn: '1 / -1', display: 'block', color: 'var(--text-pure)', padding: '8px', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '15px auto 0 auto', maxWidth: '100%', boxSizing: 'border-box' }}>
                            <div className="t3-formula-inner">
                                {renderLatex(paramLambda !== '' ? `P(X=x) = \\frac{\\lambda^x e^{-\\lambda}}{x!} \\quad \\implies \\quad \\frac{${formatearParametroDiscreto(paramLambda)}^x e^{-${formatearParametroDiscreto(paramLambda)}}}{x!}` : `P(X=x) = \\frac{\\lambda^x e^{-\\lambda}}{x!}`)}
                            </div>
                        </div>
                    </>
                )}
                {modelo === 'Hipergeometrica' && (
                    <>
                        <div className="t3-grid-hipergeometrica">
                            <div id="tour-t3discreta-hiper-N" className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, width: '100%' }}>
                                <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', minWidth: '24px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                    {renderLatex('\\boldsymbol{N}')}:
                                </label>
                                <input
                                    type="number"
                                    className="input-mat251 placeholder-small"
                                    min="1"
                                    value={paramN_hip}
                                    onChange={e => {
                                        setParamN_hip(e.target.value);
                                        onInvalidar?.();
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
                            <div id="tour-t3discreta-hiper-K" className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, width: '100%' }}>
                                <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', minWidth: '24px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                    {renderLatex('\\boldsymbol{N_1}')}:
                                </label>
                                <input
                                    type="number"
                                    className="input-mat251 placeholder-small"
                                    min="0"
                                    value={paramK_hip}
                                    onChange={e => {
                                        setParamK_hip(e.target.value);
                                        onInvalidar?.();
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
                            <div id="tour-t3discreta-hiper-N2" className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, width: '100%' }}>
                                <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', minWidth: '24px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                    {renderLatex('\\boldsymbol{N_2}')}:
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
                            <div id="tour-t3discreta-hiper-n" className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, width: '100%' }}>
                                <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', minWidth: '24px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                    {renderLatex('\\boldsymbol{n}')}:
                                </label>
                                <input
                                    type="number"
                                    className="input-mat251 placeholder-small"
                                    min="1"
                                    value={paramn_hip}
                                    onChange={e => {
                                        setParamn_hip(e.target.value);
                                        onInvalidar?.();
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
                        <div id="tour-t3discreta-hiper-formula" className="t3-formula-scroll" style={{ gridColumn: '1 / -1', display: 'block', color: 'var(--text-pure)', padding: '8px', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '15px auto 0 auto', maxWidth: '100%', boxSizing: 'border-box' }}>
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
                <div id="tour-t3discreta-modelos" style={{ display: 'flex', width: '100%', maxWidth: '600px', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: RADIUS, border: '1px solid var(--border-color, #e2e8f0)' }}>
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
                            disabled={bloquearModo && modelo !== tipo.id}
                            title={bloquearModo && modelo !== tipo.id ? 'La distribución está fijada por el historial' : undefined}
                            onClick={() => handleCambiarModelo(tipo.id)}
                            style={{ flex: 1, fontFamily: FONT, borderRadius: RADIUS }}
                        >
                            {tipo.label}
                        </button>
                    ))}
                </div>

                <div id="tour-t3discreta-modos-entrada" style={{ display: 'inline-flex', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: RADIUS, border: '1px solid var(--border-color, #e2e8f0)' }}>
                    <button
                        type="button"
                        className={`btn-mat251-modo ${modo === 'matriz' ? 'active' : ''}`}
                        disabled={bloquearModo && modo !== 'matriz'}
                        title={bloquearModo && modo !== 'matriz' ? 'El modo está fijado por el historial' : undefined}
                        onClick={() => { setModo('matriz'); setAlerta({ isOpen: false, mensaje: '' }); }}
                        style={{ flex: 1, fontFamily: FONT, borderRadius: RADIUS }}
                    >
                        Análisis de Matriz
                    </button>
                    <button
                        type="button"
                        className={`btn-mat251-modo ${modo === 'manual' ? 'active' : ''}`}
                        disabled={bloquearModo && modo !== 'manual'}
                        title={bloquearModo && modo !== 'manual' ? 'El modo está fijado por el historial' : undefined}
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
                        <div id="tour-t3discreta-matriz-datos" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', padding: '10px 15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', marginBottom: '15px' }}>
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
                                    <div id="tour-t3discreta-matriz-columna" style={{
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
                                                    onInvalidar?.();
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
                                                        onInvalidar?.();
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
                                                        onInvalidar?.();
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
                                    <div id="tour-t3discreta-matriz-controles" className="t3-fila-controles-matriz">

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
                                                        Valor a evaluar ({renderLatex('\\boldsymbol{x}')}):
                                                    </label>
                                                    <div className="t3-control-input-wrapper">
                                                        <CustomSelect
                                                            value={valorExito}
                                                            onChange={val => {
                                                                setValorExito(val);
                                                                setStatsEstimados(null);
                                                                setYaCalculado(false);
                                                                onInvalidar?.();
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
                                                            {renderLatex('\\boldsymbol{n}:')}
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
                                                                    onInvalidar?.();
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
                                                            Valor a evaluar ({renderLatex('\\boldsymbol{x}')}):
                                                        </label>
                                                        <div className="t3-control-input-wrapper">
                                                            <CustomSelect
                                                                value={valorExito}
                                                                onChange={val => {
                                                                    setValorExito(val);
                                                                    setStatsEstimados(null);
                                                                    setYaCalculado(false);
                                                                    onInvalidar?.();
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
                                                        {renderLatex('\\boldsymbol{n}:')}
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
                                                                onInvalidar?.();
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
                                        id="tour-t3discreta-btn-estimar"
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
                                    <div id="tour-t3discreta-tabla-estimados" className="t3-tabla-estimados-wrapper">
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
                                                            {renderLatex(`\\frac{${formatearParametroDiscreto(statsEstimados.suma)}}{${statsEstimados.total}} = ${statsEstimados.media?.toFixed(4)}`)}
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
                                id="tour-t3discreta-btn-calcular"
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
                    <div id="tour-t3discreta-condicion">
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
                                        ? renderLatex('\\boldsymbol{a}:')
                                        : renderLatex('\\boldsymbol{x}:')}
                                </label>
                                <input
                                    type="number"
                                    className="input-mat251 placeholder-small"
                                    min="0"
                                    value={valorX}
                                    onChange={e => {
                                        setValorX(e.target.value);
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
                                        {renderLatex('\\boldsymbol{b}:')}
                                    </label>
                                    <input
                                        type="number"
                                        className="input-mat251 placeholder-small"
                                        min="0"
                                        value={valorB}
                                        onChange={e => {
                                            setValorB(e.target.value);
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
                                id="tour-t3discreta-btn-calcular-condicion"
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
                    </div>
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
