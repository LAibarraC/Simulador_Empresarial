import { useRef, useState } from 'react';
import { Download, ExternalLink, File, FileImage, FileSpreadsheet, FileText, Paperclip, Presentation, Trash2, UploadCloud } from 'lucide-react';
import { DOCUMENTOS_ACEPTADOS, DOCUMENTOS_MAX, DOCUMENTOS_MAX_BYTES, formatearTamano, tipoDocumento } from './calculosFinancieros';
import { abrirDocumento, useMiniaturas } from '../../compartido/documentos/useDocumentosRespaldo';

const ICONOS = { imagen: FileImage, pdf: FileText, hoja: FileSpreadsheet, texto: FileText, presentacion: Presentation, otro: File };

export default function DocumentosFinancieros({ documentos, acciones }) {
  const inputRef = useRef(null);
  const [arrastrando, setArrastrando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const miniaturas = useMiniaturas(documentos);

  const agregar = async archivos => {
    setSubiendo(true);
    try { await acciones.agregarDocumentos(archivos); } finally { setSubiendo(false); if (inputRef.current) inputRef.current.value = ''; }
  };
  const soltar = evento => { evento.preventDefault(); setArrastrando(false); agregar(evento.dataTransfer.files); };

  return <section className="avh-card" aria-label="Documentación de respaldo">
    <div className="avh-card-head">
      <h3 className="avh-card-title"><Paperclip size={16}/> Documentación de respaldo</h3>
      <span className="avh-count-label">{documentos.length}/{DOCUMENTOS_MAX}</span>
    </div>
    <div className={`avh-dropzone${arrastrando ? ' over' : ''}${subiendo ? ' busy' : ''}`}
      onDragOver={e => { e.preventDefault(); setArrastrando(true); }} onDragLeave={() => setArrastrando(false)} onDrop={soltar}>
      <UploadCloud size={22}/>
      <div><strong>{subiendo ? 'Guardando archivos…' : 'Arrastra tus archivos aquí'}</strong><span>Estados financieros, facturas, capturas o informes · PDF, imagen, Word, Excel, PowerPoint · máx. {formatearTamano(DOCUMENTOS_MAX_BYTES)}</span></div>
      <button type="button" className="avh-btn-outline" onClick={() => inputRef.current?.click()} disabled={subiendo}>Seleccionar archivos</button>
      <input ref={inputRef} type="file" multiple accept={DOCUMENTOS_ACEPTADOS} hidden onChange={e => agregar(e.target.files)}/>
    </div>
    {documentos.length > 0 && <ul className="avh-docs">
      {documentos.map(documento => {
        const tipo = tipoDocumento(documento.nombre, documento.mime);
        const Icono = ICONOS[tipo];
        return <li key={documento.id} className="avh-doc">
          {miniaturas[documento.id] ? <img className="avh-doc-thumb" src={miniaturas[documento.id]} alt=""/> : <span className={`avh-doc-icon ${tipo}`}><Icono size={18}/></span>}
          <div className="avh-doc-info">
            <strong title={documento.nombre}>{documento.nombre}</strong>
            <small>{formatearTamano(documento.tamano)} · {new Date(documento.fecha).toLocaleDateString('es-BO')}</small>
            <input className="avh-cell-input avh-doc-desc" value={documento.descripcion} onChange={e => acciones.describirDocumento(documento.id, e.target.value)} placeholder="Añade una descripción (opcional)" aria-label={`Descripción de ${documento.nombre}`}/>
          </div>
          <div className="avh-doc-actions">
            <button type="button" className="avh-btn-icon" onClick={() => abrirDocumento(documento)} title="Abrir" aria-label={`Abrir ${documento.nombre}`}><ExternalLink size={15}/></button>
            <button type="button" className="avh-btn-icon" onClick={() => abrirDocumento(documento, true)} title="Descargar" aria-label={`Descargar ${documento.nombre}`}><Download size={15}/></button>
            <button type="button" className="avh-btn-icon danger" onClick={() => acciones.eliminarDocumento(documento.id)} title="Eliminar" aria-label={`Eliminar ${documento.nombre}`}><Trash2 size={15}/></button>
          </div>
        </li>;
      })}
    </ul>}
    <small className="avh-muted">Los archivos se guardan en este navegador y se listan en el PDF exportado; las imágenes se incluyen como anexo.</small>
  </section>;
}
