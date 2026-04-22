import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, ComposedChart, Legend
} from "recharts";

import "../../styles/components/graficos/GraficoIntervalos.css";

// --- IMPORTACIONES DE DRAG AND DROP ---
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// =========================================================
// 1. SUB-COMPONENTES
// =========================================================

const MaximizeButton = ({ isExpanded, onToggle }) => (
  <button
    onClick={onToggle}
    title={isExpanded ? "Cerrar" : "Maximizar"}
    className="boton_minimizar"
    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--border-color)"}
    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "var(--bg-input)"}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {isExpanded
        ? <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>
        : <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />}
    </svg>
  </button>
);

const ChartContent = ({ type, isExpanded, datosProcesados, limites }) => {
  const fontSize = isExpanded ? 14 : 11;
  const margin = isExpanded
    ? { top: 20, right: 30, bottom: 20, left: 10 }
    : { top: 10, right: 10, bottom: 0, left: -10 };

  const currentAxisStyle = { fontSize, fill: 'var(--text-main)' };
  const commonProps = { margin };
  const commonGrid = <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />;
  const commonY = <YAxis tick={currentAxisStyle} stroke="var(--text-main)" />;
  const commonTooltip = <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-main)' }} />;
  const commonLegend = <Legend wrapperStyle={{ fontSize: isExpanded ? '1.2rem' : '0.8rem', color: 'var(--text-main)' }} />;

  const commonX = (
    <XAxis
      type="number"
      dataKey="midpoint"
      ticks={limites}
      domain={[limites[0], limites[limites.length - 1]]}
      tick={currentAxisStyle}
      stroke="var(--text-main)"
    />
  );

  switch (type) {
    case 'histograma':
      return (
        <BarChart data={datosProcesados} {...commonProps} barCategoryGap={0}>
          {commonGrid}{commonX}{commonY}{commonTooltip}{commonLegend}
          <Bar dataKey="f_i" fill="#2563eb" name="Frecuencia Absoluta" radius={[2, 2, 0, 0]} />
        </BarChart>
      );
    case 'poligono':
      return (
        <LineChart data={datosProcesados} {...commonProps}>
          {commonGrid}{commonX}{commonY}{commonTooltip}{commonLegend}
          <Line type="linear" dataKey="f_i" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} name="Frecuencia Absoluta" />
        </LineChart>
      );
    case 'ojiva_creciente':
      return (
        <AreaChart data={datosProcesados} {...commonProps}>
          {commonGrid}{commonX}{commonY}{commonTooltip}{commonLegend}
          <Area type="linear" dataKey="F_i" stroke="#10b981" fill="#d1fae5" strokeWidth={3} name="Frecuencia Acumulada" />
        </AreaChart>
      );
    case 'ojiva_decreciente':
      return (
        <AreaChart data={datosProcesados} {...commonProps}>
          {commonGrid}{commonX}{commonY}{commonTooltip}{commonLegend}
          <Area type="linear" dataKey="F'i" stroke="#ef4444" fill="#fee2e2" strokeWidth={3} name="Frec. Acumulada Inv." />
        </AreaChart>
      );
    case 'mixto':
      return (
        <ComposedChart data={datosProcesados} {...commonProps}>
          {commonGrid}{commonX}{commonY}{commonTooltip}{commonLegend}
          <Bar dataKey="f_i" fill="#93c5fd" name="Histograma" barSize={40} />
          <Line type="linear" dataKey="f_i" stroke="#1e40af" strokeWidth={3} dot={{ r: 4 }} name="Polígono" />
        </ComposedChart>
      );
    default: return null;
  }
};

