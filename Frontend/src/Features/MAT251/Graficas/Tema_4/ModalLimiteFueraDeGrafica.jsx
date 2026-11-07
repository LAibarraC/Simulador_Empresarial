import React, { useEffect, useMemo, useState } from 'react';
import ModalAlerta from '../../ui/ModalAlerta';

export default function ModalLimiteFueraDeGrafica({ limites, datos, condicion }) {
    const [isOpen, setIsOpen] = useState(false);
    const valores = useMemo(
        () => (limites || []).map(Number).filter(Number.isFinite),
        [limites]
    );
    const min = datos?.length ? Math.min(...datos.map(p => p.x)) : NaN;
    const max = datos?.length ? Math.max(...datos.map(p => p.x)) : NaN;
    const fueraDeRango = Number.isFinite(min) && Number.isFinite(max)
        && valores.some(valor => valor < min || valor > max);

    useEffect(() => {
        setIsOpen(fueraDeRango);
    }, [fueraDeRango, valores.join('|')]);

    if (!fueraDeRango) return null;

    const condicionTexto = condicion === 'mayor_que'
        ? 'La región solicitada está a la derecha del límite.'
        : condicion === 'menor_que'
            ? 'La región solicitada está a la izquierda del límite.'
            : 'Uno o ambos límites del intervalo quedan fuera de la curva visible.';

    return (
        <ModalAlerta
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            titulo="Límite fuera del rango de la gráfica"
            mensaje={`${condicionTexto} La curva se mantiene en su rango para que siga siendo legible; por eso no se ve el sombreado en esa zona. El cálculo de probabilidad sí considera el valor ingresado.`}
            tipo="warning"
        />
    );
}
