import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { ComposedChart, Area, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
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

export default function Grafico_HP_SimulacionT({ resultados, prueba }) {
    if (!resultados || !resultados.historial) return null;
    const c = resultados.parametrosPrueba;

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const alpha = c.alpha;
    const tipoPrueba = c.tipoPrueba;
    const df = c.n - 1;

    const criticalValues = (() => {
        const crits = [];
        if (tipoPrueba === 'bilateral') {
            const crit = jStat.studentt.inv(1 - alpha / 2, df);
            crits.push(-crit, crit);
        } else if (tipoPrueba === 'derecha') {
            const crit = jStat.studentt.inv(1 - alpha, df);
            crits.push(crit);
        } else if (tipoPrueba === 'izquierda') {
            const crit = jStat.studentt.inv(alpha, df);
            crits.push(crit);
        }
        return crits;
    })();

    const chartData = (() => {
        const data = [];
        let maxT = 4;
        resultados.historial.forEach(sim => {
            if (Math.abs(sim.estadistico) > maxT) maxT = Math.abs(sim.estadistico) * 1.1;
        });

        let minX = -maxT;
        let maxX = maxT;

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
            let y = jStat.studentt.pdf(x, df);
            let isReject = false;

            if (tipoPrueba === 'bilateral') {
                if (x <= criticalValues[0] + 0.0005 || x >= criticalValues[1] - 0.0005) isReject = true;
            } else if (tipoPrueba === 'derecha') {
                if (x >= criticalValues[0] - 0.0005) isReject = true;
            } else if (tipoPrueba === 'izquierda') {
                if (x <= criticalValues[0] + 0.0005) isReject = true;
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
        const minX = chartData.length > 0 ? chartData[0].x : -4;
        const maxX = chartData.length > 0 ? chartData[chartData.length - 1].x : 4;

        const importantTicks = [0, ...criticalValues];
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

    let scatterRechazo = [];
    let scatterRetencion = [];

    const MAX_PUNTOS = 800;
    const paso = resultados.historial.length > MAX_PUNTOS ? Math.ceil(resultados.historial.length / MAX_PUNTOS) : 1;

    resultados.historial.forEach((sim, idx) => {
        if (idx % paso !== 0) return;

        const isRejection = sim.decision === 'Rechazar H₀';
        const pt = {
            x: Number(sim.estadistico.toFixed(3)),
            y: 0,
            sim: sim.iteracion,
            x_bar: Number(sim.x_bar.toFixed(3)),
            s: sim.s ? Number(sim.s.toFixed(3)) : '-',
            pValor: Number(sim.pValor.toFixed(4))
        };
        if (isRejection) scatterRechazo.push(pt);
        else scatterRetencion.push(pt);
    });

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            if (payload[0].payload.sim) {
                const data = payload[0].payload;
                return (
                    <div style={{ background: 'var(--bg-card, white)', padding: '10px', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '4px', fontSize: FS.sm, color: 'var(--text-pure, black)' }}>
                        <div><strong>Simulación #{data.sim}</strong></div>
                        <div>Estadístico {renderKatex('T_c')}: {data.x}</div>
                        <div>{renderKatex('\\bar{x}')}: {data.x_bar}</div>
                        <div>{renderKatex('s')}: {data.s}</div>
                        <div>p-Valor: {data.pValor}</div>
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <MarcoWidgetMAT251 id="widget-grafica-hp-simulacion" titulo={<>Distribución de Estadísticos Simulados ({renderKatex('T_c')})</>} anchoCompleto={true} alto="480px">
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%', marginTop: '5px', fontFamily: FONT }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#10b981', border: '1.5px solid #047857', borderRadius: '50%', opacity: 0.9 }}></div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-pure)', fontWeight: 600 }}>Simulación: No Rechazar {renderKatex('H_0')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#ef4444', border: '1.5px solid #b91c1c', borderRadius: '50%', opacity: 0.9 }}></div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-pure)', fontWeight: 600 }}>Simulación: Rechazar {renderKatex('H_0')}</span>
                    </div>
                </div>

                <div style={{ width: '100%', flex: 1, minHeight: '300px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart margin={{ top: 30, right: 60, left: 45, bottom: 20 }} style={{ overflow: 'visible' }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="x"
                                type="number"
                                domain={['dataMin', 'dataMax']}
                                ticks={customTicks}
                                padding={{ left: 30, right: 60 }}
                                tickFormatter={(v) => {
                                    if (v === 0) return '0';
                                    return parseFloat(v.toFixed(3)).toString();
                                }}
                                tick={{ fill: 'var(--text-main, #333333)', fontSize: 12, fontWeight: 'normal' }}
                                axisLine={{ stroke: 'var(--text-main, #333333)', strokeWidth: 2 }}
                                tickLine={{ stroke: 'var(--text-main, #333333)', strokeWidth: 2 }}
                                allowDataOverflow={true}
                            />
                            <YAxis hide dataKey="y" type="number" domain={[0, 'dataMax']} />
                            <ZAxis range={[100, 100]} />
                            <Tooltip content={<CustomTooltip />} />

                            <Area data={chartData} type="linear" dataKey="acceptArea" fill="rgba(59, 130, 246, 0.1)" stroke="none" isAnimationActive={false} />
                            <Area data={chartData} type="linear" dataKey="rejectArea" fill="rgba(220, 38, 38, 0.85)" stroke="none" isAnimationActive={false} />
                            <Area data={chartData} type="monotone" dataKey="y" fill="none" stroke="#3b82f6" strokeWidth={3} isAnimationActive={false} />

                            {criticalValues.map((val, idx) => {
                                let mathStr = '';
                                if (criticalValues.length === 2) mathStr = idx === 0 ? `-t_{\\alpha/2}` : `t_{\\alpha/2}`;
                                else mathStr = val < 0 ? `-t_\\alpha` : `t_\\alpha`;

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

                            <Scatter name="Retención" data={scatterRetencion} fill="#10b981" opacity={0.9} stroke="#047857" strokeWidth={1.5} isAnimationActive={true} />
                            <Scatter name="Rechazo" data={scatterRechazo} fill="#ef4444" opacity={0.9} stroke="#b91c1c" strokeWidth={1.5} isAnimationActive={true} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', gap: '15px', fontFamily: FONT, marginTop: '-20px', paddingBottom: '25px', position: 'relative', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-input, #f8fafc)', padding: '5px 15px', borderRadius: '5px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: '20px', height: '12px', background: 'rgba(220, 38, 38, 0.85)', borderRadius: '2px' }}></div>
                        <div style={{ color: 'var(--text-pure, #1e293b)', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.3px' }}>
                            Zona de Rechazo <span style={{ fontWeight: 'normal', marginLeft: '2px' }}>({renderKatex('H_0')})</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-input, #f8fafc)', padding: '5px 15px', borderRadius: '5px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: '20px', height: '12px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '2px' }}></div>
                        <div style={{ color: 'var(--text-pure, #1e293b)', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.3px' }}>
                            Zona de No Rechazo <span style={{ fontWeight: 'normal', marginLeft: '2px' }}>({renderKatex('H_0')})</span>
                        </div>
                    </div>
                </div>
            </div>
        </MarcoWidgetMAT251>
    );
}
