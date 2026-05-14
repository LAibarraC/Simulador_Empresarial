import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logoCarrera from "../assets/images/Logo-Adm.png";
import { alerta } from '../utils/Notificaciones';
import "../styles/pages/Auth.css";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [perfil, setPerfil] = useState("Estudiante Externo");
  const [institucion, setInstitucion] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pass !== confirmPass) {
      alerta.error("Error", "Las contraseñas no coinciden.");
      return;
    }

    if (nombre && user && email && institucion && pass) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/registrar_usuario`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: nombre,
            usuario: user,
            email: email,
            perfil: perfil,
            institucion: institucion,
            password: pass
          })
        });

        if (response.ok) {
          alerta.success("Cuenta creada", "Tu usuario ha sido registrado correctamente.");
          navigate("/login");
        } else {
          const errorData = await response.json();
          alerta.error("Error", errorData.error || "No se pudo registrar.");
        }
      } catch (error) {
        alerta.error("Error de conexión", "Asegúrate de que el servidor Backend esté corriendo.");
      }
    } else {
      alerta.error("Datos incompletos", "Por favor, llena todos los campos del formulario.");
    }
  };

  return (
    <div className="login-container" style={{ padding: '20px' }}>
      <div className="login-card auth-animate-card" style={{ maxWidth: '550px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }} className="auth-logo-animate">
          <img src={logoCarrera} alt="Logo" style={{ width: '150px', height: 'auto' }} />
          <h3 style={{ marginTop: '15px', color: '#333' }}>Únete al Software Estadístico</h3>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>Crea tu cuenta para acceder a las herramientas de análisis.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

          <div className="auth-field delay-1" style={{ textAlign: 'left' }}>
            <label className="etiqueta">Nombre Completo</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Juan Pérez" />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="auth-field delay-2" style={{ textAlign: 'left', flex: 1 }}>
              <label className="etiqueta">Usuario</label>
              <input type="text" value={user} onChange={(e) => setUser(e.target.value)} placeholder="Ej. juanp" />
            </div>
            <div className="auth-field delay-3" style={{ textAlign: 'left', flex: 1 }}>
              <label className="etiqueta">Correo Electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="auth-field delay-4" style={{ textAlign: 'left', flex: 1 }}>
              <label className="etiqueta">Perfil de Uso</label>
              <select
                value={perfil}
                onChange={(e) => setPerfil(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginTop: '5px' }}
              >
                <option value="Estudiante Externo">Estudiante Externo</option>
                <option value="Investigador">Investigador Independiente</option>
                <option value="Empresa">Empresa / Negocio</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="auth-field delay-5" style={{ textAlign: 'left', flex: 1 }}>
              <label className="etiqueta">Organización / Universidad</label>
              <input type="text" value={institucion} onChange={(e) => setInstitucion(e.target.value)} placeholder="Nombre de tu institución" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="auth-field delay-6" style={{ textAlign: 'left', flex: 1 }}>
              <label className="etiqueta">Contraseña</label>
              <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Crea una contraseña" />
            </div>
            <div className="auth-field delay-7" style={{ textAlign: 'left', flex: 1 }}>
              <label className="etiqueta">Confirmar Contraseña</label>
              <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Repite la contraseña" />
            </div>
          </div>

          <button type="submit" className="auth-field delay-7" style={{ backgroundColor: 'var(--accent-color)', padding: '12px', fontSize: '1rem', color: 'white', border: 'none', cursor: 'pointer', marginTop: '15px', borderRadius: '5px', fontWeight: 'bold' }}>
            Crear Cuenta
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }} className="auth-field delay-7">
          <p>¿Ya tienes una cuenta? <Link to="/login" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Inicia sesión aquí</Link></p>
        </div>
      </div>
    </div>
  );
}