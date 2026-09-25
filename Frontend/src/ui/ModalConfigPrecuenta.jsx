import { useState } from "react";
import logoCarrera from "../assets/images/Logo-Adm.png";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { api } from "../services/api.js";
import { alerta } from "../utils/Notificaciones.jsx";
import { IconoCheck, IconoX } from "./iconos.jsx";
import "../styles/ui/Login.css";
import "../styles/ui/ModalConfigPrecuenta.css";

export default function ModalConfigPrecuenta({ onActualizado }) {
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const passwordSegura = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSymbol;

  const actualizarSesion = (data) => {
    if (data.token) localStorage.setItem("token", data.token);
    onActualizado(data);
  };

  const confirmarCambios = async (e) => {
    e.preventDefault();
    if (!passwordSegura) {
      alerta.warning("Contraseña insegura", "Usa al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.");
      return;
    }
    setCargando(true);
    try {
      const data = await api.configurarPrecuenta({ password });
      actualizarSesion(data);
      alerta.success("Cuenta configurada", "Tu contraseña fue actualizada.");
    } catch (error) {
      alerta.error("No se pudo actualizar", error.message);
    } finally {
      setCargando(false);
    }
  };

  const iniciarConGoogle = async (tokenGoogle) => {
    setCargando(true);
    try {
      const data = await api.vincularGoogle(tokenGoogle);
      actualizarSesion(data);
      alerta.success("Google vinculado", "La sesión se inició correctamente.");
    } catch (error) {
      alerta.error("No se pudo vincular Google", error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="precuenta-modal-overlay">
      <div className="precuenta-modal login-card" role="dialog" aria-modal="true" aria-labelledby="titulo-configurar-precuenta">
        <img className="precuenta-logo" src={logoCarrera} alt="Logo Administración de Empresas" />
        <h2 id="titulo-configurar-precuenta">Configura tu cuenta</h2>
        <p className="precuenta-modal-description">Es tu primer inicio. El correo asignado por la administración se mantendrá sin cambios. Actualiza tu contraseña o vincula tu cuenta de Google para continuar.</p>

        <form onSubmit={confirmarCambios} className="precuenta-form">
          <div className="floating-input-group always-floating" style={{ textAlign: "left", height: "50px" }}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder=" " minLength={8} autoComplete="new-password" />
            <label className="etiqueta">Nueva contraseña</label>
            <fieldset className="notch"><legend><span>Nueva contraseña</span></legend></fieldset>
          </div>
          {password.length > 0 && (
            <div className="precuenta-password-checklist">
              <span className={hasMinLength ? "is-valid" : "is-invalid"}>{hasMinLength ? <IconoCheck /> : <IconoX />} Al menos 8 caracteres</span>
              <span className={hasUpperCase ? "is-valid" : "is-invalid"}>{hasUpperCase ? <IconoCheck /> : <IconoX />} Una letra mayúscula</span>
              <span className={hasLowerCase ? "is-valid" : "is-invalid"}>{hasLowerCase ? <IconoCheck /> : <IconoX />} Una letra minúscula</span>
              <span className={hasNumber ? "is-valid" : "is-invalid"}>{hasNumber ? <IconoCheck /> : <IconoX />} Un número</span>
              <span className={hasSymbol ? "is-valid" : "is-invalid"}>{hasSymbol ? <IconoCheck /> : <IconoX />} Un símbolo</span>
            </div>
          )}
          <button type="submit" className="btn-auth btn-amarillo precuenta-confirm-button" disabled={!passwordSegura || cargando}>
            {cargando ? "Guardando..." : "Confirmar cambios"}
          </button>
        </form>

        <div className="precuenta-separator"><span>O vincula tu cuenta</span></div>
        <div className="precuenta-google">
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLogin onSuccess={(response) => iniciarConGoogle(response.credential)} onError={() => alerta.error("Error", "No se pudo iniciar sesión con Google")} text="continue_with" shape="rectangular" theme="outline" />
          </GoogleOAuthProvider>
        </div>
        <small className="precuenta-modal-note">Puedes usar tu nueva contraseña o vincular directamente tu cuenta de Google.</small>
      </div>
    </div>
  );
}
