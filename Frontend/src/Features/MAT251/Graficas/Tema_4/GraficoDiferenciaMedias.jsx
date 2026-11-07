import React, { useEffect, useMemo, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot
} from 'recharts';
import MarcoWidgetMAT251 from '../../ui/MarcoWidgetMAT251';
import { TituloGraficaFormula } from './EtiquetasKaTeX';
import ModalLimiteFueraDeGrafica from './ModalLimiteFueraDeGrafica';


const useSvgDimensions = (svgRef) => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const svg = svgRef.current?.ownerSVGElement;
        if (!svg) return undefined;

        const measure = () => {
            const viewBox = svg.viewBox?.baseVal;
            setDimensions({
                width: viewBox?.width || svg.clientWidth || 0,
                height: viewBox?.height || svg.clientHeight || 0,
            });
        };

        measure();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(measure);
        observer.observe(svg);
        return () => observer.disconnect();
    }, [svgRef]);

    return dimensions;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));

const CustomKatexLabel = (props) => {
    const { viewBox, value, offsetY = 0, offsetX = 0, labelSide = 'center', showGuideLine = false } = props;
    const svgRef = useRef(null);
    const { width: svgWidth } = useSvgDimensions(svgRef);
    if (!viewBox) return null;
    const { x, y } = viewBox;

    const labelWidth = 80;
    const rawX = labelSide === 'left'
        ? x - labelWidth
        : labelSide === 'right'
            ? x
            : x - labelWidth / 2 + offsetX;
    const labelX = svgWidth
        ? clamp(rawX, 4, svgWidth - labelWidth - 4)
        : rawX;
    const posY = Math.max(2, y - 28 + offsetY);

    return (
        <g ref={svgRef} style={{ pointerEvents: 'none' }}>
            {showGuideLine && posY < y - 10 && (
                <line
                    x1={x}
                    y1={y}
                    x2={x}
                    y2={posY + 26}
                    stroke="#f97316"
                    strokeWidth={3}
                    strokeDasharray="4 4"
                />
            )}
            <foreignObject x={labelX} y={posY} width={labelWidth} height={28} style={{ overflow: 'visible' }}>
                <div
                    className="tema4-etiqueta-limite"
                    dangerouslySetInnerHTML={{ __html: katex.renderToString(value, { throwOnError: false }) }}
                    style={{
                        color: 'var(--text-pure)',
                        fontSize: labelSide === 'center' ? '12px' : '10px',
                        fontWeight: 'bold',
                        textAlign: labelSide === 'left' ? 'right' : labelSide === 'right' ? 'left' : 'center',
                        display: 'flex',
                        justifyContent: labelSide === 'left' ? 'flex-end' : labelSide === 'right' ? 'flex-start' : 'center',
                        alignItems: 'center',
                        height: '100%',
                        whiteSpace: 'nowrap'
                    }}
                />
            </foreignObject>
        </g>
    );
};

const XAxisKatexLabel = ({ viewBox, prefix, value }) => {
    if (!viewBox) return null;
    const { x, y, width, height } = viewBox;
    const cx = x + width / 2;
    const cy = y + height - 5;
    return (
        <foreignObject x={cx - 150} y={cy - 8} width={300} height={30} style={{ overflow: 'visible', pointerEvents: 'none' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-pure)', fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap', gap: '3px' }}>
                <span>{prefix}</span>
                <span dangerouslySetInnerHTML={{ __html: katex.renderToString(value, { throwOnError: false }) }} />
            </div>
        </foreignObject>
    );
};

const YAxisKatexLabel = ({ viewBox, prefix, value }) => {
    if (!viewBox) return null;
    const { x, y, height } = viewBox;
    const cx = x + 5;
    const cy = y + height / 2;
    return (
        <foreignObject x={cx - 90} y={cy - 100} width={200} height={200} style={{ overflow: 'visible', pointerEvents: 'none' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ transform: 'rotate(-90deg)', color: 'var(--text-pure)', fontSize: '13px', fontWeight: 'bold', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <span>{prefix}</span>
                    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(value, { throwOnError: false }) }} />
                </div>
            </div>
        </foreignObject>
    );
};

