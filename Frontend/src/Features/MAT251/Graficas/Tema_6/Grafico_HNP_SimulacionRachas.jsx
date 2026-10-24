import React, { useMemo } from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FONT, FS } from '../../Principal/Constantes';
import MarcoWidgetMAT251 from '../../ui/MarcoWidgetMAT251';
import katex from 'katex';
import 'katex/dist/katex.min.css';

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
                style={{ color: 'var(--text-main, #1e293b)', fontSize: '11px', fontWeight: 'normal', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '100%' }}
            />
        </foreignObject>
    );
};

export default function Grafico_HNP_SimulacionRachas({ resultados }) {
    if (!resultados || !resultados.historial || resultados.historial.length === 0) return null;

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const { historial, muR, sigmaR, valorCritico } = resultados;

    const pureBinsData = useMemo(() => {
        const counts = {};
        
        historial.forEach(sim => {
            if (sim.rachas !== undefined && sim.rachas !== null && !sim.isVacia) {
                const r = sim.rachas;
                if (!counts[r]) {
                    counts[r] = {
                        racha: r,
                        countRetencion: 0,
                        countRechazo: 0,
                    };
                }
                const isRejection = sim.decision === 'Rechazar H₀';
                if (isRejection) counts[r].countRechazo++;
                else counts[r].countRetencion++;
            }
        });

        const dataKeys = Object.keys(counts).map(Number);
        if (dataKeys.length === 0) return [];

        let minR = Math.max(1, Math.min(...dataKeys) - 1);
        let maxR = Math.max(...dataKeys) + 1;
        const fullData = [{
            binCenter: (minR - 1).toString(),
            countRetencion: 0,
            countRechazo: 0,
        }];

        for (let r = minR; r <= maxR; r++) {
            fullData.push({
                binCenter: r.toString(),
                countRetencion: counts[r]?.countRetencion ?? 0,
                countRechazo: counts[r]?.countRechazo ?? 0,
            });
        }

        fullData.push({
            binCenter: (maxR + 1).toString(),
            countRetencion: 0,
            countRechazo: 0,
        });
        return fullData;
    }, [historial]);

    return (
        <MarcoWidgetMAT251 id="widget-histograma-simulacion-rachas" titulo="Histograma de Frecuencias Absolutas (Rachas Obtenidas)" anchoCompleto={true} alto="500px">
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%', marginTop: '5px', fontFamily: FONT, position: 'relative' }}>
                <div style={{ position: 'absolute', top: '5px', right: '15px', padding: '8px 12px', fontSize: '11px', color: 'var(--text-pure)', zIndex: 10, display: 'flex', flexDirection: 'column', minWidth: '80px' }}>
                    {renderKatex(`\\begin{aligned} \\mathbf{\\mu_R} &\\mathbf{\\approx} ${muR.toFixed(3)} \\\\ \\mathbf{\\sigma_R} &\\mathbf{\\approx} ${sigmaR.toFixed(3)} \\end{aligned}`)}
                </div>
                <div className="hnp-simulacion-histograma-plot" style={{ width: '100%', flex: 1, minHeight: '280px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={pureBinsData} margin={{ top: 20, right: 10, left: -30, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} stroke="#e2e8f0" />
                            <XAxis 
                                dataKey="binCenter" 
                                tickFormatter={(val) => {
                                    if (pureBinsData.length > 0 && (val === pureBinsData[0].binCenter || val === pureBinsData[pureBinsData.length - 1].binCenter)) return '';
                                    return val;
                                }}
                                tick={{ fontSize: 11, fill: 'var(--text-pure)', fontWeight: 'bold' }}
                                tickMargin={8} 
                                axisLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                tickLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                label={{ value: 'Cantidad de Rachas (R)', position: 'bottom', offset: 0, fill: 'var(--text-pure)', fontSize: 11 }}
                            />
                            <YAxis 
                                yAxisId="left" 
                                domain={[0, dataMax => Math.ceil(dataMax + 1)]}
                                tick={{ fontSize: 11, fill: 'var(--text-pure)', fontWeight: 'bold' }}
                                axisLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                                tickLine={{ stroke: 'var(--text-pure)', strokeWidth: 2 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const point = payload[0].payload;
                                        return (
                                            <div style={{ background: 'var(--bg-card, white)', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: FS.sm, color: 'var(--text-pure)' }}>
                                                <div><strong>Rachas (R): {point.binCenter}</strong></div>
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
                            {muR && (
                                <ReferenceLine
                                    yAxisId="left"
                                    x={Math.round(muR).toString()}
                                    stroke="#f97316"
                                    strokeDasharray="4 4"
                                    strokeWidth={2}
                                    label={<CustomKatexLabel position="top" offsetY={0} value={`\\mathbf{\\mu}_R \\approx ${Math.round(muR)}`} />}
                                />
                            )}
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <div className="leyenda-grafica-tema6 hnp-simulacion-histograma-leyenda" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '0px', paddingBottom: '25px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '14px', height: '14px', background: '#10b981', borderRadius: '3px', opacity: 0.9 }}></div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-pure)', fontWeight: 600 }}>Frecuencia: Aceptar {renderKatex('H_0')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '14px', height: '14px', background: '#ef4444', borderRadius: '3px', opacity: 0.9 }}></div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-pure)', fontWeight: 600 }}>Frecuencia: Rechazar {renderKatex('H_0')}</span>
                    </div>
                </div>
            </div>
        </MarcoWidgetMAT251>
    );
}
