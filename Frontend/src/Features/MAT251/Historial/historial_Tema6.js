// Historial del Tema 6: Hipótesis paramétricas y no paramétricas.
import { jStat } from 'jstat';
import {
  pruebaMediaZ, pruebaMediaT, pruebaProporcionZ, pruebaVarianzaChi, pruebaChiCuadradaBondad,
  pruebaChiCuadradaIndependencia, pruebaSignos, pruebaSignosResumida, pruebaRachas,
} from '../Matematicas/Logica_Tema6';
import {
  leerDatosMatrizHistorial, obtenerArchivoRealHistorialMAT251,
} from './historialMAT251';

// Hipótesis Paramétricas
export const NOMBRES_HP = { media_z: 'Media Z (σ conocida)', media_t: 'Media T (σ desconocida)', proporcion: 'Proporción', varianza: 'Varianza' };
export const esOperacionHP = operacion => String(operacion || '').toLowerCase() === 'hipotesis_parametricas';
export const crearConfiguracionHP = () => ({
  matriz: { valorExito: '', sigma: '', mu0: '', p0: '', sigma02: '', alpha: '0.05', tipoPrueba: 'bilateral' },
  manual: { n: '', xBar: '', s: '', s2: '', sigma: '', x: '', mu0: '', p0: '', sigma02: '', alpha: '0.05', tipoPrueba: 'bilateral' },
});
const numero = valor => String(valor ?? '').trim() === '' ? '' : Number(String(valor).replace(',', '.'));
const finito = valor => typeof valor === 'number' && Number.isFinite(valor);
const camposActivos = (prueba, modo) => ({
  media_z: ['mu0', 'sigma', ...(modo === 'manual' ? ['xBar'] : [])],
  media_t: ['mu0', ...(modo === 'manual' ? ['xBar', 's'] : [])],
  proporcion: ['p0', ...(modo === 'manual' ? ['x'] : [])],
  varianza: ['sigma02', ...(modo === 'manual' ? ['s2'] : [])],
})[prueba] || [];
const parametrosActivos = (prueba, modo, configuracion) => {
  const p = configuracion[modo] || {};
  return { alpha: numero(p.alpha), tipoPrueba: p.tipoPrueba || '',
    ...Object.fromEntries([...camposActivos(prueba, modo), ...(modo === 'manual' ? ['n'] : [])].map(campo => [campo, numero(p[campo])])),
    ...(modo === 'matriz' && prueba === 'proporcion' ? { valorExito: String(p.valorExito ?? '').trim() } : {}),
  };
};
export const crearRecetaHP = datos => {
  const modo = datos.modoHP;
  return {
    modulo: 'MAT251', operacion: 'Hipotesis_parametricas', modo, prueba: datos.pruebaHP,
    parametros: parametrosActivos(datos.pruebaHP, modo, datos.configuracionHP || crearConfiguracionHP()),
    filas: modo === 'matriz' ? datos.filas || [] : [], varSeleccionada: modo === 'matriz' ? datos.varSeleccionada || null : null,
    nombreEncabezadoManual: modo === 'matriz' ? datos.nombreEncabezadoManual || '' : '',
    archivo: modo === 'matriz' ? obtenerArchivoRealHistorialMAT251({}, datos.selectedFile) : null,
    hoja: modo === 'matriz' ? datos.selectedSheet ?? 0 : null,
  };
};
export const leerRecetaHP = (snapshot = {}) => {
  const modo = snapshot.modo || snapshot.tema6?.modoHP || 'matriz';
  return { ...snapshot, modo, prueba: snapshot.prueba || snapshot.tema6?.pruebaHP || '', parametros: snapshot.parametros || {},
    ...(modo === 'matriz' ? leerDatosMatrizHistorial(snapshot) : { filas: [], varSeleccionada: null }),
    nombreEncabezadoManual: snapshot.nombreEncabezadoManual || '',
  };
};
export const configuracionRestauradaHP = receta => {
  const configuracion = crearConfiguracionHP();
  if (['matriz', 'manual'].includes(receta.modo)) {
    const p = receta.parametros || {};
    configuracion[receta.modo] = { ...configuracion[receta.modo], ...p,
      alpha: finito(numero(p.alpha)) ? numero(p.alpha).toFixed(2) : '', tipoPrueba: p.tipoPrueba || '',
    };
  }
  return configuracion;
};
export const firmaRecetaHP = receta => JSON.stringify({
  modo: receta.modo, prueba: receta.prueba,
  parametros: parametrosActivos(receta.prueba, receta.modo, configuracionRestauradaHP(receta)),
  ...(receta.modo === 'matriz' ? {
    nombre: receta.varSeleccionada?.nombre || '', columnas: receta.varSeleccionada?.nombresColumnas || [],
    encabezado: receta.nombreEncabezadoManual || '', filas: (receta.filas || []).map(fila => String(fila.valor ?? '').trim()).filter(Boolean),
  } : {}),
});
export const calcularRecetaHP = receta => {
  if (!['matriz', 'manual'].includes(receta.modo) || !Object.prototype.hasOwnProperty.call(NOMBRES_HP, receta.prueba)) return { error: 'Selecciona una prueba paramétrica en matriz o manual. Las simulaciones no se guardan en el historial.' };
  try {
    const p = receta.parametros || {};
    const alpha = numero(p.alpha);
    if (![0.1, 0.05, 0.01].includes(alpha) || !['bilateral', 'izquierda', 'derecha'].includes(p.tipoPrueba)) return { error: 'Selecciona el nivel de significación y el tipo de prueba.' };
    const valores = receta.modo === 'matriz' ? (receta.filas || []).map(fila => String(fila.valor ?? '').trim()).filter(Boolean) : [];
    let n, xBar, s, s2, x;
    if (receta.modo === 'matriz') {
      if (!valores.length || receta.varSeleccionada?.nombresColumnas?.length > 1 || valores.some(valor => valor.includes(' | '))) return { error: 'Selecciona datos de una sola columna para esta prueba.' };
      n = valores.length;
      if (receta.prueba === 'proporcion') {
        if (!p.valorExito || !valores.includes(String(p.valorExito).trim())) return { error: 'Selecciona el dato que se contabilizará como éxito.' };
        x = valores.filter(valor => valor === String(p.valorExito).trim()).length;
      } else {
        const datos = valores.map(Number);
        if (datos.some(valor => !Number.isFinite(valor))) return { error: 'Todos los datos de la muestra deben ser números finitos.' };
        xBar = jStat.mean(datos);
        s2 = n > 1 ? jStat.variance(datos, true) : 0;
        s = Math.sqrt(s2);
      }
    } else {
      n = numero(p.n); xBar = numero(p.xBar); s = numero(p.s); s2 = numero(p.s2); x = numero(p.x);
    }
    const minimo = ['media_t', 'varianza'].includes(receta.prueba) ? 2 : 1;
    if (!Number.isSafeInteger(n) || n < minimo) return { error: `El tamaño de muestra debe ser un entero de al menos ${minimo}.` };
    let resultados;
    if (['media_z', 'media_t'].includes(receta.prueba)) {
      const mu0 = numero(p.mu0);
      const desviacion = receta.prueba === 'media_z' ? numero(p.sigma) : s;
      if (!finito(xBar) || !finito(mu0) || !finito(desviacion) || desviacion <= 0) return { error: 'Ingresa medias finitas y una desviación estándar mayor que cero.' };
      const escala = desviacion / Math.sqrt(n);
      if (!finito(escala) || escala <= 0) return { error: 'La desviación y el tamaño de muestra exceden el rango numérico admitido.' };
      resultados = receta.prueba === 'media_z' ? pruebaMediaZ(n, xBar, desviacion, mu0, alpha, p.tipoPrueba) : pruebaMediaT(n, xBar, desviacion, mu0, alpha, p.tipoPrueba);
    } else if (receta.prueba === 'proporcion') {
      const p0 = numero(p.p0);
      if (!Number.isSafeInteger(x) || x < 0 || x > n || !finito(p0) || p0 <= 0 || p0 >= 1) return { error: 'Los casos favorables deben ser enteros entre 0 y n; la proporción hipotética debe estar entre 0 y 1.' };
      resultados = pruebaProporcionZ(n, x, p0, alpha, p.tipoPrueba);
    } else {
      const sigma02 = numero(p.sigma02);
      if (!finito(s2) || s2 < 0 || !finito(sigma02) || sigma02 <= 0) return { error: 'La varianza muestral debe ser finita y no negativa; la hipotética debe ser mayor que cero.' };
      resultados = pruebaVarianzaChi(n, s2, sigma02, alpha, p.tipoPrueba);
    }
    if (resultados?.error) return resultados;
    if (!finito(resultados?.estadistico) || !finito(resultados?.pValor) || resultados.pValor < 0 || resultados.pValor > 1
        || Object.values(resultados.valorCritico || {}).some(valor => !finito(valor))
        || Object.values(resultados.calculos || {}).some(valor => typeof valor === 'number' && !Number.isFinite(valor))) return { error: 'Los datos exceden el rango numérico admitido para esta prueba.' };
    return { resultado: {
      operacion: 'Hipotesis_parametricas', modo: receta.modo, prueba: receta.prueba,
      nombreVariable: receta.modo === 'matriz' ? receta.varSeleccionada?.nombre : null,
      resultados: { ...resultados, ...(receta.modo === 'matriz' ? {
        datosAnalizados: receta.prueba === 'proporcion' ? valores : valores.map(Number),
        ...(receta.prueba === 'proporcion' ? { valorExito: p.valorExito } : {}),
      } : {}) },
      _entradaHP: firmaRecetaHP(receta),
    } };
  } catch {
    return { error: 'No se pudo reconstruir la prueba. Revisa los datos y parámetros guardados.' };
  }
};
export const validarHPGuardable = datos => ['matriz', 'manual'].includes(datos.modoHP) && !!datos.resultadoHipotesis
  && datos.resultadoHipotesis._entradaHP === firmaRecetaHP(crearRecetaHP(datos));
