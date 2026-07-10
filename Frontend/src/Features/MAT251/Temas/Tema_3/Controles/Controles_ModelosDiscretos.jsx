import React, { useState, useEffect, useMemo } from 'react';
import '../../../styles/Temas/Tema3.css';
import { calcularDistribucionModelo, generarDatosGrafico } from '../../../Matematicas/logica_Tema3';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function Controles_ModelosDiscretos({
    varSeleccionada,
    filas,
    statsDatos,
    abrirEditor,
    onCalcular
}) {
    const [modelo, setModelo] = useState('Binomial');
    const [modo, setModo] = useState('matriz'); // 'manual' | 'matriz'

    const renderLatex = (str) => {
        return <span style={{ fontSize: '0.9em' }} dangerouslySetInnerHTML={{ __html: katex.renderToString(str, { throwOnError: false }) }} />;
    };

    // Parámetros Manuales
    const [paramN_bin, setParamN_bin] = useState('');
    const [paramP_bin, setParamP_bin] = useState('');
    const [paramLambda, setParamLambda] = useState('');
    const [paramN_hip, setParamN_hip] = useState('');
    const [paramK_hip, setParamK_hip] = useState('');
    const [paramn_hip, setParamn_hip] = useState('');

    // Condición
    const [tipoCondicion, setTipoCondicion] = useState('exacta'); // 'exacta', 'menor_igual', 'mayor_igual', 'intervalo'
    const [valorX, setValorX] = useState('');
    const [valorB, setValorB] = useState('');

    // Matriz
    const [columnaSeleccionada, setColumnaSeleccionada] = useState(0);
    const [valorExito, setValorExito] = useState('');
    const [statsEstimados, setStatsEstimados] = useState(null);

    const [error, setError] = useState('');

    // Extraer datos de la matriz
    const columnasDisponibles = useMemo(() => {
        return (varSeleccionada?.nombresColumnas && varSeleccionada.nombresColumnas.length > 0)
            ? varSeleccionada.nombresColumnas
            : (varSeleccionada ? [varSeleccionada.nombre || 'Datos'] : []);
    }, [varSeleccionada]);

    const datosColumna = useMemo(() => {
        if (!varSeleccionada || !filas || filas.length === 0) return [];
        const validas = filas.filter(f => (f.valor || '').toString().trim() !== '');

        return validas.map(f => {
            if (varSeleccionada.nombresColumnas && varSeleccionada.nombresColumnas.length > 1) {
                const partes = (f.valor || '').toString().split(' | ');
                return partes[columnaSeleccionada] ? partes[columnaSeleccionada].trim() : '';
            }
            return (f.valor || '').toString().trim();
        }).filter(val => val !== '');
    }, [varSeleccionada, filas, columnaSeleccionada]);

    const valoresUnicos = useMemo(() => {
        if (datosColumna.length === 0) return [];
        return [...new Set(datosColumna)].sort();
    }, [datosColumna]);

    // Estimar desde datos
    const estimarDesdeDatos = () => {
        if (datosColumna.length === 0) {
            setError('No hay datos válidos en la columna.');
            return;
        }

        const totalDatos = datosColumna.length;
        let p = 0;
        let K = 0;
        let media = 0;

        if (modelo === 'Binomial' || modelo === 'Hipergeometrica') {
            if (!valorExito) {
                setError('Debe seleccionar qué valor representa el "Éxito".');
                return;
            }
            const conteoExito = datosColumna.filter(v => v === valorExito).length;
            p = conteoExito / totalDatos;
            K = conteoExito;

            setStatsEstimados({
                total: totalDatos,
                exitos: conteoExito,
                p: p,
                K: K
            });

            if (modelo === 'Binomial') {
                setParamP_bin(p.toFixed(4));
                setParamN_bin(totalDatos.toString());
            } else {
                setParamN_hip(totalDatos.toString());
                setParamK_hip(K.toString());
            }
        } else if (modelo === 'Poisson') {
            const numeros = datosColumna.map(v => parseFloat(v)).filter(v => !isNaN(v));
            if (numeros.length === 0) {
                setError('Para Poisson se requieren datos numéricos.');
                return;
            }
            const sum = numeros.reduce((acc, curr) => acc + curr, 0);
            media = sum / numeros.length;

            setStatsEstimados({
                total: numeros.length,
                suma: sum,
                media: media
            });
            setParamLambda(media.toFixed(4));
        }
        setError('');
    };

    const manejarCalculo = () => {
        setError('');

        // Parsear parámetros
        let params = {};

        if (modelo === 'Binomial') {
            const n = parseInt(paramN_bin);
            const p = parseFloat(paramP_bin);
            if (isNaN(n) || n <= 0) return setError('En Binomial, "n" debe ser entero positivo.');
            if (isNaN(p) || p < 0 || p > 1) return setError('En Binomial, "p" debe estar entre 0 y 1.');
            params = { n, p };
        } else if (modelo === 'Poisson') {
            const lambda = parseFloat(paramLambda);
            if (isNaN(lambda) || lambda <= 0) return setError('En Poisson, lambda (λ) debe ser mayor a 0.');
            params = { lambda };
        } else if (modelo === 'Hipergeometrica') {
            const N = parseInt(paramN_hip);
            const K = parseInt(paramK_hip);
            const n = parseInt(paramn_hip);
            if (isNaN(N) || N <= 0) return setError('N (población) debe ser entero positivo.');
            if (isNaN(K) || K < 0 || K > N) return setError('K (éxitos) debe estar entre 0 y N.');
            if (isNaN(n) || n <= 0 || n > N) return setError('n (muestra) debe estar entre 1 y N.');
            params = { N, K, n };
        }

        // Parsear condición
        const x = parseInt(valorX);
        if (isNaN(x) || x < 0) return setError('El valor objetivo "x" debe ser un entero no negativo.');

        let b = 0;
        if (tipoCondicion === 'intervalo') {
            b = parseInt(valorB);
            if (isNaN(b) || b <= x) return setError('El límite superior del intervalo debe ser mayor que el límite inferior.');
        }

        // Validar límites de x según modelo
        if (modelo === 'Binomial' && x > params.n) return setError(`"x" no puede ser mayor que n (${params.n}).`);
        if (modelo === 'Hipergeometrica' && x > Math.min(params.K, params.n)) {
            return setError(`"x" no puede ser mayor que el mínimo entre K y n (${Math.min(params.K, params.n)}).`);
        }

        const condicion = { tipo: tipoCondicion, valorX: x, valorB: b };

        // Calcular
        const resultados = calcularDistribucionModelo(modelo, params, condicion);
        const datosGrafico = generarDatosGrafico(modelo, params);

        onCalcular({ modelo, params, condicion, resultados, datosGrafico });
    };

    const renderParametrosManuales = () => {
        const isMatriz = modo === 'matriz';
        const readOnlyParams = isMatriz;

        const disabledStyle = {
            backgroundColor: '#f1f5f9',
            color: '#475569',
            border: '1px dashed #94a3b8',
            cursor: 'not-allowed',
            fontWeight: 600
        };

        return (
            <div className="tema3-grid" style={{ marginBottom: '5px', gap: '10px' }}>
                {modelo === 'Binomial' && (
                    <>
                        <div className="tema3-form-group" style={{ marginBottom: '0' }}>
                            <label className="tema3-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Muestra total {renderLatex('n')}</label>
                            <input
                                type="number" className="tema3-input" min="1"
                                value={paramN_bin} onChange={e => setParamN_bin(e.target.value)}
                                placeholder="Ej. 10"
                                style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                            />
                        </div>
                        <div className="tema3-form-group" style={{ marginBottom: '0' }}>
                            <label className="tema3-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Probabilidad base {renderLatex('p')}</label>
                            <input
                                type="number" className="tema3-input" step="0.01" min="0" max="1"
                                value={paramP_bin} onChange={e => setParamP_bin(e.target.value)}
                                placeholder="Ej. 0.5"
                                disabled={readOnlyParams}
                                style={{ ...readOnlyParams ? disabledStyle : {}, padding: '6px 10px', fontSize: '0.85rem' }}
                            />
                        </div>
                    </>
                )}
                {modelo === 'Poisson' && (
                    <div className="tema3-form-group" style={{ marginBottom: '0' }}>
                        <label className="tema3-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Tasa Promedio {renderLatex('\\lambda')}</label>
                        <input
                            type="number" className="tema3-input" step="0.1" min="0.1"
                            value={paramLambda} onChange={e => setParamLambda(e.target.value)}
                            placeholder="Ej. 2.5"
                            disabled={readOnlyParams}
                            style={{ ...readOnlyParams ? disabledStyle : {}, padding: '6px 10px', fontSize: '0.85rem' }}
                        />
                    </div>
                )}
                {modelo === 'Hipergeometrica' && (
                    <>
                        <div className="tema3-form-group" style={{ marginBottom: '0' }}>
                            <label className="tema3-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Población Total {renderLatex('N')}</label>
                            <input
                                type="number" className="tema3-input" min="1"
                                value={paramN_hip} onChange={e => setParamN_hip(e.target.value)}
                                placeholder="Ej. 50"
                                disabled={readOnlyParams}
                                style={{ ...readOnlyParams ? disabledStyle : {}, padding: '6px 10px', fontSize: '0.85rem' }}
                            />
                        </div>
                        <div className="tema3-form-group" style={{ marginBottom: '0' }}>
                            <label className="tema3-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Éxitos en Población {renderLatex('K')}</label>
                            <input
                                type="number" className="tema3-input" min="0"
                                value={paramK_hip} onChange={e => setParamK_hip(e.target.value)}
                                placeholder="Ej. 10"
                                disabled={readOnlyParams}
                                style={{ ...readOnlyParams ? disabledStyle : {}, padding: '6px 10px', fontSize: '0.85rem' }}
                            />
                        </div>
                        <div className="tema3-form-group" style={{ marginBottom: '0' }}>
                            <label className="tema3-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Muestra {renderLatex('n')}</label>
                            <input
                                type="number" className="tema3-input" min="1"
                                value={paramn_hip} onChange={e => setParamn_hip(e.target.value)}
                                placeholder="Ej. 5"
                                style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                            />
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>

            {/* GRUPO DE SELECTORES (MODELO Y MODO) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginBottom: '15px', marginTop: '5px' }}>

                {/* SELECTOR DE MODELO */}
                <div style={{ display: 'flex', width: '100%', maxWidth: '600px', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                    {[
                        { id: 'Binomial', label: 'Binomial' },
                        { id: 'Poisson', label: 'Poisson' },
                        { id: 'Hipergeometrica', label: 'Hipergeométrica' }
                    ].map(tipo => (
                        <button
                            key={tipo.id}
                            type="button"
                            onClick={() => { setModelo(tipo.id); setError(''); setStatsEstimados(null); }}
                            style={{
                                flex: 1,
                                padding: '8px 16px',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                border: 'none',
                                cursor: 'pointer',
                                background: modelo === tipo.id ? 'var(--primary-color, #0d6efd)' : 'transparent',
                                color: modelo === tipo.id ? '#fff' : 'var(--text-muted, #64748b)',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tipo.label}
                        </button>
                    ))}
                </div>

                {/* SELECTOR DE MODO DE ENTRADA */}
                <div style={{ display: 'inline-flex', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)' }}>
                    <button
                        type="button"
                        onClick={() => { setModo('matriz'); setError(''); }}
                        style={{
                            padding: '6px 16px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            background: modo === 'matriz' ? 'var(--primary-color, #0d6efd)' : 'transparent',
                            color: modo === 'matriz' ? '#fff' : 'var(--text-muted, #64748b)',
                            transition: 'all 0.2s'
                        }}
                    >
                        Análisis de Matriz
                    </button>
                    <button
                        type="button"
                        onClick={() => { setModo('manual'); setError(''); }}
                        style={{
                            padding: '6px 16px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            background: modo === 'manual' ? 'var(--primary-color, #0d6efd)' : 'transparent',
                            color: modo === 'manual' ? '#fff' : 'var(--text-muted, #64748b)',
                            transition: 'all 0.2s'
                        }}
                    >
                        Modo Manual
                    </button>
                </div>
            </div>

            <div className="tema3-card">

                {error && (
                    <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #f87171', padding: '10px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '15px' }}>
                        <strong>Error: </strong> {error}
                    </div>
                )}

                {modo === 'matriz' && (
                    <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '12px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                            <div>
                                <div style={{ color: 'var(--primary-color, #0d6efd)', fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>Conjunto de Datos:</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                    Cargados: <strong style={{ color: 'var(--primary-color, #0d6efd)' }}>{statsDatos ? statsDatos.cargados : 0}</strong> &nbsp;
                                    Agregados: <strong style={{ color: 'var(--primary-color, #0d6efd)' }}>{statsDatos ? statsDatos.agregados : 0}</strong> &nbsp;
                                    Total: <strong style={{ color: '#334155' }}>{statsDatos ? statsDatos.total : 0}</strong>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={abrirEditor}
                                className="btn-icon"
                                style={{
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    padding: '6px 12px',
                                    background: 'var(--primary-color, #0d6efd)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontWeight: 600
                                }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                Editar Datos
                            </button>
                        </div>
                        {columnasDisponibles.length > 0 ? (
                            <>
                                <div className="tema3-form-group">
                                    <label className="tema3-label">Columna de Análisis:</label>
                                    <select
                                        className="tema3-select"
                                        value={columnaSeleccionada}
                                        onChange={e => { setColumnaSeleccionada(Number(e.target.value)); setStatsEstimados(null); }}
                                    >
                                        {columnasDisponibles.map((col, idx) => (
                                            <option key={idx} value={idx}>{col}</option>
                                        ))}
                                    </select>
                                </div>

                                {(modelo === 'Binomial' || modelo === 'Hipergeometrica') && (
                                    <div className="tema3-form-group">
                                        <label className="tema3-label">Valor que representa el "Éxito":</label>
                                        <select
                                            className="tema3-select"
                                            value={valorExito}
                                            onChange={e => setValorExito(e.target.value)}
                                        >
                                            <option value="">Seleccione un valor...</option>
                                            {valoresUnicos.map((val, idx) => (
                                                <option key={idx} value={val}>{val}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <button className="tema3-btn" onClick={estimarDesdeDatos} style={{ background: '#10b981', marginBottom: '10px' }}>
                                    Estimar Parámetros
                                </button>

                                {statsEstimados && (
                                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: '5px', color: '#475569', marginTop: '10px', backgroundColor: '#ffffff', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase' }}>Total Registros</span>
                                            <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{statsEstimados.total}</strong>
                                        </div>
                                        {modelo !== 'Poisson' ? (
                                            <>
                                                <div style={{ flex: 1, borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                                                    <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase' }}>Ocurrencias (Éxito)</span>
                                                    <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{statsEstimados.exitos}</strong>
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase' }}>Probabilidad {renderLatex('p')}</span>
                                                    <div style={{ fontSize: '0.9rem', color: '#0f172a', marginTop: '2px' }}>
                                                        {renderLatex(`\\frac{${statsEstimados.exitos}}{${statsEstimados.total}} = ${statsEstimados.p?.toFixed(4)}`)}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ flex: 1, borderLeft: '1px solid #e2e8f0' }}>
                                                <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase' }}>Media {renderLatex('\\lambda')}</span>
                                                <div style={{ fontSize: '0.9rem', color: '#0f172a', marginTop: '2px' }}>
                                                    {renderLatex(`\\frac{${statsEstimados.suma}}{${statsEstimados.total}} = ${statsEstimados.media?.toFixed(4)}`)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No hay datos cargados en el estado global. Ve a Gestión de Datos para importar.</p>
                        )}
                    </div>
                )}

                {renderParametrosManuales()}

                <div style={{ borderTop: '1px solid #e2e8f0', margin: '15px 0' }}></div>

                <h4 style={{ color: '#334155', fontSize: '0.85rem', margin: '0 0 10px 0' }}>Condición de Búsqueda</h4>

                <div className="tema3-grid" style={{ marginBottom: '15px', gap: '10px' }}>
                    <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <label className="tema3-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Operador lógico</label>
                        <CustomSelect
                            value={tipoCondicion}
                            onChange={val => setTipoCondicion(val)}
                            options={[
                                { value: 'exacta', label: <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap'}}>Exacta {renderLatex('P(X = x)')}</div> },
                                { value: 'menor_igual', label: <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap'}}>Acumulada Menor o Igual {renderLatex('P(X \\leq x)')}</div> },
                                { value: 'mayor_igual', label: <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap'}}>Acumulada Mayor o Igual {renderLatex('P(X \\geq x)')}</div> },
                                { value: 'intervalo', label: <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap'}}>Intervalo {renderLatex('P(a \\leq X \\leq b)')}</div> },
                            ]}
                        />
                    </div>

                    <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                        <label className="tema3-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>{tipoCondicion === 'intervalo' ? <>Límite Inferior {renderLatex('a')}</> : <>Número de éxitos esperados {renderLatex('x')}</>}</label>
                        <input
                            type="number" className="tema3-input" min="0"
                            value={valorX} onChange={e => setValorX(e.target.value)}
                            placeholder="Ej. 2"
                            style={{ padding: '0 10px', fontSize: '0.85rem', height: '36px', boxSizing: 'border-box' }}
                        />
                    </div>

                    {tipoCondicion === 'intervalo' && (
                        <div className="tema3-form-group" style={{ marginBottom: '0', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                            <label className="tema3-label" style={{ fontSize: '0.8rem', marginBottom: '4px' }}>Límite Superior {renderLatex('b')}</label>
                            <input
                                type="number" className="tema3-input" min="0"
                                value={valorB} onChange={e => setValorB(e.target.value)}
                                placeholder="Ej. 5"
                                style={{ padding: '0 10px', fontSize: '0.85rem', height: '36px', boxSizing: 'border-box' }}
                            />
                        </div>
                    )}
                </div>

                <button className="tema3-btn" onClick={manejarCalculo} style={{ padding: '8px 16px', fontSize: '0.9rem', width: 'auto', alignSelf: 'center', margin: '0 auto', display: 'block' }}>
                    Calcular Distribución
                </button>
            </div>
        </div>
    );
}

function CustomSelect({ value, onChange, options }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const selectRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.value === value) || options[0];

    return (
        <div ref={selectRef} style={{ position: 'relative', width: '100%', fontFamily: 'var(--font-family, inherit)' }}>
            <div 
                onClick={() => setIsOpen(o => !o)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 10px',
                    height: '36px',
                    boxSizing: 'border-box',
                    background: 'white',
                    border: `1px solid ${isOpen ? '#3b82f6' : '#cbd5e1'}`,
                    borderRadius: '8px', cursor: 'pointer',
                    boxShadow: isOpen ? '0 0 0 3px rgba(59,130,246,0.15)' : 'none',
                    transition: 'all 0.2s ease',
                    color: '#1e293b',
                    userSelect: 'none',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <div style={{ fontWeight: 400, fontSize: '0.8rem' }}>{selectedOption.label}</div>
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease', color: '#64748b', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
            {isOpen && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                    background: 'white',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    overflow: 'hidden',
                    animation: 'fadeInDropdown 0.2s ease',
                    maxHeight: '440px',
                    overflowY: 'auto',
                }}>
                    {options.map((op, idx) => {
                        const active = value === op.value;
                        return (
                            <div 
                                key={op.value}
                                onClick={() => { onChange(op.value); setIsOpen(false); }}
                                onMouseEnter={e => {
                                    if (!active) {
                                        e.currentTarget.style.background = 'rgba(59,130,246,0.08)';
                                        e.currentTarget.style.color = '#3b82f6';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!active) {
                                        e.currentTarget.style.background = 'transparent';
                                        e.currentTarget.style.color = '#1e293b';
                                    }
                                }}
                                style={{
                                    padding: '8px 12px',
                                    fontSize: '0.85rem',
                                    color: active ? '#fff' : '#1e293b',
                                    background: active ? '#3b82f6' : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    borderBottom: idx < options.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                }}
                            >
                                {op.label}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
