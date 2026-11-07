// Historial del Tema 2: Variables aleatorias discretas y funciones continuas.
import { calcularMomentosDiscreta, calcularMomentosContinua, calcularResumenContinua } from '../Matematicas/logica_Tema2';
import {
  obtenerArchivoRealHistorialMAT251, leerDatosMatrizHistorial,
} from './historialMAT251';
import { evaluate, parse, simplify } from 'mathjs';
import { mat251Api } from '../Matematicas/services/api';

// Variables Aleatorias Discretas
export const columnasDiscreta = (variable, filas = []) => variable?.nombresColumnas?.length
  ? variable.nombresColumnas : (variable ? [variable.nombre || 'Datos']
    : filas.some(fila => String(fila.valor ?? '').trim()) ? ['Valores'] : []);
const numeroEntrada = valor => String(valor ?? '').trim() === '' ? '' : Number(valor);
export const vistaDiscretaInicial = { ordenMomento: 1, propA: 2, propB: 3 };

export const crearRecetaDiscreta = (datos) => {
  const modo = datos.modoDiscreta || 'matriz';
  const columnas = columnasDiscreta(datos.varSeleccionada, datos.filas);
  return {
    modulo: 'MAT251', operacion: 'dist_discreta', modo,
    ...(modo === 'manual' ? {
      tabla: (datos.tablaDiscreta || []).map(fila => [numeroEntrada(fila.x), numeroEntrada(fila.p)]),
    } : {
      columna: columnas.length === 1 ? 0 : datos.columnaDiscreta ?? '',
    }),
    vista: datos.vistaDiscreta || vistaDiscretaInicial,
    filas: modo === 'matriz' ? datos.filas || [] : [],
    varSeleccionada: modo === 'matriz' ? datos.varSeleccionada || null : null,
    nombreEncabezadoManual: modo === 'matriz' ? datos.nombreEncabezadoManual || '' : '',
    archivo: modo === 'matriz' ? obtenerArchivoRealHistorialMAT251({}, datos.selectedFile) : null,
    hoja: modo === 'matriz' ? datos.selectedSheet ?? 0 : null,
  };
};

export const leerRecetaDiscreta = (snapshot = {}) => {
  const legado = snapshot.tema2?.discretos || {};
  const modo = Array.isArray(snapshot.tabla) ? 'manual' : legado.modo || snapshot.modo || 'matriz';
  const datos = leerDatosMatrizHistorial(snapshot);
  const columnas = columnasDiscreta(datos.varSeleccionada, datos.filas);
  const columnaLegada = columnas.indexOf(legado.columna);
  return {
    ...snapshot, ...datos, modo,
    tabla: snapshot.tabla || (modo === 'manual' ? (legado.datos || []).map(fila => [fila.x, fila.p]) : []),
    columna: columnas.length === 1 ? 0 : snapshot.columna ?? (columnaLegada >= 0 ? columnaLegada : ''),
    vista: { ...vistaDiscretaInicial, ...snapshot.vista },
    nombreEncabezadoManual: snapshot.nombreEncabezadoManual || '',
  };
};

export const firmaEntradasDiscreta = receta => JSON.stringify({
  modo: receta.modo,
  ...(receta.modo === 'manual' ? {
    tabla: (receta.tabla || []).map(fila => fila.map(numeroEntrada)),
  } : {
    columna: receta.columna,
    nombre: receta.varSeleccionada?.nombre || '',
    columnas: columnasDiscreta(receta.varSeleccionada, receta.filas),
    filas: (receta.filas || []).map(fila => String(fila.valor ?? '').trim()).filter(Boolean),
  }),
});
export const firmaRecetaDiscreta = receta => JSON.stringify({
  entradas: firmaEntradasDiscreta(receta),
  vista: Object.fromEntries(Object.entries({ ...vistaDiscretaInicial, ...receta.vista })
    .map(([clave, valor]) => [clave, numeroEntrada(valor)])),
});

