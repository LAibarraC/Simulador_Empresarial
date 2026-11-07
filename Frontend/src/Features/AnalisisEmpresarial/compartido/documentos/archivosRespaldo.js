/**
 * documentosRespaldo.js — utilidades compartidas para adjuntar documentación de respaldo.
 * Los metadatos viven con los datos de cada herramienta; el contenido binario se guarda
 * en IndexedDB (avhDocumentosStore) porque localStorage no admite archivos grandes.
 */
import { blobADataUrl, eliminarArchivo, guardarArchivo, leerArchivo } from './almacenArchivos';

export const DOCUMENTOS_MAX_BYTES = 15 * 1024 * 1024;
export const DOCUMENTOS_MAX = 20;
export const DOCUMENTOS_ACEPTADOS = '.pdf,.png,.jpg,.jpeg,.gif,.webp,.svg,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt';

export function tipoDocumento(nombre = '', mime = '') {
  const ext = nombre.split('.').pop().toLowerCase();
  if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'imagen';
  if (ext === 'pdf' || mime === 'application/pdf') return 'pdf';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'hoja';
  if (['doc', 'docx', 'txt'].includes(ext)) return 'texto';
  if (['ppt', 'pptx'].includes(ext)) return 'presentacion';
  return 'otro';
}

export function formatearTamano(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const crearIdDocumento = () => `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/**
 * Valida y guarda archivos. Devuelve los metadatos nuevos y los avisos para el usuario.
 * No modifica la lista actual: quien llama decide cómo guardarla.
 */
export async function guardarDocumentos(archivos, cantidadActual = 0) {
  const lista = Array.from(archivos || []);
  const avisos = [];
  const disponibles = DOCUMENTOS_MAX - cantidadActual;
  if (disponibles <= 0) return { nuevos: [], avisos: [['Límite alcanzado', `Puedes adjuntar hasta ${DOCUMENTOS_MAX} documentos.`]] };
  const grandes = lista.filter(a => a.size > DOCUMENTOS_MAX_BYTES);
  if (grandes.length) avisos.push(['Archivo demasiado grande', `${grandes.map(a => a.name).join(', ')} supera ${formatearTamano(DOCUMENTOS_MAX_BYTES)}.`]);
  const nuevos = [];
  for (const archivo of lista.filter(a => a.size > 0 && a.size <= DOCUMENTOS_MAX_BYTES).slice(0, disponibles)) {
    const id = crearIdDocumento();
    try {
      await guardarArchivo(id, archivo);
      nuevos.push({ id, nombre: archivo.name, mime: archivo.type, tamano: archivo.size, fecha: new Date().toISOString(), descripcion: '' });
    } catch (error) {
      console.error('No se pudo guardar el documento:', error);
      avisos.push(['No se pudo guardar', archivo.name]);
    }
  }
  return { nuevos, avisos };
}

export const borrarDocumento = id => eliminarArchivo(id).catch(error => console.error('No se pudo borrar el archivo local:', error));

/** Imágenes adjuntas convertidas a data URL para incluirlas como anexo en un PDF (se omiten SVG). */
export async function cargarImagenesAnexo(documentos = []) {
  const imagenes = documentos.filter(doc => tipoDocumento(doc.nombre, doc.mime) === 'imagen' && !/svg/i.test(doc.mime));
  const resultado = await Promise.all(imagenes.map(async doc => {
    try { const blob = await leerArchivo(doc.id); return blob ? { ...doc, src: await blobADataUrl(blob) } : null; } catch { return null; }
  }));
  return resultado.filter(Boolean);
}
