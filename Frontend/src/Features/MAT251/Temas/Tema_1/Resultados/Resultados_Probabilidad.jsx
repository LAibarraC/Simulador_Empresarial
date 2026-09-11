import React, { useState, useEffect, useRef } from 'react';
import { FONT, FS, RADIUS, cardStyle, labelStyle } from '../../../Principal/Constantes';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { IconoCalculadora, EditarDatos, ModificarSeleccion, IconoAlerta, IconoDado } from '../../../../../ui/iconos';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable";
import MarcoWidgetMAT251 from '../../../ui/MarcoWidgetMAT251';
import { DadoSVG, MonedaSVG, CartaSVG } from './Experimentos';
import * as XLSX from 'xlsx';
import { api } from '../../../../../services/api';
import { alerta } from '../../../../../utils/Notificaciones';
import { obtenerProbabilidadTeorica, simularUnPaso } from '../../../Matematicas/logica_Tema1';

export default function ResultadosProbabilidad({
    statsDatos, abrirEditor, valoresUnicos, statsEventos, setModalEvento,
    eventoFavorable, setEventoFavorable, ejecutar, resProbabilidad, setResProbabilidad, formulaProbRef, inputDatos,
    tipo = 'clasica',
    eventoCondicion = [], setModalCondicion = () => { },
    colProbClasica, setColProbClasica, varSeleccionada,
    inputMode, setInputMode
}) {
    const [isDropdownColOpen, setIsDropdownColOpen] = useState(false);
    const dropdownColRef = useRef(null);

    // Estados para el Simulador Frecuentista
    const [iteracionesN, setIteracionesN] = useState(1000);
    const [simulacionActiva, setSimulacionActiva] = useState(false);
    const [datosSimulacion, setDatosSimulacion] = useState([]);
    const [resultadoFrecuentista, setResultadoFrecuentista] = useState(null);

    // Estados para la Simulación Clásica
    const [experimentoClasico, setExperimentoClasico] = useState('');
    const [eventoClasico, setEventoClasico] = useState('');
    const [iteracionesClasica, setIteracionesClasica] = useState(100);
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

    const [manualN, setManualN] = useState('');
    const [manualF, setManualF] = useState('');

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

    const activeRes = (() => {
        if (inputMode === 'manual') {
            if (errorManual || nVal <= 0) {
                return {
                    casosFavorables: fVal,
                    casosTotales: nVal,
                    probabilidadDecimal: '0.0000',
                    probabilidadPorcentaje: '0.00',
                    arrFiltrado: []
                };
            }
            const pDec = fVal / nVal;
            return {
                casosFavorables: fVal,
                casosTotales: nVal,
                probabilidadDecimal: pDec.toFixed(4),
                probabilidadPorcentaje: (pDec * 100).toFixed(2),
                arrFiltrado: []
            };
        }
        return resProbabilidad;
    })();

    const handleEjecutarSimulacion = () => {
        if (eventoFavorable.length === 0) {
            alert("Selecciona un evento de interés primero.");
            return;
        }
        if (!inputDatos) {
            alert("No hay datos en el espacio muestral.");
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

        const totalIteraciones = parseInt(iteracionesN) || 1000;
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

    const handleEjecutarSimulacionClasica = () => {
        if (!experimentoClasico || !eventoClasico) {
            alert("Selecciona un experimento y un evento de interés.");
            return;
        }

        const N = parseInt(iteracionesClasica) || 100;
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
        <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column' }}>
            {/* SELECTOR DE MODO DE ENTRADA */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'inline-flex', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                    <button
                        type="button"
                        className={`btn-tema1-borde ${inputMode === 'matriz' ? 'active' : ''}`}
                        onClick={() => setInputMode('matriz')}
                        style={{
                            padding: '6px 16px',
                            borderRadius: '6px',
                            fontSize: FS.sm,
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            background: inputMode === 'matriz' ? 'var(--primary-color)' : 'transparent',
                            color: inputMode === 'matriz' ? '#fff' : 'var(--text-muted)',
                            transition: 'all 0.2s'
                        }}
                    >
                        Análisis de Matriz
                    </button>
                    {(isFrec || tipo === 'clasica') && (
                        <button
                            type="button"
                            className={`btn-tema1-borde ${inputMode === 'simulacion' ? 'active' : ''}`}
                            onClick={() => {
                                setInputMode('simulacion');
                                if (tipo === 'clasica' && setColProbClasica) {
                                    setColProbClasica('');
                                    if(setEventoFavorable) setEventoFavorable([]);
                                }
                            }}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '6px',
                                fontSize: FS.sm,
                                fontWeight: 600,
                                border: 'none',
                                cursor: 'pointer',
                                background: inputMode === 'simulacion' ? 'var(--primary-color)' : 'transparent',
                                color: inputMode === 'simulacion' ? '#fff' : 'var(--text-muted)',
                                transition: 'all 0.2s'
                            }}
                        >
                            Simulación
                        </button>
                    )}
                    <button
                        type="button"
                        className={`btn-tema1-borde ${inputMode === 'manual' ? 'active' : ''}`}
                        onClick={() => setInputMode('manual')}
                        style={{
                            padding: '6px 16px',
                            borderRadius: '6px',
                            fontSize: FS.sm,
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            background: inputMode === 'manual' ? 'var(--primary-color)' : 'transparent',
                            color: inputMode === 'manual' ? '#fff' : 'var(--text-muted)',
                            transition: 'all 0.2s'
                        }}
                    >
                        Modo Manual
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
                {inputMode === 'manual' ? (
                    /* INTERFAZ PARA MODO MANUAL */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '15px' }}>
                        <h4 style={{ marginBottom: '5px', fontSize: FS.sm, fontWeight: 700, color: 'var(--primary-color)' }}>Datos del Ejercicio</h4>
                        <div className="panel-inputs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginTop: 0, marginBottom: '15px', background: 'var(--bg-input)', padding: '20px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>{labels.numerador.text.trim()}</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: FS.md, color: 'var(--text-main)', whiteSpace: 'nowrap' }}><InlineMath math={labels.numerador.math} />:</span>
                                    <input
                                        type="number"
                                        min="0"
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>{labels.denominador.text.trim()}</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: FS.md, color: 'var(--text-main)', whiteSpace: 'nowrap' }}><InlineMath math={labels.denominador.math} />:</span>
                                    <input
                                        type="number"
                                        min="1"
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
                    </div>
                ) : inputMode === 'simulacion' && tipo === 'clasica' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '5px' }}>
                        <h4 style={{ marginBottom: '5px', fontSize: FS.sm, fontWeight: 700, color: 'var(--primary-color)' }}>Configuración de Simulación</h4>
                        <div className="panel-inputs" style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', marginTop: 0, marginBottom: '5px', background: 'var(--bg-input)', padding: '20px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '200px' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Experimento</label>
                                <select 
                                    value={experimentoClasico} 
                                    onChange={(e) => {
                                        detenerSimulacion();
                                        setExperimentoClasico(e.target.value);
                                        setEventoClasico('');
                                    }}
                                    style={{ padding: '8px 12px', borderRadius: RADIUS, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-color)', fontSize: FS.sm, outline: 'none', fontFamily: FONT, width: '100%' }}
                                >
                                    <option value="">-- Seleccionar --</option>
                                    <option value="moneda">Lanzar Moneda</option>
                                    <option value="dado">Lanzar Dado de 6 caras</option>
                                    <option value="baraja">Sacar Carta (Baraja 52)</option>
                                </select>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '200px' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Evento de Interés</label>
                                <select 
                                    value={eventoClasico} 
                                    onChange={(e) => {
                                        detenerSimulacion();
                                        setEventoClasico(e.target.value);
                                    }}
                                    disabled={!experimentoClasico}
                                    style={{ padding: '8px 12px', borderRadius: RADIUS, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-color)', fontSize: FS.sm, outline: 'none', fontFamily: FONT, width: '100%', opacity: !experimentoClasico ? 0.6 : 1 }}
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {experimentoClasico === 'moneda' && (
                                        <>
                                            <option value="cara">Cara</option>
                                            <option value="cruz">Cruz</option>
                                        </>
                                    )}
                                    {experimentoClasico === 'dado' && (
                                        <>
                                            <option value="1">Sacar 1</option>
                                            <option value="2">Sacar 2</option>
                                            <option value="3">Sacar 3</option>
                                            <option value="4">Sacar 4</option>
                                            <option value="5">Sacar 5</option>
                                            <option value="6">Sacar 6</option>
                                            <option value="par">Número Par (2, 4, 6)</option>
                                            <option value="impar">Número Impar (1, 3, 5)</option>
                                        </>
                                    )}
                                    {experimentoClasico === 'baraja' && (
                                        <>
                                            <option value="roja">Carta Roja (Corazones o Diamantes)</option>
                                            <option value="negra">Carta Negra (Tréboles o Picas)</option>
                                            <option value="corazones">Corazones</option>
                                            <option value="diamantes">Diamantes</option>
                                            <option value="treboles">Tréboles</option>
                                            <option value="espadas">Espadas</option>
                                            <option value="as">Un As</option>
                                            <option value="rey">Un Rey (K)</option>
                                            <option value="reina">Una Reina (Q)</option>
                                            <option value="jota">Una Jota (J)</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '150px' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Repeticiones (N)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={iteracionesClasica}
                                    onChange={(e) => {
                                        detenerSimulacion();
                                        setIteracionesClasica(e.target.value);
                                    }}
                                    style={{ padding: '8px 12px', borderRadius: RADIUS, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-color)', fontSize: FS.sm, outline: 'none', fontFamily: FONT, width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-5px', marginBottom: '0px' }}>
                            <button
                                type="button"
                                onClick={handleEjecutarSimulacionClasica}
                                disabled={simulacionEnCurso}
                                className="button_calcular"
                                style={{ width: 'fit-content', padding: '8px 35px', borderRadius: RADIUS, fontSize: FS.md, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: simulacionEnCurso ? 0.6 : 1, cursor: simulacionEnCurso ? 'not-allowed' : 'pointer' }}
                            >
                                {simulacionEnCurso ? 'SIMULANDO...' : 'INICIAR SIMULACIÓN'}
                            </button>
                        </div>

                        {(simulacionEnCurso || progresoSimulacion.intentoActual > 0) && (
                            <div style={{ marginTop: '5px', padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '0', position: 'relative', overflow: 'hidden' }}>
                                <style>{`
                                    @keyframes anim-spin { 100% { transform: rotate(360deg); } }
                                    @keyframes anim-flip { 100% { transform: rotateY(360deg); } }
                                `}</style>
                                
                                {/* Progress Bar */}
                                <div style={{ position: 'absolute', top: 0, left: 0, height: '4px', background: 'var(--primary-color)', width: `${Math.min(100, (progresoSimulacion.intentoActual / Math.max(1, parseInt(iteracionesClasica) || 1)) * 100)}%`, transition: 'width 0.1s linear' }} />
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                                    
                                    {/* Left Side: Probabilidad Teórica */}
                                    <div style={{ width: '150px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        <span style={{ fontSize: FS.sm, fontWeight: 700, color: 'var(--text-muted)' }}>Lanzamiento: {progresoSimulacion.intentoActual} / {parseInt(iteracionesClasica) || 100}</span>
                                        {resSimulacionClasica && (
                                            <div style={{ textAlign: 'center', background: 'var(--bg-input)', padding: '15px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>PROB. TEÓRICA</p>
                                                <p style={{ margin: '5px 0 0', fontSize: '1.2rem', color: 'var(--primary-color)', fontWeight: 900 }}>{(resSimulacionClasica.teorica * 100).toFixed(2)}%</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Center: Controls, Icon, Result, Exitos */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', flexGrow: 1 }}>
                                        
                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                            {/* Speed Controls */}
                                            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', padding: '3px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
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
                                                            border: 'none', borderRadius: '15px', padding: '2px 8px', cursor: 'pointer', fontSize: '0.65rem',
                                                            fontWeight: 800, transition: 'all 0.2s', boxShadow: velocidadSimulacion === vel ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
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
                                                        background: simulacionPausada ? '#10b981' : 'var(--text-muted)', 
                                                        color: '#fff', border: 'none', borderRadius: '15px', 
                                                        padding: '4px 12px', cursor: 'pointer', fontSize: FS.xs,
                                                        fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px',
                                                        transition: 'background 0.2s', minWidth: '105px', justifyContent: 'center'
                                                    }}
                                                >
                                                    {simulacionPausada ? '▶ CONTINUAR' : '⏸ PAUSAR'}
                                                </button>
                                            )}
                                        </div>

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
                                        
                                        {/* Last Result */}
                                        <div style={{ fontSize: FS.md, fontWeight: 800, color: 'var(--text-color)', minHeight: '24px', textAlign: 'center' }}>
                                            {progresoSimulacion.ultimoResultado ? (
                                                progresoSimulacion.ultimoResultado === 'girando...' ? 'Girando...' : 
                                                simulacionEnCurso ? `Resultado: ${progresoSimulacion.ultimoResultado}` : `Último resultado: ${progresoSimulacion.ultimoResultado}`
                                            ) : 'Preparando...'}
                                        </div>

                                        {/* Exitos (Centro Inferior) */}
                                        {resSimulacionClasica && (
                                            <div style={{ marginTop: '10px', textAlign: 'center' }}>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>ÉXITOS OBTENIDOS</p>
                                                <p style={{ margin: '5px 0 0', fontSize: '1.3rem', color: 'var(--primary-color)', fontWeight: 900 }}>{resSimulacionClasica.exitos}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Side: Probabilidad Simulada */}
                                    <div style={{ width: '150px', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'flex-end' }}>
                                        <span style={{ fontSize: FS.sm, fontWeight: 700, opacity: 0 }}>Placeholder</span>
                                        {resSimulacionClasica && (
                                            <div style={{ textAlign: 'center', background: 'var(--bg-input)', padding: '15px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%' }}>
                                                <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>PROB. SIMULADA</p>
                                                <p style={{ margin: '5px 0 0', fontSize: '1.2rem', color: 'var(--primary-color)', fontWeight: 900 }}>{(resSimulacionClasica.simulada * 100).toFixed(2)}%</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                </div>

                                {/* Nuevas métricas empíricas */}
                                {resSimulacionClasica && (
                                    <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                        <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                                            <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><span style={{ textTransform: 'uppercase' }}>Esperanza Empírica</span> <InlineMath math="E(X)" /></p>
                                            <p style={{ margin: '5px 0 0', fontSize: '1.1rem', color: 'var(--text-color)', fontWeight: 800 }}>
                                                {resSimulacionClasica.simulada.toFixed(4)}
                                            </p>
                                        </div>
                                        <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                                            <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><span style={{ textTransform: 'uppercase' }}>Varianza Empírica</span> <InlineMath math="V(X)" /></p>
                                            <p style={{ margin: '5px 0 0', fontSize: '1.1rem', color: 'var(--text-color)', fontWeight: 800 }}>
                                                {(resSimulacionClasica.simulada * (1 - resSimulacionClasica.simulada)).toFixed(4)}
                                            </p>
                                        </div>
                                        <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                                            <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><span style={{ textTransform: 'uppercase' }}>Desviación Estándar</span> <InlineMath math={'\\sigma'} /></p>
                                            <p style={{ margin: '5px 0 0', fontSize: '1.1rem', color: 'var(--text-color)', fontWeight: 800 }}>
                                                {Math.sqrt(resSimulacionClasica.simulada * (1 - resSimulacionClasica.simulada)).toFixed(4)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    /* INTERFAZ PARA MODO MATRIZ */
                    <>
                        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <div>
                                <span style={{ ...labelStyle, margin: 0 }}>Datos:</span>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                                    <small title="Datos provenientes de variables externas" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                        Cargados: <strong style={{ color: 'var(--primary-color)' }}>{statsDatos.cargados}</strong>
                                    </small>
                                    <small title="Datos ingresados manualmente" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                        Agregados: <strong style={{ color: '#3b82f6' }}>{statsDatos.agregados}</strong>
                                    </small>
                                    <small title="Total de datos válidos" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                        Total: <strong>{statsDatos.total}</strong>
                                    </small>
                                </div>
                            </div>
                            <button
                                onClick={abrirEditor}
                                className="btn-icon"
                                style={{
                                    borderRadius: RADIUS,
                                    fontSize: FS.sm,
                                    padding: '6px 14px',
                                    background: 'var(--primary-color)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <EditarDatos />
                                Editar Datos
                            </button>
                        </div>

                        {/* Selector de Columna (Solo si hay múltiples columnas y no es condicional) */}
                        {!isCond && varSeleccionada?.nombresColumnas && varSeleccionada.nombresColumnas.length > 1 && (
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ ...labelStyle, fontSize: FS.sm, marginBottom: '6px' }}>Columna a analizar:</label>
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
                                            position: 'absolute', top: '100%', left: 0, right: 0,
                                            marginTop: '5px',
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: RADIUS,
                                            boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                                            zIndex: 100,
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
                        <div style={{ display: 'grid', gridTemplateColumns: isCond ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr', gap: '12px', marginBottom: '12px', alignItems: 'stretch' }}>
                            {/* Evento Condicion (Solo Condicional) */}
                            {isCond && (
                                <div style={{ ...cardStyle, marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                                    <label style={labelStyle}>Condición Dada (Evento <InlineMath math="B" />):</label>
                                    {statsEventos.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
                                            <button
                                                className="btn-tema1-borde active"
                                                onClick={() => {
                                                    detenerSimulacion();
                                                    setModalCondicion(true);
                                                }}
                                                style={{
                                                    width: 'fit-content',
                                                    alignSelf: 'center',
                                                    padding: '5px 20px',
                                                    background: 'var(--primary-color)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: RADIUS,
                                                    fontSize: FS.sm,
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    transition: 'all 0.2s',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                                                onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                                            >
                                                <ModificarSeleccion />
                                                {eventoCondicion.length > 0 ? 'Modificar Condición' : 'Configurar Evento B'}
                                            </button>

                                            {eventoCondicion.length > 0 ? (
                                                <div style={{ background: 'rgba(33, 115, 70, 0.03)', padding: '12px', borderRadius: RADIUS, border: '1px solid var(--border-color)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)', flexGrow: 1 }}>
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                        Eventos B ({eventoCondicion.length}):
                                                    </div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                        {eventoCondicion.map(v => (
                                                            <span key={v} style={{ color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(33, 115, 70, 0.1)', padding: '3px 12px', borderRadius: '5px', border: '1px solid rgba(33, 115, 70, 0.2)' }}>
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
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: FS.sm, flexGrow: 1 }}>Primero agrega datos al espacio muestral.</p>
                                    )}
                                </div>
                            )}

                            {/* Evento Favorable*/}
                            <div style={{ ...cardStyle, marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                                <label style={labelStyle}>
                                    {isFrec ? <>Evento de Interés <InlineMath math="A" />:</> : isCond ? <>Evento de Interés <InlineMath math="A" />:</> : <>Evento Favorable <InlineMath math="E" />:</>}
                                </label>
                                {statsEventos.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
                                        <button
                                            className="btn-tema1-borde active"
                                            onClick={() => {
                                                detenerSimulacion();
                                                setModalEvento(true);
                                            }}
                                            style={{
                                                width: 'fit-content',
                                                alignSelf: 'center',
                                                padding: '5px 20px',
                                                background: 'var(--primary-color)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: RADIUS,
                                                fontSize: FS.sm,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                transition: 'all 0.2s',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                                            onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                                        >
                                            <ModificarSeleccion />
                                            {eventoFavorable.length > 0 ? 'Modificar Selección' : (isCond ? 'Configurar Evento A' : isFrec ? 'Configurar Evento de Interés' : 'Configurar Eventos Favorables')}
                                        </button>

                                        {eventoFavorable.length > 0 ? (
                                            <div style={{ background: 'rgba(33, 115, 70, 0.03)', padding: '12px', borderRadius: RADIUS, border: '1px solid var(--border-color)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)', flexGrow: 1 }}>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Eventos Seleccionados ({eventoFavorable.length}):
                                                </div>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {eventoFavorable.map(v => (
                                                        <span key={v} style={{ color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(33, 115, 70, 0.1)', padding: '3px 12px', borderRadius: '5px', border: '1px solid rgba(33, 115, 70, 0.2)' }}>
                                                            {v}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '10px', border: '1px dashed var(--border-color)', borderRadius: RADIUS, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <small style={{ color: 'var(--text-muted)', fontSize: FS.xs }}>
                                                    Ningún evento seleccionado aún.
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: FS.sm, flexGrow: 1 }}>Primero agrega datos al espacio muestral.</p>
                                )}
                            </div>
                        </div>

                        {isFrec && inputMode === 'simulacion' && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                                <label style={{ fontSize: FS.xs, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Número de Iteraciones (N)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={iteracionesN}
                                    onChange={(e) => {
                                        detenerSimulacion();
                                        setIteracionesN(e.target.value);
                                    }}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: RADIUS,
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-input)',
                                        color: 'var(--text-color)',
                                        fontSize: FS.sm,
                                        outline: 'none',
                                        width: '150px',
                                        textAlign: 'center',
                                        fontWeight: 600
                                    }}
                                />
                            </div>
                        )}

                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
                            <button
                                onClick={isFrec && inputMode === 'simulacion' ? handleEjecutarSimulacion : ejecutar}
                                className="button_calcular btn-icon"
                                style={{
                                    width: 'fit-content',
                                    alignSelf: 'center',
                                    padding: '5px 35px',
                                    borderRadius: RADIUS,
                                    fontSize: FS.md,
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                {isFrec && inputMode === 'simulacion' ? (
                                    <>
                                        <IconoDado />
                                        EJECUTAR SIMULACIÓN
                                    </>
                                ) : (
                                    <>
                                        <IconoCalculadora />
                                        CALCULAR
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}

                {/* Resultado Math*/}
                {(activeRes || (isFrec && resultadoFrecuentista && inputMode === 'simulacion') || (tipo === 'clasica' && historialSimClasica.length > 0 && inputMode === 'simulacion')) && (
                    <>
                        {inputMode !== 'simulacion' && (
                            <div ref={formulaProbRef} style={{ overflowX: 'auto' }} />
                        )}
                        {(inputMode !== 'simulacion' || (isFrec && resultadoFrecuentista && inputMode === 'simulacion')) && (
                            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                                {isFrec && resultadoFrecuentista && inputMode === 'simulacion' ? (
                                    <>
                                        <div style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: RADIUS, textAlign: 'center' }}>
                                            <p style={{ margin: 0, fontSize: FS.xs, color: 'var(--text-muted)' }}>Evento A</p>
                                            <p style={{ margin: '4px 0 0', fontWeight: 700, color: 'var(--primary-color)', fontSize: FS.md }}>{resultadoFrecuentista.evento}</p>
                                        </div>
                                        <div style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: RADIUS, textAlign: 'center' }}>
                                            <p style={{ margin: 0, fontSize: FS.xs, color: 'var(--text-muted)' }}>Frecuencia Empírica f</p>
                                            <p style={{ margin: '4px 0 0', fontWeight: 700, color: 'var(--primary-color)', fontSize: FS.md }}>{resultadoFrecuentista.f}</p>
                                        </div>
                                        <div style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: RADIUS, textAlign: 'center' }}>
                                            <p style={{ margin: 0, fontSize: FS.xs, color: 'var(--text-muted)' }}>Simulaciones N</p>
                                            <p style={{ margin: '4px 0 0', fontWeight: 700, color: 'var(--primary-color)', fontSize: FS.md }}>{resultadoFrecuentista.N}</p>
                                        </div>
                                        <div style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: RADIUS, textAlign: 'center' }}>
                                            <p style={{ margin: 0, fontSize: FS.xs, color: 'var(--text-muted)' }}>Porcentaje Empírico</p>
                                            <p style={{ margin: '4px 0 0', fontWeight: 700, color: 'var(--primary-color)', fontSize: FS.md }}>{resultadoFrecuentista.probPorcentaje}%</p>
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
                                            <p style={{ margin: 0, fontSize: FS.xs, color: 'var(--text-muted)' }}>{label}</p>
                                            <p style={{ margin: '4px 0 0', fontWeight: 700, color: 'var(--primary-color)', fontSize: FS.md }}>{val}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {tipo === 'clasica' && historialSimClasica.length > 0 && inputMode === 'simulacion' && (
                            <div style={{ marginTop: '10px' }}>
                                <MarcoWidgetMAT251 titulo="Convergencia de la Probabilidad (Ley de los Grandes Números)" anchoCompleto={true} alto="400px">
                                    <div style={{ width: '100%', height: '100%', minWidth: 0, padding: '15px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={historialSimClasica} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                                <XAxis dataKey="intento" stroke="var(--text-muted)" fontSize={12} />
                                                <YAxis domain={[0, 1]} stroke="var(--text-muted)" fontSize={12} />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-color)' }}
                                                    itemStyle={{ color: 'var(--primary-color)' }}
                                                    formatter={(value) => value.toFixed(4)}
                                                />
                                                <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-color)' }} />
                                                <ReferenceLine y={historialSimClasica[0]?.teorica} stroke="#10b981" strokeDasharray="5 5" label={{ position: 'top', value: 'Prob. Teórica', fill: '#10b981', fontSize: 12 }} />
                                                <Line type="monotone" dataKey="empirica" name="Prob. Simulada" stroke="var(--primary-color)" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </MarcoWidgetMAT251>
                            </div>
                        )}

                        {tipo === 'clasica' && historialSimulacionMoneda.length > 0 && inputMode === 'simulacion' && (experimentoClasico === 'moneda' || experimentoClasico === 'dado' || experimentoClasico === 'baraja') && (
                            <div style={{ marginTop: '15px' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => {
                                            if (!mostrarTablaMoneda) {
                                                setIsRenderingTabla(true);
                                                setMostrarTablaMoneda(true);
                                                setTimeout(() => setIsRenderingTabla(false), 50);
                                            } else {
                                                setMostrarTablaMoneda(false);
                                            }
                                        }}
                                        style={{
                                            padding: '8px 15px', borderRadius: RADIUS, fontSize: FS.sm, fontWeight: 600,
                                            background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-color)', cursor: 'pointer'
                                        }}
                                    >
                                        {mostrarTablaMoneda ? 'Ocultar Datos de Simulación' : 'Ver Datos de Simulación'}
                                    </button>
                                    <button
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
                                                alerta.error("Error", "No se pudo guardar el archivo en tu Espacio Personal.");
                                            }
                                        }}
                                        style={{
                                            padding: '8px 15px', borderRadius: RADIUS, fontSize: FS.sm, fontWeight: 600,
                                            background: '#3b82f6', border: 'none', color: '#fff', cursor: 'pointer'
                                        }}
                                    >
                                        Guardar en Mi Espacio
                                    </button>
                                    <button
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
                                        style={{
                                            padding: '8px 15px', borderRadius: RADIUS, fontSize: FS.sm, fontWeight: 600,
                                            background: '#10b981', border: 'none', color: '#fff', cursor: 'pointer'
                                        }}
                                    >
                                        Descargar Datos (.xlsx)
                                    </button>
                                </div>
                                
                                {mostrarTablaMoneda && (
                                    <div style={{ marginTop: '15px', maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: RADIUS, position: 'relative' }}>
                                        {isRenderingTabla ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                                                <div style={{ width: '30px', height: '30px', border: '3px solid var(--border-color)', borderTop: '3px solid var(--primary-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                                <p style={{ marginTop: '10px', fontSize: FS.sm, color: 'var(--text-muted)' }}>Cargando datos de la simulación...</p>
                                                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                                            </div>
                                        ) : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: FS.sm, color: 'var(--text-color)' }}>
                                            <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1, boxShadow: '0 1px 0 var(--border-color)' }}>
                                                <tr>
                                                    <th style={{ padding: '10px', fontWeight: 700 }}># Lanzamiento</th>
                                                    <th style={{ padding: '10px', fontWeight: 700 }}>Resultado</th>
                                                    <th style={{ padding: '10px', fontWeight: 700 }}>¿Es Éxito?</th>
                                                    <th style={{ padding: '10px', fontWeight: 700 }}>Éxitos Acumulados</th>
                                                    <th style={{ padding: '10px', fontWeight: 700 }}>Prob. Simulada</th>
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
                                        )}
                                    </div>
                                )}
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
                                                        <div style={{ width: '100%', height: '100%', minWidth: 0, padding: '15px' }}>
                                                            <ResponsiveContainer>
                                                                <LineChart data={datosSimulacion} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                                                    <XAxis dataKey="iteracion" stroke="var(--text-muted)" fontSize={12} />
                                                                    <YAxis domain={[0, 1]} stroke="var(--text-muted)" fontSize={12} />
                                                                    <Tooltip
                                                                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-color)' }}
                                                                        itemStyle={{ color: 'var(--primary-color)' }}
                                                                        formatter={(value) => value.toFixed(4)}
                                                                    />
                                                                    <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-color)' }} />
                                                                    <ReferenceLine y={datosSimulacion[0]?.teorica} stroke="#10b981" strokeDasharray="5 5" label={{ position: 'top', value: 'Prob. Teórica', fill: '#10b981', fontSize: 12 }} />
                                                                    <Line type="monotone" dataKey="empirica" name="Prob. Empírica" stroke="var(--primary-color)" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
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