import React from 'react';
import { FONT } from '../Principal/Constantes';

export default function DiagramaFlujoMuestreo({ N, n, metodo }) {
    const strokeColor = "#3b82f6"; // blue
    const boxBg = "#eff6ff";
    const textColor = "#1e293b";

    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
            <svg viewBox="0 0 600 150" width="100%" height="150" style={{ maxWidth: '600px', fontFamily: FONT }}>
                {/* Poblacion */}
                <rect x="20" y="25" width="140" height="100" rx="8" fill={boxBg} stroke={strokeColor} strokeWidth="2" />
                <text x="90" y="65" textAnchor="middle" fontSize="14" fill={textColor} fontWeight="bold">Población (N)</text>
                <text x="90" y="85" textAnchor="middle" fontSize="16" fill={strokeColor} fontWeight="bold">{N}</text>

                {/* Flecha central */}
                <line x1="160" y1="75" x2="420" y2="75" stroke={strokeColor} strokeWidth="3" markerEnd="url(#arrow-muestreo)" />
                <text x="290" y="60" textAnchor="middle" fontSize="12" fill={textColor} fontWeight="bold">
                    {metodo === 'mas' ? 'Muestreo Aleatorio Simple' : 'Muestreo Estratificado'}
                </text>

                {/* Muestra */}
                <rect x="420" y="45" width="120" height="60" rx="8" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" />
                <text x="480" y="70" textAnchor="middle" fontSize="14" fill={textColor} fontWeight="bold">Muestra (n)</text>
                <text x="480" y="90" textAnchor="middle" fontSize="16" fill="#10b981" fontWeight="bold">{n}</text>

                <defs>
                    <marker id="arrow-muestreo" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill={strokeColor} />
                    </marker>
                </defs>
            </svg>
        </div>
    );
}
