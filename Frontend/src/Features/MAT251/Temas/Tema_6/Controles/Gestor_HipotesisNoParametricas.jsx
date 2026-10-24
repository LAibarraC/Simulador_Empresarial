import React, { useState, useEffect } from 'react';
import { FONT, RADIUS } from '../../../Principal/Constantes';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import '../../../styles/Temas/Tema5.css';
import '../../../styles/Temas/Tema6.css';

import Controles_HNP_Manual from './Controles_HNP_Manual';
import Controles_HNP_Matriz from './Controles_HNP_Matriz';
import Controles_HNP_Simulacion from './Controles_HNP_Simulacion';

import Resultados_HNP_Manual from '../Resultados/Resultados_HNP_Manual';
import Resultados_HNP_Matriz from '../Resultados/Resultados_HNP_Matriz';
import Resultados_HNP_Simulacion from '../Resultados/Resultados_HNP_Simulacion';

const renderKatex = (math) => (
    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
);

const PRUEBAS = [
    { id: 'chi_cuadrada', label: <>Chi-cuadrada ({renderKatex('\\chi^2')})</> },
    { id: 'signos', label: <>Prueba de Signos</> },
    { id: 'rachas', label: <>Prueba de Rachas</> }
];

const MODOS = [
    { id: 'matriz', label: 'Análisis de Matriz' },
    { id: 'simulacion', label: 'Simulación' },
    { id: 'manual', label: 'Modo Manual' }
];

export function Controles_HNP_UI({ prueba, setPrueba }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '850px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: RADIUS, border: '1px solid var(--border-color, #e2e8f0)' }}>
                        {PRUEBAS.map(p => (
                            <button
                                key={p.id}
                                type="button"
                                className={`btn-mat251-modo ${prueba === p.id ? 'active' : ''}`}
                                onClick={() => setPrueba(p.id)}
                                style={{ width: '100%', padding: '5px 15px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '5px', fontSize: '0.75rem', fontFamily: FONT }}
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

export default function Gestor_HipotesisNoParametricas({ varSeleccionada, filas, statsDatos, abrirEditor, prueba, modo, setModo, variables }) {
    
    const [resMatriz, setResMatriz] = useState(null);
    const [resManual, setResManual] = useState(null);
    const [resSimulacion, setResSimulacion] = useState(null);

    useEffect(() => {
        setResMatriz(null);
        setResManual(null);
        setResSimulacion(null);
    }, [prueba, modo]);

    return (
        <div className="tema6-hnp-responsive" style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontFamily: FONT, marginTop: '10px' }}>
            
            {/* Selector de Modo de Trabajo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '550px' }}>
                    <div className="contenedor-selector-modos-mat251" style={{ display: 'flex', width: '100%', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: RADIUS, border: '1px solid var(--border-color, #e2e8f0)', overflowX: 'auto' }}>
                        {MODOS.map(m => (
                            <button
                                key={m.id}
                                type="button"
                                className={`btn-mat251-modo ${modo === m.id ? 'active' : ''}`}
                                onClick={() => setModo(m.id)}
                                style={{ flex: '1 1 0', minWidth: 0, padding: '5px 15px', textAlign: 'center', fontFamily: FONT }}
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
                        <Controles_HNP_Matriz 
                            prueba={prueba}
                            varSeleccionada={varSeleccionada}
                            filas={filas}
                            statsDatos={statsDatos}
                            abrirEditor={abrirEditor}
                            setResultadosMatriz={setResMatriz}
                            variables={variables}
                        />
                        {resMatriz && (
                            <Resultados_HNP_Matriz resultados={resMatriz} prueba={prueba} />
                        )}
                    </>
                )}

                {modo === 'manual' && (
                    <>
                        <Controles_HNP_Manual 
                            prueba={prueba}
                            setResultadosManual={setResManual}
                        />
                        {resManual && (
                            <Resultados_HNP_Manual resultados={resManual} prueba={prueba} />
                        )}
                    </>
                )}

                {modo === 'simulacion' && (
                    <>
                        <Controles_HNP_Simulacion 
                            prueba={prueba}
                            setResultadosSimulacion={setResSimulacion}
                        />
                        {resSimulacion && (
                            <Resultados_HNP_Simulacion resultados={resSimulacion} prueba={prueba} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
