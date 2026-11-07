import React, { useCallback, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import { AlertTriangle, Clock, GitFork, Hand, Plus, Redo2, Undo2, Users, Workflow } from 'lucide-react';
import { alerta } from '../../../../utils/Notificaciones';
import { EstadoVacio, PieHerramienta, IndicadoresClave, NotasConPlantilla, EncabezadoPdf, BarraHerramienta } from '../../compartido/ComponentesHerramienta';
import { useRegistros } from '../../compartido/useRegistrosHerramienta';
import { useAccionesDocumentos } from '../../compartido/documentos/useDocumentosRespaldo';
import useHistorialFlujo from './useHistorialFlujo';
import DiagramaCarriles from './DiagramaCarriles';
import ModalEditarPaso from './ModalEditarPaso';
import ModalNuevoPaso from './ModalNuevoPaso';
import DocumentosRespaldo from '../../compartido/documentos/DocumentosRespaldo';
import ModalConfirmarEliminacion from '../../compartido/modales/ModalConfirmarEliminacion';
import {
  ID_FLUJO, PLANTILLA_CONCLUSION_FLUJO, SIN_RESPONSABLE, agregarPasoDespues, calcularMetricasFlujo, conectarPasos, crearPaso, ajustarRuta, duplicarPaso, eliminarPaso,
  formatearTiempo, insertarEnConexion, moverPaso, normalizarPasos, obtenerCarriles, plantillaFlujo, quitarConexion, renumerar
} from './calculosFlujo';
import { cargarImagenesAnexo, formatearTamano } from '../../compartido/documentos/archivosRespaldo';
import { exportarBloquesPdf, nombreArchivoSeguro } from '../../compartido/pdf/exportarPdfPorBloques';
import '../../compartido/estilos/EstilosHerramientaBase.css';
import '../customer-journey/CustomerJourneyMap.css';
import './Flujogramas.css';
import '../../compartido/estilos/EstilosHerramientaTema.css';

// Espera breve para que React pinte el reporte (sin requestAnimationFrame, que se pausa en pestañas en segundo plano).
const esperarPintado = () => new Promise(resolve => setTimeout(resolve, 120));
const esCampoDeTexto = elemento => ['INPUT', 'TEXTAREA', 'SELECT'].includes(elemento?.tagName) || elemento?.isContentEditable;

export default function Flujogramas({ casoActivo, datos = {}, setDatos }) {
  const { contenido, actualizar, editarFila, guardarExtra } = useRegistros(datos, setDatos, ID_FLUJO);
  const pasos = useMemo(() => normalizarPasos(contenido.filas), [contenido.filas]);
  const documentos = useMemo(() => (Array.isArray(contenido.documentos) ? contenido.documentos : []), [contenido.documentos]);
  const [seleccion, setSeleccion] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [modalNuevo, setModalNuevo] = useState(null); // null | { despuesDe }
  const [confirmacion, setConfirmacion] = useState(null); // { id }
  const [exportando, setExportando] = useState(false);
  const [imagenesPdf, setImagenesPdf] = useState([]);
  const reporteRef = React.useRef(null);

  const metricas = useMemo(() => calcularMetricasFlujo(pasos), [pasos]);
  const responsables = useMemo(() => obtenerCarriles(pasos).filter(nombre => nombre !== SIN_RESPONSABLE), [pasos]);
  const pasoSeleccionado = pasos.find(paso => paso.id === seleccion) || null;
  const pasoEditando = pasos.find(paso => paso.id === editandoId) || null;
  const evidencias = useMemo(() => documentos.reduce((total, documento) => (documento.pasoId ? { ...total, [documento.pasoId]: (total[documento.pasoId] || 0) + 1 } : total), {}), [documentos]);

  const restaurar = useCallback(filas => actualizar(c => ({ ...c, filas })), [actualizar]);
  const historial = useHistorialFlujo(contenido.filas, restaurar);

  const conPasos = transformar => actualizar(c => ({ ...c, filas: renumerar(transformar(normalizarPasos(c.filas))) }));
  const guardarPasos = nuevos => actualizar(c => ({ ...c, filas: renumerar(nuevos) }));

  /* ---------------- Acciones del diagrama ---------------- */
  const acciones = {
    editarFila,
    seleccionar: setSeleccion,
    editar: id => { setSeleccion(id); setEditandoId(id); },
    agregarDebajo: id => setModalNuevo({ despuesDe: id }),
    duplicar: id => { const { pasos: lista, nuevoId } = duplicarPaso(pasos, id); guardarPasos(lista); setSeleccion(nuevoId); },
    eliminar: id => setConfirmacion({ id }),
    mover: (id, destino) => conPasos(lista => moverPaso(lista, id, destino)),
    conectar: (desde, hasta, tipo) => conPasos(lista => conectarPasos(lista, desde, hasta, tipo)),
    quitarConexion: (desde, tipo) => conPasos(lista => quitarConexion(lista, desde, tipo)),
    ajustarRuta: (desde, tipo, ruta) => conPasos(lista => ajustarRuta(lista, desde, tipo, ruta)),
    insertarEnConexion: (desde, hasta, tipo) => {
      const { pasos: lista, nuevoId } = insertarEnConexion(pasos, desde, hasta, tipo);
      guardarPasos(lista);
      if (nuevoId) { setSeleccion(nuevoId); setEditandoId(nuevoId); }
    },
    adjuntarAPaso: (id, archivos) => accionesDocs.agregarDocumentos(archivos, { pasoId: id }),
    desvincularDocumento: id => accionesDocs.editarDocumento(id, { pasoId: '' })
  };
  const crearDesdeModal = ({ despuesDe, ...cambios }) => {
    const { pasos: lista, nuevoId } = agregarPasoDespues(pasos, despuesDe, cambios);
    guardarPasos(lista);
    setModalNuevo(null);
    setSeleccion(nuevoId);
  };
  const confirmarEliminacion = () => {
    const { id } = confirmacion;
    const indice = pasos.findIndex(paso => paso.id === id);
    conPasos(lista => eliminarPaso(lista, id));
    setSeleccion(pasos[indice + 1]?.id || pasos[indice - 1]?.id || null);
    if (editandoId === id) setEditandoId(pasos[indice + 1]?.id || pasos[indice - 1]?.id || null);
    setConfirmacion(null);
  };
  const navegarPaso = direccion => { const destino = pasos[pasos.findIndex(paso => paso.id === editandoId) + direccion]; if (destino) { setEditandoId(destino.id); setSeleccion(destino.id); } };

  const cargarPlantilla = () => { const nuevos = plantillaFlujo(); actualizar(c => ({ ...c, filas: nuevos })); setSeleccion(nuevos[0].id); };
  const empezarVacio = () => { const inicio = crearPaso({ tipo: 'Inicio / fin', actividad: 'Inicio del proceso', orden: 1 }); actualizar(c => ({ ...c, filas: [inicio] })); setSeleccion(inicio.id); };

  /* ---------------- Evidencia ---------------- */
  const setDocumentos = useCallback(transformar => actualizar(c => ({ ...c, documentos: transformar(Array.isArray(c.documentos) ? c.documentos : []) })), [actualizar]);
  const accionesDocs = useAccionesDocumentos(documentos, setDocumentos);
  const accionesEvidencia = {
    ...accionesDocs,
    eliminarDocumento: id => accionesDocs.eliminarDocumento(id)
  };
  const nombrePaso = id => { const paso = pasos.find(item => item.id === id); return paso ? `Paso ${paso.orden}${paso.actividad ? ` · ${paso.actividad}` : ''}` : 'General'; };

  /* ---------------- Teclado: Supr elimina, Ctrl+Z / Ctrl+Y deshacen y rehacen ---------------- */
  const alPulsarTecla = evento => {
    if (esCampoDeTexto(evento.target) || editandoId || modalNuevo || confirmacion) return;
    const control = evento.ctrlKey || evento.metaKey;
    if (control && evento.key.toLowerCase() === 'z') { evento.preventDefault(); if (evento.shiftKey) historial.rehacer(); else historial.deshacer(); }
    else if (control && evento.key.toLowerCase() === 'y') { evento.preventDefault(); historial.rehacer(); }
    else if (evento.key === 'Delete' && pasoSeleccionado) { evento.preventDefault(); setConfirmacion({ id: pasoSeleccionado.id }); }
    else if (evento.key === 'Escape') setSeleccion(null);
  };

  /* ---------------- PDF ---------------- */
  const exportarPdf = async () => {
    if (exportando || !reporteRef.current) return;
    setExportando(true);
    try {
      const imagenes = await cargarImagenesAnexo(documentos);
      flushSync(() => setImagenesPdf(imagenes));
      await esperarPintado();
      await exportarBloquesPdf(reporteRef.current, { archivo: `Flujograma_${nombreArchivoSeguro(casoActivo?.titulo || casoActivo?.nombre)}.pdf`, pie: 'Flujograma de proceso · Análisis Empresarial', orientacion: 'p' });
      alerta.exito('PDF descargado', 'Se exportó el diagrama, el detalle de pasos, el diagnóstico y la evidencia adjunta.');
    } catch (error) {
      console.error('Error al exportar el flujograma:', error);
      alerta.error('Error al exportar', 'No se pudo generar el documento PDF.');
    } finally { setImagenesPdf([]); setExportando(false); }
  };

  const kpis = [
    { icono: Workflow, label: 'Pasos', valor: metricas.pasos },
    { icono: GitFork, label: 'Decisiones', valor: metricas.decisiones },
    { icono: Users, label: 'Responsables', valor: metricas.responsables },
    { icono: Clock, label: 'Tiempo del ciclo', valor: metricas.tiempo ? formatearTiempo(metricas.tiempo) : '—', detalle: 'Suma de tiempos estimados' },
    { icono: AlertTriangle, label: 'Puntos críticos', valor: metricas.criticos, tono: metricas.criticos ? 'bad' : '' }
  ];
  const datosConfirmacion = confirmacion && pasos.find(paso => paso.id === confirmacion.id);

  return <div className="hf-container fl-tool" onKeyDown={alPulsarTecla}>
    <BarraHerramienta icono={Workflow} titulo="Flujograma de procesos · Diagrama de carriles" exportando={exportando} onExportar={exportarPdf}/>
    <IndicadoresClave items={kpis}/>

    <section className="hf-card" aria-label="Diagrama del proceso">
      <div className="hf-card-head">
        <div>
          <input className="hf-title-input" value={contenido.proceso || ''} onChange={e => guardarExtra('proceso', e.target.value)} placeholder="Nombre del proceso (Ej.: Atención de pedidos)" aria-label="Nombre del proceso" maxLength={80}/>
          <p className="hf-statement"><Hand size={12}/> <b>Arrastra</b> un paso para cambiarlo de carril o de fila · arrastra su <b>punto</b> hasta otro paso para conectarlos · haz clic en una <b>flecha</b> para acomodarla donde quieras; con un clic puedes insertar un paso o quitarla · doble clic para editar.</p>
        </div>
        {pasos.length > 0 && <div className="hf-card-actions">
          <button type="button" className="hf-btn-icon" onClick={historial.deshacer} disabled={!historial.puedeDeshacer} title="Deshacer (Ctrl+Z)" aria-label="Deshacer"><Undo2 size={15}/></button>
          <button type="button" className="hf-btn-icon" onClick={historial.rehacer} disabled={!historial.puedeRehacer} title="Rehacer (Ctrl+Y)" aria-label="Rehacer"><Redo2 size={15}/></button>
          <div className="fl-legend"><span><i className="terminal"/>Inicio / fin</span><span><i className="proceso"/>Actividad</span><span><i className="decision"/>Decisión</span></div>
          <button type="button" className="hf-btn-add" onClick={() => setModalNuevo({ despuesDe: seleccion || pasos[pasos.length - 1].id })}><Plus size={14}/> Añadir paso</button>
        </div>}
      </div>
      {pasos.length ? <div className="fl-scroll"><DiagramaCarriles pasos={pasos} seleccionado={pasoSeleccionado?.id} evidencias={evidencias} acciones={acciones}/></div>
        : <EstadoVacio icono={Workflow} titulo="Aún no hay pasos en el proceso" texto="Carga un ejemplo con decisión y reproceso para ver cómo funciona, o empieza desde el inicio.">
          <button type="button" className="hf-btn-add" onClick={cargarPlantilla}>Usar ejemplo</button>
          <button type="button" className="hf-btn-outline" onClick={empezarVacio}><Plus size={14}/> Empezar en blanco</button>
        </EstadoVacio>}
    </section>

    {pasos.length > 0 && <section className="hf-card" aria-label="Diagnóstico del proceso">
      <NotasConPlantilla id="fl-conclusiones" titulo="Conclusión y propuesta de mejora" valor={contenido.conclusiones || ''} onCambio={valor => guardarExtra('conclusiones', valor)} plantilla={PLANTILLA_CONCLUSION_FLUJO} placeholder="¿Dónde se pierde tiempo y qué cambiarías en el proceso?"/>
    </section>}

    <DocumentosRespaldo documentos={documentos} acciones={accionesEvidencia} titulo="Evidencia del proceso"
      ayuda="Adjunta formularios, capturas, fotos, manuales o registros que respalden el flujo. Puedes relacionar cada archivo con un paso."
      renderExtra={documento => <select className="fl-doc-step" value={documento.pasoId || ''} onChange={e => accionesDocs.editarDocumento(documento.id, { pasoId: e.target.value })} aria-label={`Paso relacionado con ${documento.nombre}`}>
        <option value="">Evidencia general</option>{pasos.map(paso => <option key={paso.id} value={paso.id}>Paso {paso.orden}: {paso.actividad || 'Sin nombre'}</option>)}
      </select>}/>

    <PieHerramienta/>

    <ModalNuevoPaso abierto={Boolean(modalNuevo)} pasos={pasos} responsables={responsables} despuesDe={modalNuevo?.despuesDe} onCrear={crearDesdeModal} onCerrar={() => setModalNuevo(null)}/>
    {pasoEditando && <ModalEditarPaso paso={pasoEditando} pasos={pasos} responsables={responsables} documentos={documentos} acciones={acciones} onNavegar={navegarPaso} onCerrar={() => setEditandoId(null)}/>}
    <ModalConfirmarEliminacion abierto={Boolean(datosConfirmacion)} titulo="Eliminar paso" textoConfirmar="Eliminar paso" onConfirmar={confirmarEliminacion} onCerrar={() => setConfirmacion(null)}
      detalle={datosConfirmacion && <span><strong>Paso {datosConfirmacion.orden}{datosConfirmacion.actividad ? ` · ${datosConfirmacion.actividad}` : ''}</strong><small>{datosConfirmacion.tipo}{datosConfirmacion.responsable ? ` · ${datosConfirmacion.responsable}` : ''}</small></span>}
      mensaje="Los pasos que llegaban a este paso se conectarán con el que le sigue, para no romper el flujo."
      perdidas={datosConfirmacion ? [datosConfirmacion.salida?.trim() ? 'Su descripción y resultado' : 'Su lugar en el diagrama', ...(evidencias[datosConfirmacion.id] ? [`${evidencias[datosConfirmacion.id]} evidencia(s) quedarán como evidencia general`] : [])] : []}/>

    <div ref={reporteRef} className="hf-report vertical fl-report" aria-hidden="true">
      <div data-pdf-block>
        <EncabezadoPdf sigla="FL" titulo="Flujograma de procesos" subtitulo={contenido.proceso || 'Proceso sin nombre'} etiqueta="DIAGRAMA DE CARRILES" caso={casoActivo} meta={[['Responsables', responsables.join(', ') || '—']]}/>
        <IndicadoresClave items={kpis}/>
      </div>
      {pasos.length > 0 && <div data-pdf-block><h2>Diagrama del proceso</h2><DiagramaCarriles pasos={pasos} evidencias={evidencias}/></div>}
      {pasos.length > 0 && <div data-pdf-block>
        <h2>Detalle de pasos</h2>
        <table className="hf-pdf-table"><colgroup><col style={{ width: '6%' }}/><col style={{ width: '12%' }}/><col style={{ width: '24%' }}/><col style={{ width: '15%' }}/><col style={{ width: '8%' }}/><col/></colgroup>
          <thead><tr><th>#</th><th>Tipo</th><th>Paso</th><th>Responsable</th><th>Min</th><th>Descripción / rutas</th></tr></thead>
          <tbody>{pasos.map(paso => {
            const ruta = id => { const destino = pasos.find(item => item.id === id); return destino ? `paso ${destino.orden}` : 'siguiente'; };
            return <tr key={paso.id}><td>{paso.orden}{paso.critico ? ' ⚠' : ''}</td><td>{paso.tipo}</td><td><b>{paso.actividad || '—'}</b></td><td>{paso.responsable || '—'}</td><td>{paso.tiempo || '—'}</td>
              <td>{paso.salida || ''}{paso.tipo === 'Decisión' && <><br/>Sí ({paso.rutaSi || 'Sí'}) → {paso.destinoSi === '-' ? 'sin salida' : ruta(paso.destinoSi)} · No ({paso.rutaNo || 'No'}) → {paso.destinoNo ? ruta(paso.destinoNo) : 'sin definir'}</>}
                {paso.tipo !== 'Decisión' && paso.destino && paso.destino !== '-' && <><br/>Continúa en {ruta(paso.destino)}</>}{paso.destino === '-' && <><br/>Sin continuación</>}</td></tr>;
          })}</tbody>
        </table>
      </div>}
      <div data-pdf-block><h2>Conclusión y propuesta de mejora</h2><p className="hf-pdf-notes">{contenido.conclusiones?.trim() || 'Sin conclusión registrada.'}</p></div>
      {documentos.length > 0 && <div data-pdf-block>
        <h2>Evidencia adjunta</h2>
        <table className="hf-pdf-table"><colgroup><col style={{ width: '5%' }}/><col style={{ width: '32%' }}/><col style={{ width: '25%' }}/><col/><col style={{ width: '10%' }}/></colgroup>
          <thead><tr><th>#</th><th>Archivo</th><th>Paso relacionado</th><th>Descripción</th><th>Tamaño</th></tr></thead>
          <tbody>{documentos.map((documento, i) => <tr key={documento.id}><td>{i + 1}</td><td>{documento.nombre}</td><td>{nombrePaso(documento.pasoId)}</td><td>{documento.descripcion || '—'}</td><td>{formatearTamano(documento.tamano)}</td></tr>)}</tbody>
        </table>
      </div>}
      {imagenesPdf.map((imagen, i) => <div data-pdf-block key={imagen.id} className="cjm-pdf-image">
        <h2>Anexo {i + 1} · {imagen.nombre}</h2>
        <p>{nombrePaso(imagen.pasoId)}{imagen.descripcion ? ` — ${imagen.descripcion}` : ''}</p>
        <img src={imagen.src} alt={imagen.nombre}/>
      </div>)}
    </div>
  </div>;
}
