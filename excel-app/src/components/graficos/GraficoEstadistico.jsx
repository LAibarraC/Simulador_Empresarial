// ✅ GraficoEstadistico.jsx
import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, Brush, LabelList
} from "recharts";

// =========================================================
// 1. SUB-COMPONENTES (Copiado de GraficoIntervalos)
// =========================================================

const MaximizeButton = ({ isExpanded, onToggle }) => (
  <button
    onClick={onToggle}
    title={isExpanded ? "Cerrar" : "Maximizar"}
    className="boton_minimizar"
    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--border-color)"}
    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "var(--bg-input)"}
    style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {isExpanded
        ? <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>
        : <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />}
    </svg>
  </button>
);

const ChartContent = ({ tipo, datos, isExpanded }) => {
  const axisTextStyle = { fontSize: 12, fill: '#6b7280' };
  const isMobile = window.innerWidth < 768; // Detecta si la pantalla es menor a 768px

  const [activeIndex, setActiveIndex] = useState(null);
  const coloresDinamicos = useMemo(() => {
    const datosParaColores = tipo === 'pastel' 
      ? datos.filter(item => item.x_i !== 'f_i' && item.x_i !== 'x_i' && item.x_i !== 'Total')
      : datos;

    return datosParaColores.map((_, index) => {
      const hue = (index * 137.5) % 360;
      return `hsl(${hue}, 70%, 50%)`;
    });
  }, [datos, tipo]); // <- Añadí 'tipo' como dependencia

  switch (tipo) {
    case 'barras':
      return (
        <BarChart
          data={datos}
          margin={{ top: 20, right: 20, left: -20, bottom: 20 }}
          barCategoryGap={7} // 👈 1. Esto elimina la separación entre las barras
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="x_i" tick={axisTextStyle} dy={10} stroke="#000000" />
          <YAxis tick={axisTextStyle} stroke="#000000" />

          <Tooltip
            cursor={{ fill: '#f3f4f6' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />

          <Bar
            dataKey="f_i"
            fill="#3b82f6"
            name="Frecuencia absoluta"
            stroke="#424242"
            strokeWidth={1.5}
            radius={[1, 1, 0, 0]}
          >
            <LabelList
              dataKey="f_i"
              position="top"
              fill="var(--text-main)"
              fontSize={isExpanded ? 14 : 12}
              fontWeight="bold"
            />
          </Bar>

        </BarChart>
      );
case 'pastel': { 
      const datosLimpios = datos.filter(item => item.x_i !== 'f_i' && item.x_i !== 'x_i' && item.x_i !== 'Total');
      const pieMargins = isExpanded 
        ? (isMobile 
            ? { top: 40, right: 10, bottom: 40, left: 10 } // Móvil maximizado
            : { top: 40, right: 40, bottom: 50, left: 40 }) // Escritorio maximizado
        : { top: 10, right: 10, bottom: 20, left: 10 };
        

      const renderLeyendaEnU = (props) => {
        const { payload } = props;
        const payloadLimpio = payload.filter(entry => 
            entry.value !== 'f_i' && entry.value !== 'x_i' && entry.value !== 'Total'
        );
        const total = payloadLimpio.length;
        const tercio = Math.ceil(total / 3);
        const datosIzquierda = payload.slice(0, tercio);
        const datosAbajo = payload.slice(tercio, total - tercio);
        const datosDerecha = payload.slice(total - tercio, total);

        const renderItem = (entry, index) => (
          <div
            key={`legend-item-${entry.value}-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              opacity: activeIndex === null || activeIndex === String(entry.value) ? 1 : 0.25,
              transition: 'opacity 0.3s ease',
              margin: '1px 0'
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
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            width: '100%', 
            maxWidth: isExpanded ? '650px' : '100%', 
            margin: '0 auto', 
            marginLeft: isExpanded ? 'auto' : '0px',  
            marginRight: isExpanded ? 'auto' : '0px', 
            fontSize: isExpanded ? '13px' : '11px'
          }}>
            
            <div style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              marginTop: isExpanded ? '-80px' : '-50px' 
            }}>
              {datosIzquierda.map(renderItem)}
            </div>

            <div style={{ 
              display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 15px', flex: 1, padding: '0 10px',
              marginTop: '30px' 
            }}>
              {datosAbajo.map(renderItem)}
            </div>

            <div style={{ 
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
              marginTop: isExpanded ? '-80px' : '-50px' 
            }}>
              {datosDerecha.map(renderItem)}
            </div>

          </div>
        );
      };

      return (
        <PieChart margin={pieMargins}>
          <Pie
           data={datosLimpios} 
            dataKey="f_i"
            nameKey="x_i"
            cx="50%"
            cy="50%"
            innerRadius={isExpanded ? 30 : 10} 
            outerRadius={isExpanded 
              ? (isMobile ? 85 : 115) 
              : 75}
            fill="#8884d8"
            paddingAngle={2} 
            labelLine={false}
            isAnimationActive={false}
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

              const offset = isExpanded ? (isMobile ? 15 : 25) : 15; 
              const xTextOffset = isExpanded ? 10 : 8; 

              const sx = cx + outerRadius * cos; 
              const sy = cy + outerRadius * sin;
              const mx = cx + (outerRadius + offset * 0.5) * cos; 
              const my = cy + (outerRadius + offset * 0.5) * sin;
              const ex = mx + (cos >= 0 ? 1 : -1) * offset; 
              const ey = my;
              const tx = ex + (cos >= 0 ? 1 : -1) * xTextOffset;
              const ty = ey;
              const textAnchor = cos >= 0 ? 'start' : 'end';
              const fontSizeIn = isExpanded ? 12 : 11; 
              const fontSizeOut = isExpanded ? 14 : 12; 
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
                key={`cell-${index}`} 
                fill={coloresDinamicos[index]}
                stroke="var(--bg-card)" 
                strokeWidth={1}
               style={{
                  opacity: activeIndex === null || activeIndex === String(entry.x_i) ? 1 : 0.25,
                  transition: 'opacity 0.3s ease',
                  cursor: 'pointer'
                }}
              />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
          <Legend 
            content={renderLeyendaEnU} 
            verticalAlign="bottom" 
           wrapperStyle={{ width: '100%', left: 0, right: 0 }}
          />
        </PieChart>
      );
    }
    case 'histograma':
      return (
        <BarChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="intervalo" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="f_i" fill="#2563eb" name="Frecuencia absoluta" />
        </BarChart>
      );
    case 'poligono':
      return (
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x_i" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="f_i" stroke="#2563eb" name="Frecuencia absoluta" />
        </LineChart>
      );
    case 'ojiva_creciente':
      return (
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x_i" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="F_i" stroke="#10b981" name="Frecuencia acumulada creciente" />
        </LineChart>
      );
    case 'ojiva_decreciente':
      return (
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x_i" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="F_i_desc" stroke="#ef4444" name="Frecuencia acumulada decreciente" />
        </LineChart>
      );
    default:
      return <p>Tipo de gráfico no soportado.</p>;
  }
};

// =========================================================
// 2. COMPONENTE PRINCIPAL
// =========================================================
export default function GraficoEstadistico({ datos = [], tipo = "barras" }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!Array.isArray(datos) || datos.length === 0) {
    return <p className="text-gray-500 text-sm">No hay datos para graficar.</p>;
  }

  return (
    <>
      {/* VISTA NORMAL */}
      <div className="chartContainerStyle" style={{ position: 'relative', minHeight: "340px", display: "flex", flexDirection: "column" }}>
        <MaximizeButton isExpanded={false} onToggle={() => setIsExpanded(true)} />

        <div style={{ flex: 1, width: "100%", height: "340px", marginTop: "15px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <ChartContent tipo={tipo} datos={datos} isExpanded={false} />
          </ResponsiveContainer>
        </div>
      </div>

      {/* VENTANA MODAL (MAXIMIZAR GRÁFICO - Igual a GraficoIntervalos) */}
      {isExpanded && (
        <div className="modal-grafico-overlay" onClick={() => setIsExpanded(false)}>
          <div className="modal-grafico-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-grafico-header">
              <h2 className="modal-grafico-titulo">Detalle del Gráfico</h2>
              <MaximizeButton isExpanded={true} onToggle={() => setIsExpanded(false)} />
            </div>
            <div className="container_responsivo">
              <ResponsiveContainer width="100%" height="100%">
                <ChartContent tipo={tipo} datos={datos} isExpanded={true} />
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}