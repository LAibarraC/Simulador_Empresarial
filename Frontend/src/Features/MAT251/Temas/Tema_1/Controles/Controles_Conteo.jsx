import React, { useState, useRef, useEffect } from 'react';
import { FONT, FS, RADIUS, cardStyle, labelStyle } from '../../../Principal/Constantes';

import { IconoCalculadora, IconoAlerta } from '../../../../../ui/iconos';

const OPCIONES_ELEMENTOS = [
    { 
        value: 'letras', 
        label: 'A, B, C...',
        icon: <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--primary-color)', display: 'inline-block' }}>ABC</span>
    },
    { 
        value: 'numeros', 
        label: '1, 2, 3...',
        icon: <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--primary-color)', display: 'inline-block' }}>123</span>
    },
    { 
        value: 'personalizado', 
        label: 'Elementos personalizados',
        icon: (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-color)', display: 'block' }}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
        )
    }
];

export default function ControlesConteo({ 
    n, setN, r, setR, ajustar, ejecutar, 
    customElementsInput, setCustomElementsInput, parsedElements,
    tipoElementos, setTipoElementos
}) {
    const [isOpenSelect, setIsOpenSelect] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) {
                setIsOpenSelect(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const opcionSeleccionada = OPCIONES_ELEMENTOS.find(o => o.value === tipoElementos) || OPCIONES_ELEMENTOS[0];

    return (
        <>
            <div style={{ ...cardStyle}}>
                <label style={{ ...labelStyle, color: 'var(--text-pure)' }}>Valores:</label>
                {[{ label: 'Total (n):', val: n, setVal: setN }, { label: 'Muestra (r):', val: r, setVal: setR }].map(({ label, val, setVal }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', gap: '10px' }}>
                        <label style={{ fontSize: FS.sm, fontFamily: FONT, width: '85px', flexShrink: 0, margin: 0, color: 'var(--text-pure)' }}>{label}</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                            <button type="button" className="btn-primary" onClick={() => ajustar(setVal, val, '-')} style={{ width: '32px', padding: '4px', borderRadius: RADIUS, fontSize: FS.md }}>−</button>
                            <input type="number" value={val} onChange={(e) => setVal(e.target.value)} className="container_cal_input" style={{ textAlign: 'center', flex: 1, borderRadius: RADIUS, fontSize: FS.base, color: 'var(--text-pure)', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)', outline: 'none' }} />
                            <button type="button" className="btn-primary" onClick={() => ajustar(setVal, val, '+')} style={{ width: '32px', padding: '4px', borderRadius: RADIUS, fontSize: FS.md }}>+</button>
                        </div>
                    </div>
                ))}

                <div style={{ marginTop: '15px' }}>
                    <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '6px', fontWeight: 'bold', color: 'var(--text-pure)' }}>Tipo de Elementos:</label>
                    
                    {/* Contenedor relativo exclusivo para el selector */}
                    <div ref={selectRef} style={{ position: 'relative', marginBottom: tipoElementos === 'personalizado' ? '10px' : '0' }}>
                        {/* Trigger personalizado igual a Operación */}
                        <div
                            onClick={() => setIsOpenSelect(o => !o)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 12px',
                                background: 'var(--bg-card)',
                                border: `1px solid ${isOpenSelect ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                borderRadius: RADIUS,
                                cursor: 'pointer',
                                boxShadow: isOpenSelect ? '0 0 0 3px rgba(0,123,255,0.15)' : 'none',
                                transition: 'all 0.2s ease',
                                color: 'var(--text-pure)',
                                userSelect: 'none',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                    {opcionSeleccionada.icon}
                                </span>
                                <span style={{ fontWeight: 500, fontSize: FS.sm }}>
                                    {opcionSeleccionada.label}
                                </span>
                            </div>
                            <svg 
                                width="18" 
                                height="18" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                style={{ 
                                    transform: isOpenSelect ? 'rotate(180deg)' : 'none', 
                                    transition: 'transform 0.3s ease', 
                                    color: 'var(--text-muted)', 
                                    flexShrink: 0 
                                }}
                            >
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </div>

                        {/* Menú flotante anclado directamente bajo el trigger */}
                        {isOpenSelect && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 4px)',
                                left: 0,
                                right: 0,
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: RADIUS,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                                zIndex: 1000,
                                overflow: 'hidden',
                                animation: 'fadeInDropdown 0.2s ease',
                            }}>
                                {OPCIONES_ELEMENTOS.map((opt, idx) => {
                                    const activo = tipoElementos === opt.value;
                                    return (
                                        <div
                                            key={opt.value}
                                            onClick={() => {
                                                setTipoElementos(opt.value);
                                                setIsOpenSelect(false);
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '9px 12px',
                                                cursor: 'pointer',
                                                background: activo ? 'rgba(0,123,255,0.08)' : 'transparent',
                                                color: activo ? 'var(--primary-color)' : 'var(--text-pure)',
                                                fontWeight: activo ? 600 : 400,
                                                fontSize: FS.sm,
                                                borderBottom: idx < OPCIONES_ELEMENTOS.length - 1 ? '1px solid var(--border-color)' : 'none',
                                                transition: 'background 0.15s ease',
                                                userSelect: 'none'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!activo) e.currentTarget.style.background = 'var(--bg-input)';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!activo) e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ display: 'flex', alignItems: 'center' }}>
                                                    {opt.icon}
                                                </span>
                                                <span>{opt.label}</span>
                                            </div>
                                            {activo && (
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-color)' }}>
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Input personalizado situado abajo en el flujo normal */}
                    {tipoElementos === 'personalizado' && (
                        <div>
                            <input 
                                type="text" 
                                value={customElementsInput} 
                                onChange={(e) => setCustomElementsInput(e.target.value)} 
                                placeholder="Ej. perro, gato, loro"
                                className="input-mat251 placeholder-small"
                                style={{ 
                                    width: '100%', 
                                    padding: '8px 12px', 
                                    borderRadius: RADIUS, 
                                    fontSize: FS.sm, 
                                    border: '1px solid var(--border-color)', 
                                    backgroundColor: 'var(--bg-card)', 
                                    color: 'var(--text-pure)',  
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }} 
                            />
                            {customElementsInput.trim() && parsedElements.length !== (parseInt(n) || 0) && (
                                <div style={{ color: '#d97706', fontSize: '0.75rem', marginTop: '6px', fontWeight: 500, lineHeight: '1.3', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <IconoAlerta width="14" height="14" style={{ flexShrink: 0 }} />
                                    <span>Ingresaste {parsedElements.length} elementos para un total n = {n}. Se autocompletará o truncará al calcular.</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <button onClick={ejecutar} className="button_calcular" style={{ width: 'fit-content', alignSelf: 'center', padding: '5px 20px', borderRadius: RADIUS, fontSize: FS.md, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                CALCULAR
            </button>
        </>
    )
}