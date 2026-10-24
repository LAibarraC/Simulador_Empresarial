import React, { useRef, useState, useCallback, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { glosarioMAT251 } from '../utils/diccionario';

/**
 * Componente StatLabel para MAT251
 * Muestra una etiqueta con fórmula KaTeX y un tooltip interactivo
 * con la definición pedagógica y su fórmula matemática correspondiente.
 * Incluye auto-posicionamiento inteligente para respetar los bordes de la pantalla.
 */
export default function StatLabel({ formulaKey, formulaLatex, labelText, align = 'center', position = 'bottom', customTexto, customMath, className = '', soloFormula = false }) {
    const info = glosarioMAT251[formulaKey] || { texto: formulaKey, math: '' };
    const textoFinal = customTexto || info.texto;
    const mathFinal = customMath !== undefined ? customMath : info.math;

    const containerRef = useRef(null);
    const tooltipRef = useRef(null);
    const [positionStyle, setPositionStyle] = useState({});

    const updatePosition = useCallback(() => {
        const container = containerRef.current;
        const tooltip = tooltipRef.current;
        if (!container || !tooltip) return;

        const prevDisplay = tooltip.style.display;
        const prevVisibility = tooltip.style.visibility;

        const isHidden = window.getComputedStyle(tooltip).display === 'none';
        if (isHidden) {
            tooltip.style.visibility = 'hidden';
            tooltip.style.display = 'flex';
        }

        const containerRect = container.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const tooltipWidth = tooltipRect.width;
        const scrollTable = container.closest('.tema5-tabla-resolucion-scroll, .hnp-frecuencias-esperadas-scroll, .minitab-table-scroll, .rachas-ext-table-scroll, .mat251-experimentos-formula-universo');
        const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
        const padding = 10; // Margen de seguridad respecto al borde de la pantalla o contenedor

        // Determinar límites visibles considerando también contenedores ancestros con overflow (scroll/clipping)
        let boundaryRight = viewportWidth - padding;
        let boundaryLeft = padding;

        let el = container.parentElement;
        while (el && el !== document.body && el !== document.documentElement) {
                if (scrollTable && el === scrollTable) {
                    el = el.parentElement;
                    continue;
                }
            const style = window.getComputedStyle(el);
            const ox = style.overflowX;
            const oy = style.overflowY;
            const o = style.overflow;
            const hasClipping = ['auto', 'hidden', 'scroll'].includes(ox) || 
                                ['auto', 'hidden', 'scroll'].includes(oy) || 
                                ['auto', 'hidden', 'scroll'].includes(o);
            if (hasClipping) {
                const elRect = el.getBoundingClientRect();
                if (elRect.width > 0) {
                    boundaryRight = Math.min(boundaryRight, elRect.right - padding);
                    boundaryLeft = Math.max(boundaryLeft, elRect.left + padding);
                }
            }
            el = el.parentElement;
        }

        if (tooltipWidth > 0 && boundaryRight > boundaryLeft) {
            const containerCenterX = containerRect.left + containerRect.width / 2;
            const idealLeft = containerCenterX - tooltipWidth / 2;
            const idealRight = idealLeft + tooltipWidth;

            let shiftX = 0;

            // Si sobrepasa el borde derecho del contenedor visible, desplazar hacia la izquierda
            if (idealRight > boundaryRight) {
                shiftX = boundaryRight - idealRight;
            }

            // Si sobrepasa el borde izquierdo del contenedor visible, desplazar a la derecha
            if (idealLeft + shiftX < boundaryLeft) {
                shiftX = boundaryLeft - idealLeft;
            }

            // La flecha indicadora siempre debe apuntar al centro del contenedor del símbolo
            const targetArrowPos = (tooltipWidth / 2) - shiftX;
            const arrowPos = Math.max(14, Math.min(tooltipWidth - 14, targetArrowPos));

            const shiftVal = `${Math.round(shiftX)}px`;
            const arrowVal = shiftX === 0 ? '50%' : `${Math.round(arrowPos)}px`;

            tooltip.style.setProperty('--tooltip-shift', shiftVal);
            tooltip.style.setProperty('--arrow-left', arrowVal);
            const nextPositionStyle = {
                '--tooltip-shift': shiftVal,
                '--arrow-left': arrowVal
            };

            if (scrollTable) {
                const tooltipLeft = containerCenterX + shiftX;
                const tooltipTop = position === 'top'
                    ? containerRect.top - tooltipRect.height - 8
                    : containerRect.bottom + 8;
                Object.assign(nextPositionStyle, {
                    position: 'fixed',
                    left: `${Math.round(tooltipLeft)}px`,
                    top: `${Math.round(tooltipTop)}px`,
                    bottom: 'auto',
                    transform: 'translateX(-50%)'
                });
                tooltip.style.position = 'fixed';
                tooltip.style.left = nextPositionStyle.left;
                tooltip.style.top = nextPositionStyle.top;
                tooltip.style.bottom = 'auto';
                tooltip.style.transform = nextPositionStyle.transform;
            }

            setPositionStyle(nextPositionStyle);
        }

        if (isHidden) {
            tooltip.style.display = prevDisplay;
            tooltip.style.visibility = prevVisibility;
        }
    }, [position]);

    useEffect(() => {
        const timer = setTimeout(updatePosition, 50);
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [updatePosition, formulaKey, formulaLatex]);

    const renderKatex = (formula) => {
        if (!formula) return null;
        try {
            return (
                <span
                    dangerouslySetInnerHTML={{
                        __html: katex.renderToString(formula, { throwOnError: false })
                    }}
                />
            );
        } catch {
            return <span>{formula}</span>;
        }
    };

    return (
        <span
            ref={containerRef}
            className={`mat251-stat-label-container ${className}`.trim()}
            style={labelText !== undefined ? { textDecoration: 'none' } : undefined}
            onMouseEnter={updatePosition}
            onTouchStart={updatePosition}
            onPointerDown={updatePosition}
            onFocus={updatePosition}
            onClick={updatePosition}
        >
            {labelText ?? renderKatex(formulaLatex || formulaKey)}
            <div
                ref={tooltipRef}
                className={`mat251-stat-tooltip mat251-tooltip-${align} ${position === 'top' ? 'mat251-tooltip-top' : ''}`}
                style={{
                    width: 'max-content',
                    maxWidth: 'min(92vw, 450px)',
                    boxSizing: 'border-box',
                    ...positionStyle
                }}
            >
                <style>{`
                    .mat251-stat-tooltip .mat251-tooltip-math,
                    .mat251-stat-tooltip .mat251-tooltip-math *,
                    .mat251-stat-tooltip .mat251-tooltip-math .katex,
                    .mat251-stat-tooltip .mat251-tooltip-math .katex * {
                        color: #fbbf24 !important;
                    }
                    .mat251-stat-tooltip .mat251-tooltip-text {
                        color: #ffffff !important;
                    }
                `}</style>
                {!soloFormula && <span className="mat251-tooltip-text" style={{ color: '#ffffff' }}>{textoFinal}</span>}
                {mathFinal && (
                    <div className="mat251-tooltip-math" style={{ whiteSpace: 'nowrap', color: '#fbbf24' }}>
                        {renderKatex(mathFinal)}
                    </div>
                )}
            </div>
        </span>
    );
}
