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
import { IconoCalculadora, EditarDatos, IconoAlerta } from '../../../../ui/iconos';
import katex from 'katex';
import ArbolProbabilidad from '../../../Graficas/Tema_1/ArbolProbabilidad';
import MarcoWidgetMAT251 from '../../../ui/MarcoWidgetMAT251';
import { calcularProbabilidadTotal } from '../../../Matematicas/logica_Tema1';

const FormulaMatematica = ({ resultado }) => {
    const formulaRef = useRef(null);

    useEffect(() => {
        if (formulaRef.current && resultado) {
            let formulaLatex = `\\begin{aligned}\n`;
            formulaLatex += `P(B) &= \\sum_{i=1}^{n} P(A_i) \\cdot P(B|A_i) \\\\\n`;

            let sumatoriaStr = resultado.desglose.map(r => `P(\\text{${r.nombre}}) \\cdot P(B|\\text{${r.nombre}})`).join(' + ');
            formulaLatex += `P(B) &= ${sumatoriaStr} \\\\\n`;

            let valoresStr = resultado.desglose.map(r => `(${r.pA.toFixed(4)} \\cdot ${r.pB_A.toFixed(4)})`).join(' + ');
            formulaLatex += `P(B) &= ${valoresStr} \\\\\n`;

            let multsStr = resultado.desglose.map(r => `${r.mult.toFixed(4)}`).join(' + ');
            formulaLatex += `P(B) &= ${multsStr} \\\\\n`;

            formulaLatex += `P(B) &= \\mathbf{${resultado.probB.toFixed(4)}}\n`;
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

const FormulaBayes = ({ resultado, ramaSeleccionada }) => {
    const formulaRef = useRef(null);

    useEffect(() => {
        if (formulaRef.current && resultado && ramaSeleccionada) {
            let formulaLatex = `\\begin{aligned}\n`;
            formulaLatex += `P(\\text{${ramaSeleccionada.nombre}} | B) &= \\frac{P(\\text{${ramaSeleccionada.nombre}}) \\cdot P(B|\\text{${ramaSeleccionada.nombre}})}{P(B)} \\\\\n`;
            formulaLatex += `P(\\text{${ramaSeleccionada.nombre}} | B) &= \\frac{${ramaSeleccionada.pA.toFixed(4)} \\cdot ${ramaSeleccionada.pB_A.toFixed(4)}}{${resultado.probB.toFixed(4)}} \\\\\n`;
            formulaLatex += `P(\\text{${ramaSeleccionada.nombre}} | B) &= \\frac{${ramaSeleccionada.mult.toFixed(4)}}{${resultado.probB.toFixed(4)}} \\\\\n`;
            const bayesVal = resultado.probB > 0 ? (ramaSeleccionada.mult / resultado.probB) : 0;
            formulaLatex += `P(\\text{${ramaSeleccionada.nombre}} | B) &= \\mathbf{${bayesVal.toFixed(4)}}\n`;
            formulaLatex += `\\end{aligned}`;

            katex.render(formulaLatex, formulaRef.current, { throwOnError: false, displayMode: true });
        }
    }, [resultado, ramaSeleccionada]);

    return (
        <div style={{ overflowX: 'auto', background: 'var(--bg-input)', padding: '10px', borderRadius: RADIUS }}>
            <div ref={formulaRef}></div>
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
    statsDatos, abrirEditor
}) {
    const [inputMode, setInputMode] = useState('matriz'); // 'matriz' | 'manual'
    const [manualBranches, setManualBranches] = useState([
        { id: 1, name: 'Causa 1', pA: '', pBA: '' },
        { id: 2, name: 'Causa 2', pA: '', pBA: '' }
    ]);

    const [ordenWidgets, setOrdenWidgets] = useState(['w-arbol']);
    const [causaBayes, setCausaBayes] = useState('');

    // Mapear ramas manuales al formato del motor existente
    const { mappedRamas, mappedResultado } = useMemo(() => {
        const mapped = manualBranches.map(b => {
            const pAVal = parseFloat(b.pA) || 0;
            const pBAVal = parseFloat(b.pBA) || 0;
            const mult = pAVal * pBAVal;
            return {
                id: b.id,
                nombre: b.name || `Causa ${b.id}`,
                n_Ai: 0,
                totalDatos: 0,
                pA: pAVal,
                n_B_dado_Ai: 0,
                pB_A: pBAVal,
                mult: mult
            };
        });
        const probB = mapped.reduce((acc, r) => acc + r.mult, 0);
        return {
            mappedRamas: mapped,
            mappedResultado: { probB, desglose: mapped }
        };
    }, [manualBranches]);

    // Usar datos dinámicos según el modo activo
    const activeRamas = inputMode === 'manual' ? mappedRamas : ramas;
    const activeResultado = inputMode === 'manual' ? mappedResultado : resultado;

    const agregarRama = () => {
        const nextId = manualBranches.length > 0 ? Math.max(...manualBranches.map(b => b.id)) + 1 : 1;
        setManualBranches([...manualBranches, { id: nextId, name: `Causa ${nextId}`, pA: '', pBA: '' }]);
    };

    const eliminarRama = (id) => {
        if (manualBranches.length <= 2) return;
        const filtradas = manualBranches.filter(b => b.id !== id);
        setManualBranches(filtradas);
        const eliminada = manualBranches.find(b => b.id === id);
        if (eliminada && causaBayes === eliminada.name) {
            setCausaBayes('');
        }
    };

    const handleBranchChange = (id, field, value) => {
        setManualBranches(manualBranches.map(b => {
            if (b.id === id) {
                return { ...b, [field]: value };
            }
            return b;
        }));
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

    // Extraer valores únicos para el selector de "Éxito" del evento
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

    const calcular = () => {
        if (!varSeleccionada) {
            setErrorSimulador("Importa una Matriz de Excel primero.");
            setResultadoSimulador(null);
            return;
        }
        if (!colCausa || !colEvento || !valExito) {
            setErrorSimulador("Selecciona las columnas de Causa y Evento, así como el valor de éxito.");
            setResultadoSimulador(null);
            return;
        }

        const res = calcularProbabilidadTotal(filas, varSeleccionada.nombresColumnas, colCausa, colEvento, valExito);
        if (res.error) {
            setErrorSimulador(res.error);
            setResultadoSimulador(null);
        } else {
            setRamas(res.resultado.desglose);
            setResultadoSimulador(res.resultado);
            setErrorSimulador('');
            setCausaBayes(''); // Reset Bayes when calculating again
        }
    };

    // Recalcular automáticamente si cambian los datos o las selecciones
    useEffect(() => {
        if (varSeleccionada && colCausa && colEvento && valExito) {
            calcular();
        } else {
            setResultadoSimulador(null);
            setCausaBayes('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filas, colCausa, colEvento, valExito, varSeleccionada]);



    return (
        <div style={{ marginTop: '0px' }}>
            {/* SELECTOR DE MODO DE ENTRADA */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'inline-flex', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                    <button
                        type="button"
                        onClick={() => setInputMode('matriz')}
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
                        onClick={() => setInputMode('manual')}
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

            <div style={{ ...cardStyle, marginBottom: '20px' }}>
                {inputMode === 'manual' ? (
                    /* FORMULARIO DE INGRESO MANUAL */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <h4 style={{ margin: 0, fontSize: FS.sm, fontWeight: 700, color: 'var(--primary-color)' }}>Datos del Ejercicio (Ingreso Manual)</h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {manualBranches.map((rama) => (
                                <div key={rama.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', background: 'var(--bg-input)', padding: '10px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                                    <div style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <label style={labelStyle}>Nombre de la Causa:</label>
                                        <input
                                            type="text"
                                            value={rama.name}
                                            onChange={(e) => handleBranchChange(rama.id, 'name', e.target.value)}
                                            placeholder={`Causa ${rama.id}`}
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
                                        <label style={labelStyle}>Probabilidad P(Ai):</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            value={rama.pA}
                                            onChange={(e) => handleBranchChange(rama.id, 'pA', e.target.value)}
                                            placeholder="0.00"
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
                                        <label style={labelStyle}>Probabilidad P(B|Ai):</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            max="1"
                                            value={rama.pBA}
                                            onChange={(e) => handleBranchChange(rama.id, 'pBA', e.target.value)}
                                            placeholder="0.00"
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
                                    {manualBranches.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => eliminarRama(rama.id)}
                                            style={{
                                                marginTop: '20px',
                                                padding: '8px 14px',
                                                background: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: RADIUS,
                                                cursor: 'pointer',
                                                fontSize: FS.xs,
                                                fontWeight: 700
                                            }}
                                        >
                                            Eliminar
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                            <button
                                type="button"
                                onClick={agregarRama}
                                style={{
                                    padding: '8px 16px',
                                    background: 'var(--primary-color)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: RADIUS,
                                    cursor: 'pointer',
                                    fontSize: FS.sm,
                                    fontWeight: 700
                                }}
                            >
                                + Agregar nueva Causa (Rama)
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
                                La suma de las probabilidades marginales P(Ai) es {(sumPA * 100).toFixed(2)}%. Recuerde que la suma debe ser igual al 100% (1.0).
                            </div>
                        )}
                    </div>
                ) : (
                    /* MODO MATRIZ */
                    <>
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
                        {varSeleccionada && varSeleccionada.nombresColumnas && varSeleccionada.nombresColumnas.length > 1 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end', marginBottom: '20px', background: 'var(--bg-input)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontWeight: 600 }}>
                                        Variable Causa <span dangerouslySetInnerHTML={{ __html: katex.renderToString('A_i') }} />:
                                    </label>
                                    <select
                                        value={colCausa}
                                        onChange={(e) => {
                                            setColCausa(e.target.value);
                                        }}
                                        className="container_cal_input"
                                        style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '1px solid var(--border-color)' }}
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {varSeleccionada.nombresColumnas.map(col => (
                                            <option key={col} value={col}>{col}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontWeight: 600 }}>
                                        Variable Evento <span dangerouslySetInnerHTML={{ __html: katex.renderToString('B') }} />:
                                    </label>
                                    <select
                                        value={colEvento}
                                        onChange={(e) => {
                                            setColEvento(e.target.value);
                                            setValExito('');
                                        }}
                                        className="container_cal_input"
                                        style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '1px solid var(--border-color)' }}
                                    >
                                        <option value="">-- Seleccionar --</option>
                                        {varSeleccionada.nombresColumnas.filter(c => c !== colCausa).map(col => (
                                            <option key={col} value={col}>{col}</option>
                                        ))}
                                    </select>
                                </div>

                                {colEvento && valoresUnicosEvento.length > 0 && (
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px', color: 'var(--primary-color)', fontWeight: 'bold' }}>Valor de "Éxito":</label>
                                        <select
                                            value={valExito}
                                            onChange={(e) => {
                                                setValExito(e.target.value);
                                            }}
                                            className="container_cal_input"
                                            style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '2px solid var(--primary-color)' }}
                                        >
                                            <option value="">-- Seleccionar --</option>
                                            {valoresUnicosEvento.map(val => (
                                                <option key={val} value={val}>{val}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <button
                                    onClick={calcular}
                                    className="button_calcular btn-icon"
                                    style={{ padding: '8px 25px', borderRadius: RADIUS, fontSize: FS.sm, fontWeight: 700, height: '36px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer' }}
                                    disabled={!varSeleccionada || !colCausa || !colEvento || !valExito}
                                >
                                    <IconoCalculadora />
                                    CALCULAR
                                </button>
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
                    <div style={{ ...cardStyle, marginBottom: '20px' }}>
                        <h4 style={{ color: 'var(--primary-color)', margin: '0 0 10px 0', fontSize: FS.sm }}>
                            Desglose de la Matriz:
                        </h4>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: FS.sm }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-input)', borderBottom: '2px solid var(--border-color)' }}>
                                        <th style={{ padding: '8px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>Causa Única <span dangerouslySetInnerHTML={{ __html: katex.renderToString('A_i') }} /></th>
                                        {inputMode === 'matriz' && <th style={{ padding: '8px 6px', color: 'var(--text-muted)', fontWeight: 500 }}>Frecuencia <span dangerouslySetInnerHTML={{ __html: katex.renderToString('(n)') }} /></th>}
                                        <th style={{ padding: '8px 6px' }}><span dangerouslySetInnerHTML={{ __html: katex.renderToString('P(A_i)') }} /></th>
                                        {inputMode === 'matriz' && <th style={{ padding: '8px 6px', color: 'var(--text-muted)', fontWeight: 500 }}>Éxitos en <span dangerouslySetInnerHTML={{ __html: katex.renderToString('A_i') }} /></th>}
                                        <th style={{ padding: '8px 6px' }}><span dangerouslySetInnerHTML={{ __html: katex.renderToString('P(B|A_i)') }} /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeRamas.map((rama) => (
                                        <tr key={rama.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '8px 6px', fontWeight: 600 }}>{rama.nombre}</td>
                                            {inputMode === 'matriz' && (
                                                <td style={{ padding: '8px 6px', color: 'var(--text-muted)', fontSize: '0.9em' }}>
                                                    {rama.n_Ai} / {rama.totalDatos}
                                                </td>
                                            )}
                                            <td style={{ padding: '8px 6px', fontWeight: 'bold' }}>{rama.pA.toFixed(4)}</td>
                                            {inputMode === 'matriz' && (
                                                <td style={{ padding: '8px 6px', color: 'var(--text-muted)', fontSize: '0.9em' }}>
                                                    {rama.n_B_dado_Ai} / {rama.n_Ai}
                                                </td>
                                            )}
                                            <td style={{ padding: '8px 6px', fontWeight: 'bold' }}>{rama.pB_A.toFixed(4)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div style={{ ...cardStyle, marginBottom: '20px' }}>
                        <h3 style={{ color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', fontSize: FS.md, margin: '0 0 15px 0' }}>
                            Desarrollo Matemático: Probabilidad Total
                        </h3>
                        <FormulaMatematica resultado={activeResultado} />
                        <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(2, 132, 199, 0.05)', border: '1.5px solid var(--primary-color)', borderRadius: RADIUS, textAlign: 'center' }}>
                            <div style={{ fontSize: FS.lg, fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                P(B) = {activeResultado.probB.toFixed(4)}
                            </div>
                            <div style={{ fontSize: FS.sm, color: 'var(--text-main)', marginTop: '4px' }}>
                                ({(activeResultado.probB * 100).toFixed(2)}% probabilidad)
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN BAYES */}
                    <div style={{ ...cardStyle, marginBottom: '20px' }}>
                        <h3 style={{ color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', fontSize: FS.md, margin: '0 0 15px 0' }}>
                            Teorema de Bayes
                        </h3>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                                Causa a Investigar (Bayes):
                            </label>
                            <select
                                value={causaBayes}
                                onChange={(e) => setCausaBayes(e.target.value)}
                                className="container_cal_input"
                                style={{ width: '100%', maxWidth: '400px', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '1px solid var(--border-color)' }}
                            >
                                <option value="">-- Seleccionar Causa --</option>
                                {activeRamas.map(r => (
                                    <option key={r.id} value={r.nombre}>{r.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {causaBayes && (
                            <>
                                <h4 style={{ color: 'var(--primary-color)', fontSize: FS.sm, margin: '15px 0 10px 0' }}>Desarrollo Matemático: Teorema de Bayes</h4>
                                <FormulaBayes resultado={activeResultado} ramaSeleccionada={activeRamas.find(r => r.nombre === causaBayes)} />
                                
                                {(() => {
                                    const rama = activeRamas.find(r => r.nombre === causaBayes);
                                    if (!rama) return null;
                                    const bayesResult = activeResultado.probB > 0 ? rama.mult / activeResultado.probB : 0;
                                    return (
                                        <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(249, 115, 22, 0.05)', border: '1.5px solid #f97316', borderRadius: RADIUS, textAlign: 'center' }}>
                                            <div style={{ fontSize: FS.lg, fontWeight: 'bold', color: '#ea580c' }}>
                                                P({rama.nombre} | B) = {bayesResult.toFixed(4)}
                                            </div>
                                            <div style={{ fontSize: FS.sm, color: 'var(--text-main)', marginTop: '4px' }}>
                                                ({(bayesResult * 100).toFixed(2)}% probabilidad)
                                            </div>
                                        </div>
                                    );
                                })()}
                            </>
                        )}
                    </div>


                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={ordenWidgets} strategy={rectSortingStrategy}>
                            <div style={{ width: '100%', minWidth: 0 }}>
                                {ordenWidgets.map((id) => {
                                    if (id === 'w-arbol') {
                                        return (
                                            <MarcoWidgetMAT251 key={id} id={id} titulo="Árbol de Probabilidad" anchoCompleto={true} alto={`${Math.max(400, activeRamas.length * 140) + 120}px`}>
                                                <div style={{ width: '100%', height: '100%', minWidth: 0 }}>
                                                    <ArbolProbabilidad resultado={activeResultado} ramas={activeRamas} causaBayes={causaBayes} />
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
        </div>
    );
}
