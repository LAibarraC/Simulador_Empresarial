/**
 * resumenFase5.js
 * Consolida los resultados de la Fase 3 (diagnóstico externo) y de la Fase 4 (diagnóstico interno)
 * reutilizando los cálculos de cada herramienta, para que los resúmenes coincidan con lo que el
 * estudiante ve en ellas.
 */
import { DIMENSIONES_PESTEL, calcularMetricasPestel } from '../../fase3-diagnostico-externo/pestel/datosPestel';
import { FUERZAS_PORTER } from '../../fase3-diagnostico-externo/porter/datosPorter';
import { calcularRankingCompetidores, calcularTotalesCompetidores } from '../../fase3-diagnostico-externo/mpc/calculosMpc';
import { normalizarCategoriaPoam } from '../../fase3-diagnostico-externo/poam/datosPoam';
import { ESTADOS, analizarEstado, calcularIndicadores, calcularTotales, crearFormato, generarHallazgos, normalizarContenido, tieneSaldos } from '../../fase4-diagnostico-interno/analisis-vertical-horizontal/calculosFinancieros';
import { calcularMetricas, compararClientes, generarHallazgosJourney, normalizarJourney } from '../../fase4-diagnostico-interno/customer-journey/calculosJourney';
import { calcularMetricasFlujo, formatearTiempo, generarHallazgosFlujo, normalizarPasos } from '../../fase4-diagnostico-interno/flujogramas/calculosFlujo';
import { analizarCanal, calcularTotalesRedes, generarHallazgosRedes } from '../../fase4-diagnostico-interno/auditoria-redes/calculosRedes';
import { agruparPorPersona, construirMapaCalor, generarHallazgos360 } from '../../fase4-diagnostico-interno/evaluacion-360/calculosEvaluacion360';
import { analizarProducto, calcularTotalesInventario, clasificarAbc, generarHallazgosInventario } from '../../fase4-diagnostico-interno/inventarios/calculosInventario';
import { calcularDesglosePorArea, calcularTotalesEfi, determinarDiagnosticoInterno, generarHallazgosEfi } from '../../fase4-diagnostico-interno/matriz-efi/calculosEfi';
import { leerContenido } from '../../compartido/useRegistrosHerramienta';

const textoFactor = factor => (typeof factor === 'string' ? factor : factor?.texto || factor?.titulo || factor?.factor || '');
const media = valores => { const v = valores.filter(x => Number.isFinite(x)); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
const monedaBs = valor => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 0 }).format(valor || 0);

/* ================================================================== */
/* FASE 3 · DIAGNÓSTICO EXTERNO                                        */
/* ================================================================== */

export function resumirPestel(datosPestel) {
  const dims = datosPestel?.dimensiones || {};
  const dimensiones = DIMENSIONES_PESTEL.map(dimension => {
    const data = dims[dimension.id] || {};
    const factores = (data.factoresManuales || []).map(f => ({ texto: textoFactor(f), tipo: (typeof f === 'object' && f?.tipo) || data.tipo || 'Oportunidad' })).filter(f => f.texto);
    const oportunidades = factores.filter(f => f.tipo !== 'Amenaza').length;
    const amenazas = factores.filter(f => f.tipo === 'Amenaza').length;
    const tipo = factores.length ? (oportunidades >= amenazas ? 'Oportunidad' : 'Amenaza') : (data.tipo || null);
    return { id: dimension.id, letra: dimension.letra, nombre: dimension.tituloCorto, color: dimension.color, nivel: data.nivel || 'Medio', descripcion: data.descripcion || '', factores, oportunidades, amenazas, tipo };
  });
  const conDatos = dimensiones.some(d => d.factores.length || d.descripcion);
  return { conDatos, dimensiones, metricas: calcularMetricasPestel(datosPestel) };
}

const nivelFuerza = data => {
  if (data?.nivel) return data.nivel;
  const activos = Object.values(data?.criteriosActivos || {}).filter(Boolean).length;
  return activos >= 3 ? 'Alta' : activos === 2 ? 'Media' : 'Baja';
};

