import {
  crearRecetaConteo, validarConteoGuardable, puedeActualizarHistorialConteo, crearRecetaProbabilidad,
  validarProbabilidadGuardable, puedeActualizarHistorialProbabilidad, esOperacionTotal, crearRecetaTotal,
  validarTotalGuardable, puedeActualizarHistorialTotal, crearRecetaAdicion, validarAdicionGuardable,
  puedeActualizarHistorialAdicion, crearRecetaMultiplicacion, validarMultiplicacionGuardable,
  puedeActualizarHistorialMultiplicacion,
} from './historial_Tema1';
import {
  crearRecetaDiscreta, validarDiscretaGuardable, puedeActualizarHistorialDiscreta, crearRecetaContinua,
  validarContinuaGuardable, puedeActualizarHistorialContinua,
} from './historial_Tema2';
import {
  esOperacionModelosDiscretos, crearRecetaModelosDiscretos, validarModelosDiscretosGuardable,
  puedeActualizarHistorialModelosDiscretos, esOperacionModelosContinuos, crearRecetaModelosContinuos,
  validarModelosContinuosGuardable, puedeActualizarHistorialModelosContinuos,
} from './historial_Tema3';
import {
  crearRecetaTyF, validarTyFGuardable, puedeActualizarHistorialTyF, crearRecetaMuestral,
  validarMuestralGuardable, puedeActualizarHistorialMuestral, NOMBRES_TYF, NOMBRES_MUESTRALES,
} from './historial_Tema4';
import {
  crearRecetaIntervalos, validarIntervalosGuardable, puedeActualizarHistorialIntervalos,
  crearRecetaPuntual, validarPuntualGuardable, puedeActualizarHistorialPuntual,
} from './historial_Tema5';
import {
  crearRecetaHNP, validarHNPGuardable, puedeActualizarHistorialHNP, crearRecetaHP, validarHPGuardable,
  puedeActualizarHistorialHP, NOMBRES_HNP, NOMBRES_HP,
} from './historial_Tema6';

// Archivo de origen y etiquetas de fuente
const ETIQUETAS_FUENTE = new Set([
  'Modo Manual', 'Análisis de Matriz', 'Matriz sin archivo',
  'Experimentos', 'Experimentos (Encuesta)', 'Simulación',
]);

export const obtenerArchivoRealHistorialMAT251 = (snapshot = {}, archivoGuardado) => {
  const modo = snapshot.modo || snapshot.tema1?.probabilidad?.modo;
  if (modo === 'manual' || modo === 'simulacion'
      || (modo === 'experimentos' && snapshot.experimento?.fuente !== 'encuesta')) return null;
  return [snapshot.archivo, snapshot.referenciaArchivo?.nombre, archivoGuardado]
    .find(archivo => typeof archivo === 'string' && archivo.trim()
      && !ETIQUETAS_FUENTE.has(archivo.trim())) || null;
};

export const obtenerFuenteHistorialMAT251 = (snapshot = {}, archivoGuardado) => {
  const modo = snapshot.modo || snapshot.tema1?.probabilidad?.modo;
  const archivo = obtenerArchivoRealHistorialMAT251(snapshot, archivoGuardado);
  if (archivo) return archivo;
  if (modo === 'matriz') return 'Análisis de Matriz';
  if (modo === 'experimentos') {
    return snapshot.experimento?.fuente === 'encuesta' ? 'Experimentos (Encuesta)' : 'Experimentos';
  }
  if (modo === 'simulacion') return 'Simulación';
  return 'Modo Manual';
};

// Nombres visibles de los cálculos
export const obtenerNombreProbabilidad = (subTipo) => ({
  clasica: 'Probabilidad Clásica',
  frecuentista: 'Probabilidad Frecuentista',
  condicional: 'Probabilidad Condicional',
})[String(subTipo || '').trim().toLowerCase()] || 'Probabilidad (tipo no registrado)';

