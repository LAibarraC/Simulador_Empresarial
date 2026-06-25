import React, { useState, useMemo, useEffect } from 'react';
import { FONT, FS, RADIUS, cardStyle, labelStyle } from '../../../Principal/Constantes';
import { IconoCalculadora, EditarDatos } from '../../../../ui/iconos';

export default function Controles_DistribucionDiscreta({ 
    varSeleccionada, 
    filas, 
    statsDatos, 
    abrirEditor, 
    onCalcular 
}) {
    const [inputMode, setInputMode] = useState('matriz'); // 'matriz' o 'manual'
    const [error, setError] = useState('');
    const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);

    const [filasManuales, setFilasManuales] = useState([
        { x: '', p: '' },
        { x: '', p: '' },
        { x: '', p: '' }
    ]);

    const [mostrarTablaMatriz, setMostrarTablaMatriz] = useState(false);

    // Reseteamos columna al cambiar de variable cargada
    useEffect(() => {
        setColumnaSeleccionada(0);
        setError('');
        setMostrarTablaMatriz(false);
    }, [varSeleccionada]);

    // Ocultar tabla si se cambia la columna seleccionada o el modo
    useEffect(() => {
        setMostrarTablaMatriz(false);
    }, [columnaSeleccionada, inputMode]);

    // Calcular tabla agrupada para Modo Matriz
    const datosMatrizAgrupados = useMemo(() => {
        if (!varSeleccionada || !filas || filas.length === 0) return null;

        const validas = filas.filter(f => (f.valor || '').toString().trim() !== '');
        if (validas.length === 0) return null;

        const nombresColumnas = (varSeleccionada.nombresColumnas && varSeleccionada.nombresColumnas.length > 0) ? varSeleccionada.nombresColumnas : [varSeleccionada.nombre || 'Datos'];
        
        const counts = {};
        let totalValidos = 0;

        validas.forEach(f => {
            let val = '';
            if (nombresColumnas.length > 1) {
                const partes = (f.valor || '').toString().split(' | ');
                val = partes[columnaSeleccionada] ? partes[columnaSeleccionada].trim() : '';
            } else {
                val = (f.valor || '').toString().trim();
            }

            if (val !== '') {
                const numVal = parseFloat(val);
                if (!isNaN(numVal)) {
                    counts[numVal] = (counts[numVal] || 0) + 1;
                    totalValidos++;
                }
            }
        });

        if (totalValidos === 0) return null;

        let acumulado = 0;
        const agrupados = Object.entries(counts).map(([xVal, f]) => {
            const p = f / totalValidos;
            acumulado += p;
            return {
                x: parseFloat(xVal),
                f: f,
                p: p,
                F: acumulado
            };
        }).sort((a, b) => a.x - b.x);

        return agrupados;

    }, [varSeleccionada, filas, columnaSeleccionada]);

    // Funciones Modo Manual
    const agregarFila = () => setFilasManuales([...filasManuales, { x: '', p: '' }]);
    const eliminarFila = (index) => {
        if (filasManuales.length > 1) {
            setFilasManuales(filasManuales.filter((_, i) => i !== index));
        }
    };
    const actualizarFila = (index, campo, valor) => {
        const nuevas = [...filasManuales];
        if (campo === 'p' && valor !== '') {
            const num = parseFloat(valor);
            if (num < 0) valor = '0';
            else if (num > 1) valor = '1';
        }
        nuevas[index][campo] = valor;
        setFilasManuales(nuevas);
        setError('');
    };

    // Calcular suma de probabilidades en tiempo real para modo manual
    const sumaProbabilidades = filasManuales.reduce((acc, f) => {
        const val = parseFloat(f.p);
        return acc + (isNaN(val) ? 0 : val);
    }, 0);
    const isSumaValida = Math.abs(sumaProbabilidades - 1.0) < 0.0001;

    // Botón Calcular (Unifica ambas lógicas)
    const manejarCalculo = () => {
        if (inputMode === 'matriz') {
            if (!datosMatrizAgrupados || datosMatrizAgrupados.length === 0) {
                setError('No hay datos numéricos válidos en la columna seleccionada.');
                return;
            }
            setError('');
            setMostrarTablaMatriz(true);
            // Formatear para que el motor matemático (logica_Tema2) lo entienda
            const datosParaLogica = datosMatrizAgrupados.map(d => ({ x: d.x, p: d.p }));
            onCalcular(datosParaLogica);

        } else {
            let validos = [];

            for (let i = 0; i < filasManuales.length; i++) {
                const xVal = parseFloat(filasManuales[i].x);
                const pVal = parseFloat(filasManuales[i].p);

                if (isNaN(xVal) || isNaN(pVal)) {
                    setError(`La fila ${i + 1} contiene valores vacíos o no numéricos.`);
                    return;
                }
                validos.push({ x: xVal, p: pVal });
            }

            if (!isSumaValida) {
                setError(`La suma de P(X) debe ser exactamente 1. Suma actual: ${sumaProbabilidades.toFixed(4)}`);
                return;
            }

            setError('');
            onCalcular(validos);
        }
    };

    const columnasDisponibles = (varSeleccionada?.nombresColumnas && varSeleccionada.nombresColumnas.length > 0) ? varSeleccionada.nombresColumnas : (varSeleccionada ? [varSeleccionada.nombre || 'Datos'] : []);

    // Estilos comunes en línea (reemplazo de CSS)
    const commonTableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: '15px', marginBottom: '15px', fontSize: FS.sm };
    const commonThStyle = { border: '1px solid var(--border-color)', padding: '8px 12px', textAlign: 'center', backgroundColor: 'var(--bg-input)', fontWeight: 600, color: 'var(--primary-color)' };
    const commonTdStyle = { border: '1px solid var(--border-color)', padding: '8px 12px', textAlign: 'center' };

    return (
        <div style={{ fontFamily: FONT, display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ marginBottom: '20px' }}>
                {/* --- TOGGLE MATRIZ / MANUAL --- */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                    <div style={{ display: 'inline-flex', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                        <button 
                            style={{
                                padding: '6px 16px', borderRadius: '6px', fontSize: FS.sm, fontWeight: 600, border: 'none', cursor: 'pointer',
                                background: inputMode === 'matriz' ? 'var(--primary-color)' : 'transparent',
                                color: inputMode === 'matriz' ? '#fff' : 'var(--text-muted)',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => { setInputMode('matriz'); setError(''); }}
                        >
                            Análisis de Matriz
                        </button>
                        <button 
                            style={{
                                padding: '6px 16px', borderRadius: '6px', fontSize: FS.sm, fontWeight: 600, border: 'none', cursor: 'pointer',
                                background: inputMode === 'manual' ? 'var(--primary-color)' : 'transparent',
                                color: inputMode === 'manual' ? '#fff' : 'var(--text-muted)',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => { setInputMode('manual'); setError(''); }}
                        >
                            Modo Manual
                        </button>
                    </div>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', padding: '10px 15px', borderRadius: RADIUS, fontSize: FS.sm, marginBottom: '15px' }}>
                        <strong>Error: </strong> {error}
                    </div>
                )}

                {/* --- MODO MATRIZ --- */}
                {inputMode === 'matriz' && (
                    <div>
                        {/* ── BARRA DE DATOS Y EDITOR ── */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <div>
                                <span style={{ ...labelStyle, margin: 0, color: 'var(--primary-color)', fontSize: '0.95rem', fontWeight: 600 }}>Matriz Detectada (Datos Históricos):</span>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                                    <small title="Datos provenientes de variables externas" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                        Cargados: <strong style={{ color: 'var(--primary-color)' }}>{statsDatos?.cargados || 0}</strong>
                                    </small>
                                    <small title="Datos ingresados manualmente" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                        Agregados: <strong style={{ color: '#3b82f6' }}>{statsDatos?.agregados || 0}</strong>
                                    </small>
                                    <small title="Total de datos válidos" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                        Total: <strong style={{ color: 'var(--text-color)' }}>{statsDatos?.total || 0}</strong>
                                    </small>
                                </div>
                            </div>
                            <button
                                onClick={abrirEditor}
                                className="btn-icon"
                                style={{
                                    borderRadius: RADIUS,
                                    fontSize: FS.sm,
                                    padding: '6px 14px',
                                    background: 'var(--primary-color)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontWeight: 600
                                }}
                            >
                                <EditarDatos />
                                Editar Datos
                            </button>
                        </div>

                        {varSeleccionada && columnasDisponibles.length > 0 ? (
                            <>
                                <label style={{ ...labelStyle, marginBottom: '5px', color: 'var(--primary-color)', fontWeight: 600 }}>
                                    Variable discreta numérica:
                                </label>
                                <select 
                                    style={{ width: '100%', padding: '8px 12px', border: '2px solid var(--primary-color)', borderRadius: RADIUS, background: 'white', color: 'var(--primary-color)', fontSize: FS.sm, marginBottom: '15px', fontWeight: 600, outline: 'none' }}
                                    value={columnaSeleccionada}
                                    onChange={(e) => setColumnaSeleccionada(Number(e.target.value))}
                                >
                                    {columnasDisponibles.map((col, idx) => (
                                        <option key={idx} value={idx}>{col}</option>
                                    ))}
                                </select>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                                    <button 
                                        onClick={manejarCalculo}
                                        disabled={!datosMatrizAgrupados}
                                        style={{ background: 'var(--primary-color)', color: 'white', borderRadius: RADIUS, border: 'none', padding: '10px 20px', fontSize: FS.sm, fontWeight: 600, cursor: (!datosMatrizAgrupados) ? 'not-allowed' : 'pointer', opacity: (!datosMatrizAgrupados) ? 0.6 : 1 }}
                                    >
                                        Calcular Distribución
                                    </button>
                                </div>

                                {datosMatrizAgrupados && mostrarTablaMatriz ? (
                                    <div style={{ background: 'white', borderTop: '3px solid var(--primary-color)', padding: '20px', borderRadius: RADIUS, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                                        <h4 style={{ textAlign: 'center', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 5px 0', fontSize: FS.sm }}>TABLA DE DISTRIBUCIÓN DE PROBABILIDAD</h4>
                                        <p style={{ textAlign: 'center', color: '#374151', fontSize: FS.xs, margin: '0 0 15px 0' }}>Tamaño de muestra: <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>n = {statsDatos?.total || 0}</span></p>
                                        
                                        <div style={{ width: '100%' }}>
                                            <table style={commonTableStyle}>
                                                <thead>
                                                    <tr>
                                                        <th style={{...commonThStyle, background: 'transparent', color: 'var(--primary-color)'}}>Valor <i style={{ fontFamily: 'serif' }}>x</i></th>
                                                        <th style={{...commonThStyle, background: 'transparent', color: 'var(--primary-color)'}}>Frecuencia <i style={{ fontFamily: 'serif' }}>f</i></th>
                                                        <th style={{...commonThStyle, background: 'transparent', color: 'var(--primary-color)'}}><i style={{ fontFamily: 'serif' }}>P(X = x)</i></th>
                                                        <th style={{...commonThStyle, background: 'transparent', color: 'var(--primary-color)'}}><i style={{ fontFamily: 'serif' }}>F(x)</i></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {datosMatrizAgrupados.map((d, i) => (
                                                        <tr key={i} style={{ background: i % 2 !== 0 ? '#f8fafc' : 'white' }}>
                                                            <td style={{...commonTdStyle, fontWeight: 600, color: '#1e293b'}}>{d.x}</td>
                                                            <td style={{...commonTdStyle, color: '#1e293b'}}>{d.f}</td>
                                                            <td style={{...commonTdStyle, color: 'var(--primary-color)'}}>{d.p.toFixed(4)}</td>
                                                            <td style={{...commonTdStyle, color: 'var(--primary-color)'}}>{d.F.toFixed(4)}</td>
                                                        </tr>
                                                    ))}
                                                    <tr style={{ background: '#eff6ff', fontWeight: 700 }}>
                                                        <td style={{...commonTdStyle, color: '#1e293b'}}>Total</td>
                                                        <td style={{...commonTdStyle, color: '#1e293b'}}>{statsDatos?.total || 0}</td>
                                                        <td style={{...commonTdStyle, color: 'var(--primary-color)'}}>1.0000</td>
                                                        <td style={{...commonTdStyle, color: 'var(--primary-color)'}}>1.0000</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : !datosMatrizAgrupados ? (
                                    <p style={{ fontSize: FS.sm, color: 'var(--text-muted)' }}>
                                        La columna seleccionada no contiene datos numéricos válidos.
                                    </p>
                                ) : null}
                            </>
                        ) : (
                            <p style={{ fontSize: FS.sm, color: 'var(--text-muted)', textAlign: 'center', margin: '20px 0' }}>
                                Ve a "Gestión de Datos" en el menú para cargar tu matriz de Excel.
                            </p>
                        )}
                    </div>
                )}

                {/* --- MODO MANUAL --- */}
                {inputMode === 'manual' && (
                    <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: RADIUS, padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                        <div style={{ overflow: 'hidden', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: FS.sm }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc' }}>
                                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#334155', borderBottom: '1px solid #e2e8f0' }}>Escenario (X)</th>
                                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#334155', borderBottom: '1px solid #e2e8f0' }}>Probabilidad P(x)</th>
                                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, color: '#334155', borderBottom: '1px solid #e2e8f0', width: '50px' }}>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filasManuales.map((fila, i) => (
                                        <tr key={i} style={{ borderBottom: i === filasManuales.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '8px 12px' }}>
                                                <input 
                                                    type="number" 
                                                    value={fila.x} 
                                                    onChange={(e) => actualizarFila(i, 'x', e.target.value)}
                                                    placeholder="Ej: 0"
                                                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '8px 10px', background: '#fff', color: '#1e293b', textAlign: 'center', fontSize: FS.sm, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 12px' }}>
                                                <input 
                                                    type="number" 
                                                    step="0.01" 
                                                    min="0"
                                                    max="1"
                                                    value={fila.p} 
                                                    onChange={(e) => actualizarFila(i, 'p', e.target.value)}
                                                    placeholder="Ej: 0.25"
                                                    style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '8px 10px', background: '#fff', color: '#1e293b', textAlign: 'center', fontSize: FS.sm, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                                                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-color)'}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                            </td>
                                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                                <button 
                                                    onClick={() => eliminarFila(i)}
                                                    disabled={filasManuales.length <= 1}
                                                    title="Eliminar fila"
                                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: filasManuales.length > 1 ? 'pointer' : 'not-allowed', fontSize: FS.md, padding: '4px', opacity: filasManuales.length > 1 ? 1 : 0.4, transition: 'transform 0.1s' }}
                                                    onMouseOver={(e) => { if(filasManuales.length > 1) e.target.style.transform = 'scale(1.1)'; }}
                                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                                >
                                                    ✖
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button 
                            onClick={agregarFila}
                            style={{ background: 'transparent', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', borderRadius: RADIUS, padding: '8px 16px', fontSize: FS.sm, fontWeight: 600, cursor: 'pointer', display: 'block', width: '100%', transition: 'all 0.2s', marginBottom: '20px' }}
                            onMouseOver={(e) => { e.target.style.background = 'var(--primary-color)'; e.target.style.color = 'white'; }}
                            onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--primary-color)'; }}
                        >
                            + Añadir Fila
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: FS.sm, fontWeight: 600 }}>
                                <span style={{ color: '#64748b', marginRight: '8px' }}>Suma total P(x):</span>
                                <span style={{ color: isSumaValida ? '#10b981' : '#ef4444', fontSize: '1.1em' }}>
                                    {sumaProbabilidades.toFixed(4)}
                                </span>
                            </div>
                            
                            <button 
                                onClick={manejarCalculo}
                                disabled={!isSumaValida}
                                style={{ 
                                    background: 'var(--primary-color)', 
                                    color: 'white', 
                                    borderRadius: RADIUS, 
                                    border: 'none', 
                                    padding: '10px 24px', 
                                    fontSize: FS.sm, 
                                    fontWeight: 600, 
                                    cursor: isSumaValida ? 'pointer' : 'not-allowed',
                                    opacity: isSumaValida ? 1 : 0.6,
                                    boxShadow: isSumaValida ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
                                    transition: 'all 0.2s'
                                }}
                            >
                                Calcular Distribución
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
