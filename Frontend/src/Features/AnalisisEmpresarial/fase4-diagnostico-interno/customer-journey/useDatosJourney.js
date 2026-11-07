import { useCallback, useMemo } from 'react';
import { alerta } from '../../../../utils/Notificaciones';
import { ETAPAS_PLANTILLA, ID_CJM, MAX_CLIENTES, MAX_ETAPAS, crearCliente, crearEtapa, normalizarJourney } from './calculosJourney';
import { borrarDocumento, guardarDocumentos } from '../../compartido/documentos/archivosRespaldo';

/**
 * Lectura y escritura del Customer Journey Map (varios clientes) con actualizaciones funcionales.
 * Las acciones de etapas y conclusión se aplican al cliente `clienteActivoId` (o al primero).
 */
export default function useDatosJourney(datos, setDatos, clienteActivoId) {
  const journey = useMemo(() => normalizarJourney(datos?.[ID_CJM]), [datos]);
  const cliente = journey.clientes.find(item => item.id === clienteActivoId) || journey.clientes[0] || null;
  const clienteId = cliente?.id;

  const actualizar = useCallback(transformar => setDatos(actuales => ({
    ...actuales, [ID_CJM]: transformar(normalizarJourney(actuales?.[ID_CJM]))
  })), [setDatos]);

  const actualizarCliente = useCallback((id, transformar) => actualizar(j => ({
    ...j, clientes: j.clientes.map(item => (item.id === id ? transformar(item) : item))
  })), [actualizar]);

  /* ---------------- Clientes ---------------- */

  /** Crea un cliente y devuelve su id (o null si se alcanzó el máximo). */
  const agregarCliente = useCallback(({ persona, color, conPlantilla }) => {
    if (journey.clientes.length >= MAX_CLIENTES) { alerta.advertencia('Máximo de clientes', `Puedes comparar hasta ${MAX_CLIENTES} clientes o segmentos.`); return null; }
    const nuevo = crearCliente(journey.clientes.length, persona);
    if (color) nuevo.color = color;
    if (conPlantilla) nuevo.etapas = ETAPAS_PLANTILLA.map(nombre => crearEtapa(nombre));
    actualizar(j => ({ ...j, clientes: [...j.clientes, nuevo] }));
    return nuevo.id;
  }, [journey.clientes.length, actualizar]);

  const editarCliente = useCallback((id, { persona, color }) => actualizarCliente(id, item => ({
    ...item, color: color || item.color, persona: { ...item.persona, ...persona }
  })), [actualizarCliente]);

  /** Elimina sin preguntar: la confirmación la muestra la pantalla con su propio modal. */
  const eliminarCliente = useCallback(id => actualizar(j => ({ ...j, clientes: j.clientes.filter(item => item.id !== id) })), [actualizar]);

  /* ---------------- Etapas del cliente activo ---------------- */

  const editarEtapa = useCallback((etapaId, campo, valor) => actualizarCliente(clienteId, item => ({
    ...item, etapas: item.etapas.map(etapa => (etapa.id === etapaId ? { ...etapa, [campo]: valor } : etapa))
  })), [clienteId, actualizarCliente]);

  /** Crea una etapa al final y devuelve su id (o null si se alcanzó el máximo). */
  const agregarEtapa = useCallback((nombre = '') => {
    if (!cliente) return null;
    if (cliente.etapas.length >= MAX_ETAPAS) { alerta.advertencia('Máximo de etapas', `Un journey legible tiene hasta ${MAX_ETAPAS} etapas.`); return null; }
    const etapa = crearEtapa(nombre.trim() || `Etapa ${cliente.etapas.length + 1}`);
    actualizarCliente(cliente.id, item => ({ ...item, etapas: [...item.etapas, etapa] }));
    return etapa.id;
  }, [cliente, actualizarCliente]);

  const moverEtapa = useCallback((etapaId, direccion) => actualizarCliente(clienteId, item => {
    const etapas = [...item.etapas];
    const desde = etapas.findIndex(etapa => etapa.id === etapaId);
    const hasta = desde + direccion;
    if (desde < 0 || hasta < 0 || hasta >= etapas.length) return item;
    [etapas[desde], etapas[hasta]] = [etapas[hasta], etapas[desde]];
    return { ...item, etapas };
  }), [clienteId, actualizarCliente]);

  const eliminarEtapa = useCallback(etapaId => actualizarCliente(clienteId, item => ({ ...item, etapas: item.etapas.filter(e => e.id !== etapaId) })), [clienteId, actualizarCliente]);

  /** Carga las 5 etapas clásicas en el cliente activo vacío; devuelve el id de la primera. */
  const cargarPlantilla = useCallback(() => {
    if (!cliente || cliente.etapas.length) return null;
    const etapas = ETAPAS_PLANTILLA.map(nombre => crearEtapa(nombre));
    actualizarCliente(cliente.id, item => ({ ...item, etapas }));
    alerta.exito('Plantilla cargada', 'Se añadieron las 5 etapas clásicas del recorrido del cliente.');
    return etapas[0].id;
  }, [cliente, actualizarCliente]);

  /* ---------------- Conclusiones ---------------- */

  const editarConclusiones = useCallback(valor => actualizarCliente(clienteId, item => ({ ...item, conclusiones: valor })), [clienteId, actualizarCliente]);
  const editarConclusionesGenerales = useCallback(valor => actualizar(j => ({ ...j, conclusionesGenerales: valor })), [actualizar]);

  /* ---------------- Documentación de respaldo ---------------- */

  const agregarDocumentos = useCallback(async archivos => {
    const { nuevos, avisos } = await guardarDocumentos(archivos, journey.documentos.length);
    avisos.forEach(([titulo, mensaje]) => alerta.advertencia(titulo, mensaje));
    if (!nuevos.length) return;
    actualizar(j => ({ ...j, documentos: [...j.documentos, ...nuevos] }));
    alerta.exito('Documentos adjuntados', `${nuevos.length} archivo(s) guardado(s) como respaldo.`);
  }, [journey.documentos.length, actualizar]);

  const eliminarDocumento = useCallback(id => {
    actualizar(j => ({ ...j, documentos: j.documentos.filter(item => item.id !== id) }));
    borrarDocumento(id);
  }, [actualizar]);

  const describirDocumento = useCallback((id, descripcion) => actualizar(j => ({
    ...j, documentos: j.documentos.map(item => (item.id === id ? { ...item, descripcion } : item))
  })), [actualizar]);

  return {
    journey, cliente,
    agregarCliente, editarCliente, eliminarCliente,
    editarEtapa, agregarEtapa, moverEtapa, eliminarEtapa, cargarPlantilla,
    editarConclusiones, editarConclusionesGenerales,
    agregarDocumentos, eliminarDocumento, describirDocumento
  };
}
