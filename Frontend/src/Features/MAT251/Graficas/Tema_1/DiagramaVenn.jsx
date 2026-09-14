import React from 'react';
import { FONT } from '../../Principal/Constantes';
import katex from 'katex';

export default function DiagramaVenn({ resultado }) {
    if (!resultado) return null;

    const { pA, pB, pAandB, pAorB, nameA, nameB } = resultado;

    // Colores
    const unionFill = "rgba(16, 185, 129, 0.25)"; // Verde suave
    const unionStroke = "#059669";
    const circleStroke = "#94a3b8";
    const textColor = "var(--text-main, #1e293b)";

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 400 270" width="100%" height="100%" style={{ display: 'block', maxWidth: '700px', fontFamily: FONT, flex: 1, minHeight: 0 }}>
                {/* LEYENDA SUPERIOR */}
                <foreignObject x="0" y="10" width="400" height="40">
                    <div xmlns="http://www.w3.org/1999/xhtml" style={{ textAlign: 'center', fontSize: '16px', fontWeight: 'bold', color: unionStroke }}>
                        Área de la Unión: <span dangerouslySetInnerHTML={{ __html: katex.renderToString(`P(A \\cup B) = ${pAorB.toFixed(4)}`) }} />
                    </div>
                </foreignObject>

                {/* MÁSCARA PARA RELLENO UNIFORME DE LA UNIÓN */}
                <defs>
                    <mask id="maskUnion">
                        <circle cx="150" cy="160" r="95" fill="white" />
                        <circle cx="250" cy="160" r="95" fill="white" />
                    </mask>
                </defs>

                {/* RELLENO DE LA UNIÓN */}
                <rect x="0" y="0" width="400" height="300" fill={unionFill} mask="url(#maskUnion)" />

                {/* BORDES DE LOS CÍRCULOS */}
                <circle cx="150" cy="160" r="95" fill="none" stroke={unionStroke} strokeWidth="2.5" />
                <circle cx="250" cy="160" r="95" fill="none" stroke={unionStroke} strokeWidth="2.5" />

                {/* ETIQUETAS A */}
                <foreignObject x="35" y="125" width="100" height="40">
                    <div xmlns="http://www.w3.org/1999/xhtml" style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: textColor }}>
                        <span dangerouslySetInnerHTML={{ __html: katex.renderToString('A') }} />
                    </div>
                </foreignObject>
                <text x="85" y="172" textAnchor="middle" fontSize="14" fill={textColor}>{(pA - pAandB).toFixed(4)}</text>
                
                {/* ETIQUETAS B */}
                <foreignObject x="265" y="125" width="100" height="40">
                    <div xmlns="http://www.w3.org/1999/xhtml" style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: textColor }}>
                        <span dangerouslySetInnerHTML={{ __html: katex.renderToString('B') }} />
                    </div>
                </foreignObject>
                <text x="315" y="172" textAnchor="middle" fontSize="14" fill={textColor}>{(pB - pAandB).toFixed(4)}</text>
                
                {/* ETIQUETA INTERSECCIÓN (A ∩ B) */}
                <text x="200" y="165" textAnchor="middle" fontSize="16" fontWeight="bold" fill={textColor}>
                    {pAandB.toFixed(4)}
                </text>
            </svg>

            {/* LEYENDAS INFERIORES (FLEXBOX) */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                width: '100%', 
                maxWidth: '700px', 
                gap: '20px', 
                marginTop: '10px',
                fontFamily: FONT,
                fontSize: '13px',
                color: textColor
            }}>
                <div 
                    title={`A: ${nameA}`}
                    style={{ 
                        flex: 1, 
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: 600,
                        padding: '6px 12px',
                        background: 'var(--bg-input, #f8fafc)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color, #e2e8f0)'
                    }}
                >
                    <span dangerouslySetInnerHTML={{ __html: katex.renderToString('A') }} />: {nameA}
                </div>
                <div 
                    title={`B: ${nameB}`}
                    style={{ 
                        flex: 1, 
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: 600,
                        padding: '6px 12px',
                        background: 'var(--bg-input, #f8fafc)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color, #e2e8f0)'
                    }}
                >
                    <span dangerouslySetInnerHTML={{ __html: katex.renderToString('B') }} />: {nameB}
                </div>
            </div>
        </div>
    );
}

