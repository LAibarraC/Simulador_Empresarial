import { useState } from 'react';
import { AlertTriangle, ArrowDownRight, ArrowLeftRight, ArrowUpRight, CheckCircle2, Filter, Info, Layers, Minus } from 'lucide-react';
import { COLORES_CATEGORIA } from './calculosFinancieros';
import { GraficoComposicion, GraficoVariacion } from './GraficosFinancieros';

const ICONOS = { ok: CheckCircle2, warning: AlertTriangle, info: Info };

/* ---------------------------- Celdas ---------------------------- */

function BarraPeso({ valor, formato, tipo }) {
  return <span className="avh-wcell">
    <span className="avh-wbar"><i className={tipo} style={{ width: `${Math.min(100, Math.abs(valor || 0))}%` }}/></span>
    <b>{formato.pct(valor)}</b>
  </span>;
}

function CambioPeso({ delta, formato }) {
  if (delta === null) return <span className="avh-delta">—</span>;
  const Icono = Math.abs(delta) < 0.5 ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;
  const clase = Math.abs(delta) < 0.5 ? '' : delta > 0 ? 'up' : 'down';
  return <span className={`avh-delta ${clase}`}><Icono size={12}/>{formato.pp(delta)}</span>;
}

function Variacion({ linea, formato, maximo, conBarra }) {
  const ancho = maximo ? (Math.abs(linea.cambio) / maximo) * 50 : 0;
  return <span className="avh-var-cell">
    <span className={`avh-var-text ${linea.tono}`}><b>{formato.monedaConSigno(linea.cambio)}</b><small>{formato.pctConSigno(linea.cambioPct)}</small></span>
    {conBarra && <span className="avh-dbar" aria-hidden="true"><b/><i className={linea.tono} style={{ width: `${ancho}%`, left: linea.cambio < 0 ? `${50 - ancho}%` : '50%' }}/></span>}
  </span>;
}

const nombreCategoria = categoria => <span className="avh-cat-name"><i style={{ background: COLORES_CATEGORIA[categoria.id] }}/>{categoria.nombre}</span>;

/* ---------------------------- Tablas ---------------------------- */

function TablaVertical({ bloques, periodos, formato }) {
  const fila = (linea, nombre, clase, key) => <tr key={key} className={clase}>
    <td className="avh-td-name">{nombre}</td>
    <td data-label={periodos.anterior}><BarraPeso valor={linea.pesoAnterior} formato={formato} tipo="base"/></td>
    <td data-label={periodos.actual}><BarraPeso valor={linea.pesoActual} formato={formato} tipo="actual"/></td>
    <td className="avh-num" data-label="Cambio"><CambioPeso delta={linea.deltaPeso} formato={formato}/></td>
  </tr>;
  return <div className="avh-table-card"><table className="avh-table avh-table-detalle">
    <colgroup><col/><col className="avh-col-wbar"/><col className="avh-col-wbar"/><col className="avh-col-pp"/></colgroup>
    <thead><tr><th scope="col">Cuenta</th><th scope="col">{periodos.anterior}</th><th scope="col">{periodos.actual}</th><th scope="col" className="avh-num">Cambio</th></tr></thead>
    {bloques.map(({ categoria, cuentas, subtotal, calculadas }) => (cuentas.length || calculadas.length) ? <tbody key={categoria.id}>
      {cuentas.length > 0 && fila(subtotal, nombreCategoria(categoria), `avh-section-row ${categoria.grupo}`, 'sub')}
      {cuentas.map(cuenta => fila(cuenta, cuenta.nombre, 'avh-row', cuenta.id))}
      {calculadas.map(linea => fila(linea, linea.nombre, 'avh-total-row', linea.id))}
    </tbody> : null)}
  </table></div>;
}

