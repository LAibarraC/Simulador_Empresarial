import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  Play, 
  Eye, 
  Users, 
  X, 
  Layers,
  Trash2
} from 'lucide-react';
import { alerta } from "../../utils/Notificaciones";
import { BASE_URL } from "../../services/api";
import { useData } from "../../components/Gestion_Datos/DataContext";
import ModalAsignarTarea from './ModalAsignarTarea';
import VistaTareaEstudiante from './VistaTareaEstudiante';
import ModalEntregasDocente from './ModalEntregasDocente';

const parseEjerciciosAsignados = (texto) => {
  if (!texto || typeof texto !== 'string') return null;

  const colonIndex = texto.indexOf(":");
  let modulo = "";
  let resto = texto;

  if (colonIndex !== -1 && !texto.trim().toLowerCase().startsWith("tema")) {
    modulo = texto.substring(0, colonIndex).trim();
    resto = texto.substring(colonIndex + 1).trim();
  }

  const esTodos = resto.toLowerCase().includes("todos los temas");

  if (esTodos) {
    return {
      modulo: modulo || "Estadística General",
      esTodos: true,
      textoResumen: resto,
      temas: [
        { numero: "Tema 2", nombre: "Tabla de Frecuencias" },
        { numero: "Tema 2", nombre: "Distribución por Intervalos" },
        { numero: "Tema 3", nombre: "Medidas de Tendencia Central" },
        { numero: "Tema 4", nombre: "Medidas de Dispersión y Forma" },
        { numero: "Tema 5", nombre: "Distribuciones Bivariantes" },
        { numero: "Tema 6", nombre: "Análisis de Regresión" },
        { numero: "Tema 7", nombre: "Series Temporales" },
        { numero: "Tema 8", nombre: "Números Índices" },
      ]
    };
  }

  const partes = resto.split(/,\s*(?=Tema\s*\d+)/i);
  const temas = partes.map(p => {
    const match = p.match(/^(Tema\s*\d+)[\s*:\-\–]+(.*)$/i);
    if (match) {
      return { numero: match[1].trim(), nombre: match[2].trim() };
    }
    return { numero: "", nombre: p.trim() };
  }).filter(t => t.nombre || t.numero);

  return {
    modulo: modulo || "Estadística General",
    esTodos: false,
    textoResumen: resto,
    temas
  };
};

