// Historial del Tema 5: Estimación puntual y por intervalos.
import {
  calcularEstimacionPuntualMatriz, calcularEstimacionPuntualManual, calcularIntervaloMedia,
  calcularIntervaloProporcion, calcularIntervaloVarianza,
} from '../Matematicas/logica_Tema5';
import {
  leerDatosMatrizHistorial, obtenerArchivoRealHistorialMAT251,
} from './historialMAT251';

// Estimación Puntual
export const esOperacionPuntual = operacion => String(operacion || '').toLowerCase() === 'estimacion_puntual';
export const crearConfiguracionPuntual = () => ({ valorExito: '', manual: { n: '', xBar: '', x: '', s2: '' } });
const numero = valor => String(valor ?? '').trim() === '' ? '' : Number(String(valor).replace(',', '.'));
const parametrosActivos = (parametro, modo, configuracion) => modo === 'matriz'
  ? (parametro === 'proporcion' ? { valorExito: String(configuracion.valorExito ?? '').trim() } : {})
  : { n: numero(configuracion.manual?.n), ...(parametro === 'proporcion' ? { x: numero(configuracion.manual?.x) } : { s2: numero(configuracion.manual?.s2) }) };
export const crearRecetaPuntual = datos => {
  const modo = datos.modoEstimacion;
  const parametro = datos.paramEstimacion;
  return {
    modulo: 'MAT251', operacion: datos.operacion || 'Estimacion_puntual', modo, parametro,
    parametros: parametrosActivos(parametro, modo, datos.configuracionPuntual || crearConfiguracionPuntual()),
    filas: modo === 'matriz' ? datos.filas || [] : [], varSeleccionada: modo === 'matriz' ? datos.varSeleccionada || null : null,
    nombreEncabezadoManual: modo === 'matriz' ? datos.nombreEncabezadoManual || '' : '',
    archivo: modo === 'matriz' ? obtenerArchivoRealHistorialMAT251({}, datos.selectedFile) : null,
    hoja: modo === 'matriz' ? datos.selectedSheet ?? 0 : null,
  };
};
export const leerRecetaPuntual = (snapshot = {}) => ({
  ...snapshot, parametro: snapshot.parametro || snapshot.tema5?.paramEstimacion || 'media',
  modo: snapshot.modo || snapshot.tema5?.modoEstimacion || 'matriz', parametros: snapshot.parametros || {},
  ...((snapshot.modo || snapshot.tema5?.modoEstimacion || 'matriz') === 'matriz' ? leerDatosMatrizHistorial(snapshot) : { filas: [], varSeleccionada: null }),
  nombreEncabezadoManual: snapshot.nombreEncabezadoManual || '',
});
export const configuracionRestauradaPuntual = receta => ({
  ...crearConfiguracionPuntual(),
  ...(receta.modo === 'matriz' ? { valorExito: receta.parametros?.valorExito || '' } : { manual: { ...crearConfiguracionPuntual().manual, ...receta.parametros } }),
});
export const firmaRecetaPuntual = receta => JSON.stringify({
  modo: receta.modo, parametro: receta.parametro,
  parametros: parametrosActivos(receta.parametro, receta.modo, configuracionRestauradaPuntual(receta)),
  ...(receta.modo === 'matriz' ? {
    nombre: receta.varSeleccionada?.nombre || '', columnas: receta.varSeleccionada?.nombresColumnas || [],
    encabezado: receta.nombreEncabezadoManual || '', filas: (receta.filas || []).map(fila => String(fila.valor ?? '').trim()).filter(Boolean),
  } : {}),
});
export const calcularRecetaPuntual = receta => {
  if (!['matriz', 'manual'].includes(receta.modo) || !['media', 'proporcion', 'varianza'].includes(receta.parametro)
      || (receta.parametro === 'media' && receta.modo === 'manual')) return { error: 'El historial de estimación puntual admite matriz y los modos manuales disponibles. Las simulaciones no se guardan.' };
  try {
    const p = receta.parametros || {};
    let resultados;
    if (receta.modo === 'matriz') {
      const valores = (receta.filas || []).map(fila => String(fila.valor ?? '').trim()).filter(Boolean);
      if (!valores.length || receta.varSeleccionada?.nombresColumnas?.length > 1 || valores.some(valor => valor.includes(' | '))) return { error: 'Selecciona datos de una sola columna para estimar el parámetro.' };
      if (receta.parametro === 'proporcion') {
        if (!p.valorExito || !valores.includes(String(p.valorExito).trim())) return { error: 'Selecciona el dato que se contabilizará como éxito.' };
      } else if (valores.some(valor => !Number.isFinite(Number(valor)))) return { error: 'Todos los datos deben ser números finitos para estimar media o varianza.' };
      resultados = calcularEstimacionPuntualMatriz(valores, receta.parametro, p.valorExito);
    } else {
      const n = numero(p.n);
      if (!Number.isSafeInteger(n) || n < (receta.parametro === 'varianza' ? 2 : 1)) return { error: 'El tamaño de muestra debe ser entero positivo; para varianza debe ser al menos 2.' };
      if (receta.parametro === 'proporcion') {
        const x = numero(p.x);
        if (!Number.isSafeInteger(x) || x < 0 || x > n) return { error: 'Los casos favorables deben ser enteros entre 0 y n.' };
        resultados = calcularEstimacionPuntualManual({ n, x }, receta.parametro);
      } else {
        const s2 = numero(p.s2);
        if (typeof s2 !== 'number' || !Number.isFinite(s2) || s2 < 0) return { error: 'Ingresa una varianza muestral finita y no negativa.' };
        resultados = calcularEstimacionPuntualManual({ n, s2 }, receta.parametro);
      }
    }
    if (resultados?.error) return resultados;
    if (!Number.isFinite(resultados?.estimacion) || !Number.isSafeInteger(resultados?.n)
        || Object.values(resultados.calculos || {}).some(valor => typeof valor === 'number' && !Number.isFinite(valor))) return { error: 'Los datos exceden el rango numérico admitido para estimar el parámetro.' };
    return { resultado: {
      operacion: 'Estimacion_puntual', modo: receta.modo, parametro: receta.parametro,
      nombreVariable: receta.modo === 'matriz' ? receta.varSeleccionada?.nombre : null,
      resultados, _entradaPuntual: firmaRecetaPuntual(receta),
    } };
  } catch {
    return { error: 'No se pudo reconstruir la estimación puntual. Revisa los datos guardados.' };
  }
};
export const validarPuntualGuardable = datos => ['matriz', 'manual'].includes(datos.modoEstimacion)
  && !!datos.resultadoEstimacion && datos.resultadoEstimacion._entradaPuntual === firmaRecetaPuntual(crearRecetaPuntual(datos));
