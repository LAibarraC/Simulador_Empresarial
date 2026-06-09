import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { alerta } from "../../utils/Notificaciones";
import { IconoNube } from "../ui/iconos";

export default function SelectorNube({ usuario, onImportar }) {
  const [archivos, setArchivos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState("");

  // Cargar la lista de archivos cuando el componente aparece
  useEffect(() => {
    if (!usuario) return;
    
    const fetchArchivos = async () => {
      setCargando(true);
      try {
        const data = await api.obtenerArchivos(usuario.nombre);
        if (data.files) {
          setArchivos(data.files);
        }
      } catch (error) {
        console.error("Error al obtener archivos de la nube:", error);
      } finally {
        setCargando(false);
      }
    };

    fetchArchivos();
  }, [usuario]);

  const handleImportar = () => {
    if (!archivoSeleccionado) {
      alerta.advertencia("Atención", "Por favor, selecciona un archivo primero.");
      return;
    }
    // Ejecutamos la función que viene desde la calculadora
    onImportar(archivoSeleccionado);
  };

  return (
    <div style={{
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px', 
      padding: '15px', 
      backgroundColor: 'var(--bg-card)', 
      border: '1px solid var(--border-color)', 
      borderRadius: '8px',
      marginTop: '10px'
    }}>
      <IconoNube size={20} color="var(--text-muted)" />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
          Importar desde mi nube
        </span>
        <select 
          value={archivoSeleccionado}
          onChange={(e) => setArchivoSeleccionado(e.target.value)}
          disabled={cargando || archivos.length === 0}
          style={{ padding: '5px', borderRadius: '4px', border: '1px solid var(--border-color)', marginTop: '5px' }}
        >
          <option value="">
            {cargando ? "Cargando archivos..." : (archivos.length === 0 ? "No tienes archivos en el servidor" : "-- Selecciona un archivo --")}
          </option>
          {archivos.map((file, idx) => (
            <option key={idx} value={file.filename}>{file.filename}</option>
          ))}
        </select>
      </div>
      
      <button 
        onClick={handleImportar}
        disabled={!archivoSeleccionado || cargando}
        style={{
          backgroundColor: 'var(--accent-color)',
          padding: '8px 15px',
          opacity: !archivoSeleccionado ? 0.5 : 1,
          cursor: !archivoSeleccionado ? 'not-allowed' : 'pointer'
        }}
      >
        Importar
      </button>
    </div>
  );
}