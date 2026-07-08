import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { alerta } from '../utils/Notificaciones';
import { api } from "../services/api";
import '../styles/pages/Perfil.css';

export default function Perfil({ usuario, setUsuario }) {
  const navigate = useNavigate();
  
  // --- ESTADOS PARA DATOS REALES ---
  const [historial, setHistorial] = useState([]);
  const [archivosCount, setArchivosCount] = useState(0);
  const [cargandoDatos, setCargandoDatos] = useState(true);

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
    if (usuario) {
      cargarDatosPerfil();
    }
  }, [usuario]);

  const cargarDatosPerfil = async () => {
    try {
      setCargandoDatos(true);
      // Cargar historial de cálculos
      const histData = await api.obtenerHistorial(usuario.nombre);
      setHistorial(histData.historial || []);

      // Cargar archivos personales para contar cuántos tiene
      const filesData = await api.obtenerArchivos(usuario.nombre, "personal");
      const filesList = filesData.files || filesData || [];
      setArchivosCount(filesList.length);
    } catch (error) {
      console.error("Error al cargar datos del perfil:", error);
    } finally {
      setCargandoDatos(false);
    }
  };

  const handleEliminarHistorial = async (id) => {
    try {
      await api.eliminarHistorial(id, usuario.nombre);
      setHistorial(prev => prev.filter(reg => reg.id !== id));
      alerta.exito("Eliminado", "El registro ha sido borrado de tu historial.");
    } catch (error) {
      alerta.error("Error", "No se pudo eliminar el registro.");
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
      alerta.exito("Contraseña actualizada", "Tu contraseña ha sido cambiada correctamente.");
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
      alerta.exito("Cuenta eliminada", "Tu cuenta ha sido eliminada permanentemente.");
      localStorage.removeItem("token");
      setUsuario(null);
      navigate("/login");
    } catch (err) {
      alerta.error("Error", err.message || "La contraseña ingresada es incorrecta.");
    }
  };

  if (!usuario) return null; 

  const getIniciales = (nombre) => {
    if (!nombre) return 'U'; 
    const nombreLimpio = nombre.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').trim();
    const partes = nombreLimpio.split(/\s+/).filter(Boolean);
    
    if (partes.length > 1) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    if (partes.length === 1) {
      return partes[0][0].toUpperCase();
    }
    return 'U'; 
  };

  return (
    <div className="perfil-container">
      
      {/* TARJETA DE PERFIL */}
      <div className="perfil-card">
        <div className="perfil-banner"></div>

        <div className="perfil-card-body">
            
            <div className="perfil-avatar">
              {getIniciales(usuario.nombre)}
            </div>
            
            <h2 className="perfil-name">
              {usuario.nombre}
            </h2>
            <p className="perfil-email">
              {usuario.email || "usuario@correo.com"}
            </p>
            
            <div className="perfil-badges">
              <span className="perfil-badge-rol">
                 {usuario.perfil || usuario.rol || 'Estudiante Externo'}
              </span>
              
              {usuario.institucion && (
                <span className="perfil-badge-inst">
                   {usuario.institucion}
                 </span>
              )}
            </div>

            <div className="perfil-stats">
                <div className="perfil-stat-box">
                    <h4 className="perfil-stat-value">
                      {cargandoDatos ? '...' : historial.length}
                    </h4>
                    <p className="perfil-stat-label">Cálculos Guardados</p>
                </div>
                <div className="perfil-stat-box">
                    <h4 className="perfil-stat-value">
                      {cargandoDatos ? '...' : archivosCount}
                    </h4>
                    <p className="perfil-stat-label">Archivos Excel</p>
                </div>
            </div>

            <hr className="perfil-divider" />

            <div className="perfil-actions">
              <button 
                onClick={() => navigate('/calculadora')}
                className="btn-perfil btn-perfil-back"
              >
                Volver a la Calculadora
              </button>
              <button 
                onClick={handleCerrarSesion}
                className="btn-perfil btn-perfil-logout"
              >
                Cerrar Sesión
              </button>
            </div>

        </div>
      </div>

      {/* --- SECCIÓN HISTORIAL DE CÁLCULOS --- */}
      <div className="perfil-card-secondary">
        <h3 className="perfil-section-title">
          <span>Mi Historial de Cálculos Recientes</span>
          <button 
            onClick={() => navigate('/historial')}
            className="btn-perfil-link"
          >
            Ver Historial Completo
          </button>
        </h3>

        {cargandoDatos ? (
          <p className="perfil-text-info">Cargando registros del historial...</p>
        ) : historial.length === 0 ? (
          <p className="perfil-text-info-center">
            No tienes cálculos guardados todavía. Realiza un análisis en la calculadora para guardarlo.
          </p>
        ) : (
          <div className="perfil-table-container">
            <table className="perfil-table">
              <thead>
                <tr className="perfil-table-header-row">
                  <th className="perfil-th">Fecha / Hora</th>
                  <th className="perfil-th">Tipo de Cálculo</th>
                  <th className="perfil-th">Archivo Fuente</th>
                  <th className="perfil-th-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {historial.slice(0, 5).map((reg, index) => (
                  <tr key={reg.id} className="perfil-table-row">
                    <td className="perfil-td" data-label="Fecha / Hora">
                      <div className="perfil-date-cell">
                        <strong>{reg.fecha}</strong>
                        <small className="perfil-small-text">{reg.hora}</small>
                      </div>
                    </td>
                    <td className="perfil-td" data-label="Tipo de Cálculo">
                      <span className="perfil-calc-badge">
                        {reg.calculo.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="perfil-td-muted" data-label="Archivo Fuente">
                      {reg.archivo_origen}
                    </td>
                    <td className="perfil-td-center" data-label="Acciones">
                      <div className="perfil-table-actions">
                        <button
                          onClick={() => {
                            const datosBrutos = reg.snapshot || reg.resultados_json;
                            const snapshotListo = typeof datosBrutos === "string" ? JSON.parse(datosBrutos) : datosBrutos;
                            navigate("/calculadora", {
                              state: {
                                archivoReabrir: reg.archivo_origen,
                                calculoReabrir: reg.calculo,
                                snapshot: snapshotListo,
                              },
                            });
                          }}
                          className="btn-reabrir"
                        >
                          Reabrir
                        </button>
                        <button
                          onClick={() => handleEliminarHistorial(reg.id)}
                          className="btn-eliminar-registro"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {historial.length > 5 && (
              <p className="perfil-footer-notice">
                Mostrando los 5 cálculos más recientes. Para ver la lista completa haz clic en 
                <span onClick={() => navigate('/historial')} className="perfil-notice-link">Ver Historial Completo</span>.
              </p>
            )}
          </div>
        )}
      </div>

      {/* SECCIÓN DE SEGURIDAD Y CONFIGURACIÓN */}
      <div className="grafico-card perfil-card-secondary">
        <h3 className="perfil-section-title">
          Seguridad y Contraseña
        </h3>
        
        <form onSubmit={handleCambiarPassword} className="perfil-form">
          <div className="perfil-form-group">
            <label className="etiqueta">Contraseña Actual</label>
            <input 
              type="password" 
              value={passActual} 
              onChange={(e) => setPassActual(e.target.value)} 
              placeholder="Contraseña actual" 
              className="perfil-input" 
              required
            />
          </div>
          
          <div className="perfil-form-row">
            <div className="perfil-form-col">
              <label className="etiqueta">Nueva Contraseña (mínimo 6 caracteres)</label>
              <input 
                type="password" 
                value={passNueva} 
                onChange={(e) => setPassNueva(e.target.value)} 
                placeholder="Mínimo 6 caracteres" 
                className={`perfil-input ${isNuevaPasswordTooShort ? 'input-error' : ''}`} 
                required
              />
              {isNuevaPasswordTooShort && (
                <span className="perfil-input-error-text">
                  Debe tener al menos 6 caracteres.
                </span>
              )}
            </div>
            <div className="perfil-form-col">
              <label className="etiqueta">Confirmar Nueva Contraseña</label>
              <input 
                type="password" 
                value={passNuevaConf} 
                onChange={(e) => setPassNuevaConf(e.target.value)} 
                placeholder="Repite nueva contraseña" 
                className={`perfil-input ${!isNuevaPasswordMatch && passNuevaConf !== "" ? 'input-error' : ''}`} 
                required
              />
              {!isNuevaPasswordMatch && passNuevaConf !== "" && (
                <span className="perfil-input-error-text">
                  Las contraseñas no coinciden.
                </span>
              )}
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn-submit-perfil"
          >
            Actualizar Contraseña
          </button>
        </form>
      </div>

      {/* SECCIÓN DE DARSE DE BAJA */}
      <div className="grafico-card perfil-card-danger">
        <h3 className="perfil-danger-title">
          Zona de Peligro: Darse de Baja
        </h3>
        <p className="perfil-danger-desc">
          Al darse de baja, se eliminará tu cuenta y todos tus datos (archivos guardados, historial de cálculos, clases) de forma permanente del sistema. Esta acción no se puede deshacer.
        </p>

        {!mostrarConfirmarEliminar ? (
          <button 
            onClick={() => setMostrarConfirmarEliminar(true)}
            className="btn-danger-perfil"
          >
            Eliminar Cuenta
          </button>
        ) : (
          <form onSubmit={handleEliminarCuenta} className="perfil-form-danger-confirm">
            <p className="perfil-danger-warning-title">
              Confirmación de Seguridad requerida:
            </p>
            
            <div className="perfil-form-group">
              <label className="etiqueta">
                Escribe la palabra <strong>ELIMINAR</strong> en mayúsculas:
              </label>
              <input 
                type="text" 
                value={palabraConfirmacion} 
                onChange={(e) => setPalabraConfirmacion(e.target.value)} 
                placeholder="Escribe ELIMINAR" 
                className="perfil-input input-error" 
                required
              />
            </div>

            <div className="perfil-form-group">
              <label className="etiqueta">
                Confirma ingresando tu contraseña actual:
              </label>
              <input 
                type="password" 
                value={passEliminar} 
                onChange={(e) => setPassEliminar(e.target.value)} 
                placeholder="Tu contraseña" 
                className="perfil-input" 
                required
              />
            </div>

            <div className="perfil-btn-group">
              <button 
                type="submit"
                className="btn-danger-confirm"
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
                className="btn-cancel-confirm"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}