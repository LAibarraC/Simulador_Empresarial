import React, { useState, useEffect } from 'react';
import { FONT, FS, RADIUS } from '../../../Principal/Constantes';

// Importaremos los subcomponentes después
import Controles_EstimacionMatriz from './Controles_EstimacionMatriz';
import Resultados_EstimacionMatriz from '../Resultados/Resultados_EstimacionMatriz';
import Controles_EstimacionManual from './Controles_EstimacionManual';
import Resultados_EstimacionManual from '../Resultados/Resultados_EstimacionManual';
import Controles_EstimacionSimulacion from './Controles_EstimacionSimulacion';
import Resultados_EstimacionSimulacion from '../Resultados/Resultados_EstimacionSimulacion';
import GraficoEstimacionSimulacion from '../../../Graficas/Tema_5/GraficoEstimacionSimulacion';
import GraficoEstimacionMatriz from '../../../Graficas/Tema_5/GraficoEstimacionMatriz';

import katex from 'katex';
import 'katex/dist/katex.min.css';
import '../../../styles/Temas/Tema5.css';

const renderKatex = (math) => (
    <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
);

const PARAMETROS = [
    { id: 'media', label: <div style={{display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center'}}>Media {renderKatex('\\mu')}</div> },
    { id: 'proporcion', label: <div style={{display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center'}}>Proporción {renderKatex('p')}</div> },
    { id: 'varianza', label: <div style={{display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center'}}>Varianza {renderKatex('\\sigma^2')}</div> }
];

const MODOS = [
    { id: 'matriz', label: 'Análisis de Matriz' },
    { id: 'simulacion', label: 'Simulación' },
    { id: 'manual', label: 'Modo Manual' }
];

export function Controles_EstimacionPuntual_UI({ parametro, setParametro, modo, setModo }) {
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
        </div>
    );
}

export default function Gestor_EstimacionPuntual({ varSeleccionada, filas, statsDatos, abrirEditor, parametro, modo, setModo }) {
    // Estados para almacenar resultados de cada modo
    const [resMatriz, setResMatriz] = useState(null);
    const [resManual, setResManual] = useState(null);
    const [resSimulacion, setResSimulacion] = useState(null);

    // Resetear resultados al cambiar de parámetro o modo
    useEffect(() => {
        setResMatriz(null);
        setResManual(null);
        setResSimulacion(null);
        
        // El modo manual no está disponible para 'media'
        if (parametro === 'media' && modo === 'manual') {
            setModo('matriz');
        }
    }, [parametro, modo, setModo]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: FONT }}>
            
            {/* Selector de Modo de Trabajo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '550px' }}>
                    <div style={{ display: 'flex', width: '100%', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', overflowX: 'auto' }}>
                        {MODOS.filter(m => !(parametro === 'media' && m.id === 'manual')).map(m => (
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
                        <Controles_EstimacionMatriz
                            parametro={parametro}
                            varSeleccionada={varSeleccionada}
                            filas={filas}
                            statsDatos={statsDatos}
                            abrirEditor={abrirEditor}
                            onCalcular={setResMatriz}
                        />
                        <Resultados_EstimacionMatriz resultados={resMatriz} parametro={parametro} />
                        {resMatriz && (
                            <GraficoEstimacionMatriz resultados={resMatriz} parametro={parametro} />
                        )}
                    </>
                )}

                {modo === 'manual' && (
                    <>
                        <Controles_EstimacionManual
                            parametro={parametro}
                            onCalcular={setResManual}
                        />
                        <Resultados_EstimacionManual resultados={resManual} parametro={parametro} />
                    </>
                )}

                {modo === 'simulacion' && (
                    <>
                        <Controles_EstimacionSimulacion
                            parametro={parametro}
                            onCalcular={setResSimulacion}
                        />
                        {resSimulacion && (
                            <>
                                <Resultados_EstimacionSimulacion resultados={resSimulacion} />
                                <GraficoEstimacionSimulacion resultados={resSimulacion} />
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
