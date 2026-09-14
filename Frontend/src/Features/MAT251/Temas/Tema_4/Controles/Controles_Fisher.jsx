import React, { useState } from 'react';
import { cardStyle, labelStyle, RADIUS, FS } from '../../../Principal/Constantes';
import Latex from '../../../../../components/excel/Latex';
import { IconoCalculadora } from '../../../../../ui/iconos';
import { generarDistribucionFisher, calcularProbabilidadFisher } from '../../../Matematicas/Logica_Tema4';
import { jStat } from 'jstat';

export default function Controles_Fisher({ onCalcular }) {
    // Inputs
    const [varPob1, setVarPob1] = useState('');
    const [n1, setN1] = useState('');
    
    const [varPob2, setVarPob2] = useState('');
    const [n2, setN2] = useState('');

    // Estado del paso 1
    const [distribucionGenerada, setDistribucionGenerada] = useState(false);
    const [datosParciales, setDatosParciales] = useState(null);

    // Condicion
    const [condicion, setCondicion] = useState('');
    const [valorX1, setValorX1] = useState('');
    const [valorX2, setValorX2] = useState('');

    const generarDistribucion = () => {
        const result = generarDistribucionFisher(varPob1, n1, varPob2, n2);
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
        const result = calcularProbabilidadFisher(datosParciales, condicion, valorX1, valorX2);
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Población 1 */}
                <div style={{ background: 'var(--bg-app)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: FS.sm, color: 'var(--primary-color)' }}>Población 1</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, width: '40px' }}><Latex formula="\sigma_1^2 =" /></label>
                            <input
                                type="number"
                                placeholder="Var. Muestral 1"
                                value={varPob1}
                                onChange={(e) => { setVarPob1(e.target.value); resetDistribucion(); }}
                                style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, width: '40px' }}><Latex formula="n_1 =" /></label>
                            <input
                                type="number"
                                placeholder="Muestra 1"
                                value={n1}
                                onChange={(e) => { setN1(e.target.value); resetDistribucion(); }}
                                style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Población 2 */}
                <div style={{ background: 'var(--bg-app)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: FS.sm, color: 'var(--primary-color)' }}>Población 2</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, width: '40px' }}><Latex formula="\sigma_2^2 =" /></label>
                            <input
                                type="number"
                                placeholder="Var. Muestral 2"
                                value={varPob2}
                                onChange={(e) => { setVarPob2(e.target.value); resetDistribucion(); }}
                                style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, color: 'var(--text-main)', marginBottom: 0, width: '40px' }}><Latex formula="n_2 =" /></label>
                            <input
                                type="number"
                                placeholder="Var. Muestral 2"
                                value={n2}
                                onChange={(e) => { setN2(e.target.value); resetDistribucion(); }}
                                style={{ flex: 1, padding: '8px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={generarDistribucion} className="button_calcular btn-icon" style={{ width: 'fit-content', margin: '15px auto 20px', padding: '10px 40px', borderRadius: RADIUS, cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >CALCULAR</button>

            {distribucionGenerada && (
                <div style={{ marginTop: '20px', animation: 'fadeIn 0.5s ease-out' }}>
                    <div style={{ background: 'var(--bg-app)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: FS.sm, color: 'var(--text-main)' }}>Grados de Libertad (v)</h4>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                            <Latex formula={`v_1 = ${n1} - 1 = ${datosParciales.v1}`} />
                            <Latex formula={`v_2 = ${n2} - 1 = ${datosParciales.v2}`} />
                        </div>
                    </div>

                    <label style={{ ...labelStyle, display: 'block', marginBottom: '10px' }}>Condición a Calcular</label>
                    <select
                        value={condicion}
                        onChange={(e) => setCondicion(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: RADIUS, border: '1px solid var(--border-color)', marginBottom: '15px', outline: 'none', background: 'white' }}
                    >
                        <option value="">-- Selecciona una Condición --</option>
                        <option value="menor_que">P(S₁² / S₂² {'<'} x)</option>
                        <option value="mayor_que">P(S₁² / S₂² {'>'} x)</option>
                        <option value="entre">P(x₁ {'<'} S₁² / S₂² {'<'} x₂)</option>
                    </select>

                    {condicion && (
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <label style={{ ...labelStyle, marginBottom: 0 }}>x {condicion === 'entre' && '1'} = </label>
                            <input
                                type="number"
                                placeholder="Valor"
                                value={valorX1}
                                onChange={(e) => setValorX1(e.target.value)}
                                style={{ flex: 1, padding: '10px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none' }}
                            />
                            {condicion === 'entre' && (
                                <>
                                    <label style={{ ...labelStyle, marginBottom: 0 }}>x 2 = </label>
                                    <input
                                        type="number"
                                        placeholder="Valor"
                                        value={valorX2}
                                        onChange={(e) => setValorX2(e.target.value)}
                                        style={{ flex: 1, padding: '10px', borderRadius: RADIUS, border: '1px solid var(--border-color)', outline: 'none' }}
                                    />
                                </>
                            )}
                        </div>
                    )}

                    {condicion && (
                        <button onClick={calcularProbabilidad} className="button_calcular btn-icon" style={{ width: 'fit-content', margin: '15px auto 0', padding: '10px 40px', borderRadius: RADIUS, cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                        >
                            Graficar
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}







