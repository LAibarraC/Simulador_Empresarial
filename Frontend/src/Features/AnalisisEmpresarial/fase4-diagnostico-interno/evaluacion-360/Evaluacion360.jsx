import { useCallback, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Award, Eye, Grid3x3, Plus, Radar, Target, Trash2, UserPlus, Users } from 'lucide-react';
import { alerta } from '../../../../utils/Notificaciones';
import { EstadoVacio, PieHerramienta, IndicadoresClave, NotasConPlantilla, EncabezadoPdf, BarraHerramienta } from '../../compartido/ComponentesHerramienta';
import { useRegistros } from '../../compartido/useRegistrosHerramienta';
import { useAccionesDocumentos } from '../../compartido/documentos/useDocumentosRespaldo';
import DocumentosRespaldo from '../../compartido/documentos/DocumentosRespaldo';
import { cargarImagenesAnexo, formatearTamano } from '../../compartido/documentos/archivosRespaldo';
import { exportarBloquesPdf, nombreArchivoSeguro } from '../../compartido/pdf/exportarPdfPorBloques';
import { MapaCalor360, RadarCompetencias } from './GraficosEvaluacion360';
import {
  COMPETENCIAS_BASE, ESCALA_360, FUENTES, ID_360, PLANTILLA_CONCLUSION_360, agruparPorPersona, construirMapaCalor, crearFila360, iniciales, nivelDe
} from './calculosEvaluacion360';
import '../../compartido/estilos/EstilosHerramientaBase.css';
import '../customer-journey/CustomerJourneyMap.css';
import './Evaluacion360.css';
import '../../compartido/estilos/EstilosHerramientaTema.css';

// Espera breve para que React pinte el reporte (sin requestAnimationFrame, que se pausa en pestañas en segundo plano).
const esperarPintado = () => new Promise(resolve => setTimeout(resolve, 120));
const f1 = valor => (valor === null ? '—' : valor.toFixed(1));

function FilaCompetencia({ competencia, onEditar, onEliminar }) {
  return <article className="ev-comp">
    <div className="ev-comp-head">
      <input className="hf-input ev-comp-name" value={competencia.competencia} onChange={e => onEditar('competencia', e.target.value)} placeholder="Competencia" aria-label="Nombre de la competencia"/>
      <span className={`ev-score ${nivelDe(competencia.general) || ''}`} title="Promedio de todas las fuentes">{f1(competencia.general)}</span>
      {competencia.lectura && <span className={`hf-pill ${competencia.lectura.tono}`} title={competencia.lectura.ayuda}>{competencia.lectura.nombre}</span>}
      <button type="button" className="hf-btn-icon danger sm" onClick={onEliminar} title="Eliminar competencia" aria-label={`Eliminar ${competencia.competencia || 'competencia'}`}><Trash2 size={14}/></button>
    </div>
    <div className="ev-sources">
      {FUENTES.map(fuente => <div key={fuente.id} className="ev-source" style={{ '--ev-color': fuente.color }}>
        <span>{fuente.corto}</span>
        <div className="ev-rating" role="radiogroup" aria-label={`${fuente.nombre}: ${competencia.competencia}`}>
          {[1, 2, 3, 4, 5].map(valor => <button type="button" key={valor} role="radio" aria-checked={Number(competencia[fuente.id]) === valor} title={`${valor} · ${ESCALA_360[valor - 1]}`}
            className={`ev-btn-rate${Number(competencia[fuente.id]) === valor ? ' active' : ''}${Number(competencia[fuente.id]) >= valor ? ' filled' : ''}`}
            onClick={() => onEditar(fuente.id, Number(competencia[fuente.id]) === valor ? '' : String(valor))}>{valor}</button>)}
        </div>
      </div>)}
    </div>
    <textarea className="hf-input ev-comment" rows="1" value={competencia.comentario} onChange={e => onEditar('comentario', e.target.value)} placeholder="Comentario o plan de acción (Ej.: Taller de comunicación efectiva en marzo)"/>
  </article>;
}

