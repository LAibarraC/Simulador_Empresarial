import React, { useState, useRef, useEffect } from 'react';
import { cardStyle, labelStyle, FS, RADIUS } from '../../../Principal/Constantes';
import { pruebaChiCuadradaBondad, pruebaChiCuadradaIndependencia, pruebaSignosResumida, pruebaRachas } from '../../../Matematicas/Logica_Tema6';
import ModalAlerta from '../../../ui/ModalAlerta';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const renderKatex = (math) => <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />;

export default function Controles_HNP_Manual({ prueba, setResultadosManual }) {
    const [alpha, setAlpha] = useState('0.05');
    const [isAlphaOpen, setIsAlphaOpen] = useState(false);
    const alphaRef = useRef(null);

    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Atención', tipo: 'warning' });

    // Chi-cuadrada
    const [tipoChiCuadrada, setTipoChiCuadrada] = useState('bondad');
    const [isTipoChiOpen, setIsTipoChiOpen] = useState(false);
    const tipoChiRef = useRef(null);

    const [filasBondad, setFilasBondad] = useState([{ obs: 20, esp: 25 }, { obs: 30, esp: 25 }, { obs: 25, esp: 25 }]);
    const [indFilas, setIndFilas] = useState(2);
    const [indCols, setIndCols] = useState(2);
    const [matrizInd, setMatrizInd] = useState([[0, 0], [0, 0]]);
    const [nombresFilas, setNombresFilas] = useState(['Fila 1', 'Fila 2']);
    const [nombresCols, setNombresCols] = useState(['Columna 1', 'Columna 2']);

    // Signos
    const [signosPositivos, setSignosPositivos] = useState('');
    const [signosNegativos, setSignosNegativos] = useState('');
    const [tipoPrueba, setTipoPrueba] = useState('bilateral');
    
    // Rachas
    const [n1Rachas, setN1Rachas] = useState('');
    const [n2Rachas, setN2Rachas] = useState('');
    const [obsRachas, setObsRachas] = useState('');

    useEffect(() => {
        const handler = (e) => {
            if (alphaRef.current && !alphaRef.current.contains(e.target)) setIsAlphaOpen(false);
            if (tipoChiRef.current && !tipoChiRef.current.contains(e.target)) setIsTipoChiOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        setResultadosManual(null);
    }, [prueba, tipoChiCuadrada]);

    const alphaOptions = [
        { value: '0.10', label: '0.10 (90%) - Significación' },
        { value: '0.05', label: '0.05 (95%) - Significación' },
        { value: '0.01', label: '0.01 (99%) - Significación' }
    ];

    const chiOptions = [
        { value: 'bondad', label: 'Bondad de Ajuste' },
        { value: 'independencia', label: 'Independencia' }
    ];

    const mostrarAlerta = (mensaje, titulo = 'Atención', tipo = 'warning') => {
        setModalAlerta({ isOpen: true, mensaje, titulo, tipo });
    };

    // Manejadores Chi-cuadrada
    const updateFilaBondad = (index, field, value) => {
        const newFilas = [...filasBondad];
        newFilas[index][field] = value === '' ? '' : parseFloat(value);
        setFilasBondad(newFilas);
    };
    const addFilaBondad = () => setFilasBondad([...filasBondad, { obs: 0, esp: 0 }]);
    const removeFilaBondad = (index) => {
        if (filasBondad.length > 2) {
            setFilasBondad(filasBondad.filter((_, i) => i !== index));
        }
    };

    const handleIndDimsChange = (type, val) => {
        const cleanVal = val.replace(/[^0-9]/g, '');
        const num = cleanVal === '' ? 0 : parseInt(cleanVal, 10);
        
        if (type === 'filas') {
            const currentCols = parseInt(indCols) || 0;
            if (num * Math.max(currentCols, 2) > 1000) {
                mostrarAlerta('El límite máximo es de 1000 celdas en total por rendimiento. Ingresa un número menor.', 'Límite Excedido');
                return;
            }
            setIndFilas(cleanVal);
            if (num >= 2) {
                setMatrizInd(prev => {
                    const newMat = [];
                    const cols = currentCols >= 2 ? currentCols : 2;
                    for (let i = 0; i < num; i++) {
                        newMat.push(prev[i] ? [...prev[i]] : Array(cols).fill(0));
                    }
                    return newMat;
                });
                setNombresFilas(prev => {
                    const newNames = [];
                    for (let i = 0; i < num; i++) {
                        newNames.push(prev[i] || `Fila ${i + 1}`);
                    }
                    return newNames;
                });
            }
        } else {
            const currentFilas = parseInt(indFilas) || 0;
            if (num * Math.max(currentFilas, 2) > 1000) {
                mostrarAlerta('El límite máximo es de 1000 celdas en total por rendimiento. Ingresa un número menor.', 'Límite Excedido');
                return;
            }
            setIndCols(cleanVal);
            if (num >= 2) {
                setMatrizInd(prev => prev.map(row => {
                    const newRow = [...row];
                    while(newRow.length < num) newRow.push(0);
                    return newRow.slice(0, num);
                }));
                setNombresCols(prev => {
                    const newNames = [];
                    for (let i = 0; i < num; i++) {
                        newNames.push(prev[i] || `Columna ${i + 1}`);
                    }
                    return newNames;
                });
            }
        }
    };

    const updateNombreFila = (i, val) => {
        const newNames = [...nombresFilas];
        newNames[i] = val;
        setNombresFilas(newNames);
    };

    const updateNombreCol = (i, val) => {
        const newNames = [...nombresCols];
        newNames[i] = val;
        setNombresCols(newNames);
    };

    const updateMatrizInd = (r, c, val) => {
        const newMat = [...matrizInd];
        newMat[r][c] = val === '' ? '' : parseFloat(val);
        setMatrizInd(newMat);
    };

    const handleCalcular = () => {
        let res = null;
        const numAlpha = Number(alpha);
        if (prueba === 'chi_cuadrada') {
            if (tipoChiCuadrada === 'bondad') {
                const observadas = filasBondad.map(f => Number(f.obs) || 0);
                const esperadas = filasBondad.map(f => Number(f.esp) || 0);
                res = { tipo: 'chi_cuadrada', subtipo: 'bondad', ...pruebaChiCuadradaBondad(observadas, esperadas, numAlpha) };
            } else {
                res = { tipo: 'chi_cuadrada', subtipo: 'independencia', ...pruebaChiCuadradaIndependencia(matrizInd, numAlpha) };
            }
        } else if (prueba === 'signos') {
            if(signosPositivos === '' || signosNegativos === '') {
                mostrarAlerta('Ingresa la cantidad de signos positivos y negativos.', 'Datos Faltantes');
                return;
            }
            res = { tipo: 'signos', ...pruebaSignosResumida(signosPositivos, signosNegativos, numAlpha, tipoPrueba) };
        } else if (prueba === 'rachas') {
            if (n1Rachas === '' || n2Rachas === '' || obsRachas === '') {
                mostrarAlerta('Ingresa n1, n2 y la cantidad de rachas observadas (R).', 'Datos Faltantes');
                return;
            }
            res = { tipo: 'rachas', ...pruebaRachas(Number(n1Rachas), Number(n2Rachas), Number(obsRachas), numAlpha, tipoPrueba) };
        }

        if(res.error) {
            mostrarAlerta(res.error, 'Error de Cálculo', 'error');
            setResultadosManual(null);
            return;
        }
        setResultadosManual(res);
    };

    const alphaSelector = (
        <div ref={alphaRef} style={{ position: 'relative', width: '100%', maxWidth: '235px' }}>
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
    );

    return (
        <div style={cardStyle}>
            <p style={{ fontSize: FS.sm, marginBottom: '10px' }}>
                Ingrese directamente los valores estadísticos conocidos:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px' }}>
                {prueba === 'chi_cuadrada' && (
                    <div style={{ gridColumn: '1 / -1' }}>
                        {tipoChiCuadrada === 'bondad' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ borderRadius: RADIUS || '4px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                        <thead style={{ background: 'var(--header-bg, #f8fafc)' }}>
                                            <tr>
                                                <th style={{ borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', padding: '8px', textAlign: 'center', color: 'var(--text-main)', width: '40%' }}>Observadas ({renderKatex('O_i')})</th>
                                                <th style={{ borderBottom: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', padding: '8px', textAlign: 'center', color: 'var(--text-main)', width: '40%' }}>Esperadas ({renderKatex('E_i')})</th>
                                                <th style={{ borderBottom: '1px solid var(--border-color)', padding: '8px', textAlign: 'center', color: 'var(--text-main)', width: '20%' }}>Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filasBondad.map((f, i) => (
                                                <tr key={i} style={{ borderBottom: i === filasBondad.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                                                    <td style={{ borderRight: '1px solid var(--border-color)', padding: 0 }}>
                                                        <input type="number" className="input-mat251" value={f.obs} onChange={e => updateFilaBondad(i, 'obs', e.target.value)} style={{ width: '100%', padding: '10px', textAlign: 'center', border: 'none', background: 'transparent', outline: 'none' }} />
                                                    </td>
                                                    <td style={{ borderRight: '1px solid var(--border-color)', padding: 0 }}>
                                                        <input type="number" className="input-mat251" value={f.esp} onChange={e => updateFilaBondad(i, 'esp', e.target.value)} style={{ width: '100%', padding: '10px', textAlign: 'center', border: 'none', background: 'transparent', outline: 'none' }} />
                                                    </td>
                                                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                        <button className="red-icono" onClick={() => removeFilaBondad(i)} disabled={filasBondad.length <= 2} title="Eliminar fila" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', width: '30px', height: '30px', padding: 0, background: 'transparent', color: filasBondad.length > 2 ? '#ef4444' : 'var(--text-muted)', border: 'none', borderRadius: '6px', cursor: filasBondad.length > 2 ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease', opacity: filasBondad.length > 2 ? 1 : 0.5 }}
                                                            onMouseEnter={(e) => { if (filasBondad.length > 2) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; }}
                                                            onMouseLeave={(e) => { if (filasBondad.length > 2) e.currentTarget.style.background = 'transparent'; }}
                                                        >
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button onClick={addFilaBondad} className="btn-outline-primary" style={{ padding: '5px 15px', alignSelf: 'center', background: 'transparent', color: 'var(--primary-color)', border: '1px dashed var(--primary-color)', borderRadius: RADIUS || '5px', cursor: 'pointer', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s ease' }}>
                                    Agregar Fila
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px' }}>Filas:</label>
                                        <input type="number" className="input-mat251" min="2" value={indFilas} onChange={e => handleIndDimsChange('filas', e.target.value)} style={{ flex: 1 }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px' }}>Cols:</label>
                                        <input type="number" className="input-mat251" min="2" value={indCols} onChange={e => handleIndDimsChange('cols', e.target.value)} style={{ flex: 1 }} />
                                    </div>
                                </div>
                                <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '400px', borderRadius: RADIUS || '4px', border: '1px solid var(--border-color)' }}>
                                    <table style={{ borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: '100%' }}>
                                        <thead style={{ background: 'var(--header-bg, #f8fafc)', position: 'sticky', top: 0, zIndex: 2 }}>
                                            <tr>
                                                <th style={{ padding: '8px', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', position: 'sticky', left: 0, zIndex: 3, background: 'var(--header-bg, #f8fafc)' }}></th>
                                                {Array.from({length: matrizInd[0]?.length || 2}).map((_, i) => (
                                                    <th key={i} style={{ borderBottom: '1px solid var(--border-color)', borderRight: i === (matrizInd[0]?.length || 2) - 1 ? 'none' : '1px solid var(--border-color)', padding: '0', textAlign: 'center', color: 'var(--text-main)' }}>
                                                        <input 
                                                            type="text" 
                                                            value={nombresCols[i]} 
                                                            onChange={(e) => updateNombreCol(i, e.target.value)} 
                                                            style={{ width: '100%', minWidth: '60px', padding: '8px', textAlign: 'center', border: 'none', background: 'transparent', color: 'inherit', fontWeight: 'bold', outline: 'none' }} 
                                                        />
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {matrizInd.map((row, r) => (
                                                <tr key={r} style={{ borderBottom: r === matrizInd.length - 1 ? 'none' : '1px solid var(--border-color)' }}>
                                                    <th style={{ padding: '0', borderRight: '1px solid var(--border-color)', background: 'var(--header-bg, #f8fafc)', color: 'var(--text-main)', position: 'sticky', left: 0, zIndex: 1 }}>
                                                        <input 
                                                            type="text" 
                                                            value={nombresFilas[r]} 
                                                            onChange={(e) => updateNombreFila(r, e.target.value)} 
                                                            style={{ width: '100%', minWidth: '60px', padding: '8px', textAlign: 'center', border: 'none', background: 'transparent', color: 'inherit', fontWeight: 'bold', outline: 'none' }} 
                                                        />
                                                    </th>
                                                    {row.map((val, c) => (
                                                        <td key={c} style={{ padding: 0, borderRight: c === (matrizInd[0]?.length || 2) - 1 ? 'none' : '1px solid var(--border-color)' }}>
                                                            <input type="number" className="input-mat251" value={val} onChange={e => updateMatrizInd(r, c, e.target.value)} style={{ width: '100%', minWidth: '60px', padding: '10px', textAlign: 'center', border: 'none', background: 'transparent', outline: 'none' }} />
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>* Ingresa solo las frecuencias observadas. Las esperadas se calculan automáticamente.</p>
                            </div>
                        )}
                    </div>
                )}

                {prueba === 'signos' && (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px', whiteSpace: 'nowrap' }}>Signos (+):</label>
                            <input type="number" className="input-mat251 placeholder-small" value={signosPositivos} onChange={e => setSignosPositivos(e.target.value)} placeholder="Positivos" min="0" style={{ flex: 1 }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px', whiteSpace: 'nowrap' }}>Signos (-):</label>
                            <input type="number" className="input-mat251 placeholder-small" value={signosNegativos} onChange={e => setSignosNegativos(e.target.value)} placeholder="Negativos" min="0" style={{ flex: 1 }} />
                        </div>
                    </>
                )}

                {prueba === 'rachas' && (
                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{renderKatex('n_1')}:</label>
                            <input type="number" className="input-mat251 placeholder-small" value={n1Rachas} onChange={e => setN1Rachas(e.target.value)} placeholder="Tipo 1" min="1" style={{ flex: 1 }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{renderKatex('n_2')}:</label>
                            <input type="number" className="input-mat251 placeholder-small" value={n2Rachas} onChange={e => setN2Rachas(e.target.value)} placeholder="Tipo 2" min="1" style={{ flex: 1 }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{renderKatex('R')}:</label>
                            <input type="number" className="input-mat251 placeholder-small" value={obsRachas} onChange={e => setObsRachas(e.target.value)} placeholder="Rachas" min="2" style={{ flex: 1 }} />
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', width: '45px', textAlign: 'right' }}>{renderKatex('\\alpha:')}</label>
                    <div style={{ flex: 1 }}>
                        {alphaSelector}
                    </div>
                </div>

                {prueba === 'chi_cuadrada' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Tipo:</label>
                        <div ref={tipoChiRef} style={{ position: 'relative', flex: 1 }}>
                            <div
                                onClick={() => setIsTipoChiOpen(!isTipoChiOpen)}
                                style={{
                                    padding: '8px 12px', background: 'var(--bg-card)',
                                    border: `1px solid ${isTipoChiOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                    borderRadius: RADIUS || '4px', cursor: 'pointer',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    fontSize: FS.sm, color: 'var(--text-color, var(--text-main))',
                                    boxShadow: isTipoChiOpen ? '0 0 0 3px rgba(0,123,255,0.15)' : 'none',
                                    transition: 'all 0.2s ease', userSelect: 'none'
                                }}
                            >
                                <span style={{ fontWeight: 500 }}>{chiOptions.find(o => o.value === tipoChiCuadrada)?.label}</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    style={{ transform: isTipoChiOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease', color: 'var(--text-muted)', flexShrink: 0 }}>
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
                                            onClick={() => { setTipoChiCuadrada(opt.value); setIsTipoChiOpen(false); }}
                                            style={{ 
                                                padding: '8px 12px', cursor: 'pointer', fontSize: FS.sm,
                                                background: tipoChiCuadrada === opt.value ? 'var(--primary-light, #eff6ff)' : 'transparent',
                                                color: tipoChiCuadrada === opt.value ? 'var(--primary-color)' : 'var(--text-main)',
                                                borderBottom: '1px solid var(--border-light, #f1f5f9)'
                                            }}
                                            onMouseEnter={(e) => { if (tipoChiCuadrada !== opt.value) e.target.style.background = 'var(--bg-hover, #f8fafc)'; }}
                                            onMouseLeave={(e) => { if (tipoChiCuadrada !== opt.value) e.target.style.background = 'transparent'; }}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {(prueba === 'signos' || prueba === 'rachas') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', width: '45px', textAlign: 'right' }}>{renderKatex('H_1:')}</label>
                        <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                            {['bilateral', 'derecha', 'izquierda'].map(tipo => {
                                const isSelected = tipoPrueba === tipo;
                                const mathStr = tipo === 'bilateral' ? `\\neq` : tipo === 'derecha' ? `>` : `<`;
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
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <button className="button_calcular" style={{ width: 'auto', padding: '5px 15px' }} onClick={handleCalcular}>
                    Calcular Prueba
                </button>
            </div>

            <ModalAlerta isOpen={modalAlerta.isOpen} mensaje={modalAlerta.mensaje} titulo={modalAlerta.titulo} tipo={modalAlerta.tipo} onClose={() => setModalAlerta({ ...modalAlerta, isOpen: false })} />
        </div>
    );
}
