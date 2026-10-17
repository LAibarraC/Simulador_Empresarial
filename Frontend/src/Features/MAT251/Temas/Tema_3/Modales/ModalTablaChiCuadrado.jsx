import React, { useState, useEffect, useRef, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { jStat } from 'jstat';

// Columnas estándar de probabilidad en tablas Chi-cuadrado
const COLUMNAS_ALPHA_COLA_DERECHA = [
    '0.995', '0.990', '0.975', '0.950', '0.900', '0.500', '0.100', '0.050', '0.025', '0.010', '0.005'
];

const COLUMNAS_ALPHA_COLA_IZQUIERDA = [
    '0.005', '0.010', '0.025', '0.050', '0.100', '0.500', '0.900', '0.950', '0.975', '0.990', '0.995'
];

// Filas clásicas de grados de libertad (gl)
const BASE_GL_ROWS = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
    40, 50, 60, 70, 80, 90, 100
];

export default function ModalTablaChiCuadrado({
    isOpen,
    onClose,
    glInicial = 10,
    chiInicial = null,
    probInicial = null,
    detalleCalculo = null
}) {
    const glNumInicial = Math.max(1, parseInt(glInicial, 10) || 10);
    const [currentGL, setCurrentGL] = useState(glNumInicial);
    const [inputGL, setInputGL] = useState(glNumInicial.toString());
    const [tab, setTab] = useState('derecha'); // 'derecha' (P(Chi2 >= c) = alpha) o 'izquierda' (P(Chi2 <= c) = p)
    const [selectedAlpha, setSelectedAlpha] = useState('0.050');
    const [inputChi, setInputChi] = useState(chiInicial != null ? parseFloat(chiInicial).toFixed(2) : '');

    const activeCellRef = useRef(null);
    const tableContainerRef = useRef(null);

    // Sincronizar al abrir
    useEffect(() => {
        if (isOpen) {
            const gl = Math.max(1, parseInt(glInicial, 10) || 10);
            setCurrentGL(gl);
            setInputGL(gl.toString());
            if (chiInicial != null) {
                const chiVal = parseFloat(chiInicial);
                setInputChi(isNaN(chiVal) ? '' : chiVal.toFixed(2));
                // Calcular alpha más cercano para el chi actual
                const pAcum = jStat.chisquare.cdf(chiVal, gl);
                const alphaDer = 1 - pAcum;
                // Encontrar la columna más cercana
                const cols = tab === 'derecha' ? COLUMNAS_ALPHA_COLA_DERECHA : COLUMNAS_ALPHA_COLA_IZQUIERDA;
                let closest = cols[0];
                let minDiff = 999;
                cols.forEach(c => {
                    const diff = Math.abs(parseFloat(c) - (tab === 'derecha' ? alphaDer : pAcum));
                    if (diff < minDiff) {
                        minDiff = diff;
                        closest = c;
                    }
                });
                setSelectedAlpha(closest);
            }
        }
    }, [isOpen, glInicial, chiInicial]);

    // Deshabilitar scroll del fondo al abrir
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = 'auto'; };
        }
    }, [isOpen]);

    // Lista de filas con GL asegurando que el GL actual esté presente
    const rowsGL = useMemo(() => {
        const rows = [...BASE_GL_ROWS];
        if (!rows.includes(currentGL)) {
            rows.push(currentGL);
            rows.sort((a, b) => a - b);
        }
        return rows;
    }, [currentGL]);

    const columnas = tab === 'derecha' ? COLUMNAS_ALPHA_COLA_DERECHA : COLUMNAS_ALPHA_COLA_IZQUIERDA;

    // Valor crítico actual correspondiente al GL y columna seleccionada
    const valorCriticoActual = useMemo(() => {
        const alphaVal = parseFloat(selectedAlpha);
        if (isNaN(alphaVal) || isNaN(currentGL)) return '0.0000';
        try {
            const pCumulativo = tab === 'derecha' ? (1 - alphaVal) : alphaVal;
            const c = jStat.chisquare.inv(pCumulativo, currentGL);
            return typeof c === 'number' && !isNaN(c) ? c.toFixed(4) : '-';
        } catch {
            return '-';
        }
    }, [selectedAlpha, currentGL, tab]);

    // Probabilidad real exacta del chi ingresado
    const probExactaChi = useMemo(() => {
        const chiVal = parseFloat(inputChi);
        if (isNaN(chiVal) || chiVal < 0) return null;
        const pMenor = jStat.chisquare.cdf(chiVal, currentGL);
        return {
            pMenor: pMenor.toFixed(4),
            pMayor: (1 - pMenor).toFixed(4)
        };
    }, [inputChi, currentGL]);

    // Auto-scroll a la celda activa
    useEffect(() => {
        if (isOpen && activeCellRef.current) {
            const timer = setTimeout(() => {
                if (activeCellRef.current) {
                    activeCellRef.current.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'center'
                    });
                }
            }, 120);
            return () => clearTimeout(timer);
        }
    }, [isOpen, tab, currentGL, selectedAlpha]);

    if (!isOpen) return null;

    const renderLatex = (formula) => {
        try {
            return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(formula, { throwOnError: false }) }} />;
        } catch {
            return <span>{formula}</span>;
        }
    };

    const handleGLSubmit = (e) => {
        e.preventDefault();
        const num = parseInt(inputGL, 10);
        if (!isNaN(num) && num > 0) {
            setCurrentGL(num);
        }
    };

    const handleSelectCell = (gl, colAlpha) => {
        setCurrentGL(gl);
        setInputGL(gl.toString());
        setSelectedAlpha(colAlpha);
        const alphaVal = parseFloat(colAlpha);
        const pCumulativo = tab === 'derecha' ? (1 - alphaVal) : alphaVal;
        const c = jStat.chisquare.inv(pCumulativo, gl);
        if (typeof c === 'number' && !isNaN(c)) {
            setInputChi(c.toFixed(2));
        }
    };

    return (
        <div className="modal-tabla-z-overlay" onClick={onClose}>
            <div className="modal-tabla-z-container" onClick={(e) => e.stopPropagation()}>
                {/* CABECERA */}
                <div className="modal-tabla-z-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="modal-tabla-z-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4v16h16" />
                                <path d="M4 18c3-4 6-12 10-12s6 8 6 8" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="modal-tabla-z-title">
                                Tabla de Distribución Chi-cuadrada {renderLatex('\\chi^2 \\sim \\chi^2(\\nu)')}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* BANNER EDUCATIVO / PASO A PASO */}
                <div className="modal-tabla-z-panel-educativo">
                    <div className="modal-tabla-z-panel-header">
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-pure)' }}>
                            Lectura paso a paso en la tabla para:
                        </span>
                        <span className="modal-tabla-z-badge-target">
                            {renderLatex(`\\nu = ${currentGL}`)}
                        </span>
                        {inputChi && (
                            <span className="modal-tabla-z-badge-target" style={{ marginLeft: '4px' }}>
                                {renderLatex(`\\chi^2 = ${inputChi}`)}
                            </span>
                        )}
                    </div>

                    <div className="modal-tabla-z-steps-grid">
                        <div className="modal-tabla-z-step-card">
                            <div className="modal-tabla-z-step-num">1</div>
                            <div className="modal-tabla-z-step-body">
                                <div className="modal-tabla-z-step-label">
                                    <span className="step-label-full">Fila (Grados de libertad)</span>
                                    <span className="step-label-short">Grados de lib.</span>
                                </div>
                                <div className="modal-tabla-z-step-val">{renderLatex(`\\nu = ${currentGL}`)}</div>
                            </div>
                        </div>

                        <div className="modal-tabla-z-step-arrow">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>

                        <div className="modal-tabla-z-step-card">
                            <div className="modal-tabla-z-step-num">2</div>
                            <div className="modal-tabla-z-step-body">
                                <div className="modal-tabla-z-step-label">
                                    <span className="step-label-full">Columna ({tab === 'derecha' ? 'Cola derecha α' : 'Prob. acumulada p'})</span>
                                    <span className="step-label-short">Columna</span>
                                </div>
                                <div className="modal-tabla-z-step-val">{selectedAlpha}</div>
                            </div>
                        </div>

                        <div className="modal-tabla-z-step-arrow">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>

                        <div className="modal-tabla-z-step-card modal-tabla-z-step-card-active">
                            <div className="modal-tabla-z-step-num green">3</div>
                            <div className="modal-tabla-z-step-body">
                                <div className="modal-tabla-z-step-label">
                                    <span className="step-label-full">Intersección: Valor Crítico</span>
                                    <span className="step-label-short">Valor Crítico</span>
                                </div>
                                <div className="modal-tabla-z-step-val green">
                                    {renderLatex(`\\chi^2 = ${valorCriticoActual}`)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BARRA DE HERRAMIENTAS */}
                <div className="modal-tabla-z-toolbar">
                    <div className="contenedor-selector-modos-mat251">
                        <button
                            type="button"
                            onClick={() => setTab('derecha')}
                            className={`btn-mat251-modo ${tab === 'derecha' ? 'active' : ''}`}
                        >
                            {renderLatex('P(\\chi^2 \\ge c) = \\alpha')} <span className="tab-desc-full">(Cola Derecha)</span><span className="tab-desc-mobile"> (Der.)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab('izquierda')}
                            className={`btn-mat251-modo ${tab === 'izquierda' ? 'active' : ''}`}
                        >
                            {renderLatex('P(\\chi^2 \\le c) = p')} <span className="tab-desc-full">(Acumulada)</span><span className="tab-desc-mobile"> (Izq.)</span>
                        </button>
                    </div>

                    <form onSubmit={handleGLSubmit} className="modal-tabla-z-custom-form">
                        <label htmlFor="input-gl-custom" className="modal-tabla-z-form-label">
                            <span className="form-label-full">Grados de lib. (ν):</span>
                            <span className="form-label-short">ν:</span>
                        </label>
                        <input
                            id="input-gl-custom"
                            type="number"
                            min="1"
                            max="200"
                            value={inputGL}
                            onChange={(e) => setInputGL(e.target.value)}
                            className="input-mat251 placeholder-small modal-tabla-z-input"
                            placeholder="ν"
                        />
                        <button type="submit" className="modal-tabla-z-btn-ir btn-accent">
                            Cambiar
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setCurrentGL(glNumInicial);
                                setInputGL(glNumInicial.toString());
                                if (chiInicial != null) setInputChi(parseFloat(chiInicial).toFixed(2));
                            }}
                            className="modal-tabla-z-btn-reset btn-accent"
                            title="Restablecer a los parámetros del ejercicio"
                        >
                            <span className="btn-reset-full">Restablecer</span>
                            <span className="btn-reset-short">Original</span>
                        </button>
                    </form>
                </div>

                {/* TABLA CHI-CUADRADO */}
                <div className="modal-tabla-z-table-wrap" ref={tableContainerRef}>
                    <table className="modal-tabla-z-table">
                        <thead>
                            <tr>
                                <th className="modal-tabla-z-th-corner">ν \ α</th>
                                {columnas.map((colAlpha) => {
                                    const isColActive = colAlpha === selectedAlpha;
                                    return (
                                        <th
                                            key={colAlpha}
                                            className={`modal-tabla-z-th-col ${isColActive ? 'col-highlight' : ''}`}
                                            onClick={() => setSelectedAlpha(colAlpha)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {colAlpha}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {rowsGL.map((gl) => {
                                const isRowActive = gl === currentGL;
                                return (
                                    <tr key={gl} className={isRowActive ? 'row-highlight' : ''}>
                                        <th
                                            className={`modal-tabla-z-th-row ${isRowActive ? 'row-label-active' : ''}`}
                                            onClick={() => { setCurrentGL(gl); setInputGL(gl.toString()); }}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {gl}
                                        </th>
                                        {columnas.map((colAlpha) => {
                                            const isColActive = colAlpha === selectedAlpha;
                                            const isIntersection = isRowActive && isColActive;
                                            const alphaVal = parseFloat(colAlpha);
                                            const pCumulativo = tab === 'derecha' ? (1 - alphaVal) : alphaVal;
                                            let critVal = '-';
                                            try {
                                                const v = jStat.chisquare.inv(pCumulativo, gl);
                                                critVal = typeof v === 'number' && !isNaN(v) ? v.toFixed(3) : '-';
                                            } catch {
                                                critVal = '-';
                                            }

                                            return (
                                                <td
                                                    key={colAlpha}
                                                    ref={isIntersection ? activeCellRef : null}
                                                    id={isIntersection ? 'celda-chi-activa' : undefined}
                                                    className={`modal-tabla-z-td ${isIntersection ? 'cell-intersection-active' : isRowActive || isColActive ? 'cell-cross-highlight' : ''}`}
                                                    onClick={() => handleSelectCell(gl, colAlpha)}
                                                    title={`ν = ${gl}, α = ${colAlpha} → χ² = ${critVal}`}
                                                >
                                                    {critVal}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* FOOTER */}
                <div className="modal-tabla-z-footer">
                    <div className="modal-tabla-z-legend">
                        <span className="legend-item">
                            <span className="legend-box green"></span>
                            <span className="legend-text-full">Intersección activa: </span>
                            {renderLatex(`\\chi^2_{(${selectedAlpha}, \\; \\nu=${currentGL})} = ${valorCriticoActual}`)}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="modal-tabla-z-btn-cerrar btn-accent"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
