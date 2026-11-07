import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useHistorialMAT251 } from "../Historial/useHistorialMAT251";
import { puedeActualizarHistorialMAT251 } from "../Historial/historialMAT251";
import Datos from "../../../pages/Datos";
import { useCalculadoraExcel } from "../../MAT151/hooks/useCalculadoraExcel";
import { useData } from "../../../components/gestion_datos/DataContext";
import Principal from '../Principal/Principal';
import ModalAlerta from '../ui/ModalAlerta';
import TablaDinamicaMAT251 from '../ui/TablaDinamicaMAT251';
import { iniciarGuiaMAT251 } from '../utils/Guia';
import { IconoPDF, IconoGuardar } from "../../../ui/iconos";
import { generarPDFReporteMAT251 } from "../utils/exportUtilsMAT251";
import { alerta } from "../../../utils/Notificaciones";
import "../styles/pages/Pantalla.css";
import "../styles/pages/CalculosMat251.css";
import "../styles/GuiaMAT251.css";

const TypingTitle = () => {
  const fullText = "Estadística Matemática (MAT251)";
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [speed, setSpeed] = useState(100);

  useEffect(() => {
    let timer;
    const handleType = () => {
      if (!isDeleting) {
        setDisplayText((current) => {
          if (current.length < fullText.length) {
            setSpeed(100);
            return fullText.substring(0, current.length + 1);
          } else {
            setIsDeleting(true);
            setSpeed(2500);
            return current;
          }
        });
      } else {
        setDisplayText((current) => {
          if (current.length > 0) {
            setSpeed(40);
            return fullText.substring(0, current.length - 1);
          } else {
            setIsDeleting(false);
            setSpeed(500);
            return current;
          }
        });
      }
    };

    timer = setTimeout(handleType, speed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, speed]);

  return (
    <h2 
      className="restricted-title" 
      style={{ 
        fontSize: "1.6rem", 
        color: "var(--text-main)", 
        margin: "0 0 10px 0", 
        fontWeight: "700"
      }}
    >
      {displayText}
      <span className="typing-cursor">|</span>
    </h2>
  );
};

export default function Pantalla() {
  const { usuario } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const principalRef = useRef(null);
  const locationActualRef = useRef(location);
  locationActualRef.current = location;
  const [estadoActualizacionHistorial, setEstadoActualizacionHistorial] = useState({
    snapshot: null,
    habilitado: false,
  });
  const [mostrarDatos, setMostrarDatos] = useState(false);
  const [mostrarCreacion, setMostrarCreacion] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedSheet, setSelectedSheet] = useState(0);
  const { guardando, guardarCalculoMAT251 } = useHistorialMAT251({ usuario, selectedFile });

  const handleGuardarHistorial = async () => {
    setMenuAbierto(false);
    if (!principalRef.current?.obtenerDatosParaHistorial) {
      alerta.advertencia("No disponible", "No hay cálculo listo para guardar.");
      return;
    }
    const datos = principalRef.current.obtenerDatosParaHistorial();
    await guardarCalculoMAT251(datos);
  };
  const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Atención', tipo: 'warning' });

  const _stats = useCalculadoraExcel(selectedFile, selectedSheet);

  const [exportandoPDF, setExportandoPDF] = useState(false);

  const handleExportarPDF = async () => {
    setMenuAbierto(false);
    if (exportandoPDF) return;

    const reporteEl = document.getElementById("reporte-formal-mat251");
    if (reporteEl && reporteEl.getAttribute("data-es-simulacion") === "true") {
      alerta.advertencia(
        "Reporte no disponible",
        "La exportación de reporte en PDF no está disponible para simulaciones."
      );
      return;
    }

    if (!reporteEl || reporteEl.getAttribute("data-listo") !== "true") {
      alerta.advertencia(
        "Sin resultados para exportar",
        "Primero debes realizar un cálculo para generar su reporte formal en PDF."
      );
      return;
    }
    const nombreArchivo = reporteEl.getAttribute("data-nombre-archivo") || "Reporte_MAT251_Tema1";
    try {
      setExportandoPDF(true);
      await generarPDFReporteMAT251("reporte-formal-mat251", nombreArchivo);
    } finally {
      setExportandoPDF(false);
    }
  };

  const esAdmin = usuario?.rol === "Administrador" || usuario?.isAdmin === true;
  const esDocente = usuario?.rol === "Docente";
  const esEstudiante = usuario?.rol === "Estudiante";
  const tieneAcceso = esAdmin || esDocente || esEstudiante;

  const targetDate = new Date("2026-10-30T00:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (tieneAcceso) return;

    const actualizarContador = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    actualizarContador();
    const interval = setInterval(actualizarContador, 1000);

    return () => clearInterval(interval);
  }, [tieneAcceso]);

  if (!tieneAcceso) {
    return (
      <div className="mat251"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          backgroundColor: "var(--bg-main)",
          color: "var(--text-main)",
          fontFamily: "'Outfit', 'Inter', sans-serif",
          padding: "20px",
          textAlign: "center",
          transition: "background-color 0.3s ease, color 0.3s ease"
        }}
      >
        <div 
          className="restricted-card"
          style={{
            width: "90%",
            maxWidth: "500px",
            padding: "40px",
            borderRadius: "20px",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transition: "background-color 0.3s ease, border-color 0.3s ease"
          }}
        >
          <div style={{ position: "relative", width: "80px", height: "80px", marginBottom: "25px" }}>
            <div 
              style={{
                width: "80px",
                height: "80px",
                border: "4px solid var(--border-color)",
                borderTop: "4px solid var(--accent-color, #f39c12)",
                borderRight: "4px solid var(--accent-color, #f39c12)",
                borderRadius: "50%",
                animation: "spin-slow 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite"
              }}
            />
            <div 
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "var(--accent-color, #f39c12)"
              }}
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>

          <TypingTitle />

          <div 
            style={{ 
              backgroundColor: "rgba(59, 130, 246, 0.15)", 
              color: "var(--accent-color, #f39c12)", 
              padding: "6px 16px", 
              borderRadius: "20px", 
              fontSize: "0.85rem", 
              fontWeight: "600",
              marginBottom: "20px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              animation: "pulse-soft 2s ease-in-out infinite"
            }}
          >
            <span style={{ width: "8px", height: "8px", backgroundColor: "var(--accent-color, #f39c12)", borderRadius: "50%", display: "inline-block" }} />
            Sincronizando recursos...
          </div>

          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6", margin: "0 0 25px 0" }}>
            Este módulo se encuentra en fase de desarrollo. Estará disponible próximamente.
          </p>



          <div className="restricted-buttons" style={{ display: "flex", gap: "12px", width: "100%" }}>
            <button
              onClick={() => navigate("/")}
              style={{
                flex: 1,
                padding: "12px 20px",
                backgroundColor: "var(--bg-main)",
                color: "var(--text-main)",
                border: "1px solid var(--border-color)",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-input)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "var(--bg-main)"}
            >
              Ir al Inicio
            </button>
            <button
              onClick={() => navigate("/calculadora")}
              style={{
                flex: 1,
                padding: "12px 20px",
                backgroundColor: "var(--accent-color, #f39c12)",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
                transition: "all 0.2s",
                boxShadow: "0 4px 12px rgba(243, 156, 18, 0.2)"
              }}
              onMouseEnter={(e) => e.currentTarget.style.filter = "brightness(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.filter = "none"}
            >
              Estadística General
            </button>
          </div>
        </div>
      </div>
    );
  }

  const paramsReabrir = location.state || {};
  const historialOrigen = paramsReabrir.historialOrigen;
  const esHistorialEditable = !!historialOrigen
    && ['conteo', 'probabilidad', 'probabilidad_total', 'simulador_total', 'regla_adicion', 'regla_multiplicacion', 'dist_discreta', 'dist_continua', 'distribuciones_discretas', 'discretas', 'modelos_discretos', 'distribuciones_continuas', 'continuas', 'modelos_continuos', 'distribuciones_muestrales', 'estimacion_puntual', 'estimacion_intervalos', 'tyf', 'hipotesis_parametricas', 'hipotesis_noparametricas'].includes(
      (paramsReabrir.snapshot?.operacion || paramsReabrir.calculoReabrir)?.toLowerCase()
    );

  const puedeGuardarCambios = esHistorialEditable
    && estadoActualizacionHistorial.snapshot === paramsReabrir.snapshot
    && estadoActualizacionHistorial.habilitado;

  const handleGuardarCambiosHistorial = async () => {
    if (guardando || !esHistorialEditable || !historialOrigen?.id) return;
    const datos = principalRef.current?.obtenerDatosParaHistorial();
    if (!datos || !puedeActualizarHistorialMAT251(datos, paramsReabrir.snapshot)) return;
    const ubicacionAlGuardar = location.key;
    const respuesta = await guardarCalculoMAT251(datos, historialOrigen.id);
    if (!respuesta?.registro || !principalRef.current || locationActualRef.current.key !== ubicacionAlGuardar) return;
    const registro = respuesta.registro;
    // Restablecer recuperará la última versión confirmada por el servidor.
    navigate(location.pathname, {
      replace: true,
      state: {
        ...paramsReabrir,
        archivoReabrir: registro.archivo_origen,
        calculoReabrir: registro.calculo,
        snapshot: registro.snapshot,
        historialOrigen: {
          id: registro.id,
          fecha: registro.fecha,
          hora: registro.hora,
          modulo: registro.modulo,
          calculo: registro.calculo,
          archivo: registro.archivo_origen,
        },
      },
    });
  };

  const salirDelHistorial = () => {
    const operacion = paramsReabrir.snapshot?.operacion || paramsReabrir.calculoReabrir;
    setSelectedFile("");
    setSelectedSheet(0);
    setMostrarDatos(false);
    setMostrarCreacion(false);
    setMenuAbierto(false);
    setModalAlerta({ isOpen: false, mensaje: '', titulo: 'Atención', tipo: 'warning' });
    // Quitar el estado del historial desbloquea el selector. La clave de
    // Principal cambia y reinicia sus parámetros, resultados y diálogos.
    navigate(operacion ? `/MAT251/${encodeURIComponent(operacion)}` : "/MAT251", {
      replace: true,
      state: null,
    });
  };

  return (
    <div className="mat251 contenedor-principal-sistema">
      {historialOrigen && (
        <section id="tour-mat251-barra-historial" className="aviso-origen-historial" aria-label="Cálculo reabierto del historial">
          <svg className="aviso-origen-historial-icono" width="22" height="22" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 11a9 9 0 1 1 2.8 7" />
            <polyline points="3 4 3 11 10 11" />
            <polyline points="12 7 12 12 15 14" />
          </svg>
          <div id="tour-mat251-historial-info" className="aviso-origen-historial-info">
            <span className="aviso-origen-historial-modulo">{historialOrigen.modulo || "MAT251"}</span>
            <p className="aviso-origen-historial-detalle">
              {[
                historialOrigen.fecha && `Guardado el ${historialOrigen.fecha}`,
                historialOrigen.hora,
              ].filter(Boolean).join(" - ")}
            </p>
          </div>
          <div className="acciones-historial-mat251">
            {esHistorialEditable && (
              <>
                <button type="button" id="tour-mat251-historial-guardar" className="btn-verde btn-volver-historial" disabled={guardando || !puedeGuardarCambios} onClick={handleGuardarCambiosHistorial}>
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
                <button type="button" id="tour-mat251-historial-restablecer" className="btn-azul btn-volver-historial" disabled={guardando} onClick={() => principalRef.current?.restablecerCalculoHistorial()}>
                  Restablecer datos
                </button>
              </>
            )}
            <button type="button" id="tour-mat251-historial-salir" className="btn-rojo btn-volver-historial" onClick={salirDelHistorial}>
              Salir del historial
            </button>
            <button type="button" id="tour-mat251-historial-volver" className="btn-azul btn-volver-historial" onClick={() => navigate("/historial")}>
              Volver al Historial
            </button>
          </div>
        </section>
      )}

      {/* VENTANA PRINCIPAL: CÁLCULOS (Principal.jsx) */}
      <div className="ventana-contenido-principal">
        <Principal
          key={paramsReabrir.snapshot ? `historial-${historialOrigen?.id || "abierto"}` : "normal"}
          ref={principalRef}
          usuario={usuario}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          selectedSheet={selectedSheet}
          setSelectedSheet={setSelectedSheet}
          reabrirState={location.state}
          onEstadoHistorialChange={setEstadoActualizacionHistorial}
        />
      </div>

      {/* MENÚ FLOTANTE RADIAL */}
      <div className={`menu-flotante-radial ${esHistorialEditable ? 'menu-historial-conteo' : ''} ${menuAbierto ? 'abierto' : ''}`}>

        {/* Botón Principal (Toggle) */}
        <button
          className="fab-main"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Menú de Herramientas"
          aria-expanded={menuAbierto}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>

        {!esHistorialEditable && (
          <>
            {/* Botón 1: Gestión de Datos */}
            <button
              className="fab-item item-1"
              onClick={() => { setMostrarDatos(true); setMenuAbierto(false); }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
              </svg>
              <span className="fab-tooltip">Gestión de Datos</span>
            </button>

            {/* Botón 2: Creación de Tablas MAT251 */}
            <button
              className="fab-item item-2"
              onClick={() => { setMostrarCreacion(true); setMenuAbierto(false); }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="3" y1="15" x2="21" y2="15"></line>
                <line x1="12" y1="3" x2="12" y2="21"></line>
              </svg>
              <span className="fab-tooltip">Creación de Tablas</span>
            </button>
          </>
        )}

        {/* Botón 3: Exportar Reporte PDF (Tema 1) */}
        <button
          className={`fab-item item-3-pdf ${exportandoPDF ? 'exportando' : ''}`}
          id="tour-mat251-fab-pdf"
          onClick={handleExportarPDF}
          disabled={exportandoPDF}
          title={exportandoPDF ? "Generando PDF..." : "Exportar Reporte PDF"}
          style={exportandoPDF ? { opacity: 0.7, pointerEvents: "none" } : undefined}
        >
          <IconoPDF size={23} />
          <span className="fab-tooltip">{exportandoPDF ? "Generando PDF..." : "Exportar Reporte PDF"}</span>
        </button>

        {!esHistorialEditable && (
          <>
            {/* Botón 4: Guardar en Historial */}
            <button
              type="button"
              className={`fab-item item-5-historial ${guardando ? 'guardando' : ''}`}
              id="tour-mat251-fab-historial"
              onClick={handleGuardarHistorial}
              disabled={guardando}
              title={guardando ? "Guardando en historial..." : "Guardar en historial"}
              aria-label="Guardar en historial"
              style={guardando ? { opacity: 0.7, pointerEvents: "none" } : undefined}
            >
              <IconoGuardar />
              <span className="fab-tooltip">{guardando ? "Guardando..." : "Guardar en historial"}</span>
            </button>
          </>
        )}

        {/* Botón 5: Guía Rápida Interactiva */}
        <button
          className="fab-item item-4-guia"
          id="tour-mat251-fab-guia"
          onClick={() => {
            setMenuAbierto(false);
            iniciarGuiaMAT251();
          }}
          title={historialOrigen ? "Guía del historial" : "Guía Rápida"}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="fab-tooltip">{historialOrigen ? "Guía del historial" : "Guía Rápida"}</span>
        </button>
      </div>

      {/* MODAL DE GESTIÓN DE DATOS */}
      {mostrarDatos && (
        <div className="modal-overlay-datos">
          <div className="modal-content-datos">
            <button
              className="btn-cerrar-modal"
              onClick={() => setMostrarDatos(false)}
            >
              Cerrar
            </button>
            <Datos
              setSelectedFile={setSelectedFile}
              selectedFile={selectedFile}
              setSelectedSheet={setSelectedSheet}
            />
          </div>
        </div>
      )}

      {/* MODAL DE CREACIÓN DE TABLAS MAT251 */}
      {mostrarCreacion && (
        <div className="modal-overlay-datos">
          <div className="modal-content-datos modal-content-crear-tabla">
            <button
              className="btn-cerrar-modal"
              onClick={() => setMostrarCreacion(false)}
            >
              Cerrar
            </button>
            <div style={{ height: "100%" }}>
              <TablaDinamicaMAT251 onTablaCreada={() => setMostrarCreacion(false)} />
            </div>
          </div>
        </div>
      )}

      {/* ESTADO DEL ARCHIVO */}
      {selectedFile && !paramsReabrir.snapshot && !historialOrigen && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          padding: '12px 20px',
          backgroundColor: '#dcfce7',
          borderRadius: '8px',
          border: '1px solid #86efac',
          color: '#166534',
          display: 'flex',
          justifyContent: 'space-between',
          zIndex: 10
        }}>
          Archivo cargado: {selectedFile}
        </div>
      )}
      <ModalAlerta
        isOpen={modalAlerta.isOpen}
        onClose={() => setModalAlerta(prev => ({ ...prev, isOpen: false }))}
        titulo={modalAlerta.titulo}
        mensaje={modalAlerta.mensaje}
        tipo={modalAlerta.tipo}
      />
    </div>
  );
}
