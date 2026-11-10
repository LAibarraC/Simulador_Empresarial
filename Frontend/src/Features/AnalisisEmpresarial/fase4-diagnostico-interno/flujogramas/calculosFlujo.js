/**
 * flujoCalculations.js — lógica pura del Flujograma de carriles.
 * Conserva el formato guardado anterior: filas { id, orden, tipo, actividad, responsable, salida, rutaSi, destinoSi, rutaNo, destinoNo }
 * y añade { tiempo (min), critico (bool), destino }.
 * `destino` (paso que no es decisión): '' = sigue al paso siguiente en la lista, id = continúa en ese paso,
 * '-' = sin continuación. `destinoSi` también acepta '-' para quitar la salida.
 */
import { crearIdRegistro } from '../../compartido/useRegistrosHerramienta';

export const ID_FLUJO = 'flujogramas';
export const TIPOS_PASO = [
  { id: 'Inicio / fin', nombre: 'Inicio / fin', forma: 'terminal' },
  { id: 'Actividad', nombre: 'Actividad', forma: 'proceso' },
  { id: 'Decisión', nombre: 'Decisión', forma: 'decision' }
];
export const SIN_RESPONSABLE = 'Sin asignar';
export const formaDe = tipo => TIPOS_PASO.find(item => item.id === tipo)?.forma || 'proceso';

export const crearPaso = (cambios = {}) => ({
  id: crearIdRegistro('paso'), orden: 0, tipo: 'Actividad', actividad: '', responsable: '', salida: '', tiempo: '', critico: false, destino: '',
  rutaSi: '', destinoSi: '', rutaNo: '', destinoNo: '', ...cambios
});

/** Ordena por `orden`, asigna tipo por defecto y renumera 1..n. */
export function normalizarPasos(filas) {
  return [...filas].sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0))
    .map((fila, indice) => ({ ...crearPaso(), ...fila, tipo: TIPOS_PASO.some(t => t.id === fila.tipo) ? fila.tipo : 'Actividad', orden: indice + 1 }));
}
export const renumerar = pasos => pasos.map((paso, indice) => ({ ...paso, orden: indice + 1 }));

export function plantillaFlujo() {
  const pasos = [
    crearPaso({ tipo: 'Inicio / fin', actividad: 'Cliente solicita el servicio', responsable: 'Cliente' }),
    crearPaso({ actividad: 'Registrar solicitud', responsable: 'Atención al cliente', tiempo: 5 }),
    crearPaso({ tipo: 'Decisión', actividad: '¿Solicitud completa?', responsable: 'Atención al cliente', rutaSi: 'Completa', rutaNo: 'Faltan datos' }),
    crearPaso({ actividad: 'Procesar y aprobar', responsable: 'Operaciones', tiempo: 30 }),
    crearPaso({ tipo: 'Inicio / fin', actividad: 'Entregar al cliente', responsable: 'Cliente' })
  ];
  pasos[2].destinoSi = pasos[3].id;
  pasos[2].destinoNo = pasos[1].id;
  return renumerar(pasos);
}

/** Carriles: responsables en orden de aparición (y "Sin asignar" si hace falta). */
export function obtenerCarriles(pasos) {
  const carriles = [];
  pasos.forEach(paso => { const nombre = paso.responsable?.trim() || SIN_RESPONSABLE; if (!carriles.includes(nombre)) carriles.push(nombre); });
  return carriles.length ? carriles : [SIN_RESPONSABLE];
}

/** Aristas del diagrama: { desde, hasta, etiqueta?, tipo: 'si'|'no'|'flujo' } */
export function construirAristas(pasos) {
  const aristas = [];
  const existe = id => pasos.some(paso => paso.id === id);
  pasos.forEach((paso, i) => {
    const siguiente = pasos[i + 1]?.id;
    if (paso.tipo === 'Decisión') {
      const si = paso.destinoSi === '-' ? null : existe(paso.destinoSi) ? paso.destinoSi : siguiente;
      if (si) aristas.push({ desde: paso.id, hasta: si, etiqueta: paso.rutaSi?.trim() || 'Sí', tipo: 'si' });
      if (existe(paso.destinoNo)) aristas.push({ desde: paso.id, hasta: paso.destinoNo, etiqueta: paso.rutaNo?.trim() || 'No', tipo: 'no' });
      return;
    }
    if (paso.destino === '-') return;
    if (paso.tipo === 'Inicio / fin' && i > 0) return; // un fin no tiene salida
    const destino = existe(paso.destino) && paso.destino !== paso.id ? paso.destino : siguiente;
    if (destino) aristas.push({ desde: paso.id, hasta: destino, tipo: 'flujo' });
  });
  return aristas;
}

