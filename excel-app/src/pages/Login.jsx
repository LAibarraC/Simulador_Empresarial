import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import logoCarrera from "../assets/images/Logo-Adm.png";
import { api } from "../services/api";
import { alerta } from '../utils/Notificaciones';
import '../styles/components/ui/Login.css';

// 🆕 Importamos tu componente original (Ajusta la ruta si tu carpeta se llama distinto)
import OscuroClaro from "../components/ui/oscuro_claro.jsx";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState(""); // 🆕 Ahora usamos email
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState(""); 
  const [isFlipping, setIsFlipping] = useState(false); // 🆕 Estado para el efecto de volteo al salir

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const perfil = await api.loginLocal(email, pass);
      localStorage.setItem("token", perfil.token); // Save the JWT token
      onLogin(perfil); 
      alerta.success("Acceso concedido", `Bienvenido, ${perfil.nombre}`);
    } catch (error) {
      if (error.message === "Credenciales incorrectas") {
        alerta.error("Credenciales incorrectas", "Por favor, verifica tu correo y contraseña.");
      } else {
        alerta.error("Error de conexión", "Asegúrate de que el servidor Backend esté corriendo.");
      }
    }
  };

  const handleNavToRegistro = (e) => {
    e.preventDefault();
    setIsFlipping(true);
    setTimeout(() => {
      navigate("/registro");
    }, 300); // Se navega a los 300ms (cuando está de perfil y casi invisible)
  };

  return (
    <div className="login-container" style={{ position: 'relative' }}>
      
      {/* Botón en la esquina superior derecha */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
        <OscuroClaro />
      </div>

      <div className={`login-card ${isFlipping ? 'flipping-out' : ''}`}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img
            src={logoCarrera}
            alt="Logo Administración de Empresas"
            style={{ width: '200px', height: 'auto' }}
          />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 🆕 Actualizado a Correo Electrónico */}
          <div style={{ textAlign: 'left' }}>
            <label className="etiqueta">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label className="etiqueta">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? "text" : "password"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Ingrese su contraseña"
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '55%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPass ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" style={{
            backgroundColor: 'var(--accent-color)',
            padding: '12px',
            fontSize: '1rem',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '5px',
            fontWeight: 'bold'
          }}>
            Ingresar
          </button>

          {error && (
            <div style={{ color: '#dc2626', fontSize: '1rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
        </form>

        <div className="login-footer-link">
          <span>¿No tienes una cuenta?</span>
          <Link to="/registro" onClick={handleNavToRegistro} className="login-link-bold">Regístrate aquí</Link>
        </div>

      </div>
    </div>
  );
}