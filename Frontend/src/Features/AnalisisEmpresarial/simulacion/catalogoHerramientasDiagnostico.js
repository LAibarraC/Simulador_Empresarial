/** Catálogo de las herramientas del diagnóstico externo (Fase 3) y la Matriz FODA: nombre, sigla, icono y ayuda. */
import { ICONOS_HERRAMIENTAS } from './iconosHerramientas';

// Catálogo maestro de herramientas disponibles para el Diagnóstico Empresarial
export const LISTA_HERRAMIENTAS_DIAGNOSTICO = [
  {
    id: 'pestel',
    nombre: 'Análisis PESTEL',
    sigla: 'PESTEL',
    foco: 'Macroentorno Estratégico',
    fase: 3,
    icon: ICONOS_HERRAMIENTAS.pestel,
    color: '#3b82f6',
    tooltip: 'Examina las 6 dimensiones del macroentorno (Político, Económico, Social, Tecnológico, Ecológico y Legal) para descubrir oportunidades y amenazas que impactan el negocio.'
  },
  {
    id: 'porter',
    nombre: '5 Fuerzas de Porter',
    sigla: 'Porter',
    foco: 'Microentorno Competitivo',
    fase: 3,
    icon: ICONOS_HERRAMIENTAS.porter,
    color: '#8b5cf6',
    tooltip: 'Evalúa la rivalidad entre competidores, la amenaza de nuevos entrantes, sustitutos y el poder de negociación de clientes y proveedores para calibrar el atractivo del sector.'
  },
  {
    id: 'mpc',
    nombre: 'Matriz Perfil Competitivo',
    sigla: 'MPC',
    foco: 'Benchmarking & Competidores',
    fase: 3,
    icon: ICONOS_HERRAMIENTAS.mpc,
    color: '#06b6d4',
    tooltip: 'Pondera los Factores Críticos de Éxito (FCE) de la industria, califica a Nuestra Empresa frente a los competidores líderes y analiza el grado competitivo en el radar.'
  },
  {
    id: 'poam',
    nombre: 'Matriz POAM',
    sigla: 'POAM',
    foco: 'Oportunidades & Amenazas',
    fase: 3,
    icon: ICONOS_HERRAMIENTAS.poam,
    color: '#f59e0b',
    tooltip: 'Evalúa el medio ambiente externo en sus dimensiones metodológicas y califica el impacto de oportunidades y amenazas antes de consolidar el FODA.'
  },
  {
    id: 'foda',
    nombre: 'Matriz FODA',
    sigla: 'FODA',
    foco: 'Diagnóstico Situacional Cruzado',
    fase: 5,
    icon: ICONOS_HERRAMIENTAS.foda,
    color: '#10b981',
    tooltip: 'Cruza las fortalezas y debilidades internas con las oportunidades y amenazas del entorno para derivar estrategias competitivas.'
  }
];
