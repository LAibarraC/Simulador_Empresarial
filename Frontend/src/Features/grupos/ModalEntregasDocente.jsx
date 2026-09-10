import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  X, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  FileSpreadsheet, 
  Layers, 
  Award, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  Eye, 
  Check, 
  AlertCircle, 
  Play, 
  Calculator, 
  ExternalLink, 
  Table, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  FileText,
  BarChart3,
  PieChart,
  Grid,
  Maximize2,
  Edit3
} from 'lucide-react';
import { alerta } from "../../utils/Notificaciones";
import { BASE_URL, api } from "../../services/api";
import TablasUnidimensionales from "../MAT151/components/Resultados/TablasUnidimensionales";
import TablasBivariantes from "../MAT151/components/Resultados/TablasBivariantes";
import TablaRegresion from "../MAT151/components/Resultados/TablaRegresion";
import TablaSeriesTiempo from "../MAT151/components/Resultados/TablaSeriesTiempo";
import TablaIndices from "../MAT151/components/Resultados/TablaIndices";
import PanelGraficos from "../MAT151/components/Resultados/PanelGraficos";

import "../MAT151/style/pages/Calculadora.css";
import "../MAT151/style/pages/Calculos.css";

// Módulos matemáticos estadísticos para resolución dinámica y recalculación precisa
import * as UniMath from "../MAT151/utils/estadisticaUnidimensional";
import * as MultiMath from "../MAT151/utils/estadisticaMultivariante";
import * as RegMath from "../MAT151/utils/estadisticaRegresion";
import * as SeriesMath from "../MAT151/utils/estadisticaSeriesTiempo";
import * as IndicesMath from "../MAT151/utils/estadisticaIndices";

const parseRespuestaJson = (datosStr) => {
  if (!datosStr) return null;
  if (typeof datosStr === "object") return datosStr;
  try {
    const p1 = JSON.parse(datosStr);
    if (typeof p1 === "string") {
      try { return JSON.parse(p1); } catch (e) { return p1; }
    }
    return p1;
  } catch (e) {
    return null;
  }
};

const formatearCeldaDefault = (valor) => {
  if (valor === null || valor === undefined || valor === "") return "-";
  if (typeof valor === "number") {
    return Number.isInteger(valor) ? valor.toString() : valor.toFixed(4);
  }
  return String(valor);
};

// =========================================================================
// MOTOR RESOLVER DE RESULTADOS ESTADÍSTICOS Y SNAPSHOTS
// =========================================================================
const encontrarColumnasOptimas = (rows) => {
  if (!rows || !Array.isArray(rows) || rows.length === 0) return { numericas: [], todas: [] };
  const keys = Object.keys(rows[0]);
  const stats = keys.map(k => {
    let numCount = 0;
    for (const r of rows) {
      const v = r[k];
      if (typeof v === "number" && !isNaN(v)) numCount++;
      else if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v.trim())) && !v.includes("/") && !v.includes("-")) numCount++;
    }
    return { key: k, count: numCount };
  });
  // Ordenar columnas con mayor cantidad de datos numéricos reales
  stats.sort((a, b) => b.count - a.count);
  const numericas = stats.filter(s => s.count >= 2).map(s => s.key);
  return { numericas, todas: keys };
};

