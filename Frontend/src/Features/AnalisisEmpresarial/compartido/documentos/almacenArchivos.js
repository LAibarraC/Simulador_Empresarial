/**
 * Almacén local (IndexedDB) de los archivos adjuntos del análisis vertical y horizontal.
 * Los metadatos viven con los datos de la herramienta; el contenido binario vive aquí,
 * porque localStorage no admite archivos grandes.
 */
const DB_NOMBRE = 'simulador-avh-documentos';
const DB_VERSION = 1;
const STORE = 'archivos';

let conexion = null;

function abrir() {
  if (conexion) return conexion;
  conexion = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('Este navegador no permite guardar archivos localmente.')); return; }
    const solicitud = indexedDB.open(DB_NOMBRE, DB_VERSION);
    solicitud.onupgradeneeded = () => solicitud.result.createObjectStore(STORE);
    solicitud.onsuccess = () => resolve(solicitud.result);
    solicitud.onerror = () => { conexion = null; reject(solicitud.error); };
  });
  return conexion;
}

async function operar(modo, accion) {
  const db = await abrir();
  return new Promise((resolve, reject) => {
    const transaccion = db.transaction(STORE, modo);
    const solicitud = accion(transaccion.objectStore(STORE));
    transaccion.oncomplete = () => resolve(solicitud?.result);
    transaccion.onerror = () => reject(transaccion.error);
    transaccion.onabort = () => reject(transaccion.error || new Error('Operación cancelada'));
  });
}

export const guardarArchivo = (id, blob) => operar('readwrite', store => store.put(blob, id));
export const leerArchivo = id => operar('readonly', store => store.get(id));
export const eliminarArchivo = id => operar('readwrite', store => store.delete(id));

export const blobADataUrl = blob => new Promise((resolve, reject) => {
  const lector = new FileReader();
  lector.onload = () => resolve(lector.result);
  lector.onerror = () => reject(lector.error);
  lector.readAsDataURL(blob);
});
