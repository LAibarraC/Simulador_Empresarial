import React from 'react';
import { copiarTablaAExcel } from "../../utils/exportUtils";
import { IconoCopiar } from "../../../../ui/iconos";

export default function TablaSeriesTiempo({ resultado }) {
  if (!resultado || resultado.tipo !== "series_tiempo") return null;

  return (
    <div style={{ padding: '15px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>

      {/* 1. INDICADORES GLOBALES */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px', backgroundColor: 'rgba(128, 128, 128, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <div style={{ flex: '1 1 auto' }}>
          <span style={{ display: 'block', fontSize: '0.85em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Método de Pronóstico</span>
          <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: 'var(--primary-color)', textTransform: 'capitalize' }}>
            {resultado.metodo.replace('_', ' ')}
          </span>
        </div>
        <div style={{ flex: '1 1 auto', borderLeft: '1px solid var(--border-color)', paddingLeft: '15px' }}>
          <span style={{ display: 'block', fontSize: '0.85em', color: 'var(--text-muted)', textTransform: 'uppercase' }} title="Desviación Absoluta Media">DAM (Error Medio)</span>
          <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: 'var(--text-color)' }}>
            {resultado.indicadores.mad.toFixed(4)}
          </span>
        </div>
        <div style={{ flex: '1 1 auto', borderLeft: '1px solid var(--border-color)', paddingLeft: '15px' }}>
          <span style={{ display: 'block', fontSize: '0.85em', color: 'var(--text-muted)', textTransform: 'uppercase' }} title="Error Cuadrático Medio">ECM (Error Cuadrático)</span>
          <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: 'var(--text-color)' }}>
            {resultado.indicadores.mse.toFixed(4)}
          </span>
        </div>
      </div>

      {/* 2. TABLA CRONOLÓGICA */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button
          className="btn-icon"
          onClick={() => copiarTablaAExcel(resultado.datos, "series_tiempo")}
          style={{ backgroundColor: '#107c41', color: 'white', padding: '6px 14px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          title="Copiar datos puros para Excel"
        >
          <IconoCopiar /> Copiar Tabla
        </button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="tabla-academica" style={{ width: '100%', color: 'var(--text-color)', textAlign: 'center' }}>
          <thead>
            <tr>
              <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Periodo (t)</th>
              <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Tiempo (X)</th>
              <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Valor Real (Y)</th>
              <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Pronóstico (F)</th>
              <th style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>Error (e)</th>
            </tr>
          </thead>
          <tbody>
            {resultado.datos.map((fila, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? 'rgba(128,128,128,0.05)' : 'transparent' }}>
                <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.t}</td>
                <td style={{ borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>{fila.xLabel}</td>
                <td style={{ borderBottom: '1px solid var(--border-color)' }}>{fila.yReal.toFixed(2)}</td>
                <td style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                  {fila.yPronostico !== null ? fila.yPronostico.toFixed(4) : '-'}
                </td>
                <td style={{ borderBottom: '1px solid var(--border-color)', color: fila.error === null ? 'inherit' : (fila.error < 0 ? '#d32f2f' : '#388e3c') }}>
                  {fila.error !== null ? fila.error.toFixed(4) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}