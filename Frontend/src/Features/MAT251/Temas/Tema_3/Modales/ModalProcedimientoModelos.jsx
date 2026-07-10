import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { puntualBinomial, puntualPoisson, puntualHipergeometrica } from '../../../Matematicas/logica_Tema3';

export default function ModalProcedimientoModelos({ modelo, params, condicion, momento, onClose }) {
    const latexRef = useRef(null);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    useEffect(() => {
        if (!latexRef.current) return;

        let latex = "";
        const { tipo, valorX, valorB } = condicion;

        if (momento === 'esperanza') {
            if (modelo === 'Binomial') {
                latex = `
                    \\begin{aligned}
                    \\text{Esperanza Matemática (Binomial):} \\\\
                    E(X) &= n \\cdot p \\\\
                    E(X) &= ${params.n} \\cdot ${params.p} \\\\
                    E(X) &= ${(params.n * params.p).toFixed(4)}
                    \\end{aligned}
                `;
            } else if (modelo === 'Poisson') {
                latex = `
                    \\begin{aligned}
                    \\text{Esperanza Matemática (Poisson):} \\\\
                    E(X) &= \\lambda \\\\
                    E(X) &= ${params.lambda.toFixed(4)}
                    \\end{aligned}
                `;
            } else if (modelo === 'Hipergeometrica') {
                latex = `
                    \\begin{aligned}
                    \\text{Esperanza Matemática (Hipergeométrica):} \\\\
                    E(X) &= n \\cdot \\frac{K}{N} \\\\
                    E(X) &= ${params.n} \\cdot \\frac{${params.K}}{${params.N}} \\\\
                    E(X) &= ${(params.n * (params.K / params.N)).toFixed(4)}
                    \\end{aligned}
                `;
            }
        } else if (momento === 'varianza') {
            if (modelo === 'Binomial') {
                latex = `
                    \\begin{aligned}
                    \\text{Varianza (Binomial):} \\\\
                    V(X) &= n \\cdot p \\cdot (1 - p) \\\\
                    V(X) &= ${params.n} \\cdot ${params.p} \\cdot (1 - ${params.p}) \\\\
                    V(X) &= ${(params.n * params.p * (1 - params.p)).toFixed(4)}
                    \\end{aligned}
                `;
            } else if (modelo === 'Poisson') {
                latex = `
                    \\begin{aligned}
                    \\text{Varianza (Poisson):} \\\\
                    V(X) &= \\lambda \\\\
                    V(X) &= ${params.lambda.toFixed(4)}
                    \\end{aligned}
                `;
            } else if (modelo === 'Hipergeometrica') {
                const varHiper = params.n * (params.K / params.N) * ((params.N - params.K) / params.N) * ((params.N - params.n) / (params.N - 1));
                latex = `
                    \\begin{aligned}
                    \\text{Varianza (Hipergeométrica):} \\\\
                    V(X) &= n \\cdot \\frac{K}{N} \\cdot \\frac{N-K}{N} \\cdot \\frac{N-n}{N-1} \\\\
                    V(X) &= ${params.n} \\cdot \\frac{${params.K}}{${params.N}} \\cdot \\frac{${params.N}-${params.K}}{${params.N}} \\cdot \\frac{${params.N}-${params.n}}{${params.N}-1} \\\\
                    V(X) &= ${varHiper.toFixed(4)}
                    \\end{aligned}
                `;
            }
        } else if (momento === 'desviacion') {
            let varVal = 0;
            if (modelo === 'Binomial') varVal = params.n * params.p * (1 - params.p);
            if (modelo === 'Poisson') varVal = params.lambda;
            if (modelo === 'Hipergeometrica') varVal = params.n * (params.K / params.N) * ((params.N - params.K) / params.N) * ((params.N - params.n) / (params.N - 1));
            
            latex = `
                \\begin{aligned}
                \\text{Desviación Estándar (${modelo}):} \\\\
                \\sigma &= \\sqrt{V(X)} \\\\
                \\sigma &= \\sqrt{${varVal.toFixed(4)}} \\\\
                \\sigma &= ${Math.sqrt(varVal).toFixed(4)}
                \\end{aligned}
            `;
        } else {
            // Fórmulas teóricas base para la Probabilidad
        const formBinomial = `P(X=x) = \\binom{n}{x} p^x (1-p)^{n-x}`;
        const formPoisson = `P(X=x) = \\frac{e^{-\\lambda} \\lambda^x}{x!}`;
        const formHiper = `P(X=x) = \\frac{\\binom{K}{x} \\binom{N-K}{n-x}}{\\binom{N}{n}}`;

        let formulaBase = "";
        let sustitucionEjemplo = "";
        let resultadoEjemplo = 0;

        // X objetivo para mostrar en el ejemplo del modal (usamos valorX si no es intervalo, o el inicio del intervalo)
        const xShow = tipo === 'intervalo' ? valorX : valorX;

        if (modelo === 'Binomial') {
            formulaBase = formBinomial;
            sustitucionEjemplo = `P(X=${xShow}) = \\binom{${params.n}}{${xShow}} (${params.p})^{${xShow}} (1-${params.p})^{${params.n}-${xShow}}`;
            resultadoEjemplo = puntualBinomial(params.n, params.p, xShow);
        } else if (modelo === 'Poisson') {
            formulaBase = formPoisson;
            sustitucionEjemplo = `P(X=${xShow}) = \\frac{e^{-${params.lambda}} (${params.lambda})^{${xShow}}}{${xShow}!}`;
            resultadoEjemplo = puntualPoisson(params.lambda, xShow);
        } else if (modelo === 'Hipergeometrica') {
            formulaBase = formHiper;
            sustitucionEjemplo = `P(X=${xShow}) = \\frac{\\binom{${params.K}}{${xShow}} \\binom{${params.N}-${params.K}}{${params.n}-${xShow}}}{\\binom{${params.N}}{${params.n}}}`;
            resultadoEjemplo = puntualHipergeometrica(params.N, params.K, params.n, xShow);
        }

        if (tipo === 'exacta') {
            latex = `
                \\begin{aligned}
                \\text{1. Fórmula Teórica (${modelo}):} \\\\
                ${formulaBase} \\\\[10pt]
                \\text{2. Sustituyendo valores (x=${xShow}):} \\\\
                ${sustitucionEjemplo} \\\\[10pt]
                \\text{3. Resultado Puntual:} \\\\
                P(X=${xShow}) &= ${resultadoEjemplo.toFixed(4)}
                \\end{aligned}
            `;
        } else {
            let sumatoriaText = "";
            if (tipo === 'menor_igual') sumatoriaText = `P(X \\leq ${valorX}) = \\sum_{x=0}^{${valorX}} P(x)`;
            if (tipo === 'mayor_igual') sumatoriaText = `P(X \\geq ${valorX}) = \\sum_{x=${valorX}}^{\\text{max}} P(x)`;
            if (tipo === 'intervalo') sumatoriaText = `P(${valorX} \\leq X \\leq ${valorB}) = \\sum_{x=${valorX}}^{${valorB}} P(x)`;

            latex = `
                \\begin{aligned}
                \\text{1. Fórmula Puntual Base:} \\\\
                ${formulaBase} \\\\[10pt]
                \\text{2. Lógica Acumulada solicitada:} \\\\
                ${sumatoriaText} \\\\[10pt]
                \\text{3. Ejemplo de un término (x=${xShow}):} \\\\
                ${sustitucionEjemplo} \\approx ${resultadoEjemplo.toFixed(4)} \\\\[10pt]
                \\text{* Se repite el paso 3 para cada valor en el rango y se suman.}
                \\end{aligned}
            `;
        }

        }

        katex.render(latex, latexRef.current, {
            throwOnError: false,
            displayMode: true
        });

    }, [modelo, params, condicion, momento]);

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }} onClick={onClose}>
            <div style={{ background: 'white', borderRadius: '8px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '30px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50%', width: '36px', height: '36px', fontSize: '1.2rem', color: '#334155', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>✕</button>

                <h3 style={{ color: '#1e3a8a', fontSize: '1.25rem', marginTop: 0, marginBottom: '5px', paddingRight: '40px' }}>
                    Procedimiento: {momento === 'esperanza' ? 'Esperanza Matemática' : momento === 'varianza' ? 'Varianza' : momento === 'desviacion' ? 'Desviación Estándar' : `Probabilidad ${modelo}`}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 0, marginBottom: '25px' }}>
                    Visualización de la fórmula teórica y reemplazo paso a paso.
                </p>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', minHeight: '150px', overflowX: 'auto' }}>
                    <div ref={latexRef} style={{ fontSize: '1.1em', color: '#1e293b' }}></div>
                </div>

                <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Entendido</button>
                </div>
            </div>
        </div>
    );
}
