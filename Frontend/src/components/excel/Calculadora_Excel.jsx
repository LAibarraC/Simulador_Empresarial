import { useState, useEffect } from "react";

import { api } from "../../services/api";

export function useCalculadoraExcel(filename, sheet) {
  const [excelData, setExcelData] = useState([]);
  const [columns, setColumns] = useState([]);

  // AHORA NECESITAMOS DOS COLUMNAS
  const [selectedColumn, setSelectedColumn] = useState(""); // Variable X (Filas)
  const [selectedColumnY, setSelectedColumnY] = useState(""); // Variable Y (Columnas) - NUEVO

  const [calculo, setCalculo] = useState("frecuencia_absoluta");
  const [tipoIntervalo, setTipoIntervalo] = useState("semiabierto");
  const [metodoK, setMetodoK] = useState("sturges");
  const [kPersonalizado, setKPersonalizado] = useState("");

  const [resultado, setResultado] = useState(null);

  // --- Carga de datos ---
  useEffect(() => {
    if (!filename || sheet === "" || sheet === undefined) return;
    const hojaIndex = Number(sheet);
    const cargarDatos = async () => {
      try {
        const data = await api.obtenerDatosHoja(filename, hojaIndex);

        if (Array.isArray(data) && data.length > 0) {
          const headerRow = Object.values(data[0]);
          setColumns(headerRow);
          const realData = data.slice(1).map((row) =>
            Object.fromEntries(Object.keys(row).map((key, idx) => [headerRow[idx], row[key]]))
          );
          setExcelData(realData);
          if (headerRow.length > 0) {
            setSelectedColumn(headerRow[0]);
            // Por defecto, la columna Y es la segunda (si existe), o la misma
            setSelectedColumnY(headerRow.length > 1 ? headerRow[1] : headerRow[0]);
          }
        } else {
          setExcelData([]);
          setColumns([]);
        }
      } catch (err) {
        console.error("Error cargando excel:", err);
      }
    };
    cargarDatos();
  }, [filename, sheet]);

  const handleChangeDato = (index, colName, value) => {
    const newData = [...excelData];
    // Detectamos si es número o texto para no romper el tipo de dato
    const esNumero = !isNaN(Number(value)) && value !== "";
    newData[index][colName] = esNumero ? Number(value) : value;
    setExcelData(newData);
  };

  // Helper para obtener datos de una columna
  const obtenerColumna = (colName) => {
    return excelData.map((row) => row[colName]);
  };

  // --- CÁLCULO 3: Bivariante (Tabla de Doble Entrada) ---
  const calcularBivariada = () => {
    const dataX = obtenerColumna(selectedColumn);  // Filas (Ej: Moneda)
    const dataY = obtenerColumna(selectedColumnY); // Columnas (Ej: Tipo Fondo)
    const n = dataX.length;

    // 1. Identificar valores únicos (Categorías)
    const categoriasX = [...new Set(dataX)].sort();
    const categoriasY = [...new Set(dataY)].sort();

    // 2. Inicializar Matriz y Totales
    const matriz = {}; // { "BOB": { "Abierto": 13, "Cerrado": 17 } }
    const totalFilas = {};
    const totalColumnas = {};

    // Inicializamos en 0
    categoriasX.forEach(catX => {
      matriz[catX] = {};
      totalFilas[catX] = 0;
      categoriasY.forEach(catY => {
        matriz[catX][catY] = 0;
        totalColumnas[catY] = 0; // Inicializamos esto aquí también
      });
    });
    // Re-inicializamos columnas por seguridad para evitar NaN
    categoriasY.forEach(catY => totalColumnas[catY] = 0);

    // 3. Conteo (Tabulación Cruzada)
    for (let i = 0; i < n; i++) {
      const valX = dataX[i];
      const valY = dataY[i];

      if (matriz[valX] && matriz[valX][valY] !== undefined) {
        matriz[valX][valY]++;
        totalFilas[valX]++;
        totalColumnas[valY]++;
      }
    }

    // 4. Retornar estructura completa para la tabla
    return {
      tipo: "bivariada",
      filas: categoriasX,
      columnas: categoriasY,
      datos: matriz,
      totalFilas: totalFilas,
      totalColumnas: totalColumnas,
      granTotal: n
    };
  };

  // ... (TUS OTRAS FUNCIONES DE CÁLCULO SE MANTIENEN IGUAL: Frecuencias, Intervalos, etc.) ...
  // Copia aquí calcularFrecuencias y calcularDistribucionIntervalos tal cual las tenías antes.
  // Para ahorrar espacio en este mensaje, asumo que las mantienes igual.
  // ==========================================================================

  // --- COPIA AQUÍ TUS FUNCIONES ANTERIORES (calcularFrecuencias, calcularDistribucionIntervalos) ---

  const obtenerDatosNumericos = () => {
    return excelData
      .map((row) => row[selectedColumn])
      .filter((v) => typeof v === "number" && !isNaN(v));
  };

  const calcularFrecuencias = (datos) => { /* ... tu código anterior ... */
    const N = datos.length; const conteo = {}; datos.forEach((x) => (conteo[x] = (conteo[x] || 0) + 1)); const valoresOrdenados = Object.keys(conteo).map(Number).sort((a, b) => a - b); const tabla = valoresOrdenados.map((x) => ({ x_i: x, f_i: conteo[x] })); let F_i_acum = 0; let P_i_acum = 0; for (let i = 0; i < tabla.length; i++) { F_i_acum += tabla[i].f_i; tabla[i].F_i = F_i_acum; const p_i_val = (tabla[i].f_i / N) * 100; tabla[i].p_i = +p_i_val.toFixed(2); P_i_acum += p_i_val; tabla[i].P_i = +P_i_acum.toFixed(2); } for (let i = 0; i < tabla.length; i++) { const resto = tabla.slice(i); const F_inv = resto.reduce((acc, curr) => acc + curr.f_i, 0); tabla[i].F_i_inv = F_inv; const P_inv = resto.reduce((acc, curr) => acc + curr.p_i, 0); tabla[i].P_i_inv = +P_inv.toFixed(2); } return tabla.map(fila => ({ "x_i": fila.x_i, "f_i": fila.f_i, "F_i": fila.F_i, "F_i_inv": fila.F_i_inv, "p_i": fila.p_i, "P_i": fila.P_i, "P_i_inv": fila.P_i_inv }));
  };

  const calcularDistribucionIntervalos = (datos) => { /* ... tu código anterior del libro ... */
    if (datos.length === 0) return []; const n = datos.length; const min = Math.min(...datos); const max = Math.max(...datos); let k; switch (metodoK) { case "cuadratica": k = Math.sqrt(n); break; case "logaritmica": k = Math.log(n) / Math.log(2); break; case "personalizada": k = Number(kPersonalizado) || 1; break; default: k = 1 + 3.322 * Math.log10(n); } k = Math.round(k); if (k < 1) k = 1; const rango = max - min; const amplitud = Math.round((rango / k) + 1); const intervalos = []; let inicio = Math.floor(min); for (let i = 0; i < k; i++) { const fin = inicio + amplitud; intervalos.push({ desde: inicio, hasta: fin }); inicio = fin; } const frecuencias = intervalos.map(({ desde, hasta }, i) => { let f = 0; const esUltimo = i === intervalos.length - 1; datos.forEach((v) => { if (tipoIntervalo === "cerrado") { if (v >= desde && v <= hasta) f++; } else if (tipoIntervalo === "abierto") { if (v > desde && v < hasta) f++; } else { if (esUltimo) { if (v >= desde && v <= hasta) f++; } else { if (v >= desde && v < hasta) f++; } } }); return f; }); const total = frecuencias.reduce((a, b) => a + b, 0); const pi = frecuencias.map((f) => +(f / total * 100).toFixed(2)); const Fi = frecuencias.map((_, i) => frecuencias.slice(0, i + 1).reduce((a, b) => a + b, 0)); const Pi = pi.map((_, i) => +pi.slice(0, i + 1).reduce((a, b) => a + b, 0).toFixed(2)); const Fi_inv = frecuencias.map((_, i) => frecuencias.slice(i).reduce((a, b) => a + b, 0)); const Pi_inv = pi.map((_, i) => +pi.slice(i).reduce((a, b) => a + b, 0).toFixed(2)); return intervalos.map((intv, i) => { const etiquetaIntervalo = `${intv.desde} - ${intv.hasta}`; return { "Haber básico": etiquetaIntervalo, "f_i": frecuencias[i], "p_i": pi[i], "F_i": Fi[i], "P_i": Pi[i], "F'i": Fi_inv[i], "P'i": Pi_inv[i] }; });
  };

  // ==========================================================================

  const ejecutarCalculo = () => {
    let res;

    // Lógica especial para Bivariada (Usa 2 columnas y pueden ser texto)
    if (calculo === "distribucion_bivariada") {
      res = calcularBivariada();
      setResultado(res);
      return;
    }

    // Lógica normal para univariada (requiere números)
    const datos = obtenerDatosNumericos();
    if (datos.length === 0 && calculo !== "frecuencia_absoluta") {
      // Permitimos frecuencia absoluta con texto, el resto requiere números
      // Ajuste rápido para evitar error en conteos simples
    }

    switch (calculo) {
      case "frecuencia_absoluta": {
        // Versión simple univariada
        const colData = obtenerColumna(selectedColumn);
        res = {};
        colData.forEach((val) => (res[val] = (res[val] || 0) + 1));
        res = Object.entries(res).map(([k, v]) => ({ Valor: k, Frecuencia: v }));
        break;
      }
      case "frecuencia_relativa": {
        const colDataRel = obtenerDatosNumericos();
        res = [];
        const total = colDataRel.length;
        const conteo = {};
        colDataRel.forEach((val) => (conteo[val] = (conteo[val] || 0) + 1));
        res = Object.entries(conteo).map(([k, v]) => ({ Valor: k, Relativa: (v / total).toFixed(4) }));
        break;
      }
      case "minimo": res = [{ Resultado: "Mínimo", Valor: Math.min(...datos) }]; break;
      case "maximo": res = [{ Resultado: "Máximo", Valor: Math.max(...datos) }]; break;
      case "frecuencias_completas": res = calcularFrecuencias(datos); break;
      case "distribucion_intervalos": res = calcularDistribucionIntervalos(datos); break;
      default: res = [];
    }
    setResultado(res);
  };

  return {
    excelData, columns,
    selectedColumn, setSelectedColumn, // Columna X
    selectedColumnY, setSelectedColumnY, // Columna Y (NUEVO)
    resultado, calculo,
    tipoIntervalo, metodoK, kPersonalizado,
    setCalculo, setTipoIntervalo, setMetodoK, setKPersonalizado,
    handleChangeDato, ejecutarCalculo
  };
}