import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ComposedChart, Legend
} from "recharts";

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================
export default function GraficoIntervalos({ datos, tipo = 'histograma', selectedColumn, selectedColumnY }) {
  
  if (!datos || datos.length === 0) return <p style={{ color: "var(--text-muted)", padding: "20px" }}>No hay datos para graficar.</p>;

  // 1. CALCULO DE LA AMPLITUD DE LOS INTERVALOS
  let amplitud = 10;
  if (datos.length > 0) {
    const primerItem = datos[0];
    const intervaloStr = primerItem["Haber básico"] || primerItem["Intervalos"] || primerItem["Intervalo"] || primerItem["Marca de Clase"] || "";
    let partes = [0, 0];
    if (typeof intervaloStr === 'string') {
      const numeros = intervaloStr.match(/-?\d+(\.\d+)?/g);
      if (numeros && numeros.length >= 2) {
        partes = [parseFloat(numeros[0]), parseFloat(numeros[1])];
        amplitud = partes[1] - partes[0];
      }
    }
  }

  // 2. PROCESAMIENTO EXCLUSIVO PARA EL EJE X NUMÉRICO
  const limitesSet = new Set();
  const datosProcesados = datos.map(item => {
    // Busca la columna correcta (nuestra nueva tabla usa "Intervalo")
    const intervaloStr = item["Haber básico"] || item["Intervalos"] || item["Intervalo"] || item["Marca de Clase"] || "";
    let partes = [0, 0];
    
    if (typeof intervaloStr === 'string') {
      // Extrae cualquier número ignorando corchetes, comas o guiones
      const numeros = intervaloStr.match(/-?\d+(\.\d+)?/g);
      
      if (numeros && numeros.length >= 2) {
        partes = [parseFloat(numeros[0]), parseFloat(numeros[1])];
      } else {
        // Si solo hay un número, simulamos un ancho
        const val = parseFloat(intervaloStr);
        partes = [val - 5, val + 5]; 
      }
    }
    
    // Extraemos límites para los ticks
    if (!isNaN(partes[0])) limitesSet.add(partes[0]);
    if (!isNaN(partes[1])) limitesSet.add(partes[1]);

    return {
      Intervalo: typeof intervaloStr === 'string' ? intervaloStr : intervaloStr.toString(),
      midpoint: (partes[0] + partes[1]) / 2, // Calculamos el centro para centrar las barras/puntos
      f_i: Number(item["f_i"] || item["fi"] || 0),
      F_i: Number(item["F_i"] || item["Fi"] || 0),
      // Nos aseguramos de capturar la clave F_i_inv que definimos en la tabla
      "F_i_inv": Number(item["F_i_inv"] || item["F'i"] || 0) 
    };
  });

  let limites = Array.from(limitesSet).sort((a, b) => a - b);

  // Ampliar límites y generar datos del polígono para cerrar la línea en el eje X
  let datosPoligono = datosProcesados;
  if ((tipo === 'poligono' || tipo === 'mixto') && limites.length >= 2) {
    // Agregar límites virtuales en los extremos para la visualización del eje
    limitesSet.add(limites[0] - amplitud);
    limitesSet.add(limites[limites.length - 1] + amplitud);
    limites = Array.from(limitesSet).sort((a, b) => a - b);

    // Insertar puntos con frecuencia 0 al inicio y al final
    if (datosProcesados.length > 0) {
      const primerMidpoint = datosProcesados[0].midpoint;
      const ultimoMidpoint = datosProcesados[datosProcesados.length - 1].midpoint;
      
      const virtualStart = {
        Intervalo: "",
        midpoint: primerMidpoint - amplitud,
        f_i: 0,
        F_i: 0,
        F_i_inv: 0
      };
      
      const virtualEnd = {
        Intervalo: "",
        midpoint: ultimoMidpoint + amplitud,
        f_i: 0,
        F_i: 0,
        F_i_inv: 0
      };

      datosPoligono = [virtualStart, ...datosProcesados, virtualEnd];
    }
  }

  // 3. CONFIGURACIÓN COMÚN DE RECHARTS
  const currentAxisStyle = { fontSize: 12, fill: 'var(--text-main)' };
  const commonProps = { margin: { top: 20, right: 30, bottom: 35, left: 35 } };
  const commonGrid = <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #e0e0e0)" />;
  const commonY = (
    <YAxis 
      tick={currentAxisStyle} stroke="var(--text-main)" domain={[0, 'auto']}
      label={{ value: selectedColumnY || "Frecuencia", angle: -90, position: 'insideLeft', offset: -10, fill: 'var(--text-main)', fontSize: 12, fontWeight: 'bold', style: { textAnchor: 'middle' } }}
    />
  );
  const commonTooltip = <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />;
  const commonLegend = <Legend wrapperStyle={{ fontSize: '0.9rem', color: 'var(--text-main)', paddingTop: '10px' }} />;

  const domainX = limites.length >= 2 ? [limites[0], limites[limites.length - 1]] : [0, 'auto'];
  const commonX = (
    <XAxis 
      type="number" 
      dataKey="midpoint" 
      ticks={limites} 
      domain={domainX} 
      tick={currentAxisStyle} 
      stroke="var(--text-main)" 
      label={{ value: selectedColumn || "Intervalos", position: 'insideBottom', offset: -10, fill: 'var(--text-main)', fontSize: 12, fontWeight: 'bold' }}
    />
  );

  // 4. RENDERIZADO CONDICIONAL SEGÚN LA ORDEN RECIBIDA
  const renderChart = () => {
    switch (tipo) {
      case 'histograma':
        return (
          <BarChart data={datosProcesados} {...commonProps} barCategoryGap={0}>
            {commonGrid}{commonX}{commonY}{commonTooltip}{commonLegend}
            <Bar dataKey="f_i" fill="#1976d2" name="Frecuencia Absoluta" radius={[2, 2, 0, 0]} />
          </BarChart>
        );
      case 'poligono':
        return (
          <LineChart data={datosPoligono} {...commonProps}>
            {commonGrid}{commonX}{commonY}{commonTooltip}{commonLegend}
            <Line type="linear" dataKey="f_i" stroke="#1976d2" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Frecuencia Absoluta" />
          </LineChart>
        );
      case 'ojiva':
      case 'ojiva_creciente':
        return (
          <LineChart data={datosProcesados} {...commonProps}>
            {commonGrid}{commonX}{commonY}{commonTooltip}{commonLegend}
            <Line type="linear" dataKey="F_i" stroke="#388e3c" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Frecuencia Acumulada Menor que" />
          </LineChart>
        );
      case 'ojiva_decreciente':
        return (
          <LineChart data={datosProcesados} {...commonProps}>
            {commonGrid}{commonX}{commonY}{commonTooltip}{commonLegend}
            <Line type="linear" dataKey="F_i_inv" stroke="#d32f2f" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Frecuencia Acumulada Mayor que" />
          </LineChart>
        );
      case 'interseccion_ojivas':
        return (
          <LineChart data={datosProcesados} {...commonProps}>
            {commonGrid}{commonX}{commonY}{commonTooltip}{commonLegend}
            <Line type="linear" dataKey="F_i" stroke="#388e3c" strokeWidth={3} dot={{ r: 4 }} name="Ojiva Creciente (Menor que)" />
            <Line type="linear" dataKey="F_i_inv" stroke="#d32f2f" strokeWidth={3} dot={{ r: 4 }} name="Ojiva Decreciente (Mayor que)" />
          </LineChart>
        );
      case 'mixto':
      default:
        return (
          <ComposedChart data={datosPoligono} {...commonProps} barCategoryGap={0}>
            {commonGrid}{commonX}{commonY}{commonTooltip}{commonLegend}
            <Bar dataKey="f_i" fill="rgba(25, 118, 210, 0.5)" name="Histograma" />
            <Line type="linear" dataKey="f_i" stroke="#1976d2" strokeWidth={3} dot={{ r: 5 }} name="Polígono" />
          </ComposedChart>
        );
    }
  };

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "250px" }}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}