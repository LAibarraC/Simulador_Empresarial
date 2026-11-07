/**
 * inventarioCalculations.js — lógica pura de Inventarios y almacenes.
 * Formato compatible: filas { id, sku, producto, almacen, existencia, reservado, minimo, maximo, costo, proveedor }
 * y movimientos { id, fecha, tipo: 'Entrada'|'Salida', producto, sku, almacen, cantidad, productoId? }.
 */
import { crearIdRegistro } from '../../compartido/useRegistrosHerramienta';

export const ID_INVENTARIO = 'inventarios';
export const MAX_MOVIMIENTOS = 50;
export const ESTADOS_STOCK = {
  agotado: { nombre: 'Agotado', tono: 'bad' },
  reponer: { nombre: 'Reponer', tono: 'bad' },
  exceso: { nombre: 'Exceso', tono: 'warn' },
  normal: { nombre: 'Óptimo', tono: 'ok' },
  pendiente: { nombre: 'Incompleto', tono: '' }
};

export const crearProducto = (cambios = {}) => ({ id: crearIdRegistro('sku'), sku: '', producto: '', almacen: '', existencia: '', reservado: '', minimo: '', maximo: '', costo: '', proveedor: '', ...cambios });

const n = valor => { const numero = Number(valor); return Number.isFinite(numero) ? numero : 0; };
const vacio = valor => valor === '' || valor === undefined || valor === null;

export function analizarProducto(fila) {
  const existencia = n(fila.existencia);
  const reservado = Math.max(0, n(fila.reservado));
  const minimo = Math.max(0, n(fila.minimo));
  const maximo = Math.max(0, n(fila.maximo));
  const costo = Math.max(0, n(fila.costo));
  const disponible = existencia - reservado;
  const completo = !vacio(fila.existencia) && !vacio(fila.minimo);
  const errores = [];
  if (reservado > existencia) errores.push('Las reservas superan la existencia.');
  if (maximo > 0 && minimo > maximo) errores.push('El mínimo es mayor que el máximo.');
  let estado = 'pendiente';
  if (completo) estado = disponible <= 0 ? 'agotado' : disponible <= minimo ? 'reponer' : maximo > 0 && disponible > maximo ? 'exceso' : 'normal';
  const objetivo = maximo > 0 ? maximo : minimo * 2;
  const sugerido = ['agotado', 'reponer'].includes(estado) ? Math.max(0, objetivo - disponible) : 0;
  const escala = Math.max(maximo * 1.2, minimo * 1.6, disponible * 1.05, existencia * 1.05, 1);
  return {
    ...fila, existenciaN: existencia, reservadoN: reservado, minimoN: minimo, maximoN: maximo, costoN: costo, disponible, estado, errores, sugerido,
    valor: Math.max(0, existencia) * costo, costoReposicion: sugerido * costo, excedente: estado === 'exceso' ? (disponible - maximo) * costo : 0, escala
  };
}

/** Clasificación ABC por valor (A ≤ 80 % acumulado, B ≤ 95 %, C resto). */
export function clasificarAbc(productos) {
  const total = productos.reduce((t, p) => t + p.valor, 0);
  let acumulado = 0;
  const clases = {};
  [...productos].filter(p => p.valor > 0).sort((a, b) => b.valor - a.valor).forEach(p => {
    const inicio = total ? (acumulado / total) * 100 : 0;
    acumulado += p.valor;
    clases[p.id] = { clase: inicio < 80 ? 'A' : inicio < 95 ? 'B' : 'C', acumulado: total ? (acumulado / total) * 100 : 0, participacion: total ? (p.valor / total) * 100 : 0 };
  });
  return clases;
}

export function calcularTotalesInventario(productos) {
  const contar = estado => productos.filter(p => p.estado === estado).length;
  const almacenes = [...new Set(productos.map(p => p.almacen?.trim()).filter(Boolean))];
  return {
    productos: productos.length,
    valor: productos.reduce((t, p) => t + p.valor, 0),
    agotados: contar('agotado'), reponer: contar('reponer') + contar('agotado'), exceso: contar('exceso'), optimos: contar('normal'),
    reposicion: productos.reduce((t, p) => t + p.costoReposicion, 0),
    excedente: productos.reduce((t, p) => t + p.excedente, 0),
    almacenes
  };
}

