import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PieNavegacion from '../../simulacion/PieNavegacion';
import { flushSync } from 'react-dom';
import { ClipboardList, Gauge, NotebookPen, RotateCcw, Scale, ShieldCheck, TrendingDown, TrendingUp } from 'lucide-react';
import { alerta } from '../../../../utils/Notificaciones';
import { IndicadoresClave, NotasConPlantilla, EncabezadoPdf, BarraHerramienta } from '../../compartido/ComponentesHerramienta';
import IndicadoresEfi from './IndicadoresEfi';
import TablaFactoresEfi from './TablaFactoresEfi';
import ModalFactorEfi from './ModalFactorEfi';
import DocumentosRespaldo from '../../compartido/documentos/DocumentosRespaldo';
import ModalConfirmarEliminacion from '../../compartido/modales/ModalConfirmarEliminacion';
import { useAccionesDocumentos } from '../../compartido/documentos/useDocumentosRespaldo';
import { eliminarArchivo } from '../../compartido/documentos/almacenArchivos';
import { cargarImagenesAnexo, formatearTamano } from '../../compartido/documentos/archivosRespaldo';
import { exportarBloquesPdf, nombreArchivoSeguro } from '../../compartido/pdf/exportarPdfPorBloques';
import {
  AREAS_FUNCIONALES, PLANTILLA_CONCLUSION_EFI, ESCALA_RATING_EFI, calcularPuntajePonderadoEfi, calcularTotalesEfi,
  determinarDiagnosticoInterno, equilibrarPesosEfi, generarPayloadFodaDesdeEFI
} from './calculosEfi';
import '../../compartido/estilos/EstilosHerramientaBase.css';
import '../customer-journey/CustomerJourneyMap.css';
import './MatrizEFI.css';
import '../../compartido/estilos/EstilosHerramientaTema.css';

const GRUPOS = [
  { tipo: 'Fortaleza', titulo: 'Fortalezas', ayuda: 'Lo que la empresa hace bien · calificación 3 o 4', icono: TrendingUp },
  { tipo: 'Debilidad', titulo: 'Debilidades', ayuda: 'Lo que debe corregir · calificación 1 o 2', icono: TrendingDown }
];

// Espera breve para que React pinte el reporte (sin requestAnimationFrame, que se pausa en pestañas en segundo plano).
const esperarPintado = () => new Promise(resolve => setTimeout(resolve, 120));

/** Siguiente código libre (F5, D3…) para el tipo indicado. */
function siguienteCodigo(factores, tipo) {
  const prefijo = tipo === 'Fortaleza' ? 'F' : 'D';
  const usados = new Set(factores.map(f => f.codigo));
  let i = factores.filter(f => f.tipo === tipo).length + 1;
  while (usados.has(`${prefijo}${i}`)) i += 1;
  return `${prefijo}${i}`;
}

