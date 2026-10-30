// Historial del Tema 4: Distribuciones muestrales, T y F.
import { calcularDistribucionMuestral } from '../Matematicas/logica_Tema1';
import {
  generarDistribucionProbabilidadMuestral, calcularProbabilidadProbabilidadMuestral,
  generarDistribucionProporcion, calcularProbabilidadProporcion, generarDistribucionChiCuadrada,
  calcularProbabilidadChiCuadrada, generarDistribucionDiferenciaMedias,
  calcularProbabilidadDiferenciaMedias, generarDistribucionDiferenciaProporciones,
  calcularProbabilidadDiferenciaProporciones, generarDistribucionStudent, calcularProbabilidadStudent,
  calcularParametrosRazonVarianzas, calcularProbabilidadRazonVarianzas,
} from '../Matematicas/Logica_Tema4';
import {
  leerDatosMatrizHistorial, obtenerArchivoRealHistorialMAT251,
} from './historialMAT251';
import { jStat } from 'jstat';

// Distribuciones Muestrales
export const NOMBRES_MUESTRALES = {
  empirica: 'Demostración Empírica', normal: 'Media con Varianza Conocida',
  proporcion: 'Una Proporción', chi: 'Varianza Muestral',
  dif_medias: 'Diferencia de Medias con Varianzas Conocidas', dif_proporciones: 'Diferencia de Proporciones',
};
const consultaInicial = () => ({ condicion: 'menor_que', valorX1: '', valorX2: '' });
export const crearEstadoMuestral = () => ({
  vista: 'empirica', distribucion: 'normal',
  empirica: { n: '', conReemplazo: true, parametroCalculo: 'media', atributoExito: '' },
  calculadora: {
    normal: { mediaPoblacional: '', desviacion: '', tipoDispersion: 'varianza', 'tamañoMuestra': '', tipoPoblacion: 'infinita', poblacionN: '', ...consultaInicial() },
    proporcion: { pPoblacional: '', tamanoMuestra: '', tipoPoblacion: 'infinita', tamanoPoblacion: '', ...consultaInicial() },
    chi: { varianzaPoblacional: '', 'tamañoMuestra': '', tipoDispersion: 'varianza', ...consultaInicial() },
    dif_medias: { mu1: '', sigma1: '', n1: '', mu2: '', sigma2: '', n2: '', ...consultaInicial() },
    dif_proporciones: { p1: '', n1: '', p2: '', n2: '', ...consultaInicial() },
  },
});
const numero = valor => String(valor ?? '').trim() === '' ? '' : Number(String(valor).replace(',', '.'));
const numerico = valor => typeof valor === 'number' && Number.isFinite(valor);
const entero = valor => Number.isSafeInteger(valor) && valor > 0;
const campos = {
  normal: ['mediaPoblacional', 'desviacion', 'tamañoMuestra', 'tipoDispersion', 'tipoPoblacion', 'poblacionN'],
  proporcion: ['pPoblacional', 'tamanoMuestra', 'tipoPoblacion', 'tamanoPoblacion'],
  chi: ['varianzaPoblacional', 'tamañoMuestra', 'tipoDispersion'],
  dif_medias: ['mu1', 'sigma1', 'n1', 'mu2', 'sigma2', 'n2'],
  dif_proporciones: ['p1', 'n1', 'p2', 'n2'],
};
const normalizarParametros = (distribucion, estado = {}) => {
  if (distribucion === 'empirica') return {
    n: numero(estado.n), conReemplazo: estado.conReemplazo, parametroCalculo: estado.parametroCalculo,
    ...(estado.parametroCalculo === 'proporcion' ? { atributoExito: String(estado.atributoExito ?? '').trim() } : {}),
  };
  return Object.fromEntries((campos[distribucion] || []).filter(campo =>
    !['poblacionN', 'tamanoPoblacion'].includes(campo) || estado.tipoPoblacion === 'finita'
  ).map(campo => [campo, campo.startsWith('tipo') ? estado[campo] : numero(estado[campo])]));
};
export const crearRecetaMuestral = (datos, evaluarCondicion = !!datos.resultadoMuestral?.resultados?.condicion) => {
  const estado = datos.configuracionMuestral;
  const empirica = estado.vista === 'empirica';
  const distribucion = empirica ? 'empirica' : estado.distribucion;
  const activo = empirica ? estado.empirica : estado.calculadora[distribucion];
  return {
    modulo: 'MAT251', operacion: 'distribuciones_muestrales', modo: empirica ? 'matriz' : 'manual', distribucion,
    parametros: normalizarParametros(distribucion, empirica && activo.parametroCalculo === 'proporcion' ? {
      ...activo, atributoExito: activo.atributoExito || String(datos.filas?.find(fila => String(fila.valor ?? '').trim())?.valor ?? '').trim(),
    } : activo),
    ...(!empirica && evaluarCondicion ? { condicion: { tipo: activo.condicion, x1: numero(activo.valorX1),
      ...(activo.condicion === 'entre' ? { x2: numero(activo.valorX2) } : {}) } } : {}),
    filas: empirica ? datos.filas || [] : [], varSeleccionada: empirica ? datos.varSeleccionada || null : null,
    nombreEncabezadoManual: empirica ? datos.nombreEncabezadoManual || '' : '',
    archivo: empirica ? obtenerArchivoRealHistorialMAT251({}, datos.selectedFile) : null,
    hoja: empirica ? datos.selectedSheet ?? 0 : null,
  };
};
export const leerRecetaMuestral = (snapshot = {}) => ({
  ...snapshot, distribucion: snapshot.distribucion || 'empirica',
  modo: snapshot.distribucion && snapshot.distribucion !== 'empirica' ? 'manual' : 'matriz',
  parametros: normalizarParametros(snapshot.distribucion || 'empirica', snapshot.parametros || {}),
  ...(snapshot.condicion ? { condicion: { tipo: snapshot.condicion.tipo, x1: numero(snapshot.condicion.x1),
    ...(snapshot.condicion.tipo === 'entre' ? { x2: numero(snapshot.condicion.x2) } : {}) } } : {}),
  ...(snapshot.distribucion && snapshot.distribucion !== 'empirica' ? { filas: [], varSeleccionada: null } : leerDatosMatrizHistorial(snapshot)),
  nombreEncabezadoManual: snapshot.nombreEncabezadoManual || '',
});
export const firmaRecetaMuestral = receta => JSON.stringify({
  distribucion: receta.distribucion, modo: receta.modo,
  parametros: normalizarParametros(receta.distribucion, receta.parametros), condicion: receta.condicion || null,
  ...(receta.modo === 'matriz' ? {
    nombre: receta.varSeleccionada?.nombre || '', columnas: receta.varSeleccionada?.nombresColumnas || [],
    encabezado: receta.nombreEncabezadoManual || '', filas: (receta.filas || []).map(fila => String(fila.valor ?? '').trim()).filter(Boolean),
  } : {}),
});
export const calcularRecetaMuestral = receta => {
  const d = receta.distribucion;
  const p = receta.parametros || {};
  const fallo = error => ({ error });
  if (!(d in NOMBRES_MUESTRALES) || receta.modo !== (d === 'empirica' ? 'matriz' : 'manual')) return fallo('La demostración usa datos de matriz y la calculadora utiliza parámetros manuales.');
  try {
    let base;
    let resultados;
    if (d === 'empirica') {
      const valores = (receta.filas || []).map(fila => String(fila.valor ?? '').trim()).filter(Boolean);
      if (!valores.length || receta.varSeleccionada?.nombresColumnas?.length > 1 || String(receta.varSeleccionada?.tipo || '').toLowerCase().includes('mixta') || valores.some(valor => valor.includes(' | '))) return fallo('Selecciona una población con datos de una sola columna.');
      if (!entero(p.n) || typeof p.conReemplazo !== 'boolean' || !['media', 'varianza', 'proporcion'].includes(p.parametroCalculo)
          || (!p.conReemplazo && p.n > valores.length) || (p.parametroCalculo === 'varianza' && (p.n < 2 || valores.length < 2))) return fallo('Revisa el tamaño entero de muestra y el tipo de muestreo.');
      if (p.parametroCalculo === 'proporcion') {
        if (!p.atributoExito || !valores.includes(p.atributoExito)) return fallo('Selecciona un atributo de éxito presente en la población.');
      } else if (valores.some(valor => !Number.isFinite(Number(valor)))) return fallo('Para medias o varianzas, todos los datos deben ser números finitos.');
      // Evita que una coma interna divida una observación en varios datos.
      if (valores.some(valor => valor.includes(','))) return fallo('Los datos deben usar punto decimal y no contener comas internas.');
      let cantidad = p.conReemplazo ? Math.pow(valores.length, p.n) : 1;
      if (!p.conReemplazo) {
        for (let i = 1; i <= Math.min(p.n, valores.length - p.n) && cantidad <= 70000; i++) cantidad *= (valores.length - i + 1) / i;
      }
      if (!Number.isFinite(cantidad) || cantidad > 70000) return fallo('Límite excedido (máx. 70,000 muestras). Usa la Calculadora de Probabilidades.');
      resultados = calcularDistribucionMuestral(valores.join(', '), p.n, p.conReemplazo, p.parametroCalculo, p.atributoExito);
      if (resultados?.error) return resultados;
      if (!['esperanza', 'varianzaDeDistribucion', 'mediaPoblacional', 'varianzaPoblacional', 'proporcionPoblacional']
          .every(clave => Number.isFinite(resultados.calculosFinales?.[clave]))) return fallo('Los datos exceden el rango numérico admitido para la demostración.');
    } else {
      const numeros = Object.entries(p).filter(([clave]) => !clave.startsWith('tipo')).map(([, valor]) => valor);
      if (!numeros.length || !numeros.every(numerico)) return fallo('Completa los parámetros con números finitos.');
      if (['normal', 'chi'].includes(d) && (!entero(p['tamañoMuestra']) || !['varianza', 'desviacion'].includes(p.tipoDispersion)
          || (d === 'normal' ? !(p.desviacion > 0) : !(p.varianzaPoblacional > 0)))) return fallo('La dispersión debe ser positiva y el tamaño de muestra debe ser un entero positivo.');
      if (['normal', 'proporcion'].includes(d)) {
        const n = d === 'normal' ? p['tamañoMuestra'] : p.tamanoMuestra;
        const N = d === 'normal' ? p.poblacionN : p.tamanoPoblacion;
        if (!entero(n) || !['infinita', 'finita'].includes(p.tipoPoblacion) || (p.tipoPoblacion === 'finita' && (!entero(N) || N <= n))) return fallo('Revisa los tamaños enteros de muestra y población; para población finita, N debe ser mayor que n.');
      }
      if (['dif_medias', 'dif_proporciones'].includes(d) && (!entero(p.n1) || !entero(p.n2))) return fallo('Los tamaños de ambas muestras deben ser enteros positivos.');
      if (d === 'dif_medias' && (!(p.sigma1 > 0) || !(p.sigma2 > 0))) return fallo('Las desviaciones de ambas poblaciones deben ser positivas.');
      if (d === 'normal') base = generarDistribucionProbabilidadMuestral(p.mediaPoblacional, p.desviacion, p.tipoDispersion, p['tamañoMuestra'], p.poblacionN, p.tipoPoblacion);
      if (d === 'proporcion') {
        const generada = generarDistribucionProporcion(p.pPoblacional, p.tamanoMuestra, p.tamanoPoblacion, p.tipoPoblacion);
        if (generada.error) return generada;
        base = generada.datosParciales;
      }
      if (d === 'chi') base = generarDistribucionChiCuadrada(p.varianzaPoblacional, p['tamañoMuestra'], p.tipoDispersion);
      if (d === 'dif_medias') base = generarDistribucionDiferenciaMedias(p.mu1, p.sigma1, p.n1, p.mu2, p.sigma2, p.n2);
      if (d === 'dif_proporciones') base = generarDistribucionDiferenciaProporciones(p.p1, p.n1, p.p2, p.n2);
      if (base?.error) return base;
      const escala = d === 'normal' ? base.SE : d === 'proporcion' ? base.se : d === 'chi' ? base.varPob : d === 'dif_medias' ? base.se : Math.sqrt(base.varianza);
      if (!Number.isFinite(escala) || escala <= 0) return fallo('La distribución debe tener una dispersión finita y positiva.');
      resultados = base;
      if (receta.condicion) {
        const c = receta.condicion;
        if (!['menor_que', 'mayor_que', 'entre'].includes(c.tipo) || !numerico(c.x1) || (c.tipo === 'entre' && (!numerico(c.x2) || c.x2 <= c.x1))) return fallo('Completa la condición con límites numéricos ordenados.');
        const calcular = { normal: calcularProbabilidadProbabilidadMuestral, proporcion: calcularProbabilidadProporcion, chi: calcularProbabilidadChiCuadrada,
          dif_medias: calcularProbabilidadDiferenciaMedias, dif_proporciones: calcularProbabilidadDiferenciaProporciones }[d];
        const consulta = calcular(base, c.tipo, c.x1, c.x2 ?? '');
        if (consulta.error) return consulta;
        if (!Number.isFinite(consulta.probFinal) || consulta.probFinal < 0 || consulta.probFinal > 1) return fallo('No se obtuvo una probabilidad válida con esos parámetros.');
        resultados = { ...base, ...consulta };
      }
    }
    return { resultado: {
      operacion: 'distribuciones_muestrales', distribucion: d, resultados,
      ...(d === 'empirica' ? { nombreVariable: receta.varSeleccionada?.nombre, poblacion: (receta.filas || []).map(fila => String(fila.valor ?? '').trim()).filter(Boolean) } : {}),
      _baseMuestral: base || null, _entradaMuestral: firmaRecetaMuestral(receta),
    } };
  } catch {
    return fallo('No se pudo reconstruir el cálculo. Revisa los datos y los parámetros guardados.');
  }
};
export const estadoRestauradoMuestral = receta => {
  const estado = crearEstadoMuestral();
  if (receta.distribucion === 'empirica') estado.empirica = { ...estado.empirica, ...receta.parametros };
  else if (estado.calculadora[receta.distribucion]) {
    estado.vista = 'calculadora'; estado.distribucion = receta.distribucion;
    estado.calculadora[receta.distribucion] = { ...estado.calculadora[receta.distribucion], ...receta.parametros,
      ...(receta.condicion ? { condicion: receta.condicion.tipo, valorX1: receta.condicion.x1, valorX2: receta.condicion.x2 ?? '' } : {}) };
  }
  return estado;
};
export const validarMuestralGuardable = datos => !!datos.resultadoMuestral
  && datos.resultadoMuestral._entradaMuestral === firmaRecetaMuestral(crearRecetaMuestral(datos));
