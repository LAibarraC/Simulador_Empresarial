import { Pencil, Trash2, UserPlus, Users } from 'lucide-react';
import { MAX_CLIENTES, iniciales } from './calculosJourney';
import IconoEmocion from './IconoEmocion';

/** Barra de clientes: cada tarjeta abre el recorrido de ese cliente; los iconos abren sus modales. */
export default function ClientesJourney({ comparacion, activoId, onSeleccionar, onNuevo, onEditar, onEliminar }) {
  return <section className="cjm-card cjm-clients" aria-label="Clientes analizados">
    <div className="cjm-clients-head">
      <span className="cjm-section-label"><Users size={13}/> Clientes analizados · {comparacion.length}/{MAX_CLIENTES}</span>
      <small className="cjm-muted">Elige un cliente para ver y editar su recorrido.</small>
    </div>
    <div className="cjm-clients-list" role="tablist" aria-label="Clientes">
      {comparacion.map(({ cliente, metricas }) => {
        const activo = cliente.id === activoId;
        const nombre = cliente.persona.nombre || 'Cliente sin nombre';
        return <div key={cliente.id} className={`cjm-client-card${activo ? ' active' : ''}`} style={{ '--cjm-client': cliente.color }}>
          <button type="button" role="tab" aria-selected={activo} className="cjm-btn-client" onClick={() => onSeleccionar(cliente.id)}>
            <span className="cjm-avatar sm" style={{ background: cliente.color }}>{iniciales(cliente.persona.nombre)}</span>
            <span className="cjm-client-text">
              <strong title={nombre}>{nombre}</strong>
              <small>{metricas.etapas} etapas · {metricas.criticas} críticas</small>
            </span>
            <span className="cjm-client-face" title={metricas.promedio ? `Emoción media ${metricas.promedio.toFixed(1)} / 5` : 'Sin emociones'}>
              <IconoEmocion valor={metricas.promedio ? Math.round(metricas.promedio) : null} size={26}/>
            </span>
          </button>
          <div className="cjm-client-actions">
            <button type="button" className="cjm-btn-mini" onClick={() => onEditar(cliente.id)} title={`Editar ${nombre}`} aria-label={`Editar ${nombre}`}><Pencil size={12}/></button>
            <button type="button" className="cjm-btn-mini danger" onClick={() => onEliminar(cliente.id)} title={`Eliminar ${nombre}`} aria-label={`Eliminar ${nombre}`}><Trash2 size={12}/></button>
          </div>
        </div>;
      })}
      {comparacion.length < MAX_CLIENTES && <button type="button" className="cjm-btn-client add" onClick={onNuevo}>
        <span className="cjm-avatar sm add"><UserPlus size={15}/></span>
        <span className="cjm-client-text"><strong>Nuevo cliente</strong><small>Otro segmento o persona</small></span>
      </button>}
    </div>
  </section>;
}