export const puedeActualizarHistorialHP = (datos, snapshot) => {
  const actual = crearRecetaHP(datos);
  const anterior = leerRecetaHP(snapshot);
  return validarHPGuardable(datos) && actual.modo === anterior.modo && actual.prueba === anterior.prueba
    && firmaRecetaHP(actual) !== firmaRecetaHP(anterior);
};

// Hipótesis No Paramétricas
export const NOMBRES_HNP = { chi_cuadrada: 'Chi-cuadrada', signos: 'Prueba de Signos', rachas: 'Prueba de Rachas' };
export const esOperacionHNP = operacion => String(operacion || '').toLowerCase() === 'hipotesis_noparametricas';
export const crearConfiguracionHNP = () => ({
  matriz: { alpha: 0.05, subTipoChi: 'bondad', columnaSeleccionada: 0, esperadasEditables: [], valRef: null, tipoPrueba: 'bilateral', corteRachas: 'mediana', cortePersonalizado: 0 },
  manual: { alpha: '0.05', tipoChiCuadrada: 'bondad', filasBondad: [{ obs: 20, esp: 25 }, { obs: 30, esp: 25 }, { obs: 25, esp: 25 }],
    indFilas: 2, indCols: 2, matrizInd: [[0, 0], [0, 0]], nombresFilas: ['Fila 1', 'Fila 2'], nombresCols: ['Columna 1', 'Columna 2'],
    signosPositivos: '', signosNegativos: '', tipoPrueba: 'bilateral', n1Rachas: '', n2Rachas: '', obsRachas: '' },
});
const numeroHNP = valor => String(valor ?? '').trim() === '' ? '' : Number(String(valor).replace(',', '.'));
const finitoHNP = valor => typeof valor === 'number' && Number.isFinite(valor);
const entero = (valor, minimo = 0) => Number.isSafeInteger(valor) && valor >= minimo;
const columnas = variable => Math.max(1, variable?.nombresColumnas?.length || 0);
const valoresFilas = filas => (filas || []).map(fila => String(fila.valor ?? '').trim()).filter(Boolean);
const partesFila = valor => String(valor).split('|').map(parte => parte.trim());
export const extraerBondadHNP = (filas, variable) => {
  const conteos = new Map();
  const cantidad = columnas(variable);
  let errorFormatoBondad = cantidad > 2;
  for (const valor of valoresFilas(filas)) {
    const partes = partesFila(valor);
    const categoria = cantidad === 1 ? valor : partes[0];
    const frecuencia = cantidad === 1 ? 1 : numeroHNP(partes[1]);
    if (partes.length !== cantidad || !categoria || !entero(frecuencia)) { errorFormatoBondad = true; continue; }
    conteos.set(categoria, (conteos.get(categoria) || 0) + frecuencia);
  }
  const categoriasExtraidas = [...conteos.keys()];
  const observadasExtraidas = [...conteos.values()];
  const nTotal = observadasExtraidas.reduce((a, b) => a + b, 0);
  return { categoriasExtraidas, observadasExtraidas, nTotal, errorFormatoBondad,
    esperadasPredeterminadas: categoriasExtraidas.map(() => (nTotal / categoriasExtraidas.length).toFixed(2)) };
};
export const crearMatrizContingenciaHNP = datos => {
  const categoriasFila = [], categoriasCol = [], conteos = new Map();
  for (const dato of datos || []) {
    const [a, b] = partesFila(dato);
    if (!a || !b) continue;
    if (!categoriasFila.includes(a)) categoriasFila.push(a);
    if (!categoriasCol.includes(b)) categoriasCol.push(b);
    const clave = JSON.stringify([a, b]);
    conteos.set(clave, (conteos.get(clave) || 0) + 1);
  }
  return { categoriasFila, categoriasCol,
    matriz: categoriasFila.map(a => categoriasCol.map(b => conteos.get(JSON.stringify([a, b])) || 0)) };
};
const valoresColumna = (receta, columna) => valoresFilas(receta.filas).map(valor => {
  const partes = partesFila(valor);
  if (partes.length !== columnas(receta.varSeleccionada) || partes.some(parte => !parte)) throw new Error('Cada fila debe tener todas las columnas completas.');
  return partes[columna];
});
const parametrosActivosHNP = (prueba, modo, configuracion, filas, variable) => {
  const p = configuracion[modo] || {};
  const comunes = { alpha: numeroHNP(p.alpha) };
  if (prueba === 'chi_cuadrada') {
    const subtipo = modo === 'matriz' ? p.subTipoChi : p.tipoChiCuadrada;
    if (modo === 'matriz') {
      if (subtipo !== 'bondad') return comunes;
      const extraidos = extraerBondadHNP(filas, variable);
      const esperadas = p.esperadasEditables?.length ? p.esperadasEditables : extraidos.esperadasPredeterminadas;
      return { ...comunes, esperadas: esperadas.map(numeroHNP) };
    }
    if (subtipo === 'bondad') {
      const filasBondad = p.filasBondad || [];
      return { ...comunes, observadas: filasBondad.map(fila => numeroHNP(fila.obs)), esperadas: filasBondad.map(fila => numeroHNP(fila.esp)),
        ...(filasBondad.some((fila, i) => fila.categoria && fila.categoria !== `Categoría ${i + 1}`)
          ? { categorias: filasBondad.map((fila, i) => fila.categoria || `Categoría ${i + 1}`) } : {}) };
    }
    const matriz = p.matrizInd || [];
    const dimensionesValidas = numeroHNP(p.indFilas) === matriz.length && numeroHNP(p.indCols) === matriz[0]?.length;
    return { ...comunes, matriz: dimensionesValidas ? matriz.map(fila => fila.map(numeroHNP)) : [],
      ...(p.nombresFilas?.some((nombre, i) => nombre !== `Fila ${i + 1}`) ? { nombresFilas: [...p.nombresFilas] } : {}),
      ...(p.nombresCols?.some((nombre, i) => nombre !== `Columna ${i + 1}`) ? { nombresCols: [...p.nombresCols] } : {}) };
  }
  if (modo === 'manual') return { ...comunes, tipoPrueba: p.tipoPrueba,
    ...(prueba === 'signos' ? { positivos: numeroHNP(p.signosPositivos), negativos: numeroHNP(p.signosNegativos) }
      : { n1: numeroHNP(p.n1Rachas), n2: numeroHNP(p.n2Rachas), rachas: numeroHNP(p.obsRachas) }) };
  const pareada = prueba === 'signos' && columnas(variable) === 2;
  return { ...comunes, tipoPrueba: p.tipoPrueba,
    ...(!pareada && columnas(variable) > 1 ? { columna: numeroHNP(p.columnaSeleccionada) } : {}),
    ...(prueba === 'signos' ? (!pareada ? { referencia: numeroHNP(p.valRef) } : {})
      : { corte: p.corteRachas, ...(p.corteRachas === 'personalizado' ? { valorCorte: numeroHNP(p.cortePersonalizado) } : {}) }),
  };
};
export const crearRecetaHNP = datos => {
  const modo = datos.modoHNP, prueba = datos.pruebaHNP;
  const configuracion = datos.configuracionHNP || crearConfiguracionHNP();
  return { modulo: 'MAT251', operacion: 'Hipotesis_noparametricas', modo, prueba,
    ...(prueba === 'chi_cuadrada' ? { subtipo: modo === 'matriz' ? configuracion.matriz.subTipoChi : configuracion.manual.tipoChiCuadrada } : {}),
    parametros: parametrosActivosHNP(prueba, modo, configuracion, datos.filas, datos.varSeleccionada),
    filas: modo === 'matriz' ? datos.filas || [] : [], varSeleccionada: modo === 'matriz' ? datos.varSeleccionada || null : null,
    nombreEncabezadoManual: modo === 'matriz' ? datos.nombreEncabezadoManual || '' : '',
    archivo: modo === 'matriz' ? obtenerArchivoRealHistorialMAT251({}, datos.selectedFile) : null,
    hoja: modo === 'matriz' ? datos.selectedSheet ?? 0 : null };
};
export const leerRecetaHNP = (snapshot = {}) => {
  const modo = snapshot.modo || snapshot.tema6?.modoHNP || 'matriz';
  return { ...snapshot, modo, prueba: snapshot.prueba || snapshot.tema6?.pruebaHNP || '', parametros: snapshot.parametros || {},
    ...(modo === 'matriz' ? leerDatosMatrizHistorial(snapshot) : { filas: [], varSeleccionada: null }),
    nombreEncabezadoManual: snapshot.nombreEncabezadoManual || '' };
};
export const configuracionRestauradaHNP = receta => {
  const c = crearConfiguracionHNP(), p = receta.parametros || {};
  if (receta.modo === 'matriz') c.matriz = { ...c.matriz, alpha: numeroHNP(p.alpha), subTipoChi: receta.subtipo || 'bondad',
    columnaSeleccionada: p.columna ?? 0, esperadasEditables: p.esperadas || [], valRef: p.referencia ?? null,
    tipoPrueba: p.tipoPrueba || 'bilateral', corteRachas: p.corte || 'mediana', cortePersonalizado: p.valorCorte ?? 0 };
  else if (receta.modo === 'manual') c.manual = { ...c.manual,
    alpha: finitoHNP(numeroHNP(p.alpha)) ? numeroHNP(p.alpha).toFixed(2) : '', tipoChiCuadrada: receta.subtipo || 'bondad',
    ...(p.observadas ? { filasBondad: p.observadas.map((obs, i) => ({ obs, esp: p.esperadas?.[i] ?? '', categoria: p.categorias?.[i] || `Categoría ${i + 1}` })) } : {}),
    ...(p.matriz ? { matrizInd: p.matriz.map(fila => [...fila]), indFilas: p.matriz.length, indCols: p.matriz[0]?.length || 0,
      nombresFilas: p.nombresFilas || p.matriz.map((_, i) => `Fila ${i + 1}`), nombresCols: p.nombresCols || p.matriz[0]?.map((_, i) => `Columna ${i + 1}`) || [] } : {}),
    signosPositivos: p.positivos ?? '', signosNegativos: p.negativos ?? '', tipoPrueba: p.tipoPrueba || 'bilateral',
    n1Rachas: p.n1 ?? '', n2Rachas: p.n2 ?? '', obsRachas: p.rachas ?? '' };
  return c;
};
export const firmaRecetaHNP = receta => JSON.stringify({ modo: receta.modo, prueba: receta.prueba, subtipo: receta.subtipo,
  parametros: parametrosActivosHNP(receta.prueba, receta.modo, configuracionRestauradaHNP(receta), receta.filas, receta.varSeleccionada),
  ...(receta.modo === 'matriz' ? { nombre: receta.varSeleccionada?.nombre || '', columnas: receta.varSeleccionada?.nombresColumnas || [],
    encabezado: receta.nombreEncabezadoManual || '', filas: valoresFilas(receta.filas) } : {}) });
