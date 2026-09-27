import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import Grafica_IntervalosMatriz from '../../../Graficas/Tema_5/Grafica_IntervalosMatriz';
import Grafica_IntervalosProporcion from '../../../Graficas/Tema_5/Grafica_IntervalosProporcion';
import Grafica_IntervalosVarianza from '../../../Graficas/Tema_5/Grafica_IntervalosVarianza';
import '../../../styles/Temas/Tema3.css';

export default function Resultados_IntervalosMatriz({ resultados, parametro }) {
    if (!resultados) return null;

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const getSymboloParam = () => {
        if (parametro === 'media') return '\\mu';
        if (parametro === 'proporcion') return 'p';
        if (parametro === 'varianza') return '\\sigma^2';
        return '';
    };

    const getSymboloPuntual = () => {
        if (parametro === 'media') return '\\bar{X}';
        if (parametro === 'proporcion') return '\\hat{p}';
        if (parametro === 'varianza') return 'S^2';
        return '';
    };

    const getFormulaIC = () => {
        if (parametro === 'media') {
            if (resultados.metodo.includes('Z')) {
                return `\\bar{X} \\pm Z \\frac{\\sigma}{\\sqrt{n}}`;
            } else {
                return `\\bar{X} \\pm t \\frac{\\sigma}{\\sqrt{n}}`;
            }
        } else if (parametro === 'proporcion') {
            return `\\hat{p} \\pm Z \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}`;
        }
        return '';
    };

    const getFormulaE = () => {
        if (parametro === 'media') {
            if (resultados.metodo.includes('Z')) {
                return `E = Z \\frac{\\sigma}{\\sqrt{n}}`;
            } else {
                return `E = t \\frac{\\sigma}{\\sqrt{n}}`;
            }
        } else if (parametro === 'proporcion') {
            return `E = Z \\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}`;
        }
        return '';
    };

    const getFormulaICNum = () => {
        const critico = resultados.valorCritico.toFixed(4);
        const punt = puntual.estimacion.toFixed(4);
        
        if (parametro === 'media') {
            // Calcular desviación estándar (s o sigma) a partir del margen de error
            const SE = resultados.margenError / resultados.valorCritico;
            const s_or_sigma = (SE * Math.sqrt(resultados.n)).toFixed(4);
            
            return `${punt} \\pm ${critico} \\left( \\frac{${s_or_sigma}}{\\sqrt{${resultados.n}}} \\right)`;
        } else if (parametro === 'proporcion') {
            return `${punt} \\pm ${critico} \\sqrt{\\frac{${punt}(1-${punt})}{${resultados.n}}}`;
        }
        return '';
    };

    const renderDesviacion = () => {
        if (parametro === 'media' && resultados.margenError !== undefined && resultados.valorCritico !== undefined) {
            const SE = resultados.margenError / resultados.valorCritico;
            const s_or_sigma = (SE * Math.sqrt(resultados.n)).toFixed(4);
            const sym = '\\sigma';
            const formula = '\\sigma = \\sqrt{\\frac{\\sum(x_i-\\bar{x})^2}{n-1}}';
            
            // Si es t-student, sabemos 100% que fue calculada (muestral), mostramos tooltip.
            // Si es Z, asumimos que fue ingresada manualmente (conocida), no mostramos tooltip.
            const showTooltip = !resultados.metodo.includes('Z');
            
            return (
                <div style={{ flex: '1 1 130px', maxWidth: '250px', padding: '8px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Desviación Estándar</div>
                    <div style={{ fontSize: '1rem', marginTop: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3px' }}>
                        {showTooltip ? (
                            <span className="t3-tooltip-wrap" style={{ borderBottom: '1px dashed #94a3b8', cursor: 'help', paddingBottom: '0px' }}>
                                <div className="t3-tooltip-box" style={{ fontWeight: 'normal', width: 'max-content', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.9rem', color: '#fff' }}>
                                        {renderKatex(formula)}
                                    </div>
                                </div>
                                {renderKatex(sym)}
                            </span>
                        ) : (
                            renderKatex(sym)
                        )}
                        {renderKatex(`= ${s_or_sigma}`)}
                    </div>
                </div>
            );
        }
        return null;
    };

    const puntual = resultados.puntual;

    return (
        <div style={{ width: '100%' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-main, #1e293b)' }}>
                Resultados:
            </h4>

            {/* Fila de Estimación Puntual y Descriptivos */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ flex: '1 1 130px', maxWidth: '250px', padding: '8px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Tamaño de Muestra</div>
                    <div style={{ fontSize: '1rem', marginTop: '5px' }}>{renderKatex(`n = ${resultados.n}`)}</div>
                </div>

                <div style={{ flex: '1 1 130px', maxWidth: '250px', padding: '8px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Estimador Puntual</div>
                    <div style={{ fontSize: '1rem', marginTop: '5px' }}>
                        {renderKatex(`${getSymboloPuntual()} = ${puntual.estimacion.toFixed(4)}`)}
                    </div>
                </div>

                <div style={{ flex: '1 1 130px', maxWidth: '250px', padding: '8px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Nivel de Confianza</div>
                    <div style={{ fontSize: '1rem', marginTop: '5px' }}>{renderKatex(`${resultados.confianza}\\%`)}</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '15px' }}>
                <div style={{ flex: '1 1 200px', maxWidth: '400px', padding: '8px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Valor Crítico - {resultados.metodo}</div>
                    <div style={{ fontSize: parametro === 'varianza' ? '0.9rem' : '1rem', marginTop: '5px' }}>
                        {parametro === 'varianza' 
                            ? renderKatex(`\\chi^2_{sup} = ${Math.max(resultados.criticoInf, resultados.criticoSup).toFixed(4)}, \\chi^2_{inf} = ${Math.min(resultados.criticoInf, resultados.criticoSup).toFixed(4)}`)
                            : renderKatex(`${resultados.metodo.includes('Z') ? 'Z' : 'T'} = ${resultados.valorCritico.toFixed(4)}`)
                        }
                    </div>
                </div>

                {renderDesviacion()}
            </div>

            {/* Resultado Principal: El Intervalo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{ padding: '15px 25px', background: 'rgba(37, 99, 235, 0.1)', border: '2px solid var(--primary-color)', borderRadius: '12px', textAlign: 'center', minWidth: '300px', display: 'inline-block' }}>
                    <div style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 'bold', marginBottom: '8px' }}>
                        Intervalo de Confianza para {renderKatex(getSymboloParam())} al {resultados.confianza}%
                    </div>
                    {resultados.margenError !== undefined && (
                        <div style={{ marginTop: '15px', marginBottom: '10px' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                                <span className="t3-tooltip-wrap" style={{ borderBottom: '1px dashed #94a3b8', cursor: 'help', paddingBottom: '0px' }}>
                                    <div className="t3-tooltip-box" style={{ fontWeight: 'normal', width: 'max-content', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#fff' }}>
                                            {renderKatex(`IC = ${getFormulaIC()}`)}
                                        </div>
                                    </div>
                                    {renderKatex(`IC`)}
                                </span>
                                {renderKatex(`= ${getFormulaICNum()}`)}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                                <span>Margen de Error</span>
                                <span className="t3-tooltip-wrap" style={{ borderBottom: '1px dashed #94a3b8', cursor: 'help', paddingBottom: '0px' }}>
                                    <div className="t3-tooltip-box" style={{ fontWeight: 'normal', width: 'max-content', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#fff' }}>
                                            {renderKatex(getFormulaE())}
                                        </div>
                                    </div>
                                    {renderKatex(`(E)`)}
                                </span>
                                {renderKatex(`= ${resultados.margenError.toFixed(4)}`)}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '8px', display: 'grid', gridTemplateColumns: 'max-content max-content', rowGap: '4px', columnGap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                <div style={{ textAlign: 'right' }}>Límite Inferior</div>
                                <div style={{ textAlign: 'left' }}>{renderKatex(`= LI = ${getSymboloPuntual()} - E = ${puntual.estimacion.toFixed(4)} - ${resultados.margenError.toFixed(4)} = ${resultados.LI.toFixed(4)}`)}</div>
                                <div style={{ textAlign: 'right' }}>Límite Superior</div>
                                <div style={{ textAlign: 'left' }}>{renderKatex(`= LS = ${getSymboloPuntual()} + E = ${puntual.estimacion.toFixed(4)} + ${resultados.margenError.toFixed(4)} = ${resultados.LS.toFixed(4)}`)}</div>
                            </div>
                        </div>
                    )}

                    {parametro === 'varianza' && (
                        <div style={{ marginTop: '15px', marginBottom: '10px' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '5px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                                <span className="t3-tooltip-wrap" style={{ borderBottom: '1px dashed #94a3b8', cursor: 'help', paddingBottom: '0px' }}>
                                    <div className="t3-tooltip-box" style={{ fontWeight: 'normal', width: 'max-content', textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.9rem', color: '#fff' }}>
                                            {renderKatex(`IC = \\left[ \\frac{(n - 1)S^2}{\\chi^2_{sup}}, \\frac{(n - 1)S^2}{\\chi^2_{inf}} \\right]`)}
                                        </div>
                                    </div>
                                    {renderKatex(`IC`)}
                                </span>
                                {renderKatex(`= \\left[ \\frac{(${resultados.n} - 1)(${puntual.estimacion.toFixed(4)})}{${Math.max(resultados.criticoInf, resultados.criticoSup).toFixed(4)}}, \\frac{(${resultados.n} - 1)(${puntual.estimacion.toFixed(4)})}{${Math.min(resultados.criticoInf, resultados.criticoSup).toFixed(4)}} \\right]`)}
                            </div>
                            
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '15px', display: 'grid', gridTemplateColumns: 'max-content max-content', rowGap: '4px', columnGap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                <div style={{ textAlign: 'right' }}>Límite Inferior</div>
                                <div style={{ textAlign: 'left' }}>{renderKatex(`= LI = \\frac{(${resultados.n} - 1)(${puntual.estimacion.toFixed(4)})}{${Math.max(resultados.criticoInf, resultados.criticoSup).toFixed(4)}} = ${resultados.LI.toFixed(4)}`)}</div>
                                <div style={{ textAlign: 'right' }}>Límite Superior</div>
                                <div style={{ textAlign: 'left' }}>{renderKatex(`= LS = \\frac{(${resultados.n} - 1)(${puntual.estimacion.toFixed(4)})}{${Math.min(resultados.criticoInf, resultados.criticoSup).toFixed(4)}} = ${resultados.LS.toFixed(4)}`)}</div>
                            </div>
                        </div>
                    )}

                    <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '15px' }}>
                        {renderKatex(`IC = [\\, ${resultados.LI.toFixed(4)} \\, , \\, ${resultados.LS.toFixed(4)} \\,]`)}
                    </div>

                    <div style={{ fontSize: '1rem' , fontWeight: 'bold', color: 'var(--text-main)', marginTop: '15px' }}>
                        {renderKatex(`P(${resultados.LI.toFixed(4)} \\le ${getSymboloParam()} \\le ${resultados.LS.toFixed(4)}) = ${resultados.confianza / 100}`)}
                    </div>
                </div>
            </div>

            {parametro !== 'varianza' ? (
                <div style={{ marginTop: '20px' }}>
                    {parametro === 'media' && <Grafica_IntervalosMatriz resultados={resultados} parametro={parametro} />}
                    {parametro === 'proporcion' && <Grafica_IntervalosProporcion resultados={resultados} parametro={parametro} />}
                </div>
            ) : (
                <div style={{ marginTop: '20px' }}>
                    <Grafica_IntervalosVarianza resultados={resultados} />
                </div>
            )}
        </div>
    );
}