function resolverResultadoEstadistico(tema) {
  if (!tema) return { resultado: null, config: {}, tipoCalculo: "frecuencias_completas", esIntervalo: false, colX: "", colY: "" };

  let raw = tema.snapshot;
  if (typeof raw === "string") {
    raw = parseRespuestaJson(raw);
  }

  const config = raw?.configuracion || {};
  const datosSnapshot = raw?.datosSnapshot || raw?.datos || raw?.excelData;
  let resultado = raw?.resultadoFinal || raw?.resultado || (raw && !raw.configuracion && !raw.datosSnapshot && typeof raw === "object" && Object.keys(raw).length > 0 ? raw : null);

  // Determinar tipo de cálculo con soporte exhaustivo de nombres y números de tema
  const rawTipo = (
    raw?.calculo ||
    config?.calculo ||
    tema?.calculoTipo ||
    resultado?.tipo ||
    tema?.nombre ||
    ""
  ).toLowerCase();
  const numTema = (tema?.numero || "").toLowerCase().trim();

  let tipoCalculo = "frecuencias_completas";
  if (numTema.includes("8") || rawTipo.includes("indice") || rawTipo.includes("indices") || rawTipo.includes("deflacion")) {
    tipoCalculo = "numeros_indices";
  } else if (numTema.includes("7") || rawTipo.includes("series") || rawTipo.includes("temporal") || rawTipo.includes("tiempo")) {
    tipoCalculo = "series_tiempo";
  } else if (numTema.includes("6") || rawTipo.includes("regresion")) {
    tipoCalculo = "regresion_simple";
  } else if (numTema.includes("5") || rawTipo.includes("bivari")) {
    tipoCalculo = "distribucion_bivariada";
  } else if (numTema.includes("4") || rawTipo.includes("forma") || rawTipo.includes("variab") || rawTipo.includes("dispersion")) {
    tipoCalculo = "variabilidad_y_forma";
  } else if (numTema.includes("3") || rawTipo.includes("tendencia") || rawTipo.includes("posicion") || rawTipo.includes("central")) {
    tipoCalculo = "tendencia_y_posicion";
  } else if (numTema.includes("2") || rawTipo.includes("frecuencia") || rawTipo.includes("intervalo")) {
    tipoCalculo = (rawTipo.includes("intervalo") || config.tipoIntervalo === "intervalos") ? "distribucion_intervalos" : "frecuencias_completas";
  }

  const { numericas, todas } = encontrarColumnasOptimas(datosSnapshot);

  const colX = config?.columnasSeleccionadas?.x || numericas[0] || (todas.length > 0 ? todas[0] : "");
  const colY = config?.columnasSeleccionadas?.y || (numericas.length > 1 ? numericas[1] : (todas.length > 1 ? todas[1] : colX));

  // Si no viene resultado procesado pero tenemos datosSnapshot, calcular en caliente con todos los módulos matemáticos
  if (datosSnapshot && Array.isArray(datosSnapshot) && datosSnapshot.length > 0 && (!resultado || resultado === raw || Object.keys(resultado).length === 0)) {
    try {
      const extraerColumna = (colName) => {
        if (!colName) return [];
        return datosSnapshot
          .map(row => row[colName])
          .filter(v => v !== undefined && v !== null && v !== "" && v !== "ID" && !String(v).startsWith("Columna"));
      };

      const extraerColumnaNumerica = (colName) => {
        const rawVals = extraerColumna(colName);
        const nums = [];
        for (const val of rawVals) {
          if (typeof val === "number" && !isNaN(val)) nums.push(val);
          else if (typeof val === "string" && val.trim() !== "" && !isNaN(Number(val.trim()))) {
            nums.push(Number(val.trim()));
          }
        }
        return nums;
      };

      const metodoK = config.metodoK || "sturges";
      const kPersonalizado = config.kPersonalizado || "";
      const tipoIntervalo = config.tipoIntervalo || "semiabierto";
      const percentilK = config.percentilK || 50;
      const configData = { metodoK, kPersonalizado, tipoIntervalo };

      if (tipoCalculo === "regresion_simple" && colX && colY) {
        const xVals = extraerColumnaNumerica(colX);
        const yVals = extraerColumnaNumerica(colY);
        const minLen = Math.min(xVals.length, yVals.length);
        if (minLen >= 2) {
          const xSlice = xVals.slice(0, minLen);
          const ySlice = yVals.slice(0, minLen);
          const tipos = ["lineal", "exponencial", "logaritmica", "potencial", "reciproco", "cuadratica", "cubica"];
          const comparativa = [];
          tipos.forEach(tipo => {
            try {
              const res = RegMath.calcularRegresionSimple(xSlice, ySlice, tipo);
              if (res) comparativa.push(res);
            } catch (e) {}
          });
          if (comparativa.length > 0) {
            comparativa.sort((a, b) => b.indicadores.r2 - a.indicadores.r2);
            resultado = { tipo: "regresion", comparativa };
          }
        }
      } else if (tipoCalculo === "distribucion_bivariada" && colX && colY) {
        const xVals = extraerColumna(colX);
        const yVals = extraerColumna(colY);
        const minLen = Math.min(xVals.length, yVals.length);
        if (minLen >= 2) {
          resultado = MultiMath.calcularDistribucionBivariada(xVals.slice(0, minLen), yVals.slice(0, minLen));
        }
      } else if (tipoCalculo === "series_tiempo" && colX && colY) {
        const rawX = extraerColumna(colX);
        const rawY = extraerColumnaNumerica(colY);
        const minLen = Math.min(rawX.length, rawY.length);
        if (minLen >= 2) {
          resultado = SeriesMath.calcularSeriesTiempo(rawX.slice(0, minLen), rawY.slice(0, minLen), config.metodoSeries || "movil_simple", {
            k: config.periodosK || 3,
            pesos: config.pesos || "0.5, 0.3, 0.2",
            alfa: config.alfa || 0.2
          });
        }
      } else if (tipoCalculo === "numeros_indices") {
        const subTema = config.subTemaIndices || "compuestos";
        if (subTema === "deflacion" && colX && colY && config.colPrecioBase) {
          const arrT = extraerColumna(colX).map(String);
          const arrNominal = extraerColumnaNumerica(colY);
          const arrIPC = extraerColumnaNumerica(config.colPrecioBase);
          const minLen = Math.min(arrT.length, arrNominal.length, arrIPC.length);
          if (minLen >= 2) {
            resultado = IndicesMath.calcularDeflacionSalarial(arrT.slice(0, minLen), arrNominal.slice(0, minLen), arrIPC.slice(0, minLen));
          }
        } else if (subTema === "empalme" && colX && colY) {
          const arrT = extraerColumna(colX).map(String);
          const arrI = extraerColumnaNumerica(colY);
          const minLen = Math.min(arrT.length, arrI.length);
          if (minLen >= 2) {
            resultado = IndicesMath.calcularOperacionesSerieIndices(arrT.slice(0, minLen), arrI.slice(0, minLen), Number(config.nuevoIndiceBase || 100));
          }
        } else {
          const colP0 = config.colPrecioBase || colX;
          const colQ0 = config.colCantidadBase || colY;
          const colPt = config.colPrecioActual || colX;
          const colQt = config.colCantidadActual || colY;
          const p0 = extraerColumnaNumerica(colP0);
          const q0 = extraerColumnaNumerica(colQ0);
          const pt = extraerColumnaNumerica(colPt);
          const qt = extraerColumnaNumerica(colQt);
          const minLen = Math.min(p0.length, q0.length, pt.length, qt.length);
          if (minLen >= 1) {
            resultado = IndicesMath.calcularIndicesCompuestos(p0.slice(0, minLen), q0.slice(0, minLen), pt.slice(0, minLen), qt.slice(0, minLen), config.conPonderacion ? null : (config.tipoIndiceSimple || "precios"));
          }
        }
      } else if (colX) {
        const datosNum = extraerColumnaNumerica(colX);
        if (datosNum.length >= 2) {
          if (tipoCalculo === "tendencia_y_posicion") {
            const tendenciaData = UniMath.calcularTendenciaCentral(datosNum, configData);
            const graficosData = Array.isArray(tendenciaData) ? tendenciaData.pop() : null;
            const posData = UniMath.calcularFractiles(datosNum, percentilK, configData);
            resultado = {
              tipo: "tendencia_y_posicion",
              tendencia: Array.isArray(tendenciaData) ? tendenciaData : [],
              posicion: Array.isArray(posData) ? posData : [],
              datosPuros: [...datosNum].sort((a, b) => a - b),
              graficosTema3: graficosData
            };
          } else if (tipoCalculo === "variabilidad_y_forma") {
            const varRes = UniMath.calcularVariabilidadYForma(datosNum, configData);
            resultado = {
              ...varRes,
              tipo: "variabilidad_y_forma",
              datosPuros: [...datosNum].sort((a, b) => a - b)
            };
          } else if (tipoCalculo === "distribucion_intervalos") {
            resultado = UniMath.calcularDistribucionIntervalos(datosNum, configData);
          } else {
            resultado = UniMath.calcularFrecuencias(datosNum);
          }
        } else {
          // Frecuencias categóricas si no hay suficientes números
          const datosCat = extraerColumna(colX);
          if (datosCat.length > 0) {
            const conteo = {};
            datosCat.forEach(v => { const k = String(v).trim(); if (k) conteo[k] = (conteo[k] || 0) + 1; });
            const n = datosCat.length;
            let F_acum = 0;
            resultado = Object.entries(conteo).map(([cat, fi]) => {
              F_acum += fi;
              const hi = fi / n;
              return { x_i: cat, fi, hi, pi: hi * 100, Fi: F_acum, Pi: (F_acum / n) * 100 };
            });
          }
        }
      }
    } catch (e) {
      console.warn("Error en resolución de cálculo estadístico:", e);
    }
  }

  // Normalización de propiedades en objeto resultado
  if (resultado && typeof resultado === "object") {
    if (tipoCalculo === "regresion_simple" && !resultado.tipo) {
      resultado.tipo = "regresion";
    }
    if (tipoCalculo === "distribucion_bivariada" && !resultado.tipo) {
      resultado.tipo = "distribucion_bivariada";
    }
    if (tipoCalculo === "series_tiempo" && !resultado.tipo) {
      resultado.tipo = "series_tiempo";
    }
    if (tipoCalculo === "tendencia_y_posicion" && !resultado.tipo) {
      resultado.tipo = "tendencia_y_posicion";
    }
    if (tipoCalculo === "variabilidad_y_forma" && !resultado.tipo) {
      resultado.tipo = "variabilidad_y_forma";
    }
  }

  const esIntervalo = Boolean(
    config?.tipoIntervalo === "intervalos" ||
    tipoCalculo === "distribucion_intervalos" ||
    resultado?.esIntervalo ||
    (Array.isArray(resultado) && resultado.length > 0 && ("limite_inf" in resultado[0] || "lim_inf" in resultado[0])) ||
    (Array.isArray(resultado?.frecuencias) && resultado.frecuencias.length > 0 && ("limite_inf" in resultado.frecuencias[0] || "lim_inf" in resultado.frecuencias[0]))
  );

  return { resultado, config, tipoCalculo, esIntervalo, colX, colY, datosSnapshot };
}

