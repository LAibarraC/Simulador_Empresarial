import React, { useState, useMemo, useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import '../../../styles/Temas/Tema2.css';
import '../../../styles/Temas/Tema3.css';
import { IconoBasura, IconoMas, EditarDatos } from '../../../../../ui/iconos';
import { FONT, FS, RADIUS, cardStyle, labelStyle } from '../../../Principal/Constantes';
import ModalAlerta from '../../../ui/ModalAlerta';
import StatLabel from '../../../ui/StatLabel';

// COMPONENTE SELECTOR PERSONALIZADO (REGLA 2)
function CustomSelect({ value, onChange, options, placeholder = 'Selecciona una opción...' }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectedOption = options.find(o => o.value === value);
    const displayText = selectedOption ? selectedOption.label : placeholder;

    return (
        <div ref={ref} style={{ position: 'relative', width: '100%', fontFamily: FONT }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: '38px',
                    padding: '8px 12px',
                    background: 'var(--bg-input, var(--bg-card))',
                    border: `1px solid ${isOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    borderRadius: RADIUS,
                    cursor: 'pointer',
                    boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
                    transition: 'all 0.2s ease',
                    color: 'var(--text-pure)',
                    userSelect: 'none',
                    fontSize: FS.sm,
                    boxSizing: 'border-box'
                }}
            >
                <span style={{
                    fontWeight: 500,
                    color: selectedOption ? 'var(--text-pure)' : 'var(--text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '85%'
                }}>
                    {displayText}
                </span>
                <svg
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0,
                        color: 'var(--text-muted)'
                    }}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: RADIUS,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                        zIndex: 1000,
                        maxHeight: '260px',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        animation: 'fadeInDropdown 0.2s ease'
                    }}
                    className="thin-scrollbar"
                >
                    {options.length === 0 ? (
                        <div style={{ padding: '9px 12px', color: 'var(--text-muted)', fontSize: FS.sm, fontStyle: 'italic' }}>
                            Sin opciones
                        </div>
                    ) : (
                        options.map((opt, idx) => {
                            const isSelected = value === opt.value;
                            return (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    style={{
                                        padding: '9px 12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        background: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                                        borderBottom: idx < options.length - 1 ? '1px solid var(--border-color)' : 'none',
                                        color: isSelected ? 'var(--primary-color)' : 'var(--text-pure)',
                                        fontSize: FS.sm,
                                        fontWeight: isSelected ? 600 : 400,
                                        transition: 'background 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) e.currentTarget.style.background = 'var(--bg-input, rgba(0,0,0,0.04))';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <span>{opt.label}</span>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

export default function Controles_DistribucionDiscreta({ onCalcular, varSeleccionada, filas, statsDatos, abrirEditor }) {
    const [modo, setModo] = useState('matriz'); // 'manual' | 'matriz'
    const [columnaSeleccionada, setColumnaSeleccionada] = useState('');
    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Atención', tipo: 'warning' });

    const mostrarAlerta = (mensaje, titulo = 'Atención', tipo = 'warning') => {
        setModalAlerta({ isOpen: true, mensaje, titulo, tipo });
    };

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

    const opcionesColumnas = useMemo(() => {
        return columnasDisponibles.map((col, idx) => ({
            value: idx,
            label: col
        }));
    }, [columnasDisponibles]);

    useEffect(() => {
        if (columnasDisponibles.length === 1) {
            setColumnaSeleccionada(0);
        } else {
            setColumnaSeleccionada('');
        }
    }, [columnasDisponibles]);

    // Reseteos al cambiar de modo, columna, variable seleccionada o datos globales
    useEffect(() => {
        onCalcular(null);
    }, [modo, columnaSeleccionada, varSeleccionada, statsDatos?.total]);

    // Si estamos en modo matriz y no hay variable o los datos son 0, limpiar cálculos inmediatamente
    useEffect(() => {
        if (modo === 'matriz' && (!varSeleccionada || !statsDatos || statsDatos.total === 0)) {
            onCalcular(null);
        }
    }, [modo, varSeleccionada, statsDatos?.total]);

    const agregarFila = () => {
        setTabla([...tabla, { id: Date.now(), x: '', p: '' }]);
        onCalcular(null);
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
        if (tabla.length === 0) {
            mostrarAlerta('Debes ingresar al menos una fila en la tabla.', 'Tabla Vacía', 'warning');
            return;
        }

        if (hayCamposVacios) {
            mostrarAlerta('Por favor completa todos los campos de Valor (X) y Probabilidad P(X) en la tabla.', 'Campos Incompletos', 'warning');
            return;
        }

        if (hayProbabilidadesNegativas) {
            mostrarAlerta('Las probabilidades P(X) no pueden ser negativas.', 'Valores Inválidos', 'error');
            return;
        }

        if (!esSumaValida) {
            mostrarAlerta(`La suma de las probabilidades es ${sumaProbabilidades.toFixed(4)}. La suma total de P(X) debe ser exactamente igual a 1.0.`, 'Suma Inválida', 'warning');
            return;
        }

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

    const colAEvaluar = useMemo(() => {
        return columnasDisponibles.length === 1 ? 0 : columnaSeleccionada;
    }, [columnasDisponibles.length, columnaSeleccionada]);

    const datosColumna = useMemo(() => {
        if (!varSeleccionada || !filas || filas.length === 0 || colAEvaluar === '') return [];
        const validas = filas.filter(f => (f.valor || '').toString().trim() !== '');

        return validas.map(f => {
            if (varSeleccionada.nombresColumnas && varSeleccionada.nombresColumnas.length > 1) {
                const partes = (f.valor || '').toString().split(' | ');
                return partes[colAEvaluar] ? partes[colAEvaluar].trim() : '';
            }
            return (f.valor || '').toString().trim();
        }).map(v => parseFloat(v)).filter(v => !isNaN(v));
    }, [varSeleccionada, filas, colAEvaluar]);

    const procesarMatriz = () => {
        if (colAEvaluar === '') {
            mostrarAlerta('Por favor selecciona la columna a evaluar.', 'Columna no seleccionada', 'warning');
            return;
        }
        if (datosColumna.length === 0) {
            mostrarAlerta('No hay datos numéricos válidos en la columna seleccionada.', 'Datos no válidos', 'error');
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
        }).sort((a, b) => a.x - b.x);

        onCalcular(datosGenerados);
    };

    const inputStyle = {
        width: '100%',
        minHeight: '38px',
        padding: '8px 12px',
        border: '1px solid var(--border-color)',
        borderRadius: RADIUS,
        outline: 'none',
        fontSize: FS.sm,
        fontFamily: FONT,
        background: 'var(--bg-input)',
        color: 'var(--text-pure)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxSizing: 'border-box'
    };

    return (
        <div style={{ padding: '0px', fontFamily: FONT, boxSizing: 'border-box', marginTop:'10px'}}>
            <style>{`
                .btn-eliminar-fila-mat251 {
                    background: transparent !important;
                    border: none !important;
                    color: #ef4444 !important;
                    border-radius: ${RADIUS} !important;
                    padding: 6px !important;
                    display: inline-flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    cursor: pointer;
                    opacity: 0.85;
                    transition: all 0.2s ease !important;
                    box-shadow: none !important;
                    outline: none !important;
                    margin: 0 auto !important;
                }
                .btn-eliminar-fila-mat251:hover:not(:disabled) {
                    background-color: #ef4444 !important;
                    color: #ffffff !important;
                    border: none !important;
                    opacity: 1 !important;
                    transform: scale(1.08) !important;
                    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.35) !important;
                }
                .btn-eliminar-fila-mat251:disabled {
                    opacity: 0.25 !important;
                    cursor: not-allowed !important;
                    background: transparent !important;
                    color: #ef4444 !important;
                    box-shadow: none !important;
                    transform: none !important;
                }
                .btn-agregar-fila-discreta {
                    border: 1px solid var(--primary-color) !important;
                    color: var(--primary-color) !important;
                    background-color: transparent !important;
                    box-shadow: none !important;
                }
                .btn-agregar-fila-discreta:hover:not(:disabled) {
                    background-color: var(--primary-color) !important;
                    color: #ffffff !important;
                    border-color: var(--primary-color) !important;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25) !important;
                }
                [data-theme='dark'] .btn-agregar-fila-discreta,
                .dark .btn-agregar-fila-discreta,
                [data-bs-theme='dark'] .btn-agregar-fila-discreta {
                    border: 1px solid var(--primary-color) !important;
                    color: var(--primary-color) !important;
                    background-color: transparent !important;
                    box-shadow: none !important;
                }
                [data-theme='dark'] .btn-agregar-fila-discreta:hover:not(:disabled),
                .dark .btn-agregar-fila-discreta:hover:not(:disabled),
                [data-bs-theme='dark'] .btn-agregar-fila-discreta:hover:not(:disabled) {
                    background-color: var(--primary-color) !important;
                    color: #ffffff !important;
                    border-color: var(--primary-color) !important;
                }
            `}</style>
            {/* SELECTOR DE MODOS PRINCIPAL (REGLA 6) */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <div className="contenedor-selector-modos-mat251">
                    <button
                        type="button"
                        className={`btn-mat251-modo ${modo === 'matriz' ? 'active' : ''}`}
                        onClick={() => setModo('matriz')}
                        style={{ fontFamily: FONT }}
                    >
                        Análisis de Matriz
                    </button>
                    <button
                        type="button"
                        className={`btn-mat251-modo ${modo === 'manual' ? 'active' : ''}`}
                        onClick={() => setModo('manual')}
                        style={{ fontFamily: FONT }}
                    >
                        Modo Manual
                    </button>
                </div>
            </div>

            {modo === 'matriz' && (
                <div style={{ marginBottom: '20px' }}>
                    {/* BARRA DE DATOS Y EDICIÓN (REGLA 4) */}
                    <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                        <div>
                            <span style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)' }}>Datos:</span>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '2px', flexWrap: 'wrap' }}>
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
                            type="button"
                            onClick={abrirEditor}
                            className="btn-primary btn-icon"
                            style={{
                                borderRadius: RADIUS,
                                fontSize: FS.sm,
                                fontFamily: FONT,
                                fontWeight: 600,
                                padding: '5px 14px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                flexShrink: 0
                            }}
                        >
                            <EditarDatos />
                            Editar Datos
                        </button>
                    </div>

                    {columnasDisponibles.length > 0 ? (
                        <>
                            {/* SELECTOR DESPLEGABLE CUANDO HAY MÁS DE 1 COLUMNA */}
                            {columnasDisponibles.length > 1 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                                    <label style={{ ...labelStyle, margin: 0, whiteSpace: 'nowrap' }}>Columna a evaluar:</label>
                                    <div style={{ flex: 1 }}>
                                        <CustomSelect
                                            value={columnaSeleccionada}
                                            onChange={(val) => setColumnaSeleccionada(val)}
                                            options={opcionesColumnas}
                                            placeholder="Selecciona una columna..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* BOTÓN CALCULAR (REGLA 8) */}
                            <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '0px' }}>
                                <button
                                    type="button"
                                    className="button_calcular"
                                    onClick={procesarMatriz}
                                    style={{
                                        width: 'fit-content',
                                        padding: '5px 20px',
                                        borderRadius: RADIUS,
                                        fontSize: FS.md,
                                        fontWeight: 600,
                                        fontFamily: FONT,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    CALCULAR
                                </button>
                            </div>
                        </>
                    ) : (
                        <p style={{ fontSize: FS.xs, color: 'var(--text-muted)', fontFamily: FONT }}>
                            No hay datos cargados en el estado global. Ve a Gestión de Datos para importar.
                        </p>
                    )}
                </div>
            )}

            {modo === 'manual' && (
                <>
                    <div style={{
                        width: '55%',
                        minWidth: '340px',
                        maxWidth: '520px',
                        margin: '0 auto 15px auto',
                        borderRadius: '0px',
                        border: '1px solid var(--text-pure)',
                        backgroundColor: 'var(--bg-card)'
                    }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: FS.sm,
                            fontFamily: FONT,
                            tableLayout: 'fixed'
                        }}>
                            <thead style={{ backgroundColor: 'var(--bg-input)' }}>
                                <tr>
                                    <th style={{
                                        borderBottom: '1px solid var(--text-pure)',
                                        borderRight: '1px solid var(--text-pure)',
                                        padding: '8px 12px',
                                        textAlign: 'center',
                                        color: 'var(--text-pure)',
                                        fontWeight: 700,
                                        fontSize: FS.sm,
                                        width: '39%'
                                    }}>
                                        <StatLabel formulaKey="X" formulaLatex="X" />
                                    </th>
                                    <th style={{
                                        borderBottom: '1px solid var(--text-pure)',
                                        borderRight: '1px solid var(--text-pure)',
                                        padding: '8px 12px',
                                        textAlign: 'center',
                                        color: 'var(--text-pure)',
                                        fontWeight: 700,
                                        fontSize: FS.sm,
                                        width: '39%'
                                    }}>
                                        <StatLabel formulaKey="P(X)" formulaLatex="P(X)" />
                                    </th>
                                    <th style={{
                                        borderBottom: '1px solid var(--text-pure)',
                                        padding: '8px 6px',
                                        textAlign: 'center',
                                        color: 'var(--text-pure)',
                                        fontWeight: 700,
                                        fontSize: FS.sm,
                                        width: '22%',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        Acción
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {tabla.map((fila, idx) => (
                                    <tr
                                        key={fila.id}
                                        style={{
                                            borderBottom: idx === tabla.length - 1 ? 'none' : '1px solid var(--text-pure)'
                                        }}
                                    >
                                        <td style={{ borderRight: '1px solid var(--text-pure)', padding: 0 }}>
                                            <input
                                                type="number"
                                                className="input-mat251 placeholder-small"
                                                value={fila.x}
                                                placeholder="Ej. 0"
                                                onChange={(e) => actualizarFila(fila.id, 'x', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    minHeight: '38px',
                                                    padding: '8px 12px',
                                                    textAlign: 'center',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    outline: 'none',
                                                    color: 'var(--text-pure)',
                                                    fontSize: FS.sm,
                                                    fontFamily: FONT,
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </td>
                                        <td style={{ borderRight: '1px solid var(--text-pure)', padding: 0 }}>
                                            <input
                                                type="number"
                                                className="input-mat251 placeholder-small"
                                                step="0.01"
                                                min="0"
                                                max="1"
                                                value={fila.p}
                                                placeholder="Ej. 0.25"
                                                onChange={(e) => actualizarFila(fila.id, 'p', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    minHeight: '38px',
                                                    padding: '8px 12px',
                                                    textAlign: 'center',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    outline: 'none',
                                                    color: 'var(--text-pure)',
                                                    fontSize: FS.sm,
                                                    fontFamily: FONT,
                                                    boxSizing: 'border-box'
                                                }}
                                            />
                                        </td>
                                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '6px' }}>
                                            <button
                                                type="button"
                                                onClick={() => eliminarFila(fila.id)}
                                                className="btn-eliminar-fila-mat251"
                                                disabled={tabla.length <= 1}
                                                title="Eliminar fila"
                                            >
                                                <IconoBasura width="17" height="17" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0px' }}>
                        <button
                            type="button"
                            onClick={agregarFila}
                            className="btn-primary btn-agregar-fila-discreta"
                            style={{
                                borderRadius: RADIUS,
                                fontSize: FS.sm,
                                fontFamily: FONT,
                                fontWeight: 600,
                                padding: '5px 20px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                            }}
                            title="Agregar fila"
                        >
                            <span>Agregar Fila</span>
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '0px' }}>
                        <button
                            type="button"
                            className="button_calcular"
                            onClick={handleCalcular}
                            style={{
                                width: 'fit-content',
                                padding: '5px 20px',
                                borderRadius: RADIUS,
                                fontSize: FS.md,
                                fontWeight: 600,
                                fontFamily: FONT,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            CALCULAR
                        </button>
                    </div>
                </>
            )}

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
