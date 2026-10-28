import React from 'react';
import '../../../styles/Temas/Tema3.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { FONT, FS, RADIUS } from '../../../Principal/Constantes';
import StatLabel from '../../../ui/StatLabel';

export default function Resultados_ModelosDiscretos({ resultados, modelo, params, condicion }) {
    if (!resultados) return null;

    const renderLatex = (str) => {
        return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(str, { throwOnError: false }) }} />;
    };

    const formatSmart = (num, minDecimals = 2, maxDecimals = 10) => {
        if (typeof num !== 'number' || isNaN(num)) return '-';
        if (num === 0) return (0).toFixed(minDecimals);
        
        if (Number.isInteger(num) && minDecimals === 2) return num.toString();

        const absNum = Math.abs(num);
        let zeros = -Math.floor(Math.log10(absNum));
        
        if (zeros <= minDecimals - 1) {
            return num.toFixed(minDecimals);
        }
        
        let decimalPlaces = zeros + 1;
        if (decimalPlaces > maxDecimals) decimalPlaces = maxDecimals;
        
        return num.toFixed(decimalPlaces);
    };

    const renderResolucionDiscreta = () => {
        if (!condicion || !params || !condicion.tipo) return null;

        let alignedStr = '';
        const { tipo, valorX, valorB } = condicion;
        const pFinal = typeof resultados.probabilidadFinal === 'number' ? formatSmart(resultados.probabilidadFinal, 4) : resultados.probabilidadFinal;
        const getFormulaX = (x) => {
            if (modelo === 'Bernoulli') return `(${params.p})^{${x}}(1 - ${params.p})^{1 - ${x}}`;
            if (modelo === 'Binomial') return `\\binom{${params.n}}{${x}}(${params.p})^{${x}}(1 - ${params.p})^{${params.n} - ${x}}`;
            if (modelo === 'Poisson') return `\\frac{e^{-${params.lambda}} ${params.lambda}^{${x}}}{${x}!}`;
            if (modelo === 'Hipergeometrica') return `\\frac{\\binom{${params.K}}{${x}} \\binom{${params.N} - ${params.K}}{${params.n} - ${x}}}{\\binom{${params.N}}{${params.n}}}`;
            return '';
        };
        if (tipo === 'exacta') {
            alignedStr = `\\begin{aligned} P(X = ${valorX}) &= ${getFormulaX(valorX)} \\\\[10px] &= \\mathbf{${pFinal}} \\end{aligned}`;
        } else if (tipo === 'menor_igual') {
            alignedStr = `\\begin{aligned} P(X \\le ${valorX}) &= \\sum_{x=0}^{${valorX}} P(X=x) \\\\[10px] &= \\mathbf{${pFinal}} \\end{aligned}`;
        } else if (tipo === 'mayor_igual') {
            alignedStr = `\\begin{aligned} P(X \\ge ${valorX}) &= 1 - P(X \\le ${valorX - 1}) \\\\[10px] &= \\mathbf{${pFinal}} \\end{aligned}`;
        } else if (tipo === 'menor_estricto') {
            alignedStr = `\\begin{aligned} P(X < ${valorX}) &= P(X \\le ${valorX - 1}) \\\\[10px] &= \\mathbf{${pFinal}} \\end{aligned}`;
        } else if (tipo === 'mayor_estricto') {
            alignedStr = `\\begin{aligned} P(X > ${valorX}) &= 1 - P(X \\le ${valorX}) \\\\[10px] &= \\mathbf{${pFinal}} \\end{aligned}`;
        } else if (tipo === 'intervalo') {
            alignedStr = `\\begin{aligned} P(${valorX} \\le X \\le ${valorB}) &= \\sum_{x=${valorX}}^{${valorB}} P(X=x) \\\\[10px] &= \\mathbf{${pFinal}} \\end{aligned}`;
        } else if (tipo === 'intervalo_estricto') {
            alignedStr = `\\begin{aligned} P(${valorX} < X < ${valorB}) &= P(${valorX + 1} \\le X \\le ${valorB - 1}) \\\\[10px] &= \\mathbf{${pFinal}} \\end{aligned}`;
        }
        return (
            <div className="t3-formula-scroll" style={{ color: 'var(--text-pure)', fontSize: '0.85rem', margin: '10px 0 0' }}>
                <div className="t3-formula-inner">{renderLatex(alignedStr)}</div>
            </div>
        );
    };

    let formulaEsperanza = "";
    let formulaVarianza = "";
    let formulaDesviacion = "";
    
    if (params) {
        const vFormatted = resultados && typeof resultados.varianza === 'number' ? formatSmart(resultados.varianza, 2) : '';
        if (modelo === 'Bernoulli') {
            formulaEsperanza = `E(X) = ${params.p}`;
            formulaVarianza = `V(X) = ${params.p}(1 - ${params.p})`;
            formulaDesviacion = `\\sigma = \\sqrt{${vFormatted}}`;
        } else if (modelo === 'Binomial') {
            formulaEsperanza = `E(X) = ${params.n} \\cdot ${params.p}`;
            formulaVarianza = `V(X) = ${params.n} \\cdot ${params.p}(1 - ${params.p})`;
            formulaDesviacion = `\\sigma = \\sqrt{${vFormatted}}`;
        } else if (modelo === 'Poisson') {
            formulaEsperanza = `E(X) = ${params.lambda}`;
            formulaVarianza = `V(X) = ${params.lambda}`;
            formulaDesviacion = `\\sigma = \\sqrt{${params.lambda}}`;
        } else if (modelo === 'Hipergeometrica') {
            formulaEsperanza = `E(X) = ${params.n} \\cdot \\frac{${params.K}}{${params.N}}`;
            formulaVarianza = `V(X) = ${params.n} \\cdot \\frac{${params.K}}{${params.N}} \\left(1 - \\frac{${params.K}}{${params.N}}\\right) \\frac{${params.N} - ${params.n}}{${params.N} - 1}`;
            formulaDesviacion = `\\sigma = \\sqrt{${vFormatted}}`;
        }
    }

    const desvCalculada = resultados.desviacion !== undefined ? resultados.desviacion : (typeof resultados.varianza === 'number' ? Math.sqrt(resultados.varianza) : null);

    const pNum = resultados.probabilidadFinal;
    const pStr = typeof pNum === 'number' ? formatSmart(pNum, 4) : '-';
    const pctNum = typeof pNum === 'number' ? +(pNum * 100).toFixed(2) : 0;
    const pctStr = typeof pNum === 'number' ? (Number.isInteger(pctNum) ? pctNum.toString() : pctNum.toFixed(2)) : '0';

    return (
        <div className="tema3-card" style={{ marginTop: '20px' }}>

            {/* Tarjeta Superior: Probabilidad Calculada */}
            <div
                id="tour-t3discreta-resultado-probabilidad"
                className="tarjeta-calculo-mat251"
                style={{
                    background: 'var(--bg-card)',
                    padding: '12px 10px',
                    borderRadius: RADIUS,
                    border: '1px solid var(--border-color)',
                    marginBottom: '15px',
                    textAlign: 'center',
                    position: 'relative'
                }}
            >
                <div className="tarjeta-calculo-titulo">
                    Probabilidad Calculada{' '}
                    <StatLabel formulaKey={`P_${modelo}`} formulaLatex="P(X)" align="center" />
                </div>

                {renderResolucionDiscreta()}

                <div className="tarjeta-calculo-valor">
                    {typeof pNum === 'number' ? (
                        renderLatex(`\\mathbf{${pStr}} \\;\\rightarrow\\; \\mathbf{${pctStr}\\%}`)
                    ) : '-'}
                </div>
            </div>

            {/* Fila de Tarjetas Estadísticas: Esperanza, Varianza, Desviación */}
            <div className="t3-stats-container">
                <div
                    id="tour-t3discreta-esperanza"
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
                        Esperanza{' '}
                        <StatLabel
                            formulaKey={`E_${modelo}`}
                            formulaLatex="E(X)"
                            align="center"
                        />
                    </div>
                    {formulaEsperanza && (
                        <div className="t3-formula-scroll" style={{ fontSize: '0.85rem', color: 'var(--text-pure)', margin: '10px 0 0', fontWeight: 'normal' }}>
                            <div className="t3-formula-inner">
                                {renderLatex(formulaEsperanza)}
                            </div>
                        </div>
                    )}
                    <div className="tarjeta-calculo-valor">
                        {typeof resultados.esperanza === 'number' ? (
                            renderLatex(`\\mathbf{${formatSmart(resultados.esperanza, 2)}}`)
                        ) : '-'}
                    </div>
                </div>

                <div
                    id="tour-t3discreta-varianza"
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
                        Varianza{' '}
                        <StatLabel
                            formulaKey={`V_${modelo}`}
                            formulaLatex="V(X)"
                            align="center"
                        />
                    </div>
                    {formulaVarianza && (
                        <div className="t3-formula-scroll" style={{ fontSize: '0.85rem', color: 'var(--text-pure)', margin: '10px 0 0', fontWeight: 'normal' }}>
                            <div className="t3-formula-inner">
                                {renderLatex(formulaVarianza)}
                            </div>
                        </div>
                    )}
                    <div className="tarjeta-calculo-valor">
                        {typeof resultados.varianza === 'number' ? (
                            renderLatex(`\\mathbf{${formatSmart(resultados.varianza, 2)}}`)
                        ) : '-'}
                    </div>
                </div>

                <div
                    id="tour-t3discreta-desviacion"
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
                        Desviación{' '}
                        <StatLabel
                            formulaKey={`sigma_${modelo}`}
                            formulaLatex="\sigma"
                            align="center"
                        />
                    </div>
                    {formulaDesviacion && (
                        <div className="t3-formula-scroll" style={{ fontSize: '0.85rem', color: 'var(--text-pure)', margin: '10px 0 0', fontWeight: 'normal' }}>
                            <div className="t3-formula-inner">
                                {renderLatex(formulaDesviacion)}
                            </div>
                        </div>
                    )}
                    <div className="tarjeta-calculo-valor">
                        {typeof desvCalculada === 'number' ? (
                            renderLatex(`\\mathbf{${formatSmart(desvCalculada, 2)}}`)
                        ) : '-'}
                    </div>
                </div>
            </div>
        </div>
    );
}
