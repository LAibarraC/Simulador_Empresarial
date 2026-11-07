import { DIMENSIONES_PESTEL } from '../pestel/datosPestel';

// POAM comparte dimensiones y subdimensiones con PESTEL; cada sector radial ocupa 60°.
export const DIMENSIONES_POAM = DIMENSIONES_PESTEL.map((dimension, index) => ({
  id: dimension.id,
  nombre: dimension.nombre,
  nombreCorto: dimension.tituloCorto,
  subtitulo: dimension.subtitulo,
  descripcion: dimension.descripcion,
  icono: dimension.icono,
  color: dimension.color,
  colorRgb: dimension.colorRgb,
  anguloInicio: -90 + index * 60,
  anguloFin: -30 + index * 60,
  anguloCentro: -60 + index * 60,
  subdivisiones: (dimension.subdimensionesComunes || []).map((nombre, subIndex) => ({
    id: `${dimension.id}-sub-${subIndex + 1}`,
    nombre
  }))
}));

// Normaliza dimensiones actuales de PESTEL y categorías guardadas en versiones anteriores.
export const normalizarCategoriaPoam = (categoria) => {
  if (!categoria) return 'economico';
  const valor = String(categoria).trim();
  const actual = DIMENSIONES_POAM.find(d => d.id === valor || d.nombre === valor || d.nombreCorto === valor);
  if (actual) return actual.id;
  const c = valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const aliases = [
    [['polit', 'político-legal', 'politico-legal'], 'politico'],
    [['econ', 'financ', 'costo', 'precio', 'porter', 'sector', 'rival', 'industria'], 'economico'],
    [['soc', 'cult', 'demogr', 'consum', 'habito'], 'social'],
    [['tec', 'digit', 'soft', 'auto', 'innov'], 'tecnologico'],
    [['ecol', 'ambien', 'geogr', 'clima', 'sostenib', 'residuo', 'natural'], 'ecologico'],
    [['legal', 'regul', 'norma', 'gob', 'instituc'], 'legal']
  ];
  return aliases.find(([tokens]) => tokens.some(token => c.includes(token)))?.[1] || 'economico';
};

// Resuelve dimensiones PESTEL y compatibiliza las categorías guardadas previamente.
export const mapearDimensionPestelAPoam = (dimPestel) => {
  if (!dimPestel) return 'economico';
  const d = String(dimPestel).trim().toLowerCase();
  const exacta = DIMENSIONES_POAM.find(dimension => dimension.id === d || dimension.nombreCorto.toLowerCase() === d || dimension.nombre.toLowerCase() === d);
  return exacta?.id || normalizarCategoriaPoam(dimPestel);
};

// Resuelve y garantiza la dimensión fijada por PESTEL para cualquier factor o evidencia
export const resolverDimensionPestel = (factor, datosPestel = null, ideasLluvia = []) => {
  if (!factor) return 'economico';

  // 1. Si el factor o idea está explícitamente vinculado en alguna dimensión de datosPestel
  if (datosPestel?.dimensiones) {
    for (const [dimId, dimData] of Object.entries(datosPestel.dimensiones)) {
      const vinculadas = dimData?.evidenciasVinculadas || [];
      const fId = factor.id;
      const fTexto = (factor.factor || factor.texto || '').toLowerCase().trim();
      const coincide = vinculadas.some(vId => {
        if (vId === fId || (fId && String(fId).includes(String(vId)))) return true;
        const ideaEnLluvia = (ideasLluvia || []).find(i => i.id === vId);
        if (ideaEnLluvia && ideaEnLluvia.texto && ideaEnLluvia.texto.toLowerCase().trim() === fTexto) {
          return true;
        }
        return false;
      });
      if (coincide) {
        return mapearDimensionPestelAPoam(dimId);
      }
    }
  }

  // 2. Si el factor tiene dimensionPestel o categoriaPoam guardada
  if (factor.dimensionPestel) {
    return mapearDimensionPestelAPoam(factor.dimensionPestel);
  }

  // 3. Si coincide con una idea de la lluvia de ideas con dimensión o categoría asignada
  if (ideasLluvia && ideasLluvia.length > 0) {
    const fId = factor.id;
    const fTexto = (factor.factor || factor.texto || '').toLowerCase().trim();
    const idea = ideasLluvia.find(i => 
      i.id === fId || 
      (fId && String(fId).includes(String(i.id))) || 
      (i.texto && i.texto.toLowerCase().trim() === fTexto)
    );
    if (idea) {
      if (idea.dimensionPestel) return mapearDimensionPestelAPoam(idea.dimensionPestel);
      if (idea.categoria) return mapearDimensionPestelAPoam(idea.categoria);
    }
  }

  // Si el factor conserva una categoría guardada, normalizarla a una dimensión PESTEL.
  if (factor.categoria && DIMENSIONES_POAM.some(d => d.id === factor.categoria)) {
    return factor.categoria;
  }

  return normalizarCategoriaPoam(factor.categoria || 'Económica');
};

