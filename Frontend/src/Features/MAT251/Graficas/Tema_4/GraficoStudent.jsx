import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot
} from 'recharts';
import { jStat } from 'jstat';
import MarcoWidgetMAT251 from '../../ui/MarcoWidgetMAT251';
import ModalLimiteFueraDeGrafica from './ModalLimiteFueraDeGrafica';
import EtiquetaLimiteIntervalo from './EtiquetaLimiteIntervalo';

const CustomKatexLabel = (props) => {
    const { viewBox, value, offsetY = 0, offsetX = 0, showGuideLine = false } = props;
    if (!viewBox) return null;
    const { x, y } = viewBox;

    const posY = Math.max(2, y - 28 + offsetY);

    return (
        <g style={{ pointerEvents: 'none' }}>
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
            <foreignObject x={x - 60 + offsetX} y={posY} width={120} height={28} style={{ overflow: 'visible' }}>
                <div
                    className="tema4-etiqueta-limite"
                    dangerouslySetInnerHTML={{ __html: katex.renderToString(value, { throwOnError: false }) }}
                    style={{
                        color: 'var(--text-pure)',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        whiteSpace: 'nowrap'
                    }}
                />
            </foreignObject>
        </g>
    );
};

const SmartAnnotation = (props) => {
    const { viewBox, value } = props;
    if (!viewBox || viewBox.x === undefined || viewBox.y === undefined) return null;

    const cx = viewBox.x;
    const cy = viewBox.y;

    const toRight = cx < 400;

    const diagLen = 35;
    const midX = toRight ? cx + diagLen : cx - diagLen;
    let midY = cy - diagLen;
 
    if (midY < 20) {
        midY = cy + diagLen;
    }

    const escapeX = toRight ? 60 : -60;
    const horizLen = Math.max(20, Math.abs(escapeX) - diagLen);
    const lineEndX = toRight ? midX + horizLen : midX - horizLen;
    const lineEndY = midY;

    const boxWidth = 90;
    const boxHeight = 28;
    const boxX = toRight ? lineEndX : lineEndX - boxWidth;
    const boxY = lineEndY - (boxHeight / 2);

    return (
        <g style={{ pointerEvents: 'none' }}>
            <path
                d={`M ${cx},${cy} L ${midX},${midY} L ${lineEndX},${lineEndY}`}
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

export default function GraficoStudent({ resultados, esDiferenciaMedias = false }) {
    if (!resultados || resultados.v === undefined || resultados.mu === undefined || resultados.se === undefined) return null;

    const esDiferencia = Boolean(
        esDiferenciaMedias || 
        resultados.esDiferenciaMedias || 
        (resultados.m1 !== undefined && resultados.m2 !== undefined)
    );

    const { se: SE, mu, v, x1, x2, condicion, probFinal } = resultados;
    const tieneProbabilidad = probFinal !== undefined;

    // Generación de datos
    const { datosGrafico, customTicks, annotationData } = useMemo(() => {
        const datos = [];
        const numPoints = 200;
        
        // Determinar límites. La t-Student tiene colas largas si v es pequeño.
        const tLimit = v > 2 ? 4.5 : 6;
        const minX = mu - tLimit * SE;
        const maxX = mu + tLimit * SE;
        const step = (maxX - minX) / numPoints;

        let curSegment = [];
        const segments = [];

        for (let i = 0; i <= numPoints; i++) {
            const x = minX + i * step;
            // PDF de t-Student ajustado al dominio X
            const tVal = (x - mu) / SE;
            const pdfT = jStat.studentt.pdf(tVal, v);
            const y = pdfT / SE;

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
        let ticks = [mu - 3*SE, mu - 2*SE, mu - SE, mu, mu + SE, mu + 2*SE, mu + 3*SE];
        if (tieneProbabilidad) {
            if (condicion === 'entre') {
                ticks.push(x1, x2);
            } else if (condicion) {
                ticks.push(x1);
            }
        }
        
        ticks = [...new Set(ticks.map(t => Math.round(t * 100) / 100))].sort((a, b) => a - b);

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
                text: tieneProbabilidad ? `${(probFinal * 100).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%` : ''
            };
        });

        return { datosGrafico: datos, customTicks: ticks, annotationData: annData };
    }, [mu, SE, v, x1, x2, condicion, probFinal, tieneProbabilidad]);

    // Detección inteligente de colisión entre etiquetas x1 y x2
    const estanCerca = useMemo(() => {
        if (!tieneProbabilidad || condicion !== 'entre') return false;
        const x1Num = parseFloat(x1);
        const x2Num = parseFloat(x2);
        if (isNaN(x1Num) || isNaN(x2Num)) return false;
        const tLimit = v > 2 ? 4.5 : 6;
        const span = 2 * tLimit * SE;
        return span > 0 && Math.abs(x2Num - x1Num) / span < 0.22;
    }, [tieneProbabilidad, condicion, x1, x2, v, SE]);

    return (
        <MarcoWidgetMAT251 
            titulo={esDiferencia ? "Gráfica de Densidad f(X̄₁ - X̄₂) [t-Student]" : "Gráfica de Densidad f(X̄) [t-Student]"} 
            anchoCompleto={true} 
            alto="450px" 
            id={esDiferencia ? "grafico-student-dif-medias" : "grafico-student"}
        >
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
                                label={{ value: esDiferencia ? 'Diferencia de Medias (X̄₁ - X̄₂)' : 'Media Muestral (X̄)', position: 'insideBottom', offset: -10, fill: 'var(--text-pure)', fontSize: 13, fontWeight: 'bold', textAnchor: 'middle' }}
                            />
                            
                            <YAxis 
                                width={65}
                                padding={{ top: 30 }}
                                tick={{ fill: 'var(--text-pure)', fontSize: 10, fontWeight: 'bold' }}
                                axisLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                tickLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                tickFormatter={(val) => val === 0 ? '0' : val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                label={{ value: esDiferencia ? 'Densidad f(X̄₁ - X̄₂)' : 'Densidad f(X̄)', angle: -90, position: 'insideLeft', offset: 10, fill: 'var(--text-pure)', fontSize: 13, fontWeight: 'bold', textAnchor: 'middle' }}
                            />
                            
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value, name) => [value.toLocaleString('es-ES', { minimumFractionDigits: 5 }), name === 'y' ? (esDiferencia ? 'f(X̄₁ - X̄₂)' : 'f(X̄)') : 'Área']}
                                labelFormatter={(label) => `${esDiferencia ? 'X̄₁ - X̄₂' : 'X̄'} = ${label.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 4 })}`}
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
                                            <EtiquetaLimiteIntervalo
                                                value={`\\boldsymbol{x_1 = ${x1}}`}
                                                side={estanCerca ? 'left' : 'center'}
                                                offsetY={-4}
                                            />
                                        } 
                                    />
                                    <ReferenceLine 
                                        x={x2} 
                                        stroke="#f97316" 
                                        strokeDasharray="4 4" 
                                        strokeWidth={3} 
                                        label={
                                            <EtiquetaLimiteIntervalo
                                                value={`\\boldsymbol{x_2 = ${x2}}`}
                                                side={estanCerca ? 'right' : 'center'}
                                                offsetY={-4}
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
