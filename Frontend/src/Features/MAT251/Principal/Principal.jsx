import {
  esOperacionHNP, crearConfiguracionHNP, crearRecetaHNP, leerRecetaHNP, calcularRecetaHNP,
  configuracionRestauradaHNP, esOperacionHP, crearConfiguracionHP, crearRecetaHP, leerRecetaHP,
  calcularRecetaHP, configuracionRestauradaHP,
} from '../Historial/historial_Tema6';
import {
  esOperacionIntervalos, crearConfiguracionIntervalos, crearRecetaIntervalos, leerRecetaIntervalos,
  calcularRecetaIntervalos, configuracionRestauradaIntervalos, esOperacionPuntual,
  crearConfiguracionPuntual, crearRecetaPuntual, leerRecetaPuntual, calcularRecetaPuntual,
  configuracionRestauradaPuntual,
} from '../Historial/historial_Tema5';
import React, { useState, useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  deserializarValoresEspeciales, puedeActualizarHistorialMAT251, obtenerArchivoRealHistorialMAT251,
  leerDatosMatrizHistorial,
} from '../Historial/historialMAT251';
import {
  crearRecetaProbabilidad, leerRecetaProbabilidad, calcularRecetaProbabilidad, firmaRecetaProbabilidad,
  esOperacionTotal, crearRecetaTotal, leerRecetaTotal, calcularRecetaTotal, firmaEntradasTotal,
  crearRecetaAdicion, leerRecetaAdicion, calcularRecetaAdicion, firmaRecetaAdicion,
  crearRecetaMultiplicacion, leerRecetaMultiplicacion, calcularRecetaMultiplicacion,
  firmaRecetaMultiplicacion,
} from '../Historial/historial_Tema1';
import {
  crearRecetaDiscreta, leerRecetaDiscreta, calcularRecetaDiscreta, firmaEntradasDiscreta,
  vistaDiscretaInicial, crearRecetaContinua, leerRecetaContinua, calcularRecetaContinua,
  expandirBloquesContinua,
} from '../Historial/historial_Tema2';
import {
  MODELOS_DISCRETOS, crearEstadoModelosDiscretos, esOperacionModelosDiscretos,
  crearRecetaModelosDiscretos, leerRecetaModelosDiscretos, estimarRecetaModelosDiscretos,
  calcularRecetaModelosDiscretos, estadoRestauradoModelosDiscretos, MODELOS_CONTINUOS,
  crearEstadoModelosContinuos, esOperacionModelosContinuos, crearRecetaModelosContinuos,
  leerRecetaModelosContinuos, estimarRecetaModelosContinuos, calcularRecetaModelosContinuos,
  estadoRestauradoModelosContinuos,
} from '../Historial/historial_Tema3';
import {
  crearEstadoMuestral, crearRecetaMuestral, leerRecetaMuestral, calcularRecetaMuestral,
  estadoRestauradoMuestral, crearEstadoTyF, crearRecetaTyF, leerRecetaTyF, calcularRecetaTyF,
  estadoRestauradoTyF,
} from '../Historial/historial_Tema4';
import { useParams, useNavigate } from 'react-router-dom';
import 'react-data-grid/lib/styles.css';
import { useMAT251Data } from '../../../components/gestion_datos/DataContext';
import {
  obtenerElementosConteo, coincideConteoConEntradas, calcularTecnicasConteo, calcularProbabilidadClasica,
  calcularProbabilidadCondicional, calcularProbabilidadTotalParticion,
} from '../Matematicas/logica_Tema1';
import { calcularMomentosContinua } from '../Matematicas/logica_Tema2';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import '../styles/pages/Pantalla.css';
import '../styles/Temas/Tema1.css';

// ── IMPORTACIONES DE LA NUEVA ESTRUCTURA ──
import { FONT, FS, RADIUS, OPERACIONES, filaVacia, labelStyle } from '../Principal/Constantes';
import ModalAlerta from '../ui/ModalAlerta';
import ModalEditor, { textEditor } from '../Temas/Tema_1/Modales/Modal_Editor';
import ModalEventos from '../Temas/Tema_1/Modales/Modal_Eventos_Modify';
import ModalVariables from '../Temas/Tema_1/Modales/Modal_Variables';

import ControlesConteo from '../Temas/Tema_1/Controles/Controles_Conteo';
import ControlesProbabilidad from '../Temas/Tema_1/Controles/Controles_Probabilidad';
import ResultadosConteo from '../Temas/Tema_1/Resultados/Resultados_conteo';
import ResultadosProbabilidad from '../Temas/Tema_1/Resultados/Resultados_Probabilidad';
import ResultadosSimuladorTotal from '../Temas/Tema_1/Resultados/Resultados_SimuladorTotal';
import ControlesReglaAdicion from '../Temas/Tema_1/Controles/Controles_ReglaAdicion';
import ResultadosReglaAdicion from '../Temas/Tema_1/Resultados/Resultados_ReglaAdicion';
import ResultadosReglaMultiplicacion from '../Temas/Tema_1/Resultados/Resultados_ReglaMultiplicacion';
import ResultadosMuestreo from '../Temas/Tema_1/Resultados/Resultados_Muestreo';
import ResultadosEspacioContinuo from '../Temas/Tema_1/Resultados/Resultados_EspacioContinuo';
import Gestor_CalculadoraMuestral from '../Temas/Tema_4/Controles/Gestor_CalculadoraMuestral';
import Gestor_DistribucionesTyF from '../Temas/Tema_4/Controles/Gestor_DistribucionesTyF';
import Gestor_EstimacionPuntual, { Controles_EstimacionPuntual_UI } from '../Temas/Tema_5/Controles/Gestor_EstimacionPuntual';
import Gestor_EstimacionIntervalos, { Controles_EstimacionIntervalos_UI } from '../Temas/Tema_5/Controles/Gestor_EstimacionIntervalos';
import Gestor_HipotesisParametricas, { Controles_HP_UI } from '../Temas/Tema_6/Controles/Gestor_HipotesisParametricas';
import Gestor_HipotesisNoParametricas, { Controles_HNP_UI } from '../Temas/Tema_6/Controles/Gestor_HipotesisNoParametricas';
import Operacion from '../Temas/Tema_1/Controles/Operacion';
import Controles_DistribucionDiscreta from '../Temas/Tema_2/Controles/Controles_DistribucionDiscreta';
import Resultados_DistribucionDiscreta from '../Temas/Tema_2/Resultados/Resultados_DistribucionDiscreta';
import Controles_DistribucionContinua from '../Temas/Tema_2/Controles/Controles_DistribucionContinua';
import Resultados_DistribucionContinua from '../Temas/Tema_2/Resultados/Resultados_DistribucionContinua';
import '../styles/Temas/Tema2.css';

import Controles_ModelosDiscretos from '../Temas/Tema_3/Controles/Controles_ModelosDiscretos';
import Resultados_ModelosDiscretos from '../Temas/Tema_3/Resultados/Resultados_ModelosDiscretos';
import Controles_ModelosContinuos from '../Temas/Tema_3/Controles/Controles_ModelosContinuos';
import GraficoModelosContinuos from '../Graficas/Tema_3/GraficoModelosContinuos';
import Resultados_ModelosContinuos from '../Temas/Tema_3/Resultados/Resultados_ModelosContinuos';
import GraficoBastonesModelos from '../Graficas/Tema_3/GraficoBastonesModelos';
import ModalProcedimientoModelos from '../Temas/Tema_3/Modales/ModalProcedimientoModelos';
import ReportePDF_MAT251 from '../ui/ReportePDF_MAT251';

const construirResultadoConteo = (parametros) => {
    const elementosBase = obtenerElementosConteo(
        parametros.n, parametros.tipoElementos, parametros.customElementsInput || ''
    );
    const resultado = calcularTecnicasConteo(parametros.n, parametros.r, elementosBase);
    if (resultado?.error) return resultado;
    if (!Number.isFinite(resultado?.permutacion?.resultado)
        || !Number.isFinite(resultado?.combinacion?.resultado)) {
        return { error: 'El resultado excede el rango admitido. Reduce n o r.' };
    }
    return { ...resultado, ...parametros, elementosBase };
};

