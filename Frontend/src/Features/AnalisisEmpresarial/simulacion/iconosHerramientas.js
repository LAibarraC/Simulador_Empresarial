import { BarChart3, Building2, ClipboardList, Compass, Globe, Grid2x2, Lightbulb, Radar, Rocket, Route, Share2, ShieldCheck, Sliders, Swords, Target, TreeDeciduous, Warehouse, Workflow } from 'lucide-react';

/**
 * Un solo icono por herramienta: se usa en el encabezado de cada herramienta, en los menús
 * de pasos (fases 2 a 6) y en el selector de herramientas del caso. Cambiarlo aquí lo cambia en todos lados.
 */
export const ICONOS_HERRAMIENTAS = {
  // Fase 2
  lluvia: Lightbulb,
  arbol: TreeDeciduous,
  // Fase 3
  pestel: Globe,
  porter: Swords,
  mpc: Compass,
  poam: Sliders,
  // Fase 4
  'interno-vertical-horizontal': BarChart3,
  'customer-journey': Route,
  flujogramas: Workflow,
  efi: ShieldCheck,
  'auditoria-redes': Share2,
  'evaluacion-360': Radar,
  inventarios: Warehouse,
  // Fase 5
  foda: ClipboardList,
  'resumen-problema': Target,
  'resumen-externo': Globe,
  'resumen-interno': Building2,
  // Fase 6
  dafo: Grid2x2,
  ansoff: Rocket
};
