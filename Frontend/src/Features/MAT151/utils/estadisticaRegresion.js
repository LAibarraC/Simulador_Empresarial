// src/utils/estadisticaRegresion.js

/**
 * Función auxiliar: Resuelve sistemas de ecuaciones lineales mediante Gauss-Jordan.
 * Necesario para los modelos Cuadrático (Matriz 3x3) y Cúbico (Matriz 4x4).
 */
const resolverSistemaEcuaciones = (matrizA, vectorB) => {
  const n = matrizA.length;
  // Copia profunda para no mutar los originales
  let A = matrizA.map(row => [...row]);
  let B = [...vectorB];

  for (let i = 0; i < n; i++) {
    // 1. Pivoteo: Encontrar el número mayor en la columna para evitar divisiones por cero
    let maxEl = Math.abs(A[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > maxEl) {
        maxEl = Math.abs(A[k][i]);
        maxRow = k;
      }
    }

    // Intercambiar la fila actual con la del pivote mayor
    for (let k = i; k < n; k++) {
      let tmp = A[maxRow][k];
      A[maxRow][k] = A[i][k];
      A[i][k] = tmp;
    }
    let tmpB = B[maxRow];
    B[maxRow] = B[i];
    B[i] = tmpB;

    // 2. Hacer que el pivote principal sea 1
    let pivote = A[i][i];
    if (pivote === 0) return null; // Matriz Singular (No tiene solución única)
    for (let k = i; k < n; k++) A[i][k] /= pivote;
    B[i] /= pivote;

    // 3. Hacer 0 el resto de la columna
    for (let k = 0; k < n; k++) {
      if (i !== k) {
        let c = A[k][i];
        for (let j = i; j < n; j++) A[k][j] -= c * A[i][j];
        B[k] -= c * B[i];
      }
    }
  }
  return B; // Devuelve los coeficientes [a, b, c, ...]
};

/**
 * Función principal para exportar a la interfaz
 */
