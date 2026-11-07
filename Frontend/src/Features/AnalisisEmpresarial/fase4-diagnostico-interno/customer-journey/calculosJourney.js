/**
 * cjmCalculations.js
 * Lógica pura (sin React) del Customer Journey Map: modelo, migración, métricas y hallazgos.
 */

export const ID_CJM = 'customer-journey';
export const MAX_ETAPAS = 8;

/** Escala emocional 1–5 con colores fijos (válidos también para el PDF). */
export const EMOCIONES = [
  { valor: 1, nombre: 'Muy frustrado', corto: 'Frustrado', color: '#dc2626', fondo: '#fef2f2', icono: 'Angry' },
  { valor: 2, nombre: 'Insatisfecho', corto: 'Molesto', color: '#f97316', fondo: '#fff7ed', icono: 'Frown' },
  { valor: 3, nombre: 'Neutral', corto: 'Neutral', color: '#eab308', fondo: '#fefce8', icono: 'Meh' },
  { valor: 4, nombre: 'Satisfecho', corto: 'Contento', color: '#22c55e', fondo: '#f0fdf4', icono: 'Smile' },
  { valor: 5, nombre: 'Encantado', corto: 'Encantado', color: '#059669', fondo: '#ecfdf5', icono: 'Laugh' }
];
export const obtenerEmocion = valor => EMOCIONES.find(item => item.valor === Number(valor)) || null;

export const CANALES = ['Sitio web', 'Redes sociales', 'Tienda física', 'App móvil', 'WhatsApp / chat', 'Teléfono', 'Correo', 'Vendedor', 'Publicidad', 'Otro'];

export const PRIORIDADES = [
  { id: 'alta', nombre: 'Alta' },
  { id: 'media', nombre: 'Media' },
  { id: 'baja', nombre: 'Baja' }
];

/** Carriles del mapa, en orden de lectura. */
export const CARRILES = [
  { id: 'accion', nombre: 'Acciones', ayuda: '¿Qué hace el cliente?' },
  { id: 'contacto', nombre: 'Puntos de contacto', ayuda: '¿Dónde interactúa?' },
  { id: 'pensamiento', nombre: 'Pensamientos', ayuda: '¿Qué piensa o dice?' },
  { id: 'emocion', nombre: 'Emoción', ayuda: '¿Cómo se siente?' },
  { id: 'dolor', nombre: 'Fricciones', ayuda: '¿Qué le molesta?' },
  { id: 'oportunidad', nombre: 'Oportunidades', ayuda: '¿Qué podemos mejorar?' }
];

export const ETAPAS_PLANTILLA = ['Descubrimiento', 'Consideración', 'Compra', 'Uso / servicio', 'Fidelización'];

