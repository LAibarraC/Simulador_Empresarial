import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { jStat } from 'jstat';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FONT } from '../../Principal/Constantes';
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

const CustomCalloutLabel = (props) => {
    const { viewBox, value, isNegative } = props;
    if (!viewBox) return null;
    const { x, y, height } = viewBox;
    
    const direction = isNegative ? 'left' : 'right';
    
    // Origin at the X-axis
    const x0 = x;
    const y0 = y + height;
    
    // Diagonal line displacement
    const dx = direction === 'right' ? 15 : -15;
    const dy = -40; // up
    
    // Horizontal line displacement
    const hx = direction === 'right' ? 10 : -10;
    
    const x1 = x0 + dx;
    const y1 = y0 + dy;
    
    const x2 = x1 + hx;
    const y2 = y1;
    
    return (
        <g style={{ overflow: 'visible' }}>
            {/* Punto en el eje */}
            <circle cx={x0} cy={y0} r={4} fill="var(--text-pure)" />
            
            {/* Línea diagonal */}
            <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="var(--text-pure)" strokeWidth={2} />
            
            {/* Línea horizontal */}
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--text-pure)" strokeWidth={2} />
            
            {/* Texto matemático */}
            <foreignObject 
                x={direction === 'right' ? x2 + 5 : x2 - 95} 
                y={y2 - 15} 
                width={90} 
                height={30} 
                style={{ overflow: 'visible' }}
            >
                <div 
                    dangerouslySetInnerHTML={{ __html: katex.renderToString(value, { throwOnError: false }) }} 
                    style={{ 
                        color: 'var(--text-pure)', 
                        fontSize: '13px', 
                        fontWeight: 'normal', 
                        display: 'flex', 
                        alignItems: 'center', 
                        height: '100%', 
                        whiteSpace: 'nowrap',
                        justifyContent: direction === 'right' ? 'flex-start' : 'flex-end' 
                    }} 
                />
            </foreignObject>
        </g>
    ); 
};

