import React, { useEffect, useRef, useMemo, useState } from 'react';
import { FONT, FS, RADIUS, cardStyle, labelStyle } from '../../../Principal/Constantes';
import katex from 'katex';
import DiagramaFlujoSucesivo from '../../../Graficas/Tema_1/DiagramaFlujoSucesivo';
import ArbolProbabilidades from '../../../Graficas/Tema_1/ArbolProbabilidades';
import { EditarDatos } from '../../../../../ui/iconos';
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
                const pct = (resultado.pAandB * 100).toFixed(2);
                latexDesarrollo += `P(${intersecString}) &= ${resultado.pAandB.toFixed(4)} \\quad \\Rightarrow \\quad \\mathbf{${pct}\\%}\n`;
                
            } else {
                if (modReemplazo === 'con_reemplazo') {
                    latexGeneral = `\\displaystyle P(A \\cap B) = P(A) \\times P(B)`;
                } else {
                    latexGeneral = `\\displaystyle P(A \\cap B) = P(A) \\times P(B|A)`;
                }
                latexDesarrollo += `P(A \\cap B) &= ${resultado.pA.toFixed(4)} \\times ${resultado.pB.toFixed(4)} \\\\\n`;
                const pct = (resultado.pAandB * 100).toFixed(2);
                latexDesarrollo += `P(A \\cap B) &= ${resultado.pAandB.toFixed(4)} \\quad \\Rightarrow \\quad \\mathbf{${pct}\\%}\n`;
            }
            
            latexDesarrollo += `\\end{aligned}`;

            katex.render(latexGeneral, formulaGeneralRef.current, { throwOnError: false, displayMode: true });
            katex.render(latexDesarrollo, formulaDesarrolloRef.current, { throwOnError: false, displayMode: false });
        }
    }, [resultado, modReemplazo, inputMode]);

    return (
        <div className="katex-responsive-container" style={{ width: '100%', maxWidth: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-pure)', boxSizing: 'border-box' }}>
            <div className="formula-general-box formula-scroll-container thin-scrollbar" style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', marginBottom: '5px', padding: '5px 15px', background: 'transparent', border: 'none', borderRadius: RADIUS, textAlign: 'center', color: 'var(--text-pure)', boxSizing: 'border-box' }}>
                <div ref={formulaGeneralRef} className="formula-general-box" style={{ color: 'var(--text-pure)', display: 'inline-block', minWidth: 'max-content' }}></div>
            </div>
            <div className="formula-desarrollo-box formula-scroll-container thin-scrollbar" style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '15px 10px', borderRadius: RADIUS, textAlign: 'left', color: 'var(--text-pure)', boxSizing: 'border-box' }}>
                <div ref={formulaDesarrolloRef} style={{ color: 'var(--text-pure)', display: 'inline-block', minWidth: 'max-content' }}></div>
            </div>
        </div>
    );
};

