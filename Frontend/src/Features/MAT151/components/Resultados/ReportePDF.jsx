import React from "react";
import escudoDorado from "../../../../assets/images/escudo-dorado.png";
import TablaRegresion from "./TablaRegresion";
import TablaSeriesTiempo from "./TablaSeriesTiempo";
import TablaIndices from "./TablaIndices";
import TablasBivariantes from "./TablasBivariantes";
import TablasUnidimensionales from "./TablasUnidimensionales";
import PanelGraficos from "./PanelGraficos";

export default function ReportePDF({ 
  usuario, calculo, selectedFile, selectedSheet, selectedColumn, selectedColumnY,
  resultado, esBivariada, esUnidimensional, esIntervalo,
  formatearCelda, filtroFractil, setFiltroFractil, ordenGraficos,
  tablasDesarrolloReporte,
  modelosVisibles,
  parametros 
}) {
  const {
    tipoIntervalo, metodoK, kPersonalizado, percentilK,
    metodoSeries, periodosK, pesos, alfa,
    subTemaIndices, colPrecioBase, colCantidadBase, nuevoIndiceBase
  } = parametros;

  return (
    <div style={{ position: "fixed", left: "200vw", top: "200vh", opacity: 0, pointerEvents: "none" }}>
      
      {/* 🚀 EL BLINDAJE CONTRA EL MODO OSCURO: Estilos incrustados solo para este PDF */}
      <style>{`
        #reporte-formal-pdf {
          --bg-card: #ffffff !important;
          --text-main: #000000 !important;
          --border-color: #cccccc !important;
          display: block !important;
          width: 8.5in !important;
          min-height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        #reporte-formal-pdf .pdf-section {
          display: block;
          width: 100% !important;
          margin-top: 0 !important;
          margin-bottom: 15px !important;
          page-break-before: avoid !important;
          page-break-after: auto !important;
          page-break-inside: avoid !important;
        }
        #pdf-header {
          border-bottom: 2px solid #000 !important;
          padding-bottom: 10px !important;
          margin-bottom: 20px !important;
          display: block !important;
          width: 100% !important;
          clear: both !important;
        }
        #pdf-header-text {
          float: left !important;
          width: 75% !important;
          text-align: left !important;
        }
        #pdf-header-logo {
          float: right !important;
          width: 20% !important;
          text-align: right !important;
        }
        #pdf-header-logo img {
          width: 1.2in !important;
          height: auto !important;
          display: inline-block !important;
        }
        #reporte-formal-pdf button {
          display: none !important;
        }
        #reporte-formal-pdf table, 
        #reporte-formal-pdf td {
          background-color: #ffffff !important;
          color: #000000 !important;
          border-color: #cccccc !important;
        }
        #reporte-formal-pdf th {
          background-color: #f3f4f6 !important;
          color: #000000 !important;
          border-color: #cccccc !important;
          font-weight: bold !important;
        }
        #reporte-formal-pdf .katex, 
        #reporte-formal-pdf .katex-display {
          color: #000000 !important;
        }
        /* Para limpiar los gráficos SVG de Recharts */
        #reporte-formal-pdf svg {
          background-color: #ffffff !important;
        }
        #reporte-formal-pdf svg text {
          fill: #333333 !important;
        }
        #reporte-formal-pdf svg line, 
        #reporte-formal-pdf svg path.recharts-cartesian-grid-horizontal,
        #reporte-formal-pdf svg path.recharts-cartesian-grid-vertical {
          stroke: #cccccc !important;
        }
        /* Forzar dimensiones físicas en los gráficos off-screen para Recharts */
        #reporte-formal-pdf .widget-grafico {
          width: 650px !important;
          display: block !important;
          margin-bottom: 25px !important;
        }
        #reporte-formal-pdf .widget-body {
          height: 350px !important;
          min-height: 350px !important;
          display: block !important;
          position: relative !important;
        }
        #reporte-formal-pdf .contenedor-grafico-interno {
          position: absolute !important;
          top: 15px !important;
          left: 15px !important;
          right: 15px !important;
          bottom: 15px !important;
          width: 620px !important;
          height: 320px !important;
          display: block !important;
        }
      `}</style>

      <div
        id="reporte-formal-pdf"
        style={{ width: "8.5in", minHeight: "11in", padding: "0.8in", backgroundColor: "white", color: "black", fontFamily: "Arial, sans-serif" }}
      >
        {/* ENCABEZADO INSTITUCIONAL */}
        <div id="pdf-header" className="pdf-section" style={{ borderBottom: "2px solid #000", paddingBottom: "10px", marginBottom: "20px", display: "block", width: "100%", clear: "both" }}>
          <div id="pdf-header-text" style={{ float: "left", width: "75%", textAlign: "left" }}>
            <div style={{ margin: 0, fontSize: "12pt", fontFamily: "Arial, sans-serif", color: "#000000" }}>Universidad Mayor, Real y Pontificia de San Francisco Xavier de Chuquisaca</div>
            <div style={{ margin: "2px 0 0 0", fontSize: "11pt", fontFamily: "Arial, sans-serif", color: "#000000" }}>Facultad de Ciencias Económicas y Empresariales</div>
            <div style={{ margin: "4px 0 0 0", fontSize: "12pt", fontWeight: "bold", fontFamily: "Arial, sans-serif", color: "#000000" }}>CARRERA DE ADMINISTRACIÓN DE EMPRESAS</div>
          </div>
          <div id="pdf-header-logo" style={{ float: "right", width: "20%", textAlign: "right" }}>
            <img src={escudoDorado} style={{ width: "1.2in", height: "auto", display: "inline-block" }} alt="USFX" />
          </div>
          <div style={{ clear: "both" }}></div>
        </div>

        {/* FICHA TÉCNICA */}
        <div id="pdf-ficha-tecnica" className="pdf-section" style={{ marginBottom: "30px", backgroundColor: "#f9f9f9", padding: "15px", borderRadius: "8px", border: "1px solid #ddd" }}>
          <h1 style={{ textAlign: "center", fontSize: "16pt", margin: "0 0 15px 0", color: "#2c3e50" }}>
            ANÁLISIS ESTADÍSTICO: {calculo.replace(/_/g, " ").toUpperCase().replace(" (CONJUNTO)", "").replace("(CONJUNTO)", "").trim()}
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
          <div id="pdf-intro" className="pdf-section">
            <p style={{ fontStyle: "italic", marginBottom: "15px" }}>Este documento contiene el análisis estadístico detallado generado por el sistema.</p>
          </div>

          {resultado && (
            <>
              {calculo === "regresion_simple" && resultado.tipo === "regresion" && (
                <TablaRegresion 
                  resultado={resultado} 
                  modoImpresion={true} 
                  modelosVisibles={modelosVisibles}
                  tablasDesarrolloReporte={tablasDesarrolloReporte} 
                />
              )}
              {calculo === "series_tiempo" && resultado.tipo === "series_tiempo" && (
                <div id="pdf-tabla-series-tiempo" className="pdf-section"><TablaSeriesTiempo resultado={resultado} /></div>
              )}
              {calculo === "numeros_indices" && ["indices_compuestos", "operaciones_indices", "deflacion_financiera"].includes(resultado.tipo) && (
                <div id="pdf-tabla-indices" className="pdf-section"><TablaIndices resultado={resultado} /></div>
              )}
              {esBivariada && resultado.tipo === "distribucion_bivariada" && (
                <div id="pdf-tabla-bivariantes" className="pdf-section"><TablasBivariantes resultado={resultado} formatearCelda={formatearCelda} /></div>
              )}
              {esUnidimensional && (!resultado.tipo || ["tendencia_y_posicion", "variabilidad_y_forma", "estadistica_descriptiva"].includes(resultado.tipo)) && (
                <div id="pdf-tabla-unidimensionales" className="pdf-section">
                  <TablasUnidimensionales resultado={resultado} calculo={calculo} formatearCelda={formatearCelda} filtroFractil={filtroFractil} setFiltroFractil={setFiltroFractil} modoImpresion={true} />
                </div>
              )}

              <div>
                <PanelGraficos 
                  resultado={resultado} 
                  esIntervalo={esIntervalo} 
                  calculo={calculo} 
                  orden={ordenGraficos} 
                  modelosVisibles={modelosVisibles}
                  selectedColumn={selectedColumn}
                  selectedColumnY={selectedColumnY}
                />
              </div>
            </>
          )}
        </div>

        <div id="pdf-footer" className="pdf-section" style={{ marginTop: "20px", borderTop: "1px solid #ccc", paddingTop: "10px", fontSize: "9pt", textAlign: "center" }}>
          Software Estadístico - Trabajo Dirigido USFX © 2026
        </div>
      </div>
    </div>
  );
}