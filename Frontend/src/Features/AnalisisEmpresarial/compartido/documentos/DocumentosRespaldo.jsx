import { useRef, useState } from 'react';
import { Download, ExternalLink, File, FileImage, FileSpreadsheet, FileText, Paperclip, Presentation, Trash2, UploadCloud } from 'lucide-react';
import { DOCUMENTOS_ACEPTADOS, DOCUMENTOS_MAX, DOCUMENTOS_MAX_BYTES, formatearTamano, tipoDocumento } from './archivosRespaldo';
import { abrirDocumento, useMiniaturas } from './useDocumentosRespaldo';

const ICONOS = { imagen: FileImage, pdf: FileText, hoja: FileSpreadsheet, texto: FileText, presentacion: Presentation, otro: File };

/** Documentación de respaldo del journey: encuestas, entrevistas, capturas, reseñas, etc. */
export default function DocumentosRespaldo({ documentos, acciones, titulo = 'Documentación de respaldo', ayuda = 'Adjunta la evidencia de tu análisis: encuestas, entrevistas, reseñas, capturas de redes o reportes de reclamos.', renderExtra }) {
  const inputRef = useRef(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const miniaturas = useMiniaturas(documentos);

  const agregar = async archivos => {
    if (!archivos?.length) return;
    setSubiendo(true);
    try { await acciones.agregarDocumentos(archivos); } finally { setSubiendo(false); if (inputRef.current) inputRef.current.value = ''; }
  };
  const soltar = evento => { evento.preventDefault(); setArrastrando(false); agregar(evento.dataTransfer.files); };

  return <section className="cjm-card" aria-label={titulo}>
    <div className="cjm-card-head">
      <div>
        <h3 className="cjm-card-title"><Paperclip size={16}/> {titulo}</h3>
        <p className="cjm-statement">{ayuda}</p>
      </div>
      <span className="cjm-count">{documentos.length}/{DOCUMENTOS_MAX}</span>
    </div>
    <div className={`cjm-dropzone${arrastrando ? ' over' : ''}${subiendo ? ' busy' : ''}`}
      onDragOver={e => { e.preventDefault(); setArrastrando(true); }} onDragLeave={() => setArrastrando(false)} onDrop={soltar}>
      <span className="cjm-dropzone-icon"><UploadCloud size={22}/></span>
      <div><strong>{subiendo ? 'Guardando archivos…' : 'Arrastra tus archivos aquí'}</strong><span>PDF, imagen, Word, Excel, PowerPoint o texto · máx. {formatearTamano(DOCUMENTOS_MAX_BYTES)} por archivo</span></div>
      <button type="button" className="cjm-btn-outline" onClick={() => inputRef.current?.click()} disabled={subiendo || documentos.length >= DOCUMENTOS_MAX}>Seleccionar archivos</button>
      <input ref={inputRef} type="file" multiple accept={DOCUMENTOS_ACEPTADOS} hidden onChange={e => agregar(e.target.files)}/>
    </div>
    {documentos.length > 0 && <ul className="cjm-docs">
      {documentos.map(documento => {
        const tipo = tipoDocumento(documento.nombre, documento.mime);
        const Icono = ICONOS[tipo];
        return <li key={documento.id} className="cjm-doc">
          {miniaturas[documento.id] ? <img className="cjm-doc-thumb" src={miniaturas[documento.id]} alt=""/> : <span className={`cjm-doc-icon ${tipo}`}><Icono size={18}/></span>}
          <div className="cjm-doc-info">
            <strong title={documento.nombre}>{documento.nombre}</strong>
            <small>{formatearTamano(documento.tamano)} · {new Date(documento.fecha).toLocaleDateString('es-BO')}</small>
            <input className="cjm-doc-desc" value={documento.descripcion} onChange={e => acciones.describirDocumento(documento.id, e.target.value)} placeholder="Añade una descripción (opcional)" aria-label={`Descripción de ${documento.nombre}`}/>
            {renderExtra?.(documento)}
          </div>
          <div className="cjm-doc-actions">
            <button type="button" className="cjm-btn-icon" onClick={() => abrirDocumento(documento)} title="Abrir" aria-label={`Abrir ${documento.nombre}`}><ExternalLink size={15}/></button>
            <button type="button" className="cjm-btn-icon" onClick={() => abrirDocumento(documento, true)} title="Descargar" aria-label={`Descargar ${documento.nombre}`}><Download size={15}/></button>
            <button type="button" className="cjm-btn-icon danger" onClick={() => acciones.eliminarDocumento(documento.id)} title="Eliminar" aria-label={`Eliminar ${documento.nombre}`}><Trash2 size={15}/></button>
          </div>
        </li>;
      })}
    </ul>}
    <small className="cjm-muted">Los archivos se guardan en este navegador y se listan en el PDF exportado; las imágenes se incluyen como anexo.</small>
  </section>;
}
