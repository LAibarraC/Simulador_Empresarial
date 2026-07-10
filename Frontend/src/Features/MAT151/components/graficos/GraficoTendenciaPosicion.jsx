import React from 'react';
import { 
  ComposedChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';

export default function GraficoTendenciaPosicion({ tipo, graficos, indicadores, isMaximized = false, selectedColumn }) {
  if (!graficos || graficos.length === 0) return null;

  // 🔠 LETRAS Y TAMAÑOS DINÁMICOS
  const isMobile = window.innerWidth < 768;
  const fontSizeAxis = isMaximized ? (isMobile ? 12 : 14) : 11;
  const fontSizeRef = isMaximized ? (isMobile ? 18 : 24) : 18;

  // ------------------------------------------
  // 1. HISTOGRAMA CON LÍNEAS DE TENDENCIA
  // ------------------------------------------
  if (tipo === "histograma_tendencia") {
    // Buscamos a qué etiqueta de "rango" pertenece la media, mediana y moda
    // para que Recharts sepa dónde pintar exactamente la línea vertical
    const getRangoForValue = (val) => {
      const match = graficos.find(g => val >= g.desde && val <= g.hasta);
      return match ? match.rango : graficos[0].rango;
    };

    const maxFrecuencia = Math.max(...graficos.map(g => g.frecuencia));
    const limiteEjeY = maxFrecuencia + 1;
    const ticksEjeY = [];
    for (let i = 0; i <= limiteEjeY; i += 0.5) {
      ticksEjeY.push(i);
    }

    return (
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
        <ComposedChart data={graficos} margin={{ top: 35, right: 20, left: 10, bottom: 35 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="rango" stroke="var(--text-variable)" tick={{ fontSize: fontSizeAxis, fill: 'var(--text-variable)' }} label={{ value: selectedColumn || 'Intervalos', position: 'insideBottom', offset: -10, fill: 'var(--text-variable)', fontWeight: 'bold' }} />
          <YAxis
            stroke="var(--text-variable)"
            ticks={ticksEjeY}
            domain={[0, limiteEjeY]}
            tickFormatter={(valor) => valor.toString().replace('.', ',')}
            tick={{ fontSize: fontSizeAxis, fill: 'var(--text-variable)' }}
            label={{ value: 'Frecuencia (fi)', angle: -90, position: 'insideLeft', offset: -10, style: { textAnchor: 'middle', fontWeight: 'bold' } }}
          />
          <Tooltip />
          <Bar dataKey="frecuencia" fill="#3498db" name="Frecuencia" barSize={isMaximized ? 80 : 50} />
          
          {/* Líneas verticales mostrando la posición de la Media, Mediana y Moda */}
          {indicadores && (
            <>
              <ReferenceLine x={getRangoForValue(indicadores.media)} stroke="#e74c3c" strokeDasharray="3 3" strokeWidth={isMaximized ? 3 : 2} label={{ value: 'x̄', position: 'top', fill: '#e74c3c', fontSize: fontSizeRef, fontWeight: 'bold' }} />
              <ReferenceLine x={getRangoForValue(indicadores.mediana)} stroke="#2ecc71" strokeDasharray="3 3" strokeWidth={isMaximized ? 3 : 2} label={{ value: 'Me', position: 'insideTopLeft', fill: '#2ecc71', fontSize: fontSizeRef, fontWeight: 'bold' }} />
              <ReferenceLine x={getRangoForValue(indicadores.moda)} stroke="#9b59b6" strokeDasharray="3 3" strokeWidth={isMaximized ? 3 : 2} label={{ value: 'Mo', position: 'insideTopRight', fill: '#9b59b6', fontSize: fontSizeRef, fontWeight: 'bold' }} />
            </>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  // ------------------------------------------
  // 2. GRÁFICO DE OJIVA (Frecuencias Acumuladas)
  // ------------------------------------------
  if (tipo === "ojiva") {
    // Usamos P_i (que ya es 0-1) y agregamos el punto inicial
    const ojivaData = [
      { hasta: graficos[0].desde, P_i: 0 }, 
      ...graficos
    ];

    return (
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
        <LineChart data={ojivaData} margin={{ top: 10, right: 20, left: 10, bottom: 35 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="hasta"
            stroke="var(--text-variable)"
            tick={{ fontSize: fontSizeAxis, fill: 'var(--text-variable)' }}
            label={{ value: selectedColumn || 'Límite Superior', position: 'insideBottom', offset: -10, fill: 'var(--text-variable)', style: { textAnchor: 'middle', fontWeight: 'bold' } }}
          />
          <YAxis
            domain={[0, 1]} // 👈 DOMINIO CORREGIDO: De 0 a 1
            stroke="var(--text-variable)"
            tick={{ fontSize: fontSizeAxis, fill: 'var(--text-variable)' }}
            label={{ value: 'Frecuencia Acumulada', angle: -90, position: 'insideLeft', offset: -10, style: { textAnchor: 'middle', fontWeight: 'bold' } }}
          />
          {/* 👈 TOOLTIP: Mostramos formato decimal limpio */}
          <Tooltip formatter={(value) => [value.toFixed(4), 'Proporción']} />
          
          <Line type="linear" dataKey="P_i" stroke="#e67e22" strokeWidth={isMaximized ? 5 : 3} dot={{ r: isMaximized ? 8 : 5 }} activeDot={{ r: isMaximized ? 12 : 8 }} name="Ojiva" />
        </LineChart>
      </ResponsiveContainer>
    );
  }
  return null;
}

