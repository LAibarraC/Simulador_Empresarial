import React, { useEffect, useRef, useMemo, useState } from 'react';
import { FONT, FS, RADIUS, cardStyle, labelStyle } from '../../../Principal/Constantes';
import katex from 'katex';
import DiagramaVenn from '../../../Graficas/Tema_1/DiagramaVenn';
import MarcoWidgetMAT251 from '../../../ui/MarcoWidgetMAT251';
import { IconoCalculadora, EditarDatos } from '../../../../../ui/iconos';
import ModalAlerta from '../../../ui/ModalAlerta';

const InlineMath = ({ math }) => (
    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
);

const FormulaAdicion = ({ resultado }) => {
    const formulaGeneralRef = useRef(null);
    const formulaDesarrolloRef = useRef(null);

    useEffect(() => {
        if (formulaGeneralRef.current && formulaDesarrolloRef.current && resultado) {
            const latexG = `\\displaystyle P(A \\cup B) = P(A) + P(B) - P(A \\cap B)`;
            katex.render(latexG, formulaGeneralRef.current, { throwOnError: false, displayMode: true });

            let formulaLatex = `\\displaystyle \\begin{aligned}\n`;
            formulaLatex += `P(A \\cup B) &= P(A) + P(B) - P(A \\cap B) \\\\\n`;
            formulaLatex += `P(A \\cup B) &= ${resultado.pA.toFixed(4)} + ${resultado.pB.toFixed(4)} - ${resultado.pAandB.toFixed(4)} \\\\\n`;
            const pct = (resultado.pAorB * 100).toFixed(2);
            formulaLatex += `P(A \\cup B) &= ${resultado.pAorB.toFixed(4)} \\quad \\Rightarrow \\quad \\mathbf{${pct}\\%}\n`;
            formulaLatex += `\\end{aligned}`;

            katex.render(formulaLatex, formulaDesarrolloRef.current, { throwOnError: false, displayMode: false });
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

export default function ResultadosReglaAdicion({
    varSeleccionada, filas,
    colA, setColA, valA, setValA,
    colB, setColB, valB, setValB,
    resultado, setResultado,
    error, setError,
    statsDatos, abrirEditor,
    inputMode, setInputMode, manualAdicion, setManualAdicion, onCalcular, bloquearModo = false
}) {
    const [alerta, setAlerta] = useState({ isOpen: false, mensaje: '' });
    const {
        nameA: manualNameA, nameB: manualNameB,
        pA: manualPA, pB: manualPB, pAB: manualPAndB,
    } = manualAdicion;
    const setManualNameA = nameA => setManualAdicion(prev => ({ ...prev, nameA }));
    const setManualNameB = nameB => setManualAdicion(prev => ({ ...prev, nameB }));
    const setManualPA = pA => setManualAdicion(prev => ({ ...prev, pA }));
    const setManualPB = pB => setManualAdicion(prev => ({ ...prev, pB }));
    const setManualPAndB = pAB => setManualAdicion(prev => ({ ...prev, pAB }));
    const activeResultado = resultado;
    const activeError = error;

    // Extraer valores únicos para A y B
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
        const calculo = onCalcular();
        setAlerta({ isOpen: !!calculo.error, mensaje: calculo.error || '' });
    };

    const cambiarModo = (nuevoModo) => {
        if (bloquearModo || nuevoModo === inputMode) return;
        setInputMode(nuevoModo);
        setResultado(null);
        setError('');
    };

    useEffect(() => {
        if (inputMode !== 'matriz') return;
        if (valA && !valoresUnicosA.includes(String(valA))) setValA('');
        if (valB && !valoresUnicosB.includes(String(valB))) setValB('');
    }, [inputMode, valA, valB, valoresUnicosA, valoresUnicosB, setValA, setValB]);

    return (
        <div style={{ marginTop: '10px', fontFamily: FONT }}>

            {/* SELECTOR DE MODO DE ENTRADA */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <div id="tour-adicion-modos-entrada" className="contenedor-selector-modos-mat251">
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

            {/* ── PARÁMETROS DE LOS EVENTOS ── */}
            <div style={{ marginBottom: '10px' }}>

                {inputMode === 'matriz' ? (
                    <>
                        {/* ── BARRA DE DATOS Y EDITOR (Solo en Matriz) ── */}
                        <div id="tour-adicion-datos" style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
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

                        {pseudoVar && pseudoVar.nombresColumnas && pseudoVar.nombresColumnas.length > 0 ? (
                            <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: RADIUS, border: '1px solid var(--border-color)', marginBottom: '15px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '15px', alignItems: 'flex-start' }}>
                                    {/* EVENTO A */}
                                    <div id="tour-adicion-evento-a" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div>
                                            <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontWeight: 600, color: 'var(--text-pure)' }}>
                                                Variable Evento <span style={{ color: 'var(--text-pure)' }} dangerouslySetInnerHTML={{ __html: katex.renderToString('A') }} />:
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

                                    {/* EVENTO B */}
                                    <div id="tour-adicion-evento-b" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div>
                                            <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontWeight: 600, color: 'var(--text-pure)' }}>
                                                Variable Evento <span style={{ color: 'var(--text-pure)' }} dangerouslySetInnerHTML={{ __html: katex.renderToString('B') }} />:
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
                                        id="tour-adicion-btn-calcular"
                                        type="button"
                                        onClick={calcular}
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
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: FS.xs }}>
                                Importa una matriz o agrega datos en el panel superior para comenzar.
                            </p>
                        )}
                    </>
                ) : (
                    <>
                        {/* ── MODO MANUAL ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <h4 style={{ margin: '0 0 0px 0', fontSize: FS.sm, fontWeight: 'bold', color: 'var(--text-pure)' }}>Datos:</h4>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {/* EVENTO A */}
                                <div id="tour-adicion-manual-evento-a" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', background: 'var(--bg-input)', padding: '10px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                                    <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={labelStyle}>Evento <span dangerouslySetInnerHTML={{ __html: katex.renderToString('A') }} />:</label>
                                        <input
                                            type="text"
                                            value={manualNameA}
                                            onChange={(e) => setManualNameA(e.target.value)}
                                            placeholder="Ej. A"
                                            className="input-mat251 placeholder-small"
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: RADIUS,
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-card)',
                                                color: 'var(--text-color)',
                                                fontSize: FS.sm,
                                                outline: 'none',
                                                fontFamily: FONT
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={labelStyle}>Probabilidad <span dangerouslySetInnerHTML={{ __html: katex.renderToString('P(A)') }} />:</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            value={manualPA}
                                            onChange={(e) => setManualPA(e.target.value)}
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
                                                fontFamily: FONT
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* EVENTO B */}
                                <div id="tour-adicion-manual-evento-b" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', background: 'var(--bg-input)', padding: '10px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                                    <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={labelStyle}>Evento <span dangerouslySetInnerHTML={{ __html: katex.renderToString('B') }} />:</label>
                                        <input
                                            type="text"
                                            value={manualNameB}
                                            onChange={(e) => setManualNameB(e.target.value)}
                                            placeholder="Ej. B"
                                            className="input-mat251 placeholder-small"
                                            style={{
                                                padding: '8px 12px',
                                                borderRadius: RADIUS,
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-card)',
                                                color: 'var(--text-color)',
                                                fontSize: FS.sm,
                                                outline: 'none',
                                                fontFamily: FONT
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={labelStyle}>Probabilidad <span dangerouslySetInnerHTML={{ __html: katex.renderToString('P(B)') }} />:</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            value={manualPB}
                                            onChange={(e) => setManualPB(e.target.value)}
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
                                                fontFamily: FONT
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* INTERSECCIÓN */}
                                <div id="tour-adicion-manual-interseccion" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', background: 'var(--bg-input)', padding: '10px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                                    <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={labelStyle}>Probabilidad de la Intersección <span dangerouslySetInnerHTML={{ __html: katex.renderToString('P(A \\cap B)') }} />:</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            value={manualPAndB}
                                            onChange={(e) => setManualPAndB(e.target.value)}
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
                                                fontFamily: FONT
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0px', width: '100%' }}>
                                <button
                                    id="tour-adicion-manual-btn-calcular"
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
                    <div id="tour-adicion-tabla-desglose" style={{ marginBottom: '20px' }}>
                        <h3 style={{ color: 'var(--text-pure)', margin: '15px 0 10px 0', fontSize: FS.md, fontWeight: 'bold', textAlign: 'center' }}>
                            Desglose de {inputMode === 'matriz' ? 'Frecuencias' : 'Probabilidades'}
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: FS.sm, color: 'var(--text-pure)' }}>
                                <thead>
                                    <tr className="table-header-responsive" style={{ background: 'var(--bg-input)', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                                        <th style={{ padding: '10px 8px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold' }}>
                                            <span style={{ marginRight: '6px', fontWeight: 'bold' }}>Evento</span>
                                        </th>
                                        {inputMode === 'matriz' && (
                                            <th style={{ padding: '10px 8px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold' }}>
                                                <span style={{ marginRight: '6px', fontWeight: 'bold' }}>Frecuencia</span>
                                                <span dangerouslySetInnerHTML={{ __html: katex.renderToString('\\boldsymbol{(n)}') }} />
                                            </th>
                                        )}
                                        <th style={{ padding: '10px 8px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold' }}>
                                            <span style={{ marginRight: '6px', fontWeight: 'bold' }}>Probabilidad</span>
                                            <span dangerouslySetInnerHTML={{ __html: katex.renderToString('\\boldsymbol{(P)}') }} />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold', fontSize: '0.8rem' }}><span dangerouslySetInnerHTML={{ __html: katex.renderToString('A') }} />: {activeResultado.nameA}</td>
                                        {inputMode === 'matriz' && (
                                            <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: '0.8rem' }}>
                                                <InlineMath math={`${activeResultado.countA} / ${activeResultado.total}`} />
                                            </td>
                                        )}
                                        <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: '0.8rem' }}>
                                            <InlineMath math={activeResultado.pA.toFixed(4)} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold', fontSize: '0.8rem' }}><span dangerouslySetInnerHTML={{ __html: katex.renderToString('B') }} />: {activeResultado.nameB}</td>
                                        {inputMode === 'matriz' && (
                                            <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: '0.8rem' }}>
                                                <InlineMath math={`${activeResultado.countB} / ${activeResultado.total}`} />
                                            </td>
                                        )}
                                        <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: '0.8rem' }}>
                                            <InlineMath math={activeResultado.pB.toFixed(4)} />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold', fontSize: '0.8rem' }}><span dangerouslySetInnerHTML={{ __html: katex.renderToString('A \\cap B') }} /> (Intersección)</td>
                                        {inputMode === 'matriz' && (
                                            <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: '0.8rem' }}>
                                                <InlineMath math={`${activeResultado.countAandB} / ${activeResultado.total}`} />
                                            </td>
                                        )}
                                        <td style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: '0.8rem' }}>
                                            <InlineMath math={activeResultado.pAandB.toFixed(4)} />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div id="tour-adicion-formula" style={{ marginBottom: '20px' }}>
                        <h4 style={{ color: 'var(--text-pure)', fontSize: FS.sm, margin: '15px 0 10px 0', fontWeight: 'bold', textAlign: 'center' }}>
                            Desarrollo Matemático
                        </h4>
                        <FormulaAdicion resultado={activeResultado} />
                    </div>

                    <div id="tour-adicion-venn" style={{ width: '100%', minWidth: 0 }}>
                        <MarcoWidgetMAT251 id="w-venn" titulo="Diagrama de Venn (Unión de Eventos)" anchoCompleto={true} alto="380px">
                            <div style={{ width: '100%', height: '100%', minWidth: 0, padding: '20px' }}>
                                <DiagramaVenn resultado={activeResultado} />
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
