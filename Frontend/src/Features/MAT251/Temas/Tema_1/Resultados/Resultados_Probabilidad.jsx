import React, { useState, useEffect, useRef } from 'react';
import { FONT, FS, RADIUS, cardStyle, labelStyle } from '../../../Principal/Constantes';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { IconoCalculadora, EditarDatos, ModificarSeleccion, IconoAlerta, IconoDado, IconoMostrar, IconoOcultar, IconoGuardar, Descargar } from '../../../../../ui/iconos';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import MarcoWidgetMAT251 from '../../../ui/MarcoWidgetMAT251';
import { DadoSVG, MonedaSVG, CartaSVG } from './Experimentos';
import ExperimentosInteractivos from '../Experimentos';
import * as XLSX from 'xlsx';
import { api } from '../../../../../services/api';
import { alerta } from '../../../../../utils/Notificaciones';
import { obtenerProbabilidadTeorica, simularUnPaso } from '../../../Matematicas/logica_Tema1';

const crearTicksConvergencia = (datos, clave) => {
    const intentos = Array.from(new Set(
        (datos || []).map(dato => Number(dato[clave])).filter(Number.isFinite)
    )).sort((a, b) => a - b);

    if (intentos.length <= 40) return Array.from(new Set([0, ...intentos]));

    const maximo = intentos[intentos.length - 1];
    const paso = Math.ceil(maximo / 18);
    const ticks = [0];
    for (let valor = paso; valor < maximo; valor += paso) ticks.push(valor);
    if (maximo > 0) ticks.push(maximo);
    return ticks;
};

