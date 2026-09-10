import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpenCheck, 
  Info, 
  Layers, 
  Calendar, 
  FileSpreadsheet, 
  ExternalLink, 
  Send, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  Check,
  CheckCheck,
  FileCheck,
  Award,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Eye,
  Calculator
} from 'lucide-react';
import { alerta } from "../../utils/Notificaciones";
import { BASE_URL, api } from "../../services/api";
import { useData } from "../../components/Gestion_Datos/DataContext";

const TOPIC_CALCULATION_MAPPINGS = {
  "tema 2": ["frecuencias_completas", "distribucion_intervalos", "tabla_frecuencias", "distribucion_de_frecuencias"],
  "tema 3": ["tendencia_y_posicion", "tendencia_central", "medidas_posicion", "medidas_de_tendencia_central"],
  "tema 4": ["variabilidad_y_forma", "medidas_dispersion", "medidas_de_dispersion_y_forma"],
  "tema 5": ["distribucion_bivariada_avanzada", "distribucion_bivariada", "distribuciones_bivariantes"],
  "tema 6": ["regresion_simple", "regresion_lineal", "regresion_multivariante", "analisis_de_regresion"],
  "tema 7": ["series_tiempo", "series_temporales"],
  "tema 8": ["numeros_indices", "analisis_de_indices_y_deflacion"]
};

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
        { numero: "Tema 2", nombre: "Tabla de Frecuencias", calculoTipo: "frecuencias_completas" },
        { numero: "Tema 2", nombre: "Distribución por Intervalos", calculoTipo: "distribucion_intervalos" },
        { numero: "Tema 3", nombre: "Medidas de Tendencia Central", calculoTipo: "tendencia_y_posicion" },
        { numero: "Tema 4", nombre: "Medidas de Dispersión y Forma", calculoTipo: "variabilidad_y_forma" },
        { numero: "Tema 5", nombre: "Distribuciones Bivariantes", calculoTipo: "distribucion_bivariada_avanzada" },
        { numero: "Tema 6", nombre: "Análisis de Regresión", calculoTipo: "regresion_simple" },
        { numero: "Tema 7", nombre: "Series Temporales", calculoTipo: "series_tiempo" },
        { numero: "Tema 8", nombre: "Números Índices", calculoTipo: "numeros_indices" },
      ]
    };
  }

  const partes = resto.split(/,\s*(?=Tema\s*\d+)/i);
  const temas = partes.map(p => {
    const match = p.match(/^(Tema\s*\d+)[\s*:\-\–]+(.*)$/i);
    if (match) {
      const num = match[1].trim();
      const nom = match[2].trim();
      let calcTipo = "frecuencias_completas";
      if (num.includes("2")) {
        calcTipo = nom.toLowerCase().includes("intervalo") ? "distribucion_intervalos" : "frecuencias_completas";
      } else if (num.includes("3")) {
        calcTipo = "tendencia_y_posicion";
      } else if (num.includes("4")) {
        calcTipo = "variabilidad_y_forma";
      } else if (num.includes("5")) {
        calcTipo = "distribucion_bivariada_avanzada";
      } else if (num.includes("6")) {
        calcTipo = "regresion_simple";
      } else if (num.includes("7")) {
        calcTipo = "series_tiempo";
      } else if (num.includes("8")) {
        calcTipo = "numeros_indices";
      }
      return { numero: num, nombre: nom, calculoTipo: calcTipo };
    }
    return { numero: "", nombre: p.trim(), calculoTipo: "frecuencias_completas" };
  }).filter(t => t.nombre || t.numero);

  return {
    modulo: modulo || "Estadística General",
    esTodos: false,
    textoResumen: resto,
    temas
  };
};

const parseSnapshotData = (snapshot) => {
  if (!snapshot) return null;
  if (typeof snapshot === "object") return snapshot;
  try {
    const p1 = JSON.parse(snapshot);
    if (typeof p1 === "string") {
      try { return JSON.parse(p1); } catch (e) { return p1; }
    }
    return p1;
  } catch (e) {
    return null;
  }
};

