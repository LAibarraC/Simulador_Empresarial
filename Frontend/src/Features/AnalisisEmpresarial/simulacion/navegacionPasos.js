import { createContext } from 'react';

/**
 * Navegación entre los pasos de la simulación (contexto → fases 2 a 6), calculada por el contenedor
 * según las herramientas que el caso habilita. Valor: { anterior, siguiente } con { texto, onClick } o null.
 */
export const NavegacionPasos = createContext(null);