export const puedeActualizarHistorialMuestral = (datos, snapshot) => {
  const actual = crearRecetaMuestral(datos);
  const anterior = leerRecetaMuestral(snapshot);
  return validarMuestralGuardable(datos) && actual.distribucion === anterior.distribucion && actual.modo === anterior.modo
    && firmaRecetaMuestral(actual) !== firmaRecetaMuestral(anterior);
};

// Distribuciones T y F
export const NOMBRES_TYF = { student: 'Media con Varianza Desconocida',
  dif_medias_desc: 'Diferencia de Medias con Varianzas Desconocidas', razon_varianzas: 'Razón de Varianzas' };
const consultaInicialTyF = () => ({ condicion: 'menor_que', valorX1: '', valorX2: '' });
export const crearEstadoTyF = () => ({ distribucion: 'student', formularios: {
  student: { mu: '', s: '', n: '', tipoDispersion: 'desviacion', ...consultaInicialTyF() },
  dif_medias_desc: { mu1: '', s1: '', n1: '', mu2: '', s2: '', n2: '', escenario: 'grandes', ...consultaInicialTyF() },
  razon_varianzas: { varPob1: '', n1: '', varPob2: '', n2: '', ...consultaInicialTyF() },
} });
const numeroTyF = valor => String(valor ?? '').trim() === '' ? '' : Number(String(valor).replace(',', '.'));
const camposTyF = { student: ['mu', 's', 'n', 'tipoDispersion'],
  dif_medias_desc: ['mu1', 's1', 'n1', 'mu2', 's2', 'n2', 'escenario'], razon_varianzas: ['varPob1', 'n1', 'varPob2', 'n2'] };
