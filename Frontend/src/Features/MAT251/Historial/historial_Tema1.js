// Historial del Tema 1: Conteo y reglas de probabilidad.
import {
  validarParametrosConteo, coincideConteoConEntradas, calcularProbabilidadClasica,
  calcularProbabilidadCondicional, calcularProbabilidadTotal, calcularReglaAdicion,
  calcularReglaMultiplicacion,
} from '../Matematicas/logica_Tema1';
import {
  obtenerArchivoRealHistorialMAT251, obtenerNombreProbabilidad, leerDatosMatrizHistorial,
  compactarSimulacionExperimento,
} from './historialMAT251';

// Técnicas de Conteo
export const crearRecetaConteo = datos => ({
  modulo: 'MAT251',
  tema: 1,
  operacion: datos.operacion || '',
  nombreOperacion: datos.nombreOperacion || datos.operacion || '',
  modo: 'manual',
  archivo: null,
  parametros: {
    n: datos.n,
    r: datos.r,
    tipoElementos: datos.tipoElementos,
    customElementsInput: datos.customElementsInput || '',
  },
});

export const validarConteoGuardable = datos => validarParametrosConteo(datos.n, datos.r)
  && coincideConteoConEntradas(datos.resConteo, datos)
  && Number.isFinite(datos.resConteo.permutacion?.resultado)
  && Number.isFinite(datos.resConteo.combinacion?.resultado);

// Comparar las entradas efectivas, sin contar diferencias de formato ni texto
// personalizado que no se está usando en el tipo de elementos activo.
export const puedeActualizarHistorialConteo = (datos, snapshot) => {
  const guardados = snapshot?.parametros || snapshot?.tema1?.conteo;
  if (!guardados || datos?.operacion?.toLowerCase() !== "conteo"
      || !validarConteoGuardable(datos)) return false;

  const normalizar = (parametros) => {
    const tipo = parametros.tipoElementos || "letras";
    return JSON.stringify({
      n: Number(parametros.n),
      r: Number(parametros.r),
      tipoElementos: tipo,
      elementos: tipo === "personalizado"
        ? (parametros.customElementsInput || "").split(",").map(el => el.trim()).filter(Boolean)
        : [],
    });
  };
  return normalizar(datos) !== normalizar(guardados);
};

// Cálculo de Probabilidad
export const crearRecetaProbabilidad = (datos) => {
  const modo = datos.inputModeProb || 'matriz';
  const experimento = datos.datosExperimento;
  const usaDatos = modo === 'matriz' || (modo === 'experimentos' && experimento?.fuente === 'encuesta');
  return {
    modulo: 'MAT251',
    tema: 1,
    operacion: 'probabilidad',
    nombreOperacion: obtenerNombreProbabilidad(datos.subTipoProbabilidad),
    subTipo: datos.subTipoProbabilidad || 'clasica',
    modo,
    archivo: usaDatos ? obtenerArchivoRealHistorialMAT251({}, datos.selectedFile) : null,
    hoja: usaDatos ? datos.selectedSheet ?? 0 : null,
    columna: modo === 'matriz' ? datos.colProbClasica || '' : '',
    eventoFavorable: modo === 'matriz' ? datos.eventoFavorable || [] : [],
    eventoCondicion: modo === 'matriz' ? datos.eventoCondicion || [] : [],
    filas: usaDatos ? datos.filas || [] : [],
    varSeleccionada: usaDatos ? datos.varSeleccionada || null : null,
    nombreEncabezadoManual: usaDatos ? datos.nombreEncabezadoManual || '' : '',
    parametros: modo === 'manual' ? { manualN: datos.manualN ?? '', manualF: datos.manualF ?? '' } : null,
    experimento: modo === 'experimentos' && experimento ? {
      fuente: experimento.fuente,
      tipoExperimento: experimento.tipoExperimento,
      componentes: experimento.componentes,
      reglas: experimento.reglas,
      usarFrecuencias: experimento.usarFrecuencias || false,
      columnaFrecuenciaSeleccionada: experimento.columnaFrecuenciaSeleccionada || '',
      iteracionesSim: experimento.iteracionesSim || '',
      simulacion: compactarSimulacionExperimento(experimento.resultadoSimulacion, experimento.componentes),
      velocidadSim: experimento.velocidadSim || '1x',
    } : null,
  };
};

