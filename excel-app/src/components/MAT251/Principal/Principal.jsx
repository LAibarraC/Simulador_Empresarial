import React, { useState, useEffect, useRef, useMemo } from 'react';
import 'react-data-grid/lib/styles.css';
import { useData } from '../../../components/excel/DataContext';
import { calcularTecnicasConteo, calcularProbabilidadClasica } from '../Matematicas/logica_Tema1';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import '../../../styles/pages/MAT251/CalculosMat251.css';

// ── IMPORTACIONES DE LA NUEVA ESTRUCTURA ──
import { FONT, FS, RADIUS, OPERACIONES, filaVacia, labelStyle } from '../Principal/Constantes';
import ModalEditor, { textEditor } from '../Temas/Tema_1/Modales/Modal_Editor';
import ModalEventos from '../Temas/Tema_1/Modales/Modal_Eventos_Modify';
import ModalVariables from '../Temas/Tema_1/Modales/Modal_Variables';

import ControlesConteo from '../Temas/Tema_1/Controles/Controles_Conteo';
import ControlesProbabilidad from '../Temas/Tema_1/Controles/Controles_Probabilidad';
import ResultadosConteo from '../Temas/Tema_1/Resultados/Resultados_conteo';
import ResultadosProbabilidad from '../Temas/Tema_1/Resultados/Resultados_Probabilidad';

