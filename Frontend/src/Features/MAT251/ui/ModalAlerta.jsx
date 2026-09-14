import React, { useEffect } from 'react';
import { FS, RADIUS } from '../Principal/Constantes';
import { IconoAlerta } from '../../../ui/iconos';

export default function ModalAlerta({ isOpen, onClose, titulo = "Atención", mensaje, tipo = "warning" }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const isError = tipo === 'error';
    const colorTheme = isError ? '#ef4444' : '#f59e0b'; // Rojo para error, amarillo/naranja para advertencia
    
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999,
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                background: 'var(--bg-card, #ffffff)', padding: '24px', borderRadius: '12px',
                width: '90%', maxWidth: '380px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                display: 'flex', flexDirection: 'column', gap: '16px', borderTop: `4px solid ${colorTheme}`,
                animation: 'slideUp 0.3s ease-out'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                        background: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', 
                        padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <IconoAlerta width="24" height="24" style={{ color: colorTheme }} />
                    </div>
                    <h3 style={{ margin: 0, color: 'var(--text-color, #1e293b)', fontSize: '1.25rem', fontWeight: 600 }}>{titulo}</h3>
                </div>
                
                <p style={{ margin: 0, color: 'var(--text-muted, #64748b)', fontSize: FS.md, lineHeight: 1.5 }}>
                    {mensaje}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <button
                        className={isError ? "btn-danger" : "btn-accent"}
                        onClick={onClose}
                    >
                        Entendido
                    </button>
                </div>
            </div>
            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>
        </div>
    );
}
