import React, { useEffect, useState } from 'react';
import { Area, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import MarcoWidgetMAT251 from '../../ui/MarcoWidgetMAT251';

const renderKatex = (formula) => {
    return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(formula, { throwOnError: false }) }} />;
};
const renderBoldMath = (formula) => katex.renderToString(formula, { throwOnError: false });

const formatChartNumber = (value, compact) => {
    const number = Number(value);
    if (!compact || !Number.isFinite(number)) return number.toFixed(4);
    if (Math.abs(number) >= 1e6) {
        const exponent = Math.floor(Math.log10(Math.abs(number)));
        return `${(number / (10 ** exponent)).toFixed(2)}\\times10^{${exponent}}`;
    }
    return number.toFixed(2);
};

const formatAxisTick = (value, compact) => {
    const number = Number(value);
    if (compact && Math.abs(number) >= 1e6) {
        const exponent = Math.floor(Math.log10(Math.abs(number)));
        return `${(number / (10 ** exponent)).toFixed(0)}e${exponent}`;
    }
    return Number.isInteger(number) ? number : Number(number.toFixed(3));
};

const formatTooltipNumber = (value, compact) => {
    const number = Number(value);
    return compact && Math.abs(number) >= 1e6
        ? number.toExponential(2).replace('e+', 'e')
        : number.toFixed(4);
};

const CustomLabel = ({ viewBox, valor, simbolo, isMobile, offsetY = -25, offsetX = 0 }) => {
    const { x, y } = viewBox;
    const formula = `\\boldsymbol{${simbolo}} = ${formatChartNumber(valor, isMobile)}`;
    const labelWidth = isMobile ? 110 : 150;
    const labelX = x - labelWidth / 2 + offsetX;
    return (
        <foreignObject className={`grafica-intervalo-label grafica-intervalo-label-${simbolo === 'LI' ? 'li' : simbolo === 'LS' ? 'ls' : 'centro'}`} x={labelX} y={y + offsetY} width={labelWidth} height={40}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', padding: '2px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-main)' }} dangerouslySetInnerHTML={{ __html: renderBoldMath(formula) }}></div>
            </div>
        </foreignObject>
    );
};

const LabelVisual = ({ viewBox, valor, titulo, simbolo, isCenter, isMobile }) => {
    const { x, y } = viewBox;
    const labelWidth = isMobile ? 110 : 150;
    const labelX = x - labelWidth / 2;
    const formula = isCenter
        ? `\\boldsymbol{${simbolo}} = ${formatChartNumber(valor, isMobile)}`
        : `\\boldsymbol{${titulo}} = ${formatChartNumber(valor, isMobile)}`;
    return (
        <foreignObject className={`grafica-intervalo-label grafica-intervalo-label-${isCenter ? 'centro' : titulo.toLowerCase()}`} x={labelX} y={isCenter ? y - 35 : y + 15} width={labelWidth} height={50}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-main)', marginTop: '4px' }} dangerouslySetInnerHTML={{ __html: renderBoldMath(formula) }}></div>
            </div>
        </foreignObject>
    );
};

