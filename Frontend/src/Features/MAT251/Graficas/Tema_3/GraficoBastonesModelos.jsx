import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import {
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine,
    ReferenceArea,
    LabelList,
    Label,
    Line,
    Area
} from 'recharts';
import MarcoWidgetMAT251 from '../../ui/MarcoWidgetMAT251';

const CustomKatexLabel = (props) => {
    const { viewBox, value } = props;
    if (!viewBox) return null;
    const { x, y } = viewBox;
    
    return (
        <foreignObject x={x - 50} y={y - 30} width={100} height={30} style={{ overflow: 'visible' }}>
            <div 
                dangerouslySetInnerHTML={{ __html: katex.renderToString(value, { throwOnError: false }) }} 
                style={{ color: 'var(--text-main, #1e293b)', fontSize: '12px', fontWeight: 'bold', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '100%' }} 
            />
        </foreignObject>
    );
};

const CustomLabelX = ({ viewBox }) => {
    if (!viewBox) return null;
    return (
        <text x={viewBox.x + viewBox.width / 2} y={viewBox.y + 40} fill="var(--text-main, #333333)" fontSize={12} fontWeight="bold" textAnchor="middle">
            Valor (<tspan fontFamily="'KaTeX_Math', 'Times New Roman', serif" fontStyle="italic" fontSize={13}>x</tspan>)
        </text>
    );
};

const CustomLabelY = ({ viewBox }) => {
    if (!viewBox) return null;
    return (
        <text x={viewBox.x + 20} y={viewBox.y + viewBox.height / 2} transform={`rotate(-90, ${viewBox.x + 20}, ${viewBox.y + viewBox.height / 2})`} fill="var(--text-main, #333333)" fontSize={12} fontWeight="bold" textAnchor="middle">
            Probabilidad <tspan fontFamily="'KaTeX_Math', 'Times New Roman', serif" fontStyle="italic" fontSize={13}>P(x)</tspan>
        </text>
    );
};

const getOperador = (tipo) => {
    switch (tipo) {
        case 'mayor_igual': return '\\ge';
        case 'menor_igual': return '\\le';
        case 'mayor_estricto': return '>';
        case 'menor_estricto': return '<';
        default: return '=';
    }
};

