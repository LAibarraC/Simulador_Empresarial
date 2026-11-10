/**
 * mpcCalculations.js
 * Lógica pura de negocio y cálculos matemáticos para la Matriz de Perfil Competitivo (MPC).
 * Metodología estándar de Dirección Estratégica (Fred R. David / Michael Porter).
 */


// ============================================================================
// ESCALA OFICIAL DE CALIFICACIÓN MPC (1 a 4)
// ============================================================================
export const ESCALA_RATING = {
  1: {
    valor: 1,
    label: 'Debilidad Mayor / Crítica',
    labelCorto: 'Debilidad Mayor',
    descripcion: 'Desventaja competitiva grave frente a rivales directos.',
    color: '#EF4444',
    bgBadge: 'rgba(239, 68, 68, 0.15)',
    borderBadge: 'rgba(239, 68, 68, 0.35)',
    icono: 'AlertOctagon'
  },
  2: {
    valor: 2,
    label: 'Debilidad Menor',
    labelCorto: 'Debilidad Menor',
    descripcion: 'Punto débil controlable que requiere optimización gradual.',
    color: '#F59E0B',
    bgBadge: 'rgba(245, 158, 11, 0.15)',
    borderBadge: 'rgba(245, 158, 11, 0.35)',
    icono: 'AlertTriangle'
  },
  3: {
    valor: 3,
    label: 'Fortaleza Menor',
    labelCorto: 'Fortaleza Menor',
    descripcion: 'Rendimiento competitivo positivo por encima del estándar.',
    color: '#14B8A6',
    bgBadge: 'rgba(20, 184, 166, 0.15)',
    borderBadge: 'rgba(20, 184, 166, 0.35)',
    icono: 'Check'
  },
  4: {
    valor: 4,
    label: 'Fortaleza Mayor',
    labelCorto: 'Fortaleza Mayor',
    descripcion: 'Ventaja competitiva distintiva o núcleo de diferenciación.',
    color: '#10B981',
    bgBadge: 'rgba(16, 185, 129, 0.15)',
    borderBadge: 'rgba(16, 185, 129, 0.35)',
    icono: 'Sparkles'
  }
};


// ============================================================================
// COMPETIDORES INICIALES PREESTABLECIDOS
// ============================================================================
export const COMPETIDORES_INICIALES = [
  {
    id: 'empresa_propia',
    nombre: 'Nuestra Empresa',
    subtitulo: 'Sujeto de Consultoría',
    esPropia: true,
    colorAcento: '#F97316', // Naranja institucional
    badge: 'EMPRESA EVALUADA'
  }
];

// ============================================================================
// EXTRACCIÓN DE FACTORES SUGERIDOS DESDE LAS 5 FUERZAS DE PORTER
// ============================================================================
/**
 * Extrae TODAS las presiones y factores competitivos configurados en la pantalla
 * de las 5 Fuerzas de Porter (evidencias vinculadas, factores de campo, criterios activos y diagnósticos)
 * para incorporarlos a la Matriz de Perfil Competitivo (MPC).
 */
export function calcularSumaPesos(factores = []) {
  if (!Array.isArray(factores) || factores.length === 0) return 0;
  const sumaRaw = factores.reduce((acc, f) => acc + (parseFloat(f.peso) || 0), 0);
  return Math.round(sumaRaw * 100) / 100;
}

/**
 * Valida si la suma de pesos es exactamente 1.00 (tolerancia de coma flotante de 0.001)
 */
export function esSumaPesosValida(factores = []) {
  const suma = calcularSumaPesos(factores);
  return Math.abs(suma - 1.0) < 0.001;
}

/**
 * Reparte automáticamente 1.00 equitativamente entre los N factores existentes,
 * ajustando los decimales en el último elemento para asegurar sumatoria 1.00 exacta.
 */
export function equilibrarPesosEquitativamente(factores = []) {
  if (!factores || factores.length === 0) return [];
  const n = factores.length;
  const pesoBase = Math.floor((1.0 / n) * 100) / 100;
  let acumulado = 0;

  return factores.map((f, idx) => {
    let nuevoPeso = pesoBase;
    if (idx === n - 1) {
      nuevoPeso = Math.round((1.0 - acumulado) * 100) / 100;
    } else {
      acumulado += pesoBase;
    }
    return {
      ...f,
      peso: nuevoPeso
    };
  });
}

/**
 * Calcula el puntaje ponderado de un factor para un competidor específico.
 * Puntaje = Peso * Rating
 */
export function calcularPuntajePonderado(peso = 0, rating = 0) {
  const p = parseFloat(peso) || 0;
  const r = parseInt(rating, 10) || 0;
  return Math.round(p * r * 100) / 100;
}

/**
 * Calcula los totales consolidados, promedio de ratings, puntajes ponderados
 * y factores extremos (mejor/peor) para cada competidor.
 */