export default function ResultadosProbabilidad({
    statsDatos, abrirEditor, valoresUnicos, statsEventos, setModalEvento,
    eventoFavorable, setEventoFavorable, ejecutar, resProbabilidad, setResProbabilidad, formulaProbRef, inputDatos,
    tipo = 'clasica',
    eventoCondicion = [], setModalCondicion = () => { },
    colProbClasica, setColProbClasica, varSeleccionada, filas = [],
    inputMode, setInputMode, mostrarAlerta, onResultadoExperimento,
    manualN, setManualN, manualF, setManualF, experimentoRestaurar, bloquearModos = false
}) {
    const [isDropdownColOpen, setIsDropdownColOpen] = useState(false);
    const dropdownColRef = useRef(null);

    // Estados y refs para dropdowns de Simulación Clásica
    const [isDropdownExpOpen, setIsDropdownExpOpen] = useState(false);
    const dropdownExpRef = useRef(null);
    const [isDropdownEventoOpen, setIsDropdownEventoOpen] = useState(false);
    const dropdownEventoRef = useRef(null);

    // Estados para el Simulador Frecuentista
    const [iteracionesN, setIteracionesN] = useState('');
    const [simulacionActiva, setSimulacionActiva] = useState(false);
    const [datosSimulacion, setDatosSimulacion] = useState([]);
    const [resultadoFrecuentista, setResultadoFrecuentista] = useState(null);

    // Estados para la Simulación Clásica
    const [experimentoClasico, setExperimentoClasico] = useState('');
    const [eventoClasico, setEventoClasico] = useState('');
    const [iteracionesClasica, setIteracionesClasica] = useState('');
    const [resSimulacionClasica, setResSimulacionClasica] = useState(null);
    const [historialSimClasica, setHistorialSimClasica] = useState([]);
    const [historialSimulacionMoneda, setHistorialSimulacionMoneda] = useState([]);
    const [mostrarTablaMoneda, setMostrarTablaMoneda] = useState(false);
    const [isRenderingTabla, setIsRenderingTabla] = useState(false);
    const [simulacionEnCurso, setSimulacionEnCurso] = useState(false);
    const [simulacionPausada, setSimulacionPausada] = useState(false);
    const [velocidadSimulacion, setVelocidadSimulacion] = useState('1x');
    const [progresoSimulacion, setProgresoSimulacion] = useState({ intentoActual: 0, exitosActuales: 0, ultimoResultado: null, animando: false });
    const simRef = useRef(null);
    const isPausadoRef = useRef(false);
    const resumeRef = useRef(null);
    const velocidadRef = useRef('1x');

    const [ordenWidgets, setOrdenWidgets] = useState(['w-frecuentista']);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;
        if (active.id !== over.id) {
            setOrdenWidgets((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const detenerSimulacion = () => {
        if (simRef.current) clearTimeout(simRef.current);
        setSimulacionEnCurso(false);
        setSimulacionPausada(false);
        isPausadoRef.current = false;
        setProgresoSimulacion({ intentoActual: 0, exitosActuales: 0, ultimoResultado: null, animando: false });
        setResSimulacionClasica(null);
        setHistorialSimClasica([]);
        setHistorialSimulacionMoneda([]);
        setMostrarTablaMoneda(false);
    };


    useEffect(() => {
        const handler = (e) => {
            if (dropdownColRef.current && !dropdownColRef.current.contains(e.target)) {
                setIsDropdownColOpen(false);
            }
            if (dropdownExpRef.current && !dropdownExpRef.current.contains(e.target)) {
                setIsDropdownExpOpen(false);
            }
            if (dropdownEventoRef.current && !dropdownEventoRef.current.contains(e.target)) {
                setIsDropdownEventoOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => {
            document.removeEventListener('mousedown', handler);
            if (simRef.current) clearTimeout(simRef.current);
        };
    }, []);



    const InlineMath = ({ math }) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const renderKatexValue = (val) => {
        if (val === undefined || val === null || val === '') return '-';
        const str = String(val).trim();
        const escaped = str.replace(/%/g, '\\%');
        if (/^[0-9.,\s\\%-]+$/.test(escaped)) {
            return <InlineMath math={escaped} />;
        }
        return <InlineMath math={`\\text{${escaped}}`} />;
    };
    const isFrec = tipo === 'frecuentista';
    const isCond = tipo === 'condicional';

    const getLabels = () => {
        if (isCond) {
            return {
                numerador: { text: "Probabilidad Conjunta ", math: "P(AB)" },
                denominador: { text: "Probabilidad de la Condición ", math: "P(B)" },
                tarjetaNumerador: { text: "Conjunta ", math: "P(AB)" },
                tarjetaDenominador: { text: "Condición ", math: "P(B)" }
            };
        }
        if (isFrec) {
            return {
                numerador: { text: "Frecuencia Absoluta ", math: "f" },
                denominador: { text: "Número Total de Veces ", math: "n" },
                tarjetaNumerador: { text: "Frecuencia ", math: "f" },
                tarjetaDenominador: { text: "Total ", math: "n" }
            };
        }
        return {
            numerador: { text: "Resultados Favorables al Evento E ", math: "k" },
            denominador: { text: "Resultados Posibles del Espacio Muestral ", math: "n" },
            tarjetaNumerador: { text: "Resultados Favorables ", math: "k" },
            tarjetaDenominador: { text: "Resultados Posibles ", math: "n" }
        };
    };

    const labels = getLabels();



    const nVal = parseFloat(manualN) || 0;
    const fVal = parseFloat(manualF) || 0;

    let errorManual = '';
    if (manualN === '' && manualF === '') {
        // Sin error inicial si están vacíos
    } else if (nVal <= 0) {
        errorManual = `${labels.denominador.text}${labels.denominador.math} debe ser mayor a 0.`;
    } else if (fVal < 0) {
        errorManual = `${labels.numerador.text}${labels.numerador.math} no puede ser menor a 0.`;
    } else if (fVal > nVal) {
        errorManual = `${labels.numerador.text}${labels.numerador.math} no puede ser mayor que el ${labels.denominador.text}${labels.denominador.math}.`;
    }

    if (!errorManual && isCond && (nVal > 1 || fVal > 1)) {
        errorManual = 'P(AB) y P(B) deben estar entre 0 y 1.';
    } else if (!errorManual && !isCond && (!Number.isSafeInteger(nVal) || !Number.isSafeInteger(fVal))) {
        errorManual = 'Ingresa cantidades enteras para los casos favorables y el total.';
    }

    const activeRes = resProbabilidad;

    const handleEjecutarSimulacion = () => {
        if (eventoFavorable.length === 0) {
            mostrarAlerta("Selecciona un evento de interés primero.", "Atención", "warning");
            return;
        }
        if (!inputDatos) {
            mostrarAlerta("No hay datos en el espacio muestral.", "Datos Faltantes", "warning");
            return;
        }

        let arr = inputDatos.split(',').map(d => d.trim()).filter(Boolean);
        if (varSeleccionada?.nombresColumnas?.length > 1 && colProbClasica) {
            const colIdx = varSeleccionada.nombresColumnas.indexOf(colProbClasica);
            if (colIdx !== -1) {
                arr = arr.map(row => {
                    const partes = row.split(' | ').map(p => p.trim());
                    return partes[colIdx];
                }).filter(Boolean);
            }
        }

        const totalIteraciones = parseInt(iteracionesN);
        if (!totalIteraciones || totalIteraciones <= 0) {
            mostrarAlerta("Ingresa el número de iteraciones (N) mayor a 0 para iniciar la simulación.", "Faltan Parámetros", "warning");
            return;
        }
        const favorablesTeoricos = arr.filter(v => eventoFavorable.includes(v)).length;
        const probTeorica = arr.length > 0 ? favorablesTeoricos / arr.length : 0;

        let contadorFavorables = 0;
        const history = [];
        const step = Math.max(1, Math.floor(totalIteraciones / 100));

        for (let i = 1; i <= totalIteraciones; i++) {
            const randomIndex = Math.floor(Math.random() * arr.length);
            if (eventoFavorable.includes(arr[randomIndex])) {
                contadorFavorables++;
            }
            if (i === totalIteraciones || i % step === 0) {
                history.push({
                    iteracion: i,
                    empirica: contadorFavorables / i,
                    teorica: probTeorica
                });
            }
        }

        setResultadoFrecuentista({
            f: contadorFavorables,
            N: totalIteraciones,
            probDecimal: (contadorFavorables / totalIteraciones).toFixed(4),
            probPorcentaje: ((contadorFavorables / totalIteraciones) * 100).toFixed(2),
            evento: eventoFavorable.join(', ')
        });
        setDatosSimulacion(history);
        setSimulacionActiva(true);
    };

    // Definición de opciones y metadatos para Simulación Clásica
    const OPCIONES_EXPERIMENTOS = [
        { value: 'moneda', label: 'Lanzar Moneda' },
        { value: 'dado', label: 'Lanzar Dado de 6 caras' },
        { value: 'baraja', label: 'Sacar Carta (Baraja 52)' }
    ];

    const getOpcionesEventos = (exp) => {
        if (exp === 'moneda') {
            return [
                { value: 'cara', label: 'Cara' },
                { value: 'cruz', label: 'Cruz' }
            ];
        }
        if (exp === 'dado') {
            return [
                { value: '1', label: 'Sacar 1' },
                { value: '2', label: 'Sacar 2' },
                { value: '3', label: 'Sacar 3' },
                { value: '4', label: 'Sacar 4' },
                { value: '5', label: 'Sacar 5' },
                { value: '6', label: 'Sacar 6' },
                { value: 'par', label: 'Número Par (2, 4, 6)' },
                { value: 'impar', label: 'Número Impar (1, 3, 5)' }
            ];
        }
        if (exp === 'baraja') {
            return [
                { value: 'roja', label: 'Carta Roja (Corazones o Diamantes)' },
                { value: 'negra', label: 'Carta Negra (Tréboles o Picas)' },
                { value: 'corazones', label: 'Corazones' },
                { value: 'diamantes', label: 'Diamantes' },
                { value: 'treboles', label: 'Tréboles' },
                { value: 'espadas', label: 'Espadas' },
                { value: 'as', label: 'Un As' },
                { value: 'rey', label: 'Un Rey (K)' },
                { value: 'reina', label: 'Una Reina (Q)' },
                { value: 'jota', label: 'Una Jota (J)' }
            ];
        }
        return [];
    };

    const handleEjecutarSimulacionClasica = () => {
        if (!experimentoClasico || !eventoClasico) {
            mostrarAlerta("Selecciona un experimento y un evento de interés para comenzar.", "Faltan Parámetros", "warning");
            return;
        }

        const N = parseInt(iteracionesClasica);
        if (!N || N <= 0) {
            mostrarAlerta("Ingresa el número de repeticiones (N) mayor a 0 para iniciar la simulación.", "Faltan Parámetros", "warning");
            return;
        }
        const { casosFavorables, totalPosibles, pTeorica } = obtenerProbabilidadTeorica(experimentoClasico, eventoClasico);

        setSimulacionEnCurso(true);
        setSimulacionPausada(false);
        isPausadoRef.current = false;
        resumeRef.current = null;
        setHistorialSimClasica([]);
        setHistorialSimulacionMoneda([]);
        setResSimulacionClasica(null);
        setProgresoSimulacion({ intentoActual: 0, exitosActuales: 0, ultimoResultado: null, animando: true });

        const history = [];
        let exitosAcumulados = 0;
        let iteracionActual = 0;

        const calcularPaso = () => {
            const { esExito, resVisible } = simularUnPaso(experimentoClasico, eventoClasico);
            if (esExito) exitosAcumulados++;
            return { esExito, resVisible };
        };

        const simularLoop = () => {
            if (isPausadoRef.current) return;

            const v = velocidadRef.current;
            let target = iteracionActual + 1;
            let delay = 1000;
            let isMax = false;

            if (v === '1x') delay = 1000;
            else if (v === '2x') delay = 500;
            else if (v === '4x') delay = 250;
            else if (v === 'MAX') {
                const chunkSize = Math.max(1, Math.floor(N / 50));
                target = Math.min(N, iteracionActual + chunkSize);
                delay = 16;
                isMax = true;
            }

            let ultimoRes = null;
            const stepHist = Math.max(1, Math.floor(N / 100));
            const historyMonedaLocal = [];

            for (; iteracionActual < target; iteracionActual++) {
                const { esExito, resVisible } = calcularPaso();
                ultimoRes = resVisible;

                if (!isMax || (iteracionActual + 1) === N || (iteracionActual + 1) % stepHist === 0) {
                    history.push({
                        intento: iteracionActual + 1,
                        empirica: exitosAcumulados / (iteracionActual + 1),
                        teorica: pTeorica
                    });
                }

                if (experimentoClasico === 'moneda' || experimentoClasico === 'dado' || experimentoClasico === 'baraja') {
                    historyMonedaLocal.push({
                        intento: iteracionActual + 1,
                        resultadoObtenido: resVisible,
                        esExito: esExito,
                        exitosAcumulados: exitosAcumulados,
                        probabilidadAcumulada: exitosAcumulados / (iteracionActual + 1)
                    });
                }
            }

            setHistorialSimClasica([...history]);
            if ((experimentoClasico === 'moneda' || experimentoClasico === 'dado' || experimentoClasico === 'baraja') && historyMonedaLocal.length > 0) {
                setHistorialSimulacionMoneda(prev => [...prev, ...historyMonedaLocal]);
            }

            if (isMax) {
                setProgresoSimulacion({
                    intentoActual: iteracionActual,
                    exitosActuales: exitosAcumulados,
                    ultimoResultado: ultimoRes,
                    animando: true
                });
            } else {
                setProgresoSimulacion({
                    intentoActual: iteracionActual,
                    exitosActuales: exitosAcumulados,
                    ultimoResultado: 'girando...',
                    animando: true
                });

                setTimeout(() => {
                    if (isPausadoRef.current) return;
                    setProgresoSimulacion(prev => ({
                        ...prev,
                        ultimoResultado: ultimoRes,
                        animando: false
                    }));
                }, delay * 0.5);
            }

            const currentProbSimulada = iteracionActual > 0 ? exitosAcumulados / iteracionActual : 0;
            const currentMargenError = pTeorica > 0 ? Math.abs((pTeorica - currentProbSimulada) / pTeorica) * 100 : 0;

            setResSimulacionClasica({
                teorica: pTeorica,
                exitos: exitosAcumulados,
                repeticiones: iteracionActual,
                simulada: currentProbSimulada,
                error: currentMargenError
            });

            if (iteracionActual >= N) {
                finalizarSimulacion();
            } else {
                simRef.current = setTimeout(simularLoop, delay);
            }
        };
        resumeRef.current = simularLoop;
        simularLoop();

        const finalizarSimulacion = () => {
            setSimulacionEnCurso(false);
            setSimulacionPausada(false);
            isPausadoRef.current = false;
            setProgresoSimulacion(prev => ({ ...prev, animando: false }));

            const probSimulada = exitosAcumulados / N;
            const margenError = pTeorica > 0 ? Math.abs((pTeorica - probSimulada) / pTeorica) * 100 : 0;

            setResSimulacionClasica({
                teorica: pTeorica,
                exitos: exitosAcumulados,
                repeticiones: N,
                simulada: probSimulada,
                error: margenError
            });
        };
    };

    // Renderizar KaTeX localmente para modo manual y modo matriz
    useEffect(() => {
        if (formulaProbRef.current) {
            if (tipo === 'clasica' && inputMode === 'simulacion' && resSimulacionClasica) {
                const { teorica, exitos, repeticiones, simulada } = resSimulacionClasica;
                const latex = `\\begin{aligned} P(\\text{Teórica}) &\\approx ${teorica.toFixed(4)} \\\\ P(\\text{Simulada}) &= \\dfrac{${exitos}}{${repeticiones}} = ${simulada.toFixed(4)} \\end{aligned}`;
                try {
                    katex.render(latex, formulaProbRef.current, { throwOnError: false, displayMode: true });
                } catch (e) {
                    console.error("Error al renderizar KaTeX:", e);
                }
                return;
            }

            if (isFrec && resultadoFrecuentista && inputMode === 'simulacion') {
                const latex = `P(E)=\\dfrac{f}{N}=\\dfrac{${resultadoFrecuentista.f}}{${resultadoFrecuentista.N}}=${resultadoFrecuentista.probDecimal}`;
                try {
                    katex.render(latex, formulaProbRef.current, { throwOnError: false, displayMode: true });
                } catch (e) {
                    console.error("Error al renderizar KaTeX:", e);
                }
                return;
            }

            if (activeRes) {
                let latex = '';
                if (inputMode === 'manual') {
                    if (isCond) {
                        latex = `P(A|B)=\\dfrac{P(AB)}{P(B)}=\\dfrac{${activeRes.casosFavorables}}{${activeRes.casosTotales}}=${activeRes.probabilidadDecimal}`;
                    } else if (isFrec) {
                        latex = `P(E)=\\dfrac{f}{n}=\\dfrac{${activeRes.casosFavorables}}{${activeRes.casosTotales}}=${activeRes.probabilidadDecimal}`;
                    } else {
                        latex = `P(E)=\\dfrac{k}{n}=\\dfrac{${activeRes.casosFavorables}}{${activeRes.casosTotales}}=${activeRes.probabilidadDecimal}`;
                    }
                } else {
                    if (isFrec) {
                        latex = `P(E)=\\dfrac{f}{n}=\\dfrac{${activeRes.casosFavorables}}{${activeRes.casosTotales}}=${activeRes.probabilidadDecimal}`;
                    } else if (isCond) {
                        latex = `P(A|B)=\\dfrac{P(AB)}{P(B)}=\\dfrac{${activeRes.casosFavorables}}{${activeRes.casosTotales}}=${activeRes.probabilidadDecimal}`;
                    } else if (tipo === 'total') {
                        latex = `P(A) = \\sum_{i} P(A|B_i)P(B_i) = ${activeRes.probabilidadDecimal}`;
                    } else {
                        latex = `P(E)=\\dfrac{k}{n}=\\dfrac{${activeRes.casosFavorables}}{${activeRes.casosTotales}}=${activeRes.probabilidadDecimal}`;
                    }
                }
                try {
                    katex.render(latex, formulaProbRef.current, { throwOnError: false, displayMode: true });
                } catch (e) {
                    console.error("Error al renderizar KaTeX:", e);
                }
            }
        }
    }, [activeRes, inputMode, tipo, formulaProbRef, isFrec, isCond, resultadoFrecuentista]);

    return (
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column' }}>
            {/* SELECTOR DE MODO DE ENTRADA */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <div id="tour-mat251-modos-entrada" className="contenedor-selector-modos-mat251 mat251-probabilidad-selector-modos">
                    <button
                        type="button"
                        className={`btn-mat251-modo ${inputMode === 'matriz' ? 'active' : ''}`}
                        disabled={bloquearModos && inputMode !== 'matriz'}
                        title={bloquearModos && inputMode !== 'matriz' ? 'El modo está fijado por el historial' : undefined}
                        onClick={() => { if (!bloquearModos) setInputMode('matriz'); }}
                        style={{ fontFamily: FONT }}
                    >
                        Análisis de Matriz
                    </button>
                    {(isFrec || tipo === 'clasica') && (
                        <button
                            type="button"
                            className={`btn-mat251-modo ${inputMode === 'simulacion' ? 'active' : ''}`}
                            disabled={bloquearModos && inputMode !== 'simulacion'}
                            title={bloquearModos && inputMode !== 'simulacion' ? 'El modo está fijado por el historial' : undefined}
                            onClick={() => {
                                if (bloquearModos) return;
                                setInputMode('simulacion');
                                if (tipo === 'clasica' && setColProbClasica) {
                                    setColProbClasica('');
                                    if (setEventoFavorable) setEventoFavorable([]);
                                }
                            }}
                            style={{ fontFamily: FONT }}
                        >
                            Simulación
                        </button>
                    )}
                    <button
                        type="button"
                        className={`btn-mat251-modo ${inputMode === 'manual' ? 'active' : ''}`}
                        disabled={bloquearModos && inputMode !== 'manual'}
                        title={bloquearModos && inputMode !== 'manual' ? 'El modo está fijado por el historial' : undefined}
                        onClick={() => { if (!bloquearModos) setInputMode('manual'); }}
                        style={{ fontFamily: FONT }}
                    >
                        Modo Manual
                    </button>
                    {tipo === 'clasica' && (
                        <button
                            type="button"
                            className={`btn-mat251-modo ${inputMode === 'experimentos' ? 'active' : ''}`}
                            disabled={bloquearModos && inputMode !== 'experimentos'}
                            title={bloquearModos && inputMode !== 'experimentos' ? 'El modo está fijado por el historial' : undefined}
                            onClick={() => { if (!bloquearModos) setInputMode('experimentos'); }}
                            style={{ fontFamily: FONT }}
                        >
                            Experimentos
                        </button>
                    )}
                </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
                {inputMode === 'experimentos' ? (
                    <ExperimentosInteractivos
                        filas={filas}
                        varSeleccionada={varSeleccionada}
                        abrirEditor={abrirEditor}
                        onResultadoExperimento={onResultadoExperimento}
                        estadoRestaurar={experimentoRestaurar}
                        bloquearTipo={bloquearModos}
                    />
                ) : inputMode === 'manual' ? (
                    /* INTERFAZ PARA MODO MANUAL */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '15px' }}>
                        <h4 style={{ marginBottom: '5px', fontSize: FS.sm, fontWeight: 'bold', color: 'var(--text-pure)' }}>Datos del Ejercicio</h4>
                        <div className="panel-inputs" style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', marginTop: 0, marginBottom: '15px', background: 'var(--bg-input)', padding: '20px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                            <div id="tour-mat251-manual-numerador" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '250px' }}>
                                <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0 }}>{labels.numerador.text.trim()}</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: FS.md, color: 'var(--text-main)', whiteSpace: 'nowrap' }}><InlineMath math={labels.numerador.math} />:</span>
                                    <input
                                        type="number"
                                        min="0"
                                        max={isCond ? 1 : undefined}
                                        step={isCond ? 'any' : 1}
                                        placeholder={isCond ? "Ej: 0.2" : "Ej: 5"}
                                        className="input-mat251 placeholder-small"
                                        value={manualF}
                                        onChange={(e) => setManualF(e.target.value)}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: RADIUS,
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-card)',
                                            color: 'var(--text-color)',
                                            fontSize: FS.sm,
                                            outline: 'none',
                                            fontFamily: FONT,
                                            width: '100%',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>
                            <div id="tour-mat251-manual-denominador" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '250px' }}>
                                <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0 }}>{labels.denominador.text.trim()}</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: FS.md, color: 'var(--text-main)', whiteSpace: 'nowrap' }}><InlineMath math={labels.denominador.math} />:</span>
                                    <input
                                        type="number"
                                        min={isCond ? 0 : 1}
                                        max={isCond ? 1 : undefined}
                                        step={isCond ? 'any' : 1}
                                        placeholder={isCond ? "Ej: 0.5" : "Ej: 10"}
                                        className="input-mat251 placeholder-small"
                                        value={manualN}
                                        onChange={(e) => setManualN(e.target.value)}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: RADIUS,
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-card)',
                                            color: 'var(--text-color)',
                                            fontSize: FS.sm,
                                            outline: 'none',
                                            fontFamily: FONT,
                                            width: '100%',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        {errorManual && (
                            <div style={{ color: '#ef4444', fontSize: FS.xs, fontWeight: 600, marginTop: '-5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <IconoAlerta width="14" height="14" />
                                {errorManual}
                            </div>
                        )}
                        <button type="button" id="tour-mat251-btn-calcular" className="button_calcular"
                            onClick={ejecutar}
                            style={{ width: 'fit-content', alignSelf: 'center', padding: '5px 20px', borderRadius: RADIUS, fontSize: FS.md, fontWeight: 600, fontFamily: FONT }}>
                            CALCULAR
                        </button>
                    </div>
                ) : inputMode === 'simulacion' && tipo === 'clasica' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '0px' }}>
                        <h4 style={{ marginBottom: '5px', fontSize: FS.sm, fontWeight: 'bold', color: 'var(--text-pure)', fontFamily: FONT }}>Configuración:</h4>
                        <div className="panel-inputs" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: 0, marginBottom: '5px', background: 'var(--bg-card)', padding: '10px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                            {/* Selector personalizado de Experimento */}
                            <div id="tour-sim-selector-exp" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '200px' }}>
                                <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0 }}>Experimento</label>
                                <div ref={dropdownExpRef} style={{ position: 'relative', width: '100%', fontFamily: FONT }}>
                                    {(() => {
                                        const expSeleccionado = OPCIONES_EXPERIMENTOS.find(o => o.value === experimentoClasico);
                                        return (
                                            <>
                                                <div
                                                    onClick={() => {
                                                        if (!simulacionEnCurso) {
                                                            setIsDropdownExpOpen(prev => !prev);
                                                            setIsDropdownEventoOpen(false);
                                                        }
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '8px 12px',
                                                        background: 'var(--bg-input)',
                                                        border: `1px solid ${isDropdownExpOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                                        borderRadius: RADIUS,
                                                        cursor: simulacionEnCurso ? 'not-allowed' : 'pointer',
                                                        opacity: simulacionEnCurso ? 0.6 : 1,
                                                        boxShadow: isDropdownExpOpen ? '0 0 0 3px rgba(37,99,235,0.15)' : 'none',
                                                        transition: 'all 0.2s ease',
                                                        color: 'var(--text-pure)',
                                                        userSelect: 'none',
                                                        minHeight: '38px',
                                                        boxSizing: 'border-box'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                                                        <span style={{ fontSize: FS.sm, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: expSeleccionado ? 'var(--text-pure)' : 'var(--text-muted)' }}>
                                                            {expSeleccionado ? expSeleccionado.label : '-- Seleccionar --'}
                                                        </span>
                                                    </div>
                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        style={{
                                                            transform: isDropdownExpOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                            transition: 'transform 0.2s ease',
                                                            color: 'var(--text-muted)',
                                                            flexShrink: 0,
                                                            marginLeft: '8px'
                                                        }}
                                                    >
                                                        <polyline points="6 9 12 15 18 9" />
                                                    </svg>
                                                </div>

                                                {isDropdownExpOpen && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: 'calc(100% + 4px)',
                                                            left: 0,
                                                            right: 0,
                                                            background: 'var(--bg-card)',
                                                            border: '1px solid var(--border-color)',
                                                            borderRadius: RADIUS,
                                                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                                                            zIndex: 1000,
                                                            overflow: 'hidden',
                                                            animation: 'fadeInDropdown 0.2s ease',
                                                        }}
                                                    >
                                                        {OPCIONES_EXPERIMENTOS.map(opt => {
                                                            const isSelected = opt.value === experimentoClasico;
                                                            return (
                                                                <div
                                                                    key={opt.value}
                                                                    onClick={() => {
                                                                        detenerSimulacion();
                                                                        setExperimentoClasico(opt.value);
                                                                        setEventoClasico('');
                                                                        setIsDropdownExpOpen(false);
                                                                    }}
                                                                    style={{
                                                                        padding: '9px 12px',
                                                                        cursor: 'pointer',
                                                                        fontSize: FS.sm,
                                                                        color: isSelected ? 'var(--primary-color)' : 'var(--text-pure)',
                                                                        background: isSelected ? 'rgba(37,99,235,0.08)' : 'transparent',
                                                                        transition: 'background 0.15s ease',
                                                                        fontWeight: isSelected ? 600 : 400,
                                                                        fontFamily: FONT
                                                                    }}
                                                                    onMouseEnter={e => {
                                                                        if (!isSelected) e.currentTarget.style.background = 'var(--bg-input, rgba(0,0,0,0.04))';
                                                                    }}
                                                                    onMouseLeave={e => {
                                                                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                                                                    }}
                                                                >
                                                                    <span>{opt.label}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Selector personalizado de Evento de Interés */}
                            <div id="tour-sim-selector-evento" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '200px' }}>
                                <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0 }}>Evento de Interés</label>
                                <div ref={dropdownEventoRef} style={{ position: 'relative', width: '100%', fontFamily: FONT }}>
                                    {(() => {
                                        const opcionesEventos = getOpcionesEventos(experimentoClasico);
                                        const eventoSeleccionado = opcionesEventos.find(o => o.value === eventoClasico);
                                        const deshabilitado = !experimentoClasico || simulacionEnCurso;

                                        return (
                                            <>
                                                <div
                                                    onClick={() => {
                                                        if (!deshabilitado) {
                                                            setIsDropdownEventoOpen(prev => !prev);
                                                            setIsDropdownExpOpen(false);
                                                        }
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '8px 12px',
                                                        background: 'var(--bg-input)',
                                                        border: `1px solid ${isDropdownEventoOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                                        borderRadius: RADIUS,
                                                        cursor: deshabilitado ? 'not-allowed' : 'pointer',
                                                        opacity: deshabilitado ? 0.6 : 1,
                                                        boxShadow: isDropdownEventoOpen ? '0 0 0 3px rgba(37,99,235,0.15)' : 'none',
                                                        transition: 'all 0.2s ease',
                                                        color: 'var(--text-pure)',
                                                        userSelect: 'none',
                                                        minHeight: '38px',
                                                        boxSizing: 'border-box'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                                                        <span style={{ fontSize: FS.sm, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: eventoSeleccionado ? 'var(--text-pure)' : 'var(--text-muted)' }}>
                                                            {eventoSeleccionado ? eventoSeleccionado.label : (
                                                                experimentoClasico ? '-- Seleccionar --' : '-- Selecciona experimento primero --'
                                                            )}
                                                        </span>
                                                    </div>
                                                    <svg
                                                        width="16"
                                                        height="16"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        style={{
                                                            transform: isDropdownEventoOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                            transition: 'transform 0.2s ease',
                                                            color: 'var(--text-muted)',
                                                            flexShrink: 0,
                                                            marginLeft: '8px'
                                                        }}
                                                    >
                                                        <polyline points="6 9 12 15 18 9" />
                                                    </svg>
                                                </div>

                                                {isDropdownEventoOpen && opcionesEventos.length > 0 && (
                                                    <div
                                                        style={{
                                                            position: 'absolute',
                                                            top: 'calc(100% + 4px)',
                                                            left: 0,
                                                            right: 0,
                                                            background: 'var(--bg-card)',
                                                            border: '1px solid var(--border-color)',
                                                            borderRadius: RADIUS,
                                                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                                                            zIndex: 1000,
                                                            maxHeight: '260px',
                                                            overflowY: 'auto',
                                                            animation: 'fadeInDropdown 0.2s ease',
                                                        }}
                                                    >
                                                        {opcionesEventos.map(opt => {
                                                            const isSelected = opt.value === eventoClasico;
                                                            return (
                                                                <div
                                                                    key={opt.value}
                                                                    onClick={() => {
                                                                        detenerSimulacion();
                                                                        setEventoClasico(opt.value);
                                                                        setIsDropdownEventoOpen(false);
                                                                    }}
                                                                    style={{
                                                                        padding: '9px 12px',
                                                                        cursor: 'pointer',
                                                                        fontSize: FS.sm,
                                                                        color: isSelected ? 'var(--primary-color)' : 'var(--text-pure)',
                                                                        background: isSelected ? 'rgba(37,99,235,0.08)' : 'transparent',
                                                                        transition: 'background 0.15s ease',
                                                                        fontWeight: isSelected ? 600 : 400,
                                                                        fontFamily: FONT
                                                                    }}
                                                                    onMouseEnter={e => {
                                                                        if (!isSelected) e.currentTarget.style.background = 'var(--bg-input, rgba(0,0,0,0.04))';
                                                                    }}
                                                                    onMouseLeave={e => {
                                                                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                                                                    }}
                                                                >
                                                                    <span>{opt.label}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div id="tour-sim-repeticiones" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '200px' }}>
                                <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0 }}>Repeticiones (<InlineMath math="N" />)</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Ej: 100"
                                    className="input-mat251 placeholder-small"
                                    value={iteracionesClasica}
                                    onChange={(e) => {
                                        detenerSimulacion();
                                        setIteracionesClasica(e.target.value);
                                    }}
                                    style={{ padding: '8px 12px', minHeight: '38px', borderRadius: RADIUS, border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-pure)', fontSize: FS.sm, outline: 'none', fontFamily: FONT, width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                            <button
                                id="tour-sim-btn-iniciar"
                                type="button"
                                onClick={handleEjecutarSimulacionClasica}
                                disabled={simulacionEnCurso}
                                className="button_calcular"
                                style={{ width: 'fit-content', padding: '5px 20px', borderRadius: RADIUS, fontSize: FS.md, fontWeight: 600, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: simulacionEnCurso ? 0.6 : 1, cursor: simulacionEnCurso ? 'not-allowed' : 'pointer' }}
                            >
                                {simulacionEnCurso ? 'SIMULANDO...' : 'INICIAR SIMULACIÓN'}
                            </button>
                        </div>

                        {(simulacionEnCurso || progresoSimulacion.intentoActual > 0) && (
                            <div style={{
                                marginTop: '10px',
                                padding: 0,
                                background: 'transparent',
                                border: 'none',
                                position: 'relative',
                            }}>
                                <style>{`
                                    @keyframes anim-spin { 100% { transform: rotate(360deg); } }
                                    @keyframes anim-flip { 100% { transform: rotateY(360deg); } }
                                `}</style>

                                {/* Progress Bar Track & Fill */}
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', overflow: 'hidden', borderRadius: '3px', background: 'var(--border-color)' }}>
                                    <div style={{ height: '100%', background: 'var(--primary-color)', width: `${Math.min(100, (progresoSimulacion.intentoActual / Math.max(1, parseInt(iteracionesClasica) || 1)) * 100)}%`, borderRadius: '3px', transition: 'width 0.1s linear' }} />
                                </div>

                                {/* TOP SECTION: Lanzamiento and Controls */}
                                <div id="tour-sim-progreso-controles" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '10px', marginBottom: '20px' }}>
                                    <span className="texto-lanzamiento-simulacion" style={{ fontSize: FS.sm, fontWeight: 700, color: 'var(--text-pure)', fontFamily: FONT }}>Lanzamiento: {progresoSimulacion.intentoActual} / {parseInt(iteracionesClasica) || 0}</span>

                                    <div className="controles-simulacion-movil" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'nowrap', justifyContent: 'center' }}>
                                        {/* Speed Controls */}
                                        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', padding: '3px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                                            {['1x', '2x', '4x', 'MAX'].map(vel => (
                                                <button
                                                    key={vel}
                                                    type="button"
                                                    onClick={() => {
                                                        setVelocidadSimulacion(vel);
                                                        velocidadRef.current = vel;
                                                    }}
                                                    style={{
                                                        background: velocidadSimulacion === vel ? 'var(--primary-color)' : 'transparent',
                                                        color: velocidadSimulacion === vel ? '#fff' : 'var(--text-muted)',
                                                        border: 'none', borderRadius: RADIUS, padding: '2px 8px', cursor: 'pointer', fontSize: '0.65rem',
                                                        fontWeight: 800, fontFamily: FONT, transition: 'all 0.2s', boxShadow: velocidadSimulacion === vel ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                                    }}
                                                >
                                                    {vel}
                                                </button>
                                            ))}
                                        </div>

                                        {simulacionEnCurso && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (simulacionPausada) {
                                                        isPausadoRef.current = false;
                                                        setSimulacionPausada(false);
                                                        if (resumeRef.current) resumeRef.current();
                                                    } else {
                                                        isPausadoRef.current = true;
                                                        setSimulacionPausada(true);
                                                        if (simRef.current) clearTimeout(simRef.current);
                                                    }
                                                }}
                                                style={{
                                                    background: simulacionPausada ? '#10b981' : '#f59e0b',
                                                    color: '#fff', border: 'none', borderRadius: RADIUS,
                                                    padding: '4px 12px', cursor: 'pointer', fontSize: FS.xs,
                                                    fontFamily: FONT,
                                                    fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px',
                                                    transition: 'background 0.2s', minWidth: '105px', justifyContent: 'center', whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {simulacionPausada ? (
                                                    <>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                                        </svg>
                                                        CONTINUAR
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <rect x="6" y="4" width="4" height="16"></rect>
                                                            <rect x="14" y="4" width="4" height="16"></rect>
                                                        </svg>
                                                        PAUSAR
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* MIDDLE SECTION: Coin and Side Cards */}
                                <div id="tour-sim-comparacion" className="contenedor-simulacion-clasica">
                                    {/* Left Side: Probabilidad Teórica */}
                                    <div className="col-simulacion-lateral">
                                        {resSimulacionClasica && (
                                            <div className="tarjeta-probabilidad" style={{ textAlign: 'center', background: 'var(--bg-input)', padding: '15px 10px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                                                <p className="tarjeta-prob-titulo" style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-pure)', fontWeight: 'bold', fontFamily: FONT }}>PROB. TEÓRICA</p>
                                                <div className="tarjeta-prob-valor" style={{ margin: '5px 0 0', fontSize: '0.9rem', color: 'var(--text-pure)', fontWeight: 'normal' }}>{renderKatexValue(`${(resSimulacionClasica.teorica * 100).toFixed(2)}%`)}</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Center: Coin Icon */}
                                    <div className="col-simulacion-centro">
                                        <div style={{
                                            width: experimentoClasico === 'baraja' ? '100px' : '80px',
                                            height: experimentoClasico === 'baraja' ? '140px' : '80px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: 'transparent',
                                            animation: (progresoSimulacion.animando && !simulacionPausada) ? (experimentoClasico === 'dado' ? 'anim-spin 0.3s linear infinite' : 'anim-flip 0.3s linear infinite') : 'none',
                                            transition: 'transform 0.2s'
                                        }}>
                                            {(!progresoSimulacion.animando || simulacionPausada) && progresoSimulacion.ultimoResultado && progresoSimulacion.ultimoResultado !== 'girando...' ? (
                                                experimentoClasico === 'dado' ? (
                                                    <div style={{ width: '80%', height: '80%' }}><DadoSVG valor={progresoSimulacion.ultimoResultado} /></div>
                                                ) : experimentoClasico === 'moneda' ? (
                                                    <div style={{ width: '80%', height: '80%' }}><MonedaSVG valor={progresoSimulacion.ultimoResultado} /></div>
                                                ) : (
                                                    <div style={{ width: '80%', height: '80%' }}><CartaSVG valor={progresoSimulacion.ultimoResultado} /></div>
                                                )
                                            ) : (
                                                experimentoClasico === 'dado' ? <div style={{ width: '80%', height: '80%' }}><DadoSVG valor={6} /></div> :
                                                    experimentoClasico === 'moneda' ? <div style={{ width: '80%', height: '80%' }}><MonedaSVG valor={'cara'} /></div> : (
                                                        <div style={{ width: '80%', height: '80%' }}><CartaSVG valor={null} /></div>
                                                    )
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Side: Probabilidad Simulada */}
                                    <div className="col-simulacion-lateral right-side">
                                        {resSimulacionClasica && (
                                            <div className="tarjeta-probabilidad" style={{ textAlign: 'center', background: 'var(--bg-input)', padding: '15px 10px', borderRadius: RADIUS, border: '1px solid var(--border-color)', width: '100%' }}>
                                                <p className="tarjeta-prob-titulo" style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-pure)', fontWeight: 'bold', fontFamily: FONT }}>PROB. SIMULADA</p>
                                                <div className="tarjeta-prob-valor" style={{ margin: '5px 0 0', fontSize: '0.9rem', color: 'var(--text-pure)', fontWeight: 'normal' }}>{renderKatexValue(`${(resSimulacionClasica.simulada * 100).toFixed(2)}%`)}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* BOTTOM SECTION: Resultados and Exitos */}
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                                    <div className="texto-resultado-simulacion" style={{ fontSize: FS.md, fontWeight: 800, color: 'var(--text-pure)', minHeight: '24px', textAlign: 'center', fontFamily: FONT }}>
                                        {progresoSimulacion.ultimoResultado ? (
                                            progresoSimulacion.ultimoResultado === 'girando...' ? 'Girando...' :
                                                simulacionEnCurso ? `Resultado: ${progresoSimulacion.ultimoResultado}` : `Último resultado: ${progresoSimulacion.ultimoResultado}`
                                        ) : 'Preparando...'}
                                    </div>

                                    {resSimulacionClasica && (
                                        <div id="tour-sim-exitos" className="bloque-exitos-simulacion" style={{ textAlign: 'center' }}>
                                            <p className="titulo-exitos-simulacion" style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-pure)', fontWeight: 'bold', fontFamily: FONT }}>ÉXITOS OBTENIDOS</p>
                                            <div className="valor-exitos-simulacion" style={{ margin: '5px 0 0', fontSize: '1.3rem', color: 'var(--text-pure)', fontWeight: 'normal' }}>{renderKatexValue(resSimulacionClasica.exitos)}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Nuevas métricas empíricas */}
                                {resSimulacionClasica && (
                                    <div id="tour-sim-metricas-empiricas" className="grid-metricas-empiricas" style={{ borderTop: 'none' }}>
                                        <div className="tarjeta-metrica-empirica">
                                            <p className="titulo-metrica-empirica" style={{ fontFamily: FONT, color: 'var(--text-pure)' }}><span>Esperanza Empírica</span> <InlineMath math="E(X)" /></p>
                                            <div className="valor-metrica-empirica" style={{ color: 'var(--text-pure)', fontWeight: 'normal' }}>
                                                {renderKatexValue(resSimulacionClasica.simulada.toFixed(4))}
                                            </div>
                                        </div>
                                        <div className="tarjeta-metrica-empirica">
                                            <p className="titulo-metrica-empirica" style={{ fontFamily: FONT, color: 'var(--text-pure)' }}><span>Varianza Empírica</span> <InlineMath math="V(X)" /></p>
                                            <div className="valor-metrica-empirica" style={{ color: 'var(--text-pure)', fontWeight: 'normal' }}>
                                                {renderKatexValue((resSimulacionClasica.simulada * (1 - resSimulacionClasica.simulada)).toFixed(4))}
                                            </div>
                                        </div>
                                        <div className="tarjeta-metrica-empirica">
                                            <p className="titulo-metrica-empirica" style={{ fontFamily: FONT, color: 'var(--text-pure)' }}><span>Desviación Estándar</span> <InlineMath math={'\\sigma'} /></p>
                                            <div className="valor-metrica-empirica" style={{ color: 'var(--text-pure)', fontWeight: 'normal' }}>
                                                {renderKatexValue(Math.sqrt(resSimulacionClasica.simulada * (1 - resSimulacionClasica.simulada)).toFixed(4))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    /* INTERFAZ PARA MODO MATRIZ */
                    <>
                        <div id="tour-mat251-espacio-muestral" style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <div>
                                <span style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)' }}>Datos:</span>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                                    <small title="Datos provenientes de variables externas" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                        Cargados: <strong style={{ color: 'var(--text-pure)' }}>{statsDatos.cargados}</strong>
                                    </small>
                                    <small title="Datos ingresados manualmente" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                        Agregados: <strong style={{ color: 'var(--text-pure)' }}>{statsDatos.agregados}</strong>
                                    </small>
                                    <small title="Total de datos válidos" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                        Total: <strong style={{ color: 'var(--text-pure)' }}>{statsDatos.total}</strong>
                                    </small>
                                </div>
                            </div>
                            <button
                                onClick={abrirEditor}
                                className="btn-primary"
                                style={{ padding: '5px 14px', fontSize: FS.sm, fontFamily: FONT }}
                            >
                                <EditarDatos />
                                Editar Datos
                            </button>
                        </div>

                        {/* Selector de Columna (Solo si hay múltiples columnas y no es condicional) */}
                        {!isCond && varSeleccionada?.nombresColumnas && varSeleccionada.nombresColumnas.length > 1 && (
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ ...labelStyle, color: 'var(--text-pure)', fontSize: FS.sm, marginBottom: '6px' }}>Columna a analizar:</label>
                                <div ref={dropdownColRef} style={{ position: 'relative', width: '100%', fontFamily: FONT }}>
                                    <div
                                        onClick={() => setIsDropdownColOpen(!isDropdownColOpen)}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '8px 12px',
                                            background: 'var(--bg-card)',
                                            border: `1px solid ${isDropdownColOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                            borderRadius: RADIUS, cursor: 'pointer',
                                            boxShadow: isDropdownColOpen ? '0 0 0 3px rgba(255, 110, 0, 0.15)' : 'none',
                                            transition: 'all 0.2s ease',
                                            color: 'var(--text-color)',
                                            userSelect: 'none',
                                        }}
                                    >
                                        <span style={{ fontSize: FS.sm, fontWeight: 500, color: colProbClasica ? 'var(--text-color)' : 'var(--text-muted)' }}>
                                            {colProbClasica || '-- Selecciona una columna --'}
                                        </span>
                                        <svg style={{ transform: isDropdownColOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                    </div>

                                    {isDropdownColOpen && (
                                        <div style={{
                                            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: RADIUS,
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                                            zIndex: 1000,
                                            overflow: 'hidden'
                                        }}>
                                            {varSeleccionada.nombresColumnas.map((colName, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => {
                                                        setColProbClasica(colName);
                                                        if (setEventoFavorable) setEventoFavorable([]);
                                                        if (setResProbabilidad) setResProbabilidad(null);
                                                        setIsDropdownColOpen(false);
                                                    }}
                                                    style={{
                                                        padding: '10px 12px',
                                                        cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        background: 'transparent',
                                                        borderBottom: idx < varSeleccionada.nombresColumnas.length - 1 ? '1px solid var(--border-color)' : 'none',
                                                        color: colProbClasica === colName ? 'var(--primary-color)' : 'var(--text-color)',
                                                        fontSize: FS.sm,
                                                        fontWeight: colProbClasica === colName ? 600 : 400
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (colProbClasica !== colName) e.currentTarget.style.background = 'var(--bg-body)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (colProbClasica !== colName) e.currentTarget.style.background = 'transparent';
                                                    }}
                                                >
                                                    {colName}
                                                    {colProbClasica === colName && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Contenedor Responsivo para Eventos A y B */}
                        <div className="grid-resultados-probabilidad">
                            {/* Evento Condicion (Solo Condicional) */}
                            {isCond && (
                                <div id="tour-mat251-evento-condicion" style={{ ...cardStyle, marginBottom: '15px', display: 'flex', flexDirection: 'column' }}>
                                    <label style={{ ...labelStyle, color: 'var(--text-pure)' }}>Condición Dada (Evento <InlineMath math="B" />):</label>
                                    {statsEventos.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
                                            <button
                                                className="btn-primary"
                                                onClick={() => {
                                                    detenerSimulacion();
                                                    setModalCondicion(true);
                                                }}
                                                style={{ alignSelf: 'center', padding: '5px 14px', fontSize: FS.sm, fontFamily: FONT, borderRadius: RADIUS, fontWeight: 600 }}
                                            >
                                                <ModificarSeleccion />
                                                {eventoCondicion.length > 0 ? 'Modificar Condición' : 'Configurar Evento B'}
                                            </button>

                                            {eventoCondicion.length > 0 ? (
                                                <div style={{ background: 'rgba(33, 115, 70, 0.03)', padding: '12px', borderRadius: RADIUS, border: '1px solid var(--border-color)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)', flexGrow: 1 }}>
                                                    <div style={{ fontSize: FS.xs, color: 'var(--text-pure)', marginBottom: '6px', fontWeight: 'bold', fontFamily: FONT }}>
                                                        Eventos B ({eventoCondicion.length}):
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                        {eventoCondicion.map(v => (
                                                            <span key={v} style={{ color: 'var(--text-pure)', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(33, 115, 70, 0.1)', padding: '3px 12px', borderRadius: '5px', border: '1px solid rgba(33, 115, 70, 0.2)', fontFamily: FONT }}>
                                                                {v}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ textAlign: 'center', padding: '10px', border: '1px dashed var(--border-color)', borderRadius: RADIUS, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <small style={{ color: 'var(--text-muted)', fontSize: FS.xs }}>
                                                        Ningún evento B seleccionado.
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: FS.xs, flexGrow: 1 }}>Primero agrega datos al espacio muestral.</p>
                                    )}
                                </div>
                            )}

                            {/* Evento Favorable*/}
                            <div id="tour-mat251-evento-favorable" style={{ ...cardStyle, marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                                <label style={{ ...labelStyle, color: 'var(--text-pure)' }}>
                                    {isFrec ? <>Evento de Interés <InlineMath math="A" />:</> : isCond ? <>Evento de Interés <InlineMath math="A" />:</> : <>Evento Favorable <InlineMath math="E" />:</>}
                                </label>
                                {statsEventos.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
                                        <button
                                            className="btn-primary"
                                            onClick={() => {
                                                detenerSimulacion();
                                                setModalEvento(true);
                                            }}
                                            style={{ alignSelf: 'center', padding: '5px 14px', fontSize: FS.sm, fontFamily: FONT, borderRadius: RADIUS, fontWeight: 600 }}
                                        >
                                            <ModificarSeleccion />
                                            {eventoFavorable.length > 0 ? 'Modificar Selección' : (isCond ? 'Configurar Evento A' : isFrec ? 'Configurar Evento de Interés' : 'Configurar Eventos Favorables')}
                                        </button>

                                        {eventoFavorable.length > 0 ? (
                                            <div style={{ background: 'rgba(33, 115, 70, 0.03)', padding: '12px', borderRadius: RADIUS, border: '1px solid var(--border-color)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)', flexGrow: 1 }}>
                                                <div style={{ fontSize: FS.xs, color: 'var(--text-pure)', marginBottom: '6px', fontWeight: 'bold', fontFamily: FONT }}>
                                                    {isCond ? 'Eventos A' : 'Eventos Seleccionados'} ({eventoFavorable.length}):
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {eventoFavorable.map(v => (
                                                        <span key={v} style={{ color: 'var(--text-pure)', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(33, 115, 70, 0.1)', padding: '3px 12px', borderRadius: RADIUS, border: '1px solid rgba(33, 115, 70, 0.2)', fontFamily: FONT }}>
                                                            {v}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '10px', border: '1px dashed var(--border-color)', borderRadius: RADIUS, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <small style={{ color: 'var(--text-muted)', fontSize: FS.xs }}>
                                                    {isCond ? 'Ningún evento A seleccionado.' : 'Ningún evento seleccionado aún.'}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: FS.xs, flexGrow: 1 }}>Primero agrega datos al espacio muestral.</p>
                                )}
                            </div>
                        </div>

                        {isFrec && inputMode === 'simulacion' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', margin: '15px 0 5px 0' }}>
                                <label style={{ fontSize: FS.xs, fontWeight: 'bold', color: 'var(--text-pure)', textTransform: 'uppercase', fontFamily: FONT }}>Número de Iteraciones (<InlineMath math="N" />)</label>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Ej: 1000"
                                    className="input-mat251 placeholder-small"
                                    value={iteracionesN}
                                    onChange={(e) => {
                                        detenerSimulacion();
                                        setIteracionesN(e.target.value);
                                    }}
                                    style={{
                                        padding: '5px 12px',
                                        borderRadius: RADIUS,
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-input)',
                                        color: 'var(--text-pure)',
                                        fontSize: FS.sm,
                                        outline: 'none',
                                        fontFamily: FONT,
                                        width: '150px',
                                        textAlign: 'center'
                                    }}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0px' }}>
                            <button
                                id="tour-mat251-btn-calcular"
                                onClick={isFrec && inputMode === 'simulacion' ? handleEjecutarSimulacion : ejecutar}
                                className="button_calcular"
                                style={{
                                    width: 'fit-content',
                                    alignSelf: 'center',
                                    padding: '5px 20px',
                                    borderRadius: RADIUS,
                                    fontSize: FS.md,
                                    fontWeight: 600,
                                    fontFamily: FONT,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                {isFrec && inputMode === 'simulacion' ? (
                                    <>
                                        EJECUTAR SIMULACIÓN
                                    </>
                                ) : (
                                    <>
                                        CALCULAR
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}

                {/* Resultado Math*/}
                {inputMode !== 'experimentos' && (activeRes || (isFrec && resultadoFrecuentista && inputMode === 'simulacion') || (tipo === 'clasica' && historialSimClasica.length > 0 && inputMode === 'simulacion')) && (
                    <>
                        {(inputMode !== 'simulacion' || (isFrec && resultadoFrecuentista && inputMode === 'simulacion')) && (
                            <div id="tour-mat251-formula" ref={formulaProbRef} style={{ overflowX: 'auto', marginTop: '10px' }} />
                        )}
                        {(inputMode !== 'simulacion' || (isFrec && resultadoFrecuentista && inputMode === 'simulacion')) && (
                            <div id="tour-mat251-resultados" className="grid-metricas-probabilidad">
                                {isFrec && resultadoFrecuentista && inputMode === 'simulacion' ? (
                                    <>
                                        <div style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: RADIUS, textAlign: 'center' }}>
                                            <p className="tarjeta-prob-titulo" style={{ margin: 0, fontSize: FS.xs, color: 'var(--text-pure)', fontWeight: 'bold', fontFamily: FONT }}>EVENTO <InlineMath math="A" /></p>
                                            <div className="tarjeta-prob-valor" style={{ margin: '4px 0 0', fontWeight: 'normal', color: 'var(--text-pure)', fontSize: FS.md }}>{renderKatexValue(resultadoFrecuentista.evento)}</div>
                                        </div>
                                        <div style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: RADIUS, textAlign: 'center' }}>
                                            <p className="tarjeta-prob-titulo" style={{ margin: 0, fontSize: FS.xs, color: 'var(--text-pure)', fontWeight: 'bold', fontFamily: FONT }}>FRECUENCIA EMPÍRICA <InlineMath math="f" /></p>
                                            <div className="tarjeta-prob-valor" style={{ margin: '4px 0 0', fontWeight: 'normal', color: 'var(--text-pure)', fontSize: FS.md }}>{renderKatexValue(resultadoFrecuentista.f)}</div>
                                        </div>
                                        <div style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: RADIUS, textAlign: 'center' }}>
                                            <p className="tarjeta-prob-titulo" style={{ margin: 0, fontSize: FS.xs, color: 'var(--text-pure)', fontWeight: 'bold', fontFamily: FONT }}>SIMULACIONES <InlineMath math="N" /></p>
                                            <div className="tarjeta-prob-valor" style={{ margin: '4px 0 0', fontWeight: 'normal', color: 'var(--text-pure)', fontSize: FS.md }}>{renderKatexValue(resultadoFrecuentista.N)}</div>
                                        </div>
                                        <div style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: RADIUS, textAlign: 'center' }}>
                                            <p className="tarjeta-prob-titulo" style={{ margin: 0, fontSize: FS.xs, color: 'var(--text-pure)', fontWeight: 'bold', fontFamily: FONT }}>PORCENTAJE EMPÍRICO</p>
                                            <div className="tarjeta-prob-valor" style={{ margin: '4px 0 0', fontWeight: 'normal', color: 'var(--text-pure)', fontSize: FS.md }}>{renderKatexValue(`${resultadoFrecuentista.probPorcentaje}%`)}</div>
                                        </div>
                                    </>
                                ) : (
                                    [
                                        ...(inputMode !== 'manual' ? [{ label: <>{(isCond || isFrec) ? 'Evento' : 'Eventos'} <InlineMath math={(isCond || isFrec) ? "A" : "E"} /></>, val: eventoFavorable.join(', ') }] : []),
                                        { label: <>{labels.tarjetaNumerador.text} <InlineMath math={labels.tarjetaNumerador.math} /></>, val: activeRes?.casosFavorables },
                                        { label: <>{labels.tarjetaDenominador.text} <InlineMath math={labels.tarjetaDenominador.math} /></>, val: activeRes?.casosTotales },
                                        ...(tipo === 'clasica' ? [] : [{ label: 'Decimal', val: activeRes?.probabilidadDecimal }]),
                                        { label: 'Porcentaje', val: `${activeRes?.probabilidadPorcentaje}%` },
                                    ].map(({ label, val }, i) => (
                                        <div key={i} style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: RADIUS, textAlign: 'center' }}>
                                            <p className="tarjeta-calculo-titulo" style={{ margin: 0, fontSize: FS.sl, color: 'var(--text-pure)', fontWeight: 'bold', fontFamily: FONT }}>{label}</p>
                                            <div className="tarjeta-calculo-valor" style={{ margin: '4px 0 0', fontWeight: 'normal', color: 'var(--text-pure)', fontSize: FS.md }}>{renderKatexValue(val)}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {tipo === 'clasica' && historialSimClasica.length > 0 && inputMode === 'simulacion' && (
                            <div id="tour-sim-grafica" style={{ marginTop: '10px' }}>
                                <MarcoWidgetMAT251 titulo="Convergencia de la Probabilidad" anchoCompleto={true} alto="400px">
                                    <div style={{ width: '100%', height: '100%', minWidth: 0, padding: 0, boxSizing: 'border-box' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={historialSimClasica} margin={{ top: 20, right: 10, left: 5, bottom: 10 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                                <XAxis type="number" dataKey="intento" domain={[0, 'dataMax']} ticks={crearTicksConvergencia(historialSimClasica, 'intento')} interval={0} allowDecimals={false} stroke="var(--text-muted)" fontSize={12} />
                                                <YAxis domain={[0, 1]} stroke="var(--text-muted)" fontSize={12} width={30} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: RADIUS, color: 'var(--text-color)' }}
                                                    itemStyle={{ color: 'var(--primary-color)' }}
                                                    formatter={(value) => value.toFixed(4)}
                                                />
                                                <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-color)' }} />
                                                <ReferenceLine y={historialSimClasica[0]?.teorica} stroke="#10b981" strokeDasharray="5 5" label={{ position: 'top', value: 'Probabilidad Teórica', fill: '#10b981', fontSize: 12 }} />
                                                <Line type="linear" dataKey="empirica" name="Probabilidad Simulada" stroke="var(--primary-color)" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </MarcoWidgetMAT251>
                            </div>
                        )}

                        {tipo === 'clasica' && historialSimulacionMoneda.length > 0 && inputMode === 'simulacion' && (experimentoClasico === 'moneda' || experimentoClasico === 'dado' || experimentoClasico === 'baraja') && (
                            <div style={{ marginTop: '15px' }}>
                                {/* Tabla de datos de la simulación directamente visible */}
                                <div id="tour-sim-tabla-historial" style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: RADIUS, position: 'relative' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: FS.sm, color: 'var(--text-color)' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1, boxShadow: '0 1px 0 var(--border-color)' }}>
                                            <tr>
                                                <th style={{ padding: '10px', fontWeight: 700 }}>Lanzamiento</th>
                                                <th style={{ padding: '10px', fontWeight: 700 }}>Resultado</th>
                                                <th style={{ padding: '10px', fontWeight: 700 }}>¿Es Éxito?</th>
                                                <th style={{ padding: '10px', fontWeight: 700 }}>Éxitos Acumulados</th>
                                                <th style={{ padding: '10px', fontWeight: 700 }}>Probabilidad Simulada</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historialSimulacionMoneda.map((h, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? 'var(--bg-input)' : 'transparent' }}>
                                                    <td style={{ padding: '8px' }}>{h.intento}</td>
                                                    <td style={{ padding: '8px', textTransform: 'capitalize' }}>{h.resultadoObtenido}</td>
                                                    <td style={{ padding: '8px', color: h.esExito ? '#10b981' : 'var(--text-muted)' }}>{h.esExito ? 'Sí' : 'No'}</td>
                                                    <td style={{ padding: '8px' }}>{h.exitosAcumulados}</td>
                                                    <td style={{ padding: '8px', fontWeight: 600 }}>{h.probabilidadAcumulada.toFixed(4)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Botones centrados debajo de la tabla */}
                                <div id="tour-sim-botones-exportar" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'center', marginTop: '15px' }}>
                                    <button
                                        id="tour-sim-btn-guardar"
                                        type="button"
                                        className="btn-primary"
                                        style={{ padding: '5px 20px', fontSize: FS.sm, fontWeight: 600, fontFamily: FONT, borderRadius: RADIUS, display: 'flex', alignItems: 'center', gap: '6px' }}
                                        onClick={async () => {
                                            if (!historialSimulacionMoneda || historialSimulacionMoneda.length === 0) return;
                                            try {
                                                const worksheet = XLSX.utils.json_to_sheet(historialSimulacionMoneda.map(h => ({
                                                    "Lanzamiento": h.intento,
                                                    "Resultado": h.resultadoObtenido,
                                                    "¿Es Éxito?": h.esExito ? "Sí" : "No",
                                                    "Éxitos Acumulados": h.exitosAcumulados,
                                                    "Prob. Simulada": h.probabilidadAcumulada.toFixed(4)
                                                })));
                                                const workbook = XLSX.utils.book_new();
                                                const nombreExp = experimentoClasico.charAt(0).toUpperCase() + experimentoClasico.slice(1);
                                                XLSX.utils.book_append_sheet(workbook, worksheet, `Simulación ${nombreExp}`);
                                                const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                                                const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                                                const fileObj = new File([blob], `Historial_Simulacion_${nombreExp}_${new Date().getTime()}.xlsx`, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

                                                const usuarioGuardado = localStorage.getItem('usuario');
                                                const autor = usuarioGuardado ? JSON.parse(usuarioGuardado).nombre : 'Estudiante';

                                                const formData = new FormData();
                                                formData.append("file", fileObj);
                                                formData.append("autor", autor);
                                                formData.append("visibilidad", "personal");

                                                await api.subirArchivo(formData);
                                                alerta.success("¡Guardado exitoso!", "El archivo de simulación se ha guardado en tu Espacio Personal.");
                                            } catch (error) {
                                                console.error("Error al guardar en el espacio personal:", error);
                                                mostrarAlerta("No se pudo guardar el archivo en tu Espacio Personal.", "Error", "error");
                                            }
                                        }}
                                    >
                                        <IconoGuardar /> Guardar
                                    </button>
                                    <button
                                        id="tour-sim-btn-descargar"
                                        type="button"
                                        className="btn-verde"
                                        style={{ padding: '5px 20px', fontSize: FS.sm, fontWeight: 600, fontFamily: FONT, borderRadius: RADIUS, display: 'flex', alignItems: 'center', gap: '6px' }}
                                        onClick={() => {
                                            if (!historialSimulacionMoneda || historialSimulacionMoneda.length === 0) return;
                                            const worksheet = XLSX.utils.json_to_sheet(historialSimulacionMoneda.map(h => ({
                                                "Lanzamiento": h.intento,
                                                "Resultado": h.resultadoObtenido,
                                                "¿Es Éxito?": h.esExito ? "Sí" : "No",
                                                "Éxitos Acumulados": h.exitosAcumulados,
                                                "Prob. Simulada": h.probabilidadAcumulada.toFixed(4)
                                            })));
                                            const workbook = XLSX.utils.book_new();
                                            const nombreExp = experimentoClasico.charAt(0).toUpperCase() + experimentoClasico.slice(1);
                                            XLSX.utils.book_append_sheet(workbook, worksheet, `Simulación ${nombreExp}`);
                                            XLSX.writeFile(workbook, `Historial_Simulacion_${nombreExp}.xlsx`);
                                        }}
                                    >
                                        <Descargar /> Descargar (.xlsx)
                                    </button>
                                </div>
                            </div>
                        )}

                        {isFrec && simulacionActiva && datosSimulacion.length > 0 && inputMode === 'simulacion' && (
                            <div style={{ marginTop: '20px' }}>
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={ordenWidgets} strategy={rectSortingStrategy}>
                                        {ordenWidgets.map((widgetId) => {
                                            if (widgetId === 'w-frecuentista') {
                                                return (
                                                    <MarcoWidgetMAT251 key={widgetId} id={widgetId} titulo="Convergencia de la Probabilidad Empírica" anchoCompleto={true} alto="400px">
                                                        <div style={{ width: '100%', height: '100%', minWidth: 0, padding: 0, boxSizing: 'border-box' }}>
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <LineChart data={datosSimulacion} margin={{ top: 20, right: 15, left: 5, bottom: 10 }}>
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                                                    <XAxis type="number" dataKey="iteracion" domain={[0, 'dataMax']} ticks={crearTicksConvergencia(datosSimulacion, 'iteracion')} interval={0} allowDecimals={false} stroke="var(--text-muted)" fontSize={12} />
                                                                    <YAxis domain={[0, 1]} stroke="var(--text-muted)" fontSize={12} width={35} />
                                                                    <Tooltip
                                                                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: RADIUS, color: 'var(--text-color)' }}
                                                                        itemStyle={{ color: 'var(--primary-color)' }}
                                                                        formatter={(value) => value.toFixed(4)}
                                                                    />
                                                                    <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-color)' }} />
                                                                    <ReferenceLine y={datosSimulacion[0]?.teorica} stroke="#10b981" strokeDasharray="5 5" label={{ position: 'top', value: 'Probabilidad Teórica', fill: '#10b981', fontSize: 12 }} />
                                                                    <Line type="monotone" dataKey="empirica" name="Probabilidad Empírica" stroke="var(--primary-color)" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                                                </LineChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </MarcoWidgetMAT251>
                                                );
                                            }
                                            return null;
                                        })}
                                    </SortableContext>
                                </DndContext>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