export default function Principal() {
    const { variables } = useData();

    // ── UI ───────────────────────────────────────────────────────────────────────
    const [panelAbierto, setPanelAbierto] = useState(true);
    const [operacion, setOperacion] = useState('permutacion');

    // ── Conteo ───────────────────────────────────────────────────────────────────
    const [n, setN] = useState('0');
    const [r, setR] = useState('0');
    const [resConteo, setResConteo] = useState(null);
    const formulaConteoRef = useRef(null);

    // ── Probabilidad ─────────────────────────────────────────────────────────────
    const [filas, setFilas] = useState([filaVacia(1), filaVacia(2), filaVacia(3)]);
    const [eventoFavorable, setEventoFavorable] = useState([]);
    const [resProbabilidad, setResProbabilidad] = useState(null);
    const [varSeleccionada, setVarSeleccionada] = useState(null);
    const [modalVars, setModalVars] = useState(false);
    const [modalEditor, setModalEditor] = useState(false);
    const [modalEvento, setModalEvento] = useState(false);
    const [filasTemp, setFilasTemp] = useState([]);   // copia editable en el modal
    const formulaProbRef = useRef(null);

    // FUNCIONES //

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

    // Detectar si hay cambios en el editor para habilitar/deshabilitar el botón Guardar
    const hayCambiosEditor = useMemo(() => {
        const limpiosOriginal = filas.filter(f => f.valor.toString().trim() !== '').map(f => f.valor.toString().trim());
        const limpiosTemp = filasTemp.filter(f => f.valor.toString().trim() !== '').map(f => f.valor.toString().trim());

        if (limpiosOriginal.length !== limpiosTemp.length) return true;
        return limpiosOriginal.some((val, idx) => val !== limpiosTemp[idx]);
    }, [filas, filasTemp]);

    // Frecuencias para el selector de eventos
    const statsEventos = useMemo(() => {
        const counts = {};
        const validas = filas.map(f => f.valor.toString().trim()).filter(Boolean);
        validas.forEach(v => {
            counts[v] = (counts[v] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([valor, count]) => ({ valor, count }))
            .sort((a, b) => a.valor.localeCompare(b.valor));
    }, [filas]);


    // Columnas dinámicas para el DataGrid (Editor)
    const columns = useMemo(() => [
        {
            key: 'id',
            name: 'Nº',
            width: 50,
            frozen: true,
            cellClass: 'rdg-cell-center'
        },
        {
            key: 'valor',
            name: varSeleccionada?.nombre ? ` ${varSeleccionada.nombre}` : 'Dato (Valor)',
            renderEditCell: textEditor,
            editable: true,
            cellClass: 'rdg-cell-center'
        }
    ], [varSeleccionada]);

    // Derivar inputDatos desde filas
    const inputDatos = filas.map(f => f.valor.toString().trim()).filter(Boolean).join(', ');

    // Helpers

    const ajustar = (setFn, val, op) => {
        const v = parseInt(val) || 0;
        setFn(Math.max(0, op === '+' ? v + 1 : v - 1).toString());
    };

    const abrirEditor = () => {
        setFilasTemp([...filas, filaVacia(filas.length + 1)]);
        setModalEditor(true);
    };

    const guardarEditor = () => {
        const limpias = filasTemp.filter(f => f.valor.toString().trim() !== '');
        const renumeradas = limpias.map((f, i) => ({ ...f, id: i + 1 }));
        setFilas(renumeradas.length ? renumeradas : [filaVacia(1)]);
        setEventoFavorable([]);
        setResProbabilidad(null);
        setModalEditor(false);
    };

    const cargarVariable = (v) => {
        if (!v?.datos) return;
        const nuevas = v.datos.map((d, i) => ({ id: i + 1, valor: d.toString(), origen: 'cargado' }));
        setFilas(nuevas);
        setEventoFavorable([]);
        setResProbabilidad(null);
        setVarSeleccionada(v);
        setModalVars(false);
    };

    // Katex

    useEffect(() => {
        if (formulaConteoRef.current && resConteo) {
            const esP = resConteo.simbolo === 'nPr';
            const latex = esP
                ? `P(${n},\\,${r})=\\dfrac{${n}!}{(${n}-${r})!}=${resConteo.resultado.toLocaleString()}`
                : `C(${n},\\,${r})=\\dfrac{${n}!}{${r}!(${n}-${r})!}=${resConteo.resultado.toLocaleString()}`;
            katex.render(latex, formulaConteoRef.current, { throwOnError: false, displayMode: true });
        }
    }, [resConteo, n, r]);

    useEffect(() => {
        if (formulaProbRef.current && resProbabilidad) {
            const latex = `P(A)=\\dfrac{n(A)}{N}=\\dfrac{${resProbabilidad.casosFavorables}}{${resProbabilidad.casosTotales}}=${resProbabilidad.probabilidadDecimal}`;
            katex.render(latex, formulaProbRef.current, { throwOnError: false, displayMode: true });
        }
    }, [resProbabilidad]);

    // Calcular

    const ejecutar = () => {
        if (operacion === 'permutacion' || operacion === 'combinacion') {
            const res = calcularTecnicasConteo(n, r, operacion === 'permutacion');
            if (res?.error) { alert(res.error); return; }
            setResConteo(res);
            setResProbabilidad(null);
        } else {
            if (!inputDatos) { alert('Agrega datos al espacio muestral'); return; }
            if (eventoFavorable.length === 0) { alert('Selecciona al menos un evento favorable'); return; }
            const arr = inputDatos.split(',').map(d => d.trim()).filter(Boolean);
            const res = calcularProbabilidadClasica(arr, eventoFavorable.join(','));
            if (!res) { alert('Error al calcular. Revisa los datos.'); return; }
            setResProbabilidad(res);
            setResConteo(null);
        }
    };

    const handleOperacion = (val) => {
        setOperacion(val);
        setResConteo(null);
        setResProbabilidad(null);
    };

    const hayResultado = resConteo || resProbabilidad;

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
            <button onClick={() => setPanelAbierto(!panelAbierto)} className={`boton-toggle-medio ${panelAbierto ? 'abierto' : 'cerrado'}`} title={panelAbierto ? 'Ocultar panel' : 'Mostrar panel'}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: FS.base, color: '#fff', transform: panelAbierto ? 'scaleX(1)' : 'scaleX(-1)', transition: 'transform 0.3s ease', lineHeight: 0, marginTop: '-2px', marginLeft: '-1px' }}>❮</span>
            </button>

            {/* PANEL IZQUIERDO */}
            <div className="calculadora-datos" style={{ fontFamily: FONT }}>
                <div style={{ borderBottom: panelAbierto ? '1px solid var(--border-color)' : 'none', paddingBottom: '5px', marginBottom: panelAbierto ? '5px' : '0' }}>
                    {panelAbierto && <h3 style={{ margin: 0, fontSize: FS.lg, fontFamily: FONT, fontWeight: 600 }}>Parámetros</h3>}
                </div>
                {panelAbierto && (
                    <div className="panel-controles-excel" style={{ marginTop: '10px', fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>
                        <h3 className="panel-controles-excel_h3" style={{ fontSize: FS.lg, fontFamily: FONT, fontWeight: 600 }}>Calculadora</h3>

                        {/* Selector operación */}
                        <label style={labelStyle}>Operación:</label>
                        <select value={operacion} onChange={(e) => handleOperacion(e.target.value)} className="container_operaciones" style={{ fontSize: FS.base, fontFamily: FONT, borderRadius: RADIUS }}>
                            {OPERACIONES.map((g) => (
                                <optgroup key={g.grupo} label={g.grupo}>
                                    {g.opciones.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </optgroup>
                            ))}
                        </select>

                        {/* SEPARACION DE CONTROLES */}
                        {(operacion === 'permutacion' || operacion === 'combinacion') && (
                            <ControlesConteo n={n} setN={setN} r={r} setR={setR} ajustar={ajustar} ejecutar={ejecutar}/>
                        )}
                        {operacion === 'probabilidad' && (
                            <ControlesProbabilidad setModalVars={setModalVars} varSeleccionada={varSeleccionada}/>
                        )}
                    </div>
                )}
            </div>

            {/* PANEL RESULTADOS */}

            <div className="calculadora-resultados" style={{ fontFamily: FONT }}>
                <div className="frecuencias" style={{ borderRadius: RADIUS }}>
                    <h3 style={{ fontSize: FS.lg, fontFamily: FONT, fontWeight: 600 }}>
                        Resultados: {operacion === 'permutacion' ? 'PERMUTACIÓN' : operacion === 'combinacion' ? 'COMBINACIÓN' : 'PROBABILIDAD CLÁSICA'}
                    </h3>

                    {/* RESULTADOS */}
                    {(operacion === 'permutacion' || operacion === 'combinacion') ? (
                        <ResultadosConteo resConteo={resConteo} formulaConteoRef={formulaConteoRef} hayResultado={hayResultado} />
                    ) : (
                        <ResultadosProbabilidad
                            statsDatos={statsDatos} abrirEditor={abrirEditor} valoresUnicos={valoresUnicos}
                            statsEventos={statsEventos} setModalEvento={setModalEvento} eventoFavorable={eventoFavorable}
                            ejecutar={ejecutar} resProbabilidad={resProbabilidad} formulaProbRef={formulaProbRef}
                            inputDatos={inputDatos}
                        />
                    )}
                </div>
            </div>

            {/* MODALES*/}
            <ModalEditor modalEditor={modalEditor} setModalEditor={setModalEditor} filasTemp={filasTemp} setFilasTemp={setFilasTemp} columns={columns} guardarEditor={guardarEditor} hayCambiosEditor={hayCambiosEditor} />
            <ModalEventos modalEvento={modalEvento} setModalEvento={setModalEvento} statsEventos={statsEventos} eventoFavorable={eventoFavorable} setEventoFavorable={setEventoFavorable} setResProbabilidad={setResProbabilidad} />
            <ModalVariables modalVars={modalVars} setModalVars={setModalVars} variables={variables} cargarVariable={cargarVariable} />
        </div>
    );

}