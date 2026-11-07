/**
 * Utilidades para procesamiento, limpieza y estructuración del texto de contexto
 * en el módulo de Análisis Empresarial.
 */

/**
 * Limpia y reconstruye texto fragmentado (proveniente de PDFs, Word o portapapeles)
 * uniendo líneas rotas de una misma oración y preservando párrafos y viñetas reales.
 */
export function limpiarYReconstruirTexto(texto) {
  if (!texto || typeof texto !== 'string') return '';

  // 1. Normalizar saltos de línea y remover caracteres de control
  let res = texto.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  // eslint-disable-next-line no-control-regex -- se quitan a propósito los caracteres de control del texto pegado
  res = res.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');

  // 2. Eliminar pies de página y encabezados comunes de PDF
  res = res.replace(/(?:p[aá]gina|page)\s+\d+(?:\s*(?:de|of|\/)\s*\d+)?/gi, '');

  // 3. Corregir palabras divididas con guión al final de línea (ej: "estra- \ntégico" -> "estratégico")
  res = res.replace(/(\b[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)-\s*\n\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ]+\b)/g, '$1$2');

  // 4. Procesar bloques y reconstruir líneas en oraciones continuas
  const bloques = res.split(/\n\s*\n/);
  const parrafosLimpios = [];

  for (const bloque of bloques) {
    const lineas = bloque.split('\n').map(l => l.trim()).filter(Boolean);
    if (lineas.length === 0) continue;

    let parrafoAcumulado = [];
    for (const linea of lineas) {
      // Detectar viñetas o listas numeradas (•, -, *, 1., a))
      const esItemLista = /^(?:[•\-*–—]|\d+[.)]|[a-zA-Z][.)])\s+/.test(linea);

      if (esItemLista && parrafoAcumulado.length > 0) {
        const pTxt = parrafoAcumulado.join(' ').replace(/[ \t]+/g, ' ').trim();
        if (pTxt) parrafosLimpios.push(pTxt);
        parrafoAcumulado = [linea];
      } else {
        parrafoAcumulado.push(linea);
      }
    }

    if (parrafoAcumulado.length > 0) {
      const pTxt = parrafoAcumulado.join(' ').replace(/[ \t]+/g, ' ').trim();
      if (pTxt) parrafosLimpios.push(pTxt);
    }
  }

  return parrafosLimpios.join('\n\n');
}

/**
 * Divide el texto de contexto en una lista de párrafos bien estructurados para la Fase 1.
 */
export function obtenerParrafosContexto(texto) {
  if (!texto) return [];
  const limpio = limpiarYReconstruirTexto(texto);
  return limpio.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
}

/**
 * Plantilla general y estructurada para cualquier tipo de caso empresarial,
 * lista para que el docente o usuario la rellene fácilmente.
 */
export const PLANTILLA_CONTEXTO_CASO = `1. ANTECEDENTES Y PERFIL DE LA EMPRESA:
- Nombre de la empresa: [Nombre de la empresa o emprendimiento]
- Sector y actividad: [Rubro o industria: ej. Comercio, Servicios, Tecnología, Manufactura, etc.]
- Modelo de negocio y productos: [Qué productos o servicios ofrece y a qué clientes objetivo atiende]
- Trayectoria y presencia: [Años en el mercado, ubicación geográfica o alcance]

2. SITUACIÓN ACTUAL Y ENTORNO:
- Factores internos (Capacidades y recursos): [Menciona fortalezas del equipo, infraestructura, finanzas o limitaciones internas]
- Factores externos (Mercado y competencia): [Describe a los competidores, clientes, condiciones económicas o tendencias del entorno]

3. PROBLEMÁTICA CENTRAL Y RETO ESTRATÉGICO:
- Problema o desafío a resolver: [Describe el problema central o la decisión crítica que la empresa debe enfrentar]
- Objetivo del análisis: [Qué resultados se esperan alcanzar con el diagnóstico estratégico]`;
