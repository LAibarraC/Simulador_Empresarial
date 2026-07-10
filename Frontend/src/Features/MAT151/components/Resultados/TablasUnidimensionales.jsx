import React, { useState } from "react";
import Latex from "../../../../components/excel/Latex";
import { copiarTablaAExcel } from "../../utils/exportUtils";
import { IconoCopiar } from "../../../../ui/iconos";
import { glosarioEstadistico } from "../../utils/diccionario";

const StatLabel = ({ formulaKey, formulaLatex, align = "center" }) => {
  const info = glosarioEstadistico[formulaKey] || { texto: formulaKey, math: "" };

  return (
    <span className="stat-label-container">
      <Latex formula={formulaLatex || formulaKey} />
      <div className={`stat-tooltip tooltip-${align}`}>
        <span>{info.texto}</span>
        {info.math && (
          <div className="tooltip-math">
            <Latex formula={info.math} />
          </div>
        )}
      </div>
    </span>
  );
};

export default function TablasUnidimensionales({
  resultado, calculo, formatearCelda, filtroFractil, setFiltroFractil, modoImpresion = false
}) {
  // 🚀 NUEVO ESTADO: Controla qué columnas ve el usuario
  const [vistaDatos, setVistaDatos] = useState("individuales");

  if (!resultado) return null;
  if (resultado.tipo === "bivariada" || resultado.tipo === "bivariada_avanzada") return null;

  // 🚀 COMPONENTE REUTILIZABLE: Los Radio Buttons
  const SelectorVista = () => {
    // Si estamos imprimiendo en PDF, ocultamos los botones
    if (modoImpresion) return null;

    return (
      <div style={{
        marginBottom: "20px", padding: "12px 15px", backgroundColor: "var(--bg-card)",
        borderRadius: "8px", border: "1px solid var(--border-color)",
        display: "flex", gap: "25px", alignItems: "center", flexWrap: "wrap"
      }}>
        <strong style={{ margin: 0, color: "var(--primary-color)" }}>Modo de Visualización:</strong>
        <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: vistaDatos === "individuales" ? "bold" : "normal" }}>
          <input type="radio" name="vistaDatos" value="individuales" checked={vistaDatos === "individuales"} onChange={() => setVistaDatos("individuales")} />
          Datos Individuales
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: vistaDatos === "agrupados" ? "bold" : "normal" }}>
          <input type="radio" name="vistaDatos" value="agrupados" checked={vistaDatos === "agrupados"} onChange={() => setVistaDatos("agrupados")} />
          Datos en Conjuntos (Agrupados)
        </label>
      </div>
    );
  };

  // =========================================================
  // --- CASO 1: TENDENCIA Y POSICIÓN (Tema 3) ---
  // =========================================================
  if (resultado.tipo === "tendencia_y_posicion") {
    return (
      <div className="contenedor-tendencia-posicion">

        <SelectorVista />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
          <h4 style={{ margin: 0 }}>1. Análisis de Tendencia Central</h4>
          <button
            data-html2canvas-ignore="true"
            onClick={() => {
              const datosExport = resultado.tendencia.map(row => {
                const res = { Medida: row["Medida"].split(" (")[0] };
                if (vistaDatos === "individuales") {
                  res["Datos Individuales"] = row["D. Individuales"];
                }
                if (vistaDatos === "agrupados") {
                  res["Datos Agrupados"] = row["D. Agrupados"];
                }
                return res;
              });
              copiarTablaAExcel(datosExport, "tendencia_central");
            }}
            className="btn-icon"
            style={{ backgroundColor: '#107c41', color: 'white', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', border: 'none' }}
            title="Copiar datos puros para Excel"
          >
            Copiar Tabla
          </button>
        </div>
        {/* 🚀 Colchón de 70px para evitar que el tooltip active el scroll */}
        <div className="container_tablas_academica" style={{ overflowX: "auto", overflowY: "hidden", paddingBottom: "70px" }}>
          <table className="tabla-academica">
            <thead>
              <tr>
                <th>Medida</th>
                {vistaDatos === "individuales" && <th>D. Individuales</th>}
                {vistaDatos === "agrupados" && <th>D. Agrupados</th>}
              </tr>
            </thead>
            <tbody>
              {resultado.tendencia.map((row, i) => {
                const nombreLimpio = row["Medida"].split(" (")[0];
                return (
                  <tr key={i}>
                    <td style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold" }}>
                      {nombreLimpio}
                      {/* 🚀 Lógica corregida con paréntesis para que no se dupliquen */}
                      {row["Medida"].includes("(x̄)") && <StatLabel formulaKey="x̄" formulaLatex="\bar{x}" align="left" />}
                      {row["Medida"].includes("(Me)") && <StatLabel formulaKey="Me" align="left" />}
                      {row["Medida"].includes("(Mo)") && <StatLabel formulaKey="Mo" align="left" />}
                      {row["Medida"].includes("(G)") && <StatLabel formulaKey="G" align="left" />}
                      {row["Medida"].includes("(H)") && <StatLabel formulaKey="H" align="left" />}
                    </td>
                    {vistaDatos === "individuales" && <td>{formatearCelda(row["D. Individuales"])}</td>}
                    {vistaDatos === "agrupados" && <td>{formatearCelda(row["D. Agrupados"])}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "25px", marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
          <h4 style={{ margin: 0 }}>2. Medidas de Posición</h4>
          {!modoImpresion && (
            <button
              data-html2canvas-ignore="true"
              onClick={() => {
                const datosFiltrados = resultado.posicion.filter(r => (r.Medida || r.Tipo) === filtroFractil);
                const datosExport = datosFiltrados.map(row => {
                  const res = {
                    Medida: row.Medida || row.Tipo,
                    Símbolo: row.Símbolo
                  };
                  if (vistaDatos === "individuales") {
                    res["Datos Individuales"] = row["D. Individuales"];
                  }
                  if (vistaDatos === "agrupados") {
                    res["Datos Agrupados"] = row["D. Agrupados"];
                  }
                  return res;
                });
                copiarTablaAExcel(datosExport, `medidas_de_posicion_${filtroFractil.toLowerCase()}es`);
              }}
              className="btn-icon"
              style={{ backgroundColor: '#107c41', color: 'white', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', border: 'none' }}
              title="Copiar datos puros para Excel"
            >
              Copiar Tabla
            </button>
          )}
        </div>

        {modoImpresion ? (
          <div className="pdf-medidas-posicion">
            {["Cuartil", "Decil", "Percentil"].map((tipo) => {
              const datosTipo = resultado.posicion.filter(r => (r.Medida || r.Tipo) === tipo);
              if (datosTipo.length === 0) return null;

              return (
                <div key={tipo} style={{ marginBottom: "25px" }}>
                  <h5 style={{ fontSize: "11pt", color: "#2c3e50", borderBottom: "1px solid #ccc", paddingBottom: "4px", marginBottom: "10px" }}>
                    • {tipo}es
                  </h5>
                  <div style={{ overflowX: "auto" }}>
                    <table className="tabla-academica">
                      <thead>
                        <tr>
                          <th>Medida</th>
                          <th>Símbolo</th>
                          {vistaDatos === "individuales" && <th>D. Individuales</th>}
                          {vistaDatos === "agrupados" && <th>D. Agrupados</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {datosTipo.map((row, i) => (
                          <tr key={i}>
                            <td>{row.Medida || row.Tipo}</td>
                            <td style={{ fontWeight: "bold" }}>{row.Símbolo}</td>
                            {vistaDatos === "individuales" && <td style={{ fontFamily: "monospace", fontSize: "1.1em" }}>{formatearCelda(row["D. Individuales"])}</td>}
                            {vistaDatos === "agrupados" && <td style={{ fontFamily: "monospace", fontSize: "1.1em" }}>{formatearCelda(row["D. Agrupados"])}</td>}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <div className="container_subtendencia" style={{ marginBottom: "15px" }}>
              {["Cuartil", "Decil", "Percentil"].map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setFiltroFractil(tipo)}
                  className="button_subtendencia"
                  style={{
                    backgroundColor: filtroFractil === tipo ? "var(--accent-color)" : "var(--bg-card)",
                    color: filtroFractil === tipo ? "#fff" : "inherit",
                    marginRight: "10px", padding: "8px 15px", border: "1px solid var(--border-color)",
                    borderRadius: "4px", cursor: "pointer", fontWeight: filtroFractil === tipo ? "bold" : "normal"
                  }}
                >
                  {tipo}es
                </button>
              ))}
            </div>
            {/* 🚀 Colchón de 70px aplicado a Medidas de Posición */}
            <div style={{ overflowX: "auto", overflowY: "hidden", paddingBottom: "70px" }}>
              <table className="tabla-academica">
                <thead>
                  <tr>
                    <th>Medida</th>
                    <th>Símbolo</th>
                    {vistaDatos === "individuales" && <th>D. Individuales</th>}
                    {vistaDatos === "agrupados" && <th>D. Agrupados</th>}
                  </tr>
                </thead>
                <tbody>
                  {resultado.posicion.filter(r => (r.Medida || r.Tipo) === filtroFractil).map((row, i) => {
                    const claveDiccionario = row.Tipo === "Cuartil" ? "Q_k" : row.Tipo === "Decil" ? "D_k" : "P_k";
                    const letra = row.Símbolo[0];
                    const numero = row.Símbolo.substring(1);

                    return (
                      <tr key={i}>
                        <td>{row.Medida || row.Tipo}</td>
                        <td style={{ fontWeight: "bold" }}>
                          <StatLabel formulaKey={claveDiccionario} formulaLatex={`${letra}_{${numero}}`} align="left" />
                        </td>
                        {vistaDatos === "individuales" && <td style={{ fontFamily: "monospace", fontSize: "1.1em" }}>{formatearCelda(row["D. Individuales"])}</td>}
                        {vistaDatos === "agrupados" && <td style={{ fontFamily: "monospace", fontSize: "1.1em" }}>{formatearCelda(row["D. Agrupados"])}</td>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    );
  }

  // =========================================================
  // --- CASO 2: VARIABILIDAD Y FORMA (Tema 4) ---
  // =========================================================
  if (resultado.tipo === "variabilidad_y_forma") {
    return (
      <div className="contenedor-variabilidad-forma">

        <SelectorVista />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
          <h4 style={{ margin: 0 }}>3. Medidas de Dispersión</h4>
          <button
            data-html2canvas-ignore="true"
            onClick={() => {
              const datosExport = resultado.dispersion.map(row => {
                const res = {
                  Estadígrafo: row["Estadígrafo"],
                  Sigla: row["Sigla"]
                };
                if (vistaDatos === "individuales") {
                  res["Datos Individuales"] = row["D. Individuales"];
                }
                if (vistaDatos === "agrupados") {
                  res["Datos Agrupados"] = row["D. Agrupados"];
                }
                return res;
              });
              copiarTablaAExcel(datosExport, "medidas_de_dispersion");
            }}
            className="btn-icon"
            style={{ backgroundColor: '#107c41', color: 'white', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', border: 'none' }}
            title="Copiar datos puros para Excel"
          >
            Copiar Tabla
          </button>
        </div>
        {/* 🚀 Colchón de 70px aplicado a Medidas de Dispersión */}
        <div style={{ overflowX: "auto", overflowY: "hidden", marginBottom: "30px", paddingBottom: "70px" }}>
          <table className="tabla-academica">
            <thead>
              <tr>
                <th>Estadígrafo</th>
                <th>Sigla</th>
                {vistaDatos === "individuales" && <th>D. Individuales</th>}
                {vistaDatos === "agrupados" && <th>D. Agrupados</th>}
              </tr>
            </thead>
            <tbody>
              {resultado.dispersion?.map((row, i) => (
                <tr key={i}>
                  <td>{row["Estadígrafo"]}</td>
                  <td style={{ fontWeight: "bold" }}><StatLabel formulaKey={row["Sigla"]} /></td>
                  {vistaDatos === "individuales" && <td style={{ fontFamily: "monospace", fontSize: "1.1em" }}>{formatearCelda(row["D. Individuales"])}</td>}
                  {vistaDatos === "agrupados" && <td style={{ fontFamily: "monospace", fontSize: "1.1em" }}>{formatearCelda(row["D. Agrupados"])}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: "2px solid var(--border-color)", paddingBottom: "5px", marginBottom: "10px", flexWrap: 'wrap', gap: '10px' }}>
          <h4 style={{ margin: 0, color: "var(--primary-color)" }}>
            4. Medidas de Forma
          </h4>
          <button
            data-html2canvas-ignore="true"
            onClick={() => {
              const datosExport = resultado.forma.map(row => {
                const esAsimetria = row["Estadígrafo"].includes("Asimetría");
                return {
                  Estadígrafo: esAsimetria ? "Asimetría de Fisher" : "Curtosis",
                  "Valor Calculado": row["Valor Calculado"],
                  "Interpretación": row["Interpretación"]
                };
              });
              copiarTablaAExcel(datosExport, "medidas_de_forma");
            }}
            className="btn-icon"
            style={{ backgroundColor: '#107c41', color: 'white', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', border: 'none' }}
            title="Copiar datos puros para Excel"
          >
            Copiar Tabla
          </button>
        </div>
        {/* 🚀 Colchón de 70px aplicado a Medidas de Forma */}
        <div style={{ overflowX: "auto", overflowY: "hidden", paddingBottom: "70px" }}>
          <table className="tabla-academica">
            <thead>
              <tr>
                <th>Estadígrafo</th>
                <th>Valor Calculado</th>
                <th>Interpretación</th>
              </tr>
            </thead>
            <tbody>
              {resultado.forma?.map((row, i) => {
                const esAsimetria = row["Estadígrafo"].includes("Asimetría");
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                      {esAsimetria ? "Asimetría de Fisher" : "Curtosis"}
                      <StatLabel formulaKey={esAsimetria ? "As" : "K"} align="left" />
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: "1.1em", color: "var(--primary-color)" }}>
                      {formatearCelda(row["Valor Calculado"])}
                    </td>
                    <td style={{ fontStyle: "italic" }}>{row["Interpretación"]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // =========================================================
  // --- CASO 3: TABLAS SIMPLES (Frecuencias, Intervalos) ---
  // =========================================================
  if (Array.isArray(resultado)) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <button
            data-html2canvas-ignore="true" onClick={() => copiarTablaAExcel(resultado, calculo)} className="btn-icon"
            style={{ backgroundColor: '#107c41', color: 'white', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            title="Copiar datos puros para Excel"
          >
            <IconoCopiar /> Copiar Tabla
          </button>
        </div>

        <div style={{ overflowX: "auto", paddingBottom: "70px" }}>
          <table className="tabla-academica">
            <thead>
              <tr>
                {Object.keys(resultado[0]).map((key, idx, arr) => {
                  let alineacion = "center";
                  if (idx === 0) alineacion = "left";
                  else if (idx >= arr.length - 2) alineacion = "right";

                  return (
                    <th key={key}>
                      {key === "f_i" || key === "fi" ? <StatLabel formulaKey="f_i" align={alineacion} /> :
                        key === "p_i" ? <StatLabel formulaKey="p_i" formulaLatex="p_i" align={alineacion} /> :
                          key === "F_i" ? <StatLabel formulaKey="F_i" align={alineacion} /> :
                            key === "P_i" ? <StatLabel formulaKey="P_i" formulaLatex="P_i" align={alineacion} /> :
                              key === "x_i" ? <StatLabel formulaKey="x_i" align={alineacion} /> :
                                key === "F_i_inv" || key === "F'i" ? <StatLabel formulaKey="F_i_inv" formulaLatex="F^{\uparrow}_i" align={alineacion} /> :
                                  key === "P_i_inv" || key === "P'i" ? <StatLabel formulaKey="P_i_inv" formulaLatex="P^{\uparrow}_i" align={alineacion} /> :
                                    key}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {resultado.map((row, i) => (
                <tr key={i}>
                  {Object.entries(row).map(([key, val], j) => (
                    <td key={j} className={key.includes("Total") ? "celda-total" : ""}>
                      {formatearCelda(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}