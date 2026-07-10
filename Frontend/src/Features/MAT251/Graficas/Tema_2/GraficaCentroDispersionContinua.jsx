import React, { useState, useMemo } from 'react';
import {
    ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
    ReferenceLine, ReferenceArea, ResponsiveContainer, Tooltip
} from 'recharts';
import { compile } from 'mathjs';
import MarcoWidgetMAT251 from '../../ui/MarcoWidgetMAT251';
import { FONT, FS } from '../../Principal/Constantes';

// ─────────────────────────────────────────────────────────────────────────────
// Genera puntos de la curva de densidad f(x) en el rango [start, end]
// ─────────────────────────────────────────────────────────────────────────────
function generarCurvaDensidad(funcion, a, b, N = 200) {
    if (!funcion) return [];
    try {
        const expr = compile(funcion);
        const f = (x) => { try { return expr.evaluate({ x }); } catch { return 0; } };

        const margen = (b - a) * 0.15;
        const start  = Math.floor(a - Math.max(margen, 0.5));
        const end    = Math.ceil(b  + Math.max(margen, 0.5));
        const step   = (b - a) / N; // Step exacto para el intervalo [a, b]
        const puntos = [];

        // 1. Margen izquierdo (f(x) = 0)
        for (let x = start; x < a - step / 2; x += step) {
            puntos.push({ x: parseFloat(x.toFixed(4)), fx: 0 });
        }
        
        // Base en 'a' para caída vertical recta
        puntos.push({ x: parseFloat(a.toFixed(4)), fx: 0 });

        // 2. Curva principal entre 'a' y 'b'
        for (let i = 0; i <= N; i++) {
            const x = a + i * step;
            let fxVal = 0;
            try { fxVal = f(x); } catch (e) { fxVal = 0; }
            puntos.push({
                x: parseFloat(x.toFixed(4)),
                fx: parseFloat(fxVal.toFixed(6)) // Se permite negativo si la función bajara
            });
        }

        // Base en 'b' para caída vertical recta
        puntos.push({ x: parseFloat(b.toFixed(4)), fx: 0 });

        // 3. Margen derecho (f(x) = 0)
        const stepMargen = (end - b) / 20;
        for (let x = b + stepMargen; x <= end; x += stepMargen) {
            puntos.push({ x: parseFloat(x.toFixed(4)), fx: 0 });
        }
        
        return puntos;
    } catch {
        return [];
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Genera campana gaussiana escalada al pico de f(x) para Vista 2
// ─────────────────────────────────────────────────────────────────────────────
function generarCampanaGaussiana(mu, sigma, puntosDensidad) {
    if (!sigma || sigma <= 0 || !puntosDensidad || puntosDensidad.length === 0) return [];

    const maxFx     = Math.max(...puntosDensidad.map(d => d.fx));
    const gaussPico = 1 / (sigma * Math.sqrt(2 * Math.PI));
    const escala    = maxFx / gaussPico;

    return puntosDensidad.map(d => ({
        x:     d.x,
        fx:    d.fx,
        gauss: parseFloat(
            ((1 / (sigma * Math.sqrt(2 * Math.PI))) *
             Math.exp(-0.5 * Math.pow((d.x - mu) / sigma, 2)) * escala
            ).toFixed(6)
        ),
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Leyenda compacta Vista 1 (Masa y Dispersión)
// ─────────────────────────────────────────────────────────────────────────────
const LeyendaDispersion = ({ mu, sigma }) => (
    <div style={{ display: 'flex', gap: '14px', fontFamily: FONT, fontSize: FS.xs, color: '#475569', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="22" height="10"><line x1="0" y1="5" x2="22" y2="5" stroke="#ef4444" strokeWidth="3" /></svg>
            <span>μ = {mu?.toFixed(3)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="22" height="10"><line x1="0" y1="5" x2="22" y2="5" stroke="#f97316" strokeWidth="2" strokeDasharray="4 3" /></svg>
            <span style={{ color: '#c2410c' }}>μ−σ = {(mu - sigma)?.toFixed(3)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="22" height="10"><line x1="0" y1="5" x2="22" y2="5" stroke="#14b8a6" strokeWidth="2" strokeDasharray="4 3" /></svg>
            <span style={{ color: '#0f766e' }}>μ+σ = {(mu + sigma)?.toFixed(3)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: 22, height: 10, background: '#fef08a', border: '1px solid #facc15', borderRadius: 2 }} />
            <span>Área μ ± σ</span>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Leyenda compacta Vista 2 (Forma y Sesgo)
// ─────────────────────────────────────────────────────────────────────────────
const LeyendaForma = () => (
    <div style={{ display: 'flex', gap: '14px', fontFamily: FONT, fontSize: FS.xs, color: '#475569', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="22" height="10"><line x1="0" y1="5" x2="22" y2="5" stroke="var(--primary-color, #3b82f6)" strokeWidth="2.5" /></svg>
            <span>Densidad f(x)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <svg width="22" height="10"><line x1="0" y1="5" x2="22" y2="5" stroke="#7c3aed" strokeWidth="2" strokeDasharray="4 3" /></svg>
            <span>Campana Normal (ref.)</span>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Tooltip personalizado
// ─────────────────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const d = payload[0]?.payload;
    if (!d) return null;
    return (
        <div style={{ background: 'white', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: FONT, fontSize: FS.sm, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', minWidth: '140px' }}>
            <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '5px', marginBottom: '5px' }}>
                x = {typeof d.x === 'number' ? d.x.toFixed(3) : d.x}
            </p>
            {d.fx !== null && d.fx !== undefined && (
                <p style={{ margin: '3px 0', color: 'var(--primary-color, #3b82f6)', fontWeight: 600 }}>
                    f(x) = {d.fx.toFixed(4)}
                </p>
            )}
            {d.gauss !== null && d.gauss !== undefined && (
                <p style={{ margin: '3px 0', color: '#7c3aed' }}>
                    Normal = {d.gauss.toFixed(4)}
                </p>
            )}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────
export default function GraficaCentroDispersionContinua({ datos }) {
    const [vistaActiva, setVistaActiva] = useState('dispersion');

    const TABS = [
        { id: 'dispersion', label: 'Masa y Dispersión' },
        { id: 'forma',      label: 'Forma y Sesgo'     },
    ];

    const { esperanza: mu, desviacion: sigma, funcion, a, b } = datos || {};

    // Datos de densidad base
    const puntosDensidad = useMemo(() => {
        if (!funcion || a === undefined || b === undefined) return [];
        const aNum = parseFloat(a);
        const bNum = parseFloat(b);
        if (isNaN(aNum) || isNaN(bNum) || aNum === Infinity || bNum === Infinity) return [];
        return generarCurvaDensidad(funcion, aNum, bNum);
    }, [funcion, a, b]);

    // Datos con campana gaussiana superpuesta para Vista 2
    const puntosConCampana = useMemo(() => {
        if (!puntosDensidad.length || !mu || !sigma) return puntosDensidad;
        return generarCampanaGaussiana(mu, sigma, puntosDensidad);
    }, [puntosDensidad, mu, sigma]);

    // GUARDIÁN MATEMÁTICO: Evita crasheos de Recharts cuando la varianza resulta negativa
    // (Ej: área != 1 o funciones que no son densidad de probabilidad real)
    const safeRenderMoments = mu !== undefined && sigma !== undefined && !isNaN(sigma) && sigma > 0;

    // Cálculo dinámico del dominio X y ticks para asegurar que los momentos sean visibles
    const { startDomain, endDomain, ticks } = useMemo(() => {
        if (!puntosDensidad.length) return { startDomain: 'auto', endDomain: 'auto', ticks: [] };

        let viewMin = puntosDensidad[0].x;
        let viewMax = puntosDensidad[puntosDensidad.length - 1].x;
        
        // Si hay momentos válidos, expandir la cámara para mostrarlos
        if (safeRenderMoments) {
            viewMin = Math.min(viewMin, mu - sigma);
            viewMax = Math.max(viewMax, mu + sigma);
        }

        // Añadir padding (margen de respiración)
        const padding = Math.max((viewMax - viewMin) * 0.1, 0.5);
        const sDomain = parseFloat((viewMin - padding).toFixed(4));
        const eDomain = parseFloat((viewMax + padding).toFixed(4));

        const startTick = Math.floor(sDomain);
        const endTick = Math.ceil(eDomain);
        const t = [];
        for (let i = startTick; i <= endTick; i++) t.push(i);

        // Forzamos que el dominio visual sea ligeramente más amplio que los ticks extremos
        // Esto evita que Recharts considere que los números chocan con el borde y los empuje hacia abajo
        const finalStartDomain = startTick - 0.2;
        const finalEndDomain = endTick + 0.2;

        return { startDomain: finalStartDomain, endDomain: finalEndDomain, ticks: t };
    }, [puntosDensidad, mu, sigma, safeRenderMoments]);

    const maxFx = useMemo(() => {
        if (!puntosDensidad || puntosDensidad.length === 0) return 0;
        return Math.max(...puntosDensidad.map(d => d.fx));
    }, [puntosDensidad]);

    if (!datos || !puntosDensidad.length) return null;

    const margen = { top: 40, right: 45, bottom: 40, left: 30 };

    const dataActiva = vistaActiva === 'forma' ? puntosConCampana : puntosDensidad;

    return (
        <MarcoWidgetMAT251 titulo="Visualización de Centro y Dispersión" anchoCompleto={true} alto="450px">
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: FONT }}>

                {/* ── Tabs ── */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0', gap: '2px' }}>
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

                {/* ── Leyenda ── */}
                <div style={{ marginBottom: '8px' }}>
                    {vistaActiva === 'dispersion'
                        ? safeRenderMoments ? <LeyendaDispersion mu={mu} sigma={sigma} /> : <div style={{ textAlign: 'center', color: '#ef4444', fontSize: FS.xs, fontWeight: 600 }}>Cálculo de dispersión no válido para esta función.</div>
                        : <LeyendaForma />
                    }
                </div>

                {/* ── Gráfica ── */}
                <div style={{ flex: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={dataActiva} margin={margen}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <ReferenceLine y={0} stroke="#475569" strokeWidth={2} />

                            <XAxis
                                dataKey="x"
                                orientation={maxFx <= 0 ? 'top' : 'bottom'}
                                type="number"
                                domain={[startDomain, endDomain]}
                                ticks={ticks}
                                tickMargin={8}
                                minTickGap={20}
                                tickLine={{ stroke: '#475569', strokeWidth: 2 }}
                                axisLine={{ stroke: 'transparent' }}
                                tick={{ fill: '#475569', fontSize: FS.xs, fontFamily: FONT }}
                                label={{ value: 'Valor de x', position: 'insideBottom', offset: -20, fill: '#475569', fontSize: FS.sm, fontWeight: 600, fontFamily: FONT }}
                            />
                            <YAxis
                                tickFormatter={(v) => v.toFixed(2)}
                                tick={{ fill: '#475569', fontSize: FS.xs, fontFamily: FONT }}
                                label={{ value: 'f(x)', angle: -90, position: 'insideLeft', offset: -5, fill: '#475569', fontSize: FS.sm, fontWeight: 600, fontFamily: FONT }}
                            />

                            <Tooltip content={<CustomTooltip />} />

                            {/* Vista 1: Franja de dispersión (Solo si es matemáticamente seguro) */}
                            {(vistaActiva === 'dispersion' && safeRenderMoments) && (
                                <ReferenceArea
                                    x1={parseFloat((mu - sigma).toFixed(4))}
                                    x2={parseFloat((mu + sigma).toFixed(4))}
                                    fill="#fef08a"
                                    fillOpacity={0.5}
                                />
                            )}

                            {/* Curva de densidad f(x) (Siempre se renderiza) */}
                            <Area
                                type="linear"
                                dataKey="fx"
                                stroke="var(--primary-color, #3b82f6)"
                                fill="var(--primary-color, #3b82f6)"
                                fillOpacity={0.25}
                                strokeWidth={2}
                                dot={false}
                                activeDot={false}
                                baseValue={0}
                                isAnimationActive={true}
                            />

                            {/* Vista 2: Campana gaussiana superpuesta */}
                            {vistaActiva === 'forma' && (
                                <Line
                                    type="monotone"
                                    dataKey="gauss"
                                    stroke="#7c3aed"
                                    strokeWidth={2}
                                    strokeDasharray="5 4"
                                    dot={false}
                                    activeDot={false}
                                    isAnimationActive={false}
                                />
                            )}

                            {/* Vista 1: Líneas de momentos (Solo si es matemáticamente seguro) */}
                            {(vistaActiva === 'dispersion' && safeRenderMoments) && (
                                <>
                                    {/* Límite Inferior (El texto fluye hacia la IZQUIERDA de la línea) */}
                                    <ReferenceLine
                                        x={parseFloat((mu - sigma).toFixed(4))}
                                        stroke="#f97316"
                                        strokeDasharray="4 3"
                                        strokeWidth={2}
                                        label={{ position: 'top', value: `μ-σ = ${(mu - sigma).toFixed(2)}`, fill: '#c2410c', fontSize: 10, fontWeight: 700, dy: 0, dx: -30 }}
                                    />
                                    {/* Centro (Media) (Colocada justo arriba) */}
                                    <ReferenceLine
                                        x={parseFloat(mu.toFixed(4))}
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        label={{ position: 'top', value: `μ = ${mu.toFixed(2)}`, fill: '#ef4444', fontSize: 12, fontWeight: 600, dy: -5, dx: 0 }}
                                    />
                                    {/* Límite Superior (El texto fluye hacia la DERECHA de la línea) */}
                                    <ReferenceLine
                                        x={parseFloat((mu + sigma).toFixed(4))}
                                        stroke="#14b8a6"
                                        strokeDasharray="4 3"
                                        strokeWidth={2}
                                        label={{ position: 'top', value: `μ+σ = ${(mu + sigma).toFixed(2)}`, fill: '#0f766e', fontSize: 10, fontWeight: 700, dy: 0, dx: 30 }}
                                    />
                                </>
                            )}
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* ── Pie de página ── */}
                <div style={{ marginTop: '8px', textAlign: 'center', fontSize: FS.xs, color: '#64748b' }}>
                    {vistaActiva === 'dispersion'
                        ? <>La franja amarilla muestra la dispersión típica <strong>μ ± σ</strong> = [{(mu - sigma).toFixed(2)}, {(mu + sigma).toFixed(2)}]. La línea roja marca la Esperanza <strong>μ = {mu.toFixed(3)}</strong>.</>
                        : <>La línea morada (punteada) es la campana normal con <strong>μ = {mu.toFixed(3)}</strong> y <strong>σ = {sigma.toFixed(3)}</strong>. Úsala para comparar la forma de tu distribución.</>
                    }
                </div>
            </div>
        </MarcoWidgetMAT251>
    );
}
