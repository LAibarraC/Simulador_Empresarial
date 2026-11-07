import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { compile } from 'mathjs';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';
import MarcoWidgetMAT251 from '../../ui/MarcoWidgetMAT251';
import { FONT, FS } from '../../Principal/Constantes';

const CustomKatexLabel = (props) => {
    const { viewBox, value, offsetY = 0, offsetX = 0 } = props;
    if (!viewBox) return null;
    const { x, y } = viewBox;

    return (
        <foreignObject x={x - 70 + offsetX} y={y - 24 + offsetY} width={140} height={24} style={{ overflow: 'visible', pointerEvents: 'none' }}>
            <div
                dangerouslySetInnerHTML={{ __html: katex.renderToString(value, { throwOnError: false }) }}
                style={{
                    color: 'var(--text-pure)',
                    fontSize: '11px',
                    textAlign: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    fontFamily: FONT
                }}
            />
        </foreignObject>
    );
};

const YAxisKatexLabel = ({ viewBox, value }) => {
    if (!viewBox) return null;
    const { x, y, height } = viewBox;
    const cx = x + 15;
    const cy = y + height / 2;
    return (
        <foreignObject x={cx - 50} y={cy - 50} width={100} height={100} style={{ overflow: 'visible', pointerEvents: 'none' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ transform: 'rotate(-90deg)', color: 'var(--text-pure)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(value, { throwOnError: false }) }} />
                </div>
            </div>
        </foreignObject>
    );
};

const XAxisKatexLabel = ({ viewBox, value }) => {
    if (!viewBox) return null;
    const { x, y, width, height } = viewBox;
    const cx = x + width / 2;
    const cy = y + height - 5;
    return (
        <foreignObject x={cx - 100} y={cy - 12} width={200} height={30} style={{ overflow: 'visible', pointerEvents: 'none' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-pure)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', gap: '4px' }}>
                <span>Valor de</span>
                <span dangerouslySetInnerHTML={{ __html: katex.renderToString(value, { throwOnError: false }) }} />
            </div>
        </foreignObject>
    );
};

export default function GraficoAreaContinua({ datos, modoPDF = false }) {
    const dataGrafica = useMemo(() => {
        if (!datos || !datos.funcion) return [];
        
        try {
            const compiledExpr = compile(datos.funcion);
            let a = parseFloat(datos.a);
            let b = parseFloat(datos.b);

            const varName = datos.modo === 'acumulada' ? 't' : 'x';

            const f = (val) => {
                try { return compiledExpr.evaluate({ [varName]: val }); } catch { return 0; }
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
            if (!Number.isFinite(a) || !Number.isFinite(b) || a >= b) return [];
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
                    try { fxVal = compiledExpr.evaluate({ [varName]: x }); } catch { fxVal = 0; }
                    
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
                } catch {
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

    const yAxisConfig = useMemo(() => {
        const areaVal = datos && datos.area !== undefined && datos.area !== null ? Number(datos.area) : 1;
        const esAreaUno = Math.abs(areaVal - 1) < 0.05 || (datos && datos.modo === 'acumulada');

        if (esAreaUno && maxFx <= 1) {
            return {
                domain: [0, 1],
                ticks: [0, 0.2, 0.4, 0.6, 0.8, 1.0]
            };
        }

        if (maxFx > 0) {
            return {
                domain: [0, 'auto'],
                ticks: undefined
            };
        }

        return {
            domain: ['auto', 'auto'],
            ticks: undefined
        };
    }, [datos, maxFx]);

    if (!datos || dataGrafica.length === 0) return null;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '5px', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)', color: 'var(--text-pure)' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: FS.sm, fontWeight: 600 }}>
                        <InlineMath math={`x = ${label}`} />
                    </p>
                    <p style={{ margin: 0, fontSize: FS.sm, color: payload[0].color }}>
                        <InlineMath math={`${datos.modo === 'acumulada' ? 'F(x)' : 'f(x)'} = ${payload[0].value}`} />
                    </p>
                </div>
            );
        }
        return null;
    };

    const esperanzaVisible = Number.isFinite(datos.eX)
        && datos.eX >= calculatedDomainAndTicks.domain[0]
        && datos.eX <= calculatedDomainAndTicks.domain[1];
    const altoPDF = 288;
    const margenSuperiorPDF = esperanzaVisible ? 24 : 8;

    const grafico = (
        <AreaChart
        width={modoPDF ? 640 : undefined}
        height={modoPDF ? altoPDF : undefined}
        data={dataGrafica}
        margin={{ top: modoPDF ? margenSuperiorPDF : 36, right: 30, left: modoPDF ? 20 : -5, bottom: modoPDF ? 0 : 25 }}
    >
        <CartesianGrid strokeDasharray="3 3" stroke={modoPDF ? '#d1d5db' : 'var(--border-color)'} />
        <ReferenceLine y={0} stroke={modoPDF ? '#000000' : 'var(--text-main)'} strokeWidth={2} />
        
        {datos.eX !== undefined && (
            <ReferenceLine 
                x={datos.eX} 
                stroke="#ef4444" 
                strokeDasharray="5 5" 
                strokeWidth={2}
                label={modoPDF ? { value: `E(X) = ${datos.eX.toFixed(4)}`, position: 'top', fill: '#000000', fontSize: 11 } : <CustomKatexLabel value={`\\mathbf{E(X)} = \\mathrm{${datos.eX.toFixed(4)}}`} color="#000000" />}
            />
        )}
        
        <XAxis 
            dataKey="x" 
            orientation={maxFx <= 0 ? 'top' : 'bottom'}
            tick={{ fontSize: 11, fill: modoPDF ? '#000000' : 'var(--text-pure)', fontWeight: 500 }}
            tickLine={{ stroke: modoPDF ? '#000000' : 'var(--text-main)', strokeWidth: 2 }}
            axisLine={{ stroke: 'transparent' }}
            type="number"
            domain={calculatedDomainAndTicks.domain}
            ticks={calculatedDomainAndTicks.ticks}
            height={modoPDF ? 28 : undefined}
            tickMargin={modoPDF ? 5 : 10}
            minTickGap={20}
            label={modoPDF ? undefined : <XAxisKatexLabel value="x" />}
        />
        
        <YAxis 
            tick={{ fontSize: 11, fill: modoPDF ? '#000000' : 'var(--text-pure)', fontWeight: 500 }}
            tickLine={{ stroke: modoPDF ? '#000000' : 'var(--text-main)' }}
            axisLine={{ stroke: modoPDF ? '#000000' : 'var(--text-main)', strokeWidth: 2 }}
            tickFormatter={(val) => val.toFixed(2)}
            width={55}
            domain={yAxisConfig.domain}
            ticks={yAxisConfig.ticks}
            label={modoPDF ? undefined : <YAxisKatexLabel value={datos.modo === 'acumulada' ? 'F(x)' : 'f(x)'} />}
        />
        
        {!modoPDF && <Tooltip content={<CustomTooltip />} />}
        
        {/* Curva de densidad */}
        <Area 
            type="linear" 
            dataKey="fx" 
            stroke={modoPDF ? '#2563eb' : 'var(--primary-color)'} 
            fill={modoPDF ? '#2563eb' : 'var(--primary-color)'} 
            fillOpacity={0.3} 
            strokeWidth={2}
            baseValue={0}
            isAnimationActive={!modoPDF}
        />
    </AreaChart>
    );

    if (modoPDF) {
        return (
            <div style={{ width: '640px', maxWidth: '100%', margin: '0 auto', color: '#000000' }}>
                <div style={{ position: 'relative', height: `${altoPDF}px` }}>
                    <div style={{ position: 'absolute', left: '7px', top: `${margenSuperiorPDF}px`, width: '20px', height: `${altoPDF - margenSuperiorPDF - 28}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ display: 'inline-block', transform: 'rotate(-90deg)', whiteSpace: 'nowrap', fontSize: '12px' }}>
                            {datos.modo === 'acumulada' ? 'F(x)' : 'f(x)'}
                        </span>
                    </div>
                    {grafico}
                </div>
                <div style={{ textAlign: 'center', fontSize: '12px' }}>Valor de x</div>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', fontFamily: FONT }}>
            <MarcoWidgetMAT251 
                titulo={<>Función de Densidad <InlineMath math={datos.modo === 'acumulada' ? 'F(x)' : 'f(x)'} /> y Esperanza <InlineMath math="E(X)" /></>} 
                anchoCompleto={true} 
                alto="380px"
            >
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {grafico}
                    </ResponsiveContainer>
                </div>
            </MarcoWidgetMAT251>
            
            {/* Mensaje explicativo situado debajo de la gráfica */}
            <div style={{ textAlign: 'center', fontSize: FS.sl, color: 'var(--text-main)', marginTop: '8px' }}>
                El área sombreada bajo la curva entre <InlineMath math={`a = ${datos.a}`} /> y <InlineMath math={`b = ${datos.b}`} /> representa la probabilidad total (<InlineMath math={`\\text{Área} = ${datos.area != null ? datos.area.toFixed(4) : '1.0000'}`} />).
            </div>
        </div>
    );
}
