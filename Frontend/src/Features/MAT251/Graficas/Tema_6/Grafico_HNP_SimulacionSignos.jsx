import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { ComposedChart, Bar, Area, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
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

export default function Grafico_HNP_SimulacionSignos({ resultados }) {
    if (!resultados || !resultados.historial) return null;

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const { n, sObs, historial, tipoPrueba } = resultados;
    
    const alpha = resultados.alpha || 0.05;
    const mu = n / 2;
    const sigma = Math.sqrt(n) / 2;

    let pExtremo = jStat.binomial.cdf(0, n, 0.5);
    if (tipoPrueba === 'bilateral') {
        pExtremo = Math.min(1, 2 * pExtremo);
    }
    const isRejectionImpossible = pExtremo > alpha;

    const isNormalApprox = n > 25;

    let sCritInf = null;
    let sCritSup = null;

    if (isNormalApprox) {
        if (tipoPrueba === 'derecha') {
            sCritSup = jStat.normal.inv(1 - alpha, mu, sigma) + 0.5;
        } else if (tipoPrueba === 'izquierda') {
            sCritInf = jStat.normal.inv(alpha, mu, sigma) - 0.5;
        } else {
            sCritInf = jStat.normal.inv(alpha / 2, mu, sigma) - 0.5;
            sCritSup = jStat.normal.inv(1 - alpha / 2, mu, sigma) + 0.5;
        }
    } else {
        if (tipoPrueba === 'derecha' || tipoPrueba === 'bilateral') {
            const target = tipoPrueba === 'bilateral' ? alpha / 2 : alpha;
            for (let k = 0; k <= n; k++) {
                if (1 - jStat.binomial.cdf(k - 1, n, 0.5) <= target) {
                    sCritSup = k;
                    break;
                }
            }
        }
        if (tipoPrueba === 'izquierda' || tipoPrueba === 'bilateral') {
            const target = tipoPrueba === 'bilateral' ? alpha / 2 : alpha;
            for (let k = n; k >= 0; k--) {
                if (jStat.binomial.cdf(k, n, 0.5) <= target) {
                    sCritInf = k;
                    break;
                }
            }
        }
    }

    const esRechazo = (s) => {
        if (tipoPrueba === 'derecha') return sCritSup != null && s >= sCritSup;
        if (tipoPrueba === 'izquierda') return sCritInf != null && s <= sCritInf;
        return (sCritInf != null && s <= sCritInf) || (sCritSup != null && s >= sCritSup);
    };

    // --- WIDGET 1: Curva de Densidad (Aproximación Normal) + Puntos Empíricos ---
    let minX_w1 = 0, maxX_w1 = n, chartData = [], scatterRechazo = [], scatterRetencion = [];
    
    if (isNormalApprox) {
        minX_w1 = Math.min(0, mu - 3.5 * sigma);
        maxX_w1 = Math.max(n, mu + 3.5 * sigma);

        const step = (maxX_w1 - minX_w1) / 300;
        for (let x = minX_w1; x <= maxX_w1; x += step) {
            let y = jStat.normal.pdf(x, mu, sigma);
            let isReject = esRechazo(x);
            chartData.push({
                x: Number(x.toFixed(3)),
                y,
                rejectArea: isReject ? y : 0,
                acceptArea: !isReject ? y : 0
            });
        }
    } else {
        minX_w1 = -0.5;
        maxX_w1 = n + 0.5;
        for (let k = 0; k <= n; k++) {
            let y = jStat.binomial.pdf(k, n, 0.5);
            let isReject = esRechazo(k);
            
            // Espacio vacío antes de la barra
            chartData.push({ x: Number((k - 0.401).toFixed(3)), y: 0, rejectArea: 0, acceptArea: 0 });
            // Esquina superior izquierda
            chartData.push({ x: Number((k - 0.4).toFixed(3)), y, rejectArea: isReject ? y : 0, acceptArea: !isReject ? y : 0 });
            // Esquina superior derecha
            chartData.push({ x: Number((k + 0.4).toFixed(3)), y, rejectArea: isReject ? y : 0, acceptArea: !isReject ? y : 0 });
            // Espacio vacío después de la barra
            chartData.push({ x: Number((k + 0.401).toFixed(3)), y: 0, rejectArea: 0, acceptArea: 0 });
        }
    }

    // Limite visual para Scatter
    const MAX_PUNTOS = 800;
    const paso = historial.length > MAX_PUNTOS ? Math.ceil(historial.length / MAX_PUNTOS) : 1;

    historial.forEach((sim, idx) => {
        if (idx % paso !== 0) return;
        const x = sim.estadistico;
        const y = 0; // Sobreponer en el eje X exactamente

        const isRejection = sim.decision === 'Rechazar H₀';
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
                        <div>Estadístico S: {data.x}</div>
                    </div>
                );
            }
        }
        return null;
    };

    // --- WIDGET 2: Histograma Absoluto (Frecuencias Binomiales/Normales) ---
    const pureBinsData = [];
    
    // Punto fantasma a la izquierda para forzar a la línea a tocar el piso
    pureBinsData.push({
        binCenter: '-1',
        countRetencion: 0,
        countRechazo: 0,
        densityCurve: 0
    });

    for (let i = 0; i <= n; i++) {
        const prob = isNormalApprox ? jStat.normal.pdf(i, mu, sigma) : jStat.binomial.pdf(i, n, 0.5);
        pureBinsData.push({
            binCenter: i.toString(),
            countRetencion: 0,
            countRechazo: 0,
            densityCurve: prob * historial.length
        });
    }

    // Punto fantasma a la derecha para forzar a la línea a tocar el piso
    pureBinsData.push({
        binCenter: (n + 1).toString(),
        countRetencion: 0,
        countRechazo: 0,
        densityCurve: 0
    });

    historial.forEach(sim => {
        if (sim.estadistico >= 0 && sim.estadistico <= n) {
            const isRejection = sim.decision === 'Rechazar H₀';
            // +1 al índice porque añadimos un punto fantasma en la posición 0
            if (isRejection) pureBinsData[sim.estadistico + 1].countRechazo++;
            else pureBinsData[sim.estadistico + 1].countRetencion++;
        }
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '100%' }}>
            {/* WIDGET 1 */}
            <MarcoWidgetMAT251 id="widget-grafica-hp-simulacion-signos" titulo={<>Distribución de Estadísticos Simulados (S)</>} anchoCompleto={true} alto="480px">
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%', marginTop: '5px', fontFamily: FONT, position: 'relative' }}>
                        
                        {!isNormalApprox && (
                            <div style={{ position: 'absolute', top: '5px', right: '15px', padding: '8px 12px', fontSize: '0.9rem', color: 'var(--text-pure)', zIndex: 10, display: 'flex', flexDirection: 'column', minWidth: '80px' }}>
                                {renderKatex(`\\begin{aligned} \\mathbf{n} &\\mathbf{=} ${n} \\\\ \\mathbf{p} &\\mathbf{=} 0.5 \\end{aligned}`)}
                            </div>
                        )}

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
                                        domain={isNormalApprox ? ['dataMin', 'dataMax'] : [-0.5, n + 0.5]}
                                        ticks={isNormalApprox ? undefined : Array.from({length: n + 1}, (_, i) => i)}
                                        tickFormatter={(val) => Math.round(val)}
                                        tick={{ fill: 'var(--text-pure)', fontSize: 12, fontWeight: 'normal' }}
                                        axisLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                        tickLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                    />
                                    <YAxis hide dataKey="y" type="number" domain={[0, dataMax => dataMax * 1.25]} />
                                    <ZAxis range={[100, 100]} />
                                    <Tooltip content={<CustomScatterTooltip />} />

                                    <Area data={chartData} connectNulls={true} type={isNormalApprox ? "monotone" : "linear"} dataKey="acceptArea" fill="rgba(59, 130, 246, 0.2)" stroke="none" isAnimationActive={false} />
                                    <Area data={chartData} connectNulls={true} type={isNormalApprox ? "monotone" : "linear"} dataKey="rejectArea" fill="rgba(220, 38, 38, 0.15)" stroke="none" isAnimationActive={false} />

                                    <Scatter data={scatterRetencion} fill="#10b981" opacity={0.65} stroke="#047857" strokeWidth={1.5} isAnimationActive={false} />
                                    <Scatter data={scatterRechazo} fill="#ef4444" opacity={0.65} stroke="#b91c1c" strokeWidth={1.5} isAnimationActive={false} />

                                    <Area data={chartData} connectNulls={true} type={isNormalApprox ? "monotone" : "linear"} dataKey="y" fill="none" stroke="#3b82f6" strokeWidth={3} isAnimationActive={false} />

                                    {sCritInf != null && (
                                        <ReferenceLine
                                            x={sCritInf}
                                            stroke="#f97316"
                                            strokeDasharray="4 4"
                                            strokeWidth={2}
                                            label={<CustomKatexLabel position="top" offsetY={0} value={`S_{crit} = ${sCritInf.toFixed(3)}`} />}
                                        />
                                    )}
                                    {sCritSup != null && (
                                        <ReferenceLine
                                            x={sCritSup}
                                            stroke="#f97316"
                                            strokeDasharray="4 4"
                                            strokeWidth={2}
                                            label={<CustomKatexLabel position="top" offsetY={0} value={`S_{crit} = ${sCritSup.toFixed(3)}`} />}
                                        />
                                    )}

                                    {sObs != null && (
                                        <ReferenceLine
                                            x={sObs}
                                            stroke="var(--accent-color)"
                                            strokeDasharray="2 2"
                                            strokeWidth={2}
                                            label={<CustomKatexLabel position="insideTopLeft" offsetY={15} value={`S_{obs} = ${sObs}`} />}
                                        />
                                    )}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', gap: '15px', fontFamily: FONT, marginTop: '-20px', paddingBottom: '25px', position: 'relative', zIndex: 10 }}>
                            {!isRejectionImpossible && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-input, #f8fafc)', padding: '5px 15px', borderRadius: '5px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                                    <div style={{ width: '20px', height: '12px', background: 'rgba(220, 38, 38, 0.85)', borderRadius: '2px' }}></div>
                                    <div style={{ color: 'var(--text-pure, #1e293b)', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.3px' }}>
                                        Zona de Rechazo <span style={{ fontWeight: 'normal', marginLeft: '2px' }}>({renderKatex('H_0')})</span>
                                    </div>
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-input, #f8fafc)', padding: '5px 15px', borderRadius: '5px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                                <div style={{ width: '20px', height: '12px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '2px' }}></div>
                                <div style={{ color: 'var(--text-pure, #1e293b)', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.3px' }}>
                                    Zona de Aceptación <span style={{ fontWeight: 'normal', marginLeft: '2px' }}>({renderKatex('H_0')})</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </MarcoWidgetMAT251>

            {/* WIDGET 2 */}
            <MarcoWidgetMAT251 id="widget-histograma-puro-signos" titulo="Histograma de Frecuencias Absolutas" anchoCompleto={true} alto="500px">
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%', marginTop: '5px', fontFamily: FONT, position: 'relative' }}>
                    {/* Estadísticas Teóricas (mu, sigma) - Solo para Normal */}
                    {isNormalApprox && (
                        <div style={{ position: 'absolute', top: '5px', right: '15px', padding: '8px 12px', fontSize: '0.9rem', color: 'var(--text-pure)', zIndex: 10, display: 'flex', flexDirection: 'column', minWidth: '80px' }}>
                            {renderKatex(`\\begin{aligned} \\mathbf{\\mu} &\\mathbf{=} ${mu % 1 === 0 ? mu : mu.toFixed(3)} \\\\ \\mathbf{\\sigma} &\\mathbf{\\approx} ${sigma.toFixed(3)} \\end{aligned}`)}
                        </div>
                    )}
                    
                    <div style={{ width: '100%', flex: 1, minHeight: '280px', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={pureBinsData} margin={{ top: 20, right: 30, left: -10, bottom: 15 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                                <XAxis 
                                    dataKey="binCenter" 
                                    tickFormatter={(val) => {
                                        if (val === '-1' || val === (n + 1).toString()) return '';
                                        return val;
                                    }}
                                    tick={{ fontSize: 11, fill: 'var(--text-pure)' }} 
                                    tickMargin={8} 
                                    axisLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                    tickLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                    label={{ value: 'Estadístico S', position: 'bottom', offset: 0, fill: 'var(--text-pure)', fontSize: 12 }}
                                />
                                <YAxis 
                                    yAxisId="left" 
                                    domain={[0, dataMax => Math.ceil(dataMax + 1)]}
                                    tick={{ fontSize: 11, fill: 'var(--text-pure)' }} 
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
                                                <div style={{ background: 'var(--bg-card, white)', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: FS.sm, color: 'var(--text-pure)' }}>
                                                    <div><strong>S: {point.binCenter}</strong></div>
                                                    <div>No Rechazos: {point.countRetencion}</div>
                                                    <div>Rechazos: {point.countRechazo}</div>
                                                    <div style={{ fontWeight: 'bold', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid var(--border-color)' }}>
                                                        Total: {point.countRetencion + point.countRechazo}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar yAxisId="left" dataKey="countRetencion" name="No Rechazo" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} opacity={0.9} isAnimationActive={false} maxBarSize={60} />
                                <Bar yAxisId="left" dataKey="countRechazo" name="Rechazo" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} opacity={0.9} isAnimationActive={false} maxBarSize={60} />
                                {isNormalApprox && (
                                    <Area yAxisId="right" connectNulls={true} type="natural" dataKey="densityCurve" name="Esperanza Teórica Normal (Z)" fill="rgba(59, 130, 246, 0.05)" stroke="#3b82f6" strokeWidth={2.5} isAnimationActive={false} />
                                )}

                                {sCritInf != null && (
                                    <ReferenceLine
                                        yAxisId="left"
                                        x={isNormalApprox ? Math.round(sCritInf).toString() : sCritInf.toString()}
                                        stroke="#f97316"
                                        strokeDasharray="4 4"
                                        strokeWidth={2}
                                        label={<CustomKatexLabel position="top" offsetY={0} value={`S_{crit} ${isNormalApprox ? '\\approx ' + Math.round(sCritInf) : '= ' + sCritInf}`} />}
                                    />
                                )}
                                {sCritSup != null && (
                                    <ReferenceLine
                                        yAxisId="left"
                                        x={isNormalApprox ? Math.round(sCritSup).toString() : sCritSup.toString()}
                                        stroke="#f97316"
                                        strokeDasharray="4 4"
                                        strokeWidth={2}
                                        label={<CustomKatexLabel position="top" offsetY={0} value={`S_{crit} ${isNormalApprox ? '\\approx ' + Math.round(sCritSup) : '= ' + sCritSup}`} />}
                                    />
                                )}

                                {sObs != null && (
                                    <ReferenceLine
                                        yAxisId="left"
                                        x={sObs.toString()}
                                        stroke="var(--accent-color)"
                                        strokeDasharray="2 2"
                                        strokeWidth={2}
                                        label={<CustomKatexLabel position="insideTopLeft" offsetY={15} value={`S_{obs} = ${sObs}`} />}
                                    />
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '0px', paddingBottom: '25px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '14px', height: '14px', background: '#10b981', borderRadius: '3px', opacity: 0.9 }}></div>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-pure)', fontWeight: 600 }}>Frecuencia: Aceptar {renderKatex('H_0')}</span>
                        </div>
                        {!isRejectionImpossible && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '14px', height: '14px', background: '#ef4444', borderRadius: '3px', opacity: 0.9 }}></div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-pure)', fontWeight: 600 }}>Frecuencia: Rechazar {renderKatex('H_0')}</span>
                            </div>
                        )}
                        {isNormalApprox && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '16px', height: '3px', background: '#3b82f6' }}></div>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-pure)', fontWeight: 600 }}>
                                    Esperanza Teórica Normal (Z)
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </MarcoWidgetMAT251>
        </div>
    );
}
