import React, { useState } from "react";
import Latex from "../../../../components/excel/Latex";
import { copiarTablaAExcel } from "../../utils/exportUtils";
import { IconoCopiar } from "../../../../ui/iconos";
import { glosarioEstadistico } from "../../utils/diccionario";

const StatLabel = ({ formulaKey, formulaLatex, labelText, children, align = "center" }) => {
  const info = glosarioEstadistico[formulaKey] || { texto: formulaKey, math: "" };

  return (
    <span className="stat-label-container">
      {children || labelText || <Latex formula={formulaLatex || formulaKey} />}
      <div className={`stat-tooltip tooltip-${align}`}>
        <span>{info.texto}</span>
        {info.math && (
          <div className="tooltip-math" style={{ marginTop: "5px" }}>
            <Latex formula={info.math} />
          </div>
        )}
      </div>
    </span>
  );
};

const obtenerMarcaClase = (label) => {
  const regex = /[\[\()]?\s*([0-9.-]+)\s*-\s*([0-9.-]+)\s*[\]\)]?/;
  const match = String(label).match(regex);
  if (match) {
    const lInf = parseFloat(match[1]);
    const lSup = parseFloat(match[2]);
    if (!isNaN(lInf) && !isNaN(lSup)) {
      return (lInf + lSup) / 2;
    }
  }
  const num = parseFloat(label);
  return isNaN(num) ? 0 : num;
};

