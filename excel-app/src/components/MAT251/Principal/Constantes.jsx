export const FONT = 'system-ui, -apple-system, sans-serif';
export const FS = { xs: '0.75rem', sm: '0.85rem', base: '0.95rem', md: '1rem', lg: '1.1rem' };
export const RADIUS = '5px';

export const OPERACIONES = [
  {
    grupo: 'Tema 1: Probabilidad y Conteo',
    opciones: [
      { value: 'conteo', label: 'Técnicas de Conteo (nPr / nCr)' },
      { value: 'probabilidad', label: 'Cálculo de Probabilidad' },
      { value: 'simulador_total', label: 'Teorema Probabilidad Total' },
      { value: 'regla_adicion', label: 'Axiomas y Propiedades (Adición)' },
      { value: 'regla_multiplicacion', label: 'Regla de la Multiplicación (Sucesivos)' },
      { value: 'muestreo', label: 'Introducción al Muestreo' },
      { value: 'dist_uniforme', label: 'Distribución Uniforme Continua' },
    ],
  },
];

export const filaVacia = (id) => ({ id, valor: '', origen: 'agregado' });

export const cardStyle = { padding: '10px', border: '1px solid var(--border-color)', borderRadius: RADIUS, backgroundColor: 'var(--bg-card)', fontFamily: FONT };
export const labelStyle = { fontSize: FS.sm, fontWeight: 600, fontFamily: FONT, display: 'block', marginBottom: '4px', color: 'var(--primary-color)' };
export const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
export const modalBoxStyle = { background: 'var(--bg-card)', borderRadius: RADIUS, padding: '24px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', fontFamily: FONT };