export default function Grafico_HNP({ resultados, prueba, id = "grafico-hnp", isMaximized }) {
    if (!resultados || !resultados.calculos) return null;
    const c = resultados.calculos;

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    // Generar datos para la gráfica
    const dfReal = resultados.gl !== undefined ? resultados.gl : (resultados.df !== undefined ? resultados.df : c.n - 1);

    const criticalValues = (() => {
        const isChi = prueba === 'varianza';
        const df = dfReal;
        const crits = [];
        if (c.tipoPrueba === 'bilateral') {
            if (isChi) {
                crits.push(jStat.chisquare.inv(c.alpha / 2, df), jStat.chisquare.inv(1 - c.alpha / 2, df));
            } else {
                const crit = (prueba === 'media_t') ? jStat.studentt.inv(1 - c.alpha / 2, df) : jStat.normal.inv(1 - c.alpha / 2, 0, 1);
                crits.push(-crit, crit);
            }
        } else if (c.tipoPrueba === 'derecha') {
            if (isChi) {
                crits.push(jStat.chisquare.inv(1 - c.alpha, df));
            } else {
                const crit = (prueba === 'media_t') ? jStat.studentt.inv(1 - c.alpha, df) : jStat.normal.inv(1 - c.alpha, 0, 1);
                crits.push(crit);
            }
        } else if (c.tipoPrueba === 'izquierda') {
            if (isChi) {
                crits.push(jStat.chisquare.inv(c.alpha, df));
            } else {
                const crit = (prueba === 'media_t') ? jStat.studentt.inv(c.alpha, df) : jStat.normal.inv(c.alpha, 0, 1);
                crits.push(crit);
            }
        }
        return crits;
    })();

    const chartData = (() => {
        const data = [];
        const isChi = prueba === 'varianza';
        const df = dfReal;
        
        let minX = -4;
        let maxX = 4;
        
        if (isChi) {
            minX = 0;
            maxX = Math.max(df * 2.5, resultados.estadistico * 1.5, ...(criticalValues.map(v => v * 1.2)), 20); 
        } else {
            const maxVal = Math.max(4, Math.abs(resultados.estadistico) * 1.2, ...(criticalValues.map(Math.abs).map(v => v * 1.2)));
            minX = -maxVal;
            maxX = maxVal;
        }

        const step = (maxX - minX) / 200;

        for (let x = minX; x <= maxX; x += step) {
            let y = 0;
            if (prueba === 'media_z' || prueba === 'proporcion') {
                y = jStat.normal.pdf(x, 0, 1);
            } else if (prueba === 'media_t') {
                y = jStat.studentt.pdf(x, df);
            } else if (prueba === 'varianza') {
                y = jStat.chisquare.pdf(x, df);
            }
            
            let isReject = false;
            
            if (c.tipoPrueba === 'bilateral') {
                if (x <= criticalValues[0] || x >= criticalValues[1]) isReject = true;
            } else if (c.tipoPrueba === 'derecha') {
                if (x >= criticalValues[0]) isReject = true;
            } else if (c.tipoPrueba === 'izquierda') {
                if (x <= criticalValues[0]) isReject = true;
            }

            data.push({
                x: Number(x.toFixed(3)),
                y,
                rejectArea: isReject ? y : 0,
                acceptArea: !isReject ? y : 0
            });
        }
        return data;
    })();

    const customTicks = (() => {
        const minX = chartData.length > 0 ? chartData[0].x : -4;
        const maxX = chartData.length > 0 ? chartData[chartData.length - 1].x : 4;
        
        const df = dfReal;
        const importantTicks = [prueba === 'varianza' ? df : 0, resultados.estadistico, ...criticalValues];
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
        return Array.from(new Set(allTicks.map(v => Number(v.toFixed(3))))).sort((a,b) => a - b);
    })();

    const statSymbol = prueba === 'media_t' ? '\\boldsymbol{T}' : prueba === 'varianza' ? '\\boldsymbol{\\chi^2}' : '\\boldsymbol{Z}';

    return (
        <MarcoWidgetMAT251 
            id={id}
            titulo={`Gráfica de Distribución (${prueba === 'varianza' ? 'Chi-cuadrado' : prueba === 'media_t' ? 'T de Student' : 'Normal Z'})`}
            anchoCompleto={true} alto="430px"
        >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 35, left: 0, right: 0, bottom: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 30, right: 0, left: 0, bottom: 20 }} style={{ overflow: 'visible' }}>
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
                            tick={{ fill: 'var(--text-main, #333333)', fontSize: 11, fontWeight: 'bold' }}
                            axisLine={{ stroke: 'var(--text-main, #333333)', strokeWidth: 2 }}
                            tickLine={{ stroke: 'var(--text-main, #333333)', strokeWidth: 2 }}
                        />
                        <YAxis hide />
                        <Tooltip formatter={(value, name) => [value.toFixed(3), name === 'rejectArea' ? 'Probabilidad (Rechazo)' : name === 'acceptArea' ? 'Probabilidad (Aceptación)' : 'Densidad']} labelFormatter={(l) => `X = ${l}`} />
                        
                        <Area type="step" dataKey="acceptArea" fill="rgba(59, 130, 246, 0.1)" stroke="none" isAnimationActive={false} />
                        <Area type="step" dataKey="rejectArea" fill="rgba(220, 38, 38, 0.85)" stroke="none" isAnimationActive={false} />
                        <Area type="monotone" dataKey="y" fill="none" stroke="#3b82f6" strokeWidth={3} isAnimationActive={false} />
                        
                        {criticalValues.map((val, idx) => {
                            let mathStr = '';
                            if (prueba === 'media_z' || prueba === 'proporcion') {
                                if (criticalValues.length === 2) mathStr = idx === 0 ? `-Z_{\\alpha/2}` : `Z_{\\alpha/2}`;
                                else mathStr = val < 0 ? `-Z_\\alpha` : `Z_\\alpha`;
                            } else if (prueba === 'media_t') {
                                if (criticalValues.length === 2) mathStr = idx === 0 ? `-t_{\\alpha/2}` : `t_{\\alpha/2}`;
                                else mathStr = val < 0 ? `-t_\\alpha` : `t_\\alpha`;
                            } else if (prueba === 'varianza') {
                                if (criticalValues.length === 2) mathStr = idx === 0 ? `\\chi^2_{inf}` : `\\chi^2_{sup}`;
                                else mathStr = `\\chi^2_\\alpha`;
                            }
                            mathStr = `\\boldsymbol{${mathStr}}`;
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

                        <ReferenceLine 
                            x={resultados.estadistico} 
                            stroke="none" 
                            label={<CustomCalloutLabel isNegative={resultados.estadistico < 0} value={`${statSymbol} = ${resultados.estadistico.toFixed(3)}`} />} 
                        />
                        </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="leyenda-grafica-tema6" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', gap: '15px', fontFamily: FONT, marginTop: '-15px', paddingBottom: '15px', position: 'relative', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-input)', padding: '5px 15px', borderRadius: '5px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: '14px', height: '14px', background: 'rgba(220, 38, 38, 0.9)', border: '2px solid #b91c1c', borderRadius: '50%' }}></div>
                        <div style={{ color: 'var(--text-main)', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.3px' }}>
                            Zona de Rechazo <span style={{ fontWeight: 'normal', marginLeft: '2px' }}>({renderKatex('H_0')})</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-input)', padding: '5px 15px', borderRadius: '5px', border: '1px solid var(--border-color)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                        <div style={{ width: '14px', height: '14px', background: 'rgba(59, 130, 246, 0.2)', border: '2px solid #3b82f6', borderRadius: '50%' }}></div>
                        <div style={{ color: 'var(--text-main)', fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.3px' }}>
                            Zona de Aceptación <span style={{ fontWeight: 'normal', marginLeft: '2px' }}>({renderKatex('H_0')})</span>
                        </div>
                    </div>
                </div>
            </div>
        </MarcoWidgetMAT251>
    );
}
