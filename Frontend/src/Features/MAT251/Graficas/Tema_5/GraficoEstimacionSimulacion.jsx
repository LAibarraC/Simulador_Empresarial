import React, { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
    BarChart, Bar, Legend
} from 'recharts';
import MarcoWidgetMAT251 from '../../ui/MarcoWidgetMAT251';
import { FONT, FS, RADIUS } from '../../Principal/Constantes';
import katex from 'katex';

const simboloKatex = (formula) => (
    <span
        style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}
        dangerouslySetInnerHTML={{ __html: katex.renderToString(formula, { throwOnError: false }) }}
    />
);

export default function GraficoEstimacionSimulacion({ resultados, simulacionesVisibles }) {
    if (!resultados || !simulacionesVisibles) return null;

    const esMovil = typeof window !== 'undefined' && window.matchMedia('(max-width: 600px)').matches;
    const { parametroVerdadero, resumen, parametro, simulaciones } = resultados;

    // Preparar datos para el gráfico de línea (Evolución)
    const datosLinea = useMemo(() => {
        if (simulacionesVisibles.length <= 500) return simulacionesVisibles;
        const step = Math.ceil(simulacionesVisibles.length / 500);
        return simulacionesVisibles.filter((_, i) => i % step === 0);
    }, [simulacionesVisibles]);

    // Preparar datos para el Histograma (Frecuencias)
    const datosHistograma = useMemo(() => {
        const ests = simulacionesVisibles.map(s => s.estimacion);
        if (ests.length === 0) return [];
        const min = ests.reduce((m, val) => val < m ? val : m, ests[0]);
        const max = ests.reduce((m, val) => val > m ? val : m, ests[0]);
        const bins = 20; // 20 intervalos
        const binWidth = (max - min) / bins || 1;
        
        const freqs = Array(bins).fill(0);
        ests.forEach(val => {
            let idx = Math.floor((val - min) / binWidth);
            if (idx >= bins) idx = bins - 1; // Para el valor máximo exacto
            freqs[idx]++;
        });

        return freqs.map((f, i) => ({
            rango: `${(min + i * binWidth).toFixed(2)} - ${(min + (i + 1) * binWidth).toFixed(2)}`,
            frecuencia: f,
            marcaClase: min + (i + 0.5) * binWidth
        }));
    }, [simulacionesVisibles]);

    const nearestBin = useMemo(() => {
        if (parametroVerdadero === null || !datosHistograma.length) return null;
        return datosHistograma.reduce((prev, curr) => 
            Math.abs(curr.marcaClase - parametroVerdadero) < Math.abs(prev.marcaClase - parametroVerdadero) ? curr : prev
        ).marcaClase;
    }, [parametroVerdadero, datosHistograma]);

    let parametroLabel = 'Media';
    let simboloEstimador = '\\bar{X}';
    let simboloParametro = '\\mu';
    if (parametro === 'proporcion') {
        parametroLabel = 'Proporción';
        simboloEstimador = '\\hat{p}';
        simboloParametro = 'p';
    }
    if (parametro === 'varianza') {
        parametroLabel = 'Varianza';
        simboloEstimador = 'S^2';
        simboloParametro = '\\sigma^2';
    }
    const tituloEstimador = <>Evolución de las estimaciones ({simboloKatex(simboloEstimador)})</>;
    const tituloDistribucion = <>Distribución de las estimaciones ({simboloKatex(simboloEstimador)})</>;
    const leyendaParametroReal = (
        <>{parametroLabel} real ({simboloKatex(`${simboloParametro} = ${parametroVerdadero?.toFixed(2)}`)})</>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* GRÁFICO DE EVOLUCIÓN */}
            <div id="tour-t5-sim-grafico-evolucion">
                <MarcoWidgetMAT251 titulo={tituloEstimador} anchoCompleto={true} alto="450px">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={datosLinea} margin={{ top: 20, right: 30, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #e2e8f0)" />
                        <XAxis 
                            dataKey="simulacion" 
                            stroke="var(--text-main, #334155)"
                            interval={esMovil ? Math.max(1, Math.ceil(datosLinea.length / 6)) : 'preserveStartEnd'}
                            label={{ value: 'Simulación', position: 'insideBottom', offset: -5, fill: 'var(--text-main, #334155)', fontSize: 12, fontFamily: FONT }} 
                            tick={{ fontSize: esMovil ? 9 : 10, fontFamily: FONT, fontWeight: 700, fill: 'var(--text-main, #334155)' }}
                        />
                        <YAxis 
                            domain={['auto', 'auto']}
                            stroke="var(--text-main, #334155)"
                            label={{ value: `Estimación de la ${parametroLabel.toLowerCase()}`, angle: -90, position: 'insideLeft', offset: 15, style: { textAnchor: 'middle' }, fill: 'var(--text-main, #334155)', fontSize: 12, fontFamily: FONT }}
                            tick={{ fontSize: 10, fontFamily: FONT, fontWeight: 700, fill: 'var(--text-main, #334155)' }}
                        />
                        <Tooltip 
                            formatter={(value) => [value.toFixed(4), 'Estimación']}
                            labelFormatter={(label) => `Simulación #${label}`}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            wrapperStyle={{ left: 0, right: 0, width: '100%' }}
                            content={(props) => (
                                <ul style={{ listStyle: 'none', width: '100%', boxSizing: 'border-box', padding: esMovil ? '8px 0 0' : '15px 0 0', margin: 0, display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'center', gap: esMovil ? '8px' : '30px', fontSize: esMovil ? '9px' : '12px', fontFamily: FONT }}>
                                    <li style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', width: '20px', height: '0', borderTop: '2px solid #3b82f6', marginRight: '8px', position: 'relative' }}>
                                            {simulaciones.length <= 500 && (
                                                <span style={{ position: 'absolute', left: '6px', top: '-4px', width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></span>
                                            )}
                                        </span>
                                        <span style={{ color: 'var(--text-main, #334155)', whiteSpace: 'nowrap' }}>Estimación ({simboloKatex(simboloEstimador)})</span>
                                    </li>
                                    {parametroVerdadero !== null && (
                                        <li style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                            <span style={{ display: 'inline-block', width: '20px', height: '0', borderTop: '2px dashed #ef4444', marginRight: '8px' }}></span>
                                            <span style={{ color: 'var(--text-main, #334155)', whiteSpace: 'nowrap' }}>{leyendaParametroReal}</span>
                                        </li>
                                    )}
                                </ul>
                            )}
                        />
                        
                        <Line 
                            type="linear" 
                            dataKey="estimacion" 
                            stroke="#3b82f6" 
                            strokeWidth={1.5} 
                            dot={simulaciones.length <= 500 ? { r: 3, fill: '#3b82f6', stroke: '#3b82f6' } : false} 
                            activeDot={{ r: 5, fill: '#3b82f6', stroke: '#3b82f6' }}
                        />
                        
                        {parametroVerdadero !== null && (
                            <ReferenceLine 
                                y={parametroVerdadero} 
                                stroke="#ef4444" 
                                strokeWidth={3}
                                strokeDasharray="5 5"
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </MarcoWidgetMAT251>
            </div>

            {/* HISTOGRAMA */}
            <div id="tour-t5-sim-grafico-distribucion">
            <MarcoWidgetMAT251 titulo={tituloDistribucion} anchoCompleto={true} alto="450px">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={datosHistograma} margin={{ top: 20, right: 30, left: -10, bottom: 0 }} barCategoryGap="0%" barGap={0}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #e2e8f0)" />
                        <XAxis 
                            dataKey="marcaClase" 
                            padding={{ left: 8, right: 0 }}
                            stroke="var(--text-main, #334155)"
                            interval={esMovil ? 3 : 'preserveStartEnd'}
                            label={{ value: `Estimaciones de la ${parametroLabel.toLowerCase()}`, position: 'insideBottom', offset: -5, fill: 'var(--text-main, #334155)', fontSize: 12, fontFamily: FONT }}
                            tick={{ fontSize: esMovil ? 9 : 10, fontFamily: FONT, fontWeight: 700, fill: 'var(--text-main, #334155)' }}
                            tickFormatter={(val) => val.toFixed(2)}
                        />
                        <YAxis 
                            stroke="var(--text-main, #334155)"
                            label={{ value: 'Frecuencia', angle: -90, position: 'insideLeft', offset: 15, style: { textAnchor: 'middle' }, fill: 'var(--text-main, #334155)', fontSize: 12, fontFamily: FONT }} 
                            tick={{ fontSize: 10, fontFamily: FONT, fontWeight: 700, fill: 'var(--text-main, #334155)' }}
                        />
                        <Tooltip 
                            formatter={(value) => [value, 'Simulaciones']}
                            labelFormatter={(_, payload) => {
                                if (payload && payload.length > 0) return `Rango: ${payload[0].payload.rango}`;
                                return '';
                            }}
                            cursor={{ fill: 'rgba(96, 165, 250, 0.2)' }}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            wrapperStyle={{ left: 0, right: 0, width: '100%' }}
                            content={(props) => (
                                <ul style={{ listStyle: 'none', width: '100%', boxSizing: 'border-box', padding: esMovil ? '8px 0 0' : '15px 0 0', margin: 0, display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'center', gap: esMovil ? '8px' : '30px', fontSize: esMovil ? '9px' : '12px', fontFamily: FONT }}>
                                    <li style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                        <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#60a5fa', marginRight: '8px', borderRadius: '2px' }}></span>
                                        <span style={{ color: 'var(--text-main, #334155)', whiteSpace: 'nowrap' }}>Estimaciones simuladas</span>
                                    </li>
                                    {parametroVerdadero !== null && (
                                        <li style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                            <span style={{ display: 'inline-block', width: '20px', height: '0', borderTop: '2px dashed #ef4444', marginRight: '8px' }}></span>
                                            <span style={{ color: 'var(--text-main, #334155)', whiteSpace: 'nowrap' }}>{leyendaParametroReal}</span>
                                        </li>
                                    )}
                                </ul>
                            )}
                        />
                        <Bar dataKey="frecuencia" fill="#60a5fa" stroke="var(--bg-card, #ffffff)" strokeWidth={1} radius={[2, 2, 0, 0]} />
                        
                        {parametroVerdadero !== null && nearestBin !== null && (
                            <ReferenceLine 
                                x={nearestBin} 
                                stroke="#ef4444" 
                                strokeWidth={3}
                                strokeDasharray="5 5"
                            />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </MarcoWidgetMAT251>
            </div>
        </div>
    );
}