export const leerRecetaProbabilidad = (snapshot) => {
  const legado = snapshot.tema1?.probabilidad || {};
  return {
    ...snapshot,
    operacion: 'probabilidad',
    subTipo: snapshot.subTipo || legado.subTipo || 'clasica',
    modo: snapshot.modo || legado.modo || 'matriz',
    columna: snapshot.columna ?? legado.columna ?? '',
    eventoFavorable: snapshot.eventoFavorable || legado.favorables || [],
    eventoCondicion: snapshot.eventoCondicion || legado.condicion || [],
    ...leerDatosMatrizHistorial(snapshot),
    parametros: snapshot.parametros || legado.parametros || null,
    nombreEncabezadoManual: snapshot.nombreEncabezadoManual || '',
  };
};

export const firmaRecetaProbabilidad = (receta) => JSON.stringify({
  subTipo: receta.subTipo,
  modo: receta.modo,
  columna: receta.columna || '',
  favorables: [...(receta.eventoFavorable || [])].sort(),
  condicion: [...(receta.eventoCondicion || [])].sort(),
  filas: (receta.filas || []).map(fila => String(fila.valor ?? '').trim()).filter(Boolean),
  variable: receta.varSeleccionada ? {
    nombre: receta.varSeleccionada.nombre,
    nombresColumnas: receta.varSeleccionada.nombresColumnas,
  } : null,
  encabezado: receta.nombreEncabezadoManual || '',
  parametros: receta.modo === 'manual' ? {
    manualN: Number(receta.parametros?.manualN),
    manualF: Number(receta.parametros?.manualF),
  } : null,
  experimento: receta.experimento ? {
    fuente: receta.experimento.fuente,
    tipo: receta.experimento.tipoExperimento,
    componentes: receta.experimento.fuente === 'teorico' ? receta.experimento.componentes : undefined,
    reglas: receta.experimento.reglas,
    usarFrecuencias: !!receta.experimento.usarFrecuencias,
    columnaFrecuencia: receta.experimento.columnaFrecuenciaSeleccionada || '',
    iteracionesSim: receta.experimento.iteracionesSim || '',
    simulacion: compactarSimulacionExperimento(receta.experimento.resultadoSimulacion || receta.experimento.simulacion, receta.experimento.componentes),
  } : null,
});

export const calcularRecetaProbabilidad = (receta) => {
  if (!['clasica', 'frecuentista', 'condicional'].includes(receta.subTipo)) return null;
  let resultado;
  if (receta.modo === 'manual') {
    const nTexto = String(receta.parametros?.manualN ?? '').trim();
    const fTexto = String(receta.parametros?.manualF ?? '').trim();
    const n = Number(nTexto);
    const f = Number(fTexto);
    if (!nTexto || !fTexto || !Number.isFinite(n) || !Number.isFinite(f) || n <= 0 || f < 0 || f > n) return null;
    if (receta.subTipo === 'condicional') {
      if (n > 1 || f > 1) return null;
    } else if (!Number.isSafeInteger(n) || !Number.isSafeInteger(f)) return null;
    resultado = {
      casosFavorables: f, casosTotales: n,
      probabilidadDecimal: (f / n).toFixed(4),
      probabilidadPorcentaje: (100 * f / n).toFixed(2),
      arrFiltrado: [],
    };
  } else if (receta.modo === 'matriz') {
    let valores = (receta.filas || []).map(fila => String(fila.valor ?? '').trim()).filter(Boolean);
    const columnas = receta.varSeleccionada?.nombresColumnas;
    if (receta.subTipo !== 'condicional' && columnas?.length > 1 && receta.columna) {
      const indice = columnas.indexOf(receta.columna);
      if (indice < 0) return null;
      valores = valores.map(valor => valor.split(' | ')[indice]?.trim()).filter(Boolean);
    }
    if (!valores.length || !receta.eventoFavorable?.length) return null;
    resultado = receta.subTipo === 'condicional'
      ? calcularProbabilidadCondicional(valores, receta.eventoFavorable, receta.eventoCondicion)
      : calcularProbabilidadClasica(valores, receta.eventoFavorable);
  }
  if (!resultado || resultado.error) return null;
  return { ...resultado, _entradaProbabilidad: firmaRecetaProbabilidad(receta) };
};

