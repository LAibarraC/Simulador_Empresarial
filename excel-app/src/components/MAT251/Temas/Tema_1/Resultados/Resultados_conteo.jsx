import React, { useEffect, useRef } from 'react';
import { FS, RADIUS } from '../../../Principal/Constantes';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function ResultadosConteo({ resConteo, hayResultado }) {
    const formulaPermRef = useRef(null);
    const formulaCombRef = useRef(null);

    useEffect(() => {
        if (resConteo) {
            const { n, r, permutacion, combinacion } = resConteo;
            if (formulaPermRef.current) {
                const latexP = `P(${n},\\,${r})=\\dfrac{${n}!}{(${n}-${r})!}=${permutacion.resultado.toLocaleString()}`;
                katex.render(latexP, formulaPermRef.current, { throwOnError: false, displayMode: true });
            }
            if (formulaCombRef.current) {
                const latexC = `C(${n},\\,${r})=\\dfrac{${n}!}{${r}!(${n}-${r})!}=${combinacion.resultado.toLocaleString()}`;
                katex.render(latexC, formulaCombRef.current, { throwOnError: false, displayMode: true });
            }
        }
    }, [resConteo]);

    if (!hayResultado && !resConteo) {
        return (
            <p style={{ color: 'var(--text-muted)', marginTop: '10px', fontSize: FS.base }}>
                Configura los parámetros a la izquierda y presiona <strong>CALCULAR</strong>.
            </p>
        );
    }
    if (!resConteo) return null;

    const { permutacion, combinacion, n } = resConteo;

    const renderPanel = (titulo, datos, ref, color) => (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '2px solid #000', borderRadius: RADIUS, background: 'var(--bg-card)', overflow: 'hidden' }}>
            <div style={{ background: '#000', color: '#fff', padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: FS.md }}>
                {titulo}
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div ref={ref} style={{ overflowX: 'auto', marginBottom: '15px', color: '#000' }} />
                
                <p style={{ color: 'var(--text-muted)', fontSize: FS.sm, fontStyle: 'italic', marginBottom: '20px', textAlign: 'center' }}>
                    {datos.explicacion}
                </p>

                <div style={{ marginTop: 'auto', padding: '15px', background: 'var(--bg-body)', border: '1px solid #000', borderRadius: RADIUS, textAlign: 'center' }}>
                    <p style={{ margin: 0, color: '#000', fontSize: FS.sm, fontWeight: 600 }}>Total Posibles</p>
                    <p style={{ margin: '5px 0 0', fontSize: '2rem', fontWeight: 700, color: color }}>
                        {datos.resultado.toLocaleString()}
                    </p>
                </div>

                {datos.elementos && datos.elementos.length > 0 && n <= 10 && (
                    <div style={{ marginTop: '20px' }}>
                        <p style={{ margin: '0 0 10px', color: '#000', fontSize: FS.sm, fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '5px' }}>
                            Visualización de Elementos ({datos.elementos.length}):
                        </p>
                        <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px', borderRadius: RADIUS, fontSize: '0.85rem', background: '#f9f9f9', fontFamily: 'monospace', color: '#333' }}>
                            {datos.elementos.join(', ')}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div style={{ marginTop: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {renderPanel('PERMUTACIONES (Importa el orden)', permutacion, formulaPermRef, '#d32f2f')}
            {renderPanel('COMBINACIONES (No importa el orden)', combinacion, formulaCombRef, '#1976d2')}
        </div>
    );
}