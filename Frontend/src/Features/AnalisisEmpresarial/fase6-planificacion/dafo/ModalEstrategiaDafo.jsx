import { useState } from 'react';
import { Check, Flag, PencilLine, Plus, Target, Trash2 } from 'lucide-react';
import VentanaModal from '../../compartido/modales/VentanaModal';
import { LETRAS_FODA, PLAZOS, PRIORIDADES, obtenerCuadranteDafo } from '../calculosPlanificacion';

const colorLetra = id => LETRAS_FODA.find(l => l.id === id)?.color;

/**
 * Formulario de una estrategia DAFO dentro de un modal.
 * - Nueva: trabaja con un borrador y se guarda con «Crear estrategia».
 * - Editar: cada cambio se guarda al instante; desde aquí también se puede eliminar.
 */
function Formulario({ estrategia, cuadrante, inicial, factores, onCrear, onEditar, onEliminar, onCerrar }) {
  const esNueva = !estrategia;
  const [borrador, setBorrador] = useState(() => ({ texto: '', factores: [], prioridad: 'media', plazo: 'mediano', responsable: '', indicador: '', ...(inicial || {}) }));
  const valores = esNueva ? borrador : estrategia;
  const cambiar = cambios => (esNueva ? setBorrador(previo => ({ ...previo, ...cambios })) : onEditar(cambios));
  const c = obtenerCuadranteDafo(esNueva ? cuadrante : estrategia.cuadrante);
  const alternar = id => cambiar({ factores: valores.factores.includes(id) ? valores.factores.filter(f => f !== id) : [...valores.factores, id] });
  const crear = evento => { evento.preventDefault(); onCrear({ ...borrador, texto: borrador.texto.trim() }); };

  return <VentanaModal abierto onCerrar={onCerrar} icono={esNueva ? Plus : PencilLine} acento={c.color} ancho={720}
    titulo={`${esNueva ? 'Nueva estrategia' : 'Editar estrategia'} ${c.nombre.toLowerCase()} (${c.id})`}
    subtitulo={`${c.alias} · ${c.verbo}`}
    pie={esNueva ? <>
      <button type="button" className="cjm-btn-outline" onClick={onCerrar}>Cancelar</button>
      <button type="submit" form="f6-form-estrategia" className="cjm-btn-add"><Plus size={14}/> Crear estrategia</button>
    </> : <>
      <div className="cjm-modal-foot-group">
        <button type="button" className="cjm-btn-icon danger" onClick={onEliminar} title="Eliminar estrategia" aria-label="Eliminar estrategia"><Trash2 size={15}/></button>
      </div>
      <div className="cjm-modal-foot-group">
        <button type="button" className="cjm-btn-add" onClick={onCerrar}><Check size={14}/> Listo</button>
      </div>
    </>}>
    <form id="f6-form-estrategia" className="f6-modal-form" onSubmit={crear}>
      <label className="hf-field"><span className="hf-field-label"><Target size={12}/> Estrategia <small>verbo en infinitivo + qué + para qué</small></span>
        <textarea className="hf-input" rows="3" value={valores.texto} onChange={e => cambiar({ texto: e.target.value })} placeholder={c.plantilla('una fortaleza', 'una oportunidad')}/>
      </label>
      <div className="f6-editor-factors">
        {[c.interno, c.externo].map(letra => <div key={letra}>
          <span className="hf-field-label" style={{ color: colorLetra(letra) }}>{LETRAS_FODA.find(l => l.id === letra).nombre} que combina</span>
          <div className="f6-chips">{factores[letra].length
            ? factores[letra].map(f => <button type="button" key={f.id} className={`f6-chip${valores.factores.includes(f.id) ? ' active' : ''}`} style={{ '--f6-c': colorLetra(f.letra) }} title={f.texto} onClick={() => alternar(f.id)} aria-pressed={valores.factores.includes(f.id)}>
              <b>{f.codigo}</b><span>{f.texto}</span>
            </button>)
            : <span className="hf-muted">Sin factores en el FODA.</span>}</div>
        </div>)}
      </div>
      <div className="f6-editor-grid">
        <div className="hf-field"><span className="hf-field-label"><Flag size={12}/> Prioridad</span>
          <div className="hf-segmented">{PRIORIDADES.map(p => <button type="button" key={p.id} className={`hf-btn-segment f6-seg-${p.id}${valores.prioridad === p.id ? ' active' : ''}`} onClick={() => cambiar({ prioridad: p.id })}>{p.nombre}</button>)}</div>
        </div>
        <div className="hf-field"><span className="hf-field-label">Plazo</span>
          <div className="hf-segmented">{PLAZOS.map(p => <button type="button" key={p.id} title={p.detalle} className={`hf-btn-segment${valores.plazo === p.id ? ' active' : ''}`} onClick={() => cambiar({ plazo: p.id })}>{p.nombre.replace(' plazo', '')}</button>)}</div>
        </div>
        <label className="hf-field"><span className="hf-field-label">Responsable</span><input className="hf-input" value={valores.responsable} onChange={e => cambiar({ responsable: e.target.value })} placeholder="Ej.: Gerencia comercial"/></label>
        <label className="hf-field"><span className="hf-field-label">Indicador de éxito</span><input className="hf-input" value={valores.indicador} onChange={e => cambiar({ indicador: e.target.value })} placeholder="Ej.: +15% de ventas en 6 meses"/></label>
      </div>
    </form>
  </VentanaModal>;
}

/** Modal para crear o editar una estrategia de la Matriz DAFO. */
export default function ModalEstrategiaDafo({ abierto, ...props }) {
  return abierto ? <Formulario {...props}/> : null;
}
