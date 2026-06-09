import React from "react";
import escudoAdmin from "../../assets/images/simuledu.png";
import TablaRegresion from "./TablaRegresion";
import TablaSeriesTiempo from "./TablaSeriesTiempo";
import TablaIndices from "./TablaIndices";
import TablasBivariantes from "./TablasBivariantes";
import TablasUnidimensionales from "./TablasUnidimensionales";
import PanelGraficos from "./PanelGraficos";

export default function ReportePDF({ 
  usuario, calculo, selectedFile, selectedSheet, selectedColumn, 
  resultado, esBivariada, esUnidimensional, esIntervalo,
  formatearCelda, filtroFractil, setFiltroFractil, ordenGraficos,
  parametros // Agrupamos los parámetros técnicos aquí
}) {
  const {
    tipoIntervalo, metodoK, kPersonalizado, percentilK,
    metodoSeries, periodosK, pesos, alfa,
    subTemaIndices, colPrecioBase, colCantidadBase, nuevoIndiceBase
  } = parametros;

  return (
    <div style={{ position: "fixed", left: "200vw", top: "200vh", opacity: 0, pointerEvents: "none" }}>
      <div
        id="reporte-formal-pdf"
        style={{ width: "8.5in", minHeight: "11in", padding: "0.8in", backgroundColor: "white", color: "black", fontFamily: "Arial, sans-serif" }}
      >
        {/* ENCABEZADO INSTITUCIONAL */}
        <div className="pdf-section" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #000", paddingBottom: "10px", marginBottom: "20px" }}>
          <img src={escudoAdmin} style={{ width: "1in" }} alt="USFX" />
          <div style={{ textAlign: "center", flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: "16pt" }}>UNIVERSIDAD DE SAN FRANCISCO XAVIER</h2>
            <h3 style={{ margin: 0, fontSize: "14pt" }}>Facultad de Ciencias Económicas y Empresariales</h3>
            <p style={{ margin: 0, fontSize: "10pt" }}>Carrera: Administración de Empresas</p>
          </div>
          <div style={{ width: "1in" }}></div>
        </div>

        {/* FICHA TÉCNICA */}
        <div className="pdf-section" style={{ marginBottom: "30px", backgroundColor: "#f9f9f9", padding: "15px", borderRadius: "8px", border: "1px solid #ddd" }}>
          <h1 style={{ textAlign: "center", fontSize: "16pt", margin: "0 0 15px 0", color: "#2c3e50" }}>
            ANÁLISIS ESTADÍSTICO: {calculo.replace(/_/g, " ").toUpperCase()}
          </h1>

          <table style={{ width: "100%", fontSize: "10pt", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "4px 0", fontWeight: "bold", width: "25%" }}>Responsable:</td>
                <td style={{ padding: "4px 0", width: "25%" }}>{usuario?.nombre || "Diego Armando Coa Veliz"}</td>
                <td style={{ padding: "4px 0", fontWeight: "bold", width: "25%" }}>Fecha de Emisión:</td>
                <td style={{ padding: "4px 0", width: "25%" }}>{new Date().toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", fontWeight: "bold" }}>Archivo Origen:</td>
                <td style={{ padding: "4px 0" }}>{selectedFile || "N/A"}</td>
                <td style={{ padding: "4px 0", fontWeight: "bold" }}>Hoja de Trabajo:</td>
                <td style={{ padding: "4px 0" }}>{selectedSheet || "N/A"}</td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", fontWeight: "bold" }}>Variable Analizada:</td>
                <td colSpan="3" style={{ padding: "4px 0", color: "#d9534f", fontWeight: "bold" }}>{selectedColumn || "N/A"}</td>
              </tr>
            </tbody>
          </table>

          {/* PARÁMETROS DINÁMICOS */}
          <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed #ccc", display: "flex", gap: "20px", fontSize: "9pt", color: "#555", flexWrap: "wrap" }}>
            {["frecuencias_completas", "distribucion_intervalos", "tendencia_y_posicion", "variabilidad_y_forma"].includes(calculo) && (
              <>
                {calculo !== "frecuencias_completas" && (
                  <>
                    <span><strong>Tipo de Intervalo:</strong> {tipoIntervalo === "cerrado" ? "[a, b]" : tipoIntervalo === "abierto" ? "(a, b)" : "[a, b)"}</span>
                    <span><strong>Método K:</strong> {metodoK === "personalizada" ? `Manual (${kPersonalizado})` : metodoK.charAt(0).toUpperCase() + metodoK.slice(1)}</span>
                  </>
                )}
                {calculo === "tendencia_y_posicion" && percentilK && <span><strong>Percentil de Referencia:</strong> {percentilK}</span>}
              </>
            )}

            {calculo === "series_tiempo" && (
              <>
                <span style={{ textTransform: "capitalize" }}><strong>Método de Pronóstico:</strong> {metodoSeries.replace(/_/g, " ")}</span>
                {metodoSeries === "movil_simple" && <span><strong>Periodos (k):</strong> {periodosK}</span>}
                {metodoSeries === "movil_ponderado" && <span><strong>Pesos:</strong> {pesos}</span>}
                {metodoSeries === "suavizamiento_exponencial" && <span><strong>Alfa (α):</strong> {alfa}</span>}
              </>
            )}

            {calculo === "numeros_indices" && (
              <>
                <span style={{ textTransform: "capitalize" }}><strong>Módulo de Índices:</strong> {subTemaIndices}</span>
                {subTemaIndices === "compuestos" && <span><strong>Base:</strong> P₀ ({colPrecioBase}), Q₀ ({colCantidadBase})</span>}
                {subTemaIndices === "empalme" && <span><strong>Año de Nueva Base:</strong> {nuevoIndiceBase}</span>}
                {subTemaIndices === "deflacion" && <span><strong>Índice Deflactor (IPC):</strong> {colPrecioBase}</span>}
              </>
            )}
          </div>
        </div>

        {/* CONTENIDO DE TABLAS Y GRÁFICOS */}
        <div id="contenido-pdf-dinamico">
          <div className="pdf-section">
            <p style={{ fontStyle: "italic", marginBottom: "15px" }}>Este documento contiene el análisis estadístico detallado generado por el sistema.</p>
          </div>

          {resultado && (
            <>
              {calculo === "regresion_simple" && resultado.tipo === "regresion" && (
                <div className="pdf-section"><TablaRegresion resultado={resultado} /></div>
              )}
              {calculo === "series_tiempo" && resultado.tipo === "series_tiempo" && (
                <div className="pdf-section"><TablaSeriesTiempo resultado={resultado} /></div>
              )}
              {calculo === "numeros_indices" && ["indices_compuestos", "operaciones_indices", "deflacion_financiera"].includes(resultado.tipo) && (
                <div className="pdf-section"><TablaIndices resultado={resultado} /></div>
              )}
              {esBivariada && resultado.tipo === "distribucion_bivariada" && (
                <div className="pdf-section"><TablasBivariantes resultado={resultado} formatearCelda={formatearCelda} /></div>
              )}
              {esUnidimensional && (!resultado.tipo || ["tendencia_y_posicion", "variabilidad_y_forma", "estadistica_descriptiva"].includes(resultado.tipo)) && (
                <div className="pdf-section">
                  <TablasUnidimensionales resultado={resultado} calculo={calculo} formatearCelda={formatearCelda} filtroFractil={filtroFractil} setFiltroFractil={setFiltroFractil} modoImpresion={true} />
                </div>
              )}

              <div>
                <PanelGraficos resultado={resultado} esIntervalo={esIntervalo} calculo={calculo} orden={ordenGraficos} />
              </div>
            </>
          )}
        </div>

        <div className="pdf-section" style={{ marginTop: "50px", borderTop: "1px solid #ccc", paddingTop: "10px", fontSize: "9pt", textAlign: "center" }}>
          Software Estadístico - Trabajo Dirigido USFX © 2026
        </div>
      </div>
    </div>
  );
}