import React, { useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Megaphone, MousePointerClick, Plus, Share2, ShoppingCart, Trash2, Users } from 'lucide-react';
import { EstadoVacio, PieHerramienta, IndicadoresClave, NotasConPlantilla, EncabezadoPdf, BarraHerramienta } from '../../compartido/ComponentesHerramienta';
import { useRegistros } from '../../compartido/useRegistrosHerramienta';
import { useAccionesDocumentos } from '../../compartido/documentos/useDocumentosRespaldo';
import DocumentosRespaldo from '../../compartido/documentos/DocumentosRespaldo';
import LogoRed from './LogoRed';
import { cargarImagenesAnexo, formatearTamano } from '../../compartido/documentos/archivosRespaldo';
import { alerta } from '../../../../utils/Notificaciones';
import { exportarBloquesPdf, nombreArchivoSeguro } from '../../compartido/pdf/exportarPdfPorBloques';
import {
  ID_REDES, METRICAS, PLANTILLA_CONCLUSION_REDES, REDES, REFERENCIAS, analizarCanal, calcularTotalesRedes, crearCanal
} from './calculosRedes';
import '../../compartido/estilos/EstilosHerramientaBase.css';
import '../customer-journey/CustomerJourneyMap.css';
import './AuditoriaRedesSociales.css';
import '../../compartido/estilos/EstilosHerramientaTema.css';

const entero = new Intl.NumberFormat('es-BO', { maximumFractionDigits: 0 });
const compacto = new Intl.NumberFormat('es-BO', { notation: 'compact', maximumFractionDigits: 1 });
const ETIQUETA = { ok: 'Sólido', warn: 'Mejorable', bad: 'Crítico' };
// Espera breve para que React pinte el reporte (sin requestAnimationFrame, que se pausa en pestañas en segundo plano).
const esperarPintado = () => new Promise(resolve => setTimeout(resolve, 120));
const pct = valor => (valor === null ? '—' : `${valor.toFixed(1)}%`);

function TarjetaCanal({ canal, onEditar, onEliminar }) {
  return <article className="hf-card rd-channel" style={{ '--rd-color': canal.marca.color }}>
    <header className="rd-channel-head">
      <LogoRed marca={canal.marca} className="rd-brand"/>
      <div className="rd-channel-title">
        <input className="hf-title-input" list="rd-redes" value={canal.red} onChange={e => onEditar('red', e.target.value)} placeholder="Red social" aria-label="Red social"/>
        <input className="rd-user" value={canal.usuario} onChange={e => onEditar('usuario', e.target.value)} placeholder="@usuario o enlace" aria-label="Usuario o enlace"/>
      </div>
      {canal.estado && <span className={`hf-pill ${canal.estado}`}>{ETIQUETA[canal.estado]}</span>}
      <button type="button" className="hf-btn-icon danger sm" onClick={onEliminar} title="Eliminar canal" aria-label={`Eliminar ${canal.red || 'canal'}`}><Trash2 size={14}/></button>
    </header>
    <div className="rd-metrics">
      {METRICAS.map(metrica => <label key={metrica.id} className="hf-field">
        <span className="hf-field-label">{metrica.nombre}</span>
        <input className="hf-input hf-num" type="number" min="0" step="any" value={canal[metrica.id]} onChange={e => onEditar(metrica.id, e.target.value)} placeholder="0"/>
      </label>)}
    </div>
    <div className="rd-rates">
      {Object.entries(REFERENCIAS).map(([id, ref]) => <div key={id} className={`rd-rate ${canal.estados[id] || ''}`} title={`${ref.formula}. Referencia: ≥ ${ref.bueno}% sólido · ≥ ${ref.alerta}% mejorable`}>
        <small>{ref.nombre}</small><strong>{pct(canal[id])}</strong>
      </div>)}
    </div>
    <label className="hf-field"><span className="hf-field-label">Objetivo o acción de mejora</span>
      <textarea className="hf-input" rows="2" value={canal.objetivo} onChange={e => onEditar('objetivo', e.target.value)} placeholder="Ej.: Publicar 3 reels semanales con enlace al catálogo"/>
    </label>
  </article>;
}