export const calcularRecetaDiscreta = (receta) => {
  let distribucion;
  let contexto;
  if (receta.modo === 'manual') {
    const tabla = receta.tabla || [];
    if (!tabla.length || tabla.some(fila => fila.length !== 2
        || fila.some(valor => String(valor ?? '').trim() === '' || !Number.isFinite(Number(valor)))
        || Number(fila[1]) < 0 || Number(fila[1]) > 1)) {
      return { error: 'Completa cada fila con un valor X finito y una probabilidad entre 0 y 1.' };
    }
    if (Math.abs(tabla.reduce((suma, fila) => suma + Number(fila[1]), 0) - 1) > 0.0001) {
      return { error: 'La suma de las probabilidades debe ser 1.' };
    }
    const probabilidades = new Map();
    tabla.forEach(([x, p]) => probabilidades.set(Number(x), (probabilidades.get(Number(x)) || 0) + Number(p)));
    distribucion = [...probabilidades].map(([x, p]) => ({ x, p }));
    contexto = { modo: 'manual' };
  } else if (receta.modo === 'matriz') {
    const columnas = columnasDiscreta(receta.varSeleccionada, receta.filas);
    const indice = receta.columna;
    if (!Number.isInteger(indice) || indice < 0 || indice >= columnas.length) {
      return { error: 'Selecciona la columna a evaluar.' };
    }
    const observaciones = [];
    for (const [filaIndice, fila] of (receta.filas || []).entries()) {
      const valor = String(fila.valor ?? '').split(' | ')[indice]?.trim() || '';
      if (!valor) continue;
      if (!Number.isFinite(Number(valor))) {
        return { error: `La fila ${filaIndice + 1} de la columna seleccionada no contiene un número válido.` };
      }
      observaciones.push(Number(valor));
    }
    if (!observaciones.length) return { error: 'No hay datos numéricos en la columna seleccionada.' };
    const frecuencias = new Map();
    observaciones.forEach(x => frecuencias.set(x, (frecuencias.get(x) || 0) + 1));
    distribucion = [...frecuencias].map(([x, f]) => ({ x, f, p: f / observaciones.length }));
    contexto = {
      modo: 'matriz', columna: columnas[indice], nombreVariable: receta.varSeleccionada?.nombre,
      observaciones,
    };
  } else return { error: 'Modo de variable discreta inválido.' };
  distribucion.sort((a, b) => a.x - b.x);
  const resultado = calcularMomentosDiscreta(distribucion);
  if (resultado.error) return resultado;
  return { resultado: { ...resultado, ...contexto, _entradaDiscreta: firmaEntradasDiscreta(receta) } };
};

export const validarDiscretaGuardable = (datos) => {
  const receta = crearRecetaDiscreta(datos);
  const resultado = datos.datosDiscretos;
  const vista = receta.vista;
  const r = Number(vista.ordenMomento);
  return !!resultado && !resultado.error && Number.isFinite(resultado.esperanza)
    && resultado._entradaDiscreta === firmaEntradasDiscreta(receta)
    && String(vista.ordenMomento).trim() !== '' && Number.isSafeInteger(r) && r >= 1
    && [vista.propA, vista.propB].every(valor => String(valor).trim() !== '' && Number.isFinite(Number(valor)))
    && Number.isFinite(resultado.datos.reduce((suma, fila) => fila.p === 0 ? suma : suma + fila.x ** r * fila.p, 0))
    && Number.isFinite(Number(vista.propA) * resultado.esperanza + Number(vista.propB))
    && Number.isFinite(Number(vista.propA) ** 2 * resultado.varianza);
};
export const puedeActualizarHistorialDiscreta = (datos, snapshot) => {
  const actual = crearRecetaDiscreta(datos);
  const guardada = leerRecetaDiscreta(snapshot);
  return validarDiscretaGuardable(datos) && actual.modo === guardada.modo
    && firmaRecetaDiscreta(actual) !== firmaRecetaDiscreta(guardada);
};

// Funciones Continuas
const TIPOS = new Set(['incognita_dinamica', 'pi', 'signo', 'paren_abre', 'paren_cierra',
  'corchete_abre', 'corchete_cierra', 'fraccion', 'euler', 'absoluto', 'constante',
  'termino_lineal', 'termino_cuadratico', 'termino_potencia']);
