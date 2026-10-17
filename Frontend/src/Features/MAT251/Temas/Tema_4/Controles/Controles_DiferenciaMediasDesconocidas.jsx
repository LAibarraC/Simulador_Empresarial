import React, { useState, useRef, useEffect } from 'react';
import { jStat } from 'jstat';
import { cardStyle, labelStyle, RADIUS, FS, FONT } from '../../../Principal/Constantes';
import Latex from '../../../../../components/excel/Latex';
import { calcularParametrosDiferenciaMediasDesconocidas, calcularProbabilidadDiferenciaMediasDesconocidas } from '../../../Matematicas/Logica_Tema4';
import ModalAlerta from '../../../ui/ModalAlerta';

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

export default function Controles_DiferenciaMediasDesconocidas({ onCalcular }) {
    // Muestra 1
    const [mu1, setMu1] = useState('');
    const [s1, setS1] = useState('');
    const [n1, setN1] = useState('');

    // Muestra 2
    const [mu2, setMu2] = useState('');
    const [s2, setS2] = useState('');
    const [n2, setN2] = useState('');

    // Escenario: 'grandes' (n+m > 30), 'iguales' (varianzas iguales), 'distintas' (varianzas distintas)
    const [escenario, setEscenario] = useState('grandes');

    const [condicion, setCondicion] = useState('menor_que');
    const [valorX1, setValorX1] = useState('');
    const [valorX2, setValorX2] = useState('');

    // Alertas
    const [alertaModal, setAlertaModal] = useState({ isOpen: false, mensaje: '', tipo: 'warning' });

    const resetValues = () => {
        onCalcular(null);
    };

    const calcular = () => {
        const m1 = parseFloat(mu1);
        const std1 = parseFloat(s1);
        const nn1 = parseInt(n1);

        const m2 = parseFloat(mu2);
        const std2 = parseFloat(s2);
        const nn2 = parseInt(n2);

        const x1 = parseFloat(valorX1);
        const x2 = parseFloat(valorX2);

        if (isNaN(m1) || isNaN(std1) || isNaN(nn1) || isNaN(m2) || isNaN(std2) || isNaN(nn2)) {
            setAlertaModal({ isOpen: true, mensaje: 'Por favor complete todos los parámetros de las muestras.', tipo: 'warning' });
            return;
        }

        if (std1 < 0 || std2 < 0) {
            setAlertaModal({ isOpen: true, mensaje: 'Las desviaciones estándar deben ser valores no negativos.', tipo: 'warning' });
            return;
        }

        if (nn1 <= 0 || nn2 <= 0) {
            setAlertaModal({ isOpen: true, mensaje: 'Los tamaños de muestra deben ser enteros mayores a cero.', tipo: 'warning' });
            return;
        }

        if (isNaN(x1) || (condicion === 'entre' && isNaN(x2))) {
            setAlertaModal({ isOpen: true, mensaje: 'Por favor ingrese el o los valores límites para la condición.', tipo: 'warning' });
            return;
        }

        if (condicion === 'entre' && x1 >= x2) {
            setAlertaModal({ isOpen: true, mensaje: 'En un intervalo, x1 debe ser estrictamente menor que x2.', tipo: 'warning' });
            return;
        }

        // Varianzas muestrales al cuadrado
        const s1Sq = Math.pow(std1, 2);
        const s2Sq = Math.pow(std2, 2);

        // Validacion de consistencia con el escenario seleccionado
        if (escenario === 'grandes' && (nn1 + nn2 <= 30)) {
            setAlertaModal({ isOpen: true, mensaje: `Para muestras grandes se requiere que n + m > 30 (actualmente ${nn1 + nn2}).`, tipo: 'warning' });
            return;
        }
        if ((escenario === 'iguales' || escenario === 'distintas') && (nn1 + nn2 > 30)) {
            setAlertaModal({ isOpen: true, mensaje: `Para muestras pequeñas se requiere que n + m ≤ 30 (actualmente ${nn1 + nn2}). Considere usar el escenario de Muestras grandes.`, tipo: 'warning' });
            return;
        }

        const esperanza = m1 - m2;
        let se = 0;
        let v = 0;
        let statValue = 0;
        let statType = 'Z';
        let formulaLaTeX = '';

        if (escenario === 'grandes') {
            se = Math.sqrt((s1Sq / nn1) + (s2Sq / nn2));
            statValue = (x1 - esperanza) / se;
            statType = 'Z';
            formulaLaTeX = `Z = \\frac{(\\bar{X} - \\bar{Y}) - (\\mu_X - \\mu_Y)}{\\sqrt{\\frac{S_X^2}{n} + \\frac{S_Y^2}{m}}}`;
        } else if (escenario === 'iguales') {
            v = nn1 + nn2 - 2;
            const sp2 = ((nn1 - 1) * s1Sq + (nn2 - 1) * s2Sq) / v;
            se = Math.sqrt(sp2 * ((1 / nn1) + (1 / nn2)));
            statValue = (x1 - esperanza) / se;
            statType = 'T';
            formulaLaTeX = `T = \\frac{(\\bar{X} - \\bar{Y}) - (\\mu_X - \\mu_Y)}{\\sqrt{\\frac{(n-1)S_X^2 + (m-1)S_Y^2}{n+m-2} \\left(\\frac{1}{n} + \\frac{1}{m}\\right)}}`;
        } else if (escenario === 'distintas') {
            se = Math.sqrt((s1Sq / nn1) + (s2Sq / nn2));
            const num = Math.pow((s1Sq / nn1) + (s2Sq / nn2), 2);
            const den = (Math.pow(s1Sq / nn1, 2) / (nn1 + 1)) + (Math.pow(s2Sq / nn2, 2) / (nn2 + 1));
            v = (num / den) - 2;
            // Redondeo de g para presentacion
            v = Math.round(v * 100) / 100;
            statValue = (x1 - esperanza) / se;
            statType = 'T';
            formulaLaTeX = `T = \\frac{(\\bar{X} - \\bar{Y}) - (\\mu_X - \\mu_Y)}{\\sqrt{\\frac{S_X^2}{n} + \\frac{S_Y^2}{m}}}`;
        }

        // Calculation for probabilities based on condition
        let probFinal = 0;
        let val2Stat = (x2 - esperanza) / se;

        if (escenario === 'grandes') {
            if (condicion === 'menor_que') {
                probFinal = jStat.normal.cdf(statValue, 0, 1);
            } else if (condicion === 'mayor_que') {
                probFinal = 1 - jStat.normal.cdf(statValue, 0, 1);
            } else if (condicion === 'entre') {
                const p1 = jStat.normal.cdf(statValue, 0, 1);
                const p2 = jStat.normal.cdf(val2Stat, 0, 1);
                probFinal = Math.abs(p2 - p1);
            }
        } else {
            if (condicion === 'menor_que') {
                probFinal = jStat.studentt.cdf(statValue, v);
            } else if (condicion === 'mayor_que') {
                probFinal = 1 - jStat.studentt.cdf(statValue, v);
            } else if (condicion === 'entre') {
                const p1 = jStat.studentt.cdf(statValue, v);
                const p2 = jStat.studentt.cdf(val2Stat, v);
                probFinal = Math.abs(p2 - p1);
            }
        }
        const formatNumber = (num, dec = 0) => num.toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: Math.max(dec, 3) }).replace(/,/g, '{,}');
        let strDesarrollo = '';
        let S = statType; // 'Z' or 'T'

        if (condicion === 'menor_que') {
            strDesarrollo = `\\begin{aligned} P(\\bar{X}_1 - \\bar{X}_2 \\le ${formatNumber(x1)}) &= P\\left( ${S} \\le \\frac{${formatNumber(x1)} - ${formatNumber(esperanza)}}{${formatNumber(se, 2)}} \\right) \\\\ &= P(${S} \\le ${formatNumber(statValue, 2)}) \\\\ &= ${formatNumber(probFinal, 4)} \\end{aligned}`;
        } else if (condicion === 'mayor_que') {
            strDesarrollo = `\\begin{aligned} P(\\bar{X}_1 - \\bar{X}_2 \\ge ${formatNumber(x1)}) &= P\\left( ${S} \\ge \\frac{${formatNumber(x1)} - ${formatNumber(esperanza)}}{${formatNumber(se, 2)}} \\right) \\\\ &= P(${S} \\ge ${formatNumber(statValue, 2)}) \\\\ &= 1 - P(${S} \\le ${formatNumber(statValue, 2)}) = ${formatNumber(probFinal, 4)} \\end{aligned}`;
        } else if (condicion === 'entre') {
            const xMin = Math.min(x1, x2);
            const xMax = Math.max(x1, x2);
            const tMin = Math.min(statValue, val2Stat);
            const tMax = Math.max(statValue, val2Stat);
            strDesarrollo = `\\begin{aligned} P(${formatNumber(xMin)} \\le \\bar{X}_1 - \\bar{X}_2 \\le ${formatNumber(xMax)}) &= P\\left( \\frac{${formatNumber(xMin)} - ${formatNumber(esperanza)}}{${formatNumber(se, 2)}} \\le ${S} \\le \\frac{${formatNumber(xMax)} - ${formatNumber(esperanza)}}{${formatNumber(se, 2)}} \\right) \\\\ &= P(${formatNumber(tMin, 2)} \\le ${S} \\le ${formatNumber(tMax, 2)}) \\\\ &= P(${S} \\le ${formatNumber(tMax, 2)}) - P(${S} \\le ${formatNumber(tMin, 2)}) = ${formatNumber(probFinal, 4)} \\end{aligned}`;
        }

        onCalcular({
            m1, std1, nn1,
            m2, std2, nn2,
            esperanza,
            se,
            v,
            escenario,
            condicion,
            x1,
            x2,
            probFinal,
            statValue,
            statType,
            formulaLaTeX,
            strDesarrollo,
            mu: esperanza, // Para GraficoStudent
            p: esperanza,  // Para GraficoDiferenciaMedias
            esDiferenciaMedias: true
        });
    };

    return (
        <div style={{ ...cardStyle, border: 'none', padding: '0', backgroundColor: 'transparent' }}>
            <div className="tema4-population-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px', marginBottom: '15px' }}>
                {/* Población 1 */}
                <div className="tema4-population-card" style={{ background: 'var(--bg-card)', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ color: 'var(--text-pure)', fontSize: FS.sm, marginBottom: '10px', fontWeight: 700, fontFamily: FONT }}>POBLACIÓN 1</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0, width: '40px', whiteSpace: 'nowrap' }}><Latex formula="\mu_1 =" /></label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                placeholder="Media Pob. 1"
                                value={mu1}
                                onChange={(e) => { setMu1(e.target.value); resetValues(); }}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0, width: '40px', whiteSpace: 'nowrap' }}><Latex formula="S_1 =" /></label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                placeholder="Desv. Est. Muestral 1"
                                value={s1}
                                onChange={(e) => { setS1(e.target.value); resetValues(); }}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0, width: '40px', whiteSpace: 'nowrap' }}><Latex formula="n_1 =" /></label>
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

                {/* Población 2 */}
                <div className="tema4-population-card" style={{ background: 'var(--bg-card)', padding: '10px', borderRadius: '5px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ color: 'var(--text-pure)', fontSize: FS.sm, marginBottom: '10px', fontWeight: 700, fontFamily: FONT }}>POBLACIÓN 2</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0, width: '40px', whiteSpace: 'nowrap' }}><Latex formula="\mu_2 =" /></label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                placeholder="Media Pob. 2"
                                value={mu2}
                                onChange={(e) => { setMu2(e.target.value); resetValues(); }}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0, width: '40px', whiteSpace: 'nowrap' }}><Latex formula="S_2 =" /></label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                placeholder="Desv. Est. Muestral 2"
                                value={s2}
                                onChange={(e) => { setS2(e.target.value); resetValues(); }}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-pure)', marginBottom: 0, width: '40px', whiteSpace: 'nowrap' }}><Latex formula="n_2 =" /></label>
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

            {/* Escenario de Evaluación */}
            <div style={{ marginBottom: '15px' }}>
                <label style={{ ...labelStyle, display: 'block', marginBottom: '8px' }}>Escenario de Evaluación</label>
                <CustomSelect
                    value={escenario}
                    onChange={(val) => { setEscenario(val); resetValues(); }}
                    options={[
                        { value: 'grandes', label: <Latex formula="\text{Muestras grandes, } n + m > 30" /> },
                        { value: 'iguales', label: <Latex formula="\text{Muestras pequeñas, } n + m \le 30 \text{ y } \sigma_X^2 = \sigma_Y^2" /> },
                        { value: 'distintas', label: <Latex formula="\text{Muestras pequeñas, } n + m \le 30 \text{ y } \sigma_X^2 \neq \sigma_Y^2" /> }
                    ]}
                />
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
                        onChange={(val) => { setCondicion(val); resetValues(); }}
                        options={[
                            { value: 'menor_que', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}><Latex formula="P(\bar{X}_1 - \bar{X}_2 \le x)" /></div> },
                            { value: 'mayor_que', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}><Latex formula="P(\bar{X}_1 - \bar{X}_2 \ge x)" /></div> },
                            { value: 'entre', label: <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}><Latex formula="P(x_1 \le \bar{X}_1 - \bar{X}_2 \le x_2)" /></div> }
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
                                onChange={(e) => { setValorX1(e.target.value); resetValues(); }}
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
                                onChange={(e) => { setValorX2(e.target.value); resetValues(); }}
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
                            onChange={(e) => { setValorX1(e.target.value); resetValues(); }}
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

            <ModalAlerta
                isOpen={alertaModal.isOpen}
                onClose={() => setAlertaModal({ ...alertaModal, isOpen: false })}
                mensaje={alertaModal.mensaje}
                tipo={alertaModal.tipo}
            />
        </div>
    );
}
