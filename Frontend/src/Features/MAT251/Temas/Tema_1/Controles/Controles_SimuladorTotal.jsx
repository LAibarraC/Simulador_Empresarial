import React, { useMemo } from 'react';
import { FONT, FS, RADIUS, cardStyle, labelStyle } from '../../../Principal/Constantes';
import { IconoCalculadora, IconoVariables } from '../../../../ui/iconos';

export default function ControlesSimuladorTotal({ 
    setModalVars, varSeleccionada, filas,
    colCausa, setColCausa,
    colEvento, setColEvento,
    valExito, setValExito,
    setRamas, setResultadoSimulador, setErrorSimulador 
}) {

    // Extraer valores únicos para el selector de "Éxito" del evento
    const valoresUnicosEvento = useMemo(() => {
        if (!varSeleccionada || !colEvento) return [];
        const colIndex = varSeleccionada.nombresColumnas?.indexOf(colEvento);
        if (colIndex === -1 || colIndex === undefined) return [];
        
        const vals = filas.map(f => {
            const partes = f.valor.split(' | ').map(p => p.trim());
            return partes[colIndex];
        }).filter(Boolean);
        return [...new Set(vals)].sort();
    }, [varSeleccionada, colEvento, filas]);

    const calcular = () => {
        if (!varSeleccionada) {
            setErrorSimulador("Importa una Matriz de Excel primero."); 
            setResultadoSimulador(null);
            return;
        }
        if (!colCausa || !colEvento || !valExito) {
            setErrorSimulador("Selecciona las columnas de Causa y Evento, así como el valor de éxito."); 
            setResultadoSimulador(null);
            return;
        }
        
        const idxCausa = varSeleccionada.nombresColumnas.indexOf(colCausa);
        const idxEvento = varSeleccionada.nombresColumnas.indexOf(colEvento);
        
        if (idxCausa === -1 || idxEvento === -1) {
            setErrorSimulador("Columnas no encontradas en la matriz.");
            setResultadoSimulador(null);
            return;
        }

        // Extraer valores estructurados
        const datosParseados = filas.map(f => {
            const p = f.valor.split(' | ').map(v => v.trim());
            return { causa: p[idxCausa], evento: p[idxEvento] };
        }).filter(d => d.causa !== undefined && d.evento !== undefined && d.causa !== '' && d.evento !== '');

        const totalDatos = datosParseados.length;
        if (totalDatos === 0) {
            setErrorSimulador("No hay datos válidos para procesar.");
            setResultadoSimulador(null);
            return;
        }

        // Identificar causas únicas
        const causasUnicas = [...new Set(datosParseados.map(d => d.causa))].sort();

        let probB = 0;
        const desglose = [];
        
        causasUnicas.forEach((causa, index) => {
            const datosCausa = datosParseados.filter(d => d.causa === causa);
            const n_Ai = datosCausa.length;
            const pA = n_Ai / totalDatos;

            const datosExito = datosCausa.filter(d => d.evento === valExito);
            const n_B_dado_Ai = datosExito.length;
            const pB_A = n_Ai > 0 ? n_B_dado_Ai / n_Ai : 0;

            const mult = pA * pB_A;
            probB += mult;

            desglose.push({
                id: index + 1,
                nombre: causa,
                pA: pA,
                pB_A: pB_A,
                mult: mult
            });
        });

        setRamas(desglose);
        setResultadoSimulador({ probB, desglose });
        setErrorSimulador('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <label style={{ ...labelStyle, marginTop: '5px' }}>Matriz de Datos:</label>
            <button
                onClick={() => setModalVars(true)}
                className="btn-icon"
                style={{
                    width: '100%',
                    marginBottom: '15px',
                    background: 'var(--primary-color)',
                    color: 'white',
                    borderRadius: RADIUS,
                    fontSize: FS.sm,
                    padding: '8px 10px',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer'
                }}
            >
                <IconoVariables />
                {varSeleccionada ? `Matriz Cargada (${varSeleccionada.nombre})` : 'Importar Matriz de Excel'}
            </button>

            {varSeleccionada && varSeleccionada.nombresColumnas && varSeleccionada.nombresColumnas.length > 1 ? (
                <div style={{ ...cardStyle, marginBottom: '15px' }}>
                    <label style={{ ...labelStyle }}>Parámetros del Teorema:</label>
                    
                    {/* Causa A_i */}
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px' }}>Variable Causa (A_i):</label>
                        <select 
                            value={colCausa} 
                            onChange={(e) => {
                                setColCausa(e.target.value);
                                setResultadoSimulador(null);
                            }}
                            className="container_cal_input"
                            style={{ width: '100%', borderRadius: RADIUS, padding: '6px', fontSize: FS.sm, border: '1px solid var(--border-color)' }}
                        >
                            <option value="">-- Seleccionar --</option>
                            {varSeleccionada.nombresColumnas.map(col => (
                                <option key={col} value={col}>{col}</option>
                            ))}
                        </select>
                    </div>

                    {/* Evento B */}
                    <div style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px' }}>Variable Evento (B):</label>
                        <select 
                            value={colEvento} 
                            onChange={(e) => {
                                setColEvento(e.target.value);
                                setValExito('');
                                setResultadoSimulador(null);
                            }}
                            className="container_cal_input"
                            style={{ width: '100%', borderRadius: RADIUS, padding: '6px', fontSize: FS.sm, border: '1px solid var(--border-color)' }}
                        >
                            <option value="">-- Seleccionar --</option>
                            {varSeleccionada.nombresColumnas.filter(c => c !== colCausa).map(col => (
                                <option key={col} value={col}>{col}</option>
                            ))}
                        </select>
                    </div>

                    {/* Éxito */}
                    {colEvento && valoresUnicosEvento.length > 0 && (
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px', color: 'var(--primary-color)', fontWeight: 'bold' }}>Valor de "Éxito" en {colEvento}:</label>
                            <select 
                                value={valExito} 
                                onChange={(e) => {
                                    setValExito(e.target.value);
                                    setResultadoSimulador(null);
                                }}
                                className="container_cal_input"
                                style={{ width: '100%', borderRadius: RADIUS, padding: '6px', fontSize: FS.sm, border: '1px solid var(--primary-color)' }}
                            >
                                <option value="">-- Seleccionar --</option>
                                {valoresUnicosEvento.map(val => (
                                    <option key={val} value={val}>{val}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            ) : varSeleccionada && (!varSeleccionada.nombresColumnas || varSeleccionada.nombresColumnas.length < 2) ? (
                <div style={{ padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: RADIUS, fontSize: FS.xs, marginBottom: '15px' }}>
                    Para usar el Teorema de Probabilidad Total, debes importar una "Matriz" que contenga al menos 2 columnas (Variables).
                </div>
            ) : null}

            <button 
                onClick={calcular} 
                className="button_calcular btn-icon" 
                style={{ width: 'fit-content', alignSelf: 'center', padding: '8px 35px', borderRadius: RADIUS, fontSize: FS.md, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}
                disabled={!varSeleccionada || !colCausa || !colEvento || !valExito}
            >
                <IconoCalculadora />
                CALCULAR
            </button>
        </div>
    );
}
