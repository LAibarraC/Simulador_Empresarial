import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DndContext } from '@dnd-kit/core';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import GraficoProbabilidadMuestral from '../../../Graficas/Tema_4/GraficoProbabilidadMuestral';
import GraficoProporcion from '../../../Graficas/Tema_4/GraficoProporcion';
import GraficoChiCuadrada from '../../../Graficas/Tema_4/GraficoChiCuadrada';
import GraficoDiferenciaMedias from '../../../Graficas/Tema_4/GraficoDiferenciaMedias';
import GraficoDiferenciaProporciones from '../../../Graficas/Tema_4/GraficoDiferenciaProporciones';
import GraficoStudent from '../../../Graficas/Tema_4/GraficoStudent';
import GraficoFisher from '../../../Graficas/Tema_4/GraficoFisher';

const titulo = { fontWeight: 'bold', textAlign: 'center', margin: '6px 0' };
const aNumero = valor => {
    if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;
    if (typeof valor === 'string') {
        const limpia = valor.trim().replace(',', '.');
        if (limpia !== '') {
            const num = Number(limpia);
            return Number.isFinite(num) ? num : null;
        }
    }
    return null;
};
const numero = valor => {
    const num = aNumero(valor);
    return num !== null ? String(num).replace(/e([+-]?\d+)/i, '\\times10^{$1}') : '\\text{—}';
};
const decimal = (valor, cifras = 4) => {
    const num = aNumero(valor);
    return num !== null ? num.toFixed(cifras) : '—';
};
const MathPDF = ({ math, display = false }) => <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math || '', { throwOnError: false, displayMode: display }) }} />;
const alineado = filas => `\\begin{aligned}${filas.map(fila => `&${fila}`).join(' \\\\[6pt] ')}\\end{aligned}`;
const cadena = (simbolo, formula) => (formula || '').replace(/^\s*=\s*/, '').split(/\s*=\s*/).map((paso, i) => `${i ? '=' : `${simbolo}=`}${paso}`);