export const compactarBloquesContinua = (bloques = []) => bloques.map(bloque => {
  const salida = { tipo: bloque.tipo };
  const campos = bloque.tipo === 'constante' ? ['coef']
    : ['termino_lineal', 'termino_cuadratico'].includes(bloque.tipo) ? ['coef']
    : bloque.tipo === 'termino_potencia' ? ['coef', 'exp']
    : ['signo', 'incognita_dinamica'].includes(bloque.tipo) ? ['valor'] : [];
  campos.forEach(clave => { if (String(bloque[clave] ?? '') !== '') salida[clave] = String(bloque[clave]); });
  if (['fraccion', 'euler', 'absoluto'].includes(bloque.tipo)) salida.numerador = compactarBloquesContinua(bloque.numerador || []);
  if (bloque.tipo === 'fraccion') {
    salida.denominador = compactarBloquesContinua(bloque.denominador || []);
    if (bloque.variable_adjunta) salida.variable_adjunta = bloque.variable_adjunta;
    if (bloque.variable_adjunta === 'termino_potencia') salida.exp_adjunto = String(bloque.exp_adjunto || '');
  }
  return salida;
});
export const expandirBloquesContinua = (bloques = []) => {
  let id = 0;
  const expandir = lista => lista.map(bloque => ({
    id: `continua-${++id}`, valor: '', coef: '', exp: '', variable_adjunta: null, exp_adjunto: '',
    ...bloque, numerador: expandir(bloque.numerador || []), denominador: expandir(bloque.denominador || []),
  }));
  return expandir(bloques);
};
export const crearRecetaContinua = (datos) => {
  const configuracion = datos.configuracionContinua || {};
  return {
    modulo: 'MAT251', operacion: 'dist_continua', modo: 'manual',
    bloques: compactarBloquesContinua(configuracion.constante?.bloquesOriginales || configuracion.bloques || []),
    limites: [String(configuracion.limiteA ?? ''), String(configuracion.limiteB ?? '')],
    etapa: datos.datosContinuos?.soloConstante ? 'constante' : 'completo',
  };
};
export const leerRecetaContinua = (snapshot = {}) => ({
  modulo: 'MAT251', operacion: 'dist_continua', modo: 'manual',
  bloques: Array.isArray(snapshot.bloques) ? compactarBloquesContinua(snapshot.bloques) : [],
  limites: Array.isArray(snapshot.limites) ? snapshot.limites.map(String) : ['', ''],
  etapa: snapshot.etapa === 'constante' ? 'constante' : 'completo',
});
export const firmaEntradasContinua = receta => JSON.stringify({
  bloques: compactarBloquesContinua(receta.bloques || []),
  limites: (receta.limites || []).map(valor => String(valor).trim()),
});
export const firmaRecetaContinua = receta => JSON.stringify({ entradas: firmaEntradasContinua(receta), etapa: receta.etapa || 'completo' });
const evaluarLimite = texto => {
  const valor = evaluate(String(texto).replace(/∞/g, 'Infinity').replace(/π/g, 'pi'));
  if (typeof valor !== 'number' || Number.isNaN(valor)) throw new Error('Límite inválido');
  return valor;
};
const limiteAPI = valor => valor === Infinity ? 'inf' : valor === -Infinity ? '-inf' : valor;

