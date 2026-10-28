import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import GraficoBastonesDiscreta from '../../../Graficas/Tema_2/GraficoBastonesDiscreta';
import GraficoAreaContinua from '../../../Graficas/Tema_2/GraficoAreaContinua';
import { calcularResumenContinua } from '../../../Matematicas/logica_Tema2';
import { parse } from 'mathjs';

const k = (str, display = false) => {
    try {
        return katex.renderToString(str, { throwOnError: false, displayMode: display });
    } catch {
        return str;
    }
};

const MathSpan = ({ math, display = false }) => (
    <span dangerouslySetInnerHTML={{ __html: k(math, display) }} />
);

const formato = valor => Number.isFinite(Number(valor)) ? Number(valor).toFixed(4) : '—';
const seccion = { textAlign: 'center', pageBreakInside: 'avoid', breakInside: 'avoid' };
const titulo = { fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', margin: '8px 0' };
const celda = { textAlign: 'center' };

function DistribucionDiscretaPDF({ resultado, varSeleccionada }) {
    if (resultado.error) return <div style={seccion}>{resultado.error}</div>;
    const datos = Array.isArray(resultado.datos) ? resultado.datos : [];
    if (!datos.length) return null;
    const esManual = resultado.modo === 'manual' || (!resultado.modo && resultado.N == null);
    const totalF = datos.reduce((suma, d) => suma + Number(d.f ?? 0), 0);
    const totalP = datos.reduce((suma, d) => suma + d.p, 0);
    const segundoMomento = datos.reduce((suma, d) => suma + d.x ** 2 * d.p, 0);
    const observaciones = Array.isArray(resultado.observaciones) ? resultado.observaciones : [];
    const desarrollo = (potencia, simbolo, valor) => {
        const bloques = [];
        for (let inicio = 0; inicio < datos.length; inicio += 9) {
            const filas = [];
            const fin = Math.min(inicio + 9, datos.length);
            for (let i = inicio; i < fin; i += 3) {
                const terminos = datos.slice(i, Math.min(i + 3, fin)).map(d => potencia === 1
                    ? `(${d.x}) \\cdot ${formato(d.p)}`
                    : `(${d.x})^{${potencia}} \\cdot ${formato(d.p)}`).join(' + ');
                filas.push(i === 0 ? `${simbolo} &= ${terminos}` : `&\\quad + ${terminos}`);
            }
            if (fin === datos.length) filas.push(`${simbolo} &= \\mathbf{${formato(valor)}}`);
            bloques.push(<div className="pdf-section pdf-discreta-formulas" key={inicio} style={seccion}>
                {inicio === 0 && <>
                    <div style={titulo}>{potencia === 1 ? 'Esperanza Matemática' : 'Segundo Momento respecto al Origen'}</div>
                    <MathSpan math={`${simbolo} = \\sum_i x_i${potencia === 1 ? '' : '^2'} \\cdot P(X=x_i)`} display />
                </>}
                <MathSpan math={`\\begin{aligned}${filas.join(' \\\\[4pt] ')}\\end{aligned}`} display />
            </div>);
        }
        return bloques;
    };
    return (
        <div style={{ width: '100%' }}>
            <div className="pdf-section">
                <h2 style={{ fontSize: '12pt', color: '#000000', margin: '0 0 4px', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>
                    VARIABLES ALEATORIAS DISCRETAS
                </h2>
                <div style={{ textAlign: 'center', fontSize: '10pt', color: '#000000', margin: '0 0 14px' }}>
                    <strong>Modo de Ejecución:</strong> {esManual ? 'Modo Manual' : 'Análisis de Matriz'}
                </div>
                <div style={{ fontSize: '9pt', lineHeight: '1.6', marginBottom: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                    {!esManual && <>
                        <div><strong>Variable Analizada:</strong> {resultado.nombreVariable || 'Variable activa'}</div>
                        {varSeleccionada?.nombresColumnas?.length > 1 && (
                            <div><strong>Columna Evaluada:</strong> {resultado.columna || 'Datos'}</div>
                        )}
                        <div><strong>Observaciones válidas (N):</strong> {resultado.N ?? totalF}</div>
                    </>}
                    <div><strong>Valores de la Variable (X):</strong> {datos.length}</div>
                </div>
            </div>

            {!esManual && observaciones.length > 0 && <div className="pdf-section" data-pdf-divisible="filas">
                <div style={{ fontSize: '9pt', fontWeight: 'bold', marginBottom: '4px' }}>Datos Analizados de la matriz ({observaciones.length} registros):</div>
                <div style={{ width: observaciones.length > 15 ? '100%' : '70%', margin: '0 auto' }}>
                <table className="tabla-datos-pdf" style={{ width: '100%', marginBottom: '10px' }}>
                    <thead><tr>{Array.from({ length: observaciones.length > 15 ? 2 : 1 }, (_, i) => <React.Fragment key={i}><th style={celda}>Nº</th><th style={celda}>{resultado.columna || 'Valor'}</th></React.Fragment>)}</tr></thead>
                    <tbody>{Array.from({ length: observaciones.length > 15 ? Math.ceil(observaciones.length / 2) : observaciones.length }, (_, i) => {
                        const mitad = Math.ceil(observaciones.length / 2);
                        return <tr key={i}>{(observaciones.length > 15 ? [i, i + mitad] : [i]).map(indice => <React.Fragment key={indice}>
                            <td style={celda}>{indice < observaciones.length ? indice + 1 : ''}</td><td style={celda}>{observaciones[indice] ?? ''}</td>
                        </React.Fragment>)}</tr>;
                    })}</tbody>
                </table>
                </div>
            </div>}

            <div className="pdf-section" data-pdf-divisible="filas">
                <div style={{ fontSize: '9pt', fontWeight: 'bold', marginBottom: '4px' }}>Distribución de Probabilidad y Desglose de Cálculos</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead><tr>
                        <th style={celda}><MathSpan math="x_i" /></th>
                        {!esManual && <th style={celda}><MathSpan math="f_i" /></th>}
                        <th style={celda}><MathSpan math="P(X=x_i)" /></th>
                        <th style={celda}><MathSpan math="x_i \cdot P(X=x_i)" /></th>
                        <th style={celda}><MathSpan math="x_i^2 \cdot P(X=x_i)" /></th>
                    </tr></thead>
                    <tbody>{datos.map((d, i) => <tr key={i}>
                        <td style={{ ...celda, fontWeight: 'bold' }}>{d.x}</td>
                        {!esManual && <td style={celda}>{d.f ?? '—'}</td>}
                        <td style={celda}>{formato(d.p)}</td><td style={celda}>{formato(d.x * d.p)}</td><td style={celda}>{formato(d.x ** 2 * d.p)}</td>
                    </tr>)}</tbody>
                    <tfoot><tr style={{ fontWeight: 'bold', background: '#f8fafc' }}>
                        <td style={celda}>Total / Suma</td>{!esManual && <td style={celda}>{totalF}</td>}
                        <td style={celda}>{formato(totalP)}</td><td style={celda}>{formato(resultado.esperanza)}</td><td style={celda}>{formato(segundoMomento)}</td>
                    </tr></tfoot>
                </table>
            </div>
            <div className="pdf-section pdf-discreta-formulas" style={seccion}>
                <div style={titulo}>Comprobación de la Distribución</div>
                <MathSpan math={`0 \\leq P(X=x_i) \\leq 1, \\qquad \\sum_i P(X=x_i) = ${formato(totalP)}`} display />
            </div>
            {desarrollo(1, 'E(X)', resultado.esperanza)}
            {desarrollo(2, 'E(X^2)', segundoMomento)}
            <div className="pdf-section pdf-discreta-formulas" style={seccion}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px', alignItems: 'start' }}>
                    <div>
                        <div style={titulo}>Varianza</div>
                        <MathSpan math="V(X) = \sigma^2 = E(X^2) - [E(X)]^2" display />
                        <MathSpan math={`\\begin{aligned} V(X) &= ${formato(segundoMomento)} - (${formato(resultado.esperanza)})^2 \\\\[4pt] V(X) &= \\mathbf{${formato(resultado.varianza)}} \\end{aligned}`} display />
                    </div>
                    <div>
                        <div style={titulo}>Desviación Estándar</div>
                        <MathSpan math="\sigma = \sqrt{V(X)}" display />
                        <MathSpan math={`\\begin{aligned} \\sigma &= \\sqrt{${formato(resultado.varianza)}} \\\\[4pt] \\sigma &= \\mathbf{${formato(resultado.desviacion)}} \\end{aligned}`} display />
                    </div>
                </div>
            </div>
            <div className="pdf-section" style={{ ...seccion, width: '100%' }}>
                <div style={{ ...titulo, margin: '8px 0 4px' }}>Función de Masa de Probabilidad - f(x)</div>
                <GraficoBastonesDiscreta datos={datos} id="grafico-discreta-pdf" modoPDF />
            </div>
        </div>
    );
}

const limiteLatex = valor => valor === Infinity ? '\\infty' : valor === -Infinity ? '-\\infty' : String(valor);

// Divide cadenas de igualdades del desarrollo simbólico en renglones de la hoja.
const compactarDesarrollo = latex => {
    const texto = latex.replace(/\\\\\[(?:1em|[0-9.]+pt)\]/g, '\\\\[3pt]');
    let profundidad = 0;
    let salida = '';
    for (let i = 0; i < texto.length; i++) {
        const caracter = texto[i];
        if (texto[i - 1] !== '\\') {
            if (caracter === '{') profundidad++;
            if (caracter === '}') profundidad--;
        }
        if (caracter === '=' && profundidad === 0 && !salida.trimEnd().endsWith('&')) {
            salida += '\\\\[3pt] &';
        }
        salida += caracter;
    }
    return salida;
};

function ConstanteContinuaPDF({ constante }) {
    if (!constante?.latex_block) return null;
    return (
        <div className="pdf-section" style={seccion} data-pdf-divisible="formulas">
            <div style={titulo}>Procedimiento: Cálculo de Constante {constante.incognitaVar || 'k'}</div>
            <MathSpan math={compactarDesarrollo(constante.latex_block)} display />
        </div>
    );
}

function DistribucionContinuaPDF({ resultado }) {
    if (resultado.soloConstante) {
        return (
            <div className="pdf-continua" style={{ width: '100%' }}>
                <div className="pdf-section" style={seccion}>
                    <h2 style={{ fontSize: '12pt', color: '#000000', margin: '0 0 14px', fontWeight: 'bold', textAlign: 'center' }}>
                        CALCULADORA DE FUNCIONES CONTINUAS
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div><strong>Límite Inferior:</strong> <MathSpan math={`a = ${limiteLatex(resultado.a)}`} /></div>
                        <div><strong>Límite Superior:</strong> <MathSpan math={`b = ${limiteLatex(resultado.b)}`} /></div>
                    </div>
                </div>
                <ConstanteContinuaPDF constante={resultado.constante} />
            </div>
        );
    }
    const funcion = resultado.funcionFx || resultado.funcion;
    const calculos = calcularResumenContinua({ ...resultado, funcionFx: funcion });
    if (calculos.error) return <div className="pdf-section">{calculos.error}</div>;
    const { eX, eX2, varX, stdDev, area } = calculos;
    let latexFuncion = resultado.latexString;
    if (!latexFuncion) {
        try {
            latexFuncion = parse(funcion).toTex({ parenthesis: 'auto' });
        } catch {
            return <div className="pdf-section">No se pudo representar la función ingresada.</div>;
        }
    }
    const a = limiteLatex(resultado.a);
    const b = limiteLatex(resultado.b);
    const integral = contenido => `\\int_{${a}}^{${b}} ${contenido} \\, dx`;
    const formulaArea = resultado.latex_area
        ? compactarDesarrollo(resultado.latex_area)
        : `\\begin{aligned}\\text{Área} &= ${integral(`\\left(${latexFuncion}\\right)`)} \\\\[3pt] &= \\mathbf{${formato(area)}}\\end{aligned}`;
    const formulaEsperanza = resultado.latex_esperanza
        ? compactarDesarrollo(resultado.latex_esperanza)
        : `\\begin{aligned}E(X) &= ${integral(`x \\cdot \\left(${latexFuncion}\\right)`)} \\\\[3pt] &= \\mathbf{${formato(eX)}}\\end{aligned}`;
    const formulaVarianza = resultado.latex_varianza
        ? compactarDesarrollo(resultado.latex_varianza)
        : `\\begin{aligned}E(X^2) &= ${integral(`x^2 \\cdot \\left(${latexFuncion}\\right)`)} \\\\[3pt] &= \\mathbf{${formato(eX2)}}\\end{aligned}`;
    return (
        <div className="pdf-continua" style={{ width: '100%' }}>
            <div className="pdf-section" style={seccion}>
                <h2 style={{ fontSize: '12pt', color: '#000000', margin: '0 0 14px', fontWeight: 'bold', textAlign: 'center' }}>
                    CALCULADORA DE FUNCIONES CONTINUAS
                </h2>
                <div style={titulo}>Función de Densidad</div>
                <MathSpan math={`f(x) = ${latexFuncion}`} display />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                    <div><strong>Límite Inferior:</strong> <MathSpan math={`a = ${a}`} /></div>
                    <div><strong>Límite Superior:</strong> <MathSpan math={`b = ${b}`} /></div>
                </div>
            </div>
            <ConstanteContinuaPDF constante={resultado.constante} />
            <div className="pdf-section" style={seccion}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
                    <div><div style={titulo}>Esperanza Matemática</div><MathSpan math={`E(X) = \\mathbf{${formato(eX)}}`} /></div>
                    <div><div style={titulo}>Varianza</div><MathSpan math={`V(X) = \\mathbf{${formato(varX)}}`} /></div>
                    <div><div style={titulo}>Desviación Estándar</div><MathSpan math={`\\sigma = \\mathbf{${formato(stdDev)}}`} /></div>
                </div>
            </div>
            <div className="pdf-section" style={seccion} data-pdf-divisible="formulas">
                <div style={titulo}>Validación de Área</div>
                <MathSpan math={formulaArea} display />
                <div style={{ fontSize: '9pt', marginTop: '6px' }}>
                    {Math.abs(area - 1) < 0.02
                        ? 'El área total bajo la curva es igual a 1.'
                        : 'El área es distinta de 1. Los cálculos se presentan con fines demostrativos.'}
                </div>
            </div>
            <div className="pdf-section" style={seccion} data-pdf-divisible="formulas">
                <div style={titulo}>Esperanza Matemática</div>
                <MathSpan math={`E(X) = ${integral('x \\cdot f(x)')}`} display />
                <MathSpan math={formulaEsperanza} display />
            </div>
            <div className="pdf-section" style={seccion} data-pdf-divisible="formulas">
                <div style={titulo}>{resultado.latex_varianza ? 'Desarrollo de la Varianza' : 'Segundo Momento respecto al Origen'}</div>
                <MathSpan math={formulaVarianza} display />
            </div>
            <div className="pdf-section" style={seccion}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px', alignItems: 'start' }}>
                    <div>
                        <div style={titulo}>Varianza</div>
                        <MathSpan math="V(X) = E(X^2) - [E(X)]^2" display />
                        <MathSpan math={`\\begin{aligned}V(X) &= ${formato(eX2)} - (${formato(eX)})^2 \\\\[3pt] &= \\mathbf{${formato(varX)}}\\end{aligned}`} display />
                    </div>
                    <div>
                        <div style={titulo}>Desviación Estándar</div>
                        <MathSpan math="\sigma = \sqrt{V(X)}" display />
                        <MathSpan math={`\\begin{aligned}\\sigma &= \\sqrt{${formato(varX)}} \\\\[3pt] &= \\mathbf{${formato(stdDev)}}\\end{aligned}`} display />
                    </div>
                </div>
            </div>
            <div className="pdf-section" style={seccion}>
                <div style={{ ...titulo, margin: '8px 0 4px' }}>Función de Densidad y Esperanza E(X)</div>
                <GraficoAreaContinua datos={{ funcion, a: resultado.a, b: resultado.b, modo: 'densidad', eX, area }} modoPDF />
                <div style={{ fontSize: '9pt', marginTop: '4px' }}>
                    El área sombreada entre <MathSpan math={`a = ${a}`} /> y <MathSpan math={`b = ${b}`} /> es <MathSpan math={formato(area)} />.
                </div>
            </div>
        </div>
    );
}

export default function ReportePDF_Tema2({
    operacion,
    datosDiscretos,
    datosContinuos,
    varSeleccionada
}) {
    return (
        <div id="pdf-cuerpo-tema2">
            <style>{`
                #reporte-formal-mat251 #pdf-cuerpo-tema2 .pdf-discreta-formulas .katex-display,
                #reporte-formal-mat251 #pdf-cuerpo-tema2 .pdf-continua .katex-display {
                    margin: 4px 0 !important;
                    padding: 0 !important;
                }
                #reporte-formal-mat251 #pdf-cuerpo-tema2 .pdf-discreta-formulas .katex,
                #reporte-formal-mat251 #pdf-cuerpo-tema2 .pdf-continua .katex {
                    padding: 0 !important;
                }
                #reporte-formal-mat251 #pdf-cuerpo-tema2 .katex .hide-tail {
                    overflow: hidden !important;
                }
            `}</style>
            {operacion === 'dist_discreta' && datosDiscretos && (
                <DistribucionDiscretaPDF resultado={datosDiscretos} varSeleccionada={varSeleccionada} />
            )}

            {(operacion === 'dist_continua' || operacion === 'dist_continua_v2') && datosContinuos && (
                <DistribucionContinuaPDF resultado={datosContinuos} />
            )}
        </div>
    );
}
