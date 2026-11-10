import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardPaste, LayoutList, Plus, Table2, Trash2, X } from 'lucide-react';
import { obtenerEstado, parsearTextoTabla, tieneSaldos, validarCuadre } from './calculosFinancieros';
import SelectorEstadoFinanciero from './SelectorEstadoFinanciero';

function ValidacionBalance({ totales, formato }) {
  const actual = validarCuadre(totales.actual.balance);
  const base = validarCuadre(totales.anterior.balance);
  const ok = actual.cuadra && base.cuadra;
  const Icono = ok ? CheckCircle2 : AlertTriangle;
  return <div className={`avh-alert ${ok ? 'ok' : 'warning'}`} role="status">
    <Icono size={16}/>
    <span><strong>{ok ? 'Balance cuadrado' : 'El balance no cuadra'}</strong> · Activo − Pasivo − Patrimonio: base <b>{formato.moneda(base.diferencia)}</b>, análisis <b>{formato.moneda(actual.diferencia)}</b> (tolerancia 0,5% del activo).</span>
  </div>;
}

function PanelImportar({ estado, onImportar, onCerrar }) {
  const [categoria, setCategoria] = useState(estado.categorias[0].id);
  const [texto, setTexto] = useState('');
  const items = useMemo(() => parsearTextoTabla(texto), [texto]);
  return <div className="avh-import" role="group" aria-label="Importar cuentas pegadas">
    <div className="avh-import-head">
      <strong><ClipboardPaste size={15}/> Pegar desde Excel o Sheets</strong>
      <span>Tres columnas: cuenta · periodo base · periodo de análisis</span>
      <button type="button" className="avh-btn-icon" onClick={onCerrar} aria-label="Cerrar"><X size={15}/></button>
    </div>
    <div className="avh-import-fields">
      <select className="avh-input" aria-label="Clasificación de destino" value={categoria} onChange={e => setCategoria(e.target.value)}>{estado.categorias.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}</select>
      <textarea className="avh-input avh-mono" aria-label="Datos pegados" rows="3" value={texto} onChange={e => setTexto(e.target.value)} placeholder={'Caja y bancos\t12000\t15500\nCuentas por cobrar\t8000\t9200'}/>
      <button type="button" className="avh-btn-primary" disabled={!items.length} onClick={() => { onImportar(estado.id, categoria, items); onCerrar(); }}><Plus size={14}/> Importar {items.length || ''}</button>
    </div>
  </div>;
}

/** Celdas de análisis (vertical + horizontal) comunes a cuentas, subtotales y totales. */
function CeldasAnalisis({ linea, formato }) {
  return <>
    <td className="avh-num avh-pct" data-label="% V. base">{formato.pct(linea.pesoAnterior)}</td>
    <td className="avh-num avh-pct" data-label="% V. actual">{formato.pct(linea.pesoActual)}</td>
    <td className={`avh-num avh-strong ${linea.tono}`} data-label="Var.">{formato.monedaConSigno(linea.cambio)}</td>
    <td className={`avh-num avh-strong ${linea.tono}`} data-label="Var. %">
      {linea.relevante && <i className="avh-dot-relevante" title="Variación relevante (supera el umbral)"/>}{formato.pctConSigno(linea.cambioPct)}
    </td>
  </>;
}

function FilaResumen({ linea, nombre, formato, periodos, clase, accion }) {
  return <tr className={clase}>
    <td className="avh-td-name">{accion ? <div className="avh-section-content"><span>{nombre}</span>{accion}</div> : nombre}</td>
    <td className="avh-num" data-label={periodos.anterior}>{formato.moneda(linea.anterior)}</td>
    <td className="avh-num" data-label={periodos.actual}>{formato.moneda(linea.actual)}</td>
    <CeldasAnalisis linea={linea} formato={formato}/>
    <td className="avh-td-action"/>
  </tr>;
}

