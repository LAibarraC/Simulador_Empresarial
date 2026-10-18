import React, { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cardStyle, labelStyle, FS, RADIUS, FONT } from '../../../Principal/Constantes';
import ModalAlerta from '../../../ui/ModalAlerta';
import { mat251Api } from '../../../Matematicas/services/api';

export default function Controles_IntervalosSimulacion({ parametro, confianza, onCalcular }) {
    const localLabelStyle = { ...labelStyle, color: 'var(--text-main, #1e293b)' };
    const [distribucion, setDistribucion] = useState('normal');
    
    const renderKatex = (math, negrita = false) => (
        <span className={negrita ? 'tema5-matematica-negrita' : undefined} dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
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

    const ejecutarSimulacion = async (payload) => {
        setIsCalculating(true);
        try {
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

        const payload = {
            distribucion,
            paramsDist,
            n: Number(n),
            numSimulaciones: Number(numSimulaciones),
            parametro,
            confianza: Number(confianza),
            sigmaConocida: distribucion === 'normal' && parametro === 'media' ? sigmaConocida : false
        };

        if (payload.numSimulaciones > 10000) {
            mostrarAlerta("El número de simulaciones debe estar entre 1 y 10.000.", "Límite de Simulaciones", "warning");
            return;
        }

        await ejecutarSimulacion(payload);
    };

    return (
        <div className="tema5-intervalos-simulacion" style={{ padding: '0px' }}>
            <style>{`
                @media (max-width: 600px) {
                    .tema5-sim-distribucion-selector { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; padding-right: 0 !important; }
                    .tema5-sim-sigma-setting { flex-direction: column; align-items: flex-start !important; gap: 8px !important; }
                    .tema5-sim-sigma-setting > label { min-width: 0 !important; white-space: normal; }
                    .tema5-sim-sigma-options { flex-direction: row !important; flex-wrap: wrap; gap: 8px 18px !important; }
                    .tema5-sim-generate { margin-top: 12px !important; }
                    .tema5-sim-generate button { width: 100% !important; max-width: 360px; }
                }
            `}</style>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
                <div className="tema5-sim-distribucion-selector" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <label style={{ ...localLabelStyle, margin: 0 }}>Distribución Poblacional:</label>
                    
                    <div ref={selectRef} style={{ position: 'relative', width: '220px', maxWidth: '100%', fontFamily: FONT }}>
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
                    <div className="tema5-simulacion-ayuda">
                        <button type="button" id="tema5-ayuda-intervalos-simulador" className="tema5-simulacion-ayuda-boton" aria-label="Ayuda sobre la simulación de intervalos" aria-describedby="tema5-ayuda-intervalos-contenido">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M9.6 9a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.8" />
                                <path d="M12 17h.01" />
                            </svg>
                        </button>
                        <div id="tema5-ayuda-intervalos-contenido" className="tema5-simulacion-ayuda-panel" role="tooltip">
                            <strong>Simulación de intervalos</strong>
                            <p>Repite el experimento para mostrar cómo se comportan los intervalos de confianza.</p>
                            <ul>
                                <li>Genera {renderKatex('N', true)} muestras de tamaño {renderKatex('n', true)} usando la distribución elegida.</li>
                                <li>Calcula un intervalo de confianza para cada muestra.</li>
                                <li>Compara los intervalos con el valor real para observar cuántos lo contienen y cómo influye el nivel de confianza.</li>
                                <li>En media normal, elige si la desviación estándar poblacional {renderKatex('\\sigma', true)} es conocida.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Parámetros de la distribución */}
                <div className="tema5-sim-panel" style={{ background: 'var(--bg-input, #f1f5f9)', padding: '10px', border: 'none', borderRadius: '5px' }}>
                    <div style={{ fontSize: FS.xs, fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-pure)' }}>PARÁMETROS DE LA DISTRIBUCIÓN</div>
                    <div className="tema5-simulacion-parametros-fila" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        {distribucion === 'normal' && (
                            <>
                                <div className="tema5-simulacion-campo" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                            <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('\\mu:', true)}</label>
                                    <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={mu} onChange={e => setMu(e.target.value)} placeholder="Media real" />
                                </div>
                                <div className="tema5-simulacion-campo" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                            <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('\\sigma:', true)}</label>
                                    <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={sigma} onChange={e => setSigma(e.target.value)} min="0.001" placeholder="Desv. Estándar real" />
                                </div>
                            </>
                        )}
                        {(distribucion === 'bernoulli' || distribucion === 'binomial') && (
                            <div className={`tema5-simulacion-campo ${distribucion === 'bernoulli' ? 'tema5-simulacion-campo-centrado' : ''}`} style={{ flex: distribucion === 'bernoulli' ? '0 1 50%' : 1, maxWidth: distribucion === 'bernoulli' ? '50%' : undefined, margin: distribucion === 'bernoulli' ? '0 auto' : undefined, display: 'flex', alignItems: 'center', gap: '8px', minWidth: distribucion === 'bernoulli' ? 0 : '220px' }}>
                            <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('p:', true)}</label>
                                <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={p} onChange={e => setP(e.target.value)} min="0" max="1" step="0.01" placeholder="Probabilidad de éxito" />
                            </div>
                        )}
                        {distribucion === 'binomial' && (
                            <div className="tema5-simulacion-campo" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                            <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('n:', true)}</label>
                                <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={nEnsayos} onChange={e => setNEnsayos(e.target.value)} min="1" placeholder="Nº de Ensayos reales" />
                            </div>
                        )}
                        {distribucion === 'poisson' && (
                            <div className="tema5-simulacion-campo tema5-simulacion-campo-centrado" style={{ flex: '0 1 50%', maxWidth: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('\\lambda:', true)}</label>
                                <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={lambda} onChange={e => setLambda(e.target.value)} min="0.001" placeholder="Tasa real" />
                            </div>
                        )}
                        {distribucion === 'uniforme' && (
                            <>
                                <div className="tema5-simulacion-campo" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                                <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('a:', true)}</label>
                                    <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={a} onChange={e => setA(e.target.value)} placeholder="Mínimo real" />
                                </div>
                                <div className="tema5-simulacion-campo" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                                <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('b:', true)}</label>
                                    <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={b} onChange={e => setB(e.target.value)} placeholder="Máximo real" />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Parámetros de Simulación */}
                <div className="tema5-sim-panel" style={{ background: 'var(--bg-card, white)', padding: '10px', borderRadius: '5px', border: 'none' }}>
                    <div style={{ fontSize: FS.xs, fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-pure)' }}>PARÁMETROS DEL EXPERIMENTO (INTERVALOS)</div>
                    <div className="tema5-simulacion-entradas-fila" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <div className="tema5-simulacion-campo" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px' }}>
                            <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('n:', true)}</label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                style={{ flex: 1, width: '100%' }}
                                value={n}
                                onChange={(e) => setN(e.target.value)}
                                min={parametro === 'varianza' ? '2' : '1'}
                                placeholder="Tamaño de muestra"
                            />
                        </div>
                        <div className="tema5-simulacion-campo" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px' }}>
                            <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('N:', true)}</label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                style={{ flex: 1, width: '100%' }}
                                value={numSimulaciones}
                                onChange={(e) => setNumSimulaciones(e.target.value)}
                                min="1"
                                max="10000"
                                placeholder="Número de simulaciones"
                            />
                        </div>

                        {distribucion === 'normal' && parametro === 'media' && (
                            <div className="tema5-sim-sigma-setting" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
                                <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '180px' }}>Para los intervalos, asumir:</label>
                                <div className="tema5-sim-sigma-options" style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
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

            <div className="tema5-sim-generate" style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
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
                onClose={() => setModalAlerta(prev => ({ ...prev, isOpen: false }))}
            />

        </div>
    );
}
