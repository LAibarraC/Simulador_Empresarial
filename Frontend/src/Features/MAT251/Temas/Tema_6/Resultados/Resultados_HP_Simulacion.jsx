import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cardStyle, FS, RADIUS } from '../../../Principal/Constantes';
import katex from 'katex';
import Grafico_HP_Simulacion from '../../../Graficas/Tema_6/Grafico_HP_Simulacion';
import Grafico_HP_SimulacionT from '../../../Graficas/Tema_6/Grafico_HP_SimulacionT';
import Grafico_HP_SimulacionVarianza from '../../../Graficas/Tema_6/Grafico_HP_SimulacionVarianza';
import * as XLSX from 'xlsx';
import { api } from '../../../../../services/api';
import { alerta } from '../../../../../utils/Notificaciones';
import { IconoGuardar, Descargar } from '../../../../../ui/iconos';

export default function Resultados_HP_Simulacion({ resultados, prueba }) {
    const [limiteVisible, setLimiteVisible] = useState(10);
    
    if (!resultados) return null;

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const isMediaZ = prueba === 'media_z' && resultados.historial;
    const isMediaT = prueba === 'media_t' && resultados.historial;
    const isProporcion = prueba === 'proporcion' && resultados.historial;
    const isVarianza = prueba === 'varianza' && resultados.historial;

    // --- ANIMATION STATE ---
    const [iteracionActual, setIteracionActual] = useState(0);
    const iteracionRef = useRef(0);
    const [simulacionEnCurso, setSimulacionEnCurso] = useState(false);
    const [simulacionPausada, setSimulacionPausada] = useState(false);
    const [velocidadSimulacion, setVelocidadSimulacion] = useState('1x');

    useEffect(() => {
        setLimiteVisible(10);
    }, [resultados, prueba]);

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

    // Live Data Slicing
    const historialVivo = (isMediaZ || isMediaT || isProporcion || isVarianza) ? resultados.historial.slice(0, iteracionActual) : [];
    const rechazosActuales = historialVivo.filter(sim => sim.decision === 'Rechazar H₀').length;
    const noRechazosActuales = iteracionActual - rechazosActuales;
    const porcentajeRechazosActual = iteracionActual > 0 ? (rechazosActuales / iteracionActual) * 100 : 0;
    const porcentajeNoRechazosActual = iteracionActual > 0 ? (noRechazosActuales / iteracionActual) * 100 : 0;

    const liveResultados = {
        ...resultados,
        historial: historialVivo,
        numSimulaciones: iteracionActual,
        rechazos: rechazosActuales,
        noRechazos: noRechazosActuales,
        porcentajeRechazos: porcentajeRechazosActual,
        porcentajeNoRechazos: porcentajeNoRechazosActual
    };

    const datosTabla = historialVivo.slice(0, limiteVisible);
    
    let isNullTrue = false;
    if (isMediaZ || isMediaT || isProporcion || isVarianza) {
        isNullTrue = isProporcion ? (resultados.parametrosGeneracion.pReal === resultados.parametrosPrueba.p0) : 
                     isVarianza ? (resultados.parametrosGeneracion.sigmaReal === resultados.parametrosPrueba.sigma02) :
                     (resultados.parametrosGeneracion.muReal === resultados.parametrosPrueba.mu0);
    }

    const tableHeaderStyle = { padding: '10px', background: 'var(--bg-input, #f1f5f9)', color: 'var(--text-pure)', fontWeight: 'bold', textAlign: 'center', borderBottom: '2px solid var(--border-color)', fontSize: '0.8rem', whiteSpace: 'nowrap' };
    const tableCellStyle = { padding: '0px', borderBottom: '1px solid var(--border-light, #f1f5f9)', color: 'var(--text-pure)', textAlign: 'center', fontSize:'0.8rem', whiteSpace: 'nowrap' };

    const n = resultados?.parametrosPrueba?.n || (datosTabla.length > 0 && datosTabla[0].muestras ? datosTabla[0].muestras.length : 0);
    const tieneMuestras = datosTabla.some(sim => sim.muestras && sim.muestras.length > 0);

    const sampleCols = useMemo(() => {
        if (!tieneMuestras || n === 0) return [];
        if (n <= 100) {
            return Array.from({ length: n }, (_, i) => i + 1);
        } else {
            return [1, 2, 3, '...', n - 2, n - 1, n];
        }
    }, [n, tieneMuestras]);

    const renderSampleValue = (muestra, colIdx) => {
        if (!muestra) return '-';
        if (colIdx === '...') return '...';
        const val = muestra[colIdx - 1]; // colIdx is 1-based
        if (val === undefined) return '-';
        return Number.isInteger(val) ? val : Number(val).toFixed(2);
    };

    const getExcelRows = () => resultados.historial.map((sim) => {
        const row = { 'Simulación': sim.iteracion };

        // Mantiene las muestras en columnas separadas, en el mismo orden que la tabla.
        if (tieneMuestras && sim.muestras) {
            sampleCols.forEach((col) => {
                row[col === '...' ? 'Muestra …' : `Muestra ${col}`] = renderSampleValue(sim.muestras, col);
            });
        }

        if (isProporcion) {
            row['Casos Favorables (x)'] = sim.x;
            row['Proporción Simulada (p̂)'] = sim.p_hat?.toFixed(3);
        } else if (isVarianza) {
            row['Varianza Simulada (S²)'] = sim.s !== undefined ? (sim.s * sim.s).toFixed(3) : '';
        } else {
            row['Media Simulada (x̄)'] = sim.x_bar?.toFixed(3);
        }

        if (isMediaT) row['Desviación Muestral (s)'] = sim.s?.toFixed(3) ?? '-';
        if (isVarianza) row['Grados de Libertad'] = n - 1;
        row[`Estadístico (${isMediaT ? 'T_c' : isVarianza ? 'χ²_c' : 'Z_c'})`] = sim.estadistico?.toFixed(3);
        row['p-Valor'] = sim.pValor?.toFixed(4);
        row['Decisión'] = sim.decision === 'Rechazar H₀' ? 'Rechazar H₀' : 'Aceptar H₀';
        return row;
    });

    const getExcelFileName = () => {
        const now = new Date();
        const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}h${String(now.getMinutes()).padStart(2, '0')}`;
        return `Simulacion_Hipotesis_${prueba}_${stamp}.xlsx`;
    };

    const createExcelWorkbook = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExcelRows());
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Simulación Hipótesis');
        return workbook;
    };

    const handleGuardarEnEspacio = async () => {
        if (!resultados.historial?.length) return;
        try {
            const excelBuffer = XLSX.write(createExcelWorkbook(), { bookType: 'xlsx', type: 'array' });
            const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const file = new File([new Blob([excelBuffer], { type: mimeType })], getExcelFileName(), { type: mimeType });
            const usuario = localStorage.getItem('usuario');
            const autor = usuario ? JSON.parse(usuario).nombre : 'Estudiante';
            const formData = new FormData();
            formData.append('file', file);
            formData.append('autor', autor);
            formData.append('visibilidad', 'personal');
            await api.subirArchivo(formData);
            alerta.success('¡Guardado exitoso!', 'La simulación se guardó en tu Espacio Personal.');
        } catch (error) {
            console.error('Error al guardar la simulación en el espacio personal:', error);
            alerta.error('Error', 'No se pudo guardar la simulación en tu Espacio Personal.');
        }
    };

    const handleDescargarExcel = () => {
        if (!resultados.historial?.length) return;
        XLSX.writeFile(createExcelWorkbook(), getExcelFileName());
    };

    const cardStyleBase = {
        padding: '6px', 
        borderRadius: '5px',
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    };

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
        <div style={{width: '100%', marginTop: '0px' }}>
            {/* CONTROLES DE SIMULACIÓN TIPO TEMA 5 */}
            {(isMediaZ || isMediaT || isProporcion || isVarianza) && (
                <>
                    <div id="tour-t6-hp-sim-progreso" style={{ marginTop: '0px', marginBottom: '5px', padding: '5px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', background: 'var(--primary-color)', width: `${(iteracionActual / resultados.historial.length) * 100}%`, transition: 'width 0.1s linear' }} />
                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: FS.sm, fontWeight: 700, color: 'var(--text-pure)' }}>Simulación: {iteracionActual} / {resultados.historial.length}</span>
                            
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'nowrap', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', padding: '3px', borderRadius: '5px', border: '1px solid var(--border-color)' }}>
                                    {['1x', '2x', '4x', 'MAX'].map(vel => (
                                        <button
                                            key={vel}
                                            type="button"
                                            onClick={() => setVelocidadSimulacion(vel)}
                                            style={{
                                                background: velocidadSimulacion === vel ? 'var(--primary-color)' : 'transparent',
                                                color: velocidadSimulacion === vel ? '#fff' : 'var(--text-pure)',
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

                    <div style={{ 
                        background: simulacionEnCurso ? 'rgba(245, 158, 11, 0.05)' : 'rgba(37, 99, 235, 0.05)', 
                        border: simulacionEnCurso ? '1px solid rgba(245, 158, 11, 0.2)' : '1px solid rgba(37, 99, 235, 0.2)', 
                        borderRadius: '8px', 
                        padding: '12px 18px', 
                        marginBottom: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                    }}>
                        <div style={{ color: simulacionEnCurso ? '#f59e0b' : 'var(--primary-color, #2563eb)' }}>
                            {simulacionEnCurso ? (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin-animation" style={{ animation: 'spin 2s linear infinite' }}>
                                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                                </svg>
                            ) : (
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                            )}
                        </div>
                        <div>
                            <h5 style={{ margin: '0 0 0px 0', color: simulacionEnCurso ? '#f59e0b' : 'var(--primary-color, #2563eb)', fontSize: '0.8rem', fontWeight: 600 }}>
                                {simulacionEnCurso ? 'Simulando Pruebas de Hipótesis...' : 'Simulación de Hipótesis completada'}
                            </h5>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-pure)' }}>
                                {simulacionEnCurso ? 'Generando y evaluando ' : 'Se evaluaron '}
                                <strong>{iteracionActual}</strong> {simulacionEnCurso ? `de ${resultados.historial.length} ` : ''} muestras.
                            </p>
                        </div>
                    </div>
                </>
            )}

            <div id="tour-t6-hp-sim-metricas" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                
                {/* Tarjeta: Rechazos */}
                <div 
                    style={{ ...cardStyleBase, background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.12) 100%)', border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.05)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', fontSize: '1rem', color: '#dc2626', fontWeight: 'bold', marginBottom: '4px' }}>
                        Rechazos {renderKatex('H_0')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-pure)', fontWeight: 'bold' }}>
                        {renderKatex(`${liveResultados.rechazos} \\Rightarrow ${liveResultados.porcentajeRechazos.toFixed(2)}\\%`)}
                    </div>
                </div>

                {/* Tarjeta: Aceptaciones */}
                <div 
                    style={{ ...cardStyleBase, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.12) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.05)' }}
                >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', fontSize: '1rem', color: '#059669', fontWeight: 'bold', marginBottom: '4px' }}>
                        Aceptaciones {renderKatex('H_0')}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-pure)', fontWeight: 'bold' }}>
                        {renderKatex(`${liveResultados.noRechazos} \\Rightarrow ${liveResultados.porcentajeNoRechazos.toFixed(2)}\\%`)}
                    </div>
                </div>
            </div>

            {(isMediaZ || isMediaT || isProporcion || isVarianza) && (
                <>
                    {/* Gráfica Principal Delegada a su propio componente */}
                    <div id="tour-t6-hp-sim-grafico">
                        {(isMediaZ || isProporcion) ? (
                            <Grafico_HP_Simulacion resultados={liveResultados} prueba={prueba} />
                        ) : isVarianza ? (
                            <Grafico_HP_SimulacionVarianza resultados={liveResultados} prueba={prueba} />
                        ) : (
                            <Grafico_HP_SimulacionT resultados={liveResultados} prueba={prueba} />
                        )}
                    </div>

                    {/* Caja de Conclusión Didáctica (Alerta de Error Tipo I) */}
                    {false && isNullTrue && (
                        <div style={{ marginBottom: '30px', padding: '15px 20px', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.4)', borderRadius: RADIUS, borderLeft: '4px solid #ca8a04' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: '#ca8a04', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                Alerta de Error Tipo I
                            </h4>
                            <p style={{ margin: 0, fontSize: FS.sm, color: 'var(--text-pure)', lineHeight: '1.6' }}>
                                Dado que la Hipótesis Nula configurada era matemáticamente cierta ({renderKatex(isProporcion ? `p = ${resultados.parametrosPrueba.p0}` : isVarianza ? `\\sigma^2 = ${resultados.parametrosPrueba.sigma02}` : `\\mu = ${resultados.parametrosPrueba.mu0}`)}), la teoría esperaba que se cometiera un Error Tipo I (Falso Positivo) en el <strong>{(resultados.parametrosPrueba.alpha * 100).toFixed(1)}%</strong> de los casos, por pura variabilidad del muestreo. En esta simulación de <strong>{liveResultados.numSimulaciones.toLocaleString()}</strong> iteraciones, el error ha ocurrido en el <strong>{liveResultados.porcentajeRechazos.toFixed(2)}%</strong> de las muestras.
                            </p>
                        </div>
                    )}

                    {/* Tabla de Registro (Historial de Simulaciones) */}
                    <div id="tour-t6-hp-sim-tabla" style={{ marginTop: '15px' }}>
                        <h5 style={{ margin: '0 0 15px 0', color: 'var(--text-pure)' }}>Historial de Simulaciones</h5>
                        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '400px', border: '1px solid var(--border-color)', borderRadius: '0px', background: 'var(--bg-card)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, textAlign: 'center', fontSize: '0.85em', whiteSpace: 'nowrap', color: 'var(--text-pure)' }}>
                                <thead style={{ background: 'var(--bg-input)', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <tr>
                                        <th rowSpan={tieneMuestras ? 2 : 1} style={{...tableHeaderStyle, borderRight: tieneMuestras ? '1px solid var(--border-color)' : 'none', width: '1%', whiteSpace: 'nowrap'}}>Simulación</th>
                                        {tieneMuestras && (
                                            <th colSpan={sampleCols.length} style={{...tableHeaderStyle, borderRight: '1px solid var(--border-color)'}}>
                                                Muestra ({renderKatex(`n = ${n}`)})
                                            </th>
                                        )}
                                        <th rowSpan={tieneMuestras ? 2 : 1} style={{...tableHeaderStyle, width: '1%'}}>
                                            {isProporcion ? <>Casos Favorables ({renderKatex('x')})</> : 
                                             isVarianza ? <>Varianza Simulada ({renderKatex('S^2')})</> :
                                             <>Media Simulada ({renderKatex('\\bar{x}')})</>}
                                        </th>
                                        {isProporcion && (
                                            <th rowSpan={tieneMuestras ? 2 : 1} style={{...tableHeaderStyle, width: '1%'}}>Proporción Simulada ({renderKatex('\\hat{p}')})</th>
                                        )}
                                        {isMediaT && (
                                            <th rowSpan={tieneMuestras ? 2 : 1} style={{...tableHeaderStyle, width: '1%'}}>Desviación Muestral ({renderKatex('s')})</th>
                                        )}
                                        {isVarianza && (
                                            <th rowSpan={tieneMuestras ? 2 : 1} style={{...tableHeaderStyle, width: '1%'}}>Grados de Libertad</th>
                                        )}
                                        <th rowSpan={tieneMuestras ? 2 : 1} style={{...tableHeaderStyle, width: '1%'}}>Estadístico ({renderKatex(isMediaT ? 'T_c' : isVarianza ? '\\chi^2_c' : 'Z_c')})</th>
                                        <th rowSpan={tieneMuestras ? 2 : 1} style={{...tableHeaderStyle, width: '1%'}}>p-Valor</th>
                                        <th rowSpan={tieneMuestras ? 2 : 1} style={{...tableHeaderStyle, width: '1%'}}>Decisión</th>
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
                                </thead>
                                <tbody>
                                    {datosTabla.map((sim, idx) => {
                                        const isRechazo = sim.decision === 'Rechazar H₀';
                                        return (
                                            <tr key={sim.iteracion} style={{ background: idx % 2 === 0 ? 'var(--bg-input)' : 'var(--bg-card)', transition: 'background 0.2s', height: '30px' }}>
                                                <td style={{...tableCellStyle, borderRight: tieneMuestras ? '1px solid var(--border-color)' : 'none', fontWeight: 600}}>{sim.iteracion}</td>
                                                
                                                {tieneMuestras && sampleCols.map((col, idxCol) => (
                                                    <td key={idxCol} style={{ ...tableCellStyle, padding: '4px 10px', fontSize: '0.8rem', color: col === '...' ? 'var(--text-muted)' : 'inherit', borderRight: idxCol === sampleCols.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                                                        {sim.muestras ? renderSampleValue(sim.muestras, col) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                                                    </td>
                                                ))}

                                                <td style={tableCellStyle}>
                                                    {isProporcion ? sim.x : 
                                                     isVarianza ? (sim.s * sim.s)?.toFixed(3) : 
                                                     sim.x_bar?.toFixed(3)}
                                                </td>
                                                {isProporcion && <td style={tableCellStyle}>{sim.p_hat?.toFixed(3)}</td>}
                                                {isMediaT && <td style={tableCellStyle}>{sim.s ? sim.s.toFixed(3) : '-'}</td>}
                                                {isVarianza && <td style={tableCellStyle}>{n - 1}</td>}
                                                <td style={tableCellStyle}>{sim.estadistico?.toFixed(3)}</td>
                                                <td style={tableCellStyle}>{sim.pValor?.toFixed(4)}</td>
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

                        <div style={{ display: 'flex', gap: '15px', marginTop: '20px', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
                            {limiteVisible < historialVivo.length && (
                                <button
                                    type="button"
                                    onClick={() => setLimiteVisible(prev => Math.min(prev + 10, historialVivo.length))}
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
                            {limiteVisible < historialVivo.length && limiteVisible + 10 < historialVivo.length && (
                                <button
                                    type="button"
                                    onClick={() => setLimiteVisible(prev => Math.min(prev + 50, historialVivo.length))}
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
                                    style={{ ...estiloBotonMostrarMas, border: '1.5px solid var(--border-color)', color: 'var(--text-muted, #64748b)', borderRadius: '25px', padding: '8px 20px' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-input)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted, #64748b)'; }}
                                >
                                    Restablecer a 10
                                </button>
                            )}
                        </div>
                    </div>
                    <div id="tour-t6-hp-sim-acciones" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
                        <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '5px 14px', fontSize: FS.sm, fontWeight: 600, fontFamily: 'inherit', borderRadius: RADIUS }}
                            onClick={handleGuardarEnEspacio}
                            disabled={!resultados.historial.length}
                        >
                            <IconoGuardar /> Guardar
                        </button>
                        <button
                            type="button"
                            className="btn-verde"
                            style={{ padding: '5px 14px', fontSize: FS.sm, fontWeight: 600, fontFamily: 'inherit', borderRadius: RADIUS }}
                            onClick={handleDescargarExcel}
                            disabled={!resultados.historial.length}
                        >
                            <Descargar width="18" height="18" /> Descargar (.xlsx)
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
