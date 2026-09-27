import React, { useState, useMemo, useEffect } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import '../../../styles/Temas/Tema3.css';
import { IconoBasura, IconoMas } from '../../../../../ui/iconos';

export default function Controles_DistribucionDiscreta({ onCalcular, varSeleccionada, filas, statsDatos, abrirEditor }) {
    const [modo, setModo] = useState('matriz'); // 'manual' | 'matriz'
    const [tipoMatriz, setTipoMatriz] = useState('brutos'); // 'brutos' | 'probabilidades'
    const [columnaSeleccionada, setColumnaSeleccionada] = useState('');
    const [columnaProbabilidad, setColumnaProbabilidad] = useState('');
    const [error, setError] = useState('');

    const [tabla, setTabla] = useState([
        { id: 1, x: '', p: '' },
        { id: 2, x: '', p: '' }
    ]);

    // Lógica para Gestión de Datos
    const columnasDisponibles = useMemo(() => {
        return (varSeleccionada?.nombresColumnas && varSeleccionada.nombresColumnas.length > 0)
            ? varSeleccionada.nombresColumnas
            : (varSeleccionada ? [varSeleccionada.nombre || 'Datos'] : []);
    }, [varSeleccionada]);

    useEffect(() => {
        setColumnaSeleccionada('');
        setColumnaProbabilidad('');
    }, [columnasDisponibles]);

    // Reseteos al cambiar de modo
    useEffect(() => {
        setError('');
        onCalcular(null);
    }, [modo, tipoMatriz]);

    const agregarFila = () => {
        setTabla([...tabla, { id: Date.now(), x: '', p: '' }]);
    };

    const eliminarFila = (id) => {
        if (tabla.length <= 1) return;
        setTabla(tabla.filter(fila => fila.id !== id));
        onCalcular(null);
    };

    const actualizarFila = (id, campo, valor) => {
        setTabla(tabla.map(fila => fila.id === id ? { ...fila, [campo]: valor } : fila));
        onCalcular(null);
    };

    const sumaProbabilidades = useMemo(() => {
        return tabla.reduce((acc, curr) => {
            const val = parseFloat(curr.p);
            return acc + (isNaN(val) ? 0 : val);
        }, 0);
    }, [tabla]);

    const hayProbabilidadesNegativas = tabla.some(fila => parseFloat(fila.p) < 0);
    const esSumaValida = Math.abs(sumaProbabilidades - 1) < 0.0001 && !hayProbabilidadesNegativas;
    const hayCamposVacios = tabla.some(fila => fila.x === '' || fila.p === '');

    const handleCalcular = () => {
        if (!esSumaValida || hayCamposVacios) return;

        const mapDatos = new Map();
        tabla.forEach(fila => {
            const xVal = parseFloat(fila.x);
            const pVal = parseFloat(fila.p);
            if (!isNaN(xVal) && !isNaN(pVal)) {
                if (mapDatos.has(xVal)) {
                    mapDatos.set(xVal, mapDatos.get(xVal) + pVal);
                } else {
                    mapDatos.set(xVal, pVal);
                }
            }
        });

        const datos = Array.from(mapDatos.entries()).map(([x, p]) => ({ x, p }));
        datos.sort((a, b) => a.x - b.x);

        onCalcular(datos); 
    };

    const renderLatex = (str) => {
        return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(str, { throwOnError: false }) }} />;
    };

    const datosColumna = useMemo(() => {
        if (!varSeleccionada || !filas || filas.length === 0 || columnaSeleccionada === '') return [];
        const validas = filas.filter(f => (f.valor || '').toString().trim() !== '');

        return validas.map(f => {
            if (varSeleccionada.nombresColumnas && varSeleccionada.nombresColumnas.length > 1) {
                const partes = (f.valor || '').toString().split(' | ');
                return partes[columnaSeleccionada] ? partes[columnaSeleccionada].trim() : '';
            }
            return (f.valor || '').toString().trim();
        }).map(v => parseFloat(v)).filter(v => !isNaN(v));
    }, [varSeleccionada, filas, columnaSeleccionada]);

    const procesarMatriz = () => {
        if (tipoMatriz === 'brutos') {
            if (columnaSeleccionada === '') {
                setError('Por favor selecciona la columna a evaluar.');
                return;
            }
            if (datosColumna.length === 0) {
                setError('No hay datos numéricos válidos en la columna seleccionada.');
                return;
            }

            const counts = {};
            datosColumna.forEach(val => {
                counts[val] = (counts[val] || 0) + 1;
            });

            const totalDatos = datosColumna.length;
            const datosGenerados = Object.keys(counts).map(key => {
                const val = parseFloat(key);
                const freq = counts[key];
                return {
                    x: val,
                    p: freq / totalDatos,
                    f: freq
                };
            }).sort((a, b) => a.x - b.x); // Ordenar por X de menor a mayor

            setError('');
            onCalcular(datosGenerados);
        } else {
            // Modo Tabla de Probabilidades (2 columnas)
            if (columnaSeleccionada === '' || columnaProbabilidad === '') {
                setError('Por favor selecciona las columnas para X y P(X).');
                return;
            }

            const validas = filas.filter(f => (f.valor || '').toString().trim() !== '');
            let sumaP = 0;
            const datosGenerados = [];

            for (let f of validas) {
                let valX = '';
                let valP = '';
                if (varSeleccionada.nombresColumnas && varSeleccionada.nombresColumnas.length > 1) {
                    const partes = (f.valor || '').toString().split(' | ');
                    valX = partes[columnaSeleccionada] ? partes[columnaSeleccionada].trim() : '';
                    valP = partes[columnaProbabilidad] ? partes[columnaProbabilidad].trim() : '';
                } else {
                    valX = (f.valor || '').toString().trim();
                    valP = valX; // Fallback, though likely to sum > 1
                }

                const numX = parseFloat(valX);
                const numP = parseFloat(valP);

                if (!isNaN(numX) && !isNaN(numP)) {
                    datosGenerados.push({ x: numX, p: numP });
                    sumaP += numP;
                }
            }

            if (datosGenerados.length === 0) {
                setError('No hay filas con valores numéricos válidos en ambas columnas.');
                return;
            }

            if (Math.abs(sumaP - 1) > 0.001) {
                setError(`Las probabilidades seleccionadas suman ${sumaP.toFixed(4)}. Deben sumar 1.0.`);
                return;
            }

            datosGenerados.sort((a, b) => a.x - b.x);
            setError('');
            onCalcular(datosGenerados);
        }
    };

    const cardStyle = {
        background: 'transparent',
        color: 'var(--text-main, #1e293b)',
        padding: '5px 0',
        height: '100%',
        boxSizing: 'border-box'
    };

    const inputStyle = {
        width: '100%',
        padding: '8px 12px',
        border: '1px solid var(--border-color, #cbd5e1)',
        borderRadius: '6px',
        outline: 'none',
        fontSize: '0.85rem',
        backgroundColor: 'var(--bg-input, #fff)',
        color: 'var(--text-main, #0f172a)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
    };

    return (
        <div style={cardStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                <div style={{ display: 'inline-flex', gap: '5px', background: 'var(--bg-card)', padding: '4px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <button
                        type="button"
                        className={`btn-mat251-modo ${modo === 'matriz' ? 'active' : ''}`}
                        onClick={() => setModo('matriz')}
                        style={{ flex: 1 }}
                    >
                        Análisis de Matriz
                    </button>
                    <button
                        type="button"
                        className={`btn-mat251-modo ${modo === 'manual' ? 'active' : ''}`}
                        onClick={() => setModo('manual')}
                        style={{ flex: 1 }}
                    >
                        Modo Manual
                    </button>
                </div>
            </div>

            <h3 style={{ marginTop: 0, color: '#3b82f6', fontSize: '1rem', fontWeight: 600, marginBottom: '10px' }}>
                Datos
            </h3>

            {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '15px' }}>
                    <strong>Error: </strong> {error}
                </div>
            )}

            {modo === 'matriz' && (
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card, #fff)', padding: '12px 15px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', marginBottom: '20px' }}>
                        <div>
                            <div style={{ color: '#3b82f6', fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>Conjunto de Datos:</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>
                                Cargados: <strong style={{ color: '#3b82f6' }}>{statsDatos ? statsDatos.cargados : 0}</strong> &nbsp;
                                Agregados: <strong style={{ color: '#3b82f6' }}>{statsDatos ? statsDatos.agregados : 0}</strong> &nbsp;
                                Total: <strong style={{ color: '#3b82f6' }}>{statsDatos ? statsDatos.total : 0}</strong>
                            </div>
                        </div>
                        <button
                            className="btn-icon btn-editar-hover"
                            onClick={abrirEditor}
                            style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--accent-color)', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            Editar Datos
                        </button>
                    </div>
                    {columnasDisponibles.length > 0 ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', width: '100%' }}>
                                <div style={{ display: 'flex', gap: '5px', width: '100%', maxWidth: '400px', background: 'var(--bg-card)', padding: '4px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                    <button
                                        type="button"
                                        className={`btn-mat251-modo ${tipoMatriz === 'brutos' ? 'active' : ''}`}
                                        onClick={() => setTipoMatriz('brutos')}
                                        style={{ flex: 1 }}
                                    >
                                        Datos
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn-mat251-modo ${tipoMatriz === 'probabilidades' ? 'active' : ''}`}
                                        onClick={() => setTipoMatriz('probabilidades')}
                                        style={{ flex: 1 }}
                                    >
                                        Tabla Probabilidades
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', width: '100%', flexWrap: 'wrap' }}>
                                <label className="tema3-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>
                                    {tipoMatriz === 'probabilidades' ? 
                                        <>{renderLatex('X')}:</> : 
                                        'Columna a evaluar:'}
                                </label>
                                <select
                                    className="tema3-select"
                                    style={{ flex: 1, minWidth: '100px' }}
                                    value={columnaSeleccionada}
                                    onChange={e => { setColumnaSeleccionada(e.target.value === '' ? '' : Number(e.target.value)); setError(''); }}
                                >
                                    <option value="" disabled>Selecciona una columna...</option>
                                    {columnasDisponibles.map((col, idx) => (
                                        <option key={idx} value={idx}>{col}</option>
                                    ))}
                                </select>

                                {tipoMatriz === 'probabilidades' && (
                                    <>
                                        <label className="tema3-label" style={{ margin: 0, whiteSpace: 'nowrap', marginLeft: '5px' }}>
                                            {renderLatex('P(X)')}:
                                        </label>
                                        <select
                                            className="tema3-select"
                                            style={{ flex: 1, minWidth: '100px' }}
                                            value={columnaProbabilidad}
                                            onChange={e => { setColumnaProbabilidad(e.target.value === '' ? '' : Number(e.target.value)); setError(''); }}
                                        >
                                            <option value="" disabled>Selecciona...</option>
                                            {columnasDisponibles.map((col, idx) => (
                                                <option key={idx} value={idx}>{col}</option>
                                            ))}
                                        </select>
                                    </>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '5px' }}>
                                <button
                                    className="button_calcular"
                                    onClick={procesarMatriz}
                                    style={{ width: 'auto', padding: '5px 15px', margin: 0, whiteSpace: 'nowrap' }}
                                >
                                    CALCULAR
                                </button>
                            </div>
                        </>
                    ) : (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>No hay datos cargados en el estado global. Ve a Gestión de Datos para importar.</p>
                    )}
                </div>
            )}

            {modo === 'manual' && (
                <>
                    <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px', textAlign: 'left', tableLayout: 'fixed' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '0px', color: 'var(--text-muted, #475569)', fontWeight: 600, fontSize: '0.9rem', width: '45%' }}>Valor {renderLatex('(X)')}</th>
                                    <th style={{ padding: '0 10px', color: 'var(--text-muted, #475569)', fontWeight: 600, fontSize: '0.9rem', width: '45%' }}>Probabilidad {renderLatex('P(X)')}</th>
                                    <th style={{ padding: '0 0px', width: '10%' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {tabla.map((fila) => (
                                    <tr key={fila.id}>
                                        <td style={{ padding: '0 8px 0 0' }}>
                                            <input
                                                type="number"
                                                style={inputStyle}
                                                value={fila.x}
                                                placeholder="Ej. 0"
                                                onChange={(e) => actualizarFila(fila.id, 'x', e.target.value)}
                                            />
                                        </td>
                                        <td style={{ padding: '0 8px' }}>
                                            <input
                                                type="number"
                                                style={inputStyle}
                                                step="0.01"
                                                min="0"
                                                max="1"
                                                value={fila.p}
                                                placeholder="Ej. 0.25"
                                                onChange={(e) => actualizarFila(fila.id, 'p', e.target.value)}
                                            />
                                        </td>
                                        <td style={{ padding: '0 0 0 8px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => eliminarFila(fila.id)}
                                                style={{
                                                    background: 'transparent',
                                                    color: 'var(--text-error, #ef4444)',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    padding: '8px',
                                                    cursor: tabla.length > 1 ? 'pointer' : 'not-allowed',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    opacity: tabla.length > 1 ? 0.7 : 0.3,
                                                    transition: 'opacity 0.2s ease, transform 0.1s ease',
                                                }}
                                                onMouseEnter={(e) => { if(tabla.length > 1) { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.1)'; } }}
                                                onMouseLeave={(e) => { if(tabla.length > 1) { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.transform = 'scale(1)'; } }}
                                                disabled={tabla.length <= 1}
                                                title="Eliminar fila"
                                            >
                                                <IconoBasura width="18" height="18" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="2" style={{ padding: '0px', textAlign: 'center' }}>
                                        <button
                                            onClick={agregarFila}
                                            style={{
                                                background: 'transparent',
                                                color: 'var(--primary-color, #3b82f6)',
                                                border: '1px dashed var(--primary-color, #3b82f6)',
                                                borderRadius: '10px',
                                                padding: '5px 10px',
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'var(--bg-input, rgba(59, 130, 246, 0.05))'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.background = 'transparent'; }}
                                            title="Agregar valor"
                                        >
                                            <IconoMas width="15" height="15" />
                                        </button>
                                    </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td style={{ padding: '4px 8px 0 8px' }}>
                                        <div style={{
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            backgroundColor: esSumaValida ? 'var(--bg-success, #dcfce7)' : 'var(--bg-error, #fee2e2)',
                                            color: esSumaValida ? 'var(--text-success, #166534)' : 'var(--text-error, #991b1b)',
                                            border: `1px solid ${esSumaValida ? '#bbf7d0' : '#fecaca'}`,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontWeight: 600,
                                            fontSize: '0.8rem',
                                            width: '100%',
                                            boxSizing: 'border-box'
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <span>Suma:</span> {sumaProbabilidades.toFixed(4)}
                                            </span>
                                            {!esSumaValida && !hayProbabilidadesNegativas && (
                                                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                                    Debe sumar 1.0
                                                </span>
                                            )}
                                            {hayProbabilidadesNegativas && (
                                                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                                    Prob. negativas
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px' }}>
                        <button
                            className="button_calcular"
                            onClick={handleCalcular} 
                            disabled={!esSumaValida || hayCamposVacios}
                            style={{ width: 'auto', padding: '5px 15px'}}
                        >
                            CALCULAR
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
