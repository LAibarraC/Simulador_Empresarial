import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import GraficoBastonesModelos from '../../../Graficas/Tema_3/GraficoBastonesModelos';
import GraficoModelosContinuos from '../../../Graficas/Tema_3/GraficoModelosContinuos';
import Resultados_ModelosContinuos from '../Resultados/Resultados_ModelosContinuos';
import { desarrollarProbabilidadDiscreta, modeloContinuoPDF, desarrolloContinuoPDF, numeroContinuo, decimalContinuo } from '../../../Matematicas/logica_Tema3';

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
const MathPDF = MathSpan;

const titulo = { fontSize: '9pt', fontWeight: 'bold', textAlign: 'center', margin: '8px 0' };
const centrado = { textAlign: 'center', breakInside: 'avoid', pageBreakInside: 'avoid' };
const celda = { textAlign: 'center' };
const alineado = filas => `\\begin{aligned}${filas.map(fila => `&${fila}`).join(' \\\\[3pt] ')}\\end{aligned}`;
const numeroLatex = valor => Number.isFinite(valor)
    ? String(valor).replace(/e([+-]?\d+)/i, '\\times 10^{$1}')
    : '\\text{—}';
const formato = valor => {
    if (!Number.isFinite(valor)) return '—';
    const decimales = valor !== 0 && Math.abs(valor) < 0.001
        ? Math.min(10, Math.max(4, -Math.floor(Math.log10(Math.abs(valor))) + 1)) : 4;
    return valor.toFixed(decimales);
};

/* ══════════════════════════════════════════════════════════════════
   SECCIÓN 1: MODELOS DISCRETOS
   ══════════════════════════════════════════════════════════════════ */

function formulasModelo(modelo, params) {
    const p = numeroLatex(params.p);
    const n = numeroLatex(params.n);
    const lambda = numeroLatex(params.lambda);
    const N = numeroLatex(params.N);
    const K = numeroLatex(params.K);
    const modelos = {
        Bernoulli: {
            masa: 'p^x (1-p)^{1-x}',
            sustituir: x => `(${p})^{${x}}(1-${p})^{1-${x}}`,
            soporte: 'x \\in \\{0,1\\}',
            esperanza: 'p', esperanzaValores: p,
            varianza: 'p(1-p)', varianzaValores: `${p}(1-${p})`
        },
        Binomial: {
            masa: '\\binom{n}{x}p^x(1-p)^{n-x}',
            sustituir: x => `\\binom{${n}}{${x}}(${p})^{${x}}(1-${p})^{${n}-${x}}`,
            soporte: 'x \\in \\{0,1,\\ldots,n\\}',
            esperanza: 'n \\cdot p', esperanzaValores: `${n} \\cdot ${p}`,
            varianza: 'np(1-p)', varianzaValores: `${n} \\cdot ${p}(1-${p})`
        },
        Poisson: {
            masa: '\\frac{e^{-\\lambda}\\lambda^x}{x!}',
            sustituir: x => `\\frac{e^{-${lambda}}(${lambda})^{${x}}}{${x}!}`,
            soporte: 'x \\in \\{0,1,2,\\ldots\\}',
            esperanza: '\\lambda', esperanzaValores: lambda,
            varianza: '\\lambda', varianzaValores: lambda
        },
        Hipergeometrica: {
            masa: '\\frac{\\binom{K}{x}\\binom{N-K}{n-x}}{\\binom{N}{n}}',
            sustituir: x => `\\frac{\\binom{${K}}{${x}}\\binom{${N}-${K}}{${n}-${x}}}{\\binom{${N}}{${n}}}`,
            soporte: '\\max(0,n-(N-K)) \\leq x \\leq \\min(K,n)',
            esperanza: 'n \\cdot \\frac{K}{N}', esperanzaValores: `${n} \\cdot \\frac{${K}}{${N}}`,
            varianza: 'n \\cdot \\frac{K}{N} \\left(1-\\frac{K}{N}\\right)\\frac{N-n}{N-1}',
            varianzaValores: `${n} \\cdot \\frac{${K}}{${N}}\\left(1-\\frac{${K}}{${N}}\\right)\\frac{${N}-${n}}{${N}-1}`
        }
    };
    return modelos[modelo];
}

