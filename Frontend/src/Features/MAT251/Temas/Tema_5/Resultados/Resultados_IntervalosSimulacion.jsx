import React, { useState, useMemo, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import GraficoEstimacionIntervalos from '../../../Graficas/Tema_5/GraficoEstimacionIntervalos';
import { FS, RADIUS } from '../../../Principal/Constantes';
import * as XLSX from 'xlsx';
import { api } from '../../../../../services/api';
import { alerta } from '../../../../../utils/Notificaciones';
import { IconoGuardar, Descargar } from '../../../../../ui/iconos';

export default function Resultados_IntervalosSimulacion({ resultados }) {
    const [visibleCount, setVisibleCount] = useState(0);
    const [velocidad, setVelocidad] = useState('1x');
    const [pausado, setPausado] = useState(false);

    useEffect(() => {
        setVisibleCount(0);
        setPausado(false);
        setVelocidad('1x');
    }, [resultados]);

    useEffect(() => {
        if (!resultados || !resultados.simulaciones) return;
        
        const total = resultados.simulaciones.length;
        if (visibleCount < total && !pausado) {
            let delay = 1000;
            let step = 1;
            
            if (velocidad === '1x') delay = 1000;
            else if (velocidad === '2x') delay = 500;
            else if (velocidad === '4x') delay = 250;
            else if (velocidad === 'MAX') {
                delay = 16;
                step = Math.max(1, Math.floor(total / 50));
            }

            const timer = setTimeout(() => {
                setVisibleCount(prev => Math.min(prev + step, total));
            }, delay);

            return () => clearTimeout(timer);
        }
    }, [resultados, visibleCount, pausado, velocidad]);

    if (!resultados) return null;

    const { parametro, parametroVerdadero, simulaciones, distribucion, paramsDist, confianza } = resultados;

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const simulacionesVisibles = useMemo(() => {
        return simulaciones.slice(0, Math.max(1, visibleCount));
    }, [simulaciones, visibleCount]);

    const resumenDinamico = useMemo(() => {
        if (simulacionesVisibles.length === 0) return { cobertura: 0, contienen: 0, promedioAmplitud: 0 };
        let contienen = 0;
        let sumaAmplitud = 0;
        let countAmplitud = 0;

        for (let i = 0; i < simulacionesVisibles.length; i++) {
            const sim = simulacionesVisibles[i];
            if (sim.contiene) contienen++;
            if (sim.LI !== undefined && sim.LS !== undefined && !isNaN(sim.LI) && !isNaN(sim.LS)) {
                sumaAmplitud += (sim.LS - sim.LI);
                countAmplitud++;
            }
        }
        
        const cobertura = (contienen / simulacionesVisibles.length) * 100;
        const promedioAmplitud = countAmplitud > 0 ? sumaAmplitud / countAmplitud : 0;

        return { cobertura, contienen, promedioAmplitud };
    }, [simulacionesVisibles]);

    const n = resultados.n || 0;
    const total = simulaciones.length;
    const simulacionEnCurso = visibleCount < total;

    const getParamsText = () => {
        if (!distribucion || !paramsDist) return '';
        if (distribucion === 'normal') return `\\mu = ${paramsDist.mu.toLocaleString()} \\text{ y } \\sigma = ${paramsDist.sigma.toLocaleString()}`;
        if (distribucion === 'bernoulli') return `p = ${paramsDist.p}`;
        if (distribucion === 'poisson') return `\\lambda = ${paramsDist.lambda}`;
        if (distribucion === 'uniforme') return `a = ${paramsDist.a} \\text{ y } b = ${paramsDist.b}`;
        if (distribucion === 'binomial') return `n = ${paramsDist.n_ensayos} \\text{ y } p = ${paramsDist.p}`;
        return '';
    };

    let pName = '\\mu';
    if (parametro === 'proporcion') { pName = 'p'; }
    if (parametro === 'varianza') { pName = '\\sigma^2'; }

    const getFileName = () => {
        const d = new Date();
        const pad = (num) => num.toString().padStart(2, '0');
        const fecha = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}h${pad(d.getMinutes())}`;
        const paramName = parametro ? parametro.charAt(0).toUpperCase() + parametro.slice(1) : 'Intervalo';
        return `Simulacion_Intervalos_${paramName}_n${n}_${fecha}.xlsx`;
    };

    const handleGuardarEnEspacio = async () => {
        if (!resultados.simulaciones || resultados.simulaciones.length === 0) return;
        try {
            const worksheet = XLSX.utils.json_to_sheet(resultados.simulaciones.map((s, i) => {
                return { 
                    "Simulación": i + 1,
                    "Estimación": s.estimacionPuntual !== undefined ? s.estimacionPuntual : s.estimacion,
                    "Límite Inferior": s.LI,
                    "Límite Superior": s.LS,
                    "Contiene Parámetro": s.contiene ? "Sí" : "No"
                };
            }));
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, `Simulacion Intervalos`);
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const fileObj = new File([blob], getFileName(), { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

            const usuarioGuardado = localStorage.getItem('usuario');
            const autor = usuarioGuardado ? JSON.parse(usuarioGuardado).nombre : 'Estudiante';

            const formData = new FormData();
            formData.append("file", fileObj);
            formData.append("autor", autor);
            formData.append("visibilidad", "personal");

            await api.subirArchivo(formData);
            alerta.success("¡Guardado exitoso!", "El archivo de simulación se ha guardado en tu Espacio Personal.");
        } catch (error) {
            console.error("Error al guardar en el espacio personal:", error);
            alerta.error("Error", "No se pudo guardar el archivo en tu Espacio Personal.");
        }
    };

    const handleDescargarExcel = () => {
        if (!resultados.simulaciones || resultados.simulaciones.length === 0) return;
        const worksheet = XLSX.utils.json_to_sheet(resultados.simulaciones.map((s, i) => {
            return { 
                "Simulación": i + 1,
                "Estimación": s.estimacionPuntual !== undefined ? s.estimacionPuntual : s.estimacion,
                "Límite Inferior": s.LI,
                "Límite Superior": s.LS,
                "Contiene Parámetro": s.contiene ? "Sí" : "No"
            };
        }));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Simulacion Intervalos`);
        XLSX.writeFile(workbook, getFileName());
    };

    return (
        <div className="tema5-resultados-pure" style={{ marginTop: '0px' }}>
            {/* CONTROLES DE SIMULACIÓN */}
            <div style={{ marginTop: '0px', marginBottom: '15px', padding: '5px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', background: 'var(--primary-color)', width: `${(visibleCount / total) * 100}%`, transition: 'width 0.1s linear' }} />
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: FS.sx, fontWeight: 700, color: 'var(--text-muted)' }}>Simulación: {visibleCount} / {total}</span>
                    
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'nowrap', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', padding: '3px', borderRadius: '5px', border: '1px solid var(--border-color)' }}>
                            {['1x', '2x', '4x', 'MAX'].map(vel => (
                                <button
                                    key={vel}
                                    type="button"
                                    onClick={() => setVelocidad(vel)}
                                    style={{
                                        background: velocidad === vel ? 'var(--primary-color)' : 'transparent',
                                        color: velocidad === vel ? '#fff' : 'var(--text-muted)',
                                        border: 'none', borderRadius: '5px', padding: '1px 5px', cursor: 'pointer', fontSize: '0.55rem',
                                        fontWeight: 800, transition: 'all 0.2s', boxShadow: velocidad === vel ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >
                                    {vel}
                                </button>
                            ))}
                        </div>

                        {simulacionEnCurso && (
                            <button
                                type="button"
                                onClick={() => setPausado(!pausado)}
                                style={{
                                    background: pausado ? '#10b981' : '#f59e0b',
                                    color: '#fff', border: 'none', borderRadius: '5px',
                                    padding: '3px 5px', cursor: 'pointer', fontSize: '0.6rem',
                                    fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px',
                                    transition: 'background 0.2s', minWidth: '105px', justifyContent: 'center', whiteSpace: 'nowrap'
                                }}
                            >
                                {pausado ? (
                                    <>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                        Reanudar
                                    </>
                                ) : (
                                    <>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                                        Pausar
                                    </>
                                )}
                            </button>
                        )}

                    </div>
                </div>
            </div>


            <div id="tour-t5-intervalos-sim-estado" style={{ 
                background: simulacionEnCurso ? 'rgba(245, 158, 11, 0.05)' : 'rgba(37, 99, 235, 0.05)', 
                border: simulacionEnCurso ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(37, 99, 235, 0.2)', 
                borderRadius: '8px', 
                padding: '12px 18px', 
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px'
            }}>
                <div style={{ color: simulacionEnCurso ? '#f59e0b' : 'var(--primary-color, #2563eb)' }}>
                    {simulacionEnCurso ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin-animation" style={{ animation: 'spin 2s linear infinite' }}>
                            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                    )}
                </div>
                <div>
                    <h5 style={{ margin: '0 0 0px 0', color: simulacionEnCurso ? '#f59e0b' : 'var(--primary-color, #2563eb)', fontSize: '0.9rem', fontWeight: 600 }}>
                        {simulacionEnCurso ? 'Simulando...' : 'Simulación completada'}
                    </h5>
                    <p style={{ margin: 0, fontSize: '0.7rem' }}>
                        {simulacionEnCurso ? 'Generando ' : 'Se generaron '}
                        <strong>{visibleCount}</strong> {simulacionEnCurso ? `de ${total} ` : ''} intervalos de confianza al <strong>{confianza}%</strong> para muestras de tamaño <strong>{renderKatex(`n = ${n}`)}</strong>
                        {distribucion && paramsDist ? (
                            <span> desde una población {distribucion !== 'normal' ? distribucion : ''} con <strong>{renderKatex(getParamsText())}</strong>.</span>
                        ) : (
                            <span>.</span>
                        )}
                    </p>
                </div>
            </div>

            <div id="tour-t5-intervalos-sim-tarjetas-resumen" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '15px' }}>
                {parametroVerdadero !== null && (
                    <div className="card-resultado" style={{ background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            Parámetro Poblacional ({renderKatex(pName)})
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold'}}>
                            {renderKatex(parametroVerdadero.toFixed(4))}
                        </div>
                    </div>
                )}

                <div className="card-resultado" style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75em', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                        Cobertura Observada
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#059669' }}>
                        {renderKatex(`${resumenDinamico.cobertura.toFixed(2)}\\%`)}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-pure)' }}>
                        {renderKatex(String(resumenDinamico.contienen))} de {renderKatex(String(visibleCount || 1))} intervalos contienen a {renderKatex(pName)}
                    </div>
                </div>

                <div className="card-resultado" style={{ background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75em', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                        Ancho del Intervalo (Promedio)
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                        {renderKatex(resumenDinamico.promedioAmplitud.toFixed(4))}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-pure)' }}>
                        (Límite Superior - Límite Inferior)
                    </div>
                </div>
            </div>

            {/* Gráfico Visual */}
            <div id="tour-t5-intervalos-sim-grafico" style={{ marginTop: '20px' }}>
                <GraficoEstimacionIntervalos resultados={resultados} simulacionesVisibles={simulacionesVisibles} />
            </div>

            {/* Tabla de Resultados */}
            <div id="tour-t5-intervalos-sim-tabla" style={{ marginTop: '20px' }}>
                <Tabla_IntervalosSimulacion resultados={resultados} simulacionesVisibles={simulacionesVisibles} />
                
                <div id="tour-t5-intervalos-sim-btn-exportar" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
                    <button
                        type="button"
                        className="btn-primary"
                        style={{ padding: '5px 14px', fontSize: FS.sm, fontWeight: 600, fontFamily: 'inherit', borderRadius: RADIUS }}
                        onClick={handleGuardarEnEspacio}
                    >
                        <IconoGuardar /> Guardar
                    </button>
                    <button
                        type="button"
                        className="btn-verde"
                        style={{ padding: '5px 14px', fontSize: FS.sm, fontWeight: 600, fontFamily: 'inherit', borderRadius: RADIUS }}
                        onClick={handleDescargarExcel}
                    >
                        <Descargar width="18" height="18" /> Descargar (.xlsx)
                    </button>
                </div>
            </div>
        </div>
    );
}