export function resumirPorter(datosPorter) {
  const fuerzasData = datosPorter?.fuerzas || {};
  const fuerzas = FUERZAS_PORTER.map(fuerza => {
    const data = fuerzasData[fuerza.id] || {};
    const nivel = nivelFuerza(data);
    return {
      id: fuerza.id, nombre: fuerza.tituloCorto, posicion: fuerza.posicion, color: fuerza.color, nivel, puntos: nivel === 'Alta' ? 3 : nivel === 'Media' ? 2 : 1,
      descripcion: data.descripcion || '', factores: (data.factoresManuales || []).map(textoFactor).filter(Boolean)
    };
  });
  const promedio = media(fuerzas.map(f => f.puntos));
  const atractivo = promedio === null ? null : promedio <= 1.6
    ? { nombre: 'Industria atractiva', tono: 'ok', texto: 'Las fuerzas competitivas ejercen poca presión: hay espacio para rentabilidad.' }
    : promedio <= 2.3
      ? { nombre: 'Atractivo moderado', tono: 'warn', texto: 'Presión competitiva media: la rentabilidad depende de diferenciarse.' }
      : { nombre: 'Industria poco atractiva', tono: 'bad', texto: 'Fuerzas intensas que comprimen los márgenes del sector.' };
  const conDatos = fuerzas.some(f => f.descripcion || f.factores.length) || Object.keys(fuerzasData).length > 0;
  return { conDatos, fuerzas, promedio, atractivo, altas: fuerzas.filter(f => f.nivel === 'Alta') };
}

export function resumirMpc(datosMpc) {
  const factores = datosMpc?.factores || [];
  const competidores = datosMpc?.competidores || [];
  const calificaciones = datosMpc?.calificaciones || {};
  if (!factores.length || !competidores.length) return { conDatos: false, ranking: [], factores: [] };
  const totales = calcularTotalesCompetidores(factores, competidores, calificaciones);
  const ranking = calcularRankingCompetidores(totales);
  const propia = ranking.find(item => item.esPropia) || null;
  const evaluado = ranking.some(item => item.factoresCalificados > 0);
  return { conDatos: evaluado, ranking, propia, factores, lider: ranking[0] || null };
}

export function resumirPoam(factoresPoam = []) {
  const factores = (factoresPoam || []).map(f => ({
    id: f.id, texto: textoFactor(f), tipo: f.tipo === 'Amenaza' ? 'Amenaza' : 'Oportunidad',
    impacto: f.impacto || f.calificacion || 'Medio', categoria: normalizarCategoriaPoam(f.categoria), origen: f.tagOrigen || f.fuente || ''
  })).filter(f => f.texto);
  const porDimension = DIMENSIONES_PESTEL.map(d => ({
    id: d.id, letra: d.letra, nombre: d.tituloCorto, color: d.color,
    oportunidades: factores.filter(f => f.categoria === d.id && f.tipo === 'Oportunidad').length,
    amenazas: factores.filter(f => f.categoria === d.id && f.tipo === 'Amenaza').length
  }));
  const peso = f => (String(f.impacto).toLowerCase().startsWith('alt') ? 3 : String(f.impacto).toLowerCase().startsWith('baj') ? 1 : 2);
  const ordenar = lista => [...lista].sort((a, b) => peso(b) - peso(a));
  const oportunidades = ordenar(factores.filter(f => f.tipo === 'Oportunidad'));
  const amenazas = ordenar(factores.filter(f => f.tipo === 'Amenaza'));
  const pesoO = oportunidades.reduce((t, f) => t + peso(f), 0);
  const pesoA = amenazas.reduce((t, f) => t + peso(f), 0);
  return { conDatos: factores.length > 0, factores, porDimension, oportunidades, amenazas, pesoO, pesoA, criticos: factores.filter(f => peso(f) === 3).length };
}

