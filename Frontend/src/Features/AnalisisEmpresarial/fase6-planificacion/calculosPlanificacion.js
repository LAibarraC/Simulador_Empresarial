/**
 * fase6Calculations.js — lógica pura de la Fase 6 (Planificación y toma de decisiones):
 * Matriz DAFO (estrategias cruzadas FO, FA, DO, DA) y Matriz Ansoff (crecimiento).
 */

export const crearIdF6 = prefijo => `${prefijo}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/* ================================================================== */
/* FACTORES DEL FODA                                                    */
/* ================================================================== */

export const LETRAS_FODA = [
  { id: 'F', cuadrante: 'Fortalezas', nombre: 'Fortalezas', color: '#10b981' },
  { id: 'D', cuadrante: 'Debilidades', nombre: 'Debilidades', color: '#ef4444' },
  { id: 'O', cuadrante: 'Oportunidades', nombre: 'Oportunidades', color: '#2563eb' },
  { id: 'A', cuadrante: 'Amenazas', nombre: 'Amenazas', color: '#f59e0b' }
];

/**
 * Agrupa los factores del FODA por cuadrante y les asigna códigos F1, D1, O1, A1…
 * Usa la ubicación que hizo el estudiante; si no ubicó ninguno, usa la clasificación sugerida.
 */
export function prepararFactoresFoda(evidencias = []) {
  const lista = (evidencias || []).filter(e => e?.texto);
  const ubicados = lista.filter(e => e.cuadranteActual);
  const fuente = ubicados.length ? ubicados : lista;
  const campo = ubicados.length ? 'cuadranteActual' : 'cuadranteCorrecto';
  const resultado = {};
  LETRAS_FODA.forEach(letra => {
    resultado[letra.id] = fuente.filter(e => e[campo] === letra.cuadrante)
      .map((e, i) => ({ id: e.id || `${letra.id}-${i}`, codigo: `${letra.id}${i + 1}`, texto: e.texto, categoria: e.categoria || '', letra: letra.id }));
  });
  return { ...resultado, ubicados: ubicados.length > 0 };
}

/* ================================================================== */
/* MATRIZ DAFO                                                          */
/* ================================================================== */

export const CUADRANTES_DAFO = [
  { id: 'FO', interno: 'F', externo: 'O', nombre: 'Ofensivas', alias: 'Maxi-Maxi', color: '#10b981', fondo: 'rgba(16, 185, 129, .07)', verbo: 'Usar las fortalezas para aprovechar las oportunidades', plantilla: (f, o) => `Aprovechar «${f}» para capitalizar «${o}».` },
  { id: 'FA', interno: 'F', externo: 'A', nombre: 'Defensivas', alias: 'Maxi-Mini', color: '#2563eb', fondo: 'rgba(37, 99, 235, .06)', verbo: 'Usar las fortalezas para neutralizar las amenazas', plantilla: (f, a) => `Apoyarse en «${f}» para reducir el impacto de «${a}».` },
  { id: 'DO', interno: 'D', externo: 'O', nombre: 'De reorientación', alias: 'Mini-Maxi', color: '#d97706', fondo: 'rgba(245, 158, 11, .08)', verbo: 'Superar las debilidades aprovechando las oportunidades', plantilla: (d, o) => `Corregir «${d}» aprovechando «${o}».` },
  { id: 'DA', interno: 'D', externo: 'A', nombre: 'De supervivencia', alias: 'Mini-Mini', color: '#dc2626', fondo: 'rgba(239, 68, 68, .06)', verbo: 'Reducir las debilidades y evitar las amenazas', plantilla: (d, a) => `Reducir «${d}» para protegerse de «${a}».` }
];
export const obtenerCuadranteDafo = id => CUADRANTES_DAFO.find(c => c.id === id) || CUADRANTES_DAFO[0];

export const PRIORIDADES = [{ id: 'alta', nombre: 'Alta' }, { id: 'media', nombre: 'Media' }, { id: 'baja', nombre: 'Baja' }];
export const PLAZOS = [{ id: 'corto', nombre: 'Corto plazo', detalle: '< 6 meses' }, { id: 'mediano', nombre: 'Mediano plazo', detalle: '6–18 meses' }, { id: 'largo', nombre: 'Largo plazo', detalle: '> 18 meses' }];

export const crearEstrategia = (cuadrante, cambios = {}) => ({
  id: crearIdF6('est'), cuadrante, texto: '', factores: [], prioridad: 'media', plazo: 'mediano', responsable: '', indicador: '', ...cambios
});

const texto = v => (typeof v === 'string' ? v : '');

/** Lee lo guardado y garantiza la forma del plan de la Fase 6. */
export function normalizarPlan(guardado) {
  const base = guardado || {};
  const dafo = base.dafo || {};
  const ansoff = base.ansoff || {};
  return {
    dafo: { estrategias: Array.isArray(dafo.estrategias) ? dafo.estrategias : [], conclusiones: texto(dafo.conclusiones), documentos: Array.isArray(dafo.documentos) ? dafo.documentos : [] },
    ansoff: { iniciativas: Array.isArray(ansoff.iniciativas) ? ansoff.iniciativas : [], principal: texto(ansoff.principal), conclusiones: texto(ansoff.conclusiones), documentos: Array.isArray(ansoff.documentos) ? ansoff.documentos : [] }
  };
}

/** Posición estratégica: proporción de fortalezas (eje interno) y de oportunidades (eje externo). */
export function posicionEstrategica(factores) {
  const f = factores.F.length; const d = factores.D.length; const o = factores.O.length; const a = factores.A.length;
  const interno = f + d ? f / (f + d) : 0.5;
  const externo = o + a ? o / (o + a) : 0.5;
  const recomendado = interno >= 0.5 ? (externo >= 0.5 ? 'FO' : 'FA') : (externo >= 0.5 ? 'DO' : 'DA');
  return { interno, externo, recomendado, conDatos: f + d + o + a > 0 };
}

export function calcularResumenDafo(estrategias, factores) {
  const todos = [...factores.F, ...factores.D, ...factores.O, ...factores.A];
  const usados = new Set(estrategias.flatMap(e => e.factores));
  const sinUsar = todos.filter(f => !usados.has(f.id));
  const porCuadrante = Object.fromEntries(CUADRANTES_DAFO.map(c => [c.id, estrategias.filter(e => e.cuadrante === c.id).length]));
  return {
    total: estrategias.length, porCuadrante, altas: estrategias.filter(e => e.prioridad === 'alta').length,
    cobertura: todos.length ? Math.round(((todos.length - sinUsar.length) / todos.length) * 100) : 0, sinUsar,
    sinFactores: estrategias.filter(e => !e.factores.length).length, sinTexto: estrategias.filter(e => !e.texto.trim()).length
  };
}


export const CUADRANTES_ANSOFF = [
  {
    id: 'penetracion', nombre: 'Penetración de mercado', producto: 'actual', mercado: 'actual', riesgo: 1, color: '#10b981',
    descripcion: 'Vender más de los productos actuales a los clientes actuales.',
    tacticas: ['Promociones y descuentos', 'Programa de fidelización', 'Más publicidad en redes', 'Ampliar horarios o puntos de venta']
  },
  {
    id: 'producto', nombre: 'Desarrollo de producto', producto: 'nuevo', mercado: 'actual', riesgo: 2, color: '#2563eb',
    descripcion: 'Crear productos o servicios nuevos para los clientes actuales.',
    tacticas: ['Nueva línea de productos', 'Versión premium', 'Servicio complementario', 'Mejora del producto actual']
  },
  {
    id: 'mercado', nombre: 'Desarrollo de mercado', producto: 'actual', mercado: 'nuevo', riesgo: 2, color: '#d97706',
    descripcion: 'Llevar los productos actuales a nuevos clientes, zonas o canales.',
    tacticas: ['Abrir en otra zona o ciudad', 'Nuevo segmento de clientes', 'Venta en línea o delivery', 'Venta a empresas (B2B)']
  },
  {
    id: 'diversificacion', nombre: 'Diversificación', producto: 'nuevo', mercado: 'nuevo', riesgo: 3, color: '#dc2626',
    descripcion: 'Productos nuevos para mercados nuevos: mayor potencial y mayor riesgo.',
    tacticas: ['Nuevo negocio relacionado', 'Alianza estratégica', 'Adquirir otra empresa', 'Nuevo producto para un nuevo segmento']
  }
];
export const obtenerCuadranteAnsoff = id => CUADRANTES_ANSOFF.find(c => c.id === id) || CUADRANTES_ANSOFF[0];
export const NIVELES_RIESGO = { 1: 'Bajo', 2: 'Medio', 3: 'Alto' };

export const crearIniciativa = (cuadrante, cambios = {}) => ({
  id: crearIdF6('ini'), cuadrante, nombre: '', descripcion: '', potencial: 3, inversion: '', plazo: 'mediano', estrategiaDafo: '', ...cambios
});

const n = v => { const x = Number(v); return Number.isFinite(x) && x > 0 ? x : 0; };

/** Atractivo 1–10: el potencial pesa el doble y el riesgo del cuadrante resta. */
export const atractivoIniciativa = ini => Math.max(1, Math.min(10, n(ini.potencial) * 2 - obtenerCuadranteAnsoff(ini.cuadrante).riesgo + 1));

export function calcularResumenAnsoff(iniciativas) {
  const cuadrantes = CUADRANTES_ANSOFF.map(c => {
    const lista = iniciativas.filter(i => i.cuadrante === c.id);
    const atractivo = lista.length ? lista.reduce((t, i) => t + atractivoIniciativa(i), 0) / lista.length : 0;
    return { ...c, total: lista.length, inversion: lista.reduce((t, i) => t + n(i.inversion), 0), atractivo, puntaje: lista.reduce((t, i) => t + atractivoIniciativa(i), 0) };
  });
  const conIniciativas = cuadrantes.filter(c => c.total);
  const recomendado = conIniciativas.length ? conIniciativas.reduce((a, b) => (b.puntaje / b.riesgo > a.puntaje / a.riesgo ? b : a)).id : 'penetracion';
  const riesgoMedio = iniciativas.length ? iniciativas.reduce((t, i) => t + obtenerCuadranteAnsoff(i.cuadrante).riesgo, 0) / iniciativas.length : null;
  return { cuadrantes, recomendado, total: iniciativas.length, inversion: cuadrantes.reduce((t, c) => t + c.inversion, 0), riesgoMedio };
}


export const PLANTILLA_CONCLUSION_DAFO = [
  'Estrategia prioritaria: ¿cuál es la estrategia más importante y por qué?',
  'Postura: ¿la empresa debe atacar, defenderse, reorientarse o sobrevivir?',
  'Recursos: ¿qué necesita la empresa para ejecutar las estrategias de prioridad alta?',
  'Medición: ¿qué indicadores mostrarán que las estrategias funcionan?'
].join('\n\n');

export const PLANTILLA_CONCLUSION_ANSOFF = [
  'Estrategia de crecimiento elegida: ¿cuál y por qué?',
  'Riesgo asumido: ¿qué tan arriesgada es y cómo se mitiga?',
  'Primeros pasos: ¿qué iniciativas se ejecutarán primero y con qué inversión?',
  'Meta: ¿cuánto se espera crecer (ventas, clientes, participación) y en qué plazo?'
].join('\n\n');
