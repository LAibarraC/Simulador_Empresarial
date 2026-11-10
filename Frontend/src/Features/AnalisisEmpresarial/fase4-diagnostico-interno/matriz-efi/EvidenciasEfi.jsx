import { useRef, useState } from 'react';
import { ExternalLink, FileText, Link2, Paperclip, Plus, Trash2, UploadCloud } from 'lucide-react';
import { alerta } from '../../../../utils/Notificaciones';
import { guardarArchivo, leerArchivo, eliminarArchivo } from '../../compartido/documentos/almacenArchivos';
import { DOCUMENTOS_ACEPTADOS, DOCUMENTOS_MAX_BYTES, formatearTamano } from '../../compartido/documentos/archivosRespaldo';

const nuevoId = () => `ev-efi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

/** Evidencias de un factor: archivos (guardados en este navegador) o enlaces. */
export default function EvidenciasEfi({ evidencias = [], onCambiar }) {
  const inputRef = useRef(null);
  const [enlace, setEnlace] = useState('');
  const agregar = evidencia => onCambiar(actuales => [...actuales, { id: nuevoId(), fechaSubida: new Date().toLocaleDateString('es-BO'), descripcion: '', ...evidencia }]);

  const subir = async archivos => {
    for (const archivo of Array.from(archivos || [])) {
      if (archivo.size > DOCUMENTOS_MAX_BYTES) { alerta.advertencia('Archivo demasiado grande', `${archivo.name} supera ${formatearTamano(DOCUMENTOS_MAX_BYTES)}.`); continue; }
      const id = nuevoId();
      try { await guardarArchivo(id, archivo); agregar({ id, tipo: 'archivo', nombre: archivo.name, mime: archivo.type, tamano: archivo.size, almacenado: true }); }
      catch (error) { console.error('No se pudo guardar la evidencia:', error); alerta.error('No se pudo guardar', archivo.name); }
    }
    if (inputRef.current) inputRef.current.value = '';
  };
  const agregarEnlace = () => {
    const url = enlace.trim();
    if (!/^https?:\/\//i.test(url)) { alerta.advertencia('Enlace inválido', 'Escribe una dirección completa que empiece con http:// o https://'); return; }
    agregar({ tipo: 'enlace', url, nombre: url.replace(/^https?:\/\//i, '').slice(0, 60) });
    setEnlace('');
  };
  const abrir = async evidencia => {
    if (evidencia.tipo === 'enlace') { window.open(evidencia.url, '_blank', 'noopener'); return; }
    const blob = evidencia.almacenado ? await leerArchivo(evidencia.id).catch(() => null) : null;
    if (!blob) { alerta.advertencia('Archivo no disponible', 'Esta evidencia solo tiene la referencia del nombre o se adjuntó en otro navegador.'); return; }
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };
  const quitar = evidencia => {
    onCambiar(actuales => actuales.filter(item => item.id !== evidencia.id));
    if (evidencia.almacenado) eliminarArchivo(evidencia.id).catch(() => {});
  };

  return <div className="efi-evid">
    <div className="efi-evid-head">
      <span className="cjm-field-label"><Paperclip size={12}/> Evidencia del factor <small>{evidencias.length ? `${evidencias.length} adjunto(s)` : 'informes, fotos, enlaces…'}</small></span>
      <button type="button" className="cjm-btn-outline" onClick={() => inputRef.current?.click()}><UploadCloud size={13}/> Archivo</button>
      <input ref={inputRef} type="file" multiple hidden accept={DOCUMENTOS_ACEPTADOS} onChange={e => subir(e.target.files)}/>
    </div>
    <div className="efi-evid-link">
      <input className="cjm-input" value={enlace} onChange={e => setEnlace(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarEnlace(); } }} placeholder="https://… enlace de respaldo" aria-label="Enlace de evidencia"/>
      <button type="button" className="cjm-btn-icon" onClick={agregarEnlace} title="Añadir enlace" aria-label="Añadir enlace"><Plus size={14}/></button>
    </div>
    {evidencias.length > 0 && <ul className="efi-evid-list">{evidencias.map(evidencia => <li key={evidencia.id}>
      {evidencia.tipo === 'enlace' ? <Link2 size={13}/> : <FileText size={13}/>}
      <span title={evidencia.nombre}>{evidencia.nombre}</span>
      <button type="button" className="cjm-btn-icon" onClick={() => abrir(evidencia)} title="Abrir" aria-label={`Abrir ${evidencia.nombre}`}><ExternalLink size={13}/></button>
      <button type="button" className="cjm-btn-icon danger" onClick={() => quitar(evidencia)} title="Quitar" aria-label={`Quitar ${evidencia.nombre}`}><Trash2 size={13}/></button>
    </li>)}</ul>}
  </div>;
}
