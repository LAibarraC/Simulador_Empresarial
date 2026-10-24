import React, { useEffect, useMemo, useRef, useState } from 'react';
import StatLabel from '../../ui/StatLabel';

const FILAS_EXTRA_VIRTUALES = 4;
const ALTURA_FILA_EM = 1.4;

function textoDeCelda(celda) {
    if (typeof celda === 'string') return celda;
    return String(celda?.texto ?? celda?.formula ?? '');
}

function LlaveMuestral({ lado, filas }) {
    const reflejar = lado === 'derecho';
    const cantidadFilas = Math.max(1, filas);

    return (
        <svg
            className="mat251-experimentos-matriz-llave"
            style={{ height: `${cantidadFilas * 1.4 + (cantidadFilas - 1) * 0.44}em` }}
            viewBox="0 0 32 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
        >
            <path
                d="M30 1 C17 1 16 8 16 23 C16 39 12 46 2 50 C12 54 16 61 16 77 C16 92 17 99 30 99"
                transform={reflejar ? 'translate(32 0) scale(-1 1)' : undefined}
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}

function EspacioMuestralMatriz({ celdas, columnas }) {
    const matrizRef = useRef(null);
    const celdasRef = useRef(null);
    const [rangoFilas, setRangoFilas] = useState({ inicio: 0, fin: 24 });
    const cantidadFilas = celdas.length;

    const textosMaximosPorColumna = useMemo(() => {
        const maximos = Array.from({ length: columnas }, () => '');
        celdas.forEach(fila => fila.forEach((celda, columna) => {
            const texto = textoDeCelda(celda);
            if (texto.length > (maximos[columna]?.length ?? 0)) maximos[columna] = texto;
        }));
        return maximos;
    }, [celdas, columnas]);

    useEffect(() => {
        const matriz = matrizRef.current;
        const desplazable = matriz?.closest('.mat251-experimentos-formula-universo');
        if (!matriz || !desplazable || !cantidadFilas) return undefined;

        let marcoPendiente = 0;
        const actualizarRango = () => {
            if (marcoPendiente) window.cancelAnimationFrame(marcoPendiente);
            marcoPendiente = window.requestAnimationFrame(() => {
                const grid = celdasRef.current;
                if (!grid) return;

                const estilo = window.getComputedStyle(grid);
                const tamanoFuente = Number.parseFloat(estilo.fontSize) || 13;
                const espacioFilas = Number.parseFloat(estilo.rowGap) || 6;
                const pasoFila = tamanoFuente * ALTURA_FILA_EM + espacioFilas;
                const rectMatriz = grid.getBoundingClientRect();
                const rectDesplazable = desplazable.getBoundingClientRect();
                const inicioContenido = rectMatriz.top - rectDesplazable.top + desplazable.scrollTop - desplazable.clientTop;
                const filaSuperior = Math.max(0, desplazable.scrollTop - inicioContenido);
                const filasVisibles = Math.ceil(desplazable.clientHeight / pasoFila) + FILAS_EXTRA_VIRTUALES * 2;
                const maximoInicio = Math.max(0, cantidadFilas - filasVisibles);
                const inicio = Math.min(
                    maximoInicio,
                    Math.max(0, Math.floor(filaSuperior / pasoFila) - FILAS_EXTRA_VIRTUALES)
                );
                const fin = Math.min(cantidadFilas, inicio + filasVisibles);

                setRangoFilas(anterior => anterior.inicio === inicio && anterior.fin === fin
                    ? anterior
                    : { inicio, fin });
            });
        };

        desplazable.addEventListener('scroll', actualizarRango, { passive: true });
        window.addEventListener('resize', actualizarRango);
        const observador = typeof ResizeObserver !== 'undefined'
            ? new ResizeObserver(actualizarRango)
            : null;
        observador?.observe(desplazable);
        actualizarRango();

        return () => {
            if (marcoPendiente) window.cancelAnimationFrame(marcoPendiente);
            desplazable.removeEventListener('scroll', actualizarRango);
            window.removeEventListener('resize', actualizarRango);
            observador?.disconnect();
        };
    }, [celdas, cantidadFilas, columnas]);

    const filasVisibles = [];
    for (let fila = rangoFilas.inicio; fila < Math.min(rangoFilas.fin, cantidadFilas); fila += 1) {
        for (let columna = 0; columna < Math.min(columnas, celdas[fila]?.length ?? 0); columna += 1) {
            filasVisibles.push({ fila, columna, celda: celdas[fila][columna] });
        }
    }

    return (
        <div className="mat251-experimentos-matriz-universo" ref={matrizRef}>
            <StatLabel
                formulaKey="Omega"
                formulaLatex={'\\Omega'}
                align="center"
                position="top"
                className="mat251-experimentos-omega-label"
            />
            <span className="mat251-experimentos-matriz-igual" aria-hidden="true">=</span>
            {celdas.length && columnas ? (
                <>
                    <LlaveMuestral lado="izquierdo" filas={celdas.length} />
                    <div
                        className="mat251-experimentos-matriz-celdas"
                        ref={celdasRef}
                        role="math"
                        aria-label="Resultados del espacio muestral"
                        style={{
                            gridTemplateColumns: `repeat(${columnas}, max-content)`,
                            gridTemplateRows: `repeat(${cantidadFilas}, ${ALTURA_FILA_EM}em)`
                        }}
                    >
                        {textosMaximosPorColumna.map((texto, columna) => (
                            <span
                                key={`medida-${columna}`}
                                className="mat251-experimentos-matriz-celda-medida"
                                style={{ gridColumn: columna + 1, gridRow: 1 }}
                                aria-hidden="true"
                            >
                                {texto}
                            </span>
                        ))}
                        {filasVisibles.map(({ celda, fila, columna }) => (
                            <span
                                key={`${fila}-${columna}`}
                                className={celda?.resaltada ? 'mat251-experimentos-matriz-celda-favorable' : undefined}
                                style={{ gridColumn: columna + 1, gridRow: fila + 1 }}
                            >
                                {textoDeCelda(celda)}
                            </span>
                        ))}
                    </div>
                    <LlaveMuestral lado="derecho" filas={celdas.length} />
                </>
            ) : null}
        </div>
    );
}

export default React.memo(EspacioMuestralMatriz);