export const obtenerNombreCalculoHistorial = (registro) => {
  if (registro.nombre_calculo) return registro.nombre_calculo;
  let snapshot = registro.snapshot || registro.resultados_json || {};
  if (typeof snapshot === 'string') {
    try { snapshot = JSON.parse(snapshot); } catch { snapshot = {}; }
  }
  snapshot = snapshot || {};
  const operacion = String(registro.calculo || snapshot.operacion || '').trim();
  const modulo = String(registro.modulo || snapshot.modulo || '').trim().toUpperCase();
  if (modulo === 'MAT251') {
    if (operacion.toLowerCase() === 'probabilidad') {
      return obtenerNombreProbabilidad(snapshot.subTipo || snapshot.subTipoProbabilidad || snapshot.tema1?.probabilidad?.subTipo);
    }
    if (['probabilidad_total', 'simulador_total'].includes(operacion.toLowerCase())) return 'Teorema de Probabilidad Total';
    if (operacion.toLowerCase() === 'regla_adicion') return 'Axiomas y Regla de la Adición';
    if (operacion.toLowerCase() === 'regla_multiplicacion') return 'Regla de la Multiplicación';
    if (operacion.toLowerCase() === 'conteo') return 'Técnicas de Conteo';
    if (operacion.toLowerCase() === 'dist_discreta') return 'Variables Aleatorias Discretas';
    if (operacion.toLowerCase() === 'dist_continua') return 'Calculadora de Funciones Continuas';
    if (['distribuciones_discretas', 'discretas', 'modelos_discretos'].includes(operacion.toLowerCase())) {
      const modelo = snapshot.modelo || snapshot.tema3?.discretos?.modelo;
      return ({ Bernoulli: 'Distribución de Bernoulli', Binomial: 'Distribución Binomial',
        Poisson: 'Distribución de Poisson', Hipergeometrica: 'Distribución Hipergeométrica' })[modelo] || 'Distribuciones Discretas';
    }
    if (['distribuciones_continuas', 'continuas', 'modelos_continuos'].includes(operacion.toLowerCase())) {
      const modelo = snapshot.modelo || snapshot.tema3?.continuos?.modelo;
      return ({ Uniforme: 'Distribución Uniforme', Normal: 'Distribución Normal', NormalEstandar: 'Normal Estándar',
        ChiCuadrado: 'Distribución Chi-cuadrado', FFisher: 'Distribución F de Fisher', TStudent: 'Distribución T de Student' })[modelo] || 'Distribuciones Continuas';
    }
    if (operacion.toLowerCase() === 'distribuciones_muestrales') {
      if (!snapshot.distribucion) return 'Distribuciones Muestrales (tipo no registrado)';
      if (snapshot.distribucion === 'empirica') return `Demostración Empírica: ${{ media: 'Medias', varianza: 'Varianzas', proporcion: 'Proporciones' }[snapshot.parametros?.parametroCalculo] || 'Datos'}`;
      return `Probabilidad Muestral: ${NOMBRES_MUESTRALES[snapshot.distribucion] || 'Tipo no registrado'}`;
    }
    if (operacion.toLowerCase() === 'estimacion_puntual') {
      const parametro = snapshot.parametro || snapshot.tema5?.paramEstimacion;
      return `Estimación Puntual: ${{ media: 'Media', proporcion: 'Proporción', varianza: 'Varianza' }[parametro] || 'Tipo no registrado'}`;
    }
    if (operacion.toLowerCase() === 'estimacion_intervalos') {
      const parametro = snapshot.parametro || snapshot.tema5?.paramIntervalos;
      return `Estimación por Intervalos: ${{ media: 'Media', proporcion: 'Proporción', varianza: 'Varianza' }[parametro] || 'Tipo no registrado'}`;
    }
    if (operacion.toLowerCase() === 'hipotesis_noparametricas') {
      const prueba = snapshot.prueba || snapshot.tema6?.pruebaHNP;
      const nombre = prueba === 'chi_cuadrada' ? { bondad: 'Chi-cuadrada: Bondad de Ajuste', independencia: 'Chi-cuadrada: Independencia' }[snapshot.subtipo] : NOMBRES_HNP[prueba];
      return `Hipótesis No Paramétricas: ${nombre || 'Tipo no registrado'}`;
    }
    if (operacion.toLowerCase() === 'hipotesis_parametricas') {
      return `Hipótesis Paramétricas: ${NOMBRES_HP[snapshot.prueba || snapshot.tema6?.pruebaHP] || 'Tipo no registrado'}`;
    }
    if (operacion.toLowerCase() === 'tyf') {
      const escenario = snapshot.distribucion === 'dif_medias_desc' ? { grandes: 'Muestras grandes', iguales: 'Varianzas iguales', distintas: 'Varianzas distintas' }[snapshot.parametros?.escenario] : null;
      return `T y F: ${NOMBRES_TYF[snapshot.distribucion] || 'Tipo no registrado'}${escenario ? ` - ${escenario}` : ''}`;
    }
    if (snapshot.nombreOperacion) return snapshot.nombreOperacion;
  }
  return operacion.replace(/_/g, ' ');
};

