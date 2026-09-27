const hostActual = window.location.hostname;
const BASE_URL = import.meta.env.VITE_API_URL || `http://${hostActual}:8000`;

export const mat251Api = {
  // Simulación de Estimación Puntual (Tema 5)
  ejecutarSimulacionPuntual: async (payload) => {
    const response = await fetch(`${BASE_URL}/mat251/tema5/simulacion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Error en la simulación.');
    }

    // Como devuelve [0.3, 0.4] en data.resultado.simulaciones, hay que mapearlo
    // para que el componente Resultados_EstimacionSimulacion funcione igual
    const r = data.resultado;
    const estimaciones = r.simulaciones;
    const suma = estimaciones.reduce((a, b) => a + b, 0);
    const promedio = suma / estimaciones.length;
    const varianza = estimaciones.reduce((acc, v) => acc + Math.pow(v - promedio, 2), 0) / (estimaciones.length - 1);
    const desviacion = Math.sqrt(varianza);
    const minVal = estimaciones.reduce((min, val) => val < min ? val : min, estimaciones[0]);
    const maxVal = estimaciones.reduce((max, val) => val > max ? val : max, estimaciones[0]);
    const sesgo = r.parametro_verdadero !== null ? promedio - r.parametro_verdadero : 0;
    const ecm = r.parametro_verdadero !== null
        ? estimaciones.reduce((acc, v) => acc + Math.pow(v - r.parametro_verdadero, 2), 0) / estimaciones.length
        : varianza;

    return {
        parametro: r.parametro,
        parametroVerdadero: r.parametro_verdadero,
        distribucion: r.distribucion,
        paramsDist: payload.paramsDist,
        simulaciones: estimaciones.map((est, i) => ({
            simulacion: i + 1,
            estimacion: est,
            muestra: null,
            diferencia: r.parametro_verdadero !== null ? est - r.parametro_verdadero : null
        })),
        resumen: { promedio, desviacion, min: minVal, max: maxVal, sesgo, ecm }
    };
  },

  // Simulación de Intervalos de Confianza (Tema 5)
  ejecutarSimulacionIntervalos: async (payload) => {
    const response = await fetch(`${BASE_URL}/mat251/tema5/simulacion-intervalos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Error en la simulación de intervalos.');
    }

    return data.resultado;
  },

  // ==========================================
  // Tema 2: Variables Aleatorias Continuas
  // ==========================================
  resolucionK: async (payload) => {
    const response = await fetch(`${BASE_URL}/api/mat251/resolucion_k`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  },

  resolucionContinua: async (payload) => {
    const response = await fetch(`${BASE_URL}/api/mat251/resolucion_continua`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await response.json();
  }
};
