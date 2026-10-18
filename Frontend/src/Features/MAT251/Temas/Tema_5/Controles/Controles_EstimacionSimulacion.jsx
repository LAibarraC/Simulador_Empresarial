import React, { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { generarSimulacionPuntual } from '../../../Matematicas/logica_Tema5';
import { cardStyle, labelStyle, FS, RADIUS, FONT } from '../../../Principal/Constantes';
import ModalAlerta from '../../../ui/ModalAlerta';
import { mat251Api } from '../../../Matematicas/services/api';

export default function Controles_EstimacionSimulacion({ parametro, onCalcular }) {
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

    const [n, setN] = useState('');
    const [numSimulaciones, setNumSimulaciones] = useState('');

    const [isCalculating, setIsCalculating] = useState(false);
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Atención', tipo: 'warning' });
    const [simulacionPendiente, setSimulacionPendiente] = useState(null);
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
            const resultado = await mat251Api.ejecutarSimulacionPuntual(payload);
            if (resultado && resultado.error) {
                mostrarAlerta(resultado.error, "Error en la Simulación", "error");
                onCalcular(null);
            } else {
                onCalcular(resultado);
            }
        } catch (error) {
            mostrarAlerta(error.message || 'Hubo un error al ejecutar la simulación.', "Error en la Simulación", "error");
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

        const numN = Number(n);
        const numSims = Number(numSimulaciones);
        const totalDatos = numN * numSims;
        const payload = {
            distribucion,
            paramsDist,
            n: numN,
            numSimulaciones: numSims,
            parametro,
            incluirMuestras: totalDatos <= 5000
        };

        if (totalDatos > 5000) {
            setSimulacionPendiente(payload);
            mostrarAlerta(
                "La simulación supera los 5.000 datos. Se mostrarán los resultados, pero no la tabla de muestras.",
                "Aviso sobre las muestras",
                "warning"
            );
            return;
        }

        await ejecutarSimulacion(payload);
    };

    const cerrarModalAlerta = () => {
        setModalAlerta(prev => ({ ...prev, isOpen: false }));
        if (simulacionPendiente) {
            const payload = simulacionPendiente;
            setSimulacionPendiente(null);
            ejecutarSimulacion(payload);
        }
    };

    return (
        <div style={{ padding: '0px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
                <div className="tema5-sim-distribucion-selector" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
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
                    <div className="tema5-simulacion-ayuda">
                        <button
                            type="button"
                            id="tema5-ayuda-simulador"
                            className="tema5-simulacion-ayuda-boton"
                            aria-label="Ayuda sobre el simulador"
                            aria-describedby="tema5-ayuda-contenido"
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M9.6 9a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.8" />
                                <path d="M12 17h.01" />
                            </svg>
                        </button>
                        <div id="tema5-ayuda-contenido" className="tema5-simulacion-ayuda-panel" role="tooltip">
                            <strong>¿Qué puedes hacer?</strong>
                            <p>Genera muestras aleatorias repetidas para observar cómo se comporta el estimador seleccionado.</p>
                            <ul>
                                <li>Elige una distribución poblacional y completa sus parámetros.</li>
                                <li>{renderKatex('n', true)} indica el tamaño de cada muestra.</li>
                                <li>{renderKatex('N', true)} indica cuántas simulaciones se ejecutarán.</li>
                                <li>Al ejecutar, consulta los resultados y la variación entre las estimaciones.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Parámetros de la distribución */}
                <div style={{ background: 'var(--bg-input, #f1f5f9)', padding: '10px', border: '1px solid rgba(0, 0, 0, 0.12)', borderRadius: '5px' }}>
                    <div style={{ fontSize: FS.xs, fontWeight: 'bold', marginBottom: '12px', color: 'var(--text-pure)' }}>PARÁMETROS DE LA DISTRIBUCIÓN</div>
                    <div className="tema5-simulacion-parametros-fila" style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        {distribucion === 'normal' && (
                            <>
                                <div className="tema5-simulacion-campo" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                            <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('\\mu:', true)}</label>
                                    <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={mu} onChange={e => setMu(e.target.value)} placeholder="Media" />
                                </div>
                                <div className="tema5-simulacion-campo" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                            <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('\\sigma:', true)}</label>
                                    <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={sigma} onChange={e => setSigma(e.target.value)} min="0.001" placeholder="Desv. Estándar" />
                                </div>
                            </>
                        )}
                        {(distribucion === 'bernoulli' || distribucion === 'binomial') && (
                            <div
                                className={`tema5-simulacion-campo ${distribucion === 'bernoulli' ? 'tema5-simulacion-campo-centrado' : ''}`}
                                style={{ flex: distribucion === 'bernoulli' ? '0 1 50%' : 1, maxWidth: distribucion === 'bernoulli' ? '50%' : undefined, margin: distribucion === 'bernoulli' ? '0 auto' : undefined, display: 'flex', alignItems: 'center', gap: '8px', minWidth: distribucion === 'bernoulli' ? 0 : '220px' }}
                            >
                            <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('p:', true)}</label>
                                <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={p} onChange={e => setP(e.target.value)} min="0" max="1" step="0.01" placeholder="Probabilidad de éxito" />
                            </div>
                        )}
                        {distribucion === 'binomial' && (
                            <div className="tema5-simulacion-campo" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                            <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('n:', true)}</label>
                                <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={nEnsayos} onChange={e => setNEnsayos(e.target.value)} min="1" placeholder="Nº de Ensayos" />
                            </div>
                        )}
                        {distribucion === 'poisson' && (
                            <div className="tema5-simulacion-campo tema5-simulacion-campo-centrado" style={{ flex: '0 1 50%', maxWidth: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('\\lambda:', true)}</label>
                                <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={lambda} onChange={e => setLambda(e.target.value)} min="0.001" placeholder="Tasa" />
                            </div>
                        )}
                        {distribucion === 'uniforme' && (
                            <>
                                <div className="tema5-simulacion-campo" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                                <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('a:', true)}</label>
                                    <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={a} onChange={e => setA(e.target.value)} placeholder="Mínimo" />
                                </div>
                                <div className="tema5-simulacion-campo" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}>
                                <label style={{ ...localLabelStyle, margin: 0, whiteSpace: 'nowrap' }}>{renderKatex('b:', true)}</label>
                                    <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, width: '100%' }} value={b} onChange={e => setB(e.target.value)} placeholder="Máximo" />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Parámetros de Simulación */}
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
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <button 
                    className="button_calcular"
                    style={{ width: 'auto', padding: '5px 15px', opacity: isCalculating ? 0.7 : 1, cursor: isCalculating ? 'wait' : 'pointer' }} 
                    onClick={handleCalcular}
                    disabled={isCalculating}
                >
                    {isCalculating ? 'Calculando...' : 'Ejecutar Simulación'}
                </button>
            </div>
            
            <ModalAlerta
                isOpen={modalAlerta.isOpen}
                mensaje={modalAlerta.mensaje}
                titulo={modalAlerta.titulo}
                tipo={modalAlerta.tipo}
                onClose={cerrarModalAlerta}
            />


        </div>
    );
}
