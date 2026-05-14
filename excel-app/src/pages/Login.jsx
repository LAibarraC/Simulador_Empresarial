import { useState } from "react";
import { Link } from "react-router-dom";
import logoCarrera from "../assets/images/Logo-Adm.png";
import { alerta } from '../utils/Notificaciones';
import "../styles/pages/Auth.css";

export default function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login_local`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: user, password: pass })
      });

      if (response.ok) {
        const perfil = await response.json();
        onLogin(perfil); 
        alerta.success("Acceso concedido", `Bienvenido, ${perfil.nombre}`);
      } else {
        alerta.error("Credenciales incorrectas", "Por favor, verifica tu usuario y contraseña.");
      }
    } catch (error) {
      alerta.error("Error de conexión", "Asegúrate de que el servidor Backend esté corriendo.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card auth-animate-card">
        <div style={{ textAlign: 'center', marginBottom: '20px' }} className="auth-logo-animate">
          <img
            src={logoCarrera}
            alt="Logo Administración de Empresas"
            style={{ width: '200px', height: 'auto' }}
          />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="auth-field delay-1" style={{ textAlign: 'left' }}>
            <label className="etiqueta">Usuario</label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Ingrese su usuario"
            />
          </div>

          <div className="auth-field delay-2" style={{ textAlign: 'left' }}>
            <label className="etiqueta">Contraseña</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Ingrese su contraseña"
            />
          </div>

          <button type="submit" className="auth-field delay-3" style={{
            backgroundColor: 'var(--accent-color)',
            padding: '12px',
            fontSize: '1rem',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}>
            Ingresar
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }} className="auth-field delay-4">
          <p>¿No tienes una cuenta? <Link to="/registro" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Regístrate aquí</Link></p>
        </div>

      </div>
    </div>
  );
}