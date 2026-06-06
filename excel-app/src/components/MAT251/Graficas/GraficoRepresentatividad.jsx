import React, { useMemo } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList 
} from 'recharts';
import { FONT } from '../Principal/Constantes';

export default function GraficoRepresentatividad({ data }) {
    const dataFormateada = useMemo(() => {
        if (!data) return [];
        return data.map(d => ({
            name: d.label,
            poblacion: d.pPob * 100,
            muestra: d.pMuestra * 100
        }));
    }, [data]);

    if (!data || data.length === 0) return null;

    const formatterLabel = (val) => {
        if (val === 0 || !val) return "0.0%";
        return `${val.toFixed(1)}%`;
    };

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '300px', display: 'flex', justifyContent: 'center', padding: '10px 0', fontFamily: FONT }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataFormateada} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    
                    <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#000000', fontSize: 14, fontFamily: FONT }} 
                        dy={10} 
                        axisLine={{ stroke: '#000000', strokeWidth: 2 }}
                        tickLine={{ stroke: '#000000' }}
                    />
                    
                    <YAxis 
                        tickFormatter={val => `${val}%`} 
                        domain={[0, 'auto']} 
                        tick={{ fill: '#000000', fontSize: 14, fontFamily: FONT }} 
                        axisLine={{ stroke: '#000000', strokeWidth: 2 }}
                        tickLine={{ stroke: '#000000' }}
                    />
                    
                    <Tooltip 
                        formatter={(value) => [`${value.toFixed(1)}%`]} 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: FONT }}
                    />
                    
                    <Legend 
                        wrapperStyle={{ paddingTop: '10px', fontSize: '14px', fontFamily: FONT, color: '#475569' }} 
                        iconType="square"
                    />

                    <Bar dataKey="poblacion" name="Población (N)" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={50}>
                        <LabelList 
                            dataKey="poblacion" 
                            position="top" 
                            formatter={formatterLabel} 
                            style={{ fill: '#64748b', fontSize: 12, fontFamily: FONT }} 
                        />
                    </Bar>
                    
                    <Bar dataKey="muestra" name="Muestra (n)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50}>
                        <LabelList 
                            dataKey="muestra" 
                            position="top" 
                            formatter={formatterLabel} 
                            style={{ fill: '#2563eb', fontSize: 12, fontWeight: 'bold', fontFamily: FONT }} 
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
