import { useState } from 'react';
import { Plus, Workflow } from 'lucide-react';
import VentanaModal from '../../compartido/modales/VentanaModal';
import { TIPOS_PASO } from './calculosFlujo';

const AYUDA_TIPO = { 'Inicio / fin': 'Dónde empieza o termina el proceso', Actividad: 'Una tarea que alguien realiza', 'Decisión': 'Una pregunta con respuesta Sí / No' };

function Formulario({ pasos, responsables, despuesDe, onCrear, onCerrar }) {
  const [tipo, setTipo] = useState('Actividad');
  const [actividad, setActividad] = useState('');
  const [responsable, setResponsable] = useState(() => pasos.find(paso => paso.id === despuesDe)?.responsable || '');
  const [tiempo, setTiempo] = useState('');
  const [posicion, setPosicion] = useState(despuesDe || pasos[pasos.length - 1]?.id || '');
  const crear = evento => { evento.preventDefault(); onCrear({ tipo, actividad: actividad.trim(), responsable: responsable.trim(), tiempo, despuesDe: posicion }); };

  return <VentanaModal abierto onCerrar={onCerrar} icono={Workflow} ancho={560} titulo="Nuevo paso del proceso" subtitulo="Elige qué tipo de paso es y dónde va; luego podrás conectarlo arrastrando."
    pie={<>
      <button type="button" className="cjm-btn-outline" onClick={onCerrar}>Cancelar</button>
      <button type="submit" form="fl-form-nuevo" className="cjm-btn-add"><Plus size={14}/> Crear paso</button>
    </>}>
    <form id="fl-form-nuevo" className="fl-modal-form" onSubmit={crear}>
      <div className="cjm-field">
        <span className="cjm-field-label">Tipo de paso</span>
        <div className="fl-type-cards" role="radiogroup" aria-label="Tipo de paso">
          {TIPOS_PASO.map(item => <button type="button" key={item.id} role="radio" aria-checked={tipo === item.id} className={`fl-btn-typecard ${item.forma}${tipo === item.id ? ' active' : ''}`} onClick={() => setTipo(item.id)}>
            <i aria-hidden="true"/><strong>{item.nombre}</strong><small>{AYUDA_TIPO[item.id]}</small>
          </button>)}
        </div>
      </div>
      <label className="cjm-field"><span className="cjm-field-label">Nombre del paso</span>
        <input className="cjm-input" value={actividad} onChange={e => setActividad(e.target.value)} maxLength={80} placeholder={tipo === 'Decisión' ? '¿Qué se decide? Ej.: ¿Hay stock?' : tipo === 'Inicio / fin' ? 'Ej.: Cliente recibe el pedido' : 'Ej.: Registrar el pedido'}/>
      </label>
      <div className="fl-modal-grid">
        <label className="cjm-field"><span className="cjm-field-label">Responsable <small>define el carril</small></span>
          <input className="cjm-input" list="fl-responsables-nuevo" value={responsable} onChange={e => setResponsable(e.target.value)} placeholder="Ej.: Ventas"/>
          <datalist id="fl-responsables-nuevo">{responsables.map(nombre => <option key={nombre} value={nombre}/>)}</datalist>
        </label>
        <label className="cjm-field"><span className="cjm-field-label">Tiempo estimado <small>minutos</small></span>
          <input className="cjm-input" type="number" min="0" step="any" value={tiempo} onChange={e => setTiempo(e.target.value)} placeholder="0"/>
        </label>
      </div>
      {pasos.length > 0 && <label className="cjm-field"><span className="cjm-field-label">Colocar después de</span>
        <select className="cjm-input" value={posicion} onChange={e => setPosicion(e.target.value)}>
          {pasos.map(item => <option key={item.id} value={item.id}>Paso {item.orden}: {item.actividad || 'Sin nombre'}</option>)}
        </select>
      </label>}
    </form>
  </VentanaModal>;
}

/** Modal para añadir un paso al flujograma. */
export default function ModalNuevoPaso({ abierto, ...props }) {
  return abierto ? <Formulario {...props}/> : null;
}
