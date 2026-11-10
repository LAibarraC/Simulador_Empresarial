import { ArrowRight } from 'lucide-react';

/* Piezas del reporte de la Fase 5 (secciones numeradas, tablas y etiquetas). */

/** Encabezado numerado de cada sección del reporte. */
export function Seccion({ numero, icono, titulo, subtitulo, onIr, children }) {
  const Icono = icono;
  return <section className="hf-card r5-rep-sec" data-pdf-block>
    <header className="r5-rep-head">
      <span className="r5-rep-num">{numero}</span>
      <div><h3><Icono size={16}/> {titulo}</h3><small>{subtitulo}</small></div>
      {onIr && <button type="button" className="hf-btn-ghost r5-go" onClick={onIr} data-html2canvas-ignore>Abrir herramienta <ArrowRight size={13}/></button>}
    </header>
    {children}
  </section>;
}

/** Tabla del reporte con filas alternadas y encabezado destacado. columnas: [[titulo, ancho?, clase?]] */
export function Tabla({ columnas, filas, vacio }) {
  if (!filas.length) return <p className="hf-muted r5-rep-vacio">{vacio}</p>;
  return <div className="r5-rep-table-wrap"><table className="r5-rep-table">
    <colgroup>{columnas.map(([titulo, ancho]) => <col key={titulo} style={ancho ? { width: ancho } : undefined}/>)}</colgroup>
    <thead><tr>{columnas.map(([titulo, , clase]) => <th key={titulo} className={clase}>{titulo}</th>)}</tr></thead>
    <tbody>{filas.map((fila, i) => <tr key={i}>{fila.map((celda, k) => <td key={k} className={columnas[k][2]}>{celda}</td>)}</tr>)}</tbody>
  </table></div>;
}

/** Etiqueta de color. tono: interno | externo | directo | indirecto | cat | oportunidad | amenaza | alto | medio | bajo */
export function Etiqueta({ tono, children }) {
  return <span className={`r5-tag ${tono}`}>{children}</span>;
}

/** Aviso cuando una herramienta aún no tiene datos. */
export function SinDatos({ onIr, texto = 'Aún no hay datos en esta herramienta.' }) {
  return <p className="hf-muted r5-rep-vacio">{texto} {onIr && <button type="button" className="hf-btn-outline" onClick={onIr} data-html2canvas-ignore>Completar ahora</button>}</p>;
}
