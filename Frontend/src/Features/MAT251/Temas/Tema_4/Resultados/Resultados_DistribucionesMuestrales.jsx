import React, { useState, useEffect, useRef } from 'react';
import { FONT, FS, RADIUS, cardStyle, labelStyle } from '../../../Principal/Constantes';
import { EditarDatos } from '../../../../../ui/iconos';
import Latex from '../../../../../components/excel/Latex';
import Skeleton from '../../../../../ui/Skeleton';
import StatLabel from '../../../ui/StatLabel';
import ModalAlerta from '../../../ui/ModalAlerta';
import '../../../styles/Temas/Tema4.css';

export default function Resultados_DistribucionesMuestrales({ varSeleccionada, filas, abrirEditor, configuracion, onEditar, onGenerar, resultado }) {
    const n = configuracion.n;
    const setN = valor => onEditar('n', valor);
    const conReemplazo = configuracion.conReemplazo;
    const setConReemplazo = valor => onEditar('conReemplazo', valor);
    const parametroCalculo = configuracion.parametroCalculo;
    const setParametroCalculo = valor => onEditar('parametroCalculo', valor);
    const atributoExito = configuracion.atributoExito || String(filas?.find(fila => String(fila.valor ?? '').trim())?.valor ?? '').trim();
    const setAtributoExito = valor => onEditar('atributoExito', valor);
    const [isOpenParamSelect, setIsOpenParamSelect] = useState(false);
    const paramSelectRef = useRef(null);
    const [isOpenAtributoSelect, setIsOpenAtributoSelect] = useState(false);
    const atributoSelectRef = useRef(null);
    const resDistMuestrales = resultado;
    const [paginaActual, setPaginaActual] = useState(1);
    const cargando = false;
    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Atención', tipo: 'warning' });
    const filasPorPagina = 10;
    useEffect(() => { setPaginaActual(1); }, [resultado]);

    const mostrarAlerta = (mensaje, titulo = 'Atención', tipo = 'warning') => {
        setModalAlerta({ isOpen: true, mensaje, titulo, tipo });
    };

    // Cerrar los selectores personalizados al hacer clic fuera
    useEffect(() => {
        const handler = (e) => {
            if (paramSelectRef.current && !paramSelectRef.current.contains(e.target)) {
                setIsOpenParamSelect(false);
            }
            if (atributoSelectRef.current && !atributoSelectRef.current.contains(e.target)) {
                setIsOpenAtributoSelect(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const esMultiColumna = Boolean(
        (varSeleccionada?.nombresColumnas && varSeleccionada.nombresColumnas.length > 1) ||
        (varSeleccionada?.tipo && varSeleccionada.tipo.toLowerCase().includes('mixta')) ||
        filas?.some(f => (f.valor || '').toString().includes(' | '))
    );

    const filasValidas = filas?.filter(f => (f.valor || '').toString().trim() !== '') || [];

    const ejecutar = () => {
        if (esMultiColumna) { mostrarAlerta('La variable debe tener 1 sola columna.'); return; }
        const calculo = onGenerar();
        if (calculo.error) mostrarAlerta(calculo.error);
        else setPaginaActual(1);
    };

    // Lógica de Paginación
    const totalDatos = resDistMuestrales?.resultado?.length || 0;
    const totalPaginas = Math.ceil(totalDatos / filasPorPagina);
    const indexOfLastFila = paginaActual * filasPorPagina;
    const indexOfFirstFila = indexOfLastFila - filasPorPagina;
    const filasPaginadas = (resDistMuestrales?.resultado || []).slice(indexOfFirstFila, indexOfLastFila);

    // Cálculos teóricos con redondeo estándar para conclusiones
    const calcFinal = resDistMuestrales?.calculosFinales;
    const nVal = calcFinal ? Number(calcFinal.n) : 1;
    const NVal = calcFinal ? Number(calcFinal.N) : 1;
    const factorCorr = (calcFinal && !calcFinal.conReemplazo && NVal > 1) ? ((NVal - nVal) / (NVal - 1)) : 1;
    const varianzaTeoricaMedia = calcFinal ? ((Number(calcFinal.varianzaPoblacional) / nVal) * factorCorr) : 0;
    const varianzaTeoricaMediaStr = Number(varianzaTeoricaMedia).toFixed(2);

    const pPob = calcFinal ? Number(calcFinal.proporcionPoblacional) : 0;
    const varianzaTeoricaProp = calcFinal ? (((pPob * (1 - pPob)) / nVal) * factorCorr) : 0;
    const varianzaTeoricaPropStr = Number(varianzaTeoricaProp).toFixed(6);

    return (
        <div style={{ fontFamily: FONT, display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', marginTop: '0px' }}>
            {/* ── DATOS Y EDITAR DATOS (Barra de Datos Canónica) ── */}
            <div id="tour-t4-datos-resumen" style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div>
                    <span style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)' }}>Datos:</span>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                        <small title="Datos provenientes de variables externas" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                            Cargados: <strong style={{ color: 'var(--text-pure)' }}>{filasValidas.filter(f => f.origen === 'cargado').length}</strong>
                        </small>
                        <small title="Datos ingresados manualmente" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                            Agregados: <strong style={{ color: 'var(--text-pure)' }}>{filasValidas.filter(f => f.origen === 'agregado').length}</strong>
                        </small>
                        <small title="Total de datos válidos" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                            Total: <strong style={{ color: 'var(--text-pure)' }}>{filasValidas.length}</strong>
                        </small>
                    </div>
                </div>
                <button
                    id="tour-t4-btn-editar-datos"
                    onClick={abrirEditor}
                    className="btn-primary"
                    style={{ padding: '5px 14px', fontSize: FS.sm, fontFamily: FONT, borderRadius: RADIUS, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, cursor: 'pointer', border: 'none' }}
                >
                    <EditarDatos />
                    Editar Datos
                </button>
            </div>

            {/* Controles */}
            <div>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end', background: 'var(--bg-input)', padding: '12px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                    <div id="tour-t4-parametro-calculo" style={{ flex: '1 1 200px', textAlign: 'center' }}>
                        <label style={labelStyle}>Parámetro a Calcular:</label>
                        <div ref={paramSelectRef} style={{ position: 'relative', width: '100%', fontFamily: FONT }}>
                            <div
                                onClick={() => setIsOpenParamSelect(o => !o)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '8px 12px',
                                    minHeight: '38px',
                                    boxSizing: 'border-box',
                                    background: 'var(--bg-card)',
                                    border: `1px solid ${isOpenParamSelect ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                    borderRadius: RADIUS,
                                    cursor: 'pointer',
                                    boxShadow: isOpenParamSelect ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
                                    transition: 'all 0.2s ease',
                                    color: 'var(--text-pure)',
                                    userSelect: 'none',
                                }}
                            >
                                <span style={{ fontWeight: 400, fontSize: FS.sm }}>
                                    {parametroCalculo === 'media' ? 'Promedios (Normal)' : (parametroCalculo === 'varianza' ? 'Varianzas (Chi-cuadrada)' : 'Proporciones')}
                                </span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    style={{ transform: isOpenParamSelect ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', color: 'var(--text-muted)', flexShrink: 0 }}>
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>

                            {isOpenParamSelect && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: RADIUS,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                                    zIndex: 1000,
                                    overflow: 'hidden',
                                    animation: 'fadeInDropdown 0.2s ease',
                                    textAlign: 'left',
                                }}>
                                    {[
                                        { id: 'media', label: 'Promedios (Normal)' },
                                        { id: 'proporcion', label: 'Proporciones' },
                                        { id: 'varianza', label: 'Varianzas (Chi-cuadrada)' }
                                    ].map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => {
                                                setParametroCalculo(item.id);
                                                setIsOpenParamSelect(false);
                                            }}
                                            style={{
                                                padding: '9px 12px',
                                                fontSize: FS.sm,
                                                cursor: 'pointer',
                                                background: parametroCalculo === item.id ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                                                color: parametroCalculo === item.id ? 'var(--primary-color)' : 'var(--text-pure)',
                                                fontWeight: parametroCalculo === item.id ? 600 : 400,
                                                fontFamily: FONT,
                                                textAlign: 'left',
                                                transition: 'background 0.2s',
                                            }}
                                            onMouseEnter={(e) => { if (parametroCalculo !== item.id) e.currentTarget.style.background = 'var(--bg-input, rgba(0,0,0,0.04))'; }}
                                            onMouseLeave={(e) => { if (parametroCalculo !== item.id) e.currentTarget.style.background = 'transparent'; }}
                                        >
                                            {item.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {parametroCalculo === 'proporcion' && (
                        <div id="tour-t4-atributo-exito" style={{ flex: '1 1 200px', textAlign: 'center' }}>
                            <label style={labelStyle}>Atributo de Éxito:</label>
                            <div ref={atributoSelectRef} style={{ position: 'relative', width: '100%', fontFamily: FONT }}>
                                <div
                                    onClick={() => setIsOpenAtributoSelect(o => !o)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '8px 12px',
                                        minHeight: '38px',
                                        boxSizing: 'border-box',
                                        background: 'var(--bg-card)',
                                        border: `1px solid ${isOpenAtributoSelect ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                        borderRadius: RADIUS,
                                        cursor: 'pointer',
                                        boxShadow: isOpenAtributoSelect ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
                                        transition: 'all 0.2s ease',
                                        color: 'var(--text-pure)',
                                        userSelect: 'none',
                                    }}
                                >
                                    <span style={{ fontWeight: 400, fontSize: FS.sm }}>
                                        {atributoExito || '-- Seleccionar --'}
                                    </span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                        style={{ transform: isOpenAtributoSelect ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', color: 'var(--text-muted)', flexShrink: 0 }}>
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>

                                {isOpenAtributoSelect && (
                                    <div style={{
                                        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: RADIUS,
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                                        zIndex: 1000,
                                        overflow: 'hidden',
                                        maxHeight: '220px',
                                        overflowY: 'auto',
                                        animation: 'fadeInDropdown 0.2s ease',
                                        textAlign: 'left',
                                    }}>
                                        {[...new Set(filasValidas.map(f => {
                                            const val = (f.valor || '').toString().trim();
                                            return val.includes(' | ') ? val.split(' | ')[0].trim() : val;
                                        }))].filter(Boolean).map(u => (
                                            <div
                                                key={u}
                                                onClick={() => {
                                                    setAtributoExito(u);
                                                    setIsOpenAtributoSelect(false);
                                                }}
                                                style={{
                                                    padding: '9px 12px',
                                                    fontSize: FS.sm,
                                                    cursor: 'pointer',
                                                    background: atributoExito === u ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                                                    color: atributoExito === u ? 'var(--primary-color)' : 'var(--text-pure)',
                                                    fontWeight: atributoExito === u ? 600 : 400,
                                                    fontFamily: FONT,
                                                    textAlign: 'left',
                                                    transition: 'background 0.2s',
                                                }}
                                                onMouseEnter={(e) => { if (atributoExito !== u) e.currentTarget.style.background = 'var(--bg-input, rgba(0,0,0,0.04))'; }}
                                                onMouseLeave={(e) => { if (atributoExito !== u) e.currentTarget.style.background = 'transparent'; }}
                                            >
                                                {u}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div id="tour-t4-tamano-muestra" style={{ flex: '1 1 200px', textAlign: 'center' }}>
                        <label style={labelStyle}>Tamaño de la Muestra (n):</label>
                        <input
                            type="number"
                            value={n}
                            onChange={e => {
                                setN(e.target.value);
                            }}
                            min={parametroCalculo === 'varianza' ? "2" : "1"}
                            placeholder={parametroCalculo === 'varianza' ? "Ej. 2 (mín. 2)" : "Ej. 2"}
                            className="input-mat251 placeholder-small"
                            style={{
                                width: '100%',
                                borderRadius: RADIUS,
                                padding: '8px 12px',
                                fontSize: FS.sm,
                                border: '1px solid var(--border-color)',
                                boxSizing: 'border-box',
                                minHeight: '38px',
                                background: 'var(--bg-card)',
                                color: 'var(--text-pure)',
                                fontFamily: FONT,
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div id="tour-t4-tipo-muestreo" style={{ flex: '1 1 200px', textAlign: 'center' }}>
                        <label style={labelStyle}>Tipo de Muestreo:</label>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div className="contenedor-selector-modos-mat251" style={{ display: 'inline-flex', alignItems: 'center', minHeight: '38px', boxSizing: 'border-box' }}>
                                <button
                                    type="button"
                                    className={`btn-mat251-modo ${conReemplazo ? 'active' : ''}`}
                                    onClick={() => {
                                        setConReemplazo(true);
                                    }}
                                    style={{ fontFamily: FONT, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 14px', fontSize: FS.sm, fontWeight: 600 }}
                                >
                                    Con Reemplazo
                                </button>
                                <button
                                    type="button"
                                    className={`btn-mat251-modo ${!conReemplazo ? 'active' : ''}`}
                                    onClick={() => {
                                        setConReemplazo(false);
                                    }}
                                    style={{ fontFamily: FONT, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 14px', fontSize: FS.sm, fontWeight: 600 }}
                                >
                                    Sin Reemplazo
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '0px' }}>
                        <button
                            id="tour-t4-btn-calcular"
                            type="button"
                            onClick={ejecutar}
                            disabled={cargando}
                            className="button_calcular"
                            style={{
                                width: 'fit-content',
                                padding: '5px 20px',
                                borderRadius: RADIUS,
                                fontSize: FS.md,
                                fontWeight: 'bold',
                                fontFamily: FONT,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: cargando ? 'not-allowed' : 'pointer',
                                opacity: cargando ? 0.6 : 1
                            }}
                        >
                            {cargando ? 'CALCULANDO...' : 'CALCULAR'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Resultados */}
            {resDistMuestrales && !resDistMuestrales.error && (
                <div>
                    {(() => {
                        const parametroCalculado = resDistMuestrales.calculosFinales?.parametroCalculo || 'media';
                        return (
                            <>
                                <h4 style={{ color: 'var(--text-pure)', margin: '0 0 10px 0', fontSize: FS.sm, fontWeight: 700, fontFamily: FONT, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    {parametroCalculado === 'varianza' ? (
                                        <>Muestras Posibles y Varianzas Muestrales <Latex formula="(S^2)" /></>
                                    ) : parametroCalculado === 'media' ? (
                                        <>Muestras Posibles y Medias Muestrales <Latex formula="(\bar{X})" /></>
                                    ) : (
                                        <>Muestras Posibles y Proporciones Muestrales <Latex formula="(\hat{p})" /></>
                                    )}
                                </h4>

                                {cargando ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                                        <Skeleton height="40px" borderRadius={RADIUS} />
                                        <Skeleton height="50px" borderRadius={RADIUS} />
                                        <Skeleton height="50px" borderRadius={RADIUS} />
                                        <Skeleton height="50px" borderRadius={RADIUS} />
                                        <Skeleton height="50px" borderRadius={RADIUS} />
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ textAlign: 'center', marginBottom: '15px', fontSize: FS.sm, color: 'var(--text-pure)', fontFamily: FONT }}>
                                            Total Muestras: <strong style={{ color: 'var(--text-pure)' }}>{resDistMuestrales.resultado?.length || 0}</strong>
                                        </div>

                                        {resDistMuestrales.resultado?.length <= 5000 && (
                                            <div id="tour-t4-tabla-muestras" className="thin-scrollbar" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
                                                    <table className="tabla-academica" style={{ width: '100%', margin: 0, borderCollapse: 'collapse', textAlign: 'center', fontFamily: FONT, whiteSpace: 'nowrap' }}>
                                                        <thead>
                                                            <tr>
                                                                <th style={{ padding: '8px 10px', background: 'var(--bg-input)', color: 'var(--text-pure)', border: '1px solid var(--text-pure)', fontFamily: FONT, fontSize: FS.sm, fontWeight: 'bold', whiteSpace: 'nowrap' }}>Nº Muestra</th>
                                                                <th style={{ padding: '8px 10px', background: 'var(--bg-input)', color: 'var(--text-pure)', border: '1px solid var(--text-pure)', fontFamily: FONT, fontSize: FS.sm, fontWeight: 'bold', whiteSpace: 'nowrap' }}><Latex formula={`n = ${n}`} /></th>
                                                                <th style={{ padding: '8px 10px', background: 'var(--bg-input)', color: 'var(--text-pure)', border: '1px solid var(--text-pure)', fontFamily: FONT, fontSize: FS.sm, fontWeight: 'bold', whiteSpace: 'nowrap' }}>Valores</th>
                                                                <th style={{ padding: '8px 10px', background: 'var(--bg-input)', color: 'var(--text-pure)', border: '1px solid var(--text-pure)', fontFamily: FONT, fontSize: FS.sm, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                                                    <StatLabel
                                                                        formulaKey={parametroCalculado === 'media' ? "x_barra" : (parametroCalculado === 'varianza' ? "s2" : "p_sombrero")}
                                                                        formulaLatex={parametroCalculado === 'media' ? "\\bar{x}" : (parametroCalculado === 'varianza' ? "S^2" : "\\hat{p}")}
                                                                        align="center"
                                                                    />
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody style={{ fontSize: FS.sx }}>
                                                            {filasPaginadas.map((fila) => (
                                                                <tr key={fila.id}>
                                                                    <td style={{ padding: '6px 8px', fontWeight: 600, color: 'var(--text-pure)', border: '1px solid var(--text-pure)', fontSize: FS.sx, whiteSpace: 'nowrap' }}>
                                                                        <Latex formula={`${fila.id}`} />
                                                                    </td>
                                                                    <td style={{ padding: '6px 8px', fontWeight: 'bold', color: 'var(--text-pure)', border: '1px solid var(--text-pure)', fontSize: FS.sx, whiteSpace: 'nowrap' }}>
                                                                        {fila.elementos}
                                                                    </td>
                                                                    <td style={{ padding: '6px 8px', color: 'var(--text-pure)', border: '1px solid var(--text-pure)', fontSize: FS.sx, whiteSpace: 'nowrap' }}>
                                                                        <Latex formula={typeof fila.valores === 'string' ? fila.valores.trim().split(/\s+/).join('\\quad ') : `${fila.valores}`} />
                                                                    </td>
                                                                    <td style={{ padding: '6px 8px', color: 'var(--text-pure)', fontWeight: 'normal', border: '1px solid var(--text-pure)', fontSize: FS.sx, whiteSpace: 'nowrap' }}>
                                                                        <Latex formula={`${parametroCalculado === 'media' ? Number(fila.media).toFixed(2) : (parametroCalculado === 'varianza' ? Number(fila.varianza).toFixed(2) : Number(fila.proporcion).toFixed(4))}`} />
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}

                                            {/* Controles de Paginación */}
                                            {totalPaginas > 1 && resDistMuestrales.resultado?.length <= 5000 && (
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '15px', fontSize: FS.sm }}>
                                                    <button
                                                        type="button"
                                                        disabled={paginaActual === 1}
                                                        onClick={() => setPaginaActual(paginaActual - 1)}
                                                        className="btn-outline-primary"
                                                        style={{ padding: '5px 16px', borderRadius: RADIUS, fontSize: FS.sm, fontFamily: FONT }}
                                                    >
                                                        Anterior
                                                    </button>
                                                    <span style={{ fontWeight: 600, color: 'var(--text-pure)' }}>
                                                        Página {paginaActual} de {totalPaginas}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        disabled={paginaActual === totalPaginas}
                                                        onClick={() => setPaginaActual(paginaActual + 1)}
                                                        className="btn-outline-primary"
                                                        style={{ padding: '5px 16px', borderRadius: RADIUS, fontSize: FS.sm, fontFamily: FONT }}
                                                    >
                                                        Siguiente
                                                    </button>
                                                </div>
                                            )}

                                            {/* Nueva Tabla de Distribución Muestral */}
                                            {resDistMuestrales.distribucion && (
                                                <div id="tour-t4-tabla-distribucion" style={{ marginTop: '25px' }}>
                                                    <div className="tema4-titulo-seccion" style={{ color: 'var(--text-pure)', margin: '0 0 12px 0', fontFamily: FONT, textAlign: 'center' }}>
                                                        Distribución Muestral de {parametroCalculado === 'media' ? 'Medias' : (parametroCalculado === 'varianza' ? 'Varianzas' : 'Proporciones')}
                                                    </div>
                                                    <div className="tema4-distribucion-tabla-wrapper thin-scrollbar" style={{ background: 'transparent', border: 'none', overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', marginBottom: '20px' }}>
                                                        <table style={{ width: '100%', margin: 0, borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'center', whiteSpace: 'nowrap', fontFamily: FONT }}>
                                                            <tbody>
                                                                <tr>
                                                                    <td style={{ padding: '8px 16px', fontWeight: 600, border: '1px solid var(--text-pure)', background: 'var(--bg-input)', color: 'var(--text-pure)', minWidth: '90px', fontSize: '0.8rem', verticalAlign: 'middle' }}>
                                                                        <Latex formula={parametroCalculado === 'media' ? "\\bar{X}" : (parametroCalculado === 'varianza' ? "S^2" : "\\hat{p}")} />
                                                                    </td>
                                                                    {resDistMuestrales.distribucion.map((d, i) => (
                                                                        <td key={i} style={{ padding: '8px 14px', fontSize: '0.8rem', color: 'var(--text-pure)', fontWeight: 'normal', border: '1px solid var(--text-pure)', verticalAlign: 'middle' }}>
                                                                            <Latex formula={`${d.valor}`} />
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                                <tr>
                                                                    <td style={{ padding: '8px 16px', fontWeight: 600, border: '1px solid var(--text-pure)', background: 'var(--bg-input)', color: 'var(--text-pure)', minWidth: '90px', fontSize: '0.8rem', verticalAlign: 'middle' }}>
                                                                        <Latex formula={parametroCalculado === 'media' ? "P(\\bar{X} = \\bar{x}_i) = p_i" : (parametroCalculado === 'varianza' ? "P(S^2 = S_i^2) = p_i" : "P(\\hat{p} = \\hat{p}_i) = p_i")} />
                                                                    </td>
                                                                    {resDistMuestrales.distribucion.map((d, i) => (
                                                                        <td key={i} style={{ padding: '8px 14px', fontSize: '0.8rem', color: 'var(--text-pure)', border: '1px solid var(--text-pure)', verticalAlign: 'middle' }}>
                                                                            <Latex formula={`\\dfrac{${d.frecuencia}}{${d.total}}`} />
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Conclusión y Cálculos Finales */}
                                            {resDistMuestrales.calculosFinales && (
                                                <div style={{ marginTop: '20px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '15px' }}>
                                                        {parametroCalculado === 'media' ? (
                                                            <>
                                                                <div id="tour-t4-esperanza-muestral">
                                                                    <div className="tema4-titulo-seccion" style={{ margin: '10px 0 0px 0', textAlign: 'center', color: 'var(--text-pure)', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                                        Esperanza Muestral <Latex formula="E(\bar{X})" />
                                                                    </div>
                                                                    <div className="thin-scrollbar" style={{ padding: '10px 15px 4px 15px', background: 'var(--bg-input)', borderRadius: RADIUS, border: '1px solid var(--border-color)', color: 'var(--text-pure)', overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                                                                        <Latex formula={`\\begin{aligned} E(\\bar{X}) &= \\sum_{i=1}^{${resDistMuestrales.distribucion.length}} \\bar{x}_i p_i \\\\ &= ${resDistMuestrales.distribucion.map(d => `\\frac{${d.frecuencia}}{${d.total}}(${Number(d.valor).toFixed(2)})`).join(' + ')} = ${Number(resDistMuestrales.calculosFinales.esperanza).toFixed(2)} \\end{aligned}`} />
                                                                    </div>
                                                                    <div style={{ color: 'var(--text-pure)', marginTop: '5px', marginBottom: '5px', textAlign: 'center', fontSize:'0.75rem' }}>
                                                                        Obsérvese que: <Latex formula={`E(\\bar{X}) = \\mu = ${Number(resDistMuestrales.calculosFinales.mediaPoblacional).toFixed(2)}`} />
                                                                    </div>
                                                                </div>

                                                                <div id="tour-t4-varianza-muestral">
                                                                    <div className="tema4-titulo-seccion" style={{ margin: '10px 0 0px 0', textAlign: 'center', color: 'var(--text-pure)', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                                        Varianza Muestral <Latex formula="V(\bar{X})" />
                                                                    </div>
                                                                    <div className="thin-scrollbar" style={{ padding: '10px 15px 4px 15px', background: 'var(--bg-input)', borderRadius: RADIUS, border: '1px solid var(--border-color)', color: 'var(--text-pure)', overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                                                                        <Latex formula={`\\begin{aligned} V(\\bar{X}) &= \\sum_{i=1}^{${resDistMuestrales.distribucion.length}} (\\bar{x}_i - E(\\bar{X}))^2 p_i \\\\ &= ${resDistMuestrales.distribucion.map(d => `\\frac{${d.frecuencia}}{${d.total}}(${Number(d.valor).toFixed(2)} - ${Number(resDistMuestrales.calculosFinales.esperanza).toFixed(2)})^2`).join(' + ')} = ${Number(resDistMuestrales.calculosFinales.varianzaDeDistribucion).toFixed(2)} \\end{aligned}`} />
                                                                    </div>
                                                                    <div style={{ color: 'var(--text-pure)', marginTop: '5px', textAlign: 'center', fontSize:'0.75rem' }}>
                                                                        Obsérvese que: <Latex formula={`V(\\bar{X}) = \\frac{\\sigma^2}{n} ${!resDistMuestrales.calculosFinales.conReemplazo ? '\\left(\\frac{N-n}{N-1}\\right)' : ''} = \\frac{${Number(resDistMuestrales.calculosFinales.varianzaPoblacional).toFixed(2)}}{${resDistMuestrales.calculosFinales.n}} ${!resDistMuestrales.calculosFinales.conReemplazo ? `\\left(\\frac{${resDistMuestrales.calculosFinales.N}-${resDistMuestrales.calculosFinales.n}}{${resDistMuestrales.calculosFinales.N}-1}\\right)` : ''} = ${varianzaTeoricaMediaStr}`} />
                                                                    </div>
                                                                </div>

                                                                <div id="tour-t4-distribucion-aproximada">
                                                                    <div className="tema4-titulo-seccion" style={{ margin: '10px 0 0px 0', textAlign: 'center', color: 'var(--text-pure)', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        Distribución Normal Aproximada
                                                                    </div>
                                                                    <div style={{ marginTop: '0px', padding: '12px 15px', background: 'var(--bg-input)', borderRadius: RADIUS, border: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-pure)' }}>
                                                                        <Latex formula={`\\bar{X} \\sim N(${Number(resDistMuestrales.calculosFinales.esperanza).toFixed(2)} ; ${varianzaTeoricaMediaStr})`} />
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : parametroCalculado === 'varianza' ? (
                                                            <>
                                                                <div id="tour-t4-esperanza-muestral">
                                                                    <div className="tema4-titulo-seccion" style={{ margin: '10px 0 0px 0', textAlign: 'center', color: 'var(--text-pure)', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                                        Varianza Poblacional <Latex formula="(\sigma^2)" />
                                                                    </div>
                                                                    <div style={{ padding: '12px 15px', background: 'var(--bg-input)', borderRadius: RADIUS, border: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-pure)' }}>
                                                                        <Latex formula={`\\sigma^2 = \\frac{\\sum (x_i - \\mu)^2}{N} = ${Number(resDistMuestrales.calculosFinales.varianzaPoblacional).toFixed(4)}`} />
                                                                    </div>
                                                                </div>

                                                                <div id="tour-t4-varianza-muestral">
                                                                    <div className="tema4-titulo-seccion" style={{ margin: '10px 0 0px 0', textAlign: 'center', color: 'var(--text-pure)', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                                        Esperanza de la Varianza Muestral <Latex formula="E(S^2)" />
                                                                    </div>
                                                                    <div className="thin-scrollbar" style={{ padding: '10px 15px 4px 15px', background: 'var(--bg-input)', borderRadius: RADIUS, border: '1px solid var(--border-color)', color: 'var(--text-pure)', overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                                                                        <Latex formula={`\\begin{aligned} E(S^2) &= \\sum_{i=1}^{${resDistMuestrales.distribucion.length}} S_i^2 P(S_i^2) \\\\ &= ${resDistMuestrales.distribucion.map(d => `\\frac{${d.frecuencia}}{${d.total}}(${Number(d.valor).toFixed(4)})`).join(' + ')} = ${Number(resDistMuestrales.calculosFinales.esperanza).toFixed(4)} \\end{aligned}`} />
                                                                    </div>
                                                                    <div style={{ color: 'var(--text-pure)', marginTop: '5px', textAlign: 'center', fontSize: '0.75rem' }}>
                                                                        Obsérvese que: <Latex formula={`E(S^2) = \\sigma^2 = ${Number(resDistMuestrales.calculosFinales.varianzaPoblacional).toFixed(4)}`} />
                                                                    </div>
                                                                </div>

                                                                <div id="tour-t4-distribucion-aproximada">
                                                                    <div className="tema4-titulo-seccion" style={{ margin: '10px 0 0px 0', textAlign: 'center', color: 'var(--text-pure)', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        Distribución Chi-cuadrada
                                                                    </div>
                                                                    <div style={{ marginTop: '0px', padding: '12px 15px', background: 'var(--bg-input)', borderRadius: RADIUS, border: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-pure)' }}>
                                                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                                                                            La variable aleatoria sigue una distribución Chi-cuadrada con <Latex formula={`n-1 = ${resDistMuestrales.calculosFinales.n}-1 = ${resDistMuestrales.calculosFinales.n - 1}`} /> grados de libertad:
                                                                        </div>
                                                                        <Latex formula={`\\frac{(${resDistMuestrales.calculosFinales.n}-1)S^2}{\\sigma^2} \\sim \\chi^2_{${resDistMuestrales.calculosFinales.n}-1}`} />
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div id="tour-t4-esperanza-muestral">
                                                                    <div className="tema4-titulo-seccion" style={{ margin: '10px 0 0px 0', textAlign: 'center', color: 'var(--text-pure)', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                                        Esperanza Muestral <Latex formula="E(\hat{p})" />
                                                                    </div>
                                                                    <div className="thin-scrollbar" style={{ padding: '10px 15px 4px 15px', background: 'var(--bg-input)', borderRadius: RADIUS, border: '1px solid var(--border-color)', color: 'var(--text-pure)', overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                                                                        <Latex formula={`\\begin{aligned} E(\\hat{p}) &= \\sum_{i=1}^{${resDistMuestrales.distribucion.length}} \\hat{p}_i P(\\hat{p}_i) \\\\ &= ${resDistMuestrales.distribucion.map(d => `\\frac{${d.frecuencia}}{${d.total}}(${Number(d.valor).toFixed(4)})`).join(' + ')} = ${Number(resDistMuestrales.calculosFinales.esperanza).toFixed(4)} \\end{aligned}`} />
                                                                    </div>
                                                                    <div style={{ color: 'var(--text-pure)', marginTop: '5px', marginBottom: '5px', textAlign: 'center', fontSize: '0.75rem' }}>
                                                                        Obsérvese que: <Latex formula={`E(\\hat{p}) = P = ${Number(resDistMuestrales.calculosFinales.proporcionPoblacional).toFixed(4)}`} />
                                                                    </div>
                                                                </div>

                                                                <div id="tour-t4-varianza-muestral">
                                                                    <div className="tema4-titulo-seccion" style={{ margin: '10px 0 0px 0', textAlign: 'center', color: 'var(--text-pure)', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                                        Varianza Muestral <Latex formula="V(\hat{p})" />
                                                                    </div>
                                                                    <div className="thin-scrollbar" style={{ padding: '10px 15px 4px 15px', background: 'var(--bg-input)', borderRadius: RADIUS, border: '1px solid var(--border-color)', color: 'var(--text-pure)', overflowX: 'auto', overflowY: 'hidden', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                                                                        <Latex formula={`\\begin{aligned} V(\\hat{p}) &= \\sum_{i=1}^{${resDistMuestrales.distribucion.length}} (\\hat{p}_i - E(\\hat{p}))^2 P(\\hat{p}_i) \\\\ &= ${resDistMuestrales.distribucion.map(d => `\\frac{${d.frecuencia}}{${d.total}}(${Number(d.valor).toFixed(4)} - ${Number(resDistMuestrales.calculosFinales.esperanza).toFixed(4)})^2`).join(' + ')} = ${Number(resDistMuestrales.calculosFinales.varianzaDeDistribucion).toFixed(6)} \\end{aligned}`} />
                                                                    </div>
                                                                    <div style={{ color: 'var(--text-pure)', marginTop: '5px', textAlign: 'center', fontSize: '0.75rem' }}>
                                                                        Obsérvese que: <Latex formula={`V(\\hat{p}) = \\frac{P \\cdot Q}{n} ${!resDistMuestrales.calculosFinales.conReemplazo ? '\\left(\\frac{N-n}{N-1}\\right)' : ''} = \\frac{${Number(resDistMuestrales.calculosFinales.proporcionPoblacional).toFixed(4)} \\cdot ${(1 - resDistMuestrales.calculosFinales.proporcionPoblacional).toFixed(4)}}{${resDistMuestrales.calculosFinales.n}} ${!resDistMuestrales.calculosFinales.conReemplazo ? `\\left(\\frac{${resDistMuestrales.calculosFinales.N}-${resDistMuestrales.calculosFinales.n}}{${resDistMuestrales.calculosFinales.N}-1}\\right)` : ''} = ${varianzaTeoricaPropStr}`} />
                                                                    </div>
                                                                </div>

                                                                <div id="tour-t4-distribucion-aproximada">
                                                                    <div className="tema4-titulo-seccion" style={{ margin: '10px 0 0px 0', textAlign: 'center', color: 'var(--text-pure)', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        Distribución Normal Aproximada
                                                                    </div>
                                                                    <div style={{ marginTop: '0px', padding: '12px 15px', background: 'var(--bg-input)', borderRadius: RADIUS, border: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-pure)' }}>
                                                                        <Latex formula={`\\hat{p} \\sim N(${Number(resDistMuestrales.calculosFinales.esperanza).toFixed(4)} ; ${varianzaTeoricaPropStr})`} />
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            );
                        })()}
                </div>
            )}

            {/* Modal de Alerta */}
            <ModalAlerta
                isOpen={modalAlerta.isOpen}
                mensaje={modalAlerta.mensaje}
                titulo={modalAlerta.titulo}
                tipo={modalAlerta.tipo}
                onClose={() => setModalAlerta(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}

