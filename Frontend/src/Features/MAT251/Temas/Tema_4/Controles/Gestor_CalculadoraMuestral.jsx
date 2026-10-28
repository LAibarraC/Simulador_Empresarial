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
    { id: 'proporcion', label: 'Distribución de una Proporción' },
    { id: 'chi', label: 'Distribución de la Varianza Muestral' },
    { id: 'dif_medias', label: 'Distribución de Diferencia de Medias muestrales con Varianzas conocidas' },
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
        <div ref={selectRef} className="tema4-select-container" style={{ fontFamily: FONT }}>
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

export default function Gestor_CalculadoraMuestral({ varSeleccionada, filas, abrirEditor, onResultado }) {
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
    const [datosEmpiricos, setDatosEmpiricos] = useState(null);

    const resultadoActivo = modoMuestral === 'empirica' ? datosEmpiricos : {
        normal: datosProbMuestral, proporcion: datosProporcion, chi: datosChiCuadrada,
        dif_medias: datosDiferenciaMedias, dif_proporciones: datosDiferenciaProporciones,
        student: datosStudent, dif_medias_desc: datosDifMediasDesc,
        razon_varianzas: datosRazonVarianzas, fisher: datosFisher
    }[distribucionActiva];

    useEffect(() => {
        onResultado?.(resultadoActivo ? {
            operacion: 'distribuciones_muestrales',
            distribucion: modoMuestral === 'empirica' ? 'empirica' : distribucionActiva,
            resultados: resultadoActivo,
            nombreVariable: varSeleccionada?.nombre,
            poblacion: modoMuestral === 'empirica' ? (filas || []).map(f => String(f.valor ?? '').trim()).filter(Boolean) : undefined
        } : null);
    }, [resultadoActivo, distribucionActiva, modoMuestral, onResultado, varSeleccionada?.nombre, filas]);

    const limpiarResultados = () => {
        setDatosEmpiricos(null);
        setDatosProbMuestral(null);
        setDatosChiCuadrada(null);
        setDatosFisher(null);
        setDatosProporcion(null);
        setDatosDiferenciaMedias(null);
        setDatosDifMediasDesc(null);
        setDatosRazonVarianzas(null);
        setDatosDiferenciaProporciones(null);
        setDatosStudent(null);
    };

    const cambiarDistribucion = (nuevaDistribucion) => {
        if (nuevaDistribucion === distribucionActiva) return;
        limpiarResultados();
        setDistribucionActiva(nuevaDistribucion);
    };

    const cambiarModoMuestral = (nuevoModo) => {
        if (nuevoModo === modoMuestral) return;
        limpiarResultados();
        setModoMuestral(nuevoModo);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', fontFamily: FONT }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '5px' }}>
                <div id="tour-t4-modos-muestrales" className="contenedor-selector-modos-mat251" style={{ width: '100%', maxWidth: '420px', display: 'flex' }}>
                    <button
                        type="button"
                        className={`btn-mat251-modo ${modoMuestral === 'empirica' ? 'active' : ''}`}
                        onClick={() => cambiarModoMuestral('empirica')}
                        style={{ flex: 1, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: FS.sm }}
                    >
                        Demostración Empírica
                    </button>
                    <button
                        type="button"
                        className={`btn-mat251-modo ${modoMuestral === 'calculadora' ? 'active' : ''}`}
                        onClick={() => cambiarModoMuestral('calculadora')}
                        style={{ flex: 1, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: FS.sm }}
                    >
                        Calculadora de Probabilidades
                    </button>
                </div>
            </div>
            {modoMuestral === 'empirica' ? (
                <Resultados_DistribucionesMuestrales varSeleccionada={varSeleccionada} filas={filas} abrirEditor={abrirEditor} onCalcular={setDatosEmpiricos} />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div id="tour-t4-selector-distribucion-teorica" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                        <CustomSelectHerramienta value={distribucionActiva} onChange={cambiarDistribucion} />
                    </div>
                    {distribucionActiva === 'normal' ? (
                <div className="tema4-calculadora-wrapper">
                    <Controles_ProbabilidadMuestral onCalcular={setDatosProbMuestral} />
                    <div>
                        <div id="tour-t4calc-grafica">
                            <GraficoProbabilidadMuestral resultados={datosProbMuestral} />
                        </div>
                        <div id="tour-t4calc-resultados" className="tema4-calculadora-resultados">
                            <Resultados_ProbabilidadMuestral resultados={datosProbMuestral} />
                        </div>
                    </div>
                </div>
            ) : distribucionActiva === 'proporcion' ? (
                <div className="tema4-calculadora-wrapper">
                    <Controles_Proporcion onCalcular={setDatosProporcion} />
                    <div>
                        <div id="tour-t4prop-grafica">
                            <GraficoProporcion resultados={datosProporcion} />
                        </div>
                        <div id="tour-t4prop-resultados" className="tema4-calculadora-resultados">
                            <Resultados_Proporcion resultados={datosProporcion} />
                        </div>
                    </div>
                </div>
            ) : distribucionActiva === 'dif_medias' ? (
                <div className="tema4-calculadora-wrapper">
                    <Controles_DiferenciaMedias onCalcular={setDatosDiferenciaMedias} />
                    <div>
                        <div id="tour-t4difmed-grafica">
                            <GraficoDiferenciaMedias resultados={datosDiferenciaMedias} />
                        </div>
                        <div id="tour-t4difmed-resultados" className="tema4-calculadora-resultados">
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
                        <div id="tour-t4chi-grafica">
                            <GraficoChiCuadrada resultados={datosChiCuadrada} />
                        </div>
                        <div id="tour-t4chi-resultados" className="tema4-calculadora-resultados">
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
                                <GraficoStudent resultados={datosDifMediasDesc} esDiferenciaMedias={true} />
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
                        <div id="tour-t4difprop-grafica">
                            <GraficoDiferenciaProporciones resultados={datosDiferenciaProporciones} />
                        </div>
                        <div id="tour-t4difprop-resultados" className="tema4-calculadora-resultados">
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
