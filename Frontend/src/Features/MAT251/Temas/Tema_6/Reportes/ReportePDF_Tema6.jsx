import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DndContext } from '@dnd-kit/core';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import Resultados_HP_Matriz from '../Resultados/Resultados_HP_Matriz';
import Resultados_HP_Manual from '../Resultados/Resultados_HP_Manual';
import Resultados_HNP_Matriz from '../Resultados/Resultados_HNP_Matriz';
import Resultados_HNP_Manual from '../Resultados/Resultados_HNP_Manual';

const nombres = {
    media_z: 'Media Z (σ conocida)', media_t: 'Media T (σ desconocida)',
    proporcion: 'Proporción', varianza: 'Varianza', chi_cuadrada: 'Chi-cuadrada',
    signos: 'Prueba de Signos', rachas: 'Prueba de Rachas'
};
const dec = (v, cifras = 4) => Number.isFinite(v) ? (Math.abs(v) < 0.5 * 10 ** -cifras ? 0 : v).toFixed(cifras) : '—';
const MathPDF = ({ math }) => <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math || '', { throwOnError: false }) }} />;
const Titulo = ({ children }) => <div className="pdf-t6-titulo">{children}</div>;
const Tabla = ({ titulo, cabecera, filas, className }) => <div className="pdf-section" data-pdf-divisible="filas">
    {titulo && <Titulo>{titulo}</Titulo>}
    <table className={className}><thead><tr>{cabecera.map((celda, i) => <th key={i}>{celda}</th>)}</tr></thead>
        <tbody>{filas.map((fila, i) => <tr key={i}>{fila.map((celda, j) => <td key={j}>{celda}</td>)}</tr>)}</tbody>
    </table>
</div>;

