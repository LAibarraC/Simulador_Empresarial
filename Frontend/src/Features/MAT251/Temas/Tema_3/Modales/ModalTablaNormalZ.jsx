import React, { useState, useEffect, useRef, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { jStat } from 'jstat';

const COLUMNS = ['0.00', '0.01', '0.02', '0.03', '0.04', '0.05', '0.06', '0.07', '0.08', '0.09'];

const ROWS_NEGATIVAS = [
    '-3.9', '-3.8', '-3.7', '-3.6', '-3.5', '-3.4', '-3.3', '-3.2', '-3.1', '-3.0',
    '-2.9', '-2.8', '-2.7', '-2.6', '-2.5', '-2.4', '-2.3', '-2.2', '-2.1', '-2.0',
    '-1.9', '-1.8', '-1.7', '-1.6', '-1.5', '-1.4', '-1.3', '-1.2', '-1.1', '-1.0',
    '-0.9', '-0.8', '-0.7', '-0.6', '-0.5', '-0.4', '-0.3', '-0.2', '-0.1', '-0.0'
];

const ROWS_POSITIVAS = [
    '0.0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9',
    '1.0', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9',
    '2.0', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9',
    '3.0', '3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8', '3.9'
];


export default function ModalTablaNormalZ({ isOpen, onClose, zInicial = 0, detalleCalculo = null }) {
    const zNumInicial = typeof zInicial === 'number' && !isNaN(zInicial) ? zInicial : parseFloat(zInicial) || 0;
    const [currentZ, setCurrentZ] = useState(zNumInicial);
    const [inputZ, setInputZ] = useState(zNumInicial.toFixed(2));
    const [tab, setTab] = useState(zNumInicial < 0 ? 'negativo' : 'positivo');
    const activeCellRef = useRef(null);
    const tableContainerRef = useRef(null);

    // Sincronizar cuando cambia zInicial al abrir
    useEffect(() => {
        if (isOpen) {
            const num = typeof zInicial === 'number' && !isNaN(zInicial) ? zInicial : parseFloat(zInicial) || 0;
            setCurrentZ(num);
            setInputZ(num.toFixed(2));
            setTab(num < 0 ? 'negativo' : 'positivo');
        }
    }, [isOpen, zInicial]);

    // Deshabilitar scroll del fondo
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = 'auto'; };
        }
    }, [isOpen]);

    // Descomposición del Z actual
    const parsed = useMemo(() => {
        const num = currentZ;
        const isNeg = num < 0;
        const absVal = Math.abs(num);
        const strVal = absVal.toFixed(2);
        const parts = strVal.split('.');
        const intPart = parts[0];
        const decPart = parts[1] || '00';
        const firstDec = decPart[0] || '0';
        const secondDec = decPart[1] || '0';

        let row = `${isNeg ? '-' : ''}${intPart}.${firstDec}`;
        const col = `0.0${secondDec}`;
        const colIndex = parseInt(secondDec, 10);
        const zFormatted = (isNeg ? '-' : '') + strVal;

        // Limitar a extremos si excede el rango de la tabla [-3.9, 3.9]
        const isOutOfLowerBound = num < -3.90;
        const isOutOfUpperBound = num > 3.90;

        return {
            isNeg,
            row,
            col,
            colIndex,
            zFormatted,
            num,
            isOutOfLowerBound,
            isOutOfUpperBound
        };
    }, [currentZ]);

    // Probabilidad teórica exacta del valor actual
    const probCalculada = useMemo(() => {
        const p = jStat.normal.cdf(currentZ, 0, 1);
        return p.toFixed(4);
    }, [currentZ]);

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
    }, [isOpen, tab, currentZ]);

    if (!isOpen) return null;

    const rows = tab === 'negativo' ? ROWS_NEGATIVAS : ROWS_POSITIVAS;

    const handleSelectZ = (newZ) => {
        const num = parseFloat(newZ);
        if (isNaN(num)) return;
        setCurrentZ(num);
        setInputZ(num.toFixed(2));
        setTab(num < 0 ? 'negativo' : 'positivo');
    };

    const handleTabChange = (newTab) => {
        setTab(newTab);
        if (newTab === 'positivo' && currentZ < 0) {
            handleSelectZ(Math.abs(currentZ));
        } else if (newTab === 'negativo' && currentZ > 0) {
            handleSelectZ(-Math.abs(currentZ));
        }
    };

    const handleInputSubmit = (e) => {
        e.preventDefault();
        const normalized = (inputZ || '').toString().replace(',', '.');
        const num = parseFloat(normalized);
        if (!isNaN(num)) {
            handleSelectZ(num);
        }
    };

    const renderLatex = (formula) => {
        try {
            return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(formula, { throwOnError: false }) }} />;
        } catch {
            return <span>{formula}</span>;
        }
    };

    return (
        <div 
            className="modal-tabla-z-overlay"
            onClick={onClose}
        >
            <div 
                className="modal-tabla-z-container"
                onClick={(e) => e.stopPropagation()}
            >
                {/* CABECERA */}
                <div className="modal-tabla-z-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="modal-tabla-z-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                <line x1="3" y1="15" x2="21" y2="15"></line>
                                <line x1="9" y1="3" x2="9" y2="21"></line>
                                <line x1="15" y1="3" x2="15" y2="21"></line>
                            </svg>
                        </div>
                        <div>
                            <h3 className="modal-tabla-z-title">
                                Tabla de Distribución Normal Estándar {renderLatex('Z \\sim N(0, 1)')}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* BANNER EDUCATIVO / DESGLOSE PASO A PASO */}
                <div className="modal-tabla-z-panel-educativo">
                    <div className="modal-tabla-z-panel-header">
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-pure)' }}>
                            Lectura paso a paso en la tabla para:
                        </span>
                        <span className="modal-tabla-z-badge-target">
                            {renderLatex(`z = ${parsed.zFormatted}`)}
                        </span>
                    </div>

                    <div className="modal-tabla-z-steps-grid">
                        <div className="modal-tabla-z-step-card">
                            <div className="modal-tabla-z-step-num">1</div>
                            <div className="modal-tabla-z-step-body">
                                <div className="modal-tabla-z-step-label">
                                    <span className="step-label-full">Fila (Entero y 1er decimal)</span>
                                    <span className="step-label-short">Fila</span>
                                </div>
                                <div className="modal-tabla-z-step-val">{parsed.row}</div>
                            </div>
                        </div>

                        <div className="modal-tabla-z-step-arrow">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>

                        <div className="modal-tabla-z-step-card">
                            <div className="modal-tabla-z-step-num">2</div>
                            <div className="modal-tabla-z-step-body">
                                <div className="modal-tabla-z-step-label">
                                    <span className="step-label-full">Columna (2do decimal)</span>
                                    <span className="step-label-short">Columna</span>
                                </div>
                                <div className="modal-tabla-z-step-val">{parsed.col}</div>
                            </div>
                        </div>

                        <div className="modal-tabla-z-step-arrow">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>

                        <div className="modal-tabla-z-step-card modal-tabla-z-step-card-active">
                            <div className="modal-tabla-z-step-num green">3</div>
                            <div className="modal-tabla-z-step-body">
                                <div className="modal-tabla-z-step-label">
                                    <span className="step-label-full">Intersección: Probabilidad</span>
                                    <span className="step-label-short">Probabilidad</span>
                                </div>
                                <div className="modal-tabla-z-step-val green">
                                    {probCalculada} <span className="step-prob-pct" style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>({(parseFloat(probCalculada) * 100).toFixed(2)}%)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Alertas de cola extrema si z < -3.90 o z > 3.90 */}
                    {parsed.isOutOfLowerBound && (
                        <div className="modal-tabla-z-alerta-extrema">
                            <strong>Nota pedagógica:</strong> Dado que {renderLatex(`z = ${parsed.zFormatted} < -3.90`)}, el valor se encuentra en el extremo inferior de la campana. En las tablas impresas convencionales, el área acumulada se aproxima directamente a <strong>0.0000</strong> (probabilidad nula al 4to decimal).
                        </div>
                    )}
                    {parsed.isOutOfUpperBound && (
                        <div className="modal-tabla-z-alerta-extrema">
                            <strong>Nota pedagógica:</strong> Dado que {renderLatex(`z = ${parsed.zFormatted} > 3.90`)}, el valor abarca prácticamente toda el área bajo la curva normal. En las tablas impresas convencionales, el área acumulada se aproxima directamente a <strong>1.0000</strong> (100%).
                        </div>
                    )}
                </div>

                {/* BARRA DE HERRAMIENTAS: PESTAÑAS (NEGATIVOS / POSITIVOS) Y BÚSQUEDA RÁPIDA */}
                <div className="modal-tabla-z-toolbar">
                    <div className="contenedor-selector-modos-mat251">
                        <button
                            type="button"
                            onClick={() => handleTabChange('negativo')}
                            className={`btn-mat251-modo ${tab === 'negativo' ? 'active' : ''}`}
                        >
                            {renderLatex('Z \\le 0')} <span className="tab-desc-full">(Negativos: -3.9 a 0.0)</span><span className="tab-desc-mobile"> (-3.9 a 0)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTabChange('positivo')}
                            className={`btn-mat251-modo ${tab === 'positivo' ? 'active' : ''}`}
                        >
                            {renderLatex('Z \\ge 0')} <span className="tab-desc-full">(Positivos: 0.0 a 3.9)</span><span className="tab-desc-mobile"> (0 a 3.9)</span>
                        </button>
                    </div>

                    <form onSubmit={handleInputSubmit} className="modal-tabla-z-custom-form">
                        <label htmlFor="input-z-custom" className="modal-tabla-z-form-label">
                            <span className="form-label-full">Explorar otro Z:</span>
                            <span className="form-label-short">Z:</span>
                        </label>
                        <input
                            id="input-z-custom"
                            type="number"
                            step="0.01"
                            value={inputZ}
                            onChange={(e) => setInputZ(e.target.value)}
                            className="input-mat251 placeholder-small modal-tabla-z-input"
                            placeholder="Ej: 1.96"
                        />
                        <button type="submit" className="modal-tabla-z-btn-ir btn-accent">
                            Buscar
                        </button>
                        <button 
                            type="button" 
                            onClick={() => handleSelectZ(zNumInicial)}
                            className="modal-tabla-z-btn-reset btn-accent"
                            title="Restablecer al valor de Z calculado en el ejercicio"
                        >
                            <span className="btn-reset-full">Volver al Z original</span>
                            <span className="btn-reset-short">Original</span>
                        </button>
                    </form>
                </div>

                {/* CONTENEDOR DE LA TABLA CON SCROLL Y ENCABEZADOS PEGAJOSOS (STICKY) */}
                <div className="modal-tabla-z-table-wrap" ref={tableContainerRef}>
                    <table className="modal-tabla-z-table">
                        <thead>
                            <tr>
                                <th className="modal-tabla-z-th-corner">Z</th>
                                {COLUMNS.map((colName) => {
                                    const isColActive = colName === parsed.col && ((tab === 'negativo' && parsed.isNeg) || (tab === 'positivo' && !parsed.isNeg));
                                    return (
                                        <th
                                            key={colName}
                                            className={`modal-tabla-z-th-col ${isColActive ? 'col-highlight' : ''}`}
                                        >
                                            {colName}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((rowName) => {
                                const isRowActive = rowName === parsed.row && ((tab === 'negativo' && parsed.isNeg) || (tab === 'positivo' && !parsed.isNeg));
                                return (
                                    <tr 
                                        key={rowName}
                                        className={isRowActive ? 'row-highlight' : ''}
                                    >
                                        <th className={`modal-tabla-z-th-row ${isRowActive ? 'row-label-active' : ''}`}>
                                            {rowName}
                                        </th>
                                        {COLUMNS.map((colName) => {
                                            const isColActive = colName === parsed.col && ((tab === 'negativo' && parsed.isNeg) || (tab === 'positivo' && !parsed.isNeg));
                                            const isIntersection = isRowActive && isColActive;

                                            // Cálculo del valor de la celda
                                            let cellZ;
                                            if (tab === 'negativo') {
                                                cellZ = parseFloat(rowName) - parseFloat(colName);
                                            } else {
                                                cellZ = parseFloat(rowName) + parseFloat(colName);
                                            }
                                            const cellProb = jStat.normal.cdf(cellZ, 0, 1).toFixed(4);

                                            return (
                                                <td
                                                    key={colName}
                                                    ref={isIntersection ? activeCellRef : null}
                                                    id={isIntersection ? 'celda-z-activa' : undefined}
                                                    className={`modal-tabla-z-td ${isIntersection ? 'cell-intersection-active' : isRowActive || isColActive ? 'cell-cross-highlight' : ''}`}
                                                    onClick={() => handleSelectZ(cellZ)}
                                                    title={`z = ${cellZ.toFixed(2)} → P(Z ≤ ${cellZ.toFixed(2)}) = ${cellProb}`}
                                                >
                                                    {cellProb}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* PIE DE PÁGINA / LEYENDA */}
                <div className="modal-tabla-z-footer">
                    <div className="modal-tabla-z-legend">
                        <span className="legend-item">
                            <span className="legend-box green"></span>
                            <span className="legend-text-full">Intersección activa: </span>
                            {renderLatex(`P(Z \\le ${parsed.zFormatted}) = ${probCalculada}`)}
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
