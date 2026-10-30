import React, { useState, useRef, useEffect } from 'react';
import { FONT, FS, RADIUS } from '../../../Principal/Constantes';
import '../../../styles/Temas/Tema4.css';
import Resultados_DistribucionesMuestrales from '../Resultados/Resultados_DistribucionesMuestrales';

import Controles_DiferenciaProporciones from './Controles_DiferenciaProporciones';
import Resultados_DiferenciaProporciones from '../Resultados/Resultados_DiferenciaProporciones';
import GraficoDiferenciaProporciones from '../../../Graficas/Tema_4/GraficoDiferenciaProporciones';
import Controles_ProbabilidadMuestral from './Controles_ProbabilidadMuestral';
import Resultados_ProbabilidadMuestral from '../Resultados/Resultados_ProbabilidadMuestral';
import GraficoProbabilidadMuestral from '../../../Graficas/Tema_4/GraficoProbabilidadMuestral';
import Controles_ChiCuadrada from './Controles_ChiCuadrada';
import Resultados_ChiCuadrada from '../Resultados/Resultados_ChiCuadrada';
import GraficoChiCuadrada from '../../../Graficas/Tema_4/GraficoChiCuadrada';
import Controles_Proporcion from './Controles_Proporcion';
import Resultados_Proporcion from '../Resultados/Resultados_Proporcion';
import GraficoProporcion from '../../../Graficas/Tema_4/GraficoProporcion';
import Controles_DiferenciaMedias from './Controles_DiferenciaMedias';
import Resultados_DiferenciaMedias from '../Resultados/Resultados_DiferenciaMedias';
import GraficoDiferenciaMedias from '../../../Graficas/Tema_4/GraficoDiferenciaMedias';

const OpcionesHerramienta = [
    { id: 'normal', label: 'Distribución de la Media con varianza conocida' },
    { id: 'proporcion', label: 'Distribución de una Proporción' },
    { id: 'chi', label: 'Distribución de la Varianza Muestral' },
    { id: 'dif_medias', label: 'Distribución de Diferencia de Medias muestrales con Varianzas conocidas' },
    { id: 'dif_proporciones', label: 'Distribución de la Diferencia entre dos Proporciones' }
];

function CustomSelectHerramienta({ value, onChange, disabled = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = OpcionesHerramienta.find(o => o.id === value)?.label || '';

    return (
        <div ref={selectRef} className="tema4-select-container" style={{ fontFamily: FONT }}>
            <div
                onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
                aria-disabled={disabled}
                style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                className={`tema4-select-header ${isOpen ? 'open' : ''}`}
            >
                <span className="tema4-select-text">{selectedLabel}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`tema4-select-chevron ${isOpen ? 'open' : ''}`}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>

            {isOpen && !disabled && (
                <div className="tema4-select-dropdown">
                    {OpcionesHerramienta.map(op => (
                        <div
                            key={op.id}
                            onClick={() => { onChange(op.id); setIsOpen(false); }}
                            className={`tema4-select-option ${value === op.id ? 'selected' : ''}`}
                        >
                            {op.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Gestor_CalculadoraMuestral({
    varSeleccionada, filas, abrirEditor, configuracion, onEditar, onCambiarVista,
    onCambiarDistribucion, onGenerar, resultado, bloquearHistorial = false,
}) {
    const modoMuestral = configuracion.vista;
    const distribucionActiva = configuracion.distribucion;
    const herramientas = {
        normal: { Control: Controles_ProbabilidadMuestral, Grafico: GraficoProbabilidadMuestral, Resultados: Resultados_ProbabilidadMuestral, id: 't4calc' },
        proporcion: { Control: Controles_Proporcion, Grafico: GraficoProporcion, Resultados: Resultados_Proporcion, id: 't4prop' },
        chi: { Control: Controles_ChiCuadrada, Grafico: GraficoChiCuadrada, Resultados: Resultados_ChiCuadrada, id: 't4chi' },
        dif_medias: { Control: Controles_DiferenciaMedias, Grafico: GraficoDiferenciaMedias, Resultados: Resultados_DiferenciaMedias, id: 't4difmed' },
        dif_proporciones: { Control: Controles_DiferenciaProporciones, Grafico: GraficoDiferenciaProporciones, Resultados: Resultados_DiferenciaProporciones, id: 't4difprop' },
    };
    const { Control, Grafico, Resultados, id } = herramientas[distribucionActiva];
    const distribucionEsperada = modoMuestral === 'empirica' ? 'empirica' : distribucionActiva;
    const resultadoActivo = resultado?.operacion === 'distribuciones_muestrales' && resultado.distribucion === distribucionEsperada ? resultado : null;
    const datos = resultadoActivo?.resultados || null;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', fontFamily: FONT }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '5px' }}>
                <div id="tour-t4-modos-muestrales" className="contenedor-selector-modos-mat251" style={{ width: '100%', maxWidth: '420px', display: 'flex' }}>
                    <button
                        type="button"
                        className={`btn-mat251-modo ${modoMuestral === 'empirica' ? 'active' : ''}`}
                        disabled={bloquearHistorial && modoMuestral !== 'empirica'}
                        onClick={() => onCambiarVista('empirica')}
                        style={{ flex: 1, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: FS.sm }}
                    >
                        Demostración Empírica
                    </button>
                    <button
                        type="button"
                        className={`btn-mat251-modo ${modoMuestral === 'calculadora' ? 'active' : ''}`}
                        disabled={bloquearHistorial && modoMuestral !== 'calculadora'}
                        onClick={() => onCambiarVista('calculadora')}
                        style={{ flex: 1, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: FS.sm }}
                    >
                        Calculadora de Probabilidades
                    </button>
                </div>
            </div>
            {modoMuestral === 'empirica' ? (
                <Resultados_DistribucionesMuestrales
                    varSeleccionada={varSeleccionada} filas={filas} abrirEditor={abrirEditor}
                    configuracion={configuracion.empirica} onEditar={onEditar} onGenerar={() => onGenerar(false)} resultado={datos}
                />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div id="tour-t4-selector-distribucion-teorica" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <CustomSelectHerramienta value={distribucionActiva} onChange={onCambiarDistribucion} disabled={bloquearHistorial} />
                    </div>
                    <div className="tema4-calculadora-wrapper">
                        <Control
                            configuracion={configuracion.calculadora[distribucionActiva]} onEditar={onEditar}
                            onGenerar={onGenerar} baseCalculada={resultadoActivo?._baseMuestral || null}
                        />
                        <div>
                            <div id={`tour-${id}-grafica`}><Grafico resultados={datos} /></div>
                            <div id={`tour-${id}-resultados`} className="tema4-calculadora-resultados"><Resultados resultados={datos} /></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