const verificarTemaRealizado = (temaObj, historial, archivoRequerido, tareaIdActual) => {
  if (!historial || !Array.isArray(historial) || historial.length === 0) {
    return { realizado: false, record: null };
  }

  const num = (temaObj.numero || "").toLowerCase().trim();
  const nombre = (temaObj.nombre || "").toLowerCase().trim();
  const calculoEspecifico = (temaObj.calculoTipo || "").toLowerCase().trim();
  const reqNormalized = archivoRequerido ? archivoRequerido.toLowerCase().replace(/\.xlsx?$|\.xls$|\.csv$/i, "").trim() : "";

  for (const record of historial) {
    // Validar que el cálculo haya sido guardado exclusivamente para esta tarea específica
    const snap = parseSnapshotData(record.snapshot);
    const recTareaId = snap?.tarea_id || snap?.configuracion?.tarea_id || record.tarea_id;

    if (tareaIdActual) {
      if (!recTareaId || String(recTareaId) !== String(tareaIdActual)) {
        continue;
      }
    }

    if (archivoRequerido) {
      const recFileNormalized = (record.archivo_origen || "").toLowerCase().replace(/\.xlsx?$|\.xls$|\.csv$/i, "").trim();
      const directMatch = record.archivo_origen && record.archivo_origen.toLowerCase() === archivoRequerido.toLowerCase();
      if (!directMatch && reqNormalized !== recFileNormalized) {
        continue;
      }
    }

    const calcType = (record.calculo || "").toLowerCase().trim();

    // 1. Si el ejercicio requiere intervalos específicamente
    if (calculoEspecifico === "distribucion_intervalos" || nombre.includes("intervalo")) {
      if (calcType === "distribucion_intervalos" || calcType.includes("intervalo")) {
        return { realizado: true, record };
      }
      continue;
    }

    // 2. Si el ejercicio es Tabla de Frecuencias (sin intervalos)
    if (calculoEspecifico === "frecuencias_completas" || nombre.includes("tabla de frecuencias") || (num.includes("2") && !nombre.includes("intervalo"))) {
      if (calcType === "frecuencias_completas" || (calcType.includes("frecuencia") && !calcType.includes("intervalo"))) {
        return { realizado: true, record };
      }
      continue;
    }

    // 3. Temas 3 - 8
    if (num.includes("3") || nombre.includes("tendencia") || nombre.includes("central")) {
      if (calcType.includes("tendencia") || calcType.includes("posicion") || calcType.includes("central") || calcType.includes("media")) return { realizado: true, record };
    }
    if (num.includes("4") || nombre.includes("dispersión") || nombre.includes("dispersion") || nombre.includes("forma") || nombre.includes("variabilidad")) {
      if (calcType.includes("variabilidad") || calcType.includes("forma") || calcType.includes("dispersion") || calcType.includes("varianza")) return { realizado: true, record };
    }
    if (num.includes("5") || nombre.includes("bivariante") || nombre.includes("bivariada")) {
      if (calcType.includes("bivariada") || calcType.includes("bivariante")) return { realizado: true, record };
    }
    if (num.includes("6") || nombre.includes("regresión") || nombre.includes("regresion")) {
      if (calcType.includes("regresion")) return { realizado: true, record };
    }
    if (num.includes("7") || nombre.includes("temporal") || nombre.includes("serie") || nombre.includes("tiempo")) {
      if (calcType.includes("series") || calcType.includes("tiempo")) return { realizado: true, record };
    }
    if (num.includes("8") || nombre.includes("índice") || nombre.includes("indice") || nombre.includes("deflacion")) {
      if (calcType.includes("indice") || calcType.includes("deflacion")) return { realizado: true, record };
    }
  }

  return { realizado: false, record: null };
};

