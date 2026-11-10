/**
 * efiCalculations.js
 * Lógica pura de negocio y cálculos matemáticos para la Matriz EFI (Evaluación de Factores Internos).
 * Metodología estándar de Auditoría Estratégica Interna (Fred R. David / Humberto Serna Gómez).
 */

// ============================================================================
// ÁREAS FUNCIONALES ORGANIZACIONALES (DIMENSIONES INTERNAS)
// ============================================================================
export const AREAS_FUNCIONALES = [
  {
    id: 'administracion',
    nombre: 'Administración y Gerencia',
    descripcion: 'Estructura organizativa, liderazgo, planificación estratégica, cultura y toma de decisiones.',
    color: '#6366f1',
    bgBadge: 'rgba(99, 102, 241, 0.12)',
    borderBadge: 'rgba(99, 102, 241, 0.28)'
  },
  {
    id: 'marketing',
    nombre: 'Marketing y Ventas',
    descripcion: 'Posicionamiento de marca, precios, canales de distribución, publicidad y lealtad de clientes.',
    color: '#ec4899',
    bgBadge: 'rgba(236, 72, 153, 0.12)',
    borderBadge: 'rgba(236, 72, 153, 0.28)'
  },
  {
    id: 'operaciones',
    nombre: 'Operaciones y Producción',
    descripcion: 'Capacidad productiva, control de calidad, logística interna, cadena de suministros y costos.',
    color: '#f97316',
    bgBadge: 'rgba(249, 115, 22, 0.12)',
    borderBadge: 'rgba(249, 115, 22, 0.28)'
  },
  {
    id: 'finanzas',
    nombre: 'Finanzas y Contabilidad',
    descripcion: 'Liquidez, rentabilidad operativa, endeudamiento, flujo de caja y solvencia crediticia.',
    color: '#10b981',
    bgBadge: 'rgba(16, 185, 129, 0.12)',
    borderBadge: 'rgba(16, 185, 129, 0.28)'
  },
  {
    id: 'talento',
    nombre: 'Talento Humano y Organización',
    descripcion: 'Clima laboral, competencias del personal, programas de capacitación, retención y motivación.',
    color: '#8b5cf6',
    bgBadge: 'rgba(139, 92, 246, 0.12)',
    borderBadge: 'rgba(139, 92, 246, 0.28)'
  },
  {
    id: 'tecnologia',
    nombre: 'Tecnología e Innovación (I+D)',
    descripcion: 'Sistemas ERP/CRM, digitalización, automatización de procesos, patentes e infraestructura TI.',
    color: '#06b6d4',
    bgBadge: 'rgba(6, 182, 212, 0.12)',
    borderBadge: 'rgba(6, 182, 212, 0.28)'
  }
];

// ============================================================================
// ESCALA DE CALIFICACIÓN OFICIAL EFI (1 a 4) - FRED R. DAVID
// ============================================================================
export const ESCALA_RATING_EFI = {
  1: {
    valor: 1,
    tipo: 'Debilidad',
    label: 'Debilidad Mayor (Crítica)',
    labelCorto: 'Debilidad Mayor',
    descripcion: 'Deficiencia interna severa que expone a la empresa frente a rivales.',
    color: '#ef4444',
    bgBadge: 'rgba(239, 68, 68, 0.15)',
    borderBadge: 'rgba(239, 68, 68, 0.35)'
  },
  2: {
    valor: 2,
    tipo: 'Debilidad',
    label: 'Debilidad Menor',
    labelCorto: 'Debilidad Menor',
    descripcion: 'Aspecto deficiente corregible a corto/mediano plazo.',
    color: '#f59e0b',
    bgBadge: 'rgba(245, 158, 11, 0.15)',
    borderBadge: 'rgba(245, 158, 11, 0.35)'
  },
  3: {
    valor: 3,
    tipo: 'Fortaleza',
    label: 'Fortaleza Menor',
    labelCorto: 'Fortaleza Menor',
    descripcion: 'Capacidad interna positiva o desempeño por encima del promedio del sector.',
    color: '#14b8a6',
    bgBadge: 'rgba(20, 184, 166, 0.15)',
    borderBadge: 'rgba(20, 184, 166, 0.35)'
  },
  4: {
    valor: 4,
    tipo: 'Fortaleza',
    label: 'Fortaleza Mayor (Distintiva)',
    labelCorto: 'Fortaleza Mayor',
    descripcion: 'Competencia distintiva clave que constituye una ventaja competitiva sostenible.',
    color: '#10b981',
    bgBadge: 'rgba(16, 185, 129, 0.15)',
    borderBadge: 'rgba(16, 185, 129, 0.35)'
  }
};


