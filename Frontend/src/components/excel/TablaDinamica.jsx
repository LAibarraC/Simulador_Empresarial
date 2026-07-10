import { useState, useRef, useEffect } from "react";
import { DataGrid } from "react-data-grid";
import "react-data-grid/lib/styles.css";

import { alerta } from '../../utils/Notificaciones';
import { api } from '../../services/api';
import { useData } from '../Gestion_Datos/DataContext';
import "../../styles/components/excel/TablaDinamica.css";

// Editor manual (Navegación en 4 ejes)
function textEditor({ row, column, onRowChange, onClose }) {
  return (
    <input
      className="editor_text"
      autoFocus
      value={row[column.key]}
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
        }
      }}
      style={{
        width: '100%', height: '100%', border: 'none',
        padding: '0 8px', outline: '2px solid #217346', boxSizing: 'border-box'
      }}
    />
  );
}

// Editor Numérico
function numberEditor({ row, column, onRowChange, onClose }) {
  return (
    <input
      type="number"
      className="editor_text"
      autoFocus
      value={row[column.key]}
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
        }
      }}
      style={{
        width: '100%', height: '100%', border: 'none',
        padding: '0 8px', outline: '2px solid #217346', boxSizing: 'border-box'
      }}
    />
  );
}

// Editor Categórico (Select)
function selectEditor({ row, column, onRowChange, onClose }) {
  const opciones = column.opciones || [];

  return (
    <select
      className="editor_text"
      autoFocus
      value={row[column.key]}
      onChange={(e) => {
        onRowChange({ ...row, [column.key]: e.target.value });
      }}
      onBlur={() => onClose(true)}
      onKeyDown={(e) => {
        if (['Enter'].includes(e.key)) {
          e.preventDefault();
          onClose(true);
          setTimeout(() => {
            const celdaViva = document.activeElement;
            if (celdaViva && celdaViva.classList.contains('rdg-cell')) {
              celdaViva.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
              );
            }
          }, 10);
        }
      }}
      style={{
        width: '100%', height: '100%', border: 'none',
        padding: '0 8px', outline: '2px solid #217346', boxSizing: 'border-box'
      }}
    >
      <option value="">-- Seleccionar --</option>
      {opciones.map((op, i) => (
        <option key={i} value={op}>{op}</option>
      ))}
    </select>
  );
}

