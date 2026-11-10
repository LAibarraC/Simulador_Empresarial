import { memo, useCallback, useMemo } from 'react';
import { CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { ICONOS_HERRAMIENTAS as I } from '../simulacion/iconosHerramientas';
import { DEPENDENCIAS_HERRAMIENTA, IDS_FASE3, IDS_FASE4, NOMBRES_HERRAMIENTAS, TODAS_LAS_HERRAMIENTAS, normalizarHerramientas } from './herramientasCaso';
import './SelectorHerramientasCaso.css';

/** Catálogo del selector: herramientas de las fases 3 a 6 y de qué fase dependen los reportes. */
const GRUPOS = [
  { fase: 3, titulo: 'Diagnóstico externo', color: '#3b82f6', items: [
    { id: 'pestel', nombre: 'Análisis PESTEL', foco: 'Macroentorno', icono: I.pestel },
    { id: 'poam', nombre: 'Matriz POAM', foco: 'Oportunidades y amenazas', icono: I.poam },
    { id: 'porter', nombre: '5 Fuerzas de Porter', foco: 'Microentorno', icono: I.porter },
    { id: 'mpc', nombre: 'Perfil Competitivo (MPC)', foco: 'Competidores', icono: I.mpc }
  ] },
  { fase: 4, titulo: 'Diagnóstico interno', color: '#f97316', items: [
    { id: 'interno-vertical-horizontal', nombre: 'Análisis vertical y horizontal', foco: 'Finanzas', icono: I['interno-vertical-horizontal'] },
    { id: 'customer-journey', nombre: 'Customer Journey Map', foco: 'Cliente', icono: I['customer-journey'] },
    { id: 'flujogramas', nombre: 'Flujogramas', foco: 'Procesos', icono: I.flujogramas },
    { id: 'efi', nombre: 'Matriz EFI', foco: 'Factores internos', icono: I.efi },
    { id: 'auditoria-redes', nombre: 'Auditoría de redes sociales', foco: 'Presencia digital', icono: I['auditoria-redes'] },
    { id: 'evaluacion-360', nombre: 'Evaluación 360°', foco: 'Talento', icono: I['evaluacion-360'] },
    { id: 'inventarios', nombre: 'Inventarios y almacenes', foco: 'Operaciones', icono: I.inventarios }
  ] },
  { fase: 5, titulo: 'Análisis de resultados', color: '#10b981', items: [
    { id: 'foda', nombre: 'Matriz FODA', foco: 'Situación cruzada', icono: I.foda },
    { id: 'resumen-externo', nombre: 'Resumen diagnóstico externo', foco: 'Reporte Fase 3', icono: I['resumen-externo'], requiere: 3 },
    { id: 'resumen-interno', nombre: 'Resumen diagnóstico interno', foco: 'Reporte Fase 4', icono: I['resumen-interno'], requiere: 4 }
  ] },
  { fase: 6, titulo: 'Planificación estratégica', color: '#8b5cf6', items: [
    { id: 'dafo', nombre: 'Matriz DAFO', foco: 'Estrategias cruzadas', icono: I.dafo },
    { id: 'ansoff', nombre: 'Matriz Ansoff', foco: 'Crecimiento', icono: I.ansoff }
  ] }
];

const REQUISITOS = { 3: IDS_FASE3, 4: IDS_FASE4 };
const FASES_OBLIGATORIAS = [
  { fase: 1, titulo: 'Contexto e inducción', detalle: 'Dossier, antecedentes y directrices' },
  { fase: 2, titulo: 'Identificación del problema', detalle: 'Lluvia de ideas y árbol de problemas' }
];

/** Una herramienta: casilla accesible (teclado y lector de pantalla). Memoizada para no repintar las demás. */
const Herramienta = memo(function Herramienta({ item, color, marcada, habilitada, onAlternar }) {
  const Icono = item.icono;
  const previa = DEPENDENCIAS_HERRAMIENTA[item.id];
  const requisito = previa ? NOMBRES_HERRAMIENTAS[previa] : `Fase ${item.requiere}`;
  return <label className={`pfd-item${marcada ? ' marcada' : ''}${habilitada ? '' : ' bloqueada'}`} style={{ '--pfd-c': color }}
    title={habilitada ? item.nombre : `Se habilita al elegir ${requisito}`}>
    <input type="checkbox" checked={marcada} disabled={!habilitada} onChange={() => onAlternar(item.id)}/>
    <span className="pfd-icono"><Icono size={14}/></span>
    <span className="pfd-texto"><strong>{item.nombre}</strong><small>{habilitada ? item.foco : `Requiere ${requisito}`}</small></span>
  </label>;
});

/** Una fase con su contador y atajos «Todas / Ninguna». */
const GrupoFase = memo(function GrupoFase({ grupo, seleccion, habilitadas, onAlternar, onGrupo }) {
  const marcadas = grupo.items.filter(item => seleccion.has(item.id)).length;
  const idsPermitidos = useMemo(() => grupo.items.filter(item => habilitadas[item.id]).map(item => item.id), [grupo, habilitadas]);
  return <section className="pfd-grupo" style={{ '--pfd-c': grupo.color }} aria-label={`Fase ${grupo.fase}: ${grupo.titulo}`}>
    <header>
      <span className="pfd-fase">{grupo.fase}</span>
      <strong>{grupo.titulo}</strong>
      <em>{marcadas}/{grupo.items.length}</em>
      <span className="pfd-atajos">
        <button type="button" className="pfd-btn-link" onClick={() => onGrupo(grupo.items.map(item => item.id), true)} disabled={marcadas === idsPermitidos.length}>Todas</button>
        <button type="button" className="pfd-btn-link" onClick={() => onGrupo(grupo.items.map(item => item.id), false)} disabled={marcadas === 0}>Ninguna</button>
      </span>
    </header>
    <div className="pfd-items">
      {grupo.items.map(item => <Herramienta key={item.id} item={item} color={grupo.color} marcada={seleccion.has(item.id)} habilitada={habilitadas[item.id]} onAlternar={onAlternar}/>)}
    </div>
  </section>;
});

/**
 * Paso 3 del caso: fases obligatorias y selección de herramientas de las fases 3 a 6.
 * Los reportes dependen de su fase: «Resumen externo» necesita alguna herramienta de la Fase 3
 * y «Resumen interno» alguna de la Fase 4 (se habilitan solos al elegirlas).
 */
export default function SelectorHerramientasCaso({ modo, onModo, seleccionadas, onSeleccionadas }) {
  const seleccion = useMemo(() => new Set(seleccionadas), [seleccionadas]);
  const habilitadas = useMemo(() => {
    const resultado = {};
    GRUPOS.forEach(grupo => grupo.items.forEach(item => { const previa = DEPENDENCIAS_HERRAMIENTA[item.id]; resultado[item.id] = (!item.requiere || REQUISITOS[item.requiere].some(id => seleccion.has(id))) && (!previa || seleccion.has(previa)); }));
    return resultado;
  }, [seleccion]);

  const alternar = useCallback(id => {
    onSeleccionadas(previas => normalizarHerramientas(previas.includes(id) ? previas.filter(item => item !== id) : [...previas, id]));
  }, [onSeleccionadas]);
  const cambiarGrupo = useCallback((ids, marcar) => {
    onSeleccionadas(previas => normalizarHerramientas(marcar ? [...previas, ...ids] : previas.filter(item => !ids.includes(item))));
  }, [onSeleccionadas]);

  const elegirModo = nuevo => {
    onModo(nuevo);
    if (nuevo === 'todas') onSeleccionadas([...TODAS_LAS_HERRAMIENTAS]);
  };
  const total = TODAS_LAS_HERRAMIENTAS.length;
  const activas = modo === 'todas' ? total : seleccionadas.length;

  return <div className="pfd">
    <div className="pfd-cabecera">
      <span className="pfd-cabecera-icono"><ShieldCheck size={20}/></span>
      <div><h4>Fases y diagnóstico empresarial</h4><p>Define qué fases y herramientas tendrá el estudiante en este caso.</p></div>
      <span className="pfd-paso">Paso 3 de 4</span>
    </div>

    <div className="pfd-obligatorias" aria-label="Fases obligatorias">
      <span className="pfd-etiqueta"><Lock size={12}/> Siempre incluidas</span>
      {FASES_OBLIGATORIAS.map(item => <span key={item.fase} className="pfd-chip-fase" title={item.detalle}><CheckCircle2 size={14}/> Fase {item.fase}: {item.titulo}</span>)}
    </div>

    <div className="pfd-modo" role="radiogroup" aria-label="Herramientas del diagnóstico">
      <button type="button" role="radio" aria-checked={modo === 'todas'} className={`pfd-btn-modo${modo === 'todas' ? ' activo' : ''}`} onClick={() => elegirModo('todas')}>
        <strong>Todas las herramientas</strong><small>Fases 3 a 6 completas ({total})</small>
      </button>
      <button type="button" role="radio" aria-checked={modo === 'personalizado'} className={`pfd-btn-modo${modo === 'personalizado' ? ' activo' : ''}`} onClick={() => elegirModo('personalizado')}>
        <strong>Elegir herramientas</strong><small>Selecciona las de cada fase</small>
      </button>
      <span className={`pfd-total${activas === 0 ? ' vacio' : ''}`}>{activas} de {total} activas</span>
    </div>

    {modo === 'personalizado' && <div className="pfd-selector">
      <div className="pfd-selector-barra">
        <span>Los reportes se habilitan al elegir herramientas de su fase; POAM requiere PESTEL.</span>
        <span className="pfd-atajos">
          <button type="button" className="pfd-btn-link" onClick={() => onSeleccionadas([...TODAS_LAS_HERRAMIENTAS])}>Seleccionar todas</button>
          <button type="button" className="pfd-btn-link" onClick={() => onSeleccionadas([])}>Desmarcar todas</button>
        </span>
      </div>
      {GRUPOS.map(grupo => <GrupoFase key={grupo.fase} grupo={grupo} seleccion={seleccion} habilitadas={habilitadas} onAlternar={alternar} onGrupo={cambiarGrupo}/>)}
      {seleccionadas.length === 0 && <p className="pfd-error">Debes seleccionar al menos una herramienta para el diagnóstico.</p>}
    </div>}
  </div>;
}