// Obtiene la lista de subdivisiones asociadas a una dimensión
export const obtenerSubdivisionesPorDimension = (categoria) => {
  if (!categoria) return [];
  const catNorm = normalizarCategoriaPoam(categoria);
  const dim = DIMENSIONES_POAM.find(d => d.id === catNorm);
  return dim ? dim.subdivisiones : [];
};


// Infiere o sugiere automáticamente la subdivisión correcta para un factor
export const sugerirSubdivision = (factorTexto = '', categoria = '') => {
  const subdivisiones = obtenerSubdivisionesPorDimension(categoria);
  if (!subdivisiones.length) return '';
  const normalizarTexto = texto => String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const tokensFactor = new Set(normalizarTexto(factorTexto).split(/[^a-z0-9]+/).filter(token => token.length > 3));
  const puntuacion = subdivisiones.map(sub => {
    const tokensSub = normalizarTexto(sub.nombre).split(/[^a-z0-9]+/).filter(token => token.length > 3);
    return { nombre: sub.nombre, score: tokensSub.reduce((score, token) => score + (tokensFactor.has(token) ? 1 : 0), 0) };
  }).sort((a, b) => b.score - a.score);
  return puntuacion[0]?.score ? puntuacion[0].nombre : subdivisiones[0].nombre;
};

