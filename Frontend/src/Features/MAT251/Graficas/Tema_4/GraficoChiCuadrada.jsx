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

    // Protección absoluta contra desborde superior: nunca permitir Y < 2
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
                        color: 'var(--text-pure, var(--text-pure))',
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
                stroke="var(--primary-color, #3b82f6)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx={cx} cy={cy} r={5} fill="var(--primary-color, #3b82f6)" />

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

export default function GraficoChiCuadrada({ resultados }) {
    if (!resultados || resultados.k === undefined) return null;

    const { k, varPob, x1, x2, condicion, probFinal } = resultados;
    const tieneProbabilidad = probFinal !== undefined;

    const formatNum = (num) => {
        if (num === null || num === undefined || isNaN(num)) return '';
        const parsed = parseFloat(num);
        return Number.isInteger(parsed) ? parsed.toString() : parsed.toFixed(4);
    };

    const { datosGrafico, annotationData } = useMemo(() => {
        // Rango del eje X para la Chi-Cuadrada
        const mean = k;
        const sd = Math.sqrt(2 * k);
        const baseMaxChi = Math.max(mean + 4 * sd, 20); 

        // Rango dinámico que asegure incluir x1 y x2
        const s2Targets = [];
        if (tieneProbabilidad) {
            if (x1 !== undefined && !isNaN(parseFloat(x1))) s2Targets.push(parseFloat(x1));
            if (x2 !== undefined && !isNaN(parseFloat(x2))) s2Targets.push(parseFloat(x2));
        }

        let maxChi = baseMaxChi;
        if (s2Targets.length > 0) {
            const maxS2 = Math.max(...s2Targets);
            const targetChi = (k * maxS2) / varPob;
            if (targetChi * 1.2 > maxChi) {
                maxChi = targetChi * 1.2;
            }
        }
        
        const puntos = [];
        const numPuntos = 250;
        const paso = maxChi / numPuntos;

        // Límites
        let fillStart = -1;
        let fillEnd = -1;
        if (tieneProbabilidad) {
            if (condicion === 'menor_que') {
                fillStart = 0;
                fillEnd = x1;
            } else if (condicion === 'mayor_que') {
                fillStart = x1;
                fillEnd = (maxChi * varPob) / k;
            } else if (condicion === 'entre') {
                fillStart = x1;
                fillEnd = x2;
            }
        }

        for (let i = 0; i <= numPuntos; i++) {
            const chiValue = i * paso;
            const xVal = (chiValue * varPob) / k;
            const pdf = jStat.chisquare.pdf(chiValue, k);

            let fillY = 0;
            if (tieneProbabilidad && xVal >= fillStart && xVal <= fillEnd) {
                fillY = pdf;
            }

            puntos.push({
                x: xVal,
                chiValue: chiValue,
                y: pdf,
                fillY: fillY
            });
        }

        // Calcular centroide para la anotación del área
        const annData = [];
        if (tieneProbabilidad) {
            const filledSegments = [];
            let currentSeg = [];
            for (let pt of puntos) {
                if (pt.fillY > 0) {
                    currentSeg.push(pt);
                } else if (currentSeg.length > 0) {
                    filledSegments.push(currentSeg);
                    currentSeg = [];
                }
            }
            if (currentSeg.length > 0) filledSegments.push(currentSeg);

            filledSegments.forEach(seg => {
                let sumX = 0, sumY = 0;
                seg.forEach(pt => { sumX += pt.x; sumY += pt.fillY; });
                const centroidX = sumX / seg.length;
                
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

                annData.push({
                    x: centroidX,
                    y: yDot,
                    text: `${(probFinal * 100).toFixed(2)}%`
                });
            });
        }
        return { datosGrafico: puntos, annotationData: annData };
    }, [k, varPob, x1, x2, condicion, probFinal, tieneProbabilidad]);

    // Detección inteligente de colisión entre etiquetas x1 y x2
    const estanCerca = useMemo(() => {
        if (!tieneProbabilidad || condicion !== 'entre') return false;
        const x1Num = parseFloat(x1);
        const x2Num = parseFloat(x2);
        if (isNaN(x1Num) || isNaN(x2Num)) return false;
        const maxS2 = datosGrafico.length > 0 ? datosGrafico[datosGrafico.length - 1].x : 10;
        const minS2 = datosGrafico.length > 0 ? datosGrafico[0].x : 0;
        const span = Math.max(maxS2 - minS2, 1);
        return span > 0 && Math.abs(x2Num - x1Num) / span < 0.22;
    }, [tieneProbabilidad, condicion, x1, x2, datosGrafico]);

    return (
        <MarcoWidgetMAT251 titulo="Gráfica de Densidad de Probabilidad f(S²)" anchoCompleto={true} alto="450px" id="grafico-chi-cuadrada">
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, minHeight: 0, width: '100%', overflow: 'hidden', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={datosGrafico} margin={{ top: 25, right: 5, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            
                            <XAxis 
                                dataKey="x" 
                                type="number" 
                                domain={[0, 'dataMax']}
                                allowDataOverflow={true}
                                padding={{ left: 10, right: 20 }}
                                tick={{ fill: 'var(--text-pure)', fontSize: 10, fontWeight: 'bold' }}
                                axisLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                tickLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                tickFormatter={(val) => Number.isInteger(val) ? val.toString() : val.toFixed(2)}
                                label={{ value: 'Varianza Muestral (S²)', position: 'insideBottom', offset: -15, fill: 'var(--text-pure)', fontSize: 13, fontWeight: 'bold', textAnchor: 'middle' }}
                            />
                            
                            <YAxis 
                                domain={[0, 'auto']}
                                tick={{ fill: 'var(--text-pure)', fontSize: 10, fontWeight: 'bold' }}
                                axisLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                tickLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                tickFormatter={(val) => Number.isInteger(val) ? val.toString() : val.toFixed(2)}
                                label={{ 
                                    value: 'Densidad f(S²)', 
                                    angle: -90, 
                                    position: 'insideLeft', 
                                    offset: 10, 
                                    fill: 'var(--text-pure)', 
                                    fontSize: 13, 
                                    fontWeight: 'bold', 
                                    textAnchor: 'middle' 
                                }}
                            />
                            
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value, name) => [value.toFixed(5), name === 'y' ? 'f(S²)' : 'Área']}
                                labelFormatter={(label) => `S² = ${Number.isInteger(label) ? label : label.toFixed(4)}`}
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
                                                value={`\\boldsymbol{S_1^2 = ${formatNum(x1)}}`}
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
                                                value={`\\boldsymbol{S_2^2 = ${formatNum(x2)}}`}
                                                side={estanCerca ? 'right' : 'center'}
                                                offsetY={-4}
                                            />
                                        } 
                                    />
                                </>
                            )}
                            {tieneProbabilidad && (condicion === 'menor_que' || condicion === 'mayor_que') && (
                                <ReferenceLine x={x1} stroke="#f97316" strokeDasharray="4 4" strokeWidth={3} label={<CustomKatexLabel value={`\\boldsymbol{S^2 = ${formatNum(x1)}}`} offsetY={-8} />} />
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
