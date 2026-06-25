import React, { useEffect, useMemo } from 'react';
import { FONT, FS, RADIUS, cardStyle, labelStyle } from '../../../Principal/Constantes';
import DiagramaFlujoMuestreo from '../../../Graficas/Tema_1/DiagramaFlujoMuestreo';
import GraficoRepresentatividad from '../../../Graficas/Tema_1/GraficoRepresentatividad';
import MarcoWidgetMAT251 from '../../../ui/MarcoWidgetMAT251';
import { IconoCalculadora, EditarDatos } from '../../../../ui/iconos';
import { calcularMuestreo } from '../../../Matematicas/logica_Tema1';

export default function ResultadosMuestreo({
    varSeleccionada, filas,
    metodoMuestreo, setMetodoMuestreo,
    tamanoMuestra, setTamanoMuestra,
    varEstratificacion, setVarEstratificacion,
    resultado, setResultado,
    error, setError,
    statsDatos, abrirEditor
}) {

    const calcular = () => {
        if (!varSeleccionada) {
            setError("Importa una Matriz de Excel primero.");
            setResultado(null);
            return;
        }

        if (metodoMuestreo === 'estratificado' && (!varEstratificacion || varEstratificacion === '')) {
            setError("Para el Muestreo Estratificado es obligatorio seleccionar una Variable de Estratificación");
            return;
        }

        const res = calcularMuestreo(filas, varSeleccionada.nombresColumnas, metodoMuestreo, tamanoMuestra, varEstratificacion);
        if (res.error) {
            setError(res.error);
            setResultado(null);
        } else {
            setResultado(res.resultado);
            setError('');
        }
    };

    useEffect(() => {
        setResultado(null);
        setError('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [metodoMuestreo, tamanoMuestra, varEstratificacion, varSeleccionada, filas]);

    return (
        <div style={{ marginTop: '0px', fontFamily: FONT }}>
            <div style={{ ...cardStyle, marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div>
                        <span style={{ ...labelStyle, margin: 0 }}>Matriz Detectada (Población Total):</span>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                            <small title="Total de filas" style={{ color: 'var(--text-muted)', fontSize: FS.xs }}>
                                N = <strong style={{ color: 'var(--primary-color)' }}>{filas?.length || 0}</strong>
                            </small>
                        </div>
                    </div>
                    <button onClick={abrirEditor} className="btn-icon" style={{ borderRadius: RADIUS, fontSize: FS.sm, padding: '6px 14px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <EditarDatos /> Editar Datos
                    </button>
                </div>

                <h4 style={{ color: 'var(--primary-color)', margin: '0 0 15px 0', fontSize: FS.sm }}>Parámetros de Extracción:</h4>

                {varSeleccionada ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-start', background: 'var(--bg-input)', padding: '15px', borderRadius: RADIUS, border: '1px solid var(--border-color)' }}>
                        <div style={{ width: '100%', marginBottom: '5px' }}>
                            <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px', fontWeight: 600 }}>Método de Muestreo:</label>
                            <select value={metodoMuestreo} onChange={(e) => setMetodoMuestreo(e.target.value)} style={{ width: '100%', maxWidth: '300px', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '1px solid var(--primary-color)', background: '#fff', fontWeight: 600 }}>
                                <option value="mas">Muestreo Aleatorio Simple (MAS)</option>
                                <option value="sistematico">Muestreo Sistemático</option>
                                {varSeleccionada.nombresColumnas && varSeleccionada.nombresColumnas.length > 1 && (
                                    <option value="estratificado">Muestreo Estratificado</option>
                                )}
                            </select>
                        </div>

                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px', fontWeight: 600 }}>Tamaño de la Muestra (n):</label>
                            <input type="number" min="1" max={filas.length} value={tamanoMuestra} onChange={(e) => setTamanoMuestra(e.target.value)} placeholder={`Ej. ${Math.min(30, filas.length)}`} style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: '1px solid var(--border-color)' }} />
                        </div>

                        {varSeleccionada.nombresColumnas && varSeleccionada.nombresColumnas.length > 1 && (
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px', color: metodoMuestreo === 'estratificado' ? 'var(--primary-color)' : 'var(--text-main)', fontWeight: 'bold' }}>
                                    {metodoMuestreo === 'estratificado' ? 'Variable de Estratificación:' : 'Variable para Gráfico (Opcional):'}
                                </label>
                                <select value={varEstratificacion} onChange={(e) => setVarEstratificacion(e.target.value)} style={{ width: '100%', borderRadius: RADIUS, padding: '8px', fontSize: FS.sm, border: metodoMuestreo === 'estratificado' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)' }}>
                                    <option value="">{metodoMuestreo === 'estratificado' ? '-- Seleccionar Variable --' : '-- Usar Primera Columna --'}</option>
                                    {varSeleccionada.nombresColumnas.map(col => <option key={col} value={col}>{col}</option>)}
                                </select>
                            </div>
                        )}

                        <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button onClick={calcular} disabled={!tamanoMuestra} style={{ padding: '8px 30px', borderRadius: RADIUS, fontSize: FS.sm, fontWeight: 700, height: '38px', background: 'var(--primary-color)', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <IconoCalculadora /> EXTRAER MUESTRA
                            </button>
                        </div>
                    </div>
                ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: FS.sm }}>Importa una variable o matriz en el panel izquierdo para comenzar.</p>
                )}

                {error && <div style={{ marginTop: '15px', padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: RADIUS, border: '1px solid #f87171', fontWeight: 'bold', fontSize: FS.xs }}>{error}</div>}
            </div>

            {resultado && (
                <>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                        <div style={{ flex: 1, padding: '15px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: RADIUS, textAlign: 'center' }}>
                            <h5 style={{ margin: '0 0 5px 0', color: '#475569', fontSize: FS.xs }}>Población Original (N)</h5>
                            <span style={{ fontSize: FS.xl, fontWeight: 'bold', color: '#1e293b' }}>{resultado.N}</span> <span style={{ fontSize: FS.sm, color: '#64748b' }}>filas</span>
                        </div>
                        <div style={{ flex: 1, padding: '15px', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: RADIUS, textAlign: 'center' }}>
                            <h5 style={{ margin: '0 0 5px 0', color: '#064e3b', fontSize: FS.xs }}>Muestra Extraída (n)</h5>
                            <span style={{ fontSize: FS.xl, fontWeight: 'bold', color: '#059669' }}>{resultado.n}</span> <span style={{ fontSize: FS.sm, color: '#059669' }}>filas</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <MarcoWidgetMAT251 id="w-flujo-muestreo" titulo="Flujo de Extracción" anchoCompleto={true} alto="260px">
                            <div style={{ width: '100%', minWidth: 0, padding: '10px', overflowX: 'auto', overflowY: 'hidden' }}>
                                <DiagramaFlujoMuestreo N={resultado.N} n={resultado.n} metodo={metodoMuestreo} />
                            </div>
                            {metodoMuestreo === 'sistematico' && resultado.k !== null && resultado.r !== null && (
                                <div style={{ padding: '10px 15px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                                    <div style={{ background: '#eff6ff', padding: '8px 15px', borderRadius: RADIUS, border: '1px solid #bfdbfe', color: '#1e3a8a', fontSize: FS.sm }}>
                                        <strong>Intervalo de Salto (k):</strong> {resultado.k}
                                    </div>
                                    <div style={{ background: '#fdf4ff', padding: '8px 15px', borderRadius: RADIUS, border: '1px solid #fbcfe8', color: '#86198f', fontSize: FS.sm }}>
                                        <strong>Arranque Aleatorio (r):</strong> {resultado.r}
                                    </div>
                                </div>
                            )}
                        </MarcoWidgetMAT251>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <MarcoWidgetMAT251 id="w-grafico-m" titulo="Representatividad de la Muestra" anchoCompleto={true} alto="380px">
                            <div style={{ width: '100%', height: '100%', minWidth: 0, padding: '10px', overflowX: 'auto', overflowY: 'hidden' }}>
                                <GraficoRepresentatividad data={resultado.repData} />
                            </div>
                        </MarcoWidgetMAT251>
                    </div>

                    <div style={{ ...cardStyle, marginBottom: '20px' }}>
                        <h4 style={{ color: 'var(--primary-color)', margin: '0 0 10px 0', fontSize: FS.sm }}>Datos Resultantes (Muestra):</h4>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: RADIUS }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: FS.sm, textAlign: 'left' }}>
                                <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    <tr>
                                        <th style={{ padding: '12px 10px', borderBottom: '2px solid #cbd5e1', color: '#475569' }}>ID Muestra</th>
                                        {varSeleccionada.nombresColumnas && varSeleccionada.nombresColumnas.length > 0 ? (
                                            varSeleccionada.nombresColumnas.map((col, idx) => (
                                                <th key={idx} style={{ padding: '12px 10px', borderBottom: '2px solid #cbd5e1', color: '#475569' }}>{col}</th>
                                            ))
                                        ) : (
                                            <th style={{ padding: '12px 10px', borderBottom: '2px solid #cbd5e1', color: '#475569' }}>{varSeleccionada.nombre || "Datos"}</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultado.muestra.map((fila, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', background: i % 2 === 0 ? '#ffffff' : '#f8fafc', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '8px 10px', fontWeight: 'bold', color: '#64748b' }}>#{i + 1}</td>
                                            {varSeleccionada.nombresColumnas && varSeleccionada.nombresColumnas.length > 0 ? (
                                                fila.valor.split(' | ').map((val, idx) => (
                                                    <td key={idx} style={{ padding: '8px 10px' }}>{val.trim()}</td>
                                                ))
                                            ) : (
                                                <td style={{ padding: '8px 10px' }}>{fila.valor.trim()}</td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
