import React, { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cardStyle, labelStyle, FS, RADIUS } from '../../../Principal/Constantes';
import ModalAlerta from '../../../ui/ModalAlerta';

export default function Controles_HP_Manual({ prueba, configuracion, onEditar, onCalcular }) {
    const { n, xBar, s, s2, sigma, x, mu0, p0, sigma02, alpha, tipoPrueba } = configuracion;
    const setN = valor => onEditar('n', valor);
    const setXBar = valor => onEditar('xBar', valor);
    const setS = valor => onEditar('s', valor);
    const setS2 = valor => onEditar('s2', valor);
    const setSigma = valor => onEditar('sigma', valor);
    const setX = valor => onEditar('x', valor);
    const setMu0 = valor => onEditar('mu0', valor);
    const setP0 = valor => onEditar('p0', valor);
    const setSigma02 = valor => onEditar('sigma02', valor);
    const setAlpha = valor => onEditar('alpha', valor);
    const setTipoPrueba = valor => onEditar('tipoPrueba', valor);

    const [isAlphaOpen, setIsAlphaOpen] = useState(false);
    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Atención', tipo: 'warning' });
    const alphaRef = useRef(null);

    const mostrarAlerta = (mensaje, titulo = 'Atención', tipo = 'warning') => {
        setModalAlerta({ isOpen: true, mensaje, titulo, tipo });
    };

    useEffect(() => {
        const handler = (e) => {
            if (alphaRef.current && !alphaRef.current.contains(e.target)) setIsAlphaOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const alphaOptions = [
        { value: '0.10', label: '0.10 (90%) - Significación' },
        { value: '0.05', label: '0.05 (95%) - Significación' },
        { value: '0.01', label: '0.01 (99%) - Significación' }
    ];

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(`\\boldsymbol{${math}}`, { throwOnError: false }) }} />
    );

    const paramSymbol = prueba === 'proporcion' ? 'p' : prueba === 'varianza' ? '\\sigma^2' : '\\mu';
    const paramHypo = prueba === 'proporcion' ? 'p_0' : prueba === 'varianza' ? '\\sigma_0^2' : '\\mu_0';

    const handleCalcular = () => {
        const calculo = onCalcular();
        if (calculo?.error) mostrarAlerta(calculo.error, 'Datos inválidos', 'warning');
    };

    return (
        <div style={{ ...cardStyle, border: 'none', padding: 0, boxShadow: 'none', background: 'transparent' }}>
            <style>{`
                .hp-manual-input-grid {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }
                .hp-manual-input-grid > div {
                    min-width: 0;
                    width: 100%;
                    box-sizing: border-box;
                }
                .hp-manual-input-grid input {
                    min-width: 0;
                    width: 100%;
                    box-sizing: border-box;
                }
                @media (min-width: 769px) {
                    .hp-manual-input-centered {
                        grid-column: 1 / -1;
                        justify-self: center;
                        width: 50% !important;
                        transform: translateX(-25px);
                    }
                }
                @media (max-width: 768px) {
                    .hp-manual-input-grid {
                        grid-template-columns: minmax(0, 1fr) !important;
                        gap: 10px !important;
                    }
                    .hp-manual-input-centered {
                        grid-column: auto;
                        width: 100% !important;
                        transform: none;
                    }
                }
            `}</style>
            <div id="tour-t6-hp-manual-entradas" className="hp-manual-input-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '15px', marginBottom: '15px', width: '100%', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px' }}>{renderKatex('n:')}</label>
                    <input type="number" className="input-mat251 placeholder-small" value={n} onChange={(e) => setN(e.target.value)} placeholder="Tamaño de muestra" min="1" style={{ flex: 1 }} />
                </div>

                {(prueba === 'media_z' || prueba === 'media_t') && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px' }}>{renderKatex('\\bar{X}:')}</label>
                            <input type="number" className="input-mat251 placeholder-small" value={xBar} onChange={(e) => setXBar(e.target.value)} placeholder="Media muestral" step="any" style={{ flex: 1 }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px' }}>{renderKatex('\\mu_0:')}</label>
                            <input type="number" className="input-mat251 placeholder-small" value={mu0} onChange={(e) => setMu0(e.target.value)} placeholder="Media hipotética" step="any" style={{ flex: 1 }} />
                        </div>
                    </>
                )}

                {prueba === 'media_z' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px' }}>{renderKatex('\\sigma:')}</label>
                        <input type="number" className="input-mat251 placeholder-small" value={sigma} onChange={(e) => setSigma(e.target.value)} placeholder="Desv. est. poblacional" min="0" step="any" style={{ flex: 1 }} />
                    </div>
                )}

                {prueba === 'media_t' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px' }}>{renderKatex('S:')}</label>
                        <input type="number" className="input-mat251 placeholder-small" value={s} onChange={(e) => setS(e.target.value)} placeholder="Desv. est. muestral" min="0" step="any" style={{ flex: 1 }} />
                    </div>
                )}

                {prueba === 'proporcion' && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px' }}>{renderKatex('x:')}</label>
                            <input type="number" className="input-mat251 placeholder-small" value={x} onChange={(e) => setX(e.target.value)} placeholder="Casos favorables" min="0" style={{ flex: 1 }} />
                        </div>
                        <div className="hp-manual-input-centered" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px' }}>{renderKatex('p_0:')}</label>
                            <input type="number" className="input-mat251 placeholder-small" value={p0} onChange={(e) => setP0(e.target.value)} placeholder="Proporción hipotética" min="0" max="1" step="any" style={{ flex: 1 }} />
                        </div>
                    </>
                )}

                {prueba === 'varianza' && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px' }}>{renderKatex('S^2:')}</label>
                            <input type="number" className="input-mat251 placeholder-small" value={s2} onChange={(e) => setS2(e.target.value)} placeholder="Varianza muestral" min="0" step="any" style={{ flex: 1 }} />
                        </div>
                        <div className="hp-manual-input-centered" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px' }}>{renderKatex('\\sigma_0^2:')}</label>
                            <input type="number" className="input-mat251 placeholder-small" value={sigma02} onChange={(e) => setSigma02(e.target.value)} placeholder="Varianza hipotética" min="0" step="any" style={{ flex: 1 }} />
                        </div>
                    </>
                )}

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 235px 1fr', gap: '15px 10px', width: '100%', alignItems: 'center', marginBottom: '15px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)' }}>{renderKatex('\\alpha:')}</label>
                </div>
                <div id="tour-t6-hp-manual-alpha" ref={alphaRef} style={{ position: 'relative' }}>
                    <div
                        onClick={() => setIsAlphaOpen(!isAlphaOpen)}
                        style={{
                            padding: '8px 12px', background: 'var(--bg-card)',
                            border: `1px solid ${isAlphaOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
                            borderRadius: RADIUS || '4px', cursor: 'pointer',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            fontSize: FS.sm, color: 'var(--text-color, var(--text-main))',
                            boxShadow: isAlphaOpen ? '0 0 0 3px rgba(0,123,255,0.15)' : 'none',
                            transition: 'all 0.2s ease', userSelect: 'none'
                        }}
                    >
                        <span style={{ fontWeight: 500 }}>{alphaOptions.find(o => o.value === alpha)?.label}</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            style={{ transform: isAlphaOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease', color: 'var(--text-muted)', flexShrink: 0 }}>
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                    {isAlphaOpen && (
                        <div style={{
                            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                            borderRadius: RADIUS || '4px', zIndex: 1000, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden'
                        }}>
                            {alphaOptions.map(opt => (
                                <div 
                                    key={opt.value}
                                    onClick={() => { setAlpha(opt.value); setIsAlphaOpen(false); }}
                                    style={{ 
                                        padding: '8px 12px', cursor: 'pointer', fontSize: FS.sm,
                                        background: alpha === opt.value ? 'var(--primary-light, #eff6ff)' : 'transparent',
                                        color: alpha === opt.value ? 'var(--primary-color)' : 'var(--text-main)',
                                        borderBottom: '1px solid var(--border-light, #f1f5f9)'
                                    }}
                                    onMouseEnter={(e) => { if (alpha !== opt.value) e.target.style.background = 'var(--bg-hover, #f8fafc)'; }}
                                    onMouseLeave={(e) => { if (alpha !== opt.value) e.target.style.background = 'transparent'; }}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div></div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)' }}>{renderKatex('H_1:')}</label>
                </div>
                <div id="tour-t6-hp-manual-h1" style={{ display: 'flex', gap: '8px' }}>
                    {['bilateral', 'derecha', 'izquierda'].map(tipo => {
                        const isSelected = tipoPrueba === tipo;
                        const mathStr = tipo === 'bilateral' ? `${paramSymbol} \\neq ${paramHypo}` :
                                        tipo === 'derecha' ? `${paramSymbol} > ${paramHypo}` :
                                        `${paramSymbol} < ${paramHypo}`;
                        return (
                            <div
                                key={tipo}
                                onClick={() => setTipoPrueba(tipo)}
                                style={{
                                    flex: 1, padding: '2px 0', textAlign: 'center', cursor: 'pointer',
                                    border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color, #cbd5e1)'}`,
                                    borderRadius: RADIUS || '4px',
                                    background: isSelected ? 'var(--accent-color)' : 'var(--bg-input, #fff)',
                                    color: isSelected ? '#fff' : 'var(--text-main)',
                                    boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                    transition: 'all 0.2s',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    fontSize: FS.xs,
                                }}
                            >
                                {renderKatex(mathStr)}
                            </div>
                        );
                    })}
                </div>
                <div></div>

                <div></div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    <button id="tour-t6-hp-manual-btn-calcular" className="button_calcular" style={{ width: 'auto', padding: '5px 15px' }} onClick={handleCalcular}>
                        Calcular Prueba
                    </button>
                </div>
                <div></div>
            </div>
            <ModalAlerta
                isOpen={modalAlerta.isOpen}
                onClose={() => setModalAlerta(prev => ({ ...prev, isOpen: false }))}
                titulo={modalAlerta.titulo}
                mensaje={modalAlerta.mensaje}
                tipo={modalAlerta.tipo}
            />
        </div>
    );
}
