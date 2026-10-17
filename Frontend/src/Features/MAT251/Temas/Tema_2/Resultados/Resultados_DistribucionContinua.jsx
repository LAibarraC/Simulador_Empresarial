import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { compile, simplify, parse } from 'mathjs';
import GraficoAreaContinua from '../../../Graficas/Tema_2/GraficoAreaContinua';
import MarcoWidgetMAT251 from '../../../ui/MarcoWidgetMAT251';
import { FONT, FS, RADIUS } from '../../../Principal/Constantes';
import StatLabel from '../../../ui/StatLabel';
import '../../../styles/Temas/Tema2.css';

// Integración numérica mediante la Regla de Simpson 1/3
const simpsonIntegrate = (fn, a, b, n = 1000) => {
    if (n % 2 !== 0) n++; // n debe ser par
    const h = (b - a) / n;
    let sum = fn(a) + fn(b);

    for (let i = 1; i < n; i++) {
        const x = a + i * h;
        sum += fn(x) * (i % 2 === 0 ? 2 : 4);
    }
    return (sum * h) / 3;
};

export default function Resultados_DistribucionContinua({ resultados }) {
    const { funcionFx, a, b, latexString, latex_esperanza, latex_varianza, latex_area, esperanza_backend, varianza_backend, area_backend } = resultados;

    const calculos = useMemo(() => {
        try {
            const compiledExpr = compile(funcionFx);
            const f = (x) => {
                try {
                    return compiledExpr.evaluate({ x });
                } catch {
                    return 0;
                }
            };

            // 1. Usar resultados simbólicos del backend si están disponibles (Vital para límites infinitos)
            if (esperanza_backend !== undefined && esperanza_backend !== null) {
                return {
                    eX: esperanza_backend,
                    eX2: varianza_backend + (esperanza_backend * esperanza_backend), // Despejado de V(X) = E(X^2) - E(X)^2
                    varX: varianza_backend,
                    stdDev: Math.sqrt(Math.max(0, varianza_backend)),
                    area: area_backend !== undefined && area_backend !== null ? area_backend : 1
                };
            }

            // 2. Si el backend falló, intentar fallback numérico
            if (a === Infinity || a === -Infinity || b === Infinity || b === -Infinity) {
                return { error: 'No se puede integrar numéricamente con límites infinitos. La resolución simbólica falló.' };
            }

            // Paso 1: Validar Área numéricamente (solo límites finitos)
            const area = simpsonIntegrate(f, a, b);

            // Paso 2: E[X] = integral(x * f(x))
            const eX_fn = (x) => x * f(x);
            const eX = simpsonIntegrate(eX_fn, a, b);

            // Paso 3: E[X^2] = integral(x^2 * f(x))
            const eX2_fn = (x) => (x * x) * f(x);
            const eX2 = simpsonIntegrate(eX2_fn, a, b);

            // Paso 4: V[X]
            const varX = eX2 - (eX * eX);
            const stdDev = Math.sqrt(Math.max(0, varX));

            return { eX, eX2, varX, stdDev, area };

        } catch (err) {
            return { error: 'Error al procesar la función. Verifique la sintaxis.' };
        }
    }, [funcionFx, a, b, esperanza_backend, varianza_backend, area_backend]);

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
            <div className="resultados-grid-continua">
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
                            <div>
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
                        <div>
                            <h4 style={{ margin: '0 0 8px 0', textAlign: 'center', color: 'var(--text-pure)', fontSize: FS.sm, fontWeight: 700, fontFamily: FONT }}>
                                Esperanza Matemática {renderLatex('E(X)')}
                            </h4>
                            <div className="formula-desarrollo-box formula-scroll-container thin-scrollbar" style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: RADIUS, border: '1px solid var(--border-color)', overflowX: 'auto' }}>
                                <div style={{ color: 'var(--text-pure)', fontSize: '0.9rem' }}>{renderLatex(latex_esperanza)}</div>
                            </div>
                        </div>
                        
                        {/* Cuadro Varianza */}
                        <div>
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
                        <div>
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

                        <div>
                            <h4 style={{ margin: '0 0 8px 0', textAlign: 'center', color: 'var(--text-pure)', fontSize: FS.sm, fontWeight: 700, fontFamily: FONT }}>
                                Esperanza Matemática {renderLatex('E(X)')}
                            </h4>
                            <div className="formula-desarrollo-box formula-scroll-container thin-scrollbar" style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: RADIUS, border: '1px solid var(--border-color)', overflowX: 'auto' }}>
                                <div style={{ color: 'var(--text-pure)', fontSize: '0.9rem' }}>
                                    {renderLatex(`E[X] = \\int_{${a}}^{${b}} x \\cdot \\left(${latexString}\\right) dx = \\int_{${a}}^{${b}} \\left(${latexIntegrandEX}\\right) dx = \\mathbf{${eX.toFixed(4)}}`)}
                                </div>
                            </div>
                        </div>
                        <div>
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
            <div style={{ width: '100%', marginTop: '20px' }}>
                <GraficoAreaContinua 
                    datos={{ funcion: funcionFx, a, b, modo: 'densidad', eX, area: calculos.area }} 
                />
            </div>

        </div>
    );
}
