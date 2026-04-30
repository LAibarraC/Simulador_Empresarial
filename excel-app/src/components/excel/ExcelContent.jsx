import React, { useState, useEffect, useRef } from "react";
import { DataGrid } from "react-data-grid";
import "react-data-grid/lib/styles.css";

import { api } from "../../services/api";
import {alerta} from "../../utils/Notificaciones"

import "../../styles/components/excel/ExcelContent.css";


// --- FUNCIÓN PARA LETRAS DE COLUMNAS (A, B, C...) ---
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

// --- EDITOR MANUAL ---
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
        padding: '0 8px', outline: '2px solid #217346', boxSizing: 'border-box'
      }}
    />
  );
}

export default function ExcelContent({ filename, onSheetChange, mostrarTabla = true, permitirEdicion = true }) {
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [huboCambios, setHuboCambios] = useState(false);
  const [cargandoGuardado, setCargandoGuardado] = useState(false);

  // Referencia para siempre tener los datos más recientes al guardar
  const rowsRef = React.useRef(rows);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  // 1. CARGAR HOJAS
  useEffect(() => {
    if (!filename) return;
    setSheets([]); setRows([]); setColumns([]); setSelectedSheet(0); setError("");
    setHuboCambios(false); // Ocultar el botón al cambiar de archivo
    if (onSheetChange) onSheetChange(0);

    const fetchHojas = async () => {
      try {
        const json = await api.obtenerHojas(filename);
        if (json.sheets && json.sheets.length > 0) {
          setSheets(json.sheets);
        } else {
          setError("El archivo no tiene hojas visibles.");
        }
      } catch (err) {
        console.error(err);
        setError("Error al conectar con el servidor.");
      }
    };

    fetchHojas();

    // ESTA ES LA LÍNEA QUE ARREGLA EL ERROR (se borró onSheetChange)
  }, [filename, onSheetChange]);

  // 2. CARGAR DATOS DE LA HOJA
  useEffect(() => {
    if (!filename || sheets.length === 0 || !mostrarTabla) return;
    setLoading(true);
    setHuboCambios(false); // Ocultar el botón al cambiar de hoja

    const fetchDatos = async () => {
      try {
        const json = await api.obtenerDatosHoja(filename, selectedSheet);

        if (Array.isArray(json) && json.length > 0) {
          const rawKeys = Object.keys(json[0]);

          // Crear 10 columnas adicionales vacías
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
              headerRow[key] = ""; // Columnas nuevas sin nombre
            }
          });

          setColumns(cols);
          
          // Generar 50 filas vacías para que el usuario pueda agregar más datos
          const emptyRows = Array.from({ length: 50 }).map(() => {
            const emptyRow = {};
            allKeys.forEach(key => { emptyRow[key] = ""; });
            return emptyRow;
          });

          // Rellenar las filas existentes con las nuevas columnas vacías
          const jsonConExtraCols = json.map(row => {
            const newRow = { ...row };
            extraKeys.forEach(k => { newRow[k] = ""; });
            return newRow;
          });

          // Asignamos un ID único a cada fila (incluidas las vacías)
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
  }, [filename, selectedSheet, sheets, mostrarTabla]);

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

  //Funciones para Poder editar el excel
  const handleRowsChange = (newRows) => {
    setRows(newRows);
    setHuboCambios(true);
  }
  const guardarExcel = async () => {
    setCargandoGuardado(true);
    try {
      if (rowsRef.current.length === 0) return;

      // 1. Obtener la primera fila, que contiene los verdaderos títulos de las columnas (editables por el usuario)
      const editedHeader = rowsRef.current[0];

      // Identificar cuáles de las columnas extra realmente se usaron (si tienen datos o les pusieron título)
      const extraKeys = Object.keys(editedHeader).filter(k => k.startsWith('__extra_col_'));
      const columnasExtraUsadas = new Set();

      rowsRef.current.forEach(r => {
        extraKeys.forEach(k => {
          if (r[k] !== "" && r[k] !== null && r[k] !== undefined && r[k].trim?.() !== "") {
            columnasExtraUsadas.add(k);
          }
        });
      });

      // 2. Reconstruir los datos usando los nuevos títulos de columnas (ignorando filas 100% vacías)
      const datosParaGuardar = rowsRef.current.slice(1).reduce((acc, r) => {
        // Verificar si la fila está completamente vacía (solo espacios en blanco o nada)
        const isRowEmpty = Object.keys(r).every(key => 
          key === '_id' || r[key] === "" || r[key] === null || r[key] === undefined || (typeof r[key] === 'string' && r[key].trim() === "")
        );

        if (!isRowEmpty) {
          const newRecord = {};
          Object.keys(r).forEach(key => {
            if (key !== '_id') {
              if (key.startsWith('__extra_col_') && !columnasExtraUsadas.has(key)) {
                return; // Ignorar columnas extra que nunca se usaron
              }

              let newColName = editedHeader[key] !== undefined ? editedHeader[key] : key;
              
              if (key.startsWith('__extra_col_') && newColName === "") {
                newColName = `Nueva_Columna_${key.split('_').pop()}`; // Título genérico si olvidaron ponerle nombre
              }

              newRecord[newColName] = r[key];
            }
          });
          acc.push(newRecord);
        }
        return acc;
      }, []);

      await api.actualizarExcel(filename, selectedSheet, datosParaGuardar);
      setHuboCambios(false);
      alerta.success("cambios guardados");
    } catch (err) {
      alerta.error("error", err.message);
    } finally {
      setCargandoGuardado(false);
    }
  }; 

  return (
    <div className="container_content" style={{
      height: mostrarTabla ? '550px' : 'auto',
    }}>

      {/* CABECERA DEL CONTENIDO (AHORA SÍ ES RESPONSIVA) */}
      <div className="container_cabecera">

        <div className="container_cabecera_info">
          <h5 >Archivo en uso</h5>
          <span>
            {filename}
          </span>
          { permitirEdicion && huboCambios && <small>tiene cambios pendientes</small>}
        </div>

        {permitirEdicion && huboCambios && (

          <div className="container_cabecera_botones">
            <button
              onClick={guardarExcel}
              disabled={cargandoGuardado}
            >
              {cargandoGuardado ? "Guardando..." : "Actualizar"}
            </button>
          </div>

        )}

        {sheets.length > 0 && (
          <div className="container_edicion">
              <span>
                Edición Activa
              </span>
            <div className="container_edicion_datos">
              <label>Hoja:</label>
              <select
                value={selectedSheet}
                onChange={handleSheetChange}
              >
                {sheets.map((sheetName, index) => (
                  <option key={index} value={index}>{sheetName}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* TABLA O ESTADO DE CARGA */}
      {mostrarTabla && (
        loading ? (
          <div className="container_tablas">
            <h3>Cargando datos desde el servidor...</h3>
            <p>Esto puede tardar dependiendo del tamaño del archivo.</p>
          </div>
        ) : rows.length > 0 ? (
          <div className="container_tablas_datos">
            <DataGrid
              columns={columns}
              rows={rows}
              onRowsChange={handleRowsChange}
              rowKeyGetter={(row) => row._id}
              className="rdg-light personalizado"
            />
          </div>
        ) : (
          <div className="container_vacio">
            <p>Hoja vacía.</p>
          </div>
        )
      )}
    </div>
  );
}