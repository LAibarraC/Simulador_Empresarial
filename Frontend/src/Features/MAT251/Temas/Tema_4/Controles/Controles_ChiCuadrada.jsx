import React, { useState } from 'react';
import { jStat } from 'jstat';
import { cardStyle, labelStyle, RADIUS, FS } from '../../../Principal/Constantes';
import Latex from '../../../../../components/excel/Latex';
import { IconoCalculadora } from '../../../../../ui/iconos';
import { generarDistribucionChiCuadrada, calcularProbabilidadChiCuadrada } from '../../../Matematicas/Logica_Tema4';

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
                            onMouseEnter={(e) => { if (value !== opt.value) e.currentTarget.style.background = 'var(--bg-app, #f8fafc)'; }}
                            onMouseLeave={(e) => { if (value !== opt.value) e.currentTarget.style.background = 'transparent'; }}
                        >
                            {opt.label}
                        </div>
                    ))}
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
    const [condicion, setCondicion] = useState(''); // '', 'menor_que', 'mayor_que', 'entre'
    const [valorX1, setValorX1] = useState('');
    const [valorX2, setValorX2] = useState(''); // solo si 'entre'

    const formatLatexNum = (num) => {
        return num.toLocaleString('es-ES', { maximumFractionDigits: 4 }).replace(',', '{,}');
    };

    // Paso 1: Generar Distribución
    const generarDistribucion = () => {
        const result = generarDistribucionChiCuadrada(varianzaPoblacional, tamañoMuestra, tipoDispersion);
        if (result.error) {
            alert(result.error);
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
        <div style={{ ...cardStyle, border: 'none', padding: '0', backgroundColor: 'transparent', marginTop: '20px' }}>


            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <select
                        value={tipoDispersion}
                        onChange={(e) => { setTipoDispersion(e.target.value); resetDistribucion(); }}
                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', outline: 'none', fontWeight: 'bold' }}
                        title="Cambiar entre Varianza y Desviación Estándar"
                    >
                        <option value="varianza">σ² =</option>
                        <option value="desviacion">σ =</option>
                    </select>
                    <input
                        type="number"
                        placeholder={tipoDispersion === 'varianza' ? "Var. Pob." : "Desv. Est. Pob."}
                        value={varianzaPoblacional}
                        onChange={(e) => { setVarianzaPoblacional(e.target.value); resetDistribucion(); }}
                        style={{ width: '100%', padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                </div>
                <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0 }}><Latex formula="n =" /></label>
                    <input
                        type="number"
                        placeholder="Muestra"
                        value={tamañoMuestra}
                        onChange={(e) => { setTamañoMuestra(e.target.value); resetDistribucion(); }}
                        style={{ width: '100%', padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none' }}
                    />
                </div>
            </div>

            <button onClick={generarDistribucion} className="button_calcular btn-icon" style={{ width: 'fit-content', margin: 'auto', padding: '4px 15px', borderRadius: RADIUS, cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >CALCULAR</button>

            {distribucionGenerada && (
                <>
                    <div style={{ background: 'transparent', padding: '10px', borderRadius: RADIUS, border: '1px solid var(--border-color)', textAlign: 'center', marginBottom: '5px', marginTop: '10px'}}>
                        <div style={{ marginBottom: '15px', color: 'var(--text-muted)', fontSize: FS.sm }}>Parámetros de la Distribución</div>
                        <div className="thin-scrollbar formula-responsive" style={{ overflowX: 'auto', paddingBottom: '10px' }}>
                            <Latex formula={datosParciales.parametrosStr} />
                        </div>
                    </div>

                    <h3 style={{ color: 'var(--primary-color)', fontSize: FS.md, margin: '15px 0' }}>
                        Condición a Calcular
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'end' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={labelStyle}>Tipo de Condición</label>
                            <CustomSelect
                                value={condicion}
                                onChange={(val) => { setCondicion(val); }}
                                options={[
                                    { value: 'menor_que', label: <Latex formula="P(S^2 < x)" /> },
                                    { value: 'mayor_que', label: <Latex formula="P(S^2 > x)" /> },
                                    { value: 'entre', label: <Latex formula="P(x_1 < S^2 < x_2)" /> }
                                ]}
                            />
                        </div>

                        {condicion && (
                            <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {condicion === 'entre' ? (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                                            <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0 }}><Latex formula="S^2_1 =" /></label>
                                            <input
                                                type="number"
                                                placeholder="Desv. Est. Pob."
                                                value={valorX1}
                                                onChange={(e) => { setValorX1(e.target.value); }}
                                                style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none', width: '100%', minWidth: 0 }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flex: 1 }}>
                                            <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0 }}><Latex formula="S^2_2 =" /></label>
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
                                            placeholder="Desv. Est. Pob."
                                            value={valorX1}
                                            onChange={(e) => { setValorX1(e.target.value); }}
                                            style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none', width: '100%' }}
                                        />
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <button onClick={calcularProbabilidad} className="button_calcular btn-icon" style={{ width: 'fit-content', margin: '0 auto', padding: '5px 14px', borderRadius: RADIUS, cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        GRAFICAR
                    </button>
                </>
            )}
        </div>
    );
}







