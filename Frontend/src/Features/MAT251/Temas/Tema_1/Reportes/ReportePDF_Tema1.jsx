import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

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

function DiagramaVennPDF({ resultado }) {
    if (!resultado) return null;

    const pA = Number(resultado.pA) || 0;
    const pB = Number(resultado.pB) || 0;
    const pInterseccion = Number(resultado.pAandB) || 0;
    const pUnion = Number(resultado.pAorB) || 0;
    const nameA = resultado.nameA || 'Evento A';
    const nameB = resultado.nameB || 'Evento B';

    return (
        <svg
            viewBox="0 0 560 285"
            width="560"
            height="285"
            role="img"
            aria-label={`Diagrama de Venn de la unión de ${nameA} y ${nameB}`}
            style={{ width: '560px', maxWidth: '100%', height: 'auto', display: 'block', margin: 0, flex: '0 1 560px', fontFamily: 'Arial, Helvetica, sans-serif' }}
        >
            <text x="280" y="24" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#000000">
                Área de la Unión: P(A ∪ B) = {pUnion.toFixed(4)}
            </text>
            <circle cx="220" cy="142" r="88" fill="#bbf7d0" fillOpacity="0.72" stroke="#059669" strokeWidth="2.5" />
            <circle cx="340" cy="142" r="88" fill="#bbf7d0" fillOpacity="0.72" stroke="#059669" strokeWidth="2.5" />

            <text x="174" y="132" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#166534">A</text>
            <text x="386" y="132" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#166534">B</text>
            <text x="174" y="157" textAnchor="middle" fontSize="12" fill="#000000">{(pA - pInterseccion).toFixed(4)}</text>
            <text x="280" y="157" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#000000">{pInterseccion.toFixed(4)}</text>
            <text x="386" y="157" textAnchor="middle" fontSize="12" fill="#000000">{(pB - pInterseccion).toFixed(4)}</text>

            <text x="150" y="258" textAnchor="middle" fontSize="11" fill="#000000">A: {nameA}</text>
            <text x="410" y="258" textAnchor="middle" fontSize="11" fill="#000000">B: {nameB}</text>
        </svg>
    );
}

const escaparTextoLatex = (valor) => String(valor ?? '').replace(/[\\{}%$&#_^]/g, caracter => ({
    '\\': '\\textbackslash{}',
    '{': '\\{',
    '}': '\\}',
    '%': '\\%',
    '$': '\\$',
    '&': '\\&',
    '#': '\\#',
    '_': '\\_',
    '^': '\\^{}'
}[caracter]));

const formatoConteo = valor => Number.isInteger(Number(valor))
    ? String(Number(valor))
    : Number(valor || 0).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');

