/**
 * avhCalculations.js
 * Lógica pura (sin React) del Análisis Vertical y Horizontal.
 * - Modelo de datos y migración de formatos antiguos.
 * - Totales de Balance y Estado de Resultados.
 * - Análisis vertical (estructura) y horizontal (evolución) por cuenta.
 * - Indicadores financieros con semáforo y tendencia.
 * - Hallazgos automáticos y construcción del reporte PDF.
 */

export const ID_HERRAMIENTA = 'interno-vertical-horizontal';
export const MONEDAS = ['BOB', 'USD', 'EUR'];
export const UMBRAL_DEFECTO = 10;
export const UMBRAL_MIN = 1;
export const UMBRAL_MAX = 100;

/* sentido: 1 = un aumento es favorable, -1 = un aumento es desfavorable, 0 = neutral */
export const ESTADOS = [
  {
    id: 'balance', nombre: 'Balance general', baseId: 'activos', baseNombre: 'total de activos', baseConArticulo: 'el total de activos', baseDel: 'del total de activos',
    categorias: [
      { id: 'activo_corriente', nombre: 'Activo corriente', sentido: 1, grupo: 'activo' },
      { id: 'activo_no_corriente', nombre: 'Activo no corriente', sentido: 1, grupo: 'activo' },
      { id: 'pasivo_corriente', nombre: 'Pasivo corriente', sentido: 0, grupo: 'pasivo' },
      { id: 'pasivo_no_corriente', nombre: 'Pasivo no corriente', sentido: 0, grupo: 'pasivo' },
      { id: 'patrimonio', nombre: 'Patrimonio', sentido: 1, grupo: 'patrimonio' }
    ]
  },
  {
    id: 'resultados', nombre: 'Estado de resultados', baseId: 'ingresos', baseNombre: 'ingresos netos', baseConArticulo: 'los ingresos netos', baseDel: 'de los ingresos netos',
    categorias: [
      { id: 'ingresos', nombre: 'Ingresos netos', sentido: 1, grupo: 'ingreso' },
      { id: 'costos', nombre: 'Costo de ventas', sentido: -1, grupo: 'gasto' },
      { id: 'gastos_operativos', nombre: 'Gastos operativos', sentido: -1, grupo: 'gasto' },
      { id: 'depreciacion', nombre: 'Depreciación y amortización', sentido: -1, grupo: 'gasto' },
      { id: 'gastos_financieros', nombre: 'Gastos financieros', sentido: -1, grupo: 'gasto' },
      { id: 'impuestos', nombre: 'Impuestos', sentido: -1, grupo: 'gasto' }
    ]
  }
];

export const obtenerEstado = id => ESTADOS.find(estado => estado.id === id) || ESTADOS[0];

export const CUENTAS_BASE = {
  balance: [
    ['activo_corriente', 'Efectivo y equivalentes'], ['activo_corriente', 'Cuentas por cobrar'], ['activo_corriente', 'Inventarios'],
    ['activo_corriente', 'Otros activos corrientes'], ['activo_no_corriente', 'Propiedad, planta y equipo neto'], ['activo_no_corriente', 'Activos intangibles'],
    ['pasivo_corriente', 'Cuentas por pagar'], ['pasivo_corriente', 'Deuda financiera de corto plazo'], ['pasivo_no_corriente', 'Deuda financiera de largo plazo'],
    ['pasivo_no_corriente', 'Otros pasivos de largo plazo'], ['patrimonio', 'Capital aportado'], ['patrimonio', 'Resultados acumulados']
  ],
  resultados: [
    ['ingresos', 'Ventas netas'], ['costos', 'Costo de ventas'], ['gastos_operativos', 'Gastos de personal'], ['gastos_operativos', 'Alquiler y servicios'],
    ['gastos_operativos', 'Marketing y ventas'], ['depreciacion', 'Depreciación y amortización'], ['gastos_financieros', 'Intereses y comisiones'], ['impuestos', 'Impuesto a las utilidades']
  ]
};

/** Líneas calculadas que se muestran justo después de la categoría indicada. */
const LINEAS_CALCULADAS = {
  balance: {
    activo_no_corriente: [{ id: 'activos', nombre: 'Total activos', sentido: 1 }],
    pasivo_no_corriente: [{ id: 'pasivos', nombre: 'Total pasivos', sentido: 0 }],
    patrimonio: [{ id: 'pasivoPatrimonio', nombre: 'Total pasivo + patrimonio', sentido: 0 }]
  },
  resultados: {
    costos: [{ id: 'utilidadBruta', nombre: 'Utilidad bruta', sentido: 1 }],
    depreciacion: [{ id: 'utilidadOperativa', nombre: 'Utilidad operativa', sentido: 1 }],
    impuestos: [{ id: 'utilidadNeta', nombre: 'Utilidad neta', sentido: 1 }]
  }
};

