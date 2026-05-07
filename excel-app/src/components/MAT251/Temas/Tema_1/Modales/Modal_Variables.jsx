import React from 'react';
import { overlayStyle, modalBoxStyle, FS, RADIUS } from '../../../Principal/Constantes';

export default function ModalVariables({ modalVars, setModalVars, variables, cargarVariable }) {
    const [seleccionadas, setSeleccionadas] = React.useState([]);

    if (!modalVars) return null;

    const toggleSeleccion = (v) => {
        if (seleccionadas.find(item => item.nombre === v.nombre)) {
            setSeleccionadas(seleccionadas.filter(item => item.nombre !== v.nombre));
        } else {
            setSeleccionadas([...seleccionadas, v]);
        }
    };

    const handleCargar = () => {
        if (seleccionadas.length === 0) return;
        cargarVariable(seleccionadas);
        setSeleccionadas([]);
    };

    return (
        <div style={overlayStyle} onClick={() => { setModalVars(false); setSeleccionadas([]); }}>
            <div style={{...modalBoxStyle, width: '450px'}} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ margin: '0 0 16px', fontSize: FS.lg, fontWeight: 600 }}>Selecciona una Variable</h3>
                {variables && variables.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                        {variables.map((v, i) => {
                            const isSelected = seleccionadas.find(item => item.nombre === v.nombre);
                            return (
                                <div key={i} onClick={() => toggleSeleccion(v)}
                                    style={{ 
                                        padding: '12px 16px', borderRadius: RADIUS, cursor: 'pointer', 
                                        border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', 
                                        background: isSelected ? 'rgba(33, 115, 70, 0.08)' : 'var(--bg-body)', 
                                        transition: 'all 0.2s' 
                                    }}
                                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-input)' }}
                                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-body)' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <strong style={{ fontSize: FS.base, color: isSelected ? 'var(--primary-color)' : 'inherit' }}>{v.nombre}</strong>
                                        {isSelected && <span style={{ color: 'var(--primary-color)', fontSize: '1.2rem' }}>✓</span>}
                                    </div>
                                    <p style={{ margin: '2px 0 0', fontSize: FS.xs, color: 'var(--text-muted)' }}>{v.datos?.length || 0} datos disponibles</p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: FS.base }}>No hay variables importadas.</p>
                )}
                <p style={{ fontSize: FS.xs, color: 'var(--text-muted)', marginTop: '10px' }}>
                            Puedes seleccionar múltiples variables para combinarlas (ideal para Probabilidad Condicional).
                        </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                    <button onClick={() => { setModalVars(false); setSeleccionadas([]); }} style={{ background: '#6b7280', borderRadius: RADIUS, fontSize: FS.base, border: 'none', color: 'white', padding: '8px 16px', cursor: 'pointer' }}>Cancelar</button>
                    <button onClick={handleCargar} disabled={seleccionadas.length === 0} style={{ background: seleccionadas.length > 0 ? 'var(--primary-color)' : '#cbd5e1', borderRadius: RADIUS, fontSize: FS.base, border: 'none', color: 'white', padding: '8px 16px', cursor: seleccionadas.length > 0 ? 'pointer' : 'not-allowed' }}>
                        Cargar {seleccionadas.length > 0 ? `(${seleccionadas.length})` : ''}
                    </button>
                </div>
            </div>
        </div>
    )
}