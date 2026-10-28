import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DndContext } from '@dnd-kit/core';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import Grafica_IntervalosMatriz from '../../../Graficas/Tema_5/Grafica_IntervalosMatriz';
import Grafica_IntervalosProporcion from '../../../Graficas/Tema_5/Grafica_IntervalosProporcion';
import Grafica_IntervalosVarianza from '../../../Graficas/Tema_5/Grafica_IntervalosVarianza';

const titulo = { textAlign: 'center', fontWeight: 'bold', margin: '6px 0' };
const parametros = {
    media: { nombre: 'Media', parametro: '\\mu', estimador: '\\bar{X}' },
    proporcion: { nombre: 'Proporción', parametro: 'p', estimador: '\\hat{p}' },
    varianza: { nombre: 'Varianza', parametro: '\\sigma^2', estimador: 'S^2' }
};
const decimal = (valor, cifras = 4) => Number.isFinite(valor) ? (Math.abs(valor) < 0.5 * 10 ** -cifras ? 0 : valor).toFixed(cifras) : '—';
const dato = valor => typeof valor === 'number' ? Number.isInteger(valor) ? String(valor) : decimal(valor, 2) : String(valor ?? '');
const MathPDF = ({ math, display = false }) => display ? (
    <div style={{ display: 'block', textAlign: 'center', overflow: 'visible', paddingTop: '4px', paddingBottom: '10px' }} dangerouslySetInnerHTML={{ __html: katex.renderToString(math || '', { throwOnError: false, displayMode: true }) }} />
) : (
    <span style={{ display: 'inline-block', overflow: 'visible', verticalAlign: 'middle', paddingBottom: '2px' }} dangerouslySetInnerHTML={{ __html: katex.renderToString(math || '', { throwOnError: false, displayMode: false }) }} />
);

function EncabezadoPDF({ datos, intervalo }) {
    const config = parametros[datos.parametro];
    return <div className="pdf-section">
        <h2 style={{ ...titulo, marginTop: 0, textTransform: 'uppercase' }}>{intervalo ? 'Estimación por Intervalos de Confianza' : 'Estimación Puntual'}</h2>
        <div style={{ ...titulo, fontWeight: 'normal' }}><strong>Parámetro:</strong> {config.nombre} <MathPDF math={config.parametro} />{intervalo && datos.parametro === 'media' && <> - Desviación estándar poblacional {datos.resultados.sigmaConocida ? 'conocida' : 'desconocida'}</>}</div>
        <div style={{ textAlign: 'center', marginBottom: '8px' }}><strong>Modo de Ejecución:</strong> {datos.modo === 'matriz' ? 'Análisis de Matriz' : 'Modo Manual'}</div>
        {datos.modo === 'matriz' && <div><strong>Variable Analizada:</strong> {datos.nombreVariable || 'Variable seleccionada'}</div>}
    </div>;
}

function DatosMatrizPDF({ valores, valorExito }) {
    if (!valores?.length) return null;
    const doble = valores.length > 15;
    const mitad = doble ? Math.ceil(valores.length / 2) : valores.length;
    return <div className="pdf-section" data-pdf-divisible="filas">
        <div style={titulo}>Datos Analizados de la Matriz ({valores.length} registros)</div>
        {valorExito !== undefined && <div style={{ marginBottom: '4px' }}><strong>Dato a contabilizar:</strong> {String(valorExito)}</div>}
        <table className="tabla-datos-pdf"><thead><tr>{[0, ...(doble ? [1] : [])].map(i => <React.Fragment key={i}><th>i</th><th><MathPDF math="x_i" /></th></React.Fragment>)}</tr></thead>
            <tbody>{Array.from({ length: mitad }, (_, i) => <tr key={i}>{[i, ...(doble ? [i + mitad] : [])].map(j => <React.Fragment key={j}><td>{j < valores.length ? j + 1 : ''}</td><td>{j < valores.length ? dato(valores[j]) : ''}</td></React.Fragment>)}</tr>)}</tbody>
        </table>
    </div>;
}

