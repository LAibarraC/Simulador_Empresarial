import React from 'react';
import { FONT, overlayStyle, modalBoxStyle, FS, RADIUS } from '../../../Principal/Constantes';

export default function ModalEventosModify({ modalEvento, setModalEvento, statsEventos, statsEventosPorColumna, eventoFavorable, setEventoFavorable, setResProbabilidad, titulo, mostrarFrecuencia = true }) {
    const [filtro, setFiltro] = React.useState('');

    if (!modalEvento) return null;

    const eventosFiltrados = statsEventos.filter(e => e.valor.toLowerCase().includes(filtro.toLowerCase()));

    const seleccionarTodosVisibles = () => {
        const nuevosValores = statsEventosPorColumna
            ? statsEventosPorColumna.flatMap(col => col.eventos.filter(e => e.valor.toLowerCase().includes(filtro.toLowerCase())).map(e => e.valor))
            : eventosFiltrados.map(e => e.valor);
        const combinados = Array.from(new Set([...eventoFavorable, ...nuevosValores]));
        setEventoFavorable(combinados);
        setResProbabilidad(null);
    };

    const deseleccionarTodosVisibles = () => {
        const valoresAEliminar = statsEventosPorColumna
            ? statsEventosPorColumna.flatMap(col => col.eventos.filter(e => e.valor.toLowerCase().includes(filtro.toLowerCase())).map(e => e.valor))
            : eventosFiltrados.map(e => e.valor);
        const filtrados = eventoFavorable.filter(v => !valoresAEliminar.includes(v));
        setEventoFavorable(filtrados);
        setResProbabilidad(null);
    };

    const toggleValor = (valor) => {
        setEventoFavorable(prev =>
            prev.includes(valor) ? prev.filter(v => v !== valor) : [...prev, valor]
        );
        setResProbabilidad(null);
    };

    // ── Componente de item reutilizable ──────────────────────────────────────────
    const EventoItem = ({ valor, count }) => {
        const isSelected = eventoFavorable.includes(valor);
        return (
            <label
                style={{
                    display: 'flex', alignItems: 'center', padding: '9px 14px',
                    cursor: 'pointer', borderBottom: '1px solid var(--border-color)',
                    transition: 'background 0.15s', gap: '12px',
                    background: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                    fontFamily: FONT
                }}
                onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = 'var(--bg-input)')}
                onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = 'transparent')}
                onClick={() => toggleValor(valor)}
            >
                {/* Checkbox custom */}
                <div style={{
                    width: '18px', height: '18px', borderRadius: RADIUS, flexShrink: 0,
                    border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isSelected ? 'var(--primary-color)' : 'var(--bg-card)',
                    transition: 'all 0.15s'
                }}>
                    {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    )}
                </div>
                {/* Texto */}
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: isSelected ? 'bold' : 500, fontSize: FS.sm, color: isSelected ? 'var(--primary-color)' : 'var(--text-pure)', fontFamily: FONT }}>
                        {valor}
                    </div>
                    {mostrarFrecuencia && (
                        <div style={{ fontSize: FS.xs, color: 'var(--text-muted)', marginTop: '1px', fontFamily: FONT }}>
                            Aparece <strong style={{ color: 'var(--text-pure)' }}>{count}</strong> {count === 1 ? 'vez' : 'veces'}
                        </div>
                    )}
                </div>
            </label>
        );
    };

    // ── Vista agrupada por columna (lado a lado) ────────────────────────────────
    const renderAgrupado = () => {
        const grupos = statsEventosPorColumna
            .map(({ nombre, eventos }) => ({
                nombre,
                grupo: eventos.filter(e => e.valor.toLowerCase().includes(filtro.toLowerCase()))
            }))
            .filter(({ grupo }) => grupo.length > 0);

        return (
            <div style={{ display: 'flex', gap: '0', width: '100%', overflow: 'hidden' }}>
                {grupos.map(({ nombre, grupo }, colIdx) => (
                    <div key={nombre} style={{
                        flex: 1,
                        minWidth: 0,
                        borderRight: colIdx < grupos.length - 1 ? '2px solid var(--primary-color)' : 'none',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        {/* Encabezado de columna */}
                        <div style={{
                            padding: '8px 12px',
                            background: 'var(--primary-color)',
                            color: 'white',
                            fontSize: FS.xs,
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.7px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                            flexShrink: 0
                        }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                <line x1="3" y1="15" x2="21" y2="15"></line>
                                <line x1="9" y1="9" x2="9" y2="21"></line>
                            </svg>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{nombre}</span>
                            <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '10px', padding: '1px 7px', fontSize: '0.68rem', flexShrink: 0 }}>
                                {grupo.length}
                            </span>
                        </div>
                        {/* Items de la columna */}
                        {grupo.map(({ valor, count }) => (
                            <EventoItem key={valor} valor={valor} count={count} />
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={overlayStyle} onClick={() => setModalEvento(false)}>
            <div
                style={{
                    ...modalBoxStyle,
                    maxWidth: statsEventosPorColumna ? '680px' : '450px',
                    padding: '22px 24px',
                    width: '95vw',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '90vh'
                }}
                onClick={(e) => e.stopPropagation()}
            >

                {/* Cabecera */}
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-pure)', fontFamily: FONT }}>
                        {titulo || 'Evento Favorable (A)'}
                    </h3>
                </div>

                {/* Aviso de agrupación por columna */}
                {statsEventosPorColumna && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid var(--border-color)', borderRadius: RADIUS, padding: '7px 12px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span style={{ fontSize: FS.xs, color: 'var(--text-muted)', fontFamily: FONT }}>
                            Valores agrupados por <strong style={{ color: 'var(--text-pure)' }}>columna de datos</strong>.
                        </span>
                    </div>
                )}

                {/* Descripción cuando es lista simple */}
                {!statsEventosPorColumna && (
                    <p style={{ fontSize: FS.sm, color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: '1.4', fontFamily: FONT, textAlign: 'center' }}>
                        Selecciona uno o varios valores que definen este evento.
                    </p>
                )}

                {/* Buscador */}
                <div style={{ marginBottom: '14px' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <svg style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)', pointerEvents: 'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input
                            type="text"
                            placeholder="Filtrar por texto..."
                            className="input-mat251 placeholder-small"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            style={{
                                width: '100%', padding: '8px 12px 8px 32px', borderRadius: RADIUS,
                                border: '1px solid var(--border-color)', fontSize: FS.sm,
                                outline: 'none', boxSizing: 'border-box',
                                background: 'var(--bg-input)', color: 'var(--text-pure)',
                                fontFamily: FONT
                            }}
                        />
                    </div>
                </div>

                {/* Lista de eventos */}
                <div style={{ maxHeight: '320px', overflowY: 'auto', overflowX: 'hidden', borderRadius: RADIUS, border: '1px solid var(--border-color)', background: 'var(--bg-body)' }}>
                    {statsEventosPorColumna
                        ? renderAgrupado()
                        : eventosFiltrados.length > 0
                            ? eventosFiltrados.map(({ valor, count }) => (
                                <EventoItem key={valor} valor={valor} count={count} />
                            ))
                            : (
                                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: FS.sm, fontFamily: FONT }}>
                                    No se encontraron resultados con "{filtro}"
                                </div>
                            )
                    }
                </div>

                {/* Footer compacto con contador y botones */}
                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                    <div>
                        <span style={{ fontSize: FS.xs, color: 'var(--text-muted)', fontFamily: FONT }}>
                            Seleccionados: <strong style={{ color: 'var(--text-pure)' }}>{eventoFavorable.length}</strong>
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                            type="button"
                            className="btn-danger"
                            onClick={() => setModalEvento(false)}
                            style={{
                                padding: '5px 14px',
                                fontSize: FS.sm,
                                borderRadius: RADIUS,
                                fontFamily: FONT,
                                cursor: 'pointer'
                            }}
                        >
                            Cancelar
                        </button>

                        <button
                            type="button"
                            className="btn-primary"
                            onClick={() => setModalEvento(false)}
                            style={{
                                padding: '5px 18px',
                                fontSize: FS.sm,
                                borderRadius: RADIUS,
                                fontFamily: FONT,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
