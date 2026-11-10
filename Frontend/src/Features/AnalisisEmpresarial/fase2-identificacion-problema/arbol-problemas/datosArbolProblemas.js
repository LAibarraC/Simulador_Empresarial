// =========================================================================
// MODELO DE DATOS Y GENERADOR PARA EL ÁRBOL DE PROBLEMAS (METODOLOGÍA MARCO LÓGICO)
// =========================================================================


/**
 * Obtiene el estado inicial del Árbol de Problemas para un caso dado.
 * REGLA FUNDAMENTAL: El árbol siempre empieza LIMPIO desde cero sin ningún factor
 * ni elemento en su interior (problemaCentral vacío, causas: [] y efectos: []),
 * permitiendo que el usuario arrastre libremente los factores desde el menú lateral
 * o formule el Problema Central haciendo clic en Editar.
 */
export function obtenerDatosArbolIniciales(casoId) {
  return {
    problemaCentral: {
      id: `pc-${casoId || 'personalizado'}`,
      titulo: '',
      descripcion: '',
      categoria: '',
      origen: '',
      idIdeaOrigen: null
    },
    efectos: [],
    causas: []
  };
}