function Tabla_IntervalosSimulacion({ resultados, simulacionesVisibles }) {
    const [limiteVisible, setLimiteVisible] = useState(10);
    if (!resultados || !simulacionesVisibles) return null;

    const { parametro, simulaciones } = resultados;
    
    let pName = '\\mu';
    if (parametro === 'proporcion') { pName = 'p'; }
    if (parametro === 'varianza') { pName = '\\sigma^2'; }

    const simsMostradas = simulacionesVisibles.slice(0, limiteVisible);
    const estiloBotonMostrarMas = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        width: 'fit-content',
        background: 'transparent',
        border: '1px solid var(--primary-color)',
        color: 'var(--primary-color)',
        cursor: 'pointer',
        fontWeight: 600,
        padding: '5px 14px',
        borderRadius: RADIUS,
        transition: 'all 0.2s ease',
        fontSize: FS.sm,
        fontFamily: 'inherit'
    };

    return (
        <div style={{ marginTop: '0px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-pure)', textAlign:'center' }}>
                Detalle de Simulaciones
            </h4>
            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '400px', border: '1px solid var(--border-color)', borderRadius: '0px', background: 'var(--bg-card)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'center', fontSize: '0.85em', whiteSpace: 'nowrap', color: 'var(--text-pure)' }}>
                    <thead style={{ background: 'var(--bg-input)', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.05)', color: 'var(--text-pure)' }}>
                        <tr>
                            <th style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', color: 'var(--text-pure)' }}>Simulación</th>
                            <th style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', color: 'var(--text-pure)' }}>{renderKatex(parametro === 'media' ? '\\bar{X}' : parametro === 'proporcion' ? '\\hat{p}' : 'S^2')}</th>
                            <th style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', color: 'var(--text-pure)' }}>Límite Inferior</th>
                            <th style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', color: 'var(--text-pure)' }}>Límite Superior</th>
                            <th style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', color: 'var(--text-pure)' }}>¿Contiene a {renderKatex(pName)}?</th>
                        </tr>
                    </thead>
                    <tbody>
                        {simsMostradas.map((sim, i) => {
                            const indexReal = sim.simulacion || (i + 1);
                            const puntual = sim.estimacionPuntual !== undefined ? sim.estimacionPuntual : sim.estimacion || 0;
                            return (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-input)' }}>
                                    <td style={{ padding: '8px', fontWeight: 600, borderRight: '1px solid var(--border-color)', color: 'var(--text-pure)' }}>{indexReal}</td>
                                    <td style={{ padding: '8px', borderRight: '1px solid var(--border-color)', color: 'var(--text-pure)' }}>{puntual.toFixed(4)}</td>
                                    <td style={{ padding: '8px', borderRight: '1px solid var(--border-color)', color: 'var(--text-pure)' }}>{sim.LI.toFixed(4)}</td>
                                    <td style={{ padding: '8px', borderRight: '1px solid var(--border-color)', color: 'var(--text-pure)' }}>{sim.LS.toFixed(4)}</td>
                                    <td style={{ padding: '8px' }}>
                                        {sim.contiene ? (
                                            <span style={{ color: '#059669', fontWeight: 'bold' }}>Sí</span>
                                        ) : (
                                            <span style={{ color: '#ea580c', fontWeight: 'bold' }}>No</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '20px', justifyContent: 'center', width: '100%' }}>
                {limiteVisible < simulaciones.length && (
                    <button 
                        type="button"
                        onClick={() => setLimiteVisible(prev => Math.min(prev + 10, simulaciones.length))}
                        style={estiloBotonMostrarMas}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-color)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="13 17 18 12 13 7"></polyline>
                            <polyline points="6 17 11 12 6 7"></polyline>
                        </svg>
                        Mostrar 10 más
                    </button>
                )}
                {limiteVisible < simulaciones.length && limiteVisible + 10 < simulaciones.length && (
                    <button
                        type="button"
                        onClick={() => setLimiteVisible(prev => Math.min(prev + 50, simulaciones.length))}
                        style={estiloBotonMostrarMas}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-color)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                    >
                        Mostrar 50 más
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="13 17 18 12 13 7"></polyline>
                            <polyline points="6 17 11 12 6 7"></polyline>
                        </svg>
                    </button>
                )}
                {limiteVisible > 10 && (
                    <button 
                        type="button"
                        onClick={() => setLimiteVisible(10)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1.5px solid var(--border-color)', color: 'var(--text-muted, #64748b)', cursor: 'pointer', fontWeight: '600', padding: '8px 20px', borderRadius: RADIUS, transition: 'all 0.2s ease', fontSize: FS.sm, fontFamily: 'inherit' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted, #64748b)'; }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="11 17 6 12 11 7"></polyline>
                            <polyline points="18 17 13 12 18 7"></polyline>
                        </svg>
                        Restablecer a 10
                    </button>
                )}
            </div>
        </div>
    );
}

const renderKatex = (math) => (
    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
);