const parametrosActivos = (distribucion, estado = {}) => Object.fromEntries((camposTyF[distribucion] || [])
  .map(campo => [campo, ['tipoDispersion', 'escenario'].includes(campo) ? estado[campo] : numeroTyF(estado[campo])]));
const normalizarCondicion = condicion => condicion ? { tipo: condicion.tipo, x1: numeroTyF(condicion.x1),
  ...(condicion.tipo === 'entre' ? { x2: numeroTyF(condicion.x2) } : {}) } : null;
export const crearRecetaTyF = (datos, evaluarCondicion = !!datos.resultadoMuestral?.resultados?.condicion) => {
  const estado = datos.configuracionTyF;
  const activo = estado.formularios[estado.distribucion];
  return { modulo: 'MAT251', operacion: 'tyf', modo: 'manual', distribucion: estado.distribucion,
    parametros: parametrosActivos(estado.distribucion, activo),
    ...(evaluarCondicion ? { condicion: normalizarCondicion({ tipo: activo.condicion, x1: activo.valorX1, x2: activo.valorX2 }) } : {}),
  };
};
export const leerRecetaTyF = (snapshot = {}) => ({
  ...snapshot, modo: snapshot.modo || 'manual', distribucion: snapshot.distribucion || '',
  parametros: parametrosActivos(snapshot.distribucion, snapshot.parametros), condicion: normalizarCondicion(snapshot.condicion),
});
export const firmaRecetaTyF = receta => JSON.stringify({ modo: receta.modo, distribucion: receta.distribucion,
  parametros: parametrosActivos(receta.distribucion, receta.parametros), condicion: normalizarCondicion(receta.condicion) });