export default function AuditoriaRedesSociales({ casoActivo, datos = {}, setDatos }) {
  const { contenido, actualizar, actualizarFilas, editarFila, guardarExtra, eliminarConConfirmacion } = useRegistros(datos, setDatos, ID_REDES);
  const canales = useMemo(() => contenido.filas.map(analizarCanal), [contenido.filas]);
  const totales = useMemo(() => calcularTotalesRedes(canales), [canales]);
  const reporteRef = useRef(null);
  const [exportando, setExportando] = useState(false);
  const [imagenesPdf, setImagenesPdf] = useState([]);
  const documentos = useMemo(() => (Array.isArray(contenido.documentos) ? contenido.documentos : []), [contenido.documentos]);
  const setDocumentos = React.useCallback(transformar => actualizar(c => ({ ...c, documentos: transformar(Array.isArray(c.documentos) ? c.documentos : []) })), [actualizar]);
  const accionesDocs = useAccionesDocumentos(documentos, setDocumentos);
  const nombreCanal = id => { const canal = canales.find(item => item.id === id); return canal ? (canal.red || 'Canal sin nombre') : 'General'; };

  const exportarPdf = async () => {
    if (exportando || !reporteRef.current) return;
    setExportando(true);
    try {
      const imagenes = await cargarImagenesAnexo(documentos);
      flushSync(() => setImagenesPdf(imagenes));
      await esperarPintado();
      await exportarBloquesPdf(reporteRef.current, { archivo: `Auditoria_Redes_Sociales_${nombreArchivoSeguro(casoActivo?.titulo || casoActivo?.nombre)}.pdf`, pie: 'Auditoría de redes sociales · Análisis Empresarial', orientacion: 'l' });
      alerta.exito('PDF descargado', 'Se exportó el resumen, las métricas por canal, el diagnóstico y la documentación adjunta.');
    } catch (error) {
      console.error('Error al exportar la auditoría de redes sociales:', error);
      alerta.error('Error al exportar', 'No se pudo generar el documento PDF.');
    } finally { setImagenesPdf([]); setExportando(false); }
  };
  const disponibles = REDES.filter(red => !canales.some(canal => canal.marca.nombre === red.nombre));
  const agregar = red => actualizarFilas(filas => [...filas, crearCanal(red)]);

  const kpis = [
    { icono: Share2, label: 'Canales', valor: canales.length },
    { icono: Users, label: 'Seguidores', valor: compacto.format(totales.seguidores) },
    { icono: Megaphone, label: 'Alcance mensual', valor: compacto.format(totales.alcance) },
    { icono: MousePointerClick, label: 'Interacción media', valor: pct(totales.interaccion), tono: totales.interaccion === null ? '' : totales.interaccion >= REFERENCIAS.interaccion.bueno ? 'ok' : totales.interaccion >= REFERENCIAS.interaccion.alerta ? 'warn' : 'bad' },
    { icono: ShoppingCart, label: 'Conversiones', valor: entero.format(totales.conversiones), detalle: totales.conversion === null ? undefined : `${totales.conversion.toFixed(1)}% de los clics` }
  ];

  return <div className="hf-container rd-tool">
    <datalist id="rd-redes">{REDES.map(red => <option key={red.nombre} value={red.nombre}/>)}</datalist>
    <BarraHerramienta icono={Share2} titulo="Auditoría de redes sociales · Presencia digital" exportando={exportando} onExportar={exportarPdf}/>
    <IndicadoresClave items={kpis}/>

    <section className="hf-card" aria-label="Canales auditados">
      <div className="hf-card-head">
        <div>
          <h3 className="hf-card-title"><Share2 size={16}/> Canales auditados</h3>
          <p className="hf-statement">Usa datos del mismo periodo (último mes) en todos los canales. Las tasas se calculan solas y se comparan con referencias orientativas del sector.</p>
        </div>
        <div className="hf-card-actions">
          {disponibles.slice(0, 4).map(red => <button type="button" key={red.nombre} className="rd-btn-quick" style={{ '--rd-color': red.color }} onClick={() => agregar(red.nombre)}><LogoRed marca={red} tamano={22}/>{red.nombre}</button>)}
          <button type="button" className="hf-btn-add" onClick={() => agregar('')}><Plus size={14}/> Canal</button>
        </div>
      </div>
      {canales.length ? <div className="rd-channels">
        {canales.map(canal => <TarjetaCanal key={canal.id} canal={canal} onEditar={(campo, valor) => editarFila(canal.id, campo, valor)} onEliminar={() => eliminarConConfirmacion(canal.id, canal.red || 'canal')}/>)}
      </div> : <EstadoVacio icono={Share2} titulo="Aún no hay canales" texto="Añade las redes en las que la empresa tiene presencia para auditar su desempeño.">
        <button type="button" className="hf-btn-add" onClick={() => actualizarFilas(() => ['Facebook', 'Instagram', 'TikTok'].map(crearCanal))}>Añadir Facebook, Instagram y TikTok</button>
      </EstadoVacio>}
    </section>

    {canales.length > 0 && <section className="hf-card" aria-label="Diagnóstico digital">
      <NotasConPlantilla id="rd-conclusiones" titulo="Conclusión y propuesta de mejora" valor={contenido.conclusiones || ''} onCambio={valor => guardarExtra('conclusiones', valor)} plantilla={PLANTILLA_CONCLUSION_REDES} placeholder="¿Qué canal priorizarías y qué acciones tomarías?"/>
    </section>}

    <DocumentosRespaldo documentos={documentos} acciones={accionesDocs}
      ayuda="Adjunta capturas de métricas, reportes de las plataformas o piezas de contenido que respalden la auditoría. Puedes relacionar cada archivo con un canal."
      renderExtra={documento => <select className="rd-doc-step" value={documento.canalId || ''} onChange={e => accionesDocs.editarDocumento(documento.id, { canalId: e.target.value })} aria-label={`Canal relacionado con ${documento.nombre}`}>
        <option value="">Evidencia general</option>{canales.map(canal => <option key={canal.id} value={canal.id}>{canal.red || 'Canal sin nombre'}</option>)}
      </select>}/>

    <PieHerramienta/>

    <div ref={reporteRef} className="hf-report rd-report" aria-hidden="true">
      <div data-pdf-block><EncabezadoPdf sigla="RS" titulo="Auditoría de redes sociales" subtitulo="Diagnóstico de la presencia digital" etiqueta="AUDITORÍA DIGITAL" caso={casoActivo}/><IndicadoresClave items={kpis}/></div>
      {canales.length > 0 && <div data-pdf-block>
        <h2>Métricas por canal</h2>
        <table className="hf-pdf-table">
          <thead><tr><th>Canal</th><th>Seguidores</th><th>Alcance</th><th>Interacciones</th><th>Clics</th><th>Conversiones</th><th>Publ./sem.</th><th>Interacción</th><th>CTR</th><th>Conversión</th><th>Estado</th><th style={{ width: '20%' }}>Objetivo / acción</th></tr></thead>
          <tbody>{canales.map(canal => <tr key={canal.id}>
            <td><b>{canal.red || '—'}</b>{canal.usuario ? <><br/>{canal.usuario}</> : null}</td>
            {['seguidores', 'alcance', 'interacciones', 'clics', 'conversiones', 'frecuencia'].map(campo => <td key={campo} className="hf-num">{canal[campo] === '' || canal[campo] === undefined ? '—' : entero.format(Number(canal[campo]) || 0)}</td>)}
            <td className="hf-num">{pct(canal.interaccion)}</td><td className="hf-num">{pct(canal.ctr)}</td><td className="hf-num">{pct(canal.conversion)}</td>
            <td>{canal.estado ? <span className={`hf-pill ${canal.estado}`}>{ETIQUETA[canal.estado]}</span> : '—'}</td><td>{canal.objetivo || '—'}</td>
          </tr>)}</tbody>
        </table>
      </div>}
      <div data-pdf-block><h2>Conclusión y propuesta de mejora</h2><p className="hf-pdf-notes">{contenido.conclusiones?.trim() || 'Sin conclusión registrada.'}</p></div>
      {documentos.length > 0 && <div data-pdf-block>
        <h2>Documentación de respaldo</h2>
        <table className="hf-pdf-table"><colgroup><col style={{ width: '5%' }}/><col style={{ width: '32%' }}/><col style={{ width: '20%' }}/><col/><col style={{ width: '9%' }}/></colgroup>
          <thead><tr><th>#</th><th>Archivo</th><th>Canal relacionado</th><th>Descripción</th><th>Tamaño</th></tr></thead>
          <tbody>{documentos.map((documento, i) => <tr key={documento.id}><td>{i + 1}</td><td>{documento.nombre}</td><td>{nombreCanal(documento.canalId)}</td><td>{documento.descripcion || '—'}</td><td>{formatearTamano(documento.tamano)}</td></tr>)}</tbody>
        </table>
      </div>}
      {imagenesPdf.map((imagen, i) => <div data-pdf-block key={imagen.id} className="cjm-pdf-image">
        <h2>Anexo {i + 1} · {imagen.nombre}</h2>
        <p>{nombreCanal(imagen.canalId)}{imagen.descripcion ? ` — ${imagen.descripcion}` : ''}</p>
        <img src={imagen.src} alt={imagen.nombre}/>
      </div>)}
    </div>
  </div>;
}
