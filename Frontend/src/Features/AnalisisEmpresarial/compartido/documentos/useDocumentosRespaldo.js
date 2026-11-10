/**
 * useDocumentosRespaldo.js — utilidades de interfaz compartidas por los paneles de documentación:
 * miniaturas de imágenes y apertura/descarga de archivos guardados en IndexedDB.
 */
import { useCallback, useEffect, useState } from 'react';
import { alerta } from '../../../../utils/Notificaciones';
import { leerArchivo } from './almacenArchivos';
import { borrarDocumento, guardarDocumentos, tipoDocumento } from './archivosRespaldo';

/** Carga miniaturas de las imágenes adjuntas y libera las URL al desmontar o cambiar. */
export function useMiniaturas(documentos) {
  const [miniaturas, setMiniaturas] = useState({});
  const claves = documentos.filter(doc => tipoDocumento(doc.nombre, doc.mime) === 'imagen').map(doc => doc.id).join('|');
  useEffect(() => {
    let activo = true;
    const urls = [];
    const ids = claves ? claves.split('|') : [];
    Promise.all(ids.map(async id => {
      try { const blob = await leerArchivo(id); if (!blob) return null; const url = URL.createObjectURL(blob); urls.push(url); return [id, url]; } catch { return null; }
    })).then(pares => { if (activo) setMiniaturas(Object.fromEntries(pares.filter(Boolean))); });
    return () => { activo = false; urls.forEach(url => URL.revokeObjectURL(url)); };
  }, [claves]);
  return miniaturas;
}

/** Abre el archivo en otra pestaña o lo descarga. */
export async function abrirDocumento(documento, descargar = false) {
  try {
    const blob = await leerArchivo(documento.id);
    if (!blob) { alerta.advertencia('Archivo no disponible', 'Este archivo se adjuntó desde otro navegador o equipo y no está guardado aquí.'); return; }
    const url = URL.createObjectURL(blob);
    if (descargar) {
      const enlace = document.createElement('a');
      enlace.href = url; enlace.download = documento.nombre; enlace.click();
    } else {
      window.open(url, '_blank', 'noopener');
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) {
    console.error('No se pudo abrir el documento:', error);
    alerta.error('No se pudo abrir', 'Ocurrió un error al leer el archivo guardado.');
  }
}

/**
 * Acciones de una lista de documentos adjuntos. `setDocumentos(transformar)` recibe una función
 * lista → lista y debe aplicarla sobre el estado de la herramienta (actualización funcional).
 */
export function useAccionesDocumentos(documentos, setDocumentos) {
  const cantidad = documentos.length;
  /** Guarda los archivos; `extra` se mezcla en los metadatos de cada uno (p. ej. { pasoId }). */
  const agregarDocumentos = useCallback(async (archivos, extra = {}) => {
    const { nuevos, avisos } = await guardarDocumentos(archivos, cantidad);
    avisos.forEach(([titulo, mensaje]) => alerta.advertencia(titulo, mensaje));
    if (!nuevos.length) return;
    setDocumentos(lista => [...lista, ...nuevos.map(documento => ({ ...documento, ...extra }))]);
    alerta.exito('Evidencia adjuntada', `${nuevos.length} archivo(s) guardado(s) como respaldo.`);
  }, [cantidad, setDocumentos]);
  const eliminarDocumento = useCallback(id => {
    setDocumentos(lista => lista.filter(item => item.id !== id));
    borrarDocumento(id);
  }, [setDocumentos]);
  const editarDocumento = useCallback((id, cambios) => setDocumentos(lista => lista.map(item => (item.id === id ? { ...item, ...cambios } : item))), [setDocumentos]);
  const describirDocumento = useCallback((id, descripcion) => editarDocumento(id, { descripcion }), [editarDocumento]);
  return { agregarDocumentos, eliminarDocumento, editarDocumento, describirDocumento };
}