export default function ListaTareas({ curso, onClose }) {
  const { usuario } = useData();
  const [tareas, setTareas] = useState([]);
  const [entregas, setEntregas] = useState({}); // Tarea ID -> Entrega
  const [cargando, setCargando] = useState(true);
  
  const [mostrarModalAsignar, setMostrarModalAsignar] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState(null);
  const [tareaParaEntregas, setTareaParaEntregas] = useState(null);

  const esDocente = usuario?.rol === "Docente" || (usuario?.rol === "Administrador" && !usuario?.rolOriginal);

  const cargarDatos = async () => {
    setCargando(true);
    setEntregas({});
    try {
      const res = await fetch(`${BASE_URL}/tareas/clase/${curso.id}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const dataTareas = await res.json();
        setTareas(dataTareas);
        
        if (!esDocente) {
            const resEntregas = await fetch(`${BASE_URL}/tareas/entregas/estudiante/${curso.id}`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
            });
            if (resEntregas.ok) {
                const dataEntregas = await resEntregas.json();
                const mapaEntregas = {};
                dataEntregas.forEach(e => mapaEntregas[e.tarea_id] = e);
                setEntregas(mapaEntregas);
            } else {
                setEntregas({});
            }
        }
      }
    } catch (error) {
      console.error("Error al cargar tareas", error);
      alerta.error("Error", "No se pudieron cargar las tareas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [curso.id, usuario?.id, usuario?.rol]);

  const handleEliminarTarea = async (tarea) => {
    const confirmado = await alerta.confirmar({
      titulo: "Eliminar Tarea",
      mensaje: `¿Estás seguro de que deseas eliminar la tarea «${tarea.titulo}»? Se eliminarán también todas las entregas y notas asociadas. Esta acción no se puede deshacer.`,
      textoConfirmar: "Sí, eliminar tarea",
      textoCancelar: "Cancelar",
      variant: "danger",
    });
    if (!confirmado) return;

    try {
      const res = await fetch(`${BASE_URL}/tareas/${tarea.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        alerta.success("Tarea eliminada", "La tarea ha sido eliminada correctamente.");
        cargarDatos();
      } else {
        const data = await res.json().catch(() => ({}));
        alerta.error("Error", data.detail || "No se pudo eliminar la tarea.");
      }
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      alerta.error("Error", "Problema de conexión al eliminar la tarea.");
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9000, padding: "16px" }}>
      <div style={{ background: "var(--bg-card)", padding: "28px", borderRadius: "12px", width: "100%", maxWidth: "720px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.25)", border: "1px solid var(--border-color)", boxSizing: "border-box" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border-color)", paddingBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "8px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-color)" }}>
                <ClipboardList size={22} />
              </div>
              <h2 style={{ margin: 0, color: "var(--primary-color)", fontSize: "1.35rem" }}>Tareas de {curso.nombre}</h2>
            </div>
            <button 
              onClick={onClose} 
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", padding: "6px", borderRadius: "6px" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-main)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
            >
              <X size={20} />
            </button>
        </div>

        {esDocente && (
            <button 
                onClick={() => setMostrarModalAsignar(true)} 
                style={{ marginBottom: "20px", padding: "10px 18px", background: "var(--accent-color)", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.92rem", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
                <Plus size={18} /> Asignar Nueva Tarea
            </button>
        )}

        {cargando ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              <Clock size={28} style={{ animation: "spin 2s linear infinite", marginBottom: "10px" }} />
              <div>Cargando tareas...</div>
            </div>
        ) : tareas.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", background: "var(--bg-main)", borderRadius: "10px", color: "var(--text-muted)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <ClipboardList size={38} style={{ opacity: 0.3 }} />
                <div style={{ fontWeight: "500" }}>No hay tareas asignadas para este grupo.</div>
                {esDocente && <div style={{ fontSize: "0.85rem" }}>Crea la primera tarea para que tus alumnos comiencen a practicar.</div>}
            </div>
        ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {tareas.map(tarea => {
                    const entrega = entregas[tarea.id];
                    const entregado = !!entrega;
                    const fechaLimiteVencida = Boolean(tarea.fecha_limite && new Date(tarea.fecha_limite) < new Date());

                    let entregaArchivo = "";
                    if (entrega?.datos_respuesta) {
                      try {
                        const d = typeof entrega.datos_respuesta === "string" ? JSON.parse(entrega.datos_respuesta) : entrega.datos_respuesta;
                        if (d?.archivo_base && d.archivo_base !== "Sin archivo") {
                          entregaArchivo = d.archivo_base;
                        }
                      } catch (e) {}
                    }
                    const nombreArchivoMostrar = tarea.archivo_nombre || entregaArchivo || "";

                    return (
                        <div key={tarea.id} style={{ background: "var(--bg-main)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
                            <div style={{ flex: 1, minWidth: "260px" }}>
                                <h3 style={{ margin: "0 0 6px 0", color: "var(--text-main)", fontSize: "1.05rem" }}>{tarea.titulo}</h3>
                                {tarea.ejercicios_seleccionados && (() => {
                                    const parsed = parseEjerciciosAsignados(tarea.ejercicios_seleccionados);
                                    if (!parsed) return null;
                                    return (
                                        <div style={{ marginBottom: "8px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                                                {parsed.modulo && (
                                                    <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                                        <Layers size={13} style={{ color: "var(--primary-color)" }} />
                                                        {parsed.modulo}:
                                                    </span>
                                                )}
                                                {parsed.temas.map((t, idx) => (
                                                    <span key={idx} style={{
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                        gap: "4px",
                                                        background: "rgba(59, 130, 246, 0.08)",
                                                        color: "var(--primary-color)",
                                                        border: "1px solid rgba(59, 130, 246, 0.2)",
                                                        padding: "2px 7px",
                                                        borderRadius: "6px",
                                                        fontSize: "0.75rem",
                                                        fontWeight: "600"
                                                    }}>
                                                        {t.numero ? <b style={{ opacity: 0.9 }}>{t.numero}:</b> : null} {t.nombre}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                                    {tarea.fecha_limite && (
                                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: fechaLimiteVencida ? "#dc2626" : "var(--text-muted)", fontWeight: fechaLimiteVencida ? "600" : "normal" }}>
                                        <Calendar size={13} /> {fechaLimiteVencida ? "Venció:" : "Límite:"} {new Date(tarea.fecha_limite).toLocaleString('es-ES')}
                                      </span>
                                    )}
                                    {nombreArchivoMostrar && (
                                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#27ae60", fontWeight: "500" }}>
                                        <FileSpreadsheet size={13} /> Archivo: {nombreArchivoMostrar}
                                      </span>
                                    )}
                                    {!esDocente && entregado && (
                                      <span style={{ background: "rgba(39, 174, 96, 0.15)", color: "#27ae60", padding: "2px 8px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                                        <CheckCircle2 size={13} /> Entregado {entrega?.calificacion !== null && entrega?.calificacion !== undefined ? `• Nota: ${entrega.calificacion}/100` : ''}
                                      </span>
                                    )}
                                    {!esDocente && !entregado && fechaLimiteVencida && (
                                      <span style={{ background: "rgba(231, 76, 60, 0.15)", color: "#e74c3c", padding: "2px 8px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                                        <AlertCircle size={13} /> Vencida
                                      </span>
                                    )}
                                    {!esDocente && !entregado && !fechaLimiteVencida && (
                                      <span style={{ background: "rgba(243, 156, 18, 0.15)", color: "#d97706", padding: "2px 8px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px" }}>
                                        <Clock size={13} /> Pendiente
                                      </span>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                {!esDocente && !entregado && (
                                    <button 
                                        onClick={() => setTareaSeleccionada(tarea)}
                                        style={{ 
                                          padding: "8px 16px", 
                                          background: fechaLimiteVencida ? "rgba(220, 38, 38, 0.1)" : "#27ae60", 
                                          color: fechaLimiteVencida ? "#dc2626" : "white", 
                                          border: fechaLimiteVencida ? "1px solid rgba(220, 38, 38, 0.3)" : "none", 
                                          borderRadius: "6px", 
                                          cursor: "pointer", 
                                          fontWeight: "bold", 
                                          display: "flex", 
                                          alignItems: "center", 
                                          gap: "6px", 
                                          fontSize: "0.88rem", 
                                          boxShadow: fechaLimiteVencida ? "none" : "0 2px 4px rgba(0,0,0,0.1)" 
                                        }}>
                                        {fechaLimiteVencida ? <AlertCircle size={14} /> : <Play size={14} />}
                                        {fechaLimiteVencida ? "Vencida (Ver)" : "Realizar Tarea"}
                                    </button>
                                )}
                                {!esDocente && entregado && (
                                    <button 
                                        onClick={() => setTareaSeleccionada(tarea)}
                                        style={{ padding: "8px 16px", background: "var(--bg-card)", color: "#27ae60", border: "1px solid #27ae60", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.88rem" }}>
                                        <Eye size={14} /> Ver Entrega
                                    </button>
                                )}
                                {esDocente && (
                                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                        <button 
                                            onClick={() => setTareaParaEntregas(tarea)}
                                            style={{ padding: "8px 14px", background: "var(--bg-card)", color: "var(--accent-color)", border: "1px solid var(--accent-color)", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}>
                                            <Users size={14} /> Ver Entregas
                                        </button>

                                        <button 
                                            onClick={() => handleEliminarTarea(tarea)}
                                            title="Eliminar tarea definitivamente"
                                            style={{ padding: "8px 12px", background: "rgba(220, 38, 38, 0.08)", color: "#dc2626", border: "1px solid rgba(220, 38, 38, 0.25)", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.85rem" }}>
                                            <Trash2 size={14} /> Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

      </div>

      {mostrarModalAsignar && (
          <ModalAsignarTarea 
            curso={curso} 
            onClose={() => setMostrarModalAsignar(false)} 
            onTareaAsignada={() => {
                setMostrarModalAsignar(false);
                cargarDatos();
            }} 
          />
      )}

      {tareaSeleccionada && (
          <VistaTareaEstudiante 
            tarea={tareaSeleccionada} 
            onClose={() => setTareaSeleccionada(null)} 
            onEntregaExitosa={() => {
                setTareaSeleccionada(null);
                cargarDatos();
            }}
          />
      )}

      {tareaParaEntregas && (
          <ModalEntregasDocente 
            tarea={tareaParaEntregas}
            onClose={() => {
                setTareaParaEntregas(null);
                cargarDatos();
            }}
          />
      )}
    </div>
  );
}
