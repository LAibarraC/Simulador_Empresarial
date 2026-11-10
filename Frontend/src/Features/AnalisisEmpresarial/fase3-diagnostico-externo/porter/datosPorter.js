import {

  Swords,

  ShieldAlert,

  ShoppingCart,

  Truck,

  Zap

} from 'lucide-react';

// ============================================================================

// DEFINICIÓN TEÓRICA METODOLÓGICA DE LAS 5 FUERZAS DE MICHAEL PORTER

// ============================================================================

export const FUERZAS_PORTER = [

  {

    id: 'rivalidad',

    posicion: 'centro',

    nombre: 'Rivalidad Competitiva (Lucha entre competidores actuales)',

    tituloCorto: 'Rivalidad Competitiva',

    icono: Swords,

    color: '#ef4444',

    colorRgb: '239, 68, 68',

    categoriaPoam: 'Económica',

    subtitulo: 'Intensidad de la guerra de precios y promociones en el mercado',

    descripcion: 'Objetivo: Medir la intensidad de la guerra de precios y promociones en el mercado.',

    criterios: [

      {

        id: 'riv-1',

        label: 'Gran cantidad de competidores o de tamaño similar',

        descripcion: 'Muchos negocios pelean por la misma cuota de mercado en la zona.'

      },

      {

        id: 'riv-2',

        label: 'Crecimiento lento o estancado del sector',

        descripcion: 'Para que un negocio venda más, está obligado a quitárselo a otro competidor.'

      },

      {

        id: 'riv-3',

        label: 'Ofertas muy similares (Poca diferenciación)',

        descripcion: 'Los productos de la competencia son casi idénticos a los tuyos.'

      },

      {

        id: 'riv-4',

        label: 'Altas barreras de salida',

        descripcion: 'Salirse del negocio es muy costoso (por contratos, maquinaria o liquidaciones), lo que obliga a los rivales a rematar precios.'

      }

    ]

  },

  {

    id: 'entrantes',

    posicion: 'arriba',

    nombre: 'Barreras de Entrada (Amenaza de Nuevos Competidores)',

    tituloCorto: 'Barreras de Entrada',

    icono: ShieldAlert,

    color: '#f59e0b',

    colorRgb: '245, 158, 11',

    categoriaPoam: 'Económica',

    subtitulo: 'Frenos y barreras para que ingresen nuevos participantes',

    descripcion: 'Objetivo: Medir qué tan fácil es que entre un nuevo competidor a quitar clientes.',

    criterios: [

      {

        id: 'ent-1',

        label: 'Baja inversión inicial requerida',

        descripcion: 'No se necesita mucho capital ni maquinaria costosa para empezar a competir.'

      },

      {

        id: 'ent-2',

        label: 'Baja lealtad a marcas establecidas',

        descripcion: 'Los clientes están dispuestos a cambiarse rápidamente a cualquier marca nueva.'

      },

      {

        id: 'ent-3',

        label: 'Acceso abierto a insumos y canales',

        descripcion: 'Es fácil conseguir los mismos proveedores e ingresar a los mismos puntos de venta.'

      },

      {

        id: 'ent-4',

        label: 'Trámites y regulaciones mínimas',

        descripcion: 'Casi no existen licencias complejas, permisos sanitarios estrictos ni patentes que bloqueen la entrada.'

      }

    ]

  },

  {

    id: 'clientes',

    posicion: 'derecha',

    nombre: 'Poder de Negociación de los Clientes',

    tituloCorto: 'Poder de Clientes',

    icono: ShoppingCart,

    color: '#06b6d4',

    colorRgb: '6, 182, 212',

    categoriaPoam: 'Económica',

    subtitulo: 'Capacidad de los compradores de exigir descuentos y fijar condiciones',

    descripcion: 'Objetivo: Medir la capacidad de los compradores de exigir descuentos y fijar condiciones.',

    criterios: [

      {

        id: 'cli-1',

        label: 'Alta sensibilidad al precio',

        descripcion: 'Los clientes buscan activamente la opción más barata y rechazan cualquier incremento.'

      },

      {

        id: 'cli-2',

        label: 'Costo de cambio nulo',

        descripcion: 'El cliente no pierde nada cambiándose de inmediato a la competencia de al lado.'

      },

      {

        id: 'cli-3',

        label: 'Clientes compran en grandes volúmenes (Concentración)',

        descripcion: 'Pocos compradores concentran la mayor parte de las ventas de la empresa.'

      },

      {

        id: 'cli-4',

        label: 'Bajo valor agregado percibido',

        descripcion: 'El cliente siente que tu producto es genérico y no percibe un beneficio que justifique pagar más.'

      }

    ]

  },

  {

    id: 'proveedores',

    posicion: 'izquierda',

    nombre: 'Poder de Negociación de los Proveedores',

    tituloCorto: 'Poder de Proveedores',

    icono: Truck,

    color: '#8b5cf6',

    colorRgb: '139, 92, 246',

    categoriaPoam: 'Económica',

    subtitulo: 'Poder que tienen los proveedores de subir precios o imponer condiciones',

    descripcion: 'Objetivo: Medir el poder que tienen los proveedores de subir precios o imponer condiciones.',

    criterios: [

      {

        id: 'pro-1',

        label: 'Pocos proveedores en el mercado (Concentración)',

        descripcion: 'Existen pocas opciones y la empresa depende de un monopolio u oligopolio.'

      },

      {

        id: 'pro-2',

        label: 'Insumos críticos o difíciles de sustituir',

        descripcion: 'La materia prima clave no se puede reemplazar fácilmente por otra opción.'

      },

      {

        id: 'pro-3',

        label: 'Alto costo al cambiar de proveedor',

        descripcion: 'Romper contrato o cambiar a otro proveedor genera costos o penalizaciones elevadas.'

      },

      {

        id: 'pro-4',

        label: 'La empresa es un cliente pequeño para el proveedor',

        descripcion: 'Al comprar volúmenes bajos, el proveedor no ofrece descuentos ni trato preferencial.'

      }

    ]

  },

  {

    id: 'sustitutos',

    posicion: 'abajo',

    nombre: 'Amenaza de Productos Sustitutos',

    tituloCorto: 'Amenaza de Sustitutos',

    icono: Zap,

    color: '#10b981',

    colorRgb: '16, 185, 129',

    categoriaPoam: 'Tecnológica',

    subtitulo: 'Disponibilidad de alternativas que cubren la misma necesidad',

    descripcion: 'Objetivo: Medir si existen alternativas diferentes que resuelvan la misma necesidad.',

    criterios: [

      {

        id: 'sus-1',

        label: 'Disponibilidad de sustitutos directos',

        descripcion: 'Existen productos alternativos fáciles de encontrar en el mercado habitual.'

      },

      {

        id: 'sus-2',

        label: 'Mejor relación calidad/precio del sustituto',

        descripcion: 'La alternativa ofrece un beneficio igual o superior a un costo menor.'

      },

      {

        id: 'sus-3',

        label: 'Facilidad de adopción del cliente',

        descripcion: 'Al consumidor no le cuesta ningún esfuerzo cambiar su hábito y usar el producto sustituto.'

      },

      {

        id: 'sus-4',

        label: 'Tendencia cultural o tecnológica hacia nuevos formatos',

        descripcion: 'Nuevas modas, formatos digitales o estilos de vida saludables desplazan el consumo del producto tradicional.'

      }

    ]

  }

];

