import React, { useState, useEffect } from "react";
import escudoAdmin from "../../assets/images/escudoAdmin.png";
import TablaDinamica from "../excel/TablaDinamica";
import TablaRegresion from "./TablaRegresion";
import TablaSeriesTiempo from "./TablaSeriesTiempo";
import TablaIndices from "./TablaIndices";
import TablasBivariantes from "./TablasBivariantes";
import TablasUnidimensionales from "./TablasUnidimensionales";
import PanelGraficos from "./PanelGraficos";
import { generarPDFReporte } from "../../utils/exportUtils";
import { IconoPDF, IconoGuardar, IconoAlerta } from "../ui/iconos";
import { glosarioEstadistico } from "../../utils/diccionario";

// Este componente envuelve tus símbolos en un tooltip automático
const StatLabel = ({ simbolo }) => {
  const nombre = glosarioEstadistico[simbolo] || simbolo;
  return (
    <span 
      title={nombre} 
      style={{ 
        cursor: "help", 
        borderBottom: "1px dashed #666", 
        fontWeight: "bold" 
      }}
    >
      {simbolo}
    </span>
  );
};

export default function PanelResultados({
  modoCreacion, setModoCreacion, cargarArchivos,
  resultado, errorNumerico, calculo,
  esBivariada, esUnidimensional, esIntervalo,
  formatearCelda, filtroFractil, setFiltroFractil,
  ordenGraficos, setOrdenGraficos,
  handleGuardarResultado,
  selectedColumn,
  selectedColumnY,
  tablasDesarrolloReporte,
  setTablasDesarrolloReporte,
  modelosVisibles,
  setModelosVisibles
}) {

  useEffect(() => {
    if (resultado && resultado.tipo === "regresion" && resultado.comparativa && resultado.comparativa.length > 0) {
      const mejorModelo = resultado.comparativa[0].tipoModelo;
      setModelosVisibles({
        lineal: mejorModelo === 'lineal',
        exponencial: mejorModelo === 'exponencial',
        logaritmica: mejorModelo === 'logaritmica',
        potencial: mejorModelo === 'potencial',
        reciproco: mejorModelo === 'reciproco',
        cuadratica: mejorModelo === 'cuadratica',
        cubica: mejorModelo === 'cubica'
      });
    }
  }, [resultado]);

  return (
    <div className="calculadora-resultados transition-all duration-300 w-full flex-1" id="tour-resultados-panel">
      {modoCreacion ? (
        <TablaDinamica
          onTablaCreada={(nuevoNombre) => {
            if (cargarArchivos) cargarArchivos(nuevoNombre);
            setModoCreacion(false);
          }}
        />
      ) : !resultado && !errorNumerico ? (
        <div className="contenedor-espera-logo">
          <img
            src={escudoAdmin}
            alt="Escudo Administración de Empresas"
            className="logo-espera"
          />
        </div>
      ) : (
        <div className="contenedor-resultados-vacio">
          <div className="frecuencias">
            <div style={{ marginBottom: "15px" }}>
              <h3 style={{ margin: 0 }}>
                Resultados: {calculo.replace(/_/g, " ").toUpperCase().replace(" (CONJUNTO)", "").replace("(CONJUNTO)", "").trim()}
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
                <p style={{ margin: "0", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <IconoAlerta width="18" height="18" style={{ flexShrink: 0 }} />
                  Error: Faltan datos numéricos o hay celdas de texto en el cálculo actual.
                </p>
              </div>
            )}

            {resultado && (
              <>
                {calculo === "regresion_simple" && resultado.tipo === "regresion" && (
                  <TablaRegresion 
                    resultado={resultado} 
                    modelosVisibles={modelosVisibles} 
                    tablasDesarrolloReporte={tablasDesarrolloReporte}
                    setTablasDesarrolloReporte={setTablasDesarrolloReporte}
                  />
                )}
                {calculo === "series_tiempo" && resultado.tipo === "series_tiempo" && (
                  <TablaSeriesTiempo resultado={resultado} />
                )}
                {calculo === "numeros_indices" && ["indices_compuestos", "operaciones_indices", "deflacion_financiera"].includes(resultado.tipo) && (
                  <TablaIndices resultado={resultado} />
                )}
                {esBivariada && resultado.tipo === "distribucion_bivariada" && (
                  <TablasBivariantes
                    resultado={resultado}
                    formatearCelda={formatearCelda}
                  />
                )}
                {esUnidimensional && (!resultado.tipo || ["tendencia_y_posicion", "variabilidad_y_forma", "estadistica_descriptiva"].includes(resultado.tipo)) && (
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

          <PanelGraficos
            resultado={resultado}
            esIntervalo={esIntervalo}
            calculo={calculo}
            orden={ordenGraficos}
            setOrden={setOrdenGraficos}
            modelosVisibles={modelosVisibles}
            setModelosVisibles={setModelosVisibles}
            selectedColumn={selectedColumn}
            selectedColumnY={selectedColumnY}
          />

          {/* BARRA DE ACCIONES FINAL */}
          <div className="barra-acciones-final" id="tour-acciones-finales" style={{ display: "flex", gap: "12px", marginTop: "25px" }}>
            <button
              onClick={() => generarPDFReporte("reporte-formal-pdf", `Reporte_${calculo}`)}
              className="btn-icon btn-export-pdf"
              style={{
                backgroundColor: "var(--accent-red, #dc3545)", color: "white", padding: "11px 22px",
                borderRadius: "8px", cursor: "pointer", fontWeight: "bold", border: "none",
                display: "inline-flex", alignItems: "center", gap: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                transition: "all 0.2s ease"
              }}
            >
              <IconoPDF /> Exportar PDF
            </button>

            <button
              onClick={handleGuardarResultado}
              className="btn-icon btn-save-calculo"
              style={{
                backgroundColor: "var(--primary-color, #f97316)", color: "white", padding: "11px 22px",
                borderRadius: "8px", cursor: "pointer", fontWeight: "bold", border: "none",
                display: "inline-flex", alignItems: "center", gap: "8px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                transition: "all 0.2s ease"
              }}
            >
              <IconoGuardar /> Guardar Cálculo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}