import React from 'react';
import { FS, RADIUS } from '../../../Principal/Constantes';

export default function ResultadosConteo({ resConteo, formulaConteoRef, hayResultado }) {
    if (!hayResultado && !resConteo) {
        return (
            <p style={{ color: 'var(--text-muted)', marginTop: '10px', fontSize: FS.base }}>
                Configura los parámetros a la izquierda y presiona <strong>CALCULAR</strong>.
            </p>
        );
    }
    if (!resConteo) return null;

    return (
        <div style={{ marginTop: '20px' }}>
            <div ref={formulaConteoRef} style={{ overflowX: 'auto' }} />
            <p style={{ marginTop: '15px', color: 'var(--text-muted)', fontStyle: 'normal', fontSize: FS.sm }}>{resConteo.explicacion}</p>
            <div style={{ marginTop: '20px', padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: RADIUS, textAlign: 'center' }}>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: FS.sm }}>{resConteo.simbolo === 'nPr' ? 'Permutaciones posibles' : 'Combinaciones posibles'}</p>
                <p style={{ margin: '8px 0 0', fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>{resConteo.resultado.toLocaleString()}</p>
            </div>
        </div>
    );
}