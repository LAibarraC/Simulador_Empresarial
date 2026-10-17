import React, { useState, useRef, useEffect } from 'react';
import { cardStyle, labelStyle, RADIUS, FS, FONT } from '../../../Principal/Constantes';
import Latex from '../../../../../components/excel/Latex';
import { generarDistribucionChiCuadrada, calcularProbabilidadChiCuadrada } from '../../../Matematicas/Logica_Tema4';
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

export default function Controles_ChiCuadrada({ onCalcular }) {
    // Inputs numéricos
    const [varianzaPoblacional, setVarianzaPoblacional] = useState(''); // sigma^2
    const [tamañoMuestra, setTamañoMuestra] = useState(''); // n
    const [tipoDispersion, setTipoDispersion] = useState('varianza'); // 'varianza' o 'desviacion'

    // Estado del proceso
    const [distribucionGenerada, setDistribucionGenerada] = useState(false);
    const [datosParciales, setDatosParciales] = useState(null);

    // Inputs de objetivo
    const [condicion, setCondicion] = useState('menor_que');
    const [valorX1, setValorX1] = useState('');
    const [valorX2, setValorX2] = useState(''); // solo si 'entre'

    // Modal de Alertas
    const [alertaModal, setAlertaModal] = useState({ isOpen: false, mensaje: '', tipo: 'warning' });

    // Paso 1: Generar Distribución
    const generarDistribucion = () => {
        const result = generarDistribucionChiCuadrada(varianzaPoblacional, tamañoMuestra, tipoDispersion);
        if (result.error) {
            setAlertaModal({ isOpen: true, mensaje: result.error, tipo: 'warning' });
            return;
        }

        const parciales = { ...result };
        delete parciales.error;
        
        setDatosParciales(parciales);
        setDistribucionGenerada(true);
        onCalcular(parciales);
    };

    // Paso 2: Calcular Probabilidad
    const calcularProbabilidad = () => {
        const result = calcularProbabilidadChiCuadrada(datosParciales, condicion, valorX1, valorX2);
        if (result.error) {
            if (result.error !== 'Faltan parámetros previos.') {
                setAlertaModal({ isOpen: true, mensaje: result.error, tipo: 'warning' });
            }
            return;
        }

        onCalcular({
            ...datosParciales,
            strDesarrollo: result.strDesarrollo,
            probFinal: result.probFinal,
            x1: result.x1,
            x2: result.x2,
            condicion: result.condicion
        });
    };

    const resetDistribucion = () => {
        setDistribucionGenerada(false);
        setDatosParciales(null);
        setCondicion('menor_que');
        setValorX1('');
        setValorX2('');
        onCalcular(null);
    };

    return (
        <div style={{ ...cardStyle, border: 'none', padding: '0', backgroundColor: 'transparent', marginTop: '10px' }}>
            {/* Inputs de Parámetros Base */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '90px', flexShrink: 0 }}>
                        <CustomSelect
                            value={tipoDispersion}
                            onChange={(val) => { setTipoDispersion(val); resetDistribucion(); }}
                            options={[
                                { value: 'varianza', label: <Latex formula="\boldsymbol{\sigma^2} =" /> },
                                { value: 'desviacion', label: <Latex formula="\boldsymbol{\sigma} =" /> }
                            ]}
                        />
                    </div>
                    <input
                        type="number"
                        className="input-mat251 placeholder-small"
                        placeholder={tipoDispersion === 'varianza' ? "Var. Pob." : "Desv. Est. Pob."}
                        value={varianzaPoblacional}
                        onChange={(e) => { setVarianzaPoblacional(e.target.value); resetDistribucion(); }}
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
                <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0, whiteSpace: 'nowrap', minWidth: '32px', textAlign: 'center' }}>
                        <Latex formula="\boldsymbol{n} =" />
                    </label>
                    <input
                        type="number"
                        className="input-mat251 placeholder-small"
                        placeholder="Muestra"
                        value={tamañoMuestra}
                        onChange={(e) => { setTamañoMuestra(e.target.value); resetDistribucion(); }}
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

            {/* Botón CALCULAR */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
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
                    <div style={{
                        background: 'transparent',
                        padding: '10px 0',
                        borderRadius: RADIUS,
                        border: 'none',
                        boxShadow: 'none',
                        textAlign: 'center',
                        marginTop: '10px',
                        marginBottom: '10px',
                        overflow: 'visible'
                    }}>
                        <div 
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
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '8px', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                overflow: 'visible', 
                                padding: '4px 0', 
                                color: 'var(--text-pure)' 
                            }}
                        >
                            {/* Fila 1: v */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <StatLabel
                                    formulaKey="v_grados_libertad"
                                    formulaLatex="v"
                                    customTexto="Grados de Libertad"
                                    customMath="v = n - 1"
                                    align="center"
                                />
                                <Latex formula={`= n - 1 = ${datosParciales.n} - 1 = \\mathbf{${datosParciales.k}}`} />
                            </div>

                            {/* Fila 2: E(S^2) */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <StatLabel
                                    formulaKey="E_s2_muestral"
                                    formulaLatex="E(S^2)"
                                    customTexto="Esperanza de la Varianza Muestral"
                                    customMath="E(S^2) = \sigma^2"
                                    align="center"
                                />
                                <Latex formula={`= \\sigma^2 = \\mathbf{${datosParciales.valDispStr}}`} />
                            </div>

                            {/* Fila 3: V(S^2) */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                <StatLabel
                                    formulaKey="Var_s2_muestral"
                                    formulaLatex="V(S^2)"
                                    customTexto="Varianza de la Varianza Muestral"
                                    customMath="V(S^2) = \frac{2\sigma^4}{n - 1}"
                                    align="center"
                                />
                                <Latex formula={`= \\frac{2\\sigma^4}{n - 1} = \\frac{2(${datosParciales.varPobStr})^2}{${datosParciales.k}} = \\mathbf{${datosParciales.varS2Str}}`} />
                            </div>

                            {/* Fila 4: Distribución del estadístico en negrilla completa */}
                            <div className="formula-bold" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '4px', fontWeight: 'bold' }}>
                                <Latex formula={`\\boldsymbol{\\frac{(n - 1)S^2}{\\sigma^2} \\sim \\chi^2_{(${datosParciales.k})}}`} />
                            </div>
                        </div>
                    </div>

                    {/* Sección Condición de Búsqueda */}
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
                                    { value: 'menor_que', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}><Latex formula="P(S^2 \le x)" /></div> },
                                    { value: 'mayor_que', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}><Latex formula="P(S^2 \ge x)" /></div> },
                                    { value: 'entre', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}><Latex formula="P(x_1 \le S^2 \le x_2)" /></div> }
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

                    {/* Botón de cálculo / graficar */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
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