// ============================================================================
// CÁLCULOS MATEMÁTICOS DE LA MATRIZ EFI
// ============================================================================

/**
 * Calcula la sumatoria total de los pesos asignados a los factores.
 */
export function calcularSumaPesosEfi(factores = []) {
  if (!Array.isArray(factores) || factores.length === 0) return 0;
  const suma = factores.reduce((acc, f) => acc + (parseFloat(f.peso) || 0), 0);
  return Math.round(suma * 1000) / 1000;
}

/**
 * Valida si la suma de pesos es exactamente 1.00 (con tolerancia de redondeo de ±0.005).
 */
export function esSumaPesosEfiValida(factores = []) {
  const suma = calcularSumaPesosEfi(factores);
  return suma >= 0.995 && suma <= 1.005;
}

/**
 * Calcula la puntuación ponderada individual de un factor (Peso × Calificación).
 */
export function calcularPuntajePonderadoEfi(peso = 0, calificacion = 0) {
  const p = parseFloat(peso) || 0;
  const c = parseInt(calificacion, 10) || 0;
  return Math.round(p * c * 100) / 100;
}

/**
 * Calcula todos los agregados, sumatorias y totales de la Matriz EFI.
 */
export function calcularTotalesEfi(factores = []) {
  const sumaPesos = calcularSumaPesosEfi(factores);
  const esValida = esSumaPesosEfiValida(factores);

  let sumaPesosF = 0;
  let sumaPesosD = 0;
  let totalPonderadoF = 0;
  let totalPonderadoD = 0;
  let numFortalezas = 0;
  let numDebilidades = 0;

  factores.forEach(f => {
    const p = parseFloat(f.peso) || 0;
    const c = parseInt(f.calificacion, 10) || 0;
    const ponderado = p * c;

    if (f.tipo === 'Fortaleza') {
      sumaPesosF += p;
      totalPonderadoF += ponderado;
      numFortalezas++;
    } else {
      sumaPesosD += p;
      totalPonderadoD += ponderado;
      numDebilidades++;
    }
  });

  const totalPonderadoGlobal = Math.round((totalPonderadoF + totalPonderadoD) * 100) / 100;

  return {
    sumaPesos,
    esSumaValida: esValida,
    numFactores: factores.length,
    numFortalezas,
    numDebilidades,
    sumaPesosFortalezas: Math.round(sumaPesosF * 1000) / 1000,
    sumaPesosDebilidades: Math.round(sumaPesosD * 1000) / 1000,
    totalPonderadoFortalezas: Math.round(totalPonderadoF * 100) / 100,
    totalPonderadoDebilidades: Math.round(totalPonderadoD * 100) / 100,
    totalPonderadoGlobal
  };
}

/**
 * Determina el diagnóstico metodológico según la regla de Fred R. David:
 * - Promedio teórico: 2.50
 * - > 2.50: Posición interna fuerte
 * - < 2.50: Posición interna débil
 */
export function determinarDiagnosticoInterno(totalPonderado = 2.50) {
  const score = parseFloat(totalPonderado) || 2.50;

  if (score >= 3.20) {
    return {
      postura: 'Posición Interna Muy Fuerte',
      estado: 'fuerte_superior',
      color: '#10b981',
      badgeClass: 'diagnostico-fuerte',
      descripcion: `Con un puntaje ponderado de ${score.toFixed(2)} (muy superior a la media de 2.50), la empresa cuenta con competencias distintivas sólidas y una ventaja interna sobresaliente para competir en el mercado.`,
      recomendacion: 'Capitalizar las fortalezas distintivas para expandir cuota de mercado e impulsar estrategias agresivas (FO).'
    };
  } else if (score >= 2.51) {
    return {
      postura: 'Posición Interna Favorable',
      estado: 'fuerte',
      color: '#14b8a6',
      badgeClass: 'diagnostico-fuerte',
      descripcion: `Con un puntaje de ${score.toFixed(2)} (por encima del promedio teórico de 2.50), la organización responde positivamente a sus requerimientos internos; sus fortalezas superan a las debilidades.`,
      recomendacion: 'Mantener el blindaje de capacidades operativas y corregir gradualmente las debilidades menores.'
    };
  } else if (score === 2.50) {
    return {
      postura: 'Posición Interna Promedio',
      estado: 'neutro',
      color: '#f59e0b',
      badgeClass: 'diagnostico-neutro',
      descripcion: `Puntaje exactamente en el umbral medio (2.50). Las fortalezas compensan de manera ajustada a las debilidades sin generar una clara ventaja competitiva.`,
      recomendacion: 'Reforzar las áreas funcionales rezagadas para superar la media sectorial.'
    };
  } else if (score >= 2.00) {
    return {
      postura: 'Posición Interna Débil',
      estado: 'debil',
      color: '#f97316',
      badgeClass: 'diagnostico-debil',
      descripcion: `Con un puntaje de ${score.toFixed(2)} (por debajo de la media de 2.50), las debilidades internas predominan y comprometen la eficiencia y competitividad de la organización.`,
      recomendacion: 'Priorizar de inmediato la reestructuración interna y planes de mejora en los factores calificados con 1 (Debilidades Mayores).'
    };
  } else {
    return {
      postura: 'Posición Interna Crítica',
      estado: 'critico',
      color: '#ef4444',
      badgeClass: 'diagnostico-critico',
      descripcion: `Con un puntaje crítico de ${score.toFixed(2)}, la organización enfrenta serias limitaciones estructurales internas que amenazan su viabilidad operativa.`,
      recomendacion: 'Implementar medidas de contingencia inmediatas para mitigar las debilidades graves antes de abordar iniciativas de crecimiento.'
    };
  }
}

