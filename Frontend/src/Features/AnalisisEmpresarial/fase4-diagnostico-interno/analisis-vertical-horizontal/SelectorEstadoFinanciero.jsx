import { ESTADOS } from './calculosFinancieros';

export default function SelectorEstadoFinanciero({ estadoActivo, onCambio, filas }) {
  return <div className="avh-segmented" role="group" aria-label="Estado financiero">
    {ESTADOS.map(estado => <button type="button" key={estado.id} className={`avh-btn-segment${estadoActivo === estado.id ? ' active' : ''}`} aria-pressed={estadoActivo === estado.id} onClick={() => onCambio(estado.id)}>
      {estado.nombre}<span className="avh-count">{filas.filter(fila => fila.estado === estado.id).length}</span>
    </button>)}
  </div>;
}
