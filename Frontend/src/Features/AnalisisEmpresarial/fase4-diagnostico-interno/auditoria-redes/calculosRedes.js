/**
 * redesCalculations.js — lógica pura de la Auditoría de redes sociales.
 * Formato compatible: filas { id, red, usuario, seguidores, alcance, interacciones, clics, conversiones, frecuencia, objetivo }.
 */
import { crearIdRegistro } from '../../compartido/useRegistrosHerramienta';

export const ID_REDES = 'auditoria-redes';
export const REDES = [
  { nombre: 'Facebook', sigla: 'f', color: '#0866FF' },
  { nombre: 'Instagram', sigla: 'IG', color: '#E4405F' },
  { nombre: 'TikTok', sigla: 'TT', color: '#000000' },
  { nombre: 'LinkedIn', sigla: 'in', color: '#0A66C2' },
  { nombre: 'YouTube', sigla: 'YT', color: '#FF0000' },
  { nombre: 'X (Twitter)', sigla: 'X', color: '#000000' },
  { nombre: 'WhatsApp Business', sigla: 'WA', color: '#25D366' },
  { nombre: 'Pinterest', sigla: 'P', color: '#BD081C' }
];
export const marcaDe = nombre => {
  const texto = String(nombre || '').toLowerCase();
  return REDES.find(red => texto && (red.nombre.toLowerCase().startsWith(texto) || texto.includes(red.nombre.toLowerCase().split(' ')[0])))
    || { nombre: nombre || 'Canal', sigla: String(nombre || '?').trim().slice(0, 2).toUpperCase() || '?', color: '#ea580c' };
};

export const METRICAS = [
  { id: 'seguidores', nombre: 'Seguidores' }, { id: 'alcance', nombre: 'Alcance mensual' }, { id: 'interacciones', nombre: 'Interacciones' },
  { id: 'clics', nombre: 'Clics' }, { id: 'conversiones', nombre: 'Conversiones' }, { id: 'frecuencia', nombre: 'Publicaciones / semana' }
];

/** Referencias orientativas del sector (en %). */
export const REFERENCIAS = {
  interaccion: { bueno: 5, alerta: 2, nombre: 'Interacción', formula: 'Interacciones ÷ alcance' },
  ctr: { bueno: 2, alerta: 1, nombre: 'CTR', formula: 'Clics ÷ alcance' },
  conversion: { bueno: 5, alerta: 2, nombre: 'Conversión', formula: 'Conversiones ÷ clics' }
};

export const crearCanal = (red = '') => ({ id: crearIdRegistro('red'), red, usuario: '', seguidores: '', alcance: '', interacciones: '', clics: '', conversiones: '', frecuencia: '', objetivo: '' });

const n = valor => { const numero = Number(valor); return Number.isFinite(numero) && numero > 0 ? numero : 0; };
const tasa = (parte, total) => (total > 0 ? (parte / total) * 100 : null);
export const evaluar = (valor, ref) => (valor === null ? null : valor >= ref.bueno ? 'ok' : valor >= ref.alerta ? 'warn' : 'bad');

export function analizarCanal(fila) {
  const alcance = n(fila.alcance);
  const interaccion = tasa(n(fila.interacciones), alcance);
  const ctr = tasa(n(fila.clics), alcance);
  const conversion = tasa(n(fila.conversiones), n(fila.clics));
  const estados = { interaccion: evaluar(interaccion, REFERENCIAS.interaccion), ctr: evaluar(ctr, REFERENCIAS.ctr), conversion: evaluar(conversion, REFERENCIAS.conversion) };
  const evaluados = Object.values(estados).filter(Boolean);
  const puntaje = evaluados.length ? evaluados.reduce((total, estado) => total + (estado === 'ok' ? 2 : estado === 'warn' ? 1 : 0), 0) / (evaluados.length * 2) : null;
  const estado = puntaje === null ? null : puntaje >= 0.7 ? 'ok' : puntaje >= 0.4 ? 'warn' : 'bad';
  return { ...fila, marca: marcaDe(fila.red), interaccion, ctr, conversion, estados, estado, conDatos: alcance > 0 };
}

