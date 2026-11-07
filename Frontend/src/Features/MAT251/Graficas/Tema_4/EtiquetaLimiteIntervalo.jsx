import React, { useEffect, useRef, useState } from 'react';
import katex from 'katex';

const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));

export default function EtiquetaLimiteIntervalo({
    viewBox,
    value,
    side = 'center',
    offsetY = -4,
    offsetX = 0,
    showGuideLine = false,
}) {
    const groupRef = useRef(null);
    const [svgWidth, setSvgWidth] = useState(0);

    useEffect(() => {
        const svg = groupRef.current?.ownerSVGElement;
        if (!svg) return undefined;

        const measure = () => {
            const width = svg.viewBox?.baseVal?.width || svg.clientWidth || 0;
            setSvgWidth(width);
        };

        measure();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(measure);
        observer.observe(svg);
        return () => observer.disconnect();
    }, []);

    if (!viewBox || !Number.isFinite(viewBox.x) || !Number.isFinite(viewBox.y)) return null;

    const { x, y } = viewBox;
    const width = side === 'center' ? 120 : 80;
    const rawX = side === 'left'
        ? x - width
        : side === 'right'
            ? x
            : x - width / 2 + offsetX;
    const labelX = svgWidth ? clamp(rawX, 4, svgWidth - width - 4) : rawX;
    const labelY = Math.max(2, y - 28 + offsetY);
    const textAlign = side === 'left' ? 'right' : side === 'right' ? 'left' : 'center';
    const justifyContent = side === 'left' ? 'flex-end' : side === 'right' ? 'flex-start' : 'center';

    return (
        <g ref={groupRef} style={{ pointerEvents: 'none' }}>
            {showGuideLine && labelY < y - 10 && (
                <line
                    x1={x}
                    y1={y}
                    x2={x}
                    y2={labelY + 26}
                    stroke="#f97316"
                    strokeWidth={3}
                    strokeDasharray="4 4"
                />
            )}
            <foreignObject x={labelX} y={labelY} width={width} height={28} style={{ overflow: 'visible' }}>
                <div
                    className="tema4-etiqueta-limite"
                    dangerouslySetInnerHTML={{ __html: katex.renderToString(value, { throwOnError: false }) }}
                    style={{
                        color: 'var(--text-pure)',
                        fontSize: side === 'center' ? '12px' : '10px',
                        fontWeight: 'bold',
                        textAlign,
                        display: 'flex',
                        justifyContent,
                        alignItems: 'center',
                        height: '100%',
                        whiteSpace: 'nowrap',
                    }}
                />
            </foreignObject>
        </g>
    );
}
