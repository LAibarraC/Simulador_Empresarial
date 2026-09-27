import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import MarcoWidgetMAT251 from '../../ui/MarcoWidgetMAT251';

export default function GraficoEstimacionIntervalos({ resultados }) {
    if (!resultados || !resultados.simulaciones || resultados.simulaciones.length === 0) return null;

    const { simulaciones, parametroVerdadero, parametro, confianza } = resultados;

    // Solo dibujamos hasta 100 simulaciones para no sobrecargar el SVG visualmente
    const maxSimsToDraw = 100;
    const simsToDraw = simulaciones.slice(0, maxSimsToDraw);

    // Calcular los límites para el gráfico (min LI, max LS)
    const { minX, maxX } = useMemo(() => {
        let min = parametroVerdadero;
        let max = parametroVerdadero;

        for (const sim of simsToDraw) {
            const li = Number(sim.LI);
            const ls = Number(sim.LS);
            if (!isNaN(li) && li < min) min = li;
            if (!isNaN(ls) && ls > max) max = ls;
        }

        // Dar un pequeño margen (5%)
        const range = max - min || 1;
        return {
            minX: min - range * 0.05,
            maxX: max + range * 0.05
        };
    }, [simsToDraw, parametroVerdadero]);

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const getSymboloParam = () => {
        if (parametro === 'media') return '\\mu';
        if (parametro === 'proporcion') return 'p';
        if (parametro === 'varianza') return '\\sigma^2';
        return '';
    };

    // Parámetros de dibujo SVG
    const width = 800;
    const height = Math.max(400, simsToDraw.length * 4); // 4px por intervalo mínimo
    const paddingX = 40;
    const paddingY = 20; // Bottom padding
    const paddingTop = 35; // Top padding (espacio para que no choque con la primera línea)

    const scaleX = (val) => paddingX + ((val - minX) / (maxX - minX)) * (width - 2 * paddingX);
    const trueX = scaleX(parametroVerdadero);

    return (
        <div style={{ width: '100%', minWidth: '100%', height: '600px' }}>
            <MarcoWidgetMAT251
                titulo={`Simulación de Intervalos para la ${parametro.charAt(0).toUpperCase() + parametro.slice(1)}`}
                anchoCompleto={true} alto="100%"
            >
                <div style={{ width: '95%', height: '100%', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', marginBottom: '15px', color: 'var(--text-main, #1e293b)' }}>
                        <h5 style={{ margin: '0 0 5px 0', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            Nivel de confianza nominal: {confianza}%, {renderKatex("n")} = {resultados.n}, {renderKatex(`${getSymboloParam()} = ${parametroVerdadero.toFixed(3)}`)}
                        </h5>
                        <div style={{ fontSize: '0.75rem', marginBottom: '10px' }}>
                            Después de {resultados.resumen.total} simulaciones: {resultados.resumen.contienen} intervalos contienen, {resultados.resumen.noContienen} no
                        </div>

                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '20px',
                            background: 'var(--bg-input, #f1f5f9)',
                            padding: '5px 15px',
                            borderRadius: '4px',
                            fontSize: '0.75rem'
                        }}>
                            <span style={{ fontWeight: 'bold' }}>Cobertura:</span>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '2px' }}></div>
                                <span>{resultados.resumen.cobertura.toFixed(2)}% contienen</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px' }}></div>
                                <span>{(100 - resultados.resumen.cobertura).toFixed(2)}% no contienen</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ width: '100%', flex: 1, minHeight: 0, display: 'flex', justifyContent: 'center' }}>
                        <svg
                            viewBox={`0 0 ${width} ${height + 40}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                maxWidth: `${width}px`,
                                background: 'var(--bg-card, white)',
                                //border: '2px solid var(--border-color)', 
                                //borderRadius: '8px' 
                            }}
                        >

                            {/* Eje X y Línea del parámetro verdadero */}
                            <line
                                x1={trueX} y1={20}
                                x2={trueX} y2={height - paddingY + 10}
                                stroke="var(--text-main, #1e293b)"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                            />
                            <foreignObject x={trueX - 60} y={0} width="100" height="20">
                                <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'end', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)', paddingBottom: '2px' }}>
                                    {renderKatex(`${getSymboloParam()} = ${parametroVerdadero.toFixed(3)}`)}
                                </div>
                            </foreignObject>

                            {/* Dibujar cada intervalo como una línea horizontal */}
                            {simsToDraw.map((sim, index) => {
                                const y = paddingTop + (index / Math.max(1, simsToDraw.length - 1)) * (height - paddingTop - paddingY);
                                const x1 = scaleX(sim.LI);
                                const x2 = scaleX(sim.LS);
                                const color = sim.contiene ? '#10b981' : '#ef4444';

                                // Posición del punto central (estimación puntual)
                                const punctualVal = parametro === 'media' ? sim.x_bar : parametro === 'proporcion' ? sim.p_hat : sim.s2;
                                const xPuntual = scaleX(punctualVal);

                                return (
                                    <g key={index}>
                                        {/* Línea del intervalo */}
                                        <line
                                            x1={x1} y1={y}
                                            x2={x2} y2={y}
                                            stroke={color}
                                            strokeWidth="2"
                                            opacity="0.7"
                                        />
                                        {/* Marca de los límites (barritas verticales) */}
                                        <line x1={x1} y1={y - 3} x2={x1} y2={y + 3} stroke={color} strokeWidth="1" />
                                        <line x1={x2} y1={y - 3} x2={x2} y2={y + 3} stroke={color} strokeWidth="1" />
                                    </g>
                                );
                            })}

                            {/* Eje X (Línea Base y Ticks) */}
                            <line
                                x1={paddingX - 10} y1={height - paddingY + 10}
                                x2={width - paddingX + 10} y2={height - paddingY + 10}
                                stroke="var(--text-muted, #94a3b8)"
                                strokeWidth="1.5"
                            />

                            {/* Tick explícito para 0 en el eje X */}
                            {minX <= 0 && maxX >= 0 && (
                                <g key="tick-0">
                                    <line x1={scaleX(0)} y1={height - paddingY + 10} x2={scaleX(0)} y2={height - paddingY + 16} stroke="var(--text-muted, #94a3b8)" strokeWidth="1.5" />
                                    <text x={scaleX(0)} y={height - paddingY + 30} textAnchor="middle" fontSize="11" fontWeight="500" fill="var(--text-main, #475569)">
                                        0
                                    </text>
                                </g>
                            )}

                            {Array.from({ length: 7 }).map((_, i) => {
                                const tickVal = minX + (maxX - minX) * (i / 6);
                                
                                // Omitir el tick si está muy cerca de 0 para evitar superposición
                                if (minX <= 0 && maxX >= 0 && Math.abs(scaleX(tickVal) - scaleX(0)) < 25) {
                                    return null;
                                }

                                const tx = scaleX(tickVal);
                                return (
                                    <g key={`tick-${i}`}>
                                        <line x1={tx} y1={height - paddingY + 10} x2={tx} y2={height - paddingY + 16} stroke="var(--text-muted, #94a3b8)" strokeWidth="1.5" />
                                        <text x={tx} y={height - paddingY + 30} textAnchor="middle" fontSize="11" fontWeight="500" fill="var(--text-main, #475569)">
                                            {tickVal.toFixed(2)}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>
            </MarcoWidgetMAT251>
        </div>
    );
}
