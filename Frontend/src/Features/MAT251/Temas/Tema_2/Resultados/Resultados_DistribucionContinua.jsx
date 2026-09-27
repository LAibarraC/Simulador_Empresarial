import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import { compile, simplify, parse } from 'mathjs';
import GraficoAreaContinua from '../../../Graficas/Tema_2/GraficoAreaContinua';
import MarcoWidgetMAT251 from '../../../ui/MarcoWidgetMAT251';

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
            <div style={{ padding: '20px', background: 'var(--bg-card, #1e293b)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <h3 style={{ color: '#ef4444', margin: '0 0 10px 0' }}>Error de Validación</h3>
                <p style={{ color: 'var(--text-main, #f8fafc)', margin: 0 }}>{calculos.error}</p>
            </div>
        );
    }

    const { eX, varX, stdDev } = calculos;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Tarjetas de Resultados */}
            <div className="resultados-grid-continua">
                <div style={{ background: 'var(--bg-card, #1e293b)', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color, var(--text-main))', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem', marginBottom: '5px' }}>Esperanza {renderLatex('E[X]')}</div>
                    <div style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 'bold' }}>{eX.toFixed(4)}</div>
                </div>
                <div style={{ background: 'var(--bg-card, #1e293b)', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color, var(--text-main))', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem', marginBottom: '5px' }}>Varianza {renderLatex('V[X]')}</div>
                    <div style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 'bold' }}>{varX.toFixed(4)}</div>
                </div>
                <div className="desviacion-card" style={{ background: 'var(--bg-card, #1e293b)', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color, var(--text-main))', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted, #94a3b8)', fontSize: '0.9rem', marginBottom: '5px' }}>Desv. Estándar {renderLatex('\\sigma')}</div>
                    <div style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 'bold' }}>{stdDev.toFixed(4)}</div>
                </div>
            </div>

            {/* Desarrollo Paso a Paso */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ margin: '0', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 'bold' }}>Desarrollo Matemático</h3>
                
                {latex_esperanza ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Cuadro Validación de Área */}
                        {latex_area && (
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <h4 style={{ margin: '0', color: 'var(--text-main)', fontSize: '0.95rem' }}>Validación de Área</h4>
                                </div>
                                <div style={{ background: 'var(--bg-card, #ffffff)', padding: '15px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #cbd5e1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflowX: 'auto', marginBottom: '10px' }}>
                                    <div style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{renderLatex(latex_area)}</div>
                                </div>
                                {Math.abs(calculos.area - 1) < 0.02 ? (
                                    <div style={{ background: '#dcfce7', color: '#166534', padding: '10px 15px', borderRadius: '8px', fontSize: '0.7rem', border: '1px solid #bbf7d0' }}>
                                        La función es una densidad de probabilidad válida (Área = 1)
                                    </div>
                                ) : (
                                    <div style={{ background: '#fef3c7', color: '#92400e', padding: '10px 15px', borderRadius: '8px', fontSize: '0.7rem', border: '1px solid #fde68a' }}>
                                        El área es distinta de 1. No es una función de densidad válida, pero el cálculo continuará con fines demostrativos.
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Cuadro Esperanza */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <h4 style={{ margin: '0', color: 'var(--text-main)', fontSize: '0.95rem' }}>Esperanza Matemática</h4>
                                <span style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{renderLatex('E(X)')}</span>
                            </div>
                            <div style={{ background: 'var(--bg-card, #ffffff)', padding: '15px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #cbd5e1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflowX: 'auto' }}>
                                <div style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{renderLatex(latex_esperanza)}</div>
                            </div>
                        </div>
                        
                        {/* Cuadro Varianza */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <h4 style={{ margin: '0', color: 'var(--text-main)', fontSize: '0.95rem' }}>Varianza</h4>
                                <span style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{renderLatex('V(X)')}</span>
                            </div>
                            <div style={{ background: 'var(--bg-card, #ffffff)', padding: '15px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #cbd5e1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflowX: 'auto' }}>
                                <div style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>{renderLatex(latex_varianza)}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Cuadro Validación de Área Fallback */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <h4 style={{ margin: '0', color: 'var(--text-main)', fontSize: '0.95rem' }}>Validación de Área</h4>
                            </div>
                            <div style={{ background: 'var(--bg-card, #ffffff)', padding: '15px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #cbd5e1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflowX: 'auto', marginBottom: '10px' }}>
                                <div style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                                    {renderLatex(`\\text{Área} = \\int_{${a}}^{${b}} \\left(${latexString}\\right) dx = ${calculos.area.toFixed(4)}`)}
                                </div>
                            </div>
                            {Math.abs(calculos.area - 1) < 0.02 ? (
                                <div style={{ background: '#dcfce7', color: '#166534', padding: '10px 15px', borderRadius: '8px', fontSize: '0.7rem', border: '1px solid #bbf7d0' }}>
                                    La función es una densidad de probabilidad válida (Área = 1)
                                </div>
                            ) : (
                                <div style={{ background: '#fef3c7', color: '#92400e', padding: '10px 15px', borderRadius: '5px', fontSize: '0.7rem', border: '1px solid #fde68a' }}>
                                    El área es distinta de 1. No es una función de densidad válida, pero el cálculo continuará con fines demostrativos. 
                                </div>
                            )}
                        </div>

                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <h4 style={{ margin: '0', color: 'var(--text-main)', fontSize: '0.95rem' }}>Esperanza Matemática</h4>
                                <span style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{renderLatex('E(X)')}</span>
                            </div>
                            <div style={{ background: 'var(--bg-card, #ffffff)', padding: '15px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #cbd5e1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflowX: 'auto' }}>
                                <div style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                                    {renderLatex(`E[X] = \\int_{${a}}^{${b}} x \\cdot \\left(${latexString}\\right) dx = \\int_{${a}}^{${b}} \\left(${latexIntegrandEX}\\right) dx = ${eX.toFixed(4)}`)}
                                </div>
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <h4 style={{ margin: '0', color: 'var(--text-main)', fontSize: '0.95rem' }}>Varianza</h4>
                                <span style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{renderLatex('V(X)')}</span>
                            </div>
                            <div style={{ background: 'var(--bg-card, #ffffff)', padding: '15px 20px', borderRadius: '12px', border: '1px solid var(--border-color, #cbd5e1)', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', overflowX: 'auto' }}>
                                <div style={{ color: 'var(--text-main)', fontSize: '0.95rem' }}>
                                    {renderLatex(`V[X] = E[X^2] - (E[X])^2`)}<br/><br/>
                                    {renderLatex(`E[X^2] = \\int_{${a}}^{${b}} x^2 \\cdot \\left(${latexString}\\right) dx = \\int_{${a}}^{${b}} \\left(${latexIntegrandEX2}\\right) dx = ${calculos.eX2.toFixed(4)}`)}<br/><br/>
                                    {renderLatex(`V[X] = ${calculos.eX2.toFixed(4)} - (${eX.toFixed(4)})^2 = ${varX.toFixed(4)}`)}
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
