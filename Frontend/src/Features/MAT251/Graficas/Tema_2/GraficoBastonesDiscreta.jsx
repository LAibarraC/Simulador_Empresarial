import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import katex from 'katex';
import "katex/dist/katex.min.css";

const LatexText = React.memo(({ math }) => {
    return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />;
});

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: 'var(--bg-card, #1e293b)',
                border: '1px solid var(--border-color, #334155)',
                padding: '10px',
                borderRadius: '8px',
                color: 'var(--text-main, #f8fafc)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', borderBottom: '1px solid var(--border-color, #334155)', paddingBottom: '5px', fontSize: '12px' }}>
                    <LatexText math={`x = ${label}`} />
                </p>
                <p style={{ margin: 0, color: '#0ea5e9', fontWeight: 600, fontSize: '12px' }}>
                    <LatexText math={`P(x) = ${Number(payload[0].value).toFixed(2)}`} />
                </p>
            </div>
        );
    }
    return null;
};

export default function GraficoBastonesDiscreta({ datos }) {
    if (!datos || datos.length === 0) return null;

    // Adaptar para que parezcan bastones reales (barras muy finas con un punto arriba)
    const datosGrafica = datos.map(d => ({
        x: d.x.toString(),
        prob: parseFloat(d.p.toFixed(4))
    }));

    const maxProb = Math.max(...datosGrafica.map(d => d.prob));
    const yAxisDomain = [0, Math.min(1, Math.ceil(maxProb * 1.2 * 10) / 10)]; // Ligero margen arriba

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <div style={{ display: 'flex', flex: 1, position: 'relative', paddingLeft: '0px', minHeight: 0 }}>
                <div style={{ 
                    position: 'absolute', 
                    left: '-50px', 
                    top: '50%', 
                    transform: 'translateY(-50%) rotate(-90deg)', 
                    fontSize: '12px', 
                    fontWeight: 'bold', 
                    color: 'var(--text-main, #1e293b)',
                    whiteSpace: 'nowrap'
                }}>
                    <LatexText math="\text{Probabilidad } P(x)" />
                </div>
                
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={datosGrafica} margin={{ top: 20, right: 30, left: -10, bottom: -5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                        <XAxis 
                            dataKey="x" 
                            tick={{ fill: 'var(--text-variable, #ffffffff)', fontSize: 11 }} 
                            stroke="var(--text-variable, #ffffffff)" 
                        />
                        <YAxis 
                            domain={yAxisDomain} 
                            tick={{ fill: 'var(--text-variable, #ffffffff)', fontSize: 11 }} 
                            stroke="var(--text-variable, #ffffffff)" 
                            tickFormatter={(value) => value.toFixed(2)}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                            content={<CustomTooltip />}
                        />
                        <Bar dataKey="prob" maxBarSize={60} fill="#0ea5e9" radius={[0, 0, 0, 0]} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            <div style={{ 
                textAlign: 'center', 
                fontSize: '12px', 
                fontWeight: 'bold', 
                color: 'var(--text-main, #1e293b)',
                paddingTop: '0px',
                paddingBottom: '20px',
                paddingLeft: '40px'
            }}>
                <LatexText math="\text{Valores } (x)" />
            </div>
        </div>
    );
}
