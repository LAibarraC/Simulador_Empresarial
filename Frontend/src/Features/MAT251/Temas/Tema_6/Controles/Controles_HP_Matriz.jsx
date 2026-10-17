import React, { useState, useRef, useEffect } from 'react';
import { pruebaMediaZ, pruebaMediaT, pruebaProporcionZ, pruebaVarianzaChi } from '../../../Matematicas/Logica_Tema6';
import { cardStyle, FS, labelStyle, RADIUS, FONT } from '../../../Principal/Constantes';
import { EditarDatos } from '../../../../../ui/iconos';
import ModalAlerta from '../../../ui/ModalAlerta';
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

    const alphaOptions = [
        { value: '0.10', label: '0.10 (90%) - Significación' },
        { value: '0.05', label: '0.05 (95%) - Significación' },
        { value: '0.01', label: '0.01 (99%) - Significación' }
    ];

    const mostrarAlerta = (mensaje, titulo = 'Atención', tipo = 'warning') => {
        setModalAlerta({ isOpen: true, mensaje, titulo, tipo });
    };

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const paramSymbol = prueba === 'proporcion' ? 'p' : prueba === 'varianza' ? '\\sigma^2' : '\\mu';
    const paramHypo = prueba === 'proporcion' ? 'p_0' : prueba === 'varianza' ? '\\sigma_0^2' : '\\mu_0';

    const datosCompletos = filas
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
            statsLive = { n: nLive, p_hat: nLive > 0 ? xLive / nLive : 0 };
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
            onCalcular(res);
        }
    };

    const valoresUnicos = prueba === 'proporcion' ? [...new Set(filas
        .map(f => f.valor)
        .filter(v => v !== undefined && v !== null && v.toString().trim() !== '')
        .map(v => v.toString().trim())
    )] : [];

    return (
        <div style={{ padding: '0px', fontFamily: FONT }}>            
            <div style={{ marginBottom: '10px' }}>
                <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', padding: '10px' }}>
                    <div>
                        <span style={{ ...labelStyle, margin: 0, color: 'var(--text-main, #1e293b)' }}>Datos:</span>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                            <small title="Datos provenientes de variables externas" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                Cargados: <strong style={{ color: 'var(--text-main, #1e293b)' }}>{statsDatos?.cargados || 0}</strong>
                            </small>
                            <small title="Datos ingresados manualmente" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                Agregados: <strong style={{ color: 'var(--text-main, #1e293b)' }}>{statsDatos?.agregados || 0}</strong>
                            </small>
                            <small title="Total de datos válidos" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                Total: <strong style={{ color: 'var(--text-main, #1e293b)' }}>{statsDatos?.total || 0}</strong>
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
                
                {statsLive && (
                    <div style={{ width: 'fit-content', margin: '-5px auto 15px auto', padding: '8px 20px', background: 'rgba(0, 123, 255, 0.05)', borderRadius: RADIUS, border: '1px dashed var(--primary-color)', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: FS.sm, fontWeight: 'bold', color: 'var(--primary-color)' }}>Muestra:</span>
                        <div style={{ fontSize: FS.sm, color: 'var(--text-pure)' }}>
                            <strong>{renderKatex('\\mathbf{n}')}:</strong> {statsLive.n}
                        </div>
                        {statsLive.mean !== undefined && (
                            <div style={{ fontSize: FS.sm, color: 'var(--text-pure)' }}>
                                <strong>{renderKatex('\\mathbf{\\bar{x}}')}:</strong> {statsLive.mean.toFixed(3)}
                            </div>
                        )}
                        {(prueba === 'media_t' || prueba === 'varianza') && statsLive.std !== undefined && (
                            <div style={{ fontSize: FS.sm, color: 'var(--text-pure)' }}>
                                <strong>{renderKatex('\\mathbf{s}')}:</strong> {statsLive.std.toFixed(3)}
                            </div>
                        )}
                        {statsLive.p_hat !== undefined && (
                            <div style={{ fontSize: FS.sm, color: 'var(--text-pure)' }}>
                                <strong>{renderKatex('\\mathbf{\\hat{p}}')}:</strong> {statsLive.p_hat.toFixed(3)}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div style={{ ...cardStyle, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '15px', alignItems: 'start' }}>
                {prueba === 'proporcion' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main, #1e293b)', minWidth: '40px' }}>Exito:</label>
                        <div ref={selectRef} style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                            <div
                                onClick={() => setIsSelectOpen(o => !o)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '8px 12px', background: 'var(--bg-card)',
                                    border: `1px solid ${isSelectOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                    borderRadius: RADIUS, cursor: 'pointer',
                                    color: 'var(--text-main)',
                                }}
                            >
                                <span style={{ fontWeight: 500, fontSize: FS.sm }} className={!valorExito ? "placeholder-small" : ""}>
                                    {valorExito || 'Seleccione valor de éxito'}
                                </span>
                            </div>
                            {isSelectOpen && (
                                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: RADIUS, zIndex: 1000, overflow: 'hidden' }}>
                                    {valoresUnicos.map((val, idx) => (
                                        <div key={idx} onClick={() => { setValorExito(val); setIsSelectOpen(false); }} style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', fontSize: FS.sm }}>
                                            {val}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {(prueba === 'media_z' || prueba === 'media_t') && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px' }}>{renderKatex('\\mu_0:')}</label>
                        <input type="number" className="input-mat251 placeholder-small" value={mu0} onChange={(e) => setMu0(e.target.value)} placeholder="Media hipotética" step="any" style={{ flex: 1 }} />
                    </div>
                )}

                {prueba === 'media_z' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px' }}>{renderKatex('\\sigma:')}</label>
                        <input type="number" className="input-mat251 placeholder-small" value={sigma} onChange={(e) => setSigma(e.target.value)} placeholder="Desv. est. poblacional" min="0" step="any" style={{ flex: 1 }} />
                    </div>
                )}

                {prueba === 'proporcion' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px' }}>{renderKatex('p_0:')}</label>
                        <input type="number" className="input-mat251 placeholder-small" value={p0} onChange={(e) => setP0(e.target.value)} placeholder="Proporción hipotética" min="0" max="1" step="any" style={{ flex: 1 }} />
                    </div>
                )}

                {prueba === 'varianza' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '40px' }}>{renderKatex('\\sigma_0^2:')}</label>
                        <input type="number" className="input-mat251 placeholder-small" value={sigma02} onChange={(e) => setSigma02(e.target.value)} placeholder="Varianza hipotética" min="0" step="any" style={{ flex: 1 }} />
                    </div>
                )}

            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 235px 1fr', gap: '15px 10px', width: '100%', alignItems: 'center', marginBottom: '15px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)' }}>{renderKatex('\\alpha:')}</label>
                </div>
                <div ref={alphaRef} style={{ position: 'relative' }}>
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

                <div></div>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0px' }}>
                    <button className="button_calcular" style={{ width: 'auto', padding: '5px 15px' }} onClick={handleCalcular}>
                        Calcular Prueba
                    </button>
                </div>
                <div></div>
            </div>

            <ModalAlerta isOpen={modalAlerta.isOpen} mensaje={modalAlerta.mensaje} titulo={modalAlerta.titulo} tipo={modalAlerta.tipo} onClose={() => setModalAlerta({ ...modalAlerta, isOpen: false })} />
        </div>
    );
}
