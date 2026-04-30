import React, { useState } from 'react';
import {
  ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function GraficoRegresion({ resultado }) {
  const mejorModelo = resultado.comparativa[0].tipoModelo;
  
  const [lineasVisibles, setLineasVisibles] = useState({
    lineal: mejorModelo === 'lineal',
    exponencial: mejorModelo === 'exponencial',
    logaritmica: mejorModelo === 'logaritmica',
    potencial: mejorModelo === 'potencial',
    reciproco: mejorModelo === 'reciproco'
  });

  const toggleLinea = (tipo) => setLineasVisibles(prev => ({ ...prev, [tipo]: !prev[tipo] }));

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
    });
    datosCurvas.push(punto);
  }

  // Colores vibrantes que se ven bien en modo claro y oscuro
  const colores = {
    lineal: "#8884d8",
    exponencial: "#82ca9d",
    logaritmica: "#ffc658",
    potencial: "#ff7300",
    reciproco: "#e91e63"
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '20px' }}>
      <h4 style={{ textAlign: 'center', marginBottom: '15px', color: 'var(--text-color)' }}>
        Gráfico de Dispersión y Curvas de Ajuste
      </h4>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['lineal', 'exponencial', 'logaritmica', 'potencial', 'reciproco'].map(tipo => {
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

      <div style={{ width: '100%', height: 450, backgroundColor: 'transparent', padding: '10px', borderRadius: '4px' }}>
        <ResponsiveContainer>
          <ComposedChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            {/* Cuadrícula semi-transparente para modo oscuro/claro */}
            <CartesianGrid stroke="rgba(128, 128, 128, 0.3)" strokeDasharray="3 3" vertical={true} horizontal={true} />
            
            <XAxis dataKey="x" type="number" domain={['auto', 'auto']} tick={{fill: 'var(--text-muted)'}} label={{ value: 'Variable X', position: 'bottom', offset: 0, fill: 'var(--text-color)' }} />
            <YAxis tick={{fill: 'var(--text-muted)'}} label={{ value: 'Variable Y', angle: -90, position: 'left', fill: 'var(--text-color)' }} />
            
            {/* Tooltip con fondo adaptativo */}
            <Tooltip 
              formatter={(value) => value.toFixed(4)} 
              contentStyle={{backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-color)'}} 
              itemStyle={{color: 'var(--text-color)'}}
            />
            
            <Legend wrapperStyle={{ paddingTop: '20px', color: 'var(--text-color)' }} />

            <Scatter name="Datos Observados" data={datosReales} dataKey="yReal" fill="#ff0000" shape="circle" />

            {['lineal', 'exponencial', 'logaritmica', 'potencial', 'reciproco'].map(tipo => {
              if (lineasVisibles[tipo]) {
                return (
                  <React.Fragment key={tipo}>
                    <Line data={datosCurvas} type="monotone" dataKey={`y_${tipo}`} name={`Curva ${tipo}`} stroke={colores[tipo]} strokeWidth={3} dot={false} activeDot={false} />
                  </React.Fragment>
                );
              }
              return null;
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}