/* ---------------------------------------------------------------------------
   Operaciones sobre el diagrama (puras: devuelven una lista nueva de pasos)
   --------------------------------------------------------------------------- */

/** Convierte en explícitas las continuaciones automáticas, para que reordenar no cambie el flujo. */
export function fijarConexiones(pasos) {
  const aristas = construirAristas(pasos);
  return pasos.map(paso => {
    const salida = aristas.find(a => a.desde === paso.id && a.tipo !== 'no');
    if (!salida) return paso;
    return paso.tipo === 'Decisión' ? (paso.destinoSi ? paso : { ...paso, destinoSi: salida.hasta }) : (paso.destino ? paso : { ...paso, destino: salida.hasta });
  });
}

/** Mueve un paso a la fila `fila` (0-based) y, si se indica, a otro responsable (carril). El flujo se conserva. */
export function moverPaso(pasos, id, { fila, responsable }) {
  const fijados = fijarConexiones(pasos);
  const origen = fijados.findIndex(paso => paso.id === id);
  if (origen < 0) return pasos;
  const copia = [...fijados];
  const [paso] = copia.splice(origen, 1);
  const destino = Math.max(0, Math.min(copia.length, fila));
  copia.splice(destino, 0, responsable === undefined ? paso : { ...paso, responsable });
  return copia;
}

/** Crea o cambia una conexión. tipo: 'flujo' | 'si' | 'no'. */
export function conectarPasos(pasos, desdeId, hastaId, tipo = 'flujo') {
  if (desdeId === hastaId) return pasos;
  const campo = tipo === 'si' ? 'destinoSi' : tipo === 'no' ? 'destinoNo' : 'destino';
  return pasos.map(paso => (paso.id === desdeId ? { ...paso, [campo]: hastaId } : paso));
}

/** Quita una conexión: las salidas Sí/continuación pasan a «sin salida» y la No queda sin definir. */
export function quitarConexion(pasos, desdeId, tipo = 'flujo') {
  const campo = tipo === 'si' ? 'destinoSi' : tipo === 'no' ? 'destinoNo' : 'destino';
  return pasos.map(paso => (paso.id === desdeId ? { ...paso, [campo]: tipo === 'no' ? '' : '-' } : paso));
}

/** Inserta un paso nuevo en medio de la conexión desde → hasta. Devuelve { pasos, nuevoId }. */
export function insertarEnConexion(pasos, desdeId, hastaId, tipo, cambios = {}) {
  const fijados = fijarConexiones(pasos);
  const indice = fijados.findIndex(paso => paso.id === desdeId);
  if (indice < 0) return { pasos, nuevoId: null };
  const origen = fijados[indice];
  const nuevo = crearPaso({ responsable: origen.responsable || '', destino: hastaId, ...cambios });
  const copia = [...fijados];
  copia.splice(indice + 1, 0, nuevo);
  return { pasos: conectarPasos(copia, desdeId, nuevo.id, tipo), nuevoId: nuevo.id };
}

/** Añade un paso después de otro, conectándolo en su salida principal (rama «Sí» si es una decisión). */
export function agregarPasoDespues(pasos, despuesId, cambios = {}) {
  const indice = pasos.findIndex(paso => paso.id === despuesId);
  if (indice < 0) {
    const nuevo = crearPaso(cambios);
    return { pasos: [...pasos, nuevo], nuevoId: nuevo.id };
  }
  const salida = construirAristas(pasos).find(arista => arista.desde === despuesId && arista.tipo !== 'no');
  if (salida) return insertarEnConexion(pasos, despuesId, salida.hasta, salida.tipo, cambios);
  const origen = pasos[indice];
  const nuevo = crearPaso({ responsable: origen.responsable || '', ...cambios });
  const copia = [...pasos];
  copia.splice(indice + 1, 0, nuevo);
  const sePuedeConectar = origen.tipo !== 'Decisión' && !(origen.tipo === 'Inicio / fin' && indice > 0);
  return { pasos: sePuedeConectar ? conectarPasos(copia, despuesId, nuevo.id, 'flujo') : copia, nuevoId: nuevo.id };
}