export const resolverSubdivisionRadar = (factor = {}, categoria = '') => {
  const opciones = obtenerSubdivisionesPorDimension(categoria);
  if (!opciones.length) return '';

  const normalizar = texto => (texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  const dimensionLabel = normalizar(factor.subdivision);
  const esEtiquetaDimension = ['politico', 'economico', 'economica', 'social', 'tecnologico', 'tecnologica', 'ecologico', 'ecologica', 'legal'].includes(dimensionLabel);
  const sugeridaDesdePestel = sugerirSubdivision(factor.subdivision, categoria);
  const sugeridaDesdeTexto = sugerirSubdivision(factor.factor, categoria);
  const priorizadas = esEtiquetaDimension
    ? [sugeridaDesdeTexto, sugeridaDesdePestel]
    : [sugeridaDesdePestel, sugeridaDesdeTexto];

  return priorizadas.map(nombre => opciones.find(opcion => opcion.nombre === nombre)?.nombre).find(Boolean)
    || opciones[0].nombre;
};


// Generador de factores didácticos iniciales contextualizados por caso
const obtenerFactoresPoamRaw = (casoId) => {
  switch (casoId) {
    case 'cafe-tunari':
      return [
        {
          id: 'poam-ct-1',
          categoria: 'Económica',
          subdivision: 'Competencia y rivalidad de mercado',
          factor: 'Apertura de una franquicia de Starbucks a 50 metros del local central.',
          tipo: 'Amenaza',
          calificacion: 'Alto',
          impacto: 'Alto',
          justificacion: 'Atracción agresiva de clientes presenciales con mayor presupuesto publicitario y marca global.',
          fuente: 'Noticia Competitiva / Sectorial',
          esPersonalizado: false
        },
        {
          id: 'poam-ct-2',
          categoria: 'Socio-Cultural',
          subdivision: 'Hábitos y patrones de consumo',
          factor: 'Crecimiento anual del 40% en consumo de café de especialidad en jóvenes profesionales y nómadas digitales.',
          tipo: 'Oportunidad',
          calificacion: 'Alto',
          impacto: 'Alto',
          justificacion: 'Segmento demográfico en rápida expansión dispuesto a pagar mayor ticket promedio por café de origen.',
          fuente: 'Estudio de Mercado Sectorial',
          esPersonalizado: false
        },
        {
          id: 'poam-ct-3',
          categoria: 'Económica',
          subdivision: 'Inflación y costos de materias primas',
          factor: 'Costo de alquiler del local céntrico subirá 25% el próximo mes de renovación contractual.',
          tipo: 'Amenaza',
          calificacion: 'Alto',
          impacto: 'Alto',
          justificacion: 'Incremento directo en los costos fijos que reduce drásticamente el margen operativo mensual.',
          fuente: 'Comunicado Inmobiliario',
          esPersonalizado: false
        },
        {
          id: 'poam-ct-4',
          categoria: 'Tecnológica',
          subdivision: 'Digitalización y canales de venta',
          factor: 'Auge de aplicaciones de delivery (PedidosYa, UberEats) y masificación de pagos instantáneos con código QR.',
          tipo: 'Oportunidad',
          calificacion: 'Alto',
          impacto: 'Alto',
          justificacion: 'Permite abrir canal de venta para oficinas y domicilios sin aumentar el metraje cuadrado del local.',
          fuente: 'Informe de Transformación Digital',
          esPersonalizado: false
        },
        {
          id: 'poam-ct-5',
          categoria: 'Político-Legal',
          subdivision: 'Estabilidad política y jurídica',
          factor: 'Nuevas directrices municipales de zonificación que autorizan terrazas gastronómicas al aire libre.',
          tipo: 'Oportunidad',
          calificacion: 'Alto',
          impacto: 'Alto',
          justificacion: 'Opción de duplicar la capacidad de mesas y el flujo presencial con bajo costo de adecuación.',
          fuente: 'Gaceta Municipal de Urbanismo',
          esPersonalizado: false
        },
        {
          id: 'poam-ct-6',
          categoria: 'Económica',
          subdivision: 'Inflación y costos de materias primas',
          factor: 'Aumento del 12% en la inflación de insumos lácteos y empaques biodegradables.',
          tipo: 'Amenaza',
          calificacion: 'Medio',
          impacto: 'Medio',
          justificacion: 'Presiona los costos de preparación de café latte y capuchino, exigiendo optimizar recetas.',
          fuente: 'Índice de Precios al Consumidor',
          esPersonalizado: false
        },
        {
          id: 'poam-ct-7',
          categoria: 'Geográficos-Ambientales',
          subdivision: 'Condiciones climáticas y estacionalidad',
          factor: 'Cosechas récord de café arábica de altura en Los Yungas gracias a condiciones climáticas favorables.',
          tipo: 'Oportunidad',
          calificacion: 'Alto',
          impacto: 'Alto',
          justificacion: 'Garantiza abastecimiento continuo de granos con puntaje de cata superior a 85 puntos SCA.',
          fuente: 'Asociación de Productores Yungas',
          esPersonalizado: false
        },
        {
          id: 'poam-ct-8',
          categoria: 'Geográficos-Ambientales',
          subdivision: 'Recursos naturales y energía limpia',
          factor: 'Cortes periódicos de suministro de agua potable programados por obras de recapamiento vial en la zona.',
          tipo: 'Amenaza',
          calificacion: 'Medio',
          impacto: 'Medio',
          justificacion: 'Riesgo de paralización temporal de las máquinas de espresso industriales por falta de presión hídrica.',
          fuente: 'Aviso de Empresa de Servicios Básicos',
          esPersonalizado: false
        }
      ];

    case 'technova':
      return [
        {
          id: 'poam-tn-1',
          categoria: 'Económica',
          subdivision: 'Competencia y rivalidad de mercado',
          factor: 'Entrada de competidores multinacionales con ofertas freemium agresivas en el segmento SaaS B2B.',
          tipo: 'Amenaza',
          calificacion: 'Alto',
          impacto: 'Alto',
          justificacion: 'Presiona el costo de adquisición de clientes y eleva la tasa de deserción (churn).',
          fuente: 'Radar de Mercado Tecnológico',
          esPersonalizado: false
        },
        {
          id: 'poam-tn-2',
          categoria: 'Tecnológica',
          subdivision: 'Investigación y Desarrollo (I+D)',
          factor: 'Maduración de modelos de IA generativa y APIs para automatizar agentes de soporte al cliente 24/7.',
          tipo: 'Oportunidad',
          calificacion: 'Alto',
          impacto: 'Alto',
          justificacion: 'Permite resolver hasta el 60% de incidencias técnicas recurrentes sin inflar la plantilla de soporte.',
          fuente: 'Tendencias en SaaS & Cloud',
          esPersonalizado: false
        },
        {
          id: 'poam-tn-3',
          categoria: 'Político-Legal',
          subdivision: 'Seguridad jurídica y normativas técnicas',
          factor: 'Nuevas normativas de soberanía de datos y ciberseguridad obligatorias para clientes corporativos.',
          tipo: 'Amenaza',
          calificacion: 'Medio',
          impacto: 'Medio',
          justificacion: 'Exige auditorías de cumplimiento SOC2 e ISO 27001 para poder vender a grandes corporaciones.',
          fuente: 'Marco Regulatorio de Telecomunicaciones',
          esPersonalizado: false
        },
        {
          id: 'poam-tn-4',
          categoria: 'Económica',
          subdivision: 'Tasas de interés y acceso al crédito',
          factor: 'Restricción de capital de riesgo (venture capital) para startups con métricas de churn superiores al 10%.',
          tipo: 'Amenaza',
          calificacion: 'Alto',
          impacto: 'Alto',
          justificacion: 'Dificulta rondas de extensión si no se estabiliza de inmediato la retención de ingresos netos (NRR).',
          fuente: 'Reporte Financiero Seed & Serie A',
          esPersonalizado: false
        },
        {
          id: 'poam-tn-5',
          categoria: 'Socio-Cultural',
          subdivision: 'Estilos de vida y transformación laboral',
          factor: 'Consolidación global del trabajo remoto e híbrido en pequeñas y medianas empresas.',
          tipo: 'Oportunidad',
          calificacion: 'Alto',
          impacto: 'Alto',
          justificacion: 'Aumenta la necesidad permanente de herramientas colaborativas y de gestión en la nube.',
          fuente: 'Encuesta Laboral de Productividad',
          esPersonalizado: false
        }
      ];

    case 'textiles-valle':
      return [
        {
          id: 'poam-tv-1',
          categoria: 'Político-Legal',
          subdivision: 'Políticas tributarias e incentivos fiscales',
          factor: 'Tratado bilateral de libre comercio con arancel 0% para prendas de algodón hacia el Mercosur.',
          tipo: 'Oportunidad',
          calificacion: 'Alto',
          impacto: 'Alto',
          justificacion: 'Abre un mercado potencial de exportación de más de 200 millones de consumidores.',
          fuente: 'Cancillería y Comercio Exterior',
          esPersonalizado: false
        },
        {
          id: 'poam-tv-2',
          categoria: 'Económica',
          subdivision: 'Competencia y rivalidad de mercado',
          factor: 'Ingreso masivo de indumentaria sintética de bajo costo importada desde mercados asiáticos.',
          tipo: 'Amenaza',
          calificacion: 'Alto',
          impacto: 'Alto',
          justificacion: 'Deprime los precios en el mercado doméstico para prendas básicas no diferenciadas.',
          fuente: 'Cámara Nacional de Exportadores Textil',
          esPersonalizado: false
        },
        {
          id: 'poam-tv-3',
          categoria: 'Económica',
          subdivision: 'Tasas de interés y acceso al crédito',
          factor: 'Líneas de crédito verde subsidiadas para reconversión energética en plantas manufactureras.',
          tipo: 'Oportunidad',
          calificacion: 'Medio',
          impacto: 'Medio',
          justificacion: 'Facilita la modernización de telares con financiamiento a largo plazo y tasa preferencial.',
          fuente: 'Banco de Desarrollo Productivo',
          esPersonalizado: false
        },
        {
          id: 'poam-tv-4',
          categoria: 'Geográficos-Ambientales',
          subdivision: 'Recursos naturales y energía limpia',
          factor: 'Escasez hídrica en cuencas industriales que encarece los procesos de teñido y lavado textil.',
          tipo: 'Amenaza',
          calificacion: 'Medio',
          impacto: 'Medio',
          justificacion: 'Obliga a implementar sistemas de circuito cerrado de recirculación de aguas residuales.',
          fuente: 'Autoridad de Fiscalización Ambiental',
          esPersonalizado: false
        }
      ];

    default:
      // Plantilla base genérica enriquecida para cualquier otro caso
      return [
        {
          id: 'poam-gen-1',
          categoria: 'Económica',
          subdivision: 'Competencia y rivalidad de mercado',
          factor: 'Rivalidad creciente de empresas del sector con estrategias de precios agresivos.',
          tipo: 'Amenaza',
          calificacion: 'Alto',
          impacto: 'Alto',
          justificacion: 'Presiona márgenes de comercialización si no se consolida una propuesta diferenciada.',
          fuente: 'Observatorio de Mercado',
          esPersonalizado: false
        },
        {
          id: 'poam-gen-2',
          categoria: 'Tecnológica',
          subdivision: 'Digitalización y canales de venta',
          factor: 'Adopción acelerada de canales digitales y plataformas de gestión en línea.',
          tipo: 'Oportunidad',
          calificacion: 'Alto',
          impacto: 'Alto',
          justificacion: 'Permite capturar nuevos segmentos de clientes con menores costos de transacción.',
          fuente: 'Tendencias Tecnológicas Sectoriales',
          esPersonalizado: false
        },
        {
          id: 'poam-gen-3',
          categoria: 'Económica',
          subdivision: 'Tipo de cambio (Divisas)',
          factor: 'Volatilidad en tipos de cambio y encarecimiento de insumos importados.',
          tipo: 'Amenaza',
          calificacion: 'Medio',
          impacto: 'Medio',
          justificacion: 'Exige negociar coberturas de precio y buscar proveedores alternativos locales.',
          fuente: 'Boletín Económico Nacional',
          esPersonalizado: false
        },
        {
          id: 'poam-gen-4',
          categoria: 'Socio-Cultural',
          subdivision: 'Nivel educativo y conciencia social',
          factor: 'Preferencia creciente de consumidores por marcas éticas y sostenibles.',
          tipo: 'Oportunidad',
          calificacion: 'Alto',
          impacto: 'Alto',
          justificacion: 'Ventaja para productos con certificaciones de impacto social y ecológico.',
          fuente: 'Estudio de Hábitos del Consumidor',
          esPersonalizado: false
        },
        {
          id: 'poam-gen-5',
          categoria: 'Político-Legal',
          subdivision: 'Políticas tributarias e incentivos fiscales',
          factor: 'Actualización del marco regulatorio tributario con incentivos para digitalización.',
          tipo: 'Oportunidad',
          calificacion: 'Medio',
          impacto: 'Medio',
          justificacion: 'Deducciones fiscales aplicables a inversiones en software e innovación.',
          fuente: 'Reforma Tributaria Vigente',
          esPersonalizado: false
        },
        {
          id: 'poam-gen-6',
          categoria: 'Geográficos-Ambientales',
          subdivision: 'Normativa ambiental y gestión de residuos',
          factor: 'Regulaciones ambientales más estrictas sobre huella de carbono y residuos sólidos.',
          tipo: 'Amenaza',
          calificacion: 'Medio',
          impacto: 'Medio',
          justificacion: 'Requiere adecuar empaques y protocolos de reciclaje corporativo.',
          fuente: 'Ministerio de Medio Ambiente',
          esPersonalizado: false
        }
      ];
  }
};

export const obtenerFactoresPoamIniciales = (casoId) => {
  const lista = obtenerFactoresPoamRaw(casoId) || [];
  return lista.map(f => ({
    ...f,
    tipoOriginal: f.tipo,
    justificacionOriginal: f.justificacion || '',
    categoria: normalizarCategoriaPoam(f.categoria) || 'Económica',
    subdivision: '',
    calificacion: '',
    impacto: '',
    ubicadoEnRadar: false
  }));
};

// Generador e integrador metodológico de variables desde Porter (Micro) y Lluvia (Macro PEST)
export const generarFactoresDesdePorterYPEST = (datosPorter, ideasLluvia = [], casoActivo = {}, factoresActuales = [], datosPestel = null) => {
  const factoresExportados = [];
  const nombresFuerzas = {
    rivalidad: 'Rivalidad entre Competidores Existentes',
    entrantes: 'Amenaza de Nuevos Entrantes',
    sustitutos: 'Amenaza de Productos y Servicios Sustitutos',
    clientes: 'Poder de Negociación de los Clientes',
    proveedores: 'Poder de Negociación de los Proveedores'
  };

  const ideasExternas = (ideasLluvia || []).filter(
    i => {
      const isExternal = i.tipoAmbito === 'Externo' || i.tipoAmbito === 'Macroentorno' || 
                         i.cuadranteCorrecto === 'Oportunidades' || i.cuadranteCorrecto === 'Amenazas' ||
                         i.cuadranteActual === 'Oportunidades' || i.cuadranteActual === 'Amenazas';
      const isInternal = i.tipoAmbito === 'Interno' || i.tipoAmbito === 'Microentorno (Interno)' ||
                         i.cuadranteCorrecto === 'Fortalezas' || i.cuadranteCorrecto === 'Debilidades' ||
                         i.cuadranteActual === 'Fortalezas' || i.cuadranteActual === 'Debilidades';
      return isExternal && !isInternal;
    }
  );

  const getNivelEfectivo = (fuerzaData) => {
    if (fuerzaData.nivel) return fuerzaData.nivel;
    const count = Object.values(fuerzaData.criteriosActivos || {}).filter(Boolean).length;
    if (count >= 3) return 'Alta';
    if (count === 2) return 'Media';
    return 'Baja';
  };

  ideasExternas.forEach((idea, idx) => {
    let fuerzaVinculadaId = null;
    let fuerzaData = null;
    let nombreFuerza = null;

    if (datosPorter?.fuerzas) {
      Object.entries(datosPorter.fuerzas).forEach(([fId, data]) => {
        if (data && (data.evidenciasVinculadas || []).includes(idea.id)) {
          fuerzaVinculadaId = fId;
          fuerzaData = data;
          nombreFuerza = nombresFuerzas[fId] || `Fuerza Competitiva (${fId})`;
        }
      });
    }

    let nivel = 'Media';
    let justificacionBase = '';
    // La dimensión para cada factor queda definida estrictamente por la vinculación o naturaleza de PESTEL
    let categoria = resolverDimensionPestel(idea, datosPestel, ideasLluvia);
    let esPorter = false;

    if (fuerzaVinculadaId && fuerzaData) {
      nivel = getNivelEfectivo(fuerzaData);
      esPorter = true;
      justificacionBase = `Factor externo extraído de la auditoría. Evaluado en Porter bajo la fuerza "${nombreFuerza}" con nivel de presión ${nivel}.`;
    } else {
      justificacionBase = `Variable del macroentorno detectada en el diagnóstico inicial (${idea.fuente || 'Hecho externo'}).`;
    }

    let tipo;
    if (esPorter) {
      const esAmenaza = nivel === 'Alta' || nivel === 'Media';
      tipo = esAmenaza ? 'Amenaza' : 'Oportunidad';
    } else {
      tipo = (idea.cuadranteCorrecto === 'Oportunidades' || idea.cuadranteActual === 'Oportunidades') ? 'Oportunidad' : 'Amenaza';
    }


    const nuevoFactor = {
      id: `poam-lluvia-${idea.id || idx}`,
      categoria: categoria,
      subdivision: '',
      factor: idea.texto,
      tipo,
      tipoOriginal: tipo,
      calificacion: '',
      impacto: '',
      justificacion: justificacionBase,
      justificacionOriginal: justificacionBase,
      fuente: idea.fuente || 'Lluvia de Ideas',
      origenPorter: esPorter,
      tagOrigen: esPorter ? '[Micro: Porter]' : '[Macro: PESTEL]',
      fuerzaId: fuerzaVinculadaId,
      nombreFuerza,
      nivelFuerza: esPorter ? nivel : null,
      esPersonalizado: false
    };

    const antiguo = (factoresActuales || []).find(fa => fa.id === nuevoFactor.id);
    if (antiguo) {
      nuevoFactor.tipoOriginal = antiguo.tipoOriginal || nuevoFactor.tipoOriginal;
      nuevoFactor.justificacionOriginal = antiguo.justificacionOriginal !== undefined ? antiguo.justificacionOriginal : nuevoFactor.justificacionOriginal;
      nuevoFactor.categoria = resolverDimensionPestel(antiguo, datosPestel, ideasLluvia) || categoria;
      nuevoFactor.subdivision = antiguo.subdivision || nuevoFactor.subdivision;
      nuevoFactor.calificacion = antiguo.calificacion || nuevoFactor.calificacion;
      nuevoFactor.impacto = antiguo.impacto || nuevoFactor.impacto;
      nuevoFactor.justificacion = antiguo.justificacion || nuevoFactor.justificacion;
      nuevoFactor.ubicadoEnRadar = antiguo.ubicadoEnRadar || false;
      nuevoFactor.xRadar = antiguo.xRadar;
      nuevoFactor.yRadar = antiguo.yRadar;
    }

    factoresExportados.push(nuevoFactor);
  });

  // Si no hay datos de porter ni ideas en Lluvia de Ideas en absoluto, recurrir a los iniciales del caso
  if (factoresExportados.length === 0 && (!ideasLluvia || ideasLluvia.length === 0)) {
    const base = obtenerFactoresPoamIniciales(casoActivo?.id);
    return base.map(b => {
      const previo = (factoresActuales || []).find(fa => fa.id === b.id);
      return {
        ...b,
        tipoOriginal: previo?.tipoOriginal || b.tipoOriginal || b.tipo,
        justificacionOriginal: previo?.justificacionOriginal !== undefined ? previo.justificacionOriginal : (b.justificacionOriginal || b.justificacion || ''),
        tagOrigen: b.origenPorter ? '[Micro: Porter]' : '[Macro: PESTEL]',
        subdivision: previo?.subdivision || b.subdivision || '',
        ubicadoEnRadar: previo ? (previo.ubicadoEnRadar ?? false) : false
      };
    });
  }

  // Preservar calibraciones previas del usuario si la polaridad se mantiene
  const factoresFinales = factoresExportados.map(fExport => {
    const previo = (factoresActuales || []).find(fa => fa.id === fExport.id);
    if (previo) {
      // Si cambió el tipo/polaridad desde Porter, tomar el nuevo tipo
      if (previo.tipo !== fExport.tipo) {
        return {
          ...fExport,
          subdivision: previo.subdivision || fExport.subdivision,
          ubicadoEnRadar: previo.ubicadoEnRadar ?? false
        };
      }
      return {
        ...fExport,
        categoria: previo.categoria || fExport.categoria,
        subdivision: previo.subdivision || fExport.subdivision,
        calificacion: previo.calificacion || previo.impacto || fExport.calificacion,
        impacto: previo.impacto || previo.calificacion || fExport.impacto,
        justificacion: previo.justificacion || fExport.justificacion,
        ubicadoEnRadar: previo.ubicadoEnRadar ?? false
      };
    }
    return {
      ...fExport,
      ubicadoEnRadar: false
    };
  });

  // Mezclar con factores personalizados que el usuario haya agregado manualmente
  const manuales = (factoresActuales || []).filter(f => f.esPersonalizado);
  return [...factoresFinales, ...manuales];
};
