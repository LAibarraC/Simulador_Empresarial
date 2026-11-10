import { Star } from 'lucide-react';

/** Potencial de 1 a 5 estrellas: de solo lectura, o editable si recibe `onCambiar`. */
export default function EstrellasPotencial({ valor, onCambiar }) {
  return <span className="f6-stars" role={onCambiar ? 'radiogroup' : undefined} aria-label="Potencial">
    {[1, 2, 3, 4, 5].map(n => onCambiar
      ? <button type="button" key={n} role="radio" aria-checked={Number(valor) === n} className={`f6-btn-star${n <= valor ? ' on' : ''}`} onClick={() => onCambiar(n)} title={`Potencial ${n} de 5`}><Star size={16}/></button>
      : <Star key={n} size={11} className={n <= valor ? 'on' : ''}/>)}
  </span>;
}