/* ------------------------------------------------------------------ */
/* Utilidades numéricas                                               */
/* ------------------------------------------------------------------ */

export const crearId = () => `avh-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
export const estaVacio = valor => valor === '' || valor === undefined || valor === null;

export function valorNumerico(valor) {
  const normalizado = typeof valor === 'string' ? valor.replace(/,/g, '').trim() : valor;
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : 0;
}

const dividir = (numerador, denominador) => (denominador ? numerador / denominador : null);
export const variacionPorcentual = (anterior, actual) => (anterior ? ((actual - anterior) / Math.abs(anterior)) * 100 : null);
const porcentajeDe = (valor, base) => (base ? (valor / base) * 100 : null);

/** Convierte "1.234,56", "1,234.56", "(500)" o "-12" en número; devuelve null si no es válido. */
export function parsearNumero(texto) {
  let limpio = String(texto ?? '').trim().replace(/[^\d.,()\-−]/g, '').replace('−', '-');
  if (!limpio) return null;
  let negativo = false;
  if (/^\(.*\)$/.test(limpio)) { negativo = true; limpio = limpio.slice(1, -1); }
  if (limpio.startsWith('-')) { negativo = !negativo; limpio = limpio.slice(1); }
  const ultimaComa = limpio.lastIndexOf(',');
  const ultimoPunto = limpio.lastIndexOf('.');
  if (ultimaComa >= 0 && ultimoPunto >= 0) {
    const decimal = ultimaComa > ultimoPunto ? ',' : '.';
    limpio = limpio.split(decimal === ',' ? '.' : ',').join('').replace(decimal, '.');
  } else if (ultimaComa >= 0) {
    limpio = /,\d{1,2}$/.test(limpio) && limpio.indexOf(',') === ultimaComa ? limpio.replace(',', '.') : limpio.replace(/,/g, '');
  }
  const numero = Number(limpio);
  return Number.isFinite(numero) ? (negativo ? -numero : numero) : null;
}

/** Lee líneas "Cuenta ⇥ periodo base ⇥ periodo actual" (Excel/Sheets/CSV con ;). */
export function parsearTextoTabla(texto) {
  return String(texto || '').split(/\r?\n/).map(linea => linea.trim()).filter(Boolean).reduce((resultado, linea) => {
    let partes = linea.split(/\t|;/).map(parte => parte.trim()).filter(parte => parte !== '');
    if (partes.length < 3) {
      const coincidencia = linea.match(/^(.*?)\s{1,}(\(?-?[\d.,]+\)?)\s+(\(?-?[\d.,]+\)?)$/);
      if (coincidencia) partes = [coincidencia[1], coincidencia[2], coincidencia[3]];
    }
    if (partes.length < 3) return resultado;
    const cuenta = partes.slice(0, -2).join(' ');
    const [base, actual] = partes.slice(-2);
    const valorBase = parsearNumero(base);
    const valorActual = parsearNumero(actual);
    if (!cuenta || valorBase === null || valorActual === null) return resultado;
    resultado.push({ cuenta, anterior: valorBase, actual: valorActual });
    return resultado;
  }, []);
}

/* ------------------------------------------------------------------ */
/* Modelo de datos                                                    */
/* ------------------------------------------------------------------ */

function migrarFilas(origen) {
  const lista = Array.isArray(origen) ? origen : [];
  return lista.map(fila => {
    if (fila.estado === 'Balance general' || fila.estado === 'Estado de resultados') {
      const esBalance = fila.estado === 'Balance general';
      return {
        id: fila.id || crearId(), estado: esBalance ? 'balance' : 'resultados',
        categoria: esBalance ? (String(fila.cuenta).toLowerCase().includes('activo') ? 'activo_corriente' : 'patrimonio') : 'ingresos',
        cuenta: fila.cuenta || '', anterior: fila.periodoAnterior ?? '', actual: fila.periodoActual ?? ''
      };
    }
    return fila;
  });
}

/** Normaliza lo guardado (incluidos formatos antiguos) en un objeto con valores por defecto. */
export function normalizarContenido(contenido) {
  const base = Array.isArray(contenido) ? { filas: contenido } : (contenido || {});
  const umbral = Number(base.umbral);
  return {
    filas: migrarFilas(base.filas),
    periodoAnterior: base.periodoAnterior || 'Periodo anterior',
    periodoActual: base.periodoActual || 'Periodo actual',
    moneda: MONEDAS.includes(base.moneda) ? base.moneda : 'BOB',
    umbral: !estaVacio(base.umbral) && Number.isFinite(umbral) ? Math.min(UMBRAL_MAX, Math.max(UMBRAL_MIN, umbral)) : UMBRAL_DEFECTO,
    umbralEntrada: estaVacio(base.umbral) ? UMBRAL_DEFECTO : base.umbral,
    hallazgos: base.hallazgos || '',
    documentos: Array.isArray(base.documentos) ? base.documentos : []
  };
}

export const tieneSaldos = (filas, estadoId) => filas.some(fila => fila.estado === estadoId && (!estaVacio(fila.anterior) || !estaVacio(fila.actual)));

/* ------------------------------------------------------------------ */
/* Totales por estado                                                 */
/* ------------------------------------------------------------------ */

const sumarCategoria = (filas, estadoId, categoria, campo) =>
  filas.filter(fila => fila.estado === estadoId && fila.categoria === categoria).reduce((total, fila) => total + valorNumerico(fila[campo]), 0);

export function calcularBalance(filas, campo) {
  const sumar = categoria => sumarCategoria(filas, 'balance', categoria, campo);
  const activoCorriente = sumar('activo_corriente');
  const activoNoCorriente = sumar('activo_no_corriente');
  const pasivoCorriente = sumar('pasivo_corriente');
  const pasivoNoCorriente = sumar('pasivo_no_corriente');
  const patrimonio = sumar('patrimonio');
  const activos = activoCorriente + activoNoCorriente;
  const pasivos = pasivoCorriente + pasivoNoCorriente;
  const inventarios = filas
    .filter(fila => fila.estado === 'balance' && fila.categoria === 'activo_corriente' && /invent/i.test(fila.cuenta || ''))
    .reduce((total, fila) => total + valorNumerico(fila[campo]), 0);
  return {
    activoCorriente, activoNoCorriente, activos, pasivoCorriente, pasivoNoCorriente, pasivos, patrimonio,
    pasivoPatrimonio: pasivos + patrimonio, diferencia: activos - pasivos - patrimonio, inventarios
  };
}

export function calcularResultados(filas, campo) {
  const sumar = categoria => sumarCategoria(filas, 'resultados', categoria, campo);
  const ingresos = sumar('ingresos');
  const costos = sumar('costos');
  const gastosOperativos = sumar('gastos_operativos');
  const depreciacion = sumar('depreciacion');
  const gastosFinancieros = sumar('gastos_financieros');
  const impuestos = sumar('impuestos');
  const utilidadBruta = ingresos - costos;
  const utilidadOperativa = utilidadBruta - gastosOperativos - depreciacion;
  return {
    ingresos, costos, utilidadBruta, gastosOperativos, depreciacion, utilidadOperativa,
    ebitda: utilidadOperativa + depreciacion, gastosFinancieros, impuestos,
    utilidadNeta: utilidadOperativa - gastosFinancieros - impuestos
  };
}

/** Totales de ambos periodos: { anterior: {balance, resultados}, actual: {balance, resultados} } */
export function calcularTotales(filas) {
  return {
    anterior: { balance: calcularBalance(filas, 'anterior'), resultados: calcularResultados(filas, 'anterior') },
    actual: { balance: calcularBalance(filas, 'actual'), resultados: calcularResultados(filas, 'actual') }
  };
}

/** Tolerancia contable: 0,5% del activo o una unidad monetaria. */
export function validarCuadre(balance) {
  const tolerancia = Math.max(1, Math.abs(balance.activos) * 0.005);
  return { diferencia: balance.diferencia, cuadra: Math.abs(balance.diferencia) <= tolerancia };
}

/* ------------------------------------------------------------------ */
/* Análisis vertical y horizontal                                     */
/* ------------------------------------------------------------------ */

/** Une, para una línea, su peso vertical en cada periodo y su variación horizontal. */
export function analizarLinea({ anterior, actual, baseAnterior, baseActual, sentido, umbral }) {
  const cambio = actual - anterior;
  const cambioPct = anterior ? (cambio / Math.abs(anterior)) * 100 : null;
  const pesoAnterior = porcentajeDe(anterior, baseAnterior);
  const pesoActual = porcentajeDe(actual, baseActual);
  const relevante = cambioPct !== null ? Math.abs(cambioPct) >= umbral : (anterior === 0 && actual !== 0);
  let tono = 'neutral';
  if (cambio !== 0 && sentido !== 0) tono = cambio * sentido > 0 ? 'positivo' : 'negativo';
  return {
    anterior, actual, cambio, cambioPct, pesoAnterior, pesoActual, relevante, tono,
    deltaPeso: pesoAnterior !== null && pesoActual !== null ? pesoActual - pesoAnterior : null
  };
}

/** Devuelve los bloques (categoría → cuentas, subtotal y líneas calculadas) de un estado. */
export function analizarEstado(filas, estadoId, totales, umbral) {
  const estado = obtenerEstado(estadoId);
  const clave = estado.baseId;
  const baseAnterior = totales.anterior[estado.id][clave];
  const baseActual = totales.actual[estado.id][clave];
  const contexto = { baseAnterior, baseActual, umbral };
  return estado.categorias.map(categoria => {
    const cuentas = filas.filter(fila => fila.estado === estado.id && fila.categoria === categoria.id).map(fila => ({
      id: fila.id, nombre: fila.cuenta || 'Cuenta sin nombre',
      ...analizarLinea({ anterior: valorNumerico(fila.anterior), actual: valorNumerico(fila.actual), sentido: categoria.sentido, ...contexto })
    }));
    const suma = campo => cuentas.reduce((total, cuenta) => total + cuenta[campo], 0);
    const subtotal = analizarLinea({ anterior: suma('anterior'), actual: suma('actual'), sentido: categoria.sentido, ...contexto });
    const calculadas = (LINEAS_CALCULADAS[estado.id][categoria.id] || []).map(linea => ({
      ...linea, ...analizarLinea({ anterior: totales.anterior[estado.id][linea.id], actual: totales.actual[estado.id][linea.id], sentido: linea.sentido, ...contexto })
    }));
    return { categoria, cuentas, subtotal, calculadas };
  });
}

/* ------------------------------------------------------------------ */
/* Indicadores financieros                                            */
/* ------------------------------------------------------------------ */

export const GRUPOS_INDICADORES = [
  { id: 'liquidez', nombre: 'Liquidez', pregunta: '¿Puede pagar sus deudas de corto plazo?' },
  { id: 'endeudamiento', nombre: 'Endeudamiento', pregunta: '¿Cuánto depende de terceros?' },
  { id: 'rentabilidad', nombre: 'Rentabilidad', pregunta: '¿Cuánto gana por cada unidad vendida o invertida?' },
  { id: 'eficiencia', nombre: 'Eficiencia', pregunta: '¿Qué tan bien usa sus activos?' }
];

const por = (bueno, alerta) => valor => (valor >= bueno ? 'bueno' : valor >= alerta ? 'alerta' : 'critico');
const menorQue = (bueno, alerta) => valor => (valor <= bueno ? 'bueno' : valor <= alerta ? 'alerta' : 'critico');

const DEFINICIONES = [
  { id: 'razon-corriente', grupo: 'liquidez', nombre: 'Razón corriente', formato: 'veces', mejorSiAumenta: true, formula: 'Activo corriente ÷ Pasivo corriente', referencia: 'Superior a 1,5× suele indicar holgura; menor a 1× sugiere tensión de caja.', calcular: (b) => dividir(b.activoCorriente, b.pasivoCorriente), evaluar: por(1.5, 1) },
  { id: 'prueba-acida', grupo: 'liquidez', nombre: 'Prueba ácida', formato: 'veces', mejorSiAumenta: true, formula: '(Activo corriente − Inventarios) ÷ Pasivo corriente', referencia: 'Mide la cobertura sin depender de vender inventario; ≥ 1× es deseable.', calcular: (b) => dividir(b.activoCorriente - b.inventarios, b.pasivoCorriente), evaluar: por(1, 0.7) },
  { id: 'capital-trabajo', grupo: 'liquidez', nombre: 'Capital de trabajo', formato: 'moneda', mejorSiAumenta: true, formula: 'Activo corriente − Pasivo corriente', referencia: 'Debe ser positivo para sostener la operación diaria.', calcular: (b) => b.activoCorriente - b.pasivoCorriente, evaluar: valor => (valor > 0 ? 'bueno' : 'critico') },
  { id: 'endeudamiento', grupo: 'endeudamiento', nombre: 'Endeudamiento', formato: 'porcentaje', mejorSiAumenta: false, formula: 'Pasivos ÷ Activos', referencia: 'Hasta 50% es cómodo; sobre 70% la empresa depende fuertemente de terceros.', calcular: (b) => dividir(b.pasivos, b.activos), evaluar: menorQue(0.5, 0.7) },
  { id: 'apalancamiento', grupo: 'endeudamiento', nombre: 'Pasivo / patrimonio', formato: 'veces', mejorSiAumenta: false, formula: 'Pasivos ÷ Patrimonio', referencia: 'Compara financiamiento de terceros con recursos propios; ≤ 1× es prudente.', calcular: (b) => dividir(b.pasivos, b.patrimonio), evaluar: valor => (valor < 0 ? 'critico' : menorQue(1, 2)(valor)) },
  { id: 'cobertura-intereses', grupo: 'endeudamiento', nombre: 'Cobertura de intereses', formato: 'veces', mejorSiAumenta: true, formula: 'Utilidad operativa ÷ Gastos financieros', referencia: 'Cuántas veces la utilidad operativa cubre los intereses; ≥ 3× es sólido.', calcular: (b, r) => dividir(r.utilidadOperativa, r.gastosFinancieros), evaluar: por(3, 1.5) },
  { id: 'margen-bruto', grupo: 'rentabilidad', nombre: 'Margen bruto', formato: 'porcentaje', mejorSiAumenta: true, formula: 'Utilidad bruta ÷ Ingresos', referencia: 'Depende del sector; vigila su evolución más que su nivel absoluto.', calcular: (b, r) => dividir(r.utilidadBruta, r.ingresos), evaluar: valor => (valor < 0 ? 'critico' : valor < 0.1 ? 'alerta' : 'bueno') },
  { id: 'margen-operativo', grupo: 'rentabilidad', nombre: 'Margen operativo', formato: 'porcentaje', mejorSiAumenta: true, formula: 'Utilidad operativa ÷ Ingresos', referencia: 'Eficiencia del negocio antes de intereses e impuestos.', calcular: (b, r) => dividir(r.utilidadOperativa, r.ingresos), evaluar: por(0.08, 0) },
  { id: 'margen-ebitda', grupo: 'rentabilidad', nombre: 'Margen EBITDA', formato: 'porcentaje', mejorSiAumenta: true, formula: '(Utilidad operativa + Depreciación) ÷ Ingresos', referencia: 'Aproxima la generación de caja operativa.', calcular: (b, r) => dividir(r.ebitda, r.ingresos), evaluar: por(0.1, 0) },
  { id: 'margen-neto', grupo: 'rentabilidad', nombre: 'Margen neto', formato: 'porcentaje', mejorSiAumenta: true, formula: 'Utilidad neta ÷ Ingresos', referencia: 'Lo que queda de cada unidad vendida; negativo implica pérdidas.', calcular: (b, r) => dividir(r.utilidadNeta, r.ingresos), evaluar: por(0.05, 0) },
  { id: 'roa', grupo: 'rentabilidad', nombre: 'ROA', formato: 'porcentaje', mejorSiAumenta: true, formula: 'Utilidad neta ÷ Activos', referencia: 'Rendimiento de los activos; ≥ 5% es un buen punto de partida.', calcular: (b, r) => dividir(r.utilidadNeta, b.activos), evaluar: por(0.05, 0) },
  { id: 'roe', grupo: 'rentabilidad', nombre: 'ROE', formato: 'porcentaje', mejorSiAumenta: true, formula: 'Utilidad neta ÷ Patrimonio', referencia: 'Rendimiento para los dueños; revísalo junto al endeudamiento.', calcular: (b, r) => dividir(r.utilidadNeta, b.patrimonio), evaluar: por(0.1, 0) },
  { id: 'rotacion-activos', grupo: 'eficiencia', nombre: 'Rotación de activos', formato: 'veces', mejorSiAumenta: true, formula: 'Ingresos ÷ Activos', referencia: 'Ingresos generados por cada unidad invertida en activos.', calcular: (b, r) => dividir(r.ingresos, b.activos), evaluar: null },
  { id: 'rotacion-inventarios', grupo: 'eficiencia', nombre: 'Rotación de inventarios', formato: 'veces', mejorSiAumenta: true, formula: 'Costo de ventas ÷ Inventarios', referencia: 'Detecta la cuenta cuyo nombre contiene "inventario". Más alta = menos capital inmovilizado.', calcular: (b, r) => dividir(r.costos, b.inventarios), evaluar: null },
  { id: 'dias-inventario', grupo: 'eficiencia', nombre: 'Días de inventario', formato: 'dias', mejorSiAumenta: false, formula: '365 ÷ Rotación de inventarios', referencia: 'Días que el inventario permanece antes de venderse.', calcular: (b, r) => { const rotacion = dividir(r.costos, b.inventarios); return rotacion ? 365 / rotacion : null; }, evaluar: null }
];

const valido = valor => valor !== null && valor !== undefined && Number.isFinite(valor);

export function calcularIndicadores(totales) {
  return DEFINICIONES.map(({ calcular, evaluar, ...definicion }) => {
    const anterior = calcular(totales.anterior.balance, totales.anterior.resultados);
    const actual = calcular(totales.actual.balance, totales.actual.resultados);
    const delta = valido(anterior) && valido(actual) ? actual - anterior : null;
    let tendencia = 'sin-base';
    if (delta !== null) tendencia = delta === 0 ? 'igual' : (delta > 0) === definicion.mejorSiAumenta ? 'mejora' : 'empeora';
    return { ...definicion, anterior, actual, delta, tendencia, estado: evaluar && valido(actual) ? evaluar(actual) : null };
  });
}

/* ------------------------------------------------------------------ */
/* Formato                                                            */
/* ------------------------------------------------------------------ */

export function crearFormato(moneda) {
  const intl = new Intl.NumberFormat('es-BO', { style: 'currency', currency: moneda, minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const signo = valor => (valor > 0 ? '+' : '');
  const pct = (valor, decimales = 1) => (valido(valor) ? `${valor.toFixed(decimales)}%` : '—');
  const formato = {
    moneda: valor => intl.format(valido(valor) ? valor : 0),
    pct,
    pctConSigno: (valor, decimales = 1) => (valido(valor) ? `${signo(valor)}${valor.toFixed(decimales)}%` : '—'),
    pp: valor => (valido(valor) ? `${signo(valor)}${valor.toFixed(1)} pp` : '—'),
    monedaConSigno: valor => `${signo(valor)}${intl.format(valor)}`,
    indicador(indicador, valor) {
      if (!valido(valor)) return '—';
      if (indicador.formato === 'moneda') return intl.format(valor);
      if (indicador.formato === 'porcentaje') return pct(valor * 100, 2);
      if (indicador.formato === 'dias') return `${Math.round(valor)} días`;
      return `${valor.toFixed(2)}×`;
    },
    deltaIndicador(indicador) {
      const { delta } = indicador;
      if (!valido(delta)) return 'Sin base de comparación';
      if (indicador.formato === 'moneda') return formato.monedaConSigno(delta);
      if (indicador.formato === 'porcentaje') return formato.pp(delta * 100);
      if (indicador.formato === 'dias') return `${signo(delta)}${Math.round(delta)} días`;
      return `${signo(delta)}${delta.toFixed(2)}×`;
    }
  };
  return formato;
}

/* ------------------------------------------------------------------ */
/* Hallazgos automáticos                                              */
/* ------------------------------------------------------------------ */

export function generarHallazgos({ filas, totales, indicadores, analisis, formato, umbral }) {
  const { anterior, actual } = totales;
  const hallazgos = [];
  const agregar = (nivel, titulo, detalle) => hallazgos.push({ id: `h-${hallazgos.length}`, nivel, titulo, detalle });
  const indicador = id => indicadores.find(item => item.id === id);

  if (!tieneSaldos(filas, 'balance') && !tieneSaldos(filas, 'resultados')) return hallazgos;

  if (tieneSaldos(filas, 'balance')) {
    const { cuadra, diferencia } = validarCuadre(actual.balance);
    agregar(cuadra ? 'ok' : 'warning', cuadra ? 'El balance cuadra' : 'El balance no cuadra',
      cuadra ? 'Activos = Pasivos + Patrimonio dentro de la tolerancia (0,5% del activo).'
        : `La diferencia es ${formato.moneda(diferencia)}. Revisa cuentas omitidas, saldos duplicados, signos o el resultado del ejercicio dentro del patrimonio.`);
  }

  if (tieneSaldos(filas, 'resultados')) {
    const crecimiento = anterior.resultados.ingresos ? ((actual.resultados.ingresos - anterior.resultados.ingresos) / Math.abs(anterior.resultados.ingresos)) * 100 : null;
    if (crecimiento !== null) {
      agregar(crecimiento < 0 ? 'warning' : 'ok', `Ingresos ${crecimiento < 0 ? 'a la baja' : 'en crecimiento'} (${formato.pctConSigno(crecimiento)})`,
        'Descompón el cambio en volumen, precio y mezcla de productos o clientes antes de concluir.');
      const base = (r) => r.costos + r.gastosOperativos;
      const crecimientoGastos = base(anterior.resultados) ? ((base(actual.resultados) - base(anterior.resultados)) / Math.abs(base(anterior.resultados))) * 100 : null;
      if (crecimientoGastos !== null && crecimientoGastos > crecimiento + 2) {
        agregar('warning', 'Costos y gastos crecen más rápido que los ingresos',
          `Costos + gastos operativos ${formato.pctConSigno(crecimientoGastos)} frente a ingresos ${formato.pctConSigno(crecimiento)}: el margen se está comprimiendo.`);
      }
    }
    const margen = indicador('margen-neto');
    if (valido(margen.actual)) {
      const detalle = valido(margen.delta) ? `Variación frente al periodo base: ${formato.deltaIndicador(margen)}.` : 'Completa el periodo base para comparar.';
      agregar(margen.actual < 0 ? 'warning' : margen.estado === 'bueno' ? 'ok' : 'info', `Margen neto de ${formato.indicador(margen, margen.actual)}`, detalle);
    }
  }

  const liquidez = indicador('razon-corriente');
  if (valido(liquidez.actual)) {
    agregar(liquidez.estado === 'bueno' ? 'ok' : 'warning', `Razón corriente de ${formato.indicador(liquidez, liquidez.actual)}`,
      liquidez.estado === 'bueno' ? 'Hay holgura para cubrir las obligaciones de corto plazo.' : 'Revisa vencimientos, cobranzas y el ciclo de conversión de efectivo.');
  }
  const deuda = indicador('endeudamiento');
  if (valido(deuda.actual)) {
    agregar(deuda.estado === 'bueno' ? 'ok' : deuda.estado === 'alerta' ? 'info' : 'warning', `Endeudamiento de ${formato.indicador(deuda, deuda.actual)}`,
      deuda.estado === 'critico' ? 'La empresa depende fuertemente de terceros; evalúa capitalización o reestructuración de deuda.' : 'Contrástalo con el sector y el costo de la deuda.');
  }
  const cobertura = indicador('cobertura-intereses');
  if (valido(cobertura.actual) && cobertura.estado === 'critico') {
    agregar('warning', `Cobertura de intereses débil (${formato.indicador(cobertura, cobertura.actual)})`, 'La utilidad operativa apenas cubre los intereses: riesgo financiero.');
  }

  const cuentas = analisis.flatMap(({ estado, bloques }) => bloques.flatMap(bloque => bloque.cuentas.map(cuenta => ({ ...cuenta, estado, categoriaId: bloque.categoria.id }))));
  const principales = cuentas.filter(cuenta => cuenta.relevante && cuenta.cambioPct !== null).sort((a, b) => Math.abs(b.cambioPct) - Math.abs(a.cambioPct)).slice(0, 3);
  if (principales.length) {
    agregar('info', `Mayores cambios (≥ ${umbral}%)`, principales.map(cuenta => `${cuenta.nombre}: ${formato.pctConSigno(cuenta.cambioPct)}`).join(' · ') + '. Pregúntate qué los explica.');
  }
  const dominante = cuentas.filter(cuenta => cuenta.pesoActual !== null && cuenta.estado.id === 'balance' && cuenta.categoriaId.startsWith('activo')).sort((a, b) => b.pesoActual - a.pesoActual)[0];
  if (dominante && dominante.pesoActual >= 40) {
    agregar('info', `Alta concentración en «${dominante.nombre}»`, `Representa ${formato.pct(dominante.pesoActual)} del total de activos; evalúa su rendimiento y el riesgo de depender de ella.`);
  }
  return hallazgos;
}

export const PLANTILLA_CONCLUSION = [
  'Situación: ¿qué muestran los números en general?',
  'Causas probables: ¿qué explica los cambios más importantes?',
  'Riesgos: ¿qué podría empeorar si no se actúa?',
  'Decisión recomendada: ¿qué debería hacer la empresa y por qué?'
].join('\n\n');

/* ------------------------------------------------------------------ */
/* Gráficos de composición                                            */
/* ------------------------------------------------------------------ */

/** Colores fijos por clasificación (se usan en pantalla y en el PDF). */
export const COLORES_CATEGORIA = {
  activo_corriente: '#2563eb', activo_no_corriente: '#60a5fa',
  pasivo_corriente: '#dc2626', pasivo_no_corriente: '#f87171', patrimonio: '#8b5cf6',
  ingresos: '#10b981', costos: '#f59e0b', gastos_operativos: '#f97316', depreciacion: '#a16207',
  gastos_financieros: '#e11d48', impuestos: '#64748b', utilidad: '#10b981', perdida: '#dc2626'
};

const BARRAS_COMPOSICION = {
  balance: [
    { id: 'activos', nombre: 'Activos', categorias: ['activo_corriente', 'activo_no_corriente'] },
    { id: 'financiamiento', nombre: 'Pasivo + patrimonio', categorias: ['pasivo_corriente', 'pasivo_no_corriente', 'patrimonio'] }
  ],
  resultados: [
    { id: 'destino', nombre: 'Destino de los ingresos', categorias: ['costos', 'gastos_operativos', 'depreciacion', 'gastos_financieros', 'impuestos'], conUtilidad: true }
  ]
};

/**
 * Barras 100% apiladas por periodo.
 * Balance: estructura de activos y de financiamiento. Resultados: en qué se va cada unidad vendida.
 */
export function construirComposicion(estadoId, totales) {
  const estado = obtenerEstado(estadoId);
  const nombreDe = id => estado.categorias.find(categoria => categoria.id === id)?.nombre || id;
  return ['anterior', 'actual'].map(periodo => {
    const totalesPeriodo = totales[periodo];
    const barras = BARRAS_COMPOSICION[estado.id].map(barra => {
      const segmentos = barra.categorias.map(id => ({ id, nombre: nombreDe(id), valor: estado.id === 'balance' ? sumaCategoria(totalesPeriodo.balance, id) : sumaCategoria(totalesPeriodo.resultados, id) }));
      let nota = null;
      if (barra.conUtilidad) {
        const utilidad = totalesPeriodo.resultados.utilidadNeta;
        if (utilidad >= 0) segmentos.push({ id: 'utilidad', nombre: 'Utilidad neta', valor: utilidad });
        else nota = 'Los costos y gastos superan los ingresos: hay pérdida.';
      }
      const base = barra.conUtilidad ? Math.max(totalesPeriodo.resultados.ingresos, segmentos.reduce((total, item) => total + Math.max(0, item.valor), 0)) : segmentos.reduce((total, item) => total + Math.max(0, item.valor), 0);
      return { ...barra, nota, segmentos: segmentos.map(item => ({ ...item, pct: base ? (Math.max(0, item.valor) / base) * 100 : 0, color: COLORES_CATEGORIA[item.id] })) };
    });
    return { periodo, barras, vacio: barras.every(barra => barra.segmentos.every(item => !item.valor)) };
  });
}

function sumaCategoria(totales, categoriaId) {
  const mapa = {
    activo_corriente: 'activoCorriente', activo_no_corriente: 'activoNoCorriente', pasivo_corriente: 'pasivoCorriente',
    pasivo_no_corriente: 'pasivoNoCorriente', patrimonio: 'patrimonio', ingresos: 'ingresos', costos: 'costos',
    gastos_operativos: 'gastosOperativos', depreciacion: 'depreciacion', gastos_financieros: 'gastosFinancieros', impuestos: 'impuestos'
  };
  return totales[mapa[categoriaId]] ?? 0;
}

/* ------------------------------------------------------------------ */
/* Documentación de respaldo                                          */
/* ------------------------------------------------------------------ */

// Definidas en documentosRespaldo.js (compartidas por varias herramientas).
export { DOCUMENTOS_ACEPTADOS, DOCUMENTOS_MAX, DOCUMENTOS_MAX_BYTES, formatearTamano, tipoDocumento } from '../../compartido/documentos/archivosRespaldo';

/* ------------------------------------------------------------------ */
/* Lectura de estructura y evolución (paso 2)                         */
/* ------------------------------------------------------------------ */

/** Puntos clave del estado activo: mayor peso, mayores cambios y giro de estructura. */
export function generarLecturaEstructura(estado, bloques, formato, periodos) {
  const lectura = [];
  const agregar = (nivel, titulo, detalle, tipo) => lectura.push({ id: `l-${lectura.length}`, nivel, titulo, detalle, tipo });
  const categorias = bloques.filter(b => b.cuentas.length).map(b => ({ ...b.subtotal, nombre: b.categoria.nombre, id: b.categoria.id }));
  const cuentas = bloques.flatMap(b => b.cuentas.map(c => ({ ...c, categoriaId: b.categoria.id })));
  if (!categorias.length) return lectura;

  // En resultados se excluyen los ingresos: son la base (≈ 100 %) del análisis vertical.
  const pesada = cuentas
    .filter(c => c.pesoActual !== null && c.categoriaId !== 'ingresos')
    .sort((a, b) => Math.abs(b.pesoActual) - Math.abs(a.pesoActual))[0];
  if (pesada) {
    agregar('info', `Cuenta con mayor peso: ${pesada.nombre}`, `Representa ${formato.pct(pesada.pesoActual)} ${estado.baseDel} en ${periodos.actual} (${formato.pct(pesada.pesoAnterior)} en ${periodos.anterior}).`, 'vertical');
  }
  const giro = categorias.filter(c => c.deltaPeso !== null).sort((a, b) => Math.abs(b.deltaPeso) - Math.abs(a.deltaPeso))[0];
  if (giro && Math.abs(giro.deltaPeso) >= 2) {
    agregar(Math.abs(giro.deltaPeso) >= 5 ? 'warning' : 'info', `Cambio de estructura en ${giro.nombre}`, `Su peso pasó de ${formato.pct(giro.pesoAnterior)} a ${formato.pct(giro.pesoActual)} (${formato.pp(giro.deltaPeso)}).`, 'vertical');
  }
  const favorable = cuentas.filter(c => c.tono === 'positivo').sort((a, b) => Math.abs(b.cambio) - Math.abs(a.cambio))[0];
  if (favorable) agregar('ok', `Mayor variación favorable: ${favorable.nombre}`, `${formato.monedaConSigno(favorable.cambio)} (${formato.pctConSigno(favorable.cambioPct)}) frente a ${periodos.anterior}.`, 'horizontal');
  const desfavorable = cuentas.filter(c => c.tono === 'negativo').sort((a, b) => Math.abs(b.cambio) - Math.abs(a.cambio))[0];
  if (desfavorable) agregar('warning', `Mayor variación desfavorable: ${desfavorable.nombre}`, `${formato.monedaConSigno(desfavorable.cambio)} (${formato.pctConSigno(desfavorable.cambioPct)}). Investiga su causa.`, 'horizontal');
  const total = bloques.flatMap(b => b.calculadas).find(l => l.id === (estado.id === 'balance' ? 'activos' : 'utilidadNeta'));
  if (total) agregar(total.tono === 'negativo' ? 'warning' : 'ok', `${total.nombre}: ${formato.pctConSigno(total.cambioPct)}`, `Pasó de ${formato.moneda(total.anterior)} a ${formato.moneda(total.actual)}.`, 'horizontal');
  return lectura;
}

