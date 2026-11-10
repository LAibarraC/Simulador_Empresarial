/**
 * eval360Calculations.js — lógica pura de la Evaluación 360°.
 * Formato compatible: filas { id, persona, competencia, auto, pares, equipo, lider, comentario } (una fila por competencia).
 */
import { crearIdRegistro } from '../../compartido/useRegistrosHerramienta';

export const ID_360 = 'evaluacion-360';
export const FUENTES = [
  { id: 'auto', nombre: 'Autoevaluación', corto: 'Auto', color: '#ea580c' },
  { id: 'lider', nombre: 'Líder', corto: 'Líder', color: '#2563eb' },
  { id: 'pares', nombre: 'Pares', corto: 'Pares', color: '#7c3aed' },
  { id: 'equipo', nombre: 'Equipo a cargo', corto: 'Equipo', color: '#059669' }
];
export const FUENTES_EXTERNAS = ['lider', 'pares', 'equipo'];
export const COMPETENCIAS_BASE = ['Comunicación', 'Trabajo en equipo', 'Liderazgo', 'Orientación a resultados', 'Resolución de problemas'];
export const ESCALA_360 = ['Necesita mejorar', 'En desarrollo', 'Cumple lo esperado', 'Supera lo esperado', 'Desempeño destacado'];

export const crearFila360 = (persona, competencia = '') => ({ id: crearIdRegistro('c360'), persona, competencia, auto: '', pares: '', equipo: '', lider: '', comentario: '' });

