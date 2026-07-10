import React, { useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FONT } from '../../Principal/Constantes';

export default function GraficoUniformeMosaico({ dataReales, A, B, H }) {
    
    const dataHist = useMemo(() => {
        if (!dataReales || dataReales.length === 0) return [];
        
        // Determinar cantidad de bins (Mosaicos)
        const binsCount = 10;
        const range = B - A;
        const binSize = range / binsCount;
        
        let bins = Array(binsCount).fill(0).map((_, i) => ({
            min: A + i * binSize,
            max: A + (i + 1) * binSize,
            center: A + (i + 0.5) * binSize,
            count: 0
        }));

        // Contar frecuencias
        dataReales.forEach(val => {
            if (val >= A && val <= B) {
                let idx = Math.floor((val - A) / binSize);
                if (idx >= binsCount) idx = binsCount - 1; // El maximo absoluto cae en el ultimo bin
                bins[idx].count++;
            }
        });

        const n = dataReales.length;
        
        // Densidad empírica = (frecuencia relativa) / (ancho de clase)
        return bins.map(b => ({
            name: `${b.min.toFixed(1)} - ${b.max.toFixed(1)}`,
            xCenter: b.center.toFixed(2),
            densidadEmpirica: (b.count / n) / binSize,
            densidadTeorica: H
        }));
    }, [dataReales, A, B, H]);

    if (!dataHist || dataHist.length === 0) return null;

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '300px', display: 'flex', justifyContent: 'center', padding: '10px 0', fontFamily: FONT }}>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dataHist} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    
                    <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#64748b', fontSize: 11, fontFamily: FONT }} 
                        dy={10}
                        axisLine={{ stroke: '#000000', strokeWidth: 2 }}
                        tickLine={{ stroke: '#000000' }}
                    />
                    
                    <YAxis 
                        tickFormatter={(val) => val.toFixed(4)}
                        tick={{ fill: '#000000', fontSize: 12, fontFamily: FONT }} 
                        axisLine={{ stroke: '#000000', strokeWidth: 2 }}
                        tickLine={{ stroke: '#000000' }}
                    />
                    
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: FONT }} 
                        formatter={(value, name) => [value.toFixed(4), name]}
                    />
                    
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '14px', fontFamily: FONT, color: '#475569' }} />
                    
                    <Bar 
                        dataKey="densidadEmpirica" 
                        name="Frecuencia Relativa Real (Densidad)" 
                        fill="#cbd5e1" 
                        radius={[2, 2, 0, 0]}
                    />
                    
                    <Line 
                        type="monotone" 
                        dataKey="densidadTeorica" 
                        name="Línea de Probabilidad Continua (H)" 
                        stroke="var(--primary-color)" 
                        strokeWidth={3} 
                        dot={false} 
                        activeDot={false}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