export const validarProbabilidadGuardable = (datos) => {
  const receta = crearRecetaProbabilidad(datos);
  if (receta.modo === 'experimentos') {
    const resultado = datos.datosExperimento?.resultado;
    return receta.subTipo === 'clasica' && !datos.datosExperimento?.simulando
      && !!resultado && Number.isFinite(resultado.total) && resultado.total > 0
      && Number.isFinite(resultado.cantidadFavorable)
      && resultado.cantidadFavorable >= 0 && resultado.cantidadFavorable <= resultado.total;
  }
  const resultado = datos.resProbabilidad;
  return ['matriz', 'manual'].includes(receta.modo) && !!resultado
    && Number.isFinite(resultado.casosFavorables) && Number.isFinite(resultado.casosTotales)
    && resultado.casosTotales > 0 && resultado.casosFavorables >= 0
    && resultado.casosFavorables <= resultado.casosTotales
    && resultado._entradaProbabilidad === firmaRecetaProbabilidad(receta);
};

export const puedeActualizarHistorialProbabilidad = (datos, snapshot) => (
  validarProbabilidadGuardable(datos)
  && firmaRecetaProbabilidad(crearRecetaProbabilidad(datos))
    !== firmaRecetaProbabilidad(leerRecetaProbabilidad(snapshot))
);

// Teorema de Probabilidad Total
export const esOperacionTotal = (operacion) => ['probabilidad_total', 'simulador_total'].includes(
  String(operacion || '').toLowerCase()
);

export const crearRecetaTotal = (datos) => {
  const modo = datos.modoTotal || 'matriz';
  return {
    modulo: 'MAT251', tema: 1,
    operacion: datos.operacion || 'Probabilidad_Total',
    nombreOperacion: 'Teorema de Probabilidad Total',
    modo,
    archivo: modo === 'matriz' ? obtenerArchivoRealHistorialMAT251({}, datos.selectedFile) : null,
    hoja: modo === 'matriz' ? datos.selectedSheet ?? 0 : null,
    filas: modo === 'matriz' ? datos.filas || [] : [],
    varSeleccionada: modo === 'matriz' ? datos.varSeleccionada || null : null,
    nombreEncabezadoManual: modo === 'matriz' ? datos.nombreEncabezadoManual || '' : '',
    colCausa: modo === 'matriz' ? datos.colCausa || '' : '',
    colEvento: modo === 'matriz' ? datos.colEvento || '' : '',
    valExito: modo === 'matriz' ? String(datos.valExito ?? '') : '',
    ramasManuales: modo === 'manual' ? datos.ramasManualesTotal || [] : [],
    causasBayes: [...new Set(datos.causasBayesTotal || [])],
  };
};

export const leerRecetaTotal = (snapshot) => {
  const legado = snapshot.tema1?.simuladorTotal || {};
  const resultado = legado.resultado || {};
  const modo = Array.isArray(snapshot.ramasManuales) || snapshot.datos ? snapshot.modo
    : resultado.modo || (snapshot.ramas?.some(rama => rama.totalDatos > 0) ? 'matriz' : snapshot.modo) || 'matriz';
  return {
    ...snapshot,
    modo,
    ...leerDatosMatrizHistorial(snapshot),
    nombreEncabezadoManual: snapshot.nombreEncabezadoManual || '',
    colCausa: snapshot.colCausa || resultado.colCausa || '',
    colEvento: snapshot.colEvento || resultado.colEvento || '',
    valExito: snapshot.valExito ?? resultado.valExito ?? '',
    ramasManuales: snapshot.ramasManuales || (resultado.modo === 'manual'
      ? (resultado.desglose || []).map(r => ({ id: r.id, name: r.nombre, pA: String(r.pA), pBA: String(r.pB_A) }))
      : []),
    causasBayes: snapshot.causasBayes || resultado.causasBayes || [],
  };
};

