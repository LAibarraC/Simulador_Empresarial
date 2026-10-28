import React, { useState, useRef, useEffect } from 'react';
import { pruebaMediaZ, pruebaMediaT, pruebaProporcionZ, pruebaVarianzaChi } from '../../../Matematicas/Logica_Tema6';
import { cardStyle, FS, labelStyle, RADIUS, FONT } from '../../../Principal/Constantes';
import { EditarDatos } from '../../../../../ui/iconos';
import ModalAlerta from '../../../ui/ModalAlerta';
import StatLabel from '../../../ui/StatLabel';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { jStat } from 'jstat';

export default function Controles_HP_Matriz({ prueba, varSeleccionada, filas, statsDatos, abrirEditor, onCalcular }) {
    const [valorExito, setValorExito] = useState('');
    const [sigma, setSigma] = useState('');
    const [mu0, setMu0] = useState('');
    const [p0, setP0] = useState('');
    const [sigma02, setSigma02] = useState('');
    const [alpha, setAlpha] = useState('0.05');
    const [tipoPrueba, setTipoPrueba] = useState('bilateral');

    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Atención', tipo: 'warning' });
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [hoveredExito, setHoveredExito] = useState(null);
    const selectRef = useRef(null);
    const [isAlphaOpen, setIsAlphaOpen] = useState(false);
    const alphaRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (selectRef.current && !selectRef.current.contains(e.target)) setIsSelectOpen(false);
            if (alphaRef.current && !alphaRef.current.contains(e.target)) setIsAlphaOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (!varSeleccionada || statsDatos?.total === 0) {
            setValorExito('');
            setSigma('');
            setMu0('');
            setP0('');
            setSigma02('');
            setAlpha('0.05');
            setTipoPrueba('bilateral');
            onCalcular(null);
        }
    }, [varSeleccionada, statsDatos?.total, onCalcular]);

    const alphaOptions = [
        { value: '0.10', label: '0.10 (90%) - Significación' },
        { value: '0.05', label: '0.05 (95%) - Significación' },
        { value: '0.01', label: '0.01 (99%) - Significación' }
    ];

    const mostrarAlerta = (mensaje, titulo = 'Atención', tipo = 'warning') => {
        setModalAlerta({ isOpen: true, mensaje, titulo, tipo });
    };

    const renderKatex = (math, inheritColor = false) => (
        <span style={{ color: inheritColor ? 'inherit' : 'var(--text-pure)' }} dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const paramSymbol = prueba === 'proporcion' ? 'p' : prueba === 'varianza' ? '\\sigma^2' : '\\mu';
    const paramHypo = prueba === 'proporcion' ? 'p_0' : prueba === 'varianza' ? '\\sigma_0^2' : '\\mu_0';

    const datosCompletos = (varSeleccionada && Array.isArray(filas) ? filas : [])
        .map(f => f.valor)
        .filter(v => v !== undefined && v !== null && v.toString().trim() !== '');

    let statsLive = null;
    if (datosCompletos.length > 0) {
        if (prueba === 'media_z' || prueba === 'media_t' || prueba === 'varianza') {
            const numDatos = datosCompletos.map(Number).filter(d => !isNaN(d));
            if (numDatos.length > 0) {
                const x_barLive = jStat.mean(numDatos);
                const s2Live = numDatos.length > 1 ? jStat.variance(numDatos, true) : 0;
                statsLive = { n: numDatos.length, mean: x_barLive, std: Math.sqrt(s2Live) };
            }
        } else if (prueba === 'proporcion') {
            const nLive = datosCompletos.length;
            const xLive = valorExito ? datosCompletos.filter(d => String(d).trim() === String(valorExito).trim()).length : 0;
            statsLive = { n: nLive, x: xLive, p_hat: nLive > 0 ? xLive / nLive : 0 };
        }
    }

    const handleCalcular = () => {
        if (!datosCompletos || datosCompletos.length === 0) {
            mostrarAlerta('Por favor, selecciona o agrega una variable con datos válidos.', 'Faltan Datos', 'warning');
            return;
        }

        const numAlpha = Number(alpha);
        let res = null;

        if (prueba === 'media_z' || prueba === 'media_t' || prueba === 'varianza') {
            const numDatos = datosCompletos.map(Number).filter(d => !isNaN(d));
            if (numDatos.length === 0) {
                mostrarAlerta('No hay datos numéricos válidos en la matriz para esta prueba.', 'Error', 'error');
                return;
            }

            const n = numDatos.length;
            const x_bar = jStat.mean(numDatos);
            const s2_val = numDatos.length > 1 ? jStat.variance(numDatos, true) : 0;
            const s_val = Math.sqrt(s2_val);

            if (prueba === 'media_z') {
                res = pruebaMediaZ(n, x_bar, Number(sigma), Number(mu0), numAlpha, tipoPrueba);
            } else if (prueba === 'media_t') {
                res = pruebaMediaT(n, x_bar, s_val, Number(mu0), numAlpha, tipoPrueba);
            } else if (prueba === 'varianza') {
                res = pruebaVarianzaChi(n, s2_val, Number(sigma02), numAlpha, tipoPrueba);
            }
        } else if (prueba === 'proporcion') {
            if (!valorExito || valorExito.trim() === '') {
                mostrarAlerta('Por favor, seleccione el valor considerado como éxito.', 'Faltan Datos', 'warning');
                return;
            }
            const n = datosCompletos.length;
            const x = datosCompletos.filter(d => String(d).trim() === String(valorExito).trim()).length;
            res = pruebaProporcionZ(n, x, Number(p0), numAlpha, tipoPrueba);
        }

        if (res?.error) {
            mostrarAlerta(res.error, 'Error de Cálculo', 'error');
            onCalcular(null);
        } else {
            onCalcular({
                ...res,
                datosAnalizados: prueba === 'proporcion' ? [...datosCompletos] : datosCompletos.map(Number).filter(Number.isFinite),
                valorExito: prueba === 'proporcion' ? valorExito : undefined
            });
        }
    };

    const valoresUnicos = prueba === 'proporcion' ? [...new Set(filas
        .map(f => f.valor)
        .filter(v => v !== undefined && v !== null && v.toString().trim() !== '')
        .map(v => v.toString().trim())
    )] : [];
    const columnasResumenMuestra = 1
        + (statsLive?.x !== undefined ? 1 : 0)
        + (statsLive?.mean !== undefined ? 1 : 0)
        + ((prueba === 'media_t' || prueba === 'varianza') && statsLive?.std !== undefined ? 1 : 0)
        + (statsLive?.p_hat !== undefined ? 1 : 0);
    const tablaResumenMuestra = statsLive && (
        <div id="tour-t6-hp-tabla-resumen-muestra" style={{ width: `min(100%, ${columnasResumenMuestra * 120}px)`, maxWidth: '100%', margin: prueba === 'proporcion' ? '0 auto' : '15px auto', border: '1px solid var(--text-pure)', borderRadius: '0px', backgroundColor: 'var(--bg-card)' }}>
            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: FS.sm, fontFamily: FONT, color: 'var(--text-pure)' }}>
                <colgroup>
                    {Array.from({ length: columnasResumenMuestra }, (_, index) => <col key={index} style={{ width: `${100 / columnasResumenMuestra}%` }} />)}
                </colgroup>
                <thead style={{ backgroundColor: 'var(--bg-input)' }}>
                    <tr>
                        <th style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid var(--text-pure)', borderRight: '1px solid var(--text-pure)' }}>
                            <StatLabel formulaKey="n_muestra" formulaLatex={'\\mathbf{n}'} align="center" position="top" />
                        </th>
                        {statsLive.x !== undefined && <th style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid var(--text-pure)', borderRight: '1px solid var(--text-pure)' }}>
                            <StatLabel formulaKey="conteo_eventos" formulaLatex={'\\mathbf{x}'} align="center" position="top" />
                        </th>}
                        {statsLive.mean !== undefined && <th style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid var(--text-pure)' }}>
                            <StatLabel formulaKey="x_barra_observada" formulaLatex={'\\mathbf{\\bar{x}}'} align="center" position="top" />
                        </th>}
                        {(prueba === 'media_t' || prueba === 'varianza') && statsLive.std !== undefined && <th style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid var(--text-pure)', borderLeft: '1px solid var(--text-pure)' }}><StatLabel formulaKey="desviacion_muestral" formulaLatex={'\\mathbf{s}'} align="center" position="top" customTexto="Desviación estándar muestral" customMath={'s = \\sqrt{\\frac{1}{n-1}\\sum_{i=1}^{n}(x_i-\\bar{x})^2}'} /></th>}
                        {statsLive.p_hat !== undefined && <th style={{ padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid var(--text-pure)', borderLeft: '1px solid var(--text-pure)' }}><StatLabel formulaKey="proporcion_muestral" formulaLatex={'\\mathbf{\\hat{p}}'} align="center" position="top" /></th>}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ padding: '8px 12px', textAlign: 'center', borderRight: '1px solid var(--text-pure)' }}>{renderKatex(String(statsLive.n))}</td>
                        {statsLive.x !== undefined && <td style={{ padding: '8px 12px', textAlign: 'center', borderRight: '1px solid var(--text-pure)' }}>{renderKatex(String(statsLive.x))}</td>}
                        {statsLive.mean !== undefined && <td style={{ padding: '8px 12px', textAlign: 'center' }}>{renderKatex(statsLive.mean.toFixed(3))}</td>}
                        {(prueba === 'media_t' || prueba === 'varianza') && statsLive.std !== undefined && <td style={{ padding: '8px 12px', textAlign: 'center', borderLeft: '1px solid var(--text-pure)' }}>{renderKatex(statsLive.std.toFixed(3))}</td>}
                        {statsLive.p_hat !== undefined && <td style={{ padding: '8px 12px', textAlign: 'center', borderLeft: '1px solid var(--text-pure)' }}>{renderKatex(statsLive.p_hat.toFixed(3))}</td>}
                    </tr>
                </tbody>
            </table>
        </div>
    );

    return (
        <div style={{ padding: '0px', fontFamily: FONT }}>            
            <div style={{ marginBottom: '10px' }}>
                <div id="tour-t6-hp-datos-resumen" style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', padding: '10px' }}>
                    <div>
                        <span style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)' }}>Datos:</span>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                            <small title="Datos provenientes de variables externas" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                Cargados: <strong style={{ color: 'var(--text-pure)' }}>{statsDatos?.cargados || 0}</strong>
                            </small>
                            <small title="Datos ingresados manualmente" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                Agregados: <strong style={{ color: 'var(--text-pure)' }}>{statsDatos?.agregados || 0}</strong>
                            </small>
                            <small title="Total de datos válidos" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                Total: <strong style={{ color: 'var(--text-pure)' }}>{statsDatos?.total || 0}</strong>
                            </small>
                        </div>
                    </div>
                    <button
                        onClick={abrirEditor}
                        className="btn-mat251-primario"
                        style={{ padding: '5px 14px', fontSize: FS.sm, backgroundColor: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <EditarDatos />
                        Editar Datos
                    </button>
                </div>
                
                {prueba !== 'proporcion' && tablaResumenMuestra}
            </div>

            {varSeleccionada && datosCompletos.length > 0 ? (
                <>
            <div style={{ ...cardStyle, border: 'none', padding: '0px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '15px', marginTop: '10px', marginBottom: '15px', alignItems: 'start', minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
                {prueba === 'proporcion' && (
                    <div id="tour-t6-hp-exito-selector" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', gridColumn: '1 / -1', width: 'min(100%, 480px)', justifySelf: 'center' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main, #1e293b)', minWidth: '40px' }}>Exito:</label>
                        <div ref={selectRef} style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                            <button
                                type="button"
                                className="btn-mat251-select-exito"
                                aria-haspopup="listbox"
                                aria-expanded={isSelectOpen}
                                onClick={() => setIsSelectOpen(o => !o)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    width: '100%', minHeight: '38px', padding: '8px 12px', boxSizing: 'border-box',
                                    background: 'var(--bg-input, var(--bg-card))',
                                    border: `1px solid ${isSelectOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                    borderRadius: RADIUS, cursor: 'pointer', fontFamily: FONT, fontSize: FS.sm,
                                    color: 'var(--text-pure)',
                                    boxShadow: isSelectOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
                                }}
                            >
                                <span style={{ fontWeight: 500, fontSize: FS.sm, opacity: valorExito ? 1 : 0.65, color: valorExito ? 'var(--text-pure)' : 'var(--text-muted)' }}>
                                    {valorExito || 'Seleccione valor de éxito'}
                                </span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isSelectOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}>
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>
                            {isSelectOpen && (
                                <div role="listbox" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: RADIUS, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)', zIndex: 1000, maxHeight: '260px', overflowY: 'auto', animation: 'fadeInDropdown 0.2s ease' }}>
                                    {valoresUnicos.map((val) => (
                                        <div key={val} role="option" aria-selected={valorExito === val} onMouseEnter={() => setHoveredExito(val)} onMouseLeave={() => setHoveredExito(null)} onClick={() => { setValorExito(val); setIsSelectOpen(false); }} style={{ padding: '9px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', fontSize: FS.sm, fontFamily: FONT, color: valorExito === val ? 'var(--primary-color)' : 'var(--text-pure)', fontWeight: valorExito === val ? 600 : 400, background: hoveredExito === val ? 'var(--bg-input, rgba(0,0,0,0.04))' : valorExito === val ? 'rgba(37, 99, 235, 0.08)' : 'transparent' }}>
                                            {val}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {prueba === 'proporcion' && tablaResumenMuestra && (
                    <div style={{ gridColumn: '1 / -1', justifySelf: 'center', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        {tablaResumenMuestra}
                    </div>
                )}

                {prueba === 'media_t' && (
                    <div id="tour-t6-hp-param-hipotesis" style={{ display: 'flex', alignItems: 'center', gap: '10px', gridColumn: '1 / -1', width: 'min(100%, 50%)', minWidth: 0, justifySelf: 'center', boxSizing: 'border-box' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px', flexShrink: 0 }}>{renderKatex('\\boldsymbol{\\mu}_0:')}</label>
                        <input type="number" className="input-mat251 placeholder-small" value={mu0} onChange={(e) => setMu0(e.target.value)} placeholder="Media hipotética" step="any" style={{ flex: 1, minWidth: 0, width: '100%', boxSizing: 'border-box' }} />
                    </div>
                )}

                {prueba === 'media_z' && (
                    <div id="tour-t6-hp-param-hipotesis" style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '15px', width: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px', flexShrink: 0 }}>{renderKatex('\\boldsymbol{\\mu}_0:')}</label>
                            <input type="number" className="input-mat251 placeholder-small" value={mu0} onChange={(e) => setMu0(e.target.value)} placeholder="Media hipotética" step="any" style={{ flex: 1, minWidth: 0, width: '100%', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px', flexShrink: 0 }}>{renderKatex('\\boldsymbol{\\sigma}:')}</label>
                            <input type="number" className="input-mat251 placeholder-small" value={sigma} onChange={(e) => setSigma(e.target.value)} placeholder="Desv. est. poblacional" min="0" step="any" style={{ flex: 1, minWidth: 0, width: '100%', boxSizing: 'border-box' }} />
                        </div>
                    </div>
                )}

                {prueba === 'proporcion' && (
                    <div id="tour-t6-hp-param-hipotesis" style={{ display: 'flex', alignItems: 'center', gap: '10px', gridColumn: '1 / -1', width: 'min(100%, 50%)', minWidth: 0, justifySelf: 'center', boxSizing: 'border-box' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px', flexShrink: 0 }}>{renderKatex('\\boldsymbol{p}_0:')}</label>
                        <input type="number" className="input-mat251 placeholder-small" value={p0} onChange={(e) => setP0(e.target.value)} placeholder="Proporción hipotética" min="0" max="1" step="any" style={{ flex: 1, minWidth: 0, width: '100%', boxSizing: 'border-box' }} />
                    </div>
                )}

                {prueba === 'varianza' && (
                    <div id="tour-t6-hp-param-hipotesis" style={{ display: 'flex', alignItems: 'center', gap: '10px', gridColumn: '1 / -1', width: 'min(100%, 50%)', minWidth: 0, justifySelf: 'center', boxSizing: 'border-box' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px' }}>{renderKatex('\\boldsymbol{\\sigma}_0^2:')}</label>
                        <input type="number" className="input-mat251 placeholder-small" value={sigma02} onChange={(e) => setSigma02(e.target.value)} placeholder="Varianza hipotética" min="0" step="any" style={{ flex: 1, minWidth: 0, width: '100%', boxSizing: 'border-box' }} />
                    </div>
                )}

            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', width: '100%', marginBottom: '15px' }}>
                <div id="tour-t6-hp-alpha" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '360px' }}>
                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', flexShrink: 0 }}>{renderKatex('\\boldsymbol{\\alpha}:')}</label>
                    <div ref={alphaRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
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
                </div>

                <div id="tour-t6-hp-h1" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', width: '100%', flexWrap: 'wrap' }}>
                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', flexShrink: 0 }}>{renderKatex('\\mathbf{H}_1:')}</label>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', width: 'auto', maxWidth: '100%' }}>
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
                                    flex: '0 1 auto', minWidth: '72px', padding: '2px 8px', textAlign: 'center', cursor: 'pointer',
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
                                {renderKatex(mathStr, true)}
                            </div>
                        );
                    })}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <button id="tour-t6-hp-btn-calcular" className="button_calcular" style={{ width: 'auto', padding: '5px 15px' }} onClick={handleCalcular}>
                        Calcular Prueba
                    </button>
                </div>
            </div>
                </>
            ) : (
                <div style={{ padding: '5px', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                    No hay datos cargados en el estado global. Ve a Gestión de Datos para importar.
                </div>
            )}

            <ModalAlerta isOpen={modalAlerta.isOpen} mensaje={modalAlerta.mensaje} titulo={modalAlerta.titulo} tipo={modalAlerta.tipo} onClose={() => setModalAlerta({ ...modalAlerta, isOpen: false })} />
        </div>
    );
}