function PuntualPDF({ datos }) {
    const r = datos.resultados;
    const p = datos.parametro;
    const c = r.calculos || {};
    const valores = datos.modo === 'matriz' && Array.isArray(c.numDatos) ? c.numDatos : null;
    const suma = valores && p !== 'proporcion' ? valores.reduce((a, b) => a + b, 0) : c.suma;
    const sumaDesviaciones = valores && p === 'varianza' ? valores.reduce((a, b) => a + (b - c.media) ** 2, 0) : null;
    const columnas = [['n', String(r.n)]];
    if (p === 'media') columnas.push(['\\sum X_i', decimal(c.suma, 2)], ['S', decimal(c.desviacion, 2)], ['\\hat{\\mu}', decimal(r.estimacion, 2)]);
    if (p === 'proporcion') columnas.push(['x', String(c.x)], ['\\hat{p}', `${decimal(r.estimacion, 2)}\\;(${decimal(r.estimacion * 100, 2)}\\%)`]);
    if (p === 'varianza') {
        if (datos.modo === 'matriz') columnas.push(['\\bar{X}', decimal(c.media, 2)]);
        columnas.push(['S', decimal(c.desviacion, 2)], [datos.modo === 'matriz' ? 'S^2' : '\\hat{\\sigma}^2', decimal(r.estimacion, 2)]);
    }
    const formula = p === 'media'
        ? `\\bar{X}=\\frac{\\sum x_i}{n}=\\frac{${decimal(suma, 2)}}{${valores?.length || r.n}}=\\mathbf{${decimal(r.estimacion, 2)}}`
        : p === 'proporcion'
            ? `\\hat{p}=\\frac{x}{n}=\\frac{${c.x}}{${r.n}}=\\mathbf{${decimal(r.estimacion, 2)}}\\quad(\\mathbf{${decimal(r.estimacion * 100, 2)}\\%})`
            : valores ? `S^2=\\frac{\\sum(x_i-\\bar{X})^2}{n-1}=\\frac{${decimal(sumaDesviaciones, 2)}}{${valores.length}-1}=\\mathbf{${decimal(r.estimacion, 2)}}`
                : `\\hat{\\sigma}^2=S^2=\\mathbf{${decimal(r.estimacion, 2)}}`;
    return <>
        <div className="pdf-section" data-pdf-divisible="filas"><table><thead><tr>{columnas.map(([s]) => <th key={s}><MathPDF math={s} /></th>)}</tr></thead><tbody><tr>{columnas.map(([s, v]) => <td key={s}><MathPDF math={v} /></td>)}</tr></tbody></table></div>
        {valores && <div className="pdf-section" data-pdf-divisible="filas">
            <div style={titulo}>Desarrollo paso a paso de la {p === 'media' ? 'media' : p === 'varianza' ? 'varianza' : 'proporción'} muestral</div>
            {p === 'proporcion' && <div style={{ marginBottom: '4px' }}><strong>Dato a contabilizar:</strong> {String(c.valorExito)}</div>}
            <table className="pdf-t5-datos-puntuales"><thead><tr><th>i</th><th><MathPDF math="x_i" /></th>{p === 'varianza' && <><th><MathPDF math={'x_i-\\bar{X}'} /></th><th><MathPDF math={'(x_i-\\bar{X})^2'} /></th></>}{p === 'proporcion' && <th><MathPDF math="I_i" /></th>}</tr></thead>
                <tbody>{valores.map((valor, i) => <tr key={i}><td>{i + 1}</td><td>{dato(valor)}</td>{p === 'varianza' && <><td>{decimal(valor - c.media, 2)}</td><td>{decimal((valor - c.media) ** 2, 2)}</td></>}{p === 'proporcion' && <td>{String(valor).trim() === String(c.valorExito).trim() ? 1 : 0}</td>}</tr>)}
                    <tr><td><MathPDF math={'\\boldsymbol{\\sum}'} /></td><td>{p === 'proporcion' ? '' : decimal(suma, 2)}</td>{p === 'varianza' && <><td>0.00</td><td>{decimal(sumaDesviaciones, 2)}</td></>}{p === 'proporcion' && <td>{c.x}</td>}</tr>
                </tbody>
            </table>
        </div>}
        <div className="pdf-section" style={{ textAlign: 'center', paddingBottom: '12px' }}><div style={titulo}>Resultado final</div><MathPDF math={formula} display /></div>
    </>;
}