export default function TablaDinamica({ onTablaCreada }) {
  const { usuario } = useData();
  const [nombre, setNombre] = useState("");

  const [loading, setLoading] = useState(false);
  const [configColId, setConfigColId] = useState(null); // ID de la columna siendo configurada
  const [tempOpciones, setTempOpciones] = useState(""); // Estado temporal para las opciones

  // Estados para el generador de matriz
  const [inputFilas, setInputFilas] = useState("");
  const [inputColumnas, setInputColumnas] = useState("");

  // Estados para el generador de distribuciones
  const [genDistribucion, setGenDistribucion] = useState('uniforme'); // 'uniforme' | 'normal'
  const [genTipo, setGenTipo] = useState('flotante');               // 'entero' | 'flotante'
  const [genMedia, setGenMedia] = useState('');                     // Para distribución normal
  const [genDesvStd, setGenDesvStd] = useState('');                 // Para distribución normal
  const [genMin, setGenMin] = useState('');                         // Para distribución uniforme
  const [genMax, setGenMax] = useState('');                         // Para distribución uniforme

  // --- ESTADO: SISTEMA DE HOJAS ---
  const crearHojaInicial = (nombre = 'Hoja 1') => ({
    nombre,
    columns: [
      {
        key: "obs", name: "Obs", width: 50,
        renderCell: (props) => (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <strong style={{ color: "#666" }}>{props.rowIdx + 1}</strong>
          </div>
        ),
        editable: false, resizable: false
      },
      { key: "0", name: "Var 1", renderEditCell: textEditor, editable: true, resizable: true, width: 150, minWidth: 150 },
      { key: "1", name: "Var 2", renderEditCell: textEditor, editable: true, resizable: true, width: 150, minWidth: 150 },
    ],
    rows: [
      { "0": "", "1": "" },
      { "0": "", "1": "" },
      { "0": "", "1": "" },
      { "0": "", "1": "" },
      { "0": "", "1": "" }
    ]
  });

  const [hojas, setHojas] = useState([crearHojaInicial()]);
  const [hojaActiva, setHojaActiva] = useState(0);
  const [editandoNombreHoja, setEditandoNombreHoja] = useState(null);
  const [tempNombreHoja, setTempNombreHoja] = useState('');

  // Ref para acceder siempre al estado más reciente en guardarTabla
  const hojasRef = useRef(hojas);
  useEffect(() => { hojasRef.current = hojas; }, [hojas]);
  const hojaActivaRef = useRef(hojaActiva);
  useEffect(() => { hojaActivaRef.current = hojaActiva; }, [hojaActiva]);

  // Atajos para la hoja activa
  const columns = hojas[hojaActiva]?.columns || [];
  const rows = hojas[hojaActiva]?.rows || [];

  // Setter que actualiza columns/rows en la hoja activa
  const setColumns = (updater) => setHojas(prev => {
    const next = [...prev];
    next[hojaActiva] = {
      ...next[hojaActiva],
      columns: typeof updater === 'function' ? updater(next[hojaActiva].columns) : updater
    };
    return next;
  });

  const setRows = (updater) => setHojas(prev => {
    const next = [...prev];
    next[hojaActiva] = {
      ...next[hojaActiva],
      rows: typeof updater === 'function' ? updater(next[hojaActiva].rows) : updater
    };
    return next;
  });

  // --- LÓGICA DE HOJAS ---
  const agregarHoja = () => {
    const numero = hojas.length + 1;
    setHojas(prev => [...prev, crearHojaInicial(`Hoja ${numero}`)]);
    setHojaActiva(hojas.length);
  };

  const eliminarHoja = (idx) => {
    if (hojas.length <= 1) {
      alerta.warning('Solo una hoja', 'El archivo debe tener al menos una hoja.');
      return;
    }
    setHojas(prev => prev.filter((_, i) => i !== idx));
    setHojaActiva(prev => Math.min(prev, hojas.length - 2));
  };

  const renombrarHoja = (idx, nuevoNombre) => {
    setHojas(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], nombre: nuevoNombre };
      return next;
    });
  };

  // --- LÓGICA DE VARIABLES (COLUMNAS) ---
  const agregarColumna = () => {
    let maxIdx = -1;
    columns.forEach(c => {
      if (c.key !== "obs") {
        const keyNum = parseInt(c.key, 10);
        if (!isNaN(keyNum) && keyNum > maxIdx) maxIdx = keyNum;
      }
    });

    const newIdx = (maxIdx + 1).toString();
    const newName = `Var ${maxIdx + 2}`;

    const newCol = {
      key: newIdx,
      name: newName,
      renderEditCell: textEditor,
      editable: true,
      resizable: true,
      width: 150,
      minWidth: 150
    };
    setColumns([...columns, newCol]);

    // Si no hay filas (porque se eliminaron todas las variables), agregamos 1 por defecto
    if (rows.length === 0) {
      setRows([{ [newIdx]: "" }]);
    } else {
      setRows(rows.map(row => ({ ...row, [newIdx]: "" })));
    }
  };

  const eliminarColumnaEspecifica = (colKey) => {
    if (columns.length <= 1) return;

    if (columns.length === 2) {
      setColumns(columns.filter(c => c.key !== colKey));
      setRows([]); // Eliminamos todas las filas porque ya no hay dónde escribir
    } else {
      setColumns(columns.filter(c => c.key !== colKey));
      setRows(rows.map(row => {
        const newRow = { ...row };
        delete newRow[colKey];
        return newRow;
      }));
    }
    setConfigColId(null);
  };

  // --- LÓGICA DE FILAS ---
  // Genera un valor según la configuración de distribución de la columna
  const generarValorColumna = (col) => {
    if (col.dataType !== 'numero' || !col.distConfig) return "";
    const { distribucion, tipo, media, desvStd, min, max } = col.distConfig;
    let valor;
    if (distribucion === 'normal') {
      let u, v;
      do { u = Math.random(); } while (u === 0);
      do { v = Math.random(); } while (v === 0);
      const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      valor = media + z * desvStd;
    } else {
      valor = Math.random() * (max - min) + min;
    }
    return tipo === 'entero' ? Math.round(valor) : parseFloat(valor.toFixed(2));
  };

  const agregarFila = () => {
    const newRow = {};
    columns.forEach(col => {
      newRow[col.key] = col.key === 'obs' ? '' : generarValorColumna(col);
    });
    setRows([...rows, newRow]);
  };

  const eliminarUltimaFila = () => {
    if (rows.length > 0) setRows(rows.slice(0, -1));
  };

  // --- GENERAR MATRIZ AUTOMÁTICA ---
  const cargarMatriz = () => {
    const numFilas = parseInt(inputFilas, 10);
    const numCols = parseInt(inputColumnas, 10);

    if (isNaN(numFilas) || isNaN(numCols) || numFilas <= 0 || numCols <= 0) {
      alerta.error("Valores inválidos", "Ingresa números mayores a 0 para filas y columnas.");
      return;
    }

    const nuevasColumnas = [
      {
        key: "obs",
        name: "Obs",
        width: 50,
        renderCell: (props) => (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <strong style={{ color: "#666" }}>{props.rowIdx + 1}</strong>
          </div>
        ),
        editable: false,
        resizable: false
      }
    ];

    for (let i = 0; i < numCols; i++) {
      const existingCol = columns.find(c => c.key === i.toString());
      if (existingCol) {
        nuevasColumnas.push(existingCol);
      } else {
        nuevasColumnas.push({
          key: i.toString(),
          name: `Var ${i + 1}`,
          renderEditCell: textEditor,
          editable: true,
          resizable: true,
          width: 150,
          minWidth: 150
        });
      }
    }

    const nuevasFilas = [];
    for (let i = 0; i < numFilas; i++) {
      const row = {};
      const existingRow = rows[i]; // Preservamos los datos de la fila si ya existía
      for (let j = 0; j < numCols; j++) {
        const colKey = j.toString();
        const colDef = nuevasColumnas.find(c => c.key === colKey);
        if (existingRow && existingRow[colKey] !== undefined && existingRow[colKey] !== "") {
          // Preservar dato existente
          row[colKey] = existingRow[colKey];
        } else {
          // Generar valor si la columna tiene distribución configurada
          row[colKey] = colDef ? generarValorColumna(colDef) : "";
        }
      }
      nuevasFilas.push(row);
    }

    setColumns(nuevasColumnas);
    setRows(nuevasFilas);
  };

  // --- GUARDADO ---
  const guardarTabla = async () => {
    if (!nombre.trim()) {
      alerta.warning("Falta el nombre", "Escribe un nombre para el conjunto de datos.");
      return;
    }

    if (rows.length === 0) {
      alerta.error("Tabla vacía", "La tabla no tiene filas para guardar.");
      return;
    }

    const columnasVariables = columns.filter(col => col.key !== "obs");

    // Función auxiliar para saber si una fila está completamente vacía
    const isRowEmpty = (row) => {
      return !columnasVariables.some(col => {
        const val = row[col.key];
        return val !== undefined && val !== null && String(val).trim() !== "";
      });
    };

    let lastDataIndex = -1;
    let firstEmptyIndex = -1;

    // Buscar huecos (filas vacías seguidas de filas con datos)
    for (let i = 0; i < rows.length; i++) {
      if (isRowEmpty(rows[i])) {
        if (firstEmptyIndex === -1) firstEmptyIndex = i;
      } else {
        lastDataIndex = i;
        if (firstEmptyIndex !== -1 && firstEmptyIndex < i) {
          alerta.error(
            "Filas en blanco",
            `No puedes dejar filas vacías en medio de los datos (ej. fila ${firstEmptyIndex + 1}). Por favor, elimina los espacios en blanco.`
          );
          return;
        }
      }
    }

    if (lastDataIndex === -1) {
      alerta.error("Tabla vacía", "La tabla no contiene ningún dato válido.");
      return;
    }

    // Recortar filas vacías al final
    const filasValidas = rows.slice(0, lastDataIndex + 1);

    // Validar si hay errores de tipo de dato antes de guardar
    const tieneErrores = filasValidas.some(row =>
      columnasVariables.some(col => {
        const val = row[col.key];
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          if (col.dataType === 'numero' && isNaN(Number(val))) return true;
        }
        return false;
      })
    );

    if (tieneErrores) {
      alerta.error("Errores en los datos", "Hay letras o símbolos inválidos en columnas que están configuradas como 'Número'. Por favor corrige las celdas rojas.");
      return;
    }

    setLoading(true);

    // Construir payload con TODAS las hojas (usando ref para estado más reciente)
    const hojasActuales = hojasRef.current;
    const hojasPayload = hojasActuales.map(hoja => {
      const colsVar = hoja.columns.filter(c => c.key !== 'obs');
      const nombresColumnas = colsVar.map(c => c.name);

      const isRowEmpty = (row) => !colsVar.some(c => {
        const v = row[c.key];
        return v !== undefined && v !== null && String(v).trim() !== '';
      });
      let lastIdx = -1;
      hoja.rows.forEach((r, i) => { if (!isRowEmpty(r)) lastIdx = i; });
      const filasHoja = lastIdx >= 0 ? hoja.rows.slice(0, lastIdx + 1) : [];

      const datos = filasHoja.map(row => {
        const obj = {};
        colsVar.forEach(col => {
          const val = row[col.key];
          obj[col.name] = (val !== undefined && val !== null) ? String(val) : '';
        });
        return obj;
      });

      return { nombre: hoja.nombre, columnas: nombresColumnas, datos };
    });

    try {
      console.log('[DEBUG] hojasPayload:', JSON.stringify(hojasPayload, null, 2));
      await api.guardarTablaHojas(nombre, hojasPayload, usuario?.nombre);
      alerta.success(`Guardado: ${nombre}.xlsx`, `${hojasActuales.length} hoja(s) almacenadas.`);

      // Lanzar evento global para que el selector de archivos se entere y se actualice al instante
      const event = new CustomEvent("tabla-creada", { detail: { nombre } });
      window.dispatchEvent(event);

      if (onTablaCreada) onTablaCreada(nombre);
    } catch (err) {
      console.error(err);
      alerta.error('Error', 'No se pudo guardar la tabla.');
    } finally {
      setLoading(false);
    }
  };

  // --- PEGAR DATOS DESDE EXCEL ---
  const handlePaste = (e) => {
    try {
      let activeCell = document.activeElement;

      // Si el foco está dentro del input de edición, buscamos la celda que lo contiene
      if (activeCell && activeCell.tagName === 'INPUT' && activeCell.classList.contains('editor_text')) {
        activeCell = activeCell.closest('.rdg-cell');
      }

      if (!activeCell || !activeCell.classList.contains("rdg-cell")) return;

      const pasteData = e.clipboardData?.getData("text/plain");
      if (!pasteData) return;

      // Si solo están pegando texto simple dentro de la edición de una celda, dejamos que actúe normal
      const isMultiCell = pasteData.includes('\n') || pasteData.includes('\t');
      if (!isMultiCell && document.activeElement.tagName === 'INPUT') {
        return;
      }

      e.preventDefault();
      e.stopPropagation(); // Detiene el pegado por defecto de react-data-grid

      const rowElement = activeCell.closest('.rdg-row');
      const rowIdxStr = activeCell.getAttribute("aria-rowindex") || (rowElement ? rowElement.getAttribute("aria-rowindex") : null);
      const colIdxStr = activeCell.getAttribute("aria-colindex");

      if (!rowIdxStr || !colIdxStr) return;

      const rowIdx = parseInt(rowIdxStr, 10) - 2;
      const colIdx = parseInt(colIdxStr, 10) - 1;

      if (isNaN(rowIdx) || isNaN(colIdx) || rowIdx < 0 || colIdx < 0) return;

      let rowsToPaste = pasteData.split(/\r\n|\n|\r/);
      if (rowsToPaste[rowsToPaste.length - 1] === "") {
        rowsToPaste.pop(); // Limpiar el salto de línea final típico de Excel
      }

      const pasteRows = rowsToPaste.map(row => row.split("\t"));

      const applyPaste = () => {
        setRows(prevRows => {
          const newRows = [...prevRows];

          pasteRows.forEach((pasteRow, rIdx) => {
            const targetRowIdx = rowIdx + rIdx;

            while (targetRowIdx >= newRows.length) {
              const newRowObj = {};
              columns.forEach(col => { newRowObj[col.key] = ""; });
              newRows.push(newRowObj);
            }

            const rowToUpdate = { ...newRows[targetRowIdx] };

            pasteRow.forEach((cellValue, cIdx) => {
              const targetColIdx = colIdx + cIdx;
              if (targetColIdx < columns.length) {
                const colKey = columns[targetColIdx].key;
                if (colKey !== "obs") {
                  rowToUpdate[colKey] = (cellValue || "").trim();
                }
              }
            });

            newRows[targetRowIdx] = rowToUpdate;
          });

          return newRows;
        });
      };

      if (document.activeElement.tagName === 'INPUT') {
        document.activeElement.blur(); // Salir del modo edición
        // Esperamos un instante para asegurarnos de que la grilla haya terminado de procesar
        // su evento interno de "blur" que sobrescribe la celda actual con valores vacíos,
        // y entonces inyectamos nuestros datos correctos por encima.
        setTimeout(applyPaste, 10);
      } else {
        applyPaste();
      }

    } catch (err) {
      console.error("Error al pegar datos:", err);
    }
  };

  const handleRowsChange = (newRows) => {
    setRows(newRows);
  };

  // --- GENERADOR DE DISTRIBUCIONES ---
  // Box-Muller para generar valor con distribución normal
  const generarNormal = (media, std) => {
    let u, v;
    do { u = Math.random(); } while (u === 0);
    do { v = Math.random(); } while (v === 0);
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return media + z * std;
  };

  const generarDatosDistribucion = () => {
    if (!configColId) return;

    // Validar parámetros según distribución
    if (genDistribucion === 'normal') {
      const media = parseFloat(genMedia);
      const std = parseFloat(genDesvStd);
      if (isNaN(media) || isNaN(std) || std <= 0) {
        alerta.error('Parámetros inválidos', 'Ingresa una media válida y una desviación estándar mayor a 0.');
        return;
      }
    } else {
      const min = parseFloat(genMin);
      const max = parseFloat(genMax);
      if (isNaN(min) || isNaN(max) || min >= max) {
        alerta.error('Parámetros inválidos', 'El mínimo debe ser menor que el máximo.');
        return;
      }
    }

    setRows(prevRows => {
      const newRows = [...prevRows];
      for (let i = 0; i < newRows.length; i++) {
        let valor = generarNormal(parseFloat(genMedia), parseFloat(genDesvStd));
        if (genDistribucion === 'uniforme') {
          const min = parseFloat(genMin);
          const max = parseFloat(genMax);
          valor = Math.random() * (max - min) + min;
        }
        if (genTipo === 'entero') valor = Math.round(valor);
        else valor = parseFloat(valor.toFixed(2));
        newRows[i] = { ...newRows[i], [configColId]: valor };
      }
      return newRows;
    });

    alerta.success('Datos generados', `Se generaron ${rows.length} valores con distribución ${genDistribucion === 'normal' ? 'Normal' : 'Uniforme'}.`);
  };


  // --- EDICIÓN DE CABECERAS ---
  const columnasEditables = columns.map(col => {
    if (col.key === "obs") {
      return {
        ...col,
        renderHeaderCell: () => (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            {col.name}
          </div>
        )
      };
    }

    let renderEditCell = textEditor;
    let renderCell = undefined;

    if (col.dataType === 'numero') renderEditCell = numberEditor;

    if (col.dataType === 'categoria') {
      renderEditCell = undefined; // Deshabilitamos el modo edición tradicional
      renderCell = (props) => {
        const opciones = col.opciones || [];
        return (
          <select
            className="select_categoria"
            value={props.row[col.key] || ""}
            onChange={(e) => props.onRowChange({ ...props.row, [col.key]: e.target.value })}
            onClick={(e) => e.stopPropagation()} // Permite interactuar con el select sin conflicto con la grilla
          >
            <option value="">Seleccionar...</option>
            {opciones.map((op, i) => (
              <option key={i} value={op}>{op}</option>
            ))}
          </select>
        );
      };
    }

    return {
      ...col,
      ...(renderEditCell ? { renderEditCell } : {}),
      ...(renderCell ? { renderCell } : {}),
      cellClass: (row) => {
        const val = row[col.key];
        if (col.dataType === 'numero') {
          if (val !== undefined && val !== null && String(val).trim() !== "") {
            const isNum = !isNaN(Number(val));
            if (!isNum) return "celda_error";
          }
        }
        return "";
      },
      renderHeaderCell: () => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', gap: '8px' }}>
          <span>{col.name}</span>
          <button
            onClick={() => {
              setConfigColId(col.key);
              setTempOpciones((col.opciones || []).join(", "));
            }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: '#718096', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title="Configurar Columna"
            className="btn_config_columna"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>
      )
    };
  });

  const colConfiguracion = columns.find(c => c.key === configColId);

  return (
    <div className="container_tablas_Dinamica">
      {/* MODAL DE CONFIGURACIÓN DE COLUMNA */}
      {configColId && colConfiguracion && (
        <div className="modal_overlay_col">
          <div className="modal_content_col" style={{ position: 'relative' }}>
            <button
              onClick={() => setConfigColId(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted, #a0aec0)',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background-color 0.2s, color 0.2s'
              }}
              title="Cerrar"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = 'var(--error-color, #e53e3e)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted, #a0aec0)'; }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <h4>Configurar Variable</h4>

            <div className="form_group_col">
              <label>Nombre de la Variable</label>
              <input
                value={colConfiguracion.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setColumns(prev => prev.map(c => c.key === configColId ? { ...c, name: val } : c));
                }}
              />
            </div>

            <div className="form_group_col">
              <label>Tipo de Dato</label>
              <select
                value={colConfiguracion.dataType || "texto"}
                onChange={(e) => {
                  const val = e.target.value;
                  setColumns(prev => prev.map(c => c.key === configColId ? { ...c, dataType: val } : c));
                }}
              >
                <option value="texto">Texto</option>
                <option value="numero">Númerico</option>
                <option value="categoria">Categorías</option>
              </select>
            </div>


            {colConfiguracion.dataType === 'categoria' && (
              <div className="form_group_col">
                <label>Opciones (separadas por coma)</label>
                <input
                  value={tempOpciones}
                  onChange={(e) => setTempOpciones(e.target.value)}
                  placeholder="Ej: Masculino, Femenino"
                />
              </div>
            )}

            {/* ── GENERADOR DE DISTRIBUCIONES (solo para tipo número) ── */}
            {colConfiguracion.dataType === 'numero' && (
              <div className="generador_dist_panel">
                <div className="generador_dist_titulo">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                  Generador de Distribución
                </div>

                {/* Distribución y Tipo */}
                <div className="generador_dist_fila">
                  <div className="form_group_col" style={{ flex: 1 }}>
                    <label>Distribución</label>
                    <select value={genDistribucion} onChange={e => setGenDistribucion(e.target.value)}>
                      <option value="uniforme">Uniforme</option>
                      <option value="normal">Normal (Gauss)</option>
                    </select>
                  </div>
                  <div className="form_group_col" style={{ flex: 1 }}>
                    <label>Tipo de Número</label>
                    <select value={genTipo} onChange={e => setGenTipo(e.target.value)}>
                      <option value="flotante">Flotante (decimal)</option>
                      <option value="entero">Entero</option>
                    </select>
                  </div>
                </div>

                {/* Parámetros según distribución */}
                {genDistribucion === 'normal' ? (
                  <div className="generador_dist_fila">
                    <div className="form_group_col" style={{ flex: 1 }}>
                      <label>Media (μ)</label>
                      <input
                        type="number"
                        value={genMedia}
                        onChange={e => setGenMedia(e.target.value)}
                        placeholder="Ej: 50"
                      />
                    </div>
                    <div className="form_group_col" style={{ flex: 1 }}>
                      <label>Desv. Estándar (σ)</label>
                      <input
                        type="number"
                        min="0.0001"
                        value={genDesvStd}
                        onChange={e => setGenDesvStd(e.target.value)}
                        placeholder="Ej: 10"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="generador_dist_fila">
                    <div className="form_group_col" style={{ flex: 1 }}>
                      <label>Mínimo</label>
                      <input
                        type="number"
                        value={genMin}
                        onChange={e => setGenMin(e.target.value)}
                        placeholder="Ej: 0"
                      />
                    </div>
                    <div className="form_group_col" style={{ flex: 1 }}>
                      <label>Máximo</label>
                      <input
                        type="number"
                        value={genMax}
                        onChange={e => setGenMax(e.target.value)}
                        placeholder="Ej: 100"
                      />
                    </div>
                  </div>
                )}

                <p className="generador_dist_info">
                  Se generarán valores para las <strong>{rows.length}</strong> filas de esta columna.
                </p>

                <button
                  className="button_generar_dist"
                  onClick={generarDatosDistribucion}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                  Generar Datos
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button
                className="button_guardar_col"
                style={{ flex: 1 }}
                onClick={() => {
                  setColumns(prev => prev.map(c => {
                    if (c.key !== configColId) return c;
                    let updated = { ...c };
                    if (c.dataType === 'categoria') {
                      const arrOpciones = tempOpciones.split(",").map(s => s.trim()).filter(s => s);
                      updated.opciones = arrOpciones;
                    }
                    if (c.dataType === 'numero') {
                      // Guardar configuración de distribución en la columna
                      const distConfig = { distribucion: genDistribucion, tipo: genTipo };
                      if (genDistribucion === 'normal') {
                        distConfig.media = parseFloat(genMedia) || 0;
                        distConfig.desvStd = parseFloat(genDesvStd) || 1;
                      } else {
                        distConfig.min = parseFloat(genMin) || 0;
                        distConfig.max = parseFloat(genMax) || 100;
                      }
                      updated.distConfig = distConfig;
                    }
                    return updated;
                  }));
                  setConfigColId(null);
                }}
              >
                Listo
              </button>
              <button
                className="button_eliminar_col_esp"
                onClick={() => eliminarColumnaEspecifica(configColId)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <h3 className="titulo_tabla" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
          Ingreso de Datos Estadísticos
        </div>
      </h3>

      {/* INPUT NOMBRE ARCHIVO */}
      <div className="container_input" id="tour-crear-nombre">
        <label style={{ padding: '10px 0px 5px 0px' }}>Nombre del Archivo:</label>
        <div className="container_input_datos">
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej: Muestra_Poblacional"
          />
          <span>.xlsx</span>
        </div>
      </div>

      {/* GENERADOR DE MATRIZ */}
      <div className="generador_matriz_container" id="tour-crear-generador">
        <div className="generador_matriz_inputs">
          <div className="input_group_matriz">
            <label>OBSERVACIONES</label>
            <input
              type="number"
              min="1"
              value={inputFilas}
              onChange={e => setInputFilas(e.target.value)}
              placeholder="Ej: 50"
              className="input_matriz"
            />
          </div>
          <div className="input_group_matriz">
            <label>VARIABLES</label>
            <input
              type="number"
              min="1"
              value={inputColumnas}
              onChange={e => setInputColumnas(e.target.value)}
              placeholder="Ej: 5"
              className="input_matriz"
            />
          </div>
          <button onClick={cargarMatriz} className="button_generar_matriz" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            Generar
          </button>
        </div>
      </div>

      {/* BARRA DE HERRAMIENTAS */}
      <div className="container_herramientas" id="tour-crear-herramientas">
        <button onClick={agregarFila} className="button_fila_columna" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Agregar Fila
        </button>
        <button onClick={eliminarUltimaFila} className="button_eliminar_fila" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          Eliminar Fila
        </button>
        <button onClick={agregarColumna} className="button_fila_columna" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          Agregar Variable
        </button>

        <div style={{ marginLeft: '15px', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span><strong>Variables:</strong> {columns.length - 1}</span>
          <span><strong>Observaciones:</strong> {rows.length}</span>
        </div>

        <div style={{ flex: 1 }}></div>
        <button onClick={guardarTabla} disabled={loading} className="button_guardar" id="tour-crear-guardar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          {loading ? "Guardando..." : "Guardar Tabla"}
        </button>
      </div>

      {/* TABS DE HOJAS */}
      <div className="hojas_tabs_container">
        {hojas.map((hoja, idx) => (
          <div
            key={idx}
            className={`hoja_tab ${hojaActiva === idx ? 'hoja_tab_activa' : ''}`}
            onClick={() => setHojaActiva(idx)}
          >
            {editandoNombreHoja === idx ? (
              <input
                className="hoja_tab_input"
                autoFocus
                value={tempNombreHoja}
                onChange={e => setTempNombreHoja(e.target.value)}
                onBlur={() => {
                  const nombre = tempNombreHoja.trim() || hoja.nombre;
                  renombrarHoja(idx, nombre);
                  setEditandoNombreHoja(null);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const nombre = tempNombreHoja.trim() || hoja.nombre;
                    renombrarHoja(idx, nombre);
                    setEditandoNombreHoja(null);
                  } else if (e.key === 'Escape') {
                    setEditandoNombreHoja(null); // Cancelar sin guardar
                  }
                }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span
                onDoubleClick={e => {
                  e.stopPropagation();
                  setTempNombreHoja(hoja.nombre); // Inicializar con el nombre actual
                  setEditandoNombreHoja(idx);
                }}
                title="Doble clic para renombrar"
              >
                {hoja.nombre}
              </span>
            )}
            {hojas.length > 1 && (
              <button
                className="hoja_tab_cerrar"
                onClick={e => { e.stopPropagation(); eliminarHoja(idx); }}
                title="Eliminar hoja"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button className="hoja_tab_agregar" onClick={agregarHoja} title="Nueva hoja">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      {/* GRILLA */}
      <div className="container_grilla" id="tour-crear-grilla" onPasteCapture={handlePaste}>
        <DataGrid
          columns={columnasEditables}
          rows={rows}
          onRowsChange={setRows}
          className="rdg-light"
          style={{ blockSize: "100%" }}
          onCellKeyDown={(args, event) => {
            const { key } = event;
            const { rowIdx, idx } = args;

            if (key === "Enter" || key === "ArrowDown") {
              event.preventDefault();
              args.selectCell({
                rowIdx: Math.min(rows.length - 1, rowIdx + 1),
                idx: idx
              });
            } else if (key === "ArrowUp") {
              event.preventDefault();
              args.selectCell({
                rowIdx: Math.max(0, rowIdx - 1),
                idx: idx
              });
            }
          }}
        />
      </div>

      <p className="informacion_grilla">
        * Al presionar <strong>Enter</strong> o las <strong>flechas</strong>, los datos se guardan y la selección se desplaza. Selecciona el tipo de dato en la cabecera.
        <br />  Doble clic en el nombre de una hoja para renombrarla.
      </p>
    </div>
  );
}