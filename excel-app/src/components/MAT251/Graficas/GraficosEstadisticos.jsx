import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList,
    PieChart, Pie, Cell, Label
} from 'recharts';
import '../../../styles/components/MAT251/Graficas/GraficosEstadisticos.css';

const RADIAN = Math.PI / 180;

const renderCustomizedLabelLine = (props, colores) => {
    const { cx, cy, midAngle, outerRadius, percent, index } = props;
    if (percent === 0) return null;

    const radius = outerRadius + 5;
    const elbowRadius = outerRadius + 25;
    const horizontalLength = 20;

    // Punto A: Inicio
    const x1 = cx + radius * Math.cos(-midAngle * RADIAN);
    const y1 = cy + radius * Math.sin(-midAngle * RADIAN);

    // Punto B: El quiebre (codo)
    const x2 = cx + elbowRadius * Math.cos(-midAngle * RADIAN);
    const y2 = cy + elbowRadius * Math.sin(-midAngle * RADIAN);

    // Punto C: Final de la línea horizontal
    const isLeft = x2 < cx;
    const x3 = x2 + (isLeft ? -horizontalLength : horizontalLength);
    const y3 = y2;

    const color = colores[index % colores.length];

    return (
        <g>
            <path
                d={`M${x1},${y1} L${x2},${y2} L${x3},${y3}`}
                stroke={color}
                fill="none"
                strokeWidth={1.5}
            />
            <circle cx={x3} cy={y3} r={4} fill={color} stroke="none" />
        </g>
    );
};

const renderCustomizedLabelText = (props, colores) => {
    const { cx, cy, midAngle, outerRadius, percent, index } = props;
    if (percent === 0) return null;

    const elbowRadius = outerRadius + 25;
    const horizontalLength = 20;
    const textOffset = 10;

    const x2 = cx + elbowRadius * Math.cos(-midAngle * RADIAN);
    const y2 = cy + elbowRadius * Math.sin(-midAngle * RADIAN);

    const isLeft = x2 < cx;
    const x3 = x2 + (isLeft ? -horizontalLength : horizontalLength);
    const y3 = y2;

    const textX = x3 + (isLeft ? -textOffset : textOffset);
    const textY = y3;

    return (
        <text
            x={textX}
            y={textY}
            fill={colores[index % colores.length]}
            textAnchor={isLeft ? 'end' : 'start'}
            dominantBaseline="central"
            fontWeight="bold"
            fontSize="14px"
        >
            {(percent * 100).toFixed(2)}%
        </text>
    );
};


