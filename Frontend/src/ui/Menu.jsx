  import { useState, useEffect, useRef } from "react";
  import { NavLink, useNavigate, useLocation } from "react-router-dom";
  import OscuroClaro from "./oscuro_claro.jsx";
  import escudoAdmin from "../assets/images/Logo-Adm.png";
  import '../styles/ui/Menu.css';
  import { alerta } from "../utils/Notificaciones";
  import { api } from "../services/api";
  import { IconoCandado } from "./iconos";

  export default function Menu({ usuario, setUsuario }) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    // Nuevo estado para controlar cuándo se abre el submenú (útil para móviles)
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [gruposDropdownOpen, setGruposDropdownOpen] = useState(false);
    const [menuAbierto, setMenuAbierto] = useState(false);
    const perfilRef = useRef(null);

    // --- ESTADOS PARA SISTEMA DE NOTIFICACIONES ---
    const [notificaciones, setNotificaciones] = useState([]);
    const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
    const notifRef = useRef(null);

    // Refs para cerrar el menú móvil (hamburguesa)
    const mobileMenuRef = useRef(null);
    const hamburgerRef = useRef(null);

    const cargarNotificaciones = async () => {
      try {
        const data = await api.obtenerNotificaciones();
        setNotificaciones(data);
      } catch (error) {
        console.error("Error al cargar notificaciones:", error);
      }
    };

    useEffect(() => {
      if (usuario) {
        cargarNotificaciones();
        const interval = setInterval(cargarNotificaciones, 30000);
        return () => clearInterval(interval);
      } else {
        setNotificaciones([]);
      }
    }, [usuario]);

    const handleMarcarLeida = async (id, e) => {
      e.stopPropagation(); // Evitar que el dropdown se cierre
      try {
        await api.marcarNotificacionLeida(id);
        setNotificaciones(prev =>
          prev.map(n => n.id === id ? { ...n, leido: true } : n)
        );
      } catch (error) {
        console.error("Error al marcar como leída:", error);
      }
    };

    const handleMarcarTodasLeidas = async (e) => {
      e.stopPropagation(); // Evitar que el dropdown se cierre
      try {
        await api.marcarTodasLeidas();
        setNotificaciones(prev =>
          prev.map(n => ({ ...n, leido: true }))
        );
        alerta.exito("Leídas", "Todas las notificaciones marcadas como leídas");
      } catch (error) {
        console.error("Error al marcar todas como leídas:", error);
      }
    };

    const noLeidasCount = notificaciones.filter(n => !n.leido).length;

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (perfilRef.current && !perfilRef.current.contains(event.target)) {
          setMenuAbierto(false);
        }
        if (notifRef.current && !notifRef.current.contains(event.target)) {
          setNotifDropdownOpen(false);
        }
        if (navLinksRef.current && !navLinksRef.current.contains(event.target)) {
          setDropdownOpen(false);
          setGruposDropdownOpen(false);
        }
        if (
          mobileMenuRef.current &&
          !mobileMenuRef.current.contains(event.target) &&
          hamburgerRef.current &&
          !hamburgerRef.current.contains(event.target)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const closeMenu = () => {
      setIsOpen(false);
      setDropdownOpen(false); // Cerramos también el submenú
      setGruposDropdownOpen(false);
    };

    const location = useLocation();
    const navLinksRef = useRef(null);
    const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0, opacity: 0 });

    // Detectamos si estamos en alguna de las páginas de la calculadora
    const isCalculadoraActive = location.pathname === '/calculadora' || location.pathname === '/MAT251';
    const isGruposActive = location.pathname === '/grupos' || location.pathname === '/gestion-docente' || location.pathname === '/reportes-docente';

    useEffect(() => {
      const updateUnderline = () => {
        // Buscar el NavLink que coincida con la ruta actual o los spans activos
        const activeLinks = Array.from(navLinksRef.current?.querySelectorAll('a.active, span.active, a[aria-current="page"]') || []);
        // Seleccionamos el último (para evitar que atrape '/' si no tiene 'end')
        let activeLink = activeLinks[activeLinks.length - 1];

        if (activeLink) {
          let leftPos = activeLink.offsetLeft;
          let width = activeLink.offsetWidth;

          // Corregimos la posición si es parte del menú desplegable
          const dropdownParent = activeLink.closest('.dropdown-container');
          if (dropdownParent) {
            leftPos = dropdownParent.offsetLeft;
            const span = dropdownParent.querySelector('span');
            width = span ? span.offsetWidth : dropdownParent.offsetWidth;
          }

          setUnderlineStyle({
            left: leftPos,
            width: width,
            opacity: 1
          });
        } else {
          setUnderlineStyle(prev => ({ ...prev, opacity: 0 }));
        }
      };

      updateUnderline();
      window.addEventListener("resize", updateUnderline);
      const timer = setTimeout(updateUnderline, 100);

      return () => {
        window.removeEventListener("resize", updateUnderline);
        clearTimeout(timer);
      };
    }, [location.pathname]);

    return (
      <nav className="main-navbar">

        <div className="nav-brand">
          <img src={escudoAdmin} alt="Escudo Administración" className="nav-logo" />
        </div>

        <div className={`nav-menu ${isOpen ? "active" : ""}`} ref={mobileMenuRef}>
          <ul className="nav-links" ref={navLinksRef}>
            <li>
              <NavLink to="/" end onClick={closeMenu} className="nav-link-item">
                <svg className="nav-item-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>Inicio</span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/archivos" onClick={closeMenu} className="nav-link-item">
                <svg className="nav-item-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <span>Archivos</span>
              </NavLink>
            </li>

            {/* EL CONTENEDOR DESPLEGABLE CALCULADORA */}
            <li
              className="nav-item dropdown-container"
              onClick={() => {
                setDropdownOpen(!dropdownOpen);
                if (!dropdownOpen) setGruposDropdownOpen(false);
              }}
            >
              <span className={`nav-link-dropdown ${isCalculadoraActive ? 'active' : ''}`}>
                <svg className="nav-item-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
                  <line x1="8" y1="6" x2="16" y2="6" />
                  <line x1="16" y1="14" x2="16" y2="18" />
                  <path d="M16 10h.01" />
                  <path d="M12 10h.01" />
                  <path d="M8 10h.01" />
                  <path d="M12 14h.01" />
                  <path d="M8 14h.01" />
                  <path d="M12 18h.01" />
                  <path d="M8 18h.01" />
                </svg>
                <span>Calculadora</span>
                <svg
                  className={`chevron-icon ${dropdownOpen ? 'open' : ''}`}
                  width="15" height="15" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="3"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </span>

              <ul className={`dropdown-menu ${dropdownOpen ? 'show' : ''}`}>
                <li className="dropdown-li" style={{ transitionDelay: '0.05s' }}>
                  <NavLink to="/calculadora" onClick={() => { sessionStorage.removeItem("tarea_contexto_calculadora"); closeMenu(); }} className="dropdown-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'text-bottom' }}>
                      <line x1="18" y1="20" x2="18" y2="10" />
                      <line x1="12" y1="20" x2="12" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    Estadística General
                  </NavLink>
                </li>
                <li className="dropdown-li" style={{ transitionDelay: '0.1s' }}>
                  <NavLink to="/MAT251" onClick={closeMenu} className="dropdown-item">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'text-bottom' }}>
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12h8" />
                      <path d="M12 8v8" />
                    </svg>
                    Estadística Matemática
                  </NavLink>
                </li>
              </ul>
            </li>

            <li>
              <NavLink to="/historial" onClick={closeMenu} className="nav-link-item">
                <svg className="nav-item-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Historial</span>
              </NavLink>
            </li>

            {usuario && (usuario.rol === "Docente" || usuario.rol === "Administrador") ? (
              <li
                className="nav-item dropdown-container"
                onClick={() => {
                  setGruposDropdownOpen(!gruposDropdownOpen);
                  if (!gruposDropdownOpen) setDropdownOpen(false);
                }}
              >
                <span className={`nav-link-dropdown ${isGruposActive ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
                  <svg className="nav-item-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>Grupos</span>
                  <svg
                    className={`chevron-icon ${gruposDropdownOpen ? 'open' : ''}`}
                    width="15" height="15" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="3"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>

                <ul className={`dropdown-menu ${gruposDropdownOpen ? 'show' : ''}`}>
                  <li className="dropdown-li" style={{ transitionDelay: '0.05s' }}>
                    <NavLink to="/grupos" onClick={closeMenu} className="dropdown-item">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'text-bottom' }}>
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                      Gestión Grupos
                    </NavLink>
                  </li>
                  <li className="dropdown-li" style={{ transitionDelay: '0.1s' }}>
                    <NavLink to="/gestion-docente" onClick={closeMenu} className="dropdown-item">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'text-bottom' }}>
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <polyline points="16 11 18 13 22 9" />
                      </svg>
                      Gestión Alumnos
                    </NavLink>
                  </li>
                </ul>
              </li>
            ) : (
              <li>
                <NavLink to="/grupos" onClick={closeMenu} className="nav-link-item">
                  <svg className="nav-item-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>Grupos</span>
                </NavLink>
              </li>
            )}

            <li>
              <NavLink to="/tareas" onClick={closeMenu} className="nav-link-item">
                <svg className="nav-item-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                <span>Tareas</span>
              </NavLink>
            </li>

            {usuario && (usuario.rol === "Docente" || usuario.rol === "Administrador") && (
              <li>
                <NavLink to="/reportes-docente" onClick={closeMenu} className="nav-link-item">
                  <svg className="nav-item-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                    <path d="M3 20h18" />
                  </svg>
                  <span>Estadísticas</span>
                </NavLink>
              </li>
            )}

            {usuario && usuario.rol === "Administrador" && (
              <li>
                <NavLink to="/admin" onClick={closeMenu} className="nav-link-item">
                  <svg className="nav-item-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <span>Admin</span>
                </NavLink>
              </li>
            )}

            <span className="nav-underline" style={underlineStyle} />
          </ul>

          <div className="nav-menu-mobile-extra mobile-only">
            <OscuroClaro />
          </div>
        </div>

        <div className="menu-derecha">
          <div className="nav-theme desktop-only">
            <OscuroClaro />
          </div>

          {usuario && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

              {/* CAMPANA DE NOTIFICACIONES */}
              <div className="notificaciones-container" ref={notifRef}>
                <button
                  className="bell-btn"
                  onClick={() => {
                    setNotifDropdownOpen(!notifDropdownOpen);
                    if (!notifDropdownOpen) {
                      setIsOpen(false);
                      setMenuAbierto(false);
                    }
                  }}
                  title="Notificaciones"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {noLeidasCount > 0 && (
                    <span className="notif-badge">{noLeidasCount}</span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="notif-dropdown">
                    <div className="notif-header">
                      <h4 className="notif-title">Notificaciones</h4>
                      {notificaciones.length > 0 && (
                        <button className="notif-clear-btn" onClick={handleMarcarTodasLeidas}>
                          Marcar todo como leído
                        </button>
                      )}
                    </div>
                    <ul className="notif-list">
                      {notificaciones.length === 0 ? (
                        <div className="notif-empty">No tienes notificaciones</div>
                      ) : (
                        notificaciones.map(n => (
                          <li
                            key={n.id}
                            className={`notif-item ${!n.leido ? 'unread' : ''}`}
                            onClick={(e) => {
                              if (!n.leido) handleMarcarLeida(n.id, e);
                              if (n.tipo === 'tarea' || (n.mensaje && n.mensaje.toLowerCase().includes('tarea'))) {
                                setNotifDropdownOpen(false);
                                navigate('/tareas');
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <span className="notif-item-msg">{n.mensaje}</span>
                            <div className="notif-item-meta">
                              <span 
                                className={`notif-badge-type ${n.tipo === 'sistema' ? 'sistema' : n.tipo === 'tarea' ? 'tarea' : 'personal'}`}
                                style={n.tipo === 'tarea' ? { background: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary-color)', border: '1px solid rgba(59, 130, 246, 0.3)' } : {}}
                              >
                                {n.tipo === 'sistema' ? 'Sistema' : n.tipo === 'tarea' ? 'Tarea' : 'Personal'}
                              </span>
                              <span>{n.fecha_creacion ? n.fecha_creacion.split(' ')[0] : ''}</span>
                            </div>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* PERFIL USUARIO */}
              <div className="relative" ref={perfilRef}>
                <div
                  className="perfil-usuario-menu"
                  title={`${usuario.nombre} - ${usuario.rol}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuAbierto(!menuAbierto);
                    if (!menuAbierto) {
                      setIsOpen(false);
                      setNotifDropdownOpen(false);
                    }
                  }}
                >
                  <div className="avatar-naranja">
                    {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : '👤'}
                  </div>
                  <span className="user-name-text">
                    {usuario.nombre?.split(' ')[0] || 'Usuario'}
                  </span>
                </div>

                {/* Submenú desplegable al hacer clic */}
                {menuAbierto && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-50">
                    <div
                      onClick={() => {
                        navigate('/perfil');
                        closeMenu();
                        setMenuAbierto(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      style={{ transition: 'background-color 0.2s', color: 'var(--text-main)' }}
                    >
                      Mi Perfil
                    </div>

                    {usuario.rol === "Administrador" && (
                      <div
                        onClick={() => {
                          navigate('/admin');
                          closeMenu();
                          setMenuAbierto(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        style={{ transition: 'background-color 0.2s', color: 'var(--text-main)', fontWeight: 'bold' }}
                      >
                        Panel de Admin
                      </div>
                    )}

                    <div
                      onClick={() => {
                        localStorage.removeItem("token");
                        setUsuario(null);
                        navigate('/login');
                        closeMenu();
                        setMenuAbierto(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold cursor-pointer"
                      style={{ transition: 'background-color 0.2s' }}
                    >
                      Cerrar sesión
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        <button
          ref={hamburgerRef}
          className={`hamburger-menu ${isOpen ? "open" : ""}`}
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setMenuAbierto(false);
              setNotifDropdownOpen(false);
            }
          }}
          aria-label="Abrir menú"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>
      </nav>
    );
  }