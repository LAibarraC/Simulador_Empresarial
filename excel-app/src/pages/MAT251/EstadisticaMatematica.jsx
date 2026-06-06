import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Datos from "../Datos";
import { useCalculadoraExcel } from "../../hooks/useCalculadoraExcel";
import { useData } from "../../components/excel/DataContext";
import Principal from '../../components/MAT251/Principal/Principal';
import "../../styles/pages/MAT251/Pantalla.css";
import "../../styles/pages/MAT251/CalculosMat251.css";

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
  const [mostrarDatos, setMostrarDatos] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedSheet, setSelectedSheet] = useState(0);

  const _stats = useCalculadoraExcel(selectedFile, selectedSheet);

  const esAdmin = usuario?.rol === "Administrador" || usuario?.isAdmin === true;

  const targetDate = new Date("2026-10-30T00:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (esAdmin) return;

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
  }, [esAdmin]);

  if (!esAdmin) {
    return (
      <div 
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

          {/* Contador de Tiempo */}
          <div 
            className="restricted-countdown"
            style={{ 
              display: "flex", 
              gap: "10px", 
              justifyContent: "center", 
              width: "100%",
              marginBottom: "25px"
            }}
          >
            {[
              { label: "Días", value: timeLeft.days },
              { label: "Horas", value: timeLeft.hours },
              { label: "Min.", value: timeLeft.minutes },
              { label: "Seg.", value: timeLeft.seconds }
            ].map((unit, idx) => (
              <div 
                key={idx}
                className="countdown-unit"
                style={{
                  flex: 1,
                  padding: "10px 5px",
                  borderRadius: "12px",
                  backgroundColor: "var(--bg-main)",
                  border: "1px solid var(--border-color)",
                  minWidth: "65px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}
              >
                <span className="countdown-value" style={{ fontSize: "1.3rem", fontWeight: "700", color: "var(--accent-color, #f39c12)" }}>
                  {unit.value.toString().padStart(2, "0")}
                </span>
                <span className="countdown-label" style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", marginTop: "2px", fontWeight: "600" }}>
                  {unit.label}
                </span>
              </div>
            ))}
          </div>

          <hr style={{ width: "100%", border: "0", borderTop: "1px solid var(--border-color)", margin: "0 0 25px 0" }} />

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
              Usar Calc. General
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contenedor-principal-sistema">
      {/* VENTANA PRINCIPAL: CÁLCULOS (Principal.jsx) */}
      <div className="ventana-contenido-principal">
        <Principal />
      </div>

      {/* MENÚ FLOTANTE RADIAL */}
      <div className={`menu-flotante-radial ${menuAbierto ? 'abierto' : ''}`}>
        
        {/* Botón Principal (Toggle) */}
        <button
          className="fab-main"
          onClick={() => setMenuAbierto(!menuAbierto)}
          title="Menú de Herramientas"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>

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

        {/* Botón 2: Placeholder 1 */}
        <button
          className="fab-item item-2"
          onClick={() => alert("Próximamente 1")}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="3" y1="15" x2="21" y2="15"></line>
            <line x1="12" y1="3" x2="12" y2="21"></line>
          </svg>
          <span className="fab-tooltip">Creación de Tablas</span>
        </button>

        {/* Botón 3: Placeholder 2 */}
        <button
          className="fab-item item-3"
          onClick={() => alert("Próximamente 2")}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span className="fab-tooltip">Reportes Extras</span>
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

      {/* ESTADO DEL ARCHIVO */}
      {selectedFile && (
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
    </div>
  );
}