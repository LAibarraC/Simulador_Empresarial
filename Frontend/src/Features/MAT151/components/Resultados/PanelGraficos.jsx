import React, { useMemo, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import GraficoEstadistico from "../graficos/GraficoEstadistico";
import GraficoIntervalos from "../graficos/GraficoIntervalos";
import GraficoBivariado from "../graficos/GraficoBivariado";
import GraficoDispersionForma from "../graficos/GraficoDispersionForma";
import GraficoTendenciaPosicion from "../graficos/GraficoTendenciaPosicion";
import GraficoRegresion from "../graficos/GraficoRegresion";
import GraficoSeriesTiempo from "../graficos/GraficoSeriesTiempo";
import GraficoIndices from "../graficos/GraficoIndices";
import MarcoWidget from "../../../../ui/MarcoWidget";

export default function PanelGraficos({
  resultado,
  esIntervalo,
  calculo,
  orden,
  setOrden,
  modelosVisibles,
  setModelosVisibles,
  selectedColumn,
  selectedColumnY
}) {
  // 1. MEMORIZACIÓN DE COMPONENTES
  const widgetsDisponibles = useMemo(() => {
    if (!resultado) return [];

    const esBivariada =
      !Array.isArray(resultado) && resultado.tipo === "distribucion_bivariada";
    const nuevosWidgets = [];

    // TEMA: REGRESIÓN
    if (resultado.tipo === "regresion") {
      nuevosWidgets.push({
        id: "reg-main",
        titulo: "Análisis de Regresión y Correlación",
        anchoCompleto: true,
        alto: "480px",
        contenido: (
          <GraficoRegresion
            resultado={resultado}
            modelosVisibles={modelosVisibles}
            setModelosVisibles={setModelosVisibles}
            selectedColumn={selectedColumn}
            selectedColumnY={selectedColumnY}
          />
        ),
      });
    }

    // TEMA: ÍNDICES
    if (
      [
        "indices_compuestos",
        "operaciones_indices",
        "deflacion_financiera",
      ].includes(resultado.tipo)
    ) {
      if (resultado.tipo === "deflacion_financiera") {
        nuevosWidgets.push({
          id: "ind-main",
          titulo: "Ilusión Monetaria: Valor Nominal vs Valor Real",
          anchoCompleto: true,
          contenido: (
            <GraficoIndices
              resultado={resultado}
              tipoGrafico="ilusion_monetaria"
              selectedColumn={selectedColumn}
              selectedColumnY={selectedColumnY}
            />
          ),
        });
        nuevosWidgets.push({
          id: "ind-deflacion-lineas",
          titulo: "Evolución de la Inflación y Poder Adquisitivo",
          anchoCompleto: true,
          contenido: (
            <GraficoIndices
              resultado={resultado}
              tipoGrafico="inflacion_poder"
              selectedColumn={selectedColumn}
              selectedColumnY={selectedColumnY}
            />
          ),
        });
      } else {
        nuevosWidgets.push({
          id: "ind-main",
          titulo: "Indicadores Económicos e Índices",
          anchoCompleto: true,
          contenido: (
            <GraficoIndices
              resultado={resultado}
              selectedColumn={selectedColumn}
              selectedColumnY={selectedColumnY}
            />
          ),
        });
      }
    }

    // TEMA: VARIABILIDAD Y FORMA
    if (resultado.tipo === "variabilidad_y_forma") {
      nuevosWidgets.push({
        id: "v1",
        titulo: "Boxplot (Caja y Bigotes)",
        contenido: (
          <GraficoDispersionForma
            tipo="boxplot"
            resultado={resultado}
            selectedColumn={selectedColumn}
          />
        ),
      });
      nuevosWidgets.push({
        id: "v2",
        titulo: "Curva de Densidad Normal",
        contenido: (
          <GraficoDispersionForma
            tipo="campana"
            resultado={resultado}
            selectedColumn={selectedColumn}
          />
        ),
      });
      nuevosWidgets.push({
        id: "v3",
        titulo: "Desviaciones Respecto a la Media",
        anchoCompleto: true,
        contenido: (
          <GraficoDispersionForma
            tipo="desviaciones"
            resultado={resultado}
            selectedColumn={selectedColumn}
          />
        ),
      });
    }

    // TEMA: TENDENCIA Y POSICIÓN
    if (resultado.tipo === "tendencia_y_posicion") {
      nuevosWidgets.push({
        id: "t1",
        titulo: "Histograma de Tendencia Central",
        contenido: (
          <GraficoTendenciaPosicion
            tipo="histograma_tendencia"
            graficos={resultado.graficosTema3?.graficoData}
            indicadores={resultado.graficosTema3?.indicadores}
            selectedColumn={selectedColumn}
          />
        ),
      });
      nuevosWidgets.push({
        id: "t2",
        titulo: "Gráfico de Ojiva (Frecuencias Acumuladas)",
        contenido: (
          <GraficoTendenciaPosicion
            tipo="ojiva"
            graficos={resultado.graficosTema3?.graficoData}
            selectedColumn={selectedColumn}
          />
        ),
      });
    }

    // TEMA: SERIES DE TIEMPO
    if (resultado.tipo === "series_tiempo") {
      nuevosWidgets.push({
        id: "ser-1",
        titulo: "Gráfico de Serie Cronológica Histórica",
        anchoCompleto: true,
        contenido: (
          <GraficoSeriesTiempo
            resultado={resultado}
            tipo="historico"
            selectedColumn={selectedColumn}
            selectedColumnY={selectedColumnY}
          />
        ),
      });
      nuevosWidgets.push({
        id: "ser-2",
        titulo: "Línea de Tendencia y Pronóstico",
        anchoCompleto: true,
        contenido: (
          <GraficoSeriesTiempo
            resultado={resultado}
            tipo="pronostico"
            selectedColumn={selectedColumn}
            selectedColumnY={selectedColumnY}
          />
        ),
      });
    }

    // TEMA: DISTRIBUCIÓN POR INTERVALOS
    if (Array.isArray(resultado) && esIntervalo) {
      nuevosWidgets.push({
        id: "int-1",
        titulo: "Histograma de Frecuencias",
        contenido: (
          <GraficoIntervalos
            datos={resultado}
            tipo="histograma"
            selectedColumn={selectedColumn}
            selectedColumnY={selectedColumnY}
          />
        ),
      });
      nuevosWidgets.push({
        id: "int-2",
        titulo: "Polígono de Frecuencias",
        contenido: (
          <GraficoIntervalos
            datos={resultado}
            tipo="poligono"
            selectedColumn={selectedColumn}
            selectedColumnY={selectedColumnY}
          />
        ),
      });
      nuevosWidgets.push({
        id: "int-3",
        titulo: "Ojiva Creciente (Fi)",
        contenido: (
          <GraficoIntervalos
            datos={resultado}
            tipo="ojiva_creciente"
            selectedColumn={selectedColumn}
            selectedColumnY={selectedColumnY}
          />
        ),
      });
      nuevosWidgets.push({
        id: "int-4",
        titulo: "Ojiva Decreciente (F'i)",
        contenido: (
          <GraficoIntervalos
            datos={resultado}
            tipo="ojiva_decreciente"
            selectedColumn={selectedColumn}
            selectedColumnY={selectedColumnY}
          />
        ),
      });
      nuevosWidgets.push({
        id: "int-5",
        titulo: "Histograma + Polígono (Mixto)",
        anchoCompleto: true,
        contenido: (
          <GraficoIntervalos
            datos={resultado}
            tipo="mixto"
            selectedColumn={selectedColumn}
            selectedColumnY={selectedColumnY}
          />
        ),
      });
      nuevosWidgets.push({
        id: "int-6",
        titulo: "Intersección de Ojivas (Creciente y Decreciente)",
        anchoCompleto: true,
        contenido: (
          <GraficoIntervalos
            datos={resultado}
            tipo="interseccion_ojivas"
            selectedColumn={selectedColumn}
            selectedColumnY={selectedColumnY}
          />
        ),
      });
    }

    // TEMA: TABLAS DE FRECUENCIAS SIMPLES
    if (
      Array.isArray(resultado) &&
      !esIntervalo &&
      calculo === "frecuencias_completas" &&
      resultado.length > 0
    ) {
      nuevosWidgets.push({
        id: "uni-1",
        titulo: "Gráfico de Barras",
        contenido: (
          <GraficoEstadistico
            datos={resultado}
            tipo="barras"
            selectedColumn={selectedColumn}
            selectedColumnY={selectedColumnY}
          />
        ),
      });
      nuevosWidgets.push({
        id: "uni-2",
        titulo: "Gráfico Circular (Pastel)",
        contenido: (
          <GraficoEstadistico
            datos={resultado}
            tipo="pastel"
            selectedColumn={selectedColumn}
            selectedColumnY={selectedColumnY}
          />
        ),
      });
    }

    // TEMA: ANÁLISIS BIVARIADO
    if (esBivariada) {
      nuevosWidgets.push({
        id: "biv-1",
        titulo: "Barras Agrupadas",
        contenido: (
          <GraficoBivariado
            datos={resultado}
            tipo="agrupadas"
            selectedColumn={selectedColumn}
            selectedColumnY={selectedColumnY}
          />
        ),
      });
      nuevosWidgets.push({
        id: "biv-2",
        titulo: "Barras Apiladas",
        contenido: (
          <GraficoBivariado
            datos={resultado}
            tipo="apiladas_100"
            selectedColumn={selectedColumn}
            selectedColumnY={selectedColumnY}
          />
        ),
      });
      nuevosWidgets.push({
        id: "biv-3",
        titulo: "Barras Marginales",
        anchoCompleto: true,
        contenido: (
          <GraficoBivariado
            datos={resultado}
            tipo="marginales"
            selectedColumn={selectedColumn}
            selectedColumnY={selectedColumnY}
          />
        ),
      });
    }

    return nuevosWidgets;
  }, [
    resultado,
    esIntervalo,
    calculo,
    modelosVisibles,
    setModelosVisibles,
    selectedColumn,
    selectedColumnY,
  ]);

  // 2. SINCRONIZACIÓN CON EL ESTADO DE CALCULOS.JSX
  useEffect(() => {
    if (widgetsDisponibles.length > 0 && setOrden) {
      // Solo inicializamos si el orden está vacío para evitar bucles
      setOrden(widgetsDisponibles.map((w) => w.id));
    }
  }, [widgetsDisponibles, setOrden]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || !setOrden) return;

    if (active.id !== over.id) {
      setOrden((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (!resultado || widgetsDisponibles.length === 0) return null;

  // Usamos el orden que viene por props para renderizar
  const listaRender =
    orden && orden.length > 0 ? orden : widgetsDisponibles.map((w) => w.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={listaRender} strategy={rectSortingStrategy}>
        <div className="panel-graficos-grid">
          {listaRender.map((id) => {
            const widget = widgetsDisponibles.find((w) => w.id === id);
            if (!widget) return null;

            return (
              <MarcoWidget
                key={widget.id}
                id={widget.id}
                titulo={widget.titulo}
                anchoCompleto={widget.anchoCompleto}
                alto={widget.alto}
              >
                {widget.contenido}
              </MarcoWidget>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}
