import { useState } from 'react';
import { Plus, Route } from 'lucide-react';
import { ETAPAS_PLANTILLA } from './calculosJourney';
import VentanaModal from '../../compartido/modales/VentanaModal';

const SUGERENCIAS = [...ETAPAS_PLANTILLA, 'Entrega', 'Pago', 'Soporte postventa', 'Recomendación'];

function FormularioEtapa({ etapas, color, onCrear, onCerrar }) {
  const [nombre, setNombre] = useState('');
  const usadas = new Set(etapas.map(etapa => etapa.nombre.trim().toLowerCase()));
  const sugerencias = SUGERENCIAS.filter(item => !usadas.has(item.toLowerCase())).slice(0, 7);
  const crear = evento => { evento.preventDefault(); onCrear(nombre); };

  return <VentanaModal abierto onCerrar={onCerrar} icono={Route} acento={color} ancho={480}
    titulo="Nueva etapa del recorrido" subtitulo={`Será la etapa ${etapas.length + 1}. Después completarás lo que hace, piensa y siente el cliente.`}
    pie={<>
      <button type="button" className="cjm-btn-outline" onClick={onCerrar}>Cancelar</button>
      <button type="submit" form="cjm-form-etapa" className="cjm-btn-add"><Plus size={14}/> Crear y completar</button>
    </>}>
    <form id="cjm-form-etapa" className="cjm-modal-form" onSubmit={crear}>
      <label className="cjm-field">
        <span className="cjm-field-label">Nombre de la etapa</span>
        <input className="cjm-input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder={`Etapa ${etapas.length + 1}`} maxLength={40}/>
      </label>
      {sugerencias.length > 0 && <div className="cjm-field">
        <span className="cjm-field-label">Sugerencias</span>
        <div className="cjm-suggestions">{sugerencias.map(item => <button type="button" key={item} className={`cjm-btn-suggest${nombre === item ? ' active' : ''}`} onClick={() => setNombre(item)}>{item}</button>)}</div>
      </div>}
    </form>
  </VentanaModal>;
}

/** Modal para añadir una etapa al recorrido del cliente activo. */
export default function ModalNuevaEtapa({ abierto, ...props }) {
  return abierto ? <FormularioEtapa {...props}/> : null;
}
