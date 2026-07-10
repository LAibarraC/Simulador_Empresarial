import { useState, useRef } from "react";
import { alerta } from '../../utils/Notificaciones';

import "../../styles/components/excel/ExcelUploader.css";

export default function ExcelUploader({ onUpload }) {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = () => {
    if (file) {
      onUpload(file);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      alerta.warning("Selecciona un archivo primero.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      const extension = droppedFile.name.split('.').pop().toLowerCase();
      if (extension === "xlsx" || extension === "xls") {
        setFile(droppedFile);
      } else {
        alerta.warning("Por favor, sube solo archivos de Excel (.xlsx, .xls)");
      }
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="container_uploader"
      style={{
        //  Usamos variables de CSS en lugar de colores fijos
        border: isDragging ? "2px dashed var(--accent-color)" : "2px dashed var(--border-color)",
        backgroundColor: isDragging ? "var(--bg-hover, transparent)" : "var(--bg-card)",
        cursor: isDragging ? "copy" : "default"
      }}
    >
      <input
        id="fileInput"
        type="file"
        accept=".xlsx, .xls"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => setFile(e.target.files[0])}
      />

      <div className="container_formato">
        {/*  Texto principal dinámico */}
        <h6>Sube tu tabla de datos</h6>
        {/*  Texto secundario dinámico */}
        <p>Formatos soportados: .xlsx, .xls</p>
      </div>

      <div className="container_uploader_file">

        <label
          htmlFor="fileInput"
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
          onMouseOver={(e) => e.currentTarget.style.opacity = "0.7"}
          onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Explorar archivos
        </label>

        <span style={{
          color: file ? "var(--accent-color)" : "var(--text-muted)",
          fontStyle: file ? "normal" : "italic",
          fontWeight: file ? "bold" : "normal",
        }}>
          {file ? `${file.name}` : "Ningún archivo seleccionado"}
        </span>
      </div>

      {file && (
        <div className="container_uploader_button" style={{ display: "flex", justifyContent: "center", width: "100%", marginTop: "10px" }}>
          <button
            onClick={handleSubmit}
            style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center" }}
            onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
            onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.97)"}
            onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 16 12 12 8 16"/>
              <line x1="12" y1="12" x2="12" y2="21"/>
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
            </svg>
            Subir al Servidor
          </button>
        </div>
      )}
    </div>
  );
}