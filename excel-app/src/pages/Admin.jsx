import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { alerta } from '../utils/Notificaciones';
import { IconoAdvertencia } from '../components/ui/iconos';

export default function Admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // Modal de confirmación para eliminar
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [confirmarNombre, setConfirmarNombre] = useState('');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const data = await api.obtenerUsuarios();
      setUsuarios(data);
    } catch (error) {
      alerta.error("Error", error.message || "No se pudieron cargar los usuarios");
    } finally {
      setCargando(false);
    }
  };

  const handleCambiarRol = async (email, nuevoRol) => {
    try {
      await api.cambiarRol(email, nuevoRol);
      alerta.exito("Rol actualizado", `El rol de ${email} ha sido actualizado a ${nuevoRol}`);
      // Actualizamos el estado local
      setUsuarios(prev => prev.map(u => u.email === email ? { ...u, rol: nuevoRol, perfil: nuevoRol } : u));
    } catch (error) {
      alerta.error("Error", error.message || "No se pudo cambiar el rol");
    }
  };

  const handleCambiarEstado = async (email, activo) => {
    try {
      await api.cambiarEstado(email, activo);
      const accion = activo ? "activado" : "suspendido";
      alerta.exito(`Cuenta ${accion}`, `El usuario ${email} ha sido ${accion} con éxito`);
      setUsuarios(prev => prev.map(u => u.email === email ? { ...u, activo } : u));
    } catch (error) {
      alerta.error("Error", error.message || "No se pudo cambiar el estado");
    }
  };

  const handleEliminarUsuario = async (e) => {
    e.preventDefault();
    if (!usuarioAEliminar) return;

    if (confirmarNombre !== usuarioAEliminar.nombre) {
      alerta.error("Confirmación incorrecta", "El nombre ingresado no coincide con el del usuario.");
      return;
    }

    try {
      await api.eliminarUsuario(usuarioAEliminar.email);
      alerta.exito("Usuario eliminado", "La cuenta y todos los datos asociados han sido eliminados.");
      setUsuarios(prev => prev.filter(u => u.email !== usuarioAEliminar.email));
      setUsuarioAEliminar(null);
      setConfirmarNombre('');
    } catch (error) {
      alerta.error("Error", error.message || "No se pudo eliminar el usuario");
    }
  };

  const usuariosFiltrados = usuarios.filter(u => 
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', position: 'relative' }}>
      
      {/* CABECERA */}
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <div className="admin-title-container">
          <h2 style={{ fontSize: '2rem', margin: '0 0 5px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            Panel de Administración Real
          </h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
            Administra roles, suspende cuentas y elimina registros de forma centralizada.
          </p>
        </div>

        {/* Buscador */}
        <div className="admin-search-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg-card)', padding: '6px 15px', borderRadius: '30px', border: '1px solid var(--border-color)', minWidth: '280px', flex: '1', maxWidth: '380px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Buscar por nombre o correo..." 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)', width: '100%', fontSize: '0.9rem' }}
          />
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div 
        className="grafico-card" 
        style={{ 
          borderRadius: '12px', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', 
          backgroundColor: 'var(--bg-card)', 
          padding: '25px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}
      >
        {cargando ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }} />
            <p style={{ color: 'var(--text-muted)' }}>Cargando usuarios...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            No se encontraron usuarios registrados.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tabla-responsive tabla-responsiva-panel" style={{ width: '100%', borderCollapse: 'collapse', borderSpacing: 0, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '12px 15px', fontWeight: 'bold' }}>Nombre / Correo</th>
                  <th style={{ padding: '12px 15px', fontWeight: 'bold' }}>Rol</th>
                  <th style={{ padding: '12px 15px', fontWeight: 'bold' }}>Estado</th>
                  <th style={{ padding: '12px 15px', fontWeight: 'bold' }}>Registro</th>
                  <th style={{ padding: '12px 15px', fontWeight: 'bold', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((u, index) => (
                  <tr 
                    key={u.email} 
                    style={{ 
                      borderBottom: '1px solid var(--border-color)', 
                      backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)'}
                  >
                    <td data-label="Nombre / Correo" style={{ padding: '15px' }}>
                      <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{u.nombre}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td data-label="Rol" style={{ padding: '15px' }}>
                      <select 
                        value={u.rol} 
                        onChange={(e) => handleCambiarRol(u.email, e.target.value)}
                        disabled={u.rol === "Administrador"}
                        style={{ 
                          padding: '6px 12px', 
                          borderRadius: '6px', 
                          border: '1px solid var(--border-color)', 
                          backgroundColor: u.rol === 'Administrador' ? 'rgba(239, 68, 68, 0.1)' : (u.rol === 'Docente' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)'), 
                          color: u.rol === 'Administrador' ? '#ef4444' : (u.rol === 'Docente' ? '#10b981' : '#3b82f6'), 
                          fontWeight: 'bold',
                          cursor: u.rol === 'Administrador' ? 'not-allowed' : 'pointer',
                          outline: 'none',
                          fontSize: '0.85rem'
                        }}
                      >
                        <option value="Estudiante" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }}>Estudiante</option>
                        <option value="Docente" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }}>Docente</option>
                        <option value="Administrador" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }}>Administrador</option>
                      </select>
                    </td>
                    <td data-label="Estado" style={{ padding: '15px' }}>
                      <span 
                        style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold',
                          backgroundColor: u.activo ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: u.activo ? '#10b981' : '#ef4444'
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: u.activo ? '#10b981' : '#ef4444' }}></span>
                        {u.activo ? 'Activo' : 'Suspendido'}
                      </span>
                    </td>
                    <td data-label="Registro" style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {u.fecha_creacion ? u.fecha_creacion.split(' ')[0] : 'N/A'}
                    </td>
                    <td data-label="Acciones" style={{ padding: '15px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {u.rol !== 'Administrador' ? (
                          <>
                            <button
                              onClick={() => handleCambiarEstado(u.email, !u.activo)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid ' + (u.activo ? '#f59e0b' : '#10b981'),
                                background: 'transparent',
                                color: u.activo ? '#f59e0b' : '#10b981',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = u.activo ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              {u.activo ? 'Suspender' : 'Activar'}
                            </button>
                            <button
                              onClick={() => setUsuarioAEliminar(u)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid #ef4444',
                                background: 'transparent',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                            >
                              Eliminar
                            </button>
                          </>
                        ) : (
                          <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Protegido 🛡️</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {usuarioAEliminar && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000, backdropFilter: 'blur(3px)' }}>
          <div 
            className="grafico-card"
            style={{ 
              width: '95%', 
              maxWidth: '500px', 
              backgroundColor: 'var(--bg-card)', 
              borderRadius: '12px', 
              padding: '30px', 
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <h3 style={{ margin: '0 0 15px 0', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconoAdvertencia size={18} color="#ef4444" />
              Confirmar Eliminación Permanente
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5', marginBottom: '20px' }}>
              Estás a punto de eliminar al usuario <strong>{usuarioAEliminar.nombre}</strong> ({usuarioAEliminar.email}). Esto borrará permanentemente su cuenta, archivos, historial de cálculos e inscripciones. Esta acción no se puede deshacer.
            </p>

            <form onSubmit={handleEliminarUsuario} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ textAlign: 'left' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                  Escribe el nombre del usuario para confirmar (<strong>{usuarioAEliminar.nombre}</strong>):
                </label>
                <input 
                  type="text" 
                  value={confirmarNombre}
                  onChange={(e) => setConfirmarNombre(e.target.value)}
                  placeholder="Escribe el nombre exacto"
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setUsuarioAEliminar(null);
                    setConfirmarNombre('');
                  }}
                  style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Confirmar Borrado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ESTILOS DE ANIMACIÓN SPIN */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
