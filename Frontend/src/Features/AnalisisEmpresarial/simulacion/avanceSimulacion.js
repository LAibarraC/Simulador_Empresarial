/**
 * Avance de la simulación por caso, guardado en este navegador (localStorage).
 * Guarda la fase y el paso en curso, la fase más alta alcanzada y los datos de las fases 1, 2, 3 y 5.
 * Las fases 4 y 6 ya se guardan por caso en sus propios almacenes
 * («simulador:diagnostico-interno:v1» y «simulador:planificacion:v1»).
 */
const CLAVE = 'simulador:avance:v1';

export const NOMBRES_FASES = {
  1: 'Contexto del caso',
  2: 'Identificación del problema',
  3: 'Diagnóstico externo',
  4: 'Diagnóstico interno',
  5: 'Análisis de resultados',
  6: 'Planificación estratégica'
};

/** Misma clave por caso que usan el diagnóstico interno y la planificación. */
export const claveCaso = caso => caso?.id || caso?._id || caso?.titulo || 'caso-activo';

export function leerAvances() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE) || '{}');
    return datos && typeof datos === 'object' ? datos : {};
  } catch {
    return {};
  }
}

export const leerAvance = clave => leerAvances()[clave] || null;

export function guardarAvance(clave, avance) {
  try {
    const todos = leerAvances();
    const previo = todos[clave];
    todos[clave] = {
      completadas: previo?.completadas || 0,
      ...avance,
      faseMaxima: Math.max(previo?.faseMaxima || 1, avance.faseActual || 1),
      iniciado: previo?.iniciado || new Date().toISOString(),
      actualizado: new Date().toISOString()
    };
    localStorage.setItem(CLAVE, JSON.stringify(todos));
  } catch (error) {
    console.warn('No se pudo guardar el avance de la simulación en este navegador:', error);
  }
}

/** Actualiza solo campos sueltos (p. ej. cuántas fases están realmente completadas) sin tocar la hora de guardado. */
export function actualizarAvance(clave, parcial) {
  try {
    const todos = leerAvances();
    if (!todos[clave]) return;
    todos[clave] = { ...todos[clave], ...parcial };
    localStorage.setItem(CLAVE, JSON.stringify(todos));
  } catch { /* sin almacenamiento */ }
}

export function borrarAvance(clave) {
  try {
    const todos = leerAvances();
    delete todos[clave];
    localStorage.setItem(CLAVE, JSON.stringify(todos));
  } catch { /* sin almacenamiento */ }
}

/** «hace 5 min», «hace 2 h», «hace 3 días» o la fecha. */
export function haceCuanto(fechaIso) {
  const fecha = new Date(fechaIso);
  const minutos = Math.round((Date.now() - fecha.getTime()) / 60000);
  if (!Number.isFinite(minutos)) return '';
  if (minutos < 1) return 'hace un momento';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.round(horas / 24);
  if (dias < 7) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
  return fecha.toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' });
}
