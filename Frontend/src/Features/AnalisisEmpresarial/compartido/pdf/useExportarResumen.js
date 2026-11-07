import { useState } from 'react';
import { alerta } from '../../../../utils/Notificaciones';
import { exportarBloquesPdf, nombreArchivoSeguro } from './exportarPdfPorBloques';

/** Exporta el resumen visible (bloques data-pdf-block) forzando el tema claro durante la captura. */
export default function useExportarResumen({ ref, caso, nombreBase, pie }) {
  const [exportando, setExportando] = useState(false);
  const exportar = async () => {
    if (exportando || !ref.current) return;
    setExportando(true);
    ref.current.classList.add('r5-exportando');
    try {
      await new Promise(resolve => setTimeout(resolve, 120));
      await exportarBloquesPdf(ref.current, { archivo: `${nombreBase}_${nombreArchivoSeguro(caso?.titulo || caso?.nombre)}.pdf`, pie, orientacion: 'l', disposicion: 'filas' });
      alerta.exito('PDF descargado', 'Se exportó el resumen completo.');
    } catch (error) {
      console.error(`Error al exportar ${nombreBase}:`, error);
      alerta.error('Error al exportar', 'No se pudo generar el documento PDF.');
    } finally {
      ref.current?.classList.remove('r5-exportando');
      setExportando(false);
    }
  };
  return { exportando, exportar };
}

