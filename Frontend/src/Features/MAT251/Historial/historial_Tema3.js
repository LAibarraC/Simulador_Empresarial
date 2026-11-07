// Historial del Tema 3: Distribuciones discretas y continuas.
import {
  calcularDistribucionModelo, generarDatosGrafico, calcularDistribucionContinua,
  generarDatosGraficoContinua,
} from '../Matematicas/logica_Tema3';
import {
  leerDatosMatrizHistorial, obtenerArchivoRealHistorialMAT251,
} from './historialMAT251';

// Distribuciones Discretas
export const MODELOS_DISCRETOS = ['Bernoulli', 'Binomial', 'Poisson', 'Hipergeometrica'];
export const esOperacionModelosDiscretos = operacion => ['distribuciones_discretas', 'discretas', 'modelos_discretos'].includes(String(operacion || '').toLowerCase());
const camposModelo = modelo => ({ Bernoulli: ['p'], Binomial: ['n', 'p'], Poisson: ['lambda'], Hipergeometrica: ['N', 'K', 'n'] })[modelo] || [];
const numero = valor => String(valor ?? '').trim() === '' ? '' : Number(String(valor).replace(',', '.'));
const entero = valor => Number.isSafeInteger(valor) && valor >= 0;
export const crearEstadoModelosDiscretos = () => Object.fromEntries(MODELOS_DISCRETOS.map(modelo => [modelo, {
  modo: 'matriz', manual: Object.fromEntries(camposModelo(modelo).map(campo => [campo, ''])),
  matriz: { col: 0, valorExito: '', modoEstimacion: 'especifico', nArriba: '', muestraN: '', stats: null, n: '', p: '', N: '', K: '', lambda: '' },
  condicion: { tipo: 'exacta', x: '', b: '' }, yaCalculado: false,
}]));
export const columnasModelosDiscretos = (variable, filas = []) => variable?.nombresColumnas?.length
  ? variable.nombresColumnas : variable ? [variable.nombre || 'Datos']
    : filas.some(fila => String(fila.valor ?? '').trim()) ? ['Valores'] : [];
export const valoresColumnaModelo = (filas, columna) => (filas || []).map(fila => String(fila.valor ?? '').split(' | ')[columna]?.trim() || '').filter(Boolean);