const nota = valor => { const numero = Number(valor); return valor !== '' && valor !== null && Number.isFinite(numero) && numero >= 1 && numero <= 5 ? numero : null; };
const media = valores => { const v = valores.filter(x => x !== null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };

/** Métricas por competencia y su lectura (ventana de Johari simplificada). */
export function analizarCompetencia(fila) {
  const auto = nota(fila.auto);
  const otros = media(FUENTES_EXTERNAS.map(fuente => nota(fila[fuente])));
  const general = media(FUENTES.map(fuente => nota(fila[fuente.id])));
  const brecha = auto !== null && otros !== null ? auto - otros : null;
  let lectura = null;
  if (brecha !== null && brecha >= 1) lectura = { id: 'ciego', nombre: 'Punto ciego', tono: 'bad', ayuda: 'Se valora más alto de lo que lo perciben los demás.' };
  else if (brecha !== null && brecha <= -1) lectura = { id: 'oculta', nombre: 'Fortaleza oculta', tono: 'accent', ayuda: 'Los demás la valoran más que la propia persona.' };
  else if (general !== null && general >= 4) lectura = { id: 'fortaleza', nombre: 'Fortaleza', tono: 'ok', ayuda: 'Valoración alta y coincidente.' };
  else if (general !== null && general < 3) lectura = { id: 'desarrollo', nombre: 'A desarrollar', tono: 'warn', ayuda: 'Valoración baja: prioriza un plan de acción.' };
  else if (general !== null) lectura = { id: 'adecuado', nombre: 'Adecuado', tono: '', ayuda: 'Cumple lo esperado.' };
  return { ...fila, autoNota: auto, otros, general, brecha, lectura };
}

/** Agrupa las filas por persona (en orden de aparición). */
export function agruparPorPersona(filas) {
  const grupos = new Map();
  filas.forEach(fila => {
    const nombre = fila.persona?.trim() || 'Sin nombre';
    if (!grupos.has(nombre)) grupos.set(nombre, []);
    grupos.get(nombre).push(analizarCompetencia(fila));
  });
  return [...grupos.entries()].map(([nombre, competencias]) => {
    const general = media(competencias.map(c => c.general));
    const conDatos = competencias.filter(c => c.general !== null);
    const ordenadas = [...conDatos].sort((a, b) => b.general - a.general);
    return {
      nombre, competencias, general,
      autoMedia: media(competencias.map(c => c.autoNota)), otrosMedia: media(competencias.map(c => c.otros)),
      fortaleza: ordenadas[0] || null, mejora: ordenadas.length > 1 ? ordenadas[ordenadas.length - 1] : null,
      ciegos: competencias.filter(c => c.lectura?.id === 'ciego').length,
      completitud: competencias.length ? Math.round((competencias.reduce((t, c) => t + FUENTES.filter(f => nota(c[f.id]) !== null).length, 0) / (competencias.length * FUENTES.length)) * 100) : 0
    };
  });
}

export const nivelDe = valor => (valor === null ? null : valor >= 4 ? 'ok' : valor >= 3 ? 'warn' : 'bad');
export const iniciales = nombre => String(nombre || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('') || '?';

/** Matriz equipo × competencias (promedio general) para el mapa de calor. */
export function construirMapaCalor(personas) {
  const competencias = [];
  personas.forEach(p => p.competencias.forEach(c => { const n = c.competencia?.trim(); if (n && !competencias.includes(n)) competencias.push(n); }));
  return {
    competencias,
    filas: personas.map(p => ({ nombre: p.nombre, general: p.general, celdas: competencias.map(nombre => p.competencias.find(c => c.competencia?.trim() === nombre)?.general ?? null) })),
    promedios: competencias.map(nombre => media(personas.map(p => p.competencias.find(c => c.competencia?.trim() === nombre)?.general ?? null)))
  };
}

export function generarHallazgos360(personas) {
  const hallazgos = [];
  const agregar = (nivel, titulo, detalle) => hallazgos.push({ id: `h-${hallazgos.length}`, nivel, titulo, detalle });
  if (!personas.length) return hallazgos;
  const mapa = construirMapaCalor(personas);
  const conPromedio = mapa.competencias.map((nombre, i) => ({ nombre, valor: mapa.promedios[i] })).filter(c => c.valor !== null).sort((a, b) => b.valor - a.valor);
  if (conPromedio.length > 1) {
    agregar('ok', `Fortaleza del equipo: ${conPromedio[0].nombre}`, `Promedio de ${conPromedio[0].valor.toFixed(1)} / 5.`);
    const ultima = conPromedio[conPromedio.length - 1];
    agregar(ultima.valor < 3 ? 'warning' : 'info', `Brecha del equipo: ${ultima.nombre}`, `Promedio de ${ultima.valor.toFixed(1)} / 5. Candidata a capacitación grupal.`);
  }
  personas.forEach(persona => {
    const ciegos = persona.competencias.filter(c => c.lectura?.id === 'ciego');
    if (ciegos.length) agregar('warning', `${persona.nombre}: ${ciegos.length} punto(s) ciego(s)`, `${ciegos.map(c => c.competencia).join(', ')}. Conviene una retroalimentación individual con ejemplos concretos.`);
    const ocultas = persona.competencias.filter(c => c.lectura?.id === 'oculta');
    if (ocultas.length) agregar('info', `${persona.nombre}: fortalezas ocultas`, `${ocultas.map(c => c.competencia).join(', ')}. Reconócelas para reforzar la confianza.`);
    if (persona.completitud < 100 && persona.competencias.length) agregar('info', `${persona.nombre}: evaluación incompleta`, `Faltan calificaciones (${persona.completitud}% completado).`);
    const sinPlan = persona.competencias.filter(c => c.lectura?.id === 'desarrollo' && !c.comentario?.trim());
    if (sinPlan.length) agregar('warning', `${persona.nombre}: sin plan de acción`, `${sinPlan.map(c => c.competencia).join(', ')} tiene(n) valoración baja y no registra(n) un plan.`);
  });
  return hallazgos;
}

export const PLANTILLA_CONCLUSION_360 = [
  'Fortalezas del equipo: ¿qué competencias sostienen el desempeño?',
  'Brechas prioritarias: ¿qué competencias requieren desarrollo y en quiénes?',
  'Puntos ciegos: ¿dónde difiere la autopercepción de la visión de los demás?',
  'Plan de desarrollo: capacitación, mentoría o acciones concretas con fecha.'
].join('\n\n');