export function calcularTotalesCompetidores(factores = [], competidores = [], calificaciones = {}) {
  const resultados = {};

  competidores.forEach(comp => {
    let totalPonderado = 0;
    let sumaRatings = 0;
    let factoresCalificados = 0;
    let mejorPuntaje = -1;
    let peorPuntaje = 999;
    let fceMasFuerte = null;
    let fceMasDebil = null;

    factores.forEach(f => {
      const rating = calificaciones[comp.id]?.[f.id] || 0;
      const peso = parseFloat(f.peso) || 0;
      const puntaje = calcularPuntajePonderado(peso, rating);

      if (rating > 0) {
        sumaRatings += rating;
        factoresCalificados += 1;
        totalPonderado += puntaje;

        if (puntaje > mejorPuntaje) {
          mejorPuntaje = puntaje;
          fceMasFuerte = { factor: f.nombre, rating, puntaje, id: f.id };
        }
        if (puntaje < peorPuntaje) {
          peorPuntaje = puntaje;
          fceMasDebil = { factor: f.nombre, rating, puntaje, id: f.id };
        }
      }
    });

    const totalFactores = factores.length;
    const estaCompleto = totalFactores > 0 && factoresCalificados === totalFactores;
    const totalPonderadoRedondeado = Math.round(totalPonderado * 100) / 100;
    const promedioRating = factoresCalificados > 0 ? (sumaRatings / factoresCalificados).toFixed(2) : '0.00';

    resultados[comp.id] = {
      id: comp.id,
      nombre: comp.nombre,
      esPropia: comp.esPropia,
      colorAcento: comp.colorAcento,
      totalPonderado: totalPonderadoRedondeado,
      promedioRating,
      factoresCalificados,
      totalFactores,
      estaCompleto,
      fceMasFuerte,
      fceMasDebil
    };
  });

  return resultados;
}

/**
 * Determina el ranking competitivo en tiempo real de todos los competidores evaluados.
 * Asigna posición (1°, 2°, 3°), medalla y diagnóstico de Postura Estratégica.
 */
export function calcularRankingCompetidores(totalesCompetidores = {}) {
  const lista = Object.values(totalesCompetidores);
  if (lista.length === 0) return [];

  // Verificar si hay alguna calificación registrada
  const hayEvaluaciones = lista.some(item => (item.totalPonderado > 0 || item.factoresCalificados > 0));

  if (!hayEvaluaciones) {
    return lista.map(item => ({
      ...item,
      posicion: null,
      medalla: '—',
      medallaClass: 'mencion',
      brechaLider: 0,
      postura: 'Sin evaluar',
      posturaClass: 'sin-evaluar',
      posturaDescripcion: 'Asigna calificaciones de 1 a 4 a los Factores Críticos para determinar el diagnóstico estratégico.'
    }));
  }

  // Ordenar de mayor a menor puntaje ponderado
  const ordenados = [...lista].sort((a, b) => b.totalPonderado - a.totalPonderado);

  const puntajeLider = ordenados[0]?.totalPonderado || 0;

  return ordenados.map((item, index) => {
    const posicion = index + 1;
    const brechaLider = Math.round((item.totalPonderado - puntajeLider) * 100) / 100;

    let medalla = '';
    let medallaClass = '';
    if (posicion === 1) {
      medalla = '🥇 1º Puesto';
      medallaClass = 'oro';
    } else if (posicion === 2) {
      medalla = '🥈 2º Puesto';
      medallaClass = 'plata';
    } else if (posicion === 3) {
      medalla = '🥉 3º Puesto';
      medallaClass = 'bronce';
    } else {
      medalla = `🎖️ ${posicion}º Puesto`;
      medallaClass = 'mencion';
    }

    // Diagnóstico de Postura Estratégica según Fred R. David:
    // Escala teórica MPC: Mínimo 1.00 (todo en debilidad crítica), Máximo 4.00 (todo en fortaleza líder)
    // Media teórica = 2.50
    let postura = '';
    let posturaClass = '';
    let posturaDescripcion = '';

    if (item.totalPonderado >= 3.20) {
      postura = 'Líder Competitivo';
      posturaClass = 'lider';
      posturaDescripcion = 'Posición dominante con sólidas ventajas diferenciadoras frente a la industria.';
    } else if (item.totalPonderado >= 2.50) {
      postura = 'Retador Sólido';
      posturaClass = 'retador';
      posturaDescripcion = 'Capacidades por encima de la media del mercado, con oportunidades de asalto al liderazgo.';
    } else if (item.totalPonderado >= 2.00) {
      postura = 'Seguidor Vulnerable';
      posturaClass = 'seguidor';
      posturaDescripcion = 'Rendimiento modesto con debilidades que comprometen su cuota de mercado.';
    } else {
      postura = 'Rezagado Crítico';
      posturaClass = 'rezagado';
      posturaDescripcion = 'Vulnerabilidad extrema y desventaja estructural frente a todos los rivales.';
    }

    return {
      ...item,
      posicion,
      medalla,
      medallaClass,
      brechaLider,
      postura,
      posturaClass,
      posturaDescripcion
    };
  });
}

