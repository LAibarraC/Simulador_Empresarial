import { useState } from 'react';
import { ChevronDown, ChevronUp, ListChecks, NotebookPen, WandSparkles } from 'lucide-react';
import { PLANTILLA_CONCLUSION_CJM, obtenerEmocion } from './calculosJourney';
import IconoEmocion from './IconoEmocion';

const VISIBLES_PLAN = 4;

function VerMas({ abierto, ocultos, onCambiar }) {
  if (ocultos <= 0) return null;
  return <button type="button" className="cjm-btn-more" onClick={onCambiar} aria-expanded={abierto}>
    {abierto ? <><ChevronUp size={13}/> Ver menos</> : <><ChevronDown size={13}/> Ver {ocultos} más</>}
  </button>;
}

/** Plan de mejora priorizado y conclusión del recorrido en una sola fila. */
export default function DiagnosticoJourney({ oportunidades, conclusiones, onConclusiones, onSeleccionar, nombreCliente }) {
  const [todoPlan, setTodoPlan] = useState(false);
  const plan = todoPlan ? oportunidades : oportunidades.slice(0, VISIBLES_PLAN);
  const insertarPlantilla = () => onConclusiones(conclusiones.trim() ? `${conclusiones.trim()}\n\n${PLANTILLA_CONCLUSION_CJM}` : PLANTILLA_CONCLUSION_CJM);

  return <section className="cjm-card" aria-label="Diagnóstico de la experiencia">
    <div className="cjm-diag-grid dos">
      <div className="cjm-panel">
        <div className="cjm-panel-head">
          <span className="cjm-section-label"><ListChecks size={13}/> Plan de mejora</span>
          {oportunidades.length > 0 && <span className="cjm-pill">{oportunidades.length} acción(es)</span>}
        </div>
        {oportunidades.length ? <ol className="cjm-plan compact">
          {plan.map(item => {
            const emocion = obtenerEmocion(item.emocion);
            return <li key={item.id}>
              <button type="button" className="cjm-btn-plan" onClick={() => onSeleccionar?.(item.id)} title={`Abrir la etapa ${item.etiqueta}`}>
                <span className="cjm-plan-emo"><IconoEmocion valor={emocion?.valor} size={22}/></span>
                <span className="cjm-plan-text"><small>{item.etiqueta}</small><strong>{item.oportunidad}</strong></span>
                {item.prioridad && <span className={`cjm-priority ${item.prioridad}`}>{item.prioridad}</span>}
              </button>
            </li>;
          })}
        </ol> : <p className="cjm-muted">Las mejoras que propongas en cada etapa aparecerán aquí, ordenadas por prioridad.</p>}
        <VerMas abierto={todoPlan} ocultos={oportunidades.length - VISIBLES_PLAN} onCambiar={() => setTodoPlan(valor => !valor)}/>
      </div>

      <div className="cjm-panel cjm-notes">
        <div className="cjm-panel-head">
          <label htmlFor="cjm-conclusiones" className="cjm-section-label"><NotebookPen size={13}/> Conclusión y propuesta de mejora{nombreCliente ? ` · ${nombreCliente}` : ''}</label>
          <button type="button" className="cjm-btn-ghost" onClick={insertarPlantilla}><WandSparkles size={13}/> Plantilla</button>
        </div>
        <textarea id="cjm-conclusiones" className="cjm-input cjm-textarea" rows="6" value={conclusiones} onChange={e => onConclusiones(e.target.value)} placeholder="¿Cuál es el momento de la verdad del cliente y qué harías primero para mejorarlo?"/>
      </div>
    </div>
  </section>;
}
