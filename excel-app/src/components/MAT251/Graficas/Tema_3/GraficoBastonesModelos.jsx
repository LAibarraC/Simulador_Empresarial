import React from 'react';
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
    Label
} from 'recharts';
import MarcoWidgetMAT251 from '../../ui/MarcoWidgetMAT251';

export default function GraficoBastonesModelos({ datos, condicion, resultados }) {
    if (!datos || datos.length === 0) return null;

    // --- Lógica de Recorte Dinámico del Eje X ---
    const esperanza = resultados && resultados.esperanza !== undefined ? resultados.esperanza : null;
    const desviacion = resultados && resultados.desviacion !== undefined ? resultados.desviacion : null;

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

    const minRecorte = Math.max(0, minX_idx - 2);
    const maxRecorte = Math.min(datos.length - 1, maxX_idx + 10);

    const datosRecortados = datos.slice(minRecorte, maxRecorte + 1);
    // --------------------------------------------

    // Función para determinar si una barra debe estar resaltada (cae en la condición)
    const isResaltado = (x) => {
        if (!condicion) return false;
        const { tipo, valorX, valorB } = condicion;
        if (tipo === 'exacta') return x === valorX;
        if (tipo === 'menor_igual') return x <= valorX;
        if (tipo === 'mayor_igual') return x >= valorX;
        if (tipo === 'intervalo') return x >= valorX && x <= valorB;
        return false;
    };

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const p = payload[0].value;
            return (
                <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#334155' }}>x = {label}</p>
                    <p style={{ margin: 0, color: '#3b82f6' }}>P(x) = {p.toFixed(4)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <MarcoWidgetMAT251 titulo="Gráfico de Bastones P(X = x)" anchoCompleto={true} alto="450px" id="grafico-bastones-tema3">
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1, minHeight: 0, width: '100%', overflow: 'hidden' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={datosRecortados}
                            margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

                            <XAxis
                                dataKey="x"
                                type="number"
                                domain={['dataMin', 'dataMax']}
                                padding={{ left: 20, right: 20 }}
                                ticks={datosRecortados.map(d => d.x)}
                                tick={{ fill: '#333333', fontSize: 12, fontWeight: 600 }}
                                axisLine={{ stroke: '#333333', strokeWidth: 2 }}
                                tickLine={{ stroke: '#333333', strokeWidth: 2 }}
                                label={{ value: 'Valor (x)', position: 'insideBottom', offset: -10, fill: '#333333', fontSize: 13, fontWeight: 600 }}
                            />

                            <YAxis
                                domain={[0, 'auto']}
                                padding={{ top: 30 }}
                                tick={{ fill: '#333333', fontSize: 12, fontWeight: 600 }}
                                axisLine={{ stroke: '#333333', strokeWidth: 2 }}
                                tickLine={{ stroke: '#333333', strokeWidth: 2 }}
                                label={{ value: 'Probabilidad P(x)', angle: -90, position: 'insideLeft', offset: 10, fill: '#333333', fontSize: 13, fontWeight: 600 }}
                            />

                            <Tooltip content={<CustomTooltip />} />

                            {esperanza !== null && desviacion !== null && (
                                <>
                                    <ReferenceArea
                                        x1={Math.max(0, esperanza - desviacion)}
                                        x2={esperanza + desviacion}
                                        fill="#94a3b8"
                                        fillOpacity={0.15}
                                        ifOverflow="hidden"
                                    />
                                    <ReferenceLine
                                        x={esperanza - desviacion}
                                        stroke="#059669"
                                        strokeDasharray="3 3"
                                        label={{ position: 'insideTopRight', value: `E(X) - σ = ${(esperanza - desviacion).toFixed(2)}`, fill: '#059669', fontSize: 9, fontWeight: 600 }}
                                    />
                                    <ReferenceLine
                                        x={esperanza + desviacion}
                                        stroke="#059669"
                                        strokeDasharray="3 3"
                                        label={{ position: 'insideTopLeft', value: `E(X) + σ = ${(esperanza + desviacion).toFixed(2)}`, fill: '#059669', fontSize: 9, fontWeight: 600 }}
                                    />
                                </>
                            )}

                            {esperanza !== null && (
                                <ReferenceLine
                                    x={esperanza}
                                    stroke="#dc2626"
                                    strokeDasharray="3 3"
                                    strokeWidth={1.5}
                                    label={{ position: 'top', value: `E(X) = ${esperanza.toFixed(2)}`, fill: '#dc2626', fontSize: 11, fontWeight: 700 }}
                                />
                            )}

                            {/* El gráfico de bastones se simula con barras muy delgadas */}
                            <Bar dataKey="p" barSize={8} radius={[4, 4, 0, 0]}>
                                {datosRecortados.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={isResaltado(entry.x) ? '#3b82f6' : '#cbd5e1'}
                                    />
                                ))}
                                <LabelList
                                    dataKey="p"
                                    content={(props) => {
                                        const { x, y, width, value, index } = props;
                                        const entry = datosRecortados[index];
                                        if (entry && isResaltado(entry.x)) {
                                            return (
                                                <text x={x + width / 2} y={y - 5} fill="#3b82f6" textAnchor="middle" fontSize="11" fontWeight="bold">
                                                    {value.toFixed(4)}
                                                </text>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </Bar>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </MarcoWidgetMAT251>
    );
}
