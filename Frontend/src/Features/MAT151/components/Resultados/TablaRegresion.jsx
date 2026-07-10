import React, { useState } from 'react';
import { copiarTablaAExcel } from "../../utils/exportUtils";
import { IconoCopiar } from "../../../../ui/iconos";
import Latex from "../../../../components/excel/Latex";
import { glosarioEstadistico } from "../../utils/diccionario";

const StatLabel = ({ formulaKey, formulaLatex, align = "center" }) => {
  const info = glosarioEstadistico[formulaKey] || { texto: formulaKey, math: "" };

  return (
    <span className="stat-label-container">
      <Latex formula={formulaLatex || formulaKey} />
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

const getLatexLabel = (label) => {
  if (label === "X") return "X";
  if (label === "Y") return "Y";
  if (label === "ln(X)") return "\\ln(X)";
  if (label === "ln(Y)") return "\\ln(Y)";
  if (label === "1/X") return "\\frac{1}{X}";
  return label;
};

const getTransHeader = (label, isX) => {
  if (label === "ln(X)") return <StatLabel formulaKey="ln_x" formulaLatex="\ln(X)" align="center" />;
  if (label === "ln(Y)") return <StatLabel formulaKey="ln_y" formulaLatex="\ln(Y)" align="center" />;
  if (label === "1/X") return <StatLabel formulaKey="recip_x" formulaLatex="\frac{1}{X}" align="center" />;
  return label;
};

const getSumKey = (key) => {
  const mapping = {
    x3: 'sumX3',
    x4: 'sumX4',
    x5: 'sumX5',
    x6: 'sumX6',
    x2y: 'sumX2Y',
    x3y: 'sumX3Y'
  };
  return mapping[key] || key;
};

const getPolyHeader = (col) => {
  const mapping = {
    'x3': { key: 'x3_reg', latex: 'X^3' },
    'x4': { key: 'x4_reg', latex: 'X^4' },
    'x5': { key: 'x5_reg', latex: 'X^5' },
    'x6': { key: 'x6_reg', latex: 'X^6' },
    'x2y': { key: 'x2y_reg', latex: 'X^2 \\cdot Y' },
    'x3y': { key: 'x3y_reg', latex: 'X^3 \\cdot Y' }
  };
  const info = mapping[col.key];
  if (info) {
    return <StatLabel formulaKey={info.key} formulaLatex={info.latex} align="center" />;
  }
  return col.label;
};

export default function TablaRegresion({
  resultado,
  modelosVisibles,
  modoImpresion = false,
  tablasDesarrolloReporte = {},
  setTablasDesarrolloReporte = () => { }
}) {
  const [mostrarTablasCalculo, setMostrarTablasCalculo] = useState(false);

  if (!resultado || resultado.tipo !== "regresion") return null;

  // Lógica para decidir qué columnas mostrar y qué tooltips poner
  const getConfig = (modelo) => {
    const tipo = modelo.tipoModelo;
    const c = {
      esPolinomial: ["cuadratica", "cubica"].includes(tipo),
      mostrarTransX: false,
      mostrarTransY: false,
      columnasExtra: [], // Para X^3, X^4, X^2Y, etc.
      labelX: "X",
      labelY: "Y"
    };

    // 1. CONFIGURACIÓN PARA MODELOS CON TRANSFORMACIÓN (Intrínsecamente Lineales)
    if (tipo === "logaritmica") { c.mostrarTransX = true; c.labelX = "ln(X)"; }
    if (tipo === "exponencial") { c.mostrarTransY = true; c.labelY = "ln(Y)"; }
    if (tipo === "potencial") { c.mostrarTransX = true; c.mostrarTransY = true; c.labelX = "ln(X)"; c.labelY = "ln(Y)"; }
    if (tipo === "reciproco") { c.mostrarTransX = true; c.labelX = "1/X"; }

    // 2. CONFIGURACIÓN PARA MODELOS POLINOMIALES (Los nuevos)
    if (tipo === "cuadratica") {
      c.columnasExtra = [
        { key: 'x3', label: 'X³', tooltip: (f) => `${f.xOrig}³` },
        { key: 'x4', label: 'X⁴', tooltip: (f) => `${f.xOrig}⁴` },
        { key: 'x2y', label: 'X²·Y', tooltip: (f) => `(${f.xOrig}²) · ${f.yOrig}` }
      ];
    }
    if (tipo === "cubica") {
      c.columnasExtra = [
        { key: 'x3', label: 'X³', tooltip: (f) => `${f.xOrig}³` },
        { key: 'x4', label: 'X⁴', tooltip: (f) => `${f.xOrig}⁴` },
        { key: 'x5', label: 'X⁵', tooltip: (f) => `${f.xOrig}⁵` },
        { key: 'x6', label: 'X⁶', tooltip: (f) => `${f.xOrig}⁶` },
        { key: 'x2y', label: 'X²·Y', tooltip: (f) => `(${f.xOrig}²) · ${f.yOrig}` },
        { key: 'x3y', label: 'X³·Y', tooltip: (f) => `(${f.xOrig}³) · ${f.yOrig}` }
      ];
    }

    return c;
  };

  const isModeloActivo = (tipo) => {
    const hasKeys = modelosVisibles && Object.keys(modelosVisibles).length > 0;
    const activos = hasKeys ? modelosVisibles : { [resultado.comparativa[0].tipoModelo]: true };
    return activos[tipo] === true;
  };

  const tablasDesarrolloARenderizar = resultado.comparativa.filter((m) => {
    if (modoImpresion) {
      return isModeloActivo(m.tipoModelo) && tablasDesarrolloReporte[m.tipoModelo] !== false;
    } else {
      return isModeloActivo(m.tipoModelo);
    }
  });

  return (
    <>
      {/* 1. TABLA COMPARATIVA */}
      <div
        className={modoImpresion ? "pdf-section" : ""}
        style={{
          padding: "15px",
          backgroundColor: modoImpresion ? "#ffffff" : "var(--bg-card)",
          borderRadius: "8px",
          border: modoImpresion ? "1px solid #cccccc" : "1px solid var(--border-color)",
          marginBottom: modoImpresion ? "20px" : "0px"
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h4 style={{ margin: 0, color: modoImpresion ? "#000000" : "var(--primary-color)" }}>
            Comparativa de Modelos de Ajuste (Tamaño de muestra: n = {resultado.comparativa[0].tablaCalculos.filas.length})
          </h4>
          {!modoImpresion && (
            <button
              className="btn-icon"
              onClick={() => {
                const datosComparativa = resultado.comparativa.map((m, idx) => ({
                  "Modelo": m.tipoModelo.charAt(0).toUpperCase() + m.tipoModelo.slice(1) + (idx === 0 ? " ⭐" : ""),
                  "Ecuación de Regresión": m.ecuacion,
                  "Coeficiente de Determinación (R²)": `${(m.indicadores.r2 * 100).toFixed(2)}%`,
                  "Error Estándar de Estimación": m.indicadores.error_estandar.toFixed(4)
                }));
                copiarTablaAExcel(datosComparativa, "comparativa_modelos_regresion");
              }}
              style={{ backgroundColor: '#107c41', color: 'white', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', border: 'none' }}
              title="Copiar tabla comparativa para Excel"
            >
              Copiar Tabla
            </button>
          )}
        </div>
        <div style={{ overflow: "visible" }}>
          <table className="tabla-academica" style={{ width: "100%", textAlign: "center" }}>
            <thead>
              <tr>
                <th>Modelo</th>
                <th>Ecuación de Regresión</th>
                <th>
                  <StatLabel formulaKey="R²" formulaLatex="R^2" />
                </th>
                <th>
                  <StatLabel formulaKey="S_yx" formulaLatex="S_{yx}" align="right" />
                  <div style={{ fontSize: "0.8em", color: modoImpresion ? "#555555" : "var(--text-muted)", fontWeight: "normal" }}>
                    Error Estándar de Estimación
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {resultado.comparativa.map((m, i) => (
                <tr key={m.tipoModelo} style={{ backgroundColor: i === 0 ? "rgba(76, 175, 80, 0.1)" : "transparent" }}>
                  <td style={{ fontWeight: i === 0 ? "bold" : "normal", textTransform: "capitalize" }}>
                    {m.tipoModelo} {i === 0 && "⭐"}
                  </td>
                  <td style={{ fontSize: "1.05em" }}>
                    {m.ecuacionLatex ? <Latex formula={m.ecuacionLatex} /> : m.ecuacion}
                  </td>
                  <td style={{ fontWeight: "bold" }}>{(m.indicadores.r2 * 100).toFixed(2)}%</td>
                  <td>{m.indicadores.error_estandar.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. TABLAS DE DESARROLLO MATEMÁTICO */}
      {!modoImpresion && (
        <div style={{ marginTop: "30px" }}>
          <button
            onClick={() => setMostrarTablasCalculo(!mostrarTablasCalculo)}
            style={{ width: "100%", padding: "12px", backgroundColor: "var(--primary-color)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
          >
            {mostrarTablasCalculo ? "Ocultar Tablas de Desarrollo" : "Ver Desarrollo Matemático Paso a Paso"}
          </button>
        </div>
      )}

      {((!modoImpresion && mostrarTablasCalculo) || (modoImpresion && tablasDesarrolloARenderizar.length > 0)) && (
        <div style={{ marginTop: modoImpresion ? "0px" : "20px" }}>
          {tablasDesarrolloARenderizar.map((m) => {
            const c = getConfig(m);
            const sumas = m.tablaCalculos.sumas;

            return (
              <div
                key={m.tipoModelo}
                className={modoImpresion ? "pdf-section" : ""}
                style={{
                  marginBottom: "40px",
                  padding: "15px",
                  backgroundColor: modoImpresion ? "#ffffff" : "var(--bg-card)",
                  border: modoImpresion ? "1px solid #cccccc" : "1px solid var(--border-color)",
                  borderRadius: "8px"
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: modoImpresion ? "2px solid #3498db" : "2px solid var(--accent-color)", paddingBottom: "5px", marginBottom: "15px", flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h4 style={{ textTransform: "capitalize", color: modoImpresion ? "#000000" : "var(--accent-color)", margin: 0 }}>
                      Desarrollo: Modelo {m.tipoModelo}
                    </h4>

                    {!modoImpresion && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85em', fontWeight: 'bold', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={tablasDesarrolloReporte[m.tipoModelo] !== false}
                          onChange={(e) => {
                            setTablasDesarrolloReporte(prev => ({
                              ...prev,
                              [m.tipoModelo]: e.target.checked
                            }));
                          }}
                        />
                        Incluir en el reporte PDF
                      </label>
                    )}
                  </div>

                  {!modoImpresion && (
                    <button
                      className="btn-icon"
                      onClick={() => {
                        const datosExcel = m.tablaCalculos.filas.map((f, i) => {
                          const row = {
                            "N°": i + 1,
                            "X": f.xOrig,
                            "Y": f.yOrig,
                          };
                          if (c.mostrarTransX) row[c.labelX] = f.xTrans;
                          if (c.mostrarTransY) row[c.labelY] = f.yTrans;
                          row["X²"] = f.x2;
                          row["Y²"] = f.y2;
                          row["X·Y"] = f.xy;
                          c.columnasExtra.forEach(col => {
                            row[col.label] = f[col.key] || 0;
                          });
                          return row;
                        });

                        const totalRow = {
                          "N°": "SUMATORIAS",
                          "X": "",
                          "Y": "",
                        };
                        if (c.mostrarTransX) totalRow[c.labelX] = "";
                        if (c.mostrarTransY) totalRow[c.labelY] = "";
                        totalRow["X²"] = sumas.sumX2;
                        totalRow["Y²"] = sumas.sumY2;
                        totalRow["X·Y"] = sumas.sumXY;
                        c.columnasExtra.forEach(col => {
                          totalRow[col.label] = sumas[getSumKey(col.key)] || 0;
                        });
                        datosExcel.push(totalRow);

                        copiarTablaAExcel(datosExcel, `desarrollo_regresion_${m.tipoModelo}`);
                      }}
                      style={{ backgroundColor: '#107c41', color: 'white', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', border: 'none' }}
                      title="Copiar tabla de desarrollo para Excel"
                    >
                      Copiar Tabla
                    </button>
                  )}
                </div>
                <div style={{ overflowX: "auto", overflowY: "hidden" }}>
                  <table className="tabla-academica" style={{ width: "100%", textAlign: "center", fontSize: "0.85em" }}>
                    <thead>
                      <tr>
                        <th>N°</th>
                        <th><StatLabel formulaKey="x_orig" formulaLatex="X" align="left" /></th>
                        <th><StatLabel formulaKey="y_orig" formulaLatex="Y" align="left" /></th>
                        {/* Columnas de Transformación */}
                        {c.mostrarTransX && <th style={{ backgroundColor: modoImpresion ? '#ffffff' : 'rgba(25,118,210,0.1)' }}>{getTransHeader(c.labelX, true)}</th>}
                        {c.mostrarTransY && <th style={{ backgroundColor: modoImpresion ? '#ffffff' : 'rgba(25,118,210,0.1)' }}>{getTransHeader(c.labelY, false)}</th>}
                        {/* Columnas Matemáticas Comunes */}
                        <th><StatLabel formulaKey="x2_reg" formulaLatex={c.labelX === "X" ? "X^2" : `\\left(${getLatexLabel(c.labelX)}\\right)^2`} align="center" /></th>
                        <th><StatLabel formulaKey="y2_reg" formulaLatex={c.labelY === "Y" ? "Y^2" : `\\left(${getLatexLabel(c.labelY)}\\right)^2`} align="center" /></th>
                        <th><StatLabel formulaKey="xy_reg" formulaLatex={`${getLatexLabel(c.labelX)} \\cdot ${getLatexLabel(c.labelY)}`} align="center" /></th>
                        {/* Columnas Extra para Polinomiales */}
                        {c.columnasExtra.map(col => (
                          <th key={col.key} style={{ backgroundColor: modoImpresion ? '#ffffff' : 'rgba(156,39,176,0.1)' }}>
                            {getPolyHeader(col)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {m.tablaCalculos.filas.map((f, i) => (
                        <tr key={i} onMouseOver={(e) => !modoImpresion && (e.currentTarget.style.backgroundColor = 'rgba(128,128,128,0.05)')} onMouseOut={(e) => !modoImpresion && (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <td>{i + 1}</td>
                          <td title="Dato de entrada">{f.xOrig.toFixed(2)}</td>
                          <td title="Dato de entrada">{f.yOrig.toFixed(2)}</td>

                          {c.mostrarTransX && <td title={`ln(${f.xOrig})`} style={{ backgroundColor: modoImpresion ? '#ffffff' : 'rgba(25,118,210,0.02)' }}>{f.xTrans.toFixed(4)}</td>}
                          {c.mostrarTransY && <td title={`ln(${f.yOrig})`} style={{ backgroundColor: modoImpresion ? '#ffffff' : 'rgba(25,118,210,0.02)' }}>{f.yTrans.toFixed(4)}</td>}

                          <td title={`${f.xTrans.toFixed(4)}²`}>{f.x2.toFixed(4)}</td>
                          <td title={`${f.yTrans.toFixed(4)}²`}>{f.y2.toFixed(4)}</td>
                          <td title={`${f.xTrans.toFixed(4)} · ${f.yTrans.toFixed(4)}`}>{f.xy.toFixed(4)}</td>

                          {/* Celdas Extra Polinomiales */}
                          {c.columnasExtra.map(col => (
                            <td key={col.key} title={col.tooltip(f)} style={{ backgroundColor: modoImpresion ? '#ffffff' : 'rgba(156,39,176,0.02)' }}>
                              {f[col.key]?.toFixed(4) || "0.0000"}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr style={{ fontWeight: "bold", backgroundColor: modoImpresion ? "#f3f4f6" : "rgba(128, 128, 128, 0.15)" }}>
                        <td colSpan={3 + (c.mostrarTransX ? 1 : 0) + (c.mostrarTransY ? 1 : 0)}>Σ SUMATORIAS:</td>
                        <td>{sumas.sumX2.toFixed(4)}</td>
                        <td>{sumas.sumY2.toFixed(4)}</td>
                        <td>{sumas.sumXY.toFixed(4)}</td>
                        {c.columnasExtra.map(col => <td key={col.key}>{sumas[getSumKey(col.key)]?.toFixed(4) || "0.0000"}</td>)}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}