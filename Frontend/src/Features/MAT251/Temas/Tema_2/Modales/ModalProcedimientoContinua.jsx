import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { fraction } from 'mathjs';
import { FONT, FS, RADIUS } from '../../../Principal/Constantes';

export default function ModalProcedimientoContinua({ momento, datos, onClose }) {
    const contenedorRef = useRef(null);
    const latexRef = useRef(null);

    useEffect(() => {
        // Bloquear scroll de la página principal
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    useEffect(() => {
        if (!datos || !momento || !latexRef.current) return;

        const { funcion, a, b, esperanza, varianza, desviacion, asimetria, curtosis } = datos;
        
        const aTex = a === Infinity ? '\\infty' : a === -Infinity ? '-\\infty' : a;
        const bTex = b === Infinity ? '\\infty' : b === -Infinity ? '-\\infty' : b;
        
        let titulo = '';
        let procedimiento = '';

        // Formateamos los números a 4 decimales en el reemplazo
        const esp_str = esperanza.toFixed(4);
        const des_str = desviacion.toFixed(4);
        
        const fxLatex = datos.latexString || `(${funcion})`;

        const formatearResultado = (valor) => {
            try {
                const f = fraction(valor);
                // Evitar fracciones con denominadores gigantes (números irracionales o precisión flotante)
                if (f.d === 1 || f.d > 10000) {
                    return valor.toFixed(4);
                }
                const signo = f.s < 0 ? '-' : '';
                return `${signo}\\frac{${f.n}}{${f.d}} = ${valor.toFixed(4)}`;
            } catch (e) {
                return valor.toFixed(4);
            }
        };

        switch (momento) {
            case 'esperanza':
                titulo = 'Esperanza Matemática E(X)';
                procedimiento = `
                    \\begin{aligned}
                    E(X) &= \\int_{${aTex}}^{${bTex}} x \\cdot f(x) \\, dx \\\\[10pt]
                    E(X) &= \\int_{${aTex}}^{${bTex}} x \\cdot \\left( ${fxLatex} \\right) \\, dx \\\\[10pt]
                    E(X) &\\approx ${formatearResultado(esperanza)}
                    \\end{aligned}
                `;
                break;
            case 'varianza':
                titulo = 'Varianza Var(X)';
                procedimiento = `
                    \\begin{aligned}
                    Var(X) &= \\int_{${aTex}}^{${bTex}} (x - \\mu)^2 \\cdot f(x) \\, dx \\\\[10pt]
                    Var(X) &= \\int_{${aTex}}^{${bTex}} (x - ${esp_str})^2 \\cdot \\left( ${fxLatex} \\right) \\, dx \\\\[10pt]
                    Var(X) &\\approx ${formatearResultado(varianza)}
                    \\end{aligned}
                `;
                break;
            case 'desviacion':
                titulo = 'Desviación Estándar \\sigma';
                procedimiento = `
                    \\begin{aligned}
                    \\sigma &= \\sqrt{Var(X)} \\\\[10pt]
                    \\sigma &= \\sqrt{${varianza.toFixed(4)}} \\\\[10pt]
                    \\sigma &\\approx ${formatearResultado(desviacion)}
                    \\end{aligned}
                `;
                break;
            case 'asimetria':
                titulo = 'Asimetría (Sesgo) \\gamma_1';
                procedimiento = `
                    \\begin{aligned}
                    \\gamma_1 &= \\int_{${aTex}}^{${bTex}} \\left(\\frac{x - \\mu}{\\sigma}\\right)^3 \\cdot f(x) \\, dx \\\\[10pt]
                    \\gamma_1 &= \\int_{${aTex}}^{${bTex}} \\left(\\frac{x - ${esp_str}}{${des_str}}\\right)^3 \\cdot \\left( ${fxLatex} \\right) \\, dx \\\\[10pt]
                    \\gamma_1 &\\approx ${formatearResultado(asimetria)}
                    \\end{aligned}
                `;
                break;
            case 'curtosis':
                titulo = 'Curtosis \\gamma_2';
                procedimiento = `
                    \\begin{aligned}
                    \\gamma_2 &= \\int_{${aTex}}^{${bTex}} \\left(\\frac{x - \\mu}{\\sigma}\\right)^4 \\cdot f(x) \\, dx - 3 \\\\[10pt]
                    \\gamma_2 &= \\int_{${aTex}}^{${bTex}} \\left(\\frac{x - ${esp_str}}{${des_str}}\\right)^4 \\cdot \\left( ${fxLatex} \\right) \\, dx - 3 \\\\[10pt]
                    \\gamma_2 &\\approx ${formatearResultado(curtosis)}
                    \\end{aligned}
                `;
                break;
            default:
                break;
        }

        try {
            katex.render(procedimiento, latexRef.current, {
                displayMode: true,
                throwOnError: false
            });
        } catch (e) {
            console.error("Error renderizando KaTeX", e);
        }

    }, [momento, datos]);

    if (!momento || !datos) return null;

    const titulosMap = {
        esperanza: 'Esperanza Matemática',
        varianza: 'Varianza',
        asimetria: 'Asimetría',
        curtosis: 'Curtosis'
    };

    const handleClickFuera = (e) => {
        if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
            onClose();
        }
    };

    return (
        <div 
            onClick={handleClickFuera}
            style={{ 
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
                zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center',
                padding: '20px', fontFamily: FONT
            }}
        >
            <div 
                ref={contenedorRef}
                style={{ 
                    background: 'white', borderRadius: '12px', width: '100%', maxWidth: '700px', 
                    maxHeight: '85vh', display: 'flex', flexDirection: 'column',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    overflow: 'hidden', animation: 'fadeInUp 0.3s ease-out'
                }}
            >
                {/* Cabecera */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: FS.md, color: '#0f172a', fontWeight: 600 }}>Desglose de Procedimiento</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: FS.sm, color: '#64748b' }}>{titulosMap[momento]}</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        style={{ cursor: 'pointer', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '18px', transition: 'background 0.2s' }}
                        onMouseOver={(e) => e.target.style.background = '#e2e8f0'}
                        onMouseOut={(e) => e.target.style.background = '#f1f5f9'}
                    >
                        ✖
                    </button>
                </div>

                {/* Contenido (Scrollable) */}
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: '#ffffff' }}>
                    <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: RADIUS, padding: '20px', overflowX: 'auto' }}>
                        <div ref={latexRef} style={{ fontSize: '1.2em' }}></div>
                    </div>
                    
                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#eff6ff', borderLeft: '4px solid #3b82f6', borderRadius: '0 4px 4px 0' }}>
                        <p style={{ margin: 0, fontSize: FS.sm, color: '#1e3a8a', lineHeight: 1.5 }}>
                            <strong>Nota Metodológica:</strong> El cálculo ha sido aproximado computacionalmente utilizando integración numérica avanzada (Regla de Simpson) iterando mil veces el área bajo la curva sobre la función provista <code>f(x) = {datos.funcion}</code> entre <code>{datos.a}</code> y <code>{datos.b}</code>.
                        </p>
                    </div>
                </div>
            </div>
            <style>
                {`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                `}
            </style>
        </div>
    );
}