const textoSVG = formula => formula.replace(/\\bar\{X\}/g, 'X̄').replace(/\\hat\{p\}/g, 'p̂')
    .replace(/\\(?:boldsymbol|mathbf|mathrm|left|right|,|;|!)/g, '').replace(/\\times/g, '×')
    .replace(/\^\{(-?\d+)\}/g, (_, n) => [...n].map(d => d === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join(''))
    .replace(/_\{?(\d+)\}?/g, (_, n) => [...n].map(d => '₀₁₂₃₄₅₆₇₈₉'[+d]).join('')).replace(/\^2/g, '²').replace(/[{}]/g, '');

// La gráfica web aporta la curva y la regla del intervalo. Para el PDF sus
// etiquetas HTML se convierten a SVG nativo, manteniendo números de ejes a 7 pt.
function GraficaIntervaloPDF({ resultados, parametro }) {
    const origen = useRef(null);
    const [contenedor, setContenedor] = useState(null);
    const [graficas, setGraficas] = useState([]);
    const prefijo = useId().replace(/[^a-z0-9]/gi, '');
    const Grafico = parametro === 'media' ? Grafica_IntervalosMatriz : parametro === 'proporcion' ? Grafica_IntervalosProporcion : Grafica_IntervalosVarianza;
    useEffect(() => {
        const nodo = document.createElement('div');
        nodo.className = 'mat251 pdf-t5-origen';
        nodo.setAttribute('aria-hidden', 'true');
        document.body.appendChild(nodo);
        setContenedor(nodo);
        return () => nodo.remove();
    }, []);
    useEffect(() => {
        if (!contenedor || !origen.current) return;
        let frame;
        const copiar = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const originales = [...(origen.current?.querySelectorAll('svg.recharts-surface') || [])];
                if (originales.length < 2) return;
                const copias = originales.map((original, indice) => {
                    const svg = original.cloneNode(true);
                    svg.querySelectorAll('foreignObject').forEach(nodo => {
                        const lineas = [...nodo.querySelectorAll('annotation')].map(n => textoSVG(n.textContent));
                        if (!lineas.length) lineas.push(nodo.textContent.trim());
                        const x = (parseFloat(nodo.getAttribute('x')) || 0) + (parseFloat(nodo.getAttribute('width')) || 0) / 2;
                        const y = (parseFloat(nodo.getAttribute('y')) || 0) + (parseFloat(nodo.getAttribute('height')) || 0) / 2 + 4 - (lineas.length - 1) * 6;
                        const texto = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        texto.setAttribute('text-anchor', 'middle');
                        texto.setAttribute('fill', '#000000');
                        texto.setAttribute('font-size', '11');
                        texto.setAttribute('y', Math.max(12, y));
                        lineas.forEach((linea, i) => {
                            const span = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                            span.setAttribute('x', Math.max(58, Math.min(582, x)));
                            span.setAttribute('dy', i ? 13 : 0);
                            span.textContent = linea;
                            texto.appendChild(span);
                        });
                        nodo.replaceWith(texto);
                    });
                    svg.querySelectorAll('.recharts-cartesian-axis-tick-value,.recharts-cartesian-axis-tick-value tspan').forEach(n => n.style.setProperty('font-size', '7pt', 'important'));
                    svg.querySelectorAll('*').forEach(n => {
                        for (const atributo of ['stroke', 'fill']) if (n.getAttribute(atributo)?.includes('var(')) n.setAttribute(atributo, '#000000');
                    });
                    const ids = [...svg.querySelectorAll('[id]')].map(n => n.id);
                    let markup = svg.outerHTML;
                    ids.forEach(id => { markup = markup.replaceAll(id, `${prefijo}-${indice}-${id}`); });
                    return markup;
                });
                setGraficas(prev => JSON.stringify(prev) === JSON.stringify(copias) ? prev : copias);
            });
        };
        const observer = new MutationObserver(copiar);
        observer.observe(origen.current, { childList: true, subtree: true, attributes: true });
        copiar();
        return () => { observer.disconnect(); cancelAnimationFrame(frame); };
    }, [contenedor, prefijo, resultados, parametro]);
    return <>
        {contenedor && createPortal(<DndContext><div ref={origen}><Grafico resultados={resultados} parametro={parametro} /></div></DndContext>, contenedor)}
        <div style={{ width: '640px', maxWidth: '100%', margin: '0 auto', minHeight: graficas.length ? undefined : '350px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', marginBottom: '4px' }}>
                <span><span className="pdf-t5-leyenda" style={{ background: '#3b82f6' }} /> Nivel de Confianza ({resultados.confianza}%)</span>
                <span><span className="pdf-t5-leyenda" style={{ background: '#ef4444' }} /> Riesgo / Colas ({decimal(100 - resultados.confianza, 1)}%)</span>
            </div>
            {graficas.map((svg, i) => <div className="pdf-t5-svg" key={i} style={{ marginTop: i ? '-15px' : undefined }} dangerouslySetInnerHTML={{ __html: svg }} />)}
        </div>
    </>;
}

