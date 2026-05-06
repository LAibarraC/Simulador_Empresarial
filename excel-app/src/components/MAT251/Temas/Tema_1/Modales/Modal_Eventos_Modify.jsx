import React from 'react';
import { overlayStyle, modalBoxStyle, FS, RADIUS } from '../../../Principal/Constantes';

export default function ModalEventosModify({modalEvento, setModalEvento, statsEventos, eventoFavorable, setEventoFavorable, SetResProbabilidad}){
    if(!modalEvento) return null;

    return (
        <div style={overlayStyle} onClick={() => setModalEvento(false)}>
          <div style={{ ...modalBoxStyle, maxWidth: '420px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                Evento Favorable (A)
              </h3>
              <button onClick={() => setModalEvento(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <p style={{ fontSize: FS.sm, color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
              Selecciona uno o varios valores que definen tu evento <strong>favorable</strong>.
            </p>

            <div style={{ maxHeight: '350px', overflowY: 'auto', borderRadius: RADIUS, border: '1px solid var(--border-color)', background: 'var(--bg-body)' }}>
              {statsEventos.map(({ valor, count }) => {
                const isSelected = eventoFavorable.includes(valor);

                return (
                  <label
                    key={valor}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'all 0.2s',
                      gap: '14px',
                      background: isSelected ? 'rgba(33, 115, 70, 0.08)' : 'transparent'
                    }}
                    onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = 'var(--bg-input)')}
                    onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '4px',
                      border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isSelected ? 'var(--primary-color)' : 'white',
                      transition: 'all 0.2s'
                    }}>
                      {isSelected && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        setEventoFavorable(prev => 
                          prev.includes(valor) 
                            ? prev.filter(v => v !== valor) 
                            : [...prev, valor]
                        );
                        setResProbabilidad(null);
                      }}
                      style={{ display: 'none' }}
                    />

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: isSelected ? 700 : 600, fontSize: FS.base, color: isSelected ? 'var(--primary-color)' : 'var(--text-main)' }}>
                        {valor}
                      </div>
                      <div style={{ fontSize: FS.xs, color: 'var(--text-muted)', marginTop: '2px' }}>
                        Aparece <strong>{count}</strong> veces
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => setModalEvento(false)}
                className="btn-icon"
                style={{
                  width: '100%',
                  background: 'var(--primary-color)',
                  color: 'white',
                  padding: '12px',
                  borderRadius: RADIUS,
                  fontWeight: 600,
                  fontSize: FS.base,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Confirmar Selección
              </button>
            </div>
          </div>
        </div>
    )
}
