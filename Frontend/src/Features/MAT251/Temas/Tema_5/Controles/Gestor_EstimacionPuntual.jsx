import React, { useState, useEffect } from 'react';
import { FONT, FS, RADIUS } from '../../../Principal/Constantes';

// Importaremos los subcomponentes después
import Controles_EstimacionMatriz from './Controles_EstimacionMatriz';
import Resultados_EstimacionMatriz from '../Resultados/Resultados_EstimacionMatriz';
import Controles_EstimacionManual from './Controles_EstimacionManual';
import Resultados_EstimacionManual from '../Resultados/Resultados_EstimacionManual';
import Controles_EstimacionSimulacion from './Controles_EstimacionSimulacion';
import Resultados_EstimacionSimulacion from '../Resultados/Resultados_EstimacionSimulacion';


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

export function Controles_EstimacionPuntual_UI({ parametro, setParametro, modo, setModo, bloquearHistorial = false }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
            {/* Selector de Parámetro */}
            <div id="tour-t5-parametro-estimacion" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: '550px' }}>
                    <div style={{ display: 'flex', width: '100%', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: '5px', border: '1px solid var(--border-color, #e2e8f0)', overflowX: 'auto' }}>
                        {PARAMETROS.map(p => (
                            <button
                                key={p.id}
                                type="button"
                                className={`btn-mat251-modo ${parametro === p.id ? 'active' : ''}`}
                                disabled={bloquearHistorial && parametro !== p.id}
                                onClick={() => setParametro(p.id)}
                                style={{ flex: '1 1 0', minWidth: 'max-content', padding: '5px 10px', textAlign: 'center' }}
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

export default function Gestor_EstimacionPuntual({
    varSeleccionada, filas, statsDatos, abrirEditor, parametro, modo, setModo,
    configuracion, onEditar, onCalcular, resultado, bloquearHistorial = false,
}) {
    const variableKey = varSeleccionada?.nombre ?? null;
    const [resSimulacion, setResSimulacion] = useState(null);
    useEffect(() => { setResSimulacion(null); }, [parametro, modo, variableKey]);
    const resultadoActual = resultado?.operacion === 'Estimacion_puntual' && resultado.parametro === parametro && resultado.modo === modo
        ? resultado.resultados : null;
    const resultadoSimulacionActual = resSimulacion?.parametro === parametro && resSimulacion?.variableKey === variableKey ? resSimulacion.resultado : null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontFamily: FONT, '--text-main': 'var(--text-pure)' }}>
            
            {/* Selector de Modo de Trabajo */}
            <div id="tour-t5-modos-estimacion" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
                <div style={{ width: '100%', maxWidth: '550px' }}>
                    <div style={{ display: 'flex', width: '100%', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', overflowX: 'auto' }}>
                        {MODOS.filter(m => !(parametro === 'media' && m.id === 'manual')).map(m => (
                            <button
                                key={m.id}
                                type="button"
                                className={`btn-mat251-modo ${modo === m.id ? 'active' : ''}`}
                                disabled={bloquearHistorial && modo !== m.id}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: modo === 'manual' && ['proporcion', 'varianza'].includes(parametro) ? '10px' : '20px' }}>
                {modo === 'matriz' && (
                    <>
                        <Controles_EstimacionMatriz
                            key={`matriz-${parametro}-${variableKey ?? 'sin-variable'}`}
                            parametro={parametro}
                            varSeleccionada={varSeleccionada}
                            filas={filas}
                            statsDatos={statsDatos}
                            abrirEditor={abrirEditor}
                            valorExito={configuracion.valorExito} setValorExito={valor => onEditar('valorExito', valor)}
                            onCalcular={onCalcular}
                        />
                        <Resultados_EstimacionMatriz resultados={resultadoActual} parametro={parametro} />
                    </>
                )}

                {modo === 'manual' && (
                    <>
                        <Controles_EstimacionManual
                            key={`manual-${parametro}-${variableKey ?? 'sin-variable'}`}
                            parametro={parametro}
                            configuracion={configuracion.manual} onEditar={onEditar} onCalcular={onCalcular}
                        />
                        <Resultados_EstimacionManual resultados={resultadoActual} parametro={parametro} />
                    </>
                )}

                {modo === 'simulacion' && (
                    <>
                        <Controles_EstimacionSimulacion
                            key={`simulacion-${parametro}-${variableKey ?? 'sin-variable'}`}
                            parametro={parametro}
                            onCalcular={(resultado) => setResSimulacion(resultado ? { parametro, variableKey, resultado } : null)}
                        />
                        {resultadoSimulacionActual && (
                            <Resultados_EstimacionSimulacion resultados={resultadoSimulacionActual} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