// --- NUEVA VERSIÓN DE ChartCard (Ahora es arrastrable) ---
const SortableChartCard = ({ id, title, isExpanded, onToggle, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <div className="chartContainerStyle" ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <h4 className="titleStyle">{title}</h4>
      <MaximizeButton isExpanded={isExpanded} onToggle={onToggle} />
      <div style={{ flex: 1, width: "100%", minHeight: 0, marginTop: "10px" }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// =========================================================
// 2. COMPONENTE PRINCIPAL
// =========================================================
export default function GraficoIntervalos({ datos }) {
  const [expandedChart, setExpandedChart] = useState(null);

  // ESTADO PARA EL ORDEN DE LOS 5 GRÁFICOS
  const [ordenGraficos, setOrdenGraficos] = useState(['hist', 'poli', 'ojiva1', 'ojiva2', 'mixto']);

  // Sensor para no bloquear los clics en el botón de Maximizar
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  if (!datos || datos.length === 0) return <p style={{ color: "var(--text-muted)" }}>No hay datos para graficar.</p>;

  // PROCESAMIENTO EXCLUSIVO PARA EL EJE X NUMÉRICO
  const limitesSet = new Set();
  const datosProcesados = datos.map(item => {
    const intervaloStr = item["Haber básico"] || item["Intervalos"] || item["Intervalo"] || "";
    const partes = intervaloStr.split("-").map(n => parseFloat(n.trim()));

    // Extraemos límites para los ticks
    if (!isNaN(partes[0])) limitesSet.add(partes[0]);
    if (!isNaN(partes[1])) limitesSet.add(partes[1]);

    return {
      Intervalo: intervaloStr,
      midpoint: (partes[0] + partes[1]) / 2,
      f_i: Number(item["f_i"] || item["fi"] || 0),
      F_i: Number(item["F_i"] || item["Fi"] || 0),
      "F'i": Number(item["F'i"] || item["F_i_inv"] || 0)
    };
  });

  const limites = Array.from(limitesSet).sort((a, b) => a - b);

  const handleToggle = (chartId) => {
    // Evitamos que el evento de "soltar" accione accidentalmente el botón
    setTimeout(() => {
      setExpandedChart(expandedChart === chartId ? null : chartId);
    }, 0);
  };

  const getChartType = (id) => {
    const map = { 'hist': 'histograma', 'poli': 'poligono', 'ojiva1': 'ojiva_creciente', 'ojiva2': 'ojiva_decreciente', 'mixto': 'mixto' };
    return map[id] || 'histograma';
  };

  const getChartTitle = (id) => {
    const map = {
      'hist': 'Histograma (fi)',
      'poli': 'Polígono de Frecuencias',
      'ojiva1': 'Ojiva Creciente (Fi)',
      'ojiva2': "Ojiva Decreciente (F'i)",
      'mixto': 'Histograma + Polígono'
    };
    return map[id];
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e) => {
          if (e.over && e.active.id !== e.over.id) {
            setOrdenGraficos(items => arrayMove(items, items.indexOf(e.active.id), items.indexOf(e.over.id)));
          }
        }}
      >
        <SortableContext items={ordenGraficos} strategy={rectSortingStrategy}>
          {/* Tu cuadrícula original */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(370px, 1fr))", gap: "20px", marginTop: "10px" }}>
            {ordenGraficos.map(id => (
              <SortableChartCard
                key={id}
                id={id}
                title={getChartTitle(id)}
                isExpanded={expandedChart === id}
                onToggle={() => handleToggle(id)}
              >
                <ChartContent type={getChartType(id)} isExpanded={false} datosProcesados={datosProcesados} limites={limites} />
              </SortableChartCard>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* VENTANA MODAL (MAXIMIZAR GRÁFICO) */}
      {expandedChart && (
        <div className="modal-grafico-overlay" onClick={() => setExpandedChart(null)}>
          <div className="modal-grafico-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-grafico-header">
              <h2 className="modal-grafico-titulo">Detalle del Gráfico</h2>
              <MaximizeButton isExpanded={true} onToggle={() => setExpandedChart(null)} />
            </div>
            <div className="container_responsivo">
              <ResponsiveContainer width="100%" height="100%">
                <ChartContent type={getChartType(expandedChart)} isExpanded={true} datosProcesados={datosProcesados} limites={limites} />
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}