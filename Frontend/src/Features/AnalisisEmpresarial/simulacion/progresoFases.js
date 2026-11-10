/**
 * Progreso real de la simulación: una fase solo está «completada» cuando el estudiante usó
 * todas las herramientas que el caso le habilitó en esa fase.
 *
 * «Usar» una herramienta = dejar trabajo propio en ella (factores, filas, selecciones, estrategias…).
 * Los reportes de resumen no producen datos: cuentan como usados al abrirlos.
 */
import { IDS_FASE3, IDS_FASE4 } from '../caso/herramientasCaso';

/** Cada fase con sus herramientas en orden. `resumen-problema` y los pasos de la Fase 2 siempre existen. */
const PASOS_FASE = {
  2: ['lluvia', 'arbol'],
  3: IDS_FASE3,
  4: IDS_FASE4,
  5: ['resumen-problema', 'foda', 'resumen-externo', 'resumen-interno'],
  6: ['dafo', 'ansoff']
};

export const NOMBRES_PASOS = {
  lluvia: 'Lluvia de ideas', arbol: 'Árbol de problemas', 'resumen-problema': 'Resumen identificación del problema',
  pestel: 'PESTEL', poam: 'POAM', porter: 'Porter', mpc: 'MPC',
  'interno-vertical-horizontal': 'Análisis vertical y horizontal', 'customer-journey': 'Customer Journey Map', flujogramas: 'Flujogramas', efi: 'Matriz EFI',
  'auditoria-redes': 'Auditoría de redes sociales', 'evaluacion-360': 'Evaluación 360°', inventarios: 'Inventarios y almacenes',
  foda: 'Matriz FODA', 'resumen-externo': 'Resumen diagnóstico externo', 'resumen-interno': 'Resumen diagnóstico interno',
  dafo: 'Matriz DAFO', ansoff: 'Matriz Ansoff'
};

const REPORTES = new Set(['resumen-problema', 'resumen-externo', 'resumen-interno']);

/** ¿Hay algo escrito, elegido o creado dentro de este valor? (recorre arreglos y objetos) */
export function tieneContenido(valor) {
  if (valor === null || valor === undefined || valor === false) return false;
  if (typeof valor === 'string') return valor.trim().length > 0;
  if (typeof valor === 'number') return valor !== 0;
  if (Array.isArray(valor)) return valor.some(tieneContenido);
  if (typeof valor === 'object') return Object.values(valor).some(tieneContenido);
  return Boolean(valor);
}

const dimensionUsada = d => Boolean(d) && (tieneContenido(d.factoresManuales) || tieneContenido(d.evidenciasVinculadas) || Object.values(d.criteriosActivos || {}).some(Boolean));

/**
 * ¿Usó el estudiante esta herramienta? `ctx` trae el estado de la simulación:
 * { ideasLluvia, datosArbol, datosPestel, datosPorter, datosMpc, factoresPoam, datosEfi, evidenciasFoda, datosInterno, plan, visitados }
 */
export function herramientaUsada(id, ctx) {
  if (REPORTES.has(id)) return (ctx.visitados || []).includes(id);
  switch (id) {
    case 'lluvia': return (ctx.ideasLluvia || []).some(i => i.seleccionada);
    case 'arbol': return Boolean(ctx.datosArbol?.problemaCentral?.titulo?.trim()) && (ctx.datosArbol?.causas || []).length > 0 && (ctx.datosArbol?.efectos || []).length > 0;
    case 'pestel': return Object.values(ctx.datosPestel?.dimensiones || {}).some(dimensionUsada);
    case 'porter': return Object.values(ctx.datosPorter?.fuerzas || {}).some(f => Boolean(f?.nivel) || dimensionUsada(f));
    case 'mpc': return (ctx.datosMpc?.factores || []).length > 0;
    case 'poam': return (ctx.factoresPoam || []).some(f => f.ubicadoEnRadar);
    case 'efi': return (ctx.datosEfi?.factores || []).length > 0;
    case 'foda': return (ctx.evidenciasFoda || []).some(e => e.cuadranteActual);
    case 'dafo': return (ctx.plan?.dafo?.estrategias || []).length > 0;
    case 'ansoff': return (ctx.plan?.ansoff?.iniciativas || []).length > 0;
    default: return tieneContenido(ctx.datosInterno?.[id]); // herramientas de la Fase 4 basadas en registros
  }
}

/**
 * Estado de cada fase. `habilitadas` son las herramientas del caso.
 * Devuelve { [fase]: { estado, faltan: [nombres] } } con estado:
 *  completado · en-curso · incompleto (se pasó de fase sin usar todo) · pendiente · omitida (el caso no la incluye)
 */
export function calcularEstadoFases({ faseActual, habilitadas, ctx }) {
  const resultado = {
    1: { estado: faseActual > 1 ? 'completado' : 'en-curso', faltan: [] }
  };
  [2, 3, 4, 5, 6].forEach(fase => {
    const pasos = PASOS_FASE[fase].filter(id => fase === 2 || id === 'resumen-problema' || habilitadas.includes(id));
    if (!pasos.length) { resultado[fase] = { estado: 'omitida', faltan: [] }; return; }
    const faltan = pasos.filter(id => !herramientaUsada(id, ctx)).map(id => NOMBRES_PASOS[id]);
    let estado;
    if (faseActual === fase) estado = 'en-curso';
    else if (!faltan.length) estado = 'completado';
    else estado = faseActual > fase ? 'incompleto' : 'pendiente';
    resultado[fase] = { estado, faltan };
  });
  return resultado;
}