function IntervaloPDF({ datos }) {
    const r = datos.resultados;
    const p = datos.parametro;
    const config = parametros[p];
    const puntual = r.puntual || { estimacion: p === 'media' ? r.x_bar : p === 'proporcion' ? r.p_hat : r.s2 };
    const estimacion = puntual.estimacion;
    const normal = r.metodo?.includes('Z');
    const critico = normal ? 'Z' : 'T';
    const dispersion = r.sigmaConocida ? '\\sigma' : 'S';
    const s = r.s_or_sigma ?? (r.margenError / r.valorCritico * Math.sqrt(r.n));
    const resumen = [
        ['Tamaño de Muestra', `n=${r.n}`],
        ['Estimador Puntual', `${config.estimador}=${decimal(estimacion)}`],
        ['Nivel de Confianza', `${r.confianza}\\%`]
    ];
    const criticos = p === 'varianza'
        ? `\\chi^2_{sup}=${decimal(Math.max(r.criticoInf, r.criticoSup))},\\quad\\chi^2_{inf}=${decimal(Math.min(r.criticoInf, r.criticoSup))}`
        : `${critico}=${decimal(r.valorCritico)}`;
    const filas = [];
    if (p === 'varianza') {
        const superior = decimal(Math.max(r.criticoInf, r.criticoSup));
        const inferior = decimal(Math.min(r.criticoInf, r.criticoSup));
        filas.push(
            ['Fórmula del intervalo', 'IC=\\left[\\frac{(n-1)S^2}{\\chi^2_{sup}},\\frac{(n-1)S^2}{\\chi^2_{inf}}\\right]'],
            ['Cálculo del intervalo', `IC=\\left[\\frac{(${r.n}-1)(${decimal(estimacion)})}{${superior}},\\frac{(${r.n}-1)(${decimal(estimacion)})}{${inferior}}\\right]`],
            ['Límite inferior', `LI=\\frac{(${r.n}-1)(${decimal(estimacion)})}{${superior}}=\\mathbf{${decimal(r.LI)}}`],
            ['Límite superior', `LS=\\frac{(${r.n}-1)(${decimal(estimacion)})}{${inferior}}=\\mathbf{${decimal(r.LS)}}`]
        );
    } else {
        const formula = p === 'proporcion' ? '\\hat{p}\\pm Z_{\\alpha/2}\\sqrt{\\frac{\\hat{p}(1-\\hat{p})}{n}}' : `\\bar{X}\\pm ${critico}_{\\alpha/2}\\frac{${dispersion}}{\\sqrt{n}}`;
        const numerica = p === 'proporcion'
            ? `${decimal(estimacion)}\\pm${decimal(r.valorCritico)}\\sqrt{\\frac{${decimal(estimacion)}(1-${decimal(estimacion)})}{${r.n}}}`
            : `${decimal(estimacion)}\\pm${decimal(r.valorCritico)}\\left(\\frac{${decimal(s)}}{\\sqrt{${r.n}}}\\right)`;
        filas.push(
            ['Fórmula del intervalo', `IC=${formula}`], ['Cálculo del intervalo', `IC=${numerica}`],
            ['Margen de error', `E=\\mathbf{${decimal(r.margenError)}}`],
            ['Límite inferior', `LI=${config.estimador}-E=${decimal(estimacion)}-${decimal(r.margenError)}=\\mathbf{${decimal(r.LI)}}`],
            ['Límite superior', `LS=${config.estimador}+E=${decimal(estimacion)}+${decimal(r.margenError)}=\\mathbf{${decimal(r.LS)}}`]
        );
    }
    filas.push(
        ['Intervalo de confianza', `IC=[\\,\\mathbf{${decimal(r.LI)}}\\,,\\,\\mathbf{${decimal(r.LS)}}\\,]`],
        ['Interpretación', `P(\\mathbf{${decimal(r.LI)}}\\leq ${config.parametro}\\leq\\mathbf{${decimal(r.LS)}})=\\mathbf{${r.confianza / 100}}`]
    );
    const resultadoGrafico = { ...r, puntual };
    return <>
        {datos.modo === 'matriz' && <DatosMatrizPDF valores={puntual.calculos?.numDatos} valorExito={p === 'proporcion' ? puntual.calculos?.valorExito : undefined} />}
        <div className="pdf-section" data-pdf-divisible="filas"><table><tbody>
            <tr>{resumen.map(([nombre]) => <th colSpan={2} key={nombre}>{nombre}</th>)}</tr>
            <tr>{resumen.map(([nombre, valor]) => <td colSpan={2} key={nombre}><MathPDF math={valor} /></td>)}</tr>
            <tr><th colSpan={p === 'media' ? 3 : 6}>Valor Crítico - {r.metodo}</th>{p === 'media' && <th colSpan={3}>Desviación Estándar</th>}</tr>
            <tr><td colSpan={p === 'media' ? 3 : 6}><MathPDF math={criticos} /></td>{p === 'media' && <td colSpan={3}><MathPDF math={`${dispersion}=${decimal(s)}`} /></td>}</tr>
        </tbody></table></div>
        <div className="pdf-section" data-pdf-divisible="filas"><div style={titulo}>Desarrollo del intervalo de confianza</div>
            <table className="pdf-t5-desarrollo"><thead><tr><th>Detalle</th><th>Cálculo</th></tr></thead>
                <tbody>{filas.map(([nombre, formula]) => <tr key={nombre}><td>{nombre}</td><td><MathPDF math={formula} /></td></tr>)}</tbody>
            </table>
        </div>
        {r.LI < r.LS && <div className="pdf-section" style={{ textAlign: 'center' }}>
            <div style={titulo}>{p === 'varianza' ? `Gráfica de Confianza para Varianza (${r.confianza}%)` : `Gráfica de Confianza (${r.confianza}%)`}</div>
            <GraficaIntervaloPDF key={p} resultados={resultadoGrafico} parametro={p} />
        </div>}
    </>;
}

