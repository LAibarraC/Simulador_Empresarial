import { useState } from "react";
import { api } from "../services/api";
import { alerta } from "../utils/Notificaciones";
import logoCarrera from "../assets/images/Logo-Adm.png";
import "../styles/ui/Login.css"; // Importamos los estilos profesionales de registro/login

export default function ModalSeleccionRolInicial({ usuario, onRolAsignado }) {
  const [step, setStep] = useState(1); // 1: Selección de Rol, 2: Credenciales
  const [rolSeleccionado, setRolSeleccionado] = useState("estudiante");
  const [ci, setCi] = useState("");
  const [cu, setCu] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleNextStep = () => {
    if (!rolSeleccionado) {
      alerta.error("Selecciona un rol", "Por favor, elige si eres Estudiante o Docente para continuar.");
      return;
    }
    setStep(2);
  };

  const handleConfirmar = async () => {
    if (!ci.trim()) {
      alerta.error("Datos incompletos", "Por favor, ingresa tu CI.");
      return;
    }
    if (rolSeleccionado === "estudiante" && !cu.trim()) {
      alerta.error("Datos incompletos", "Por favor, ingresa tu CU.");
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        rol: rolSeleccionado,
        ci: ci.trim(),
        cu: rolSeleccionado === "estudiante" ? cu.trim() : null
      };
      const dataActualizada = await api.asignarRolInicial(payload);
      if (dataActualizada.token) {
        localStorage.setItem("token", dataActualizada.token);
      }
      alerta.success("Perfil configurado", `Te has identificado como ${dataActualizada.rol}. ¡Bienvenido!`);
      if (onRolAsignado) {
        onRolAsignado(dataActualizada);
      }
    } catch (error) {
      alerta.error("Error al guardar rol", error.message || "No se pudo guardar tu rol.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 9999999,
      padding: "20px"
    }}>
      <div className="login-card" style={{
        maxWidth: "460px",
        width: "100%",
        // Mantenemos el fondo oscuro del modal pero usamos la clase login-card para botones e inputs
        backgroundColor: "var(--bg-card, #1e293b)",
        borderRadius: "16px",
        border: "1px solid var(--accent-color, #f97316)",
        padding: "30px 25px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
        textAlign: "center",
        animation: "fadeInScale 0.3s ease-out"
      }}>
        <style>{`
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.92); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        <img src={logoCarrera} alt="Logo" style={{ width: "130px", height: "auto", marginBottom: "15px" }} />

        <h3 style={{ margin: "0 0 8px 0", color: "var(--text-main, #fff)", fontSize: "1.3rem" }}>
          ¡Bienvenido, {usuario?.nombre || "Usuario"}!
        </h3>
        <p style={{ margin: "0 0 22px 0", color: "var(--text-muted, #94a3b8)", fontSize: "0.9rem", lineHeight: "1.4" }}>
          {step === 1
            ? "Es tu primera vez iniciando sesión. Selecciona tu rol para configurar tu experiencia:"
            : `Has seleccionado el rol de ${rolSeleccionado === "docente" ? "Docente" : "Estudiante"}. Ahora, verifica tus credenciales:`}
        </p>

        {step === 1 && (
          <div className="step-animation" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {/* Opción Estudiante */}
              <div
                onClick={() => setRolSeleccionado("estudiante")}
                style={{
                  position: "relative",
                  padding: "20px 12px",
                  borderRadius: "12px",
                  border: rolSeleccionado === "estudiante" ? "2px solid var(--accent-color)" : "1px solid var(--border-color)",
                  backgroundColor: rolSeleccionado === "estudiante" ? "rgba(255, 112, 0, 0.12)" : "rgba(128, 128, 128, 0.05)",
                  boxShadow: rolSeleccionado === "estudiante" ? "0 0 15px rgba(255, 112, 0, 0.25)" : "none",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  userSelect: "none"
                }}
                onMouseEnter={(e) => {
                  if (rolSeleccionado !== 'estudiante') {
                    e.currentTarget.style.borderColor = 'var(--accent-color)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (rolSeleccionado !== 'estudiante') {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <div style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  border: rolSeleccionado === "estudiante" ? "none" : "1.5px solid var(--border-color)",
                  backgroundColor: rolSeleccionado === "estudiante" ? "var(--accent-color)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  transition: "all 0.2s ease"
                }}>
                  {rolSeleccionado === "estudiante" && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>

                <div style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  backgroundColor: rolSeleccionado === "estudiante" ? "var(--accent-color)" : "rgba(128, 128, 128, 0.12)",
                  color: rolSeleccionado === "estudiante" ? "white" : "var(--text-main)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "10px",
                  transition: "all 0.25s ease"
                }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>

                <span style={{ fontWeight: "700", fontSize: "1.05rem", color: rolSeleccionado === "estudiante" ? "var(--accent-color)" : "var(--text-main)", marginBottom: "4px" }}>
                  Estudiante
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.3" }}>
                  Aprende y compite
                </span>
              </div>

              {/* Opción Docente */}
              <div
                onClick={() => setRolSeleccionado("docente")}
                style={{
                  position: "relative",
                  padding: "20px 12px",
                  borderRadius: "12px",
                  border: rolSeleccionado === "docente" ? "2px solid var(--accent-color)" : "1px solid var(--border-color)",
                  backgroundColor: rolSeleccionado === "docente" ? "rgba(255, 112, 0, 0.12)" : "rgba(128, 128, 128, 0.05)",
                  boxShadow: rolSeleccionado === "docente" ? "0 0 15px rgba(255, 112, 0, 0.25)" : "none",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  userSelect: "none"
                }}
                onMouseEnter={(e) => {
                  if (rolSeleccionado !== 'docente') {
                    e.currentTarget.style.borderColor = 'var(--accent-color)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (rolSeleccionado !== 'docente') {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <div style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  border: rolSeleccionado === "docente" ? "none" : "1.5px solid var(--border-color)",
                  backgroundColor: rolSeleccionado === "docente" ? "var(--accent-color)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  transition: "all 0.2s ease"
                }}>
                  {rolSeleccionado === "docente" && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>

                <div style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "12px",
                  backgroundColor: rolSeleccionado === "docente" ? "var(--accent-color)" : "rgba(128, 128, 128, 0.12)",
                  color: rolSeleccionado === "docente" ? "white" : "var(--text-main)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "10px",
                  transition: "all 0.25s ease"
                }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z" />
                    <path d="M6 6h10" />
                    <path d="M6 10h10" />
                    <path d="M6 14h6" />
                  </svg>
                </div>

                <span style={{ fontWeight: "700", fontSize: "1.05rem", color: rolSeleccionado === "docente" ? "var(--accent-color)" : "var(--text-main)", marginBottom: "4px" }}>
                  Docente
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: "1.3" }}>
                  Crea y gestiona clases
                </span>
              </div>
            </div>
            <button
              onClick={handleNextStep}
              className="btn-auth btn-amarillo"
              style={{
                width: "100%",
                padding: "13px",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer",
                borderRadius: "8px",
              }}
            >
              Siguiente
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="step-animation" style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
            <div className="form-row-responsive" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="floating-input-group always-floating" style={{ height: '52px' }}>
                <input
                  type="text"
                  value={ci}
                  onChange={(e) => setCi(e.target.value)}
                  placeholder="Ingrese su CI"
                />
                <label className="etiqueta">Carnet de Identidad (CI) <span style={{ color: "#ef4444" }}>*</span></label>
                <fieldset className="notch"><legend><span>CI</span></legend></fieldset>
              </div>
              {rolSeleccionado === "estudiante" && (
                <div className="floating-input-group always-floating" style={{ height: '52px' }}>
                  <input
                    type="text"
                    value={cu}
                    onChange={(e) => setCu(e.target.value)}
                    placeholder="Ingrese su CU"
                  />
                  <label className="etiqueta">Carnet Universitario (CU) <span style={{ color: "#ef4444" }}>*</span></label>
                  <fieldset className="notch"><legend><span>CU</span></legend></fieldset>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "12px", marginTop: '10px' }}>
              <button
                onClick={() => setStep(1)}
                className="btn-auth btn-gris"
                style={{
                  flex: 1,
                  padding: "13px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  borderRadius: "8px",
                }}
              >
                Atrás
              </button>
              <button
                onClick={handleConfirmar}
                disabled={guardando}
                className="btn-auth btn-amarillo"
                style={{
                  flex: 2,
                  padding: "13px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  cursor: guardando ? "not-allowed" : "pointer",
                  borderRadius: "8px",
                  opacity: guardando ? 0.7 : 1,
                }}
              >
                {guardando ? "Guardando..." : "Finalizar Registro"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
