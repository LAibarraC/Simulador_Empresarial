const normalizar = valor => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
const MODOS = { matriz: 'Análisis de Matriz', manual: 'Manual', experimentos: 'Experimentos', simulacion: 'Simulación' };
const ETIQUETAS = new Set(['modo manual', 'manual', 'analisis de matriz', 'matriz sin archivo', 'experimentos', 'experimentos (encuesta)', 'simulacion', 'sin archivo', 'sin archivo registrado', 'no aplica']);
const leerSnapshot = registro => {
  let snapshot = registro.snapshot || registro.resultados_json || {};
  if (typeof snapshot === 'string') {
    try { snapshot = JSON.parse(snapshot); } catch { return {}; }
  }
  return snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot) ? snapshot : {};
};
const obtenerModoMAT251 = (snapshot, registro) => {
  const operacion = normalizar(snapshot.operacion || registro.calculo);
  let modo = snapshot.modo;
  if (!modo) {
    const t1 = snapshot.tema1 || {}, t2 = snapshot.tema2 || {}, t3 = snapshot.tema3 || {}, t5 = snapshot.tema5 || {}, t6 = snapshot.tema6 || {};
    if (operacion === 'probabilidad') modo = t1.probabilidad?.modo;
    else if (operacion === 'regla_adicion') modo = t1.reglaAdicion?.resultado?.modo || t1.reglaAdicion?.modo;
    else if (operacion === 'regla_multiplicacion') {
      const p = snapshot.parametros || t1.reglaMultiplicacion || {};
      modo = Array.isArray(p.eventos) || Array.isArray(p.resultado?.events) ? 'manual'
        : p.resultado?.modo || (p.colA !== undefined ? 'matriz' : undefined);
    } else if (['probabilidad_total', 'simulador_total'].includes(operacion)) modo = t1.simuladorTotal?.resultado?.modo;
    else if (operacion === 'dist_discreta') modo = t2.discretos?.modo;
    else if (['distribuciones_discretas', 'discretas', 'modelos_discretos'].includes(operacion)) modo = t3.discretos?.modo;
    else if (['distribuciones_continuas', 'continuas', 'modelos_continuos'].includes(operacion)) modo = t3.continuos?.modo;
    else if (operacion === 'estimacion_puntual') modo = t5.modoEstimacion;
    else if (operacion === 'estimacion_intervalos') modo = t5.modoIntervalos;
    else if (operacion === 'hipotesis_parametricas') modo = t6.modoHP;
    else if (operacion === 'hipotesis_noparametricas') modo = t6.modoHNP;
    else if (['conteo', 'dist_continua', 'tyf'].includes(operacion)) modo = 'manual';
    else if (operacion === 'distribuciones_muestrales' && snapshot.distribucion) modo = snapshot.distribucion === 'empirica' ? 'matriz' : 'manual';
  }
  const normalizado = normalizar(modo);
  if (Object.prototype.hasOwnProperty.call(MODOS, normalizado)) return normalizado;
  // Los registros antiguos también podían guardar el modo como etiqueta de origen.
  const etiqueta = normalizar(registro.archivo_origen);
  if (['modo manual', 'manual'].includes(etiqueta)) return 'manual';
  if (['analisis de matriz', 'matriz sin archivo'].includes(etiqueta)) return 'matriz';
  if (['experimentos', 'experimentos (encuesta)'].includes(etiqueta)) return 'experimentos';
  if (etiqueta === 'simulacion') return 'simulacion';
  return null;
};
export const obtenerOrigenHistorial = registro => {
  const snapshot = leerSnapshot(registro);
  const esMAT251 = String(registro.modulo || snapshot.modulo || 'MAT151').toUpperCase() === 'MAT251';
  const modo = esMAT251 ? obtenerModoMAT251(snapshot, registro) : null;
  const experimento = snapshot.experimento || snapshot.tema1?.probabilidad?.experimento;
  const esEncuesta = experimento?.fuente === 'encuesta'
    || (!experimento?.fuente && normalizar(registro.archivo_origen) === 'experimentos (encuesta)');
  const sinFuenteDeDatos = esMAT251 && (modo === 'manual' || modo === 'simulacion'
    || (modo === 'experimentos' && !esEncuesta));
  const candidatos = esMAT251
    ? [snapshot.archivo, snapshot.referenciaArchivo?.nombre, registro.archivo_origen]
    : [registro.archivo_origen, snapshot.archivo, snapshot.referenciaArchivo?.nombre];
  const archivo = sinFuenteDeDatos ? null : candidatos.find(valor => typeof valor === 'string' && valor.trim() && !ETIQUETAS.has(normalizar(valor)));
  return {
    archivoFuente: archivo?.trim() || 'Sin archivo',
    modoHistorial: !esMAT251 ? 'No aplica' : modo === 'experimentos' && esEncuesta
      ? 'Experimentos (Encuesta)' : MODOS[modo] || 'No registrado',
  };
};
