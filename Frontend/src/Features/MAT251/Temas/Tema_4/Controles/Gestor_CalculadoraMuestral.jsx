import React, { useState, useRef, useEffect } from 'react';
import { FONT, FS, RADIUS } from '../../../Principal/Constantes';
import '../../../styles/Temas/Tema4.css';
import Resultados_DistribucionesMuestrales from '../Resultados/Resultados_DistribucionesMuestrales';

import Controles_DiferenciaMediasDesconocidas from './Controles_DiferenciaMediasDesconocidas';
import Resultados_DiferenciaMediasDesconocidas from '../Resultados/Resultados_DiferenciaMediasDesconocidas';
import Controles_RazonVarianzas from './Controles_RazonVarianzas';
import Resultados_RazonVarianzas from '../Resultados/Resultados_RazonVarianzas';
import Controles_DiferenciaProporciones from './Controles_DiferenciaProporciones';
import Resultados_DiferenciaProporciones from '../Resultados/Resultados_DiferenciaProporciones';
import GraficoDiferenciaProporciones from '../../../Graficas/Tema_4/GraficoDiferenciaProporciones';
import Controles_ProbabilidadMuestral from './Controles_ProbabilidadMuestral';
import Resultados_ProbabilidadMuestral from '../Resultados/Resultados_ProbabilidadMuestral';
import GraficoProbabilidadMuestral from '../../../Graficas/Tema_4/GraficoProbabilidadMuestral';
import Controles_ChiCuadrada from './Controles_ChiCuadrada';
import Resultados_ChiCuadrada from '../Resultados/Resultados_ChiCuadrada';
import GraficoChiCuadrada from '../../../Graficas/Tema_4/GraficoChiCuadrada';
import Controles_Fisher from './Controles_Fisher';
import Resultados_Fisher from '../Resultados/Resultados_Fisher';
import GraficoFisher from '../../../Graficas/Tema_4/GraficoFisher';
import Controles_Proporcion from './Controles_Proporcion';
import Resultados_Proporcion from '../Resultados/Resultados_Proporcion';
import GraficoProporcion from '../../../Graficas/Tema_4/GraficoProporcion';
import Controles_DiferenciaMedias from './Controles_DiferenciaMedias';
import Resultados_DiferenciaMedias from '../Resultados/Resultados_DiferenciaMedias';
import GraficoDiferenciaMedias from '../../../Graficas/Tema_4/GraficoDiferenciaMedias';
import Controles_Student from './Controles_Student';
import Resultados_Student from '../Resultados/Resultados_Student';
import GraficoStudent from '../../../Graficas/Tema_4/GraficoStudent';

const OpcionesHerramienta = [
    { id: 'normal', label: 'Distribución de la Media con varianza conocida' },
    { id: 'chi', label: 'Distribución de la Varianza Muestral' },
    { id: 'proporcion', label: 'Distribución de una Proporción' },
    { id: 'dif_medias', label: 'Distribución de Diferencia de Medias muestrales con Varianzas conocidas' },
    { id: 'student', label: 'Distribución de la Media con varianza desconocida' },
    { id: 'dif_medias_desc', label: 'Distribución de la Diferencia de Medias Muestrales con Varianzas Desconocidas' },
    { id: 'razon_varianzas', label: 'Distribución de la Razón de dos Varianzas Muestrales' },
    { id: 'dif_proporciones', label: 'Distribución de la Diferencia entre dos Proporciones' }
];