function condicionLatex(condicion) {
    if (!condicion) return null;
    const { tipo, valorX: x, valorB: b } = condicion;
    const expresiones = {
        exacta: `X=${x}`, menor_igual: `X \\leq ${x}`, mayor_igual: `X \\geq ${x}`,
        menor_estricto: `X<${x}`, mayor_estricto: `X>${x}`,
        intervalo: `${x} \\leq X \\leq ${b}`, intervalo_estricto: `${x}<X<${b}`
    };
    return expresiones[tipo] ? `P(${expresiones[tipo]})` : null;
}

function resolucionProbabilidad(condicion, modelo, probabilidad) {
    const objetivo = condicionLatex(condicion);
    if (!objetivo || !Number.isFinite(probabilidad)) return null;
    const { tipo, valorX: x, valorB: b } = condicion;
    const suma = (inicio, fin) => `\\sum_{x=${inicio}}^{${fin}} ${modelo.sustituir('x')}`;
    const filas = [];
    if (tipo === 'exacta') {
        filas.push(`${objetivo} &= ${modelo.sustituir(numeroLatex(x))}`);
    } else if (tipo === 'menor_igual' || tipo === 'menor_estricto') {
        const fin = tipo === 'menor_estricto' ? x - 1 : x;
        filas.push(`${objetivo} &= ${tipo === 'menor_estricto' ? `P(X \\leq ${fin})` : `\\sum_{x=0}^{${fin}}P(X=x)`}`);
        filas.push(`&= ${fin < 0 ? '0' : suma(0, fin)}`);
    } else if (tipo === 'mayor_igual' || tipo === 'mayor_estricto') {
        const fin = tipo === 'mayor_igual' ? x - 1 : x;
        filas.push(`${objetivo} &= 1-P(X \\leq ${fin})`);
        filas.push(`&= 1-${fin < 0 ? '0' : suma(0, fin)}`);
    } else {
        const inicio = tipo === 'intervalo_estricto' ? x + 1 : x;
        const fin = tipo === 'intervalo_estricto' ? b - 1 : b;
        filas.push(`${objetivo} &= ${tipo === 'intervalo_estricto' ? `P(${inicio} \\leq X \\leq ${fin})` : `\\sum_{x=${inicio}}^{${fin}}P(X=x)`}`);
        filas.push(`&= ${inicio > fin ? '0' : suma(inicio, fin)}`);
    }
    return `\\begin{aligned}${filas.join(' \\\\[3pt] ')}\\end{aligned}`;
}

