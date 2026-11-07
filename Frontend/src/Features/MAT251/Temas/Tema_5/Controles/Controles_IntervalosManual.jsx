import React, { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cardStyle, labelStyle, FS } from '../../../Principal/Constantes';
import ModalAlerta from '../../../ui/ModalAlerta';

export default function Controles_IntervalosManual({ parametro, configuracion, onEditar, onCalcular }) {
    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Dato inválido', tipo: 'warning' });
    const { n, xBar, sigmaConocida, desviacion, x, s2 } = configuracion;
    const setN = valor => onEditar('n', valor);
    const setXBar = valor => onEditar('xBar', valor);
    const setSigmaConocida = valor => onEditar('sigmaConocida', valor);
    const setDesviacion = valor => onEditar('desviacion', valor);
    const setX = valor => onEditar('x', valor);
    const setS2 = valor => onEditar('s2', valor);

    const renderKatex = (math, negrita = false) => (
        <span className={negrita ? 'tema5-matematica-negrita' : undefined} dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const handleCalcular = () => {
        const calculo = onCalcular();
        if (calculo?.error) setModalAlerta({ isOpen: true, mensaje: calculo.error, titulo: 'Dato inválido', tipo: 'warning' });
    };

    return (
        <div className="tema5-intervalos-manual-form tema5-manual-card" style={{ ...cardStyle, border: 'none' }}>

            <div className="tema5-manual-content">
                
                <div className={`tema5-manual-fields ${parametro === 'media' ? 'tema5-manual-fields-media' : ''} ${['proporcion', 'varianza'].includes(parametro) ? 'tema5-manual-fields-compact' : ''}`}>
                    <div id="tour-t5-intervalos-manual-n" className={`tema5-manual-field ${parametro === 'media' ? 'tema5-manual-field-inline' : ''}`}>
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', whiteSpace: 'nowrap' }}>{renderKatex(['proporcion', 'varianza'].includes(parametro) ? 'n:' : 'n =', true)}</label>
                        <input
                            type="number"
                            className="input-mat251 placeholder-small"
                            value={n}
                            onChange={(e) => setN(e.target.value)}
                            placeholder="Tamaño de la muestra"
                            min="1"
                            style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
                        />
                    </div>

                    {parametro === 'media' && (
                        <div id="tour-t5-intervalos-manual-param-val" className="tema5-manual-field tema5-manual-field-inline">
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', whiteSpace: 'nowrap' }}>{renderKatex('\\bar{X} =', true)}</label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                value={xBar}
                                onChange={(e) => setXBar(e.target.value)}
                                placeholder="Media Muestral"
                                step="any"
                                style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
                            />
                        </div>
                    )}

                    {parametro === 'proporcion' && (
                        <div id="tour-t5-intervalos-manual-param-val" className="tema5-manual-field">
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', whiteSpace: 'nowrap' }}>{renderKatex('x:', true)}</label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                value={x}
                                onChange={(e) => setX(e.target.value)}
                                placeholder="Casos Favorables"
                                min="0"
                                style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
                            />
                        </div>
                    )}

                    {parametro === 'varianza' && (
                        <div id="tour-t5-intervalos-manual-param-val" className="tema5-manual-field">
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', whiteSpace: 'nowrap' }}>{renderKatex('S^2:', true)}</label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                value={s2}
                                onChange={(e) => setS2(e.target.value)}
                                placeholder="Varianza Muestral"
                                min="0"
                                step="any"
                                style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
                            />
                        </div>
                    )}
                </div>

                {parametro === 'media' && (
                    <div id="tour-t5-intervalos-manual-sigma-selector" className="tema5-manual-media-extra">
                        <div className="tema5-manual-sigma-selector">
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', whiteSpace: 'nowrap' }}>Desviación Estándar:</label>
                            
                            <div className="tema5-manual-sigma-options" style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
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
                        <div className="tema5-manual-field tema5-manual-deviation-input">
                            <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', whiteSpace: 'nowrap' }}>
                                {sigmaConocida ? renderKatex('\\sigma =', true) : renderKatex('S =', true)}
                            </label>
                            <input
                                type="number"
                                className="input-mat251 placeholder-small"
                                value={desviacion}
                                onChange={(e) => setDesviacion(e.target.value)}
                                placeholder={sigmaConocida ? "Desviación Poblacional" : "Desviación Muestral"}
                                step="any"
                                min="0"
                                style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
                            />
                        </div>
                    </div>
                )}


            </div>

            <div id="tour-t5-intervalos-btn-calcular-manual" className="tema5-manual-submit-wrap" style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <button 
                    type="button"
                    className="button_calcular" 
                    style={{ width: 'auto', padding: '5px 15px' }}
                    onClick={handleCalcular}
                >
                    Calcular Intervalo de Confianza
                </button>
            </div>

            <ModalAlerta
                isOpen={modalAlerta.isOpen}
                titulo={modalAlerta.titulo}
                mensaje={modalAlerta.mensaje}
                tipo={modalAlerta.tipo}
                onClose={() => setModalAlerta(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
