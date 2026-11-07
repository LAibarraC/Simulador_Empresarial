import { useState } from 'react';
import { Check, Coins, Link2, PencilLine, Plus, Target, Trash2, TrendingUp } from 'lucide-react';
import VentanaModal from '../../compartido/modales/VentanaModal';
import EstrellasPotencial from './EstrellasPotencial';
import { CUADRANTES_ANSOFF, PLAZOS, atractivoIniciativa, obtenerCuadranteAnsoff } from '../calculosPlanificacion';

/**
 * Formulario de una iniciativa de la Matriz Ansoff dentro de un modal.
 * - Nueva: trabaja con un borrador y se guarda con «Crear iniciativa».
 * - Editar: cada cambio se guarda al instante; desde aquí también se puede eliminar.
 */
function Formulario({ iniciativa, cuadrante, inicial, estrategias, onCrear, onEditar, onEliminar, onCerrar }) {
  const esNueva = !iniciativa;
  const [borrador, setBorrador] = useState(() => ({ cuadrante, nombre: '', descripcion: '', potencial: 3, inversion: '', plazo: 'mediano', estrategiaDafo: '', ...(inicial || {}) }));
  const valores = esNueva ? borrador : iniciativa;
  const cambiar = cambios => (esNueva ? setBorrador(previo => ({ ...previo, ...cambios })) : onEditar(cambios));
  const c = obtenerCuadranteAnsoff(valores.cuadrante);
  const crear = evento => { evento.preventDefault(); onCrear({ ...borrador, nombre: borrador.nombre.trim() }); };

  return <VentanaModal abierto onCerrar={onCerrar} icono={esNueva ? Plus : PencilLine} acento={c.color} ancho={720}
    titulo={esNueva ? 'Nueva iniciativa' : 'Editar iniciativa'} subtitulo={`${c.nombre} · ${c.descripcion}`}
    pie={esNueva ? <>
      <button type="button" className="cjm-btn-outline" onClick={onCerrar}>Cancelar</button>
      <button type="submit" form="f6-form-iniciativa" className="cjm-btn-add"><Plus size={14}/> Crear iniciativa</button>
    </> : <>
      <div className="cjm-modal-foot-group">
        <button type="button" className="cjm-btn-icon danger" onClick={onEliminar} title="Eliminar iniciativa" aria-label="Eliminar iniciativa"><Trash2 size={15}/></button>
      </div>
      <div className="cjm-modal-foot-group">
        <button type="button" className="cjm-btn-add" onClick={onCerrar}><Check size={14}/> Listo</button>
      </div>
    </>}>
    <form id="f6-form-iniciativa" className="f6-modal-form" onSubmit={crear}>
      <div className="f6-editor-grid">
        <label className="hf-field f6-span-2"><span className="hf-field-label"><Target size={12}/> Iniciativa</span>
          <input className="hf-input" value={valores.nombre} onChange={e => cambiar({ nombre: e.target.value })} placeholder="Ej.: Lanzar delivery propio en la zona sur"/>
        </label>
        <label className="hf-field f6-span-2"><span className="hf-field-label">Descripción</span>
          <textarea className="hf-input" rows="2" value={valores.descripcion} onChange={e => cambiar({ descripcion: e.target.value })} placeholder="¿Qué se hará, para quién y cómo?"/>
        </label>
        <div className="hf-field"><span className="hf-field-label"><TrendingUp size={12}/> Potencial de crecimiento</span><EstrellasPotencial valor={Number(valores.potencial) || 0} onCambiar={v => cambiar({ potencial: v })}/></div>
        <label className="hf-field"><span className="hf-field-label"><Coins size={12}/> Inversión estimada (Bs)</span>
          <input className="hf-input hf-num" type="number" min="0" step="any" value={valores.inversion} onChange={e => cambiar({ inversion: e.target.value })} placeholder="0"/>
        </label>
        <div className="hf-field"><span className="hf-field-label">Plazo</span>
          <div className="hf-segmented">{PLAZOS.map(p => <button type="button" key={p.id} title={p.detalle} className={`hf-btn-segment${valores.plazo === p.id ? ' active' : ''}`} onClick={() => cambiar({ plazo: p.id })}>{p.nombre.replace(' plazo', '')}</button>)}</div>
        </div>
        <label className="hf-field"><span className="hf-field-label">Cuadrante</span>
          <select className="hf-input" value={valores.cuadrante} onChange={e => cambiar({ cuadrante: e.target.value })}>{CUADRANTES_ANSOFF.map(q => <option key={q.id} value={q.id}>{q.nombre}</option>)}</select>
        </label>
        <label className="hf-field f6-span-2"><span className="hf-field-label"><Link2 size={12}/> Estrategia DAFO que la justifica</span>
          <select className="hf-input" value={valores.estrategiaDafo} onChange={e => cambiar({ estrategiaDafo: e.target.value })}>
            <option value="">{estrategias.length ? 'Sin vincular' : 'Aún no hay estrategias en la Matriz DAFO'}</option>
            {estrategias.map(e => <option key={e.id} value={e.id}>{e.cuadrante} · {(e.texto || 'Estrategia sin redactar').slice(0, 90)}</option>)}
          </select>
        </label>
      </div>
      <p className="hf-statement">Atractivo calculado: <b>{atractivoIniciativa(valores)}/10</b> (el potencial suma y el riesgo del cuadrante resta).</p>
    </form>
  </VentanaModal>;
}

/** Modal para crear o editar una iniciativa de la Matriz Ansoff. */
export default function ModalIniciativaAnsoff({ abierto, ...props }) {
  return abierto ? <Formulario {...props}/> : null;
}
