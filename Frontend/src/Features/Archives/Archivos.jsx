import { useState, useEffect, useRef } from "react";
import ExcelViewer from "../../components/excel/ExcelViewer";
import ExcelUploader from "../../components/excel/ExcelUploader";
import ExcelContent from "../../components/excel/ExcelContent";

import { api, BASE_URL } from "../../services/api";

import { alerta } from "../../utils/Notificaciones";
import "../../styles/pages/Archivos.css";

import { useLocation, useNavigate } from "react-router-dom";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import escudoAdmin from "../../assets/images/escudoAdmin.png";

const moduloDelCurso = (curso) => {
  const modulo = String(curso.modulo || "").trim().toUpperCase();
  if (modulo) return modulo;
  const nombre = String(curso.nombre || "").toUpperCase();
  if (nombre.includes("MAT251")) return "MAT251";
  if (nombre.includes("MAT151")) return "MAT151";
  return "SIN_MODULO";
};

const nombreModulo = (modulo) => modulo === "SIN_MODULO" ? "Sin módulo asignado" : modulo;

function SelectorArchivos({ id, value, onChange, options, disabled, placeholder }) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef(null);
  const boton = useRef(null);
  const lista = useRef(null);
  const seleccionada = options.find((opcion) => opcion.value === String(value));

  useEffect(() => {
    if (!abierto) return;
    const cerrarFuera = (event) => {
      if (!contenedor.current?.contains(event.target)) setAbierto(false);
    };
    document.addEventListener("pointerdown", cerrarFuera);
    return () => document.removeEventListener("pointerdown", cerrarFuera);
  }, [abierto]);

  useEffect(() => {
    if (disabled) setAbierto(false);
  }, [disabled]);

  useEffect(() => {
    if (abierto) {
      const opciones = lista.current?.querySelectorAll('[role="option"]');
      const indice = options.findIndex((opcion) => opcion.value === String(value));
      opciones?.[Math.max(0, indice)]?.focus();
    }
  }, [abierto]);

  const elegir = (nuevoValor) => {
    onChange(nuevoValor);
    setAbierto(false);
    boton.current?.focus();
  };

  const manejarTeclado = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setAbierto(false);
      boton.current?.focus();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) || disabled) return;
    event.preventDefault();
    if (!abierto) {
      setAbierto(true);
      return;
    }
    const opciones = Array.from(lista.current?.querySelectorAll('[role="option"]') || []);
    const actual = opciones.indexOf(document.activeElement);
    let siguiente = event.key === "ArrowUp" ? actual - 1 : actual + 1;
    if (event.key === "Home") siguiente = 0;
    if (event.key === "End") siguiente = opciones.length - 1;
    opciones[(siguiente + opciones.length) % opciones.length]?.focus();
  };

  return (
    <div ref={contenedor} className="archivos-select-container" onKeyDown={manejarTeclado}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setAbierto(false);
      }}>
      <button ref={boton} id={id} type="button" disabled={disabled}
        className={`btn-archivos-select-header ${abierto ? "open" : ""}`}
        aria-haspopup="listbox" aria-expanded={abierto} aria-controls={`${id}-opciones`}
        onClick={() => setAbierto(!abierto)}>
        <span className="archivos-select-text">{seleccionada?.label || placeholder}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`archivos-select-chevron ${abierto ? "open" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {abierto && !disabled && (
        <div ref={lista} id={`${id}-opciones`} role="listbox" aria-labelledby={id}
          className="archivos-select-dropdown">
          {options.map((opcion) => (
            <button key={opcion.value} type="button" role="option" tabIndex={-1}
              aria-selected={opcion.value === String(value)}
              className={`btn-archivos-select-option ${opcion.value === String(value) ? "selected" : ""}`}
              onClick={() => elegir(opcion.value)}>
              {opcion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Archivos({ usuario }) {
  const navigate = useNavigate();
  const [panelAbierto, setPanelAbierto] = useState(true);

  // Estados para Archivos Personales
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // 🆕 ESTADO PARA LA CUOTA DE ALMACENAMIENTO (Límite por defecto 10MB)
  const [espacio, setEspacio] = useState({ usado: 0, limite: 10 * 1024 * 1024 });

  const location = useLocation();
  const cursoInicial = location.state?.cursoIdSeleccionado
    ? String(location.state.cursoIdSeleccionado)
    : "";
  const [tabActiva, setTabActiva] = useState(cursoInicial ? "cursos" : "personales"); // 'personales' o 'cursos'
  const [cargandoArchivos, setCargandoArchivos] = useState(false);
  const solicitudArchivos = useRef(0);

  const iniciarTour = () => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      progressText: '{{current}} de {{total}}',
      steps: [
        {
          element: '#tour-titulo',
          popover: {
            title: 'Gestión de Archivos',
            description: '¡Bienvenido! Aquí puedes gestionar todos tus archivos personales y de cursos.',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '#tour-pestanas',
          popover: {
            title: 'Organización por Pestañas',
            description: 'Cambia entre "Mi Espacio" para tus archivos privados y "Mis Cursos" para el material académico.',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '#tour-subida',
          popover: {
            title: 'Subir Archivos',
            description: 'Arrastra tus archivos de Excel (.xlsx) o búscalos en tu equipo para cargarlos al sistema.',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '#tour-visor',
          popover: {
            title: 'Explorador de Archivos',
            description: 'Aquí verás todos tus archivos. Puedes seleccionarlos para verlos o eliminarlos.',
            side: "top",
            align: 'start'
          }
        },
        {
          element: '#tour-vista-previa',
          popover: {
            title: 'Vista Previa del Excel',
            description: 'Al seleccionar un archivo, se desplegará una vista previa interactiva en esta sección.',
            side: "left",
            align: 'start'
          }
        },
        {
          element: '.boton-toggle-medio',
          popover: {
            title: 'Ocultar/Mostrar Panel',
            description: 'Haz clic aquí para ocultar o mostrar el panel lateral y tener más espacio para visualizar tu tabla de datos.',
            side: "right",
            align: 'center'
          }
        }
      ]
    });

    driverObj.drive();
  };

  const [cursoSeleccionado, setCursoSeleccionado] = useState(cursoInicial);
  const [misCursos, setMisCursos] = useState([]);
  const [moduloSeleccionado, setModuloSeleccionado] = useState("");
  const [cargandoCursos, setCargandoCursos] = useState(true);
  const modulosDisponibles = [...new Set(misCursos.map((curso) => curso.modulo))].sort();
  const cursosDelModulo = misCursos.filter((curso) => curso.modulo === moduloSeleccionado);
  const cursoActual = cursosDelModulo.find((curso) => String(curso.id) === cursoSeleccionado);

  const limpiarMaterialSeleccionado = () => {
    solicitudArchivos.current += 1;
    setFiles([]);
    setSelectedFile(null);
    setCargandoArchivos(false);
  };

  const cambiarModulo = (modulo) => {
    limpiarMaterialSeleccionado();
    setModuloSeleccionado(modulo);
    setCursoSeleccionado("");
  };

  const cambiarCurso = (cursoId) => {
    limpiarMaterialSeleccionado();
    setCursoSeleccionado(cursoId);
  };

  useEffect(() => {
    if (location.state?.cursoIdSeleccionado) {
      navigate("/archivos", { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    let cancelado = false;
    const cargarCursos = async () => {
      setCargandoCursos(true);
      setMisCursos([]);
      limpiarMaterialSeleccionado();
      if (!usuario) {
        setCargandoCursos(false);
        return;
      }
      try {
        const correoUsuario = encodeURIComponent(usuario.email || usuario.id);
        const endpoint = ["Docente", "Administrador"].includes(usuario.rol) || usuario.isAdmin
          ? "mis_clases" : "mis_inscripciones";
        const res = await fetch(BASE_URL + "/" + endpoint + "/" + correoUsuario);
        if (!res.ok) throw new Error("No se pudieron cargar los cursos.");
        const data = await res.json();
        if (cancelado) return;
        const cursos = (Array.isArray(data) ? data : []).map((curso) => ({
          ...curso, modulo: moduloDelCurso(curso),
        }));
        const modulos = [...new Set(cursos.map((curso) => curso.modulo))].sort();
        const cursoReabrir = cursos.find((curso) => String(curso.id) === cursoInicial);
        setMisCursos(cursos);
        setModuloSeleccionado((actual) => cursoReabrir?.modulo ||
          (modulos.includes(actual) ? actual : modulos[0] || ""));
        setCursoSeleccionado((actual) => cursos.some((curso) => String(curso.id) === actual) ? actual : "");
      } catch (error) {
        if (!cancelado) {
          setCursoSeleccionado("");
          setModuloSeleccionado("");
          console.error("Error al cargar cursos para dropdown:", error);
        }
      } finally {
        if (!cancelado) setCargandoCursos(false);
      }
    };

    cargarCursos();
    return () => { cancelado = true; };
  }, [usuario]);

  // 🆕 FUNCIÓN PARA CARGAR LA CUOTA DE MEMORIA
  const cargarCuota = async () => {
    if (!usuario) return;
    try {
      const data = await api.obtenerEspacioUsado();
      if (data) {
        setEspacio({ usado: data.usado_bytes, limite: data.limite_bytes });
      }
    } catch (err) {
      console.error("Error al cargar cuota:", err);
    }
  };

  const loadFiles = async () => {
    if (!usuario) return;

    if (tabActiva === "cursos" && !cursoActual) {
      solicitudArchivos.current += 1;
      setFiles([]);
      setSelectedFile(null);
      setCargandoArchivos(false);
      return;
    }

    const solicitudActual = ++solicitudArchivos.current;
    setCargandoArchivos(true);
    setFiles([]);
    setSelectedFile(null);

    try {
      const visibilidad = tabActiva === "cursos" ? "privado" : "personal";
      const data = await api.obtenerArchivos(
        usuario.nombre,
        visibilidad,
        tabActiva === "cursos" ? cursoSeleccionado : "",
      );

      if (solicitudActual === solicitudArchivos.current && data.files) {
        setFiles(data.files);
      }
    } catch (err) {
      console.error("Error al cargar:", err);
    } finally {
      if (solicitudActual === solicitudArchivos.current) {
        setCargandoArchivos(false);
      }
    }
  };

  // 🚀 CRÍTICO: Efecto principal para refrescar datos y memoria
  useEffect(() => {
    loadFiles();
    cargarCuota(); // Actualizamos la memoria cada vez que se recarga la lista
  }, [usuario, tabActiva, cursoSeleccionado, moduloSeleccionado, misCursos]);

  const handleUploadFile = async (fileObj) => {
    if (!fileObj || !usuario) return;

    // 🆕 1. Validar el tamaño del archivo de forma individual
    if (fileObj.size > espacio.limite) {
      alerta.error("Archivo demasiado grande", `El archivo supera el límite total de ${(espacio.limite / 1048576).toFixed(2)}MB.`);
      return;
    }

    // 🆕 2. Validar si el archivo cabe en el espacio restante
    if (espacio.usado + fileObj.size > espacio.limite) {
      const libreMB = ((espacio.limite - espacio.usado) / 1048576).toFixed(2);
      alerta.error("Espacio insuficiente", `El archivo pesa ${(fileObj.size / 1048576).toFixed(2)}MB, pero solo te quedan ${libreMB}MB libres.`);
      return;
    }

    // Validación de curso
    if (tabActiva === "cursos" && !cursoActual) {
      alerta.error(
        "Faltan datos",
        "Selecciona el curso al que quieres subir el material.",
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", fileObj);
    formData.append("autor", usuario.nombre);

    formData.append(
      "visibilidad",
      tabActiva === "cursos" ? "privado" : "personal",
    );
    if (tabActiva === "cursos") formData.append("curso", cursoSeleccionado);

    try {
      await api.subirArchivo(formData);
      loadFiles();
      cargarCuota(); // 🆕 Refrescar la cuota después de subir
      alerta.success("¡Archivo Subido!");
    } catch (err) {
      alerta.error("Error al subir archivo", err.message);
    }
  };

  const handleDeleteFile = async (filename) => {
    if (tabActiva === "cursos" && usuario.rol === "Estudiante") {
      alerta.error(
        "Acceso Denegado",
        "No puedes eliminar el material subido por el docente.",
      );
      return;
    }

    try {
      await api.eliminarArchivo(filename, usuario.nombre, tabActiva === "cursos" ? cursoSeleccionado : "");
      setFiles((prev) => prev.filter((f) => f.filename !== filename));
      if (selectedFile === filename) setSelectedFile(null);
      
      cargarCuota(); // 🆕 Refrescar la cuota para mostrar el espacio recuperado
      alerta.success("Archivo eliminado correctamente");
    } catch (err) {
      alerta.error("Error al eliminar", err.message || "No se pudo eliminar el archivo.");
    }
  };

  const handleDownload = async (filename) => {
    try {
      const autorParam = encodeURIComponent(usuario.nombre);
      const cursoParam = tabActiva === "cursos" && cursoSeleccionado ? `&curso=${encodeURIComponent(cursoSeleccionado)}` : "";
      const url = `${BASE_URL}/files/${encodeURIComponent(filename)}?autor=${autorParam}${cursoParam}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("No se pudo descargar el archivo del servidor.");
      const blob = await response.blob();

      if (window.showSaveFilePicker) {
        try {
          const fileHandle = await window.showSaveFilePicker({ suggestedName: filename });
          alerta.exito("Descarga iniciada", "Guardando el archivo en tu equipo...");
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
        } catch (error) {
          if (error.name !== 'AbortError') {
            alerta.error("Error al guardar", "Hubo un problema al escribir el archivo.");
          }
        }
      } else {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        alerta.exito("Descarga iniciada", "Elige el lugar donde se va a guardar el archivo.");
        setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 5000);
      }

    } catch (err) {
      console.error(err);
      alerta.error("Error al descargar", err.message || "No se pudo conectar con el servidor.");
    }
  };

  // 🆕 Cálculos para la barra de memoria
  const usadoMB = (espacio.usado / 1048576).toFixed(2);
  const limiteMB = (espacio.limite / 1048576).toFixed(2);
  const porcentajeUso = Math.min((espacio.usado / espacio.limite) * 100, 100).toFixed(1);
  const cuotaLlena = espacio.usado >= espacio.limite;

  return (
    <div className="page-container">

      {/* Marca de agua de fondo */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "450px",
          height: "450px",
          backgroundImage: `url(${escudoAdmin})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          opacity: 0.04,
          zIndex: 0,
          pointerEvents: "none"
        }}
      />
      {/* Botón flotante para colapsar panel izquierdo */}
      <button
        onClick={() => setPanelAbierto(!panelAbierto)}
        className={`boton-toggle-medio ${panelAbierto ? "abierto" : "cerrado"}`}
        title={panelAbierto ? "Ocultar panel" : "Mostrar panel"}
        style={{
          position: "fixed",
          top: "50%",
          left: 0,
          transform: "translateY(-50%)",
          zIndex: 9999,
          backgroundColor: "var(--accent-color, #FF7000)",
          color: "white",
          border: "1px solid var(--border-color, #eee)",
          borderLeft: "none",
          borderRadius: "0 8px 8px 0",
          width: "24px",
          height: "50px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
          transition: "all 0.3s ease"
        }}
      >
        <span
          className={`icono-toggle ${panelAbierto ? "abierto" : "cerrado"}`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "bold", fontSize: "14px", color: "#ffffff",
            transform: panelAbierto ? "scaleX(1)" : "scaleX(-1)",
            transition: "transform 0.3s ease", lineHeight: 0,
            marginTop: "-2px", marginLeft: "-1px",
          }}
        >
          ❮
        </span>
      </button>
      <button
        onClick={iniciarTour}
        className="guia-rapida-flotante"
        style={{
          bottom: '20px',
          zIndex: 10000
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="guia-rapida-flotante-texto">Guía Rápida</span>
      </button>
      <div className="files-layout">
        {/* ========================================================= */}
        {/* COLUMNA IZQUIERDA: Pestañas y Gestión (35%)               */}
        {/* ========================================================= */}
        {panelAbierto && (
          <div className="archivos-col-izq">
            {/* SELECTOR DE PESTAÑAS */}
            <div
              id="tour-pestanas"
              style={{
                display: "flex",
                background: "var(--bg-card)",
                borderRadius: "8px",
                padding: "5px",
                border: "1px solid var(--border-color)",
                gap: "6px",
              }}
            >
              <button
                onClick={() => setTabActiva("personales")}
                className={`tab-archivo-btn ${tabActiva === "personales" ? "active" : ""}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Mi Espacio
              </button>
              <button
                onClick={() => setTabActiva("cursos")}
                className={`tab-archivo-btn ${tabActiva === "cursos" ? "active" : ""}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
                Mis Cursos
              </button>
            </div>

            {/* CONTENIDO SEGÚN LA PESTAÑA */}
            <div
              style={{
                background: "var(--bg-card)",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
              }}
            >
              {tabActiva === "cursos" && (
                <div className="archivos-selectores-curso">
                  <div className="archivos-campo-curso archivos-campo-modulo">
                    <label htmlFor="archivos-modulo">Módulo:</label>
                    <SelectorArchivos id="archivos-modulo" value={moduloSeleccionado}
                      onChange={cambiarModulo}
                      disabled={cargandoCursos || modulosDisponibles.length === 0}
                      placeholder={cargandoCursos ? "Cargando módulos..." : "Sin cursos disponibles"}
                      options={modulosDisponibles.map((modulo) => ({ value: modulo, label: nombreModulo(modulo) }))}
                    />
                  </div>
                  <div className="archivos-campo-curso">
                    <label htmlFor="archivos-curso">Selecciona un Curso:</label>
                    <SelectorArchivos id="archivos-curso" value={cursoSeleccionado}
                      onChange={cambiarCurso}
                      disabled={cargandoCursos || cursosDelModulo.length === 0}
                      options={[
                        { value: "", label: "-- Elige un curso para ver material --" },
                        ...cursosDelModulo.map((curso) => ({ value: String(curso.id), label: curso.nombre })),
                      ]}
                    />
                  </div>
                </div>
              )}

              {/* AVISO VISUAL DE CURSO SELECCIONADO CON LÓGICA DE ROL */}
              {tabActiva === "cursos" && cursoActual && (
                <div
                  style={{
                    backgroundColor: "#e8f4fd",
                    padding: "12px",
                    borderRadius: "6px",
                    marginBottom: "15px",
                    borderLeft: "4px solid var(--primary-color)",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "#0056b3" }}>
                    {" "}
                    {["Docente", "Administrador"].includes(usuario?.rol)
                      ? "Estás gestionando el material del curso:"
                      : "Viendo material de estudio del curso:"}{" "}
                    <strong>
                      {nombreModulo(moduloSeleccionado)} - {cursoActual.nombre}
                    </strong>
                  </p>
                </div>
              )}

              {/* Subida de archivos */}
              {(tabActiva !== "cursos" || (cursoActual && usuario?.rol !== "Estudiante")) && (
                <div
                  id="tour-subida"
                  style={{
                    marginBottom: "20px",
                    paddingBottom: "20px",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <h3 style={{ margin: "0 0 10px 0", fontSize: "1.1rem" }}>
                    {tabActiva === "cursos"
                      ? "Subir Material al Curso"
                      : "Subir Archivo Personal"}
                  </h3>
                  
                  {/* 🆕 Alerta si la cuota está llena */}
                  {cuotaLlena ? (
                    <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "10px", borderRadius: "6px", fontSize: "0.85rem", borderLeft: "4px solid #ef4444" }}>
                      <strong>⚠️ Espacio insuficiente:</strong> Has alcanzado tu límite de almacenamiento ({limiteMB}MB). Por favor, elimina archivos existentes antes de subir nuevos.
                    </div>
                  ) : (
                    <ExcelUploader onUpload={handleUploadFile} />
                  )}
                </div>
              )}

              <h3 style={{ margin: "0 0 15px 0", fontSize: "1.1rem" }}>
                {tabActiva === "cursos" ? "Material Compartido" : "Mis Archivos"}
              </h3>

              <div id="tour-visor">
                {/* Si es curso y no ha seleccionado uno, no mostramos la lista */}
                {tabActiva === "cursos" && !cursoActual ? (
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontStyle: "italic",
                      textAlign: "center",
                    }}
                  >
                    Selecciona un curso arriba para ver sus archivos.
                  </p>
                ) : cargandoArchivos ? (
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontStyle: "italic",
                      textAlign: "center",
                    }}
                  >
                    Cargando archivos...
                  </p>
                ) : (
                  <ExcelViewer
                    files={files}
                    onSelect={setSelectedFile}
                    onDelete={handleDeleteFile}
                    onDownload={handleDownload}
                    rol={usuario?.rol}
                    esPersonal={tabActiva === "personales"}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* COLUMNA DERECHA: Vista Previa                            */}
        {/* ========================================================= */}
        <div className="archivos-col-der" id="tour-vista-previa">
          <h3
            style={{
              margin: "0 0 15px 0",
              fontSize: "1.2rem",
              borderBottom: "1px solid var(--border-color)",
              paddingBottom: "10px",
            }}
          >
            Vista Previa de Datos
          </h3>
          {selectedFile ? (
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <ExcelContent
                filename={selectedFile}
                autor={usuario.nombre}
                curso={tabActiva === "cursos" ? cursoSeleccionado : ""}
              />
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                height: "80%",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                fontStyle: "italic",
                backgroundColor: "var(--bg-main)",
                borderRadius: "8px",
                border: "1px dashed #ccc",
              }}
            >
              Selecciona un archivo de la lista para visualizarlo.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}