// Lectura de datos y compactación del JSON
export const leerDatosMatrizHistorial = (snapshot = {}) => {
  const datos = snapshot.datos;
  if (datos && Array.isArray(datos.valores)) {
    const agregadas = new Set(datos.agregadas || []);
    const filas = datos.valores.map((valor, indice) => ({
      id: indice + 1, valor: String(valor), origen: agregadas.has(indice) ? 'agregado' : 'cargado',
    }));
    return {
      filas,
      varSeleccionada: datos.variable ? {
        ...datos.variable, datos: [...datos.valores],
        archivoOrigen: obtenerArchivoRealHistorialMAT251(snapshot),
        hojaOrigen: Number.isInteger(snapshot.hoja) && snapshot.hoja >= 0 ? snapshot.hoja : null,
      } : null,
    };
  }
  return {
    filas: snapshot.filas || snapshot.datosSnapshot?.filas || [],
    varSeleccionada: snapshot.varSeleccionada || snapshot.datosSnapshot?.varSeleccionada || null,
  };
};

export const compactarSimulacionExperimento = (simulacion, componentes = []) => {
  if (!simulacion) return null;
  if (Array.isArray(simulacion.ensayos)) return simulacion;
  const ensayos = simulacion.historialEnsayos || [];
  if (!ensayos.length) return null;
  return {
    N: simulacion.N,
    ensayos: ensayos.map(ensayo => componentes.map(componente => ensayo.valores[componente.id])),
  };
};

