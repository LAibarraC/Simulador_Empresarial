import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logoCarrera from "../assets/images/simuledu_logo.png";
import { alerta } from '../utils/Notificaciones';
import '../styles/components/ui/Login.css'; // Aseguramos que cargue los estilos de la tarjeta

// Importamos el componente de modo oscuro
import OscuroClaro from "../components/ui/oscuro_claro.jsx"; 
import { BASE_URL } from "../services/api";

export default function Registro() {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  
  const navigate = useNavigate();

  const isPasswordMatch = pass === confirmPass;
  const isPasswordTooShort = pass.length > 0 && pass.length < 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (pass.length < 6) {
      alerta.error("Contraseña muy corta", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    
    if (pass !== confirmPass) {
      alerta.error("Error", "Las contraseñas no coinciden.");
      return;
    }

    if (nombres && apellidos && email && pass) {
      try {
        const payload = {
          nombre: `${String(nombres).trim()} ${String(apellidos).trim()}`,
          email: String(email).trim(),
          password: String(pass)
        };

        const response = await fetch(`${BASE_URL}/registrar_usuario`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          alerta.success("Cuenta creada", "Tu cuenta ha sido registrada exitosamente.");
          navigate("/login"); 
        } else {
          let msgError = "No se pudo registrar.";
          try {
            const errorData = await response.json();
            if (errorData.detail) {
              if (Array.isArray(errorData.detail)) {
                msgError = errorData.detail.map(err => {
                  const campo = err.loc ? err.loc[err.loc.length - 1] : "";
                  return campo ? `El campo '${campo}': ${err.msg}` : err.msg;
                }).join(" | ");
              } else {
                msgError = errorData.detail;
              }
            } else if (errorData.error) {
              msgError = errorData.error;
            }
          } catch (jsonErr) {
            msgError = `Error del servidor (${response.status}): ${response.statusText || "Error interno"}`;
          }
          alerta.error("Error al registrar", msgError);
        }
      } catch (error) {
        alerta.error("Error de conexión", "No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo.");
      }
    } else {
      alerta.error("Datos incompletos", "Por favor, llena todos los campos del formulario.");
    }
  };

  return (
    <div className="login-container" style={{ padding: '20px', position: 'relative' }}>
      
      {/* Botón en la esquina superior izquierda */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 1000 }}>
        <OscuroClaro />
      </div>

      <div className="login-card" style={{ maxWidth: '500px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img src={logoCarrera} alt="Logo" className="auth-logo" style={{ width: '150px', height: 'auto' }} />
          <h3 style={{ marginTop: '15px', color: '#ffffff' }}>Registro de Usuario</h3>
          <p style={{ fontSize: '0.9rem', color: '#D4D8DD' }}>Crea tu cuenta para acceder al sistema.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <label className="etiqueta" style={{ color: '#ffffff' }}>Nombres</label>
              <input 
                type="text" 
                value={nombres} 
                onChange={(e) => setNombres(e.target.value)} 
                placeholder="Ej. Juan Carlos" 
                style={{ width: '100%' }} 
                required
              />
            </div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <label className="etiqueta" style={{ color: '#ffffff' }}>Apellidos</label>
              <input 
                type="text" 
                value={apellidos} 
                onChange={(e) => setApellidos(e.target.value)} 
                placeholder="Ej. Pérez Gómez" 
                style={{ width: '100%' }} 
                required
              />
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <label className="etiqueta" style={{ color: '#ffffff' }}>Correo Electrónico</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="correo@ejemplo.com" 
              style={{ width: '100%' }} 
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <label className="etiqueta" style={{ color: '#ffffff' }}>Contraseña</label>
              <input 
                type="password" 
                value={pass} 
                onChange={(e) => setPass(e.target.value)} 
                placeholder="Ingrese su contraseña" 
                style={{ 
                  width: '100%',
                  borderColor: isPasswordTooShort ? '#dc2626' : 'var(--border-color)' 
                }} 
                required
              />
              {isPasswordTooShort && (
                <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '5px', display: 'block', fontWeight: 'bold' }}>
                  Debe tener al menos 6 caracteres.
                </span>
              )}
            </div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <label className="etiqueta" style={{ color: '#ffffff' }}>Confirmar Contraseña</label>
              <input 
                type="password" 
                value={confirmPass} 
                onChange={(e) => setConfirmPass(e.target.value)} 
                placeholder="Repite la contraseña" 
                style={{ 
                  width: '100%',
                  borderColor: !isPasswordMatch && confirmPass !== "" ? '#dc2626' : 'var(--border-color)'
                }} 
                required
              />
              {!isPasswordMatch && confirmPass !== "" && (
                <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '5px', display: 'block', fontWeight: 'bold' }}>
                  Las contraseñas no coinciden.
                </span>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            style={{ 
              backgroundColor: 'var(--accent-color)', 
              padding: '12px', 
              fontSize: '1rem', 
              color: 'white', 
              border: 'none', 
              cursor: 'pointer', 
              marginTop: '15px', 
              borderRadius: '5px', 
              fontWeight: 'bold'
            }}
          >
            Crear Cuenta
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          <p style={{ color: '#ffffff' }}>¿Ya tienes una cuenta? <Link to="/login" style={{ color: '#D4D8DD', fontWeight: 'bold' }}>Inicia sesión aquí</Link></p>
        </div>
      </div>
    </div>
  );
}