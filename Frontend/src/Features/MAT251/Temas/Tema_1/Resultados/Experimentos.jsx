import React from 'react';

/**
 * Componente DadoSVG
 * Dibuja un dado dinámico en SVG dependiendo del valor.
 * @param {number|string} valor - El valor del dado (1 al 6). Si es 'girando...' u otro texto, por defecto dibuja el 6 o un estado vacío.
 */
export const DadoSVG = ({ valor }) => {
    const val = parseInt(valor) || 6; // Por defecto 6
    const fill = "currentColor";
    const bgRect = <rect x="2" y="2" width="96" height="96" rx="15" ry="15" fill="var(--bg-card)" stroke="var(--border-color)" strokeWidth="4" />;

    // Cara del 1 (Punto central rojo y más grande)
    if (val === 1) return (
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', color: 'var(--text-color)' }}>
            {bgRect}
            <circle cx="50" cy="50" r="14" fill="#ef4444" /> {/* Punto central rojo */}
        </svg>
    );

    // Cara del 2
    if (val === 2) return (
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', color: 'var(--text-color)' }}>
            {bgRect}
            <circle cx="25" cy="25" r="10" fill={fill} /> {/* Arriba Izquierda */}
            <circle cx="75" cy="75" r="10" fill={fill} /> {/* Abajo Derecha */}
        </svg>
    );

    // Cara del 3
    if (val === 3) return (
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', color: 'var(--text-color)' }}>
            {bgRect}
            <circle cx="25" cy="25" r="10" fill={fill} /> {/* Arriba Izquierda */}
            <circle cx="50" cy="50" r="10" fill={fill} /> {/* Centro */}
            <circle cx="75" cy="75" r="10" fill={fill} /> {/* Abajo Derecha */}
        </svg>
    );

    // Cara del 4
    if (val === 4) return (
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', color: 'var(--text-color)' }}>
            {bgRect}
            <circle cx="25" cy="25" r="10" fill={fill} /> {/* Arriba Izquierda */}
            <circle cx="75" cy="25" r="10" fill={fill} /> {/* Arriba Derecha */}
            <circle cx="25" cy="75" r="10" fill={fill} /> {/* Abajo Izquierda */}
            <circle cx="75" cy="75" r="10" fill={fill} /> {/* Abajo Derecha */}
        </svg>
    );

    // Cara del 5
    if (val === 5) return (
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', color: 'var(--text-color)' }}>
            {bgRect}
            <circle cx="25" cy="25" r="10" fill={fill} /> {/* Arriba Izquierda */}
            <circle cx="75" cy="25" r="10" fill={fill} /> {/* Arriba Derecha */}
            <circle cx="50" cy="50" r="10" fill={fill} /> {/* Centro */}
            <circle cx="25" cy="75" r="10" fill={fill} /> {/* Abajo Izquierda */}
            <circle cx="75" cy="75" r="10" fill={fill} /> {/* Abajo Derecha */}
        </svg>
    );

    // Cara del 6 (Por defecto)
    return (
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', color: 'var(--text-color)' }}>
            {bgRect}
            <circle cx="25" cy="25" r="10" fill={fill} /> {/* Arriba Izquierda */}
            <circle cx="75" cy="25" r="10" fill={fill} /> {/* Arriba Derecha */}
            <circle cx="25" cy="50" r="10" fill={fill} /> {/* Medio Izquierda */}
            <circle cx="75" cy="50" r="10" fill={fill} /> {/* Medio Derecha */}
            <circle cx="25" cy="75" r="10" fill={fill} /> {/* Abajo Izquierda */}
            <circle cx="75" cy="75" r="10" fill={fill} /> {/* Abajo Derecha */}
        </svg>
    );
};

export const MonedaSVG = ({ valor }) => {
    const isCara = valor === 'cara';
    // Si no es cara ni cruz (ej. girando...), podemos mostrar la cara por defecto o un círculo vacío.
    const showCara = isCara || valor !== 'cruz';

    return showCara ? (
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <circle cx="50" cy="50" r="46" fill="#fbbf24" stroke="#d97706" strokeWidth="6" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="4 4" />
            <text x="50" y="56" fontFamily="sans-serif" fontSize="22" fontWeight="900" fill="#78350f" textAnchor="middle">CARA</text>
            <path d="M30 75 Q50 65 70 75" fill="none" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
        </svg>
    ) : (
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <circle cx="50" cy="50" r="46" fill="#94a3b8" stroke="#475569" strokeWidth="6" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />
            <text x="50" y="56" fontFamily="sans-serif" fontSize="22" fontWeight="900" fill="#0f172a" textAnchor="middle">CRUZ</text>
            <path d="M40 70 L60 80 M60 70 L40 80" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
};

export const CartaSVG = ({ valor }) => {
    // Si no hay valor o está girando, mostramos el reverso de la carta
    if (!valor || valor === 'girando...') {
        return (
            <svg viewBox="0 0 100 140" style={{ height: '100%', maxWidth: '100%', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }}>
                <rect x="2" y="2" width="96" height="136" rx="8" ry="8" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
                <rect x="8" y="8" width="84" height="124" rx="4" ry="4" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" />
                <circle cx="50" cy="70" r="20" fill="none" stroke="#64748b" strokeWidth="2" />
                <path d="M36 56 L64 84 M36 84 L64 56" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
            </svg>
        );
    }

    const partes = valor.split(' ');
    const rango = partes[0];
    const palo = valor.includes('corazones') ? '♥' : valor.includes('diamantes') ? '♦' : valor.includes('treboles') ? '♣' : '♠';
    const isRed = palo === '♥' || palo === '♦';
    const color = isRed ? '#ef4444' : '#1e293b';

    return (
        <svg viewBox="0 0 100 140" style={{ height: '100%', maxWidth: '100%', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>
            {/* Fondo de la carta */}
            <rect x="2" y="2" width="96" height="136" rx="8" ry="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />
            
            {/* Esquina superior izquierda */}
            <text x="16" y="28" fontFamily="sans-serif" fontSize="22" fontWeight="bold" fill={color} textAnchor="middle">{rango}</text>
            <text x="16" y="48" fontFamily="sans-serif" fontSize="22" fill={color} textAnchor="middle">{palo}</text>

            {/* Símbolo gigante en el centro */}
            <text x="50" y="85" fontFamily="sans-serif" fontSize="56" fill={color} textAnchor="middle">{palo}</text>

            {/* Esquina inferior derecha (Rotada 180 grados) */}
            <g transform="translate(84, 112) rotate(180)">
                <text x="0" y="0" fontFamily="sans-serif" fontSize="22" fontWeight="bold" fill={color} textAnchor="middle">{rango}</text>
                <text x="0" y="20" fontFamily="sans-serif" fontSize="22" fill={color} textAnchor="middle">{palo}</text>
            </g>
        </svg>
    );
};