// COMPONENTE SELECTOR PERSONALIZADO
const CustomSelect = ({ value, onChange, options, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const getDisplayText = () => {
        if (!value) return placeholder;
        const found = options.find(o => o.value === value);
        return found ? found.label : value;
    };

    return (
        <div ref={ref} style={{ position: 'relative', width: '100%', fontFamily: FONT }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    minHeight: '38px',
                    padding: '8px 12px',
                    background: 'var(--bg-input)',
                    border: `1px solid ${isOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    borderRadius: RADIUS, cursor: 'pointer',
                    boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
                    transition: 'all 0.2s ease',
                    color: 'var(--text-pure)',
                    userSelect: 'none',
                    fontSize: FS.sm,
                    boxSizing: 'border-box'
                }}
            >
                <span style={{ fontWeight: 500, color: value ? 'var(--text-pure)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85%' }}>
                    {getDisplayText()}
                </span>
                <svg style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0, color: 'var(--text-muted)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>

            {isOpen && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: RADIUS,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                    zIndex: 1000,
                    maxHeight: '260px',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                }} className="thin-scrollbar">
                    {options.length === 0 && (
                        <div style={{ padding: '9px 12px', color: 'var(--text-muted)', fontSize: FS.sm, fontStyle: 'italic' }}>
                            Sin opciones
                        </div>
                    )}
                    {options.map((opt, idx) => {
                        const isSelected = value === opt.value;
                        const isSpecial = opt.value === '';
                        
                        return (
                            <div
                                key={idx}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                style={{
                                    padding: '9px 12px',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
                                    background: isSelected && !isSpecial ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                                    borderBottom: idx < options.length - 1 ? '1px solid var(--border-color)' : 'none',
                                    color: isSelected && !isSpecial ? 'var(--primary-color)' : (isSpecial ? 'var(--text-muted)' : 'var(--text-pure)'),
                                    fontSize: FS.sm,
                                    fontWeight: isSelected && !isSpecial ? 600 : 400,
                                    transition: 'background 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = isSelected && !isSpecial ? 'rgba(37, 99, 235, 0.14)' : 'var(--bg-input)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = isSelected && !isSpecial ? 'rgba(37, 99, 235, 0.08)' : 'transparent';
                                }}
                            >
                                <span style={{ fontStyle: isSpecial ? 'italic' : 'normal' }}>{opt.label}</span>
                                {isSelected && !isSpecial && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            </div>
                        );
                    })}
                </div>
            )}
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
    const [resultadoManual, setResultadoManual] = useState(null);
    const [errorManual, setErrorManual] = useState('');

    // Segregación total entre modo matriz y modo manual
    const activeResultado = inputMode === 'manual' ? resultadoManual : resultado;
    const activeError = inputMode === 'manual' ? errorManual : error;

    const opcionesModoReemplazo = [
        { value: 'con_reemplazo', label: 'Con reemplazo (Independientes)' },
        { value: 'sin_reemplazo', label: 'Sin reemplazo (Dependientes)' }
    ];

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

    // Garantizar exclusión mutua estricta: si colA y colB coinciden, limpiar colB
    useEffect(() => {
        if (colA && colB && colA === colB) {
            setColB('');
            setValB('');
        }
    }, [colA, colB, setColB, setValB]);

    // Si cambian las columnas y la selección ya no existe en la matriz, limpiarla
    useEffect(() => {
        if (pseudoVar && pseudoVar.nombresColumnas) {
            if (colA && !pseudoVar.nombresColumnas.includes(colA)) {
                setColA('');
                setValA('');
            }
            if (colB && !pseudoVar.nombresColumnas.includes(colB)) {
                setColB('');
                setValB('');
            }
        }
    }, [pseudoVar, colA, colB, setColA, setValA, setColB, setValB]);

    const calcular = () => {
        if (inputMode === 'manual') {
            const parsedEvents = manualEvents.map(e => ({
                name: e.name.trim() || 'X',
                prob: parseFloat(e.prob)
            }));

            for (const e of parsedEvents) {
                if (isNaN(e.prob) || e.prob < 0 || e.prob > 1) {
                    setAlerta({ isOpen: true, mensaje: "Todas las probabilidades deben ser numéricas y estar entre 0 y 1." });
                    setResultadoManual(null);
                    setResultado(null);
                    return;
                }
            }

            const pJoint = parsedEvents.reduce((acc, curr) => acc * curr.prob, 1);

            const resultadoCalculado = {
                isManualDinamic: true,
                events: parsedEvents,
                pAandB: pJoint,
                pA: parsedEvents[0]?.prob || 0,
                pB: parsedEvents[1]?.prob || 0,
                nameA: parsedEvents[0]?.name || 'A',
                nameB: parsedEvents[1]?.name || 'B',
                modo: 'manual',
                modReemplazo
            };
            setResultadoManual(resultadoCalculado);
            setResultado(resultadoCalculado);
            setErrorManual('');
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
            setResultado({
                ...res.resultado,
                modo: 'matriz',
                modReemplazo,
                colA,
                valA,
                colB,
                valB
            });
            setError('');
        }
    };

    // El reporte usa el último resultado calculado; al cambiar de modo se invalida
    // para no exportar por error el resultado del modo anterior.
    useEffect(() => {
        setResultado(null);
        setResultadoManual(null);
        setError('');
        setErrorManual('');
    }, [inputMode]);

    // Limpiar resultado de matriz cuando cambian sus datos o selecciones
    useEffect(() => {
        setResultado(null);
        setError('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [colA, valA, colB, valB, modReemplazo, pseudoVar, filas]);

    // Limpiar resultado manual cuando cambian sus datos
    useEffect(() => {
        setResultadoManual(null);
        setErrorManual('');
        if (inputMode === 'manual') setResultado(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [manualEvents, modReemplazo, inputMode]);

    return (
        <div style={{ marginTop: '10px', fontFamily: FONT }}>
            {/* SELECTOR DE MODO DE ENTRADA */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <div id="tour-mult-modos-entrada" className="contenedor-selector-modos-mat251">
                    <button
                        type="button"
                        className={`btn-mat251-modo ${inputMode === 'matriz' ? 'active' : ''}`}
                        onClick={() => setInputMode('matriz')}
                        style={{ fontFamily: FONT }}
                    >
                        Análisis de Matriz
                    </button>
                    <button
                        type="button"
                        className={`btn-mat251-modo ${inputMode === 'manual' ? 'active' : ''}`}
                        onClick={() => setInputMode('manual')}
                        style={{ fontFamily: FONT }}
                    >
                        Modo Manual
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
                {inputMode === 'manual' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
                        <h4 style={{ margin: '0 0 0px 0', fontSize: FS.sm, fontWeight: 'bold', color: 'var(--text-pure)' }}>Datos:</h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div id="tour-mult-manual-tipo-extraccion" style={{ width: '100%', background: 'var(--bg-input)', padding: '12px', borderRadius: RADIUS, border: '1px solid var(--border-color)', boxSizing: 'border-box' }}>
                                <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px', fontWeight: 600, color: 'var(--text-pure)' }}>Tipo de Extracción:</label>
                                <div style={{ maxWidth: '300px' }}>
                                    <CustomSelect
                                        value={modReemplazo}
                                        onChange={(val) => setModReemplazo(val)}
                                        options={opcionesModoReemplazo}
                                        placeholder="-- Seleccionar Tipo --"
                                    />
                                </div>
                            </div>

                            <div id="tour-mult-manual-eventos" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                                                className="input-mat251 placeholder-small"
                                                style={{ padding: '8px 12px', borderRadius: RADIUS, border: '1px solid var(--border-color)', fontSize: FS.sm, outline: 'none', background: 'var(--bg-card)', color: 'var(--text-color)', boxSizing: 'border-box' }}
                                            />
                                        </div>
                                        <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ ...labelStyle, marginBottom: 0 }}>Probabilidad</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: FS.sm, color: 'var(--text-pure)', whiteSpace: 'nowrap' }} dangerouslySetInnerHTML={{ __html: katex.renderToString(labelMath) + ':' }} />
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
                                                    className="input-mat251 placeholder-small"
                                                    style={{ padding: '8px 12px', borderRadius: RADIUS, border: '1px solid var(--border-color)', fontSize: FS.sm, outline: 'none', background: 'var(--bg-card)', color: 'var(--text-color)', width: '100%', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            </div>
                            
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
                                <button
                                    id="tour-mult-manual-btn-agregar"
                                    onClick={() => {
                                        setManualEvents([...manualEvents, { id: `e${Date.now()}`, name: '', prob: '' }]);
                                    }}
                                    className="btn-primary"
                                    style={{ padding: '5px 14px', borderRadius: RADIUS, fontSize: FS.sm, fontWeight: 600, fontFamily: FONT, cursor: 'pointer' }}
                                >
                                    Agregar nueva Extracción
                                </button>
                            </div>

                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '0px' }}>
                                <button
                                    id="tour-mult-manual-btn-calcular"
                                    type="button"
                                    onClick={calcular}
                                    className="button_calcular"
                                    style={{
                                        width: 'fit-content',
                                        padding: '5px 20px',
                                        borderRadius: RADIUS,
                                        fontSize: FS.md,
                                        fontWeight: 600,
                                        fontFamily: FONT,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    CALCULAR
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ── BARRA DE DATOS Y EDITOR (Solo en Matriz) ── */}
                        <div id="tour-mult-datos" style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <div>
                                <span style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)' }}>Datos:</span>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                                    <small title="Datos provenientes de variables externas" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                        Cargados: <strong style={{ color: 'var(--text-pure)' }}>{statsDatos?.cargados || 0}</strong>
                                    </small>
                                    <small title="Datos ingresados manualmente" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                        Agregados: <strong style={{ color: 'var(--text-pure)' }}>{statsDatos?.agregados || 0}</strong>
                                    </small>
                                    <small title="Total de datos válidos" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                        Total: <strong style={{ color: 'var(--text-pure)' }}>{statsDatos?.total || 0}</strong>
                                    </small>
                                </div>
                            </div>
                            <button
                                onClick={abrirEditor}
                                className="btn-primary btn-icon"
                                style={{ borderRadius: RADIUS, fontSize: FS.sm, fontFamily: FONT, fontWeight: 600, padding: '5px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                                <EditarDatos /> Editar Datos
                            </button>
                        </div>

                        <h4 style={{ color: 'var(--text-pure)', margin: '0 0 12px 0', fontSize: FS.sm, fontWeight: 'bold' }}>
                            Parámetros de las Extracciones Sucesivas:
                        </h4>

                        {pseudoVar && pseudoVar.nombresColumnas && pseudoVar.nombresColumnas.length > 0 ? (
                            <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: RADIUS, border: '1px solid var(--border-color)', marginBottom: '15px' }}>
                                {/* MODALIDAD */}
                                <div id="tour-mult-tipo-extraccion" style={{ width: '100%', marginBottom: '12px' }}>
                                    <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px', fontWeight: 600, color: 'var(--text-pure)' }}>Tipo de Extracción:</label>
                                    <div style={{ maxWidth: '300px' }}>
                                        <CustomSelect
                                            value={modReemplazo}
                                            onChange={(val) => setModReemplazo(val)}
                                            options={opcionesModoReemplazo}
                                            placeholder="-- Seleccionar Tipo --"
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '15px', alignItems: 'flex-start' }}>
                                    {/* EXTRACCIÓN 1 (A) */}
                                    <div id="tour-mult-extraccion-1" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div>
                                            <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontWeight: 600, color: 'var(--text-pure)' }}>
                                                Variable de <span style={{ color: 'var(--text-pure)' }} dangerouslySetInnerHTML={{ __html: katex.renderToString('A') }} /> (Extracción 1):
                                            </label>
                                            <CustomSelect
                                                value={colA}
                                                onChange={(val) => {
                                                    setColA(val);
                                                    setValA('');
                                                    if (val && val === colB) {
                                                        setColB('');
                                                        setValB('');
                                                    }
                                                }}
                                                options={[
                                                    { value: '', label: '-- Seleccionar Variable --' },
                                                    ...pseudoVar.nombresColumnas.filter(col => !colB || col !== colB).map(col => ({ value: col, label: col }))
                                                ]}
                                                placeholder="-- Seleccionar Variable --"
                                            />
                                        </div>

                                        {colA && valoresUnicosA.length > 0 && (
                                            <div>
                                                <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontWeight: 600, color: 'var(--text-pure)' }}>
                                                    Condición de <span style={{ color: 'var(--text-pure)' }} dangerouslySetInnerHTML={{ __html: katex.renderToString('A') }} />:
                                                </label>
                                                <CustomSelect
                                                    value={valA}
                                                    onChange={(val) => setValA(val)}
                                                    options={[
                                                        { value: '', label: '-- Seleccionar --' },
                                                        ...valoresUnicosA.map(val => ({ value: val, label: val }))
                                                    ]}
                                                    placeholder="-- Seleccionar --"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* EXTRACCIÓN 2 (B) */}
                                    <div id="tour-mult-extraccion-2" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div>
                                            <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontWeight: 600, color: 'var(--text-pure)' }}>
                                                Variable de <span style={{ color: 'var(--text-pure)' }} dangerouslySetInnerHTML={{ __html: katex.renderToString('B') }} /> (Extracción 2):
                                            </label>
                                            <CustomSelect
                                                value={colB}
                                                onChange={(val) => {
                                                    setColB(val);
                                                    setValB('');
                                                    if (val && val === colA) {
                                                        setColA('');
                                                        setValA('');
                                                    }
                                                }}
                                                options={[
                                                    { value: '', label: '-- Seleccionar Variable --' },
                                                    ...pseudoVar.nombresColumnas.filter(col => !colA || col !== colA).map(col => ({ value: col, label: col }))
                                                ]}
                                                placeholder="-- Seleccionar Variable --"
                                            />
                                        </div>

                                        {colB && valoresUnicosB.length > 0 && (
                                            <div>
                                                <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontWeight: 600, color: 'var(--text-pure)' }}>
                                                    Condición de <span style={{ color: 'var(--text-pure)' }} dangerouslySetInnerHTML={{ __html: katex.renderToString('B') }} />:
                                                </label>
                                                <CustomSelect
                                                    value={valB}
                                                    onChange={(val) => setValB(val)}
                                                    options={[
                                                        { value: '', label: '-- Seleccionar --' },
                                                        ...valoresUnicosB.map(val => ({ value: val, label: val }))
                                                    ]}
                                                    placeholder="-- Seleccionar --"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '0px' }}>
                                    <button
                                        id="tour-mult-btn-calcular"
                                        type="button"
                                        onClick={calcular}
                                        className="button_calcular"
                                        style={{
                                            width: 'fit-content',
                                            padding: '5px 20px',
                                            borderRadius: RADIUS,
                                            fontSize: FS.md,
                                            fontWeight: 600,
                                            fontFamily: FONT,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        CALCULAR
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: FS.xs }}>
                                Importa una matriz o agrega datos en el panel superior para comenzar.
                            </p>
                        )}
                    </>
                )}

                {activeError && (
                    <div style={{ marginTop: '15px', padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: RADIUS, border: '1px solid #f87171', fontWeight: 'bold', fontSize: FS.xs }}>
                        {activeError}
                    </div>
                )}
            </div>

            {activeResultado && (
                <>
                    <div id="tour-mult-tabla-desglose" style={{ marginBottom: '20px' }}>
                        <h3 style={{ color: 'var(--text-pure)', margin: '0 0 10px 0', fontSize: FS.md, fontWeight: 'bold', textAlign: 'center' }}>
                            Desglose de Probabilidades Sucesivas
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: FS.sm, color: 'var(--text-pure)' }}>
                                <thead>
                                    <tr className="table-header-responsive" style={{ background: 'var(--bg-input)', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                                        <th style={{ padding: '10px 8px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold', width: inputMode === 'manual' ? '33.33%' : 'auto' }}>Paso</th>
                                        <th style={{ padding: '10px 8px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold', width: inputMode === 'manual' ? '33.33%' : 'auto' }}>Evento Extraído</th>
                                        {inputMode !== 'manual' && (
                                            <th style={{ padding: '10px 8px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold' }}>Fracción <span dangerouslySetInnerHTML={{ __html: katex.renderToString('(n/N)') }} /></th>
                                        )}
                                        <th style={{ padding: '10px 8px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold', width: inputMode === 'manual' ? '33.33%' : 'auto' }}>Probabilidad <span dangerouslySetInnerHTML={{ __html: katex.renderToString('(P)') }} /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeResultado.isManualDinamic ? (
                                        activeResultado.events.map((ev, i) => (
                                            <tr key={i}>
                                                <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold', fontSize: '0.8rem' }}>Extracción {i + 1}</td>
                                                <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                                    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(String.fromCharCode(65 + i)) }} />: {ev.name} {modReemplazo === 'sin_reemplazo' && i > 0 && `(dado anterior)`}
                                                </td>
                                                <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: '0.8rem' }}>
                                                    <InlineMath math={ev.prob.toFixed(4)} />
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <>
                                            <tr>
                                                <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold', fontSize: '0.8rem' }}>Extracción 1</td>
                                                <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold', fontSize: '0.8rem' }}><span dangerouslySetInnerHTML={{ __html: katex.renderToString('A') }} />: {activeResultado.nameA}</td>
                                                <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: '0.8rem' }}>
                                                    <InlineMath math={`${activeResultado.countA} / ${activeResultado.totalA}`} />
                                                </td>
                                                <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: '0.8rem' }}>
                                                    <InlineMath math={activeResultado.pA.toFixed(4)} />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold', fontSize: '0.8rem' }}>Extracción 2</td>
                                                <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold', fontSize: '0.8rem' }}><span dangerouslySetInnerHTML={{ __html: katex.renderToString('B') }} />: {activeResultado.nameB} {modReemplazo === 'sin_reemplazo' && '(dado A)'}</td>
                                                <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: '0.8rem' }}>
                                                    <InlineMath math={`${activeResultado.countB} / ${activeResultado.totalB}`} />
                                                </td>
                                                <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: '0.8rem' }}>
                                                    <InlineMath math={activeResultado.pB.toFixed(4)} />
                                                </td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div id="tour-mult-formula" style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: 'var(--text-pure)', fontSize: FS.sm, margin: '15px 0 10px 0', fontWeight: 'bold', textAlign: 'center' }}>
                            Regla de la Multiplicación
                        </h4>
                        <FormulaMultiplicacion resultado={activeResultado} modReemplazo={modReemplazo} inputMode={inputMode} />
                    </div>

                    <div id="tour-mult-flujo" style={{ marginBottom: '20px' }}>
                        <DiagramaFlujoSucesivo resultado={activeResultado} modReemplazo={modReemplazo} />
                    </div>

                    <div id="tour-mult-arbol" style={{ marginBottom: '20px' }}>
                        <ArbolProbabilidades
                            resultado={activeResultado}
                            filas={filas}
                            varSeleccionada={pseudoVar}
                            colA={colA}
                            colB={colB}
                            modReemplazo={modReemplazo}
                            inputMode={inputMode}
                        />
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
