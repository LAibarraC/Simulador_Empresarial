import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import OscuroClaro from "./oscuro_claro";
import escudoAdmin from "../../assets/images/simuledu_logo.png";

export default function Menu({ usuario }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeMenu = () => setIsOpen(false);
  const navigate = useNavigate();
  const location = useLocation();
  const navLinksRef = useRef(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const updateUnderline = () => {
      const activeLink = navLinksRef.current?.querySelector('a.active');
      if (activeLink) {
        setUnderlineStyle({
          left: activeLink.offsetLeft,
          width: activeLink.offsetWidth,
          opacity: 1
        });
      } else {
        setUnderlineStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    // Actualiza inmediatamente
    updateUnderline();

    // Actualiza cuando la ventana cambia de tamaño
    window.addEventListener("resize", updateUnderline);

    // Un pequeño retraso para asegurar que las fuentes y layouts terminen de cargar
    const timer = setTimeout(updateUnderline, 100);

    return () => {
      window.removeEventListener("resize", updateUnderline);
      clearTimeout(timer);
    };
  }, [location.pathname]);

  return (
    <nav className="main-navbar">
      
      {/* 1. ZONA DEL LOGO */}
      <div className="nav-brand">
       <img src={escudoAdmin} alt="Escudo Administración" className="nav-logo" />
      </div>

      {/* 2. CONTENEDOR DESPLEGABLE - Se posiciona absoluto en móvil */}
      <div className={`nav-menu ${isOpen ? "active" : ""}`}>
        <ul className="nav-links" ref={navLinksRef}>
          <li><NavLink to="/" onClick={closeMenu}>Inicio</NavLink></li>
          <li><NavLink to="/archivos" onClick={closeMenu}>Archivos</NavLink></li>
          <li><NavLink to="/calculadora" onClick={closeMenu}>Estadística General</NavLink></li>
          <li><NavLink to="/MAT251" onClick={closeMenu}>Estadística Matemática</NavLink></li>
          <li><NavLink to="/historial" onClick={closeMenu}>Historial</NavLink></li>
          <li><NavLink to="/grupos" onClick={closeMenu}>Grupos</NavLink></li>
         {/*  <li><NavLink to="/about" onClick={closeMenu}>Sobre la App</NavLink></li> */}
         
         {/* Línea deslizante inteligente */}
         <span className="nav-underline" style={underlineStyle} />
        </ul>

        {/* MÓVIL: El tema se queda aquí dentro para ganar espacio arriba */}
        <div className="nav-menu-mobile-extra mobile-only">
          <OscuroClaro />
        </div>
      </div>

      {/* 3. ZONA DERECHA: Siempre visible (Usuario) + Tema solo en Desktop */}
      <div className="menu-derecha">
        <div className="nav-theme desktop-only">
          <OscuroClaro />
        </div>

        {usuario && (
          <div 
            className="perfil-usuario-menu" 
            title={`${usuario.nombre} - ${usuario.rol}`}
            onClick={() => {
              navigate('/perfil');
              closeMenu();
            }}
          >
            <div className="avatar-naranja">
              {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : '👤'}
            </div>
            <span className="user-name-text">
              {usuario.nombre?.split(' ')[0] || 'Usuario'}
            </span>
          </div>
        )}
      </div>

      {/* 4. BOTÓN DE HAMBURGUESA */}
      <button 
        className={`hamburger-menu ${isOpen ? "open" : ""}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menú"
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>
    </nav>
  );
}