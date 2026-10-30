import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FONT, FS, RADIUS } from '../../Principal/Constantes';
import { EditarDatos, IconoBasura, IconoClonar, IconoGuardar, Descargar } from '../../../../ui/iconos';
import MarcoWidgetMAT251 from '../../ui/MarcoWidgetMAT251';
import ModalAlerta from '../../ui/ModalAlerta';
import * as XLSX from 'xlsx';
import { api } from '../../../../services/api';
import { alerta } from '../../../../utils/Notificaciones';
import EspacioMuestralMatriz from './EspacioMuestralMatriz';
import StatLabel from '../../ui/StatLabel';
import {
  compactarSimulacionExperimento,
} from '../../Historial/historialMAT251';

function ResultadoMath({ expresion, displayMode = false, className }) {
    const html = katex.renderToString(expresion, { displayMode, throwOnError: false });
    return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

function FormulaEspacioMuestral({ contenidoLatex, displayMode = false }) {
    const html = useMemo(() => katex.renderToString(contenidoLatex, {
        displayMode,
        throwOnError: false
    }), [contenidoLatex, displayMode]);

    return (
        <div className="mat251-experimentos-formula-universo-simple">
            <StatLabel
                formulaKey="Omega"
                formulaLatex={'\\Omega'}
                align="center"
                position="top"
                className="mat251-experimentos-omega-label"
            />
            <span className="mat251-experimentos-matriz-igual" aria-hidden="true">=</span>
            <span className="mat251-experimentos-formula-universo-simple-contenido" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
    );
}

function IconoMoverExperimento() {
    return (
        <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor" aria-hidden="true">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
        </svg>
    );
}

function TarjetaExperimentoOrdenable({
    componente,
    index,
    sortable,
    puedeEliminar,
    clonada,
    refClonada,
    onClonar,
    onEliminar,
    onActualizar
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: componente.id, disabled: !sortable });

    const asignarRef = useCallback(node => {
        setNodeRef(node);
        if (refClonada) refClonada.current = node;
    }, [setNodeRef, refClonada]);

    const estiloOrdenable = sortable ? {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.72 : 1,
        zIndex: isDragging ? 5 : 1
    } : undefined;

    return (
        <article
            className={`mat251-experimentos-componente${clonada ? ' mat251-experimentos-componente-clonado' : ''}`}
            ref={asignarRef}
            style={estiloOrdenable}
        >
            {sortable && (
                <button
                    type="button"
                    className="btn-experimentos mat251-experimentos-mover-icono"
                    {...attributes}
                    {...listeners}
                    aria-label={`Mover ${componente.nombre || `Experimento ${index + 1}`}`}
                    title="Arrastra para reordenar"
                >
                    <IconoMoverExperimento />
                </button>
            )}
            <div className="mat251-experimentos-componente-titulo">
                <strong>Experimento {index + 1}</strong>
                <div className="mat251-experimentos-componente-acciones">
                    {sortable && (
                        <button
                            type="button"
                            className="btn-experimentos mat251-experimentos-clonar-icono"
                            onClick={onClonar}
                            aria-label={`Clonar ${componente.nombre || `Experimento ${index + 1}`}`}
                            title={`Clonar ${componente.nombre || `Experimento ${index + 1}`}`}
                        >
                            <IconoClonar width="16" height="16" />
                        </button>
                    )}
                    {sortable && puedeEliminar && (
                        <button
                            type="button"
                            className="btn-experimentos mat251-experimentos-quitar mat251-experimentos-quitar-icono"
                            onClick={onEliminar}
                            aria-label={`Eliminar ${componente.nombre || `Experimento ${index + 1}`}`}
                            title={`Eliminar ${componente.nombre || `Experimento ${index + 1}`}`}
                        >
                            <IconoBasura width="16" height="16" />
                        </button>
                    )}
                </div>
            </div>
            <label>
                <span className="mat251-experimentos-label">Nombre del experimento</span>
                <input
                    className="input-mat251 placeholder-small"
                    value={componente.nombre}
                    onChange={event => onActualizar(componente.id, 'nombre', event.target.value)}
                    placeholder="Ej.: Dado"
                    style={estiloCampo}
                />
            </label>
            <label>
                <span className="mat251-experimentos-label">Eventos</span>
                <input
                    className="input-mat251 placeholder-small"
                    value={componente.eventos}
                    onChange={event => onActualizar(componente.id, 'eventos', event.target.value)}
                    placeholder="Separados por coma: 1, 2, 3"
                    style={estiloCampo}
                />
            </label>
        </article>
    );
}

const LIMITE_UNIVERSO = 5000;
const LIMITE_REPETICIONES = 10000;
const OPERADORES_BASE = [
    { value: 'eq', math: '\\boldsymbol{=}', label: '=' },
    { value: 'neq', math: '\\boldsymbol{\\neq}', label: '≠' },
    { value: 'gt', math: '\\boldsymbol{>}', label: '>' },
    { value: 'gte', math: '\\boldsymbol{\\ge}', label: '≥' },
    { value: 'lt', math: '\\boldsymbol{<}', label: '<' },
    { value: 'lte', math: '\\boldsymbol{\\le}', label: '≤' }
];

const OPERADORES = OPERADORES_BASE.map(op => ({
    value: op.value,
    label: op.label,
    labelNode: (
        <span className="mat251-operador-opcion">
            <span className="mat251-operador-simbolo">{op.label}</span>
        </span>
    )
}));

const OPERADORES_CATEGORICOS = OPERADORES.slice(0, 2);

const esListaNumerica = (valores) => valores.length > 0 && valores.every(valor => {
    const texto = String(valor ?? '').trim();
    return texto !== '' && Number.isFinite(Number(texto));
});