/** Resumen completo del entorno con su lectura automática. */
export function resumirExterno({ datosPestel, datosPorter, datosMpc, factoresPoam, activas }) {
  const pestel = resumirPestel(datosPestel);
  const porter = resumirPorter(datosPorter);
  const mpc = resumirMpc(datosMpc);
  const poam = resumirPoam(factoresPoam);
  const estado = { pestel: pestel.conDatos, porter: porter.conDatos, mpc: mpc.conDatos, poam: poam.conDatos };
  const herramientas = activas.filter(id => id in estado);
  const completadas = herramientas.filter(id => estado[id]).length;

  const oportunidades = poam.conDatos ? poam.oportunidades.length : pestel.metricas.totalOportunidades;
  const amenazas = poam.conDatos ? poam.amenazas.length : pestel.metricas.totalAmenazas;
  const balance = oportunidades + amenazas ? oportunidades / (oportunidades + amenazas) : null;
  const postura = balance === null ? null : balance >= 0.6
    ? { nombre: 'Entorno favorable', tono: 'ok', texto: 'Predominan las oportunidades: conviene una estrategia ofensiva para capturarlas.' }
    : balance >= 0.4
      ? { nombre: 'Entorno mixto', tono: 'warn', texto: 'Oportunidades y amenazas se equilibran: crecer de forma selectiva y proteger los márgenes.' }
      : { nombre: 'Entorno hostil', tono: 'bad', texto: 'Predominan las amenazas: prioriza estrategias defensivas y de reducción de riesgos.' };

  const hallazgos = [];
  const agregar = (nivel, titulo, detalle) => hallazgos.push({ id: `e-${hallazgos.length}`, nivel, titulo, detalle });
  if (postura) agregar(postura.tono === 'ok' ? 'ok' : postura.tono === 'bad' ? 'warning' : 'info', `${postura.nombre}: ${oportunidades} oportunidades frente a ${amenazas} amenazas`, postura.texto);
  if (pestel.conDatos) agregar(pestel.metricas.ratioOportunidad > 0.6 ? 'ok' : pestel.metricas.ratioOportunidad <= 0.35 ? 'warning' : 'info', `Macroentorno ${pestel.metricas.clima.toLowerCase()}`, pestel.metricas.textoClima);
  if (porter.atractivo) agregar(porter.atractivo.tono === 'ok' ? 'ok' : porter.atractivo.tono === 'bad' ? 'warning' : 'info', `${porter.atractivo.nombre} (presión media ${porter.promedio.toFixed(1)} / 3)`, porter.altas.length ? `Fuerzas de presión alta: ${porter.altas.map(f => f.nombre).join(', ')}.` : porter.atractivo.texto);
  if (mpc.conDatos && mpc.propia) agregar(mpc.propia.posicion === 1 ? 'ok' : 'warning', `Posición competitiva: ${mpc.propia.posicion ? `${mpc.propia.posicion}º de ${mpc.ranking.length}` : 'sin evaluar'} (${mpc.propia.totalPonderado.toFixed(2)})`, `${mpc.propia.postura}. ${mpc.propia.fceMasDebil ? `Factor más débil: ${mpc.propia.fceMasDebil.factor}.` : ''}`);
  if (poam.amenazas[0]) agregar('warning', 'Amenaza prioritaria', poam.amenazas[0].texto);
  if (poam.oportunidades[0]) agregar('ok', 'Oportunidad prioritaria', poam.oportunidades[0].texto);
  return { pestel, porter, mpc, poam, estado, herramientas, completadas, oportunidades, amenazas, balance, postura, hallazgos };
}

/* ================================================================== */
/* FASE 4 · DIAGNÓSTICO INTERNO                                        */
/* ================================================================== */