export const compactarRecetaMAT251 = (receta) => {
  const operacion = String(receta.operacion || '').toLowerCase();
  if (operacion === 'dist_continua') {
    return {
      modulo: 'MAT251', operacion: 'dist_continua', modo: 'manual',
      bloques: receta.bloques, limites: receta.limites,
      ...(receta.etapa === 'constante' ? { etapa: 'constante' } : {}),
    };
  }
  const esProbabilidad = operacion === 'probabilidad';
  const esTotal = ['probabilidad_total', 'simulador_total'].includes(operacion);
  const esAdicion = operacion === 'regla_adicion';
  const esMultiplicacion = operacion === 'regla_multiplicacion';
  const esDiscreta = operacion === 'dist_discreta';
  const esMuestral = operacion === 'distribuciones_muestrales';
  const esTyF = operacion === 'tyf';
  const esPuntual = operacion === 'estimacion_puntual';
  const esIntervalos = operacion === 'estimacion_intervalos';
  const esHP = operacion === 'hipotesis_parametricas';
  const esHNP = operacion === 'hipotesis_noparametricas';
  const esModeloDiscreto = ['distribuciones_discretas', 'discretas', 'modelos_discretos'].includes(operacion);
  const esModeloContinuo = ['distribuciones_continuas', 'continuas', 'modelos_continuos'].includes(operacion);
  if (!esHNP && !esHP && !esIntervalos && !esTyF && !esPuntual && !esMuestral && !esProbabilidad && !esTotal && !esAdicion && !esMultiplicacion && !esDiscreta && !esModeloDiscreto && !esModeloContinuo) {
    const copia = { ...receta };
    delete copia.version;
    return copia;
  }

  const salida = { modulo: 'MAT251', operacion: receta.operacion, modo: receta.modo };
  if (esProbabilidad) salida.subTipo = receta.subTipo;
  const usaDatos = receta.modo === 'matriz'
    || (receta.modo === 'experimentos' && receta.experimento?.fuente === 'encuesta');
  if (usaDatos) {
    const { filas, varSeleccionada } = leerDatosMatrizHistorial(receta);
    const variable = varSeleccionada ? Object.fromEntries(
      ['id', 'nombre', 'tipo', 'nombresColumnas', 'esCombinada']
        .filter(clave => varSeleccionada[clave] !== undefined)
        .map(clave => [clave, varSeleccionada[clave]])
    ) : null;
    salida.datos = { valores: filas.map(fila => String(fila.valor ?? '')) };
    const agregadas = filas.flatMap((fila, indice) => fila.origen === 'agregado' ? [indice] : []);
    if (agregadas.length) salida.datos.agregadas = agregadas;
    if (variable) salida.datos.variable = variable;
    if (receta.nombreEncabezadoManual) salida.nombreEncabezadoManual = receta.nombreEncabezadoManual;
    // El origen de la tarjeta tiene prioridad sobre otro archivo abierto en la calculadora.
    const tieneOrigenTarjeta = varSeleccionada && Object.prototype.hasOwnProperty.call(varSeleccionada, 'archivoOrigen');
    const archivo = tieneOrigenTarjeta
      ? obtenerArchivoRealHistorialMAT251({ archivo: varSeleccionada.archivoOrigen })
      : obtenerArchivoRealHistorialMAT251(receta);
    if (archivo) {
      salida.archivo = archivo;
      salida.hoja = tieneOrigenTarjeta ? varSeleccionada.hojaOrigen ?? 0 : receta.hoja ?? 0;
    }
  }
  if (esHP || esHNP) {
    salida.prueba = receta.prueba;
    if (esHNP && receta.prueba === 'chi_cuadrada') salida.subtipo = receta.subtipo;
    salida.parametros = receta.parametros;
  } else if (esPuntual || esIntervalos) {
    salida.parametro = receta.parametro;
    if (esIntervalos) salida.confianza = receta.confianza;
    if (Object.keys(receta.parametros || {}).length) salida.parametros = receta.parametros;
  } else if (esMuestral || esTyF) {
    salida.distribucion = receta.distribucion;
    salida.parametros = receta.parametros;
    if (receta.condicion) salida.condicion = receta.condicion;
  } else if (esModeloContinuo) {
    salida.modelo = receta.modelo;
    if (receta.calcMode === 'inversa') salida.calcMode = 'inversa';
    if (receta.modelo !== 'NormalEstandar') {
      if (receta.modo === 'manual') salida.parametros = receta.parametros;
      else salida.estimacion = receta.estimacion;
    }
    if (receta.condicion) salida.condicion = receta.condicion;
  } else if (esModeloDiscreto) {
    salida.modelo = receta.modelo;
    if (receta.modo === 'manual') salida.parametros = receta.parametros;
    else salida.estimacion = receta.estimacion;
    if (receta.condicion) salida.condicion = receta.condicion;
  } else if (esDiscreta) {
    if (receta.modo === 'manual') salida.tabla = receta.tabla;
    else salida.columna = receta.columna;
    const vista = receta.vista || { ordenMomento: 1, propA: 2, propB: 3 };
    if (Number(vista.ordenMomento) !== 1 || Number(vista.propA) !== 2 || Number(vista.propB) !== 3) {
      salida.vista = { ordenMomento: Number(vista.ordenMomento), propA: Number(vista.propA), propB: Number(vista.propB) };
    }
  } else if (esAdicion || esMultiplicacion) {
    salida.parametros = receta.parametros;
  } else if (esProbabilidad && receta.modo === 'matriz') {
    if (receta.columna) salida.columna = receta.columna;
    salida.eventoFavorable = receta.eventoFavorable;
    if (receta.subTipo === 'condicional') salida.eventoCondicion = receta.eventoCondicion;
  } else if (esProbabilidad && receta.modo === 'manual') {
    salida.parametros = receta.parametros;
  } else if (esProbabilidad && receta.modo === 'experimentos') {
    const exp = receta.experimento;
    salida.experimento = {
      fuente: exp.fuente,
      tipoExperimento: exp.tipoExperimento,
      reglas: exp.reglas,
    };
    if (exp.fuente === 'teorico') {
      salida.experimento.componentes = exp.componentes.map(({ id, nombre, eventos }) => ({ id, nombre, eventos }));
    } else if (exp.usarFrecuencias) {
      salida.experimento.usarFrecuencias = true;
      if (exp.columnaFrecuenciaSeleccionada) salida.experimento.columnaFrecuenciaSeleccionada = exp.columnaFrecuenciaSeleccionada;
    }
    if (exp.iteracionesSim) salida.experimento.iteracionesSim = exp.iteracionesSim;
    const simulacion = compactarSimulacionExperimento(exp.resultadoSimulacion || exp.simulacion, exp.componentes);
    if (simulacion) {
      salida.experimento.simulacion = simulacion;
      salida.experimento.velocidadSim = exp.velocidadSim || '1x';
    }
  } else if (esTotal && receta.modo === 'manual') {
    salida.ramasManuales = receta.ramasManuales;
  } else if (esTotal && receta.modo === 'matriz') {
    salida.colCausa = receta.colCausa;
    salida.colEvento = receta.colEvento;
    salida.valExito = receta.valExito;
  }
  if (esTotal && receta.causasBayes?.length) salida.causasBayes = receta.causasBayes;
  return salida;
};

