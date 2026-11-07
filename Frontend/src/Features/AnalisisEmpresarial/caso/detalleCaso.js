// Base de datos detallada de los Casos de Estudio del Simulador Empresarial
// Proporciona el enunciado completo, antecedentes, auditoría situacional y preguntas clave

export const CASOS_DETALLE_COMPLETO = {
  'cafe-tunari': {
    id: 'cafe-tunari',
    nombreEmpresa: 'Café Tunari Gourmet & Tueste Especial',
    sector: 'Gastronomía & Retail Especializado',
    etapa: 'Madurez / En Crisis de Reinvención',
    horizonteTiempo: 'Plan Estratégico a 12 Meses',
    enunciadoCompleto: `Café Tunari es una cafetería de especialidad fundada hace 7 años en el corazón del distrito histórico y financiero. Durante años se posicionó como el referente indiscutible del café de altura de grano seleccionado y repostería artesanal, manteniendo una clientela leal de ejecutivos, académicos y turistas. 

Sin embargo, en los últimos 9 meses, la inauguración de dos franquicias internacionales a menos de 150 metros (con pedidos inmediatos por app móvil, formatos 'grab & go' y agresivos programas de lealtad) ha desencadenado una caída abrupta del 35% en las ventas de salón. 

Internamente, la cafetería enfrenta una severa rotación del 40% en su equipo de baristas debido a salarios poco competitivos frente al sector y a la carencia de un plan de carrera, afectando la homogeneidad del café y elevando los tiempos de espera promedio a 14 minutos en horas pico. A nivel financiero, el margen bruto ha retrocedido al 24% por el encarecimiento de granos verdes certificados y empaques biodegradables.

La junta directiva ha aprobado un fondo extraordinario de $50,000 USD para ejecutar este proceso de consultoría. El dilema central radica en determinar si la empresa debe entrar a una guerra de precios y velocidad contra las franquicias o, por el contrario, consolidar su diferenciación hacia experiencias sensoriales de lujo, suscripciones B2B corporativas y digitalización inteligente del servicio.`,
    antecedentes: `Fundada en 2017 por dos agrónomos apasionados por el cultivo agroecológico y el barismo de autor. La empresa construyó una reputación estricta de comercio justo con cooperativas de altura, lo que le valió premios locales de gastronomía. A pesar de su excelente producto, la gestión se mantuvo empírica, sin formalización de procesos, sin software de fidelización (CRM) y dependiendo exclusivamente del flujo peatonal tradicional.`,
    puntosCriticosAuditoria: [
      {
        icono: 'AlertTriangle',
        titulo: 'Caída de Afluencia y Ventas (-35%)',
        desc: 'Pérdida de clientes habituales hacia cadenas internacionales con tiempos de atención menores a 3 minutos.'
      },
      {
        icono: 'Users',
        titulo: 'Fuga de Talento Humano (Rotación 40%)',
        desc: 'Pérdida de baristas senior capacitados; las nuevas contrataciones tardan hasta 6 semanas en calibrar el estándar de extracción.'
      },
      {
        icono: 'TrendingDown',
        titulo: 'Compresión del Margen Bruto (24%)',
        desc: 'Aumento del 28% en insumos clave (leche orgánica, micro-lotes de café) sin traslado proporcional al precio de venta.'
      },
      {
        icono: 'Clock',
        titulo: 'Tiempos de Espera Elevados (14 min)',
        desc: 'Flujo de preparación no estandarizado y caja única con cobro manual que genera cuellos de botella en horas punta.'
      },
      {
        icono: 'Sparkles',
        titulo: 'Oportunidad Latente B2B y Suscripciones',
        desc: 'Más de 40 empresas corporativas en un radio de 1 km demandan café tostado en grano mensual y catering para reuniones ejecutivas.'
      }
    ],
    preguntasReflexion: [
      '¿Qué ventajas competitivas internas (fortalezas) de Café Tunari son inimitables para las grandes cadenas industriales?',
      '¿Cómo debe priorizarse el presupuesto de $50,000 USD entre digitalización, retención de talento y remodelación de la experiencia?',
      '¿Cuáles factores externos representan las amenazas más letales y cuáles oportunidades no han sido explotadas?',
      '¿Debería Café Tunari diversificar su modelo hacia la venta de café en grano y suscripciones para no depender del aforo físico?'
    ],
    metricasClave: [
      { label: 'Margen Bruto', valor: '24%', meta: '38%', estado: 'alerta', porcentaje: 60 },
      { label: 'Retención de Clientes', valor: '58%', meta: '75%', estado: 'precaucion', porcentaje: 75 },
      { label: 'Ticket Promedio', valor: '$4.50 USD', meta: '$6.50 USD', estado: 'alerta', porcentaje: 65 },
      { label: 'Tiempo de Espera en Caja', valor: '14 min', meta: '< 5 min', estado: 'critico', porcentaje: 35 }
    ]
  },

  'technova': {
    id: 'technova',
    nombreEmpresa: 'TechNova Cloud SaaS Enterprise',
    sector: 'Tecnología & Software B2B',
    etapa: 'Scale-up / Post Ronda Semilla',
    horizonteTiempo: 'Plan Estratégico a 18 Meses',
    enunciadoCompleto: `TechNova es una plataforma de software en la nube (SaaS) especializada en automatización de procesos contables y de nómina para medianas empresas en Latinoamérica. Tras captar exitosamente una ronda semilla de capital riesgo, la empresa destinó el 70% de sus recursos a marketing de adquisición agresivo, incrementando su base de clientes a un ritmo del 45% interanual. 

No obstante, este crecimiento acelerado ha dejado al descubierto grietas estructurales: la tasa de cancelación (Churn Rate) se disparó a un alarmante 18% mensual y el volumen de tickets sin resolver en la mesa de soporte técnico aumentó un 140%, con quejas reiteradas por caídas del sistema en cierres de mes.

El ratio LTV/CAC ha caído a un peligroso 2.1x (por debajo del 3.0x recomendado en la industria), amenazando la sostenibilidad financiera a mediano plazo si no se revierte la sangría de usuarios existentes. La empresa cuenta con una caja disponible de $120,000 USD y debe decidir si frena la captación de nuevos clientes para concentrarse de lleno en la reingeniería de la infraestructura cloud, la contratación de ingenieros de confiabilidad (SRE) y un programa formal de Customer Success.`,
    antecedentes: `Fundada en 2021 por ex-desarrolladores de fintechs, TechNova nació con una arquitectura monolítica ágil pero de difícil escalamiento masivo. Al priorizar el crecimiento en ingresos anuales recurrentes (ARR de $420K) sobre la estabilidad del código, se acumuló una considerable deuda técnica que ahora bloquea el despliegue de nuevas funcionalidades prometidas a clientes clave.`,
    puntosCriticosAuditoria: [
      {
        icono: 'TrendingDown',
        titulo: 'Tasa de Cancelación Churn Crítica (18%/mes)',
        desc: 'Casi una quinta parte de los usuarios activos cancela su suscripción antes del tercer mes de uso.'
      },
      {
        icono: 'AlertTriangle',
        titulo: 'Colapso en Soporte Técnico (SLA > 48 hrs)',
        desc: 'Falta de guías de autoservicio y saturación del canal de chat con consultas repetitivas de configuración.'
      },
      {
        icono: 'Sliders',
        titulo: 'Deuda Técnica y Caídas de Servidor',
        desc: 'La base de datos se sobrecarga en días de liquidación impositiva, provocando indisponibilidad no programada.'
      },
      {
        icono: 'DollarSign',
        titulo: 'Desbalance LTV/CAC (2.1x)',
        desc: 'Se gasta demasiado en adquirir leads comerciales que no permanecen el tiempo suficiente para amortizar la inversión.'
      }
    ],
    preguntasReflexion: [
      '¿Qué iniciativas internas urgentes estabilizarán la plataforma y detendrán el churn antes de continuar con la expansión comercial?',
      '¿Cómo puede rediseñarse el embudo de onboarding para asegurar que los usuarios alcancen valor real en sus primeros 7 días?',
      '¿Es conveniente crear un equipo dedicado de Customer Success o reasignar presupuesto publicitario hacia soporte 24/7?'
    ],
    metricasClave: [
      { label: 'ARR Anual Recurrente', valor: '$420K USD', meta: '$700K USD', estado: 'precaucion', porcentaje: 60 },
      { label: 'Churn Rate Mensual', valor: '18%/mes', meta: '< 4%/mes', estado: 'critico', porcentaje: 25 },
      { label: 'Ratio LTV / CAC', valor: '2.1x', meta: '3.5x', estado: 'alerta', porcentaje: 55 },
      { label: 'Tiempo de Resolución SLA', valor: '52 hrs', meta: '< 8 hrs', estado: 'critico', porcentaje: 30 }
    ]
  },

  'textiles-valle': {
    id: 'textiles-valle',
    nombreEmpresa: 'Textiles del Valle S.A.',
    sector: 'Manufactura Textil & Confección Industrial',
    etapa: 'Madurez / Modernización Productiva',
    horizonteTiempo: 'Plan Estratégico a 24 Meses',
    enunciadoCompleto: `Textiles del Valle S.A. es un taller manufacturero con más de 25 años de trayectoria en hilandería y confección de prendas de algodón de alta densidad. Cuenta con un parque de maquinaria mecánica tradicional que opera al 88% de su capacidad instalada, pero que presenta frecuentes paradas no programadas por desgaste y escasez de repuestos importados.

Recientemente se ha abierto un acuerdo comercial inédito que otorga cupos de exportación libre de aranceles al Mercosur, abriendo una demanda potencial de hasta 50,000 unidades mensuales. Sin embargo, el lead time actual de la planta es de 18 días hábiles, con un costo unitario de $12.40 USD por prenda, lo cual reduce significativamente el margen frente a productores peruanos y colombianos que operan con tejeduría circular automatizada.

Con un presupuesto de inversión de $75,000 USD en caja, la gerencia general debe balancear entre renovar equipos críticos mediante leasing industrial, implementar metodologías Lean Manufacturing para recortar desperdicios de tela, o subcontratar la fase de tintorería y acabado final.`,
    antecedentes: `Empresa de raíz familiar caracterizada por su alta maestría artesanal en el tejido y contratos estables con uniformes escolares y corporativos locales. La apertura de fronteras comerciales exige ahora normas internacionales de trazabilidad textil, control milimétrico de mermas y plazos de entrega estrictos con penalizaciones contractuales.`,
    puntosCriticosAuditoria: [
      {
        icono: 'Factory',
        titulo: 'Capacidad al Límite (88%) y Obsolescencia',
        desc: 'Las máquinas sufren un promedio de 12 horas semanales de inactividad por mantenimiento correctivo de emergencia.'
      },
      {
        icono: 'Clock',
        titulo: 'Lead Time Prolongado (18 días)',
        desc: 'Demoras en la fase de corte y remallado impiden cumplir despachos marítimos y aéreos de clientes mayoristas.'
      },
      {
        icono: 'TrendingDown',
        titulo: 'Costo Unitario Elevado ($12.40 USD)',
        desc: 'Pérdidas del 14% de retazos de tela por patrones de corte no digitalizados con software CAD/CAM.'
      },
      {
        icono: 'Globe',
        titulo: 'Tratado de Libre Arancel con Mercosur',
        desc: 'Ventana de oportunidad histórica para exportar con margen neto proyectado del 28% si se modernizan procesos.'
      }
    ],
    preguntasReflexion: [
      '¿Qué porcentaje del presupuesto de $75,000 USD debe asignarse a automatización frente a capacitación operativa en planta?',
      '¿Cómo mitigar el riesgo de paradas mecánicas mientras se capacita al personal en mantenimiento preventivo autónomo (TPM)?',
      '¿Qué ventajas de calidad y tejido propio de Textiles del Valle deben promocionarse en los catálogos de exportación?'
    ],
    metricasClave: [
      { label: 'Uso Capacidad Instalada', valor: '88%', meta: '80% (holgura)', estado: 'precaucion', porcentaje: 85 },
      { label: 'Costo Unitario Prenda', valor: '$12.40', meta: '$9.20', estado: 'alerta', porcentaje: 60 },
      { label: 'Lead Time de Fabricación', valor: '18 días', meta: '< 10 días', estado: 'critico', porcentaje: 40 },
      { label: 'Desperdicio de Material', valor: '14%', meta: '< 5%', estado: 'alerta', porcentaje: 50 }
    ]
  }  
};

