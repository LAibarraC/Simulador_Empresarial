import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LabelList
} from "recharts";

// 👈 RECIBIMOS isMaximized AQUÍ
export default function GraficoEstadistico({ datos = [], tipo = "barras", isMaximized = false, selectedColumn, selectedColumnY }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!Array.isArray(datos) || datos.length === 0) return <p style={{ padding: "20px" }}>No hay datos.</p>;

  const keys = Object.keys(datos[0] || {});
  const xKey = keys.includes('x_i') ? 'x_i' : keys[0]; 
  const yKey = keys.includes('f_i') ? 'f_i' : (keys.find(k => k.toLowerCase().includes('f_i') || k.toLowerCase().includes('frecuencia')) || keys[1]);

  const datosLimpios = datos.filter(item => 
    item[xKey] !== 'Total' && item[xKey] !== 'f_i' && item[xKey] !== 'x_i' && item[xKey] !== undefined
  );

  // 🔠 LETRAS DINÁMICAS
  const isMobile = window.innerWidth < 768;
  const fontSizeDinamico = isMaximized ? (isMobile ? 14 : 18) : 12;
  const axisTextStyle = { fontSize: isMaximized ? (isMobile ? 12 : 14) : 12, fill: '#6b7280' };

  const coloresDinamicos = useMemo(() => {
    return datosLimpios.map((_, index) => `hsl(${(index * 137.5) % 360}, 70%, 50%)`);
  }, [datosLimpios]);

  const renderChart = () => {
    if (tipo === 'barras') {
      return (
        <BarChart data={datosLimpios} margin={{ top: 20, right: 20, left: 25, bottom: 35 }} barCategoryGap={7}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey={xKey} tick={axisTextStyle} dy={10} stroke="#000000"
            label={{ value: selectedColumn || "Categorías", position: 'insideBottom', offset: -10, fill: '#6b7280', fontSize: isMaximized ? 14 : 12, fontWeight: 'bold' }}
          />
          <YAxis 
            tick={axisTextStyle} stroke="#000000" domain={[0, 'auto']}
            label={{ value: selectedColumnY || "Frecuencia absoluta", angle: -90, position: 'insideLeft', offset: -10, fill: '#6b7280', fontSize: isMaximized ? 14 : 12, fontWeight: 'bold', style: { textAnchor: 'middle' } }}
          />
          <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />

          <Bar dataKey={yKey} name="Frecuencia absoluta" fill="#3b82f6" stroke="#424242" strokeWidth={1.5} radius={[1, 1, 0, 0]}>
            <LabelList dataKey={yKey} position="top" fill="var(--text-main)" fontSize={isMaximized ? (isMobile ? 12 : 14) : 12} fontWeight="bold" />
          </Bar>
        </BarChart>
      );
    }

    if (tipo === 'pastel') {
      const pieMargins = isMaximized 
        ? (isMobile ? { top: 40, right: 10, bottom: 40, left: 10 } : { top: 40, right: 40, bottom: 50, left: 40 }) 
        : { top: 10, right: 10, bottom: 20, left: 10 };

      const renderLeyendaEnU = (props) => {
        const { payload } = props;
        const total = payload.length;
        const tercio = Math.ceil(total / 3);
        const datosIzquierda = payload.slice(0, tercio);
        const datosAbajo = payload.slice(tercio, total - tercio);
        const datosDerecha = payload.slice(total - tercio, total);

        const renderItem = (entry, index) => (
          <div
            key={`legend-item-${entry.value}-${index}`}
            style={{
              display: 'flex', alignItems: 'center', cursor: 'pointer', margin: '1px 0',
              opacity: activeIndex === null || activeIndex === String(entry.value) ? 1 : 0.25,
              transition: 'opacity 0.3s ease'
            }}
            onMouseEnter={() => setActiveIndex(String(entry.value))}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div style={{ width: 12, height: 12, backgroundColor: entry.color, marginRight: 6, borderRadius: 2 }} />
            <span style={{ color: 'var(--text-main)' }}>{entry.value}</span>
          </div>
        );

       return (
          <div style={{ 
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', 
            width: '100%', maxWidth: isMaximized ? '800px' : '100%', margin: '0 auto', 
            fontSize: isMaximized ? (isMobile ? '13px' : '18px') : '12px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: isMaximized ? '-80px' : '-50px' }}>
              {datosIzquierda.map(renderItem)}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 15px', flex: 1, padding: '0 10px', marginTop: '30px' }}>
              {datosAbajo.map(renderItem)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginTop: isMaximized ? '-80px' : '-50px' }}>
              {datosDerecha.map(renderItem)}
            </div>
          </div>
        );
      };

      return (
        <PieChart margin={pieMargins}>
          <Pie
            data={datosLimpios} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%"
            innerRadius={isMaximized ? "35%" : "25%"} 
            outerRadius={isMaximized ? "75%" : "65%"}
            paddingAngle={2} labelLine={false} isAnimationActive={false}
            onMouseEnter={(data) => setActiveIndex(String(data.name))}
            onMouseLeave={() => setActiveIndex(null)}
            label={({ cx, cy, midAngle, innerRadius, outerRadius, value, percent }) => {
              if (percent < 0.015) return null;
              const mostrarAdentro = percent >= 0.04;
              const RADIAN = Math.PI / 180;
              const sin = Math.sin(-midAngle * RADIAN);
              const cos = Math.cos(-midAngle * RADIAN);
              
              const innerRadiusText = innerRadius + (outerRadius - innerRadius) * 0.5; 
              const inx = cx + innerRadiusText * cos;
              const iny = cy + innerRadiusText * sin;

              const offset = isMaximized ? (isMobile ? 15 : 25) : 15; 
              const xTextOffset = isMaximized ? 10 : 8; 

              const sx = cx + outerRadius * cos; 
              const sy = cy + outerRadius * sin;
              const mx = cx + (outerRadius + offset * 0.5) * cos; 
              const my = cy + (outerRadius + offset * 0.5) * sin;
              const ex = mx + (cos >= 0 ? 1 : -1) * offset; 
              const ey = my;
              const tx = ex + (cos >= 0 ? 1 : -1) * xTextOffset;
              const ty = ey;
              const textAnchor = cos >= 0 ? 'start' : 'end';
              const fontSizeIn = isMaximized ? (isMobile ? 12 : 22) : 11; 
              const fontSizeOut = isMaximized ? (isMobile ? 14 : 24) : 12; 
              const textColor = 'var(--text-main)';

              return (
                <g>
                  {mostrarAdentro && (
                    <text x={inx} y={iny} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={fontSizeIn} fontWeight="bold">
                      {`${(percent * 100).toFixed(2)}%`}
                    </text>
                  )}
                  <polyline points={`${sx},${sy} ${mx},${my} ${ex},${ey}`} stroke={textColor} fill="none" strokeWidth={1} />
                  <circle cx={ex} cy={ey} r={2} fill={textColor} stroke="none" />
                  <text x={tx} y={ty} dy={4} textAnchor={textAnchor} fill={textColor} fontSize={fontSizeOut} fontWeight="bold">
                    {value}
                  </text>
                </g>
              );
            }}
          >
            {datosLimpios.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} fill={coloresDinamicos[index]} stroke="var(--bg-card)" strokeWidth={1}
                style={{ opacity: activeIndex === null || activeIndex === String(entry[xKey]) ? 1 : 0.25, transition: 'opacity 0.3s ease', cursor: 'pointer' }}
              />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
          <Legend content={renderLeyendaEnU} verticalAlign="bottom" wrapperStyle={{ width: '100%', left: 0, right: 0 }} />
        </PieChart>
      );
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 100, height: 100 }}>
      {renderChart()}
    </ResponsiveContainer>
  );
}