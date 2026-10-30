import React, { useState, useMemo } from 'react';
import '../../../styles/Temas/Tema3.css';
import { crearEstadoModelosContinuos, columnasModelosDiscretos } from '../../../Historial/historial_Tema3';
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
    onCalcular, onEstimar, onInvalidar, modelo, setModelo, modelosState, setModelosState, bloquearModo = false,
    children
}) {
    const initialModelosState = crearEstadoModelosContinuos();
    initialModelosState.FFisher.modo = 'matriz';
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

    const updateActive = (updater, soloCondicion = false) => {
        setModelosState(prev => {
            const cur = prev[modelo] || initialModelosState[modelo];
            const next = typeof updater === 'function' ? updater(cur) : { ...cur, ...updater };
            return { ...prev, [modelo]: next };
        }, soloCondicion);
    };

    const setModo = (nuevoModo) => {
        if (bloquearModo || modelo === 'NormalEstandar' || nuevoModo === modo) return;
        updateActive(cur => ({ ...cur, modo: nuevoModo }));
        onInvalidar?.();
    };

    const setCalcMode = (nuevoCalcMode) => {
        if (nuevoCalcMode === calcMode) return;
        updateActive(cur => ({ ...cur, calcMode: nuevoCalcMode }), true);
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
        }, true);
    };

    const setValorX = (val) => {
        updateActive(cur => ({ ...cur, directa: { ...cur.directa, x: val } }), true);
    };

    const setValorX2 = (val) => {
        updateActive(cur => ({ ...cur, directa: { ...cur.directa, x2: val } }), true);
    };

    const setIntervals = (newIntervals) => {
        updateActive(cur => ({
            ...cur,
            directa: {
                ...cur.directa,
                intervals: typeof newIntervals === 'function' ? newIntervals(cur.directa.intervals) : newIntervals
            }
        }), true);
    };

    const setValorP = (val) => {
        updateActive(cur => ({ ...cur, inversa: { ...cur.inversa, p: val } }), true);
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

    const handleCambiarModelo = (nuevoModelo) => {
        if (bloquearModo || modelo === nuevoModelo) return;
        setModelo(nuevoModelo);
        setAlerta({ isOpen: false, mensaje: '' });
        onInvalidar?.();
    };

    // Extraer datos
    const columnasDisponibles = useMemo(() => columnasModelosDiscretos(varSeleccionada, filas), [varSeleccionada, filas]);
    const colActiva = columnasDisponibles.length === 1 ? 0
        : Number.isInteger(columnaSeleccionada) && columnaSeleccionada >= 0 && columnaSeleccionada < columnasDisponibles.length ? columnaSeleccionada : '';
    const colActiva2 = Number.isInteger(columnaSeleccionada2) && columnaSeleccionada2 >= 0 && columnaSeleccionada2 < columnasDisponibles.length ? columnaSeleccionada2 : '';
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
                    <div id="tour-t3continua-normal-formula" className="t3-formula-scroll" style={{ display: 'block', color: 'var(--text-pure)', background: 'var(--bg-input, #f8fafc)', padding: '12px 20px', borderRadius: RADIUS, fontSize: '1.1rem', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '0 auto 15px auto', maxWidth: '100%', boxSizing: 'border-box' }}>
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
                        <div id="tour-t3continua-normal-mu" className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}>
                            <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                {renderLatex('\\boldsymbol{\\mu}:')}
                            </label>
                            <input
                                type="number" className="input-mat251 placeholder-small" step="any"
                                value={paramMu} onChange={e => { setParamMu(e.target.value); setYaCalculado(false); onInvalidar?.(); }}
                                placeholder="Media"
                                disabled={readOnlyParams}
                                style={{ ...readOnlyParams ? disabledStyle : {}, padding: '6px 8px', fontSize: FS.sm, fontFamily: FONT, borderRadius: RADIUS, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-pure)', textAlign: 'center', width: '100%', maxWidth: '130px', minWidth: '0', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div id="tour-t3continua-normal-sigma" className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}>
                            <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                {renderLatex('\\boldsymbol{\\sigma}:')}
                            </label>
                            <input
                                type="number" className="input-mat251 placeholder-small" step="any"
                                value={paramSigma} onChange={e => { setParamSigma(e.target.value); setYaCalculado(false); onInvalidar?.(); }}
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
                    <div id="tour-t3continua-estandar-formula" className="t3-formula-scroll" style={{ display: 'block', color: 'var(--text-pure)', background: 'var(--bg-input, #f8fafc)', padding: '12px 20px', borderRadius: RADIUS, fontSize: '1.1rem', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '0 auto 15px auto', maxWidth: '100%', boxSizing: 'border-box' }}>
                        <div className="t3-formula-inner">
                            {renderLatex(`f(z) = \\frac{1}{\\sqrt{2\\pi}} e^{-\\frac{1}{2}z^2}`)}
                        </div>
                    </div>
                    <div id="tour-t3continua-estandar-params" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap', width: '100%' }}>
                        <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px', width: 'auto' }}>
                            <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', minWidth: '24px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                {renderLatex('\\boldsymbol{\\mu}:')}
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
                                {renderLatex('\\boldsymbol{\\sigma}:')}
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
                    <div id="tour-t3continua-chi-formula" className="t3-formula-scroll" style={{ display: 'block', color: 'var(--text-pure)', background: 'var(--bg-input, #f8fafc)', padding: '12px 20px', borderRadius: RADIUS, fontSize: '1.1rem', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '0 auto 15px auto', maxWidth: '100%', boxSizing: 'border-box' }}>
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
                        <div id="tour-t3continua-chi-k" className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px', width: 'auto' }}>
                            <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', minWidth: '24px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                {renderLatex('\\boldsymbol{v}:')}
                            </label>
                            <input
                                type="number" className="input-mat251 placeholder-small" step="1" min="1"
                                value={paramK} onChange={e => { setParamK(e.target.value); setYaCalculado(false); onInvalidar?.(); }}
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
                    <div id="tour-t3continua-fisher-formula" className="t3-formula-scroll" style={{ display: 'block', color: 'var(--text-pure)', background: 'var(--bg-input, #f8fafc)', padding: '12px 20px', borderRadius: RADIUS, fontSize: '1.1rem', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '0 auto 15px auto', maxWidth: '100%', boxSizing: 'border-box' }}>
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
                        <div id="tour-t3continua-fisher-v1" className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}>
                            <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                {renderLatex('\\boldsymbol{n}:')}
                            </label>
                            <input
                                type="number" className="input-mat251 placeholder-small" step="1" min="1"
                                value={paramV1} onChange={e => { setParamV1(e.target.value); setYaCalculado(false); onInvalidar?.(); }}
                                placeholder="Grados num."
                                title="Grados de libertad del numerador (n)"
                                disabled={readOnlyParams}
                                style={{ ...readOnlyParams ? disabledStyle : {}, padding: '6px 8px', fontSize: FS.sm, fontFamily: FONT, borderRadius: RADIUS, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-pure)', textAlign: 'center', width: '100%', maxWidth: '140px', minWidth: '0', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div id="tour-t3continua-fisher-v2" className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}>
                            <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                {renderLatex('\\boldsymbol{m}:')}
                            </label>
                            <input
                                type="number" className="input-mat251 placeholder-small" step="1" min="1"
                                value={paramV2} onChange={e => { setParamV2(e.target.value); setYaCalculado(false); onInvalidar?.(); }}
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
                    <div id="tour-t3continua-student-formula" className="t3-formula-scroll" style={{ display: 'block', color: 'var(--text-pure)', background: 'var(--bg-input, #f8fafc)', padding: '12px 20px', borderRadius: RADIUS, fontSize: '1.1rem', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '0 auto 15px auto', maxWidth: '100%', boxSizing: 'border-box' }}>
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
                        <div id="tour-t3continua-student-n" className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '8px', width: 'auto' }}>
                            <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', minWidth: '24px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                                {renderLatex('\\boldsymbol{n}:')}
                            </label>
                            <input
                                type="number" className="input-mat251 placeholder-small" step="1" min="1"
                                value={paramNStudent} onChange={e => { setParamNStudent(e.target.value); setYaCalculado(false); onInvalidar?.(); }}
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
                <div id="tour-t3continua-uniforme-formula" className="t3-formula-scroll" style={{ display: 'block', color: 'var(--text-pure)', background: 'var(--bg-input, #f8fafc)', padding: '12px 20px', borderRadius: RADIUS, fontSize: '1.1rem', width: 'fit-content', minWidth: 'min(100%, 280px)', margin: '0 auto 15px auto', maxWidth: '100%', boxSizing: 'border-box' }}>
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
                    <div id="tour-t3continua-uniforme-a" className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}>
                        <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
                            {renderLatex('\\boldsymbol{a}:')}
                        </label>
                        <input
                            type="number" className="input-mat251 placeholder-small" step="any"
                            value={paramA} onChange={e => { setParamA(e.target.value); setYaCalculado(false); onInvalidar?.(); }}
                            placeholder="Mínimo"
                            disabled={readOnlyParams}
                            style={{ ...readOnlyParams ? disabledStyle : {}, padding: '6px 8px', fontSize: FS.sm, fontFamily: FONT, borderRadius: RADIUS, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-pure)', textAlign: 'center', width: '100%', maxWidth: '130px', minWidth: '0', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div id="tour-t3continua-uniforme-b" className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto', flex: '1 1 0', minWidth: 0, justifyContent: 'center' }}>
                        <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap' }}>
                            {renderLatex('\\boldsymbol{b}:')}
                        </label>
                        <input
                            type="number" className="input-mat251 placeholder-small" step="any"
                            value={paramB} onChange={e => { setParamB(e.target.value); setYaCalculado(false); onInvalidar?.(); }}
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
                <div id="tour-t3continua-modelos" className="tema3-scrollable-tabs" style={{ display: 'flex', overflowX: 'auto', width: '100%', maxWidth: '850px', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: RADIUS, border: '1px solid var(--border-color, #e2e8f0)' }}>
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
                            disabled={bloquearModo && modelo !== tipo.id}
                            title={bloquearModo && modelo !== tipo.id ? 'La distribución está fijada por el historial' : undefined}
                            onClick={() => handleCambiarModelo(tipo.id)}
                            style={{ flex: '1 0 140px', whiteSpace: 'nowrap', fontFamily: FONT }}
                        >
                            {tipo.label}
                        </button>
                    ))}
                </div>

                {modelo !== 'NormalEstandar' && (
                    <div id="tour-t3continua-modos-entrada" style={{ display: 'inline-flex', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: RADIUS, border: '1px solid var(--border-color, #e2e8f0)' }}>
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
                )}
            </div>

            <div className="tema3-card">
                {modo === 'matriz' && (modelo === 'Uniforme' || modelo === 'Normal' || modelo === 'ChiCuadrado' || modelo === 'TStudent' || modelo === 'FFisher') && (
                    <div style={{ marginBottom: '10px' }}>
                        <div id="tour-t3continua-matriz-datos" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', padding: '10px 15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', marginBottom: '15px' }}>
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
                                {/* Selector de columna: FFisher usa dos, resto uno (solo si hay 2 o más columnas) */}
                                {modelo === 'FFisher' ? (
                                    <div id="tour-t3continua-matriz-columna" style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap', marginBottom: '15px' }}>
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
                                                    onInvalidar?.();
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
                                                    onInvalidar?.();
                                                }}
                                                options={columnasDisponibles.map((col, idx) => ({ value: idx, label: col }))}
                                                placeholder="Seleccionar columna..."
                                            />
                                        </div>
                                    </div>
                                ) : columnasDisponibles.length > 1 ? (
                                    <div id="tour-t3continua-matriz-columna" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '15px' }}>
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
                                                    onInvalidar?.();
                                                }}
                                                options={columnasDisponibles.map((col, idx) => ({ value: idx, label: col }))}
                                                placeholder="Seleccione columna..."
                                            />
                                        </div>
                                    </div>
                                ) : null}

                                <button
                                    id="tour-t3continua-btn-estimar"
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
                                    <div id="tour-t3continua-tabla-estimados" className="t3-tabla-estimados-wrapper">
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
                        <div id="tour-t3continua-parametros">
                            {renderParametrosManuales()}
                        </div>

                        {(modelo === 'Uniforme' || modelo === 'Normal' || modelo === 'NormalEstandar' || modelo === 'ChiCuadrado' || modelo === 'FFisher' || modelo === 'TStudent') && (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0px' }}>
                                <button id="tour-t3continua-btn-calcular" className="button_calcular" onClick={() => manejarCalculo(true)} style={{ width: 'fit-content', padding: '5px 20px', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: RADIUS, fontSize: FS.sm, fontWeight: 'bold', fontFamily: FONT, cursor: 'pointer' }}>
                                    GRAFICAR
                                </button>
                            </div>
                        )}
                    </>
                )}

                {yaCalculado && (modo === 'manual' || (modo === 'matriz' && statsEstimados)) && (
                    <div>
                        <div style={{ margin: '15px 0 5px 0' }}></div>

                        <h4 style={{ color: 'var(--text-pure)', fontSize: FS.md, margin: '0 0 12px 0', fontFamily: FONT, fontWeight: 700 }}>Condición de Búsqueda:</h4>

                        {/* Toggle de Modo de Cálculo */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                            <div id="tour-t3continua-tipo-calculo" className="contenedor-selector-modos-mat251" style={{ display: 'flex', width: '100%', maxWidth: '350px' }}>
                                <button 
                                    type="button"
                                    className={`btn-mat251-modo ${calcMode === 'directa' ? 'active' : ''}`}
                                    onClick={() => {
                                        setCalcMode('directa');
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
                                    }}
                                    style={{ flex: 1, fontFamily: FONT }}
                                >
                                    Calcular Valor Inverso
                                </button>
                            </div>
                        </div>

                        {/* Contenedor de Condición y Parámetros de Entrada */}
                        <div id="tour-t3continua-condicion">
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
                                            {renderLatex('\\boldsymbol{p}:')}
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
                                                ? renderLatex('\\boldsymbol{a}:')
                                                : renderLatex(`\\boldsymbol{${modelo === 'NormalEstandar' ? 'z' : (modelo === 'ChiCuadrado' ? '\\chi^2' : (modelo === 'FFisher' ? 'F' : (modelo === 'TStudent' ? 't' : 'x')))}:}`)}
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            className="input-mat251 placeholder-small"
                                            value={valorX}
                                            onChange={e => {
                                                setValorX(e.target.value);
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
                                                {renderLatex('\\boldsymbol{b}:')}
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                className="input-mat251 placeholder-small"
                                                value={valorX2}
                                                onChange={e => {
                                                    setValorX2(e.target.value);
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
                        </div>

                        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <button
                                id="tour-t3continua-btn-calcular-condicion"
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
