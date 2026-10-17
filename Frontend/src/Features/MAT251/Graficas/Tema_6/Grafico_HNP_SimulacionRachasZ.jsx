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

export default function Grafico_HNP_SimulacionRachasZ({ resultados }) {
    if (!resultados || !resultados.historial || !resultados.valorCritico) return null;

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const { historial, valorCritico } = resultados;
    const tipoPrueba = resultados.tipoPrueba || 'bilateral';
    const cv = Number(valorCritico);
    
    let criticalValues = [];
    if (tipoPrueba === 'bilateral') criticalValues = [-Math.abs(cv), Math.abs(cv)];
    else if (tipoPrueba === 'izquierda') criticalValues = [cv];
    else if (tipoPrueba === 'derecha') criticalValues = [cv];

    // --- Curva de Densidad Normal N(0,1) ---
    const chartData = [];
    const minX = -4;
    const maxX = 4;
    const step = (maxX - minX) / 300;

    for (let x = minX; x <= maxX; x += step) {
        let y = jStat.normal.pdf(x, 0, 1);
        let isReject = false;
        if (tipoPrueba === 'bilateral') isReject = x <= criticalValues[0] || x >= criticalValues[1];
        else if (tipoPrueba === 'izquierda') isReject = x <= criticalValues[0];
        else if (tipoPrueba === 'derecha') isReject = x >= criticalValues[0];
        
        chartData.push({
            x: Number(x.toFixed(3)),
            y,
            rejectArea: isReject ? y : 0,
            acceptArea: !isReject ? y : 0
        });
    }

    // --- Limite visual para Scatter ---
    const MAX_PUNTOS = 800;
    const paso = historial.length > MAX_PUNTOS ? Math.ceil(historial.length / MAX_PUNTOS) : 1;

    const scatterRechazo = [];
    const scatterRetencion = [];

    historial.forEach((sim, idx) => {
        if (idx % paso !== 0) return;
        const x = sim.estadistico; // Z_c
        const y = 0; // Sobreponer en el eje X exactamente

        let isRejection = false;
        if (tipoPrueba === 'bilateral') isRejection = x <= criticalValues[0] || x >= criticalValues[1];
        else if (tipoPrueba === 'izquierda') isRejection = x <= criticalValues[0];
        else if (tipoPrueba === 'derecha') isRejection = x >= criticalValues[0];

        const pt = { x, y, sim: sim.iteracion };
        if (isRejection) scatterRechazo.push(pt);
        else scatterRetencion.push(pt);
    });

    const CustomScatterTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            if (data.sim) {
                return (
                    <div style={{ background: 'var(--bg-card, white)', padding: '10px', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '4px', fontSize: FS.sm, color: 'var(--text-pure, black)' }}>
                        <div><strong>Simulación #{data.sim}</strong></div>
                        <div>Estadístico Z_c: {data.x.toFixed(4)}</div>
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <MarcoWidgetMAT251 id="widget-grafica-hp-simulacion-rachas-z" titulo={<>Distribución de Estadísticos Simulados (Z)</>} anchoCompleto={true} alto="450px">
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%', marginTop: '5px', fontFamily: FONT, position: 'relative' }}>
                
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#10b981', border: '1.5px solid #047857', borderRadius: '50%', opacity: 0.9 }}></div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-pure)', fontWeight: 600 }}>Simulación: Aceptar {renderKatex('H_0')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#ef4444', border: '1.5px solid #b91c1c', borderRadius: '50%', opacity: 0.9 }}></div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-pure)', fontWeight: 600 }}>Simulación: Rechazar {renderKatex('H_0')}</span>
                    </div>
                </div>

                <div style={{ width: '100%', flex: 1, minHeight: '300px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart margin={{ top: 30, right: 30, left: 10, bottom: 20 }} style={{ overflow: 'visible' }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="x"
                                type="number"
                                domain={[-4, 4]}
                                tickFormatter={(val) => Math.round(val)}
                                tick={{ fill: 'var(--text-pure)', fontSize: 12, fontWeight: 'normal' }}
                                axisLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                tickLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                            />
                            <YAxis hide dataKey="y" type="number" domain={[0, dataMax => dataMax * 1.25]} />
                            <ZAxis range={[100, 100]} />
                            <Tooltip content={<CustomScatterTooltip />} />

                            <Area data={chartData} connectNulls={true} type="monotone" dataKey="acceptArea" fill="rgba(59, 130, 246, 0.2)" stroke="none" isAnimationActive={false} />
                            <Area data={chartData} connectNulls={true} type="monotone" dataKey="rejectArea" fill="rgba(220, 38, 38, 0.15)" stroke="none" isAnimationActive={false} />

                            <Scatter data={scatterRetencion} fill="#10b981" opacity={0.65} stroke="#047857" strokeWidth={1.5} isAnimationActive={false} />
                            <Scatter data={scatterRechazo} fill="#ef4444" opacity={0.65} stroke="#b91c1c" strokeWidth={1.5} isAnimationActive={false} />

                            <Area data={chartData} connectNulls={true} type="monotone" dataKey="y" fill="none" stroke="#3b82f6" strokeWidth={3} isAnimationActive={false} />

                            {criticalValues.map((val, idx) => {
                                let labelKatex = '';
                                if (tipoPrueba === 'bilateral') {
                                    labelKatex = idx === 0 ? `-Z_{crit} = ${val.toFixed(3)}` : `Z_{crit} = ${val.toFixed(3)}`;
                                } else {
                                    labelKatex = `Z_{crit} = ${val.toFixed(3)}`;
                                }
                                return (
                                    <ReferenceLine
                                        key={idx} x={val} stroke="#f97316" strokeDasharray="4 4" strokeWidth={2}
                                        label={<CustomKatexLabel position="top" offsetY={0} value={labelKatex} />}
                                    />
                                );
                            })}
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
                            Zona de Aceptación <span style={{ fontWeight: 'normal', marginLeft: '2px' }}>({renderKatex('H_0')})</span>
                        </div>
                    </div>
                </div>
            </div>
        </MarcoWidgetMAT251>
    );
}
