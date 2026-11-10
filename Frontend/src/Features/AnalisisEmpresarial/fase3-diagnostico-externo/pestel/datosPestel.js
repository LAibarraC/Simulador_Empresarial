import {
  Landmark,
  TrendingUp,
  Users,
  Cpu,
  Leaf,
  Scale
} from 'lucide-react';

// ============================================================================
// DEFINICIÓN TEÓRICA METODOLÓGICA DE LAS 6 DIMENSIONES PESTEL
// ============================================================================

export const DIMENSIONES_PESTEL = [
  {
    id: 'politico',
    letra: 'P',
    nombre: 'Factores Políticos',
    tituloCorto: 'Político',
    icono: Landmark,
    color: '#475569',
    colorRgb: '71, 85, 105',
    categoriaPoam: 'Político-Legal',
    poamCorrespondiente: 'Político-Legal',
    subtitulo: 'Estabilidad gubernamental, políticas públicas y marco institucional',
    descripcion: 'Analiza cómo la estabilidad gubernamental, políticas públicas, regulaciones fiscales, aranceles, subsidios y tratados comerciales impactan a la empresa.',
    guiaUso: 'Analiza cómo la estabilidad gubernamental, políticas públicas, regulaciones fiscales, aranceles, subsidios y tratados comerciales impactan a la empresa.',
    subdimensionesComunes: [
      'Estabilidad política y gobernanza',
      'Políticas tributarias e incentivos fiscales',
      'Comercio exterior, tratados y aranceles',
      'Programas de fomento estatal y subsidios',
      'Relaciones diplomáticas y convenios internacionales'
    ],
    criterios: [
      {
        id: 'pol-1',
        label: 'Estabilidad institucional y gobernanza política',
        descripcion: 'Continuidad de políticas públicas y bajo riesgo de convulsiones o paros que afecten la operación.'
      },
      {
        id: 'pol-2',
        label: 'Políticas fiscales, impuestos e incentivos al rubro',
        descripcion: 'Cargas tributarias, aranceles de importación o exenciones fiscales que favorecen o restringen al sector.'
      },
      {
        id: 'pol-3',
        label: 'Regulación del comercio exterior y acuerdos bilaterales',
        descripcion: 'Apertura de fronteras, convenios de exportación o barreras no arancelarias para suministros e insumos.'
      },
      {
        id: 'pol-4',
        label: 'Programas de fomento estatal y subsidios sectoriales',
        descripcion: 'Acceso a fondos públicos, créditos de desarrollo o programas gubernamentales de compras locales.'
      }
    ]
  },
  {
    id: 'economico',
    letra: 'E',
    nombre: 'Factores Económicos',
    tituloCorto: 'Económico',
    icono: TrendingUp,
    color: '#059669',
    colorRgb: '5, 150, 105',
    categoriaPoam: 'Económica',
    poamCorrespondiente: 'Económica',
    subtitulo: 'Ciclo macroeconómico, inflación, tipo de cambio y poder adquisitivo',
    descripcion: 'Evalúa variables macroeconómicas clave como la inflación de costos, tasas de interés, tipo de cambio, acceso al crédito y poder adquisitivo o demanda de los consumidores.',
    guiaUso: 'Evalúa variables macroeconómicas clave como la inflación de costos, tasas de interés, tipo de cambio, acceso al crédito y poder adquisitivo o demanda de los consumidores.',
    subdimensionesComunes: [
      'Inflación y costo de materias primas',
      'Tasas de interés y acceso al crédito',
      'Tipo de cambio y divisas',
      'Poder adquisitivo y renta de los consumidores',
      'Crecimiento económico y demanda sectorial'
    ],
    criterios: [
      {
        id: 'eco-1',
        label: 'Tasa de inflación y encarecimiento de materias primas',
        descripcion: 'Aumento generalizado en precios de insumos críticos que presiona los márgenes brutos de ganancia.'
      },
      {
        id: 'eco-2',
        label: 'Tipo de cambio y disponibilidad de divisas extranjeras',
        descripcion: 'Fluctuación cambiaria que encarece insumos importados, maquinaria o licencias tecnológicas en moneda extranjera.'
      },
      {
        id: 'eco-3',
        label: 'Tasas de interés y acceso al crédito comercial',
        descripcion: 'Costo financiero para contraer deuda, financiar capital de trabajo o invertir en maquinaria e infraestructura.'
      },
      {
        id: 'eco-4',
        label: 'Poder adquisitivo y renta disponible de los consumidores',
        descripcion: 'Nivel salarial y predisposición del mercado a pagar precios premium frente a opciones económicas o de bajo costo.'
      }
    ]
  },
  {
    id: 'social',
    letra: 'S',
    nombre: 'Factores Sociales y Culturales',
    tituloCorto: 'Social',
    icono: Users,
    color: '#7c3aed',
    colorRgb: '124, 58, 237',
    categoriaPoam: 'Socio-Cultural',
    poamCorrespondiente: 'Socio-Cultural',
    subtitulo: 'Demografía, estilo de vida, tendencias de consumo y cultura',
    descripcion: 'Examina tendencias socioculturales, cambios demográficos, hábitos de consumo, estilos de vida, valores ciudadanos y la disponibilidad de talento humano calificado.',
    guiaUso: 'Examina tendencias socioculturales, cambios demográficos, hábitos de consumo, estilos de vida, valores ciudadanos y la disponibilidad de talento humano calificado.',
    subdimensionesComunes: [
      'Hábitos, tendencias y patrones de consumo',
      'Estilos de vida, salud y bienestar',
      'Estructura demográfica y relevo generacional',
      'Nivel educativo y conciencia social',
      'Disponibilidad de talento humano calificado'
    ],
    criterios: [
      {
        id: 'soc-1',
        label: 'Tendencias de bienestar, salud y consumo responsable',
        descripcion: 'Preferencia creciente por productos orgánicos, certificados, de origen transparente y comercio justo.'
      },
      {
        id: 'soc-2',
        label: 'Cambios demográficos y nuevas generaciones (Gen Z / Millennials)',
        descripcion: 'Comportamiento de compra orientado a marcas auténticas con propósito e identidad visual atractiva.'
      },
      {
        id: 'soc-3',
        label: 'Exigencia de inmediatez, autoservicio y experiencia memorable',
        descripcion: 'Expectativa de atención ágil, ambientes confortables o formatos mixtos de consumo y trabajo remoto.'
      },
      {
        id: 'soc-4',
        label: 'Disponibilidad y formación de talento humano especializado',
        descripcion: 'Capacidad del entorno formativo para suministrar perfiles técnicos y vocacionales adaptados al sector.'
      }
    ]
  },
  {
    id: 'tecnologico',
    letra: 'T',
    nombre: 'Factores Tecnológicos',
    tituloCorto: 'Tecnológico',
    icono: Cpu,
    color: '#d97706',
    colorRgb: '217, 119, 6',
    categoriaPoam: 'Tecnológica',
    poamCorrespondiente: 'Tecnológica',
    subtitulo: 'Digitalización, automatización, e-commerce e infraestructura de TI',
    descripcion: 'Identifica innovaciones digitales, automatización operativa, plataformas de comercio electrónico, software en la nube y equipamiento tecnológico de vanguardia.',
    guiaUso: 'Identifica innovaciones digitales, automatización operativa, plataformas de comercio electrónico, software en la nube y equipamiento tecnológico de vanguardia.',
    subdimensionesComunes: [
      'Canales digitales, e-commerce y apps móviles',
      'Automatización de procesos y maquinaria',
      'Investigación, Desarrollo e Innovación (I+D)',
      'Infraestructura TI, nube y telecomunicaciones',
      'Ciberseguridad y analítica de datos'
    ],
    criterios: [
      {
        id: 'tec-1',
        label: 'Canales digitales de venta, apps móviles y pasarelas de pago',
        descripcion: 'Adopción masiva de pedidos por app, comercio electrónico y medios de pago sin contacto.'
      },
      {
        id: 'tec-2',
        label: 'Automatización de procesos operativos y software CRM / ERP',
        descripcion: 'Herramientas digitales que reducen tiempos de respuesta, errores manuales y cuellos de botella en el servicio.'
      },
      {
        id: 'tec-3',
        label: 'Maquinaria de vanguardia y tecnologías de producción',
        descripcion: 'Disponibilidad de equipamiento de alta precisión que estandariza la calidad y recorta el costo unitario.'
      },
      {
        id: 'tec-4',
        label: 'Infraestructura de telecomunicaciones y servicios Cloud',
        descripcion: 'Acceso a conectividad de fibra óptica, estabilidad en redes móviles y servicios en la nube para soporte 24/7.'
      }
    ]
  },
  {
    id: 'ecologico',
    letra: 'E',
    nombre: 'Factores Ecológicos y Ambientales',
    tituloCorto: 'Ecológico',
    icono: Leaf,
    color: '#16a34a',
    colorRgb: '22, 163, 74',
    categoriaPoam: 'Geográficos-Ambientales',
    poamCorrespondiente: 'Geográficos-Ambientales',
    subtitulo: 'Sostenibilidad, cambio climático, normativas verdes y residuos',
    descripcion: 'Evalúa normativas ambientales, cambio climático, packaging ecológico, gestión de residuos y transición hacia la eficiencia energética y la sostenibilidad.',
    guiaUso: 'Evalúa normativas ambientales, cambio climático, packaging ecológico, gestión de residuos y transición hacia la eficiencia energética y la sostenibilidad.',
    subdimensionesComunes: [
      'Normativa ambiental y gestión de residuos',
      'Packaging sostenible y reducción de plásticos',
      'Vulnerabilidad climática y estacionalidad',
      'Eficiencia energética y energías renovables',
      'Certificaciones verdes y huella ecológica'
    ],
    criterios: [
      {
        id: 'eco-amb-1',
        label: 'Normativas de gestión de residuos y reducción de plásticos',
        descripcion: 'Restricciones legales al uso de plásticos de un solo uso y exigencia de empaques compostables o reciclables.'
      },
      {
        id: 'eco-amb-2',
        label: 'Vulnerabilidad climática en la cadena de suministros agrícolas',
        descripcion: 'Heladas, sequías o variaciones de temperatura que afectan la cosecha y disponibilidad de materias primas naturales.'
      },
      {
        id: 'eco-amb-3',
        label: 'Exigencia social de certificaciones ecológicas y huella neutra',
        descripcion: 'Reconocimiento y fidelidad de clientes hacia marcas con sellos de producción limpia y sustentable.'
      },
      {
        id: 'eco-amb-4',
        label: 'Eficiencia energética y transición hacia energías renovables',
        descripcion: 'Oportunidades de reducción de costos operativos mediante ahorro de energía eléctrica y agua.'
      }
    ]
  },
  {
    id: 'legal',
    letra: 'L',
    nombre: 'Factores Legales y Regulatorios',
    tituloCorto: 'Legal',
    icono: Scale,
    color: '#e11d48',
    colorRgb: '225, 29, 72',
    categoriaPoam: 'Político-Legal',
    poamCorrespondiente: 'Político-Legal',
    subtitulo: 'Legislación laboral, sanidad, licencias y propiedad intelectual',
    descripcion: 'Revisa el marco normativo obligatorio: legislación laboral, seguridad ocupacional, licencias comerciales, normas sanitarias y protección de la propiedad intelectual.',
    guiaUso: 'Revisa el marco normativo obligatorio: legislación laboral, seguridad ocupacional, licencias comerciales, normas sanitarias y protección de la propiedad intelectual.',
    subdimensionesComunes: [
      'Legislación laboral y seguridad ocupacional',
      'Normas sanitarias, inocuidad y control bromatológico',
      'Licencias municipales y permisos de funcionamiento',
      'Protección de marcas, patentes y propiedad intelectual',
      'Normativa de defensa del consumidor y libre competencia'
    ],
    criterios: [
      {
        id: 'leg-1',
        label: 'Legislación laboral, salarios mínimos y beneficios sociales',
        descripcion: 'Rigidez en las condiciones de empleo, costos de desvinculación y regulación de horas extraordinarias.'
      },
      {
        id: 'leg-2',
        label: 'Normativas sanitarias, bromatológicas y control de calidad',
        descripcion: 'Inspecciones periódicas de salubridad, manipulación higiénica y estándares de inocuidad alimentaria o técnica.'
      },
      {
        id: 'leg-3',
        label: 'Licencias municipales de funcionamiento y uso de suelo',
        descripcion: 'Requisitos administrativos y plazos burocráticos para mantener habilitado el local comercial.'
      },
      {
        id: 'leg-4',
        label: 'Protección de marcas, recetas exclusivas y propiedad intelectual',
        descripcion: 'Mecanismos legales de registro para evitar que competidores copien marcas, fórmulas o código fuente.'
      }
    ]
  }
];

