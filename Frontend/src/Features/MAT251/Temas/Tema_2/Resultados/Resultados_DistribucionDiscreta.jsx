import React, { useState, useMemo } from 'react';
import katex from 'katex';
import "katex/dist/katex.min.css";
import GraficoBastonesDiscreta from "../../../Graficas/Tema_2/GraficoBastonesDiscreta";
import MarcoWidgetMAT251 from "../../../ui/MarcoWidgetMAT251";

const LatexText = React.memo(({ math }) => {
    return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />;
});

export default function Resultados_DistribucionDiscreta({ resultados }) {
    const [ordenMomento, setOrdenMomento] = useState(1);
    const [propA, setPropA] = useState(2);
    const [propB, setPropB] = useState(3);

    // Cálculo interactivo del momento solicitado
    const momentoCalculado = useMemo(() => {
        if (!resultados || !resultados.datos) return 0;
        const r = parseInt(ordenMomento);
        if (isNaN(r)) return 0;
        return resultados.datos.reduce((acc, d) => acc + (Math.pow(d.x, r) * d.p), 0);
    }, [resultados, ordenMomento]);

    const renderLatex = (str) => {
        return <LatexText math={str} />;
    };

    const cardStyle = {
        background: 'transparent',
        color: 'var(--text-main, #1e293b)',
        padding: '10px 0',
        height: '100%',
        boxSizing: 'border-box'
    };

    if (!resultados) return null;

    if (resultados.error) {
        return (
            <div style={cardStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.8, color: '#ef4444' }}>
                    <p>{resultados.error}</p>
                </div>
            </div>
        );
    }

    // Desgloses visuales a partir de resultados.datos
    const desgloseEX = resultados.datos.map(d => `(${d.x} \\times ${parseFloat(d.p.toFixed(4))})`).join(' + ');
    const esperanzaX2 = resultados.datos.reduce((acc, d) => acc + (d.x ** 2) * d.p, 0);
    const desgloseVar = `${esperanzaX2.toFixed(4)} - (${resultados.esperanza.toFixed(4)})^2`;
    
    // Comprobación interactiva de propiedades
    const evalA = parseFloat(propA) || 0;
    const evalB = parseFloat(propB) || 0;
    const propEsperanza = evalA * resultados.esperanza + evalB;
    const propVarianza = (evalA ** 2) * resultados.varianza;

    return (
        <div style={cardStyle}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', paddingRight: '5px' }}>

                {/* Tabla de Distribución y Desglose (Combinada) */}
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-main, #1e293b)' }}>Distribución de Probabilidad y Desglose</h4>
                    <div style={{
                        background: 'transparent',
                        overflowX: 'auto',
                        border: 'none',
                        boxShadow: 'none'
                    }}>
                        <table style={{ 
                            width: '100%', 
                            tableLayout: 'fixed', 
                            borderCollapse: 'collapse', 
                            textAlign: 'center', 
                            fontSize: 'clamp(0.65rem, 1.8vw, 0.85rem)', 
                            borderTop: '1px solid var(--border-color, #e2e8f0)', 
                            borderBottom: '1px solid var(--border-color, #e2e8f0)', 
                            borderLeft: 'none', 
                            borderRight: 'none',
                            boxShadow: 'none' 
                        }}>
                            <thead style={{ backgroundColor: 'rgba(148, 163, 184, 0.1)' }}>
                                <tr>
                                    <th style={{ padding: '10px 8px', color: 'var(--text-main)', fontWeight: 600, borderBottom: '1px solid var(--border-color)', borderLeft: 'none', borderRight: 'none' }}>{renderLatex('x_i')}</th>
                                    {resultados.datos.some(d => d.f !== undefined) && (
                                        <th style={{ padding: '10px 8px', color: 'var(--text-main)', fontWeight: 600, borderBottom: '1px solid var(--border-color)', borderLeft: 'none', borderRight: 'none' }}>{renderLatex('f_i')}</th>
                                    )}
                                    <th style={{ padding: '10px 8px', color: 'var(--text-main)', fontWeight: 600, borderBottom: '1px solid var(--border-color)', borderLeft: 'none', borderRight: 'none' }}>{renderLatex('P(x_i)')}</th>
                                    <th style={{ padding: '10px 8px', color: 'var(--text-main)', fontWeight: 600, borderBottom: '1px solid var(--border-color)', borderLeft: 'none', borderRight: 'none' }}>{renderLatex('x_i \\cdot P(x_i)')}</th>
                                    <th style={{ padding: '10px 8px', color: 'var(--text-main)', fontWeight: 600, borderBottom: '1px solid var(--border-color)', borderLeft: 'none', borderRight: 'none' }}>{renderLatex('x_i^2 \\cdot P(x_i)')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultados.datos.map((d, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '10px 8px', color: 'var(--text-main)', borderLeft: 'none', borderRight: 'none' }}>{d.x}</td>
                                        {d.f !== undefined && (
                                            <td style={{ padding: '10px 8px', color: 'var(--text-main)', borderLeft: 'none', borderRight: 'none' }}>{d.f}</td>
                                        )}
                                        <td style={{ padding: '10px 8px', color: 'var(--text-main)', borderLeft: 'none', borderRight: 'none' }}>{Number(d.p).toFixed(4)}</td>
                                        <td style={{ padding: '10px 8px', color: 'var(--text-main)', borderLeft: 'none', borderRight: 'none' }}>{(d.x * d.p).toFixed(4)}</td>
                                        <td style={{ padding: '10px 8px', color: 'var(--text-main)', borderLeft: 'none', borderRight: 'none' }}>{((d.x ** 2) * d.p).toFixed(4)}</td>
                                    </tr>
                                ))}
                                <tr style={{ fontWeight: 'bold', backgroundColor: 'rgba(148, 163, 184, 0.05)', color: 'var(--text-main)' }}>
                                    <td style={{ padding: '10px 8px', borderLeft: 'none', borderRight: 'none' }}>Total / Suma</td>
                                    {resultados.datos.some(d => d.f !== undefined) && (
                                        <td style={{ padding: '10px 8px', borderLeft: 'none', borderRight: 'none' }}>{resultados.datos.reduce((acc, d) => acc + d.f, 0)}</td>
                                    )}
                                    <td style={{ padding: '10px 8px', borderLeft: 'none', borderRight: 'none' }}>{parseFloat(resultados.datos.reduce((acc, d) => acc + d.p, 0).toFixed(4))}</td>
                                    <td style={{ padding: '10px 8px', borderLeft: 'none', borderRight: 'none' }}>{renderLatex(`\\sum = ${resultados.esperanza.toFixed(4)}`)}</td>
                                    <td style={{ padding: '10px 8px', borderLeft: 'none', borderRight: 'none' }}>{renderLatex(`\\sum = ${esperanzaX2.toFixed(4)}`)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Esperanza Matemática */}
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary-color, #3b82f6)' }}>Esperanza Matemática {renderLatex('E(X)')}</h4>
                    <div style={{ padding: '15px', background: 'var(--bg-input, #f8fafc)', borderRadius: '8px' }}>
                        <div style={{ padding: '10px', background: 'var(--bg-card, #fff)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '6px', textAlign: 'center', marginBottom: '15px' }}>
                            <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.95rem)' }}>
                                {renderLatex(`E(X) = \\sum x_i \\cdot P(X = x_i)`)}
                            </div>
                        </div>
                        <div style={{ fontSize: 'clamp(0.65rem, 1.8vw, 0.85rem)', color: 'var(--text-muted, #64748b)', marginBottom: '10px' }}>
                            {renderLatex(`E(X) = ${desgloseEX}`)}
                        </div>
                        <div style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)', fontWeight: 'bold', color: 'var(--text-main, #1e293b)' }}>
                            {renderLatex(`E(X) = ${resultados.esperanza.toFixed(4)}`)}
                        </div>
                    </div>
                </div>

                {/* Varianza y Desviación */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary-color, #3b82f6)' }}>Varianza</h4>
                            <div style={{ padding: '15px', background: 'var(--bg-input, #f8fafc)', borderRadius: '8px' }}>
                                <div style={{ padding: '10px', background: 'var(--bg-card, #fff)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '6px', textAlign: 'center', marginBottom: '15px' }}>
                                    <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.95rem)' }}>
                                        {renderLatex(`V(X) = E(X^2) - [E(X)]^2`)}
                                    </div>
                                </div>
                                <div style={{ fontSize: 'clamp(0.65rem, 1.8vw, 0.85rem)', color: 'var(--text-muted, #64748b)', marginBottom: '10px' }}>
                                    {renderLatex(`V(X) = ${desgloseVar}`)}
                                </div>
                                <div style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)', fontWeight: 'bold', color: 'var(--text-main, #1e293b)' }}>
                                    {renderLatex(`V(X) = ${resultados.varianza.toFixed(4)}`)}
                                </div>
                            </div>
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary-color, #3b82f6)' }}>Desviación Estándar</h4>
                            <div style={{ padding: '15px', background: 'var(--bg-input, #f8fafc)', borderRadius: '8px' }}>
                                <div style={{ padding: '10px', background: 'var(--bg-card, #fff)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '6px', textAlign: 'center', marginBottom: '15px' }}>
                                    <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.95rem)' }}>
                                        {renderLatex(`\\sigma = \\sqrt{V(X)}`)}
                                    </div>
                                </div>
                                <div style={{ fontSize: 'clamp(0.65rem, 1.8vw, 0.85rem)', color: 'var(--text-muted, #64748b)', marginBottom: '10px' }}>
                                    {renderLatex(`\\sigma = \\sqrt{${resultados.varianza.toFixed(4)}}`)}
                                </div>
                                <div style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)', fontWeight: 'bold', color: 'var(--text-main, #1e293b)' }}>
                                    {renderLatex(`\\sigma = ${resultados.desviacion.toFixed(4)}`)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Momentos de la Variable Aleatoria */}
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary-color, #3b82f6)' }}>Momentos de la Variable Aleatoria</h4>
                    <div style={{ padding: '15px', background: 'var(--bg-input, #f8fafc)', borderRadius: '8px' }}>
                        <div style={{ padding: '10px', background: 'var(--bg-card, #fff)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '6px', textAlign: 'center', marginBottom: '15px' }}>
                            <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.95rem)' }}>
                                {renderLatex(`\\mu'_{r} = E(X^r) = \\sum x_i^r \\cdot P(x_i)`)}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)', fontWeight: 'bold', color: 'var(--text-main, #1e293b)' }}>
                                {renderLatex(`\\mu'_{${ordenMomento || 'r'}} = E(X^{${ordenMomento || 'r'}}) = ${momentoCalculado.toFixed(4)}`)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>r:</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    step="1" 
                                    value={ordenMomento} 
                                    onChange={(e) => setOrdenMomento(e.target.value)}
                                    style={{ width: '60px', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color, #cbd5e1)', textAlign: 'center' }}
                                    title="Ingresar orden del momento"
                                />
                            </div>
                        </div>
                    </div>
                </div>


                {/* Propiedades de Esperanza y Varianza (Oculto temporalmente) */}
                {false && (
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, color: 'var(--primary-color, #3b82f6)' }}>Propiedades: Y = aX + b</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>a:</label>
                            <input 
                                type="number" 
                                value={propA} 
                                onChange={(e) => setPropA(e.target.value)}
                                style={{ width: '60px', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color, #cbd5e1)', textAlign: 'center' }}
                            />
                            <label style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>b:</label>
                            <input 
                                type="number" 
                                value={propB} 
                                onChange={(e) => setPropB(e.target.value)}
                                style={{ width: '60px', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color, #cbd5e1)', textAlign: 'center' }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <div style={{ padding: '15px', background: 'var(--bg-input, #f8fafc)', borderRadius: '8px' }}>
                                <div style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)', fontWeight: 600, color: 'var(--text-muted, #64748b)', marginBottom: '10px' }}>Propiedad Esperanza</div>
                                <div style={{ padding: '10px', background: 'var(--bg-card, #fff)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '6px', textAlign: 'center', marginBottom: '15px' }}>
                                    <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.95rem)' }}>
                                        {renderLatex(`E(aX + b) = aE(X) + b`)}
                                    </div>
                                </div>
                                <div style={{ fontSize: 'clamp(0.65rem, 1.8vw, 0.85rem)', color: 'var(--text-muted, #64748b)', marginBottom: '10px' }}>
                                    {renderLatex(`E(${evalA}X + ${evalB}) = ${evalA}(${resultados.esperanza.toFixed(4)}) + ${evalB}`)}
                                </div>
                                <div style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)', fontWeight: 'bold', color: 'var(--text-main, #1e293b)' }}>
                                    {renderLatex(`E(Y) = ${propEsperanza.toFixed(4)}`)}
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <div style={{ padding: '15px', background: 'var(--bg-input, #f8fafc)', borderRadius: '8px' }}>
                                <div style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)', fontWeight: 600, color: 'var(--text-muted, #64748b)', marginBottom: '10px' }}>Propiedad Varianza</div>
                                <div style={{ padding: '10px', background: 'var(--bg-card, #fff)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '6px', textAlign: 'center', marginBottom: '15px' }}>
                                    <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.95rem)' }}>
                                        {renderLatex(`V(aX + b) = a^2V(X)`)}
                                    </div>
                                </div>
                                <div style={{ fontSize: 'clamp(0.65rem, 1.8vw, 0.85rem)', color: 'var(--text-muted, #64748b)', marginBottom: '10px' }}>
                                    {renderLatex(`V(${evalA}X + ${evalB}) = (${evalA})^2(${resultados.varianza.toFixed(4)})`)}
                                </div>
                                <div style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)', fontWeight: 'bold', color: 'var(--text-main, #1e293b)' }}>
                                    {renderLatex(`V(Y) = ${propVarianza.toFixed(4)}`)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {/* Gráfico de Función de Masa de Probabilidad (Bastones) */}
                <div style={{ marginTop: '20px' }}>
                    <MarcoWidgetMAT251 
                        id="grafico-bastones-discreta" 
                        titulo="Función de Masa de Probabilidad - f(x)" 
                        anchoCompleto={true} 
                        alto="400px"
                    >
                        <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
                            <GraficoBastonesDiscreta datos={resultados.datos} />
                        </div>
                    </MarcoWidgetMAT251>
                </div>

            </div>
        </div>
    );
}
