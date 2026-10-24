import React, { useState, useEffect, useRef } from 'react';
import { cardStyle, FONT, RADIUS, FS, labelStyle } from '../../../Principal/Constantes';
import { EditarDatos } from '../../../../../ui/iconos';
import { pruebaChiCuadradaBondad, pruebaChiCuadradaIndependencia, pruebaSignos, pruebaRachas } from '../../../Matematicas/Logica_Tema6';
import ModalAlerta from '../../../ui/ModalAlerta';
import StatLabel from '../../../ui/StatLabel';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const renderKatex = (math) => <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />;

function crearMatrizContingencia(datos) {
    const categoriasFila = [];
    const categoriasCol = [];
    const conteos = new Map();

    (datos || []).forEach(dato => {
        const partes = (dato ?? '').toString().split('|').map(parte => parte.trim());
        const [valorFila, valorCol] = partes;
        if (!valorFila || !valorCol) return;

        if (!categoriasFila.includes(valorFila)) categoriasFila.push(valorFila);
        if (!categoriasCol.includes(valorCol)) categoriasCol.push(valorCol);
        const clave = `${valorFila}\u0000${valorCol}`;
        conteos.set(clave, (conteos.get(clave) || 0) + 1);
    });

    return {
        categoriasFila,
        categoriasCol,
        matriz: categoriasFila.map(valorFila => categoriasCol.map(valorCol => conteos.get(`${valorFila}\u0000${valorCol}`) || 0))
    };
}

