import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import StatLabel from '../../../ui/StatLabel';

export default function Resultados_EstimacionManual({ resultados, parametro }) {
    if (!resultados) return null;

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    return (
        <div className="tema5-resultados-pure" style={{ width: '100%' }}>
            {!['proporcion', 'varianza'].includes(parametro) && (
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-main, #1e293b)' }}>Resultados (Estimación Puntual)</h4>
            )}
            {parametro === 'media' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ padding: '8px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '0.75em', color: 'var(--text-muted)', fontWeight: 'bold' }}>Tamaño de Muestra</div>
                            <div style={{ fontSize: '0.95em', fontWeight: 'bold', marginTop: '3px' }}>{renderKatex(`n = ${resultados.n}`)}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ padding: '8px 15px', background: 'rgba(37, 99, 235, 0.1)', border: '1px solid var(--primary-color)', borderRadius: '8px', textAlign: 'center', minWidth: '200px', display: 'inline-block' }}>
                            <div style={{ fontSize: '0.75em', color: 'var(--primary-color)', fontWeight: 'bold' }}>Estimación Puntual de {renderKatex('\\mu')}</div>
                            <div style={{ fontSize: '1.05em', fontWeight: 'bold', color: 'var(--primary-color)', marginTop: '5px' }}>
                                {renderKatex(`${resultados.simbolo} = ${resultados.estimacion.toFixed(4)}`)}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {parametro === 'proporcion' && (
                <div className="tema5-tabla-estimacion-wrapper" style={{ margin: '7px 0' }}>
                    <table className="tema5-tabla-estimacion">
                        <thead>
                            <tr>
                                <th><StatLabel formulaKey="n_muestra" formulaLatex="n" align="center" position="top" /></th>
                                <th><StatLabel formulaKey="x" formulaLatex="x" align="center" position="top" /></th>
                                <th><StatLabel formulaKey="p_sombrero" formulaLatex={'\\hat{p}'} align="center" position="top" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{renderKatex(`${resultados.n}`)}</td>
                                <td>{renderKatex(`${resultados.calculos?.x ?? ''}`)}</td>
                                <td>{renderKatex(`${resultados.estimacion.toFixed(2)}\\;(${(resultados.estimacion * 100).toFixed(2)}\\%)`)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {parametro === 'varianza' && (
                <div className="tema5-tabla-estimacion-wrapper" style={{ margin: '7px 0' }}>
                    <table className="tema5-tabla-estimacion">
                        <thead>
                            <tr>
                                <th><StatLabel formulaKey="n_muestra" formulaLatex="n" align="center" position="top" /></th>
                                <th><StatLabel formulaKey="desviacion_muestral" formulaLatex="S" align="center" position="top" /></th>
                                <th><StatLabel formulaKey="s2" formulaLatex={'\\hat{\\sigma}^2'} customTexto="Estimación puntual de la varianza poblacional" customMath={'\\hat{\\sigma}^2 = S^2'} align="center" position="top" /></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{renderKatex(`${resultados.n}`)}</td>
                                <td>{renderKatex(`${resultados.calculos?.desviacion?.toFixed(2) ?? ''}`)}</td>
                                <td>{renderKatex(`${resultados.estimacion.toFixed(2)}`)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