/**
 * Coordinador del historial de MAT251: delega las operaciones en los seis temas.
 * Guarda la configuración activa, sus entradas y los datos usados. Experimentos reconstruye sus resultados y conserva solo los valores de los ensayos aleatorios.
 * Solo registra un archivo cuando el cálculo usa datos de matriz o encuesta.
 */

// Determinar el número de tema a partir de la operación
export const obtenerTemaPorOperacion = (operacion) => {
  const op = (operacion || "").toLowerCase();
  if (["conteo", "probabilidad", "probabilidad_total", "simulador_total", "regla_adicion", "regla_multiplicacion", "muestreo", "dist_uniforme"].includes(op)) {
    return 1;
  }
  if (["dist_discreta", "dist_continua", "dist_continua_v2"].includes(op)) {
    return 2;
  }
  if (["distribuciones_discretas", "discretas", "modelos_discretos", "distribuciones_continuas", "continuas", "modelos_continuos"].includes(op)) {
    return 3;
  }
  if (["distribuciones_muestrales", "tyf", "tamanio_muestra", "probabilidad_muestral"].includes(op)) {
    return 4;
  }
  if (["estimacion_puntual", "estimacion_intervalos"].includes(op)) {
    return 5;
  }
  if (["hipotesis_parametricas", "hipotesis_noparametricas"].includes(op)) {
    return 6;
  }
  return 1;
};

/**
 * Empaqueta única y exclusivamente la receta activa del cálculo.
 */
export const empaquetarRecetaMAT251 = (datos) => {
  const operacion = datos.operacion || "";
  const op = operacion.toLowerCase();
  const tema = obtenerTemaPorOperacion(operacion);

  const receta = {
    modulo: "MAT251",
    tema,
    operacion,
    nombreOperacion: datos.nombreOperacion || operacion,
  };

  // Helper para asignar archivo únicamente si se usó modo matriz y existe archivo real
  const asignarArchivoSiEsMatriz = (esModoMatriz) => {
    if (esModoMatriz && datos.selectedFile) {
      receta.archivo = datos.selectedFile;
      receta.hoja = datos.selectedSheet ?? 0;
    } else {
      receta.archivo = null;
    }
  };

  // --- TEMA 1 ---
  if (op === "conteo") return crearRecetaConteo(datos);

  if (op === "probabilidad") return crearRecetaProbabilidad(datos);

  if (esOperacionTotal(op)) return crearRecetaTotal(datos);

  if (op === "regla_adicion") return crearRecetaAdicion(datos);

  if (op === "regla_multiplicacion") return crearRecetaMultiplicacion(datos);

  if (op === "muestreo") {
    receta.modo = "manual";
    receta.archivo = null;
    receta.parametros = {
      metodo: datos.metodoMuestreo,
      tamano: datos.tamanoMuestra,
      varEstratificacion: datos.varEstratificacion,
    };
    return receta;
  }

  if (op === "dist_uniforme") {
    receta.modo = "manual";
    receta.archivo = null;
    receta.parametros = {
      variable: datos.varUniforme,
      min: datos.inputMin,
      max: datos.inputMax,
    };
    return receta;
  }

  // --- TEMA 2 ---
  if (op === "dist_discreta") return crearRecetaDiscreta(datos);
  if (op === "dist_continua") return crearRecetaContinua(datos);
  if (op === "dist_continua_v2") {
    receta.modo = "matriz";
    asignarArchivoSiEsMatriz(true);
    receta.filas = datos.filas;
    receta.varSeleccionada = datos.varSeleccionada;
    return receta;
  }

  // --- TEMA 3 ---
  if (esOperacionModelosContinuos(op)) return crearRecetaModelosContinuos(datos);

  if (esOperacionModelosDiscretos(op)) return crearRecetaModelosDiscretos(datos);

  // --- TEMA 4 ---
  if (op === 'tyf') return crearRecetaTyF(datos);
  if (op === 'distribuciones_muestrales') return crearRecetaMuestral(datos);
  if (["distribuciones_muestrales", "tyf", "tamanio_muestra", "probabilidad_muestral"].includes(op)) {
    receta.modo = "matriz";
    asignarArchivoSiEsMatriz(true);
    receta.filas = datos.filas;
    receta.varSeleccionada = datos.varSeleccionada;
    return receta;
  }

  // --- TEMA 5 ---
  if (op === 'estimacion_puntual') return crearRecetaPuntual(datos);

  if (op === 'estimacion_intervalos') return crearRecetaIntervalos(datos);

  // --- TEMA 6 ---
  if (op === 'hipotesis_parametricas') return crearRecetaHP(datos);

  if (op === 'hipotesis_noparametricas') return crearRecetaHNP(datos);

  return receta;
};

