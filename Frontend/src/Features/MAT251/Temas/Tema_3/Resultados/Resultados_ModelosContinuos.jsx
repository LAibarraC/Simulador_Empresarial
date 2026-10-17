import React, { useState } from 'react';
import '../../../styles/Temas/Tema3.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { jStat } from 'jstat';
import { FONT, FS, RADIUS } from '../../../Principal/Constantes';
import StatLabel from '../../../ui/StatLabel';
import ModalTablaNormalZ from '../Modales/ModalTablaNormalZ';

export default function Resultados_ModelosContinuos({ resultados, modelo, condicion, params }) {
    if (!resultados) return null;

    const [modalTablaZ, setModalTablaZ] = useState({ isOpen: false, z: 0, detalleCalculo: '' });

    const renderLatex = (str) => {
        return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(str, { throwOnError: false }) }} />;
    };



    const formatNum = (num) => {
        if (typeof num !== 'number' || isNaN(num)) return '-';
        return Number.isInteger(num) ? num.toString() : num.toFixed(2);
    };

    const getMathProbUniforme = () => {
        if (!condicion || !condicion.tipo) {
            return "P(x_1 \\le X \\le x_2) = \\frac{x_2 - x_1}{b - a}";
        }
        const tipo = condicion.tipo;
        if (tipo === 'menor' || tipo === 'menor_igual' || tipo === 'menor_estricto') {
            return "P(X \\le x) = \\frac{x - a}{b - a}";
        }
        if (tipo === 'mayor' || tipo === 'mayor_igual' || tipo === 'mayor_estricto') {
            return "P(X \\ge x) = \\frac{b - x}{b - a}";
        }
        if (tipo === 'entre' || tipo === 'intervalo' || tipo === 'intervalo_estricto') {
            return "P(x_1 \\le X \\le x_2) = \\frac{x_2 - x_1}{b - a}";
        }
        if (tipo === 'exterior') {
            return "P(x_1 > X > x_2) = 1 - \\frac{x_2 - x_1}{b - a}";
        }
        if (tipo === 'suma_intervalos') {
            return "\\sum P(x_{i,1} \\le X \\le x_{i,2}) = \\sum \\frac{x_{i,2} - x_{i,1}}{b - a}";
        }
        if (tipo === 'inversa_menor') {
            return "P(X \\le c) = p \\Rightarrow c = a + p(b - a)";
        }
        if (tipo === 'inversa_mayor') {
            return "P(X \\ge c) = p \\Rightarrow c = b - p(b - a)";
        }
        if (tipo === 'inversa_entre') {
            return "P(c_1 \\le X \\le c_2) = p \\Rightarrow c_1 = a + \\frac{1-p}{2}(b-a), \\; c_2 = b - \\frac{1-p}{2}(b-a)";
        }
        if (tipo === 'inversa_exterior') {
            return "P(c_1 > X > c_2) = p \\Rightarrow c_1 = a + \\frac{p}{2}(b-a), \\; c_2 = b - \\frac{p}{2}(b-a)";
        }
        return "P(x_1 \\le X \\le x_2) = \\frac{x_2 - x_1}{b - a}";
    };

    const getMathProbChiCuadrado = () => {
        if (!condicion || !condicion.tipo) {
            return "P(\\chi^2 \\le x)";
        }
        const tipo = condicion.tipo;
        if (tipo === 'menor' || tipo === 'menor_igual' || tipo === 'menor_estricto') {
            return "P(\\chi^2 \\le x)";
        }
        if (tipo === 'mayor' || tipo === 'mayor_igual' || tipo === 'mayor_estricto') {
            return "P(\\chi^2 \\ge x) = 1 - P(\\chi^2 \\le x)";
        }
        if (tipo === 'entre' || tipo === 'intervalo' || tipo === 'intervalo_estricto') {
            return "P(a \\le \\chi^2 \\le b) = P(\\chi^2 \\le b) - P(\\chi^2 \\le a)";
        }
        if (tipo === 'exterior') {
            return "P(\\chi^2 \\le a) + P(\\chi^2 \\ge b) = P(\\chi^2 \\le a) + [1 - P(\\chi^2 \\le b)]";
        }
        if (tipo === 'suma_intervalos') {
            return "\\sum [P(\\chi^2 \\le b_i) - P(\\chi^2 \\le a_i)]";
        }
        return "P(\\chi^2 \\le x)";
    };

    const getMathInvChiCuadrado = () => {
        if (!condicion || !condicion.tipo) {
            return "P(\\chi^2 \\le c) = p";
        }
        const tipo = condicion.tipo;
        if (tipo === 'inversa_menor') {
            return "P(\\chi^2 \\le c) = p";
        }
        if (tipo === 'inversa_mayor') {
            return "P(\\chi^2 \\ge c) = p";
        }
        if (tipo === 'inversa_entre') {
            return "P(c_1 \\le \\chi^2 \\le c_2) = p";
        }
        if (tipo === 'inversa_exterior') {
            return "P(c_1 > \\chi^2 > c_2) = p";
        }
        return "P(\\chi^2 \\le c) = p";
    };

    const getMathInvUniforme = () => {
        if (!condicion || !condicion.tipo) {
            return "c = a + p(b - a)";
        }
        const tipo = condicion.tipo;
        if (tipo === 'inversa_menor') {
            return "c = a + p(b - a)";
        }
        if (tipo === 'inversa_mayor') {
            return "c = b - p(b - a)";
        }
        if (tipo === 'inversa_entre') {
            return "c_1 = a + \\frac{1 - p}{2}(b - a), \\quad c_2 = b - \\frac{1 - p}{2}(b - a)";
        }
        if (tipo === 'inversa_exterior') {
            return "c_1 = a + \\frac{p}{2}(b - a), \\quad c_2 = b - \\frac{p}{2}(b - a)";
        }
        return "c = a + p(b - a)";
    };

    const getMathProbFFisher = () => {
        if (!condicion || !condicion.tipo) {
            return "P(F \\le x)";
        }
        const tipo = condicion.tipo;
        if (tipo === 'menor' || tipo === 'menor_igual' || tipo === 'menor_estricto') {
            return "P(F \\le x)";
        }
        if (tipo === 'mayor' || tipo === 'mayor_igual' || tipo === 'mayor_estricto') {
            return "P(F \\ge x) = 1 - P(F \\le x)";
        }
        if (tipo === 'entre' || tipo === 'intervalo' || tipo === 'intervalo_estricto') {
            return "P(a \\le F \\le b) = P(F \\le b) - P(F \\le a)";
        }
        if (tipo === 'exterior') {
            return "P(F \\le a) + P(F \\ge b) = P(F \\le a) + [1 - P(F \\le b)]";
        }
        if (tipo === 'suma_intervalos') {
            return "\\sum [P(F \\le b_i) - P(F \\le a_i)]";
        }
        return "P(F \\le x)";
    };

    const getMathInvFFisher = () => {
        if (!condicion || !condicion.tipo) {
            return "P(F \\le c) = p";
        }
        const tipo = condicion.tipo;
        if (tipo === 'inversa_menor') {
            return "P(F \\le c) = p";
        }
        if (tipo === 'inversa_mayor') {
            return "P(F \\ge c) = p";
        }
        if (tipo === 'inversa_entre') {
            return "P(c_1 \\le F \\le c_2) = p";
        }
        if (tipo === 'inversa_exterior') {
            return "P(c_1 > F > c_2) = p";
        }
        return "P(F \\le c) = p";
    };

    const getMathProbTStudent = () => {
        if (!condicion || !condicion.tipo) {
            return "P(T \\le t)";
        }
        const tipo = condicion.tipo;
        if (tipo === 'menor' || tipo === 'menor_igual' || tipo === 'menor_estricto') {
            return "P(T \\le t)";
        }
        if (tipo === 'mayor' || tipo === 'mayor_igual' || tipo === 'mayor_estricto') {
            return "P(T \\ge t) = 1 - P(T \\le t)";
        }
        if (tipo === 'entre' || tipo === 'intervalo' || tipo === 'intervalo_estricto') {
            return "P(a \\le T \\le b) = P(T \\le b) - P(T \\le a)";
        }
        if (tipo === 'exterior') {
            return "P(T \\le a) + P(T \\ge b) = P(T \\le a) + [1 - P(T \\le b)]";
        }
        if (tipo === 'suma_intervalos') {
            return "\\sum [P(T \\le b_i) - P(T \\le a_i)]";
        }
        return "P(T \\le t)";
    };

    const getMathInvTStudent = () => {
        if (!condicion || !condicion.tipo) {
            return "P(T \\le c) = p";
        }
        const tipo = condicion.tipo;
        if (tipo === 'inversa_menor') {
            return "P(T \\le c) = p";
        }
        if (tipo === 'inversa_mayor') {
            return "P(T \\ge c) = p";
        }
        if (tipo === 'inversa_entre') {
            return "P(c_1 \\le T \\le c_2) = p";
        }
        if (tipo === 'inversa_exterior') {
            return "P(c_1 > T > c_2) = p";
        }
        return "P(T \\le c) = p";
    };

    // Genera la resolución para Uniforme usando ambiente aligned de LaTeX
    const renderResolucionUniforme = () => {
        if (!condicion || !params || !condicion.tipo) return null;
        const { a, b } = params;
        const tipo = condicion.tipo;
        const diffBA = b - a;

        const fmtVal = (val) => {
            const num = parseFloat(val);
            if (isNaN(num)) return '-';
            return Number.isInteger(num) ? num.toString() : parseFloat(num.toFixed(4)).toString();
        };

        const diffBAStr = fmtVal(diffBA);
        const aStr = fmtVal(a);
        const bStr = fmtVal(b);

        let alignedStr = '';

        if (tipo === 'menor' || tipo === 'menor_igual' || tipo === 'menor_estricto') {
            const x = parseFloat(condicion.valX);
            const xStr = fmtVal(x);
            if (x <= a) {
                alignedStr = `\\begin{aligned}
                                P(X \\le ${xStr}) &= 0 \\quad (\\text{ya que } ${xStr} \\le a = ${aStr})
                              \\end{aligned}`;
            } else if (x >= b) {
                alignedStr = `\\begin{aligned}
                                P(X \\le ${xStr}) &= 1 \\quad (\\text{ya que } ${xStr} \\ge b = ${bStr})
                              \\end{aligned}`;
            } else {
                const numDiff = x - a;
                const numDiffStr = fmtVal(numDiff);
                const prob = typeof resultados.probabilidadFinal === 'number' ? resultados.probabilidadFinal.toFixed(4) : (numDiff / diffBA).toFixed(4);
                alignedStr = `\\begin{aligned}
                                P(X \\le ${xStr}) &= \\frac{x - a}{b - a} = \\frac{${xStr} - ${aStr}}{${bStr} - ${aStr}} \\\\
                                &= \\frac{${numDiffStr}}{${diffBAStr}} = ${prob}
                              \\end{aligned}`;
            }
        } else if (tipo === 'mayor' || tipo === 'mayor_igual' || tipo === 'mayor_estricto') {
            const x = parseFloat(condicion.valX);
            const xStr = fmtVal(x);
            if (x <= a) {
                alignedStr = `\\begin{aligned}
                                P(X \\ge ${xStr}) &= 1 \\quad (\\text{ya que } ${xStr} \\le a = ${aStr})
                              \\end{aligned}`;
            } else if (x >= b) {
                alignedStr = `\\begin{aligned}
                                P(X \\ge ${xStr}) &= 0 \\quad (\\text{ya que } ${xStr} \\ge b = ${bStr})
                              \\end{aligned}`;
            } else {
                const numDiff = b - x;
                const numDiffStr = fmtVal(numDiff);
                const prob = typeof resultados.probabilidadFinal === 'number' ? resultados.probabilidadFinal.toFixed(4) : (numDiff / diffBA).toFixed(4);
                alignedStr = `\\begin{aligned}
                                P(X \\ge ${xStr}) &= \\frac{b - x}{b - a} = \\frac{${bStr} - ${xStr}}{${bStr} - ${aStr}} \\\\
                                &= \\frac{${numDiffStr}}{${diffBAStr}} = ${prob}
                              \\end{aligned}`;
            }
        } else if (tipo === 'entre' || tipo === 'intervalo' || tipo === 'intervalo_estricto') {
            const x1 = parseFloat(condicion.valX);
            const x2 = parseFloat(condicion.valX2);
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            const minXStr = fmtVal(minX);
            const maxXStr = fmtVal(maxX);

            const c = Math.max(a, minX);
            const d = Math.min(b, maxX);

            if (c >= d) {
                alignedStr = `\\begin{aligned}
                                P(${minXStr} \\le X \\le ${maxXStr}) &= 0 \\quad (\\text{fuera del soporte } [${aStr}, ${bStr}])
                              \\end{aligned}`;
            } else {
                const numDiff = d - c;
                const numDiffStr = fmtVal(numDiff);
                const prob = typeof resultados.probabilidadFinal === 'number' ? resultados.probabilidadFinal.toFixed(4) : (numDiff / diffBA).toFixed(4);
                if (minX >= a && maxX <= b) {
                    alignedStr = `\\begin{aligned}
                                    P(${minXStr} \\le X \\le ${maxXStr}) &= \\frac{x_2 - x_1}{b - a} = \\frac{${maxXStr} - ${minXStr}}{${bStr} - ${aStr}} \\\\
                                    &= \\frac{${numDiffStr}}{${diffBAStr}} = ${prob}
                                  \\end{aligned}`;
                } else {
                    const cStr = fmtVal(c);
                    const dStr = fmtVal(d);
                    alignedStr = `\\begin{aligned}
                                    P(${minXStr} \\le X \\le ${maxXStr}) &= P(${cStr} \\le X \\le ${dStr}) = \\frac{${dStr} - ${cStr}}{${bStr} - ${aStr}} \\\\
                                    &= \\frac{${numDiffStr}}{${diffBAStr}} = ${prob}
                                  \\end{aligned}`;
                }
            }
        } else if (tipo === 'exterior') {
            const x1 = parseFloat(condicion.valX);
            const x2 = parseFloat(condicion.valX2);
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            const minXStr = fmtVal(minX);
            const maxXStr = fmtVal(maxX);
            const c = Math.max(a, minX);
            const d = Math.min(b, maxX);
            const numDiff = Math.max(0, d - c);
            const probInside = numDiff / diffBA;
            const prob = typeof resultados.probabilidadFinal === 'number' ? resultados.probabilidadFinal.toFixed(4) : (1 - probInside).toFixed(4);

            alignedStr = `\\begin{aligned}
                            P(${minXStr} > X > ${maxXStr}) &= 1 - P(${minXStr} \\le X \\le ${maxXStr}) \\\\
                            &= 1 - \\frac{${fmtVal(numDiff)}}{${diffBAStr}} = ${prob}
                          \\end{aligned}`;
        } else if (tipo === 'suma_intervalos' && Array.isArray(condicion.intervals)) {
            const sumLabels = condicion.intervals.map(inv => `P(${fmtVal(inv.min)} \\le X \\le ${fmtVal(inv.max)})`).join(' + ');
            const sumVals = condicion.intervals.map(inv => {
                const minVal = parseFloat(inv.min);
                const maxVal = parseFloat(inv.max);
                const c = Math.max(a, Math.min(minVal, maxVal));
                const d = Math.min(b, Math.max(minVal, maxVal));
                const p = c >= d ? 0 : (d - c) / diffBA;
                return p.toFixed(4);
            }).join(' + ');
            const totalProb = typeof resultados.probabilidadFinal === 'number' ? resultados.probabilidadFinal.toFixed(4) : '0.0000';
            alignedStr = `\\begin{aligned}
                            \\text{Suma} &= ${sumLabels} \\\\
                            &= ${sumVals} = ${totalProb}
                          \\end{aligned}`;
        } else if (tipo === 'inversa_menor') {
            const p = parseFloat(condicion.valP);
            const pStr = fmtVal(p);
            const cStr = formatNum(resultados.c);
            alignedStr = `\\begin{aligned}
                            P(X \\le c) &= ${pStr} \\implies \\frac{c - a}{b - a} = ${pStr} \\\\
                            c &= a + p(b - a) = ${aStr} + (${pStr})(${diffBAStr}) = ${cStr}
                          \\end{aligned}`;
        } else if (tipo === 'inversa_mayor') {
            const p = parseFloat(condicion.valP);
            const pStr = fmtVal(p);
            const cStr = formatNum(resultados.c);
            alignedStr = `\\begin{aligned}
                            P(X \\ge c) &= ${pStr} \\implies \\frac{b - c}{b - a} = ${pStr} \\\\
                            c &= b - p(b - a) = ${bStr} - (${pStr})(${diffBAStr}) = ${cStr}
                          \\end{aligned}`;
        } else if (tipo === 'inversa_entre') {
            const p = parseFloat(condicion.valP);
            const pStr = fmtVal(p);
            const alpha = (1 - p) / 2;
            const alphaStr = fmtVal(alpha);
            const c1Str = formatNum(resultados.c1);
            const c2Str = formatNum(resultados.c2);
            alignedStr = `\\begin{aligned}
                            P(c_1 \\le X \\le c_2) &= ${pStr} \\quad \\left(\\text{cola } \\alpha = \\tfrac{1 - ${pStr}}{2} = ${alphaStr}\\right) \\\\
                            c_1 &= a + \\alpha(b - a) = ${aStr} + (${alphaStr})(${diffBAStr}) = ${c1Str} \\\\
                            c_2 &= b - \\alpha(b - a) = ${bStr} - (${alphaStr})(${diffBAStr}) = ${c2Str}
                          \\end{aligned}`;
        } else if (tipo === 'inversa_exterior') {
            const p = parseFloat(condicion.valP);
            const pStr = fmtVal(p);
            const alpha = p / 2;
            const alphaStr = fmtVal(alpha);
            const c1Str = formatNum(resultados.c1);
            const c2Str = formatNum(resultados.c2);
            alignedStr = `\\begin{aligned}
                            P(c_1 > X > c_2) &= ${pStr} \\quad \\left(\\text{cola } \\alpha = \\tfrac{${pStr}}{2} = ${alphaStr}\\right) \\\\
                            c_1 &= a + \\alpha(b - a) = ${aStr} + (${alphaStr})(${diffBAStr}) = ${c1Str} \\\\
                            c_2 &= b - \\alpha(b - a) = ${bStr} - (${alphaStr})(${diffBAStr}) = ${c2Str}
                          \\end{aligned}`;
        }

        if (!alignedStr) return null;

        return (
            <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', color: 'var(--text-pure)' }}>
                <div className="t3-formula-inner">
                    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(alignedStr, { throwOnError: false, displayMode: false }) }} />
                </div>
            </div>
        );
    };

    // Genera la resolución para Normal con tooltip interactivo en Z
    const renderResolucionNormal = () => {
        if (!condicion || !params || !condicion.tipo) return null;
        const { mu, sigma } = params;
        const tipo = condicion.tipo;

        const Z = (x) => ((x - mu) / sigma).toFixed(2);
        const Phi = (z) => jStat.normal.cdf(z, 0, 1);

        if (tipo === 'menor_igual' || tipo === 'menor') {
            const x = condicion.valX;
            const z = Z(x);
            const prob = Phi(parseFloat(z));
            return (
                <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', overflow: 'visible', color: 'var(--text-pure)' }}>
                    <div className="t3-formula-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`P(X \\le ${x}) = P\\Bigl(`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;\\le \\tfrac{${x} - ${mu}}{${sigma}}\\Bigr)`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`= P(`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;\\le ${z}) = ${prob.toFixed(4)}`)}
                        </div>
                        <button
                            type="button"
                            onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z), detalleCalculo: `z = \\frac{${x} - ${mu}}{${sigma}} = ${z}` })}
                            className="btn-abrir-tabla-z"
                            title="Abrir la tabla Z interactiva para ver cómo se localiza este valor"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                            <span>Ver lectura en Tabla Z (z = {z})</span>
                        </button>
                    </div>
                </div>
            );
        } else if (tipo === 'mayor_igual' || tipo === 'mayor') {
            const x = condicion.valX;
            const z = Z(x);
            const probMenor = Phi(parseFloat(z));
            const prob = (1 - probMenor);
            return (
                <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', overflow: 'visible', color: 'var(--text-pure)' }}>
                    <div className="t3-formula-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`P(X > ${x}) = P\\Bigl(`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;> \\tfrac{${x} - ${mu}}{${sigma}}\\Bigr) = P(`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;> ${z})`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`= 1 - P(`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;\\le ${z})`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`= 1 - ${probMenor.toFixed(4)} = ${prob.toFixed(4)}`)}
                        </div>
                        <button
                            type="button"
                            onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z), detalleCalculo: `z = \\frac{${x} - ${mu}}{${sigma}} = ${z}` })}
                            className="btn-abrir-tabla-z"
                            title="Abrir la tabla Z interactiva para ver cómo se localiza este valor"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                            <span>Ver lectura en Tabla Z (z = {z})</span>
                        </button>
                    </div>
                </div>
            );
        } else if (tipo === 'entre' || tipo === 'intervalo') {
            const x1 = condicion.valX;
            const x2 = condicion.valX2;
            const z1 = Z(x1);
            const z2 = Z(x2);
            const v1 = Phi(parseFloat(z1));
            const v2 = Phi(parseFloat(z2));
            const prob = v2 - v1;
            return (
                <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', overflow: 'visible', color: 'var(--text-pure)' }}>
                    <div className="t3-formula-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`P(${x1} \\le X \\le ${x2}) = P\\Bigl(\\tfrac{${x1} - ${mu}}{${sigma}} \\le\\;`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;\\le \\tfrac{${x2} - ${mu}}{${sigma}}\\Bigr)`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`= P(${z1} \\le\\;`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;\\le ${z2})`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`= P(`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;\\le ${z2}) - P(`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;\\le ${z1})`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`= ${v2.toFixed(4)} - ${v1.toFixed(4)} = ${prob.toFixed(4)}`)}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                            <button
                                type="button"
                                onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z1), detalleCalculo: `z_1 = \\frac{${x1} - ${mu}}{${sigma}} = ${z1}` })}
                                className="btn-abrir-tabla-z"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                <span>Ver z₁ = {z1} en Tabla</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z2), detalleCalculo: `z_2 = \\frac{${x2} - ${mu}}{${sigma}} = ${z2}` })}
                                className="btn-abrir-tabla-z"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                <span>Ver z₂ = {z2} en Tabla</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else if (tipo === 'exterior') {
            const x1 = condicion.valX;
            const x2 = condicion.valX2;
            const z1 = Z(x1);
            const z2 = Z(x2);
            const v1 = Phi(parseFloat(z1));
            const v2 = Phi(parseFloat(z2));
            const probEntre = v2 - v1;
            const prob = 1 - probEntre;
            return (
                <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', overflow: 'visible', color: 'var(--text-pure)' }}>
                    <div className="t3-formula-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`P(${x1} > X > ${x2}) = P\\Bigl(\\tfrac{${x1} - ${mu}}{${sigma}} >\\;`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;> \\tfrac{${x2} - ${mu}}{${sigma}}\\Bigr)`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`= P(${z1} >\\;`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;> ${z2})`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`= 1 - [P(`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;\\le ${z2}) - P(`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;\\le ${z1})]`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`= 1 - [${v2.toFixed(4)} - ${v1.toFixed(4)}] = ${prob.toFixed(4)}`)}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                            <button
                                type="button"
                                onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z1), detalleCalculo: `z_1 = \\frac{${x1} - ${mu}}{${sigma}} = ${z1}` })}
                                className="btn-abrir-tabla-z"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                <span>Ver z₁ = {z1} en Tabla</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z2), detalleCalculo: `z_2 = \\frac{${x2} - ${mu}}{${sigma}} = ${z2}` })}
                                className="btn-abrir-tabla-z"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                <span>Ver z₂ = {z2} en Tabla</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else if (tipo === 'suma_intervalos' && Array.isArray(condicion.intervals)) {
            const tipElements = condicion.intervals.map((inv, idx) => (
                <span key={idx} style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {idx > 0 && <span style={{ margin: '0 6px' }}>;</span>}
                    {renderLatex(`\\tfrac{${inv.min}-${mu}}{${sigma}}=`)}
                    <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                    {renderLatex(`_{${idx + 1}}=${Z(inv.min)}`)}
                </span>
            ));
            const sumLabels = condicion.intervals.map(inv =>
                `P(${Z(inv.min)} \\le Z \\le ${Z(inv.max)})`
            ).join(' + ');
            const sumVals = condicion.intervals.map(inv => {
                const z1 = parseFloat(Z(inv.min));
                const z2 = parseFloat(Z(inv.max));
                return (Phi(z2) - Phi(z1)).toFixed(4);
            }).join(' + ');
            const totalProb = condicion.intervals.reduce((acc, inv) => {
                return acc + (Phi(parseFloat(Z(inv.max))) - Phi(parseFloat(Z(inv.min))));
            }, 0);
            const firstLabel = condicion.intervals.map(inv => `P(${inv.min} \\le X \\le ${inv.max})`).join(' + ');
            return (
                <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', overflow: 'visible', color: 'var(--text-pure)' }}>
                    <div className="t3-formula-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {renderLatex(`\\text{Tipificando: }\\;`)}
                            {tipElements}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`${firstLabel} = ${sumLabels}`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`= ${sumVals} = ${totalProb.toFixed(4)}`)}
                        </div>
                    </div>
                </div>
            );
        } else if (tipo === 'inversa_menor') {
            const p = condicion.valP;
            const z = jStat.normal.inv(p, 0, 1).toFixed(4);
            const c = (mu + parseFloat(z) * sigma).toFixed(4);
            return (
                <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', overflow: 'visible', color: 'var(--text-pure)' }}>
                    <div className="t3-formula-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            {renderLatex(`P(X \\le c) = ${p} \\Rightarrow`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\approx ${z}`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            {renderLatex(`c = \\mu +`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\cdot \\sigma = ${mu} + (${z})(${sigma}) = ${c}`)}
                        </div>
                        <button
                            type="button"
                            onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z), detalleCalculo: `P(Z \\le ${z}) = ${p}` })}
                            className="btn-abrir-tabla-z"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                            <span>Ver búsqueda en Tabla Z (p = {p} → z ≈ {z})</span>
                        </button>
                    </div>
                </div>
            );
        } else if (tipo === 'inversa_mayor') {
            const p = condicion.valP;
            const z = jStat.normal.inv(1 - p, 0, 1).toFixed(4);
            const c = (mu + parseFloat(z) * sigma).toFixed(4);
            return (
                <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', overflow: 'visible', color: 'var(--text-pure)' }}>
                    <div className="t3-formula-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            {renderLatex(`P(X > c) = ${p} \\Rightarrow P(X \\le c) = 1 - ${p} = ${(1 - p).toFixed(4)}`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\approx ${z}`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            {renderLatex(`c = \\mu +`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\cdot \\sigma = ${mu} + (${z})(${sigma}) = ${c}`)}
                        </div>
                        <button
                            type="button"
                            onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z), detalleCalculo: `P(Z \\le ${z}) = ${(1 - p).toFixed(4)}` })}
                            className="btn-abrir-tabla-z"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                            <span>Ver búsqueda en Tabla Z (p = {p} → z ≈ {z})</span>
                        </button>
                    </div>
                </div>
            );
        } else if (tipo === 'inversa_exterior') {
            const p = condicion.valP;
            const z1 = jStat.normal.inv(p / 2, 0, 1).toFixed(4);
            const z2 = jStat.normal.inv(1 - p / 2, 0, 1).toFixed(4);
            const c1 = (mu + parseFloat(z1) * sigma).toFixed(4);
            const c2 = (mu + parseFloat(z2) * sigma).toFixed(4);
            return (
                <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', overflow: 'visible', color: 'var(--text-pure)' }}>
                    <div className="t3-formula-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            {renderLatex(`P(c_1 > X > c_2) = ${p}`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <StatLabel formulaKey="Z_1" formulaLatex="Z_1" align="center" />
                            {renderLatex(`\\approx ${z1}`)},
                            <span style={{ marginLeft: '8px' }} />
                            <StatLabel formulaKey="Z_2" formulaLatex="Z_2" align="center" />
                            {renderLatex(`\\approx ${z2}`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            {renderLatex(`c_1 = ${mu} + (${z1})(${sigma}) = ${c1}`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            {renderLatex(`c_2 = ${mu} + (${z2})(${sigma}) = ${c2}`)}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                            <button
                                type="button"
                                onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z1), detalleCalculo: `z_1 \\approx ${z1}` })}
                                className="btn-abrir-tabla-z"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                <span>Ver z₁ ≈ {z1} en Tabla</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z2), detalleCalculo: `z_2 \\approx ${z2}` })}
                                className="btn-abrir-tabla-z"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                <span>Ver z₂ ≈ {z2} en Tabla</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else if (tipo === 'inversa_entre') {
            const p = condicion.valP;
            const z1 = jStat.normal.inv((1 - p) / 2, 0, 1).toFixed(4);
            const z2 = jStat.normal.inv(1 - (1 - p) / 2, 0, 1).toFixed(4);
            const c1 = (mu + parseFloat(z1) * sigma).toFixed(4);
            const c2 = (mu + parseFloat(z2) * sigma).toFixed(4);
            return (
                <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', overflow: 'visible', color: 'var(--text-pure)' }}>
                    <div className="t3-formula-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            {renderLatex(`P(c_1 \\le X \\le c_2) = ${p}`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <StatLabel formulaKey="Z_1" formulaLatex="Z_1" align="center" />
                            {renderLatex(`\\approx ${z1}`)},
                            <span style={{ marginLeft: '8px' }} />
                            <StatLabel formulaKey="Z_2" formulaLatex="Z_2" align="center" />
                            {renderLatex(`\\approx ${z2}`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            {renderLatex(`c_1 = ${mu} + (${z1})(${sigma}) = ${c1}`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            {renderLatex(`c_2 = ${mu} + (${z2})(${sigma}) = ${c2}`)}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                            <button
                                type="button"
                                onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z1), detalleCalculo: `z_1 \\approx ${z1}` })}
                                className="btn-abrir-tabla-z"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                <span>Ver z₁ ≈ {z1} en Tabla</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z2), detalleCalculo: `z_2 \\approx ${z2}` })}
                                className="btn-abrir-tabla-z"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                <span>Ver z₂ ≈ {z2} en Tabla</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    const renderResolucionNormalEstandar = () => {
        const tipo = condicion.tipo;
        const Phi = (z) => jStat.normal.cdf(z, 0, 1);

        if (tipo === 'menor_igual' || tipo === 'menor') {
            const z = parseFloat(condicion.valX).toFixed(2);
            return (
                <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', overflow: 'visible', color: 'var(--text-pure)' }}>
                    <div className="t3-formula-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`P(`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;\\le ${z}) = ${Phi(parseFloat(z)).toFixed(4)}`)}
                        </div>
                        <button
                            type="button"
                            onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z), detalleCalculo: `z = ${z}` })}
                            className="btn-abrir-tabla-z"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                            <span>Ver lectura en Tabla Z (z = {z})</span>
                        </button>
                    </div>
                </div>
            );
        } else if (tipo === 'mayor_igual' || tipo === 'mayor') {
            const z = parseFloat(condicion.valX).toFixed(2);
            const p = Phi(parseFloat(z));
            return (
                <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', overflow: 'visible', color: 'var(--text-pure)' }}>
                    <div className="t3-formula-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`P(`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;> ${z}) = 1 - P(`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;\\le ${z})`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`= 1 - ${p.toFixed(4)} = ${(1 - p).toFixed(4)}`)}
                        </div>
                        <button
                            type="button"
                            onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z), detalleCalculo: `z = ${z}` })}
                            className="btn-abrir-tabla-z"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                            <span>Ver lectura en Tabla Z (z = {z})</span>
                        </button>
                    </div>
                </div>
            );
        } else if (tipo === 'entre' || tipo === 'intervalo') {
            const z1 = parseFloat(condicion.valX).toFixed(2);
            const z2 = parseFloat(condicion.valX2).toFixed(2);
            const v1 = Phi(parseFloat(z1));
            const v2 = Phi(parseFloat(z2));
            return (
                <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', overflow: 'visible', color: 'var(--text-pure)' }}>
                    <div className="t3-formula-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`P(${z1} \\le\\;`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;\\le ${z2}) = P(`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;\\le ${z2}) - P(`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;\\le ${z1})`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`= ${v2.toFixed(4)} - ${v1.toFixed(4)} = ${(v2 - v1).toFixed(4)}`)}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                            <button
                                type="button"
                                onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z1), detalleCalculo: `z_1 = ${z1}` })}
                                className="btn-abrir-tabla-z"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                <span>Ver z₁ = {z1} en Tabla</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z2), detalleCalculo: `z_2 = ${z2}` })}
                                className="btn-abrir-tabla-z"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                <span>Ver z₂ = {z2} en Tabla</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else if (tipo === 'exterior') {
            const z1 = parseFloat(condicion.valX).toFixed(2);
            const z2 = parseFloat(condicion.valX2).toFixed(2);
            const v1 = Phi(parseFloat(z1));
            const v2 = Phi(parseFloat(z2));
            return (
                <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', overflow: 'visible', color: 'var(--text-pure)' }}>
                    <div className="t3-formula-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`P(${z1} >\\;`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;> ${z2}) = 1 - [P(`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;\\le ${z2}) - P(`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;\\le ${z1})]`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`= 1 - [${v2.toFixed(4)} - ${v1.toFixed(4)}] = ${(1 - (v2 - v1)).toFixed(4)}`)}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                            <button
                                type="button"
                                onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z1), detalleCalculo: `z_1 = ${z1}` })}
                                className="btn-abrir-tabla-z"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                <span>Ver z₁ = {z1} en Tabla</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z2), detalleCalculo: `z_2 = ${z2}` })}
                                className="btn-abrir-tabla-z"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                <span>Ver z₂ = {z2} en Tabla</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else if (tipo === 'suma_intervalos' && Array.isArray(condicion.intervals)) {
            const sumLabels = condicion.intervals.map(inv => `P(${parseFloat(inv.min).toFixed(2)} \\le Z \\le ${parseFloat(inv.max).toFixed(2)})`).join(' + ');
            const sumVals = condicion.intervals.map(inv => (Phi(parseFloat(inv.max)) - Phi(parseFloat(inv.min))).toFixed(4)).join(' + ');
            const totalProb = condicion.intervals.reduce((acc, inv) => acc + (Phi(parseFloat(inv.max)) - Phi(parseFloat(inv.min))), 0);
            return (
                <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', overflow: 'visible', color: 'var(--text-pure)' }}>
                    <div className="t3-formula-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`\\text{Suma} = ${sumLabels}`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`= ${sumVals} = ${totalProb.toFixed(4)}`)}
                        </div>
                    </div>
                </div>
            );
        } else if (tipo === 'inversa_menor') {
            const p = condicion.valP;
            const zVal = jStat.normal.inv(p, 0, 1).toFixed(4);
            return (
                <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', overflow: 'visible', color: 'var(--text-pure)' }}>
                    <div className="t3-formula-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`P(`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;\\le z) = ${p} \\Rightarrow`)}
                            <span style={{ marginLeft: '6px' }} />
                            <StatLabel formulaKey="z" formulaLatex="z" align="center" />
                            {renderLatex(`\\;\\approx ${zVal}`)}
                        </div>
                        <button
                            type="button"
                            onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(zVal), detalleCalculo: `p = ${p}` })}
                            className="btn-abrir-tabla-z"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                            <span>Ver búsqueda en Tabla Z (p = {p} → z ≈ {zVal})</span>
                        </button>
                    </div>
                </div>
            );
        } else if (tipo === 'inversa_mayor') {
            const p = condicion.valP;
            const zVal = jStat.normal.inv(1 - p, 0, 1).toFixed(4);
            return (
                <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', overflow: 'visible', color: 'var(--text-pure)' }}>
                    <div className="t3-formula-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`P(`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;> z) = ${p} \\Rightarrow P(`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;\\le z) = ${(1 - p).toFixed(4)}`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <StatLabel formulaKey="z" formulaLatex="z" align="center" />
                            {renderLatex(`\\;\\approx ${zVal}`)}
                        </div>
                        <button
                            type="button"
                            onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(zVal), detalleCalculo: `P(Z \\le z) = ${(1 - p).toFixed(4)}` })}
                            className="btn-abrir-tabla-z"
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                            <span>Ver búsqueda en Tabla Z (z ≈ {zVal})</span>
                        </button>
                    </div>
                </div>
            );
        } else if (tipo === 'inversa_exterior') {
            const p = condicion.valP;
            const z1Val = jStat.normal.inv(p / 2, 0, 1).toFixed(4);
            const z2Val = jStat.normal.inv(1 - p / 2, 0, 1).toFixed(4);
            return (
                <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', overflow: 'visible', color: 'var(--text-pure)' }}>
                    <div className="t3-formula-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`P(z_1 >\\;`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;> z_2) = ${p}`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <StatLabel formulaKey="z" formulaLatex="z_1" align="center" />
                            {renderLatex(`\\;\\approx ${z1Val}`)}
                            <span style={{ margin: '0 8px' }}>,</span>
                            <StatLabel formulaKey="z" formulaLatex="z_2" align="center" />
                            {renderLatex(`\\;\\approx ${z2Val}`)}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                            <button
                                type="button"
                                onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z1Val), detalleCalculo: `z_1 \\approx ${z1Val}` })}
                                className="btn-abrir-tabla-z"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                <span>Ver z₁ ≈ {z1Val} en Tabla</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z2Val), detalleCalculo: `z_2 \\approx ${z2Val}` })}
                                className="btn-abrir-tabla-z"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                <span>Ver z₂ ≈ {z2Val} en Tabla</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        } else if (tipo === 'inversa_entre') {
            const p = condicion.valP;
            const z1Val = jStat.normal.inv((1 - p) / 2, 0, 1).toFixed(4);
            const z2Val = jStat.normal.inv(1 - (1 - p) / 2, 0, 1).toFixed(4);
            return (
                <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', overflow: 'visible', color: 'var(--text-pure)' }}>
                    <div className="t3-formula-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {renderLatex(`P(z_1 \\le\\;`)}
                            <StatLabel formulaKey="Z" formulaLatex="Z" align="center" />
                            {renderLatex(`\\;\\le z_2) = ${p}`)}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <StatLabel formulaKey="z" formulaLatex="z_1" align="center" />
                            {renderLatex(`\\;\\approx ${z1Val}`)}
                            <span style={{ margin: '0 8px' }}>,</span>
                            <StatLabel formulaKey="z" formulaLatex="z_2" align="center" />
                            {renderLatex(`\\;\\approx ${z2Val}`)}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                            <button
                                type="button"
                                onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z1Val), detalleCalculo: `z_1 \\approx ${z1Val}` })}
                                className="btn-abrir-tabla-z"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                <span>Ver z₁ ≈ {z1Val} en Tabla</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalTablaZ({ isOpen: true, z: parseFloat(z2Val), detalleCalculo: `z_2 \\approx ${z2Val}` })}
                                className="btn-abrir-tabla-z"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                                <span>Ver z₂ ≈ {z2Val} en Tabla</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };

    const renderResolucionChiCuadrado = () => {
        const tipo = condicion.tipo;
        const k = params.k;
        const F = (x) => jStat.chisquare.cdf(x, k);
        let alignedStr = '';

        if (tipo === 'menor_igual' || tipo === 'menor') {
            const x = parseFloat(condicion.valX).toFixed(2);
            alignedStr = `\\begin{aligned} P(\\chi^2 \\le ${x}) = ${F(parseFloat(x)).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'mayor_igual' || tipo === 'mayor') {
            const x = parseFloat(condicion.valX).toFixed(2);
            const p = F(parseFloat(x));
            alignedStr = `\\begin{aligned} P(\\chi^2 > ${x}) &= 1 - P(\\chi^2 \\le ${x}) \\\\ &= 1 - ${p.toFixed(4)} = ${(1 - p).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'entre' || tipo === 'intervalo') {
            const x1 = parseFloat(condicion.valX).toFixed(2);
            const x2 = parseFloat(condicion.valX2).toFixed(2);
            const v1 = F(parseFloat(x1));
            const v2 = F(parseFloat(x2));
            alignedStr = `\\begin{aligned} P(${x1} \\le \\chi^2 \\le ${x2}) &= P(\\chi^2 \\le ${x2}) - P(\\chi^2 \\le ${x1}) \\\\ &= ${v2.toFixed(4)} - ${v1.toFixed(4)} = ${(v2 - v1).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'exterior') {
            const x1 = parseFloat(condicion.valX).toFixed(2);
            const x2 = parseFloat(condicion.valX2).toFixed(2);
            const v1 = F(parseFloat(x1));
            const v2 = F(parseFloat(x2));
            alignedStr = `\\begin{aligned} P(${x1} > \\chi^2 > ${x2}) &= 1 - P(${x1} \\le \\chi^2 \\le ${x2}) \\\\ &= 1 - [${v2.toFixed(4)} - ${v1.toFixed(4)}] = ${(1 - (v2 - v1)).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'suma_intervalos' && Array.isArray(condicion.intervals)) {
            const sumLabels = condicion.intervals.map(inv => `P(${parseFloat(inv.min).toFixed(2)} \\le \\chi^2 \\le ${parseFloat(inv.max).toFixed(2)})`).join(' + ');
            const sumVals = condicion.intervals.map(inv => (F(parseFloat(inv.max)) - F(parseFloat(inv.min))).toFixed(4)).join(' + ');
            const totalProb = condicion.intervals.reduce((acc, inv) => acc + (F(parseFloat(inv.max)) - F(parseFloat(inv.min))), 0);
            alignedStr = `\\begin{aligned} \\text{Suma} &= ${sumLabels} \\\\ &= ${sumVals} = ${totalProb.toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'inversa_menor') {
            const p = condicion.valP;
            alignedStr = `\\begin{aligned} P(\\chi^2 \\le c) &= ${p} \\Rightarrow c \\approx ${jStat.chisquare.inv(p, k).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'inversa_mayor') {
            const p = condicion.valP;
            alignedStr = `\\begin{aligned} P(\\chi^2 > c) &= ${p} \\Rightarrow P(\\chi^2 \\le c) = ${(1 - p).toFixed(4)} \\\\ c &\\approx ${jStat.chisquare.inv(1 - p, k).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'inversa_exterior') {
            const p = condicion.valP;
            alignedStr = `\\begin{aligned} P(c_1 > \\chi^2 > c_2) &= ${p} \\\\ c_1 &\\approx ${jStat.chisquare.inv(p / 2, k).toFixed(4)} \\\\ c_2 &\\approx ${jStat.chisquare.inv(1 - p / 2, k).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'inversa_entre') {
            const p = condicion.valP;
            alignedStr = `\\begin{aligned} P(c_1 \\le \\chi^2 \\le c_2) &= ${p} \\\\ c_1 &\\approx ${jStat.chisquare.inv((1-p)/2, k).toFixed(4)} \\\\ c_2 &\\approx ${jStat.chisquare.inv(1 - (1-p)/2, k).toFixed(4)} \\end{aligned}`;
        }

        if (!alignedStr) return null;
        return (
            <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', color: 'var(--text-pure)' }}>
                <div className="t3-formula-inner">
                    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(alignedStr, { throwOnError: false, displayMode: false }) }} />
                </div>
            </div>
        );
    };

    const renderResolucionFFisher = () => {
        const tipo = condicion.tipo;
        const v1 = params.v1;
        const v2 = params.v2;
        const F_dist = (x) => jStat.centralF.cdf(x, v1, v2);
        let alignedStr = '';

        if (tipo === 'menor_igual' || tipo === 'menor') {
            const x = parseFloat(condicion.valX).toFixed(2);
            alignedStr = `\\begin{aligned} P(F \\le ${x}) = ${F_dist(parseFloat(x)).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'mayor_igual' || tipo === 'mayor') {
            const x = parseFloat(condicion.valX).toFixed(2);
            const p = F_dist(parseFloat(x));
            alignedStr = `\\begin{aligned} P(F > ${x}) &= 1 - P(F \\le ${x}) \\\\ &= 1 - ${p.toFixed(4)} = ${(1 - p).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'entre' || tipo === 'intervalo') {
            const x1 = parseFloat(condicion.valX).toFixed(2);
            const x2 = parseFloat(condicion.valX2).toFixed(2);
            const v_1 = F_dist(parseFloat(x1));
            const v_2 = F_dist(parseFloat(x2));
            alignedStr = `\\begin{aligned} P(${x1} \\le F \\le ${x2}) &= P(F \\le ${x2}) - P(F \\le ${x1}) \\\\ &= ${v_2.toFixed(4)} - ${v_1.toFixed(4)} = ${(v_2 - v_1).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'exterior') {
            const x1 = parseFloat(condicion.valX).toFixed(2);
            const x2 = parseFloat(condicion.valX2).toFixed(2);
            const v_1 = F_dist(parseFloat(x1));
            const v_2 = F_dist(parseFloat(x2));
            alignedStr = `\\begin{aligned} P(${x1} > F > ${x2}) &= 1 - P(${x1} \\le F \\le ${x2}) \\\\ &= 1 - [${v_2.toFixed(4)} - ${v_1.toFixed(4)}] = ${(1 - (v_2 - v_1)).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'suma_intervalos' && Array.isArray(condicion.intervals)) {
            const sumLabels = condicion.intervals.map(inv => `P(${parseFloat(inv.min).toFixed(2)} \\le F \\le ${parseFloat(inv.max).toFixed(2)})`).join(' + ');
            const sumVals = condicion.intervals.map(inv => (F_dist(parseFloat(inv.max)) - F_dist(parseFloat(inv.min))).toFixed(4)).join(' + ');
            const totalProb = condicion.intervals.reduce((acc, inv) => acc + (F_dist(parseFloat(inv.max)) - F_dist(parseFloat(inv.min))), 0);
            alignedStr = `\\begin{aligned} \\text{Suma} &= ${sumLabels} \\\\ &= ${sumVals} = ${totalProb.toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'inversa_menor') {
            const p = condicion.valP;
            alignedStr = `\\begin{aligned} P(F \\le c) &= ${p} \\Rightarrow c \\approx ${jStat.centralF.inv(p, v1, v2).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'inversa_mayor') {
            const p = condicion.valP;
            alignedStr = `\\begin{aligned} P(F > c) &= ${p} \\Rightarrow P(F \\le c) = ${(1 - p).toFixed(4)} \\\\ c &\\approx ${jStat.centralF.inv(1 - p, v1, v2).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'inversa_exterior') {
            const p = condicion.valP;
            alignedStr = `\\begin{aligned} P(c_1 > F > c_2) &= ${p} \\\\ c_1 &\\approx ${jStat.centralF.inv(p / 2, v1, v2).toFixed(4)} \\\\ c_2 &\\approx ${jStat.centralF.inv(1 - p / 2, v1, v2).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'inversa_entre') {
            const p = condicion.valP;
            alignedStr = `\\begin{aligned} P(c_1 \\le F \\le c_2) &= ${p} \\\\ c_1 &\\approx ${jStat.centralF.inv((1-p)/2, v1, v2).toFixed(4)} \\\\ c_2 &\\approx ${jStat.centralF.inv(1 - (1-p)/2, v1, v2).toFixed(4)} \\end{aligned}`;
        }

        if (!alignedStr) return null;
        return (
            <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', color: 'var(--text-pure)' }}>
                <div className="t3-formula-inner">
                    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(alignedStr, { throwOnError: false, displayMode: false }) }} />
                </div>
            </div>
        );
    };

    const renderResolucionTStudent = () => {
        const tipo = condicion.tipo;
        const n = params.n;
        const F_t = (x) => jStat.studentt.cdf(x, n);
        let alignedStr = '';

        if (tipo === 'menor_igual' || tipo === 'menor') {
            const x = parseFloat(condicion.valX).toFixed(2);
            alignedStr = `\\begin{aligned} P(T \\le ${x}) = ${F_t(parseFloat(x)).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'mayor_igual' || tipo === 'mayor') {
            const x = parseFloat(condicion.valX).toFixed(2);
            const p = F_t(parseFloat(x));
            alignedStr = `\\begin{aligned} P(T > ${x}) &= 1 - P(T \\le ${x}) \\\\ &= 1 - ${p.toFixed(4)} = ${(1 - p).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'entre' || tipo === 'intervalo') {
            const x1 = parseFloat(condicion.valX).toFixed(2);
            const x2 = parseFloat(condicion.valX2).toFixed(2);
            const v1 = F_t(parseFloat(x1));
            const v2 = F_t(parseFloat(x2));
            alignedStr = `\\begin{aligned} P(${x1} \\le T \\le ${x2}) &= P(T \\le ${x2}) - P(T \\le ${x1}) \\\\ &= ${v2.toFixed(4)} - ${v1.toFixed(4)} = ${(v2 - v1).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'exterior') {
            const x1 = parseFloat(condicion.valX).toFixed(2);
            const x2 = parseFloat(condicion.valX2).toFixed(2);
            const v1 = F_t(parseFloat(x1));
            const v2 = F_t(parseFloat(x2));
            alignedStr = `\\begin{aligned} P(${x1} > T > ${x2}) &= 1 - P(${x1} \\le T \\le ${x2}) \\\\ &= 1 - [${v2.toFixed(4)} - ${v1.toFixed(4)}] = ${(1 - (v2 - v1)).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'suma_intervalos' && Array.isArray(condicion.intervals)) {
            const sumLabels = condicion.intervals.map(inv => `P(${parseFloat(inv.min).toFixed(2)} \\le T \\le ${parseFloat(inv.max).toFixed(2)})`).join(' + ');
            const sumVals = condicion.intervals.map(inv => (F_t(parseFloat(inv.max)) - F_t(parseFloat(inv.min))).toFixed(4)).join(' + ');
            const totalProb = condicion.intervals.reduce((acc, inv) => acc + (F_t(parseFloat(inv.max)) - F_t(parseFloat(inv.min))), 0);
            alignedStr = `\\begin{aligned} \\text{Suma} &= ${sumLabels} \\\\ &= ${sumVals} = ${totalProb.toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'inversa_menor') {
            const p = condicion.valP;
            alignedStr = `\\begin{aligned} P(T \\le c) &= ${p} \\Rightarrow c \\approx ${jStat.studentt.inv(p, n).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'inversa_mayor') {
            const p = condicion.valP;
            alignedStr = `\\begin{aligned} P(T > c) &= ${p} \\Rightarrow P(T \\le c) = ${(1 - p).toFixed(4)} \\\\ c &\\approx ${jStat.studentt.inv(1 - p, n).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'inversa_exterior') {
            const p = condicion.valP;
            alignedStr = `\\begin{aligned} P(c_1 > T > c_2) &= ${p} \\\\ c_1 &\\approx ${jStat.studentt.inv(p / 2, n).toFixed(4)} \\\\ c_2 &\\approx ${jStat.studentt.inv(1 - p / 2, n).toFixed(4)} \\end{aligned}`;
        } else if (tipo === 'inversa_entre') {
            const p = condicion.valP;
            alignedStr = `\\begin{aligned} P(c_1 \\le T \\le c_2) &= ${p} \\\\ c_1 &\\approx ${jStat.studentt.inv((1-p)/2, n).toFixed(4)} \\\\ c_2 &\\approx ${jStat.studentt.inv(1 - (1-p)/2, n).toFixed(4)} \\end{aligned}`;
        }

        if (!alignedStr) return null;
        return (
            <div className="t3-formula-scroll" style={{ marginTop: '6px', fontSize: '0.95rem', color: 'var(--text-pure)' }}>
                <div className="t3-formula-inner">
                    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(alignedStr, { throwOnError: false, displayMode: false }) }} />
                </div>
            </div>
        );
    };

    let formulasEsperanza = [];
    let formulasVarianza = [];
    let formulasDesviacion = [];

    if (params) {
        if (modelo === 'uniforme' || modelo === 'Uniforme') {
            formulasEsperanza = [
                `E(X) = \\frac{a + b}{2}`,
                `E(X) = \\frac{${params.a} + ${params.b}}{2}`
            ];
            formulasVarianza = [
                `V(X) = \\frac{(b - a)^2}{12}`,
                `V(X) = \\frac{(${params.b} - ${params.a})^2}{12}`
            ];
            formulasDesviacion = [
                `\\sigma = \\sqrt{V(X)}`,
                `\\sigma = \\sqrt{${((params.b - params.a) ** 2 / 12).toFixed(2)}}`
            ];
        } else if (modelo === 'Normal') {
            formulasEsperanza = [
                `E(X) = \\mu`,
                `E(X) = ${params.mu}`
            ];
            formulasVarianza = [
                `V(X) = \\sigma^2`,
                `V(X) = ${params.sigma}^2`
            ];
            formulasDesviacion = [
                `\\sigma = \\sqrt{V(X)}`,
                `\\sigma = \\sqrt{${(params.sigma ** 2).toFixed(2)}}`
            ];
        } else if (modelo === 'NormalEstandar') {
            formulasEsperanza = [`E(Z) = 0`];
            formulasVarianza = [`V(Z) = 1`];
            formulasDesviacion = [`\\sigma = 1`];
        } else if (modelo === 'ChiCuadrado') {
            formulasEsperanza = [
                `E(\\chi^2) = v`,
                `E(\\chi^2) = ${params.k}`
            ];
            formulasVarianza = [
                `V(\\chi^2) = 2v`,
                `V(\\chi^2) = 2(${params.k})`
            ];
            formulasDesviacion = [
                `\\sigma = \\sqrt{V(\\chi^2)}`,
                `\\sigma = \\sqrt{${(2 * params.k).toFixed(2)}}`
            ];
        } else if (modelo === 'FFisher') {
            if (params.v2 > 2) {
                formulasEsperanza = [
                    `E(F) = \\frac{v_2}{v_2 - 2}`,
                    `E(F) = \\frac{${params.v2}}{${params.v2} - 2}`
                ];
            } else {
                formulasEsperanza = [
                    `E(F) = \\frac{v_2}{v_2 - 2}, \\quad v_2 > 2`,
                    `\\text{No definido}`
                ];
            }
            if (params.v2 > 4) {
                formulasVarianza = [
                    `V(F) = \\frac{2v_2^2(v_1 + v_2 - 2)}{v_1(v_2 - 2)^2(v_2 - 4)}`,
                    `V(F) = \\frac{2(${params.v2})^2(${params.v1} + ${params.v2} - 2)}{${params.v1}(${params.v2} - 2)^2(${params.v2} - 4)}`
                ];
            } else {
                formulasVarianza = [
                    `V(F) = \\frac{2v_2^2(v_1 + v_2 - 2)}{v_1(v_2 - 2)^2(v_2 - 4)}, \\quad v_2 > 4`,
                    `\\text{No definido}`
                ];
            }
            formulasDesviacion = [
                `\\sigma = \\sqrt{V(F)}`,
                resultados.varianza !== undefined && typeof resultados.varianza === 'number' ? `\\sigma = \\sqrt{${(resultados.varianza).toFixed(2)}}` : `\\text{No definido}`
            ];
        } else if (modelo === 'TStudent') {
            const n = params.n;
            if (n > 1) {
                formulasEsperanza = [
                    `E(T) = 0, \\quad n > 1`,
                    `E(T) = 0`
                ];
            } else {
                formulasEsperanza = [
                    `E(T) = 0, \\quad n > 1`,
                    `\\text{No definido}`
                ];
            }
            if (n > 2) {
                formulasVarianza = [
                    `V(T) = \\frac{n}{n - 2}, \\quad n > 2`,
                    `V(T) = \\frac{${n}}{${n} - 2}`
                ];
            } else {
                formulasVarianza = [
                    `V(T) = \\frac{n}{n - 2}, \\quad n > 2`,
                    `\\text{No definido}`
                ];
            }
            formulasDesviacion = [
                `\\sigma = \\sqrt{V(T)}`,
                resultados.varianza !== undefined && typeof resultados.varianza === 'number' ? `\\sigma = \\sqrt{${(resultados.varianza).toFixed(4)}}` : `\\text{No definido}`
            ];
        }
    }

    const desvFinal = resultados.desviacion !== undefined 
        ? resultados.desviacion 
        : (typeof resultados.varianza === 'number' ? Math.sqrt(resultados.varianza) : undefined);

    return (
        <div className="tema3-card" style={{ marginTop: '20px' }}>
            {(resultados.probabilidadFinal !== null || resultados.c !== undefined || resultados.c1 !== undefined) && (
                <div
                    className="tarjeta-calculo-mat251"
                    style={{
                        background: 'var(--bg-card)',
                        padding: '12px 10px',
                        borderRadius: RADIUS,
                        border: '1px solid var(--border-color)',
                        marginBottom: '15px',
                        textAlign: 'center',
                        position: 'relative',
                        color: 'var(--text-pure)'
                    }}
                >
                    {/* 1) Título */}
                    <div className="tarjeta-calculo-titulo">
                        {resultados.c !== undefined || resultados.c1 !== undefined ? (
                            <>
                                Valor Calculado{' '}
                                <StatLabel
                                    formulaKey={modelo === 'NormalEstandar' ? 'inv_NormalEstandar' : `inv_${modelo}`}
                                    formulaLatex={
                                        modelo === 'NormalEstandar'
                                            ? (resultados.c1 !== undefined ? 'z_1, z_2' : 'z')
                                            : (resultados.c1 !== undefined ? 'c_1, c_2' : 'c')
                                    }
                                    customTexto={
                                        modelo === 'Uniforme'
                                            ? "Valor Inverso / Cuantil (Uniforme)"
                                            : (modelo === 'NormalEstandar' ? "Valor Inverso / Cuantil (Normal Estándar)" : (modelo === 'Normal' ? "Valor Inverso / Cuantil (Normal)" : (modelo === 'FFisher' ? "Valor Inverso / Cuantil (F de Fisher)" : (modelo === 'ChiCuadrado' ? "Valor Inverso (Chi-Cuadrado)" : (modelo === 'TStudent' ? "Valor Inverso (t-Student)" : undefined)))))
                                    }
                                    customMath={
                                        modelo === 'Uniforme'
                                            ? getMathInvUniforme()
                                            : (modelo === 'NormalEstandar' ? "z = \\Phi^{-1}(p)" : (modelo === 'Normal' ? "c = \\mu + Z \\cdot \\sigma" : (modelo === 'FFisher' ? getMathInvFFisher() : (modelo === 'ChiCuadrado' ? getMathInvChiCuadrado() : (modelo === 'TStudent' ? getMathInvTStudent() : undefined)))))
                                    }
                                    align="center"
                                />
                            </>
                        ) : (
                            <>Probabilidad Calculada <StatLabel formulaKey={`P_${modelo}`} formulaLatex={modelo === 'NormalEstandar' ? 'P(Z)' : (modelo === 'ChiCuadrado' ? 'P(\\chi^2)' : (modelo === 'FFisher' ? 'P(F)' : (modelo === 'TStudent' ? 'P(T)' : 'P(X)')))} customMath={modelo === 'Uniforme' ? getMathProbUniforme() : (modelo === 'ChiCuadrado' ? getMathProbChiCuadrado() : (modelo === 'FFisher' ? getMathProbFFisher() : (modelo === 'TStudent' ? getMathProbTStudent() : undefined)))} align="center" /></>
                        )}
                    </div>

                    {/* 2) Resolución en el medio */}
                    {modelo === 'Uniforme' && condicion && params && condicion.tipo && renderResolucionUniforme()}
                    {modelo === 'Normal' && condicion && params && condicion.tipo && renderResolucionNormal()}
                    {modelo === 'NormalEstandar' && condicion && params && condicion.tipo && renderResolucionNormalEstandar()}
                    {modelo === 'ChiCuadrado' && condicion && params && condicion.tipo && renderResolucionChiCuadrado()}
                    {modelo === 'FFisher' && condicion && params && condicion.tipo && renderResolucionFFisher()}
                    {modelo === 'TStudent' && condicion && params && condicion.tipo && renderResolucionTStudent()}

                    {/* 3) Valor / porcentaje al final */}
                    <div style={{ marginTop: (modelo === 'Uniforme' || modelo === 'Normal' || modelo === 'NormalEstandar' || modelo === 'ChiCuadrado' || modelo === 'FFisher' || modelo === 'TStudent') && condicion && params && condicion.tipo ? '5px' : '0' }}>
                        {resultados.c1 !== undefined && resultados.c2 !== undefined ? (
                            <div className="tarjeta-calculo-valor" style={{ gap: '20px' }}>
                                <div>
                                    {renderLatex(`c_1 = \\mathbf{${formatNum(resultados.c1)}}`)}
                                </div>
                                <div>
                                    {renderLatex(`c_2 = \\mathbf{${formatNum(resultados.c2)}}`)}
                                </div>
                            </div>
                        ) : resultados.c !== undefined ? (
                            <div className="tarjeta-calculo-valor">
                                {renderLatex(`c = \\mathbf{${formatNum(resultados.c)}}`)}
                            </div>
                        ) : (
                            <div className="tarjeta-calculo-valor">
                                {typeof resultados.probabilidadFinal === 'number' ? (
                                    renderLatex(`\\mathbf{${resultados.probabilidadFinal.toFixed(4)}} \\;\\rightarrow\\; \\mathbf{${(resultados.probabilidadFinal * 100).toFixed(2)}\\%}`)
                                ) : '-'}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="t3-stats-container">
                <div
                    className="tarjeta-calculo-mat251 t3-stats-card"
                    style={{
                        background: 'var(--bg-card)',
                        padding: '10px 8px',
                        borderRadius: RADIUS,
                        border: '1px solid var(--border-color)',
                        textAlign: 'center',
                        position: 'relative'
                    }}
                >
                    <div className="tarjeta-calculo-titulo">
                        Esperanza <StatLabel formulaKey={`E_${modelo}`} formulaLatex={modelo === 'NormalEstandar' ? 'E(Z)' : (modelo === 'TStudent' ? 'E(T)' : (modelo === 'FFisher' ? 'E(F)' : (modelo === 'ChiCuadrado' ? 'E(\\chi^2)' : 'E(X)')))} align="center" />
                    </div>
                    {formulasEsperanza.length > 1 && (
                        <div className="t3-formula-scroll" style={{ fontSize: '0.85rem', color: 'var(--text-pure)', margin: '10px 0 0', fontWeight: 'normal' }}>
                            <div className="t3-formula-inner">
                                {renderLatex(formulasEsperanza[1])}
                            </div>
                        </div>
                    )}
                    <div className="tarjeta-calculo-valor">
                        {typeof resultados.esperanza === 'number' && !isNaN(resultados.esperanza) ? (
                            renderLatex(`\\mathbf{${formatNum(resultados.esperanza)}}`)
                        ) : '-'}
                    </div>
                </div>

                <div
                    className="tarjeta-calculo-mat251 t3-stats-card"
                    style={{
                        background: 'var(--bg-card)',
                        padding: '10px 8px',
                        borderRadius: RADIUS,
                        border: '1px solid var(--border-color)',
                        textAlign: 'center',
                        position: 'relative'
                    }}
                >
                    <div className="tarjeta-calculo-titulo">
                        Varianza <StatLabel formulaKey={`V_${modelo}`} formulaLatex={modelo === 'NormalEstandar' ? 'V(Z)' : (modelo === 'TStudent' ? 'V(T)' : (modelo === 'FFisher' ? 'V(F)' : (modelo === 'ChiCuadrado' ? 'V(\\chi^2)' : 'V(X)')))} align="center" />
                    </div>
                    {formulasVarianza.length > 1 && (
                        <div className="t3-formula-scroll" style={{ fontSize: '0.85rem', color: 'var(--text-pure)', margin: '10px 0 0', fontWeight: 'normal' }}>
                            <div className="t3-formula-inner">
                                {renderLatex(formulasVarianza[1])}
                            </div>
                        </div>
                    )}
                    <div className="tarjeta-calculo-valor">
                        {typeof resultados.varianza === 'number' && !isNaN(resultados.varianza) ? (
                            renderLatex(`\\mathbf{${formatNum(resultados.varianza)}}`)
                        ) : '-'}
                    </div>
                </div>

                <div
                    className="tarjeta-calculo-mat251 t3-stats-card"
                    style={{
                        background: 'var(--bg-card)',
                        padding: '10px 8px',
                        borderRadius: RADIUS,
                        border: '1px solid var(--border-color)',
                        textAlign: 'center',
                        position: 'relative'
                    }}
                >
                    <div className="tarjeta-calculo-titulo">
                        Desviación <StatLabel formulaKey={`sigma_${modelo}`} formulaLatex="\sigma" align="center" />
                    </div>
                    {formulasDesviacion.length > 1 && (
                        <div className="t3-formula-scroll" style={{ fontSize: '0.85rem', color: 'var(--text-pure)', margin: '10px 0 0', fontWeight: 'normal' }}>
                            <div className="t3-formula-inner">
                                {renderLatex(formulasDesviacion[1])}
                            </div>
                        </div>
                    )}
                    <div className="tarjeta-calculo-valor">
                        {typeof desvFinal === 'number' && !isNaN(desvFinal) ? (
                            renderLatex(`\\mathbf{${formatNum(desvFinal)}}`)
                        ) : '-'}
                    </div>
                </div>
            </div>

            {/* Modal Interactivo de Lectura de Tabla Normal Estándar Z */}
            <ModalTablaNormalZ
                isOpen={modalTablaZ.isOpen}
                onClose={() => setModalTablaZ(prev => ({ ...prev, isOpen: false }))}
                zInicial={modalTablaZ.z}
                detalleCalculo={modalTablaZ.detalleCalculo}
            />
        </div>
    );
}

