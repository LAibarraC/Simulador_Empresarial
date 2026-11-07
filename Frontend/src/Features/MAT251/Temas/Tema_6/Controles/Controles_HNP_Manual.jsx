import React, { useState, useRef, useEffect } from 'react';
import { cardStyle, labelStyle, FS, RADIUS, FONT } from '../../../Principal/Constantes';
import ModalAlerta from '../../../ui/ModalAlerta';
import StatLabel from '../../../ui/StatLabel';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const renderKatex = (math) => <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />;

export default function Controles_HNP_Manual({ prueba, configuracion, onEditar, onCalcular, bloquearHistorial = false }) {
    const { alpha, tipoChiCuadrada, filasBondad, indFilas, indCols, matrizInd, nombresFilas, nombresCols, signosPositivos, signosNegativos, tipoPrueba, n1Rachas, n2Rachas, obsRachas } = configuracion;
    const setAlpha = valor => onEditar('alpha', valor);
    const setTipoChiCuadrada = valor => { if (!bloquearHistorial) onEditar('tipoChiCuadrada', valor); };
    const setFilasBondad = valor => onEditar('filasBondad', valor);
    const setIndFilas = valor => onEditar('indFilas', valor);
    const setIndCols = valor => onEditar('indCols', valor);
    const setMatrizInd = valor => onEditar('matrizInd', valor);
    const setNombresFilas = valor => onEditar('nombresFilas', valor);
    const setNombresCols = valor => onEditar('nombresCols', valor);
    const setSignosPositivos = valor => onEditar('signosPositivos', valor);
    const setSignosNegativos = valor => onEditar('signosNegativos', valor);
    const setTipoPrueba = valor => onEditar('tipoPrueba', valor);
    const setN1Rachas = valor => onEditar('n1Rachas', valor);
    const setN2Rachas = valor => onEditar('n2Rachas', valor);
    const setObsRachas = valor => onEditar('obsRachas', valor);
    const [isAlphaOpen, setIsAlphaOpen] = useState(false);
    const alphaRef = useRef(null);

    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Atención', tipo: 'warning' });

    // Chi-cuadrada
    const [isTipoChiOpen, setIsTipoChiOpen] = useState(false);
    const tipoChiRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (alphaRef.current && !alphaRef.current.contains(e.target)) setIsAlphaOpen(false);
            if (tipoChiRef.current && !tipoChiRef.current.contains(e.target)) setIsTipoChiOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

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
        const newFilas = filasBondad.map((fila, i) => i === index ? { ...fila, [field]: value === '' ? '' : parseFloat(value) } : fila);
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
        const newMat = matrizInd.map((fila, i) => i === r ? fila.map((valor, j) => j === c ? (val === '' ? '' : parseFloat(val)) : valor) : fila);
        setMatrizInd(newMat);
    };

    const handleCalcular = () => {
        const calculo = onCalcular();
        if (calculo?.error) mostrarAlerta(calculo.error, 'Datos inválidos', 'warning');
    };

    const alphaSelector = (
        <div ref={alphaRef} style={{ position: 'relative', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
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
                                color: 'var(--text-pure)',
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

    const totalesFilasInd = matrizInd.map(fila => fila.reduce((suma, valor) => suma + (Number(valor) || 0), 0));
    const cantidadColumnasInd = matrizInd[0]?.length || 0;
    const totalesColumnasInd = Array.from({ length: cantidadColumnasInd }, (_, columna) =>
        matrizInd.reduce((suma, fila) => suma + (Number(fila[columna]) || 0), 0)
    );
    const totalObservadoInd = totalesFilasInd.reduce((suma, total) => suma + total, 0);

    return (
        <div style={{ ...cardStyle, padding: 0, border: 'none', display: 'flex', flexDirection: 'column' }}>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: 0, order: 1 }}>
                {prueba === 'chi_cuadrada' && (
                    <div style={{ gridColumn: '1 / -1' }}>
                        {tipoChiCuadrada === 'bondad' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div id="tour-t6-hnp-manual-entradas" className="hnp-frecuencias-esperadas-scroll" style={{ width: 'fit-content', maxWidth: '100%', height: filasBondad.length > 10 ? '350px' : 'auto', overflowY: filasBondad.length > 10 ? 'auto' : 'visible', overflowX: 'auto', margin: '0 auto', boxSizing: 'border-box' }}>
                                    <style>{`
                                        .hnp-frecuencias-manual-table { border-collapse: separate !important; border-spacing: 0 !important; border-top: 0 !important; border-left: 1px solid var(--text-pure) !important; border-right: 1px solid var(--text-pure) !important; border-bottom: 1px solid var(--text-pure) !important; }
                                        .hnp-frecuencias-manual-table th, .hnp-frecuencias-manual-table td { border-top: 0 !important; border-left: 0 !important; border-right: 1px solid var(--text-pure) !important; border-bottom: 1px solid var(--text-pure) !important; }
                                        .hnp-frecuencias-manual-table thead th { border-top: 1px solid var(--text-pure) !important; }
                                        .hnp-frecuencias-manual-table th:last-child, .hnp-frecuencias-manual-table td:last-child { border-right: 0 !important; }
                                        .hnp-frecuencias-manual-table tbody tr:last-child td { border-bottom: 0 !important; }
                                    `}</style>
                                    <table className="hnp-frecuencias-manual-table" style={{ width: 'fit-content', maxWidth: '100%', tableLayout: 'auto', borderCollapse: 'separate', borderSpacing: 0, fontFamily: FONT, fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-pure)', background: 'var(--bg-card)' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ position: filasBondad.length > 10 ? 'sticky' : 'static', top: 0, zIndex: 2, background: 'var(--bg-input)', padding: '7px', textAlign: 'center', color: 'var(--text-pure)' }}><StatLabel formulaKey="frecuencia_observada" formulaLatex="\mathbf{O}_i" soloFormula /></th>
                                                <th style={{ position: filasBondad.length > 10 ? 'sticky' : 'static', top: 0, zIndex: 2, background: 'var(--bg-input)', padding: '7px', textAlign: 'center', color: 'var(--text-pure)' }}><StatLabel formulaKey="frecuencia_esperada" formulaLatex="\mathbf{E}_i" soloFormula /></th>
                                                <th style={{ position: filasBondad.length > 10 ? 'sticky' : 'static', top: 0, zIndex: 2, background: 'var(--bg-input)', padding: '7px', textAlign: 'center', color: 'var(--text-pure)' }}>Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filasBondad.map((f, i) => (
                                                <tr key={i}>
                                                    <td style={{ padding: 0 }}>
                                                        <input type="number" className="input-mat251" value={f.obs} onChange={e => updateFilaBondad(i, 'obs', e.target.value)} style={{ width: '110px', maxWidth: '100%', boxSizing: 'border-box', padding: '10px', textAlign: 'center', border: 'none', background: 'transparent', color: 'var(--text-pure)', outline: 'none', fontFamily: 'inherit' }} />
                                                    </td>
                                                    <td style={{ padding: 0 }}>
                                                        <input type="number" className="input-mat251" value={f.esp} onChange={e => updateFilaBondad(i, 'esp', e.target.value)} style={{ width: '110px', maxWidth: '100%', boxSizing: 'border-box', padding: '10px', textAlign: 'center', border: 'none', background: 'transparent', color: 'var(--text-pure)', outline: 'none', fontFamily: 'inherit' }} />
                                                    </td>
                                                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                                        <button className="btn-eliminar-fila-mat251" onClick={() => removeFilaBondad(i)} disabled={filasBondad.length <= 2} title="Eliminar fila" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', width: '30px', height: '30px', padding: 0, background: 'transparent', color: filasBondad.length > 2 ? '#ef4444' : 'var(--text-muted)', border: 'none', borderRadius: '5px', cursor: filasBondad.length > 2 ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease', opacity: filasBondad.length > 2 ? 1 : 0.5, fontFamily: FONT }}
                                                            onMouseEnter={(e) => { if (filasBondad.length > 2) { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.35)'; } }}
                                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = filasBondad.length > 2 ? '#ef4444' : 'var(--text-muted)'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
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
                                <button id="tour-t6-hnp-manual-btn-agregar-fila" onClick={addFilaBondad} className="btn-outline-primary btn-agregar-fila-discreta" style={{ padding: '5px 15px', alignSelf: 'center', background: 'transparent', color: 'var(--primary-color)', border: '1px dashed var(--primary-color)', borderRadius: '5px', cursor: 'pointer', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'all 0.2s ease', fontFamily: 'inherit' }}>
                                    Agregar Fila
                                </button>
                            </div>
                        ) : (
                            <div id="tour-t6-hnp-manual-entradas" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '24px', width: '100%', margin: '0 auto' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', whiteSpace: 'nowrap' }}>Filas:</label>
                                        <input type="number" className="input-mat251" min="2" max="1000" value={indFilas} onChange={e => handleIndDimsChange('filas', e.target.value)} style={{ width: '100px', textAlign: 'center', color: 'var(--text-pure)', boxSizing: 'border-box' }} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', whiteSpace: 'nowrap' }}>Columnas:</label>
                                        <input type="number" className="input-mat251" min="2" max="1000" value={indCols} onChange={e => handleIndDimsChange('cols', e.target.value)} style={{ width: '100px', textAlign: 'center', color: 'var(--text-pure)', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                                <div className="hnp-independencia-manual-scroll" style={{ width: '620px', maxWidth: '100%', height: matrizInd.length > 10 ? '350px' : 'auto', overflowY: matrizInd.length > 10 ? 'auto' : 'visible', overflowX: 'auto', margin: '0 auto', boxSizing: 'border-box' }}>
                                    <style>{`
                                        .hnp-independencia-manual-table { border-collapse: separate !important; border-spacing: 0 !important; border-top: 0 !important; border-left: 1px solid var(--text-pure) !important; border-right: 1px solid var(--text-pure) !important; border-bottom: 1px solid var(--text-pure) !important; }
                                        .hnp-independencia-manual-table th, .hnp-independencia-manual-table td { border-top: 0 !important; border-left: 0 !important; border-right: 1px solid var(--text-pure) !important; border-bottom: 1px solid var(--text-pure) !important; }
                                        .hnp-independencia-manual-table thead th { border-top: 1px solid var(--text-pure) !important; }
                                        .hnp-independencia-manual-table th:last-child, .hnp-independencia-manual-table td:last-child { border-right: 0 !important; }
                                        .hnp-independencia-manual-table tbody tr:last-child th, .hnp-independencia-manual-table tbody tr:last-child td { border-bottom: 0 !important; }
                                    `}</style>
                                    <table className="hnp-independencia-manual-table" style={{ width: '100%', minWidth: `${Math.max(380, ((matrizInd[0]?.length || 2) + 1) * 120)}px`, tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.8rem', fontFamily: FONT, textAlign: 'center', color: 'var(--text-pure)', background: 'var(--bg-card)' }}>
                                        <colgroup>
                                             <col style={{ width: '25%' }} />
                                            {Array.from({ length: matrizInd[0]?.length || 2 }).map((_, i) => (
                                                <col key={i} style={{ width: `${75 / (matrizInd[0]?.length || 2)}%` }} />
                                            ))}
                                        </colgroup>
                                        <thead>
                                            <tr>
                                                <th style={{ position: matrizInd.length > 10 ? 'sticky' : 'static', top: 0, left: 0, zIndex: 3, padding: '7px', background: 'var(--bg-input)', color: 'var(--text-pure)' }}></th>
                                                {Array.from({length: matrizInd[0]?.length || 2}).map((_, i) => (
                                                    <th key={i} style={{ position: matrizInd.length > 10 ? 'sticky' : 'static', top: 0, zIndex: 2, padding: 0, textAlign: 'center', color: 'var(--text-pure)', background: 'var(--bg-input)' }}>
                                                        <input type="text" value={nombresCols[i]} onChange={(e) => updateNombreCol(i, e.target.value)} style={{ width: '100%', minWidth: '60px', boxSizing: 'border-box', padding: '8px', textAlign: 'center', border: 'none', background: 'transparent', color: 'var(--text-pure)', fontWeight: 'bold', outline: 'none', fontFamily: FONT }} />
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {matrizInd.map((row, r) => (
                                                <tr key={r}>
                                                    <th style={{ padding: 0, background: 'var(--bg-input)', color: 'var(--text-pure)', position: 'sticky', left: 0, zIndex: 1 }}>
                                                        <input type="text" value={nombresFilas[r]} onChange={(e) => updateNombreFila(r, e.target.value)} style={{ width: '100%', minWidth: '60px', boxSizing: 'border-box', padding: '8px', textAlign: 'center', border: 'none', background: 'transparent', color: 'var(--text-pure)', fontWeight: 'bold', outline: 'none', fontFamily: FONT }} />
                                                    </th>
                                                    {row.map((val, c) => (
                                                        <td key={c} style={{ padding: 0 }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '3px 0' }}>
                                                                <input type="number" className="input-mat251" value={val} onChange={e => updateMatrizInd(r, c, e.target.value)} style={{ width: '100%', minWidth: '60px', boxSizing: 'border-box', padding: '7px 10px', textAlign: 'center', border: 'none', background: 'transparent', color: 'var(--text-pure)', outline: 'none', fontFamily: FONT }} />
                                                                <small style={{ color: 'var(--text-pure)', fontSize: FS.xs }}>Esperada: {totalObservadoInd > 0 ? ((totalesFilasInd[r] * totalesColumnasInd[c]) / totalObservadoInd).toFixed(2) : '—'}</small>
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-pure)', textAlign: 'center' }}>Ingresa las frecuencias observadas; las esperadas se muestran debajo de cada celda.</p>
                            </div>
                        )}
                    </div>
                )}

                {prueba === 'signos' && (
                    <div id="tour-t6-hnp-manual-entradas" style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', minWidth: '40px', whiteSpace: 'nowrap' }}>Signos (+):</label>
                            <input type="number" className="input-mat251 placeholder-small" value={signosPositivos} onChange={e => setSignosPositivos(e.target.value)} placeholder="Positivos" min="0" style={{ flex: 1 }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', minWidth: '40px', whiteSpace: 'nowrap' }}>Signos (-):</label>
                            <input type="number" className="input-mat251 placeholder-small" value={signosNegativos} onChange={e => setSignosNegativos(e.target.value)} placeholder="Negativos" min="0" style={{ flex: 1 }} />
                        </div>
                    </div>
                )}

                {prueba === 'rachas' && (
                    <div id="tour-t6-hnp-manual-entradas" style={{ gridColumn: '1 / -1', display: 'flex', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', whiteSpace: 'nowrap' }}>{renderKatex('\\mathbf{n}_1')}:</label>
                            <input type="number" className="input-mat251 placeholder-small" value={n1Rachas} onChange={e => setN1Rachas(e.target.value)} placeholder="Tipo 1" min="1" style={{ flex: 1, color: 'var(--text-pure)' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', whiteSpace: 'nowrap' }}>{renderKatex('\\mathbf{n}_2')}:</label>
                            <input type="number" className="input-mat251 placeholder-small" value={n2Rachas} onChange={e => setN2Rachas(e.target.value)} placeholder="Tipo 2" min="1" style={{ flex: 1, color: 'var(--text-pure)' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', whiteSpace: 'nowrap' }}>{renderKatex('\\mathbf{R}')}:</label>
                            <input type="number" className="input-mat251 placeholder-small" value={obsRachas} onChange={e => setObsRachas(e.target.value)} placeholder="Rachas" min="2" style={{ flex: 1, color: 'var(--text-pure)' }} />
                        </div>
                    </div>
                )}
            </div>

            <div id="tour-t6-hnp-manual-config" className="hnp-manual-selectores-configuracion" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '10px', marginBottom: '15px', order: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: 'auto', whiteSpace: 'nowrap' }}>{renderKatex('\\boldsymbol{\\alpha}:')}</label>
                    <div id="tour-t6-hnp-manual-alpha" style={{ flex: 1, minWidth: 0 }}>
                        {alphaSelector}
                    </div>
                </div>

                {prueba === 'chi_cuadrada' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Tipo:</label>
                        <div id="tour-t6-hnp-manual-tipo-chi" ref={tipoChiRef} style={{ position: 'relative', flex: 1 }}>
                            <div
                                aria-disabled={bloquearHistorial}
                                onClick={() => { if (!bloquearHistorial) setIsTipoChiOpen(!isTipoChiOpen); }}
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
                                <span style={{ fontWeight: 500 }}>{chiOptions.find(o => o.value === tipoChiCuadrada)?.label}</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                    style={{ transform: isTipoChiOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease', color: 'var(--text-pure)', flexShrink: 0 }}>
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                            {isTipoChiOpen && !bloquearHistorial && (
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
                                                color: 'var(--text-pure)',
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
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: '45px', textAlign: 'right' }}>{renderKatex('\\mathbf{H}_1:')}</label>
                        <div id="tour-t6-hnp-manual-h1" style={{ display: 'flex', gap: '8px', flex: 1 }}>
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

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0px', order: 2 }}>
                <button id="tour-t6-hnp-manual-btn-calcular" className="button_calcular" style={{ width: 'auto', padding: '5px 15px' }} onClick={handleCalcular}>
                    Calcular Prueba
                </button>
            </div>

            <ModalAlerta isOpen={modalAlerta.isOpen} mensaje={modalAlerta.mensaje} titulo={modalAlerta.titulo} tipo={modalAlerta.tipo} onClose={() => setModalAlerta({ ...modalAlerta, isOpen: false })} />
        </div>
    );
}