export const crearRecetaModelosDiscretos = (datos, evaluarCondicion = !!datos.datosTema3?.condicion) => {
  const modelo = datos.modeloTema3Discreto || 'Bernoulli';
  const estado = datos.estadoModelosDiscretos?.[modelo] || crearEstadoModelosDiscretos()[modelo] || crearEstadoModelosDiscretos().Bernoulli;
  const columnas = columnasModelosDiscretos(datos.varSeleccionada, datos.filas);
  const columna = columnas.length === 1 ? 0 : estado.matriz.col;
  const valores = valoresColumnaModelo(datos.filas, columna);
  const lote = modelo === 'Binomial' && estado.matriz.modoEstimacion === 'lote'
    && valores.length > 0 && valores.every(valor => Number.isFinite(numero(valor)));
  return {
    modulo: 'MAT251', operacion: datos.operacion, modelo, modo: estado.modo,
    ...(estado.modo === 'manual' ? {
      parametros: Object.fromEntries(camposModelo(modelo).map(campo => [campo, numero(estado.manual[campo])])),
    } : {
      estimacion: {
        columna,
        ...(modelo === 'Binomial' ? { modo: lote ? 'lote' : 'especifico', n: numero(estado.matriz.nArriba) } : {}),
        ...(['Bernoulli', 'Hipergeometrica'].includes(modelo) || (modelo === 'Binomial' && !lote)
          ? { valorExito: String(estado.matriz.valorExito ?? '') } : {}),
        ...(modelo === 'Hipergeometrica' ? { n: numero(estado.matriz.muestraN) } : {}),
      },
    }),
    condicion: evaluarCondicion ? {
      tipo: estado.condicion.tipo, valorX: numero(estado.condicion.x),
      ...(estado.condicion.tipo.includes('intervalo') ? { valorB: numero(estado.condicion.b) } : {}),
    } : null,
    filas: estado.modo === 'matriz' ? datos.filas || [] : [],
    varSeleccionada: estado.modo === 'matriz' ? datos.varSeleccionada || null : null,
    nombreEncabezadoManual: estado.modo === 'matriz' ? datos.nombreEncabezadoManual || '' : '',
    archivo: estado.modo === 'matriz' ? obtenerArchivoRealHistorialMAT251({}, datos.selectedFile) : null,
    hoja: estado.modo === 'matriz' ? datos.selectedSheet ?? 0 : null,
  };
};
export const leerRecetaModelosDiscretos = (snapshot = {}) => {
  const legado = snapshot.tema3?.discretos || {};
  const datos = leerDatosMatrizHistorial(snapshot);
  const modelo = snapshot.modelo || legado.modelo || 'Bernoulli';
  const modo = snapshot.modo || legado.modo || 'manual';
  const parametros = snapshot.parametros || legado.params || {};
  const contexto = legado.contextoMatriz || {};
  const columnas = columnasModelosDiscretos(datos.varSeleccionada, datos.filas);
  const indice = columnas.indexOf(contexto.columna);
  const seleccion = snapshot.estimacion || {
    columna: columnas.length === 1 ? 0 : indice >= 0 ? indice : '',
    valorExito: contexto.valorExito ?? '', modo: contexto.modoEstimacion || 'especifico', n: numero(parametros.n),
  };
  const condicion = snapshot.condicion?.tipo ? snapshot.condicion : legado.condicion || null;
  return {
    ...snapshot, ...datos, modelo, modo,
    parametros: Object.fromEntries(camposModelo(modelo).map(campo => [campo, numero(parametros[campo])])),
    estimacion: {
      columna: columnas.length === 1 ? 0 : seleccion.columna,
      ...(modelo === 'Binomial' ? { modo: seleccion.modo || 'especifico', n: numero(seleccion.n) } : {}),
      ...(['Bernoulli', 'Hipergeometrica'].includes(modelo) || (modelo === 'Binomial' && seleccion.modo !== 'lote')
        ? { valorExito: String(seleccion.valorExito ?? '') } : {}),
      ...(modelo === 'Hipergeometrica' ? { n: numero(seleccion.n) } : {}),
    },
    condicion: condicion ? { tipo: condicion.tipo, valorX: numero(condicion.valorX),
      ...(condicion.tipo.includes('intervalo') ? { valorB: numero(condicion.valorB) } : {}) } : null,
    nombreEncabezadoManual: snapshot.nombreEncabezadoManual || '',
  };
};
export const firmaRecetaModelosDiscretos = receta => JSON.stringify({
  modelo: receta.modelo, modo: receta.modo,
  ...(receta.modo === 'manual' ? { parametros: receta.parametros } : {
    estimacion: receta.estimacion,
    nombre: receta.varSeleccionada?.nombre || '', encabezado: receta.nombreEncabezadoManual || '',
    columnas: columnasModelosDiscretos(receta.varSeleccionada, receta.filas),
    filas: (receta.filas || []).map(fila => String(fila.valor ?? '').trim()).filter(Boolean),
  }),
  condicion: receta.condicion || null,
});
const parametrosValidos = (modelo, p) => {
  if (modelo === 'Bernoulli') return Number.isFinite(p.p) && p.p >= 0 && p.p <= 1;
  if (modelo === 'Binomial') return entero(p.n) && Number.isFinite(p.p) && p.p >= 0 && p.p <= 1;
  if (modelo === 'Poisson') return Number.isFinite(p.lambda) && p.lambda >= 0;
  if (modelo === 'Hipergeometrica') return entero(p.N) && p.N >= 1 && entero(p.K) && entero(p.n) && p.K <= p.N && p.n <= p.N;
  return false;
};
export const estimarRecetaModelosDiscretos = receta => {
  const e = receta.estimacion || {};
  const columnas = columnasModelosDiscretos(receta.varSeleccionada, receta.filas);
  if (!Number.isInteger(e.columna) || e.columna < 0 || e.columna >= columnas.length) return { error: 'Selecciona una columna válida.' };
  const valores = valoresColumnaModelo(receta.filas, e.columna);
  if (!valores.length) return { error: 'No hay datos válidos en la columna.' };
  const total = valores.length;
  let params;
  let stats;
  if (receta.modelo === 'Poisson' || (receta.modelo === 'Binomial' && e.modo === 'lote')) {
    const numeros = valores.map(numero);
    if (!numeros.every(entero)) return { error: 'Los conteos de la columna deben ser enteros no negativos.' };
    const suma = numeros.reduce((acumulado, valor) => acumulado + valor, 0);
    if (!Number.isSafeInteger(suma)) return { error: 'Los conteos exceden el rango admitido.' };
    if (receta.modelo === 'Poisson') {
      params = { lambda: suma / total };
      stats = { total, suma, media: params.lambda };
    } else {
      if (!entero(e.n) || e.n < 1 || numeros.some(valor => valor > e.n) || !Number.isSafeInteger(total * e.n)) {
        return { error: 'El tamaño del ensayo debe ser un entero positivo y no puede ser menor que los conteos.' };
      }
      params = { n: e.n, p: suma / (total * e.n) };
      stats = { total: total * e.n, exitos: suma, p: params.p };
    }
  } else {
    if (String(e.valorExito ?? '').trim() === '') return { error: 'Selecciona el valor que representa el éxito.' };
    const exitos = valores.filter(valor => receta.modelo === 'Binomial'
      && Number.isFinite(numero(valor)) && Number.isFinite(numero(e.valorExito))
      ? numero(valor) === numero(e.valorExito) : valor === String(e.valorExito)).length;
    const p = exitos / total;
    stats = { total, exitos, p, K: exitos };
    if (receta.modelo === 'Bernoulli') params = { p };
    else if (receta.modelo === 'Binomial') {
      if (!entero(e.n) || e.n < 1) return { error: 'El tamaño del ensayo debe ser un entero positivo.' };
      params = { n: e.n, p };
    } else if (receta.modelo === 'Hipergeometrica') {
      if (!entero(e.n) || e.n < 1 || e.n > total) return { error: 'La muestra debe ser un entero positivo menor o igual que la población.' };
      params = { N: total, K: exitos, n: e.n };
    }
  }
  return parametrosValidos(receta.modelo, params || {}) ? { params, stats, valores, columnas } : { error: 'Parámetros de distribución inválidos.' };
};
export const calcularRecetaModelosDiscretos = receta => {
  if (!MODELOS_DISCRETOS.includes(receta.modelo) || !['manual', 'matriz'].includes(receta.modo)) return { error: 'Modelo o modo de distribución inválido.' };
  const estimacion = receta.modo === 'matriz' ? estimarRecetaModelosDiscretos(receta) : null;
  if (estimacion?.error) return estimacion;
  const params = estimacion?.params || receta.parametros;
  if (!parametrosValidos(receta.modelo, params || {})) return { error: 'Completa los parámetros con números válidos; los tamaños deben ser enteros y las probabilidades estar entre 0 y 1.' };
  const condicion = receta.condicion;
  let consulta = condicion;
  if (condicion) {
    if (!['exacta', 'menor_igual', 'mayor_igual', 'intervalo', 'menor_estricto', 'mayor_estricto', 'intervalo_estricto'].includes(condicion.tipo)
        || !Number.isSafeInteger(condicion.valorX)
        || (condicion.tipo.includes('intervalo') && (!Number.isSafeInteger(condicion.valorB) || condicion.valorB < condicion.valorX))) {
      return { error: 'Completa la condición con límites enteros válidos.' };
    }
    consulta = { ...condicion };
    if (condicion.tipo === 'menor_estricto') consulta = { tipo: 'menor_igual', valorX: condicion.valorX - 1 };
    if (condicion.tipo === 'mayor_estricto') consulta = { tipo: 'mayor_igual', valorX: condicion.valorX + 1 };
    if (condicion.tipo === 'intervalo_estricto') consulta = { tipo: 'intervalo', valorX: condicion.valorX + 1, valorB: condicion.valorB - 1 };
  }
  const datosGrafico = generarDatosGrafico(receta.modelo, params);
  if (!datosGrafico.length) return { error: 'El rango es demasiado amplio para generar la gráfica. Reduce los parámetros.' };
  const resultados = calcularDistribucionModelo(receta.modelo, params, consulta);
  if (![resultados.esperanza, resultados.varianza, resultados.desviacion].every(Number.isFinite)
      || (condicion && !Number.isFinite(resultados.probabilidadFinal)) || !datosGrafico.length
      || datosGrafico.some(dato => !Number.isFinite(dato.p))) return { error: 'El rango de la distribución excede lo admitido para calcular y mostrar la gráfica. Reduce los parámetros.' };
  return { estimacion, resultado: {
    modelo: receta.modelo, modo: receta.modo, params, condicion, resultados, datosGrafico,
    contextoMatriz: estimacion ? {
      nombreVariable: receta.varSeleccionada?.nombre, columna: estimacion.columnas[receta.estimacion.columna],
      cantidadColumnas: estimacion.columnas.length, valorExito: receta.estimacion.valorExito || '',
      modoEstimacion: receta.estimacion.modo || null, observaciones: estimacion.valores, estadisticas: estimacion.stats,
    } : null,
    _entradaModeloDiscreto: firmaRecetaModelosDiscretos(receta),
  } };
};
export const estadoRestauradoModelosDiscretos = (receta, calculo) => {
  const estados = crearEstadoModelosDiscretos();
  if (!estados[receta.modelo]) return estados;
  const actual = estados[receta.modelo];
  actual.modo = receta.modo;
  actual.manual = { ...actual.manual, ...receta.parametros };
  actual.matriz = { ...actual.matriz, col: receta.estimacion?.columna ?? 0,
    valorExito: receta.estimacion?.valorExito ?? '', modoEstimacion: receta.estimacion?.modo || 'especifico',
    nArriba: receta.modelo === 'Binomial' ? receta.estimacion?.n ?? '' : '',
    muestraN: receta.modelo === 'Hipergeometrica' ? receta.estimacion?.n ?? '' : '',
    ...(calculo.estimacion?.params || {}), stats: calculo.estimacion?.stats || null };
  actual.condicion = receta.condicion ? { tipo: receta.condicion.tipo, x: receta.condicion.valorX, b: receta.condicion.valorB ?? '' } : actual.condicion;
  actual.yaCalculado = !!calculo.resultado;
  return estados;
};
export const validarModelosDiscretosGuardable = datos => !!datos.datosTema3
  && datos.datosTema3._entradaModeloDiscreto === firmaRecetaModelosDiscretos(crearRecetaModelosDiscretos(datos));
