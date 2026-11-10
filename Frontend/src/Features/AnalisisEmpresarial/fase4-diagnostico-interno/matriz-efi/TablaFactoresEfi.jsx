import { Minus, Paperclip, Pencil, Plus, Trash2 } from 'lucide-react';
import { AREAS_FUNCIONALES, ESCALA_RATING_EFI, calcularPuntajePonderadoEfi } from './calculosEfi';

const OPCIONES = { Fortaleza: [3, 4], Debilidad: [1, 2] };
const redondear = valor => Math.round(Math.min(1, Math.max(0, valor)) * 100) / 100;

/** Tabla de un tipo de factor (fortalezas o debilidades) con calificación y peso editables en la fila. */
export default function TablaFactoresEfi({ tipo, titulo, ayuda, icono, factores, subtotal, onEditar, onAbrir, onEliminar, onAgregar }) {
  const Icono = icono;
  const clase = tipo === 'Fortaleza' ? 'f' : 'd';
  return <section className={`efi-table-card ${clase}`} aria-label={titulo}>
    <header>
      <span className="efi-table-icon"><Icono size={17}/></span>
      <div><h3>{titulo} <small>({factores.length})</small></h3><p>{ayuda}</p></div>
      <div className="efi-table-sum" title="Suma de peso × calificación de este grupo"><small>Aporte</small><strong>{subtotal.toFixed(2)}</strong></div>
      <button type="button" className={`efi-btn-add ${clase}`} onClick={onAgregar}><Plus size={14}/> Añadir {tipo.toLowerCase()}</button>
    </header>

    {factores.length > 0 && <div className="efi-rows" role="table" aria-label={titulo}>
      <div className="efi-row head" role="row">
        <span>Cód.</span><span>Factor</span><span title="Calificación de Fred R. David">Calificación</span><span title="Importancia del factor; todos deben sumar 1,00">Peso</span><span title="Peso × calificación">Ponderado</span><span/>
      </div>
      {factores.map(factor => {
        const conocida = AREAS_FUNCIONALES.find(item => item.nombre === factor.area || item.id === factor.area);
        const area = conocida || { nombre: factor.area?.trim() || 'Otra área', color: '#64748b' };
        const peso = Number(factor.peso) || 0;
        const evidencias = (factor.evidencias || []).length;
        const fuera = !OPCIONES[factor.tipo].includes(Number(factor.calificacion));
        return <div className="efi-row" role="row" key={factor.id}>
          <span className={`efi-code ${clase}`}>{factor.codigo}</span>
          <div className="efi-row-main">
            <button type="button" className="efi-btn-title" onClick={() => onAbrir(factor.id)} title="Editar el factor">{factor.titulo?.trim() || <em>Sin descripción · haz clic para escribirla</em>}</button>
            <span className="efi-row-meta"><i className="efi-area-chip" style={{ '--efi-area': area.color }}>{area.nombre}</i>{factor.descripcion?.trim() && <small title={factor.descripcion}>{factor.descripcion}</small>}</span>
          </div>
          <div className="efi-rating" role="radiogroup" aria-label={`Calificación de ${factor.codigo}`}>
            {[...OPCIONES[factor.tipo]].reverse().map(valor => { const escala = ESCALA_RATING_EFI[valor]; const activo = Number(factor.calificacion) === valor; return <button type="button" key={valor} role="radio" aria-checked={activo}
              className={`efi-btn-rating${activo ? ' active' : ''}`} style={{ '--efi-r': escala.color }} onClick={() => onEditar(factor.id, { calificacion: valor })} title={`${escala.label}: ${escala.descripcion}`}>
              <b>{valor}</b><span>{escala.labelCorto.split(' ')[1]}</span>
            </button>; })}
            {fuera && <small className="efi-rule" role="alert">Fuera de regla</small>}
          </div>
          <div className="efi-weight">
            <button type="button" className="efi-btn-step" onClick={() => onEditar(factor.id, { peso: redondear(peso - 0.01) })} aria-label={`Reducir peso de ${factor.codigo}`}><Minus size={12}/></button>
            <input type="number" min="0" max="1" step="0.01" value={factor.peso} onChange={e => onEditar(factor.id, { peso: e.target.value === '' ? 0 : redondear(Number(e.target.value)) })} aria-label={`Peso de ${factor.codigo}`}/>
            <button type="button" className="efi-btn-step" onClick={() => onEditar(factor.id, { peso: redondear(peso + 0.01) })} aria-label={`Aumentar peso de ${factor.codigo}`}><Plus size={12}/></button>
          </div>
          <strong className={`efi-weighted ${clase}`}>{calcularPuntajePonderadoEfi(factor.peso, factor.calificacion).toFixed(2)}</strong>
          <div className="efi-row-actions">
            {evidencias > 0 && <span className="efi-evid-badge" title={`${evidencias} evidencia(s)`}><Paperclip size={11}/>{evidencias}</span>}
            <button type="button" className="cjm-btn-icon" onClick={() => onAbrir(factor.id)} title="Editar factor" aria-label={`Editar ${factor.codigo}`}><Pencil size={14}/></button>
            <button type="button" className="cjm-btn-icon danger" onClick={() => onEliminar(factor.id)} title="Eliminar factor" aria-label={`Eliminar ${factor.codigo}`}><Trash2 size={14}/></button>
          </div>
        </div>;
      })}
    </div>}
    {!factores.length && <div className="efi-table-empty">
      <p>Aún no hay {titulo.toLowerCase()}.</p>
      <button type="button" className={`efi-btn-add ${clase}`} onClick={onAgregar}><Plus size={14}/> Añadir la primera</button>
    </div>}
  </section>;
}
