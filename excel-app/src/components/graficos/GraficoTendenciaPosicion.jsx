import React, { useState } from 'react';
import {
  ComposedChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

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
// 2. SUB-COMPONENTE: CONTENIDO DE LOS GRÁFICOS
// ==========================================
const ChartContent = ({ tipo, graficos, indicadores }) => {
  // --- LÓGICA HISTOGRAMA ---
  if (tipo === "histograma_tendencia") {
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
      <ComposedChart data={graficos} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
        <XAxis dataKey="rango" stroke="var(--text-variable)" tick={{ fontSize: 11, fill: 'var(--text-variable)' }} />
        <YAxis
          stroke="var(--text-variable)"
          ticks={ticksEjeY}
          domain={[0, limiteEjeY]}
          tickFormatter={(valor) => valor.toString().replace('.', ',')}
          tick={{ fontSize: 11, fill: 'var(--text-variable)' }}
          label={{ value: 'Frecuencia (fi)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontWeight: 'bold' } }}
        />
        <Tooltip />
        <Bar dataKey="frecuencia" fill="#3498db" name="Frecuencia" barSize={50} />

        {indicadores && (
          <>
            <ReferenceLine x={getRangoForValue(indicadores.media)} stroke="#e74c3c" strokeDasharray="3 3" strokeWidth={2} label={{ value: 'x̄', position: 'top', fill: '#e74c3c', fontSize: 18, fontWeight: 'bold' }} />
            <ReferenceLine x={getRangoForValue(indicadores.mediana)} stroke="#2ecc71" strokeDasharray="3 3" strokeWidth={2} label={{ value: 'Me', position: 'insideTopLeft', fill: '#2ecc71', fontSize: 18, fontWeight: 'bold' }} />
            <ReferenceLine x={getRangoForValue(indicadores.moda)} stroke="#9b59b6" strokeDasharray="3 3" strokeWidth={2} label={{ value: 'Mo', position: 'insideTopRight', fill: '#9b59b6', fontSize: 18, fontWeight: 'bold' }} />
          </>
        )}
      </ComposedChart>
    );
  }

  // --- LÓGICA OJIVA ---
  if (tipo === "ojiva") {
    const ojivaData = [
      { hasta: graficos[0].desde, P_i: 0 },
      ...graficos
    ];

    return (
      <LineChart data={ojivaData} margin={{top: 10, right: 20, left: 10, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="hasta"
          stroke="var(--text-variable)"
          tick={{ fontSize: 11, fill: 'var(--text-variable)' }}
          label={{ value: 'Límite Superior del Intervalo', position: 'insideBottom', offset: -10, fill: 'var(--text-variable)', style: { textAnchor: 'middle', fontWeight: 'bold', fill: 'var(--text-variable)' } }}
        />
        <YAxis
          domain={[0, 100]}
          stroke="var(--text-variable)"
          tick={{ fontSize: 11, fill: 'var(--text-variable)' }}
          label={{ value: 'Frecuencia Acumulada (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontWeight: 'bold', fill: 'var(--text-variable)' } }}
        />
        <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, 'Acumulado']} />
        <Line type="linear" dataKey="P_i" stroke="#e67e22" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} name="Ojiva Porcentual" />
      </LineChart>
    );
  }

  return null;
};

// ==========================================
// 3. COMPONENTE PRINCIPAL EXPORTADO
// ==========================================
export default function GraficoTendenciaPosicion({ tipo, graficos, indicadores }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!graficos || graficos.length === 0) return null;

  return (
    <>
      {/* VISTA NORMAL EN EL DASHBOARD */}
      <div className="chartContainerStyle" style={{ position: 'relative', minHeight: "350px", display: "flex", flexDirection: "column" }}>
        <MaximizeButton isExpanded={false} onToggle={() => setIsExpanded(true)} />

        <div style={{ flex: 1, width: "100%", height: "350px", marginTop: "10px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <ChartContent tipo={tipo} graficos={graficos} indicadores={indicadores} />
          </ResponsiveContainer>
        </div>
      </div>

      {/* VENTANA MODAL (MAXIMIZADO) */}
      {isExpanded && (
        <div className="modal-grafico-overlay" onClick={() => setIsExpanded(false)}>
          <div className="modal-grafico-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-grafico-header">
              <h2 className="modal-grafico-titulo">Detalle del Gráfico</h2>
              <MaximizeButton isExpanded={true} onToggle={() => setIsExpanded(false)} />
            </div>
            <div className="container_responsivo" style={{ height: '70vh', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ChartContent tipo={tipo} graficos={graficos} indicadores={indicadores} />
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}