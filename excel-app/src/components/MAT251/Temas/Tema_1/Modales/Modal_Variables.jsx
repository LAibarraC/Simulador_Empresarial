import React from 'react';
import { overlayStyle, modalBoxStyle, FS, RADIUS } from '../../../Principal/Constantes';

export default function ModalVariables({ modalVars, setModalVars, variables, cargarVariable }) {
    if (!modalVars) return null;
    return (
        <div style={overlayStyle} onClick={() => setModalVars(false)}>
            <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ margin: '0 0 16px', fontSize: FS.lg, fontWeight: 600 }}>Selecciona una Variable</h3>
                {variables && variables.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                        {variables.map((v, i) => (
                            <div key={i} onClick={() => cargarVariable(v)}
                                style={{ padding: '12px 16px', borderRadius: RADIUS, cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-body)', transition: 'background 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-body)'}
                            >
                                <strong style={{ fontSize: FS.base }}>{v.nombre}</strong>
                                <p style={{ margin: '2px 0 0', fontSize: FS.xs, color: 'var(--text-muted)' }}>{v.datos?.length || 0} datos disponibles</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: FS.base }}>No hay variables importadas.</p>
                )}
                <div style={{ textAlign: 'right', marginTop: '16px' }}>
                    <button onClick={() => setModalVars(false)} style={{ background: '#6b7280', borderRadius: RADIUS, fontSize: FS.base, border: 'none', color: 'white', padding: '8px 16px', cursor: 'pointer' }}>Cancelar</button>
                </div>
            </div>
        </div>
    )
}