function FlujoMultiplicacionPDF({ resultado, modReemplazo }) {
    if (!resultado) return null;

    const esManual = Boolean(resultado.isManualDinamic);
    const eventos = esManual
        ? (resultado.events || []).map(evento => ({ name: evento.name, prob: Number(evento.prob) || 0 }))
        : [
            { name: resultado.nameA, prob: Number(resultado.pA) || 0, count: resultado.countA, total: resultado.totalA },
            { name: resultado.nameB, prob: Number(resultado.pB) || 0, count: resultado.countB, total: resultado.totalB }
        ];
    if (!eventos.length) return null;

    const ancho = 120 + eventos.length * 240;
    const alto = 180;
    const color = '#2563eb';
    const colorTexto = '#1f2937';
    const interseccion = eventos.map((_, indice) => String.fromCharCode(65 + indice)).join(' ∩ ');
    const nombreCorto = nombre => String(nombre || '').length > 18 ? `${String(nombre).slice(0, 17)}…` : String(nombre || '');

    return (
        <svg viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label="Flujo lineal de extracciones sucesivas"
            style={{ display: 'block', width: '100%', maxWidth: '760px', height: 'auto', margin: '0 auto', fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <defs>
                <marker id="flecha-flujo-multiplicacion-pdf" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                    <path d="M0,0 L0,6 L9,3 z" fill={color} />
                </marker>
            </defs>
            <rect x="10" y="35" width="100" height="60" rx="8" fill="#eff6ff" stroke={color} strokeWidth="2" />
            <text x="60" y="59" textAnchor="middle" fontSize="12" fontWeight="bold" fill={colorTexto}>Total</text>
            <text x="60" y="79" textAnchor="middle" fontSize="14" fontWeight="bold" fill={color}>{esManual ? 'N = 100%' : `N = ${resultado.totalA}`}</text>
            {eventos.map((evento, indice) => {
                const inicioX = 110 + indice * 240;
                const cajaX = inicioX + 110;
                const letra = String.fromCharCode(65 + indice);
                const letrasPrevias = Array.from({ length: indice }, (_, idx) => String.fromCharCode(65 + idx)).join('');
                const condicion = modReemplazo === 'sin_reemplazo' && indice > 0 ? `P(${letra}|${letrasPrevias})` : `P(${letra})`;
                const conteo = esManual
                    ? `P = ${evento.prob.toFixed(4)}`
                    : (indice === 0 ? `n = ${formatoConteo(evento.count)}` : `n = ${formatoConteo(evento.count)} / ${formatoConteo(evento.total)}`);
                return (
                    <g key={`flujo-mult-${indice}`}>
                        <text x={inicioX + 55} y="31" textAnchor="middle" fontSize="12" fill={colorTexto}>Extr. {indice + 1} ({letra})</text>
                        <line x1={inicioX} y1="65" x2={cajaX - 5} y2="65" stroke={color} strokeWidth="2" markerEnd="url(#flecha-flujo-multiplicacion-pdf)" />
                        <text x={inicioX + 55} y="111" textAnchor="middle" fontSize="12" fill={colorTexto}>{condicion} = {evento.prob.toFixed(4)}</text>
                        <rect x={cajaX} y="35" width="130" height="60" rx="8" fill="#eff6ff" stroke={color} strokeWidth="2" />
                        <text x={cajaX + 65} y="59" textAnchor="middle" fontSize="12" fontWeight="bold" fill={colorTexto}>{nombreCorto(evento.name)}</text>
                        <text x={cajaX + 65} y="79" textAnchor="middle" fontSize="13" fontWeight="bold" fill={color}>{conteo}</text>
                    </g>
                );
            })}
            <rect x={ancho / 2 - 170} y="126" width="340" height="34" rx="17" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" />
            <text x={ancho / 2} y="147" textAnchor="middle" fontSize="13" fill="#047857">
                P({interseccion}) = {(Number(resultado.pAandB) || 0).toFixed(4)} ({((Number(resultado.pAandB) || 0) * 100).toFixed(1)}%)
            </text>
        </svg>
    );
}

function ArbolMultiplicacionPDF({ resultado, filas = [], varSeleccionada, modReemplazo }) {
    if (!resultado) return null;

    const colorActivo = '#10b981';
    const colorInactivo = '#94a3b8';
    const truncate = texto => String(texto || '').length > 16 ? `${String(texto).slice(0, 15)}…` : String(texto || '');

    if (resultado.isManualDinamic) {
        const eventos = resultado.events || [];
        const ancho = Math.max(820, 220 * eventos.length + 420);
        const alto = Math.max(230, 207 + Math.max(0, eventos.length - 1) * 58);
        const raizX = 90;
        const raizY = 72;
        const anchoCaja = 120;
        const centroEvento = indice => 320 + indice * 220;
        const recortarNombre = nombre => String(nombre || '').length > 15 ? `${String(nombre).slice(0, 12)}...` : String(nombre || '');
        const probabilidadTotal = eventos.reduce((producto, evento) => producto * (Number(evento.prob) || 0), 1);
        return (
            <svg viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-label="Árbol de probabilidades sucesivas en modo manual"
                style={{ display: 'block', width: '100%', maxWidth: '100%', height: 'auto', margin: '0 auto', fontFamily: 'Arial, Helvetica, sans-serif' }}>
                <defs>
                    <marker id="flecha-arbol-activa-manual-pdf" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill={colorActivo} /></marker>
                    <marker id="flecha-arbol-inactiva-manual-pdf" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill={colorInactivo} /></marker>
                </defs>
                <rect x={raizX - 40} y={raizY - 25} width="80" height="50" rx="8" fill="#f8fafc" stroke={colorInactivo} strokeWidth="2" />
                <text x={raizX} y={raizY - 5} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#334155">Total</text>
                <text x={raizX} y={raizY + 12} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0f172a">N = 100%</text>
                {eventos.map((evento, indice) => {
                    const letra = String.fromCharCode(65 + indice);
                    const probabilidad = Math.max(0, Math.min(1, Number(evento.prob) || 0));
                    const xCentro = centroEvento(indice);
                    const desdeX = indice === 0 ? raizX + 40 : centroEvento(indice - 1) + anchoCaja / 2;
                    const hastaX = xCentro - anchoCaja / 2 - 7;
                    const xMedio = (desdeX + xCentro - anchoCaja / 2) / 2;
                    const inactivaY = raizY + 80 + indice * 58;
                    const yMedioInactivo = (raizY + inactivaY) / 2;
                    const nombre = String(evento.name || letra);
                    return (
                        <g key={`arbol-manual-${indice}`}>
                            <line x1={desdeX} y1={raizY} x2={hastaX} y2={raizY} stroke={colorActivo} strokeWidth="3" markerEnd="url(#flecha-arbol-activa-manual-pdf)" strokeLinecap="round" />
                            <rect x={xMedio - 34} y={raizY - 31} width="68" height="19" rx="5" fill="#ffffff" />
                            <text x={xMedio} y={raizY - 17} textAnchor="middle" fontSize="11" fontWeight="bold" fill={colorActivo}>P={probabilidad.toFixed(4)}</text>
                            <rect x={xCentro - anchoCaja / 2} y={raizY - 25} width={anchoCaja} height="50" rx="6" fill="#ecfdf5" stroke={colorActivo} strokeWidth="2" />
                            <text x={xCentro} y={raizY - 5} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#064e3b">{recortarNombre(nombre)}</text>
                            <text x={xCentro} y={raizY + 13} textAnchor="middle" fontSize="12" fontWeight="bold" fill={colorActivo}>P = {probabilidad.toFixed(4)}</text>

                            <line x1={desdeX} y1={raizY} x2={hastaX} y2={inactivaY} stroke={colorInactivo} strokeWidth="1.5" markerEnd="url(#flecha-arbol-inactiva-manual-pdf)" strokeLinecap="round" />
                            <rect x={xMedio - 38} y={yMedioInactivo - 23} width="76" height="19" rx="5" fill="#ffffff" />
                            <text x={xMedio} y={yMedioInactivo - 9} textAnchor="middle" fontSize="11" fontWeight="bold" fill={colorInactivo}>P={(1 - probabilidad).toFixed(4)}</text>
                            <rect x={xCentro - anchoCaja / 2} y={inactivaY - 25} width={anchoCaja} height="50" rx="6" fill="#ffffff" stroke={colorInactivo} strokeWidth="1" />
                            <text x={xCentro} y={inactivaY - 5} textAnchor="middle" fontSize="12" fill="#475569">{recortarNombre(`No ${nombre}`)}</text>
                            <text x={xCentro} y={inactivaY + 13} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#64748b">P = {(1 - probabilidad).toFixed(4)}</text>
                            {indice === eventos.length - 1 && (
                                <text x={xCentro + anchoCaja / 2 + 10} y={raizY + 5} textAnchor="start" fontSize="12" fontWeight="bold" fill={colorActivo}>
                                    ← RUTA SELECCIONADA ({probabilidadTotal.toFixed(4)})
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        );
    }

    const nombresColumnas = Array.isArray(varSeleccionada?.nombresColumnas) ? varSeleccionada.nombresColumnas : [];
    const colA = resultado.colA;
    const colB = resultado.colB;
    const idxA = nombresColumnas.indexOf(colA);
    const idxB = nombresColumnas.indexOf(colB);
    if (idxA < 0 || idxB < 0) return null;

    const datos = filas.map(fila => {
        const valores = Array.isArray(fila?.valor) ? fila.valor : String(fila?.valor ?? '').split(/\s*\|\s*/);
        return { valA: String(valores[idxA] ?? '').trim(), valB: String(valores[idxB] ?? '').trim() };
    }).filter(fila => fila.valA && fila.valB);
    const total = datos.length;
    if (!total) return null;

    const conteoA = {};
    const conteoB = {};
    datos.forEach(fila => {
        conteoA[fila.valA] = (conteoA[fila.valA] || 0) + 1;
        conteoB[fila.valB] = (conteoB[fila.valB] || 0) + 1;
    });
    const totalB = modReemplazo === 'sin_reemplazo' ? total - 1 : total;
    const ramas = Object.keys(conteoA).sort().map(valorA => {
        const cuentaA = conteoA[valorA];
        const hijos = Object.keys(conteoB).sort().map(valorB => {
            let cuentaB = conteoB[valorB];
            if (modReemplazo === 'sin_reemplazo') {
                const conjunta = datos.filter(fila => fila.valA === valorA && fila.valB === valorB).length;
                const reduccion = cuentaA > 0 ? conjunta / cuentaA : 0;
                cuentaB = Number(Math.max(0, cuentaB - reduccion).toFixed(2));
            }
            return {
                valor: valorB,
                cuenta: cuentaB,
                prob: totalB > 0 ? cuentaB / totalB : 0,
                activa: valorA === resultado.nameA && valorB === resultado.nameB
            };
        });
        return { valor: valorA, cuenta: cuentaA, hijos, activa: valorA === resultado.nameA };
    });
    const totalHojas = ramas.reduce((suma, rama) => suma + rama.hijos.length, 0);
    const alto = Math.max(190, 90 + (totalHojas - 1) * 54);
    const raizX = 70;
    const primerX = 310;
    const segundoX = 560;
    const yInicial = (alto - totalHojas * 54) / 2 + 27;
    let siguienteY = yInicial;
    ramas.forEach(rama => {
        const primeraY = siguienteY;
        rama.hijos.forEach(hijo => { hijo.y = siguienteY; siguienteY += 54; });
        rama.y = (primeraY + siguienteY - 54) / 2;
    });

    return (
        <svg viewBox={`0 0 850 ${alto}`} role="img" aria-label="Árbol de probabilidades sucesivas de la matriz"
            style={{ display: 'block', width: '100%', maxWidth: '850px', height: 'auto', margin: '0 auto', fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <defs>
                <marker id="flecha-arbol-activa-matriz-pdf" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill={colorActivo} /></marker>
                <marker id="flecha-arbol-inactiva-matriz-pdf" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill={colorInactivo} /></marker>
            </defs>
            <rect x={raizX - 40} y={alto / 2 - 25} width="80" height="50" rx="8" fill="#f8fafc" stroke={colorInactivo} strokeWidth="2" />
            <text x={raizX} y={alto / 2 - 5} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#334155">Total</text>
            <text x={raizX} y={alto / 2 + 12} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#0f172a">N = {total}</text>
            {ramas.map((rama, indiceRama) => {
                const colorA = rama.activa ? colorActivo : colorInactivo;
                return (
                    <g key={`rama-a-${indiceRama}`}>
                        <line x1={raizX + 40} y1={alto / 2} x2={primerX - 65} y2={rama.y} stroke={colorA} strokeWidth={rama.activa ? 3 : 1.5} markerEnd={rama.activa ? 'url(#flecha-arbol-activa-matriz-pdf)' : 'url(#flecha-arbol-inactiva-matriz-pdf)'} />
                        <rect x={(raizX + primerX - 65) / 2 - 32} y={(alto / 2 + rama.y) / 2 - 11} width="64" height="18" rx="4" fill="#ffffff" />
                        <text x={(raizX + primerX - 65) / 2} y={(alto / 2 + rama.y) / 2 + 2} textAnchor="middle" fontSize="10" fontWeight="bold" fill={colorA}>{rama.cuenta}/{total}</text>
                        <rect x={primerX - 60} y={rama.y - 22} width="120" height="44" rx="6" fill={rama.activa ? '#ecfdf5' : '#ffffff'} stroke={colorA} strokeWidth={rama.activa ? 2 : 1} />
                        <text x={primerX} y={rama.y - 3} textAnchor="middle" fontSize="11" fontWeight={rama.activa ? 'bold' : 'normal'} fill={rama.activa ? '#064e3b' : '#475569'}>{truncate(rama.valor)}</text>
                        <text x={primerX} y={rama.y + 13} textAnchor="middle" fontSize="10" fontWeight="bold" fill={colorA}>n = {rama.cuenta}</text>
                        {rama.hijos.map((hijo, indiceHijo) => {
                            const colorB = hijo.activa ? colorActivo : colorInactivo;
                            return (
                                <g key={`rama-b-${indiceRama}-${indiceHijo}`}>
                                    <line x1={primerX + 60} y1={rama.y} x2={segundoX - 65} y2={hijo.y} stroke={colorB} strokeWidth={hijo.activa ? 3 : 1.5} markerEnd={hijo.activa ? 'url(#flecha-arbol-activa-matriz-pdf)' : 'url(#flecha-arbol-inactiva-matriz-pdf)'} />
                                    <rect x={(primerX + 60 + segundoX - 65) / 2 - 32} y={(rama.y + hijo.y) / 2 - 11} width="64" height="18" rx="4" fill="#ffffff" />
                                    <text x={(primerX + 60 + segundoX - 65) / 2} y={(rama.y + hijo.y) / 2 + 2} textAnchor="middle" fontSize="10" fontWeight="bold" fill={colorB}>{formatoConteo(hijo.cuenta)}/{totalB}</text>
                                    <rect x={segundoX - 60} y={hijo.y - 22} width="120" height="44" rx="6" fill={hijo.activa ? '#ecfdf5' : '#ffffff'} stroke={colorB} strokeWidth={hijo.activa ? 2 : 1} />
                                    <text x={segundoX} y={hijo.y - 3} textAnchor="middle" fontSize="11" fontWeight={hijo.activa ? 'bold' : 'normal'} fill={hijo.activa ? '#064e3b' : '#475569'}>{truncate(hijo.valor)}</text>
                                    <text x={segundoX} y={hijo.y + 13} textAnchor="middle" fontSize="10" fontWeight="bold" fill={colorB}>P = {hijo.prob.toFixed(4)}</text>
                                    {hijo.activa && <text x={segundoX + 68} y={hijo.y + 4} textAnchor="start" fontSize="11" fontWeight="bold" fill={colorActivo}>← RUTA SELECCIONADA</text>}
                                </g>
                            );
                        })}
                    </g>
                );
            })}
        </svg>
    );
}

const maximoComunDivisor = (a, b) => {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) [x, y] = [y, x % y];
    return x || 1;
};

const parsearEventosExp = (texto) => {
    if (Array.isArray(texto)) return texto.map(v => String(v).trim()).filter(Boolean);
    return String(texto ?? '').split(/[\n,;]/).map(valor => valor.trim()).filter(Boolean);
};

const getSimboloOperadorExp = (op) => {
    switch (op) {
        case 'eq': return '=';
        case 'neq': return '≠';
        case 'gt': return '>';
        case 'gte': return '≥';
        case 'lt': return '<';
        case 'lte': return '≤';
        default: return op || '=';
    }
};

const construirEspacioEvaluadoSimple = (comp, res) => {
    if (!comp && !res) return '\\Omega = \\{\\}';
    const compId = comp?.id || (res?.nombres ? Object.keys(res.nombres)[0] : 'componente-1');
    const favSet = new Set((res?.favorables || []).map(f => String(f[compId] ?? '').trim()));

    let evts = [];
    if (res?.universo && res.universo.length > 0) {
        evts = res.universo.map(caso => String(caso[compId] ?? '').trim());
    } else if (comp?.eventos) {
        evts = parsearEventosExp(comp.eventos);
    }

    const elementosLatex = evts.map(ev => {
        const txt = String(ev).trim();
        const esFav = favSet.has(txt);
        const isNum = /^-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(txt);
        const valFormateado = isNum 
            ? (esFav ? `\\mathbf{${txt}}` : txt) 
            : (esFav ? `\\textbf{${txt}}` : `\\text{${txt}}`);
        if (esFav) {
            return `\\textcolor{#07865b}{${valFormateado}}`;
        }
        return valFormateado;
    });

    if (elementosLatex.length > 16) {
        const chunks = [];
        for (let i = 0; i < elementosLatex.length; i += 16) {
            chunks.push(elementosLatex.slice(i, i + 16).join(', \\; '));
        }
        return `\\Omega = \\left\\{\\begin{array}{l} ${chunks.join(' \\\\ ')} \\end{array}\\right\\}`;
    }

    return `\\Omega = \\left\\{ ${elementosLatex.join(', \\; ')} \\right\\}`;
};

const construirEspacioEvaluadoCompuesto = (comps, res) => {
    if (!comps || !res) return '\\Omega = \\{\\}';
    const vars = comps.map(c => c.id);
    const favSet = new Set((res.favorables || []).map(f => JSON.stringify(vars.map(id => String(f[id] ?? '').trim()))));

    const elementos = (res.universo || []).map(caso => {
        const clave = JSON.stringify(vars.map(id => String(caso[id] ?? '').trim()));
        const esFav = favSet.has(clave);
        const vals = vars.map(id => {
            const v = String(caso[id] ?? '').trim();
            const isNum = /^-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(v);
            return isNum 
                ? (esFav ? `\\mathbf{${v}}` : v) 
                : (esFav ? `\\textbf{${v}}` : `\\text{${v}}`);
        });
        const tupla = `\\left(${vals.join(', \\; ')}\\right)`;
        if (esFav) {
            return `\\textcolor{#07865b}{\\boldsymbol{${tupla}}}`;
        }
        return tupla;
    });

    const porFila = 6;
    const filas = [];
    for (let i = 0; i < elementos.length; i += porFila) {
        filas.push(elementos.slice(i, i + porFila).join(', \\; '));
    }
    return `\\Omega = \\left\\{\\begin{array}{l} ${filas.join(' \\\\ ')} \\end{array}\\right\\}`;
};

function LlaveMuestralPDF({ lado, filas = 6 }) {
    const reflejar = lado === 'derecho';
    const alturaPx = Math.max(22, filas * 15.5);

    return (
        <svg
            style={{
                height: `${alturaPx}px`,
                width: "9px",
                flex: "0 0 9px",
                overflow: "visible",
                display: "inline-block",
                verticalAlign: "middle"
            }}
            viewBox="0 0 32 100"
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            <path
                d="M30 1 C17 1 16 8 16 23 C16 39 12 46 2 50 C12 54 16 61 16 77 C16 92 17 99 30 99"
                transform={reflejar ? "translate(32 0) scale(-1 1)" : undefined}
                fill="none"
                stroke="#000000"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}

function EspacioMuestralCompuestoPDF({ comps, res, evaluado = false }) {
    if (!comps || comps.length === 0) return null;
    const vars = comps.map(c => c.id);

    let casos = res?.universo;
    if (!casos || casos.length === 0) {
        const evtsPorComp = comps.map(c => parsearEventosExp(c.eventos));
        casos = evtsPorComp.reduce((acc, evts, idx) => {
            const compId = vars[idx];
            if (acc.length === 0) return evts.map(e => ({ [compId]: e }));
            return acc.flatMap(item => evts.map(e => ({ ...item, [compId]: e })));
        }, []);
    }

    const favSet = evaluado
        ? new Set((res?.favorables || []).map(f => JSON.stringify(vars.map(id => String(f[id] ?? '').trim()))))
        : null;

    const elementos = casos.map(caso => {
        const vals = vars.map(id => String(caso[id] ?? '').trim());
        const clave = JSON.stringify(vals);
        const esFav = favSet ? favSet.has(clave) : false;
        return {
            texto: `(${vals.join(', ')})`,
            esFav
        };
    });

    const eventosUltimo = comps.length > 0 ? parsearEventosExp(comps[comps.length - 1]?.eventos) : [];
    let porFila = 6;
    if (comps.length === 2 && eventosUltimo.length >= 2 && eventosUltimo.length <= 12) {
        porFila = eventosUltimo.length;
    } else if (eventosUltimo.length >= 4 && eventosUltimo.length <= 10) {
        porFila = eventosUltimo.length;
    } else if (elementos.length % 6 === 0) {
        porFila = 6;
    } else if (elementos.length % 4 === 0) {
        porFila = 4;
    } else if (eventosUltimo.length >= 2) {
        porFila = eventosUltimo.length;
    }

    const elementosMostrar = elementos;
    const cantidadFilas = Math.ceil(elementosMostrar.length / porFila);

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            margin: "4px 0",
            fontSize: "7.5pt",
            fontFamily: "KaTeX_Main, 'Times New Roman', serif"
        }}>
            <span style={{ fontSize: "10pt", fontStyle: "italic", fontWeight: "bold" }}>Ω</span>
            <span style={{ fontSize: "10pt", margin: "0 2px" }}>=</span>
            <LlaveMuestralPDF lado="izquierdo" filas={cantidadFilas} />
            <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${porFila}, max-content)`,
                columnGap: "7px",
                rowGap: "2px",
                textAlign: "center",
                lineHeight: "1.25",
                fontSize: "7.5pt"
            }}>
                {elementosMostrar.map(({ texto, esFav }, idx) => {
                    const esUltimo = idx === elementosMostrar.length - 1;
                    return (
                        <span
                            key={idx}
                            className={esFav ? "texto-verde-pdf" : undefined}
                            style={{
                                whiteSpace: "nowrap",
                                color: esFav ? "#07865b !important" : "#000000",
                                fontWeight: esFav ? "bold" : "normal"
                            }}
                        >
                            {texto}{!esUltimo ? ',' : ''}
                        </span>
                    );
                })}
            </div>
            <LlaveMuestralPDF lado="derecho" filas={cantidadFilas} />
        </div>
    );
}

function ArbolProbabilidadPDF({ desglose = [], causasBayes = [] }) {
    if (!desglose || desglose.length === 0) return null;

    const count = desglose.length;
    const height = Math.max(220, count * 105 + 40);
    const rootX = 65;
    const rootY = height / 2;
    const nodeAX = 380;
    const nodeBX = 660;
    const width = 800;

    const hasBayes = Array.isArray(causasBayes) && causasBayes.length > 0;
    const defaultColor = '#0284c7';
    const bayesColor = '#ea580c';
    const dimColor = '#64748b';

    let maxWPill = 80;
    let maxWLabel1 = 115;
    let maxWLabel2 = 125;

    desglose.forEach(rama => {
        const l1 = `P(${rama.nombre})=${Number(rama.pA || 0).toFixed(4)}`;
        const l2 = `P(A|${rama.nombre})=${Number(rama.pB_A || 0).toFixed(4)}`;
        maxWPill = Math.max(maxWPill, (rama.nombre || '').length * 8 + 26);
        maxWLabel1 = Math.max(maxWLabel1, l1.length * 6.5 + 16);
        maxWLabel2 = Math.max(maxWLabel2, l2.length * 6.5 + 16);
    });

    return (
        <div className="pdf-section" style={{ width: '100%', margin: '18px 0 0 0', pageBreakInside: 'avoid', breakInside: 'avoid', textAlign: 'center' }}>
            <div style={{ fontSize: '10.5pt', fontWeight: 'bold', color: '#000000', marginBottom: '8px', textAlign: 'center' }}>
                DIAGRAMA: ÁRBOL DE PROBABILIDAD
            </div>
            <div style={{ width: '100%', maxWidth: '680px', margin: '0 auto' }}>
                <svg
                    viewBox={`0 0 ${width} ${height + 40}`}
                    style={{ width: '100%', height: 'auto', display: 'block', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}
                >
                    {desglose.map((rama, i) => {
                        const ySpacing = height / (count + 1);
                        const nodeAY = ySpacing * (i + 1);

                        const label1Text = `P(${rama.nombre})=${Number(rama.pA || 0).toFixed(4)}`;
                        const label2Text = `P(A|${rama.nombre})=${Number(rama.pB_A || 0).toFixed(4)}`;
                        const pillText = rama.nombre;

                        const wPill = maxWPill;
                        const wLabel1 = maxWLabel1;
                        const wLabel2 = maxWLabel2;

                        const pillX = nodeAX - wPill;

                        const midX1 = (rootX + pillX) / 2;
                        const midY1 = (rootY + nodeAY) / 2;

                        const midX2 = (nodeAX + nodeBX - 70) / 2;
                        const midY2 = (nodeAY + nodeAY - 32) / 2;

                        const midX3 = (nodeAX + nodeBX - 70) / 2;
                        const midY3 = (nodeAY + nodeAY + 32) / 2;

                        const isBayesTarget = hasBayes && causasBayes.includes(rama.nombre);
                        const isOtherBayes = hasBayes && !causasBayes.includes(rama.nombre);

                        const currentColor = isBayesTarget ? bayesColor : defaultColor;
                        const lineOpacity = isOtherBayes ? "0.2" : "1";
                        const textOpacity = isOtherBayes ? "0.35" : "1";
                        const strokeWidthCurrent = isBayesTarget ? "3" : "2";

                        return (
                            <g key={rama.id || i}>
                                {/* Línea raíz -> causa */}
                                <line
                                    x1={rootX} y1={rootY}
                                    x2={pillX} y2={nodeAY}
                                    stroke={currentColor}
                                    strokeWidth={strokeWidthCurrent}
                                    opacity={lineOpacity}
                                />
                                {/* Etiqueta P(B_i) */}
                                <rect
                                    x={midX1 - wLabel1 / 2} y={midY1 - 10}
                                    width={wLabel1} height="20" rx="3"
                                    fill="#ffffff" stroke={currentColor} strokeWidth="1"
                                    strokeOpacity={lineOpacity}
                                />
                                <text
                                    x={midX1} y={midY1 + 4}
                                    textAnchor="middle" fontSize="10"
                                    fill={currentColor} fontWeight="bold"
                                    opacity={textOpacity}
                                >
                                    {label1Text}
                                </text>

                                {/* Nodo causa */}
                                <rect
                                    x={pillX} y={nodeAY - 12}
                                    width={wPill} height="24" rx="12"
                                    fill={currentColor} opacity={textOpacity}
                                />
                                <text
                                    x={pillX + wPill / 2} y={nodeAY + 4}
                                    textAnchor="middle" fontSize="10.5" fontWeight="bold"
                                    fill="#ffffff"
                                >
                                    {pillText}
                                </text>

                                {/* Sub-rama éxito (A) */}
                                <line
                                    x1={nodeAX} y1={nodeAY}
                                    x2={nodeBX - 70} y2={nodeAY - 32}
                                    stroke={currentColor} strokeWidth={strokeWidthCurrent}
                                    opacity={lineOpacity}
                                />
                                {/* Etiqueta P(A|B_i) */}
                                <rect
                                    x={midX2 - wLabel2 / 2} y={midY2 - 10}
                                    width={wLabel2} height="20" rx="3"
                                    fill="#ffffff" stroke={currentColor} strokeWidth="1"
                                    strokeOpacity={lineOpacity}
                                />
                                <text
                                    x={midX2} y={midY2 + 4}
                                    textAnchor="middle" fontSize="10"
                                    fill={currentColor} fontWeight="bold"
                                    opacity={textOpacity}
                                >
                                    {label2Text}
                                </text>

                                {/* Nodo Éxito A */}
                                <rect
                                    x={nodeBX - 70} y={nodeAY - 32 - 11}
                                    width="70" height="22" rx="4"
                                    fill={currentColor} opacity={textOpacity}
                                />
                                <text
                                    x={nodeBX - 35} y={nodeAY - 32 + 4}
                                    textAnchor="middle" fontSize="10" fontWeight="bold"
                                    fill="#ffffff"
                                >
                                    A (Éxito)
                                </text>

                                {/* Multiplicador Final */}
                                <text
                                    x={nodeBX + 8} y={nodeAY - 32 + 4}
                                    fontSize="11" fontWeight="bold"
                                    fill={currentColor} opacity={textOpacity}
                                >
                                    = {Number(rama.mult || 0).toFixed(4)}
                                </text>

                                {/* Sub-rama fracaso (A') */}
                                <line
                                    x1={nodeAX} y1={nodeAY}
                                    x2={nodeBX - 70} y2={nodeAY + 32}
                                    stroke={dimColor} strokeWidth="1.2" strokeDasharray="4,4"
                                    opacity={isOtherBayes ? "0.2" : "0.7"}
                                />
                                <rect
                                    x={midX3 - 22} y={midY3 - 8}
                                    width="44" height="16" rx="3"
                                    fill="#ffffff" stroke={dimColor} strokeWidth="1"
                                    strokeOpacity={isOtherBayes ? "0.2" : "0.6"}
                                />
                                <text
                                    x={midX3} y={midY3 + 3.5}
                                    textAnchor="middle" fontSize="9"
                                    fill={dimColor} opacity={isOtherBayes ? "0.3" : "0.85"}
                                >
                                    {(1 - Number(rama.pB_A || 0)).toFixed(4)}
                                </text>

                                <rect
                                    x={nodeBX - 70} y={nodeAY + 32 - 9}
                                    width="70" height="18" rx="4"
                                    fill="#ffffff" stroke={dimColor} strokeWidth="1"
                                    strokeOpacity={isOtherBayes ? "0.2" : "0.7"}
                                />
                                <text
                                    x={nodeBX - 35} y={nodeAY + 32 + 3.5}
                                    textAnchor="middle" fontSize="9.5"
                                    fill={dimColor} opacity={isOtherBayes ? "0.3" : "0.85"}
                                >
                                    A' (Otro)
                                </text>
                            </g>
                        );
                    })}

                    {/* Nodo Raíz Inicio */}
                    <rect x={rootX - 60} y={rootY - 14} width="60" height="28" rx="14" fill="#1d4ed8" />
                    <text x={rootX - 30} y={rootY + 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">
                        Inicio
                    </text>
                    <circle cx={rootX} cy={rootY} r="4" fill="#ffffff" />

                    {/* Leyenda */}
                    {(() => {
                        const legendY = height + 24;
                        return (
                            <text x={width / 2} y={legendY} textAnchor="middle" fontSize="10" fill="#475569">
                                <tspan fill={defaultColor} fontWeight="bold">■ </tspan>
                                Rutas ponderadas que conforman la Probabilidad Total
                                {hasBayes && (
                                    <tspan fill={bayesColor} fontWeight="bold"> | ■ Rutas evaluadas con el Teorema de Bayes</tspan>
                                )}
                            </text>
                        );
                    })()}
                </svg>
            </div>
        </div>
    );
}

export default function ReportePDF_Tema1({
    operacion,
    subTipoProbabilidad = 'clasica',
    inputModeProb = 'matriz',
    resConteo,
    tipoElementos = 'letras',
    elementosBase = [],
    resProbabilidad,
    resultadoAdicion,
    colAAdicion,
    valAAdicion,
    colBAdicion,
    valBAdicion,
    resultadoMult,
    resultadoSimulador,
    datosExperimento,
    // Metadatos de contexto
    varSeleccionada,
    colProbClasica,
    filas = [],
    eventoFavorable = [],
    eventoCondicion = []
}) {
    // ── Configuración de Conteo ──
    const tipoElegidoConteo = resConteo?.tipoElementos || tipoElementos || 'letras';
    let labelTipoConteo = 'A, B, C...';
    if (tipoElegidoConteo === 'numeros') {
        labelTipoConteo = '1, 2, 3...';
    } else if (tipoElegidoConteo === 'personalizado') {
        labelTipoConteo = 'Elementos personalizados';
    }

    const nNumConteo = parseInt(resConteo?.n) || 0;
    let baseConteo = resConteo?.elementosBase || elementosBase || [];
    if (!baseConteo || baseConteo.length === 0) {
        if (tipoElegidoConteo === 'letras') {
            baseConteo = Array.from({ length: nNumConteo }, (_, i) => String.fromCharCode(65 + i));
        } else if (tipoElegidoConteo === 'numeros') {
            baseConteo = Array.from({ length: nNumConteo }, (_, i) => (i + 1).toString());
        }
    }

    // ── Formateo de eventos para Probabilidad ──
    const formatoEventos = (evts) => {
        if (!evts || (Array.isArray(evts) && evts.length === 0)) return '-';
        const str = Array.isArray(evts) ? evts.join(', ') : String(evts).trim();
        if (str.startsWith('{') && str.endsWith('}')) return str;
        return `{ ${str} }`;
    };

    const formatoEventosPlano = (evts) => {
        if (!evts || (Array.isArray(evts) && evts.length === 0)) return '-';
        if (Array.isArray(evts)) return evts.join(', ');
        return String(evts).replace(/^\{\s*|\s*\}$/g, '').trim();
    };

    const nombreVariableOColumna = colProbClasica || varSeleccionada?.nombre || 'Variable activa';

    const filasValidas = (filas && filas.length > 0)
        ? filas.filter(f => (f.valor || '').toString().trim() !== '')
        : (varSeleccionada?.datos && Array.isArray(varSeleccionada.datos))
            ? varSeleccionada.datos.map((d, i) => ({ id: i + 1, valor: d }))
            : [];

    // Si proviene de una matriz con múltiples columnas en Clásica o Frecuentista,
    // se extraen exclusivamente los datos de la columna seleccionada con la que se trabajó
    const nombreColumnaEfectiva = colProbClasica || varSeleccionada?.nombresColumnas?.[0] || varSeleccionada?.nombre || 'Datos';
    const indiceColumnaAnalizada = (varSeleccionada?.nombresColumnas && varSeleccionada.nombresColumnas.length > 1)
        ? (colProbClasica ? varSeleccionada.nombresColumnas.indexOf(colProbClasica) : 0)
        : -1;

    const filasClasicaFrecuentista = (indiceColumnaAnalizada !== -1)
        ? filasValidas.map((fila, idx) => {
            const partes = (fila.valor || '').toString().split(' | ');
            return {
                id: fila.id ?? idx + 1,
                valor: partes[indiceColumnaAnalizada] !== undefined ? partes[indiceColumnaAnalizada].trim() : (fila.valor || '')
            };
        })
        : filasValidas;

    return (
        <div id="pdf-cuerpo-tema1">
            {/* ══════════════════════════════════════════════════════════════
                CASO A: TÉCNICAS DE CONTEO
               ══════════════════════════════════════════════════════════════ */}
            {operacion === 'conteo' && resConteo && (
                <div className="pdf-section">
                    <h2 style={{ fontSize: "12pt", color: "#000000", margin: "0 0 12px", fontWeight: "bold", textAlign: "center" }}>
                        RESULTADOS: TÉCNICAS DE CONTEO
                    </h2>
                    <div style={{ margin: "0 0 14px 0", fontSize: "10pt", color: "#000000", lineHeight: "1.5" }}>
                        <div>
                            Evaluación de combinatoria para un total de <MathSpan math={`\\mathbf{n} = ${resConteo.n ?? 'N'}`} /> elementos tomando subconjuntos de tamaño <MathSpan math={`\\mathbf{r} = ${resConteo.r ?? 'R'}`} />:
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "20px", marginTop: "5px", fontSize: "9.5pt" }}>
                            <div>
                                <strong>Tipo de Elementos:</strong> {labelTipoConteo}
                            </div>
                            {baseConteo.length > 0 && nNumConteo <= 26 && (
                                <div>
                                    <strong>Conjunto Base:</strong> {'{ ' + baseConteo.join(', ') + ' }'}
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                        {/* Permutaciones */}
                        <div className="tarjeta-resultado-pdf" style={{ border: "1px solid #000000" }}>
                            <div style={{ fontSize: "11pt", fontWeight: "bold", color: "#000000", marginBottom: "8px", textAlign: "center" }}>
                                PERMUTACIONES (Importa el orden)
                            </div>
                            <div style={{ textAlign: "center", margin: "10px 0" }}>
                                <MathSpan math={`P(${resConteo.n},\\,${resConteo.r}) = \\dfrac{${resConteo.n}!}{(${resConteo.n} - ${resConteo.r})!} = \\mathbf{${resConteo.permutacion?.resultado?.toLocaleString() || 0}}`} display={true} />
                            </div>
                            <p style={{ fontSize: "9pt", color: "#000000", margin: "6px 0 0 0", textAlign: "center", fontStyle: "italic" }}>
                                {resConteo.permutacion?.explicacion || "Formas ordenadas posibles."}
                            </p>
                            {resConteo.permutacion?.elementos?.length > 0 && resConteo.n <= 10 && (
                                <div style={{ marginTop: "12px", borderTop: "1px dashed #000000", paddingTop: "8px" }}>
                                    <div style={{ fontSize: "8.5pt", fontWeight: "bold", color: "#000000", marginBottom: "4px" }}>
                                        Visualización de Elementos ({resConteo.permutacion.elementos.length}):
                                    </div>
                                    <div style={{ fontSize: "8pt", color: "#000000", lineHeight: "1.8", fontFamily: "monospace" }}>
                                        {resConteo.permutacion.elementos.join(", ")}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Combinaciones */}
                        <div className="tarjeta-resultado-pdf" style={{ border: "1px solid #000000" }}>
                            <div style={{ fontSize: "11pt", fontWeight: "bold", color: "#000000", marginBottom: "8px", textAlign: "center" }}>
                                COMBINACIONES (No importa el orden)
                            </div>
                            <div style={{ textAlign: "center", margin: "10px 0" }}>
                                <MathSpan math={`C(${resConteo.n},\\,${resConteo.r}) = \\dfrac{${resConteo.n}!}{${resConteo.r}!(${resConteo.n} - ${resConteo.r})!} = \\mathbf{${resConteo.combinacion?.resultado?.toLocaleString() || 0}}`} display={true} />
                            </div>
                            <p style={{ fontSize: "9pt", color: "#000000", margin: "6px 0 0 0", textAlign: "center", fontStyle: "italic" }}>
                                {resConteo.combinacion?.explicacion || "Grupos únicos posibles."}
                            </p>
                            {resConteo.combinacion?.elementos?.length > 0 && resConteo.n <= 10 && (
                                <div style={{ marginTop: "12px", borderTop: "1px dashed #000000", paddingTop: "8px" }}>
                                    <div style={{ fontSize: "8.5pt", fontWeight: "bold", color: "#000000", marginBottom: "4px" }}>
                                        Visualización de Elementos ({resConteo.combinacion.elementos.length}):
                                    </div>
                                    <div style={{ fontSize: "8pt", color: "#000000", lineHeight: "1.8", fontFamily: "monospace" }}>
                                        {resConteo.combinacion.elementos.join(", ")}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                CASO B: CÁLCULO DE PROBABILIDAD (3 OPCIONES)
               ══════════════════════════════════════════════════════════════ */}
            {(operacion === 'probabilidad' || operacion === 'clasica' || !operacion) && (resProbabilidad || (inputModeProb === 'experimentos' && datosExperimento?.resultado)) && (
                <div className="pdf-section">
                    {/* ─────────────────────────────────────────────────────────────
                        OPCIÓN 1: PROBABILIDAD CLÁSICA (A PRIORI / LAPLACE)
                       ───────────────────────────────────────────────────────────── */}
                    {subTipoProbabilidad === 'clasica' && (
                        inputModeProb === 'experimentos' && datosExperimento?.resultado ? (
                            /* ── REPORTE PARA MODO EXPERIMENTOS (SIMPLE Y COMPUESTO) ── */
                            (() => {
                                const {
                                    resultado: resExp,
                                    tipoExperimento: tipoExp = 'simple',
                                    componentes: compExp = [],
                                    reglas: reglasExp = []
                                } = datosExperimento;

                                const kExp = resExp?.cantidadFavorable ?? 0;
                                const nExp = resExp?.total ?? 1;
                                const divisorExp = maximoComunDivisor(kExp, nExp);
                                const kSimpExp = kExp / divisorExp;
                                const nSimpExp = nExp / divisorExp;
                                const tieneSimpExp = divisorExp > 1 && (kSimpExp !== kExp || nSimpExp !== nExp);
                                const pDecExp = nExp > 0 ? (kExp / nExp).toFixed(4) : '0.0000';
                                const pPctExp = nExp > 0 ? ((kExp / nExp) * 100).toFixed(2) : '0.00';

                                const nombresCompMap = Object.fromEntries(
                                    compExp.map((c, idx) => [c.id, (c.nombre || `Experimento ${idx + 1}`).trim()])
                                );

                                const obtenerTextoReglaExp = (regla) => {
                                    const op = getSimboloOperadorExp(regla.operador);
                                    if (regla.tipo === 'suma') {
                                        const vars = Array.isArray(regla.variablesSuma) && regla.variablesSuma.length > 0
                                            ? regla.variablesSuma
                                            : [regla.variable, regla.variableB].filter(Boolean);
                                        const nombresSuma = vars.map(id => nombresCompMap[id] || id).join(' + ');
                                        return `(${nombresSuma}) ${op} ${regla.valor}`;
                                    }
                                    const nombreVar = nombresCompMap[regla.variable] || regla.variable || 'Experimento';
                                    return `${nombreVar} ${op} ${regla.valor}`;
                                };

                                const esMatriz2D = tipoExp === 'compuesto' && compExp.length === 2 && nExp <= 36;
                                const c1 = compExp[0];
                                const c2 = compExp[1];
                                const ev1 = c1 ? parsearEventosExp(c1.eventos) : [];
                                const ev2 = c2 ? parsearEventosExp(c2.eventos) : [];
                                const favSet = new Set((resExp?.favorables || []).map(f => `${f[c1?.id]}|||${f[c2?.id]}`));

                                return (
                                    <div>
                                        <h2 style={{ fontSize: "12pt", color: "#000000", margin: "0 0 4px", fontWeight: "bold", textAlign: "center", textTransform: "uppercase" }}>
                                            PROBABILIDAD CLÁSICA
                                        </h2>
                                        <div style={{ textAlign: "center", fontSize: "10pt", color: "#000000", margin: "0 0 14px 0" }}>
                                            <strong>Modo:</strong> Experimentos ({tipoExp === 'compuesto' ? 'Compuesto' : 'Simple'})
                                        </div>

                                        {/* ── 1. CONFIGURACIÓN DEL EXPERIMENTO ── */}
                                        {tipoExp === 'simple' ? (
                                            <div style={{ fontSize: "10pt", color: "#000000", marginBottom: "10px", lineHeight: 1.4 }}>
                                                <div><strong>Experimento:</strong> {compExp[0]?.nombre || 'Experimento 1'}</div>
                                                <div><strong>Resultados posibles ({compExp[0]?.eventos ? parsearEventosExp(compExp[0].eventos).length : 0}):</strong> {compExp[0]?.eventos ? parsearEventosExp(compExp[0].eventos).join(', ') : '-'}</div>

                                                {/* Espacio Muestral centrado en el medio */}
                                                <div style={{ textAlign: "center", margin: "6px 0 4px 0" }}>
                                                    <div style={{ fontSize: "10pt", fontWeight: "bold", color: "#000000", marginBottom: "3px" }}>
                                                        Espacio Muestral:
                                                    </div>
                                                    <div style={{ fontSize: "11pt" }}>
                                                        <MathSpan
                                                            math={`\\Omega = \\left\\{ ${compExp[0]?.eventos ? parsearEventosExp(compExp[0].eventos).join(', \\; ') : ''} \\right\\}`}
                                                            display={true}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ marginBottom: "10px" }}>
                                                <div style={{ fontSize: "10pt", fontWeight: "bold", color: "#000000", marginBottom: "4px" }}>
                                                    Experimentos que componen el sistema:
                                                </div>
                                                <table style={{ width: "100%", margin: "0 0 6px 0" }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: "45px", textAlign: "center" }}>Nº</th>
                                                            <th style={{ width: "160px", textAlign: "center" }}>Experimento</th>
                                                            <th style={{ textAlign: "center" }}>Eventos Posibles</th>
                                                            <th style={{ width: "145px", textAlign: "center", whiteSpace: "nowrap" }}>Resultados (<MathSpan math="n_i" />)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {compExp.map((comp, idx) => {
                                                            const evts = parsearEventosExp(comp.eventos);
                                                            return (
                                                                <tr key={comp.id || idx}>
                                                                    <td style={{ textAlign: "center", fontWeight: "bold" }}>{idx + 1}</td>
                                                                    <td style={{ textAlign: "center", fontWeight: "bold" }}>{comp.nombre || `Experimento ${idx + 1}`}</td>
                                                                    <td style={{ textAlign: "center" }}>{evts.join(', ')}</td>
                                                                    <td style={{ textAlign: "center", fontWeight: "bold" }}>{evts.length}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                                {/* Espacio Muestral Compuesto en 7.5pt con llaves vectoriales SVG */}
                                                <div style={{ textAlign: "center", margin: "6px 0 6px 0" }}>
                                                    <div style={{ fontSize: "10pt", fontWeight: "bold", color: "#000000", marginBottom: "3px" }}>
                                                        Espacio Muestral:
                                                    </div>
                                                    <EspacioMuestralCompuestoPDF comps={compExp} res={resExp} />
                                                </div>
                                            </div>
                                        )}

                                        {/* ── 2. CONDICIONES DEL EVENTO (REGLAS EVALUADAS) ── */}
                                        <div style={{ marginBottom: "10px" }}>
                                            <div style={{ fontSize: "10pt", fontWeight: "bold", color: "#000000", marginBottom: "4px" }}>
                                                Condiciones del Evento de Interés:
                                            </div>
                                            <table style={{ width: "100%", margin: "0 0 8px 0" }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: "45px", textAlign: "center" }}>Nº</th>
                                                        <th style={{ width: "80px", textAlign: "center" }}>Conector</th>
                                                        <th style={{ width: "160px", textAlign: "center" }}>Tipo</th>
                                                        <th style={{ textAlign: "center" }}>Condición Evaluada</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reglasExp.map((regla, idx) => (
                                                        <tr key={regla.id || idx}>
                                                            <td style={{ textAlign: "center", fontWeight: "bold" }}>{idx + 1}</td>
                                                            <td style={{ textAlign: "center", fontWeight: "bold" }}>{idx === 0 ? '-' : (regla.conector === 'or' ? 'O' : 'Y')}</td>
                                                            <td style={{ textAlign: "center" }}>{regla.tipo === 'suma' ? 'Suma de Experimentos' : 'Variable Individual'}</td>
                                                            <td style={{ textAlign: "center", fontWeight: "bold" }}>{obtenerTextoReglaExp(regla)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* ── 3. TABLA RESUMEN DE RESULTADOS ── */}
                                        <table style={{ width: "100%", margin: "0 0 10px 0" }}>
                                            <thead>
                                                <tr>
                                                    <th>Evento / Condición</th>
                                                    <th>Resultados Favorables <MathSpan math="k" /></th>
                                                    <th>Resultados Posibles <MathSpan math="n" /></th>
                                                    <th>Decimal</th>
                                                    <th>Porcentaje (%)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td style={{ textAlign: "center", fontWeight: "bold" }}>
                                                        {reglasExp.length > 0 ? reglasExp.map(r => obtenerTextoReglaExp(r)).join(' ; ') : 'Evento E'}
                                                    </td>
                                                    <td style={{ textAlign: "center", fontWeight: "bold" }}>{kExp}</td>
                                                    <td style={{ textAlign: "center", fontWeight: "bold" }}>{nExp}</td>
                                                    <td style={{ textAlign: "center", fontWeight: "bold" }}>{pDecExp}</td>
                                                    <td style={{ textAlign: "center", fontSize: "11pt", fontWeight: "bold", color: "#000000" }}>
                                                        {pPctExp}%
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* ── 4. FÓRMULA KA-TEX IDÉNTICA A LA APLICACIÓN ── */}
                                        <div style={{ textAlign: "center", margin: "10px 0", padding: "6px 0" }}>
                                            <MathSpan
                                                math={`P(E) = \\dfrac{k}{n} = \\dfrac{${kExp}}{${nExp}}${tieneSimpExp ? ` = \\dfrac{${kSimpExp}}{${nSimpExp}}` : ''} = ${pDecExp} = ${pPctExp}\\%`}
                                                display={true}
                                            />
                                        </div>

                                        {/* ── 5. EVALUACIÓN FINAL DEL ESPACIO MUESTRAL CON COLOR VERDE ── */}
                                        <div style={{ marginTop: "10px" }}>
                                            <div style={{ textAlign: "center", fontSize: "11pt", fontWeight: "bold", color: "#000000", marginBottom: "4px" }}>
                                                Espacio muestral
                                            </div>
                                            <div style={{ padding: "2px 0", backgroundColor: "#ffffff" }}>
                                                {tipoExp === 'simple' ? (
                                                    <div style={{ textAlign: "center", fontSize: "11.5pt" }}>
                                                        <MathSpan
                                                            math={construirEspacioEvaluadoSimple(compExp[0], resExp)}
                                                            display={true}
                                                        />
                                                    </div>
                                                ) : (
                                                    <EspacioMuestralCompuestoPDF
                                                        comps={compExp}
                                                        res={resExp}
                                                        evaluado={true}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()
                        ) : resProbabilidad ? (
                            <div>
                                <h2 style={{ fontSize: "12pt", color: "#000000", margin: "0 0 4px", fontWeight: "bold", textAlign: "center", textTransform: "uppercase" }}>
                                    PROBABILIDAD CLÁSICA
                                </h2>
                                <div style={{ textAlign: "center", fontSize: "10pt", color: "#000000", margin: "0 0 14px 0" }}>
                                    <strong>Modo:</strong> {inputModeProb === 'manual' ? 'Modo Manual' : 'Análisis de Matriz'}
                                </div>

                                {/* ── TABLA CON LOS DATOS QUE SE TRABAJÓ (SOLO EN ANÁLISIS DE MATRIZ) ── */}
                                {inputModeProb !== 'manual' && filasClasicaFrecuentista.length > 0 && (
                                    <div style={{ marginBottom: "16px" }}>
                                        {filasClasicaFrecuentista.length > 15 ? (
                                            /* 1 columna con más de 15 datos: 2 pares de columnas lado a lado para optimizar espacio */
                                            <table className="tabla-datos-pdf" style={{ width: "100%", marginBottom: "14px" }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: "45px", textAlign: "center" }}>Nº</th>
                                                        <th style={{ textAlign: "center" }}>{nombreColumnaEfectiva}</th>
                                                        <th style={{ width: "45px", textAlign: "center" }}>Nº</th>
                                                        <th style={{ textAlign: "center" }}>{nombreColumnaEfectiva}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(() => {
                                                        const mitad = Math.ceil(filasClasicaFrecuentista.length / 2);
                                                        const rows = [];
                                                        for (let i = 0; i < mitad; i++) {
                                                            const f1 = filasClasicaFrecuentista[i];
                                                            const f2 = filasClasicaFrecuentista[i + mitad];
                                                            rows.push(
                                                                <tr key={i}>
                                                                    <td style={{ textAlign: "center", fontWeight: "bold" }}>{i + 1}</td>
                                                                    <td style={{ textAlign: "center" }}>{f1?.valor ?? ''}</td>
                                                                    <td style={{ textAlign: "center", fontWeight: "bold" }}>{f2 ? i + mitad + 1 : ''}</td>
                                                                    <td style={{ textAlign: "center" }}>{f2 ? f2.valor : ''}</td>
                                                                </tr>
                                                            );
                                                        }
                                                        return rows;
                                                    })()}
                                                </tbody>
                                            </table>
                                        ) : (
                                            /* 1 columna estándar recortada a la mitad (50% centrada) */
                                            <div style={{ width: "50%", margin: "0 auto 16px auto" }}>
                                                <table className="tabla-datos-pdf" style={{ width: "100%", margin: 0 }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: "35%", textAlign: "center" }}>Nº</th>
                                                            <th style={{ textAlign: "center" }}>
                                                                {nombreColumnaEfectiva}
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filasClasicaFrecuentista.map((fila, idx) => (
                                                            <tr key={idx}>
                                                                <td style={{ textAlign: "center", fontWeight: "bold" }}>{idx + 1}</td>
                                                                <td style={{ textAlign: "center" }}>{fila.valor}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Evento Favorable E */}
                                {inputModeProb !== 'manual' && (
                                    <div style={{ fontSize: "10pt", color: "#000000", margin: "14px 0 10px 0" }}>
                                        <strong>Evento Favorable <MathSpan math="E" />:</strong> {formatoEventos(eventoFavorable)}
                                    </div>
                                )}

                                {/* Tabla de Resultados (idéntica a las tarjetas del sistema) */}
                                <table style={{ width: inputModeProb === 'manual' ? "75%" : "100%", margin: inputModeProb === 'manual' ? "0 auto 16px auto" : "0 0 16px 0" }}>
                                    <thead>
                                        <tr>
                                            {inputModeProb !== 'manual' && <th>Eventos <MathSpan math="E" /></th>}
                                            <th>Resultados Favorables <MathSpan math="k" /></th>
                                            <th>Resultados Posibles <MathSpan math="n" /></th>
                                            <th>Porcentaje (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            {inputModeProb !== 'manual' && (
                                                <td style={{ textAlign: "center", fontWeight: "bold" }}>{formatoEventosPlano(eventoFavorable)}</td>
                                            )}
                                            <td style={{ textAlign: "center", fontWeight: "bold" }}>{resProbabilidad.casosFavorables ?? 0}</td>
                                            <td style={{ textAlign: "center", fontWeight: "bold" }}>{resProbabilidad.casosTotales ?? 0}</td>
                                            <td style={{ textAlign: "center", fontSize: "11pt", fontWeight: "bold", color: "#000000" }}>
                                                {resProbabilidad.probabilidadPorcentaje ? `${resProbabilidad.probabilidadPorcentaje}%` : "0.00%"}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Fórmula idéntica a la aplicación web (sin borde y protegida de recorte) */}
                                <div style={{ textAlign: "center", margin: "16px 0 20px 0", padding: "10px 0" }}>
                                    <MathSpan
                                        math={`P(E) = \\dfrac{k}{n} = \\dfrac{${resProbabilidad.casosFavorables || 0}}{${resProbabilidad.casosTotales || 0}} = ${resProbabilidad.probabilidadDecimal || '0.0000'}`}
                                        display={true}
                                    />
                                </div>
                            </div>
                        ) : null
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        OPCIÓN 2: PROBABILIDAD FRECUENTISTA (EMPÍRICA / ESTOCÁSTICA)
                       ───────────────────────────────────────────────────────────── */}
                    {subTipoProbabilidad === 'frecuentista' && (
                        <div>
                            <h2 style={{ fontSize: "12pt", color: "#000000", margin: "0 0 4px", fontWeight: "bold", textAlign: "center", textTransform: "uppercase" }}>
                                PROBABILIDAD FRECUENTISTA
                            </h2>
                            <div style={{ textAlign: "center", fontSize: "10pt", color: "#000000", margin: "0 0 14px 0" }}>
                                <strong>Modo:</strong> {inputModeProb === 'manual' ? 'Modo Manual' : 'Análisis de Matriz'}
                            </div>

                            {/* ── TABLA CON LOS DATOS QUE SE TRABAJÓ (SOLO EN ANÁLISIS DE MATRIZ) ── */}
                            {inputModeProb !== 'manual' && filasClasicaFrecuentista.length > 0 && (
                                <div style={{ marginBottom: "16px" }}>
                                    {filasClasicaFrecuentista.length > 15 ? (
                                        /* 1 columna con más de 15 datos: 2 pares de columnas lado a lado para optimizar espacio */
                                        <table className="tabla-datos-pdf" style={{ width: "100%", marginBottom: "14px" }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: "45px", textAlign: "center" }}>Nº</th>
                                                    <th style={{ textAlign: "center" }}>{nombreColumnaEfectiva}</th>
                                                    <th style={{ width: "45px", textAlign: "center" }}>Nº</th>
                                                    <th style={{ textAlign: "center" }}>{nombreColumnaEfectiva}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    const mitad = Math.ceil(filasClasicaFrecuentista.length / 2);
                                                    const rows = [];
                                                    for (let i = 0; i < mitad; i++) {
                                                        const f1 = filasClasicaFrecuentista[i];
                                                        const f2 = filasClasicaFrecuentista[i + mitad];
                                                        rows.push(
                                                            <tr key={i}>
                                                                <td style={{ textAlign: "center", fontWeight: "bold" }}>{i + 1}</td>
                                                                <td style={{ textAlign: "center" }}>{f1?.valor ?? ''}</td>
                                                                <td style={{ textAlign: "center", fontWeight: "bold" }}>{f2 ? i + mitad + 1 : ''}</td>
                                                                <td style={{ textAlign: "center" }}>{f2 ? f2.valor : ''}</td>
                                                            </tr>
                                                        );
                                                    }
                                                    return rows;
                                                })()}
                                            </tbody>
                                        </table>
                                    ) : (
                                        /* 1 columna estándar recortada a la mitad (50% centrada) */
                                        <div style={{ width: "50%", margin: "0 auto 16px auto" }}>
                                            <table className="tabla-datos-pdf" style={{ width: "100%", margin: 0 }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: "35%", textAlign: "center" }}>Nº</th>
                                                        <th style={{ textAlign: "center" }}>
                                                            {nombreColumnaEfectiva}
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filasClasicaFrecuentista.map((fila, idx) => (
                                                        <tr key={idx}>
                                                            <td style={{ textAlign: "center", fontWeight: "bold" }}>{idx + 1}</td>
                                                            <td style={{ textAlign: "center" }}>{fila.valor}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Evento de Interés E */}
                            {inputModeProb !== 'manual' && (
                                <div style={{ fontSize: "10pt", color: "#000000", margin: "14px 0 10px 0" }}>
                                    <strong>Evento de Interés <MathSpan math="E" />:</strong> {formatoEventos(eventoFavorable)}
                                </div>
                            )}

                            {/* Tabla de Resultados (idéntica a las tarjetas del sistema) */}
                            <table style={{ width: inputModeProb === 'manual' ? "80%" : "100%", margin: inputModeProb === 'manual' ? "0 auto 16px auto" : "0 0 16px 0" }}>
                                <thead>
                                    <tr>
                                        {inputModeProb !== 'manual' && <th>Evento <MathSpan math="E" /></th>}
                                        <th>Frecuencia <MathSpan math="f" /></th>
                                        <th>Total <MathSpan math="n" /></th>
                                        <th>Decimal</th>
                                        <th>Porcentaje (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {inputModeProb !== 'manual' && (
                                            <td style={{ textAlign: "center", fontWeight: "bold" }}>{formatoEventosPlano(eventoFavorable)}</td>
                                        )}
                                        <td style={{ textAlign: "center", fontWeight: "bold" }}>{resProbabilidad.casosFavorables ?? 0}</td>
                                        <td style={{ textAlign: "center", fontWeight: "bold" }}>{resProbabilidad.casosTotales ?? 0}</td>
                                        <td style={{ textAlign: "center", fontWeight: "bold" }}>
                                            {resProbabilidad.probabilidadDecimal ?? "0.0000"}
                                        </td>
                                        <td style={{ textAlign: "center", fontSize: "11pt", fontWeight: "bold", color: "#000000" }}>
                                            {resProbabilidad.probabilidadPorcentaje ? `${resProbabilidad.probabilidadPorcentaje}%` : "0.00%"}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Fórmula idéntica a la aplicación web (sin borde y protegida de recorte) */}
                            <div style={{ textAlign: "center", margin: "16px 0 20px 0", padding: "10px 0" }}>
                                <MathSpan
                                    math={`P(E) = \\dfrac{f}{n} = \\dfrac{${resProbabilidad.casosFavorables || 0}}{${resProbabilidad.casosTotales || 0}} = ${resProbabilidad.probabilidadDecimal || '0.0000'}`}
                                    display={true}
                                />
                            </div>
                        </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        OPCIÓN 3: PROBABILIDAD CONDICIONAL (ESPACIO REDUCIDO)
                       ───────────────────────────────────────────────────────────── */}
                    {subTipoProbabilidad === 'condicional' && (
                        <div>
                            <h2 style={{ fontSize: "12pt", color: "#000000", margin: "0 0 4px", fontWeight: "bold", textAlign: "center", textTransform: "uppercase" }}>
                                PROBABILIDAD CONDICIONAL
                            </h2>
                            <div style={{ textAlign: "center", fontSize: "10pt", color: "#000000", margin: "0 0 14px 0" }}>
                                <strong>Modo:</strong> {inputModeProb === 'manual' ? 'Modo Manual' : 'Análisis de Matriz'}
                            </div>

                            {/* ── TABLA CON LOS DATOS QUE SE TRABAJÓ (SOLO EN ANÁLISIS DE MATRIZ) ── */}
                            {inputModeProb !== 'manual' && filasValidas.length > 0 && (
                                <div style={{ marginBottom: "16px" }}>
                                    {varSeleccionada?.nombresColumnas && varSeleccionada.nombresColumnas.length > 1 ? (
                                        /* Matriz con múltiples columnas */
                                        <table className="tabla-datos-pdf" style={{ width: "100%", marginBottom: "14px" }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: "50px", textAlign: "center" }}>Nº</th>
                                                    {varSeleccionada.nombresColumnas.map((colName, idx) => (
                                                        <th key={idx} style={{ textAlign: "center" }}>{colName}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filasValidas.map((fila, idx) => {
                                                    const partes = (fila.valor || '').toString().split(' | ');
                                                    return (
                                                        <tr key={idx}>
                                                            <td style={{ textAlign: "center", fontWeight: "bold" }}>{idx + 1}</td>
                                                            {varSeleccionada.nombresColumnas.map((_, cIdx) => (
                                                                <td key={cIdx} style={{ textAlign: "center" }}>{partes[cIdx] ? partes[cIdx].trim() : '-'}</td>
                                                            ))}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    ) : filasValidas.length > 15 ? (
                                        /* 1 columna con más de 15 datos: 2 pares de columnas lado a lado para optimizar espacio */
                                        <table className="tabla-datos-pdf" style={{ width: "100%", marginBottom: "14px" }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: "45px", textAlign: "center" }}>Nº</th>
                                                    <th style={{ textAlign: "center" }}>{colProbClasica || varSeleccionada?.nombre || 'Datos'}</th>
                                                    <th style={{ width: "45px", textAlign: "center" }}>Nº</th>
                                                    <th style={{ textAlign: "center" }}>{colProbClasica || varSeleccionada?.nombre || 'Datos'}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    const mitad = Math.ceil(filasValidas.length / 2);
                                                    const rows = [];
                                                    for (let i = 0; i < mitad; i++) {
                                                        const f1 = filasValidas[i];
                                                        const f2 = filasValidas[i + mitad];
                                                        rows.push(
                                                            <tr key={i}>
                                                                <td style={{ textAlign: "center", fontWeight: "bold" }}>{i + 1}</td>
                                                                <td style={{ textAlign: "center" }}>{f1?.valor ?? ''}</td>
                                                                <td style={{ textAlign: "center", fontWeight: "bold" }}>{f2 ? i + mitad + 1 : ''}</td>
                                                                <td style={{ textAlign: "center" }}>{f2 ? f2.valor : ''}</td>
                                                            </tr>
                                                        );
                                                    }
                                                    return rows;
                                                })()}
                                            </tbody>
                                        </table>
                                    ) : (
                                        /* 1 columna estándar recortada a la mitad (50% centrada) */
                                        <div style={{ width: "50%", margin: "0 auto 16px auto" }}>
                                            <table className="tabla-datos-pdf" style={{ width: "100%", margin: 0 }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: "35%", textAlign: "center" }}>Nº</th>
                                                        <th style={{ textAlign: "center" }}>
                                                            {colProbClasica || varSeleccionada?.nombre || 'Datos'}
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filasValidas.map((fila, idx) => (
                                                        <tr key={idx}>
                                                            <td style={{ textAlign: "center", fontWeight: "bold" }}>{idx + 1}</td>
                                                            <td style={{ textAlign: "center" }}>{fila.valor}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Evento de Interés A y Evento Condición B */}
                            {inputModeProb !== 'manual' && (
                                <div style={{ fontSize: "10pt", color: "#000000", margin: "14px 0 10px 0", display: "flex", justifyContent: "center", gap: "28px" }}>
                                    <div><strong>Evento de Interés <MathSpan math="A" />:</strong> {formatoEventos(eventoFavorable)}</div>
                                    <div><strong>Evento Condición <MathSpan math="B" />:</strong> {formatoEventos(eventoCondicion)}</div>
                                </div>
                            )}

                            {/* Tabla de Resultados (idéntica a las tarjetas del sistema) */}
                            <table style={{ width: inputModeProb === 'manual' ? "80%" : "100%", margin: inputModeProb === 'manual' ? "0 auto 16px auto" : "0 0 16px 0" }}>
                                <thead>
                                    <tr>
                                        {inputModeProb !== 'manual' && <th>Evento <MathSpan math="A" /></th>}
                                        {inputModeProb !== 'manual' && <th>Condición <MathSpan math="B" /></th>}
                                        <th>Conjunta <MathSpan math="P(AB)" /></th>
                                        <th>Condición <MathSpan math="P(B)" /></th>
                                        <th>Decimal</th>
                                        <th>Porcentaje (%)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {inputModeProb !== 'manual' && (
                                            <td style={{ textAlign: "center", fontWeight: "bold" }}>{formatoEventosPlano(eventoFavorable)}</td>
                                        )}
                                        {inputModeProb !== 'manual' && (
                                            <td style={{ textAlign: "center", fontWeight: "bold" }}>{formatoEventosPlano(eventoCondicion)}</td>
                                        )}
                                        <td style={{ textAlign: "center", fontWeight: "bold" }}>{resProbabilidad.casosFavorables ?? 0}</td>
                                        <td style={{ textAlign: "center", fontWeight: "bold" }}>{resProbabilidad.casosTotales ?? 0}</td>
                                        <td style={{ textAlign: "center", fontWeight: "bold" }}>
                                            {resProbabilidad.probabilidadDecimal ?? "0.0000"}
                                        </td>
                                        <td style={{ textAlign: "center", fontSize: "11pt", fontWeight: "bold", color: "#000000" }}>
                                            {resProbabilidad.probabilidadPorcentaje ? `${resProbabilidad.probabilidadPorcentaje}%` : "0.00%"}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Fórmula idéntica a la aplicación web (sin borde y protegida de recorte) */}
                            <div style={{ textAlign: "center", margin: "16px 0 20px 0", padding: "10px 0" }}>
                                <MathSpan
                                    math={`P(A|B) = \\dfrac{P(AB)}{P(B)} = \\dfrac{${resProbabilidad.casosFavorables || 0}}{${resProbabilidad.casosTotales || 0}} = ${resProbabilidad.probabilidadDecimal || '0.0000'}`}
                                    display={true}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════
                CASO C: REGLA DE LA ADICIÓN
               ══════════════════════════════════════════════════════════════ */}
            {operacion === 'regla_adicion' && resultadoAdicion && (() => {
                const esModoManual = resultadoAdicion.modo === 'manual';
                const total = Number(resultadoAdicion.total) || 0;
                const nA = Number(resultadoAdicion.countA) || 0;
                const nB = Number(resultadoAdicion.countB) || 0;
                const nInterseccion = Number(resultadoAdicion.countAandB) || 0;
                const pA = Number(resultadoAdicion.pA) || 0;
                const pB = Number(resultadoAdicion.pB) || 0;
                const pInterseccion = Number(resultadoAdicion.pAandB) || 0;
                const pUnion = Number(resultadoAdicion.pAorB) || 0;
                const formatoProbabilidad = valor => valor.toFixed(4);
                const colASeleccionada = resultadoAdicion.colA || colAAdicion || varSeleccionada?.nombresColumnas?.[0] || '—';
                const colBSeleccionada = resultadoAdicion.colB || colBAdicion || varSeleccionada?.nombresColumnas?.[1] || '—';
                const valASeleccionado = resultadoAdicion.valA || valAAdicion || resultadoAdicion.nameA || '—';
                const valBSeleccionado = resultadoAdicion.valB || valBAdicion || resultadoAdicion.nameB || '—';

                const nombresColumnas = Array.isArray(varSeleccionada?.nombresColumnas)
                    ? varSeleccionada.nombresColumnas
                    : [];
                const idxA = nombresColumnas.indexOf(colASeleccionada);
                const idxB = nombresColumnas.indexOf(colBSeleccionada);
                const filasFuente = Array.isArray(filas) && filas.length > 0
                    ? filas
                    : Array.isArray(varSeleccionada?.datos)
                        ? varSeleccionada.datos.map((valor, idx) => ({ id: idx + 1, valor }))
                        : [];
                const filasAnalizadas = (!esModoManual && idxA >= 0 && idxB >= 0)
                    ? filasFuente.map((fila, idx) => {
                        const valores = Array.isArray(fila?.valor)
                            ? fila.valor
                            : String(fila?.valor ?? '').split(/\s*\|\s*/);
                        return {
                            id: fila?.id ?? idx + 1,
                            valorA: String(valores[idxA] ?? '').trim(),
                            valorB: String(valores[idxB] ?? '').trim()
                        };
                    }).filter(fila => fila.valorA !== '' && fila.valorB !== '')
                    : [];

                const filasResumen = [
                    { nombre: `A: ${resultadoAdicion.nameA || 'Evento A'}`, n: nA, p: pA },
                    { nombre: `B: ${resultadoAdicion.nameB || 'Evento B'}`, n: nB, p: pB },
                    { nombre: 'A ∩ B (Intersección)', n: nInterseccion, p: pInterseccion }
                ];

                const renderFilasMatriz = (desde, hasta) => filasAnalizadas.slice(desde, hasta).map((fila, idx) => (
                    <tr key={fila.id ?? desde + idx}>
                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{desde + idx + 1}</td>
                        <td style={{ textAlign: 'center' }}>{fila.valorA}</td>
                        <td style={{ textAlign: 'center' }}>{fila.valorB}</td>
                    </tr>
                ));

                return (
                    <div style={{ width: '100%' }}>
                        <div className="pdf-section">
                            <h2 style={{ fontSize: '12pt', color: '#000000', margin: '0 0 4px', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>
                                AXIOMAS Y REGLA DE LA ADICIÓN
                            </h2>
                            <div style={{ textAlign: 'center', fontSize: '10pt', color: '#000000', margin: '0 0 14px 0' }}>
                                <strong>Modo de Ejecución:</strong> {esModoManual ? 'Modo Manual' : 'Análisis de Matriz'}
                            </div>
                            <div style={{ fontSize: '9.5pt', lineHeight: '1.6', marginBottom: '14px' }}>
                                {esModoManual ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                                        <div><strong>Evento A:</strong> {resultadoAdicion.nameA || 'A'}</div>
                                        <div><strong>Evento B:</strong> {resultadoAdicion.nameB || 'B'}</div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                                        <div><strong>Variable del evento A:</strong> {colASeleccionada}</div>
                                        <div><strong>Valor que define A:</strong> {valASeleccionado}</div>
                                        <div><strong>Variable del evento B:</strong> {colBSeleccionada}</div>
                                        <div><strong>Valor que define B:</strong> {valBSeleccionado}</div>
                                        <div><strong>Observaciones válidas (N):</strong> {total || filasAnalizadas.length}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!esModoManual && filasAnalizadas.length > 0 && (
                            <div className="pdf-section">
                                <div style={{ fontSize: '9pt', fontWeight: 'bold', marginBottom: '4px' }}>
                                    Datos Analizados de la Matriz ({filasAnalizadas.length} registros):
                                </div>
                                {filasAnalizadas.length > 15 ? (
                                    <table className="tabla-datos-pdf" style={{ width: '100%', marginBottom: '10px' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '36px' }}>Nº</th>
                                                <th>{colASeleccionada}</th>
                                                <th>{colBSeleccionada}</th>
                                                <th style={{ width: '36px' }}>Nº</th>
                                                <th>{colASeleccionada}</th>
                                                <th>{colBSeleccionada}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(() => {
                                                const mitad = Math.ceil(filasAnalizadas.length / 2);
                                                const filasCompactas = [];
                                                for (let i = 0; i < mitad; i += 1) {
                                                    const primera = filasAnalizadas[i];
                                                    const segunda = filasAnalizadas[i + mitad];
                                                    filasCompactas.push(
                                                        <tr key={i}>
                                                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{i + 1}</td>
                                                            <td style={{ textAlign: 'center' }}>{primera?.valorA ?? ''}</td>
                                                            <td style={{ textAlign: 'center' }}>{primera?.valorB ?? ''}</td>
                                                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{segunda ? i + mitad + 1 : ''}</td>
                                                            <td style={{ textAlign: 'center' }}>{segunda?.valorA ?? ''}</td>
                                                            <td style={{ textAlign: 'center' }}>{segunda?.valorB ?? ''}</td>
                                                        </tr>
                                                    );
                                                }
                                                return filasCompactas;
                                            })()}
                                        </tbody>
                                    </table>
                                ) : (
                                    <table className="tabla-datos-pdf" style={{ width: '80%', margin: '0 auto 10px auto' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '42px' }}>Nº</th>
                                                <th>{colASeleccionada}</th>
                                                <th>{colBSeleccionada}</th>
                                            </tr>
                                        </thead>
                                        <tbody>{renderFilasMatriz(0, filasAnalizadas.length)}</tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        <div className="pdf-section">
                            <div style={{ fontSize: '10pt', fontWeight: 'bold', marginBottom: '4px' }}>
                                Desglose de Frecuencias
                            </div>
                            <table style={{ width: esModoManual ? '78%' : '100%', margin: esModoManual ? '0 auto 12px auto' : '0 0 12px 0' }}>
                                <thead>
                                    <tr>
                                        <th>Evento</th>
                                        {!esModoManual && <th>Frecuencia (<MathSpan math="n" />)</th>}
                                        <th>Probabilidad (<MathSpan math="P" />)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filasResumen.map((fila, idx) => (
                                        <tr key={idx}>
                                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{fila.nombre}</td>
                                            {!esModoManual && <td style={{ textAlign: 'center' }}>{`${fila.n} / ${total}`}</td>}
                                            <td style={{ textAlign: 'center' }}>
                                                {formatoProbabilidad(fila.p)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="pdf-section" style={{ textAlign: 'center' }}>
                            <div style={{ textAlign: 'center', margin: '8px 0 12px' }}>
                                <div style={{ fontSize: '10pt', fontWeight: 'bold', marginBottom: '5px' }}>
                                    Desarrollo Matemático
                                </div>
                                <MathSpan
                                    math={`\\displaystyle P(A \\cup B) = P(A) + P(B) - P(A \\cap B)`}
                                    display={true}
                                />
                                <MathSpan
                                    math={`\\displaystyle P(A \\cup B) = P(A) + P(B) - P(A \\cap B) = ${formatoProbabilidad(pA)} + ${formatoProbabilidad(pB)} - ${formatoProbabilidad(pInterseccion)} = \\mathbf{${formatoProbabilidad(pUnion)}} \\quad \\Longleftrightarrow \\quad \\mathbf{${(pUnion * 100).toFixed(2)}\\%}`}
                                    display={true}
                                />
                            </div>
                        </div>

                        <div className="pdf-section" style={{ textAlign: 'center', width: '100%' }}>
                            <div style={{ fontSize: '10pt', fontWeight: 'bold', marginBottom: '4px' }}>
                                Diagrama de Venn (Unión de Eventos)
                            </div>
                            <div style={{ width: '100%', minHeight: '300px', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <DiagramaVennPDF resultado={resultadoAdicion} />
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ══════════════════════════════════════════════════════════════
                CASO D: REGLA DE LA MULTIPLICACIÓN
               ══════════════════════════════════════════════════════════════ */}
            {operacion === 'regla_multiplicacion' && resultadoMult && (() => {
                const esModoManual = resultadoMult.modo === 'manual' || resultadoMult.isManualDinamic;
                const modoReemplazo = resultadoMult.modReemplazo || 'con_reemplazo';
                const esSinReemplazo = modoReemplazo === 'sin_reemplazo';
                const pInterseccion = Number(resultadoMult.pAandB) || 0;
                const nombreRegimen = esSinReemplazo
                    ? 'Sin reemplazo (Dependientes)'
                    : 'Con reemplazo (Independientes)';
                const eventosManual = Array.isArray(resultadoMult.events) ? resultadoMult.events : [];
                const nombreEvento = evento => String(evento ?? '');

                const columnas = Array.isArray(varSeleccionada?.nombresColumnas)
                    ? varSeleccionada.nombresColumnas
                    : [];
                const columnaA = resultadoMult.colA || '';
                const columnaB = resultadoMult.colB || '';
                const indiceA = columnas.indexOf(columnaA);
                const indiceB = columnas.indexOf(columnaB);
                const filasFuente = Array.isArray(filas) && filas.length > 0
                    ? filas
                    : Array.isArray(varSeleccionada?.datos)
                        ? varSeleccionada.datos.map((valor, indice) => ({ id: indice + 1, valor }))
                        : [];
                const filasMatriz = (!esModoManual && indiceA >= 0 && indiceB >= 0)
                    ? filasFuente.map((fila, indice) => {
                        const valores = Array.isArray(fila?.valor)
                            ? fila.valor
                            : String(fila?.valor ?? '').split(/\s*\|\s*/);
                        return {
                            id: fila?.id ?? indice + 1,
                            valorA: String(valores[indiceA] ?? '').trim(),
                            valorB: String(valores[indiceB] ?? '').trim()
                        };
                    }).filter(fila => fila.valorA !== '' && fila.valorB !== '')
                    : [];

                const filasDesglose = esModoManual
                    ? eventosManual.map((evento, indice) => ({
                        paso: `Extracción ${indice + 1}`,
                        evento: `${String.fromCharCode(65 + indice)}: ${nombreEvento(evento.name)}${esSinReemplazo && indice > 0 ? ' (dado anterior)' : ''}`,
                        probabilidad: Number(evento.prob) || 0
                    }))
                    : [
                        {
                            paso: 'Extracción 1',
                            evento: `A: ${resultadoMult.nameA || 'A'}`,
                            fraccion: `${formatoConteo(resultadoMult.countA)} / ${formatoConteo(resultadoMult.totalA)}`,
                            probabilidad: Number(resultadoMult.pA) || 0
                        },
                        {
                            paso: 'Extracción 2',
                            evento: `B: ${resultadoMult.nameB || 'B'}${esSinReemplazo ? ' (dado A)' : ''}`,
                            fraccion: `${formatoConteo(resultadoMult.countB)} / ${formatoConteo(resultadoMult.totalB)}`,
                            probabilidad: Number(resultadoMult.pB) || 0
                        }
                    ];

                const filasCompactas = [];
                if (filasMatriz.length > 15) {
                    const mitad = Math.ceil(filasMatriz.length / 2);
                    for (let indice = 0; indice < mitad; indice += 1) {
                        filasCompactas.push({ primera: filasMatriz[indice], segunda: filasMatriz[indice + mitad] });
                    }
                }

                const latexEvento = nombre => `\\text{${escaparTextoLatex(nombre)}}`;
                let formulaGeneral;
                let formulaDesarrollo;
                if (esModoManual) {
                    const nombres = eventosManual.map((evento, indice) => latexEvento(evento.name || String.fromCharCode(65 + indice)));
                    const interseccion = nombres.join(' \\cap ');
                    const factores = eventosManual.map((evento, indice) => {
                        if (esSinReemplazo && indice > 0) {
                            return `P(${nombres[indice]}|${nombres.slice(0, indice).join(' \\cap ')})`;
                        }
                        return `P(${nombres[indice]})`;
                    });
                    const valores = eventosManual.map(evento => (Number(evento.prob) || 0).toFixed(4));
                    formulaGeneral = `P(${interseccion}) = ${factores.join(' \\times ')}`;
                    formulaDesarrollo = `P(${interseccion}) = ${valores.join(' \\times ')} = \\mathbf{${pInterseccion.toFixed(4)}} \\quad \\Longleftrightarrow \\quad \\mathbf{${(pInterseccion * 100).toFixed(2)}\\%}`;
                } else {
                    formulaGeneral = esSinReemplazo
                        ? 'P(A \\cap B) = P(A) \\times P(B|A)'
                        : 'P(A \\cap B) = P(A) \\times P(B)';
                    formulaDesarrollo = `P(A \\cap B) = ${(Number(resultadoMult.pA) || 0).toFixed(4)} \\times ${(Number(resultadoMult.pB) || 0).toFixed(4)} = \\mathbf{${pInterseccion.toFixed(4)}} \\quad \\Longleftrightarrow \\quad \\mathbf{${(pInterseccion * 100).toFixed(2)}\\%}`;
                }

                return (
                    <div style={{ width: '100%' }}>
                        <div className="pdf-section">
                            <h2 style={{ fontSize: '12pt', color: '#000000', margin: '0 0 4px', fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase' }}>
                                REGLA DE LA MULTIPLICACIÓN
                            </h2>
                            <div style={{ textAlign: 'center', fontSize: '10pt', color: '#000000', margin: '0 0 14px 0' }}>
                                <strong>Modo de Ejecución:</strong> {esModoManual ? 'Modo Manual' : 'Análisis de Matriz'}
                            </div>
                            <div style={{ fontSize: '9pt', lineHeight: '1.6', marginBottom: '14px' }}>
                                <div style={{ marginBottom: '4px' }}><strong>Tipo de Extracción:</strong> {nombreRegimen}</div>
                                {!esModoManual && (
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
                                        <div><strong>Variable de A:</strong> {columnaA || '—'}</div>
                                        <div><strong>Condición de A:</strong> {resultadoMult.valA || resultadoMult.nameA || '—'}</div>
                                        <div><strong>Variable de B:</strong> {columnaB || '—'}</div>
                                        <div><strong>Condición de B:</strong> {resultadoMult.valB || resultadoMult.nameB || '—'}</div>
                                        <div><strong>Observaciones válidas (N):</strong> {resultadoMult.totalA || filasMatriz.length}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {!esModoManual && filasMatriz.length > 0 && (
                            <div className="pdf-section">
                                <div style={{ fontSize: '9pt', fontWeight: 'bold', marginBottom: '4px' }}>
                                    Datos Analizados de la Matriz ({filasMatriz.length} registros):
                                </div>
                                {filasMatriz.length > 15 ? (
                                    <table className="tabla-datos-pdf" style={{ width: '100%', marginBottom: '10px' }}>
                                        <thead><tr>
                                            <th style={{ width: '36px' }}>Nº</th><th>{columnaA}</th><th>{columnaB}</th>
                                            <th style={{ width: '36px' }}>Nº</th><th>{columnaA}</th><th>{columnaB}</th>
                                        </tr></thead>
                                        <tbody>{filasCompactas.map((par, indice) => (
                                            <tr key={`dato-mult-${indice}`}>
                                                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{par.primera ? indice + 1 : ''}</td>
                                                <td style={{ textAlign: 'center' }}>{par.primera?.valorA ?? ''}</td>
                                                <td style={{ textAlign: 'center' }}>{par.primera?.valorB ?? ''}</td>
                                                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{par.segunda ? indice + filasCompactas.length + 1 : ''}</td>
                                                <td style={{ textAlign: 'center' }}>{par.segunda?.valorA ?? ''}</td>
                                                <td style={{ textAlign: 'center' }}>{par.segunda?.valorB ?? ''}</td>
                                            </tr>
                                        ))}</tbody>
                                    </table>
                                ) : (
                                    <table className="tabla-datos-pdf" style={{ width: '80%', margin: '0 auto 10px auto' }}>
                                        <thead><tr><th style={{ width: '42px' }}>Nº</th><th>{columnaA}</th><th>{columnaB}</th></tr></thead>
                                        <tbody>{filasMatriz.map((fila, indice) => (
                                            <tr key={fila.id ?? indice}>
                                                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{indice + 1}</td>
                                                <td style={{ textAlign: 'center' }}>{fila.valorA}</td>
                                                <td style={{ textAlign: 'center' }}>{fila.valorB}</td>
                                            </tr>
                                        ))}</tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        <div className="pdf-section">
                            <div style={{ fontSize: '9pt', fontWeight: 'bold', marginBottom: '4px' }}>
                                Desglose de Probabilidades Sucesivas
                            </div>
                            <table style={{ width: esModoManual ? '78%' : '100%', margin: esModoManual ? '0 auto 12px auto' : '0 0 12px 0' }}>
                                <thead><tr>
                                    <th>Paso</th>
                                    <th>Evento Extraído</th>
                                    {!esModoManual && <th>Fracción (<MathSpan math="n/N" />)</th>}
                                    <th>Probabilidad (<MathSpan math="P" />)</th>
                                </tr></thead>
                                <tbody>{filasDesglose.map((fila, indice) => (
                                    <tr key={`desglose-mult-${indice}`}>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{fila.paso}</td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{fila.evento}</td>
                                        {!esModoManual && <td style={{ textAlign: 'center' }}>{fila.fraccion}</td>}
                                        <td style={{ textAlign: 'center' }}>{fila.probabilidad.toFixed(4)}</td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>

                        <div className="pdf-section" style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '9pt', fontWeight: 'bold', margin: '8px 0 8px' }}>
                                Regla de la Multiplicación
                            </div>
                            <MathSpan math={`\\displaystyle ${formulaGeneral}`} display={true} />
                            <MathSpan math={`\\displaystyle ${formulaDesarrollo}`} display={true} />
                        </div>

                        <div className="pdf-section" style={{ textAlign: 'center', width: '100%' }}>
                            <div style={{ fontSize: '9pt', fontWeight: 'bold', margin: '8px 0 4px' }}>Flujo Lineal de Extracción</div>
                            <div style={{ width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <FlujoMultiplicacionPDF resultado={resultadoMult} modReemplazo={modoReemplazo} />
                            </div>
                        </div>

                        <div className="pdf-section" style={{ textAlign: 'center', width: '100%' }}>
                            <div style={{ fontSize: '9pt', fontWeight: 'bold', margin: '8px 0 4px' }}>Árbol de Probabilidades Sucesivas</div>
                            <div style={{ width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <ArbolMultiplicacionPDF resultado={resultadoMult} filas={filasFuente} varSeleccionada={varSeleccionada} modReemplazo={modoReemplazo} />
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* ══════════════════════════════════════════════════════════════
                CASO E: PROBABILIDAD TOTAL Y TEOREMA DE BAYES
               ══════════════════════════════════════════════════════════════ */}
            {(operacion === 'Probabilidad_Total' || operacion === 'simulador_total') && resultadoSimulador && (() => {
                const esModoManual = resultadoSimulador.modo === 'manual';
                const desglose = Array.isArray(resultadoSimulador.desglose) ? resultadoSimulador.desglose : [];
                const probTotal = Number(resultadoSimulador.probB) || 0;
                const probTotalPct = (probTotal * 100).toFixed(2);
                const colCausa = resultadoSimulador.colCausa || 'Causa';
                const colEvento = resultadoSimulador.colEvento || 'Evento';
                const valExito = resultadoSimulador.valExito || 'Éxito';
                const causasBayes = Array.isArray(resultadoSimulador.causasBayes) ? resultadoSimulador.causasBayes : [];

                const sanitizeLatex = (txt) => String(txt ?? '').replace(/([_{}%$&#^])/g, '\\$1');

                // Datos de la matriz para el modo matriz. En el editor, las filas
                // se serializan con " | "; se aceptan también valores sin espacios
                // alrededor del separador para conservar la selección de columnas.
                const nombresColumnas = Array.isArray(varSeleccionada?.nombresColumnas)
                    ? varSeleccionada.nombresColumnas
                    : [];
                const idxCausa = nombresColumnas.indexOf(colCausa);
                const idxEvento = nombresColumnas.indexOf(colEvento);
                const filasFuente = Array.isArray(filas) && filas.length > 0
                    ? filas
                    : Array.isArray(varSeleccionada?.datos)
                        ? varSeleccionada.datos.map((valor, idx) => ({ id: idx + 1, valor }))
                        : [];
                const filasMatriz = (!esModoManual && idxCausa >= 0 && idxEvento >= 0)
                    ? filasFuente.map((fila, idx) => {
                        const valorFila = Array.isArray(fila?.valor)
                            ? fila.valor
                            : String(fila?.valor ?? '').split(/\s*\|\s*/);
                        return {
                            id: fila?.id ?? idx + 1,
                            causa: String(valorFila[idxCausa] ?? '').trim(),
                            evento: String(valorFila[idxEvento] ?? '').trim()
                        };
                    }).filter(d => d.causa !== '' && d.evento !== '')
                    : [];

                const totalN = desglose[0]?.totalDatos || filasMatriz.length || 0;
                const totalExitos = desglose.reduce((sum, r) => sum + (Number(r.n_B_dado_Ai) || 0), 0);

                // Ramas seleccionadas para Bayes
                const ramasSeleccionadas = desglose.filter(r => causasBayes.includes(r.nombre));
                const tieneBayesActivo = Boolean(ramasSeleccionadas && ramasSeleccionadas.length > 0);

                return (
                    <div style={{ width: "100%" }}>
                        {/* ── SECCIÓN 1: PARÁMETROS Y TABLAS DE DESGLOSE ── */}
                        <div className="pdf-section">
                            <h2 style={{ fontSize: "12pt", color: "#000000", margin: "0 0 4px", fontWeight: "bold", textAlign: "center", textTransform: "uppercase" }}>
                                {tieneBayesActivo ? 'TEOREMA DE LA PROBABILIDAD TOTAL Y TEOREMA DE BAYES' : 'TEOREMA DE LA PROBABILIDAD TOTAL'}
                            </h2>
                            <div style={{ textAlign: "center", fontSize: "10pt", color: "#000000", margin: "0 0 14px 0" }}>
                                <strong>Modo de Ejecución:</strong> {esModoManual ? 'Modo Manual' : 'Análisis de Matriz'}
                            </div>

                            {/* ── PARÁMETROS DEL ESTUDIO (SIN BORDES DE CAJA) ── */}
                            <div style={{ margin: "0 0 14px 0", fontSize: "9.5pt", color: "#000000", lineHeight: "1.6" }}>
                                {!esModoManual ? (
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "6px 16px", marginBottom: "14px" }}>
                                        <div><strong>Variable Causa (<MathSpan math="B_i" />):</strong> {colCausa}</div>
                                        <div><strong>Variable Evento (<MathSpan math="A" />):</strong> {colEvento}</div>
                                        <div><strong>Condición de Éxito (<MathSpan math="A" />):</strong> {valExito}</div>
                                        <div><strong>Total de Observaciones (<MathSpan math="N" />):</strong> {totalN}</div>
                                        <div><strong>Particiones:</strong> {desglose.length} ramas</div>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "14px", justifyContent: "space-between" }}>
                                        <div><strong>Particiones del Espacio Muestral:</strong> {desglose.length} ramas</div>
                                        <div><strong>Condición de Partición:</strong> <MathSpan math="\sum P(B_i) = 1.0000 \ (100\%)" /></div>
                                    </div>
                                )}
                            </div>

                            {/* ── TABLA DE DATOS CON LOS QUE SE TRABAJÓ (SOLO EN MODO MATRIZ - CONSERVA BORDES DE TABLA) ── */}
                            {!esModoManual && filasMatriz.length > 0 && (
                                <div style={{ marginBottom: "16px" }}>
                                    <div style={{ fontSize: "10pt", fontWeight: "bold", color: "#000000", marginBottom: "6px" }}>
                                        Datos Analizados de la Matriz ({filasMatriz.length} registros):
                                    </div>
                                    {filasMatriz.length > 15 ? (
                                        <table className="tabla-datos-pdf" style={{ width: "100%", marginBottom: "14px" }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: "40px", textAlign: "center" }}>Nº</th>
                                                    <th style={{ textAlign: "center" }}>{colCausa} (<MathSpan math="B_i" />)</th>
                                                    <th style={{ textAlign: "center" }}>{colEvento} (<MathSpan math="A" />)</th>
                                                    <th style={{ width: "40px", textAlign: "center" }}>Nº</th>
                                                    <th style={{ textAlign: "center" }}>{colCausa} (<MathSpan math="B_i" />)</th>
                                                    <th style={{ textAlign: "center" }}>{colEvento} (<MathSpan math="A" />)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    const mitad = Math.ceil(filasMatriz.length / 2);
                                                    const rows = [];
                                                    for (let i = 0; i < mitad; i++) {
                                                        const f1 = filasMatriz[i];
                                                        const f2 = filasMatriz[i + mitad];
                                                        rows.push(
                                                            <tr key={i}>
                                                                <td style={{ textAlign: "center", fontWeight: "bold" }}>{i + 1}</td>
                                                                <td style={{ textAlign: "center" }}>{f1?.causa ?? ''}</td>
                                                                <td style={{ textAlign: "center" }}>{f1?.evento ?? ''}</td>
                                                                <td style={{ textAlign: "center", fontWeight: "bold" }}>{f2 ? i + mitad + 1 : ''}</td>
                                                                <td style={{ textAlign: "center" }}>{f2 ? f2.causa : ''}</td>
                                                                <td style={{ textAlign: "center" }}>{f2 ? f2.evento : ''}</td>
                                                            </tr>
                                                        );
                                                    }
                                                    return rows;
                                                })()}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div style={{ width: "70%", margin: "0 auto 14px auto" }}>
                                            <table className="tabla-datos-pdf" style={{ width: "100%", margin: 0 }}>
                                                <thead>
                                                    <tr>
                                                        <th style={{ width: "50px", textAlign: "center" }}>Nº</th>
                                                        <th style={{ textAlign: "center" }}>{colCausa} (<MathSpan math="B_i" />)</th>
                                                        <th style={{ textAlign: "center" }}>{colEvento} (<MathSpan math="A" />)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filasMatriz.map((fila, idx) => (
                                                        <tr key={idx}>
                                                            <td style={{ textAlign: "center", fontWeight: "bold" }}>{idx + 1}</td>
                                                            <td style={{ textAlign: "center" }}>{fila.causa}</td>
                                                            <td style={{ textAlign: "center" }}>{fila.evento}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── TABLA DE DESGLOSE DE PROBABILIDADES (CONSERVA BORDES DE TABLA) ── */}
                            <div
                                className="pdf-section"
                                style={{ marginBottom: "16px", pageBreakInside: "avoid", breakInside: "avoid" }}
                            >
                                <div style={{ fontSize: "10pt", fontWeight: "bold", color: "#000000", marginBottom: "6px" }}>
                                    Desglose de Probabilidades y Partición del Espacio Muestral:
                                </div>
                                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "14px" }}>
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: "center" }}>Causa / Partición <MathSpan math="B_i" /></th>
                                            {!esModoManual && (
                                                <th style={{ textAlign: "center" }}>Frecuencia <MathSpan math="(n_i / N)" /></th>
                                            )}
                                            <th style={{ textAlign: "center" }}>Probabilidad <MathSpan math="P(B_i)" /></th>
                                            {!esModoManual && (
                                                <th style={{ textAlign: "center" }}>Éxitos en <MathSpan math="B_i" /></th>
                                            )}
                                            <th style={{ textAlign: "center" }}>Condicional <MathSpan math="P(A|B_i)" /></th>
                                            <th style={{ textAlign: "center" }}>Intersección <MathSpan math="P(B_i) \cdot P(A|B_i)" /></th>
                                            {tieneBayesActivo && (
                                                <th style={{ textAlign: "center" }}>Posteriori <MathSpan math="P(B_i|A)" /> (Bayes)</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {desglose.map((r, i) => {
                                            const pPosteriori = probTotal > 0 ? (r.mult / probTotal) : 0;
                                            return (
                                                <tr key={i}>
                                                    <td style={{ fontWeight: "bold", textAlign: "center" }}>{r.nombre || `Causa ${i + 1}`}</td>
                                                    {!esModoManual && (
                                                        <td style={{ textAlign: "center" }}>{`${r.n_Ai ?? 0} / ${r.totalDatos ?? totalN}`}</td>
                                                    )}
                                                    <td style={{ textAlign: "center" }}>{(Number(r.pA) || 0).toFixed(4)}</td>
                                                    {!esModoManual && (
                                                        <td style={{ textAlign: "center" }}>{`${r.n_B_dado_Ai ?? 0} / ${r.n_Ai ?? 0}`}</td>
                                                    )}
                                                    <td style={{ textAlign: "center" }}>{(Number(r.pB_A) || 0).toFixed(4)}</td>
                                                    <td style={{ textAlign: "center", fontWeight: "bold" }}>{(Number(r.mult) || 0).toFixed(4)}</td>
                                                    {tieneBayesActivo && (
                                                        <td style={{ textAlign: "center", fontWeight: "bold", color: "#000000" }}>
                                                            {pPosteriori.toFixed(4)} ({(pPosteriori * 100).toFixed(2)}%)
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ fontWeight: "bold", background: "#f8fafc", borderTop: "2px solid #000000" }}>
                                            <td style={{ textAlign: "center" }}>Total / Partición</td>
                                            {!esModoManual && (
                                                <td style={{ textAlign: "center" }}>{`${totalN} / ${totalN}`}</td>
                                            )}
                                            <td style={{ textAlign: "center" }}>1.0000 (100%)</td>
                                            {!esModoManual && (
                                                <td style={{ textAlign: "center" }}>{`${totalExitos} / ${totalN}`}</td>
                                            )}
                                            <td style={{ textAlign: "center" }}>—</td>
                                            <td style={{ textAlign: "center", color: "#000000" }}>{probTotal.toFixed(4)}</td>
                                            {tieneBayesActivo && (
                                                <td style={{ textAlign: "center", color: "#000000" }}>1.0000 (100.00%)</td>
                                            )}
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* ── SECCIÓN 2: DESARROLLO MATEMÁTICO: PROBABILIDAD TOTAL (SIN BORDES DE CAJA) ── */}
                        <div className="pdf-section" style={{ textAlign: "center", margin: "16px 0 20px 0", padding: "4px 0", pageBreakInside: "avoid" }}>
                            <div style={{ fontSize: "10.5pt", fontWeight: "bold", color: "#000000", marginBottom: "8px", textAlign: "center" }}>
                                DESARROLLO ANALÍTICO: TEOREMA DE LA PROBABILIDAD TOTAL
                            </div>
                            <div style={{ textAlign: "center", margin: "8px 0" }}>
                                <MathSpan
                                    math={`\\displaystyle P(A) = \\sum_{i=1}^{n} P(A \\cap B_i) = \\sum_{i=1}^{n} P(B_i) \\cdot P(A|B_i)`}
                                    display={true}
                                />
                            </div>
                            <div style={{ textAlign: "center", margin: "10px 0" }}>
                                {(() => {
                                    const sumatoriaNombres = desglose.map(r => `P(\\text{${sanitizeLatex(r.nombre)}}) \\cdot P(A|\\text{${sanitizeLatex(r.nombre)}})`).join(' + ');
                                    const sumatoriaValores = desglose.map(r => `(${r.pA.toFixed(4)} \\cdot ${r.pB_A.toFixed(4)})`).join(' + ');
                                    const sumatoriaMults = desglose.map(r => `${r.mult.toFixed(4)}`).join(' + ');

                                    return (
                                        <MathSpan
                                            math={`\\displaystyle \\begin{aligned}
P(A) &= ${sumatoriaNombres} \\\\[4pt]
P(A) &= ${sumatoriaValores} \\\\[4pt]
P(A) &= ${sumatoriaMults} \\\\[4pt]
P(A) &= \\mathbf{${probTotal.toFixed(4)}} \\quad \\Longleftrightarrow \\quad \\mathbf{${probTotalPct}\\%}
\\end{aligned}`}
                                            display={true}
                                        />
                                    );
                                })()}
                            </div>
                        </div>

                        {/* ── DESARROLLO MATEMÁTICO: TEOREMA DE BAYES (SOLO SI FUE UTILIZADO / SELECCIONADO) ── */}
                        {tieneBayesActivo && (
                            <div className="pdf-section" style={{ textAlign: "center", margin: "16px 0 20px 0", padding: "4px 0", pageBreakInside: "avoid" }}>
                                <div style={{ fontSize: "10.5pt", fontWeight: "bold", color: "#000000", marginBottom: "8px", textAlign: "center" }}>
                                    DESARROLLO ANALÍTICO: TEOREMA DE BAYES (PROBABILIDAD A POSTERIORI)
                                </div>
                                <div style={{ textAlign: "center", margin: "6px 0 10px 0" }}>
                                    <MathSpan
                                        math={`\\displaystyle P(B_k | A) = \\frac{P(B_k) \\cdot P(A|B_k)}{P(A)} = \\frac{P(B_k) \\cdot P(A|B_k)}{\\displaystyle \\sum_{i=1}^{n} P(B_i) \\cdot P(A|B_i)}`}
                                        display={true}
                                    />
                                </div>

                                <div style={{ textAlign: "center", margin: "10px 0" }}>
                                    <div style={{ fontSize: "9.5pt", fontWeight: "bold", color: "#000000", marginBottom: "6px" }}>
                                        Causa(s) Evaluada(s): {ramasSeleccionadas.map(r => r.nombre).join(', ')}
                                    </div>
                                    {(() => {
                                        const numRamas = ramasSeleccionadas.length;
                                        const names = ramasSeleccionadas.map(r => `\\text{${sanitizeLatex(r.nombre)}}`);
                                        const unionNames = names.join(' \\cup ');
                                        const formatUnion = numRamas === 1 ? unionNames : `(${unionNames})`;

                                        if (numRamas === 1) {
                                            const r = ramasSeleccionadas[0];
                                            const bayesVal = probTotal > 0 ? (r.mult / probTotal) : 0;
                                            const bayesPct = (bayesVal * 100).toFixed(2);
                                            return (
                                                <MathSpan
                                                    math={`\\displaystyle \\begin{aligned}
P(${unionNames} | A) &= \\frac{P(${names[0]}) \\cdot P(A|${names[0]})}{P(A)} \\\\[4pt]
P(${unionNames} | A) &= \\frac{${r.pA.toFixed(4)} \\cdot ${r.pB_A.toFixed(4)}}{${probTotal.toFixed(4)}} = \\frac{${r.mult.toFixed(4)}}{${probTotal.toFixed(4)}} \\\\[4pt]
P(${unionNames} | A) &= \\mathbf{${bayesVal.toFixed(4)}} \\quad \\Longleftrightarrow \\quad \\mathbf{${bayesPct}\\%}
\\end{aligned}`}
                                                    display={true}
                                                />
                                            );
                                        } else {
                                            const calcs = ramasSeleccionadas.map(r => `(${r.pA.toFixed(4)} \\cdot ${r.pB_A.toFixed(4)})`).join(' + ');
                                            const mults = ramasSeleccionadas.map(r => r.mult.toFixed(4)).join(' + ');
                                            const sumMults = ramasSeleccionadas.reduce((sum, r) => sum + r.mult, 0);
                                            const bayesVal = probTotal > 0 ? (sumMults / probTotal) : 0;
                                            const bayesPct = (bayesVal * 100).toFixed(2);

                                            return (
                                                <MathSpan
                                                    math={`\\displaystyle \\begin{aligned}
P(${formatUnion} | A) &= \\frac{\\sum_{r \\in S} P(B_r) \\cdot P(A|B_r)}{P(A)} \\\\[4pt]
P(${formatUnion} | A) &= \\frac{${calcs}}{${probTotal.toFixed(4)}} = \\frac{${mults}}{${probTotal.toFixed(4)}} \\\\[4pt]
P(${formatUnion} | A) &= \\frac{${sumMults.toFixed(4)}}{${probTotal.toFixed(4)}} = \\mathbf{${bayesVal.toFixed(4)}} \\quad \\Longleftrightarrow \\quad \\mathbf{${bayesPct}\\%}
\\end{aligned}`}
                                                    display={true}
                                                />
                                            );
                                        }
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* ── DIAGRAMA: ÁRBOL DE PROBABILIDAD (AL FINAL DE TODO) ── */}
                        <ArbolProbabilidadPDF desglose={desglose} causasBayes={causasBayes} />
                    </div>
                );
            })()}
        </div>
    );
}