// ============================================================================

// GENERADOR DE DATOS INICIALES POR CASO EMPRESARIAL

// ============================================================================

export const obtenerDatosPorterIniciales = (casoId) => {

  switch (casoId) {

    case 'cafe-tunari':

      return {

        fuerzas: {

          rivalidad: {

            nivel: '',

            puntos: 3,

            descripcion: 'Apertura de franquicia de Starbucks a 50 metros y presencia de cafeterías tradicionales compitiendo por trfico presencial.',

            criteriosActivos: {

              'riv-1': true,

              'riv-2': false,

              'riv-3': true,

              'riv-4': true

            },

            evidenciasVinculadas: ['idea-5'], // Apertura de Starbucks a 50m

            factoresManuales: [

              'Competencia directa de Starbucks con fuerte presupuesto de marketing',

              'Guerra de promociones matutinas en el eje céntrico'

            ]

          },

          entrantes: {

            nivel: '',

            puntos: 2,

            descripcion: 'Bajas barreras de inversión para módulos pequeños al paso, pero alta inversión para tueste artesanal propio.',

            criteriosActivos: {

              'ent-1': true,

              'ent-2': false,

              'ent-3': true,

              'ent-4': false

            },

            evidenciasVinculadas: [],

            factoresManuales: [

              'Baja inversión inicial requerida para carritos y módulos grab & go',

              'Escasez de locales con terrazas habilitadas en el centro'

            ]

          },

          clientes: {

            nivel: '',

            puntos: 3,

            descripcion: 'Costo de cambio nulo para el cliente que puede cruzar la calle, con alta sensibilidad a tiempos de atención y precio.',

            criteriosActivos: {

              'cli-1': true,

              'cli-2': true,

              'cli-3': false,

              'cli-4': false

            },

            evidenciasVinculadas: ['idea-3'], // Crecimiento consumo café especialidad

            factoresManuales: [

              'Costo de cambio cero: caminar 30 metros a otra opción',

              'Exigencia estricta de despacho rápido antes de las 9:00 AM'

            ]

          },

          proveedores: {

            nivel: '',

            puntos: 1,

            descripcion: 'Contrato de exclusividad firmado con productores orgánicos de Los Yungas, blindando el insumo estratégico.',

            criteriosActivos: {

              'pro-1': false,

              'pro-2': true,

              'pro-3': false,

              'pro-4': true

            },

            evidenciasVinculadas: ['idea-6'], // Costo de alquiler subirá 25%

            factoresManuales: [

              'Contrato de exclusividad con cooperativa cafetalera de altura',

              'Incremento del 25% en alquiler por presión inmobiliaria'

            ]

          },

          sustitutos: {

            nivel: '',

            puntos: 2,

            descripcion: 'Bebidas frías, energizantes, té de especialidad y máquinas de oficina que compiten por el gasto matutino.',

            criteriosActivos: {

              'sus-1': true,

              'sus-2': false,

              'sus-3': true,

              'sus-4': false

            },

            evidenciasVinculadas: [],

            factoresManuales: [

              'Auge de té matcha, infusiones frías y bebidas energéticas',

              'Café soluble gratuito provisto en centros corporativos'

            ]

          }

        },

        estrategiaSugerida: 'Diferenciación de Especialidad: Apalancar el contrato de origen de Los Yungas y barismo certificado para contrarrestar la fuerza de marca global de Starbucks.'

      };

    case 'technova':

      return {

        fuerzas: {

          rivalidad: {

            nivel: '',

            puntos: 3,

            descripcion: 'Plataformas SaaS de mesa de ayuda con ofertas freemium agresivas y financiamiento de capital de riesgo.',

            criteriosActivos: { 'riv-1': true, 'riv-2': true, 'riv-3': true, 'riv-4': false },

            evidenciasVinculadas: [],

            factoresManuales: ['Ofertas freemium de competidores globales']

          },

          entrantes: {

            nivel: '',

            puntos: 3,

            descripcion: 'Facilidad de desplegar soluciones de atención automatizada usando APIs de IA generativa.',

            criteriosActivos: { 'ent-1': true, 'ent-2': false, 'ent-3': false, 'ent-4': false },

            evidenciasVinculadas: [],

            factoresManuales: ['Bajo capex requerido gracias a proveedores Cloud']

          },

          clientes: {

            nivel: '',

            puntos: 3,

            descripcion: 'Suscripciones mensuales sin permanencia donde el cliente cancela ante demoras de soporte (churn 18%).',

            criteriosActivos: { 'cli-1': true, 'cli-2': true, 'cli-3': false, 'cli-4': true },

            evidenciasVinculadas: [],

            factoresManuales: ['Alta tasa de abandono por fallas de estabilidad']

          },

          proveedores: {

            nivel: '',

            puntos: 3,

            descripcion: 'Dependencia crítica de proveedores Cloud (AWS) y APIs de IA con facturación en dólares.',

            criteriosActivos: { 'pro-1': true, 'pro-2': true, 'pro-3': true, 'pro-4': false },

            evidenciasVinculadas: [],

            factoresManuales: ['Tarifas por token y hosting en moneda extranjera']

          },

          sustitutos: {

            nivel: '',

            puntos: 2,

            descripcion: 'Canales directos de mensajera (WhatsApp Business) y buzones compartidos en Google Workspace.',

            criteriosActivos: { 'sus-1': true, 'sus-2': true, 'sus-3': false, 'sus-4': false },

            evidenciasVinculadas: [],

            factoresManuales: ['Uso informal de WhatsApp como canal de soporte']

          }

        },

        estrategiaSugerida: 'Estabilizacin Tecnológica y Excelencia en SLA: Eliminar caídas del servicio para blindar retención de clientes.'

      };

    default:

      return {

        fuerzas: {

          rivalidad: {

            nivel: '',

            puntos: 2,

            descripcion: 'Selecciona el nivel de presión y vincula los hallazgos de auditoría para evaluar esta fuerza.',

            criteriosActivos: { 'riv-1': false, 'riv-2': false, 'riv-3': false, 'riv-4': false },

            evidenciasVinculadas: [],

            factoresManuales: []

          },

          entrantes: {

            nivel: '',

            puntos: 2,

            descripcion: 'Selecciona el nivel de presión y vincula los hallazgos de auditoría para evaluar esta fuerza.',

            criteriosActivos: { 'ent-1': false, 'ent-2': false, 'ent-3': false, 'ent-4': false },

            evidenciasVinculadas: [],

            factoresManuales: []

          },

          clientes: {

            nivel: '',

            puntos: 2,

            descripcion: 'Selecciona el nivel de presión y vincula los hallazgos de auditoría para evaluar esta fuerza.',

            criteriosActivos: { 'cli-1': false, 'cli-2': false, 'cli-3': false, 'cli-4': false },

            evidenciasVinculadas: [],

            factoresManuales: []

          },

          proveedores: {

            nivel: '',

            puntos: 2,

            descripcion: 'Selecciona el nivel de presión y vincula los hallazgos de auditoría para evaluar esta fuerza.',

            criteriosActivos: { 'pro-1': false, 'pro-2': false, 'pro-3': false, 'pro-4': false },

            evidenciasVinculadas: [],

            factoresManuales: []

          },

          sustitutos: {

            nivel: '',

            puntos: 2,

            descripcion: 'Selecciona el nivel de presión y vincula los hallazgos de auditoría para evaluar esta fuerza.',

            criteriosActivos: { 'sus-1': false, 'sus-2': false, 'sus-3': false, 'sus-4': false },

            evidenciasVinculadas: [],

            factoresManuales: []

          }

        },

        estrategiaSugerida: 'Diferenciación y Control de Costos: Calibrar la propuesta de valor para sostener el margen operativo.'

      };

  }

};

// ============================================================================

// CONVERSOR / EXPORTADOR AUTOMÁTICO DE PORTER A FACTORES DEL DIAGRAMA POAM

// ============================================================================
