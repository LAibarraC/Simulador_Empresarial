import { createContext } from 'react';

/** Conclusión y documentación de respaldo de las herramientas que no guardan las suyas: { leer(id), actualizar(id, fn) }. */
export const RespaldoHerramientas = createContext(null);

export const RESPALDO_VACIO = { conclusiones: '', documentos: [] };

const plantilla = lineas => lineas.join('\n\n');

/** Textos de la sección «Conclusión y propuesta de mejora» + «Documentación de respaldo» de cada herramienta. */
export const CONFIG_RESPALDO = {
  lluvia: {
    placeholder: '¿Qué hechos son los más relevantes y por qué los seleccionaste para el diagnóstico?',
    ayuda: 'Adjunta las fuentes que respaldan tus hechos: informes, entrevistas, fotos o datos del caso.',
    plantilla: plantilla([
      'Hechos internos clave: ¿cuáles controla la empresa y cuáles la afectan más?',
      'Hechos externos clave: ¿qué cambios del entorno alteran la situación?',
      'Criterio de selección: ¿por qué estos hechos y no otros?',
      'Siguiente paso: ¿qué problema central sugieren?'
    ])
  },
  arbol: {
    placeholder: '¿Cuál es el problema central, sus causas raíz y sus efectos más graves?',
    ayuda: 'Adjunta evidencias del problema: reportes, indicadores, fotos o testimonios que respalden tus causas y efectos.',
    plantilla: plantilla([
      'Problema central: ¿qué ocurre y a quién afecta?',
      'Causas raíz: ¿cuáles explican el problema y cuáles son controlables?',
      'Efectos: ¿qué consecuencias tiene para el negocio?',
      'Prioridad: ¿qué causa atacarías primero y por qué?'
    ])
  },
  pestel: {
    placeholder: '¿Qué factores del macroentorno son oportunidades o amenazas y cuáles llevarás al POAM?',
    ayuda: 'Adjunta informes sectoriales, noticias, estadísticas o normativas que respalden tus factores del macroentorno.',
    plantilla: plantilla([
      'Factores más influyentes: ¿qué dimensiones PESTEL pesan más en el sector?',
      'Oportunidades a aprovechar: ¿cuáles y cómo?',
      'Amenazas a mitigar: ¿cuáles y con qué acción?',
      'Vínculo con POAM: ¿qué factores pasarán al perfil de oportunidades y amenazas?'
    ])
  },
  porter: {
    placeholder: '¿Qué tan atractiva es la industria y qué fuerza amenaza más a la empresa?',
    ayuda: 'Adjunta estudios de mercado, datos de competidores, proveedores o clientes que respalden tu análisis de las fuerzas.',
    plantilla: plantilla([
      'Fuerza dominante: ¿cuál presiona más a la industria y por qué?',
      'Barreras y poder de negociación: ¿qué tan protegida está la empresa?',
      'Rivalidad y sustitutos: ¿qué tan intensa es la competencia?',
      'Atractivo del sector: ¿conviene competir aquí y con qué estrategia?'
    ])
  },
  mpc: {
    placeholder: '¿La empresa lidera o va rezagada frente a sus competidores y en qué factores?',
    ayuda: 'Adjunta comparativos, precios, reseñas o informes de competidores que respalden tus calificaciones.',
    plantilla: plantilla([
      'Posición competitiva: ¿dónde está la empresa frente a sus rivales?',
      'Ventajas: ¿en qué factores críticos de éxito supera a los demás?',
      'Brechas: ¿en cuáles está por debajo y qué acción se propone?',
      'Rival a vigilar: ¿quién es el competidor más fuerte y por qué?'
    ])
  },
  poam: {
    placeholder: '¿El entorno favorece o amenaza a la empresa y qué factores llevarás a la FODA?',
    ayuda: 'Adjunta informes, estudios o noticias que respalden el impacto de las oportunidades y amenazas que ubicaste en el radar.',
    plantilla: plantilla([
      'Oportunidades prioritarias: ¿cuáles tienen mayor impacto y cómo se aprovecharán?',
      'Amenazas críticas: ¿cuáles requieren respuesta urgente?',
      'Balance del entorno: ¿predominan las oportunidades o las amenazas?',
      'Vínculo con FODA: ¿qué factores externos llevarás a la matriz?'
    ])
  },
  foda: {
    placeholder: '¿Cuál es la situación estratégica global de la empresa y hacia dónde apuntan las estrategias?',
    ayuda: 'Adjunta los informes, estados financieros o estudios que respalden la clasificación de tus factores en la matriz.',
    plantilla: plantilla([
      'Fortalezas y debilidades clave: ¿qué factores internos definen la situación?',
      'Oportunidades y amenazas clave: ¿qué factores externos son decisivos?',
      'Postura general: ¿ofensiva, defensiva, de reorientación o de supervivencia?',
      'Vínculo con DAFO: ¿qué combinaciones darán lugar a estrategias?'
    ])
  }
};