const validarFrecuencias = (observadas, esperadas) => {
  if (!observadas?.length || observadas.length < 2 || observadas.length !== esperadas?.length
    || observadas.some(v => !entero(v)) || esperadas.some(v => !finitoHNP(v) || v <= 0)) throw new Error('Ingresa al menos dos frecuencias observadas enteras no negativas y esperadas mayores que cero.');
  const total = observadas.reduce((a, b) => a + b, 0), suma = esperadas.reduce((a, b) => a + b, 0);
  if (!entero(total, 1) || !finitoHNP(suma) || Math.abs(suma - total) > 0.1) throw new Error('La suma de las frecuencias esperadas debe coincidir con el total observado.');
};
const validarContingencia = matriz => {
  if (!Array.isArray(matriz) || matriz.length < 2 || !Array.isArray(matriz[0]) || matriz[0].length < 2 || matriz.length * matriz[0].length > 1000
    || matriz.some(fila => !Array.isArray(fila) || fila.length !== matriz[0].length || fila.some(v => !entero(v)))) throw new Error('La tabla debe ser rectangular, de al menos 2 × 2, con frecuencias enteras no negativas y hasta 1000 celdas.');
  if (matriz.some(fila => fila.reduce((a, b) => a + b, 0) <= 0)
    || matriz[0].some((_, i) => matriz.reduce((suma, fila) => suma + fila[i], 0) <= 0)
    || !entero(matriz.flat().reduce((a, b) => a + b, 0), 1)) throw new Error('Cada fila y columna de la tabla debe tener un total positivo.');
};
const validarRachas = (n1, n2, rachas) => {
  if (!entero(n1, 1) || !entero(n2, 1) || !entero(n1 + n2, 2) || !entero(rachas, 2)
    || rachas > 2 * Math.min(n1, n2) + (n1 === n2 ? 0 : 1)) throw new Error('Ingresa tamaños positivos y una cantidad de rachas posible para ambos grupos.');
};
const calcularRachasMatriz = (receta, p) => {
  const raw = valoresColumna(receta, p.columna ?? 0), nums = raw.map(Number);
  const cuantitativa = nums.every(Number.isFinite), texto = raw.every(v => Number.isNaN(Number(v)));
  const unicos = cuantitativa ? [...new Set(nums)].sort((a, b) => a - b) : [...new Set(raw)];
  if (raw.length < 2 || (!cuantitativa && !texto) || unicos.length < 2 || (texto && unicos.length !== 2)) throw new Error('Rachas requiere una secuencia numérica con variación o exactamente dos categorías de texto.');
  let corte = null, valorCorteFinal;
  if (cuantitativa && unicos.length > 2) {
    if (!['mediana', 'media', 'personalizado'].includes(p.corte)) throw new Error('Selecciona un criterio de corte válido.');
    if (p.corte === 'media') corte = nums.reduce((a, b) => a + b, 0) / nums.length;
    else if (p.corte === 'mediana') { const orden = [...nums].sort((a, b) => a - b), mitad = Math.floor(orden.length / 2); corte = orden.length % 2 ? orden[mitad] : (orden[mitad - 1] + orden[mitad]) / 2; }
    else corte = numeroHNP(p.valorCorte);
    if (!finitoHNP(corte)) throw new Error('Ingresa un valor de corte finitoHNP.');
    valorCorteFinal = p.corte === 'media' ? `Media = ${corte.toFixed(4)}` : p.corte === 'mediana' ? `Mediana = ${corte.toFixed(4)}` : `Corte personalizado = ${corte}`;
  } else valorCorteFinal = cuantitativa ? 'Separación automática (2 valores)' : `Categorías: ${unicos[0]} y ${unicos[1]}`;
  let n1 = 0, n2 = 0, rachas = 0, anterior = null;
  const formato = valor => Number(valor).toLocaleString('es-ES', { maximumFractionDigits: 4 });
  const detalleRachas = raw.map((valor, i) => {
    const v = nums[i], grupo = texto ? (valor === unicos[0] ? '+' : '-') : unicos.length === 2 ? (v === unicos[1] ? '+' : '-') : v > corte ? '+' : v < corte ? '-' : '0';
    if (grupo !== '0') { if (grupo === '+') n1++; else n2++; if (grupo !== anterior) { rachas++; anterior = grupo; } }
    return { indice: i + 1, valor, grupo, racha: grupo === '0' ? null : rachas, puntoCorte: corte,
      valorGrupo: cuantitativa && unicos.length === 2 ? (grupo === '+' ? unicos[1] : unicos[0]) : null,
      grupoDescripcion: grupo === '0' ? `Empate (= ${formato(corte)})` : texto ? `${grupo === '+' ? '+' : '−'} (${valor})`
        : unicos.length === 2 ? `${grupo === '+' ? '+' : '−'} (${formato(grupo === '+' ? unicos[1] : unicos[0])})`
          : `${grupo === '+' ? '+' : '−'} (${grupo === '+' ? '>' : '<'} ${formato(corte)})` };
  });
  validarRachas(n1, n2, rachas);
  return { tipo: 'rachas', nOriginal: raw.length, nEfectivo: n1 + n2, nIgnorados: raw.length - n1 - n2, valorCorteFinal,
    secuenciaDicotomica: detalleRachas.filter(d => d.grupo !== '0').map(d => d.grupo).join(' '), detalleRachas,
    rachasCuantitativa: cuantitativa, rachasUsaCorte: cuantitativa && unicos.length > 2,
    columnaEvaluada: columnas(receta.varSeleccionada) > 1 ? receta.varSeleccionada.nombresColumnas[p.columna ?? 0] : undefined,
    ...pruebaRachas(n1, n2, rachas, p.alpha, p.tipoPrueba) };
};
export const calcularRecetaHNP = receta => {
  if (!['matriz', 'manual'].includes(receta.modo) || !Object.prototype.hasOwnProperty.call(NOMBRES_HNP, receta.prueba)) return { error: 'Selecciona una prueba no paramétrica en matriz o manual. Las simulaciones no se guardan.' };
  try {
    const p = { ...receta.parametros, alpha: numeroHNP(receta.parametros?.alpha) };
    if (![0.1, 0.05, 0.01].includes(p.alpha)) throw new Error('Selecciona un nivel de significación válido.');
    if (receta.prueba !== 'chi_cuadrada' && !['bilateral', 'derecha', 'izquierda'].includes(p.tipoPrueba)) throw new Error('Selecciona el tipo de prueba.');
    if (receta.modo === 'matriz' && !valoresFilas(receta.filas).length) throw new Error('Selecciona o agrega datos para realizar la prueba.');
    if (receta.modo === 'matriz' && p.columna !== undefined && (!entero(p.columna) || p.columna >= columnas(receta.varSeleccionada))) throw new Error('La columna seleccionada no existe.');
    let resultados;
    if (receta.prueba === 'chi_cuadrada') {
      if (!['bondad', 'independencia'].includes(receta.subtipo)) throw new Error('Selecciona bondad de ajuste o independencia.');
      if (receta.subtipo === 'bondad') {
        const extraidos = receta.modo === 'matriz' ? extraerBondadHNP(receta.filas, receta.varSeleccionada) : null;
        if (extraidos?.errorFormatoBondad) throw new Error('Bondad admite una columna de observaciones o dos: categoría y frecuencia entera.');
        const observadas = extraidos ? extraidos.observadasExtraidas : p.observadas;
        const esperadas = p.esperadas;
        validarFrecuencias(observadas, esperadas);
        resultados = { tipo: 'chi_cuadrada', subtipo: 'bondad', observadas, esperadas,
          categorias: extraidos ? extraidos.categoriasExtraidas : p.categorias || observadas.map((_, i) => `Categoría ${i + 1}`),
          ...pruebaChiCuadradaBondad(observadas, esperadas, p.alpha) };
      } else {
        let matriz = p.matriz, nombresFilas = p.nombresFilas, nombresCols = p.nombresCols;
        if (receta.modo === 'matriz') {
          if (columnas(receta.varSeleccionada) !== 2) throw new Error('Independencia requiere exactamente dos columnas.');
          valoresColumna(receta, 0);
          const extraidos = crearMatrizContingenciaHNP(valoresFilas(receta.filas));
          matriz = extraidos.matriz; nombresFilas = extraidos.categoriasFila; nombresCols = extraidos.categoriasCol;
        }
        validarContingencia(matriz);
        if ((nombresFilas && nombresFilas.length !== matriz.length) || (nombresCols && nombresCols.length !== matriz[0].length)) throw new Error('Los nombres deben corresponder a las dimensiones de la tabla.');
        resultados = { tipo: 'chi_cuadrada', subtipo: 'independencia', matriz,
          nombresFilas: nombresFilas || matriz.map((_, i) => `Fila ${i + 1}`), nombresCols: nombresCols || matriz[0].map((_, i) => `Columna ${i + 1}`),
          ...(receta.modo === 'matriz' ? { labelV1: receta.varSeleccionada.nombresColumnas[0], labelV2: receta.varSeleccionada.nombresColumnas[1] } : {}),
          ...pruebaChiCuadradaIndependencia(matriz, p.alpha) };
      }
    } else if (receta.prueba === 'signos') {
      if (receta.modo === 'manual') {
        if (!entero(p.positivos) || !entero(p.negativos) || !entero(p.positivos + p.negativos, 1)) throw new Error('Ingresa cantidades enteras no negativas de signos, con un total mayor que cero.');
        resultados = { tipo: 'signos', ...pruebaSignosResumida(p.positivos, p.negativos, p.alpha, p.tipoPrueba) };
      } else {
        const pareada = columnas(receta.varSeleccionada) === 2, referencia = pareada ? 0 : numeroHNP(p.referencia);
        if (!finitoHNP(referencia)) throw new Error('Ingresa un valor de referencia finitoHNP.');
        const datos1 = valoresColumna(receta, pareada ? 0 : p.columna ?? 0).map(Number);
        const datos2 = pareada ? valoresColumna(receta, 1).map(Number) : [];
        if ([...datos1, ...datos2].some(v => !Number.isFinite(v))) throw new Error('Todos los datos de signos deben ser numéricos y finitos.');
        const datosAnalizados = datos1.map((v, i) => pareada ? datos2[i] - v : v);
        if (datosAnalizados.some(v => !Number.isFinite(v)) || datosAnalizados.some(v => !Number.isFinite(v - referencia))) throw new Error('Las diferencias exceden el rango numérico admitido.');
        const detalleSignos = datos1.map((dato1, i) => { const diferencia = datosAnalizados[i] - referencia;
          return { indice: i + 1, dato1, dato2: pareada ? datos2[i] : null, diferencia, signo: diferencia > 0 ? '+' : diferencia < 0 ? '−' : '0' }; });
        resultados = { tipo: 'signos', datosAnalizados, valorReferencia: referencia, detalleSignos,
          ...(pareada ? { columnasPareadas: [...receta.varSeleccionada.nombresColumnas] } : columnas(receta.varSeleccionada) > 1 ? { columnaEvaluada: receta.varSeleccionada.nombresColumnas[p.columna ?? 0] } : {}),
          ...pruebaSignos(datosAnalizados, referencia, p.alpha, p.tipoPrueba) };
      }
    } else if (receta.modo === 'matriz') resultados = calcularRachasMatriz(receta, p);
    else { validarRachas(p.n1, p.n2, p.rachas); resultados = { tipo: 'rachas', ...pruebaRachas(p.n1, p.n2, p.rachas, p.alpha, p.tipoPrueba) }; }
    if (resultados?.error) return resultados;
    if (Object.values(resultados || {}).some(v => typeof v === 'number' && !Number.isFinite(v))
      || Object.values(resultados?.calculos || {}).some(v => typeof v === 'number' && !Number.isFinite(v))
      || !finitoHNP(resultados?.estadistico) || !finitoHNP(resultados?.pValor) || resultados.pValor < 0 || resultados.pValor > 1
      || (resultados.valorCritico !== undefined && (typeof resultados.valorCritico === 'number' ? !finitoHNP(resultados.valorCritico) : Object.values(resultados.valorCritico).some(v => !finitoHNP(v))))) throw new Error('Los datos exceden el rango numérico admitido para esta prueba.');
    return { resultado: { operacion: 'Hipotesis_noparametricas', modo: receta.modo, prueba: receta.prueba, subtipo: receta.subtipo,
      nombreVariable: receta.modo === 'matriz' ? receta.varSeleccionada?.nombre : null, resultados, _entradaHNP: firmaRecetaHNP(receta) } };
  } catch (error) { return { error: error.message || 'No se pudo reconstruir la prueba no paramétrica.' }; }
};
export const validarHNPGuardable = datos => ['matriz', 'manual'].includes(datos.modoHNP) && !!datos.resultadoHipotesis
  && datos.resultadoHipotesis._entradaHNP === firmaRecetaHNP(crearRecetaHNP(datos));
export const puedeActualizarHistorialHNP = (datos, snapshot) => {
  const actual = crearRecetaHNP(datos), anterior = leerRecetaHNP(snapshot);
  return validarHNPGuardable(datos) && actual.modo === anterior.modo && actual.prueba === anterior.prueba && actual.subtipo === anterior.subtipo
    && firmaRecetaHNP(actual) !== firmaRecetaHNP(anterior);
};