/**
 * Guarda el recorrido personalizado de una flecha (arrastrada a mano). `ruta` puede traer
 * { t } (altura del tramo horizontal, 0–1), { dx } (desvío lateral en px) o { xr } (posición del canal, fracción del ancho).
 * Con `ruta` nulo la flecha vuelve a su trazado automático.
 */
export function ajustarRuta(pasos, desdeId, tipo, ruta) {
  return pasos.map(paso => {
    if (paso.id !== desdeId) return paso;
    const rutas = { ...(paso.ruta || {}) };
    if (ruta) rutas[tipo] = ruta; else delete rutas[tipo];
    return { ...paso, ruta: rutas };
  });
}

/** Duplica un paso justo debajo (sin copiar sus conexiones). Devuelve { pasos, nuevoId }. */
export function duplicarPaso(pasos, id) {
  const indice = pasos.findIndex(paso => paso.id === id);
  if (indice < 0) return { pasos, nuevoId: null };
  const original = pasos[indice];
  const copia = crearPaso({ ...original, id: undefined, actividad: original.actividad ? `${original.actividad} (copia)` : '', destino: '', destinoSi: '', destinoNo: '', ruta: {} });
  const lista = [...pasos];
  lista.splice(indice + 1, 0, copia);
  return { pasos: lista, nuevoId: copia.id };
}

/** Elimina un paso y reconecta quienes llegaban a él con su continuación. */
export function eliminarPaso(pasos, id) {
  const salida = construirAristas(pasos).find(a => a.desde === id && a.tipo !== 'no')?.hasta || '';
  const sustituir = valor => (valor === id ? salida : valor);
  return pasos.filter(paso => paso.id !== id).map(paso => ({ ...paso, destino: sustituir(paso.destino), destinoSi: sustituir(paso.destinoSi), destinoNo: sustituir(paso.destinoNo) }));
}

const minutos = valor => { const numero = Number(valor); return Number.isFinite(numero) && numero > 0 ? numero : 0; };
export const formatearTiempo = total => (total >= 60 ? `${Math.floor(total / 60)} h ${Math.round(total % 60)} min` : `${Math.round(total)} min`);

export function calcularMetricasFlujo(pasos) {
  const carriles = obtenerCarriles(pasos).filter(nombre => nombre !== SIN_RESPONSABLE);
  return {
    pasos: pasos.length,
    decisiones: pasos.filter(paso => paso.tipo === 'Decisión').length,
    responsables: carriles.length,
    tiempo: pasos.reduce((total, paso) => total + minutos(paso.tiempo), 0),
    criticos: pasos.filter(paso => paso.critico).length
  };
}

/** Pasos alcanzables desde el primero siguiendo las aristas. */
function alcanzables(pasos, aristas) {
  if (!pasos.length) return new Set();
  const visitados = new Set([pasos[0].id]);
  const pila = [pasos[0].id];
  while (pila.length) {
    const actual = pila.pop();
    aristas.filter(arista => arista.desde === actual).forEach(arista => { if (!visitados.has(arista.hasta)) { visitados.add(arista.hasta); pila.push(arista.hasta); } });
  }
  return visitados;
}

