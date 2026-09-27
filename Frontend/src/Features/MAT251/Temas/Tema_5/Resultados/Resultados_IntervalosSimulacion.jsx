import React, { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import GraficoEstimacionIntervalos from '../../../Graficas/Tema_5/GraficoEstimacionIntervalos';

export default function Resultados_IntervalosSimulacion({ resultados }) {
    const [pagina, setPagina] = useState(1);
    const SIMS_POR_PAGINA = 10;

    if (!resultados) return null;

    const { parametro, parametroVerdadero, resumen, simulaciones, distribucion, paramsDist, confianza } = resultados;

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const n = resultados.n || 0;
    const numSims = simulaciones.length;
    const totalPaginas = Math.ceil(numSims / SIMS_POR_PAGINA);
    const simsMostradas = simulaciones.slice((pagina - 1) * SIMS_POR_PAGINA, pagina * SIMS_POR_PAGINA);
    
    // Calcular promedio de amplitud si no viene del worker
    const amplitudes = simulaciones.filter(s => s.LI !== undefined && s.LS !== undefined).map(s => s.LS - s.LI);
    const promedioAmplitud = amplitudes.length > 0 ? amplitudes.reduce((a, b) => a + b, 0) / amplitudes.length : 0;
    
    const getParamsText = () => {
        if (!distribucion || !paramsDist) return '';
        if (distribucion === 'normal') return `\\mu = ${paramsDist.mu.toLocaleString()} \\text{ y } \\sigma = ${paramsDist.sigma.toLocaleString()}`;
        if (distribucion === 'bernoulli') return `p = ${paramsDist.p}`;
        if (distribucion === 'poisson') return `\\lambda = ${paramsDist.lambda}`;
        if (distribucion === 'uniforme') return `a = ${paramsDist.a} \\text{ y } b = ${paramsDist.b}`;
        if (distribucion === 'binomial') return `n = ${paramsDist.n_ensayos} \\text{ y } p = ${paramsDist.p}`;
        return '';
    };

    let pName = '\\mu';
    if (parametro === 'proporcion') { pName = 'p'; }
    if (parametro === 'varianza') { pName = '\\sigma^2'; }

    return (
        <div style={{ marginTop: '0px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-main, #1e293b)' }}>Resultados de Cobertura de Intervalos:</h4>
            
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
                        Se generaron <strong>{numSims}</strong> intervalos de confianza al <strong>{confianza}%</strong> para muestras de tamaño <strong>{renderKatex(`n = ${n}`)}</strong>
                        {distribucion && paramsDist ? (
                            <span> desde una población {distribucion !== 'normal' ? distribucion : ''} con <strong>{renderKatex(getParamsText())}</strong>.</span>
                        ) : (
                            <span>.</span>
                        )}
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '15px' }}>
                {parametroVerdadero !== null && (
                    <div className="card-resultado" style={{ background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            Parámetro Poblacional ({renderKatex(pName)})
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold'}}>
                            {parametroVerdadero.toFixed(4)}
                        </div>
                    </div>
                )}

                <div className="card-resultado" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75em', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                        Cobertura Observada
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#059669' }}>
                        {typeof resumen.cobertura === 'number' ? (resumen.cobertura > 1 ? resumen.cobertura.toFixed(2) : (resumen.cobertura * 100).toFixed(2)) : '0.00'}%
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {resumen.contienen} de {numSims} intervalos contienen a {renderKatex(pName)}
                    </div>
                </div>

                <div className="card-resultado" style={{ background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75em', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                        Ancho del Intervalo (Promedio)
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                        {promedioAmplitud.toFixed(4)}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        (Límite Superior - Límite Inferior)
                    </div>
                </div>
            </div>

            <h5 style={{ marginTop: '20px', marginBottom: '10px' }}>Detalle de Simulaciones (Página {pagina} de {totalPaginas})</h5>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85em', textAlign: 'center' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-input)' }}>
                            <th style={{ padding: '8px', borderBottom: '2px solid var(--border-color)' }}>Simulaciones</th>
                            <th style={{ padding: '8px', borderBottom: '2px solid var(--border-color)' }}>{renderKatex(parametro === 'media' ? '\\bar{X}' : parametro === 'proporcion' ? '\\hat{p}' : 'S^2')}</th>
                            <th style={{ padding: '8px', borderBottom: '2px solid var(--border-color)' }}>Límite Inferior</th>
                            <th style={{ padding: '8px', borderBottom: '2px solid var(--border-color)' }}>Límite Superior</th>
                            <th style={{ padding: '8px', borderBottom: '2px solid var(--border-color)' }}>¿Contiene a {renderKatex(pName)}?</th>
                        </tr>
                    </thead>
                    <tbody>
                        {simsMostradas.map((sim, i) => {
                            const indexReal = (pagina - 1) * SIMS_POR_PAGINA + i + 1;
                            const puntual = sim.estimacionPuntual !== undefined ? sim.estimacionPuntual : 0;
                            return (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '6px' }}>{indexReal}</td>
                                    <td style={{ padding: '6px' }}>{puntual.toFixed(4)}</td>
                                    <td style={{ padding: '6px' }}>{sim.LI.toFixed(4)}</td>
                                    <td style={{ padding: '6px' }}>{sim.LS.toFixed(4)}</td>
                                    <td style={{ padding: '6px' }}>
                                        {sim.contiene ? (
                                            <span style={{ color: '#059669', fontWeight: 'bold' }}>Sí</span>
                                        ) : (
                                            <span style={{ color: '#ea580c', fontWeight: 'bold' }}>No</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {totalPaginas > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '15px', gap: '15px' }}>
                    <button 
                        onClick={() => setPagina(p => Math.max(1, p - 1))}
                        disabled={pagina === 1}
                        style={{ 
                            padding: '4px 12px', 
                            fontSize: '0.85em', 
                            borderRadius: '4px', 
                            background: 'transparent', 
                            color: pagina === 1 ? 'var(--text-muted)' : 'var(--primary-color)', 
                            border: `1px solid ${pagina === 1 ? 'var(--border-color)' : 'var(--primary-color)'}`, 
                            cursor: pagina === 1 ? 'not-allowed' : 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Anterior
                    </button>
                    <span style={{ fontSize: '0.85em', color: 'var(--text-main)', fontWeight: '500' }}>Pág. {pagina} / {totalPaginas}</span>
                    <button 
                        onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                        disabled={pagina === totalPaginas}
                        style={{ 
                            padding: '4px 12px', 
                            fontSize: '0.85em', 
                            borderRadius: '4px', 
                            background: 'transparent', 
                            color: pagina === totalPaginas ? 'var(--text-muted)' : 'var(--primary-color)', 
                            border: `1px solid ${pagina === totalPaginas ? 'var(--border-color)' : 'var(--primary-color)'}`, 
                            cursor: pagina === totalPaginas ? 'not-allowed' : 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        Siguiente
                    </button>
                </div>
            )}

            {/* Gráfico Visual */}
            <div style={{ marginTop: '30px' }}>
                <GraficoEstimacionIntervalos resultados={resultados} />
            </div>
        </div>
    );
}
