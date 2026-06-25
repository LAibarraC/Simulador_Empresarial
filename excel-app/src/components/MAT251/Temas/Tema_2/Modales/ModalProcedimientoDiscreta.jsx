import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { FS } from '../../../Principal/Constantes';

// Componente helper para renderizar KaTeX
const FormulaKaTeX = ({ latex, inline = false }) => {
    const formulaRef = useRef(null);

    useEffect(() => {
        if (formulaRef.current && latex) {
            katex.render(latex, formulaRef.current, { throwOnError: false, displayMode: !inline });
        }
    }, [latex, inline]);

    if (inline) {
        return <span ref={formulaRef} style={{ margin: '0 4px' }}></span>;
    }
    return <div ref={formulaRef} style={{ margin: '15px 0', fontSize: '1.1em', overflowX: 'auto', overflowY: 'hidden', paddingBottom: '8px' }}></div>;
};

export default function ModalProcedimientoDiscreta({ 
    momentoActivo, 
    setMomentoActivo, 
    resultados 
}) {
    if (!momentoActivo || !resultados) return null;

    const { datos, esperanza, varianza, desviacion } = resultados;

    const construirLatexDesarrollado = (tipo, resultado) => {
        if (!datos || datos.length === 0) return null;

        const muStr = esperanza.toFixed(2);
        const sigStr = desviacion.toFixed(2);
        const resStr = resultado.toFixed(2);

        if (tipo === 'desviacion') {
            return (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', columnGap: '6px', rowGap: '12px' }}>
                    <FormulaKaTeX latex={`\\sigma = \\sqrt{Var(X)} = \\sqrt{${varianza.toFixed(2)}} = ${resStr}`} inline={true} />
                </div>
            );
        }

        const formatearTermino = (item) => {
            const xVal = Number(item.x).toFixed(2);
            const pVal = Number(item.p).toFixed(2);
            const pStr = `(${pVal})`;
            
            if (tipo === 'esperanza') return `(${xVal})${pStr}`;
            if (tipo === 'varianza') return `(${xVal} - ${muStr})^2${pStr}`;
            if (tipo === 'asimetria') return `\\left(\\frac{${xVal} - ${muStr}}{${sigStr}}\\right)^3${pStr}`;
            if (tipo === 'curtosis') return `\\left(\\frac{${xVal} - ${muStr}}{${sigStr}}\\right)^4${pStr}`;
            return '';
        };

        const prefix = 
            tipo === 'esperanza' ? 'E(X) =' :
            tipo === 'varianza' ? 'Var(X) =' :
            tipo === 'asimetria' ? '\\gamma_1 =' :
            '\\gamma_2 = \\Bigg[';
            
        const suffix = 
            tipo === 'curtosis' ? `\\Bigg] - 3 = ${resStr}` :
            `= ${resStr}`;

        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', columnGap: '6px', rowGap: '12px' }}>
                <FormulaKaTeX latex={prefix} inline={true} />
                {datos.map((d, i) => {
                    const isLast = i === datos.length - 1;
                    const latexTerm = formatearTermino(d) + (isLast ? '' : ' +');
                    return <FormulaKaTeX key={i} latex={latexTerm} inline={true} />
                })}
                <FormulaKaTeX latex={suffix} inline={true} />
            </div>
        );
    };

    return (
        <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.5)', zIndex: 1000, 
            display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' 
        }}>
            <div style={{ 
                background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '900px', 
                maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: FS.md, fontWeight: 700 }}>
                        {momentoActivo === 'esperanza' && 'Desarrollo de la Esperanza Matemática'}
                        {momentoActivo === 'varianza' && 'Desarrollo de la Varianza'}
                        {momentoActivo === 'desviacion' && 'Desarrollo de la Desviación Estándar'}
                        {momentoActivo === 'asimetria' && 'Desarrollo de la Asimetría'}
                        {momentoActivo === 'curtosis' && 'Desarrollo de la Curtosis'}
                    </h3>
                    <button 
                        onClick={() => setMomentoActivo(null)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div style={{ padding: '30px 20px', overflowY: 'auto' }}>
                    <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        {construirLatexDesarrollado(momentoActivo, resultados[momentoActivo])}
                    </div>
                </div>
            </div>
        </div>
    );
}