export const puedeActualizarHistorialPuntual = (datos, snapshot) => {
  const actual = crearRecetaPuntual(datos);
  const anterior = leerRecetaPuntual(snapshot);
  return validarPuntualGuardable(datos) && actual.modo === anterior.modo && actual.parametro === anterior.parametro
    && firmaRecetaPuntual(actual) !== firmaRecetaPuntual(anterior);
};

// Estimación por Intervalos
export const esOperacionIntervalos = operacion => String(operacion || '').toLowerCase() === 'estimacion_intervalos';
export const crearConfiguracionIntervalos = () => ({
  matriz: { valorExito: '', sigmaConocida: false, sigmaPoblacional: '' },
  manual: { n: '', xBar: '', desviacion: '', sigmaConocida: false, x: '', s2: '' },
});
const numeroIntervalos = valor => String(valor ?? '').trim() === '' ? '' : Number(String(valor).replace(',', '.'));
const finito = valor => typeof valor === 'number' && Number.isFinite(valor);
const parametrosActivosIntervalos = (parametro, modo, configuracion) => {
  const p = configuracion[modo] || {};
  if (modo === 'matriz') {
    if (parametro === 'proporcion') return { valorExito: String(p.valorExito ?? '').trim() };
    if (parametro === 'media') return { sigmaConocida: p.sigmaConocida === true,
      ...(p.sigmaConocida === true ? { sigmaPoblacional: numeroIntervalos(p.sigmaPoblacional) } : {}) };
    return {};
  }
  return { n: numeroIntervalos(p.n), ...(parametro === 'media'
    ? { xBar: numeroIntervalos(p.xBar), desviacion: numeroIntervalos(p.desviacion), sigmaConocida: p.sigmaConocida === true }
    : parametro === 'proporcion' ? { x: numeroIntervalos(p.x) } : { s2: numeroIntervalos(p.s2) }) };
};
export const crearRecetaIntervalos = datos => {
  const modo = datos.modoIntervalos;
  return {
    modulo: 'MAT251', operacion: 'Estimacion_intervalos', modo, parametro: datos.paramIntervalos,
    confianza: numeroIntervalos(datos.confianzaIntervalos),
    parametros: parametrosActivosIntervalos(datos.paramIntervalos, modo, datos.configuracionIntervalos || crearConfiguracionIntervalos()),
    filas: modo === 'matriz' ? datos.filas || [] : [], varSeleccionada: modo === 'matriz' ? datos.varSeleccionada || null : null,
    nombreEncabezadoManual: modo === 'matriz' ? datos.nombreEncabezadoManual || '' : '',
    archivo: modo === 'matriz' ? obtenerArchivoRealHistorialMAT251({}, datos.selectedFile) : null,
    hoja: modo === 'matriz' ? datos.selectedSheet ?? 0 : null,
  };
};
export const leerRecetaIntervalos = (snapshot = {}) => {
  const modo = snapshot.modo || snapshot.tema5?.modoIntervalos || 'matriz';
  return { ...snapshot, modo, parametro: snapshot.parametro || snapshot.tema5?.paramIntervalos || 'media',
    confianza: numeroIntervalos(snapshot.confianza ?? snapshot.tema5?.confianzaIntervalos), parametros: snapshot.parametros || {},
    ...(modo === 'matriz' ? leerDatosMatrizHistorial(snapshot) : { filas: [], varSeleccionada: null }),
    nombreEncabezadoManual: snapshot.nombreEncabezadoManual || '',
  };
};
export const configuracionRestauradaIntervalos = receta => {
  const configuracion = crearConfiguracionIntervalos();
  if (['matriz', 'manual'].includes(receta.modo)) configuracion[receta.modo] = { ...configuracion[receta.modo], ...receta.parametros };
  return configuracion;
};
export const firmaRecetaIntervalos = receta => JSON.stringify({
  modo: receta.modo, parametro: receta.parametro, confianza: numeroIntervalos(receta.confianza),
  parametros: parametrosActivosIntervalos(receta.parametro, receta.modo, configuracionRestauradaIntervalos(receta)),
  ...(receta.modo === 'matriz' ? {
    nombre: receta.varSeleccionada?.nombre || '', columnas: receta.varSeleccionada?.nombresColumnas || [],
    encabezado: receta.nombreEncabezadoManual || '', filas: (receta.filas || []).map(fila => String(fila.valor ?? '').trim()).filter(Boolean),
  } : {}),
});
export const calcularRecetaIntervalos = receta => {
  if (!['matriz', 'manual'].includes(receta.modo) || !['media', 'proporcion', 'varianza'].includes(receta.parametro)) return { error: 'El historial de intervalos admite análisis de matriz y modo manual. Las simulaciones no se guardan.' };
  if (![90, 95, 99].includes(numeroIntervalos(receta.confianza))) return { error: 'Selecciona un nivel de confianza de 90 %, 95 % o 99 %.' };
  try {
    const p = receta.parametros || {};
    if (receta.parametro === 'media' && typeof p.sigmaConocida !== 'boolean') return { error: 'Falta indicar si la desviación poblacional es conocida. Este registro no contiene todos los parámetros del intervalo.' };
    let puntual;
    let n, xBar, desviacion, x, s2;
    if (receta.modo === 'matriz') {
      const valores = (receta.filas || []).map(fila => String(fila.valor ?? '').trim()).filter(Boolean);
      if (!valores.length || receta.varSeleccionada?.nombresColumnas?.length > 1 || valores.some(valor => valor.includes(' | '))) return { error: 'Selecciona datos de una sola columna para calcular el intervalo.' };
      if (receta.parametro === 'proporcion') {
        if (!p.valorExito || !valores.includes(String(p.valorExito).trim())) return { error: 'Selecciona el dato que se contabilizará como éxito.' };
      } else if (valores.some(valor => !Number.isFinite(Number(valor)))) return { error: 'Todos los datos deben ser números finitos para estimar media o varianza.' };
      puntual = calcularEstimacionPuntualMatriz(valores, receta.parametro, p.valorExito);
      if (puntual.error) return puntual;
      n = puntual.n;
      xBar = puntual.estimacion;
      x = puntual.calculos?.x;
      s2 = puntual.estimacion;
      desviacion = p.sigmaConocida ? numeroIntervalos(p.sigmaPoblacional) : puntual.calculos?.desviacion;
    } else {
      n = numeroIntervalos(p.n); xBar = numeroIntervalos(p.xBar); desviacion = numeroIntervalos(p.desviacion); x = numeroIntervalos(p.x); s2 = numeroIntervalos(p.s2);
    }
    const minimo = receta.parametro === 'varianza' || (receta.parametro === 'media' && !p.sigmaConocida) ? 2 : 1;
    if (!Number.isSafeInteger(n) || n < minimo) return { error: `El tamaño de muestra debe ser un entero de al menos ${minimo}.` };
    let resultados;
    if (receta.parametro === 'media') {
      if (!finito(xBar) || !finito(desviacion) || desviacion < 0 || (p.sigmaConocida && desviacion === 0)) return { error: 'Ingresa una media finita y una desviación válida; la poblacional debe ser mayor que cero.' };
      resultados = calcularIntervaloMedia(xBar, desviacion, n, numeroIntervalos(receta.confianza), p.sigmaConocida);
    } else if (receta.parametro === 'proporcion') {
      if (!Number.isSafeInteger(x) || x < 0 || x > n) return { error: 'Los casos favorables deben ser enteros entre 0 y n.' };
      resultados = calcularIntervaloProporcion(x, n, numeroIntervalos(receta.confianza));
    } else {
      if (!finito(s2) || s2 < 0) return { error: 'Ingresa una varianza muestral finita y no negativa.' };
      resultados = calcularIntervaloVarianza(s2, n, numeroIntervalos(receta.confianza));
    }
    if (resultados?.error) return resultados;
    if (!finito(resultados?.LI) || !finito(resultados?.LS) || resultados.LI > resultados.LS
        || Object.values(resultados).some(valor => typeof valor === 'number' && !Number.isFinite(valor))) return { error: 'Los datos exceden el rango numérico admitido para calcular el intervalo.' };
    return { resultado: {
      operacion: 'Estimacion_intervalos', modo: receta.modo, parametro: receta.parametro, confianza: numeroIntervalos(receta.confianza),
      nombreVariable: receta.modo === 'matriz' ? receta.varSeleccionada?.nombre : null,
      resultados: { ...resultados, ...(puntual ? { puntual } : {}), ...(receta.parametro === 'media' ? { sigmaConocida: p.sigmaConocida } : {}) },
      _entradaIntervalos: firmaRecetaIntervalos(receta),
    } };
  } catch {
    return { error: 'No se pudo reconstruir el intervalo. Revisa los datos y parámetros guardados.' };
  }
};
export const validarIntervalosGuardable = datos => ['matriz', 'manual'].includes(datos.modoIntervalos)
  && !!datos.resultadoEstimacion && datos.resultadoEstimacion._entradaIntervalos === firmaRecetaIntervalos(crearRecetaIntervalos(datos));
export const puedeActualizarHistorialIntervalos = (datos, snapshot) => {
  const actual = crearRecetaIntervalos(datos);
  const anterior = leerRecetaIntervalos(snapshot);
  return validarIntervalosGuardable(datos) && actual.modo === anterior.modo && actual.parametro === anterior.parametro
    && firmaRecetaIntervalos(actual) !== firmaRecetaIntervalos(anterior);
};
