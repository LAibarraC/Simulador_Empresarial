import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList
} from 'recharts';

import "../../styles/components/graficos/GraficoBivariado.css";

// ==========================================
// 1. SUB-COMPONENTE: BOTÓN MAXIMIZAR
// ==========================================
const MaximizeButton = ({ isExpanded, onToggle }) => (
  <button
    onClick={onToggle}
    title={isExpanded ? "Cerrar" : "Maximizar"}
    className="boton_minimizar"
    style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {isExpanded
        ? <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>
        : <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />}
    </svg>
  </button>
);

// ==========================================
// 2. SUB-COMPONENTE: CONTENIDO DEL GRÁFICO
// ==========================================
const ChartContent = ({ datos, tipo, isExpanded }) => {
  const isStacked = tipo === "apiladas_100";

  const filasStr = [...datos.filas].sort().join();
  const columnasStr = [...datos.columnas].sort().join();
  const esMismaVariable = filasStr === columnasStr;

  const dataGrafico = datos.filas.map(catX => {
    const filaObj = { name: catX };
    datos.columnas.forEach(catY => {
      if (isStacked) {
        const totalFila = datos.totalFilas[catX];
        const valor = datos.datos[catX][catY];
        filaObj[catY] = totalFila > 0 ? Number(((valor / totalFila) * 100).toFixed(2)) : 0;
      } else {
        filaObj[catY] = datos.datos[catX][catY];
      }
    });
    return filaObj;
  }).sort((a, b) => {
    const numA = Number(a.name);
    const numB = Number(b.name);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return String(a.name).localeCompare(String(b.name));
  });

  let ticksEjeY = undefined;
  let limiteEjeY = 'auto';

  if (!isStacked) {
    let maxFrecuencia = 0;
    dataGrafico.forEach(fila => {
      datos.columnas.forEach(col => {
        if (fila[col] > maxFrecuencia) {
          maxFrecuencia = fila[col];
        }
      });
    });

    limiteEjeY = Math.ceil(maxFrecuencia * 2) / 2 + 0.5;
    ticksEjeY = [];
    for (let i = 0; i <= limiteEjeY; i = parseFloat((i + 0.5).toFixed(1))) {
      ticksEjeY.push(i);
    }
  }

  const colores = ["#374151", "#9ca3af", "#6b7280", "#d1d5db"];
  const ejeYLabel = isStacked ? "Porcentaje" : "Frecuencia";

  return (
    <ResponsiveContainer width="100%" height={isExpanded ? "100%" : 255}>
      <BarChart
        data={dataGrafico}
        margin={{ top: 15, right: 20, left: 10, bottom: 10}}
        maxBarSize={60} 
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />

        <XAxis
          dataKey="name"
          tick={{ fontFamily: 'Times New Roman', fontSize: 14, fill: 'var(--text-main)', fontWeight: 'bold' }}
          axisLine={{ stroke: 'var(--text-main)' }}
          tickLine={{ stroke: 'var(--text-main)' }}
        />

        <YAxis
          tick={{ fontFamily: 'Times New Roman', fontSize: 13, fill: 'var(--text-main)', fontWeight: 'bold' }}
          axisLine={{ stroke: 'var(--text-main)' }}
          tickLine={{ stroke: 'var(--text-main)' }}
          label={{
            value: ejeYLabel,
            angle: -90,
            position: 'insideLeft',
            style: { fontFamily: 'Times New Roman', textAnchor: 'middle', fill: 'var(--text-main)', fontWeight: 'bold', fontSize: 14 }
          }}
          ticks={ticksEjeY}
          domain={isStacked ? [0, 100] : [0, limiteEjeY]}
          interval={isStacked ? 'preserveEnd' : 0} 
          tickFormatter={(val) => {
            if (isStacked) return `${val}%`;
            return val.toString().replace('.', ','); 
          }}
        />

        <Tooltip
          cursor={{ fill: 'var(--bg-input)', opacity: 0.4 }}
          contentStyle={{
            fontFamily: 'Times New Roman',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-main)'
          }}
          itemStyle={{ color: 'var(--text-main)' }}
          formatter={(value, name) => [isStacked ? `${value}%` : value, name]}
        />

        <Legend
          wrapperStyle={{ fontFamily: 'Times New Roman', paddingTop: '10px' }}
          iconType="square"
        />

        {datos.columnas.map((catY, index) => {
          const isLightColor = index === 1 || index === 3; 

          return (
            <Bar
              key={catY}
              dataKey={catY}
              fill={colores[index % colores.length]}
              stackId={isStacked ? "a" : (esMismaVariable ? "centrado" : undefined)}
              name={catY}
            >
              <LabelList
                dataKey={catY}
                position={isStacked ? "center" : "top"}
                className='container_bivariado_label'
                style={{
                  fontFamily: 'Times New Roman',
                  fontWeight: 'bold',
                  fontSize: 12,
                  fill: isStacked ? (isLightColor ? '#1f2937' : '#ffffff') : 'var(--text-main)'
                }}
                formatter={(val) => {
                  if (val === 0) return ""; 
                  return isStacked ? `${val}%` : val;
                }}
              />
            </Bar>
          );
        })}
      </BarChart>
    </ResponsiveContainer>
  );
};

// ==========================================
// 3. COMPONENTE PRINCIPAL EXPORTADO
// ==========================================
export default function GraficoBivariado({ datos, tipo }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!datos || datos.tipo !== "bivariada") return null;

  const isStacked = tipo === "apiladas_100";
  const titulo = isStacked ? "Figura 2.14: Gráfico de Barras Apiladas (%)" : "Figura 2.13: Gráfico de Barras Agrupadas";

  return (
    <>
      <div className="container_bivariado" style={{ position: 'relative', minHeight: "340px", display: "flex", flexDirection: "column" }}>
        <MaximizeButton isExpanded={false} onToggle={() => setIsExpanded(true)} />

        <h4 style={{fontSize:'14px', textAlign: 'center', margin: '10px 40px 10px 10px'}}>
          {titulo}
        </h4>
        <div style={{ flex: 1, width: "100%", height: "255px" }}>
          <ChartContent datos={datos} tipo={tipo} isExpanded={false} />
        </div>
      </div>
      {isExpanded && (
        <div className="modal-grafico-overlay" onClick={() => setIsExpanded(false)}>
          <div className="modal-grafico-card" onClick={(e) => e.stopPropagation()} 
               style={{ width: '95vw', maxWidth: '1200px', height: 'auto', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            
            <div className="modal-grafico-header">
              <h2 className="modal-grafico-titulo">{titulo}</h2>
              <MaximizeButton isExpanded={true} onToggle={() => setIsExpanded(false)} />
            </div>
            <div style={{ 
              padding: '20px', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              height: '65vh', 
              minHeight: '350px' 
            }}>
              <ChartContent datos={datos} tipo={tipo} isExpanded={true} />
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}