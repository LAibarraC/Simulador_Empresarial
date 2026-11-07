import React from 'react';
import { ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Line } from 'recharts';
import MarcoWidgetMAT251 from '../../ui/MarcoWidgetMAT251';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const renderBoldMath = (formula) => katex.renderToString(formula, { throwOnError: false });

const CustomLabel = ({ viewBox, valor, simbolo, offsetY = -25 }) => {
    const { x, y } = viewBox;
    const mathString = `\\boldsymbol{${simbolo}} = ${valor.toFixed(4)}`;
    return (
        <foreignObject className={`grafica-intervalo-label grafica-intervalo-label-${simbolo === 'LI' ? 'li' : simbolo === 'LS' ? 'ls' : 'centro'}`} x={x - 60} y={y + offsetY} width={120} height={30} style={{ overflow: 'visible' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                <span
                    style={{ color: 'var(--text-main)', fontSize: '13px', background: 'transparent' }}
                    dangerouslySetInnerHTML={{ __html: renderBoldMath(mathString) }}
                />
            </div>
        </foreignObject>
    );
};

const LabelVisual = ({ viewBox, valor, titulo, isCenter, simbolo }) => {
    const { x, y } = viewBox;
    return (
        <foreignObject className={`grafica-intervalo-label grafica-intervalo-label-${isCenter ? 'centro' : titulo.toLowerCase()}`} x={x - 40} y={isCenter ? y - 45 : y + 5} width={80} height={40} style={{ overflow: 'visible' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: 'transparent' }}>
                {isCenter ? (
                    <div style={{ fontSize: '12px', color: 'var(--primary-color)', whiteSpace: 'nowrap' }} dangerouslySetInnerHTML={{ __html: renderBoldMath(`\\boldsymbol{${simbolo}} = ${valor.toFixed(4)}`) }} />
                ) : (
                    <>
                        <div style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '4px' }} dangerouslySetInnerHTML={{ __html: renderBoldMath(`${valor.toFixed(4)}`) }} />
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)' }} dangerouslySetInnerHTML={{ __html: renderBoldMath(`\\boldsymbol{${titulo}}`) }} />
                    </>
                )}
            </div>
        </foreignObject>
    );
};