export default function TablasBivariantes({ resultado, formatearCelda }) {
  const [mostrarDesarrollo, setMostrarDesarrollo] = useState(false);

  // Atrapamos el nuevo nombre de la función unificada
  if (!resultado || resultado.tipo !== "distribucion_bivariada") {
    return null;
  }

  // Aplanar la matriz de doble entrada
  const filasAplanadas = [];
  let totalFij = 0;
  let totalXiFij = 0;
  let totalYjFij = 0;
  let totalXi2Fij = 0;
  let totalYj2Fij = 0;
  let totalXiYjFij = 0;

  if (resultado.ambosNumericos) {
    resultado.filas.forEach((intX) => {
      const xi = obtenerMarcaClase(intX);
      resultado.columnas.forEach((intY) => {
        const fij = resultado.datos[intX][intY] || 0;
        if (fij > 0) {
          const yj = obtenerMarcaClase(intY);
          const xi_fij = xi * fij;
          const yj_fij = yj * fij;
          const xi2_fij = xi * xi * fij;
          const yj2_fij = yj * yj * fij;
          const xi_yj_fij = xi * yj * fij;

          filasAplanadas.push({
            intX,
            xi,
            intY,
            yj,
            fij,
            xi_fij,
            yj_fij,
            xi2_fij,
            yj2_fij,
            xi_yj_fij
          });

          totalFij += fij;
          totalXiFij += xi_fij;
          totalYjFij += yj_fij;
          totalXi2Fij += xi2_fij;
          totalYj2Fij += yj2_fij;
          totalXiYjFij += xi_yj_fij;
        }
      });
    });
  }

  const copiarDesarrolloAExcel = () => {
    const datosExcel = filasAplanadas.map((f) => ({
      "Intervalo X": f.intX,
      "Marca de clase X (xi)": f.xi,
      "Intervalo Y": f.intY,
      "Marca de clase Y (yj)": f.yj,
      "Frec. Conjunta (fij)": f.fij,
      "xi * fij": f.xi_fij,
      "yj * fij": f.yj_fij,
      "xi^2 * fij": f.xi2_fij,
      "yj^2 * fij": f.yj2_fij,
      "xi * yj * fij": f.xi_yj_fij
    }));

    datosExcel.push({
      "Intervalo X": "TOTALES",
      "Marca de clase X (xi)": "",
      "Intervalo Y": "",
      "Marca de clase Y (yj)": "",
      "Frec. Conjunta (fij)": totalFij,
      "xi * fij": totalXiFij,
      "yj * fij": totalYjFij,
      "xi^2 * fij": totalXi2Fij,
      "yj^2 * fij": totalYj2Fij,
      "xi * yj * fij": totalXiYjFij
    });

    copiarTablaAExcel(datosExcel, "tabla_desarrollo_bivariada");
  };

  return (
    <div className="contenedor-bivariada">
      <h4>Tema 5: Tabla de Distribución Bivariante</h4>

      {/* --- TARJETAS INTELIGENTES (Solo aparecen si hay números) --- */}
      {resultado.ambosNumericos && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "15px", flexWrap: "wrap", width: "100%" }}>
          <div style={{
            flex: "1 1 180px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 15px",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "6px",
            borderLeft: "4px solid #3498db"
          }}>
            <StatLabel formulaKey="S_xy" align="left">
              <span style={{ fontSize: "0.9em", color: "var(--text-muted)", fontWeight: "500" }}>Covarianza (Sxy)</span>
            </StatLabel>
            <span style={{ fontSize: "1.2em", fontWeight: "bold", color: "var(--text-color)" }}>
              {formatearCelda(resultado.covarianza)}
            </span>
          </div>
          <div style={{
            flex: "1 1 180px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 15px",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "6px",
            borderLeft: "4px solid #2ecc71"
          }}>
            <StatLabel formulaKey="r" align="left">
              <span style={{ fontSize: "0.9em", color: "var(--text-muted)", fontWeight: "500" }}>Correlación (r)</span>
            </StatLabel>
            <span style={{ fontSize: "1.2em", fontWeight: "bold", color: "var(--text-color)" }}>
              {formatearCelda(resultado.correlacion)}
            </span>
          </div>
          <div style={{
            flex: "1.5 1 240px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 15px",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "6px",
            borderLeft: "4px solid #9b59b6"
          }}>
            <StatLabel formulaKey="interpretacion_r" align="left">
              <span style={{ fontSize: "0.9em", color: "var(--text-muted)", fontWeight: "500" }}>Interpretación</span>
            </StatLabel>
            <span style={{ fontSize: "1.05em", fontWeight: "bold", color: "#9b59b6", textAlign: "right" }}>
              {resultado.interpretacion}
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h5 style={{ color: "var(--text-color)", margin: 0 }}>
          Tabla de Frecuencias Conjuntas y Marginales
        </h5>
        <button
          className="btn-icon"
          onClick={() => copiarTablaAExcel(resultado.matrizPura, "bivariada")}
          style={{ backgroundColor: '#107c41', color: 'white', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          title="Copiar datos puros para Excel"
        >
          <IconoCopiar /> Copiar Tabla
        </button>
      </div>
      <div style={{ overflowX: "auto", overflowY: "hidden", paddingBottom: "100px", marginBottom: "-100px" }}>
        <table className="tabla-academica">
          <thead>
            <tr>
              <th style={{ background: "transparent", border: "none" }}></th>
              <th colSpan={resultado.columnas.length} style={{ backgroundColor: "var(--accent-color)", color: "#fff", textAlign: "center" }}>
                VARIABLE Y
              </th>
              <th style={{ backgroundColor: "#2c3e50", color: "#fff" }}>Totales X</th>
            </tr>
            <tr>
              <th style={{ backgroundColor: "var(--accent-color)", color: "#fff" }}>VARIABLE X</th>
              {resultado.columnas.map((col) => (
                <th key={col}>{col}</th>
              ))}
              <th style={{ backgroundColor: "#2c3e50", color: "#fff" }}>
                <StatLabel formulaKey="f_i_dot" formulaLatex="f_{i \cdot}" /> / %
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Cuerpo de la tabla */}
            {resultado.filas.map((fila) => (
              <tr key={fila}>
                <td className="celda-x" style={{ fontWeight: "bold", backgroundColor: "var(--bg-card)" }}>{fila}</td>
                {resultado.columnas.map((col) => {
                  const f_ij = resultado.datos[fila][col];
                  return (
                    <td key={col} style={{ textAlign: "center" }}>
                      <strong>{f_ij}</strong>
                    </td>
                  );
                })}
                {/* Total Marginal X */}
                <td className="celda-total" style={{ fontWeight: "bold", backgroundColor: "#e8f6f3", color: "#16a085", textAlign: "center" }}>
                  <strong>{resultado.totalFilas[fila]}</strong>
                  <br />
                  <small>
                    {((resultado.totalFilas[fila] / resultado.granTotal) * 100).toFixed(1)} %
                  </small>
                </td>
              </tr>
            ))}

            {/* Fila Final: Totales Marginales Y */}
            <tr>
              <td className="celda-total" style={{ fontWeight: "bold", backgroundColor: "#2c3e50", color: "#fff" }}>
                Totales Y
              </td>
              {resultado.columnas.map((col) => (
                <td key={col} className="celda-total" style={{ fontWeight: "bold", backgroundColor: "#e8f6f3", color: "#16a085", textAlign: "center" }}>
                  <strong>{resultado.totalColumnas[col]}</strong>
                  <br />
                  <small>
                    {((resultado.totalColumnas[col] / resultado.granTotal) * 100).toFixed(1)} %
                  </small>
                </td>
              ))}
              {/* Gran Total (n) */}
              <td className="celda-total" style={{ fontWeight: "bold", fontSize: "1.2em", backgroundColor: "#27ae60", color: "#fff", textAlign: "center" }}>
                n = {resultado.granTotal}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* --- DESARROLLO MATEMÁTICO PASO A PASO --- */}
      {resultado.ambosNumericos && (
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => setMostrarDesarrollo(!mostrarDesarrollo)}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "var(--primary-color)",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              marginBottom: "20px"
            }}
          >
            {mostrarDesarrollo ? "Ocultar Tabla de Desarrollo" : "Ver Tabla de Desarrollo Matemático"}
          </button>

          {mostrarDesarrollo && (
            <div style={{
              padding: "20px",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              marginBottom: "20px"
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h4 style={{ color: "var(--accent-color)", margin: 0 }}>
                  Tabla de Desarrollo Auxiliar (Cálculo de Sumatorias)
                </h4>
                <button
                  className="btn-icon"
                  onClick={copiarDesarrolloAExcel}
                  style={{ backgroundColor: '#107c41', color: 'white', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                  title="Copiar tabla de desarrollo para Excel"
                >
                  <IconoCopiar /> Copiar Tabla
                </button>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="tabla-academica" style={{ width: "100%", textAlign: "center", fontSize: "0.85em" }}>
                  <thead>
                    <tr>
                      <th>N°</th>
                      <th>Intervalo X</th>
                      <th><StatLabel formulaKey="x_i" align="left" /></th>
                      <th>Intervalo Y</th>
                      <th><StatLabel formulaKey="y_j" align="left" /></th>
                      <th><StatLabel formulaKey="f_ij" align="center" /></th>
                      <th><StatLabel formulaKey="xi_fij" formulaLatex="x_i \cdot f_{ij}" align="center" /></th>
                      <th><StatLabel formulaKey="yj_fij" formulaLatex="y_j \cdot f_{ij}" align="center" /></th>
                      <th><StatLabel formulaKey="xi2_fij" formulaLatex="x_i^2 \cdot f_{ij}" align="center" /></th>
                      <th><StatLabel formulaKey="yj2_fij" formulaLatex="y_j^2 \cdot f_{ij}" align="right" /></th>
                      <th><StatLabel formulaKey="xi_yj_fij" formulaLatex="x_i \cdot y_j \cdot f_{ij}" align="right" /></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filasAplanadas.map((f, idx) => (
                      <tr key={idx} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(128,128,128,0.05)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td>{idx + 1}</td>
                        <td>{f.intX}</td>
                        <td>{f.xi.toFixed(4)}</td>
                        <td>{f.intY}</td>
                        <td>{f.yj.toFixed(4)}</td>
                        <td style={{ fontWeight: "bold" }}>{f.fij}</td>
                        <td>{f.xi_fij.toFixed(4)}</td>
                        <td>{f.yj_fij.toFixed(4)}</td>
                        <td>{f.xi2_fij.toFixed(4)}</td>
                        <td>{f.yj2_fij.toFixed(4)}</td>
                        <td style={{ fontWeight: "bold", color: "var(--primary-color)" }}>{f.xi_yj_fij.toFixed(4)}</td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: "bold", backgroundColor: "rgba(128, 128, 128, 0.15)" }}>
                      <td colSpan={5}>Σ TOTALES:</td>
                      <td>{totalFij}</td>
                      <td>{totalXiFij.toFixed(4)}</td>
                      <td>{totalYjFij.toFixed(4)}</td>
                      <td>{totalXi2Fij.toFixed(4)}</td>
                      <td>{totalYj2Fij.toFixed(4)}</td>
                      <td style={{ color: "var(--primary-color)" }}>{totalXiYjFij.toFixed(4)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}