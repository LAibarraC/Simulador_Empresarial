import { useRef, useState } from "react";
import { Upload } from 'lucide-react';
import { alerta } from '../../utils/Notificaciones';
import "../../styles/components/excel/ExcelUploader.css";

export default function ExcelUploader({ onUpload, onClick }) {
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Admin abre el modal; otras pantallas conservan la selección y subida directa.
  if (onClick) {
    return (
      <button type="button" className="btn-excel-uploader excel-uploader-compact-button" onClick={onClick}>
        <Upload size={17} strokeWidth={2.2} aria-hidden="true" />
        Cargar credenciales
      </button>
    );
  }

  const handleSubmit = () => {
    if (!file) return alerta.warning("Selecciona un archivo primero.");
    onUpload?.(file);
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;
    if (["xlsx", "xls", "csv"].includes(droppedFile.name.split('.').pop().toLowerCase())) setFile(droppedFile);
    else alerta.warning("Por favor, sube solo archivos de Excel o CSV (.xlsx, .xls, .csv)");
  };

  return (
    <div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop}
      className="container_uploader" style={{ border: isDragging ? "2px dashed var(--accent-color)" : "2px dashed var(--border-color)", backgroundColor: isDragging ? "var(--bg-hover, transparent)" : "var(--bg-card)" }}>
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <div className="container_formato"><h6>Sube tu tabla de datos</h6><p>Formatos soportados: .xlsx, .xls, .csv</p></div>
      <div className="container_uploader_file">
        <button type="button" className="btn-excel-uploader excel-uploader-compact-button" onClick={() => inputRef.current?.click()}><Upload size={15} /> Explorar archivos</button>
        <span style={{ color: file ? "var(--accent-color)" : "var(--text-muted)", fontStyle: file ? "normal" : "italic" }}>{file?.name || "Ningún archivo seleccionado"}</span>
      </div>
      {file && <div className="container_uploader_button"><button type="button" onClick={handleSubmit}>Subir al Servidor</button></div>}
    </div>
  );
}
