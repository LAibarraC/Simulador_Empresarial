import React, { useState } from 'react';
import { cardStyle, labelStyle, RADIUS, FS } from '../../../Principal/Constantes';
import Latex from '../../../../../components/excel/Latex';
import { IconoCalculadora } from '../../../../../ui/iconos';
import { generarDistribucionStudent, calcularProbabilidadStudent } from '../../../Matematicas/Logica_Tema4';
import { jStat } from 'jstat';

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

export default function Controles_Student({ onCalcular }) {
    const [mu, setMu] = useState('');
    const [s, setS] = useState('');
    const [n, setN] = useState('');

    const [distribucionGenerada, setDistribucionGenerada] = useState(false);
    const [datosParciales, setDatosParciales] = useState(null);

    const [condicion, setCondicion] = useState('');
    const [valorX1, setValorX1] = useState('');
    const [valorX2, setValorX2] = useState('');

    const formatNumber = (num, minDec = 0, maxDec = 3) => {
        return num.toLocaleString('es-ES', { minimumFractionDigits: minDec, maximumFractionDigits: maxDec }).replace(/,/g, '{,}');
    };

    const generarDistribucion = () => {
        const result = generarDistribucionStudent(mu, s, n);
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
        onCalcular(parciales); 
    };

    const calcularProbabilidad = () => {
        const result = calcularProbabilidadStudent(datosParciales, condicion, valorX1, valorX2);
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {/* Fila 1: μ y S */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '15px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, width: 'fit-content' }}><Latex formula="\mu =" /></label>
                        <input
                            type="number"
                            placeholder="Media Pob."
                            value={mu}
                            onChange={(e) => { setMu(e.target.value); resetDistribucion(); }}
                            style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none', minWidth: 0, boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, width: 'fit-content' }}><Latex formula="S =" /></label>
                        <input
                            type="number"
                            placeholder="Desv. Est. Muestral"
                            value={s}
                            onChange={(e) => { setS(e.target.value); resetDistribucion(); }}
                            style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none', minWidth: 0, boxSizing: 'border-box' }}
                        />
                    </div>
                </div>
                {/* Fila 2: n centrado */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '50%' }}>
                        <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, width: 'fit-content' }}><Latex formula="n =" /></label>
                        <input
                            type="number"
                            placeholder="Muestra"
                            value={n}
                            onChange={(e) => { setN(e.target.value); resetDistribucion(); }}
                            style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none', minWidth: 0, boxSizing: 'border-box' }}
                        />
                    </div>
                </div>
            </div>

            <button onClick={generarDistribucion} className="button_calcular btn-icon" style={{ width: 'fit-content', margin: '15px auto 0px', padding: '5px 14px', borderRadius: RADIUS, cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >CALCULAR</button>

            {distribucionGenerada && (
                <div style={{ marginTop: '15px', animation: 'fadeIn 0.5s ease-out' }}>
                    <div style={{ background: 'var(--bg-app)', padding: '10px', borderRadius: RADIUS, border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: FS.sm, color: 'var(--text-main)', textAlign: 'center' }}>Parámetros t-Student</h4>
                        <div className="thin-scrollbar formula-responsive" style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowX: 'auto', paddingBottom: '5px', alignItems: 'center' }}>
                            <Latex formula={`\\begin{aligned} v &= n - 1 = ${datosParciales.n} - 1 = ${datosParciales.v} \\\\ E(\\bar{X}) &= \\mu = ${formatNumber(datosParciales.mu)} \\end{aligned}`} />
                        </div>
                    </div>

                    <div style={{ background: 'transparent', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', marginBottom: '15px' }}>
                        <label style={{ ...labelStyle, display: 'block', marginBottom: '10px' }}>Condición a Calcular</label>
                        <div style={{ display: 'grid', gridTemplateColumns: condicion ? '1fr 1fr' : '1fr', gap: '15px', alignItems: 'start' }}>
                            <div>
                                <CustomSelect
                                    value={condicion}
                                    onChange={(val) => { setCondicion(val); }}
                                    options={[
                                        { value: 'menor_que', label: <Latex formula="P(\bar{X} \le x)" /> },
                                        { value: 'mayor_que', label: <Latex formula="P(\bar{X} \ge x)" /> },
                                        { value: 'entre', label: <Latex formula="P(x_1 \le \bar{X} \le x_2)" /> }
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
                        <button onClick={calcularProbabilidad} className="button_calcular btn-icon" style={{ width: 'fit-content', margin: '0px auto 0', padding: '5px 15px', borderRadius: RADIUS, cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                            GRAFICAR
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}