// ============================================================================
// VALIDACIÓN ESTRICTA DE AVANCE A FASE 6 (MATRIZ POAM)
// ============================================================================
/**
 * Valida todas las reglas de negocio necesarias para habilitar el paso a Fase 6:
 * 1. Sumatoria de pesos == 1.00
 * 2. Cantidad de FCEs entre 5 y 8
 * 3. Mínimo 2 competidores evaluados frente a Nuestra Empresa (Total >= 3 empresas)
 * 4. 100% de las celdas de calificación calificadas (1-4)
 */
export function validarTransicionFase6(factores = [], competidores = [], calificaciones = {}) {
  const errores = [];
  const advertencias = [];

  // Regla 1: Cantidad de FCEs (mínimo 5, máximo 8)
  const numFactores = factores.length;
  if (numFactores < 5) {
    errores.push(`La MPC requiere un mínimo de 5 Factores Críticos de Éxito (actualmente tienes ${numFactores}. Rango requerido: entre 5 y 8 FCE).`);
  } else if (numFactores > 8) {
    errores.push(`La MPC permite como máximo 8 Factores Críticos de Éxito (actualmente tienes ${numFactores}. Rango permitido: entre 5 y 8 FCE).`);
  }

  // Regla 2: Sumatoria de pesos == 1.00
  const sumaPesos = calcularSumaPesos(factores);
  const diferencia = Math.round((1.0 - sumaPesos) * 100) / 100;
  if (!esSumaPesosValida(factores)) {
    if (diferencia > 0) {
      errores.push(`La sumatoria de pesos es ${sumaPesos.toFixed(2)}. Faltan ${diferencia.toFixed(2)} para llegar a 1.00 exacto (100%).`);
    } else {
      errores.push(`La sumatoria de pesos es ${sumaPesos.toFixed(2)}. Sobran ${Math.abs(diferencia).toFixed(2)} sobre el 1.00 requerido.`);
    }
  }

  // Regla 2.1: Cada peso individual debe ser mayor o igual a 0.01
  const factoresConPesoInvalido = factores.filter(f => {
    const p = parseFloat(f.peso);
    return isNaN(p) || p < 0.01;
  });
  if (factoresConPesoInvalido.length > 0) {
    errores.push(`Cada Factor Crítico debe tener un peso individual mayor o igual a 0.01 (${factoresConPesoInvalido.length} factor${factoresConPesoInvalido.length > 1 ? 'es' : ''} con peso inferior a 0.01).`);
  }

  // Regla 3: Mínimo 2 competidores evaluados frente a Nuestra Empresa
  const rivales = competidores.filter(c => !c.esPropia);
  if (rivales.length < 2) {
    errores.push(`Debes registrar al menos 2 competidores rivales frente a Nuestra Empresa (actualmente tienes ${rivales.length}).`);
  }

  // Regla 3.1: Todos los competidores rivales deben tener un nombre asignado
  const rivalesSinNombre = rivales.filter(c => !c.nombre || !c.nombre.trim());
  if (rivalesSinNombre.length > 0) {
    errores.push(`Debes asignar un nombre a todos los competidores rivales (${rivalesSinNombre.length} rival${rivalesSinNombre.length > 1 ? 'es' : ''} pendiente${rivalesSinNombre.length > 1 ? 's' : ''} de nombrar).`);
  }

  // Regla 4: Calificaciones completas en todas las celdas
  let celdasIncompletas = 0;
  competidores.forEach(comp => {
    factores.forEach(f => {
      const val = calificaciones[comp.id]?.[f.id];
      if (!val || val < 1 || val > 4) {
        celdasIncompletas++;
      }
    });
  });

  if (celdasIncompletas > 0) {
    errores.push(`Hay ${celdasIncompletas} celda(s) de calificación sin evaluar. Todas las empresas deben tener un rating entre 1 y 4.`);
  }

  return {
    esValido: errores.length === 0,
    errores,
    advertencias,
    sumaPesos,
    diferenciaPesos: diferencia,
    celdasIncompletas,
    totalCompetidores: competidores.length,
    totalFactores: numFactores
  };
}

// ============================================================================
// GENERACIÓN DE PAYLOAD PARA LA FASE 6 (POAM / EFI / FODA)
// ============================================================================
/**
 * Empaqueta la síntesis analítica de la MPC para alimentar el Perfil de Oportunidades
 * y Amenazas del Medio (POAM), EFI y la posterior Matriz FODA.
 */
