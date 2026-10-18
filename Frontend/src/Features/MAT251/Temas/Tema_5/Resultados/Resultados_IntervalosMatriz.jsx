import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import Grafica_IntervalosMatriz from '../../../Graficas/Tema_5/Grafica_IntervalosMatriz';
import Grafica_IntervalosProporcion from '../../../Graficas/Tema_5/Grafica_IntervalosProporcion';
import Grafica_IntervalosVarianza from '../../../Graficas/Tema_5/Grafica_IntervalosVarianza';
import StatLabel from '../../../ui/StatLabel';
import '../../../styles/Temas/Tema3.css';

export default function Resultados_IntervalosMatriz({ resultados, parametro }) {
    if (!resultados) return null;

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const getSymboloParam = () => {
        if (parametro === 'media') return '\\mu';
        if (parametro === 'proporcion') return 'p';
        if (parametro === 'varianza') return '\\sigma^2';
        return '';
    };

    const getSymboloPuntual = () => {
        if (parametro === 'media') return '\\bar{X}';
        if (parametro === 'proporcion') return '\\hat{p}';
        if (parametro === 'varianza') return 'S^2';
        return '';
    };

    const getFormulaICNum = () => {
        const critico = resultados.valorCritico.toFixed(4);
        const punt = puntual.estimacion.toFixed(4);
        
        if (parametro === 'media') {
            // Calcular desviación estándar (s o sigma) a partir del margen de error
            const SE = resultados.margenError / resultados.valorCritico;
            const s_or_sigma = (SE * Math.sqrt(resultados.n)).toFixed(4);
            
            return `${punt} \\pm ${critico} \\left( \\frac{${s_or_sigma}}{\\sqrt{${resultados.n}}} \\right)`;
        } else if (parametro === 'proporcion') {
            return `${punt} \\pm ${critico} \\sqrt{\\frac{${punt}(1-${punt})}{${resultados.n}}}`;
        }
        return '';
    };

    const puntual = resultados.puntual;

    if (!puntual || !Number.isFinite(Number(puntual.estimacion))) return null;
    if (parametro === 'varianza') {
        if (!Number.isFinite(Number(resultados.criticoInf)) || !Number.isFinite(Number(resultados.criticoSup))) return null;
    } else if (!Number.isFinite(Number(resultados.valorCritico)) || !Number.isFinite(Number(resultados.margenError))) {
        return null;
    }

    const filasResolucion = [];
    if (parametro === 'varianza') {
        const chiCuadradoSuperior = Math.max(resultados.criticoInf, resultados.criticoSup).toFixed(4);
        const chiCuadradoInferior = Math.min(resultados.criticoInf, resultados.criticoSup).toFixed(4);
        filasResolucion.push(
            ['Fórmula del intervalo', <StatLabel formulaKey="IC_varianza" formulaLatex="IC" align="left" position="top" />],
            ['Cálculo del intervalo', renderKatex(`IC = \\left[ \\frac{(${resultados.n} - 1)(${puntual.estimacion.toFixed(4)})}{${chiCuadradoSuperior}}, \\frac{(${resultados.n} - 1)(${puntual.estimacion.toFixed(4)})}{${chiCuadradoInferior}} \\right]`)],
            ['Límite inferior', renderKatex(`LI = \\frac{(${resultados.n} - 1)(${puntual.estimacion.toFixed(4)})}{${chiCuadradoSuperior}} = \\mathbf{${resultados.LI.toFixed(4)}}`)],
            ['Límite superior', renderKatex(`LS = \\frac{(${resultados.n} - 1)(${puntual.estimacion.toFixed(4)})}{${chiCuadradoInferior}} = \\mathbf{${resultados.LS.toFixed(4)}}`)]
        );
    } else {
        const formulaKeyIC = parametro === 'proporcion'
            ? 'IC_proporcion'
            : (resultados.metodo.includes('Z') ? 'IC_media_z' : 'IC_media_t');
        const formulaKeyError = parametro === 'proporcion'
            ? 'E_proporcion'
            : (resultados.metodo.includes('Z') ? 'E_media_z' : 'E_media_t');
        filasResolucion.push(
            ['Fórmula del intervalo', <StatLabel formulaKey={formulaKeyIC} formulaLatex="IC" align="left" position="top" />],
            ['Cálculo del intervalo', renderKatex(`IC = ${getFormulaICNum()}`)],
            ['Margen de error', <><StatLabel formulaKey={formulaKeyError} formulaLatex="E" align="left" position="top" />{renderKatex(` = \\mathbf{${resultados.margenError.toFixed(4)}}`)}</>],
            ['Límite inferior', renderKatex(`LI = ${getSymboloPuntual()} - E = ${puntual.estimacion.toFixed(4)} - ${resultados.margenError.toFixed(4)} = \\mathbf{${resultados.LI.toFixed(4)}}`)],
            ['Límite superior', renderKatex(`LS = ${getSymboloPuntual()} + E = ${puntual.estimacion.toFixed(4)} + ${resultados.margenError.toFixed(4)} = \\mathbf{${resultados.LS.toFixed(4)}}`)]
        );
    }
    filasResolucion.push(
        ['Intervalo de confianza', renderKatex(`IC = [\\, \\mathbf{${resultados.LI.toFixed(4)}} \\, , \\, \\mathbf{${resultados.LS.toFixed(4)}} \\,]`)],
        ['Interpretación', renderKatex(`P(\\mathbf{${resultados.LI.toFixed(4)}} \\le ${getSymboloParam()} \\le \\mathbf{${resultados.LS.toFixed(4)}}) = \\mathbf{${resultados.confianza / 100}}`)]
    );

    const columnasResumen = [
        { titulo: 'Tamaño de Muestra', valor: renderKatex(`n = ${resultados.n}`) },
        { titulo: 'Estimador Puntual', valor: renderKatex(`${getSymboloPuntual()} = ${puntual.estimacion.toFixed(4)}`) },
        { titulo: 'Nivel de Confianza', valor: renderKatex(`${resultados.confianza}\\%`) },
        {
            titulo: `Valor Crítico - ${resultados.metodo}`,
            valor: parametro === 'varianza'
                ? renderKatex(`\\chi^2_{sup} = ${Math.max(resultados.criticoInf, resultados.criticoSup).toFixed(4)}, \\; \\chi^2_{inf} = ${Math.min(resultados.criticoInf, resultados.criticoSup).toFixed(4)}`)
                : renderKatex(`${resultados.metodo.includes('Z') ? 'Z' : 'T'} = ${resultados.valorCritico.toFixed(4)}`)
        }
    ];
    if (parametro === 'media') {
        const desviacion = (resultados.margenError / resultados.valorCritico) * Math.sqrt(resultados.n);
        columnasResumen.push({ titulo: 'Desviación Estándar', valor: renderKatex(`\\sigma = ${desviacion.toFixed(4)}`) });
    }

    return (
        <div className="tema5-resultados-pure" style={{ width: '100%' }}>
            <div className="tema5-tabla-estimacion-wrapper tema5-tabla-resolucion-scroll">
                <table className="tema5-tabla-estimacion tema5-tabla-resumen-intervalo" style={{ width: 'fit-content', maxWidth: '100%', tableLayout: 'auto' }}>
                    <colgroup>{Array.from({ length: 6 }, (_, indice) => <col key={indice} />)}</colgroup>
                    <tbody>
                        <tr>
                            {columnasResumen.slice(0, 3).map((columna) => (
                                <td key={columna.titulo} colSpan={2} style={{ whiteSpace: 'normal', fontWeight: 700, fontSize: '0.85rem' }}>{columna.titulo}</td>
                            ))}
                        </tr>
                        <tr>
                            {columnasResumen.slice(0, 3).map((columna) => (
                                <td key={columna.titulo} colSpan={2} style={{ whiteSpace: 'normal', fontSize: '0.85rem' }}>{columna.valor}</td>
                            ))}
                        </tr>
                        <tr>
                            {columnasResumen.slice(3).map((columna) => (
                                <td key={columna.titulo} colSpan={columnasResumen.length === 5 ? 3 : 6} style={{ whiteSpace: 'normal', fontWeight: 700, fontSize: '0.85rem' }}>{columna.titulo}</td>
                            ))}
                        </tr>
                        <tr>
                            {columnasResumen.slice(3).map((columna) => (
                                <td key={columna.titulo} colSpan={columnasResumen.length === 5 ? 3 : 6} style={{ whiteSpace: 'normal', fontSize: '0.85rem' }}>{columna.valor}</td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>

            <section className="tema5-resolucion-estimacion">
                <h4>Desarrollo del intervalo de confianza</h4>
                <div className="tema5-tabla-estimacion-wrapper tema5-tabla-resolucion-scroll tema5-tabla-intervalo-wrapper">
                    <table className="tema5-tabla-estimacion tema5-tabla-resolucion tema5-tabla-intervalo-detalle">
                        <thead>
                            <tr>
                                <th>Detalle</th>
                                <th>Cálculo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filasResolucion.map(([detalle, calculo]) => (
                                <tr key={detalle}>
                                    <td>{detalle}</td>
                                    <td>{calculo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {parametro !== 'varianza' ? (
                <div style={{ marginTop: '20px' }}>
                    {parametro === 'media' && <Grafica_IntervalosMatriz resultados={resultados} parametro={parametro} />}
                    {parametro === 'proporcion' && <Grafica_IntervalosProporcion resultados={resultados} parametro={parametro} />}
                </div>
            ) : (
                <div style={{ marginTop: '20px' }}>
                    <Grafica_IntervalosVarianza resultados={resultados} />
                </div>
            )}
        </div>
    );
}