/** Valida y aplica un movimiento; devuelve { error } o { fila, movimiento }. */
export function aplicarMovimiento(fila, tipo, cantidadTexto) {
  const cantidad = n(cantidadTexto);
  const p = analizarProducto(fila);
  if (cantidad <= 0) return { error: ['Cantidad requerida', 'Indica una cantidad mayor a cero.'] };
  if (!fila.producto?.trim() && !fila.sku?.trim()) return { error: ['Identifica el producto', 'Completa el SKU o el nombre antes de registrar movimientos.'] };
  if (p.errores.length) return { error: ['Datos inválidos', p.errores.join(' ')] };
  if (tipo === 'Salida' && cantidad > p.disponible) return { error: ['Stock insuficiente', `Solo hay ${p.disponible} unidades disponibles (existencia menos reservas).`] };
  const existencia = p.existenciaN + (tipo === 'Entrada' ? cantidad : -cantidad);
  return {
    fila: { ...fila, existencia: String(existencia) },
    movimiento: { id: crearIdRegistro('mov'), fecha: new Date().toISOString(), tipo, producto: fila.producto || fila.sku || 'Producto', sku: fila.sku || '', almacen: fila.almacen || '', cantidad, productoId: fila.id }
  };
}

export function generarHallazgosInventario(productos, abc, formatoMoneda) {
  const hallazgos = [];
  const agregar = (nivel, titulo, detalle) => hallazgos.push({ id: `h-${hallazgos.length}`, nivel, titulo, detalle });
  if (!productos.length) return hallazgos;
  const nombre = p => p.producto || p.sku || 'Producto';
  const agotados = productos.filter(p => p.estado === 'agotado');
  if (agotados.length) agregar('warning', `${agotados.length} producto(s) agotado(s)`, `${agotados.map(nombre).join(', ')}: riesgo de ventas perdidas.`);
  const reponer = productos.filter(p => p.estado === 'reponer');
  if (reponer.length) agregar('warning', `${reponer.length} producto(s) bajo el mínimo`, `Reposición sugerida: ${formatoMoneda(reponer.reduce((t, p) => t + p.costoReposicion, 0))}.`);
  const exceso = productos.filter(p => p.estado === 'exceso');
  if (exceso.length) agregar('info', `Capital inmovilizado en ${exceso.length} producto(s)`, `${formatoMoneda(exceso.reduce((t, p) => t + p.excedente, 0))} por encima del máximo: evalúa promociones o ajustar compras.`);
  const sinProveedor = productos.filter(p => ['agotado', 'reponer'].includes(p.estado) && !p.proveedor?.trim());
  if (sinProveedor.length) agregar('info', 'Reposición sin proveedor asignado', `${sinProveedor.map(nombre).join(', ')}.`);
  const invalidos = productos.filter(p => p.errores.length);
  if (invalidos.length) agregar('warning', 'Datos inconsistentes', invalidos.map(p => `${nombre(p)}: ${p.errores.join(' ')}`).join(' · '));
  const claseA = productos.filter(p => abc[p.id]?.clase === 'A');
  if (claseA.length && productos.length > 2) agregar('info', `Clase A: ${claseA.length} de ${productos.length} productos`, `Concentran ~80% del valor (${claseA.map(nombre).join(', ')}). Contrólalos con mayor frecuencia.`);
  const incompletos = productos.filter(p => p.estado === 'pendiente');
  if (incompletos.length) agregar('info', 'Productos sin niveles definidos', `${incompletos.length} producto(s) sin existencia o mínimo registrado.`);
  if (!hallazgos.some(h => h.nivel === 'warning')) agregar('ok', 'Inventario bajo control', 'Ningún producto está agotado ni por debajo del mínimo.');
  return hallazgos;
}

export const PLANTILLA_CONCLUSION_INV = [
  'Situación: ¿el inventario está equilibrado o hay quiebres y excesos?',
  'Productos críticos: ¿cuáles requieren reposición inmediata y cuáles inmovilizan capital?',
  'Política propuesta: niveles mínimo/máximo, frecuencia de conteo y proveedores.',
  'Indicador: rotación, días de inventario o nivel de servicio a mejorar.'
].join('\n\n');