function resumirFinanzas(guardado) {
  const contenido = normalizarContenido(guardado);
  const { filas } = contenido;
  if (!tieneSaldos(filas, 'balance') && !tieneSaldos(filas, 'resultados')) return { conDatos: false };
  const formato = crearFormato(contenido.moneda);
  const totales = calcularTotales(filas);
  const indicadores = calcularIndicadores(totales);
  const analisis = ESTADOS.map(estado => ({ estado, bloques: analizarEstado(filas, estado.id, totales, contenido.umbral) }));
  const hallazgos = generarHallazgos({ filas, totales, indicadores, analisis, formato, umbral: contenido.umbral });
  const semaforo = { bueno: 0, alerta: 0, critico: 0 };
  indicadores.forEach(item => { if (item.estado) semaforo[item.estado] += 1; });
  const { actual, anterior } = totales;
  const crecimiento = anterior.resultados.ingresos ? ((actual.resultados.ingresos - anterior.resultados.ingresos) / Math.abs(anterior.resultados.ingresos)) * 100 : null;
  return { conDatos: true, contenido, formato, totales, indicadores, hallazgos, semaforo, crecimiento, periodos: { anterior: contenido.periodoAnterior, actual: contenido.periodoActual } };
}

function resumirJourney(guardado) {
  const journey = normalizarJourney(guardado);
  const clientes = journey.clientes.filter(cliente => cliente.etapas.length);
  if (!clientes.length) return { conDatos: false };
  const varios = clientes.length > 1;
  // Hallazgos por cliente; con varios clientes se antepone su nombre para saber a quién corresponden.
  const hallazgos = clientes.flatMap(cliente => generarHallazgosJourney(cliente.etapas).map(h => ({
    ...h, id: `${cliente.id}-${h.id}`, titulo: varios ? `${cliente.persona.nombre || 'Cliente'} · ${h.titulo}` : h.titulo
  })));
  return { conDatos: true, journey, clientes: compararClientes(clientes), metricas: calcularMetricas(clientes.flatMap(cliente => cliente.etapas)), hallazgos };
}

function resumirFlujo(guardado) {
  const contenido = leerContenido(guardado);
  const pasos = normalizarPasos(contenido.filas);
  if (!pasos.length) return { conDatos: false };
  const metricas = calcularMetricasFlujo(pasos);
  return { conDatos: true, proceso: contenido.proceso || 'Proceso sin nombre', pasos, metricas, tiempo: metricas.tiempo ? formatearTiempo(metricas.tiempo) : '—', hallazgos: generarHallazgosFlujo(pasos) };
}

function resumirEfi(datosEfi) {
  const factores = Array.isArray(datosEfi?.factores) ? datosEfi.factores : [];
  if (!factores.length) return { conDatos: false };
  const totales = calcularTotalesEfi(factores);
  return { conDatos: true, factores, totales, diagnostico: determinarDiagnosticoInterno(totales.totalPonderadoGlobal), areas: calcularDesglosePorArea(factores), hallazgos: generarHallazgosEfi(factores) };
}

function resumirRedes(guardado) {
  const canales = leerContenido(guardado).filas.map(analizarCanal);
  if (!canales.length) return { conDatos: false };
  return { conDatos: true, canales, totales: calcularTotalesRedes(canales), hallazgos: generarHallazgosRedes(canales) };
}

function resumir360(guardado) {
  const personas = agruparPorPersona(leerContenido(guardado).filas);
  if (!personas.length) return { conDatos: false };
  const mapa = construirMapaCalor(personas);
  return { conDatos: true, personas, mapa, media: media(personas.map(p => p.general)), hallazgos: generarHallazgos360(personas) };
}

function resumirInventario(guardado) {
  const contenido = leerContenido(guardado);
  const productos = contenido.filas.map(analizarProducto);
  if (!productos.length) return { conDatos: false };
  const abc = clasificarAbc(productos);
  return { conDatos: true, productos, abc, totales: calcularTotalesInventario(productos), movimientos: contenido.movimientos, hallazgos: generarHallazgosInventario(productos, abc, monedaBs) };
}

