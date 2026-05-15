import { useState } from "react";
import { DataGrid } from "react-data-grid";
import "react-data-grid/lib/styles.css";

import { alerta } from '../../utils/Notificaciones';
import { api } from '../../services/api';
import { useData } from '../excel/DataContext';
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

  // Estados temporales para el modal de configuración de regla aleatoria
  const [modalGenTipo, setModalGenTipo] = useState("uniforme");
  const [modalGenFormato, setModalGenFormato] = useState("flotante");
  const [modalGenMin, setModalGenMin] = useState("0");
  const [modalGenMax, setModalGenMax] = useState("100");
  const [modalGenMedia, setModalGenMedia] = useState("50");
  const [modalGenDesv, setModalGenDesv] = useState("10");

  const [columns, setColumns] = useState([
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
    },
    {
      key: "0", name: "Var 1", renderEditCell: textEditor, editable: true, resizable: true,
      width: 150, minWidth: 150
    },
    {
      key: "1", name: "Var 2", renderEditCell: textEditor, editable: true, resizable: true,
      width: 150, minWidth: 150
    },
  ]);

  const [rows, setRows] = useState([
    { "0": "", "1": "" },
    { "0": "", "1": "" },
    { "0": "", "1": "" },
    { "0": "", "1": "" },
    { "0": "", "1": "" }
  ]);

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
  const agregarFila = () => {
    const newRow = {};
    columns.forEach(col => { newRow[col.key] = ""; });
    setRows([...rows, newRow]);
  };

  const eliminarUltimaFila = () => {
    if (rows.length > 0) setRows(rows.slice(0, -1));
  };

  // --- LÓGICA DE GENERACIÓN ALEATORIA (REGLAS POR VARIABLE) ---
  
  const calcularValorAleatorio = (regla) => {
    if (!regla || !regla.tipo) return "";
    
    let valor;
    if (regla.tipo === "uniforme") {
      const min = parseFloat(regla.min) || 0;
      const max = parseFloat(regla.max) || 100;
      valor = Math.random() * (max - min) + min;
    } else {
      // Normal (Box-Muller)
      const mean = parseFloat(regla.media) || 0;
      const stdDev = parseFloat(regla.desv) || 1;
      const u = 1 - Math.random();
      const v = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      valor = z * stdDev + mean;
    }

    if (regla.formato === "entero") return Math.round(valor);
    return parseFloat(valor.toFixed(2));
  };

  const handleLlenarColumnaActual = () => {
    if (rows.length === 0) {
      alerta.warning("Sin filas", "Agrega filas antes de generar datos.");
      return;
    }

    const reglaActual = {
      tipo: modalGenTipo,
      formato: modalGenFormato,
      min: modalGenMin,
      max: modalGenMax,
      media: modalGenMedia,
      desv: modalGenDesv
    };

    const updatedRows = rows.map(row => ({
      ...row,
      [configColId]: String(calcularValorAleatorio(reglaActual))
    }));

    setRows(updatedRows);
    alerta.exito("Columna Generada", `Se llenaron ${updatedRows.length} celdas.`);
  };

  // --- GENERAR MATRIZ AUTOMÁTICA ---
  const cargarMatriz = () => {
    const numFilas = parseInt(inputFilas, 10);
    const numCols = parseInt(inputColumnas, 10);

    if (isNaN(numFilas) || numFilas <= 0) {
      alerta.error("Valor inválido", "Ingresa un número de filas mayor a 0.");
      return;
    }

    // Caso 1: Solo queremos agregar más filas a la estructura actual
    if (isNaN(numCols) || numCols <= 0) {
      if (rows.length > 0) {
        const diff = numFilas - rows.length;
        if (diff > 0) {
          const nuevasFilas = [...rows];
          for (let i = 0; i < diff; i++) {
            const row = {};
            columns.forEach(col => {
              if (col.key === "obs") return;
              if (col.randomRule) {
                row[col.key] = String(calcularValorAleatorio(col.randomRule));
              } else {
                row[col.key] = "";
              }
            });
            nuevasFilas.push(row);
          }
          setRows(nuevasFilas);
          alerta.exito("Filas agregadas", `Se han sumado ${diff} nuevas observaciones.`);
          return;
        } else {
          alerta.warning("Sin cambios", "El número de observaciones es menor o igual al actual.");
          return;
        }
      }
      alerta.error("Faltan columnas", "Define el número de variables para generar la matriz.");
      return;
    }

    // Caso 2: Generar matriz completa o ajustar tamaño
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
      nuevasColumnas.push({
        key: i.toString(),
        name: existingCol ? existingCol.name : `Var ${i + 1}`,
        renderEditCell: textEditor,
        dataType: existingCol ? existingCol.dataType : "numero",
        randomRule: existingCol ? existingCol.randomRule : null,
        editable: true,
        resizable: true,
        width: 150,
        minWidth: 150
      });
    }

    const nuevasFilas = [];
    for (let i = 0; i < numFilas; i++) {
      const row = {};
      const existingRow = rows[i];
      nuevasColumnas.forEach(col => {
        if (col.key === "obs") return;
        
        // Si la celda ya existe y tiene datos, los mantenemos
        if (existingRow && existingRow[col.key] !== undefined && existingRow[col.key] !== "") {
          row[col.key] = existingRow[col.key];
        } 
        // Si es una celda nueva o vacía y la columna tiene regla, generamos
        else if (col.randomRule) {
          row[col.key] = String(calcularValorAleatorio(col.randomRule));
        } else {
          row[col.key] = "";
        }
      });
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
    
    const datosLimpios = filasValidas.map(row => {
      let obj = {};
      columnasVariables.forEach(col => {
        const val = row[col.key];
        
        // Si el valor es nulo o indefinido, guardamos cadena vacía
        if (val === undefined || val === null || String(val).trim() === "") {
          obj[col.name] = "";
        } else {
          // Si la columna es de tipo número, intentamos guardarlo como número real
          if (col.dataType === 'numero') {
            const num = Number(val);
            obj[col.name] = !isNaN(num) ? num : String(val);
          } else {
            obj[col.name] = String(val);
          }
        }
      });
      return obj;
    });

    try {
      // Usamos el nombre del usuario logueado como autor
      const autorFinal = usuario?.nombre || "Anonimo";
      
      await api.guardarTabla(nombre, datosLimpios, autorFinal);
      alerta.success(`¡Guardado!`, `${nombre}.xlsx se guardó correctamente.`);
      if (onTablaCreada) onTablaCreada();
    } catch (err) {
      console.error("Error al guardar tabla:", err);
      alerta.error("Error al guardar", "No se pudo conectar con el servidor.");
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
              // Cargar valores actuales de la regla si existen
              if (col.randomRule) {
                setModalGenTipo(col.randomRule.tipo);
                setModalGenFormato(col.randomRule.formato);
                setModalGenMin(col.randomRule.min);
                setModalGenMax(col.randomRule.max);
                setModalGenMedia(col.randomRule.media);
                setModalGenDesv(col.randomRule.desv);
              } else {
                // Reset a valores por defecto
                setModalGenTipo("uniforme");
                setModalGenFormato("flotante");
                setModalGenMin("0");
                setModalGenMax("100");
                setModalGenMedia("50");
                setModalGenDesv("10");
              }
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
        <div className="modal_overlay_col" onClick={() => setConfigColId(null)}>
          <div className="modal_content_col" onClick={(e) => e.stopPropagation()}>
            <button className="modal_close_btn" onClick={() => setConfigColId(null)}>&times;</button>
            <h4>Configurar Variable</h4>

            <div className="form_group_col">
              <label>Nombre de la Variable</label>
              <input
                value={colConfiguracion.name}
                onChange={(e) => {
                  const val = e.target.value;
                  setColumns(prev => prev.map(c => c.key === configColId ? { ...c, name: val } : c));
                }}
                placeholder="Ej: Edad"
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

            {/* SECCIÓN GENERADOR ALEATORIO DENTRO DE CONFIGURACIÓN */}
            {colConfiguracion.dataType === 'numero' && (
              <div className="generador_aleatorio_section">
                <h5 className="subtitulo_modal">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                  Configurar Regla Aleatoria
                </h5>
                
                <div className="form_group_col">
                  <label>Distribución</label>
                  <select value={modalGenTipo} onChange={(e) => setModalGenTipo(e.target.value)}>
                    <option value="uniforme">Uniforme (Rango)</option>
                    <option value="normal">Normal (Media/Desv)</option>
                  </select>
                </div>

                <div className="form_group_col">
                  <label>Tipo de Número</label>
                  <select value={modalGenFormato} onChange={(e) => setModalGenFormato(e.target.value)}>
                    <option value="flotante">Flotante (2 dec.)</option>
                    <option value="entero">Entero</option>
                  </select>
                </div>

                {modalGenTipo === 'uniforme' ? (
                  <div className="row_inputs_col">
                    <div className="form_group_col">
                      <label>Min</label>
                      <input type="number" value={modalGenMin} onChange={(e) => setModalGenMin(e.target.value)} placeholder="0" />
                    </div>
                    <div className="form_group_col">
                      <label>Max</label>
                      <input type="number" value={modalGenMax} onChange={(e) => setModalGenMax(e.target.value)} placeholder="100" />
                    </div>
                  </div>
                ) : (
                  <div className="row_inputs_col">
                    <div className="form_group_col">
                      <label>Media (μ)</label>
                      <input type="number" value={modalGenMedia} onChange={(e) => setModalGenMedia(e.target.value)} placeholder="50" />
                    </div>
                    <div className="form_group_col">
                      <label>Desv. (σ)</label>
                      <input type="number" value={modalGenDesv} onChange={(e) => setModalGenDesv(e.target.value)} placeholder="10" />
                    </div>
                  </div>
                )}

                <div style={{ marginTop: '15px' }}>
                  <button 
                    className="btn_generar_col_mini"
                    onClick={handleLlenarColumnaActual}
                    title="Llenar las filas actuales con datos aleatorios"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path><polyline points="21 3 21 8 16 8"></polyline></svg>
                    Generar Datos
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '5px' }}>
              <button
                className="button_guardar_col"
                style={{ flex: 1, margin: 0 }}
                onClick={() => {
                  const arrOpciones = colConfiguracion.dataType === 'categoria' 
                    ? tempOpciones.split(",").map(s => s.trim()).filter(s => s)
                    : [];
                  
                  setColumns(prev => prev.map(c => c.key === configColId ? { 
                    ...c, 
                    opciones: arrOpciones,
                    // Guardamos la regla de generación en la columna
                    randomRule: colConfiguracion.dataType === 'numero' ? {
                      tipo: modalGenTipo,
                      formato: modalGenFormato,
                      min: modalGenMin,
                      max: modalGenMax,
                      media: modalGenMedia,
                      desv: modalGenDesv
                    } : null
                  } : c));
                  
                  setConfigColId(null);
                }}
              >
                Guardar
              </button>
              <button
                className="button_eliminar_col_esp"
                style={{ margin: 0 }}
                onClick={() => eliminarColumnaEspecifica(configColId)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <h3 className="titulo_tabla" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
        Ingreso de Datos Estadísticos
      </h3>

      {/* INPUT NOMBRE ARCHIVO */}
      <div className="container_input">
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
      <div className="generador_matriz_container">
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
      <div className="container_herramientas">
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
        <button onClick={guardarTabla} disabled={loading} className="button_guardar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          {loading ? "Guardando..." : "Guardar Tabla"}
        </button>
      </div>

      {/* GRILLA */}
      <div className="container_grilla" onPasteCapture={handlePaste}>
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
      </p>
    </div>
  );
}