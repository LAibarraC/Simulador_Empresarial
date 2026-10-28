import React from 'react';
import { cardStyle, RADIUS, FONT } from '../../../Principal/Constantes';
import Latex from '../../../../../components/excel/Latex';
import StatLabel from '../../../ui/StatLabel';
import '../../../styles/Temas/Tema4.css';

export default function Resultados_DiferenciaMediasDesconocidas({ resultados }) {
    if (!resultados || resultados.probFinal === undefined) return null;

    const getMathProbFinal = (cond, statType) => {
        const symbol = statType === 'T' ? 'T' : 'Z';
        if (cond === 'mayor_que') {
            return `P(\\bar{X}_1 - \\bar{X}_2 \\ge x) = 1 - P(${symbol} \\le ${symbol.toLowerCase()}_0)`;
        }
        if (cond === 'entre') {
            return `P(x_1 \\le \\bar{X}_1 - \\bar{X}_2 \\le x_2) = P(${symbol} \\le ${symbol.toLowerCase()}_2) - P(${symbol} \\le ${symbol.toLowerCase()}_1)`;
        }
        return `P(\\bar{X}_1 - \\bar{X}_2 \\le x) = P(${symbol} \\le ${symbol.toLowerCase()}_0)`;
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
                            formulaKey={resultados.statType === 'T' ? "TStudent" : "Z_dif_medias"}
                            formulaLatex={resultados.statType === 'T' ? "T" : "Z"}
                            customTexto={resultados.statType === 'T' ? "Estandarización t-Student para Diferencia de Medias" : "Estandarización Z para Diferencia de Medias"}
                            customMath={resultados.formulaLaTeX || (resultados.statType === 'T' ? "T = \\frac{(\\bar{X}_1 - \\bar{X}_2) - (\\mu_1 - \\mu_2)}{S_p \\sqrt{\\frac{1}{n_1} + \\frac{1}{n_2}}}" : "Z = \\frac{(\\bar{X}_1 - \\bar{X}_2) - (\\mu_1 - \\mu_2)}{\\sqrt{\\frac{S_1^2}{n_1} + \\frac{S_2^2}{n_2}}}")}
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
                                formulaKey="P_dif_medias_final"
                                formulaLatex="P(\bar{X}_1 - \bar{X}_2)"
                                customTexto={`Cálculo de Probabilidad ${resultados.statType === 'T' ? 't-Student' : 'Normal Estándar'}`}
                                customMath={getMathProbFinal(resultados.condicion, resultados.statType)}
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
