import React, { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { simularPruebaHipotesis } from '../../../Matematicas/Logica_Tema6';
import { cardStyle, labelStyle, FS, RADIUS } from '../../../Principal/Constantes';
import ModalAlerta from '../../../ui/ModalAlerta';

export default function Controles_HP_Simulacion({ prueba, onCalcular }) {
    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const paramSymbol = prueba === 'proporcion' ? 'p' : prueba === 'varianza' ? '\\sigma^2' : '\\mu';
    const paramHypo = prueba === 'proporcion' ? 'p_0' : prueba === 'varianza' ? '\\sigma_0^2' : '\\mu_0';

    const [n, setN] = useState('');
    const [numSimulaciones, setNumSimulaciones] = useState('');

    // Params Poblacionales Reales (para generar)
    const [muReal, setMuReal] = useState('');
    const [sigmaReal, setSigmaReal] = useState('');
    const [pReal, setPReal] = useState('');

    // Params de la prueba (Hipotéticos)
    const [mu0, setMu0] = useState('');
    const [p0, setP0] = useState('');
    const [sigma02, setSigma02] = useState('');
    const [sigma, setSigma] = useState(''); // para Z
    const [alpha, setAlpha] = useState('0.05');
    const [tipoPrueba, setTipoPrueba] = useState('bilateral');

    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Atención', tipo: 'warning' });
    const [isCalculating, setIsCalculating] = useState(false);

    const [isAlphaOpen, setIsAlphaOpen] = useState(false);
    const alphaRef = useRef(null);

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

    const mostrarAlerta = (mensaje, titulo = 'Atención', tipo = 'warning') => {
        setModalAlerta({ isOpen: true, mensaje, titulo, tipo });
    };

    const handleCalcular = () => {
        if (!n || !numSimulaciones) {
            mostrarAlerta("Por favor, ingrese el tamaño de la muestra (n) y el número de simulaciones.", "Faltan Parámetros", "warning");
            return;
        }

        const paramsGeneracion = {
            muReal: Number(muReal),
            sigmaReal: prueba === 'media_z' ? Number(sigma) : Number(sigmaReal),
            pReal: Number(pReal)
        };

        const paramsPrueba = {
            n: Number(n),
            mu0: Number(mu0),
            p0: Number(p0),
            sigma02: Number(sigma02),
            sigma: Number(sigma),
            alpha: Number(alpha),
            tipoPrueba
        };

        setIsCalculating(true);
        setTimeout(() => {
            const res = simularPruebaHipotesis(prueba, Number(numSimulaciones), Number(n), paramsGeneracion, paramsPrueba);
            setIsCalculating(false);
            if (res.error) {
                mostrarAlerta(res.error, "Error en la Simulación", "error");
                onCalcular(null);
            } else {
                onCalcular(res);
            }
        }, 10);
    };

    return (
        <div style={cardStyle}>
            <p style={{ fontSize: FS.sm, marginBottom: '15px', color: 'var(--text-pure)' }}>
                Genere múltiples muestras aleatorias para observar la tasa de rechazo de la hipótesis nula:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-input, #f1f5f9)', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ fontSize: FS.xs, fontWeight: 'bold', marginBottom: '15px', color: 'var(--text-pure)' }}>PARÁMETROS REALES</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                        {(prueba === 'media_z' || prueba === 'media_t' || prueba === 'varianza') && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: '35px', textAlign: 'right' }}>{renderKatex('\\mu:')}</label>
                                <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1 }} value={muReal} onChange={e => setMuReal(e.target.value)} placeholder="Media poblacional real" step="any" />
                            </div>
                        )}
                        {(prueba === 'media_t' || prueba === 'varianza') && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: '35px', textAlign: 'right' }}>
                                    {renderKatex(prueba === 'varianza' ? '\\sigma^2:' : '\\sigma:')}
                                </label>
                                <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1 }} value={sigmaReal} onChange={e => setSigmaReal(e.target.value)} min="0.001" step="any" placeholder={prueba === 'varianza' ? "Varianza poblacional real" : "Desv. est. real"} />
                            </div>
                        )}
                        {prueba === 'proporcion' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: '35px', textAlign: 'right' }}>{renderKatex('p:')}</label>
                                <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1 }} value={pReal} onChange={e => setPReal(e.target.value)} min="0" max="1" step="any" placeholder="Proporción real" />
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ background: 'var(--bg-input, #f1f5f9)', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ fontSize: FS.xs, fontWeight: 'bold', marginBottom: '15px', color: 'var(--text-pure)' }}>PARÁMETROS HIPOTÉTICOS</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                        {(prueba === 'media_z' || prueba === 'media_t') && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: '35px', textAlign: 'right' }}>{renderKatex('\\mu_0:')}</label>
                                <input type="number" className="input-mat251 placeholder-small" value={mu0} onChange={e => setMu0(e.target.value)} placeholder="Media hipotética" step="any" style={{ flex: 1 }} />
                            </div>
                        )}

                        {prueba === 'proporcion' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: '35px', textAlign: 'right' }}>{renderKatex('p_0:')}</label>
                                <input type="number" className="input-mat251 placeholder-small" value={p0} onChange={e => setP0(e.target.value)} placeholder="Proporción hipotética" step="any" style={{ flex: 1 }} />
                            </div>
                        )}
                        {prueba === 'varianza' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: '35px', textAlign: 'right' }}>{renderKatex('\\sigma_0^2:')}</label>
                                <input type="number" className="input-mat251 placeholder-small" value={sigma02} onChange={e => setSigma02(e.target.value)} placeholder="Varianza hipotética" step="any" style={{ flex: 1 }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 235px 1fr', gap: '15px 10px', width: '100%', alignItems: 'center', marginBottom: '15px' }}>
                {prueba === 'media_z' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)' }}>{renderKatex('\\sigma:')}</label>
                        </div>
                        <div>
                            <input type="number" className="input-mat251 placeholder-small" value={sigma} onChange={e => setSigma(e.target.value)} placeholder="Desviación Estándar" step="any" style={{ width: '100%', boxSizing: 'border-box' }} />
                        </div>
                        <div></div>
                    </>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)' }}>{renderKatex('\\alpha:')}</label>
                </div>
                <div ref={alphaRef} style={{ position: 'relative' }}>
                    <div
                        onClick={() => setIsAlphaOpen(!isAlphaOpen)}
                        style={{
                            padding: '8px 12px', background: 'var(--bg-card)',
                            border: `1px solid ${isAlphaOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
                            borderRadius: RADIUS || '4px', cursor: 'pointer',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            fontSize: FS.sm, color: 'var(--text-pure)',
                            boxShadow: isAlphaOpen ? '0 0 0 3px rgba(0,123,255,0.15)' : 'none',
                            transition: 'all 0.2s ease', userSelect: 'none'
                        }}
                    >
                        <span style={{ fontWeight: 500 }}>{alphaOptions.find(o => o.value === alpha)?.label}</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            style={{ transform: isAlphaOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease', color: 'var(--text-pure)', flexShrink: 0 }}>
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
                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)' }}>{renderKatex('H_1:')}</label>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: '45px', textAlign: 'right' }}>{renderKatex('n:')}</label>
                    <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1 }} value={n} onChange={e => setN(e.target.value)} min="2" placeholder="Tamaño de muestra" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: 'auto', whiteSpace: 'nowrap', textAlign: 'right', fontWeight: 'bold' }}>Simulaciones:</label>
                    <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1 }} value={numSimulaciones} onChange={e => setNumSimulaciones(e.target.value)} min="1" max="10000" placeholder="Nº Simulaciones" />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button 
                    className="button_calcular" 
                    style={{ width: 'auto', padding: '5px 15px', opacity: isCalculating ? 0.7 : 1, cursor: isCalculating ? 'wait' : 'pointer' }} 
                    onClick={handleCalcular}
                    disabled={isCalculating}
                >
                    {isCalculating ? 'Simulando...' : 'Ejecutar Simulación'}
                </button>
            </div>

            <ModalAlerta isOpen={modalAlerta.isOpen} mensaje={modalAlerta.mensaje} titulo={modalAlerta.titulo} tipo={modalAlerta.tipo} onClose={() => setModalAlerta({ ...modalAlerta, isOpen: false })} />
        </div>
    );
}
