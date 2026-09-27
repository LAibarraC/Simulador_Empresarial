import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cardStyle } from '../../../Principal/Constantes';

export default function Resultados_EstimacionManual({ resultados, parametro }) {
    if (!resultados) return null;

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    return (
        <div style={{ width: '100%' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-main, #1e293b)' }}>Resultados (Estimación Puntual)</h4>
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
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ padding: '8px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '0.75em', color: 'var(--text-muted)', fontWeight: 'bold' }}>Tamaño de Muestra</div>
                            <div style={{ fontSize: '0.95em', fontWeight: 'bold', marginTop: '3px' }}>{renderKatex(`n = ${resultados.n}`)}</div>
                        </div>
                        <div style={{ padding: '8px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '0.75em', color: 'var(--text-muted)', fontWeight: 'bold' }}>Casos Favorables</div>
                            <div style={{ fontSize: '0.95em', fontWeight: 'bold', marginTop: '3px' }}>{renderKatex(`x = ${resultados.calculos?.x ?? ''}`)}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ padding: '8px 15px', background: 'rgba(37, 99, 235, 0.1)', border: '1px solid var(--primary-color)', borderRadius: '8px', textAlign: 'center', minWidth: '200px', display: 'inline-block' }}>
                            <div style={{ fontSize: '0.75em', color: 'var(--text-muted)', fontWeight: 'bold' }}>Estimación Puntual de {renderKatex('p')}</div>
                            <div style={{ fontSize: '1.05em', fontWeight: 'bold', color: 'var(--text-muted)', marginTop: '3px' }}>
                                {renderKatex(`${resultados.simbolo} = ${resultados.estimacion.toFixed(4)}`)}
                            </div>
                            <div style={{ fontSize: '0.7em', color: 'var(--text-muted)', marginTop: '2px' }}>
                                {(resultados.estimacion * 100).toFixed(2)}%
                            </div>
                        </div>
                    </div>
                </>
            )}

            {parametro === 'varianza' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ padding: '8px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '0.75em', color: 'var(--text-muted)', fontWeight: 'bold' }}>Tamaño de Muestra</div>
                            <div style={{ fontSize: '0.95em', fontWeight: 'bold', marginTop: '3px' }}>{renderKatex(`n = ${resultados.n}`)}</div>
                        </div>
                        <div style={{ padding: '8px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '0.75em', color: 'var(--text-muted)', fontWeight: 'bold' }}>Desviación Estándar <span style={{ whiteSpace: 'nowrap' }}>({renderKatex('S')})</span></div>
                            <div style={{ fontSize: '0.95em', fontWeight: 'bold', marginTop: '3px' }}>{renderKatex(`S = ${resultados.calculos?.desviacion?.toFixed(4) ?? ''}`)}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ padding: '8px 15px', background: 'rgba(37, 99, 235, 0.1)', border: '1px solid var(--primary-color)', borderRadius: '8px', textAlign: 'center', minWidth: '200px', display: 'inline-block' }}>
                            <div style={{ fontSize: '0.75em', color: 'var(--primary-color)', fontWeight: 'bold' }}>Estimación Puntual de {renderKatex('\\sigma^2')}</div>
                            <div style={{ fontSize: '1.05em', fontWeight: 'bold', color: 'var(--primary-color)', marginTop: '3px' }}>
                                {renderKatex(`${resultados.simbolo} = ${resultados.estimacion.toFixed(4)}`)}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