export default function MatrizEFI({ casoActivo, datosEfi, setDatosEfi, onContinuarAFoda, onAnterior }) {
  const reporteRef = useRef(null);
  const [factores, setFactores] = useState(() => (Array.isArray(datosEfi?.factores) ? datosEfi.factores : [])); // sin factores de ejemplo: el estudiante construye la matriz
  const [conclusiones, setConclusiones] = useState(() => datosEfi?.conclusiones || '');
  const [documentos, setDocumentos] = useState(() => (Array.isArray(datosEfi?.documentos) ? datosEfi.documentos : []));
  const [modal, setModal] = useState(null); // { tipo: 'nuevo', tipoFactor } | { tipo: 'editar', id }
  const [confirmacion, setConfirmacion] = useState(null); // { id }
  const [exportando, setExportando] = useState(false);
  const [imagenesPdf, setImagenesPdf] = useState([]);

  // Sincroniza con el contenedor padre (mismo formato de siempre + conclusiones y documentos).
  useEffect(() => {
    setDatosEfi?.(prev => ({ ...prev, factores, conclusiones, documentos, fechaActualizacion: new Date().toISOString() }));
  }, [factores, conclusiones, documentos, setDatosEfi]);

  const totales = useMemo(() => calcularTotalesEfi(factores), [factores]);
  const diagnostico = useMemo(() => determinarDiagnosticoInterno(totales.totalPonderadoGlobal), [totales.totalPonderadoGlobal]);
  const accionesDocs = useAccionesDocumentos(documentos, setDocumentos);


  /* ---------------- Factores ---------------- */
  const editar = useCallback((id, cambios) => setFactores(prev => prev.map(f => (f.id === id ? { ...f, ...(typeof cambios === 'function' ? cambios(f) : cambios) } : f))), []);
  const crearFactor = valores => {
    const id = `efi-custom-${Date.now()}`;
    setFactores(prev => [...prev, { id, codigo: siguienteCodigo(prev, valores.tipo), evidencias: [], ...valores }]);
    setModal(null);
    alerta.exito('Factor creado', 'Se añadió a la tabla. Usa el lápiz para ajustarlo o adjuntarle evidencia.');
  };
  const confirmarEliminacion = () => {
    const { id } = confirmacion;
    const vecinos = factores.filter(f => f.tipo === factores.find(x => x.id === id)?.tipo);
    const indice = vecinos.findIndex(f => f.id === id);
    const factor = factores.find(f => f.id === id);
    (factor?.evidencias || []).forEach(evidencia => { if (evidencia.almacenado) eliminarArchivo(evidencia.id).catch(() => {}); });
    setFactores(prev => prev.filter(f => f.id !== id));
    if (modal?.id === id) setModal(vecinos.length > 1 ? { tipo: 'editar', id: (vecinos[indice + 1] || vecinos[indice - 1]).id } : null);
    setConfirmacion(null);
  };
  const navegarFactor = direccion => {
    const indice = factores.findIndex(f => f.id === modal?.id);
    const destino = factores[indice + direccion];
    if (destino) setModal({ tipo: 'editar', id: destino.id });
  };
  const equilibrar = () => { if (!factores.length) return; setFactores(equilibrarPesosEfi(factores)); alerta.exito('Pesos repartidos', 'Se distribuyó el 100% (1,00) por igual entre todos los factores. Ajusta los más importantes.'); };
  const continuar = () => {
    if (!totales.esSumaValida) alerta.advertencia('Revisa los pesos', `La suma es ${totales.sumaPesos.toFixed(2)}; idealmente debe ser 1,00 antes de consolidar.`);
    onContinuarAFoda?.(generarPayloadFodaDesdeEFI(factores));
  };

  /* ---------------- PDF ---------------- */
  const exportarPdf = async () => {
    if (exportando || !reporteRef.current) return;
    setExportando(true);
    try {
      const imagenes = await cargarImagenesAnexo(documentos);
      flushSync(() => setImagenesPdf(imagenes));
      await esperarPintado();
      await exportarBloquesPdf(reporteRef.current, { archivo: `Matriz_EFI_${nombreArchivoSeguro(casoActivo?.titulo || casoActivo?.nombre)}.pdf`, pie: 'Matriz EFI · Análisis Empresarial', orientacion: 'p' });
      alerta.exito('PDF descargado', 'Se exportó la matriz, el puntaje, el desglose por área, el diagnóstico y la evidencia.');
    } catch (error) {
      console.error('Error al exportar la matriz EFI:', error);
      alerta.error('Error al exportar', 'No se pudo generar el documento PDF.');
    } finally { setImagenesPdf([]); setExportando(false); }
  };

  /* ---------------- Datos derivados ---------------- */
  const subtotal = tipo => (tipo === 'Fortaleza' ? totales.totalPonderadoFortalezas : totales.totalPonderadoDebilidades);
  const factorEditando = modal?.tipo === 'editar' ? factores.find(f => f.id === modal.id) : null;
  const factorConfirmar = confirmacion ? factores.find(f => f.id === confirmacion.id) : null;
  const nombreFactor = id => { const f = factores.find(item => item.id === id); return f ? `${f.codigo} · ${f.titulo || 'Sin descripción'}` : 'General'; };
  const kpisPdf = [
    { icono: Gauge, label: 'Puntaje EFI', valor: totales.totalPonderadoGlobal.toFixed(2), detalle: 'Media teórica 2,50', tono: totales.totalPonderadoGlobal > 2.5 ? 'ok' : 'bad' },
    { icono: TrendingUp, label: 'Fortalezas', valor: totales.numFortalezas, detalle: `Aportan ${totales.totalPonderadoFortalezas.toFixed(2)}` },
    { icono: TrendingDown, label: 'Debilidades', valor: totales.numDebilidades, detalle: `Aportan ${totales.totalPonderadoDebilidades.toFixed(2)}` },
    { icono: Scale, label: 'Suma de pesos', valor: totales.sumaPesos.toFixed(2), detalle: totales.esSumaValida ? 'Correcta (1,00)' : 'Debe ser 1,00', tono: totales.esSumaValida ? 'ok' : 'warn' }
  ];
  const sobrante = Math.round((1 - totales.sumaPesos) * 100) / 100;

  return <div className="hf-container efi-tool">
    <BarraHerramienta icono={ShieldCheck} titulo="Matriz EFI · Evaluación de factores internos" exportando={exportando} onExportar={exportarPdf}/>

    <IndicadoresEfi totales={totales} diagnostico={diagnostico}/>

    <section className="cjm-card efi-guide" aria-label="Cómo completar la matriz">
      <div className={`efi-weight-line ${totales.esSumaValida ? 'ok' : 'warn'}`}>
        <div><small>Peso repartido</small><strong>{totales.sumaPesos.toFixed(2)}<span> / 1,00</span></strong></div>
        <div className="efi-weights-bar"><i style={{ width: `${Math.min(100, totales.sumaPesos * 100)}%` }}/></div>
        <span className="efi-weight-msg">{totales.esSumaValida ? 'Todo repartido' : sobrante > 0 ? `Faltan ${sobrante.toFixed(2)}` : `Sobran ${Math.abs(sobrante).toFixed(2)}`}</span>
        <button type="button" className="cjm-btn-outline" onClick={equilibrar} title="Distribuir el peso por igual entre todos los factores"><RotateCcw size={13}/> Repartir por igual</button>
      </div>
    </section>

    <div className="efi-tables">
      {GRUPOS.map(grupo => <TablaFactoresEfi key={grupo.tipo} {...grupo} factores={factores.filter(f => f.tipo === grupo.tipo)} subtotal={subtotal(grupo.tipo)}
        onEditar={editar} onAbrir={id => setModal({ tipo: 'editar', id })} onEliminar={id => setConfirmacion({ id })} onAgregar={() => setModal({ tipo: 'nuevo', tipoFactor: grupo.tipo })}/>)}
    </div>

    <section className="cjm-card" aria-label="Conclusión del diagnóstico interno">
      <h3 className="cjm-card-title"><NotebookPen size={16}/> Conclusión y propuesta de mejora</h3>
      <NotasConPlantilla id="efi-conclusiones" titulo="Tu conclusión" valor={conclusiones} onCambio={setConclusiones} plantilla={PLANTILLA_CONCLUSION_EFI} placeholder="¿La empresa es fuerte o débil internamente y qué factores llevarás a la FODA?"/>
    </section>

    <DocumentosRespaldo documentos={documentos} acciones={accionesDocs}
      ayuda="Adjunta informes, estados financieros, fotos o encuestas que respalden tus factores. Puedes relacionar cada archivo con un factor."
      renderExtra={documento => <select className="fl-doc-step" value={documento.factorId || ''} onChange={e => accionesDocs.editarDocumento(documento.id, { factorId: e.target.value })} aria-label={`Factor relacionado con ${documento.nombre}`}>
        <option value="">Evidencia general</option>{factores.map(f => <option key={f.id} value={f.id}>{f.codigo}: {f.titulo || 'Sin descripción'}</option>)}
      </select>}/>

    <PieNavegacion onAnterior={onAnterior} onSiguiente={continuar} centro={<span className="efi-footer-hint"><ClipboardList size={12}/> Los cambios se guardan automáticamente</span>}/>

    <ModalFactorEfi abierto={modal?.tipo === 'nuevo' || Boolean(factorEditando)} factor={factorEditando} tipoInicial={modal?.tipoFactor || 'Fortaleza'} areaInicial={AREAS_FUNCIONALES[0].nombre} factores={factores}
      onCrear={crearFactor} onEditar={editar} onEliminar={id => setConfirmacion({ id })} onNavegar={navegarFactor} onCerrar={() => setModal(null)}/>
    <ModalConfirmarEliminacion abierto={Boolean(factorConfirmar)} titulo="Eliminar factor" textoConfirmar="Eliminar factor" onConfirmar={confirmarEliminacion} onCerrar={() => setConfirmacion(null)}
      detalle={factorConfirmar && <><span className={`efi-code ${factorConfirmar.tipo === 'Fortaleza' ? 'f' : 'd'}`}>{factorConfirmar.codigo}</span><span><strong>{factorConfirmar.titulo || 'Factor sin descripción'}</strong><small>{factorConfirmar.tipo} · {factorConfirmar.area}</small></span></>}
      mensaje="Se quitará de la matriz y dejará de contar en el puntaje."
      perdidas={factorConfirmar ? [`Aporte de ${calcularPuntajePonderadoEfi(factorConfirmar.peso, factorConfirmar.calificacion).toFixed(2)} al puntaje (peso ${Number(factorConfirmar.peso).toFixed(2)})`, ...((factorConfirmar.evidencias || []).length ? [`${factorConfirmar.evidencias.length} evidencia(s) adjunta(s) al factor`] : []), 'Los pesos restantes ya no sumarán 1,00: usa «Repartir por igual»'] : []}/>

    <div ref={reporteRef} className="hf-report vertical efi-report" aria-hidden="true">
      <div data-pdf-block>
        <EncabezadoPdf sigla="EFI" titulo="Matriz EFI" subtitulo="Evaluación de factores internos (Fred R. David)" etiqueta="DIAGNÓSTICO INTERNO" caso={casoActivo}/>
        <IndicadoresClave items={kpisPdf}/>
        <p className="efi-pdf-verdict"><b style={{ color: diagnostico.color }}>{diagnostico.postura} ({totales.totalPonderadoGlobal.toFixed(2)} de 4,00).</b> {diagnostico.descripcion}</p>
      </div>
      {GRUPOS.map(grupo => {
        const lista = factores.filter(f => f.tipo === grupo.tipo);
        const clase = grupo.tipo === 'Fortaleza' ? 'f' : 'd';
        return <div data-pdf-block key={grupo.tipo}>
          <h2 className={`efi-pdf-h ${clase}`}>{grupo.titulo} ({lista.length}) · aporte {subtotal(grupo.tipo).toFixed(2)}</h2>
          <table className="hf-pdf-table">
            <colgroup><col style={{ width: '7%' }}/><col/><col style={{ width: '19%' }}/><col style={{ width: '9%' }}/><col style={{ width: '11%' }}/><col style={{ width: '7%' }}/></colgroup>
            <thead><tr><th>Cód.</th><th>Factor interno</th><th>Calificación</th><th>Peso</th><th>Ponderado</th><th>Evid.</th></tr></thead>
            <tbody>{lista.length ? lista.map(f => <tr key={f.id}>
              <td><b>{f.codigo}</b></td>
              <td><b>{f.titulo || '—'}</b><br/><span className="efi-pdf-area">{f.area || 'Otra área'}</span>{f.descripcion ? <> · {f.descripcion}</> : null}</td>
              <td>{f.calificacion} · {ESCALA_RATING_EFI[f.calificacion]?.labelCorto || ''}</td>
              <td className="hf-num">{Number(f.peso || 0).toFixed(2)}</td>
              <td className="hf-num"><b>{calcularPuntajePonderadoEfi(f.peso, f.calificacion).toFixed(2)}</b></td>
              <td className="hf-num">{(f.evidencias || []).length || '—'}</td>
            </tr>) : <tr><td colSpan="6">Sin factores registrados.</td></tr>}
              <tr className="efi-pdf-total"><td colSpan="3">Subtotal</td><td className="hf-num">{(grupo.tipo === 'Fortaleza' ? totales.sumaPesosFortalezas : totales.sumaPesosDebilidades).toFixed(2)}</td><td className="hf-num">{subtotal(grupo.tipo).toFixed(2)}</td><td/></tr>
            </tbody>
          </table>
        </div>;
      })}
      <div data-pdf-block>
        <table className="hf-pdf-table">
          <tbody><tr className="efi-pdf-total"><td>Total de la matriz</td><td className="hf-num">Peso {totales.sumaPesos.toFixed(2)}</td><td className="hf-num">Puntaje EFI {totales.totalPonderadoGlobal.toFixed(2)}</td></tr></tbody>
        </table>
      </div>
      <div data-pdf-block><h2>Conclusión y propuesta de mejora</h2><p className="hf-pdf-notes">{conclusiones.trim() || 'Sin conclusión registrada.'}</p></div>
      {documentos.length > 0 && <div data-pdf-block>
        <h2>Evidencia adjunta</h2>
        <table className="hf-pdf-table"><colgroup><col style={{ width: '5%' }}/><col style={{ width: '30%' }}/><col style={{ width: '27%' }}/><col/><col style={{ width: '10%' }}/></colgroup>
          <thead><tr><th>#</th><th>Archivo</th><th>Factor relacionado</th><th>Descripción</th><th>Tamaño</th></tr></thead>
          <tbody>{documentos.map((documento, i) => <tr key={documento.id}><td>{i + 1}</td><td>{documento.nombre}</td><td>{nombreFactor(documento.factorId)}</td><td>{documento.descripcion || '—'}</td><td>{formatearTamano(documento.tamano)}</td></tr>)}</tbody>
        </table>
      </div>}
      {imagenesPdf.map((imagen, i) => <div data-pdf-block key={imagen.id} className="cjm-pdf-image">
        <h2>Anexo {i + 1} · {imagen.nombre}</h2>
        <p>{nombreFactor(imagen.factorId)}{imagen.descripcion ? ` — ${imagen.descripcion}` : ''}</p>
        <img src={imagen.src} alt={imagen.nombre}/>
      </div>)}
    </div>
  </div>;
}