/**
 * Obtiene el objeto detallado del caso de estudio o genera uno estructurado
 * en caso de que sea un caso dinámico o nuevo.
 */
export function obtenerDetalleCompletoCaso(caso) {
  if (!caso) return null;
  
  let detallesParsed = caso.detalles;
  if (typeof detallesParsed === 'string') {
    try {
      detallesParsed = JSON.parse(detallesParsed);
    } catch {
      detallesParsed = {};
    }
  }

  const defaultInstrucciones = 'Lee atentamente el contexto y la situación de la empresa a continuación. Al finalizar tu lectura, pulsa el botón "Continuar lluvia de ideas(fase 2)" para comenzar a identificar y clasificar las evidencias y hechos clave.';

  const casoGuardado = CASOS_DETALLE_COMPLETO[caso.id];
  if (casoGuardado) {
    const textoContexto = caso.descripcion || caso.contexto || detallesParsed?.contexto || detallesParsed?.enunciadoCompleto || casoGuardado.enunciadoCompleto;
    const textoInstrucciones = caso.instrucciones || detallesParsed?.instrucciones || casoGuardado.instrucciones || defaultInstrucciones;

    return {
      ...casoGuardado,
      tituloOriginal: caso.titulo,
      capital: caso.capital,
      dificultad: caso.dificultad,
      estrellas: caso.estrellas,
      imagen: caso.imagen,
      foco: caso.foco || textoInstrucciones,
      instrucciones: textoInstrucciones,
      contexto: textoContexto,
      enunciadoCompleto: textoContexto,
      ideasLluvia: casoGuardado.puntosCriticosAuditoria?.map(p => ({ texto: p.titulo, ambito: 'Interno' })) || []
    };
  }

  const docAdjunto = caso.archivoDocumento || detallesParsed?.archivoDocumento;
  const rawContexto = caso.descripcion || caso.contexto || detallesParsed?.contexto || detallesParsed?.enunciadoCompleto || '';
  const textoContexto = (rawContexto.trim().toLowerCase().startsWith('documento del caso:') && docAdjunto)
    ? ''
    : (rawContexto || (docAdjunto ? '' : 'Se requiere analizar la situación integral de la empresa para formular estrategias de crecimiento y mitigación de riesgos.'));
  const textoInstrucciones = caso.instrucciones || detallesParsed?.instrucciones || defaultInstrucciones;

  // Generador dinámico en caso de casos creados por el usuario o no indexados
  return {
    id: caso.id || 'caso-generico',
    nombreEmpresa: detallesParsed?.subtitulo || caso.titulo || 'Empresa en Diagnóstico',
    sector: detallesParsed?.sector || caso.categoria || 'Sector Empresarial',
    etapa: detallesParsed?.etapa || 'Evaluación y Diagnóstico Estratégico',
    horizonteTiempo: detallesParsed?.horizonteTiempo || 'Plan Operativo y Estratégico Anual',
    fraseDestacada: detallesParsed?.fraseDestacada || '',
    instrucciones: textoInstrucciones,
    contexto: textoContexto,
    enunciadoCompleto: textoContexto,
    antecedentes: detallesParsed?.antecedentes || `Empresa con trayectoria relevante en su nicho de mercado (${detallesParsed?.sector || caso.categoria}). Presenta desafíos operativos y comerciales que exigen una reorientación estratégica metodológica.`,
    misionOficial: detallesParsed?.misionOficial || '',
    puntosCriticosAuditoria: detallesParsed?.puntosCriticosAuditoria && detallesParsed.puntosCriticosAuditoria.length > 0 
      ? detallesParsed.puntosCriticosAuditoria.map(p => ({
          icono: 'Target', // Default genérico para custom
          titulo: p.titulo,
          desc: p.desc
        }))
      : [
          {
            icono: 'Target',
            titulo: 'Desafío Principal Diagnosticado',
            desc: detallesParsed?.desafioPrincipal || 'Identificar fortalezas y debilidades internas frente a las fuerzas competitivas del entorno.'
          },
          {
            icono: 'DollarSign',
            titulo: 'Presupuesto Estratégico Asignado',
            desc: `Cuenta con un capital inicial de ${caso.capital || '$50,000 USD'} para financiar planes de mejora y mitigación.`
          }
        ],
    preguntasReflexion: detallesParsed?.preguntasReflexion && detallesParsed.preguntasReflexion.length > 0 
      ? detallesParsed.preguntasReflexion 
      : [
          '¿Cuáles son las mayores vulnerabilidades internas frente a la competencia directa?',
          '¿Qué oportunidades de mercado pueden aprovecharse con los recursos disponibles?',
          '¿Qué ideas deben priorizarse como esenciales en la Matriz FODA y POAM?'
        ],
    metricasClave: [],
    tituloOriginal: caso.titulo,
    capital: caso.capital,
    dificultad: caso.dificultad,
    estrellas: caso.estrellas,
    imagen: caso.imagen,
    foco: caso.foco || textoInstrucciones,
    archivoDocumento: detallesParsed?.archivoDocumento || caso.archivoDocumento || null,
    ideasLluvia: (detallesParsed?.ideasLluvia?.length > 0) 
      ? detallesParsed.ideasLluvia 
      : (caso.puntosCriticosAuditoria || []).map(p => ({ texto: p.titulo, ambito: 'Interno' }))
  };
}