export const puedeActualizarHistorialModelosDiscretos = (datos, snapshot) => {
  const actual = crearRecetaModelosDiscretos(datos);
  const guardada = leerRecetaModelosDiscretos(snapshot);
  return validarModelosDiscretosGuardable(datos) && actual.modelo === guardada.modelo && actual.modo === guardada.modo
    && firmaRecetaModelosDiscretos(actual) !== firmaRecetaModelosDiscretos(guardada);
};

// Distribuciones Continuas
export const MODELOS_CONTINUOS = ['Uniforme', 'Normal', 'NormalEstandar', 'ChiCuadrado', 'FFisher', 'TStudent'];
export const esOperacionModelosContinuos = operacion => ['distribuciones_continuas', 'continuas', 'modelos_continuos'].includes(String(operacion || '').toLowerCase());
const camposModeloContinuo = modelo => ({ Uniforme: ['a', 'b'], Normal: ['mu', 'sigma'], NormalEstandar: [], ChiCuadrado: ['k'], FFisher: ['v1', 'v2'], TStudent: ['n'] })[modelo] || [];
const numeroContinuo = valor => String(valor ?? '').trim() === '' ? '' : Number(String(valor).replace(',', '.'));
const esInversa = tipo => String(tipo || '').startsWith('inversa_');
export const crearEstadoModelosContinuos = () => Object.fromEntries(MODELOS_CONTINUOS.map(modelo => [modelo, {
  modo: ['NormalEstandar', 'FFisher'].includes(modelo) ? 'manual' : 'matriz',
  manual: modelo === 'NormalEstandar' ? { mu: '0', sigma: '1' } : Object.fromEntries(camposModeloContinuo(modelo).map(campo => [campo, ''])),
  matriz: { col: 0, col2: 1, stats: null, ...Object.fromEntries(camposModeloContinuo(modelo).map(campo => [campo, ''])) },
  directa: { tipo: 'menor_igual', x: '', x2: '', intervals: [{ id: 1, min: '', max: '' }, { id: 2, min: '', max: '' }] },
  inversa: { tipo: 'inversa_menor', p: '' }, calcMode: 'directa', yaCalculado: false,
}]));
const normalizarCondicion = condicion => {
  if (!condicion?.tipo) return null;
  const tipo = condicion.tipo;
  if (esInversa(tipo)) return { tipo, valP: numeroContinuo(condicion.valP ?? condicion.p) };
  if (tipo === 'suma_intervalos') return { tipo, intervals: (condicion.intervals || [])
    .map(intervalo => Array.isArray(intervalo) ? intervalo : [intervalo.min, intervalo.max])
    .filter(([min, max]) => String(min ?? '').trim() !== '' || String(max ?? '').trim() !== '')
    .map(([min, max]) => [numeroContinuo(min), numeroContinuo(max)]) };
  return { tipo, valX: numeroContinuo(condicion.valX ?? condicion.x ?? condicion.valorX),
    ...(['entre', 'exterior', 'intervalo'].includes(tipo) ? { valX2: numeroContinuo(condicion.valX2 ?? condicion.x2 ?? condicion.valorB) } : {}) };
};
export const crearRecetaModelosContinuos = (datos, evaluarCondicion = !!datos.datosTema3Continuos?.condicion) => {
  const modelo = datos.modeloTema3Continuo || 'Uniforme';
  const estado = datos.estadoModelosContinuos?.[modelo] || crearEstadoModelosContinuos()[modelo] || crearEstadoModelosContinuos().Uniforme;
  const modo = modelo === 'NormalEstandar' ? 'manual' : estado.modo;
  const columnas = columnasModelosDiscretos(datos.varSeleccionada, datos.filas);
  const calcMode = estado.calcMode;
  const condicion = calcMode === 'inversa' ? { tipo: estado.inversa.tipo, p: estado.inversa.p }
    : { tipo: estado.directa.tipo, x: estado.directa.x, x2: estado.directa.x2, intervals: estado.directa.intervals };
  return {
    modulo: 'MAT251', operacion: datos.operacion, modelo, modo, calcMode,
    ...(modo === 'matriz' ? {
      estimacion: { columnas: modelo === 'FFisher' ? [estado.matriz.col, estado.matriz.col2]
        : [columnas.length === 1 ? 0 : estado.matriz.col] },
    } : modelo === 'NormalEstandar' ? {} : {
      parametros: Object.fromEntries(camposModeloContinuo(modelo).map(campo => [campo, numeroContinuo(estado.manual[campo])])),
    }),
    condicion: evaluarCondicion ? normalizarCondicion(condicion) : null,
    filas: modo === 'matriz' ? datos.filas || [] : [],
    varSeleccionada: modo === 'matriz' ? datos.varSeleccionada || null : null,
    nombreEncabezadoManual: modo === 'matriz' ? datos.nombreEncabezadoManual || '' : '',
    archivo: modo === 'matriz' ? obtenerArchivoRealHistorialMAT251({}, datos.selectedFile) : null,
    hoja: modo === 'matriz' ? datos.selectedSheet ?? 0 : null,
  };
};
export const leerRecetaModelosContinuos = (snapshot = {}) => {
  const legado = snapshot.tema3?.continuos || {};
  const modelo = snapshot.modelo || legado.modelo || 'Uniforme';
  const modo = modelo === 'NormalEstandar' ? 'manual' : snapshot.modo || legado.modo || 'manual';
  const datos = modo === 'matriz' ? leerDatosMatrizHistorial(snapshot) : { filas: [], varSeleccionada: null };
  const parametros = snapshot.parametros || legado.params || legado.parametros || {};
  const condicion = normalizarCondicion(snapshot.condicion || legado.condicion);
  const columnas = columnasModelosDiscretos(datos.varSeleccionada, datos.filas);
  const contexto = legado.contextoMatriz || {};
  const indicesLegados = modelo === 'FFisher'
    ? (contexto.grupos || []).map(grupo => columnas.indexOf(grupo.columna))
    : [columnas.length === 1 ? 0 : columnas.indexOf(contexto.columna)];
  return {
    ...snapshot, ...datos, modelo, modo,
    calcMode: condicion ? esInversa(condicion.tipo) ? 'inversa' : 'directa' : snapshot.calcMode || legado.calcMode || 'directa',
    parametros: modelo === 'NormalEstandar' ? {} : Object.fromEntries(camposModeloContinuo(modelo).map(campo => [campo, numeroContinuo(parametros[campo])])),
    estimacion: snapshot.estimacion || { columnas: indicesLegados },
    condicion, nombreEncabezadoManual: modo === 'matriz' ? snapshot.nombreEncabezadoManual || '' : '',
  };
};
export const firmaRecetaModelosContinuos = receta => JSON.stringify({
  modelo: receta.modelo, modo: receta.modelo === 'NormalEstandar' ? 'manual' : receta.modo,
  calcMode: receta.calcMode || 'directa',
  ...(receta.modo === 'matriz' ? {
    estimacion: receta.estimacion, nombre: receta.varSeleccionada?.nombre || '', encabezado: receta.nombreEncabezadoManual || '',
    columnas: columnasModelosDiscretos(receta.varSeleccionada, receta.filas),
    filas: (receta.filas || []).map(fila => String(fila.valor ?? '').trim()).filter(Boolean),
  } : receta.modelo === 'NormalEstandar' ? {} : { parametros: receta.parametros }),
  condicion: normalizarCondicion(receta.condicion),
});
const parametrosContinuosValidos = (modelo, p) => {
  if (modelo === 'NormalEstandar') return true;
  if (!camposModeloContinuo(modelo).every(campo => typeof p[campo] === 'number' && Number.isFinite(p[campo]))) return false;
  if (modelo === 'Uniforme') return p.a < p.b;
  if (modelo === 'Normal') return p.sigma > 0;
  return camposModeloContinuo(modelo).every(campo => Number.isSafeInteger(p[campo]) && p[campo] > 0);
};
export const estimarRecetaModelosContinuos = receta => {
  const columnas = columnasModelosDiscretos(receta.varSeleccionada, receta.filas);
  const indices = receta.estimacion?.columnas || [];
  const cantidad = receta.modelo === 'FFisher' ? 2 : 1;
  if (indices.length !== cantidad || !indices.every(indice => Number.isInteger(indice) && indice >= 0 && indice < columnas.length)
      || (cantidad === 2 && indices[0] === indices[1])) return { error: 'Selecciona las columnas numéricas necesarias; los dos grupos de Fisher deben ser distintos.' };
  const grupos = indices.map(indice => valoresColumnaModelo(receta.filas, indice).map(numeroContinuo));
  if (grupos.some(grupo => !grupo.length || grupo.some(valor => typeof valor !== 'number' || !Number.isFinite(valor)))) {
    return { error: 'Las columnas seleccionadas deben contener números finitos; corrige los datos de texto o inválidos.' };
  }
  const valores = grupos[0];
  const total = valores.length;
  let params;
  let stats;
  if (receta.modelo === 'Uniforme') {
    const min = valores.reduce((a, b) => Math.min(a, b), Infinity);
    const max = valores.reduce((a, b) => Math.max(a, b), -Infinity);
    params = { a: min, b: max }; stats = { total, min, max };
  } else if (receta.modelo === 'Normal') {
    if (total < 2) return { error: 'La estimación normal necesita al menos dos observaciones.' };
    let media = 0;
    let m2 = 0;
    valores.forEach((valor, i) => { const diferencia = valor - media; media += diferencia / (i + 1); m2 += diferencia * (valor - media); });
    const desviacion = Math.sqrt(m2 / (total - 1));
    params = { mu: media, sigma: desviacion }; stats = { total, media, desviacion };
  } else if (receta.modelo === 'FFisher') {
    params = { v1: grupos[0].length - 1, v2: grupos[1].length - 1 };
    stats = { total1: grupos[0].length, total2: grupos[1].length, ...params };
  } else if (receta.modelo === 'ChiCuadrado' || receta.modelo === 'TStudent') {
    params = receta.modelo === 'ChiCuadrado' ? { k: total - 1 } : { n: total - 1 };
    stats = { total, n: total - 1 };
  }
  if (!params || !parametrosContinuosValidos(receta.modelo, params)) return { error: 'No se pueden estimar parámetros válidos. Revisa la cantidad de observaciones y la variabilidad de los datos.' };
  return { params, stats, grupos, columnas };
};
const prepararCondicion = (condicion, calcMode) => {
  if (!condicion) return { condicion: null };
  const c = normalizarCondicion(condicion);
  if (calcMode === 'inversa') {
    if (!['inversa_menor', 'inversa_mayor', 'inversa_entre', 'inversa_exterior'].includes(c.tipo)
        || typeof c.valP !== 'number' || !Number.isFinite(c.valP) || c.valP <= 0 || c.valP >= 1) {
      return { error: 'La probabilidad inversa debe ser un número estrictamente entre 0 y 1.' };
    }
    return { condicion: c };
  }
  if (c.tipo === 'suma_intervalos') {
    if (!c.intervals.length || c.intervals.some(par => par.length !== 2 || !par.every(valor => typeof valor === 'number' && Number.isFinite(valor)) || par[0] > par[1])) {
      return { error: 'Completa los intervalos con límites numéricos ordenados.' };
    }
    const ordenados = c.intervals.map(par => [...par]).sort((a, b) => a[0] - b[0]);
    const unidos = [];
    ordenados.forEach(([min, max]) => { const ultimo = unidos[unidos.length - 1];
      if (ultimo && min <= ultimo.max) ultimo.max = Math.max(ultimo.max, max);
      else unidos.push({ min, max });
    });
    return { condicion: { tipo: c.tipo, intervals: unidos } };
  }
  if (!['menor', 'menor_igual', 'mayor', 'mayor_igual', 'entre', 'intervalo', 'exterior'].includes(c.tipo)
      || typeof c.valX !== 'number' || !Number.isFinite(c.valX)
      || (['entre', 'intervalo', 'exterior'].includes(c.tipo)
        && (typeof c.valX2 !== 'number' || !Number.isFinite(c.valX2) || c.valX2 < c.valX))) return { error: 'Completa la condición con límites numéricos válidos.' };
  return { condicion: c };
};
export const calcularRecetaModelosContinuos = receta => {
  if (!MODELOS_CONTINUOS.includes(receta.modelo) || !['manual', 'matriz'].includes(receta.modo)
      || !['directa', 'inversa'].includes(receta.calcMode)) return { error: 'Modelo, modo o tipo de cálculo continuo inválido.' };
  const estimacion = receta.modo === 'matriz' && receta.modelo !== 'NormalEstandar' ? estimarRecetaModelosContinuos(receta) : null;
  if (estimacion?.error) return estimacion;
  const params = receta.modelo === 'NormalEstandar' ? { mu: 0, sigma: 1 } : estimacion?.params || receta.parametros;
  if (!parametrosContinuosValidos(receta.modelo, params || {})) return { error: 'Completa los parámetros: extremos ordenados, desviación positiva y grados de libertad enteros positivos.' };
  const consulta = prepararCondicion(receta.condicion, receta.calcMode);
  if (consulta.error) return consulta;
  let resultados;
  let datosGrafico;
  try {
    resultados = calcularDistribucionContinua(receta.modelo, params, consulta.condicion);
    datosGrafico = generarDatosGraficoContinua(receta.modelo, params, consulta.condicion, resultados);
  } catch {
    return { error: 'No se pudo calcular la distribución. Revisa los parámetros y los límites de la consulta.' };
  }
  const prob = resultados.probabilidadFinal;
  if ((consulta.condicion && (!Number.isFinite(prob) || prob < -1e-12 || prob > 1 + 1e-12))
      || [resultados.esperanza, resultados.varianza].some(valor => valor !== undefined && !Number.isFinite(valor))
      || ['c', 'c1', 'c2'].some(clave => resultados[clave] !== undefined && !Number.isFinite(resultados[clave]))
      || !datosGrafico.length || datosGrafico.some(dato => !Number.isFinite(dato.x) || !Number.isFinite(dato.y))) {
    return { error: 'El cálculo excede el rango numérico admitido. Revisa los parámetros y la probabilidad de búsqueda.' };
  }
  if (prob !== null) resultados.probabilidadFinal = Math.max(0, Math.min(1, prob));
  return { estimacion, resultado: {
    modelo: receta.modelo, modo: receta.modelo === 'NormalEstandar' ? 'manual' : receta.modo,
    calcMode: receta.calcMode, params, condicion: consulta.condicion, resultados, datosGrafico,
    contextoMatriz: estimacion ? {
      nombreVariable: receta.varSeleccionada?.nombre, cantidadColumnas: estimacion.columnas.length,
      columna: estimacion.columnas[receta.estimacion.columnas[0]], observaciones: estimacion.grupos[0],
      grupos: receta.modelo === 'FFisher' ? estimacion.grupos.map((observaciones, i) => ({ columna: estimacion.columnas[receta.estimacion.columnas[i]], observaciones })) : null,
      estadisticas: estimacion.stats,
    } : null,
    _entradaModeloContinuo: firmaRecetaModelosContinuos(receta),
  } };
};
export const estadoRestauradoModelosContinuos = (receta, calculo) => {
  const estados = crearEstadoModelosContinuos();
  const actual = estados[receta.modelo];
  if (!actual) return estados;
  actual.modo = receta.modelo === 'NormalEstandar' ? 'manual' : receta.modo;
  actual.calcMode = receta.calcMode;
  if (receta.modelo !== 'NormalEstandar') actual.manual = { ...actual.manual, ...receta.parametros };
  actual.matriz = { ...actual.matriz, col: receta.estimacion?.columnas?.[0] ?? 0, col2: receta.estimacion?.columnas?.[1] ?? 1,
    ...(calculo.estimacion?.params || {}), stats: calculo.estimacion?.stats || null };
  const condicion = normalizarCondicion(receta.condicion);
  if (condicion) {
    if (esInversa(condicion.tipo)) actual.inversa = { tipo: condicion.tipo, p: condicion.valP };
    else actual.directa = { ...actual.directa, tipo: condicion.tipo, x: condicion.valX ?? '', x2: condicion.valX2 ?? '',
      ...(condicion.intervals ? { intervals: condicion.intervals.map(([min, max], i) => ({ id: i + 1, min, max })) } : {}) };
  }
  actual.yaCalculado = !!calculo.resultado;
  return estados;
};
export const validarModelosContinuosGuardable = datos => !!datos.datosTema3Continuos
  && datos.datosTema3Continuos._entradaModeloContinuo === firmaRecetaModelosContinuos(crearRecetaModelosContinuos(datos));
export const puedeActualizarHistorialModelosContinuos = (datos, snapshot) => {
  const actual = crearRecetaModelosContinuos(datos);
  const guardada = leerRecetaModelosContinuos(snapshot);
  return validarModelosContinuosGuardable(datos) && actual.modelo === guardada.modelo && actual.modo === guardada.modo
    && firmaRecetaModelosContinuos(actual) !== firmaRecetaModelosContinuos(guardada);
};
