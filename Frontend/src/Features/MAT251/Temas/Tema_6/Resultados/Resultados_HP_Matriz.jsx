import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cardStyle, FONT } from '../../../Principal/Constantes';
import { jStat } from 'jstat';
import Grafico_HP from '../../../Graficas/Tema_6/Grafico_HP';

export default function Resultados_HP_Matriz({ resultados, prueba }) {
    if (!resultados) return null;

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const isRechazo = resultados.decision === 'Rechazar H₀';
    const decisionColor = isRechazo ? '#ef4444' : '#10b981'; // Red for reject, Green for fail to reject

    // Cálculos extras para la tabla estilo Minitab
    const c = resultados.calculos;
    let ee = null;
    let eeDisplay = null;
    let icDisplay = null;
    
    const confLevel = c ? Math.round((1 - c.alpha) * 100) : 95;
    let icLabel = `IC de ${confLevel}%`;

    if (c) {
        if (c.tipoPrueba === 'derecha') icLabel = `Límite inferior de ${confLevel}%`;
        if (c.tipoPrueba === 'izquierda') icLabel = `Límite superior de ${confLevel}%`;

        if (prueba === 'media_z') {
            ee = c.sigma / Math.sqrt(c.n);
            if (c.tipoPrueba === 'bilateral') {
                const zCrit = jStat.normal.inv(1 - c.alpha / 2, 0, 1);
                icDisplay = `(${(c.x_bar - zCrit * ee).toFixed(3)}; \\, ${(c.x_bar + zCrit * ee).toFixed(3)})`;
            } else if (c.tipoPrueba === 'derecha') {
                const zCrit = jStat.normal.inv(1 - c.alpha, 0, 1);
                icDisplay = `${(c.x_bar - zCrit * ee).toFixed(3)}`;
            } else {
                const zCrit = jStat.normal.inv(1 - c.alpha, 0, 1);
                icDisplay = `${(c.x_bar + zCrit * ee).toFixed(3)}`;
            }
        } else if (prueba === 'media_t') {
            ee = c.s / Math.sqrt(c.n);
            if (c.tipoPrueba === 'bilateral') {
                const tCrit = jStat.studentt.inv(1 - c.alpha / 2, c.n - 1);
                icDisplay = `(${(c.x_bar - tCrit * ee).toFixed(3)}; \\, ${(c.x_bar + tCrit * ee).toFixed(3)})`;
            } else if (c.tipoPrueba === 'derecha') {
                const tCrit = jStat.studentt.inv(1 - c.alpha, c.n - 1);
                icDisplay = `${(c.x_bar - tCrit * ee).toFixed(3)}`;
            } else {
                const tCrit = jStat.studentt.inv(1 - c.alpha, c.n - 1);
                icDisplay = `${(c.x_bar + tCrit * ee).toFixed(3)}`;
            }
        } else if (prueba === 'proporcion') {
            ee = Math.sqrt((c.p_hat * (1 - c.p_hat)) / c.n); 
            eeDisplay = Math.sqrt((c.p0 * (1 - c.p0)) / c.n); // Mostramos el EE de la prueba
            if (c.tipoPrueba === 'bilateral') {
                const zCrit = jStat.normal.inv(1 - c.alpha / 2, 0, 1);
                icDisplay = `(${(c.p_hat - zCrit * ee).toFixed(3)}; \\, ${(c.p_hat + zCrit * ee).toFixed(3)})`;
            } else if (c.tipoPrueba === 'derecha') {
                const zCrit = jStat.normal.inv(1 - c.alpha, 0, 1);
                icDisplay = `${(c.p_hat - zCrit * ee).toFixed(3)}`;
            } else {
                const zCrit = jStat.normal.inv(1 - c.alpha, 0, 1);
                icDisplay = `${(c.p_hat + zCrit * ee).toFixed(3)}`;
            }
        } else if (prueba === 'varianza') {
            const df = c.n - 1;
            const num = df * c.s2;
            if (c.tipoPrueba === 'bilateral') {
                const chiInf = jStat.chisquare.inv(c.alpha / 2, df);
                const chiSup = jStat.chisquare.inv(1 - c.alpha / 2, df);
                icDisplay = `(${(num / chiSup).toFixed(3)}; \\, ${(num / chiInf).toFixed(3)})`;
            } else if (c.tipoPrueba === 'derecha') {
                const chiSup = jStat.chisquare.inv(1 - c.alpha, df);
                icDisplay = `${(num / chiSup).toFixed(3)}`;
            } else {
                const chiInf = jStat.chisquare.inv(c.alpha, df);
                icDisplay = `${(num / chiInf).toFixed(3)}`;
            }
        }
        
        if (eeDisplay === null && ee !== null) {
            eeDisplay = ee;
        }
    }
    
    let colCount = 3;
    if (prueba === 'media_z' || prueba === 'media_t') colCount = 6;
    if (prueba === 'proporcion') colCount = 7;
    if (prueba === 'varianza') colCount = 6;


    return (
        <div style={{width: '100%' }}>
            <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-main, #1e293b)' }}>Resultados:</h4>
            
            {/* PLANTEAMIENTO DE HIPÓTESIS */}
            {c && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '10px', fontSize: '0.9rem', fontFamily: FONT, color: 'var(--text-pure)' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', padding: '4px 12px', background: 'var(--bg-input, #f1f5f9)', borderRadius: '5px', border: '1px solid var(--border-color, #cbd5e1)', fontSize: '0.8rem'}}>
                        {c.tipoPrueba === 'bilateral' ? 'Hipótesis Bilateral' : c.tipoPrueba === 'derecha' ? 'Hipótesis Unilateral Derecha' : 'Hipótesis Unilateral Izquierda'}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ marginBottom: '0px' }}>{renderKatex(`H_0: ${prueba === 'proporcion' ? 'p' : prueba === 'varianza' ? '\\sigma^2' : '\\mu'} = ${c.p0 || c.mu0 || c.sigma02}`)}</div>
                        <div>{renderKatex(`H_1: ${prueba === 'proporcion' ? 'p' : prueba === 'varianza' ? '\\sigma^2' : '\\mu'} ${c.tipoPrueba === 'bilateral' ? '\\neq' : c.tipoPrueba === 'derecha' ? '>' : '<'} ${c.p0 || c.mu0 || c.sigma02}`)}</div>
                    </div>
                </div>
            )}

            {/* TABLA ESTILO MINITAB */}
            {c && (
                <div style={{ marginBottom: '20px', border: '1px solid var(--text-pure)', borderRadius: '4px', fontFamily: FONT, fontSize: '0.9rem', color: 'var(--text-pure)', overflowX: 'auto', background: 'var(--bg-card)' }}>
                    <style>{`
                        .minitab-table {
                            width: 100%;
                            text-align: center;
                            border-collapse: collapse;
                            table-layout: auto;
                        }
                        .minitab-table th, .minitab-table td {
                            padding: 4px 2px;
                            border: 1px solid var(--text-pure);
                            word-wrap: break-word;
                            hyphens: auto;
                        }
                        .minitab-table th:first-child, .minitab-table td:first-child {
                            border-left: none;
                        }
                        .minitab-table th:last-child, .minitab-table td:last-child {
                            border-right: none;
                        }
                        .minitab-table tr:first-child th {
                            border-top: none;
                        }
                        .minitab-table tr:last-child td {
                            border-bottom: none;
                        }
                        
                        .hide-on-pc {
                            display: none;
                        }
                        
                        /* Media query para móviles: reduce la fuente y el padding para que quepa */
                        @media (max-width: 650px) {
                            .minitab-table {
                                font-size: 0.70rem;
                            }
                            .minitab-table th, .minitab-table td {
                                padding: 4px 2px;
                            }
                            .minitab-table col {
                                width: auto !important;
                            }
                            .hide-on-mobile {
                                display: none !important;
                            }
                            .hide-on-pc {
                                display: table-row !important;
                            }
                        }
                    `}</style>
                    <table className="minitab-table">
                        {prueba === 'media_z' || prueba === 'media_t' ? (
                            <colgroup>
                                <col style={{ width: '8%' }} />
                                <col style={{ width: '14%' }} />
                                <col style={{ width: '28%' }} />
                                <col style={{ width: '22%' }} />
                                <col style={{ width: '14%' }} />
                                <col style={{ width: '14%' }} />
                            </colgroup>
                        ) : prueba === 'proporcion' ? (
                            <colgroup>
                                <col style={{ width: '10%' }} />
                                <col style={{ width: '15%' }} />
                                <col style={{ width: '15%' }} />
                                <col style={{ width: '15%' }} />
                                <col style={{ width: '20%' }} />
                                <col style={{ width: '12%' }} />
                                <col style={{ width: '13%' }} />
                            </colgroup>
                        ) : prueba === 'varianza' ? (
                            <colgroup>
                                <col style={{ width: '8%' }} />
                                <col style={{ width: '22%' }} />
                                <col style={{ width: '20%' }} />
                                <col style={{ width: '25%' }} />
                                <col style={{ width: '12%' }} />
                                <col style={{ width: '13%' }} />
                            </colgroup>
                        ) : null}
                        <thead>
                            <tr>
                                <th colSpan={colCount} style={{ padding: '5px 0px', borderBottom: '1px solid var(--text-pure)', fontSize: '1rem' }}>
                                    {prueba === 'media_z' ? 'Z de una muestra' : 
                                     prueba === 'media_t' ? 'T de una muestra' :  
                                     prueba === 'proporcion' ? 'Prueba e IC para una proporción' : 'Prueba de Varianza'}
                                </th>
                            </tr>
                            {/* VISTA PC: 1 fila con 2 columnas */}
                            <tr className="hide-on-mobile">
                                <th colSpan={prueba === 'media_z' ? 3 : colCount} style={{ padding: '5px 10px', textAlign: 'left', borderBottom: '1px solid var(--text-pure)', borderRight: prueba === 'media_z' ? '1px solid var(--text-pure)' : 'none', fontWeight: 'normal' }}>
                                    Prueba de {renderKatex(`${prueba === 'proporcion' ? 'p' : prueba === 'varianza' ? '\\sigma^2' : '\\mu'} = ${c.p0 || c.mu0 || c.sigma02}`)} vs {renderKatex(`${prueba === 'proporcion' ? 'p' : prueba === 'varianza' ? '\\sigma^2' : '\\mu'} ${c.tipoPrueba === 'bilateral' ? '\\neq' : c.tipoPrueba === 'derecha' ? '>' : '<'} ${c.p0 || c.mu0 || c.sigma02}`)}
                                </th>
                                {prueba === 'media_z' && (
                                    <th colSpan={3} style={{ padding: '5px 10px', textAlign: 'left', borderBottom: '1px solid var(--text-pure)', fontWeight: 'normal' }}>
                                        La desviación estándar supuesta {renderKatex(`\\sigma = ${Number(c.sigma).toFixed(3)}`)}
                                    </th>
                                )}
                            </tr>
                            {/* VISTA MÓVIL: 2 filas (apiladas) */}
                            <tr className="hide-on-pc">
                                <th colSpan={colCount} style={{ padding: '5px 10px', textAlign: 'left', borderBottom: '1px solid var(--text-pure)', fontWeight: 'normal' }}>
                                    Prueba de {renderKatex(`${prueba === 'proporcion' ? 'p' : prueba === 'varianza' ? '\\sigma^2' : '\\mu'} = ${c.p0 || c.mu0 || c.sigma02}`)} vs {renderKatex(`${prueba === 'proporcion' ? 'p' : prueba === 'varianza' ? '\\sigma^2' : '\\mu'} ${c.tipoPrueba === 'bilateral' ? '\\neq' : c.tipoPrueba === 'derecha' ? '>' : '<'} ${c.p0 || c.mu0 || c.sigma02}`)}
                                </th>
                            </tr>
                            {prueba === 'media_z' && (
                                <tr className="hide-on-pc">
                                    <th colSpan={colCount} style={{ padding: '5px 10px', textAlign: 'left', borderBottom: '1px solid var(--text-pure)', fontWeight: 'normal' }}>
                                        La desviación estándar supuesta {renderKatex(`\\sigma = ${Number(c.sigma).toFixed(3)}`)}
                                    </th>
                                </tr>
                            )}
                            <tr style={{ background: 'var(--bg-input)' }}>
                                <th>{renderKatex('n')}</th>
                                {(prueba === 'media_z' || prueba === 'media_t') && <th>Media ({renderKatex('\\bar{x}')})</th>}
                                {prueba === 'proporcion' && <th>Evento ({renderKatex('x')})</th>}
                                {prueba === 'proporcion' && <th>Muestra p ({renderKatex('\\hat{p}')})</th>}
                                {prueba === 'varianza' && <th>Varianza Muestral ({renderKatex('S^2')})</th>}
                                {prueba === 'varianza' && <th>Grados de Libertad</th>}
                                {eeDisplay !== null && <th style={{ whiteSpace: 'nowrap' }}>Error Estándar{prueba === 'proporcion' ? '' : ' de la media'}</th>}
                                {icDisplay !== null && <th>{icLabel}</th>}
                                <th>{renderKatex(prueba === 'media_t' ? 'T_c' : prueba === 'varianza' ? '\\chi_c^2' : 'Z_c')}</th>
                                <th>{renderKatex('P')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{renderKatex(c.n != null ? c.n.toString() : '')}</td>
                                {(prueba === 'media_z' || prueba === 'media_t') && <td>{renderKatex(c.x_bar?.toFixed(3) || '')}</td>}
                                {prueba === 'proporcion' && <td>{renderKatex(c.x != null ? c.x.toString() : '')}</td>}
                                {prueba === 'proporcion' && <td>{renderKatex(c.p_hat?.toFixed(3) || '')}</td>}
                                {prueba === 'varianza' && <td>{renderKatex(c.s2?.toFixed(3) || '')}</td>}
                                {prueba === 'varianza' && <td>{renderKatex(c.n != null ? (c.n - 1).toString() : '')}</td>}
                                {eeDisplay !== null && <td>{renderKatex(eeDisplay?.toFixed(3) || '')}</td>}
                                {icDisplay !== null && <td>{renderKatex(icDisplay || '')}</td>}
                                <td>{renderKatex(resultados.estadistico?.toFixed(3) || '')}</td>
                                <td>{renderKatex(resultados.pValor?.toFixed(4) || '')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* GRÁFICA DE DISTRIBUCIÓN */}
            {c && (
                <div style={{ width: '100%', marginTop: '20px', marginBottom: '20px' }}>
                    <Grafico_HP resultados={resultados} prueba={prueba} id="widget-grafica-hp-matriz" />
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9em', color: 'var(--text-pure)', fontWeight: 'bold' }}>Estadístico de Prueba</div>
                    <div style={{ fontSize: '0.95em', fontWeight: 'bold', marginTop: '5px' }}>
                        {prueba === 'media_z' || prueba === 'proporcion' ? renderKatex(`Z_c = ${resultados.estadistico.toFixed(3)}`) :
                         prueba === 'media_t' ? renderKatex(`T_c = ${resultados.estadistico.toFixed(3)}`) :
                         renderKatex(`\\chi^2_c = ${resultados.estadistico.toFixed(3)}`)}
                    </div>
                </div>

                <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9em', color: 'var(--text-pure)', fontWeight: 'bold' }}>Valor Crítico</div>
                    <div style={{ fontSize: '0.95em', fontWeight: 'bold', marginTop: '5px' }}>
                        {resultados.valorCritico.zAlpha2 && renderKatex(`Z_{\\alpha/2} = \\pm ${Math.abs(resultados.valorCritico.zAlpha2).toFixed(3)}`)}
                        {resultados.valorCritico.zAlpha && renderKatex(`Z_\\alpha = ${resultados.valorCritico.zAlpha.toFixed(3)}`)}
                        {resultados.valorCritico.tAlpha2 && renderKatex(`t_{\\alpha/2} = \\pm ${Math.abs(resultados.valorCritico.tAlpha2).toFixed(3)}`)}
                        {resultados.valorCritico.tAlpha && renderKatex(`t_\\alpha = ${resultados.valorCritico.tAlpha.toFixed(3)}`)}
                        {resultados.valorCritico.chiInf && resultados.valorCritico.chiSup && renderKatex(`\\chi^2_{inf} = ${resultados.valorCritico.chiInf.toFixed(3)}, \\chi^2_{sup} = ${resultados.valorCritico.chiSup.toFixed(3)}`)}
                        {resultados.valorCritico.chiInf && !resultados.valorCritico.chiSup && renderKatex(`\\chi^2_\\alpha = ${resultados.valorCritico.chiInf.toFixed(3)}`)}
                        {resultados.valorCritico.chiSup && !resultados.valorCritico.chiInf && renderKatex(`\\chi^2_\\alpha = ${resultados.valorCritico.chiSup.toFixed(3)}`)}
                    </div>
                </div>

                <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-pure)', fontWeight: 'bold' }}>P-Valor</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 'bold', marginTop: '5px' }}>
                        {renderKatex(resultados.pValor.toFixed(4))}
                    </div>
                </div>
                

            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ padding: '10px 15px', background: isRechazo ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: `2px solid ${decisionColor}`, borderRadius: '12px', textAlign: 'center', minWidth: '250px' }}>
                    <div style={{ fontSize: '0.9em', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-pure)' }}>Decisión Estadística</div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: decisionColor, marginTop: '8px', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '5px' }}>
                        {isRechazo ? <span>Rechazar</span> : <span>No rechazar</span>} {renderKatex('H_0')}
                    </div>
                    <div style={{ fontSize: '0.7em', marginTop: '8px', color: 'var(--text-pure)' }}>
                        Región de Rechazo: {renderKatex(resultados.regionRechazo)}
                    </div>
                    <div style={{ fontSize: '0.7em', marginTop: '4px', color: 'var(--text-pure)' }}>
                        Justificación: Como {renderKatex(resultados.criterioRechazoMath)}, el estadístico {isRechazo ? 'cae en la región de rechazo.' : 'NO cae en la región de rechazo.'}
                    </div>
                </div>
            </div>
        </div>
    );
}
