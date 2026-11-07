import { useMemo, useRef, useState } from 'react';
import PieNavegacion from '../../simulacion/PieNavegacion';
import { flushSync } from 'react-dom';
import { FileDown, Loader2, Plus, Route, UserPlus } from 'lucide-react';
import { alerta } from '../../../../utils/Notificaciones';
import ClientesJourney from './ClientesJourney';
import MapaJourney from './MapaJourney';
import EditorEtapa from './EditorEtapa';
import DiagnosticoJourney from './DiagnosticoJourney';
import DocumentosRespaldo from '../../compartido/documentos/DocumentosRespaldo';
import ReportePdfJourney from './ReportePdfJourney';
import IconoEmocion from './IconoEmocion';
import ModalCliente from './ModalCliente';
import ModalNuevaEtapa from './ModalNuevaEtapa';
import ModalConfirmarEliminacion from '../../compartido/modales/ModalConfirmarEliminacion';
import IndicadoresJourney from './IndicadoresJourney';
import useDatosJourney from './useDatosJourney';
import { COLORES_CLIENTE, MAX_ETAPAS, compararClientes, iniciales, obtenerEmocion, priorizarOportunidades } from './calculosJourney';
import { cargarImagenesAnexo, formatearTamano } from '../../compartido/documentos/archivosRespaldo';
import { exportarBloquesPdf, nombreArchivoSeguro } from '../../compartido/pdf/exportarPdfPorBloques';
import './CustomerJourneyMap.css';
import '../../compartido/estilos/EstilosHerramientaTema.css';

// Espera breve para que React pinte el reporte (sin requestAnimationFrame, que se pausa en pestañas en segundo plano).
const esperarPintado = () => new Promise(resolve => setTimeout(resolve, 120));