function SelectorColumna({ columnas, value, onChange, label }) {
    const [abierto, setAbierto] = useState(false);
    const selectorRef = useRef(null);
    const opciones = columnas.map((columna, indice) => typeof columna === 'string'
        ? { label: columna || `Columna ${indice + 1}`, value: indice }
        : columna);
    const opcionSeleccionada = opciones.find(opcion => opcion.value === value);

    useEffect(() => {
        const cerrarAlHacerClickFuera = (event) => {
            if (selectorRef.current && !selectorRef.current.contains(event.target)) setAbierto(false);
        };
        document.addEventListener('mousedown', cerrarAlHacerClickFuera);
        return () => document.removeEventListener('mousedown', cerrarAlHacerClickFuera);
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '180px', flex: '1 1 180px' }}>
            <span style={{ color: 'var(--text-pure)', fontSize: FS.xs, fontWeight: 600 }}>{label}</span>
            <div ref={selectorRef} style={{ position: 'relative' }}>
                <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={abierto}
                    onClick={() => setAbierto(open => !open)}
                    style={{ width: '100%', minHeight: '38px', padding: '8px 12px', borderRadius: RADIUS, border: `1px solid ${abierto ? 'var(--primary-color)' : 'var(--border-color)'}`, background: 'var(--bg-input)', color: 'var(--text-pure)', fontSize: FS.sm, fontFamily: FONT, boxSizing: 'border-box', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: abierto ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none' }}
                >
                    <span>{opcionSeleccionada?.label || `Columna ${value + 1}`}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ transform: abierto ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}><polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                </button>
                {abierto && (
                    <div role="listbox" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, maxHeight: '260px', overflowY: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: RADIUS, boxShadow: '0 8px 24px rgba(0,0,0,0.25)', zIndex: 1000 }}>
                        {opciones.map(opcion => (
                            <button key={opcion.value} type="button" role="option" aria-selected={value === opcion.value} onClick={() => { onChange(opcion.value); setAbierto(false); }} style={{ width: '100%', padding: '9px 12px', border: 'none', background: value === opcion.value ? 'rgba(37, 99, 235, 0.08)' : 'transparent', color: value === opcion.value ? 'var(--primary-color)' : 'var(--text-pure)', textAlign: 'left', fontSize: FS.sm, fontFamily: FONT, fontWeight: value === opcion.value ? 600 : 400, cursor: 'pointer' }}>
                                {opcion.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function CampoFrecuenciaEsperada({ value, onChange, indice }) {
    const [editando, setEditando] = useState(false);
    const valorMath = value === '' ? '\\,\\,\\,' : String(value).replace('.', '{,}');

    if (editando) {
        return (
            <input
                type="number"
                autoFocus
                aria-label={`Frecuencia esperada para la categoría ${indice + 1}`}
                className="input-mat251"
                value={value}
                onChange={onChange}
                onBlur={() => setEditando(false)}
                onKeyDown={event => { if (event.key === 'Enter') setEditando(false); }}
                style={{ width: '100px', minHeight: '28px', padding: '2px', textAlign: 'center', border: 'none', borderRadius: '0px', outline: 'none', boxShadow: 'none', background: 'transparent', color: 'var(--text-pure)', fontFamily: FONT }}
            />
        );
    }

    return (
        <button
            type="button"
            aria-label={`Editar frecuencia esperada ${value} para la categoría ${indice + 1}`}
            onClick={() => setEditando(true)}
            className="btn-frecuencia-esperada-mat251"
            style={{ width: '100px', minHeight: '28px', padding: '2px', textAlign: 'center', border: 'none', borderRadius: '0px', outline: 'none', boxShadow: 'none', background: 'transparent', color: 'var(--text-pure)', fontFamily: FONT, cursor: 'text', userSelect: 'none' }}
        >
            {renderKatex(valorMath)}
        </button>
    );
}

export default function Controles_HNP_Matriz({ varSeleccionada, filas, statsDatos, abrirEditor, prueba, setResultadosMatriz, variables }) {
    const [alpha, setAlpha] = useState(0.05);
    const [isAlphaOpen, setIsAlphaOpen] = useState(false);
    const alphaRef = useRef(null);

    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Atención', tipo: 'warning' });

    // Chi Cuadrada
    const [subTipoChi, setSubTipoChi] = useState('bondad');
    const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);
    const [errorFormatoBondad, setErrorFormatoBondad] = useState(false);
    const [isColumnaOpen, setIsColumnaOpen] = useState(false);
    const columnaRef = useRef(null);
    const [isTipoChiOpen, setIsTipoChiOpen] = useState(false);
    const tipoChiRef = useRef(null);

    // Edición de Esperadas
    const [categoriasExtraidas, setCategoriasExtraidas] = useState([]);
    const [observadasExtraidas, setObservadasExtraidas] = useState([]);
    const [esperadasEditables, setEsperadasEditables] = useState([]);
    const [nTotal, setNTotal] = useState(0);

    // Signos
    const [valRef, setValRef] = useState(null);
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
            if (columnaRef.current && !columnaRef.current.contains(e.target)) setIsColumnaOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const alphaOptions = [
        { value: 0.10, label: '0.10 (90%) - Significación' },
        { value: 0.05, label: '0.05 (95%) - Significación' },
        { value: 0.01, label: '0.01 (99%) - Significación' }
    ];

    const matrizPreview = prueba === 'chi_cuadrada' && subTipoChi === 'independencia'
        ? crearMatrizContingencia(filas?.map(fila => fila?.valor))
        : null;

    const chiOptions = [
        { value: 'bondad', label: 'Bondad de Ajuste' },
        { value: 'independencia', label: 'Prueba de Independencia' }
    ];

    const mostrarAlerta = (mensaje, titulo = 'Atención', tipo = 'warning') => {
        setModalAlerta({ isOpen: true, mensaje, titulo, tipo });
    };

    // Al cambiar de variable, conservar el tipo de prueba y reiniciar solo la columna auxiliar.
    useEffect(() => {
        setColumnaSeleccionada(0);
    }, [varSeleccionada]);

    useEffect(() => {
        setResultadosMatriz(null);
    }, [varSeleccionada, prueba, subTipoChi, columnaSeleccionada, filas, alpha, esperadasEditables, valRef, tipoPrueba, corteRachas, cortePersonalizado]);

    useEffect(() => {
        if (prueba === 'chi_cuadrada' && subTipoChi === 'bondad' && varSeleccionada && filas?.length > 0) {
            const columnas = varSeleccionada?.nombresColumnas || [];
            const isMatrix = columnas.length > 1;
            const conteos = new Map();
            let hayFrecuenciaInvalida = false;

            filas.forEach(fila => {
                const valor = fila?.valor !== null && fila?.valor !== undefined ? fila.valor.toString() : '';
                const partes = isMatrix ? valor.split(' | ').map(parte => parte.trim()) : [valor.trim()];

                if (isMatrix && columnas.length === 2) {
                    const categoria = partes[0] || '';
                    const frecuenciaRaw = partes[1] || '';
                    if (!categoria && !frecuenciaRaw) return;
                    const frecuencia = Number(frecuenciaRaw);
                    if (!categoria || !frecuenciaRaw || !Number.isInteger(frecuencia) || frecuencia < 0) {
                        hayFrecuenciaInvalida = true;
                        return;
                    }
                    conteos.set(categoria, (conteos.get(categoria) || 0) + frecuencia);
                    return;
                }

                if (isMatrix && columnas.length > 2) {
                    hayFrecuenciaInvalida = true;
                    return;
                }
                const categoria = isMatrix ? (partes[columnaSeleccionada] || '') : partes[0];
                if (categoria) conteos.set(categoria, (conteos.get(categoria) || 0) + 1);
            });

            const categorias = Array.from(conteos.keys());
            const observadas = Array.from(conteos.values());

            const total = observadas.reduce((a, b) => a + b, 0);
            setNTotal(total);
            setCategoriasExtraidas(categorias);
            setObservadasExtraidas(observadas);
            setErrorFormatoBondad(hayFrecuenciaInvalida);

            if (categorias.length > 0) {
                const espUnica = total / categorias.length;
                setEsperadasEditables(Array(categorias.length).fill(espUnica.toFixed(2)));
            } else {
                setEsperadasEditables([]);
            }
        } else if (prueba === 'chi_cuadrada' && subTipoChi === 'bondad') {
            setCategoriasExtraidas([]);
            setObservadasExtraidas([]);
            setEsperadasEditables([]);
            setNTotal(0);
            setErrorFormatoBondad(false);
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
                const cantidadColumnas = varSeleccionada?.nombresColumnas?.length || 1;
                if (cantidadColumnas > 2) {
                    mostrarAlerta('Bondad de Ajuste admite una columna de observaciones o dos columnas: categoría y frecuencia entera.', 'Formato de datos inválido', 'warning');
                    return;
                }
                if (errorFormatoBondad) {
                    mostrarAlerta('Usa dos columnas: categoría y frecuencia observada (entero desde 0).', 'Formato de datos inválido', 'warning');
                    return;
                }
                if (nTotal <= 0) {
                    mostrarAlerta('La suma de las frecuencias observadas debe ser mayor que 0.', 'Datos inválidos', 'warning');
                    return;
                }
                if (categoriasExtraidas.length < 2) {
                    mostrarAlerta('Chi-cuadrada requiere al menos 2 categorías diferentes en los datos.', 'Error', 'error');
                    return;
                }
                const esperadasParsed = esperadasEditables.map(v => parseFloat(v));
                if (esperadasParsed.some(v => !Number.isFinite(v) || v <= 0)) {
                    mostrarAlerta('Cada frecuencia esperada debe ser un número mayor que 0.', 'Error', 'error');
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

                // varObj.datos ya contiene solo los registros seleccionados; no incluye encabezados.
                // No quitar la primera fila: es una observación válida del conjunto.
                const datosRaw = varObj.datos || [];
                const { categoriasFila, categoriasCol, matriz: matrizNum } = crearMatrizContingencia(datosRaw);

                if (categoriasFila.length < 2 || categoriasCol.length < 2) {
                    mostrarAlerta('Cada variable debe tener al menos 2 categorías diferentes para la Prueba de Independencia.', 'Error', 'error');
                    return;
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
            if (!isDosColumnas && !Number.isFinite(valRef)) {
                mostrarAlerta('Ingresa el valor de referencia para realizar la Prueba de Signos.', 'Dato requerido', 'warning');
                return;
            }
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
            setResultadosMatriz(null);
            const isMatrix = typeof varSeleccionada === 'object' && varSeleccionada?.nombresColumnas?.length > 1;
            
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

            const nums = rawDatos.map(d => Number(d));
            const valoresNumericosValidos = nums.every(Number.isFinite);
            const valoresNoNumericos = rawDatos.map(d => Number.isNaN(Number(d)));
            const esSecuenciaCualitativa = valoresNoNumericos.every(Boolean);

            if (valoresNumericosValidos) {
                if (nums.length < 2) {
                    mostrarAlerta('La secuencia numérica necesita al menos 2 valores válidos.', 'Formato de datos inválido', 'warning');
                    return;
                }
                
                const uniqueNums = [...new Set(nums)].sort((a, b) => a - b);
                if (uniqueNums.length < 2) {
                    mostrarAlerta('Los datos numéricos deben formar dos grupos. Todos los valores son iguales y no se pueden contar rachas.', 'Formato de datos inválido', 'warning');
                    return;
                }
                
                if (uniqueNums.length === 2) {
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

            } else if (esSecuenciaCualitativa) {
                const categoriasUnicas = [...new Set(rawDatos)];
                if (categoriasUnicas.length !== 2) {
                    mostrarAlerta(`Para datos de caracteres o categorías, la secuencia debe tener exactamente 2 categorías distintas. Se encontraron ${categoriasUnicas.length}.`, 'Formato de datos inválido', 'warning');
                    return;
                }
                tipo1Str = categoriasUnicas[0];
                tipo2Str = categoriasUnicas[1];
                valorCorteFinal = `Categorías: ${tipo1Str} y ${tipo2Str}`;

                for (let d of rawDatos) {
                    if (d === tipo1Str) secuenciaDicotomica.push('+');
                    else if (d === tipo2Str) secuenciaDicotomica.push('-');
                }
            } else {
                mostrarAlerta('La secuencia mezcla números y caracteres. Usa una columna con solo valores numéricos o solo dos categorías de texto.', 'Formato de datos inválido', 'warning');
                return;
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
        <div ref={alphaRef} style={{ position: 'relative', width: '100%', minWidth: 0 }}>
            <div
                onClick={() => setIsAlphaOpen(!isAlphaOpen)}
                style={{
                    padding: '8px 12px', background: 'var(--bg-card)',
                    border: `1px solid ${isAlphaOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    borderRadius: RADIUS, cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: FS.sm, color: 'var(--text-pure)',
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
                    borderRadius: RADIUS, zIndex: 1000, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden'
                }}>
                    {alphaOptions.map(opt => (
                        <div 
                            key={opt.value}
                            onClick={() => { setAlpha(opt.value); setIsAlphaOpen(false); }}
                            style={{ 
                                padding: '8px 12px', cursor: 'pointer', fontSize: FS.sm,
                                background: alpha === opt.value ? 'var(--primary-light, #eff6ff)' : 'transparent',
                                color: alpha === opt.value ? 'var(--primary-color)' : 'var(--text-pure)',
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
    const valoresRachasUI = (filas || []).map(f => {
        const raw = f?.valor === null || f?.valor === undefined ? '' : f.valor.toString().trim();
        if (isMatrixUI) {
            const partes = raw.split(' | ');
            return (partes[columnaSeleccionada] || '').trim();
        }
        return raw;
    }).filter(Boolean);
    const numerosRachasUI = valoresRachasUI.map(Number);
    const isCuantitativaUI = valoresRachasUI.length > 0 && numerosRachasUI.every(Number.isFinite);
    const todosSonTextoRachasUI = valoresRachasUI.length > 0 && valoresRachasUI.every(valor => Number.isNaN(Number(valor)));
    const categoriasRachasUI = new Set(valoresRachasUI);
    let mensajeDatosRachasInvalido = '';
    if (prueba === 'rachas' && varSeleccionada) {
        if (valoresRachasUI.length < 2) {
            mensajeDatosRachasInvalido = 'La prueba de rachas requiere al menos 2 observaciones válidas en la columna seleccionada.';
        } else if (isCuantitativaUI && new Set(numerosRachasUI).size < 2) {
            mensajeDatosRachasInvalido = 'Los datos numéricos deben formar dos grupos; todos los valores seleccionados son iguales.';
        } else if (todosSonTextoRachasUI && categoriasRachasUI.size !== 2) {
            mensajeDatosRachasInvalido = `La secuencia de texto debe tener exactamente 2 categorías distintas; se encontraron ${categoriasRachasUI.size}.`;
        } else if (!isCuantitativaUI && !todosSonTextoRachasUI) {
            mensajeDatosRachasInvalido = 'La columna mezcla números y caracteres o contiene valores numéricos inválidos. Usa solo números o solo dos categorías de texto.';
        }
    }
    const rachasDatosValidos = !mensajeDatosRachasInvalido;
    if (isCuantitativaUI) {
        const nums = numerosRachasUI;
        const unique = new Set(nums);
        hasMoreThanTwoNumericValues = unique.size > 2;
    }
    const cantidadCategorias = categoriasExtraidas.length;
    const frecuenciaUniforme = cantidadCategorias > 0 ? (nTotal / cantidadCategorias).toFixed(2) : '0.00';
    const esperadasNumericas = esperadasEditables.map(valor => valor === '' ? NaN : Number(valor));
    const sumaEsperadasActual = esperadasNumericas.reduce((suma, valor) => suma + (Number.isFinite(valor) ? valor : 0), 0);
    const esperadasValidas = esperadasNumericas.length === cantidadCategorias && esperadasNumericas.every(valor => Number.isFinite(valor) && valor > 0) && Math.abs(sumaEsperadasActual - nTotal) <= 0.1;
    const signosDetalle = prueba === 'signos' && filas?.length
        ? filas.map((fila, indice) => {
            const raw = fila?.valor === null || fila?.valor === undefined ? '' : fila.valor.toString();
            const dosColumnas = varSeleccionada?.nombresColumnas?.length === 2;
            let dato1 = NaN;
            let dato2 = null;
            let diferencia = NaN;

            if (dosColumnas) {
                const partes = raw.split(' | ').map(parte => parte.trim());
                dato1 = parseFloat(partes[0]);
                dato2 = parseFloat(partes[1]);
                if (Number.isFinite(dato1) && Number.isFinite(dato2)) diferencia = dato2 - dato1;
            } else {
                const esMatriz = (varSeleccionada?.nombresColumnas?.length || 0) > 1;
                const partes = esMatriz ? raw.split(' | ') : [raw];
                dato1 = parseFloat(partes[columnaSeleccionada]);
                if (Number.isFinite(dato1) && Number.isFinite(valRef)) diferencia = dato1 - valRef;
            }

            return {
                indice: indice + 1,
                dato1,
                dato2,
                diferencia,
                signo: Number.isFinite(diferencia) ? (diferencia > 0 ? '+' : diferencia < 0 ? '−' : '0') : null
            };
        })
        : [];
    const formatoNumeroSignos = valor => Number.isFinite(valor) ? valor.toLocaleString('es-ES', { maximumFractionDigits: 4 }) : '—';
    const numeroRachasKatex = valor => Number.isFinite(Number(valor))
        ? renderKatex(Number(valor).toLocaleString('en-US', { maximumFractionDigits: 4, useGrouping: false }))
        : '—';
    let rachasDetalle = [];
    let resumenRachas = { n1: 0, n2: 0, totalRachas: 0 };
    if (prueba === 'rachas' && rachasDatosValidos) {
        const valoresNumericos = isCuantitativaUI;
        const numerosUnicos = valoresNumericos ? [...new Set(numerosRachasUI)].sort((a, b) => a - b) : [];
        let puntoCorte = null;
        if (valoresNumericos && numerosUnicos.length > 2) {
            if (corteRachas === 'mediana') {
                const ordenados = [...numerosRachasUI].sort((a, b) => a - b);
                const mitad = Math.floor(ordenados.length / 2);
                puntoCorte = ordenados.length % 2 === 0
                    ? (ordenados[mitad - 1] + ordenados[mitad]) / 2
                    : ordenados[mitad];
            } else if (corteRachas === 'media') {
                puntoCorte = numerosRachasUI.reduce((suma, valor) => suma + valor, 0) / numerosRachasUI.length;
            } else {
                puntoCorte = parseFloat(cortePersonalizado);
            }
        }

        const secuenciaGrupos = valoresRachasUI.map(valor => {
            if (!valoresNumericos) return valor === [...categoriasRachasUI][0] ? '+' : '-';
            const numero = Number(valor);
            if (numerosUnicos.length === 2) return numero === numerosUnicos[1] ? '+' : '-';
            if (!Number.isFinite(puntoCorte)) return null;
            return numero > puntoCorte ? '+' : numero < puntoCorte ? '-' : '0';
        });
        let rachaActual = 0;
        let grupoAnterior = null;
        rachasDetalle = valoresRachasUI.map((valor, indice) => {
            const grupo = secuenciaGrupos[indice];
            if (grupo === '+' || grupo === '-') {
                if (grupo === '+') resumenRachas.n1 += 1;
                else resumenRachas.n2 += 1;
                if (grupo !== grupoAnterior) {
                    rachaActual += 1;
                    grupoAnterior = grupo;
                }
            }
            const grupoDescripcion = grupo === '0'
                ? `Empate (= ${formatoNumeroSignos(puntoCorte)})`
                : grupo === null
                    ? '—'
                    : valoresNumericos && numerosUnicos.length === 2
                        ? `${grupo === '+' ? '+' : '−'} (${formatoNumeroSignos(grupo === '+' ? numerosUnicos[1] : numerosUnicos[0])})`
                        : valoresNumericos
                            ? `${grupo === '+' ? '+' : '−'} (${grupo === '+' ? '>' : '<'} ${formatoNumeroSignos(puntoCorte)})`
                            : `${grupo === '+' ? '+' : '−'} (${valor})`;
            return {
                indice: indice + 1,
                valor,
                grupo,
                grupoDescripcion,
                racha: grupo === '+' || grupo === '-' ? rachaActual : null,
                puntoCorte,
                valorGrupo: valoresNumericos && numerosUnicos.length === 2
                    ? (grupo === '+' ? numerosUnicos[1] : grupo === '-' ? numerosUnicos[0] : null)
                    : null
            };
        });
        resumenRachas.totalRachas = rachaActual;
    }

    return (
        <div style={{ padding: '0px', fontFamily: FONT }}>
            <div style={{ marginBottom: 0 }}>
                <div className="tema6-hnp-data-summary" style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', padding: '10px' }}>
                    <div>
                        <span style={{ ...labelStyle, margin: 0, fontSize: FS.sm, fontWeight: 'bold', color: 'var(--text-pure)' }}>Datos:</span>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                            <small title="Datos provenientes de variables externas" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                Cargados: <strong style={{ color: 'var(--text-pure)' }}>{statsDatos?.cargados || 0}</strong>
                            </small>
                            <small title="Datos ingresados manualmente" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                Agregados: <strong style={{ color: 'var(--text-pure)' }}>{statsDatos?.agregados || 0}</strong>
                            </small>
                            <small title="Total de datos válidos" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                                Total: <strong style={{ color: 'var(--text-pure)' }}>{statsDatos?.total || 0}</strong>
                            </small>
                        </div>
                    </div>
                    <button
                        onClick={abrirEditor}
                        className="btn-primary"
                        style={{ padding: '5px 14px', fontSize: FS.sm, fontFamily: FONT, fontWeight: 600, borderRadius: RADIUS, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
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
                <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', marginBottom: '0px', border: 'none', padding: '0px', backgroundColor: 'transparent', borderRadius: RADIUS }}>
                    {isMatrixUI && (
                        (prueba === 'rachas' ||
                        (prueba === 'signos' && varSeleccionada?.nombresColumnas?.length !== 2))
                    ) && (
                        <div style={{ width: '100%', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <label className="hnp-columna-evaluar-label" style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', fontSize: FS.sm }}>Columna a evaluar:</label>
                            <div ref={columnaRef} style={{ position: 'relative', width: '270px', maxWidth: '100%', minWidth: '180px' }}>
                                <button
                                    type="button"
                                    className="btn-selector-columna-mat251"
                                    aria-haspopup="listbox"
                                    aria-expanded={isColumnaOpen}
                                    onClick={() => setIsColumnaOpen(open => !open)}
                                    style={{ width: '100%', minHeight: '38px', padding: '8px 12px', borderRadius: RADIUS, border: `1px solid ${isColumnaOpen ? 'var(--primary-color)' : 'var(--border-color)'}`, background: 'var(--bg-input)', color: 'var(--text-pure)', fontSize: FS.sm, fontFamily: FONT, boxSizing: 'border-box', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: isColumnaOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none' }}
                                >
                                    <span>{varSeleccionada.nombresColumnas[columnaSeleccionada] || `Columna ${columnaSeleccionada + 1}`}</span>
                                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ transform: isColumnaOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}><polyline points="6 9 12 15 18 9" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
                                </button>
                                {isColumnaOpen && (
                                    <div role="listbox" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, maxHeight: '260px', overflowY: 'auto', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: RADIUS, boxShadow: '0 8px 24px rgba(0,0,0,0.25)', zIndex: 1000, animation: 'fadeInDropdown 0.2s ease' }}>
                                        {varSeleccionada.nombresColumnas.map((colName, idx) => (
                                            <button key={idx} type="button" className="btn-selector-columna-opcion-mat251" role="option" aria-selected={columnaSeleccionada === idx} onClick={() => { setColumnaSeleccionada(idx); setIsColumnaOpen(false); }} style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', padding: '9px 12px', border: 'none', background: columnaSeleccionada === idx ? 'rgba(37, 99, 235, 0.08)' : 'transparent', color: columnaSeleccionada === idx ? 'var(--primary-color)' : 'var(--text-pure)', textAlign: 'left', fontSize: FS.sm, fontFamily: FONT, fontWeight: columnaSeleccionada === idx ? 600 : 400, cursor: 'pointer' }}>
                                                {colName || `Columna ${idx + 1}`}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div style={{ order: 2, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '10px', alignItems: 'start' }}>
                        
                        {prueba === 'chi_cuadrada' && subTipoChi === 'bondad' && (
                            <div style={{ gridColumn: '1 / -1', fontSize: '0.85rem', color: 'var(--text-pure)' }}>
                                {errorFormatoBondad && (
                                    <p style={{ margin: '0 0 8px', color: 'var(--text-pure)', fontSize: FS.xs }}>
                                        Verifica las categorías y las frecuencias observadas (enteros desde 0).
                                    </p>
                                )}
                                {categoriasExtraidas.length > 0 && (
                                    <div>
                                        <h5 style={{ margin: '0 0 8px', color: 'var(--text-pure)', fontSize: '0.9rem', textAlign: 'center' }}>Frecuencias Esperadas</h5>
                                        <div className="hnp-frecuencias-esperadas-scroll" style={{ width: '620px', maxWidth: '100%', height: categoriasExtraidas.length > 10 ? '350px' : 'auto', overflowY: categoriasExtraidas.length > 10 ? 'auto' : 'visible', overflowX: 'auto', margin: '0 auto', alignSelf: 'center', boxSizing: 'border-box' }}>
                                            <style>{`
                                                .hnp-frecuencias-esperadas-table { border-collapse: separate !important; border-spacing: 0 !important; border-top: 0 !important; border-left: 1px solid var(--text-pure) !important; border-right: 1px solid var(--text-pure) !important; border-bottom: 1px solid var(--text-pure) !important; }
                                                .hnp-frecuencias-esperadas-table th, .hnp-frecuencias-esperadas-table td { border-top: 0 !important; border-left: 0 !important; border-right: 1px solid var(--text-pure) !important; border-bottom: 1px solid var(--text-pure) !important; }
                                                .hnp-frecuencias-esperadas-table thead th { border-top: 1px solid var(--text-pure) !important; }
                                                .hnp-frecuencias-esperadas-table th:last-child, .hnp-frecuencias-esperadas-table td:last-child { border-right: 0 !important; }
                                                .hnp-frecuencias-esperadas-table tbody tr:last-child td { border-bottom: 0 !important; }
                                            `}</style>
                                            <table className="hnp-frecuencias-esperadas-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0, fontFamily: FONT, fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-pure)', background: 'var(--bg-card)' }}>
                                                <colgroup>
                                                    <col style={{ width: '25%' }} />
                                                    <col style={{ width: '25%' }} />
                                                    <col style={{ width: '25%' }} />
                                                    <col style={{ width: '25%' }} />
                                                </colgroup>
                                                <thead style={{ background: 'var(--bg-input)', color: 'var(--text-pure)' }}>
                                                    <tr>
                                                        <th style={{ position: categoriasExtraidas.length > 10 ? 'sticky' : 'static', top: 0, zIndex: 2, padding: '7px', textAlign: 'center', background: 'var(--bg-input)', color: 'var(--text-pure)' }}>Categoría</th>
                                                        <th style={{ position: categoriasExtraidas.length > 10 ? 'sticky' : 'static', top: 0, zIndex: 2, padding: '7px', textAlign: 'center', whiteSpace: 'nowrap', background: 'var(--bg-input)', color: 'var(--text-pure)' }}>
                                                            <StatLabel formulaKey="frecuencia_observada" formulaLatex="O_i" labelText={renderKatex('O_i')} align="center" position="top" />
                                                        </th>
                                                        <th style={{ position: categoriasExtraidas.length > 10 ? 'sticky' : 'static', top: 0, zIndex: 2, padding: '7px', textAlign: 'center', whiteSpace: 'nowrap', background: 'var(--bg-input)', color: 'var(--text-pure)' }}>
                                                            <StatLabel
                                                                formulaKey="frecuencia_esperada"
                                                                formulaLatex="E_i"
                                                                labelText={renderKatex('E_i')}
                                                                align="center"
                                                                position="top"
                                                                className="hnp-tooltip-compact"
                                                                customTexto="n: total de observaciones; k: cantidad de categorías."
                                                                customMath={`E_i = \\frac{n}{k} = \\frac{${nTotal}}{${cantidadCategorias}} = ${frecuenciaUniforme}`}
                                                            />
                                                        </th>
                                                        <th style={{ position: categoriasExtraidas.length > 10 ? 'sticky' : 'static', top: 0, zIndex: 2, padding: '7px', textAlign: 'center', whiteSpace: 'nowrap', background: 'var(--bg-input)', color: 'var(--text-pure)' }}>
                                                            <StatLabel formulaKey="frecuencia_esperada" formulaLatex="E_i" labelText="Cálculo" align="center" position="top" className="hnp-tooltip-compact" customTexto="Resolución del valor esperado uniforme: n es el total y k la cantidad de categorías." customMath={`E_i = \\frac{n}{k} = \\frac{${nTotal}}{${cantidadCategorias}} = ${frecuenciaUniforme}`} />
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {categoriasExtraidas.map((cat, i) => (
                                                        <tr key={i}>
                                                            <td style={{ padding: '7px', textAlign: 'center', color: 'var(--text-pure)' }}>{cat}</td>
                                                            <td style={{ padding: '7px', textAlign: 'center', fontWeight: 'bold', color: 'var(--text-pure)' }}>{renderKatex(String(observadasExtraidas[i]))}</td>
                                                            <td style={{ padding: '7px', textAlign: 'center', color: 'var(--text-pure)' }}>
                                                                <CampoFrecuenciaEsperada
                                                                    indice={i}
                                                                    value={esperadasEditables[i]}
                                                                    onChange={(e) => {
                                                                        const nuevasEsperadas = [...esperadasEditables];
                                                                        nuevasEsperadas[i] = e.target.value;
                                                                        setEsperadasEditables(nuevasEsperadas);
                                                                    }}
                                                                />
                                                            </td>
                                                            <td style={{ padding: '7px', textAlign: 'center', whiteSpace: 'nowrap', color: esperadasValidas && Number.isFinite(esperadasNumericas[i]) && Math.abs(esperadasNumericas[i] - (nTotal / cantidadCategorias)) <= 0.1 ? 'var(--text-pure)' : '#ef4444', fontWeight: esperadasValidas && Number.isFinite(esperadasNumericas[i]) && Math.abs(esperadasNumericas[i] - (nTotal / cantidadCategorias)) <= 0.1 ? 400 : 600 }}>
                                                                {renderKatex(`E_i = \\frac{n}{k} = \\frac{${nTotal}}{${cantidadCategorias}} = ${frecuenciaUniforme}`)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <p style={{ margin: '10px 0 0', fontSize: '0.8rem', color: esperadasValidas ? 'var(--text-pure)' : '#ef4444', fontWeight: 400, textAlign: 'center' }}>
                                            Suma actual: {renderKatex(`\\sum_{i=1}^{${cantidadCategorias}} E_i = ${sumaEsperadasActual.toFixed(2).replace('.', '{,}')}`)} · {renderKatex(`n = ${nTotal}`)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {prueba === 'rachas' && rachasDatosValidos && (
                            <div style={{ gridColumn: '1 / -1', fontSize: '0.85rem', color: 'var(--text-pure)' }}>
                                {isCuantitativaUI && hasMoreThanTwoNumericValues && (
                                    <div style={{ padding: '0', background: 'transparent', border: 'none', marginTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <label className="hnp-punto-corte-label" style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: 'var(--text-pure)', fontSize: '0.85rem', textAlign: 'center' }}>Punto de Corte:</label>
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
                                                            borderRadius: RADIUS,
                                                            background: isSelected ? 'var(--accent-color)' : 'var(--bg-card)',
                                                            color: isSelected ? '#ffffff' : 'var(--text-pure)',
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
                                                style={{ width: '130px', marginTop: '12px', padding: '6px 10px', fontSize: '0.85rem', textAlign: 'center', border: '1px solid var(--accent-color)', borderRadius: RADIUS, outline: 'none', fontFamily: FONT, color: 'var(--text-pure)' }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {(prueba !== 'rachas' || rachasDatosValidos) && <div className="hnp-parametros-superiores" style={{ order: -1, display: 'grid', gridTemplateColumns: prueba === 'signos' || prueba === 'rachas' ? 'minmax(0, 380px)' : 'repeat(2, minmax(0, 1fr))', justifyContent: prueba === 'signos' || prueba === 'rachas' ? 'center' : 'stretch', width: '100%', maxWidth: prueba === 'signos' || prueba === 'rachas' ? '380px' : 'none', margin: '0 auto 15px', boxSizing: 'border-box', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: prueba === 'signos' || prueba === 'rachas' ? 'center' : 'flex-start', gap: '10px', minWidth: 0, padding: 0 }}>
                            <label style={{ ...labelStyle, display: 'inline-flex', alignItems: 'center', margin: 0, padding: 0, color: 'var(--text-pure)', fontWeight: 'bold', width: 'fit-content', minWidth: 0, flex: '0 0 auto', textAlign: 'left' }}>{renderKatex('\\boldsymbol{\\alpha}:')}</label>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                {alphaSelector}
                            </div>
                        </div>

                        {prueba === 'chi_cuadrada' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', width: 'auto', whiteSpace: 'nowrap', textAlign: 'right' }}>Tipo:</label>
                                <div ref={tipoChiRef} style={{ position: 'relative', flex: 1, minWidth: 0 }}>
                                    <div
                                        onClick={() => setIsTipoChiOpen(!isTipoChiOpen)}
                                        style={{
                                            padding: '8px 12px', background: 'var(--bg-card)',
                                            border: `1px solid ${isTipoChiOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                            borderRadius: RADIUS, cursor: 'pointer',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            fontSize: FS.sm, color: 'var(--text-pure)',
                                            boxShadow: isTipoChiOpen ? '0 0 0 3px rgba(0,123,255,0.15)' : 'none',
                                            transition: 'all 0.2s ease', userSelect: 'none'
                                        }}
                                    >
                                        <span style={{ fontWeight: 500 }}>{chiOptions.find(o => o.value === subTipoChi)?.label}</span>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                            style={{ transform: isTipoChiOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease', color: 'var(--text-pure)', flexShrink: 0 }}>
                                            <polyline points="6 9 12 15 18 9" />
                                        </svg>
                                    </div>
                                    {isTipoChiOpen && (
                                        <div style={{
                                            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                                            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                                            borderRadius: RADIUS, zIndex: 1000, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', overflow: 'hidden'
                                        }}>
                                            {chiOptions.map(opt => (
                                                <div 
                                                    key={opt.value}
                                                    onClick={() => { setSubTipoChi(opt.value); setIsTipoChiOpen(false); }}
                                                    style={{ 
                                                        padding: '8px 12px', cursor: 'pointer', fontSize: FS.sm,
                                                        background: subTipoChi === opt.value ? 'var(--primary-light, #eff6ff)' : 'transparent',
                                                        color: subTipoChi === opt.value ? 'var(--primary-color)' : 'var(--text-pure)',
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', maxWidth: prueba === 'signos' || prueba === 'rachas' ? '300px' : 'none', justifySelf: prueba === 'signos' || prueba === 'rachas' ? 'center' : 'stretch' }}>
                                <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', fontWeight: 'bold', width: '45px', textAlign: 'right' }}>{renderKatex('\\boldsymbol{H_1}:')}</label>
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
                                                    borderRadius: RADIUS,
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
                    </div>}

                    {prueba === 'rachas' && !rachasDatosValidos && (
                        <div role="alert" style={{ order: -1, padding: '5px', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                            {mensajeDatosRachasInvalido}
                        </div>
                    )}

                    {prueba === 'signos' && varSeleccionada?.nombresColumnas?.length !== 2 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', width: '100%', maxWidth: '340px', marginLeft: 'auto', marginRight: 'auto' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', fontWeight: 'bold', width: '45px', textAlign: 'right' }}>
                                <StatLabel formulaKey="valor_referencia_signos" formulaLatex="\boldsymbol{v_{ref}}:" align="center" position="top" />
                            </label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                value={valRef ?? ''}
                                onChange={e => setValRef(e.target.value === '' ? null : parseFloat(e.target.value))}
                                placeholder="Valor Referencia"
                                style={{ flex: 1, maxWidth: '280px' }}
                            />
                        </div>
                    )}

                    {prueba === 'signos' && signosDetalle.length > 0 && (
                        <div style={{ order: 3, width: '100%', overflowX: 'auto', textAlign: 'center', margin: '0 0 10px' }}>
                            <h5 style={{ margin: '0 0 8px', color: 'var(--text-pure)', fontSize: '0.9rem' }}>Datos y resolución de la Prueba de Signos</h5>
                            <div className="hnp-signos-detalle-scroll" style={{ width: '620px', maxWidth: '100%', height: signosDetalle.length > 10 ? '350px' : 'auto', overflowY: signosDetalle.length > 10 ? 'auto' : 'visible', overflowX: 'auto', margin: '0 auto', alignSelf: 'center', boxSizing: 'border-box' }}>
                            <style>{`
                                .signos-detalle-table { border-collapse: separate !important; border-spacing: 0 !important; border-top: 0 !important; border-left: 1px solid var(--text-pure) !important; border-right: 1px solid var(--text-pure) !important; border-bottom: 1px solid var(--text-pure) !important; }
                                .signos-detalle-table th, .signos-detalle-table td { border-top: 0 !important; border-left: 0 !important; border-right: 1px solid var(--text-pure) !important; border-bottom: 1px solid var(--text-pure) !important; }
                                .signos-detalle-table thead th { border-top: 1px solid var(--text-pure) !important; }
                                .signos-detalle-table th:last-child, .signos-detalle-table td:last-child { border-right: 0 !important; }
                                .signos-detalle-table tbody tr:last-child td { border-bottom: 0 !important; }
                            `}</style>
                            <table className="signos-detalle-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0, borderRadius: '0px', fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-pure)', background: 'var(--bg-card)' }}>
                                <colgroup>
                                    <col style={{ width: '44px' }} />
                                    <col />
                                    <col />
                                    <col />
                                    <col />
                                </colgroup>
                                <thead style={{ background: 'var(--bg-input)' }}>
                                    <tr style={{ background: 'var(--bg-input)' }}>
                                        <th style={{ position: signosDetalle.length > 10 ? 'sticky' : 'static', top: 0, zIndex: 2, padding: '7px', border: '1px solid var(--text-pure)', background: 'var(--bg-input)', color: 'var(--text-pure)', whiteSpace: 'nowrap', textAlign: 'center' }}>N.º</th>
                                        {varSeleccionada?.nombresColumnas?.length === 2 ? (
                                            <>
                                                <th style={{ position: signosDetalle.length > 10 ? 'sticky' : 'static', top: 0, zIndex: 2, padding: '7px', border: '1px solid var(--text-pure)', background: 'var(--bg-input)', color: 'var(--text-pure)' }}>{varSeleccionada.nombresColumnas[0]}</th>
                                                <th style={{ position: signosDetalle.length > 10 ? 'sticky' : 'static', top: 0, zIndex: 2, padding: '7px', border: '1px solid var(--text-pure)', background: 'var(--bg-input)', color: 'var(--text-pure)' }}>{varSeleccionada.nombresColumnas[1]}</th>
                                                <th style={{ position: signosDetalle.length > 10 ? 'sticky' : 'static', top: 0, zIndex: 2, padding: '7px', border: '1px solid var(--text-pure)', background: 'var(--bg-input)', color: 'var(--text-pure)' }}>{renderKatex('D_i = X_{2i} - X_{1i}')}</th>
                                            </>
                                        ) : (
                                            <>
                                                <th style={{ position: signosDetalle.length > 10 ? 'sticky' : 'static', top: 0, zIndex: 2, padding: '7px', border: '1px solid var(--text-pure)', background: 'var(--bg-input)', color: 'var(--text-pure)' }}>{renderKatex('X_i')}</th>
                                                <th style={{ position: signosDetalle.length > 10 ? 'sticky' : 'static', top: 0, zIndex: 2, padding: '7px', border: '1px solid var(--text-pure)', background: 'var(--bg-input)', color: 'var(--text-pure)' }}>{renderKatex('v_{ref}')}</th>
                                                <th style={{ position: signosDetalle.length > 10 ? 'sticky' : 'static', top: 0, zIndex: 2, padding: '7px', border: '1px solid var(--text-pure)', background: 'var(--bg-input)', color: 'var(--text-pure)' }}>{renderKatex('D_i = X_i - v_{ref}')}</th>
                                            </>
                                        )}
                                        <th style={{ position: signosDetalle.length > 10 ? 'sticky' : 'static', top: 0, zIndex: 2, padding: '7px', border: '1px solid var(--text-pure)', background: 'var(--bg-input)', color: 'var(--text-pure)' }}>Signo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {signosDetalle.map(detalle => (
                                        <tr key={detalle.indice}>
                                            <td style={{ padding: '7px', border: '1px solid var(--text-pure)', whiteSpace: 'nowrap', textAlign: 'center' }}>{detalle.indice}</td>
                                            <td style={{ padding: '7px', border: '1px solid var(--text-pure)' }}>{formatoNumeroSignos(detalle.dato1)}</td>
                                            {varSeleccionada?.nombresColumnas?.length === 2
                                                ? <td style={{ padding: '7px', border: '1px solid var(--text-pure)' }}>{formatoNumeroSignos(detalle.dato2)}</td>
                                                : <td style={{ padding: '7px', border: '1px solid var(--text-pure)' }}>{formatoNumeroSignos(valRef)}</td>}
                                            <td style={{ padding: '7px', border: '1px solid var(--text-pure)' }}>{formatoNumeroSignos(detalle.diferencia)}</td>
                                            <td style={{ padding: '7px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold' }}>
                                                {detalle.signo || 'Dato inválido'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    )}

                    {prueba === 'chi_cuadrada' && subTipoChi === 'independencia' && varSeleccionada?.nombresColumnas?.length === 2 && matrizPreview?.categoriasFila.length > 0 && matrizPreview?.categoriasCol.length > 0 && (
                        <div style={{ order: 3, width: '100%', overflowX: 'visible', textAlign: 'center', marginTop: '-5px' }}>
                            <h5 style={{ margin: '0 0 10px', color: 'var(--text-pure)', fontSize: '0.9rem' }}>Matriz de Contingencia</h5>
                            <div style={{ margin: '-5px 0 8px', color: 'var(--text-main)', fontSize: '0.75rem', fontWeight: 400 }}>
                                {renderKatex(`r = ${matrizPreview.categoriasFila.length}`)} categorías de filas · {renderKatex(`c = ${matrizPreview.categoriasCol.length}`)} categorías de columnas
                            </div>
                            <div className="hnp-matriz-contingencia-scroll" style={{ width: '100%', overflowX: 'auto' }}>
                            <table className="hnp-matriz-contingencia-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', borderRadius: '0px', fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-pure)', background: 'var(--bg-card)', border: '1px solid var(--text-pure)' }}>
                                <thead>
                                    <tr style={{ background: 'var(--bg-input)' }}>
                                        <th style={{ padding: '6px 4px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', background: 'var(--bg-input)', whiteSpace: 'nowrap', fontSize: '0.72rem' }}>
                                            {varSeleccionada.nombresColumnas[0]} \ {varSeleccionada.nombresColumnas[1]}
                                        </th>
                                        {matrizPreview.categoriasCol.map((categoria, indice) => (
                                            <th key={indice} style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', background: 'var(--bg-input)' }}>{categoria}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {matrizPreview.categoriasFila.map((categoria, i) => (
                                        <tr key={categoria}>
                                            <th style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', background: 'var(--bg-input)' }}>{categoria}</th>
                                            {matrizPreview.matriz[i].map((frecuencia, j) => (
                                                <td key={j} style={{ padding: '8px', border: '1px solid var(--text-pure)', color: 'var(--text-pure)' }}>{frecuencia}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                        </div>
                    )}

                    {prueba === 'rachas' && rachasDetalle.length > 0 && (
                        <div style={{ order: 3, width: '100%', overflow: 'visible', textAlign: 'center', margin: '10px 0 10px' }}>
                            <h5 style={{ margin: '0 0 8px', color: 'var(--text-pure)', fontSize: '0.9rem' }}>Datos y resolución de la Prueba de Rachas</h5>
                            <div style={{ width: '620px', maxWidth: '100%', height: rachasDetalle.length > 10 ? '350px' : 'auto', overflowY: rachasDetalle.length > 10 ? 'auto' : 'visible', overflowX: 'visible', margin: '0 auto', boxSizing: 'border-box' }}>
                                <style>{`
                                    .rachas-detalle-table { border-collapse: separate !important; border-spacing: 0 !important; border-top: 0 !important; border-left: 1px solid var(--text-pure) !important; border-right: 1px solid var(--text-pure) !important; border-bottom: 1px solid var(--text-pure) !important; }
                                    .rachas-detalle-table th, .rachas-detalle-table td { border-top: 0 !important; border-left: 0 !important; border-right: 1px solid var(--text-pure) !important; border-bottom: 1px solid var(--text-pure) !important; }
                                    .rachas-detalle-table thead th { border-top: 1px solid var(--text-pure) !important; }
                                    .rachas-detalle-table th:last-child, .rachas-detalle-table td:last-child { border-right: 0 !important; }
                                    .rachas-detalle-table tbody tr:last-child td { border-bottom: 0 !important; }
                                `}</style>
                                <table className="rachas-detalle-table" style={{ width: '100%', tableLayout: 'auto', borderCollapse: 'separate', borderSpacing: 0, borderRadius: '0px', fontSize: '0.8rem', textAlign: 'center', color: 'var(--text-pure)', background: 'var(--bg-card)' }}>
                                    <colgroup>
                                        <col style={{ width: '1%' }} />
                                        <col />
                                        <col />
                                        <col />
                                    </colgroup>
                                    <thead>
                                        <tr style={{ background: 'var(--bg-input)' }}>
                                            {['N.º', 'Dato', 'Grupo', 'Racha'].map(titulo => (
                                                <th key={titulo} style={{ position: rachasDetalle.length > 10 ? 'sticky' : 'static', top: 0, zIndex: 2, padding: '7px', border: '1px solid var(--text-pure)', background: 'var(--bg-input)', color: 'var(--text-pure)' }}>{titulo}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rachasDetalle.map(detalle => (
                                            <tr key={detalle.indice}>
                                                <td style={{ padding: '7px', border: '1px solid var(--text-pure)' }}>{numeroRachasKatex(detalle.indice)}</td>
                                                <td style={{ padding: '7px', border: '1px solid var(--text-pure)', overflowWrap: 'anywhere' }}>{isCuantitativaUI ? numeroRachasKatex(detalle.valor) : detalle.valor}</td>
                                                <td style={{ padding: '7px', border: '1px solid var(--text-pure)', overflowWrap: 'anywhere' }}>
                                                    {isCuantitativaUI ? (
                                                        detalle.grupo === '0' ? <>Empate (= {numeroRachasKatex(detalle.puntoCorte)})</>
                                                            : detalle.grupo === null ? '—'
                                                                : detalle.valorGrupo !== null
                                                                    ? <>{detalle.grupo === '+' ? '+' : '−'} ({numeroRachasKatex(detalle.valorGrupo)})</>
                                                                    : <>{detalle.grupo === '+' ? '+' : '−'} ({detalle.grupo === '+' ? '>' : '<'} {numeroRachasKatex(detalle.puntoCorte)})</>
                                                    ) : detalle.grupoDescripcion}
                                                </td>
                                                <td style={{ padding: '7px', border: '1px solid var(--text-pure)' }}>{detalle.racha === null ? '—' : numeroRachasKatex(detalle.racha)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {isCuantitativaUI && hasMoreThanTwoNumericValues && (
                                <p style={{ margin: '8px 0 0', color: 'var(--text-pure)', fontSize: '0.75rem' }}>
                                    Los valores iguales al punto de corte se ignorarán (empates).
                                </p>
                            )}
                            <p style={{ margin: '8px 0 0', color: 'var(--text-pure)', fontSize: '0.8rem' }}>
                                {renderKatex(`n_1 = ${resumenRachas.n1}`)} · {renderKatex(`n_2 = ${resumenRachas.n2}`)} · {renderKatex(`R = ${resumenRachas.totalRachas}`)}
                            </p>
                        </div>
                    )}

                    {!(prueba === 'chi_cuadrada' && subTipoChi === 'bondad' && errorFormatoBondad) && (prueba !== 'rachas' || rachasDatosValidos) && (
                        <div style={{ order: 4, display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                            <button className="button_calcular" style={{ width: 'auto', padding: '5px 15px', marginTop: '10px' }} onClick={handleCalcular} disabled={!varSeleccionada}>
                                Calcular Prueba
                            </button>
                        </div>
                    )}
                </div>
            )}
            
            <ModalAlerta isOpen={modalAlerta.isOpen} mensaje={modalAlerta.mensaje} titulo={modalAlerta.titulo} tipo={modalAlerta.tipo} onClose={() => setModalAlerta({ ...modalAlerta, isOpen: false })} />
        </div>
    );
}
