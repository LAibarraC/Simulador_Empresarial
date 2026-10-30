import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { alerta } from '../../utils/Notificaciones';
import { api } from "../../services/api";
import '../../styles/pages/Perfil.css';
import Skeleton from '../../ui/Skeleton';
import { obtenerNombreCalculoHistorial } from '../MAT251/Historial/historialMAT251';
import { obtenerOrigenHistorial } from '../history/origenHistorial';

function SelectorCalculadoraPerfil({ modulos }) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef(null);
  const botonRef = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    const cerrarFuera = event => {
      if (!contenedorRef.current?.contains(event.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', cerrarFuera);
    return () => document.removeEventListener('mousedown', cerrarFuera);
  }, [abierto]);

  if (modulos.length <= 1) {
    return (
      <Link to={modulos[0]?.ruta || '/'} className="btn-perfil btn-perfil-back">
        {modulos.length ? `Volver a ${modulos[0].codigo}` : 'Volver al Inicio'}
      </Link>
    );
  }

  return (
    <div className="perfil-calculadora-selector" ref={contenedorRef}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setAbierto(false);
      }}
      onKeyDown={event => {
        if (event.key === 'Escape' && abierto) {
          event.preventDefault();
          setAbierto(false);
          botonRef.current?.focus();
        }
      }}>
      <button type="button" ref={botonRef} className="btn-perfil btn-perfil-back perfil-calculadora-trigger"
        aria-expanded={abierto} aria-controls="perfil-calculadoras"
        onClick={() => setAbierto(prev => !prev)}>
        Volver a la Calculadora
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
          className={abierto ? 'perfil-calculadora-chevron abierto' : 'perfil-calculadora-chevron'}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {abierto && (
        <div id="perfil-calculadoras" className="perfil-calculadora-opciones" role="group" aria-label="Elegir calculadora">
          {modulos.map(modulo => (
            <Link key={modulo.codigo} to={modulo.ruta} className="perfil-calculadora-opcion"
              onClick={() => setAbierto(false)}>
              <strong>{modulo.codigo}</strong>
              <span>{modulo.nombre}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Perfil({ usuario, setUsuario }) {
  const navigate = useNavigate();

  // --- ESTADOS PARA DATOS REALES ---
  const [historial, setHistorial] = useState([]);
  const [archivosCount, setArchivosCount] = useState(0);
  const [espacio, setEspacio] = useState({ usado: 0, limite: 10 * 1024 * 1024 });
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
      // Retraso artificial de 2 segundos para ver el Skeleton (¡Bórralo luego!)
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Cargar historial de cálculos
      const histData = await api.obtenerHistorial(usuario.nombre);
      setHistorial(histData.historial || []);

      // Cargar archivos personales para contar cuántos tiene
      const filesData = await api.obtenerArchivos(usuario.nombre, "personal");
      const filesList = filesData.files || filesData || [];
      setArchivosCount(filesList.length);

      const espacioData = await api.obtenerEspacioUsado();
      if (espacioData) {
        setEspacio({ usado: espacioData.usado_bytes, limite: espacioData.limite_bytes });
      }
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
      const resultado = await api.eliminarCuenta(usuario.email, passEliminar);
      if (resultado.advertencia) {
        alerta.advertencia("Cuenta eliminada: limpieza pendiente", resultado.advertencia);
      } else {
        alerta.exito("Cuenta eliminada", "Tu cuenta ha sido eliminada permanentemente.");
      }
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

  const historialReciente = historial.slice(0, 5).map(registro => {
    let snapshot = registro.snapshot || registro.resultados_json || {};
    if (typeof snapshot === 'string') {
      try { snapshot = JSON.parse(snapshot); } catch { snapshot = {}; }
    }
    const modulo = String(registro.modulo || snapshot?.modulo || snapshot?.configuracion?.modulo || 'MAT151').toUpperCase();
    const registroVisible = { ...registro, modulo };
    return {
      ...registroVisible,
      nombreCalculo: obtenerNombreCalculoHistorial(registroVisible),
      ...obtenerOrigenHistorial(registroVisible),
    };
  });

  const esAdministrador = usuario.rol === 'Administrador';
  const modulosCalculadora = [
    { codigo: 'MAT151', nombre: 'Estadística General', ruta: '/calculadora' },
    { codigo: 'MAT251', nombre: 'Estadística Matemática', ruta: '/MAT251' },
  ].filter(modulo => esAdministrador || (usuario.modulos || []).includes(modulo.codigo));

  const usadoMB = (espacio.usado / 1048576).toFixed(2);
  const limiteMB = (espacio.limite / 1048576).toFixed(2);
  const porcentajeUso = Math.min((espacio.usado / espacio.limite) * 100, 100).toFixed(1);

  return (
    <div className="perfil-container">

      {/* TARJETA DE PERFIL */}
      <div className="perfil-card">
        <div className="perfil-banner"></div>

        <div className="perfil-card-body">

          <div className="perfil-avatar" style={usuario.foto_perfil ? { padding: 0, backgroundColor: 'transparent', border: 'none' } : {}}>
            {usuario.foto_perfil ? (
              <img 
                src={usuario.foto_perfil} 
                alt="Perfil" 
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} 
                referrerPolicy="no-referrer"
              />
            ) : (
              getIniciales(usuario.nombre)
            )}
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
              <div className="perfil-stat-content">
                <svg className="perfil-stat-icon" width="32" height="32" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <path d="M8 6h8v4H8zM8 14h1m3 0h1m3 0h0M8 18h1m3 0h1m3 0h0" />
                </svg>
                <h4 className="perfil-stat-value">
                  {cargandoDatos ? <Skeleton height="28px" width="40px" /> : historial.length}
                </h4>
              </div>
              <p className="perfil-stat-label">Cálculos Guardados</p>
            </div>
            <div className="perfil-stat-box">
              <div className="perfil-stat-content">
                <svg className="perfil-stat-icon" width="32" height="32" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6" />
                  <path d="M8 12h8v7H8zM12 12v7M8 15.5h8" />
                </svg>
                <h4 className="perfil-stat-value">
                  {cargandoDatos ? <Skeleton height="28px" width="40px" /> : archivosCount}
                </h4>
              </div>
              <p className="perfil-stat-label">Archivos Excel</p>
            </div>
          </div>

          {/* --- BARRA DE ALMACENAMIENTO MEJORADA --- */}
          <div id="tour-cuota" className="cuota-container">
            <div className="cuota-header">
              <div className="cuota-titulo">
                <span className="cuota-icono">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 7H4C2.9 7 2 7.9 2 9V17C2 18.1 2.9 19 4 19H20C21.1 19 22 18.1 22 17V9C22 7.9 21.1 7 20 7Z" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M2 11H22" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M6 15H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <span>Almacenamiento</span>
              </div>
              <span className={`cuota-porcentaje ${porcentajeUso > 90 ? 'cuota-critico' : porcentajeUso > 60 ? 'cuota-alerta' : ''}`}>
                {porcentajeUso}%
              </span>
            </div>

            <div className="cuota-barra-track">
              <div
                className={`cuota-barra-fill ${porcentajeUso > 90 ? 'fill-critico' : porcentajeUso > 60 ? 'fill-alerta' : 'fill-normal'}`}
                style={{ width: `${porcentajeUso}%` }}
              >
                <div className="cuota-barra-shine"></div>
              </div>
            </div>

            <div className="cuota-footer">
              <span className="cuota-usado">{usadoMB} MB usados</span>
              <span className="cuota-limite">de {limiteMB} MB</span>
            </div>

            {porcentajeUso > 90 && (
              <p className="cuota-warning-text">
                Estás por alcanzar tu límite de almacenamiento
              </p>
            )}
          </div>

          <div className="perfil-actions">
            <SelectorCalculadoraPerfil modulos={modulosCalculadora} />
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
      <section className="perfil-card-secondary perfil-history-card" aria-labelledby="perfil-history-title">
        <div className="perfil-history-header">
          <h3 id="perfil-history-title">Mi Historial de Cálculos Recientes</h3>
          <Link to="/historial" className="perfil-history-link">
            Ver historial completo <span aria-hidden="true">→</span>
          </Link>
        </div>

        {!cargandoDatos && historial.length === 0 ? (
          <p className="perfil-history-empty">
            No tienes cálculos guardados todavía. Realiza un análisis en la calculadora para guardarlo.
          </p>
        ) : (
          <>
            <div className="perfil-table-container" aria-busy={cargandoDatos}>
              <table className="perfil-table" aria-label="Cinco cálculos más recientes">
                <colgroup>
                  <col className="perfil-col-fecha" />
                  <col className="perfil-col-hora" />
                  <col className="perfil-col-calculo" />
                  <col className="perfil-col-modulo" />
                  <col className="perfil-col-archivo" />
                  <col className="perfil-col-modo" />
                </colgroup>
                <thead>
                  <tr className="perfil-table-header-row">
                    <th scope="col" className="perfil-th">Fecha</th>
                    <th scope="col" className="perfil-th">Hora</th>
                    <th scope="col" className="perfil-th">Tipo de cálculo</th>
                    <th scope="col" className="perfil-th">Módulo</th>
                    <th scope="col" className="perfil-th">Archivo fuente</th>
                    <th scope="col" className="perfil-th">Modo</th>
                  </tr>
                </thead>
                <tbody>
                  {cargandoDatos ? [1, 2, 3].map(i => (
                    <tr key={i} className="perfil-table-row perfil-history-loading">
                      <td className="perfil-td perfil-history-fecha" data-label="Fecha"><Skeleton height="12px" width="85%" /></td>
                      <td className="perfil-td perfil-history-hora" data-label="Hora"><Skeleton height="12px" width="85%" /></td>
                      <td className="perfil-td perfil-history-calculo" data-label="Tipo de cálculo"><Skeleton height="14px" width="90%" /></td>
                      <td className="perfil-td perfil-history-modulo" data-label="Módulo"><Skeleton height="14px" width="80%" /></td>
                      <td className="perfil-td perfil-history-archivo" data-label="Archivo fuente"><Skeleton height="12px" width="85%" /></td>
                      <td className="perfil-td perfil-history-modo" data-label="Modo"><Skeleton height="12px" width="85%" /></td>
                    </tr>
                  )) : historialReciente.map(reg => (
                    <tr key={reg.id} className="perfil-table-row">
                      <td className="perfil-td perfil-history-fecha" data-label="Fecha"><strong>{reg.fecha}</strong></td>
                      <td className="perfil-td perfil-history-hora" data-label="Hora">{reg.hora}</td>
                      <td className="perfil-td perfil-history-calculo" data-label="Tipo de cálculo">
                        <span className="perfil-calc-name">{reg.nombreCalculo}</span>
                      </td>
                      <td className="perfil-td perfil-history-modulo" data-label="Módulo">
                        <span className="perfil-module-badge">{reg.modulo}</span>
                      </td>
                      <td className="perfil-td perfil-history-archivo" data-label="Archivo fuente">{reg.archivoFuente}</td>
                      <td className="perfil-td perfil-history-modo" data-label="Modo">{reg.modoHistorial}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!cargandoDatos && (
              <p className="perfil-footer-notice">
                {historial.length > 5
                  ? 'Se muestran los 5 cálculos más recientes.'
                  : `${historial.length} ${historial.length === 1 ? 'cálculo guardado' : 'cálculos guardados'}.`}
              </p>
            )}
          </>
        )}
      </section>

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
              className="perfil-input input-mat251 placeholder-small"
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
                className={`perfil-input input-mat251 placeholder-small ${isNuevaPasswordTooShort ? 'input-error' : ''}`}
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
                className={`perfil-input input-mat251 placeholder-small ${!isNuevaPasswordMatch && passNuevaConf !== "" ? 'input-error' : ''}`}
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
        <h3 className="perfil-danger-title titulo-danger" style={{ color: "#ef4444" }}>
          Zona de Peligro: Darse de Baja
        </h3>
        <p className="perfil-danger-desc texto-danger" style={{ color: "#ef4444" }}>
          Al darse de baja, se eliminará tu cuenta y todos tus datos (asignaciones a módulos, credenciales vinculadas, archivos, historial, clases propias, tareas, entregas e inscripciones) de forma permanente del sistema. Esta acción no se puede deshacer.
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