export default function Grafica_IntervalosMatriz({ resultados, parametro }) {
    // Solo dibujamos la campana normal/T-student para media
    if (!resultados || parametro !== 'media') return null;

    const mean = resultados.puntual?.estimacion;
    const LI = resultados.LI;
    const LS = resultados.LS;

    if (mean === undefined || LI === undefined || LS === undefined) return null;

    // Calculamos el Error Estándar (SE) a partir del Margen de Error y el Valor Crítico
    const E = LS - mean;
    const se = E / (resultados.valorCritico || 1.96);

    // Prevenir divisiones por cero
    if (se <= 0 || isNaN(se)) return null;

    const plotData = [];
    // Extiende el dominio más allá de los límites para que también se vean las colas,
    // incluso cuando el valor crítico supera las 4 desviaciones estándar (p. ej. 99%).
    const plotRange = Math.max(4, (mean - LI) / se, (LS - mean) / se) + 0.5;
    const minX = mean - plotRange * se;
    const maxX = mean + plotRange * se;

    // Generar puntos para la curva (aproximación Normal)
    for (let i = -plotRange; i <= plotRange; i += 0.05) {
        const x = mean + i * se;
        const y = Math.exp(-0.5 * Math.pow((x - mean) / se, 2)) / (se * Math.sqrt(2 * Math.PI));
        plotData.push({ x, y });
    }

    // Generar "ticks" (números) secuenciales y limpios para el eje X
    const niceTicks = [];
    const rangeX = maxX - minX;
    let step = 1;
    if (rangeX <= 0.1) step = 0.01;
    else if (rangeX <= 1) step = 0.1;
    else if (rangeX <= 5) step = 0.5;
    else if (rangeX <= 15) step = 1;
    else if (rangeX <= 50) step = 5;
    else if (rangeX <= 150) step = 10;
    else if (rangeX <= 500) step = 50;
    else if (rangeX <= 1500) step = 100;
    else step = Math.pow(10, Math.floor(Math.log10(rangeX)));

    const startTick = Math.ceil(minX / step) * step;
    for (let i = startTick; i <= maxX; i += step) {
        niceTicks.push(i);
    }

    // Calcular el porcentaje de posición para los límites en el gradiente (0% a 100%)
    const offsetLI = Math.max(0, Math.min(100, ((LI - minX) / (maxX - minX)) * 100));
    const offsetLS = Math.max(0, Math.min(100, ((LS - minX) / (maxX - minX)) * 100));

    const yAtLimit = Math.exp(-0.5 * Math.pow((LI - mean) / se, 2)) / (se * Math.sqrt(2 * Math.PI));
    const yAtMean = 1 / (se * Math.sqrt(2 * Math.PI));
    const labelHeight = yAtMean * 0.65; // Altura a la que estarán los labels de LI y LS

    const simboloCentro = parametro === 'proporcion' ? '\\hat{p}' : '\\bar{X}';

    return (
        <MarcoWidgetMAT251 titulo={`Gráfica de Confianza (${resultados.confianza}%)`} anchoCompleto={true} alto="480px">
            <style>{`
                .grafica-campana-container {
                    flex: 1;
                    width: 100%;
                    min-height: 250px;
                }
                .grafica-intervalos-legend { position: absolute; top: 0; left: 10px; display: flex; flex-direction: column; gap: 8px; font-size: 0.7rem; z-index: 10; }
                @media (max-width: 600px) {
                    .grafica-campana-container { min-height: 210px; }
                    .grafica-intervalos-legend { position: relative !important; inset: auto !important; width: calc(100% - 12px); flex-direction: row !important; flex-wrap: wrap; justify-content: center !important; align-items: center; gap: 3px 10px !important; margin: 0 6px 3px; text-align: center; font-size: 0.62rem !important; }
                    .grafica-intervalos-legend > div > div { width: 9px !important; height: 9px !important; }
                    .grafica-intervalo-label { font-size: 9px !important; }
                    .grafica-intervalo-label span, .grafica-intervalo-label > div > div { font-size: 9px !important; }
                    .grafica-intervalo-label-li { transform: translateX(18px); }
                    .grafica-intervalo-label-ls { transform: translateX(-18px); }
                    .grafica-intervalo-label-centro { font-size: 9px !important; }
                    .grafica-intervalos-chart .recharts-xAxis .recharts-cartesian-axis-tick-value { font-size: 9px !important; }
                }
            `}</style>
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                {/* Leyenda Visual */}
                <div className="grafica-intervalos-legend" style={{ position: 'absolute', top: 0, left: 10, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.7rem', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '12px', height: '12px', background: 'var(--primary-color)', opacity: 0.7, borderRadius: '3px' }}></div>
                        <span style={{ color: 'var(--text-pure)' }}>Nivel de Confianza ({resultados.confianza}%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#ef4444', opacity: 0.6, borderRadius: '3px' }}></div>
                        <span style={{ color: 'var(--text-pure)' }}>Riesgo / Colas ({(100 - resultados.confianza).toFixed(1)}%)</span>
                    </div>
                </div>

                <div className="grafica-campana-container grafica-intervalos-chart">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={plotData} margin={{ top: 20, right: 0, left: -60, bottom:20 }}>
                            <defs>
                                <linearGradient id="colorArea" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6} />
                                    <stop offset={`${offsetLI}%`} stopColor="#ef4444" stopOpacity={0.6} />

                                    <stop offset={`${offsetLI}%`} stopColor="var(--primary-color)" stopOpacity={0.7} />
                                    <stop offset={`${offsetLS}%`} stopColor="var(--primary-color)" stopOpacity={0.7} />

                                    <stop offset={`${offsetLS}%`} stopColor="#ef4444" stopOpacity={0.6} />
                                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} />
                            <XAxis
                                dataKey="x"
                                type="number"
                                domain={[minX, maxX]}
                                ticks={niceTicks}
                                tickFormatter={(v) => Number.isInteger(v) ? v : Number(v.toFixed(3))}
                                tick={{ fontSize: 11, fontWeight: 'bold', fill: 'var(--text-pure)' }}
                                stroke="var(--text-pure)"
                            />
                            <YAxis dataKey="y" type="number" domain={[0, yAtMean * 1.15]} tick={false} axisLine={false} tickLine={false} />
                            <Tooltip
                                formatter={(value, name) => [value.toFixed(4), 'Densidad']}
                                labelFormatter={(label) => `x = ${Number(label).toFixed(4)}`}
                            />
                            <Area
                                type="monotone"
                                dataKey="y"
                                stroke="var(--text-main)"
                                strokeWidth={2}
                                fill="url(#colorArea)"
                                isAnimationActive={false}
                            />
                            {/* Media */}
                            <ReferenceLine
                                segment={[{ x: mean, y: 0 }, { x: mean, y: yAtMean * 1.06 }]}
                                stroke="var(--text-main)"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                label={<CustomLabel valor={mean} simbolo={simboloCentro} offsetY={-25} />}
                            />
                            {/* LI */}
                            <ReferenceLine
                                segment={[{ x: LI, y: 0 }, { x: LI, y: labelHeight }]}
                                stroke="#ef4444"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                label={<CustomLabel valor={LI} simbolo="LI" offsetY={-30} />}
                            />
                            {/* LS */}
                            <ReferenceLine
                                segment={[{ x: LS, y: 0 }, { x: LS, y: labelHeight }]}
                                stroke="#ef4444"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                label={<CustomLabel valor={LS} simbolo="LS" offsetY={-30} />}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Representación Visual Inferior (Regla de Intervalo) */}
                <div style={{ marginTop: '-15px', flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height={110}>
                        <ComposedChart data={plotData} margin={{ top: 0, right: 0, left: -60, bottom: 40 }}>
                            <XAxis dataKey="x" type="number" domain={[minX, maxX]} hide />
                            <YAxis type="number" domain={[0, 1]} tick={false} axisLine={false} tickLine={false} />

                            {/* Truco: Linea invisible para forzar a Recharts a renderizar el gráfico */}
                            <Line dataKey="y" stroke="none" dot={false} isAnimationActive={false} />

                            {/* Línea Horizontal Base */}
                            <ReferenceLine segment={[{ x: LI, y: 0.5 }, { x: LS, y: 0.5 }]} stroke="var(--text-main)" strokeWidth={2} />

                            {/* Marcas Verticales LI y LS */}
                            <ReferenceLine segment={[{ x: LI, y: 0.4 }, { x: LI, y: 0.6 }]} stroke="var(--text-main)" strokeWidth={2} />
                            <ReferenceLine segment={[{ x: LS, y: 0.4 }, { x: LS, y: 0.6 }]} stroke="var(--text-main)" strokeWidth={2} />

                            {/* Etiquetas */}
                            <ReferenceLine segment={[{ x: LI, y: 0.5 }, { x: LI, y: 0.5 }]} stroke="none" label={<LabelVisual valor={LI} titulo="LI" isCenter={false} />} />
                            <ReferenceLine segment={[{ x: LS, y: 0.5 }, { x: LS, y: 0.5 }]} stroke="none" label={<LabelVisual valor={LS} titulo="LS" isCenter={false} />} />
                            <ReferenceLine segment={[{ x: mean, y: 0.5 }, { x: mean, y: 0.5 }]} stroke="none" label={<LabelVisual valor={mean} isCenter={true} simbolo={simboloCentro} />} />

                            {/* Punto central */}
                            <ReferenceLine segment={[{ x: mean, y: 0.5 }, { x: mean, y: 0.5 }]} stroke="none" label={({ viewBox }) => <circle cx={viewBox.x} cy={viewBox.y} r={4} fill="var(--primary-color)" />} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </MarcoWidgetMAT251>
    );
}