// =========================================================================
// SUBCOMPONENTE: TARJETA DE REVISIÓN INTEGRAL DE UN EJERCICIO
// =========================================================================
function TarjetaEjercicioDocente({ tema, indice, tarea, entregaActual, respuestaActual, reabrirEnCalculadora, notaEjercicio, setNotaEjercicio, puedeEditar = true }) {
  const [vista, setVista] = useState("todo"); // "todo" | "tablas" | "graficos" | "datos"
  const [filtroFractil, setFiltroFractil] = useState("Todos");
  const [ordenGraficos, setOrdenGraficos] = useState([]);
  const [resultadoDinamico, setResultadoDinamico] = useState(null);
  const [cargandoDinamico, setCargandoDinamico] = useState(false);
  const [modelosVisibles, setModelosVisibles] = useState({
    lineal: true,
    exponencial: true,
    logaritmica: true,
    potencial: true,
    reciproco: true,
    cuadratica: true,
    cubica: true
  });

  const resEstatico = useMemo(() => {
    return resolverResultadoEstadistico(tema);
  }, [tema]);

  const archivoFinal = tema.archivoOrigen || respuestaActual?.archivo_base || tarea?.archivo_nombre || "";

  // Si no se pudo resolver un resultado estructurado estáticamente, cargamos el dataset del curso y resolvemos en caliente
  useEffect(() => {
    const resActual = resEstatico?.resultado;
    const esEstructurado = resActual && typeof resActual === "object" && (
      Array.isArray(resActual) ||
      resActual.tipo ||
      resActual.comparativa ||
      resActual.tendencia ||
      resActual.frecuencias
    );

    if (esEstructurado) return;
    if (!archivoFinal || archivoFinal === "Sin archivo") return;

    let cancelado = false;
    const cargarYCalcular = async () => {
      setCargandoDinamico(true);
      try {
        const cursoId = String(tarea?.clase_id || "");
        let resData = await api.verExcel(archivoFinal, 0, "", cursoId);
        if (cancelado) return;

        if ((!Array.isArray(resData) || resData.length === 0) && (!resData || resData.error)) {
          resData = await api.verExcel(archivoFinal, 0, "", "");
        }

        if (Array.isArray(resData) && resData.length > 0) {
          const mockTema = {
            ...tema,
            snapshot: {
              datosSnapshot: resData,
              configuracion: resEstatico.config || {}
            }
          };
          const res = resolverResultadoEstadistico(mockTema);
          if (!cancelado && res?.resultado) {
            setResultadoDinamico(res);
          }
        }
      } catch (err) {
        console.warn("No se pudo autocalcular desde archivo:", err);
      } finally {
        if (!cancelado) setCargandoDinamico(false);
      }
    };

    cargarYCalcular();
    return () => { cancelado = true; };
  }, [tema, resEstatico, archivoFinal, tarea?.clase_id]);


  const datosFinales = (resultadoDinamico?.resultado ? resultadoDinamico : resEstatico) || {};
  const { resultado, config, tipoCalculo, esIntervalo, colX, colY, datosSnapshot } = datosFinales;

  // Sincronizar modelos visibles si el resultado es regresión
  useEffect(() => {
    if (resultado && resultado.tipo === "regresion" && Array.isArray(resultado.comparativa) && resultado.comparativa.length > 0) {
      const mejorModelo = resultado.comparativa[0].tipoModelo;
      if (mejorModelo) {
        setModelosVisibles({
          lineal: mejorModelo === "lineal",
          exponencial: mejorModelo === "exponencial",
          logaritmica: mejorModelo === "logaritmica",
          potencial: mejorModelo === "potencial",
          reciproco: mejorModelo === "reciproco",
          cuadratica: mejorModelo === "cuadratica",
          cubica: mejorModelo === "cubica"
        });
      }
    }
  }, [resultado]);

  // Adaptar resultado para tablas unidimensionales si viene como objeto o array
  const resultadoParaTablasUni = useMemo(() => {
    if (!resultado) return null;
    if (tipoCalculo === "frecuencias_completas" || tipoCalculo === "distribucion_intervalos") {
      if (Array.isArray(resultado)) return resultado;
      if (Array.isArray(resultado.frecuencias)) return resultado.frecuencias;
      if (Array.isArray(resultado.datos)) return resultado.datos;
    }
    return resultado;
  }, [resultado, tipoCalculo]);

  // Adaptar resultado para gráficos
  const datosParaGraficos = useMemo(() => {
    if (!resultado) return null;
    if (!Array.isArray(resultado) && Array.isArray(resultado.frecuencias)) {
      if (tipoCalculo === "frecuencias_completas" || tipoCalculo === "distribucion_intervalos") {
        return resultado.frecuencias;
      }
    }
    if (!Array.isArray(resultado) && Array.isArray(resultado.datos) && (tipoCalculo === "frecuencias_completas" || tipoCalculo === "distribucion_intervalos")) {
      return resultado.datos;
    }
    return resultado;
  }, [resultado, tipoCalculo]);

  // Renderizar tabla cruda de fallback si no hay estructura especializada
  const renderTablaGenerica = (datos) => {
    if (!datos || !Array.isArray(datos) || datos.length === 0) return null;
    const cols = Object.keys(datos[0]);
    return (
      <div style={{ overflowX: "auto", width: "100%", paddingBottom: "8px" }}>
        <table className="tabla-academica" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--bg-main)", borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
              {cols.map(c => <th key={c} style={{ padding: "8px 12px" }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {datos.slice(0, 100).map((row, rIdx) => (
              <tr key={rIdx} style={{ borderBottom: "1px solid var(--border-color)" }}>
                {cols.map((c, cIdx) => (
                  <td key={cIdx} style={{ padding: "6px 12px" }}>
                    {typeof row[c] === "number" ? row[c].toFixed(4) : String(row[c] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="tarjeta-ejercicio-docente" style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border-color)",
      borderRadius: "12px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0, /* EVITA QUE SE ENCOJA Y CORTE EL CONTENIDO */
      minHeight: "min-content" /* ASEGURA QUE TOME LA ALTURA DE SU CONTENIDO */
    }}>
      {/* 1. Header del Ejercicio */}
      <div style={{
        padding: "12px 18px",
        background: "var(--bg-main)",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <span style={{
            background: "var(--primary-color)",
            color: "white",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "0.82rem",
            fontWeight: "bold"
          }}>
            {tema.numero || `Ejercicio ${indice + 1}`}
          </span>
          <h3 style={{ margin: 0, color: "var(--text-main)", fontSize: "1.05rem", fontWeight: "700" }}>
            {tema.nombre}
          </h3>
        </div>

        {/* Controles de vista, Input de calificación y botón de calculadora */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          
          {/* Input de nota para este ejercicio en específico */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg-card)", padding: "2px 6px", borderRadius: "8px", border: "1px solid var(--border-color)", opacity: puedeEditar ? 1 : 0.8 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)" }}>Nota:</span>
            <input 
              type="number" 
              min="0" 
              max="100" 
              placeholder="100" 
              disabled={!puedeEditar}
              readOnly={!puedeEditar}
              value={notaEjercicio !== undefined ? notaEjercicio : ""}
              onChange={(e) => setNotaEjercicio(e.target.value)}
              style={{
                width: "45px",
                padding: "2px 4px",
                border: "none",
                background: "transparent",
                color: puedeEditar ? "var(--primary-color)" : "var(--text-muted)",
                fontWeight: "bold",
                fontSize: "0.85rem",
                textAlign: "center",
                outline: "none",
                cursor: puedeEditar ? "text" : "not-allowed"
              }}
            />
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/100</span>
          </div>
          {/* Segmented control para alternar vista */}
          <div style={{
            display: "inline-flex",
            background: "var(--bg-card)",
            padding: "2px",
            borderRadius: "8px",
            border: "1px solid var(--border-color)"
          }}>
            <button
              onClick={() => setVista("todo")}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border: "none",
                background: vista === "todo" ? "var(--primary-color)" : "transparent",
                color: vista === "todo" ? "#fff" : "var(--text-main)",
                fontSize: "0.76rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
              title="Ver tablas de cálculo y gráficos simultáneamente"
            >
              <Grid size={13} /> Todo
            </button>
            <button
              onClick={() => setVista("tablas")}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border: "none",
                background: vista === "tablas" ? "var(--primary-color)" : "transparent",
                color: vista === "tablas" ? "#fff" : "var(--text-main)",
                fontSize: "0.76rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
              title="Ver únicamente tablas estadísticas y desarrollo de fórmulas"
            >
              <Table size={13} /> Tablas
            </button>
            <button
              onClick={() => setVista("graficos")}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border: "none",
                background: vista === "graficos" ? "var(--primary-color)" : "transparent",
                color: vista === "graficos" ? "#fff" : "var(--text-main)",
                fontSize: "0.76rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
              title="Ver únicamente gráficos interactivos"
            >
              <BarChart3 size={13} /> Gráficos
            </button>
          </div>

          <button
            onClick={() => reabrirEnCalculadora(tema)}
            title="Abrir este ejercicio en la Calculadora interactiva"
            className="btn-amarillo"
            style={{
              padding: "4px 10px",
              fontSize: "0.76rem"
            }}
          >
            <Calculator size={13} /> Calculadora
          </button>
        </div>
      </div>

      {/* 2. Barra de Parámetros Estadísticos Configurados */}
      <div style={{
        padding: "8px 18px",
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        gap: "15px",
        flexWrap: "wrap",
        fontSize: "0.8rem"
      }}>
        {colX && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: "var(--text-muted)" }}>Variable X:</span>
            <code style={{ background: "rgba(59, 130, 246, 0.1)", color: "var(--primary-color)", padding: "1px 6px", borderRadius: "4px", fontWeight: "bold" }}>
              {colX}
            </code>
          </span>
        )}
        {colY && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: "var(--text-muted)" }}>Variable Y:</span>
            <code style={{ background: "rgba(39, 174, 96, 0.1)", color: "#27ae60", padding: "1px 6px", borderRadius: "4px", fontWeight: "bold" }}>
              {colY}
            </code>
          </span>
        )}
        {config?.tipoIntervalo && (
          <span style={{ color: "var(--text-muted)" }}>
            Intervalos: <b style={{ color: "var(--text-main)" }}>{config.tipoIntervalo}</b>
          </span>
        )}
        {config?.metodoK && (
          <span style={{ color: "var(--text-muted)" }}>
            Método K: <b style={{ color: "var(--text-main)" }}>{config.metodoK}</b>
          </span>
        )}
        {archivoFinal && (
          <span style={{ color: "var(--text-muted)", display: "inline-flex", alignItems: "center", gap: "3px" }}>
            <FileSpreadsheet size={13} style={{ color: "#27ae60" }} /> Archivo: <b style={{ color: "var(--text-main)" }}>{archivoFinal}</b>
          </span>
        )}
        {tema.fechaCalculo && (
          <span style={{ color: "var(--text-muted)", marginLeft: "auto" }}>
            Generado: <b>{tema.fechaCalculo} {tema.horaCalculo || ""}</b>
          </span>
        )}
      </div>

      {/* 3. Contenido Principal: Tablas y Gráficos */}
      <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "20px", flexShrink: 0, minHeight: "min-content" }}>
        
        {cargandoDinamico ? (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <Clock size={20} style={{ animation: "spin 1.5s linear infinite" }} />
            <span>Procesando cálculos y gráficos estadísticos para este ejercicio...</span>
          </div>
        ) : (
          <>
            {/* SECCIÓN A: TABLAS ESTADÍSTICAS Y FÓRMULAS */}
            {(vista === "todo" || vista === "tablas") && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "2px solid var(--primary-color)",
                  paddingBottom: "6px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", color: "var(--text-main)", fontSize: "0.95rem" }}>
                    <Table size={16} style={{ color: "var(--primary-color)" }} />
                    <span>Tablas de Resultados y Cálculos Estadísticos</span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", background: "var(--bg-main)", padding: "2px 8px", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                    {(tipoCalculo || "ESTADÍSTICA").replace(/_/g, " ").toUpperCase()}
                  </span>
                </div>

                <div className="modal-correccion-tablas-wrap" style={{
                  background: "var(--bg-main)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "14px",
                  overflowX: "auto",
                  width: "100%",
                  boxSizing: "border-box"
                }}>
                  {tipoCalculo === "regresion_simple" && resultado?.tipo === "regresion" ? (
                    <TablaRegresion 
                      resultado={resultado} 
                      modelosVisibles={modelosVisibles}
                    />
                  ) : tipoCalculo === "distribucion_bivariada" && resultado?.tipo === "distribucion_bivariada" ? (
                    <TablasBivariantes 
                      resultado={resultado} 
                      calculo={tipoCalculo} 
                      formatearCelda={formatearCeldaDefault} 
                    />
                  ) : tipoCalculo === "series_tiempo" && resultado?.tipo === "series_tiempo" ? (
                    <TablaSeriesTiempo 
                      resultado={resultado} 
                      formatearCelda={formatearCeldaDefault} 
                    />
                  ) : tipoCalculo === "numeros_indices" && resultado && ["indices_compuestos", "operaciones_indices", "deflacion_financiera"].includes(resultado?.tipo) ? (
                    <TablaIndices 
                      resultado={resultado} 
                      formatearCelda={formatearCeldaDefault} 
                    />
                  ) : resultadoParaTablasUni ? (
                    <TablasUnidimensionales 
                      resultado={resultadoParaTablasUni} 
                      calculo={tipoCalculo} 
                      formatearCelda={formatearCeldaDefault} 
                      filtroFractil={filtroFractil}
                      setFiltroFractil={setFiltroFractil}
                    />
                  ) : Array.isArray(datosSnapshot) ? (
                    renderTablaGenerica(datosSnapshot)
                  ) : (
                    <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontStyle: "italic" }}>
                      No se encontraron datos para estructurar las tablas de este tema.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECCIÓN B: GRÁFICOS ESTADÍSTICOS INTERACTIVOS */}
            {(vista === "todo" || vista === "graficos") && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "2px solid #27ae60",
                  paddingBottom: "6px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold", color: "var(--text-main)", fontSize: "0.95rem" }}>
                    <BarChart3 size={16} style={{ color: "#27ae60" }} />
                    <span>Visualización Gráfica Interactiva</span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                    Reorganiza o maximiza los gráficos para revisar en detalle
                  </span>
                </div>

                <div className="modal-correccion-graficos" style={{
                  background: "var(--bg-main)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "16px",
                  minHeight: "420px",
                  overflowX: "auto",
                  width: "100%",
                  boxSizing: "border-box"
                }}>
                  {datosParaGraficos ? (
                    <PanelGraficos 
                      resultado={datosParaGraficos}
                      esIntervalo={esIntervalo}
                      calculo={tipoCalculo}
                      orden={ordenGraficos}
                      setOrden={setOrdenGraficos}
                      modelosVisibles={modelosVisibles}
                      setModelosVisibles={setModelosVisibles}
                      selectedColumn={colX}
                      selectedColumnY={colY}
                    />
                  ) : (
                    <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontStyle: "italic" }}>
                      No hay datos numéricos suficientes para generar gráficos estadísticos interactivos.
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

// Helper para extraer temas asignados
const parseEjerciciosAsignados = (texto) => {
  if (!texto || typeof texto !== 'string') return null;

  const colonIndex = texto.indexOf(":");
  let resto = texto;

  if (colonIndex !== -1 && !texto.trim().toLowerCase().startsWith("tema")) {
    resto = texto.substring(colonIndex + 1).trim();
  }

  const esTodos = resto.toLowerCase().includes("todos los temas");

  if (esTodos) {
    return [
      { numero: "Tema 2", nombre: "Tabla de Frecuencias", calculoTipo: "frecuencias_completas" },
      { numero: "Tema 2", nombre: "Distribución por Intervalos", calculoTipo: "distribucion_intervalos" },
      { numero: "Tema 3", nombre: "Medidas de Tendencia Central", calculoTipo: "tendencia_y_posicion" },
      { numero: "Tema 4", nombre: "Medidas de Dispersión y Forma", calculoTipo: "variabilidad_y_forma" },
      { numero: "Tema 5", nombre: "Distribuciones Bivariantes", calculoTipo: "distribucion_bivariada_avanzada" },
      { numero: "Tema 6", nombre: "Análisis de Regresión", calculoTipo: "regresion_simple" },
      { numero: "Tema 7", nombre: "Series Temporales", calculoTipo: "series_tiempo" },
      { numero: "Tema 8", nombre: "Números Índices", calculoTipo: "numeros_indices" },
    ];
  }

  const partes = resto.split(/,\s*(?=Tema\s*\d+)/i);
  return partes.map(p => {
    const match = p.match(/^(Tema\s*\d+)[\s*:\-\–]+(.*)$/i);
    if (match) {
      const num = match[1].trim();
      const nom = match[2].trim();
      let calcTipo = "frecuencias_completas";
      if (num.includes("2")) {
        calcTipo = nom.toLowerCase().includes("intervalo") ? "distribucion_intervalos" : "frecuencias_completas";
      } else if (num.includes("3")) {
        calcTipo = "tendencia_y_posicion";
      } else if (num.includes("4")) {
        calcTipo = "variabilidad_y_forma";
      } else if (num.includes("5")) {
        calcTipo = "distribucion_bivariada_avanzada";
      } else if (num.includes("6")) {
        calcTipo = "regresion_simple";
      } else if (num.includes("7")) {
        calcTipo = "series_tiempo";
      } else if (num.includes("8")) {
        calcTipo = "numeros_indices";
      }
      return { numero: num, nombre: nom, calculoTipo: calcTipo };
    }
    return { numero: "", nombre: p.trim(), calculoTipo: "frecuencias_completas" };
  }).filter(t => t.nombre || t.numero);
};


// =========================================================================
// COMPONENTE PRINCIPAL: MODAL DE ENTREGAS Y CORRECCIÓN DOCENTE
// =========================================================================
export default function ModalEntregasDocente({ tarea, onClose }) {
  const navigate = useNavigate();
  const [entregas, setEntregas] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estudiante seleccionado en la barra lateral
  const [estudianteIndex, setEstudianteIndex] = useState(0);
  const [busquedaEstudiante, setBusquedaEstudiante] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos"); // "todos" | "pendientes" | "revisados"

  // Pestaña de ejercicio activa para el estudiante actual ("todos" o índice del tema)
  const [temaFiltro, setTemaFiltro] = useState("todos");

  // Calificaciones y comentarios locales
  const [calificaciones, setCalificaciones] = useState({});
  const [comentarios, setComentarios] = useState({});
  const [calificacionesDetalle, setCalificacionesDetalle] = useState({});
  const [guardandoId, setGuardandoId] = useState(null);
  const [editandoId, setEditandoId] = useState(null);

  const cargarEntregas = async () => {
    setCargando(true);
    try {
      const res = await fetch(`${BASE_URL}/tareas/entregas/tarea/${tarea.id}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEntregas(data);
        
        const mapCal = {};
        const mapCom = {};
        const mapDetalle = {};
        data.forEach(e => {
          mapCal[e.id] = e.calificacion !== null && e.calificacion !== undefined ? e.calificacion : "";
          mapCom[e.id] = e.comentarios || "";
          try {
            mapDetalle[e.id] = e.detalle_calificaciones ? JSON.parse(e.detalle_calificaciones) : {};
          } catch (err) {
            mapDetalle[e.id] = {};
          }
        });
        setCalificaciones(mapCal);
        setComentarios(mapCom);
        setCalificacionesDetalle(mapDetalle);
      }
    } catch (error) {
      console.error("Error al cargar entregas:", error);
      alerta.error("Error", "No se pudieron cargar las entregas.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEntregas();
  }, [tarea.id]);

  // Filtrar estudiantes en la lista lateral
  const entregasFiltradas = useMemo(() => {
    return entregas.filter(e => {
      const cumpleTexto = !busquedaEstudiante.trim() || 
        (e.estudiante_nombre && e.estudiante_nombre.toLowerCase().includes(busquedaEstudiante.toLowerCase())) ||
        (e.estudiante_email && e.estudiante_email.toLowerCase().includes(busquedaEstudiante.toLowerCase()));
      
      if (!cumpleTexto) return false;

      if (filtroEstado === "pendientes") return e.estado !== "Revisado" && (e.calificacion === null || e.calificacion === undefined);
      if (filtroEstado === "revisados") return e.estado === "Revisado" || (e.calificacion !== null && e.calificacion !== undefined);
      return true;
    });
  }, [entregas, busquedaEstudiante, filtroEstado]);

  const entregaActual = entregasFiltradas[estudianteIndex] || entregasFiltradas[0] || null;

  const tieneNotaRegistrada = Boolean(
    entregaActual && (
      (entregaActual.calificacion !== null && entregaActual.calificacion !== undefined && entregaActual.calificacion !== "") ||
      entregaActual.estado === "Revisado"
    )
  );
  const estaEditando = Boolean(entregaActual && (editandoId === entregaActual.id || !tieneNotaRegistrada));
  const puedeEditar = estaEditando;

  const respuestaActual = useMemo(() => {
    if (!entregaActual) return null;
    return parseRespuestaJson(entregaActual.datos_respuesta);
  }, [entregaActual]);

  const temasCompletados = useMemo(() => {
    if (respuestaActual?.temas_completados && Array.isArray(respuestaActual.temas_completados) && respuestaActual.temas_completados.length > 0) {
      return respuestaActual.temas_completados;
    }
    if (Array.isArray(respuestaActual) && respuestaActual.length > 0) return respuestaActual;
    if (respuestaActual?.temas && Array.isArray(respuestaActual.temas) && respuestaActual.temas.length > 0) return respuestaActual.temas;
    if (respuestaActual?.ejercicios && Array.isArray(respuestaActual.ejercicios) && respuestaActual.ejercicios.length > 0) return respuestaActual.ejercicios;
    
    // Si la entrega no contiene la lista explícita de temas, obtenemos los ejercicios asignados a la tarea
    if (tarea?.ejercicios_seleccionados) {
      const temasAsignados = parseEjerciciosAsignados(tarea.ejercicios_seleccionados);
      if (temasAsignados && temasAsignados.length > 0) {
        return temasAsignados.map((t, idx) => ({
          numero: t.numero || `Tema ${idx + 1}`,
          nombre: t.nombre || `Ejercicio ${idx + 1}`,
          calculoTipo: t.calculoTipo,
          archivoOrigen: tarea.archivo_nombre,
          snapshot: respuestaActual
        }));
      }
    }

    if (respuestaActual && typeof respuestaActual === "object") {
      return [{
        numero: "Tema 1",
        nombre: "Resultados Entregados",
        snapshot: respuestaActual,
        archivoOrigen: tarea?.archivo_nombre
      }];
    }

    return [];
  }, [respuestaActual, tarea]);

  const handleNotaPregunta = (entregaId, temaIndex, notaStr) => {
    setCalificacionesDetalle(prev => {
      const actualDetalle = { ...(prev[entregaId] || {}) };
      actualDetalle[temaIndex] = notaStr;
      
      let sum = 0;
      let count = 0;
      for (const val of Object.values(actualDetalle)) {
         if (val !== "" && !isNaN(parseInt(val))) {
             sum += parseInt(val);
             count++;
         }
      }
      
      if (count > 0) {
          const prom = Math.round(sum / count);
          setCalificaciones(prevCal => ({ ...prevCal, [entregaId]: prom.toString() }));
      }
      
      return { ...prev, [entregaId]: actualDetalle };
    });
  };

  const handleGuardarCalificacion = async (entregaId) => {
    if (!entregaId) return;
    setGuardandoId(entregaId);
    try {
      const notaStr = calificaciones[entregaId];
      const nota = notaStr !== "" && notaStr !== null && notaStr !== undefined ? parseInt(notaStr) : null;
      const com = comentarios[entregaId] || "";
      const detalle = calificacionesDetalle[entregaId] || {};

      const res = await fetch(`${BASE_URL}/tareas/entregas/${entregaId}/calificar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          calificacion: nota,
          comentarios: com,
          estado: "Revisado",
          detalle_calificaciones: JSON.stringify(detalle)
        })
      });

      if (res.ok) {
        const dataActualizada = await res.json();
        alerta.success("Calificación guardada", `Nota asignada (${nota !== null ? nota : 0}/100) correctamente.`);
        setEntregas(prev => prev.map(e => e.id === entregaId ? { ...e, ...dataActualizada } : e));
        setEditandoId(null);
      } else {
        alerta.error("Error", "No se pudo guardar la calificación.");
      }
    } catch (error) {
      console.error("Error guardando calificacion:", error);
      alerta.error("Error", "Problema de conexión al guardar.");
    } finally {
      setGuardandoId(null);
    }
  };

  const reabrirEnCalculadora = (tema) => {
    const tieneArchivoDocente = Boolean(tarea.archivo_id || tarea.archivo_nombre);
    const archivoFinal = tema.archivoOrigen || respuestaActual?.archivo_base || (tieneArchivoDocente ? tarea.archivo_nombre : "");
    const datosBrutos = tema.snapshot;
    const snapshotListo = typeof datosBrutos === "string" ? parseRespuestaJson(datosBrutos) : datosBrutos;

    if (onClose) onClose();

    const esSinArchivo = !archivoFinal || archivoFinal === "Sin archivo" || archivoFinal === "Tabla Dinamica";

    navigate("/calculadora", {
      state: {
        archivoReabrir: esSinArchivo ? "" : archivoFinal,
        archivoSeleccionadoId: tieneArchivoDocente ? tarea.archivo_id : null,
        calculoReabrir: tema.calculoTipo,
        snapshot: snapshotListo,
        sinArchivo: esSinArchivo,
        origenArchivos: "curso",
        cursoSeleccionado: String(tarea.clase_id)
      }
    });
  };

  const aplicarComentarioRapido = (texto) => {
    if (!entregaActual) return;
    const actual = comentarios[entregaActual.id] || "";
    const nuevo = actual ? `${actual}. ${texto}` : texto;
    setComentarios({ ...comentarios, [entregaActual.id]: nuevo });
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(5px)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10000,
      padding: "16px",
      boxSizing: "border-box"
    }}>
      <style>{`
        /* Scrollbar y estilos para que las tablas no se corten */
        .modal-correccion-tablas-wrap {
          width: 100% !important;
          max-width: 100% !important;
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch !important;
          box-sizing: border-box !important;
          padding-bottom: 8px !important;
        }
        .modal-correccion-tablas-wrap::-webkit-scrollbar {
          height: 8px;
        }
        .modal-correccion-tablas-wrap::-webkit-scrollbar-thumb {
          background-color: var(--primary-color, #3b82f6);
          border-radius: 4px;
        }
        .modal-correccion-tablas-wrap table,
        .modal-correccion-tablas-wrap .tabla-academica {
          width: 100% !important;
          min-width: 600px !important;
          border-collapse: collapse !important;
        }
        .modal-correccion-tablas-wrap th,
        .modal-correccion-tablas-wrap td {
          white-space: nowrap !important;
          padding: 8px 14px !important;
        }

        /* Asegurar que los gráficos no se corten y ocupen la altura adecuada */
        .modal-correccion-graficos {
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          overflow-x: auto !important;
        }
        .modal-correccion-graficos .panel-graficos-grid {
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)) !important;
          gap: 20px !important;
          width: 100% !important;
          padding: 4px !important;
          box-sizing: border-box !important;
        }
        @media (max-width: 900px) {
          .modal-correccion-graficos .panel-graficos-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .modal-correccion-graficos .widget-grafico {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          min-height: 440px !important;
          height: 440px !important;
          display: flex !important;
          flex-direction: column !important;
          box-sizing: border-box !important;
          overflow: visible !important;
        }
        .modal-correccion-graficos .widget-grafico[style*="1 / -1"],
        .modal-correccion-graficos .grafico-ancho-completo {
          grid-column: 1 / -1 !important;
        }
        .modal-correccion-graficos .widget-body {
          flex: 1 1 0% !important;
          min-height: 360px !important;
          height: calc(100% - 48px) !important;
          position: relative !important;
          display: block !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
        }
        .modal-correccion-graficos .contenedor-grafico-interno {
          position: absolute !important;
          top: 10px !important;
          left: 10px !important;
          right: 10px !important;
          bottom: 10px !important;
          width: auto !important;
          height: auto !important;
        }
      `}</style>
      <div style={{
        background: "var(--bg-card)",
        borderRadius: "14px",
        width: "100%",
        maxWidth: "1350px",
        height: "94vh",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 20px 45px rgba(0,0,0,0.35)",
        border: "1px solid var(--border-color)",
        overflow: "hidden"
      }}>
        
        {/* ========================================================= */}
        {/* 1. BARRA SUPERIOR DE ENCABEZADO Y CONTROL                  */}
        {/* ========================================================= */}
        <div style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border-color)",
          background: "var(--bg-card)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          zIndex: 10
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "rgba(59, 130, 246, 0.12)", color: "var(--primary-color)", padding: "8px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, color: "var(--text-main)", fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "8px" }}>
                Centro de Corrección Integral: {tarea.titulo}
              </h2>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Revisa los cálculos, fórmulas y gráficos de cada ejercicio directamente sin salir de este panel.
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "0.84rem", color: "var(--text-muted)", background: "var(--bg-main)", padding: "5px 12px", borderRadius: "20px", border: "1px solid var(--border-color)", fontWeight: "600" }}>
              {entregas.length} {entregas.length === 1 ? "entrega recibida" : "entregas recibidas"}
            </span>
            <button 
              onClick={onClose} 
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", padding: "6px", borderRadius: "6px" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-main)"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CUERPO PRINCIPAL (2 COLUMNAS: ESTUDIANTES + REVISIÓN)  */}
        {/* ========================================================= */}
        {cargando ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "var(--text-muted)", gap: "10px" }}>
            <Clock size={34} style={{ animation: "spin 2s linear infinite", opacity: 0.7 }} />
            <div style={{ fontSize: "1rem", fontWeight: "600" }}>Cargando todas las entregas de la tarea...</div>
          </div>
        ) : entregas.length === 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", color: "var(--text-muted)", gap: "12px", padding: "30px" }}>
            <Users size={48} style={{ opacity: 0.3 }} />
            <h3 style={{ margin: 0, color: "var(--text-main)" }}>Aún no hay entregas de estudiantes</h3>
            <p style={{ margin: 0, fontSize: "0.9rem", textAlign: "center", maxWidth: "420px" }}>
              Cuando tus alumnos resuelvan los ejercicios en la calculadora y envíen su práctica, podrás ver y corregir todos sus cálculos aquí mismo.
            </p>
          </div>
        ) : (
          <div style={{ flex: "1 1 0%", minHeight: 0, display: "flex", overflow: "hidden" }}>
            
            {/* ---------------------------------------------------- */}
            {/* COLUMNA IZQUIERDA: LISTA DE ESTUDIANTES               */}
            {/* ---------------------------------------------------- */}
            <div style={{
              width: "300px",
              minWidth: "260px",
              flexShrink: 0,
              minHeight: 0,
              borderRight: "1px solid var(--border-color)",
              background: "var(--bg-main)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}>
              {/* Buscador de alumnos y Filtros rápidos */}
              <div style={{ padding: "12px", borderBottom: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
                <div style={{ position: "relative" }}>
                  <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input
                    type="text"
                    placeholder="Buscar estudiante..."
                    value={busquedaEstudiante}
                    onChange={(e) => setBusquedaEstudiante(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "7px 10px 7px 32px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-color)",
                      background: "var(--bg-input)",
                      color: "var(--text-main)",
                      fontSize: "0.84rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "4px" }}>
                  <button
                    onClick={() => setFiltroEstado("todos")}
                    style={{
                      flex: 1,
                      padding: "4px 6px",
                      borderRadius: "4px",
                      border: "1px solid var(--border-color)",
                      background: filtroEstado === "todos" ? "var(--primary-color)" : "var(--bg-card)",
                      color: filtroEstado === "todos" ? "#fff" : "var(--text-main)",
                      fontSize: "0.74rem",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Todos ({entregas.length})
                  </button>
                  <button
                    onClick={() => setFiltroEstado("pendientes")}
                    style={{
                      flex: 1,
                      padding: "4px 6px",
                      borderRadius: "4px",
                      border: "1px solid var(--border-color)",
                      background: filtroEstado === "pendientes" ? "#d97706" : "var(--bg-card)",
                      color: filtroEstado === "pendientes" ? "#fff" : "var(--text-main)",
                      fontSize: "0.74rem",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Pendientes
                  </button>
                  <button
                    onClick={() => setFiltroEstado("revisados")}
                    style={{
                      flex: 1,
                      padding: "4px 6px",
                      borderRadius: "4px",
                      border: "1px solid var(--border-color)",
                      background: filtroEstado === "revisados" ? "#27ae60" : "var(--bg-card)",
                      color: filtroEstado === "revisados" ? "#fff" : "var(--text-main)",
                      fontSize: "0.74rem",
                      fontWeight: "600",
                      cursor: "pointer"
                    }}
                  >
                    Revisados
                  </button>
                </div>
              </div>

              {/* Lista scrolleable de alumnos */}
              <div style={{ flex: "1 1 0%", minHeight: 0, overflowY: "auto", padding: "8px" }}>
                {entregasFiltradas.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                    No hay estudiantes que coincidan
                  </div>
                ) : (
                  entregasFiltradas.map((e, idx) => {
                    const seleccionado = entregaActual?.id === e.id;
                    const notaActual = calificaciones[e.id] !== "" && calificaciones[e.id] !== undefined ? calificaciones[e.id] : e.calificacion;
                    const esRevisado = e.estado === "Revisado" || (notaActual !== null && notaActual !== undefined && notaActual !== "");

                    return (
                      <div
                        key={e.id}
                        onClick={() => {
                          setEstudianteIndex(idx);
                          setTemaFiltro("todos");
                        }}
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          marginBottom: "6px",
                          cursor: "pointer",
                          background: seleccionado ? "rgba(59, 130, 246, 0.12)" : "var(--bg-card)",
                          border: seleccionado ? "1px solid var(--primary-color)" : "1px solid var(--border-color)",
                          transition: "all 0.18s ease"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "6px" }}>
                          <div style={{ fontWeight: "700", fontSize: "0.88rem", color: seleccionado ? "var(--primary-color)" : "var(--text-main)", overflowWrap: "anywhere" }}>
                            {e.estudiante_nombre || `Estudiante #${e.estudiante_id}`}
                          </div>
                          {esRevisado ? (
                            <span style={{ background: "rgba(39, 174, 96, 0.18)", color: "#27ae60", padding: "1px 6px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "700", flexShrink: 0 }}>
                              {notaActual}/100
                            </span>
                          ) : (
                            <span style={{ background: "rgba(243, 156, 18, 0.15)", color: "#d97706", padding: "1px 6px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: "700", flexShrink: 0 }}>
                              Pendiente
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          {e.estudiante_email || ""}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* COLUMNA DERECHA: PANEL DE CORRECCIÓN COMPLETO        */}
            {/* ---------------------------------------------------- */}
            {entregaActual ? (
              <div style={{
                flex: "1 1 0%",
                minHeight: 0,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                background: "var(--bg-main)"
              }}>
                
                {/* 1. Header del Estudiante Activo */}
                <div style={{
                  padding: "12px 20px",
                  borderBottom: "1px solid var(--border-color)",
                  background: "var(--bg-card)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                  flexShrink: 0
                }}>
                  <div>
                    <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>{entregaActual.estudiante_nombre || `Estudiante #${entregaActual.estudiante_id}`}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "normal" }}>({entregaActual.estudiante_email})</span>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px", display: "flex", gap: "15px", flexWrap: "wrap" }}>
                      <span><b>Entregado:</b> {entregaActual.fecha_entrega ? new Date(entregaActual.fecha_entrega).toLocaleString('es-ES') : "Fecha no registrada"}</span>
                      {respuestaActual?.archivo_base && (
                        <span style={{ color: "#27ae60", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <FileSpreadsheet size={13} /> Archivo: <b>{respuestaActual.archivo_base}</b>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Selector de ejercicios (Filtro de temas) */}
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: "600", color: "var(--text-muted)" }}>Filtrar:</span>
                    <button
                      onClick={() => setTemaFiltro("todos")}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "16px",
                        border: "1px solid var(--border-color)",
                        background: temaFiltro === "todos" ? "var(--primary-color)" : "var(--bg-card)",
                        color: temaFiltro === "todos" ? "#fff" : "var(--text-main)",
                        fontSize: "0.76rem",
                        fontWeight: "700",
                        cursor: "pointer"
                      }}
                    >
                      Todos ({temasCompletados.length})
                    </button>
                    {temasCompletados.map((t, idx) => (
                      <button
                        key={idx}
                        onClick={() => setTemaFiltro(idx)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: "16px",
                          border: "1px solid var(--border-color)",
                          background: temaFiltro === idx ? "var(--primary-color)" : "var(--bg-card)",
                          color: temaFiltro === idx ? "#fff" : "var(--text-main)",
                          fontSize: "0.76rem",
                          fontWeight: "700",
                          cursor: "pointer"
                        }}
                      >
                        {t.numero || `Tema ${idx + 1}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Área Central Scrolleable con los Ejercicios y Gráficos */}
                <div style={{
                  flex: "1 1 0%",
                  minHeight: 0,
                  minWidth: 0,
                  overflowY: "auto",
                  overflowX: "auto",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px"
                }}>
                  {temasCompletados.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                      <AlertCircle size={36} style={{ marginBottom: "10px", opacity: 0.5 }} />
                      <h4 style={{ margin: 0, color: "var(--text-main)" }}>No se encontraron ejercicios con snapshot</h4>
                      <p style={{ margin: "6px 0 0", fontSize: "0.85rem" }}>
                        El estudiante completó la tarea pero no se registraron resultados estadísticos estructurados.
                      </p>
                    </div>
                  ) : (
                    temasCompletados
                      .filter((_, idx) => temaFiltro === "todos" || temaFiltro === idx)
                      .map((tema, tIdx) => (
                        <TarjetaEjercicioDocente
                          key={tIdx}
                          tema={tema}
                          indice={tIdx}
                          tarea={tarea}
                          entregaActual={entregaActual}
                          respuestaActual={respuestaActual}
                          reabrirEnCalculadora={reabrirEnCalculadora}
                          notaEjercicio={(calificacionesDetalle[entregaActual.id] || {})[tIdx]}
                          setNotaEjercicio={(val) => handleNotaPregunta(entregaActual.id, tIdx, val)}
                          puedeEditar={puedeEditar}
                        />
                      ))
                  )}
                </div>

                {/* 3. Barra Inferior Fija de Calificación y Retroalimentación */}
                <div style={{
                  padding: "12px 20px",
                  borderTop: "1px solid var(--border-color)",
                  background: "var(--bg-card)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  flexShrink: 0,
                  zIndex: 5
                }}>
                  {/* Atajos de comentarios rápidos */}
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap", opacity: puedeEditar ? 1 : 0.6 }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "var(--text-muted)" }}>Feedback rápido:</span>
                    {["¡Excelente desarrollo!", "Cálculos y gráficos correctos", "Revisar cálculo de dispersión", "Completar interpretación", "Buen trabajo"].map((frase, fIdx) => (
                      <button
                        key={fIdx}
                        type="button"
                        disabled={!puedeEditar}
                        onClick={() => puedeEditar && aplicarComentarioRapido(frase)}
                        style={{
                          background: "var(--bg-main)",
                          border: "1px solid var(--border-color)",
                          borderRadius: "12px",
                          padding: "3px 8px",
                          fontSize: "0.72rem",
                          color: "var(--text-muted)",
                          cursor: puedeEditar ? "pointer" : "not-allowed",
                          transition: "all 0.15s ease"
                        }}
                        onMouseEnter={(e) => { if (puedeEditar) { e.currentTarget.style.borderColor = "var(--primary-color)"; e.currentTarget.style.color = "var(--primary-color)"; } }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.color = "var(--text-muted)"; }}
                      >
                        + {frase}
                      </button>
                    ))}
                  </div>

                  {/* Formulario de Calificación */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ width: "130px" }}>
                      <label style={{ display: "block", fontSize: "0.76rem", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "3px" }}>
                        Nota (0 - 100):
                      </label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        disabled={!puedeEditar}
                        readOnly={!puedeEditar}
                        placeholder="Ej: 95" 
                        value={calificaciones[entregaActual.id] !== undefined ? calificaciones[entregaActual.id] : ""} 
                        onChange={(e) => setCalificaciones({ ...calificaciones, [entregaActual.id]: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-color)",
                          background: puedeEditar ? "var(--bg-main)" : "rgba(0,0,0,0.06)",
                          color: puedeEditar ? "var(--text-main)" : "var(--text-muted)",
                          cursor: puedeEditar ? "text" : "not-allowed",
                          boxSizing: "border-box",
                          fontSize: "0.95rem",
                          fontWeight: "bold"
                        }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: "220px" }}>
                      <label style={{ display: "block", fontSize: "0.76rem", fontWeight: "bold", color: "var(--text-muted)", marginBottom: "3px" }}>
                        Observaciones / Feedback al Alumno:
                      </label>
                      <input 
                        type="text" 
                        disabled={!puedeEditar}
                        readOnly={!puedeEditar}
                        placeholder={puedeEditar ? "Escribe comentarios sobre los ejercicios revisados..." : "Sin observaciones"} 
                        value={comentarios[entregaActual.id] !== undefined ? comentarios[entregaActual.id] : ""} 
                        onChange={(e) => setComentarios({ ...comentarios, [entregaActual.id]: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-color)",
                          background: puedeEditar ? "var(--bg-main)" : "rgba(0,0,0,0.06)",
                          color: puedeEditar ? "var(--text-main)" : "var(--text-muted)",
                          cursor: puedeEditar ? "text" : "not-allowed",
                          boxSizing: "border-box",
                          fontSize: "0.88rem"
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginTop: "18px" }}>
                      {tieneNotaRegistrada && !estaEditando ? (
                        <button
                          type="button"
                          onClick={() => setEditandoId(entregaActual.id)}
                          className="btn-amarillo"
                          style={{
                            padding: "8px 20px",
                            fontSize: "0.88rem",
                          }}
                        >
                          <Edit3 size={16} /> Editar Nota
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleGuardarCalificacion(entregaActual.id)}
                          disabled={guardandoId === entregaActual.id}
                          className="btn-azul"
                          style={{
                            padding: "8px 20px",
                            fontSize: "0.88rem",
                          }}
                        >
                          <Save size={16} /> {guardandoId === entregaActual.id ? "Guardando..." : (tieneNotaRegistrada ? "Guardar Cambios" : "Registrar Nota")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", color: "var(--text-muted)" }}>
                Selecciona un estudiante de la lista para revisar sus ejercicios.
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

