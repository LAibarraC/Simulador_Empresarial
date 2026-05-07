import React, { useState } from 'react';
import "../../styles/components/excel/VariableCard.css";

const VariableCard = ({ v, currentSheet, actions }) => {
    const [showMatrix, setShowMatrix] = useState(false);

    /*const dynamicBackground = `linear-gradient(90deg, 
        ${v.color.replace('0.4', '0.3')} 15%, 
        var(--bg-card) 65%, 
        var(--bg-card) 100%)`;*/
    return (
        <div className="variable-card" style={{
            borderLeft: `8px solid ${v.color}`,
            borderTop: '2px solid var(--border-color)',
            borderRight: '2px solid var(--border-color)',
            borderBottom: '2px solid var(--border-color)',
            background: 'var(--bg-card)',
        }}>
            {/* Cabecera: Nombre y Eliminar */}
            <div className='cabecera'>
                <div className='cabecera_input'>
                    <input
                        type="text"
                        value={v.nombre}
                        onChange={(e) => actions.update(v.id, { nombre: e.target.value })}
                    />
                    <button onClick={() => actions.assignName(v.id)}>Excel</button>
                </div>
                <button onClick={() => actions.delete(v.id)} className="btn-delete" title="Eliminar variable">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                </button>
            </div>

            {/* Información de la Hoja */}
            <div className='info_hoja '>
                Hoja:
                <span
                    onClick={() => actions.switchSheet(v.sheet)}
                    style={{ color: v.sheet === currentSheet ? '#4ade80' : '#f87171', cursor: v.sheet ? 'pointer' : 'default', textDecoration: v.sheet ? 'underline' : 'none', marginLeft: '5px', fontWeight: 'bold' }}
                >
                    {v.sheet || "Sin asignar"}
                </span>
            </div>

            {/* Fila de Rango y Acciones de Limpieza/Captura */}
            <div className='container_acciones'>
                <span className='container_acciones_span'>Rango:</span>
                <input
                    type="text"
                    value={v.rangoLabel}
                    placeholder="A2:A10"
                    onChange={(e) => actions.manualRange(v.id, e.target.value)}
                    className='container_acciones_input'
                />

                {/* BOTÓN LIMPIAR (Nuevo) */}
                <button
                    onClick={() => actions.clear(v.id)}
                    title="Limpiar rango y datos"
                    className='button_limpiar'>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </button>

                <button
                    onClick={() => actions.capture(v.id)}
                    className='button_capturar'
                >
                    Capturar
                </button>
            </div>
            
            {/* --- NUEVA INTERFAZ PARA MATRICES --- */}
            {v.coords && v.coords.cMax > v.coords.cMin && (
                <div style={{ marginTop: '10px' }}>
                    <button 
                        onClick={() => actions.openMatrixModal(v)}
                        style={{
                            width: '100%',
                            background: 'var(--bg-body)',
                            border: '1px solid #c084fc',
                            color: '#9333ea',
                            padding: '4px',
                            borderRadius: '5px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '5px',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(192, 132, 252, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-body)'}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                            <line x1="3" y1="15" x2="21" y2="15"></line>
                            <line x1="9" y1="3" x2="9" y2="21"></line>
                            <line x1="15" y1="3" x2="15" y2="21"></line>
                        </svg>
                        Matriz Detectada (Ver Detalles)
                    </button>
                </div>
            )}

            <div className='container_muestras' style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Muestras: <strong style={{ color: 'var(--text-main)' }}>{v.datos ? v.datos.length : 0}</strong></span>

                {v.tipo && (
                    <span style={{
                        fontSize: '9px',
                        backgroundColor: v.tipo.includes('Mixta') ? '#fee2e2' : (v.tipo.includes('Cualitativa') ? '#dbeafe' : '#fef3c7'),
                        color: v.tipo.includes('Mixta') ? '#b91c1c' : (v.tipo.includes('Cualitativa') ? '#1e40af' : '#b45309'),
                        padding: '3px 8px',
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        border: `1px solid ${v.tipo.includes('Mixta') ? '#fca5a5' : (v.tipo.includes('Cualitativa') ? '#bfdbfe' : '#fde68a')}`
                    }}>
                        {v.tipo.includes('Mixta') ? 'Mixta (Corregir)' : v.tipo}
                    </span>
                )}
            </div>
        </div>
    );
};

export default VariableCard;