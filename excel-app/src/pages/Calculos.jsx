import { useEffect, useState, useRef } from "react";
import { DataGrid } from "react-data-grid";
import "react-data-grid/lib/styles.css";

// --- IMPORTS ---
import escudoAdmin from "../assets/images/escudoAdmin.png";
import { useLocation } from "react-router-dom";

import Calculator from "../components/excel/Calculator";
import ExcelContent from "../components/excel/ExcelContent";
import TablaDinamica from "../components/excel/TablaDinamica";
import { useCalculadoraExcel } from "../hooks/useCalculadoraExcel";
import { useData } from "../components/excel/DataContext";
import { api } from "../services/api";

import "../styles/pages/Calculos.css";

import TablasBivariantes from "../components/Resultados/TablasBivariantes";
import TablasUnidimensionales from "../components/Resultados/TablasUnidimensionales";
import PanelGraficos from "../components/Resultados/PanelGraficos";
import TablaRegresion from "../components/Resultados/TablaRegresion";
import TablaSeriesTiempo from "../components/Resultados/TablaSeriesTiempo";
import TablaIndices from "../components/Resultados/TablaIndices";

import { alerta } from "../utils/Notificaciones";

import { generarPDFReporte } from "../utils/exportUtils"; // 🆕
import { IconoGuardar, IconoPDF } from "../components/ui/iconos";

function textEditor({ row, column, onRowChange, onClose }) {
  return (
    <input
      className="editor_text"
      autoFocus
      value={row[column.key]}
      onChange={(e) => onRowChange({ ...row, [column.key]: e.target.value })}
      onBlur={() => onClose(true)}
      onKeyDown={(e) => {
        if (
          e.key === "ArrowLeft" ||
          e.key === "ArrowRight" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowDown"
        ) {
          e.stopPropagation();
        }
      }}
    />
  );
}

