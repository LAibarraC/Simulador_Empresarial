import { forwardRef } from 'react';
import { ESTADOS, GRUPOS_INDICADORES, formatearTamano } from './calculosFinancieros';
import { GraficoComposicion, GraficoVariacion } from './GraficosFinancieros';
import { TablaIndicadores } from './IndicadoresFinancieros';

/*
 * Documento oculto que se rasteriza al exportar. Cada [data-pdf-block] se captura por separado
 * para paginar sin cortar filas ni gráficos a la mitad.
 */

const COLUMNAS = <colgroup><col/><col style={{ width: '15%' }}/><col style={{ width: '15%' }}/><col style={{ width: '9%' }}/><col style={{ width: '9%' }}/><col style={{ width: '14%' }}/><col style={{ width: '10%' }}/></colgroup>;

function Celdas({ linea, formato }) {
  return <>
    <td className="avh-num">{formato.moneda(linea.anterior)}</td>
    <td className="avh-num">{formato.moneda(linea.actual)}</td>
    <td className="avh-num">{formato.pct(linea.pesoAnterior)}</td>
    <td className="avh-num">{formato.pct(linea.pesoActual)}</td>
    <td className={`avh-num avh-strong ${linea.tono}`}>{formato.monedaConSigno(linea.cambio)}</td>
    <td className={`avh-num avh-strong ${linea.tono}`}>{formato.pctConSigno(linea.cambioPct)}</td>
  </>;
}

function SeccionEstado({ estado, bloques, totales, periodos, formato }) {
  const conCuentas = bloques.filter(bloque => bloque.cuentas.length || bloque.calculadas.length);
  return <>
    <div data-pdf-block className="avh-pdf-section-title">
      <h2>{estado.nombre}</h2>
      <p>Análisis vertical sobre {estado.baseConArticulo} de cada periodo y análisis horizontal frente a {periodos.anterior}.</p>
      <table className="avh-table avh-pdf-table">{COLUMNAS}<thead><tr><th>Cuenta</th><th className="avh-num">{periodos.anterior}</th><th className="avh-num">{periodos.actual}</th><th className="avh-num">% base</th><th className="avh-num">% actual</th><th className="avh-num">Var. absoluta</th><th className="avh-num">Var. %</th></tr></thead></table>
    </div>
    {conCuentas.map(({ categoria, cuentas, subtotal, calculadas }) => <div data-pdf-block key={categoria.id}>
      <table className="avh-table avh-pdf-table">{COLUMNAS}<tbody>
        {cuentas.length > 0 && <tr className={`avh-section-row ${categoria.grupo}`}><td>{categoria.nombre}</td><Celdas linea={subtotal} formato={formato}/></tr>}
        {cuentas.map(cuenta => <tr key={cuenta.id} className="avh-row"><td className="avh-td-name">{cuenta.nombre}</td><Celdas linea={cuenta} formato={formato}/></tr>)}
        {calculadas.map(linea => <tr key={linea.id} className="avh-total-row"><td>{linea.nombre}</td><Celdas linea={linea} formato={formato}/></tr>)}
      </tbody></table>
    </div>)}
    {conCuentas.length > 0 && <div data-pdf-block className="avh-charts-grid avh-pdf-charts">
      <GraficoComposicion estado={estado} totales={totales} periodos={periodos} formato={formato}/>
      <GraficoVariacion bloques={bloques} formato={formato}/>
    </div>}
  </>;
}

