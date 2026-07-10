import React, { useState, useEffect } from 'react';
import {
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList
} from 'recharts';

export default function GraficoRegresion({ resultado, isMaximized = false, modelosVisibles, setModelosVisibles, selectedColumn, selectedColumnY }) {
  const mejorModelo = resultado.comparativa[0].tipoModelo;

  // 🔠 LETRAS Y TAMAÑOS DINÁMICOS
  const isMobile = window.innerWidth < 768;
  const fontSmall = isMaximized && !isMobile ? 14 : 11;
  const fontAxis = isMaximized && !isMobile ? 16 : 12;
  const fontMed = isMaximized && !isMobile ? 18 : 14;

  const [localVisibles, setLocalVisibles] = useState({
    lineal: mejorModelo === 'lineal',
    exponencial: mejorModelo === 'exponencial',
    logaritmica: mejorModelo === 'logaritmica',
    potencial: mejorModelo === 'potencial',
    reciproco: mejorModelo === 'reciproco',
    cuadratica: mejorModelo === 'cuadratica',
    cubica: mejorModelo === 'cubica'
  });
  
  const [mostrarLeyenda, setMostrarLeyenda] = useState(true);

  const hasKeys = modelosVisibles && Object.keys(modelosVisibles).length > 0;
  const lineasVisibles = hasKeys ? modelosVisibles : localVisibles;
  const setLineasVisibles = setModelosVisibles || setLocalVisibles;

  const toggleLinea = (tipo) => {
    setLineasVisibles(prev => ({ ...prev, [tipo]: !prev[tipo] }));
  };

  const datosReales = resultado.comparativa[0].datosGrafico;
  const xVals = datosReales.map(d => d.x);
  const minX = Math.min(...xVals);
  const maxX = Math.max(...xVals);

  const datosCurvas = [];
  const pasos = 100;
  const pasoX = (maxX - minX) / pasos;
  const inicioX = minX <= 0 ? 0.001 : minX;

  for (let i = 0; i <= pasos; i++) {
    const xActual = inicioX + (i * pasoX);
    const punto = { x: xActual };
    resultado.comparativa.forEach(modelo => {
      punto[`y_${modelo.tipoModelo}`] = modelo.funcionPredictora(xActual);
      if (modelo.tipoModelo === 'lineal' && i === 50) {
        punto.linealLabel = modelo.ecuacion;
      }
    });
    datosCurvas.push(punto);
  }

  // 2. Definimos la lista completa de modelos
  const listaModelos = ['lineal', 'exponencial', 'logaritmica', 'potencial', 'reciproco', 'cuadratica', 'cubica'];

  // 3. Asignamos colores nuevos para las polinomiales
  const colores = {
    lineal: "#8884d8",
    exponencial: "#82ca9d",
    logaritmica: "#ffc658",
    potencial: "#ff7300",
    reciproco: "#e91e63",
    cuadratica: "#9c27b0", // Púrpura
    cubica: "#00bcd4"      // Cian
  };

  return (
    <div style={{ width: "100%", height: "100%", display: 'flex', flexDirection: 'column', paddingTop: '10px' }}>

      {/* Botón toggle para mostrar/ocultar leyenda de modelos */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '20px', marginBottom: '10px' }}>
        <button
          onClick={() => setMostrarLeyenda(!mostrarLeyenda)}
          style={{
            padding: '5px 12px',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85em',
            fontWeight: 'bold'
          }}
        >
          {mostrarLeyenda ? "Ocultar Leyenda de Modelos" : "Mostrar Leyenda de Modelos"}
        </button>
      </div>

      {mostrarLeyenda && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {listaModelos.map(tipo => {
            const existe = resultado.comparativa.some(m => m.tipoModelo === tipo);
            if (!existe) return null;

            const color = colores[tipo];
            const esMejor = tipo === mejorModelo;

            return (
              <button
                key={tipo}
                onClick={() => toggleLinea(tipo)}
                style={{
                  padding: '6px 15px',
                  borderRadius: '20px',
                  border: `2px solid ${color}`,
                  backgroundColor: lineasVisibles[tipo] ? color : 'transparent',
                  color: lineasVisibles[tipo] ? '#fff' : 'var(--text-color)',
                  cursor: 'pointer',
                  fontWeight: esMejor ? 'bold' : 'normal',
                  textTransform: 'capitalize'
                }}
              >
                {esMejor ? '⭐ ' : ''}{tipo}
              </button>
            );
          })}
        </div>
      )}

      {/* CONTENEDOR CENTRALIZADO Y LIMITADO EN ANCHO */}
      <div style={{ flex: 1, width: '100%', minHeight: '350px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: isMaximized ? '1200px' : '1000px', height: isMaximized ? '90%' : '100%' }}>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
            <ComposedChart margin={{ top: 20, right: 30, left: 45, bottom: 55 }}>
              {/* Cuadrícula semi-transparente para modo oscuro/claro */}
              <CartesianGrid stroke="var(--border-color)" strokeDasharray="3 3" opacity={0.5} vertical={true} horizontal={true} />

              <XAxis 
                dataKey="x" type="number" domain={[0, 'auto']} 
                tick={{ fill: 'var(--text-variable)', fontSize: fontAxis }} 
                label={{ value: selectedColumn || 'Variable X', position: 'insideBottom', offset: -10, fill: 'var(--text-variable)', fontSize: fontMed, fontWeight: 'bold' }} 
              />
              <YAxis 
                tick={{ fill: 'var(--text-variable)', fontSize: fontAxis }} domain={[0, 'auto']}
                label={{ value: selectedColumnY || 'Variable Y', angle: -90, position: 'insideLeft', offset: -30, fill: 'var(--text-variable)', style: { textAnchor: 'middle', fontSize: fontMed, fontWeight: 'bold' } }} 
              />

            {/* Tooltip con fondo adaptativo */}
            <Tooltip
              formatter={(value) => value.toFixed(4)}
              contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)', borderRadius: '8px' }}
              itemStyle={{ color: 'var(--text-main)', fontWeight: 'bold' }}
            />

            {mostrarLeyenda && (
              <Legend verticalAlign="bottom" align="center" wrapperStyle={{ bottom: 0, paddingBottom: '10px', color: 'var(--text-main)', fontSize: fontAxis, fontWeight: 'bold' }} iconType="circle" />
            )}

            <Scatter name="Datos Observados" data={datosReales} dataKey="yReal" fill="#ff0000" shape="circle" />

            {/* 4. Usamos la lista completa para renderizar las líneas condicionalmente */}
            {listaModelos.map(tipo => {
              if (lineasVisibles[tipo]) {
                return (
                  <React.Fragment key={tipo}>
                    <Line data={datosCurvas} type="monotone" dataKey={`y_${tipo}`} name={`Curva ${tipo}`} stroke={colores[tipo]} strokeWidth={isMaximized ? 4 : 3} dot={false} activeDot={false}>
                      {tipo === 'lineal' && (
                        <LabelList 
                          dataKey="linealLabel" 
                          position="top" 
                          offset={10} 
                          style={{ fill: colores[tipo], fontSize: fontMed, fontWeight: 'bold' }} 
                        />
                      )}
                    </Line>
                  </React.Fragment>
                );
              }
              return null;
            })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}