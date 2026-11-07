import { useCallback, useMemo, useRef, useState } from 'react';
import { alerta } from '../../../utils/Notificaciones';
import { exportarBloquesPdf, nombreArchivoSeguro } from './pdf/exportarPdfPorBloques';

export const crearIdRegistro = (prefijo = 'reg') => `${prefijo}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/** Lee el formato guardado { filas, movimientos, ...extras } (o un arreglo antiguo). */
export function leerContenido(guardado) {
  if (Array.isArray(guardado)) return { filas: guardado, movimientos: [] };
  return { ...(guardado || {}), filas: Array.isArray(guardado?.filas) ? guardado.filas : [], movimientos: Array.isArray(guardado?.movimientos) ? guardado.movimientos : [] };
}

/**
 * Datos de una herramienta basada en registros (filas). Mantiene compatible el formato
 * { filas, movimientos } y permite campos extra (p. ej. conclusiones) en el mismo objeto.
 */
export function useRegistros(datos, setDatos, id) {
  const contenido = useMemo(() => leerContenido(datos?.[id]), [datos, id]);

  const actualizar = useCallback(transformar => setDatos(actuales => ({ ...actuales, [id]: transformar(leerContenido(actuales?.[id])) })), [setDatos, id]);
  const actualizarFilas = useCallback(transformar => actualizar(c => ({ ...c, filas: transformar(c.filas) })), [actualizar]);
  const editarFila = useCallback((filaId, campo, valor) => actualizarFilas(filas => filas.map(fila => (fila.id === filaId ? { ...fila, [campo]: valor } : fila))), [actualizarFilas]);
  const editarCampos = useCallback((filaId, cambios) => actualizarFilas(filas => filas.map(fila => (fila.id === filaId ? { ...fila, ...cambios } : fila))), [actualizarFilas]);
  const guardarExtra = useCallback((campo, valor) => actualizar(c => ({ ...c, [campo]: valor })), [actualizar]);

  const eliminarConConfirmacion = useCallback(async (filaId, nombre, transformarRestantes = filas => filas) => {
    const confirmado = await alerta.confirmar({ titulo: 'Eliminar registro', mensaje: `Se eliminará «${nombre || 'registro'}».`, textoConfirmar: 'Eliminar', variant: 'danger' });
    if (!confirmado) return false;
    actualizarFilas(filas => transformarRestantes(filas.filter(fila => fila.id !== filaId)));
    return true;
  }, [actualizarFilas]);

  return { contenido, filas: contenido.filas, actualizar, actualizarFilas, editarFila, editarCampos, guardarExtra, eliminarConConfirmacion };
}

/** Exportación PDF por bloques con estado de carga y notificaciones. */
export function useExportarPdf({ nombreBase, caso, pie, orientacion = 'l', mensaje }) {
  const ref = useRef(null);
  const [exportando, setExportando] = useState(false);
  const exportar = useCallback(async () => {
    if (exportando || !ref.current) return;
    setExportando(true);
    try {
      await exportarBloquesPdf(ref.current, { archivo: `${nombreBase}_${nombreArchivoSeguro(caso?.titulo || caso?.nombre)}.pdf`, pie, orientacion });
      alerta.exito('PDF descargado', mensaje || 'El reporte se exportó correctamente.');
    } catch (error) {
      console.error(`Error al exportar ${nombreBase}:`, error);
      alerta.error('Error al exportar', 'No se pudo generar el documento PDF.');
    } finally { setExportando(false); }
  }, [exportando, nombreBase, caso, pie, orientacion, mensaje]);
  return { ref, exportando, exportar };
}