// ============================================================================
// DATOS INICIALES CONFIGURADOS POR CASO DE ESTUDIO
// ============================================================================

export const obtenerDatosPestelIniciales = (casoId) => {
  switch (casoId) {
    case 'cafe-tunari':
      return {
        dimensiones: {
          politico: {
            tipo: 'Oportunidad',
            nivel: 'Medio',
            descripcion: 'Plan municipal de fomento al turismo y revitalización del centro histórico con incentivos para cafés de autor.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: [
              {
                id: 'pestel-ct-pol-1',
                texto: 'Plan municipal de revitalización comercial del distrito histórico',
                tipo: 'Oportunidad',
                subdimension: 'Programas de fomento estatal y subsidios'
              }
            ]
          },
          economico: {
            tipo: 'Amenaza',
            nivel: 'Alto',
            descripcion: 'Inflación en precios de insumos alimentarios importados y encarecimiento del 28% en micro-lotes de café orgánico.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: [
              {
                id: 'pestel-ct-eco-1',
                texto: 'Alza del 28% en costo de leche orgánica y granos verdes certificados',
                tipo: 'Amenaza',
                subdimension: 'Inflación y costo de materias primas'
              }
            ]
          },
          social: {
            tipo: 'Oportunidad',
            nivel: 'Alto',
            descripcion: 'Crecimiento del 40% en consumo de café de especialidad entre jóvenes profesionales que buscan experiencias sensoriales.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: [
              {
                id: 'pestel-ct-soc-1',
                texto: 'Auge de cultura cafetera gourmet y teletrabajo en salones de café',
                tipo: 'Oportunidad',
                subdimension: 'Hábitos, tendencias y patrones de consumo'
              }
            ]
          },
          tecnologico: {
            tipo: 'Amenaza',
            nivel: 'Alto',
            descripcion: 'Franquicias internacionales compiten con apps de pedido móvil rápido y programas de lealtad digital en menos de 3 minutos.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: [
              {
                id: 'pestel-ct-tec-1',
                texto: 'Cadenas rivales operan con aplicaciones móviles de recogida rápida',
                tipo: 'Amenaza',
                subdimension: 'Canales digitales, e-commerce y apps móviles'
              }
            ]
          },
          ecologico: {
            tipo: 'Oportunidad',
            nivel: 'Medio',
            descripcion: 'Exigencia ciudadana de packaging biodegradable y alta valoración del comercio justo con cooperativas de los Yungas.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: [
              {
                id: 'pestel-ct-ecoamb-1',
                texto: 'Consumidores dispuestos a pagar más por café con sello agroecológico',
                tipo: 'Oportunidad',
                subdimension: 'Certificaciones verdes y huella ecológica'
              }
            ]
          },
          legal: {
            tipo: 'Amenaza',
            nivel: 'Medio',
            descripcion: 'Fiscalización estricta de normas sanitarias y rigidez en normativas laborales que elevan el costo de rotación de baristas.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: [
              {
                id: 'pestel-ct-leg-1',
                texto: 'Costos indemnizatorios elevados por rotación frecuente de personal',
                tipo: 'Amenaza',
                subdimension: 'Legislación laboral y seguridad ocupacional'
              }
            ]
          }
        },
        diagnosticoGlobal: {
          clima: 'Entorno Favorable con Desafíos Tecnológicos',
          estrategiaRecomendada: 'Aprovechar el boom sociocultural del café de autor y la sostenibilidad para blindar la marca, modernizando de urgencia los canales digitales de pedido.'
        }
      };

    case 'technova':
      return {
        dimensiones: {
          politico: {
            tipo: 'Oportunidad',
            nivel: 'Medio',
            descripcion: 'Políticas estatales de digitalización tributaria obligatoria y facturación electrónica para medianas empresas.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: [
              {
                id: 'pestel-tn-pol-1',
                texto: 'Mandato gubernamental de facturación digital obligatoria',
                tipo: 'Oportunidad',
                subdimension: 'Políticas tributarias e incentivos fiscales'
              }
            ]
          },
          economico: {
            tipo: 'Amenaza',
            nivel: 'Alto',
            descripcion: 'Escasez de divisas y encarecimiento del dólar que eleva las tarifas de servicios cloud (AWS, Azure) en moneda extranjera.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: [
              {
                id: 'pestel-tn-eco-1',
                texto: 'Costos de hosting en dólares ante devaluación cambiaria',
                tipo: 'Amenaza',
                subdimension: 'Tipo de cambio y divisas'
              }
            ]
          },
          social: {
            tipo: 'Oportunidad',
            nivel: 'Medio',
            descripcion: 'Aceptación generalizada del trabajo remoto y necesidad de software contable accesible desde cualquier navegador.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: [
              {
                id: 'pestel-tn-soc-1',
                texto: 'Directivos prefieren gestionar nóminas y balances en la nube',
                tipo: 'Oportunidad',
                subdimension: 'Estilos de vida y hábitos de compra'
              }
            ]
          },
          tecnologico: {
            tipo: 'Oportunidad',
            nivel: 'Alto',
            descripcion: 'Aparición de APIs de Inteligencia Artificial para automatizar categorización de asientos contables y conciliación bancaria.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: [
              {
                id: 'pestel-tn-tec-1',
                texto: 'Integración de modelos de lenguaje para lectura de recibos fiscales',
                tipo: 'Oportunidad',
                subdimension: 'Investigación, Desarrollo e Innovación (I+D)'
              }
            ]
          },
          ecologico: {
            tipo: 'Oportunidad',
            nivel: 'Bajo',
            descripcion: 'Transición hacia oficinas sin papel (paperless office) y reducción de huella de carbono administrativa.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: [
              {
                id: 'pestel-tn-ecoamb-1',
                texto: 'Eliminación del archivo físico de facturas en papel',
                tipo: 'Oportunidad',
                subdimension: 'Normativa ambiental y gestión de residuos'
              }
            ]
          },
          legal: {
            tipo: 'Amenaza',
            nivel: 'Alto',
            descripcion: 'Nuevas regulaciones estrictas de protección de datos personales y ciberseguridad financiera con severas multas.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: [
              {
                id: 'pestel-tn-leg-1',
                texto: 'Exigencia de auditorías de seguridad y cifrado bancario de datos',
                tipo: 'Amenaza',
                subdimension: 'Normativa de defensa del consumidor y libre competencia'
              }
            ]
          }
        },
        diagnosticoGlobal: {
          clima: 'Gran Oportunidad de Mercado con Riesgo Tecnológico/Cambiario',
          estrategiaRecomendada: 'Apalancarse en el mandato legal de digitalización tributaria, estabilizando la nube para cumplir los estándares de seguridad sin disparar costos de infraestructura.'
        }
      };

    case 'textiles-valle':
      return {
        dimensiones: {
          politico: {
            tipo: 'Oportunidad',
            nivel: 'Alto',
            descripcion: 'Acuerdo comercial de exportación con arancel cero hacia países del Mercosur para manufacturas de algodón.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: [
              {
                id: 'pestel-tv-pol-1',
                texto: 'Cupos de exportación preferencial libre de gravámenes aduaneros',
                tipo: 'Oportunidad',
                subdimension: 'Comercio exterior, tratados y aranceles'
              }
            ]
          },
          economico: {
            tipo: 'Amenaza',
            nivel: 'Alto',
            descripcion: 'Fluctuación en la cotización internacional de la libra de algodón y competencia con monedas devaluadas de la región.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: [
              {
                id: 'pestel-tv-eco-1',
                texto: 'Algodón importado indexado a precios de bolsa internacional',
                tipo: 'Amenaza',
                subdimension: 'Inflación y costo de materias primas'
              }
            ]
          },
          social: {
            tipo: 'Oportunidad',
            nivel: 'Medio',
            descripcion: 'Preferencia en mercados externos por confecciones artesanales con tradición textil y trazabilidad comunitaria.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: [
              {
                id: 'pestel-tv-soc-1',
                texto: 'Reconocimiento del algodón de fibra larga en nichos internacionales',
                tipo: 'Oportunidad',
                subdimension: 'Hábitos, tendencias y patrones de consumo'
              }
            ]
          },
          tecnologico: {
            tipo: 'Amenaza',
            nivel: 'Alto',
            descripcion: 'Competidores industriales en Perú y Colombia operan con telares circulares automáticos y software de corte láser.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: [
              {
                id: 'pestel-tv-tec-1',
                texto: 'Plantas extranjeras automatizadas con costos unitarios 35% menores',
                tipo: 'Amenaza',
                subdimension: 'Automatización de procesos y maquinaria'
              }
            ]
          },
          ecologico: {
            tipo: 'Amenaza',
            nivel: 'Medio',
            descripcion: 'Normativas severas sobre tratamiento de aguas residuales y tintorería ecológica con penalizaciones ambientales.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: [
              {
                id: 'pestel-tv-ecoamb-1',
                texto: 'Exigencia de plantas de tratamiento de efluentes de tintorería',
                tipo: 'Amenaza',
                subdimension: 'Normativa ambiental y gestión de residuos'
              }
            ]
          },
          legal: {
            tipo: 'Amenaza',
            nivel: 'Medio',
            descripcion: 'Regulaciones laborales de seguridad industrial en planta y normativas de etiquetado de origen de exportación.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: [
              {
                id: 'pestel-tv-leg-1',
                texto: 'Certificaciones de seguridad ocupacional para habilitar exportación',
                tipo: 'Amenaza',
                subdimension: 'Legislación laboral y seguridad ocupacional'
              }
            ]
          }
        },
        diagnosticoGlobal: {
          clima: 'Ventana de Exportación con Urgencia de Modernización Productiva',
          estrategiaRecomendada: 'Capitalizar el acuerdo arancelario internacional mediante alianzas de hilado y renovación de telares para recortar el lead time.'
        }
      };

    default:
      return {
        dimensiones: {
          politico: {
            tipo: 'Oportunidad',
            nivel: 'Medio',
            descripcion: 'Políticas de estabilidad y fomento sectorial aplicables a la empresa.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: []
          },
          economico: {
            tipo: 'Amenaza',
            nivel: 'Medio',
            descripcion: 'Variables macroeconómicas que inciden en costos y demanda del mercado.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: []
          },
          social: {
            tipo: 'Oportunidad',
            nivel: 'Medio',
            descripcion: 'Hábitos socioculturales y tendencias de consumo en los segmentos meta.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: []
          },
          tecnologico: {
            tipo: 'Oportunidad',
            nivel: 'Alto',
            descripcion: 'Herramientas digitales y de automatización para modernizar la operación.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: []
          },
          ecologico: {
            tipo: 'Oportunidad',
            nivel: 'Medio',
            descripcion: 'Prácticas de sostenibilidad y eficiencia ambiental en la cadena de valor.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: []
          },
          legal: {
            tipo: 'Amenaza',
            nivel: 'Medio',
            descripcion: 'Marco normativo laboral, comercial y de seguridad aplicable.',
            criteriosActivos: {},
            evidenciasVinculadas: [],
            factoresManuales: []
          }
        },
        diagnosticoGlobal: {
          clima: 'Entorno Macro Moderado',
          estrategiaRecomendada: 'Equilibrar la captura de oportunidades sociales y tecnológicas mitigando los riesgos económicos y legales.'
        }
      };
  }
};

