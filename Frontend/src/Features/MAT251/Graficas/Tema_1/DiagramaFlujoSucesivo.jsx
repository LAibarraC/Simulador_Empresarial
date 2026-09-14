import React from 'react';
import { FONT } from '../../Principal/Constantes';
import katex from 'katex';

export default function DiagramaFlujoSucesivo({ resultado, modReemplazo }) {
    if (!resultado) return null;
    
    const strokeColor = "var(--primary-color, #3b82f6)";
    const boxBg = "var(--bg-input, #eff6ff)";
    const textColor = "var(--text-main, #1e293b)";

    const isManual = resultado.isManualDinamic;
    const events = isManual ? resultado.events : [
        { name: resultado.nameA, pVal: resultado.pA, count: resultado.countA, total: resultado.totalA },
        { name: resultado.nameB, pVal: resultado.pB, count: resultado.countB, total: resultado.totalB }
    ];

    const numBoxes = events.length;
    // Base width: 100 for Total box, + (110 arrow + 130 box) per event = 240 * numBoxes + 50 margin
    const svgWidth = 120 + (numBoxes * 240);
    const svgHeight = 170; // Aumentado ligeramente para dar espacio a la píldora inferior

    const intersectionLatex = events.map((_, i) => String.fromCharCode(65+i)).join('\\cap ');

    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%" style={{ maxWidth: `${svgWidth}px`, fontFamily: FONT }}>
                {/* Caja Inicial */}
                <foreignObject x="10" y="35" width="100" height="60">
                    <div xmlns="http://www.w3.org/1999/xhtml" style={{
                        width: '100%', height: '100%', background: boxBg, border: `2px solid ${strokeColor}`, borderRadius: '8px',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4px', boxSizing: 'border-box'
                    }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: textColor }}>Total</div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: strokeColor }}>
                            {(!isManual && resultado.totalA !== '-') ? `N = ${resultado.totalA}` : 'N = 100%'}
                        </div>
                    </div>
                </foreignObject>

                {events.map((ev, i) => {
                    const startX = 110 + (i * 240);
                    const boxX = startX + 110;
                    
                    let letter = String.fromCharCode(65 + i);
                    let latexExtText = `\\text{Extr. ${i+1}} \\ (${letter})`;
                    let latexProb = `P(${letter})`;
                    
                    if (modReemplazo === 'sin_reemplazo' && i > 0) {
                        let prevLetters = Array.from({length: i}, (_, idx) => String.fromCharCode(65 + idx)).join('');
                        latexProb = `P(${letter}|${prevLetters})`;
                    }

                    const probVal = isManual ? ev.prob : ev.pVal;
                    const countStr = isManual ? `P = ${probVal.toFixed(4)}` : (ev.count === '-' ? `P = ${probVal.toFixed(4)}` : `n = ${ev.count}${i > 0 ? ` / ${ev.total}` : ''}`);

                    return (
                        <g key={i}>
                            {/* Flecha y Textos con KaTeX centrados con foreignObject */}
                            
                            {/* Texto Superior a la Flecha */}
                            <foreignObject x={startX} y="25" width="110" height="35">
                                <div xmlns="http://www.w3.org/1999/xhtml" style={{ textAlign: 'center', fontSize: '12px', color: textColor, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '100%' }}>
                                    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(latexExtText) }} />
                                </div>
                            </foreignObject>
                            
                            {/* Flecha principal al medio (y = 65) */}
                            <line x1={startX} y1="65" x2={boxX - 5} y2="65" stroke={strokeColor} strokeWidth="2" markerEnd="url(#arrow)" />
                            
                            {/* Texto Inferior a la Flecha */}
                            <foreignObject x={startX - 15} y="70" width="140" height="35">
                                <div xmlns="http://www.w3.org/1999/xhtml" style={{ textAlign: 'center', fontSize: '13px', color: textColor, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', height: '100%' }}>
                                    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(`${latexProb} = ${probVal.toFixed(4)}`) }} />
                                </div>
                            </foreignObject>

                            {/* Caja de Evento */}
                            <foreignObject x={boxX} y="35" width="130" height="60">
                                <div xmlns="http://www.w3.org/1999/xhtml" style={{
                                    width: '100%', height: '100%', background: boxBg, border: `2px solid ${strokeColor}`, borderRadius: '8px',
                                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4px 8px', boxSizing: 'border-box'
                                }}>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }} title={ev.name}>
                                        {ev.name}
                                    </div>
                                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: strokeColor }}>
                                        {countStr}
                                    </div>
                                </div>
                            </foreignObject>
                        </g>
                    );
                })}

                {/* Resultado Final Intersección Píldora */}
                <foreignObject x="0" y="120" width={svgWidth} height="40">
                    <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ padding: '6px 20px', background: 'var(--bg-input, rgba(16, 185, 129, 0.1))', border: '1.5px solid var(--border-color, #10b981)', borderRadius: '20px', fontSize: '14px', color: 'var(--text-main, #047857)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span dangerouslySetInnerHTML={{ __html: katex.renderToString(`P(${intersectionLatex}) = ${resultado.pAandB.toFixed(4)}`) }} />
                            <span style={{ fontWeight: 'bold' }}>({(resultado.pAandB * 100).toFixed(1)}%)</span>
                        </div>
                    </div>
                </foreignObject>

                {/* Flechas definition */}
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill={strokeColor} />
                    </marker>
                </defs>
            </svg>
        </div>
    );
}