const SmartAnnotation = (props) => {
    const { viewBox, value } = props;
    const svgRef = useRef(null);
    const { width: svgWidth, height: svgHeight } = useSvgDimensions(svgRef);
    if (!viewBox || viewBox.x === undefined || viewBox.y === undefined) return null;

    const cx = viewBox.x;
    const cy = viewBox.y;
    const boxWidth = 90;
    const boxHeight = 28;
    const diagonal = 35;
    const rightAvailable = !svgWidth || cx + diagonal + boxWidth + 12 <= svgWidth - 4;
    const leftAvailable = !svgWidth || cx - diagonal - boxWidth - 12 >= 4;
    const toRight = rightAvailable || !leftAvailable;
    const rawBoxX = toRight ? cx + diagonal + 12 : cx - diagonal - 12 - boxWidth;
    const boxX = svgWidth
        ? clamp(rawBoxX, 4, svgWidth - boxWidth - 4)
        : rawBoxX;
    const midX = cx + (toRight ? diagonal : -diagonal);
    const lineEndX = toRight ? boxX : boxX + boxWidth;
    const midY = svgHeight ? clamp(cy - diagonal, 18, svgHeight - 18) : cy - diagonal;
    const boxY = svgHeight
        ? clamp(midY - boxHeight / 2, 2, svgHeight - boxHeight - 2)
        : midY - boxHeight / 2;

    return (
        <g ref={svgRef} style={{ pointerEvents: 'none' }}>
            <path
                d={`M ${cx},${cy} L ${midX},${midY} L ${lineEndX},${midY}`}
                fill="none"
                stroke="var(--text-pure)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx={cx} cy={cy} r={5} fill="var(--text-pure)" />
            <foreignObject x={boxX} y={boxY} width={boxWidth} height={boxHeight} style={{ overflow: 'visible' }}>
                <div style={{
                    color: 'var(--text-pure)',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    display: 'flex',
                    justifyContent: toRight ? 'flex-start' : 'flex-end',
                    alignItems: 'center',
                    whiteSpace: 'nowrap',
                    width: '100%',
                    height: '100%',
                }}>
                    {value}
                </div>
            </foreignObject>
        </g>
    );
};

