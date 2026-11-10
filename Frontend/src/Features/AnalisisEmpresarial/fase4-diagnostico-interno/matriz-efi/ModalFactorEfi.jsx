import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Minus, PencilLine, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import VentanaModal from '../../compartido/modales/VentanaModal';
import EvidenciasEfi from './EvidenciasEfi';
import { AREAS_FUNCIONALES, ESCALA_RATING_EFI, calcularPuntajePonderadoEfi } from './calculosEfi';

const OPCIONES = { Fortaleza: [4, 3], Debilidad: [2, 1] };
const COLOR = { Fortaleza: '#10b981', Debilidad: '#ef4444' };
const redondear = valor => Math.round(Math.min(1, Math.max(0, valor)) * 100) / 100;

/**
 * Modal para crear o editar un factor interno.
 * - Nuevo: trabaja con un borrador y se guarda con «Crear factor».
 * - Editar: cada cambio se guarda al instante; permite pasar al factor anterior o siguiente y adjuntar evidencia.
 */
function Formulario({ factor, tipoInicial, areaInicial, factores, onCrear, onEditar, onEliminar, onNavegar, onCerrar }) {
  const esNuevo = !factor;
  const [borrador, setBorrador] = useState(() => ({
    tipo: tipoInicial, area: areaInicial, titulo: '', descripcion: '', peso: 0.05, calificacion: OPCIONES[tipoInicial][1]
  }));
  const [intentado, setIntentado] = useState(false);
  const [otraArea, setOtraArea] = useState(() => Boolean(factor?.area) && !AREAS_FUNCIONALES.some(item => item.nombre === factor.area));
  const valores = esNuevo ? borrador : factor;
  const cambiar = cambios => (esNuevo ? setBorrador(previo => ({ ...previo, ...cambios })) : onEditar(factor.id, cambios));
  const tipo = valores.tipo;
  const color = COLOR[tipo];
  const peso = Number(valores.peso) || 0;
  const ponderado = calcularPuntajePonderadoEfi(valores.peso, valores.calificacion);
  const sinTitulo = !String(valores.titulo || '').trim();
  const sinArea = otraArea && !String(valores.area || '').trim();
  const OTRO = '__otro__';
  const indice = esNuevo ? -1 : factores.findIndex(item => item.id === factor.id);

  const cambiarTipo = nuevoTipo => cambiar({ tipo: nuevoTipo, calificacion: OPCIONES[nuevoTipo][1] });
  const crear = evento => {
    evento.preventDefault();
    setIntentado(true);
    if (sinTitulo || sinArea) return;
    onCrear({ ...borrador, titulo: borrador.titulo.trim(), area: borrador.area.trim() });
  };

  return <VentanaModal abierto onCerrar={onCerrar} icono={esNuevo ? Plus : PencilLine} acento={color} ancho={620}
    titulo={esNuevo ? `Nueva ${tipo === 'Fortaleza' ? 'fortaleza' : 'debilidad'}` : `${factor.codigo} · ${tipo === 'Fortaleza' ? 'Fortaleza' : 'Debilidad'} interna`}
    subtitulo={esNuevo ? 'Describe el factor, califícalo y dale un peso. Podrás ajustarlo después en la tabla.' : 'Los cambios se guardan al instante.'}
    pie={esNuevo ? <>
      <button type="button" className="cjm-btn-outline" onClick={onCerrar}>Cancelar</button>
      <button type="submit" form="efi-form-factor" className="cjm-btn-add"><Plus size={14}/> Crear factor</button>
    </> : <>
      <div className="cjm-modal-foot-group">
        <button type="button" className="cjm-btn-icon" onClick={() => onNavegar(-1)} disabled={indice <= 0} title="Factor anterior" aria-label="Factor anterior"><ChevronLeft size={16}/></button>
        <span className="efi-modal-count">{indice + 1} de {factores.length}</span>
        <button type="button" className="cjm-btn-icon" onClick={() => onNavegar(1)} disabled={indice >= factores.length - 1} title="Factor siguiente" aria-label="Factor siguiente"><ChevronRight size={16}/></button>
      </div>
      <div className="cjm-modal-foot-group">
        <button type="button" className="cjm-btn-icon danger" onClick={() => onEliminar(factor.id)} title="Eliminar factor" aria-label="Eliminar factor"><Trash2 size={15}/></button>
        <button type="button" className="cjm-btn-add" onClick={onCerrar}><Check size={14}/> Listo</button>
      </div>
    </>}>
    <form id="efi-form-factor" className="efi-modal-form" onSubmit={crear} noValidate>
      {esNuevo && <div className="cjm-field">
        <span className="cjm-field-label">¿Qué tipo de factor es?</span>
        <div className="efi-type-cards" role="radiogroup" aria-label="Tipo de factor">
          {[['Fortaleza', TrendingUp, 'Algo que la empresa hace bien'], ['Debilidad', TrendingDown, 'Algo que debe corregir']].map(([nombre, icono, ayuda]) => { const Icono = icono; return <button type="button" key={nombre} role="radio" aria-checked={tipo === nombre}
            className={`efi-btn-typecard ${nombre === 'Fortaleza' ? 'f' : 'd'}${tipo === nombre ? ' active' : ''}`} onClick={() => cambiarTipo(nombre)}>
            <Icono size={20}/><strong>{nombre}</strong><small>{ayuda}</small>
          </button>; })}
        </div>
      </div>}

      <label className="cjm-field">
        <span className="cjm-field-label">Factor interno <b className="cjm-req">*</b></span>
        <textarea className={`cjm-input${intentado && sinTitulo ? ' invalid' : ''}`} rows="2" value={valores.titulo} onChange={e => cambiar({ titulo: e.target.value })}
          placeholder={tipo === 'Fortaleza' ? 'Ej.: Personal con más de 5 años de experiencia' : 'Ej.: No existe un sistema de control de inventarios'} maxLength={160}/>
        {intentado && sinTitulo && <small className="cjm-error">Escribe el factor para poder crearlo.</small>}
      </label>

      <div className="efi-modal-grid">
        <label className="cjm-field"><span className="cjm-field-label">Área de la empresa</span>
          <select className="cjm-input" value={otraArea ? OTRO : valores.area} onChange={e => {
            if (e.target.value === OTRO) { setOtraArea(true); cambiar({ area: '' }); } else { setOtraArea(false); cambiar({ area: e.target.value }); }
          }}>{AREAS_FUNCIONALES.map(area => <option key={area.id} value={area.nombre}>{area.nombre}</option>)}<option value={OTRO}>Otro…</option></select>
          {otraArea && <>
            <input className={`cjm-input${intentado && sinArea ? ' invalid' : ''}`} value={valores.area} onChange={e => cambiar({ area: e.target.value })} placeholder="Escribe el nombre del área" maxLength={50} aria-label="Nombre del área" autoFocus/>
            {intentado && sinArea && <small className="cjm-error">Escribe el nombre del área.</small>}
          </>}
        </label>
        <label className="cjm-field"><span className="cjm-field-label">Dato que lo respalda <small>opcional</small></span>
          <input className="cjm-input" value={valores.descripcion || ''} onChange={e => cambiar({ descripcion: e.target.value })} placeholder="Ej.: Rotación anual del 4%" maxLength={160}/>
        </label>
      </div>

      <div className="cjm-field">
        <span className="cjm-field-label">Calificación <small>{tipo === 'Fortaleza' ? 'las fortalezas valen 3 o 4' : 'las debilidades valen 1 o 2'}</small></span>
        <div className="efi-rate-cards" role="radiogroup" aria-label="Calificación">
          {OPCIONES[tipo].map(valor => { const escala = ESCALA_RATING_EFI[valor]; const activo = Number(valores.calificacion) === valor; return <button type="button" key={valor} role="radio" aria-checked={activo}
            className={`efi-btn-ratecard${activo ? ' active' : ''}`} style={{ '--efi-r': escala.color }} onClick={() => cambiar({ calificacion: valor })}>
            <b>{valor}</b><span><strong>{escala.labelCorto}</strong><small>{escala.descripcion}</small></span>
          </button>; })}
        </div>
      </div>

      <div className="cjm-field">
        <span className="cjm-field-label">Peso <small>qué tan importante es (entre 0 y 1)</small></span>
        <div className="efi-weight-box">
          <button type="button" className="cjm-btn-icon" onClick={() => cambiar({ peso: redondear(peso - 0.01) })} aria-label="Reducir peso"><Minus size={14}/></button>
          <input className="cjm-input efi-weight-input" type="number" min="0" max="1" step="0.01" value={valores.peso} onChange={e => cambiar({ peso: e.target.value === '' ? 0 : redondear(Number(e.target.value)) })} aria-label="Peso"/>
          <button type="button" className="cjm-btn-icon" onClick={() => cambiar({ peso: redondear(peso + 0.01) })} aria-label="Aumentar peso"><Plus size={14}/></button>
          <input className="efi-weight-range" type="range" min="0" max="0.5" step="0.01" value={Math.min(0.5, peso)} onChange={e => cambiar({ peso: Number(e.target.value) })} aria-label="Ajustar peso" style={{ '--efi-r': color }}/>
          <div className="efi-weight-result" style={{ color }}><small>Ponderado</small><strong>{ponderado.toFixed(2)}</strong></div>
        </div>
        <small className="cjm-muted">{(peso * 100).toFixed(0)}% de importancia · ponderado = peso {peso.toFixed(2)} × calificación {valores.calificacion}</small>
      </div>

      {esNuevo
        ? <p className="efi-modal-note">Después de crear el factor podrás adjuntarle evidencia (informes, fotos o enlaces) desde el icono del lápiz.</p>
        : <EvidenciasEfi evidencias={factor.evidencias || []} onCambiar={actualizar => onEditar(factor.id, actual => ({ evidencias: actualizar(actual.evidencias || []) }))}/>}
    </form>
  </VentanaModal>;
}

/** Modal de factor (nuevo o existente). */
export default function ModalFactorEfi({ abierto, ...props }) {
  return abierto ? <Formulario {...props}/> : null;
}
