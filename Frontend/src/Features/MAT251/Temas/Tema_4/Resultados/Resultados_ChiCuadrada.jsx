import React from 'react';
import Latex from '../../../../../components/excel/Latex';
import { cardStyle, FS, RADIUS, FONT } from '../../../Principal/Constantes';
import StatLabel from '../../../ui/StatLabel';
import '../../../styles/Temas/Tema4.css';

export default function Resultados_ChiCuadrada({ resultados }) {
    if (!resultados || resultados.probFinal === undefined) return null;

    const getMathProbFinal = (cond) => {
        if (cond === 'mayor_que') {
            return "P(S^2 \\ge x) = 1 - P(\\chi^2 \\le \\chi^2_0)";
        }
        if (cond === 'entre') {
            return "P(x_1 \\le S^2 \\le x_2) = P(\\chi^2 \\le \\chi^2_2) - P(\\chi^2 \\le \\chi^2_1)";
        }
        return "P(S^2 \\le x) = P(\\chi^2 \\le \\chi^2_0)";
    };

    return (
        <div style={{ ...cardStyle, background: 'var(--bg-card)', height: '100%', display: 'flex', flexDirection: 'column', border: 'none', boxShadow: 'none', padding: 0, fontFamily: FONT, color: 'var(--text-pure)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div 
                        className="tema4-tarjeta-titulo-unificado"
                        style={{ marginBottom: '12px', color: 'var(--text-pure)', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                    >
                        <span>Cálculo y Probabilidad Chi-Cuadrada</span>
                        <StatLabel
                            formulaKey="chi2_transformacion"
                            formulaLatex="\chi^2"
                            customTexto="Transformación a Chi-Cuadrada"
                            customMath="\chi^2 = \frac{(n - 1)S^2}{\sigma^2}, \quad v = n - 1"
                            align="center"
                        />
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
                                formulaKey="P_s2_condicion"
                                formulaLatex="P(S^2)"
                                customTexto="Cálculo de Probabilidad Chi-Cuadrado"
                                customMath={getMathProbFinal(resultados.condicion)}
                                align="center"
                            />
                        </div>
                        <div 
                            className="formula-responsive formula-bold" 
                            style={{ 
                                color: 'var(--text-pure)', 
                                fontWeight: 'bold', 
                                fontSize: '1.25rem',
                                lineHeight: 1.2, 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                marginTop: '4px'
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
