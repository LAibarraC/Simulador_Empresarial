import PieNavegacion from '../simulacion/PieNavegacion';
import { FileDown, Loader2, WandSparkles } from 'lucide-react';

/* Componentes de presentación compartidos por las herramientas de la Fase 4 (estilo Fase 3). */

export function BarraHerramienta({ icono, titulo, exportando, onExportar, children }) {
  const Icono = icono;
  return <div className="hf-toolbar">
    <div className="hf-toolbar-badge"><Icono size={15}/><span>{titulo}</span></div>
    <div className="hf-toolbar-actions">
      {children}
      {onExportar && <button type="button" className="hf-btn-pdf" onClick={onExportar} disabled={exportando}>
        {exportando ? <Loader2 size={14} className="hf-spin"/> : <FileDown size={14}/>}<span>{exportando ? 'Exportando PDF…' : 'Exportar a PDF'}</span>
      </button>}
    </div>
  </div>;
}

/** Misma barra superior de la Fase 4 para herramientas que no están dentro de un `hf-container` (fases 2 y 3). */
export function EncabezadoHerramienta(props) {
  return <div className="hf-container hf-solo"><BarraHerramienta {...props}/></div>;
}

/** items: [{ icono, label, valor, detalle, tono: 'ok'|'warn'|'bad' }] */
export function IndicadoresClave({ items }) {
  return <section className="hf-kpis" style={{ '--hf-kpi-cols': items.length }} aria-label="Indicadores">
    {items.map(item => { const Icono = item.icono; return <article key={item.label} className={`hf-kpi ${item.tono || ''}`}>
      {Icono && <span className="hf-kpi-icon"><Icono size={20}/></span>}
      <span className="hf-kpi-text"><strong>{item.valor}</strong><small className="hf-kpi-label">{item.label}</small>{item.detalle && <small className="hf-kpi-detail">{item.detalle}</small>}</span>
    </article>; })}
  </section>;
}


export function NotasConPlantilla({ id, titulo, valor, onCambio, plantilla, placeholder, filas = 5 }) {
  const insertar = () => onCambio(valor.trim() ? `${valor.trim()}\n\n${plantilla}` : plantilla);
  return <div className="hf-notes">
    <div className="hf-notes-head">
      <label htmlFor={id} className="hf-section-label">{titulo}</label>
      {plantilla && <button type="button" className="hf-btn-ghost" onClick={insertar}><WandSparkles size={13}/> Plantilla</button>}
    </div>
    <textarea id={id} className="hf-input hf-textarea" rows={filas} value={valor} onChange={e => onCambio(e.target.value)} placeholder={placeholder}/>
  </div>;
}

export function EstadoVacio({ icono, titulo, texto, children }) {
  const Icono = icono;
  return <div className="hf-empty"><Icono size={26}/><strong>{titulo}</strong>{texto && <span>{texto}</span>}{children && <div>{children}</div>}</div>;
}

/** Pie común de las herramientas de la Fase 4 (los destinos los define el contenedor). */
export function PieHerramienta() {
  return <PieNavegacion/>;
}

/** Encabezado común de los reportes PDF. meta: [[etiqueta, valor], …] */
export function EncabezadoPdf({ sigla, titulo, subtitulo, etiqueta = 'REPORTE', caso, meta = [] }) {
  const filas = [['Caso de estudio', caso?.titulo || caso?.nombre || 'Caso empresarial'], ['Sector', caso?.sector || caso?.categoria || 'No especificado'], ...meta, ['Fecha', new Date().toLocaleDateString('es-BO')]];
  return <>
    <header className="hf-pdf-header">
      <div><span className="hf-pdf-brand">{sigla}</span><div><h1>{titulo}</h1><p>{subtitulo}</p></div></div>
      <span className="hf-pdf-tag">{etiqueta}</span>
    </header>
    <div className="hf-pdf-meta" style={{ '--hf-meta-cols': filas.length }}>{filas.map(([etiquetaMeta, valor]) => <div key={etiquetaMeta}><small>{etiquetaMeta}</small><strong>{valor}</strong></div>)}</div>
  </>;
}
