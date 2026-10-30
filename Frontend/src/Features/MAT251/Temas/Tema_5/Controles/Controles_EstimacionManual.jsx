import React, { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cardStyle, labelStyle } from '../../../Principal/Constantes';
import ModalAlerta from '../../../ui/ModalAlerta';

export default function Controles_EstimacionManual({ parametro, configuracion, onEditar, onCalcular }) {
    const [modalAlerta, setModalAlerta] = useState({ isOpen: false, mensaje: '', titulo: 'Dato inválido', tipo: 'warning' });
    const n = configuracion.n;
    const setN = valor => onEditar('n', valor);
    const xBar = configuracion.xBar;
    const setXBar = valor => onEditar('xBar', valor);
    const x = configuracion.x;
    const setX = valor => onEditar('x', valor);
    const s2 = configuracion.s2;
    const setS2 = valor => onEditar('s2', valor);

    const renderKatex = (math, negrita = false) => (
        <span className={negrita ? 'tema5-matematica-negrita' : undefined} dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );

    const handleCalcular = () => {
        const calculo = onCalcular();
        if (calculo.error) setModalAlerta({ isOpen: true, mensaje: calculo.error, titulo: 'Dato inválido', tipo: 'warning' });
    };

    return (
        <div className="tema5-manual-card" style={['proporcion', 'varianza'].includes(parametro) ? { ...cardStyle, border: 'none', paddingBottom: '5px' } : cardStyle}>
            <div className={`tema5-manual-fields ${['proporcion', 'varianza'].includes(parametro) ? 'tema5-manual-fields-compact' : ''}`}>
                <div id="tour-t5-manual-tamano-muestra" className="tema5-manual-field">
                    <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', minWidth: 0, whiteSpace: 'nowrap' }}>
                        {['proporcion', 'varianza'].includes(parametro) ? renderKatex('n:', true) : <>Tamaño de la muestra ({renderKatex('n', true)}):</>}
                    </label>
                    <input
                        type="number"
                        className="input-mat251 placeholder-small"
                        value={n}
                        onChange={(e) => setN(e.target.value)}
                        placeholder={['proporcion', 'varianza'].includes(parametro) ? 'Tamaño de muestra' : 'Ej. 50'}
                        min="1"
                        style={{ flex: 1, width: '100%', minWidth: 0, boxSizing: 'border-box' }}
                    />
                </div>

                {parametro === 'media' && (
                    <div id="tour-t5-manual-valor-parametro" className="tema5-manual-field">
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)' }}>Media Muestral ({renderKatex('\\bar{X}', true)}):</label>
                        <input
                            type="number"
                            className="input-mat251 placeholder-small"
                            value={xBar}
                            onChange={(e) => setXBar(e.target.value)}
                            placeholder="Ej. 120.5"
                            step="any"
                            style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
                        />
                    </div>
                )}

                {parametro === 'proporcion' && (
                    <div id="tour-t5-manual-valor-parametro" className="tema5-manual-field">
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', whiteSpace: 'nowrap' }}>{renderKatex('x:', true)}</label>
                        <input
                            type="number"
                            className="input-mat251 placeholder-small"
                            value={x}
                            onChange={(e) => setX(e.target.value)}
                            placeholder="Casos favorables"
                            min="0"
                            style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
                        />
                    </div>
                )}

                {parametro === 'varianza' && (
                    <div id="tour-t5-manual-valor-parametro" className="tema5-manual-field">
                        <label style={{ ...labelStyle, margin: 0, color: 'var(--text-pure)', whiteSpace: 'nowrap' }}>{renderKatex('S^2:', true)}</label>
                        <input
                            type="number"
                            className="input-mat251 placeholder-small"
                            value={s2}
                            onChange={(e) => setS2(e.target.value)}
                            placeholder="Varianza muestral"
                            min="0"
                            step="any"
                            style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}
                        />
                    </div>
                )}
            </div>

            <div id="tour-t5-btn-calcular-manual" className="tema5-manual-submit-wrap" style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                <button
                    type="button"
                    className="button_calcular"
                    style={{ width: 'auto', padding: '5px 20px' }}
                    onClick={handleCalcular}
                >
                    Calcular Estimación Puntual
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