export const estadoRestauradoTyF = receta => {
  const estado = crearEstadoTyF();
  if (estado.formularios[receta.distribucion]) {
    estado.distribucion = receta.distribucion;
    estado.formularios[receta.distribucion] = { ...estado.formularios[receta.distribucion], ...receta.parametros,
      ...(receta.condicion ? { condicion: receta.condicion.tipo, valorX1: receta.condicion.x1, valorX2: receta.condicion.x2 ?? '' } : {}) };
  }
  return estado;
};

// La pantalla y el historial usan el mismo cálculo, conservando sus fórmulas y redondeos.
const calcularDiferenciaTyF = (p, consulta) => {
    const { mu1: m1, s1: std1, n1: nn1, mu2: m2, s2: std2, n2: nn2, escenario } = p;
    const condicion = consulta?.tipo;
    const x1 = consulta?.x1;
    const x2 = consulta?.x2;
    const s1Sq = Math.pow(std1, 2);
    const s2Sq = Math.pow(std2, 2);
        const esperanza = m1 - m2;
        let se = 0;
        let v = 0;
        let statValue = 0;
        let statType = 'Z';
        let formulaLaTeX = '';

        if (escenario === 'grandes') {
            se = Math.sqrt((s1Sq / nn1) + (s2Sq / nn2));
            statValue = (x1 - esperanza) / se;
            statType = 'Z';
            formulaLaTeX = `Z = \\frac{(\\bar{X} - \\bar{Y}) - (\\mu_X - \\mu_Y)}{\\sqrt{\\frac{S_X^2}{n} + \\frac{S_Y^2}{m}}}`;
        } else if (escenario === 'iguales') {
            v = nn1 + nn2 - 2;
            const sp2 = ((nn1 - 1) * s1Sq + (nn2 - 1) * s2Sq) / v;
            se = Math.sqrt(sp2 * ((1 / nn1) + (1 / nn2)));
            statValue = (x1 - esperanza) / se;
            statType = 'T';
            formulaLaTeX = `T = \\frac{(\\bar{X} - \\bar{Y}) - (\\mu_X - \\mu_Y)}{\\sqrt{\\frac{(n-1)S_X^2 + (m-1)S_Y^2}{n+m-2} \\left(\\frac{1}{n} + \\frac{1}{m}\\right)}}`;
        } else if (escenario === 'distintas') {
            se = Math.sqrt((s1Sq / nn1) + (s2Sq / nn2));
            const num = Math.pow((s1Sq / nn1) + (s2Sq / nn2), 2);
            const den = (Math.pow(s1Sq / nn1, 2) / (nn1 + 1)) + (Math.pow(s2Sq / nn2, 2) / (nn2 + 1));
            v = (num / den) - 2;
            // Redondeo de g para presentacion
            v = Math.round(v * 100) / 100;
            statValue = (x1 - esperanza) / se;
            statType = 'T';
            formulaLaTeX = `T = \\frac{(\\bar{X} - \\bar{Y}) - (\\mu_X - \\mu_Y)}{\\sqrt{\\frac{S_X^2}{n} + \\frac{S_Y^2}{m}}}`;
        }

        const base = { m1, std1, nn1, m2, std2, nn2, esperanza, se, v, escenario, statType, formulaLaTeX,
            mu: esperanza, p: esperanza, esDiferenciaMedias: true };
        if (!Number.isFinite(se) || se <= 0 || !Number.isFinite(esperanza) || (statType === 'T' && (!Number.isFinite(v) || v <= 0))) {
            return { error: 'La dispersión y los grados de libertad deben ser finitos y positivos.' };
        }
        if (!consulta) return { base, resultado: base };

        // Calculation for probabilities based on condition
        let probFinal = 0;
        let val2Stat = (x2 - esperanza) / se;

        if (escenario === 'grandes') {
            if (condicion === 'menor_que') {
                probFinal = jStat.normal.cdf(statValue, 0, 1);
            } else if (condicion === 'mayor_que') {
                probFinal = 1 - jStat.normal.cdf(statValue, 0, 1);
            } else if (condicion === 'entre') {
                const p1 = jStat.normal.cdf(statValue, 0, 1);
                const p2 = jStat.normal.cdf(val2Stat, 0, 1);
                probFinal = Math.abs(p2 - p1);
            }
        } else {
            if (condicion === 'menor_que') {
                probFinal = jStat.studentt.cdf(statValue, v);
            } else if (condicion === 'mayor_que') {
                probFinal = 1 - jStat.studentt.cdf(statValue, v);
            } else if (condicion === 'entre') {
                const p1 = jStat.studentt.cdf(statValue, v);
                const p2 = jStat.studentt.cdf(val2Stat, v);
                probFinal = Math.abs(p2 - p1);
            }
        }
        const formatNumber = (num, dec = 0) => num.toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: Math.max(dec, 3) }).replace(/,/g, '{,}');
        let strDesarrollo = '';
        let S = statType; // 'Z' or 'T'

        if (condicion === 'menor_que') {
            strDesarrollo = `\\begin{aligned} P(\\bar{X}_1 - \\bar{X}_2 \\le ${formatNumber(x1)}) &= P\\left( ${S} \\le \\frac{${formatNumber(x1)} - ${formatNumber(esperanza)}}{${formatNumber(se, 2)}} \\right) \\\\ &= P(${S} \\le ${formatNumber(statValue, 2)}) \\\\ &= ${formatNumber(probFinal, 4)} \\end{aligned}`;
        } else if (condicion === 'mayor_que') {
            strDesarrollo = `\\begin{aligned} P(\\bar{X}_1 - \\bar{X}_2 \\ge ${formatNumber(x1)}) &= P\\left( ${S} \\ge \\frac{${formatNumber(x1)} - ${formatNumber(esperanza)}}{${formatNumber(se, 2)}} \\right) \\\\ &= P(${S} \\ge ${formatNumber(statValue, 2)}) \\\\ &= 1 - P(${S} \\le ${formatNumber(statValue, 2)}) = ${formatNumber(probFinal, 4)} \\end{aligned}`;
        } else if (condicion === 'entre') {
            const xMin = Math.min(x1, x2);
            const xMax = Math.max(x1, x2);
            const tMin = Math.min(statValue, val2Stat);
            const tMax = Math.max(statValue, val2Stat);
            strDesarrollo = `\\begin{aligned} P(${formatNumber(xMin)} \\le \\bar{X}_1 - \\bar{X}_2 \\le ${formatNumber(xMax)}) &= P\\left( \\frac{${formatNumber(xMin)} - ${formatNumber(esperanza)}}{${formatNumber(se, 2)}} \\le ${S} \\le \\frac{${formatNumber(xMax)} - ${formatNumber(esperanza)}}{${formatNumber(se, 2)}} \\right) \\\\ &= P(${formatNumber(tMin, 2)} \\le ${S} \\le ${formatNumber(tMax, 2)}) \\\\ &= P(${S} \\le ${formatNumber(tMax, 2)}) - P(${S} \\le ${formatNumber(tMin, 2)}) = ${formatNumber(probFinal, 4)} \\end{aligned}`;
        }

        return { base, resultado: {
            m1, std1, nn1,
            m2, std2, nn2,
            esperanza,
            se,
            v,
            escenario,
            condicion,
            x1,
            x2,
            probFinal,
            statValue,
            statType,
            formulaLaTeX,
            strDesarrollo,
            mu: esperanza, // Para GraficoStudent
            p: esperanza,  // Para GraficoDiferenciaMedias
            esDiferenciaMedias: true
        } };
};
export const calcularRecetaTyF = receta => {
  const d = receta.distribucion;
  const p = receta.parametros || {};
  const fallo = error => ({ error });
  if (!Object.prototype.hasOwnProperty.call(NOMBRES_TYF, d) || receta.modo !== 'manual') return fallo('El historial de T y F requiere una herramienta y sus parámetros manuales.');
  const numerico = valor => typeof valor === 'number' && Number.isFinite(valor);
  const muestra = n => Number.isSafeInteger(n) && n >= 2;
  if (!(camposTyF[d] || []).filter(campo => !['tipoDispersion', 'escenario'].includes(campo)).every(campo => numerico(p[campo]))) return fallo('Completa todos los parámetros con números finitos.');
  if (d === 'student' && (!muestra(p.n) || p.s <= 0 || !['desviacion', 'varianza'].includes(p.tipoDispersion))) return fallo('Ingresa una dispersión positiva y un tamaño de muestra entero de al menos 2.');
  if (d !== 'student' && (!muestra(p.n1) || !muestra(p.n2))) return fallo('Ambas muestras deben tener tamaños enteros de al menos 2.');
  if (d === 'razon_varianzas' && (p.varPob1 <= 0 || p.varPob2 <= 0)) return fallo('Las varianzas de ambas poblaciones deben ser positivas.');
  if (d === 'dif_medias_desc') {
    if (p.s1 < 0 || p.s2 < 0 || (p.s1 === 0 && p.s2 === 0) || !['grandes', 'iguales', 'distintas'].includes(p.escenario)) return fallo('Revisa las desviaciones muestrales y el escenario; la dispersión conjunta debe ser positiva.');
    if ((p.escenario === 'grandes') !== (p.n1 + p.n2 > 30)) return fallo('Muestras grandes requiere n₁ + n₂ > 30; los escenarios de muestras pequeñas requieren n₁ + n₂ ≤ 30.');
  }
  const c = normalizarCondicion(receta.condicion);
  if (c && (!['menor_que', 'mayor_que', 'entre'].includes(c.tipo) || !numerico(c.x1)
      || (c.tipo === 'entre' && (!numerico(c.x2) || c.x2 <= c.x1)) || (d === 'razon_varianzas' && c.x1 < 0))) return fallo('Completa la condición con límites numéricos ordenados; las razones no pueden ser negativas.');
  try {
    let base;
    let resultados;
    if (d === 'dif_medias_desc') {
      const calculo = calcularDiferenciaTyF(p, c);
      if (calculo.error) return calculo;
      base = calculo.base; resultados = calculo.resultado;
    } else {
      base = d === 'student' ? generarDistribucionStudent(p.mu, p.s, p.n, p.tipoDispersion)
        : calcularParametrosRazonVarianzas(p.varPob1, p.n1, p.varPob2, p.n2);
      if (base.error) return base;
      resultados = base;
      if (c) {
        const consulta = (d === 'student' ? calcularProbabilidadStudent : calcularProbabilidadRazonVarianzas)(base, c.tipo, c.x1, c.x2 ?? '');
        if (consulta.error) return consulta;
        resultados = { ...base, ...consulta };
      }
    }
    if (Object.values(base).some(valor => typeof valor === 'number' && !Number.isFinite(valor))
        || (d === 'student' && base.se <= 0) || (d === 'dif_medias_desc' && (base.se <= 0 || (base.statType === 'T' && base.v <= 0)))
        || (d === 'razon_varianzas' && base.razonVarPob <= 0)
        || (c && (!Number.isFinite(resultados.probFinal) || resultados.probFinal < 0 || resultados.probFinal > 1))) return fallo('No se obtuvo una distribución válida. Revisa la dispersión, los tamaños y los grados de libertad.');
    return { resultado: { operacion: 'tyf', modo: 'manual', distribucion: d, resultados,
      _baseTyF: base, _entradaTyF: firmaRecetaTyF(receta) } };
  } catch {
    return fallo('No se pudo reconstruir T y F con los parámetros guardados.');
  }
};
export const validarTyFGuardable = datos => !!datos.resultadoMuestral
  && datos.resultadoMuestral._entradaTyF === firmaRecetaTyF(crearRecetaTyF(datos));
export const puedeActualizarHistorialTyF = (datos, snapshot) => {
  const actual = crearRecetaTyF(datos);
  const anterior = leerRecetaTyF(snapshot);
  return validarTyFGuardable(datos) && actual.distribucion === anterior.distribucion && actual.modo === anterior.modo
    && firmaRecetaTyF(actual) !== firmaRecetaTyF(anterior);
};
