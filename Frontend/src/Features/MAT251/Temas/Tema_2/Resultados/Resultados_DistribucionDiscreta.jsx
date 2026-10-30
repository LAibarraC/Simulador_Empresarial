import React, { useMemo } from 'react';
import katex from 'katex';
import "katex/dist/katex.min.css";
import GraficoBastonesDiscreta from "../../../Graficas/Tema_2/GraficoBastonesDiscreta";
import { FONT, FS, RADIUS } from "../../../Principal/Constantes";
import "../../../styles/Temas/Tema2.css";
import StatLabel from "../../../ui/StatLabel";

const LatexText = React.memo(({ math }) => {
    return <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />;
});

export default function Resultados_DistribucionDiscreta({ resultados, vista, setVista }) {
    const { ordenMomento, propA, propB } = vista;
    const setOrdenMomento = valor => setVista(prev => ({ ...prev, ordenMomento: valor }));
    const setPropA = valor => setVista(prev => ({ ...prev, propA: valor }));
    const setPropB = valor => setVista(prev => ({ ...prev, propB: valor }));

    // Cálculo interactivo del momento solicitado
    const momentoCalculado = useMemo(() => {
        if (!resultados || !resultados.datos) return 0;
        const r = Number(ordenMomento);
        if (!Number.isSafeInteger(r) || r < 1) return null;
        const momento = resultados.datos.reduce((acc, d) => d.p === 0 ? acc : acc + (Math.pow(d.x, r) * d.p), 0);
        return Number.isFinite(momento) ? momento : null;
    }, [resultados, ordenMomento]);

    const renderLatex = (str) => {
        return <LatexText math={str} />;
    };

    const cardStyle = { 
        background: 'transparent',
        color: 'var(--text-pure)',
        fontFamily: FONT,
        padding: '0px 0',
        height: '100%',
        boxSizing: 'border-box'
    };

    if (!resultados) return null;

    if (resultados.error) {
        return (
            <div style={cardStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.8, color: '#ef4444' }}>
                    <p>{resultados.error}</p>
                </div>
            </div>
        );
    }

    // Desgloses visuales a partir de resultados.datos
    const desgloseEX = resultados.datos.map(d => `(${d.x} \\times ${parseFloat(d.p.toFixed(4))})`).join(' + ');
    const esperanzaX2 = resultados.datos.reduce((acc, d) => acc + (d.x ** 2) * d.p, 0);
    const desgloseVar = `${esperanzaX2.toFixed(4)} - (${resultados.esperanza.toFixed(4)})^2`;
    
    // Comprobación interactiva de propiedades
    const evalA = parseFloat(propA) || 0;
    const evalB = parseFloat(propB) || 0;
    const propEsperanza = evalA * resultados.esperanza + evalB;
    const propVarianza = (evalA ** 2) * resultados.varianza;

    const totalF = resultados && resultados.datos ? resultados.datos.reduce((acc, d) => acc + (d.f !== undefined ? d.f : 0), 0) : 0;
    const totalP = resultados && resultados.datos ? resultados.datos.reduce((acc, d) => acc + (Number(d.p) || 0), 0) : 0;

    return (
        <div style={cardStyle}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', paddingRight: '5px' }}>

                {/* Tabla de Distribución y Desglose (Combinada) */}
                <div id="tour-discreta-tabla-probabilidad" style={{ marginBottom: '10px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-pure)', fontSize: FS.sm, fontWeight: 700, fontFamily: FONT }}>
                        Distribución de Probabilidad:
                    </h4>
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ 
                            width: '100%', 
                            borderCollapse: 'collapse', 
                            textAlign: 'center', 
                            fontSize: FS.sx, 
                            fontFamily: FONT,
                            color: 'var(--text-pure)'
                        }}>
                            <thead style={{ backgroundColor: 'var(--bg-input)' }}>
                                <tr className="table-header-responsive" style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                                    <th style={{ padding: '8px 6px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold', fontSize: 'clamp(0.72rem, 2.2vw, 0.85rem)', whiteSpace: 'nowrap' }}>
                                        <StatLabel formulaKey="x_i" formulaLatex="\boldsymbol{x_i}" align="center" />
                                    </th>
                                    {resultados.datos.some(d => d.f !== undefined) && (
                                        <th style={{ padding: '8px 6px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold', fontSize: 'clamp(0.72rem, 2.2vw, 0.85rem)', whiteSpace: 'nowrap' }}>
                                            <StatLabel formulaKey="f_i" formulaLatex="\boldsymbol{f_i}" align="center" />
                                        </th>
                                    )}
                                    <th style={{ padding: '8px 6px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold', fontSize: 'clamp(0.72rem, 2.2vw, 0.85rem)', whiteSpace: 'nowrap' }}>
                                        <StatLabel formulaKey="P(X)" formulaLatex="\boldsymbol{P(x_i)}" align="center" />
                                    </th>
                                    <th style={{ padding: '8px 6px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold', fontSize: 'clamp(0.72rem, 2.2vw, 0.85rem)', whiteSpace: 'nowrap' }}>
                                        <StatLabel formulaKey="xi_pi" formulaLatex="\boldsymbol{x_i \cdot P(x_i)}" align="center" />
                                    </th>
                                    <th style={{ padding: '8px 6px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold', fontSize: 'clamp(0.72rem, 2.2vw, 0.85rem)', whiteSpace: 'nowrap' }}>
                                        <StatLabel formulaKey="xi2_pi" formulaLatex="\boldsymbol{x_i^2 \cdot P(x_i)}" align="center" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultados.datos.map((d, i) => (
                                    <tr key={i}>
                                        <td style={{ padding: '6px 4px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: 'clamp(0.72rem, 2vw, 0.8rem)', whiteSpace: 'nowrap' }}>
                                            {renderLatex(`${d.x}`)}
                                        </td>
                                        {d.f !== undefined && (
                                            <td style={{ padding: '6px 4px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: 'clamp(0.72rem, 2vw, 0.8rem)', whiteSpace: 'nowrap' }}>
                                                {renderLatex(`${d.f}`)}
                                            </td>
                                        )}
                                        <td style={{ padding: '6px 4px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: 'clamp(0.72rem, 2vw, 0.8rem)', whiteSpace: 'nowrap' }}>
                                            {renderLatex(`${Number(d.p).toFixed(4)}`)}
                                        </td>
                                        <td style={{ padding: '6px 4px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: 'clamp(0.72rem, 2vw, 0.8rem)', whiteSpace: 'nowrap' }}>
                                            {renderLatex(`${(d.x * d.p).toFixed(4)}`)}
                                        </td>
                                        <td style={{ padding: '6px 4px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: 'clamp(0.72rem, 2vw, 0.8rem)', whiteSpace: 'nowrap' }}>
                                            {renderLatex(`${((d.x ** 2) * d.p).toFixed(4)}`)}
                                        </td>
                                    </tr>
                                ))}
                                <tr style={{ fontWeight: 'bold', backgroundColor: 'var(--bg-input)', color: 'var(--text-pure)' }}>
                                    <td style={{ padding: '6px 4px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'bold', fontSize: 'clamp(0.72rem, 2vw, 0.8rem)', whiteSpace: 'nowrap' }}>Total / Suma</td>
                                    {resultados.datos.some(d => d.f !== undefined) && (
                                        <td style={{ padding: '6px 4px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: 'clamp(0.72rem, 2vw, 0.8rem)', whiteSpace: 'nowrap' }}>
                                            {renderLatex(`${totalF}`)}
                                        </td>
                                    )}
                                    <td style={{ padding: '6px 4px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: 'clamp(0.72rem, 2vw, 0.8rem)', whiteSpace: 'nowrap' }}>
                                        {renderLatex(`${totalP.toFixed(4)}`)}
                                    </td>
                                    <td style={{ padding: '6px 4px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: 'clamp(0.72rem, 2vw, 0.8rem)', whiteSpace: 'nowrap' }}>
                                        {renderLatex(`\\sum = ${resultados.esperanza.toFixed(4)}`)}
                                    </td>
                                    <td style={{ padding: '6px 4px', verticalAlign: 'middle', border: '1px solid var(--text-pure)', color: 'var(--text-pure)', fontWeight: 'normal', fontSize: 'clamp(0.72rem, 2vw, 0.8rem)', whiteSpace: 'nowrap' }}>
                                        {renderLatex(`\\sum = ${esperanzaX2.toFixed(4)}`)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Esperanza Matemática */}
                <div id="tour-discreta-esperanza" style={{ marginBottom: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', textAlign: 'center', color: 'var(--text-pure)', fontSize: FS.sm, fontWeight: 700, fontFamily: FONT }}>
                        Esperanza Matemática {renderLatex('E(X)')}
                    </h4>
                    <div className="katex-responsive-container" style={{ width: '100%', maxWidth: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-pure)', boxSizing: 'border-box' }}>
                        <div className="formula-general-box formula-scroll-container thin-scrollbar" style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', marginBottom: '5px', padding: '5px 0', background: 'transparent', border: 'none', borderRadius: RADIUS, textAlign: 'center', color: 'var(--text-pure)', boxSizing: 'border-box' }}>
                            <div className="formula-general-box" style={{ color: 'var(--text-pure)', display: 'inline-block', minWidth: 'max-content' }}>
                                {renderLatex(`E(X) = \\sum x_i \\cdot P(X = x_i)`)}
                            </div>
                        </div>
                        <div className="formula-desarrollo-box formula-scroll-container thin-scrollbar" style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', background: 'var(--bg-input)', border: 'none', padding: '15px 10px', borderRadius: RADIUS, textAlign: 'left', color: 'var(--text-pure)', boxSizing: 'border-box' }}>
                            <div style={{ color: 'var(--text-pure)', display: 'inline-block', minWidth: 'max-content', textAlign: 'left' }}>
                                <div style={{ marginBottom: '8px' }}>
                                    {renderLatex(`E(X) = ${desgloseEX}`)}
                                </div>
                                <div style={{ fontWeight: 'normal' }}>
                                    {renderLatex(`E(X) = \\mathbf{${resultados.esperanza.toFixed(4)}}`)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Varianza y Desviación */}
                <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                        <div id="tour-discreta-varianza" style={{ flex: 1, minWidth: '200px' }}>
                            <h4 style={{ margin: '0 0 10px 0', textAlign: 'center', color: 'var(--text-pure)', fontSize: FS.sm, fontWeight: 700, fontFamily: FONT }}>
                                Varianza {renderLatex('V(X)')}
                            </h4>
                            <div className="katex-responsive-container" style={{ width: '100%', maxWidth: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-pure)', boxSizing: 'border-box' }}>
                                <div className="formula-general-box formula-scroll-container thin-scrollbar" style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', marginBottom: '5px', padding: '5px 0', background: 'transparent', border: 'none', borderRadius: RADIUS, textAlign: 'center', color: 'var(--text-pure)', boxSizing: 'border-box' }}>
                                    <div className="formula-general-box" style={{ color: 'var(--text-pure)', display: 'inline-block', minWidth: 'max-content' }}>
                                        {renderLatex(`V(X) = E(X^2) - [E(X)]^2`)}
                                    </div>
                                </div>
                                <div className="formula-desarrollo-box formula-scroll-container thin-scrollbar" style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', background: 'var(--bg-input)', border: 'none', padding: '15px 10px', borderRadius: RADIUS, textAlign: 'left', color: 'var(--text-pure)', boxSizing: 'border-box' }}>
                                    <div style={{ color: 'var(--text-pure)', display: 'inline-block', minWidth: 'max-content', textAlign: 'left' }}>
                                        <div style={{ marginBottom: '8px' }}>
                                            {renderLatex(`V(X) = ${desgloseVar}`)}
                                        </div>
                                        <div style={{ fontWeight: 'normal' }}>
                                            {renderLatex(`V(X) = \\mathbf{${resultados.varianza.toFixed(4)}}`)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="tour-discreta-desviacion" style={{ flex: 1, minWidth: '200px' }}>
                            <h4 style={{ margin: '0 0 10px 0', textAlign: 'center', color: 'var(--text-pure)', fontSize: FS.sm, fontWeight: 700, fontFamily: FONT }}>
                                Desviación Estándar {renderLatex('\\sigma')}
                            </h4>
                            <div className="katex-responsive-container" style={{ width: '100%', maxWidth: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-pure)', boxSizing: 'border-box' }}>
                                <div className="formula-general-box formula-scroll-container thin-scrollbar" style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', marginBottom: '5px', padding: '5px 0', background: 'transparent', border: 'none', borderRadius: RADIUS, textAlign: 'center', color: 'var(--text-pure)', boxSizing: 'border-box' }}>
                                    <div className="formula-general-box" style={{ color: 'var(--text-pure)', display: 'inline-block', minWidth: 'max-content' }}>
                                        {renderLatex(`\\sigma = \\sqrt{V(X)}`)}
                                    </div>
                                </div>
                                <div className="formula-desarrollo-box formula-scroll-container thin-scrollbar" style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', background: 'var(--bg-input)', border: 'none', padding: '15px 10px', borderRadius: RADIUS, textAlign: 'left', color: 'var(--text-pure)', boxSizing: 'border-box' }}>
                                    <div style={{ color: 'var(--text-pure)', display: 'inline-block', minWidth: 'max-content', textAlign: 'left' }}>
                                        <div style={{ marginBottom: '8px' }}>
                                            {renderLatex(`\\sigma = \\sqrt{${resultados.varianza.toFixed(4)}}`)}
                                        </div>
                                        <div style={{ fontWeight: 'normal' }}>
                                            {renderLatex(`\\sigma = \\mathbf{${resultados.desviacion.toFixed(4)}}`)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Momentos de la Variable Aleatoria */}
                <div id="tour-discreta-momentos" style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px 0', textAlign: 'center', color: 'var(--text-pure)', fontSize: FS.sm, fontWeight: 700, fontFamily: FONT }}>
                        Momentos de la Variable Aleatoria {renderLatex('\\mu\'_r')}
                    </h4>
                    <div className="katex-responsive-container" style={{ width: '100%', maxWidth: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--text-pure)', boxSizing: 'border-box' }}>
                        <div className="formula-general-box formula-scroll-container thin-scrollbar" style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', marginBottom: '5px', padding: '5px 0', background: 'transparent', border: 'none', borderRadius: RADIUS, textAlign: 'center', color: 'var(--text-pure)', boxSizing: 'border-box' }}>
                            <div className="formula-general-box" style={{ color: 'var(--text-pure)', display: 'inline-block', minWidth: 'max-content' }}>
                                {renderLatex(`\\mu'_{r} = E(X^r) = \\sum x_i^r \\cdot P(x_i)`)}
                            </div>
                        </div>
                        <div className="formula-desarrollo-box formula-scroll-container thin-scrollbar" style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'auto', background: 'var(--bg-input)', border: 'none', padding: '12px 10px', borderRadius: RADIUS, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', textAlign: 'left', color: 'var(--text-pure)', boxSizing: 'border-box' }}>
                            <div style={{ fontWeight: 'normal', textAlign: 'left' }}>
                                {renderLatex(`\\mu'_{${ordenMomento || 'r'}} = E(X^{${ordenMomento || 'r'}}) = \\mathbf{${momentoCalculado === null ? "\\text{No válido}" : momentoCalculado.toFixed(4)}}`)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ fontSize: FS.sm, color: 'var(--text-pure)', fontFamily: FONT, display: 'inline-flex', alignItems: 'center' }}>
                                    {renderLatex('r:')}
                                </label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    step="1" 
                                    value={ordenMomento} 
                                    onChange={(e) => setOrdenMomento(e.target.value)}
                                    className="input-mat251"
                                    style={{ width: '120px', padding: '8px 10px', borderRadius: RADIUS, border: '1px solid var(--border-color)', textAlign: 'center', fontFamily: FONT, fontSize: '0.9rem', fontWeight: 'normal', background: 'var(--bg-card)', color: 'var(--text-pure)', boxSizing: 'border-box' }}
                                    title="Ingresar orden del momento"
                                />
                            </div>
                        </div>
                    </div>
                </div>


                {/* Propiedades de Esperanza y Varianza (Oculto temporalmente) */}
                {false && (
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                        <h4 style={{ margin: 0, color: 'var(--primary-color, #3b82f6)' }}>Propiedades: Y = aX + b</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>a:</label>
                            <input 
                                type="number" 
                                value={propA} 
                                onChange={(e) => setPropA(e.target.value)}
                                style={{ width: '60px', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color, #cbd5e1)', textAlign: 'center' }}
                            />
                            <label style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>b:</label>
                            <input 
                                type="number" 
                                value={propB} 
                                onChange={(e) => setPropB(e.target.value)}
                                style={{ width: '60px', padding: '6px', borderRadius: '6px', border: '1px solid var(--border-color, #cbd5e1)', textAlign: 'center' }}
                            />
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <div style={{ padding: '15px', background: 'var(--bg-input, #f8fafc)', borderRadius: '8px' }}>
                                <div style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)', fontWeight: 600, color: 'var(--text-muted, #64748b)', marginBottom: '10px' }}>Propiedad Esperanza</div>
                                <div style={{ padding: '10px', background: 'var(--bg-card, #fff)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '6px', textAlign: 'center', marginBottom: '15px' }}>
                                    <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.95rem)' }}>
                                        {renderLatex(`E(aX + b) = aE(X) + b`)}
                                    </div>
                                </div>
                                <div style={{ fontSize: 'clamp(0.65rem, 1.8vw, 0.85rem)', color: 'var(--text-muted, #64748b)', marginBottom: '10px' }}>
                                    {renderLatex(`E(${evalA}X + ${evalB}) = ${evalA}(${resultados.esperanza.toFixed(4)}) + ${evalB}`)}
                                </div>
                                <div style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)', fontWeight: 'bold', color: 'var(--text-main, #1e293b)' }}>
                                    {renderLatex(`E(Y) = ${propEsperanza.toFixed(4)}`)}
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <div style={{ padding: '15px', background: 'var(--bg-input, #f8fafc)', borderRadius: '8px' }}>
                                <div style={{ fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)', fontWeight: 600, color: 'var(--text-muted, #64748b)', marginBottom: '10px' }}>Propiedad Varianza</div>
                                <div style={{ padding: '10px', background: 'var(--bg-card, #fff)', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '6px', textAlign: 'center', marginBottom: '15px' }}>
                                    <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.95rem)' }}>
                                        {renderLatex(`V(aX + b) = a^2V(X)`)}
                                    </div>
                                </div>
                                <div style={{ fontSize: 'clamp(0.65rem, 1.8vw, 0.85rem)', color: 'var(--text-muted, #64748b)', marginBottom: '10px' }}>
                                    {renderLatex(`V(${evalA}X + ${evalB}) = (${evalA})^2(${resultados.varianza.toFixed(4)})`)}
                                </div>
                                <div style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)', fontWeight: 'bold', color: 'var(--text-main, #1e293b)' }}>
                                    {renderLatex(`V(Y) = ${propVarianza.toFixed(4)}`)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                )}

                {/* Gráfico de Función de Masa de Probabilidad (Bastones) */}
                <div id="tour-discreta-grafico" style={{ marginTop: '0px' }}>
                    <GraficoBastonesDiscreta datos={resultados.datos} />
                </div>

            </div>
        </div>
    );
}
