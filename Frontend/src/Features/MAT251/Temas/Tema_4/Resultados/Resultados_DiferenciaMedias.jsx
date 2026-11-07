import React, { useState } from 'react';
import { cardStyle, FS, RADIUS, FONT } from '../../../Principal/Constantes';
import Latex from '../../../../../components/excel/Latex';
import ModalTablaNormalZ from '../../Tema_3/Modales/ModalTablaNormalZ';
import StatLabel from '../../../ui/StatLabel';
import '../../../styles/Temas/Tema3.css';
import '../../../styles/Temas/Tema4.css';

export default function Resultados_DiferenciaMedias({ resultados }) {
    const [modalTablaZ, setModalTablaZ] = useState({ isOpen: false, z: 0 });

    if (!resultados || resultados.probFinal === undefined) return null;

    let z1Val = typeof resultados.z1 === 'number' && !isNaN(resultados.z1) ? resultados.z1 : null;
    let z2Val = typeof resultados.z2 === 'number' && !isNaN(resultados.z2) ? resultados.z2 : null;

    if (z1Val === null && resultados.strDesarrollo) {
        const matches = [...resultados.strDesarrollo.matchAll(/P\(\s*Z\s*(?:\\le|\\ge|<=|>=|<|>)\s*([-\d.,{}]+)\s*\)/gi)];
        if (matches.length > 0) z1Val = parseFloat(matches[0][1].replace(/[{}]/g, '').replace(',', '.'));
        if (matches.length > 1) z2Val = parseFloat(matches[1][1].replace(/[{}]/g, '').replace(',', '.'));
    }

    if (z1Val === null && resultados.x1 !== undefined && (resultados.esperanza !== undefined || resultados.p !== undefined) && resultados.se) {
        const esp = resultados.esperanza !== undefined ? resultados.esperanza : resultados.p;
        z1Val = (parseFloat(resultados.x1) - parseFloat(esp)) / parseFloat(resultados.se);
    }
    if (z2Val === null && resultados.x2 !== undefined && (resultados.esperanza !== undefined || resultados.p !== undefined) && resultados.se) {
        const esp = resultados.esperanza !== undefined ? resultados.esperanza : resultados.p;
        z2Val = (parseFloat(resultados.x2) - parseFloat(esp)) / parseFloat(resultados.se);
    }

    z1Val = z1Val !== null && !isNaN(z1Val) ? z1Val : 0;
    z2Val = z2Val !== null && !isNaN(z2Val) ? z2Val : 0;

    const getMathProbFinal = (cond) => {
        if (cond === 'mayor_que') {
            return "P(\\bar{X}_1 - \\bar{X}_2 \\ge x) = 1 - P(Z \\le z)";
        }
        if (cond === 'entre') {
            return "P(x_1 \\le \\bar{X}_1 - \\bar{X}_2 \\le x_2) = P(Z \\le z_2) - P(Z \\le z_1)";
        }
        return "P(\\bar{X}_1 - \\bar{X}_2 \\le x) = P(Z \\le z)";
    };

    return (
        <div style={{ ...cardStyle, background: 'var(--bg-card)', height: '100%', display: 'flex', flexDirection: 'column', border: 'none', boxShadow: 'none', padding: 0, fontFamily: FONT, color: 'var(--text-pure)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div 
                        className="tema4-tarjeta-titulo-unificado"
                        style={{ marginBottom: '12px', color: 'var(--text-pure)', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                    >
                        <span>Estandarización</span>
                        <StatLabel
                            formulaKey="Z_dif_medias"
                            formulaLatex="Z"
                            customTexto="Estandarización de la Diferencia de Medias"
                            customMath="Z = \frac{(\bar{X}_1 - \bar{X}_2) - (\mu_1 - \mu_2)}{\sqrt{\frac{\sigma_1^2}{n_1} + \frac{\sigma_2^2}{n_2}}}"
                            align="center"
                        />
                        <span>y Probabilidad</span>
                    </div>
                    <div className="thin-scrollbar formula-responsive" style={{ overflowX: 'auto', paddingBottom: '10px', color: 'var(--text-pure)' }}>
                        <Latex formula={resultados.strDesarrollo} />
                    </div>

                    {/* Botón para ver en Tabla Z */}
                    {resultados.condicion === 'entre' ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '6px' }}>
                            <button
                                type="button"
                                onClick={() => setModalTablaZ({ isOpen: true, z: z1Val })}
                                className="btn-abrir-tabla-z"
                                title="Abrir la tabla Z interactiva para ver cómo se localiza este valor"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                <span>Ver z₁ = {z1Val.toFixed(4)} en Tabla Z</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalTablaZ({ isOpen: true, z: z2Val })}
                                className="btn-abrir-tabla-z"
                                title="Abrir la tabla Z interactiva para ver cómo se localiza este valor"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                <span>Ver z₂ = {z2Val.toFixed(4)} en Tabla Z</span>
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
                            <button
                                type="button"
                                onClick={() => setModalTablaZ({ isOpen: true, z: z1Val })}
                                className="btn-abrir-tabla-z"
                                title="Abrir la tabla Z interactiva para ver cómo se localiza este valor"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                <span>Ver lectura en Tabla Z (z = {z1Val.toFixed(4)})</span>
                            </button>
                        </div>
                    )}

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
                                customTexto="Cálculo de Probabilidad Normal Estándar"
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

            <ModalTablaNormalZ
                isOpen={modalTablaZ.isOpen}
                onClose={() => setModalTablaZ({ isOpen: false, z: 0 })}
                zInicial={modalTablaZ.z}
            />
        </div>
    );
}
