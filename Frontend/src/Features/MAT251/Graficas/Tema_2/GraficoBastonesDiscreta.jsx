import React from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import katex from 'katex';
import "katex/dist/katex.min.css";
import MarcoWidgetMAT251 from '../../ui/MarcoWidgetMAT251';

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

export default function GraficoBastonesDiscreta({ 
    datos, 
    id = "grafico-bastones-discreta", 
    titulo = "Función de Masa de Probabilidad - f(x)", 
    anchoCompleto = true, 
    alto = "400px",
    modoPDF = false 
}) {
    if (!datos || datos.length === 0) return null;

    // Adaptar para que parezcan bastones reales (barras muy finas con un punto arriba)
    const datosGrafica = datos.map(d => ({
        x: d.x.toString(),
        prob: parseFloat(d.p.toFixed(4))
    }));

    const maxProb = Math.max(...datosGrafica.map(d => d.prob));
    const yAxisDomain = [0, Math.min(1, Math.ceil(maxProb * 1.2 * 10) / 10)]; // Ligero margen arriba

    const grafico = (
        <ComposedChart
            width={modoPDF ? 640 : undefined}
            height={modoPDF ? 300 : undefined}
            data={datosGrafica}
            margin={{ top: 20, right: 5, left: -10, bottom: 0 }}
        >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis
                dataKey="x"
                tick={{ fill: modoPDF ? '#000000' : 'var(--text-variable, #ffffffff)', fontSize: 11 }}
                stroke={modoPDF ? '#000000' : 'var(--text-variable, #ffffffff)'}
            />
            <YAxis
                domain={yAxisDomain}
                tick={{ fill: modoPDF ? '#000000' : 'var(--text-variable, #ffffffff)', fontSize: 11 }}
                stroke={modoPDF ? '#000000' : 'var(--text-variable, #ffffffff)'}
                tickFormatter={(value) => value.toFixed(2)}
            />
            {!modoPDF && <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
                content={<CustomTooltip />}
            />}
            <Bar isAnimationActive={!modoPDF} dataKey="prob" maxBarSize={60} fill="#0ea5e9" radius={[0, 0, 0, 0]} />
        </ComposedChart>
    );

    const contenido = (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
            <div style={{ display: 'flex', flex: 1, position: 'relative', paddingLeft: modoPDF ? '20px' : '0px', minHeight: 0 }}>
                <div style={{
                    position: 'absolute', left: modoPDF ? '-35px' : '-40px', top: '50%',
                    transform: 'translateY(-50%) rotate(-90deg)', fontSize: '12px', fontWeight: 'bold',
                    color: modoPDF ? '#000000' : 'var(--text-pure, var(--text-main, #000000ff))', whiteSpace: 'nowrap'
                }}>
                    Probabilidad <LatexText math="P(x)" />
                </div>
                {modoPDF ? grafico : <ResponsiveContainer width="100%" height="100%">{grafico}</ResponsiveContainer>}
            </div>
            <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: modoPDF ? '#000000' : 'var(--text-pure, var(--text-main, #000000ff))' }}>
                Valores <LatexText math="(x)" />
            </div>
        </div>
    );

    if (modoPDF) {
        return <div id={id} style={{ width: '660px', maxWidth: '100%', height: '325px', margin: '0 auto' }}>{contenido}</div>;
    }

    return (
        <MarcoWidgetMAT251 id={id} titulo={titulo} anchoCompleto={anchoCompleto} alto={alto}>
            {contenido}
        </MarcoWidgetMAT251>
    );
}