function DatosPDF({ datos }) {
    const r = datos.resultados;
    const valores = r.datosAnalizados;
    if (datos.modo === 'manual') {
        const c = r.calculos || {};
        const entradas = {
            media_z: [['n', c.n], ['\\bar{x}', c.x_bar], ['\\mu_0', c.mu0], ['\\sigma', c.sigma]],
            media_t: [['n', c.n], ['\\bar{x}', c.x_bar], ['\\mu_0', c.mu0], ['S', c.s]],
            proporcion: [['n', c.n], ['x', c.x], ['p_0', c.p0]],
            varianza: [['n', c.n], ['S^2', c.s2], ['\\sigma_0^2', c.sigma02]],
            signos: [['n_+', r.positivos], ['n_-', r.negativos]],
            rachas: [['n_1', r.n1], ['n_2', r.n2], ['R', r.rachas]]
        }[datos.prueba];
        if (entradas) {
            const filas = Array.from({ length: Math.ceil(entradas.length / 2) }, (_, i) =>
                [0, 1].flatMap(j => {
                    const entrada = entradas[i * 2 + j];
                    return entrada ? [<MathPDF math={entrada[0]} />, <MathPDF math={String(entrada[1]).replace(/e([+-]?\d+)/i, '\\times10^{$1}')} />] : ['', ''];
                })
            );
            return <Tabla titulo="Datos Ingresados" cabecera={['Parámetro', 'Valor', 'Parámetro', 'Valor']} filas={filas} />;
        }
    }
    if (datos.prueba === 'chi_cuadrada' && r.subtipo === 'bondad' && r.observadas && r.esperadas) {
        const filas = r.observadas.map((o, i) => [r.categorias?.[i] ?? i + 1, o, dec(r.esperadas[i]), dec((o - r.esperadas[i]) ** 2 / r.esperadas[i])]);
        filas.push(['Total', r.observadas.reduce((a, b) => a + b, 0), dec(r.esperadas.reduce((a, b) => a + b, 0)), dec(r.estadistico)]);
        return <Tabla titulo="Prueba de Bondad de Ajuste" cabecera={['Categoría', <MathPDF math="O_i" />, <MathPDF math="E_i" />, <MathPDF math={'\\frac{(O_i-E_i)^2}{E_i}'} />]} filas={filas} />;
    }
    if (datos.prueba === 'chi_cuadrada' && r.matriz) {
        const matriz = r.matriz.map(f => f.map(Number));
        const sumasFilas = matriz.map(f => f.reduce((a, b) => a + b, 0));
        const sumasCols = matriz[0].map((_, j) => matriz.reduce((s, fila) => s + fila[j], 0));
        const n = sumasFilas.reduce((a, b) => a + b, 0);
        const filas = matriz.flatMap((fila, i) => fila.map((o, j) => {
            const e = sumasFilas[i] * sumasCols[j] / n;
            return [r.nombresFilas?.[i] ?? `Fila ${i + 1}`, r.nombresCols?.[j] ?? `Columna ${j + 1}`, o, dec(e), dec(e > 0 ? (o - e) ** 2 / e : 0)];
        }));
        filas.push(['Total', '', n, dec(n), dec(r.estadistico)]);
        return <>
            <Tabla className="pdf-t6-contingencia" titulo={<>Matriz de Contingencia<div style={{ fontWeight: "normal", marginTop: "4px" }}>{matriz.length} filas y {matriz[0].length} columnas</div></>}
                cabecera={[(r.labelV1 || "Fila") + " / " + (r.labelV2 || "Columna"), ...matriz[0].map((_, j) => r.nombresCols?.[j] ?? "Columna " + (j + 1))]}
                filas={matriz.map((fila, i) => [r.nombresFilas?.[i] ?? "Fila " + (i + 1), ...fila])} />
        <Tabla titulo="Prueba de Independencia: Frecuencias Observadas y Esperadas"
            cabecera={[r.labelV1 || 'Fila', r.labelV2 || 'Columna', <MathPDF math="O_{ij}" />, <MathPDF math="E_{ij}" />, <MathPDF math={'\\frac{(O_{ij}-E_{ij})^2}{E_{ij}}'} />]} filas={filas} />
        </>;
    }
    if (datos.modo === 'matriz' && datos.prueba === 'signos' && r.detalleSignos?.length) {
        const pareadas = Boolean(r.columnasPareadas?.length === 2);
        const formato = valor => Number.isFinite(valor) ? valor.toLocaleString('es-ES', { maximumFractionDigits: 4 }) : '—';
        const cabecera = ['N.º',
            ...(pareadas ? r.columnasPareadas : [<MathPDF math="X_i" />, <MathPDF math="v_{ref}" />]),
            <MathPDF math={pareadas ? 'D_i=X_{2i}-X_{1i}' : 'D_i=X_i-v_{ref}'} />, 'Signo'];
        return <Tabla titulo="Datos y resolución de la Prueba de Signos" cabecera={cabecera}
            filas={r.detalleSignos.map(detalle => [detalle.indice, formato(detalle.dato1),
                formato(pareadas ? detalle.dato2 : r.valorReferencia), formato(detalle.diferencia),
                <strong>{detalle.signo || 'Dato inválido'}</strong>])} />;
    }
    if (datos.modo === 'matriz' && datos.prueba === 'rachas' && r.detalleRachas?.length) {
        const numero = valor => <MathPDF math={Number(valor).toLocaleString('en-US', { maximumFractionDigits: 4, useGrouping: false })} />;
        const grupo = detalle => {
            if (!r.rachasCuantitativa) return detalle.grupoDescripcion;
            if (detalle.grupo === '0') return <>Empate (= {numero(detalle.puntoCorte)})</>;
            if (detalle.grupo === null) return '—';
            const signo = detalle.grupo === '+' ? '+' : '−';
            return detalle.valorGrupo !== null
                ? <>{signo} ({numero(detalle.valorGrupo)})</>
                : <>{signo} ({detalle.grupo === '+' ? '>' : '<'} {numero(detalle.puntoCorte)})</>;
        };
        return <>
            <Tabla titulo="Datos y resolución de la Prueba de Rachas" cabecera={['N.º', 'Dato', 'Grupo', 'Racha']}
                filas={r.detalleRachas.map(detalle => [numero(detalle.indice),
                    r.rachasCuantitativa ? numero(detalle.valor) : detalle.valor, grupo(detalle),
                    detalle.racha === null ? '—' : numero(detalle.racha)])} />
            {r.rachasUsaCorte && <div className="pdf-section" style={{ textAlign: 'center' }}>Los valores iguales al punto de corte se ignorarán (empates).</div>}
        </>;
    }
    if (datos.modo !== 'matriz' || !valores?.length) return null;
    const signos = datos.prueba === 'signos';
    const proporcion = datos.prueba === 'proporcion';
    const referencia = r.valorReferencia ?? 0;
    const columnas = ['i', signos && r.columnasPareadas ? 'Diferencia (segunda columna − primera columna)' : r.columnaEvaluada || <MathPDF math="x_i" />];
    if (signos) columnas.push(<MathPDF math={`x_i-(${referencia})`} />, 'Signo');
    if (proporcion) columnas.push('Caso favorable');
    return <>
        {signos && <div className="pdf-section">
            {r.columnasPareadas ? <>Columnas pareadas: {r.columnasPareadas.join(' / ')}.</> : <>Valor de referencia: {referencia}.</>}
        </div>}
        {proporcion && <div className="pdf-section"><strong>Valor de Éxito:</strong> {String(r.valorExito)}</div>}
        <Tabla titulo={`Datos Analizados de la Matriz (${valores.length} registros)`} cabecera={columnas}
            filas={valores.map((v, i) => {
                const fila = [i + 1, String(v)];
                if (signos) fila.push(dec(v - referencia), v > referencia ? '+' : v < referencia ? '−' : 'Empate');
                if (proporcion) fila.push(String(v).trim() === String(r.valorExito).trim() ? 1 : 0);
                return fila;
            })} />
    </>;
}

