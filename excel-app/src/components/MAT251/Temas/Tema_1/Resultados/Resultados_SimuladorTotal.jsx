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
import { IconoCalculadora, EditarDatos } from '../../../../ui/iconos';
import katex from 'katex';
import ArbolProbabilidad from '../../../Graficas/ArbolProbabilidad';
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
            formulaLatex += `P(\\text{${ramaSeleccionada.nombre}} | B) &= \\mathbf{${(ramaSeleccionada.mult / resultado.probB).toFixed(4)}}\n`;
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
    const [ordenWidgets, setOrdenWidgets] = useState(['w-arbol']);
    const [causaBayes, setCausaBayes] = useState('');

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
            </div>

            {resultado && (
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
                                        <th style={{ padding: '8px 6px', color: 'var(--text-muted)', fontWeight: 500 }}>Frecuencia <span dangerouslySetInnerHTML={{ __html: katex.renderToString('(n)') }} /></th>
                                        <th style={{ padding: '8px 6px' }}><span dangerouslySetInnerHTML={{ __html: katex.renderToString('P(A_i)') }} /></th>
                                        <th style={{ padding: '8px 6px', color: 'var(--text-muted)', fontWeight: 500 }}>Éxitos en <span dangerouslySetInnerHTML={{ __html: katex.renderToString('A_i') }} /></th>
                                        <th style={{ padding: '8px 6px' }}><span dangerouslySetInnerHTML={{ __html: katex.renderToString('P(B|A_i)') }} /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ramas.map((rama) => (
                                        <tr key={rama.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '8px 6px', fontWeight: 600 }}>{rama.nombre}</td>
                                            <td style={{ padding: '8px 6px', color: 'var(--text-muted)', fontSize: '0.9em' }}>
                                                {rama.n_Ai} / {rama.totalDatos}
                                            </td>
                                            <td style={{ padding: '8px 6px', fontWeight: 'bold' }}>{rama.pA.toFixed(4)}</td>
                                            <td style={{ padding: '8px 6px', color: 'var(--text-muted)', fontSize: '0.9em' }}>
                                                {rama.n_B_dado_Ai} / {rama.n_Ai}
                                            </td>
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
                        <FormulaMatematica resultado={resultado} />
                        <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(2, 132, 199, 0.05)', border: '1.5px solid var(--primary-color)', borderRadius: RADIUS, textAlign: 'center' }}>
                            <div style={{ fontSize: FS.lg, fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                P(B) = {resultado.probB.toFixed(4)}
                            </div>
                            <div style={{ fontSize: FS.sm, color: 'var(--text-main)', marginTop: '4px' }}>
                                ({(resultado.probB * 100).toFixed(2)}% probabilidad)
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
                                {ramas.map(r => (
                                    <option key={r.id} value={r.nombre}>{r.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {causaBayes && (
                            <>
                                <h4 style={{ color: 'var(--primary-color)', fontSize: FS.sm, margin: '15px 0 10px 0' }}>Desarrollo Matemático: Teorema de Bayes</h4>
                                <FormulaBayes resultado={resultado} ramaSeleccionada={ramas.find(r => r.nombre === causaBayes)} />
                                
                                {(() => {
                                    const rama = ramas.find(r => r.nombre === causaBayes);
                                    if (!rama) return null;
                                    const bayesResult = rama.mult / resultado.probB;
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
                                            <MarcoWidgetMAT251 key={id} id={id} titulo="Árbol de Probabilidad" anchoCompleto={true} alto={`${Math.max(400, ramas.length * 140) + 120}px`}>
                                                <div style={{ width: '100%', height: '100%', minWidth: 0 }}>
                                                    <ArbolProbabilidad resultado={resultado} ramas={ramas} causaBayes={causaBayes} />
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
