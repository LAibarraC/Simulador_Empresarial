import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { compile } from 'mathjs';
import MarcoWidgetMAT251 from '../../ui/MarcoWidgetMAT251';
import { FONT, FS } from '../../Principal/Constantes';


export default function GraficoAreaContinua({ datos }) {
    const dataGrafica = useMemo(() => {
        if (!datos || !datos.funcion) return [];
        
        try {
            const compiledExpr = compile(datos.funcion);
            let a = parseFloat(datos.a);
            let b = parseFloat(datos.b);

            const varName = datos.modo === 'acumulada' ? 't' : 'x';

            const f = (val) => {
                try { return compiledExpr.evaluate({ [varName]: val }); } catch (e) { return 0; }
            };

            // Búsqueda heurística de cola visual para evitar bucles infinitos en gráficas
            if (b === Infinity) {
                b = (a !== -Infinity && a >= 0) ? a + 2 : 2;
                let iters = 200;
                while (f(b) > 1e-4 && iters > 0) { b += 2; iters--; }
            }
            if (a === -Infinity) {
                a = (b !== Infinity && b <= 0) ? b - 2 : -2;
                let iters = 200;
                while (f(a) > 1e-4 && iters > 0) { a -= 2; iters--; }
            }
            const puntos = [];
            const N = 100;
            const step = (b - a) / N;

            // Expandir a los lados hasta números enteros para anclar los ejes perfectamente
            const margen = (b - a) * 0.1;
            const start = Math.floor(a - Math.max(margen, 0.5));
            const end = Math.ceil(b + Math.max(margen, 0.5));

            if (datos.modo === 'acumulada') {
                let acumulado = 0;

                // 1. Margen izquierdo (F(x) = 0)
                for (let x = start; x < a - step / 2; x += step) {
                    puntos.push({ x: parseFloat(x.toFixed(4)), fx: 0 });
                }
                
                puntos.push({ x: parseFloat(a.toFixed(4)), fx: 0 });

                // 2. Curva acumulada
                for (let i = 0; i <= N; i++) {
                    const x = a + i * step;
                    let fxVal = 0;
                    try { fxVal = compiledExpr.evaluate({ [varName]: x }); } catch (e) { fxVal = 0; }
                    
                    fxVal = Math.max(0, fxVal); // Densidad no negativa
                    if (i > 0) acumulado += fxVal * step;
                    
                    puntos.push({
                        x: parseFloat(x.toFixed(4)),
                        fx: parseFloat(acumulado.toFixed(4))
                    });
                }

                // 3. Margen derecho (F(x) se mantiene constante)
                const finalVal = parseFloat(acumulado.toFixed(4));
                for (let x = b + step; x <= end; x += step) {
                    puntos.push({ x: parseFloat(x.toFixed(4)), fx: finalVal });
                }
                
                return puntos;
            }

            // MODO DENSIDAD (Por defecto)
            // 1. Margen izquierdo (f(x) = 0)
            for (let x = start; x < a - step / 2; x += step) {
                puntos.push({ x: parseFloat(x.toFixed(4)), fx: 0 });
            }
            
            // Base en 'a' para caída vertical
            puntos.push({ x: parseFloat(a.toFixed(4)), fx: 0 });

            // 2. Curva principal entre 'a' y 'b'
            for (let i = 0; i <= N; i++) {
                const x = a + i * step;
                let fxVal = 0;
                try {
                    fxVal = compiledExpr.evaluate({ [varName]: x });
                } catch (e) {
                    fxVal = 0;
                }
                puntos.push({
                    x: parseFloat(x.toFixed(4)),
                    fx: parseFloat(fxVal.toFixed(4))
                });
            }

            // Base en 'b' para caída vertical
            puntos.push({ x: parseFloat(b.toFixed(4)), fx: 0 });

            // 3. Margen derecho (f(x) = 0)
            for (let x = b + step; x <= end; x += step) {
                puntos.push({ x: parseFloat(x.toFixed(4)), fx: 0 });
            }
            
            return puntos;
        } catch (e) {
            console.error("Error generando datos para gráfico", e);
            return [];
        }
    }, [datos]);

    const calculatedDomainAndTicks = useMemo(() => {
        if (!dataGrafica || dataGrafica.length === 0) return { domain: ['auto', 'auto'], ticks: [] };
        const minX = dataGrafica[0].x;
        const maxX = dataGrafica[dataGrafica.length - 1].x;
        
        const start = Math.floor(minX);
        const end = Math.ceil(maxX);
        const t = [];
        for (let i = start; i <= end; i++) {
            t.push(i);
        }
        return { domain: [start - 0.2, end + 0.2], ticks: t };
    }, [dataGrafica]);

    const maxFx = useMemo(() => {
        if (!dataGrafica || dataGrafica.length === 0) return 0;
        return Math.max(...dataGrafica.map(d => d.fx));
    }, [dataGrafica]);

    if (!datos || dataGrafica.length === 0) return null;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: 'white', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: FS.sm, fontWeight: 600 }}>x = {label}</p>
                    <p style={{ margin: 0, fontSize: FS.sm, color: payload[0].color }}>{datos.modo === 'acumulada' ? 'F(x)' : 'f(x)'} = {payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <MarcoWidgetMAT251 titulo={datos.modo === 'acumulada' ? "Función de Distribución Acumulada F(x)" : "Función de Densidad f(x) y Esperanza E(X)"} anchoCompleto={true} alto="450px">
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: FONT }}>
                <div style={{ flex: 1, minHeight: 0, width: '100%', overflow: 'hidden' }}>
                    <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={dataGrafica}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <ReferenceLine y={0} stroke="#475569" strokeWidth={2} />
                        
                        <XAxis 
                            dataKey="x" 
                            orientation={maxFx <= 0 ? 'top' : 'bottom'}
                            tick={{ fontSize: 12, fill: '#333333', fontWeight: 500 }}
                            tickLine={{ stroke: '#475569', strokeWidth: 2 }}
                            axisLine={{ stroke: 'transparent' }}
                            type="number"
                            domain={calculatedDomainAndTicks.domain}
                            ticks={calculatedDomainAndTicks.ticks}
                            tickMargin={10}
                            minTickGap={20}
                            label={{ value: 'Valor de x', position: 'insideBottom', offset: -10, fill: '#475569', fontSize: 13, fontWeight: 600, fontFamily: FONT }}
                        />
                        
                        <YAxis 
                            tick={{ fontSize: 12, fill: '#333333', fontWeight: 500 }}
                            tickLine={{ stroke: '#333333' }}
                            axisLine={{ stroke: '#333333', strokeWidth: 2 }}
                            tickFormatter={(val) => val.toFixed(2)}
                            width={55}
                            domain={['auto', 'auto']}
                            label={{ value: datos.modo === 'acumulada' ? 'F(x)' : 'f(x)', angle: -90, position: 'insideLeft', offset: -5, fill: '#475569', fontSize: 13, fontWeight: 600, fontFamily: FONT }}
                        />
                        
                        <Tooltip content={<CustomTooltip />} />
                        
                        {/* Curva de densidad / acumulada */}
                        <Area 
                            type="linear" 
                            dataKey="fx" 
                            stroke="var(--primary-color)" 
                            fill="var(--primary-color)" 
                            fillOpacity={0.3} 
                            strokeWidth={2}
                            baseValue={0}
                            isAnimationActive={true}
                        />
                    </AreaChart>
                </ResponsiveContainer>
                </div>
            
                <div style={{ marginTop: '10px', textAlign: 'center', fontSize: FS.sm, color: '#64748b' }}>
                    {datos.modo === 'acumulada' ? (
                        <>La curva muestra la probabilidad acumulada <strong>P(X ≤ x)</strong> hasta el valor x en el eje horizontal.</>
                    ) : (
                        <>
                        El área sombreada bajo la curva entre <strong>a = {datos.a}</strong> y <strong>b = {datos.b}</strong> representa la probabilidad total (Área = {datos.area ? datos.area.toFixed(4) : '1.0'}).
                        </>
                    )}
                </div>
            </div>
        </MarcoWidgetMAT251>
    );
}