export default function TablaEstadosFinancieros({ estadoActivo, onEstadoChange, filas, bloques, totales, formato, periodos, umbral, acciones }) {
  const [importando, setImportando] = useState(false);
  const estado = obtenerEstado(estadoActivo);
  const hayCuentas = filas.some(fila => fila.estado === estado.id);
  const filaPorId = useMemo(() => new Map(filas.map(fila => [fila.id, fila])), [filas]);

  return <section className="avh-card" aria-label="Estados financieros">
    <div className="avh-card-head">
      <h3 className="avh-card-title"><Table2 size={16}/> Estados financieros · análisis vertical y horizontal</h3>
      <div className="avh-actions">
        <SelectorEstadoFinanciero estadoActivo={estado.id} onCambio={onEstadoChange} filas={filas}/>
        <button type="button" className="avh-btn-outline" onClick={() => acciones.cargarEstructura(estado.id)} title="Añade las cuentas sugeridas sin borrar las tuyas"><LayoutList size={14}/> Estructura base</button>
        <button type="button" className={`avh-btn-outline${importando ? ' active' : ''}`} aria-expanded={importando} onClick={() => setImportando(valor => !valor)}><ClipboardPaste size={14}/> Pegar Excel</button>
      </div>
    </div>
    <p className="avh-card-desc">
      Escribe los saldos y todo se calcula al instante. <b>% vertical</b>: peso sobre {estado.baseConArticulo} del periodo. <b>Variación</b>: cambio frente al periodo base
      (<span className="positivo">verde</span> favorable · <span className="negativo">rojo</span> desfavorable · <i className="avh-dot-relevante"/> supera {umbral}%).
    </p>
    {estado.id === 'balance' && tieneSaldos(filas, 'balance') && <ValidacionBalance totales={totales} formato={formato}/>}
    {importando && <PanelImportar key={estado.id} estado={estado} onImportar={acciones.importarCuentas} onCerrar={() => setImportando(false)}/>}

    {!hayCuentas ? <div className="avh-empty">
      <LayoutList size={22}/>
      <p>Aún no hay cuentas en {estado.nombre.toLocaleLowerCase('es')}.</p>
      <div><button type="button" className="avh-btn-primary" onClick={() => acciones.cargarEstructura(estado.id)}>Usar estructura sugerida</button>
        <button type="button" className="avh-btn-outline" onClick={() => acciones.agregarCuenta(estado.id, estado.categorias[0].id)}><Plus size={14}/> Añadir cuenta</button></div>
    </div> : <div className="avh-table-card">
      <table className="avh-table avh-table-estados">
        <colgroup><col/><col className="avh-col-money"/><col className="avh-col-money"/><col className="avh-col-pct"/><col className="avh-col-pct"/><col className="avh-col-var"/><col className="avh-col-varpct"/><col className="avh-col-action"/></colgroup>
        <thead>
          <tr className="avh-thead-group"><th/><th colSpan="2" className="avh-num">Saldos</th><th colSpan="2" className="avh-num">Análisis vertical</th><th colSpan="2" className="avh-num">Análisis horizontal</th><th/></tr>
          <tr><th scope="col">Cuenta</th><th scope="col" className="avh-num">{periodos.anterior}</th><th scope="col" className="avh-num">{periodos.actual}</th><th scope="col" className="avh-num">% base</th><th scope="col" className="avh-num">% actual</th><th scope="col" className="avh-num">Absoluta</th><th scope="col" className="avh-num">Relativa</th><th scope="col"><span className="avh-sr">Eliminar</span></th></tr>
        </thead>
        {bloques.map(({ categoria, cuentas, subtotal, calculadas }) => <tbody key={categoria.id}>
          <FilaResumen linea={subtotal} nombre={<>{categoria.nombre}<small>{cuentas.length}</small></>} formato={formato} periodos={periodos} clase={`avh-section-row ${categoria.grupo}`}
            accion={<button type="button" className="avh-btn-ghost" onClick={() => acciones.agregarCuenta(estado.id, categoria.id)} title={`Añadir cuenta en ${categoria.nombre}`}><Plus size={13}/> Añadir</button>}/>
          {cuentas.map(cuenta => {
            const fila = filaPorId.get(cuenta.id);
            return <tr key={cuenta.id} className="avh-row">
              <td className="avh-td-name"><input className="avh-cell-input" aria-label="Nombre de la cuenta" value={fila.cuenta} onChange={e => acciones.editarFila(fila.id, 'cuenta', e.target.value)} placeholder="Nombre de la cuenta"/></td>
              <td data-label={periodos.anterior}><input className="avh-cell-input avh-num" aria-label={`${periodos.anterior}: ${fila.cuenta || 'cuenta'}`} type="number" step="any" inputMode="decimal" value={fila.anterior} onChange={e => acciones.editarFila(fila.id, 'anterior', e.target.value)} placeholder="0"/></td>
              <td data-label={periodos.actual}><input className="avh-cell-input avh-num" aria-label={`${periodos.actual}: ${fila.cuenta || 'cuenta'}`} type="number" step="any" inputMode="decimal" value={fila.actual} onChange={e => acciones.editarFila(fila.id, 'actual', e.target.value)} placeholder="0"/></td>
              <CeldasAnalisis linea={cuenta} formato={formato}/>
              <td className="avh-td-action"><button type="button" className="avh-btn-icon danger" onClick={() => acciones.eliminarCuenta(fila.id)} title={`Eliminar ${fila.cuenta || 'cuenta'}`} aria-label={`Eliminar ${fila.cuenta || 'cuenta'}`}><Trash2 size={15}/></button></td>
            </tr>;
          })}
          {calculadas.map(linea => <FilaResumen key={linea.id} linea={linea} nombre={linea.nombre} formato={formato} periodos={periodos} clase="avh-total-row"/>)}
        </tbody>)}
      </table>
    </div>}
  </section>;
}
