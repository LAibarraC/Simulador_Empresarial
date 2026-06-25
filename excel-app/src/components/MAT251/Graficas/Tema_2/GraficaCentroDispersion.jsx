import React, { useState, useMemo } from 'react';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
    ReferenceLine, ReferenceArea, ResponsiveContainer, Label, Tooltip
} from 'recharts';
import { FONT, FS } from '../../Principal/Constantes';

// ─────────────────────────────────────────────────────────────────────────────
// Genera puntos de la campana de Gauss escalada para comparar con P(X=x)
// Escala el pico de la gaussiana al valor máximo de P(x) para comparación directa
// ─────────────────────────────────────────────────────────────────────────────
function generarCampana(mu, sigma, datos) {
    if (!sigma || sigma <= 0 || !datos || datos.length === 0) return [];

    const xs       = datos.map(d => d.x);
    const minX     = Math.min(...xs);
    const maxX     = Math.max(...xs);
    const rango    = maxX - minX || sigma * 4;
    const padding  = Math.max(sigma * 2.5, rango * 0.5);
    const start    = minX - padding;
    const end      = maxX + padding;
    const N        = 150;
    const step     = (end - start) / N;

    // Pico de la PDF normal (sin normalizar)
    const gaussPico = 1 / (sigma * Math.sqrt(2 * Math.PI));
    // Pico máximo de P(x) de los datos discretos
    const maxP      = Math.max(...datos.map(d => d.p));
    // Factor de escala: hacemos que el pico de la gaussiana iguale maxP
    const escala    = maxP / gaussPico;

    const puntos = [];
    for (let i = 0; i <= N; i++) {
        const x     = start + i * step;
        const gauss = (1 / (sigma * Math.sqrt(2 * Math.PI))) *
                      Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
        puntos.push({
            x:     parseFloat(x.toFixed(5)),
            gauss: parseFloat((gauss * escala).toFixed(6)),
        });
    }
    return puntos;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mezcla los puntos gaussianos con los datos discretos para Vista 2
// ─────────────────────────────────────────────────────────────────────────────
function mezclarDatosVista2(datos, esperanza, desviacion) {
    const campana  = generarCampana(esperanza, desviacion, datos);
    const pMap     = new Map(datos.map(d => [d.x, d.p]));

    // Insertar p solo donde coincida exactamente con un valor discreto
    const merged = campana.map(gp => {
        const pExacta = pMap.get(gp.x);
        return { x: gp.x, gauss: gp.gauss, p: pExacta !== undefined ? pExacta : null };
    });

    // Asegurarse de que cada dato discreto esté en el array
    datos.forEach(d => {
        const yaEsta = merged.some(m => Math.abs(m.x - d.x) < 0.001);
        if (!yaEsta) {
            const gaussVal = desviacion > 0
                ? (() => {
                    const gaussPico = 1 / (desviacion * Math.sqrt(2 * Math.PI));
                    const maxP      = Math.max(...datos.map(dd => dd.p));
                    const escala    = maxP / gaussPico;
                    return parseFloat(
                        ((1 / (desviacion * Math.sqrt(2 * Math.PI))) *
                         Math.exp(-0.5 * Math.pow((d.x - esperanza) / desviacion, 2)) * escala
                        ).toFixed(6)
                    );
                })()
                : 0;
            merged.push({ x: d.x, gauss: gaussVal, p: d.p });
        }
    });

    return merged.sort((a, b) => a.x - b.x);
}

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip personalizado (muestra los campos disponibles en cada punto)
// ─────────────────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;

    return (
        <div style={{
            background: 'white', padding: '10px 14px',
            border: '1px solid #e2e8f0', borderRadius: '8px',
            fontFamily: FONT, fontSize: FS.sm,
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            minWidth: '150px'
        }}>
            <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '5px', marginBottom: '5px' }}>
                x = {typeof d.x === 'number' ? d.x.toFixed(3) : d.x}
            </p>
            {d.p !== null && d.p !== undefined && (
                <p style={{ margin: '3px 0', color: '#3b82f6', fontWeight: 600 }}>
                    P(X = x) = {d.p.toFixed(4)}
                </p>
            )}
            {d.gauss !== null && d.gauss !== undefined && (
                <p style={{ margin: '3px 0', color: '#94a3b8' }}>
                    f(x) Normal = {d.gauss.toFixed(4)}
                </p>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Leyenda compacta para Vista 1
// ─────────────────────────────────────────────────────────────────────────────
const LeyendaVista1 = ({ esperanza, desviacion }) => (
    <div style={{ display: 'flex', gap: '12px', fontFamily: FONT, fontSize: FS.xs, color: '#475569', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Media */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="22" height="10"><line x1="0" y1="5" x2="22" y2="5" stroke="#ef4444" strokeWidth="3" /></svg>
            <span>μ = {esperanza?.toFixed(3)}</span>
        </div>
        {/* Límite inferior */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="22" height="10"><line x1="0" y1="5" x2="22" y2="5" stroke="#f97316" strokeWidth="2" strokeDasharray="4 3" /></svg>
            <span style={{ color: '#c2410c' }}>μ−σ = {(esperanza - desviacion)?.toFixed(2)}</span>
        </div>
        {/* Límite superior */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="22" height="10"><line x1="0" y1="5" x2="22" y2="5" stroke="#14b8a6" strokeWidth="2" strokeDasharray="4 3" /></svg>
            <span style={{ color: '#0f766e' }}>μ+σ = {(esperanza + desviacion)?.toFixed(2)}</span>
        </div>
        {/* Área dispersión */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: 22, height: 10, background: '#fef08a', border: '1px solid #facc15', borderRadius: 2 }} />
            <span>Área μ ± σ</span>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Leyenda compacta para Vista 2
// ─────────────────────────────────────────────────────────────────────────────
const LeyendaVista2 = () => (
    <div style={{ display: 'flex', gap: '14px', fontFamily: FONT, fontSize: FS.xs, color: '#475569', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="22" height="10"><line x1="0" y1="5" x2="22" y2="5" stroke="#7c3aed" strokeWidth="2.5" /></svg>
            <span>Envolvente (Sesgo)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="22" height="10"><line x1="0" y1="5" x2="22" y2="5" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" /></svg>
            <span>Campana Normal (Curtosis ref.)</span>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Configuración compartida de ejes para ambas vistas
// ─────────────────────────────────────────────────────────────────────────────
const EjesComunes = ({ yDomain }) => (
    <>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis
            dataKey="x"
            type="number"
            tick={{ fill: '#475569', fontSize: FS.xs, fontFamily: FONT }}
            label={{ value: 'Valor de x', position: 'insideBottom', offset: -12, fill: '#475569', fontSize: FS.sm, fontWeight: 600, fontFamily: FONT }}
        />
        <YAxis
            domain={yDomain || [0, 'auto']}
            tickFormatter={(v) => v.toFixed(2)}
            tick={{ fill: '#475569', fontSize: FS.xs, fontFamily: FONT }}
            label={{ value: 'P(X = x)', angle: -90, position: 'insideLeft', offset: -5, fill: '#475569', fontSize: FS.sm, fontWeight: 600, fontFamily: FONT }}
        />
    </>
);

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
export default function GraficaCentroDispersion({ datos, esperanza, varianza, desviacion, asimetria, curtosis }) {
    const [vistaActiva, setVistaActiva] = useState('dispersion');

    // Datos para Vista 2 calculados con useMemo (siempre, antes del early return)
    const datosVista2 = useMemo(() => {
        if (!datos || datos.length === 0 || !desviacion) return [];
        return mezclarDatosVista2(datos, esperanza, desviacion);
    }, [datos, esperanza, desviacion]);

    if (!datos || datos.length === 0 || esperanza === undefined || desviacion === undefined) return null;

    const TABS = [
        { id: 'dispersion', label: 'Masa y Dispersión' },
        { id: 'forma',      label: 'Forma y Sesgo'     },
    ];

    const margenGrafica    = { top: 20, right: 45, bottom: 28, left: 20 };
    const margenDispersion = { top: 36, right: 45, bottom: 28, left: 20 };

    // Dominio del eje Y para Vista A: máximo redondeado + 20% de margen visual
    const maxP = Math.max(...datos.map(d => d.p));
    const yMax = Math.ceil((maxP * 1.25) * 100) / 100;  // sube 25% y redondea a 2 decimales

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* ── Selector de Vista (Tabs) ── */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                <div style={{
                    display: 'inline-flex',
                    background: '#f1f5f9',
                    padding: '3px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    gap: '2px'
                }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setVistaActiva(tab.id)}
                            style={{
                                padding: '5px 16px',
                                borderRadius: '6px',
                                fontSize: FS.sm,
                                fontWeight: 600,
                                fontFamily: FONT,
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                background: vistaActiva === tab.id ? 'var(--primary-color, #3b82f6)' : 'transparent',
                                color:      vistaActiva === tab.id ? '#ffffff' : '#64748b',
                                boxShadow:  vistaActiva === tab.id ? '0 1px 4px rgba(59,130,246,0.3)' : 'none',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Leyenda de la vista activa ── */}
            <div style={{ marginBottom: '6px' }}>
                {vistaActiva === 'dispersion'
                    ? <LeyendaVista1 esperanza={esperanza} desviacion={desviacion} />
                    : <LeyendaVista2 />
                }
            </div>

            {/* ── Área de la gráfica ── */}
            <div style={{ flex: 1, minHeight: 0, width: '100%', overflow: 'hidden' }}>
                <ResponsiveContainer width="100%" height="100%">

                    {/* ════════════════════════════════════════════════════
                        VISTA 1: Masa y Dispersión (Momentos 1 y 2)
                    ════════════════════════════════════════════════════ */}
                    {vistaActiva === 'dispersion' ? (
                        <ComposedChart
                            data={datos}
                            margin={margenDispersion}
                        >
                            <EjesComunes yDomain={[0, yMax]} />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ fill: 'rgba(59,130,246,0.06)' }}
                            />

                            {/* Área sombreada: μ − σ  →  μ + σ (amarillo translúcido) */}
                            <ReferenceArea
                                x1={esperanza - desviacion}
                                x2={esperanza + desviacion}
                                fill="#fef08a"
                                fillOpacity={0.5}
                                stroke="none"
                            />

                            {/* Bastones tenues de masa de probabilidad (segundo plano) */}
                            <Bar
                                dataKey="p"
                                fill="#60a5fa"
                                fillOpacity={0.45}
                                stroke="#3b82f6"
                                strokeWidth={1}
                                barSize={20}
                                radius={[2, 2, 0, 0]}
                            />

                            {/* ── Media μ: línea continua roja, la más destacada ── */}
                            <ReferenceLine
                                x={esperanza}
                                stroke="#ef4444"
                                strokeWidth={3}
                            >
                                <Label
                                    value={`μ = ${esperanza.toFixed(3)}`}
                                    position="insideTopRight"
                                    fill="#dc2626"
                                    fontSize={10}
                                    fontFamily={FONT}
                                    fontWeight={700}
                                    offset={4}
                                />
                            </ReferenceLine>

                            {/* ── Límite inferior μ − σ (naranja) ── */}
                            <ReferenceLine
                                x={esperanza - desviacion}
                                stroke="#f97316"
                                strokeWidth={2}
                                strokeDasharray="4 3"
                            >
                                <Label
                                    value={`μ−σ = ${(esperanza - desviacion).toFixed(2)}`}
                                    position="insideTopLeft"
                                    fill="#c2410c"
                                    fontSize={9}
                                    fontFamily={FONT}
                                    fontWeight={700}
                                    offset={4}
                                />
                            </ReferenceLine>

                            {/* ── Límite superior μ + σ (verde azulado) ── */}
                            <ReferenceLine
                                x={esperanza + desviacion}
                                stroke="#14b8a6"
                                strokeWidth={2}
                                strokeDasharray="4 3"
                            >
                                <Label
                                    value={`μ+σ = ${(esperanza + desviacion).toFixed(2)}`}
                                    position="insideTopRight"
                                    fill="#0f766e"
                                    fontSize={9}
                                    fontFamily={FONT}
                                    fontWeight={700}
                                    offset={4}
                                />
                            </ReferenceLine>
                        </ComposedChart>

                    ) : (
                    /* ════════════════════════════════════════════════════
                        VISTA 2: Forma y Sesgo (Momentos 3 y 4)
                        - Barras P(X=x) en azul tenue (segundo plano)
                        - Línea morada monotone: envolvente de cimas (Sesgo)
                        - Línea punteada gris: campana Normal escalada (Curtosis ref.)
                    ════════════════════════════════════════════════════ */
                        <ComposedChart
                            data={datosVista2}
                            margin={margenGrafica}
                        >
                            <EjesComunes />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={false}
                            />

                            {/* Barras tenues (fondo) — masa de probabilidad */}
                            <Bar
                                dataKey="p"
                                fill="#bfdbfe"
                                stroke="#93c5fd"
                                strokeWidth={1}
                                barSize={42}
                                radius={[4, 4, 0, 0]}
                                opacity={0.55}
                            />

                            {/* Campana Normal de referencia (Curtosis) — línea punteada gris */}
                            <Line
                                dataKey="gauss"
                                type="monotone"
                                stroke="#94a3b8"
                                strokeWidth={2}
                                strokeDasharray="4 3"
                                dot={false}
                                activeDot={{ r: 4, fill: '#94a3b8', stroke: 'white', strokeWidth: 2 }}
                                connectNulls={true}
                                isAnimationActive={true}
                            />

                            {/* Línea de sesgo: envolvente que conecta las cimas de los bastones */}
                            <Line
                                dataKey="p"
                                type="monotone"
                                stroke="#7c3aed"
                                strokeWidth={2.5}
                                dot={{ r: 5, fill: '#7c3aed', stroke: 'white', strokeWidth: 2 }}
                                activeDot={{ r: 7, fill: '#6d28d9', stroke: 'white', strokeWidth: 2 }}
                                connectNulls={true}
                                isAnimationActive={true}
                            />
                        </ComposedChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
