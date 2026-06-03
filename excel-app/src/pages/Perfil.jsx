import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { alerta } from '../utils/Notificaciones';
import { api, BASE_URL } from "../services/api";
import { IconoUsuario, IconoCandado, IconoAlerta, IconoAjustes } from "../components/ui/iconos";
import "../styles/pages/Perfil.css";

export default function Perfil({ usuario, setUsuario }) {
  const navigate = useNavigate();

  // --- ESTADOS PARA GESTIÓN DE ROLES (ADMIN) ---
  const [listaUsuarios, setListaUsuarios] = useState([]);

  // --- ESTADOS PARA CAMBIAR CONTRASEÑA ---
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passNuevaConf, setPassNuevaConf] = useState("");

  const isNuevaPasswordMatch = passNueva === passNuevaConf;
  const isNuevaPasswordTooShort = passNueva.length > 0 && passNueva.length < 6;

  // --- ESTADOS PARA ELIMINAR CUENTA ---
  const [mostrarConfirmarEliminar, setMostrarConfirmarEliminar] = useState(false);
  const [passEliminar, setPassEliminar] = useState("");
  const [palabraConfirmacion, setPalabraConfirmacion] = useState("");

  useEffect(() => {
    if (usuario && usuario.rol === "Administrador") {
      cargarUsuarios();
    }
  }, [usuario]);

  const cargarUsuarios = async () => {
    try {
      const res = await fetch(`${BASE_URL}/usuarios`);
      if (res.ok) {
        const data = await res.json();
        setListaUsuarios(data);
      }
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    }
  };

  const cambiarRol = async (email, nuevoRol) => {
    try {
      const res = await fetch(`${BASE_URL}/cambiar_rol`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, nuevo_rol: nuevoRol })
      });

      if (res.ok) {
        alerta.success("Rol actualizado", `El usuario ha sido ascendido a ${nuevoRol}`);
        cargarUsuarios();
      } else {
        alerta.error("Error", "No se pudo actualizar el rol");
      }
    } catch (error) {
      alerta.error("Error", "No hay conexión con el servidor");
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem("token");
    setUsuario(null);
    navigate('/login');
  };

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    if (!passActual || !passNueva || !passNuevaConf) {
      alerta.error("Campos vacíos", "Por favor, completa todos los campos.");
      return;
    }
    if (passNueva.length < 6) {
      alerta.error("Contraseña muy corta", "La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (passNueva !== passNuevaConf) {
      alerta.error("Error", "Las nuevas contraseñas no coinciden.");
      return;
    }
    try {
      await api.cambiarPasswordPerfil(usuario.email, passActual, passNueva);
      alerta.success("Contraseña actualizada", "Tu contraseña ha sido cambiada correctamente.");
      setPassActual("");
      setPassNueva("");
      setPassNuevaConf("");
    } catch (err) {
      alerta.error("Error", err.message || "La contraseña actual es incorrecta.");
    }
  };

  const handleEliminarCuenta = async (e) => {
    e.preventDefault();
    if (palabraConfirmacion !== "ELIMINAR") {
      alerta.error("Confirmación incorrecta", "Debes escribir la palabra 'ELIMINAR' en mayúsculas.");
      return;
    }
    if (!passEliminar) {
      alerta.error("Contraseña requerida", "Por favor, ingresa tu contraseña para confirmar.");
      return;
    }
    try {
      await api.eliminarCuenta(usuario.email, passEliminar);
      alerta.success("Cuenta eliminada", "Tu cuenta ha sido eliminada permanentemente.");
      localStorage.removeItem("token");
      setUsuario(null);
      navigate("/login");
    } catch (err) {
      alerta.error("Error", err.message || "La contraseña ingresada es incorrecta.");
    }
  };

  if (!usuario) return null;

  const getIniciales = (nombre) => {
    if (!nombre) return null;
    const nombreLimpio = nombre.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim();
    const partes = nombreLimpio.split(/\s+/).filter(Boolean);

    if (partes.length > 1) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    if (partes.length === 1) {
      return partes[0][0].toUpperCase();
    }
    return null;
  };

  return (
    <div className="perfil-container">

      {/* TARJETA DE PERFIL */}
      <div
        className="grafico-card"
        style={{
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          backgroundColor: 'var(--bg-card)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '110px', backgroundColor: 'var(--accent-color)' }}></div>

        <div className="perfil-card-content">

          <div style={{
            width: '110px', height: '110px', borderRadius: '50%', backgroundColor: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem',
            fontWeight: 'bold', color: 'var(--accent-color)', border: '5px solid var(--bg-card)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)', marginBottom: '15px'
          }}>
            {getIniciales(usuario.nombre) || <IconoUsuario width="48" height="48" />}
          </div>

          <h2 style={{ fontSize: '1.8rem', margin: '0 0 5px 0', color: 'var(--text-main)', textAlign: 'center', wordBreak: 'break-word' }}>
            {usuario.nombre}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: '0 0 20px 0', textAlign: 'center', wordBreak: 'break-word' }}>
            {usuario.email || "usuario@correo.com"}
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ backgroundColor: 'rgba(230, 126, 34, 0.1)', color: '#d35400', padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
              {usuario.perfil || usuario.rol || 'Estudiante Externo'}
            </span>

            {usuario.institucion && (
              <span style={{ backgroundColor: 'rgba(41, 128, 185, 0.1)', color: '#2980b9', padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {usuario.institucion}
              </span>
            )}
          </div>

          <div className="perfil-stats-container">
            <div className="perfil-stat-box">
              <h4 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--primary-color)' }}>12</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Cálculos Guardados</p>
            </div>
            <div className="perfil-stat-box">
              <h4 style={{ margin: 0, fontSize: '1.6rem', color: 'var(--primary-color)' }}>5</h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>Archivos Excel</p>
            </div>
          </div>

          <hr style={{ width: '100%', margin: '0 0 20px 0', borderColor: 'var(--border-color)', opacity: 0.3 }} />

          <div className="perfil-buttons-container">
            <button
              onClick={() => navigate('/calculos')}
              className="perfil-button-secondary"
            >
              Volver a la Calculadora
            </button>
            <button
              onClick={handleCerrarSesion}
              className="perfil-button-danger"
            >
              Cerrar Sesión
            </button>
          </div>

        </div>
      </div>

      {/* SECCIÓN DE SEGURIDAD Y CONFIGURACIÓN */}
      <div className="grafico-card perfil-seguridad-card">
        <h3 style={{ margin: '0 0 20px 0', color: 'var(--text-main)', borderBottom: "2px solid var(--border-color)", paddingBottom: "10px", display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconoCandado /> Seguridad y Contraseña
        </h3>

        <form onSubmit={handleCambiarPassword} className="perfil-security-form">
          <div style={{ textAlign: 'left' }}>
            <label className="etiqueta" style={{ color: 'var(--text-main)' }}>Contraseña Actual</label>
            <input
              type="password"
              value={passActual}
              onChange={(e) => setPassActual(e.target.value)}
              placeholder="Contraseña actual"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', boxSizing: 'border-box' }}
              required
            />
          </div>

          <div className="perfil-input-group-row">
            <div style={{ textAlign: 'left', flex: 1, minWidth: '200px' }}>
              <label className="etiqueta" style={{ color: 'var(--text-main)' }}>Nueva Contraseña (mínimo 6 caracteres)</label>
              <input
                type="password"
                value={passNueva}
                onChange={(e) => setPassNueva(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: isNuevaPasswordTooShort ? '1px solid #dc2626' : '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  boxSizing: 'border-box'
                }}
                required
              />
              {isNuevaPasswordTooShort && (
                <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '5px', display: 'block', fontWeight: 'bold' }}>
                  Debe tener al menos 6 caracteres.
                </span>
              )}
            </div>
            <div style={{ textAlign: 'left', flex: 1, minWidth: '200px' }}>
              <label className="etiqueta" style={{ color: 'var(--text-main)' }}>Confirmar Nueva Contraseña</label>
              <input
                type="password"
                value={passNuevaConf}
                onChange={(e) => setPassNuevaConf(e.target.value)}
                placeholder="Repite nueva contraseña"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: !isNuevaPasswordMatch && passNuevaConf !== "" ? '1px solid #dc2626' : '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  boxSizing: 'border-box'
                }}
                required
              />
              {!isNuevaPasswordMatch && passNuevaConf !== "" && (
                <span style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '5px', display: 'block', fontWeight: 'bold' }}>
                  Las contraseñas no coinciden.
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            style={{
              alignSelf: 'flex-start',
              backgroundColor: 'var(--accent-color)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginTop: '10px'
            }}
          >
            Actualizar Contraseña
          </button>
        </form>
      </div>

      {/* SECCIÓN DE DARSE DE BAJA */}
      <div className="grafico-card perfil-peligro-card">
        <h3 style={{ margin: '0 0 10px 0', color: '#dc2626', borderBottom: "2px solid rgba(220, 38, 38, 0.2)", paddingBottom: "10px", display: 'flex', alignItems: 'center', gap: '8px' }}>
          <IconoAlerta /> Zona de Peligro: Darse de Baja
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Al darse de baja, se eliminará tu cuenta y todos tus datos (archivos guardados, historial de cálculos, clases) de forma permanente del sistema. Esta acción no se puede deshacer.
        </p>

        {!mostrarConfirmarEliminar ? (
          <button
            onClick={() => setMostrarConfirmarEliminar(true)}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Eliminar Cuenta
          </button>
        ) : (
          <form onSubmit={handleEliminarCuenta} style={{ display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: 'rgba(220, 38, 38, 0.05)', padding: '20px', borderRadius: '8px', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#dc2626', fontSize: '0.9rem' }}>
              Confirmación de Seguridad requerida:
            </p>

            <div style={{ textAlign: 'left' }}>
              <label className="etiqueta" style={{ color: 'var(--text-main)' }}>
                Escribe la palabra <strong>ELIMINAR</strong> en mayúsculas:
              </label>
              <input
                type="text"
                value={palabraConfirmacion}
                onChange={(e) => setPalabraConfirmacion(e.target.value)}
                placeholder="Escribe ELIMINAR"
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #dc2626', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', marginTop: '5px', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div style={{ textAlign: 'left' }}>
              <label className="etiqueta" style={{ color: 'var(--text-main)' }}>
                Confirma ingresando tu contraseña actual:
              </label>
              <input
                type="password"
                value={passEliminar}
                onChange={(e) => setPassEliminar(e.target.value)}
                placeholder="Tu contraseña"
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', marginTop: '5px', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div className="danger-zone-buttons">
              <button
                type="submit"
                style={{
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Confirmar Borrado de Cuenta
              </button>
              <button
                type="button"
                onClick={() => {
                  setMostrarConfirmarEliminar(false);
                  setPalabraConfirmacion("");
                  setPassEliminar("");
                }}
                style={{
                  backgroundColor: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* --- PANEL DE ADMINISTRADOR (SOLO VISIBLE SI ES ADMIN) --- */}
      {usuario.rol === "Administrador" && (
        <div className="grafico-card admin-panel-card">
          <h3 className="admin-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconoAjustes /> Panel de Gestión de Roles
          </h3>
          <p className="admin-panel-desc">
            Como administrador, puedes cambiar el rol de los usuarios para otorgarles permisos de Docente.
          </p>

          <div className="admin-table-container">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol Actual</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {listaUsuarios.map((u, index) => (
                  <tr key={u.email}>
                    <td className="admin-user-name">{u.nombre}</td>
                    <td className="admin-user-email">{u.email}</td>
                    <td>
                      <span className={`rol-badge badge-${u.rol.toLowerCase()}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td>
                      {u.rol !== "Administrador" ? (
                        <select
                          value={u.rol}
                          onChange={(e) => cambiarRol(u.email, e.target.value)}
                        >
                          <option value="Estudiante">Estudiante</option>
                          <option value="Docente">Docente</option>
                        </select>
                      ) : (
                        <span className="rol-protegido">Protegido</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}