export const firmaEntradasTotal = (receta) => JSON.stringify({
  modo: receta.modo,
  filas: receta.modo === 'matriz'
    ? (receta.filas || []).map(f => String(f.valor ?? '').trim()).filter(Boolean) : [],
  columnas: receta.modo === 'matriz' ? receta.varSeleccionada?.nombresColumnas || [] : [],
  colCausa: receta.colCausa || '',
  colEvento: receta.colEvento || '',
  valExito: String(receta.valExito ?? ''),
  ramas: receta.modo === 'manual' ? (receta.ramasManuales || []).map(r => ({
    nombre: String(r.name || '').trim(), pA: Number(r.pA), pBA: Number(r.pBA),
  })) : [],
});

export const firmaRecetaTotal = (receta) => JSON.stringify({
  entradas: firmaEntradasTotal(receta),
  causasBayes: [...(receta.causasBayes || [])].sort(),
});

export const calcularRecetaTotal = (receta) => {
  let resultado;
  if (receta.modo === 'matriz') {
    const columnas = receta.varSeleccionada?.nombresColumnas || [];
    if (columnas.length < 2 || !columnas.includes(receta.colCausa) || !columnas.includes(receta.colEvento)
        || receta.colCausa === receta.colEvento || String(receta.valExito ?? '').trim() === '') {
      return { error: 'Selecciona una matriz con dos columnas distintas para causa y evento, y el valor de éxito.' };
    }
    const calculo = calcularProbabilidadTotal(receta.filas || [], columnas, receta.colCausa, receta.colEvento, String(receta.valExito));
    if (calculo.error) return calculo;
    resultado = calculo.resultado;
  } else if (receta.modo === 'manual') {
    const ramas = receta.ramasManuales || [];
    if (ramas.length < 2) return { error: 'Ingresa al menos dos causas.' };
    const nombres = ramas.map(r => String(r.name || '').trim());
    if (nombres.some(nombre => !nombre) || new Set(nombres).size !== nombres.length) {
      return { error: 'Cada causa debe tener un nombre distinto y no vacío.' };
    }
    if (ramas.some(r => [r.pA, r.pBA].some(valor => String(valor ?? '').trim() === ''
        || !Number.isFinite(Number(valor)) || Number(valor) < 0 || Number(valor) > 1))) {
      return { error: 'Completa todas las probabilidades con números entre 0 y 1.' };
    }
    const suma = ramas.reduce((total, r) => total + Number(r.pA), 0);
    if (Math.abs(suma - 1) > 0.0001) return { error: 'La suma de P(B_i) debe ser 1 (100%).' };
    const desglose = ramas.map((r, indice) => ({
      id: r.id ?? indice + 1, nombre: nombres[indice],
      n_Ai: 0, totalDatos: 0, n_B_dado_Ai: 0,
      pA: Number(r.pA), pB_A: Number(r.pBA), mult: Number(r.pA) * Number(r.pBA),
    }));
    resultado = { probB: desglose.reduce((total, r) => total + r.mult, 0), desglose };
  } else return { error: 'Modo de probabilidad total inválido.' };

  const causas = new Set(resultado.desglose.map(r => r.nombre));
  return { resultado: {
    ...resultado, modo: receta.modo,
    colCausa: receta.colCausa, colEvento: receta.colEvento, valExito: receta.valExito,
    causasBayes: resultado.probB > 0 ? (receta.causasBayes || []).filter(causa => causas.has(causa)) : [],
    _entradaTotal: firmaEntradasTotal(receta),
  } };
};

export const validarTotalGuardable = (datos) => {
  const resultado = datos.resultadoSimulador;
  return !!resultado && Number.isFinite(resultado.probB) && resultado.probB >= 0
    && Array.isArray(resultado.desglose) && resultado.desglose.length > 0
    && resultado._entradaTotal === firmaEntradasTotal(crearRecetaTotal(datos));
};

export const puedeActualizarHistorialTotal = (datos, snapshot) => (
  validarTotalGuardable(datos)
  && firmaRecetaTotal(crearRecetaTotal(datos)) !== firmaRecetaTotal(leerRecetaTotal(snapshot))
);

