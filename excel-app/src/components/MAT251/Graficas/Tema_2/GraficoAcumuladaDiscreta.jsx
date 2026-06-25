import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { FONT, FS } from '../../Principal/Constantes';

export default function GraficoAcumuladaDiscreta({ datos }) {
    if (!datos || datos.length === 0) return null;

    // Calcular F(x) acumulado
    let acumulado = 0;
    const datosGrafica = datos.map(d => {
        acumulado += d.p;
        return {
            x: d.x,
            xLabel: d.x.toString(),
            F: parseFloat(acumulado.toFixed(4)),
            esDummy: false
        };
    });

    // Añadir un punto extra inicial para la línea base F(x) = 0
    const firstX = datos[0].x;
    if (firstX > 0) {
        datosGrafica.unshift({
            x: 0,
            xLabel: "0",
            F: 0.0000,
            esDummy: true
        });
    }

    // Añadir un punto extra final para que la última línea (F=1) se extienda a la derecha
    const lastX = datos[datos.length - 1].x;
    const paso = datos.length > 1 ? (datos[1].x - datos[0].x) : Math.max(1, lastX * 0.2);
    datosGrafica.push({
        x: lastX + paso,
        xLabel: '', // Vacio para no mostrar etiqueta extra en el eje X
        F: 1.0000,
        esDummy: true
    });

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            if (data.esDummy) return null; // No mostrar tooltip en la línea extendida

            return (
                <div style={{
                    background: 'white',
                    padding: '10px 15px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    fontFamily: FONT,
                    fontSize: FS.sm,
                    zIndex: 10
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-muted, #475569)' }}>X = {label}</p>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--primary-color, #3b82f6)' }}>F(x) = {payload[0].value.toFixed(4)}</p>
                </div>
            );
        }
        return null;
    };

    const renderCustomDot = (props) => {
        const { cx, cy, payload } = props;
        if (payload.esDummy) return null;
        return (
            <circle
                key={`dot-${payload.x}`}
                cx={cx}
                cy={cy}
                r={5}
                fill="var(--primary-color, #3b82f6)"
                stroke="white"
                strokeWidth={1}
                style={{ cursor: 'pointer' }}
            />
        );
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datosGrafica} margin={{ top: 30, right: 50, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                    dataKey="xLabel"
                    tick={{ fill: 'var(--text-muted, #475569)', fontSize: FS.xs, fontFamily: FONT }}
                    label={{ value: 'x', position: 'insideBottom', offset: -10, fill: 'var(--text-muted, #475569)', fontSize: FS.sm, fontWeight: 600, fontFamily: FONT }}
                />
                <YAxis
                    domain={[0, 1.1]}
                    ticks={[0, 0.2, 0.4, 0.6, 0.8, 1.0]}
                    tick={{ fill: 'var(--text-muted, #475569)', fontSize: FS.xs, fontFamily: FONT }}
                    label={{ value: 'F(x)', angle: -90, position: 'insideLeft', offset: 10, fill: 'var(--text-muted, #475569)', fontSize: FS.sm, fontWeight: 600, fontFamily: FONT }}
                />
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <ReferenceLine
                    y={1}
                    stroke="#10b981"
                    strokeDasharray="5 5"
                    label={{ position: 'right', value: 'F(x) = 1', fill: '#10b981', fontSize: FS.xs, fontWeight: 600, fontFamily: FONT }}
                />
                <Line
                    type="stepAfter"
                    dataKey="F"
                    stroke="var(--primary-color, #3b82f6)"
                    strokeWidth={3}
                    dot={renderCustomDot}
                    activeDot={{ r: 7 }}
                    isAnimationActive={true}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
