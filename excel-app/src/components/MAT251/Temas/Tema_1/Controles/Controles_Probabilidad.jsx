import React from 'react';
import {FONT, FS, RADIUS, labelStyle } from '../../../Principal/Constantes';

import {IconoVariables} from '../../../../ui/iconos';


export default function ControlesProbabilidad({ setModalVars, varSeleccionada }) {
    return (
        <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column' }}>
            <label style={labelStyle}>Variable (Opcional):</label>
            <button
                onClick={() => setModalVars(true)}
                className="btn-icon"
                style={{
                    width: 'fit-content',
                    alignSelf: 'center',
                    marginBottom: '10px',
                    background: 'var(--primary-color)',
                    color: 'white',
                    borderRadius: RADIUS,
                    fontSize: FS.sm,
                    padding: '8px 20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer'
                }}
            >
                <IconoVariables/>
                {varSeleccionada ? `Cambiar Variable` : 'Importar Variable de Excel'}
            </button>

            {/* ── Tarjeta profesional de la variable ── */}
            {varSeleccionada && (() => {
                const datos = varSeleccionada.datos || [];
                const numeros = datos.map(d => parseFloat(d)).filter(d => !isNaN(d));
                const esNum = numeros.length === datos.length;
                const esMixto = numeros.length > 0 && numeros.length < datos.length;
                const tipo = esNum ? 'Numérico' : esMixto ? 'Mixto' : 'Texto';
                const unicos = [...new Set(datos.map(d => d.toString().trim()))].length;
                const min = esNum ? Math.min(...numeros) : null;
                const max = esNum ? Math.max(...numeros) : null;

                const stats = [
                    { label: 'Nombre', val: varSeleccionada.nombre },
                    { label: 'Tipo', val: tipo },
                    { label: 'Total', val: `${datos.length} datos` },
                    { label: 'Únicos', val: `${unicos} valores` },
                    ...(esNum ? [
                        { label: 'Mínimo', val: min },
                        { label: 'Máximo', val: max },
                    ] : []),
                ];

                return (
                    <div style={{
                        border: '1px solid var(--primary-color)',
                        borderRadius: RADIUS,
                        overflow: 'hidden',
                        fontSize: FS.xs,
                        fontFamily: FONT,
                    }}>
                        <div style={{ background: 'var(--primary-color)', color: 'white', padding: '6px 10px', fontWeight: 700, fontSize: FS.sm }}>
                            ✓ Variable cargada
                        </div>
                        {stats.map(({ icon, label, val }, i) => (
                            <div key={label} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '5px 10px',
                                background: i % 2 === 0 ? 'var(--bg-body)' : 'var(--bg-card)',
                                borderTop: '1px solid var(--border-color)',
                            }}>
                                <span style={{ color: 'var(--text-muted)' }}>{icon} {label}</span>
                                <span style={{ fontWeight: 600, color: 'var(--text-main)', maxWidth: '55%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</span>
                            </div>
                        ))}
                    </div>
                );
            })()}
        </div>
    )
}