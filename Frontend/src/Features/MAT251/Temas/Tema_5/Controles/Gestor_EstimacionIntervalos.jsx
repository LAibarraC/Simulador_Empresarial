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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '10px' }}>
            {/* Selector de Parámetro */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '0px' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 'bold', textTransform: 'uppercase'}}>Nivel de Confianza</div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-input, #f8fafc)',
                    padding: '5px',
                    borderRadius: '12px',
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

export default function Gestor_EstimacionIntervalos({ varSeleccionada, filas, statsDatos, abrirEditor, parametro, setParametro, modo, setModo, confianza, setConfianza }) {

    // Estados para almacenar resultados de cada modo
    const [resMatriz, setResMatriz] = useState(null);
    const [resManual, setResManual] = useState(null);
    const [resSimulacion, setResSimulacion] = useState(null);

    // Resetear resultados al cambiar de parámetro, modo o nivel de confianza
    useEffect(() => {
        setResMatriz(null);
        setResManual(null);
        setResSimulacion(null);
    }, [parametro, modo, confianza]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: FONT }}>

            {/* Selector de Modo de Trabajo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '-10px' }}>
                <div style={{ width: '100%', maxWidth: '550px' }}>
                    <div style={{ display: 'flex', width: '100%', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', overflowX: 'auto' }}>
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
                            parametro={parametro}
                            confianza={confianza}
                            varSeleccionada={varSeleccionada}
                            filas={filas}
                            statsDatos={statsDatos}
                            abrirEditor={abrirEditor}
                            onCalcular={setResMatriz}
                        />
                        <Resultados_IntervalosMatriz resultados={resMatriz} parametro={parametro} />
                    </>
                )}

                {modo === 'manual' && (
                    <>
                        <Controles_IntervalosManual
                            parametro={parametro}
                            confianza={confianza}
                            onCalcular={setResManual}
                        />
                        <Resultados_IntervalosManual resultados={resManual} parametro={parametro} />
                    </>
                )}

                {modo === 'simulacion' && (
                    <>
                        <Controles_IntervalosSimulacion
                            parametro={parametro}
                            confianza={confianza}
                            onCalcular={setResSimulacion}
                        />
                        {resSimulacion && (
                            <Resultados_IntervalosSimulacion resultados={resSimulacion} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
