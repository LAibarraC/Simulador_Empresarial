import { useEffect, useState } from "react";
import { DataGrid } from "react-data-grid";
import "react-data-grid/lib/styles.css";

// --- IMPORTS ---

import Calculator from "../components/excel/Calculator";
import ExcelContent from "../components/excel/ExcelContent";
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

function textEditor({ row, column, onRowChange, onClose }) {
  return (
    <input
      className="editor_text"
      autoFocus
      value={row[column.key]}
      onChange={(e) => onRowChange({ ...row, [column.key]: e.target.value })}
      onBlur={() => onClose(true)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.stopPropagation();
        }
      }}
    />
  );
}

export default function Calculos() {
  const { variables } = useData();

  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedSheet, setSelectedSheet] = useState(0);

  const [mostrarTabla, _setMostrarTabla] = useState(true);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
  const [filtroFractil, setFiltroFractil] = useState("Cuartil");
  const [panelAbierto, setPanelAbierto] = useState(true);

  const {
    excelData, columns, selectedColumn, setSelectedColumn, selectedColumnY, setSelectedColumnY,
    resultado, calculo, setCalculo, tipoIntervalo, setTipoIntervalo, metodoK, setMetodoK,
    kPersonalizado, setKPersonalizado, percentilK, setPercentilK,
    handleChangeDato, ejecutarCalculo, errorNumerico,

    metodoSeries, setMetodoSeries, periodosK, setPeriodosK, pesos, setPesos, alfa, setAlfa,
    subTemaIndices, setSubTemaIndices, colPrecioBase, setColPrecioBase, colCantidadBase, setColCantidadBase,
    colPrecioActual, setColPrecioActual, colCantidadActual, setColCantidadActual, nuevoIndiceBase, setNuevoIndiceBase
  } = useCalculadoraExcel(selectedFile, selectedSheet);

  const formatearCelda = (valor) => {
    if (typeof valor === "number") return Number.isInteger(valor) ? valor : Number(valor).toFixed(2);
    if (!isNaN(parseFloat(valor)) && isFinite(valor)) {
      const num = Number(valor);
      return Number.isInteger(num) ? num : num.toFixed(2);
    }
    return valor;
  };

  const cargarArchivos = async () => {
    try {
      const data = await api.obtenerArchivos();
      if (data && data.files) {
        setFiles(data.files);
        if (data.files.length > 0 && !selectedFile) setSelectedFile(data.files[0].filename);
      }
    } catch (error) {
      console.error("Error al cargar archivos:", error);
    }
  };

  useEffect(() => {
    cargarArchivos();
  }, []);

  const esIntervalo = calculo === "distribucion_intervalos";
  const esUnidimensional = ["frecuencias_completas", "distribucion_intervalos", "estadistica_descriptiva", "tendencia_central", "medidas_posicion", "tendencia_y_posicion", "variabilidad_y_forma"].includes(calculo);
  const esBivariada = ["distribucion_bivariada", "distribucion_bivariada_avanzada"].includes(calculo);

  const rdgColumns = [];
  const addCol = (colKey, name, cssClass) => {
    if (colKey && !rdgColumns.some((c) => c.key === colKey)) {
      rdgColumns.push({
        key: colKey, name, renderEditCell: textEditor, editable: true, resizable: true, width: "auto", cellClass: cssClass,
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
    if ((esBivariada || calculo === "regresion_simple" || calculo === "series_tiempo" || calculo === "numeros_indices") && selectedColumnY) {
      if (selectedColumn !== selectedColumnY) {
        addCol(selectedColumnY, `${selectedColumnY} (Var Y)`, "celda-editable-y");
      }
    }
  }

  const handleGridChange = (newRows, { indexes, column }) => {
    indexes.forEach(index => {
      handleChangeDato(index, column.key, newRows[index][column.key]);
    });
  };

  // --- RENDERIZADOR DE OPCIONES CON VARIABLES ---
  const renderOpcionesColumnas = () => (
    <>
      <optgroup label="Columnas del Excel">
        {columns.map((col) => <option key={col} value={col}>{col}</option>)}
      </optgroup>
      <optgroup label="Variables Capturadas">
        {variables.map((v) => <option key={v.id} value={v.nombre}>{v.nombre}</option>)}
      </optgroup>
    </>
  );

  return (
    <div className={`calculadora-layout ${panelAbierto ? "" : "colapsado"}`} style={{ position: "relative" }}>
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
        <div style={{ borderBottom: panelAbierto ? "1px solid var(--border-color)" : "none", paddingBottom: "5px", marginBottom: panelAbierto ? "5px" : "0" }}>
          {panelAbierto && <h3 style={{ margin: 0 }}> Datos </h3>}
        </div>

        {panelAbierto && (
          <>
            <label className="etiqueta">Selecciona un archivo:</label>
            <select value={selectedFile} onChange={(e) => { setSelectedFile(e.target.value); }} className="selector-archivo">
              {files.map((file) => <option key={file.filename} value={file.filename}>{file.filename} ({file.author || "Desconocido"})</option>)}
            </select>

            <ExcelContent filename={selectedFile} mostrarTabla={false} onSheetChange={setSelectedSheet} />

            <div className="panel-controles-excel">
              <h3 className="panel-controles-excel_h3">Calculadora de Excel</h3>

              {columns.length > 0 || variables.length > 0 ? (
                <>
                  <label>Operación:</label>
                  <select value={calculo} onChange={(e) => setCalculo(e.target.value)} className="container_operaciones">
                    <optgroup label="Tema 2: Distribución de Frecuencias">
                      <option value="frecuencias_completas">Tabla de Frecuencias</option>
                      <option value="distribucion_intervalos">Distribución por Intervalos</option>
                    </optgroup>
                    <optgroup label="Tema 3: Tendencia y Posición">
                      <option value="estadistica_descriptiva">Análisis Descriptivo</option>
                      <option value="tendencia_central">Medidas de Tendencia Central</option>
                      <option value="medidas_posicion">Medidas de Posición (Fractiles)</option>
                      <option value="tendencia_y_posicion">Tendencia y Posición (Conjunto)</option>
                    </optgroup>
                    <optgroup label="Tema 4: Dispersión y Forma">
                      <option value="variabilidad_y_forma">Análisis de Variabilidad y Forma</option>
                    </optgroup>
                    <optgroup label="Tema 5: Distribuciones Bivariantes">
                      <option value="distribucion_bivariada">Distribución Bivariante</option>
                      <option value="distribucion_bivariada_avanzada">Análisis Bivariante Avanzado</option>
                    </optgroup>
                    <optgroup label="Tema 6: Regresión">
                      <option value="regresion_simple">Análisis de Regresión</option>
                    </optgroup>
                    <optgroup label="Tema 7: Series de Tiempo">
                      <option value="series_tiempo">Pronósticos (Series de Tiempo)</option>
                    </optgroup>
                    <optgroup label="Tema 8: Números Índices">
                      <option value="numeros_indices">Análisis de Índices y Deflación</option>
                    </optgroup>
                  </select>

                  {/* ================= CONTROLES TEMA 8: ÍNDICES ================= */}
                  {calculo === "numeros_indices" ? (
                    <div style={{ padding: "10px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "4px", marginBottom: "15px" }}>
                      <label style={{ fontWeight: "bold", color: "var(--primary-color)" }}>Módulo de Análisis:</label>
                      <select value={subTemaIndices} onChange={(e) => setSubTemaIndices(e.target.value)} style={{ width: "100%", marginBottom: "15px", padding: "5px" }}>
                        <option value="compuestos">1. Índices Compuestos (Laspeyres/Paasche/Fisher)</option>
                        <option value="empalme">2. Empalme y Cambio de Base</option>
                        <option value="deflacion">3. Análisis Financiero (Deflación)</option>
                      </select>

                      {subTemaIndices === "compuestos" && (
                        <>
                          <label>Precio Base (P₀):</label>
                          <select value={colPrecioBase} onChange={(e) => setColPrecioBase(e.target.value)} style={{ width: "100%", marginBottom: "5px" }}>{renderOpcionesColumnas()}</select>
                          <label>Cantidad Base (Q₀):</label>
                          <select value={colCantidadBase} onChange={(e) => setColCantidadBase(e.target.value)} style={{ width: "100%", marginBottom: "5px" }}>{renderOpcionesColumnas()}</select>
                          <label>Precio Actual (Pt):</label>
                          <select value={colPrecioActual} onChange={(e) => setColPrecioActual(e.target.value)} style={{ width: "100%", marginBottom: "5px" }}>{renderOpcionesColumnas()}</select>
                          <label>Cantidad Actual (Qt):</label>
                          <select value={colCantidadActual} onChange={(e) => setColCantidadActual(e.target.value)} style={{ width: "100%", marginBottom: "10px" }}>{renderOpcionesColumnas()}</select>
                        </>
                      )}
                      {subTemaIndices === "empalme" && (
                        <>
                          <label>Eje de Tiempo (Años/Meses):</label>
                          <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} style={{ width: "100%", marginBottom: "5px" }}>{renderOpcionesColumnas()}</select>
                          <label>Serie de Índices (Original):</label>
                          <select value={selectedColumnY} onChange={(e) => setSelectedColumnY(e.target.value)} style={{ width: "100%", marginBottom: "15px" }}>{renderOpcionesColumnas()}</select>
                          <label>Valor para la Nueva Base:</label>
                          <input type="number" step="0.1" value={nuevoIndiceBase} onChange={(e) => setNuevoIndiceBase(e.target.value)} className="container_cal_input" placeholder="Ej: 105.4" />
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
                          <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} style={{ width: "100%", marginBottom: "5px" }}>{renderOpcionesColumnas()}</select>
                          <label>Valor Nominal (Sueldos/Ventas):</label>
                          <select value={selectedColumnY} onChange={(e) => setSelectedColumnY(e.target.value)} style={{ width: "100%", marginBottom: "5px" }}>{renderOpcionesColumnas()}</select>
                          <label>Índice de Precios (IPC):</label>
                          <select value={colPrecioBase} onChange={(e) => setColPrecioBase(e.target.value)} style={{ width: "100%", marginBottom: "5px" }}>{renderOpcionesColumnas()}</select>
                        </>
                      )}
                    </div>
                  ) : (
                    /* ==============================================
                       CONTROLES TEMAS ANTERIORES (Regresión, Series, etc)
                       ============================================== */
                    <>
                      <label>
                        {calculo === "series_tiempo" ? "Eje de Tiempo X:" : esBivariada || calculo === "regresion_simple" ? "Variable X:" : "Columna Seleccionada:"}
                      </label>
                      <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} style={{ width: "100%", marginBottom: "10px" }}>
                        {renderOpcionesColumnas()}
                      </select>

                      {(esBivariada || calculo === "regresion_simple" || calculo === "series_tiempo") && (
                        <div style={{ padding: "10px", border: "1px solid var(--border-color)", borderRadius: "4px", marginBottom: "15px", backgroundColor: "var(--bg-card)" }}>
                          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                            {calculo === "series_tiempo" ? "Valores Históricos Y (Demanda/Ventas):" : "Variable Y (Dependiente):"}
                          </label>
                          <select value={selectedColumnY} onChange={(e) => setSelectedColumnY(e.target.value)} style={{ width: "100%", padding: "5px" }}>
                            <option value="">-- Seleccionar Variable Y --</option>
                            {renderOpcionesColumnas()}
                          </select>
                        </div>
                      )}
                    </>
                  )}

                  {/* CONTROLES EXTRA TEMA 7 */}
                  {calculo === "series_tiempo" && (
                    <div className="container_intervalos" style={{ padding: "10px", backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "4px", marginBottom: "15px" }}>
                      <label style={{ fontWeight: "bold", color: "var(--primary-color)" }}>Método de Pronóstico:</label>
                      <select value={metodoSeries} onChange={(e) => setMetodoSeries(e.target.value)} className="container_select" style={{ marginBottom: "10px" }}>
                        <option value="movil_simple">Promedios Móviles Simples</option>
                        <option value="movil_ponderado">Promedios Móviles Ponderados</option>
                        <option value="suavizamiento_exponencial">Suavizamiento Exponencial</option>
                      </select>
                      {metodoSeries === "movil_simple" && (
                        <><label>Periodos (k):</label><input type="number" min="2" value={periodosK} onChange={(e) => setPeriodosK(e.target.value)} className="container_cal_input" /></>
                      )}
                      {metodoSeries === "movil_ponderado" && (
                        <><label>Pesos:</label><input type="text" value={pesos} onChange={(e) => setPesos(e.target.value)} className="container_cal_input" placeholder="Ej: 0.5, 0.3, 0.2" /></>
                      )}
                      {metodoSeries === "suavizamiento_exponencial" && (
                        <><label>Alfa (α):</label><input type="number" step="0.01" min="0" max="1" value={alfa} onChange={(e) => setAlfa(e.target.value)} className="container_cal_input" /></>
                      )}
                    </div>
                  )}

                  {/* CONTROLES EXTRA TEMAS 2, 3, 4 */}
                  {esUnidimensional && calculo !== "frecuencias_completas" && calculo !== "estadistica_descriptiva" && (
                    <div className="container_intervalos">
                      {(calculo === "distribucion_intervalos" || calculo === "tendencia_central" || calculo === "tendencia_y_posicion" || calculo === "variabilidad_y_forma") && (
                        <>
                          <label>Tipo Intervalo:</label>
                          <select value={tipoIntervalo} onChange={(e) => setTipoIntervalo(e.target.value)} className="container_select">
                            <option value="semiabierto">[a, b)</option>
                            <option value="cerrado">[a, b]</option>
                            <option value="abierto">(a, b)</option>
                          </select>
                          <label>Método K:</label>
                          <select value={metodoK} onChange={(e) => setMetodoK(e.target.value)} className="container_select">
                            <option value="sturges">Sturges</option>
                            <option value="cuadratica">Cuadrática</option>
                            <option value="logaritmica">Logarítmica</option>
                            <option value="personalizada">Manual</option>
                          </select>
                          {metodoK === "personalizada" && <input type="number" value={kPersonalizado} onChange={(e) => setKPersonalizado(e.target.value)} placeholder="Valor k" className="container_cal_input" />}
                        </>
                      )}
                      {(calculo === "medidas_posicion" || calculo === "tendencia_y_posicion") && (
                        <div className="container_cal_percentil">
                          <label>Percentil (1 - 99):</label>
                          <input type="number" min="1" max="99" value={percentilK} onChange={(e) => setPercentilK(e.target.value)} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* VISTA PREVIA Y BOTÓN CALCULAR */}
                  {mostrarTabla && excelData.length > 0 && (
                    <div className=".container_dataset" style={{ marginTop: "10px" }}>
                      <p className="info_vista">Vista Previa (Doble clic para editar):</p>
                      <DataGrid
                        columns={rdgColumns}
                        rows={excelData}
                        onRowsChange={handleGridChange}
                        className="rdg-light"
                        style={{
                          blockSize: "100%",
                          border: "1px solid var(--border-color)",
                          height: "350px",
                          maxHeight: "75vh",
                          textAlign: "center"
                        }} />
                    </div>
                  )}
                  <button onClick={ejecutarCalculo} className="button_calcular" style={{ marginTop: "15px" }}>CALCULAR</button>
                </>
              ) : (
                <p className="info_cargando">Cargando datos o selecciona un archivo...</p>
              )}
            </div>
            <br />
            <button onClick={() => setMostrarCalculadora(!mostrarCalculadora)} style={{ width: "100%", padding: "8px", background: "#6b7280" }}>
              {mostrarCalculadora ? "Ocultar Calculadora Manual" : "Mostrar Calculadora Manual"}
            </button>
            {mostrarCalculadora && <Calculator />}
          </>
        )}
      </div>

      {/* ================= DERECHA: RESULTADOS ================= */}
      <div className="calculadora-resultados">
          <>
            <div className="frecuencias">
              <h3>Resultados: {calculo.replace(/_/g, " ").toUpperCase()}</h3>

              {errorNumerico && (
                <div style={{ padding: "20px", textAlign: "center", color: "#d9534f", backgroundColor: "rgba(217, 83, 79, 0.1)", borderRadius: "8px", border: "1px solid #d9534f", marginBottom: "15px" }}>
                  <p style={{ margin: "0" }}>⚠️ Error: Faltan datos numéricos o hay celdas de texto en el cálculo actual.</p>
                </div>
              )}

              {resultado ? (
                <>
                  {/* Tema 6: Regresión */}
                  {calculo === "regresion_simple" && resultado.tipo === "regresion" && <TablaRegresion resultado={resultado} />}

                  {/* Tema 7: Series de Tiempo */}
                  {calculo === "series_tiempo" && resultado.tipo === "series_tiempo" && <TablaSeriesTiempo resultado={resultado} />}

                  {/* Tema 8: Números Índices */}
                  {calculo === "numeros_indices" && ["indices_compuestos", "operaciones_indices", "deflacion_financiera"].includes(resultado.tipo) && (
                    <TablaIndices resultado={resultado} />
                  )}

                  {/* Tema 5: Bivariantes */}
                  {esBivariada && ["bivariada", "bivariada_avanzada"].includes(resultado.tipo) && (
                    <TablasBivariantes resultado={resultado} formatearCelda={formatearCelda} />
                  )}

                  {/* Temas 2, 3 y 4: Unidimensionales */}
                  {esUnidimensional && (!resultado.tipo || ["tendencia_y_posicion", "variabilidad_y_forma", "estadistica_descriptiva"].includes(resultado.tipo)) && (
                    <TablasUnidimensionales
                      resultado={resultado}
                      calculo={calculo}
                      formatearCelda={formatearCelda}
                      filtroFractil={filtroFractil}
                      setFiltroFractil={setFiltroFractil} />
                  )}
                </>
              ) : (
                !errorNumerico &&
                <p style={{ color: "var(--text-muted)" }}>
                  Configura los parámetros a la izquierda y presiona Calcular.
                </p>
              )}
            </div>
            {resultado && calculo !== "estadistica_descriptiva" &&
              calculo !== "tendencia_central" &&
              calculo !== "distribucion_bivariada_avanzada" &&
              calculo !== "medidas_posicion" && (
                <PanelGraficos resultado={resultado} esIntervalo={esIntervalo} />
              )}
          </>
      </div>
    </div>
  );
}