function DesarrolloPDF({ datos }) {
    const r = datos.resultados;
    const c = r.calculos;
    const p = datos.prueba;
    const filas = [];
    let simbolo = 'Z';
    if (p === 'media_z' || p === 'media_t') {
        const sigma = p === 'media_z' ? c.sigma : c.s;
        simbolo = p === 'media_z' ? 'Z' : 'T';
        filas.push(['Error estándar', `EE_{\\bar{x}}=\\frac{${p === 'media_z' ? '\\sigma' : 'S'}}{\\sqrt{n}}=\\frac{${dec(sigma)}}{\\sqrt{${c.n}}}=${dec(sigma / Math.sqrt(c.n))}`]);
        filas.push(['Estadístico de prueba', `${simbolo}_c=\\frac{\\bar{x}-\\mu_0}{${p === 'media_z' ? '\\sigma' : 'S'}/\\sqrt{n}}=\\frac{${dec(c.x_bar)}-(${dec(c.mu0)})}{${dec(sigma)}/\\sqrt{${c.n}}}=\\mathbf{${dec(r.estadistico)}}`]);
        if (p === 'media_t') filas.push(['Grados de Libertad', `gl=n-1=${c.n}-1=${c.n - 1}`]);
    } else if (p === 'proporcion') {
        filas.push(['Proporción muestral', `\\hat{p}=\\frac{x}{n}=\\frac{${c.x}}{${c.n}}=${dec(c.p_hat)}`]);
        filas.push(['Error estándar', `EE_{\\hat{p}}=\\sqrt{\\frac{p_0(1-p_0)}{n}}=\\sqrt{\\frac{${dec(c.p0)}(1-${dec(c.p0)})}{${c.n}}}=${dec(Math.sqrt(c.p0 * (1 - c.p0) / c.n))}`]);
        filas.push(['Estadístico de prueba', `Z_c=\\frac{\\hat{p}-p_0}{\\sqrt{p_0(1-p_0)/n}}=\\frac{${dec(c.p_hat)}-${dec(c.p0)}}{\\sqrt{${dec(c.p0)}(1-${dec(c.p0)})/${c.n}}}=\\mathbf{${dec(r.estadistico)}}`]);
    } else if (p === 'varianza') {
        simbolo = '\\chi^2';
        filas.push(['Grados de Libertad', `gl=n-1=${c.n}-1=${c.n - 1}`]);
        filas.push(['Estadístico de prueba', `\\chi_c^2=\\frac{(n-1)S^2}{\\sigma_0^2}=\\frac{(${c.n}-1)(${dec(c.s2)})}{${dec(c.sigma02)}}=\\mathbf{${dec(r.estadistico)}}`]);
    } else if (p === 'chi_cuadrada') {
        simbolo = '\\chi^2';
        if (r.subtipo === 'independencia') {
            filas.push(['Frecuencias esperadas', 'E_{ij}=\\frac{(\\text{total fila }i)(\\text{total columna }j)}{n}']);
            const matriz = r.matriz.map(fila => fila.map(Number));
            const totalesFilas = matriz.map(fila => fila.reduce((suma, valor) => suma + valor, 0));
            const totalesColumnas = matriz[0].map((_, j) => matriz.reduce((suma, fila) => suma + fila[j], 0));
            const n = totalesFilas.reduce((suma, total) => suma + total, 0);
            matriz.forEach((fila, i) => fila.forEach((_, j) => {
                const esperada = totalesFilas[i] * totalesColumnas[j] / n;
                filas.push([
                    'Frecuencia esperada (' + (i + 1) + ', ' + (j + 1) + ')',
                    'E_{' + (i + 1) + ',' + (j + 1) + '}=\\frac{(' + totalesFilas[i] + ')(' + totalesColumnas[j] + ')}{' + n + '}=\\mathbf{' + dec(esperada) + '}'
                ]);
            }));
        }
        filas.push(['Grados de Libertad', r.subtipo === 'bondad' ? `gl=k-1=${r.df + 1}-1=${r.df}` : `gl=(r-1)(c-1)=(${r.matriz.length}-1)(${r.matriz[0].length}-1)=${r.df}`]);
        filas.push(['Estadístico de prueba', `${r.subtipo === 'bondad' ? '\\chi_c^2=\\sum_i\\frac{(O_i-E_i)^2}{E_i}' : '\\chi_c^2=\\sum_i\\sum_j\\frac{(O_{ij}-E_{ij})^2}{E_{ij}}'}=\\mathbf{${dec(r.estadistico)}}`]);
    } else if (p === 'signos') {
        filas.push(['Muestra efectiva', `n=n_++n_-=${r.positivos}+${r.negativos}=${r.nEfectivo}`]);
        filas.push(['Estadístico original', `S=n_+=${r.positivos}`]);
        if (r.isNormalApprox) {
            const ajuste = r.positivos < r.nEfectivo / 2 ? '+0.5' : r.positivos > r.nEfectivo / 2 ? '-0.5' : '';
            filas.push(['Aproximación Normal', `Z_c=\\frac{S${ajuste}-n/2}{\\sqrt{n/4}}=\\frac{${r.positivos}${ajuste}-${r.nEfectivo}/2}{\\sqrt{${r.nEfectivo}/4}}=\\mathbf{${dec(r.estadistico)}}`]);
        } else {
            filas.push(['Distribución Binomial', `X\\sim\\operatorname{Bin}(${r.nEfectivo},0.5),\\quad P(X=x)=\\binom{${r.nEfectivo}}{x}(0.5)^x(0.5)^{${r.nEfectivo}-x}`]);
            const extremo = c.tipoPrueba === 'bilateral' ? Math.min(r.positivos, r.negativos) : r.positivos;
            const derecha = c.tipoPrueba === 'derecha';
            const suma = `\\sum_{x=${derecha ? extremo : 0}}^{${derecha ? r.nEfectivo : extremo}}\\binom{${r.nEfectivo}}{x}(0.5)^{${r.nEfectivo}}`;
            filas.push(['p-Valor', `p=${c.tipoPrueba === 'bilateral' ? `\\min\\!\\left(1,2${suma}\\right)` : suma}=\\mathbf{${dec(r.pValor)}}`]);
        }
    } else if (p === 'rachas') {
        const n = r.n1 + r.n2;
        const ajuste = r.rachas > r.muR ? '-0.5' : r.rachas < r.muR ? '+0.5' : '';
        filas.push(['Tamaño de Muestra', `n=n_1+n_2=${r.n1}+${r.n2}=${n}`]);
        filas.push(['Media Esperada', `\\mu_R=\\frac{2n_1n_2}{n_1+n_2}+1=\\frac{2(${r.n1})(${r.n2})}{${n}}+1=${dec(r.muR)}`]);
        filas.push(['Desviación Estándar', `\\sigma_R=\\sqrt{\\frac{2n_1n_2(2n_1n_2-n)}{n^2(n-1)}}=\\sqrt{\\frac{2(${r.n1})(${r.n2})[2(${r.n1})(${r.n2})-${n}]}{${n}^2(${n}-1)}}=${dec(r.sigmaR)}`]);
        if (r.sigmaR > 0) filas.push(['Estadístico de prueba', `Z_c=\\frac{R${ajuste}-\\mu_R}{\\sigma_R}=\\frac{${r.rachas}${ajuste}-${dec(r.muR)}}{${dec(r.sigmaR)}}=\\mathbf{${dec(r.estadistico)}}`]);
        else filas.push(['Estadístico de prueba', `\\sigma_R=0,\\quad Z_c=\\mathbf{${dec(r.estadistico)}}`]);
    }
    if (!(p === 'signos' && !r.isNormalApprox)) {
        const acumulada = simbolo === '\\chi^2' ? `F_{\\chi^2_{${p === 'varianza' ? c.n - 1 : r.df}}}` : p === 'media_t' ? `F_{t_{${c.n - 1}}}` : '\\Phi';
        const valor = dec(r.estadistico);
        let formula;
        if (c.tipoPrueba === 'derecha') formula = `1-${acumulada}(${valor})`;
        else if (c.tipoPrueba === 'izquierda') formula = `${acumulada}(${valor})`;
        else if (simbolo === '\\chi^2') formula = `\\min\\!\\left(1,2\\min\\!\\left[${acumulada}(${valor}),1-${acumulada}(${valor})\\right]\\right)`;
        else formula = `2[1-${acumulada}(|${valor}|)]`;
        filas.push(['p-Valor', `p=${formula}=\\mathbf{${dec(r.pValor)}}`]);
    }
    const criticos = typeof r.valorCritico === 'number' ? [['Z_{crit}', r.valorCritico]]
        : Object.entries(r.valorCritico || {}).map(([key, v]) => [{ zAlpha2: 'Z_{\\alpha/2}', zAlpha: 'Z_\\alpha', tAlpha2: 't_{\\alpha/2}', tAlpha: 't_\\alpha', chiInf: '\\chi^2_{inf}', chiSup: '\\chi^2_{sup}' }[key] || key, v]);
    if (criticos.length) filas.push(['Valor Crítico', criticos.map(([key, v]) => `${key}=${c.tipoPrueba === 'bilateral' && (key.startsWith('Z') || key.startsWith('t')) ? '\\pm' : ''}${dec(v)}`).join(',\\quad ')]);
    return <Tabla titulo="Desarrollo de la Prueba de Hipótesis" cabecera={['Detalle', 'Cálculo']} filas={filas.map(([nombre, formula]) => [nombre, <MathPDF math={formula} />])} />;
}