const ReportePdfFinanciero = forwardRef(function ReportePdfFinanciero({ caso, contenido, periodos, formato, totales, analisis, indicadores, imagenes = [] }, ref) {
  const { actual, anterior } = totales;
  const margen = actual.resultados.ingresos ? (actual.resultados.utilidadNeta / actual.resultados.ingresos) * 100 : null;
  const kpis = [
    ['Activos totales', formato.moneda(actual.balance.activos), formato.moneda(anterior.balance.activos)],
    ['Ingresos netos', formato.moneda(actual.resultados.ingresos), formato.moneda(anterior.resultados.ingresos)],
    ['Utilidad neta', formato.moneda(actual.resultados.utilidadNeta), formato.moneda(anterior.resultados.utilidadNeta)],
    ['Margen neto', formato.pct(margen), '']
  ];

  return <div ref={ref} className="avh-report" aria-hidden="true">
    <div data-pdf-block>
      <header className="avh-pdf-header">
        <div><span className="avh-pdf-brand">AE</span><div><h1>Análisis vertical y horizontal</h1><p>Diagnóstico empresarial interno · Fase 4</p></div></div>
        <span className="avh-pdf-tag">REPORTE COMPLETO</span>
      </header>
      <div className="avh-pdf-meta">
        <div><small>Caso de estudio</small><strong>{caso?.titulo || caso?.nombre || 'Caso empresarial'}</strong></div>
        <div><small>Sector</small><strong>{caso?.sector || caso?.categoria || 'No especificado'}</strong></div>
        <div><small>Periodos</small><strong>{periodos.anterior} → {periodos.actual}</strong></div>
        <div><small>Moneda · fecha</small><strong>{contenido.moneda} · {new Date().toLocaleDateString('es-BO')}</strong></div>
      </div>
      <div className="avh-pdf-kpis">{kpis.map(([titulo, valor, previo]) => <div key={titulo}><small>{titulo}</small><strong>{valor}</strong>{previo && <span>{periodos.anterior}: {previo}</span>}</div>)}</div>
    </div>

    {analisis.map(({ estado, bloques }) => <SeccionEstado key={estado.id} estado={ESTADOS.find(item => item.id === estado.id)} bloques={bloques} totales={totales} periodos={periodos} formato={formato}/>)}

    <div data-pdf-block className="avh-pdf-section-title"><h2>Indicadores financieros</h2><p>Referencias orientativas; deben contrastarse con el sector del caso.</p></div>
    {GRUPOS_INDICADORES.map(grupo => <div data-pdf-block key={grupo.id} className="avh-pdf-ratios">
      <TablaIndicadores grupo={grupo} indicadores={indicadores.filter(item => item.grupo === grupo.id)} periodos={periodos} formato={formato} detallado/>
    </div>)}

    <div data-pdf-block className="avh-pdf-block">
      <h2>Conclusión y propuesta de mejora</h2>
      <p className="avh-pdf-notes">{contenido.hallazgos.trim() || 'El estudiante aún no registró su conclusión.'}</p>
    </div>

    {contenido.documentos.length > 0 && <div data-pdf-block className="avh-pdf-block">
      <h2>Documentación de respaldo</h2>
      <table className="avh-table avh-pdf-table"><colgroup><col style={{ width: '6%' }}/><col style={{ width: '38%' }}/><col/><col style={{ width: '12%' }}/></colgroup>
        <thead><tr><th>#</th><th>Archivo</th><th>Descripción</th><th className="avh-num">Tamaño</th></tr></thead>
        <tbody>{contenido.documentos.map((documento, indice) => <tr key={documento.id} className="avh-row"><td>{indice + 1}</td><td className="avh-td-name">{documento.nombre}</td><td className="avh-td-name">{documento.descripcion || '—'}</td><td className="avh-num">{formatearTamano(documento.tamano)}</td></tr>)}</tbody>
      </table>
    </div>}
    {imagenes.map((imagen, indice) => <div data-pdf-block key={imagen.id} className="avh-pdf-block avh-pdf-image">
      <h3>Anexo {indice + 1} · {imagen.nombre}</h3>
      {imagen.descripcion && <p>{imagen.descripcion}</p>}
      <img src={imagen.src} alt={imagen.nombre}/>
    </div>)}
  </div>;
});

export default ReportePdfFinanciero;
