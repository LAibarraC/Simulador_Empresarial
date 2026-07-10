// src/utils/estadisticaIndices.js

/**
 * MÓDULO 1: ÍNDICES COMPUESTOS (Laspeyres, Paasche, Fisher, Edgeworth)
 * @param {Array} preciosBase - [P_0] Precios en el periodo base
 * @param {Array} cantidadesBase - [Q_0] Cantidades en el periodo base
 * @param {Array} preciosActuales - [P_t] Precios en el periodo actual
 * @param {Array} cantidadesActuales - [Q_t] Cantidades en el periodo actual
 * @returns {Object} Los 4 índices y sus sumatorias
 */
export const calcularIndicesCompuestos = (preciosBase, cantidadesBase, preciosActuales, cantidadesActuales, tipoIndiceSimple = null, itemLabels = null) => {
  const n = preciosBase.length;
  if (n === 0 || n !== cantidadesBase.length || n !== preciosActuales.length || n !== cantidadesActuales.length) {
    return null; // Error: Las columnas no tienen el mismo tamaño
  }

  let sum_Pt_Q0 = 0; // Numerador Laspeyres
  let sum_P0_Q0 = 0; // Denominador Laspeyres
  
  let sum_Pt_Qt = 0; // Numerador Paasche
  let sum_P0_Qt = 0; // Denominador Paasche

  let sumRelativos = 0;

  // Tabla de desarrollo paso a paso para mostrar al usuario
  const detallesCalculo = [];

  for (let i = 0; i < n; i++) {
    const P0 = preciosBase[i];
    const Q0 = cantidadesBase[i];
    const Pt = preciosActuales[i];
    const Qt = cantidadesActuales[i];

    const Pt_Q0 = Pt * Q0;
    const P0_Q0 = P0 * Q0;
    const Pt_Qt = Pt * Qt;
    const P0_Qt = P0 * Qt;

    sum_Pt_Q0 += Pt_Q0;
    sum_P0_Q0 += P0_Q0;
    sum_Pt_Qt += Pt_Qt;
    sum_P0_Qt += P0_Qt;

    // Cálculo del relativo individual según el tipo de índice simple
    let relativo = 0;
    if (tipoIndiceSimple === "cantidades") {
      relativo = Q0 === 0 ? 0 : (Qt / Q0) * 100;
    } else {
      relativo = P0 === 0 ? 0 : (Pt / P0) * 100;
    }
    sumRelativos += relativo;

    const itemLabel = (itemLabels && itemLabels[i] !== undefined && itemLabels[i] !== null) ? String(itemLabels[i]) : `Fila ${i + 1}`;

    detallesCalculo.push({
      item: itemLabel, P0, Q0, Pt, Qt, Pt_Q0, P0_Q0, Pt_Qt, P0_Qt, relativo
    });
  }

  // 1. Índice de Laspeyres (L)
  const L = sum_P0_Q0 === 0 ? 0 : (sum_Pt_Q0 / sum_P0_Q0) * 100;
  
  // 2. Índice de Paasche (P)
  const P = sum_P0_Qt === 0 ? 0 : (sum_Pt_Qt / sum_P0_Qt) * 100;
  
  // 3. Índice de Fisher (F) - Raíz cuadrada de L * P
  const F = Math.sqrt((L / 100) * (P / 100)) * 100;

  // 4. NUEVO: Índice de Marshall-Edgeworth (E)
  // Fórmula adaptada a las sumatorias precalculadas
  const E = (sum_P0_Q0 + sum_P0_Qt) === 0 ? 0 : ((sum_Pt_Q0 + sum_Pt_Qt) / (sum_P0_Q0 + sum_P0_Qt)) * 100;

  const promedioRelativos = n === 0 ? 0 : sumRelativos / n;

  return {
    tipo: "indices_compuestos",
    detalles: detallesCalculo,
    sumatorias: { sum_Pt_Q0, sum_P0_Q0, sum_Pt_Qt, sum_P0_Qt },
    resultados: {
      laspeyres: L,
      paasche: P,
      fisher: F,
      edgeworth: E,
      promedioRelativos
    }
  };
};

/**
 * MÓDULO 2: EMPALME Y CAMBIO DE BASE EN SERIES DE ÍNDICES
 * @param {Array} arrT - Etiquetas de tiempo (Años/Meses)
 * @param {Array} arrI - Serie de índices originales
 * @param {Number} nuevoIndiceBase - El valor del índice en el año que se eligió como nueva base
 * @returns {Array} Nueva tabla con Cambio de Base y Eslabones
 */
export const calcularOperacionesSerieIndices = (arrT, arrI, nuevoIndiceBase) => {
  const n = arrI.length;
  if (n === 0 || arrT.length !== n || nuevoIndiceBase <= 0) return null;

  const resultados = [];

  for (let i = 0; i < n; i++) {
    const indiceOriginal = arrI[i];
    
    // 1. Cambio de Base (Nuevo Índice = Original / Índice_AñoBaseNuevo * 100)
    const nuevoIndice = (indiceOriginal / nuevoIndiceBase) * 100;
    
    // 2. Índice de Cadena (Eslabón) = (Índice_Actual / Índice_Anterior) * 100
    let eslabon = null; // El primer año no tiene eslabón anterior
    if (i > 0) {
      const indiceAnterior = arrI[i - 1];
      eslabon = indiceAnterior === 0 ? 0 : (indiceOriginal / indiceAnterior) * 100;
    }

    resultados.push({
      t: arrT[i],
      indice_original: indiceOriginal,
      nuevo_indice: nuevoIndice,
      eslabon: eslabon
    });
  }

  return {
    tipo: "operaciones_indices",
    datos: resultados
  };
};

/**
 * MÓDULO 3: DEFLACIÓN DE VALORES Y PODER ADQUISITIVO
 * @param {Array} arrT - Etiquetas de tiempo
 * @param {Array} arrNominal - Valores monetarios nominales (Sueldos, Ventas)
 * @param {Array} arrIPC - Índice de Precios al Consumidor (Inflación acumulada)
 * @returns {Array} Tabla con Valores Reales y Tasas de Inflación
 */
export const calcularDeflacionSalarial = (arrT, arrNominal, arrIPC) => {
  const n = arrNominal.length;
  if (n === 0 || arrT.length !== n || arrIPC.length !== n) return null;

  const resultados = [];

  for (let i = 0; i < n; i++) {
    const nominal = arrNominal[i];
    const ipc = arrIPC[i];

    // 1. Deflactar el Valor (Sueldo Real) = Nominal / (IPC / 100)
    const valorReal = ipc === 0 ? 0 : nominal / (ipc / 100);
    
    // 2. Poder Adquisitivo del Dinero = 100 / IPC
    const poderAdquisitivo = ipc === 0 ? 0 : 100 / ipc;

    // 3. Tasa de Inflación Mensual/Anual = ((IPC_t / IPC_t-1) - 1) * 100
    let tasaInflacion = null;
    if (i > 0) {
      const ipcAnterior = arrIPC[i - 1];
      tasaInflacion = ipcAnterior === 0 ? 0 : ((ipc / ipcAnterior) - 1) * 100;
    }

    resultados.push({
      t: arrT[i],
      nominal: nominal,
      ipc: ipc,
      real: valorReal,
      poder_adquisitivo: poderAdquisitivo,
      inflacion: tasaInflacion
    });
  }

  return {
    tipo: "deflacion_financiera",
    datos: resultados
  };
};