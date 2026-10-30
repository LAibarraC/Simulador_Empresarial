import React, { useEffect, useRef, useMemo, useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { FONT, FS, RADIUS, cardStyle, labelStyle } from '../../../Principal/Constantes';
import { IconoCalculadora, EditarDatos, IconoAlerta } from '../../../../../ui/iconos';
import ModalAlerta from '../../../ui/ModalAlerta';
import katex from 'katex';
import ArbolProbabilidad from '../../../Graficas/Tema_1/ArbolProbabilidad';
import MarcoWidgetMAT251 from '../../../ui/MarcoWidgetMAT251';
import { crearRecetaTotal, calcularRecetaTotal } from '../../../Historial/historial_Tema1';

const InlineMath = ({ math }) => (
    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
);

const FormulaMatematica = ({ resultado }) => {
    const formulaGeneralRef = useRef(null);
    const formulaDesarrolloRef = useRef(null);

    useEffect(() => {
        if (formulaGeneralRef.current && formulaDesarrolloRef.current && resultado) {
            // Fórmula principal
            const latexGeneral = `\\displaystyle P(A) = \\sum_{i=1}^{n} P(A B_i) = \\sum_{i=1}^{n} P(B_i)P(A|B_i)`;
            katex.render(latexGeneral, formulaGeneralRef.current, { throwOnError: false, displayMode: true });

            // Cálculos
            let latexDesarrollo = `\\displaystyle \\begin{aligned}\n`;
            let sumatoriaStr = resultado.desglose.map(r => `P(\\text{${r.nombre}}) \\cdot P(A|\\text{${r.nombre}})`).join(' + ');
            latexDesarrollo += `P(A) &= ${sumatoriaStr} \\\\\n`;

            let valoresStr = resultado.desglose.map(r => `(${r.pA.toFixed(4)} \\cdot ${r.pB_A.toFixed(4)})`).join(' + ');
            latexDesarrollo += `P(A) &= ${valoresStr} \\\\\n`;

            let multsStr = resultado.desglose.map(r => `${r.mult.toFixed(4)}`).join(' + ');
            latexDesarrollo += `P(A) &= ${multsStr} \\\\\n`;

            const probTotalPct = (resultado.probB * 100).toFixed(2);
            latexDesarrollo += `P(A) &= ${resultado.probB.toFixed(4)} \\quad \\Rightarrow \\quad \\mathbf{${probTotalPct}\\%}\n`;
            latexDesarrollo += `\\end{aligned}`;

            katex.render(latexDesarrollo, formulaDesarrolloRef.current, { throwOnError: false, displayMode: false });
        }
    }, [resultado]);

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

const FormulaBayes = ({ resultado, ramasSeleccionadas }) => {
    const formulaGeneralRef = useRef(null);
    const formulaDesarrolloRef = useRef(null);

    useEffect(() => {
        if (formulaGeneralRef.current && formulaDesarrolloRef.current && resultado && ramasSeleccionadas && ramasSeleccionadas.length > 0) {

            const numRamas = ramasSeleccionadas.length;
            const names = ramasSeleccionadas.map(r => `\\text{${r.nombre}}`);
            const unionNames = names.join(' \\cup ');
            const formatUnion = numRamas === 1 ? unionNames : `(${unionNames})`;

            let formulaLatex = `\\displaystyle \\begin{aligned}\n`;

            if (numRamas === 1) {
                const r = ramasSeleccionadas[0];
                const latexG = `\\displaystyle P(${unionNames} | A) = \\frac{P(${names[0]}) \\cdot P(A|${names[0]})}{P(A)}`;
                katex.render(latexG, formulaGeneralRef.current, { throwOnError: false, displayMode: true });

                formulaLatex += `P(${unionNames} | A) &= \\frac{${r.pA.toFixed(4)} \\cdot ${r.pB_A.toFixed(4)}}{${resultado.probB.toFixed(4)}} \\\\\n`;
                formulaLatex += `P(${unionNames} | A) &= \\frac{${r.mult.toFixed(4)}}{${resultado.probB.toFixed(4)}} \\\\\n`;
            } else {
                const latexG = `\\displaystyle P(${formatUnion} | A) = \\frac{\\sum P(B_i)P(A|B_i)}{P(A)}`;
                katex.render(latexG, formulaGeneralRef.current, { throwOnError: false, displayMode: true });

                const calcs = ramasSeleccionadas.map(r => `(${r.pA.toFixed(4)} \\cdot ${r.pB_A.toFixed(4)})`).join(' + ');
                formulaLatex += `P(${formatUnion} | A) &= \\frac{${calcs}}{${resultado.probB.toFixed(4)}} \\\\\n`;
                const mults = ramasSeleccionadas.map(r => r.mult.toFixed(4)).join(' + ');
                formulaLatex += `P(${formatUnion} | A) &= \\frac{${mults}}{${resultado.probB.toFixed(4)}} \\\\\n`;
                const sumMults = ramasSeleccionadas.reduce((sum, r) => sum + r.mult, 0);
                formulaLatex += `P(${formatUnion} | A) &= \\frac{${sumMults.toFixed(4)}}{${resultado.probB.toFixed(4)}} \\\\\n`;
            }

            const sumMults = ramasSeleccionadas.reduce((sum, r) => sum + r.mult, 0);
            const bayesVal = resultado.probB > 0 ? (sumMults / resultado.probB) : 0;
            const bayesPct = (bayesVal * 100).toFixed(2);
            formulaLatex += `P(${formatUnion} | A) &= ${bayesVal.toFixed(4)} \\quad \\Rightarrow \\quad \\mathbf{${bayesPct}\\%}\n`;

            formulaLatex += `\\end{aligned}`;

            katex.render(formulaLatex, formulaDesarrolloRef.current, { throwOnError: false, displayMode: false });
        }
    }, [resultado, ramasSeleccionadas]);

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

// COMPONENTE SELECTOR PERSONALIZADO (Adaptado para selección múltiple opcional)
const CustomSelect = ({ value, onChange, options, placeholder, accentColor = 'var(--primary-color)', multiple = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Helper to format the displayed text when multiple
    const realOptions = options.filter(o => o.value !== '' && o.value !== 'ALL');
    const getDisplayText = () => {
        if (!multiple) return value || placeholder;
        if (!value || value.length === 0) return placeholder;
        if (value.length === 1) return value[0];
        if (realOptions.length > 0 && value.length === realOptions.length) return 'Todas las causas';
        if (value.length > 3) return `${value.length} causas seleccionadas (${value.join(', ')})`;
        return value.join(' + ');
    };

    const handleOptionClick = (optValue, e) => {
        if (!multiple) {
            onChange(optValue);
            setIsOpen(false);
        } else {
            // Lógica múltiple
            e.stopPropagation();
            if (optValue === '') { // Clear all
                onChange([]);
                return;
            }
            if (optValue === 'ALL') { // Select all
                onChange(options.filter(o => o.value !== '' && o.value !== 'ALL').map(o => o.value));
                return;
            }

            let newValue = [...(value || [])];
            if (newValue.includes(optValue)) {
                newValue = newValue.filter(v => v !== optValue);
            } else {
                newValue.push(optValue);
            }
            onChange(newValue);
        }
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
                <span style={{ fontWeight: 500, color: (!multiple && value) || (multiple && value?.length > 0) ? 'var(--text-pure)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '85%' }}>
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
                        const isSelected = multiple ? (value || []).includes(opt.value) : value === opt.value;
                        const isSpecial = opt.value === '' || opt.value === 'ALL';

                        return (
                            <div
                                key={idx}
                                onClick={(e) => handleOptionClick(opt.value, e)}
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {multiple && !isSpecial && (
                                        <div style={{
                                            width: '16px', height: '16px', borderRadius: '3px', border: `1px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                            background: isSelected ? 'var(--primary-color)' : 'var(--bg-card)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            transition: 'all 0.15s ease'
                                        }}>
                                            {isSelected && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                        </div>
                                    )}
                                    <span style={{ fontStyle: isSpecial ? 'italic' : 'normal' }}>{opt.label}</span>
                                </div>
                                {!multiple && isSelected && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default function ResultadosSimuladorTotal({
    filas, varSeleccionada,
    colCausa, setColCausa,
    colEvento, setColEvento,
    valExito, setValExito,
    ramas, setRamas,
    resultado, setResultadoSimulador,
    errorSimulador, setErrorSimulador,
    statsDatos, abrirEditor,
    inputMode, setInputMode, manualBranches, setManualBranches,
    causasBayesMatriz, setCausasBayesMatriz, causasBayesManual, setCausasBayesManual,
    bloquearModo = false
}) {
    const [alerta, setAlerta] = useState({ isOpen: false, mensaje: '' });


    const [ordenWidgets, setOrdenWidgets] = useState(['w-arbol']);
    const resultadoManual = resultado?.modo === 'manual' ? resultado : null;
    const errorManual = inputMode === 'manual' ? errorSimulador : '';

    // Datos dinámicos totalmente segregados según el modo activo
    const activeRamas = inputMode === 'manual'
        ? (resultadoManual ? resultadoManual.desglose : [])
        : (resultado ? ramas : []);

    const activeResultado = inputMode === 'manual' ? resultadoManual : resultado;
    const activeCausasBayes = inputMode === 'manual' ? causasBayesManual : causasBayesMatriz;
    const setActiveCausasBayes = inputMode === 'manual' ? setCausasBayesManual : setCausasBayesMatriz;

    const cambiarModo = (nuevoModo) => {
        if (bloquearModo || nuevoModo === inputMode) return;
        setInputMode(nuevoModo);
        setResultadoSimulador(null);
        setCausasBayesMatriz([]);
        setCausasBayesManual([]);
        setErrorSimulador('');
    };

    const handleBayesChange = (val) => {
        if (val.length && (!activeResultado || activeResultado.probB <= 0)) {
            setAlerta({ isOpen: true, mensaje: 'El Teorema de Bayes no está definido cuando P(A) es cero.' });
            return;
        }
        setActiveCausasBayes(val);
        setResultadoSimulador(prev => {
            if (!prev) return prev;
            return { ...prev, causasBayes: val };
        });
    };

    const agregarRama = () => {
        const nextId = manualBranches.length > 0 ? Math.max(...manualBranches.map(b => b.id)) + 1 : 1;
        setManualBranches([...manualBranches, { id: nextId, name: `Causa ${nextId}`, pA: '', pBA: '' }]);
        setResultadoSimulador(null);
        setCausasBayesManual([]);
    };

    const eliminarRama = (id) => {
        if (manualBranches.length <= 2) return;
        const filtradas = manualBranches.filter(b => b.id !== id);
        setManualBranches(filtradas);
        setResultadoSimulador(null);
        setCausasBayesManual([]);
    };

    const handleBranchChange = (id, field, value) => {
        setManualBranches(manualBranches.map(b => {
            if (b.id === id) {
                return { ...b, [field]: value };
            }
            return b;
        }));
        setResultadoSimulador(null);
        setCausasBayesManual([]);
    };

    const sumPA = useMemo(() => {
        return manualBranches.reduce((acc, b) => acc + (parseFloat(b.pA) || 0), 0);
    }, [manualBranches]);

    const showSumaWarning = Math.abs(sumPA - 1) > 0.0001 && manualBranches.some(b => b.pA !== '');

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;
        if (active.id !== over.id) {
            setOrdenWidgets((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Extraer valores únicos para el selector de "Éxito" del evento en modo matriz
    const valoresUnicosEvento = useMemo(() => {
        if (!varSeleccionada || !colEvento) return [];
        const colIndex = varSeleccionada.nombresColumnas?.indexOf(colEvento);
        if (colIndex === -1 || colIndex === undefined) return [];

        const vals = filas.map(f => {
            const partes = f.valor.split(' | ').map(p => p.trim());
            return partes[colIndex];
        }).filter(Boolean);
        return [...new Set(vals)].sort();
    }, [varSeleccionada, colEvento, filas]);

    useEffect(() => {
        if (inputMode === 'matriz' && valExito && !valoresUnicosEvento.includes(String(valExito))) {
            setValExito('');
        }
    }, [inputMode, valExito, valoresUnicosEvento, setValExito]);

    // Garantizar exclusión mutua estricta: si colCausa y colEvento coinciden, limpiar colEvento
    useEffect(() => {
        if (colCausa && colEvento && colCausa === colEvento) {
            setColEvento('');
            setValExito('');
        }
    }, [colCausa, colEvento, setColEvento, setValExito]);

    // Si cambian las columnas y la selección ya no existe en la matriz, limpiarla
    useEffect(() => {
        if (varSeleccionada && varSeleccionada.nombresColumnas) {
            if (colCausa && !varSeleccionada.nombresColumnas.includes(colCausa)) {
                setColCausa('');
            }
            if (colEvento && !varSeleccionada.nombresColumnas.includes(colEvento)) {
                setColEvento('');
                setValExito('');
            }
        }
    }, [varSeleccionada, colCausa, colEvento, setColCausa, setColEvento, setValExito]);

    const calcularActual = () => {
        const receta = crearRecetaTotal({
            modoTotal: inputMode, ramasManualesTotal: manualBranches,
            filas, varSeleccionada, colCausa, colEvento, valExito,
            causasBayesTotal: [],
        });
        const calculo = calcularRecetaTotal(receta);
        setCausasBayesMatriz([]);
        setCausasBayesManual([]);
        if (calculo.error) {
            setResultadoSimulador(null);
            setRamas([]);
            setErrorSimulador(calculo.error);
            setAlerta({ isOpen: true, mensaje: calculo.error });
            return;
        }
        setRamas(calculo.resultado.desglose);
        setResultadoSimulador(calculo.resultado);
        setErrorSimulador('');
    };
    const calcular = calcularActual;
    const calcularManual = calcularActual;

    return (
        <div style={{ marginTop: '10px' }}>
            {/* SELECTOR DE MODO DE ENTRADA */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <div id="tour-total-modos-entrada" className="contenedor-selector-modos-mat251">
                    <button
                        type="button"
                        className={`btn-mat251-modo ${inputMode === 'matriz' ? 'active' : ''}`}
                        disabled={bloquearModo && inputMode !== 'matriz'}
                        title={bloquearModo && inputMode !== 'matriz' ? 'El modo está fijado por el historial' : undefined}
                        onClick={() => cambiarModo('matriz')}
                        style={{ fontFamily: FONT }}
                    >
                        Análisis de Matriz
                    </button>
                    <button
                        type="button"
                        className={`btn-mat251-modo ${inputMode === 'manual' ? 'active' : ''}`}
                        disabled={bloquearModo && inputMode !== 'manual'}
                        title={bloquearModo && inputMode !== 'manual' ? 'El modo está fijado por el historial' : undefined}
                        onClick={() => cambiarModo('manual')}
                        style={{ fontFamily: FONT }}
                    >
                        Modo Manual
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                {inputMode === 'manual' ? (
                    /* FORMULARIO DE INGRESO MANUAL */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '0px' }}>
                        <h4 style={{ marginBottom: '5px', fontSize: FS.sm, fontWeight: 'bold', color: 'var(--text-pure)' }}>Datos:</h4>

                        <div id="tour-total-manual-ramas" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}> 
                            {manualBranches.map((rama) => (
                                <div key={rama.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', background: 'var(--bg-input)', padding: '10px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                                    <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={labelStyle}>Causa:</label>
                                        <input
                                            type="text"
                                            value={rama.name}
                                            onChange={(e) => handleBranchChange(rama.id, 'name', e.target.value)}
                                            placeholder={`Causa ${rama.id}`}
                                            className="input-mat251 placeholder-small"
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: RADIUS,
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-card)',
                                                color: 'var(--text-color)',
                                                fontSize: FS.sm,
                                                outline: 'none',
                                                fontFamily: FONT,
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ ...labelStyle, marginBottom: 0 }}>Probabilidad</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: FS.sm, color: 'var(--text-pure)', whiteSpace: 'nowrap' }}><InlineMath math={`P(B_{${rama.id}})`} />:</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="1"
                                                value={rama.pA}
                                                onChange={(e) => handleBranchChange(rama.id, 'pA', e.target.value)}
                                                placeholder="0.00"
                                                className="input-mat251 placeholder-small"
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: RADIUS,
                                                    border: '1px solid var(--border-color)',
                                                    background: 'var(--bg-card)',
                                                    color: 'var(--text-color)',
                                                    fontSize: FS.sm,
                                                    outline: 'none',
                                                    fontFamily: FONT,
                                                    width: '100%',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ ...labelStyle, marginBottom: 0 }}>Probabilidad</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: FS.sm, color: 'var(--text-pure)', whiteSpace: 'nowrap' }}><InlineMath math={`P(A|B_{${rama.id}})`} />:</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="1"
                                                value={rama.pBA}
                                                onChange={(e) => handleBranchChange(rama.id, 'pBA', e.target.value)}
                                                placeholder="0.00"
                                                className="input-mat251 placeholder-small"
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: RADIUS,
                                                    border: '1px solid var(--border-color)',
                                                    background: 'var(--bg-card)',
                                                    color: 'var(--text-color)',
                                                    fontSize: FS.sm,
                                                    outline: 'none',
                                                    fontFamily: FONT,
                                                    width: '100%',
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {manualBranches.length > 2 && (
                                        <button
                                            type="button"
                                            title="Eliminar causa"
                                            onClick={() => eliminarRama(rama.id)}
                                            style={{
                                                marginTop: '24px',
                                                padding: '8px',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                color: '#ef4444',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                borderRadius: RADIUS,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = '#ef4444';
                                                e.currentTarget.style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                e.currentTarget.style.color = '#ef4444';
                                            }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                                <line x1="14" y1="11" x2="14" y2="17"></line>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', width: '100%' }}>
                            <button
                                id="tour-total-manual-btn-agregar"
                                type="button"
                                onClick={agregarRama}
                                className="btn-primary"
                                style={{
                                    padding: '5px 14px',
                                    borderRadius: RADIUS,
                                    cursor: 'pointer',
                                    fontSize: FS.sm,
                                    fontWeight: 600,
                                    fontFamily: FONT
                                }}
                            >
                                Agregar nueva Causa (Rama)
                            </button>
                        </div>

                        {showSumaWarning && (
                            <div style={{
                                padding: '10px 15px',
                                background: 'rgba(234, 88, 12, 0.05)',
                                color: '#ea580c',
                                border: '1.5px dashed #ea580c',
                                borderRadius: RADIUS,
                                fontSize: FS.sm,
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <IconoAlerta width="18" height="18" style={{ flexShrink: 0 }} />
                                La suma de las probabilidades marginales P(B_i) es {(sumPA * 100).toFixed(2)}%. Recuerde que la suma debe ser igual al 100% (1.0).
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0px', width: '100%' }}>
                            <button
                                id="tour-total-manual-btn-calcular"
                                type="button"
                                onClick={calcularManual}
                                className="button_calcular"
                                style={{
                                    width: 'fit-content',
                                    padding: '5px 20px',
                                    borderRadius: RADIUS,
                                    fontSize: FS.md,
                                    fontWeight: 'bold',
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

                        {errorManual && (
                            <div style={{ marginTop: '10px', padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: RADIUS, border: '1px solid #f87171', fontWeight: 'bold', fontSize: FS.xs }}>
                                {errorManual}
                            </div>
                        )}
                    </div>
                ) : (
                    /* MODO MATRIZ */
                    <>
                        {/* ── BARRA DE DATOS Y EDITOR ── */}
                        <div id="tour-total-datos" style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
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
                                    gap: '6px'
                                }}
                            >
                                <EditarDatos />
                                Editar Datos
                            </button>
                        </div>
                        {varSeleccionada && varSeleccionada.nombresColumnas && varSeleccionada.nombresColumnas.length > 1 ? (
                            <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: RADIUS, border: '1px solid var(--border-color)', marginBottom: '15px' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
                                    <div id="tour-total-causa" style={{ flex: 1, minWidth: '200px' }}>
                                        <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontWeight: 600, color: 'var(--text-pure)' }}>
                                            Variable Causa <span style={{ color: 'var(--text-pure)' }} dangerouslySetInnerHTML={{ __html: katex.renderToString('B_i') }} />:
                                        </label>
                                        <CustomSelect
                                            value={colCausa}
                                            onChange={(val) => {
                                                setColCausa(val);
                                                if (val && val === colEvento) {
                                                    setColEvento('');
                                                    setValExito('');
                                                }
                                            }}
                                            options={[
                                                { value: '', label: '-- Seleccionar --' },
                                                ...(varSeleccionada?.nombresColumnas || []).filter(c => !colEvento || c !== colEvento).map(col => ({ value: col, label: col }))
                                            ]}
                                            placeholder="-- Seleccionar --"
                                        />
                                    </div>

                                    <div id="tour-total-evento" style={{ flex: 1, minWidth: '200px' }}>
                                        <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontWeight: 600, color: 'var(--text-pure)' }}>
                                            Variable Evento <span style={{ color: 'var(--text-pure)' }} dangerouslySetInnerHTML={{ __html: katex.renderToString('A') }} />:
                                        </label>
                                        <CustomSelect
                                            value={colEvento}
                                            onChange={(val) => {
                                                setColEvento(val);
                                                setValExito('');
                                                if (val && val === colCausa) {
                                                    setColCausa('');
                                                }
                                            }}
                                            options={[
                                                { value: '', label: '-- Seleccionar --' },
                                                ...(varSeleccionada?.nombresColumnas || []).filter(c => !colCausa || c !== colCausa).map(col => ({ value: col, label: col }))
                                            ]}
                                            placeholder="-- Seleccionar --"
                                        />
                                    </div>

                                    {colEvento && valoresUnicosEvento.length > 0 && (
                                        <div id="tour-total-exito" style={{ flex: 1, minWidth: '200px' }}>
                                            <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px', color: 'var(--text-pure)', fontWeight: 600 }}>Valor de "Éxito":</label>
                                            <CustomSelect
                                                value={valExito}
                                                onChange={(val) => setValExito(val)}
                                                options={valoresUnicosEvento.map(val => ({ value: val, label: val }))}
                                                placeholder="-- Seleccionar --"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '0px' }}>
                                    <button
                                        id="tour-total-btn-calcular"
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
                        ) : varSeleccionada ? (
                            <div style={{ padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: RADIUS, fontSize: FS.sm, marginBottom: '15px' }}>
                                Para usar el Teorema de Probabilidad Total, debes importar una "Matriz" que contenga al menos 2 columnas.
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: FS.sm }}>
                                Importa una matriz en el panel izquierdo para comenzar.
                            </p>
                        )}

                        {errorSimulador && (
                            <div style={{ marginBottom: '15px', padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: RADIUS, border: '1px solid #f87171', fontWeight: 'bold', fontSize: FS.xs }}>
                                {errorSimulador}
                            </div>
                        )}
                    </>
                )}
            </div>

            {activeResultado && (
                <>
                    <div id="tour-total-tabla-desglose" style={{ marginBottom: '20px' }}>
                        <h3 style={{ color: 'var(--text-pure)', margin: '0 0 10px 0', fontSize: FS.md, fontWeight: 'bold', textAlign: 'center' }}>
                            {inputMode === 'matriz' ? 'Desglose de la Matriz' : 'Desglose de Probabilidades'}
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: FS.sm, color: 'var(--text-pure)' }}>
                                <thead>
                                    <tr className="table-header-responsive" style={{ background: 'var(--bg-input)', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                                        <th style={{ padding: '10px 8px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold' }}>
                                            <span style={{ marginRight: '6px', fontWeight: 'bold' }}>{inputMode === 'matriz' ? 'Causa Única' : 'Causa'}</span>
                                            <span dangerouslySetInnerHTML={{ __html: katex.renderToString('\\boldsymbol{B_i}') }} />
                                        </th>
                                        {inputMode === 'matriz' && (
                                            <th style={{ padding: '10px 8px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold' }}>
                                                <span style={{ marginRight: '6px', fontWeight: 'bold' }}>Frecuencia</span>
                                                <span dangerouslySetInnerHTML={{ __html: katex.renderToString('\\boldsymbol{(n)}') }} />
                                            </th>
                                        )}
                                        <th style={{ padding: '10px 8px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold' }}>
                                            <span dangerouslySetInnerHTML={{ __html: katex.renderToString('\\boldsymbol{P(B_i)}') }} />
                                        </th>
                                        {inputMode === 'matriz' && (
                                            <th style={{ padding: '10px 8px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold' }}>
                                                <span style={{ marginRight: '6px', fontWeight: 'bold' }}>Éxitos en</span>
                                                <span dangerouslySetInnerHTML={{ __html: katex.renderToString('\\boldsymbol{B_i}') }} />
                                            </th>
                                        )}
                                        <th style={{ padding: '10px 8px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold' }}>
                                            <span dangerouslySetInnerHTML={{ __html: katex.renderToString('\\boldsymbol{P(A|B_i)}') }} />
                                        </th>
                                        <th style={{ padding: '10px 8px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold' }}>
                                            <span dangerouslySetInnerHTML={{ __html: katex.renderToString('\\boldsymbol{P(B_i) \\cdot P(A|B_i)}') }} />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeRamas.map((rama) => (
                                        <tr key={rama.id}>
                                            <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold', fontSize: '0.8rem' }}>{rama.nombre}</td>
                                            {inputMode === 'matriz' && (
                                                <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: '0.8rem' }}>
                                                    <InlineMath math={`${rama.n_Ai} / ${rama.totalDatos}`} />
                                                </td>
                                            )}
                                            <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: '0.8rem' }}>
                                                <InlineMath math={(Number(rama.pA) || 0).toFixed(4)} />
                                            </td>
                                            {inputMode === 'matriz' && (
                                                <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: '0.8rem' }}>
                                                    <InlineMath math={`${rama.n_B_dado_Ai} / ${rama.n_Ai}`} />
                                                </td>
                                            )}
                                            <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: '0.8rem' }}>
                                                <InlineMath math={(Number(rama.pB_A) || 0).toFixed(4)} />
                                            </td>
                                            <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: '0.8rem' }}>
                                                <InlineMath math={(Number(rama.mult) || 0).toFixed(4)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div id="tour-total-formula" style={{ marginBottom: '20px' }}>
                        <h3 style={{ color: 'var(--text-pure)', fontSize: FS.md, margin: '0 0 0px 0', fontWeight: 700, textAlign: 'center' }}>
                            PROBABILIDAD TOTAL
                        </h3>
                        <FormulaMatematica resultado={activeResultado} />
                    </div>

                    {/* SECCIÓN BAYES */}
                    <div id="tour-total-bayes" style={{ marginBottom: '20px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                        <h3 style={{ color: 'var(--text-pure)', fontSize: FS.md, margin: '0 0 0px 0', fontWeight: 700, textAlign: 'center' }}>
                            TEOREMA DE BAYES
                        </h3>
                        <div className="katex-responsive-container" style={{ width: '100%', maxWidth: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-pure)', marginBottom: '15px', boxSizing: 'border-box' }}>
                            <div className="formula-general-box formula-scroll-container thin-scrollbar" style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', marginBottom: '5px', padding: '5px 15px', background: 'transparent', border: 'none', borderRadius: RADIUS, textAlign: 'center', color: 'var(--text-pure)', boxSizing: 'border-box' }}>
                                <div
                                    className="formula-general-box"
                                    style={{ color: 'var(--text-pure)', display: 'inline-block', minWidth: 'max-content' }}
                                    dangerouslySetInnerHTML={{
                                        __html: katex.renderToString(
                                            `\\displaystyle P(B_k | A) = \\frac{P(B_k) \\cdot P(A|B_k)}{P(A)}`,
                                            { throwOnError: false, displayMode: true }
                                        )
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: '15px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                            <label className="label-bayes-pregunta" style={{ fontFamily: FONT }}>
                                ¿Cuál es la probabilidad de que la causa haya sido... <span dangerouslySetInnerHTML={{ __html: katex.renderToString('B_k') }} />?
                            </label>
                            <div style={{ maxWidth: '400px', width: '100%' }}>
                                <CustomSelect
                                    value={activeCausasBayes}
                                    onChange={handleBayesChange}
                                    options={[
                                        { value: 'ALL', label: 'Seleccionar Todas' },
                                        { value: '', label: 'Limpiar Selección' },
                                        ...activeRamas.map(r => ({ value: r.nombre, label: r.nombre }))
                                    ]}
                                    placeholder="-- Seleccionar Causa(s) --"
                                    multiple={true}
                                />
                            </div>
                        </div>

                        {activeCausasBayes && activeCausasBayes.length > 0 && (
                            <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                                <h4 style={{ color: 'var(--text-pure)', fontSize: FS.sm, margin: '15px 0 10px 0', fontWeight: 700, textAlign: 'center' }}>Desarrollo Matemático</h4>
                                <FormulaBayes
                                    resultado={activeResultado}
                                    ramasSeleccionadas={activeRamas.filter(r => activeCausasBayes.includes(r.nombre))}
                                />
                            </div>
                        )}
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={ordenWidgets} strategy={rectSortingStrategy}>
                            <div id="tour-total-arbol" style={{ width: '100%', minWidth: 0 }}>
                                {ordenWidgets.map((id) => {
                                    if (id === 'w-arbol') {
                                        return (
                                            <MarcoWidgetMAT251 key={id} id={id} titulo="Árbol de Probabilidad" anchoCompleto={true} alto={`${activeRamas.length * 120 + 160}px`}>
                                                <div style={{ width: '100%', height: '100%', minWidth: 0 }}>
                                                    <ArbolProbabilidad resultado={activeResultado} ramas={activeRamas} causasBayes={activeCausasBayes} />
                                                </div>
                                            </MarcoWidgetMAT251>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </SortableContext>
                    </DndContext>
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
