import React, { useState, useEffect, useRef } from 'react';
import { FONT, FS, RADIUS, OPERACIONES } from '../../../Principal/Constantes';

// --- COMPONENTE SELECT PERSONALIZADO E INTERACTIVO ---
export default function Operacion({ operacion, handleOperacion }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    let selectedLabel = "Seleccionar...";
    
    // Íconos temáticos para las opciones
    const getIcon = (val) => {
        if (val === 'conteo') return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="8" y1="12" x2="16" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="16"></line>
            </svg>
        );
        if (val === 'probabilidad') return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"></circle>
                <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" stroke="none"></circle>
                <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"></circle>
                <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" stroke="none"></circle>
                <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"></circle>
            </svg>
        );
        if (val === 'simulador_total') return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 10h16"></path><path d="M4 14h16"></path><path d="M12 4v16"></path>
            </svg>
        );
        if (val === 'regla_adicion') return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="12" r="5"></circle>
                <circle cx="15" cy="12" r="5"></circle>
            </svg>
        );
        if (val === 'regla_multiplicacion') return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="12" r="3"></circle>
                <line x1="9" y1="12" x2="15" y2="12"></line>
                <polyline points="13 10 15 12 13 14"></polyline>
            </svg>
        );
        if (val === 'muestreo') return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
        );
        if (val === 'dist_uniforme') return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19h16"></path>
                <path d="M4 15h16"></path>
                <path d="M4 15v4"></path>
                <path d="M20 15v4"></path>
                <path d="M4 11v-4"></path>
                <path d="M20 11v-4"></path>
                <path d="M4 11h16"></path>
                <path d="M4 7h16"></path>
            </svg>
        );
        return null;
    };

    OPERACIONES.forEach(g => {
        const found = g.opciones.find(o => o.value === operacion);
        if (found) selectedLabel = found.label;
    });

    return (
        <div ref={selectRef} style={{ position: 'relative', width: '100%', marginBottom: '15px', fontFamily: FONT }}>
            {/* Cabecera / Botón */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', background: 'var(--bg-card)', 
                    border: `1px solid ${isOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    borderRadius: RADIUS, cursor: 'pointer',
                    boxShadow: isOpen ? '0 0 0 3px rgba(0, 123, 255, 0.15)' : 'none',
                    transition: 'all 0.2s ease', color: 'var(--text-main, var(--text-color))'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--primary-color)', display: 'flex' }}>{getIcon(operacion)}</span>
                    <span style={{ fontWeight: 500, fontSize: FS.base }}>{selectedLabel}</span>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-muted)' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>

            {/* Menú Desplegable Flotante */}
            {isOpen && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    marginTop: '6px', background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)', borderRadius: RADIUS,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 1000,
                    overflow: 'hidden', animation: 'fadeInDropdown 0.2s ease'
                }}>
                    {OPERACIONES.map((g, idx) => (
                        <div key={g.grupo}>
                            <div style={{ 
                                padding: '8px 16px', background: 'var(--bg-body)', 
                                color: 'var(--primary-color)', fontWeight: 700, fontSize: FS.sm,
                                borderBottom: '1px solid var(--border-color)',
                                borderTop: idx !== 0 ? '1px solid var(--border-color)' : 'none'
                            }}>
                                {g.grupo}
                            </div>
                            {g.opciones.map(o => (
                                <div 
                                    key={o.value}
                                    onClick={() => { handleOperacion(o.value); setIsOpen(false); }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 123, 255, 0.08)'; e.currentTarget.style.color = 'var(--primary-color)' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = operacion === o.value ? 'rgba(0, 123, 255, 0.05)' : 'transparent'; e.currentTarget.style.color = operacion === o.value ? 'var(--primary-color)' : 'var(--text-color)' }}
                                    style={{
                                        padding: '12px 16px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        transition: 'all 0.2s ease', 
                                        color: operacion === o.value ? 'var(--primary-color)' : 'var(--text-color)',
                                        fontWeight: operacion === o.value ? 600 : 400,
                                        background: operacion === o.value ? 'rgba(0, 123, 255, 0.05)' : 'transparent',
                                        borderBottom: '1px solid var(--border-color)'
                                    }}
                                >
                                    <span style={{ opacity: operacion === o.value ? 1 : 0.5, display: 'flex' }}>{getIcon(o.value)}</span>
                                    <span style={{ fontSize: FS.base }}>{o.label}</span>
                                    {operacion === o.value && (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', color: 'var(--primary-color)' }}>
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
            <style>{`
                @keyframes fadeInDropdown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
