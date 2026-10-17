import React from 'react';
import { cardStyle, RADIUS, FONT } from '../../../Principal/Constantes';
import Latex from '../../../../../components/excel/Latex';
import StatLabel from '../../../ui/StatLabel';
import '../../../styles/Temas/Tema4.css';

export default function Resultados_Student({ resultados }) {
    if (!resultados || resultados.probFinal === undefined) return null;

    const getMathProbFinal = (cond) => {
        if (cond === 'mayor_que') {
            return "P(T \\ge t) = 1 - P(T \\le t_0)";
        }
        if (cond === 'entre') {
            return "P(t_1 \\le T \\le t_2) = P(T \\le t_2) - P(T \\le t_1)";
        }
        return "P(T \\le t) = P(T \\le t_0)";
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
                            formulaKey="T_student_est"
                            formulaLatex="T"
                            customTexto="Estandarización t-Student"
                            customMath="T = \frac{\bar{X} - \mu}{\frac{S}{\sqrt{n}}}"
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
                                formulaKey="P_TStudent"
                                formulaLatex="P(T)"
                                customTexto="Cálculo de Probabilidad t-Student"
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
