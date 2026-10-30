import React, { useState, useRef, useEffect } from 'react';
import { cardStyle, labelStyle, RADIUS, FS, FONT } from '../../../Principal/Constantes';
import Latex from '../../../../../components/excel/Latex';
import ModalAlerta from '../../../ui/ModalAlerta';
import StatLabel from '../../../ui/StatLabel';

const CustomSelect = ({ value, onChange, options = [], placeholder = 'Seleccionar...', style = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div ref={dropdownRef} style={{ position: 'relative', width: '100%', fontFamily: FONT, ...style }}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    minHeight: '38px',
                    boxSizing: 'border-box',
                    background: 'var(--bg-input)',
                    border: `1px solid ${isOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    borderRadius: RADIUS,
                    cursor: 'pointer',
                    boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                    color: 'var(--text-pure)',
                    userSelect: 'none',
                    fontSize: FS.sm,
                    fontFamily: FONT
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1, minWidth: 0 }}>
                    <span style={{
                        fontWeight: selectedOption ? 500 : 400,
                        fontSize: FS.sm,
                        color: selectedOption ? 'var(--text-pure)' : 'var(--text-muted)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        color: 'var(--text-muted)',
                        flexShrink: 0
                    }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: RADIUS,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                        zIndex: 1000,
                        maxHeight: '260px',
                        overflowY: 'auto',
                        animation: 'fadeInDropdown 0.2s ease'
                    }}
                    className="thin-scrollbar"
                >
                    {options.length === 0 ? (
                        <div style={{ padding: '9px 12px', color: 'var(--text-muted)', fontSize: FS.sm, fontStyle: 'italic', fontFamily: FONT }}>
                            Sin opciones
                        </div>
                    ) : (
                        options.map((opt) => {
                            const isSelected = value === opt.value;
                            return (
                                <div 
                                    key={opt.value}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.background = 'var(--bg-input, rgba(0,0,0,0.04))';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.background = 'transparent';
                                        }
                                    }}
                                    style={{
                                        padding: '9px 12px',
                                        cursor: 'pointer',
                                        fontSize: FS.sm,
                                        fontFamily: FONT,
                                        background: isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                                        color: isSelected ? 'var(--primary-color)' : 'var(--text-pure)',
                                        fontWeight: isSelected ? 600 : 400,
                                        transition: 'all 0.15s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <span>{opt.label}</span>
                                    {isSelected && (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-color)' }}>
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default function Controles_Student({ configuracion, onEditar, onGenerar, baseCalculada }) {
    // Inputs del problema
    const mu = configuracion.mu;
    const setMu = valor => onEditar('mu', valor);
    const s = configuracion.s;
    const setS = valor => onEditar('s', valor);
    const n = configuracion.n;
    const setN = valor => onEditar('n', valor);
    const tipoDispersion = configuracion.tipoDispersion;
    const setTipoDispersion = valor => onEditar('tipoDispersion', valor);

    // Estado del proceso
    const distribucionGenerada = !!baseCalculada;
    const datosParciales = baseCalculada;

    // Inputs de objetivo
    const condicion = configuracion.condicion;
    const setCondicion = valor => onEditar('condicion', valor);
    const valorX1 = configuracion.valorX1;
    const setValorX1 = valor => onEditar('valorX1', valor);
    const valorX2 = configuracion.valorX2;
    const setValorX2 = valor => onEditar('valorX2', valor);

    // Alertas
    const [alertaModal, setAlertaModal] = useState({ isOpen: false, mensaje: '', tipo: 'warning' });

    const formatNumber = (num, minDec = 0, maxDec = 4) => {
        if (num === undefined || num === null || isNaN(num)) return '0';
        return num.toLocaleString('es-ES', { minimumFractionDigits: minDec, maximumFractionDigits: maxDec }).replace(/,/g, '{,}');
    };

    const ejecutarCalculo = evaluarCondicion => {
        const calculo = onGenerar(evaluarCondicion);
        setAlertaModal({ isOpen: !!calculo.error, mensaje: calculo.error || '', tipo: 'warning' });
    };
    const generarDistribucion = () => ejecutarCalculo(false);
    const calcularProbabilidad = () => ejecutarCalculo(true);

    return (
        <div style={{ ...cardStyle, border: 'none', padding: '0', backgroundColor: 'transparent' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Fila 1: μ y S / S² */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '15px' }}>
                    <div id="tour-t4tyf-student-media-poblacional" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0, width: 'fit-content', whiteSpace: 'nowrap' }}><Latex formula="\boldsymbol{\mu} =" /></label>
                        <input
                            type="number"
                            className="input-mat251 placeholder-small"
                            placeholder="Media Pob."
                            value={mu}
                            onChange={(e) => { setMu(e.target.value); }}
                            style={{
                                flex: 1,
                                width: '100%',
                                minWidth: 0,
                                minHeight: '38px',
                                padding: '8px 12px',
                                borderRadius: RADIUS,
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-input)',
                                color: 'var(--text-pure)',
                                fontSize: FS.sm,
                                fontFamily: FONT,
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div id="tour-t4tyf-student-dispersion" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '85px', flexShrink: 0 }}>
                            <CustomSelect
                                value={tipoDispersion}
                                onChange={(val) => { setTipoDispersion(val); }}
                                options={[
                                    { value: 'desviacion', label: <Latex formula="\boldsymbol{S} =" /> },
                                    { value: 'varianza', label: <Latex formula="\boldsymbol{S}^2 =" /> }
                                ]}
                            />
                        </div>
                        <input
                            type="number"
                            className="input-mat251 placeholder-small"
                            placeholder={tipoDispersion === 'varianza' ? "Varianza Muestral" : "Desv. Est. Muestral"}
                            value={s}
                            onChange={(e) => { setS(e.target.value); }}
                            style={{
                                flex: 1,
                                width: '100%',
                                minWidth: 0,
                                minHeight: '38px',
                                padding: '8px 12px',
                                borderRadius: RADIUS,
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-input)',
                                color: 'var(--text-pure)',
                                fontSize: FS.sm,
                                fontFamily: FONT,
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                </div>
                {/* Fila 2: n centrado */}
                <div id="tour-t4tyf-student-tamano-muestra" style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '50%' }}>
                        <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0, width: 'fit-content', whiteSpace: 'nowrap' }}><Latex formula="\boldsymbol{n} =" /></label>
                        <input
                            type="number"
                            className="input-mat251 placeholder-small"
                            placeholder="Muestra"
                            value={n}
                            onChange={(e) => { setN(e.target.value); }}
                            style={{
                                flex: 1,
                                width: '100%',
                                minWidth: 0,
                                minHeight: '38px',
                                padding: '8px 12px',
                                borderRadius: RADIUS,
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-input)',
                                color: 'var(--text-pure)',
                                fontSize: FS.sm,
                                fontFamily: FONT,
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div id="tour-t4tyf-student-btn-calcular" style={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
                <button
                    type="button"
                    onClick={generarDistribucion}
                    className="button_calcular"
                    style={{ width: 'fit-content', padding: '5px 20px', borderRadius: RADIUS, cursor: 'pointer', fontWeight: 600, fontFamily: FONT, fontSize: FS.md, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                    CALCULAR
                </button>
            </div>

            {distribucionGenerada && (
                <div style={{ marginTop: '15px', animation: 'fadeIn 0.5s ease-out' }}>
                    <div id="tour-t4tyf-student-parametros-estimados" style={{ background: 'var(--bg-card)', padding: '14px 16px', borderRadius: RADIUS, border: 'none', boxShadow: 'none', textAlign: 'center', marginTop: '10px', marginBottom: '10px', overflow: 'visible' }}>
                        <div className="tema4-tarjeta-titulo-unificado" style={{ marginBottom: '10px', color: 'var(--text-pure)', fontSize: '0.8rem', fontWeight: 700, fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Parámetros de la Distribución t-Student</div>
                        <div className="formula-responsive" style={{ width: '100%', overflow: 'visible', padding: '4px', color: 'var(--text-pure)', fontWeight: 'normal', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                                <StatLabel formulaKey="v_grados_libertad_student" formulaLatex="v" customTexto="Grados de Libertad" customMath="v = n - 1" align="center" />
                                <Latex formula={'= n - 1 = ' + datosParciales.n + ' - 1 = \\mathbf{' + datosParciales.v + '}'} />
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                                <StatLabel formulaKey="E_x_barra_student" formulaLatex="E(\bar{X})" customTexto="Esperanza de la Media Muestral" customMath="E(\bar{X}) = \mu" align="center" />
                                <Latex formula={'= \\mu = \\mathbf{' + formatNumber(datosParciales.mu) + '}'} />
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                                <StatLabel formulaKey="V_x_barra_student" formulaLatex="V(\bar{X})" customTexto="Varianza estimada de la Media Muestral" customMath="V(\bar{X}) = \frac{S^2}{n}" align="center" />
                                <Latex formula={'= \\frac{S^2}{n} = \\frac{' + formatNumber(datosParciales.s2) + '}{' + formatNumber(datosParciales.n, 0, 0) + '} = \\mathbf{' + formatNumber(datosParciales.varXbar, 0, 4) + '}'} />
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                                <StatLabel formulaKey="se_x_barra_student" formulaLatex="S_{\bar{X}}" customTexto="Error Estándar de la Media" customMath="S_{\bar{X}} = \frac{S}{\sqrt{n}}" align="center" />
                                <Latex formula={'= \\frac{S}{\\sqrt{n}} = \\frac{' + formatNumber(datosParciales.s) + '}{\\sqrt{' + formatNumber(datosParciales.n, 0, 0) + '}} = \\mathbf{' + formatNumber(datosParciales.se, 0, 4) + '}'} />
                            </div>
                            <div className="formula-bold" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4px', fontWeight: 'bold' }}>
                                <Latex formula={'\\mathbf{T = \\frac{\\bar{X} - \\mu}{S / \\sqrt{n}} \\sim t_{(' + formatNumber(datosParciales.v, 0, 0) + ')}}'} />
                            </div>
                        </div>
                    </div>

                    {/* Sección Condición de Búsqueda */}
                    <div id="tour-t4tyf-student-condicion-busqueda">
                        <div style={{ margin: '15px 0 5px 0' }}></div>

                        <h4 style={{ color: 'var(--text-pure)', fontSize: FS.md, margin: '0 0 12px 0', fontFamily: FONT, fontWeight: 'bold' }}>
                            Condición de Búsqueda:
                        </h4>

                        {/* FILA 1: Condición lógica y su dropdown en una sola fila centrada */}
                        <div className="tema4-condicion-fila">
                            <label className="tema4-condicion-label">
                                Condición lógica:
                            </label>
                            <div className="tema4-condicion-select-wrapper" style={{ width: condicion === 'entre' ? '210px' : '170px' }}>
                                <CustomSelect
                                    value={condicion}
                                    onChange={(val) => { setCondicion(val); }}
                                    options={[
                                        { value: 'menor_que', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}><Latex formula="P(\bar{X} \le x)" /></div> },
                                        { value: 'mayor_que', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}><Latex formula="P(\bar{X} \ge x)" /></div> },
                                        { value: 'entre', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}><Latex formula="P(x_1 \le \bar{X} \le x_2)" /></div> }
                                    ]}
                                />
                            </div>
                        </div>

                        {/* FILA 2: Valor(es) x (y x2 si entre) */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'nowrap',
                            justifyContent: 'center',
                            gap: '10px',
                            marginBottom: '14px',
                            width: '100%',
                            maxWidth: condicion === 'entre' ? '360px' : '200px',
                            margin: '0 auto 14px auto',
                            boxSizing: 'border-box'
                        }}>
                            {condicion === 'entre' ? (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                                        <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                            <Latex formula="\mathbf{x}_1:" />
                                        </label>
                                        <input
                                            type="number"
                                            className="input-mat251 placeholder-small"
                                            placeholder="Límite inferior"
                                            value={valorX1}
                                            onChange={(e) => setValorX1(e.target.value)}
                                            style={{
                                                padding: '6px 12px',
                                                fontSize: FS.sm,
                                                fontFamily: FONT,
                                                borderRadius: RADIUS,
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-input)',
                                                color: 'var(--text-pure)',
                                                height: '36px',
                                                flex: 1,
                                                minWidth: 0,
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                                        <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                            <Latex formula="\mathbf{x}_2:" />
                                        </label>
                                        <input
                                            type="number"
                                            className="input-mat251 placeholder-small"
                                            placeholder="Límite superior"
                                            value={valorX2}
                                            onChange={(e) => setValorX2(e.target.value)}
                                            style={{
                                                padding: '6px 12px',
                                                fontSize: FS.sm,
                                                fontFamily: FONT,
                                                borderRadius: RADIUS,
                                                border: '1px solid var(--border-color)',
                                                background: 'var(--bg-input)',
                                                color: 'var(--text-pure)',
                                                height: '36px',
                                                flex: 1,
                                                minWidth: 0,
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                                    <label style={{ fontSize: FS.md, fontWeight: 700, color: 'var(--text-pure)', margin: 0, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                                        <Latex formula="\mathbf{x}:" />
                                    </label>
                                    <input
                                        type="number"
                                        className="input-mat251 placeholder-small"
                                        placeholder="Valor x"
                                        value={valorX1}
                                        onChange={(e) => setValorX1(e.target.value)}
                                        style={{
                                            padding: '6px 12px',
                                            fontSize: FS.sm,
                                            fontFamily: FONT,
                                            borderRadius: RADIUS,
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-input)',
                                            color: 'var(--text-pure)',
                                            height: '36px',
                                            flex: 1,
                                            minWidth: 0,
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botón GRAFICAR */}
                    <div id="tour-t4tyf-student-btn-graficar" style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                        <button
                            type="button"
                            onClick={calcularProbabilidad}
                            className="button_calcular"
                            style={{ width: 'fit-content', padding: '5px 20px', borderRadius: RADIUS, cursor: 'pointer', fontWeight: 600, fontFamily: FONT, fontSize: FS.md, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                            GRAFICAR
                        </button>
                    </div>
                </div>
            )}

            <ModalAlerta
                isOpen={alertaModal.isOpen}
                onClose={() => setAlertaModal({ ...alertaModal, isOpen: false })}
                mensaje={alertaModal.mensaje}
                tipo={alertaModal.tipo}
            />
        </div>
    );
}