/**
 * Agrupa y calcula el desempeño ponderado por cada una de las 6 áreas funcionales.
 */
export function calcularDesglosePorArea(factores = []) {
  // Áreas escritas por el usuario («Otro»): cada nombre distinto forma su propia fila, con color neutro.
  const conocida = f => AREAS_FUNCIONALES.some(area => f.area === area.nombre || f.area === area.id);
  const personalizadas = [...new Set(factores.filter(f => !conocida(f)).map(f => (f.area || '').trim() || 'Otra área'))]
    .map(nombre => ({ id: `otro-${nombre}`, nombre, descripcion: 'Área definida por el usuario.', color: '#64748b', personalizada: true }));
  return [...AREAS_FUNCIONALES, ...personalizadas].map(area => {
    const factoresArea = factores.filter(f => (area.personalizada ? !conocida(f) && ((f.area || '').trim() || 'Otra área') === area.nombre : f.area === area.nombre || f.area === area.id));
    const sumaPesos = factoresArea.reduce((acc, f) => acc + (parseFloat(f.peso) || 0), 0);
    const ponderado = factoresArea.reduce(
      (acc, f) => acc + (parseFloat(f.peso) || 0) * (parseInt(f.calificacion, 10) || 0),
      0
    );
    const fortalezas = factoresArea.filter(f => f.tipo === 'Fortaleza').length;
    const debilidades = factoresArea.filter(f => f.tipo === 'Debilidad').length;

    return {
      ...area,
      totalFactores: factoresArea.length,
      fortalezas,
      debilidades,
      sumaPesos: Math.round(sumaPesos * 1000) / 1000,
      puntajePonderado: Math.round(ponderado * 100) / 100
    };
  });
}

/**
 * Redistribuye equitativamente el peso relativo (1.00) entre todos los factores existentes.
 */
export function equilibrarPesosEfi(factores = []) {
  const n = factores.length;
  if (n === 0) return [];

  const pesoBase = Math.floor((1.0 / n) * 100) / 100;
  let restante = Math.round((1.0 - pesoBase * n) * 100) / 100;

  return factores.map((f) => {
    let extra = 0;
    if (restante > 0) {
      extra = 0.01;
      restante = Math.round((restante - 0.01) * 100) / 100;
    }
    const nuevoPeso = Math.round((pesoBase + extra) * 100) / 100;
    return {
      ...f,
      peso: nuevoPeso
    };
  });
}

/**
 * Extrae ideas clasificadas como de ámbito 'Interno' de la Lluvia de Ideas para importación directa en EFI.
 */
export function generarPayloadFodaDesdeEFI(factores = []) {
  return factores.map((f, idx) => {
    const esF = f.tipo === 'Fortaleza';
    return {
      id: f.id || `efi-${idx + 1}`,
      codigo: f.codigo || (esF ? `F${idx + 1}` : `D${idx + 1}`),
      tipo: f.tipo,
      tipoAmbito: 'Interno',
      cuadranteCorrecto: esF ? 'Fortalezas' : 'Debilidades',
      texto: f.titulo,
      categoria: f.area || 'Capacidades Internas',
      fuente: 'Matriz EFI (Evaluación de Factores Internos)',
      pesoEfi: f.peso,
      calificacionEfi: f.calificacion,
      puntajePonderadoEfi: calcularPuntajePonderadoEfi(f.peso, f.calificacion),
      evidencias: f.evidencias || [],
      origenPaso: 'Paso 5: Matriz EFI',
      origen: 'Matriz EFI'
    };
  });
}