const parsearArray = (arr, activeVar = 'x') => {
    const parts = arr.map(b => {
        if (b.tipo === 'incognita_dinamica') return `(${b.valor || 'k'})`;
        if (b.tipo === 'pi') return 'pi';
        if (b.tipo === 'signo') return b.valor;
        if (b.tipo === 'paren_abre') return '(';
        if (b.tipo === 'paren_cierra') return ')';
        if (b.tipo === 'corchete_abre') return '(';
        if (b.tipo === 'corchete_cierra') return ')';
        if (b.tipo === 'fraccion') {
            const numStr = parsearArray(b.numerador, activeVar) || '1';
            const denStr = parsearArray(b.denominador, activeVar) || '1';
            const baseStr = `((${numStr}) / (${denStr}))`;
            if (b.variable_adjunta) {
                if (b.variable_adjunta === 'termino_lineal') return `${baseStr} * (${activeVar})`;
                if (b.variable_adjunta === 'termino_cuadratico') return `${baseStr} * (${activeVar}^2)`;
                if (b.variable_adjunta === 'termino_potencia') {
                    let e = parseFloat(b.exp_adjunto);
                    if (isNaN(e)) e = 1;
                    return `${baseStr} * (${activeVar}^${e})`;
                }
            }
            return baseStr;
        }
        if (b.tipo === 'euler') {
            const expStr = parsearArray(b.numerador, activeVar) || '1';
            return `exp(${expStr})`;
        }
        if (b.tipo === 'absoluto') {
            const intStr = parsearArray(b.numerador, activeVar) || '0';
            return `abs(${intStr})`;
        }
        let c = parseFloat(b.coef);
        if (isNaN(c)) c = 1;
        if (b.tipo === 'constante') {
            if (!String(b.coef || '').trim()) return '0';
            return `(${parseFloat(b.coef)})`;
        }
        if (b.tipo === 'termino_lineal') return `(${c} * ${activeVar})`;
        if (b.tipo === 'termino_cuadratico') return `(${c} * ${activeVar}^2)`;
        if (b.tipo === 'termino_potencia') {
            let e = parseFloat(b.exp);
            if (isNaN(e)) e = 1;
            return `(${c} * ${activeVar}^${e})`;
        }
        return '';
    }).filter(p => p !== '');
    return parts.join(' ');
};

export const expresionBloquesContinua = bloques => parsearArray(bloques, 'x')
  .replace(/(\d)\s*(\()/g, '$1*$2').replace(/(\))\s*(\()/g, '$1*$2')
  .replace(/(\d)\s*([a-zA-Z])/g, '$1*$2').replace(/(\))\s*([a-zA-Z])/g, '$1*$2');
const incognitasEn = bloques => bloques.flatMap(bloque => [
  ...(bloque.tipo === 'incognita_dinamica' ? [bloque.valor || 'k'] : []),
  ...incognitasEn(bloque.numerador || []), ...incognitasEn(bloque.denominador || []),
]);
export const validarEntradasContinua = receta => {
  try {
    const revisar = bloques => Array.isArray(bloques) && bloques.every(bloque => TIPOS.has(bloque.tipo)
      && revisar(bloque.numerador || []) && revisar(bloque.denominador || []));
    if (!receta.bloques?.length || !revisar(receta.bloques)) return false;
    const [a, b] = receta.limites.map(evaluarLimite);
    const incognitas = [...new Set(incognitasEn(receta.bloques))];
    return a < b && incognitas.length <= 1 && incognitas.every(nombre => /^[a-zA-Z][a-zA-Z0-9_]*$/.test(nombre))
      && !!expresionBloquesContinua(receta.bloques);
  } catch { return false; }
};