function CustomSelectHerramienta({ value, onChange }) {
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
        <div ref={selectRef} className="tema4-select-container">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`tema4-select-header ${isOpen ? 'open' : ''}`}
            >
                <div className="tema4-select-header-content">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="tema4-select-icon-primary">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="3" y1="9" x2="21" y2="9" />
                        <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                    <span className="tema4-select-text">{selectedLabel}</span>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`tema4-select-chevron ${isOpen ? 'open' : ''}`}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>

            {isOpen && (
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

export default function Gestor_CalculadoraMuestral({ varSeleccionada, filas, abrirEditor }) {
    const [modoMuestral, setModoMuestral] = useState('empirica');
    const [distribucionActiva, setDistribucionActiva] = useState('normal');

    const [datosProbMuestral, setDatosProbMuestral] = useState(null);
    const [datosChiCuadrada, setDatosChiCuadrada] = useState(null);
    const [datosFisher, setDatosFisher] = useState(null);
    const [datosProporcion, setDatosProporcion] = useState(null);
    const [datosDiferenciaMedias, setDatosDiferenciaMedias] = useState(null);
    const [datosDifMediasDesc, setDatosDifMediasDesc] = useState(null);
    const [datosRazonVarianzas, setDatosRazonVarianzas] = useState(null);
    const [datosDiferenciaProporciones, setDatosDiferenciaProporciones] = useState(null);
    const [datosStudent, setDatosStudent] = useState(null);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'row', margin: '0 auto', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', gap: '4px', width: '100%', maxWidth: '400px' }}>
                <button
                    type="button"
                    className={`btn-mat251-modo ${modoMuestral === 'empirica' ? 'active' : ''}`}
                    onClick={() => setModoMuestral('empirica')}
                    style={{ flex: 1, padding: '8px 10px', fontSize: FS.sm, textAlign: 'center' }}
                >
                    Demostración Empírica
                </button>
                <button
                    type="button"
                    className={`btn-mat251-modo ${modoMuestral === 'calculadora' ? 'active' : ''}`}
                    onClick={() => setModoMuestral('calculadora')}
                    style={{ flex: 1, padding: '8px 10px', fontSize: FS.sm, textAlign: 'center' }}
                >
                    Calculadora
                </button>
            </div>
            {modoMuestral === 'empirica' ? (
                <Resultados_DistribucionesMuestrales varSeleccionada={varSeleccionada} filas={filas} abrirEditor={abrirEditor} />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <CustomSelectHerramienta value={distribucionActiva} onChange={setDistribucionActiva} />
                    {distribucionActiva === 'normal' ? (
                <div className="tema4-calculadora-wrapper">
                    <Controles_ProbabilidadMuestral onCalcular={setDatosProbMuestral} />
                    <div>
                        <GraficoProbabilidadMuestral resultados={datosProbMuestral} />
                        <div className="tema4-calculadora-resultados">
                            <Resultados_ProbabilidadMuestral resultados={datosProbMuestral} />
                        </div>
                    </div>
                </div>
            ) : distribucionActiva === 'proporcion' ? (
                <div className="tema4-calculadora-wrapper">
                    <Controles_Proporcion onCalcular={setDatosProporcion} />
                    <div>
                        <GraficoProporcion resultados={datosProporcion} />
                        <div className="tema4-calculadora-resultados">
                            <Resultados_Proporcion resultados={datosProporcion} />
                        </div>
                    </div>
                </div>
            ) : distribucionActiva === 'dif_medias' ? (
                <div className="tema4-calculadora-wrapper">
                    <Controles_DiferenciaMedias onCalcular={setDatosDiferenciaMedias} />
                    <div>
                        <GraficoDiferenciaMedias resultados={datosDiferenciaMedias} />
                        <div className="tema4-calculadora-resultados">
                            <Resultados_DiferenciaMedias resultados={datosDiferenciaMedias} />
                        </div>
                    </div>
                </div>
            ) : distribucionActiva === 'student' ? (
                <div className="tema4-calculadora-wrapper">
                    <Controles_Student onCalcular={setDatosStudent} />
                    <div>
                        <GraficoStudent resultados={datosStudent} />
                        <div className="tema4-calculadora-resultados">
                            <Resultados_Student resultados={datosStudent} />
                        </div>
                    </div>
                </div>
            ) : distribucionActiva === 'chi' ? (
                <div className="tema4-calculadora-wrapper">
                    <Controles_ChiCuadrada onCalcular={setDatosChiCuadrada} />
                    <div>
                        <GraficoChiCuadrada resultados={datosChiCuadrada} />
                        <div className="tema4-calculadora-resultados">
                            <Resultados_ChiCuadrada resultados={datosChiCuadrada} />
                        </div>
                    </div>
                </div>
            ) : distribucionActiva === 'dif_medias_desc' ? (
                <div className="tema4-calculadora-wrapper">
                    <Controles_DiferenciaMediasDesconocidas onCalcular={setDatosDifMediasDesc} />
                    <div>
                        {datosDifMediasDesc && (
                            datosDifMediasDesc.escenario === 'grandes' ? (
                                <GraficoDiferenciaMedias resultados={datosDifMediasDesc} />
                            ) : (
                                <GraficoStudent resultados={datosDifMediasDesc} />
                            )
                        )}
                        <div className="tema4-calculadora-resultados">
                            <Resultados_DiferenciaMediasDesconocidas resultados={datosDifMediasDesc} />
                        </div>
                    </div>
                </div>
            ) : distribucionActiva === 'razon_varianzas' ? (
                <div className="tema4-calculadora-wrapper">
                    <Controles_RazonVarianzas onCalcular={setDatosRazonVarianzas} />
                    <div>
                        <GraficoFisher resultados={datosRazonVarianzas} />
                        <div className="tema4-calculadora-resultados">
                            <Resultados_RazonVarianzas resultados={datosRazonVarianzas} />
                        </div>
                    </div>
                </div>
            ) : distribucionActiva === 'dif_proporciones' ? (
                <div className="tema4-calculadora-wrapper">
                    <Controles_DiferenciaProporciones onCalcular={setDatosDiferenciaProporciones} />
                    <div>
                        <GraficoDiferenciaProporciones resultados={datosDiferenciaProporciones} />
                        <div className="tema4-calculadora-resultados">
                            <Resultados_DiferenciaProporciones resultados={datosDiferenciaProporciones} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="tema4-en-construccion">
                    <h3>Distribución</h3>
                    <p>Calculadora en construcción...</p>
                </div>
            )}
                </div>
            )}
        </div>
    );
}
