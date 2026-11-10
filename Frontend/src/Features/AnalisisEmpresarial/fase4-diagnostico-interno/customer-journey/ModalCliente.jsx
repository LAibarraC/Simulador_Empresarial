import { useState } from 'react';
import { Check, Save, UserPlus, UserRoundPen } from 'lucide-react';
import { COLORES_CLIENTE, ETAPAS_PLANTILLA, iniciales } from './calculosJourney';
import VentanaModal from '../../compartido/modales/VentanaModal';

const CAMPOS = [
  { id: 'perfil', titulo: 'Perfil', ayuda: 'Quién es y qué valora', placeholder: 'Ej.: Compra en línea, valora rapidez y buen precio' },
  { id: 'objetivo', titulo: 'Objetivo', ayuda: 'Qué quiere lograr', placeholder: 'Ej.: Abastecer su negocio sin perder tiempo' },
  { id: 'escenario', titulo: 'Escenario', ayuda: 'Situación que se analiza', placeholder: 'Ej.: Primera compra mayorista desde el celular' }
];

/** Formulario interno: se monta de nuevo cada vez que se abre, así parte de los datos actuales. */
function FormularioCliente({ cliente, colorSugerido, onGuardar, onCerrar }) {
  const esNuevo = !cliente;
  const [persona, setPersona] = useState(() => ({ nombre: '', perfil: '', objetivo: '', escenario: '', ...(cliente?.persona || {}) }));
  const [color, setColor] = useState(cliente?.color || colorSugerido || COLORES_CLIENTE[0]);
  const [conPlantilla, setConPlantilla] = useState(true);
  const [intentado, setIntentado] = useState(false);
  const cambiar = (campo, valor) => setPersona(previo => ({ ...previo, [campo]: valor }));
  const valido = persona.nombre.trim().length > 0;

  const guardar = evento => {
    evento.preventDefault();
    setIntentado(true);
    if (!valido) return;
    onGuardar({ persona: { ...persona, nombre: persona.nombre.trim() }, color, conPlantilla: esNuevo && conPlantilla });
  };

  return <VentanaModal abierto onCerrar={onCerrar} icono={esNuevo ? UserPlus : UserRoundPen} acento={color}
    titulo={esNuevo ? 'Nuevo cliente' : 'Editar cliente'}
    subtitulo={esNuevo ? 'Cada cliente o segmento tiene su propio recorrido y diagnóstico.' : 'Actualiza el perfil del cliente que protagoniza este recorrido.'}
    pie={<>
      <button type="button" className="cjm-btn-outline" onClick={onCerrar}>Cancelar</button>
      <button type="submit" form="cjm-form-cliente" className="cjm-btn-add">{esNuevo ? <><UserPlus size={14}/> Crear cliente</> : <><Save size={14}/> Guardar cambios</>}</button>
    </>}>
    <form id="cjm-form-cliente" className="cjm-modal-form" onSubmit={guardar} noValidate>
      <div className="cjm-modal-persona">
        <span className="cjm-avatar lg" style={{ background: color }}>{iniciales(persona.nombre)}</span>
        <label className="cjm-field">
          <span className="cjm-field-label">Nombre del cliente o segmento <b className="cjm-req">*</b></span>
          <input className={`cjm-input${intentado && !valido ? ' invalid' : ''}`} value={persona.nombre} onChange={e => cambiar('nombre', e.target.value)} placeholder="Ej.: María, emprendedora de 32 años" maxLength={60}/>
          {intentado && !valido && <small className="cjm-error">Escribe un nombre para identificar al cliente.</small>}
        </label>
      </div>
      <div className="cjm-field">
        <span className="cjm-field-label">Color en el mapa</span>
        <div className="cjm-swatches" role="radiogroup" aria-label="Color del cliente">
          {COLORES_CLIENTE.map(opcion => <button type="button" key={opcion} role="radio" aria-checked={color === opcion} aria-label={`Color ${opcion}`}
            className={`cjm-btn-swatch${color === opcion ? ' active' : ''}`} style={{ background: opcion }} onClick={() => setColor(opcion)}>{color === opcion && <Check size={13}/>}</button>)}
        </div>
      </div>
      {CAMPOS.map(campo => <label key={campo.id} className="cjm-field">
        <span className="cjm-field-label">{campo.titulo}<small>{campo.ayuda}</small></span>
        <textarea className="cjm-input" rows="2" value={persona[campo.id]} onChange={e => cambiar(campo.id, e.target.value)} placeholder={campo.placeholder} maxLength={160}/>
      </label>)}
      {esNuevo && <label className="cjm-check">
        <input type="checkbox" checked={conPlantilla} onChange={e => setConPlantilla(e.target.checked)}/>
        <span><strong>Empezar con las etapas clásicas</strong><small>{ETAPAS_PLANTILLA.join(' → ')}</small></span>
      </label>}
    </form>
  </VentanaModal>;
}

/** Modal para crear o editar un cliente (persona) del journey. */
export default function ModalCliente({ abierto, ...props }) {
  return abierto ? <FormularioCliente {...props}/> : null;
}
