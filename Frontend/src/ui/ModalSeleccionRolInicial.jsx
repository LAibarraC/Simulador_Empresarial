import { useState } from "react";
import { api } from "../services/api";
import { alerta } from "../utils/Notificaciones";
import logoCarrera from "../assets/images/Logo-Adm.png";
import "../styles/ui/Login.css";

export default function ModalSeleccionRolInicial({ usuario, onRolAsignado }) {
  const [ci, setCi] = useState("");
  const [cu, setCu] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleConfirmar = async (e) => {
    e.preventDefault();
    if (!ci.trim() || !cu.trim()) {
      alerta.error("Datos incompletos", "Por favor, ingresa tu CI y tu CU.");
      return;
    }

    setGuardando(true);
    try {
      const dataActualizada = await api.asignarRolInicial({ rol: "estudiante", ci: ci.trim(), cu: cu.trim() });
      if (dataActualizada.token) localStorage.setItem("token", dataActualizada.token);
      alerta.success("Perfil configurado", "Tus datos fueron registrados correctamente.");
      onRolAsignado?.(dataActualizada);
    } catch (error) {
      alerta.error("Error al guardar datos", error.message || "No se pudieron guardar tus datos.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="precuenta-modal-overlay" style={{ zIndex: 9999999 }}>
      <div className="precuenta-modal login-card" role="dialog" aria-modal="true" aria-labelledby="titulo-datos-estudiante">
        <img className="precuenta-logo" src={logoCarrera} alt="Logo Administración de Empresas" />
        <h2 id="titulo-datos-estudiante">¡Bienvenido, {usuario?.nombre || "Usuario"}!</h2>
        <p className="precuenta-modal-description">Para completar tu registro como estudiante, ingresa tus datos académicos.</p>

        <form onSubmit={handleConfirmar} className="precuenta-form">
          <div className="floating-input-group always-floating" style={{ textAlign: "left", height: "50px" }}>
            <input type="text" value={ci} onChange={(e) => setCi(e.target.value)} placeholder=" " />
            <label className="etiqueta">Carnet de Identidad (CI)</label>
            <fieldset className="notch"><legend><span>Carnet de Identidad (CI)</span></legend></fieldset>
          </div>
          <div className="floating-input-group always-floating" style={{ textAlign: "left", height: "50px" }}>
            <input type="text" value={cu} onChange={(e) => setCu(e.target.value)} placeholder=" " />
            <label className="etiqueta">Carnet Universitario (CU)</label>
            <fieldset className="notch"><legend><span>Carnet Universitario (CU)</span></legend></fieldset>
          </div>
          <button type="submit" className="btn-auth btn-amarillo precuenta-confirm-button" disabled={guardando}>
            {guardando ? "Guardando..." : "Confirmar datos"}
          </button>
        </form>
      </div>
    </div>
  );
}
