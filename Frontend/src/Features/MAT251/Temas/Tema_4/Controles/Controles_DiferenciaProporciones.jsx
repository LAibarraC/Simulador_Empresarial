import React, { useState, useRef, useEffect } from 'react';
import { cardStyle, labelStyle, RADIUS, FS, FONT } from '../../../Principal/Constantes';
import Latex from '../../../../../components/excel/Latex';
import { generarDistribucionDiferenciaProporciones, calcularProbabilidadDiferenciaProporciones } from '../../../Matematicas/Logica_Tema4';
import ModalAlerta from '../../../ui/ModalAlerta';
import StatLabel from '../../../ui/StatLabel';
import '../../../styles/Temas/Tema3.css';
import '../../../styles/Temas/Tema4.css';

const formatMathNumber = (value, digits = 6) => {
    const number = Number(value);
    if (!Number.isFinite(number)) return String(value);
    return number.toFixed(digits).replace(/(\.\d*?[1-9])0+$|\.0+$/, '$1');
};

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

export default function Controles_DiferenciaProporciones({ onCalcular }) {
    // Muestra 1
    const [p1, setP1] = useState('');
    const [n1, setN1] = useState('');

    // Muestra 2
    const [p2, setP2] = useState('');
    const [n2, setN2] = useState('');

    const [condicion, setCondicion] = useState('menor_que');
    const [valorX1, setValorX1] = useState('');
    const [valorX2, setValorX2] = useState('');
    
    // Estado para guardar los parámetros calculados antes de graficar
    const [parametrosPrevios, setParametrosPrevios] = useState(null);

    // Alertas
    const [alertaModal, setAlertaModal] = useState({ isOpen: false, mensaje: '', tipo: 'warning' });

    const resetValues = () => {
        setParametrosPrevios(null);
        setCondicion('menor_que');
        setValorX1('');
        setValorX2('');
        onCalcular(null);
    };

    const calcularParametros = () => {
        const result = generarDistribucionDiferenciaProporciones(p1, n1, p2, n2);
        if (result.error) {
            setAlertaModal({ isOpen: true, mensaje: result.error, tipo: 'warning' });
            return;
        }
        setParametrosPrevios(result);
        setCondicion('menor_que');
        setValorX1('');
        setValorX2('');
        onCalcular(result);
    };

    const calcular = () => {
        const result = calcularProbabilidadDiferenciaProporciones(parametrosPrevios, condicion, valorX1, valorX2);
        if (result.error) {
            if (result.error !== 'Faltan parámetros previos.') {
                setAlertaModal({ isOpen: true, mensaje: result.error, tipo: 'warning' });
            }
            return;
        }

        onCalcular(result);
    };

    const mostrarDistribucionBase = () => {
        // Mantiene visible la curva al editar límites y descarta la probabilidad anterior.
        onCalcular(parametrosPrevios);
    };

    return (
        <div style={{ ...cardStyle, border: 'none', padding: '0', backgroundColor: 'transparent' }}>
            <div className="tema4-population-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px' }}>
                {/* Muestra 1 */}
                <div className="tema4-population-card" style={{ background: 'var(--bg-card)', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: FS.sm, color: 'var(--text-pure)', fontWeight: 700, fontFamily: FONT }}>MUESTRA 1</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0, minWidth: '35px', whiteSpace: 'nowrap' }}><Latex formula="\boldsymbol{p_1} =" /></label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                className="input-mat251 placeholder-small"
                                placeholder="Prop. Pob. 1"
                                value={p1}
                                onChange={(e) => { setP1(e.target.value); resetValues(); }}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0, minWidth: '35px', whiteSpace: 'nowrap' }}><Latex formula="\boldsymbol{n_1} =" /></label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                placeholder="Muestra 1"
                                value={n1}
                                onChange={(e) => { setN1(e.target.value); resetValues(); }}
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

                {/* Muestra 2 */}
                <div className="tema4-population-card" style={{ background: 'var(--bg-card)', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)', minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: FS.sm, color: 'var(--text-pure)', fontWeight: 700, fontFamily: FONT }}>MUESTRA 2</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0, minWidth: '35px', whiteSpace: 'nowrap' }}><Latex formula="\boldsymbol{p_2} =" /></label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="1"
                                className="input-mat251 placeholder-small"
                                placeholder="Prop. Pob. 2"
                                value={p2}
                                onChange={(e) => { setP2(e.target.value); resetValues(); }}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0, minWidth: '35px', whiteSpace: 'nowrap' }}><Latex formula="\boldsymbol{n_2} =" /></label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                placeholder="Muestra 2"
                                value={n2}
                                onChange={(e) => { setN2(e.target.value); resetValues(); }}
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
            </div>

            {!parametrosPrevios ? (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px', marginBottom: '10px' }}>
                    <button
                        onClick={calcularParametros}
                        className="button_calcular"
                        style={{ width: 'fit-content', padding: '5px 20px', borderRadius: RADIUS, cursor: 'pointer', fontWeight: 600, fontFamily: FONT, fontSize: FS.md, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        CALCULAR
                    </button>
                </div>
            ) : (
                <>
                    {/* Parámetros Previos */}
                    <div className="tema4-difference-calculation-card" style={{ background: 'var(--bg-card)', padding: '14px 16px', borderRadius: RADIUS, border: 'none', boxShadow: 'none', marginTop: '10px', marginBottom: '10px', textAlign: 'center' }}>
                        <div className="tema4-tarjeta-titulo-unificado" style={{ color: 'var(--text-pure)', fontSize: '0.8rem', marginBottom: '10px', fontWeight: 700, fontFamily: FONT }}>
                            Parámetros de la Diferencia de Proporciones
                        </div>
                        <div className="thin-scrollbar formula-responsive tema4-difference-calculation-summary" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', overflow: 'visible', paddingBottom: '4px', alignItems: 'center', color: 'var(--text-pure)' }}>
                            <div className="tema4-difference-calculation-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                                <StatLabel formulaKey="E_dif_proporciones" formulaLatex="E(\hat{p}_1 - \hat{p}_2)" align="center" />
                                <Latex formula={`= p_1 - p_2 = ${formatMathNumber(parametrosPrevios.prop1)} - ${formatMathNumber(parametrosPrevios.prop2)} = ${parametrosPrevios.esperanza.toFixed(5)}`} />
                            </div>
                            <div className="tema4-difference-calculation-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                                <StatLabel formulaKey="V_dif_proporciones" formulaLatex="V(\hat{p}_1 - \hat{p}_2)" align="center" />
                                <Latex formula={`= \\frac{p_1q_1}{n_1} + \\frac{p_2q_2}{n_2} = \\frac{(${formatMathNumber(parametrosPrevios.prop1)})(${formatMathNumber(parametrosPrevios.q1)})}{${parametrosPrevios.num1}} + \\frac{(${formatMathNumber(parametrosPrevios.prop2)})(${formatMathNumber(parametrosPrevios.q2)})}{${parametrosPrevios.num2}} = ${parametrosPrevios.varianza.toFixed(6)}`} />
                            </div>
                            <div className="tema4-difference-calculation-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                                <StatLabel formulaKey="sigma_dif_proporciones" formulaLatex="\sigma_{\hat{p}_1 - \hat{p}_2}" align="center" />
                                <Latex formula={`= \\sqrt{V(\\hat{p}_1 - \\hat{p}_2)} = \\sqrt{${parametrosPrevios.varianza.toFixed(6)}} = ${Math.sqrt(parametrosPrevios.varianza).toFixed(6)}`} />
                            </div>
                            <div className="formula-bold tema4-difference-calculation-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%', flexWrap: 'nowrap', whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                                <Latex formula={`\\mathbf{\\hat{p}_1 - \\hat{p}_2 \\cong N(${parametrosPrevios.esperanza.toFixed(5)}; ${parametrosPrevios.varianza.toFixed(6)})}`} />
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
                        <div className="tema4-condicion-select-wrapper" style={{ width: condicion === 'entre' ? '250px' : '200px' }}>
                            <CustomSelect
                                value={condicion}
                                onChange={(val) => { setCondicion(val); mostrarDistribucionBase(); }}
                                options={[
                                    { value: 'menor_que', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}><Latex formula="P(\hat{p}_1 - \hat{p}_2 \le x)" /></div> },
                                    { value: 'mayor_que', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}><Latex formula="P(\hat{p}_1 - \hat{p}_2 \ge x)" /></div> },
                                    { value: 'entre', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}><Latex formula="P(x_1 \le \hat{p}_1 - \hat{p}_2 \le x_2)" /></div> }
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
                                        step="0.01"
                                        className="input-mat251 placeholder-small"
                                        placeholder="Límite inferior"
                                        value={valorX1}
                                        onChange={(e) => { setValorX1(e.target.value); mostrarDistribucionBase(); }}
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
                                        step="0.01"
                                        className="input-mat251 placeholder-small"
                                        placeholder="Límite superior"
                                        value={valorX2}
                                        onChange={(e) => { setValorX2(e.target.value); mostrarDistribucionBase(); }}
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
                                    step="0.01"
                                    className="input-mat251 placeholder-small"
                                    placeholder="Valor x"
                                    value={valorX1}
                                    onChange={(e) => { setValorX1(e.target.value); mostrarDistribucionBase(); }}
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

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                        <button
                            onClick={calcular}
                            className="button_calcular"
                            style={{ width: 'fit-content', padding: '5px 20px', borderRadius: RADIUS, cursor: 'pointer', fontWeight: 600, fontFamily: FONT, fontSize: FS.md, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
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
