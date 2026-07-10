import { useState } from "react";
import { Link } from "react-router-dom";
import { alerta } from "../../utils/Notificaciones.jsx";
import logoCarrera from "../../assets/images/Logo-Adm.png";
import OscuroClaro from "../../ui/oscuro_claro.jsx";
import "../../styles/ui/Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Expresión regular robusta para validar formato de correo electrónico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Si está vacío, no se marca como inválido inmediatamente para evitar mostrar rojo de entrada
  const isEmailValid = email === "" || emailRegex.test(email);
  const canSubmit = email !== "" && emailRegex.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      console.log(`[ForgotPassword] Iniciando recuperación para: ${email}`);
      console.log(`[ForgotPassword] POST URL: ${BASE_URL}/api/auth/forgot-password`);
      
      const res = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (res.ok) {
        setSuccess(true);
        alerta.success("Solicitud enviada", "Si el correo está registrado, recibirás un enlace de recuperación.");
      } else {
        const errData = await res.json();
        alerta.error("Error", errData.detail || "Error al procesar la solicitud.");
      }
    } catch (error) {
      console.error("[ForgotPassword] Error:", error);
      alerta.error("Error de conexión", "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ position: "relative" }}>
      <div style={{ position: "absolute", top: "20px", left: "20px", zIndex: 1000 }}>
        <OscuroClaro />
      </div>

      <div className="login-card">
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img src={logoCarrera} alt="Logo" style={{ width: "200px", height: "auto" }} />
        </div>

        <h3 style={{ color: "var(--text-main)", marginBottom: "15px", textAlign: "center" }}>
          Recuperar Contraseña
        </h3>

        {success ? (
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <p style={{ color: "var(--text-main)", fontSize: "0.95rem", lineHeight: "1.5" }}>
              Si el correo está registrado, recibirás un enlace en tu bandeja de entrada.
            </p>
            <div style={{ marginTop: "25px" }}>
              <Link to="/login" style={{ color: "var(--accent-color)", fontWeight: "bold", textDecoration: "none" }}>
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", margin: 0 }}>
              Introduce tu correo electrónico y te enviaremos un enlace seguro para restablecer tu contraseña.
            </p>

            <div style={{ textAlign: "left" }}>
              <label className="etiqueta" style={{ color: "var(--text-main)" }}>Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                style={{
                  borderColor: !isEmailValid ? "#dc2626" : "var(--border-color)",
                  outline: "none"
                }}
                required
              />
              {!isEmailValid && (
                <span style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: "5px", display: "block", fontWeight: "bold" }}>
                  Por favor, introduce un correo electrónico válido.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !canSubmit}
              style={{
                backgroundColor: loading || !canSubmit ? "var(--border-color)" : "var(--accent-color)",
                cursor: loading || !canSubmit ? "not-allowed" : "pointer",
                padding: "12px",
                fontSize: "1rem",
                color: "white",
                border: "none",
                borderRadius: "5px",
                fontWeight: "bold",
                transition: "background-color 0.2s"
              }}
            >
              {loading ? "Enviando..." : "Enviar Enlace"}
            </button>

            <div style={{ textAlign: "center", fontSize: "0.9rem", marginTop: "5px" }}>
              <p style={{ color: "var(--text-main)" }}>
                ¿Recordaste tu contraseña?{" "}
                <Link to="/login" style={{ color: "var(--accent-color)", fontWeight: "bold", textDecoration: "none" }}>
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
