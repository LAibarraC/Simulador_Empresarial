import React, { useState } from 'react';
import {
  ComposedChart, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Line, Cell, ReferenceLine, ReferenceArea, Scatter
} from 'recharts';

// ==========================================
// 1. SUB-COMPONENTES AUXILIARES
// ==========================================

const BoxplotTooltip = ({ active, estadisticas }) => {
  if (active && estadisticas) {
    const hayOutliers = estadisticas.outliers && estadisticas.outliers.length > 0;
    return (
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', borderBottom: '1px solid var(--border-color)', color: 'var(--text-main)' }}>Boxplot Académico (Método Tukey)</p>
        <p style={{ margin: 0, fontSize: '0.9em', color: 'var(--text-variable)' }}>Límite Sup. (LSIS): <b>{estadisticas.LSIS.toFixed(2)}</b></p>
        <p style={{ margin: 0, fontSize: '0.9em', color: 'var(--text-variable)' }}>Max. Adyacente (Bigote): <b>{estadisticas.maxAdyacente.toFixed(2)}</b></p>
        <p style={{ margin: 0, fontSize: '0.9em', color: 'var(--text-variable)' }}>Q3 (75%): <b>{estadisticas.q3.toFixed(2)}</b></p>
        <p style={{ margin: '3px 0', fontSize: '1em', color: '#e74c3c', fontWeight: 'bold' }}>Mediana: {estadisticas.mediana.toFixed(2)}</p>
        <p style={{ margin: 0, fontSize: '0.9em', color: 'var(--text-variable)' }}>Q1 (25%): <b>{estadisticas.q1.toFixed(2)}</b></p>
        <p style={{ margin: 0, fontSize: '0.9em', color: 'var(--text-variable)' }}>Min. Adyacente (Bigote): <b>{estadisticas.minAdyacente.toFixed(2)}</b></p>
        <p style={{ margin: 0, fontSize: '0.9em', color: 'var(--text-variable)' }}>Límite Inf. (LIIS): <b>{estadisticas.LIIS.toFixed(2)}</b></p>
        {hayOutliers && (
          <div style={{ marginTop: '5px', borderTop: '1px solid var(--border-color)', color: '#e74c3c', fontSize: '0.9em' }}>
            <b>Valores Atípicos ({estadisticas.outliers.length}):</b> {estadisticas.outliers.join(', ')}
          </div>
        )}
      </div>
    );
  }
  return null;
};

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

const EmptyShape = () => <g></g>;

// ==========================================
// 2. CONTENIDO DEL GRÁFICO (CHART CONTENT)
// ==========================================

