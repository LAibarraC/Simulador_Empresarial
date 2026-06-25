import React, { useEffect, useMemo, useState } from 'react';
import { FONT, FS, RADIUS, cardStyle } from '../../../Principal/Constantes';
import GraficoUniformeArea from '../../../Graficas/Tema_1/GraficoUniformeArea';
import GraficoUniformeMosaico from '../../../Graficas/Tema_1/GraficoUniformeMosaico';
import MarcoWidgetMAT251 from '../../../ui/MarcoWidgetMAT251';
import { IconoCalculadora, EditarDatos } from '../../../../ui/iconos';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { obtenerLimitesUniforme, calcularDistribucionUniforme } from '../../../Matematicas/logica_Tema1';

export default function ResultadosEspacioContinuo({
    varSeleccionada, filas,
    varUniforme, setVarUniforme,
    inputMin, setInputMin,
    inputMax, setInputMax,
    resultado, setResultado,
    error, setError,
    statsDatos, abrirEditor
}) {
    const [inputMode, setInputMode] = useState('matriz');
    const [manualA, setManualA] = useState('');
    const [manualB, setManualB] = useState('');

    // Detectar únicamente columnas numéricas de la matriz importada
    const numCols = useMemo(() => {
        if (!varSeleccionada || !filas || filas.length === 0) return [];
        const nCols = varSeleccionada.nombresColumnas;
        if (!nCols || nCols.length === 0) {
            // Es una variable de una sola columna. Verificamos si es numérica.
            const primerVal = filas[0]?.valor;
            if (primerVal !== undefined && primerVal !== null && !isNaN(parseFloat(primerVal.toString().trim()))) {
                return [varSeleccionada.nombre || "Datos"];
            }
            return [];
        }
        return nCols.filter(col => {
            const idx = nCols.indexOf(col);
            const val = filas[0]?.valor.split(' | ')[idx];
            return val && !isNaN(parseFloat(val.trim()));
        });
    }, [varSeleccionada, filas]);

    // Calcular el Universo A y B automáticamente cuando eligen una variable
    const bounds = useMemo(() => {
        return obtenerLimitesUniforme(filas, varSeleccionada?.nombresColumnas, varUniforme);
    }, [varUniforme, filas, varSeleccionada]);

    const calcular = () => {
        let minUniverso, maxUniverso;

        if (inputMode === 'manual') {
            minUniverso = parseFloat(manualA);
            maxUniverso = parseFloat(manualB);

            if (isNaN(minUniverso) || isNaN(maxUniverso)) {
                setError("Ingresa valores numéricos válidos para el Universo Poblacional (A y B).");
                return;
            }
            if (minUniverso >= maxUniverso) {
                setError("El Universo Min (A) debe ser menor que el Universo Max (B).");
                return;
            }
        } else {
            if (!bounds) {
                setError("Selecciona una variable numérica válida.");
                return;
            }
            minUniverso = bounds.min;
            maxUniverso = bounds.max;
        }

        const res = calcularDistribucionUniforme(minUniverso, maxUniverso, inputMin, inputMax);
        if (res.error) {
            setError(res.error);
        } else {
            setResultado({
                ...res.resultado,
                dataReales: inputMode === 'manual' ? null : bounds?.dataReales,
                inputMode: inputMode
            });
            setError('');
        }
    };

    // Limpiar resultados si cambian la variable o la matriz
    useEffect(() => {
        setResultado(null);
        setError('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [varUniforme, varSeleccionada, filas]);

    return (
        <div style={{ marginTop: '0px', fontFamily: FONT }}>
            <div style={{ ...cardStyle, marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div>
                        <span style={{ fontSize: FS.sm, fontWeight: 600, color: '#334155', display: 'block', marginBottom: '2px' }}>Matriz Detectada (Población Total):</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <small title="Total de filas" style={{ color: 'var(--text-muted)', fontSize: FS.xs }}>
                                N = <strong style={{ color: 'var(--primary-color)' }}>{filas?.length || 0}</strong>
                            </small>
                        </div>
                    </div>
                    <button onClick={abrirEditor} className="btn-icon" style={{ borderRadius: RADIUS, fontSize: FS.sm, padding: '6px 14px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <EditarDatos /> Editar Datos
                    </button>
                </div>

                {/* SELECTOR DE MODO DE ENTRADA */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                    <div style={{ display: 'inline-flex', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                        <button
                            type="button"
                            onClick={() => { setInputMode('matriz'); setResultado(null); setError(''); }}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '6px',
                                fontSize: FS.sm,
                                fontWeight: 600,
                                border: 'none',
                                cursor: 'pointer',
                                background: inputMode === 'matriz' ? 'var(--primary-color)' : 'transparent',
                                color: inputMode === 'matriz' ? '#fff' : 'var(--text-muted)',
                                transition: 'all 0.2s'
                            }}
                        >
                            Análisis de Matriz
                        </button>
                        <button
                            type="button"
                            onClick={() => { setInputMode('manual'); setResultado(null); setError(''); }}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '6px',
                                fontSize: FS.sm,
                                fontWeight: 600,
                                border: 'none',
                                cursor: 'pointer',
                                background: inputMode === 'manual' ? 'var(--primary-color)' : 'transparent',
                                color: inputMode === 'manual' ? '#fff' : 'var(--text-muted)',
                                transition: 'all 0.2s'
                            }}
                        >
                            Modo Manual
                        </button>
                    </div>
                </div>

                <h4 style={{ color: 'var(--primary-color)', margin: '0 0 15px 0', fontSize: FS.sm }}>Parámetros del Espacio Continuo:</h4>

                {inputMode === 'manual' || numCols.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: 'var(--bg-input)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                        {inputMode === 'matriz' ? (
                            <>
                                <div style={{ width: '100%' }}>
                                    <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px', fontWeight: 600 }}>1. Variable Continua Numérica:</label>
                                    <select value={varUniforme} onChange={(e) => setVarUniforme(e.target.value)} style={{ width: '100%', maxWidth: '400px', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '2px solid var(--primary-color)', background: '#fff', fontWeight: 600 }}>
                                        <option value="">-- Seleccionar --</option>
                                        {numCols.map(col => <option key={col} value={col}>{col}</option>)}
                                    </select>
                                </div>

                                {bounds && (
                                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: RADIUS }}>
                                        <div style={{ flex: 1, minWidth: '150px' }}>
                                            <label style={{ fontSize: FS.xs, color: '#64748b', display: 'block', marginBottom: '2px', fontWeight: 'bold' }}>Universo Poblacional Min (A):</label>
                                            <input type="number" readOnly value={bounds.min} style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: '150px' }}>
                                            <label style={{ fontSize: FS.xs, color: '#64748b', display: 'block', marginBottom: '2px', fontWeight: 'bold' }}>Universo Poblacional Max (B):</label>
                                            <input type="number" readOnly value={bounds.max} style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }} />
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', padding: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: RADIUS }}>
                                <h5 style={{ margin: '10px 0 10px 0', color: '#334155', fontSize: FS.sm, width: '100%' }}>1. Límites del Universo Poblacional</h5>
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <label style={{ fontSize: FS.sm, color: '#1e3a8a', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Universo Min (A):</label>
                                    <input type="number" value={manualA} onChange={(e) => setManualA(e.target.value)} placeholder="Ej. 0" style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '1px solid #93c5fd' }} />
                                </div>
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <label style={{ fontSize: FS.sm, color: '#1e3a8a', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Universo Max (B):</label>
                                    <input type="number" value={manualB} onChange={(e) => setManualB(e.target.value)} placeholder="Ej. 100" style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '1px solid #93c5fd' }} />
                                </div>
                            </div>
                        )}

                        <h5 style={{ margin: '10px 0 0 0', color: '#334155', fontSize: FS.sm }}>2. Rango de Interés (Pregunta): P(a ≤ X ≤ b)</h5>
                        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '150px' }}>
                                <label style={{ fontSize: FS.sm, display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#1e293b' }}>Mínimo a evaluar (a):</label>
                                <input type="number" value={inputMin} onChange={(e) => setInputMin(e.target.value)} placeholder="Ej. 10" style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '1px solid #94a3b8' }} />
                            </div>
                            <div style={{ flex: 1, minWidth: '150px' }}>
                                <label style={{ fontSize: FS.sm, display: 'block', marginBottom: '4px', fontWeight: 'bold', color: '#1e293b' }}>Máximo a evaluar (b):</label>
                                <input type="number" value={inputMax} onChange={(e) => setInputMax(e.target.value)} placeholder="Ej. 20" style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '1px solid #94a3b8' }} />
                            </div>
                        </div>

                        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button onClick={calcular} disabled={(inputMode === 'matriz' && !varUniforme) || !inputMin || !inputMax} style={{ padding: '8px 30px', borderRadius: RADIUS, fontSize: FS.sm, fontWeight: 700, height: '38px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: ((inputMode === 'matriz' && !varUniforme) || !inputMin || !inputMax) ? 0.5 : 1 }}>
                                <IconoCalculadora /> CALCULADORA PROBABILIDAD (ÁREA)
                            </button>
                        </div>
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: FS.sm, fontStyle: 'italic' }}>Importa una matriz de Excel en el panel izquierdo que contenga al menos una columna numérica para continuar.</p>
                )}

                {error && <div style={{ marginTop: '15px', padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: RADIUS, border: '1px solid #f87171', fontWeight: 'bold', fontSize: FS.xs }}>{error}</div>}
            </div>

            {/* ZONA DE RESULTADOS */}
            {resultado && (
                <>
                    {/* Tarjeta de Desarrollo Matemático */}
                    <div style={{ ...cardStyle, marginBottom: '20px', borderTop: '4px solid #3b82f6' }}>
                        <h4 style={{ color: '#475569', margin: '0 0 15px 0', fontSize: FS.sm, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>Desarrollo Matemático</h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: '#f8fafc', padding: '20px 40px', borderRadius: RADIUS, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', maxWidth: '800px', margin: '0 auto' }}>

                            {/* Paso 1 */}
                            <div>
                                <p style={{ fontSize: FS.md, color: '#1e293b', marginBottom: '12px', fontWeight: 'bold' }}>
                                    Paso 1: Cálculo de la Altura (Densidad de la Distribución)
                                </p>
                                <div style={{ background: '#ffffff', padding: '15px', borderRadius: RADIUS, border: '1px dashed #cbd5e1' }}>
                                    <BlockMath math={`H = \\frac{1}{B - A}`} />
                                    <BlockMath math={`H = \\frac{1}{${resultado.B} - ${resultado.A}} = ${resultado.H.toFixed(4)}`} />
                                </div>
                            </div>

                            {/* Paso 2 */}
                            <div>
                                <p style={{ fontSize: FS.md, color: '#1e293b', marginBottom: '12px', fontWeight: 'bold' }}>
                                    Paso 2: Cálculo del Área (Probabilidad)
                                </p>
                                <div style={{ background: '#ffffff', padding: '15px', borderRadius: RADIUS, border: '1px dashed #cbd5e1' }}>
                                    <BlockMath math={`P(a \\le X \\le b) = \\text{Base} \\times \\text{Altura}`} />
                                    <BlockMath math={`P(${resultado.a} \\le X \\le ${resultado.b}) = (${resultado.b} - ${resultado.a}) \\times ${resultado.H.toFixed(4)} = ${(resultado.prob).toFixed(4)}`} />
                                </div>
                            </div>

                        </div>

                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <div style={{ fontSize: FS.xl, fontWeight: 'bold', color: '#0f172a', padding: '15px 30px', background: '#ecfdf5', border: '2px solid #10b981', borderRadius: RADIUS, display: 'inline-block', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.15)' }}>
                                Resultado Final: {(resultado.prob * 100).toFixed(2)}%
                            </div>
                        </div>
                    </div>

                    {/* Gráfico 1: Área Teórica */}
                    <div style={{ marginBottom: '20px' }}>
                        <MarcoWidgetMAT251 id="w-uni-area" titulo="Modelo de Espacio Continuo y Área de Interés" anchoCompleto={true} alto="380px">
                            <div style={{ width: '100%', height: '100%', minWidth: 0, padding: '10px', overflowX: 'auto', overflowY: 'hidden' }}>
                                <GraficoUniformeArea A={resultado.A} B={resultado.B} a={resultado.a} b={resultado.b} H={resultado.H} />
                            </div>
                        </MarcoWidgetMAT251>
                    </div>

                    {/* Gráfico 2: Mosaico Frecuencial */}
                    {resultado.inputMode !== 'manual' && (
                        <div style={{ marginBottom: '20px' }}>
                            <MarcoWidgetMAT251 id="w-uni-mosaico" titulo="Mosaico Frecuencial vs. Modelo Continuo" anchoCompleto={true} alto="380px">
                                <div style={{ width: '100%', height: '100%', minWidth: 0, padding: '10px', overflowX: 'auto', overflowY: 'hidden' }}>
                                    <GraficoUniformeMosaico dataReales={resultado.dataReales} A={resultado.A} B={resultado.B} H={resultado.H} />
                                </div>
                            </MarcoWidgetMAT251>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