function DesarrolloProbabilidadPDF({ datos, formulas }) {
    const probabilidad = datos.resultados?.probabilidadFinal;
    const desarrollo = desarrollarProbabilidadDiscreta(datos.modelo, datos.params, datos.condicion, probabilidad);
    if (!desarrollo) return null;
    const valores = desarrollo.terminos.map(t => formato(t.probabilidad));
    if (desarrollo.abreviado) valores.splice(3, 0, '\\cdots');
    const sumas = [];
    for (let i = 0; i < valores.length; i += 3) {
        sumas.push(`${i ? '&\\quad + ' : '\\text{Suma} &='}${valores.slice(i, i + 3).join(' + ')}`);
    }
    if (!sumas.length) sumas.push('\\text{Suma} &= 0');
    if (!desarrollo.abreviado) sumas.push(`\\text{Suma} &= ${formato(desarrollo.terminos.reduce((total, t) => total + t.probabilidad, 0))}`);
    const final = `${desarrollo.objetivo} = ${desarrollo.complemento ? `1 - ${formato(1 - probabilidad)} = ` : ''}\\mathbf{${formato(probabilidad)}}`;
    return <>
        <div className="pdf-section" style={centrado} data-pdf-divisible="formulas">
            <div style={titulo}>Desarrollo de la Probabilidad Calculada</div>
            <MathSpan math={resolucionProbabilidad(datos.condicion, formulas, probabilidad)} display />
        </div>
        {desarrollo.cantidad > 1 && <div className="pdf-section" data-pdf-divisible="filas">
            <div style={{ ...titulo, textAlign: 'left' }}>Probabilidades de Cada Valor</div>
            {desarrollo.abreviado && <div style={{ fontSize: '9pt', marginBottom: '4px' }}>La suma tiene {desarrollo.cantidad} términos. Se muestran los tres primeros y los tres últimos; el resultado incluye todos.</div>}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th><MathSpan math="x" /></th><th>Sustitución</th><th><MathSpan math="P(X=x)" /></th></tr></thead>
                <tbody>{desarrollo.terminos.map((t, i) => <React.Fragment key={t.x}>
                    {desarrollo.abreviado && i === 3 && <tr><td colSpan={3} style={celda}>⋯</td></tr>}
                    <tr><td style={celda}>{t.x}</td><td style={celda}><MathSpan math={t.formula} /></td><td style={celda}>{formato(t.probabilidad)}</td></tr>
                </React.Fragment>)}</tbody>
            </table>
        </div>}
        <div className="pdf-section" style={centrado} data-pdf-divisible="formulas">
            <div style={titulo}>{desarrollo.cantidad > 1 ? 'Suma y Resultado' : 'Resultado'}</div>
            {desarrollo.cantidad > 1 && <MathSpan math={`\\begin{aligned}${sumas.join(' \\\\[3pt] ')}\\end{aligned}`} display />}
            <MathSpan math={final} display />
            <MathSpan math={`\\mathbf{${formato(probabilidad)}} \\quad \\Longleftrightarrow \\quad \\mathbf{${formato(probabilidad * 100)}\\%}`} display />
        </div>
    </>;
}

function DatosMatrizPDF({ contexto }) {
    const observaciones = contexto.observaciones || [];
    if (!observaciones.length) return null;
    const doble = observaciones.length > 15;
    const mitad = doble ? Math.ceil(observaciones.length / 2) : observaciones.length;
    return (
        <div className="pdf-section" data-pdf-divisible="filas">
            <div style={{ fontSize: '9pt', fontWeight: 'bold', marginBottom: '4px' }}>Datos Analizados de la Matriz ({observaciones.length} registros):</div>
            <div style={{ width: doble ? '100%' : '70%', margin: '0 auto' }}>
                <table className="tabla-datos-pdf" style={{ width: '100%', marginBottom: '10px' }}>
                    <thead><tr>{Array.from({ length: doble ? 2 : 1 }, (_, i) => <React.Fragment key={i}>
                        <th style={{ width: '36px' }}>Nº</th><th>{contexto.columna || 'Datos'}</th>
                    </React.Fragment>)}</tr></thead>
                    <tbody>{Array.from({ length: mitad }, (_, i) => <tr key={i}>
                        {(doble ? [i, i + mitad] : [i]).map(indice => <React.Fragment key={indice}>
                            <td style={{ ...celda, fontWeight: 'bold' }}>{indice < observaciones.length ? indice + 1 : ''}</td>
                            <td style={celda}>{observaciones[indice] ?? ''}</td>
                        </React.Fragment>)}
                    </tr>)}</tbody>
                </table>
            </div>
        </div>
    );
}

