import React, { useEffect, useState, useRef } from "react";
import { useData } from "../../components/gestion_datos/DataContext";
import { api } from "../../services/api";
import {
  obtenerNombreCalculoHistorial,
} from '../MAT251/Historial/historialMAT251';
import { obtenerOrigenHistorial } from "./origenHistorial";
import { alerta } from "../../utils/Notificaciones";
import Skeleton from "../../ui/Skeleton";

import { useNavigate } from "react-router-dom";
import "../../styles/pages/Historial.css";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import escudoAdmin from "../../assets/images/escudoAdmin.png";

import Modal from "../../utils/Modal";

function SelectorModuloHistorial({ id, value, onChange, options, disabled, placeholder }) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef(null);
  const boton = useRef(null);
  const lista = useRef(null);
  const seleccionada = options.find((opcion) => opcion.value === String(value));

  useEffect(() => {
    if (!abierto) return;
    const cerrarFuera = (event) => {
      if (!contenedor.current?.contains(event.target)) setAbierto(false);
    };
    document.addEventListener("pointerdown", cerrarFuera);
    return () => document.removeEventListener("pointerdown", cerrarFuera);
  }, [abierto]);

  useEffect(() => {
    if (disabled) setAbierto(false);
  }, [disabled]);

  useEffect(() => {
    if (abierto) {
      const opciones = lista.current?.querySelectorAll('[role="option"]');
      const indice = options.findIndex((opcion) => opcion.value === String(value));
      opciones?.[Math.max(0, indice)]?.focus();
    }
  }, [abierto]);

  const elegir = (nuevoValor) => {
    onChange(nuevoValor);
    setAbierto(false);
    boton.current?.focus();
  };

  const manejarTeclado = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setAbierto(false);
      boton.current?.focus();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) || disabled) return;
    event.preventDefault();
    if (!abierto) {
      setAbierto(true);
      return;
    }
    const opciones = Array.from(lista.current?.querySelectorAll('[role="option"]') || []);
    const actual = opciones.indexOf(document.activeElement);
    let siguiente = event.key === "ArrowUp" ? actual - 1 : actual + 1;
    if (event.key === "Home") siguiente = 0;
    if (event.key === "End") siguiente = opciones.length - 1;
    opciones[(siguiente + opciones.length) % opciones.length]?.focus();
  };

  return (
    <div ref={contenedor} className="historial-select-container" onKeyDown={manejarTeclado}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setAbierto(false);
      }}>
      <button ref={boton} id={id} type="button" disabled={disabled}
        className={`btn-historial-select-header ${abierto ? "open" : ""}`}
        aria-haspopup="listbox" aria-expanded={abierto} aria-controls={`${id}-opciones`}
        onClick={() => setAbierto(!abierto)}>
        <span className="historial-select-text">{seleccionada?.label || placeholder}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`historial-select-chevron ${abierto ? "open" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {abierto && !disabled && (
        <div ref={lista} id={`${id}-opciones`} role="listbox" aria-labelledby={id}
          className="historial-select-dropdown">
          {options.map((opcion) => (
            <button key={opcion.value} type="button" role="option" tabIndex={-1}
              aria-selected={opcion.value === String(value)}
              className={`btn-historial-select-option ${opcion.value === String(value) ? "selected" : ""}`}
              onClick={() => elegir(opcion.value)}>
              {opcion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const obtenerModuloHistorial = (registro) => {
  let snapshot = registro.snapshot || registro.resultados_json || {};
  if (typeof snapshot === "string") {
    try { snapshot = JSON.parse(snapshot); } catch { snapshot = {}; }
  }
  // Antes de incluir el módulo explícito, solo MAT151 guardaba historial.
  return String(registro.modulo || snapshot?.modulo || snapshot?.configuracion?.modulo || "MAT151").toUpperCase();
};

export default function Historial() {
  const { usuario } = useData();
  const navigate = useNavigate();

  // Estados para el historial
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados para el Modal de confirmación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registroAEliminar, setRegistroAEliminar] = useState(null);

  // --- ESTADOS PARA BÚSQUEDA Y PAGINACIÓN ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroModulo, setFiltroModulo] = useState("TODOS");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 10 registros por página

  const iniciarTour = () => {
    const tourSteps = [
      {
        element: '#tour-historial-tabla',
        popover: {
          title: 'Historial de Cálculos',
          description: 'Aquí verás la fecha, hora, tipo de cálculo, módulo, archivo fuente y modo de cada registro guardado.',
          side: "top",
          align: 'start'
        }
      }
    ];

    if (document.querySelector('.tour-tipo-calculo')) {
      tourSteps.push({
        element: '.tour-tipo-calculo',
        popover: {
          title: 'Operación Realizada',
          description: 'Indica el tema estadístico del análisis guardado (como Regresión Simple, Distribución de Frecuencias, etc.).',
          side: "right",
          align: 'center'
        }
      });
    }

    if (document.querySelector('.tour-archivo-origen')) {
      tourSteps.push({
        element: '.tour-archivo-origen',
        popover: {
          title: 'Base de Datos de Origen',
          description: 'Muestra el nombre del archivo utilizado. Si el cálculo no utilizó un archivo o no se conservó su nombre, indica «Sin archivo».',
          side: "right",
          align: 'center'
        }
      });
    }

    if (document.querySelector('.tour-modo-historial')) {
      tourSteps.push({
        element: '.tour-modo-historial',
        popover: {
          title: 'Modo del Cálculo',
          description: 'En MAT251 muestra el modo guardado, como Análisis de Matriz, Manual o Experimentos. Para MAT151 indica «No aplica».',
          side: "right",
          align: 'center'
        }
      });
    }
    if (document.querySelector('.tour-btn-reabrir')) {
      tourSteps.push({
        element: '.tour-btn-reabrir',
        popover: {
          title: 'Restauración Completa',
          description: 'Haz clic en "Reabrir" para restaurar la sesión completa en la Calculadora. Se cargarán todos los parámetros de configuración y los datos modificados tal como los dejaste.',
          side: "left",
          align: 'center'
        }
      });
    }

    if (document.querySelector('.tour-btn-eliminar')) {
      tourSteps.push({
        element: '.tour-btn-eliminar',
        popover: {
          title: 'Eliminar Registro',
          description: 'Si ya no necesitas este cálculo, haz clic en "Eliminar" para borrarlo de forma permanente del sistema.',
          side: "left",
          align: 'center'
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

  const cargarHistorial = async () => {
    if (!usuario) return;
    try {
      // Retraso artificial de 1 segundo para ver el Skeleton (¡Bórralo luego si deseas!)
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = await api.obtenerHistorial(usuario.nombre);
      setRegistros((data.historial || []).map((registro) => {
        const normalizado = { ...registro, modulo: obtenerModuloHistorial(registro) };
        return { ...normalizado, ...obtenerOrigenHistorial(normalizado) };
      }));
    } catch (error) {
      alerta.error("Error", "No se pudo cargar el historial.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [usuario]);

  // Funciones para manejar el Modal
  const solicitarEliminacion = (id) => {
    setRegistroAEliminar(id);
    setIsModalOpen(true);
  };

  const cancelarEliminacion = () => {
    setIsModalOpen(false);
    setRegistroAEliminar(null);
  };

  const confirmarEliminacion = async () => {
    if (!registroAEliminar) return;
    try {
      await api.eliminarHistorial(registroAEliminar, usuario.nombre);
      // Filtramos el registro eliminado de la pantalla al instante
      setRegistros(registros.filter((reg) => reg.id !== registroAEliminar));
      alerta.exito("Eliminado", "El registro ha sido borrado de tu historial.");
    } catch (error) {
      alerta.error("Error", "No se pudo eliminar el registro.");
    } finally {
      setIsModalOpen(false);
      setRegistroAEliminar(null);
    }
  };

  // --- LÓGICA DE BÚSQUEDA Y PAGINACIÓN ---
  const filteredRegistros = registros.filter((reg) => {
    const term = searchTerm.toLowerCase();
    const nombreCalculoMAT251 = reg.modulo === "MAT251"
      ? obtenerNombreCalculoHistorial(reg).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      : "";
    const terminoCalculo = term.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const matchCalculo = reg.calculo?.toLowerCase().includes(term)
      || (reg.modulo === "MAT251" && nombreCalculoMAT251.includes(terminoCalculo));
    const matchArchivo = reg.archivoFuente?.toLowerCase().includes(term);
    const matchModo = reg.modoHistorial?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(terminoCalculo);
    const matchFecha = reg.fecha?.toLowerCase().includes(term);
    const matchModulo = filtroModulo === "TODOS" || reg.modulo === filtroModulo;
    return matchModulo && (matchCalculo || matchArchivo || matchModo || matchFecha || reg.modulo?.toLowerCase().includes(term));
  });

  const totalPages = Math.ceil(filteredRegistros.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRegistros = filteredRegistros.slice(startIndex, startIndex + itemsPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Volver a la primera página al buscar
  };

  // Evitar quedarse en una página vacía si se elimina el último elemento de la misma
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [filteredRegistros.length, currentPage, totalPages]);

  // Componente de Paginación
  const ControlesPaginacion = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="historial-paginacion" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
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
    <div className="page-container historial-page" style={{ maxWidth: '100%', margin: '0 auto', padding: '15px' }}>

      {/* Marca de agua de fondo */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "450px",
          height: "450px",
          backgroundImage: `url(${escudoAdmin})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          opacity: 0.04,
          zIndex: 0,
          pointerEvents: "none"
        }}
      />
      {/* CABECERA CON BOTÓN DE TOUR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0, flexWrap: 'wrap', gap: 'clamp(10px, 3vw, 20px)' }}>
          <button
            onClick={iniciarTour}
            className="guia-rapida-flotante"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="guia-rapida-flotante-texto">Guía Rápida</span>
          </button>
      </div>


      {(cargando || registros.length > 0) && (
        <div className="historial-buscador historial-filtros">
          <input
            type="text"
            className="input-mat251 placeholder-small"
            placeholder="Buscar por operación, archivo, modo o fecha..."
            aria-label="Buscar en el historial"
            value={searchTerm}
            onChange={handleSearch}
            disabled={cargando}
            style={{ width: "100%", padding: "10px 15px", borderRadius: "8px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-input)", color: "var(--text-main)", outline: "none", fontSize: "0.95rem" }}
          />
          <SelectorModuloHistorial
            id="historial-filtro-modulo"
            value={filtroModulo}
            onChange={(modulo) => {
              setFiltroModulo(modulo);
              setCurrentPage(1);
            }}
            disabled={cargando}
            options={[
              { value: "TODOS", label: "Todos los módulos" },
              { value: "MAT151", label: "MAT151" },
              { value: "MAT251", label: "MAT251" },
            ]}
          />
        </div>
      )}

      {cargando ? (
        <div className="historial-container" aria-busy="true" aria-label="Cargando historial">
          <table className="historial-tabla">
                <colgroup>
                  <col className="historial-col-fecha" />
                  <col className="historial-col-hora" />
                  <col className="historial-col-calculo" />
                  <col className="historial-col-modulo" />
                  <col className="historial-col-archivo" />
                  <col className="historial-col-modo" />
                  <col className="historial-col-acciones" />
                </colgroup>
            <thead>
              <tr>
                <th>Fecha</th>
                    <th>Hora</th>
                <th>Tipo de Cálculo</th>
                <th>Módulo</th>
                    <th>Archivo Fuente</th>
                    <th>Modo</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={i} className="historial-fila historial-fila-cargando">
                  <td className="historial-celda historial-celda-fecha" data-label="Fecha">
                    <Skeleton height="1.5em" width="100px" />
                  </td>
                  <td className="historial-celda historial-celda-hora" data-label="Hora">
                    <Skeleton height="1.25em" width="70px" />
                  </td>
                  <td className="historial-celda historial-celda-calculo" data-label="Tipo de Cálculo">
                    <Skeleton height="24px" width="180px" borderRadius="12px" />
                  </td>
                  <td className="historial-celda historial-celda-modulo" data-label="Módulo">
                    <Skeleton height="20px" width="62px" />
                  </td>
                  <td className="historial-celda historial-celda-archivo" data-label="Archivo Fuente">
                    <Skeleton height="16px" width="120px" />
                  </td>
                  <td className="historial-celda historial-celda-modo" data-label="Modo">
                    <Skeleton height="16px" width="100px" />
                  </td>
                  <td className="historial-celda historial-celda-acciones" data-label="Acciones">
                    <div className="acciones-container" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      <Skeleton height="32px" width="80px" borderRadius="6px" />
                      <Skeleton height="32px" width="80px" borderRadius="6px" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : registros.length === 0 ? (
        <div className="container_reader_archivo">
          <p>No tienes cálculos guardados todavía.</p>
        </div>
      ) : (
        <>


          {/* TABLA Y PAGINACIÓN */}
          {filteredRegistros.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No se encontraron registros{filtroModulo !== "TODOS" ? ` de ${filtroModulo}` : ""}{searchTerm ? ` que coincidan con "${searchTerm}"` : ""}.
            </div>
          ) : (
            <div className="historial-container" id="tour-historial-tabla">
              <table className="historial-tabla">
                <colgroup>
                  <col className="historial-col-fecha" />
                  <col className="historial-col-hora" />
                  <col className="historial-col-calculo" />
                  <col className="historial-col-modulo" />
                  <col className="historial-col-archivo" />
                  <col className="historial-col-modo" />
                  <col className="historial-col-acciones" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Tipo de Cálculo</th>
                    <th>Módulo</th>
                    <th>Archivo Fuente</th>
                    <th>Modo</th>
                    <th style={{ textAlign: "center" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRegistros.map((reg) => (
                    <tr key={reg.id} className="historial-fila">
                      <td className="historial-celda historial-celda-fecha" data-label="Fecha">
                        <strong>{reg.fecha}</strong>
                      </td>
                      <td className="historial-celda historial-celda-hora" data-label="Hora">
                        <span className="text-muted">{reg.hora}</span>
                      </td>
                      <td className="historial-celda historial-celda-calculo" data-label="Tipo de Cálculo">
                        <span className="tipo-calculo tour-tipo-calculo">
                                                    {reg.modulo === "MAT251"
                            ? obtenerNombreCalculoHistorial(reg).replace(/[a-záéíóúüñ]/g, letra => letra.toUpperCase())
                            : reg.calculo.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="historial-celda historial-celda-modulo" data-label="Módulo">
                        <span className={`historial-modulo ${reg.modulo === "MAT251" ? "historial-modulo-mat251" : ""}`}>
                          {reg.modulo}
                        </span>
                      </td>
                      <td className="historial-celda historial-celda-archivo" data-label="Archivo Fuente">
                        <span className="archivo-origen tour-archivo-origen">{reg.archivoFuente}</span>
                      </td>
                      <td className="historial-celda historial-celda-modo" data-label="Modo">
                        <span className="modo-historial tour-modo-historial">{reg.modoHistorial}</span>
                      </td>

                      <td className="historial-celda historial-celda-acciones" data-label="Acciones">
                        <div className="acciones-container" style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                          <button
                            className="btn-reabrir tour-btn-reabrir"
                            onClick={() => {
                              // 1. Buscamos los datos donde sea que estén guardados
                              const datosBrutos = reg.snapshot || reg.resultados_json;
                              // 2. Nos aseguramos de que sea un objeto real
                              const snapshotListo = typeof datosBrutos === "string" ? JSON.parse(datosBrutos) : datosBrutos;
                              const destino = reg.modulo === "MAT251" ? "/MAT251" : "/calculadora";
                              navigate(destino, {
                                state: {
                                  archivoReabrir: reg.archivo_origen,
                                  calculoReabrir: reg.calculo,
                                  snapshot: snapshotListo,
                                  historialOrigen: {
                                    id: reg.id,
                                    fecha: reg.fecha,
                                    hora: reg.hora,
                                    modulo: reg.modulo,
                                    calculo: reg.calculo,
                                    archivo: reg.archivo_origen,
                                  },
                                },
                              });
                            }}
                            title="Cargar este cálculo"
                          >
                            Reabrir
                          </button>

                          <button
                            className="btn-eliminar tour-btn-eliminar"
                            onClick={() => solicitarEliminacion(reg.id)}
                            title="Eliminar registro"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div>
            {/* Controles de paginación */}
            <ControlesPaginacion />
          </div>
        </>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      <Modal
        isOpen={isModalOpen}
        onClose={cancelarEliminacion}
        title="Confirmar eliminación"
        maxWidth="400px"
      >
        <div className="modal_viewer">
          <p>
            ¿Estás seguro de que deseas eliminar permanentemente este cálculo de tu historial?
          </p>
        </div>

        <div className="modal_viewer_button">
          <button
            onClick={cancelarEliminacion}
            className="modal_viewer_button_si"
          >
            Cancelar
          </button>

          <button
            onClick={confirmarEliminacion}
            className="modal_viewer_button_no"
          >
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}