export default function ReportePDF_Tema5({ operacion, resultadoEstimacion }) {
    const datos = resultadoEstimacion;
    if (!datos?.resultados || datos.operacion !== operacion || !parametros[datos.parametro] || !['matriz', 'manual'].includes(datos.modo)) return null;
    const intervalo = operacion === 'Estimacion_intervalos';
    if (!intervalo && (operacion !== 'Estimacion_puntual' || (datos.parametro === 'media' && datos.modo !== 'matriz'))) return null;
    if (intervalo ? !Number.isFinite(datos.resultados.LI) || !Number.isFinite(datos.resultados.LS) : !Number.isFinite(datos.resultados.estimacion)) return null;
    return <div id="pdf-cuerpo-tema5">
        <style>{`
            #reporte-formal-mat251 #pdf-cuerpo-tema5 .pdf-section {margin-bottom:12px!important;}
            #reporte-formal-mat251 #pdf-cuerpo-tema5 table {width:100%;border-collapse:collapse;}
            #reporte-formal-mat251 #pdf-cuerpo-tema5 table.pdf-t5-datos-puntuales {width:auto!important;max-width:100%;margin-left:auto!important;margin-right:auto!important;table-layout:auto;}
            #reporte-formal-mat251 #pdf-cuerpo-tema5 .pdf-t5-datos-puntuales th,
            #reporte-formal-mat251 #pdf-cuerpo-tema5 .pdf-t5-datos-puntuales td {padding:4px 12px!important;}
            #reporte-formal-mat251 #pdf-cuerpo-tema5 .pdf-t5-datos-puntuales th:nth-child(2),
            #reporte-formal-mat251 #pdf-cuerpo-tema5 .pdf-t5-datos-puntuales td:nth-child(2) {padding-left:24px!important;padding-right:24px!important;}
            #reporte-formal-mat251 #pdf-cuerpo-tema5 td {text-align:center;}
            #reporte-formal-mat251 #pdf-cuerpo-tema5 .pdf-t5-desarrollo td:first-child {width:24%;}
            #reporte-formal-mat251 #pdf-cuerpo-tema5 .katex-display {margin:4px 0!important;padding-top:4px!important;padding-bottom:10px!important;overflow:visible!important;}
            #reporte-formal-mat251 #pdf-cuerpo-tema5 .katex {padding-top:2px!important;padding-bottom:6px!important;overflow:visible!important;}
            #reporte-formal-mat251 #pdf-cuerpo-tema5 .katex * {overflow:visible!important;}
            #reporte-formal-mat251 #pdf-cuerpo-tema5 .katex .hide-tail {overflow:hidden!important;}
            #reporte-formal-mat251 #pdf-cuerpo-tema5 .recharts-cartesian-axis-tick-value,
            #reporte-formal-mat251 #pdf-cuerpo-tema5 .recharts-cartesian-axis-tick-value tspan {font-size:7pt!important;}
            #reporte-formal-mat251 .pdf-t5-leyenda {display:inline-block;width:9px;height:9px;}
            .pdf-t5-origen {position:fixed;left:0;top:0;width:640px;height:350px;visibility:hidden;pointer-events:none;z-index:-1;--text-pure:#000;--text-main:#000;--text-muted:#000;--primary-color:#3b82f6;--bg-card:#fff;--border-color:#000;}
            .pdf-t5-origen .widget-grafico {width:640px!important;height:350px!important;margin:0!important;}
            .pdf-t5-origen .widget-header,.pdf-t5-origen .grafica-intervalos-legend {display:none!important;}
            .pdf-t5-origen .widget-body,.pdf-t5-origen .grafica-campana-container {min-height:0!important;}
            .pdf-t5-origen .contenedor-grafico-interno {top:0!important;left:0!important;right:0!important;bottom:0!important;}
        `}</style>
        <EncabezadoPDF datos={datos} intervalo={intervalo} />
        {intervalo ? <IntervaloPDF datos={datos} /> : <PuntualPDF datos={datos} />}
    </div>;
}