// Axiomas y Regla de la Adición
export const crearRecetaAdicion = (datos) => {
  const modo = datos.modoAdicion || 'matriz';
  const manual = datos.manualAdicion || {};
  return {
    modulo: 'MAT251', operacion: 'regla_adicion', modo,
    parametros: modo === 'manual' ? {
      nameA: manual.nameA,
      nameB: manual.nameB,
      pA: manual.pA,
      pB: manual.pB,
      pAB: manual.pAB,
    } : {
      colA: datos.colA_Adicion || '', valA: String(datos.valA_Adicion ?? ''),
      colB: datos.colB_Adicion || '', valB: String(datos.valB_Adicion ?? ''),
    },
    filas: modo === 'matriz' ? datos.filas || [] : [],
    varSeleccionada: modo === 'matriz' ? datos.varSeleccionada || null : null,
    nombreEncabezadoManual: modo === 'matriz' ? datos.nombreEncabezadoManual || '' : '',
    archivo: modo === 'matriz' ? obtenerArchivoRealHistorialMAT251({}, datos.selectedFile) : null,
    hoja: modo === 'matriz' ? datos.selectedSheet ?? 0 : null,
  };
};

export const leerRecetaAdicion = (snapshot) => {
  const legado = snapshot.tema1?.reglaAdicion || {};
  const parametros = snapshot.parametros || legado;
  const modo = legado.resultado?.modo
    || (Object.prototype.hasOwnProperty.call(parametros, 'colA') ? 'matriz' : snapshot.modo || 'manual');
  return {
    ...snapshot, modo,
    parametros: modo === 'manual' ? {
      nameA: parametros.nameA ?? 'A', nameB: parametros.nameB ?? 'B',
      pA: parametros.pA ?? '', pB: parametros.pB ?? '', pAB: parametros.pAB ?? '',
    } : {
      colA: parametros.colA || '', valA: String(parametros.valA ?? ''),
      colB: parametros.colB || '', valB: String(parametros.valB ?? ''),
    },
    ...leerDatosMatrizHistorial(snapshot),
    nombreEncabezadoManual: snapshot.nombreEncabezadoManual || '',
  };
};

export const firmaRecetaAdicion = (receta) => JSON.stringify({
  modo: receta.modo,
  nombreVariable: receta.modo === 'matriz' ? receta.varSeleccionada?.nombre || '' : '',
  parametros: receta.modo === 'manual' ? {
    nameA: String(receta.parametros.nameA || 'A').trim() || 'A',
    nameB: String(receta.parametros.nameB || 'B').trim() || 'B',
    pA: Number(receta.parametros.pA), pB: Number(receta.parametros.pB), pAB: Number(receta.parametros.pAB),
  } : receta.parametros,
  filas: receta.modo === 'matriz' ? (receta.filas || []).map(f => String(f.valor ?? '').trim()).filter(Boolean) : [],
  columnas: receta.modo === 'matriz' ? (receta.varSeleccionada?.nombresColumnas?.length ? receta.varSeleccionada.nombresColumnas : ['Valores']) : [],
});

export const calcularRecetaAdicion = (receta) => {
  const p = receta.parametros || {};
  let resultado;
  if (receta.modo === 'manual') {
    const textos = [p.pA, p.pB, p.pAB];
    if (textos.some(valor => String(valor ?? '').trim() === '' || !Number.isFinite(Number(valor))
        || Number(valor) < 0 || Number(valor) > 1)) {
      return { error: 'Completa P(A), P(B) y P(A ∩ B) con números entre 0 y 1.' };
    }
    const [pA, pB, pAandB] = textos.map(Number);
    if (pAandB > Math.min(pA, pB) || pAandB < Math.max(0, pA + pB - 1) - 1e-12) {
      return { error: 'La intersección debe estar entre máx(0, P(A) + P(B) − 1) y mín(P(A), P(B)).' };
    }
    resultado = {
      nameA: String(p.nameA || 'A').trim() || 'A', nameB: String(p.nameB || 'B').trim() || 'B',
      pA, pB, pAandB, pAorB: Math.min(1, Math.max(0, pA + pB - pAandB)),
      countA: '-', countB: '-', countAandB: '-', total: '-',
    };
  } else if (receta.modo === 'matriz') {
    const columnas = receta.varSeleccionada?.nombresColumnas?.length ? receta.varSeleccionada.nombresColumnas : ['Valores'];
    if (!columnas.includes(p.colA) || !columnas.includes(p.colB) || p.colA === p.colB
        || String(p.valA ?? '').trim() === '' || String(p.valB ?? '').trim() === '') {
      return { error: 'Selecciona columnas distintas y los valores de los eventos A y B.' };
    }
    const calculo = calcularReglaAdicion(receta.filas || [], columnas, p.colA, String(p.valA), p.colB, String(p.valB));
    if (calculo.error) return calculo;
    resultado = { ...calculo.resultado, ...p, pAorB: Math.min(1, Math.max(0, calculo.resultado.pAorB)) };
  } else return { error: 'Modo de adición inválido.' };
  return { resultado: { ...resultado, modo: receta.modo, _entradaAdicion: firmaRecetaAdicion(receta) } };
};

