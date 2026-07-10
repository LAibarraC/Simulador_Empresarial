import React, { useState } from 'react';
import { copiarTablaAExcel } from "../../utils/exportUtils";
import { IconoCopiar } from "../../../../ui/iconos";

export default function TablaIndices({ resultado }) {
  if (!resultado) return null;

  // ==========================================
  // MÓDULO 1: ÍNDICES COMPUESTOS
  // ==========================================
  if (resultado.tipo === "indices_compuestos") {
    const esSimple = resultado.conPonderacion === false;
    const tipo = resultado.tipoIndiceSimple; // "precios" o "cantidades"

    // Cálculo de sumatorias para el modo simple
    const sumBase = esSimple
      ? resultado.detalles.reduce((acc, f) => acc + (tipo === "cantidades" ? f.Q0 : f.P0), 0)
      : 0;
    const sumActual = esSimple
      ? resultado.detalles.reduce((acc, f) => acc + (tipo === "cantidades" ? f.Qt : f.Pt), 0)
      : 0;

    return (
      <div style={{ padding: '15px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <h4 style={{ margin: 0, color: "var(--primary-color)" }}>
              {esSimple
                ? `Índices Simples (Sin Ponderar) de ${tipo === "precios" ? "Precios" : "Cantidades"}`
                : "Índices Compuestos Ponderados"
              }
            </h4>
          </div>
          <button
            className="btn-icon"
            onClick={() => {
              if (esSimple) {
                const datosExport = resultado.detalles.map((fila) => {
                  const row = { "Ítem": fila.item };
                  if (tipo === "precios") {
                    row["Precio Base (P₀)"] = fila.P0;
                    row["Precio Actual (Pt)"] = fila.Pt;
                  } else {
                    row["Cantidad Base (Q₀)"] = fila.Q0;
                    row["Cantidad Actual (Qt)"] = fila.Qt;
                  }
                  row["Relativo (%)"] = fila.relativo;
                  return row;
                });
                // Fila de sumatorias
                datosExport.push({
                  "Ítem": "SUMATORIAS (Σ)",
                  [tipo === "precios" ? "Precio Base (P₀)" : "Cantidad Base (Q₀)"]: sumBase,
                  [tipo === "precios" ? "Precio Actual (Pt)" : "Cantidad Actual (Qt)"]: sumActual,
                  "Relativo (%)": ""
                });
                copiarTablaAExcel(datosExport, `indices_simples_${tipo}`);
              } else {
                const datosExport = resultado.detalles.map((fila) => ({
                  "Ítem": fila.item,
                  "Precio Base (P₀)": fila.P0,
                  "Cantidad Base (Q₀)": fila.Q0,
                  "Precio Actual (Pt)": fila.Pt,
                  "Cantidad Actual (Qt)": fila.Qt,
                  "Pt · Q₀": fila.Pt_Q0,
                  "P₀ · Q₀": fila.P0_Q0,
                  "Pt · Qt": fila.Pt_Qt,
                  "P₀ · Qt": fila.P0_Qt
                }));
                // Fila de sumatorias
                datosExport.push({
                  "Ítem": "SUMATORIAS (Σ)",
                  "Precio Base (P₀)": "",
                  "Cantidad Base (Q₀)": "",
                  "Precio Actual (Pt)": "",
                  "Cantidad Actual (Qt)": "",
                  "Pt · Q₀": resultado.sumatorias.sum_Pt_Q0,
                  "P₀ · Q₀": resultado.sumatorias.sum_P0_Q0,
                  "Pt · Qt": resultado.sumatorias.sum_Pt_Qt,
                  "P₀ · Qt": resultado.sumatorias.sum_P0_Qt
                });
                copiarTablaAExcel(datosExport, "indices_compuestos_ponderados");
              }
            }}
            style={{ backgroundColor: '#107c41', color: 'white', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            title="Copiar tabla para Excel"
          >
            <IconoCopiar /> Copiar Tabla
          </button>
        </div>

        {/* Tabla de Cálculos/Pasos (Mostrada por defecto en la parte superior) */}
        <div style={{ overflowX: "auto", marginTop: "15px", marginBottom: "25px" }}>
          {esSimple ? (
            <table className="tabla-academica" style={{ width: '100%', color: 'var(--text-color)', textAlign: 'center' }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Ítem</th>
                  <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    {tipo === "precios" ? "Base P₀" : "Base Q₀"}
                  </th>
                  <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    {tipo === "precios" ? "Actual Pt" : "Actual Qt"}
                  </th>
                  <th style={{ backgroundColor: 'rgba(25, 118, 210, 0.2)', borderBottom: '1px solid var(--border-color)' }}>
                    Relativo (%)
                  </th>
                </tr>
              </thead>
              <tbody>
                {resultado.detalles.map((fila, idx) => (
                  <tr key={idx}>
                    <td style={{ borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>{fila.item}</td>
                    <td style={{ borderBottom: '1px solid var(--border-color)' }}>
                      {tipo === "precios" ? fila.P0 : fila.Q0}
                    </td>
                    <td style={{ borderBottom: '1px solid var(--border-color)' }}>
                      {tipo === "precios" ? fila.Pt : fila.Qt}
                    </td>
                    <td style={{ borderBottom: '1px solid var(--border-color)', color: '#1976d2', fontWeight: 'bold' }}>
                      {fila.relativo.toFixed(2)}%
                    </td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', backgroundColor: 'rgba(128, 128, 128, 0.1)' }}>
                  <td style={{ textAlign: 'right', paddingRight: '10px' }}>SUMATORIAS (Σ):</td>
                  <td>{sumBase.toFixed(2)}</td>
                  <td>{sumActual.toFixed(2)}</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <table className="tabla-academica" style={{ width: '100%', color: 'var(--text-color)', textAlign: 'center' }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Ítem</th>
                  <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>P₀</th>
                  <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Q₀</th>
                  <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Pt</th>
                  <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Qt</th>
                  <th style={{ backgroundColor: 'rgba(25, 118, 210, 0.2)', borderBottom: '1px solid var(--border-color)' }}>Pt·Q₀</th>
                  <th style={{ backgroundColor: 'rgba(25, 118, 210, 0.2)', borderBottom: '1px solid var(--border-color)' }}>P₀·Q₀</th>
                  <th style={{ backgroundColor: 'rgba(56, 142, 60, 0.2)', borderBottom: '1px solid var(--border-color)' }}>Pt·Qt</th>
                  <th style={{ backgroundColor: 'rgba(56, 142, 60, 0.2)', borderBottom: '1px solid var(--border-color)' }}>P₀·Qt</th>
                </tr>
              </thead>
              <tbody>
                {resultado.detalles.map((fila, idx) => (
                  <tr key={idx}>
                    <td style={{ borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>{fila.item}</td>
                    <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.P0}</td>
                    <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.Q0}</td>
                    <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.Pt}</td>
                    <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.Qt}</td>
                    <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.Pt_Q0.toFixed(2)}</td>
                    <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.P0_Q0.toFixed(2)}</td>
                    <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.Pt_Qt.toFixed(2)}</td>
                    <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.P0_Qt.toFixed(2)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', backgroundColor: 'rgba(128, 128, 128, 0.1)' }}>
                  <td colSpan="5" style={{ textAlign: 'right', paddingRight: '10px' }}>SUMATORIAS (Σ):</td>
                  <td>{resultado.sumatorias.sum_Pt_Q0.toFixed(2)}</td>
                  <td>{resultado.sumatorias.sum_P0_Q0.toFixed(2)}</td>
                  <td>{resultado.sumatorias.sum_Pt_Qt.toFixed(2)}</td>
                  <td>{resultado.sumatorias.sum_P0_Qt.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Tarjetas de Resultados (Debajo de la tabla de cálculos) */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${esSimple ? '180px' : '220px'}, 1fr))`, gap: '15px', marginBottom: '10px' }}>
          <div style={{ padding: '15px', backgroundColor: 'rgba(25, 118, 210, 0.1)', border: '1px solid #1976d2', borderRadius: '8px', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#1976d2' }}>Índice Laspeyres</h4>
            <span style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{resultado.resultados.laspeyres.toFixed(2)}%</span>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.8em', color: 'var(--text-muted)' }}>
              {esSimple ? "Agregativo Simple" : "(Cantidades Base)"}
            </p>
          </div>

          <div style={{ padding: '15px', backgroundColor: 'rgba(56, 142, 60, 0.1)', border: '1px solid #388e3c', borderRadius: '8px', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#388e3c' }}>Índice Paasche</h4>
            <span style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{resultado.resultados.paasche.toFixed(2)}%</span>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.8em', color: 'var(--text-muted)' }}>
              {esSimple ? "Agregativo Simple" : "(Cants. Actuales)"}
            </p>
          </div>

          <div style={{ padding: '15px', backgroundColor: 'rgba(245, 124, 0, 0.1)', border: '1px solid #f57c00', borderRadius: '8px', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#f57c00' }}>Índice Fisher (Ideal)</h4>
            <span style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{resultado.resultados.fisher.toFixed(2)}%</span>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.8em', color: 'var(--text-muted)' }}>
              {esSimple ? "Agregativo Simple" : "(Promedio Geométrico)"}
            </p>
          </div>

          <div style={{ padding: '15px', backgroundColor: 'rgba(156, 39, 176, 0.1)', border: '1px solid #9c27b0', borderRadius: '8px', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 5px 0', color: '#9c27b0' }}>Índice Edgeworth</h4>
            <span style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{resultado.resultados.edgeworth.toFixed(2)}%</span>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.8em', color: 'var(--text-muted)' }}>
              {esSimple ? "Agregativo Simple" : "(Suma de Cantidades)"}
            </p>
          </div>

          {esSimple && (
            <div style={{ padding: '15px', backgroundColor: 'rgba(124, 58, 237, 0.1)', border: '1px solid #7c3aed', borderRadius: '8px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 5px 0', color: '#7c3aed' }}>Promedio de Relativos</h4>
              <span style={{ fontSize: '1.8em', fontWeight: 'bold' }}>{resultado.resultados.promedioRelativos.toFixed(2)}%</span>
              <p style={{ margin: '5px 0 0 0', fontSize: '0.8em', color: 'var(--text-muted)' }}>[Σ(Pt/P₀) / n] × 100</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // MÓDULO 2: EMPALME Y CAMBIO DE BASE
  // ==========================================
  if (resultado.tipo === "operaciones_indices") {
    return (
      <div style={{ padding: '15px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h4 style={{ margin: 0, color: "var(--primary-color)" }}>Serie de Índices (Eslabones y Cambio de Base)</h4>
          <button
            className="btn-icon"
            onClick={() => {
              const datosExport = resultado.datos.map((fila) => {
                const row = {};
                if (resultado.conColumnaItem) {
                  row["Ítem"] = fila.item || "";
                }
                row["Periodo (t)"] = fila.t;
                row["Índice Original"] = fila.indice_original;
                row["Nuevo Índice (Cambio Base)"] = fila.nuevo_indice;
                row["Índice Eslabón (Cadena)"] = fila.eslabon !== null ? fila.eslabon : '-';
                return row;
              });
              copiarTablaAExcel(datosExport, "operaciones_serie_indices");
            }}
            style={{ backgroundColor: '#107c41', color: 'white', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            title="Copiar tabla para Excel"
          >
            <IconoCopiar /> Copiar Tabla
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tabla-academica" style={{ width: '100%', color: 'var(--text-color)', textAlign: 'center' }}>
            <thead>
              <tr>
                {resultado.conColumnaItem && <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Ítem</th>}
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Periodo (t)</th>
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Índice Original</th>
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Nuevo Índice (Cambio Base)</th>
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Índice Eslabón (Cadena)</th>
              </tr>
            </thead>
            <tbody>
              {resultado.datos.map((fila, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'rgba(128,128,128,0.05)' : 'transparent' }}>
                  {resultado.conColumnaItem && <td style={{ borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>{fila.item}</td>}
                  <td style={{ borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>{fila.t}</td>
                  <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.indice_original.toFixed(2)}</td>
                  <td style={{ borderBottom: '1px solid var(--border-color)', color: '#1976d2', fontWeight: 'bold' }}>{fila.nuevo_indice.toFixed(2)}</td>
                  <td style={{ borderBottom: '1px solid var(--border-color)', color: '#f57c00' }}>{fila.eslabon ? fila.eslabon.toFixed(2) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ==========================================
  // MÓDULO 3: DEFLACIÓN FINANCIERA
  // ==========================================
  if (resultado.tipo === "deflacion_financiera") {
    return (
      <div style={{ padding: '15px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h4 style={{ margin: 0, color: "var(--primary-color)" }}>Análisis Financiero y Deflación</h4>
          <button
            className="btn-icon"
            onClick={() => {
              const datosExport = resultado.datos.map((fila) => {
                const row = {};
                if (resultado.conColumnaItem) {
                  row["Ítem"] = fila.item || "";
                }
                row["Periodo (t)"] = fila.t;
                row["Valor Nominal ($)"] = fila.nominal;
                row["IPC"] = fila.ipc;
                row["Valor Real ($)"] = fila.real;
                row["Poder Adquisitivo"] = fila.poder_adquisitivo;
                row["Tasa de Inflación (%)"] = fila.inflacion !== null ? fila.inflacion : '-';
                return row;
              });
              copiarTablaAExcel(datosExport, "deflacion_salarial_y_poder_adquisitivo");
            }}
            style={{ backgroundColor: '#107c41', color: 'white', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            title="Copiar tabla para Excel"
          >
            <IconoCopiar /> Copiar Tabla
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="tabla-academica" style={{ width: '100%', color: 'var(--text-color)', textAlign: 'center' }}>
            <thead>
              <tr>
                {resultado.conColumnaItem && <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Ítem</th>}
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Periodo (t)</th>
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Valor Nominal ($)</th>
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>IPC</th>
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Valor Real ($)</th>
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Poder Adquisitivo</th>
                <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Inflación (%)</th>
              </tr>
            </thead>
            <tbody>
              {resultado.datos.map((fila, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'rgba(128,128,128,0.05)' : 'transparent' }}>
                  {resultado.conColumnaItem && <td style={{ borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>{fila.item}</td>}
                  <td style={{ borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>{fila.t}</td>
                  <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.nominal.toFixed(2)}</td>
                  <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.ipc.toFixed(2)}</td>
                  <td style={{ borderBottom: '1px solid var(--border-color)', color: '#388e3c', fontWeight: 'bold' }}>{fila.real.toFixed(2)}</td>
                  <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.poder_adquisitivo.toFixed(4)}</td>
                  <td style={{ borderBottom: '1px solid var(--border-color)', color: fila.inflacion > 0 ? '#d32f2f' : '#388e3c' }}>
                    {fila.inflacion !== null ? `${fila.inflacion > 0 ? '+' : ''}${fila.inflacion.toFixed(2)}%` : '-'}
                  </td>
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