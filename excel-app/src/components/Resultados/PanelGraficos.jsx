// src/components/resultados/PanelGraficos.jsx
import React, { useState } from "react";
import GraficoEstadistico from "../graficos/GraficoEstadistico";
import GraficoIntervalos from "../graficos/GraficoIntervalos";
import GraficoBivariado from "../graficos/GraficoBivariado";
import GraficoDispersionForma from "../graficos/GraficoDispersionForma";
import GraficoTendenciaPosicion from "../graficos/GraficoTendenciaPosicion";
import GraficoRegresion from "../graficos/GraficoRegresion";
import GraficoSeriesTiempo from "../graficos/GraficoSeriesTiempo";
import GraficoIndices from "../graficos/GraficoIndices";

// --- IMPORTACIONES DE DRAG AND DROP ---
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors , TouchSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- NUEVA TARJETA QUE MANTIENE TU CSS INTACTO ---
// Esto reemplaza al <div className="grafico-card"> sin agregar divs extra
function SortableGraficoCard({ id, children, customStyle = {} }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    ...customStyle,
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab"
  };

  return (
    <div className="grafico-card" ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default function PanelGraficos({ resultado, esIntervalo }) {
  // Estados para el orden
  const [ordenBivariada, setOrdenBivariada] = useState(['agrupadas', 'apiladas']);
  const [ordenFrecuencias, setOrdenFrecuencias] = useState(['barras', 'pastel']);

  // Sensor para no bloquear el botón de "Maximizar"
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250, // 👈 IMPORTANTE: Tienes que presionar por 250ms antes de mover
      tolerance: 5,
    },
  })
  );

  if (!resultado) return null;

  const esBivariada = !Array.isArray(resultado) && 
    (resultado.tipo === "bivariada" || resultado.tipo === "bivariada_avanzada");

  // =======================================================
  // GRÁFICOS TEMA 6: REGRESIÓN
  // =======================================================
  if (resultado.tipo === "regresion") {
    return <GraficoRegresion resultado={resultado} />;
  }

  // =======================================================
  // GRÁFICOS TEMA 7: SERIES DE TIEMPO
  // =======================================================
  if (resultado.tipo === "series_tiempo") {
    return <GraficoSeriesTiempo resultado={resultado} />;
  }

  // =======================================================
  // GRÁFICOS TEMA 8: NÚMEROS ÍNDICES Y DEFLACIÓN
  // =======================================================
  if (["indices_compuestos", "operaciones_indices", "deflacion_financiera"].includes(resultado.tipo)) {
    return <GraficoIndices resultado={resultado} />;
  }

  // =======================================================
  // GRÁFICOS TEMA 4: VARIABILIDAD Y FORMA
  // =======================================================
  if (resultado.tipo === "variabilidad_y_forma") {
    return (
      <div className="graficos-grid">
        <div className="grafico-card" style={{ width: "100%", height: "350px" }}>
          <h4>Diagrama de Caja y Bigotes (Boxplot)</h4>
          <GraficoDispersionForma tipo="boxplot" resultado={resultado} />
        </div>
        <div className="grafico-card" style={{ width: "100%", height: "350px" }}>
          <h4>Histograma y Curva de Densidad Normal</h4>
          <GraficoDispersionForma tipo="campana" resultado={resultado} />
        </div>
        <div className="grafico-card" style={{ width: "100%", height: "350px", gridColumn: "1 / -1" }}>
          <h4>Gráfico de Desviaciones (x - μ)</h4>
          <GraficoDispersionForma tipo="desviaciones" resultado={resultado} />
        </div>
      </div>
    );
  }

  // =======================================================
  // GRÁFICOS TEMA 3: TENDENCIA Y POSICIÓN
  // =======================================================
  if (resultado.tipo === "tendencia_y_posicion") {
    const graficosTema3 = resultado.graficosTema3?.graficoData;
    const indicadores = resultado.graficosTema3?.indicadores;

    let mockResultadoBoxplot = null;
    if (resultado.datosPuros && resultado.datosPuros.length >= 4) {
      const datos = resultado.datosPuros;
      const n = datos.length;
      
      const getQ = (p) => {
        const pos = (n - 1) * p; const base = Math.floor(pos); const rest = pos - base;
        return datos[base + 1] !== undefined ? datos[base] + rest * (datos[base + 1] - datos[base]) : datos[base];
      };
      
      const q1 = getQ(0.25);
      const mediana = getQ(0.50);
      const q3 = getQ(0.75);
      const RI = q3 - q1;
      const LIIS = q1 - 1.5 * RI;
      const LSIS = q3 + 1.5 * RI;
      
      const outliers = datos.filter(v => v < LIIS || v > LSIS);
      const inliers = datos.filter(v => v >= LIIS && v <= LSIS);
      
      mockResultadoBoxplot = {
        graficos: { histograma: [], desviaciones: [] },
        estadisticas: {
          absoluteMin: datos[0],
          absoluteMax: datos[n - 1],
          minAdyacente: Math.min(...inliers),
          q1, mediana, q3,
          maxAdyacente: Math.max(...inliers),
          RI, LIIS, LSIS, outliers
        }
      };
    }

    return (
      <div className="graficos-grid">
        <div className="grafico-card" style={{ width: "100%", height: "350px" }}>
          <h4>Histograma de Tendencia Central</h4>
          <GraficoTendenciaPosicion tipo="histograma_tendencia" graficos={graficosTema3} indicadores={indicadores} />
        </div>
        
        <div className="grafico-card" style={{ width: "100%", height: "350px" }}>
          <h4>Gráfico de Ojiva (Frecuencias Acumuladas)</h4>
          <GraficoTendenciaPosicion tipo="ojiva" graficos={graficosTema3} />
        </div>

        {mockResultadoBoxplot && (
          <div className="grafico-card" style={{ width: "100%", height: "350px", gridColumn: "1 / -1" }}>
            <h4>Diagrama de Caja y Bigotes (Medidas de Posición)</h4>
            <p style={{textAlign: "center", color: "var(--text-muted)", fontSize: "0.9em", margin: "0 0 10px 0"}}>
              Visualización de los Cuartiles y Valores Atípicos (Método Tukey)
            </p>
            <GraficoDispersionForma tipo="boxplot" resultado={mockResultadoBoxplot} />
          </div>
        )}
      </div>
    );
  }

  // =======================================================
  // GRÁFICOS TEMA 2 Y 5: TABLAS SIMPLES, INTERVALOS, BIVARIADAS (ARRASTRABLES)
  // =======================================================
  return (
    <div className="graficos-grid">
      {esBivariada ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            if (e.over && e.active.id !== e.over.id) {
              setOrdenBivariada(items => arrayMove(items, items.indexOf(e.active.id), items.indexOf(e.over.id)));
            }
          }}
        >
          <SortableContext items={ordenBivariada} strategy={rectSortingStrategy}>
            {ordenBivariada.map(id => (
              id === 'agrupadas' ? (
                <SortableGraficoCard key={id} id={id} customStyle={{ width: "100%", height: "350px" }}>
                  <h4>Gráfico de Barras Agrupadas</h4>
                  <GraficoBivariado datos={resultado} tipo="agrupadas" />
                </SortableGraficoCard>
              ) : (
                <SortableGraficoCard key={id} id={id} customStyle={{ width: "100%", height: "350px" }}>
                  <h4>Gráfico de Barras Apiladas (100%)</h4>
                  <GraficoBivariado datos={resultado} tipo="apiladas_100" />
                </SortableGraficoCard>
              )
            ))}
          </SortableContext>
        </DndContext>

      ) : Array.isArray(resultado) && esIntervalo ? (
        <div className="grafico-card" style={{ width: "100%", minHeight: "400px" }}> 
          <h3>Gráficos de Intervalos</h3>
          <GraficoIntervalos datos={resultado} />
        </div>

      ) : Array.isArray(resultado) ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            if (e.over && e.active.id !== e.over.id) {
              setOrdenFrecuencias(items => arrayMove(items, items.indexOf(e.active.id), items.indexOf(e.over.id)));
            }
          }}
        >
          <SortableContext items={ordenFrecuencias} strategy={rectSortingStrategy}>
            {ordenFrecuencias.map(id => (
              id === 'barras' ? (
                <SortableGraficoCard key={id} id={id}>
                  <h4 style={{ fontSize: "1.1em", padding: "5px" }}>Gráfico de Barras</h4> 
                  <GraficoEstadistico datos={resultado} tipo="barras" />
                </SortableGraficoCard>
              ) : (
                <SortableGraficoCard key={id} id={id}>
                  <h4 style={{ fontSize: "1.1em", padding: "5px" }}>Gráfico Circular</h4>
                  <GraficoEstadistico datos={resultado} tipo="pastel" />
                </SortableGraficoCard>
              )
            ))}
          </SortableContext>
        </DndContext>
      ) : null}
    </div>
  );
}