const ChartContent = ({ tipo, estadisticas, graficos, isExpanded }) => {
  // --- TIPO BOXPLOT ---
  if (tipo === "boxplot") {
    const { minAdyacente, maxAdyacente, q1, mediana, q3, outliers, absoluteMin, absoluteMax } = estadisticas;
    const offset = (absoluteMax - absoluteMin) * 0.15;
    const minDomain = absoluteMin - offset;
    const maxDomain = absoluteMax + offset;
    const whiskerData = [{ x: minAdyacente, y: 1 }, { x: maxAdyacente, y: 1 }];
    const leftStopperData = [{ x: minAdyacente, y: 0.8 }, { x: minAdyacente, y: 1.2 }];
    const rightStopperData = [{ x: maxAdyacente, y: 0.8 }, { x: maxAdyacente, y: 1.2 }];
    const medianData = [{ x: mediana, y: 0.7 }, { x: mediana, y: 1.3 }];
    const outliersData = outliers ? outliers.map(o => ({ x: o, y: 1 })) : [];
    const ticksX = [minAdyacente, q1, mediana, q3, maxAdyacente];

    return (
      <ComposedChart
        width={isExpanded ? 850 : undefined}
        height={300}
        margin={{ top: 50, right: 30, bottom: 20, left: 30 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} opacity={0.2} />
        <XAxis
          type="number"
          dataKey="x"
          domain={[minDomain, maxDomain]}
          ticks={ticksX}
          tick={{ fontSize: 12, fontWeight: 'bold', fill: 'var(--text-variable)' }}
          tickFormatter={tick => tick.toFixed(2)}
          stroke="var(--text-variable)"
        />
        <YAxis type="number" dataKey="y" domain={[0, 2]} hide />
        <Tooltip content={<BoxplotTooltip estadisticas={estadisticas} />} cursor={{ strokeDasharray: '3 3' }} />

        {/* Etiquetas con variables CSS para Modo Oscuro */}
        <ReferenceLine x={minAdyacente} stroke="var(--border-color)" strokeDasharray="3 3" label={{ value: 'Min', position: 'top', fill: 'var(--text-variable)', fontSize: 11, fontWeight: 'bold', dy: -10 }} />
        <ReferenceLine x={maxAdyacente} stroke="var(--border-color)" strokeDasharray="3 3" label={{ value: 'Max', position: 'top', fill: 'var(--text-variable)', fontSize: 11, fontWeight: 'bold', dy: -10 }} />
        <ReferenceLine x={q1} stroke="#0099ff" strokeDasharray="3 3" label={{ value: 'Q1', position: 'top', fill: 'var(--text-main)', fontSize: 14, fontWeight: 'bold', dy: -25 }} />
        <ReferenceLine x={mediana} stroke="#f93b3b" strokeDasharray="3 3" label={{ value: 'Me', position: 'top', fill: '#e74c3c', fontSize: 14, fontWeight: 'bold', dy: -25 }} />
        <ReferenceLine x={q3} stroke="#0099ff" strokeDasharray="3 3" label={{ value: 'Q3', position: 'top', fill: 'var(--text-main)', fontSize: 14, fontWeight: 'bold', dy: -25 }} />

        <ReferenceArea x1={q1} x2={q3} y1={0.7} y2={1.3} fill="rgba(52, 152, 219, 0.2)" stroke="#3498db" strokeWidth={2} />
        <Scatter data={whiskerData} line={{ stroke: '#3498db', strokeWidth: 2 }} shape={<EmptyShape />} isAnimationActive={false} />
        <Scatter data={leftStopperData} line={{ stroke: '#3498db', strokeWidth: 2 }} shape={<EmptyShape />} isAnimationActive={false} />
        <Scatter data={rightStopperData} line={{ stroke: '#3498db', strokeWidth: 2 }} shape={<EmptyShape />} isAnimationActive={false} />
        <Scatter data={medianData} line={{ stroke: '#e74c3c', strokeWidth: 3 }} shape={<EmptyShape />} isAnimationActive={false} />
        {outliersData.length > 0 && <Scatter data={outliersData} fill="#e74c3c" shape="circle" isAnimationActive={true} />}
        <Scatter data={[{ x: mediana, y: 1 }]} fill="transparent" shape={<EmptyShape />} />
      </ComposedChart>
    );
  }

  // --- TIPO CAMPANA ---
  // --- TIPO CAMPANA ---
  if (tipo === "campana") {

    const maxFrecuencia = Math.max(...graficos.histograma.map(g => g.frecuencia));
    const limiteEjeY = Math.ceil(maxFrecuencia * 2) / 2 + 0.5;

    const ticksEjeY = [];
    for (let i = 0; i <= limiteEjeY; i = parseFloat((i + 0.5).toFixed(1))) {
      ticksEjeY.push(i);
    }
    return (
      <ComposedChart
        data={graficos.histograma}
        margin={{ top: 5, right: 20, left: 10, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.4} />

        <XAxis
          dataKey="rango"
          tick={{ fill: 'var(--text-variable)', fontSize: 12 }}
          stroke="var(--text-variable)"
          label={{
            value: 'Intervalos',
            position: 'insideBottom',
            offset: -10,
            fill: 'var(--text-variable)',
            fontWeight: 'bold'
          }}
        />

        <YAxis
          stroke="var(--text-variable)"
          ticks={ticksEjeY} // <-- Aplicamos los saltos de 0.5
          domain={[0, limiteEjeY]}
          interval={0} // <-- Forzamos a que se vean todos
          tickFormatter={(valor) => valor.toString().replace('.', ',')}
          tick={{
            fill: 'var(--text-variable)',
            fontSize: 11, // <-- Números más grandes
            fontWeight: 'bold'
          }}
          label={{
            value: 'Frecuencia (fi)',
            angle: -90,
            position: 'insideLeft',
            fill: 'var(--text-variable)',
            fontWeight: 'bold',
            style: { textAnchor: 'middle', fontSize: 14 }
          }}
        />

        <Tooltip
          cursor={{ fill: 'var(--border-color)', opacity: 0.2 }}
          contentStyle={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-main)',
            borderRadius: '5px'
          }}
        />

        <Bar
          dataKey="frecuencia"
          fill="#3498db"
          name="Frecuencia Observada"
          barSize={50}
          radius={[4, 4, 0, 0]}
        />

        <Line
          type="linear" // <-- Te lo cambié a monotone para que la campana sea curva real
          dataKey="curvaNormal"
          stroke="#e74c3c"
          strokeWidth={3}
          dot={false}
          name="Curva Normal Teórica"
        />
      </ComposedChart>
    );
  }

  // --- TIPO DESVIACIONES ---
  if (tipo === "desviaciones") {
    return (
      <BarChart
        width={isExpanded ? 850 : undefined}
        data={graficos.desviaciones}
        margin={{ top: 5, right: 20, left: 5, bottom: 25 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="id" hide stroke="var(--text-variable)" />
        <YAxis 
        stroke="var(--text-variable)"
        tick={{ fill: 'var(--text-variable)', fontSize: 13, fontWeight: 'bold' }} 
        label={{ 
          value: 'Distancia a la Media', 
          angle: -90, 
          position: 'insideLeft', 
          fill: 'var(--text-variable)',
          fontWeight: 'bold',
          fontSize: 14,       
          style: { textAnchor: 'middle' }
        }} 
      />
        <Tooltip formatter={(value, name, props) => [`${value.toFixed(2)}`, `Valor real: ${props.payload.valor}`]} />
        <ReferenceLine y={0} stroke="var(--text-main)" strokeWidth={2} label={{ value: "Media (x̄)", fill: 'var(--text-main)' }} />
        <Bar dataKey="desviacion" name="Desviación de la Media">
          {graficos.desviaciones.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.desviacion > 0 ? '#2ecc71' : '#e74c3c'} />
          ))}
        </Bar>
      </BarChart>
    );
  }
  return null;
};

