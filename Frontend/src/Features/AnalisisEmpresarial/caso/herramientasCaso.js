/**
 * Herramientas que el docente puede habilitar en un caso de Análisis Empresarial (fases 3 a 6).
 * - Fase 3: diagnóstico externo. Fase 4: diagnóstico interno. Fase 5: FODA y reportes. Fase 6: DAFO y Ansoff.
 * - «resumen-externo» solo tiene sentido si hay alguna herramienta de la Fase 3, y
 *   «resumen-interno» si hay alguna de la Fase 4. El reporte de identificación del problema
 *   (Fase 2) está siempre disponible.
 */
export const IDS_FASE3 = ['pestel', 'poam', 'porter', 'mpc'];
export const IDS_FASE4 = ['interno-vertical-horizontal', 'customer-journey', 'flujogramas', 'efi', 'auditoria-redes', 'evaluacion-360', 'inventarios'];
export const IDS_FASE5 = ['foda', 'resumen-externo', 'resumen-interno'];
export const IDS_FASE6 = ['dafo', 'ansoff'];
export const TODAS_LAS_HERRAMIENTAS = [...IDS_FASE3, ...IDS_FASE4, ...IDS_FASE5, ...IDS_FASE6];

/** Nombres cortos para etiquetas y tarjetas. */
export const NOMBRES_HERRAMIENTAS = {
  pestel: 'PESTEL', poam: 'POAM', porter: 'Porter', mpc: 'MPC',
  'interno-vertical-horizontal': 'Análisis vertical y horizontal', 'customer-journey': 'Customer Journey Map', flujogramas: 'Flujogramas', efi: 'Matriz EFI',
  'auditoria-redes': 'Auditoría de redes sociales', 'evaluacion-360': 'Evaluación 360°', inventarios: 'Inventarios y almacenes',
  foda: 'Matriz FODA', 'resumen-externo': 'Resumen diagnóstico externo', 'resumen-interno': 'Resumen diagnóstico interno',
  dafo: 'Matriz DAFO', ansoff: 'Matriz Ansoff'
};

/** Herramientas que necesitan otra herramienta concreta (POAM se construye a partir de PESTEL). */
export const DEPENDENCIAS_HERRAMIENTA = { poam: 'pestel' };

/** Quita lo desconocido y las herramientas cuyo requisito (otra herramienta, o la fase 3 o 4) ya no está seleccionado. */
export function normalizarHerramientas(ids) {
  const lista = TODAS_LAS_HERRAMIENTAS.filter(id => (ids || []).includes(id));
  const hayFase3 = lista.some(id => IDS_FASE3.includes(id));
  const hayFase4 = lista.some(id => IDS_FASE4.includes(id));
  return lista.filter(id => (id !== 'resumen-externo' || hayFase3) && (id !== 'resumen-interno' || hayFase4) && (!DEPENDENCIAS_HERRAMIENTA[id] || lista.includes(DEPENDENCIAS_HERRAMIENTA[id])));
}

/**
 * Herramientas habilitadas de un caso. Los casos guardados antes de este selector solo traen
 * `herramientasDiagnostico` (fase 3 + FODA): para ellos las fases 4 a 6 siguen completas.
 */
export function herramientasDelCaso(caso) {
  const guardadas = caso?.detalles?.herramientasFases;
  if (Array.isArray(guardadas) && guardadas.length) return normalizarHerramientas(guardadas);
  const heredadas = caso?.detalles?.herramientasDiagnostico || caso?.herramientasDiagnostico;
  const base = Array.isArray(heredadas) && heredadas.length ? heredadas.filter(id => id !== 'efi') : ['pestel', 'poam', 'porter', 'mpc', 'foda'];
  return normalizarHerramientas([...base, ...IDS_FASE4, 'resumen-externo', 'resumen-interno', ...IDS_FASE6]);
}

/** Subconjunto «clásico» (fase 3 + FODA) que sigue guardándose en `herramientasDiagnostico`. */
export const herramientasClasicas = ids => (ids || []).filter(id => IDS_FASE3.includes(id) || id === 'foda');
