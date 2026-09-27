import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ZAxis } from 'recharts';
import MarcoWidgetMAT251 from '../../ui/MarcoWidgetMAT251';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const CustomLabel = ({ viewBox, valor, simbolo }) => {
    const { x, y } = viewBox;
    const mathString = `${simbolo} = ${valor.toFixed(4)}`;
    return (
        <foreignObject x={x - 60} y={y - 25} width={120} height={30} style={{ overflow: 'visible' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
                <span 
                    style={{ color: 'var(--text-main)', fontSize: '13px', fontWeight: 'bold' }}
                    dangerouslySetInnerHTML={{ __html: katex.renderToString(mathString, { throwOnError: false }) }} 
                />
            </div>
        </foreignObject>
    );
};

export default function GraficoEstimacionMatriz({ resultados, parametro }) {
    if (!resultados || parametro !== 'media' || !resultados.calculos?.numDatos) return null;

    // Agrupación de frecuencias (Pre-procesamiento)
    const frecuencias = {};
    const plotData = [];
    
    resultados.calculos.numDatos.forEach(d => {
        // Redondeamos a 1 decimal para agrupar (como pide el usuario)
        const x = Math.round(d * 10) / 10;
        if (!frecuencias[x]) frecuencias[x] = 0;
        frecuencias[x]++;
        plotData.push({ x: x, y: frecuencias[x] });
    });

    const maxFreq = Math.max(...Object.values(frecuencias), 1);
    const uniqueXs = Object.keys(frecuencias).map(Number).sort((a, b) => a - b);
    
    // Generar ticks personalizados si hay 25 o menos valores únicos para que se vean todos
    const xAxisProps = { domain: ['auto', 'auto'] };
    if (uniqueXs.length <= 25) {
        xAxisProps.ticks = uniqueXs;
    }

    // Si hay pocos valores únicos, limitamos el ancho para que no queden demasiado separados horizontalmente
    const containerStyle = uniqueXs.length <= 7 ? { maxWidth: '700px', margin: '0 auto', height: '100%' } : { width: '100%', height: '100%' };

    return (
        <MarcoWidgetMAT251 titulo="Dispersión de los Datos (Dot Plot)" anchoCompleto={true} alto="450px">
            <div style={containerStyle}>
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 30, right: 30, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} />
                        <XAxis dataKey="x" type="number" name="Valor" {...xAxisProps} tick={{ fontSize: 12, fill: 'var(--text-main)' }} stroke="var(--text-main)" />
                        <YAxis dataKey="y" type="number" name="" domain={[0, maxFreq + 1]} tick={false} axisLine={false} tickLine={false} />
                        <ZAxis range={[80, 80]} />
                        <Tooltip 
                            cursor={{ strokeDasharray: '3 3' }} 
                            formatter={(value, name) => name === 'Valor' ? [value.toFixed(2), 'Dato'] : []} 
                            labelFormatter={() => ''} 
                        />
                        <Scatter name="Datos" data={plotData} fill="var(--primary-color)" fillOpacity={1} />
                        <ReferenceLine 
                            x={resultados.estimacion} 
                            stroke="var(--accent-color)" 
                            strokeWidth={2} 
                            strokeDasharray="4 4" 
                            label={<CustomLabel valor={resultados.estimacion} simbolo={resultados.simbolo === '\\hat{\\mu}' ? '\\mu' : resultados.simbolo} />} 
                        />
                    </ScatterChart>
                </ResponsiveContainer>
            </div>
        </MarcoWidgetMAT251>
    );
}
