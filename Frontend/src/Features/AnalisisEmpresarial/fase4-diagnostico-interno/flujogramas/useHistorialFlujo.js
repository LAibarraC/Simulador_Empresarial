import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_HISTORIAL = 50;
const AGRUPAR_MS = 800;
const sinCambios = (a, b) => a === b || (a.length === 0 && b.length === 0);

/**
 * Deshacer / rehacer de una lista de registros. Los cambios seguidos (p. ej. al escribir) se agrupan en un solo paso.
 * `restaurar(filas)` debe reemplazar las filas guardadas por las recibidas.
 */
export default function useHistorialFlujo(filas, restaurar) {
  const estado = useRef({ pasado: [], futuro: [], ultimo: filas, reciente: false, temporizador: null, restaurando: false });
  const [, actualizarVista] = useState(0);

  useEffect(() => {
    const h = estado.current;
    if (sinCambios(filas, h.ultimo)) return;
    if (h.restaurando) { h.restaurando = false; h.ultimo = filas; return; }
    if (!h.reciente) { h.pasado.push(h.ultimo); if (h.pasado.length > MAX_HISTORIAL) h.pasado.shift(); }
    h.reciente = true;
    clearTimeout(h.temporizador);
    h.temporizador = setTimeout(() => { h.reciente = false; }, AGRUPAR_MS);
    h.futuro = [];
    h.ultimo = filas;
    actualizarVista(n => n + 1);
  }, [filas]);

  useEffect(() => () => clearTimeout(estado.current.temporizador), []);

  const ir = useCallback((origen, destino) => {
    const h = estado.current;
    const anterior = h[origen].pop();
    if (!anterior) return;
    h[destino].push(h.ultimo);
    h.restaurando = true;
    h.reciente = false;
    restaurar(anterior);
    actualizarVista(n => n + 1);
  }, [restaurar]);

  return {
    puedeDeshacer: estado.current.pasado.length > 0,
    puedeRehacer: estado.current.futuro.length > 0,
    deshacer: useCallback(() => ir('pasado', 'futuro'), [ir]),
    rehacer: useCallback(() => ir('futuro', 'pasado'), [ir])
  };
}
