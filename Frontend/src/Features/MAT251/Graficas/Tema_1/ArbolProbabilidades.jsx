import React, { useMemo } from 'react';
import { FONT } from '../../Principal/Constantes';
import MarcoWidgetMAT251 from '../../ui/MarcoWidgetMAT251';

function ContenidoArbolManual({ resultado, svgWidth, svgHeight, isMaximized }) {
    const eventos = resultado.events || [];
    const rootX = 90;
    const rootY = 72;
    const anchoCaja = 120;
    const colorActivo = '#10b981';
    const colorInactivo = '#94a3b8';
    const probabilidadTotal = eventos.reduce((producto, evento) => producto * (Number(evento.prob) || 0), 1);
    const centroEvento = indice => 320 + indice * 220;
    const recortar = nombre => String(nombre || '').length > 15 ? `${String(nombre).slice(0, 12)}...` : String(nombre || '');

    return (
        <div
            className="arbol-scroll-wrapper thin-scrollbar"
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0',
                overflow: 'hidden',
                boxSizing: 'border-box'
            }}
        >
            <style>{`
                @media (max-width: 768px) {
                    .arbol-scroll-wrapper {
                        overflow-x: auto !important;
                        overflow-y: hidden !important;
                        -webkit-overflow-scrolling: touch !important;
                        display: flex !important;
                        justify-content: flex-start !important;
                        align-items: center !important;
                        width: 100% !important;
                        height: 100% !important;
                        padding: 0 15px !important;
                        box-sizing: border-box !important;
                    }
                    .arbol-scroll-svg {
                        display: block !important;
                        height: 100% !important;
                        max-height: 100% !important;
                        width: auto !important;
                        aspect-ratio: ${svgWidth} / ${svgHeight} !important;
                        flex-shrink: 0 !important;
                        margin: auto 0 !important;
                    }
                }
            `}</style>
            <svg
                className="arbol-scroll-svg"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: isMaximized ? '1200px' : `${svgWidth}px`,
                    maxHeight: isMaximized ? '85vh' : `${svgHeight}px`,
                    margin: 'auto',
                    fontFamily: FONT,
                    display: 'block'
                }}
            >
                <defs>
                    <marker id="arrow-active-manual" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill={colorActivo} />
                    </marker>
                    <marker id="arrow-inactive-manual" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill={colorInactivo} />
                    </marker>
                </defs>

                <rect x={rootX - 40} y={rootY - 25} width="80" height="50" rx="8" fill="var(--bg-input, #f8fafc)" stroke={colorInactivo} strokeWidth="2" />
                <text x={rootX} y={rootY - 5} textAnchor="middle" fontSize="13" fill="var(--text-main, #334155)" fontWeight="bold">Total</text>
                <text x={rootX} y={rootY + 12} textAnchor="middle" fontSize="14" fill="var(--text-main, #0f172a)" fontWeight="bold">N = 100%</text>

                {eventos.map((evento, indice) => {
                    const probabilidad = Math.min(1, Math.max(0, Number(evento.prob) || 0));
                    const complementaria = 1 - probabilidad;
                    const xCentro = centroEvento(indice);
                    const xInicio = indice === 0 ? rootX + 40 : centroEvento(indice - 1) + anchoCaja / 2;
                    const yComplementaria = rootY + 80 + indice * 58;
                    const xMedio = (xInicio + xCentro - anchoCaja / 2) / 2;
                    const yMedioComplementaria = (rootY + yComplementaria) / 2;
                    const nombre = String(evento.name || String.fromCharCode(65 + indice));

                    return (
                        <g key={`evento-manual-${indice}`}>
                            <line
                                x1={xInicio} y1={rootY}
                                x2={xCentro - anchoCaja / 2 - 7} y2={rootY}
                                stroke={colorActivo} strokeWidth="3"
                                markerEnd="url(#arrow-active-manual)"
                                strokeLinecap="round"
                            />
                            <rect x={xMedio - 34} y={rootY - 31} width="68" height="19" rx="5" fill="var(--bg-card, #ffffff)" />
                            <text x={xMedio} y={rootY - 17} textAnchor="middle" fontSize="11" fill={colorActivo} fontWeight="bold">
                                P={probabilidad.toFixed(4)}
                            </text>

                            <rect
                                x={xCentro - anchoCaja / 2} y={rootY - 25} width={anchoCaja} height="50" rx="6"
                                fill="var(--bg-input, rgba(16, 185, 129, 0.1))"
                                stroke={colorActivo} strokeWidth="2"
                            />
                            <text x={xCentro} y={rootY - 5} textAnchor="middle" fontSize="12" fill="var(--text-main, #064e3b)" fontWeight="bold">
                                {recortar(nombre)}
                            </text>
                            <text x={xCentro} y={rootY + 13} textAnchor="middle" fontSize="12" fill={colorActivo} fontWeight="bold">
                                P = {probabilidad.toFixed(4)}
                            </text>

                            <line
                                x1={xInicio} y1={rootY}
                                x2={xCentro - anchoCaja / 2 - 7} y2={yComplementaria}
                                stroke={colorInactivo} strokeWidth="1.5"
                                markerEnd="url(#arrow-inactive-manual)"
                                strokeLinecap="round"
                            />
                            <rect x={xMedio - 38} y={yMedioComplementaria - 23} width="76" height="19" rx="5" fill="var(--bg-card, #ffffff)" />
                            <text x={xMedio} y={yMedioComplementaria - 9} textAnchor="middle" fontSize="11" fill={colorInactivo} fontWeight="bold">
                                P={complementaria.toFixed(4)}
                            </text>

                            <rect
                                x={xCentro - anchoCaja / 2} y={yComplementaria - 25} width={anchoCaja} height="50" rx="6"
                                fill="var(--bg-input, #ffffff)"
                                stroke={colorInactivo} strokeWidth="1"
                            />
                            <text x={xCentro} y={yComplementaria - 5} textAnchor="middle" fontSize="12" fill="var(--text-main, #475569)">
                                {recortar(`No ${nombre}`)}
                            </text>
                            <text x={xCentro} y={yComplementaria + 13} textAnchor="middle" fontSize="12" fill="var(--text-muted, #64748b)" fontWeight="bold">
                                P = {complementaria.toFixed(4)}
                            </text>

                            {indice === eventos.length - 1 && (
                                <text x={xCentro + anchoCaja / 2 + 10} y={rootY + 5} textAnchor="start" fontSize="12" fill={colorActivo} fontWeight="bold">
                                    ← RUTA SELECCIONADA ({probabilidadTotal.toFixed(4)})
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

function ContenidoArbolMatriz({ dataArbol, svgWidth, svgHeight, resultado, isMaximized }) {
    const { N, ramasA } = dataArbol;

    const rootX = 90;
    const rootY = svgHeight / 2;
    const l1X = 320;
    const l2X = 570;

    const activeColor = "#10b981";
    const activeStroke = 3;
    const inactiveColor = "#94a3b8";
    const inactiveStroke = 1.5;

    return (
        <div
            className="arbol-scroll-wrapper thin-scrollbar"
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0',
                overflow: 'hidden',
                boxSizing: 'border-box'
            }}
        >
            <style>{`
                @media (max-width: 768px) {
                    .arbol-scroll-wrapper {
                        overflow-x: auto !important;
                        overflow-y: hidden !important;
                        -webkit-overflow-scrolling: touch !important;
                        display: flex !important;
                        justify-content: flex-start !important;
                        align-items: center !important;
                        width: 100% !important;
                        height: 100% !important;
                        padding: 0 15px !important;
                        box-sizing: border-box !important;
                    }
                    .arbol-scroll-svg {
                        display: block !important;
                        height: 100% !important;
                        max-height: 100% !important;
                        width: auto !important;
                        aspect-ratio: ${svgWidth} / ${svgHeight} !important;
                        flex-shrink: 0 !important;
                        margin: auto 0 !important;
                    }
                }
            `}</style>
            <svg
                className="arbol-scroll-svg"
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: isMaximized ? '1200px' : `${svgWidth}px`,
                    maxHeight: isMaximized ? '85vh' : `${svgHeight}px`,
                    margin: 'auto',
                    fontFamily: FONT,
                    display: 'block'
                }}
            >
                <defs>
                    <marker id="arrow-active-m" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill={activeColor} />
                    </marker>
                    <marker id="arrow-inactive-m" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L9,3 z" fill={inactiveColor} />
                    </marker>
                </defs>

                {/* Raíz Total */}
                <rect x={rootX - 40} y={rootY - 25} width="80" height="50" rx="8" fill="var(--bg-input, #f8fafc)" stroke={inactiveColor} strokeWidth="2" />
                <text x={rootX} y={rootY - 5} textAnchor="middle" fontSize="13" fill="var(--text-main, #334155)" fontWeight="bold">Total</text>
                <text x={rootX} y={rootY + 12} textAnchor="middle" fontSize="14" fill="var(--text-main, #0f172a)" fontWeight="bold">N={N}</text>

                {ramasA.map((rama, i) => {
                    const colorL1 = rama.esActiva ? activeColor : inactiveColor;
                    const strokeL1 = rama.esActiva ? activeStroke : inactiveStroke;
                    const markerL1 = rama.esActiva ? "url(#arrow-active-m)" : "url(#arrow-inactive-m)";

                    return (
                        <g key={`l1-${i}`}>
                            <line 
                                x1={rootX + 40} y1={rootY} 
                                x2={l1X - 65} y2={rama.y} 
                                stroke={colorL1} strokeWidth={strokeL1} 
                                markerEnd={markerL1} 
                                strokeLinecap="round"
                            />
                            <rect x={(rootX + 40 + l1X - 65)/2 - 30} y={(rootY + rama.y)/2 - 12} width="60" height="20" fill="var(--bg-card, white)" rx="4" opacity="0.95" />
                            <text x={(rootX + 40 + l1X - 65)/2} y={(rootY + rama.y)/2 + 2} textAnchor="middle" fontSize="11" fill={colorL1} fontWeight="bold">
                                {rama.count === '-' ? `P=${rama.pA.toFixed(4)}` : `${rama.count}/${N}`}
                            </text>

                            <rect 
                                x={l1X - 60} y={rama.y - 25} width="120" height="50" rx="6" 
                                fill={rama.esActiva ? "var(--bg-input, rgba(16, 185, 129, 0.05))" : "var(--bg-input, #fff)"} 
                                stroke={colorL1} strokeWidth={rama.esActiva ? 2 : 1} 
                            />
                            <text x={l1X} y={rama.y - 5} textAnchor="middle" fontSize="12" fill={rama.esActiva ? "var(--text-main, #064e3b)" : "var(--text-main, #475569)"} fontWeight={rama.esActiva ? "bold" : "normal"}>
                                {rama.valor.length > 15 ? rama.valor.substring(0, 15) + '...' : rama.valor}
                            </text>
                            <text x={l1X} y={rama.y + 12} textAnchor="middle" fontSize="12" fill={rama.esActiva ? activeColor : "var(--text-muted, #64748b)"} fontWeight="bold">
                                {rama.count === '-' ? `P=${rama.pA.toFixed(4)}` : `n=${rama.count}`}
                            </text>

                            {rama.hijos.map((hijo, j) => {
                                const colorL2 = hijo.esActiva ? activeColor : inactiveColor;
                                const strokeL2 = hijo.esActiva ? activeStroke : inactiveStroke;
                                const markerL2 = hijo.esActiva ? "url(#arrow-active-m)" : "url(#arrow-inactive-m)";

                                return (
                                    <g key={`l2-${i}-${j}`}>
                                        <line 
                                            x1={l1X + 60} y1={rama.y} 
                                            x2={l2X - 65} y2={hijo.y} 
                                            stroke={colorL2} strokeWidth={strokeL2} 
                                            markerEnd={markerL2} 
                                            strokeLinecap="round"
                                        />
                                        <rect x={(l1X + 60 + l2X - 65)/2 - 30} y={(rama.y + hijo.y)/2 - 12} width="60" height="20" fill="var(--bg-card, white)" rx="4" opacity="0.95" />
                                        <text x={(l1X + 60 + l2X - 65)/2} y={(rama.y + hijo.y)/2 + 2} textAnchor="middle" fontSize="11" fill={colorL2} fontWeight="bold">
                                            {hijo.count === '-' ? `P=${hijo.pB.toFixed(4)}` : `${hijo.count}/${hijo.total}`}
                                        </text>

                                        <rect 
                                            x={l2X - 60} y={hijo.y - 25} width="120" height="50" rx="6" 
                                            fill={hijo.esActiva ? "var(--bg-input, rgba(16, 185, 129, 0.1))" : "var(--bg-input, #fff)"} 
                                            stroke={colorL2} strokeWidth={hijo.esActiva ? 2 : 1} 
                                        />
                                        <text x={l2X} y={hijo.y - 5} textAnchor="middle" fontSize="12" fill={hijo.esActiva ? "var(--text-main, #064e3b)" : "var(--text-main, #475569)"} fontWeight={hijo.esActiva ? "bold" : "normal"}>
                                            {hijo.valor.length > 15 ? hijo.valor.substring(0, 15) + '...' : hijo.valor}
                                        </text>
                                        <text x={l2X} y={hijo.y + 12} textAnchor="middle" fontSize="12" fill={hijo.esActiva ? activeColor : "var(--text-muted, #64748b)"} fontWeight="bold">
                                            P = {(hijo.pB).toFixed(4)}
                                        </text>

                                        {hijo.esActiva && (
                                            <text x={l2X + 68} y={hijo.y + 4} textAnchor="start" fontSize="13" fill={activeColor} fontWeight="bold">
                                                ← RUTA SELECCIONADA
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

export default function ArbolProbabilidades({ resultado, filas, varSeleccionada, colA, colB, modReemplazo, inputMode = 'matriz' }) {
    if (!resultado) return null;

    if (resultado.isManualDinamic) {
        const events = resultado.events || [];
        const N = events.length;
        const svgHeight = Math.max(230, 207 + Math.max(0, N - 1) * 58);
        const svgWidth = Math.max(820, 220 * N + 420);
        const altoWidget = Math.max(380, svgHeight + 85);

        return (
            <MarcoWidgetMAT251 id="w-flow-tree" titulo="Árbol de Probabilidades Sucesivas" anchoCompleto={true} alto={`${altoWidget}px`}>
                <ContenidoArbolManual
                    resultado={resultado}
                    svgWidth={svgWidth}
                    svgHeight={svgHeight}
                />
            </MarcoWidgetMAT251>
        );
    }

    const dataArbol = (() => {
        if (!filas || !varSeleccionada || !colA || !colB) return null;

        const idxA = varSeleccionada.nombresColumnas.indexOf(colA);
        const idxB = varSeleccionada.nombresColumnas.indexOf(colB);
        if (idxA === -1 || idxB === -1) return null;

        const datosParseados = filas.map(f => {
            const p = f.valor.split(' | ').map(v => v.trim());
            return { valA: p[idxA], valB: p[idxB] };
        }).filter(d => d.valA !== undefined && d.valB !== undefined && d.valA !== '' && d.valB !== '');

        const N = datosParseados.length;
        if (N === 0) return null;

        const conteoA = {};
        const conteoB_inicial = {};
        datosParseados.forEach(d => {
            conteoA[d.valA] = (conteoA[d.valA] || 0) + 1;
            conteoB_inicial[d.valB] = (conteoB_inicial[d.valB] || 0) + 1;
        });

        const ramasA = Object.keys(conteoA).sort().map(valA => {
            const countA = conteoA[valA];
            const pA = countA / N;

            let totalB = N;
            if (modReemplazo === 'sin_reemplazo') totalB = N - 1;

            const hijosB = Object.keys(conteoB_inicial).sort().map(valB => {
                let countB = conteoB_inicial[valB];
                
                if (modReemplazo === 'sin_reemplazo') {
                    const nA_and_B = datosParseados.filter(d => d.valA === valA && d.valB === valB).length;
                    const reduccion = countA > 0 ? (nA_and_B / countA) : 0;
                    countB = Math.max(0, countB - reduccion);
                }

                const pB = totalB > 0 ? countB / totalB : 0;
                const pJoint = pA * pB;
                
                return {
                    valor: valB,
                    count: countB,
                    total: totalB,
                    pB,
                    pJoint,
                    esActiva: valA === resultado.nameA && valB === resultado.nameB
                };
            });

            return {
                valor: valA,
                count: countA,
                pA,
                hijos: hijosB,
                esActiva: valA === resultado.nameA
            };
        });

        return { N, ramasA };
    })();

    if (!dataArbol) return null;

    const { ramasA } = dataArbol;
    const numHojas = ramasA.reduce((sum, rama) => sum + rama.hijos.length, 0);
    
    const ROW_HEIGHT = 68;
    const topMargin = 45;
    const svgHeight = topMargin + Math.max(0, numHojas - 1) * ROW_HEIGHT + topMargin;
    const svgWidth = 850;

    let currentY = topMargin;
    ramasA.forEach(ramaA => {
        const hYStart = currentY;
        ramaA.hijos.forEach(hijoB => {
            hijoB.y = currentY;
            currentY += ROW_HEIGHT;
        });
        const hYEnd = currentY - ROW_HEIGHT;
        ramaA.y = (hYStart + hYEnd) / 2;
    });

    const altoWidget = Math.max(380, svgHeight + 85);

    return (
        <MarcoWidgetMAT251 id="w-flow-tree" titulo="Árbol de Probabilidades Sucesivas" anchoCompleto={true} alto={`${altoWidget}px`}>
            <ContenidoArbolMatriz
                dataArbol={dataArbol}
                svgWidth={svgWidth}
                svgHeight={svgHeight}
                resultado={resultado}
            />
        </MarcoWidgetMAT251>
    );
}
