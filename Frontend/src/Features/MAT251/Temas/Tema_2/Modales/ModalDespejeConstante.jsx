import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { fraction } from 'mathjs';
import { FONT, FS, RADIUS } from '../../../Principal/Constantes';

export default function ModalDespejeConstante({ datos, onClose }) {
    const contenedorRef = useRef(null);
    const latexRef = useRef(null);
    
    const varLatex = datos?.incognitaVar || 'k';

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    useEffect(() => {
        if (!datos || !latexRef.current) return;

        const { a, b, areaParcial, kVal, kStr, latexTemp } = datos;

        const aTex = a === Infinity ? '\\infty' : a === -Infinity ? '-\\infty' : a;
        const bTex = b === Infinity ? '\\infty' : b === -Infinity ? '-\\infty' : b;

        // Convertir areaParcial a fracción para mostrarlo
        let areaParcialStr = areaParcial.toFixed(4);
        try {
            const fArea = fraction(areaParcial);
            if (fArea.d !== 1 && fArea.d < 10000) {
                areaParcialStr = `\\frac{${fArea.n}}{${fArea.d}}`;
                if (fArea.s < 0) areaParcialStr = '-' + areaParcialStr;
            } else if (fArea.d === 1) {
                areaParcialStr = `${fArea.s < 0 ? '-' : ''}${fArea.n}`;
            }
        } catch (e) {}

        // Convertir kStr (ej: "1/2") a LaTeX (\frac{1}{2})
        let kLatex = kStr;
        if (kStr.includes('/')) {
            const partes = kStr.split('/');
            kLatex = `\\frac{${partes[0]}}{${partes[1]}}`;
        }

        const latex = `
            \\begin{aligned}
            \\text{Paso 1: Igualamos a 1} \\\\
            \\int_{${aTex}}^{${bTex}} f(x) \\, dx &= 1 \\\\[10pt]
            
            \\text{Paso 2: Evaluamos la integral base} \\\\
            ${varLatex} \\cdot \\left[ \\int_{${aTex}}^{${bTex}} ${latexTemp} \\, dx \\right] &= 1 \\\\[10pt]
            ${varLatex} \\cdot (${areaParcialStr}) &= 1 \\\\[10pt]
            
            \\text{Paso 3: Despejamos ${varLatex}} \\\\
            ${varLatex} &= \\frac{1}{${areaParcialStr}} \\\\[10pt]
            ${varLatex} &= ${kLatex}
            \\end{aligned}
        `;

        katex.render(latex, latexRef.current, {
            throwOnError: false,
            displayMode: true
        });
    }, [datos]);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }} onClick={onClose}>
            <div ref={contenedorRef} style={{ background: 'white', borderRadius: RADIUS, width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '36px', height: '36px', fontSize: '1.2rem', color: 'var(--text-color)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✕</button>

                <h3 style={{ color: 'var(--primary-color)', fontSize: FS.md, marginTop: 0, marginBottom: '5px', paddingRight: '40px' }}>
                    Procedimiento: Cálculo de constante {varLatex}
                </h3>
                <p style={{ color: '#64748b', fontSize: FS.sm, marginTop: 0, marginBottom: '25px' }}>
                    Resolución paso a paso del despeje de la incógnita para que f(x) sea una función de densidad válida.
                </p>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', minHeight: '150px' }}>
                    <div ref={latexRef} style={{ fontSize: '1.2em', color: '#1e293b' }}></div>
                </div>

                <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '6px', fontSize: FS.sm, fontWeight: 600, cursor: 'pointer' }}>Entendido</button>
                </div>
            </div>
        </div>
    );
}