const espaciarFormula = latex => {
    if (!latex || typeof latex !== 'string') return latex;
    return latex.replace(/\\\\(?!\s*\[)/g, () => '\\\\[10pt]');
};

const normalizarDesarrollo = (latex, variable) => {
    if (!latex || typeof latex !== 'string') return latex;
    let res = latex;
    if (variable === '\\bar{X}_1-\\bar{X}_2') {
        res = res.replace(/\\bar\{X\}\s*-\s*\\bar\{Y\}/g, '\\bar{X}_1 - \\bar{X}_2');
    }
    res = res.replace(/\\left\s*\(/g, '\\Biggl(').replace(/\\right\s*\)/g, '\\Biggr)');
    res = res.replace(/\\left\s*\[/g, '\\Biggl[').replace(/\\right\s*\]/g, '\\Biggr]');
    return espaciarFormula(res);
};

function FormulasPDF({ nombre, filas, math, children }) {
    if (!math && !filas?.length) return null;
    const formulaFinal = normalizarDesarrollo(math || alineado(filas));
    return <div className="pdf-section" style={{ textAlign: 'center' }}>
        <div style={titulo}>{nombre}</div>
        <MathPDF math={formulaFinal} display />
        {children}
    </div>;
}

function ParametrosPDF({ parametros }) {
    const filas = Array.from({ length: Math.ceil(parametros.length / 2) }, (_, i) => parametros.slice(i * 2, i * 2 + 2));
    return <div className="pdf-section" data-pdf-divisible="filas">
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Parámetros del Cálculo</div>
        <table><thead><tr><th>Parámetro</th><th>Valor</th><th>Parámetro</th><th>Valor</th></tr></thead>
            <tbody>{filas.map((fila, i) => <tr key={i}>{[0, 1].map(j => <React.Fragment key={j}>
                <td>{fila[j] && <MathPDF math={fila[j][0]} />}</td><td>{fila[j] && <MathPDF math={numero(fila[j][1])} />}</td>
            </React.Fragment>)}</tr>)}</tbody>
        </table>
    </div>;
}

function configuracion(tipo, r) {
    const t = numero;
    const resumen = (nombre, simbolo, formula, valor) => ({ nombre, filas: [`${simbolo}=${formula}`, `=\\mathbf{${decimal(valor)}}`] });
    const config = {
        normal: { nombre: 'Distribución de la Media con Varianza Conocida', variable: '\\bar{X}', eje: 'Media muestral (X̄)', Grafico: GraficoProbabilidadMuestral,
            parametros: [['\\mu', r.mu], ['\\sigma', r.sigma], ['n', r.n]],
            medidas: [{ nombre: 'Esperanza Matemática', filas: cadena('E(\\bar{X})', r.formulaMuStr) }, { nombre: 'Varianza', filas: cadena('V(\\bar{X})', r.formulaVarStr) }, { nombre: 'Error Estándar', filas: cadena('\\sigma_{\\bar{X}}', r.formulaSEStr) }], distribucion: r.distribucionStr },
        proporcion: { nombre: 'Distribución de una Proporción', variable: '\\hat{p}', eje: 'Proporción muestral (p̂)', Grafico: GraficoProporcion,
            parametros: [['p', r.p], ['q', r.q], ['n', r.n]],
            medidas: [resumen('Esperanza Matemática', 'E(\\hat{p})', `p=${t(r.p)}`, r.p), resumen('Varianza', 'V(\\hat{p})', `\\frac{pq}{n}${r.esFinita ? '\\frac{N-n}{N-1}' : ''}`, r.varianza), resumen('Error Estándar', '\\sigma_{\\hat{p}}', `\\sqrt{${t(r.varianza)}}`, r.se)],
            distribucion: `\\mathbf{\\hat{p}\\sim N(${t(r.p)};${t(Number(decimal(r.varianza, 6)))})}` },
        chi: { nombre: 'Distribución de la Varianza Muestral', variable: 'S^2', eje: 'Varianza muestral (S²)', Grafico: GraficoChiCuadrada,
            parametros: [['\\sigma^2', r.varPob], ['n', r.n], ['k=n-1', r.k]],
            medidas: [resumen('Esperanza Matemática', 'E(S^2)', `\\sigma^2=${t(r.varPob)}`, r.varPob), resumen('Varianza', 'V(S^2)', `\\frac{2\\sigma^4}{n-1}=\\frac{2(${t(r.varPob)})^2}{${t(r.k)}}`, r.varS2), resumen('Desviación Estándar', '\\sigma_{S^2}', `\\sqrt{${t(r.varS2)}}`, Math.sqrt(r.varS2))], distribucion: `\\frac{(n-1)S^2}{\\sigma^2}\\sim\\chi^2_{${t(r.k)}}` },
        dif_medias: { nombre: 'Diferencia de Medias Muestrales con Varianzas Conocidas', variable: '\\bar{X}_1-\\bar{X}_2', eje: 'Diferencia de medias (X̄₁ − X̄₂)', Grafico: GraficoDiferenciaMedias,
            parametros: [['\\mu_1', r.m1], ['\\mu_2', r.m2], ['\\sigma_1', r.s1], ['\\sigma_2', r.s2], ['n_1', r.nn1], ['n_2', r.nn2]],
            medidas: [resumen('Esperanza Matemática', 'E(\\bar{X}_1-\\bar{X}_2)', `${t(r.m1)}-(${t(r.m2)})`, r.esperanza), resumen('Varianza', 'V(\\bar{X}_1-\\bar{X}_2)', `\\frac{${t(r.s1)}^2}{${t(r.nn1)}}+\\frac{${t(r.s2)}^2}{${t(r.nn2)}}`, r.varianza), resumen('Error Estándar', '\\sigma_{\\bar{X}_1-\\bar{X}_2}', `\\sqrt{${t(r.varianza)}}`, r.se)],
            distribucion: `\\mathbf{\\bar{X}_1-\\bar{X}_2\\sim N\\left(${t(r.esperanza)};${r.varFracDen && r.varFracDen !== 1 ? `\\frac{${t(r.varFracNum)}}{${t(r.varFracDen)}}` : (r.varFracNum !== undefined ? t(r.varFracNum) : decimal(r.varianza, 4))}\\right)}` },
        dif_proporciones: { nombre: 'Diferencia entre Dos Proporciones', variable: '\\hat{p}_1-\\hat{p}_2', eje: 'Diferencia de proporciones (p̂₁ − p̂₂)', Grafico: GraficoDiferenciaProporciones,
            parametros: [['p_1', r.prop1], ['p_2', r.prop2], ['n_1', r.num1], ['n_2', r.num2]],
            medidas: [resumen('Esperanza Matemática', 'E(\\hat{p}_1-\\hat{p}_2)', `${t(r.prop1)}-(${t(r.prop2)})`, r.esperanza), resumen('Varianza', 'V(\\hat{p}_1-\\hat{p}_2)', `\\frac{${t(r.prop1)}(${t(r.q1)})}{${t(r.num1)}}+\\frac{${t(r.prop2)}(${t(r.q2)})}{${t(r.num2)}}`, r.varianza), resumen('Error Estándar', '\\sigma_{\\hat{p}_1-\\hat{p}_2}', `\\sqrt{${t(r.varianza)}}`, r.se ?? Math.sqrt(r.varianza))],
            distribucion: `\\mathbf{\\hat{p}_1-\\hat{p}_2\\cong N(${decimal(r.esperanza, 5)};${decimal(r.varianza, 6)})}` },
        student: { nombre: 'Distribución de la Media con Varianza Desconocida', variable: '\\bar{X}', eje: 'Media muestral (X̄)', Grafico: GraficoStudent,
            parametros: [['\\mu', r.mu], [r.tipoDispersion === 'varianza' ? 'S^2' : 'S', r.tipoDispersion === 'varianza' ? r.s2 : r.s], ['n', r.n], ['v=n-1', r.v]],
            medidas: [resumen('Esperanza Matemática', 'E(\\bar{X})', `\\mu=${t(r.mu)}`, r.mu), resumen('Varianza Estimada', 'V(\\bar{X})', `\\frac{S^2}{n}=\\frac{${t(r.s2)}}{${t(r.n)}}`, r.varXbar), resumen('Error Estándar', 'S_{\\bar{X}}', `\\frac{${t(r.s)}}{\\sqrt{${t(r.n)}}}`, r.se)], distribucion: `T=\\frac{\\bar{X}-\\mu}{S/\\sqrt{n}}\\sim t_{${t(r.v)}}` },
        dif_medias_desc: { nombre: 'Diferencia de Medias Muestrales con Varianzas Desconocidas', variable: '\\bar{X}_1-\\bar{X}_2', eje: 'Diferencia de medias (X̄₁ − X̄₂)', Grafico: r.escenario === 'grandes' ? GraficoDiferenciaMedias : GraficoStudent,
            parametros: [['\\mu_1', r.m1], ['\\mu_2', r.m2], ['S_1', r.std1], ['S_2', r.std2], ['n_1', r.nn1], ['n_2', r.nn2]],
            medidas: [resumen('Esperanza Matemática', 'E(\\bar{X}_1-\\bar{X}_2)', `${t(r.m1)}-(${t(r.m2)})`, r.esperanza), resumen('Varianza Estimada', 'S^2_{\\bar{X}_1-\\bar{X}_2}', r.escenario === 'iguales' ? 'S_p^2(1/n_1+1/n_2)' : `\\frac{${t(r.std1)}^2}{${t(r.nn1)}}+\\frac{${t(r.std2)}^2}{${t(r.nn2)}}`, r.se ** 2), resumen('Error Estándar', 'S_{\\bar{X}_1-\\bar{X}_2}', r.escenario === 'iguales' ? 'S_p\\sqrt{1/n_1+1/n_2}' : '\\sqrt{S_1^2/n_1+S_2^2/n_2}', r.se)], distribucion: r.formulaLaTeX },
        razon_varianzas: { nombre: 'Razón de Dos Varianzas Muestrales', variable: '\\frac{S_1^2}{S_2^2}', eje: 'Razón de varianzas (S₁² / S₂²)', Grafico: GraficoFisher,
            parametros: [['\\sigma_1^2', r.vp1], ['\\sigma_2^2', r.vp2], ['n_1', r.nn1], ['n_2', r.nn2]],
            medidas: [resumen('Grados de Libertad del Numerador', 'v_1', `${t(r.nn1)}-1`, r.v1), resumen('Grados de Libertad del Denominador', 'v_2', `${t(r.nn2)}-1`, r.v2)], distribucion: `F=\\frac{S_1^2}{S_2^2}\\frac{\\sigma_2^2}{\\sigma_1^2}\\sim F_{${t(r.v1)},${t(r.v2)}}` }
    }[tipo];
    if (config && r.tipoPoblacion === 'finita') config.parametros.push(['N', r.N]);
    return config;
}

const textoFormula = latex => latex.replace(/\\bar\{X\}/g, 'X̄').replace(/\\bar\{Y\}/g, 'Ȳ').replace(/\\hat\{p\}/g, 'p̂')
    .replace(/\\chi\^2/g, 'χ²').replace(/\\(?:boldsymbol|mathbf|mathrm|left|right|Bigl|Bigr|,|;|!)/g, '')
    .replace(/\\leq?/g, '≤').replace(/\\geq?/g, '≥').replace(/\\(?:sigma|mu)/g, m => m === '\\sigma' ? 'σ' : 'μ')
    .replace(/_\{?(\d+)\}?/g, (_, n) => [...n].map(d => '₀₁₂₃₄₅₆₇₈₉'[+d]).join('')).replace(/\^2/g, '²').replace(/[{}]/g, '');

// Se reutiliza la gráfica web. La copia para PDF convierte las etiquetas HTML
// de Recharts a texto SVG para que html2canvas conserve todas las anotaciones.
function GraficaPDF({ config, resultados }) {
    const origen = useRef(null);
    const [contenedor, setContenedor] = useState(null);
    const [svg, setSvg] = useState('');
    const prefijo = useId().replace(/[^a-z0-9]/gi, '');
    const Grafico = config.Grafico;
    useEffect(() => {
        const nodo = document.createElement('div');
        nodo.className = 'mat251 pdf-t4-origen';
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
                const original = origen.current?.querySelector('svg.recharts-surface');
                if (!original?.querySelector('.recharts-area-curve')) return;
                const copia = original.cloneNode(true);
                copia.style.overflow = 'visible';
                const finEjes = Math.max(...[...original.querySelectorAll('.recharts-cartesian-axis-tick-value')].map(n => {
                    const caja = n.getBBox();
                    return caja.y + caja.height;
                }));
                if (Number.isFinite(finEjes)) {
                    const ancho = original.viewBox.baseVal.width;
                    copia.setAttribute('height', Math.ceil(finEjes + 8));
                    copia.setAttribute('viewBox', `0 0 ${ancho} ${Math.ceil(finEjes + 8)}`);
                }
                copia.querySelectorAll('foreignObject').forEach(elemento => {
                    const ancho = parseFloat(elemento.getAttribute('width')) || 0;
                    const alto = parseFloat(elemento.getAttribute('height')) || 0;
                    // Los títulos de los ejes se dibujan fuera del SVG para evitar recortes.
                    if (ancho >= 200 || alto > 70) { elemento.remove(); return; }
                    const annotation = elemento.querySelector('annotation');
                    const texto = annotation ? textoFormula(annotation.textContent) : elemento.textContent.trim();
                    const etiqueta = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    const x = (parseFloat(elemento.getAttribute('x')) || 0) + ancho / 2;
                    const y = (parseFloat(elemento.getAttribute('y')) || 0) + alto / 2 + 4;
                    etiqueta.setAttribute('x', Math.max(50, Math.min(590, x)));
                    etiqueta.setAttribute('y', Math.max(12, y));
                    etiqueta.setAttribute('text-anchor', 'middle');
                    etiqueta.setAttribute('fill', '#000000');
                    etiqueta.setAttribute('font-size', '11');
                    etiqueta.textContent = texto;
                    elemento.replaceWith(etiqueta);
                });
                copia.querySelectorAll('.recharts-cartesian-axis-tick-value,.recharts-cartesian-axis-tick-value tspan').forEach(n => n.style.setProperty('font-size', '7pt', 'important'));
                copia.querySelectorAll('*').forEach(n => {
                    for (const atributo of ['stroke', 'fill']) if (n.getAttribute(atributo)?.includes('var(')) n.setAttribute(atributo, '#000000');
                });
                const ids = [...copia.querySelectorAll('[id]')].map(n => n.id);
                let markup = copia.outerHTML;
                ids.forEach(id => { markup = markup.replaceAll(id, `${prefijo}-${id}`); });
                setSvg(prev => prev === markup ? prev : markup);
            });
        };
        const observer = new MutationObserver(copiar);
        observer.observe(origen.current, { childList: true, subtree: true, attributes: true });
        copiar();
        return () => { observer.disconnect(); cancelAnimationFrame(frame); };
    }, [contenedor, resultados, prefijo]);
    return <>
        {contenedor && createPortal(<DndContext><div ref={origen}><Grafico resultados={resultados} esDiferenciaMedias={Boolean(resultados.esDiferenciaMedias)} /></div></DndContext>, contenedor)}
        <div className="pdf-t4-grafica" style={{ position: 'relative', width: '640px', maxWidth: '100%', minHeight: svg ? undefined : '260px', margin: '0 auto' }}>
            <div style={{ position: 'absolute', top: '20px', left: '-8px', height: '206px', width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ transform: 'rotate(-90deg)', whiteSpace: 'nowrap' }}>Densidad f({config.eje.match(/\((.*)\)$/)?.[1] || 'x'})</span></div>
            <div dangerouslySetInnerHTML={{ __html: svg }} />
            <div style={{ textAlign: 'center' }}>{config.eje}</div>
        </div>
    </>;
}

