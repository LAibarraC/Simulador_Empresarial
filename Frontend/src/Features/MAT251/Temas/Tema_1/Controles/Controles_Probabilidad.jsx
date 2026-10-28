import React, { useState } from 'react';
import { FONT, FS, RADIUS, labelStyle } from '../../../Principal/Constantes';
import ModalAlerta from '../../../ui/ModalAlerta';

export default function ControlesProbabilidad({ variables, varSeleccionada, setVarSeleccionada, cargarVariable, deseleccionarVariable, operacion }) {
    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Atención', tipo: 'warning' });

    const handleSeleccionar = (variable) => {
        if (varSeleccionada && varSeleccionada.nombre === variable.nombre) {
            if (deseleccionarVariable) {
                deseleccionarVariable();
            } else if (setVarSeleccionada) {
                setVarSeleccionada(null);
            }
        } else {
            if (operacion === 'distribuciones_muestrales') {
                const tieneMultiplesCols = (variable.nombresColumnas && variable.nombresColumnas.length > 1) ||
                    (variable.tipo && variable.tipo.toLowerCase().includes('mixta')) ||
                    (variable.datos && variable.datos.length > 0 && typeof variable.datos[0] === 'string' && variable.datos[0].includes(' | '));

                if (tieneMultiplesCols) {
                    setModalAlerta({
                        isOpen: true,
                        mensaje: "La variable debe tener 1 sola columna.",
                        titulo: "Atención",
                        tipo: "warning"
                    });
                    return;
                }
            }

            if (cargarVariable) {
                cargarVariable(variable);
            } else if (setVarSeleccionada) {
                setVarSeleccionada(variable);
            }
        }
    };

    return (
        <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column' }}>
            <style>{`
                .caja-variable-tema {
                    border: 1px solid var(--primary-color);
                }
                .caja-variable-tema-header {
                    background: var(--primary-color);
                }
                [data-theme='dark'] .caja-variable-tema, .dark .caja-variable-tema, [data-bs-theme='dark'] .caja-variable-tema {
                    border-color: #ff6e00 !important;
                }
                [data-theme='dark'] .caja-variable-tema-header, .dark .caja-variable-tema-header, [data-bs-theme='dark'] .caja-variable-tema-header {
                    background: #ff6e00 !important;
                }
            `}</style>

            <div id="tour-mat251-variables" style={{ border: '1px solid var(--border-color)', borderRadius: RADIUS, padding: '10px', background: 'var(--bg-card)', marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: FS.sm, fontWeight: 'bold', color: 'var(--text-pure)' }}>Selecciona una Variable:</h4>
                {variables && variables.filter(v => v.datos && v.datos.length > 0).length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto', marginBottom: '5px' }}>
                        {variables.filter(v => v.datos && v.datos.length > 0).map((v, i) => {
                            const isSelected = varSeleccionada && varSeleccionada.nombre === v.nombre;
                            return (
                                <div key={i} onClick={() => handleSeleccionar(v)}
                                    style={{
                                        padding: '8px 12px', borderRadius: RADIUS, cursor: 'pointer',
                                        border: isSelected ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                        background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-body)',
                                        transition: 'all 0.2s',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'
                                    }}
                                >
                                    <div>
                                        <strong style={{ fontSize: FS.sm, color: isSelected ? 'var(--primary-color)' : 'inherit' }}>{v.nombre}</strong>
                                        <div style={{ fontSize: FS.xs, color: 'var(--text-muted)', marginTop: '2px' }}>
                                            {v.datos?.length || 0} datos
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                        {v.tipo && (
                                            <span style={{
                                                fontSize: '0.6rem',
                                                padding: '1px 5px',
                                                borderRadius: '5px',
                                                background: v.tipo.includes('Cuantitativa') ? '#dcfce7' : v.tipo.includes('Cualitativa') ? '#e0f2fe' : '#fecdd3',
                                                color: v.tipo.includes('Cuantitativa') ? '#166534' : v.tipo.includes('Cualitativa') ? '#075985' : '#9f1239',
                                                fontWeight: 600,
                                                border: v.tipo.includes('Cuantitativa') ? '1px solid #bbf7d0' : v.tipo.includes('Cualitativa') ? '1px solid #bae6fd' : '1px solid #fecdd3'
                                            }}>
                                                {v.tipo}
                                            </span>
                                        )}
                                        {v.nombresColumnas && v.nombresColumnas.length > 0 && (
                                            <div style={{ fontSize: '0.70rem', color: isSelected ? 'var(--primary-color)' : 'var(--text-muted)', textAlign: 'right', fontWeight: isSelected ? 600 : 400, opacity: 0.8 }}>
                                                Columnas: {v.nombresColumnas.length}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: FS.sx, margin: '10px 0' }}>No hay variables disponibles con datos.</p>
                )}
            </div>
            <ModalAlerta
                isOpen={modalAlerta.isOpen}
                mensaje={modalAlerta.mensaje}
                titulo={modalAlerta.titulo}
                tipo={modalAlerta.tipo}
                onClose={() => setModalAlerta(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