/**
 * Lectura automática de la matriz: postura, pesos, calificaciones fuera de regla,
 * factores clave y área funcional más débil.
 */
export function generarHallazgosEfi(factores = []) {
  const hallazgos = [];
  const agregar = (nivel, titulo, detalle) => hallazgos.push({ id: `h-${hallazgos.length}`, nivel, titulo, detalle });
  if (!factores.length) return hallazgos;
  const totales = calcularTotalesEfi(factores);
  const diagnostico = determinarDiagnosticoInterno(totales.totalPonderadoGlobal);
  agregar(totales.totalPonderadoGlobal > 2.5 ? 'ok' : 'warning', `${diagnostico.postura} (${totales.totalPonderadoGlobal.toFixed(2)})`, diagnostico.recomendacion);
  if (!totales.esSumaValida) agregar('warning', `Los pesos suman ${totales.sumaPesos.toFixed(2)}`, 'La suma debe ser exactamente 1.00 para que el puntaje sea válido. Ajusta los pesos o usa «Equilibrar».');
  const fueraDeRegla = factores.filter(f => (f.tipo === 'Fortaleza' && Number(f.calificacion) < 3) || (f.tipo === 'Debilidad' && Number(f.calificacion) > 2));
  if (fueraDeRegla.length) agregar('warning', 'Calificaciones fuera de la regla de Fred R. David', `${fueraDeRegla.map(f => f.codigo).join(', ')}: las fortalezas se califican 3–4 y las debilidades 1–2.`);
  if (!totales.numFortalezas || !totales.numDebilidades) agregar('warning', 'La matriz está incompleta', 'Debe incluir tanto fortalezas como debilidades.');
  if (factores.length < 10) agregar('info', `${factores.length} factores registrados`, 'La metodología recomienda entre 10 y 20 factores clave para un diagnóstico representativo.');
  const porImpacto = [...factores].sort((a, b) => calcularPuntajePonderadoEfi(b.peso, b.calificacion) - calcularPuntajePonderadoEfi(a.peso, a.calificacion));
  const fortaleza = porImpacto.find(f => f.tipo === 'Fortaleza');
  if (fortaleza) agregar('ok', `Fortaleza clave: ${fortaleza.codigo}`, `${fortaleza.titulo} (ponderado ${calcularPuntajePonderadoEfi(fortaleza.peso, fortaleza.calificacion).toFixed(2)}). Apalancarla en estrategias FO.`);
  const critica = [...factores].filter(f => f.tipo === 'Debilidad').sort((a, b) => (Number(b.peso) || 0) - (Number(a.peso) || 0) || Number(a.calificacion) - Number(b.calificacion))[0];
  if (critica) agregar('warning', `Debilidad prioritaria: ${critica.codigo}`, `${critica.titulo} (peso ${Number(critica.peso || 0).toFixed(2)}, calificación ${critica.calificacion}). Prioriza su plan de mejora.`);
  const areas = calcularDesglosePorArea(factores).filter(a => a.sumaPesos > 0).map(a => ({ ...a, promedio: a.puntajePonderado / a.sumaPesos }));
  if (areas.length > 1) {
    const debil = areas.reduce((a, b) => (b.promedio < a.promedio ? b : a));
    if (debil.promedio < 2.5) agregar('info', `Área más débil: ${debil.nombre}`, `Calificación media ${debil.promedio.toFixed(2)} sobre 4.`);
  }
  const sinEvidencia = factores.filter(f => !(f.evidencias || []).length);
  if (sinEvidencia.length === factores.length) agregar('info', 'Factores sin evidencia', 'Respalda al menos los factores de mayor peso con documentos o enlaces del caso.');
  return hallazgos;
}

export const PLANTILLA_CONCLUSION_EFI = [
  'Postura interna: ¿la empresa es fuerte o débil internamente y por qué?',
  'Fortalezas a apalancar: ¿cuáles son distintivas y cómo se usarán?',
  'Debilidades a corregir: ¿cuáles son prioritarias y qué acción se propone?',
  'Vínculo con FODA: ¿qué factores pasarán a las estrategias FO, DO, FA y DA?'
].join('\n\n');
