import React, { useState, useRef, useEffect } from 'react';
import { calcularEstimacionPuntualMatriz, calcularIntervaloMedia, calcularIntervaloProporcion, calcularIntervaloVarianza } from '../../../Matematicas/logica_Tema5';
import { cardStyle, FS, labelStyle, RADIUS, FONT } from '../../../Principal/Constantes';
import { EditarDatos } from '../../../../../ui/iconos';
import ModalAlerta from '../../../ui/ModalAlerta';
import katex from 'katex';

export default function Controles_IntervalosMatriz({ parametro, confianza, varSeleccionada, filas, statsDatos, abrirEditor, onCalcular }) {
    const [valorExito, setValorExito] = useState('');
    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Atención', tipo: 'warning' });
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const selectRef = useRef(null);

    // Opciones para la media cuando usamos matriz
    const [sigmaConocida, setSigmaConocida] = useState(false);
    const [sigmaPoblacional, setSigmaPoblacional] = useState('');

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    useEffect(() => {
        const handler = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) setIsSelectOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const mostrarAlerta = (mensaje, titulo = 'Atención', tipo = 'warning') => {
        setModalAlerta({ isOpen: true, mensaje, titulo, tipo });
    };

    const handleCalcular = () => {
        const datosCompletos = filas
            .map(f => f.valor)
            .filter(v => v !== undefined && v !== null && v.toString().trim() !== '');

        if (!datosCompletos || datosCompletos.length === 0) {
            mostrarAlerta('Por favor, selecciona o agrega una variable con datos válidos.', 'Faltan Datos', 'warning');
            return;
        }

        if (parametro === 'proporcion' && (!valorExito || valorExito.trim() === '')) {
            mostrarAlerta('Por favor, seleccione el valor considerado como éxito.', 'Faltan Datos', 'warning');
            return;
        }

        if (parametro === 'media' && sigmaConocida && (!sigmaPoblacional || parseFloat(sigmaPoblacional) <= 0)) {
            mostrarAlerta('Por favor ingrese una desviación estándar poblacional válida (>0).', 'Falta Parámetro', 'warning');
            return;
        }

        // 1. Calculamos la estimación puntual usando la matriz
        const resPuntual = calcularEstimacionPuntualMatriz(datosCompletos, parametro, valorExito);
        if (resPuntual.error) {
            mostrarAlerta(resPuntual.error, 'Error de Cálculo', 'error');
            onCalcular(null);
            return;
        }

        // 2. Usamos los resultados puntuales para calcular el intervalo
        let resIntervalo = null;

        if (parametro === 'media') {
            const x_bar = resPuntual.estimacion;
            const n = resPuntual.n;
            const s = resPuntual.calculos.desviacion; // Desviación muestral S
            const desviacion = sigmaConocida ? parseFloat(sigmaPoblacional) : s;
            
            resIntervalo = calcularIntervaloMedia(x_bar, desviacion, n, confianza, sigmaConocida);
        } else if (parametro === 'proporcion') {
            const x = resPuntual.calculos.x;
            const n = resPuntual.n;
            resIntervalo = calcularIntervaloProporcion(x, n, confianza);
        } else if (parametro === 'varianza') {
            const s2 = resPuntual.estimacion;
            const n = resPuntual.n;
            resIntervalo = calcularIntervaloVarianza(s2, n, confianza);
        }

        if (resIntervalo && resIntervalo.error) {
            mostrarAlerta(resIntervalo.error, 'Error de Cálculo', 'error');
            onCalcular(null);
        } else {
            // Combinar la información puntual y de intervalo para el componente de Resultados
            onCalcular({ ...resIntervalo, puntual: resPuntual });
        }
    };

    return (
        <div style={{ padding: '0px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-main, #1e293b)' }}>Análisis de Matriz de Datos</h4>
            
            <div style={{ marginBottom: '15px' }}>
                <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', padding: '12px' }}>
                    <div>
                        <span style={{ ...labelStyle, margin: 0, color: 'var(--text-main, #1e293b)' }}>Datos:</span>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                            <small title="Datos provenientes de variables externas" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                Cargados: <strong style={{ color: 'var(--text-main, #1e293b)' }}>{statsDatos?.cargados || 0}</strong>
                            </small>
                            <small title="Datos ingresados manualmente" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                Agregados: <strong style={{ color: 'var(--text-main, #1e293b)' }}>{statsDatos?.agregados || 0}</strong>
                            </small>
                            <small title="Total de datos válidos" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                Total: <strong style={{ color: 'var(--text-main, #1e293b)' }}>{statsDatos?.total || 0}</strong>
                            </small>
                        </div>
                    </div>
                    <button
                        onClick={abrirEditor}
                        className="btn-mat251-primario"
                        style={{ padding: '5px 14px', fontSize: FS.sm, backgroundColor: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <EditarDatos />
                        Editar Datos
                    </button>
                </div>
            </div>

            {parametro === 'media' && (
                <div style={{ ...cardStyle, marginBottom: '15px', padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '180px' }}>Desviación Estándar:</label>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                            {/* Radio Muestral */}
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <div style={{ 
                                    width: '18px', height: '18px', borderRadius: '50%', 
                                    border: `2px solid ${!sigmaConocida ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s ease', background: 'var(--bg-card)'
                                }}>
                                    <div style={{ 
                                        width: '10px', height: '10px', borderRadius: '50%', 
                                        background: 'var(--accent-color)', 
                                        opacity: !sigmaConocida ? 1 : 0,
                                        transform: !sigmaConocida ? 'scale(1)' : 'scale(0)',
                                        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                    }} />
                                </div>
                                <input 
                                    type="radio" 
                                    name="sigmaConocida" 
                                    checked={!sigmaConocida} 
                                    onChange={() => setSigmaConocida(false)} 
                                    style={{ display: 'none' }}
                                />
                                <span style={{ color: !sigmaConocida ? 'var(--accent-color)' : 'var(--text-main)', fontWeight: !sigmaConocida ? '600' : '400', fontSize: FS.sm }}>
                                    Desconocida ({renderKatex('\\sigma')})
                                </span>
                            </label>

                            {/* Radio Conocida */}
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <div style={{ 
                                    width: '18px', height: '18px', borderRadius: '50%', 
                                    border: `2px solid ${sigmaConocida ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s ease', background: 'var(--bg-card)'
                                }}>
                                    <div style={{ 
                                        width: '10px', height: '10px', borderRadius: '50%', 
                                        background: 'var(--accent-color)', 
                                        opacity: sigmaConocida ? 1 : 0,
                                        transform: sigmaConocida ? 'scale(1)' : 'scale(0)',
                                        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                    }} />
                                </div>
                                <input 
                                    type="radio" 
                                    name="sigmaConocida" 
                                    checked={sigmaConocida} 
                                    onChange={() => setSigmaConocida(true)} 
                                    style={{ display: 'none' }}
                                />
                                <span style={{ color: sigmaConocida ? 'var(--accent-color)' : 'var(--text-main)', fontWeight: sigmaConocida ? '600' : '400', fontSize: FS.sm }}>
                                    Conocida ({renderKatex('\\sigma')})
                                </span>
                            </label>
                        </div>
                    </div>
                    
                    {/* Animated Input Wrapper */}
                    <div style={{
                        maxHeight: sigmaConocida ? '60px' : '0px',
                        opacity: sigmaConocida ? 1 : 0,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease-in-out',
                        marginTop: sigmaConocida ? '15px' : '0px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)' }}>
                                Valor de {renderKatex('\\sigma')}:
                            </label>
                            <input
                                type="number"
                                className="input-mat251"
                                value={sigmaPoblacional}
                                onChange={(e) => setSigmaPoblacional(e.target.value)}
                                placeholder={`Ej. 15.2`}
                                step="any"
                                min="0"
                                style={{ width: '180px', textAlign: 'center' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {parametro === 'proporcion' && (() => {
                const valoresUnicos = [...new Set(filas
                    .map(f => f.valor)
                    .filter(v => v !== undefined && v !== null && v.toString().trim() !== '')
                    .map(v => v.toString().trim())
                )];

                return (
                    <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main, #1e293b)' }}>Seleccione el dato a contabilizar:</label>
                        
                        <div ref={selectRef} style={{ position: 'relative', flex: 1, minWidth: '200px', fontFamily: FONT }}>
                            <div
                                onClick={() => setIsSelectOpen(o => !o)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '8px 12px',
                                    background: 'var(--bg-card)',
                                    border: `1px solid ${isSelectOpen ? 'var(--primary-color)' : 'var(--border-color, #e2e8f0)'}`,
                                    borderRadius: RADIUS, cursor: 'pointer',
                                    boxShadow: isSelectOpen ? '0 0 0 3px rgba(0,123,255,0.15)' : 'none',
                                    transition: 'all 0.2s ease',
                                    color: 'var(--text-main, #1e293b)',
                                    userSelect: 'none',
                                }}
                            >
                                <span style={{ fontWeight: 500, fontSize: FS.sm, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {valorExito || '-- Seleccione un dato --'}
                                </span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    style={{ transform: isSelectOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease', color: 'var(--text-muted, #64748b)' }}>
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>

                            {isSelectOpen && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color, #e2e8f0)',
                                    borderRadius: RADIUS,
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                    zIndex: 1000,
                                    maxHeight: '200px', overflowY: 'auto',
                                    animation: 'fadeInDropdown 0.2s ease',
                                }}>
                                    {valoresUnicos.length > 0 ? (
                                        valoresUnicos.map((val, idx) => {
                                            const active = valorExito === val;
                                            return (
                                                <div
                                                    key={val}
                                                    onClick={() => {
                                                        setValorExito(val);
                                                        setIsSelectOpen(false);
                                                    }}
                                                    style={{
                                                        padding: '10px 14px',
                                                        cursor: 'pointer',
                                                        fontSize: FS.sm,
                                                        background: active ? 'var(--bg-active, #eff6ff)' : 'transparent',
                                                        color: active ? 'var(--primary-color)' : 'var(--text-main, #1e293b)',
                                                        fontWeight: active ? 'bold' : 'normal',
                                                        borderBottom: idx < valoresUnicos.length - 1 ? '1px solid var(--border-color, #f1f5f9)' : 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        transition: 'background 0.2s',
                                                    }}
                                                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-hover, #f8fafc)'; }}
                                                    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    {String(val)}
                                                    {active && (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div style={{ padding: '12px 14px', fontSize: FS.sm, color: 'var(--text-muted, #64748b)', textAlign: 'center', fontStyle: 'italic' }}>
                                            No hay datos disponibles en la tabla
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                <button 
                    className="button_calcular" 
                    style={{ width: 'auto', padding: '5px 15px' }}
                    onClick={handleCalcular}
                >
                    Calcular Intervalo de Confianza
                </button>
            </div>

            <ModalAlerta 
                isOpen={modalAlerta.isOpen}
                onClose={() => setModalAlerta({ ...modalAlerta, isOpen: false })}
                titulo={modalAlerta.titulo}
                mensaje={modalAlerta.mensaje}
                tipo={modalAlerta.tipo}
            />
        </div>
    );
}
