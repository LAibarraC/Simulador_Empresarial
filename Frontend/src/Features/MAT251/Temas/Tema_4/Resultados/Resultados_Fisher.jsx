import React from 'react';
import { cardStyle, RADIUS, FONT } from '../../../Principal/Constantes';
import Latex from '../../../../../components/excel/Latex';
import StatLabel from '../../../ui/StatLabel';
import '../../../styles/Temas/Tema4.css';

export default function Resultados_Fisher({ resultados }) {
    if (!resultados || resultados.probFinal === undefined) return null;

    const getMathProbFinal = (cond) => {
        if (cond === 'mayor_que') {
            return "P(F \\ge f) = 1 - P(F \\le f_0)";
        }
        if (cond === 'entre') {
            return "P(f_1 \\le F \\le f_2) = P(F \\le f_2) - P(F \\le f_1)";
        }
        return "P(F \\le f) = P(F \\le f_0)";
    };

    return (
        <div style={{ ...cardStyle, background: 'var(--bg-card)', height: '100%', display: 'flex', flexDirection: 'column', border: 'none', boxShadow: 'none', padding: 0, fontFamily: FONT, color: 'var(--text-pure)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div 
                        className="tema4-tarjeta-titulo-unificado"
                        style={{ marginBottom: '12px', color: 'var(--text-pure)', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                    >
                        <span>Estandarización</span>
                        <StatLabel
                            formulaKey="FFisher"
                            formulaLatex="F"
                            customTexto="Distribución F de Fisher-Snedecor"
                            customMath="F = \frac{S_1^2 / \sigma_1^2}{S_2^2 / \sigma_2^2} \sim F(v_1, v_2)"
                            align="center"
                        />
                        <span>y Probabilidad</span>
                    </div>
                    <div className="thin-scrollbar formula-responsive" style={{ overflowX: 'auto', paddingBottom: '10px', color: 'var(--text-pure)' }}>
                        <Latex formula={resultados.strDesarrollo} />
                    </div>

                    {/* Sección Probabilidad Final unificada dentro de la misma tarjeta */}
                    <div style={{ marginTop: '18px' }}>
                        <div 
                            className="tema4-tarjeta-titulo-unificado"
                            style={{ 
                                marginBottom: '8px', 
                                color: 'var(--text-pure)', 
                                fontSize: '0.8rem', 
                                fontWeight: 'bold', 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}
                        >
                            <span>PROBABILIDAD FINAL</span>
                            <StatLabel
                                formulaKey="P_FFisher"
                                formulaLatex="P(F)"
                                customTexto="Cálculo de Probabilidad F de Fisher"
                                customMath={getMathProbFinal(resultados.condicion)}
                                align="center"
                            />
                        </div>
                        <div 
                            className="formula-responsive formula-bold" 
                            style={{ 
                                color: 'var(--text-pure)', 
                                fontWeight: 'bold', 
                                lineHeight: 1.2, 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center' 
                            }}
                        >
                            <Latex formula={`\\mathbf{${resultados.probFinal.toFixed(4)}} \\;\\mathbf{\\rightarrow}\\; \\mathbf{${(resultados.probFinal * 100).toFixed(2)}\\%}`} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