export default function GraficoBastonesModelos({ datos, condicion, modoPDF = false }) {
    if (!datos || datos.length === 0) return null;

    const renderLatex = (str) => {
        return <span style={{ display: 'inline-flex', alignItems: 'center' }} dangerouslySetInnerHTML={{ __html: katex.renderToString(str, { throwOnError: false }) }} />;
    };

    // Detectar si es el modelo de Bernoulli por la forma de sus datos
    const esBernoulli = datos.length === 2 && datos[0].x === 0 && datos[1].x === 1;

    // --- Lógica de Recorte Dinámico del Eje X ---

    const epsilon = 0.0001;
    let minX_idx = 0;
    let maxX_idx = datos.length - 1;

    for (let i = 0; i < datos.length; i++) {
        if (datos[i].p > epsilon) {
            minX_idx = i;
            break;
        }
    }

    for (let i = datos.length - 1; i >= 0; i--) {
        if (datos[i].p > epsilon) {
            maxX_idx = i;
            break;
        }
    }

    if (minX_idx > maxX_idx) {
        minX_idx = 0;
        maxX_idx = datos.length - 1;
    }

    // Función para determinar si una barra debe estar resaltada (cae en la condición)
    const isResaltado = (x) => {
        if (!condicion) return false;
        const { tipo, valorX, valorB } = condicion;
        if (tipo === 'exacta') return x === valorX;
        if (tipo === 'menor_igual') return x <= valorX;
        if (tipo === 'mayor_igual') return x >= valorX;
        if (tipo === 'intervalo') return x >= valorX && x <= valorB;
        if (tipo === 'menor_estricto') return x < valorX;
        if (tipo === 'mayor_estricto') return x > valorX;
        if (tipo === 'intervalo_estricto') return x > valorX && x < valorB;
        return false;
    };

    // Función para extender el área naranja hasta las líneas de referencia
    const isEnRangoArea = (x) => {
        if (!condicion) return false;
        const { tipo, valorX, valorB } = condicion;
        if (tipo === 'exacta') return x === valorX;
        
        // El área siempre se dibuja hasta los límites dados por el usuario
        if (tipo === 'menor_igual' || tipo === 'menor_estricto') return x <= valorX;
        if (tipo === 'mayor_igual' || tipo === 'mayor_estricto') return x >= valorX;
        if (tipo === 'intervalo' || tipo === 'intervalo_estricto') return x >= valorX && x <= valorB;
        
        return false;
    };

    const minRecorte = Math.max(0, minX_idx - 2);
    const maxRecorte = Math.min(datos.length - 1, maxX_idx + 10);

    const datosRecortados = datos.slice(minRecorte, maxRecorte + 1).map(d => ({
        ...d,
        p_linea: condicion && condicion.tipo !== 'exacta' && condicion.valorX !== undefined ? (isEnRangoArea(d.x) ? d.p : null) : null
    }));

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const p = payload[0].value;
            return (
                <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#334155' }}>x = {label}</p>
                    <p style={{ margin: 0, color: '#3b82f6' }}>P(x) = {p.toFixed(2)}</p>
                </div>
            );
        }
        return null;
    };

    const operadorTexto = { menor_igual: '≤', mayor_igual: '≥', menor_estricto: '<', mayor_estricto: '>' };
    const grafico = (
        <ComposedChart
        width={modoPDF ? 640 : undefined}
        height={modoPDF ? 300 : undefined}
        data={datosRecortados}
        margin={{ top: modoPDF ? (condicion ? 24 : 8) : 20, right: 5, left: modoPDF ? 22 : -5, bottom: modoPDF ? 0 : 20 }}
        barCategoryGap={esBernoulli ? '15%' : '10%'}
    >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />



        <XAxis
            dataKey="x"
            type={esBernoulli ? "category" : "number"}
            domain={esBernoulli ? undefined : ['dataMin', 'dataMax']}
            padding={esBernoulli ? { left: 10, right: 10 } : { left: 10, right: 10 }}
            ticks={datosRecortados.map(d => d.x)}
            tick={{ fill: modoPDF ? '#000000' : 'var(--text-main, #333333)', fontSize: modoPDF ? '7pt' : '0.7rem', fontWeight: 600 }}
            axisLine={{ stroke: modoPDF ? '#000000' : 'var(--text-main, #333333)', strokeWidth: 2 }}
            tickLine={{ stroke: modoPDF ? '#000000' : 'var(--text-main, #333333)', strokeWidth: 2 }}
            height={modoPDF ? 20 : undefined}
            tickMargin={modoPDF ? 2 : undefined}
            tickSize={modoPDF ? 4 : undefined}
            label={modoPDF ? undefined : <CustomLabelX />}
        />

        <YAxis
            domain={esBernoulli ? [0, 1] : [0, 'auto']}
            padding={{ top: modoPDF ? 12 : 30 }}
            width={modoPDF ? 44 : undefined}
            tick={{ fill: modoPDF ? '#000000' : 'var(--text-main, #333333)', fontSize: modoPDF ? '7pt' : '0.7rem', fontWeight: 600 }}
            axisLine={{ stroke: modoPDF ? '#000000' : 'var(--text-main, #333333)', strokeWidth: 2 }}
            tickLine={{ stroke: modoPDF ? '#000000' : 'var(--text-main, #333333)', strokeWidth: 2 }}
            label={modoPDF ? undefined : <CustomLabelY />}
        />

        {!modoPDF && <Tooltip content={<CustomTooltip />} />}

        {/* Reference lines moved to the bottom so they draw on top */}

        {/* El gráfico de bastones se simula con barras muy delgadas, pero para Bernoulli es un histograma */}
        <Bar
            isAnimationActive={!modoPDF}
            dataKey="p" 
            fill="#3b82f6" 
            stroke={esBernoulli ? "transparent" : "none"}
            {...(esBernoulli ? {} : { barSize: 15, radius: [0, 0, 0, 0] })}
        >
            {datosRecortados.map((entry, index) => (
                <Cell
                    key={`cell-${index}`}
                    fill="#3b82f6"
                    fillOpacity={isResaltado(entry.x) ? 0.4 : 1}
                />
            ))}
        </Bar>

        {/* Línea envolvente (envelope) para mostrar la forma de la distribución (excepto en Bernoulli) */}
        {!esBernoulli && (
            <>
                <Area
                    type="linear"
                    dataKey="p_linea"
                    fill="#f97316"
                    fillOpacity={0.25}
                    stroke="none"
                    isAnimationActive={false}
                    connectNulls={false}
                />
                <Line
                    type="linear"
                    dataKey="p_linea"
                    stroke={modoPDF ? '#000000' : 'var(--text-main, #334155)'}
                    strokeWidth={1}
                    dot={false}
                    isAnimationActive={false}
                    connectNulls={false}
                />
            </>
        )}

        {condicion && condicion.valorX !== undefined && (
            <>
                <ReferenceLine
                    x={condicion.valorX}
                    stroke="#f97316"
                    strokeDasharray="4 4"
                    strokeWidth={3}
                    label={modoPDF ? { value: condicion.tipo.includes('intervalo') ? `X = ${condicion.valorX}` : `X ${operadorTexto[condicion.tipo] || '='} ${condicion.valorX}`, position: 'top', fill: '#000000', fontSize: 11 } : <CustomKatexLabel value={condicion.tipo.includes('intervalo') ? `X = ${condicion.valorX}` : `X ${getOperador(condicion.tipo)} ${condicion.valorX}`} />}
                />
                {condicion.tipo.includes('intervalo') && condicion.valorB !== undefined && (
                    <ReferenceLine
                        x={condicion.valorB}
                        stroke="#f97316"
                        strokeDasharray="4 4"
                        strokeWidth={3}
                        label={modoPDF ? { value: `X = ${condicion.valorB}`, position: 'top', fill: '#000000', fontSize: 11 } : <CustomKatexLabel value={`X = ${condicion.valorB}`} />}
                    />
                )}
            </>
        )}
    </ComposedChart>
    );

    if (modoPDF) {
        return (
            <div style={{ width: '640px', maxWidth: '100%', margin: '0 auto', color: '#000000' }}>
                <div style={{ position: 'relative', height: '300px' }}>
                    <div style={{ position: 'absolute', left: '10px', top: `${condicion ? 24 : 8}px`, width: '20px', height: `${300 - (condicion ? 24 : 8) - 20}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ display: 'inline-block', transform: 'rotate(-90deg)', whiteSpace: 'nowrap', fontSize: '12px' }}>Probabilidad P(x)</span>
                    </div>
                    {grafico}
                </div>
                <div style={{ textAlign: 'center', fontSize: '12px' }}>Valor (x)</div>
            </div>
        );
    }

    return (
        <MarcoWidgetMAT251 titulo={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>Gráfico de Bastones {renderLatex('P(X = x)')}</span>} anchoCompleto={true} alto="450px" id="tour-t3discreta-grafico">
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, minHeight: 0, width: '100%', overflow: 'hidden' }}>
                    <ResponsiveContainer width="100%" height="100%">
{grafico}
                    </ResponsiveContainer>
                </div>
            </div>
        </MarcoWidgetMAT251>
    );
}
