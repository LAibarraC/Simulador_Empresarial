import React from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine } from 'recharts';
import { FONT } from '../Principal/Constantes';

export default function GraficoUniformeArea({ A, B, a, b, H }) {
    if (A === undefined || B === undefined) return null;

    // Línea principal de densidad H entre A y B
    const data = [
        { x: A, y: H },
        { x: B, y: H }
    ];

    // Para evitar que los puntos A y B estén pegados a los bordes
    const padding = (B - A) * 0.05;
    const xMin = A - padding;
    const xMax = B + padding;

    // Ticks específicos para mostrar en el eje X
    const ticks = [...new Set([A, a, b, B])].sort((x1, x2) => x1 - x2);

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '300px', display: 'flex', justifyContent: 'center', padding: '10px 0', fontFamily: FONT }}>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    
                    <XAxis 
                        dataKey="x" 
                        type="number" 
                        domain={[xMin, xMax]} 
                        ticks={ticks}
                        tick={{ fill: '#000000', fontSize: 14, fontFamily: FONT, fontWeight: 'bold' }} 
                        axisLine={{ stroke: '#000000', strokeWidth: 2 }}
                        tickLine={{ stroke: '#000000' }}
                        dy={10}
                    />
                    
                    <YAxis 
                        domain={[0, H * 1.5]} 
                        tick={{ fill: '#64748b', fontSize: 12, fontFamily: FONT }} 
                        axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                        tickLine={false}
                        tickFormatter={(val) => val.toFixed(4)}
                    />
                    
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: FONT }} 
                        labelFormatter={(label) => `x = ${label}`}
                        formatter={(val) => [val.toFixed(4), "Densidad (H)"]}
                    />
                    
                    {/* Área sombreada de la probabilidad P(a <= X <= b) */}
                    {(a !== undefined && b !== undefined) && (
                        <ReferenceArea x1={a} x2={b} y1={0} y2={H} fill="#3b82f6" fillOpacity={0.4} strokeOpacity={0} />
                    )}

                    {/* Líneas verticales delimitadoras del Universo Uniforme */}
                    <ReferenceLine x={A} stroke="#94a3b8" strokeDasharray="3 3" />
                    <ReferenceLine x={B} stroke="#94a3b8" strokeDasharray="3 3" />

                    {/* Línea horizontal de la Densidad Teórica H */}
                    <Line type="step" dataKey="y" stroke="#94a3b8" strokeWidth={3} dot={false} activeDot={false} name="Densidad" />
                    
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
