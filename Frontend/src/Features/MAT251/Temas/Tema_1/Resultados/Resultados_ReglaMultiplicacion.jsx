import React, { useEffect, useRef, useMemo, useState } from 'react';
import { FONT, FS, RADIUS, cardStyle, labelStyle } from '../../../Principal/Constantes';
import katex from 'katex';
import DiagramaFlujoSucesivo from '../../../Graficas/Tema_1/DiagramaFlujoSucesivo';
import ArbolProbabilidades from '../../../Graficas/Tema_1/ArbolProbabilidades';
import MarcoWidgetMAT251 from '../../../ui/MarcoWidgetMAT251';
import { IconoCalculadora, EditarDatos } from '../../../../../ui/iconos';
import { calcularReglaMultiplicacion } from '../../../Matematicas/logica_Tema1';
import ModalAlerta from '../../../ui/ModalAlerta';

const InlineMath = ({ math }) => (
    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
);

const FormulaMultiplicacion = ({ resultado, modReemplazo, inputMode }) => {
    const formulaGeneralRef = useRef(null);
    const formulaDesarrolloRef = useRef(null);

    useEffect(() => {
        if (formulaGeneralRef.current && formulaDesarrolloRef.current && resultado) {
            let latexGeneral = '';
            let latexDesarrollo = `\\displaystyle \\begin{aligned}\n`;
            
            if (resultado.isManualDinamic) {
                const events = resultado.events;
                const names = events.map(e => e.name);
                const intersecString = names.join(' \\cap ');
                
                let rhsString = '';
                if (modReemplazo === 'con_reemplazo') {
                    rhsString = names.map(n => `P(${n})`).join(' \\times ');
                } else {
                    rhsString = events.map((e, i) => {
                        if (i === 0) return `P(${e.name})`;
                        const prevNames = names.slice(0, i).join(' \\cap ');
                        return `P(${e.name}|${prevNames})`;
                    }).join(' \\times ');
                }
                
                latexGeneral = `\\displaystyle P(${intersecString}) = ${rhsString}`;
                
                const probsString = events.map(e => e.prob.toFixed(4)).join(' \\times ');
                
                latexDesarrollo += `P(${intersecString}) &= ${probsString} \\\\\n`;
                latexDesarrollo += `P(${intersecString}) &= \\mathbf{${resultado.pAandB.toFixed(4)}}\n`;
                
            } else {
                if (modReemplazo === 'con_reemplazo') {
                    latexGeneral = `\\displaystyle P(A \\cap B) = P(A) \\times P(B)`;
                } else {
                    latexGeneral = `\\displaystyle P(A \\cap B) = P(A) \\times P(B|A)`;
                }
                latexDesarrollo += `P(A \\cap B) &= ${resultado.pA.toFixed(4)} \\times ${resultado.pB.toFixed(4)} \\\\\n`;
                latexDesarrollo += `P(A \\cap B) &= \\mathbf{${resultado.pAandB.toFixed(4)}}\n`;
            }
            
            latexDesarrollo += `\\end{aligned}`;

            katex.render(latexGeneral, formulaGeneralRef.current, { throwOnError: false, displayMode: true });
            katex.render(latexDesarrollo, formulaDesarrolloRef.current, { throwOnError: false, displayMode: false });
        }
    }, [resultado, modReemplazo, inputMode]);

    return (
        <div className="katex-responsive-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: 'fit-content', overflowX: 'auto', marginBottom: '15px', padding: '10px 25px', background: 'var(--bg-card)', border: '1px dashed #9ca3af', borderRadius: RADIUS, textAlign: 'center' }}>
                <div ref={formulaGeneralRef}></div>
            </div>
            <div style={{ width: '100%', overflowX: 'auto', background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '15px 25px', borderRadius: RADIUS, textAlign: 'left', fontSize: '0.9rem' }}>
                <div ref={formulaDesarrolloRef}></div>
            </div>
        </div>
    );
};

