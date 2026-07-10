import { useState, useEffect } from "react";
import { useModuleData } from "../../../components/Gestion_Datos/DataContext";

import * as UniMath from "../utils/estadisticaUnidimensional";
import * as MultiMath from "../utils/estadisticaMultivariante";
import * as RegMath from "../utils/estadisticaRegresion";
import * as SeriesMath from "../utils/estadisticaSeriesTiempo";
import * as IndicesMath from "../utils/estadisticaIndices";

import { api } from "../../../services/api";
import { alerta } from "../../../utils/Notificaciones";

export function useCalculadoraExcel(filename, sheet, datosPrecargados = null, curso = "") {
  const { variables, usuario } = useModuleData();
  const [exceldataoriginal, setExcelDataOriginal] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);

  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedColumnY, setSelectedColumnY] = useState("");

  const [calculo, setCalculo] = useState("frecuencias_completas");
  const [tipoIntervalo, setTipoIntervalo] = useState("semiabierto");
  const [metodoK, setMetodoK] = useState("sturges");
  const [kPersonalizado, setKPersonalizado] = useState("");
  const [percentilK, setPercentilK] = useState(50);

  const [metodoSeries, setMetodoSeries] = useState("movil_simple");
  const [periodosK, setPeriodosK] = useState(3);
  const [pesos, setPesos] = useState("0.5, 0.3, 0.2");
  const [alfa, setAlfa] = useState(0.2);

  const [subTemaIndices, setSubTemaIndices] = useState("compuestos");
  const [colPrecioBase, setColPrecioBase] = useState("");
  const [colCantidadBase, setColCantidadBase] = useState("");
  const [colPrecioActual, setColPrecioActual] = useState("");
  const [colCantidadActual, setColCantidadActual] = useState("");
  const [nuevoIndiceBase, setNuevoIndiceBase] = useState(100);
  const [conPonderacion, setConPonderacion] = useState(false);
  const [tipoIndiceSimple, setTipoIndiceSimple] = useState("precios");
  const [conColumnaItem, setConColumnaItem] = useState(false);
  const [columnaItem, setColumnaItem] = useState("");

  const [errorNumerico, setErrorNumerico] = useState(false);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    if (datosPrecargados) {
      setExcelData(datosPrecargados);
      setExcelDataOriginal(datosPrecargados);
      if (datosPrecargados.length > 0) {
        setColumns(Object.keys(datosPrecargados[0]));
      }
      return;
    }

    if (!filename || sheet === "" || sheet === undefined || !usuario) return;

    const caragarDatos = async () => {
      try {
        const data = await api.obtenerDatosHoja(filename, Number(sheet), usuario.nombre, curso);
        if (Array.isArray(data) && data.length > 0) {
          const headerRow = Object.keys(data[0]);
          setColumns(headerRow);
          setExcelData(data);
          setExcelDataOriginal(data);

          if (headerRow.length > 0) {
            setSelectedColumn(prev => (prev && headerRow.includes(prev)) ? prev : headerRow[0]);
            setSelectedColumnY(prev => (prev && headerRow.includes(prev)) ? prev : (headerRow.length > 1 ? headerRow[1] : headerRow[0]));

            setColPrecioBase(prev => (prev && headerRow.includes(prev)) ? prev : headerRow[0]);
            setColCantidadBase(prev => (prev && headerRow.includes(prev)) ? prev : (headerRow.length > 1 ? headerRow[1] : headerRow[0]));
            setColPrecioActual(prev => (prev && headerRow.includes(prev)) ? prev : (headerRow.length > 2 ? headerRow[2] : headerRow[0]));
            setColCantidadActual(prev => (prev && headerRow.includes(prev)) ? prev : (headerRow.length > 3 ? headerRow[3] : headerRow[0]));
            setColumnaItem(prev => (prev && headerRow.includes(prev)) ? prev : headerRow[0]);
          }
        } else {
          setExcelData([]);
          setColumns([]);
        }
      } catch (err) {
        console.error("Error cargando excel:", err);
      }
    };
    caragarDatos();
  }, [filename, sheet, usuario?.nombre, datosPrecargados, curso]);

  const handleChangeDato = (index, colName, value) => {
    const esNumero = !isNaN(Number(value)) && value.trim() !== "";
    const nuevoValor = esNumero ? Number(value) : value;

    const newData = [...excelData];
    if (newData[index]) {
      newData[index][colName] = nuevoValor;
      setExcelData(newData);
    }
  };

  const handleActualizarColumna = (colName, nuevosValores) => {
    const maxLen = Math.max(excelData.length, nuevosValores.length);
    const newExcelData = [];
    for (let i = 0; i < maxLen; i++) {
      const row = excelData[i] ? { ...excelData[i] } : {};
      columns.forEach(col => {
        if (!(col in row)) {
          row[col] = "";
        }
      });
      const val = nuevosValores[i];
      if (val !== undefined && val !== null) {
        const esNumero = !isNaN(Number(val)) && val.toString().trim() !== "";
        row[colName] = esNumero ? Number(val) : val;
      } else {
        row[colName] = "";
      }
      newExcelData.push(row);
    }
    setExcelData(newExcelData);
  };

  const handleCrearColumna = (colName) => {
    if (!colName || columns.includes(colName)) {
      alerta.error("Nombre inválido", "El nombre de la columna está vacío o ya existe.");
      return;
    }
    const newColumns = [...columns, colName];
    setColumns(newColumns);
    const newExcelData = excelData.map(row => ({
      ...row,
      [colName]: ""
    }));
    setExcelData(newExcelData);
    alerta.success("Columna creada", `Se creó la columna '${colName}' con éxito.`);
  };

  const obtenerColumna = (colName) => {
    if (!colName) return [];
    if (excelData.length > 0 && excelData[0][colName] !== undefined) {
      return excelData.map(row => row[colName]);
    }
    const vCapturada = variables.find(v => v.nombre === colName);
    if (vCapturada && vCapturada.datos) {
      return vCapturada.datos;
    }
    if (exceldataoriginal.length > 0 && exceldataoriginal[0][colName] !== undefined) {
      return exceldataoriginal.map(row => row[colName]);
    }
    return [];
  };

  const ejecutarCalculo = () => {
    if (calculo === "distribucion_bivariada" || calculo === "distribucion_bivariada_avanzada") {
      if (!selectedColumn || !selectedColumnY) return;
      const rawDataX = obtenerColumna(selectedColumn);
      const rawDataY = obtenerColumna(selectedColumnY);
      const cleanX = []; const cleanY = [];
      const maxLen = Math.min(rawDataX.length, rawDataY.length);

      for (let i = 0; i < maxLen; i++) {
        const valX = rawDataX[i]; const valY = rawDataY[i];
        if (valX !== "" && valX !== null && valX !== undefined &&
          valY !== "" && valY !== null && valY !== undefined) {
          const numX = Number(valX); const numY = Number(valY);
          cleanX.push(!isNaN(numX) && valX.toString().trim() !== "" ? numX : valX);
          cleanY.push(!isNaN(numY) && valY.toString().trim() !== "" ? numY : valY);
        }
      }
      setResultado(MultiMath.calcularDistribucionBivariada(cleanX, cleanY));
      setErrorNumerico(false);
      return;
    }

    if (calculo === "regresion_simple") {
      if (!selectedColumn || !selectedColumnY) return;
      const dataX = []; const dataY = [];
      const rawX = obtenerColumna(selectedColumn); const rawY = obtenerColumna(selectedColumnY);

      for (let i = 0; i < rawX.length; i++) {
        const nx = Number(rawX[i]); const ny = Number(rawY[i]);
        if (!isNaN(nx) && !isNaN(ny) && rawX[i] !== "" && rawY[i] !== "") {
          dataX.push(nx); dataY.push(ny);
        }
      }

      const tipos = ["lineal", "exponencial", "logaritmica", "potencial", "reciproco", "cuadratica", "cubica"];
      const comparativa = [];
      tipos.forEach(tipo => {
        const res = RegMath.calcularRegresionSimple(dataX, dataY, tipo);
        if (res) comparativa.push(res);
      });

      if (comparativa.length === 0) {
        setErrorNumerico(true); setResultado(null);
      } else {
        setErrorNumerico(false);
        comparativa.sort((a, b) => b.indicadores.r2 - a.indicadores.r2);
        setResultado({ tipo: "regresion", comparativa: comparativa });
      }
      return;
    }

    if (calculo === "series_tiempo") {
      if (!selectedColumn || !selectedColumnY) return;
      const rawX = obtenerColumna(selectedColumn); const rawY = obtenerColumna(selectedColumnY);
      const dataX = []; const dataY = [];

      for (let i = 0; i < rawX.length; i++) {
        const ny = Number(rawY[i]);
        if (!isNaN(ny) && rawY[i] !== "" && rawX[i] !== undefined && rawX[i] !== null) {
          dataX.push(String(rawX[i])); dataY.push(ny);
        }
      }

      if (dataY.length === 0) { setErrorNumerico(true); setResultado(null); return; }

      setResultado(SeriesMath.calcularSeriesTiempo(dataX, dataY, metodoSeries, { k: periodosK, pesos, alfa }));
      setErrorNumerico(false);
      return;
    }

    if (calculo === "numeros_indices") {
      let resIndices = null;
      if (subTemaIndices === "compuestos") {
        let p0, q0, pt, qt;
        if (!conPonderacion) {
          if (tipoIndiceSimple === "precios") {
            if (!colPrecioBase || !colPrecioActual) return;
            p0 = obtenerColumna(colPrecioBase).map(Number);
            pt = obtenerColumna(colPrecioActual).map(Number);
            if (p0.some(isNaN) || pt.some(isNaN) || p0.length === 0) {
              setErrorNumerico(true); setResultado(null); return;
            }
            q0 = new Array(p0.length).fill(1);
            qt = new Array(p0.length).fill(1);
          } else {
            if (!colCantidadBase || !colCantidadActual) return;
            q0 = obtenerColumna(colCantidadBase).map(Number);
            qt = obtenerColumna(colCantidadActual).map(Number);
            if (q0.some(isNaN) || qt.some(isNaN) || q0.length === 0) {
              setErrorNumerico(true); setResultado(null); return;
            }
            p0 = new Array(q0.length).fill(1);
            pt = new Array(q0.length).fill(1);
          }
        } else {
          if (!colPrecioBase || !colCantidadBase || !colPrecioActual || !colCantidadActual) return;
          p0 = obtenerColumna(colPrecioBase).map(Number);
          q0 = obtenerColumna(colCantidadBase).map(Number);
          pt = obtenerColumna(colPrecioActual).map(Number);
          qt = obtenerColumna(colCantidadActual).map(Number);

          if (p0.some(isNaN) || q0.some(isNaN) || pt.some(isNaN) || qt.some(isNaN) || p0.length === 0) {
            setErrorNumerico(true); setResultado(null); return;
          }
        }
        let itemLabels = null;
        if (conColumnaItem && columnaItem) {
          itemLabels = obtenerColumna(columnaItem).map(String);
        }
        resIndices = IndicesMath.calcularIndicesCompuestos(p0, q0, pt, qt, conPonderacion ? null : tipoIndiceSimple, itemLabels);
        if (resIndices) {
          resIndices.conPonderacion = conPonderacion;
          resIndices.tipoIndiceSimple = tipoIndiceSimple;
          resIndices.conColumnaItem = conColumnaItem;
          resIndices.columnaItem = columnaItem;
        }
      } else if (subTemaIndices === "empalme") {
        if (!selectedColumn || !selectedColumnY) return;
        const arrT = obtenerColumna(selectedColumn).map(String);
        const arrI = obtenerColumna(selectedColumnY).map(Number);
        if (arrI.some(isNaN) || arrI.length === 0) { setErrorNumerico(true); setResultado(null); return; }
        resIndices = IndicesMath.calcularOperacionesSerieIndices(arrT, arrI, Number(nuevoIndiceBase));
        if (resIndices) {
          resIndices.conColumnaItem = conColumnaItem;
          resIndices.columnaItem = columnaItem;
          if (conColumnaItem && columnaItem) {
            const itemLabels = obtenerColumna(columnaItem).map(String);
            resIndices.datos.forEach((d, idx) => {
              d.item = itemLabels[idx] || `Fila ${idx + 1}`;
            });
          }
        }
      } else if (subTemaIndices === "deflacion") {
        if (!selectedColumn || !selectedColumnY || !colPrecioBase) return;
        const arrT = obtenerColumna(selectedColumn).map(String);
        const arrNominal = obtenerColumna(selectedColumnY).map(Number);
        const arrIPC = obtenerColumna(colPrecioBase).map(Number);
        if (arrNominal.some(isNaN) || arrIPC.some(isNaN) || arrNominal.length === 0) { setErrorNumerico(true); setResultado(null); return; }
        resIndices = IndicesMath.calcularDeflacionSalarial(arrT, arrNominal, arrIPC);
        if (resIndices) {
          resIndices.conColumnaItem = conColumnaItem;
          resIndices.columnaItem = columnaItem;
          if (conColumnaItem && columnaItem) {
            const itemLabels = obtenerColumna(columnaItem).map(String);
            resIndices.datos.forEach((d, idx) => {
              d.item = itemLabels[idx] || `Fila ${idx + 1}`;
            });
          }
        }
      }

      if (!resIndices) { setErrorNumerico(true); setResultado(null); }
      else { setErrorNumerico(false); setResultado(resIndices); }
      return;
    }

    // === UNIDIMENSIONALES ===
    const datos = obtenerColumna(selectedColumn).map(Number).filter(v => !isNaN(v));

    if (datos.length === 0) {
      setErrorNumerico(true); setResultado(null); return;
    }
    setErrorNumerico(false);

    let res;
    const configData = { metodoK, kPersonalizado, tipoIntervalo };

    try {
      switch (calculo) {
        case "frecuencias_completas": res = UniMath.calcularFrecuencias(datos); break;
        case "distribucion_intervalos": res = UniMath.calcularDistribucionIntervalos(datos, configData); break;
        case "estadistica_descriptiva": res = UniMath.calcularDescriptivaTotal(datos); break;
        case "tendencia_central": {
          const tend = UniMath.calcularTendenciaCentral(datos, configData);
          if (Array.isArray(tend) && tend.length > 0) tend.pop();
          res = tend; break;
        }
        case "medidas_posicion": res = UniMath.calcularFractiles(datos, percentilK, configData); break;
        case "tendencia_y_posicion": {
          const tendenciaData = UniMath.calcularTendenciaCentral(datos, configData);
          const graficosData = Array.isArray(tendenciaData) ? tendenciaData.pop() : null;
          res = {
            tipo: "tendencia_y_posicion",
            tendencia: tendenciaData,
            posicion: UniMath.calcularFractiles(datos, percentilK, configData),
            datosPuros: [...datos].sort((a, b) => a - b),
            graficosTema3: graficosData,
          }; break;
        }
        case "variabilidad_y_forma": res = UniMath.calcularVariabilidadYForma(datos, configData); break;
        default: res = [];
      }
      setResultado(res);
    } catch (err) {
      console.error("🚨 Error ejecutando cálculo UniMath:", err);
      // Esto previene la pantalla negra si hay error de caché en la importación
      setErrorNumerico(true);
      setResultado(null);
    }
  };

  useEffect(() => {
    if (selectedColumn) {
      ejecutarCalculo();
    }
  }, [
    calculo, selectedColumn, selectedColumnY, tipoIntervalo, metodoK, kPersonalizado, percentilK,
    metodoSeries, periodosK, pesos, alfa,
    subTemaIndices, colPrecioBase, colCantidadBase, colPrecioActual, colCantidadActual, nuevoIndiceBase,
    excelData, conPonderacion, tipoIndiceSimple, conColumnaItem, columnaItem
  ]);

  return {
    excelData, columns, selectedColumn, setSelectedColumn, selectedColumnY, setSelectedColumnY,
    resultado, calculo, setCalculo, tipoIntervalo, setTipoIntervalo, metodoK, setMetodoK,
    kPersonalizado, setKPersonalizado, percentilK, setPercentilK, handleChangeDato, ejecutarCalculo, errorNumerico,
    metodoSeries, setMetodoSeries, periodosK, setPeriodosK, pesos, setPesos, alfa, setAlfa,
    subTemaIndices, setSubTemaIndices, colPrecioBase, setColPrecioBase, colCantidadBase, setColCantidadBase,
    colPrecioActual, setColPrecioActual, colCantidadActual, setColCantidadActual, nuevoIndiceBase, setNuevoIndiceBase,
    conPonderacion, setConPonderacion, tipoIndiceSimple, setTipoIndiceSimple,
    conColumnaItem, setConColumnaItem, columnaItem, setColumnaItem, handleActualizarColumna, handleCrearColumna
  };
}