const crearComponente = (id, nombre, eventos) => ({ id, nombre, eventos });
const crearRegla = (variables = []) => ({
    id: `regla-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tipo: 'variable',
    variable: variables[0]?.value ?? '',
    variableB: variables[1]?.value ?? variables[0]?.value ?? '',
    variablesSuma: variables.map(v => v.value),
    operador: 'eq',
    valor: ''
});

function SelectExperimentos({ value, options, onChange, ariaLabel, disabled = false }) {
    const [abierto, setAbierto] = useState(false);
    const [menuAlineadoDerecha, setMenuAlineadoDerecha] = useState(false);
    const [menuPosicion, setMenuPosicion] = useState(null);
    const ref = useRef(null);
    const activa = options.find(opcion => opcion.value === value);

    const alternarMenu = () => {
        if (abierto) {
            setAbierto(false);
            setMenuPosicion(null);
            return;
        }

        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            const esMovil = window.matchMedia('(max-width: 640px)').matches;

            if (esMovil) {
                const anchoViewport = window.innerWidth;
                const esOperador = Boolean(ref.current.closest('.mat251-experimentos-campo-operador'));
                const anchoMenu = esOperador
                    ? Math.min(76, anchoViewport - 16)
                    : Math.min(Math.max(rect.width, 140), 160, anchoViewport - 16);
                const altoMaximo = Math.min(Math.ceil(options.length * 34 + 2), 160, window.innerHeight * 0.4);
                const left = Math.max(8, Math.min(rect.left, anchoViewport - anchoMenu - 8));
                const top = rect.bottom + altoMaximo + 4 > window.innerHeight - 8
                    ? Math.max(8, rect.top - altoMaximo - 4)
                    : rect.bottom + 4;

                setMenuPosicion({ position: 'fixed', left: `${left}px`, top: `${top}px`, width: `${anchoMenu}px` });
                setMenuAlineadoDerecha(false);
            } else {
                const anchoMenu = Math.min(160, window.innerWidth - 24);
                setMenuAlineadoDerecha(rect.left + anchoMenu > window.innerWidth - 12);
                setMenuPosicion(null);
            }
        }
        setAbierto(true);
    };

    useEffect(() => {
        const cerrarFuera = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setAbierto(false);
                setMenuPosicion(null);
            }
        };
        const cerrarEscape = (event) => {
            if (event.key === 'Escape') {
                setAbierto(false);
                setMenuPosicion(null);
            }
        };
        document.addEventListener('mousedown', cerrarFuera);
        document.addEventListener('keydown', cerrarEscape);
        return () => {
            document.removeEventListener('mousedown', cerrarFuera);
            document.removeEventListener('keydown', cerrarEscape);
        };
    }, []);

    return (
        <div ref={ref} className="experimentos-select">
            <button
                type="button"
                className={`btn-experimentos experimentos-select-trigger${abierto ? ' abierto' : ''}`}
                aria-label={ariaLabel}
                aria-expanded={abierto}
                disabled={disabled || options.length === 0}
                onClick={alternarMenu}
            >
                <span>{activa?.labelNode ?? activa?.label ?? (options.length ? 'Seleccionar' : 'Sin opciones')}</span>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            {abierto && !disabled && options.length > 0 && (
                <div className={`experimentos-select-menu${menuAlineadoDerecha ? ' alineado-derecha' : ''}${menuPosicion ? ' flotante-movil' : ''}`} role="listbox" aria-label={ariaLabel} style={menuPosicion ?? undefined}>
                    {options.map(opcion => (
                        <button
                            type="button"
                            role="option"
                            aria-selected={opcion.value === value}
                            key={opcion.value}
                            className={`btn-experimentos experimentos-select-option${opcion.value === value ? ' seleccionada' : ''}`}
                            onClick={() => {
                                onChange(opcion.value);
                                setAbierto(false);
                                setMenuPosicion(null);
                            }}
                        >
                            {opcion.labelNode ?? opcion.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function parsearEventos(texto) {
    return String(texto ?? '').split(/[\n,;]/).map(valor => valor.trim()).filter(Boolean);
}

function escaparLatex(texto) {
    const caracteres = {
        '\\': '\\textbackslash{}',
        '{': '\\{',
        '}': '\\}',
        '$': '\\$',
        '&': '\\&',
        '#': '\\#',
        '%': '\\%',
        '_': '\\_',
        '^': '\\textasciicircum{}',
        '~': '\\textasciitilde{}'
    };
    return String(texto).replace(/[\\{}$&#%_^~]/g, caracter => caracteres[caracter]);
}

function valorComoLatex(valor, negrita = false) {
    const texto = String(valor ?? '');
    if (/^-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(texto)) {
        return negrita ? `\\mathbf{${texto}}` : texto;
    }
    const escapado = escaparLatex(texto);
    return negrita ? `\\textbf{${escapado}}` : `\\text{${escapado}}`;
}

function crearProductoCartesiano(componentes, limite) {
    return componentes.reduce((resultados, componente) => {
        const eventos = parsearEventos(componente.eventos);
        if (resultados.length * eventos.length > limite) return null;
        return resultados.flatMap(resultado => eventos.map(evento => ({
            ...resultado,
            [componente.id]: evento
        })));
    }, [{}]);
}

function maximoComunDivisor(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y) [x, y] = [y, x % y];
    return x || 1;
}

function compararValores(izquierda, operador, derecha) {
    const textoIzquierda = String(izquierda ?? '').trim();
    const textoDerecha = String(derecha ?? '').trim();
    const numeroIzquierda = Number(textoIzquierda);
    const numeroDerecha = Number(textoDerecha);
    const ambosNumericos = textoIzquierda !== '' && textoDerecha !== ''
        && Number.isFinite(numeroIzquierda) && Number.isFinite(numeroDerecha);
    const a = ambosNumericos ? numeroIzquierda : textoIzquierda;
    const b = ambosNumericos ? numeroDerecha : textoDerecha;

    switch (operador) {
        case 'eq': return a === b;
        case 'neq': return a !== b;
        case 'gt': return ambosNumericos && a > b;
        case 'gte': return ambosNumericos && a >= b;
        case 'lt': return ambosNumericos && a < b;
        case 'lte': return ambosNumericos && a <= b;
        default: return false;
    }
}

function evaluarRegla(regla, caso) {
    let izquierda;
    if (regla.tipo === 'suma') {
        const propiedadesDelCaso = new Set(Object.keys(caso));
        const esVariableNumericaEnCaso = id => propiedadesDelCaso.has(id)
            && String(caso[id] ?? '').trim() !== ''
            && Number.isFinite(Number(caso[id]));
        const variablesGuardadas = Array.isArray(regla.variablesSuma) ? regla.variablesSuma : [];
        const variablesValidas = [...new Set(variablesGuardadas.filter(esVariableNumericaEnCaso))];
        const variablesAlternativas = [...new Set([regla.variable, regla.variableB]
            .filter(id => id && esVariableNumericaEnCaso(id)))];
        const variables = variablesValidas.length >= 2 ? variablesValidas : variablesAlternativas;
        if (variables.length < 2) return false;

        const valores = variables.map(id => Number(caso[id]));
        if (valores.some(valor => !Number.isFinite(valor))) return false;
        izquierda = valores.reduce((total, valor) => total + valor, 0);
    } else {
        if (!regla.variable || !Object.prototype.hasOwnProperty.call(caso, regla.variable)) return false;
        izquierda = caso[regla.variable];
    }
    return compararValores(izquierda, regla.operador, regla.valor);
}

function numeroParaLatex(valor) {
    return Number(valor).toLocaleString('en-US').replace(/,/g, '\\,');
}



function evaluarReglas(reglas, caso) {
    const grupos = [[]];
    reglas.forEach((regla, index) => {
        if (index > 0 && regla.conector === 'or') grupos.push([]);
        grupos[grupos.length - 1].push(evaluarRegla(regla, caso));
    });
    return grupos.some(grupo => grupo.every(Boolean));
}

const estiloCampo = {
    width: '100%',
    minHeight: '38px',
    boxSizing: 'border-box',
    padding: '8px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: RADIUS,
    background: 'var(--bg-input)',
    color: 'var(--text-pure)',
    fontSize: FS.sm,
    fontFamily: FONT
};

function crearColumnasHistorialEnsayos(valores = []) {
    const encabezadosReservados = new Set([
        'Lanzamiento',
        '¿Es Éxito?',
        'Éxitos Acumulados',
        'Probabilidad Simulada'
    ]);
    const encabezadosUsados = new Set(encabezadosReservados);

    return valores.map((componente, indice) => {
        const nombre = String(componente.nombre || `Experimento ${indice + 1}`).trim();
        let encabezado = nombre;
        let sufijo = 2;
        while (encabezadosUsados.has(encabezado)) {
            encabezado = `${nombre} (${sufijo})`;
            sufijo++;
        }
        encabezadosUsados.add(encabezado);
        return { id: componente.id, encabezado };
    });
}

function convertirHistorialEnsayosAFilas(ensayos, columnas) {
    return ensayos.map(ensayo => {
        const fila = { Lanzamiento: ensayo.intento };
        columnas.forEach(columna => {
            fila[columna.encabezado] = ensayo.valores?.[columna.id] ?? '';
        });
        fila['¿Es Éxito?'] = ensayo.esFavorable ? 'Sí' : 'No';
        fila['Éxitos Acumulados'] = ensayo.exitosAcumulados;
        fila['Probabilidad Simulada'] = ensayo.probabilidadAcumulada.toFixed(4);
        return fila;
    });
}

function reconstruirSimulacionHistorial(simulacion, componentes, reglas, resultado) {
    const compacta = compactarSimulacionExperimento(simulacion, componentes);
    if (!compacta?.ensayos?.length) return null;
    const N = Number(compacta.N) || compacta.ensayos.length;
    const pTeorica = resultado.cantidadFavorable / resultado.total;
    const pasoGrafica = Math.max(1, Math.floor(N / 80));
    const historialEnsayos = [];
    const puntosGrafica = [];
    let exitos = 0;
    let ultimoCaso = null;
    let ultimoValores = [];
    let ultimoEsFavorable = false;
    compacta.ensayos.forEach((valores, indice) => {
        const caso = Object.fromEntries(componentes.map((componente, posicion) => [componente.id, valores[posicion]]));
        const intento = indice + 1;
        const esFavorable = evaluarReglas(reglas, caso);
        if (esFavorable) exitos++;
        ultimoCaso = componentes.map(c => `${c.nombre || c.id}: ${caso[c.id]}`).join('  ·  ');
        ultimoValores = componentes.map(c => ({
            id: c.id, nombre: c.nombre || c.id, valor: caso[c.id],
            eventos: [...new Set(parsearEventos(c.eventos))],
        }));
        ultimoEsFavorable = esFavorable;
        historialEnsayos.push({
            intento, caso: ultimoCaso, valores: caso, esFavorable,
            exitosAcumulados: exitos, probabilidadAcumulada: exitos / intento,
        });
        if (intento === 1 || intento % pasoGrafica === 0 || intento === N) {
            puntosGrafica.push({
                intento, empirica: Number((exitos / intento).toFixed(4)),
                teorica: Number(pTeorica.toFixed(4)),
            });
        }
    });
    const intentoActual = compacta.ensayos.length;
    const pEmpirica = exitos / intentoActual;
    return {
        N, exitos, intentoActual, pEmpirica, pTeorica,
        errorAbsoluto: Math.abs(pEmpirica - pTeorica),
        puntosGrafica, historialEnsayos, ultimoCaso, ultimoValores, ultimoEsFavorable,
    };
}

export default function Experimentos({ filas = [], varSeleccionada, abrirEditor, onResultadoExperimento, estadoRestaurar, bloquearTipo = false }) {
    const [fuente, setFuente] = useState(() => estadoRestaurar?.fuente || 'teorico');
    const [tipoExperimento, setTipoExperimento] = useState(() => estadoRestaurar?.tipoExperimento || 'simple');
    const [usarFrecuencias, setUsarFrecuencias] = useState(() => estadoRestaurar?.usarFrecuencias || false);
    const [columnaFrecuenciaSeleccionada, setColumnaFrecuenciaSeleccionada] = useState(() => estadoRestaurar?.columnaFrecuenciaSeleccionada || '');
    const [componentes, setComponentes] = useState(() => estadoRestaurar?.componentes || [
        crearComponente('componente-1', '', '')
    ]);
    const [componenteClonadoId, setComponenteClonadoId] = useState(null);
    const refComponenteClonado = useRef(null);
    const [reglas, setReglas] = useState(() => estadoRestaurar?.reglas || [crearRegla([{ value: 'componente-1' }])]);
    const [resultado, setResultado] = useState(null);
    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Atención', tipo: 'warning' });
    const siguienteComponente = useRef(Math.max(1, ...componentes.map(
        componente => Number(componente.id.match(/\d+$/)?.[0]) || 1
    )) + 1);
    const limiteUniversoAvisado = useRef(false);
    const restauracionPendienteRef = useRef(!!estadoRestaurar);
    const simulacionPendienteRef = useRef(!!estadoRestaurar);

    const [iteracionesSim, setIteracionesSim] = useState(() => estadoRestaurar?.iteracionesSim || '');
    const [resultadoSimulacion, setResultadoSimulacion] = useState(null);
    const [simulando, setSimulando] = useState(false);
    const [pausado, setPausado] = useState(false);
    const [velocidadSim, setVelocidadSim] = useState(() => estadoRestaurar?.velocidadSim || '1x');
    const [paginaActualTabla, setPaginaActualTabla] = useState(1);
    const FILAS_POR_PAGINA = 10;

    const refTimeout = useRef(null);
    const refPausado = useRef(false);
    const refSimulando = useRef(false);
    const refVelocidad = useRef('1x');
    const resumeRef = useRef(null);
    const publicarSimulacionRef = useRef(null);
    const generacionSimulacionRef = useRef(0);
    const firmaConfiguracion = JSON.stringify({
        fuente, tipoExperimento, componentes, reglas, usarFrecuencias,
        columnaFrecuenciaSeleccionada,
        filas: fuente === 'encuesta' ? filas : [],
        columnas: fuente === 'encuesta' ? varSeleccionada?.nombresColumnas : null,
        nombreVariable: fuente === 'encuesta' ? varSeleccionada?.nombre : null,
    });

    useEffect(() => {
        if (resultado && resultado._configuracion !== firmaConfiguracion) invalidarResultados();
    }, [firmaConfiguracion, resultado]);

    useEffect(() => {
        const vigente = resultado && resultado._configuracion === firmaConfiguracion;
        onResultadoExperimento?.(vigente ? {
            resultado, tipoExperimento, componentes, reglas, fuente, usarFrecuencias,
            columnaFrecuenciaSeleccionada, iteracionesSim, resultadoSimulacion, velocidadSim, simulando,
        } : null);
    }, [resultado, firmaConfiguracion, tipoExperimento, componentes, reglas, fuente,
        usarFrecuencias, columnaFrecuenciaSeleccionada, iteracionesSim, resultadoSimulacion,
        velocidadSim, simulando, onResultadoExperimento]);

    useEffect(() => () => onResultadoExperimento?.(null), [onResultadoExperimento]);
    const sensoresExperimentos = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const mostrarAlertaModal = (titulo, mensaje, tipo = 'warning') => {
        setModalAlerta({ isOpen: true, mensaje, titulo, tipo });
    };

    const cerrarModalAlerta = () => {
        setModalAlerta(prev => ({ ...prev, isOpen: false }));
    };

    const setError = (mensaje) => {
        if (!mensaje) {
            cerrarModalAlerta();
            return;
        }
        mostrarAlertaModal('Revisa los datos', mensaje, 'warning');
    };

    useEffect(() => {
        if (!componenteClonadoId) return;
        refComponenteClonado.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }, [componenteClonadoId]);

    useEffect(() => {
        refVelocidad.current = velocidadSim;
    }, [velocidadSim]);

    useEffect(() => {
        return () => {
            if (refTimeout.current) clearTimeout(refTimeout.current);
            refTimeout.current = null;
            generacionSimulacionRef.current += 1;
            refSimulando.current = false;
            refPausado.current = false;
            resumeRef.current = null;
            publicarSimulacionRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (!resultado) {
            if (refTimeout.current) clearTimeout(refTimeout.current);
            refTimeout.current = null;
            generacionSimulacionRef.current += 1;
            refSimulando.current = false;
            refPausado.current = false;
            resumeRef.current = null;
            publicarSimulacionRef.current = null;
            setSimulando(false);
            setPausado(false);
            setResultadoSimulacion(null);
            setPaginaActualTabla(1);
        }
    }, [resultado]);

    const detenerSimulacion = () => {
        publicarSimulacionRef.current?.();
        if (refTimeout.current) clearTimeout(refTimeout.current);
        refTimeout.current = null;
        generacionSimulacionRef.current += 1;
        refSimulando.current = false;
        refPausado.current = false;
        resumeRef.current = null;
        publicarSimulacionRef.current = null;
        setSimulando(false);
        setPausado(false);
        setPaginaActualTabla(1);
    };

    const invalidarResultados = () => {
        detenerSimulacion();
        setResultadoSimulacion(null);
        setResultado(null);
        setPaginaActualTabla(1);
    };

    const alternarPausa = () => {
        if (pausado) {
            refPausado.current = false;
            setPausado(false);
            if (resumeRef.current) resumeRef.current();
        } else {
            publicarSimulacionRef.current?.();
            refPausado.current = true;
            setPausado(true);
            if (refTimeout.current) clearTimeout(refTimeout.current);
            refTimeout.current = null;
        }
    };

    const iniciarSimulacion = (nIteraciones) => {
        const N = parseInt(nIteraciones || iteracionesSim, 10);
        if (!N || N <= 0) return;
        if (N > LIMITE_REPETICIONES) {
            setError(`No se puede realizar la simulación con más de ${LIMITE_REPETICIONES.toLocaleString()} repeticiones.`);
            return;
        }
        if (!resultado || !resultado.total) return;

        if (refTimeout.current) clearTimeout(refTimeout.current);
        refTimeout.current = null;
        resumeRef.current = null;
        publicarSimulacionRef.current = null;
        const generacion = ++generacionSimulacionRef.current;

        const pTeorica = resultado.cantidadFavorable / resultado.total;
        const compActivos = componentes.map(c => ({
            id: c.id,
            nombre: c.nombre || c.id,
            eventos: [...new Set(parsearEventos(c.eventos))]
        })).filter(c => c.eventos.length > 0);

        if (compActivos.length === 0) return;

        setSimulando(true);
        setPausado(false);
        setPaginaActualTabla(1);
        refSimulando.current = true;
        refPausado.current = false;

        let exitosAcumulados = 0;
        let iteracionActual = 0;
        const historyGrafica = [];
        const historialCompleto = [];
        const stepGrafica = Math.max(1, Math.floor(N / 80));
        let ultimoCasoTxt = null;
        let ultimoValores = compActivos.map(c => ({ id: c.id, nombre: c.nombre, valor: c.eventos[0], eventos: c.eventos }));
        let ultimoFav = false;

        setResultadoSimulacion({
            N,
            exitos: 0,
            intentoActual: 0,
            pEmpirica: 0,
            pTeorica,
            errorAbsoluto: pTeorica,
            puntosGrafica: [],
            historialEnsayos: [],
            ultimoCaso: null,
            ultimoValores: compActivos.map(c => ({ id: c.id, nombre: c.nombre, valor: c.eventos[0], eventos: c.eventos })),
            ultimoEsFavorable: false
        });

        const publicarEstadoSimulacion = () => {
            const pEmpirica = iteracionActual > 0 ? exitosAcumulados / iteracionActual : 0;
            setResultadoSimulacion({
                N,
                exitos: exitosAcumulados,
                intentoActual: iteracionActual,
                pEmpirica,
                pTeorica,
                errorAbsoluto: Math.abs(pEmpirica - pTeorica),
                puntosGrafica: [...historyGrafica],
                historialEnsayos: [...historialCompleto],
                ultimoCaso: ultimoCasoTxt,
                ultimoValores,
                ultimoEsFavorable: ultimoFav
            });
        };
        publicarSimulacionRef.current = publicarEstadoSimulacion;

        const loop = () => {
            if (generacion !== generacionSimulacionRef.current || !refSimulando.current || refPausado.current) return;
            refTimeout.current = null;

            const v = refVelocidad.current;
            let delay = 100;
            let chunkSize = 1;

            if (v === '1x') {
                delay = 400;
                chunkSize = 1;
            } else if (v === '2x') {
                delay = 200;
                chunkSize = 1;
            } else if (v === '4x') {
                delay = 100;
                chunkSize = 1;
            } else if (v === 'MAX') {
                delay = 16;
                chunkSize = Math.max(25, Math.floor(N / 25));
            }

            const target = Math.min(N, iteracionActual + chunkSize);

            for (; iteracionActual < target; iteracionActual++) {
                const casoSimulado = {};
                compActivos.forEach(c => {
                    const idx = Math.floor(Math.random() * c.eventos.length);
                    casoSimulado[c.id] = c.eventos[idx];
                });

                const esFavorable = evaluarReglas(reglas, casoSimulado);
                if (esFavorable) {
                    exitosAcumulados++;
                }

                ultimoCasoTxt = compActivos.map(c => `${c.nombre}: ${casoSimulado[c.id]}`).join('  ·  ');
                ultimoValores = compActivos.map(c => ({ id: c.id, nombre: c.nombre, valor: casoSimulado[c.id], eventos: c.eventos }));
                ultimoFav = esFavorable;

                const intentoNum = iteracionActual + 1;
                historialCompleto.push({
                    intento: intentoNum,
                    caso: ultimoCasoTxt,
                    valores: { ...casoSimulado },
                    esFavorable,
                    exitosAcumulados,
                    probabilidadAcumulada: exitosAcumulados / intentoNum
                });
                if (intentoNum === 1 || intentoNum % stepGrafica === 0 || intentoNum === N) {
                    historyGrafica.push({
                        intento: intentoNum,
                        empirica: parseFloat((exitosAcumulados / intentoNum).toFixed(4)),
                        teorica: parseFloat(pTeorica.toFixed(4))
                    });
                }

            }

            const finalizada = iteracionActual >= N;
            const esPasoAPaso = v === '1x' || v === '2x';
            if (finalizada || esPasoAPaso || iteracionActual % stepGrafica === 0) {
                publicarEstadoSimulacion();
            }

            if (finalizada) {
                setSimulando(false);
                refSimulando.current = false;
                refPausado.current = false;
                resumeRef.current = null;
                publicarSimulacionRef.current = null;
            } else {
                refTimeout.current = setTimeout(loop, delay);
            }
        };

        resumeRef.current = loop;
        loop();
    };

    const columnasEncuesta = useMemo(() => {
        const nombres = varSeleccionada?.nombresColumnas;
        if (Array.isArray(nombres) && nombres.length > 1) {
            return nombres.map((nombre, index) => ({ value: String(index), label: nombre || `Variable ${index + 1}` }));
        }
        return [{ value: '0', label: varSeleccionada?.nombre?.trim() || 'Variable' }];
    }, [varSeleccionada]);

    const columnaFrecuenciaDetectada = columnasEncuesta.find(columna =>
        /frecuen|frecuencia|conteo|cantidad|casos|^n$/i.test(columna.label.trim())
    )?.value ?? '';
    const columnaFrecuencia = columnasEncuesta.some(columna => columna.value === columnaFrecuenciaSeleccionada)
        ? columnaFrecuenciaSeleccionada
        : columnaFrecuenciaDetectada;

    const universoEncuesta = useMemo(() => {
        const multiColumna = Array.isArray(varSeleccionada?.nombresColumnas) && varSeleccionada.nombresColumnas.length > 1;
        return (filas || []).flatMap(fila => {
            const texto = String(fila?.valor ?? '').trim();
            if (!texto) return [];
            const partes = multiColumna ? texto.split(' | ').map(parte => parte.trim()) : [texto];
            const valores = Object.fromEntries(columnasEncuesta.map(columna => [
                columna.value,
                partes[Number(columna.value)] ?? ''
            ]));
            const pesoIngresado = usarFrecuencias ? Number(valores[columnaFrecuencia]) : 1;
            const peso = Number.isSafeInteger(pesoIngresado) && pesoIngresado >= 0 ? pesoIngresado : 0;
            return peso > 0 ? [{ ...valores, __peso: peso }] : [];
        });
    }, [filas, varSeleccionada, columnasEncuesta, usarFrecuencias, columnaFrecuencia]);

    const hayFrecuenciasInvalidas = useMemo(() => {
        if (!usarFrecuencias || !columnaFrecuencia) return false;
        const multiColumna = Array.isArray(varSeleccionada?.nombresColumnas) && varSeleccionada.nombresColumnas.length > 1;
        return (filas || []).some(fila => {
            if (!String(fila?.valor ?? '').trim()) return false;
            const partes = multiColumna ? String(fila.valor).split(' | ') : [String(fila.valor)];
            const textoFrecuencia = partes[Number(columnaFrecuencia)]?.trim() ?? '';
            if (!textoFrecuencia) return true;
            const valorFrecuencia = Number(textoFrecuencia);
            return !Number.isSafeInteger(valorFrecuencia) || valorFrecuencia < 0;
        });
    }, [filas, varSeleccionada, usarFrecuencias, columnaFrecuencia]);

    const variablesRegla = fuente === 'teorico'
        ? componentes.map(componente => ({ value: componente.id, label: componente.nombre.trim() || 'Experimento sin nombre' }))
        : columnasEncuesta.filter(columna => !usarFrecuencias || columna.value !== columnaFrecuencia);

    const obtenerEventosVariable = (idVariable) => {
        if (fuente === 'teorico') {
            const componente = componentes.find(item => item.id === idVariable);
            return [...new Set(parsearEventos(componente?.eventos))];
        }
        return [...new Set(universoEncuesta
            .map(caso => String(caso[idVariable] ?? '').trim())
            .filter(Boolean))];
    };

    const variablesNumericas = variablesRegla.filter(variable =>
        esListaNumerica(obtenerEventosVariable(variable.value))
    );

    useEffect(() => {
        setReglas(prev => {
            let huboCambios = false;
            const reglasActualizadas = prev.map(regla => {
                const tipo = regla.tipo === 'suma' && variablesNumericas.length < 2 ? 'variable' : regla.tipo;
                const variablesDisponibles = tipo === 'suma' ? variablesNumericas : variablesRegla;
                const variable = variablesDisponibles.some(item => item.value === regla.variable)
                    ? regla.variable
                    : variablesDisponibles[0]?.value ?? '';
                const variableB = tipo !== 'suma'
                    ? regla.variableB
                    : (variablesNumericas.some(item => item.value === regla.variableB && item.value !== variable)
                        ? regla.variableB
                        : variablesNumericas.find(item => item.value !== variable)?.value ?? '');
                const eventos = tipo === 'variable' ? obtenerEventosVariable(variable) : [];
                const operadorValido = tipo === 'suma'
                    || esListaNumerica(eventos)
                    || ['eq', 'neq'].includes(regla.operador);
                const operador = operadorValido ? regla.operador : 'eq';
                const valor = ['eq', 'neq'].includes(operador)
                    ? (eventos.includes(regla.valor) ? regla.valor : eventos[0] ?? '')
                    : regla.valor;
                if (tipo === regla.tipo && variable === regla.variable && variableB === regla.variableB
                    && operador === regla.operador && valor === regla.valor) return regla;
                huboCambios = true;
                return { ...regla, tipo, variable, variableB, operador, valor };
            });
            return huboCambios ? reglasActualizadas : prev;
        });
    }, [fuente, universoEncuesta, componentes, columnasEncuesta, usarFrecuencias, columnaFrecuencia]);

    const cantidadUniverso = useMemo(() => {
        if (fuente === 'encuesta') return universoEncuesta.reduce((total, caso) => total + caso.__peso, 0);
        return componentes.reduce((total, componente) => total * parsearEventos(componente.eventos).length, 1);
    }, [fuente, universoEncuesta, componentes]);

    useEffect(() => {
        const superaLimite = fuente === 'teorico' && cantidadUniverso > LIMITE_UNIVERSO;
        if (!superaLimite) {
            limiteUniversoAvisado.current = false;
            return;
        }
        if (limiteUniversoAvisado.current) return;

        limiteUniversoAvisado.current = true;
        setModalAlerta({
            isOpen: true,
            titulo: 'Espacio muestral demasiado grande',
            mensaje: `El espacio muestral supera el límite de ${LIMITE_UNIVERSO.toLocaleString()} resultados. Reduce opciones o experimentos.`,
            tipo: 'warning'
        });
    }, [fuente, cantidadUniverso]);

    const espacioMuestralActual = useMemo(() => {
        if (fuente === 'teorico') {
            if (cantidadUniverso > LIMITE_UNIVERSO) return null;
            return {
                casos: crearProductoCartesiano(componentes, LIMITE_UNIVERSO) ?? [],
                nombres: Object.fromEntries(componentes.map(componente => [componente.id, componente.nombre.trim() || 'Experimento sin nombre']))
            };
        }

        const nombres = Object.fromEntries(columnasEncuesta
            .filter(columna => !usarFrecuencias || columna.value !== columnaFrecuencia)
            .map(columna => [columna.value, columna.label]));
        if (usarFrecuencias) nombres.__peso = 'Frecuencia';
        return { casos: universoEncuesta, nombres };
    }, [fuente, cantidadUniverso, componentes, columnasEncuesta, usarFrecuencias, columnaFrecuencia, universoEncuesta]);

    const formulaEspacioMuestral = useMemo(() => {
        if (fuente === 'teorico' && componentes.length >= 2) return '';
        if (!espacioMuestralActual?.casos.length) {
            return { contenidoLatex: '\\{\\}', displayMode: false };
        }

        const variables = Object.keys(espacioMuestralActual.nombres).filter(id => id !== '__peso');
        const resultados = espacioMuestralActual.casos.map(caso => {
            const valores = variables.map(id => valorComoLatex(caso[id]));
            const resultado = valores.length > 1 ? `\\left(${valores.join(', \\; ')}\\right)` : (valores[0] ?? '\\varnothing');
            if (usarFrecuencias && caso.__peso > 1) return `\\underset{\\text{f=${caso.__peso}}}{${resultado}}`;
            return resultado;
        });
        const grupos = [];
        for (let indice = 0; indice < resultados.length; indice += 24) {
            grupos.push(resultados.slice(indice, indice + 24).join(', \\; '));
        }
        const contenido = grupos
            .map((grupo, indice) => `${grupo}${indice < grupos.length - 1 ? ',' : ''}`)
            .join(' \\\\ ');
        const contenidoLatex = grupos.length > 1
            ? `\\left\\{\\begin{array}{l}${contenido}\\end{array}\\right\\}`
            : `\\bigl\\{ ${grupos[0]} \\bigr\\}`;
        return { contenidoLatex, displayMode: grupos.length > 1 };
    }, [espacioMuestralActual, usarFrecuencias, fuente, componentes]);

    const matrizEspacioMuestral = useMemo(() => {
        if (fuente !== 'teorico' || componentes.length < 2 || cantidadUniverso > LIMITE_UNIVERSO) return null;
        const eventosPorComponente = componentes.map(componente => parsearEventos(componente.eventos));
        const indiceColumna = eventosPorComponente.reduce((indiceMayor, eventos, indice) => (
            eventos.length > eventosPorComponente[indiceMayor].length ? indice : indiceMayor
        ), eventosPorComponente.length - 1);
        const componenteColumna = componentes[indiceColumna];
        const eventosColumnas = eventosPorComponente[indiceColumna];
        const componentesFilas = componentes.filter((_, indice) => indice !== indiceColumna);
        const combinacionesFilas = crearProductoCartesiano(componentesFilas, LIMITE_UNIVERSO) ?? [];
        const celdas = combinacionesFilas.map(combinacionFila => eventosColumnas.map(eventoColumna => {
            const caso = Object.fromEntries(componentes.map((componente, indice) => [
                componente.id,
                indice === indiceColumna ? eventoColumna : combinacionFila[componente.id]
            ]));
            return {
                texto: `(${componentes.map(componente => String(caso[componente.id] ?? '')).join(', ')})`,
                caso
            };
        }));
        return {
            columnas: eventosColumnas.length,
            celdas
        };
    }, [fuente, componentes, cantidadUniverso]);

    const clavesCasosFavorables = useMemo(() => new Set(
        (resultado?.favorables || []).map(caso => JSON.stringify(
            componentes.map(componente => String(caso[componente.id] ?? ''))
        ))
    ), [resultado, componentes]);

    const celdasResultadoMuestral = useMemo(() => {
        if (!matrizEspacioMuestral) return null;
        return matrizEspacioMuestral.celdas.map(fila => fila.map(celda => {
            const valores = componentes.map(componente => String(celda.caso[componente.id] ?? ''));
            return {
                texto: `(${valores.join(', ')})`,
                resaltada: clavesCasosFavorables.has(JSON.stringify(valores))
            };
        }));
    }, [matrizEspacioMuestral, componentes, clavesCasosFavorables]);

    const actualizarComponente = (id, propiedad, valor) => {
        setComponentes(prev => prev.map(componente => componente.id === id ? { ...componente, [propiedad]: valor } : componente));
        if (propiedad === 'eventos') {
            const eventos = [...new Set(parsearEventos(valor))];
            const variableNumerica = esListaNumerica(eventos);
            setReglas(prev => prev.map(regla => {
                if (regla.tipo === 'suma') {
                    const variablesActuales = Array.isArray(regla.variablesSuma)
                        ? regla.variablesSuma
                        : [regla.variable, regla.variableB].filter(Boolean);
                    const variablesSuma = variablesActuales
                        .filter(variableId => variableId !== id || variableNumerica);
                    return {
                        ...regla,
                        variablesSuma,
                        variable: variablesSuma[0] ?? '',
                        variableB: variablesSuma[1] ?? ''
                    };
                }
                if (regla.tipo !== 'variable' || regla.variable !== id) return regla;
                const operador = variableNumerica || ['eq', 'neq'].includes(regla.operador)
                    ? regla.operador
                    : 'eq';
                return {
                    ...regla,
                    operador,
                    valor: ['eq', 'neq'].includes(operador)
                        ? (eventos.includes(regla.valor) ? regla.valor : eventos[0] ?? '')
                        : regla.valor
                };
            }));
        }
        invalidarResultados();
        setError('');
    };

    const cambiarTipoExperimento = (tipo) => {
        if (bloquearTipo) return;
        setTipoExperimento(tipo);
        if (tipo === 'simple') setComponenteClonadoId(null);
        setComponentes(prev => {
            if (tipo === 'simple') return prev.slice(0, 1);
            if (prev.length >= 2) return prev;
            const numero = siguienteComponente.current++;
            return [...prev, crearComponente(`componente-${numero}`, '', '')];
        });
        if (tipo === 'simple') {
            const primerComponente = componentes[0]?.id ?? 'componente-1';
            setReglas(prev => prev.map(regla => regla.tipo === 'suma'
                ? { ...regla, tipo: 'variable', variable: primerComponente }
                : regla));
        }
        invalidarResultados();
        setError('');
    };

    const agregarComponente = () => {
        const numero = siguienteComponente.current++;
        const nueva = crearComponente(`componente-${numero}`, '', '');
        setComponentes(prev => [...prev, nueva]);
        setTipoExperimento('compuesto');
        invalidarResultados();
    };

    const clonarComponente = (componente) => {
        const idNumero = siguienteComponente.current++;
        const nombreBase = (componente.nombre || '').trim();
        const raiz = nombreBase.replace(/\s+\d+$/, '').trim() || 'Experimento';

        const existentesConRaiz = componentes.filter(c => {
            const r = (c.nombre || '').trim().replace(/\s+\d+$/, '').trim();
            return r.toLowerCase() === raiz.toLowerCase();
        });
        const siguienteCorrelativo = existentesConRaiz.length + 1;
        const nuevoNombre = `${raiz} ${siguienteCorrelativo}`;

        const nuevo = crearComponente(`componente-${idNumero}`, nuevoNombre, componente.eventos);
        setComponentes(prev => {
            const indiceOrigen = prev.findIndex(item => item.id === componente.id);
            const insertados = [...prev];
            insertados.splice(indiceOrigen >= 0 ? indiceOrigen + 1 : insertados.length, 0, nuevo);
            return insertados;
        });
        setComponenteClonadoId(nuevo.id);
        setTipoExperimento('compuesto');
        invalidarResultados();
        setError('');
    };

    const eliminarComponente = (id) => {
        const restantes = componentes.filter(componente => componente.id !== id);
        if (componenteClonadoId === id) setComponenteClonadoId(null);
        setComponentes(restantes);
        if (restantes.length <= 1) setTipoExperimento('simple');
        const opciones = restantes.map(componente => ({ value: componente.id }));
        mantenerReglasConVariables(opciones);
        invalidarResultados();
    };

    const finalizarReordenamientoExperimentos = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        setComponentes(prev => {
            const indiceOrigen = prev.findIndex(componente => componente.id === active.id);
            const indiceDestino = prev.findIndex(componente => componente.id === over.id);
            if (indiceOrigen < 0 || indiceDestino < 0) return prev;
            return arrayMove(prev, indiceOrigen, indiceDestino);
        });
        invalidarResultados();
    };

    const actualizarRegla = (id, cambios) => {
        setReglas(prev => prev.map(regla => regla.id === id ? { ...regla, ...cambios } : regla));
        invalidarResultados();
        setError('');
    };

    const agregarRegla = () => {
        setReglas(prev => [...prev, { ...crearRegla(variablesRegla), conector: 'and' }]);
        invalidarResultados();
    };

    const eliminarRegla = (id) => {
        setReglas(prev => prev.filter(regla => regla.id !== id));
        invalidarResultados();
    };

    const mantenerReglasConVariables = (opciones) => {
        setReglas(prev => prev.map(regla => {
            const variable = opciones.some(opcion => opcion.value === regla.variable)
                ? regla.variable
                : opciones[0]?.value ?? '';
            const variableB = opciones.some(opcion => opcion.value === regla.variableB && opcion.value !== variable)
                ? regla.variableB
                : opciones.find(opcion => opcion.value !== variable)?.value ?? '';
            const variablesSuma = (regla.variablesSuma ?? [])
                .filter(id => opciones.some(opcion => opcion.value === id));
            return {
                ...regla,
                tipo: regla.tipo === 'suma' && opciones.length < 2 ? 'variable' : regla.tipo,
                variable,
                variableB,
                variablesSuma: variablesSuma.length >= 2 ? variablesSuma : opciones.slice(0, 2).map(o => o.value)
            };
        }));
    };

    const cambiarUsoFrecuencias = (usar) => {
        if (usar && columnasEncuesta.length < 2) {
            mostrarAlertaModal(
                'Faltan columnas',
                'Para ponderar por frecuencia necesitas una columna con los datos y otra columna con sus frecuencias.',
                'warning'
            );
            return;
        }
        setUsarFrecuencias(usar);
        mantenerReglasConVariables(usar
            ? columnasEncuesta.filter(columna => columna.value !== columnaFrecuencia)
            : columnasEncuesta);
        invalidarResultados();
        setError('');
    };

    const calcular = () => {
        setError('');
        invalidarResultados();

        if (fuente === 'encuesta' && usarFrecuencias && hayFrecuenciasInvalidas) {
            setError('Corrige las frecuencias: cada registro debe tener un entero igual o mayor que cero.');
            return;
        }

        if (fuente === 'encuesta' && universoEncuesta.length === 0) {
            if (usarFrecuencias && !columnaFrecuencia) {
                setError('Selecciona la columna que contiene las frecuencias de cada registro.');
                return;
            }
            setError(usarFrecuencias
                ? 'Ingresa frecuencias enteras mayores que cero en la columna seleccionada para construir el universo.'
                : 'Carga o agrega registros en el editor de datos para usar el universo de la encuesta.');
            return;
        }

        let universo;
        let nombres;
        if (fuente === 'teorico') {
            const componentesInvalidos = componentes.some(componente => !componente.nombre.trim() || parsearEventos(componente.eventos).length === 0);
            if (componentesInvalidos) {
                setError('Cada experimento necesita un nombre y al menos un evento posible.');
                return;
            }
            if (cantidadUniverso > LIMITE_UNIVERSO) {
                setError(`El espacio muestral supera el límite de ${LIMITE_UNIVERSO.toLocaleString()} resultados. Reduce opciones o experimentos.`);
                return;
            }
            universo = crearProductoCartesiano(componentes, LIMITE_UNIVERSO);
            nombres = Object.fromEntries(componentes.map(componente => [componente.id, componente.nombre.trim()]));
        } else {
            universo = universoEncuesta;
            nombres = Object.fromEntries(columnasEncuesta
                .filter(columna => !usarFrecuencias || columna.value !== columnaFrecuencia)
                .map(columna => [columna.value, columna.label]));
            if (usarFrecuencias) nombres.__peso = 'Frecuencia';
        }

        const reglasInvalidas = reglas.some(regla => {
            const eventos = regla.tipo === 'suma' ? [] : obtenerEventosVariable(regla.variable);
            const variableNumerica = regla.tipo === 'suma' || esListaNumerica(eventos);
            const operadoresDisponibles = variableNumerica ? OPERADORES : OPERADORES_CATEGORICOS;
            const valorDebeSerEvento = regla.tipo === 'variable' && ['eq', 'neq'].includes(regla.operador);
            const variableDisponible = regla.tipo === 'suma'
                || Object.prototype.hasOwnProperty.call(universo[0] ?? {}, regla.variable);
            const varsSuma = Array.isArray(regla.variablesSuma)
                ? regla.variablesSuma.filter(id => variablesNumericas.some(v => v.value === id))
                : [regla.variable, regla.variableB].filter(id => variablesNumericas.some(v => v.value === id));
            const sumaValida = regla.tipo !== 'suma' || varsSuma.length >= 2;
            return (regla.tipo !== 'suma' && !regla.variable)
                || !variableDisponible
                || !String(regla.valor).trim()
                || !operadoresDisponibles.some(operador => operador.value === regla.operador)
                || (valorDebeSerEvento && !eventos.includes(regla.valor))
                || !sumaValida;
        });
        if (!reglas.length || reglasInvalidas) {
            setError('Revisa cada condición: el operador y el valor deben ser compatibles con los eventos seleccionados.');
            return;
        }

        const favorables = universo.filter(caso => evaluarReglas(reglas, caso));
        const total = fuente === 'encuesta' ? universo.reduce((suma, caso) => suma + caso.__peso, 0) : universo.length;
        const cantidadFavorable = fuente === 'encuesta'
            ? favorables.reduce((suma, caso) => suma + caso.__peso, 0)
            : favorables.length;
        if (!Number.isSafeInteger(total) || !Number.isSafeInteger(cantidadFavorable)) {
            mostrarAlertaModal(
                'Error en las frecuencias',
                'El total de frecuencias supera el límite numérico seguro. Reduce las frecuencias para calcular con precisión.',
                'error'
            );
            return;
        }
        setResultado({ universo, favorables, nombres, total, cantidadFavorable, _configuracion: firmaConfiguracion });
    };

    // Solo al abrir/restablecer un historial; las ediciones normales requieren CALCULAR.
    useEffect(() => {
        if (!restauracionPendienteRef.current || !estadoRestaurar) return;
        restauracionPendienteRef.current = false;
        calcular();
    }, [estadoRestaurar]);

    useEffect(() => {
        if (!simulacionPendienteRef.current || !resultado) return;
        simulacionPendienteRef.current = false;
        const simulacion = estadoRestaurar?.simulacion || estadoRestaurar?.resultadoSimulacion;
        if (simulacion) {
            setResultadoSimulacion(reconstruirSimulacionHistorial(simulacion, componentes, reglas, resultado));
        }
    }, [resultado, estadoRestaurar, componentes, reglas]);

    const cambiarFuente = (nuevaFuente) => {
        setFuente(nuevaFuente);
        invalidarResultados();
        setError('');
        const opciones = nuevaFuente === 'teorico'
            ? componentes.map(componente => ({ value: componente.id }))
            : columnasEncuesta.filter(columna => !usarFrecuencias || columna.value !== columnaFrecuencia);
        setReglas([crearRegla(opciones)]);
    };

    const componentesOrdenables = variablesRegla;
    const opcionesTipoRegla = [
        { value: 'variable', label: fuente === 'teorico' ? 'Experimento' : 'Variable' },
        ...(variablesNumericas.length > 1 ? [{
            value: 'suma',
            label: fuente === 'teorico'
                ? (variablesNumericas.length === 2 ? 'Suma de dos experimentos' : 'Suma de experimentos')
                : (variablesNumericas.length === 2 ? 'Suma de dos variables' : 'Suma de variables')
        }] : [])
    ];
    const opcionesConector = [
        { value: 'and', label: 'Y' },
        { value: 'or', label: 'O' }
    ];
    const fraccionSimplificada = resultado
        ? (() => {
            const divisor = maximoComunDivisor(resultado.cantidadFavorable, resultado.total);
            return `${resultado.cantidadFavorable / divisor}/${resultado.total / divisor}`;
        })()
        : '';
    const [numeradorSimplificado, denominadorSimplificado] = fraccionSimplificada.split('/');
    const espacioResultadoFormula = useMemo(() => {
        if (!resultado || (fuente === 'teorico' && matrizEspacioMuestral)) return null;
        const variables = Object.keys(resultado.nombres).filter(id => id !== '__peso');
        const vistos = new Set();
        const casosUnicos = resultado.universo.filter(caso => {
            const clave = JSON.stringify(variables.map(id => String(caso[id] ?? '')));
            if (vistos.has(clave)) return false;
            vistos.add(clave);
            return true;
        });
        const resultados = casosUnicos.map(caso => {
            const esFavorable = evaluarReglas(reglas, caso);
            const valores = variables.map(id => valorComoLatex(caso[id], esFavorable));
            const tupla = valores.length > 1
                ? `\\left(${valores.join(', \\; ')}\\right)`
                : (valores[0] ?? '\\varnothing');
            return esFavorable
                ? `\\textcolor{#07865b}{${valores.length > 1 ? `\\boldsymbol{${tupla}}` : tupla}}`
                : tupla;
        });
        const cantidadPorFila = matrizEspacioMuestral?.columnas ?? (variables.length > 1 ? 4 : 16);
        const filas = [];
        for (let indice = 0; indice < resultados.length; indice += cantidadPorFila) {
            filas.push(resultados.slice(indice, indice + cantidadPorFila).join(', \\; '));
        }
        const contenido = filas.join(' \\\\ ');
        const contenidoLatex = filas.length > 1
            ? `\\left\\{\\begin{array}{l}${contenido}\\end{array}\\right\\}`
            : `\\left\\{ ${contenido} \\right\\}`;
        return { contenidoLatex, displayMode: filas.length > 1 };
    }, [resultado, reglas, matrizEspacioMuestral, fuente]);
    const columnasHistorialSimulacion = crearColumnasHistorialEnsayos(resultadoSimulacion?.ultimoValores);

    return (
        <section className="mat251-experimentos" aria-label="Probabilidad discreta interactiva">
            <section className="mat251-experimentos-card">
                <div className="mat251-experimentos-tipos">
                    {/* Ocultado visualmente por el momento; se preserva el código intacto */}
                    {false && (
                        <div>
                            <span className="mat251-experimentos-label">Origen del universo</span>
                            <div className="contenedor-selector-modos-mat251 mat251-experimentos-opciones" role="group" aria-label="Origen del universo">
                                <button type="button" aria-pressed={fuente === 'teorico'} className={`btn-experimentos btn-mat251-modo${fuente === 'teorico' ? ' active' : ''}`} onClick={() => cambiarFuente('teorico')}>Teórico</button>
                                <button type="button" aria-pressed={fuente === 'encuesta'} className={`btn-experimentos btn-mat251-modo${fuente === 'encuesta' ? ' active' : ''}`} onClick={() => cambiarFuente('encuesta')}>Datos de encuesta</button>
                            </div>
                        </div>
                    )}
                    {fuente === 'teorico' && (
                        <div id="tour-exp-tipo-selector">
                            <span className="mat251-experimentos-label">Tipo de experimento</span>
                            <div className="contenedor-selector-modos-mat251" style={{ width: '100%' }} role="group" aria-label="Tipo de experimento">
                                <button id="tour-exp-btn-tipo-simple" type="button" disabled={bloquearTipo && tipoExperimento !== 'simple'} title={bloquearTipo && tipoExperimento !== 'simple' ? 'El tipo de experimento está fijado por el historial' : undefined} aria-pressed={tipoExperimento === 'simple'} className={`btn-mat251-modo${tipoExperimento === 'simple' ? ' active' : ''}`} onClick={() => cambiarTipoExperimento('simple')}>Simple</button>
                                <button id="tour-exp-btn-tipo-compuesto" type="button" disabled={bloquearTipo && tipoExperimento !== 'compuesto'} title={bloquearTipo && tipoExperimento !== 'compuesto' ? 'El tipo de experimento está fijado por el historial' : undefined} aria-pressed={tipoExperimento === 'compuesto'} className={`btn-mat251-modo${tipoExperimento === 'compuesto' ? ' active' : ''}`} onClick={() => cambiarTipoExperimento('compuesto')}>Compuesto</button>
                            </div>
                        </div>
                    )}
                </div>

                {fuente === 'teorico' ? (
                    <div
                        className={`mat251-experimentos-lienzo${tipoExperimento === 'simple' ? ' simple' : ''}`}
                        role="region"
                        aria-label="Área de configuración del experimento"
                    >
                        <div
                            className={`mat251-experimentos-lienzo-viewport${tipoExperimento === 'simple' ? ' simple' : ''}`}
                        >
                            <DndContext
                                sensors={sensoresExperimentos}
                                collisionDetection={closestCenter}
                                onDragEnd={finalizarReordenamientoExperimentos}
                            >
                                <SortableContext
                                    items={componentes.map(componente => componente.id)}
                                    strategy={horizontalListSortingStrategy}
                                >
                                    <div id={tipoExperimento === 'simple' ? 'tour-exp-config-simple' : 'tour-exp-config-compuesto'} className={`mat251-experimentos-componentes${tipoExperimento === 'simple' ? ' simple' : ' compuesto'}`}>
                                        {componentes.map((componente, index) => (
                                            <TarjetaExperimentoOrdenable
                                                key={componente.id}
                                                componente={componente}
                                                index={index}
                                                sortable={tipoExperimento === 'compuesto'}
                                                puedeEliminar={componentes.length > 2}
                                                clonada={componente.id === componenteClonadoId}
                                                refClonada={componente.id === componenteClonadoId ? refComponenteClonado : null}
                                                onClonar={() => clonarComponente(componente)}
                                                onEliminar={() => eliminarComponente(componente.id)}
                                                onActualizar={actualizarComponente}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                        {tipoExperimento === 'compuesto' && (
                            <button id="tour-exp-btn-agregar-componente" type="button" className="btn-experimentos mat251-experimentos-secundario mat251-experimentos-agregar-componente" onClick={agregarComponente}>Agregar experimento</button>
                        )}
                    </div>
                ) : (
                    <div className="mat251-experimentos-encuesta-config">
                        <div className="mat251-experimentos-encuesta">
                            <div>
                                <span className="mat251-experimentos-datos-label">Datos:</span>
                                <strong>{varSeleccionada?.nombre || 'Datos cargados'}</strong>
                                <span>{usarFrecuencias ? `${cantidadUniverso.toLocaleString()} observaciones representadas` : `${universoEncuesta.length} registros válidos`} · {variablesRegla.length} variables para condiciones</span>
                            </div>
                            <button
                                type="button"
                                className="btn-primary btn-experimentos mat251-experimentos-editar"
                                onClick={abrirEditor}
                                style={{ padding: '5px 14px', fontSize: FS.sm, borderRadius: RADIUS, fontFamily: FONT, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: 'fit-content' }}
                            >
                                <EditarDatos />
                                Editar Datos
                            </button>
                            {universoEncuesta.length === 0 && <p>Agrega o carga registros desde el editor de datos para generar el universo de la encuesta.</p>}
                        </div>
                        <div className="contenedor-selector-modos-mat251 mat251-experimentos-opciones" role="group" aria-label="Representación de datos de encuesta">
                            <button
                                type="button"
                                aria-pressed={!usarFrecuencias}
                                className={`btn-experimentos btn-mat251-modo${!usarFrecuencias ? ' active' : ''}`}
                                onClick={() => cambiarUsoFrecuencias(false)}
                            >
                                Una fila por registro
                            </button>
                            <button
                                type="button"
                                aria-pressed={usarFrecuencias}
                                className={`btn-experimentos btn-mat251-modo${usarFrecuencias ? ' active' : ''}`}
                                onClick={() => cambiarUsoFrecuencias(true)}
                            >
                                Usar columna de frecuencia
                            </button>
                        </div>
                        {usarFrecuencias && (
                            <label className="mat251-experimentos-frecuencia">
                                <span className="mat251-experimentos-label">Columna que contiene la frecuencia</span>
                                <SelectExperimentos
                                    value={columnaFrecuencia}
                                    options={columnasEncuesta}
                                    onChange={valor => {
                                        setColumnaFrecuenciaSeleccionada(valor);
                                        if (usarFrecuencias) mantenerReglasConVariables(columnasEncuesta.filter(columna => columna.value !== valor));
                                        invalidarResultados();
                                    }}
                                    ariaLabel="Columna de frecuencia"
                                />
                                <small>Se sumarán las frecuencias como total del universo.</small>
                            </label>
                        )}
                    </div>
                )}
                <section id="tour-exp-espacio-muestral" className="mat251-experimentos-espacio-vivo" aria-label="Espacio muestral actualizado en tiempo real">
                    <div className="mat251-experimentos-espacio-vivo-cabecera">
                        <h5>Espacio muestral</h5>
                    </div>
                    {espacioMuestralActual === null ? (
                        <p className="mat251-experimentos-vacio">Vista oculta mientras reduces el tamaño del espacio muestral.</p>
                    ) : (
                        <div className="mat251-experimentos-formula-universo">
                            {!(fuente === 'teorico' && componentes.length > 1 && matrizEspacioMuestral)
                                && Object.keys(espacioMuestralActual.nombres).filter(id => id !== '__peso').length > 1 && (
                                <p>Las tuplas siguen este orden: {Object.entries(espacioMuestralActual.nombres)
                                    .filter(([id]) => id !== '__peso')
                                    .map(([, nombre]) => nombre)
                                    .join(', ')}.</p>
                            )}
                            {matrizEspacioMuestral ? (
                                <EspacioMuestralMatriz
                                    celdas={matrizEspacioMuestral.celdas}
                                    columnas={matrizEspacioMuestral.columnas}
                                />
                            ) : (
                                formulaEspacioMuestral?.contenidoLatex ? (
                                    <div className="mat251-experimentos-formula-universo-math">
                                        <FormulaEspacioMuestral {...formulaEspacioMuestral} />
                                    </div>
                                ) : null
                            )}
                        </div>
                    )}
                </section>
            </section>

            <section id="tour-exp-condiciones" className="mat251-experimentos-card">
                <div className="mat251-experimentos-seccion-titulo mat251-experimentos-condiciones-cabecera">
                    <div>
                        <h4>Condiciones del evento</h4>
                    </div>
                    <button id="tour-exp-btn-agregar-condicion" type="button" className="btn-experimentos mat251-experimentos-secundario mat251-experimentos-agregar-condicion" onClick={agregarRegla} disabled={!variablesRegla.length}>Agregar condición</button>
                </div>

                <div className="mat251-experimentos-reglas">
                    {reglas.map((regla, index) => {
                        const eventosRegla = regla.tipo === 'suma' ? [] : obtenerEventosVariable(regla.variable);
                        const variableNumerica = regla.tipo === 'suma' || esListaNumerica(eventosRegla);
                        const operadoresDisponibles = variableNumerica ? OPERADORES : OPERADORES_CATEGORICOS;
                        const variablesDisponiblesRegla = regla.tipo === 'suma' ? variablesNumericas : componentesOrdenables;
                        const usarSelectorValor = regla.tipo === 'variable' && ['eq', 'neq'].includes(regla.operador);
                        const opcionesValor = eventosRegla.map(evento => ({ value: evento, label: evento }));
                        return (
                        <React.Fragment key={regla.id}>
                            {index > 0 && (
                                <div className="mat251-experimentos-conector">
                                    <SelectExperimentos
                                        value={regla.conector || 'and'}
                                        options={opcionesConector}
                                        onChange={valor => actualizarRegla(regla.id, { conector: valor })}
                                        ariaLabel={`Conector antes de condición ${index + 1}`}
                                    />
                                </div>
                            )}
                            <article className={`mat251-experimentos-regla${reglas.length > 1 ? ' con-quitar' : ''}`}>
                                <div className="mat251-experimentos-regla-campo">
                                    <label className="mat251-experimentos-campo-evaluar">
                                        <span className="mat251-experimentos-label">Evaluar</span>
                                        <SelectExperimentos
                                            value={regla.tipo}
                                            options={opcionesTipoRegla}
                                            onChange={tipo => {
                                                const variablesIniciales = tipo === 'suma' ? variablesNumericas : variablesRegla;
                                                const variable = variablesIniciales[0]?.value ?? '';
                                                const variableB = variablesIniciales[1]?.value ?? '';
                                                const variablesSuma = variablesNumericas.map(v => v.value);
                                                const eventos = tipo === 'variable' ? obtenerEventosVariable(variable) : [];
                                                actualizarRegla(regla.id, {
                                                    tipo,
                                                    variable,
                                                    variableB,
                                                    variablesSuma,
                                                    operador: 'eq',
                                                    valor: eventos[0] ?? ''
                                                });
                                            }}
                                            ariaLabel={`Tipo de condición ${index + 1}`}
                                        />
                                    </label>
                                    {regla.tipo === 'suma' ? (
                                        <div className="mat251-experimentos-campo-suma">
                                            <span className="mat251-experimentos-label">
                                                {fuente === 'teorico' ? 'Experimentos a sumar' : 'Variables a sumar'}
                                            </span>
                                            <div
                                                className="mat251-experimentos-chips-suma"
                                                role="group"
                                                aria-label="Seleccionar experimentos a sumar"
                                                onWheel={(e) => {
                                                    const el = e.currentTarget;
                                                    if (el.scrollWidth > el.clientWidth && e.deltaY !== 0) {
                                                        const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
                                                        const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 && e.deltaY > 0;
                                                        if (!atStart && !atEnd) {
                                                            el.scrollLeft += e.deltaY;
                                                        }
                                                    }
                                                }}
                                            >
                                                {variablesNumericas.map(v => {
                                                    const seleccionadas = regla.variablesSuma ?? [regla.variable, regla.variableB];
                                                    const seleccionada = seleccionadas.includes(v.value);
                                                    return (
                                                        <button
                                                            type="button"
                                                            key={v.value}
                                                            className={`btn-experimentos mat251-chip-suma${seleccionada ? ' activo' : ''}`}
                                                            onClick={() => {
                                                                const actuales = regla.variablesSuma ?? [regla.variable, regla.variableB];
                                                                let nuevas;
                                                                if (seleccionada) {
                                                                    if (actuales.length <= 2) return;
                                                                    nuevas = actuales.filter(id => id !== v.value);
                                                                } else {
                                                                    nuevas = [...actuales, v.value];
                                                                }
                                                                actualizarRegla(regla.id, {
                                                                    variablesSuma: nuevas,
                                                                    variable: nuevas[0] ?? '',
                                                                    variableB: nuevas[1] ?? ''
                                                                });
                                                            }}
                                                            title={seleccionada ? `${v.label} (Clic para desmarcar - mín. 2)` : `${v.label} (Clic para incluir en la suma)`}
                                                        >
                                                            {v.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <label>
                                            <span className="mat251-experimentos-label">
                                                {fuente === 'teorico' ? 'Experimento' : 'Variable'}
                                            </span>
                                            <SelectExperimentos
                                                value={regla.variable}
                                                options={variablesDisponiblesRegla}
                                                onChange={valor => {
                                                    const eventos = obtenerEventosVariable(valor);
                                                    const esNumerica = esListaNumerica(eventos);
                                                    const operador = esNumerica || ['eq', 'neq'].includes(regla.operador) ? regla.operador : 'eq';
                                                    actualizarRegla(regla.id, {
                                                        variable: valor,
                                                        operador,
                                                        valor: ['eq', 'neq'].includes(operador)
                                                            ? (eventos.includes(regla.valor) ? regla.valor : eventos[0] ?? '')
                                                            : regla.valor
                                                    });
                                                }}
                                                ariaLabel={`${fuente === 'teorico' ? 'Experimento' : 'Variable'} de condición ${index + 1}`}
                                            />
                                        </label>
                                    )}
                                    <label className="mat251-experimentos-campo-operador">
                                        <span className="mat251-experimentos-label">Operador</span>
                                        <SelectExperimentos
                                            value={regla.operador}
                                            options={operadoresDisponibles}
                                            onChange={operador => actualizarRegla(regla.id, {
                                                operador,
                                                ...(regla.tipo === 'variable' && ['eq', 'neq'].includes(operador) && !eventosRegla.includes(regla.valor)
                                                    ? { valor: eventosRegla[0] ?? '' }
                                                    : {})
                                            })}
                                            ariaLabel={`Operador de condición ${index + 1}`}
                                        />
                                    </label>
                                    <label className={`mat251-experimentos-campo-valor${usarSelectorValor ? ' con-selector' : ' con-input'}`}>
                                        <span className="mat251-experimentos-label">Valor</span>
                                        {usarSelectorValor ? (
                                            <SelectExperimentos
                                                value={regla.valor}
                                                options={opcionesValor}
                                                onChange={valor => actualizarRegla(regla.id, { valor })}
                                                ariaLabel={`Valor de condición ${index + 1}`}
                                                disabled={!opcionesValor.length}
                                            />
                                        ) : (
                                            <input
                                                className="input-mat251 placeholder-small"
                                                type="number"
                                                step="any"
                                                value={regla.valor}
                                                onChange={event => actualizarRegla(regla.id, { valor: event.target.value })}
                                                placeholder="Ej.: 10"
                                                style={estiloCampo}
                                            />
                                        )}
                                    </label>
                                </div>
                                {reglas.length > 1 && (
                                    <button
                                        type="button"
                                        className="btn-experimentos mat251-experimentos-quitar mat251-experimentos-quitar-icono mat251-experimentos-quitar-regla"
                                        onClick={() => eliminarRegla(regla.id)}
                                        aria-label={`Eliminar condición ${index + 1}`}
                                        title={`Eliminar condición ${index + 1}`}
                                    >
                                        <IconoBasura width="15" height="15" />
                                    </button>
                                )}
                            </article>
                        </React.Fragment>
                        );
                    })}
                    {!variablesRegla.length && (
                        <p className="mat251-experimentos-vacio">
                            {fuente === 'teorico'
                                ? 'Primero configura al menos un experimento.'
                                : 'Primero carga datos en el editor de encuesta.'}
                        </p>
                    )}
                </div>
            </section>

            <div className="mat251-experimentos-acciones">
                <button id="tour-exp-btn-calcular" type="button" className="button_calcular" onClick={calcular} disabled={(fuente === 'teorico' && cantidadUniverso > LIMITE_UNIVERSO) || !variablesRegla.length}>CALCULAR PROBABILIDAD</button>
            </div>

            {resultado && (
                <>
                    <section id="tour-exp-resultados" className="mat251-experimentos-card mat251-experimentos-resultados" aria-live="polite">
                    <h4 className="mat251-experimentos-resultados-titulo">Resultado del evento</h4>
                    <div id="tour-exp-metricas" className="mat251-experimentos-metricas">
                        <div>
                            <span>Casos favorables</span>
                            <strong><ResultadoMath expresion={numeroParaLatex(resultado.cantidadFavorable)} /></strong>
                        </div>
                        <div>
                            <span>Total del universo</span>
                            <strong><ResultadoMath expresion={numeroParaLatex(resultado.total)} /></strong>
                        </div>
                        <div>
                            <span>Porcentaje</span>
                            <strong>
                                <ResultadoMath
                                    expresion={`${(resultado.cantidadFavorable / resultado.total).toFixed(4)} \\Rightarrow ${((resultado.cantidadFavorable / resultado.total) * 100).toFixed(2)}\\%`}
                                />
                            </strong>
                        </div>
                    </div>
                    <div className="mat251-experimentos-formula">
                        <ResultadoMath
                            expresion={`P(E) = \\frac{${numeroParaLatex(resultado.cantidadFavorable)}}{${numeroParaLatex(resultado.total)}}${
                                String(resultado.cantidadFavorable) !== String(numeradorSimplificado) || String(resultado.total) !== String(denominadorSimplificado)
                                    ? ` = \\frac{${numeroParaLatex(numeradorSimplificado)}}{${numeroParaLatex(denominadorSimplificado)}}`
                                    : ''
                            } = ${(resultado.cantidadFavorable / resultado.total).toFixed(4)} = ${((resultado.cantidadFavorable / resultado.total) * 100).toFixed(2)}\\%`}
                            displayMode
                        />
                    </div>
                    <section id="tour-exp-espacio-resultado" className="mat251-experimentos-espacio-vivo" aria-label="Espacio muestral con resultados favorables">
                        <div className="mat251-experimentos-espacio-vivo-cabecera">
                            <h5>Espacio muestral</h5>
                        </div>
                        {resultado.favorables.length === 0 && (
                            <p className="mat251-experimentos-vacio">Ningún resultado cumple todas las condiciones.</p>
                        )}
                        <div className="mat251-experimentos-formula-universo">
                            {fuente === 'teorico' && matrizEspacioMuestral ? (
                                <EspacioMuestralMatriz
                                    celdas={celdasResultadoMuestral}
                                    columnas={matrizEspacioMuestral.columnas}
                                />
                            ) : (
                                <div className="mat251-experimentos-formula-universo-math">
                                    <FormulaEspacioMuestral {...espacioResultadoFormula} />
                                </div>
                            )}
                        </div>
                    </section>
                </section>

                <section className="mat251-experimentos-card mat251-experimentos-simulacion" aria-label="Simulación Monte Carlo del evento">
                    <div id="tour-exp-sim-repeticiones" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <h4 className="mat251-experimentos-resultados-titulo" style={{ margin: 0 }}>Simulación del evento</h4>

                        <div className="mat251-experimentos-repeticiones-control">
                            <label htmlFor="mat251-experimentos-repeticiones" className="mat251-experimentos-repeticiones-label">
                                <ResultadoMath expresion="N:" />
                            </label>
                            <input
                                id="mat251-experimentos-repeticiones"
                                type="number"
                                min="1"
                                max={LIMITE_REPETICIONES}
                                placeholder="Número de repeticiones"
                                className="input-mat251 placeholder-small mat251-experimentos-repeticiones-input"
                                value={iteracionesSim}
                                onChange={e => {
                                    detenerSimulacion();
                                    setIteracionesSim(e.target.value);
                                }}
                                style={{
                                    padding: '8px 12px',
                                    minHeight: '38px',
                                    borderRadius: RADIUS,
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-input)',
                                    color: 'var(--text-pure)',
                                    fontSize: FS.sm,
                                    outline: 'none',
                                    fontFamily: FONT,
                                    width: '220px',
                                    maxWidth: '100%',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button
                            id="tour-exp-btn-iniciar-sim"
                            type="button"
                            onClick={() => iniciarSimulacion(iteracionesSim)}
                            disabled={simulando}
                            className="button_calcular"
                            style={{
                                width: 'fit-content',
                                padding: '5px 20px',
                                borderRadius: RADIUS,
                                fontSize: FS.md,
                                fontWeight: 600,
                                fontFamily: FONT,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: simulando ? 0.6 : 1,
                                cursor: simulando ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {simulando ? 'SIMULANDO...' : 'INICIAR SIMULACIÓN'}
                        </button>
                    </div>

                    {(simulando || (resultadoSimulacion && resultadoSimulacion.intentoActual > 0)) && (
                        <div style={{
                            marginTop: '0',
                            padding: 0,
                            background: 'transparent',
                            border: 'none',
                            position: 'relative'
                        }}>
                            {/* Barra de progreso */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', overflow: 'hidden', borderRadius: '3px', background: 'var(--border-color)' }}>
                                <div style={{
                                    height: '100%',
                                    background: 'var(--primary-color)',
                                    width: `${Math.min(100, (resultadoSimulacion.intentoActual / Math.max(1, parseInt(iteracionesSim) || 1)) * 100)}%`,
                                    borderRadius: '3px',
                                    transition: 'width 0.1s linear'
                                }} />
                            </div>

                            {/* Cabecera: Lanzamiento y controles de velocidad / pausa */}
                            <div id="tour-exp-sim-progreso" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginTop: '10px', marginBottom: '20px' }}>
                                <span className="texto-lanzamiento-simulacion" style={{ fontSize: FS.sm, fontWeight: 700, color: 'var(--text-pure)', fontFamily: FONT }}>
                                    Lanzamiento: {resultadoSimulacion.intentoActual} / {parseInt(iteracionesSim) || 0}
                                </span>

                                <div className="controles-simulacion-movil" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'nowrap', justifyContent: 'center' }}>
                                    {/* Selector de velocidad */}
                                    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', padding: '3px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                                        {['1x', '2x', '4x', 'MAX'].map(vel => (
                                            <button
                                                key={vel}
                                                type="button"
                                                onClick={() => {
                                                    setVelocidadSim(vel);
                                                    refVelocidad.current = vel;
                                                }}
                                                style={{
                                                    background: velocidadSim === vel ? 'var(--primary-color)' : 'transparent',
                                                    color: velocidadSim === vel ? '#fff' : 'var(--text-muted)',
                                                    border: 'none',
                                                    borderRadius: RADIUS,
                                                    padding: '2px 8px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.65rem',
                                                    fontWeight: 800,
                                                    fontFamily: FONT,
                                                    transition: 'all 0.2s',
                                                    boxShadow: velocidadSim === vel ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                                }}
                                            >
                                                {vel}
                                            </button>
                                        ))}
                                    </div>

                                    {simulando && (
                                        <button
                                            type="button"
                                            onClick={alternarPausa}
                                            style={{
                                                background: pausado ? '#10b981' : '#f59e0b',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: RADIUS,
                                                padding: '4px 12px',
                                                cursor: 'pointer',
                                                fontSize: FS.xs,
                                                fontFamily: FONT,
                                                fontWeight: 700,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                transition: 'background 0.2s',
                                                minWidth: '105px',
                                                justifyContent: 'center',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            {pausado ? (
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

                            {/* Sección central: Tarjetas y animación física */}
                            <div id="tour-exp-sim-comparacion" className="contenedor-simulacion-clasica">
                                {/* Lateral Izquierdo: Probabilidad Teórica */}
                                <div className="col-simulacion-lateral">
                                    <div className="tarjeta-probabilidad" style={{ textAlign: 'center', background: 'var(--bg-input)', padding: '15px 10px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                                        <p className="tarjeta-prob-titulo" style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-pure)', fontWeight: 'bold', fontFamily: FONT }}>PROB. TEÓRICA</p>
                                        <div className="tarjeta-prob-valor" style={{ margin: '5px 0 0', fontSize: '0.9rem', color: 'var(--text-pure)', fontWeight: 'normal' }}>
                                            <ResultadoMath expresion={`${(resultadoSimulacion.pTeorica * 100).toFixed(2)}\\%`} />
                                        </div>
                                    </div>
                                </div>

                                {/* Centro: Valores obtenidos en el lanzamiento actual */}
                                <div className="col-simulacion-centro">
                                    <div className="mat251-experimentos-valores-lanzamiento">
                                        {(resultadoSimulacion.ultimoValores || []).map((item, idx) => (
                                            <div
                                                key={item.id || idx}
                                                className={`mat251-experimentos-resultado-ensayo ${resultadoSimulacion.ultimoCaso && resultadoSimulacion.ultimoEsFavorable ? 'es-favorable' : ''}`}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    borderRadius: RADIUS,
                                                    padding: '8px 16px',
                                                    minWidth: '70px',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <span className="mat251-experimentos-resultado-ensayo-nombre" style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                                                    {item.nombre}
                                                </span>
                                                <strong className="mat251-experimentos-resultado-ensayo-valor" style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: FONT }}>
                                                    {String(item.valor ?? '—')}
                                                </strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Lateral Derecho: Probabilidad Simulada */}
                                <div className="col-simulacion-lateral right-side">
                                    <div className="tarjeta-probabilidad" style={{ textAlign: 'center', background: 'var(--bg-input)', padding: '15px 10px', borderRadius: RADIUS, border: '1px solid var(--border-color)', width: '100%' }}>
                                        <p className="tarjeta-prob-titulo" style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-pure)', fontWeight: 'bold', fontFamily: FONT }}>PROB. SIMULADA</p>
                                        <div className="tarjeta-prob-valor" style={{ margin: '5px 0 0', fontSize: '0.9rem', color: 'var(--text-pure)', fontWeight: 'normal' }}>
                                            <ResultadoMath expresion={`${(resultadoSimulacion.pEmpirica * 100).toFixed(2)}\\%`} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sección Inferior: Último resultado y Éxitos */}
                            <div id="tour-exp-sim-exitos" className="mat251-experimentos-ultima-simulacion">
                                <div className="texto-resultado-simulacion mat251-experimentos-resumen-resultado" style={{ fontSize: FS.md, fontWeight: 800, color: 'var(--text-pure)', minHeight: '24px', textAlign: 'center', fontFamily: FONT }}>
                                    {resultadoSimulacion.ultimoCaso ? (
                                        <>
                                            <span className="mat251-experimentos-resumen-etiqueta">
                                                {simulando ? 'Resultado actual' : 'Último resultado'}
                                            </span>
                                            <div className="mat251-experimentos-resumen-valores">
                                                {(resultadoSimulacion.ultimoValores || []).map((item, idx) => (
                                                    <span className="mat251-experimentos-resumen-item" key={item.id || idx}>
                                                        <span className="mat251-experimentos-resumen-nombre">{item.nombre}:</span>
                                                        <strong>{String(item.valor ?? '—')}</strong>
                                                    </span>
                                                ))}
                                            </div>
                                        </>
                                    ) : 'Preparando...'}
                                </div>

                                <div className="bloque-exitos-simulacion" style={{ textAlign: 'center' }}>
                                    <p className="titulo-exitos-simulacion" style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-pure)', fontWeight: 'bold', fontFamily: FONT }}>ÉXITOS OBTENIDOS</p>
                                    <div className="valor-exitos-simulacion" style={{ margin: '5px 0 0', fontSize: '1.3rem', color: 'var(--text-pure)', fontWeight: 'normal' }}>
                                        <ResultadoMath expresion={numeroParaLatex(resultadoSimulacion.exitos)} />
                                    </div>
                                </div>
                            </div>

                            {/* Grid de 3 métricas empíricas */}
                            <div id="tour-exp-sim-metricas-empiricas" className="grid-metricas-empiricas" style={{ borderTop: 'none' }}>
                                <div className="tarjeta-metrica-empirica">
                                    <p className="titulo-metrica-empirica" style={{ fontFamily: FONT, color: 'var(--text-pure)' }}><span>Esperanza Empírica</span> <ResultadoMath expresion="E(X)" /></p>
                                    <div className="valor-metrica-empirica" style={{ color: 'var(--text-pure)', fontWeight: 'normal' }}>
                                        <ResultadoMath expresion={resultadoSimulacion.pEmpirica.toFixed(4)} />
                                    </div>
                                </div>
                                <div className="tarjeta-metrica-empirica">
                                    <p className="titulo-metrica-empirica" style={{ fontFamily: FONT, color: 'var(--text-pure)' }}><span>Varianza Empírica</span> <ResultadoMath expresion="V(X)" /></p>
                                    <div className="valor-metrica-empirica" style={{ color: 'var(--text-pure)', fontWeight: 'normal' }}>
                                        <ResultadoMath expresion={(resultadoSimulacion.pEmpirica * (1 - resultadoSimulacion.pEmpirica)).toFixed(4)} />
                                    </div>
                                </div>
                                <div className="tarjeta-metrica-empirica">
                                    <p className="titulo-metrica-empirica" style={{ fontFamily: FONT, color: 'var(--text-pure)' }}><span>Desviación Estándar</span> <ResultadoMath expresion={'\\sigma'} /></p>
                                    <div className="valor-metrica-empirica" style={{ color: 'var(--text-pure)', fontWeight: 'normal' }}>
                                        <ResultadoMath expresion={Math.sqrt(resultadoSimulacion.pEmpirica * (1 - resultadoSimulacion.pEmpirica)).toFixed(4)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {resultadoSimulacion && resultadoSimulacion.intentoActual > 0 && (
                        <>
                            <div id="tour-exp-sim-grafica" style={{ marginTop: '15px' }}>
                                <MarcoWidgetMAT251 id="experimentos-convergencia" titulo="Convergencia de la Probabilidad" anchoCompleto={true} alto="400px">
                                    <div style={{ width: '100%', height: '100%', minWidth: 0, padding: 0, boxSizing: 'border-box' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={resultadoSimulacion.puntosGrafica} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
                                                <XAxis
                                                    type="number"
                                                    dataKey="intento"
                                                    stroke="var(--text-muted)"
                                                    fontSize={12}
                                                    domain={[0, Math.max(1, resultadoSimulacion.intentoActual)]}
                                                    tickFormatter={val => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                                                />
                                                <YAxis
                                                    domain={[0, 1]}
                                                    stroke="var(--text-muted)"
                                                    fontSize={12}
                                                    width={36}
                                                    tickFormatter={val => val.toFixed(2)}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'var(--bg-card)',
                                                        borderColor: 'var(--border-color)',
                                                        borderRadius: '5px',
                                                        color: 'var(--text-pure)',
                                                        fontSize: '0.8rem'
                                                    }}
                                                    formatter={(value, name) => [
                                                        `${Number(value).toFixed(4)} (${(Number(value) * 100).toFixed(2)}%)`,
                                                        name
                                                    ]}
                                                    labelFormatter={label => `Ensayo N° ${Number(label).toLocaleString()}`}
                                                />
                                                <Legend
                                                    wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-pure)', paddingTop: '6px' }}
                                                />
                                                <ReferenceLine
                                                    y={resultadoSimulacion.pTeorica}
                                                    stroke="#10b981"
                                                    strokeDasharray="5 5"
                                                    strokeWidth={2}
                                                    label={{ position: 'top', value: 'Probabilidad Teórica', fill: '#10b981', fontSize: 12 }}
                                                />
                                                <Line
                                                    type="linear"
                                                    dataKey="empirica"
                                                    name="Probabilidad Simulada"
                                                    stroke="var(--primary-color)"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    activeDot={{ r: 6 }}
                                                    isAnimationActive={false}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </MarcoWidgetMAT251>
                            </div>

                            <div className="mat251-experimentos-tabla-simulacion" style={{ marginTop: '15px' }}>
                                {(() => {
                                    const totalHistorial = resultadoSimulacion.historialEnsayos?.length || 0;
                                    const totalPaginasSim = Math.max(1, Math.ceil(totalHistorial / FILAS_POR_PAGINA));
                                    const paginaValida = Math.min(Math.max(1, paginaActualTabla), totalPaginasSim);
                                    const inicioPagina = (paginaValida - 1) * FILAS_POR_PAGINA;
                                    const finPagina = inicioPagina + FILAS_POR_PAGINA;
                                    const ensayosPagina = (resultadoSimulacion.historialEnsayos || []).slice(inicioPagina, finPagina);

                                    return (
                                        <>
                                            <div id="tour-exp-sim-tabla" className="mat251-experimentos-tabla-wrap">
                                                <table className="mat251-experimentos-tabla mat251-experimentos-tabla-completa">
                                                    <thead>
                                                        <tr>
                                                            <th>Lanzamiento</th>
                                                            {columnasHistorialSimulacion.map(columna => (
                                                                <th key={columna.id}>{columna.encabezado}</th>
                                                            ))}
                                                            <th>¿Es Éxito?</th>
                                                            <th>Éxitos Acumulados</th>
                                                            <th>Probabilidad Simulada</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {ensayosPagina.map(ensayo => (
                                                            <tr key={ensayo.intento}>
                                                                <td>{ensayo.intento.toLocaleString()}</td>
                                                                {columnasHistorialSimulacion.map(columna => (
                                                                    <td key={`${ensayo.intento}-${columna.id}`}>
                                                                        {String(ensayo.valores?.[columna.id] ?? '—')}
                                                                    </td>
                                                                ))}
                                                                <td className={ensayo.esFavorable ? 'mat251-tabla-exito' : 'mat251-tabla-no-exito'}>{ensayo.esFavorable ? 'Sí' : 'No'}</td>
                                                                <td>{ensayo.exitosAcumulados.toLocaleString()}</td>
                                                                <td>{ensayo.probabilidadAcumulada.toFixed(4)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Controles de Paginación */}
                                            {totalPaginasSim > 1 && (
                                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '12px', marginBottom: '12px', fontSize: FS.sm, flexWrap: 'wrap' }}>
                                                    <button
                                                        type="button"
                                                        disabled={paginaValida === 1}
                                                        onClick={() => setPaginaActualTabla(prev => Math.max(1, prev - 1))}
                                                        className="btn-outline-primary"
                                                        style={{ padding: '4px 12px', borderRadius: RADIUS, fontSize: FS.xs, fontFamily: FONT, cursor: paginaValida === 1 ? 'not-allowed' : 'pointer', opacity: paginaValida === 1 ? 0.5 : 1 }}
                                                        aria-label="Página anterior"
                                                    >
                                                        <span style={{ display: 'inline-block', width: '1.15em', textAlign: 'center', transform: 'scale(1.35)', verticalAlign: 'middle' }} aria-hidden="true">«</span>Anterior
                                                    </button>
                                                    <span style={{ fontWeight: 600, color: 'var(--text-pure)', fontSize: FS.xs, fontFamily: FONT, minWidth: '110px', textAlign: 'center' }}>
                                                        Página {paginaValida} de {totalPaginasSim}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        disabled={paginaValida >= totalPaginasSim}
                                                        onClick={() => setPaginaActualTabla(prev => Math.min(totalPaginasSim, prev + 1))}
                                                        className="btn-outline-primary"
                                                        style={{ padding: '4px 12px', borderRadius: RADIUS, fontSize: FS.xs, fontFamily: FONT, cursor: paginaValida >= totalPaginasSim ? 'not-allowed' : 'pointer', opacity: paginaValida >= totalPaginasSim ? 0.5 : 1 }}
                                                        aria-label="Página siguiente"
                                                    >
                                                        Siguiente<span style={{ display: 'inline-block', width: '1.15em', textAlign: 'center', transform: 'scale(1.35)', verticalAlign: 'middle' }} aria-hidden="true">»</span>
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                                <div id="tour-exp-sim-botones" className="mat251-experimentos-botones-tabla">
                                    <button
                                        id="tour-exp-btn-guardar"
                                        type="button"
                                        className="btn-primary"
                                        onClick={async () => {
                                            try {
                                                const filas = convertirHistorialEnsayosAFilas(
                                                    resultadoSimulacion.historialEnsayos,
                                                    columnasHistorialSimulacion
                                                );
                                                const hoja = XLSX.utils.json_to_sheet(filas);
                                                const libro = XLSX.utils.book_new();
                                                XLSX.utils.book_append_sheet(libro, hoja, 'Simulacion Experimentos');
                                                const contenido = XLSX.write(libro, { bookType: 'xlsx', type: 'array' });
                                                const archivo = new File([new Blob([contenido], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })], `Simulacion_Experimentos_${Date.now()}.xlsx`, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                                                const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
                                                const formData = new FormData();
                                                formData.append('file', archivo);
                                                formData.append('autor', usuario.nombre || 'Estudiante');
                                                formData.append('visibilidad', 'personal');
                                                await api.subirArchivo(formData);
                                                alerta.success('¡Guardado exitoso!', 'El archivo se guardó en tu Espacio Personal.');
                                            } catch (error) {
                                                console.error('Error al guardar el historial de experimentos:', error);
                                                mostrarAlertaModal('Error al guardar', 'No se pudo guardar el archivo en tu Espacio Personal.', 'error');
                                            }
                                        }}
                                    >
                                        <IconoGuardar /> Guardar
                                    </button>
                                    <button
                                        id="tour-exp-btn-descargar"
                                        type="button"
                                        className="btn-verde"
                                        onClick={() => {
                                            const filas = convertirHistorialEnsayosAFilas(
                                                resultadoSimulacion.historialEnsayos,
                                                columnasHistorialSimulacion
                                            );
                                            const hoja = XLSX.utils.json_to_sheet(filas);
                                            const libro = XLSX.utils.book_new();
                                            XLSX.utils.book_append_sheet(libro, hoja, 'Simulacion Experimentos');
                                            XLSX.writeFile(libro, 'Historial_Simulacion_Experimentos.xlsx');
                                        }}
                                    >
                                        <Descargar /> Descargar (.xlsx)
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                    </section>
                </>
            )}
            <ModalAlerta
                isOpen={modalAlerta.isOpen}
                mensaje={modalAlerta.mensaje}
                titulo={modalAlerta.titulo}
                tipo={modalAlerta.tipo}
                onClose={cerrarModalAlerta}
            />
        </section>
    );
}