export const calcularRecetaContinua = async (receta, { continuarTrasConstante = false, constantePrevia = null } = {}) => {
  try {
    if (!validarEntradasContinua(receta)) {
      return { error: 'Completa la función y dos límites válidos, con el límite inferior menor que el superior.' };
    }
    const [a, b] = receta.limites.map(evaluarLimite);
    const original = expresionBloquesContinua(receta.bloques);
    const incognita = incognitasEn(receta.bloques)[0];
    let funcionFx = original;
    let constante = null;
    let bloques = receta.bloques;
    if (incognita) {
      constante = constantePrevia;
      if (!constante) {
        const data = await mat251Api.resolucionK({
          funcion: original.replaceAll(`(${incognita})`, '(1)'), a: limiteAPI(a), b: limiteAPI(b), incognita_var: incognita,
        });
        if (!data.success || !Number.isFinite(Number(data.k_val)) || !data.k_str) {
          return { error: data.error || 'No se pudo resolver la constante de la función.' };
        }
        constante = {
          incognitaVar: incognita, valor: Number(data.k_val), valorExacto: String(data.k_str),
          latex_block: data.latex_block, funcionOriginal: original, bloquesOriginales: receta.bloques,
        };
      }
      funcionFx = original.replaceAll(`(${incognita})`, `(${constante.valorExacto})`);
      const fraccion = /^(-?\d+)\s*\/\s*(-?\d+)$/.exec(constante.valorExacto);
      const sustituir = lista => lista.map(bloque => bloque.tipo === 'incognita_dinamica'
        ? fraccion ? {
          tipo: 'fraccion', numerador: [{ tipo: 'constante', coef: fraccion[1] }],
          denominador: [{ tipo: 'constante', coef: fraccion[2] }],
        } : { tipo: 'constante', coef: String(constante.valor) }
        : { ...bloque, ...(bloque.numerador ? { numerador: sustituir(bloque.numerador) } : {}),
          ...(bloque.denominador ? { denominador: sustituir(bloque.denominador) } : {}) });
      bloques = sustituir(receta.bloques);
    }
    const configuracion = {
      bloques: expandirBloquesContinua(bloques), limiteA: receta.limites[0], limiteB: receta.limites[1], constante,
    };
    const firma = firmaEntradasContinua(receta);
    if (incognita && !continuarTrasConstante) {
      return { configuracion, resultado: { soloConstante: true, a, b, constante, _entradaContinua: firma } };
    }
    let simbolico = null;
    try {
      const respuesta = await mat251Api.resolucionContinua({ funcion: funcionFx, a: limiteAPI(a), b: limiteAPI(b) });
      if (!respuesta.success) return { error: respuesta.mensaje_error || respuesta.error || 'No se pudo resolver la función.' };
      simbolico = respuesta;
    } catch {
      if (!Number.isFinite(a) || !Number.isFinite(b)) return { error: 'Se necesita conexión con el servidor para resolver límites infinitos.' };
    }
    const numerico = calcularMomentosContinua(funcionFx, a, b, 'x');
    if (numerico.error) return numerico;
    const resumen = calcularResumenContinua({ funcionFx, a, b,
      esperanza_backend: simbolico?.esperanza, varianza_backend: simbolico?.varianza, area_backend: simbolico?.area });
    if (resumen.error) return resumen;
    let latexString = funcionFx;
    try { latexString = simplify(parse(funcionFx)).toTex({ parenthesis: 'auto' }); } catch { /* Conservar la expresión. */ }
    return { configuracion, resultado: {
      ...numerico, funcionFx, a, b, modo: 'densidad', latexString, constante,
      area: resumen.area, esperanza: resumen.eX, varianza: resumen.varX, desviacion: resumen.stdDev,
      es_valida: Math.abs(resumen.area - 1) <= 0.005,
      warning: Math.abs(resumen.area - 1) <= 0.005 ? null : 'El área bajo la curva no es 1; revisa si la función representa una densidad.',
      esperanza_backend: simbolico?.esperanza ?? null, varianza_backend: simbolico?.varianza ?? null,
      area_backend: simbolico?.area ?? null, latex_esperanza: simbolico?.latex_esperanza ?? null,
      latex_varianza: simbolico?.latex_varianza ?? null, latex_area: simbolico?.latex_area ?? null,
      _entradaContinua: firma,
    } };
  } catch { return { error: 'No se pudo calcular la función. Revisa su expresión y la conexión con el servidor.' }; }
};
export const validarContinuaGuardable = datos => {
  const receta = crearRecetaContinua(datos);
  const resultado = datos.datosContinuos;
  return !!resultado && !resultado.error && validarEntradasContinua(receta)
    && resultado._entradaContinua === firmaEntradasContinua(receta)
    && (resultado.soloConstante ? Number.isFinite(resultado.constante?.valor)
      : [resultado.area, resultado.esperanza, resultado.varianza, resultado.desviacion].every(Number.isFinite));
};
export const puedeActualizarHistorialContinua = (datos, snapshot) => validarContinuaGuardable(datos)
  && firmaRecetaContinua(crearRecetaContinua(datos)) !== firmaRecetaContinua(leerRecetaContinua(snapshot));