// ==========================================
// 3. COMPONENTE PRINCIPAL EXPORTADO
// ==========================================

export default function GraficoDispersionForma({ tipo, resultado }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!resultado || !resultado.graficos) return null;
  const { estadisticas, graficos } = resultado;

  return (
    <>
      {/* VISTA NORMAL */}
      <div className="chartContainerStyle" style={{ position: 'relative', minHeight: "340px", display: "flex", flexDirection: "column" }}>
        <MaximizeButton isExpanded={false} onToggle={() => setIsExpanded(true)} />

        <div style={{ flex: 1, width: "100%", height: "340px", marginTop: "15px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <ChartContent tipo={tipo} estadisticas={estadisticas} graficos={graficos} isExpanded={false} />
          </ResponsiveContainer>
        </div>
      </div>

      {/* VENTANA MODAL (MAXIMIZADO) */}
      {/* VENTANA MODAL (MAXIMIZADO) */}
      {isExpanded && (
        <div className="modal-grafico-overlay" onClick={() => setIsExpanded(false)}>
          <div className="modal-grafico-card" onClick={(e) => e.stopPropagation()} style={{ width: '90vw', height: '80vh' }}>
            <div className="modal-grafico-header">
              <h2 className="modal-grafico-titulo">Detalle de Dispersión y Forma</h2>
              <MaximizeButton isExpanded={true} onToggle={() => setIsExpanded(false)} />
            </div>
            <div style={{ flex: 1, width: '100%', height: '100%', padding: '20px' }}>
              {/* RE-INSERTAMOS EL RESPONSIVE CONTAINER */}
              <ResponsiveContainer width="100%" height="100%">
                <ChartContent tipo={tipo} estadisticas={estadisticas} graficos={graficos} isExpanded={true} />
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}