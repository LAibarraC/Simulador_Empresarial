import { exportarBloquesPdf, nombreArchivoSeguro } from '../../compartido/pdf/exportarPdfPorBloques';

/** Exporta el reporte del análisis vertical y horizontal en A4 vertical paginado por bloques. */
export const exportarReportePdf = (nodo, nombreCaso = 'Caso') => exportarBloquesPdf(nodo, {
  archivo: `Analisis_Vertical_Horizontal_${nombreArchivoSeguro(nombreCaso)}.pdf`,
  pie: 'Análisis vertical y horizontal · Análisis Empresarial'
});
