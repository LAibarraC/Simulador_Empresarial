import React, { useState, useRef, useMemo, useEffect } from 'react';
import { AgGridReact, AgGridProvider } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

import { useData } from '../components/excel/DataContext';
import { keyToNum, getExcelChar, excelToCoords } from '../utils/excelHelpers';
import VariableCard from '../components/excel/VariableCard';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import "../styles/pages/Datos.css";
import * as XLSX from 'xlsx'; 

import api from '../services/api';


ModuleRegistry.registerModules([AllCommunityModule]);

const SimuladorMAT251 = () => {

    const gridRef = useRef();
    const {
        workbook, sheetNames, currentSheet, rowData, variables, limiteFilas,
        handleFileUpload, cargarHoja, agregarVariable, eliminarVariable, actualizarVariable, setLimiteFilas
    } = useData();

    const [selection, setSelection] = useState({ start: null, end: null, isDragging: false });
    const [isDraggingFile, setIsDraggingFile] = useState(false);



    // ESTADOS PARA LA API
    const [archivosApi, setArchivosApi] = useState([]); 
    const [cargandoApi, setCargandoApi] = useState(false); 
    const [archivoActivo, setArchivoActivo] = useState(null); 
    const [_selectedApiFile, setSelectedApiFile] = useState("");

    // USE-EFFECT: Cargar lista de archivos de FastAPI 
    useEffect(() => {
        const cargarListaArchivos = async () => {
            try {
                const data = await api.obtenerArchivos();
                if (data && data.files) {
                    setArchivosApi(data.files);
                }
            } catch (error) {
                console.error("Error al cargar la lista de archivos de la API", error);
            }
        };
        cargarListaArchivos();
    }, []);

    const manejarSubidaLocal = (e) => {
        const files = e.target?.files || e.dataTransfer?.files;
        if (files && files.length > 0) {
            setArchivoActivo({ nombre: files[0].name, origen: 'LOCAL' });
            setSelectedApiFile("");
            handleFileUpload(e);
        }
    };

    // FUNCIÓN: Descargar de FastAPI y simular en PC
    const cargarDesdeAPI = async (filename) => {
        if (!filename) return;
        try {
            setCargandoApi(true);
            const dataBuffer= await api.descargarArchivoExcel(filename);
            const fileVirtual = new File([dataBuffer], filename, {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });

            setArchivoActivo({ nombre: filename, origen: 'API' });
            handleFileUpload({ target: { files: [fileVirtual] } });
        } catch (error) {
            alert("Error al cargar dataset: " + error.message);
        } finally {
            setCargandoApi(false);
        }
    };


    useEffect(() => {
        if (gridRef.current?.api) {
            gridRef.current.api.refreshCells({ force: true, suppressFlash: true });
        }
    }, [selection, variables, currentSheet]);

    useEffect(() => {
        const handleGlobalUp = () => setSelection(prev => ({ ...prev, isDragging: false }));
        window.addEventListener('mouseup', handleGlobalUp);
        return () => window.removeEventListener('mouseup', handleGlobalUp);
    }, []);

    // --- FUNCIONES PARA DRAG AND DROP ---
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDraggingFile(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDraggingFile(false);
    };

    const totalFilasEnHoja = useMemo(() => {
        if (!workbook || !currentSheet) return 0;
        const ws = workbook.Sheets[currentSheet];
        // XLSX.utils.sheet_to_json con header "A" nos da un array donde cada item es una fila
        const dataCompleta = XLSX.utils.sheet_to_json(ws, { header: "A", defval: "" });
        return dataCompleta.length;
    }, [workbook, currentSheet]);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDraggingFile(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            manejarSubidaLocal({ target: { files: files } });
        }
    };

    // Agrupamos las acciones para pasarlas a la VariableCard
    const actions = {
        delete: eliminarVariable,
        update: actualizarVariable,
        switchSheet: (name) => name && workbook && cargarHoja(workbook, name),
        assignName: (id) => {
            const val = rowData[selection.start?.row]?.[getExcelChar(selection.start?.col)];
            if (val) actualizarVariable(id, { nombre: String(val) });
        },

        clear: (id) => {
            if (window.confirm("¿Estás seguro de limpiar los datos de esta variable?")) {
                actualizarVariable(id, {
                    rangoLabel: '',
                    coords: null,
                    datos: [],
                    sheet: null
                });
            }
        },

        capture: (id) => {
            const { start, end } = selection;
            if (!start || !end) return alert("⚠️ Selecciona un rango en el Excel primero.");

            const rMin = Math.min(start.row, end.row);
            const rMax = Math.max(start.row, end.row);
            const cMin = Math.min(start.col, end.col);
            const cMax = Math.max(start.col, end.col);

            const solapada = variables.find(v => {
                if (v.id !== id && v.sheet === currentSheet && v.coords) {
                    const cruceFilas = rMin <= v.coords.rMax && rMax >= v.coords.rMin;
                    const cruceColumnas = cMin <= v.coords.cMax && cMax >= v.coords.cMin;
                    return cruceFilas && cruceColumnas;
                }
                return false;
            });

            if (solapada) {
                return alert(`⚠️ Error: El rango choca con la variable "${solapada.nombre}".`);
            }


            // 🌟 LA RED DE CAPTURA CORREGIDA 🌟
            const datosValidos = [];
            let contadorNumeros = 0;
            let contadorTextos = 0;

            for (let r = rMin; r <= rMax; r++) {
                for (let c = cMin; c <= cMax; c++) {

                    // 1. Obtenemos el dato en bruto. ¡NADA de parseFloat aquí!
                    const columnaLetra = getExcelChar(c);
                    const rawVal = rowData[r]?.[columnaLetra];

                    // 2. Si la celda NO está vacía, NO es nula, y NO es undefined
                    if (rawVal !== undefined && rawVal !== null && rawVal !== "") {

                        // 3. Lo guardamos INMEDIATAMENTE en el array (sea lo que sea)
                        datosValidos.push(rawVal);

                        // 4. Ahora sí, clasificamos qué fue lo que acabamos de guardar
                        // Usamos Number() solo para comprobar, no para transformar el dato original
                        if (isNaN(Number(rawVal))) {
                            contadorTextos++;
                        } else {
                            contadorNumeros++;
                        }
                    }
                }
            }

            // Decisión por mayoría
            let tipoDetectado = "Sin datos";
            if (datosValidos.length > 0) {
                if (contadorNumeros > 0 && contadorTextos > 0) {
                    tipoDetectado = "Mixta (Error)";
                } else if (contadorNumeros > 0 && contadorTextos === 0) {
                    tipoDetectado = "Cuantitativa (Número)";
                } else {
                    tipoDetectado = "Cualitativa (Texto)";
                }
            }

            // Actualizamos la variable inyectando los datos y el tipo
            actualizarVariable(id, {
                rangoLabel: `${getExcelChar(cMin)}${rMin + 1}:${getExcelChar(cMax)}${rMax + 1}`,
                coords: { rMin, rMax, cMin, cMax },
                datos: datosValidos, // 👈 Ahora esto ya no estará vacío
                sheet: currentSheet,
                tipo: tipoDetectado
            });

            setSelection({ start: null, end: null, isDragging: false });
        },
        manualRange: (id, texto) => {
            const nuevoTexto = texto.toUpperCase();
            const partes = nuevoTexto.split(':');
            const inicio = excelToCoords(partes[0]);
            const fin = partes[1] ? excelToCoords(partes[1]) : inicio;

            if (inicio && fin) {
                const coords = {
                    rMin: Math.min(inicio.r, fin.r),
                    rMax: Math.max(inicio.r, fin.r),
                    cMin: Math.min(inicio.c, fin.c),
                    cMax: Math.max(inicio.c, fin.c)
                };

                // 🌟 LA MISMA RED DE CAPTURA QUE USAMOS EN EL BOTÓN 🌟
                const datosValidos = [];
                let contadorNumeros = 0;
                let contadorTextos = 0;

                for (let r = coords.rMin; r <= coords.rMax; r++) {
                    for (let c = coords.cMin; c <= coords.cMax; c++) {
                        const rawVal = rowData[r]?.[getExcelChar(c)];
                        if (rawVal !== undefined && rawVal !== null && rawVal !== "") {
                            datosValidos.push(rawVal);

                            if (isNaN(Number(rawVal))) {
                                contadorTextos++;
                            } else {
                                contadorNumeros++;
                            }
                        }
                    }
                }

                // Decisión de tipo
                let tipoDetectado = "Sin datos";

                if (datosValidos.length > 0) {
                    // Si hay por lo menos 1 número Y por lo menos 1 texto en la misma selección:
                    if (contadorNumeros > 0 && contadorTextos > 0) {
                        tipoDetectado = "Mixta (Error)";
                    }
                    // Si SOLO hay números:
                    else if (contadorNumeros > 0 && contadorTextos === 0) {
                        tipoDetectado = "Cuantitativa (Número)";
                    }
                    // Si SOLO hay textos:
                    else {
                        tipoDetectado = "Cualitativa (Texto)";
                    }
                }

                actualizarVariable(id, {
                    rangoLabel: nuevoTexto,
                    coords,
                    datos: datosValidos,
                    sheet: currentSheet,
                    tipo: tipoDetectado // Inyectamos el tipo también aquí
                });
            } else {
                actualizarVariable(id, { rangoLabel: nuevoTexto });
            }
        }
    };

    const columnDefs = useMemo(() => {
        if (rowData.length === 0) return [];
        const keys = Object.keys(rowData[0]);
        const rowNumberCol = {
            headerName: '', valueGetter: "node.rowIndex + 1", width: 45, pinned: 'left',
            cellStyle: { backgroundColor: '#f8fafc', fontWeight: 'bold', textAlign: 'center', color: '#64748b', fontSize: '11px' }
        };

        const dataCols = keys.map(key => ({
            headerName: key, field: key, width: 120, resizable: true,
            cellClassRules: {
                'celda-azul-seleccion': params => {
                    if (!selection.start || !selection.end) return false;
                    const r = params.node.rowIndex, c = keyToNum(params.column.colId);
                    const rMin = Math.min(selection.start.row, selection.end.row), rMax = Math.max(selection.start.row, selection.end.row);
                    const cMin = Math.min(selection.start.col, selection.end.col), cMax = Math.max(selection.start.col, selection.end.col);
                    return r >= rMin && r <= rMax && c >= cMin && c <= cMax;
                }
            },
            cellStyle: params => {
                const r = params.node.rowIndex, c = keyToNum(params.column.colId);
                const v = variables.find(vItem => vItem.sheet === currentSheet && vItem.coords && r >= vItem.coords.rMin && r <= vItem.coords.rMax && c >= vItem.coords.cMin && c <= vItem.coords.cMax);
                return v ? { backgroundColor: v.color, fontWeight: 'bold', fontSize: '10px' } : { fontSize: '11px' };
            }
        }));
        return [rowNumberCol, ...dataCols];
    }, [rowData, variables, currentSheet, selection]);
    console.log("ESTADO DE VARIABLES:", variables);

    return (
        <AgGridProvider modules={[AllCommunityModule]}>
            <div style={{ backgroundColor: 'var(--bg-body)', color: 'var(--text-main)', minHeight: '100vh', fontFamily: 'sans-serif', marginTop: '5px' }}>
                <header>
                    <div className="upload-container">
                        <div className="upload-column">
                            <p className="upload-title">Archivos subidos</p>
                            <select
                                className="select-hoja"
                                style={{ width: '60%', cursor: 'pointer' }}
                                disabled={cargandoApi || archivosApi.length === 0}
                                onChange={(e) => cargarDesdeAPI(e.target.value)}
                            >
                                <option value="">
                                    {archivosApi.length === 0 ? "Buscando archivos..." : "Seleccionar Archivo"}
                                </option>
                                {archivosApi.map((archivo, index) => (
                                    <option key={index} value={archivo.filename}>
                                        {archivo.filename}
                                    </option>
                                ))}
                            </select>
                            <p style={{ fontSize: '11px', marginTop: '5px', color: 'var(--text-muted)' }}>
                                {cargandoApi ? "⏳ Descargando y procesando..." : "Click para cargar"}
                            </p>
                        </div>
                        <div className="column-divider"></div>
                        <div
                            className={`upload-box ${isDraggingFile ? 'drag-over' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <p className="upload-title">Sube tu tabla de datos</p>
                            <p className="upload-subtitle">Formatos soportados: .xlsx, .xls</p>

                            <div className="upload-controls">
                                <label className="btn-upload">
                                    Explorar archivos
                                    <input
                                        type="file"
                                        onChange={manejarSubidaLocal}
                                        accept=".xlsx, .xls"
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                <span className="file-status">
                                    {workbook ? "Archivo cargado con éxito" : "o arrastra el archivo aquí"}
                                </span>
                            </div>
                        </div>
                    </div >
                    {sheetNames.length > 0 && (
                        <div style={{
                            margin: '5px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            padding: '10px 20px',
                            backgroundColor: 'var(--bg-card)',
                            borderRadius: '5px',
                            border: '1px solid var(--border-color)'
                        }}>

                            <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                                <strong>Archivo: </strong>
                                <span style={{ color: '#3b82f6', marginRight: '8px' }}>
                                    {archivoActivo ? archivoActivo.nombre : (workbook ? "Documento cargado" : "Sin archivo")}
                                </span>
                                {archivoActivo && (
                                    <span style={{ color: 'var(--text-muted)' }}>
                                        {archivoActivo.origen === 'API' ? '(Servidor)' : '(Local)'}
                                    </span>
                                )}
                            </div>

                            <div>
                                <span style={{ marginRight: '10px', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.8rem' }}>
                                    Hoja activa del Excel:
                                </span>
                                <select
                                    value={currentSheet}
                                    onChange={(e) => cargarHoja(workbook, e.target.value)}
                                    className="select-hoja"
                                >
                                    {sheetNames.map(name => <option key={name} value={name}>{name}</option>)}
                                </select>
                            </div>

                        </div>
                    )}

                </header>

                <div className='main-layout-flex'>
                    <aside className='bloque-variables'>
                        <div className="header-variables">
                            <h3 style={{ fontSize: '0.8rem', margin: 0 }}>Variables:</h3>
                            <button onClick={agregarVariable} className="btn-nueva-var">
                                Nueva variable
                            </button>
                        </div>
                        <div className="seccion-scroll-variables">
                            {variables.map(v => (
                                <VariableCard key={v.id} v={v} currentSheet={currentSheet} actions={actions} />
                            ))}
                        </div>
                    </aside>

                    <section className='contenedor-excel'>
                        <div className="ag-theme-alpine grid-wrapper">
                            <AgGridReact
                                ref={gridRef} rowData={rowData} columnDefs={columnDefs}
                                onCellMouseDown={p => setSelection({ start: { row: p.node.rowIndex, col: keyToNum(p.column.colId) }, end: { row: p.node.rowIndex, col: keyToNum(p.column.colId) }, isDragging: true })}
                                onCellMouseOver={p => selection.isDragging && setSelection(prev => ({ ...prev, end: { row: p.node.rowIndex, col: keyToNum(p.column.colId) } }))}
                                suppressCellFocus={true} headerHeight={30} rowHeight={25}
                            />
                        </div>

                        {/* BOTÓN ÚNICO Y CORREGIDO */}
                        {workbook && rowData.length < totalFilasEnHoja && (
                            <button
                                onClick={() => {
                                    const n = limiteFilas + 50;
                                    setLimiteFilas(n);
                                    cargarHoja(workbook, currentSheet, n);
                                }}
                                style={{
                                    marginTop: '10px',
                                    backgroundColor: 'var(--header-bg)',
                                    color: 'var(--text-main)',
                                    border: '1px dashed var(--border-color)',
                                    borderRadius: '5px',
                                    padding: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cargar 50 filas más... (Mostrando {rowData.length} de {totalFilasEnHoja})
                            </button>
                        )}
                    </section>
                </div>
            </div>
        </AgGridProvider>
    );
};

export default SimuladorMAT251;