export const crearId = () => `cjm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const crearEtapa = (nombre = '') => ({
  id: crearId(), nombre, accion: '', canal: '', contacto: '', pensamiento: '', emocion: null, dolor: '', oportunidad: '', prioridad: ''
});

const texto = valor => (typeof valor === 'string' ? valor : valor == null ? '' : String(valor));
const emocionValida = valor => { const numero = Math.round(Number(valor)); return numero >= 1 && numero <= 5 ? numero : null; };

export const COLORES_CLIENTE = ['#ea580c', '#2563eb', '#7c3aed', '#059669', '#db2777', '#0891b2'];
export const MAX_CLIENTES = 6;

/** Normaliza un cliente (formato actual o antiguo de tabla) con su persona, etapas y conclusión. */
function normalizarCliente(base, indice = 0) {
  let etapas;
  if (Array.isArray(base.etapas)) {
    etapas = base.etapas.map(etapa => ({ ...crearEtapa(), ...etapa, emocion: emocionValida(etapa.emocion) }));
  } else {
    etapas = (Array.isArray(base.filas) ? base.filas : [])
      .slice().sort((a, b) => Number(a.orden || 0) - Number(b.orden || 0))
      .map(fila => ({
        ...crearEtapa(texto(fila.etapa)), id: fila.id || crearId(), accion: texto(fila.accion), contacto: texto(fila.contacto),
        emocion: emocionValida(fila.emocion), dolor: texto(fila.dolor), oportunidad: texto(fila.oportunidad)
      }));
  }
  const persona = base.persona || {};
  return {
    id: base.id || `cli-${indice + 1}`,
    color: base.color || COLORES_CLIENTE[indice % COLORES_CLIENTE.length],
    persona: { nombre: texto(persona.nombre), perfil: texto(persona.perfil), objetivo: texto(persona.objetivo), escenario: texto(persona.escenario) },
    etapas,
    conclusiones: texto(base.conclusiones)
  };
}

export const crearCliente = (indice, persona = {}) => ({
  id: crearId(), color: COLORES_CLIENTE[indice % COLORES_CLIENTE.length],
  persona: { nombre: '', perfil: '', objetivo: '', escenario: '', ...persona }, etapas: [], conclusiones: ''
});

/**
 * Lee lo guardado y devuelve el modelo multi-cliente:
 * { version: 3, clientes: [{ id, color, persona, etapas, conclusiones }], documentos, conclusionesGenerales }.
 * Los formatos anteriores (un solo cliente o tabla de filas) pasan a ser el primer cliente.
 */
export function normalizarJourney(guardado) {
  const base = Array.isArray(guardado) ? { filas: guardado } : (guardado || {});
  let clientes;
  if (Array.isArray(base.clientes)) clientes = base.clientes.map((cliente, i) => normalizarCliente(cliente, i));
  else {
    const tieneDatos = (Array.isArray(base.etapas) && base.etapas.length) || (Array.isArray(base.filas) && base.filas.length) || base.persona?.nombre;
    clientes = tieneDatos ? [normalizarCliente(base, 0)] : [];
  }
  return {
    version: 3,
    clientes,
    documentos: Array.isArray(base.documentos) ? base.documentos : [],
    conclusionesGenerales: texto(base.conclusionesGenerales)
  };
}

/** Indicadores de cada cliente para compararlos entre sí. */
export function compararClientes(clientes) {
  return clientes.map(cliente => {
    const metricas = calcularMetricas(cliente.etapas);
    const conEmocion = cliente.etapas.filter(e => e.emocion);
    const peor = conEmocion.length ? conEmocion.reduce((a, b) => (b.emocion < a.emocion ? b : a)) : null;
    return { cliente, metricas, peor };
  });
}

export const iniciales = nombre => texto(nombre).trim().split(/\s+/).filter(Boolean).slice(0, 2).map(parte => parte[0].toUpperCase()).join('') || 'CL';

/** Porcentaje de campos clave completados en todas las etapas. */
export function calcularCompletitud(etapas) {
  if (!etapas.length) return 0;
  const campos = ['accion', 'contacto', 'emocion', 'dolor', 'oportunidad'];
  const llenos = etapas.reduce((total, etapa) => total + campos.filter(campo => (campo === 'emocion' ? etapa.emocion : texto(etapa[campo]).trim())).length, 0);
  return Math.round((llenos / (etapas.length * campos.length)) * 100);
}

export function calcularMetricas(etapas) {
  const conEmocion = etapas.filter(etapa => etapa.emocion);
  const promedio = conEmocion.length ? conEmocion.reduce((total, etapa) => total + etapa.emocion, 0) / conEmocion.length : null;
  return {
    etapas: etapas.length,
    promedio,
    criticas: conEmocion.filter(etapa => etapa.emocion <= 2).length,
    oportunidades: etapas.filter(etapa => texto(etapa.oportunidad).trim()).length,
    altas: etapas.filter(etapa => etapa.prioridad === 'alta' && texto(etapa.oportunidad).trim()).length,
    completitud: calcularCompletitud(etapas)
  };
}

const nombreEtapa = (etapa, indice) => etapa.nombre?.trim() || `Etapa ${indice + 1}`;

/** Lectura automática del recorrido: momentos clave y vacíos a completar. */
export function generarHallazgosJourney(etapas) {
  const hallazgos = [];
  const agregar = (nivel, titulo, detalle) => hallazgos.push({ id: `h-${hallazgos.length}`, nivel, titulo, detalle });
  const indexadas = etapas.map((etapa, indice) => ({ ...etapa, indice, etiqueta: nombreEtapa(etapa, indice) }));
  const conEmocion = indexadas.filter(etapa => etapa.emocion);
  if (!etapas.length) return hallazgos;

  if (conEmocion.length) {
    const peor = conEmocion.reduce((a, b) => (b.emocion < a.emocion ? b : a));
    const mejor = conEmocion.reduce((a, b) => (b.emocion > a.emocion ? b : a));
    if (peor.emocion <= 2) agregar('warning', `Momento crítico: ${peor.etiqueta}`, peor.dolor?.trim() ? `El cliente se siente ${obtenerEmocion(peor.emocion).nombre.toLowerCase()}: ${peor.dolor.trim()}` : 'La emoción más baja del recorrido; documenta qué la provoca.');
    if (mejor.emocion >= 4 && mejor.id !== peor.id) agregar('ok', `Punto fuerte: ${mejor.etiqueta}`, 'Es la experiencia mejor valorada. Úsala como referencia para el resto del recorrido.');
    let caida = null;
    for (let i = 1; i < conEmocion.length; i += 1) {
      const delta = conEmocion[i].emocion - conEmocion[i - 1].emocion;
      if (delta <= -2 && (!caida || delta < caida.delta)) caida = { delta, desde: conEmocion[i - 1], hasta: conEmocion[i] };
    }
    if (caida) agregar('warning', `Caída brusca: ${caida.desde.etiqueta} → ${caida.hasta.etiqueta}`, `La emoción baja ${Math.abs(caida.delta)} puntos en esta transición. Revisa la continuidad entre ambos puntos de contacto.`);
    const promedio = conEmocion.reduce((total, etapa) => total + etapa.emocion, 0) / conEmocion.length;
    agregar(promedio >= 3.5 ? 'ok' : promedio >= 2.5 ? 'info' : 'warning', `Experiencia promedio: ${promedio.toFixed(1)} / 5`, promedio >= 3.5 ? 'El recorrido es mayormente positivo.' : 'El recorrido necesita mejoras para fidelizar al cliente.');
  }

  const sinEmocion = indexadas.filter(etapa => !etapa.emocion);
  if (sinEmocion.length) agregar('info', 'Etapas sin emoción asignada', sinEmocion.map(etapa => etapa.etiqueta).join(', '));
  const sinSolucion = indexadas.filter(etapa => etapa.dolor?.trim() && !etapa.oportunidad?.trim());
  if (sinSolucion.length) agregar('warning', 'Fricciones sin oportunidad de mejora', `${sinSolucion.map(etapa => etapa.etiqueta).join(', ')}: propone una acción concreta para cada una.`);
  const criticasSinPrioridad = indexadas.filter(etapa => etapa.emocion && etapa.emocion <= 2 && etapa.oportunidad?.trim() && etapa.prioridad !== 'alta');
  if (criticasSinPrioridad.length) agregar('info', 'Revisa las prioridades', `Las mejoras de ${criticasSinPrioridad.map(etapa => etapa.etiqueta).join(', ')} atacan momentos críticos; considera marcarlas como prioridad alta.`);
  return hallazgos;
}

/** Oportunidades ordenadas por prioridad y por emoción (las etapas más dolorosas primero). */
export function priorizarOportunidades(etapas) {
  const peso = { alta: 0, media: 1, baja: 2, '': 3 };
  return etapas
    .map((etapa, indice) => ({ ...etapa, indice, etiqueta: nombreEtapa(etapa, indice) }))
    .filter(etapa => etapa.oportunidad?.trim())
    .sort((a, b) => (peso[a.prioridad || ''] - peso[b.prioridad || '']) || ((a.emocion || 6) - (b.emocion || 6)));
}

export const PLANTILLA_CONCLUSION_CJM = [
  'Momento de la verdad: ¿qué etapa define si el cliente vuelve o se va?',
  'Causas: ¿por qué se generan las fricciones principales?',
  'Acciones prioritarias: ¿qué mejoras implementarías primero y quién es responsable?',
  'Indicadores: ¿cómo medirás que la experiencia mejoró (NPS, conversión, reclamos…)?'
].join('\n\n');

export const PLANTILLA_CONCLUSION_GENERAL = [
  'Cliente con peor experiencia: ¿quién es y en qué etapa se pierde?',
  'Fricciones comunes: ¿qué problemas se repiten entre los clientes?',
  'Diferencias: ¿qué necesita cada segmento que los otros no?',
  'Prioridad para la empresa: ¿qué mejora beneficia a más clientes a la vez?'
].join('\n\n');
