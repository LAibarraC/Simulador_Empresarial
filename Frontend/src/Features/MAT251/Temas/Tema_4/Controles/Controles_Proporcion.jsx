import React, { useState, useRef, useEffect } from 'react';
import { cardStyle, labelStyle, RADIUS, FS, FONT } from '../../../Principal/Constantes';
import Latex from '../../../../../components/excel/Latex';
import { generarDistribucionProporcion, calcularProbabilidadProporcion } from '../../../Matematicas/Logica_Tema4';
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

export default function Controles_Proporcion({ onCalcular }) {
    const [tipoPoblacion, setTipoPoblacion] = useState('infinita');
    const [tamanoPoblacion, setTamanoPoblacion] = useState('');
    const [pPoblacional, setPPoblacional] = useState('');
    const [tamanoMuestra, setTamanoMuestra] = useState('');

    const [distribucionGenerada, setDistribucionGenerada] = useState(false);
    const [datosParciales, setDatosParciales] = useState(null);

    const [condicion, setCondicion] = useState('menor_que');
    const [valorX1, setValorX1] = useState('');
    const [valorX2, setValorX2] = useState('');

    const [alertaModal, setAlertaModal] = useState({ isOpen: false, mensaje: '', tipo: 'warning' });

    const generarDistribucion = () => {
        const result = generarDistribucionProporcion(pPoblacional, tamanoMuestra, tamanoPoblacion, tipoPoblacion);
        if (result.error) {
            setAlertaModal({ isOpen: true, mensaje: result.error, tipo: 'warning' });
            return;
        }

        setDatosParciales(result.datosParciales);
        setDistribucionGenerada(true);
        onCalcular({ ...result.datosParciales, ...result.onCalcularData }); 
    };

    const calcularProbabilidad = () => {
        const result = calcularProbabilidadProporcion(datosParciales, condicion, valorX1, valorX2);
        if (result.error) {
            setAlertaModal({ isOpen: true, mensaje: result.error, tipo: 'warning' });
            return;
        }

        onCalcular({
            ...datosParciales,
            strDesarrollo: result.strDesarrollo,
            probFinal: result.probFinal,
            x1: result.x1,
            x2: result.x2,
            z1: result.z1,
            z2: result.z2,
            condicion: result.condicion,
            tipoPoblacion: tipoPoblacion
        });
    };

    const resetDistribucion = () => {
        setDistribucionGenerada(false);
        setDatosParciales(null);
        setValorX1('');
        setValorX2('');
        onCalcular(null);
    };

    return (
        <div style={{ ...cardStyle, border: 'none', padding: '0', backgroundColor: 'transparent' }}>
            <div id="tour-t4prop-tipo-poblacion" style={{ marginBottom: '15px', marginTop: '5px', textAlign: 'center' }}>
                <span style={labelStyle}>Tipo de Población</span>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
                    <div className="contenedor-selector-modos-mat251" style={{ display: 'inline-flex', alignItems: 'center', height: '36px', boxSizing: 'border-box' }}>
                        <button
                            type="button"
                            className={`btn-mat251-modo ${tipoPoblacion === 'infinita' ? 'active' : ''}`}
                            onClick={() => { setTipoPoblacion('infinita'); resetDistribucion(); }}
                            style={{ width: '140px', fontFamily: FONT, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: FS.sm, fontWeight: 600 }}
                        >
                            Infinita
                        </button>
                        <button
                            type="button"
                            className={`btn-mat251-modo ${tipoPoblacion === 'finita' ? 'active' : ''}`}
                            onClick={() => { setTipoPoblacion('finita'); resetDistribucion(); }}
                            style={{ width: '140px', fontFamily: FONT, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: FS.sm, fontWeight: 600 }}
                        >
                            Finita
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: tipoPoblacion === 'finita' ? 'repeat(auto-fit, minmax(130px, 1fr))' : 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '15px' }}>
                <div id="tour-t4prop-proporcion-poblacional" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0, whiteSpace: 'nowrap', minWidth: '32px', textAlign: 'center' }}>
                        <Latex formula="\boldsymbol{p} =" />
                    </label>
                    <input
                        type="number"
                        step="any"
                        className="input-mat251 placeholder-small"
                        placeholder="Prop. Pob."
                        value={pPoblacional}
                        onChange={(e) => { setPPoblacional(e.target.value); resetDistribucion(); }}
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
                
                <div id="tour-t4prop-tamano-muestra" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0, whiteSpace: 'nowrap', minWidth: '32px', textAlign: 'center' }}>
                        <Latex formula="\boldsymbol{n} =" />
                    </label>
                    <input
                        type="number"
                        className="input-mat251 placeholder-small"
                        placeholder="Muestra"
                        value={tamanoMuestra}
                        onChange={(e) => { setTamanoMuestra(e.target.value); resetDistribucion(); }}
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

                {tipoPoblacion === 'finita' && (
                    <div id="tour-t4prop-tamano-poblacion" style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0, whiteSpace: 'nowrap', minWidth: '32px', textAlign: 'center' }}>
                            <Latex formula="\boldsymbol{N} =" />
                        </label>
                        <input
                            type="number"
                            className="input-mat251 placeholder-small"
                            placeholder="Población"
                            value={tamanoPoblacion}
                            onChange={(e) => { setTamanoPoblacion(e.target.value); resetDistribucion(); }}
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
                )}
            </div>

            <div id="tour-t4prop-btn-calcular" style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <button
                    type="button"
                    onClick={generarDistribucion}
                    className="button_calcular"
                    style={{
                        width: 'fit-content',
                        padding: '5px 20px',
                        borderRadius: RADIUS,
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontFamily: FONT,
                        fontSize: FS.md,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    CALCULAR
                </button>
            </div>

            {distribucionGenerada && (
                <>
                    {/* Tarjeta de Parámetros de la Distribución Muestral */}
                    <div id="tour-t4prop-parametros-estimados" style={{
                        background: 'var(--bg-card)',
                        padding: '14px 16px',
                        borderRadius: RADIUS,
                        border: 'none',
                        boxShadow: 'none',
                        textAlign: 'center',
                        marginTop: '10px',
                        marginBottom: '10px',
                        overflow: 'visible'
                    }}>
                        <div 
                            className="tema4-tarjeta-titulo-unificado" 
                            style={{
                                marginBottom: '10px',
                                color: 'var(--text-pure)',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                fontFamily: FONT,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            Parámetros de la Distribución Muestral
                        </div>
                        <div 
                            className="formula-responsive" 
                            style={{ 
                                overflow: 'visible',
                                padding: '4px',
                                color: 'var(--text-pure)',
                                fontWeight: 'normal',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px'
                            }}
                        >
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <StatLabel formulaKey="E_p_gorro" formulaLatex="E(\hat{p})" align="center" />
                                <Latex formula={`= p = ${datosParciales.p}`} />
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <StatLabel formulaKey="V_p_gorro" formulaLatex="V(\hat{p})" align="center" />
                                <Latex formula={
                                    tipoPoblacion === 'finita'
                                        ? `= \\frac{pq}{n} \\left( \\frac{N-n}{N-1} \\right) = \\frac{(${datosParciales.p})(${datosParciales.q})}{${datosParciales.n}} \\left( \\frac{${datosParciales.N} - ${datosParciales.n}}{${datosParciales.N} - 1} \\right) = ${parseFloat(datosParciales.varianza.toFixed(6))}`
                                        : `= \\frac{pq}{n} = \\frac{(${datosParciales.p})(${datosParciales.q})}{${datosParciales.n}} = \\frac{${parseFloat((datosParciales.p * datosParciales.q).toFixed(6))}}{${datosParciales.n}} = ${parseFloat(datosParciales.varianza.toFixed(6))}`
                                } />
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <StatLabel formulaKey="sigma_p_gorro" formulaLatex="\sigma_{\hat{p}}" align="center" />
                                <Latex formula={
                                    tipoPoblacion === 'finita'
                                        ? `= \\sqrt{\\frac{pq}{n}} \\sqrt{\\frac{N-n}{N-1}} = \\sqrt{${parseFloat(datosParciales.varianza.toFixed(6))}} = ${parseFloat(datosParciales.se.toFixed(4))}`
                                        : `= \\sqrt{\\frac{pq}{n}} = \\sqrt{${parseFloat(datosParciales.varianza.toFixed(6))}} = ${parseFloat(datosParciales.se.toFixed(4))}`
                                } />
                            </div>
                            <div className="formula-bold" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 'bold' }}>
                                <Latex formula={`\\mathbf{\\hat{p} \\sim N(${datosParciales.p} ; ${parseFloat(datosParciales.varianza.toFixed(6))})}`} />
                            </div>
                        </div>
                    </div>

                    {/* Sección Condición de Búsqueda (Molde exacto de Imagen 1) */}
                    <div id="tour-t4prop-condicion-busqueda">
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
                                    onChange={(val) => { 
                                        setCondicion(val); 
                                    }}
                                    options={[
                                        { value: 'menor_que', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}><Latex formula="P(\hat{p} \le x)" /></div> },
                                        { value: 'mayor_que', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}><Latex formula="P(\hat{p} \ge x)" /></div> },
                                        { value: 'entre', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}><Latex formula="P(x_1 \le \hat{p} \le x_2)" /></div> }
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
                                            step="any"
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
                                            step="any"
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
                                        step="any"
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

                    {/* Botón de cálculo / graficar */}
                    <div id="tour-t4prop-btn-graficar" style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                        <button
                            type="button"
                            onClick={calcularProbabilidad}
                            className="button_calcular"
                            style={{
                                width: 'fit-content',
                                padding: '5px 20px',
                                borderRadius: RADIUS,
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontFamily: FONT,
                                fontSize: FS.md,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            GRAFICAR
                        </button>
                    </div>
                </>
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