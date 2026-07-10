import { useState } from "react";
//  IMPORTAMOS EL MODAL (Ajusta la ruta si está en otra carpeta)
import Modal from "../../utils/Modal";

import "../../styles/components/excel/ExcelViewer.css";

export default function ExcelViewer({ files, onSelect, onDelete, onDownload, rol, esPersonal }) {

  // --- ESTADOS PARA EL MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const handleDeleteArchivo = (filename) => {
    setFileToDelete(filename);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (fileToDelete) {
      onDelete(fileToDelete);
    }
    setIsModalOpen(false);
    setFileToDelete(null);
  };

  return (
    <div>
      {/* CABECERA MODERNA */}
      <div className="container_Viewer">
        {/*  Adaptado a texto principal */}
        <h4>Archivos Disponibles</h4>
        <span>
          {files.length} {files.length === 1 ? 'archivo' : 'archivos'}
        </span>
      </div>

      {/* ESTADO VACÍO */}
      {files.length === 0 ? (
        <div className="container_Viewer_vacio">
          <p>No hay archivos en el servidor.</p>
        </div>
      ) : (
        /* LISTA DE ARCHIVOS */
        /* LISTA DE ARCHIVOS */
        <ul className="container_lista">
          {files.map((f, index) => (
            <li
              key={index}
              className="container_lista_li"
              onMouseOver={(e) => e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.15)"}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"}
            >

              {/* IZQUIERDA: Nombre del archivo */}
              <div className="container_name_file">
                <p>
                  {f.filename}
                </p>
              </div>

              {/* DERECHA: Botones de acción */}
              <div className="container_button">
                <button
                  onClick={() => onSelect(f.filename)}
                  className="container_button_1"
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "var(--accent-color)"; e.currentTarget.style.color = "white"; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--accent-color)"; }}
                >
                  Ver
                </button>

                {onDownload && (
                  <button
                    onClick={() => onDownload(f.filename)}
                    className="container_button_download"
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "var(--primary-color)"; e.currentTarget.style.color = "white"; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "var(--primary-color)"; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Descargar
                  </button>
                )}

                {/* 🚀 2. EL CAMBIO: Envolvemos el botón con esta validación de seguridad */}
                {(esPersonal || ['Docente', 'Administrador'].includes(rol)) && (
                  <button
                    onClick={() => handleDeleteArchivo(f.filename)}
                    className="container_button_2"
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#ef4444"; e.currentTarget.style.color = "white"; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#ef4444"; }}
                    style={{ display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    Eliminar
                  </button>
                )}
                
              </div>
            </li>
          ))}
        </ul>
        
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirmar eliminación"
        maxWidth="400px"
      >
        <div className="modal_viewer">
          <p>
            ¿Estás seguro de que deseas eliminar permanentemente el archivo <br />
            <strong>"{fileToDelete}"</strong>?
          </p>
        </div>

        <div className="modal_viewer_button">
          <button
            onClick={() => setIsModalOpen(false)}
            className="modal_viewer_button_si"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirmDelete}
            className="modal_viewer_button_no "
          >
            Eliminar
          </button>
        </div>
      </Modal>

    </div>
  );
}