const Principal = forwardRef(function Principal({ usuario, selectedFile, setSelectedFile, selectedSheet, setSelectedSheet, reabrirState, onEstadoHistorialChange }, ref) {
    const { variables, actualizarVariable } = useMAT251Data();
    const { operacionId } = useParams();
    const navigate = useNavigate();

    // ── UI ───────────────────────────────────────────────────────────────────────
    const [panelAbierto, setPanelAbierto] = useState(true);
    const esHistorial = !!reabrirState?.snapshot;
    const operacionHistorial = reabrirState?.snapshot?.operacion || reabrirState?.calculoReabrir;
    const [operacion, setOperacion] = useState(operacionHistorial || operacionId || '');
    const [subTipoProbabilidad, setSubTipoProbabilidad] = useState('clasica');
    const [columnaParticion, setColumnaParticion] = useState(''); // Para probabilidad total

    // Sincronizar estado si la URL cambia externamente o por navegación
    useEffect(() => {
        if (esHistorial) {
            if (operacionHistorial) setOperacion(operacionHistorial);
            return;
        }
        if (operacionId && operacionId !== operacion) {
            setOperacion(operacionId);
            if (operacionId === 'probabilidad') setSubTipoProbabilidad('clasica');
        } else if (!operacionId && operacion) {
            setOperacion('');
        }
    }, [operacionId, esHistorial, operacionHistorial]);

    const nombreOperacion = useMemo(() => {
        if (!operacion) return '';
        for (const t of OPERACIONES) {
            const found = t.operaciones?.find(o => o.value === operacion);
            if (found) return found.label;
        }
        if (operacion === 'conteo') return 'Técnicas de Conteo';
        if (esOperacionTotal(operacion)) return 'Teorema de Probabilidad Total';
        if (operacion === 'regla_adicion') return 'Regla de la Adición';
        if (operacion === 'regla_multiplicacion') return 'Regla de la Multiplicación';
        if (operacion === 'muestreo') return 'Introducción al Muestreo';
        if (operacion === 'dist_uniforme') return 'Espacio Continuo';
        if (operacion === 'dist_discreta') return 'Variables Aleatorias Discretas';
        if (operacion === 'dist_continua') return 'Calculadora de Funciones Continuas';
        if (operacion === 'dist_continua_v2') return 'Variable Aleatoria Continua';
        if (operacion === 'Distribuciones_Discretas' || operacion === 'discretas' || operacion === 'distribuciones_discretas' || operacion === 'modelos_discretos') return 'Distribuciones Discretas';
        if (operacion === 'Distribuciones_Continuas' || operacion === 'continuas' || operacion === 'distribuciones_continuas' || operacion === 'modelos_continuos') return 'Distribuciones Continuas';
        if (operacion === 'distribuciones_muestrales') return 'Distribuciones Muestrales';
        if (operacion === 'tyf') return 'Distribuciones T y F';
        if (operacion === 'tamanio_muestra') return 'Tamaño de Muestra';
        if (operacion === 'probabilidad_muestral') return 'Probabilidad Muestral';
        if (operacion === 'Estimacion_puntual') return 'Estimación Puntual';
        if (operacion === 'Estimacion_intervalos') return 'Estimación por Intervalos';
        if (operacion === 'Hipotesis_parametricas') return 'Hipótesis Paramétricas';
        if (operacion === 'Hipotesis_noparametricas') return 'Hipótesis No Paramétricas';
        if (operacion === 'probabilidad') return 'Cálculo de Probabilidad';
        return 'Cálculo de Probabilidad';
    }, [operacion]);

    // ── Conteo ───────────────────────────────────────────────────────────────────
    const [n, setN] = useState('0');
    const [r, setR] = useState('0');
    const [resConteo, setResConteo] = useState(null);
    const [tipoElementos, setTipoElementos] = useState('letras');
    const [customElementsInput, setCustomElementsInput] = useState('');

    const parsedElements = useMemo(() => {
        if (!customElementsInput.trim()) {
            return [];
        }
        return customElementsInput.split(',').map(el => el.trim()).filter(Boolean);
    }, [customElementsInput]);

    const finalElements = useMemo(
        () => obtenerElementosConteo(n, tipoElementos, customElementsInput),
        [n, tipoElementos, customElementsInput]
    );
    const parametrosConteo = { n, r, tipoElementos, customElementsInput };
    // Si cambian las entradas, los resultados anteriores dejan de ser válidos.
    useEffect(() => {
        if (resConteo && !coincideConteoConEntradas(resConteo, { n, r, tipoElementos, customElementsInput })) {
            setResConteo(null);
        }
    }, [n, r, tipoElementos, customElementsInput, resConteo]);

    const restaurarConteo = (parametros) => {
        const valores = {
            n: String(parametros.n ?? ''),
            r: String(parametros.r ?? ''),
            tipoElementos: parametros.tipoElementos || 'letras',
            customElementsInput: parametros.customElementsInput || '',
        };
        setN(valores.n);
        setR(valores.r);
        setTipoElementos(valores.tipoElementos);
        setCustomElementsInput(valores.customElementsInput);
        const resultado = construirResultadoConteo(valores);
        setResConteo(resultado?.error ? null : resultado);
        setResProbabilidad(null);
    };

    // ── Probabilidad ─────────────────────────────────────────────────────────────
    const [filas, setFilas] = useState([filaVacia(1), filaVacia(2), filaVacia(3)]);
    const [eventoFavorable, setEventoFavorable] = useState([]);
    const [eventoCondicion, setEventoCondicion] = useState([]);
    const [resProbabilidad, setResProbabilidad] = useState(null);
    const [colProbClasica, setColProbClasica] = useState('');
    const [varSeleccionada, setVarSeleccionada] = useState(null);
    const [modalVars, setModalVars] = useState(false);
    const [modalEditor, setModalEditor] = useState(false);
    const [modalEvento, setModalEvento] = useState(false);
    const [modalCondicion, setModalCondicion] = useState(false);
    const [filasTemp, setFilasTemp] = useState([]);   // copia editable en el modal
    const [nombresEncabezadosTemp, setNombresEncabezadosTemp] = useState({});
    const [nombreEncabezadoManual, setNombreEncabezadoManual] = useState('');
    const [inputModeProb, setInputModeProb] = useState('matriz');
    const [datosExperimento, setDatosExperimento] = useState(null);
    const [manualN, setManualN] = useState('');
    const [manualF, setManualF] = useState('');
    const [recetaProbabilidadRestaurada, setRecetaProbabilidadRestaurada] = useState(null);
    const [versionProbabilidad, setVersionProbabilidad] = useState(0);
    const datosProbabilidadActuales = {
        operacion: 'probabilidad', selectedFile, selectedSheet, filas, varSeleccionada,
        subTipoProbabilidad, inputModeProb, colProbClasica, eventoFavorable, eventoCondicion,
        manualN, manualF, datosExperimento, resProbabilidad, nombreEncabezadoManual,
    };
    const recetaProbabilidadActual = crearRecetaProbabilidad(datosProbabilidadActuales);
    const firmaProbabilidadActual = firmaRecetaProbabilidad(recetaProbabilidadActual);
    const snapshotHistorial = reabrirState?.snapshot;
    // El historial usa su propia copia; nunca mezclarla con las variables del módulo.
    const variableHistorial = varSeleccionada
        || (snapshotHistorial ? leerDatosMatrizHistorial(snapshotHistorial).varSeleccionada : null);
    const variablesDisponibles = esHistorial
        ? (variableHistorial ? [variableHistorial] : [])
        : variables;
    useEffect(() => {
        if (operacion === 'probabilidad' && resProbabilidad
            && resProbabilidad._entradaProbabilidad !== firmaProbabilidadActual) {
            setResProbabilidad(null);
        }
    }, [operacion, firmaProbabilidadActual, resProbabilidad]);

    const restaurarProbabilidad = (snapshot) => {
        const receta = leerRecetaProbabilidad(snapshot);
        setSubTipoProbabilidad(receta.subTipo);
        setInputModeProb(receta.modo);
        setColProbClasica(receta.columna);
        setEventoFavorable(receta.eventoFavorable);
        setEventoCondicion(receta.eventoCondicion);
        setFilas(receta.filas);
        setVarSeleccionada(receta.varSeleccionada);
        setNombreEncabezadoManual(receta.nombreEncabezadoManual);
        setManualN(String(receta.parametros?.manualN ?? ''));
        setManualF(String(receta.parametros?.manualF ?? ''));
        setDatosExperimento(null);
        setRecetaProbabilidadRestaurada(receta);
        setVersionProbabilidad(version => version + 1);
        setResProbabilidad(calcularRecetaProbabilidad(receta));
        if (receta.modo === 'matriz' || receta.experimento?.fuente === 'encuesta') {
            setSelectedFile?.(obtenerArchivoRealHistorialMAT251(receta) || '');
            setSelectedSheet?.(receta.hoja ?? snapshot.referenciaArchivo?.hoja ?? 0);
        } else {
            setSelectedFile?.('');
            setSelectedSheet?.(0);
        }
    };
    const formulaProbRef = useRef(null);

    // ── Simulador Probabilidad Total ─────────────────────────────────────────────
    const [numRamas, setNumRamas] = useState(2);
    const [ramas, setRamas] = useState([]);
    const [errorSimulador, setErrorSimulador] = useState('');
    const [resultadoSimulador, setResultadoSimulador] = useState(null);
    const [colCausa, setColCausa] = useState('');
    const [colEvento, setColEvento] = useState('');
    const [valExito, setValExito] = useState('');
    const [modoTotal, setModoTotal] = useState('matriz');
    const [ramasManualesTotal, setRamasManualesTotal] = useState([
        { id: 1, name: 'Causa 1', pA: '', pBA: '' },
        { id: 2, name: 'Causa 2', pA: '', pBA: '' },
    ]);
    const [causasBayesMatrizTotal, setCausasBayesMatrizTotal] = useState([]);
    const [causasBayesManualTotal, setCausasBayesManualTotal] = useState([]);
    const causasBayesTotal = modoTotal === 'manual' ? causasBayesManualTotal : causasBayesMatrizTotal;
    const datosTotalActuales = {
        operacion, selectedFile, selectedSheet, filas, varSeleccionada, nombreEncabezadoManual,
        modoTotal, ramasManualesTotal, colCausa, colEvento, valExito,
        causasBayesTotal, resultadoSimulador,
    };
    const firmaTotalActual = firmaEntradasTotal(crearRecetaTotal(datosTotalActuales));
    useEffect(() => {
        if (esOperacionTotal(operacion) && resultadoSimulador
            && resultadoSimulador._entradaTotal !== firmaTotalActual) {
            setResultadoSimulador(null);
            setCausasBayesMatrizTotal([]);
            setCausasBayesManualTotal([]);
        }
    }, [operacion, firmaTotalActual, resultadoSimulador]);

    const restaurarTotal = (snapshot) => {
        const receta = leerRecetaTotal(snapshot);
        const calculo = calcularRecetaTotal(receta);
        setModoTotal(receta.modo);
        setRamasManualesTotal(receta.ramasManuales.length ? receta.ramasManuales : [
            { id: 1, name: 'Causa 1', pA: '', pBA: '' },
            { id: 2, name: 'Causa 2', pA: '', pBA: '' },
        ]);
        setColCausa(receta.colCausa);
        setColEvento(receta.colEvento);
        setValExito(String(receta.valExito));
        setFilas(receta.filas);
        setVarSeleccionada(receta.varSeleccionada);
        setNombreEncabezadoManual(receta.nombreEncabezadoManual);
        setResultadoSimulador(calculo.resultado || null);
        setRamas(calculo.resultado?.desglose || []);
        setCausasBayesMatrizTotal(receta.modo === 'matriz' ? calculo.resultado?.causasBayes || [] : []);
        setCausasBayesManualTotal(receta.modo === 'manual' ? calculo.resultado?.causasBayes || [] : []);
        setErrorSimulador('');
        setSelectedFile?.(obtenerArchivoRealHistorialMAT251(receta) || '');
        setSelectedSheet?.(receta.modo === 'matriz' ? receta.hoja ?? 0 : 0);
    };

    // ── Regla de Adición ─────────────────────────────────────────────────────────────
    const [colA_Adicion, setColA_Adicion] = useState('');
    const [valA_Adicion, setValA_Adicion] = useState('');
    const [colB_Adicion, setColB_Adicion] = useState('');
    const [valB_Adicion, setValB_Adicion] = useState('');
    const [resultadoAdicion, setResultadoAdicion] = useState(null);
    const [errorAdicion, setErrorAdicion] = useState('');
    const [modoAdicion, setModoAdicion] = useState('matriz');
    const [manualAdicion, setManualAdicion] = useState({
        nameA: 'A', nameB: 'B', pA: '', pB: '', pAB: '',
    });
    const datosAdicionActuales = {
        operacion, modoAdicion, manualAdicion, selectedFile, selectedSheet,
        filas, varSeleccionada, nombreEncabezadoManual,
        colA_Adicion, valA_Adicion, colB_Adicion, valB_Adicion, resultadoAdicion,
    };
    const firmaAdicionActual = firmaRecetaAdicion(crearRecetaAdicion(datosAdicionActuales));
    const firmaAdicionAnteriorRef = useRef(firmaAdicionActual);


    const calcularAdicion = () => {
        // Usar las mismas entradas para calcular, mostrar y guardar el resultado.
        const calculo = calcularRecetaAdicion(crearRecetaAdicion(datosAdicionActuales));
        setResultadoAdicion(calculo.resultado || null);
        setErrorAdicion(calculo.error || '');
        return calculo;
    };

    useEffect(() => {
        // Montar (o repetir el montaje en StrictMode) no es editar las entradas.
        if (firmaAdicionAnteriorRef.current === firmaAdicionActual) return;
        firmaAdicionAnteriorRef.current = firmaAdicionActual;
        if (operacion !== 'regla_adicion') return;
        setResultadoAdicion(anterior => (
            anterior && anterior._entradaAdicion !== firmaAdicionActual ? null : anterior
        ));
        setErrorAdicion('');
    }, [operacion, firmaAdicionActual]);

    const restaurarAdicion = (snapshot) => {
        const receta = leerRecetaAdicion(snapshot);
        const calculo = calcularRecetaAdicion(receta);

        setModoAdicion(receta.modo);
        setManualAdicion(receta.modo === 'manual' ? receta.parametros : {
            nameA: 'A', nameB: 'B', pA: '', pB: '', pAB: '',
        });
        setColA_Adicion(receta.modo === 'matriz' ? receta.parametros.colA : '');
        setValA_Adicion(receta.modo === 'matriz' ? String(receta.parametros.valA) : '');
        setColB_Adicion(receta.modo === 'matriz' ? receta.parametros.colB : '');
        setValB_Adicion(receta.modo === 'matriz' ? String(receta.parametros.valB) : '');
        setFilas(receta.filas);
        setVarSeleccionada(receta.varSeleccionada);
        setNombreEncabezadoManual(receta.nombreEncabezadoManual);
        setResultadoAdicion(calculo.resultado || null);
        setErrorAdicion(calculo.error || '');
        setSelectedFile?.(obtenerArchivoRealHistorialMAT251(receta) || '');
        setSelectedSheet?.(receta.modo === 'matriz' ? receta.hoja ?? 0 : 0);
    };

    // ── Regla de Multiplicación ──────────────────────────────────────────────────
    const [modReemplazo, setModReemplazo] = useState('con_reemplazo');
    const [colA_Mult, setColA_Mult] = useState('');
    const [valA_Mult, setValA_Mult] = useState('');
    const [colB_Mult, setColB_Mult] = useState('');
    const [valB_Mult, setValB_Mult] = useState('');
    const [resultadoMult, setResultadoMult] = useState(null);
    const [errorMult, setErrorMult] = useState('');
    const [modoMult, setModoMult] = useState('matriz');
    const [eventosManualesMult, setEventosManualesMult] = useState([
        { id: 'e1', name: 'A', prob: '' }, { id: 'e2', name: 'B', prob: '' },
    ]);
    const datosMultiplicacionActuales = {
        operacion, modoMult, eventosManualesMult, modReemplazo,
        selectedFile, selectedSheet, filas, varSeleccionada, nombreEncabezadoManual,
        colA_Mult, valA_Mult, colB_Mult, valB_Mult, resultadoMult,
    };
    const firmaMultiplicacionActual = firmaRecetaMultiplicacion(crearRecetaMultiplicacion(datosMultiplicacionActuales));
    const firmaMultiplicacionAnteriorRef = useRef(firmaMultiplicacionActual);
    const restauracionMultiplicacionRef = useRef(null);

    const cambiarModoMult = (modo) => {
        if (esHistorial || modo === modoMult) return;
        setModoMult(modo);
        setResultadoMult(null);
        setErrorMult('');
    };
    const cambiarReemplazoMult = (modo) => {
        setModReemplazo(modo);
    };
    const calcularMultiplicacion = () => {
        const calculo = calcularRecetaMultiplicacion(crearRecetaMultiplicacion(datosMultiplicacionActuales));
        setResultadoMult(calculo.resultado || null);
        setErrorMult(calculo.error || '');
        return calculo;
    };
    useEffect(() => {
        // El montaje inicial y su repetición en StrictMode no son una edición.
        if (firmaMultiplicacionAnteriorRef.current === firmaMultiplicacionActual) return;
        firmaMultiplicacionAnteriorRef.current = firmaMultiplicacionActual;
        const esRestauracion = restauracionMultiplicacionRef.current === firmaMultiplicacionActual;
        restauracionMultiplicacionRef.current = null;
        if (operacion !== 'regla_multiplicacion' || esRestauracion) return;
        setResultadoMult(anterior => (
            anterior && anterior._entradaMultiplicacion !== firmaMultiplicacionActual ? null : anterior
        ));
        setErrorMult('');
    }, [operacion, firmaMultiplicacionActual]);

    const restaurarMultiplicacion = (snapshot) => {
        const receta = leerRecetaMultiplicacion(snapshot);
        const calculo = calcularRecetaMultiplicacion(receta);
        restauracionMultiplicacionRef.current = firmaRecetaMultiplicacion(receta);
        setModoMult(receta.modo);
        setModReemplazo(receta.parametros.modReemplazo);
        setEventosManualesMult(receta.modo === 'manual'
            ? receta.parametros.eventos.map((evento, indice) => ({
                id: `e${indice + 1}`, name: evento.name, prob: String(evento.prob),
            })) : [{ id: 'e1', name: 'A', prob: '' }, { id: 'e2', name: 'B', prob: '' }]);
        setColA_Mult(receta.modo === 'matriz' ? receta.parametros.colA : '');
        setValA_Mult(receta.modo === 'matriz' ? receta.parametros.valA : '');
        setColB_Mult(receta.modo === 'matriz' ? receta.parametros.colB : '');
        setValB_Mult(receta.modo === 'matriz' ? receta.parametros.valB : '');
        setFilas(receta.filas);
        setVarSeleccionada(receta.varSeleccionada);
        setNombreEncabezadoManual(receta.nombreEncabezadoManual);
        setResultadoMult(calculo.resultado || null);
        setErrorMult(calculo.error || '');
        setSelectedFile?.(obtenerArchivoRealHistorialMAT251(receta) || '');
        setSelectedSheet?.(receta.modo === 'matriz' ? receta.hoja ?? 0 : 0);
    };


    // ── Muestreo ─────────────────────────────────────────────────────────────────
    const [metodoMuestreo, setMetodoMuestreo] = useState('mas');
    const [tamanoMuestra, setTamanoMuestra] = useState('');
    const [varEstratificacion, setVarEstratificacion] = useState('');
    const [resultadoMuestreo, setResultadoMuestreo] = useState(null);
    const [errorMuestreo, setErrorMuestreo] = useState('');

    // ── Uniforme ─────────────────────────────────────────────────────────────────
    const [varUniforme, setVarUniforme] = useState('');
    const [inputMin, setInputMin] = useState('');
    const [inputMax, setInputMax] = useState('');
    const [resultadoUniforme, setResultadoUniforme] = useState(null);
    const [errorUniforme, setErrorUniforme] = useState('');

    // ── Estimación Puntual ────────────────────────────────────────────────────────
    const [paramEstimacion, setParamEstimacion] = useState('media');
    const [modoEstimacion, setModoEstimacion] = useState('matriz');
    const [configuracionPuntual, setConfiguracionPuntual] = useState(crearConfiguracionPuntual);

    // ── Estimación por Intervalos ──────────────────────────────────────────────────
    const [paramIntervalos, setParamIntervalos] = useState('media');
    const [modoIntervalos, setModoIntervalos] = useState('matriz');
    const [confianzaIntervalos, setConfianzaIntervalos] = useState(95);
    const [configuracionIntervalos, setConfiguracionIntervalos] = useState(crearConfiguracionIntervalos);
    const [resultadoEstimacion, setResultadoEstimacion] = useState(null);
    // Tema 6: entradas y resultado de hipótesis paramétricas.
    const [pruebaHP, setPruebaHP] = useState('media_z');
    const [modoHP, setModoHP] = useState('matriz');
    const [configuracionHP, setConfiguracionHP] = useState(crearConfiguracionHP);
    const [pruebaHNP, setPruebaHNP] = useState('chi_cuadrada');
    const [modoHNP, setModoHNP] = useState('matriz');
    const [configuracionHNP, setConfiguracionHNP] = useState(crearConfiguracionHNP);
    const [resultadoHipotesis, setResultadoHipotesis] = useState(null);

    const operacionEstimacionAnteriorRef = useRef(operacion);
    useEffect(() => {
        const cambioOperacion = operacionEstimacionAnteriorRef.current !== operacion;
        operacionEstimacionAnteriorRef.current = operacion;
        if (!esHistorial && (cambioOperacion || (!esOperacionPuntual(operacion) && !esOperacionIntervalos(operacion)))) setResultadoEstimacion(null);
    }, [operacion, varSeleccionada?.id, esHistorial]);

    // Estado para el Modal de Alerta Global
    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Atención', tipo: 'warning' });
    const mostrarAlerta = (mensaje, titulo = 'Atención', tipo = 'warning') => {
        setModalAlerta({ isOpen: true, mensaje, titulo, tipo });
    };

    // Estados para Tema 2: Discreta y Continua
    const [datosDiscretos, setDatosDiscretos] = useState(null);
    const [modoDiscreta, setModoDiscreta] = useState('matriz');
    const [columnaDiscreta, setColumnaDiscreta] = useState('');
    const [tablaDiscreta, setTablaDiscreta] = useState([
        { id: 1, x: '', p: '' }, { id: 2, x: '', p: '' },
    ]);
    const [vistaDiscreta, setVistaDiscreta] = useState({ ...vistaDiscretaInicial });
    const datosDiscretaActuales = {
        operacion, modoDiscreta, columnaDiscreta, tablaDiscreta, vistaDiscreta, datosDiscretos,
        selectedFile, selectedSheet, filas, varSeleccionada, nombreEncabezadoManual,
    };
    const firmaDiscretaActual = firmaEntradasDiscreta(crearRecetaDiscreta(datosDiscretaActuales));
    const firmaDiscretaAnteriorRef = useRef(firmaDiscretaActual);
    const restauracionDiscretaRef = useRef(null);
    const cambiarModoDiscreta = (modo) => {
        if (esHistorial || modo === modoDiscreta) return;
        setModoDiscreta(modo);
        setDatosDiscretos(null);
    };
    const calcularDiscreta = () => {
        const calculo = calcularRecetaDiscreta(crearRecetaDiscreta(datosDiscretaActuales));
        setDatosDiscretos(calculo.resultado || { error: calculo.error });
        return calculo;
    };
    useEffect(() => {
        if (firmaDiscretaAnteriorRef.current === firmaDiscretaActual) return;
        firmaDiscretaAnteriorRef.current = firmaDiscretaActual;
        const esRestauracion = restauracionDiscretaRef.current === firmaDiscretaActual;
        restauracionDiscretaRef.current = null;
        if (operacion !== 'dist_discreta' || esRestauracion) return;
        setDatosDiscretos(anterior => (
            anterior && anterior._entradaDiscreta !== firmaDiscretaActual ? null : anterior
        ));
    }, [operacion, firmaDiscretaActual]);
    const restaurarDiscreta = (snapshot) => {
        const receta = leerRecetaDiscreta(snapshot);
        const calculo = calcularRecetaDiscreta(receta);
        restauracionDiscretaRef.current = firmaEntradasDiscreta(receta);
        setModoDiscreta(receta.modo);
        setColumnaDiscreta(receta.columna);
        setTablaDiscreta(receta.modo === 'manual'
            ? receta.tabla.map(([x, p], indice) => ({ id: indice + 1, x: String(x), p: String(p) }))
            : [{ id: 1, x: '', p: '' }, { id: 2, x: '', p: '' }]);
        setVistaDiscreta({ ...receta.vista });
        setFilas(receta.filas);
        setVarSeleccionada(receta.varSeleccionada);
        setNombreEncabezadoManual(receta.nombreEncabezadoManual);
        setDatosDiscretos(calculo.resultado || { error: calculo.error });
        setSelectedFile?.(obtenerArchivoRealHistorialMAT251(receta) || '');
        setSelectedSheet?.(receta.modo === 'matriz' ? receta.hoja ?? 0 : 0);
    };
    const [datosContinuos, setDatosContinuos] = useState(null);
    const [configuracionContinua, setConfiguracionContinua] = useState({ bloques: [], limiteA: '', limiteB: '', constante: null });
    const [calculandoContinua, setCalculandoContinua] = useState(false);
    const [errorContinua, setErrorContinua] = useState('');
    const [restauracionContinua, setRestauracionContinua] = useState(null);
    const solicitudContinuaRef = useRef(0);
    const continuaMontadaRef = useRef(false);
    useEffect(() => {
        continuaMontadaRef.current = true;
        return () => {
            continuaMontadaRef.current = false;
            solicitudContinuaRef.current++;
        };
    }, []);
    const datosContinuaActuales = { operacion, configuracionContinua, datosContinuos };
    const editarContinua = (cambio) => {
        solicitudContinuaRef.current++;
        setCalculandoContinua(false);
        setErrorContinua('');
        setDatosContinuos(null);
        setConfiguracionContinua(cambio);
    };
    const calcularContinua = async () => {
        const solicitud = ++solicitudContinuaRef.current;
        const receta = crearRecetaContinua(datosContinuaActuales);
        setCalculandoContinua(true);
        setErrorContinua('');
        setDatosContinuos(null);
        const calculo = await calcularRecetaContinua(receta, {
            continuarTrasConstante: !!configuracionContinua.constante,
            constantePrevia: configuracionContinua.constante,
        });
        if (!continuaMontadaRef.current || solicitud !== solicitudContinuaRef.current) return { cancelado: true };
        if (calculo.configuracion) setConfiguracionContinua(calculo.configuracion);
        setDatosContinuos(calculo.resultado || null);
        setErrorContinua(calculo.error || '');
        setCalculandoContinua(false);
        return calculo;
    };
    const restaurarContinua = (snapshot) => {
        solicitudContinuaRef.current++;
        const receta = leerRecetaContinua(snapshot);
        setConfiguracionContinua({
            bloques: expandirBloquesContinua(receta.bloques), limiteA: receta.limites[0], limiteB: receta.limites[1], constante: null,
        });
        setDatosContinuos(null);
        setErrorContinua('');
        setSelectedFile?.('');
        setSelectedSheet?.(0);
        setRestauracionContinua({ receta });
    };
    useEffect(() => {
        if (!restauracionContinua) return;
        let vigente = true;
        const solicitud = ++solicitudContinuaRef.current;
        setCalculandoContinua(true);
        calcularRecetaContinua(restauracionContinua.receta, {
            continuarTrasConstante: restauracionContinua.receta.etapa !== 'constante',
        }).then(calculo => {
            if (!vigente || !continuaMontadaRef.current || solicitud !== solicitudContinuaRef.current) return;
            if (calculo.configuracion) setConfiguracionContinua(calculo.configuracion);
            setDatosContinuos(calculo.resultado || null);
            setErrorContinua(calculo.error || '');
            setCalculandoContinua(false);
        });
        return () => { vigente = false; };
    }, [restauracionContinua]);
    // Resultados Tema 3
    // La condición puede editarse sin descartar la distribución ya graficada.
    const conservarGraficaSinCondicion = anterior => {
        if (!anterior || anterior._condicionPendiente) return anterior;
        const resultados = { ...anterior.resultados, probabilidadFinal: null };
        delete resultados.c;
        delete resultados.c1;
        delete resultados.c2;
        const siguiente = {
            ...anterior, condicion: null, resultados, _condicionPendiente: true,
            datosGrafico: anterior.datosGrafico.map(punto => 'fillY' in punto ? { ...punto, fillY: null } : punto),
        };
        delete siguiente._entradaModeloDiscreto;
        delete siguiente._entradaModeloContinuo;
        return siguiente;
    };
    const [datosTema3, setDatosTema3] = useState(null);
    const [modeloTema3Discreto, setModeloTema3Discreto] = useState('Bernoulli');
    const [estadoModelosDiscretos, setEstadoModelosDiscretos] = useState(crearEstadoModelosDiscretos);
    const datosModelosDiscretosActuales = {
        operacion, modeloTema3Discreto, estadoModelosDiscretos, datosTema3,
        filas, varSeleccionada, nombreEncabezadoManual, selectedFile, selectedSheet,
    };
    const invalidarModeloDiscreto = () => setDatosTema3(null);
    const editarModeloDiscreto = (cambio, soloCondicion = false) => {
        setEstadoModelosDiscretos(cambio);
        setDatosTema3(soloCondicion ? conservarGraficaSinCondicion : null);
    };
    const cambiarModeloDiscreto = modelo => {
        if (esHistorial || modelo === modeloTema3Discreto) return;
        setModeloTema3Discreto(modelo);
        setDatosTema3(null);
    };
    const estimarModeloDiscreto = () => {
        const receta = crearRecetaModelosDiscretos(datosModelosDiscretosActuales, false);
        const estimacion = estimarRecetaModelosDiscretos(receta);
        setDatosTema3(null);
        if (!estimacion.error) setEstadoModelosDiscretos(prev => ({ ...prev, [modeloTema3Discreto]: {
            ...prev[modeloTema3Discreto], yaCalculado: false,
            matriz: { ...prev[modeloTema3Discreto].matriz, ...estimacion.params, stats: estimacion.stats },
        } }));
        return estimacion;
    };
    const calcularModeloDiscreto = (soloGrafico = false) => {
        const receta = crearRecetaModelosDiscretos(datosModelosDiscretosActuales, !soloGrafico);
        const calculo = calcularRecetaModelosDiscretos(receta);
        setDatosTema3(anterior => calculo.resultado || conservarGraficaSinCondicion(anterior));
        if (calculo.resultado) setEstadoModelosDiscretos(prev => ({ ...prev, [modeloTema3Discreto]: {
            ...prev[modeloTema3Discreto], yaCalculado: true,
            matriz: calculo.estimacion ? {
                ...prev[modeloTema3Discreto].matriz, ...calculo.estimacion.params, stats: calculo.estimacion.stats,
            } : prev[modeloTema3Discreto].matriz,
        } }));
        return calculo;
    };
    const firmaDatosModelosDiscretos = (variable, datos, encabezado) => JSON.stringify({ encabezado: encabezado || '',
        nombre: variable?.nombre || '', columnas: variable?.nombresColumnas || [],
        filas: datos.map(fila => String(fila.valor ?? '').trim()).filter(Boolean),
    });
    const firmaDatosModelosActual = firmaDatosModelosDiscretos(varSeleccionada, filas, nombreEncabezadoManual);
    const firmaDatosModelosAnteriorRef = useRef(firmaDatosModelosActual);
    const restauracionDatosModelosRef = useRef(null);
    useEffect(() => {
        if (firmaDatosModelosAnteriorRef.current === firmaDatosModelosActual) return;
        firmaDatosModelosAnteriorRef.current = firmaDatosModelosActual;
        const esRestauracion = restauracionDatosModelosRef.current === firmaDatosModelosActual;
        restauracionDatosModelosRef.current = null;
        if (esRestauracion) return;
        setEstadoModelosDiscretos(prev => Object.fromEntries(Object.entries(prev).map(([modelo, estado]) => [modelo, {
            ...estado, yaCalculado: estado.modo === 'matriz' ? false : estado.yaCalculado,
            matriz: { ...estado.matriz, col: 0, valorExito: '', stats: null, p: '', n: '', N: '', K: '', lambda: '' },
        }])));
        setDatosTema3(anterior => anterior?.modo === 'matriz' ? null : anterior);
    }, [firmaDatosModelosActual]);
    const restaurarModelosDiscretos = snapshot => {
        const receta = leerRecetaModelosDiscretos(snapshot);
        const calculo = calcularRecetaModelosDiscretos(receta);
        restauracionDatosModelosRef.current = firmaDatosModelosDiscretos(receta.varSeleccionada, receta.filas, receta.nombreEncabezadoManual);
        setModeloTema3Discreto(MODELOS_DISCRETOS.includes(receta.modelo) ? receta.modelo : 'Bernoulli');
        setEstadoModelosDiscretos(estadoRestauradoModelosDiscretos(receta, calculo));
        setFilas(receta.filas);
        setVarSeleccionada(receta.varSeleccionada);
        setNombreEncabezadoManual(receta.nombreEncabezadoManual);
        setDatosTema3(calculo.resultado || null);
        setSelectedFile?.(obtenerArchivoRealHistorialMAT251(receta) || '');
        setSelectedSheet?.(receta.modo === 'matriz' ? receta.hoja ?? 0 : 0);
        if (calculo.error) mostrarAlerta(calculo.error);
    };
    const [datosTema3Continuos, setDatosTema3Continuos] = useState(null);
    const [modeloTema3Continuo, setModeloTema3Continuo] = useState('Uniforme');
    const [estadoModelosContinuos, setEstadoModelosContinuos] = useState(() => {
        const estados = crearEstadoModelosContinuos();
        // Apertura normal de la calculadora; la restauración del historial aplica su modo guardado.
        estados.FFisher.modo = 'matriz';
        return estados;
    });
    const datosModelosContinuosActuales = {
        operacion, modeloTema3Continuo, estadoModelosContinuos, datosTema3Continuos,
        filas, varSeleccionada, nombreEncabezadoManual, selectedFile, selectedSheet,
    };
    const invalidarModeloContinuo = () => setDatosTema3Continuos(null);
    const editarModeloContinuo = (cambio, soloCondicion = false) => {
        setEstadoModelosContinuos(cambio);
        setDatosTema3Continuos(soloCondicion ? conservarGraficaSinCondicion : null);
    };
    const cambiarModeloContinuo = modelo => {
        if (esHistorial || modelo === modeloTema3Continuo) return;
        setModeloTema3Continuo(modelo);
        setDatosTema3Continuos(null);
    };
    const estimarModeloContinuo = () => {
        const receta = crearRecetaModelosContinuos(datosModelosContinuosActuales, false);
        const estimacion = estimarRecetaModelosContinuos(receta);
        setDatosTema3Continuos(null);
        if (!estimacion.error) setEstadoModelosContinuos(prev => ({ ...prev, [modeloTema3Continuo]: {
            ...prev[modeloTema3Continuo], yaCalculado: false,
            matriz: { ...prev[modeloTema3Continuo].matriz, ...estimacion.params, stats: estimacion.stats },
        } }));
        return estimacion;
    };
    const calcularModeloContinuo = (soloGrafico = false) => {
        const receta = crearRecetaModelosContinuos(datosModelosContinuosActuales, !soloGrafico);
        const calculo = calcularRecetaModelosContinuos(receta);
        setDatosTema3Continuos(anterior => calculo.resultado || conservarGraficaSinCondicion(anterior));
        if (calculo.resultado) setEstadoModelosContinuos(prev => ({ ...prev, [modeloTema3Continuo]: {
            ...prev[modeloTema3Continuo], yaCalculado: true,
            matriz: calculo.estimacion ? {
                ...prev[modeloTema3Continuo].matriz, ...calculo.estimacion.params, stats: calculo.estimacion.stats,
            } : prev[modeloTema3Continuo].matriz,
        } }));
        return calculo;
    };
    const firmaDatosContinuosAnteriorRef = useRef(firmaDatosModelosActual);
    const restauracionDatosContinuosRef = useRef(null);
    useEffect(() => {
        if (firmaDatosContinuosAnteriorRef.current === firmaDatosModelosActual) return;
        firmaDatosContinuosAnteriorRef.current = firmaDatosModelosActual;
        const esRestauracion = restauracionDatosContinuosRef.current === firmaDatosModelosActual;
        restauracionDatosContinuosRef.current = null;
        if (esRestauracion) return;
        setEstadoModelosContinuos(prev => Object.fromEntries(Object.entries(prev).map(([modelo, estado]) => [modelo, {
            ...estado, yaCalculado: estado.modo === 'matriz' ? false : estado.yaCalculado,
            matriz: { ...estado.matriz, stats: null, a: '', b: '', mu: '', sigma: '', k: '', v1: '', v2: '', n: '' },
        }])));
        setDatosTema3Continuos(anterior => anterior?.modo === 'matriz' ? null : anterior);
    }, [firmaDatosModelosActual]);
    const restaurarModelosContinuos = snapshot => {
        const receta = leerRecetaModelosContinuos(snapshot);
        const calculo = calcularRecetaModelosContinuos(receta);
        restauracionDatosContinuosRef.current = firmaDatosModelosDiscretos(receta.varSeleccionada, receta.filas, receta.nombreEncabezadoManual);
        setModeloTema3Continuo(MODELOS_CONTINUOS.includes(receta.modelo) ? receta.modelo : 'Uniforme');
        setEstadoModelosContinuos(estadoRestauradoModelosContinuos(receta, calculo));
        setFilas(receta.filas);
        setVarSeleccionada(receta.varSeleccionada);
        setNombreEncabezadoManual(receta.nombreEncabezadoManual);
        setDatosTema3Continuos(calculo.resultado || null);
        setSelectedFile?.(obtenerArchivoRealHistorialMAT251(receta) || '');
        setSelectedSheet?.(receta.modo === 'matriz' ? receta.hoja ?? 0 : 0);
        if (calculo.error) mostrarAlerta(calculo.error);
    };
    const datosPuntualesActuales = { operacion, paramEstimacion, modoEstimacion, configuracionPuntual, resultadoEstimacion,
        filas, varSeleccionada, nombreEncabezadoManual, selectedFile, selectedSheet };
    const editarPuntual = (campo, valor) => {
        setConfiguracionPuntual(prev => campo === 'valorExito' ? { ...prev, valorExito: valor }
            : { ...prev, manual: { ...prev.manual, [campo]: valor } });
        setResultadoEstimacion(null);
    };
    const cambiarParametroPuntual = parametro => {
        if (esHistorial || parametro === paramEstimacion) return;
        setParamEstimacion(parametro);
        if (parametro === 'media' && modoEstimacion === 'manual') setModoEstimacion('matriz');
        setConfiguracionPuntual(crearConfiguracionPuntual());
        setResultadoEstimacion(null);
    };
    const cambiarModoPuntual = modo => {
        if (esHistorial || modo === modoEstimacion || (paramEstimacion === 'media' && modo === 'manual')) return;
        setModoEstimacion(modo);
        setResultadoEstimacion(null);
    };
    const calcularPuntual = () => {
        const calculo = calcularRecetaPuntual(crearRecetaPuntual(datosPuntualesActuales));
        setResultadoEstimacion(calculo.resultado || null);
        return calculo;
    };
    const firmaDatosPuntualAnteriorRef = useRef(firmaDatosModelosActual);
    const restauracionDatosPuntualRef = useRef(null);
    useEffect(() => {
        if (firmaDatosPuntualAnteriorRef.current === firmaDatosModelosActual) return;
        firmaDatosPuntualAnteriorRef.current = firmaDatosModelosActual;
        const restaurando = restauracionDatosPuntualRef.current === firmaDatosModelosActual;
        restauracionDatosPuntualRef.current = null;
        if (!restaurando) setResultadoEstimacion(anterior => anterior?.operacion === 'Estimacion_puntual' && anterior.modo === 'matriz' ? null : anterior);
    }, [firmaDatosModelosActual]);
    const restaurarPuntual = snapshot => {
        const receta = leerRecetaPuntual(snapshot);
        const calculo = calcularRecetaPuntual(receta);
        restauracionDatosPuntualRef.current = firmaDatosModelosDiscretos(receta.varSeleccionada, receta.filas, receta.nombreEncabezadoManual);
        setOperacion('Estimacion_puntual');
        setParamEstimacion(receta.parametro);
        setModoEstimacion(receta.modo);
        setConfiguracionPuntual(configuracionRestauradaPuntual(receta));
        setFilas(receta.filas);
        setVarSeleccionada(receta.varSeleccionada);
        setNombreEncabezadoManual(receta.nombreEncabezadoManual);
        setResultadoEstimacion(calculo.resultado || null);
        setSelectedFile?.(obtenerArchivoRealHistorialMAT251(receta) || '');
        setSelectedSheet?.(receta.modo === 'matriz' ? receta.hoja ?? 0 : 0);
        if (calculo.error) mostrarAlerta(calculo.error);
    };
    const datosIntervalosActuales = { operacion, paramIntervalos, modoIntervalos, confianzaIntervalos, configuracionIntervalos,
        resultadoEstimacion, filas, varSeleccionada, nombreEncabezadoManual, selectedFile, selectedSheet };
    const editarIntervalos = (campo, valor) => {
        setConfiguracionIntervalos(prev => ({ ...prev, [modoIntervalos]: { ...prev[modoIntervalos], [campo]: valor } }));
        setResultadoEstimacion(null);
    };
    const cambiarParametroIntervalos = parametro => {
        if (esHistorial || parametro === paramIntervalos) return;
        setParamIntervalos(parametro);
        setConfiguracionIntervalos(crearConfiguracionIntervalos());
        setResultadoEstimacion(null);
    };
    const cambiarModoIntervalos = modo => {
        if (esHistorial || modo === modoIntervalos) return;
        setModoIntervalos(modo);
        setResultadoEstimacion(null);
    };
    const cambiarConfianzaIntervalos = confianza => {
        if (confianza === confianzaIntervalos) return;
        setConfianzaIntervalos(confianza);
        setResultadoEstimacion(null);
    };
    const calcularIntervalos = () => {
        const calculo = calcularRecetaIntervalos(crearRecetaIntervalos(datosIntervalosActuales));
        setResultadoEstimacion(calculo.resultado || null);
        return calculo;
    };
    const firmaDatosIntervalosAnteriorRef = useRef(firmaDatosModelosActual);
    const restauracionDatosIntervalosRef = useRef(null);
    useEffect(() => {
        if (firmaDatosIntervalosAnteriorRef.current === firmaDatosModelosActual) return;
        firmaDatosIntervalosAnteriorRef.current = firmaDatosModelosActual;
        const restaurando = restauracionDatosIntervalosRef.current === firmaDatosModelosActual;
        restauracionDatosIntervalosRef.current = null;
        if (!restaurando) setResultadoEstimacion(anterior => anterior?.operacion === 'Estimacion_intervalos' && anterior.modo === 'matriz' ? null : anterior);
    }, [firmaDatosModelosActual]);
    const restaurarIntervalos = snapshot => {
        const receta = leerRecetaIntervalos(snapshot);
        const calculo = calcularRecetaIntervalos(receta);
        restauracionDatosIntervalosRef.current = firmaDatosModelosDiscretos(receta.varSeleccionada, receta.filas, receta.nombreEncabezadoManual);
        setOperacion('Estimacion_intervalos');
        setParamIntervalos(receta.parametro);
        setModoIntervalos(receta.modo);
        setConfianzaIntervalos(receta.confianza);
        setConfiguracionIntervalos(configuracionRestauradaIntervalos(receta));
        setFilas(receta.filas);
        setVarSeleccionada(receta.varSeleccionada);
        setNombreEncabezadoManual(receta.nombreEncabezadoManual);
        setResultadoEstimacion(calculo.resultado || null);
        setSelectedFile?.(obtenerArchivoRealHistorialMAT251(receta) || '');
        setSelectedSheet?.(receta.modo === 'matriz' ? receta.hoja ?? 0 : 0);
        if (calculo.error) mostrarAlerta(calculo.error);
    };
    const [resultadoMuestral, setResultadoMuestral] = useState(null);
    const [configuracionMuestral, setConfiguracionMuestral] = useState(crearEstadoMuestral);
    const datosMuestralesActuales = { operacion, configuracionMuestral, resultadoMuestral, filas, varSeleccionada,
        nombreEncabezadoManual, selectedFile, selectedSheet };
    const editarMuestral = (campo, valor) => {
        const esConsulta = ['condicion', 'valorX1', 'valorX2'].includes(campo);
        setConfiguracionMuestral(prev => {
            if (prev.vista === 'empirica') return { ...prev, empirica: { ...prev.empirica, [campo]: valor } };
            const activo = prev.calculadora[prev.distribucion];
            return { ...prev, calculadora: { ...prev.calculadora, [prev.distribucion]: {
                ...activo, ...(!esConsulta ? { condicion: 'menor_que', valorX1: '', valorX2: '' } : {}), [campo]: valor,
            } } };
        });
        setResultadoMuestral(anterior => esConsulta && anterior?._baseMuestral
            ? { ...anterior, resultados: anterior._baseMuestral, _entradaMuestral: null } : null);
    };
    const cambiarVistaMuestral = vista => {
        if (esHistorial || vista === configuracionMuestral.vista) return;
        setConfiguracionMuestral(prev => ({ ...prev, vista }));
        setResultadoMuestral(null);
    };
    const cambiarDistribucionMuestral = distribucion => {
        if (esHistorial || distribucion === configuracionMuestral.distribucion) return;
        setConfiguracionMuestral(prev => ({ ...prev, distribucion }));
        setResultadoMuestral(null);
    };
    const calcularMuestral = (evaluarCondicion = false) => {
        const calculo = calcularRecetaMuestral(crearRecetaMuestral(datosMuestralesActuales, evaluarCondicion));
        if (calculo.resultado) setResultadoMuestral(calculo.resultado);
        return calculo;
    };
    const firmaDatosMuestralAnteriorRef = useRef(firmaDatosModelosActual);
    const restauracionDatosMuestralRef = useRef(null);
    useEffect(() => {
        if (firmaDatosMuestralAnteriorRef.current === firmaDatosModelosActual) return;
        firmaDatosMuestralAnteriorRef.current = firmaDatosModelosActual;
        const restaurando = restauracionDatosMuestralRef.current === firmaDatosModelosActual;
        restauracionDatosMuestralRef.current = null;
        if (!restaurando) setResultadoMuestral(anterior => anterior?.distribucion === 'empirica' ? null : anterior);
    }, [firmaDatosModelosActual]);
    const operacionMuestralAnteriorRef = useRef(operacion);
    useEffect(() => {
        const cambioOperacion = operacionMuestralAnteriorRef.current !== operacion;
        operacionMuestralAnteriorRef.current = operacion;
        if (!esHistorial && (cambioOperacion || !['distribuciones_muestrales', 'tyf'].includes(operacion))) setResultadoMuestral(null);
    }, [operacion, varSeleccionada?.id, esHistorial]);
    const restaurarMuestral = snapshot => {
        const receta = leerRecetaMuestral(snapshot);
        const calculo = calcularRecetaMuestral(receta);
        restauracionDatosMuestralRef.current = firmaDatosModelosDiscretos(receta.varSeleccionada, receta.filas, receta.nombreEncabezadoManual);
        setConfiguracionMuestral(estadoRestauradoMuestral(receta));
        setFilas(receta.filas);
        setVarSeleccionada(receta.varSeleccionada);
        setNombreEncabezadoManual(receta.nombreEncabezadoManual);
        setResultadoMuestral(calculo.resultado || null);
        setSelectedFile?.(obtenerArchivoRealHistorialMAT251(receta) || '');
        setSelectedSheet?.(receta.modo === 'matriz' ? receta.hoja ?? 0 : 0);
        if (calculo.error) mostrarAlerta(calculo.error);
    };
    const [configuracionTyF, setConfiguracionTyF] = useState(crearEstadoTyF);
    const datosTyFActuales = { operacion, configuracionTyF, resultadoMuestral };
    const editarTyF = (campo, valor) => {
        const esConsulta = ['condicion', 'valorX1', 'valorX2'].includes(campo);
        setConfiguracionTyF(prev => ({ ...prev, formularios: { ...prev.formularios, [prev.distribucion]: {
            ...prev.formularios[prev.distribucion],
            ...(!esConsulta && prev.distribucion !== 'dif_medias_desc' ? { condicion: 'menor_que', valorX1: '', valorX2: '' } : {}), [campo]: valor,
        } } }));
        setResultadoMuestral(anterior => esConsulta && anterior?._baseTyF
            ? { ...anterior, resultados: anterior._baseTyF, _entradaTyF: null } : null);
    };
    const cambiarDistribucionTyF = distribucion => {
        if (esHistorial || configuracionTyF.distribucion === distribucion) return;
        setConfiguracionTyF(prev => ({ ...prev, distribucion }));
        setResultadoMuestral(null);
    };
    const calcularTyF = (evaluarCondicion = false) => {
        const calculo = calcularRecetaTyF(crearRecetaTyF(datosTyFActuales, evaluarCondicion));
        if (calculo.resultado) setResultadoMuestral(calculo.resultado);
        return calculo;
    };
    const restaurarTyF = snapshot => {
        const receta = leerRecetaTyF(snapshot);
        const calculo = calcularRecetaTyF(receta);
        setConfiguracionTyF(estadoRestauradoTyF(receta));
        setResultadoMuestral(calculo.resultado || null);
        setFilas([]);
        setVarSeleccionada(null);
        setNombreEncabezadoManual('');
        setSelectedFile?.('');
        setSelectedSheet?.(0);
        if (calculo.error) mostrarAlerta(calculo.error);
    };
    const datosHPActuales = { operacion, pruebaHP, modoHP, configuracionHP, resultadoHipotesis,
        filas, varSeleccionada, nombreEncabezadoManual, selectedFile, selectedSheet };
    const editarHP = (campo, valor) => {
        setConfiguracionHP(prev => ({ ...prev, [modoHP]: { ...prev[modoHP], [campo]: valor } }));
        setResultadoHipotesis(null);
    };
    const cambiarPruebaHP = prueba => {
        if (esHistorial || prueba === pruebaHP) return;
        setPruebaHP(prueba);
        setConfiguracionHP(crearConfiguracionHP());
        setResultadoHipotesis(null);
    };
    const cambiarModoHP = modo => {
        if (esHistorial || modo === modoHP) return;
        setModoHP(modo);
        setResultadoHipotesis(null);
    };
    const calcularHP = () => {
        const calculo = calcularRecetaHP(crearRecetaHP(datosHPActuales));
        setResultadoHipotesis(calculo.resultado || null);
        return calculo;
    };
    const firmaDatosHPAnteriorRef = useRef(firmaDatosModelosActual);
    const restauracionDatosHPRef = useRef(null);
    useEffect(() => {
        if (firmaDatosHPAnteriorRef.current === firmaDatosModelosActual) return;
        firmaDatosHPAnteriorRef.current = firmaDatosModelosActual;
        const restaurando = restauracionDatosHPRef.current === firmaDatosModelosActual;
        restauracionDatosHPRef.current = null;
        if (!restaurando) setResultadoHipotesis(anterior => anterior?.operacion === 'Hipotesis_parametricas' && anterior.modo === 'matriz' ? null : anterior);
    }, [firmaDatosModelosActual]);
    const restaurarHP = snapshot => {
        const receta = leerRecetaHP(snapshot);
        const calculo = calcularRecetaHP(receta);
        restauracionDatosHPRef.current = firmaDatosModelosDiscretos(receta.varSeleccionada, receta.filas, receta.nombreEncabezadoManual);
        setOperacion('Hipotesis_parametricas');
        setPruebaHP(receta.prueba);
        setModoHP(receta.modo);
        setConfiguracionHP(configuracionRestauradaHP(receta));
        setFilas(receta.filas);
        setVarSeleccionada(receta.varSeleccionada);
        setNombreEncabezadoManual(receta.nombreEncabezadoManual);
        setResultadoHipotesis(calculo.resultado || null);
        setSelectedFile?.(obtenerArchivoRealHistorialMAT251(receta) || '');
        setSelectedSheet?.(receta.modo === 'matriz' ? receta.hoja ?? 0 : 0);
        if (calculo.error) mostrarAlerta(calculo.error);
    };
    const datosHNPActuales = { operacion, pruebaHNP, modoHNP, configuracionHNP, resultadoHipotesis,
        filas, varSeleccionada, nombreEncabezadoManual, selectedFile, selectedSheet };
    const editarHNP = (campo, valor) => {
        if (esHistorial && ['subTipoChi', 'tipoChiCuadrada'].includes(campo)) return;
        setConfiguracionHNP(prev => {
            const actual = prev[modoHNP];
            return { ...prev, [modoHNP]: { ...actual, [campo]: typeof valor === 'function' ? valor(actual[campo]) : valor } };
        });
        setResultadoHipotesis(null);
    };
    const cambiarPruebaHNP = prueba => {
        if (esHistorial || prueba === pruebaHNP) return;
        setPruebaHNP(prueba);
        setConfiguracionHNP(crearConfiguracionHNP());
        setResultadoHipotesis(null);
    };
    const cambiarModoHNP = modo => {
        if (esHistorial || modo === modoHNP) return;
        setModoHNP(modo);
        setResultadoHipotesis(null);
    };
    const calcularHNP = () => {
        const calculo = calcularRecetaHNP(crearRecetaHNP(datosHNPActuales));
        setResultadoHipotesis(calculo.resultado || null);
        return calculo;
    };
    const firmaDatosHNPAnteriorRef = useRef(firmaDatosModelosActual);
    const restauracionDatosHNPRef = useRef(null);
    useEffect(() => {
        if (firmaDatosHNPAnteriorRef.current === firmaDatosModelosActual) return;
        firmaDatosHNPAnteriorRef.current = firmaDatosModelosActual;
        const restaurando = restauracionDatosHNPRef.current === firmaDatosModelosActual;
        restauracionDatosHNPRef.current = null;
        if (!restaurando && esOperacionHNP(operacion) && modoHNP === 'matriz') {
            setResultadoHipotesis(null);
            setConfiguracionHNP(prev => ({ ...prev, matriz: { ...prev.matriz, esperadasEditables: [],
                columnaSeleccionada: prev.matriz.columnaSeleccionada < Math.max(1, varSeleccionada?.nombresColumnas?.length || 0) ? prev.matriz.columnaSeleccionada : 0 } }));
        }
    }, [firmaDatosModelosActual, operacion, modoHNP, varSeleccionada]);
    const restaurarHNP = snapshot => {
        const receta = leerRecetaHNP(snapshot);
        const calculo = calcularRecetaHNP(receta);
        restauracionDatosHNPRef.current = firmaDatosModelosDiscretos(receta.varSeleccionada, receta.filas, receta.nombreEncabezadoManual);
        setOperacion('Hipotesis_noparametricas');
        setPruebaHNP(receta.prueba);
        setModoHNP(receta.modo);
        setConfiguracionHNP(configuracionRestauradaHNP(receta));
        setFilas(receta.filas);
        setVarSeleccionada(receta.varSeleccionada);
        setNombreEncabezadoManual(receta.nombreEncabezadoManual);
        setResultadoHipotesis(calculo.resultado || null);
        setSelectedFile?.(obtenerArchivoRealHistorialMAT251(receta) || '');
        setSelectedSheet?.(receta.modo === 'matriz' ? receta.hoja ?? 0 : 0);
        if (calculo.error) mostrarAlerta(calculo.error);
    };
    const simulacionSinHistorial = (esOperacionPuntual(operacion) && modoEstimacion === 'simulacion')
        || (operacion.toLowerCase() === 'estimacion_intervalos' && modoIntervalos === 'simulacion')
        || (esOperacionHP(operacion) && modoHP === 'simulacion')
        || (esOperacionHNP(operacion) && modoHNP === 'simulacion');
    const puedeGuardarCambiosHistorial = esHistorial && puedeActualizarHistorialMAT251(
        esOperacionHNP(operacion) ? datosHNPActuales
            : esOperacionHP(operacion) ? datosHPActuales
            : operacion === 'tyf' ? datosTyFActuales
            : esOperacionPuntual(operacion) ? datosPuntualesActuales
            : esOperacionIntervalos(operacion) ? datosIntervalosActuales
            : operacion === 'distribuciones_muestrales' ? datosMuestralesActuales
            : esOperacionModelosContinuos(operacion) ? datosModelosContinuosActuales
            : esOperacionModelosDiscretos(operacion) ? datosModelosDiscretosActuales
            : operacion === 'dist_continua' ? datosContinuaActuales
            : operacion === 'dist_discreta' ? datosDiscretaActuales
            : operacion === 'regla_multiplicacion' ? datosMultiplicacionActuales
            : operacion === 'regla_adicion' ? datosAdicionActuales
            : esOperacionTotal(operacion) ? datosTotalActuales
            : operacion === 'probabilidad' ? datosProbabilidadActuales
            : { operacion, n, r, tipoElementos, customElementsInput, resConteo },
        snapshotHistorial
    );
    useEffect(() => {
        onEstadoHistorialChange?.({
            snapshot: snapshotHistorial,
            habilitado: puedeGuardarCambiosHistorial, simulacionSinHistorial,
        });
    }, [onEstadoHistorialChange, snapshotHistorial, puedeGuardarCambiosHistorial, simulacionSinHistorial]);





    const [modalProcTema3, setModalProcTema3] = useState(false);

    // Resultados Tema 4 delegados a Gestor_CalculadoraMuestral




    const operacionHipotesisAnteriorRef = useRef(operacion);
    useEffect(() => {
        const cambioOperacion = operacionHipotesisAnteriorRef.current !== operacion;
        operacionHipotesisAnteriorRef.current = operacion;
        if ((!esOperacionHP(operacion) && !esOperacionHNP(operacion)) || (!esHistorial && cambioOperacion)) setResultadoHipotesis(null);
    }, [operacion, varSeleccionada?.id, esHistorial]);

    // ── EXPONER DATOS PARA GUARDAR EN HISTORIAL ──────────────────────────────────
    useImperativeHandle(ref, () => ({

        restablecerCalculoHistorial: () => {
            if (esOperacionHNP(operacion)) {
                restaurarHNP(reabrirState.snapshot);
                return;
            }
            if (esOperacionHP(operacion)) {
                restaurarHP(reabrirState.snapshot);
                return;
            }
            if (operacion === 'tyf') {
                restaurarTyF(reabrirState.snapshot);
                return;
            }
            if (esOperacionIntervalos(operacion)) {
                restaurarIntervalos(reabrirState.snapshot);
                return;
            }
            if (esOperacionPuntual(operacion)) {
                restaurarPuntual(reabrirState.snapshot);
                return;
            }
            if (operacion === 'distribuciones_muestrales') {
                restaurarMuestral(reabrirState.snapshot);
                return;
            }
            if (esOperacionModelosContinuos(operacion)) {
                restaurarModelosContinuos(reabrirState.snapshot);
                return;
            }
            if (esOperacionModelosDiscretos(operacion)) {
                restaurarModelosDiscretos(reabrirState.snapshot);
                return;
            }
            if (operacion === 'dist_continua') {
                restaurarContinua(reabrirState.snapshot);
                return;
            }
            if (operacion === 'dist_discreta') {
                restaurarDiscreta(reabrirState.snapshot);
                return;
            }
            if (operacion === 'regla_multiplicacion') {
                restaurarMultiplicacion(reabrirState.snapshot);
                return;
            }
            if (operacion === 'regla_adicion') {
                restaurarAdicion(reabrirState.snapshot);
                return;
            }
            if (esOperacionTotal(operacion)) {
                restaurarTotal(reabrirState.snapshot);
                return;
            }
            if (operacion === 'probabilidad') {
                restaurarProbabilidad(reabrirState.snapshot);
                return;
            }
            if (operacion !== 'conteo') return;
            const snapshot = reabrirState?.snapshot;
            const parametros = snapshot?.parametros || snapshot?.tema1?.conteo;
            if (parametros) restaurarConteo(parametros);
        },
        obtenerDatosParaHistorial: () => ({
            operacion,
            nombreOperacion,
            selectedFile,
            selectedSheet,
            filas,
            varSeleccionada,
            // Tema 1
            n, r, tipoElementos, customElementsInput, resConteo,
            subTipoProbabilidad, inputModeProb, colProbClasica, eventoFavorable, eventoCondicion, resProbabilidad,
            manualN, manualF, datosExperimento, nombreEncabezadoManual,
            numRamas, ramas, resultadoSimulador,
            modoTotal, ramasManualesTotal, causasBayesTotal, colCausa, colEvento, valExito,
            modoAdicion, manualAdicion,
            colA_Adicion, valA_Adicion, colB_Adicion, valB_Adicion, resultadoAdicion,
            modoMult, eventosManualesMult, modReemplazo, colA_Mult, valA_Mult, colB_Mult, valB_Mult, resultadoMult,
            metodoMuestreo, tamanoMuestra, varEstratificacion, resultadoMuestreo,
            varUniforme, inputMin, inputMax, resultadoUniforme,
            // Tema 2
            modoDiscreta, columnaDiscreta, tablaDiscreta, vistaDiscreta, datosDiscretos, configuracionContinua, datosContinuos,
            // Tema 3
            modeloTema3Discreto, estadoModelosDiscretos, datosTema3, modeloTema3Continuo, estadoModelosContinuos, datosTema3Continuos,
            // Tema 4
            configuracionMuestral, configuracionTyF, resultadoMuestral,
            // Tema 5
            paramEstimacion, modoEstimacion, configuracionPuntual, paramIntervalos, modoIntervalos, confianzaIntervalos, configuracionIntervalos, resultadoEstimacion,
            // Tema 6
            pruebaHP, modoHP, configuracionHP, pruebaHNP, modoHNP, configuracionHNP, resultadoHipotesis
        })
    }), [
        modoAdicion, manualAdicion,
        modoTotal, ramasManualesTotal, causasBayesTotal, colCausa, colEvento, valExito,
        operacion, nombreOperacion, selectedFile, selectedSheet, filas, varSeleccionada, reabrirState,
        n, r, tipoElementos, customElementsInput, resConteo,
        subTipoProbabilidad, inputModeProb, colProbClasica, eventoFavorable, eventoCondicion, resProbabilidad,
        manualN, manualF, datosExperimento, nombreEncabezadoManual,
        numRamas, ramas, resultadoSimulador,
        colA_Adicion, valA_Adicion, colB_Adicion, valB_Adicion, resultadoAdicion,
        modoMult, eventosManualesMult, modReemplazo, colA_Mult, valA_Mult, colB_Mult, valB_Mult, resultadoMult,
        metodoMuestreo, tamanoMuestra, varEstratificacion, resultadoMuestreo,
        varUniforme, inputMin, inputMax, resultadoUniforme,
        modoDiscreta, columnaDiscreta, tablaDiscreta, vistaDiscreta, datosDiscretos, configuracionContinua, datosContinuos, modeloTema3Discreto, estadoModelosDiscretos, datosTema3, modeloTema3Continuo, estadoModelosContinuos, datosTema3Continuos,
        configuracionMuestral, configuracionTyF, resultadoMuestral,
        paramEstimacion, modoEstimacion, configuracionPuntual, paramIntervalos, modoIntervalos, confianzaIntervalos, configuracionIntervalos, resultadoEstimacion,
        pruebaHP, modoHP, configuracionHP, pruebaHNP, modoHNP, configuracionHNP, resultadoHipotesis
    ]);

    // ── RESTAURACIÓN DE CÁLCULO REABIERTO DESDE HISTORIAL ─────────────────────────
    const calculoRestauradoRef = useRef(false);
    useEffect(() => {
        if (!reabrirState || calculoRestauradoRef.current) return;
        const snapRaw = reabrirState.snapshot;
        if (!snapRaw) return;

        calculoRestauradoRef.current = true;
        const snap = deserializarValoresEspeciales(snapRaw);

        const opDestino = snap.operacion || reabrirState.calculoReabrir;
        const esConteo = opDestino?.toLowerCase() === 'conteo';

        // Conteo siempre es manual; "Modo Manual" nunca es un archivo.
        if (esConteo || snap.modo === 'manual') {
            setSelectedFile?.('');
            setSelectedSheet?.(0);
        } else if (setSelectedFile) {
            setSelectedFile(obtenerArchivoRealHistorialMAT251(snap, reabrirState.archivoReabrir) || '');
        }
        if (!esConteo && snap.modo !== 'manual' && snap.referenciaArchivo?.hoja !== undefined && setSelectedSheet) {
            setSelectedSheet(snap.referenciaArchivo.hoja);
        }

        // 2. Restaurar operación activa
        if (opDestino) {
            setOperacion(opDestino);
        }

        // 3. Restaurar snapshot de filas y variable
        if (snap.datosSnapshot?.filas && Array.isArray(snap.datosSnapshot.filas)) {
            setFilas(snap.datosSnapshot.filas);
        }
        if (snap.datosSnapshot?.varSeleccionada) {
            setVarSeleccionada(snap.datosSnapshot.varSeleccionada);
        }

        // 4. Restaurar Tema 1
        if (snap.tema1) {
            const t1 = snap.tema1;

            if (t1.probabilidad) {
                if (t1.probabilidad.subTipo) setSubTipoProbabilidad(t1.probabilidad.subTipo);
                if (t1.probabilidad.modo) setInputModeProb(t1.probabilidad.modo);
                if (t1.probabilidad.columna) setColProbClasica(t1.probabilidad.columna);
                if (t1.probabilidad.favorables) setEventoFavorable(t1.probabilidad.favorables);
                if (t1.probabilidad.condicion) setEventoCondicion(t1.probabilidad.condicion);
                if (t1.probabilidad.resultado) setResProbabilidad(t1.probabilidad.resultado);
            }
            if (t1.simuladorTotal) {
                if (t1.simuladorTotal.numRamas) setNumRamas(t1.simuladorTotal.numRamas);
                if (t1.simuladorTotal.ramas) setRamas(t1.simuladorTotal.ramas);
                if (t1.simuladorTotal.resultado) setResultadoSimulador(t1.simuladorTotal.resultado);
            }
            if (t1.reglaAdicion) {
                if (t1.reglaAdicion.colA) setColA_Adicion(t1.reglaAdicion.colA);
                if (t1.reglaAdicion.valA) setValA_Adicion(t1.reglaAdicion.valA);
                if (t1.reglaAdicion.colB) setColB_Adicion(t1.reglaAdicion.colB);
                if (t1.reglaAdicion.valB) setValB_Adicion(t1.reglaAdicion.valB);
                if (t1.reglaAdicion.resultado) setResultadoAdicion(t1.reglaAdicion.resultado);
            }
            if (t1.reglaMultiplicacion) {
                if (t1.reglaMultiplicacion.modReemplazo) setModReemplazo(t1.reglaMultiplicacion.modReemplazo);
                if (t1.reglaMultiplicacion.colA) setColA_Mult(t1.reglaMultiplicacion.colA);
                if (t1.reglaMultiplicacion.valA) setValA_Mult(t1.reglaMultiplicacion.valA);
                if (t1.reglaMultiplicacion.colB) setColB_Mult(t1.reglaMultiplicacion.colB);
                if (t1.reglaMultiplicacion.valB) setValB_Mult(t1.reglaMultiplicacion.valB);
                if (t1.reglaMultiplicacion.resultado) setResultadoMult(t1.reglaMultiplicacion.resultado);
            }
            if (t1.muestreo) {
                if (t1.muestreo.metodo) setMetodoMuestreo(t1.muestreo.metodo);
                if (t1.muestreo.tamano) setTamanoMuestra(t1.muestreo.tamano);
                if (t1.muestreo.varEstratificacion) setVarEstratificacion(t1.muestreo.varEstratificacion);
                if (t1.muestreo.resultado) setResultadoMuestreo(t1.muestreo.resultado);
            }
            if (t1.espacioContinuo) {
                if (t1.espacioContinuo.variable) setVarUniforme(t1.espacioContinuo.variable);
                if (t1.espacioContinuo.min !== undefined) setInputMin(t1.espacioContinuo.min);
                if (t1.espacioContinuo.max !== undefined) setInputMax(t1.espacioContinuo.max);
                if (t1.espacioContinuo.resultado) setResultadoUniforme(t1.espacioContinuo.resultado);
            }
        }

        // 5. Restaurar Tema 2
        if (snap.tema2) {
            if (snap.tema2.discretos) setDatosDiscretos(snap.tema2.discretos);
            if (snap.tema2.continuos) setDatosContinuos(snap.tema2.continuos);
        }

        // 6. Restaurar Tema 3
        if (snap.tema === 3 || snap.tema3 || opDestino === 'Distribuciones_Continuas') {

            if (snap.tema3?.discretos) setDatosTema3(snap.tema3.discretos);
        }
        if (esConteo) {
            // Reabrir muestra el cálculo listo, sin temporizadores y con la misma
            // construcción de elementos que el botón de cálculo.
            const parametros = snap.parametros || snap.tema1?.conteo;
            if (parametros) restaurarConteo(parametros);
        }

        if (opDestino?.toLowerCase() === 'probabilidad') {
            restaurarProbabilidad(snap);
        }

        if (esOperacionTotal(opDestino)) restaurarTotal(snap);
        if (opDestino === 'regla_adicion') restaurarAdicion(snap);
        if (opDestino === 'regla_multiplicacion') restaurarMultiplicacion(snap);
        if (opDestino === 'dist_discreta') restaurarDiscreta(snap);
        if (opDestino === 'dist_continua') restaurarContinua(snap);
        if (esOperacionModelosDiscretos(opDestino)) restaurarModelosDiscretos(snap);
        if (esOperacionModelosContinuos(opDestino)) restaurarModelosContinuos(snap);

        // 7. Restaurar Tema 4
        if (opDestino === 'distribuciones_muestrales') {
            restaurarMuestral(snap);
        } else if (opDestino === 'tyf') {
            restaurarTyF(snap);
        } else if (snap.tema4?.resultado) {
            setResultadoMuestral(snap.tema4.resultado);
        }

        // 8. Restaurar Tema 5
        if (snap.tema5) {
            if (snap.tema5.paramEstimacion) setParamEstimacion(snap.tema5.paramEstimacion);
            if (snap.tema5.modoEstimacion) setModoEstimacion(snap.tema5.modoEstimacion);
            if (snap.tema5.paramIntervalos) setParamIntervalos(snap.tema5.paramIntervalos);
            if (snap.tema5.modoIntervalos) setModoIntervalos(snap.tema5.modoIntervalos);
            if (snap.tema5.confianzaIntervalos !== undefined) setConfianzaIntervalos(snap.tema5.confianzaIntervalos);
            if (snap.tema5.resultado) setResultadoEstimacion(snap.tema5.resultado);
        }

        if (esOperacionPuntual(opDestino)) restaurarPuntual(snap);
        else if (esOperacionIntervalos(opDestino)) restaurarIntervalos(snap);

        // 9. Restaurar Tema 6
        if (snap.tema6) {
            if (snap.tema6.pruebaHP) setPruebaHP(snap.tema6.pruebaHP);
            if (snap.tema6.modoHP) setModoHP(snap.tema6.modoHP);
            if (snap.tema6.pruebaHNP) setPruebaHNP(snap.tema6.pruebaHNP);
            if (snap.tema6.modoHNP) setModoHNP(snap.tema6.modoHNP);
            if (snap.tema6.resultado) setResultadoHipotesis(snap.tema6.resultado);
        }
        if (esOperacionHP(opDestino)) restaurarHP(snap);
        else if (esOperacionHNP(opDestino)) restaurarHNP(snap);
    }, [reabrirState, setSelectedFile, setSelectedSheet]);

    // ==========================================FUNCIONES //

    const handleCalcularContinuaV2 = (tipo, parametros) => {
        if (!tipo) {
            setDatosContinuosV2(null);
            return;
        }
        if (parametros.modoB) {
            setDatosContinuosV2({ tipo, parametros, resultados: null });
        } else {
            // const resultados = calcularMomentosTeoricos(tipo, parametros);
            // setDatosContinuosV2({ tipo, parametros, resultados });
        }
    };

    // Valores unicos de un Espacio mustral
    const valoresUnicos = useMemo(() => {
        const vals = filas.map(f => f.valor.toString().trim()).filter(Boolean);
        return [...new Set(vals)].sort();
    }, [filas]);

    // Conteos de datos (cargados vs agregados)
    const statsDatos = useMemo(() => {
        const validas = filas.filter(f => f.valor.toString().trim() !== '');
        const cargados = validas.filter(f => f.origen === 'cargado').length;
        const agregados = validas.filter(f => f.origen === 'agregado').length;
        return { cargados, agregados, total: validas.length };
    }, [filas]);

    const nombresEncabezadosActuales = useMemo(() => {
        if (varSeleccionada?.nombresColumnas?.length > 1) {
            return Object.fromEntries(varSeleccionada.nombresColumnas.map((nombre, idx) => [`col_${idx}`, nombre]));
        }

        return {
            valor: varSeleccionada?.nombre?.trim()
                || nombreEncabezadoManual
                || (subTipoProbabilidad === 'frecuentista' ? 'Observación' : 'Datos (Valores)')
        };
    }, [varSeleccionada, nombreEncabezadoManual, subTipoProbabilidad]);

    // Detectar cambios en datos o encabezados para habilitar Guardar.
    const hayCambiosEditor = useMemo(() => {
        let limpiosOriginal = filas.filter(f => (f.valor || '').toString().trim() !== '').map(f => (f.valor || '').toString().trim());
        let limpiosTemp = [];

        if (varSeleccionada?.nombresColumnas && varSeleccionada.nombresColumnas.length > 1) {
            limpiosTemp = filasTemp.filter(f => {
                return varSeleccionada.nombresColumnas.some((_, idx) => (f[`col_${idx}`] || '').toString().trim() !== '');
            }).map(f => varSeleccionada.nombresColumnas.map((_, idx) => (f[`col_${idx}`] || '').toString().trim()).join(' | '));
        } else {
            limpiosTemp = filasTemp.filter(f => (f.valor || '').toString().trim() !== '').map(f => (f.valor || '').toString().trim());
        }

        const cambiaronDatos = limpiosOriginal.length !== limpiosTemp.length
            || limpiosOriginal.some((val, idx) => val !== limpiosTemp[idx]);
        const cambiaronEncabezados = modalEditor && Object.entries(nombresEncabezadosActuales).some(([key, nombre]) => {
            const nombreNuevo = (nombresEncabezadosTemp[key] ?? nombre).trim();
            return nombreNuevo !== nombre.trim();
        });

        return cambiaronDatos || cambiaronEncabezados;
    }, [filas, filasTemp, varSeleccionada, modalEditor, nombresEncabezadosActuales, nombresEncabezadosTemp]);

    // Frecuencias para el selector de eventos
    const statsEventos = useMemo(() => {
        const counts = {};
        const validas = filas.map(f => (f.valor || '').toString().trim()).filter(Boolean);

        let colIndex = -1;
        if (varSeleccionada?.nombresColumnas?.length > 1 && colProbClasica) {
            colIndex = varSeleccionada.nombresColumnas.indexOf(colProbClasica);
        }

        validas.forEach(v => {
            if (v.includes(' | ') && varSeleccionada?.nombresColumnas?.length > 1) {
                const partes = v.split(' | ').map(p => p.trim());
                if (colIndex !== -1) {
                    const p = partes[colIndex];
                    if (p) counts[p] = (counts[p] || 0) + 1;
                } else {
                    partes.forEach(p => {
                        if (p) counts[p] = (counts[p] || 0) + 1;
                    });
                }
            } else {
                counts[v] = (counts[v] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .map(([valor, count]) => ({ valor, count }))
            .sort((a, b) => a.valor.localeCompare(b.valor));
    }, [filas, varSeleccionada, colProbClasica]);

    // Frecuencias agrupadas por columna (para datos multi-columna)
    const statsEventosPorColumna = useMemo(() => {
        const nombresColumnas = varSeleccionada?.nombresColumnas;
        if (!nombresColumnas || nombresColumnas.length <= 1) return null; // null = sin agrupación

        const validas = filas.map(f => (f.valor || '').toString().trim()).filter(Boolean);
        // Construir contadores por columna
        const porColumna = nombresColumnas.map(nombre => ({ nombre, counts: {} }));

        validas.forEach(v => {
            const partes = v.split(' | ').map(p => p.trim());
            nombresColumnas.forEach((_, idx) => {
                const val = partes[idx];
                if (val) porColumna[idx].counts[val] = (porColumna[idx].counts[val] || 0) + 1;
            });
        });

        return porColumna.map(col => ({
            nombre: col.nombre,
            eventos: Object.entries(col.counts)
                .map(([valor, count]) => ({ valor, count }))
                .sort((a, b) => a.valor.localeCompare(b.valor))
        }));
    }, [filas, varSeleccionada]);


    // Columnas dinámicas para el DataGrid (Editor)
    const columns = useMemo(() => {
        const base = [
            {
                key: 'id',
                name: 'Nº',
                width: 50,
                frozen: true,
                cellClass: 'rdg-cell-center'
            }
        ];

        if (varSeleccionada?.nombresColumnas && varSeleccionada.nombresColumnas.length > 1) {
            varSeleccionada.nombresColumnas.forEach((colName, idx) => {
                base.push({
                    key: `col_${idx}`,
                    name: colName,
                    renderEditCell: textEditor,
                    editable: true,
                    cellClass: 'rdg-cell-center'
                });
            });
            return base;
        }

        base.push({
            key: 'valor',
            name: varSeleccionada?.nombre ? ` ${varSeleccionada.nombre}` : (nombreEncabezadoManual || (subTipoProbabilidad === 'frecuentista' ? 'Observación' : 'Datos (Valores)')),
            renderEditCell: textEditor,
            editable: true,
            cellClass: 'rdg-cell-center'
        });
        return base;
    }, [varSeleccionada, subTipoProbabilidad, nombreEncabezadoManual]);

    const columnasEditor = useMemo(() => columns.map(column => {
        if (column.key === 'id') return column;

        return {
            ...column,
            renderHeaderCell: () => (
                <input
                    type="text"
                    aria-label={`Editar encabezado ${column.name}`}
                    title="Editar nombre de columna"
                    value={nombresEncabezadosTemp[column.key] ?? String(column.name).trim()}
                    onChange={event => setNombresEncabezadosTemp(prev => ({ ...prev, [column.key]: event.target.value }))}
                    onClick={event => event.stopPropagation()}
                    onKeyDown={event => event.stopPropagation()}
                    style={{
                        width: '100%',
                        minWidth: 0,
                        height: '100%',
                        padding: '4px',
                        border: '1px solid transparent',
                        borderRadius: '4px',
                        outline: 'none',
                        background: 'transparent',
                        color: 'var(--text-pure)',
                        font: 'inherit',
                        fontWeight: 700,
                        textAlign: 'center',
                        boxSizing: 'border-box'
                    }}
                    onFocus={event => { event.currentTarget.style.borderColor = 'var(--primary-color)'; }}
                    onBlur={event => { event.currentTarget.style.borderColor = 'transparent'; }}
                />
            )
        };
    }), [columns, nombresEncabezadosTemp]);

    // Derivar inputDatos desde filas
    const inputDatos = filas.map(f => f.valor.toString().trim()).filter(Boolean).join(', ');

    // Helpers

    const ajustar = (setFn, val, op) => {
        const v = parseInt(val) || 0;
        setFn(Math.max(0, op === '+' ? v + 1 : v - 1).toString());
    };

    const abrirEditor = () => {
        let temp = [...filas, filaVacia(filas.length + 1)];
        if (varSeleccionada?.nombresColumnas && varSeleccionada.nombresColumnas.length > 1) {
            temp = temp.map(f => {
                const parts = (f.valor || '').toString().split(' | ');
                const newF = { ...f };
                varSeleccionada.nombresColumnas.forEach((_, idx) => {
                    newF[`col_${idx}`] = parts[idx] ? parts[idx].trim() : '';
                });
                return newF;
            });
        }
        setFilasTemp(temp);
        setNombresEncabezadosTemp(nombresEncabezadosActuales);
        setModalEditor(true);
    };

    const guardarEditor = () => {
        const encabezadoGuardado = key => {
            const original = nombresEncabezadosActuales[key] || '';
            return (nombresEncabezadosTemp[key] ?? original).trim() || original;
        };

        let limpias = [];
        if (varSeleccionada?.nombresColumnas && varSeleccionada.nombresColumnas.length > 1) {
            const nombresColumnasActualizados = varSeleccionada.nombresColumnas.map((_, idx) => encabezadoGuardado(`col_${idx}`));
            const actualizarReferenciaColumna = setter => setter(nombreActual => {
                if (!nombreActual) return nombreActual;
                const idx = varSeleccionada.nombresColumnas.indexOf(nombreActual);
                return idx >= 0 ? nombresColumnasActualizados[idx] : nombreActual;
            });

            actualizarReferenciaColumna(setColProbClasica);
            actualizarReferenciaColumna(setColumnaParticion);
            actualizarReferenciaColumna(setColCausa);
            actualizarReferenciaColumna(setColEvento);
            actualizarReferenciaColumna(setColA_Adicion);
            actualizarReferenciaColumna(setColB_Adicion);
            actualizarReferenciaColumna(setColA_Mult);
            actualizarReferenciaColumna(setColB_Mult);
            actualizarReferenciaColumna(setVarEstratificacion);
            actualizarReferenciaColumna(setVarUniforme);

            setVarSeleccionada(prev => ({ ...prev, nombresColumnas: nombresColumnasActualizados }));
            if (!esHistorial && !varSeleccionada.esCombinada && varSeleccionada.id) {
                actualizarVariable(varSeleccionada.id, { nombresColumnas: nombresColumnasActualizados });
            }

            limpias = filasTemp.filter(f => {
                const isNotEmpty = varSeleccionada.nombresColumnas.some((_, idx) => (f[`col_${idx}`] || '').toString().trim() !== '');
                if (!isNotEmpty) return false;
                f.valor = varSeleccionada.nombresColumnas.map((_, idx) => (f[`col_${idx}`] || '').toString().trim()).join(' | ');
                return true;
            });
        } else {
            const nombreColumna = encabezadoGuardado('valor');
            if (varSeleccionada) {
                setVarSeleccionada(prev => ({ ...prev, nombre: nombreColumna }));
                if (!esHistorial && !varSeleccionada.esCombinada && varSeleccionada.id) {
                    actualizarVariable(varSeleccionada.id, { nombre: nombreColumna });
                }
            } else {
                setNombreEncabezadoManual(nombreColumna);
            }

            limpias = filasTemp.filter(f => (f.valor || '').toString().trim() !== '');
        }

        const renumeradas = limpias.map((f, i) => ({ ...f, id: i + 1, valor: f.valor }));
        setFilas(renumeradas.length ? renumeradas : [filaVacia(1)]);
        setEventoFavorable([]);
        setResProbabilidad(null);
        setDatosDiscretos(null);
        setDatosContinuos(null);
        setModalEditor(false);
    };

    const cargarVariable = (varsArray) => {
        const arr = Array.isArray(varsArray) ? varsArray : [varsArray];
        if (arr.length === 0) return;
        setNombreEncabezadoManual('');

        if (operacion === 'distribuciones_muestrales') {
            const tieneMultiplesCols = arr.length > 1 || 
                (arr[0]?.nombresColumnas && arr[0].nombresColumnas.length > 1) ||
                (arr[0]?.tipo && arr[0].tipo.toLowerCase().includes('mixta')) ||
                (arr[0]?.datos && arr[0].datos.some(d => typeof d === 'string' && d.includes(' | ')));
            if (tieneMultiplesCols) {
                mostrarAlerta("La variable debe tener 1 sola columna.", "Atención", "warning");
                return;
            }
        }

        const nombreCombinado = arr.map(v => v.nombre).join(' | ');
        const archivosOrigen = arr.map(v => typeof v.archivoOrigen === 'string' ? v.archivoOrigen.trim() : null);
        const archivoOrigen = archivosOrigen[0] && archivosOrigen.every(archivo => archivo === archivosOrigen[0]) ? archivosOrigen[0] : null;
        const hojaOrigen = archivoOrigen && arr.every(v => v.hojaOrigen === arr[0].hojaOrigen)
            && Number.isInteger(arr[0].hojaOrigen) && arr[0].hojaOrigen >= 0 ? arr[0].hojaOrigen : null;
        const longitud = arr[0]?.datos?.length || 0;
        const nuevas = [];

        for (let i = 0; i < longitud; i++) {
            const filaCombinada = arr.map(v => v.datos[i] !== undefined ? v.datos[i].toString() : '').join(' | ');
            nuevas.push({ id: i + 1, valor: filaCombinada, origen: 'cargado' });
        }

        setFilas(nuevas);
        setEventoFavorable([]);
        setEventoCondicion([]);
        setResProbabilidad(null);
        setDatosDiscretos(null);
        setDatosContinuos(null);
        setVarSeleccionada({
            nombre: nombreCombinado,
            archivoOrigen, hojaOrigen,
            esCombinada: arr.length > 1,
            datos: nuevas.map(n => n.valor),
            // Si es combinación de varias variables, los nombres de columna son los nombres de esas variables
            // Si es una sola variable, usa su propio nombresColumnas (puede existir si viene de Excel multi-col)
            nombresColumnas: arr.length > 1 ? arr.map(v => v.nombre) : (arr[0]?.nombresColumnas || null)
        });
        setModalVars(false);
    };

    const deseleccionarVariable = () => {
        setVarSeleccionada(null);
        setNombreEncabezadoManual('');
        setFilas([filaVacia(1), filaVacia(2), filaVacia(3)]);
        setEventoFavorable([]);
        setEventoCondicion([]);
        setColumnaParticion('');
        setResProbabilidad(null);
        setDatosDiscretos(null);
        setDatosContinuos(null);
    };

    // Sincronizar datos si la variable es editada/eliminada en Gestión de Datos
    useEffect(() => {
        if (!varSeleccionada || esHistorial || operacion === 'dist_continua') return;
        if (varSeleccionada.esCombinada) return; // Si es combinada omitimos la sincronización automática
        const variableEncontrada = variables.find(v => v.id === varSeleccionada.id)
            || variables.find(v => v.nombre === varSeleccionada.nombre);
        const varActualizada = variableEncontrada ? {
            ...variableEncontrada,
            archivoOrigen: variableEncontrada.archivoOrigen ?? null,
            hojaOrigen: variableEncontrada.hojaOrigen ?? null,
        } : null;

        if (!varActualizada) {
            setVarSeleccionada(null);
            setFilas([filaVacia(1), filaVacia(2), filaVacia(3)]);
            setEventoFavorable([]);
            setResProbabilidad(null);
            setDatosDiscretos(null);
            setDatosContinuos(null);
            return;
        }

        const datosViejos = JSON.stringify(varSeleccionada.datos);
        const datosNuevos = JSON.stringify(varActualizada.datos);
        const metadatosCambiaron = varSeleccionada.nombre !== varActualizada.nombre
            || JSON.stringify(varSeleccionada.nombresColumnas) !== JSON.stringify(varActualizada.nombresColumnas)
            || varSeleccionada.archivoOrigen !== varActualizada.archivoOrigen
            || varSeleccionada.hojaOrigen !== varActualizada.hojaOrigen;

        if (datosViejos !== datosNuevos) {
            setVarSeleccionada(varActualizada);
            const nuevas = varActualizada.datos.map((d, i) => ({ id: i + 1, valor: d.toString(), origen: 'cargado' }));
            setFilas(nuevas);
            setEventoFavorable([]);
            setEventoCondicion([]);
            setColumnaParticion('');
            setResProbabilidad(null);
            setDatosDiscretos(null);
            setDatosContinuos(null);
        } else if (metadatosCambiaron) {
            setVarSeleccionada(varActualizada);
        }
    }, [variables, varSeleccionada, esHistorial, operacion]);

    // Katex



    // Calcular

    const ejecutar = () => {
        if (operacion === 'probabilidad' && ['matriz', 'manual'].includes(inputModeProb)) {
            const resultado = calcularRecetaProbabilidad(recetaProbabilidadActual);
            setResProbabilidad(resultado);
            setResConteo(null);
            if (!resultado) mostrarAlerta(
                inputModeProb === 'manual'
                    ? 'Completa ambos valores: 0 ≤ favorables ≤ total y total mayor que cero. En condicional ingresa probabilidades entre 0 y 1.'
                    : 'Agrega datos y selecciona los eventos. En condicional también debes seleccionar la condición B.',
                'Revisa los parámetros', 'warning'
            );
            return;
        }
        if (operacion === 'conteo') {
            const res = construirResultadoConteo(parametrosConteo);
            if (res?.error) {
                setResConteo(null);
                mostrarAlerta(res.error, 'Error de Cálculo', 'error');
                return;
            }
            setResConteo(res);
            setResProbabilidad(null);
        } else {
            if (!inputDatos) { mostrarAlerta('Por favor, agrega datos al espacio muestral en la pestaña "Datos".', 'Faltan Datos', 'warning'); return; }
            let arr = inputDatos.split(',').map(d => d.trim()).filter(Boolean);

            // Si es probabilidad clásica o frecuentista y hay una columna seleccionada, extraemos solo esa columna
            if ((subTipoProbabilidad === 'clasica' || subTipoProbabilidad === 'frecuentista') && varSeleccionada?.nombresColumnas?.length > 1 && colProbClasica) {
                const colIdx = varSeleccionada.nombresColumnas.indexOf(colProbClasica);
                if (colIdx !== -1) {
                    arr = arr.map(row => {
                        const partes = row.split(' | ').map(p => p.trim());
                        return partes[colIdx];
                    }).filter(Boolean);
                }
            }

            if (subTipoProbabilidad === 'condicional') {
                const res = calcularProbabilidadCondicional(arr, eventoFavorable, eventoCondicion);
                if (res?.error) { mostrarAlerta(res.error, 'Error de Cálculo', 'error'); return; }
                setResProbabilidad(res);
                setResConteo(null);
            } else if (subTipoProbabilidad === 'total') {
                const res = calcularProbabilidadTotalParticion(arr, varSeleccionada?.nombresColumnas, columnaParticion, eventoFavorable);
                if (res?.error) { mostrarAlerta(res.error, 'Error de Cálculo', 'error'); return; }
                setResProbabilidad(res);
                setResConteo(null);
            } else {
                const res = calcularProbabilidadClasica(arr, eventoFavorable);
                if (res?.error) { mostrarAlerta(res.error, 'Error de Cálculo', 'error'); return; }
                setResProbabilidad(res);
                setResConteo(null);
            }
        }
    };

    const handleOperacion = (val) => {
        if (esHistorial) return;
        setOperacion(val);
        if (val) {
            navigate(`/MAT251/${val}`);
        } else {
            navigate('/MAT251');
        }
        if (val === 'probabilidad') setSubTipoProbabilidad('clasica');
        setResConteo(null);
        setResProbabilidad(null);
        setResultadoAdicion(null);
        setErrorAdicion('');
        setResultadoMult(null);
        setErrorMult('');
        setResultadoMuestreo(null);
        setErrorMuestreo('');
        setResultadoUniforme(null);
        setErrorUniforme('');
        setDatosDiscretos(null);
        setDatosContinuos(null);
    };



    const hayResultado = resConteo || resProbabilidad;

    // Filtrar la columna usada en la condición (B) para que no aparezca en el evento de interés (A)
    const statsEventosPorColumnaParaA = useMemo(() => {
        if (!statsEventosPorColumna) return null;
        if (eventoCondicion.length === 0) return statsEventosPorColumna;

        const columnasUsadasEnB = statsEventosPorColumna.filter(col =>
            col.eventos.some(e => eventoCondicion.includes(e.valor))
        ).map(col => col.nombre);

        return statsEventosPorColumna.filter(col => !columnasUsadasEnB.includes(col.nombre));
    }, [statsEventosPorColumna, eventoCondicion]);

    // Filtrar la columna usada en el evento de interés (A) para que no aparezca en la condición (B)
    const statsEventosPorColumnaParaB = useMemo(() => {
        if (!statsEventosPorColumna) return null;
        if (eventoFavorable.length === 0) return statsEventosPorColumna;

        const columnasUsadasEnA = statsEventosPorColumna.filter(col =>
            col.eventos.some(e => eventoFavorable.includes(e.valor))
        ).map(col => col.nombre);

        return statsEventosPorColumna.filter(col => !columnasUsadasEnA.includes(col.nombre));
    }, [statsEventosPorColumna, eventoFavorable]);

    return (
        <div className={`calculadora-layout ${panelAbierto ? '' : 'colapsado'}`} style={{ position: 'relative', fontFamily: FONT }}>
            {/* Estilos locales para el grid y modal */}
            <style>{`
                    .rdg-cell-center {
                    text-align: center !important;
                    line-height: 35px !important;
                    }
                    .rdg-header-row .rdg-cell {
                    text-align: center !important;
                    font-weight: 700 !important;
                    background-color: var(--bg-input) !important;
                    line-height: 35px !important;
                    color: var(--text-pure) !important;
                    }
                    .rdg-header-row .rdg-cell * {
                    color: var(--text-pure) !important;
                    }
                    .rdg-cell {
                    color: var(--text-pure) !important;
                    }
                    .btn-icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    transition: all 0.2s ease;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-weight: 600;
                    }
                    .btn-icon:hover {
                    transform: translateY(-1px);
                    filter: brightness(1.1);
                    }
            `}</style>
            <button id="tour-mat251-toggle-panel" onClick={() => setPanelAbierto(!panelAbierto)} className={`boton-toggle-medio ${panelAbierto ? 'abierto' : 'cerrado'}`} title={panelAbierto ? 'Ocultar panel' : 'Mostrar panel'}>
                <span className={`icono-toggle ${panelAbierto ? 'abierto' : 'cerrado'}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: FS.base, color: '#fff', transition: 'transform 0.3s ease', lineHeight: 0, marginTop: '-2px', marginLeft: '-1px' }}>❮</span>
            </button>

            {/* PANEL IZQUIERDO */}
            <div className="calculadora-datos" style={{ fontFamily: FONT }}>
                <div>
                    {panelAbierto && <h3 style={{ fontSize: FS.lg, fontFamily: FONT, fontWeight: 'bold', margin: '0 0 -6px', lineHeight: 1 }}>Parámetros</h3>}
                </div>
                {panelAbierto && (
                    <div className="panel-controles-excel" style={{ fontFamily: FONT, display: 'flex', flexDirection: 'column', marginTop: 0 }}>
                        {/* Selector de operación iterativo (Personalizado) */}
                        {/* Selector de operación iterativo (Personalizado) */}
                        <label style={{ ...labelStyle, fontSize: FS.xs }}>OPERACIÓN:</label>
                        <Operacion operacion={operacion} handleOperacion={handleOperacion} disabled={esHistorial} />

                        {/* Hint cuando no hay operación */}
                        {!operacion && (
                            <div style={{ padding: '10px', background: 'var(--bg-body, #f8fafc)', border: '1px dashed var(--border-color)', borderRadius: RADIUS, textAlign: 'center' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-color)', opacity: 0.5, marginBottom: '5px' }}>
                                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                                <p style={{ margin: 0, fontSize: FS.xs, color: 'var(--text-muted)'}}>
                                    Expande un tema y elige<br />una operación para continuar.
                                </p>
                            </div>
                        )}

                        {/* SUB-SELECTOR DE PROBABILIDAD */}
                        {operacion === 'probabilidad' && (
                            <div id="tour-mat251-tipo-probabilidad" style={{ marginBottom: '15px' }}>
                                <label style={{ ...labelStyle, color: 'var(--text-pure)', fontSize: '0.85rem', marginBottom: '10px' }}>Tipo de Probabilidad:</label>
                                <div style={{ display: 'flex', gap: '5px', background: 'var(--bg-card)', padding: '3px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                                    {[
                                        { id: 'clasica', label: 'Clásica' },
                                        { id: 'frecuentista', label: 'Frecuentista' },
                                        { id: 'condicional', label: 'Condicional' }
                                    ].map(tipo => (
                                        <button
                                            key={tipo.id}
                                            className={`btn-mat251-modo ${subTipoProbabilidad === tipo.id ? 'active' : ''}`}
                                            disabled={esHistorial && subTipoProbabilidad !== tipo.id}
                                            title={esHistorial && subTipoProbabilidad !== tipo.id ? 'El tipo de probabilidad está fijado por el historial' : undefined}
                                            onClick={() => {
                                                if (esHistorial) return;
                                                setSubTipoProbabilidad(tipo.id);
                                                if ((tipo.id !== 'clasica' && inputModeProb === 'experimentos') || (tipo.id === 'condicional' && inputModeProb === 'simulacion')) {
                                                    setInputModeProb('matriz');
                                                }
                                            }}
                                            style={{ flex: 1, padding: '5px 4px' }}
                                        >
                                            {tipo.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CONTROLES ESTIMACION PUNTUAL */}
                        {operacion === 'Estimacion_puntual' && (
                            <Controles_EstimacionPuntual_UI 
                                parametro={paramEstimacion} setParametro={cambiarParametroPuntual}
                                modo={modoEstimacion} setModo={cambiarModoPuntual} bloquearHistorial={esHistorial}
                            />
                        )}

                        {/* CONTROLES ESTIMACION INTERVALOS */}
                        {operacion === 'Estimacion_intervalos' && (
                            <Controles_EstimacionIntervalos_UI 
                                parametro={paramIntervalos} setParametro={cambiarParametroIntervalos}
                                modo={modoIntervalos} setModo={cambiarModoIntervalos}
                                confianza={confianzaIntervalos} setConfianza={cambiarConfianzaIntervalos} bloquearHistorial={esHistorial}
                            />
                        )}

                        {/* CONTROLES HIPOTESIS PARAMETRICAS */}
                        {operacion === 'Hipotesis_parametricas' && (
                            <Controles_HP_UI 
                                prueba={pruebaHP} setPrueba={cambiarPruebaHP} bloquearHistorial={esHistorial}
                            />
                        )}

                        {/* CONTROLES HIPOTESIS NO PARAMETRICAS */}
                        {operacion === 'Hipotesis_noparametricas' && (
                            <Controles_HNP_UI 
                                prueba={pruebaHNP} setPrueba={cambiarPruebaHNP} bloquearHistorial={esHistorial}
                            />
                        )}

                        {/* SEPARACION DE CONTROLES */}
                        {operacion === 'conteo' && (
                            <ControlesConteo
                                n={n} setN={setN} r={r} setR={setR}
                                ajustar={ajustar} ejecutar={ejecutar}

                                customElementsInput={customElementsInput}
                                setCustomElementsInput={setCustomElementsInput}
                                parsedElements={parsedElements}
                                tipoElementos={tipoElementos}
                                setTipoElementos={setTipoElementos}
                            />
                        )}
                        {(operacion === 'probabilidad' || esOperacionTotal(operacion) || operacion === 'regla_adicion' || operacion === 'regla_multiplicacion' || operacion === 'muestreo' || operacion === 'distribuciones_muestrales' || operacion === 'tamanio_muestra' || operacion === 'dist_uniforme' || operacion === 'esperanza_varianza' || operacion === 'momentos_asimetria' || operacion === 'Distribuciones_Discretas' || operacion === 'discretas' || operacion === 'distribuciones_discretas' || operacion === 'modelos_discretos' || operacion === 'Distribuciones_Continuas' || operacion === 'continuas' || operacion === 'distribuciones_continuas' || operacion === 'modelos_continuos' || operacion === 'dist_discreta' || operacion === 'Estimacion_puntual' || operacion === 'Estimacion_intervalos' || operacion === 'Hipotesis_parametricas' || operacion === 'Hipotesis_noparametricas') && (
                            <ControlesProbabilidad
                                setModalVars={setModalVars}
                                varSeleccionada={varSeleccionada}
                                variables={variablesDisponibles}
                                cargarVariable={cargarVariable}
                                setVarSeleccionada={setVarSeleccionada}
                                deseleccionarVariable={deseleccionarVariable}
                                operacion={operacion}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* PANEL RESULTADOS */}

            <div className="calculadora-resultados" style={{ fontFamily: FONT }}>
                <div className="frecuencias" style={{ borderRadius: RADIUS }}>
                    {operacion && (
                        <div className="titulo-operacion-calculadora" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: FONT }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>OPERACIÓN:</span>
                            <span style={{ color: 'var(--text-pure)' }}>
                                {nombreOperacion}
                            </span>
                        </div>
                    )}

                    {/* RESULTADOS */}
                    {!operacion ? (
                        <div style={{ padding: '10px 10px', fontFamily: FONT }}>
                            {/* Header bienvenida */}
                            <div className="banner-bienvenida">
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.9, marginBottom: '6px' }}>
                                    MAT 251 — Estadística Matemática
                                </div>
                                <p style={{ margin: 0, fontSize: FS.xs, opacity: 0.75 }}>
                                    Selecciona un tema del panel izquierdo para comenzar
                                </p>
                            </div>

                            {/* Tarjetas de los 6 temas */}
                            <div id="tour-mat251-contenedor-temas" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                                {[
                                    { num: '01', titulo: 'Cálculo de probabilidades e introducción al muestreo', ops: 5, activo: true },
                                    { num: '02', titulo: 'Variables aleatorias', ops: 2, activo: true },
                                    { num: '03', titulo: 'Distribuciones discretas y continuas importantes', ops: 2, activo: true },
                                    { num: '04', titulo: 'Distribuciones en el muestreo estadístico', ops: 2, activo: true },
                                    { num: '05', titulo: 'Estimación e inferencia estadística', ops: 2, activo: true }, 
                                    { num: '06', titulo: 'Pruebas de hipótesis paramétricas y no paramétricas', ops: 2, activo: true },
                                ].map(t => (
                                    <div key={t.num} id={`tour-mat251-card-tema${parseInt(t.num, 10)}`} style={{
                                        padding: '12px 14px',
                                        border: `1px solid ${t.activo ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                        borderRadius: RADIUS,
                                        background: t.activo ? 'rgba(0,123,255,0.04)' : 'var(--bg-card)',
                                        opacity: t.activo ? 1 : 0.55,
                                        cursor: t.activo ? 'default' : 'not-allowed',
                                        transition: 'all 0.2s',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: t.activo ? 'var(--primary-color)' : 'var(--text-muted)', lineHeight: 1 }}>
                                                T{t.num}
                                            </span>
                                            {t.activo ? (
                                                <span style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: '999px', background: 'rgba(0,123,255,0.12)', color: 'var(--primary-color)', fontWeight: 700 }}>
                                                    {t.ops} operaciones
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '0.65rem', padding: '2px 7px', borderRadius: '999px', background: 'rgba(148,163,184,0.15)', color: '#94a3b8', fontWeight: 600 }}>
                                                    Próximamente
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ margin: 0, fontSize: FS.xs, color: t.activo ? 'var(--text-color)' : 'var(--text-muted)', lineHeight: 1.4 }}>
                                            {t.titulo}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : operacion === 'dist_discreta' ? (
                        <div className="tema2-container">
                            <Controles_DistribucionDiscreta
                                varSeleccionada={varSeleccionada}
                                filas={filas}
                                statsDatos={statsDatos}
                                abrirEditor={abrirEditor}
                                modo={modoDiscreta} setModo={cambiarModoDiscreta}
                                columnaSeleccionada={columnaDiscreta} setColumnaSeleccionada={setColumnaDiscreta}
                                tabla={tablaDiscreta} setTabla={setTablaDiscreta}
                                bloquearModo={esHistorial} onCalcular={calcularDiscreta}
                            />
                            <Resultados_DistribucionDiscreta resultados={datosDiscretos} vista={vistaDiscreta} setVista={setVistaDiscreta} />
                        </div>
                    ) : operacion === 'dist_continua' ? (
                        <div className="tema2-container">
                            <div>
                                <Controles_DistribucionContinua
                                    configuracion={configuracionContinua} setConfiguracion={editarContinua}
                                    onCalcular={calcularContinua} calculando={calculandoContinua} errorCalculo={errorContinua}
                                />

                                {datosContinuos && !datosContinuos.soloConstante && (
                                    <div style={{ marginTop: '20px' }}>
                                        <Resultados_DistribucionContinua resultados={datosContinuos} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (operacion === 'Distribuciones_Discretas' || operacion === 'discretas' || operacion === 'distribuciones_discretas' || operacion === 'modelos_discretos') ? (
                        <div className="tema3-container">
                            <Controles_ModelosDiscretos
                                varSeleccionada={varSeleccionada}
                                filas={filas}
                                statsDatos={statsDatos}
                                abrirEditor={abrirEditor}
                                modelo={modeloTema3Discreto} setModelo={cambiarModeloDiscreto}
                                modelosState={estadoModelosDiscretos} setModelosState={editarModeloDiscreto}
                                bloquearModo={esHistorial} onEstimar={estimarModeloDiscreto}
                                onCalcular={calcularModeloDiscreto} onInvalidar={invalidarModeloDiscreto}
                            >
                                {datosTema3 && (
                                    <>
                                        <GraficoBastonesModelos
                                            datos={datosTema3.datosGrafico}
                                            condicion={datosTema3.condicion}
                                            resultados={datosTema3.resultados}
                                        />
                                        <Resultados_ModelosDiscretos
                                            resultados={datosTema3.resultados}
                                            modelo={datosTema3.modelo}
                                            params={datosTema3.params}
                                            condicion={datosTema3.condicion}
                                            onOpenProcedimiento={(tipo) => setModalProcTema3(tipo)}
                                        />
                                    </>
                                )}
                            </Controles_ModelosDiscretos>
                        </div>
                    ) : (operacion === 'Distribuciones_Continuas' || operacion === 'continuas' || operacion === 'distribuciones_continuas' || operacion === 'modelos_continuos') ? (
                        <div className="tema3-container">
                            <Controles_ModelosContinuos
                                varSeleccionada={varSeleccionada}
                                filas={filas}
                                statsDatos={statsDatos}
                                abrirEditor={abrirEditor}
                                modelo={modeloTema3Continuo} setModelo={cambiarModeloContinuo}
                                modelosState={estadoModelosContinuos} setModelosState={editarModeloContinuo}
                                bloquearModo={esHistorial} onEstimar={estimarModeloContinuo}
                                onCalcular={calcularModeloContinuo} onInvalidar={invalidarModeloContinuo}
                            >
                                {datosTema3Continuos && (
                                    <>
                                        <GraficoModelosContinuos
                                            datos={datosTema3Continuos.datosGrafico}
                                            condicion={datosTema3Continuos.condicion}
                                            resultados={datosTema3Continuos.resultados}
                                            modelo={datosTema3Continuos.modelo}
                                        />
                                        <Resultados_ModelosContinuos
                                            resultados={datosTema3Continuos.resultados}
                                            modelo={datosTema3Continuos.modelo}
                                            condicion={datosTema3Continuos.condicion}
                                            params={datosTema3Continuos.params}
                                            onOpenProcedimiento={(tipo) => setModalProcTema3(tipo)}
                                        />
                                    </>
                                )}
                            </Controles_ModelosContinuos>
                        </div>
                    ) : operacion === 'dist_uniforme' ? (
                        <ResultadosEspacioContinuo
                            varSeleccionada={varSeleccionada} filas={filas}
                            varUniforme={varUniforme} setVarUniforme={setVarUniforme}
                            inputMin={inputMin} setInputMin={setInputMin}
                            inputMax={inputMax} setInputMax={setInputMax}
                            resultado={resultadoUniforme} setResultado={setResultadoUniforme}
                            error={errorUniforme} setError={setErrorUniforme}
                            statsDatos={statsDatos} abrirEditor={abrirEditor}
                        />
                    ) : operacion === 'muestreo' ? (
                        <ResultadosMuestreo
                            varSeleccionada={varSeleccionada} filas={filas}
                            metodoMuestreo={metodoMuestreo} setMetodoMuestreo={setMetodoMuestreo}
                            tamanoMuestra={tamanoMuestra} setTamanoMuestra={setTamanoMuestra}
                            varEstratificacion={varEstratificacion} setVarEstratificacion={setVarEstratificacion}
                            resultado={resultadoMuestreo} setResultado={setResultadoMuestreo}
                            error={errorMuestreo} setError={setErrorMuestreo}
                            statsDatos={statsDatos} abrirEditor={abrirEditor}
                        />
                    ) : operacion === 'distribuciones_muestrales' ? (
                        <Gestor_CalculadoraMuestral
                            varSeleccionada={varSeleccionada} filas={filas} abrirEditor={abrirEditor}
                            configuracion={configuracionMuestral} onEditar={editarMuestral}
                            onCambiarVista={cambiarVistaMuestral} onCambiarDistribucion={cambiarDistribucionMuestral}
                            onGenerar={calcularMuestral} resultado={resultadoMuestral} bloquearHistorial={esHistorial}
                        />
                    ) : operacion === 'tyf' ? (
                        <Gestor_DistribucionesTyF
                            configuracion={configuracionTyF} resultado={resultadoMuestral}
                            onEditar={editarTyF} onGenerar={calcularTyF} onCambiarDistribucion={cambiarDistribucionTyF}
                            bloquearHistorial={esHistorial}
                        />
                    ) : operacion === 'regla_multiplicacion' ? (
                        <ResultadosReglaMultiplicacion
                            varSeleccionada={varSeleccionada} filas={filas}
                            inputMode={modoMult} setInputMode={cambiarModoMult}
                            manualEvents={eventosManualesMult} setManualEvents={setEventosManualesMult}
                            onCalcular={calcularMultiplicacion} bloquearModo={esHistorial}
                            modReemplazo={modReemplazo} setModReemplazo={cambiarReemplazoMult}
                            colA={colA_Mult} setColA={setColA_Mult} valA={valA_Mult} setValA={setValA_Mult}
                            colB={colB_Mult} setColB={setColB_Mult} valB={valB_Mult} setValB={setValB_Mult}
                            resultado={resultadoMult} setResultado={setResultadoMult}
                            error={errorMult} setError={setErrorMult}
                            statsDatos={statsDatos} abrirEditor={abrirEditor}
                        />
                    ) : operacion === 'regla_adicion' ? (
                        <ResultadosReglaAdicion
                            onCalcular={calcularAdicion}
                            inputMode={modoAdicion} setInputMode={setModoAdicion}
                            manualAdicion={manualAdicion} setManualAdicion={setManualAdicion}
                            bloquearModo={esHistorial}
                            resultado={resultadoAdicion} error={errorAdicion}
                            varSeleccionada={varSeleccionada} filas={filas}
                            colA={colA_Adicion} setColA={setColA_Adicion} valA={valA_Adicion} setValA={setValA_Adicion}
                            colB={colB_Adicion} setColB={setColB_Adicion} valB={valB_Adicion} setValB={setValB_Adicion}
                            setResultado={setResultadoAdicion} setError={setErrorAdicion}
                            statsDatos={statsDatos} abrirEditor={abrirEditor}
                        />
                    ) : esOperacionTotal(operacion) ? (
                        <ResultadosSimuladorTotal
                            inputMode={modoTotal} setInputMode={setModoTotal}
                            manualBranches={ramasManualesTotal} setManualBranches={setRamasManualesTotal}
                            causasBayesMatriz={causasBayesMatrizTotal} setCausasBayesMatriz={setCausasBayesMatrizTotal}
                            causasBayesManual={causasBayesManualTotal} setCausasBayesManual={setCausasBayesManualTotal}
                            bloquearModo={esHistorial}
                            filas={filas} varSeleccionada={varSeleccionada}
                            colCausa={colCausa} setColCausa={setColCausa}
                            colEvento={colEvento} setColEvento={setColEvento}
                            valExito={valExito} setValExito={setValExito}
                            ramas={ramas} setRamas={setRamas}
                            resultado={resultadoSimulador} setResultadoSimulador={setResultadoSimulador}
                            errorSimulador={errorSimulador} setErrorSimulador={setErrorSimulador}
                            statsDatos={statsDatos} abrirEditor={abrirEditor}
                        />
                    ) : operacion === 'Estimacion_puntual' ? (
                        <Gestor_EstimacionPuntual 
                            varSeleccionada={varSeleccionada} 
                            filas={filas} 
                            statsDatos={statsDatos} 
                            abrirEditor={abrirEditor} 
                            parametro={paramEstimacion}
                            modo={modoEstimacion}
                            setModo={cambiarModoPuntual} bloquearHistorial={esHistorial}
                            configuracion={configuracionPuntual} onEditar={editarPuntual}
                            onCalcular={calcularPuntual} resultado={resultadoEstimacion}
                        />
                    ) : operacion === 'Estimacion_intervalos' ? (
                        <Gestor_EstimacionIntervalos 
                            varSeleccionada={varSeleccionada} 
                            filas={filas} 
                            statsDatos={statsDatos} 
                            abrirEditor={abrirEditor} 
                            parametro={paramIntervalos}
                            setParametro={cambiarParametroIntervalos}
                            modo={modoIntervalos}
                            setModo={cambiarModoIntervalos}
                            confianza={confianzaIntervalos}
                            setConfianza={cambiarConfianzaIntervalos}
                            configuracion={configuracionIntervalos} onEditar={editarIntervalos} onCalcular={calcularIntervalos} resultado={resultadoEstimacion} bloquearHistorial={esHistorial}
                        />
                    ) : operacion === 'conteo' ? (
                        <ResultadosConteo resConteo={resConteo} hayResultado={hayResultado} />
                    ) : operacion === 'Hipotesis_parametricas' ? (
                        <Gestor_HipotesisParametricas 
                            varSeleccionada={varSeleccionada} 
                            filas={filas} 
                            statsDatos={statsDatos} 
                            abrirEditor={abrirEditor} 
                            prueba={pruebaHP}
                            modo={modoHP}
                            setModo={cambiarModoHP} bloquearHistorial={esHistorial}
                            configuracion={configuracionHP} onEditar={editarHP} onCalcular={calcularHP} resultado={resultadoHipotesis}
                        />
                    ) : operacion === 'Hipotesis_noparametricas' ? (
                        <Gestor_HipotesisNoParametricas 
                            varSeleccionada={varSeleccionada} 
                            filas={filas} 
                            statsDatos={statsDatos} 
                            abrirEditor={abrirEditor} 
                            prueba={pruebaHNP}
                            modo={modoHNP}
                            setModo={cambiarModoHNP} bloquearHistorial={esHistorial}
                            configuracion={configuracionHNP} onEditar={editarHNP} onCalcular={calcularHNP} resultado={resultadoHipotesis}
                        />
                    ) : (
                        <ResultadosProbabilidad
                            key={`${subTipoProbabilidad}-${inputModeProb}-${versionProbabilidad}`}
                            manualN={manualN} setManualN={setManualN}
                            manualF={manualF} setManualF={setManualF}
                            experimentoRestaurar={recetaProbabilidadRestaurada?.experimento}
                            statsDatos={statsDatos} abrirEditor={abrirEditor} valoresUnicos={valoresUnicos}
                            statsEventos={statsEventos} setModalEvento={setModalEvento}
                            eventoFavorable={eventoFavorable} setEventoFavorable={setEventoFavorable}
                            ejecutar={ejecutar} resProbabilidad={resProbabilidad} setResProbabilidad={setResProbabilidad} formulaProbRef={formulaProbRef}
                            inputDatos={inputDatos}
                            filas={filas}
                            tipo={subTipoProbabilidad}
                            eventoCondicion={eventoCondicion} setModalCondicion={setModalCondicion}
                            columnaParticion={columnaParticion} setColumnaParticion={setColumnaParticion}
                            varSeleccionada={varSeleccionada}
                            colProbClasica={colProbClasica} setColProbClasica={setColProbClasica}
                            inputMode={inputModeProb} setInputMode={setInputModeProb}
                            bloquearModos={esHistorial}
                            mostrarAlerta={mostrarAlerta}
                            onResultadoExperimento={setDatosExperimento}
                        />
                    )}
                </div>
            </div>

            {/* MODALES*/}
            <ModalEditor modalEditor={modalEditor} setModalEditor={setModalEditor} filasTemp={filasTemp} setFilasTemp={setFilasTemp} columns={columnasEditor} guardarEditor={guardarEditor} hayCambiosEditor={hayCambiosEditor} titulo={subTipoProbabilidad === 'frecuentista' ? 'Editor de Datos Históricos' : 'Editor de Espacio Muestral'} />
            <ModalEventos modalEvento={modalEvento} setModalEvento={setModalEvento} statsEventos={statsEventos} statsEventosPorColumna={(subTipoProbabilidad === 'clasica' || subTipoProbabilidad === 'frecuentista') ? null : statsEventosPorColumnaParaA} eventoFavorable={eventoFavorable} setEventoFavorable={setEventoFavorable} setResProbabilidad={setResProbabilidad} titulo={subTipoProbabilidad === 'frecuentista' ? 'Seleccionar Evento de Interés' : subTipoProbabilidad === 'condicional' ? 'Seleccionar Eventos para Interés (A)' : 'Seleccionar Eventos Favorables'} mostrarFrecuencia={subTipoProbabilidad === 'condicional' || (subTipoProbabilidad === 'frecuentista' && inputModeProb === 'matriz')} />
            <ModalEventos modalEvento={modalCondicion} setModalEvento={setModalCondicion} statsEventos={statsEventos} statsEventosPorColumna={statsEventosPorColumnaParaB} eventoFavorable={eventoCondicion} setEventoFavorable={setEventoCondicion} setResProbabilidad={setResProbabilidad} titulo="Seleccionar Eventos para Condición (B)" mostrarFrecuencia={subTipoProbabilidad === 'condicional'} />
            <ModalVariables modalVars={modalVars} setModalVars={setModalVars} variables={variablesDisponibles} cargarVariable={cargarVariable} />

            {/* Modales Tema 3 */}
            {modalProcTema3 && (
                (operacion === 'Distribuciones_Discretas' || operacion === 'discretas' || operacion === 'distribuciones_discretas' || operacion === 'modelos_discretos') && datosTema3 ? (
                    <ModalProcedimientoModelos
                        modelo={datosTema3.modelo}
                        params={datosTema3.params}
                        condicion={datosTema3.condicion}
                        momento={modalProcTema3}
                        onClose={() => setModalProcTema3(false)}
                    />
                ) : (operacion === 'Distribuciones_Continuas' || operacion === 'continuas' || operacion === 'distribuciones_continuas' || operacion === 'modelos_continuos') && datosTema3Continuos ? (
                    <ModalProcedimientoModelos
                        modelo={datosTema3Continuos.modelo}
                        params={datosTema3Continuos.params}
                        condicion={datosTema3Continuos.condicion}
                        momento={modalProcTema3}
                        onClose={() => setModalProcTema3(false)}
                    />
                ) : null
            )}

            {/* Modal de Alerta Global para MAT251 */}
            <ModalAlerta 
                isOpen={modalAlerta.isOpen}
                onClose={() => setModalAlerta({ ...modalAlerta, isOpen: false })}
                titulo={modalAlerta.titulo}
                mensaje={modalAlerta.mensaje}
                tipo={modalAlerta.tipo}
            />

            {/* Reporte Formal en PDF Off-Screen para MAT251 (Arquitectura Padre e Hijas) */}
            <ReportePDF_MAT251
                filas={filas}
                usuario={usuario}
                selectedFile={selectedFile}
                selectedSheet={selectedSheet}
                operacion={operacion}
                subTipoProbabilidad={subTipoProbabilidad}
                inputModeProb={inputModeProb}
                varSeleccionada={varSeleccionada}
                colProbClasica={colProbClasica}
                eventoFavorable={eventoFavorable}
                eventoCondicion={eventoCondicion}
                resConteo={resConteo}
                tipoElementos={tipoElementos}
                elementosBase={finalElements}
                resProbabilidad={resProbabilidad}
                resultadoAdicion={resultadoAdicion}
                colAAdicion={colA_Adicion}
                valAAdicion={valA_Adicion}
                colBAdicion={colB_Adicion}
                valBAdicion={valB_Adicion}
                resultadoMult={resultadoMult}
                resultadoSimulador={resultadoSimulador}
                datosDiscretos={datosDiscretos}
                datosContinuos={datosContinuos}
                datosTema3={datosTema3}
                datosTema3Continuos={datosTema3Continuos}
                resultadoMuestral={resultadoMuestral}
                resultadoEstimacion={resultadoEstimacion}
                paramEstimacion={paramEstimacion}
                modoEstimacion={modoEstimacion}
                paramIntervalos={paramIntervalos}
                modoIntervalos={modoIntervalos}
                confianzaIntervalos={confianzaIntervalos}
                resultadoHipotesis={resultadoHipotesis}
                pruebaHP={pruebaHP}
                modoHP={modoHP}
                pruebaHNP={pruebaHNP}
                modoHNP={modoHNP}
                datosExperimento={datosExperimento}
            />
        </div>
    );
});

export default Principal;
