import React, { useState } from 'react';
import { cardStyle, labelStyle, RADIUS, FS } from '../../../Principal/Constantes';
import Latex from '../../../../../components/excel/Latex';
import { IconoCalculadora } from '../../../../../ui/iconos';
import { generarDistribucionDiferenciaMedias, calcularProbabilidadDiferenciaMedias } from '../../../Matematicas/Logica_Tema4';



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
                    {selectedOption ? selectedOption.label : <span style={{ color: 'var(--text-muted)' }}>-- Selecciona una Condición --</span>}
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

export default function Controles_DiferenciaMedias({ onCalcular }) {
    // Poblacion 1
    const [mu1, setMu1] = useState('');
    const [sigma1, setSigma1] = useState('');
    const [n1, setN1] = useState('');

    // Poblacion 2
    const [mu2, setMu2] = useState('');
    const [sigma2, setSigma2] = useState('');
    const [n2, setN2] = useState('');

    const [distribucionGenerada, setDistribucionGenerada] = useState(false);
    const [datosParciales, setDatosParciales] = useState(null);

    const [condicion, setCondicion] = useState('');
    const [valorX1, setValorX1] = useState('');
    const [valorX2, setValorX2] = useState('');

    const generarDistribucion = () => {
        const result = generarDistribucionDiferenciaMedias(mu1, sigma1, n1, mu2, sigma2, n2);
        if (result.error) {
            alert(result.error);
            return;
        }

        const parciales = { ...result };
        delete parciales.error;

        setDatosParciales(parciales);
        setDistribucionGenerada(true);
        setCondicion('');
        setValorX1('');
        setValorX2('');
        onCalcular({ p: result.esperanza, se: result.se });
    };

    const calcularProbabilidad = () => {
        const result = calcularProbabilidadDiferenciaMedias(datosParciales, condicion, valorX1, valorX2);
        if (result.error) {
            if (result.error !== 'Faltan parámetros previos.') alert(result.error);
            return;
        }

        onCalcular({
            ...datosParciales,
            strDesarrollo: result.strDesarrollo,
            probFinal: result.probFinal,
            x1: result.x1,
            x2: result.x2,
            condicion: result.condicion,
            p: result.p,
            se: result.se
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
        <div style={{ ...cardStyle, border: 'none', padding: '0', backgroundColor: 'transparent', marginTop: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '15px' }}>
                {/* Población 1 */}
                <div style={{ background: 'var(--bg-app)', padding: '10px', borderRadius: RADIUS, border: '1px solid var(--border-color)', minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: FS.sm, color: 'var(--primary-color)' }}>
                        Población 1 (<span style={{ display: 'inline-block' }}><Latex formula="X" /></span>)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, width: 'fit-content' }}><Latex formula="\mu_X =" /></label>
                            <input
                                type="number"
                                placeholder="Media Pob. X"
                                value={mu1}
                                onChange={(e) => { setMu1(e.target.value); resetDistribucion(); }}
                                style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none', minWidth: 0, width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, width: 'fit-content' }}><Latex formula="\sigma_X =" /></label>
                            <input
                                type="number"
                                placeholder="Desv. Est. Pob. X"
                                value={sigma1}
                                onChange={(e) => { setSigma1(e.target.value); resetDistribucion(); }}
                                style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none', minWidth: 0, width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, width: 'fit-content' }}><Latex formula="n_X =" /></label>
                            <input
                                type="number"
                                placeholder="Muestra X"
                                value={n1}
                                onChange={(e) => { setN1(e.target.value); resetDistribucion(); }}
                                style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none', minWidth: 0, width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Población 2 */}
                <div style={{ background: 'var(--bg-app)', padding: '10px', borderRadius: RADIUS, border: '1px solid var(--border-color)', minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: FS.sm, color: 'var(--primary-color)' }}>
                        Población 2 (<span style={{ display: 'inline-block' }}><Latex formula="Y" /></span>)
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, width: 'fit-content' }}><Latex formula="\mu_Y =" /></label>
                            <input
                                type="number"
                                placeholder="Media Pob. Y"
                                value={mu2}
                                onChange={(e) => { setMu2(e.target.value); resetDistribucion(); }}
                                style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none', minWidth: 0, width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, width: 'fit-content' }}><Latex formula="\sigma_Y =" /></label>
                            <input
                                type="number"
                                placeholder="Desv. Est. Pob. Y"
                                value={sigma2}
                                onChange={(e) => { setSigma2(e.target.value); resetDistribucion(); }}
                                style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none', minWidth: 0, width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, width: 'fit-content' }}><Latex formula="n_Y =" /></label>
                            <input
                                type="number"
                                placeholder="Muestra Y"
                                value={n2}
                                onChange={(e) => { setN2(e.target.value); resetDistribucion(); }}
                                style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none', minWidth: 0, width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={generarDistribucion} className="button_calcular btn-icon" style={{ width: 'fit-content', marginTop: '15px', margin: 'auto', padding: '5px 15px', borderRadius: RADIUS, cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >CALCULAR</button>

            {distribucionGenerada && (
                <div style={{ marginTop: '10px', animation: 'fadeIn 0.5s ease-out' }}>
                    <div style={{ background: 'var(--bg-app)', padding: '10px', borderRadius: RADIUS, border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: FS.sm, color: 'var(--text-main)', textAlign: 'center' }}>Parámetros Combinados</h4>
                        <div className="thin-scrollbar formula-responsive" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', overflowX: 'auto', paddingBottom: '5px' }}>
                            <Latex formula={`E(\\bar{X} - \\bar{Y}) = \\mu_X - \\mu_Y = ${datosParciales.m1.toLocaleString('es-ES')} - ${datosParciales.m2.toLocaleString('es-ES')} = ${datosParciales.esperanza.toLocaleString('es-ES')}`} />
                            <Latex formula={`Var(\\bar{X} - \\bar{Y}) = \\frac{\\sigma_X^2}{n_X} + \\frac{\\sigma_Y^2}{n_Y} = \\frac{${datosParciales.s1.toLocaleString('es-ES')}^2}{${datosParciales.nn1}} + \\frac{${datosParciales.s2.toLocaleString('es-ES')}^2}{${datosParciales.nn2}} = ${datosParciales.varFracDen === 1 ? datosParciales.varFracNum : `\\frac{${datosParciales.varFracNum}}{${datosParciales.varFracDen}}`}`} />
                            <Latex formula={`\\bar{X} - \\bar{Y} \\sim N\\left(${datosParciales.esperanza.toLocaleString('es-ES').replace(',', '{,}')} ; ${datosParciales.varFracDen === 1 ? datosParciales.varFracNum : `\\frac{${datosParciales.varFracNum}}{${datosParciales.varFracDen}}`}\\right)`} />
                        </div>
                    </div>

                    <div style={{ background: 'transparent', padding: '10px', borderRadius: RADIUS, border: '1px solid var(--border-color)', marginBottom: '10px' }}>
                        <label style={{ ...labelStyle, display: 'block', marginBottom: '10px' }}>Condición a Calcular</label>
                        <div style={{ display: 'grid', gridTemplateColumns: condicion ? '1fr 1fr' : '1fr', gap: '15px', alignItems: 'start' }}>
                            <div>
                                <CustomSelect
                                    value={condicion}
                                    onChange={(val) => { setCondicion(val); }}
                                    options={[
                                        { value: 'menor_que', label: <Latex formula="P(\bar{X} - \bar{Y} \le x)" /> },
                                        { value: 'mayor_que', label: <Latex formula="P(\bar{X} - \bar{Y} \ge x)" /> },
                                        { value: 'entre', label: <Latex formula="P(x_1 \le \bar{X} - \bar{Y} \le x_2)" /> }
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
                                                    placeholder="Valor"
                                                    value={valorX1}
                                                    onChange={(e) => { setValorX1(e.target.value); }}
                                                    style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none', width: '100%', minWidth: 0 }}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                                                <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0 }}><Latex formula="x_2 =" /></label>
                                                <input
                                                    type="number"
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







