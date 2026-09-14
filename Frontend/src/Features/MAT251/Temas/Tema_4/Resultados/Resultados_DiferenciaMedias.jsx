import React from 'react';
import Latex from '../../../../../components/excel/Latex';
import { cardStyle, FS, RADIUS } from '../../../Principal/Constantes';

export default function Resultados_DiferenciaMedias({ resultados }) {
    if (!resultados || !resultados.probFinal) return null;

    return (
        <div style={{ ...cardStyle, background: 'var(--bg-card)', height: '100%', display: 'flex', flexDirection: 'column', border: 'none', boxShadow: 'none', padding: 0 }}>
            <h3 style={{ color: 'var(--primary-color)', fontSize: FS.md, margin: '0 0 15px 0' }}>
                Resultados y Desarrollo
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ background: 'transparent', padding: '10px', borderRadius: RADIUS, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: FS.sm, marginBottom: '15px' }}>
                        Cálculo y Estandarización a Z
                    </div>
                    <div className="thin-scrollbar formula-responsive" style={{ overflowX: 'auto' }}>
                        <Latex formula={resultados.strDesarrollo} />
                    </div>
                </div>

                <div style={{ background: 'transparent', padding: '10px', borderRadius: RADIUS, border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: FS.xs, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                        PROBABILIDAD FINAL
                    </div>
                    <div style={{ color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 800, lineHeight: 1 }}>
                        {(resultados.probFinal * 100).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                    </div>
                </div>
            </div>
        </div>
    );
}