/**
 * Valida si hay datos mínimos para guardar en la operación activa
 */
export const validarRecetaGuardableMAT251 = (datos) => {
  if (!datos || !datos.operacion) return false;
  const op = datos.operacion.toLowerCase();

  if (op === 'hipotesis_noparametricas') return validarHNPGuardable(datos);
  if (op === 'hipotesis_parametricas') return validarHPGuardable(datos);
  if (op === 'tyf') return validarTyFGuardable(datos);
  if (op === 'estimacion_puntual') return validarPuntualGuardable(datos);
  if (op === 'estimacion_intervalos') return validarIntervalosGuardable(datos);
  if (op === 'distribuciones_muestrales') return validarMuestralGuardable(datos);
  if (op === 'dist_continua') return validarContinuaGuardable(datos);
  if (op === 'dist_discreta') return validarDiscretaGuardable(datos);
  if (op === 'regla_multiplicacion') return validarMultiplicacionGuardable(datos);
  if (op === 'regla_adicion') return validarAdicionGuardable(datos);
  if (esOperacionTotal(op)) return validarTotalGuardable(datos);
  if (op === "probabilidad") return validarProbabilidadGuardable(datos);
  if (op === "conteo") return validarConteoGuardable(datos);
  if (esOperacionModelosContinuos(op)) return validarModelosContinuosGuardable(datos);
  if (esOperacionModelosDiscretos(op)) return validarModelosDiscretosGuardable(datos);
  return true;
};

export const puedeActualizarHistorialMAT251 = (datos, snapshot) => (
  datos?.operacion?.toLowerCase() === 'hipotesis_noparametricas' ? puedeActualizarHistorialHNP(datos, snapshot)
  : datos?.operacion?.toLowerCase() === 'hipotesis_parametricas' ? puedeActualizarHistorialHP(datos, snapshot)
  : datos?.operacion?.toLowerCase() === 'tyf' ? puedeActualizarHistorialTyF(datos, snapshot)
  : datos?.operacion?.toLowerCase() === 'estimacion_puntual' ? puedeActualizarHistorialPuntual(datos, snapshot)
  : datos?.operacion?.toLowerCase() === 'estimacion_intervalos' ? puedeActualizarHistorialIntervalos(datos, snapshot)
  : datos?.operacion?.toLowerCase() === 'distribuciones_muestrales' ? puedeActualizarHistorialMuestral(datos, snapshot)
  : esOperacionModelosContinuos(datos?.operacion) ? puedeActualizarHistorialModelosContinuos(datos, snapshot)
  : esOperacionModelosDiscretos(datos?.operacion) ? puedeActualizarHistorialModelosDiscretos(datos, snapshot)
  : datos?.operacion?.toLowerCase() === 'dist_continua' ? puedeActualizarHistorialContinua(datos, snapshot)
  : datos?.operacion?.toLowerCase() === 'dist_discreta' ? puedeActualizarHistorialDiscreta(datos, snapshot)
  : datos?.operacion?.toLowerCase() === 'regla_multiplicacion' ? puedeActualizarHistorialMultiplicacion(datos, snapshot)
  : datos?.operacion?.toLowerCase() === 'regla_adicion' ? puedeActualizarHistorialAdicion(datos, snapshot)
  : esOperacionTotal(datos?.operacion) ? puedeActualizarHistorialTotal(datos, snapshot)
  : datos?.operacion?.toLowerCase() === 'probabilidad'
    ? puedeActualizarHistorialProbabilidad(datos, snapshot)
    : puedeActualizarHistorialConteo(datos, snapshot)
);

export const deserializarValoresEspeciales = (val) => val;
export const serializarValoresEspeciales = (val) => val;

// Se conserva esta exportación pública para los consumidores existentes.
export { puedeActualizarHistorialConteo } from './historial_Tema1';
