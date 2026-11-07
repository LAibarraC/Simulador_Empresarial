import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const MARGEN = 12;
const SEPARACION = 3;

export const nombreArchivoSeguro = texto => String(texto || 'Caso').replace(/[^\p{L}\p{N}_-]/gu, '_');

/**
 * Exporta un reporte a PDF A4. Cada nodo [data-pdf-block] se rasteriza por separado y pasa
 * a la página siguiente si no cabe, así ninguna tabla ni gráfico queda partido. Los bloques
 * más altos que una página se dividen en tramos. Añade pie con título y numeración.
 *
 * Nota: html2canvas 1.4 no interpreta color-mix(); los reportes deben usar colores fijos.
 */
/** Agrupa los bloques que comparten fila en pantalla (misma posición vertical). */
function agruparEnFilas(nodo, bloques) {
  const origen = nodo.getBoundingClientRect();
  const filas = [];
  bloques.forEach(bloque => {
    const r = bloque.getBoundingClientRect();
    const fila = filas.find(f => Math.abs(f.top - r.top) < 4);
    const item = { bloque, x: r.left - origen.left, ancho: r.width, alto: r.height };
    if (fila) fila.items.push(item); else filas.push({ top: r.top, items: [item] });
  });
  return { filas: filas.sort((a, b) => a.top - b.top), anchoNodo: origen.width };
}

/**
 * Modo «filas»: conserva la disposición de la pantalla (tarjetas lado a lado) usando
 * una escala común basada en el ancho del contenedor.
 */
async function exportarPorFilas(pdf, nodo, { anchoUtil, limite }) {
  const { filas, anchoNodo } = agruparEnFilas(nodo, Array.from(nodo.querySelectorAll('[data-pdf-block]')));
  const k = anchoUtil / (anchoNodo || 1);
  let y = MARGEN;
  for (const fila of filas) {
    const altoFila = Math.max(...fila.items.map(item => item.alto)) * k;
    if (y > MARGEN && y + Math.min(altoFila, limite - MARGEN) > limite) { pdf.addPage(); y = MARGEN; }
    for (const item of fila.items) {
      const canvas = await html2canvas(item.bloque, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
      if (!canvas.width || !canvas.height) continue;
      const ancho = item.ancho * k;
      const alto = item.alto * k;
      if (alto <= limite - MARGEN) {
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', MARGEN + item.x * k, y, ancho, alto, undefined, 'FAST');
      } else {
        // Tarjeta más alta que una página: se escala para que entre completa.
        const escala = (limite - y) / alto;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', MARGEN + item.x * k, y, ancho * escala, alto * escala, undefined, 'FAST');
      }
    }
    y += Math.min(altoFila, limite - y) + SEPARACION;
  }
}

export async function exportarBloquesPdf(nodo, { archivo, pie = '', orientacion = 'p', disposicion = 'bloques' } = {}) {
  const pdf = new jsPDF(orientacion, 'mm', 'a4');
  const anchoPagina = pdf.internal.pageSize.getWidth();
  const altoPagina = pdf.internal.pageSize.getHeight();
  const anchoUtil = anchoPagina - MARGEN * 2;
  const limite = altoPagina - MARGEN - 6;
  let y = MARGEN;

  const bloquesSueltos = disposicion === 'filas' ? [] : Array.from(nodo.querySelectorAll('[data-pdf-block]'));
  if (disposicion === 'filas') await exportarPorFilas(pdf, nodo, { anchoUtil, limite });

  for (const bloque of bloquesSueltos) {
    const canvas = await html2canvas(bloque, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
    if (!canvas.width || !canvas.height) continue;
    const mmPorPx = anchoUtil / canvas.width;
    const alto = canvas.height * mmPorPx;

    if (alto <= limite - MARGEN) {
      if (y + alto > limite) { pdf.addPage(); y = MARGEN; }
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', MARGEN, y, anchoUtil, alto, undefined, 'FAST');
      y += alto + SEPARACION;
      continue;
    }

    let origen = 0;
    while (origen < canvas.height) {
      if (y > MARGEN + 1 && limite - y < 40) { pdf.addPage(); y = MARGEN; }
      const tramoPx = Math.min(canvas.height - origen, Math.floor((limite - y) / mmPorPx));
      const tramo = document.createElement('canvas');
      tramo.width = canvas.width; tramo.height = tramoPx;
      tramo.getContext('2d').drawImage(canvas, 0, origen, canvas.width, tramoPx, 0, 0, canvas.width, tramoPx);
      pdf.addImage(tramo.toDataURL('image/png'), 'PNG', MARGEN, y, anchoUtil, tramoPx * mmPorPx, undefined, 'FAST');
      origen += tramoPx;
      y += tramoPx * mmPorPx + SEPARACION;
      if (origen < canvas.height) { pdf.addPage(); y = MARGEN; }
    }
  }

  const paginas = pdf.getNumberOfPages();
  for (let pagina = 1; pagina <= paginas; pagina += 1) {
    pdf.setPage(pagina);
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    if (pie) pdf.text(pie, MARGEN, altoPagina - 6);
    pdf.text(`Página ${pagina} de ${paginas}`, anchoPagina - MARGEN, altoPagina - 6, { align: 'right' });
  }
  pdf.save(archivo || 'Reporte.pdf');
}
