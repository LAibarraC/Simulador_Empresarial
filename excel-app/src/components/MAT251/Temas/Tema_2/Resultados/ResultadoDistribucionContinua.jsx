import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cardStyle, FONT, FS, RADIUS } from '../../../Principal/Constantes';
import ModalProcedimientoContinua from '../Modales/ModalProcedimientoContinua';
import GraficoAreaContinua from '../../../Graficas/Tema_2/GraficoAreaContinua';
import GraficaCentroDispersionContinua from '../../../Graficas/Tema_2/GraficaCentroDispersionContinua';
import { IconoProcedimiento } from '../../../ui/Iconos';

// Helper KaTeX
const FormulaKaTeX = ({ latex, inline = false }) => {
    const formulaRef = useRef(null);

    useEffect(() => {
        if (formulaRef.current && latex) {
            katex.render(latex, formulaRef.current, { throwOnError: false, displayMode: !inline });
        }
    }, [latex, inline]);

    if (inline) {
        return <span ref={formulaRef} style={{ margin: '0 4px' }}></span>;
    }
    return <div ref={formulaRef} style={{ margin: '15px 0', fontSize: '1.1em', overflowX: 'auto', overflowY: 'hidden', paddingBottom: '8px' }}></div>;
};

export default function ResultadoDistribucionContinua({ resultados }) {
    const [momentoActivo, setMomentoActivo] = useState(null);

    if (!resultados) return null;

    if (resultados.error) {
        return (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', padding: '15px', borderRadius: RADIUS, fontFamily: FONT }}>
                <strong>Error de Validación:</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: FS.sm }}>{resultados.error}</p>
            </div>
        );
    }

    const { funcion, a, b, esperanza = 0, varianza = 0, desviacion = 0, asimetria = 0, curtosis = 0, warning, es_valida = true } = resultados;

    const aTex = a === Infinity ? '\\infty' : a === -Infinity ? '-\\infty' : a;
    const bTex = b === Infinity ? '\\infty' : b === -Infinity ? '-\\infty' : b;

    return (
        <div style={{ fontFamily: FONT, display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
            {warning && resultados.modo !== 'acumulada' && (
                <div style={{ backgroundColor: '#fefce8', color: '#854d0e', border: '1px solid #fef08a', padding: '15px', borderRadius: RADIUS, fontFamily: FONT }}>
                    <strong>Modo Exploración:</strong>
                    <p style={{ margin: '5px 0 0 0', fontSize: FS.sm }}>{warning}</p>
                </div>
            )}
            <div style={{ ...cardStyle, position: 'relative' }}>
                {resultados.modo === 'acumulada' && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: RADIUS }}>
                        <div style={{ background: '#f8fafc', color: '#334155', padding: '15px 25px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600, textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                            📊 Función de Distribución Acumulada<br/>
                            <span style={{ fontSize: FS.sm, fontWeight: 400 }}>La gráfica inferior muestra la probabilidad acumulada P(X ≤ x).<br/>Los momentos estadísticos se calculan a partir de la densidad f(x).</span>
                        </div>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ color: 'var(--primary-color)', fontSize: FS.md, margin: 0, fontWeight: 600 }}>
                        MOMENTOS DE LA DISTRIBUCIÓN CONTINUA
                    </h3>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                    gap: '20px' 
                }}>
                    {/* 1. Esperanza Matemática */}
                    <div style={{ position: 'relative', background: 'var(--bg-input)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: FS.sm, fontWeight: 600, color: 'var(--text-color)' }}>
                                1. Esperanza Matemática <FormulaKaTeX latex="\mu = E(X)" inline={true} />
                            </span>
                            <button onClick={() => setMomentoActivo('esperanza')} title="Ver procedimiento" style={{ position: 'absolute', top: '10px', right: '10px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', color: '#475569' }}>
                                <IconoProcedimiento />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: '8px', rowGap: '4px', marginTop: '10px' }}>
                            <FormulaKaTeX latex={`\\displaystyle E(X) = \\int_{${aTex}}^{${bTex}} x \\cdot f(x) dx`} inline={true} />
                            <FormulaKaTeX latex={`= ${esperanza.toFixed(4)}`} inline={true} />
                        </div>
                    </div>

                    {/* 2. Varianza */}
                    <div style={{ position: 'relative', background: 'var(--bg-input)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: FS.sm, fontWeight: 600, color: 'var(--text-color)' }}>
                                2. Varianza <FormulaKaTeX latex="Var(X)" inline={true} />
                            </span>
                            <button onClick={() => setMomentoActivo('varianza')} title="Ver procedimiento" style={{ position: 'absolute', top: '10px', right: '10px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', color: '#475569' }}>
                                <IconoProcedimiento />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: '8px', rowGap: '4px', marginTop: '10px' }}>
                            <FormulaKaTeX latex={`\\displaystyle Var(X) = \\int_{${aTex}}^{${bTex}} (x - \\mu)^2 f(x) dx`} inline={true} />
                            <FormulaKaTeX latex={`= ${varianza.toFixed(4)}`} inline={true} />
                        </div>
                    </div>

                    {/* 3. Desviación Estándar */}
                    <div style={{ position: 'relative', background: 'var(--bg-input)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: FS.sm, fontWeight: 600, color: 'var(--text-color)' }}>
                                3. Desviación Estándar <FormulaKaTeX latex="\sigma" inline={true} />
                            </span>
                            <button onClick={() => setMomentoActivo('desviacion')} title="Ver procedimiento" style={{ position: 'absolute', top: '10px', right: '10px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', color: '#475569' }}>
                                <IconoProcedimiento />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: '8px', rowGap: '4px', marginTop: '10px' }}>
                            <FormulaKaTeX latex={`\\displaystyle \\sigma = \\sqrt{Var(X)}`} inline={true} />
                            <FormulaKaTeX latex={`= ${desviacion.toFixed(4)}`} inline={true} />
                        </div>
                    </div>

                    {/* 4. Asimetría */}
                    <div style={{ position: 'relative', background: 'var(--bg-input)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: FS.sm, fontWeight: 600, color: 'var(--text-color)' }}>
                                4. Asimetría <FormulaKaTeX latex="\gamma_1" inline={true} /> (Sesgo)
                            </span>
                            <button onClick={() => setMomentoActivo('asimetria')} title="Ver procedimiento" style={{ position: 'absolute', top: '10px', right: '10px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', color: '#475569' }}>
                                <IconoProcedimiento />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: '8px', rowGap: '4px', marginTop: '10px' }}>
                            <FormulaKaTeX latex={`\\displaystyle \\gamma_1 = \\int_{${aTex}}^{${bTex}} \\left(\\frac{x - \\mu}{\\sigma}\\right)^3 f(x) dx`} inline={true} />
                            <FormulaKaTeX latex={`= ${asimetria.toFixed(4)}`} inline={true} />
                        </div>
                    </div>

                    {/* 5. Curtosis */}
                    <div style={{ position: 'relative', background: 'var(--bg-input)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: FS.sm, fontWeight: 600, color: 'var(--text-color)' }}>
                                5. Curtosis <FormulaKaTeX latex="\gamma_2" inline={true} />
                            </span>
                            <button onClick={() => setMomentoActivo('curtosis')} title="Ver procedimiento" style={{ position: 'absolute', top: '10px', right: '10px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', color: '#475569' }}>
                                <IconoProcedimiento />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: '8px', rowGap: '4px', marginTop: '10px' }}>
                            <FormulaKaTeX latex={`\\displaystyle \\gamma_2 = \\int_{${aTex}}^{${bTex}} \\left(\\frac{x - \\mu}{\\sigma}\\right)^4 f(x) dx - 3`} inline={true} />
                            <FormulaKaTeX latex={`= ${curtosis.toFixed(4)}`} inline={true} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráfica 1: Densidad f(x) */}
            <GraficoAreaContinua datos={resultados} />

            {/* Gráfica 2: Centro y Dispersión (solo en modo densidad con momentos calculados) */}
            {resultados.modo !== 'acumulada' && resultados.esperanza !== undefined && resultados.desviacion !== undefined && (
                <GraficaCentroDispersionContinua datos={resultados} />
            )}

            {/* Modales */}
            {momentoActivo && (
                <ModalProcedimientoContinua 
                    momento={momentoActivo} 
                    datos={resultados} 
                    onClose={() => setMomentoActivo(null)} 
                />
            )}
        </div>
    );
}