export function generarHallazgosFlujo(pasos) {
  const hallazgos = [];
  const agregar = (nivel, titulo, detalle) => hallazgos.push({ id: `h-${hallazgos.length}`, nivel, titulo, detalle });
  if (!pasos.length) return hallazgos;
  const nombre = paso => `Paso ${paso.orden}${paso.actividad?.trim() ? ` · ${paso.actividad.trim()}` : ''}`;
  const aristas = construirAristas(pasos);

  if (pasos[0].tipo !== 'Inicio / fin') agregar('warning', 'Falta el inicio del proceso', 'El primer paso debería ser un nodo «Inicio / fin» que indique qué dispara el proceso.');
  if (pasos.length > 1 && !pasos.slice(1).some(paso => paso.tipo === 'Inicio / fin')) agregar('warning', 'Falta el fin del proceso', 'Añade un nodo «Inicio / fin» que indique el resultado final.');
  pasos.filter(paso => paso.tipo === 'Decisión' && !pasos.some(otro => otro.id === paso.destinoNo)).forEach(paso => agregar('warning', `Decisión sin ruta «No»: ${nombre(paso)}`, 'Toda decisión necesita dos salidas. Indica a qué paso se va cuando la condición no se cumple.'));
  pasos.filter(paso => paso.tipo === 'Decisión' && paso.destinoSi && paso.destinoSi === paso.destinoNo).forEach(paso => agregar('warning', `Rutas iguales en ${nombre(paso)}`, 'Las salidas Sí y No llevan al mismo paso: la decisión no cambia nada.'));
  const visitados = alcanzables(pasos, aristas);
  const huerfanos = pasos.filter(paso => !visitados.has(paso.id));
  if (huerfanos.length) agregar('warning', 'Pasos inalcanzables', `${huerfanos.map(nombre).join(', ')}: ningún camino desde el inicio llega a ellos.`);
  const conSalida = new Set(aristas.map(arista => arista.desde));
  const sinSalida = pasos.filter((paso, i) => paso.tipo !== 'Inicio / fin' && !conSalida.has(paso.id) && (i < pasos.length - 1 || pasos.length > 1));
  if (sinSalida.length) agregar('warning', 'Pasos sin continuación', `${sinSalida.map(nombre).join(', ')}: el flujo se corta aquí. Conéctalos con otro paso o con un nodo de fin.`);
  const sinResponsable = pasos.filter(paso => !paso.responsable?.trim());
  if (sinResponsable.length) agregar('info', 'Pasos sin responsable', `${sinResponsable.length} paso(s) sin responsable asignado.`);

  const porResponsable = {};
  pasos.forEach(paso => { const r = paso.responsable?.trim(); if (r) porResponsable[r] = (porResponsable[r] || 0) + minutos(paso.tiempo); });
  const [mayor, tiempoMayor] = Object.entries(porResponsable).sort((a, b) => b[1] - a[1])[0] || [];
  const total = Object.values(porResponsable).reduce((a, b) => a + b, 0);
  if (mayor && tiempoMayor && total && tiempoMayor / total >= 0.5 && Object.keys(porResponsable).length > 1) agregar('info', `Carga concentrada en «${mayor}»`, `Concentra ${Math.round((tiempoMayor / total) * 100)}% del tiempo del proceso: posible cuello de botella.`);
  pasos.filter(paso => paso.critico).forEach(paso => agregar('warning', `Punto crítico: ${nombre(paso)}`, paso.salida?.trim() || 'Marcado como cuello de botella; propone cómo simplificarlo o automatizarlo.'));
  const regresos = aristas.filter(arista => pasos.findIndex(p => p.id === arista.hasta) < pasos.findIndex(p => p.id === arista.desde));
  if (regresos.length) agregar('info', `${regresos.length} ${regresos.length === 1 ? 'reproceso' : 'reprocesos'} en el flujo`, 'Los retornos a pasos anteriores alargan el proceso; evalúa cómo prevenir el error de origen.');
  if (!hallazgos.some(item => item.nivel === 'warning')) agregar('ok', 'Estructura del flujo correcta', 'El proceso tiene inicio, fin y todas sus decisiones tienen dos salidas.');
  return hallazgos;
}

export const PLANTILLA_CONCLUSION_FLUJO = [
  'Hallazgo principal: ¿dónde se pierde tiempo o se generan errores?',
  'Causa: ¿por qué ocurre (falta de información, aprobaciones, reprocesos)?',
  'Mejora propuesta: ¿qué pasos eliminarías, unirías o automatizarías?',
  'Indicador: ¿cómo medirás la mejora (tiempo de ciclo, errores, satisfacción)?'
].join('\n\n');
