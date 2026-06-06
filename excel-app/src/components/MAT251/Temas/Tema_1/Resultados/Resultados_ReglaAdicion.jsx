import React, { useEffect, useRef, useMemo } from 'react';
import { FONT, FS, RADIUS, cardStyle, labelStyle } from '../../../Principal/Constantes';
import katex from 'katex';
import DiagramaVenn from '../../../Graficas/DiagramaVenn';
import MarcoWidgetMAT251 from '../../../ui/MarcoWidgetMAT251';
import { IconoCalculadora, EditarDatos } from '../../../../ui/iconos';
import { calcularReglaAdicion } from '../../../Matematicas/logica_Tema1';

const FormulaAdicion = ({ resultado }) => {
    const formulaRef = useRef(null);

    useEffect(() => {
        if (formulaRef.current && resultado) {
            let formulaLatex = `\\begin{aligned}\n`;
            formulaLatex += `P(A \\cup B) &= P(A) + P(B) - P(A \\cap B) \\\\\n`;
            formulaLatex += `P(A \\cup B) &= ${resultado.pA.toFixed(4)} + ${resultado.pB.toFixed(4)} - ${resultado.pAandB.toFixed(4)} \\\\\n`;
            formulaLatex += `P(A \\cup B) &= \\mathbf{${resultado.pAorB.toFixed(4)}}\n`;
            formulaLatex += `\\end{aligned}`;

            katex.render(formulaLatex, formulaRef.current, { throwOnError: false, displayMode: true });
        }
    }, [resultado]);

    return (
        <div style={{ overflowX: 'auto', background: 'var(--bg-input)', padding: '10px', borderRadius: RADIUS }}>
            <div ref={formulaRef}></div>
        </div>
    );
};