export default function Calculos() {
  const { variables, usuario } = useData();

  const [files, setFiles] = useState([]);

  const [selectedFile, setSelectedFile] = useState("");
  const [selectedSheet, setSelectedSheet] = useState(0);

  const [mostrarTabla, _setMostrarTabla] = useState(true);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
  const [filtroFractil, setFiltroFractil] = useState("Cuartil");
  const [panelAbierto, setPanelAbierto] = useState(true);
  const [modoCreacion, setModoCreacion] = useState(false);

  const {
    excelData,
    columns,
    selectedColumn,
    setSelectedColumn,
    selectedColumnY,
    setSelectedColumnY,
    resultado,
    calculo,
    setCalculo,
    tipoIntervalo,
    setTipoIntervalo,
    metodoK,
    setMetodoK,
    kPersonalizado,
    setKPersonalizado,
    percentilK,
    setPercentilK,
    handleChangeDato,
    ejecutarCalculo,
    errorNumerico,

    metodoSeries,
    setMetodoSeries,
    periodosK,
    setPeriodosK,
    pesos,
    setPesos,
    alfa,
    setAlfa,
    subTemaIndices,
    setSubTemaIndices,
    colPrecioBase,
    setColPrecioBase,
    colCantidadBase,
    setColCantidadBase,
    colPrecioActual,
    setColPrecioActual,
    colCantidadActual,
    setColCantidadActual,
    nuevoIndiceBase,
    setNuevoIndiceBase,
  } = useCalculadoraExcel(selectedFile, selectedSheet);

  const location = useLocation(); // 🆕 Leemos la ruta actual

  const calculoPendiente = useRef(false);



  // 🆕 EFECTO PARA REABRIR HISTORIAL (VERSIÓN AUTOMÁTICA)
  // 1. EFECTO INICIAL: Saca los datos de la mochila y prepara el banderín
  useEffect(() => {
    if (location.state) {
      const { archivoReabrir, calculoReabrir, colXReabrir, colYReabrir, hojaReabrir } = location.state;

      if (archivoReabrir) setSelectedFile(archivoReabrir);
      if (calculoReabrir) setCalculo(calculoReabrir);
      if (colXReabrir) setSelectedColumn(colXReabrir);
      if (colYReabrir) setSelectedColumnY(colYReabrir);
      if (hojaReabrir !== undefined) setSelectedSheet(hojaReabrir);

      // Si tenemos los datos principales, levantamos el banderín de cálculo
      if (archivoReabrir && calculoReabrir && colXReabrir) {
        calculoPendiente.current = true;
      }

      // Limpiamos la mochila del navegador para que no se repita en bucle si recargamos la página
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setCalculo, setSelectedColumn, setSelectedColumnY]);

  // 2. EFECTO OBSERVADOR: Espera a que el Excel termine de cargar
  useEffect(() => {
    // Si hay un cálculo pendiente Y ya tenemos datos en la tabla (excelData)
    if (calculoPendiente.current && excelData && excelData.length > 0) {

      const timer = setTimeout(() => {
        ejecutarCalculo();
        alerta.exito("Historial Cargado", "Se restauró el cálculo automáticamente.");
      }, 300); // Un pequeñísimo respiro de 300ms para que React pinte la tabla

      calculoPendiente.current = false; // Bajamos el banderín

      return () => clearTimeout(timer);
    }
  }, [excelData, ejecutarCalculo]); // React vigilará excelData constantemente

  const formatearCelda = (valor) => {
    if (typeof valor === "number")
      return Number.isInteger(valor) ? valor : Number(valor).toFixed(2);
    if (!isNaN(parseFloat(valor)) && isFinite(valor)) {
      const num = Number(valor);
      return Number.isInteger(num) ? num : num.toFixed(2);
    }
    return valor;
  };

  const cargarArchivos = async () => {
    if (!usuario) return;

    try {
      const data = await api.obtenerArchivos(usuario.nombre);
      if (data && data.files) {
        setFiles(data.files);
        // Eliminamos la línea que seleccionaba el primer archivo automáticamente
      }
    } catch (error) {
      console.error("Error al cargar archivos:", error);
    }
  };

  useEffect(() => {
    cargarArchivos();
  }, [usuario]);


  useEffect(() => {
    cargarArchivos();
  }, [usuario]);

  useEffect(() => {
    cargarArchivos();
  }, [usuario]);


  const handleGuardarResultado = async () => {
    if (!usuario) return;
    try {
      let archivoAFijar = selectedFile;

      // 🔍 CASO ESPECIAL: Si no hay archivo seleccionado pero sí hay datos en la tabla
      // (Significa que cargó un Excel local o creó variables en Gestión de Datos)
      if (!archivoAFijar && excelData && excelData.length > 0) {
        alerta.success("Subiendo datos...", "Tus datos locales se están guardando en la nube.");
        
        // Creamos un nombre único para esta "fuente de datos"
        const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const nombreAuto = `Datos_Calculo_${fecha}_${Math.floor(Math.random() * 1000)}.xlsx`;

        // 1. Guardamos la tabla físicamente en el servidor
        const resGuardar = await api.guardarTabla(nombreAuto, excelData, usuario.nombre);
        
        if (resGuardar && resGuardar.filename) {
          archivoAFijar = resGuardar.filename;
          setSelectedFile(archivoAFijar); // Actualizamos el estado local
          await cargarArchivos(); // Refrescamos la lista de archivos para que aparezca
        } else {
          throw new Error("No se pudo generar el archivo de respaldo en el servidor.");
        }
      }

      if (!archivoAFijar) {
        alerta.error("Sin datos", "No hay datos cargados para guardar este cálculo.");
        return;
      }

      alerta.success("Guardando...", "Registrando configuración del cálculo.");

      // 2. Guardamos en historial apuntando al archivo (ya sea el original o el auto-generado)
      await api.guardarEnHistorial(
        usuario.nombre,
        calculo,
        archivoAFijar,
        selectedColumn,
        selectedColumnY,
        selectedSheet
      );

      alerta.exito("¡Guardado!", "El cálculo y su fuente de datos han sido registrados.");
    } catch (error) {
      console.error("Error al guardar:", error);
      alerta.error("Error", error.message || "No se pudo guardar la configuración.");
    }
  };

  const esIntervalo = calculo === "distribucion_intervalos";
  const esUnidimensional = [
    "frecuencias_completas",
    "distribucion_intervalos",
    "estadistica_descriptiva",
    "tendencia_central",
    "medidas_posicion",
    "tendencia_y_posicion",
    "variabilidad_y_forma",
  ].includes(calculo);
  const esBivariada = [
    "distribucion_bivariada",
    "distribucion_bivariada_avanzada",
  ].includes(calculo);

  const rdgColumns = [];
  const addCol = (colKey, name, cssClass) => {
    if (colKey && !rdgColumns.some((c) => c.key === colKey)) {
      rdgColumns.push({
        key: colKey,
        name,
        renderEditCell: textEditor,
        editable: true,
        resizable: true,
        width: "auto",
        cellClass: cssClass,
      });
    }
  };

  if (calculo === "numeros_indices" && subTemaIndices === "compuestos") {
    addCol(colPrecioBase, `${colPrecioBase} (P₀)`, "celda-editable");
    addCol(colCantidadBase, `${colCantidadBase} (Q₀)`, "celda-editable-y");
    addCol(colPrecioActual, `${colPrecioActual} (Pt)`, "celda-editable");
    addCol(colCantidadActual, `${colCantidadActual} (Qt)`, "celda-editable-y");
  } else if (calculo === "numeros_indices" && subTemaIndices === "deflacion") {
    addCol(selectedColumn, `${selectedColumn} (Tiempo)`, "celda-editable");
    addCol(selectedColumnY, `${selectedColumnY} (Nominal)`, "celda-editable-y");
    addCol(colPrecioBase, `${colPrecioBase} (IPC)`, "celda-editable");
  } else {
    addCol(selectedColumn, `${selectedColumn} (Var X)`, "celda-editable");
    if (
      (esBivariada ||
        calculo === "regresion_simple" ||
        calculo === "series_tiempo" ||
        calculo === "numeros_indices") &&
      selectedColumnY
    ) {
      if (selectedColumn !== selectedColumnY) {
        addCol(
          selectedColumnY,
          `${selectedColumnY} (Var Y)`,
          "celda-editable-y",
        );
      }
    }
  }

  const handleGridChange = (newRows, { indexes, column }) => {
    indexes.forEach((index) => {
      handleChangeDato(index, column.key, newRows[index][column.key]);
    });
  };

  // --- RENDERIZADOR DE OPCIONES CON VARIABLES ---
  const renderOpcionesColumnas = () => (
    <>
      <optgroup label="Columnas del Excel">
        {columns.map((col) => (
          <option key={col} value={col}>
            {col}
          </option>
        ))}
      </optgroup>
      <optgroup label="Variables Capturadas">
        {variables.map((v) => (
          <option key={v.id} value={v.nombre}>
            {v.nombre}
          </option>
        ))}
      </optgroup>
    </>
  );

  return (
    <div
      className={`calculadora-layout ${panelAbierto ? "" : "colapsado"}`}
      style={{ position: "relative" }}
    >
      <button onClick={() => setPanelAbierto(!panelAbierto)} className={`boton-toggle-medio ${panelAbierto ? "abierto" : "cerrado"}`} title={panelAbierto ? "Ocultar panel" : "Mostrar panel"}>
        <span className={`icono-toggle ${panelAbierto ? 'abierto' : 'cerrado'}`} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#ffffff',
          transform: panelAbierto ? 'scaleX(1)' : 'scaleX(-1)',
          transition: 'transform 0.3s ease',
          lineHeight: 0,
          marginTop: '-2px',
          marginLeft: '-1px'
        }}>
          ❮
        </span>
      </button>
      {/* ================= IZQUIERDA: CONTROLES ================= */}
      <div className="calculadora-datos">
        <div
          style={{
            borderBottom: panelAbierto
              ? "1px solid var(--border-color)"
              : "none",
            paddingBottom: "5px",
            marginBottom: panelAbierto ? "5px" : "0",
          }}
        >
          {panelAbierto && <h3 style={{ margin: 0 }}> Datos </h3>}
        </div>

        {panelAbierto && (
          <>
            <label className="etiqueta">Selecciona un archivo:</label>
            <select
              value={selectedFile}
              onChange={(e) => {
                setSelectedFile(e.target.value);
                setModoCreacion(false);
              }}
              className="selector-archivo"
            >
              {/* Opción inicial neutra */}
              <option value="">-- Selecciona un archivo para empezar --</option>

              {files.map((file) => (
                <option key={file.filename} value={file.filename}>
                  {file.filename} ({file.author || "Desconocido"})
                </option>
              ))}
            </select>

            <ExcelContent
              filename={selectedFile}
              autor={usuario?.nombre}
              mostrarTabla={false}
              onSheetChange={setSelectedSheet}
            />

            <div className="panel-controles-excel">
              <h3 className="panel-controles-excel_h3">Calculadora de Excel</h3>

              {columns.length > 0 || variables.length > 0 ? (
                <>
                  <label>Operación:</label>
                  <select
                    value={calculo}
                    onChange={(e) => setCalculo(e.target.value)}
                    className="container_operaciones"
                  >
                    <optgroup label="Tema 2: Distribución de Frecuencias">
                      <option value="frecuencias_completas">
                        Tabla de Frecuencias
                      </option>
                      <option value="distribucion_intervalos">
                        Distribución por Intervalos
                      </option>
                    </optgroup>
                    <optgroup label="Tema 3: Tendencia y Posición">
                      <option value="estadistica_descriptiva">
                        Análisis Descriptivo
                      </option>
                      <option value="tendencia_central">
                        Medidas de Tendencia Central
                      </option>
                      <option value="medidas_posicion">
                        Medidas de Posición (Fractiles)
                      </option>
                      <option value="tendencia_y_posicion">
                        Tendencia y Posición (Conjunto)
                      </option>
                    </optgroup>
                    <optgroup label="Tema 4: Dispersión y Forma">
                      <option value="variabilidad_y_forma">
                        Análisis de Variabilidad y Forma
                      </option>
                    </optgroup>
                    <optgroup label="Tema 5: Distribuciones Bivariantes">
                      <option value="distribucion_bivariada">
                        Distribución Bivariante
                      </option>
                      <option value="distribucion_bivariada_avanzada">
                        Análisis Bivariante Avanzado
                      </option>
                    </optgroup>
                    <optgroup label="Tema 6: Regresión">
                      <option value="regresion_simple">
                        Análisis de Regresión
                      </option>
                    </optgroup>
                    <optgroup label="Tema 7: Series de Tiempo">
                      <option value="series_tiempo">
                        Pronósticos (Series de Tiempo)
                      </option>
                    </optgroup>
                    <optgroup label="Tema 8: Números Índices">
                      <option value="numeros_indices">
                        Análisis de Índices y Deflación
                      </option>
                    </optgroup>
                  </select>

                  {/* ================= CONTROLES TEMA 8: ÍNDICES ================= */}
                  {calculo === "numeros_indices" ? (
                    <div
                      style={{
                        padding: "10px",
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "4px",
                        marginBottom: "15px",
                      }}
                    >
                      <label
                        style={{
                          fontWeight: "bold",
                          color: "var(--primary-color)",
                        }}
                      >
                        Módulo de Análisis:
                      </label>
                      <select
                        value={subTemaIndices}
                        onChange={(e) => setSubTemaIndices(e.target.value)}
                        style={{
                          width: "100%",
                          marginBottom: "15px",
                          padding: "5px",
                        }}
                      >
                        <option value="compuestos">
                          1. Índices Compuestos (Laspeyres/Paasche/Fisher)
                        </option>
                        <option value="empalme">
                          2. Empalme y Cambio de Base
                        </option>
                        <option value="deflacion">
                          3. Análisis Financiero (Deflación)
                        </option>
                      </select>

                      {subTemaIndices === "compuestos" && (
                        <>
                          <label>Precio Base (P₀):</label>
                          <select
                            value={colPrecioBase}
                            onChange={(e) => setColPrecioBase(e.target.value)}
                            style={{ width: "100%", marginBottom: "5px" }}
                          >
                            {renderOpcionesColumnas()}
                          </select>
                          <label>Cantidad Base (Q₀):</label>
                          <select
                            value={colCantidadBase}
                            onChange={(e) => setColCantidadBase(e.target.value)}
                            style={{ width: "100%", marginBottom: "5px" }}
                          >
                            {renderOpcionesColumnas()}
                          </select>
                          <label>Precio Actual (Pt):</label>
                          <select
                            value={colPrecioActual}
                            onChange={(e) => setColPrecioActual(e.target.value)}
                            style={{ width: "100%", marginBottom: "5px" }}
                          >
                            {renderOpcionesColumnas()}
                          </select>
                          <label>Cantidad Actual (Qt):</label>
                          <select
                            value={colCantidadActual}
                            onChange={(e) =>
                              setColCantidadActual(e.target.value)
                            }
                            style={{ width: "100%", marginBottom: "10px" }}
                          >
                            {renderOpcionesColumnas()}
                          </select>
                        </>
                      )}
                      {subTemaIndices === "empalme" && (
                        <>
                          <label>Eje de Tiempo (Años/Meses):</label>
                          <select
                            value={selectedColumn}
                            onChange={(e) => setSelectedColumn(e.target.value)}
                            style={{ width: "100%", marginBottom: "5px" }}
                          >
                            {renderOpcionesColumnas()}
                          </select>
                          <label>Serie de Índices (Original):</label>
                          <select
                            value={selectedColumnY}
                            onChange={(e) => setSelectedColumnY(e.target.value)}
                            style={{ width: "100%", marginBottom: "15px" }}
                          >
                            {renderOpcionesColumnas()}
                          </select>
                          <label>Valor para la Nueva Base:</label>
                          <input
                            type="number"
                            step="0.1"
                            value={nuevoIndiceBase}
                            onChange={(e) => setNuevoIndiceBase(e.target.value)}
                            className="container_cal_input"
                            placeholder="Ej: 105.4"
                          />
                          <small
                            style={{
                              display: "block",
                              color: "var(--text-muted)",
                            }}
                          >
                            Ingresa el índice del año que será la nueva base.
                          </small>
                        </>
                      )}
                      {subTemaIndices === "deflacion" && (
                        <>
                          <label>Eje de Tiempo (Años/Meses):</label>
                          <select
                            value={selectedColumn}
                            onChange={(e) => setSelectedColumn(e.target.value)}
                            style={{ width: "100%", marginBottom: "5px" }}
                          >
                            {renderOpcionesColumnas()}
                          </select>
                          <label>Valor Nominal (Sueldos/Ventas):</label>
                          <select
                            value={selectedColumnY}
                            onChange={(e) => setSelectedColumnY(e.target.value)}
                            style={{ width: "100%", marginBottom: "5px" }}
                          >
                            {renderOpcionesColumnas()}
                          </select>
                          <label>Índice de Precios (IPC):</label>
                          <select
                            value={colPrecioBase}
                            onChange={(e) => setColPrecioBase(e.target.value)}
                            style={{ width: "100%", marginBottom: "5px" }}
                          >
                            {renderOpcionesColumnas()}
                          </select>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <label>
                        {calculo === "series_tiempo"
                          ? "Eje de Tiempo X:"
                          : esBivariada || calculo === "regresion_simple"
                            ? "Variable X:"
                            : "Columna Seleccionada:"}
                      </label>
                      <select
                        value={selectedColumn}
                        onChange={(e) => setSelectedColumn(e.target.value)}
                        style={{ width: "100%", marginBottom: "10px" }}
                      >
                        {renderOpcionesColumnas()}
                      </select>

                      {(esBivariada ||
                        calculo === "regresion_simple" ||
                        calculo === "series_tiempo") && (
                          <div
                            style={{
                              padding: "10px",
                              border: "1px solid var(--border-color)",
                              borderRadius: "4px",
                              marginBottom: "15px",
                              backgroundColor: "var(--bg-card)",
                            }}
                          >
                            <label
                              style={{
                                display: "block",
                                marginBottom: "5px",
                                fontWeight: "bold",
                              }}
                            >
                              {calculo === "series_tiempo"
                                ? "Valores Históricos Y (Demanda/Ventas):"
                                : "Variable Y (Dependiente):"}
                            </label>
                            <select
                              value={selectedColumnY}
                              onChange={(e) => setSelectedColumnY(e.target.value)}
                              style={{ width: "100%", padding: "5px" }}
                            >
                              <option value="">
                                -- Seleccionar Variable Y --
                              </option>
                              {renderOpcionesColumnas()}
                            </select>
                          </div>
                        )}
                    </>
                  )}

                  {calculo === "series_tiempo" && (
                    <div
                      className="container_intervalos"
                      style={{
                        padding: "10px",
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "4px",
                        marginBottom: "15px",
                      }}
                    >
                      <label
                        style={{
                          fontWeight: "bold",
                          color: "var(--primary-color)",
                        }}
                      >
                        Método de Pronóstico:
                      </label>
                      <select
                        value={metodoSeries}
                        onChange={(e) => setMetodoSeries(e.target.value)}
                        className="container_select"
                        style={{ marginBottom: "10px" }}
                      >
                        <option value="movil_simple">
                          Promedios Móviles Simples
                        </option>
                        <option value="movil_ponderado">
                          Promedios Móviles Ponderados
                        </option>
                        <option value="suavizamiento_exponencial">
                          Suavizamiento Exponencial
                        </option>
                      </select>
                      {metodoSeries === "movil_simple" && (
                        <>
                          <label>Periodos (k):</label>
                          <input
                            type="number"
                            min="2"
                            value={periodosK}
                            onChange={(e) => setPeriodosK(e.target.value)}
                            className="container_cal_input"
                          />
                        </>
                      )}
                      {metodoSeries === "movil_ponderado" && (
                        <>
                          <label>Pesos:</label>
                          <input
                            type="text"
                            value={pesos}
                            onChange={(e) => setPesos(e.target.value)}
                            className="container_cal_input"
                            placeholder="Ej: 0.5, 0.3, 0.2"
                          />
                        </>
                      )}
                      {metodoSeries === "suavizamiento_exponencial" && (
                        <>
                          <label>Alfa (α):</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="1"
                            value={alfa}
                            onChange={(e) => setAlfa(e.target.value)}
                            className="container_cal_input"
                          />
                        </>
                      )}
                    </div>
                  )}

                  {esUnidimensional &&
                    calculo !== "frecuencias_completas" &&
                    calculo !== "estadistica_descriptiva" && (
                      <div className="container_intervalos">
                        {(calculo === "distribucion_intervalos" ||
                          calculo === "tendencia_central" ||
                          calculo === "tendencia_y_posicion" ||
                          calculo === "variabilidad_y_forma") && (
                            <>
                              <label>Tipo Intervalo:</label>
                              <select
                                value={tipoIntervalo}
                                onChange={(e) => setTipoIntervalo(e.target.value)}
                                className="container_select"
                              >
                                <option value="semiabierto">[a, b)</option>
                                <option value="cerrado">[a, b]</option>
                                <option value="abierto">(a, b)</option>
                              </select>
                              <label>Método K:</label>
                              <select
                                value={metodoK}
                                onChange={(e) => setMetodoK(e.target.value)}
                                className="container_select"
                              >
                                <option value="sturges">Sturges</option>
                                <option value="cuadratica">Cuadrática</option>
                                <option value="logaritmica">Logarítmica</option>
                                <option value="personalizada">Manual</option>
                              </select>
                              {metodoK === "personalizada" && (
                                <input
                                  type="number"
                                  value={kPersonalizado}
                                  onChange={(e) =>
                                    setKPersonalizado(e.target.value)
                                  }
                                  placeholder="Valor k"
                                  className="container_cal_input"
                                />
                              )}
                            </>
                          )}
                        {(calculo === "medidas_posicion" ||
                          calculo === "tendencia_y_posicion") && (
                            <div className="container_cal_percentil">
                              <label>Percentil (1 - 99):</label>
                              <input
                                type="number"
                                min="1"
                                max="99"
                                value={percentilK}
                                onChange={(e) => setPercentilK(e.target.value)}
                              />
                            </div>
                          )}
                      </div>
                    )}

                  {mostrarTabla && excelData.length > 0 && (
                    <div
                      className=".container_dataset"
                      style={{ marginTop: "10px" }}
                    >
                      <p className="info_vista">
                        Vista Previa (Doble clic para editar):
                      </p>
                      <DataGrid
                        columns={rdgColumns}
                        rows={excelData}
                        onRowsChange={handleGridChange}
                        className="rdg-light"
                        style={{
                          blockSize: "100%",
                          border: "1px solid var(--border-color)",
                          height: "400px",
                          textAlign: "center",
                        }}
                      />
                    </div>
                  )}
                  <button
                    onClick={ejecutarCalculo}
                    className="button_calcular"
                    style={{ marginTop: "15px" }}
                  >
                    CALCULAR
                  </button>
                </>
              ) : (
                <p className="info_cargando">
                  Cargando datos o selecciona un archivo...
                </p>
              )}
            </div>
            <br />
            <br />
            <br />
            <button
              onClick={() => setModoCreacion(!modoCreacion)}
              className="button_resultados"
              style={{
                backgroundColor: modoCreacion
                  ? "var(--text-muted)"
                  : "var(--accent-color)",
              }}
            >
              {modoCreacion ? "Volver a Resultados" : "Crear Tabla de Datos"}
            </button>
            <br />
            <button
              onClick={() => setMostrarCalculadora(!mostrarCalculadora)}
              style={{ width: "100%", padding: "8px", background: "#6b7280" }}
            >
              {mostrarCalculadora
                ? "Ocultar Calculadora Manual"
                : "Mostrar Calculadora Manual"}
            </button>
            {mostrarCalculadora && <Calculator />}
          </>
        )}
      </div>

      {/* ================= DERECHA: RESULTADOS ================= */}
      <div className="calculadora-resultados">
        {modoCreacion ? (
          <TablaDinamica
            onTablaCreada={() => {
              cargarArchivos();
              setModoCreacion(false);
            }}
          />
        ) : !resultado && !errorNumerico ? (

          /* 🆕 ESTADO DE ESPERA: Ahora usa clases de CSS */
          <div className="contenedor-espera-logo">
            <img
              src={escudoAdmin}
              alt="Escudo Administración de Empresas"
              className="logo-espera"
            />
          </div>
        ) : (

          /* 🆕 ESTADO CON DATOS: Muestra las tablas cuando ya hay un cálculo */
          <div className="contenedor-resultados-vacio">
            <div className="frecuencias">
                <div style={{ marginBottom: "15px" }}>
                  <h3 style={{ margin: 0 }}>
                    Resultados: {calculo.replace(/_/g, " ").toUpperCase()}
                  </h3>
                </div>

              {errorNumerico && (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#d9534f",
                    backgroundColor: "rgba(217, 83, 79, 0.1)",
                    borderRadius: "8px",
                    border: "1px solid #d9534f",
                    marginBottom: "15px",
                  }}
                >
                  <p style={{ margin: "0" }}>
                    ⚠️ Error: Faltan datos numéricos o hay celdas de texto en el
                    cálculo actual.
                  </p>
                </div>
              )}

              {resultado && (
                <>
                  {calculo === "regresion_simple" &&
                    resultado.tipo === "regresion" && (
                      <TablaRegresion resultado={resultado} />
                    )}
                  {calculo === "series_tiempo" &&
                    resultado.tipo === "series_tiempo" && (
                      <TablaSeriesTiempo resultado={resultado} />
                    )}
                  {calculo === "numeros_indices" &&
                    [
                      "indices_compuestos",
                      "operaciones_indices",
                      "deflacion_financiera",
                    ].includes(resultado.tipo) && (
                      <TablaIndices resultado={resultado} />
                    )}
                  {esBivariada &&
                    resultado.tipo === "distribucion_bivariada" && (
                      <TablasBivariantes
                        resultado={resultado}
                        formatearCelda={formatearCelda}
                      />
                    )}
                  {esUnidimensional &&
                    (!resultado.tipo ||
                      [
                        "tendencia_y_posicion",
                        "variabilidad_y_forma",
                        "estadistica_descriptiva",
                      ].includes(resultado.tipo)) && (
                      <TablasUnidimensionales
                        resultado={resultado}
                        calculo={calculo}
                        formatearCelda={formatearCelda}
                        filtroFractil={filtroFractil}
                        setFiltroFractil={setFiltroFractil}
                      />
                    )}
                </>
              )}
            </div>

            <PanelGraficos resultado={resultado} esIntervalo={esIntervalo} calculo={calculo} />

            {/* 🆕 BARRA DE ACCIONES FINAL (UNIFICADA) */}
            <div className="barra-acciones-final">
              <button
                onClick={() => generarPDFReporte("reporte-formal-pdf", `Reporte_${calculo}`)}
                className="btn-icon"
                style={{ backgroundColor: '#d9534f', color: 'white', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                <IconoPDF /> Exportar PDF
              </button>

              <button
                onClick={handleGuardarResultado}
                className="btn-icon"
                style={{ backgroundColor: 'var(--primary-color)', color: 'white', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                <IconoGuardar /> Guardar Cálculo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 🆕 AQUÍ PEGAS EL COMPONENTE OCULTO (Antes de cerrar el div principal) */}
      {/* ======================================================== */}
      <div style={{ position: "fixed", left: "200vw", top: "200vh", opacity: 0, pointerEvents: "none" }}>
        <div
          id="reporte-formal-pdf"
          style={{
            width: "8.5in",
            minHeight: "11in",
            padding: "0.8in",
            backgroundColor: "white",
            color: "black",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {/* ENCABEZADO INSTITUCIONAL */}
          <div
            className="pdf-section"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "2px solid #000",
              paddingBottom: "10px",
              marginBottom: "20px",
            }}
          >
            <img src={escudoAdmin} style={{ width: "1in" }} alt="USFX" />
            <div style={{ textAlign: "center", flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: "16pt" }}>
                UNIVERSIDAD DE SAN FRANCISCO XAVIER
              </h2>
              <h3 style={{ margin: 0, fontSize: "14pt" }}>
                Facultad de Ciencias Económicas y Empresariales
              </h3>
              <p style={{ margin: 0, fontSize: "10pt" }}>
                Carrera: Administración de Empresas
              </p>
            </div>
            <div style={{ width: "1in" }}></div>
          </div>

          {/* DATOS DEL REPORTE */}
          <div className="pdf-section" style={{ marginBottom: "20px" }}>
            <h1
              style={{
                textAlign: "center",
                textDecoration: "underline",
                fontSize: "18pt",
              }}
            >
              REPORTE ESTADÍSTICO
            </h1>
            <div
              style={{
                marginTop: "20px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                fontSize: "11pt",
              }}
            >
              <p>
                <strong>Responsable:</strong> Diego Armando Coa Veliz
              </p>
              <p>
                <strong>Fecha:</strong> {new Date().toLocaleDateString()}
              </p>
              <p>
                <strong>Cálculo:</strong>{" "}
                {calculo.replace(/_/g, " ").toUpperCase()}
              </p>
              <p>
                <strong>Sede:</strong> Sucre, Bolivia
              </p>
            </div>
          </div>

          {/* CONTENIDO (Inyectamos las tablas) */}
          <div id="contenido-pdf-dinamico">
            <div className="pdf-section">
              <p style={{ fontStyle: "italic", marginBottom: "15px" }}>
                Este documento contiene el análisis estadístico detallado generado
                por el sistema.
              </p>
            </div>

            {/* Aquí repetimos los mismos if que dibujan las tablas, 
                      para que se rendericen dentro del PDF */}
            {resultado && (
              <>
                {calculo === "regresion_simple" &&
                  resultado.tipo === "regresion" && (
                    <div className="pdf-section">
                      <TablaRegresion resultado={resultado} />
                    </div>
                  )}
                {calculo === "series_tiempo" &&
                  resultado.tipo === "series_tiempo" && (
                    <div className="pdf-section">
                      <TablaSeriesTiempo resultado={resultado} />
                    </div>
                  )}
                {calculo === "numeros_indices" &&
                  [
                    "indices_compuestos",
                    "operaciones_indices",
                    "deflacion_financiera",
                  ].includes(resultado.tipo) && (
                    <div className="pdf-section">
                      <TablaIndices resultado={resultado} />
                    </div>
                  )}
                {esBivariada && resultado.tipo === "distribucion_bivariada" && (
                  <div className="pdf-section">
                    <TablasBivariantes
                      resultado={resultado}
                      formatearCelda={formatearCelda}
                    />
                  </div>
                )}
                {esUnidimensional &&
                  (!resultado.tipo ||
                    [
                      "tendencia_y_posicion",
                      "variabilidad_y_forma",
                      "estadistica_descriptiva",
                    ].includes(resultado.tipo)) && (
                    <div className="pdf-section">
                      <TablasUnidimensionales
                        resultado={resultado}
                        calculo={calculo}
                        formatearCelda={formatearCelda}
                        filtroFractil={filtroFractil}
                        setFiltroFractil={setFiltroFractil}
                      />
                    </div>
                  )}

                {/* También incluimos los gráficos para que salgan en el PDF */}
                <div>
                  <PanelGraficos
                    resultado={resultado}
                    esIntervalo={esIntervalo}
                    calculo={calculo}
                  />
                </div>
              </>
            )}
          </div>

          {/* PIE DE PÁGINA */}
          <div
            className="pdf-section"
            style={{
              marginTop: "50px",
              borderTop: "1px solid #ccc",
              paddingTop: "10px",
              fontSize: "9pt",
              textAlign: "center",
            }}
          >
            Software Estadístico - Trabajo Dirigido USFX © 2026
          </div>
        </div>
      </div>

    </div>
  );
}
