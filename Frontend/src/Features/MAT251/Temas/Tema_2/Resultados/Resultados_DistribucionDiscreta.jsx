import React, { useState, useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import GraficoBastonesDiscreta from '../../../Graficas/Tema_2/GraficoBastonesDiscreta';
import GraficoAcumuladaDiscreta from '../../../Graficas/Tema_2/GraficoAcumuladaDiscreta';
import GraficaCentroDispersion from '../../../Graficas/Tema_2/GraficaCentroDispersion';
import MarcoWidgetMAT251 from '../../../ui/MarcoWidgetMAT251';
import { cardStyle, FONT, FS, RADIUS } from '../../../Principal/Constantes';
import ModalProcedimientoDiscreta from '../Modales/ModalProcedimientoDiscreta';
import { IconoProcedimiento } from '../../../ui/Iconos';

// Componente helper para renderizar KaTeX sin depender de react-katex
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


export default function Resultados_DistribucionDiscreta({ resultados }) {
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

    const { datos, esperanza, varianza, desviacion, asimetria, curtosis } = resultados;

    return (
        <div style={{ fontFamily: FONT, display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>

            {/* Desarrollo Matemático con KaTeX */}
            <div style={{ ...cardStyle }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                    <h3 style={{ color: 'var(--primary-color)', fontSize: FS.md, margin: 0, fontWeight: 600 }}>
                        MOMENTOS DE LA DISTRIBUCIÓN
                    </h3>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gridTemplateRows: '1fr 1fr 1fr',
                    gridAutoFlow: 'column',
                    gap: '20px' 
                }}>
                    {/* 1. Esperanza Matemática */}
                    <div style={{ background: 'var(--bg-input)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: FS.sm, fontWeight: 600, color: 'var(--text-color)' }}>
                                1. Esperanza Matemática <FormulaKaTeX latex="\mu = E(X)" inline={true} />
                            </span>
                            <button onClick={() => setMomentoActivo('esperanza')} title="Ver procedimiento de Esperanza Matemática" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', color: '#475569' }}>
                                <IconoProcedimiento />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: '8px', rowGap: '4px', marginTop: '10px' }}>
                            <FormulaKaTeX latex={`\\displaystyle E(X) = \\sum_{i=1}^{n} x_i P(x_i)`} inline={true} />
                            <FormulaKaTeX latex={`= ${esperanza.toFixed(4)}`} inline={true} />
                        </div>
                    </div>

                    {/* 2. Varianza */}
                    <div style={{ background: 'var(--bg-input)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: FS.sm, fontWeight: 600, color: 'var(--text-color)' }}>
                                2. Varianza <FormulaKaTeX latex="Var(X)" inline={true} />
                            </span>
                            <button onClick={() => setMomentoActivo('varianza')} title="Ver procedimiento de Varianza" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', color: '#475569' }}>
                                <IconoProcedimiento />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: '8px', rowGap: '4px', marginTop: '10px' }}>
                            <FormulaKaTeX latex={`\\displaystyle Var(X) = \\sum_{i=1}^{n} (x_i - \\mu)^2 P(x_i)`} inline={true} />
                            <FormulaKaTeX latex={`= ${varianza.toFixed(4)}`} inline={true} />
                        </div>
                    </div>

                    {/* 3. Desviación Estándar */}
                    <div style={{ background: 'var(--bg-input)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: FS.sm, fontWeight: 600, color: 'var(--text-color)' }}>
                                3. Desviación Estándar <FormulaKaTeX latex="\sigma" inline={true} />
                            </span>
                            <button onClick={() => setMomentoActivo('desviacion')} title="Ver procedimiento de Desviación Estándar" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', color: '#475569' }}>
                                <IconoProcedimiento />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: '8px', rowGap: '4px', marginTop: '10px' }}>
                            <FormulaKaTeX latex={`\\displaystyle \\sigma = \\sqrt{Var(X)}`} inline={true} />
                            <FormulaKaTeX latex={`= ${desviacion.toFixed(4)}`} inline={true} />
                        </div>
                    </div>

                    {/* 4. Asimetría */}
                    <div style={{ background: 'var(--bg-input)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: FS.sm, fontWeight: 600, color: 'var(--text-color)' }}>
                                4. Asimetría <FormulaKaTeX latex="\gamma_1" inline={true} /> (Sesgo)
                            </span>
                            <button onClick={() => setMomentoActivo('asimetria')} title="Ver procedimiento de Asimetría" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', color: '#475569' }}>
                                <IconoProcedimiento />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: '8px', rowGap: '4px', marginTop: '10px' }}>
                            <FormulaKaTeX latex={`\\displaystyle \\gamma_1 = \\frac{E[(X-\\mu)^3]}{\\sigma^3}`} inline={true} />
                            <FormulaKaTeX latex={`= ${asimetria.toFixed(4)}`} inline={true} />
                        </div>
                    </div>

                    {/* 5. Curtosis */}
                    <div style={{ background: 'var(--bg-input)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: FS.sm, fontWeight: 600, color: 'var(--text-color)' }}>
                                5. Curtosis <FormulaKaTeX latex="\gamma_2" inline={true} />
                            </span>
                            <button onClick={() => setMomentoActivo('curtosis')} title="Ver procedimiento de Curtosis" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', color: '#475569' }}>
                                <IconoProcedimiento />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: '8px', rowGap: '4px', marginTop: '10px' }}>
                            <FormulaKaTeX latex={`\\displaystyle \\gamma_2 = \\frac{E[(X-\\mu)^4]}{\\sigma^4} - 3`} inline={true} />
                            <FormulaKaTeX latex={`= ${curtosis.toFixed(4)}`} inline={true} />
                        </div>
                    </div>
                </div> 
            </div>

            {/* Gráfica: Centro y Dispersión */}
            <MarcoWidgetMAT251 id="widget-momentos" titulo="Visualización de Centro y Dispersión" anchoCompleto={true} alto="450px">
                <div style={{ background: '#f8fafc', padding: '10px 10px', borderRadius: RADIUS, height: '100%' }}>
                    <GraficaCentroDispersion datos={datos} esperanza={esperanza} varianza={varianza} desviacion={desviacion} asimetria={asimetria} curtosis={curtosis} />
                </div>
            </MarcoWidgetMAT251>

            {/* Gráfica de Bastones */}
            <MarcoWidgetMAT251 id="widget-bastones" titulo="Función de Probabilidad — P(X = x)" anchoCompleto={true} alto="400px">
                <div style={{ background: '#f8fafc', padding: '20px 10px', borderRadius: RADIUS, height: '100%' }}>
                    <GraficoBastonesDiscreta datos={datos} />
                </div>
            </MarcoWidgetMAT251>

            {/* Gráfica Acumulada */}
            <div style={{ marginTop: '20px' }}>
                <MarcoWidgetMAT251 id="widget-acumulada" titulo="Función de Distribución Acumulada — F(x)" anchoCompleto={true} alto="400px">
                    <div style={{ background: '#f8fafc', padding: '20px 10px', borderRadius: RADIUS, height: '100%' }}>
                        <GraficoAcumuladaDiscreta datos={datos} />
                    </div>
                </MarcoWidgetMAT251>
            </div>

            {/* Modal Dinámico por Momento */}
            <ModalProcedimientoDiscreta 
                momentoActivo={momentoActivo} 
                setMomentoActivo={setMomentoActivo} 
                resultados={resultados} 
            />

        </div>
    );
}
