import React, { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { calcularEstimacionPuntualManual } from '../../../Matematicas/logica_Tema5';
import { cardStyle, labelStyle, FS } from '../../../Principal/Constantes';

export default function Controles_EstimacionManual({ parametro, onCalcular }) {
    const [n, setN] = useState('');
    const [xBar, setXBar] = useState('');
    const [x, setX] = useState('');
    const [s2, setS2] = useState('');

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const handleCalcular = () => {
        const res = calcularEstimacionPuntualManual({ n, x_bar: xBar, x, s2 }, parametro);
        if (res.error) {
            alert(res.error);
            onCalcular(null);
        } else {
            onCalcular(res);
        }
    };

    return (
        <div style={cardStyle}>
            <p style={{ fontSize: FS.sm, marginBottom: '15px' }}>
                Ingrese directamente los valores estadísticos conocidos.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '180px' }}>Tamaño de la muestra ({renderKatex('n')}):</label>
                    <input
                        type="number"
                        className="input-mat251"
                        value={n}
                        onChange={(e) => setN(e.target.value)}
                        placeholder="Ej. 50"
                        min="1"
                        style={{ flex: 1 }}
                    />
                </div>

                {parametro === 'media' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '180px' }}>Media Muestral ({renderKatex('\\bar{X}')}):</label>
                        <input
                            type="number"
                            className="input-mat251"
                            value={xBar}
                            onChange={(e) => setXBar(e.target.value)}
                            placeholder="Ej. 120.5"
                            step="any"
                            style={{ flex: 1 }}
                        />
                    </div>
                )}

                {parametro === 'proporcion' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '180px' }}>Casos Favorables ({renderKatex('x')}):</label>
                        <input
                            type="number"
                            className="input-mat251"
                            value={x}
                            onChange={(e) => setX(e.target.value)}
                            placeholder="Ej. 15"
                            min="0"
                            style={{ flex: 1 }}
                        />
                    </div>
                )}

                {parametro === 'varianza' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', minWidth: '180px' }}>Varianza Muestral ({renderKatex('S^2')}):</label>
                        <input
                            type="number"
                            className="input-mat251"
                            value={s2}
                            onChange={(e) => setS2(e.target.value)}
                            placeholder="Ej. 14.2"
                            min="0"
                            step="any"
                            style={{ flex: 1 }}
                        />
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                <button 
                    className="button_calcular" 
                    style={{ width: 'auto', padding: '5px 15px' }}
                    onClick={handleCalcular}
                >
                    Calcular Estimación Puntual
                </button>
            </div>
        </div>
    );
}
