import React, { useState, useRef, useEffect } from 'react';
import { FONT, FS, RADIUS } from '../../../Principal/Constantes';
import '../../../styles/Temas/Tema4.css';

import Controles_Student from './Controles_Student';
import Resultados_Student from '../Resultados/Resultados_Student';
import GraficoStudent from '../../../Graficas/Tema_4/GraficoStudent';

import Controles_DiferenciaMediasDesconocidas from './Controles_DiferenciaMediasDesconocidas';
import Resultados_DiferenciaMediasDesconocidas from '../Resultados/Resultados_DiferenciaMediasDesconocidas';
import GraficoDiferenciaMedias from '../../../Graficas/Tema_4/GraficoDiferenciaMedias';

import Controles_RazonVarianzas from './Controles_RazonVarianzas';
import Resultados_RazonVarianzas from '../Resultados/Resultados_RazonVarianzas';
import GraficoFisher from '../../../Graficas/Tema_4/GraficoFisher';

const OpcionesHerramienta = [
    { id: 'student', label: 'Distribución de la Media con varianza desconocida' },
    { id: 'dif_medias_desc', label: 'Distribución de la Diferencia de Medias Muestrales con Varianzas Desconocidas' },
    { id: 'razon_varianzas', label: 'Distribución de la Razón de dos Varianzas Muestrales' }
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
        <div ref={selectRef} className="tema4-select-container tema4-select-tyf" style={{ fontFamily: FONT }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`tema4-select-header ${isOpen ? 'open' : ''}`}
            >
                <span className="tema4-select-text">{selectedLabel}</span>
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

export default function Gestor_DistribucionesTyF({ onResultado }) {
    const [distribucionActiva, setDistribucionActiva] = useState('student');

    const [datosStudent, setDatosStudent] = useState(null);
    const [datosDifMediasDesc, setDatosDifMediasDesc] = useState(null);
    const [datosRazonVarianzas, setDatosRazonVarianzas] = useState(null);
    const resultadoActivo = { student: datosStudent, dif_medias_desc: datosDifMediasDesc, razon_varianzas: datosRazonVarianzas }[distribucionActiva];

    useEffect(() => {
        onResultado?.(resultadoActivo ? {
            operacion: 'tyf', distribucion: distribucionActiva, resultados: resultadoActivo
        } : null);
    }, [resultadoActivo, distribucionActiva, onResultado]);

    const cambiarDistribucion = (nuevaDistribucion) => {
        if (nuevaDistribucion === distribucionActiva) return;
        setDatosStudent(null);
        setDatosDifMediasDesc(null);
        setDatosRazonVarianzas(null);
        setDistribucionActiva(nuevaDistribucion);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop:'10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div id="tour-t4tyf-selector" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <CustomSelectHerramienta value={distribucionActiva} onChange={cambiarDistribucion} />
                </div>
                
                {distribucionActiva === 'student' ? (
                    <div className="tema4-calculadora-wrapper">
                        <Controles_Student onCalcular={setDatosStudent} />
                        <div>
                            {datosStudent && (
                                <div id="tour-t4tyf-student-grafica">
                                    <GraficoStudent resultados={datosStudent} />
                                </div>
                            )}
                            {datosStudent && (
                                <div id="tour-t4tyf-student-resultados" className="tema4-calculadora-resultados">
                                    <Resultados_Student resultados={datosStudent} />
                                </div>
                            )}
                        </div>
                    </div>
                ) : distribucionActiva === 'dif_medias_desc' ? (
                    <div className="tema4-calculadora-wrapper">
                        <Controles_DiferenciaMediasDesconocidas onCalcular={setDatosDifMediasDesc} />
                        <div>
                            {datosDifMediasDesc && (
                                <div id="tour-t4tyf-difmed-grafica">
                                    {datosDifMediasDesc.escenario === 'grandes' ? (
                                        <GraficoDiferenciaMedias resultados={datosDifMediasDesc} />
                                    ) : (
                                        <GraficoStudent resultados={datosDifMediasDesc} esDiferenciaMedias={true} />
                                    )}
                                </div>
                            )}
                            {datosDifMediasDesc && (
                                <div id="tour-t4tyf-difmed-resultados" className="tema4-calculadora-resultados">
                                    <Resultados_DiferenciaMediasDesconocidas resultados={datosDifMediasDesc} />
                                </div>
                            )}
                        </div>
                    </div>
                ) : distribucionActiva === 'razon_varianzas' ? (
                    <div className="tema4-calculadora-wrapper">
                        <Controles_RazonVarianzas onCalcular={setDatosRazonVarianzas} />
                        <div>
                            {datosRazonVarianzas && (
                                <div id="tour-t4tyf-fisher-grafica">
                                    <GraficoFisher resultados={datosRazonVarianzas} />
                                </div>
                            )}
                            {datosRazonVarianzas && (
                                <div id="tour-t4tyf-fisher-resultados" className="tema4-calculadora-resultados">
                                    <Resultados_RazonVarianzas resultados={datosRazonVarianzas} />
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="tema4-en-construccion">
                        <h3>Distribución</h3>
                        <p>Calculadora en construcción...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
