/** Arma la bandeja de la Matriz FODA a partir de la lluvia de ideas y de los factores externos (POAM). */

// =========================================================================
// CONTRATO TÉCNICO: SINCRONIZACIÓN Y TRAZABILIDAD DESDE PASOS PREVIOS
// =========================================================================
export function sincronizarDesdePasosPrevios(ideasLluvia = [], factoresPOAM = [], opciones = {}) {
  const autoPoblar = opciones.autoPoblar !== undefined ? opciones.autoPoblar : false;

  // 1. Filtrar hechos internos desde la Lluvia de Ideas
  const esInterna = (i) => {
    const amb = (i.ambito || i.tipoAmbito || '').toString().toUpperCase();
    return amb === 'INTERNO' || amb.includes('INTERN');
  };

  const esDebilidad = (i) => {
    const imp = (i.impactoNatural || i.cuadranteCorrecto || i.tipo || '').toString().toUpperCase();
    const txt = (i.texto || '').toLowerCase();
    return imp === 'DEBILIDAD' || imp === 'DEBILIDADES' || txt.includes('falla');
  };

  const internas = (ideasLluvia || []).filter(esInterna);

  // Fortalezas (F)
  const fortalezas = internas
    .filter(i => !esDebilidad(i))
    .map((item, idx) => ({
      id: item.id || `f-${idx + 1}`,
      codigo: `F${idx + 1}`,
      fuente: item.fuente || 'Lluvia de Ideas (Interno)',
      texto: item.texto,
      categoria: item.categoria || 'Capacidades Internas',
      tipoAmbito: 'Interno',
      cuadranteCorrecto: 'Fortalezas',
      cuadranteActual: autoPoblar ? 'Fortalezas' : null,
      origen: 'Lluvia de Ideas (Interno)',
      tagOrigen: 'Lluvia de Ideas (Interno)',
      origenPaso: 'Paso 1: Lluvia de Ideas'
    }));

  // Debilidades (D)
  const debilidades = internas
    .filter(i => esDebilidad(i))
    .map((item, idx) => ({
      id: item.id || `d-${idx + 1}`,
      codigo: `D${idx + 1}`,
      fuente: item.fuente || 'Lluvia de Ideas (Interno)',
      texto: item.texto,
      categoria: item.categoria || 'Operaciones',
      tipoAmbito: 'Interno',
      cuadranteCorrecto: 'Debilidades',
      cuadranteActual: autoPoblar ? 'Debilidades' : null,
      origen: 'Lluvia de Ideas (Interno)',
      tagOrigen: 'Lluvia de Ideas (Interno)',
      origenPaso: 'Paso 1: Lluvia de Ideas'
    }));

  // 2. Extraer Oportunidades y Amenazas consolidadas del POAM (única y exclusivamente del POAM, sin duplicar con Porter)
  const esOportunidad = (f) => {
    const t = (f.tipo || '').toString().toUpperCase();
    return t === 'OPORTUNIDAD' || t === 'OPORTUNIDADES';
  };

  const determinarProcedencia = (f) => {
    if (f.procedencia) {
      return f.procedencia.toUpperCase() === 'PORTER' ? 'PORTER' : 'PEST';
    }
    if (
      f.origenPorter ||
      f.fuerzaId ||
      (f.categoria && f.categoria.toLowerCase().includes('competit')) ||
      (f.fuente && f.fuente.toLowerCase().includes('porter')) ||
      (f.id && f.id.toString().includes('porter'))
    ) {
      return 'PORTER';
    }
    return 'PEST';
  };

  const listaPoam = (factoresPOAM || []);

  const puntosImpacto = (imp) => {
    const v = (imp || '').toString().toLowerCase();
    if (v === 'alto') return 3;
    if (v === 'medio') return 2;
    return 1;
  };

  const oportunidades = listaPoam
    .filter(f => esOportunidad(f))
    .map((item, idx) => {
      const proc = determinarProcedencia(item);
      return {
        id: item.id || `o-${idx + 1}`,
        codigo: `O${idx + 1}`,
        fuente: item.fuente || (proc === 'PORTER' ? '5 Fuerzas de Porter' : `POAM: ${item.categoria || item.dimension}`),
        texto: item.factor || item.titulo,
        categoria: item.categoria || item.dimension || 'Entorno',
        tipoAmbito: 'Externo',
        cuadranteCorrecto: 'Oportunidades',
        cuadranteActual: autoPoblar ? 'Oportunidades' : null,
        impacto: item.impacto || item.calificacion || 'Alto',
        procedencia: proc,
        origenPorter: proc === 'PORTER',
        origenPoam: true,
        origen: 'POAM (Externo)',
        tagOrigen: 'POAM (Externo)',
        origenPaso: 'Paso 3: Matriz POAM',
        // Trazabilidad POAM completa
        dimensionPoam: item.categoria || item.dimension || '',
        subdivisionPoam: item.subdivision || '',
        subdivision: item.subdivision || '',
        polaridad: 'Oportunidad',
        anilloImpacto: item.calificacion || '',
        puntosImpacto: puntosImpacto(item.calificacion),
        calificacionPoam: item.calificacion || '',
        justificacion: item.justificacion || '',
        nombreFuerza: item.nombreFuerza || '',
        nivelFuerza: item.nivelFuerza || ''
      };
    });

  const amenazas = listaPoam
    .filter(f => !esOportunidad(f))
    .map((item, idx) => {
      const proc = determinarProcedencia(item);
      return {
        id: item.id || `a-${idx + 1}`,
        codigo: `A${idx + 1}`,
        fuente: item.fuente || (proc === 'PORTER' ? '5 Fuerzas de Porter' : `POAM: ${item.categoria || item.dimension}`),
        texto: item.factor || item.titulo,
        categoria: item.dimension || item.categoria || 'Entorno',
        tipoAmbito: 'Externo',
        cuadranteCorrecto: 'Amenazas',
        cuadranteActual: autoPoblar ? 'Amenazas' : null,
        impacto: item.impacto || item.calificacion || 'Alto',
        procedencia: proc,
        origenPorter: proc === 'PORTER',
        origenPoam: true,
        origen: 'POAM (Externo)',
        tagOrigen: 'POAM (Externo)',
        origenPaso: 'Paso 3: Matriz POAM',
        // Trazabilidad POAM completa
        dimensionPoam: item.categoria || item.dimension || '',
        subdivisionPoam: item.subdivision || '',
        subdivision: item.subdivision || '',
        polaridad: 'Amenaza',
        anilloImpacto: item.calificacion || '',
        puntosImpacto: puntosImpacto(item.calificacion),
        calificacionPoam: item.calificacion || '',
        justificacion: item.justificacion || '',
        nombreFuerza: item.nombreFuerza || '',
        nivelFuerza: item.nivelFuerza || ''
      };
    });

  return {
    fortalezas,
    debilidades,
    oportunidades,
    amenazas,
    todos: [...oportunidades, ...amenazas]
  };
}