// ============================================================================
// CÁLCULO DE MÉTRICAS Y BALANCES MACROESTRATÉGICOS
// ============================================================================

export const calcularMetricasPestel = (datosPestel) => {
  const dims = datosPestel?.dimensiones || {};
  let totalOportunidades = 0;
  let totalAmenazas = 0;
  let sumaImpacto = 0;
  let totalVinculadas = 0;
  let totalManuales = 0;

  DIMENSIONES_PESTEL.forEach(d => {
    const data = dims[d.id] || {};
    const manuales = data.factoresManuales || [];

    if (manuales.length > 0) {
      manuales.forEach(m => {
        const mTipo = typeof m === 'object' && m?.tipo ? m.tipo : (data.tipo || 'Oportunidad');
        if (mTipo === 'Amenaza') totalAmenazas++;
        else totalOportunidades++;
      });
    } else {
      const esOp = data.tipo === 'Oportunidad';
      if (esOp) totalOportunidades++;
      else totalAmenazas++;
    }

    const nivel = data.nivel || 'Medio';
    const pts = nivel === 'Alto' ? 3 : nivel === 'Medio' ? 2 : 1;
    sumaImpacto += pts;

    totalVinculadas += (data.evidenciasVinculadas || []).length;
    totalManuales += manuales.length;
  });

  const totalEvaluadas = totalOportunidades + totalAmenazas || DIMENSIONES_PESTEL.length;
  const ratioOportunidad = totalOportunidades / totalEvaluadas;

  let clima = 'Favorable';
  let colorClima = '#10b981';
  let badgeClima = 'badge-favorable';
  let textoClima = 'Macroentorno predominantemente favorable para la expansión y diferenciación.';

  if (ratioOportunidad <= 0.35) {
    clima = 'Hostil / Muy Desafiante';
    colorClima = '#ef4444';
    badgeClima = 'badge-hostil';
    textoClima = 'Presión externa severa: predominan las amenazas macroeconómicas y regulatorias.';
  } else if (ratioOportunidad <= 0.6) {
    clima = 'Moderado / Mixto';
    colorClima = '#f59e0b';
    badgeClima = 'badge-moderado';
    textoClima = 'Macroentorno balanceado: exige capturar oportunidades tecnológicas protegiendo márgenes.';
  }

  return {
    totalOportunidades,
    totalAmenazas,
    sumaImpacto,
    totalVinculadas,
    totalManuales,
    clima,
    colorClima,
    badgeClima,
    textoClima,
    ratioOportunidad
  };
};