// Se reutilizan las vistas web para conservar sus tablas, títulos, IC y decisiones.
// La curva conserva su SVG y las etiquetas mantienen el HTML KaTeX fuera del SVG
// para que html2canvas capture subíndices, exponentes y símbolos sin convertirlos a texto.
function prepararGrafica(widget, prefijo) {
    const bloque = document.createElement('div');
    bloque.className = 'pdf-t6-grafica';
    const titulo = document.createElement('div');
    titulo.className = 'pdf-t6-titulo';
    titulo.textContent = widget.querySelector('.widget-titulo')?.textContent || 'Gráfica de Distribución';
    bloque.appendChild(titulo);
    const parametros = widget.querySelector('.parametros-grafica-signos')?.cloneNode(true);
    if (parametros) {
        parametros.className = 'pdf-t6-parametros-grafica';
        parametros.style.cssText = 'display:flex;justify-content:flex-end;gap:15px;margin:0 30px 4px 0';
        bloque.appendChild(parametros);
    }
    widget.querySelectorAll('svg.recharts-surface').forEach((original, indice) => {
        const svg = original.cloneNode(true);
        const ancho = Number(original.getAttribute('width')) || 640;
        const altoOriginal = Number(original.getAttribute('height')) || 270;
        const finEje = Math.max(...[...original.querySelectorAll('.recharts-cartesian-axis-tick-value')].map(etiqueta => {
            const caja = etiqueta.getBBox();
            return caja.y + caja.height;
        }));
        // Recortar únicamente el margen vacío inferior acerca la leyenda al eje.
        const alto = Number.isFinite(finEje) ? Math.min(altoOriginal, Math.ceil(finEje + 5)) : altoOriginal;
        svg.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', alto);
        svg.style.cssText = 'display:block;width:100%;height:auto;overflow:visible';
        const trazado = document.createElement('div');
        trazado.className = 'pdf-t6-trazado';
        trazado.style.cssText = 'position:relative;width:100%';
        const etiquetas = [];
        svg.querySelectorAll('foreignObject').forEach(nodo => {
            const anchoEtiqueta = parseFloat(nodo.getAttribute('width')) || 140;
            const altoEtiqueta = parseFloat(nodo.getAttribute('height')) || 30;
            const x = parseFloat(nodo.getAttribute('x')) || 0;
            const y = parseFloat(nodo.getAttribute('y')) || 0;
            const etiqueta = document.createElement('div');
            etiqueta.className = 'pdf-t6-etiqueta';
            etiqueta.style.cssText = 'position:absolute;overflow:visible;pointer-events:none';
            etiqueta.style.left = Math.max(0, Math.min(ancho - anchoEtiqueta, x)) / ancho * 100 + '%';
            etiqueta.style.top = Math.max(0, y) / alto * 100 + '%';
            etiqueta.style.width = anchoEtiqueta / ancho * 100 + '%';
            etiqueta.style.height = altoEtiqueta / alto * 100 + '%';
            etiqueta.innerHTML = nodo.innerHTML;
            etiquetas.push(etiqueta);
            nodo.remove();
        });
        svg.querySelectorAll('*').forEach(nodo => {
            ['fill', 'stroke', 'stop-color'].forEach(attr => {
                const valor = nodo.getAttribute(attr);
                if (valor?.includes('var(')) nodo.setAttribute(attr, valor.includes('--primary-color') ? '#3b82f6' : '#000');
            });
        });
        svg.querySelectorAll('.recharts-cartesian-axis-tick-value,.recharts-cartesian-axis-tick-value tspan').forEach(nodo => nodo.style.setProperty('font-size', '7pt', 'important'));
        const ids = new Map([...svg.querySelectorAll('[id]')].map(nodo => [nodo.id, `${prefijo}-${indice}-${nodo.id}`]));
        svg.querySelectorAll('*').forEach(nodo => [...nodo.attributes].forEach(attr => {
            if (attr.name === 'id' && ids.has(attr.value)) nodo.setAttribute('id', ids.get(attr.value));
            else if (attr.value.includes('url(#')) nodo.setAttribute(attr.name, attr.value.replace(/url\(#([^)]*)\)/g, (match, id) => ids.has(id) ? `url(#${ids.get(id)})` : match));
        }));
        trazado.appendChild(svg);
        etiquetas.forEach(etiqueta => trazado.appendChild(etiqueta));
        bloque.appendChild(trazado);
    });
    const leyenda = widget.querySelector('.leyenda-grafica-tema6')?.cloneNode(true);
    if (leyenda) {
        leyenda.className = 'pdf-t6-leyenda';
        leyenda.style.cssText = 'display:flex;justify-content:center;gap:18px;margin:0';
        leyenda.querySelectorAll('div').forEach(nodo => {
            nodo.style.removeProperty('box-shadow');
            nodo.style.removeProperty('border');
            nodo.style.removeProperty('background');
            nodo.style.removeProperty('padding');
            nodo.style.removeProperty('letter-spacing');
        });
        // Los colores de los indicadores siguen la curva roja y azul de la web.
        [...leyenda.children].forEach((nodo, i) => {
            const punto = nodo.firstElementChild;
            if (punto) punto.style.cssText = `width:9px;height:9px;flex-shrink:0;background:${i ? '#dbeafe' : '#dc2626'}`;
        });
        bloque.appendChild(leyenda);
    }
    return bloque;
}

function copiarSeccion(original, prefijo) {
    const copia = original.cloneNode(true);
    // Los tooltips son ayudas interactivas; no son parte de la tabla impresa.
    copia.querySelectorAll('style,button,.mat251-stat-tooltip,.recharts-tooltip-wrapper,.hide-on-pc').forEach(n => n.remove());
    copia.querySelectorAll('.hide-on-mobile').forEach(n => n.classList.remove('hide-on-mobile'));
    copia.querySelectorAll('strong').forEach(etiqueta => {
        if (etiqueta.textContent.trim() !== 'Nota:') return;
        const contenedor = etiqueta.parentElement?.parentElement;
        if (contenedor) {
            contenedor.style.setProperty('border', '0', 'important');
            contenedor.style.setProperty('padding', '0');
            contenedor.style.removeProperty('background');
        }
    });
    copia.querySelectorAll('.mat251-stat-label-container').forEach(etiqueta => etiqueta.replaceWith(...etiqueta.childNodes));
    if (original.id.endsWith('-planteamiento')) copia.classList.add('pdf-t6-hipotesis');
    copia.querySelectorAll('.decision-estadistica-table td').forEach(celda => {
        if (celda.style.color === 'rgb(16, 185, 129)' || celda.style.color === '#10b981') celda.classList.add('pdf-t6-decision-verde');
        if (celda.style.color === 'rgb(239, 68, 68)' || celda.style.color === '#ef4444') celda.classList.add('pdf-t6-decision-roja');
    });
    const widgetsOriginales = [...original.querySelectorAll('.widget-grafico')];
    const widgetsCopia = [...copia.querySelectorAll('.widget-grafico')];
    widgetsCopia.forEach((nodo, i) => nodo.replaceWith(prepararGrafica(widgetsOriginales[i], `${prefijo}-${i}`)));
    [copia, ...copia.querySelectorAll('*')].forEach(nodo => {
        if (nodo.closest('.katex,svg,.pdf-t6-grafica')) return;
        nodo.removeAttribute('id');
        nodo.removeAttribute('title');
        if (!nodo.style) return;
        ['max-height', 'height', 'min-width', 'min-height', 'overflow', 'overflow-x', 'overflow-y', 'box-shadow', 'border-radius', 'background', 'background-color', 'letter-spacing'].forEach(prop => nodo.style.removeProperty(prop));
        nodo.style.setProperty('color', '#000');
        if (nodo.tagName === 'DIV') {
            if (nodo.querySelector('table')) nodo.style.setProperty('border', '0', 'important');
            nodo.style.setProperty('margin-top', '0');
            nodo.style.setProperty('margin-bottom', '6px');
        }
    });
    copia.style.cssText = 'width:100%;margin:0;padding:0;border:0';
    return { html: copia.outerHTML, grafica: widgetsOriginales.length > 0, tabla: Boolean(copia.querySelector('table')) };
}

function ResultadosPDF({ datos, onListo }) {
    const ref = useRef(null);
    const [contenedor, setContenedor] = useState(null);
    const [secciones, setSecciones] = useState([]);
    const [datosCopiados, setDatosCopiados] = useState(null);
    const prefijo = useId().replace(/[^a-z0-9]/gi, '');
    const parametrica = datos.operacion === 'Hipotesis_parametricas';
    const Vista = parametrica ? datos.modo === 'matriz' ? Resultados_HP_Matriz : Resultados_HP_Manual
        : datos.modo === 'matriz' ? Resultados_HNP_Matriz : Resultados_HNP_Manual;
    useEffect(() => {
        const nodo = document.createElement('div');
        nodo.className = 'mat251 pdf-t6-origen';
        nodo.setAttribute('aria-hidden', 'true');
        document.body.appendChild(nodo);
        setContenedor(nodo);
        return () => nodo.remove();
    }, []);
    useEffect(() => {
        if (!contenedor || !ref.current) return;
        let frame;
        const copiar = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const raiz = ref.current?.firstElementChild;
                if (!raiz || !raiz.querySelector('svg.recharts-surface')) return;
                const partes = [...raiz.children].filter(nodo => nodo.tagName !== 'STYLE').map((nodo, i) => copiarSeccion(nodo, `${prefijo}-${i}`));
                setSecciones(prev => JSON.stringify(prev) === JSON.stringify(partes) ? prev : partes);
                setDatosCopiados(datos);
            });
        };
        const observer = new MutationObserver(copiar);
        observer.observe(ref.current, { childList: true, subtree: true, attributes: true });
        copiar();
        return () => { observer.disconnect(); cancelAnimationFrame(frame); };
    }, [contenedor, prefijo, datos]);
    useEffect(() => {
        if (datosCopiados === datos && secciones.some(seccion => seccion.grafica)) onListo?.(datos);
    }, [datosCopiados, datos, secciones, onListo]);
    const indiceGrafica = secciones.findIndex(seccion => seccion.grafica);
    return <>
        {contenedor && createPortal(<DndContext><div ref={ref}><Vista resultados={datos.resultados} prueba={datos.prueba} /></div></DndContext>, contenedor)}
        {datosCopiados === datos && secciones.map((seccion, i) => <React.Fragment key={i}>
            {i === indiceGrafica && <DesarrolloPDF datos={datos} />}
            <div className="pdf-section pdf-t6-seccion" data-pdf-divisible={seccion.tabla ? 'filas' : undefined} dangerouslySetInnerHTML={{ __html: seccion.html }} />
        </React.Fragment>)}
    </>;
}