function CalculadoraPDF({ datos }) {
    const r = datos.resultados;
    const config = configuracion(datos.distribucion, r);
    if (!config) return null;
    const esMayor = r.condicion === 'mayor_que' || r.condicion === 'mayor' || r.condicion === 'mayor_igual';
    const condicion = r.condicion === 'entre' ? `P(${numero(r.x1)}\\leq ${config.variable}\\leq ${numero(r.x2)})`
        : `P(${config.variable}${esMayor ? '\\geq' : '\\leq'}${numero(r.x1)})`;
    const escenario = { grandes: 'Muestras grandes', iguales: 'Muestras pequeñas con varianzas iguales', distintas: 'Muestras pequeñas con varianzas distintas' }[r.escenario];
    return <>
        <div className="pdf-section"><h3 style={{ ...titulo, marginTop: 0 }}>{config.nombre}</h3>
            {r.tipoPoblacion && <div style={{ textAlign: 'center' }}><strong>Población:</strong> {r.tipoPoblacion === 'finita' ? 'Finita' : 'Infinita'}</div>}
            {escenario && <div style={{ textAlign: 'center' }}>{escenario}</div>}
        </div>
        <ParametrosPDF parametros={config.parametros} />
        <div className="pdf-section" style={{ display: 'grid', gridTemplateColumns: `repeat(${config.medidas.length},minmax(0,1fr))`, gap: '10px', textAlign: 'center' }}>
            {config.medidas.map(m => <div key={m.nombre}><div style={titulo}>{m.nombre}</div><MathPDF math={alineado(m.filas)} display /></div>)}
        </div>
        {config.distribucion && <FormulasPDF nombre="Distribución del Estadístico" filas={[
            config.distribucion,
            ...(datos.distribucion === 'dif_medias_desc' && r.statType === 'T' ? [`g=${numero(r.v)}`] : [])
        ]} />}
        <div className="pdf-section" style={{ textAlign: 'center' }}>
            {aNumero(r.probFinal) !== null && <div style={titulo}>Condición de Búsqueda: <MathPDF math={condicion} /></div>}
            <div style={titulo}>Gráfica de la Distribución Muestral</div>
            <GraficaPDF key={`${datos.distribucion}-${r.escenario || ''}`} config={config} resultados={r} />
        </div>
        {r.strDesarrollo ? <FormulasPDF nombre="Estandarización y Desarrollo de la Probabilidad" math={normalizarDesarrollo(r.strDesarrollo, config.variable)}>
            <ProbabilidadPDF valor={r.probFinal} />
        </FormulasPDF> : aNumero(r.probFinal) !== null && <div className="pdf-section"><ProbabilidadPDF valor={r.probFinal} /></div>}
    </>;
}

