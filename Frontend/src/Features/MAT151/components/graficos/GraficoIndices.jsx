import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'; // Añadimos 'Cell' aquí

export default function GraficoIndices({ resultado, isMaximized = false, selectedColumn, selectedColumnY, tipoGrafico }) {
  if (!resultado) return null;

  const [zoomEjeY, setZoomEjeY] = useState(false);

  // 🔠 LETRAS Y TAMAÑOS DINÁMICOS
  const isMobile = window.innerWidth < 768;
  const fontSmall = isMaximized && !isMobile ? 14 : 11;
  const fontAxis = isMaximized && !isMobile ? 16 : 12;
  const fontMed = isMaximized && !isMobile ? 18 : 14;

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

  // ==========================================
  // GRÁFICO 1: ÍNDICES COMPUESTOS
  // ==========================================
  if (resultado.tipo === "indices_compuestos") {
    // Agregamos Edgeworth a la lista de datos del gráfico con su color morado
    const dataGrafico = [
      { nombre: 'Laspeyres', valor: resultado.resultados.laspeyres, fill: '#1976d2' },
      { nombre: 'Fisher (Ideal)', valor: resultado.resultados.fisher, fill: '#f57c00' },
      { nombre: 'Edgeworth', valor: resultado.resultados.edgeworth, fill: '#9c27b0' },
      { nombre: 'Paasche', valor: resultado.resultados.paasche, fill: '#388e3c' }
    ];

    const valoresBar = dataGrafico.map(d => d.valor).filter(v => v !== null && v !== undefined && !isNaN(v));
    const minValBar = Math.min(...valoresBar);
    const maxValBar = Math.max(...valoresBar);
    const rangeBar = maxValBar - minValBar;
    const paddingBar = Math.max(1, rangeBar * 0.15);
    const domainMinBar = Math.max(0, Math.floor(minValBar - paddingBar));
    const domainMaxBar = Math.ceil(maxValBar + paddingBar);

    // Para que el gráfico no empiece en 0 y se vean mejor las diferencias
    const minVal = Math.floor(Math.min(...dataGrafico.map(d => d.valor)) - 5);

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: fontMed, fontWeight: 'bold' }}>
            COMPARATIVA DE ÍNDICES DE PRECIOS/CANTIDADES
          </h4>
          {renderZoomToggle()}
        </div>
        <div style={{ flexGrow: 1, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
            <BarChart data={dataGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} vertical={true} horizontal={true} />
              <XAxis dataKey="nombre" tick={{ fill: 'var(--text-variable)', fontSize: fontAxis, fontWeight: 'bold' }} />
              <YAxis domain={zoomEjeY ? [domainMinBar, domainMaxBar] : [0, 'auto']} tick={{ fill: 'var(--text-variable)', fontSize: fontAxis }} tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />
              <Tooltip 
                cursor={{ fill: 'var(--border-color)', opacity: 0.3 }} 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                itemStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }}
                formatter={(value) => `${value.toFixed(2)}%`} 
              />
              <Bar dataKey="valor" radius={[4, 4, 0, 0]} barSize={isMaximized ? 80 : 50}>
                {dataGrafico.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // ==========================================
  // GRÁFICO 2: EMPALME Y CAMBIO DE BASE
  // ==========================================
  if (resultado.tipo === "operaciones_indices") {
    const valoresLine = resultado.datos.flatMap(d => [d.indice_original, d.nuevo_indice]).filter(v => v !== null && v !== undefined && !isNaN(v));
    const minValLine = Math.min(...valoresLine);
    const maxValLine = Math.max(...valoresLine);
    const rangeLine = maxValLine - minValLine;
    const paddingLine = Math.max(5, rangeLine * 0.05);
    const domainMinLine = Math.max(0, Math.floor(minValLine - paddingLine));
    const domainMaxLine = Math.ceil(maxValLine + paddingLine);

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: fontMed, fontWeight: 'bold' }}>
            EVOLUCIÓN HISTÓRICA: ÍNDICE ORIGINAL VS NUEVA BASE
          </h4>
          {renderZoomToggle()}
        </div>
        <div style={{ flexGrow: 1, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
            <LineChart data={resultado.datos} margin={{ top: 20, right: 30, left: 45, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} vertical={true} horizontal={true} />
              
              <XAxis dataKey={resultado.conColumnaItem ? "item" : "t"} tick={{ fill: 'var(--text-variable)', fontSize: fontAxis }} label={{ value: resultado.conColumnaItem ? (resultado.columnaItem || 'Ítems') : (selectedColumn || 'Periodos'), position: 'insideBottom', offset: -25, fill: 'var(--text-variable)', fontSize: fontMed, fontWeight: 'bold' }} />
              <YAxis domain={zoomEjeY ? [domainMinLine, domainMaxLine] : [0, 'auto']} tick={{ fill: 'var(--text-variable)', fontSize: fontAxis }} label={{ value: selectedColumnY || 'Índice', angle: -90, position: 'insideLeft', offset: -30, fill: 'var(--text-variable)', style: { textAnchor: 'middle', fontSize: fontMed, fontWeight: 'bold' } }} tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />
              
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                itemStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }}
                formatter={(value) => value.toFixed(2)} 
              />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '25px', color: 'var(--text-main)', fontSize: fontAxis, fontWeight: 'bold' }} iconType="circle" />
              
              <Line type="linear" dataKey="indice_original" name="Índice Antiguo" stroke="var(--text-muted)" strokeWidth={isMaximized ? 4 : 2} dot={{ r: isMaximized ? 5 : 3 }} strokeDasharray="5 5" />
              <Line type="linear" dataKey="nuevo_indice" name="Nueva Base" stroke="#1976d2" strokeWidth={isMaximized ? 5 : 3} dot={{ r: isMaximized ? 7 : 5 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ marginTop: '0px', padding: '5px 15px', backgroundColor: 'rgba(25, 118, 210, 0.1)', borderLeft: '4px solid #1976d2', borderRadius: '4px' }}>
          <p style={{textAlign: 'center', fontSize: fontSmall, color: 'var(--text-main)', margin: 0, fontWeight: '500'}}>
            Nota que la forma de la curva es idéntica, solo cambia la escala de medición para hacer los datos más actuales.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // GRÁFICO 3: DEFLACIÓN (LA ESTRELLA)
  // ==========================================
  if (resultado.tipo === "deflacion_financiera") {
    if (tipoGrafico === "inflacion_poder") {
      const valoresPoder = resultado.datos.map(d => d.poder_adquisitivo).filter(v => v !== null && v !== undefined && !isNaN(v));
      const minValPoder = Math.min(...valoresPoder);
      const maxValPoder = Math.max(...valoresPoder);
      const rangePoder = maxValPoder - minValPoder;
      const paddingPoder = Math.max(0.1, rangePoder * 0.1);
      const domainMinPoder = Math.max(0, minValPoder - paddingPoder);
      const domainMaxPoder = maxValPoder + paddingPoder;

      const valoresInfl = resultado.datos.map(d => d.inflacion).filter(v => v !== null && v !== undefined && !isNaN(v));
      const minValInfl = Math.min(...valoresInfl);
      const maxValInfl = Math.max(...valoresInfl);
      const rangeInfl = maxValInfl - minValInfl;
      const paddingInfl = Math.max(0.5, rangeInfl * 0.1);
      const domainMinInfl = minValInfl - paddingInfl;
      const domainMaxInfl = maxValInfl + paddingInfl;

      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
            <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: fontMed, fontWeight: 'bold' }}>
              EVOLUCIÓN DE LA INFLACIÓN Y PODER ADQUISITIVO
            </h4>
            {renderZoomToggle()}
          </div>
          <div style={{ flexGrow: 1, minHeight: 300 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
              <LineChart data={resultado.datos} margin={{ top: 20, right: 45, left: 45, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} vertical={true} horizontal={true} />
                
                <XAxis dataKey={resultado.conColumnaItem ? "item" : "t"} tick={{ fill: 'var(--text-variable)', fontSize: fontAxis }} label={{ value: resultado.conColumnaItem ? (resultado.columnaItem || 'Ítems') : (selectedColumn || 'Periodos'), position: 'insideBottom', offset: -25, fill: 'var(--text-variable)', fontSize: fontMed, fontWeight: 'bold' }} />
                
                {/* Eje Y Izquierdo - Poder Adquisitivo */}
                <YAxis 
                  yAxisId="left"
                  tick={{ fill: 'var(--text-variable)', fontSize: fontAxis }} 
                  domain={zoomEjeY ? [domainMinPoder, domainMaxPoder] : [0, 'auto']}
                  label={{ value: 'Poder Adquisitivo', angle: -90, position: 'insideLeft', offset: -30, fill: 'var(--text-variable)', style: { textAnchor: 'middle', fontSize: fontMed, fontWeight: 'bold' } }} 
                  tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : value}
                />
                
                {/* Eje Y Derecho - Inflación */}
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: 'var(--text-variable)', fontSize: fontAxis }} 
                  domain={zoomEjeY ? [domainMinInfl, domainMaxInfl] : [0, 'auto']}
                  label={{ value: 'Tasa de Inflación (%)', angle: 90, position: 'insideRight', offset: -10, fill: 'var(--text-variable)', style: { textAnchor: 'middle', fontSize: fontMed, fontWeight: 'bold' } }} 
                  tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : value}
                />
                
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                  itemStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }}
                  formatter={(value, name) => {
                    if (value === null || value === undefined) return '-';
                    if (name.includes("Inflación")) return `${value.toFixed(2)}%`;
                    return value.toFixed(4);
                  }} 
                />
                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '25px', color: 'var(--text-main)', fontSize: fontAxis, fontWeight: 'bold' }} iconType="circle" />
                
                {/* Línea 1: Poder Adquisitivo */}
                <Line 
                  yAxisId="left"
                  type="linear" 
                  dataKey="poder_adquisitivo" 
                  name="Poder Adquisitivo (Base 100)" 
                  stroke="#1976d2" 
                  strokeWidth={isMaximized ? 5 : 3} 
                  dot={{ r: isMaximized ? 6 : 4 }} 
                  activeDot={{ r: 8 }} 
                />
                
                {/* Línea 2: Inflación */}
                <Line 
                  yAxisId="right"
                  type="linear" 
                  dataKey="inflacion" 
                  name="Tasa de Inflación (%)" 
                  stroke="#d32f2f" 
                  strokeWidth={isMaximized ? 5 : 3} 
                  dot={{ r: isMaximized ? 6 : 4 }} 
                  activeDot={{ r: 8 }} 
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{ marginTop: '0px', padding: '5px 15px', backgroundColor: 'rgba(25, 118, 210, 0.1)', borderLeft: '4px solid #1976d2', borderRadius: '4px' }}>
            <p style={{textAlign: 'center', fontSize: fontSmall, color: 'var(--text-main)', margin: 0, fontWeight: '500'}}>
              El eje izquierdo (azul) mide la pérdida de poder de compra de la moneda. El eje derecho (rojo) mide el ritmo de aumento de precios (Inflación).
            </p>
          </div>
        </div>
      );
    }

    const valoresDef = resultado.datos.flatMap(d => [d.nominal, d.real]).filter(v => v !== null && v !== undefined && !isNaN(v));
    const minValDef = Math.min(...valoresDef);
    const maxValDef = Math.max(...valoresDef);
    const rangeDef = maxValDef - minValDef;
    const paddingDef = Math.max(10, rangeDef * 0.05);
    const domainMinDef = Math.max(0, Math.floor(minValDef - paddingDef));
    const domainMaxDef = Math.ceil(maxValDef + paddingDef);

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: fontMed, fontWeight: 'bold' }}>
            ILUSIÓN MONETARIA: VALOR NOMINAL VS VALOR REAL
          </h4>
          {renderZoomToggle()}
        </div>
        <div style={{ flexGrow: 1, minHeight: 300 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
            <ComposedChart data={resultado.datos} margin={{ top: 20, right: 30, left: 45, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.5} vertical={true} horizontal={true} />
              
              <XAxis dataKey={resultado.conColumnaItem ? "item" : "t"} tick={{ fill: 'var(--text-variable)', fontSize: fontAxis }} label={{ value: resultado.conColumnaItem ? (resultado.columnaItem || 'Ítems') : (selectedColumn || 'Periodos'), position: 'insideBottom', offset: -25, fill: 'var(--text-variable)', fontSize: fontMed, fontWeight: 'bold' }} />
              <YAxis tick={{ fill: 'var(--text-variable)', fontSize: fontAxis }} domain={zoomEjeY ? [domainMinDef, domainMaxDef] : [0, 'auto']} label={{ value: selectedColumnY || 'Dinero ($)', angle: -90, position: 'insideLeft', offset: -30, fill: 'var(--text-variable)', style: { textAnchor: 'middle', fontSize: fontMed, fontWeight: 'bold' } }} tickFormatter={(value) => typeof value === 'number' ? value.toFixed(2) : value} />
              
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                itemStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }}
                formatter={(value) => `$${value.toFixed(2)}`} 
              />
              <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '25px', color: 'var(--text-main)', fontSize: fontAxis, fontWeight: 'bold' }} iconType="circle" />
              
              {/* El dinero que "parece" que ganamos */}
              <Bar dataKey="nominal" name="Valor Nominal (Ilusión)" fill="var(--border-color)" radius={[4, 4, 0, 0]} barSize={isMaximized ? 60 : 40} />
              {/* El poder adquisitivo real */}
              <Line type="linear" dataKey="real" name="Valor Real (Poder Adquisitivo)" stroke="#388e3c" strokeWidth={isMaximized ? 5 : 4} dot={{ r: isMaximized ? 6 : 4 }} activeDot={{ r: 8 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div style={{ marginTop: '0px', padding: '5px 15px', backgroundColor: 'rgba(56, 142, 60, 0.1)', borderLeft: '4px solid #388e3c', borderRadius: '4px' }}>
          <p style={{textAlign: 'center', fontSize: fontSmall, color: 'var(--text-main)', margin: 0, fontWeight: '500'}}>
            Las barras muestran el dinero recibido. La línea verde muestra el verdadero poder adquisitivo ajustado por inflación.
          </p>
        </div>
      </div>
    );
  }

  return null;
}