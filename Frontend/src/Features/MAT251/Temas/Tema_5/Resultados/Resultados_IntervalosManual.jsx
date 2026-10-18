import React from 'react';
import Resultados_IntervalosMatriz from './Resultados_IntervalosMatriz';

export default function Resultados_IntervalosManual({ resultados, parametro }) {
    if (!resultados) return null;

    const estimacion = parametro === 'media'
        ? resultados.x_bar
        : parametro === 'proporcion'
            ? resultados.p_hat
            : resultados.puntual?.estimacion ?? resultados.s2;

    if (!Number.isFinite(Number(estimacion))) return null;

    const resultadosConEstimacion = {
        ...resultados,
        puntual: {
            ...resultados.puntual,
            estimacion: Number(estimacion)
        }
    };

    return <Resultados_IntervalosMatriz resultados={resultadosConEstimacion} parametro={parametro} />;
}
