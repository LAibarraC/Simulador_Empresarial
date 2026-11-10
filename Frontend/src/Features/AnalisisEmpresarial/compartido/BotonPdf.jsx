import { FileDown, Loader2 } from 'lucide-react';

/** Botón rojo «Exportar … PDF» con estado de carga (resúmenes, FODA, DAFO y Ansoff). */

export function BotonPdf({ exportando, onClick, texto = 'Exportar resumen PDF' }) {
  return <button type="button" className="hf-btn-pdf" onClick={onClick} disabled={exportando} data-html2canvas-ignore>
    {exportando ? <Loader2 size={14} className="hf-spin"/> : <FileDown size={14}/>}<span>{exportando ? 'Exportando PDF…' : texto}</span>
  </button>;
}