export const calcularRegresionSimple = (arrX, arrY, tipo = "lineal") => {
  let datosValidos = [];
  for (let i = 0; i < arrX.length; i++) {
    const x = arrX[i]; const y = arrY[i];
    let esValido = typeof x === 'number' && !isNaN(x) && typeof y === 'number' && !isNaN(y);
    
    // Validaciones matemáticas restrictivas
    if (tipo === "logaritmica" || tipo === "potencial") { if (x <= 0) esValido = false; }
    if (tipo === "exponencial" || tipo === "potencial") { if (y <= 0) esValido = false; }
    if (tipo === "reciproco") { if (x === 0) esValido = false; }
    
    if (esValido) datosValidos.push({ xOriginal: x, yOriginal: y });
  }

  const n = datosValidos.length;
  // Parámetros a calcular (2 para lineal, 3 para cuadratica, 4 para cubica)
  const gradosLibertad = tipo === "cuadratica" ? 3 : (tipo === "cubica" ? 4 : 2);
  if (n < gradosLibertad) return null; // Necesitamos suficientes puntos

  // Sumatorias Base
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  // Sumatorias Polinomiales
  let sumX3 = 0, sumX4 = 0, sumX5 = 0, sumX6 = 0, sumX2Y = 0, sumX3Y = 0;
  
  let filasCalculo = []; // 🛡️ GUARDAMOS LA TABLA DE CÁLCULOS

  datosValidos.forEach(pto => {
    let xCalc = pto.xOriginal; let yCalc = pto.yOriginal;
    
    // Transformaciones para modelos Intrínsecamente Lineales
    if (tipo === "logaritmica") xCalc = Math.log(pto.xOriginal);
    if (tipo === "exponencial") yCalc = Math.log(pto.yOriginal);
    if (tipo === "potencial") { xCalc = Math.log(pto.xOriginal); yCalc = Math.log(pto.yOriginal); }
    if (tipo === "reciproco") { xCalc = 1 / pto.xOriginal; }

    const x2 = xCalc * xCalc;
    const y2 = yCalc * yCalc;
    const xy = xCalc * yCalc;

    sumX += xCalc; sumY += yCalc; sumXY += xy; sumX2 += x2; sumY2 += y2;

    // Variables extras solo si es polinomial (para ahorrar memoria)
    let x3 = 0, x4 = 0, x5 = 0, x6 = 0, x2y = 0, x3y = 0;
    if (tipo === "cuadratica" || tipo === "cubica") {
      x3 = x2 * xCalc;
      x4 = x3 * xCalc;
      x2y = x2 * yCalc;
      sumX3 += x3; sumX4 += x4; sumX2Y += x2y;
      
      if (tipo === "cubica") {
        x5 = x4 * xCalc;
        x6 = x5 * xCalc;
        x3y = x3 * yCalc;
        sumX5 += x5; sumX6 += x6; sumX3Y += x3y;
      }
    }

    // Guardamos la fila completísima para la tabla del usuario
    filasCalculo.push({
      xOrig: pto.xOriginal, yOrig: pto.yOriginal,
      xTrans: xCalc, yTrans: yCalc,
      x2, y2, xy,
      x3, x4, x5, x6, x2y, x3y
    });
  });

  // ==========================================
  // CÁLCULO DE COEFICIENTES SEGÚN EL MODELO
  // ==========================================
  let a = 0, b = 0, c = 0, d = 0;

  if (tipo === "cuadratica") {
    // Matriz de 3x3
    const matrizM = [
      [n, sumX, sumX2],
      [sumX, sumX2, sumX3],
      [sumX2, sumX3, sumX4]
    ];
    const vectorR = [sumY, sumXY, sumX2Y];
    const resGauss = resolverSistemaEcuaciones(matrizM, vectorR);
    if (!resGauss) return null;
    [a, b, c] = resGauss;

  } else if (tipo === "cubica") {
    // Matriz de 4x4
    const matrizM = [
      [n, sumX, sumX2, sumX3],
      [sumX, sumX2, sumX3, sumX4],
      [sumX2, sumX3, sumX4, sumX5],
      [sumX3, sumX4, sumX5, sumX6]
    ];
    const vectorR = [sumY, sumXY, sumX2Y, sumX3Y];
    const resGauss = resolverSistemaEcuaciones(matrizM, vectorR);
    if (!resGauss) return null;
    [a, b, c, d] = resGauss;

  } else {
    // Los 5 modelos originales (Mínimos Cuadrados Directos)
    const denominador = (n * sumX2) - (sumX * sumX);
    if (denominador === 0) return null;
    
    b = ((n * sumXY) - (sumX * sumY)) / denominador;
    a = (sumY - (b * sumX)) / n;
  }

  // ==========================================
  // FORMATEO DE ECUACIONES
  // ==========================================
  let cadenaEcuacion = "";
  let ecuacionLatex = "";
  const sign = (num) => num >= 0 ? `+ ${num.toFixed(4)}` : `- ${Math.abs(num).toFixed(4)}`;
  const signLatex = (num) => num >= 0 ? `+ ${num.toFixed(4)}` : `- ${Math.abs(num).toFixed(4)}`;

  if (tipo === "lineal") {
    cadenaEcuacion = `Y = ${a.toFixed(4)} ${sign(b)}X`;
    ecuacionLatex = `Y = ${a.toFixed(4)} ${signLatex(b)} X`;
  }
  else if (tipo === "logaritmica") {
    cadenaEcuacion = `Y = ${a.toFixed(4)} ${sign(b)}ln(X)`;
    ecuacionLatex = `Y = ${a.toFixed(4)} ${signLatex(b)} \\ln(X)`;
  }
  else if (tipo === "exponencial") { 
    a = Math.exp(a); // Volvemos la 'a' a su estado real
    cadenaEcuacion = `Y = ${a.toFixed(4)} * e^(${b.toFixed(4)}X)`; 
    ecuacionLatex = `Y = ${a.toFixed(4)} \\cdot e^{${b.toFixed(4)} X}`;
  }
  else if (tipo === "potencial") { 
    a = Math.exp(a); 
    cadenaEcuacion = `Y = ${a.toFixed(4)} * X^(${b.toFixed(4)})`; 
    ecuacionLatex = `Y = ${a.toFixed(4)} \\cdot X^{${b.toFixed(4)}}`;
  }
  else if (tipo === "reciproco") { 
    cadenaEcuacion = `Y = ${a.toFixed(4)} ${sign(b)}(1/X)`; 
    ecuacionLatex = `Y = ${a.toFixed(4)} ${signLatex(b)} \\left(\\frac{1}{X}\\right)`;
  }
  else if (tipo === "cuadratica") { 
    cadenaEcuacion = `Y = ${a.toFixed(4)} ${sign(b)}X ${sign(c)}X²`; 
    ecuacionLatex = `Y = ${a.toFixed(4)} ${signLatex(b)} X ${signLatex(c)} X^2`;
  }
  else if (tipo === "cubica") { 
    cadenaEcuacion = `Y = ${a.toFixed(4)} ${sign(b)}X ${sign(c)}X² ${sign(d)}X³`; 
    ecuacionLatex = `Y = ${a.toFixed(4)} ${signLatex(b)} X ${signLatex(c)} X^2 ${signLatex(d)} X^3`;
  }

  // ==========================================
  // MOTOR PREDICTOR Y CÁLCULO DE ERRORES
  // ==========================================
  const predecirY = (xVal) => {
    if (tipo === "lineal") return a + (b * xVal);
    if (tipo === "logaritmica") return a + (b * Math.log(xVal));
    if (tipo === "exponencial") return a * Math.exp(b * xVal);
    if (tipo === "potencial") return a * Math.pow(xVal, b);
    if (tipo === "reciproco") return a + (b * (1 / xVal));
    if (tipo === "cuadratica") return a + (b * xVal) + (c * Math.pow(xVal, 2));
    if (tipo === "cubica") return a + (b * xVal) + (c * Math.pow(xVal, 2)) + (d * Math.pow(xVal, 3));
    return 0;
  };

  let sse = 0; let sst = 0;
  const mediaYOriginal = datosValidos.reduce((acc, curr) => acc + curr.yOriginal, 0) / n;
  
  datosValidos.forEach(pto => {
    const yPred = predecirY(pto.xOriginal);
    sse += Math.pow(pto.yOriginal - yPred, 2); 
    sst += Math.pow(pto.yOriginal - mediaYOriginal, 2);
  });

  const r2 = sst !== 0 ? 1 - (sse / sst) : 0;
  const errorEstandar = n > gradosLibertad ? Math.sqrt(sse / (n - gradosLibertad)) : 0;
  
  // Para correlación en polinomios complejos, tomamos la raíz de R^2 positiva
  const r = (tipo === "cuadratica" || tipo === "cubica") ? Math.sqrt(Math.max(0, r2)) : (b >= 0 ? 1 : -1) * Math.sqrt(Math.max(0, r2));

  // Ordenar para el dibujo del gráfico
  const datosOrdenados = [...datosValidos].sort((p1, p2) => p1.xOriginal - p2.xOriginal);
  const datosGrafico = datosOrdenados.map(pto => ({ x: pto.xOriginal, yReal: pto.yOriginal }));

  return {
    tipoModelo: tipo, n_validos: n, ecuacion: cadenaEcuacion, ecuacionLatex: ecuacionLatex,
    indicadores: { r2: r2, r: r, error_estandar: errorEstandar },
    datosGrafico: datosGrafico, funcionPredictora: predecirY,
    // 🛡️ EXPORTAMOS LAS TABLAS COMPLETAS PARA LA VISTA
    tablaCalculos: {
      filas: filasCalculo,
      sumas: { sumX, sumY, sumX2, sumY2, sumXY, sumX3, sumX4, sumX5, sumX6, sumX2Y, sumX3Y }
    }
  };
};