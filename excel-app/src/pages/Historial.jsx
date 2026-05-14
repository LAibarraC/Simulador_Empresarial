import React, { useEffect, useState } from "react";
import { useData } from "../components/excel/DataContext";
import { api } from "../services/api";
import { alerta } from "../utils/Notificaciones";

import { useNavigate } from "react-router-dom";
import "../styles/pages/Historial.css";

export default function Historial({ usuario }) {
  const navigate = useNavigate();

  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarHistorial = async () => {
    if (!usuario) return;
    try {
      const data = await api.obtenerHistorial(usuario.nombre);
      setRegistros(data.historial || []);
    } catch (error) {
      alerta.error("Error", "No se pudo cargar el historial.");
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await api.eliminarHistorial(id, usuario.nombre);
      // Filtramos el registro eliminado de la pantalla al instante
      setRegistros(registros.filter((reg) => reg.id !== id));
      alerta.exito("Eliminado", "El registro ha sido borrado de tu historial.");
    } catch (error) {
      alerta.error("Error", "No se pudo eliminar el registro.");
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [usuario]);

  return (
    <div className="page-container">
      <div className="historial-header">
        <h2 className="historial-titulo">Historial de Cálculos</h2>
        <p className="historial-usuario">
          Bienvenido, <strong>{usuario?.nombre}</strong>.
        </p>
      </div>

      {cargando ? (
        <p className="text-muted">Cargando registros...</p>
      ) : registros.length === 0 ? (
        <div className="container_reader_archivo">
          <p>No tienes cálculos guardados todavía.</p>
        </div>
      ) : (
        <div className="historial-container">
          <table className="historial-tabla">
            <thead>
              <tr>
                <th>Fecha / Hora</th>
                <th>Tipo de Cálculo</th>
                <th>Archivo Fuente</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((reg) => (
                <tr key={reg.id} className="historial-fila">
                  <td className="historial-celda" data-label="Fecha / Hora">
                    <div className="fecha-col">
                      <strong>{reg.fecha}</strong>
                      <small className="text-muted">{reg.hora}</small>
                    </div>
                  </td>
                  <td className="historial-celda" data-label="Tipo de Cálculo">
                    <span className="tipo-calculo">
                      {reg.calculo.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="historial-celda" data-label="Archivo Fuente">
                    <span className="archivo-origen">{reg.archivo_origen}</span>
                  </td>

                  <td className="historial-celda" data-label="Acciones">
                    <div className="acciones-container">
                      <button
                        className="btn-reabrir"
                        onClick={() => {
                          navigate("/calculadora", {
                            state: {
                              archivoReabrir: reg.archivo_origen,
                              calculoReabrir: reg.calculo,
                              colXReabrir: reg.columna_x,
                              colYReabrir: reg.columna_y,
                              hojaReabrir: reg.hoja,
                            },
                          });
                        }}
                        title="Cargar este cálculo"
                      >
                        Reabrir
                      </button>

                      <button
                        className="btn-eliminar"
                        onClick={() => handleEliminar(reg.id)}
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
    </div>
  );
}
