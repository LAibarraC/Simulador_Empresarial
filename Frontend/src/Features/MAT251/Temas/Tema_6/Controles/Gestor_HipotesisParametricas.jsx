import React, { useState, useEffect } from 'react';
import { FONT, RADIUS } from '../../../Principal/Constantes';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import '../../../styles/Temas/Tema5.css'; // Podemos reutilizar los estilos de Tema5
import '../../../styles/Temas/Tema6.css';

import Controles_HP_Manual from './Controles_HP_Manual';
import Controles_HP_Matriz from './Controles_HP_Matriz';
import Controles_HP_Simulacion from './Controles_HP_Simulacion';

import Resultados_HP_Manual from '../Resultados/Resultados_HP_Manual';
import Resultados_HP_Matriz from '../Resultados/Resultados_HP_Matriz';
import Resultados_HP_Simulacion from '../Resultados/Resultados_HP_Simulacion';

const renderKatex = (math) => (
    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
);

const PRUEBAS = [
    { id: 'media_z', label: <>Media Z ({renderKatex('\\sigma')} conocida)</> },
    { id: 'media_t', label: <>Media T ({renderKatex('\\sigma')} desconocida)</> },
    { id: 'proporcion', label: <>Proporción {renderKatex('p')}</> },
    { id: 'varianza', label: <>Varianza {renderKatex('\\sigma^2')}</> }
];

const MODOS = [
    { id: 'matriz', label: 'Análisis de Matriz' },
    { id: 'simulacion', label: 'Simulación' },
    { id: 'manual', label: 'Modo Manual' }
];

export function Controles_HP_UI({ prueba, setPrueba, bloquearHistorial = false }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '850px' }}>
                    <div id="tour-t6-hp-selector-prueba" style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                        {PRUEBAS.map(p => (
                            <button
                                key={p.id}
                                type="button"
                                className={`btn-mat251-modo ${prueba === p.id ? 'active' : ''}`}
                                disabled={bloquearHistorial && prueba !== p.id}
                                onClick={() => { if (!bloquearHistorial) setPrueba(p.id); }}
                                style={{ width: '100%', padding: '5px 15px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '5px', fontSize: '0.75rem' }}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Gestor_HipotesisParametricas({ varSeleccionada, filas, statsDatos, abrirEditor, prueba, modo, setModo, configuracion, onEditar, onCalcular, resultado, bloquearHistorial = false }) {
    const [resSimulacion, setResSimulacion] = useState(null);
    const [pruebaResSimulacion, setPruebaResSimulacion] = useState(null);
    const resultadoActual = resultado?.operacion === 'Hipotesis_parametricas' && resultado.prueba === prueba
        && resultado.modo === modo ? resultado.resultados : null;
    useEffect(() => {
        setResSimulacion(null);
        setPruebaResSimulacion(null);
    }, [prueba, modo, varSeleccionada, statsDatos?.total]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, fontFamily: FONT, marginTop: '10px' }}>
            
            {/* Selector de Modo de Trabajo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '550px' }}>
                    <div id="tour-t6-hp-modos" style={{ display: 'flex', width: '100%', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: '5px', border: '1px solid var(--border-color, #e2e8f0)', overflowX: 'auto' }}>
                        {MODOS.map(m => (
                            <button
                                key={m.id}
                                type="button"
                                className={`btn-mat251-modo ${modo === m.id ? 'active' : ''}`}
                                disabled={bloquearHistorial && modo !== m.id}
                                onClick={() => { if (!bloquearHistorial) setModo(m.id); }}
                                style={{ flex: '1 1 0', minWidth: 'max-content', padding: '5px 15px', textAlign: 'center' }}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL SEGÚN MODO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                {modo === 'matriz' && (
                    <>
                        <Controles_HP_Matriz
                            prueba={prueba}
                            filas={filas}
                            statsDatos={statsDatos}
                            abrirEditor={abrirEditor}
                            configuracion={configuracion.matriz} onEditar={onEditar} onCalcular={onCalcular}
                        />
                        {resultadoActual && (
                            <Resultados_HP_Matriz resultados={resultadoActual} prueba={prueba} />
                        )}
                    </>
                )}

                {modo === 'manual' && (
                    <>
                        <Controles_HP_Manual
                            prueba={prueba}
                            configuracion={configuracion.manual} onEditar={onEditar} onCalcular={onCalcular}
                        />
                        {resultadoActual && (
                            <Resultados_HP_Manual resultados={resultadoActual} prueba={prueba} />
                        )}
                    </>
                )}

                {modo === 'simulacion' && (
                    <>
                        <Controles_HP_Simulacion
                            key={prueba}
                            prueba={prueba}
                            onCalcular={(resultado) => {
                                setResSimulacion(resultado);
                                setPruebaResSimulacion(prueba);
                            }}
                        />
                        {resSimulacion && pruebaResSimulacion === prueba && (
                            <Resultados_HP_Simulacion resultados={resSimulacion} prueba={prueba} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
