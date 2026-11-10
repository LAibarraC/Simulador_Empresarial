import { useCallback, useMemo } from 'react';
import { alerta } from '../../../../utils/Notificaciones';
import { CUENTAS_BASE, DOCUMENTOS_MAX, DOCUMENTOS_MAX_BYTES, ID_HERRAMIENTA, crearId, formatearTamano, normalizarContenido } from './calculosFinancieros';
import { eliminarArchivo, guardarArchivo } from '../../compartido/documentos/almacenArchivos';

/**
 * Encapsula la lectura y escritura de los datos del análisis vertical y horizontal.
 * Todas las escrituras usan actualizaciones funcionales para no depender de estado obsoleto.
 */
export default function useDatosFinancieros(datos, setDatos) {
  const contenido = useMemo(() => normalizarContenido(datos?.[ID_HERRAMIENTA]), [datos]);
  const { filas } = contenido;

  const guardar = useCallback(cambios => setDatos(actuales => {
    const previo = actuales?.[ID_HERRAMIENTA];
    const base = previo && !Array.isArray(previo) ? previo : {};
    return { ...actuales, [ID_HERRAMIENTA]: { ...base, ...cambios } };
  }), [setDatos]);

  const actualizarFilas = useCallback(transformar => setDatos(actuales => {
    const previo = actuales?.[ID_HERRAMIENTA];
    const base = previo && !Array.isArray(previo) ? previo : {};
    return { ...actuales, [ID_HERRAMIENTA]: { ...base, filas: transformar(normalizarContenido(previo).filas) } };
  }), [setDatos]);

  const editarFila = useCallback((id, campo, valor) =>
    actualizarFilas(lista => lista.map(fila => (fila.id === id ? { ...fila, [campo]: valor } : fila))), [actualizarFilas]);

  const eliminarCuenta = useCallback(id => actualizarFilas(lista => lista.filter(fila => fila.id !== id)), [actualizarFilas]);

  const agregarCuenta = useCallback((estado, categoria) =>
    actualizarFilas(lista => [...lista, { id: crearId(), estado, categoria, cuenta: '', anterior: '', actual: '' }]), [actualizarFilas]);

  const cargarEstructura = useCallback(estado => {
    const existentes = new Set(filas.filter(fila => fila.estado === estado).map(fila => `${fila.categoria}:${(fila.cuenta || '').trim().toLocaleLowerCase()}`));
    const nuevas = (CUENTAS_BASE[estado] || [])
      .filter(([categoria, cuenta]) => !existentes.has(`${categoria}:${cuenta.toLocaleLowerCase()}`))
      .map(([categoria, cuenta]) => ({ id: crearId(), estado, categoria, cuenta, anterior: '', actual: '' }));
    if (!nuevas.length) {
      alerta.info('Estructura completa', 'Las cuentas base ya están incluidas. Tus saldos se conservaron.');
      return;
    }
    actualizarFilas(lista => [...lista, ...nuevas]);
    alerta.exito('Estructura añadida', `Se añadieron ${nuevas.length} cuentas base sin modificar los datos existentes.`);
  }, [filas, actualizarFilas]);

  const importarCuentas = useCallback((estado, categoria, items) => {
    if (!items.length) return;
    actualizarFilas(lista => [...lista, ...items.map(item => ({ id: crearId(), estado, categoria, cuenta: item.cuenta, anterior: item.anterior, actual: item.actual }))]);
    alerta.exito('Cuentas importadas', `Se añadieron ${items.length} cuentas a la clasificación elegida.`);
  }, [actualizarFilas]);

  const actualizarDocumentos = useCallback(transformar => setDatos(actuales => {
    const previo = actuales?.[ID_HERRAMIENTA];
    const base = previo && !Array.isArray(previo) ? previo : {};
    return { ...actuales, [ID_HERRAMIENTA]: { ...base, documentos: transformar(normalizarContenido(previo).documentos) } };
  }), [setDatos]);

  const agregarDocumentos = useCallback(async archivos => {
    const disponibles = DOCUMENTOS_MAX - contenido.documentos.length;
    const lista = Array.from(archivos || []);
    if (!lista.length) return;
    if (disponibles <= 0) { alerta.advertencia('Límite alcanzado', `Puedes adjuntar hasta ${DOCUMENTOS_MAX} documentos.`); return; }
    const grandes = lista.filter(archivo => archivo.size > DOCUMENTOS_MAX_BYTES);
    const validos = lista.filter(archivo => archivo.size <= DOCUMENTOS_MAX_BYTES && archivo.size > 0).slice(0, disponibles);
    if (grandes.length) alerta.advertencia('Archivo demasiado grande', `${grandes.map(archivo => archivo.name).join(', ')} supera ${formatearTamano(DOCUMENTOS_MAX_BYTES)}.`);
    const nuevos = [];
    for (const archivo of validos) {
      const id = crearId();
      try {
        await guardarArchivo(id, archivo);
        nuevos.push({ id, nombre: archivo.name, mime: archivo.type, tamano: archivo.size, fecha: new Date().toISOString(), descripcion: '' });
      } catch (error) {
        console.error('No se pudo guardar el documento:', error);
        alerta.error('No se pudo guardar', `${archivo.name}: ${error.message || 'error de almacenamiento local'}.`);
      }
    }
    if (!nuevos.length) return;
    actualizarDocumentos(lista => [...lista, ...nuevos]);
    alerta.exito('Documentación adjuntada', `${nuevos.length} ${nuevos.length === 1 ? 'archivo añadido' : 'archivos añadidos'} al análisis.`);
  }, [contenido.documentos.length, actualizarDocumentos]);

  const eliminarDocumento = useCallback(async id => {
    actualizarDocumentos(lista => lista.filter(documento => documento.id !== id));
    try { await eliminarArchivo(id); } catch (error) { console.error('No se pudo borrar el archivo local:', error); }
  }, [actualizarDocumentos]);

  const describirDocumento = useCallback((id, descripcion) =>
    actualizarDocumentos(lista => lista.map(documento => (documento.id === id ? { ...documento, descripcion } : documento))), [actualizarDocumentos]);

  return {
    contenido, filas, guardar, editarFila, eliminarCuenta, agregarCuenta, cargarEstructura, importarCuentas,
    agregarDocumentos, eliminarDocumento, describirDocumento
  };
}