function DistribucionDiscretaPDF({ datos }) {
    const { modelo, params = {}, resultados = {}, condicion, contextoMatriz = {} } = datos;
    const formulas = formulasModelo(modelo, params);
    if (!formulas) return null;
    const esManual = datos.modo === 'manual';
    const contexto = contextoMatriz || {};
    const estadisticas = contexto.estadisticas;
    const nombre = modelo === 'Hipergeometrica' ? 'Hipergeométrica' : modelo;
    const objetivo = condicionLatex(condicion);
    const tieneGrafico = Array.isArray(datos.datosGrafico) && datos.datosGrafico.length > 0;
    const nombresParametros = { p: 'Probabilidad de éxito', n: modelo === 'Binomial' ? 'Número de ensayos' : 'Tamaño de muestra', lambda: 'Tasa media de ocurrencias', N: 'Tamaño de población', K: 'Éxitos en la población' };
    return (
        <div className="pdf-modelos-discretos" style={{ width: '100%' }}>
            <div className="pdf-section">
                <h2 style={{ fontSize: '12pt', color: '#000000', margin: '0 0 4px', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>DISTRIBUCIÓN {nombre}</h2>
                <div style={{ textAlign: 'center', fontSize: '10pt', margin: '0 0 14px' }}><strong>Modo de Ejecución:</strong> {esManual ? 'Modo Manual' : 'Análisis de Matriz'}</div>
                {!esManual && <div style={{ fontSize: '9pt', lineHeight: '1.6', marginBottom: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                    <div><strong>Variable Analizada:</strong> {contexto.nombreVariable || 'Variable activa'}</div>
                    {contexto.cantidadColumnas > 1 && <div><strong>Columna Evaluada:</strong> {contexto.columna}</div>}
                    <div><strong>Observaciones:</strong> {contexto.observaciones?.length ?? '—'}</div>
                    {modelo !== 'Poisson' && !(modelo === 'Binomial' && contexto.modoEstimacion === 'lote') && <div><strong>Valor de Éxito:</strong> {contexto.valorExito ?? '—'}</div>}
                    {modelo === 'Binomial' && <div><strong>Estimación:</strong> {contexto.modoEstimacion === 'lote' ? 'Conteos por lote' : 'Valor específico'}</div>}
                </div>}
            </div>
            {!esManual && <DatosMatrizPDF contexto={contexto} />}
            {!esManual && estadisticas && <div className="pdf-section" style={centrado}>
                <div style={titulo}>Estimación de Parámetros desde la Matriz</div>
                {modelo === 'Poisson'
                    ? <MathSpan math={`\\lambda = \\frac{\\sum x_i}{m} = \\frac{${numeroLatex(estadisticas.suma)}}{${numeroLatex(estadisticas.total)}} = ${formato(estadisticas.media)}`} display />
                    : modelo === 'Hipergeometrica'
                        ? <MathSpan math={`N = ${params.N}, \\qquad K = ${params.K}, \\qquad n = ${params.n}`} display />
                        : <MathSpan math={`p = \\frac{\\text{Éxitos}}{\\text{Total de ensayos}} = \\frac{${numeroLatex(estadisticas.exitos)}}{${numeroLatex(estadisticas.total)}} = ${formato(estadisticas.p)}`} display />}
            </div>}
            <div className="pdf-section" data-pdf-divisible="filas">
                <div style={{ fontSize: '9pt', fontWeight: 'bold', marginBottom: '4px' }}>Parámetros de la Distribución</div>
                <table style={{ width: '100%', marginBottom: '12px' }}>
                    <thead><tr><th>Parámetro</th><th>Descripción</th><th>Valor</th></tr></thead>
                    <tbody>{Object.entries(params).map(([clave, valor]) => <tr key={clave}>
                        <td style={celda}><MathSpan math={clave === 'lambda' ? '\\lambda' : clave} /></td><td style={celda}>{nombresParametros[clave] || clave}</td><td style={celda}><MathSpan math={numeroLatex(valor)} /></td>
                    </tr>)}</tbody>
                </table>
            </div>
            <div className="pdf-section" style={centrado}>
                <div style={titulo}>Función de Probabilidad</div>
                <MathSpan math={`P(X=x) = ${formulas.masa}`} display />
                <MathSpan math={formulas.soporte} />
            </div>
            <div className="pdf-section" style={centrado}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', alignItems: 'start' }}>
                    <div><div style={titulo}>Esperanza Matemática</div>
                        <MathSpan math={`E(X) = ${formulas.esperanza}`} display />
                        <MathSpan math={`\\begin{aligned}E(X) &= ${formulas.esperanzaValores} \\\\[3pt] &= \\mathbf{${formato(resultados.esperanza)}}\\end{aligned}`} display />
                    </div>
                    <div><div style={titulo}>Varianza</div>
                        <MathSpan math={`V(X) = ${formulas.varianza}`} display />
                        <MathSpan math={`\\begin{aligned}V(X) &= ${formulas.varianzaValores} \\\\[3pt] &= \\mathbf{${formato(resultados.varianza)}}\\end{aligned}`} display />
                    </div>
                    <div><div style={titulo}>Desviación Estándar</div>
                        <MathSpan math="\sigma = \sqrt{V(X)}" display />
                        <MathSpan math={`\\begin{aligned}\\sigma &= \\sqrt{${formato(resultados.varianza)}} \\\\[3pt] &= \\mathbf{${formato(resultados.desviacion)}}\\end{aligned}`} display />
                    </div>
                </div>
            </div>
            {(tieneGrafico || objetivo) && <div className="pdf-section" style={centrado}>
                {objetivo && <div style={{ marginBottom: '4px' }}><strong>Condición de Búsqueda:</strong> <MathSpan math={objetivo} /></div>}
                {tieneGrafico && <>
                    <div style={{ ...titulo, margin: '8px 0 4px' }}>Gráfico de Bastones <MathSpan math="P(X=x)" /></div>
                    <GraficoBastonesModelos datos={datos.datosGrafico} condicion={condicion} resultados={resultados} modoPDF />
                </>}
            </div>}
            <DesarrolloProbabilidadPDF datos={datos} formulas={formulas} />
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════
   SECCIÓN 2: MODELOS CONTINUOS (UNIFICADOS EN ESTE ARCHIVO)
   ══════════════════════════════════════════════════════════════════ */

function DatosContinuosPDF({ grupo, tituloGrupo }) {
    const valores = grupo.observaciones || [];
    if (!valores.length) return null;
    const doble = valores.length > 15;
    const mitad = doble ? Math.ceil(valores.length / 2) : valores.length;
    return (
        <div className="pdf-section" data-pdf-divisible="filas">
            <div style={{ fontSize: '9pt', fontWeight: 'bold', marginBottom: '4px' }}>{tituloGrupo} ({valores.length} registros):</div>
            <div style={{ width: doble ? '100%' : '70%', margin: '0 auto' }}>
                <table className="tabla-datos-pdf" style={{ width: '100%', marginBottom: '10px' }}>
                    <thead><tr>{Array.from({ length: doble ? 2 : 1 }, (_, i) => <React.Fragment key={i}><th style={{ width: '36px' }}>Nº</th><th>{grupo.columna || 'Datos'}</th></React.Fragment>)}</tr></thead>
                    <tbody>{Array.from({ length: mitad }, (_, i) => <tr key={i}>
                        {(doble ? [i, i + mitad] : [i]).map(indice => <React.Fragment key={indice}>
                            <td style={{ ...celda, fontWeight: 'bold' }}>{indice < valores.length ? indice + 1 : ''}</td><td style={celda}>{valores[indice] ?? ''}</td>
                        </React.Fragment>)}
                    </tr>)}</tbody>
                </table>
            </div>
        </div>
    );
}

function EstimacionContinuaPDF({ modelo, contexto }) {
    const s = contexto.estadisticas;
    if (!s) return null;
    const filas = [];
    if (modelo === 'Uniforme') filas.push(`a=\\min(x_i)=${numeroContinuo(s.min)},\\qquad b=\\max(x_i)=${numeroContinuo(s.max)}`);
    if (modelo === 'Normal') {
        const suma = (contexto.observaciones || []).reduce((total, valor) => total + valor, 0);
        filas.push(`\\widehat\\mu=\\frac{\\sum x_i}{m}=\\frac{${numeroContinuo(suma)}}{${numeroContinuo(s.total)}}=${decimalContinuo(s.media)}`);
        filas.push(`s=\\sqrt{\\frac{\\sum(x_i-\\overline{x})^2}{m-1}}=${decimalContinuo(s.desviacion)}`);
    }
    if (modelo === 'ChiCuadrado') filas.push(`k=m-1=${s.total}-1=${s.n}`);
    if (modelo === 'TStudent') filas.push(`\\nu=m-1=${s.total}-1=${s.n}`);
    if (modelo === 'FFisher') {
        filas.push(`v_1=m_1-1=${s.total1}-1=${s.v1}`);
        filas.push(`v_2=m_2-1=${s.total2}-1=${s.v2}`);
    }
    return (
        <div className="pdf-section" style={centrado} data-pdf-divisible="formulas">
            <div style={titulo}>Estimación de Parámetros desde la Matriz</div>
            <MathPDF math={alineado(filas)} display />
        </div>
    );
}

function DesarrolloContinuoPDF({ desarrollo, modelo, condicion, params, resultados }) {
    if (!desarrollo) return null;
    const { config, inversa, filas, regiones, cuantiles, probabilidad } = desarrollo;
    const usaResolucionWeb = Boolean(modelo && condicion && params && resultados);
    const mostrarDesglose = ['entre', 'intervalo', 'intervalo_estricto', 'exterior', 'suma_intervalos'].includes(condicion?.tipo) && regiones.length > 1;
    const condicionRegion = region => {
        const variable = config.variable;
        if (!Number.isFinite(region.inferior)) return `${variable}\\leq ${numeroContinuo(region.superior)}`;
        if (!Number.isFinite(region.superior)) return `${variable}\\geq ${numeroContinuo(region.inferior)}`;
        return `${numeroContinuo(region.inferior)}\\leq ${variable}\\leq ${numeroContinuo(region.superior)}`;
    };
    return <>
        {usaResolucionWeb ? (
            <Resultados_ModelosContinuos resultados={resultados} modelo={modelo} condicion={condicion} params={params} modoPDF />
        ) : (
            <div className="pdf-section" style={centrado} data-pdf-divisible="formulas">
                <div style={titulo}>{inversa ? 'Desarrollo del Cálculo Inverso' : 'Desarrollo de la Probabilidad Calculada'}</div>
                {!inversa && <MathPDF math={`${config.acumulada}(u)=\\int_{-\\infty}^{u}f(x)\\,dx`} display />}
                <MathPDF math={alineado(filas)} display />
            </div>
        )}
        {mostrarDesglose && <div className="pdf-section" data-pdf-divisible="filas">
            <div style={{ ...titulo, textAlign: 'left' }}>Desglose de las Áreas Evaluadas</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th>Condición evaluada</th><th>Acumulada inicial</th><th>Acumulada final</th><th>Probabilidad</th></tr></thead>
                <tbody>{regiones.map((r, i) => <tr key={i}>
                    <td style={celda}><MathPDF math={condicionRegion(r)} /></td>
                    <td style={celda}>{decimalContinuo(r.cdfInferior)}</td><td style={celda}>{decimalContinuo(r.cdfSuperior)}</td><td style={celda}>{decimalContinuo(r.probabilidad)}</td>
                </tr>)}</tbody>
            </table>
        </div>}
        {cuantiles.length > 0 && <div className="pdf-section" data-pdf-divisible="filas">
            <div style={{ ...titulo, textAlign: 'left' }}>Cuantiles Encontrados</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th>Cuantil</th><th>Probabilidad acumulada buscada</th><th>Valor encontrado</th><th>Acumulada del valor</th></tr></thead>
                <tbody>{cuantiles.map(c => <tr key={c.etiqueta}>
                    <td style={celda}><MathPDF math={c.etiqueta} /></td><td style={celda}>{decimalContinuo(c.q)}</td><td style={celda}>{decimalContinuo(c.valor)}</td><td style={celda}>{decimalContinuo(c.acumulada)}</td>
                </tr>)}</tbody>
            </table>
        </div>}
        {!usaResolucionWeb && <div className="pdf-section" style={centrado}>
            <div style={titulo}>Probabilidad {inversa ? 'Solicitada' : 'Calculada'}</div>
            <MathPDF math={`\\mathbf{${decimalContinuo(probabilidad)}}\\quad\\Longleftrightarrow\\quad\\mathbf{${decimalContinuo(probabilidad * 100)}\\%}`} display />
        </div>}
    </>;
}

function DistribucionContinuaPDF({ datos }) {
    const { modelo, resultados = {}, condicion, contextoMatriz } = datos;
    const config = modeloContinuoPDF(modelo, datos.params || {});
    if (!config) return null;
    const { params, variable: Y } = config;
    const desarrollo = desarrolloContinuoPDF(modelo, params, condicion, resultados);
    const estandar = modelo === 'NormalEstandar';
    const matriz = !estandar && datos.modo === 'matriz';
    const contexto = contextoMatriz || {};
    const grupos = contexto.grupos || [contexto];
    const simbolos = { a: 'a', b: 'b', mu: '\\mu', sigma: '\\sigma', k: 'k', v1: 'v_1', v2: 'v_2', n: '\\nu' };
    const descripciones = { a: 'Extremo inferior', b: 'Extremo superior', mu: 'Media', sigma: 'Desviación estándar', k: 'Grados de libertad', v1: 'Grados de libertad del numerador', v2: 'Grados de libertad del denominador', n: 'Grados de libertad' };
    const desviacion = Number.isFinite(resultados.varianza) && resultados.varianza >= 0 ? Math.sqrt(resultados.varianza) : undefined;
    const medidas = [
        { titulo: 'Esperanza Matemática', simbolo: `E(${Y})`, formula: config.esperanza, valores: config.esperanzaValores, resultado: resultados.esperanza, restriccion: config.restriccionEsperanza },
        { titulo: 'Varianza', simbolo: `V(${Y})`, formula: config.varianza, valores: config.varianzaValores, resultado: resultados.varianza, restriccion: config.restriccionVarianza },
        { titulo: 'Desviación Estándar', simbolo: '\\sigma', formula: `\\sqrt{V(${Y})}`, valores: Number.isFinite(desviacion) ? `\\sqrt{${decimalContinuo(resultados.varianza)}}` : '\\text{No definida}', resultado: desviacion }
    ];
    return (
        <div className="pdf-modelos-continuos" style={{ width: '100%' }}>
            <div className="pdf-section">
                <h2 style={{ fontSize: '12pt', color: '#000000', margin: '0 0 4px', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>DISTRIBUCIÓN {config.nombre}</h2>
                {!estandar && <div style={{ textAlign: 'center', fontSize: '10pt', margin: '0 0 14px' }}><strong>Modo de Ejecución:</strong> {matriz ? 'Análisis de Matriz' : 'Modo Manual'}</div>}
                {estandar && <div style={{ textAlign: 'center', margin: '0 0 14px' }}><MathPDF math="\mu=0,\qquad\sigma=1" /></div>}
                {matriz && <div style={{ fontSize: '9pt', lineHeight: '1.6', marginBottom: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                    <div><strong>Variable Analizada:</strong> {contexto.nombreVariable || 'Variable activa'}</div>
                    {modelo === 'FFisher' ? grupos.map((g, i) => <div key={i}><strong>Grupo {i + 1}:</strong> {g.columna} ({g.observaciones?.length ?? 0} registros)</div>) : <>
                        {contexto.cantidadColumnas > 1 && <div><strong>Columna Evaluada:</strong> {contexto.columna}</div>}
                        <div><strong>Observaciones:</strong> {contexto.observaciones?.length ?? '—'}</div>
                    </>}
                </div>}
            </div>
            {matriz && grupos.map((grupo, i) => <DatosContinuosPDF key={i} grupo={grupo} tituloGrupo={modelo === 'FFisher' ? `Datos Analizados del Grupo ${i + 1}` : 'Datos Analizados de la Matriz'} />)}
            {matriz && <EstimacionContinuaPDF modelo={modelo} contexto={contexto} />}
            <div className="pdf-section" data-pdf-divisible="filas">
                <div style={{ fontSize: '9pt', fontWeight: 'bold', marginBottom: '4px' }}>Parámetros de la Distribución</div>
                <table style={{ width: '100%', marginBottom: '12px' }}>
                    <thead><tr><th>Parámetro</th><th>Descripción</th><th>Valor</th></tr></thead>
                    <tbody>{Object.entries(params).map(([nombre, valor]) => <tr key={nombre}>
                        <td style={celda}><MathPDF math={simbolos[nombre] || nombre} /></td><td style={celda}>{descripciones[nombre] || nombre}</td><td style={celda}><MathPDF math={numeroContinuo(valor)} /></td>
                    </tr>)}</tbody>
                </table>
            </div>
            <div className="pdf-section" style={centrado}>
                <div style={titulo}>{modelo === 'Uniforme' ? 'Función de Densidad - Distribución Uniforme' : 'Función de Densidad de Probabilidad'}</div>
                <MathPDF math={config.densidad} display />
                {config.soporte && <MathPDF math={config.soporte} />}
            </div>
            <div className="pdf-section" style={centrado}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: '12px', alignItems: 'start' }}>
                    {medidas.map(m => <div key={m.titulo}>
                        <div style={titulo}>{m.titulo}</div>
                        <MathPDF math={`${m.simbolo}=${m.formula}`} display />
                        {m.restriccion && <MathPDF math={m.restriccion} />}
                        <MathPDF math={alineado([`${m.simbolo}=${m.valores}`, `=\\mathbf{${decimalContinuo(m.resultado)}}`])} display />
                    </div>)}
                </div>
            </div>
            {Array.isArray(datos.datosGrafico) && datos.datosGrafico.length > 0 && <div className="pdf-section" style={{ ...centrado, paddingTop: '12px' }}>
                {desarrollo && <div style={{ marginBottom: '4px' }}><strong>Condición de Búsqueda:</strong> <MathPDF math={desarrollo.objetivo} /></div>}
                <div style={{ ...titulo, margin: '8px 0 4px' }}>Gráfica de Densidad de Probabilidad</div>
                <GraficoModelosContinuos datos={datos.datosGrafico} condicion={condicion} resultados={resultados} modelo={modelo} modoPDF />
            </div>}
            <DesarrolloContinuoPDF
                desarrollo={desarrollo}
                modelo={modelo}
                condicion={condicion}
                params={params}
                resultados={resultados}
            />
        </div>
    );
}


/* ══════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL REPORTE TEMA 3
   ══════════════════════════════════════════════════════════════════ */

export default function ReportePDF_Tema3({
    operacion,
    datosTema3,
    datosTema3Continuos
}) {
    const esDiscreta = operacion === 'Distribuciones_Discretas' || operacion === 'discretas' || operacion === 'distribuciones_discretas' || operacion === 'modelos_discretos';
    const esContinua = operacion === 'Distribuciones_Continuas' || operacion === 'continuas' || operacion === 'distribuciones_continuas' || operacion === 'modelos_continuos';

    return (
        <div id="pdf-cuerpo-tema3">
            <style>{`
                #reporte-formal-mat251 #pdf-cuerpo-tema3 .pdf-modelos-continuos > .pdf-section {
                    margin-bottom: 12px !important;
                }
                #reporte-formal-mat251 #pdf-cuerpo-tema3 :is(.pdf-modelos-discretos, .pdf-modelos-continuos) .recharts-cartesian-axis-tick-value,
                #reporte-formal-mat251 #pdf-cuerpo-tema3 :is(.pdf-modelos-discretos, .pdf-modelos-continuos) .recharts-cartesian-axis-tick-value tspan {
                    font-size: 7pt !important;
                }
                #reporte-formal-mat251 #pdf-cuerpo-tema3 :is(.pdf-modelos-discretos, .pdf-modelos-continuos) .katex-display {
                    margin: 4px 0 !important;
                    padding: 0 !important;
                }
                #reporte-formal-mat251 #pdf-cuerpo-tema3 :is(.pdf-modelos-discretos, .pdf-modelos-continuos) .katex {
                    padding: 0 !important;
                }
                #reporte-formal-mat251 #pdf-cuerpo-tema3 .katex .hide-tail {
                    overflow: hidden !important;
                }
            `}</style>
            {esDiscreta && datosTema3 && <DistribucionDiscretaPDF datos={datosTema3} />}

            {esContinua && datosTema3Continuos && <DistribucionContinuaPDF datos={datosTema3Continuos} />}
        </div>
    );
}