export default function ResultadosReglaMultiplicacion({
    varSeleccionada, filas,
    modReemplazo, setModReemplazo,
    colA, setColA, valA, setValA,
    colB, setColB, valB, setValB,
    resultado, setResultado,
    error, setError,
    statsDatos, abrirEditor
}) {
    const [alerta, setAlerta] = useState({ isOpen: false, mensaje: '' });
    const [inputMode, setInputMode] = useState('matriz'); // 'matriz' | 'manual'
    const [manualEvents, setManualEvents] = useState([
        { id: 'e1', name: 'A', prob: '' },
        { id: 'e2', name: 'B', prob: '' }
    ]);

    const pseudoVar = useMemo(() => {
        if (varSeleccionada && varSeleccionada.nombresColumnas && varSeleccionada.nombresColumnas.length > 0) {
            return varSeleccionada;
        }
        if (statsDatos?.total > 0) {
            return {
                nombre: 'Datos Manuales',
                nombresColumnas: ['Valores']
            };
        }
        return null;
    }, [varSeleccionada, statsDatos]);

    const valoresUnicosA = useMemo(() => {
        if (!pseudoVar || !colA) return [];
        const colIndex = pseudoVar.nombresColumnas?.indexOf(colA);
        if (colIndex === -1 || colIndex === undefined) return [];
        const vals = filas.map(f => f.valor.split(' | ').map(p => p.trim())[colIndex]).filter(Boolean);
        return [...new Set(vals)].sort();
    }, [pseudoVar, colA, filas]);

    const valoresUnicosB = useMemo(() => {
        if (!pseudoVar || !colB) return [];
        const colIndex = pseudoVar.nombresColumnas?.indexOf(colB);
        if (colIndex === -1 || colIndex === undefined) return [];
        const vals = filas.map(f => f.valor.split(' | ').map(p => p.trim())[colIndex]).filter(Boolean);
        return [...new Set(vals)].sort();
    }, [pseudoVar, colB, filas]);

    const calcular = () => {
        if (inputMode === 'manual') {
            const parsedEvents = manualEvents.map(e => ({
                name: e.name.trim() || 'X',
                prob: parseFloat(e.prob)
            }));

            for (const e of parsedEvents) {
                if (isNaN(e.prob) || e.prob < 0 || e.prob > 1) {
                    setAlerta({ isOpen: true, mensaje: "Todas las probabilidades deben ser numéricas y estar entre 0 y 1." });
                    setResultado(null);
                    return;
                }
            }

            const pJoint = parsedEvents.reduce((acc, curr) => acc * curr.prob, 1);

            // Create a structure compatible with both Matrix and Manual modes
            setResultado({
                isManualDinamic: true,
                events: parsedEvents,
                pAandB: pJoint,
                // Fallbacks para que no rompa props legacy si se acceden
                pA: parsedEvents[0]?.prob || 0,
                pB: parsedEvents[1]?.prob || 0,
                nameA: parsedEvents[0]?.name || 'A',
                nameB: parsedEvents[1]?.name || 'B',
            });
            setError('');
            return;
        }

        if (!pseudoVar) {
            setAlerta({ isOpen: true, mensaje: "Importa una Matriz o agrega datos en el editor primero." });
            setResultado(null);
            return;
        }
        if (!colA) {
            setAlerta({ isOpen: true, mensaje: <span>Selecciona la Variable de <InlineMath math="A" /> (Extracción 1) antes de calcular.</span> });
            setResultado(null);
            return;
        }
        if (!valA) {
            setAlerta({ isOpen: true, mensaje: <span>Selecciona la Condición de <InlineMath math="A" /> antes de calcular.</span> });
            setResultado(null);
            return;
        }
        if (!colB) {
            setAlerta({ isOpen: true, mensaje: <span>Selecciona la Variable de <InlineMath math="B" /> (Extracción 2) antes de calcular.</span> });
            setResultado(null);
            return;
        }
        if (!valB) {
            setAlerta({ isOpen: true, mensaje: <span>Selecciona la Condición de <InlineMath math="B" /> antes de calcular.</span> });
            setResultado(null);
            return;
        }

        const res = calcularReglaMultiplicacion(filas, pseudoVar.nombresColumnas, colA, valA, colB, valB, modReemplazo);
        if (res.error) {
            setError(res.error);
            setResultado(null);
        } else {
            setResultado(res.resultado);
            setError('');
        }
    };

    useEffect(() => {
        setResultado(null);
        setError('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [colA, valA, colB, valB, modReemplazo, pseudoVar, filas, inputMode]);

    const numHojas = inputMode === 'manual' ? 1 : (valoresUnicosA.length || 0) * (valoresUnicosB.length || 0);
    const altoArbol = Math.max(450, numHojas * 70 + 100);

    return (
        <div style={{ marginTop: '0px', fontFamily: FONT }}>
            {/* SELECTOR DE MODO DE ENTRADA */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'inline-flex', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                    <button
                        type="button"
                        className={`btn-mat251-modo ${inputMode === 'matriz' ? 'active' : ''}`}
                        onClick={() => setInputMode('matriz')}
                    >
                        Análisis de Matriz
                    </button>
                    <button
                        type="button"
                        className={`btn-mat251-modo ${inputMode === 'manual' ? 'active' : ''}`}
                        onClick={() => setInputMode('manual')}
                    >
                        Modo Manual
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                {inputMode === 'manual' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '15px' }}>
                        <h4 style={{ marginBottom: '5px', fontSize: FS.sm, fontWeight: 700, color: 'var(--primary-color)' }}>Datos del Ejercicio</h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ width: '100%', background: 'var(--bg-input)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                                <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px', fontWeight: 600 }}>Tipo de Extracción:</label>
                                <select
                                    value={modReemplazo}
                                    onChange={(e) => setModReemplazo(e.target.value)}
                                    className="container_cal_input"
                                    style={{ width: '100%', maxWidth: '300px', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '2px solid var(--primary-color)', background: 'var(--bg-card)', color: 'var(--text-color)', fontWeight: 600 }}
                                >
                                    <option value="con_reemplazo">Con reemplazo (Independientes)</option>
                                    <option value="sin_reemplazo">Sin reemplazo (Dependientes)</option>
                                </select>
                            </div>

                            {manualEvents.map((event, index) => {
                                const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                                const defaultLetter = letters[index % 26];

                                let labelMath = `P(${event.name || defaultLetter})`;
                                if (modReemplazo === 'sin_reemplazo' && index > 0) {
                                    const prevNames = manualEvents.slice(0, index).map((e, i) => e.name || letters[i]).join('\\cap ');
                                    labelMath = `P(${event.name || defaultLetter}|${prevNames})`;
                                }

                                return (
                                    <div key={event.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', background: 'var(--bg-input)', padding: '10px', borderRadius: RADIUS, border: '1px solid var(--border-color)', position: 'relative' }}>
                                        {index >= 2 && (
                                            <button 
                                                onClick={() => {
                                                    const newEvents = [...manualEvents];
                                                    newEvents.splice(index, 1);
                                                    setManualEvents(newEvents);
                                                }}
                                                style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', borderRadius: '4px' }}
                                                title="Eliminar extracción"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            </button>
                                        )}
                                        <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <label style={labelStyle}>Evento <span dangerouslySetInnerHTML={{ __html: katex.renderToString(defaultLetter) }} />:</label>
                                            <input
                                                type="text"
                                                value={event.name}
                                                onChange={(e) => {
                                                    const newEvents = [...manualEvents];
                                                    newEvents[index].name = e.target.value;
                                                    setManualEvents(newEvents);
                                                }}
                                                placeholder={`Ej. ${defaultLetter}`}
                                                style={{ padding: '8px 12px', borderRadius: RADIUS, border: '1px solid var(--border-color)', fontSize: FS.sm, outline: 'none', background: 'var(--bg-card)', color: 'var(--text-color)', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                        <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ ...labelStyle, marginBottom: 0 }}>Probabilidad</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: FS.sm, color: 'var(--text-main)', whiteSpace: 'nowrap' }} dangerouslySetInnerHTML={{ __html: katex.renderToString(labelMath) + ':' }} />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="1"
                                                    value={event.prob}
                                                    onChange={(e) => {
                                                        const newEvents = [...manualEvents];
                                                        newEvents[index].prob = e.target.value;
                                                        setManualEvents(newEvents);
                                                    }}
                                                    placeholder="0.00"
                                                    style={{ padding: '8px 12px', borderRadius: RADIUS, border: '1px solid var(--border-color)', fontSize: FS.sm, outline: 'none', background: 'var(--bg-card)', color: 'var(--text-color)', width: '100%', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                                <button
                                    onClick={() => {
                                        setManualEvents([...manualEvents, { id: `e${Date.now()}`, name: '', prob: '' }]);
                                    }}
                                    className="btn-primary"
                                    style={{ padding: '5px 14px', borderRadius: RADIUS, fontSize: FS.sm, fontWeight: 700, cursor: 'pointer' }}
                                >
                                    Agregar nueva Extracción
                                </button>
                            </div>

                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
                                <button
                                    onClick={calcular}
                                    className="button_calcular"
                                    style={{ padding: '5px 15px', borderRadius: RADIUS, fontSize: FS.sm, fontWeight: 700, height: '38px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', width: 'fit-content' }}
                                >
                                    CALCULAR
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <div>
                                <span style={{ ...labelStyle, margin: 0 }}>Datos:</span>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                                    <small title="Datos provenientes de variables externas" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                        Cargados: <strong style={{ color: 'var(--primary-color)' }}>{statsDatos?.cargados || 0}</strong>
                                    </small>
                                    <small title="Datos ingresados manualmente" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                        Agregados: <strong style={{ color: '#3b82f6' }}>{statsDatos?.agregados || 0}</strong>
                                    </small>
                                    <small title="Total de datos válidos" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                        Total: <strong>{statsDatos?.total || 0}</strong>
                                    </small>
                                </div>
                            </div>
                            <button
                                onClick={abrirEditor}
                                className="btn-primary btn-icon"
                                style={{ borderRadius: RADIUS, fontSize: FS.sm, padding: '5px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <EditarDatos /> Editar Datos
                            </button>
                        </div>

                        <h4 style={{ color: 'var(--primary-color)', margin: '0 0 15px 0', fontSize: FS.sm }}>
                            Parámetros de las Extracciones Sucesivas:
                        </h4>

                        {pseudoVar && pseudoVar.nombresColumnas && pseudoVar.nombresColumnas.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-start', background: 'var(--bg-input)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                                {/* MODALIDAD */}
                                <div style={{ width: '100%', marginBottom: '5px' }}>
                                    <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px', fontWeight: 600 }}>Tipo de Extracción:</label>
                                    <select
                                        value={modReemplazo}
                                        onChange={(e) => setModReemplazo(e.target.value)}
                                        className="container_cal_input"
                                        style={{ width: '100%', maxWidth: '300px', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '2px solid var(--primary-color)', fontWeight: 600 }}
                                    >
                                        <option value="con_reemplazo">Con reemplazo (Independientes)</option>
                                        <option value="sin_reemplazo">Sin reemplazo (Dependientes)</option>
                                    </select>
                                </div>

                                {/* EXTRACCIÓN 1 (A) */}
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontWeight: 600 }}>
                                        Variable de <span dangerouslySetInnerHTML={{ __html: katex.renderToString('A') }} /> (Extracción 1):
                                    </label>
                                    <select
                                        value={colA}
                                        onChange={(e) => { setColA(e.target.value); setValA(''); }}
                                        className="container_cal_input"
                                        style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '1px solid var(--border-color)', marginBottom: '8px' }}
                                    >
                                        <option value="">-- Seleccionar Variable --</option>
                                        {pseudoVar.nombresColumnas.map(col => <option key={col} value={col}>{col}</option>)}
                                    </select>

                                    {colA && valoresUnicosA.length > 0 && (
                                        <>
                                            <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px', color: 'var(--primary-color)', fontWeight: 'bold' }}>Condición de <span dangerouslySetInnerHTML={{ __html: katex.renderToString('A') }} />:</label>
                                            <select
                                                value={valA}
                                                onChange={(e) => setValA(e.target.value)}
                                                className="container_cal_input"
                                                style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '2px solid var(--primary-color)' }}
                                            >
                                                <option value="">-- Seleccionar --</option>
                                                {valoresUnicosA.map(val => <option key={val} value={val}>{val}</option>)}
                                            </select>
                                        </>
                                    )}
                                </div>

                                {/* EXTRACCIÓN 2 (B) */}
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontWeight: 600 }}>
                                        Variable de <span dangerouslySetInnerHTML={{ __html: katex.renderToString('B') }} /> (Extracción 2):
                                    </label>
                                    <select
                                        value={colB}
                                        onChange={(e) => { setColB(e.target.value); setValB(''); }}
                                        className="container_cal_input"
                                        style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '1px solid var(--border-color)', marginBottom: '8px' }}
                                    >
                                        <option value="">-- Seleccionar Variable --</option>
                                        {pseudoVar.nombresColumnas.map(col => <option key={col} value={col}>{col}</option>)}
                                    </select>

                                    {colB && valoresUnicosB.length > 0 && (
                                        <>
                                            <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px', color: 'var(--primary-color)', fontWeight: 'bold' }}>Condición de <span dangerouslySetInnerHTML={{ __html: katex.renderToString('B') }} />:</label>
                                            <select
                                                value={valB}
                                                onChange={(e) => setValB(e.target.value)}
                                                className="container_cal_input"
                                                style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '2px solid var(--primary-color)' }}
                                            >
                                                <option value="">-- Seleccionar --</option>
                                                {valoresUnicosB.map(val => <option key={val} value={val}>{val}</option>)}
                                            </select>
                                        </>
                                    )}
                                </div>

                                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                                    <button
                                        onClick={calcular}
                                        className="button_calcular"
                                        style={{ padding: '5px 15px', borderRadius: RADIUS, fontSize: FS.sm, fontWeight: 700, height: '38px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', width: 'fit-content' }}
                                    >
                                        CALCULAR
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: FS.sm }}>
                                Importa una matriz o agrega datos en el panel superior para comenzar.
                            </p>
                        )}
                    </>
                )}

                {error && (
                    <div style={{ marginTop: '15px', padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: RADIUS, border: '1px solid #f87171', fontWeight: 'bold', fontSize: FS.xs }}>
                        {error}
                    </div>
                )}
            </div>

            {resultado && (
                <>
                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: 'var(--primary-color)', margin: '0 0 10px 0', fontSize: FS.sm }}>
                            Desglose de Probabilidades Sucesivas:
                        </h4>
                        <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: RADIUS }}>
                            <table className="table-header-responsive" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: FS.sm }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-input)', borderBottom: '2px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                                        <th style={{ padding: '8px 6px', width: inputMode === 'manual' ? '33.33%' : 'auto' }}>Paso</th>
                                        <th style={{ padding: '8px 6px', width: inputMode === 'manual' ? '33.33%' : 'auto' }}>Evento Extraído</th>
                                        {inputMode !== 'manual' && (
                                            <th style={{ padding: '8px 6px', color: 'var(--text-muted)', fontWeight: 500 }}>Fracción <span dangerouslySetInnerHTML={{ __html: katex.renderToString('(n/N)') }} /></th>
                                        )}
                                        <th style={{ padding: '8px 6px', width: inputMode === 'manual' ? '33.33%' : 'auto' }}>Probabilidad <span dangerouslySetInnerHTML={{ __html: katex.renderToString('(P)') }} /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultado.isManualDinamic ? (
                                        resultado.events.map((ev, i) => (
                                            <tr key={i} style={{ borderBottom: i === resultado.events.length - 1 ? 'none' : '1px solid var(--border-color)', background: i % 2 !== 0 ? 'rgba(128, 128, 128, 0.05)' : 'transparent' }}>
                                                <td style={{ padding: '8px 6px', fontWeight: 600 }}>Extracción {i + 1}</td>
                                                <td style={{ padding: '8px 6px', fontWeight: 600 }}>
                                                    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(String.fromCharCode(65 + i)) }} />: {ev.name} {modReemplazo === 'sin_reemplazo' && i > 0 && `(dado anterior)`}
                                                </td>
                                                <td style={{ padding: '8px 6px', fontWeight: 'bold' }}>{ev.prob.toFixed(4)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <>
                                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={{ padding: '8px 6px', fontWeight: 600 }}>Extracción 1</td>
                                                <td style={{ padding: '8px 6px', fontWeight: 600 }}><span dangerouslySetInnerHTML={{ __html: katex.renderToString('A') }} />: {resultado.nameA}</td>
                                                <td style={{ padding: '8px 6px', color: 'var(--text-muted)' }}>{resultado.countA} / {resultado.totalA}</td>
                                                <td style={{ padding: '8px 6px', fontWeight: 'bold' }}>{resultado.pA.toFixed(4)}</td>
                                            </tr>
                                            <tr style={{ borderBottom: 'none', background: 'rgba(128, 128, 128, 0.05)' }}>
                                                <td style={{ padding: '8px 6px', fontWeight: 600 }}>Extracción 2</td>
                                                <td style={{ padding: '8px 6px', fontWeight: 600 }}><span dangerouslySetInnerHTML={{ __html: katex.renderToString('B') }} />: {resultado.nameB} {modReemplazo === 'sin_reemplazo' && '(dado A)'}</td>
                                                <td style={{ padding: '8px 6px', color: 'var(--text-muted)' }}>{resultado.countB} / {resultado.totalB}</td>
                                                <td style={{ padding: '8px 6px', fontWeight: 'bold' }}>{resultado.pB.toFixed(4)}</td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: 'var(--primary-color)', fontSize: FS.sm, margin: '0 0 10px 0' }}>
                            Desarrollo Matemático: Regla de la Multiplicación
                        </h4>
                        <FormulaMultiplicacion resultado={resultado} modReemplazo={modReemplazo} inputMode={inputMode} />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <MarcoWidgetMAT251 id="w-flow-linear" titulo="Flujo Lineal de Extracción" anchoCompleto={true} alto="auto">
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', minWidth: 0, padding: '20px', overflowX: 'auto' }}>
                                <DiagramaFlujoSucesivo resultado={resultado} modReemplazo={modReemplazo} />
                            </div>
                        </MarcoWidgetMAT251>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <MarcoWidgetMAT251 id="w-flow-tree" titulo="Árbol de Probabilidades Sucesivas" anchoCompleto={true} alto="auto">
                            <div style={{ width: '100%', minWidth: 0, padding: '20px', overflowX: 'hidden', overflowY: 'hidden' }}>
                                <ArbolProbabilidades
                                    resultado={resultado}
                                    filas={filas}
                                    varSeleccionada={pseudoVar}
                                    colA={colA}
                                    colB={colB}
                                    modReemplazo={modReemplazo}
                                    inputMode={inputMode}
                                />
                            </div>
                        </MarcoWidgetMAT251>
                    </div>
                </>
            )}

            <ModalAlerta 
                isOpen={alerta.isOpen} 
                mensaje={alerta.mensaje} 
                onClose={() => setAlerta({ ...alerta, isOpen: false })} 
            />
        </div>
    );
}