/** Resumen completo de la empresa por dentro, con fortalezas y debilidades consolidadas. */
export function resumirInterno({ datosInterno = {}, datosEfi }) {
  const finanzas = resumirFinanzas(datosInterno['interno-vertical-horizontal']);
  const journey = resumirJourney(datosInterno['customer-journey']);
  const flujo = resumirFlujo(datosInterno.flujogramas);
  const efi = resumirEfi(datosEfi);
  const redes = resumirRedes(datosInterno['auditoria-redes']);
  const equipo = resumir360(datosInterno['evaluacion-360']);
  const inventario = resumirInventario(datosInterno.inventarios);
  const estado = {
    'interno-vertical-horizontal': finanzas.conDatos, 'customer-journey': journey.conDatos, flujogramas: flujo.conDatos, efi: efi.conDatos,
    'auditoria-redes': redes.conDatos, 'evaluacion-360': equipo.conDatos, inventarios: inventario.conDatos
  };
  const completadas = Object.values(estado).filter(Boolean).length;

  // Fortalezas y debilidades: primero las de la EFI, luego las señales de cada herramienta.
  const fortalezas = [];
  const debilidades = [];
  if (efi.conDatos) {
    efi.factores.filter(f => f.tipo === 'Fortaleza').forEach(f => fortalezas.push({ texto: f.titulo, fuente: 'Matriz EFI' }));
    efi.factores.filter(f => f.tipo === 'Debilidad').forEach(f => debilidades.push({ texto: f.titulo, fuente: 'Matriz EFI' }));
  }
  const fuentes = [['Finanzas', finanzas], ['Experiencia del cliente', journey], ['Procesos', flujo], ['Redes sociales', redes], ['Equipo', equipo], ['Inventarios', inventario]];
  fuentes.forEach(([fuente, resumen]) => (resumen.hallazgos || []).forEach(h => {
    if (h.nivel === 'ok') fortalezas.push({ texto: h.titulo, fuente });
    if (h.nivel === 'warning') debilidades.push({ texto: h.titulo, fuente });
  }));

  const puntaje = efi.conDatos ? efi.totales.totalPonderadoGlobal : null;
  const balance = fortalezas.length + debilidades.length ? fortalezas.length / (fortalezas.length + debilidades.length) : null;
  const postura = puntaje !== null
    ? (puntaje > 2.5 ? { nombre: 'Posición interna fuerte', tono: 'ok', texto: efi.diagnostico.recomendacion } : { nombre: 'Posición interna débil', tono: 'bad', texto: efi.diagnostico.recomendacion })
    : balance === null ? null : balance >= 0.55
      ? { nombre: 'Capacidades internas sólidas', tono: 'ok', texto: 'Las fortalezas detectadas superan a las debilidades.' }
      : { nombre: 'Capacidades internas por reforzar', tono: 'warn', texto: 'Las debilidades detectadas requieren un plan de mejora interno.' };
  return { finanzas, journey, flujo, efi, redes, equipo, inventario, estado, completadas, fortalezas, debilidades, puntaje, postura };
}

/* ================================================================== */
/* FASE 2 · IDENTIFICACIÓN DEL PROBLEMA                                */
/* ================================================================== */

export const CUADRANTES_LLUVIA = [
  { id: 'Fortalezas', letra: 'F', ambito: 'Interno', color: '#10b981' },
  { id: 'Debilidades', letra: 'D', ambito: 'Interno', color: '#ef4444' },
  { id: 'Oportunidades', letra: 'O', ambito: 'Externo', color: '#2563eb' },
  { id: 'Amenazas', letra: 'A', ambito: 'Externo', color: '#f59e0b' }
];

const esInterno = idea => String(idea.tipoAmbito || idea.ambito || '').toLowerCase().startsWith('intern');

