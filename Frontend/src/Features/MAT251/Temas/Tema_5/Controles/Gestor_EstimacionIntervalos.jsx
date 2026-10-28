import React, { useState, useEffect } from 'react';
import { FONT, FS, RADIUS } from '../../../Principal/Constantes';

// Importaremos los subcomponentes después
import Controles_IntervalosMatriz from './Controles_IntervalosMatriz';
import Resultados_IntervalosMatriz from '../Resultados/Resultados_IntervalosMatriz';
import Controles_IntervalosManual from './Controles_IntervalosManual';
import Resultados_IntervalosManual from '../Resultados/Resultados_IntervalosManual';
import Controles_IntervalosSimulacion from './Controles_IntervalosSimulacion';
import Resultados_IntervalosSimulacion from '../Resultados/Resultados_IntervalosSimulacion';


import katex from 'katex';
import 'katex/dist/katex.min.css';
import '../../../styles/Temas/Tema5.css';

const renderKatex = (math) => (
    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
);

const PARAMETROS = [
    { id: 'media', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>Media {renderKatex('\\mu')}</div> },
    { id: 'proporcion', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>Proporción {renderKatex('p')}</div> },
    { id: 'varianza', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>Varianza {renderKatex('\\sigma^2')}</div> }
];

const MODOS = [
    { id: 'matriz', label: 'Análisis de Matriz' },
    { id: 'simulacion', label: 'Simulación' },
    { id: 'manual', label: 'Modo Manual' }
];

const NIVELES_CONFIANZA = [
    { id: 90, label: '90 %' },
    { id: 95, label: '95 %' },
    { id: 99, label: '99 %' }
];

export function Controles_EstimacionIntervalos_UI({ parametro, setParametro, modo, setModo, confianza, setConfianza }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
            {/* Selector de Parámetro */}
            <div id="tour-t5-parametro-intervalos" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '550px' }}>
                    <div style={{ display: 'flex', width: '100%', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', overflowX: 'auto' }}>
                        {PARAMETROS.map(p => (
                            <button
                                key={p.id}
                                type="button"
                                className={`btn-mat251-modo ${parametro === p.id ? 'active' : ''}`}
                                onClick={() => setParametro(p.id)}
                                style={{ flex: '1 1 0', minWidth: 'max-content', padding: '3px 13px', textAlign: 'center' }}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Selector de Nivel de Confianza */}
            <div id="tour-t5-nivel-confianza" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '0px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-pure)', marginBottom: '5px', fontWeight: 'bold'}}>NIVEL DE CONFIANZA</div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-input, #f8fafc)',
                    padding: '5px',
                    borderRadius: '5px',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
                }}>
                    {/* Presets */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {NIVELES_CONFIANZA.map(nivel => (
                            <button
                                key={nivel.id}
                                type="button"
                                onClick={() => setConfianza(nivel.id)}
                                className={`btn-mat251-confianza ${confianza === nivel.id ? 'active' : ''}`}
                                style={{ padding: '5px 15px',fontSize: '0.7rem' }}
                            >
                                {nivel.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Gestor_EstimacionIntervalos({ varSeleccionada, filas, statsDatos, abrirEditor, parametro, setParametro, modo, setModo, confianza, setConfianza, onResultado }) {
    const variableKey = varSeleccionada?.nombre ?? null;

    // Estados para almacenar resultados de cada modo
    const [resMatriz, setResMatriz] = useState(null);
    const [resManual, setResManual] = useState(null);
    const [resSimulacion, setResSimulacion] = useState(null);

    // Resetear resultados al cambiar de parámetro, modo o nivel de confianza
    useEffect(() => {
        setResMatriz(null);
        setResManual(null);
        setResSimulacion(null);
    }, [parametro, modo, confianza, variableKey]);

    const resultadoMatrizActual = resMatriz?.parametro === parametro && resMatriz?.confianza === confianza && resMatriz?.variableKey === variableKey ? resMatriz.resultado : null;
    const resultadoManualActual = resManual?.parametro === parametro && resManual?.confianza === confianza && resManual?.variableKey === variableKey ? resManual.resultado : null;
    const resultadoSimulacionActual = resSimulacion?.parametro === parametro && resSimulacion?.confianza === confianza && resSimulacion?.variableKey === variableKey ? resSimulacion.resultado : null;
    const resultadoExportable = modo === 'matriz' ? resultadoMatrizActual : modo === 'manual' ? resultadoManualActual : null;

    useEffect(() => {
        onResultado?.(resultadoExportable ? {
            operacion: 'Estimacion_intervalos', parametro, modo, confianza,
            nombreVariable: variableKey, resultados: resultadoExportable
        } : null);
    }, [resultadoExportable, parametro, modo, confianza, variableKey, onResultado]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: FONT, '--text-main': 'var(--text-pure)' }}>

            {/* Selector de Modo de Trabajo */}
            <div id="tour-t5-modos-intervalos" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {modo === 'matriz' && (
                    <>
                        <Controles_IntervalosMatriz
                            key={`matriz-${parametro}-${confianza}-${variableKey ?? 'sin-variable'}`}
                            parametro={parametro}
                            confianza={confianza}
                            varSeleccionada={varSeleccionada}
                            filas={filas}
                            statsDatos={statsDatos}
                            abrirEditor={abrirEditor}
                            onCalcular={(resultado) => setResMatriz(resultado ? { parametro, confianza, variableKey, resultado } : null)}
                        />
                        <Resultados_IntervalosMatriz resultados={resultadoMatrizActual} parametro={parametro} />
                    </>
                )}

                {modo === 'manual' && (
                    <>
                        <Controles_IntervalosManual
                            key={`manual-${parametro}-${confianza}-${variableKey ?? 'sin-variable'}`}
                            parametro={parametro}
                            confianza={confianza}
                            onCalcular={(resultado) => setResManual(resultado ? { parametro, confianza, variableKey, resultado } : null)}
                        />
                        <Resultados_IntervalosManual resultados={resultadoManualActual} parametro={parametro} />
                    </>
                )}

                {modo === 'simulacion' && (
                    <>
                        <Controles_IntervalosSimulacion
                            key={`simulacion-${parametro}-${confianza}-${variableKey ?? 'sin-variable'}`}
                            parametro={parametro}
                            confianza={confianza}
                            onCalcular={(resultado) => setResSimulacion(resultado ? { parametro, confianza, variableKey, resultado } : null)}
                        />
                        {resultadoSimulacionActual && (
                            <Resultados_IntervalosSimulacion resultados={resultadoSimulacionActual} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
