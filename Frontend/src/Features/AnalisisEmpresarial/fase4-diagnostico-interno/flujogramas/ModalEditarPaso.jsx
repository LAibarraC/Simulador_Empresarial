import { useRef } from 'react';
import { AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock, ExternalLink, FileText, GitFork, Link2Off, Paperclip, PencilLine, Trash2, User, XCircle } from 'lucide-react';
import VentanaModal from '../../compartido/modales/VentanaModal';
import { TIPOS_PASO } from './calculosFlujo';
import { DOCUMENTOS_ACEPTADOS } from '../../compartido/documentos/archivosRespaldo';
import { abrirDocumento } from '../../compartido/documentos/useDocumentosRespaldo';

const opcionesPasos = pasos => pasos.map(item => <option key={item.id} value={item.id}>Paso {item.orden}: {item.actividad || 'Sin nombre'}</option>);

/** Modal de edición de un paso: tipo, responsable, tiempo, conexiones, punto crítico y evidencia. */
export default function ModalEditarPaso({ paso, pasos, responsables, documentos = [], acciones, onNavegar, onCerrar }) {
  const inputRef = useRef(null);
  if (!paso) return null;
  const indice = pasos.findIndex(item => item.id === paso.id);
  const editar = (campo, valor) => acciones.editarFila(paso.id, campo, valor);
  const destinos = pasos.filter(item => item.id !== paso.id);
  const esDecision = paso.tipo === 'Decisión';
  const esFinal = paso.tipo === 'Inicio / fin' && indice > 0;
  const propias = documentos.filter(documento => documento.pasoId === paso.id);

  return <VentanaModal abierto onCerrar={onCerrar} icono={PencilLine} ancho={760}
    titulo={`Paso ${paso.orden} de ${pasos.length}${paso.actividad ? ` · ${paso.actividad}` : ''}`}
    subtitulo="Edita el paso y sus conexiones. También puedes arrastrarlo en el diagrama."
    pie={<>
      <div className="cjm-modal-foot-group">
        <button type="button" className="cjm-btn-icon" onClick={() => onNavegar(-1)} disabled={indice === 0} title="Paso anterior" aria-label="Paso anterior"><ChevronLeft size={16}/></button>
        <span className="cjm-step-dots" aria-hidden="true">{pasos.map((item, i) => <i key={item.id} className={i === indice ? 'on' : ''}/>)}</span>
        <button type="button" className="cjm-btn-icon" onClick={() => onNavegar(1)} disabled={indice === pasos.length - 1} title="Paso siguiente" aria-label="Paso siguiente"><ChevronRight size={16}/></button>
      </div>
      <div className="cjm-modal-foot-group">
        <button type="button" className="cjm-btn-icon danger" onClick={() => acciones.eliminar(paso.id)} title="Eliminar paso" aria-label="Eliminar paso"><Trash2 size={15}/></button>
        <button type="button" className="cjm-btn-add" onClick={onCerrar}><Check size={14}/> Listo</button>
      </div>
    </>}>
    <div className="fl-modal-form">
      <label className="cjm-field">
        <span className="cjm-field-label">Nombre del paso</span>
        <input className="cjm-input" value={paso.actividad} onChange={e => editar('actividad', e.target.value)} maxLength={80} placeholder={esDecision ? '¿Qué se decide? Ej.: ¿Hay stock?' : 'Nombre de la actividad'}/>
      </label>

      <div className="fl-type-picker" role="radiogroup" aria-label="Tipo de paso">
        {TIPOS_PASO.map(tipo => <button type="button" key={tipo.id} role="radio" aria-checked={paso.tipo === tipo.id} className={`fl-btn-type ${tipo.forma}${paso.tipo === tipo.id ? ' active' : ''}`} onClick={() => editar('tipo', tipo.id)}>
          <i aria-hidden="true"/><span>{tipo.nombre}</span>
        </button>)}
      </div>

      <div className="fl-modal-grid">
        <label className="cjm-field"><span className="cjm-field-label"><User size={12}/> Responsable <small>define el carril</small></span>
          <input className="cjm-input" list="fl-responsables-modal" value={paso.responsable} onChange={e => editar('responsable', e.target.value)} placeholder="Ej.: Ventas"/>
          <datalist id="fl-responsables-modal">{responsables.map(nombre => <option key={nombre} value={nombre}/>)}</datalist>
        </label>
        <label className="cjm-field"><span className="cjm-field-label"><Clock size={12}/> Tiempo estimado <small>minutos</small></span>
          <input className="cjm-input" type="number" min="0" step="any" value={paso.tiempo} onChange={e => editar('tiempo', e.target.value)} placeholder="0"/>
        </label>
        <label className="cjm-field fl-span-2"><span className="cjm-field-label"><FileText size={12}/> Descripción o resultado</span>
          <textarea className="cjm-input" rows="2" value={paso.salida} onChange={e => editar('salida', e.target.value)} placeholder="¿Qué se hace y qué se obtiene en este paso?"/>
        </label>
      </div>

      {esDecision ? <div className="fl-branches">
        <div className="fl-branch si">
          <span className="cjm-field-label"><CheckCircle2 size={12}/> Si se cumple</span>
          <input className="cjm-input" value={paso.rutaSi} onChange={e => editar('rutaSi', e.target.value)} placeholder="Etiqueta (Ej.: Sí)"/>
          <select className="cjm-input" value={paso.destinoSi} onChange={e => editar('destinoSi', e.target.value)} aria-label="Destino si se cumple">
            <option value="">Continuar al siguiente paso</option><option value="-">Sin salida</option>{opcionesPasos(destinos)}
          </select>
        </div>
        <div className="fl-branch no">
          <span className="cjm-field-label"><XCircle size={12}/> Si no se cumple</span>
          <input className="cjm-input" value={paso.rutaNo} onChange={e => editar('rutaNo', e.target.value)} placeholder="Etiqueta (Ej.: No)"/>
          <select className="cjm-input" value={paso.destinoNo} onChange={e => editar('destinoNo', e.target.value)} aria-label="Destino si no se cumple">
            <option value="">Elegir paso…</option>{opcionesPasos(destinos)}
          </select>
        </div>
      </div> : !esFinal && <label className="cjm-field"><span className="cjm-field-label"><ArrowRight size={12}/> Después de este paso <small>conexión de salida</small></span>
        <select className="cjm-input" value={paso.destino} onChange={e => editar('destino', e.target.value)} aria-label="Continúa en">
          <option value="">Continuar al paso siguiente de la lista</option><option value="-">Sin continuación (termina aquí)</option>{opcionesPasos(destinos)}
        </select>
      </label>}
      {esDecision && <p className="fl-modal-note"><GitFork size={12}/> Las decisiones necesitan dos salidas: «Sí» en verde y «No» en rojo punteado. También puedes crearlas arrastrando desde los puntos del paso en el diagrama.</p>}

      <label className={`fl-critical${paso.critico ? ' active' : ''}`}>
        <input type="checkbox" checked={Boolean(paso.critico)} onChange={e => editar('critico', e.target.checked)}/>
        <AlertTriangle size={15}/><span><strong>Punto crítico o cuello de botella</strong><small>Márcalo si aquí se acumulan demoras, errores o reprocesos.</small></span>
      </label>

      <div className="fl-evid">
        <div className="fl-evid-head">
          <span className="cjm-field-label"><Paperclip size={12}/> Evidencia de este paso <small>{propias.length ? `${propias.length} archivo(s)` : 'formularios, capturas, fotos…'}</small></span>
          <button type="button" className="cjm-btn-outline" onClick={() => inputRef.current?.click()}><Paperclip size={13}/> Adjuntar</button>
          <input ref={inputRef} type="file" multiple accept={DOCUMENTOS_ACEPTADOS} hidden onChange={e => { acciones.adjuntarAPaso(paso.id, e.target.files); e.target.value = ''; }}/>
        </div>
        {propias.length > 0 && <ul className="fl-evid-list">{propias.map(documento => <li key={documento.id}>
          <span title={documento.nombre}>{documento.nombre}</span>
          <button type="button" className="cjm-btn-icon" onClick={() => abrirDocumento(documento)} title="Abrir" aria-label={`Abrir ${documento.nombre}`}><ExternalLink size={13}/></button>
          <button type="button" className="cjm-btn-icon" onClick={() => acciones.desvincularDocumento(documento.id)} title="Quitar de este paso (sigue en la evidencia general)" aria-label={`Desvincular ${documento.nombre}`}><Link2Off size={13}/></button>
        </li>)}</ul>}
      </div>
    </div>
  </VentanaModal>;
}
