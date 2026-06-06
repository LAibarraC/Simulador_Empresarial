import React from 'react';
import { FONT } from '../Principal/Constantes';

export default function DiagramaFlujoSucesivo({ resultado }) {
    if (!resultado) return null;
    const { pA, pB, pAandB, totalA, totalB, countA, countB, nameA, nameB } = resultado;

    const strokeColor = "#3b82f6"; // blue
    const boxBg = "#eff6ff";
    const textColor = "#1e293b";

    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
            <svg viewBox="0 0 600 160" width="100%" height="100%" style={{ maxWidth: '700px', fontFamily: FONT }}>
                {/* Caja Inicial */}
                <rect x="20" y="40" width="100" height="50" rx="8" fill={boxBg} stroke={strokeColor} strokeWidth="2" />
                <text x="70" y="60" textAnchor="middle" fontSize="12" fill={textColor} fontWeight="bold">Total</text>
                <text x="70" y="78" textAnchor="middle" fontSize="14" fill={strokeColor} fontWeight="bold">N = {totalA}</text>

                {/* Flecha A */}
                <line x1="120" y1="65" x2="230" y2="65" stroke={strokeColor} strokeWidth="2" markerEnd="url(#arrow)" />
                <text x="175" y="55" textAnchor="middle" fontSize="12" fill={textColor} fontWeight="bold">Extr. 1 (A)</text>
                <text x="175" y="85" textAnchor="middle" fontSize="12" fill={textColor}>P(A) = {pA.toFixed(4)}</text>

                {/* Caja A */}
                <rect x="230" y="40" width="120" height="50" rx="8" fill={boxBg} stroke={strokeColor} strokeWidth="2" />
                <text x="290" y="60" textAnchor="middle" fontSize="12" fill={textColor} fontWeight="bold">
                    {nameA.length > 15 ? nameA.substring(0, 15) + '...' : nameA}
                </text>
                <text x="290" y="78" textAnchor="middle" fontSize="12" fill={strokeColor} fontWeight="bold">n = {countA}</text>

                {/* Flecha B */}
                <line x1="350" y1="65" x2="460" y2="65" stroke={strokeColor} strokeWidth="2" markerEnd="url(#arrow)" />
                <text x="405" y="55" textAnchor="middle" fontSize="12" fill={textColor} fontWeight="bold">Extr. 2 (B|A)</text>
                <text x="405" y="85" textAnchor="middle" fontSize="12" fill={textColor}>P(B|A) = {pB.toFixed(4)}</text>

                {/* Caja B */}
                <rect x="460" y="40" width="120" height="50" rx="8" fill={boxBg} stroke={strokeColor} strokeWidth="2" />
                <text x="520" y="60" textAnchor="middle" fontSize="12" fill={textColor} fontWeight="bold">
                    {nameB.length > 15 ? nameB.substring(0, 15) + '...' : nameB}
                </text>
                <text x="520" y="78" textAnchor="middle" fontSize="12" fill={strokeColor} fontWeight="bold">
                    n = {countB} / {totalB}
                </text>

                {/* Resultado Final Intersección */}
                <rect x="180" y="115" width="240" height="35" rx="17.5" fill="rgba(16, 185, 129, 0.1)" stroke="#10b981" strokeWidth="2" />
                <text x="300" y="137" textAnchor="middle" fontSize="14" fill="#047857" fontWeight="bold">
                    P(A ∩ B) = {pAandB.toFixed(4)} ({(pAandB * 100).toFixed(1)}%)
                </text>

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
