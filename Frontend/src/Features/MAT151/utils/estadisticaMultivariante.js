// src/utils/estadisticaMultivariante.js

/**
 * Tabla de Doble Entrada Inteligente (Maneja Texto, Números y Mixtos)
 * Analiza las variables de forma independiente para aplicar Sturges donde corresponda.
 */
export const calcularDistribucionBivariada = (dataX, dataY) => {
  const n = dataX.length;
  if (n === 0 || n !== dataY.length) return null;

  // 1. Escáner individual: ¿Son números continuos o texto categórico?
  const esNumericoX = dataX.every(v => typeof v === 'number' && !isNaN(v));
  const esNumericoY = dataY.every(v => typeof v === 'number' && !isNaN(v));
  const ambosNumericos = esNumericoX && esNumericoY;

  // Función auxiliar interna para generar etiquetas e intervalos si es necesario
  const procesarDimension = (datos, esNumerico) => {
    if (esNumerico && n > 1) {
      const k = Math.round(1 + 3.322 * Math.log10(n)); // Regla de Sturges
      const min = Math.min(...datos);
      const max = Math.max(...datos);
      const amp = (max - min) / k || 1;
      
      const limites = [];
      const labels = [];
      
      for (let i = 0; i < k; i++) {
        const lInf = min + i * amp;
        const lSup = i === k - 1 ? max : min + (i + 1) * amp;
        const label = `[${lInf.toFixed(2)} - ${lSup.toFixed(2)}${i === k - 1 ? ']' : ')'}`;
        labels.push(label);
        limites.push({ min: lInf, max: lSup, label, isLast: i === k - 1 });
      }
      return { labels, limites, esIntervalo: true };
    } else {
      // Modo Texto / Categórico: Valores exactos únicos
      const labels = [...new Set(datos)].sort();
      return { labels, limites: null, esIntervalo: false };
    }
  };

  // Procesamos X e Y de forma independiente
  const configX = procesarDimension(dataX, esNumericoX);
  const configY = procesarDimension(dataY, esNumericoY);

  const categoriasX = configX.labels;
  const categoriasY = configY.labels;

  // 2. CONSTRUCCIÓN DE LA TABLA (Matriz de frecuencias)
  const matriz = {};
  const totalFilas = {};
  const totalColumnas = {};

  // Inicializar con ceros
  categoriasX.forEach(catX => {
    matriz[catX] = {};
    totalFilas[catX] = 0;
    categoriasY.forEach(catY => {
      matriz[catX][catY] = 0;
      totalColumnas[catY] = 0;
    });
  });
  categoriasY.forEach(catY => totalColumnas[catY] = 0);

  // Llenar la matriz
  for (let i = 0; i < n; i++) {
    const valX = dataX[i];
    const valY = dataY[i];

    // Encontrar la etiqueta correcta para X
    let labelX = valX;
    if (configX.esIntervalo) {
      const bin = configX.limites.find(b => b.isLast ? (valX >= b.min && valX <= b.max) : (valX >= b.min && valX < b.max));
      labelX = bin ? bin.label : configX.limites[configX.limites.length - 1].label;
    }

    // Encontrar la etiqueta correcta para Y
    let labelY = valY;
    if (configY.esIntervalo) {
      const bin = configY.limites.find(b => b.isLast ? (valY >= b.min && valY <= b.max) : (valY >= b.min && valY < b.max));
      labelY = bin ? bin.label : configY.limites[configY.limites.length - 1].label;
    }

    if (matriz[labelX] && matriz[labelX][labelY] !== undefined) {
      matriz[labelX][labelY]++;
      totalFilas[labelX]++;
      totalColumnas[labelY]++;
    }
  }

  // 3. CÁLCULO DE COVARIANZA Y CORRELACIÓN (Solo si AMBOS son numéricos)
  let covarianza = null;
  let correlacion = null;
  let interpretacion = "No aplicable (Contiene variables cualitativas)";
  let detalles = null;

  if (ambosNumericos && n > 1) {
    const sumX = dataX.reduce((a, b) => a + b, 0);
    const sumY = dataY.reduce((a, b) => a + b, 0);
    const meanX = sumX / n;
    const meanY = sumY / n;

    let sumCross = 0, sumSqX = 0, sumSqY = 0;
    const filasDetalle = [];
    for (let i = 0; i < n; i++) {
      const x = dataX[i];
      const y = dataY[i];
      const dx = x - meanX;
      const dy = y - meanY;
      const dx2 = dx * dx;
      const dy2 = dy * dy;
      const dxdy = dx * dy;
      sumCross += dxdy;
      sumSqX += dx2;
      sumSqY += dy2;
      filasDetalle.push({ x, y, dx, dy, dx2, dy2, dxdy });
    }

    covarianza = sumCross / (n - 1);
    const stdX = Math.sqrt(sumSqX / (n - 1));
    const stdY = Math.sqrt(sumSqY / (n - 1));

    if (stdX > 0 && stdY > 0) {
      correlacion = covarianza / (stdX * stdY);
      const absR = Math.abs(correlacion);
      if (absR >= 0.9) interpretacion = correlacion > 0 ? "Correlación Positiva Muy Fuerte" : "Correlación Negativa Muy Fuerte";
      else if (absR >= 0.7) interpretacion = correlacion > 0 ? "Correlación Positiva Fuerte" : "Correlación Negativa Fuerte";
      else if (absR >= 0.4) interpretacion = correlacion > 0 ? "Correlación Positiva Moderada" : "Correlación Negativa Moderada";
      else if (absR >= 0.2) interpretacion = correlacion > 0 ? "Correlación Positiva Débil" : "Correlación Negativa Débil";
      else interpretacion = "Correlación Nula o Inexistente";
    } else {
      correlacion = 0;
      interpretacion = "Sin variación en los datos";
    }

    detalles = {
      sumX,
      sumY,
      meanX,
      meanY,
      sumSqX,
      sumSqY,
      sumCross,
      stdX,
      stdY,
      filas: filasDetalle
    };
  }

  return {
    tipo: "distribucion_bivariada", // Nombre único para tu frontend
    filas: categoriasX,
    columnas: categoriasY,
    datos: matriz,
    totalFilas,
    totalColumnas,
    granTotal: n,
    ambosNumericos, // Útil por si quieres ocultar los paneles de Correlación en la UI
    covarianza,
    correlacion,
    interpretacion,
    detalles,
    // 🆕 Versión plana para Excel
    matrizPura: [
      // Fila de encabezados (X \ Y)
      { "Variable X \\ Y": "", ...categoriasY.reduce((acc, col) => ({ ...acc, [col]: col }), {}), "Totales": "TOTAL X" },
      ...categoriasX.map(f => ({
        "Variable X \\ Y": f,
        ...categoriasY.reduce((acc, c) => ({ ...acc, [c]: matriz[f][c] }), {}),
        "Totales": totalFilas[f]
      })),
      {
        "Variable X \\ Y": "TOTAL Y",
        ...categoriasY.reduce((acc, c) => ({ ...acc, [c]: totalColumnas[c] }), {}),
        "Totales": n
      }
    ]
  };
};