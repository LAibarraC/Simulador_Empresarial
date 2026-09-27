import React, { useState, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function Resultados_EstimacionSimulacion({ resultados }) {
    if (!resultados) return null;

    const { parametro, parametroVerdadero, resumen, simulaciones, distribucion, paramsDist } = resultados;

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const n = simulaciones.length > 0 && simulaciones[0].muestra ? simulaciones[0].muestra.length : 0;
    
    const getParamsText = () => {
        if (!distribucion || !paramsDist) return '';
        if (distribucion === 'normal') return `\\mu = ${paramsDist.mu.toLocaleString()} \\text{ y } \\sigma = ${paramsDist.sigma.toLocaleString()}`;
        if (distribucion === 'bernoulli') return `p = ${paramsDist.p}`;
        if (distribucion === 'poisson') return `\\lambda = ${paramsDist.lambda}`;
        if (distribucion === 'uniforme') return `a = ${paramsDist.a} \\text{ y } b = ${paramsDist.b}`;
        if (distribucion === 'binomial') return `n = ${paramsDist.n_ensayos} \\text{ y } p = ${paramsDist.p}`;
        return '';
    };

    let simbolo = '\\hat{\\mu}';
    let pName = 'Media (μ)';
    if (parametro === 'proporcion') { simbolo = '\\hat{p}'; pName = 'Proporción (p)'; }
    if (parametro === 'varianza') { simbolo = 'S^2'; pName = 'Varianza (σ²)'; }

    return (
        <div style={{ marginTop: '0px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-main, #1e293b)' }}>Resultados:</h4>
            
            <div style={{ 
                background: 'rgba(37, 99, 235, 0.05)', 
                border: '1px solid rgba(37, 99, 235, 0.2)', 
                borderRadius: '8px', 
                padding: '12px 18px', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
            }}>
                <div style={{ color: 'var(--primary-color, #2563eb)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                </div>
                <div>
                    <h5 style={{ margin: '0 0 0px 0', color: 'var(--primary-color, #2563eb)', fontSize: '0.9rem', fontWeight: 600 }}>Simulación completada</h5>
                    <p style={{ margin: 0, fontSize: '0.7rem' }}>
                        Se generaron <strong>{simulaciones.length}</strong> muestras de tamaño <strong>{renderKatex(`n = ${n}`)}</strong>
                        {distribucion && paramsDist ? (
                            <span> desde una población {distribucion !== 'normal' ? distribucion : ''} con <strong>{renderKatex(getParamsText())}</strong>.</span>
                        ) : (
                            <span>.</span>
                        )}
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '15px' }}>
                {parametroVerdadero !== null && (
                    <div className="card-resultado" style={{ background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            <svg width="18" height="18" viewBox="0 0 640 512" fill="currentColor" style={{ color: '#ea580c' }}>
                                <path d="M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm32 32h-64c-17.6 0-33.5 7.1-45.1 18.6 40.3 22.1 68.9 62 75.1 109.4h66c17.7 0 32-14.3 32-32v-32c0-35.3-28.7-64-64-64zm-256 0c61.9 0 112-50.1 112-112S381.9 32 320 32 208 82.1 208 144s50.1 112 112 112zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C179.6 288 128 339.6 128 403.2V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5 263.1 145.6 256 128 256H64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h66.9c6.2-47.4 34.8-87.3 75.1-109.4z"/>
                            </svg>
                            Parámetro Poblacional Real
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold'}}>
                            {parametroVerdadero.toFixed(4)}
                        </div>
                    </div>
                )}

                <div className="card-resultado" style={{ background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75em', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                                style={{ color: 'var(--primary-color)' }}>
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                        Promedio de las Estimaciones
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                        {renderKatex(`\\overline{${simbolo}} = ${resumen.promedio.toFixed(4)}`)}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '15px' }}>
                <div className="card-stat" style={{ background: 'rgba(147, 51, 234, 0.08)', border: '1px solid rgba(147, 51, 234, 0.4)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: 600 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ color: '#9333ea' }}>
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                        Desv. Est. de Estimaciones:
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold'}}>{resumen.desviacion.toFixed(4)}</span>
                </div>
                <div className="card-stat" style={{ background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.4)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: 600 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ color: '#dc2626' }}>
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="8 12 12 16 16 12"></polyline>
                            <line x1="12" y1="8" x2="12" y2="16"></line>
                        </svg>
                        Mínimo {renderKatex(`(${simbolo})`)}:
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{resumen.min.toFixed(4)}</span>
                </div>
                <div className="card-stat" style={{ background: 'rgba(22, 163, 74, 0.08)', border: '1px solid rgba(22, 163, 74, 0.4)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: 600 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                         style={{ color: '#16a34a' }}>
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="16 12 12 8 8 12"></polyline>
                            <line x1="12" y1="16" x2="12" y2="8"></line>
                        </svg>
                        Máximo {renderKatex(`(${simbolo})`)}:
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{resumen.max.toFixed(4)}</span>
                </div>
            </div>

            {parametroVerdadero !== null && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                    <div className="card-stat" style={{ background: 'var(--bg-input)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>Sesgo del Estimador:</span>
                        <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{resumen.sesgo.toFixed(6)}</span>
                    </div>
                    <div className="card-stat" style={{ background: 'var(--bg-input)' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600 }}>Error Cuadrático Medio:</span>
                        <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{resumen.ecm.toFixed(6)}</span>
                    </div>
                </div>
            )}
            


            {/* TABLA DE RESULTADOS */}
            <div style={{ marginTop: '20px' }}>
                <Tabla_EstimacionSimulacion resultados={resultados} />
            </div>
        </div>
    );
}


const renderKatex = (math) => (
    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
);

function Tabla_EstimacionSimulacion({ resultados }) {
    const [limiteVisible, setLimiteVisible] = useState(10);
    if (!resultados) return null;

    const { parametro, parametroVerdadero, simulaciones } = resultados;

    let estimacionLabel = 'Estimación';
    let diferenciaLabel = 'Diferencia';
    
    if (parametro === 'media') {
        estimacionLabel = <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Media muestral ({renderKatex('\\bar{X}')})</span>;
        diferenciaLabel = <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Diferencia ({renderKatex('\\bar{X} - \\mu')})</span>;
    } else if (parametro === 'proporcion') {
        estimacionLabel = <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Proporción muestral ({renderKatex('\\hat{p}')})</span>;
        diferenciaLabel = <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Diferencia ({renderKatex('\\hat{p} - p')})</span>;
    } else if (parametro === 'varianza') {
        estimacionLabel = <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Varianza muestral ({renderKatex('S^2')})</span>;
        diferenciaLabel = <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Diferencia ({renderKatex('S^2 - \\sigma^2')})</span>;
    }

    const simsMostradas = simulaciones.slice(0, limiteVisible);

    // Calcular tamaño de muestra n basado en la primera simulación
    const n = simulaciones.length > 0 && simulaciones[0].muestra ? simulaciones[0].muestra.length : 0;
    
    // Configurar qué columnas de muestra mostrar dinámicamente para no desbordar
    const sampleCols = useMemo(() => {
        if (n === 0) return [];
        if (n <= 100) {
            return Array.from({ length: n }, (_, i) => i + 1);
        } else {
            return [1, 2, 3, '...', n - 2, n - 1, n];
        }
    }, [n]);

    const renderSampleValue = (muestra, colIdx) => {
        if (!muestra) return '-';
        if (colIdx === '...') return '...';
        const val = muestra[colIdx - 1]; // colIdx es 1-based
        if (val === undefined) return '-';
        return Number.isInteger(val) ? val : Number(val).toFixed(2);
    };

    return (
        <div style={{ marginTop: '0px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', textAlign:'center' }}>
                Muestras y Estimaciones
            </h4>
            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '400px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-card)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'center', fontSize: '0.85em', whiteSpace: 'nowrap' }}>
                    <thead style={{ background: 'var(--bg-input)', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <tr>
                            <th rowSpan={n > 0 ? 2 : 1} style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', width: '1%', whiteSpace: 'nowrap' }}>Simulación</th>
                            {n > 0 && (
                                <th colSpan={sampleCols.length} style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Muestra ( {renderKatex(`n = ${n}`)})</span>
                                </th>
                            )}
                            <th rowSpan={n > 0 ? 2 : 1} style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', width: '1%', whiteSpace: 'nowrap' }}>{estimacionLabel}</th>
                            {parametroVerdadero !== null && (
                                <th rowSpan={n > 0 ? 2 : 1} style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', width: '1%', whiteSpace: 'nowrap' }}>{diferenciaLabel}</th>
                            )}
                        </tr>
                        {n > 0 && (
                            <tr>
                                {sampleCols.map((col, idx) => (
                                    <th key={idx} style={{ padding: '4px', borderBottom: '1px solid var(--border-color)', borderRight: idx === sampleCols.length - 1 ? '1px solid var(--border-color)' : 'none', color: 'var(--text-muted, #64748b)', fontWeight: 500, width: '40px' }}>
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {simsMostradas.map((s, index) => (
                            <tr key={s.simulacion} style={{ borderBottom: '1px solid var(--border-color)', background: index % 2 === 0 ? 'transparent' : 'var(--bg-input)' }}>
                                <td style={{ padding: '8px', borderRight: '1px solid var(--border-color)', fontWeight: 600 }}>{s.simulacion}</td>
                                
                                {n > 0 && sampleCols.map((col, idx) => (
                                    <td key={idx} style={{ padding: '4px', fontSize: '0.9em', color: col === '...' ? 'var(--text-muted)' : 'inherit', borderRight: idx === sampleCols.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                        {s.muestra ? renderSampleValue(s.muestra, col) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                                    </td>
                                ))}
                                
                                <td style={{ padding: '8px', fontWeight: 600, borderRight: '1px solid var(--border-color)' }}>{s.estimacion.toFixed(4)}</td>
                                {parametroVerdadero !== null && (
                                    <td style={{ padding: '8px', color: s.diferencia > 0 ? '#10b981' : '#ef4444' }}>
                                        {s.diferencia != null ? `${s.diferencia > 0 ? '+' : ''}${s.diferencia.toFixed(4)}` : '-'}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px', justifyContent: 'center', width: '100%' }}>
                {limiteVisible < simulaciones.length && (
                    <button 
                        onClick={() => setLimiteVisible(prev => Math.min(prev + 10, simulaciones.length))}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1.5px solid var(--primary-color)', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', padding: '8px 20px', borderRadius: '25px', transition: 'all 0.2s ease', fontSize: '0.85em', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-color)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary-color)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)' }}
                    >
                        Mostrar 10 más
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="13 17 18 12 13 7"></polyline>
                            <polyline points="6 17 11 12 6 7"></polyline>
                        </svg>
                    </button>
                )}
                {limiteVisible < simulaciones.length && limiteVisible + 10 < simulaciones.length && (
                    <button 
                        onClick={() => setLimiteVisible(prev => Math.min(prev + 50, simulaciones.length))}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1.5px solid var(--primary-color)', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', padding: '8px 20px', borderRadius: '25px', transition: 'all 0.2s ease', fontSize: '0.85em', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-color)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary-color)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)' }}
                    >
                        Mostrar 50 más
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="13 17 18 12 13 7"></polyline>
                            <polyline points="6 17 11 12 6 7"></polyline>
                        </svg>
                    </button>
                )}
                {limiteVisible > 10 && (
                    <button 
                        onClick={() => setLimiteVisible(10)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1.5px solid var(--border-color)', color: 'var(--text-muted, #64748b)', cursor: 'pointer', fontWeight: '600', padding: '8px 20px', borderRadius: '25px', transition: 'all 0.2s ease', fontSize: '0.85em' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted, #64748b)'; }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="11 17 6 12 11 7"></polyline>
                            <polyline points="18 17 13 12 18 7"></polyline>
                        </svg>
                        Restablecer a 10
                    </button>
                )}
            </div>
        </div>
    );
}
