import React from 'react';
import { FONT, RADIUS } from '../../../Principal/Constantes';
import katex from 'katex';
import Grafico_HNP from '../../../Graficas/Tema_6/Grafico_HNP';
import Grafico_HNP_Signos from '../../../Graficas/Tema_6/Grafico_HNP_Signos';
import Grafico_HP from '../../../Graficas/Tema_6/Grafico_HP';
import Grafico_HNP_Rachas from '../../../Graficas/Tema_6/Grafico_HNP_Rachas';

const renderKatex = (math) => <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />;

const CardResultado = ({ label, value }) => (
    <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-pure)', fontWeight: 'bold' }}>{label}</div>
        <div style={{ fontSize: '0.9rem', marginTop: '5px', color: 'var(--text-main)' }}>
            {typeof value === 'string' || typeof value === 'number' ? renderKatex(value.toString()) : value}
        </div>
    </div>
);

export default function Resultados_HNP_Manual({ resultados }) {
    if (!resultados) return null;

    const isRechazo = resultados.decision === 'Rechazar H₀';
    const decisionColor = isRechazo ? '#ef4444' : '#10b981';

    return (
        <div style={{ fontFamily: FONT, display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h4 style={{ margin: 0, color: 'var(--text-main)' }}>Resultados:</h4>
                <div style={{ padding: '5px 10px', background: 'var(--bg-input)', borderRadius: '5px', fontSize: '0.7rem', color: 'var(--text-pure)', fontWeight: 'bold' }}>
                    {resultados.tipo === 'chi_cuadrada' && resultados.subtipo === 'bondad' && 'Chi-cuadrada - Bondad de Ajuste'}
                    {resultados.tipo === 'chi_cuadrada' && resultados.subtipo === 'independencia' && 'Chi-cuadrada - Prueba de Independencia'}
                    {resultados.tipo === 'signos' && 'Prueba de Signos'}
                    {resultados.tipo === 'rachas' && 'Prueba de Rachas'}
                </div>
            </div>

            {resultados.tipo === 'signos' && (
                <div style={{ padding: '5px 15px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '5px', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '5px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-main)' }}>
                        <strong style={{ color: '#d97706' }}>Nota:</strong> Se utiliza la {resultados.nEfectivo <= 25 ? (
                            <>Distribución Binomial porque la muestra efectiva es pequeña ({renderKatex('n \\le 25')}).</>
                        ) : (
                            <>aproximación Normal (curva {renderKatex('Z')}) porque la muestra efectiva es grande ({renderKatex('n > 25')}).</>
                        )}
                    </div>
                </div>
            )}

            {/* TABLA ESTILO MINITAB */}
            <div style={{ marginBottom: '10px', border: '1px solid var(--text-pure)', borderRadius: '4px', fontFamily: FONT, fontSize: '0.8rem', color: 'var(--text-pure)', overflowX: 'auto', background: 'var(--bg-card)' }}>
                <style>{`
                    .minitab-table { width: 100%; text-align: center; border-collapse: collapse; table-layout: auto; }
                    .minitab-table th, .minitab-table td { padding: 4px 2px; border: 1px solid var(--text-pure); word-wrap: break-word; hyphens: auto; }
                    .minitab-table th:first-child, .minitab-table td:first-child { border-left: none; }
                    .minitab-table th:last-child, .minitab-table td:last-child { border-right: none; }
                    .minitab-table tr:first-child th { border-top: none; }
                    .minitab-table tr:last-child td { border-bottom: none; }
                    @media (max-width: 650px) { .minitab-table { font-size: 0.70rem; } .minitab-table th, .minitab-table td { padding: 4px 2px; } }
                `}</style>
                <table className="minitab-table">
                    {resultados.tipo === 'chi_cuadrada' && (
                        <>
                            <thead>
                                <tr style={{ background: 'var(--bg-input)' }}>
                                    <th colSpan={4} style={{ padding: '5px 0px', borderBottom: '1px solid var(--text-pure)', fontSize: '1rem' }}>
                                        {resultados.subtipo === 'bondad' ? 'Prueba de Bondad de Ajuste' : 'Prueba de Independencia'}
                                    </th>
                                </tr>
                                <tr style={{ background: 'var(--bg-input)' }}>
                                    <th>Grados de Libertad (DF)</th>
                                    <th>Estadístico ({renderKatex('\\chi_c^2')})</th>
                                    <th>Valor Crítico ({renderKatex('\\chi_\\alpha^2')})</th>
                                    <th>{renderKatex('p')}-Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{renderKatex(resultados.df.toString())}</td>
                                    <td>{renderKatex(resultados.estadistico.toFixed(4))}</td>
                                    <td>{renderKatex((resultados.valorCritico.chiSup || resultados.valorCritico).toFixed(4))}</td>
                                    <td>{renderKatex(resultados.pValor.toFixed(4))}</td>
                                </tr>
                            </tbody>
                        </>
                    )}
                    {resultados.tipo === 'signos' && (
                        <>
                            <thead>
                                <tr style={{ background: 'var(--bg-input)' }}>
                                    <th colSpan={5} style={{ padding: '5px 0px', borderBottom: '1px solid var(--text-pure)', fontSize: '1rem' }}>
                                        Prueba de Signos
                                    </th>
                                </tr>
                                <tr>
                                    <th colSpan={5} style={{ padding: '5px 10px', textAlign: 'left', borderBottom: '1px solid var(--text-pure)', fontWeight: 'normal' }}>
                                        Prueba de {renderKatex('M = M_0')} vs {renderKatex(`M ${resultados.calculos?.tipoPrueba === 'bilateral' || resultados.tipoPrueba === 'bilateral' ? '\\neq' : resultados.calculos?.tipoPrueba === 'derecha' || resultados.tipoPrueba === 'derecha' ? '>' : '<'} M_0`)}
                                    </th>
                                </tr>
                                <tr style={{ background: 'var(--bg-input)' }}>
                                    <th>{renderKatex('n')} Efectivo</th>
                                    <th>Signos ({renderKatex('+')})</th>
                                    <th>Signos ({renderKatex('-')})</th>
                                    <th>{resultados.isNormalApprox ? <>Estadístico ({renderKatex('Z')})</> : <>Estadístico ({renderKatex('S')})</>}</th>
                                    <th>{renderKatex('p')}-Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{renderKatex(resultados.nEfectivo.toString())}</td>
                                    <td>{renderKatex(resultados.positivos.toString())}</td>
                                    <td>{renderKatex(resultados.negativos.toString())}</td>
                                    <td>{renderKatex(resultados.isNormalApprox ? resultados.estadistico.toFixed(4) : (resultados.estadisticoOriginal || resultados.estadistico).toString())}</td>
                                    <td>{renderKatex(resultados.pValor.toFixed(4))}</td>
                                </tr>
                            </tbody>
                        </>
                    )}
                    {resultados.tipo === 'rachas' && (
                        <>
                            <thead>
                                <tr style={{ background: 'var(--bg-input)' }}>
                                    <th colSpan={6} style={{ padding: '5px 0px', borderBottom: '1px solid var(--text-pure)', fontSize: '1rem' }}>
                                        Prueba de Rachas (Aleatoriedad)
                                    </th>
                                </tr>
                                <tr>
                                    <th colSpan={6} style={{ padding: '5px 10px', textAlign: 'left', borderBottom: '1px solid var(--text-pure)', fontWeight: 'normal' }}>
                                        Hipótesis / Prueba: {resultados.calculos?.tipoPrueba === 'bilateral' || resultados.tipoPrueba === 'bilateral' ? 'Bilateral' : resultados.calculos?.tipoPrueba === 'derecha' || resultados.tipoPrueba === 'derecha' ? 'Unilateral Derecha' : 'Unilateral Izquierda'}
                                    </th>
                                </tr>
                                <tr style={{ background: 'var(--bg-input)' }}>
                                    <th>Rachas Observadas ({renderKatex('R')})</th>
                                    <th>Media Esperada ({renderKatex('\\mu_R')})</th>
                                    <th>Desviación Estándar ({renderKatex('\\sigma_R')})</th>
                                    <th>Estadístico ({renderKatex('Z')})</th>
                                    <th>Valor Crítico ({renderKatex('Z_{crit}')})</th>
                                    <th>{renderKatex('p')}-Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{renderKatex(resultados.rachas.toString())}</td>
                                    <td>{renderKatex(resultados.muR.toFixed(4))}</td>
                                    <td>{renderKatex(resultados.sigmaR.toFixed(4))}</td>
                                    <td>{renderKatex(resultados.estadistico.toFixed(4))}</td>
                                    <td>{renderKatex((resultados.calculos?.tipoPrueba === 'bilateral' || resultados.tipoPrueba === 'bilateral') ? `\\pm ${Math.abs(Number(resultados.valorCritico)).toFixed(4)}` : Number(resultados.valorCritico).toFixed(4))}</td>
                                    <td>{renderKatex(resultados.pValor.toFixed(4))}</td>
                                </tr>
                            </tbody>
                        </>
                    )}
                </table>
            </div>

            {resultados.tipo === 'chi_cuadrada' && resultados.calculos && (
                <div style={{ width: '100%', marginTop: '0px', marginBottom: '5px' }}>
                    <Grafico_HNP resultados={resultados} prueba="varianza" id="widget-grafica-hnp-manual" />
                </div>
            )}

            {resultados.tipo === 'signos' && resultados.calculos && (
                <div style={{ width: '100%', marginTop: '15px', marginBottom: '15px' }}>
                    {resultados.isNormalApprox ? (
                        <Grafico_HP resultados={resultados} prueba="media_z" id="grafico-hnp-signos-z" />
                    ) : (
                        <Grafico_HNP_Signos resultados={resultados} />
                    )}
                </div>
            )}

            {resultados.tipo === 'rachas' && resultados.calculos && (
                <div style={{ width: '100%', marginTop: '15px', marginBottom: '15px' }}>
                    <Grafico_HNP_Rachas resultados={resultados} id="grafico-hnp-rachas-z" />
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ padding: '10px 15px', background: isRechazo ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: `2px solid ${decisionColor}`, borderRadius: '12px', textAlign: 'center', minWidth: '250px' }}>
                    <div style={{ fontSize: '0.9em', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-pure)' }}>Decisión Estadística</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: decisionColor, marginTop: '8px', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '5px' }}>
                        {isRechazo ? <span>Rechazar</span> : <span>No rechazar</span>} {renderKatex('H_0')}
                    </div>
                    {resultados.regionRechazo && (
                        <div style={{ fontSize: '0.7em', marginTop: '8px', color: 'var(--text-pure)' }}>
                            Región de Rechazo: {renderKatex(resultados.regionRechazo.replace(/p-Valor/gi, 'p\\text{-Valor}'))}
                        </div>
                    )}
                    {resultados.criterioRechazoMath && (
                        <div style={{ fontSize: '0.7em', marginTop: '4px', color: 'var(--text-pure)' }}>
                            Justificación: Como {renderKatex(resultados.criterioRechazoMath.replace(/p-Valor/gi, 'p\\text{-Valor}'))}, el estadístico {isRechazo ? 'cae en la región de rechazo.' : 'NO cae en la región de rechazo.'}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
