import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cardStyle } from '../../../Principal/Constantes';

export default function Resultados_EstimacionMatriz({ resultados, parametro }) {
    if (!resultados) return null;

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    return (
        <div style={{ width: '100%' }}>
            <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-main, #1e293b)' }}>Resultados:</h4>
            
            
            {parametro === 'media' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ padding: '8px', background: 'var(--bg-input)', borderRadius: '5px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Tamaño de Muestra</div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '5px' }}>{renderKatex(`n = ${resultados.n}`)}</div>
                        </div>
                        <div style={{ padding: '8px', background: 'var(--bg-input)', borderRadius: '5px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Suma de Valores</div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '5px' }}>{renderKatex(`\\sum X_i = ${resultados.calculos.suma.toFixed(2)}`)}</div>
                        </div>
                        <div style={{ padding: '8px', background: 'var(--bg-input)', borderRadius: '5px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Desviación Estándar <span style={{ whiteSpace: 'nowrap' }}>({renderKatex('S')})</span></div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '5px' }}>{renderKatex(`S = ${resultados.calculos.desviacion.toFixed(4)}`)}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ padding: '8px 15px', background: 'rgba(37, 99, 235, 0.1)', border: '1px solid var(--primary-color)', borderRadius: '8px', textAlign: 'center', minWidth: '200px', display: 'inline-block' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Estimación Puntual de {renderKatex('\\mu')}</div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '5px' }}>
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
                            <div style={{ fontSize: '0.7em', color: 'var(--text-muted)', fontWeight: 'bold' }}>Tamaño de Muestra</div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '3px' }}>{renderKatex(`n = ${resultados.n}`)}</div>
                        </div>
                        <div style={{ padding: '8px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '0.7em', color: 'var(--text-muted)', fontWeight: 'bold' }}>Casos Favorables</div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '3px' }}>{renderKatex(`x = ${resultados.calculos?.x ?? ''}`)}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ padding: '8px 15px', background: 'rgba(37, 99, 235, 0.1)', border: '1px solid var(--primary-color)', borderRadius: '8px', textAlign: 'center', minWidth: '200px', display: 'inline-block' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Estimación Puntual de {renderKatex('p')}</div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-muted)', marginTop: '3px' }}>
                                {renderKatex(`${resultados.simbolo} = ${resultados.estimacion.toFixed(4)}`)}
                            </div>
                            <div style={{ fontSize: '0.7em', color: 'var(--text-muted)', marginTop: '2px' }}>
                                ({(resultados.estimacion * 100).toFixed(2)}%)
                            </div>
                        </div>
                    </div>
                </>
            )}

            {parametro === 'varianza' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ padding: '8px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '0.7em', color: 'var(--text-muted)', fontWeight: 'bold' }}>Tamaño de Muestra</div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '3px' }}>{renderKatex(`n = ${resultados.n}`)}</div>
                        </div>
                        <div style={{ padding: '8px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '0.7em', color: 'var(--text-muted)', fontWeight: 'bold' }}>Media Muestral</div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', marginTop: '3px' }}>{renderKatex(`\\bar{X} = ${resultados.calculos?.media?.toFixed(4) ?? ''}`)}</div>
                        </div>
                        <div style={{ padding: '8px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Desviación Estándar <span style={{ whiteSpace: 'nowrap' }}>({renderKatex('S')})</span></div>                            <div style={{ fontSize: '0.95em', fontWeight: 'bold', marginTop: '3px' }}>{renderKatex(`S = ${resultados.calculos?.desviacion?.toFixed(4) ?? ''}`)}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ padding: '8px 15px', background: 'rgba(37, 99, 235, 0.1)', border: '1px solid var(--primary-color)', borderRadius: '8px', textAlign: 'center', minWidth: '200px', display: 'inline-block' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Estimación Puntual de {renderKatex('\\sigma^2')}</div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-muted)', marginTop: '3px' }}>
                                {renderKatex(`${resultados.simbolo} = ${resultados.estimacion.toFixed(4)}`)}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
