import React, { useMemo } from 'react';
import { FONT, FS, RADIUS, cardStyle, labelStyle } from '../../../Principal/Constantes';
import { IconoCalculadora, IconoVariables } from '../../../../../ui/iconos';
import { calcularReglaAdicion } from '../../../Matematicas/logica_Tema1';

export default function ControlesReglaAdicion({ 
    setModalVars, varSeleccionada, filas,
    colA, setColA, valA, setValA,
    colB, setColB, valB, setValB,
    setResultado, setError
}) {

    // Extraer valores únicos para A y B
    const valoresUnicosA = useMemo(() => {
        if (!varSeleccionada || !colA) return [];
        const colIndex = varSeleccionada.nombresColumnas?.indexOf(colA);
        if (colIndex === -1 || colIndex === undefined) return [];
        const vals = filas.map(f => f.valor.split(' | ').map(p => p.trim())[colIndex]).filter(Boolean);
        return [...new Set(vals)].sort();
    }, [varSeleccionada, colA, filas]);

    const valoresUnicosB = useMemo(() => {
        if (!varSeleccionada || !colB) return [];
        const colIndex = varSeleccionada.nombresColumnas?.indexOf(colB);
        if (colIndex === -1 || colIndex === undefined) return [];
        const vals = filas.map(f => f.valor.split(' | ').map(p => p.trim())[colIndex]).filter(Boolean);
        return [...new Set(vals)].sort();
    }, [varSeleccionada, colB, filas]);

    const calcular = () => {
        if (!varSeleccionada) {
            setError("Importa una Matriz de Excel primero."); 
            setResultado(null);
            return;
        }
        if (!colA || !valA || !colB || !valB) {
            setError("Selecciona las columnas y los valores para ambos eventos (A y B)."); 
            setResultado(null);
            return;
        }

        const res = calcularReglaAdicion(filas, varSeleccionada.nombresColumnas, colA, valA, colB, valB);
        if (res.error) {
            setError(res.error);
            setResultado(null);
        } else {
            setResultado(res.resultado);
            setError('');
        }
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

            {varSeleccionada && varSeleccionada.nombresColumnas && varSeleccionada.nombresColumnas.length > 0 ? (
                <div style={{ ...cardStyle, marginBottom: '15px' }}>
                    <label style={{ ...labelStyle }}>Parámetros de los Eventos:</label>
                    
                    {/* EVENTO A */}
                    <div style={{ marginBottom: '10px', padding: '10px', background: 'rgba(0,0,0,0.02)', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                        <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px', fontWeight: 'bold', color: 'var(--primary-color)' }}>Evento A:</label>
                        <select 
                            value={colA} 
                            onChange={(e) => { setColA(e.target.value); setValA(''); setResultado(null); }}
                            className="container_cal_input"
                            style={{ width: '100%', borderRadius: RADIUS, padding: '6px', fontSize: FS.sm, border: '1px solid var(--border-color)', marginBottom: '5px' }}
                        >
                            <option value="">-- Seleccionar Variable A --</option>
                            {varSeleccionada.nombresColumnas.map(col => <option key={col} value={col}>{col}</option>)}
                        </select>
                        {colA && (
                            <select 
                                value={valA} 
                                onChange={(e) => { setValA(e.target.value); setResultado(null); }}
                                className="container_cal_input"
                                style={{ width: '100%', borderRadius: RADIUS, padding: '6px', fontSize: FS.sm, border: '1px solid var(--primary-color)' }}
                            >
                                <option value="">-- Valor A (Éxito) --</option>
                                {valoresUnicosA.map(val => <option key={val} value={val}>{val}</option>)}
                            </select>
                        )}
                    </div>

                    {/* EVENTO B */}
                    <div style={{ marginBottom: '10px', padding: '10px', background: 'rgba(0,0,0,0.02)', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                        <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px', fontWeight: 'bold', color: 'var(--primary-color)' }}>Evento B:</label>
                        <select 
                            value={colB} 
                            onChange={(e) => { setColB(e.target.value); setValB(''); setResultado(null); }}
                            className="container_cal_input"
                            style={{ width: '100%', borderRadius: RADIUS, padding: '6px', fontSize: FS.sm, border: '1px solid var(--border-color)', marginBottom: '5px' }}
                        >
                            <option value="">-- Seleccionar Variable B --</option>
                            {varSeleccionada.nombresColumnas.map(col => <option key={col} value={col}>{col}</option>)}
                        </select>
                        {colB && (
                            <select 
                                value={valB} 
                                onChange={(e) => { setValB(e.target.value); setResultado(null); }}
                                className="container_cal_input"
                                style={{ width: '100%', borderRadius: RADIUS, padding: '6px', fontSize: FS.sm, border: '1px solid var(--primary-color)' }}
                            >
                                <option value="">-- Valor B (Éxito) --</option>
                                {valoresUnicosB.map(val => <option key={val} value={val}>{val}</option>)}
                            </select>
                        )}
                    </div>
                </div>
            ) : varSeleccionada ? (
                <div style={{ padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: RADIUS, fontSize: FS.xs, marginBottom: '15px' }}>
                    Para usar esta función, debes importar una "Matriz" que contenga columnas identificadas.
                </div>
            ) : null}

            <button 
                onClick={calcular} 
                className="button_calcular btn-icon" 
                style={{ width: 'fit-content', alignSelf: 'center', padding: '8px 35px', borderRadius: RADIUS, fontSize: FS.md, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}
                disabled={!varSeleccionada || !colA || !valA || !colB || !valB}
            >
                <IconoCalculadora />
                CALCULAR
            </button>
        </div>
    );
}
