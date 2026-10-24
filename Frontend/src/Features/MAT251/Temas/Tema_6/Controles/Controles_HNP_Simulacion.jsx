import React, { useState, useRef, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { jStat } from 'jstat';
import { cardStyle, labelStyle, FS, RADIUS } from '../../../Principal/Constantes';
import ModalAlerta from '../../../ui/ModalAlerta';
import { pruebaChiCuadradaBondad, pruebaChiCuadradaIndependencia, pruebaSignos, pruebaRachas } from '../../../Matematicas/Logica_Tema6';

const renderKatex = (math) => <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />;

export default function Controles_HNP_Simulacion({ prueba, setResultadosSimulacion }) {
    const [alpha, setAlpha] = useState(0.05);
    const [n, setN] = useState('');
    const [n1Rachas, setN1Rachas] = useState('');
    const [n2Rachas, setN2Rachas] = useState('');
    const [numSimsText, setNumSimsText] = useState('');

    // Chi-cuadrada
    const [subTipoChi, setSubTipoChi] = useState('bondad');
    const [k, setK] = useState('');
    const [filasSim, setFilasSim] = useState('');
    const [colsSim, setColsSim] = useState('');

    // Signos
    const [sObs, setSObs] = useState('');
    const [tipoPrueba, setTipoPrueba] = useState('bilateral');

    // UI states
    const [isAlphaOpen, setIsAlphaOpen] = useState(false);
    const [isTipoChiOpen, setIsTipoChiOpen] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Atención', tipo: 'warning' });

    const alphaRef = useRef();
    const tipoChiRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (alphaRef.current && !alphaRef.current.contains(event.target)) setIsAlphaOpen(false);
            if (tipoChiRef.current && !tipoChiRef.current.contains(event.target)) setIsTipoChiOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const alphaOptions = [
        { value: 0.10, label: '0.10 (90%) - Significación' },
        { value: 0.05, label: '0.05 (95%) - Significación' },
        { value: 0.01, label: '0.01 (99%) - Significación' }
    ];

    const chiOptions = [
        { value: 'bondad', label: 'Bondad de Ajuste' },
        { value: 'independencia', label: 'Independencia' }
    ];

    const mostrarAlerta = (mensaje, titulo = 'Atención', tipo = 'warning') => {
        setModalAlerta({ isOpen: true, mensaje, titulo, tipo });
    };

    const handleSimular = () => {
        let numN = parseInt(n) || 0;
        const numK = parseInt(k) || 0;
        const numFilas = parseInt(filasSim) || 0;
        const numCols = parseInt(colsSim) || 0;
        const numS = parseInt(sObs);

        const n1R = parseInt(n1Rachas) || 0;
        const n2R = parseInt(n2Rachas) || 0;

        if (prueba === 'rachas') {
            if (n1R <= 0 || n2R <= 0 || !numSimsText || numSimsText.trim() === '') {
                mostrarAlerta('Por favor, ingresa los tamaños n1, n2 y el número de simulaciones.', 'Faltan Parámetros');
                return;
            }
            numN = n1R + n2R;
        } else {
            if (!numSimsText || numSimsText.trim() === '' || numN <= 0) {
                mostrarAlerta('Por favor, ingresa el tamaño de la muestra (n) y el número de simulaciones.', 'Faltan Parámetros');
                return;
            }
        }



        let rawNumSimsInt = parseInt(numSimsText);
        if (rawNumSimsInt > 10000) {
            mostrarAlerta('El máximo permitido es de 10,000 simulaciones para evitar que tu navegador se congele. El valor se ha ajustado automáticamente a 10,000.', 'Límite Alcanzado');
            setNumSimsText('10000');
            return;
        }
        const numSimsInt = rawNumSimsInt;

        setIsCalculating(true);
        setTimeout(() => {
            let rechazos = 0;
            let noRechazos = 0;
            let historial = [];

            if (prueba === 'chi_cuadrada') {
                if (subTipoChi === 'bondad') {
                    if (numK <= 1) {
                        mostrarAlerta('Debes ingresar al menos 2 categorías (k).', 'Error');
                        setIsCalculating(false);
                        return;
                    }
                    const recMin = numK * 5;
                    if (numN < recMin) {
                        mostrarAlerta(`El tamaño de la muestra (n) es demasiado pequeño. Para k=${numK}, necesitas n >= ${recMin}.`, 'Error de Simulación', 'error');
                        setIsCalculating(false);
                        return;
                    }

                    for (let i = 0; i < numSimsInt; i++) {
                        const observadas = new Array(numK).fill(0);
                        for (let j = 0; j < numN; j++) {
                            const idx = Math.floor(Math.random() * numK);
                            observadas[idx]++;
                        }
                        const esperadas = new Array(numK).fill(numN / numK);
                        const resTest = pruebaChiCuadradaBondad(observadas, esperadas, alpha);
                        if (!resTest.error) {
                            if (resTest.decision === 'Rechazar H₀') rechazos++;
                            else noRechazos++;
                            const simItem = { iteracion: i + 1, estadistico: resTest.estadistico, pValor: resTest.pValor, decision: resTest.decision };
                            if (numSimsInt <= 5000) simItem.observadas = observadas;
                            historial.push(simItem);
                        }
                    }
                    
                    const df = numK - 1;
                    const valCritico = jStat.chisquare.inv(1 - alpha, df);
                    const total = rechazos + noRechazos;
                    const promedioCalculado = historial.length > 0 ? (historial.reduce((sum, current) => sum + current.estadistico, 0) / historial.length) : 0;
                    
                    setResultadosSimulacion({
                        tipo: 'chi_cuadrada', subtipo: 'bondad', total, rechazos, noRechazos,
                        pRechazo: total > 0 ? (rechazos / total) * 100 : 0, pNoRechazo: total > 0 ? (noRechazos / total) * 100 : 0,
                        promedioEstadistico: promedioCalculado, df, valorCritico: valCritico, alpha, n: numN, k: numK, historial
                    });
                    setIsCalculating(false);
                    return;
                } else if (subTipoChi === 'independencia') {
                    if (numFilas <= 1 || numCols <= 1) {
                        mostrarAlerta('Filas y columnas deben ser al menos 2.', 'Error');
                        setIsCalculating(false);
                        return;
                    }
                    const recMin = numFilas * numCols * 5;
                    if (numN < recMin) {
                        mostrarAlerta(`El tamaño de la muestra (n) es demasiado pequeño. Para ${numFilas}x${numCols}, necesitas n >= ${recMin}.`, 'Error de Simulación', 'error');
                        setIsCalculating(false);
                        return;
                    }

                    for (let i = 0; i < numSimsInt; i++) {
                        const matrizNum = Array.from({ length: numFilas }, () => new Array(numCols).fill(0));
                        for (let j = 0; j < numN; j++) {
                            const r = Math.floor(Math.random() * numFilas);
                            const c = Math.floor(Math.random() * numCols);
                            matrizNum[r][c]++;
                        }
                        const resTest = pruebaChiCuadradaIndependencia(matrizNum, alpha);
                        if (!resTest.error) {
                            if (resTest.decision === 'Rechazar H₀') rechazos++;
                            else noRechazos++;
                            const simItem = { iteracion: i + 1, estadistico: resTest.estadistico, pValor: resTest.pValor, decision: resTest.decision };
                            if (numSimsInt <= 5000) simItem.matrizNum = matrizNum;
                            historial.push(simItem);
                        }
                    }
                    
                    const df = (numFilas - 1) * (numCols - 1);
                    const valCritico = jStat.chisquare.inv(1 - alpha, df);
                    const total = rechazos + noRechazos;
                    const promedioCalculado = historial.length > 0 ? (historial.reduce((sum, current) => sum + current.estadistico, 0) / historial.length) : 0;
                    
                    setResultadosSimulacion({
                        tipo: 'chi_cuadrada', subtipo: 'independencia', total, rechazos, noRechazos,
                        pRechazo: total > 0 ? (rechazos / total) * 100 : 0, pNoRechazo: total > 0 ? (noRechazos / total) * 100 : 0,
                        promedioEstadistico: promedioCalculado, df, valorCritico: valCritico, alpha, n: numN, filas: numFilas, cols: numCols, historial
                    });
                    setIsCalculating(false);
                    return;
                }
            }

            let n1R = 0;
            let n2R = 0;
            let baseRachasArray = [];
            let muR = 0;
            let sigmaR = 0;
            let zCrit = 0;

            if (prueba === 'rachas') {
                n1R = parseInt(n1Rachas) || 0;
                n2R = parseInt(n2Rachas) || 0;
                const nTotal = n1R + n2R;
                muR = ((2 * n1R * n2R) / nTotal) + 1;
                const varR = (2 * n1R * n2R * (2 * n1R * n2R - nTotal)) / (Math.pow(nTotal, 2) * (nTotal - 1));
                sigmaR = Math.sqrt(varR);
                
                if (tipoPrueba === 'bilateral') {
                    zCrit = jStat.normal.inv(1 - alpha / 2, 0, 1);
                } else if (tipoPrueba === 'derecha') {
                    zCrit = jStat.normal.inv(1 - alpha, 0, 1);
                } else if (tipoPrueba === 'izquierda') {
                    zCrit = jStat.normal.inv(alpha, 0, 1);
                }
                
                for (let i = 0; i < n1R; i++) baseRachasArray.push('+');
                for (let i = 0; i < n2R; i++) baseRachasArray.push('-');
            }

            for (let i = 0; i < numSimsInt; i++) {
                let res = null;
                if (prueba === 'signos') {
                    let exitos = 0;
                    for (let j = 0; j < numN; j++) {
                        if (Math.random() > 0.5) exitos++;
                    }
                    
                    let pValor = 0;
                    if (numN > 25) {
                        // Aproximación Normal (Z) con corrección de continuidad
                        const mu = 0.5 * numN;
                        const sigma = Math.sqrt(numN * 0.25);
                        
                        // Factor de Corrección por Continuidad (x + 0.5 o x - 0.5)
                        let correccion = 0;
                        if (exitos < mu) correccion = 0.5;
                        else if (exitos > mu) correccion = -0.5;
                        
                        const Z_c = (exitos + correccion - mu) / sigma;
                        
                        if (tipoPrueba === 'bilateral') {
                            pValor = 2 * (1 - jStat.normal.cdf(Math.abs(Z_c), 0, 1));
                        } else if (tipoPrueba === 'derecha') {
                            pValor = 1 - jStat.normal.cdf(Z_c, 0, 1);
                        } else if (tipoPrueba === 'izquierda') {
                            pValor = jStat.normal.cdf(Z_c, 0, 1);
                        }
                    } else {
                        // Exacta Binomial
                        if (tipoPrueba === 'bilateral') {
                            const p1 = jStat.binomial.cdf(exitos, numN, 0.5);
                            const p2 = 1 - jStat.binomial.cdf(exitos - 1, numN, 0.5);
                            pValor = Math.min(1, 2 * Math.min(p1, p2));
                        } else if (tipoPrueba === 'derecha') {
                            pValor = 1 - jStat.binomial.cdf(exitos - 1, numN, 0.5);
                        } else if (tipoPrueba === 'izquierda') {
                            pValor = jStat.binomial.cdf(exitos, numN, 0.5);
                        }
                    }
                    
                    let rechaza = pValor <= alpha;
                    
                    if (rechaza) rechazos++;
                    else noRechazos++;
                    
                    const simItem = { 
                        iteracion: i + 1, 
                        signosPositivos: exitos,
                        signosNegativos: numN - exitos,
                        estadistico: exitos, 
                        pValor,
                        decision: rechaza ? 'Rechazar H₀' : 'No Rechazar H₀' 
                    };
                    if (numSimsInt <= 5000) historial.push(simItem);
                } else if (prueba === 'rachas') {
                    // Fisher-Yates shuffle
                    let arr = [...baseRachasArray];
                    for (let j = arr.length - 1; j > 0; j--) {
                        const idx = Math.floor(Math.random() * (j + 1));
                        [arr[j], arr[idx]] = [arr[idx], arr[j]];
                    }
                    
                    // Contar rachas (R)
                    let r = 1;
                    for (let j = 1; j < arr.length; j++) {
                        if (arr[j] !== arr[j - 1]) r++;
                    }

                    // Calcular Z con corrección de continuidad
                    let correccion = 0;
                    if (r < muR) correccion = 0.5;
                    else if (r > muR) correccion = -0.5;
                    
                    const Z_c = (r + correccion - muR) / sigmaR;
                    
                    let pValor;
                    let rechaza;
                    if (tipoPrueba === 'bilateral') {
                        pValor = 2 * (1 - jStat.normal.cdf(Math.abs(Z_c), 0, 1));
                        rechaza = Math.abs(Z_c) >= Math.abs(zCrit);
                    } else if (tipoPrueba === 'derecha') {
                        pValor = 1 - jStat.normal.cdf(Z_c, 0, 1);
                        rechaza = Z_c >= zCrit;
                    } else if (tipoPrueba === 'izquierda') {
                        pValor = jStat.normal.cdf(Z_c, 0, 1);
                        rechaza = Z_c <= zCrit;
                    }
                    
                    if (rechaza) rechazos++;
                    else noRechazos++;
                    
                    if (numSimsInt <= 5000) {
                        historial.push({
                            iteracion: i + 1,
                            rachas: r,
                            n1: n1R,
                            n2: n2R,
                            estadistico: Z_c,
                            pValor: pValor,
                            decision: rechaza ? 'Rechazar H₀' : 'Aceptar H₀'
                        });
                    }
                }
            }

            const total = rechazos + noRechazos;
            setResultadosSimulacion({
                tipo: prueba, total, rechazos, noRechazos,
                pRechazo: total > 0 ? (rechazos / total) * 100 : 0, pNoRechazo: total > 0 ? (noRechazos / total) * 100 : 0, alpha, n: numN,
                historial: (prueba === 'signos' || prueba === 'rachas') ? historial : undefined, tipoPrueba,
                muR, sigmaR, valorCritico: zCrit
            });
            setIsCalculating(false);
        }, 10);
    };

    const alphaSelector = (
        <div ref={alphaRef} style={{ position: 'relative', width: '100%' }}>
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
    );

    const ayudaSimulacion = (
        <div className="tema5-simulacion-ayuda" style={{ top: '5px', right: '5px' }}>
            <button
                type="button"
                className="tema5-simulacion-ayuda-boton btn-mat251-ayuda-hipotesis"
                id="tema6-ayuda-hipotesis-no-parametrica"
                aria-label="Ayuda sobre la simulación de pruebas no paramétricas"
                aria-describedby="tema6-ayuda-hipotesis-no-parametrica-contenido"
            >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M9.6 9a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.8" />
                    <path d="M12 17h.01" />
                </svg>
            </button>
            <div id="tema6-ayuda-hipotesis-no-parametrica-contenido" className="tema5-simulacion-ayuda-panel" role="tooltip">
                <strong>Simulación de pruebas no paramétricas</strong>
                <p>Repite la prueba con muestras aleatorias para observar sus resultados.</p>
                <ul>
                    <li>Configura el tamaño de muestra y la cantidad de simulaciones para la prueba seleccionada.</li>
                    <li>En cada repetición se calcula el estadístico y su p-valor, y se decide si se rechaza o se acepta {renderKatex('\\mathbf{H}_0')} con el nivel {renderKatex('\\boldsymbol{\\alpha}')} elegido.</li>
                    <li>Consulta la distribución, el histograma y el historial; puedes guardar o descargar los resultados.</li>
                </ul>
            </div>
        </div>
    );

    return (
        <div style={{ ...cardStyle, ...(prueba === 'chi_cuadrada' || prueba === 'signos' || prueba === 'rachas' ? { padding: 0, border: 'none' } : {}) }}>

            {prueba === 'signos' || prueba === 'rachas' ? (
                <>
                    <div style={{ background: 'var(--bg-input, #f1f5f9)', padding: prueba === 'rachas' ? '15px 10px' : '15px', border: '1px solid var(--border-color)', borderRadius: RADIUS, position: 'relative', marginBottom: '20px' }}>
                        {ayudaSimulacion}
                        <div style={{ fontSize: FS.xs, fontWeight: 'bold', marginBottom: '15px', color: 'var(--text-pure)', textAlign: 'center' }}>PARÁMETROS DE SIMULACIÓN</div>
                        {prueba === 'signos' ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: '45px', textAlign: 'right' }}>{renderKatex('\\boldsymbol{n}:')}</label>
                                <input type="number" className="input-mat251 placeholder-small" style={{ flex: '0 1 50%', minWidth: 0 }} value={n} onChange={e => setN(e.target.value)} min="2" placeholder="Tamaño de muestra" />
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: 'auto', whiteSpace: 'nowrap' }}>{renderKatex('\\boldsymbol{n_1}:')}</label>
                                    <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, minWidth: 0 }} value={n1Rachas} onChange={e => setN1Rachas(e.target.value)} min="1" placeholder="Símbolo 1" />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: 'auto', whiteSpace: 'nowrap' }}>{renderKatex('\\boldsymbol{n_2}:')}</label>
                                    <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, minWidth: 0 }} value={n2Rachas} onChange={e => setN2Rachas(e.target.value)} min="1" placeholder="Símbolo 2" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: 'auto', textAlign: 'right' }}>{renderKatex('\\boldsymbol{\\alpha}:')}</label>
                            <div style={{ flex: 1 }}>
                                {alphaSelector}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: '45px', textAlign: 'right' }}>{renderKatex('\\boldsymbol{H_1}:')}</label>
                            <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                                {['bilateral', 'derecha', 'izquierda'].map(tipo => {
                                    const isSelected = tipoPrueba === tipo;
                                    const mathStr = tipo === 'bilateral' ? `\\neq` : tipo === 'derecha' ? `>` : `<`;
                                    return (
                                        <div
                                            key={tipo}
                                            onClick={() => setTipoPrueba(tipo)}
                                            style={{
                                                flex: 1, padding: '6px 0', textAlign: 'center', cursor: 'pointer',
                                                border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color, #cbd5e1)'}`,
                                                borderRadius: RADIUS || '4px',
                                                background: isSelected ? 'var(--accent-color)' : 'var(--bg-input, #fff)',
                                                color: isSelected ? '#fff' : 'var(--text-pure)',
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
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: 'auto', textAlign: 'right' }}>{renderKatex('\\boldsymbol{N}:')}</label>
                            <input type="number" className="input-mat251 placeholder-small" style={{ flex: '0 1 50%', minWidth: 0 }} value={numSimsText} onChange={e => setNumSimsText(e.target.value)} min="1" max="10000" placeholder="Número de simulaciones" />
                        </div>
                    </div>
                </>
            ) : (
                <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div style={{ background: 'var(--bg-input, #f1f5f9)', padding: '15px', border: '1px solid var(--border-color)', borderRadius: RADIUS, position: 'relative' }}>
                    {prueba === 'chi_cuadrada' && ayudaSimulacion}
                    <div style={{ fontSize: FS.xs, fontWeight: 'bold', marginBottom: '15px', color: 'var(--text-pure)', textAlign: prueba === 'chi_cuadrada' ? 'center' : 'left' }}>PARÁMETROS DE SIMULACIÓN</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                        {prueba === 'chi_cuadrada' && subTipoChi === 'bondad' && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>{renderKatex('\\boldsymbol{k}:')}</label>
                                <input type="number" className="input-mat251 placeholder-small" style={{ flex: '0 1 50%', minWidth: 0 }} value={k} onChange={e => setK(e.target.value)} placeholder="Número de categorías" min="2" />
                            </div>
                        )}
                        {prueba === 'chi_cuadrada' && subTipoChi === 'independencia' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: 'auto', whiteSpace: 'nowrap' }}>{renderKatex('\\boldsymbol{F}:')}</label>
                                    <input type="number" className="input-mat251 placeholder-small" value={filasSim} onChange={e => setFilasSim(e.target.value)} placeholder="Filas" style={{ flex: 1, minWidth: '0' }} min="2" />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: 'auto', whiteSpace: 'nowrap' }}>{renderKatex('\\boldsymbol{C}:')}</label>
                                    <input type="number" className="input-mat251 placeholder-small" value={colsSim} onChange={e => setColsSim(e.target.value)} placeholder="Columnas" style={{ flex: 1, minWidth: '0' }} min="2" />
                                </div>
                            </div>
                        )}

                        {prueba === 'rachas' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', alignItems: 'center', gap: '15px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'max-content minmax(0, 1fr)', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', whiteSpace: 'nowrap' }}>{renderKatex('\\boldsymbol{n_1}:')}</label>
                                    <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, minWidth: '0' }} value={n1Rachas} onChange={e => setN1Rachas(e.target.value)} min="1" placeholder="Símbolo 1" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'max-content minmax(0, 1fr)', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', whiteSpace: 'nowrap' }}>{renderKatex('\\boldsymbol{n_2}:')}</label>
                                    <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1, minWidth: '0' }} value={n2Rachas} onChange={e => setN2Rachas(e.target.value)} min="1" placeholder="Símbolo 2" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="hnp-simulacion-campos-configuracion" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: 'auto', textAlign: 'right' }}>{renderKatex('\\boldsymbol{\\alpha}:')}</label>
                    <div style={{ flex: 1 }}>
                        {alphaSelector}
                    </div>
                </div>

                {prueba === 'chi_cuadrada' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Tipo:</label>
                        <div ref={tipoChiRef} style={{ position: 'relative', flex: 1 }}>
                            <div
                                onClick={() => setIsTipoChiOpen(!isTipoChiOpen)}
                                style={{
                                    padding: '8px 12px', background: 'var(--bg-card)',
                                    border: `1px solid ${isTipoChiOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                    borderRadius: RADIUS || '4px', cursor: 'pointer',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    fontSize: FS.sm, color: 'var(--text-pure)',
                                    boxShadow: isTipoChiOpen ? '0 0 0 3px rgba(0,123,255,0.15)' : 'none',
                                    transition: 'all 0.2s ease', userSelect: 'none'
                                }}
                            >
                                <span style={{ fontWeight: 500 }}>{chiOptions.find(o => o.value === subTipoChi)?.label}</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    style={{ transform: isTipoChiOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease', color: 'var(--text-pure)', flexShrink: 0 }}>
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                            {isTipoChiOpen && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                                    borderRadius: RADIUS || '4px', zIndex: 1000, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden'
                                }}>
                                    {chiOptions.map(opt => (
                                        <div 
                                            key={opt.value}
                                            onClick={() => { setSubTipoChi(opt.value); setIsTipoChiOpen(false); }}
                                            style={{ 
                                                padding: '8px 12px', cursor: 'pointer', fontSize: FS.sm,
                                                background: subTipoChi === opt.value ? 'var(--primary-light, #eff6ff)' : 'transparent',
                                                color: subTipoChi === opt.value ? 'var(--primary-color)' : 'var(--text-main)',
                                                borderBottom: '1px solid var(--border-light, #f1f5f9)'
                                            }}
                                            onMouseEnter={(e) => { if (subTipoChi !== opt.value) e.target.style.background = 'var(--bg-hover, #f8fafc)'; }}
                                            onMouseLeave={(e) => { if (subTipoChi !== opt.value) e.target.style.background = 'transparent'; }}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {prueba === 'rachas' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: '45px', textAlign: 'right' }}>{renderKatex('\\boldsymbol{H_1}:')}</label>
                        <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                            {['bilateral', 'derecha', 'izquierda'].map(tipo => {
                                const isSelected = tipoPrueba === tipo;
                                const mathStr = tipo === 'bilateral' ? `\\neq` : tipo === 'derecha' ? `>` : `<`;
                                return (
                                    <div
                                        key={tipo}
                                        onClick={() => setTipoPrueba(tipo)}
                                        style={{
                                            flex: 1, padding: '6px 0', textAlign: 'center', cursor: 'pointer',
                                            border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color, #cbd5e1)'}`,
                                            borderRadius: RADIUS || '4px',
                                            background: isSelected ? 'var(--accent-color)' : 'var(--bg-input, #fff)',
                                            color: isSelected ? '#fff' : 'var(--text-pure)',
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
                    </div>
                )}
            </div>

            <div className="hnp-simulacion-campos-muestra" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                {prueba !== 'rachas' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: 'auto', textAlign: 'right' }}>{renderKatex('\\boldsymbol{n}:')}</label>
                        <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1 }} value={n} onChange={e => setN(e.target.value)} min="2" placeholder="Tamaño de muestra" />
                    </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>{renderKatex('\\boldsymbol{N}:')}</label>
                    <input type="number" className="input-mat251 placeholder-small" style={{ flex: 1 }} value={numSimsText} onChange={e => setNumSimsText(e.target.value)} min="1" max="10000" placeholder="Número de simulaciones" />
                </div>
            </div>
            </>
            )}

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button 
                    className="button_calcular" 
                    style={{ width: 'auto', padding: '5px 15px', opacity: isCalculating ? 0.7 : 1, cursor: isCalculating ? 'wait' : 'pointer' }} 
                    onClick={handleSimular}
                    disabled={isCalculating}
                >
                    {isCalculating ? 'Simulando...' : 'Ejecutar Simulación'}
                </button>
            </div>

            <ModalAlerta isOpen={modalAlerta.isOpen} mensaje={modalAlerta.mensaje} titulo={modalAlerta.titulo} tipo={modalAlerta.tipo} onClose={() => setModalAlerta({ ...modalAlerta, isOpen: false })} />
        </div>
    );
}
