import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function GraficoBastonesDiscreta({ datos }) {
    if (!datos || datos.length === 0) return null;

    // Adaptar para que parezcan bastones (barras muy finas)
    const datosGrafica = datos.map(d => ({
        x: d.x.toString(),
        prob: parseFloat(d.p.toFixed(4))
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datosGrafica} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="x" tick={{ fill: '#4b5563' }} label={{ value: 'x', position: 'insideBottom', offset: -10, fill: '#4b5563' }} />
                <YAxis tick={{ fill: '#4b5563' }} label={{ value: 'P(X = x)', angle: -90, position: 'insideLeft', offset: -5, fill: '#4b5563' }} />
                <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                <Bar dataKey="prob" barSize={35} radius={[4, 4, 0, 0]}>
                    {datosGrafica.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#4a90e2" />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
