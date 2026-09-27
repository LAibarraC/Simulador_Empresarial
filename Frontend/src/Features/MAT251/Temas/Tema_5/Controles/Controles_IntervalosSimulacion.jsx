import React, { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cardStyle, labelStyle, FS, RADIUS, FONT } from '../../../Principal/Constantes';
import ModalAlerta from '../../../ui/ModalAlerta';
import { mat251Api } from '../../../Matematicas/services/api';

export default function Controles_IntervalosSimulacion({ parametro, confianza, onCalcular }) {
    const localLabelStyle = { ...labelStyle, color: 'var(--text-main, #1e293b)' };
    const [distribucion, setDistribucion] = useState('normal');
    
    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );
    
    // Params por defecto (vacíos para que se vean los placeholders)
    const [mu, setMu] = useState('');
    const [sigma, setSigma] = useState('');
    const [p, setP] = useState('');
    const [lambda, setLambda] = useState('');
    const [a, setA] = useState('');
    const [b, setB] = useState('');
    const [nEnsayos, setNEnsayos] = useState('');

    // Toggle para sigma conocida (Solo para Normal, Media)
    const [sigmaConocida, setSigmaConocida] = useState(true);

    const [n, setN] = useState('');
    const [numSimulaciones, setNumSimulaciones] = useState('');

    const [isCalculating, setIsCalculating] = useState(false);
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Atención', tipo: 'warning' });
    const selectRef = useRef(null);

    const mostrarAlerta = (mensaje, titulo = 'Atención', tipo = 'warning') => {
        setModalAlerta({ isOpen: true, mensaje, titulo, tipo });
    };

    useEffect(() => {
        const handler = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) setIsSelectOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Distribuciones válidas según el parámetro
    const distDisponibles = {
        'media': ['normal', 'uniforme', 'poisson', 'bernoulli', 'binomial'],
        'proporcion': ['bernoulli', 'binomial'],
        'varianza': ['normal', 'uniforme', 'poisson', 'bernoulli']
    };

    // Si la distribución seleccionada no es válida para el nuevo parámetro, cambiarla
    if (!distDisponibles[parametro].includes(distribucion)) {
        setDistribucion(distDisponibles[parametro][0]);
    }

    const handleCalcular = async () => {
        if (!n || !numSimulaciones) {
            mostrarAlerta("Por favor, ingrese el tamaño de la muestra (n) y el número de simulaciones.", "Faltan Parámetros", "warning");
            return;
        }

        if (distribucion === 'bernoulli' || distribucion === 'binomial') {
            const prob = Number(p);
            if (p === '' || isNaN(prob) || prob < 0 || prob > 1) {
                mostrarAlerta("La probabilidad de éxito (p) debe ser un número entre 0 y 1.", "Probabilidad Inválida", "warning");
                return;
            }
        }

        let paramsDist = {};
        if (distribucion === 'normal') paramsDist = { mu: Number(mu), sigma: Number(sigma) };
        if (distribucion === 'bernoulli') paramsDist = { p: Number(p) };
        if (distribucion === 'poisson') paramsDist = { lambda: Number(lambda) };
        if (distribucion === 'uniforme') paramsDist = { a: Number(a), b: Number(b) };
        if (distribucion === 'binomial') paramsDist = { p: Number(p), n_ensayos: Number(nEnsayos) };

        setIsCalculating(true);
        
        try {
            const payload = {
                distribucion,
                paramsDist,
                n: Number(n),
                numSimulaciones: Number(numSimulaciones),
                parametro,
                confianza: Number(confianza),
                sigmaConocida: distribucion === 'normal' && parametro === 'media' ? sigmaConocida : false
            };
            const resultado = await mat251Api.ejecutarSimulacionIntervalos(payload);
            
            if (resultado && resultado.error) {
                mostrarAlerta(resultado.error, "Error en la Simulación", "error");
                onCalcular(null);
            } else {
                onCalcular(resultado);
            }
        } catch (error) {
            mostrarAlerta(error.message || 'Hubo un error al ejecutar la simulación de intervalos.', "Error en la Simulación", "error");
            onCalcular(null);
        } finally {
            setIsCalculating(false);
        }
    };

    return (
        <div style={{ padding: '0px' }}>
            <h4 style={{ margin: '0 0 10px 0'}}>Simulación de Intervalos de Confianza:</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <label style={{ ...localLabelStyle, margin: 0 }}>Distribución Poblacional:</label>
                    
                    <div ref={selectRef} style={{ position: 'relative', width: '220px', fontFamily: FONT }}>
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
                                {distribucion.charAt(0).toUpperCase() + distribucion.slice(1)}
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
                                {distDisponibles[parametro].map((d, idx) => {
                                    const active = distribucion === d;
                                    return (
                                        <div
                                            key={d}
                                            onClick={() => { setDistribucion(d); setIsSelectOpen(false); }}
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
                                                borderBottom: idx < distDisponibles[parametro].length - 1 ? '1px solid var(--border-color, #e2e8f0)' : 'none',
                                                transition: 'all 0.2s ease',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                            }}
                                        >
                                            {d.charAt(0).toUpperCase() + d.slice(1)}
                                            {active && (
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                                    style={{ color: 'var(--primary-color)' }}>
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Parámetros de la distribución */}
                <div style={{ background: 'var(--bg-input, #f1f5f9)', padding: '10px', borderRadius: '4px' }}>
                    <div style={{ fontSize: FS.xs, fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-muted)' }}>PARÁMETROS DE LA DISTRIBUCIÓN</div>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        {distribucion === 'normal' && (
                            <>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                                    <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('\\mu:')}</label>
                                    <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={mu} onChange={e => setMu(e.target.value)} placeholder="Media real" />
                                </div>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                                    <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('\\sigma:')}</label>
                                    <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={sigma} onChange={e => setSigma(e.target.value)} min="0.001" placeholder="Desv. Estándar real" />
                                </div>
                            </>
                        )}
                        {(distribucion === 'bernoulli' || distribucion === 'binomial') && (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
                                <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('p:')}</label>
                                <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={p} onChange={e => setP(e.target.value)} min="0" max="1" step="0.01" placeholder="Prob. real de éxito" />
                            </div>
                        )}
                        {distribucion === 'binomial' && (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                                <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('n:')}</label>
                                <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={nEnsayos} onChange={e => setNEnsayos(e.target.value)} min="1" placeholder="Nº de Ensayos reales" />
                            </div>
                        )}
                        {distribucion === 'poisson' && (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                                <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('\\lambda:')}</label>
                                <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={lambda} onChange={e => setLambda(e.target.value)} min="0.001" placeholder="Tasa real" />
                            </div>
                        )}
                        {distribucion === 'uniforme' && (
                            <>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                                    <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('a:')}</label>
                                    <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={a} onChange={e => setA(e.target.value)} placeholder="Mínimo real" />
                                </div>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                                    <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('b:')}</label>
                                    <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={b} onChange={e => setB(e.target.value)} placeholder="Máximo real" />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Parámetros de Simulación */}
                <div style={{ background: 'var(--bg-card, white)', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: FS.xs, fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-muted)' }}>PARÁMETROS DEL EXPERIMENTO (ESTIMACIÓN)</div>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px' }}>
                            <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>Tamaño de Muestra (n):</label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                style={{ flex: 1, width: '100%' }}
                                value={n}
                                onChange={(e) => setN(e.target.value)}
                                min={parametro === 'varianza' ? '2' : '1'}
                                placeholder="Ej: 30"
                            />
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px' }}>
                            <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>Nº Intervalos a Simular:</label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                style={{ flex: 1, width: '100%' }}
                                value={numSimulaciones}
                                onChange={(e) => setNumSimulaciones(e.target.value)}
                                min="1"
                                max="100000"
                                placeholder="Limite: 1 - 100.000"
                            />
                        </div>

                        {distribucion === 'normal' && parametro === 'media' && (
                            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
                                <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '180px' }}>Para los intervalos, asumir:</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
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
                                            checked={!sigmaConocida} 
                                            onChange={() => setSigmaConocida(false)} 
                                            style={{ display: 'none' }}
                                        />
                                        <span style={{ color: !sigmaConocida ? 'var(--accent-color)' : 'var(--text-main)', fontWeight: !sigmaConocida ? '600' : '400', fontSize: FS.sm }}>
                                            Desconocida ({renderKatex('\\sigma')})
                                        </span>
                                    </label>

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
                        )}

                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <button 
                    className="button_calcular"
                    style={{ width: 'auto', padding: '5px 15px', opacity: isCalculating ? 0.7 : 1, cursor: isCalculating ? 'wait' : 'pointer' }} 
                    onClick={handleCalcular}
                    disabled={isCalculating}
                >
                    {isCalculating ? 'Calculando...' : 'Generar Intervalos'}
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
