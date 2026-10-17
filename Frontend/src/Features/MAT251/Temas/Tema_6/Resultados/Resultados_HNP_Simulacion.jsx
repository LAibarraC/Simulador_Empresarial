import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FONT, RADIUS, FS } from '../../../Principal/Constantes';
import Grafico_HNP_SimulacionChi from '../../../Graficas/Tema_6/Grafico_HNP_SimulacionChi';
import Grafico_HNP_SimulacionSignos from '../../../Graficas/Tema_6/Grafico_HNP_SimulacionSignos';
import Grafico_HNP_SimulacionRachas from '../../../Graficas/Tema_6/Grafico_HNP_SimulacionRachas';
import Grafico_HNP_SimulacionRachasZ from '../../../Graficas/Tema_6/Grafico_HNP_SimulacionRachasZ';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { jStat } from 'jstat';

export default function Resultados_HNP_Simulacion({ resultados }) {
    const [pagina, setPagina] = useState(1);
    
    // --- ANIMATION STATE ---
    const [iteracionActual, setIteracionActual] = useState(0);
    const iteracionRef = useRef(0);
    const [simulacionEnCurso, setSimulacionEnCurso] = useState(false);
    const [simulacionPausada, setSimulacionPausada] = useState(false);
    const [velocidadSimulacion, setVelocidadSimulacion] = useState('1x');

    const simRef = useRef(null);
    const isPausadoRef = useRef(false);
    const velocidadRef = useRef('1x');

    // Reset animation when new results arrive
    useEffect(() => {
        if (resultados && resultados.historial) {
            setIteracionActual(0);
            iteracionRef.current = 0;
            setSimulacionEnCurso(true);
            setSimulacionPausada(false);
            isPausadoRef.current = false;
        }
    }, [resultados]);

    useEffect(() => {
        isPausadoRef.current = simulacionPausada;
    }, [simulacionPausada]);

    useEffect(() => {
        velocidadRef.current = velocidadSimulacion;
    }, [velocidadSimulacion]);

    // Animation Loop
    useEffect(() => {
        if (!simulacionEnCurso || !resultados || !resultados.historial) return;

        const loop = () => {
            if (isPausadoRef.current) {
                simRef.current = setTimeout(loop, 100);
                return;
            }

            const N = resultados.historial.length;
            let step = 1;
            let delay = 1000;
            
            if (velocidadRef.current === '1x') { delay = 1000; }
            else if (velocidadRef.current === '2x') { delay = 500; }
            else if (velocidadRef.current === '4x') { delay = 250; }
            else if (velocidadRef.current === 'MAX') {
                delay = 16;
                step = Math.max(1, Math.floor(N / 50));
            }
            
            iteracionRef.current += step;
            
            if (iteracionRef.current >= N) {
                iteracionRef.current = N;
                setIteracionActual(N);
                setSimulacionEnCurso(false);
                return;
            }

            setIteracionActual(iteracionRef.current);
            simRef.current = setTimeout(loop, delay);
        };

        simRef.current = setTimeout(loop, velocidadRef.current === 'MAX' ? 16 : 1000);

        return () => clearTimeout(simRef.current);
    }, [simulacionEnCurso, resultados]);

    if (!resultados || !resultados.historial) return null;

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    // Live Data Slicing
    const historialVivo = resultados.historial.slice(0, iteracionActual);
    const rechazosActuales = historialVivo.filter(sim => sim.decision === 'Rechazar H₀').length;
    const noRechazosActuales = iteracionActual - rechazosActuales;
    const porcentajeRechazosActual = iteracionActual > 0 ? (rechazosActuales / iteracionActual) * 100 : 0;
    const porcentajeNoRechazosActual = iteracionActual > 0 ? (noRechazosActuales / iteracionActual) * 100 : 0;

    const liveResultados = {
        ...resultados,
        historial: historialVivo,
        total: iteracionActual,
        rechazos: rechazosActuales,
        noRechazos: noRechazosActuales,
        pRechazo: porcentajeRechazosActual,
        pNoRechazo: porcentajeNoRechazosActual
    };

    // Table pagination
    const filasPorPagina = 20;
    const totalPaginas = Math.ceil(historialVivo.length / filasPorPagina);
    const datosPagina = historialVivo.slice((pagina - 1) * filasPorPagina, pagina * filasPorPagina);
    
    const datosTabla = [...datosPagina];
    if (resultados.historial.length > filasPorPagina) {
        while (datosTabla.length > 0 && datosTabla.length < filasPorPagina) {
            datosTabla.push({ isVacia: true, iteracion: `empty-${datosTabla.length}` });
        }
        if (datosTabla.length === 0) {
            for (let i = 0; i < filasPorPagina; i++) {
                datosTabla.push({ isVacia: true, iteracion: `empty-${i}` });
            }
        }
    }

    const tableHeaderStyle = { padding: '10px', background: 'var(--bg-input, #f1f5f9)', color: 'var(--text-pure)', fontWeight: 'bold', textAlign: 'center', borderBottom: '2px solid var(--border-color)', fontSize: '0.8rem', whiteSpace: 'nowrap' };
    const tableCellStyle = { padding: '4px 10px', borderBottom: '1px solid var(--border-light, #f1f5f9)', color: 'var(--text-pure)', textAlign: 'center', fontSize:'0.8rem', whiteSpace: 'nowrap' };

    const tieneMuestras = datosTabla.some(sim => sim.observadas || sim.matrizNum);
    const numCols = useMemo(() => {
        if (!tieneMuestras) return 0;
        const validSim = datosTabla.find(sim => sim.observadas || sim.matrizNum);
        if (validSim?.observadas) return validSim.observadas.length;
        if (validSim?.matrizNum) return validSim.matrizNum.flat().length;
        return 0;
    }, [datosTabla, tieneMuestras]);

    const sampleCols = useMemo(() => {
        if (numCols === 0) return [];
        return Array.from({ length: numCols }, (_, i) => i + 1);
    }, [numCols]);

    const renderSampleValue = (sim, colIdx) => {
        if (!sim) return '-';
        
        let arr = [];
        if (sim.observadas) arr = sim.observadas;
        else if (sim.matrizNum) arr = sim.matrizNum.flat();
        
        const val = arr[colIdx - 1]; // colIdx is 1-based
        if (val === undefined) return '-';
        return val;
    };


    let isRejectionImpossible = false;
    if (resultados?.tipo === 'signos') {
        const n = resultados.n;
        const alpha = resultados.alpha || 0.05;
        let pExtremo = jStat.binomial.cdf(0, n, 0.5);
        if (resultados.tipoPrueba === 'bilateral') {
            pExtremo = Math.min(1, 2 * pExtremo);
        }
        if (pExtremo > alpha) {
            isRejectionImpossible = true;
        }
    }

    return (
        <div style={{ fontFamily: FONT, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* ENCABEZADO Y CONTROLES DE ANIMACIÓN */}
            <div style={{width: '100%', marginTop: '0px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: 'var(--text-pure)'}}>Resultados:</h4>
                    <div style={{ padding: '2px 10px', background: 'var(--bg-input)', borderRadius: '5px', fontSize: '0.7rem', color: 'var(--text-pure)', fontWeight: 'bold' }}>
                        {resultados.tipo === 'chi_cuadrada' && resultados.subtipo === 'bondad' && 'Chi-cuadrada - Bondad de Ajuste'}
                        {resultados.tipo === 'chi_cuadrada' && resultados.subtipo === 'independencia' && 'Chi-cuadrada - Independencia'}
                        {resultados.tipo === 'signos' && 'Prueba de Signos'}
                        {resultados.tipo === 'rachas' && 'Prueba de Rachas'}
                    </div>
                </div>
                
                {/* CONTROLES DE SIMULACIÓN */}
                <div style={{ marginTop: '0px', marginBottom: '0px', padding: '5px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', background: 'var(--primary-color)', width: `${(iteracionActual / resultados.historial.length) * 100}%`, transition: 'width 0.1s linear' }} />
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: FS?.sm || '0.875rem', fontWeight: 700, color: 'var(--text-muted)' }}>Simulación: {iteracionActual} / {resultados.historial.length}</span>
                        
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'nowrap', justifyContent: 'center' }}>
                            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', padding: '3px', borderRadius: '5px', border: '1px solid var(--border-color)' }}>
                                {['1x', '2x', '4x', 'MAX'].map(vel => (
                                    <button
                                        key={vel}
                                        type="button"
                                        onClick={() => setVelocidadSimulacion(vel)}
                                        style={{
                                            background: velocidadSimulacion === vel ? 'var(--primary-color)' : 'transparent',
                                            color: velocidadSimulacion === vel ? '#fff' : 'var(--text-muted)',
                                            border: 'none', borderRadius: '5px', padding: '1px 5px', cursor: 'pointer', fontSize: '0.65rem',
                                            fontWeight: 800, transition: 'all 0.2s', boxShadow: velocidadSimulacion === vel ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                        }}
                                    >
                                        {vel}
                                    </button>
                                ))}
                            </div>

                            {simulacionEnCurso && (
                                <button
                                    type="button"
                                    onClick={() => setSimulacionPausada(!simulacionPausada)}
                                    style={{
                                        background: simulacionPausada ? '#10b981' : '#f59e0b',
                                        color: '#fff', border: 'none', borderRadius: '5px',
                                        padding: '3px 5px', cursor: 'pointer', fontSize: '0.65rem',
                                        fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px',
                                        transition: 'background 0.2s', minWidth: '105px', justifyContent: 'center', whiteSpace: 'nowrap'
                                    }}
                                >
                                    {simulacionPausada ? (
                                        <>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                            </svg>
                                            CONTINUAR
                                        </>
                                    ) : (
                                        <>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="6" y="4" width="4" height="16"></rect>
                                                <rect x="14" y="4" width="4" height="16"></rect>
                                            </svg>
                                            PAUSAR
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* WIDGET ADVERTENCIA DE RECHAZO IMPOSIBLE */}
            {isRejectionImpossible && (
                <div style={{ marginBottom: '0px', padding: '10px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: RADIUS, display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                    <div style={{ color: '#d97706', marginTop: '8px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                            <line x1="12" y1="9" x2="12" y2="13"></line>
                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                    </div>
                    <div>
                        <div style={{ color: '#b45309', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0px' }}>
                            Aviso: Rechazo Matemáticamente Imposible
                        </div>
                        <div style={{ color: '#92400e', fontSize: '0.8rem', lineHeight: '1.4' }}>
                            Debido al tamaño de muestra ({renderKatex('n = ' + resultados.n)}) y el nivel de significancia ({renderKatex('\\alpha = ' + (resultados.alpha || 0.05))}), es matemáticamente imposible rechazar {renderKatex('H_0')}. No existen valores críticos ni zonas de rechazo.
                        </div>
                    </div>
                </div>
            )}

            {/* TABLERO DE RESUMEN ANIMADO */}
            <div style={{ marginBottom: '10px', border: '1px solid var(--text-pure)', borderRadius: '4px', fontFamily: FONT, fontSize: '0.8rem', color: 'var(--text-pure)', overflowX: 'auto', background: 'var(--bg-card)' }}>
                <style>{`
                    .minitab-table-sim { width: 100%; text-align: center; border-collapse: collapse; table-layout: auto; }
                    .minitab-table-sim th, .minitab-table-sim td { padding: 8px 4px; border: 1px solid var(--text-pure); word-wrap: break-word; hyphens: auto; }
                    .minitab-table-sim th:first-child, .minitab-table-sim td:first-child { border-left: none; }
                    .minitab-table-sim th:last-child, .minitab-table-sim td:last-child { border-right: none; }
                    .minitab-table-sim tr:first-child th { border-top: none; }
                    .minitab-table-sim tr:last-child td { border-bottom: none; }
                    @media (max-width: 650px) { .minitab-table-sim { font-size: 0.70rem; } .minitab-table-sim th, .minitab-table-sim td { padding: 4px 2px; } }
                `}</style>
                <table className="minitab-table-sim">
                    {resultados.tipo === 'chi_cuadrada' ? (
                        <>
                            <thead>
                                <tr style={{ background: 'var(--bg-input)' }}>
                                    <th>Simulaciones</th>
                                    <th>Promedio Estadístico</th>
                                    <th>Grados de Libertad</th>
                                    <th>Valor Crítico Teórico</th>
                                    <th>Rechazar {renderKatex('H_0')}</th>
                                    <th>Aceptar {renderKatex('H_0')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{renderKatex(liveResultados.total.toString())}</td>
                                    <td>{renderKatex(resultados.promedioEstadistico.toFixed(4))}</td>
                                    <td>{renderKatex(resultados.df.toString())}</td>
                                    <td>{renderKatex(resultados.valorCritico.toFixed(4))}</td>
                                    <td>
                                        <div>{renderKatex(liveResultados.rechazos.toString())}</div>
                                        <div style={{ fontSize: '0.6rem', marginTop: '2px' }}>{renderKatex(liveResultados.pRechazo.toFixed(2) + '\\%')}</div>
                                    </td>
                                    <td>
                                        <div>{renderKatex(liveResultados.noRechazos.toString())}</div>
                                        <div style={{ fontSize: '0.6rem', marginTop: '2px' }}>{renderKatex(liveResultados.pNoRechazo.toFixed(2) + '\\%')}</div>
                                    </td>
                                </tr>
                            </tbody>
                        </>
                    ) : (
                        <>
                            <thead>
                                <tr style={{ background: 'var(--bg-input)' }}>
                                    <th>Simulaciones</th>
                                    <th>Hipótesis / Prueba</th>
                                    <th>Media Teórica {resultados.tipo === 'rachas' ? renderKatex('(\\mu_R)') : renderKatex('(\\mu)')}</th>
                                    <th>Valor Crítico {resultados.tipo === 'rachas' ? renderKatex('(Z_{crit})') : renderKatex('(S_{crit})')}</th>
                                    <th>Rechazar {renderKatex('H_0')}</th>
                                    <th>Aceptar {renderKatex('H_0')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{renderKatex(liveResultados.total.toString())}</td>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>
                                            {resultados.tipoPrueba === 'bilateral' ? 'Bilateral' : resultados.tipoPrueba === 'derecha' ? 'Unilateral Derecha' : 'Unilateral Izquierda'}
                                        </div>
                                    </td>
                                    <td>{resultados.tipo === 'rachas' && resultados.muR != null ? renderKatex(resultados.muR.toFixed(4)) : renderKatex((liveResultados.n / 2).toString())}</td>
                                    <td>
                                        {resultados.tipo === 'rachas' && resultados.valorCritico != null ? (
                                            renderKatex(resultados.tipoPrueba === 'bilateral' ? `\\pm ${Math.abs(resultados.valorCritico).toFixed(3)}` : resultados.valorCritico.toFixed(3))
                                        ) : (() => {
                                            const n = resultados.n;
                                            const alpha = resultados.alpha || 0.05;
                                            const isNormalApprox = n > 25;
                                            const mu = n / 2;
                                            const sigma = Math.sqrt(n) / 2;
                                            let sInf = null, sSup = null;

                                            if (isNormalApprox) {
                                                if (resultados.tipoPrueba === 'derecha') sSup = jStat.normal.inv(1 - alpha, mu, sigma) + 0.5;
                                                else if (resultados.tipoPrueba === 'izquierda') sInf = jStat.normal.inv(alpha, mu, sigma) - 0.5;
                                                else { sInf = jStat.normal.inv(alpha / 2, mu, sigma) - 0.5; sSup = jStat.normal.inv(1 - alpha / 2, mu, sigma) + 0.5; }
                                            } else {
                                                if (resultados.tipoPrueba === 'derecha' || resultados.tipoPrueba === 'bilateral') {
                                                    const target = resultados.tipoPrueba === 'bilateral' ? alpha / 2 : alpha;
                                                    for (let k = 0; k <= n; k++) {
                                                        if (1 - jStat.binomial.cdf(k - 1, n, 0.5) <= target) { sSup = k; break; }
                                                    }
                                                }
                                                if (resultados.tipoPrueba === 'izquierda' || resultados.tipoPrueba === 'bilateral') {
                                                    const target = resultados.tipoPrueba === 'bilateral' ? alpha / 2 : alpha;
                                                    for (let k = n; k >= 0; k--) {
                                                        if (jStat.binomial.cdf(k, n, 0.5) <= target) { sInf = k; break; }
                                                    }
                                                }
                                            }

                                            if (resultados.tipoPrueba === 'derecha') {
                                                return sSup != null ? renderKatex(`\\ge ${isNormalApprox ? sSup.toFixed(3) : sSup}`) : (isRejectionImpossible ? 'No aplica (N/A)' : '-');
                                            } else if (resultados.tipoPrueba === 'izquierda') {
                                                return sInf != null ? renderKatex(`\\le ${isNormalApprox ? sInf.toFixed(3) : sInf}`) : (isRejectionImpossible ? 'No aplica (N/A)' : '-');
                                            } else {
                                                return (sInf != null && sSup != null) 
                                                    ? renderKatex(`\\le ${isNormalApprox ? sInf.toFixed(3) : sInf} \\text{ o } \\ge ${isNormalApprox ? sSup.toFixed(3) : sSup}`) 
                                                    : (isRejectionImpossible ? 'No aplica (N/A)' : '-');
                                            }
                                        })()}
                                    </td>
                                    <td>
                                        <div>{renderKatex(liveResultados.rechazos.toString())}</div>
                                        <div style={{ fontSize: '0.6rem', marginTop: '2px' }}>{renderKatex(liveResultados.pRechazo.toFixed(2) + '\\%')}</div>
                                    </td>
                                    <td>
                                        <div>{renderKatex(liveResultados.noRechazos.toString())}</div>
                                        <div style={{ fontSize: '0.6rem', marginTop: '2px' }}>{renderKatex(liveResultados.pNoRechazo.toFixed(2) + '\\%')}</div>
                                    </td>
                                </tr>
                            </tbody>
                        </>
                    )}
                </table>
            </div>

            {/* GRÁFICA */}
            {resultados.tipo === 'chi_cuadrada' && (
                <div style={{ marginTop: '0px' }}>
                    <Grafico_HNP_SimulacionChi resultados={liveResultados} />
                </div>
            )}

            {resultados.tipo === 'signos' && (
                <div style={{ marginTop: '0px' }}>
                    <Grafico_HNP_SimulacionSignos resultados={liveResultados} />
                </div>
            )}

            {resultados.tipo === 'rachas' && (
                <div style={{ marginTop: '0px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <Grafico_HNP_SimulacionRachasZ resultados={liveResultados} />
                    <Grafico_HNP_SimulacionRachas resultados={liveResultados} />
                </div>
            )}

            {/* TABLA DE RESULTADOS VIVA */}
            <div style={{ marginTop: '5px' }}>
                <h5 style={{ margin: '0 0 15px 0', color: 'var(--text-pure)' }}>Historial de Simulaciones</h5>
                <div style={{ overflowX: 'auto', borderRadius: '0px', border: '1px solid var(--border-color)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th rowSpan={tieneMuestras || resultados.tipo === 'signos' || resultados.tipo === 'rachas' ? 2 : 1} style={{...tableHeaderStyle, width: '1%', borderRight: tieneMuestras || resultados.tipo === 'signos' || resultados.tipo === 'rachas' ? '1px solid var(--border-color)' : 'none'}}>Simulación</th>
                                
                                {tieneMuestras && (
                                    <th colSpan={sampleCols.length} style={{...tableHeaderStyle, borderRight: '1px solid var(--border-color)'}}>
                                        Frecuencias Simuladas
                                    </th>
                                )}
                                {!tieneMuestras && (resultados.tipo === 'signos' || resultados.tipo === 'rachas') && (
                                    <th colSpan={resultados.tipo === 'signos' ? 2 : 3} style={{...tableHeaderStyle, borderRight: '1px solid var(--border-color)'}}>Frecuencias Simuladas</th>
                                )}

                                <th rowSpan={tieneMuestras || resultados.tipo === 'signos' || resultados.tipo === 'rachas' ? 2 : 1} style={{...tableHeaderStyle, width: '75px'}}>Estadístico {resultados.tipo === 'chi_cuadrada' ? renderKatex('(\\chi^2_c)') : resultados.tipo === 'rachas' ? renderKatex('(Z_c)') : renderKatex('(S)')}</th>
                                {(resultados.tipo === 'signos' || resultados.tipo === 'rachas') && (
                                    <th rowSpan={tieneMuestras || resultados.tipo === 'signos' || resultados.tipo === 'rachas' ? 2 : 1} style={{...tableHeaderStyle, width: '75px'}}>{renderKatex('p')}-Valor</th>
                                )}
                                <th rowSpan={tieneMuestras || resultados.tipo === 'signos' || resultados.tipo === 'rachas' ? 2 : 1} style={{...tableHeaderStyle, width: '95px'}}>Decisión</th>
                            </tr>
                            {tieneMuestras && (
                                <tr>
                                    {sampleCols.map((col, idx) => (
                                        <th key={idx} style={{ padding: '4px', borderBottom: '2px solid var(--border-color)', borderRight: idx === sampleCols.length - 1 ? '1px solid var(--border-color)' : 'none', color: 'var(--text-muted, #64748b)', fontWeight: 500, width: '40px', fontSize: '0.75rem', textAlign: 'center', background: 'transparent' }}>
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            )}
                            {!tieneMuestras && resultados.tipo === 'signos' && (
                                <tr>
                                    <th style={{ padding: '4px', borderBottom: '2px solid var(--border-color)', borderRight: '1px solid var(--border-color)', color: '#10b981', fontWeight: 500, width: '50px', fontSize: '0.75rem', textAlign: 'center', background: 'transparent' }}>
                                        (+) Éxitos
                                    </th>
                                    <th style={{ padding: '4px', borderBottom: '2px solid var(--border-color)', borderRight: '1px solid var(--border-color)', color: '#ef4444', fontWeight: 500, width: '50px', fontSize: '0.75rem', textAlign: 'center', background: 'transparent' }}>
                                        (-) Fracasos
                                    </th>
                                </tr>
                            )}
                            {!tieneMuestras && resultados.tipo === 'rachas' && (
                                <tr>
                                    <th style={{ padding: '4px', borderBottom: '2px solid var(--border-color)', borderRight: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 500, width: '40px', fontSize: '0.75rem', textAlign: 'center', background: 'transparent' }}>{renderKatex('n_1')}</th>
                                    <th style={{ padding: '4px', borderBottom: '2px solid var(--border-color)', borderRight: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 500, width: '40px', fontSize: '0.75rem', textAlign: 'center', background: 'transparent' }}>{renderKatex('n_2')}</th>
                                    <th style={{ padding: '4px', borderBottom: '2px solid var(--border-color)', borderRight: '1px solid var(--border-color)', color: 'var(--text-main)', fontWeight: 500, width: '40px', fontSize: '0.75rem', textAlign: 'center', background: 'transparent' }}>Rachas ({renderKatex('R')})</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {datosTabla.map((sim, idx) => {
                                if (sim.isVacia) {
                                    return (
                                        <tr key={sim.iteracion} style={{ background: idx % 2 === 0 ? 'var(--bg-input)' : 'var(--bg-card)', height: '30px' }}>
                                            <td style={{...tableCellStyle, borderRight: tieneMuestras || resultados.tipo === 'signos' || resultados.tipo === 'rachas' ? '1px solid var(--border-color)' : 'none'}}>&nbsp;</td>
                                            {tieneMuestras && sampleCols.map((col, idxCol) => (
                                                <td key={idxCol} style={{ ...tableCellStyle, borderRight: idxCol === sampleCols.length - 1 ? '1px solid var(--border-color)' : 'none' }}>&nbsp;</td>
                                            ))}
                                            {!tieneMuestras && resultados.tipo === 'signos' && (
                                                <>
                                                    <td style={{...tableCellStyle, borderRight: '1px solid var(--border-color)'}}>&nbsp;</td>
                                                    <td style={{...tableCellStyle, borderRight: '1px solid var(--border-color)'}}>&nbsp;</td>
                                                </>
                                            )}
                                            {!tieneMuestras && resultados.tipo === 'rachas' && (
                                                <>
                                                    <td style={{...tableCellStyle, borderRight: '1px solid var(--border-color)'}}>&nbsp;</td>
                                                    <td style={{...tableCellStyle, borderRight: '1px solid var(--border-color)'}}>&nbsp;</td>
                                                    <td style={{...tableCellStyle, borderRight: '1px solid var(--border-color)'}}>&nbsp;</td>
                                                </>
                                            )}
                                            <td style={tableCellStyle}>&nbsp;</td>
                                            {(resultados.tipo === 'signos' || resultados.tipo === 'rachas') && <td style={tableCellStyle}>&nbsp;</td>}
                                            <td style={tableCellStyle}>&nbsp;</td>
                                        </tr>
                                    );
                                }
                                
                                const isRechazo = sim.decision === 'Rechazar H₀';
                                return (
                                    <tr key={`sim-${sim.iteracion}`} style={{ background: idx % 2 === 0 ? 'var(--bg-input)' : 'var(--bg-card)', transition: 'background 0.2s', height: '30px' }}>
                                        <td style={{...tableCellStyle, fontWeight: 600, borderRight: tieneMuestras || resultados.tipo === 'signos' || resultados.tipo === 'rachas' ? '1px solid var(--border-color)' : 'none'}}>{sim.iteracion}</td>
                                        
                                        {tieneMuestras && sampleCols.map((col, idxCol) => (
                                            <td key={idxCol} style={{ ...tableCellStyle, padding: '4px 10px', fontSize: '0.8rem', color: col === '...' ? 'var(--text-muted)' : 'inherit', borderRight: idxCol === sampleCols.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                                {(sim.observadas || sim.matrizNum) ? renderSampleValue(sim, col) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                                            </td>
                                        ))}
                                        {!tieneMuestras && resultados.tipo === 'signos' && (
                                            <>
                                                <td style={{...tableCellStyle, padding: '4px 10px', fontSize: '0.8rem', fontWeight: 600, color: '#10b981', borderRight: '1px solid var(--border-color)'}}>
                                                    {sim.estadistico}
                                                </td>
                                                <td style={{...tableCellStyle, padding: '4px 10px', fontSize: '0.8rem', fontWeight: 600, color: '#ef4444', borderRight: '1px solid var(--border-color)'}}>
                                                    {resultados.n - sim.estadistico}
                                                </td>
                                            </>
                                        )}
                                        {!tieneMuestras && resultados.tipo === 'rachas' && (
                                            <>
                                                <td style={{...tableCellStyle, padding: '4px 10px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', borderRight: '1px solid var(--border-color)'}}>{sim.n1}</td>
                                                <td style={{...tableCellStyle, padding: '4px 10px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', borderRight: '1px solid var(--border-color)'}}>{sim.n2}</td>
                                                <td style={{...tableCellStyle, padding: '4px 10px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', borderRight: '1px solid var(--border-color)'}}>{sim.rachas}</td>
                                            </>
                                        )}

                                        <td style={tableCellStyle}>{sim.estadistico != null ? (resultados.tipo === 'signos' ? Math.round(sim.estadistico) : sim.estadistico.toFixed(3)) : '-'}</td>
                                        {(resultados.tipo === 'signos' || resultados.tipo === 'rachas') && (
                                            <td style={tableCellStyle}>{sim.pValor != null ? sim.pValor.toFixed(4) : '-'}</td>
                                        )}
                                        <td style={tableCellStyle}>
                                            <span style={{
                                                display: 'inline-block', padding: '2px 5px', borderRadius: '5px', fontSize: '0.7em', fontWeight: 'bold',
                                                background: isRechazo ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                color: isRechazo ? '#ef4444' : '#10b981',
                                                border: `1px solid ${isRechazo ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
                                            }}>
                                                {isRechazo ? <>Rechazar {renderKatex('H_0')}</> : <>Aceptar {renderKatex('H_0')}</>}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Controles de Paginación */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <button 
                            disabled={pagina <= 1}
                            onClick={() => setPagina(p => Math.max(1, p - 1))}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', cursor: pagina <= 1 ? 'not-allowed' : 'pointer', fontWeight: '600', padding: '5px 15px', borderRadius: '5px', transition: 'all 0.2s ease', fontSize: '0.7rem', opacity: pagina <= 1 ? 0.5 : 1 }}
                            onMouseEnter={(e) => { if(pagina > 1) { e.currentTarget.style.background = 'var(--primary-color)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                            onMouseLeave={(e) => { if(pagina > 1) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary-color)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)' }}>
                                <polyline points="13 17 18 12 13 7"></polyline>
                                <polyline points="6 17 11 12 6 7"></polyline>
                            </svg>
                            Anterior
                        </button>
                        
                        <div style={{ fontSize: FS?.sm || '0.875rem', color: 'var(--text-pure)', fontWeight: 'bold' }}>
                            Pág {pagina} de {Math.max(1, totalPaginas)}
                        </div>
                        
                        <button 
                            disabled={pagina >= totalPaginas}
                            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', cursor: pagina >= totalPaginas ? 'not-allowed' : 'pointer', fontWeight: '600', padding: '5px 15px', borderRadius: '5px', transition: 'all 0.2s ease', fontSize: '0.7rem', opacity: pagina >= totalPaginas ? 0.5 : 1 }}
                            onMouseEnter={(e) => { if(pagina < totalPaginas) { e.currentTarget.style.background = 'var(--primary-color)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
                            onMouseLeave={(e) => { if(pagina < totalPaginas) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary-color)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
                        >
                            Siguiente
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="13 17 18 12 13 7"></polyline>
                                <polyline points="6 17 11 12 6 7"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>


        </div>
    );
}
