import React, { useState } from 'react';
import { 
  ComposedChart, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Line, Cell, ReferenceLine, ReferenceArea, Scatter 
} from 'recharts';

// --- COMPONENTE INTERNO 1: TOOLTIP PROFESIONAL PARA EL BOXPLOT ---
const BoxplotTooltip = ({ active, estadisticas }) => {
  if (active && estadisticas) {
    const hayOutliers = estadisticas.outliers && estadisticas.outliers.length > 0;
    return (
      <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', borderBottom: '1px solid #eee', color: '#2c3e50' }}>Boxplot Académico (Método Tukey)</p>
        <p style={{ margin: 0, fontSize: '0.9em' }}>Límite Sup. (LSIS): <b style={{color: '#95a5a6'}}>{estadisticas.LSIS.toFixed(2)}</b></p>
        <p style={{ margin: 0, fontSize: '0.9em' }}>Max. Adyacente (Bigote): <b>{estadisticas.maxAdyacente.toFixed(2)}</b></p>
        <p style={{ margin: 0, fontSize: '0.9em' }}>Q3 (75%): <b>{estadisticas.q3.toFixed(2)}</b></p>
        <p style={{ margin: '3px 0', fontSize: '1em', color: '#e74c3c', fontWeight: 'bold' }}>Mediana: {estadisticas.mediana.toFixed(2)}</p>
        <p style={{ margin: 0, fontSize: '0.9em' }}>Q1 (25%): <b>{estadisticas.q1.toFixed(2)}</b></p>
        <p style={{ margin: 0, fontSize: '0.9em' }}>Min. Adyacente (Bigote): <b>{estadisticas.minAdyacente.toFixed(2)}</b></p>
        <p style={{ margin: 0, fontSize: '0.9em' }}>Límite Inf. (LIIS): <b style={{color: '#95a5a6'}}>{estadisticas.LIIS.toFixed(2)}</b></p>
        {hayOutliers && (
          <div style={{marginTop: '5px', borderTop: '1px solid #eee', color: '#e74c3c', fontSize: '0.9em'}}>
            <b>Valores Atípicos ({estadisticas.outliers.length}):</b> {estadisticas.outliers.join(', ')}
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Truco para ocultar los puntos guía y solo mostrar las líneas
const EmptyShape = () => <g></g>;

// ==========================================
// COMPONENTE PRINCIPAL EXPORTADO
// ==========================================
export default function GraficoDispersionForma({ tipo, resultado, isMaximized = false, selectedColumn }) {
  if (!resultado || !resultado.graficos) return null;
  const { estadisticas, graficos } = resultado;

  const [zoomActivo, setZoomActivo] = useState(false);

  // 🔠 LETRAS Y TAMAÑOS DINÁMICOS
  const isMobile = window.innerWidth < 768;
  const fontSmall = isMaximized && !isMobile ? 16 : 11;
  const fontMed = isMaximized && !isMobile ? 20 : 14;
  const fontAxis = isMaximized && !isMobile ? 14 : 12;

  const renderZoomToggle = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '0.85em', fontWeight: 'bold', color: 'var(--text-muted)' }}>Ajustar Escala (Zoom)</span>
      <button 
        type="button"
        onClick={() => setZoomActivo(!zoomActivo)}
        style={{
          width: '38px',
          height: '20px',
          borderRadius: '10px',
          backgroundColor: zoomActivo ? 'var(--primary-color)' : '#9ca3af',
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
          left: zoomActivo ? '21px' : '3px',
          transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
        }} />
      </button>
    </div>
  );

  // ------------------------------------------
  // 1. DIBUJAR BOXPLOT ACADÉMICO (Método Nativo INFALIBLE)
  // ------------------------------------------
  if (tipo === "boxplot") {
    const { absoluteMin, absoluteMax, minAdyacente, maxAdyacente, q1, mediana, q3, outliers } = estadisticas;

    // Le damos aire a los lados del gráfico para que no choque con los bordes
    const offset = (absoluteMax - absoluteMin) * 0.1;
    const minDomain = absoluteMin - offset;
    const maxDomain = absoluteMax + offset;

    // Preparamos las coordenadas matemáticas exactas de cada línea del Boxplot
    const whiskerData = [{ x: minAdyacente, y: 1 }, { x: maxAdyacente, y: 1 }];
    const leftStopperData = [{ x: minAdyacente, y: 0.8 }, { x: minAdyacente, y: 1.2 }];
    const rightStopperData = [{ x: maxAdyacente, y: 0.8 }, { x: maxAdyacente, y: 1.2 }];
    const medianData = [{ x: mediana, y: 0.7 }, { x: mediana, y: 1.3 }];
    
    // Puntos atípicos flotantes
    const outliersData = outliers ? outliers.map(o => ({ x: o, y: 1 })) : [];

    const ticksX = [minAdyacente, q1, mediana, q3, maxAdyacente];

    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }} data-html2canvas-ignore="true">
          {renderZoomToggle()}
        </div>
        <div style={{ flexGrow: 1, minHeight: 280 }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
            <ComposedChart margin={{ top: 50, right: 30, bottom: 35, left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} opacity={0.2} />
              {/* Ejes numéricos reales */}
              <XAxis 
                type="number" dataKey="x" domain={zoomActivo ? [minDomain, maxDomain] : [0, 'auto']} name="Valores" ticks={ticksX} 
                tick={{ fontSize: fontAxis, fontWeight: 'bold', fill: 'var(--text-variable)' }} 
                tickFormatter={tick => tick.toFixed(2)} stroke="var(--text-variable)"
                label={{ value: selectedColumn || "Valores", position: 'insideBottom', offset: -10, fill: 'var(--text-variable)', fontSize: fontAxis, fontWeight: 'bold' }}
              />
              <YAxis type="number" dataKey="y" domain={[0, 2]} hide />
              
              <Tooltip content={<BoxplotTooltip estadisticas={estadisticas} />} cursor={{strokeDasharray: '3 3'}} />
              
              {/* Etiquetas con variables CSS para Modo Oscuro */}
              <ReferenceLine x={minAdyacente} stroke="var(--border-color)" strokeDasharray="3 3" label={{ value: 'Min', position: 'top', fill: 'var(--text-variable)', fontSize: fontSmall, fontWeight: 'bold', dy: -10 }} />
              <ReferenceLine x={maxAdyacente} stroke="var(--border-color)" strokeDasharray="3 3" label={{ value: 'Max', position: 'top', fill: 'var(--text-variable)', fontSize: fontSmall, fontWeight: 'bold', dy: -10 }} />
              <ReferenceLine x={q1} stroke="#0099ff" strokeDasharray="3 3" label={{ value: 'Q1', position: 'top', fill: 'var(--text-main)', fontSize: fontMed, fontWeight: 'bold', dy: -25 }} />
              <ReferenceLine x={mediana} stroke="#f93b3b" strokeDasharray="3 3" label={{ value: 'Me', position: 'top', fill: '#e74c3c', fontSize: fontMed, fontWeight: 'bold', dy: -25 }} />
              <ReferenceLine x={q3} stroke="#0099ff" strokeDasharray="3 3" label={{ value: 'Q3', position: 'top', fill: 'var(--text-main)', fontSize: fontMed, fontWeight: 'bold', dy: -25 }} />

              {/* 1. LA CAJA CENTRAL (Usa área nativa de Recharts) */}
              <ReferenceArea x1={q1} x2={q3} y1={0.7} y2={1.3} fill="rgba(52, 152, 219, 0.2)" stroke="#3498db" strokeWidth={isMaximized ? 3 : 2} />

              {/* 2. LOS BIGOTES Y LÍNEAS (Usan conexiones nativas de Scatter) */}
              <Scatter data={whiskerData} line={{ stroke: '#3498db', strokeWidth: isMaximized ? 3 : 2 }} shape={<EmptyShape />} isAnimationActive={false} />
              <Scatter data={leftStopperData} line={{ stroke: '#3498db', strokeWidth: isMaximized ? 3 : 2 }} shape={<EmptyShape />} isAnimationActive={false} />
              <Scatter data={rightStopperData} line={{ stroke: '#3498db', strokeWidth: isMaximized ? 3 : 2 }} shape={<EmptyShape />} isAnimationActive={false} />
              <Scatter data={medianData} line={{ stroke: '#e74c3c', strokeWidth: isMaximized ? 4 : 3 }} shape={<EmptyShape />} isAnimationActive={false} />

              {/* 3. VALORES ATÍPICOS (Puntos Rojos) */}
              {outliersData.length > 0 && (
                <Scatter data={outliersData} fill="#e74c3c" shape="circle" isAnimationActive={true} />
              )}
              
              {/* Truco: Punto invisible en la caja para que el Tooltip reaccione fácilmente al pasar el mouse */}
              <Scatter data={[{x: mediana, y: 1}]} fill="transparent" shape={<EmptyShape />} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // 2. DIBUJAR HISTOGRAMA + CAMPANA DE GAUSS
  // ------------------------------------------
  if (tipo === "campana") {
    const maxFrecuencia = Math.max(...graficos.histograma.map(g => g.frecuencia));
    const limiteEjeY = Math.ceil(maxFrecuencia * 2) / 2 + 0.5;

    const ticksEjeY = [];
    for (let i = 0; i <= limiteEjeY; i = parseFloat((i + 0.5).toFixed(1))) {
      ticksEjeY.push(i);
    }

    return (
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
        <ComposedChart data={graficos.histograma} margin={{ top: 15, right: 20, left: 10, bottom: 35 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
          <XAxis dataKey="rango" stroke="var(--text-variable)" tick={{ fill: 'var(--text-variable)', fontSize: fontAxis }} label={{ value: selectedColumn || 'Intervalos', position: 'insideBottom', offset: -10, fill: 'var(--text-variable)', fontWeight: 'bold' }} />
          <YAxis stroke="var(--text-variable)" ticks={ticksEjeY} domain={[0, limiteEjeY]} interval={0} tickFormatter={(valor) => valor.toString().replace('.', ',')} tick={{ fill: 'var(--text-variable)', fontSize: fontAxis, fontWeight: 'bold' }} label={{ value: 'Frecuencia (fi)', angle: -90, position: 'insideLeft', fill: 'var(--text-variable)', fontWeight: 'bold', style: { textAnchor: 'middle', fontSize: fontMed } }} />
          <Tooltip cursor={{ fill: 'var(--border-color)', opacity: 0.2 }} contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)', borderRadius: '5px' }} formatter={(value, name) => [value.toFixed(2), name]} />
          <Bar dataKey="frecuencia" fill="#3498db" name="Frecuencia Observada" barSize={isMaximized ? 80 : 50} radius={[4, 4, 0, 0]} />
          <Line type="linear" dataKey="curvaNormal" stroke="#e74c3c" strokeWidth={isMaximized ? 5 : 3} dot={false} name="Curva Normal Teórica" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  // ------------------------------------------
  // 3. DIBUJAR DESVIACIONES (x - media)
  // ------------------------------------------
  if (tipo === "desviaciones") {
    return (
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
        <BarChart data={graficos.desviaciones} margin={{ top: 15, right: 20, left: 35, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="id" hide stroke="var(--text-variable)" />
          <YAxis stroke="var(--text-variable)" tick={{ fill: 'var(--text-variable)', fontSize: fontAxis, fontWeight: 'bold' }} label={{ value: `Desviaciones (${selectedColumn || 'Valores'})`, angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-variable)', fontWeight: 'bold', fontSize: fontMed, style: { textAnchor: 'middle' } }} />
          <Tooltip formatter={(value, name, props) => [`${value.toFixed(2)}`, `Valor real: ${props.payload.valor}`]} />
          
          <ReferenceLine y={0} stroke="var(--text-main)" strokeWidth={isMaximized ? 3 : 2} label={{ value: "Media (x̄)", fill: 'var(--text-main)' }} />
          
          <Bar dataKey="desviacion" name="Desviación de la Media">
            {graficos.desviaciones.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.desviacion > 0 ? '#2ecc71' : '#e74c3c'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return null;
}