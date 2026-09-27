import React, { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
    BarChart, Bar, Legend
} from 'recharts';
import MarcoWidgetMAT251 from '../../ui/MarcoWidgetMAT251';
import { FONT } from '../../Principal/Constantes';

export default function GraficoEstimacionSimulacion({ resultados }) {
    if (!resultados || !resultados.simulaciones) return null;

    const { parametroVerdadero, resumen, simulaciones, parametro } = resultados;

    // Preparar datos para el gráfico de línea (Evolución)
    // Si hay más de 500 simulaciones, reducimos para no saturar el gráfico
    const datosLinea = useMemo(() => {
        if (simulaciones.length <= 500) return simulaciones;
        const step = Math.ceil(simulaciones.length / 500);
        return simulaciones.filter((_, i) => i % step === 0);
    }, [simulaciones]);

    // Preparar datos para el Histograma (Frecuencias)
    const datosHistograma = useMemo(() => {
        const ests = simulaciones.map(s => s.estimacion);
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
    }, [simulaciones]);

    const nearestBin = useMemo(() => {
        if (parametroVerdadero === null || !datosHistograma.length) return null;
        return datosHistograma.reduce((prev, curr) => 
            Math.abs(curr.marcaClase - parametroVerdadero) < Math.abs(prev.marcaClase - parametroVerdadero) ? curr : prev
        ).marcaClase;
    }, [parametroVerdadero, datosHistograma]);

    let yLabel = 'Media (μ)';
    if (parametro === 'proporcion') yLabel = 'Proporción (p)';
    if (parametro === 'varianza') yLabel = 'Varianza (σ²)';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* GRÁFICO DE EVOLUCIÓN */}
            <MarcoWidgetMAT251 titulo={`Evolución de las estimaciones (${yLabel.includes('μ') ? 'X̄' : (yLabel.includes('p') ? 'p̂' : 'S²')})`} anchoCompleto={true} alto="450px">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={datosLinea} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #e2e8f0)" />
                        <XAxis 
                            dataKey="simulacion" 
                            stroke="var(--text-main, #334155)"
                            label={{ value: 'Simulación', position: 'insideBottom', offset: -5, fill: 'var(--text-main, #334155)', fontSize: 12, fontFamily: FONT }} 
                            tick={{ fontSize: 10, fontFamily: FONT, fill: 'var(--text-main, #334155)' }}
                        />
                        <YAxis 
                            domain={['auto', 'auto']}
                            stroke="var(--text-main, #334155)"
                            label={{ value: `Estimación de la ${yLabel.split(' ')[0].toLowerCase()}`, angle: -90, position: 'insideLeft', offset: 15, style: { textAnchor: 'middle' }, fill: 'var(--text-main, #334155)', fontSize: 12, fontFamily: FONT }}
                            tick={{ fontSize: 10, fontFamily: FONT, fill: 'var(--text-main, #334155)' }}
                        />
                        <Tooltip 
                            formatter={(value) => [value.toFixed(4), 'Estimación']}
                            labelFormatter={(label) => `Simulación #${label}`}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            content={(props) => (
                                <ul style={{ listStyle: 'none', padding: '15px 0 0 0', margin: 0, display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '12px', fontFamily: FONT }}>
                                    <li style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', width: '20px', height: '0', borderTop: '2px solid #3b82f6', marginRight: '8px', position: 'relative' }}>
                                            {simulaciones.length <= 500 && (
                                                <span style={{ position: 'absolute', left: '6px', top: '-4px', width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></span>
                                            )}
                                        </span>
                                        <span style={{ color: 'var(--text-main, #334155)' }}>{`Estimación (${yLabel.includes('μ') ? 'X̄' : (yLabel.includes('p') ? 'p̂' : 'S²')})`}</span>
                                    </li>
                                    {parametroVerdadero !== null && (
                                        <li style={{ display: 'flex', alignItems: 'center' }}>
                                            <span style={{ display: 'inline-block', width: '20px', height: '0', borderTop: '2px dashed #ef4444', marginRight: '8px' }}></span>
                                            <span style={{ color: 'var(--text-main, #334155)' }}>{`${yLabel.split(' ')[0]} real (${yLabel.split('(')[1].split(')')[0]} = ${parametroVerdadero.toFixed(2)})`}</span>
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

            {/* HISTOGRAMA */}
            <MarcoWidgetMAT251 titulo={`Distribución de las estimaciones (${yLabel.includes('μ') ? 'X̄' : (yLabel.includes('p') ? 'p̂' : 'S²')})`} anchoCompleto={true} alto="450px">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={datosHistograma} margin={{ top: 20, right: 30, left: -25, bottom: 20 }} barCategoryGap="0%" barGap={0}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color, #e2e8f0)" />
                        <XAxis 
                            dataKey="marcaClase" 
                            stroke="var(--text-main, #334155)"
                            label={{ value: `Estimaciones de la ${yLabel.split(' ')[0].toLowerCase()}`, position: 'insideBottom', offset: -5, fill: 'var(--text-main, #334155)', fontSize: 12, fontFamily: FONT }} 
                            tick={{ fontSize: 10, fontFamily: FONT, fill: 'var(--text-main, #334155)' }}
                            tickFormatter={(val) => val.toFixed(2)}
                        />
                        <YAxis 
                            stroke="var(--text-main, #334155)"
                            label={{ value: 'Frecuencia', angle: -90, position: 'insideLeft', offset: 30, style: { textAnchor: 'middle' }, fill: 'var(--text-main, #334155)', fontSize: 12, fontFamily: FONT }} 
                            tick={{ fontSize: 10, fontFamily: FONT, fill: 'var(--text-main, #334155)' }}
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
                            content={(props) => (
                                <ul style={{ listStyle: 'none', padding: '15px 0 0 0', margin: 0, display: 'flex', justifyContent: 'center', gap: '30px', fontSize: '12px', fontFamily: FONT }}>
                                    <li style={{ display: 'flex', alignItems: 'center' }}>
                                        <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: '#60a5fa', marginRight: '8px', borderRadius: '2px' }}></span>
                                        <span style={{ color: 'var(--text-main, #334155)' }}>Estimaciones simuladas</span>
                                    </li>
                                    {parametroVerdadero !== null && (
                                        <li style={{ display: 'flex', alignItems: 'center' }}>
                                            <span style={{ display: 'inline-block', width: '20px', height: '0', borderTop: '2px dashed #ef4444', marginRight: '8px' }}></span>
                                            <span style={{ color: 'var(--text-main, #334155)' }}>{`${yLabel.split(' ')[0]} real (${yLabel.split('(')[1].split(')')[0]} = ${parametroVerdadero.toFixed(2)})`}</span>
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
    );
}
