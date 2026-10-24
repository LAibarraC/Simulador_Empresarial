import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { ComposedChart, BarChart, Area, Bar, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { jStat } from 'jstat';
import { FONT, FS } from '../../Principal/Constantes';
import MarcoWidgetMAT251 from '../../ui/MarcoWidgetMAT251';

const CustomKatexLabel = (props) => {
    const { viewBox, value, offsetY = 0, offsetX = 0, position } = props;
    if (!viewBox) return null;
    const { x, y } = viewBox;

    let finalOffsetX = offsetX;
    if (position === 'insideTopLeft') finalOffsetX = -25;
    if (position === 'insideTopRight') finalOffsetX = 25;

    return (
        <foreignObject x={x - 70 + finalOffsetX} y={y - 30 + offsetY} width={140} height={30} style={{ overflow: 'visible' }}>
            <div
                dangerouslySetInnerHTML={{ __html: katex.renderToString(value, { throwOnError: false }) }}
                style={{ color: 'var(--text-main, #1e293b)', fontSize: '12px', fontWeight: 'normal', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '100%' }}
            />
        </foreignObject>
    );
};

export default function Grafico_HNP_SimulacionChi({ resultados }) {
    if (!resultados || !resultados.historial) return null;

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const alpha = resultados.alpha;
    const tipoPrueba = 'derecha';
    const df = resultados.df;

    const criticalValues = [jStat.chisquare.inv(1 - alpha, df)];

    const chartData = (() => {
        const data = [];
        let maxX = Math.max(df * 2.5, ...(criticalValues.map(v => v * 1.2)), 20);
        const peakDensity = jStat.chisquare.pdf(Math.max(df - 2, 0.01), df);
        while (maxX < 10000 && jStat.chisquare.pdf(maxX, df) > peakDensity * 0.001) {
            maxX *= 1.2;
        }
        resultados.historial.forEach(sim => {
            if (sim.estadistico > maxX) maxX = sim.estadistico * 1.1;
        });

        let minX = 0;
        const step = (maxX - minX) / 300;

        let xs = [];
        for (let x = minX; x <= maxX; x += step) {
            xs.push(x);
        }
        criticalValues.forEach(cv => {
            xs.push(cv - 0.001);
            xs.push(cv);
            xs.push(cv + 0.001);
        });
        xs.sort((a, b) => a - b);

        xs.forEach(x => {
            let y = jStat.chisquare.pdf(x, df);
            let isReject = false;

            if (tipoPrueba === 'derecha') {
                if (x >= criticalValues[0] - 0.0005) isReject = true;
            }

            data.push({
                x: Number(x.toFixed(4)),
                y,
                rejectArea: isReject ? y : 0,
                acceptArea: !isReject ? y : 0
            });
        });
        return data;
    })();

    const customTicks = (() => {
        const minX = chartData.length > 0 ? chartData[0].x : 0;
        const maxX = chartData.length > 0 ? chartData[chartData.length - 1].x : 4;

        const importantTicks = [df, ...criticalValues];
        const allTicks = [...importantTicks];

        const minTick = Math.ceil(minX);
        const maxTick = Math.floor(maxX);
        const tickStep = (maxX - minX) > 15 ? Math.ceil((maxX - minX) / 10) : 1;

        for (let i = minTick; i <= maxTick; i += tickStep) {
            const isTooClose = importantTicks.some(it => Math.abs(it - i) < (tickStep * 0.5));
            if (!isTooClose) {
                allTicks.push(i);
            }
        }
        return Array.from(new Set(allTicks.map(v => Number(v.toFixed(3))))).sort((a, b) => a - b);
    })();

    const N_SIMS = resultados.historial.length;
    const NUM_BINS = 30;

    let maxEst = 0;
    resultados.historial.forEach(sim => {
        if (sim.estadistico > maxEst) maxEst = sim.estadistico;
    });

    let maxXLimit = Math.max(df * 3, criticalValues[0] * 2, 18);
    let chartMaxRange = Math.max(maxEst, maxXLimit);
    const binWidth = chartMaxRange / NUM_BINS;

    const bins = Array.from({ length: NUM_BINS }, (_, i) => ({
        x: (i + 0.5) * binWidth,
        count: 0,
        density: 0,
        isReject: false
    }));

    resultados.historial.forEach(sim => {
        let idx = Math.floor(sim.estadistico / binWidth);
        if (idx >= NUM_BINS) idx = NUM_BINS - 1;
        bins[idx].count++;
    });

    bins.forEach(b => {
        b.density = b.count / (N_SIMS * binWidth);
        b.isReject = b.x > criticalValues[0];
    });

    const combinedData = [...chartData];

    let scatterRechazo = [];
    let scatterRetencion = [];

    // Limite visual
    const MAX_PUNTOS = 800;
    const paso = resultados.historial.length > MAX_PUNTOS ? Math.ceil(resultados.historial.length / MAX_PUNTOS) : 1;

    resultados.historial.forEach((sim, idx) => {
        if (idx % paso !== 0) return;

        const isRejection = sim.decision === 'Rechazar H₀';
        const pt = {
            x: Number(sim.estadistico.toFixed(3)),
            y: 0,
            sim: sim.iteracion,
            pValor: Number(sim.pValor.toFixed(4))
        };
        if (isRejection) scatterRechazo.push(pt);
        else scatterRetencion.push(pt);
    });

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            if (data.sim) {
                return (
                    <div style={{ background: 'var(--bg-card, white)', padding: '10px', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '4px', fontSize: FS.sm, color: 'var(--text-pure, black)' }}>
                        <div><strong>Simulación #{data.sim}</strong></div>
                        <div>Estadístico {renderKatex('\\boldsymbol{\\chi^2_c}')}: {data.x}</div>
                        <div>p-valor: {data.pValor}</div>
                    </div>
                );
            }
        }
        return null;
    };

    const pureBinsData = [
        {
            binCenter: (0).toFixed(3),
            countRetencion: 0,
            countRechazo: 0,
            densityCurve: jStat.chisquare.pdf(0, df) === Infinity ? 0 : (jStat.chisquare.pdf(0, df) || 0)
        },
        ...bins.map(b => ({
            binCenter: b.x.toFixed(3),
            countRetencion: !b.isReject ? b.count : 0,
            countRechazo: b.isReject ? b.count : 0,
            densityCurve: jStat.chisquare.pdf(b.x, df) || 0
        }))
    ];

    const closestBinsForCriticals = criticalValues.map(cv => {
        let closestStr = pureBinsData[0].binCenter;
        let minDiff = Infinity;
        pureBinsData.forEach(p => {
            let diff = Math.abs(parseFloat(p.binCenter) - cv);
            if (diff < minDiff) {
                minDiff = diff;
                closestStr = p.binCenter;
            }
        });
        return { val: cv, str: closestStr };
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '100%' }}>
            <MarcoWidgetMAT251 id="widget-grafica-hp-simulacion" titulo={<>Distribución de Estadísticos Simulados ({renderKatex('\\boldsymbol{\\chi^2_c}')})</>} anchoCompleto={true} alto="480px">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%', marginTop: '5px', fontFamily: FONT }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#10b981', border: '1.5px solid #047857', borderRadius: '50%', opacity: 0.9 }}></div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-pure)', fontWeight: 600 }}>Simulación: Aceptar {renderKatex('\\boldsymbol{H_0}')}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#ef4444', border: '1.5px solid #b91c1c', borderRadius: '50%', opacity: 0.9 }}></div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-pure)', fontWeight: 600 }}>Simulación: Rechazar {renderKatex('\\boldsymbol{H_0}')}</span>
                        </div>
                    </div>

                    <div className="hnp-simulacion-grafica-plot" style={{ width: '100%', flex: 1, minHeight: '300px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart margin={{ top: 30, right: 60, left: 10, bottom: 20 }} style={{ overflow: 'visible' }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                    dataKey="x"
                                    type="number"
                                    domain={['dataMin', 'dataMax']}
                                    ticks={customTicks}
                                    padding={{ left: 30, right: 0 }}
                                    tickFormatter={(v) => {
                                        if (v === 0) return '0';
                                        return parseFloat(v.toFixed(3)).toString();
                                    }}
                tick={{ fill: 'var(--text-pure)', fontSize: 11, fontWeight: 'bold' }}
                                    axisLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                    tickLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                    allowDataOverflow={true}
                                />
                                <YAxis hide dataKey="y" type="number" domain={[0, 'dataMax']} />
                                <ZAxis range={[100, 100]} />
                                <Tooltip content={<CustomTooltip />} />

                                <Area data={combinedData} connectNulls={true} type="step" dataKey="acceptArea" fill="rgba(59, 130, 246, 0.2)" stroke="none" isAnimationActive={false} />
                                <Area data={combinedData} connectNulls={true} type="step" dataKey="rejectArea" fill="rgba(220, 38, 38, 0.15)" stroke="none" isAnimationActive={false} />

                                <Scatter data={scatterRetencion} fill="#10b981" opacity={0.9} stroke="#047857" strokeWidth={1.5} isAnimationActive={false} />
                                <Scatter data={scatterRechazo} fill="#ef4444" opacity={0.9} stroke="#b91c1c" strokeWidth={1.5} isAnimationActive={false} />

                                <Area data={combinedData} connectNulls={true} type="monotone" dataKey="y" fill="none" stroke="#3b82f6" strokeWidth={3} isAnimationActive={false} />

                                {criticalValues.map((val, idx) => {
                                    let mathStr = '';
                                    if (criticalValues.length === 2) mathStr = idx === 0 ? `\\boldsymbol{\\chi^2_{inf}}` : `\\boldsymbol{\\chi^2_{sup}}`;
                                    else mathStr = `\\boldsymbol{\\chi^2_\\alpha}`;

                                    return (
                                        <ReferenceLine
                                            key={idx}
                                            x={val}
                                            stroke="#f97316"
                                            strokeDasharray="4 4"
                                            strokeWidth={2}
                                            label={<CustomKatexLabel position="top" offsetY={0} value={`${mathStr} = ${val.toFixed(3)}`} />}
                                        />
                                    );
                                })}

                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="leyenda-grafica-tema6" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', gap: '15px', fontFamily: FONT, marginTop: '-20px', paddingBottom: '25px', position: 'relative', zIndex: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-input, #f8fafc)', padding: '5px 15px', borderRadius: '5px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '20px', height: '12px', background: 'rgba(220, 38, 38, 0.85)', borderRadius: '2px' }}></div>
                            <div style={{ color: 'var(--text-pure, #1e293b)', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.3px' }}>
                                Zona de Rechazo <span style={{ fontWeight: 'normal', marginLeft: '2px' }}>({renderKatex('\\boldsymbol{H_0}')})</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-input, #f8fafc)', padding: '5px 15px', borderRadius: '5px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '20px', height: '12px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '2px' }}></div>
                            <div style={{ color: 'var(--text-pure, #1e293b)', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.3px' }}>
                                Zona de Aceptación <span style={{ fontWeight: 'normal', marginLeft: '2px' }}>({renderKatex('\\boldsymbol{H_0}')})</span>
                            </div>
                        </div>
                    </div>
                </div>
            </MarcoWidgetMAT251>

            <MarcoWidgetMAT251 id="widget-histograma-puro" titulo="Histograma de Frecuencias Absolutas" anchoCompleto={true} alto="500px">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%', marginTop: '5px', fontFamily: FONT }}>
                    <div className="hnp-simulacion-histograma-plot" style={{ width: '100%', flex: 1, minHeight: '280px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={pureBinsData} margin={{ top: 20, right: 30, left: -30, bottom: 15 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                                <XAxis 
                                    dataKey="binCenter" 
                                    tick={{ fontSize: 11, fill: 'var(--text-pure)', fontWeight: 'bold' }}
                                    tickMargin={8} 
                                    tickFormatter={(v) => Number(v).toFixed(2)}
                                    axisLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                    tickLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                />
                                <YAxis 
                                    yAxisId="left" 
                                    domain={[0, dataMax => Math.ceil(dataMax + 1)]}
                                    tick={{ fontSize: 11, fill: 'var(--text-pure)', fontWeight: 'bold' }}
                                    axisLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                    tickLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                />
                                <YAxis yAxisId="right" orientation="right" hide domain={[0, dataMax => dataMax * 1.1]} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const point = payload[0].payload;
                                            return (
                                                <div style={{ background: 'var(--bg-card, white)', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: FS.sm }}>
                                                    <div><strong>Centro del Rango:</strong> {Number(point.binCenter).toFixed(2)}</div>
                                                    <div>No Rechazos: {point.countRetencion}</div>
                                                    <div>Rechazos: {point.countRechazo}</div>
                                                    <div style={{ fontWeight: 'bold', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #eee' }}>
                                                        Total: {point.countRetencion + point.countRechazo}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar yAxisId="left" dataKey="countRetencion" name="No Rechazo" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} opacity={0.9} />
                                <Bar yAxisId="left" dataKey="countRechazo" name="Rechazo" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} opacity={0.9} />
                                <Area yAxisId="right" connectNulls={true} type="monotone" dataKey="densityCurve" fill="rgba(59, 130, 246, 0.05)" stroke="#3b82f6" strokeWidth={2.5} isAnimationActive={false} />

                                {closestBinsForCriticals.map((obj, idx) => {
                                    let mathStr = '';
                                    if (criticalValues.length === 2) mathStr = idx === 0 ? `\\boldsymbol{\\chi^2_{inf}}` : `\\boldsymbol{\\chi^2_{sup}}`;
                                    else mathStr = `\\boldsymbol{\\chi^2_\\alpha}`;

                                    return (
                                        <ReferenceLine
                                            key={idx}
                                            yAxisId="left"
                                            x={obj.str}
                                            stroke="#f97316"
                                            strokeDasharray="4 4"
                                            strokeWidth={2}
                                            label={<CustomKatexLabel position="top" offsetY={0} value={`${mathStr} = ${obj.val.toFixed(3)}`} />}
                                        />
                                    );
                                })}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="leyenda-grafica-tema6 hnp-simulacion-histograma-leyenda" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '0px', paddingBottom: '25px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '14px', height: '14px', background: '#10b981', borderRadius: '3px', opacity: 0.9 }}></div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-pure)', fontWeight: 600 }}>Frecuencia: Aceptar {renderKatex('\\boldsymbol{H_0}')}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '14px', height: '14px', background: '#ef4444', borderRadius: '3px', opacity: 0.9 }}></div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-pure)', fontWeight: 600 }}>Frecuencia: Rechazar {renderKatex('\\boldsymbol{H_0}')}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '16px', height: '3px', background: '#3b82f6' }}></div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-pure)', fontWeight: 600 }}>Curva Teórica ({renderKatex('\\boldsymbol{\\chi^2_c}')})</span>
                        </div>
                    </div>
                </div>
            </MarcoWidgetMAT251>
        </div>
    );
}