export default function Evaluacion360({ casoActivo, datos = {}, setDatos }) {
  const { contenido, actualizar, actualizarFilas, editarFila, guardarExtra, eliminarConConfirmacion } = useRegistros(datos, setDatos, ID_360);
  const personas = useMemo(() => agruparPorPersona(contenido.filas), [contenido.filas]);
  const mapa = useMemo(() => construirMapaCalor(personas), [personas]);
  const [seleccion, setSeleccion] = useState(null);
  const persona = personas.find(p => p.nombre === seleccion) || personas[0];
  const reporteRef = useRef(null);
  const [exportando, setExportando] = useState(false);
  const [imagenesPdf, setImagenesPdf] = useState([]);
  const documentos = useMemo(() => (Array.isArray(contenido.documentos) ? contenido.documentos : []), [contenido.documentos]);
  const setDocumentos = useCallback(transformar => actualizar(c => ({ ...c, documentos: transformar(Array.isArray(c.documentos) ? c.documentos : []) })), [actualizar]);
  const accionesDocs = useAccionesDocumentos(documentos, setDocumentos);

  const exportarPdf = async () => {
    if (exportando || !reporteRef.current) return;
    setExportando(true);
    try {
      const imagenes = await cargarImagenesAnexo(documentos);
      flushSync(() => setImagenesPdf(imagenes));
      await esperarPintado();
      await exportarBloquesPdf(reporteRef.current, { archivo: `Evaluacion_360_${nombreArchivoSeguro(casoActivo?.titulo || casoActivo?.nombre)}.pdf`, pie: 'Evaluación 360° · Análisis Empresarial', orientacion: 'l' });
      alerta.exito('PDF descargado', 'Se exportó el mapa del equipo, los radares por persona, el plan de desarrollo y la evidencia adjunta.');
    } catch (error) {
      console.error('Error al exportar la evaluación 360:', error);
      alerta.error('Error al exportar', 'No se pudo generar el documento PDF.');
    } finally { setImagenesPdf([]); setExportando(false); }
  };

  const agregarPersona = () => {
    let indice = personas.length + 1;
    while (personas.some(p => p.nombre === `Persona ${indice}`)) indice += 1;
    const nombre = `Persona ${indice}`;
    actualizarFilas(filas => [...filas, ...COMPETENCIAS_BASE.map(c => crearFila360(nombre, c))]);
    setSeleccion(nombre);
  };
  const renombrar = nuevo => { const anteriorNombre = persona.nombre; actualizarFilas(filas => filas.map(f => ((f.persona?.trim() || 'Sin nombre') === anteriorNombre ? { ...f, persona: nuevo } : f))); setSeleccion(nuevo.trim() || 'Sin nombre'); };
  const eliminarPersona = async () => {
    const ok = await alerta.confirmar({ titulo: 'Eliminar persona', mensaje: `Se eliminará la evaluación completa de «${persona.nombre}».`, textoConfirmar: 'Eliminar', variant: 'danger' });
    if (!ok) return;
    actualizarFilas(filas => filas.filter(f => (f.persona?.trim() || 'Sin nombre') !== persona.nombre));
    setSeleccion(null);
  };

  const generales = personas.map(p => p.general).filter(v => v !== null);
  const mediaEquipo = generales.length ? generales.reduce((a, b) => a + b, 0) / generales.length : null;
  const kpis = [
    { icono: Users, label: 'Personas evaluadas', valor: personas.length },
    { icono: Target, label: 'Competencias', valor: mapa.competencias.length },
    { icono: Award, label: 'Promedio del equipo', valor: mediaEquipo === null ? '—' : `${mediaEquipo.toFixed(2)} / 5`, tono: nivelDe(mediaEquipo) },
    { icono: Eye, label: 'Puntos ciegos', valor: personas.reduce((t, p) => t + p.ciegos, 0), tono: personas.some(p => p.ciegos) ? 'bad' : '', detalle: 'Autoevaluación ≥ 1 punto sobre los demás' }
  ];

  return <div className="hf-container ev-tool">
    <BarraHerramienta icono={Radar} titulo="Evaluación 360° · Talento y liderazgo" exportando={exportando} onExportar={exportarPdf}/>
    <IndicadoresClave items={kpis}/>

    {personas.length ? <>
      <section className="hf-card" aria-label="Personas evaluadas">
        <div className="ev-people">
          {personas.map(p => <button type="button" key={p.nombre} className={`ev-btn-person${persona?.nombre === p.nombre ? ' active' : ''}`} onClick={() => setSeleccion(p.nombre)}>
            <span className="ev-avatar">{iniciales(p.nombre)}</span>
            <span className="ev-person-text"><strong>{p.nombre}</strong><small>{p.competencias.length} competencias · {p.completitud}%</small></span>
            <span className={`ev-score ${nivelDe(p.general) || ''}`}>{f1(p.general)}</span>
          </button>)}
          <button type="button" className="hf-btn-outline ev-add-person" onClick={agregarPersona}><UserPlus size={14}/> Persona</button>
        </div>
      </section>

      {persona && <section className="hf-card accent" aria-label={`Evaluación de ${persona.nombre}`}>
        <div className="ev-person-head">
          <span className="ev-avatar lg">{iniciales(persona.nombre)}</span>
          <div className="ev-person-title">
            <span className="hf-section-label">Persona evaluada</span>
            <input className="hf-title-input" value={persona.nombre === 'Sin nombre' ? '' : persona.nombre} onChange={e => renombrar(e.target.value)} placeholder="Nombre y cargo" aria-label="Nombre de la persona" maxLength={60}/>
          </div>
          <div className="ev-person-stats">
            <div><small>Autoevaluación</small><strong style={{ color: '#ea580c' }}>{f1(persona.autoMedia)}</strong></div>
            <div><small>Los demás</small><strong style={{ color: '#2563eb' }}>{f1(persona.otrosMedia)}</strong></div>
            <div><small>General</small><strong className={nivelDe(persona.general) ? `hf-${nivelDe(persona.general)}` : ''}>{f1(persona.general)}</strong></div>
          </div>
          <button type="button" className="hf-btn-icon danger" onClick={eliminarPersona} title="Eliminar persona" aria-label="Eliminar persona"><Trash2 size={15}/></button>
        </div>
        <div className="ev-body">
          <div className="ev-radar-card"><RadarCompetencias competencias={persona.competencias}/>
            {persona.fortaleza && <p className="ev-highlight ok"><Award size={13}/> Mayor fortaleza: <b>{persona.fortaleza.competencia}</b> ({f1(persona.fortaleza.general)})</p>}
            {persona.mejora && <p className="ev-highlight warn"><Target size={13}/> Menor puntaje: <b>{persona.mejora.competencia}</b> ({f1(persona.mejora.general)})</p>}
          </div>
          <div className="ev-comps">
            <p className="hf-statement">Califica de 1 (necesita mejorar) a 5 (desempeño destacado) desde cada fuente. Pasa el cursor por los números para ver la escala.</p>
            {persona.competencias.map(c => <FilaCompetencia key={c.id} competencia={c} onEditar={(campo, valor) => editarFila(c.id, campo, valor)} onEliminar={() => eliminarConConfirmacion(c.id, c.competencia || 'competencia')}/>)}
            <button type="button" className="hf-btn-add ev-add-comp" onClick={() => actualizarFilas(filas => [...filas, crearFila360(persona.nombre, '')])}><Plus size={14}/> Competencia</button>
          </div>
        </div>
      </section>}

      <section className="hf-card" aria-label="Mapa de calor del equipo">
        <h3 className="hf-card-title"><Grid3x3 size={16}/> Mapa de calor del equipo</h3>
        <MapaCalor360 mapa={mapa} onSeleccionar={setSeleccion}/>
      </section>

      <section className="hf-card" aria-label="Diagnóstico del equipo">
        <NotasConPlantilla id="ev-conclusiones" titulo="Conclusión y propuesta de mejora" valor={contenido.conclusiones || ''} onCambio={valor => guardarExtra('conclusiones', valor)} plantilla={PLANTILLA_CONCLUSION_360} placeholder="¿Qué competencias priorizarías y con qué acciones?"/>
      </section>
    </> : <section className="hf-card"><EstadoVacio icono={Users} titulo="Aún no hay personas evaluadas" texto={`Añade una persona: se crearán las competencias base (${COMPETENCIAS_BASE.join(', ')}). Puedes editarlas o añadir otras.`}>
      <button type="button" className="hf-btn-add" onClick={agregarPersona}><UserPlus size={14}/> Evaluar a una persona</button>
    </EstadoVacio></section>}

    {personas.length > 0 && <DocumentosRespaldo documentos={documentos} acciones={accionesDocs} titulo="Evidencia de la evaluación"
      ayuda="Adjunta formularios de evaluación, actas de retroalimentación, informes de desempeño o capturas que respalden las calificaciones. Puedes relacionar cada archivo con una persona."
      renderExtra={documento => <select className="ev-doc-step" value={documento.persona || ''} onChange={e => accionesDocs.editarDocumento(documento.id, { persona: e.target.value })} aria-label={`Persona relacionada con ${documento.nombre}`}>
        <option value="">Evidencia general</option>{personas.map(p => <option key={p.nombre} value={p.nombre}>{p.nombre}</option>)}
      </select>}/>}

    <PieHerramienta/>

    <div ref={reporteRef} className="hf-report ev-report" aria-hidden="true">
      <div data-pdf-block><EncabezadoPdf sigla="360" titulo="Evaluación 360°" subtitulo="Talento y liderazgo" etiqueta="EVALUACIÓN DEL EQUIPO" caso={casoActivo}/><IndicadoresClave items={kpis}/></div>
      {mapa.competencias.length > 0 && <div data-pdf-block><h2>Mapa de calor del equipo</h2><MapaCalor360 mapa={mapa}/></div>}
      {personas.map(p => <div data-pdf-block key={p.nombre} className="ev-pdf-person">
        <h2>{p.nombre} · promedio {f1(p.general)}</h2>
        <div className="ev-pdf-grid">
          <RadarCompetencias competencias={p.competencias}/>
          <table className="hf-pdf-table"><thead><tr><th style={{ width: '24%' }}>Competencia</th>{FUENTES.map(f => <th key={f.id}>{f.corto}</th>)}<th>Media</th><th>Lectura</th><th style={{ width: '28%' }}>Plan de acción</th></tr></thead>
            <tbody>{p.competencias.map(c => <tr key={c.id}><td><b>{c.competencia || '—'}</b></td>{FUENTES.map(f => <td key={f.id} className="hf-num">{c[f.id] || '—'}</td>)}<td className="hf-num"><b>{f1(c.general)}</b></td><td>{c.lectura ? <span className={`hf-pill ${c.lectura.tono}`}>{c.lectura.nombre}</span> : '—'}</td><td>{c.comentario || '—'}</td></tr>)}</tbody>
          </table>
        </div>
      </div>)}
      <div data-pdf-block><h2>Conclusión y propuesta de mejora</h2><p className="hf-pdf-notes">{contenido.conclusiones?.trim() || 'Sin conclusión registrada.'}</p></div>
      {documentos.length > 0 && <div data-pdf-block>
        <h2>Evidencia adjunta</h2>
        <table className="hf-pdf-table"><colgroup><col style={{ width: '5%' }}/><col style={{ width: '30%' }}/><col style={{ width: '24%' }}/><col/><col style={{ width: '9%' }}/></colgroup>
          <thead><tr><th>#</th><th>Archivo</th><th>Persona relacionada</th><th>Descripción</th><th>Tamaño</th></tr></thead>
          <tbody>{documentos.map((documento, i) => <tr key={documento.id}><td>{i + 1}</td><td>{documento.nombre}</td><td>{documento.persona || 'General'}</td><td>{documento.descripcion || '—'}</td><td>{formatearTamano(documento.tamano)}</td></tr>)}</tbody>
        </table>
      </div>}
      {imagenesPdf.map((imagen, i) => <div data-pdf-block key={imagen.id} className="cjm-pdf-image">
        <h2>Anexo {i + 1} · {imagen.nombre}</h2>
        <p>{imagen.persona || 'General'}{imagen.descripcion ? ` — ${imagen.descripcion}` : ''}</p>
        <img src={imagen.src} alt={imagen.nombre}/>
      </div>)}
    </div>
  </div>;
}
