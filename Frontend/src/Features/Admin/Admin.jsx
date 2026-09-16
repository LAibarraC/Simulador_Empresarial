import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { alerta } from '../../utils/Notificaciones';
import { IconoBuscar, IconoEscudo, IconoAlerta } from '../../ui/iconos';
import { BadgeCheck, CreditCard, GraduationCap, IdCard, Save, UserPlus, UserRound, X } from 'lucide-react';
import Skeleton from '../../ui/Skeleton';
import ReportesEstadisticas from './ReportesEstadisticas';
import ExcelUploader from '../../components/excel/ExcelUploader';

// Importaciones para el Tour (Guía Rápida)
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// Icono SVG de Ajustes/Filtro
const IconoAjustes = ({ width = 14, height = 14, style = {} }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

export default function Admin() {
  const [pestanaActiva, setPestanaActiva] = useState('usuarios'); // 'usuarios' | 'reportes' | 'credenciales'
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // Estados para credenciales
  const [credenciales, setCredenciales] = useState([]);
  const [cargandoCred, setCargandoCred] = useState(false);
  const [busquedaCred, setBusquedaCred] = useState('');
  const [currentCredPage, setCurrentCredPage] = useState(1);
  const [filtroRolCred, setFiltroRolCred] = useState('TODOS');
  const [filtroEstadoCred, setFiltroEstadoCred] = useState('TODOS');
  const [ordenFechaCarga, setOrdenFechaCarga] = useState('ninguno');
  const [mostrarModalCred, setMostrarModalCred] = useState(false);
  const [guardandoCred, setGuardandoCred] = useState(false);
  const [nuevaCredencial, setNuevaCredencial] = useState({ ci: '', cu: '', nombre: '', rol: 'Estudiante' });
  const credItemsPerPage = 5;

  // Estados para filtros por columna (Usuarios)
  const [menuFiltroAbierto, setMenuFiltroAbierto] = useState(null);
  const [filtroRol, setFiltroRol] = useState('TODOS');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [ordenFecha, setOrdenFecha] = useState('ninguno');

  const menuRef = useRef(null);

  // Modal de confirmación para eliminar usuario
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [confirmarNombre, setConfirmarNombre] = useState('');

  // Estados para paginación usuarios
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    if (pestanaActiva === 'credenciales') {
      cargarCredencialesLista();
    }
  }, [pestanaActiva]);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = await api.obtenerUsuarios();
      setUsuarios(data);
    } catch (error) {
      alerta.error("Error", error.message || "No se pudieron cargar los usuarios");
    } finally {
      setCargando(false);
    }
  };

  const cargarCredencialesLista = async () => {
    try {
      setCargandoCred(true);
      const data = await api.obtenerCredenciales();
      setCredenciales(data);
    } catch (error) {
      alerta.error("Error", error.message || "No se pudieron cargar las credenciales");
    } finally {
      setCargandoCred(false);
    }
  };

  const handleCambiarRol = async (email, nuevoRol) => {
    try {
      await api.cambiarRol(email, nuevoRol);
      alerta.exito("Rol actualizado", `El rol de ${email} ha sido actualizado a ${nuevoRol}`);
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

  const handleEliminarCredencial = async (ci) => {
    try {
      await api.eliminarCredencial(ci);
      alerta.exito("Credencial eliminada", `La credencial con CI ${ci} ha sido eliminada.`);
      cargarCredencialesLista();
    } catch (error) {
      alerta.error("Error", error.message || "No se pudo eliminar la credencial");
    }
  };

  const handleCrearCredencial = async (e) => {
    e.preventDefault();
    try {
      setGuardandoCred(true);
      await api.crearCredencial({
        ...nuevaCredencial,
        ci: nuevaCredencial.ci.trim(),
        cu: nuevaCredencial.cu.trim() || null,
        nombre: nuevaCredencial.nombre.trim(),
      });
      alerta.exito("Credencial creada", "La credencial quedó disponible para registro.");
      setMostrarModalCred(false);
      setNuevaCredencial({ ci: '', cu: '', nombre: '', rol: 'Estudiante' });
      setCurrentCredPage(1);
      await cargarCredencialesLista();
    } catch (error) {
      alerta.error("Error", error.message || "No se pudo crear la credencial");
    } finally {
      setGuardandoCred(false);
    }
  };

  const handleCargaCredenciales = async (file) => {
    if (!file) {
      alerta.error("Archivo faltante", "Por favor, selecciona un archivo .xlsx o .csv.");
      return;
    }
    try {
      const res = await api.cargarCredenciales(file);
      alerta.success("Carga Exitosa", res.message);
      cargarCredencialesLista();
    } catch (error) {
      alerta.error("Error en la carga", error.message || "No se pudieron cargar las credenciales.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoCarga(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const usuariosFiltrados = usuarios
    .filter(u => {
      const coincideBusquedaGeneral =
        u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(busqueda.toLowerCase());
      const coincideRol = filtroRol === 'TODOS' || u.rol === filtroRol;
      const coincideEstado = filtroEstado === 'TODOS' || (filtroEstado === 'ACTIVO' && u.activo) || (filtroEstado === 'SUSPENDIDO' && !u.activo);
      return coincideBusquedaGeneral && coincideRol && coincideEstado;
    })
    .sort((a, b) => {
      if (ordenFecha === 'asc') return new Date(a.fecha_creacion || 0) - new Date(b.fecha_creacion || 0);
      if (ordenFecha === 'desc') return new Date(b.fecha_creacion || 0) - new Date(a.fecha_creacion || 0);
      return 0;
    });

  const totalPages = Math.ceil(usuariosFiltrados.length / itemsPerPage);
  const usuariosPaginados = usuariosFiltrados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const credencialesFiltradas = credenciales
    .filter(c => {
      const search = busquedaCred.toLowerCase();
      const coincideBusqueda = (c.ci && c.ci.toLowerCase().includes(search)) ||
        (c.cu && c.cu.toLowerCase().includes(search)) ||
        (c.nombre && c.nombre.toLowerCase().includes(search));
      const coincideRol = filtroRolCred === 'TODOS' || c.rol === filtroRolCred;
      const estado = c.registrado ? 'REGISTRADO' : 'DISPONIBLE';
      const coincideEstado = filtroEstadoCred === 'TODOS' || estado === filtroEstadoCred;
      return coincideBusqueda && coincideRol && coincideEstado;
    })
    .sort((a, b) => {
      if (ordenFechaCarga === 'asc') return new Date(a.fecha_carga || 0) - new Date(b.fecha_carga || 0);
      if (ordenFechaCarga === 'desc') return new Date(b.fecha_carga || 0) - new Date(a.fecha_carga || 0);
      return 0;
    });

  const formatearFechaCarga = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-BO', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const renderNombreCredencial = (nombre) => {
    const partes = (nombre || '').trim().split(/\s+/).filter(Boolean);
    if (partes.length <= 2) return nombre;
    return (
      <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: '1.35', maxWidth: '100%' }}>
        <span>{partes.slice(0, 2).join(' ')}</span>
        <span style={{ color: 'var(--text-muted)', fontWeight: 'normal' }}>{partes.slice(2).join(' ')}</span>
      </span>
    );
  };
  const totalCredPages = Math.ceil(credencialesFiltradas.length / credItemsPerPage);
  const credencialesPaginadas = credencialesFiltradas.slice(
    (currentCredPage - 1) * credItemsPerPage,
    currentCredPage * credItemsPerPage
  );

  useEffect(() => {
    if (totalCredPages > 0 && currentCredPage > totalCredPages) {
      setCurrentCredPage(totalCredPages);
    }
  }, [currentCredPage, totalCredPages]);

  const ControlesPaginacionCredenciales = () => {
    if (totalCredPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px', paddingBottom: '10px' }}>
        <button
          onClick={() => setCurrentCredPage(prev => Math.max(prev - 1, 1))}
          disabled={currentCredPage === 1}
          style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border-color, #d1d5db)', background: currentCredPage === 1 ? 'var(--bg-input, #f3f4f6)' : 'transparent', color: currentCredPage === 1 ? '#9ca3af' : 'var(--text-main, #333)', cursor: currentCredPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
        >Anterior</button>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted, #6b7280)', fontWeight: 'bold' }}>
          Página {currentCredPage} de {totalCredPages}
        </span>
        <button
          onClick={() => setCurrentCredPage(prev => Math.min(prev + 1, totalCredPages))}
          disabled={currentCredPage === totalCredPages}
          style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border-color, #d1d5db)', background: currentCredPage === totalCredPages ? 'var(--bg-input, #f3f4f6)' : 'transparent', color: currentCredPage === totalCredPages ? '#9ca3af' : 'var(--text-main, #333)', cursor: currentCredPage === totalCredPages ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
        >Siguiente</button>
      </div>
    );
  };

  const toggleMenu = (columna) => {
    setMenuFiltroAbierto(prev => (prev === columna ? null : columna));
  };

  const ControlesPaginacion = () => {
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "25px", paddingBottom: "10px" }}>
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "1px solid var(--border-color, #d1d5db)",
            background: currentPage === 1 ? "var(--bg-input, #f3f4f6)" : "transparent",
            color: currentPage === 1 ? "#9ca3af" : "var(--text-main, #333)",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "0.9rem",
            transition: "all 0.2s"
          }}
        >
          Anterior
        </button>
        <span style={{ fontSize: "0.9rem", color: "var(--text-muted, #6b7280)", fontWeight: "bold" }}>
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            border: "1px solid var(--border-color, #d1d5db)",
            background: currentPage === totalPages ? "var(--bg-input, #f3f4f6)" : "transparent",
            color: currentPage === totalPages ? "#9ca3af" : "var(--text-main, #333)",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "0.9rem",
            transition: "all 0.2s"
          }}
        >
          Siguiente
        </button>
      </div>
    );
  };


  const getPopoverStyle = (columna) => ({
    position: 'absolute', top: 'calc(100% + 8px)',
    left: columna === 'registro' || columna === 'estado' || columna === 'fechaCarga' ? 'auto' : 0,
    right: columna === 'registro' || columna === 'estado' || columna === 'fechaCarga' ? 0 : 'auto',
    backgroundColor: 'var(--bg-card, #fff)', border: '1px solid var(--border-color, #e5e7eb)',
    borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
    padding: '6px', zIndex: 50, minWidth: '160px',
    textTransform: 'none', fontWeight: 'normal', color: 'var(--text-main, #1f2937)',
    display: 'flex', flexDirection: 'column', gap: '2px'
  });

  const btnAjustesStyle = (activo) => ({
    background: activo ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
    border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px',
    display: 'inline-flex', alignItems: 'center', color: activo ? '#3b82f6' : 'var(--text-muted, #6b7280)',
    transition: 'all 0.2s'
  });

  const btnOpcionStyle = (isSelected) => ({
    display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px',
    background: isSelected ? 'var(--bg-input, #f3f4f6)' : 'transparent',
    border: 'none', cursor: 'pointer', color: isSelected ? '#3b82f6' : 'var(--text-main, #333)',
    fontWeight: isSelected ? 'bold' : 'normal', fontSize: '0.85rem', borderRadius: '4px',
    transition: 'background 0.2s'
  });

  return (
    <>
    <div style={{ maxWidth: '1100px', margin: 'clamp(15px, 4vw, 40px) auto', padding: '0 20px', position: 'relative' }}>

      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(15px, 4vw, 25px)', flexWrap: 'wrap', gap: 'clamp(10px, 3vw, 20px)' }}>
        <div className="admin-title-container">
          <h2 className="titulo-seccion-unificado">Panel de Administración</h2>
          <p className="descripcion-seccion-unificada">
            {pestanaActiva === 'usuarios'
              ? 'Administra roles, suspende cuentas y elimina registros de forma centralizada.'
              : pestanaActiva === 'credenciales'
                ? 'Gestiona las credenciales autorizadas para el ingreso al sistema.'
                : 'Visualiza métricas clave, gráficos de actividad y reportes generales.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {pestanaActiva === 'usuarios' && (
            <div className="admin-search-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg-card)', padding: '6px 15px', borderRadius: '30px', border: '1px solid var(--border-color)', minWidth: '280px', flex: '1', maxWidth: '380px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}><IconoBuscar width="18" height="18" /></span>
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setCurrentPage(1); }}
                style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)', width: '100%', fontSize: '0.9rem' }}
              />
            </div>
          )}
          {pestanaActiva === 'credenciales' && (
            <div className="admin-search-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg-card)', padding: '6px 15px', borderRadius: '30px', border: '1px solid var(--border-color)', minWidth: '280px', flex: '1', maxWidth: '380px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}><IconoBuscar width="18" height="18" /></span>
              <input
                type="text"
                placeholder="Buscar por CI, CU o Nombre..."
                value={busquedaCred}
                onChange={(e) => { setBusquedaCred(e.target.value); setCurrentCredPage(1); }}
                style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)', width: '100%', fontSize: '0.9rem' }}
              />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
        <button
          onClick={() => setPestanaActiva('usuarios')}
          style={{
            padding: '10px 18px', backgroundColor: pestanaActiva === 'usuarios' ? 'var(--accent-color)' : 'transparent',
            color: pestanaActiva === 'usuarios' ? 'white' : 'var(--text-muted)', border: 'none', borderRadius: '8px',
            fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Gestión de Usuarios
        </button>

        <button
          onClick={() => setPestanaActiva('credenciales')}
          style={{
            padding: '10px 18px', backgroundColor: pestanaActiva === 'credenciales' ? 'var(--accent-color)' : 'transparent',
            color: pestanaActiva === 'credenciales' ? 'white' : 'var(--text-muted)', border: 'none', borderRadius: '8px',
            fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Gestión de Credenciales
        </button>

        <button
          onClick={() => setPestanaActiva('reportes')}
          style={{
            padding: '10px 18px', backgroundColor: pestanaActiva === 'reportes' ? 'var(--accent-color)' : 'transparent',
            color: pestanaActiva === 'reportes' ? 'white' : 'var(--text-muted)', border: 'none', borderRadius: '8px',
            fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Reportes y Estadísticas
        </button>
      </div>

      {pestanaActiva === 'reportes' ? (
        <ReportesEstadisticas />
      ) : pestanaActiva === 'credenciales' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="grafico-card" style={{ padding: '20px 25px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '18px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 240px' }}>
                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.2rem' }}>Credenciales autorizadas</h3>
                <span style={{ display: 'block', marginTop: '5px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Administra las credenciales disponibles para el ingreso al sistema.</span>
              </div>
              <div className="credenciales-acciones">
                <ExcelUploader compact onUpload={handleCargaCredenciales} />
                <button className="btn-azul credencial-accion-manual-button" onClick={() => setMostrarModalCred(true)}>
                  <UserPlus size={17} strokeWidth={2.2} aria-hidden="true" />
                  Agregar credencial
                </button>
              </div>
            </div>
          </div>

          <div className="grafico-card" style={{ padding: '25px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
            {cargandoCred ? (
              <div style={{ padding: '20px 0' }}>
                {[1,2,3,4,5].map(i => <div key={i} style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}><Skeleton height="30px" width="100%" borderRadius="6px" /></div>)}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="tabla-responsive tabla-responsiva-panel" style={{ width: '100%', minWidth: '900px', tableLayout: 'fixed', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <colgroup>
                    <col style={{ width: '11%' }} />
                    <col style={{ width: '11%' }} />
                    <col style={{ width: '23%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '11%' }} />
                  </colgroup>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '12px 15px', fontWeight: 'bold' }}>CI</th>
                      <th style={{ padding: '12px 15px', fontWeight: 'bold' }}>CU</th>
                      <th style={{ padding: '12px 15px', fontWeight: 'bold' }}>Nombre Completo</th>
                      <th style={{ padding: '12px 15px', fontWeight: 'bold', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Rol</span>
                          <button style={btnAjustesStyle(filtroRolCred !== 'TODOS')} onClick={() => toggleMenu('rolCred')} title="Filtrar por rol"><IconoAjustes /></button>
                        </div>
                        {menuFiltroAbierto === 'rolCred' && (
                          <div ref={menuRef} style={getPopoverStyle('rol')}>
                            {[{ label: 'Todos', value: 'TODOS' }, { label: 'Estudiante', value: 'Estudiante' }, { label: 'Docente', value: 'Docente' }].map(opcion => (
                              <button key={opcion.value} onClick={() => { setFiltroRolCred(opcion.value); setCurrentCredPage(1); setMenuFiltroAbierto(null); }} style={btnOpcionStyle(filtroRolCred === opcion.value)}>{opcion.label}</button>
                            ))}
                          </div>
                        )}
                      </th>
                      <th style={{ padding: '12px 15px', fontWeight: 'bold', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Estado</span>
                          <button style={btnAjustesStyle(filtroEstadoCred !== 'TODOS')} onClick={() => toggleMenu('estadoCred')} title="Filtrar por estado"><IconoAjustes /></button>
                        </div>
                        {menuFiltroAbierto === 'estadoCred' && (
                          <div ref={menuRef} style={getPopoverStyle('estado')}>
                            {[{ label: 'Todos', value: 'TODOS' }, { label: 'Disponible', value: 'DISPONIBLE' }, { label: 'Registrado', value: 'REGISTRADO' }].map(opcion => (
                              <button key={opcion.value} onClick={() => { setFiltroEstadoCred(opcion.value); setCurrentCredPage(1); setMenuFiltroAbierto(null); }} style={btnOpcionStyle(filtroEstadoCred === opcion.value)}>{opcion.label}</button>
                            ))}
                          </div>
                        )}
                      </th>
                      <th style={{ padding: '12px 15px', fontWeight: 'bold', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Fecha Carga</span>
                          <button style={btnAjustesStyle(ordenFechaCarga !== 'ninguno')} onClick={() => toggleMenu('fechaCarga')} title="Ordenar por fecha de carga"><IconoAjustes /></button>
                        </div>
                        {menuFiltroAbierto === 'fechaCarga' && (
                          <div ref={menuRef} style={getPopoverStyle('fechaCarga')}>
                            {[{ label: 'Sin orden', value: 'ninguno' }, { label: 'Más antiguas', value: 'asc' }, { label: 'Más recientes', value: 'desc' }].map(opcion => (
                              <button key={opcion.value} onClick={() => { setOrdenFechaCarga(opcion.value); setCurrentCredPage(1); setMenuFiltroAbierto(null); }} style={btnOpcionStyle(ordenFechaCarga === opcion.value)}>{opcion.label}</button>
                            ))}
                          </div>
                        )}
                      </th>
                      <th style={{ padding: '12px 15px', fontWeight: 'bold', textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {credencialesFiltradas.length === 0 ? (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>No se encontraron credenciales autorizadas.</td></tr>
                    ) : (
                      credencialesPaginadas.map((c, index) => (
                        <tr key={c.ci} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)' }}>
                          <td data-label="CI" style={{ padding: '12px 10px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.ci}>{c.ci}</td>
                          <td data-label="CU" style={{ padding: '12px 10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.cu || '—'}>{c.cu || '—'}</td>
                          <td data-label="Nombre Completo" style={{ padding: '12px 10px', overflow: 'hidden', wordBreak: 'normal' }}>{renderNombreCredencial(c.nombre)}</td>
                          <td data-label="Rol" style={{ padding: '12px 10px' }}>
                            <span style={{ display: 'inline-block', maxWidth: '100%', padding: '4px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 'bold', lineHeight: '1.2', backgroundColor: c.rol === 'Docente' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: c.rol === 'Docente' ? '#10b981' : '#3b82f6' }}>
                              {c.rol}
                            </span>
                          </td>
                          <td data-label="Estado" style={{ padding: '12px 10px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 'bold', whiteSpace: 'nowrap', backgroundColor: c.registrado ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', color: c.registrado ? '#10b981' : '#3b82f6' }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: c.registrado ? '#10b981' : '#3b82f6' }}></span>
                              {c.registrado ? 'Registrado' : 'Disponible'}
                            </span>
                          </td>
                          <td data-label="Fecha Carga" style={{ padding: '12px 10px', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatearFechaCarga(c.fecha_carga)}</td>
                          <td data-label="Acciones" style={{ padding: '12px 10px', textAlign: 'center' }}>
                            <button className="btn-rojo" onClick={() => handleEliminarCredencial(c.ci)} style={{ padding: '6px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>Eliminar</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <ControlesPaginacionCredenciales />
        </div>
      ) : (
        <>
          <div
            className="grafico-card"
            style={{
              borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              backgroundColor: 'var(--bg-card)', padding: '25px', border: '1px solid var(--border-color)'
            }}
          >
            {cargando ? (
              <div style={{ padding: '10px 0' }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '2px solid var(--border-color)', paddingBottom: '12px' }}>
                  <div style={{ flex: '1.5' }}><Skeleton height="15px" width="60%" /></div>
                  <div style={{ flex: '1' }}><Skeleton height="15px" width="50%" /></div>
                  <div style={{ flex: '1' }}><Skeleton height="15px" width="50%" /></div>
                  <div style={{ flex: '1' }}><Skeleton height="15px" width="60%" /></div>
                  <div style={{ flex: '1.5' }}><Skeleton height="15px" width="70%" /></div>
                </div>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ display: 'flex', gap: '20px', marginBottom: '15px', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
                    <div style={{ flex: '1.5', display: 'flex', flexDirection: 'column', gap: '8px' }}><Skeleton height="18px" width="80%" /><Skeleton height="14px" width="50%" /></div>
                    <div style={{ flex: '1' }}><Skeleton height="32px" width="90%" borderRadius="6px" /></div>
                    <div style={{ flex: '1' }}><Skeleton height="24px" width="70%" borderRadius="12px" /></div>
                    <div style={{ flex: '1' }}><Skeleton height="14px" width="50%" /></div>
                    <div style={{ flex: '1.5', display: 'flex', gap: '10px' }}><Skeleton height="30px" width="45%" borderRadius="6px" /><Skeleton height="30px" width="45%" borderRadius="6px" /></div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{ overflowX: 'auto', paddingBottom: menuFiltroAbierto ? '160px' : '10px', transition: 'padding-bottom 0.3s ease' }}
                id="tour-admin-tabla"
              >
                <table className="tabla-responsive tabla-responsiva-panel" style={{ width: '100%', borderCollapse: 'collapse', borderSpacing: 0, textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <th style={{ padding: '12px 15px', fontWeight: 'bold' }}>Nombre / Correo</th>
                      <th style={{ padding: '12px 15px', fontWeight: 'bold', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Rol</span>
                          <button style={btnAjustesStyle(filtroRol !== 'TODOS')} onClick={() => toggleMenu('rol')} title="Filtrar por rol"><IconoAjustes /></button>
                        </div>
                        {menuFiltroAbierto === 'rol' && (
                          <div ref={menuRef} style={getPopoverStyle('rol')}>
                            {[{ label: 'Todos', value: 'TODOS' }, { label: 'Estudiante', value: 'Estudiante' }, { label: 'Docente', value: 'Docente' }, { label: 'Administrador', value: 'Administrador' }].map(opcion => (
                              <button key={opcion.value} onClick={() => { setFiltroRol(opcion.value); setCurrentPage(1); setMenuFiltroAbierto(null); }} style={btnOpcionStyle(filtroRol === opcion.value)}>{opcion.label}</button>
                            ))}
                          </div>
                        )}
                      </th>
                      <th style={{ padding: '12px 15px', fontWeight: 'bold', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Estado</span>
                          <button style={btnAjustesStyle(filtroEstado !== 'TODOS')} onClick={() => toggleMenu('estado')} title="Filtrar por estado"><IconoAjustes /></button>
                        </div>
                        {menuFiltroAbierto === 'estado' && (
                          <div ref={menuRef} style={getPopoverStyle('estado')}>
                            {[{ label: 'Todos', value: 'TODOS' }, { label: 'Activos', value: 'ACTIVO' }, { label: 'Suspendidos', value: 'SUSPENDIDO' }].map(opcion => (
                              <button key={opcion.value} onClick={() => { setFiltroEstado(opcion.value); setCurrentPage(1); setMenuFiltroAbierto(null); }} style={btnOpcionStyle(filtroEstado === opcion.value)}>{opcion.label}</button>
                            ))}
                          </div>
                        )}
                      </th>
                      <th style={{ padding: '12px 15px', fontWeight: 'bold', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Registro</span>
                          <button style={btnAjustesStyle(ordenFecha !== 'ninguno')} onClick={() => toggleMenu('registro')} title="Ordenar por fecha"><IconoAjustes /></button>
                        </div>
                        {menuFiltroAbierto === 'registro' && (
                          <div ref={menuRef} style={getPopoverStyle('registro')}>
                            {[{ label: 'Sin orden', value: 'ninguno' }, { label: 'Más recientes primero', value: 'desc' }, { label: 'Más antiguos primero', value: 'asc' }].map(opcion => (
                              <button key={opcion.value} onClick={() => { setOrdenFecha(opcion.value); setCurrentPage(1); setMenuFiltroAbierto(null); }} style={btnOpcionStyle(ordenFecha === opcion.value)}>{opcion.label}</button>
                            ))}
                          </div>
                        )}
                      </th>
                      <th style={{ padding: '12px 15px', fontWeight: 'bold', textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>No se encontraron usuarios registrados con los filtros aplicados.</td></tr>
                    ) : (
                      usuariosPaginados.map((u, index) => (
                        <tr key={u.email} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)'}>
                          <td data-label="Nombre / Correo" style={{ padding: '15px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%' }}>
                              <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{u.nombre}</div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</div>
                            </div>
                          </td>
                          <td data-label="Rol" style={{ padding: '15px' }}>
                            <select className="tour-admin-rol" value={u.rol} onChange={(e) => handleCambiarRol(u.email, e.target.value)} disabled={u.rol === "Administrador"} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: u.rol === 'Administrador' ? 'rgba(239, 68, 68, 0.1)' : (u.rol === 'Docente' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)'), color: u.rol === 'Administrador' ? '#ef4444' : (u.rol === 'Docente' ? '#10b981' : '#3b82f6'), fontWeight: 'bold', cursor: u.rol === 'Administrador' ? 'not-allowed' : 'pointer', outline: 'none', fontSize: '0.85rem' }}>
                              <option value="Estudiante" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }}>Estudiante</option>
                              <option value="Docente" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }}>Docente</option>
                              <option value="Administrador" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }}>Administrador</option>
                            </select>
                          </td>
                          <td data-label="Estado" style={{ padding: '15px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', backgroundColor: u.activo ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: u.activo ? '#10b981' : '#ef4444' }}>
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
                                  <button className={u.activo ? "btn-amarillo tour-admin-estado" : "btn-azul tour-admin-estado"} onClick={() => handleCambiarEstado(u.email, !u.activo)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>{u.activo ? 'Suspender' : 'Activar'}</button>
                                  <button className="btn-rojo tour-admin-eliminar" onClick={() => setUsuarioAEliminar(u)} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Eliminar</button>
                                </>
                              ) : (
                                <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Protegido <IconoEscudo width="14" height="14" style={{ color: '#10b981' }} /></span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <ControlesPaginacion />
        </>
      )}
    </div>

    {mostrarModalCred && (
      <div className="credencial-modal-overlay">
        <div className="credencial-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-agregar-credencial">
          <div className="credencial-modal-header">
            <div className="credencial-modal-title-wrap">
              <div className="credencial-modal-icon"><UserRound size={24} aria-hidden="true" /></div>
              <div>
                <h3 id="titulo-agregar-credencial">Agregar credencial</h3>
                <p>Completa los datos para habilitar un nuevo acceso.</p>
              </div>
            </div>
            <button type="button" onClick={() => setMostrarModalCred(false)} className="credencial-modal-close" aria-label="Cerrar"><X size={20} /></button>
          </div>

          <form onSubmit={handleCrearCredencial} className="credencial-form">
            <div className="credencial-form-grid">
              <label className="credencial-field">
                <span><IdCard size={16} /> CI</span>
                <input type="text" value={nuevaCredencial.ci} onChange={(e) => setNuevaCredencial(prev => ({ ...prev, ci: e.target.value }))} placeholder="Número de CI" required />
              </label>
              <label className="credencial-field">
                <span><CreditCard size={16} /> CU <small>Opcional</small></span>
                <input type="text" value={nuevaCredencial.cu} onChange={(e) => setNuevaCredencial(prev => ({ ...prev, cu: e.target.value }))} placeholder="Número de CU" />
              </label>
            </div>
            <label className="credencial-field">
              <span><UserRound size={16} /> Nombre completo</span>
              <input type="text" value={nuevaCredencial.nombre} onChange={(e) => setNuevaCredencial(prev => ({ ...prev, nombre: e.target.value }))} placeholder="Nombre y apellidos" required />
            </label>
            <label className="credencial-field">
              <span><GraduationCap size={16} /> Rol</span>
              <select value={nuevaCredencial.rol} onChange={(e) => setNuevaCredencial(prev => ({ ...prev, rol: e.target.value }))}>
                <option value="Estudiante">Estudiante</option>
                <option value="Docente">Docente</option>
                <option value="Docente Sustituto">Docente Sustituto</option>
              </select>
            </label>
            <div className="credencial-modal-footer">
              <span><BadgeCheck size={15} /> Datos verificados por el administrador</span>
              <div>
                <button type="submit" className="btn-azul credencial-submit" disabled={guardandoCred}><Save size={16} /> {guardandoCred ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN USUARIO */}
    {usuarioAEliminar && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 11000, backdropFilter: 'blur(3px)' }}>
        <div className="grafico-card" style={{ width: '95%', maxWidth: '500px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '30px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}><IconoAlerta width="24" height="24" /> Confirmar Eliminación Permanente</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5', marginBottom: '20px' }}>Estás a punto de eliminar al usuario <strong>{usuarioAEliminar.nombre}</strong> ({usuarioAEliminar.email}). Esto borrará permanentemente su cuenta, archivos, historial de cálculos e inscripciones. Esta acción no se puede deshacer.</p>
          <form onSubmit={handleEliminarUsuario} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>Escribe el nombre del usuario para confirmar (<strong>{usuarioAEliminar.nombre}</strong>):</label>
              <input type="text" value={confirmarNombre} onChange={(e) => setConfirmarNombre(e.target.value)} placeholder="Escribe el nombre exacto" required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setUsuarioAEliminar(null); setConfirmarNombre(''); }} className="btn-amarillo">Cancelar</button>
              <button type="submit" className="btn-rojo">Confirmar Borrado</button>
            </div>
          </form>
        </div>
      </div>
    )}

    </>
  );
}