export default function VistaTareaEstudiante({ tarea, onClose, onEntregaExitosa }) {
  const navigate = useNavigate();
  const { usuario } = useData();
  const [procesando, setProcesando] = useState(false);
  const [cargandoValidacion, setCargandoValidacion] = useState(true);
  const [nombreArchivo, setNombreArchivo] = useState(tarea.archivo_nombre || "");
  const [historialUsuario, setHistorialUsuario] = useState([]);
  const [entregaExistente, setEntregaExistente] = useState(null);
  const [temaExpandido, setTemaExpandido] = useState(null);

  const cargarDatosValidacion = async () => {
    setCargandoValidacion(true);
    setEntregaExistente(null);
    setHistorialUsuario([]);
    setTemaExpandido(null);

    try {
      if (!tarea.archivo_nombre && tarea.archivo_id) {
        try {
          const res = await fetch(`${BASE_URL}/files?curso=${tarea.clase_id}&visibilidad=privado`, {
            headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
          });
          if (res.ok) {
            const data = await res.json();
            const found = (data.files || []).find(f => f.id === tarea.archivo_id);
            if (found) {
              setNombreArchivo(found.filename);
            }
          }
        } catch (e) {
          console.error("Error al obtener nombre de archivo:", e);
        }
      }

      if (usuario?.nombre) {
        const resHistorial = await api.obtenerHistorial(usuario.nombre);
        if (resHistorial && resHistorial.historial) {
          setHistorialUsuario(resHistorial.historial);
        } else {
          setHistorialUsuario([]);
        }
      } else {
        setHistorialUsuario([]);
      }

      try {
        const resEntrega = await fetch(`${BASE_URL}/tareas/entregas/${tarea.id}/mi-entrega`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
        });
        if (resEntrega.ok) {
          const dataEntrega = await resEntrega.json();
          setEntregaExistente(dataEntrega);
        } else {
          setEntregaExistente(null);
        }
      } catch (e) {
        console.error("No se encontró entrega previa:", e);
        setEntregaExistente(null);
      }
    } catch (error) {
      console.error("Error al cargar datos de validación:", error);
    } finally {
      setCargandoValidacion(false);
    }
  };

  useEffect(() => {
    cargarDatosValidacion();
  }, [tarea.id, usuario?.id, usuario?.nombre, usuario?.rol]);

  const datosRespuestaParsed = React.useMemo(() => {
    if (!entregaExistente?.datos_respuesta) return null;
    try {
      return JSON.parse(entregaExistente.datos_respuesta);
    } catch (e) {
      return null;
    }
  }, [entregaExistente]);

  const parsed = parseEjerciciosAsignados(tarea.ejercicios_seleccionados);
  const archivoDeHistorial = (historialUsuario || []).find(r => {
    const snap = parseSnapshotData(r.snapshot);
    const recTareaId = snap?.tarea_id || snap?.configuracion?.tarea_id || r.tarea_id;
    return recTareaId && String(recTareaId) === String(tarea.id);
  })?.archivo_origen;

  const archivoReq = nombreArchivo || tarea.archivo_nombre || datosRespuestaParsed?.archivo_base || archivoDeHistorial || "";

  const temasConEstado = (parsed?.temas || []).map(t => {
    if (datosRespuestaParsed?.temas_completados) {
      const deliveredMatch = datosRespuestaParsed.temas_completados.find(item => {
        if (t.calculoTipo && item.calculoTipo) {
          return item.calculoTipo === t.calculoTipo;
        }
        if (t.nombre && item.nombre) {
          return item.nombre.toLowerCase().trim() === t.nombre.toLowerCase().trim();
        }
        return item.numero && t.numero && item.numero.toLowerCase().trim() === t.numero.toLowerCase().trim();
      });
      if (deliveredMatch) {
        return {
          ...t,
          realizado: true,
          calculoGuardado: {
            calculo: deliveredMatch.calculoTipo,
            fecha: deliveredMatch.fechaCalculo,
            hora: deliveredMatch.horaCalculo,
            archivo_origen: deliveredMatch.archivoOrigen,
            snapshot: deliveredMatch.snapshot
          }
        };
      }
    }

    const { realizado, record } = verificarTemaRealizado(t, historialUsuario, archivoReq, tarea.id);
    return {
      ...t,
      realizado,
      calculoGuardado: record
    };
  });

  const totalTemas = temasConEstado.length;
  const temasCompletados = temasConEstado.filter(t => t.realizado).length;
  const todosCompletados = totalTemas > 0 && temasCompletados === totalTemas;
  const porcentajeProgreso = totalTemas > 0 ? Math.round((temasCompletados / totalTemas) * 100) : 0;
  const esVencida = Boolean(tarea.fecha_limite && new Date(tarea.fecha_limite).getTime() < Date.now());

  const handleEnviarTarea = async () => {
    if (esVencida) {
      alerta.error("Plazo vencido", "La fecha límite para entregar esta tarea ha vencido. Ya no se reciben más entregas.");
      return;
    }

    if (!todosCompletados) {
      alerta.advertencia("Cálculos incompletos", "Debes realizar y guardar todos los temas requeridos antes de enviar la tarea.");
      return;
    }

    setProcesando(true);
    try {
      const resumenResultados = temasConEstado.map(t => ({
        numero: t.numero,
        nombre: t.nombre,
        calculoTipo: t.calculoGuardado?.calculo,
        fechaCalculo: t.calculoGuardado?.fecha,
        horaCalculo: t.calculoGuardado?.hora,
        archivoOrigen: t.calculoGuardado?.archivo_origen,
        snapshot: t.calculoGuardado?.snapshot
      }));

      const datosRespuestaFinal = JSON.stringify({
        archivo_base: archivoReq || "Sin archivo",
        fecha_entrega: new Date().toISOString(),
        temas_completados: resumenResultados
      });

      const res = await fetch(`${BASE_URL}/tareas/entregas/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tarea_id: tarea.id,
          datos_respuesta: datosRespuestaFinal
        })
      });

      const data = await res.json();
      if (res.ok) {
        alerta.success("Tarea Entregada", "¡Felicidades! Has enviado tu tarea con todos los resultados validados.");
        setEntregaExistente(data);
        if (onEntregaExitosa) onEntregaExitosa(data);
      } else {
        alerta.error("Error", data.detail || "No se pudo entregar la tarea");
      }
    } catch (error) {
      alerta.error("Error de conexión", "No se pudo contactar con el servidor.");
    } finally {
      setProcesando(false);
    }
  };

  const irACalculadora = () => {
    if (onClose) onClose();
    const tareaEntregada = Boolean(entregaExistente);
    sessionStorage.setItem("tarea_contexto_calculadora", JSON.stringify({
      tareaId: tarea.id,
      tareaTitulo: tarea.titulo,
      claseId: tarea.clase_id,
      tareaEntregada
    }));

    const primerTemaPendiente = temasConEstado.find(t => !t.realizado) || temasConEstado[0];
    const calculoApertura = primerTemaPendiente?.calculoGuardado?.calculo || primerTemaPendiente?.calculoTipo || "frecuencias_completas";
    const tieneArchivoDocente = Boolean(tarea.archivo_id || archivoReq);

    navigate("/calculadora", {
      state: {
        archivoReabrir: tieneArchivoDocente ? archivoReq : "",
        archivoSeleccionadoId: tieneArchivoDocente ? tarea.archivo_id : null,
        calculoReabrir: calculoApertura,
        sinArchivo: !tieneArchivoDocente,
        origenArchivos: "curso",
        cursoSeleccionado: String(tarea.clase_id),
        tareaId: tarea.id,
        tareaTitulo: tarea.titulo,
        tareaEntregada,
        soloLectura: tareaEntregada
      }
    });
  };

  const reabrirEjercicio = (tema) => {
    if (onClose) onClose();
    const tareaEntregada = Boolean(entregaExistente);
    const tieneArchivoDocente = Boolean(tarea.archivo_id || archivoReq);
    const archivoFinal = tema.calculoGuardado?.archivo_origen || (tieneArchivoDocente ? archivoReq : "");
    const datosBrutos = tema.calculoGuardado?.snapshot;
    const snapshotListo = typeof datosBrutos === "string" ? JSON.parse(datosBrutos) : datosBrutos;

    sessionStorage.setItem("tarea_contexto_calculadora", JSON.stringify({
      tareaId: tarea.id,
      tareaTitulo: tarea.titulo,
      claseId: tarea.clase_id,
      tareaEntregada
    }));

    navigate("/calculadora", {
      state: {
        archivoReabrir: archivoFinal,
        archivoSeleccionadoId: tieneArchivoDocente ? tarea.archivo_id : null,
        calculoReabrir: tema.calculoGuardado?.calculo || tema.calculoTipo,
        snapshot: snapshotListo,
        sinArchivo: !archivoFinal,
        origenArchivos: "curso",
        cursoSeleccionado: String(tarea.clase_id),
        tareaId: tarea.id,
        tareaTitulo: tarea.titulo,
        tareaEntregada,
        soloLectura: tareaEntregada
      }
    });
  };

  const renderSnapshotData = (snapshot) => {
    if (!snapshot) return <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Sin datos adicionales de snapshot</div>;
    
    if (typeof snapshot === "object") {
      const keys = Object.keys(snapshot);
      if (keys.length === 0) return null;
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "6px", marginTop: "8px" }}>
          {keys.slice(0, 10).map((k) => {
            const val = snapshot[k];
            if (typeof val === "object" && val !== null) return null;
            return (
              <div key={k} style={{ background: "var(--bg-main)", border: "1px solid var(--border-color)", padding: "4px 8px", borderRadius: "4px" }}>
                <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{k.replace(/_/g, " ")}</div>
                <div style={{ fontSize: "0.82rem", fontWeight: "bold", color: "var(--text-main)" }}>{String(val)}</div>
              </div>
            );
          })}
        </div>
      );
    }
    return <div style={{ fontSize: "0.78rem" }}>{String(snapshot)}</div>;
  };

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10000, padding: "16px" }}>
      <div style={{ background: "var(--bg-card)", padding: "26px 30px", borderRadius: "14px", width: "100%", maxWidth: "720px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 15px 35px rgba(0,0,0,0.3)", border: "1px solid var(--border-color)", boxSizing: "border-box" }}>
        
        {/* ========================================================= */}
        {/* 1. CABECERA PRINCIPAL CON METADATOS Y BADGES              */}
        {/* ========================================================= */}
        <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "16px", marginBottom: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ background: "rgba(39, 174, 96, 0.12)", color: "#27ae60", padding: "10px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BookOpenCheck size={26} />
              </div>
              <div>
                <h2 style={{ margin: "0 0 4px 0", color: "var(--text-main)", fontSize: "1.35rem", fontWeight: "700" }}>
                  {tarea.titulo}
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", fontSize: "0.8rem" }}>
                  {parsed?.modulo && (
                    <span style={{ background: "rgba(59, 130, 246, 0.1)", color: "var(--primary-color)", padding: "2px 8px", borderRadius: "12px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Layers size={13} /> {parsed.modulo}
                    </span>
                  )}
                  {tarea.fecha_limite && (
                    <span style={{ 
                      background: esVencida ? "rgba(231, 76, 60, 0.1)" : "var(--bg-main)", 
                      color: esVencida ? "#e74c3c" : "var(--text-muted)", 
                      border: esVencida ? "1px solid rgba(231, 76, 60, 0.3)" : "1px solid var(--border-color)", 
                      padding: "2px 8px", 
                      borderRadius: "12px", 
                      display: "inline-flex", 
                      alignItems: "center", 
                      gap: "4px",
                      fontWeight: esVencida ? "700" : "normal"
                    }}>
                      <Calendar size={13} /> {esVencida ? "Venció: " : "Límite: "}{new Date(tarea.fecha_limite).toLocaleString('es-ES')}
                    </span>
                  )}
                  {entregaExistente ? (
                    <span style={{ background: "rgba(39, 174, 96, 0.15)", color: "#27ae60", padding: "2px 8px", borderRadius: "12px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle2 size={13} /> Entregado
                    </span>
                  ) : esVencida ? (
                    <span style={{ background: "rgba(231, 76, 60, 0.15)", color: "#e74c3c", padding: "2px 8px", borderRadius: "12px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <AlertCircle size={13} /> Plazo Vencido
                    </span>
                  ) : (
                    <span style={{ background: "rgba(243, 156, 18, 0.15)", color: "#d97706", padding: "2px 8px", borderRadius: "12px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={13} /> En progreso ({temasCompletados}/{totalTemas})
                    </span>
                  )}
                </div>
              </div>
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
        </div>

        {/* ========================================================= */}
        {/* EVALUACIÓN DEL DOCENTE (SI LA TAREA YA FUE REVISADA)      */}
        {/* ========================================================= */}
        {entregaExistente && (
          <div style={{ 
            background: entregaExistente.calificacion !== null ? "linear-gradient(135deg, rgba(39, 174, 96, 0.08), rgba(59, 130, 246, 0.08))" : "rgba(59, 130, 246, 0.05)", 
            border: entregaExistente.calificacion !== null ? "1px solid rgba(39, 174, 96, 0.3)" : "1px solid rgba(59, 130, 246, 0.25)", 
            borderRadius: "10px", 
            padding: "16px", 
            marginBottom: "18px" 
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Award size={20} style={{ color: entregaExistente.calificacion !== null ? "#27ae60" : "var(--primary-color)" }} />
                <span style={{ fontWeight: "700", fontSize: "0.95rem", color: "var(--text-main)" }}>
                  Estado de Evaluación:
                </span>
                <span style={{
                  padding: "3px 10px",
                  borderRadius: "12px",
                  fontSize: "0.78rem",
                  fontWeight: "700",
                  background: entregaExistente.calificacion !== null ? "rgba(39, 174, 96, 0.15)" : "rgba(243, 156, 18, 0.15)",
                  color: entregaExistente.calificacion !== null ? "#27ae60" : "#d97706"
                }}>
                  {entregaExistente.calificacion !== null ? "Calificado por el Docente" : "Pendiente de Calificación"}
                </span>
              </div>

              {entregaExistente.calificacion !== null && (
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "6px", 
                  background: entregaExistente.calificacion >= 51 ? "#27ae60" : "#e74c3c", 
                  color: "white", 
                  padding: "6px 14px", 
                  borderRadius: "8px", 
                  fontWeight: "800", 
                  fontSize: "1.1rem",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.12)"
                }}>
                  {entregaExistente.calificacion} <span style={{ fontSize: "0.8rem", opacity: 0.9 }}>/ 100 pts</span>
                </div>
              )}
            </div>

            {entregaExistente.comentarios && (
              <div style={{ 
                background: "var(--bg-card)", 
                border: "1px solid var(--border-color)", 
                borderRadius: "8px", 
                padding: "10px 14px", 
                marginTop: "8px" 
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "4px" }}>
                  <MessageSquare size={14} style={{ color: "var(--primary-color)" }} /> Comentarios del Docente:
                </div>
                <div style={{ fontSize: "0.88rem", color: "var(--text-main)", fontStyle: "italic", lineHeight: "1.4" }}>
                  "{entregaExistente.comentarios}"
                </div>
              </div>
            )}
            
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "8px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <span>Entregado: {entregaExistente.fecha_entrega ? new Date(entregaExistente.fecha_entrega).toLocaleString('es-ES') : "Reciente"}</span>
              {entregaExistente.fecha_calificacion && (
                <span>Calificado: {new Date(entregaExistente.fecha_calificacion).toLocaleString('es-ES')}</span>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. INSTRUCCIONES Y ARCHIVO BASE (TARJETA UNIFICADA)       */}
        {/* ========================================================= */}
        <div style={{ background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "16px", marginBottom: "18px" }}>
          {tarea.descripcion && (
            <div style={{ marginBottom: tarea.archivo_id ? "14px" : "0" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "var(--text-main)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Info size={15} style={{ color: "var(--primary-color)" }} /> Instrucciones del Docente:
              </div>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: "1.45", whiteSpace: "pre-wrap" }}>
                {tarea.descripcion}
              </p>
            </div>
          )}

          {(tarea.archivo_id || archivoReq) && (
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              background: "var(--bg-card)", 
              border: "1px solid var(--border-color)", 
              borderRadius: "8px", 
              padding: "10px 14px", 
              gap: "12px", 
              flexWrap: "wrap",
              marginTop: tarea.descripcion ? "12px" : "0"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ background: "rgba(39, 174, 96, 0.15)", color: "#27ae60", padding: "6px", borderRadius: "6px" }}>
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: "600" }}>Archivo Excel Asignado</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: "700", color: "#27ae60" }}>{archivoReq || "Plantilla del curso"}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 3. CHECKLIST Y ESTADO DE VALIDACIÓN DE LOS TEMAS          */}
        {/* ========================================================= */}
        {parsed?.temas && parsed.temas.length > 0 && (
          <div style={{ background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "0.88rem", fontWeight: "700", color: "var(--text-main)" }}>
                  {entregaExistente ? "Ejercicios Entregados:" : "Progreso de Ejercicios Requeridos:"}
                </span>
                <span style={{ fontSize: "0.78rem", fontWeight: "700", color: todosCompletados || entregaExistente ? "#27ae60" : "var(--primary-color)", background: "var(--bg-card)", padding: "2px 8px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                  {temasCompletados} de {totalTemas} completados
                </span>
              </div>

              {!entregaExistente && (
                <button
                  type="button"
                  onClick={cargarDatosValidacion}
                  title="Sincronizar y verificar cálculos recientes"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    padding: "5px 10px",
                    fontSize: "0.78rem",
                    color: "var(--text-main)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    fontWeight: "600"
                  }}
                >
                  <RefreshCw size={13} style={{ animation: cargandoValidacion ? "spin 1s linear infinite" : "none" }} /> Sincronizar
                </button>
              )}
            </div>

            {/* Barra de progreso visual */}
            <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.08)", borderRadius: "3px", overflow: "hidden", marginBottom: "14px" }}>
              <div style={{ 
                width: `${porcentajeProgreso}%`, 
                height: "100%", 
                background: todosCompletados || entregaExistente ? "linear-gradient(90deg, #27ae60, #2ecc71)" : "linear-gradient(90deg, #3b82f6, #60a5fa)", 
                transition: "width 0.4s ease" 
              }} />
            </div>

            {/* Lista organizada de temas */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {temasConEstado.map((t, idx) => {
                const isExpanded = temaExpandido === idx;
                return (
                  <div 
                    key={idx} 
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      padding: "10px 14px",
                      background: t.realizado ? "rgba(39, 174, 96, 0.08)" : "var(--bg-card)",
                      border: t.realizado ? "1px solid rgba(39, 174, 96, 0.35)" : "1px solid var(--border-color)",
                      borderRadius: "8px",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1 }}>
                        <div style={{
                          background: t.realizado ? "#27ae60" : "var(--border-color)",
                          color: t.realizado ? "white" : "var(--text-muted)",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          flexShrink: 0
                        }}>
                          {t.numero || `Ejercicio ${idx + 1}`}
                        </div>
                        <div>
                          <div style={{ fontSize: "0.88rem", fontWeight: "600", color: "var(--text-main)" }}>
                            {t.nombre}
                          </div>
                          {t.realizado && t.calculoGuardado ? (
                            <div style={{ fontSize: "0.74rem", color: "#27ae60", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                              <Check size={12} /> Guardado el {t.calculoGuardado.fecha} a las {t.calculoGuardado.hora}
                            </div>
                          ) : (
                            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "2px" }}>
                              Pendiente de calcular y guardar en la calculadora
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {t.realizado ? (
                          <span style={{
                            background: "rgba(39, 174, 96, 0.18)",
                            color: "#27ae60",
                            border: "1px solid rgba(39, 174, 96, 0.35)",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "0.76rem",
                            fontWeight: "700",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <Check size={13} /> Realizado
                          </span>
                        ) : (
                          <span style={{
                            background: "rgba(243, 156, 18, 0.15)",
                            color: "#d97706",
                            border: "1px solid rgba(243, 156, 18, 0.3)",
                            padding: "3px 10px",
                            borderRadius: "12px",
                            fontSize: "0.76rem",
                            fontWeight: "700",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <Clock size={13} /> Pendiente
                          </span>
                        )}

                        {!entregaExistente && !esVencida && !t.realizado && (
                          <button
                            type="button"
                            onClick={() => reabrirEjercicio(t)}
                            title="Ir a realizar este cálculo en la Calculadora"
                            style={{
                              background: "rgba(16, 185, 129, 0.12)",
                              border: "1px solid rgba(16, 185, 129, 0.3)",
                              color: "#059669",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "0.74rem",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "all 0.2s"
                            }}
                          >
                            <Calculator size={13} /> Resolver
                          </button>
                        )}

                        {t.realizado && t.calculoGuardado && (
                          <button
                            type="button"
                            onClick={() => reabrirEjercicio(t)}
                            title="Reabrir este ejercicio en la Calculadora"
                            style={{
                              background: "rgba(59, 130, 246, 0.12)",
                              border: "1px solid rgba(59, 130, 246, 0.3)",
                              color: "var(--primary-color)",
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "0.74rem",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              transition: "all 0.2s"
                            }}
                          >
                            <Calculator size={13} /> Reabrir
                          </button>
                        )}

                        {t.calculoGuardado?.snapshot && (
                          <button
                            type="button"
                            onClick={() => setTemaExpandido(isExpanded ? null : idx)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "var(--text-muted)",
                              cursor: "pointer",
                              padding: "4px",
                              display: "flex",
                              alignItems: "center"
                            }}
                            title="Ver detalles del cálculo"
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Detalle desplegable del cálculo guardado / entregado */}
                    {isExpanded && t.calculoGuardado?.snapshot && (
                      <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed rgba(0,0,0,0.1)" }}>
                        <div style={{ fontSize: "0.74rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "4px" }}>
                          Resumen del Snapshot de Datos:
                        </div>
                        {renderSnapshotData(t.calculoGuardado.snapshot)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {esVencida && !entregaExistente ? (
          <div style={{ 
            background: "rgba(231, 76, 60, 0.08)", 
            border: "1px solid rgba(231, 76, 60, 0.35)", 
            padding: "18px 20px", 
            borderRadius: "10px", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            gap: "14px", 
            flexWrap: "wrap" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "260px" }}>
              <div style={{ background: "rgba(231, 76, 60, 0.15)", color: "#e74c3c", padding: "10px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <div style={{ color: "#e74c3c", fontWeight: "700", fontSize: "0.95rem" }}>
                  Plazo de Entrega Vencido
                </div>
                <div style={{ fontSize: "0.83rem", color: "var(--text-muted)", marginTop: "3px" }}>
                  La fecha límite expiró el <b>{new Date(tarea.fecha_limite).toLocaleString('es-ES')}</b>. Ya no se permite realizar entregas para esta tarea.
                </div>
              </div>
            </div>

            <button 
              type="button" 
              onClick={onClose} 
              style={{ padding: "9px 18px", background: "var(--bg-card)", color: "var(--text-main)", border: "1px solid var(--border-color)", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem" }}
            >
              Cerrar
            </button>
          </div>
        ) : entregaExistente ? (
          <div style={{ 
            background: "rgba(39, 174, 96, 0.1)", 
            border: "1px solid #27ae60", 
            padding: "16px", 
            borderRadius: "10px", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            gap: "12px", 
            flexWrap: "wrap" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <CheckCircle2 size={24} style={{ color: "#27ae60" }} />
              <div>
                <div style={{ color: "#27ae60", fontWeight: "700", fontSize: "0.95rem" }}>¡Esta tarea ya ha sido entregada!</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Entregada el {entregaExistente.fecha_entrega ? new Date(entregaExistente.fecha_entrega).toLocaleString('es-ES') : "recientemente"}. Estado: <b>{entregaExistente.estado}</b>
                </div>
              </div>
            </div>
            <button 
              type="button"
              onClick={onClose} 
              style={{ padding: "8px 18px", background: "#27ae60", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "700", fontSize: "0.88rem" }}
            >
              Cerrar Ventana
            </button>
          </div>
        ) : todosCompletados ? (
          <div style={{ 
            background: "rgba(39, 174, 96, 0.1)", 
            border: "1px solid rgba(39, 174, 96, 0.4)", 
            padding: "18px", 
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(39, 174, 96, 0.08)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", color: "#27ae60", fontWeight: "700", fontSize: "0.98rem" }}>
              <Sparkles size={19} /> ¡Has completado todos los temas requeridos!
            </div>
            <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
              Los <b>{totalTemas} cálculos</b> solicitados han sido validados con el archivo asignado. Al hacer clic en <b>"Enviar Tarea"</b>, tus resultados se empaquetarán y enviarán de inmediato al docente.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button 
                type="button" 
                onClick={onClose} 
                style={{ padding: "10px 16px", background: "var(--bg-card)", color: "var(--text-main)", border: "1px solid var(--border-color)", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.88rem" }}
              >
                <X size={15} /> Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleEnviarTarea} 
                disabled={procesando} 
                style={{ 
                  padding: "10px 22px", 
                  background: "linear-gradient(135deg, #27ae60, #2ecc71)", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "6px", 
                  cursor: procesando ? "not-allowed" : "pointer", 
                  fontWeight: "700", 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: "8px", 
                  fontSize: "0.92rem", 
                  boxShadow: "0 3px 10px rgba(39, 174, 96, 0.35)" 
                }}
              >
                <Send size={16} /> {procesando ? "Enviando Tarea..." : "Enviar Tarea con Resultados"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ 
            background: "var(--bg-main)", 
            border: "1px solid var(--border-color)", 
            padding: "16px", 
            borderRadius: "10px", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            gap: "14px", 
            flexWrap: "wrap" 
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "240px" }}>
              <AlertCircle size={22} style={{ color: "#f39c12", flexShrink: 0 }} />
              <div>
                <div style={{ color: "var(--text-main)", fontWeight: "700", fontSize: "0.88rem" }}>
                  Faltan temas por resolver ({totalTemas - temasCompletados} restantes)
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Abre la calculadora, realiza los cálculos pendientes y haz clic en <b>"Guardar Cálculo"</b>.
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                type="button" 
                onClick={onClose} 
                style={{ padding: "8px 14px", background: "var(--bg-card)", color: "var(--text-main)", border: "1px solid var(--border-color)", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.84rem" }}
              >
                Cerrar
              </button>
              <button 
                type="button" 
                onClick={irACalculadora}
                style={{ 
                  padding: "8px 16px", 
                  background: "#27ae60", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "6px", 
                  cursor: "pointer", 
                  fontWeight: "700", 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: "6px", 
                  fontSize: "0.84rem", 
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)" 
                }}
              >
                <ExternalLink size={14} /> Ir a Calculadora
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
