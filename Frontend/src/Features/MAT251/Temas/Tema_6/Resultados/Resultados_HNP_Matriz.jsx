import React from 'react';
import { FONT, RADIUS } from '../../../Principal/Constantes';
import katex from 'katex';
import Grafico_HNP from '../../../Graficas/Tema_6/Grafico_HNP';
import Grafico_HP from '../../../Graficas/Tema_6/Grafico_HP';
import Grafico_HNP_Signos from '../../../Graficas/Tema_6/Grafico_HNP_Signos';
import Grafico_HNP_Rachas from '../../../Graficas/Tema_6/Grafico_HNP_Rachas';
import StatLabel from '../../../ui/StatLabel';

const renderKatex = (math) => <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />;

const CardResultado = ({ label, value }) => (
    <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-pure)', fontWeight: 'bold' }}>{label}</div>
        <div style={{ fontSize: '0.9rem', marginTop: '5px', color: 'var(--text-main)' }}>
            {typeof value === 'string' || typeof value === 'number' ? renderKatex(value.toString()) : value}
        </div>
    </div>
);

export default function Resultados_HNP_Matriz({ resultados }) {
    if (!resultados) return null;

    const decisionColor = resultados.decision === 'Rechazar H₀' ? '#ef4444' : '#10b981';
    const alphaChi = Number(resultados.calculos?.alpha);
    const dfChi = Number(resultados.df);
    const valorCriticoChi = Number(resultados.valorCritico?.chiSup ?? resultados.valorCritico);
    const estadisticoChi = Number(resultados.estadistico);
    const pValorChi = Number(resultados.pValor);
    const formulaValorCritico = Number.isFinite(alphaChi) && Number.isFinite(dfChi) && Number.isFinite(valorCriticoChi)
        ? `\\chi^2_{\\alpha,\\,gl} = F^{-1}_{\\chi^2_{gl}}(1-\\alpha) = F^{-1}_{\\chi^2_{${dfChi}}}(${(1 - alphaChi).toFixed(2)}) = ${valorCriticoChi.toFixed(4)}`
        : '\\chi^2_{\\alpha,\\,gl} = F^{-1}_{\\chi^2_{gl}}(1-\\alpha)';
    const formulaPValorChi = Number.isFinite(dfChi) && Number.isFinite(estadisticoChi) && Number.isFinite(pValorChi)
        ? `p = 1 - F_{\\chi^2_{gl}}(\\chi_c^2) = 1 - F_{\\chi^2_{${dfChi}}}(${estadisticoChi.toFixed(4)}) = ${pValorChi.toFixed(4)}`
        : 'p = 1 - F_{\\chi^2_{gl}}(\\chi_c^2)';
    const nSignos = resultados.nEfectivo;
    const positivosSignos = resultados.positivos;
    const pValorSignos = Number(resultados.pValor);
    const tipoPruebaSignos = resultados.calculos?.tipoPrueba || resultados.tipoPrueba;
    const ajusteContinuidadSignos = Number(positivosSignos) < Number(nSignos) / 2
        ? '+ 0.5'
        : Number(positivosSignos) > Number(nSignos) / 2
            ? '- 0.5'
            : '';
    const formulaPValorSignos = resultados.isNormalApprox
        ? tipoPruebaSignos === 'bilateral'
            ? `p = 2[1-\\Phi(|${Number(resultados.estadistico).toFixed(4)}|)] = ${pValorSignos.toFixed(4)}`
            : tipoPruebaSignos === 'derecha'
                ? `p = 1-\\Phi(${Number(resultados.estadistico).toFixed(4)}) = ${pValorSignos.toFixed(4)}`
                : `p = \\Phi(${Number(resultados.estadistico).toFixed(4)}) = ${pValorSignos.toFixed(4)}`
        : tipoPruebaSignos === 'bilateral'
            ? positivosSignos >= nSignos - positivosSignos
                ? `p = 2P(X \\ge ${positivosSignos}) = ${pValorSignos.toFixed(4)},\\; X \\sim \\operatorname{Bin}(${nSignos},0.5)`
                : `p = 2P(X \\le ${positivosSignos}) = ${pValorSignos.toFixed(4)},\\; X \\sim \\operatorname{Bin}(${nSignos},0.5)`
            : tipoPruebaSignos === 'derecha'
                ? `p = P(X \\ge ${positivosSignos}) = ${pValorSignos.toFixed(4)},\\; X \\sim \\operatorname{Bin}(${nSignos},0.5)`
                : `p = P(X \\le ${positivosSignos}) = ${pValorSignos.toFixed(4)},\\; X \\sim \\operatorname{Bin}(${nSignos},0.5)`;
    const tipoPruebaRachas = resultados.calculos?.tipoPrueba || resultados.tipoPrueba || 'bilateral';
    const rObservadas = Number(resultados.rachas);
    const muRachas = Number(resultados.muR);
    const correccionContinuidad = rObservadas > muRachas ? '- 0.5' : rObservadas < muRachas ? '+ 0.5' : '';
    const formulaMediaRachas = '\\mu_R = \\frac{2n_1n_2}{n_1+n_2} + 1';
    const formulaDesviacionRachas = '\\sigma_R = \\sqrt{\\frac{2n_1n_2(2n_1n_2-n)}{n^2(n-1)}}';
    const formulaEstadisticoRachas = `Z = \\frac{R ${correccionContinuidad} - \\mu_R}{\\sigma_R}`;
    const formulaCriticoRachas = tipoPruebaRachas === 'bilateral'
        ? 'Z_{crit} = \\pm z_{\\alpha/2}'
        : tipoPruebaRachas === 'derecha'
            ? 'Z_{crit} = z_{1-\\alpha}'
            : 'Z_{crit} = z_{\\alpha}';
    const formulaPValorRachas = tipoPruebaRachas === 'bilateral'
        ? 'p = 2[1-\\Phi(|Z|)]'
        : tipoPruebaRachas === 'derecha'
            ? 'p = 1-\\Phi(Z)'
            : 'p = \\Phi(Z)';

    return (
        <div style={{ fontFamily: FONT, display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {resultados.tipo === 'signos' && (
                <div style={{ padding: '5px 10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '5px', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '5px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-pure)' }}>
                        <strong style={{ color: '#d97706' }}>Nota:</strong> Se utiliza la {resultados.nEfectivo <= 25 ? (
                            <>Distribución Binomial porque la muestra efectiva es pequeña ({renderKatex('n \\le 25')}).</>
                        ) : (
                            <>aproximación Normal (curva {renderKatex('Z')}) porque la muestra efectiva es grande ({renderKatex('n > 25')}).</>
                        )}
                    </div>
                </div>
            )}

            {resultados.tipo === 'rachas' && (
                <div id="tour-t6-hnp-rachas-resumen" className="rachas-ext-table-scroll" style={{ marginBottom: '15px', border: '1px solid var(--text-pure)', borderRadius: '0px', fontFamily: FONT, fontSize: '0.85rem', color: 'var(--text-pure)', overflowX: 'auto', background: 'var(--bg-card)' }}>
                    <style>{`
                        .rachas-ext-table { width: 100%; border-collapse: collapse; text-align: center; }
                        .rachas-ext-table th, .rachas-ext-table td { border: 1px solid var(--text-pure); }
                        .rachas-ext-table tr:first-child th { border-top: none; border-left: none; border-right: none; }
                        .rachas-ext-table th:first-child, .rachas-ext-table td:first-child { border-left: none; }
                        .rachas-ext-table th:last-child, .rachas-ext-table td:last-child { border-right: none; }
                        .rachas-ext-table tr:last-child td { border-bottom: none; }
                    `}</style>
                    <table className="rachas-ext-table" style={{ borderRadius: '0px' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-input)' }}>
                                <th colSpan={6} style={{ padding: '8px 12px', fontSize: '0.95rem', textAlign: 'center' }}>
                                    Resumen de Extracción
                                </th>
                            </tr>
                            <tr style={{ background: 'var(--bg-input)' }}>
                                <th style={{ padding: '8px', whiteSpace: 'nowrap' }}>Corte Utilizado</th>
                                <th style={{ padding: '8px', whiteSpace: 'nowrap' }}>Muestra Inicial</th>
                                <th style={{ padding: '8px', whiteSpace: 'nowrap' }}><StatLabel formulaKey="rachas_n_efectivo" formulaLatex="n" align="center" position="top" /> Efectivo</th>
                                <th style={{ padding: '8px', whiteSpace: 'nowrap' }}><StatLabel formulaKey="rachas_n1" formulaLatex="n_1" align="center" position="top" /></th>
                                <th style={{ padding: '8px', whiteSpace: 'nowrap' }}><StatLabel formulaKey="rachas_n2" formulaLatex="n_2" align="center" position="top" /></th>
                                <th style={{ padding: '8px', whiteSpace: 'nowrap' }}><StatLabel formulaKey="rachas_R" formulaLatex="R" align="center" position="top" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ padding: '10px', color: 'var(--text-pure)' }}>
                                    {(() => {
                                        const corteNumerico = resultados.valorCorteFinal?.match(/^(Mediana|Media|Corte personalizado) = (.+)$/);
                                        return corteNumerico
                                            ? <>{corteNumerico[1]} = {renderKatex(corteNumerico[2])}</>
                                            : resultados.valorCorteFinal;
                                    })()}
                                </td>
                                <td style={{ padding: '10px', color: 'var(--text-pure)' }}>{renderKatex(resultados.nOriginal.toString())} {resultados.nIgnorados > 0 && <span style={{ color: 'var(--text-pure)', marginLeft: '6px' }}>(-{resultados.nIgnorados} empates)</span>}</td>
                                <td style={{ padding: '10px' }}>{renderKatex(resultados.nEfectivo.toString())}</td>
                                <td style={{ padding: '10px', color: 'var(--text-pure)' }}>{renderKatex(resultados.n1.toString())}</td>
                                <td style={{ padding: '10px', color: 'var(--text-pure)' }}>{renderKatex(resultados.n2.toString())}</td>
                                <td style={{ padding: '10px', color: 'var(--text-pure)' }}>{renderKatex(resultados.rachas.toString())}</td>
                            </tr>
                            <tr style={{ background: 'var(--bg-input)' }}>
                                <td colSpan={6} style={{ padding: '8px 12px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                    Secuencia Detectada:
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={6} style={{ padding: '15px 10px', textAlign: 'center', fontFamily: 'monospace', wordBreak: 'break-all', fontSize: '0.9rem', color: 'var(--text-pure)', lineHeight: '1.6', fontWeight: 'bold', letterSpacing: '2px', borderLeft: 'none', borderRight: 'none' }}>
                                    {resultados.secuenciaDicotomica}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* TABLA ESTILO MINITAB */}
            <div id="tour-t6-hnp-tabla-minitab" className="minitab-table-scroll" style={{ marginBottom: '10px', border: '1px solid var(--text-pure)', borderRadius: '0px', fontFamily: FONT, fontSize: '0.8rem', color: 'var(--text-pure)', overflowX: 'auto', background: 'var(--bg-card)' }}>
                <style>{`
                    .minitab-table { width: 100%; text-align: center; border-collapse: collapse; table-layout: auto; }
                    .minitab-table.rachas-table { table-layout: fixed; }
                    .minitab-table th, .minitab-table td { padding: 4px 2px; border: 1px solid var(--text-pure); word-wrap: break-word; hyphens: auto; }
                    .minitab-table th:first-child, .minitab-table td:first-child { border-left: none; }
                    .minitab-table th:last-child, .minitab-table td:last-child { border-right: none; }
                    .minitab-table tr:first-child th { border-top: none; }
                    .minitab-table tr:last-child td { border-bottom: none; }
                    .minitab-table.signos-table thead tr:last-child th:nth-child(6),
                    .minitab-table.signos-table thead tr:last-child th:nth-child(7),
                    .minitab-table.signos-table tbody td:nth-child(6),
                    .minitab-table.signos-table tbody td:nth-child(7) { width: 14%; }
                    @media (max-width: 650px) { .minitab-table { font-size: 0.70rem; } .minitab-table th, .minitab-table td { padding: 4px 2px; } }
                `}</style>
                <table className={`minitab-table${resultados.tipo === 'signos' ? ' signos-table' : ''}${resultados.tipo === 'rachas' ? ' rachas-table' : ''}`}>
                    {resultados.tipo === 'rachas' && (
                        <colgroup>
                            {Array.from({ length: 6 }, (_, index) => <col key={index} style={{ width: '16.6667%' }} />)}
                        </colgroup>
                    )}
                    {resultados.tipo === 'chi_cuadrada' && (
                        <>
                            <colgroup>
                                <col style={{ width: '25%' }} />
                                <col style={{ width: '25%' }} />
                                <col style={{ width: '25%' }} />
                                <col style={{ width: '25%' }} />
                            </colgroup>
                            <thead>
                                <tr style={{ background: 'var(--bg-input)' }}>
                                    <th colSpan={4} style={{ padding: '5px 0px', borderBottom: '1px solid var(--text-pure)', fontSize: '1rem' }}>
                                        {resultados.subtipo === 'bondad' ? 'Prueba de Bondad de Ajuste' : 'Prueba de Independencia'}
                                    </th>
                                </tr>
                                <tr style={{ background: 'var(--bg-input)' }}>
                                    <th><StatLabel formulaKey="grados_libertad" formulaLatex="gl" align="center" position="top" customTexto="Cantidad de valores independientes que pueden variar en la prueba chi-cuadrada." customMath={resultados.subtipo === 'bondad' ? 'gl = k - 1' : 'gl = (r - 1)(c - 1)'} /></th>
                                    <th>
                                        <StatLabel
                                            formulaKey="estadistico_prueba"
                                            formulaLatex={'\\chi_c^2'}
                                            align="center"
                                            position="top"
                                            customTexto="Estadístico de prueba que compara las frecuencias observadas y esperadas."
                                            customMath={resultados.subtipo === 'bondad'
                                                ? '\\displaystyle \\chi_c^2 = \\sum_{i=1}^{k} \\frac{(O_i - E_i)^2}{E_i}'
                                                : '\\displaystyle \\chi_c^2 = \\sum_{i=1}^{r} \\sum_{j=1}^{c} \\frac{(O_{ij} - E_{ij})^2}{E_{ij}}'}
                                        />
                                    </th>
                                    <th><StatLabel formulaKey="estadistico_prueba" formulaLatex={'\\chi_{\\alpha}^2'} align="center" position="top" customTexto="Cuantil de cola derecha según el nivel de significación y los grados de libertad." customMath={formulaValorCritico} /></th>
                                    <th><StatLabel formulaKey="p_valor" formulaLatex="p" align="center" position="top" customTexto="Probabilidad de cola derecha a partir del estadístico observado." customMath={formulaPValorChi} /></th>
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
                                    <th colSpan={7} style={{ padding: '5px 0px', borderBottom: '1px solid var(--text-pure)', fontSize: '1rem' }}>
                                        Prueba de Signos
                                    </th>
                                </tr>
                                <tr>
                                    <th colSpan={7} style={{ padding: '5px 10px', textAlign: 'left', borderBottom: '1px solid var(--text-pure)', fontWeight: 'normal' }}>
                                        Prueba de {renderKatex('M = M_0')} vs {renderKatex(`M ${resultados.calculos?.tipoPrueba === 'bilateral' || resultados.tipoPrueba === 'bilateral' ? '\\neq' : resultados.calculos?.tipoPrueba === 'derecha' || resultados.tipoPrueba === 'derecha' ? '>' : '<'} M_0`)}
                                    </th>
                                </tr>
                                <tr style={{ background: 'var(--bg-input)' }}>
                                    <th>Total {renderKatex('n')}</th>
                                    <th>Empates</th>
                                    <th>{renderKatex('n')} Efectivo</th>
                                    <th>Signos ({renderKatex('+')})</th>
                                    <th>Signos ({renderKatex('-')})</th>
                                    <th>
                                        <StatLabel
                                            formulaKey="estadistico_prueba"
                                            formulaLatex={resultados.isNormalApprox ? 'Z' : 'S'}
                                            align="center"
                                            position="top"
                                            customTexto={resultados.isNormalApprox
                                                ? 'S es la cantidad de signos positivos. El 0.5 es un ajuste del cálculo, no es α.'
                                                : 'Número de signos positivos observados entre los datos efectivos.'}
                                            customMath={resultados.isNormalApprox
                                                ? `Z_c = \\frac{S ${ajusteContinuidadSignos} - \\frac{n}{2}}{\\sqrt{\\frac{n}{4}}}`
                                                : 'S = n_+'}
                                        />
                                    </th>
                                    <th>
                                        <StatLabel
                                            formulaKey="p_valor"
                                            formulaLatex="p"
                                            align="center"
                                            position="top"
                                            customTexto="Probabilidad del resultado observado suponiendo verdadera la hipótesis nula."
                                            customMath={formulaPValorSignos}
                                        />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{renderKatex((resultados.nEfectivo + (resultados.empates || 0)).toString())}</td>
                                    <td>{renderKatex((resultados.empates || 0).toString())}</td>
                                    <td>{renderKatex(resultados.nEfectivo.toString())}</td>
                                    <td>{renderKatex(resultados.positivos.toString())}</td>
                                    <td>{renderKatex(resultados.negativos.toString())}</td>
                                    <td>{renderKatex(resultados.isNormalApprox ? (resultados.estadistico?.toFixed(4) || resultados.estadistico).toString() : (resultados.estadisticoOriginal || resultados.estadistico).toString())}</td>
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
                                    <th><StatLabel formulaKey="rachas_R" formulaLatex="R" align="center" position="top" customTexto="Rachas observadas, donde c es el número de cambios de signo" customMath="R = 1 + c" /></th>
                                    <th><StatLabel formulaKey="rachas_media_esperada" formulaLatex={'\\mu_R'} align="center" position="top" customTexto="Media Esperada" customMath={formulaMediaRachas} /></th>
                                    <th><StatLabel formulaKey="rachas_desviacion" formulaLatex={'\\sigma_R'} align="center" position="top" customTexto="Desviación Estándar" customMath={formulaDesviacionRachas} /></th>
                                    <th><StatLabel formulaKey="rachas_Z" formulaLatex="Z" align="center" position="top" customTexto="Estadístico" customMath={formulaEstadisticoRachas} /></th>
                                    <th><StatLabel formulaKey="rachas_Zcrit" formulaLatex="Z_{crit}" align="center" position="top" customTexto="Valor Crítico" customMath={formulaCriticoRachas} /></th>
                                    <th><StatLabel formulaKey="p_valor" formulaLatex="p" align="center" position="top" customTexto="p-Valor" customMath={formulaPValorRachas} /></th>
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

            <div id="tour-t6-hnp-grafico">
                {resultados.tipo === 'chi_cuadrada' && (
                    <div style={{ marginTop: '5px' }}>
                        <Grafico_HNP resultados={resultados} prueba="varianza" />
                    </div>
                )}

                {resultados.tipo === 'signos' && resultados.calculos && (
                    <div style={{ width: '100%', marginTop: '15px', marginBottom: '15px' }}>
                        {resultados.isNormalApprox ? (
                            <Grafico_HP resultados={resultados} prueba="media_z" id="grafico-hnp-signos-z-matriz" />
                        ) : (
                            <Grafico_HNP_Signos resultados={resultados} id="grafico-hnp-signos-matriz" />
                        )}
                    </div>
                )}

                {resultados.tipo === 'rachas' && resultados.calculos && (
                    <div style={{ width: '100%', marginTop: '15px', marginBottom: '15px' }}>
                        <Grafico_HNP_Rachas resultados={resultados} id="grafico-hnp-rachas-z-matriz" />
                    </div>
                )}
            </div>

            <div id="tour-t6-hnp-decision" style={{ width: '100%', overflowX: 'auto', marginTop: '10px' }}>
                <table className="decision-estadistica-table" style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--text-pure)', borderRadius: '0px', background: 'var(--bg-card)', color: 'var(--text-pure)', textAlign: 'center', fontSize: '0.8rem' }}>
                    <tbody>
                        <tr>
                            <th style={{ padding: '8px', borderBottom: '1px solid var(--text-pure)', fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '1px' }} colSpan={2}>
                                Decisión Estadística
                            </th>
                        </tr>
                        <tr>
                            <td style={{ padding: '8px', borderBottom: '1px solid var(--text-pure)', fontWeight: 'bold', color: decisionColor }} colSpan={2}>
                                {resultados.decision === 'Rechazar H₀' ? 'Rechazar' : 'Aceptar'} {renderKatex('H_0')}
                            </td>
                        </tr>
                        <tr>
                            <th style={{ width: '25%', padding: '8px', borderRight: '1px solid var(--text-pure)' }}>Región de rechazo</th>
                            <td style={{ padding: '8px' }}>
                                {resultados.regionRechazo ? renderKatex(
                                    (resultados.tipo === 'signos' && resultados.calculos?.alpha != null
                                        ? resultados.regionRechazo.replace(/\\alpha\b/g, `\\alpha = ${Number(resultados.calculos.alpha).toFixed(2)}`)
                                        : resultados.regionRechazo
                                    ).replace(/p-Valor/gi, 'p\\text{-Valor}')
                                ) : '—'}
                            </td>
                        </tr>
                        <tr>
                            <th style={{ width: '25%', padding: '8px', borderTop: '1px solid var(--text-pure)', borderRight: '1px solid var(--text-pure)' }}>Justificación</th>
                            <td style={{ padding: '8px', borderTop: '1px solid var(--text-pure)' }}>
                                {resultados.criterioRechazoMath
                                    ? <>Como {renderKatex(resultados.criterioRechazoMath.replace(/p-Valor/gi, 'p\\text{-Valor}'))}, el estadístico {resultados.decision === 'Rechazar H₀' ? 'cae en la región de rechazo.' : 'no cae en la región de rechazo.'}</>
                                    : 'No hay un criterio de rechazo disponible.'}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
