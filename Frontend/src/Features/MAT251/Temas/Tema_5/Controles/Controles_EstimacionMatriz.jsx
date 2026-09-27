import React, { useState, useRef, useEffect } from 'react';
import { calcularEstimacionPuntualMatriz } from '../../../Matematicas/logica_Tema5';
import { cardStyle, FS, labelStyle, RADIUS, FONT } from '../../../Principal/Constantes';
import { EditarDatos } from '../../../../../ui/iconos';
import ModalAlerta from '../../../ui/ModalAlerta';

export default function Controles_EstimacionMatriz({ parametro, varSeleccionada, filas, statsDatos, abrirEditor, onCalcular }) {
    const [valorExito, setValorExito] = useState('');
    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Atención', tipo: 'warning' });
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const selectRef = useRef(null);

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
        // Extraemos todos los datos (cargados + agregados manualmente)
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

        const res = calcularEstimacionPuntualMatriz(datosCompletos, parametro, valorExito);
        if (res.error) {
            mostrarAlerta(res.error, 'Error de Cálculo', 'error');
            onCalcular(null);
        } else {
            onCalcular(res);
        }
    };

    return (
        <div style={{ padding: '0px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-main, #1e293b)' }}>Análisis de Matriz</h4>
            
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
                                <span style={{ fontWeight: 500, fontSize: FS.sm }}>
                                    {valorExito || '-- Seleccione un valor --'}
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
                                    overflow: 'hidden',
                                    animation: 'fadeInDropdown 0.2s ease',
                                }}>
                                    {valoresUnicos.length > 0 ? (
                                        valoresUnicos.map((val, idx) => {
                                            const active = valorExito === val;
                                            return (
                                                <div
                                                    key={idx}
                                                    onClick={() => { setValorExito(val); setIsSelectOpen(false); }}
                                                    onMouseEnter={e => {
                                                        if (!active) {
                                                            e.currentTarget.style.background = 'rgba(0,123,255,0.05)';
                                                            e.currentTarget.style.color = 'var(--primary-color)';
                                                        }
                                                    }}
                                                    onMouseLeave={e => {
                                                        if (!active) {
                                                            e.currentTarget.style.background = 'transparent';
                                                            e.currentTarget.style.color = 'var(--text-main, #1e293b)';
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '10px 12px',
                                                        cursor: 'pointer',
                                                        background: active ? 'rgba(0,123,255,0.08)' : 'transparent',
                                                        color: active ? 'var(--primary-color)' : 'var(--text-main, #1e293b)',
                                                        fontWeight: active ? 600 : 400,
                                                        fontSize: FS.sm,
                                                        borderBottom: idx < valoresUnicos.length - 1 ? '1px solid var(--border-color, #e2e8f0)' : 'none',
                                                        transition: 'all 0.2s ease',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                                    }}
                                                >
                                                    {val}
                                                    {active && (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                                            style={{ color: 'var(--primary-color)' }}>
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div style={{ padding: '10px 12px', fontSize: FS.sm, color: 'var(--text-muted, #64748b)' }}>
                                            No hay datos disponibles en la matriz
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })()}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <button 
                    className="button_calcular"
                    style={{ width: 'auto', padding: '5px 15px' }} 
                    onClick={handleCalcular}
                >
                    Calcular Estimación Puntual
                </button>
            </div>

            <ModalAlerta
                isOpen={modalAlerta.isOpen}
                mensaje={modalAlerta.mensaje}
                titulo={modalAlerta.titulo}
                tipo={modalAlerta.tipo}
                onClose={() => setModalAlerta({ ...modalAlerta, isOpen: false })}
            />


        </div>
    );
}