export const validarAdicionGuardable = (datos) => (
  !!datos.resultadoAdicion && Number.isFinite(datos.resultadoAdicion.pAorB)
  && datos.resultadoAdicion.pAorB >= 0 && datos.resultadoAdicion.pAorB <= 1
  && datos.resultadoAdicion._entradaAdicion === firmaRecetaAdicion(crearRecetaAdicion(datos))
);

export const puedeActualizarHistorialAdicion = (datos, snapshot) => (
  validarAdicionGuardable(datos)
  && firmaRecetaAdicion(crearRecetaAdicion(datos)) !== firmaRecetaAdicion(leerRecetaAdicion(snapshot))
);

// Regla de la Multiplicación
const nombreEvento = (evento, indice) => String(evento.name || '').trim()
  || String.fromCharCode(65 + indice % 26);

export const crearRecetaMultiplicacion = (datos) => {
  const modo = datos.modoMult || 'matriz';
  return {
    modulo: 'MAT251', operacion: 'regla_multiplicacion', modo,
    parametros: modo === 'manual' ? {
      modReemplazo: datos.modReemplazo,
      eventos: (datos.eventosManualesMult || []).map((evento, indice) => ({
        name: nombreEvento(evento, indice), prob: evento.prob,
      })),
    } : {
      modReemplazo: datos.modReemplazo,
      colA: datos.colA_Mult || '', valA: String(datos.valA_Mult ?? ''),
      colB: datos.colB_Mult || '', valB: String(datos.valB_Mult ?? ''),
    },
    filas: modo === 'matriz' ? datos.filas || [] : [],
    varSeleccionada: modo === 'matriz' ? datos.varSeleccionada || null : null,
    nombreEncabezadoManual: modo === 'matriz' ? datos.nombreEncabezadoManual || '' : '',
    archivo: modo === 'matriz' ? obtenerArchivoRealHistorialMAT251({}, datos.selectedFile) : null,
    hoja: modo === 'matriz' ? datos.selectedSheet ?? 0 : null,
  };
};

export const leerRecetaMultiplicacion = (snapshot = {}) => {
  const legado = snapshot.tema1?.reglaMultiplicacion || {};
  const parametros = snapshot.parametros || legado;
  const resultado = legado.resultado || {};
  const eventos = parametros.eventos || resultado.events;
  // Las recetas anteriores marcaban como manual incluso los cálculos de matriz.
  const modo = Array.isArray(eventos) ? 'manual'
    : resultado.modo || (Object.prototype.hasOwnProperty.call(parametros, 'colA') ? 'matriz' : snapshot.modo || 'matriz');
  return {
    ...snapshot, modo,
    parametros: modo === 'manual' ? {
      modReemplazo: parametros.modReemplazo || resultado.modReemplazo || 'con_reemplazo',
      eventos: (eventos || []).map((evento, indice) => ({
        name: nombreEvento(evento, indice), prob: evento.prob ?? '',
      })),
    } : {
      modReemplazo: parametros.modReemplazo || resultado.modReemplazo || 'con_reemplazo',
      colA: parametros.colA || resultado.colA || '', valA: String(parametros.valA ?? resultado.valA ?? ''),
      colB: parametros.colB || resultado.colB || '', valB: String(parametros.valB ?? resultado.valB ?? ''),
    },
    ...leerDatosMatrizHistorial(snapshot),
    nombreEncabezadoManual: snapshot.nombreEncabezadoManual || '',
  };
};