export default function GraficoDiferenciaMedias({ resultados }) {
    if (!resultados || (resultados.p === undefined && resultados.esperanza === undefined) || resultados.se === undefined) return null;

    // Aceptar 'p' (del cálculo de probabilidad) o 'esperanza' (de la generación inicial)
    const mu = resultados.p ?? resultados.esperanza;
    const { se: SE, x1, x2, condicion, probFinal } = resultados;
    const tieneProbabilidad = probFinal !== undefined;

    // Generación de datos
    const { datosGrafico, customTicks, annotationData } = useMemo(() => {
        const datos = [];
        const numPoints = 200;
        const minX = mu - 4 * SE;
        const maxX = mu + 4 * SE;
        const step = (maxX - minX) / numPoints;

        let curSegment = [];
        const segments = [];

        for (let i = 0; i <= numPoints; i++) {
            const x = minX + i * step;
            // PDF Normal
            const exponent = -0.5 * Math.pow((x - mu) / SE, 2);
            const y = (1 / (SE * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);

            let fillY = 0;
            if (tieneProbabilidad) {
                if (condicion === 'menor_que' && x <= x1) {
                    fillY = y;
                } else if (condicion === 'mayor_que' && x >= x1) {
                    fillY = y;
                } else if (condicion === 'entre' && x >= x1 && x <= x2) {
                    fillY = y;
                }
            }

            datos.push({ x, y, fillY });

            if (fillY > 0) {
                curSegment.push({ x, fillY });
            } else if (curSegment.length > 0) {
                segments.push(curSegment);
                curSegment = [];
            }
        }
        if (curSegment.length > 0) segments.push(curSegment);

        // Custom Ticks para el eje X
        let ticks = [mu - 3 * SE, mu - 2 * SE, mu - SE, mu, mu + SE, mu + 2 * SE, mu + 3 * SE];
        if (tieneProbabilidad) {
            if (condicion === 'entre') {
                ticks.push(x1, x2);
            } else if (condicion) {
                ticks.push(x1);
            }
        }

        ticks = [...new Set(ticks.map(t => Math.round(t * 1000) / 1000))].sort((a, b) => a - b);

        // Annotation Data
        const annData = segments.map(seg => {
            let sumXY = 0;
            let sumY = 0;
            for (let pt of seg) {
                sumXY += pt.x * pt.fillY;
                sumY += pt.fillY;
            }
            const centroidX = sumY > 0 ? sumXY / sumY : seg[Math.floor(seg.length / 2)].x;

            let closestY = 0;
            let minDiff = Infinity;
            for (let pt of seg) {
                const diff = Math.abs(pt.x - centroidX);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestY = pt.fillY;
                }
            }
            const yDot = Math.max(closestY / 2, 0.00001);

            return {
                x: centroidX,
                y: yDot,
                text: tieneProbabilidad ? `${(probFinal * 100).toFixed(2)}%` : ''
            };
        });

        return { datosGrafico: datos, customTicks: ticks, annotationData: annData };
    }, [mu, SE, x1, x2, condicion, probFinal, tieneProbabilidad]);

    // Detección inteligente de colisión entre etiquetas x1 y x2
    const estanCerca = useMemo(() => {
        if (!tieneProbabilidad || condicion !== 'entre') return false;
        const x1Num = parseFloat(x1);
        const x2Num = parseFloat(x2);
        if (isNaN(x1Num) || isNaN(x2Num)) return false;
        const span = 8 * SE;
        return span > 0 && Math.abs(x2Num - x1Num) / span < 0.22;
    }, [tieneProbabilidad, condicion, x1, x2, SE]);

    return (
        <MarcoWidgetMAT251 titulo={<TituloGraficaFormula antes={'Gr\u00e1fica de Densidad '} formula="f(x)" despues=" [Diferencia de Medias]" />} anchoCompleto={true} alto="450px" id="grafico-diferencia-medias">
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, minHeight: 0, width: '100%', overflow: 'hidden', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={datosGrafico} margin={{ top: 25, right: 5, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

                            <XAxis
                                dataKey="x" 
                                type="number"
                                domain={['dataMin', 'dataMax']}
                                allowDataOverflow={true}
                                ticks={customTicks}
                                padding={{ left: 20, right: 20 }}
                                tick={{ fill: 'var(--text-pure)', fontSize: 10, fontWeight: 'bold' }}
                                axisLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                tickLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                tickFormatter={(val) => Number.isInteger(val) ? val : val.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                label={<XAxisKatexLabel prefix="Diferencia de Medias " value={"(\\bar{X} - \\bar{Y})"} />}
                            />

                            <YAxis
                                padding={{ top: 20 }}
                                tick={{ fill: 'var(--text-pure)', fontSize: 10, fontWeight: 'bold' }}
                                axisLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                tickLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                tickFormatter={(val) => val === 0 ? '0' : val.toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                                label={<YAxisKatexLabel prefix="Densidad " value={"f(\\bar{X} - \\bar{Y})"} />}
                            />

                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value, name) => [value.toLocaleString('es-ES', { minimumFractionDigits: 5 }), name === 'y' ? 'f(X̄ - Ȳ)' : 'Área']}
                                labelFormatter={(label) => `X̄ - Ȳ = ${label.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 4 })}`}
                            />

                            <Area
                                type="monotone"
                                dataKey="y"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fill="transparent"
                                isAnimationActive={false}
                            />

                            {tieneProbabilidad && (
                                <Area
                                    type="monotone"
                                    dataKey="fillY"
                                    stroke="none"
                                    fill="rgba(59, 130, 246, 0.4)"
                                    isAnimationActive={false}
                                />
                            )}

                            {/* Reference Lines para Cortes con anticolisión inteligente */}
                            {tieneProbabilidad && condicion === 'entre' && (
                                <>
                                    <ReferenceLine 
                                        x={x1} 
                                        stroke="#f97316" 
                                        strokeDasharray="4 4" 
                                        strokeWidth={3} 
                                        label={
                                            <CustomKatexLabel 
                                                value={`\\boldsymbol{x_1 = ${x1}}`} 
                                                offsetY={-4} labelSide={estanCerca ? 'left' : 'center'} 
                                            />
                                        } 
                                    />
                                    <ReferenceLine 
                                        x={x2} 
                                        stroke="#f97316" 
                                        strokeDasharray="4 4" 
                                        strokeWidth={3} 
                                        label={
                                            <CustomKatexLabel 
                                                value={`\\boldsymbol{x_2 = ${x2}}`} 
                                                offsetY={-4} labelSide={estanCerca ? 'right' : 'center'} 
                                            />
                                        } 
                                    />
                                </>
                            )}
                            {tieneProbabilidad && (condicion === 'menor_que' || condicion === 'mayor_que') && (
                                <ReferenceLine x={x1} stroke="#f97316" strokeDasharray="4 4" strokeWidth={3} label={<CustomKatexLabel value={`\\boldsymbol{x = ${x1}}`} offsetY={-8} />} />
                            )}

                            {/* Anotaciones */}
                            {tieneProbabilidad && annotationData.map((ann, idx) => (
                                <ReferenceDot
                                    key={idx}
                                    x={ann.x}
                                    y={ann.y}
                                    r={0}
                                    label={<SmartAnnotation value={ann.text} />}
                                />
                            ))}

                        </AreaChart>
                    </ResponsiveContainer>
                    <ModalLimiteFueraDeGrafica
                        limites={tieneProbabilidad ? (condicion === 'entre' ? [x1, x2] : [x1]) : []}
                        datos={datosGrafico}
                        condicion={condicion}
                    />
                </div>
            </div>
        </MarcoWidgetMAT251>
    );
}
