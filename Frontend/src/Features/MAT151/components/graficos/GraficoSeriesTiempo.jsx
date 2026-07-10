import React, { useState } from 'react';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

export default function GraficoSeriesTiempo({ resultado, tipo, isMaximized = false, selectedColumn, selectedColumnY }) {
  if (!resultado || resultado.tipo !== "series_tiempo") return null;

  const [zoomEjeY, setZoomEjeY] = useState(false);

  // 🔠 LETRAS Y TAMAÑOS DINÁMICOS
  const isMobile = window.innerWidth < 768;
  const fontSmall = isMaximized && !isMobile ? 14 : 11;
  const fontAxis = isMaximized && !isMobile ? 16 : 12;
  const fontMed = isMaximized && !isMobile ? 18 : 14;

  const datos = resultado.datos;
  const tituloModelo = resultado.metodo.replace(/_/g, ' ').toUpperCase();

  const renderZoomToggle = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '0.85em', fontWeight: 'bold', color: 'var(--text-muted)' }}>Ajustar Escala (Zoom Eje Y)</span>
      <button 
        type="button"
        onClick={() => setZoomEjeY(!zoomEjeY)}
        style={{
          width: '38px',
          height: '20px',
          borderRadius: '10px',
          backgroundColor: zoomEjeY ? 'var(--primary-color)' : '#9ca3af',
          position: 'relative',
          padding: 0,
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
          outline: 'none'
        }}
      >
        <div style={{
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          position: 'absolute',
          top: '3px',
          left: zoomEjeY ? '21px' : '3px',
          transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }} />
      </button>
    </div>
  );

  // GRÁFICO 1: LÍNEA DE TENDENCIA (Real vs Pronóstico)
  if (tipo === "historico") {
    const valoresY = datos ? datos.flatMap(d => [d.yReal, d.yPronostico]).filter(v => v !== null && v !== undefined && !isNaN(v)) : [];
    const minValY = valoresY.length > 0 ? Math.min(...valoresY) : 0;
    const maxValY = valoresY.length > 0 ? Math.max(...valoresY) : 100;
    const rangeY = maxValY - minValY;
    const paddingY = Math.max(0.1, rangeY * 0.05);
    const domainMinY = minValY >= 0 
      ? Math.max(0, Math.floor(minValY - paddingY)) 
      : Math.floor(minValY - paddingY);
    const domainMaxY = Math.ceil(maxValY + paddingY);

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: fontMed, fontWeight: 'bold' }}>
            MODELO: {tituloModelo}
          </h4>
          {renderZoomToggle()}
        </div>
        <div style={{ flexGrow: 1, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
            <ComposedChart data={datos} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} vertical={true} horizontal={true} />
              
              <XAxis dataKey="xLabel" tick={{fill: 'var(--text-variable)', fontSize: fontAxis}} label={{ value: selectedColumn || 'Periodos', position: 'insideBottom', offset: -25, fill: 'var(--text-variable)', fontSize: fontMed, fontWeight: 'bold' }} />
              <YAxis 
                tick={{fill: 'var(--text-variable)', fontSize: fontAxis}} 
                domain={zoomEjeY ? [domainMinY, domainMaxY] : [0, 'auto']} 
                label={{ value: selectedColumnY || 'Valor (Y)', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-variable)', style: { textAnchor: 'middle', fontSize: fontMed, fontWeight: 'bold' } }} 
                tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : value}
              />
              
              <Tooltip 
                contentStyle={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}
                itemStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }}
                formatter={(value) => value !== null ? value.toFixed(2) : 'N/A'}
              />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '25px', color: 'var(--text-main)', fontSize: fontAxis, fontWeight: 'bold' }} iconType="circle" />
              
              <Line type="linear" dataKey="yReal" name="Dato Real (Y)" stroke="#1976d2" strokeWidth={isMaximized ? 4 : 3} dot={{ r: isMaximized ? 6 : 4 }} activeDot={{ r: 8 }} />
              <Line type="linear" dataKey="yPronostico" name="Pronóstico (F)" stroke="#ff9800" strokeWidth={isMaximized ? 4 : 3} strokeDasharray="5 5" dot={{ r: isMaximized ? 6 : 4 }} activeDot={{ r: 8 }} connectNulls={true} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ marginTop: '0px', padding: '5px 15px', backgroundColor: 'rgba(255, 152, 0, 0.1)', borderLeft: '4px solid #ff9800', borderRadius: '4px' }}>
          <p style={{textAlign: 'center', fontSize: fontSmall, color: 'var(--text-main)', margin: 0, fontWeight: '500'}}>
            La línea naranja representa la predicción. Cuanto más se superponga a la azul, más exacto es el modelo.
          </p>
        </div>
      </div>
    );
  }

  // GRÁFICO 2: BARRAS DE ERROR (Residuos)
  if (tipo === "pronostico") {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ textAlign: 'center', marginBottom: '15px', color: 'var(--text-main)', fontSize: fontMed, fontWeight: 'bold' }}>
          ANÁLISIS DE ERRORES (RESIDUOS)
        </h4>
        <div style={{ flexGrow: 1, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
            <ComposedChart data={datos} margin={{ top: 20, right: 30, left: 25, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} vertical={true} horizontal={true} />
              
              <XAxis dataKey="xLabel" tick={{fill: 'var(--text-variable)', fontSize: fontAxis}} label={{ value: selectedColumn || 'Periodos', position: 'insideBottom', offset: -25, fill: 'var(--text-variable)', fontSize: fontMed, fontWeight: 'bold' }} />
              <YAxis tick={{fill: 'var(--text-variable)', fontSize: fontAxis}} label={{ value: 'Error (e)', angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-variable)', style: { textAnchor: 'middle', fontSize: fontMed, fontWeight: 'bold' } }} tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />
              
              <Tooltip 
                contentStyle={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'}}
                itemStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }}
                formatter={(value) => value !== null ? value.toFixed(4) : 'N/A'}
              />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '25px', color: 'var(--text-main)', fontSize: fontAxis, fontWeight: 'bold' }} iconType="circle" />
              
              <ReferenceLine y={0} stroke="var(--text-muted)" strokeWidth={2} />
              <Bar dataKey="error" name="Error (Real - Pronóstico)" fill="#f44336" radius={[4, 4, 0, 0]} barSize={isMaximized ? 60 : 40} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ marginTop: '0px', padding: '5px 15px', backgroundColor: 'rgba(244, 67, 54, 0.1)', borderLeft: '4px solid #f44336', borderRadius: '4px' }}>
          <p style={{textAlign: 'center', fontSize: fontSmall, color: 'var(--text-main)', margin: 0, fontWeight: '500'}}>
            Las barras rojas indican qué tanto falló el modelo en cada periodo. Idealmente deben estar cerca de cero.
          </p>
        </div>
      </div>
    );
  }

  return null;
}