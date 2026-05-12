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

import Operacion from '../Temas/Tema_1/Controles/Operacion';

export default function Principal() {
    const { variables } = useData();

    // ── UI ───────────────────────────────────────────────────────────────────────
    const [panelAbierto, setPanelAbierto] = useState(true);
    const [operacion, setOperacion] = useState('permutacion');
    const [subTipoProbabilidad, setSubTipoProbabilidad] = useState('clasica');

    // ── Conteo ───────────────────────────────────────────────────────────────────
    const [n, setN] = useState('0');
    const [r, setR] = useState('0');
    const [resConteo, setResConteo] = useState(null);
    const formulaConteoRef = useRef(null);

    // ── Probabilidad ─────────────────────────────────────────────────────────────
    const [filas, setFilas] = useState([filaVacia(1), filaVacia(2), filaVacia(3)]);
    const [eventoFavorable, setEventoFavorable] = useState([]);
    const [eventoCondicion, setEventoCondicion] = useState([]);
    const [resProbabilidad, setResProbabilidad] = useState(null);
    const [varSeleccionada, setVarSeleccionada] = useState(null);
    const [modalVars, setModalVars] = useState(false);
    const [modalEditor, setModalEditor] = useState(false);
    const [modalEvento, setModalEvento] = useState(false);
    const [modalCondicion, setModalCondicion] = useState(false);
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
        let limpiosOriginal = filas.filter(f => (f.valor || '').toString().trim() !== '').map(f => (f.valor || '').toString().trim());
        let limpiosTemp = [];

        if (varSeleccionada?.nombresColumnas && varSeleccionada.nombresColumnas.length > 1) {
            limpiosTemp = filasTemp.filter(f => {
                return varSeleccionada.nombresColumnas.some((_, idx) => (f[`col_${idx}`] || '').toString().trim() !== '');
            }).map(f => varSeleccionada.nombresColumnas.map((_, idx) => (f[`col_${idx}`] || '').toString().trim()).join(' | '));
        } else {
            limpiosTemp = filasTemp.filter(f => (f.valor || '').toString().trim() !== '').map(f => (f.valor || '').toString().trim());
        }

        if (limpiosOriginal.length !== limpiosTemp.length) return true;
        return limpiosOriginal.some((val, idx) => val !== limpiosTemp[idx]);
    }, [filas, filasTemp, varSeleccionada]);

    // Frecuencias para el selector de eventos
    const statsEventos = useMemo(() => {
        const counts = {};
        const validas = filas.map(f => (f.valor || '').toString().trim()).filter(Boolean);
        validas.forEach(v => {
            if (v.includes(' | ')) {
                const partes = v.split(' | ').map(p => p.trim());
                partes.forEach(p => {
                    if (p) counts[p] = (counts[p] || 0) + 1;
                });
            } else {
                counts[v] = (counts[v] || 0) + 1;
            }
        });
        return Object.entries(counts)
            .map(([valor, count]) => ({ valor, count }))
            .sort((a, b) => a.valor.localeCompare(b.valor));
    }, [filas]);

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
            name: varSeleccionada?.nombre ? ` ${varSeleccionada.nombre}` : (subTipoProbabilidad === 'frecuentista' ? 'Observación' : 'Datos (Valores)'),
            renderEditCell: textEditor,
            editable: true,
            cellClass: 'rdg-cell-center'
        });
        return base;
    }, [varSeleccionada, subTipoProbabilidad]);

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
        setModalEditor(true);
    };

    const guardarEditor = () => {
        let limpias = [];
        if (varSeleccionada?.nombresColumnas && varSeleccionada.nombresColumnas.length > 1) {
            limpias = filasTemp.filter(f => {
                const isNotEmpty = varSeleccionada.nombresColumnas.some((_, idx) => (f[`col_${idx}`] || '').toString().trim() !== '');
                if (!isNotEmpty) return false;
                f.valor = varSeleccionada.nombresColumnas.map((_, idx) => (f[`col_${idx}`] || '').toString().trim()).join(' | ');
                return true;
            });
        } else {
            limpias = filasTemp.filter(f => (f.valor || '').toString().trim() !== '');
        }

        const renumeradas = limpias.map((f, i) => ({ ...f, id: i + 1, valor: f.valor }));
        setFilas(renumeradas.length ? renumeradas : [filaVacia(1)]);
        setEventoFavorable([]);
        setResProbabilidad(null);
        setModalEditor(false);
    };

    const cargarVariable = (varsArray) => {
        const arr = Array.isArray(varsArray) ? varsArray : [varsArray];
        if (arr.length === 0) return;

        const nombreCombinado = arr.map(v => v.nombre).join(' | ');
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
        setVarSeleccionada({
            nombre: nombreCombinado,
            esCombinada: arr.length > 1,
            datos: nuevas.map(n => n.valor),
            // Si es combinación de varias variables, los nombres de columna son los nombres de esas variables
            // Si es una sola variable, usa su propio nombresColumnas (puede existir si viene de Excel multi-col)
            nombresColumnas: arr.length > 1 ? arr.map(v => v.nombre) : (arr[0]?.nombresColumnas || null)
        });
        setModalVars(false);
    };

    // Sincronizar datos si la variable es editada/eliminada en Gestión de Datos
    useEffect(() => {
        if (!varSeleccionada) return;
        if (varSeleccionada.esCombinada) return; // Si es combinada omitimos la sincronización automática
        const varActualizada = variables.find(v => v.nombre === varSeleccionada.nombre);

        if (!varActualizada) {
            setVarSeleccionada(null);
            setFilas([filaVacia(1), filaVacia(2), filaVacia(3)]);
            setEventoFavorable([]);
            setResProbabilidad(null);
            return;
        }

        const datosViejos = JSON.stringify(varSeleccionada.datos);
        const datosNuevos = JSON.stringify(varActualizada.datos);

        if (datosViejos !== datosNuevos) {
            setVarSeleccionada(varActualizada);
            const nuevas = varActualizada.datos.map((d, i) => ({ id: i + 1, valor: d.toString(), origen: 'cargado' }));
            setFilas(nuevas);
            setEventoFavorable([]);
            setEventoCondicion([]);
            setResProbabilidad(null);
        }
    }, [variables, varSeleccionada]);

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
            let latex = '';
            if (subTipoProbabilidad === 'frecuentista') {
                latex = `P(A)=\\dfrac{f_A}{N}=\\dfrac{${resProbabilidad.casosFavorables}}{${resProbabilidad.casosTotales}}=${resProbabilidad.probabilidadDecimal}`;
            } else if (subTipoProbabilidad === 'condicional') {
                latex = `P(A|B)=\\dfrac{n(A \\cap B)}{n(B)}=\\dfrac{${resProbabilidad.casosFavorables}}{${resProbabilidad.casosTotales}}=${resProbabilidad.probabilidadDecimal}`;
            } else {
                latex = `P(A)=\\dfrac{n(A)}{N}=\\dfrac{${resProbabilidad.casosFavorables}}{${resProbabilidad.casosTotales}}=${resProbabilidad.probabilidadDecimal}`;
            }
            katex.render(latex, formulaProbRef.current, { throwOnError: false, displayMode: true });
        }
    }, [resProbabilidad, subTipoProbabilidad]);

    // Calcular

    const ejecutar = () => {
        if (operacion === 'permutacion' || operacion === 'combinacion') {
            const res = calcularTecnicasConteo(n, r, operacion === 'permutacion');
            if (res?.error) { alert(res.error); return; }
            setResConteo(res);
            setResProbabilidad(null);
        } else {
            if (!inputDatos) { alert('Agrega datos al espacio muestral'); return; }
            const arr = inputDatos.split(',').map(d => d.trim()).filter(Boolean);

            if (subTipoProbabilidad === 'condicional') {
                if (eventoCondicion.length === 0) { alert('Selecciona al menos un evento para la Condición (B)'); return; }
                if (eventoFavorable.length === 0) { alert('Selecciona al menos un Evento de Interés (A)'); return; }

                // Filtrar el arreglo base para que solo queden los elementos que contienen la condición B
                const arrFiltrado = arr.filter(d => {
                    const partes = d.split(' | ').map(p => p.trim());
                    return eventoCondicion.some(cond => partes.includes(cond));
                });

                if (arrFiltrado.length === 0) { alert('La condición (B) no tiene ocurrencias en los datos. Probabilidad indefinida.'); return; }

                // La probabilidad de A dado B es encontrar A dentro del arrFiltrado
                const casosA = arrFiltrado.filter(d => {
                    const partes = d.split(' | ').map(p => p.trim());
                    return eventoFavorable.some(fav => partes.includes(fav));
                }).length;

                const casosATotal = arr.filter(d => {
                    const partes = d.split(' | ').map(p => p.trim());
                    return eventoFavorable.some(fav => partes.includes(fav));
                }).length;

                const res = {
                    casosFavorables: casosA,
                    casosTotales: arrFiltrado.length,
                    probabilidadDecimal: (casosA / arrFiltrado.length).toFixed(4),
                    probabilidadPorcentaje: ((casosA / arrFiltrado.length) * 100).toFixed(2),
                    vennStats: {
                        nA: casosATotal,
                        nB: arrFiltrado.length,
                        nAB: casosA,
                        nTotal: arr.length
                    },
                    arrFiltrado: arrFiltrado
                };

                setResProbabilidad(res);
                setResConteo(null);
            } else {
                if (eventoFavorable.length === 0) { alert('Selecciona al menos un evento favorable'); return; }

                const casosA = arr.filter(d => {
                    const partes = d.split(' | ').map(p => p.trim());
                    return eventoFavorable.some(fav => partes.includes(fav));
                }).length;

                const res = {
                    casosFavorables: casosA,
                    casosTotales: arr.length,
                    probabilidadDecimal: (casosA / arr.length).toFixed(4),
                    probabilidadPorcentaje: ((casosA / arr.length) * 100).toFixed(2),
                    vennStats: {
                        nA: casosA,
                        nB: 0,
                        nAB: 0,
                        nTotal: arr.length
                    }
                };

                setResProbabilidad(res);
                setResConteo(null);
            }
        }
    };

    const handleOperacion = (val) => {
        setOperacion(val);
        if (val === 'probabilidad') setSubTipoProbabilidad('clasica');
        setResConteo(null);
        setResProbabilidad(null);
    };

    // Al cambiar subTipo, borrar resultados
    useEffect(() => {
        setResProbabilidad(null);
    }, [subTipoProbabilidad]);

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
                <span className={`icono-toggle ${panelAbierto ? 'abierto' : 'cerrado'}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: FS.base, color: '#fff', transition: 'transform 0.3s ease', lineHeight: 0, marginTop: '-2px', marginLeft: '-1px' }}>❮</span>
            </button>

            {/* PANEL IZQUIERDO */}
            <div className="calculadora-datos" style={{ fontFamily: FONT }}>
                <div style={{ borderBottom: panelAbierto ? '0px solid var(--border-color)' : 'none', paddingBottom: '5px', marginBottom: panelAbierto ? '5px' : '0' }}>
                    {panelAbierto && <h3 style={{ margin: 0, fontSize: FS.lg, fontFamily: FONT, fontWeight: 600 }}>Parámetros</h3>}
                </div>
                {panelAbierto && (
                    <div className="panel-controles-excel" style={{ marginTop: '10px', fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>
                        {/* Selector de operación iterativo (Personalizado) */}
                        <label style={{ ...labelStyle, fontSize: '1.2em' }}>Operación:</label>
                        <Operacion operacion={operacion} handleOperacion={handleOperacion} />

                        {/* SUB-SELECTOR DE PROBABILIDAD */}
                        {operacion === 'probabilidad' && (
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ ...labelStyle, fontSize: '1.1em', marginBottom: '8px' }}>Tipo de Probabilidad:</label>
                                <div style={{ display: 'flex', gap: '5px', background: 'var(--bg-card)', padding: '4px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                                    {[
                                        { id: 'clasica', label: 'Clásica' },
                                        { id: 'frecuentista', label: 'Frecuentista' },
                                        { id: 'condicional', label: 'Condicional' }
                                    ].map(tipo => (
                                        <button
                                            key={tipo.id}
                                            onClick={() => setSubTipoProbabilidad(tipo.id)}
                                            style={{
                                                flex: 1,
                                                padding: '8px 4px',
                                                border: 'none',
                                                borderRadius: RADIUS,
                                                background: subTipoProbabilidad === tipo.id ? 'var(--primary-color)' : 'transparent',
                                                color: subTipoProbabilidad === tipo.id ? 'white' : 'var(--text-color)',
                                                fontWeight: subTipoProbabilidad === tipo.id ? 600 : 400,
                                                cursor: 'pointer',
                                                fontSize: FS.sm,
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {tipo.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SEPARACION DE CONTROLES */}
                        {(operacion === 'permutacion' || operacion === 'combinacion') && (
                            <ControlesConteo n={n} setN={setN} r={r} setR={setR} ajustar={ajustar} ejecutar={ejecutar} />
                        )}
                        {operacion === 'probabilidad' && (
                            <>
                                <ControlesProbabilidad setModalVars={setModalVars} varSeleccionada={varSeleccionada} tipo={subTipoProbabilidad} />
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* PANEL RESULTADOS */}

            <div className="calculadora-resultados" style={{ fontFamily: FONT }}>
                <div className="frecuencias" style={{ borderRadius: RADIUS }}>
                    <h3 style={{ fontSize: FS.lg, fontFamily: FONT, fontWeight: 600 }}>
                        Resultados: {operacion === 'permutacion' ? 'PERMUTACIÓN' : operacion === 'combinacion' ? 'COMBINACIÓN' : (subTipoProbabilidad === 'clasica' ? 'PROBABILIDAD CLÁSICA' : subTipoProbabilidad === 'frecuentista' ? 'PROBABILIDAD FRECUENTISTA' : 'PROBABILIDAD CONDICIONAL')}
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
                            tipo={subTipoProbabilidad}
                            eventoCondicion={eventoCondicion} setModalCondicion={setModalCondicion}
                        />
                    )}
                </div>
            </div>

            {/* MODALES*/}
            <ModalEditor modalEditor={modalEditor} setModalEditor={setModalEditor} filasTemp={filasTemp} setFilasTemp={setFilasTemp} columns={columns} guardarEditor={guardarEditor} hayCambiosEditor={hayCambiosEditor} titulo={subTipoProbabilidad === 'frecuentista' ? 'Editor de Datos Históricos' : 'Editor de Espacio Muestral'} />
            <ModalEventos modalEvento={modalEvento} setModalEvento={setModalEvento} statsEventos={statsEventos} statsEventosPorColumna={statsEventosPorColumna} eventoFavorable={eventoFavorable} setEventoFavorable={setEventoFavorable} setResProbabilidad={setResProbabilidad} titulo={subTipoProbabilidad === 'frecuentista' ? 'Seleccionar Evento de Interés' : 'Seleccionar Eventos Favorables'} />
            <ModalEventos modalEvento={modalCondicion} setModalEvento={setModalCondicion} statsEventos={statsEventos} statsEventosPorColumna={statsEventosPorColumna} eventoFavorable={eventoCondicion} setEventoFavorable={setEventoCondicion} setResProbabilidad={setResProbabilidad} titulo="Seleccionar Eventos para Condición (B)" />
            <ModalVariables modalVars={modalVars} setModalVars={setModalVars} variables={variables} cargarVariable={cargarVariable} />
        </div>
    );

}