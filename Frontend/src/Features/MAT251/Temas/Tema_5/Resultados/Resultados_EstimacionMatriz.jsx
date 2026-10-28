import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import StatLabel from '../../../ui/StatLabel';

export default function Resultados_EstimacionMatriz({ resultados, parametro }) {
    if (!resultados) return null;

    const renderKatex = (math) => (
        <span dangerouslySetInnerHTML={{ __html: katex.renderToString(math, { throwOnError: false }) }} />
    );
    const formatDecimal = (valor) => Number(valor).toFixed(2);
    const formatDato = (valor) => {
        const numerico = Number(valor);
        return valor !== '' && Number.isFinite(numerico)
            ? (Number.isInteger(numerico) ? String(valor) : numerico.toFixed(2))
            : String(valor);
    };
    const datosVarianza = parametro === 'varianza' && Array.isArray(resultados.calculos?.numDatos)
        ? resultados.calculos.numDatos
        : null;
    const datosMedia = parametro === 'media' && Array.isArray(resultados.calculos?.numDatos)
        ? resultados.calculos.numDatos
        : null;
    const datosProporcion = parametro === 'proporcion' && Array.isArray(resultados.calculos?.numDatos)
        ? resultados.calculos.numDatos
        : null;
    const sumaDatosMedia = datosMedia?.reduce((suma, valor) => suma + valor, 0);
    const sumaCuadradosDesviaciones = datosVarianza?.reduce(
        (suma, valor) => suma + (valor - resultados.calculos.media) ** 2,
        0
    );

    const columnas = [
        {
            key: 'n_muestra',
            formula: 'n',
            valor: renderKatex(`${resultados.n}`)
        }
    ];

    if (parametro === 'media') {
        columnas.push(
            { key: 'suma_muestral', formula: '\\sum X_i', valor: renderKatex(formatDecimal(resultados.calculos.suma)) },
            { key: 'desviacion_muestral', formula: 'S', valor: renderKatex(formatDecimal(resultados.calculos.desviacion)) },
            { key: 'estimador_media_puntual', formula: '\\hat{\\mu}', valor: renderKatex(formatDecimal(resultados.estimacion)) }
        );
    } else if (parametro === 'proporcion') {
        columnas.push(
            { key: 'x', formula: 'x', valor: renderKatex(`${resultados.calculos?.x ?? ''}`) },
            {
                key: 'p_sombrero',
                formula: '\\hat{p}',
                valor: renderKatex(`${formatDecimal(resultados.estimacion)}\\;(${(resultados.estimacion * 100).toFixed(2)}\\%)`)
            }
        );
    } else if (parametro === 'varianza') {
        columnas.push(
            { key: 'x_barra', formula: '\\bar{X}', valor: renderKatex(formatDecimal(resultados.calculos?.media ?? 0)) },
            { key: 'desviacion_muestral', formula: 'S', valor: renderKatex(formatDecimal(resultados.calculos?.desviacion ?? 0)) },
            { key: 's2', formula: 'S^2', valor: renderKatex(formatDecimal(resultados.estimacion)) }
        );
    }

    return (
        <div className="tema5-resultados-pure" style={{ width: '100%' }}>
            <div id="tour-t5-resultados-matriz" className="tema5-tabla-estimacion-wrapper">
                <table className="tema5-tabla-estimacion">
                    <thead>
                        <tr>
                            {columnas.map((columna) => (
                                <th key={columna.key}>
                                    <StatLabel formulaKey={columna.key} formulaLatex={columna.formula} align="center" position="top" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {columnas.map((columna) => (
                                <td key={columna.key}>{columna.valor}</td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>

            {datosMedia && (
                <section id="tour-t5-resolucion-paso-a-paso" className="tema5-resolucion-estimacion">
                    <h4>Desarrollo paso a paso de la media muestral</h4>
                    <div className={`tema5-tabla-estimacion-wrapper${datosMedia.length > 10 ? ' tema5-tabla-resolucion-scroll' : ''}`}>
                        <table className="tema5-tabla-estimacion tema5-tabla-resolucion">
                            <thead>
                                <tr>
                                    <th><StatLabel formulaKey="indice_muestra" formulaLatex="i" align="center" position="bottom" /></th>
                                    <th><StatLabel formulaKey="x_i" formulaLatex="x_i" align="center" position="bottom" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {datosMedia.map((valor, indice) => (
                                    <tr key={`${indice}-${valor}`}>
                                        <td>{renderKatex(`${indice + 1}`)}</td>
                                        <td>{renderKatex(formatDato(valor))}</td>
                                    </tr>
                                ))}
                                <tr className="tema5-fila-suma">
                                    <td>{renderKatex('\\boldsymbol{\\sum}')}</td>
                                    <td>{renderKatex(formatDecimal(sumaDatosMedia))}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="tema5-resultado-final">
                        <h5>Resultado final</h5>
                        <p className="tema5-formula-resolucion">
                            <StatLabel formulaKey="x_barra" formulaLatex={'\\bar{X}'} align="center" position="top" />
                            {renderKatex(`= \\frac{${formatDecimal(sumaDatosMedia)}}{${datosMedia.length}} = \\mathbf{${formatDecimal(resultados.estimacion)}}`)}
                        </p>
                    </div>
                </section>
            )}

            {datosVarianza && (
                <section id="tour-t5-resolucion-paso-a-paso" className="tema5-resolucion-estimacion">
                    <h4>Desarrollo paso a paso de la varianza muestral</h4>
                    <div className={`tema5-tabla-estimacion-wrapper${datosVarianza.length > 10 ? ' tema5-tabla-resolucion-scroll' : ''}`}>
                        <table className="tema5-tabla-estimacion tema5-tabla-resolucion">
                            <thead>
                                <tr>
                                    <th><StatLabel formulaKey="indice_muestra" formulaLatex="i" align="center" position="bottom" /></th>
                                    <th><StatLabel formulaKey="x_i" formulaLatex="x_i" align="center" position="bottom" /></th>
                                    <th><StatLabel formulaKey="desviacion_observacion" formulaLatex={'x_i - \\bar{X}'} align="center" position="bottom" /></th>
                                    <th><StatLabel formulaKey="desviacion_observacion_cuadrado" formulaLatex={'(x_i - \\bar{X})^2'} align="center" position="bottom" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {datosVarianza.map((valor, indice) => {
                                    const desviacion = valor - resultados.calculos.media;
                                    return (
                                        <tr key={`${indice}-${valor}`}>
                                            <td>{renderKatex(`${indice + 1}`)}</td>
                                            <td>{renderKatex(formatDato(valor))}</td>
                                            <td>{renderKatex(formatDecimal(desviacion))}</td>
                                            <td>{renderKatex(formatDecimal(desviacion ** 2))}</td>
                                        </tr>
                                    );
                                })}
                                <tr className="tema5-fila-suma">
                                    <td>{renderKatex('\\boldsymbol{\\sum}')}</td>
                                    <td>{renderKatex(formatDecimal(datosVarianza.reduce((suma, valor) => suma + valor, 0)))}</td>
                                    <td>{renderKatex('0.00')}</td>
                                    <td>{renderKatex(formatDecimal(sumaCuadradosDesviaciones))}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="tema5-resultado-final">
                        <h5>Resultado final</h5>
                        <p className="tema5-formula-resolucion">
                            <StatLabel formulaKey="s2" formulaLatex="S^2" align="center" position="top" />
                            {renderKatex(`= \\frac{${formatDecimal(sumaCuadradosDesviaciones)}}{${datosVarianza.length} - 1} = \\mathbf{${formatDecimal(resultados.estimacion)}}`)}
                        </p>
                    </div>
                </section>
            )}

            {datosProporcion && (
                <section id="tour-t5-resolucion-paso-a-paso" className="tema5-resolucion-estimacion">
                    <h4>Desarrollo paso a paso de la proporción muestral</h4>
                    <div className={`tema5-tabla-estimacion-wrapper${datosProporcion.length > 10 ? ' tema5-tabla-resolucion-scroll' : ''}`}>
                        <table className="tema5-tabla-estimacion tema5-tabla-resolucion">
                            <thead>
                                <tr>
                                    <th><StatLabel formulaKey="indice_muestra" formulaLatex="i" align="center" position="bottom" /></th>
                                    <th><StatLabel formulaKey="x_i" formulaLatex="x_i" align="center" position="bottom" /></th>
                                    <th><StatLabel formulaKey="indicador_exito" formulaLatex="I_i" align="center" position="bottom" /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {datosProporcion.map((valor, indice) => {
                                    const esExito = String(valor).trim() === String(resultados.calculos.valorExito).trim();
                                    return (
                                        <tr key={`${indice}-${String(valor)}`}>
                                            <td>{renderKatex(`${indice + 1}`)}</td>
                                            <td>{formatDato(valor)}</td>
                                            <td>{renderKatex(esExito ? '1' : '0')}</td>
                                        </tr>
                                    );
                                })}
                                <tr className="tema5-fila-suma">
                                    <td>{renderKatex('\\boldsymbol{\\sum}')}</td>
                                    <td />
                                    <td>{renderKatex(`${resultados.calculos.x}`)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="tema5-resultado-final">
                        <h5>Resultado final</h5>
                        <p className="tema5-formula-resolucion">
                            <StatLabel formulaKey="p_sombrero" formulaLatex={'\\hat{p}'} align="center" position="top" />
                            {renderKatex(`= \\frac{${resultados.calculos.x}}{${resultados.n}} = \\mathbf{${formatDecimal(resultados.estimacion)}}\\; (\\mathbf{${(resultados.estimacion * 100).toFixed(2)}\\%})`)}
                        </p>
                    </div>
                </section>
            )}
        </div>
    );
}