export default function Grafica_IntervalosVarianza({ resultados }) {
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches);

    useEffect(() => {
        const media = window.matchMedia('(max-width: 600px)');
        const updateViewport = (event) => setIsMobile(event.matches);
        setIsMobile(media.matches);
        if (media.addEventListener) media.addEventListener('change', updateViewport);
        else media.addListener?.(updateViewport);
        return () => {
            if (media.removeEventListener) media.removeEventListener('change', updateViewport);
            else media.removeListener?.(updateViewport);
        };
    }, []);

    if (!resultados) return null;

    const mean = resultados.puntual?.estimacion; // This is S^2
    const LI = resultados.LI;
    const LS = resultados.LS;

    if (mean === undefined || LI === undefined || LS === undefined) return null;

    const n = resultados.n || 30;
    const df = n - 1;

    // Configuración del eje X (Varianza)
    const maxX = Math.max(LS * 1.3, mean * 2.5);
    // Deja un pequeño margen antes de cero para que la curva no quede pegada al borde.
    const minX = -maxX * 0.015;

    let maxLogY = -Infinity;
    const tempData = [];
    const stepX = maxX / 250;

    // Función de densidad: Chi-cuadrada evaluada en z = x * (df / S^2)
    for (let x = 0; x <= maxX; x += stepX) {
        if (x === 0) {
            tempData.push({ x, logY: -Infinity });
            continue;
        }
        const z = x * (df / mean);
        const logY = (df / 2 - 1) * Math.log(z) - z / 2;
        if (logY > maxLogY) maxLogY = logY;
        tempData.push({ x, logY });
    }

    const plotData = tempData.map(d => ({
        x: d.x,
        y: d.x === 0 ? 0 : Math.exp(d.logY - maxLogY)
    }));

    const maxY = 1.0;
    const labelHeight = 0.65;
    const yAtLimitLI = plotData.find(d => d.x >= LI)?.y || 0.2;
    const yAtLimitLS = plotData.find(d => d.x >= LS)?.y || 0.2;

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

    const offsetLI = Math.max(0, Math.min(100, ((LI - minX) / (maxX - minX)) * 100));
    const offsetLS = Math.max(0, Math.min(100, ((LS - minX) / (maxX - minX)) * 100));
    const simboloCentro = 'S^2';

    return (
        <MarcoWidgetMAT251 titulo={isMobile ? `IC de Varianza (${resultados.confianza}%)` : `Gráfica de Confianza para Varianza (${resultados.confianza}%)`} anchoCompleto={true} alto={isMobile ? '410px' : '450px'}>
            <style>{`
                .grafica-chi-container {
                    flex: 1;
                    width: 100%;
                    min-height: 250px;
                }
                .grafica-intervalos-legend { position: absolute; top: 0; right: 10px; display: flex; flex-direction: column; gap: 8px; font-size: 0.7rem; z-index: 10; }
                @media (max-width: 600px) {
                    .grafica-chi-container { min-height: 210px; }
                    .grafica-intervalos-legend { position: relative !important; inset: auto !important; width: calc(100% - 12px); flex-direction: row !important; flex-wrap: wrap; justify-content: center !important; align-items: center; gap: 3px 10px !important; margin: 0 6px 3px; text-align: center; font-size: 0.62rem !important; }
                    .grafica-intervalos-legend > div > div { width: 9px !important; height: 9px !important; }
                    .grafica-intervalo-label { font-size: 9px !important; }
                    .grafica-intervalo-label span, .grafica-intervalo-label > div > div { font-size: 9px !important; }
                    .grafica-intervalos-chart .recharts-xAxis .recharts-cartesian-axis-tick-value { font-size: 9px !important; }
                }
            `}</style>
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <div className="grafica-intervalos-legend" style={{ position: 'absolute', top: 0, right: 10, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.7rem', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '15px', height: '15px', background: 'var(--primary-color)', opacity: 0.7, borderRadius: '3px' }}></div>
                        <span style={{ color: 'var(--text-main)' }}>Nivel de Confianza ({resultados.confianza}%)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '15px', height: '15px', background: '#ef4444', opacity: 0.6, borderRadius: '3px' }}></div>
                        <span style={{ color: 'var(--text-main)' }}>Riesgo / Colas ({(100 - resultados.confianza).toFixed(1)}%)</span>
                    </div>
                </div>

                <div className="grafica-chi-container grafica-intervalos-chart">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={plotData} margin={{ top: isMobile ? 28 : 50, right: isMobile ? 8 : 0, left: isMobile ? 8 : 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorAreaChi" x1="0" y1="0" x2="1" y2="0">
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
                                tickFormatter={(v) => formatAxisTick(v, isMobile)}
                                tick={{ fontSize: isMobile ? 9 : 10, fontWeight: 'bold', fill: 'var(--text-main)' }}
                                stroke="var(--text-main)"
                            />
                            <YAxis dataKey="y" type="number" domain={[0, maxY * 1.15]} tick={false} axisLine={false} tickLine={false} width={isMobile ? 0 : 60} />
                            <Tooltip
                                formatter={(value, name) => [value.toFixed(4), 'Densidad']}
                                labelFormatter={(label) => `Varianza = ${formatTooltipNumber(label, isMobile)}`}
                            />
                            <Area
                                type="monotone"
                                dataKey="y"
                                stroke="var(--text-main)"
                                strokeWidth={2}
                                fill="url(#colorAreaChi)"
                                isAnimationActive={false}
                            />

                            {/* Estimador Puntual */}
                            <ReferenceLine
                                segment={[{ x: mean, y: 0 }, { x: mean, y: maxY * 1.06 }]}
                                stroke="var(--text-main)"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                label={<CustomLabel valor={mean} simbolo={simboloCentro} isMobile={isMobile} offsetY={-25} />}
                            />

                            {/* Límite Inferior (LI) */}
                            <ReferenceLine
                                segment={[{ x: LI, y: 0 }, { x: LI, y: labelHeight }]}
                                stroke="#ef4444"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                label={<CustomLabel valor={LI} simbolo="LI" isMobile={isMobile} offsetY={-30} />}
                            />

                            {/* Límite Superior (LS) */}
                            <ReferenceLine
                                segment={[{ x: LS, y: 0 }, { x: LS, y: labelHeight }]}
                                stroke="#ef4444"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                label={<CustomLabel valor={LS} simbolo="LS" isMobile={isMobile} offsetY={-30} />}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Representación Visual Inferior (Regla de Intervalo) */}
                <div style={{ marginTop: '-15px', flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height={isMobile ? 90 : 110}>
                        <ComposedChart data={plotData} margin={{ top: 0, right: isMobile ? 8 : 0, left: isMobile ? 8 : 0, bottom: isMobile ? 4 : 10 }}>
                            <XAxis dataKey="x" type="number" domain={[minX, maxX]} hide />
                            <YAxis type="number" domain={[0, 1]} tick={false} axisLine={false} tickLine={false} width={isMobile ? 0 : 60} />

                            <Line dataKey="y" stroke="none" dot={false} isAnimationActive={false} />

                            {/* El intervalo resaltado */}
                            <ReferenceLine segment={[{ x: LI, y: 0.5 }, { x: LS, y: 0.5 }]} stroke="var(--text-main)" strokeWidth={2} />

                            <ReferenceLine segment={[{ x: LI, y: 0.425 }, { x: LI, y: 0.575 }]} stroke="var(--text-main)" strokeWidth={2} />
                            <ReferenceLine segment={[{ x: LS, y: 0.425 }, { x: LS, y: 0.575 }]} stroke="var(--text-main)" strokeWidth={2} />

                            <ReferenceLine segment={[{ x: LI, y: 0.5 }, { x: LI, y: 0.5 }]} stroke="none" label={<LabelVisual valor={LI} titulo="LI" isCenter={false} isMobile={isMobile} />} />
                            <ReferenceLine segment={[{ x: LS, y: 0.5 }, { x: LS, y: 0.5 }]} stroke="none" label={<LabelVisual valor={LS} titulo="LS" isCenter={false} isMobile={isMobile} />} />

                            {/* Punto central asimétrico (Estimador Puntual) */}
                            <ReferenceLine segment={[{ x: mean, y: 0.5 }, { x: mean, y: 0.5 }]} stroke="none" label={<LabelVisual valor={mean} isCenter={true} simbolo={simboloCentro} isMobile={isMobile} />} />
                            <ReferenceLine segment={[{ x: mean, y: 0.5 }, { x: mean, y: 0.5 }]} stroke="none" label={({ viewBox }) => <circle cx={viewBox.x} cy={viewBox.y} r={4} fill="var(--primary-color)" />} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </MarcoWidgetMAT251>
    );
}