export default function ResultadosReglaAdicion({
    varSeleccionada, filas,
    colA, setColA, valA, setValA,
    colB, setColB, valB, setValB,
    resultado, setResultado,
    error, setError,
    statsDatos, abrirEditor
}) {

    // Extraer valores únicos para A y B
    const valoresUnicosA = useMemo(() => {
        if (!varSeleccionada || !colA) return [];
        const colIndex = varSeleccionada.nombresColumnas?.indexOf(colA);
        if (colIndex === -1 || colIndex === undefined) return [];
        const vals = filas.map(f => f.valor.split(' | ').map(p => p.trim())[colIndex]).filter(Boolean);
        return [...new Set(vals)].sort();
    }, [varSeleccionada, colA, filas]);

    const valoresUnicosB = useMemo(() => {
        if (!varSeleccionada || !colB) return [];
        const colIndex = varSeleccionada.nombresColumnas?.indexOf(colB);
        if (colIndex === -1 || colIndex === undefined) return [];
        const vals = filas.map(f => f.valor.split(' | ').map(p => p.trim())[colIndex]).filter(Boolean);
        return [...new Set(vals)].sort();
    }, [varSeleccionada, colB, filas]);

    const calcular = () => {
        if (!varSeleccionada) {
            setError("Importa una Matriz de Excel primero.");
            setResultado(null);
            return;
        }
        if (!colA || !valA || !colB || !valB) {
            setError("Selecciona las columnas y los valores para ambos eventos (A y B).");
            setResultado(null);
            return;
        }

        const res = calcularReglaAdicion(filas, varSeleccionada.nombresColumnas, colA, valA, colB, valB);
        if (res.error) {
            setError(res.error);
            setResultado(null);
        } else {
            setResultado(res.resultado);
            setError('');
        }
    };

    // Auto-recalcular or clear when inputs change
    useEffect(() => {
        setResultado(null);
        setError('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [colA, valA, colB, valB, varSeleccionada, filas]);

    return (
        <div style={{ marginTop: '0px', fontFamily: FONT }}>

            {/* ── PARÁMETROS DE LOS EVENTOS ── */}
            <div style={{ ...cardStyle, marginBottom: '20px' }}>
                {/* ── BARRA DE DATOS Y EDITOR ── */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div>
                        <span style={{ ...labelStyle, margin: 0 }}>Matriz Detectada (Datos Históricos):</span>
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
                        className="btn-icon"
                        style={{
                            borderRadius: RADIUS,
                            fontSize: FS.sm,
                            padding: '6px 14px',
                            background: 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
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

                <h4 style={{ color: 'var(--primary-color)', margin: '0 0 15px 0', fontSize: FS.sm }}>
                    Definición de Eventos:
                </h4>

                {varSeleccionada && varSeleccionada.nombresColumnas && varSeleccionada.nombresColumnas.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end', background: 'var(--bg-input)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                        {/* EVENTO A */}
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontWeight: 600 }}>
                                Variable Evento A:
                            </label>
                            <select
                                value={colA}
                                onChange={(e) => { setColA(e.target.value); setValA(''); }}
                                className="container_cal_input"
                                style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '1px solid var(--border-color)', marginBottom: '8px' }}
                            >
                                <option value="">-- Seleccionar Variable --</option>
                                {varSeleccionada.nombresColumnas.map(col => <option key={col} value={col}>{col}</option>)}
                            </select>

                            {colA && valoresUnicosA.length > 0 && (
                                <>
                                    <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px', color: 'var(--primary-color)', fontWeight: 'bold' }}>Condición de A:</label>
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

                        {/* EVENTO B */}
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontWeight: 600 }}>
                                Variable Evento B:
                            </label>
                            <select
                                value={colB}
                                onChange={(e) => { setColB(e.target.value); setValB(''); }}
                                className="container_cal_input"
                                style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '1px solid var(--border-color)', marginBottom: '8px' }}
                            >
                                <option value="">-- Seleccionar Variable --</option>
                                {varSeleccionada.nombresColumnas.map(col => <option key={col} value={col}>{col}</option>)}
                            </select>

                            {colB && valoresUnicosB.length > 0 && (
                                <>
                                    <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px', color: 'var(--primary-color)', fontWeight: 'bold' }}>Condición de B:</label>
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

                        <button
                            onClick={calcular}
                            className="button_calcular btn-icon"
                            style={{ padding: '8px 25px', borderRadius: RADIUS, fontSize: FS.sm, fontWeight: 700, height: '36px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer' }}
                            disabled={!varSeleccionada || !colA || !valA || !colB || !valB}
                        >
                            <IconoCalculadora />
                            CALCULAR
                        </button>
                    </div>
                ) : varSeleccionada ? (
                    <div style={{ padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: RADIUS, fontSize: FS.sm, marginBottom: '15px' }}>
                        Para usar esta función, debes importar una "Matriz" que contenga columnas.
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: FS.sm }}>
                        Importa una matriz en el panel izquierdo para comenzar.
                    </p>
                )}

                {error && (
                    <div style={{ marginTop: '15px', padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: RADIUS, border: '1px solid #f87171', fontWeight: 'bold', fontSize: FS.xs }}>
                        {error}
                    </div>
                )}
            </div>

            {resultado && (
                <>
                    <div style={{ ...cardStyle, marginBottom: '20px' }}>
                        <h4 style={{ color: 'var(--primary-color)', margin: '0 0 10px 0', fontSize: FS.sm }}>
                            Desglose de Frecuencias:
                        </h4>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: FS.sm }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-input)', borderBottom: '2px solid var(--border-color)' }}>
                                        <th style={{ padding: '8px 6px' }}>Evento</th>
                                        <th style={{ padding: '8px 6px', color: 'var(--text-muted)', fontWeight: 500 }}>Frecuencia (n)</th>
                                        <th style={{ padding: '8px 6px' }}>Probabilidad (P)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>A: {resultado.nameA}</td>
                                        <td style={{ padding: '8px 6px', color: 'var(--text-muted)' }}>{resultado.countA} / {resultado.total}</td>
                                        <td style={{ padding: '8px 6px', fontWeight: 'bold' }}>{resultado.pA.toFixed(4)}</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>B: {resultado.nameB}</td>
                                        <td style={{ padding: '8px 6px', color: 'var(--text-muted)' }}>{resultado.countB} / {resultado.total}</td>
                                        <td style={{ padding: '8px 6px', fontWeight: 'bold' }}>{resultado.pB.toFixed(4)}</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>A ∩ B (Intersección)</td>
                                        <td style={{ padding: '8px 6px', color: 'var(--text-muted)' }}>{resultado.countAandB} / {resultado.total}</td>
                                        <td style={{ padding: '8px 6px', fontWeight: 'bold' }}>{resultado.pAandB.toFixed(4)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, marginBottom: '20px' }}>
                        <h3 style={{ color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', fontSize: FS.md, margin: '0 0 15px 0' }}>
                            Desarrollo Matemático: Axiomas y Propiedades (Unión de Eventos)
                        </h3>
                        <FormulaAdicion resultado={resultado} />
                        <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(16, 185, 129, 0.05)', border: '1.5px solid #10b981', borderRadius: RADIUS, textAlign: 'center' }}>
                            <div style={{ fontSize: FS.lg, fontWeight: 'bold', color: '#047857' }}>
                                P(A ∪ B) = {resultado.pAorB.toFixed(4)}
                            </div>
                            <div style={{ fontSize: FS.sm, color: 'var(--text-main)', marginTop: '4px' }}>
                                ({(resultado.pAorB * 100).toFixed(2)}% probabilidad conjunta)
                            </div>
                        </div>
                    </div>

                    <MarcoWidgetMAT251 id="w-venn" titulo="Diagrama de Venn (Unión de Eventos)" anchoCompleto={true} alto="380px">
                        <div style={{ width: '100%', height: '100%', minWidth: 0, padding: '20px' }}>
                            <DiagramaVenn resultado={resultado} />
                        </div>
                    </MarcoWidgetMAT251>
                </>
            )}
        </div>
    );
}
