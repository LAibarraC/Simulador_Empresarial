import { CalendarRange, Coins, Percent } from 'lucide-react';
import { MONEDAS, UMBRAL_MAX, UMBRAL_MIN } from './calculosFinancieros';

export default function ParametrosAnalisis({ contenido, onCambio }) {
  const { periodoAnterior, periodoActual, moneda, umbralEntrada } = contenido;
  return <div className="avh-params" role="group" aria-label="Parámetros del análisis">
    <label className="avh-field"><span><CalendarRange size={12}/> Periodo base</span>
      <input className="avh-input" value={periodoAnterior} maxLength={30} onChange={e => onCambio({ periodoAnterior: e.target.value })} placeholder="Ej.: Gestión 2024"/>
    </label>
    <label className="avh-field"><span><CalendarRange size={12}/> Periodo de análisis</span>
      <input className="avh-input" value={periodoActual} maxLength={30} onChange={e => onCambio({ periodoActual: e.target.value })} placeholder="Ej.: Gestión 2025"/>
    </label>
    <label className="avh-field avh-field-sm"><span><Coins size={12}/> Moneda</span>
      <select className="avh-input" value={moneda} onChange={e => onCambio({ moneda: e.target.value })}>{MONEDAS.map(codigo => <option key={codigo} value={codigo}>{codigo}</option>)}</select>
    </label>
    <label className="avh-field avh-field-sm" title="Las variaciones que superen este porcentaje se marcan como relevantes"><span><Percent size={12}/> Var. relevante</span>
      <input className="avh-input" type="number" min={UMBRAL_MIN} max={UMBRAL_MAX} step="1" value={umbralEntrada} onChange={e => onCambio({ umbral: e.target.value })}/>
    </label>
  </div>;
}
