import React, { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../../../services/api';
import { alerta } from '../../../utils/Notificaciones';
import Modal from '../../../utils/Modal'; 
import { IconoBuscar } from '../../../ui/iconos';

// Importaciones para el tour interactivo
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// --- ICONOS SVG ---
const IconoAjustes = ({ width = 14, height = 14, style = {} }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
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

const IconoConfig = ({ width = 18, height = 18, style = {} }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const IconoTrash = ({ width = 16, height = 16, style = {} }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

// --- COMPONENTE SELECTOR DE MATERIAS (REGLAS_MAT251) ---
function CustomSelectMateria({ value, onChange, options = [], placeholder = 'Todas las materias' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  return (
    <div ref={dropdownRef} style={{ position: 'relative', minWidth: '200px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          minHeight: '36px',
          boxSizing: 'border-box',
          background: 'var(--bg-card)',
          border: `1px solid ${isOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
          borderRadius: '5px',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : '0 1px 2px rgba(0,0,0,0.04)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          color: 'var(--text-main)',
          userSelect: 'none',
          fontSize: '0.85rem',
          fontWeight: 600
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '8px' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: 'var(--text-muted)',
            flexShrink: 0
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '5px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            zIndex: 1000,
            maxHeight: '260px',
            overflowY: 'auto',
            animation: 'fadeInDropdown 0.2s ease',
            padding: '4px',
            boxSizing: 'border-box'
          }}
        >
          {options.map((opt) => {
            const isSelected = String(value) === String(opt.value);
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'var(--bg-input, rgba(0,0,0,0.04))';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
                style={{
                  padding: '9px 12px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  borderRadius: '4px',
                  background: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  color: isSelected ? 'var(--primary-color)' : 'var(--text-main)',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'background 0.15s ease, color 0.15s ease',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function GestionDocente({ usuario }) {
  const [clases, setClases] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  // Estados para el Modal de Gestión de un estudiante
  const [modalGestionEstudiante, setModalGestionEstudiante] = useState(null);

  // Estados para el Modal de confirmación (Eliminación)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [estudianteAEliminar, setEstudianteAEliminar] = useState(null);

  // --- ESTADOS PARA BÚSQUEDA, FILTROS Y PAGINACIÓN ---
  const [searchTerm, setSearchTerm] = useState("");
  const [menuFiltroAbierto, setMenuFiltroAbierto] = useState(null); 
  const [filtroMateria, setFiltroMateria] = useState('TODAS');
  const [filtroCurso, setFiltroCurso] = useState('TODOS');
  const [ordenFecha, setOrdenFecha] = useState('ninguno'); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 
  const menuRef = useRef(null);

  // Cerrar menús de filtro al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuFiltroAbierto && menuRef.current && !menuRef.current.contains(e.target)) {
        const isFilterButton = e.target.closest('button[title^="Filtrar"], button[title^="Ordenar"]');
        if (!isFilterButton) {
          setMenuFiltroAbierto(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuFiltroAbierto]);

  // Mantener actualizado el modal de gestión si los datos cambian
  useEffect(() => {
    if (modalGestionEstudiante) {
      const estudianteActualizado = estudiantes.find(e => e.id === modalGestionEstudiante.id);
      if (estudianteActualizado) {
        setModalGestionEstudiante(estudianteActualizado);
      } else {
        setModalGestionEstudiante(null);
      }
    }
  }, [estudiantes]);

  // --- FUNCIÓN DEL TOUR INTERACTIVO ---
  const iniciarTour = () => {
    const tourSteps = [
      {
        element: '#tour-gestion-buscador',
        popover: {
          title: 'Gestión y Búsqueda de Alumnos',
          description: 'Escribe aquí el nombre o correo del alumno para encontrarlo instantáneamente en cualquiera de tus cursos.',
          side: "bottom",
          align: 'start'
        }
      }
    ];

    if (document.querySelector('#tour-gestion-tabla')) {
      tourSteps.push({
        element: '#tour-gestion-tabla',
        popover: {
          title: 'Registro de Estudiantes',
          description: 'Muestra los datos de los alumnos agrupados. Usa el icono de engranaje (⚙️) para gestionar los grupos o desmatricular.',
          side: "top",
          align: 'start'
        }
      });
    }

    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      progressText: '{{current}} de {{total}}',
      steps: tourSteps
    });
    driverObj.drive();
  };

  useEffect(() => {
    if (usuario?.email) {
      cargarDatosCompletos();
    }
  }, [usuario]);

  const cargarDatosCompletos = async () => {
    try {
      setCargandoDatos(true);
      const clasesData = await api.obtenerClasesDocente();
      const clasesConModulo = (clasesData || []).map(c => ({
        ...c,
        modulo: c.modulo || (c.nombre?.toUpperCase().includes('MAT251') ? 'MAT251' : c.nombre?.toUpperCase().includes('MAT151') ? 'MAT151' : null)
      }));
      setClases(clasesConModulo);

      let mapaEstudiantes = new Map();
      
      for (const clase of clasesConModulo) {
        const ests = await api.obtenerEstudiantesClase(clase.id, usuario.email);
        
        for (const e of ests) {
          if (!mapaEstudiantes.has(e.id)) {
            mapaEstudiantes.set(e.id, {
              ...e,
              clasesInscritas: []
            });
          }
          
          mapaEstudiantes.get(e.id).clasesInscritas.push({
            claseId: clase.id,
            claseNombre: clase.nombre,
            modulo: clase.modulo,
            fecha_inscripcion: e.fecha_creacion
          });
        }
      }
      
      setEstudiantes(Array.from(mapaEstudiantes.values()));
    } catch (error) {
      alerta.error("Error", error.message || "No se pudieron cargar los datos de los cursos");
    } finally {
      setCargandoDatos(false);
    }
  };

  const handleCambiarCurso = async (estudiante, oldClaseId, nuevaClaseId) => {
    if (estudiante.clasesInscritas.some(c => String(c.claseId) === String(nuevaClaseId))) {
      alerta.error("Acción inválida", "El alumno ya se encuentra inscrito en este curso.");
      return;
    }

    try {
      if (api.cambiarCursoEstudiante) {
        await api.cambiarCursoEstudiante(estudiante.id, oldClaseId, nuevaClaseId, usuario.email);
      } else {
        await api.desmatricularEstudiante(oldClaseId, estudiante.id, usuario.email);
        if (api.matricularEstudiante) {
          await api.matricularEstudiante(nuevaClaseId, estudiante.id, usuario.email);
        }
      }

      alerta.exito("Grupo actualizado", `El alumno ha sido movido al nuevo grupo.`);
      await cargarDatosCompletos();
    } catch (error) {
      alerta.error("Error", error.message || "No se pudo cambiar de curso al estudiante");
    }
  };

  const solicitarEliminacionEstudiante = (estudianteId, estudianteNombre, claseId, claseNombre) => {
    setEstudianteAEliminar({ id: estudianteId, nombre: estudianteNombre, claseId, claseNombre });
    setIsModalOpen(true);
  };

  const confirmarEliminacion = async () => {
    if (!estudianteAEliminar) return;

    try {
      await api.desmatricularEstudiante(estudianteAEliminar.claseId, estudianteAEliminar.id, usuario.email);
      
      alerta.exito("Estudiante removido", `El alumno ha sido removido de ${estudianteAEliminar.claseNombre} correctamente.`);
      
      setEstudiantes(prev => prev.map(e => {
        if (e.id === estudianteAEliminar.id) {
          return {
            ...e,
            clasesInscritas: e.clasesInscritas.filter(c => String(c.claseId) !== String(estudianteAEliminar.claseId))
          };
        }
        return e;
      }).filter(e => e.clasesInscritas.length > 0)); 
      
    } catch (error) {
      alerta.error("Error", error.message || "No se pudo desmatricular al estudiante");
    } finally {
      setIsModalOpen(false);
      setEstudianteAEliminar(null); 
    }
  };

  const cancelarEliminacion = () => {
    setIsModalOpen(false);
    setEstudianteAEliminar(null);
  };

  // Materias únicas disponibles
  const modulosDisponibles = useMemo(() => {
    const mods = new Set();
    clases.forEach(c => {
      if (c.modulo) mods.add(c.modulo);
    });
    return Array.from(mods).sort();
  }, [clases]);

  // Clases filtradas por materia seleccionada
  const clasesFiltradasPorMateria = useMemo(() => {
    if (filtroMateria === 'TODAS') return clases;
    return clases.filter(c => c.modulo === filtroMateria);
  }, [clases, filtroMateria]);

  // --- LÓGICA DE FILTRADO Y BÚSQUEDA ---
  const getDateVal = (clasesArr) => {
    if (!clasesArr || clasesArr.length === 0) return 0;
    return Math.max(...clasesArr.map(c => new Date(c.fecha_inscripcion || 0).getTime()));
  };

  const filteredEstudiantes = estudiantes
    .filter((est) => {
      const matchGlobal = 
        est.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        est.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchMateria = filtroMateria === 'TODAS' || est.clasesInscritas.some(c => c.modulo === filtroMateria);

      const matchCurso = filtroCurso === 'TODOS' || est.clasesInscritas.some(c => String(c.claseId) === String(filtroCurso));
      
      return matchGlobal && matchMateria && matchCurso;
    })
    .sort((a, b) => {
      if (ordenFecha === 'asc') return getDateVal(a.clasesInscritas) - getDateVal(b.clasesInscritas);
      if (ordenFecha === 'desc') return getDateVal(b.clasesInscritas) - getDateVal(a.clasesInscritas);
      return 0;
    });

  const totalPages = Math.ceil(filteredEstudiantes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentEstudiantes = filteredEstudiantes.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [filteredEstudiantes.length, currentPage, totalPages]);

  const toggleMenu = (columna) => {
    setMenuFiltroAbierto(prev => (prev === columna ? null : columna));
  };

  const getPopoverStyle = (columna) => ({
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: columna === 'registro' ? 'auto' : 0,
    right: columna === 'registro' ? 0 : 'auto',
    backgroundColor: 'var(--bg-card, #fff)',
    border: '1px solid var(--border-color, #e5e7eb)',
    borderRadius: '8px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
    padding: '6px',
    zIndex: 1000,
    minWidth: '160px',
    textTransform: 'none',
    fontWeight: 'normal',
    color: 'var(--text-main, #1f2937)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  });

  const btnAjustesStyle = (activo) => ({
    background: activo ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'inline-flex',
    alignItems: 'center',
    color: activo ? '#3b82f6' : 'var(--text-muted, #6b7280)',
    transition: 'all 0.2s'
  });

  const btnOpcionStyle = (isSelected) => ({
    display: 'block',
    width: '100%',
    textAlign: 'left',
    padding: '8px 12px',
    background: isSelected ? 'var(--bg-input, #f3f4f6)' : 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: isSelected ? '#3b82f6' : 'var(--text-main, #333)',
    fontWeight: isSelected ? 'bold' : 'normal',
    fontSize: '0.85rem',
    borderRadius: '4px',
    transition: 'background 0.2s'
  });

  const ControlesPaginacion = () => {
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
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
            fontSize: "0.85rem",
            transition: "all 0.2s"
          }}
        >
          Anterior
        </button>
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted, #6b7280)", fontWeight: "bold" }}>
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
            fontSize: "0.85rem",
            transition: "all 0.2s"
          }}
        >
          Siguiente
        </button>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', maxWidth: '100%', padding: '15px', boxSizing: 'border-box', position: 'relative' }}>
      <style>{`
        .input-busqueda-gestion::placeholder {
          font-size: 0.82rem !important;
          opacity: 0.7;
        }
      `}</style>
      
      {/* Botón de Guía Rápida Flotante */}
      <button
        onClick={iniciarTour}
        className="guia-rapida-flotante"
        style={{
          bottom: '20px',
          zIndex: 10000
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span className="guia-rapida-flotante-texto">Guía Rápida</span>
      </button>

      {/* BARRA DE BÚSQUEDA Y SELECTOR DE MATERIAS COMPACTA */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
        {/* BUSCADOR COMPACTO */}
        <div id="tour-gestion-buscador" style={{ flex: '1 1 280px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-card)',
            padding: '6px 12px',
            minHeight: '36px',
            borderRadius: '5px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            boxSizing: 'border-box'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
              <IconoBuscar width="15" height="15" />
            </span>
            <input
              type="text"
              placeholder="Buscar estudiante por nombre o correo..."
              value={searchTerm}
              onChange={handleSearch}
              className="input-busqueda-gestion"
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                color: 'var(--text-main)',
                width: '100%',
                fontSize: '0.85rem',
                padding: 0
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.8rem'
                }}
                title="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* SELECTOR DE MATERIA (Solo si el docente tiene más de 1 materia/módulo) */}
        {modulosDisponibles.length > 1 && (
          <div style={{ flex: '0 0 auto', minWidth: '200px' }}>
            <CustomSelectMateria
              value={filtroMateria}
              onChange={(val) => {
                setFiltroMateria(val);
                setFiltroCurso('TODOS');
                setCurrentPage(1);
              }}
              options={[
                { value: 'TODAS', label: 'Todas las materias' },
                ...modulosDisponibles.map(m => ({ value: m, label: m }))
              ]}
              placeholder="Todas las materias"
            />
          </div>
        )}
      </div>

      {/* CONTENIDO PRINCIPAL DE TABLA */}
      {cargandoDatos ? (
        <div className="historial-container" style={{ marginTop: '0px', textAlign: 'center', padding: '40px 0', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Cargando información de estudiantes y cursos...</p>
        </div>
      ) : (
        <div className="historial-container" id="tour-gestion-tabla" style={{ marginTop: '0px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', overflow: menuFiltroAbierto ? 'visible' : 'hidden' }}>
          <div style={{ overflowX: menuFiltroAbierto ? 'visible' : 'auto' }}>
            <table className="historial-tabla tabla-responsive tabla-responsiva-panel" style={{ width: '100%', borderCollapse: 'collapse', borderSpacing: 0, textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '15px', fontWeight: '600' }}>Nombre del Estudiante</th>
                  <th style={{ padding: '15px', fontWeight: '600' }}>Correo Electrónico</th>
                  <th style={{ padding: '15px', fontWeight: '600', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Grupos</span>
                      <button style={btnAjustesStyle(filtroCurso !== 'TODOS')} onClick={() => toggleMenu('curso')} title="Filtrar por grupo">
                        <IconoAjustes />
                      </button>
                    </div>
                    {menuFiltroAbierto === 'curso' && (
                      <div ref={menuRef} style={getPopoverStyle('curso')}>
                        <button onClick={() => { setFiltroCurso('TODOS'); setCurrentPage(1); setMenuFiltroAbierto(null); }} style={btnOpcionStyle(filtroCurso === 'TODOS')} onMouseEnter={(e) => { if (filtroCurso !== 'TODOS') e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'; }} onMouseLeave={(e) => { if (filtroCurso !== 'TODOS') e.currentTarget.style.backgroundColor = 'transparent'; }}>
                          Todos los grupos
                        </button>
                        {clasesFiltradasPorMateria.map(c => (
                          <button key={c.id} onClick={() => { setFiltroCurso(c.id); setCurrentPage(1); setMenuFiltroAbierto(null); }} style={btnOpcionStyle(String(filtroCurso) === String(c.id))} onMouseEnter={(e) => { if (String(filtroCurso) !== String(c.id)) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'; }} onMouseLeave={(e) => { if (String(filtroCurso) !== String(c.id)) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                            {c.nombre} {filtroMateria === 'TODAS' && c.modulo ? `(${c.modulo})` : ''}
                          </button>
                        ))}
                      </div>
                    )}
                  </th>
                  <th style={{ padding: '15px', fontWeight: '600', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Último Registro</span>
                      <button style={btnAjustesStyle(ordenFecha !== 'ninguno')} onClick={() => toggleMenu('registro')} title="Ordenar por fecha">
                        <IconoAjustes />
                      </button>
                    </div>
                    {menuFiltroAbierto === 'registro' && (
                      <div ref={menuRef} style={getPopoverStyle('registro')}>
                        {[ 
                          { label: 'Sin orden', value: 'ninguno' },
                          { label: 'Más recientes primero', value: 'desc' },
                          { label: 'Más antiguos primero', value: 'asc' }
                        ].map(opcion => (
                          <button key={opcion.value} onClick={() => { setOrdenFecha(opcion.value); setCurrentPage(1); setMenuFiltroAbierto(null); }} style={btnOpcionStyle(ordenFecha === opcion.value)} onMouseEnter={(e) => { if (ordenFecha !== opcion.value) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'; }} onMouseLeave={(e) => { if (ordenFecha !== opcion.value) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                            {opcion.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </th>
                  <th style={{ padding: '15px', fontWeight: '600', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEstudiantes.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                      No se encontraron estudiantes que coincidan con los filtros actuales.
                    </td>
                  </tr>
                ) : (
                  currentEstudiantes.map((est, index) => (
                    <tr 
                      key={est.id} 
                      className="historial-fila"
                      style={{ 
                        borderBottom: '1px solid var(--border-color)', 
                        backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.01)'}
                    >
                      <td data-label="Nombre del Estudiante" style={{ padding: '15px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                        {est.nombre}
                      </td>
                      <td data-label="Correo Electrónico" style={{ padding: '15px', color: 'var(--text-main)' }}>
                        {est.email}
                      </td>
                      <td data-label="Grupos" style={{ padding: '15px' }}>
                        <span 
                          title={est.clasesInscritas.map(c => `${c.claseNombre}${c.modulo ? ` (${c.modulo})` : ''}`).join(', ')}
                          style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'default' }}
                        >
                          {est.clasesInscritas.length} grupo{est.clasesInscritas.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td data-label="Último Registro" style={{ padding: '15px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {new Date(getDateVal(est.clasesInscritas)).toLocaleDateString()}
                      </td>
                      <td data-label="Acciones" style={{ padding: '15px', textAlign: 'center' }}>
                        <button
                          onClick={() => setModalGestionEstudiante(est)}
                          title="Gestionar grupos"
                          className="btn-azul"
                          style={{
                            padding: '8px',
                            borderRadius: '50%',
                            minWidth: '34px',
                            minHeight: '34px'
                          }}
                        >
                          <IconoConfig />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <ControlesPaginacion />

      {/* MODAL DE GESTIÓN DE GRUPOS DEL ESTUDIANTE (ESTILO TABLA LIMPIA) */}
      {modalGestionEstudiante && (
        <Modal 
          isOpen={true} 
          onClose={() => setModalGestionEstudiante(null)} 
          title={`Grupos de ${modalGestionEstudiante.nombre}`}
        >
          <div> 
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card, #fff)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: 'var(--bg-input, #f9fafb)', borderBottom: '1px solid var(--border-color)' }}>
                  <tr>
                    <th style={{ padding: '12px 15px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Grupo Actual</th>
                    <th style={{ padding: '12px 15px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Reasignar a...</th>
                    <th style={{ padding: '12px 15px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {modalGestionEstudiante.clasesInscritas.map((ci, idx) => (
                    <tr 
                      key={ci.claseId} 
                      style={{ 
                        borderBottom: idx === modalGestionEstudiante.clasesInscritas.length - 1 ? 'none' : '1px solid var(--border-color)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Columna: Grupo actual e información */}
                      <td style={{ padding: '12px 15px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                            {ci.claseNombre}
                          </span>
                          {ci.modulo && (
                            <span style={{ fontSize: '0.7rem', padding: '2px 7px', borderRadius: '4px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontWeight: 'bold' }}>
                              {ci.modulo}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Inscrito el: {ci.fecha_inscripcion ? ci.fecha_inscripcion.split(' ')[0] : 'N/A'}
                        </div>
                      </td>

                      {/* Columna: Select para reasignar */}
                      <td style={{ padding: '12px 15px', verticalAlign: 'middle' }}>
                        <select
                          value={ci.claseId}
                          onChange={(e) => handleCambiarCurso(modalGestionEstudiante, ci.claseId, e.target.value)}
                          style={{
                            width: '100%',
                            minWidth: '150px',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-card, #fff)',
                            color: 'var(--text-main)',
                            fontSize: '0.85rem',
                            outline: 'none',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                        >
                          {clases.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                          ))}
                        </select>
                      </td>

                      {/* Columna: Botón de desmatricular */}
                      <td style={{ padding: '12px 15px', verticalAlign: 'middle', textAlign: 'center' }}>
                        <button
                          onClick={() => solicitarEliminacionEstudiante(modalGestionEstudiante.id, modalGestionEstudiante.nombre, ci.claseId, ci.claseNombre)}
                          title="Desmatricular del grupo"
                          className="btn-rojo"
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px'
                          }}
                        >
                          <IconoTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={cancelarEliminacion} 
        title="Confirmar eliminación"
      >
        <p style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: '20px' }}>
          ¿Estás seguro de que deseas eliminar al estudiante <strong>{estudianteAEliminar?.nombre}</strong> del grupo <strong>{estudianteAEliminar?.claseNombre}</strong>?
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={cancelarEliminacion}
            className="btn-amarillo"
            style={{ padding: '8px 16px' }}
          >
            Cancelar
          </button>
          
          <button 
            onClick={confirmarEliminacion}
            className="btn-rojo"
            style={{ padding: '8px 16px' }}
          >
            Sí, desmatricular
          </button>
        </div>
      </Modal>

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