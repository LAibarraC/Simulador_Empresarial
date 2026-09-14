import React, { useState } from 'react';
import { jStat } from 'jstat';
import { cardStyle, labelStyle, RADIUS, FS } from '../../../Principal/Constantes';
import Latex from '../../../../../components/excel/Latex';
import { IconoCalculadora } from '../../../../../ui/iconos';
import { generarDistribucionDiferenciaProporciones, calcularProbabilidadDiferenciaProporciones } from '../../../Matematicas/Logica_Tema4';

const CustomSelect = ({ value, onChange, options }) => {
    const [isOpen, React_useState] = React.useState(false);
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                React_useState(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div ref={dropdownRef} style={{ position: 'relative', width: '100%', fontSize: FS.sx }}>
            <div 
                onClick={() => React_useState(!isOpen)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--bg-card)',
                    border: `1px solid ${isOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    borderRadius: RADIUS, cursor: 'pointer',
                    boxShadow: isOpen ? '0 0 0 3px rgba(0,123,255,0.15)' : 'none',
                    transition: 'all 0.2s ease',
                    color: 'var(--text-main)',
                    userSelect: 'none',
                    height: '35px',
                    boxSizing: 'border-box'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {selectedOption ? selectedOption.label : <span style={{ color: 'var(--text-muted)' }}>-- Seleccionar --</span>}
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '8px' }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </div>
            {isOpen && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    marginTop: '4px', background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)', borderRadius: RADIUS,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100,
                    overflow: 'hidden'
                }}>
                    {options.map((opt) => (
                        <div 
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                React_useState(false);
                            }}
                            style={{
                                padding: '10px 12px', cursor: 'pointer',
                                background: value === opt.value ? 'var(--bg-app, transparent)' : 'transparent',
                                color: value === opt.value ? 'var(--primary-color)' : 'var(--text-main)',
                                fontWeight: value === opt.value ? 600 : 400,
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                if (value !== opt.value) e.currentTarget.style.background = 'var(--bg-input, rgba(0,0,0,0.05))';
                            }}
                            onMouseLeave={(e) => {
                                if (value !== opt.value) e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            {opt.label}
                        </div>
                    ))}
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

    const resetValues = () => {
        setParametrosPrevios(null);
        onCalcular(null);
    };

    const calcularParametros = () => {
        const result = generarDistribucionDiferenciaProporciones(p1, n1, p2, n2);
        if (result.error) {
            alert(result.error);
            return;
        }
        setParametrosPrevios(result);
    };

    const calcular = () => {
        const result = calcularProbabilidadDiferenciaProporciones(parametrosPrevios, condicion, valorX1, valorX2);
        if (result.error) {
            if (result.error !== 'Faltan parámetros previos.') alert(result.error);
            return;
        }

        onCalcular(result);
    };

    return (
        <div style={{ ...cardStyle, border: 'none', padding: '0', backgroundColor: 'transparent' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Muestra 1 */}
                <div style={{ background: 'var(--bg-app)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: FS.sm, color: 'var(--text-main)' }}>Muestra 1</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, minWidth: '35px' }}><Latex formula="p_1 =" /></label>
                            <input type="number" step="0.01" min="0" max="1" placeholder="Prop. Pob. 1" value={p1} onChange={(e) => { setP1(e.target.value); resetValues(); }} style={{ width: '100%', padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, minWidth: '35px' }}><Latex formula="n_1 =" /></label>
                            <input type="number" placeholder="Muestra 1" value={n1} onChange={(e) => { setN1(e.target.value); resetValues(); }} style={{ width: '100%', padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none' }} />
                        </div>
                    </div>
                </div>

                {/* Muestra 2 */}
                <div style={{ background: 'var(--bg-app)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                    <h4 style={{ margin: '0 0 15px 0', fontSize: FS.sm, color: 'var(--text-main)' }}>Muestra 2</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, minWidth: '35px' }}><Latex formula="p_2 =" /></label>
                            <input type="number" step="0.01" min="0" max="1" placeholder="Prop. Pob. 2" value={p2} onChange={(e) => { setP2(e.target.value); resetValues(); }} style={{ width: '100%', padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, minWidth: '35px' }}><Latex formula="n_2 =" /></label>
                            <input type="number" placeholder="Muestra 2" value={n2} onChange={(e) => { setN2(e.target.value); resetValues(); }} style={{ width: '100%', padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none' }} />
                        </div>
                    </div>
                </div>
            </div>

            {!parametrosPrevios ? (
                <button onClick={calcularParametros} className="button_calcular btn-icon" style={{ width: 'fit-content', margin: '20px auto 0', padding: '10px 40px', borderRadius: RADIUS, cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >CALCULAR</button>
            ) : (
                <>
                    {/* Parámetros Calculados */}
                    <div style={{ background: 'var(--bg-app)', padding: '20px', borderRadius: RADIUS, border: '1px solid var(--border-color)', marginBottom: '20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                            <Latex formula={`E(\\hat{p}_1 - \\hat{p}_2) = ${parametrosPrevios.prop1} - ${parametrosPrevios.prop2} = ${parametrosPrevios.esperanza.toFixed(2)}`} />
                            <Latex formula={`Var(\\hat{p}_1 - \\hat{p}_2) = \\frac{p_1 q_1}{n_1} + \\frac{p_2 q_2}{n_2} = ${parametrosPrevios.varianza.toFixed(5)}`} />
                            <Latex formula={`\\hat{p}_1 - \\hat{p}_2 \\cong N(${parametrosPrevios.esperanza.toFixed(2)}; ${parametrosPrevios.varianza.toFixed(5)})`} />
                        </div>
                    </div>

                    {/* Condición a Calcular */}
                    <div style={{ background: 'transparent', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', marginBottom: '15px' }}>
                        <label style={{ ...labelStyle, display: 'block', marginBottom: '10px' }}>Condición a Calcular</label>
                        <div style={{ display: 'grid', gridTemplateColumns: condicion ? '1fr 1fr' : '1fr', gap: '15px', alignItems: 'start' }}>
                            <div>
                                <CustomSelect
                                    value={condicion}
                                    onChange={(val) => { setCondicion(val); onCalcular(null); }}
                                    options={[
                                        { value: 'menor_que', label: <Latex formula="P(\hat{p}_1 - \hat{p}_2 \le x)" /> },
                                        { value: 'mayor_que', label: <Latex formula="P(\hat{p}_1 - \hat{p}_2 \ge x)" /> },
                                        { value: 'entre', label: <Latex formula="P(x_1 \le \hat{p}_1 - \hat{p}_2 \le x_2)" /> }
                                    ]}
                                />
                            </div>

                            {condicion && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {condicion === 'entre' ? (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                                                <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0 }}><Latex formula="x_1 =" /></label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Valor"
                                                    value={valorX1}
                                                    onChange={(e) => { setValorX1(e.target.value); onCalcular(null); }}
                                                    style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none', width: '100%', minWidth: 0 }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                                                <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0 }}><Latex formula="x_2 =" /></label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="Prop. Pob. 1"
                                                    value={valorX2}
                                                    onChange={(e) => { setValorX2(e.target.value); onCalcular(null); }}
                                                    style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none', width: '100%', minWidth: 0 }}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0 }}><Latex formula="x =" /></label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Valor"
                                                value={valorX1}
                                                onChange={(e) => { setValorX1(e.target.value); onCalcular(null); }}
                                                style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none', width: '100%' }}
                                            />
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <button onClick={calcular} className="button_calcular btn-icon" style={{ width: 'fit-content', margin: '0 auto', padding: '10px 40px', borderRadius: RADIUS, cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        Graficar
                    </button>
                </>
            )}
        </div>
    );
}