function TablaHorizontal({ bloques, periodos, formato, soloRelevantes }) {
  const maximo = Math.max(1, ...bloques.flatMap(b => b.cuentas.map(c => Math.abs(c.cambio))));
  const fila = (linea, nombre, clase, key, conBarra = true) => <tr key={key} className={clase}>
    <td className="avh-td-name">{nombre}{linea.relevante && clase === 'avh-row' && <i className="avh-dot-relevante" title="Variación relevante"/>}</td>
    <td className="avh-num" data-label={periodos.anterior}>{formato.moneda(linea.anterior)}</td>
    <td className="avh-num" data-label={periodos.actual}>{formato.moneda(linea.actual)}</td>
    <td data-label="Variación"><Variacion linea={linea} formato={formato} maximo={maximo} conBarra={conBarra}/></td>
  </tr>;
  return <div className="avh-table-card"><table className="avh-table avh-table-detalle">
    <colgroup><col/><col className="avh-col-money"/><col className="avh-col-money"/><col className="avh-col-varbar"/></colgroup>
    <thead><tr><th scope="col">Cuenta</th><th scope="col" className="avh-num">{periodos.anterior}</th><th scope="col" className="avh-num">{periodos.actual}</th><th scope="col">Variación</th></tr></thead>
    {bloques.map(({ categoria, cuentas, subtotal, calculadas }) => {
      if (!cuentas.length && !calculadas.length) return null;
      const visibles = soloRelevantes ? cuentas.filter(c => c.relevante) : cuentas;
      return <tbody key={categoria.id}>
        {cuentas.length > 0 && fila(subtotal, nombreCategoria(categoria), `avh-section-row ${categoria.grupo}`, 'sub', false)}
        {visibles.map(cuenta => fila(cuenta, cuenta.nombre, 'avh-row', cuenta.id))}
        {calculadas.map(linea => fila(linea, linea.nombre, 'avh-total-row', linea.id, false))}
      </tbody>;
    })}
  </table></div>;
}

/* --------------------------- Principal -------------------------- */

const VISTAS = {
  vertical: {
    icono: Layers, nombre: 'Vertical', subtitulo: 'Estructura',
    ayuda: (estado) => `¿Cuánto pesa cada cuenta? Porcentaje de cada cuenta sobre ${estado.baseConArticulo} de su propio periodo.`,
    formula: (estado) => `% = Cuenta ÷ ${estado.id === 'balance' ? 'Total activos' : 'Ingresos netos'} × 100`
  },
  horizontal: {
    icono: ArrowLeftRight, nombre: 'Horizontal', subtitulo: 'Evolución',
    ayuda: () => '¿Cuánto cambió cada cuenta? Diferencia frente al periodo base, en dinero y en porcentaje.',
    formula: (estado, periodos) => `Variación = ${periodos.actual} − ${periodos.anterior} · % = Variación ÷ |${periodos.anterior}| × 100`
  }
};

/** Paso 2: análisis vertical y horizontal de cada estado, en una vista simple. */
export default function DetalleAnalisisFinanciero({ estado, bloques, totales, periodos, formato, umbral, lectura }) {
  const [vista, setVista] = useState('vertical');
  const [soloRelevantes, setSoloRelevantes] = useState(false);
  const info = VISTAS[vista];
  const claves = lectura.filter(item => item.tipo === vista).slice(0, 3);

  return <div className="avh-detail">
    <div className="avh-detail-tabs" role="tablist" aria-label="Tipo de análisis">
      {Object.entries(VISTAS).map(([id, item]) => { const Icono = item.icono; return <button type="button" key={id} role="tab" aria-selected={vista === id}
        className={`avh-btn-tab${vista === id ? ' active' : ''}`} onClick={() => setVista(id)}>
        <Icono size={16}/><span><strong>Análisis {item.nombre.toLowerCase()}</strong><small>{item.subtitulo}</small></span>
      </button>; })}
    </div>

    <div className="avh-detail-help">
      <p>{info.ayuda(estado)}{vista === 'horizontal' && <> <b className="positivo">Verde</b> = favorable · <b className="negativo">rojo</b> = desfavorable.</>}</p>
      <details><summary>¿Cómo se calcula?</summary><code>{info.formula(estado, periodos)}</code></details>
    </div>

    <div className="avh-detail-summary">
      {vista === 'vertical'
        ? <GraficoComposicion estado={estado} totales={totales} periodos={periodos} formato={formato}/>
        : <GraficoVariacion bloques={bloques} formato={formato}/>}
      <div className="avh-chart-panel avh-keys">
        <span className="avh-panel-title">Lo más importante</span>
        {claves.length ? <ul>{claves.map(item => { const Icono = ICONOS[item.nivel]; return <li key={item.id} className={item.nivel}><Icono size={15}/><div><strong>{item.titulo}</strong><span>{item.detalle}</span></div></li>; })}</ul>
          : <p className="avh-muted">Sin cambios destacados entre periodos.</p>}
      </div>
    </div>

    <div className="avh-detail-head">
      <span className="avh-panel-title">Detalle por cuenta</span>
      {vista === 'horizontal' && <label className="avh-switch"><input type="checkbox" checked={soloRelevantes} onChange={e => setSoloRelevantes(e.target.checked)}/><span/><Filter size={13}/> Solo cambios ≥ {umbral}%</label>}
    </div>
    {vista === 'vertical'
      ? <TablaVertical bloques={bloques} periodos={periodos} formato={formato}/>
      : <TablaHorizontal bloques={bloques} periodos={periodos} formato={formato} soloRelevantes={soloRelevantes}/>}
  </div>;
}