export default function GraficosProbabilidad({ 
    resProbabilidad, 
    datosArray, 
    isCond,
    eventoFavorable = [],
    eventoCondicion = [],
    isManual = false
}) {
    if (!resProbabilidad) return null;

    const dataPie = [
        { name: 'Éxito (Favorables)', value: resProbabilidad.casosFavorables },
        { name: 'Resto (No Favorables)', value: resProbabilidad.casosTotales - resProbabilidad.casosFavorables }
    ];

    const tonoBase = (resProbabilidad.casosTotales * 47 + resProbabilidad.casosFavorables * 23) % 360;

    const COLORS = [
        `hsl(${tonoBase}, 95%, 45%)`,
        `hsl(${(tonoBase + 180) % 360}, 20%, 70%)`
    ];

    // Nueva lógica: Contar frecuencias absolutas únicamente de los eventos seleccionados
    const eventosFav = Array.isArray(eventoFavorable) ? eventoFavorable : [];
    const eventosCond = Array.isArray(eventoCondicion) ? eventoCondicion : [];
    const selectedEvents = [...new Set([...eventosFav, ...eventosCond])].filter(Boolean);

    const dataBarra = selectedEvents.map(ev => {
        let count = 0;
        datosArray.forEach(row => {
            if (typeof row === 'string') {
                if (row.includes(' | ')) {
                    const partes = row.split(' | ').map(p => p.trim());
                    if (partes.includes(ev)) count++;
                } else {
                    if (row.trim() === ev) count++;
                }
            }
        });
        return { name: ev, nombre: ev, frecuencia: count };
    });

    return (
        <div className="contenedor-graficos-prob">
            {isCond && resProbabilidad.vennStats && (
                <>
                    <div className="grafico-card" style={{ marginBottom: '20px' }}>
                        <h3 className="titulo-profesional" style={{ textAlign: 'center' }}>Diagrama de Venn (Relación de Eventos)</h3>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
                            <svg width="100%" height="auto" viewBox="0 0 600 350" style={{ maxHeight: '380px' }}>
                                {/* Universo */}
                                <rect x="10" y="10" width="580" height="330" fill="var(--bg-body)" stroke="var(--border-color)" strokeWidth="2" rx="10" />
                                <text x="25" y="35" fill="var(--text-muted)" fontSize="14" fontWeight="bold">Universo (N={resProbabilidad.vennStats.nTotal})</text>

                                {/* Círculo Evento A */}
                                <circle cx="230" cy="190" r="120" fill="#3b82f6" fillOpacity="0.15" stroke="#3b82f6" strokeWidth="2.5" />
                                <text x="160" y="55" fill="#3b82f6" fontSize="16" fontWeight="bold" textAnchor="middle">Evento A</text>

                                {/* Círculo Evento B */}
                                <circle cx="370" cy="190" r="120" fill="var(--primary-color)" fillOpacity="0.15" stroke="var(--primary-color)" strokeWidth="2.5" />
                                <text x="440" y="55" fill="var(--primary-color)" fontSize="16" fontWeight="bold" textAnchor="middle">Evento B</text>

                                {/* Valores Exclusivos */}
                                <text x="165" y="200" fill="#3b82f6" fontSize="26" fontWeight="bold" textAnchor="middle">
                                    {resProbabilidad.vennStats.nA - resProbabilidad.vennStats.nAB}
                                </text>
                                <text x="435" y="200" fill="var(--primary-color)" fontSize="26" fontWeight="bold" textAnchor="middle">
                                    {resProbabilidad.vennStats.nB - resProbabilidad.vennStats.nAB}
                                </text>

                                {/* Intersección */}
                                <text x="300" y="200" fill="var(--text-color)" fontSize="32" fontWeight="extrabold" textAnchor="middle">
                                    {resProbabilidad.vennStats.nAB}
                                </text>

                                {/* Afuera (Ninguno) */}
                                <text x="510" y="315" fill="var(--text-muted)" fontSize="16" fontWeight="bold" textAnchor="middle">
                                    Ninguno: {resProbabilidad.vennStats.nTotal - (resProbabilidad.vennStats.nA + resProbabilidad.vennStats.nB - resProbabilidad.vennStats.nAB)}
                                </text>
                            </svg>
                        </div>
                        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                            <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>■ Evento A</span> | <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>■ Evento B (Condición)</span> | <span style={{ color: 'var(--text-color)', fontWeight: 'bold' }}>■ Intersección (A ∩ B)</span>
                        </div>
                    </div>

                    <div className="grafico-card" style={{ marginBottom: '20px' }}>
                        <h3 className="titulo-profesional" style={{ textAlign: 'center' }}>Frecuencias del Cálculo Condicional</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={[
                                    { nombre: 'Intersección (A ∩ B)', valor: resProbabilidad.vennStats.nAB, color: '#f87171' },
                                    { nombre: 'Universo Total (N)', valor: resProbabilidad.vennStats.nTotal, color: '#9ca3af' },
                                    { nombre: 'Condición n(B)', valor: resProbabilidad.vennStats.nB, color: '#93c5fd' }
                                ]}
                                margin={{ top: 30, right: 30, left: 10, bottom: 30 }}
                                barCategoryGap="25%"
                            >
                                <CartesianGrid strokeDasharray="3 3" strokeWidth={1.5} fill="var(--border-color)" fillOpacity={0.06} />
                                <XAxis
                                    dataKey="nombre"
                                    axisLine={{ stroke: 'var(--text-muted)', strokeWidth: 1.5 }}
                                    tickLine={{ stroke: 'var(--text-muted)' }}
                                    tick={{ fill: 'var(--text-color)', fontSize: 13, fontWeight: 600, dy: 10 }}
                                />
                                <YAxis
                                    axisLine={{ stroke: 'var(--text-muted)', strokeWidth: 1.5 }}
                                    tickLine={{ stroke: 'var(--text-muted)' }}
                                    tick={{ fill: 'var(--text-color)', fontSize: 12 }}
                                    allowDecimals={false}
                                >
                                    <Label value="Frecuencia (n)" angle={-90} position="insideLeft" style={{ fill: 'var(--text-muted)', fontSize: 13, fontWeight: 'bold', textAnchor: 'middle' }} />
                                </YAxis>
                                <Tooltip
                                    cursor={{ fill: 'var(--border-color)', fillOpacity: 0.3 }}
                                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}
                                    itemStyle={{ color: 'var(--text-color)', fontWeight: 'bold' }}
                                    labelStyle={{ color: 'var(--text-muted)' }}
                                />
                                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                                    {[
                                        { color: '#f87171' },
                                        { color: '#9ca3af' },
                                        { color: '#93c5fd' }
                                    ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                    <LabelList dataKey="valor" position="top" style={{ fill: 'var(--text-color)', fontSize: '14px', fontWeight: 'bold' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}


            <div className="grafico-card full-width">
                <h3 className="titulo-profesional">Probabilidad de Ocurrencia</h3>
                <div className="termometro-container">
                    <div
                        className="termometro-fill"
                        style={{ width: `${resProbabilidad.probabilidadPorcentaje}%` }}
                    >
                        {resProbabilidad.probabilidadPorcentaje}%
                    </div>
                </div>
                <p className="leyenda-termometro">0% (Imposible) — 100% (Seguro)</p>
            </div>

            <div className="grid-graficos" style={isManual ? { display: 'flex', justifyContent: 'center' } : {}}>
                <div className="grafico-card" style={isManual ? { width: '100%', maxWidth: '600px' } : {}}>
                    <h3 className="titulo-profesional">{isCond ? 'Distribución dentro de Condición (B)' : 'Distribución del Evento'}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart margin={{ top: 10, right: 30, left: 30, bottom: 30 }}>
                            <Pie
                                data={dataPie}
                                cx="50%"
                                cy="45%"
                                innerRadius={55}
                                outerRadius={75}
                                paddingAngle={0}
                                dataKey="value"
                                label={(props) => renderCustomizedLabelText(props, COLORS)}
                                labelLine={(props) => renderCustomizedLabelLine(props, COLORS)}
                            >
                                {dataPie.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                formatter={(value, name) => [`${value} casos`, name]}
                                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}
                                itemStyle={{ color: 'var(--text-color)', fontWeight: 'bold' }}
                                labelStyle={{ color: 'var(--text-muted)' }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                wrapperStyle={{ paddingTop: '15px', color: 'var(--text-color)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {!isManual && (
                    <div className="grafico-card">
                        <h3 className="titulo-profesional">{isCond ? 'Frecuencia en Condición (B)' : 'Frecuencia de Datos Únicos'}</h3>
                        {dataBarra.length === 0 ? (
                            <div style={{ display: 'flex', height: 300, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', border: '1px dashed var(--border-color)', borderRadius: '8px', background: 'var(--bg-body)' }}>
                                Sin eventos seleccionados. Activa algún evento para ver el gráfico.
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={dataBarra}
                                    margin={{ top: 20, right: 20, left: -20, bottom: 60 }}
                                    barCategoryGap="15%"
                                >
                                    <defs>
                                        <linearGradient id="colorBarraPro" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                                            <stop offset="100%" stopColor="#1e40af" stopOpacity={1} />
                                        </linearGradient>
                                    </defs>

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        strokeWidth={1.5}
                                        fill="var(--border-color)"
                                        fillOpacity={0.06}
                                    />

                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        tick={{ fontSize: 12, fill: '#64748b' }}
                                        interval={0}
                                        dy={10}
                                    />

                                    <YAxis
                                        axisLine={{ stroke: 'var(--text-muted)', strokeWidth: 1.5 }}
                                        tickLine={{ stroke: 'var(--text-muted)' }}
                                        tick={{ fill: 'var(--text-color)', fontSize: 12 }}
                                        allowDecimals={false}
                                    >
                                        <Label
                                            value="Frecuencia"
                                            angle={-90}
                                            position="insideLeft"
                                            style={{ fill: 'var(--text-muted)', fontSize: 13, fontWeight: 'bold', textAnchor: 'middle' }}
                                        />
                                    </YAxis>

                                    <Tooltip
                                        cursor={{ fill: 'var(--border-color)', fillOpacity: 0.3 }}
                                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}
                                        itemStyle={{ color: 'var(--text-color)', fontWeight: 'bold' }}
                                        labelStyle={{ color: 'var(--text-muted)' }}
                                    />

                                    <Bar
                                        dataKey="frecuencia"
                                        fill="url(#colorBarraPro)"
                                        radius={[4, 4, 0, 0]}
                                    >
                                        <LabelList
                                            dataKey="frecuencia"
                                            position="top"
                                            style={{ fontSize: '11px', fill: '#475569', fontWeight: 600 }}
                                        />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}