import React, { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { 
  ClipboardPlus, 
  FileText, 
  AlignLeft, 
  Layers, 
  FileSpreadsheet, 
  Calendar, 
  Check, 
  CheckCheck, 
  Send, 
  X 
} from 'lucide-react';
import { alerta } from "../../utils/Notificaciones";
import { BASE_URL } from "../../services/api";

registerLocale("es", es);

const TEMAS_ESTADISTICA_GENERAL = [
  { id: "tema2_simple", numero: "Tema 2", nombre: "Tabla de Frecuencias", desc: "Frecuencias absolutas, relativas, acumuladas y porcentuales (datos no agrupados).", calculoTipo: "frecuencias_completas" },
  { id: "tema2_intervalos", numero: "Tema 2", nombre: "Distribución por Intervalos", desc: "Construcción de clases, intervalos, marcas de clase y frecuencias agrupadas.", calculoTipo: "distribucion_intervalos" },
  { id: "tema3", numero: "Tema 3", nombre: "Medidas de Tendencia Central", desc: "Media, mediana, moda, media ponderada y fractiles.", calculoTipo: "tendencia_y_posicion" },
  { id: "tema4", numero: "Tema 4", nombre: "Medidas de Dispersión y Forma", desc: "Varianza, desviación estándar, coeficiente de variación, asimetría y curtosis.", calculoTipo: "variabilidad_y_forma" },
  { id: "tema5", numero: "Tema 5", nombre: "Distribuciones Bivariantes", desc: "Tablas de doble entrada, covarianza y correlación lineal.", calculoTipo: "distribucion_bivariada_avanzada" },
  { id: "tema6", numero: "Tema 6", nombre: "Análisis de Regresión", desc: "Regresión lineal simple, no lineal y multivariante.", calculoTipo: "regresion_simple" },
  { id: "tema7", numero: "Tema 7", nombre: "Series Temporales", desc: "Análisis de series de tiempo, tendencia y componentes estacionales.", calculoTipo: "series_tiempo" },
  { id: "tema8", numero: "Tema 8", nombre: "Números Índices", desc: "Índices simples, compuestos y deflación.", calculoTipo: "numeros_indices" },
];

export default function ModalAsignarTarea({ curso, cursos = [], onClose, onTareaAsignada }) {
  const listaCursos = cursos.length > 0 ? cursos : (curso ? [curso] : []);
  const [cursoActualId, setCursoActualId] = useState(curso?.id || (listaCursos[0]?.id || null));
  const cursoActivo = listaCursos.find(c => c.id === cursoActualId) || curso || null;

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaLimite, setFechaLimite] = useState(null);
  const [temasSeleccionados, setTemasSeleccionados] = useState([]);
  const [archivoId, setArchivoId] = useState(null);
  const [archivosCurso, setArchivosCurso] = useState([]);
  const [cargandoArchivos, setCargandoArchivos] = useState(false);
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (!cursoActualId && listaCursos.length > 0) {
      setCursoActualId(listaCursos[0].id);
    }
  }, [listaCursos, cursoActualId]);

  useEffect(() => {
    const fetchArchivos = async () => {
      if (!cursoActualId) {
        setArchivosCurso([]);
        return;
      }
      setCargandoArchivos(true);
      setArchivoId(null);
      try {
        const res = await fetch(`${BASE_URL}/files?curso=${cursoActualId}&visibilidad=privado`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setArchivosCurso(data.files || []);
        }
      } catch (error) {
        console.error("Error cargando archivos del curso:", error);
      } finally {
        setCargandoArchivos(false);
      }
    };
    fetchArchivos();
  }, [cursoActualId]);

  const toggleTema = (id) => {
    setTemasSeleccionados(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const toggleTodos = () => {
    if (temasSeleccionados.length === TEMAS_ESTADISTICA_GENERAL.length) {
      setTemasSeleccionados([]);
    } else {
      setTemasSeleccionados(TEMAS_ESTADISTICA_GENERAL.map(t => t.id));
    }
  };

  const todosSeleccionados = temasSeleccionados.length === TEMAS_ESTADISTICA_GENERAL.length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cursoActualId) {
      alerta.error("Curso requerido", "Debe seleccionar un curso para asignar la tarea.");
      return;
    }
    if (!titulo.trim()) {
      alerta.error("Campos vacíos", "El título de la tarea es obligatorio.");
      return;
    }

    if (temasSeleccionados.length === 0) {
      alerta.error("Temas requeridos", "Debe seleccionar al menos un tema de Estadística General.");
      return;
    }

    let ejerciciosString = "";
    if (todosSeleccionados) {
      ejerciciosString = "Estadística General: Todos los temas (Temas 2 al 8)";
    } else {
      const nombresTemas = TEMAS_ESTADISTICA_GENERAL
        .filter(t => temasSeleccionados.includes(t.id))
        .map(t => `${t.numero}: ${t.nombre}`);
      ejerciciosString = `Estadística General: ${nombresTemas.join(", ")}`;
    }

    if (fechaLimite && new Date(fechaLimite).getTime() < Date.now()) {
      alerta.advertencia("Fecha no válida", "La fecha límite no puede ser anterior a la fecha y hora actual.");
      return;
    }

    setProcesando(true);
    try {
      const res = await fetch(`${BASE_URL}/tareas/`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          titulo,
          descripcion,
          clase_id: cursoActualId,
          archivo_id: archivoId,
          ejercicios_seleccionados: ejerciciosString,
          fecha_limite: fechaLimite ? fechaLimite.toISOString() : null
        })
      });

      const data = await res.json();
      if (res.ok) {
        alerta.success("Tarea Asignada", "La tarea ha sido asignada al grupo correctamente.");
        onTareaAsignada(data);
        onClose();
      } else {
        alerta.error("Error", data.detail || "No se pudo asignar la tarea");
      }
    } catch (error) {
      alerta.error("Error de conexión", "No se pudo contactar con el servidor.");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000, padding: "16px" }}>
      <div style={{ background: "var(--bg-card)", padding: "28px", borderRadius: "12px", width: "100%", maxWidth: "680px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.25)", border: "1px solid var(--border-color)", boxSizing: "border-box" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "rgba(59, 130, 246, 0.1)", padding: "8px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-color)" }}>
              <ClipboardPlus size={22} />
            </div>
            <h2 style={{ margin: 0, color: "var(--primary-color)", fontSize: "1.35rem" }}>
              {cursoActivo ? `Asignar Tarea a ${cursoActivo.nombre}` : "Asignar Nueva Tarea"}
            </h2>
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

        <form onSubmit={handleSubmit}>
          {listaCursos.length > 1 && !curso && (
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", fontWeight: "bold", fontSize: "0.9rem" }}>
                <Layers size={15} style={{ color: "var(--primary-color)" }} /> Curso / Asignatura de Destino:
              </label>
              <select
                value={cursoActualId || ""}
                onChange={(e) => setCursoActualId(parseInt(e.target.value))}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-input)", color: "var(--text-main)", boxSizing: "border-box", fontWeight: "500" }}
                required
              >
                {listaCursos.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.codigo ? `(${c.codigo})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", fontWeight: "bold", fontSize: "0.9rem" }}>
              <FileText size={15} style={{ color: "var(--primary-color)" }} /> Título de la Tarea:
            </label>
            <input 
              type="text" 
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)} 
              placeholder="Ej. Tarea 1: Distribución de Frecuencias y Medidas de Tendencia Central" 
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-input)", color: "var(--text-main)", boxSizing: "border-box" }}
              required 
            />
          </div>
          
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", fontWeight: "bold", fontSize: "0.9rem" }}>
              <AlignLeft size={15} style={{ color: "var(--primary-color)" }} /> Descripción / Instrucciones:
            </label>
            <textarea 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)} 
              placeholder="Instrucciones detalladas de la tarea para los estudiantes..."
              rows={2}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-input)", color: "var(--text-main)", boxSizing: "border-box", resize: "vertical" }}
            />
          </div>

          {/* TABLA DE SELECCIÓN DE TEMAS ESTADÍSTICA GENERAL */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "bold", fontSize: "0.9rem" }}>
                <Layers size={15} style={{ color: "var(--primary-color)" }} /> Módulo: Estadística General (Seleccionar Temas):
              </label>
              <button
                type="button"
                onClick={toggleTodos}
                style={{
                  background: todosSeleccionados ? "var(--primary-color)" : "var(--bg-main)",
                  color: todosSeleccionados ? "#fff" : "var(--text-main)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "5px",
                  padding: "4px 10px",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  transition: "all 0.2s ease"
                }}
              >
                {todosSeleccionados ? <><CheckCheck size={14} /> Todos seleccionados</> : <><Check size={14} /> Seleccionar todos (Temas 2 al 8)</>}
              </button>
            </div>

            <div style={{ border: "1px solid var(--border-color)", borderRadius: "8px", overflow: "hidden", maxHeight: "230px", overflowY: "auto", background: "var(--bg-main)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem", textAlign: "left" }}>
                <thead>
                  <tr style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
                    <th style={{ padding: "8px 12px", width: "40px", textAlign: "center" }}>
                      <input 
                        type="checkbox"
                        checked={todosSeleccionados}
                        onChange={toggleTodos}
                        style={{ cursor: "pointer" }}
                      />
                    </th>
                    <th style={{ padding: "8px 12px", width: "130px" }}>Tema</th>
                    <th style={{ padding: "8px 12px" }}>Contenido / Temario</th>
                  </tr>
                </thead>
                <tbody>
                  {TEMAS_ESTADISTICA_GENERAL.map((tema) => {
                    const isSelected = temasSeleccionados.includes(tema.id);
                    return (
                      <tr 
                        key={tema.id}
                        onClick={() => toggleTema(tema.id)}
                        style={{ 
                          borderBottom: "1px solid var(--border-color)", 
                          cursor: "pointer", 
                          background: isSelected ? "rgba(59, 130, 246, 0.08)" : "transparent",
                          transition: "background 0.15s ease"
                        }}
                      >
                        <td style={{ padding: "8px 12px", textAlign: "center" }}>
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by row onClick
                            style={{ cursor: "pointer" }}
                          />
                        </td>
                        <td style={{ padding: "8px 12px", fontWeight: "600", color: isSelected ? "var(--primary-color)" : "var(--text-main)" }}>
                          {tema.numero}
                        </td>
                        <td style={{ padding: "8px 12px" }}>
                          <div style={{ fontWeight: "500", color: "var(--text-main)" }}>{tema.nombre}</div>
                          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>{tema.desc}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px", textAlign: "right" }}>
              {temasSeleccionados.length} de {TEMAS_ESTADISTICA_GENERAL.length} temas seleccionados
            </div>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", fontWeight: "bold", fontSize: "0.9rem" }}>
              <FileSpreadsheet size={15} style={{ color: "#27ae60" }} /> Archivo Base Excel del Curso (Opcional):
            </label>
            <select
              value={archivoId || ""}
              onChange={(e) => setArchivoId(e.target.value ? parseInt(e.target.value) : null)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid var(--border-color)", background: "var(--bg-input)", color: "var(--text-main)", boxSizing: "border-box" }}
              disabled={cargandoArchivos}
            >
              <option value="">-- Sin archivo adjunto --</option>
              {archivosCurso.map(archivo => (
                <option key={archivo.id} value={archivo.id}>
                  {archivo.filename}
                </option>
              ))}
            </select>
            {cargandoArchivos && (
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Cargando archivos del curso...</span>
            )}
            {!cargandoArchivos && archivosCurso.length === 0 && (
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "3px" }}>
                No hay archivos Excel subidos en este curso aún. Puedes subir archivos en la sección <b>Archivos &gt; Mis Cursos</b>.
              </div>
            )}
          </div>

          <div style={{ marginBottom: "22px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", fontWeight: "bold", fontSize: "0.9rem" }}>
              <Calendar size={15} style={{ color: "var(--primary-color)" }} /> Fecha Límite (Opcional):
            </label>
            <DatePicker
              selected={fechaLimite}
              onChange={(date) => setFechaLimite(date)}
              dateFormat="dd/MM/yyyy h:mm aa"
              showTimeSelect
              locale="es"
              placeholderText="Seleccionar fecha y hora"
              isClearable
              minDate={new Date()}
              filterTime={(time) => {
                const currentDate = new Date();
                const selectedDate = new Date(time);
                if (fechaLimite && fechaLimite.toDateString() === currentDate.toDateString()) {
                  return selectedDate.getTime() >= currentDate.getTime();
                }
                return true;
              }}
              className="selector-fecha"
            />
          </div>

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 16px", background: "var(--bg-main)", color: "var(--text-main)", border: "1px solid var(--border-color)", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
              <X size={16} /> Cancelar
            </button>
            <button type="submit" disabled={procesando} style={{ padding: "10px 22px", background: "var(--accent-color)", color: "white", border: "none", borderRadius: "6px", cursor: procesando ? "not-allowed" : "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
              <Send size={16} /> {procesando ? "Asignando..." : "Asignar Tarea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