/** Resume la lluvia de ideas y el árbol de problemas con su lectura automática. */
export function resumirProblema({ ideasLluvia = [], datosArbol }) {
  const ideas = (ideasLluvia || []).filter(idea => idea?.texto);
  const seleccionadas = ideas.filter(idea => idea.seleccionada);
  const base = seleccionadas.length ? seleccionadas : ideas;
  const internas = base.filter(esInterno);
  const externas = base.filter(idea => !esInterno(idea));
  const cuadrantes = CUADRANTES_LLUVIA.map(c => ({ ...c, total: base.filter(idea => idea.cuadranteCorrecto === c.id).length }));
  const conteoCategorias = {};
  base.forEach(idea => { const nombre = idea.categoria || 'General'; conteoCategorias[nombre] = (conteoCategorias[nombre] || 0) + 1; });
  const categorias = Object.entries(conteoCategorias).map(([nombre, total]) => ({ nombre, total })).sort((a, b) => b.total - a.total);

  const problema = datosArbol?.problemaCentral || {};
  const causas = (datosArbol?.causas || []).filter(c => c?.titulo);
  const efectos = (datosArbol?.efectos || []).filter(e => e?.titulo);
  const arbol = {
    problema: { titulo: problema.titulo || '', descripcion: problema.descripcion || '', categoria: problema.categoria || '' },
    causasDirectas: causas.filter(c => c.tipo !== 'indirecta'),
    causasIndirectas: causas.filter(c => c.tipo === 'indirecta'),
    efectosDirectos: efectos.filter(e => e.tipo !== 'indirecto'),
    efectosIndirectos: efectos.filter(e => e.tipo === 'indirecto')
  };
  const categoriasCausa = {};
  causas.forEach(c => { const nombre = c.categoria || 'General'; categoriasCausa[nombre] = (categoriasCausa[nombre] || 0) + 1; });
  const causaPredominante = Object.entries(categoriasCausa).sort((a, b) => b[1] - a[1])[0] || null;

  const hallazgos = [];
  const agregar = (nivel, titulo, detalle) => hallazgos.push({ id: `p-${hallazgos.length}`, nivel, titulo, detalle });
  if (arbol.problema.titulo) agregar('ok', 'Problema central formulado', arbol.problema.titulo);
  else agregar('warning', 'Falta formular el problema central', 'Redáctalo como una situación negativa concreta y medible (no como la ausencia de una solución).');
  if (causas.length) agregar(arbol.causasDirectas.length ? 'ok' : 'info', `${causas.length} causas identificadas`, `${arbol.causasDirectas.length} directas y ${arbol.causasIndirectas.length} indirectas.${causaPredominante ? ` La mayoría pertenece a «${causaPredominante[0]}».` : ''}`);
  else agregar('warning', 'Sin causas registradas', 'Las causas explican por qué ocurre el problema; son la base de los objetivos y estrategias.');
  if (efectos.length) agregar('info', `${efectos.length} efectos identificados`, `${arbol.efectosDirectos.length} directos y ${arbol.efectosIndirectos.length} indirectos: muestran qué pasa si el problema no se resuelve.`);
  else agregar('warning', 'Sin efectos registrados', 'Los efectos dimensionan la gravedad del problema para la empresa.');
  if (base.length) {
    const pctInterno = Math.round((internas.length / base.length) * 100);
    agregar('info', `${base.length} hechos ${seleccionadas.length ? 'seleccionados' : 'identificados'} · ${pctInterno}% internos`, pctInterno >= 50 ? 'El problema parece originarse sobre todo dentro de la empresa: es controlable con decisiones de gestión.' : 'Predominan los factores del entorno: la empresa debe adaptarse y vigilar el mercado.');
  }
  const debilidades = cuadrantes.find(c => c.id === 'Debilidades').total;
  const fortalezas = cuadrantes.find(c => c.id === 'Fortalezas').total;
  if (debilidades > fortalezas) agregar('warning', 'Las debilidades superan a las fortalezas', `${debilidades} debilidades frente a ${fortalezas} fortalezas en los hechos analizados.`);
  return { ideas, seleccionadas, base, internas, externas, cuadrantes, categorias, arbol, causas, efectos, hallazgos, conDatos: { lluvia: ideas.length > 0, arbol: Boolean(arbol.problema.titulo || causas.length || efectos.length) } };
}