export const firmaRecetaMultiplicacion = (receta) => JSON.stringify({
  modo: receta.modo,
  parametros: receta.modo === 'manual' ? {
    modReemplazo: receta.parametros.modReemplazo,
    eventos: (receta.parametros.eventos || []).map((evento, indice) => ({
      name: nombreEvento(evento, indice),
      prob: String(evento.prob ?? '').trim() === '' ? '' : Number(evento.prob),
    })),
  } : receta.parametros,
  nombreVariable: receta.modo === 'matriz' ? receta.varSeleccionada?.nombre || '' : '',
  columnas: receta.modo === 'matriz'
    ? (receta.varSeleccionada?.nombresColumnas?.length ? receta.varSeleccionada.nombresColumnas : ['Valores']) : [],
  filas: receta.modo === 'matriz'
    ? (receta.filas || []).map(fila => String(fila.valor ?? '').trim()).filter(Boolean) : [],
});

export const calcularRecetaMultiplicacion = (receta) => {
  const p = receta.parametros || {};
  if (!['con_reemplazo', 'sin_reemplazo'].includes(p.modReemplazo)) {
    return { error: 'Selecciona un tipo de extracción válido.' };
  }
  let resultado;
  if (receta.modo === 'manual') {
    if (!Array.isArray(p.eventos) || p.eventos.length < 2) {
      return { error: 'Se necesitan al menos dos eventos para calcular la multiplicación.' };
    }
    if (p.eventos.some(evento => String(evento.prob ?? '').trim() === ''
        || !Number.isFinite(Number(evento.prob)) || Number(evento.prob) < 0 || Number(evento.prob) > 1)) {
      return { error: 'Todas las probabilidades deben ser números entre 0 y 1.' };
    }
    const events = p.eventos.map((evento, indice) => ({
      name: nombreEvento(evento, indice), prob: Number(evento.prob),
    }));
    resultado = {
      isManualDinamic: true, events,
      pAandB: events.reduce((producto, evento) => producto * evento.prob, 1),
      pA: events[0].prob, pB: events[1].prob,
      nameA: events[0].name, nameB: events[1].name,
    };
  } else if (receta.modo === 'matriz') {
    const columnas = receta.varSeleccionada?.nombresColumnas?.length ? receta.varSeleccionada.nombresColumnas : ['Valores'];
    if (!columnas.includes(p.colA) || !columnas.includes(p.colB)
        || String(p.valA ?? '').trim() === '' || String(p.valB ?? '').trim() === '') {
      return { error: 'Selecciona las columnas y condiciones de las dos extracciones.' };
    }
    const calculo = calcularReglaMultiplicacion(
      receta.filas || [], columnas, p.colA, String(p.valA), p.colB, String(p.valB), p.modReemplazo
    );
    if (calculo.error) return calculo;
    resultado = { ...calculo.resultado, colA: p.colA, valA: p.valA, colB: p.colB, valB: p.valB };
  } else return { error: 'Modo de multiplicación inválido.' };
  return {
    resultado: {
      ...resultado, modo: receta.modo, modReemplazo: p.modReemplazo,
      _entradaMultiplicacion: firmaRecetaMultiplicacion(receta),
    },
  };
};

export const validarMultiplicacionGuardable = (datos) => (
  !!datos.resultadoMult && Number.isFinite(datos.resultadoMult.pAandB)
  && datos.resultadoMult.pAandB >= 0 && datos.resultadoMult.pAandB <= 1
  && datos.resultadoMult._entradaMultiplicacion === firmaRecetaMultiplicacion(crearRecetaMultiplicacion(datos))
);

export const puedeActualizarHistorialMultiplicacion = (datos, snapshot) => {
  const actual = crearRecetaMultiplicacion(datos);
  const guardada = leerRecetaMultiplicacion(snapshot);
  return validarMultiplicacionGuardable(datos)
    && actual.modo === guardada.modo
    && firmaRecetaMultiplicacion(actual) !== firmaRecetaMultiplicacion(guardada);
};