// ============================================================================
// CONVERSOR / EXPORTADOR AUTOMÁTICO DE PESTEL AL DIAGRAMA POAM
// ============================================================================

export const generarPayloadPoamDesdePestel = (datosPestel, ideasCatalogo = []) => {
  if (!datosPestel?.dimensiones) return [];

  const factoresPoamExportados = [];
  const dims = datosPestel.dimensiones;

  DIMENSIONES_PESTEL.forEach(d => {
    const dimData = dims[d.id];
    if (!dimData) return;

    // 1. Exportar ideas vinculadas a esta dimensión si existieran
    const vinculadasIds = dimData.evidenciasVinculadas || [];
    vinculadasIds.forEach(id => {
      const idea = ideasCatalogo.find(i => i.id === id);
      if (!idea) return;

      const tipo = dimData.tipo || (idea.cuadranteCorrecto === 'Oportunidades' ? 'Oportunidad' : 'Amenaza');
      const nivel = dimData.nivel || 'Medio';

      factoresPoamExportados.push({
        id: 'poam-pestel-' + idea.id,
        categoria: d.categoriaPoam || 'Político-Legal',
        subdivision: d.tituloCorto,
        factor: idea.texto,
        tipo,
        calificacion: '',
        impacto: '',
        impactoConfiguradoPOAM: false,
        justificacion: 'Variable del macroentorno analizada en PESTEL (' + d.nombre + '). Clasificada como ' + tipo + ' con impacto ' + nivel + '.',
        fuente: idea.fuente || ('PESTEL: ' + d.tituloCorto),
        origenPestel: true,
        tagOrigen: '[Macro: PESTEL]',
        dimensionPestel: d.id,
        esPersonalizado: false
      });
    });

    // 2. Exportar factores formulados en esta dimensión
    (dimData.factoresManuales || []).forEach((item, idx) => {
      const isObj = typeof item === 'object' && item !== null;
      const texto = isObj ? item.texto : item;
      if (!texto || !texto.trim()) return;

      const tipo = isObj && item.tipo ? item.tipo : (dimData.tipo || 'Oportunidad');
      const subdimension = isObj && item.subdimension ? item.subdimension : d.tituloCorto;

      factoresPoamExportados.push({
        id: isObj && item.id ? ('poam-' + item.id) : ('poam-pestel-man-' + d.id + '-' + idx),
        categoria: d.categoriaPoam || 'Político-Legal',
        subdivision: subdimension || d.tituloCorto,
        factor: texto.trim(),
        tipo,
        calificacion: '',
        impacto: '',
        impactoConfiguradoPOAM: false,
        justificacion: 'Hallazgo macroestratégico formulado en la dimensión PESTEL (' + d.nombre + '). Subdimensión: ' + subdimension + '.',
        fuente: 'PESTEL: ' + d.tituloCorto,
        origenPestel: true,
        tagOrigen: '[Macro: PESTEL]',
        dimensionPestel: d.id,
        esPersonalizado: true
      });
    });
  });

  return factoresPoamExportados;
};
