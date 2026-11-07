import { useContext } from 'react';
import { ArrowRight, MoveLeft } from 'lucide-react';
import { NavegacionPasos } from './navegacionPasos';

/**
 * Pie de página común de todas las herramientas: «Volver a …» y «Continuar a …».
 * Los textos y destinos vienen del contexto de navegación (herramientas habilitadas del caso);
 * `onAnterior` / `onSiguiente` permiten a una herramienta ejecutar su propia lógica antes de avanzar,
 * y `anterior` / `siguiente` reemplazan el paso entero (por ejemplo, secciones internas de una herramienta).
 */
export default function PieNavegacion({ anterior, siguiente, onAnterior, onSiguiente, centro, claseSiguiente = '', idSiguiente }) {
  const contexto = useContext(NavegacionPasos);
  const atras = anterior || contexto?.anterior;
  const adelante = siguiente || contexto?.siguiente;
  if (!atras && !adelante) return null;
  return <footer className="porter-clean-footer pie-navegacion" data-html2canvas-ignore>
    {atras
      ? <button type="button" className="btn-footer-back" onClick={onAnterior && !anterior ? onAnterior : atras.onClick} title={atras.texto}><MoveLeft size={16}/><span>{atras.texto}</span></button>
      : <span/>}
    {centro || null}
    {adelante
      ? <button type="button" className={`btn-footer-action ${claseSiguiente}`.trim()} onClick={onSiguiente && !siguiente ? onSiguiente : adelante.onClick} title={adelante.texto} id={idSiguiente}><span>{adelante.texto}</span><ArrowRight size={17}/></button>
      : <span/>}
  </footer>;
}
