import React, { useState, useEffect } from 'react';
import { FONT, RADIUS } from '../../../Principal/Constantes';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import '../../../styles/Temas/Tema5.css'; // Podemos reutilizar los estilos de Tema5

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

export function Controles_HP_UI({ prueba, setPrueba }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '850px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: '5px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                        {PRUEBAS.map(p => (
                            <button
                                key={p.id}
                                type="button"
                                className={`btn-mat251-modo ${prueba === p.id ? 'active' : ''}`}
                                onClick={() => setPrueba(p.id)}
                                style={{ width: '100%', padding: '5px 15px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px', fontSize: '0.75rem' }}
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

export default function Gestor_HipotesisParametricas({ varSeleccionada, filas, statsDatos, abrirEditor, prueba, modo, setModo }) {
    const [resMatriz, setResMatriz] = useState(null);
    const [resManual, setResManual] = useState(null);
    const [resSimulacion, setResSimulacion] = useState(null);

    useEffect(() => {
        setResMatriz(null);
        setResManual(null);
        setResSimulacion(null);
    }, [prueba, modo]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: FONT, marginTop: '10px' }}>
            
            {/* Selector de Modo de Trabajo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '550px' }}>
                    <div style={{ display: 'flex', width: '100%', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: '5px', border: '1px solid var(--border-color, #e2e8f0)', overflowX: 'auto' }}>
                        {MODOS.map(m => (
                            <button
                                key={m.id}
                                type="button"
                                className={`btn-mat251-modo ${modo === m.id ? 'active' : ''}`}
                                onClick={() => setModo(m.id)}
                                style={{ flex: '1 1 0', minWidth: 'max-content', padding: '5px 15px', textAlign: 'center' }}
                            >
                                {m.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* CONTENIDO PRINCIPAL SEGÚN MODO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {modo === 'matriz' && (
                    <>
                        <Controles_HP_Matriz
                            prueba={prueba}
                            varSeleccionada={varSeleccionada}
                            filas={filas}
                            statsDatos={statsDatos}
                            abrirEditor={abrirEditor}
                            onCalcular={setResMatriz}
                        />
                        {resMatriz && (
                            <Resultados_HP_Matriz resultados={resMatriz} prueba={prueba} />
                        )}
                    </>
                )}

                {modo === 'manual' && (
                    <>
                        <Controles_HP_Manual
                            prueba={prueba}
                            onCalcular={setResManual}
                        />
                        {resManual && (
                            <Resultados_HP_Manual resultados={resManual} prueba={prueba} />
                        )}
                    </>
                )}

                {modo === 'simulacion' && (
                    <>
                        <Controles_HP_Simulacion
                            prueba={prueba}
                            onCalcular={setResSimulacion}
                        />
                        {resSimulacion && (
                            <Resultados_HP_Simulacion resultados={resSimulacion} prueba={prueba} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
