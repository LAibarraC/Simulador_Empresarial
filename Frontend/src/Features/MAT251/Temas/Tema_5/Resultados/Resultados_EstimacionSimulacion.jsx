import React, { useState, useMemo, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import GraficoEstimacionSimulacion from '../../../Graficas/Tema_5/GraficoEstimacionSimulacion';
import { FS, RADIUS } from '../../../Principal/Constantes';
import * as XLSX from 'xlsx';
import { api } from '../../../../../services/api';
import { alerta } from '../../../../../utils/Notificaciones';
import { IconoGuardar, Descargar } from '../../../../../ui/iconos';

export default function Resultados_EstimacionSimulacion({ resultados }) {
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

    const { parametro, parametroVerdadero, resumen, simulaciones, distribucion, paramsDist } = resultados;

    const simulacionesVisibles = useMemo(() => {
        return simulaciones.slice(0, Math.max(1, visibleCount));
    }, [simulaciones, visibleCount]);

    const resumenDinamico = useMemo(() => {
        if (simulacionesVisibles.length === 0) return { promedio: 0, min: 0, max: 0, desviacion: 0, sesgo: 0, ecm: 0 };
        const nSims = simulacionesVisibles.length;
        let suma = 0;
        let min = Infinity;
        let max = -Infinity;

        for (let i = 0; i < nSims; i++) {
            const val = simulacionesVisibles[i].estimacion;
            suma += val;
            if (val < min) min = val;
            if (val > max) max = val;
        }

        const promedio = suma / nSims;

        let sumaCuadradosDiff = 0;
        let ecmSuma = 0;
        for (let i = 0; i < nSims; i++) {
            const val = simulacionesVisibles[i].estimacion;
            sumaCuadradosDiff += Math.pow(val - promedio, 2);
            if (parametroVerdadero !== null) {
                ecmSuma += Math.pow(val - parametroVerdadero, 2);
            }
        }

        const varianza = nSims > 1 ? sumaCuadradosDiff / (nSims - 1) : 0;
        const desviacion = Math.sqrt(varianza);
        const sesgo = parametroVerdadero !== null ? promedio - parametroVerdadero : 0;
        const ecm = parametroVerdadero !== null ? ecmSuma / nSims : 0;

        return { promedio, min, max, desviacion, sesgo, ecm };
    }, [simulacionesVisibles, parametroVerdadero]);

    const total = simulaciones.length;
    const simulacionEnCurso = visibleCount < total;

    const getFileName = () => {
        const d = new Date();
        const pad = (num) => num.toString().padStart(2, '0');
        const fecha = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}h${pad(d.getMinutes())}`;
        const paramName = resultados.parametro ? resultados.parametro.charAt(0).toUpperCase() + resultados.parametro.slice(1) : 'Estadistica';
        const sampleN = resultados.n || (resultados.simulaciones.length > 0 && resultados.simulaciones[0].muestra ? resultados.simulaciones[0].muestra.length : 0);
        return `Simulacion_${paramName}_n${sampleN}_${fecha}.xlsx`;
    };

    const handleGuardarEnEspacio = async () => {
        if (!resultados.simulaciones || resultados.simulaciones.length === 0) return;
        try {
            const worksheet = XLSX.utils.json_to_sheet(resultados.simulaciones.map((s, i) => {
                const fila = { "Simulación": i + 1 };
                if (s.muestra) {
                    s.muestra.forEach((val, idx) => {
                        fila[`Muestra ${idx + 1}`] = val;
                    });
                }
                fila["Estimación"] = s.estimacion;
                if (resultados.parametroVerdadero !== null) {
                    fila["Diferencia"] = s.estimacion - resultados.parametroVerdadero;
                }
                return fila;
            }));
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, `Simulacion Estimacion`);
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
            const fila = { "Simulación": i + 1 };
            if (s.muestra) {
                s.muestra.forEach((val, idx) => {
                    fila[`Muestra ${idx + 1}`] = val;
                });
            }
            fila["Estimación"] = s.estimacion;
            if (resultados.parametroVerdadero !== null) {
                fila["Diferencia"] = s.estimacion - resultados.parametroVerdadero;
            }
            return fila;
        }));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Simulacion Estimacion`);
        XLSX.writeFile(workbook, getFileName());
    };

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const n = resultados.n || (simulaciones.length > 0 && simulaciones[0].muestra ? simulaciones[0].muestra.length : 0);
    
    const getParamsText = () => {
        if (!distribucion || !paramsDist) return '';
        if (distribucion === 'normal') return `\\mu = ${paramsDist.mu.toLocaleString()} \\text{ y } \\sigma = ${paramsDist.sigma.toLocaleString()}`;
        if (distribucion === 'bernoulli') return `p = ${paramsDist.p}`;
        if (distribucion === 'poisson') return `\\lambda = ${paramsDist.lambda}`;
        if (distribucion === 'uniforme') return `a = ${paramsDist.a} \\text{ y } b = ${paramsDist.b}`;
        if (distribucion === 'binomial') return `n = ${paramsDist.n_ensayos} \\text{ y } p = ${paramsDist.p}`;
        return '';
    };

    let simbolo = '\\hat{\\mu}';
    let pName = 'Media (μ)';
    if (parametro === 'proporcion') { simbolo = '\\hat{p}'; pName = 'Proporción (p)'; }
    if (parametro === 'varianza') { simbolo = 'S^2'; pName = 'Varianza (σ²)'; }

    return (
        <div className="tema5-resultados-pure" style={{ marginTop: '0px' }}>
            {/* CONTROLES DE SIMULACIÓN TIPO TEMA 1 */}
            <div style={{ marginTop: '10px', marginBottom: '5px', padding: '5px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
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

            <div style={{ 
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
                        <strong>{visibleCount}</strong> {simulacionEnCurso ? `de ${total} ` : ''} muestras de tamaño <strong>{renderKatex(`n = ${n}`)}</strong>
                        {distribucion && paramsDist ? (
                            <span> desde una población {distribucion !== 'normal' ? distribucion : ''} con <strong>{renderKatex(getParamsText())}</strong>.</span>
                        ) : (
                            <span>.</span>
                        )}
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '15px' }}>
                {parametroVerdadero !== null && (
                    <div className="card-resultado" style={{ background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-pure)' }}>
                            <svg width="18" height="18" viewBox="0 0 640 512" fill="currentColor" style={{ color: '#ea580c' }}>
                                <path d="M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm32 32h-64c-17.6 0-33.5 7.1-45.1 18.6 40.3 22.1 68.9 62 75.1 109.4h66c17.7 0 32-14.3 32-32v-32c0-35.3-28.7-64-64-64zm-256 0c61.9 0 112-50.1 112-112S381.9 32 320 32 208 82.1 208 144s50.1 112 112 112zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C179.6 288 128 339.6 128 403.2V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5 263.1 145.6 256 128 256H64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h66.9c6.2-47.4 34.8-87.3 75.1-109.4z"/>
                            </svg>
                            Parámetro Poblacional Real
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-pure)' }}>
                            {renderKatex(parametroVerdadero.toFixed(4))}
                        </div>
                    </div>
                )}

                <div className="card-resultado" style={{ background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75em', color: 'var(--text-pure)', fontWeight: 'bold' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                                style={{ color: 'var(--primary-color)' }}>
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                        Promedio de las Estimaciones
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-pure)' }}>
                        {renderKatex(`\\overline{${simbolo}} = ${resumenDinamico.promedio.toFixed(4)}`)}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '15px' }}>
                <div className="card-stat" style={{ background: 'rgba(147, 51, 234, 0.08)', border: '1px solid rgba(147, 51, 234, 0.4)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-pure)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ color: '#9333ea' }}>
                            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                        </svg>
                        Desv. Est. de Estimaciones:
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-pure)' }}>{renderKatex(resumenDinamico.desviacion.toFixed(4))}</span>
                </div>
                <div className="card-stat" style={{ background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.4)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-pure)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ color: '#dc2626' }}>
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="8 12 12 16 16 12"></polyline>
                            <line x1="12" y1="8" x2="12" y2="16"></line>
                        </svg>
                        Mínimo {renderKatex(`(${simbolo})`)}:
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-pure)' }}>{renderKatex(resumenDinamico.min === Infinity ? '0.0000' : resumenDinamico.min.toFixed(4))}</span>
                </div>
                <div className="card-stat" style={{ background: 'rgba(22, 163, 74, 0.08)', border: '1px solid rgba(22, 163, 74, 0.4)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-pure)' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                         style={{ color: '#16a34a' }}>
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="16 12 12 8 8 12"></polyline>
                            <line x1="12" y1="16" x2="12" y2="8"></line>
                        </svg>
                        Máximo {renderKatex(`(${simbolo})`)}:
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-pure)' }}>{renderKatex(resumenDinamico.max === -Infinity ? '0.0000' : resumenDinamico.max.toFixed(4))}</span>
                </div>
            </div>

            {/* GRÁFICOS */}
            <div style={{ marginTop: '20px' }}>
                <GraficoEstimacionSimulacion resultados={resultados} simulacionesVisibles={simulacionesVisibles} />
            </div>

            {/* TABLA DE RESULTADOS */}
            <div style={{ marginTop: '20px' }}>
                <Tabla_EstimacionSimulacion resultados={resultados} simulacionesVisibles={simulacionesVisibles} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
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


const renderKatex = (math) => (
    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
);

function Tabla_EstimacionSimulacion({ resultados, simulacionesVisibles }) {
    const [limiteVisible, setLimiteVisible] = useState(10);
    if (!resultados || !simulacionesVisibles) return null;

    const { parametro, parametroVerdadero, simulaciones } = resultados;

    let estimacionLabel = 'Estimación';
    let diferenciaLabel = 'Diferencia';
    
    if (parametro === 'media') {
        estimacionLabel = <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Media muestral ({renderKatex('\\bar{X}')})</span>;
        diferenciaLabel = <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Diferencia ({renderKatex('\\bar{X} - \\mu')})</span>;
    } else if (parametro === 'proporcion') {
        estimacionLabel = <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Proporción muestral ({renderKatex('\\hat{p}')})</span>;
        diferenciaLabel = <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Diferencia ({renderKatex('\\hat{p} - p')})</span>;
    } else if (parametro === 'varianza') {
        estimacionLabel = <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Varianza muestral ({renderKatex('S^2')})</span>;
        diferenciaLabel = <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Diferencia ({renderKatex('S^2 - \\sigma^2')})</span>;
    }

    // Orden normal (1, 2, 3...)
    const simsMostradas = simulacionesVisibles.slice(0, limiteVisible);

    const n = resultados.n || (simulaciones.length > 0 && simulaciones[0].muestra ? simulaciones[0].muestra.length : 0);
    const tieneMuestras = simulaciones.length > 0 && simulaciones[0].muestra != null;
    
    // Configurar qué columnas de muestra mostrar dinámicamente para no desbordar
    const sampleCols = useMemo(() => {
        if (!tieneMuestras || n === 0) return [];
        if (n <= 100) {
            return Array.from({ length: n }, (_, i) => i + 1);
        } else {
            return [1, 2, 3, '...', n - 2, n - 1, n];
        }
    }, [n, tieneMuestras]);

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

    const renderSampleValue = (muestra, colIdx) => {
        if (!muestra) return '-';
        if (colIdx === '...') return '...';
        const val = muestra[colIdx - 1]; // colIdx es 1-based
        if (val === undefined) return '-';
        return Number.isInteger(val) ? val : Number(val).toFixed(2);
    };

    return (
        <div style={{ marginTop: '0px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', textAlign:'center' }}>
                Muestras y Estimaciones
            </h4>
            <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '400px', border: '1px solid var(--border-color)', borderRadius: '0px', background: 'var(--bg-card)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'center', fontSize: '0.85em', whiteSpace: 'nowrap', color: 'var(--text-pure)' }}>
                    <thead style={{ background: 'var(--bg-input)', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <tr>
                            <th rowSpan={tieneMuestras ? 2 : 1} style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', width: '1%', whiteSpace: 'nowrap' }}>Simulación</th>
                            {tieneMuestras && (
                                <th colSpan={sampleCols.length} style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Muestra ( {renderKatex(`n = ${n}`)})</span>
                                </th>
                            )}
                            <th rowSpan={tieneMuestras ? 2 : 1} style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', width: '1%', whiteSpace: 'nowrap' }}>{estimacionLabel}</th>
                            {parametroVerdadero !== null && (
                                <th rowSpan={tieneMuestras ? 2 : 1} style={{ padding: '8px', borderBottom: '1px solid var(--border-color)', width: '1%', whiteSpace: 'nowrap' }}>{diferenciaLabel}</th>
                            )}
                        </tr>
                        {tieneMuestras && (
                            <tr>
                                {sampleCols.map((col, idx) => (
                                    <th key={idx} style={{ padding: '4px', borderBottom: '1px solid var(--border-color)', borderRight: idx === sampleCols.length - 1 ? '1px solid var(--border-color)' : 'none', color: 'var(--text-muted, #64748b)', fontWeight: 500, width: '40px' }}>
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {simsMostradas.map((s, index) => (
                            <tr key={s.simulacion} style={{ borderBottom: '1px solid var(--border-color)', background: index % 2 === 0 ? 'transparent' : 'var(--bg-input)' }}>
                                <td style={{ padding: '8px', borderRight: '1px solid var(--border-color)', fontWeight: 600 }}>{s.simulacion}</td>
                                
                                {tieneMuestras && sampleCols.map((col, idx) => (
                                    <td key={idx} style={{ padding: '4px', fontSize: '0.9em', color: col === '...' ? 'var(--text-muted)' : 'inherit', borderRight: idx === sampleCols.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                        {s.muestra ? renderSampleValue(s.muestra, col) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                                    </td>
                                ))}
                                
                                <td style={{ padding: '8px', fontWeight: 600, borderRight: '1px solid var(--border-color)' }}>{s.estimacion.toFixed(4)}</td>
                                {parametroVerdadero !== null && (
                                    <td style={{ padding: '8px', color: s.diferencia > 0 ? '#10b981' : '#ef4444' }}>
                                        {s.diferencia != null ? `${s.diferencia > 0 ? '+' : ''}${s.diferencia.toFixed(4)}` : '-'}
                                    </td>
                                )}
                            </tr>
                        ))}
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
                        Mostrar 10 más
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="13 17 18 12 13 7"></polyline>
                            <polyline points="6 17 11 12 6 7"></polyline>
                        </svg>
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
                        onClick={() => setLimiteVisible(10)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1.5px solid var(--border-color)', color: 'var(--text-muted, #64748b)', cursor: 'pointer', fontWeight: '600', padding: '8px 20px', borderRadius: '25px', transition: 'all 0.2s ease', fontSize: '0.85em' }}
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