export default function ReportePDF_Tema6({ operacion, resultadoHipotesis, onListo }) {
    const datos = resultadoHipotesis;
    if (!datos?.resultados || datos.operacion !== operacion || !['matriz', 'manual'].includes(datos.modo)) return null;
    if (!['Hipotesis_parametricas', 'Hipotesis_noparametricas'].includes(operacion) || !nombres[datos.prueba]) return null;
    const r = datos.resultados;
    if (!r.calculos || !Number.isFinite(r.estadistico) || !Number.isFinite(r.pValor)) return null;
    const parametrica = operacion === 'Hipotesis_parametricas';
    // Cada cálculo tiene una vista independiente y no conserva la copia de la prueba anterior.
    const clave = `${operacion}-${datos.prueba}-${datos.modo}`;
    return <div id="pdf-cuerpo-tema6">
        <style>{`
            #reporte-formal-mat251 #pdf-cuerpo-tema6 .pdf-section{margin-bottom:12px!important;}
            #reporte-formal-mat251 #pdf-cuerpo-tema6 .pdf-t6-titulo{text-align:center;font-weight:bold;margin:6px 0!important;}
            #reporte-formal-mat251 #pdf-cuerpo-tema6 .pdf-t6-decision-verde,
            #reporte-formal-mat251 #pdf-cuerpo-tema6 .pdf-t6-decision-verde *{color:#10b981!important;}
            #reporte-formal-mat251 #pdf-cuerpo-tema6 .pdf-t6-decision-roja,
            #reporte-formal-mat251 #pdf-cuerpo-tema6 .pdf-t6-decision-roja *{color:#ef4444!important;}
            #reporte-formal-mat251 #pdf-cuerpo-tema6 table{width:100%!important;border-collapse:collapse!important;table-layout:auto!important;}
            #reporte-formal-mat251 #pdf-cuerpo-tema6 table.pdf-t6-contingencia{table-layout:fixed!important;}
            #reporte-formal-mat251 #pdf-cuerpo-tema6 .pdf-t6-contingencia th:first-child,
            #reporte-formal-mat251 #pdf-cuerpo-tema6 .pdf-t6-contingencia td:first-child{width:32%;overflow-wrap:anywhere;}
            #reporte-formal-mat251 #pdf-cuerpo-tema6 th,#reporte-formal-mat251 #pdf-cuerpo-tema6 td{border:1px solid #000!important;padding:5px 4px!important;text-align:center;}
            #reporte-formal-mat251 #pdf-cuerpo-tema6 .mat251-stat-label-container{cursor:default!important;border-bottom:0!important;text-decoration:none!important;}
            #reporte-formal-mat251 #pdf-cuerpo-tema6 .pdf-t6-hipotesis{display:flex!important;flex-direction:column;align-items:center!important;text-align:center!important;}
            #reporte-formal-mat251 #pdf-cuerpo-tema6 .pdf-t6-hipotesis div{border:0!important;background:transparent!important;text-align:center!important;}
            #reporte-formal-mat251 #pdf-cuerpo-tema6 .katex-display{margin:4px 0!important;padding:0!important;}
            #reporte-formal-mat251 #pdf-cuerpo-tema6 .katex .hide-tail{overflow:hidden!important;}
            #reporte-formal-mat251 #pdf-cuerpo-tema6 .pdf-t6-grafica{width:100%;max-width:640px;margin:0 auto;}
            #reporte-formal-mat251 #pdf-cuerpo-tema6 .pdf-t6-etiqueta .katex,
            #reporte-formal-mat251 #pdf-cuerpo-tema6 .pdf-t6-etiqueta .katex-display{padding:0!important;margin:0!important;}
            #reporte-formal-mat251 #pdf-cuerpo-tema6 .recharts-cartesian-axis-tick-value,
            #reporte-formal-mat251 #pdf-cuerpo-tema6 .recharts-cartesian-axis-tick-value tspan{font-size:7pt!important;}
            .pdf-t6-origen{position:fixed;left:0;top:0;width:640px;visibility:hidden;pointer-events:none;z-index:-1;--text-pure:#000;--text-main:#000;--text-muted:#000;--bg-card:#fff;--bg-input:#fff;--border-color:#000;--primary-color:#3b82f6;}
            .pdf-t6-origen .widget-grafico{width:640px!important;height:330px!important;margin:0!important;}
            .pdf-t6-origen .widget-header{display:none!important;}
            .pdf-t6-origen .widget-body{min-height:0!important;}
            .pdf-t6-origen .contenedor-grafico-interno{top:0!important;left:0!important;right:0!important;bottom:0!important;}
            .pdf-t6-origen .leyenda-grafica-tema6{font-size:10px!important;}
        `}</style>
        <div className="pdf-section" style={{ textAlign: 'center' }}>
            <h2 className="pdf-t6-titulo" style={{ textTransform: 'uppercase' }}>{parametrica ? 'Hipótesis Paramétricas' : 'Hipótesis No Paramétricas'}</h2>
            <Titulo>{nombres[datos.prueba]}{datos.prueba === 'chi_cuadrada' ? r.subtipo === 'bondad' ? ' — Bondad de Ajuste' : ' — Independencia' : ''}</Titulo>
            <div><strong>Modo de Ejecución:</strong> {datos.modo === 'matriz' ? 'Análisis de Matriz' : 'Modo Manual'}</div>
            <div style={{ marginTop: '6px' }}><strong>Nivel de Significación:</strong> <MathPDF math={`\\alpha=${r.calculos.alpha}\\quad(${dec(r.calculos.alpha * 100, 2)}\\%)`} /></div>
        </div>
        {datos.modo === 'matriz' && datos.nombreVariable && <div className="pdf-section"><strong>Variable Analizada:</strong> {datos.nombreVariable}</div>}
        <DatosPDF datos={datos} />
        <ResultadosPDF key={clave} datos={datos} onListo={onListo} />
    </div>;
}