export function calcularTotalesRedes(canales) {
  const suma = campo => canales.reduce((total, canal) => total + n(canal[campo]), 0);
  const totales = { seguidores: suma('seguidores'), alcance: suma('alcance'), interacciones: suma('interacciones'), clics: suma('clics'), conversiones: suma('conversiones'), frecuencia: suma('frecuencia') };
  return { ...totales, interaccion: tasa(totales.interacciones, totales.alcance), ctr: tasa(totales.clics, totales.alcance), conversion: tasa(totales.conversiones, totales.clics) };
}


export function generarHallazgosRedes(canales) {
  const hallazgos = [];
  const agregar = (nivel, titulo, detalle) => hallazgos.push({ id: `h-${hallazgos.length}`, nivel, titulo, detalle });
  const conDatos = canales.filter(canal => canal.conDatos);
  const nombre = canal => canal.red || 'Canal sin nombre';
  if (!canales.length) return hallazgos;
  const sinDatos = canales.filter(canal => !canal.conDatos);
  if (sinDatos.length) agregar('info', 'Canales sin métricas', `${sinDatos.map(nombre).join(', ')}: registra al menos el alcance mensual.`);
  if (!conDatos.length) return hallazgos;

  const porInteraccion = conDatos.filter(canal => canal.interaccion !== null).sort((a, b) => b.interaccion - a.interaccion);
  if (porInteraccion.length > 1) {
    agregar('ok', `Mejor comunidad: ${nombre(porInteraccion[0])}`, `Interacción de ${porInteraccion[0].interaccion.toFixed(1)}%. Replica su tipo de contenido en los demás canales.`);
    const peor = porInteraccion[porInteraccion.length - 1];
    if (peor.estados.interaccion === 'bad') agregar('warning', `Interacción baja en ${nombre(peor)}`, `Solo ${peor.interaccion.toFixed(1)}% del alcance interactúa (referencia ≥ ${REFERENCIAS.interaccion.alerta}%). Revisa formato, horarios y llamados a la acción.`);
  }
  const conversiones = conDatos.reduce((total, canal) => total + n(canal.conversiones), 0);
  const lider = [...conDatos].sort((a, b) => n(b.conversiones) - n(a.conversiones))[0];
  if (conversiones > 0 && lider) {
    const peso = (n(lider.conversiones) / conversiones) * 100;
    agregar(peso >= 70 && conDatos.length > 1 ? 'warning' : 'ok', `${nombre(lider)} genera ${peso.toFixed(0)}% de las conversiones`, peso >= 70 && conDatos.length > 1 ? 'Alta dependencia de un solo canal: diversifica para reducir el riesgo.' : 'Es el canal que más resultados comerciales aporta.');
  } else agregar('warning', 'Sin conversiones registradas', 'Define qué cuenta como conversión (venta, mensaje, registro) y mídela en cada canal.');
  conDatos.filter(canal => canal.estados.ctr === 'bad' && canal.estados.interaccion !== 'bad').forEach(canal => agregar('info', `${nombre(canal)}: interés que no llega al clic`, 'La gente interactúa pero no hace clic: añade enlaces, botones de compra o llamados a la acción claros.'));
  conDatos.filter(canal => canal.estados.conversion === 'bad' && n(canal.clics) > 0).forEach(canal => agregar('warning', `${nombre(canal)}: clics que no convierten`, `${canal.conversion.toFixed(1)}% de conversión sobre clics. Revisa la página de destino, el precio o la facilidad de compra.`));
  conDatos.filter(canal => n(canal.frecuencia) > 0 && n(canal.frecuencia) < 2).forEach(canal => agregar('info', `${nombre(canal)}: baja frecuencia`, `${canal.frecuencia} publicación(es) por semana; la constancia mejora el alcance orgánico.`));
  return hallazgos;
}

export const PLANTILLA_CONCLUSION_REDES = [
  'Canal prioritario: ¿en qué red conviene invertir más y por qué?',
  'Problema principal: ¿se pierde audiencia en el alcance, la interacción, el clic o la conversión?',
  'Acciones: contenido, frecuencia y llamados a la acción que implementarías.',
  'Meta medible: ¿qué indicador mejorarás y en cuánto tiempo?'
].join('\n\n');
