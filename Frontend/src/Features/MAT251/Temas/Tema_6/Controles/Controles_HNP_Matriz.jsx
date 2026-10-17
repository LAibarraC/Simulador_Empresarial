import React, { useState, useEffect, useRef } from 'react';
import { cardStyle, FONT, RADIUS, FS, labelStyle } from '../../../Principal/Constantes';
import { EditarDatos } from '../../../../../ui/iconos';
import { pruebaChiCuadradaBondad, pruebaChiCuadradaIndependencia, pruebaSignos, pruebaRachas } from '../../../Matematicas/Logica_Tema6';
import ModalAlerta from '../../../ui/ModalAlerta';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const renderKatex = (math) => <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />;

export default function Controles_HNP_Matriz({ varSeleccionada, filas, statsDatos, abrirEditor, prueba, setResultadosMatriz, variables }) {
    const [alpha, setAlpha] = useState(0.05);
    const [isAlphaOpen, setIsAlphaOpen] = useState(false);
    const alphaRef = useRef(null);

    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Atención', tipo: 'warning' });

    // Chi Cuadrada
    const [subTipoChi, setSubTipoChi] = useState('bondad');
    const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);
    const [isTipoChiOpen, setIsTipoChiOpen] = useState(false);
    const tipoChiRef = useRef(null);

    // Edición de Esperadas
    const [categoriasExtraidas, setCategoriasExtraidas] = useState([]);
    const [observadasExtraidas, setObservadasExtraidas] = useState([]);
    const [esperadasEditables, setEsperadasEditables] = useState([]);
    const [nTotal, setNTotal] = useState(0);

    // Signos
    const [valRef, setValRef] = useState(50);
    const [tipoPrueba, setTipoPrueba] = useState('bilateral');
    const [isTipoPruebaOpen, setIsTipoPruebaOpen] = useState(false);
    const tipoPruebaRef = useRef(null);

    // Rachas
    const [corteRachas, setCorteRachas] = useState('mediana');
    const [cortePersonalizado, setCortePersonalizado] = useState(0);

    useEffect(() => {
        const handler = (e) => {
            if (alphaRef.current && !alphaRef.current.contains(e.target)) setIsAlphaOpen(false);
            if (tipoChiRef.current && !tipoChiRef.current.contains(e.target)) setIsTipoChiOpen(false);
            if (tipoPruebaRef.current && !tipoPruebaRef.current.contains(e.target)) setIsTipoPruebaOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const alphaOptions = [
        { value: 0.10, label: '0.10 (90%) - Significación' },
        { value: 0.05, label: '0.05 (95%) - Significación' },
        { value: 0.01, label: '0.01 (99%) - Significación' }
    ];

    const chiOptions = [
        { value: 'bondad', label: 'Bondad de Ajuste' },
        { value: 'independencia', label: 'Prueba de Independencia' }
    ];

    const mostrarAlerta = (mensaje, titulo = 'Atención', tipo = 'warning') => {
        setModalAlerta({ isOpen: true, mensaje, titulo, tipo });
    };

    // Auto-seleccionar subTipoChi según si es matriz bidimensional o variable simple
    useEffect(() => {
        if (varSeleccionada?.nombresColumnas?.length === 2) {
            setSubTipoChi('independencia');
        } else if (!varSeleccionada?.nombresColumnas || varSeleccionada?.nombresColumnas?.length === 1) {
            setSubTipoChi('bondad');
        }
        setColumnaSeleccionada(0);
    }, [varSeleccionada]);

    useEffect(() => {
        setResultadosMatriz(null);
    }, [varSeleccionada, prueba, subTipoChi, columnaSeleccionada, filas]);

    useEffect(() => {
        if (prueba === 'chi_cuadrada' && subTipoChi === 'bondad' && varSeleccionada && filas?.length > 0) {
            const isMatrix = typeof varSeleccionada === 'object' && varSeleccionada?.nombresColumnas?.length > 1;
            const datos = filas.map(f => {
                if (isMatrix) {
                    const partes = (f.valor !== null && f.valor !== undefined ? f.valor.toString() : '').split(' | ');
                    return partes[columnaSeleccionada] !== undefined ? partes[columnaSeleccionada].trim() : '';
                }
                return f.valor;
            });
            const conteos = {};
            datos.forEach(d => {
                const val = d !== null && d !== undefined ? d.toString().trim() : 'N/A';
                if (val !== '') conteos[val] = (conteos[val] || 0) + 1;
            });
            const categorias = Object.keys(conteos);
            const observadas = Object.values(conteos);

            const total = observadas.reduce((a, b) => a + b, 0);
            setNTotal(total);
            setCategoriasExtraidas(categorias);
            setObservadasExtraidas(observadas);

            if (categorias.length > 0) {
                const espUnica = total / categorias.length;
                setEsperadasEditables(Array(categorias.length).fill(espUnica.toFixed(2)));
            }
        }
    }, [varSeleccionada, filas, prueba, subTipoChi, columnaSeleccionada]);

    const handleCalcular = () => {
        if (!varSeleccionada || !filas || filas.length === 0) {
            mostrarAlerta('Por favor, selecciona o agrega una variable con datos válidos.', 'Faltan Datos', 'warning');
            return;
        }

        const datos = filas.map(f => f.valor);
        let res = null;

        if (prueba === 'chi_cuadrada') {
            if (subTipoChi === 'bondad') {
                if (categoriasExtraidas.length < 2) {
                    mostrarAlerta('Chi-cuadrada requiere al menos 2 categorías diferentes en los datos.', 'Error', 'error');
                    return;
                }
                const esperadasParsed = esperadasEditables.map(v => parseFloat(v));
                if (esperadasParsed.some(isNaN)) {
                    mostrarAlerta('Todas las frecuencias esperadas deben ser números válidos.', 'Error', 'error');
                    return;
                }
                const sumEsp = esperadasParsed.reduce((a, b) => a + b, 0);
                if (Math.abs(sumEsp - nTotal) > 0.1) {
                    mostrarAlerta(`La suma de las frecuencias esperadas (${sumEsp.toFixed(2)}) debe ser igual a n = ${nTotal}.`, 'Error', 'error');
                    return;
                }
                res = { tipo: 'chi_cuadrada', subtipo: 'bondad', categorias: categoriasExtraidas, observadas: observadasExtraidas, esperadas: esperadasParsed, ...pruebaChiCuadradaBondad(observadasExtraidas, esperadasParsed, alpha) };
            } else if (subTipoChi === 'independencia') {
                if (typeof varSeleccionada !== 'object' || !varSeleccionada.nombresColumnas || varSeleccionada.nombresColumnas.length !== 2) {
                    mostrarAlerta('La Prueba de Independencia requiere cruzar 2 variables. Selecciona una matriz que contenga exactamente 2 columnas.', 'Error', 'error');
                    return;
                }

                const varObj = variables?.find(v => v.nombre === varSeleccionada.nombre);
                if (!varObj) {
                    mostrarAlerta('No se pudo encontrar la matriz seleccionada.', 'Error', 'error');
                    return;
                }

                const datosRaw = varObj.datos.slice(1);
                const datos1 = [];
                const datos2 = [];
                
                datosRaw.forEach(d => {
                    const str = d !== null && d !== undefined ? d.toString() : '';
                    if (str.includes(' | ')) {
                        const partes = str.split(' | ').map(p => p.trim());
                        datos1.push(partes[0]);
                        datos2.push(partes[1]);
                    } else {
                        datos1.push(str.trim());
                        datos2.push('N/A');
                    }
                });

                const categoriasFila = [];
                const categoriasCol = [];
                const conteosMatrix = {};

                for (let i = 0; i < datos1.length; i++) {
                    const valFila = datos1[i] !== null && datos1[i] !== undefined ? datos1[i].toString().trim() : 'N/A';
                    const valCol = datos2[i] !== null && datos2[i] !== undefined ? datos2[i].toString().trim() : 'N/A';

                    if (valFila !== '' && valCol !== '') {
                        if (!categoriasFila.includes(valFila)) categoriasFila.push(valFila);
                        if (!categoriasCol.includes(valCol)) categoriasCol.push(valCol);

                        if (!conteosMatrix[valFila]) conteosMatrix[valFila] = {};
                        conteosMatrix[valFila][valCol] = (conteosMatrix[valFila][valCol] || 0) + 1;
                    }
                }

                if (categoriasFila.length < 2 || categoriasCol.length < 2) {
                    mostrarAlerta('Cada variable debe tener al menos 2 categorías diferentes para la Prueba de Independencia.', 'Error', 'error');
                    return;
                }

                const matrizNum = [];
                for (let i = 0; i < categoriasFila.length; i++) {
                    const row = [];
                    for (let j = 0; j < categoriasCol.length; j++) {
                        row.push(conteosMatrix[categoriasFila[i]]?.[categoriasCol[j]] || 0);
                    }
                    matrizNum.push(row);
                }

                res = { 
                    tipo: 'chi_cuadrada', 
                    subtipo: 'independencia', 
                    matriz: matrizNum, 
                    nombresFilas: categoriasFila, 
                    nombresCols: categoriasCol, 
                    labelV1: varObj.nombresColumnas[0], 
                    labelV2: varObj.nombresColumnas[1], 
                    ...pruebaChiCuadradaIndependencia(matrizNum, alpha) 
                };
            }
        } else if (prueba === 'signos') {
            const isDosColumnas = typeof varSeleccionada === 'object' && varSeleccionada?.nombresColumnas?.length === 2;
            let datosDiferencia = [];

            if (isDosColumnas) {
                datos.forEach(d => {
                    const str = d !== null && d !== undefined ? d.toString() : '';
                    if (str.includes(' | ')) {
                        const partes = str.split(' | ').map(p => p.trim());
                        const col1 = parseFloat(partes[0]);
                        const col2 = parseFloat(partes[1]);
                        if (!isNaN(col1) && !isNaN(col2)) {
                            datosDiferencia.push(col2 - col1); // Resta: Columna 2 - Columna 1
                        }
                    }
                });
            } else {
                const isMatrix = typeof varSeleccionada === 'object' && varSeleccionada?.nombresColumnas?.length > 1;
                datosDiferencia = datos.map(d => {
                    if (isMatrix) {
                        const str = d !== null && d !== undefined ? d.toString() : '';
                        const partes = str.split(' | ');
                        return parseFloat(partes[columnaSeleccionada]);
                    }
                    return parseFloat(d);
                }).filter(n => !isNaN(n));
            }

            if (datosDiferencia.length === 0) {
                mostrarAlerta('La variable seleccionada no contiene datos numéricos válidos para la Prueba de Signos.', 'Error', 'error');
                return;
            }
            
            const referenciaReal = isDosColumnas ? 0 : valRef;
            res = { tipo: 'signos', ...pruebaSignos(datosDiferencia, referenciaReal, alpha, tipoPrueba) };

        } else if (prueba === 'rachas') {
            const isMatrix = typeof varSeleccionada === 'object' && varSeleccionada?.nombresColumnas?.length > 1;
            const tipoVarStr = (varSeleccionada?.tipo || varSeleccionada?.tipoVariable || varSeleccionada?.type || '').toLowerCase();
            const isCuantitativa = typeof varSeleccionada === 'object' && tipoVarStr.includes('cuantitativa');
            
            const rawDatos = (isMatrix 
                ? datos.map(d => {
                    const str = d !== null && d !== undefined ? d.toString() : '';
                    const partes = str.split(' | ');
                    return partes[columnaSeleccionada] !== undefined ? partes[columnaSeleccionada].trim() : '';
                })
                : datos.map(d => d !== null && d !== undefined ? d.toString().trim() : '')
            ).filter(d => d !== '');

            if (rawDatos.length < 2) {
                mostrarAlerta('La secuencia debe tener al menos 2 elementos.', 'Error', 'error');
                return;
            }

            let secuenciaDicotomica = [];
            let nIgnorados = 0;
            let tipo1Str = '';
            let tipo2Str = '';
            let valorCorteFinal = null;

            if (isCuantitativa) {
                const nums = rawDatos.map(d => parseFloat(d)).filter(n => !isNaN(n));
                if (nums.length < 2) {
                    mostrarAlerta('No hay suficientes datos numéricos para procesar la prueba.', 'Error', 'error');
                    return;
                }
                
                const uniqueNums = [...new Set(nums)].sort((a, b) => a - b);
                
                if (uniqueNums.length === 2) {
                    mostrarAlerta(`Se detectaron únicamente 2 tipos de valores en toda la matriz (${uniqueNums[0]} y ${uniqueNums[1]}). El sistema asumió que es una secuencia binaria y la procesó automáticamente sin necesidad de usar un Punto de Corte.`, 'Procesamiento Automático', 'info');
                    
                    tipo1Str = `${uniqueNums[0]} (-)`;
                    tipo2Str = `${uniqueNums[1]} (+)`;
                    valorCorteFinal = 'Separación automática (2 valores)';
                    
                    for (let d of nums) {
                        if (d === uniqueNums[1]) secuenciaDicotomica.push('+');
                        else if (d === uniqueNums[0]) secuenciaDicotomica.push('-');
                    }
                } else {
                    let puntoDeCorte = 0;
                    if (corteRachas === 'mediana') {
                        const sorted = [...nums].sort((a, b) => a - b);
                        const half = Math.floor(sorted.length / 2);
                        if (sorted.length % 2 === 0) puntoDeCorte = (sorted[half - 1] + sorted[half]) / 2.0;
                        else puntoDeCorte = sorted[half];
                        valorCorteFinal = `Mediana = ${puntoDeCorte.toFixed(4)}`;
                    } else if (corteRachas === 'media') {
                        puntoDeCorte = nums.reduce((a, b) => a + b, 0) / nums.length;
                        valorCorteFinal = `Media = ${puntoDeCorte.toFixed(4)}`;
                    } else {
                        puntoDeCorte = parseFloat(cortePersonalizado);
                        if (isNaN(puntoDeCorte)) {
                            mostrarAlerta('Ingresa un valor de corte personalizado válido.', 'Error', 'error');
                            return;
                        }
                        valorCorteFinal = `Corte personalizado = ${puntoDeCorte}`;
                    }

                    tipo1Str = `> ${puntoDeCorte}`;
                    tipo2Str = `< ${puntoDeCorte}`;

                    for (let d of nums) {
                        if (d > puntoDeCorte) secuenciaDicotomica.push('+');
                        else if (d < puntoDeCorte) secuenciaDicotomica.push('-');
                        else nIgnorados++;
                    }
                }

            } else {
                const categoriasUnicas = [...new Set(rawDatos)];
                if (categoriasUnicas.length !== 2) {
                    mostrarAlerta(`Para datos cualitativos, la variable debe tener exactamente 2 categorías únicas. Se encontraron ${categoriasUnicas.length}.`, 'Error', 'error');
                    return;
                }
                tipo1Str = categoriasUnicas[0];
                tipo2Str = categoriasUnicas[1];
                valorCorteFinal = `Categorías: ${tipo1Str} y ${tipo2Str}`;

                for (let d of rawDatos) {
                    if (d === tipo1Str) secuenciaDicotomica.push('+');
                    else if (d === tipo2Str) secuenciaDicotomica.push('-');
                }
            }

            if (secuenciaDicotomica.length < 2) {
                mostrarAlerta('La secuencia resultante (después de descartar empates) tiene menos de 2 elementos.', 'Error', 'error');
                return;
            }

            let n1 = 0;
            let n2 = 0;
            let R = 0;
            let currentStr = '';

            for (let i = 0; i < secuenciaDicotomica.length; i++) {
                const s = secuenciaDicotomica[i];
                if (s === '+') n1++;
                else if (s === '-') n2++;
                
                if (s !== currentStr) {
                    R++;
                    currentStr = s;
                }
            }

            res = { 
                tipo: 'rachas', 
                nOriginal: rawDatos.length,
                nEfectivo: secuenciaDicotomica.length,
                nIgnorados,
                valorCorteFinal,
                secuenciaDicotomica: secuenciaDicotomica.join(' '),
                ...pruebaRachas(n1, n2, R, alpha, tipoPrueba) 
            };
        }

        if (res?.error) {
            mostrarAlerta(res.error, 'Error de Cálculo', 'error');
            setResultadosMatriz(null);
        } else {
            setResultadosMatriz(res);
        }
    };

    const alphaSelector = (
        <div ref={alphaRef} style={{ position: 'relative', width: '100%', maxWidth: '235px' }}>
            <div
                onClick={() => setIsAlphaOpen(!isAlphaOpen)}
                style={{
                    padding: '8px 12px', background: 'var(--bg-card)',
                    border: `1px solid ${isAlphaOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    borderRadius: RADIUS || '4px', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: FS.sm, color: 'var(--text-color, var(--text-main))',
                    boxShadow: isAlphaOpen ? '0 0 0 3px rgba(0,123,255,0.15)' : 'none',
                    transition: 'all 0.2s ease', userSelect: 'none'
                }}
            >
                <span style={{ fontWeight: 500 }}>{alphaOptions.find(o => o.value === alpha)?.label}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isAlphaOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease', color: 'var(--text-muted)', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
            {isAlphaOpen && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    borderRadius: RADIUS || '4px', zIndex: 1000, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden'
                }}>
                    {alphaOptions.map(opt => (
                        <div 
                            key={opt.value}
                            onClick={() => { setAlpha(opt.value); setIsAlphaOpen(false); }}
                            style={{ 
                                padding: '8px 12px', cursor: 'pointer', fontSize: FS.sm,
                                background: alpha === opt.value ? 'var(--primary-light, #eff6ff)' : 'transparent',
                                color: alpha === opt.value ? 'var(--primary-color)' : 'var(--text-main)',
                                borderBottom: '1px solid var(--border-light, #f1f5f9)'
                            }}
                            onMouseEnter={(e) => { if (alpha !== opt.value) e.target.style.background = 'var(--bg-hover, #f8fafc)'; }}
                            onMouseLeave={(e) => { if (alpha !== opt.value) e.target.style.background = 'transparent'; }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    let hasMoreThanTwoNumericValues = false;
    const isMatrixUI = typeof varSeleccionada === 'object' && varSeleccionada?.nombresColumnas?.length > 1;
    const tipoVarStrUI = (varSeleccionada?.tipo || varSeleccionada?.tipoVariable || varSeleccionada?.type || '').toLowerCase();
    const isCuantitativaUI = typeof varSeleccionada === 'object' && tipoVarStrUI.includes('cuantitativa');
    if (isCuantitativaUI && filas?.length > 0) {
        const nums = filas.map(f => {
            if (isMatrixUI) {
                const str = f.valor !== null && f.valor !== undefined ? f.valor.toString() : '';
                const partes = str.split(' | ');
                return parseFloat(partes[columnaSeleccionada]);
            }
            return parseFloat(f.valor);
        }).filter(n => !isNaN(n));
        const unique = new Set(nums);
        hasMoreThanTwoNumericValues = unique.size > 2;
    }

    return (
        <div style={{ padding: '0px', fontFamily: FONT }}>
            <div style={{ marginBottom: '10px' }}>
                <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', padding: '10px' }}>
                    <div>
                        <span style={{ ...labelStyle, margin: 0, color: 'var(--text-main, #1e293b)' }}>Datos:</span>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                            <small title="Datos provenientes de variables externas" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                Cargados: <strong style={{ color: 'var(--text-main, #1e293b)' }}>{statsDatos?.cargados || 0}</strong>
                            </small>
                            <small title="Datos ingresados manualmente" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                Agregados: <strong style={{ color: 'var(--text-main, #1e293b)' }}>{statsDatos?.agregados || 0}</strong>
                            </small>
                            <small title="Total de datos válidos" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                Total: <strong style={{ color: 'var(--text-main, #1e293b)' }}>{statsDatos?.total || 0}</strong>
                            </small>
                        </div>
                    </div>
                    <button
                        onClick={abrirEditor}
                        className="btn-mat251-primario"
                        style={{ padding: '5px 14px', fontSize: FS.sm, backgroundColor: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <EditarDatos />
                        Editar Datos
                    </button>
                </div>
            </div>

            {!varSeleccionada ? (
                <div style={{ padding: '5px', color: 'var(--text-muted)', fontSize: '0.7rem'}}>
                    Importa una matriz o agrega datos en el panel superior para comenzar.
                </div>
            ) : (
                <div style={{ ...cardStyle, marginBottom: '0px' }}>
                    {isMatrixUI && (
                        (prueba === 'chi_cuadrada' && subTipoChi === 'bondad') ||
                        prueba === 'rachas' ||
                        (prueba === 'signos' && varSeleccionada?.nombresColumnas?.length !== 2)
                    ) && (
                        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', fontSize: FS.sm }}>Columna a evaluar:</label>
                            <select
                                className="input-mat251"
                                value={columnaSeleccionada}
                                onChange={e => setColumnaSeleccionada(Number(e.target.value))}
                                style={{ padding: '6px 12px', borderRadius: RADIUS, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: FS.sm, cursor: 'pointer' }}
                            >
                                {varSeleccionada.nombresColumnas.map((colName, idx) => (
                                    <option key={idx} value={idx}>{colName || `Columna ${idx + 1}`}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '10px', alignItems: 'start' }}>
                        
                        {prueba === 'chi_cuadrada' && subTipoChi === 'bondad' && (
                            <div style={{ gridColumn: '1 / -1', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {categoriasExtraidas.length > 0 && (
                                    <div>
                                        <h5 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '0.9rem' }}>Frecuencias Esperadas</h5>
                                        <div style={{ borderRadius: '6px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                <thead style={{ background: 'var(--bg-input)' }}>
                                                    <tr>
                                                        <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', borderRight: '1px solid var(--border-color)', color: 'var(--text-main)' }}>Categoría</th>
                                                        <th style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '2px solid var(--border-color)', borderRight: '1px solid var(--border-color)', color: 'var(--text-main)' }}>Observada ({renderKatex('O_i')})</th>
                                                        <th style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '2px solid var(--border-color)', color: 'var(--text-main)' }}>Esperada ({renderKatex('E_i')})</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {categoriasExtraidas.map((cat, i) => (
                                                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                                                            <td style={{ padding: '8px 10px', borderRight: '1px solid var(--border-color)' }}>{cat}</td>
                                                            <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid var(--border-color)' }}>{observadasExtraidas[i]}</td>
                                                            <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                                                                <input
                                                                    type="number"
                                                                    className="input-mat251"
                                                                    value={esperadasEditables[i]}
                                                                    onChange={(e) => {
                                                                        const newEsp = [...esperadasEditables];
                                                                        newEsp[i] = e.target.value;
                                                                        setEsperadasEditables(newEsp);
                                                                    }}
                                                                    style={{ width: '80px', padding: '4px', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-input)' }}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p style={{ margin: '8px 0 0 0', fontSize: '0.7rem', color: 'var(--text-muted)' }}>La suma de frecuencias esperadas debe ser igual a {nTotal}. Por defecto se asigna una distribución uniforme.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {prueba === 'rachas' && (
                            <div style={{ gridColumn: '1 / -1', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <h5 style={{ margin: '0 0 10px 0', color: 'var(--text-pure)', fontSize: '0.8rem' }}>Configuración de la Prueba de Rachas:</h5>
                                {isCuantitativaUI && hasMoreThanTwoNumericValues && (
                                    <div style={{ padding: '0', background: 'transparent', border: 'none', marginTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.85rem', textAlign: 'center' }}>Punto de Corte:</label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                                            {[{ id: 'mediana', label: 'Mediana' }, { id: 'media', label: 'Media Aritmética' }, { id: 'personalizado', label: 'Personalizado' }].map(opt => {
                                                const isSelected = corteRachas === opt.id;
                                                return (
                                                    <div
                                                        key={opt.id}
                                                        onClick={() => setCorteRachas(opt.id)}
                                                        style={{
                                                            padding: '6px 14px', textAlign: 'center', cursor: 'pointer',
                                                            border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                                            borderRadius: '6px',
                                                            background: isSelected ? 'var(--accent-color)' : 'var(--bg-card)',
                                                            color: isSelected ? '#ffffff' : 'var(--text-main)',
                                                            boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.15)' : 'none',
                                                            transition: 'all 0.2s ease',
                                                            fontSize: '0.8rem', fontWeight: isSelected ? 'bold' : 'normal',
                                                            userSelect: 'none'
                                                        }}
                                                    >
                                                        {opt.label}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div style={{
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease-in-out',
                                            maxHeight: corteRachas === 'personalizado' ? '60px' : '0px',
                                            opacity: corteRachas === 'personalizado' ? 1 : 0,
                                            pointerEvents: corteRachas === 'personalizado' ? 'auto' : 'none',
                                            width: '100%', display: 'flex', justifyContent: 'center'
                                        }}>
                                            <input 
                                                type="number" 
                                                className="input-mat251 placeholder-small" 
                                                value={cortePersonalizado} 
                                                onChange={(e) => setCortePersonalizado(e.target.value)} 
                                                placeholder="Ingresa valor..." 
                                                style={{ width: '130px', marginTop: '12px', padding: '6px 10px', fontSize: '0.85rem', textAlign: 'center', border: '1px solid var(--accent-color)', borderRadius: '6px', outline: 'none' }} 
                                            />
                                        </div>
                                        <p style={{ margin: '12px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>* Los valores iguales al punto de corte se ignorarán (empates).</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', width: '45px', textAlign: 'right' }}>{renderKatex('\\alpha:')}</label>
                            <div style={{ flex: 1 }}>
                                {alphaSelector}
                            </div>
                        </div>

                        {prueba === 'chi_cuadrada' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Tipo:</label>
                                <div ref={tipoChiRef} style={{ position: 'relative', flex: 1 }}>
                                    <div
                                        onClick={() => setIsTipoChiOpen(!isTipoChiOpen)}
                                        style={{
                                            padding: '8px 12px', background: 'var(--bg-card)',
                                            border: `1px solid ${isTipoChiOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                            borderRadius: RADIUS || '4px', cursor: 'pointer',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            fontSize: FS.sm, color: 'var(--text-color, var(--text-main))',
                                            boxShadow: isTipoChiOpen ? '0 0 0 3px rgba(0,123,255,0.15)' : 'none',
                                            transition: 'all 0.2s ease', userSelect: 'none'
                                        }}
                                    >
                                        <span style={{ fontWeight: 500 }}>{chiOptions.find(o => o.value === subTipoChi)?.label}</span>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                            style={{ transform: isTipoChiOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease', color: 'var(--text-muted)', flexShrink: 0 }}>
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                    {isTipoChiOpen && (
                                        <div style={{
                                            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                                            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                                            borderRadius: RADIUS || '4px', zIndex: 1000, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden'
                                        }}>
                                            {chiOptions.map(opt => (
                                                <div 
                                                    key={opt.value}
                                                    onClick={() => { setSubTipoChi(opt.value); setIsTipoChiOpen(false); }}
                                                    style={{ 
                                                        padding: '8px 12px', cursor: 'pointer', fontSize: FS.sm,
                                                        background: subTipoChi === opt.value ? 'var(--primary-light, #eff6ff)' : 'transparent',
                                                        color: subTipoChi === opt.value ? 'var(--primary-color)' : 'var(--text-main)',
                                                        borderBottom: '1px solid var(--border-light, #f1f5f9)'
                                                    }}
                                                    onMouseEnter={(e) => { if (subTipoChi !== opt.value) e.target.style.background = 'var(--bg-hover, #f8fafc)'; }}
                                                    onMouseLeave={(e) => { if (subTipoChi !== opt.value) e.target.style.background = 'transparent'; }}
                                                >
                                                    {opt.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {(prueba === 'signos' || prueba === 'rachas') && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', width: '45px', textAlign: 'right' }}>{renderKatex('H_1:')}</label>
                                <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                                    {['bilateral', 'derecha', 'izquierda'].map(tipo => {
                                        const isSelected = tipoPrueba === tipo;
                                        const mathStr = tipo === 'bilateral' ? `\\neq` : tipo === 'derecha' ? `>` : `<`;
                                        return (
                                            <div
                                                key={tipo}
                                                onClick={() => setTipoPrueba(tipo)}
                                                style={{
                                                    flex: 1, padding: '2px 0', textAlign: 'center', cursor: 'pointer',
                                                    border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color, #cbd5e1)'}`,
                                                    borderRadius: RADIUS || '4px',
                                                    background: isSelected ? 'var(--accent-color)' : 'var(--bg-input, #fff)',
                                                    color: isSelected ? '#fff' : 'var(--text-main)',
                                                    boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                                                    transition: 'all 0.2s',
                                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                                    fontSize: FS.xs,
                                                }}
                                            >
                                                {renderKatex(mathStr)}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {prueba === 'signos' && varSeleccionada?.nombresColumnas?.length !== 2 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', width: '45px', textAlign: 'right' }}>{renderKatex('v_{ref}:')}</label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                value={valRef}
                                onChange={e => setValRef(parseFloat(e.target.value))}
                                placeholder="Valor Referencia"
                                style={{ flex: 1 }}
                            />
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                        <button className="button_calcular" style={{ width: 'auto', padding: '5px 15px' }} onClick={handleCalcular} disabled={!varSeleccionada}>
                            Calcular Prueba
                        </button>
                    </div>
                </div>
            )}
            
            <ModalAlerta isOpen={modalAlerta.isOpen} mensaje={modalAlerta.mensaje} titulo={modalAlerta.titulo} tipo={modalAlerta.tipo} onClose={() => setModalAlerta({ ...modalAlerta, isOpen: false })} />
        </div>
    );
}
