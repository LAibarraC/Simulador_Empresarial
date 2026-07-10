// src/utils/estadisticaSeriesTiempo.js

/**
 * Función central para calcular Series Cronológicas
 * @param {Array} arrX - Arreglo de datos del tiempo (Eje X, ej: Meses, Años)
 * @param {Array} arrY - Arreglo de datos reales (Eje Y, ej: Ventas, Demanda)
 * @param {String} metodo - "movil_simple", "movil_ponderado", "suavizamiento_exponencial"
 * @param {Object} config - { k: número, pesos: string, alfa: número }
 */
export const calcularSeriesTiempo = (arrX, arrY, metodo = "movil_simple", config = {}) => {
  const n = arrY.length;
  if (n === 0) return null;

  // 1. Inicializamos la tabla de resultados
  let resultados = [];
  let sumaAbsError = 0; // Para el DAM (Desviación Absoluta Media)
  let sumaCuadError = 0; // Para el ECM (Error Cuadrático Medio)
  let countErrores = 0;

  for (let i = 0; i < n; i++) {
    resultados.push({
      t: i + 1,
      xLabel: arrX[i],   // La etiqueta de tiempo (Enero, 2024, etc.)
      yReal: arrY[i],    // El dato histórico
      yPronostico: null, // Se calculará según el método
      error: null        // Real - Pronóstico
    });
  }

  // 2. APLICAR MÉTODOS DE PRONÓSTICO
  
  if (metodo === "movil_simple") {
    // k = cantidad de periodos a promediar
    const k = parseInt(config.k) || 3; 

    for (let i = k; i < n; i++) {
      let sum = 0;
      // Sumar los k periodos ANTERIORES
      for (let j = 1; j <= k; j++) {
        sum += arrY[i - j];
      }
      
      const pronostico = sum / k;
      const error = arrY[i] - pronostico;
      
      resultados[i].yPronostico = pronostico;
      resultados[i].error = error;
      
      sumaAbsError += Math.abs(error);
      sumaCuadError += (error * error);
      countErrores++;
    }
    
  } else if (metodo === "movil_ponderado") {
    // Convertir el string "0.5, 0.3, 0.2" a un arreglo [0.5, 0.3, 0.2]
    const pesosStr = config.pesos || "0.5, 0.3, 0.2";
    const pesos = pesosStr.split(',').map(p => parseFloat(p.trim()));
    const k = pesos.length; // El número de pesos dicta los periodos

    for (let i = k; i < n; i++) {
      let pronostico = 0;
      // Asumimos que el primer peso (índice 0) va al dato más antiguo
      // y el último peso (índice k-1) va al dato más reciente.
      for (let j = 1; j <= k; j++) {
        pronostico += arrY[i - j] * pesos[k - j];
      }
      
      const error = arrY[i] - pronostico;
      resultados[i].yPronostico = pronostico;
      resultados[i].error = error;
      
      sumaAbsError += Math.abs(error);
      sumaCuadError += (error * error);
      countErrores++;
    }

  } else if (metodo === "suavizamiento_exponencial") {
    const alfa = parseFloat(config.alfa) || 0.2;
    
    // Regla: El pronóstico del periodo 1 es el valor real del periodo 1
    resultados[0].yPronostico = arrY[0];
    // No calculamos error para el primer periodo para no sesgar el DAM
    
    for (let i = 1; i < n; i++) {
      const pronostAnterior = resultados[i - 1].yPronostico;
      const realAnterior = arrY[i - 1];
      
      // Fórmula: F_t = F_{t-1} + Alfa * (Y_{t-1} - F_{t-1})
      const pronostico = pronostAnterior + alfa * (realAnterior - pronostAnterior);
      const error = arrY[i] - pronostico;
      
      resultados[i].yPronostico = pronostico;
      resultados[i].error = error;
      
      sumaAbsError += Math.abs(error);
      sumaCuadError += (error * error);
      countErrores++;
    }
  }

  // 3. INDICADORES GLOBALES DE ERROR
  const MAD = countErrores > 0 ? sumaAbsError / countErrores : 0;
  const MSE = countErrores > 0 ? sumaCuadError / countErrores : 0;

  return {
    tipo: "series_tiempo",
    metodo: metodo,
    datos: resultados,
    indicadores: {
      mad: MAD,
      mse: MSE
    }
  };
};