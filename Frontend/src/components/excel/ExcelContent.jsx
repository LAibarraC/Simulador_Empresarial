import React, { useState, useEffect, useRef } from "react";
import { DataGrid } from "react-data-grid";
import "react-data-grid/lib/styles.css";

import { api } from "../../services/api";
import { useData } from "../Gestion_Datos/DataContext";
import { alerta } from "../../utils/Notificaciones"

import "../../styles/components/excel/ExcelContent.css";

const getExcelColumnName = (colIndex) => {
  let dividend = colIndex + 1;
  let colName = '';
  let modulo;
  while (dividend > 0) {
    modulo = (dividend - 1) % 26;
    colName = String.fromCharCode(65 + modulo) + colName;
    dividend = Math.floor((dividend - modulo) / 26);
  }
  return colName;
};

function textEditor({ row, column, onRowChange, onClose }) {
  return (
    <input
      className="text_editor"
      autoFocus
      value={row[column.key] ?? ''}
      onChange={(e) => onRowChange({ ...row, [column.key]: e.target.value })}
      onBlur={() => onClose(true)}
      onKeyDown={(e) => {
        if (['Enter', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          const teclaDestino = e.key === 'Enter' ? 'ArrowDown' : e.key;
          onClose(true);

          setTimeout(() => {
            const celdaViva = document.activeElement;
            if (celdaViva && celdaViva.classList.contains('rdg-cell')) {
              celdaViva.dispatchEvent(
                new KeyboardEvent('keydown', { key: teclaDestino, bubbles: true })
              );
            }
          }, 10);
        } else if (e.key === 'Escape') {
          onClose(false);
        }
      }}
      style={{
        width: '100%', height: '100%', border: 'none',
        padding: '0 8px', outline: '2px solid #217346', boxSizing: 'border-box',
        textAlign: 'center'
      }}
    />
  );
}

// 🆕 1. Agregamos `curso = ""` en las props
export default function ExcelContent({ filename, autor, curso = "", onSheetChange, mostrarTabla = true, permitirEdicion = true }) {
  const { usuario } = useData();
  const nombreAutor = autor || (usuario ? usuario.nombre : null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [huboCambios, setHuboCambios] = useState(false);
  const [cargandoGuardado, setCargandoGuardado] = useState(false);

  const [pendingSheetToSelect, setPendingSheetToSelect] = useState(null);
  const [recargarHojasTrigger, setRecargarHojasTrigger] = useState(0);

  const [mostrarModalGuardar, setMostrarModalGuardar] = useState(false);
  const [estrategiaSeleccionada, setEstrategiaSeleccionada] = useState("overwrite");

  const rowsRef = React.useRef(rows);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  // Restablecer el estado cuando el archivo cambia
  useEffect(() => {
    setSelectedSheet(0);
    setSheets([]);
    setRows([]);
    setColumns([]);
    setPendingSheetToSelect(null);
    if (onSheetChange) onSheetChange(0);
  }, [filename]);

  // 1. CARGAR HOJAS
  useEffect(() => {
    if (!filename || !nombreAutor) return;
    setError("");
    setHuboCambios(false);

    const fetchHojas = async () => {
      try {
        const json = await api.obtenerHojas(filename, nombreAutor, curso);
        if (json.sheets && json.sheets.length > 0) {
          setSheets(json.sheets);
          if (pendingSheetToSelect) {
            const idx = json.sheets.indexOf(pendingSheetToSelect);
            if (idx !== -1) {
              setSelectedSheet(idx);
              if (onSheetChange) onSheetChange(idx);
            }
            setPendingSheetToSelect(null);
          } else {
            if (selectedSheet >= json.sheets.length) {
              setSelectedSheet(0);
              if (onSheetChange) onSheetChange(0);
            }
          }
        } else {
          setError("El archivo no tiene hojas visibles.");
        }
      } catch (err) {
        console.error(err);
        setError("Error al conectar con el servidor.");
      }
    };

    fetchHojas();
  }, [filename, onSheetChange, nombreAutor, curso, recargarHojasTrigger]);

  // 2. CARGAR DATOS DE LA HOJA
  useEffect(() => {
    if (!filename || !nombreAutor || sheets.length === 0 || !mostrarTabla) return;
    setLoading(true);
    setHuboCambios(false);

    const fetchDatos = async () => {
      try {
        const json = await api.obtenerDatosHoja(filename, selectedSheet, nombreAutor, curso);

        if (Array.isArray(json) && json.length > 0) {
          const rawKeys = Object.keys(json[0]);
          const extraKeys = Array.from({ length: 10 }).map((_, i) => `__extra_col_${i}`);
          const allKeys = [...rawKeys, ...extraKeys];

          const cols = allKeys.map((key, index) => ({
            key: key,
            name: getExcelColumnName(index),
            resizable: true,
            sortable: true,
            width: 150,
            minWidth: 80,
            renderEditCell: textEditor,
            renderHeaderCell: () => (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                {getExcelColumnName(index)}
              </div>
            )
          }));

          const headerRow = {};
          allKeys.forEach(key => {
            if (rawKeys.includes(key)) {
              headerRow[key] = key.startsWith("Unnamed:") ? "" : key;
            } else {
              headerRow[key] = "";
            }
          });

          setColumns(cols);

          const emptyRows = Array.from({ length: 50 }).map(() => {
            const emptyRow = {};
            allKeys.forEach(key => { emptyRow[key] = ""; });
            return emptyRow;
          });

          const jsonConExtraCols = json.map(row => {
            const newRow = { ...row };
            extraKeys.forEach(k => { newRow[k] = ""; });
            return newRow;
          });

          const dataWithIds = [headerRow, ...jsonConExtraCols, ...emptyRows].map((r, i) => ({ ...r, _id: i }));
          setRows(dataWithIds);
        } else {
          setRows([]);
          setColumns([]);
        }
      } catch (err) {
        console.error(err);
        setError("Error al cargar los datos de la hoja.");
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, [filename, selectedSheet, sheets, mostrarTabla, nombreAutor, curso]);

  const handleSheetChange = (e) => {
    const newIndex = Number(e.target.value);
    setSelectedSheet(newIndex);
    if (onSheetChange) onSheetChange(newIndex);
  };

  if (error) return (
    <div className="text_error">
      <strong>Error:</strong> {error}
    </div>
  );

  const handleRowsChange = (newRows) => {
    setRows(newRows);
    setHuboCambios(true);
  }

  const guardarExcel = async (estrategia) => {
    setCargandoGuardado(true);
    setMostrarModalGuardar(false);
    try {
      if (rowsRef.current.length === 0) {
        console.warn("guardarExcel: No hay datos para guardar.");
        return;
      }

      const editedHeader = rowsRef.current[0];
      const extraKeys = Object.keys(editedHeader).filter(k => k.startsWith('__extra_col_'));
      const columnasExtraUsadas = new Set();

      rowsRef.current.forEach(r => {
        extraKeys.forEach(k => {
          if (r[k] !== "" && r[k] !== null && r[k] !== undefined && r[k].trim?.() !== "") {
            columnasExtraUsadas.add(k);
          }
        });
      });

      const datosParaGuardar = rowsRef.current.slice(1).reduce((acc, r) => {
        const isRowEmpty = Object.keys(r).every(key =>
          key === '_id' || r[key] === "" || r[key] === null || r[key] === undefined || (typeof r[key] === 'string' && r[key].trim() === "")
        );

        if (!isRowEmpty) {
          const newRecord = {};
          Object.keys(r).forEach(key => {
            if (key !== '_id') {
              if (key.startsWith('__extra_col_') && !columnasExtraUsadas.has(key)) {
                return;
              }

              let newColName = editedHeader[key] !== undefined ? editedHeader[key] : key;

              if (key.startsWith('__extra_col_') && newColName === "") {
                newColName = `Nueva_Columna_${key.split('_').pop()}`;
              }

              newRecord[newColName] = r[key];
            }
          });
          acc.push(newRecord);
        }
        return acc;
      }, []);

      const res = await api.actualizarExcel(filename, selectedSheet, datosParaGuardar, nombreAutor, curso, estrategia);
      if (res && res.error) {
        throw new Error(res.error);
      }

      const newSheetName = res.new_sheet;
      const strategyExecuted = res.strategy;

      setHuboCambios(false);

      if (strategyExecuted === "new_sheet" && newSheetName) {
        setPendingSheetToSelect(newSheetName);
        alerta.exito("Hoja agregada", `Se ha añadido la nueva hoja: ${newSheetName}`);
        setRecargarHojasTrigger(prev => prev + 1);
      } else if (strategyExecuted === "new_column") {
        alerta.exito("Columna guardada", "Se ha añadido la versión editada como una nueva columna.");
        setRecargarHojasTrigger(prev => prev + 1);
      } else {
        alerta.exito("Guardado exitoso", "Los cambios han sido guardados correctamente.");
        setRecargarHojasTrigger(prev => prev + 1);
      }
    } catch (err) {
      console.error("Error al guardar Excel en el servidor:", err);
      alerta.error("Error al guardar", err.message || "Ocurrió un error inesperado al intentar guardar los cambios.");
    } finally {
      setCargandoGuardado(false);
    }
  };

  return (
    // 1. EL CONTENEDOR MAESTRO: Inicia la cadena Flex
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }}>

      {/* Si no estamos mostrando la tabla, SOLO dibujamos el selector limpio */}
      {!mostrarTabla && sheets.length > 0 && (
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Hoja de Trabajo:
          </label>
          <select
            value={selectedSheet}
            onChange={handleSheetChange}
            style={{ width: "100%", padding: "5px", borderRadius: "4px", border: "1px solid var(--border-color)" }}
          >
            {sheets.map((sheetName, index) => (
              <option key={index} value={index}>{sheetName}</option>
            ))}
          </select>
        </div>
      )}

      {/* CABECERA PARA CUANDO LA TABLA ESTÁ VISIBLE */}
      {mostrarTabla && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          {sheets.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label>Hoja:</label>
              <select value={selectedSheet} onChange={handleSheetChange}>
                {sheets.map((sheetName, index) => (
                  <option key={index} value={index}>{sheetName}</option>
                ))}
              </select>
            </div>
          )}

          {permitirEdicion && huboCambios && (
            <button onClick={() => setMostrarModalGuardar(true)} disabled={cargandoGuardado} style={{ background: '#217346', color: 'white', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>
              {cargandoGuardado ? "Guardando..." : "Guardar Cambios"}
            </button>
          )}
        </div>
      )}

      {/* TABLA O ESTADO DE CARGA */}
      {mostrarTabla && (
        loading ? (
          <div className="container_tablas" style={{ textAlign: 'center', padding: '20px' }}>
            <h3>Cargando datos...</h3>
          </div>
        ) : rows.length > 0 ? (

          /* 2. EL CONTENEDOR DE LA TABLA: Continúa la cadena Flex */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }}>
            <DataGrid
              columns={columns}
              rows={rows}
              onRowsChange={handleRowsChange}
              rowKeyGetter={(row) => row._id}
              className="rdg-light personalizado"
              style={{ flex: 1, minHeight: 0 }} /* 👈 3. EL TOQUE FINAL: La tabla recibe la instrucción exacta */
            />
          </div>

        ) : (
          <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa' }}>Hoja vacía.</div>
        )
      )}

      {mostrarModalGuardar && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(15, 23, 42, 0.65)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999999
        }}>
          <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl p-6 w-[480px] max-w-[90%] text-white animate-fade-in flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
              </div>
              <div style={{ textAlign: "left" }}>
                <h3 className="text-xl font-bold tracking-tight text-white m-0">Confirmar Estrategia de Guardado</h3>
                <p className="text-xs text-slate-400 m-0 mt-1">Selecciona cómo deseas aplicar las modificaciones al archivo Excel</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Opción A */}
              <div
                onClick={() => setEstrategiaSeleccionada("overwrite")}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${estrategiaSeleccionada === "overwrite"
                    ? "bg-emerald-500/10 border-emerald-500/60 shadow-lg shadow-emerald-500/5 text-emerald-100"
                    : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 text-slate-300"
                  }`}
                style={{ textAlign: "left" }}
              >
                <input
                  type="radio"
                  name="estrategia"
                  checked={estrategiaSeleccionada === "overwrite"}
                  onChange={() => setEstrategiaSeleccionada("overwrite")}
                  className="mt-1 accent-emerald-500"
                />
                <div>
                  <span className="font-semibold block text-sm">Opción A: Sobrescribir hoja actual</span>
                  <span className="text-xs text-slate-400 block mt-1">Reemplaza directamente los datos de la pestaña actual. Los datos antiguos se perderán.</span>
                </div>
              </div>

              {/* Opción B */}
              <div
                onClick={() => setEstrategiaSeleccionada("new_column")}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${estrategiaSeleccionada === "new_column"
                    ? "bg-blue-500/10 border-blue-500/60 shadow-lg shadow-blue-500/5 text-blue-100"
                    : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 text-slate-300"
                  }`}
                style={{ textAlign: "left" }}
              >
                <input
                  type="radio"
                  name="estrategia"
                  checked={estrategiaSeleccionada === "new_column"}
                  onChange={() => setEstrategiaSeleccionada("new_column")}
                  className="mt-1 accent-blue-500"
                />
                <div>
                  <span className="font-semibold block text-sm">Opción B: Añadir como nueva columna</span>
                  <span className="text-xs text-slate-400 block mt-1">Conserva los datos originales y añade las columnas editadas con el sufijo <code className="bg-slate-950 px-1.5 py-0.5 rounded text-blue-400 font-mono text-[10px]">(Editado)</code>.</span>
                </div>
              </div>

              {/* Opción C */}
              <div
                onClick={() => setEstrategiaSeleccionada("new_sheet")}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${estrategiaSeleccionada === "new_sheet"
                    ? "bg-purple-500/10 border-purple-500/60 shadow-lg shadow-purple-500/5 text-purple-100"
                    : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 text-slate-300"
                  }`}
                style={{ textAlign: "left" }}
              >
                <input
                  type="radio"
                  name="estrategia"
                  checked={estrategiaSeleccionada === "new_sheet"}
                  onChange={() => setEstrategiaSeleccionada("new_sheet")}
                  className="mt-1 accent-purple-500"
                />
                <div>
                  <span className="font-semibold block text-sm">Opción C: Guardar en nueva hoja</span>
                  <span className="text-xs text-slate-400 block mt-1">Crea una pestaña completamente nueva en el Excel llamada <code className="bg-slate-950 px-1.5 py-0.5 rounded text-purple-400 font-mono text-[10px]">Datos_Editados_X</code>.</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-2">
              <button
                type="button"
                onClick={() => setMostrarModalGuardar(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => guardarExcel(estrategiaSeleccionada)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all duration-200 cursor-pointer"
              >
                Confirmar y Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