export default function CustomerJourneyMap({ casoActivo, datos = {}, setDatos }) {
  const reporteRef = useRef(null);
  const [exportando, setExportando] = useState(false);
  const [imagenesPdf, setImagenesPdf] = useState([]);
  const [clienteActivoId, setClienteActivoId] = useState(null);
  const [modalCliente, setModalCliente] = useState(null); // null | 'nuevo' | 'editar'
  const [modalEtapa, setModalEtapa] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null); // { tipo: 'cliente' | 'etapa' | 'documento', id }
  const { journey, cliente, ...acciones } = useDatosJourney(datos, setDatos, clienteActivoId);
  const { clientes, documentos } = journey;

  const comparacion = useMemo(() => compararClientes(clientes), [clientes]);
  const etapas = useMemo(() => cliente?.etapas || [], [cliente]);
  const metricas = comparacion.find(item => item.cliente.id === cliente?.id)?.metricas;
  const oportunidades = useMemo(() => priorizarOportunidades(etapas), [etapas]);
  const indiceEditando = etapas.findIndex(etapa => etapa.id === editandoId);
  const colorLibre = COLORES_CLIENTE.find(color => !clientes.some(item => item.color === color)) || COLORES_CLIENTE[clientes.length % COLORES_CLIENTE.length];

  /* ---------------- Clientes ---------------- */
  const editarClientePorId = id => { setClienteActivoId(id); setModalCliente('editar'); };
  const guardarCliente = valores => {
    if (modalCliente === 'editar' && cliente) {
      acciones.editarCliente(cliente.id, valores);
      alerta.exito('Cliente actualizado', `Se guardó el perfil de ${valores.persona.nombre}.`);
    } else {
      const id = acciones.agregarCliente(valores);
      if (!id) return;
      setClienteActivoId(id);
      alerta.exito('Cliente creado', valores.conPlantilla ? `${valores.persona.nombre} ya tiene las 5 etapas clásicas. Haz clic en cada una para completarla.` : `Añade las etapas del recorrido de ${valores.persona.nombre}.`);
    }
    setModalCliente(null);
  };

  /* ---------------- Eliminaciones (siempre con modal de confirmación) ---------------- */
  const confirmarEliminacion = () => {
    if (!confirmacion) return;
    const { tipo, id } = confirmacion;
    if (tipo === 'cliente') {
      const indice = clientes.findIndex(item => item.id === id);
      const nombre = clientes[indice]?.persona.nombre || 'Cliente';
      acciones.eliminarCliente(id);
      if (id === cliente?.id) setClienteActivoId(clientes[indice + 1]?.id || clientes[indice - 1]?.id || null);
      alerta.exito('Cliente eliminado', `Se eliminó el recorrido de ${nombre}.`);
    } else if (tipo === 'etapa') {
      const indice = etapas.findIndex(etapa => etapa.id === id);
      acciones.eliminarEtapa(id);
      if (editandoId === id) setEditandoId(etapas[indice + 1]?.id || etapas[indice - 1]?.id || null);
    } else {
      acciones.eliminarDocumento(id);
    }
    setConfirmacion(null);
  };
  const datosConfirmacion = (() => {
    if (!confirmacion) return null;
    const { tipo, id } = confirmacion;
    if (tipo === 'cliente') {
      const objetivo = clientes.find(item => item.id === id);
      if (!objetivo) return null;
      const conEmocion = objetivo.etapas.filter(etapa => etapa.emocion).length;
      return {
        titulo: 'Eliminar cliente', textoConfirmar: 'Eliminar cliente',
        detalle: <><span className="cjm-avatar sm" style={{ background: objetivo.color }}>{iniciales(objetivo.persona.nombre)}</span><span><strong>{objetivo.persona.nombre || 'Cliente sin nombre'}</strong><small>{objetivo.persona.perfil || 'Sin perfil'}</small></span></>,
        mensaje: 'Se eliminará este cliente y todo su análisis:',
        perdidas: [`${objetivo.etapas.length} etapa(s) del recorrido`, `${conEmocion} emoción(es) registrada(s)`, objetivo.conclusiones.trim() ? 'Su conclusión escrita' : 'Su lugar en la comparación entre clientes']
      };
    }
    if (tipo === 'etapa') {
      const indice = etapas.findIndex(etapa => etapa.id === id);
      const etapa = etapas[indice];
      if (!etapa) return null;
      const emocion = obtenerEmocion(etapa.emocion);
      const llenos = ['accion', 'contacto', 'pensamiento', 'dolor', 'oportunidad'].filter(campo => etapa[campo]?.trim()).length;
      return {
        titulo: 'Eliminar etapa', textoConfirmar: 'Eliminar etapa',
        detalle: <><IconoEmocion valor={emocion?.valor} size={34}/><span><strong>{indice + 1}. {etapa.nombre || 'Etapa sin nombre'}</strong><small>{emocion ? emocion.nombre : 'Sin emoción asignada'} · recorrido de {cliente?.persona.nombre || 'cliente'}</small></span></>,
        mensaje: 'Las demás etapas se reordenarán automáticamente.',
        perdidas: [`${llenos} campo(s) completado(s) de esta etapa`, etapa.oportunidad?.trim() ? 'Su mejora propuesta del plan' : 'Su punto en la curva emocional']
      };
    }
    const documento = documentos.find(item => item.id === id);
    if (!documento) return null;
    return {
      titulo: 'Eliminar documento', textoConfirmar: 'Eliminar documento',
      detalle: <span><strong>{documento.nombre}</strong><small>{formatearTamano(documento.tamano)}{documento.descripcion ? ` · ${documento.descripcion}` : ''}</small></span>,
      mensaje: 'El archivo se quitará de la documentación de respaldo y del PDF exportado.'
    };
  })();

  /* ---------------- Etapas ---------------- */
  const crearEtapa = nombre => {
    const id = acciones.agregarEtapa(nombre);
    setModalEtapa(false);
    if (id) setEditandoId(id);
  };
  const cargarPlantilla = () => { const id = acciones.cargarPlantilla(); if (id) setEditandoId(id); };
  const accionesEditor = { ...acciones, eliminarEtapa: id => setConfirmacion({ tipo: 'etapa', id }) };
  const accionesDocumentos = { ...acciones, eliminarDocumento: id => setConfirmacion({ tipo: 'documento', id }) };
  const navegarEtapa = direccion => { const destino = etapas[indiceEditando + direccion]; if (destino) setEditandoId(destino.id); };

  /* ---------------- PDF ---------------- */
  const exportarPdf = async () => {
    if (exportando || !reporteRef.current) return;
    setExportando(true);
    try {
      const imagenes = await cargarImagenesAnexo(documentos);
      flushSync(() => setImagenesPdf(imagenes));
      await esperarPintado();
      await exportarBloquesPdf(reporteRef.current, {
        archivo: `Customer_Journey_Map_${nombreArchivoSeguro(casoActivo?.titulo || casoActivo?.nombre)}.pdf`,
        pie: 'Customer Journey Map · Análisis Empresarial', orientacion: 'l'
      });
      alerta.exito('PDF descargado', `Se exportó el recorrido de ${clientes.length} cliente(s)${clientes.length > 1 ? ', la comparación' : ''} y la documentación de respaldo.`);
    } catch (error) {
      console.error('Error al exportar el Customer Journey Map:', error);
      alerta.error('Error al exportar', 'No se pudo generar el documento PDF.');
    } finally { setImagenesPdf([]); setExportando(false); }
  };

  return <div className="cjm-container">
    <div className="cjm-toolbar">
      <div className="cjm-toolbar-badge"><Route size={15}/><span>Customer Journey Map · Experiencia del cliente</span></div>
      <button type="button" className="cjm-btn-pdf" onClick={exportarPdf} disabled={exportando || !clientes.length}>
        {exportando ? <Loader2 size={14} className="cjm-spin"/> : <FileDown size={14}/>}<span>{exportando ? 'Exportando PDF…' : 'Exportar a PDF'}</span>
      </button>
    </div>

    {!clientes.length ? <section className="cjm-card">
      <div className="cjm-empty hero">
        <span className="cjm-empty-faces" aria-hidden="true">{[1, 3, 5].map(valor => <IconoEmocion key={valor} valor={valor} size={44}/>)}</span>
        <strong>Empieza creando a tu primer cliente</strong>
        <span>El mapa muestra cómo vive un cliente su experiencia con la empresa, etapa por etapa. Puedes crear varios clientes o segmentos y compararlos.</span>
        <div><button type="button" className="cjm-btn-add" onClick={() => setModalCliente('nuevo')}><UserPlus size={14}/> Crear cliente</button></div>
      </div>
    </section> : <>
      <ClientesJourney comparacion={comparacion} activoId={cliente?.id} onSeleccionar={setClienteActivoId} onNuevo={() => setModalCliente('nuevo')}
        onEditar={editarClientePorId} onEliminar={id => setConfirmacion({ tipo: 'cliente', id })}/>

      {cliente && <>
        <IndicadoresJourney metricas={metricas} etapas={etapas} color={cliente.color}/>

        <section className="cjm-card cjm-map-card" aria-label="Mapa del recorrido" style={{ '--cjm-client': cliente.color }}>
          <div className="cjm-card-head">
            <div>
              <h3 className="cjm-card-title">Mapa del recorrido · <span style={{ color: cliente.color }}>{cliente.persona.nombre || 'Cliente'}</span></h3>
              <p className="cjm-statement">Haz clic en cualquier etapa, celda o carita para abrir su ficha. Lee el mapa de izquierda a derecha: así vive el cliente su experiencia.</p>
            </div>
            {etapas.length > 0 && <button type="button" className="cjm-btn-add" onClick={() => setModalEtapa(true)} disabled={etapas.length >= MAX_ETAPAS}><Plus size={14}/> Añadir etapa</button>}
          </div>
          {etapas.length ? <MapaJourney etapas={etapas} color={cliente.color} seleccionada={editandoId} onSeleccionar={setEditandoId}/>
            : <div className="cjm-empty">
              <Route size={26}/>
              <strong>Aún no hay etapas en el recorrido</strong>
              <span>Empieza con las 5 etapas clásicas (descubrimiento, consideración, compra, uso y fidelización) o crea las tuyas.</span>
              <div><button type="button" className="cjm-btn-add" onClick={cargarPlantilla}>Usar etapas clásicas</button><button type="button" className="cjm-btn-outline" onClick={() => setModalEtapa(true)}><Plus size={14}/> Etapa en blanco</button></div>
            </div>}
        </section>

        {etapas.length > 0 && <DiagnosticoJourney oportunidades={oportunidades} conclusiones={cliente.conclusiones} nombreCliente={cliente.persona.nombre}
          onConclusiones={acciones.editarConclusiones} onSeleccionar={setEditandoId}/>}
      </>}

    </>}

    <DocumentosRespaldo documentos={documentos} acciones={accionesDocumentos}/>

    <PieNavegacion/>

    <ModalCliente abierto={Boolean(modalCliente)} cliente={modalCliente === 'editar' ? cliente : null} colorSugerido={colorLibre} onGuardar={guardarCliente} onCerrar={() => setModalCliente(null)}/>
    <ModalNuevaEtapa abierto={modalEtapa} etapas={etapas} color={cliente?.color} onCrear={crearEtapa} onCerrar={() => setModalEtapa(false)}/>
    {indiceEditando >= 0 && <EditorEtapa etapa={etapas[indiceEditando]} indice={indiceEditando} total={etapas.length} color={cliente.color} cliente={cliente.persona.nombre}
      acciones={accionesEditor} onNavegar={navegarEtapa} onCerrar={() => setEditandoId(null)}/>}

    <ModalConfirmarEliminacion abierto={Boolean(datosConfirmacion)} {...(datosConfirmacion || {})} onConfirmar={confirmarEliminacion} onCerrar={() => setConfirmacion(null)}/>

    {clientes.length > 0 && <ReportePdfJourney ref={reporteRef} caso={casoActivo} journey={journey} comparacion={comparacion} imagenes={imagenesPdf}/>}
  </div>;
}
