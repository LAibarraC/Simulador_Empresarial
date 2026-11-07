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

const KaTeXInline = ({ formula }) => (
    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(formula, { throwOnError: false }) }} />
);

const XAxisKatexLabel = ({ viewBox, prefix, value }) => {
    if (!viewBox) return null;
    const { x, y, width, height } = viewBox;
    const cx = x + width / 2;
    const cy = y + height - 5;
    return (
        <foreignObject x={cx - 210} y={cy - 8} width={420} height={30} style={{ overflow: "visible", pointerEvents: "none" }}>
            <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--text-pure)", fontSize: "13px", fontWeight: "bold", whiteSpace: "nowrap", gap: "4px" }}>
                <span>{prefix}</span>
                <KaTeXInline formula={value} />
            </div>
        </foreignObject>
    );
};

const YAxisKatexLabel = ({ viewBox, prefix, value }) => {
    if (!viewBox) return null;
    const { x, y, height } = viewBox;
    return (
        <foreignObject x={x -25} y={y} width={80} height={height} style={{ overflow: "visible", pointerEvents: "none" }}>
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%) rotate(-90deg)", transformOrigin: "center", color: "var(--text-pure)", fontSize: "13px", fontWeight: "bold", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "4px" }}>
                    <span>{prefix}</span>
                    <KaTeXInline formula={value} />
                </div>
            </div>
        </foreignObject>
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

export default function GraficoFisher({ resultados }) {
    if (!resultados || resultados.v1 === undefined) return null;

    const { v1, v2, vp1: varPob1, vp2: varPob2, x1, x2, condicion, probFinal } = resultados;
    const tieneProbabilidad = probFinal !== undefined;

    const { datosGrafico, annotationData } = useMemo(() => {
        
        let targetMaxR = 5;
        if (tieneProbabilidad) {
            if (condicion === 'menor_que' || condicion === 'mayor_que') {
                targetMaxR = Math.max(targetMaxR, x1 * 1.5);
            } else if (condicion === 'entre') {
                targetMaxR = Math.max(targetMaxR, x2 * 1.5);
            }
        }
        
        const razonVarPobInv = varPob1 / varPob2; // R = F * (varPob1 / varPob2)
        const targetMaxF = targetMaxR / razonVarPobInv;
        
        // Determinar maxF real para la gráfica
        const meanF = v2 > 2 ? v2 / (v2 - 2) : 2;
        const sdF = v2 > 4 ? Math.sqrt( (2 * v2 * v2 * (v1 + v2 - 2)) / (v1 * (v2 - 2) * (v2 - 2) * (v2 - 4)) ) : 2;
        
        const graphMaxF = Math.max(targetMaxF, meanF + 4 * sdF, 5);

        const puntos = [];
        const numPuntos = 200;
        const paso = graphMaxF / numPuntos;

        let fillStart = -1;
        let fillEnd = -1;
        if (tieneProbabilidad) {
            if (condicion === 'menor_que') {
                fillStart = 0;
                fillEnd = x1;
            } else if (condicion === 'mayor_que') {
                fillStart = x1;
                fillEnd = targetMaxR * 10;
            } else if (condicion === 'entre') {
                fillStart = x1;
                fillEnd = x2;
            }
        }

        for (let i = 0; i <= numPuntos; i++) {
            // F value starts slightly above 0 to avoid Infinity in pdf for some v1, v2 combinations
            const FValue = i === 0 ? 0.0001 : i * paso;
            const RVal = FValue * razonVarPobInv; // R = S1^2 / S2^2
            const pdf = jStat.centralF.pdf(FValue, v1, v2) / razonVarPobInv;

            let fillY = 0;
            if (tieneProbabilidad && RVal >= fillStart && RVal <= fillEnd) {
                fillY = pdf;
            }

            puntos.push({
                x: RVal,
                FValue: FValue,
                y: pdf,
                fillY: fillY
            });
        }

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
    }, [v1, v2, varPob1, varPob2, x1, x2, condicion, probFinal, tieneProbabilidad]);

    // Detección inteligente de colisión entre etiquetas x1 y x2
    const estanCerca = useMemo(() => {
        if (!tieneProbabilidad || condicion !== 'entre') return false;
        const x1Num = parseFloat(x1);
        const x2Num = parseFloat(x2);
        if (isNaN(x1Num) || isNaN(x2Num)) return false;
        const maxX = datosGrafico.length > 0 ? datosGrafico[datosGrafico.length - 1].x : 5;
        const minX = datosGrafico.length > 0 ? datosGrafico[0].x : 0;
        const span = Math.max(maxX - minX, 1);
        return span > 0 && Math.abs(x2Num - x1Num) / span < 0.22;
    }, [tieneProbabilidad, condicion, x1, x2, datosGrafico]);

    return (
        <MarcoWidgetMAT251 titulo={<span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><span>{"Gr\u00e1fica de Densidad de Probabilidad"}</span><KaTeXInline formula="f(x)" /><span>[Fisher]</span></span>} anchoCompleto={true} alto="450px" id="grafico-fisher">
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
                                padding={{ left: 20, right: 20 }}
                                tick={{ fill: 'var(--text-pure)', fontSize: 10, fontWeight: 'bold' }}
                                axisLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                tickLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                tickFormatter={(val) => Number.isInteger(val) ? val : val.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                label={<XAxisKatexLabel prefix={'Raz\u00f3n de Varianzas Muestrales'} value={'(S_1^2 / S_2^2)'} />}
                            />
                            
                            <YAxis 
                                width={65}
                                padding={{ top: 20 }}
                                tick={{ fill: 'var(--text-pure)', fontSize: 10, fontWeight: 'bold' }}
                                axisLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                tickLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                tickFormatter={(val) => val === 0 ? '0' : val.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
                                label={<YAxisKatexLabel prefix="Densidad" value={'f(S_1^2 / S_2^2)'} />}
                            />
                            
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value, name) => [value.toLocaleString('es-ES', { minimumFractionDigits: 5, maximumFractionDigits: 5 }), name === 'y' ? 'f(x)' : 'Área']}
                                labelFormatter={(label) => `S₁²/S₂² = ${label.toLocaleString('es-ES', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`}
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
