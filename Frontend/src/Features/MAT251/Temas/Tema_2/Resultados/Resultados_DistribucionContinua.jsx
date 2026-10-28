import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { simplify } from 'mathjs';
import { calcularResumenContinua } from '../../../Matematicas/logica_Tema2';
import GraficoAreaContinua from '../../../Graficas/Tema_2/GraficoAreaContinua';
import { FONT, FS, RADIUS } from '../../../Principal/Constantes';
import StatLabel from '../../../ui/StatLabel';
import '../../../styles/Temas/Tema2.css';

export default function Resultados_DistribucionContinua({ resultados }) {
    const { funcionFx, a, b, latexString, latex_esperanza, latex_varianza, latex_area, esperanza_backend, varianza_backend, area_backend } = resultados;

    const calculos = useMemo(() => calcularResumenContinua({
        funcionFx, a, b, esperanza_backend, varianza_backend, area_backend
    }), [funcionFx, a, b, esperanza_backend, varianza_backend, area_backend]);

    const renderLatex = (str) => {
        return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(str, { throwOnError: false }) }} />;
    };

    const renderKatexValue = (val) => {
        if (val === undefined || val === null || val === '') return '-';
        const str = String(val).trim();
        const escaped = str.replace(/%/g, '\\%');
        if (/^[0-9.,\s\\%-]+$/.test(escaped)) {
            return <InlineMath math={escaped} />;
        }
        return <InlineMath math={`\\text{${escaped}}`} />;
    };

    const latexIntegrandEX = useMemo(() => {
        try {
            return simplify(`x * (${funcionFx})`).toTex({ parenthesis: 'auto' });
        } catch {
            return `x \\cdot \\left(${latexString}\\right)`;
        }
    }, [funcionFx, latexString]);

    const latexIntegrandEX2 = useMemo(() => {
        try {
            return simplify(`x^2 * (${funcionFx})`).toTex({ parenthesis: 'auto' });
        } catch {
            return `x^2 \\cdot \\left(${latexString}\\right)`;
        }
    }, [funcionFx, latexString]);

    if (calculos.error) {
        return (
            <div style={{ padding: '15px', background: 'var(--bg-card)', borderRadius: RADIUS, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <h3 style={{ color: '#ef4444', margin: '0 0 8px 0', fontSize: FS.md, fontWeight: 700, fontFamily: FONT }}>Error de Validación</h3>
                <p style={{ color: 'var(--text-pure)', margin: 0, fontSize: FS.sm }}>{calculos.error}</p>
            </div>
        );
    }

    const { eX, varX, stdDev } = calculos;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Tarjetas de Resultados */}
            <div id="tour-continua-metricas" className="resultados-grid-continua">
                <div className="tarjeta-calculo-mat251" style={{ background: 'var(--bg-card)', padding: '12px 10px', borderRadius: RADIUS, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <p className="tarjeta-calculo-titulo" style={{ margin: 0, fontSize: FS.sl, color: 'var(--text-pure)', fontWeight: 'bold', fontFamily: FONT }}>
                        Esperanza <StatLabel formulaKey="E_continua" formulaLatex="E[X]" align="center" />
                    </p>
                    <div className="tarjeta-calculo-valor" style={{ margin: '4px 0 0', fontWeight: 'normal', color: 'var(--text-pure)', fontSize: FS.md }}>
                        {renderKatexValue(eX.toFixed(4))}
                    </div>
                </div>
                <div className="tarjeta-calculo-mat251" style={{ background: 'var(--bg-card)', padding: '12px 10px', borderRadius: RADIUS, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <p className="tarjeta-calculo-titulo" style={{ margin: 0, fontSize: FS.sl, color: 'var(--text-pure)', fontWeight: 'bold', fontFamily: FONT }}>
                        Varianza <StatLabel formulaKey="V_continua" formulaLatex="V[X]" align="center" />
                    </p>
                    <div className="tarjeta-calculo-valor" style={{ margin: '4px 0 0', fontWeight: 'normal', color: 'var(--text-pure)', fontSize: FS.md }}>
                        {renderKatexValue(varX.toFixed(4))}
                    </div>
                </div>
                <div className="tarjeta-calculo-mat251" style={{ background: 'var(--bg-card)', padding: '12px 10px', borderRadius: RADIUS, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <p className="tarjeta-calculo-titulo" style={{ margin: 0, fontSize: FS.sl, color: 'var(--text-pure)', fontWeight: 'bold', fontFamily: FONT }}>
                        Desv. Estándar <StatLabel formulaKey="sigma" formulaLatex="\sigma" align="center" />
                    </p>
                    <div className="tarjeta-calculo-valor" style={{ margin: '4px 0 0', fontWeight: 'normal', color: 'var(--text-pure)', fontSize: FS.md }}>
                        {renderKatexValue(stdDev.toFixed(4))}
                    </div>
                </div>
            </div>

            {/* Desarrollo Paso a Paso */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ margin: '0', color: 'var(--text-pure)', fontSize: FS.md, fontWeight: 700, fontFamily: FONT }}>Desarrollo Matemático</h3>
                
                {latex_esperanza ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {/* Cuadro Validación de Área */}
                        {latex_area && (
                            <div id="tour-continua-desarrollo-area">
                                <h4 style={{ margin: '0 0 8px 0', textAlign: 'center', color: 'var(--text-pure)', fontSize: FS.sm, fontWeight: 700, fontFamily: FONT }}>
                                    Validación de Área
                                </h4>
                                <div className="formula-desarrollo-box formula-scroll-container thin-scrollbar" style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: RADIUS, border: '1px solid var(--border-color)', overflowX: 'auto', marginBottom: '8px' }}>
                                    <div style={{ color: 'var(--text-pure)', fontSize: '0.9rem' }}>{renderLatex(latex_area)}</div>
                                </div>
                                {Math.abs(calculos.area - 1) < 0.02 ? (
                                    <div className="alerta-valida-continua" style={{ padding: '8px 12px', borderRadius: RADIUS, fontSize: FS.xs, display: 'flex', alignItems: 'center', fontWeight: 500 }}>
                                        <span><strong>Éxito: </strong>La función es una densidad de probabilidad válida (Área = 1)</span>
                                    </div>
                                ) : (
                                    <div className="alerta-invalida-continua" style={{ padding: '8px 12px', borderRadius: RADIUS, fontSize: FS.xs, display: 'flex', alignItems: 'center', fontWeight: 500 }}>
                                        <span><strong>Aviso: </strong>El área es distinta de 1. No es una función de densidad válida, pero el cálculo continuará con fines demostrativos.</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cuadro Esperanza */}
                        <div id="tour-continua-desarrollo-esperanza">
                            <h4 style={{ margin: '0 0 8px 0', textAlign: 'center', color: 'var(--text-pure)', fontSize: FS.sm, fontWeight: 700, fontFamily: FONT }}>
                                Esperanza Matemática {renderLatex('E(X)')}
                            </h4>
                            <div className="formula-desarrollo-box formula-scroll-container thin-scrollbar" style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: RADIUS, border: '1px solid var(--border-color)', overflowX: 'auto' }}>
                                <div style={{ color: 'var(--text-pure)', fontSize: '0.9rem' }}>{renderLatex(latex_esperanza)}</div>
                            </div>
                        </div>
                        
                        {/* Cuadro Varianza */}
                        <div id="tour-continua-desarrollo-varianza">
                            <h4 style={{ margin: '0 0 8px 0', textAlign: 'center', color: 'var(--text-pure)', fontSize: FS.sm, fontWeight: 700, fontFamily: FONT }}>
                                Varianza {renderLatex('V(X)')}
                            </h4>
                            <div className="formula-desarrollo-box formula-scroll-container thin-scrollbar" style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: RADIUS, border: '1px solid var(--border-color)', overflowX: 'auto' }}>
                                <div style={{ color: 'var(--text-pure)', fontSize: '0.9rem' }}>{renderLatex(latex_varianza)}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {/* Cuadro Validación de Área Fallback */}
                        <div id="tour-continua-desarrollo-area">
                            <h4 style={{ margin: '0 0 8px 0', textAlign: 'center', color: 'var(--text-pure)', fontSize: FS.sm, fontWeight: 700, fontFamily: FONT }}>
                                Validación de Área
                            </h4>
                            <div className="formula-desarrollo-box formula-scroll-container thin-scrollbar" style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: RADIUS, border: '1px solid var(--border-color)', overflowX: 'auto', marginBottom: '8px' }}>
                                <div style={{ color: 'var(--text-pure)', fontSize: '0.9rem' }}>
                                    {renderLatex(`\\text{Área} = \\int_{${a}}^{${b}} \\left(${latexString}\\right) dx = \\mathbf{${calculos.area.toFixed(4)}}`)}
                                </div>
                            </div>
                            {Math.abs(calculos.area - 1) < 0.02 ? (
                                <div className="alerta-valida-continua" style={{ padding: '8px 12px', borderRadius: RADIUS, fontSize: FS.xs, display: 'flex', alignItems: 'center', fontWeight: 500 }}>
                                    <span><strong>Éxito: </strong>La función es una densidad de probabilidad válida (Área = 1)</span>
                                </div>
                            ) : (
                                <div className="alerta-invalida-continua" style={{ padding: '8px 12px', borderRadius: RADIUS, fontSize: FS.xs, display: 'flex', alignItems: 'center', fontWeight: 500 }}>
                                    <span><strong>Aviso: </strong>El área es distinta de 1. No es una función de densidad válida, pero el cálculo continuará con fines demostrativos.</span>
                                </div>
                            )}
                        </div>

                        <div id="tour-continua-desarrollo-esperanza">
                            <h4 style={{ margin: '0 0 8px 0', textAlign: 'center', color: 'var(--text-pure)', fontSize: FS.sm, fontWeight: 700, fontFamily: FONT }}>
                                Esperanza Matemática {renderLatex('E(X)')}
                            </h4>
                            <div className="formula-desarrollo-box formula-scroll-container thin-scrollbar" style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: RADIUS, border: '1px solid var(--border-color)', overflowX: 'auto' }}>
                                <div style={{ color: 'var(--text-pure)', fontSize: '0.9rem' }}>
                                    {renderLatex(`E[X] = \\int_{${a}}^{${b}} x \\cdot \\left(${latexString}\\right) dx = \\int_{${a}}^{${b}} \\left(${latexIntegrandEX}\\right) dx = \\mathbf{${eX.toFixed(4)}}`)}
                                </div>
                            </div>
                        </div>
                        <div id="tour-continua-desarrollo-varianza">
                            <h4 style={{ margin: '0 0 8px 0', textAlign: 'center', color: 'var(--text-pure)', fontSize: FS.sm, fontWeight: 700, fontFamily: FONT }}>
                                Varianza {renderLatex('V(X)')}
                            </h4>
                            <div className="formula-desarrollo-box formula-scroll-container thin-scrollbar" style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: RADIUS, border: '1px solid var(--border-color)', overflowX: 'auto' }}>
                                <div style={{ color: 'var(--text-pure)', fontSize: '0.9rem' }}>
                                    {renderLatex(`V[X] = E[X^2] - (E[X])^2`)}<br/><br/>
                                    {renderLatex(`E[X^2] = \\int_{${a}}^{${b}} x^2 \\cdot \\left(${latexString}\\right) dx = \\int_{${a}}^{${b}} \\left(${latexIntegrandEX2}\\right) dx = \\mathbf{${calculos.eX2.toFixed(4)}}`)}<br/><br/>
                                    {renderLatex(`V[X] = ${calculos.eX2.toFixed(4)} - (${eX.toFixed(4)})^2 = \\mathbf{${varX.toFixed(4)}}`)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Gráfica */}
            <div id="tour-continua-grafica" style={{ width: '100%', marginTop: '20px' }}>
                <GraficoAreaContinua 
                    datos={{ funcion: funcionFx, a, b, modo: 'densidad', eX, area: calculos.area }} 
                />
            </div>

        </div>
    );
}
