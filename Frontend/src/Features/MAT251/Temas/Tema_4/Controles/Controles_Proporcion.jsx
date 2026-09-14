import React, { useState } from 'react';
import { cardStyle, labelStyle, RADIUS, FS } from '../../../Principal/Constantes';
import Latex from '../../../../../components/excel/Latex';
import { IconoCalculadora } from '../../../../../ui/iconos';
import { generarDistribucionProporcion, calcularProbabilidadProporcion } from '../../../Matematicas/Logica_Tema4';

function cdfNormal(x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989422804 * Math.exp(-x * x / 2);
    let p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    if (x > 0) {
        p = 1 - p;
    }
    return p;
}

const CustomSelect = ({ value, onChange, options }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef(null);

    React.useEffect(() => {
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
        <div ref={dropdownRef} style={{ position: 'relative', width: '100%', fontSize: FS.sx }}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectedOption ? selectedOption.label : <span style={{ color: 'var(--text-muted)' }}>Seleccionar...</span>}
                </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease', color: 'var(--text-muted)', flexShrink: 0 }}>
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
                                setIsOpen(false);
                            }}
                            style={{
                                padding: '10px 12px', cursor: 'pointer',
                                background: value === opt.value ? 'var(--bg-app, #f8fafc)' : 'transparent',
                                color: value === opt.value ? 'var(--primary-color)' : 'var(--text-main)',
                                fontWeight: value === opt.value ? 600 : 400,
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                if (value !== opt.value) e.currentTarget.style.background = 'var(--bg-app, #f8fafc)';
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

export default function Controles_Proporcion({ onCalcular }) {
    const [tipoPoblacion, setTipoPoblacion] = useState('infinita');
    const [tamanoPoblacion, setTamanoPoblacion] = useState('');
    const [pPoblacional, setPPoblacional] = useState('');
    const [tamanoMuestra, setTamanoMuestra] = useState('');

    const [distribucionGenerada, setDistribucionGenerada] = useState(false);
    const [datosParciales, setDatosParciales] = useState(null);

    const [condicion, setCondicion] = useState('');
    const [valorX1, setValorX1] = useState('');
    const [valorX2, setValorX2] = useState('');

    const generarDistribucion = () => {
        const result = generarDistribucionProporcion(pPoblacional, tamanoMuestra, tamanoPoblacion, tipoPoblacion);
        if (result.error) {
            alert(result.error);
            return;
        }

        setDatosParciales(result.datosParciales);
        setDistribucionGenerada(true);
        setCondicion('');
        setValorX1('');
        setValorX2('');
        onCalcular(result.onCalcularData); 
    };

    const calcularProbabilidad = () => {
        const result = calcularProbabilidadProporcion(datosParciales, condicion, parseFloat(valorX1), parseFloat(valorX2));
        if (result.error) {
            alert(result.error);
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
        setCondicion('');
        setValorX1('');
        setValorX2('');
        onCalcular(null);
    };

    return (
        <div style={{ ...cardStyle, border: 'none', padding: '0', backgroundColor: 'transparent' }}>
            <div style={{ marginBottom: '15px', marginTop: '5px', textAlign: 'center' }}>
                <span style={labelStyle}>Tipo de Población</span>
                <div style={{ display: 'flex', width: 'fit-content', margin: '0 auto', background: 'var(--bg-input, #f1f5f9)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', height: '36px', boxSizing: 'border-box', marginTop: '5px' }}>
                    <button
                        type="button"
                        className={`btn-mat251-modo ${tipoPoblacion === 'infinita' ? 'active' : ''}`}
                        onClick={() => { setTipoPoblacion('infinita'); resetDistribucion(); }}
                        style={{ width: '150px' }}
                    >
                        Infinita
                    </button>
                    <button
                        type="button"
                        className={`btn-mat251-modo ${tipoPoblacion === 'finita' ? 'active' : ''}`}
                        onClick={() => { setTipoPoblacion('finita'); resetDistribucion(); }}
                        style={{ width: '150px' }}
                    >
                        Finita
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px', flex: '1 1 140px' }}>
                    <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, minWidth: '35px', textAlign: 'right' }}><Latex formula="p =" /></label>
                    <input
                        type="number"
                        placeholder="Prop. Pob."
                        value={pPoblacional}
                        onChange={(e) => { setPPoblacional(e.target.value); resetDistribucion(); }}
                        style={{ width: '100%', padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                </div>
                
                <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px', flex: '1 1 140px' }}>
                    <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, minWidth: '35px', textAlign: 'right' }}><Latex formula="n =" /></label>
                    <input
                        type="number"
                        placeholder="Muestra"
                        value={tamanoMuestra}
                        onChange={(e) => { setTamanoMuestra(e.target.value); resetDistribucion(); }}
                        style={{ width: '100%', padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                </div>

                {tipoPoblacion === 'finita' && (
                    <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px', flex: '1 1 140px' }}>
                        <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, minWidth: '35px', textAlign: 'right' }}><Latex formula="N =" /></label>
                        <input
                            type="number"
                            placeholder="Población"
                            value={tamanoPoblacion}
                            onChange={(e) => { setTamanoPoblacion(e.target.value); resetDistribucion(); }}
                            style={{ width: '100%', padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none' }}
                        />
                    </div>
                )}
            </div>
            <button onClick={generarDistribucion} className="button_calcular btn-icon" style={{ width: 'fit-content', margin: 'auto', padding: '5px 14px', borderRadius: RADIUS, cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >CALCULAR</button>

            {distribucionGenerada && (
                <div style={{ marginTop: '10px', animation: 'fadeIn 0.5s ease-out' }}>
                    <div style={{ background: 'var(--bg-app)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                        <div className="thin-scrollbar formula-responsive" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', overflowX: 'auto', paddingBottom: '5px' }}>
                            <Latex formula={`E(\\hat{p}) = p = ${Number(datosParciales.p.toFixed(5)).toString().replace('.', ',')}`} />
                            <Latex formula={`Var(\\hat{p}) = \\frac{pq}{n} = \\frac{${Number(datosParciales.p.toFixed(5)).toString().replace('.', ',')} * ${Number(datosParciales.q.toFixed(5)).toString().replace('.', ',')}}{${datosParciales.n}} ${datosParciales.factorStr ? datosParciales.factorStr : ''} = ${datosParciales.factorStr ? '' : `\\frac{${Number((datosParciales.p * datosParciales.q).toFixed(6)).toString().replace('.', ',')}}{${datosParciales.n}} = `}${Number(datosParciales.varianza.toFixed(6)).toString().replace('.', ',')}`} />
                            <Latex formula={`\\hat{p} \\underset{n=${datosParciales.n}}{\\longrightarrow} N(${Number(datosParciales.p.toFixed(5)).toString().replace('.', ',')} ; ${Number(datosParciales.varianza.toFixed(6)).toString().replace('.', ',')})`} />
                        </div>
                    </div>

                    <h3 style={{ color: 'var(--primary-color)', fontSize: FS.md, margin: '15px 0' }}>
                        Tipo de Condición
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'end' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <CustomSelect
                                value={condicion}
                                onChange={(val) => { setCondicion(val); }}
                                options={[
                                    { value: 'menor_que', label: <Latex formula="P(\hat{p} < x)" /> },
                                    { value: 'mayor_que', label: <Latex formula="P(\hat{p} > x)" /> },
                                    { value: 'entre', label: <Latex formula="P(x_1 < \hat{p} < x_2)" /> }
                                ]}
                            />
                        </div>

                        {condicion && (
                            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {condicion === 'entre' ? (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                                            <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0 }}><Latex formula="x_1 =" /></label>
                                            <input
                                                type="number" step="0.01"
                                                placeholder="Valor"
                                                value={valorX1}
                                                onChange={(e) => { setValorX1(e.target.value); }}
                                                style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none', width: '100%', minWidth: 0 }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                                            <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0 }}><Latex formula="x_2 =" /></label>
                                            <input
                                                type="number" step="0.01"
                                                placeholder="Valor"
                                                value={valorX2}
                                                onChange={(e) => { setValorX2(e.target.value); }}
                                                style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none', width: '100%', minWidth: 0 }}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0 }}><Latex formula="x =" /></label>
                                        <input
                                            type="number"
                                            placeholder="Valor"
                                            value={valorX1}
                                            onChange={(e) => { setValorX1(e.target.value); }}
                                            style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none', width: '100%' }}
                                        />
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {condicion && (
                        <button onClick={calcularProbabilidad} className="button_calcular btn-icon" style={{ width: 'fit-content', margin: 'auto', padding: '5px 14px', borderRadius: RADIUS, cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        GRAFICAR
                    </button>
                    )}
                </div>
            )}
        </div>
    );
}