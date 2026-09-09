import React, { useState, useEffect, useMemo } from 'react';
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
  Layers, 
  Search,
  Filter,
  AlertCircle,
  BookOpen,
  GraduationCap,
  RefreshCw,
  Sparkles,
  Trash2
} from 'lucide-react';
import { alerta } from "../../utils/Notificaciones";
import { BASE_URL } from "../../services/api";
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

export default function PestaniaTareas({ cursos = [], esDocente = false, esAdmin = false }) {
  const [cursoFiltro, setCursoFiltro] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos"); // "todos" | "pendientes" | "entregadas"
  const [busqueda, setBusqueda] = useState("");
  
  const [tareasPorCurso, setTareasPorCurso] = useState({}); // { [cursoId]: [tareas] }
  const [entregasPorCurso, setEntregasPorCurso] = useState({}); // { [cursoId]: { [tareaId]: entrega } }
  const [cargando, setCargando] = useState(true);

  // Modales
  const [mostrarModalAsignar, setMostrarModalAsignar] = useState(false);
  const [cursoParaNuevaTarea, setCursoParaNuevaTarea] = useState(null);
  const [tareaParaEntregas, setTareaParaEntregas] = useState(null);
  const [tareaSeleccionadaEstudiante, setTareaSeleccionadaEstudiante] = useState(null);

  const cargarTodasLasTareas = async () => {
    if (!cursos || cursos.length === 0) {
      setTareasPorCurso({});
      setEntregasPorCurso({});
      setCargando(false);
      return;
    }

    setCargando(true);
    const nuevasTareas = {};
    const nuevasEntregas = {};

    try {
      await Promise.all(
        cursos.map(async (curso) => {
          try {
            const resTareas = await fetch(`${BASE_URL}/tareas/clase/${curso.id}`, {
              headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
            });
            if (resTareas.ok) {
              const data = await resTareas.json();
              nuevasTareas[curso.id] = data.map(t => ({ ...t, cursoNombre: curso.nombre, cursoCodigo: curso.codigo }));
            } else {
              nuevasTareas[curso.id] = [];
            }

            if (!esDocente) {
              const resEntregas = await fetch(`${BASE_URL}/tareas/entregas/estudiante/${curso.id}`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
              });
              if (resEntregas.ok) {
                const dataEntregas = await resEntregas.json();
                const mapa = {};
                dataEntregas.forEach(e => {
                  mapa[e.tarea_id] = e;
                });
                nuevasEntregas[curso.id] = mapa;
              } else {
                nuevasEntregas[curso.id] = {};
              }
            }
          } catch (err) {
            console.error(`Error cargando tareas del curso ${curso.id}:`, err);
            nuevasTareas[curso.id] = [];
          }
        })
      );

      setTareasPorCurso(nuevasTareas);
      setEntregasPorCurso(nuevasEntregas);
    } catch (error) {
      console.error("Error global al cargar tareas:", error);
      alerta.error("Error", "No se pudieron cargar algunas tareas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarTodasLasTareas();
  }, [cursos, esDocente]);

  const handleEliminarTarea = async (tarea) => {
    const confirmado = await alerta.confirmar({
      titulo: "Eliminar Tarea",
      mensaje: `¿Estás seguro de que deseas eliminar la tarea «${tarea.titulo}»? Se eliminarán todas las entregas y calificaciones vinculadas. Esta acción no se puede deshacer.`,
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
        alerta.success("Tarea eliminada", "La tarea ha sido eliminada con éxito.");
        cargarTodasLasTareas();
      } else {
        const data = await res.json().catch(() => ({}));
        alerta.error("Error", data.detail || "No se pudo eliminar la tarea.");
      }
    } catch (error) {
      console.error("Error eliminando tarea:", error);
      alerta.error("Error", "Problema de conexión al eliminar la tarea.");
    }
  };

  // Lista plana de todas las tareas según filtros
  const todasLasTareas = useMemo(() => {
    let lista = [];
    Object.keys(tareasPorCurso).forEach(cursoId => {
      if (cursoFiltro === "todos" || String(cursoFiltro) === String(cursoId)) {
        lista = lista.concat(tareasPorCurso[cursoId] || []);
      }
    });

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      lista = lista.filter(t => 
        (t.titulo && t.titulo.toLowerCase().includes(q)) ||
        (t.descripcion && t.descripcion.toLowerCase().includes(q)) ||
        (t.cursoNombre && t.cursoNombre.toLowerCase().includes(q)) ||
        (t.ejercicios_seleccionados && t.ejercicios_seleccionados.toLowerCase().includes(q))
      );
    }

    if (!esDocente) {
      if (filtroEstado === "pendientes") {
        lista = lista.filter(t => {
          const entrega = entregasPorCurso[t.clase_id]?.[t.id];
          const esVencida = Boolean(t.fecha_limite && new Date(t.fecha_limite) < new Date());
          return !entrega && !esVencida;
        });
      } else if (filtroEstado === "entregadas") {
        lista = lista.filter(t => {
          const entrega = entregasPorCurso[t.clase_id]?.[t.id];
          return !!entrega;
        });
      } else if (filtroEstado === "vencidas") {
        lista = lista.filter(t => {
          const entrega = entregasPorCurso[t.clase_id]?.[t.id];
          const esVencida = Boolean(t.fecha_limite && new Date(t.fecha_limite) < new Date());
          return !entrega && esVencida;
        });
      }
    }

    // Ordenar: primero las más recientes o por fecha límite
    return lista.sort((a, b) => new Date(b.created_at || b.id) - new Date(a.created_at || a.id));
  }, [tareasPorCurso, entregasPorCurso, cursoFiltro, filtroEstado, busqueda, esDocente]);

  // Contadores para estudiantes
  const contadoresEstudiante = useMemo(() => {
    if (esDocente) return null;
    let total = 0;
    let entregadas = 0;
    let pendientes = 0;
    let vencidas = 0;

    const ahora = new Date();

    Object.keys(tareasPorCurso).forEach(cursoId => {
      const tareas = tareasPorCurso[cursoId] || [];
      const entregas = entregasPorCurso[cursoId] || {};
      tareas.forEach(t => {
        total++;
        const entrega = entregas[t.id];
        const esVencida = Boolean(t.fecha_limite && new Date(t.fecha_limite) < ahora);

        if (entrega) {
          entregadas++;
        } else if (esVencida) {
          vencidas++;
        } else {
          pendientes++;
        }
      });
    });

    return { total, entregadas, pendientes, vencidas };
  }, [tareasPorCurso, entregasPorCurso, esDocente]);

  const handleAbrirAsignarTarea = () => {
    if (cursoFiltro !== "todos") {
      const cursoSeleccionado = cursos.find(c => String(c.id) === String(cursoFiltro));
      setCursoParaNuevaTarea(cursoSeleccionado || null);
    } else {
      setCursoParaNuevaTarea(null);
    }
    setMostrarModalAsignar(true);
  };

  const temaColor = esDocente ? "var(--primary-color)" : "#27ae60";
  const temaAccent = esDocente ? "var(--accent-color)" : "#27ae60";

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      {/* BARRA SUPERIOR DE ACCIONES Y TÍTULO */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "20px", 
        flexWrap: "wrap", 
        gap: "15px" 
      }}>
        <div>
          <h2 style={{ color: temaColor, margin: 0, fontSize: "clamp(1.2rem, 3vw, 1.55rem)", display: "flex", alignItems: "center", gap: "8px" }}>
            <ClipboardList size={26} />
            {esDocente ? "Gestión de Tareas y Evaluaciones" : "Mis Tareas y Evaluaciones"}
          </h2>
          <p style={{ margin: "4px 0 0 0", color: "var(--text-muted)", fontSize: "0.88rem" }}>
            {esDocente 
              ? "Asigna prácticas de Estadística General a tus cursos y califica las entregas de tus alumnos."
              : "Consulta tus prácticas pendientes, resuélvelas con los datos del curso y revisa tus calificaciones."}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={cargarTodasLasTareas}
            title="Recargar tareas"
            style={{
              padding: "9px 12px",
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "6px",
              cursor: "pointer",
              color: "var(--text-main)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.88rem",
              fontWeight: "600",
              transition: "all 0.2s"
            }}
          >
            <RefreshCw size={15} className={cargando ? "spin" : ""} />
            Actualizar
          </button>

          {esDocente && cursos.length > 0 && (
            <button
              onClick={handleAbrirAsignarTarea}
              style={{
                background: "var(--accent-color)",
                color: "white",
                padding: "10px 18px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.92rem",
                boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                transition: "opacity 0.2s"
              }}
            >
              <Plus size={18} /> Asignar Nueva Tarea
            </button>
          )}
        </div>
      </div>

      {/* METRICAS RÁPIDAS PARA ESTUDIANTE */}
      {!esDocente && contadoresEstudiante && contadoresEstudiante.total > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "12px",
          marginBottom: "20px"
        }}>
          {/* Total Tareas */}
          <div style={{
            background: "var(--bg-card)",
            padding: "14px 18px",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Total Tareas</div>
              <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--text-main)" }}>{contadoresEstudiante.total}</div>
            </div>
            <div style={{ background: "rgba(59, 130, 246, 0.1)", color: "var(--primary-color)", padding: "10px", borderRadius: "8px" }}>
              <ClipboardList size={22} />
            </div>
          </div>

          {/* Pendientes */}
          <div style={{
            background: "var(--bg-card)",
            padding: "14px 18px",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Pendientes</div>
              <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#d97706" }}>{contadoresEstudiante.pendientes}</div>
            </div>
            <div style={{ background: "rgba(243, 156, 18, 0.12)", color: "#d97706", padding: "10px", borderRadius: "8px" }}>
              <Clock size={22} />
            </div>
          </div>

          {/* Entregadas */}
          <div style={{
            background: "var(--bg-card)",
            padding: "14px 18px",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Entregadas</div>
              <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#27ae60" }}>{contadoresEstudiante.entregadas}</div>
            </div>
            <div style={{ background: "rgba(39, 174, 96, 0.12)", color: "#27ae60", padding: "10px", borderRadius: "8px" }}>
              <CheckCircle2 size={22} />
            </div>
          </div>

          {/* Vencidas */}
          <div style={{
            background: "var(--bg-card)",
            padding: "14px 18px",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Vencidas</div>
              <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "#dc2626" }}>{contadoresEstudiante.vencidas}</div>
            </div>
            <div style={{ background: "rgba(220, 38, 38, 0.12)", color: "#dc2626", padding: "10px", borderRadius: "8px" }}>
              <AlertCircle size={22} />
            </div>
          </div>
        </div>
      )}

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div style={{
        background: "var(--bg-card)",
        padding: "16px",
        borderRadius: "10px",
        border: "1px solid var(--border-color)",
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap"
        }}>
          {/* BUSCADOR */}
          <div style={{ flex: "1 1 240px", position: "relative" }}>
            <Search size={17} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Buscar por título, tema o curso..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px 9px 36px",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-input)",
                color: "var(--text-main)",
                fontSize: "0.9rem",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* SELECTOR DE CURSO */}
          <div style={{ flex: "0 0 auto", minWidth: "200px" }}>
            <select
              value={cursoFiltro}
              onChange={(e) => setCursoFiltro(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-input)",
                color: "var(--text-main)",
                fontSize: "0.9rem",
                cursor: "pointer"
              }}
            >
              <option value="todos">Todos los Cursos</option>
              {cursos.map(curso => (
                <option key={curso.id} value={curso.id}>
                  {curso.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* FILTRO DE ESTADO PARA ESTUDIANTE */}
          {!esDocente && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "0.88rem", fontWeight: "600", color: "var(--text-muted)", marginRight: "4px" }}>
                Estado:
              </span>
              <button
                onClick={() => setFiltroEstado("todos")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  border: "1px solid var(--border-color)",
                  background: filtroEstado === "todos" ? "#27ae60" : "transparent",
                  color: filtroEstado === "todos" ? "#ffffff" : "var(--text-main)",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Todas
              </button>
              <button
                onClick={() => setFiltroEstado("pendientes")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  border: "1px solid var(--border-color)",
                  background: filtroEstado === "pendientes" ? "#d97706" : "transparent",
                  color: filtroEstado === "pendientes" ? "#ffffff" : "var(--text-main)",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Pendientes
              </button>
              <button
                onClick={() => setFiltroEstado("entregadas")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  border: "1px solid var(--border-color)",
                  background: filtroEstado === "entregadas" ? "#27ae60" : "transparent",
                  color: filtroEstado === "entregadas" ? "#ffffff" : "var(--text-main)",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Entregadas
              </button>
              <button
                onClick={() => setFiltroEstado("vencidas")}
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  border: "1px solid var(--border-color)",
                  background: filtroEstado === "vencidas" ? "#dc2626" : "transparent",
                  color: filtroEstado === "vencidas" ? "#ffffff" : "var(--text-main)",
                  fontSize: "0.82rem",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Vencidas
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL: LISTADO DE TAREAS */}
      {cargando ? (
        <div style={{ padding: "60px 20px", textAlign: "center", background: "var(--bg-card)", borderRadius: "10px", border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
          <Clock size={36} style={{ animation: "spin 2s linear infinite", marginBottom: "12px", opacity: 0.7 }} />
          <div style={{ fontSize: "1.05rem", fontWeight: "500" }}>Cargando tareas del sistema...</div>
        </div>
      ) : cursos.length === 0 ? (
        <div style={{ padding: "50px 20px", textAlign: "center", background: "var(--bg-card)", borderRadius: "10px", border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
          <GraduationCap size={44} style={{ opacity: 0.35, marginBottom: "12px" }} />
          <h3 style={{ margin: "0 0 8px 0", color: "var(--text-main)" }}>
            {esDocente ? "Aún no tienes cursos creados" : "Aún no estás inscrito en ninguna materia"}
          </h3>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            {esDocente 
              ? "Crea un curso en la pestaña «Cursos» para poder asignar tareas a tus alumnos."
              : "Matricúlate a un curso en la pestaña «Mis Clases» para ver las tareas asignadas por tu docente."}
          </p>
        </div>
      ) : todasLasTareas.length === 0 ? (
        <div style={{ padding: "50px 20px", textAlign: "center", background: "var(--bg-card)", borderRadius: "10px", border: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
          <ClipboardList size={44} style={{ opacity: 0.35, marginBottom: "12px" }} />
          <h3 style={{ margin: "0 0 8px 0", color: "var(--text-main)" }}>
            {busqueda ? "No se encontraron tareas con ese criterio" : "No hay tareas registradas"}
          </h3>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>
            {esDocente 
              ? "Haz clic en «+ Asignar Nueva Tarea» para crear actividades prácticas para tus alumnos."
              : "No tienes tareas pendientes ni asignadas por el momento."}
          </p>
          {esDocente && (
            <button
              onClick={handleAbrirAsignarTarea}
              style={{
                marginTop: "16px",
                background: "var(--accent-color)",
                color: "white",
                padding: "9px 18px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "bold",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Plus size={16} /> Asignar Tarea Ahora
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {todasLasTareas.map(tarea => {
            const entrega = entregasPorCurso[tarea.clase_id]?.[tarea.id];
            const entregado = !!entrega;
            const parsedEjercicios = parseEjerciciosAsignados(tarea.ejercicios_seleccionados);
            const cursoAsociado = cursos.find(c => c.id === tarea.clase_id);

            const fechaLimiteVencida = Boolean(
              tarea.fecha_limite && new Date(tarea.fecha_limite) < new Date()
            );

            return (
              <div 
                key={tarea.id} 
                style={{ 
                  background: "var(--bg-card)", 
                  padding: "20px", 
                  borderRadius: "10px", 
                  border: "1px solid var(--border-color)", 
                  boxShadow: "0 3px 8px rgba(0,0,0,0.04)",
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "flex-start", 
                  gap: "20px", 
                  flexWrap: "wrap",
                  borderLeft: esDocente 
                    ? "4px solid var(--primary-color)" 
                    : entregado 
                      ? "4px solid #27ae60" 
                      : fechaLimiteVencida 
                        ? "4px solid #dc2626" 
                        : "4px solid #d97706"
                }}
              >
                <div style={{ flex: "1 1 300px" }}>
                  {/* CURSO / MATERIA BADGE */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <span style={{
                      background: "rgba(59, 130, 246, 0.1)",
                      color: "var(--primary-color)",
                      padding: "3px 10px",
                      borderRadius: "12px",
                      fontSize: "0.78rem",
                      fontWeight: "bold",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px"
                    }}>
                      <BookOpen size={13} />
                      {tarea.cursoNombre || cursoAsociado?.nombre || `Curso #${tarea.clase_id}`}
                      {tarea.cursoCodigo ? ` • ${tarea.cursoCodigo}` : ""}
                    </span>

                    {!esDocente && entregado && (
                      <span style={{
                        background: "rgba(39, 174, 96, 0.15)",
                        color: "#27ae60",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "0.78rem",
                        fontWeight: "bold",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <CheckCircle2 size={13} />
                        Entregado {entrega?.calificacion !== null && entrega?.calificacion !== undefined ? `• Nota: ${entrega.calificacion}/100` : '(Revisión pendiente)'}
                      </span>
                    )}

                    {!esDocente && !entregado && (
                      <span style={{
                        background: fechaLimiteVencida ? "rgba(220, 38, 38, 0.12)" : "rgba(243, 156, 18, 0.15)",
                        color: fechaLimiteVencida ? "#dc2626" : "#d97706",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontSize: "0.78rem",
                        fontWeight: "bold",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <Clock size={13} />
                        {fechaLimiteVencida ? "Vencida" : "Pendiente"}
                      </span>
                    )}
                  </div>

                  {/* TÍTULO Y DESCRIPCIÓN */}
                  <h3 style={{ margin: "0 0 6px 0", color: "var(--text-main)", fontSize: "1.12rem" }}>
                    {tarea.titulo}
                  </h3>
                  {tarea.descripcion && (
                    <p style={{ margin: "0 0 10px 0", color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.4 }}>
                      {tarea.descripcion}
                    </p>
                  )}

                  {/* TEMAS ASIGNADOS */}
                  {parsedEjercicios && (
                    <div style={{ marginBottom: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                        {parsedEjercicios.modulo && (
                          <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                            <Layers size={13} style={{ color: "var(--primary-color)" }} />
                            {parsedEjercicios.modulo}:
                          </span>
                        )}
                        {parsedEjercicios.temas.map((t, idx) => (
                          <span key={idx} style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            background: "rgba(59, 130, 246, 0.08)",
                            color: "var(--primary-color)",
                            border: "1px solid rgba(59, 130, 246, 0.2)",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            fontSize: "0.76rem",
                            fontWeight: "600"
                          }}>
                            {t.numero ? <b style={{ opacity: 0.9 }}>{t.numero}:</b> : null} {t.nombre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* METADATOS: FECHA Y ARCHIVO */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "8px" }}>
                    {tarea.fecha_limite && (
                      <span style={{ display: "flex", alignItems: "center", gap: "5px", color: fechaLimiteVencida ? "#dc2626" : "var(--text-muted)", fontWeight: fechaLimiteVencida ? "600" : "normal" }}>
                        <Calendar size={14} /> Fecha límite: {new Date(tarea.fecha_limite).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    )}
                    {tarea.archivo_nombre && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#27ae60", fontWeight: "500" }}>
                        <FileSpreadsheet size={14} /> Archivo: {tarea.archivo_nombre}
                      </span>
                    )}
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN */}
                <div style={{ display: "flex", gap: "8px", alignSelf: "center", flexShrink: 0 }}>
                  {esDocente ? (
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button 
                        onClick={() => setTareaParaEntregas(tarea)}
                        style={{ 
                          padding: "9px 18px", 
                          background: "var(--bg-main)", 
                          color: "var(--accent-color)", 
                          border: "1px solid var(--accent-color)", 
                          borderRadius: "6px", 
                          cursor: "pointer", 
                          fontWeight: "bold", 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "6px", 
                          fontSize: "0.9rem",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-color)"; e.currentTarget.style.color = "white"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-main)"; e.currentTarget.style.color = "var(--accent-color)"; }}
                      >
                        <Users size={16} /> Ver Entregas
                      </button>

                      <button 
                        onClick={() => handleEliminarTarea(tarea)}
                        title="Eliminar tarea definitivamente"
                        style={{ 
                          padding: "9px 14px", 
                          background: "rgba(220, 38, 38, 0.08)", 
                          color: "#dc2626", 
                          border: "1px solid rgba(220, 38, 38, 0.25)", 
                          borderRadius: "6px", 
                          cursor: "pointer", 
                          fontWeight: "bold", 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "6px", 
                          fontSize: "0.9rem",
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "white"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(220, 38, 38, 0.08)"; e.currentTarget.style.color = "#dc2626"; }}
                      >
                        <Trash2 size={16} /> Eliminar
                      </button>
                    </div>
                  ) : (
                    <>
                      {!entregado ? (
                        <button 
                          onClick={() => setTareaSeleccionadaEstudiante(tarea)}
                          style={{ 
                            padding: "9px 18px", 
                            background: fechaLimiteVencida ? "rgba(220, 38, 38, 0.1)" : "#27ae60", 
                            color: fechaLimiteVencida ? "#dc2626" : "white", 
                            border: fechaLimiteVencida ? "1px solid rgba(220, 38, 38, 0.3)" : "none", 
                            borderRadius: "6px", 
                            cursor: "pointer", 
                            fontWeight: "bold", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "6px", 
                            fontSize: "0.9rem", 
                            boxShadow: fechaLimiteVencida ? "none" : "0 2px 6px rgba(39, 174, 96, 0.25)",
                            transition: "all 0.2s"
                          }}
                        >
                          {fechaLimiteVencida ? <AlertCircle size={15} /> : <Play size={15} />}
                          {fechaLimiteVencida ? "Vencida (Ver)" : "Realizar Tarea"}
                        </button>
                      ) : (
                        <button 
                          onClick={() => setTareaSeleccionadaEstudiante(tarea)}
                          style={{ 
                            padding: "9px 18px", 
                            background: "var(--bg-main)", 
                            color: "#27ae60", 
                            border: "1px solid #27ae60", 
                            borderRadius: "6px", 
                            cursor: "pointer", 
                            fontWeight: "bold", 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "6px", 
                            fontSize: "0.9rem",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#27ae60"; e.currentTarget.style.color = "white"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-main)"; e.currentTarget.style.color = "#27ae60"; }}
                        >
                          <Eye size={15} /> Ver Mi Entrega
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE CREAR / ASIGNAR TAREA (DOCENTE) */}
      {mostrarModalAsignar && (
        <ModalAsignarTarea 
          curso={cursoParaNuevaTarea}
          cursos={cursos}
          onClose={() => {
            setMostrarModalAsignar(false);
            setCursoParaNuevaTarea(null);
          }} 
          onTareaAsignada={() => {
            setMostrarModalAsignar(false);
            setCursoParaNuevaTarea(null);
            cargarTodasLasTareas();
          }} 
        />
      )}

      {/* MODAL DE REVISIÓN DE ENTREGAS (DOCENTE) */}
      {tareaParaEntregas && (
        <ModalEntregasDocente 
          tarea={tareaParaEntregas}
          onClose={() => {
            setTareaParaEntregas(null);
            cargarTodasLasTareas();
          }}
        />
      )}

      {/* MODAL DE RESOLUCIÓN / VISTA DE TAREA (ESTUDIANTE) */}
      {tareaSeleccionadaEstudiante && (
        <VistaTareaEstudiante 
          tarea={tareaSeleccionadaEstudiante} 
          onClose={() => setTareaSeleccionadaEstudiante(null)} 
          onEntregaExitosa={() => {
            setTareaSeleccionadaEstudiante(null);
            cargarTodasLasTareas();
          }}
        />
      )}
    </div>
  );
}