function ProbabilidadPDF({ valor }) {
    const num = aNumero(valor);
    if (num === null) return null;
    return <div style={{ textAlign: 'center' }}>
        <div style={titulo}>Probabilidad Calculada</div>
        <MathPDF math={`\\mathbf{${num.toFixed(4)}}\\quad\\longrightarrow\\quad\\mathbf{${(num * 100).toFixed(2)}\\%}`} display />
    </div>;
}

function SumaPDF({ simbolo, terminos, resultado, cifras }) {
    const contenedor = useRef(null);
    const [grupos, setGrupos] = useState(() => Array.from({ length: Math.ceil(terminos.length / 3) }, (_, i) => terminos.slice(i * 3, i * 3 + 3)));
    const final = `=\\mathbf{${decimal(resultado, cifras)}}`;
    useLayoutEffect(() => {
        const nodo = contenedor.current;
        if (!nodo) return;
        let activo = true;
        let anchoAnterior = 0;
        const ajustar = () => {
            if (!activo) return;
            const ancho = nodo.getBoundingClientRect().width - 12;
            if (ancho <= 0) return;
            anchoAnterior = ancho;
            const regla = document.createElement('span');
            Object.assign(regla.style, { position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap', width: 'max-content', pointerEvents: 'none' });
            nodo.appendChild(regla);
            const cabe = (fila, primera, incluirResultado = false) => {
                regla.innerHTML = katex.renderToString(`\\displaystyle ${primera ? `${simbolo}=` : '\\quad+'}${fila.join('+')}${incluirResultado ? final : ''}`, { throwOnError: false, output: 'html' });
                return regla.getBoundingClientRect().width <= ancho;
            };
            const filas = [];
            let fila = [];
            terminos.forEach(termino => {
                if (fila.length && !cabe([...fila, termino], filas.length === 0)) {
                    filas.push(fila);
                    fila = [];
                }
                fila.push(termino);
            });
            if (fila.length) filas.push(fila);
            const ultima = filas[filas.length - 1];
            if (ultima?.length > 1 && !cabe(ultima, filas.length === 1, true)) filas.push([ultima.pop()]);
            regla.remove();
            setGrupos(anteriores => JSON.stringify(anteriores) === JSON.stringify(filas) ? anteriores : filas);
        };
        ajustar();
        const observer = new ResizeObserver(() => {
            if (Math.abs(nodo.getBoundingClientRect().width - 12 - anchoAnterior) > 0.5) ajustar();
        });
        observer.observe(nodo);
        document.fonts.ready.then(ajustar);
        return () => { activo = false; observer.disconnect(); };
    }, [simbolo, terminos, final]);
    const filas = grupos.map((grupo, i) => `${i ? '' : simbolo}&${i ? '\\quad+' : '='}${grupo.join('+')}${i === grupos.length - 1 ? final : ''}`);
    return <div ref={contenedor}><MathPDF math={`\\begin{aligned}${filas.join('\\\\[3pt]')}\\end{aligned}`} display /></div>;
}

function EmpiricaPDF({ datos }) {
    const r = datos.resultados;
    const c = r.calculosFinales;
    if (!c || !r.distribucion) return null;
    const nombres = { media: 'Medias Muestrales', varianza: 'Varianzas Muestrales', proporcion: 'Proporciones Muestrales' };
    const simbolo = { media: '\\bar{X}', varianza: 'S^2', proporcion: '\\hat{p}' }[c.parametroCalculo];
    const campo = c.parametroCalculo;
    const distribucion = r.distribucion;
    const total = r.resultado?.length || 0;
    const esMedia = campo === 'media';
    const esVarianza = campo === 'varianza';
    const tituloDistribucion = `Distribución Muestral de ${esMedia ? 'Medias' : esVarianza ? 'Varianzas' : 'Proporciones'}`;
    const valorIndividual = esMedia ? '\\bar{x}_i' : esVarianza ? 'S_i^2' : '\\hat{p}_i';
    const probIndividual = esMedia ? 'p_i' : `P(${valorIndividual})`;
    const cifrasValor = esMedia ? 2 : 4;
    const factor = !c.conReemplazo && c.N > 1 ? (c.N - c.n) / (c.N - 1) : 1;
    const varianzaTeorica = (esMedia ? c.varianzaPoblacional : c.proporcionPoblacional * (1 - c.proporcionPoblacional)) / c.n * factor;
    const correccion = c.conReemplazo ? '' : '\\left(\\frac{N-n}{N-1}\\right)';
    const correccionValores = c.conReemplazo ? '' : `\\left(\\frac{${c.N}-${c.n}}{${c.N}-1}\\right)`;
    const observacionVarianza = esMedia
        ? `V(${simbolo})=\\frac{\\sigma^2}{n}${correccion}=\\frac{${decimal(c.varianzaPoblacional, 2)}}{${c.n}}${correccionValores}=${decimal(varianzaTeorica, 2)}`
        : `V(${simbolo})=\\frac{P\\cdot Q}{n}${correccion}=\\frac{${decimal(c.proporcionPoblacional)}\\cdot${decimal(1 - c.proporcionPoblacional)}}{${c.n}}${correccionValores}=${decimal(varianzaTeorica, 6)}`;
    return <>
        <div className="pdf-section"><h3 style={titulo}>{tituloDistribucion}</h3>
            <div style={{ textAlign: 'center', marginBottom: '6px' }}>Demostración Empírica — Muestreo {c.conReemplazo ? 'con' : 'sin'} Reemplazo</div>
            <div><strong>Variable Analizada:</strong> {datos.nombreVariable || 'Población ingresada'}</div>
            {c.parametroCalculo === 'proporcion' && <div><strong>Atributo de Éxito:</strong> {c.atributoExito}</div>}
        </div>
        <div className="pdf-section" data-pdf-divisible="filas"><div style={titulo}>Datos de la Población</div>
            <table><thead><tr><th>Nº</th><th>Valor</th><th>Nº</th><th>Valor</th></tr></thead><tbody>{Array.from({ length: Math.ceil((datos.poblacion || []).length / 2) }, (_, i) => <tr key={i}>{[i * 2, i * 2 + 1].map(j => <React.Fragment key={j}><td>{j < datos.poblacion.length ? j + 1 : ''}</td><td>{datos.poblacion[j] ?? ''}</td></React.Fragment>)}</tr>)}</tbody></table>
        </div>
        <ParametrosPDF parametros={[[ 'N', c.N ], [ 'n', c.n ], [ '\\text{Total de muestras}', total ]]} />
        {total <= 5000 ? <div className="pdf-section" data-pdf-divisible="filas"><div style={titulo}>Muestras Posibles y {nombres[c.parametroCalculo]}</div>
            <table><thead><tr><th>Nº Muestra</th><th>Elementos</th><th>Valores</th><th><MathPDF math={simbolo} /></th></tr></thead><tbody>{(r.resultado || []).map(fila => <tr key={fila.id}><td>{fila.id}</td><td>{fila.elementos}</td><td>{fila.valores}</td><td>{fila[campo]}</td></tr>)}</tbody></table>
        </div> : <div className="pdf-section">Tabla paso a paso omitida por rendimiento ({total} muestras), como en la aplicación. La distribución incluye todas las muestras calculadas.</div>}
        <div className="pdf-section" data-pdf-divisible="filas"><div style={titulo}>{tituloDistribucion}</div>
            <table><thead><tr><th><MathPDF math={simbolo} /></th><th>Frecuencia</th><th>Probabilidad</th></tr></thead><tbody>{distribucion.map((d, i) => <tr key={i}><td>{d.valor}</td><td>{d.frecuencia}</td><td><MathPDF math={`\\frac{${d.frecuencia}}{${d.total}}=${decimal(d.frecuencia / d.total)}`} /></td></tr>)}<tr><td><strong>Total</strong></td><td>{total}</td><td>1.0000</td></tr></tbody></table>
        </div>
        {esVarianza && <FormulasPDF nombre={<>Varianza Poblacional <MathPDF math={'(\\sigma^2)'} /></>} filas={[
            `\\sigma^2=\\frac{\\sum(x_i-\\mu)^2}{N}=${decimal(c.varianzaPoblacional)}`
        ]} />}
        <div className="pdf-section" data-pdf-divisible="formulas" style={{ textAlign: 'center' }}>
            <div style={titulo}>{esVarianza ? 'Esperanza de la Varianza Muestral' : 'Esperanza Muestral'} <MathPDF math={`E(${simbolo})`} /></div>
            <MathPDF math={`E(${simbolo})=\\sum_{i=1}^{${distribucion.length}}${valorIndividual}${probIndividual}`} display />
            <SumaPDF simbolo={`E(${simbolo})`} terminos={distribucion.map(d => `\\frac{${d.frecuencia}}{${d.total}}(${decimal(d.valor, cifrasValor)})`)} resultado={c.esperanza} cifras={cifrasValor} />
            <div style={{ marginTop: '5px' }}>Obsérvese que: <MathPDF math={esMedia
                ? `E(${simbolo})=\\mu=${decimal(c.mediaPoblacional, 2)}`
                : esVarianza ? `E(S^2)=${Math.abs(c.esperanza - c.varianzaPoblacional) < 0.0001 ? '\\sigma^2=' : ''}${decimal(c.esperanza)}`
                    : `E(${simbolo})=P=${decimal(c.proporcionPoblacional)}`} /></div>
        </div>
        {!esVarianza && <div className="pdf-section" data-pdf-divisible="formulas" style={{ textAlign: 'center' }}>
            <div style={titulo}>Varianza Muestral <MathPDF math={`V(${simbolo})`} /></div>
            <MathPDF math={`V(${simbolo})=\\sum_{i=1}^{${distribucion.length}}(${valorIndividual}-E(${simbolo}))^2${probIndividual}`} display />
            <SumaPDF simbolo={`V(${simbolo})`} terminos={distribucion.map(d => `\\frac{${d.frecuencia}}{${d.total}}(${decimal(d.valor, cifrasValor)}-${decimal(c.esperanza, cifrasValor)})^2`)} resultado={c.varianzaDeDistribucion} cifras={esMedia ? 2 : 6} />
            <div style={{ marginTop: '5px' }}>Obsérvese que: <MathPDF math={observacionVarianza} /></div>
        </div>}
        <div className="pdf-section" style={{ textAlign: 'center' }}>
            <div style={titulo}>{esVarianza ? 'Distribución Chi-cuadrada' : 'Distribución Normal Aproximada'}</div>
            {esVarianza && <div>Grados de libertad: <MathPDF math={`n-1=${c.n}-1=${c.n - 1}`} /></div>}
            <MathPDF math={esVarianza ? `\\frac{(${c.n}-1)S^2}{\\sigma^2}\\sim\\chi^2_{${c.n}-1}`
                : `${simbolo}\\sim N(${decimal(c.esperanza, cifrasValor)};${decimal(varianzaTeorica, esMedia ? 2 : 6)})`} display />
        </div>
    </>;
}

export default function ReportePDF_Tema4({ operacion, resultadoMuestral }) {
    if (!resultadoMuestral?.resultados) return null;
    return <div id="pdf-cuerpo-tema4">
        <style>{`
            #reporte-formal-mat251 #pdf-cuerpo-tema4 .pdf-section { margin-bottom:12px !important; }
            #reporte-formal-mat251 #pdf-cuerpo-tema4 table { width:100%;border-collapse:collapse; }
            #reporte-formal-mat251 #pdf-cuerpo-tema4 td { text-align:center; }
            #reporte-formal-mat251 #pdf-cuerpo-tema4 .katex-display { margin:4px 0!important;padding:0!important; }
            #reporte-formal-mat251 #pdf-cuerpo-tema4 .katex { padding:0!important; }
            #reporte-formal-mat251 #pdf-cuerpo-tema4 .katex .hide-tail { overflow:hidden!important; }
            #reporte-formal-mat251 #pdf-cuerpo-tema4 .recharts-cartesian-axis-tick-value,
            #reporte-formal-mat251 #pdf-cuerpo-tema4 .recharts-cartesian-axis-tick-value tspan {font-size:7pt!important;}
            .pdf-t4-origen { position:fixed;left:0;top:0;width:640px;height:260px;visibility:hidden;pointer-events:none;z-index:-1;--text-pure:#000;--text-main:#000;--bg-card:#fff;--border-color:#000; }
            .pdf-t4-origen .widget-grafico {width:640px!important;height:260px!important;margin:0!important;}
            .pdf-t4-origen .widget-header {display:none!important;}
            .pdf-t4-origen .widget-body {min-height:0!important;}
            .pdf-t4-origen .contenedor-grafico-interno {top:0!important;left:0!important;right:0!important;bottom:0!important;}
        `}</style>
        <h2 className="pdf-section" style={{ ...titulo, textTransform: 'uppercase' }}>{operacion === 'tyf' ? 'Distribuciones T de Student y F de Fisher' : 'Distribuciones Muestrales'}</h2>
        {resultadoMuestral.distribucion === 'empirica' ? <EmpiricaPDF datos={resultadoMuestral} /> : <CalculadoraPDF datos={resultadoMuestral} />}
    </div>;
}
