import { useLayoutEffect, useRef } from 'react';
import { Lightbulb, NotebookPen, WandSparkles } from 'lucide-react';
import { PLANTILLA_CONCLUSION } from './calculosFinancieros';

const PREGUNTAS = [
  '¿Qué cuentas cambiaron más y a qué se debe?',
  '¿La estructura (análisis vertical) se volvió más riesgosa o más sana?',
  '¿El crecimiento de ingresos se convierte en utilidad y en caja?',
  '¿Puede la empresa pagar sus deudas de corto y largo plazo?',
  '¿Qué decisión tomarías y qué indicador medirá su efecto?'
];

/** Ajusta la altura del textarea a su contenido para que nunca muestre barra de scroll. */
function useAlturaAutomatica(ref, valor) {
  useLayoutEffect(() => {
    const campo = ref.current;
    if (!campo) return;
    campo.style.height = 'auto';
    campo.style.height = `${campo.scrollHeight + 2}px`;
  }, [ref, valor]);
}

/** Conclusión del estudiante con plantilla y preguntas guía. */
export default function ConclusionFinanciera({ notas, onNotasChange }) {
  const ref = useRef(null);
  useAlturaAutomatica(ref, notas);
  const usarPlantilla = () => onNotasChange(notas.trim() ? `${notas.trim()}\n\n${PLANTILLA_CONCLUSION}` : PLANTILLA_CONCLUSION);
  const palabras = notas.trim() ? notas.trim().split(/\s+/).length : 0;

  return <section className="avh-card" aria-label="Conclusión y propuesta de mejora">
    <div className="avh-card-head">
      <h3 className="avh-card-title"><NotebookPen size={16}/> Conclusión y propuesta de mejora</h3>
      <button type="button" className="avh-btn-outline" onClick={usarPlantilla}><WandSparkles size={13}/> Insertar plantilla</button>
    </div>
    <p className="avh-card-desc">Explica la situación financiera, sus causas y qué debería hacer la empresa. Apóyate en las preguntas guía.</p>
    <ol className="avh-guide-questions">{PREGUNTAS.map(pregunta => <li key={pregunta}>{pregunta}</li>)}</ol>
    <textarea ref={ref} id="avh-notas" className="avh-input avh-textarea-auto" value={notas} onChange={e => onNotasChange(e.target.value)} rows={6}
      placeholder="Ej.: Las ventas crecieron 20%, pero los costos crecieron más rápido y el margen neto bajó…" aria-label="Conclusión y propuesta de mejora"/>
    <div className="avh-notes-foot"><span><Lightbulb size={12}/> El texto se incluye en el PDF exportado.</span><span>{palabras} {palabras === 1 ? 'palabra' : 'palabras'}</span></div>
  </section>;
}
