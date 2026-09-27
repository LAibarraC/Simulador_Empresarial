import React, { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { calcularIntervaloMedia, calcularIntervaloProporcion, calcularIntervaloVarianza } from '../../../Matematicas/logica_Tema5';
import { cardStyle, labelStyle, FS } from '../../../Principal/Constantes';

export default function Controles_IntervalosManual({ parametro, confianza, onCalcular }) {
    const [n, setN] = useState('');
    
    // Para media
    const [xBar, setXBar] = useState('');
    const [sigmaConocida, setSigmaConocida] = useState(false);
    const [desviacion, setDesviacion] = useState(''); // Representa sigma o s
    
    // Para proporcion
    const [x, setX] = useState('');
    
    // Para varianza
    const [s2, setS2] = useState('');

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const handleCalcular = () => {
        let res = null;
        const numN = parseFloat(n);

        if (parametro === 'media') {
            res = calcularIntervaloMedia(parseFloat(xBar), parseFloat(desviacion), numN, confianza, sigmaConocida);
        } else if (parametro === 'proporcion') {
            res = calcularIntervaloProporcion(parseFloat(x), numN, confianza);
        } else if (parametro === 'varianza') {
            res = calcularIntervaloVarianza(parseFloat(s2), numN, confianza);
        }

        if (res && res.error) {
            alert(res.error);
            onCalcular(null);
        } else {
            onCalcular(res);
        }
    };

    return (
        <div style={cardStyle}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '15px' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{renderKatex('n =')}</label>
                        <input
                            type="number"
                            className="input-mat251 placeholder-small"
                            value={n}
                            onChange={(e) => setN(e.target.value)}
                            placeholder="Tamaño de la muestra"
                            min="1"
                            style={{ flex: 1, width: '100%' }}
                        />
                    </div>

                    {parametro === 'media' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{renderKatex('\\bar{X} =')}</label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                value={xBar}
                                onChange={(e) => setXBar(e.target.value)}
                                placeholder="Media Muestral"
                                step="any"
                                style={{ flex: 1, width: '100%' }}
                            />
                        </div>
                    )}

                    {parametro === 'proporcion' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{renderKatex('x =')}</label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                value={x}
                                onChange={(e) => setX(e.target.value)}
                                placeholder="Casos Favorables"
                                min="0"
                                style={{ flex: 1, width: '100%' }}
                            />
                        </div>
                    )}

                    {parametro === 'varianza' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{renderKatex('S^2 =')}</label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                value={s2}
                                onChange={(e) => setS2(e.target.value)}
                                placeholder="Varianza Muestral"
                                min="0"
                                step="any"
                                style={{ flex: 1, width: '100%' }}
                            />
                        </div>
                    )}
                </div>

                {parametro === 'media' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>Desviación Estándar:</label>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                                {/* Radio Poblacional */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <div style={{ 
                                        width: '18px', height: '18px', borderRadius: '50%', 
                                        border: `2px solid ${sigmaConocida ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.2s ease', background: 'var(--bg-card)'
                                    }}>
                                        <div style={{ 
                                            width: '10px', height: '10px', borderRadius: '50%', 
                                            background: 'var(--accent-color)', 
                                            opacity: sigmaConocida ? 1 : 0,
                                            transform: sigmaConocida ? 'scale(1)' : 'scale(0)',
                                            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                        }} />
                                    </div>
                                    <input 
                                        type="radio" 
                                        checked={sigmaConocida} 
                                        onChange={() => setSigmaConocida(true)} 
                                        style={{ display: 'none' }}
                                    />
                                    <span style={{ color: sigmaConocida ? 'var(--accent-color)' : 'var(--text-main)', fontWeight: sigmaConocida ? '600' : '400', fontSize: FS.sm }}>
                                        Poblacional ({renderKatex('\\sigma')})
                                    </span>
                                </label>

                                {/* Radio Muestral */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <div style={{ 
                                        width: '18px', height: '18px', borderRadius: '50%', 
                                        border: `2px solid ${!sigmaConocida ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.2s ease', background: 'var(--bg-card)'
                                    }}>
                                        <div style={{ 
                                            width: '10px', height: '10px', borderRadius: '50%', 
                                            background: 'var(--accent-color)', 
                                            opacity: !sigmaConocida ? 1 : 0,
                                            transform: !sigmaConocida ? 'scale(1)' : 'scale(0)',
                                            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                        }} />
                                    </div>
                                    <input 
                                        type="radio" 
                                        checked={!sigmaConocida} 
                                        onChange={() => setSigmaConocida(false)} 
                                        style={{ display: 'none' }}
                                    />
                                    <span style={{ color: !sigmaConocida ? 'var(--accent-color)' : 'var(--text-main)', fontWeight: !sigmaConocida ? '600' : '400', fontSize: FS.sm }}>
                                        Muestral ({renderKatex('S')})
                                    </span>
                                </label>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                                {sigmaConocida ? renderKatex('\\sigma =') : renderKatex('S =')}
                            </label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                value={desviacion}
                                onChange={(e) => setDesviacion(e.target.value)}
                                placeholder={sigmaConocida ? "Desviación Poblacional" : "Desviación Muestral"}
                                step="any"
                                min="0"
                                style={{ flex: 1, width: '100%' }}
                            />
                        </div>
                    </div>
                )}


            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                <button 
                    className="button_calcular" 
                    style={{ width: 'auto', padding: '5px 15px' }}
                    onClick={handleCalcular}
                >
                    Calcular Intervalo de Confianza
                </button>
            </div>
        </div>
    );
}
