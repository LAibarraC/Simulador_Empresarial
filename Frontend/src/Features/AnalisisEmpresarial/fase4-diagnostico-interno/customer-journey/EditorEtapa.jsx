import { AlertOctagon, ArrowLeftRight, Check, ChevronLeft, ChevronRight, HeartPulse, Lightbulb, MessageCircle, MousePointerClick, PencilLine, Radio, Trash2 } from 'lucide-react';
import { CANALES, EMOCIONES, PRIORIDADES } from './calculosJourney';
import IconoEmocion from './IconoEmocion';
import VentanaModal from '../../compartido/modales/VentanaModal';

function Campo({ icono, titulo, ayuda, tono = '', children }) {
  const Icono = icono;
  return <label className={`cjm-field ${tono}`}>
    <span className="cjm-field-label"><Icono size={13}/> {titulo}{ayuda && <small>{ayuda}</small>}</span>
    {children}
  </label>;
}

/**
 * Modal de edición de una etapa: emoción, acciones, contacto, pensamiento, fricción y mejora.
 * Permite pasar a la etapa anterior/siguiente sin cerrar, reordenarla o eliminarla.
 */
export default function EditorEtapa({ etapa, indice, total, color, cliente, acciones, onNavegar, onCerrar }) {
  if (!etapa) return null;
  const editar = (campo, valor) => acciones.editarEtapa(etapa.id, campo, valor);

  return <VentanaModal abierto onCerrar={onCerrar} icono={PencilLine} acento={color} ancho={760}
    titulo={`Etapa ${indice + 1} de ${total} · ${etapa.nombre || 'Sin nombre'}`}
    subtitulo={cliente ? `Recorrido de ${cliente}` : undefined}
    pie={<>
      <div className="cjm-modal-foot-group">
        <button type="button" className="cjm-btn-icon" onClick={() => onNavegar(-1)} disabled={indice === 0} title="Etapa anterior" aria-label="Etapa anterior"><ChevronLeft size={16}/></button>
        <span className="cjm-step-dots" aria-hidden="true">{Array.from({ length: total }, (_, i) => <i key={i} className={i === indice ? 'on' : ''}/>)}</span>
        <button type="button" className="cjm-btn-icon" onClick={() => onNavegar(1)} disabled={indice === total - 1} title="Etapa siguiente" aria-label="Etapa siguiente"><ChevronRight size={16}/></button>
      </div>
      <div className="cjm-modal-foot-group">
        <button type="button" className="cjm-btn-icon danger" onClick={() => acciones.eliminarEtapa(etapa.id)} title="Eliminar etapa" aria-label="Eliminar etapa"><Trash2 size={15}/></button>
        <button type="button" className="cjm-btn-add" onClick={onCerrar}><Check size={14}/> Listo</button>
      </div>
    </>}>
    <div className="cjm-editor">
      <div className="cjm-editor-head">
        <label className="cjm-field cjm-editor-title">
          <span className="cjm-field-label">Nombre de la etapa</span>
          <input className="cjm-input" value={etapa.nombre} onChange={e => editar('nombre', e.target.value)} placeholder="Nombre de la etapa" maxLength={40}/>
        </label>
        <div className="cjm-field">
          <span className="cjm-field-label"><ArrowLeftRight size={13}/> Posición</span>
          <div className="cjm-editor-actions">
            <button type="button" className="cjm-btn-icon" onClick={() => acciones.moverEtapa(etapa.id, -1)} disabled={indice === 0} title="Mover a la izquierda" aria-label="Mover etapa a la izquierda"><ChevronLeft size={16}/></button>
            <button type="button" className="cjm-btn-icon" onClick={() => acciones.moverEtapa(etapa.id, 1)} disabled={indice === total - 1} title="Mover a la derecha" aria-label="Mover etapa a la derecha"><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>

      <div className="cjm-emotion-picker" role="radiogroup" aria-label="Emoción del cliente">
        <span className="cjm-field-label"><HeartPulse size={13}/> ¿Cómo se siente el cliente en esta etapa?</span>
        <div>
          {EMOCIONES.map(item => <button type="button" key={item.valor} role="radio" aria-checked={etapa.emocion === item.valor}
            className={`cjm-btn-emotion${etapa.emocion === item.valor ? ' active' : ''}`} style={{ '--cjm-emo': item.color, '--cjm-emo-bg': item.fondo }}
            onClick={() => editar('emocion', etapa.emocion === item.valor ? null : item.valor)}>
            <IconoEmocion valor={item.valor} size={38}/><small>{item.nombre}</small>
          </button>)}
        </div>
      </div>

      <div className="cjm-editor-grid">
        <Campo icono={MousePointerClick} titulo="Acción del cliente" ayuda="Qué intenta hacer">
          <textarea className="cjm-input" rows="2" value={etapa.accion} onChange={e => editar('accion', e.target.value)} placeholder="Ej.: Busca opiniones del producto en redes sociales"/>
        </Campo>
        <Campo icono={Radio} titulo="Punto de contacto" ayuda="Canal y medio">
          <div className="cjm-inline">
            <select className="cjm-input" value={etapa.canal} onChange={e => editar('canal', e.target.value)} aria-label="Canal">
              <option value="">Canal…</option>{CANALES.map(canal => <option key={canal} value={canal}>{canal}</option>)}
            </select>
            <input className="cjm-input" value={etapa.contacto} onChange={e => editar('contacto', e.target.value)} placeholder="Ej.: Perfil de Instagram" aria-label="Detalle del punto de contacto"/>
          </div>
        </Campo>
        <Campo icono={MessageCircle} titulo="Pensamiento" ayuda="Qué piensa o dice">
          <textarea className="cjm-input" rows="2" value={etapa.pensamiento} onChange={e => editar('pensamiento', e.target.value)} placeholder="Ej.: «¿Será confiable esta marca?»"/>
        </Campo>
        <Campo icono={AlertOctagon} titulo="Fricción" ayuda="Qué le molesta o falta" tono="dolor">
          <textarea className="cjm-input" rows="2" value={etapa.dolor} onChange={e => editar('dolor', e.target.value)} placeholder="Ej.: No encuentra precios claros"/>
        </Campo>
        <Campo icono={Lightbulb} titulo="Oportunidad de mejora" ayuda="Acción concreta" tono="oportunidad">
          <textarea className="cjm-input" rows="2" value={etapa.oportunidad} onChange={e => editar('oportunidad', e.target.value)} placeholder="Ej.: Publicar catálogo con precios y reseñas verificadas"/>
        </Campo>
        <div className="cjm-field">
          <span className="cjm-field-label"><Lightbulb size={13}/> Prioridad de la mejora</span>
          <div className="cjm-segmented" role="group" aria-label="Prioridad">
            {PRIORIDADES.map(item => <button type="button" key={item.id} className={`cjm-btn-segment ${item.id}${etapa.prioridad === item.id ? ' active' : ''}`} aria-pressed={etapa.prioridad === item.id}
              onClick={() => editar('prioridad', etapa.prioridad === item.id ? '' : item.id)}>{item.nombre}</button>)}
          </div>
        </div>
      </div>
    </div>
  </VentanaModal>;
}
