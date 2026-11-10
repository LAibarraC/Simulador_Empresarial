import { ArrowDownToLine, ArrowUpFromLine, BarChart3, History } from 'lucide-react';

const entero = new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 });

/** Barra de stock: zona bajo mínimo (roja), óptima (verde) y exceso (ámbar), con disponible y reservado. */
export function BarraStock({ producto }) {
  const { escala, minimoN, maximoN, disponible, reservadoN, existenciaN, estado } = producto;
  const p = valor => `${Math.max(0, Math.min(100, (valor / escala) * 100))}%`;
  return <div className="inv-bar" title={`Disponible ${entero.format(disponible)} · Reservado ${entero.format(reservadoN)} · Mín. ${entero.format(minimoN)}${maximoN ? ` · Máx. ${entero.format(maximoN)}` : ''}`}>
    <div className="inv-bar-zones" aria-hidden="true">
      <i className="low" style={{ width: p(minimoN) }}/>
      {maximoN > 0 && <i className="ok" style={{ left: p(minimoN), width: `calc(${p(maximoN)} - ${p(minimoN)})` }}/>}
      {maximoN > 0 && <i className="high" style={{ left: p(maximoN), right: 0 }}/>}
    </div>
    <i className={`inv-bar-fill ${estado}`} style={{ width: p(Math.max(0, disponible)) }}/>
    {reservadoN > 0 && <i className="inv-bar-reserved" style={{ left: p(Math.max(0, disponible)), width: `calc(${p(existenciaN)} - ${p(Math.max(0, disponible))})` }}/>}
    <b className="inv-bar-mark min" style={{ left: p(minimoN) }}/>
    {maximoN > 0 && <b className="inv-bar-mark max" style={{ left: p(maximoN) }}/>}
  </div>;
}

/** Pareto ABC: barras de valor por producto y curva acumulada. */
export function ParetoAbc({ productos, abc, formatoMoneda }) {
  const ordenados = [...productos].filter(p => abc[p.id]).sort((a, b) => b.valor - a.valor).slice(0, 12);
  if (!ordenados.length) return <p className="hf-muted">Registra existencia y costo unitario para clasificar los productos.</p>;
  const maximo = ordenados[0].valor || 1;
  const ancho = 100 / ordenados.length;
  const puntos = ordenados.map((p, i) => `${(i + 0.5) * ancho},${100 - abc[p.id].acumulado}`).join(' ');
  return <figure className="inv-pareto">
    <figcaption className="hf-section-label"><BarChart3 size={13}/> Clasificación ABC por valor</figcaption>
    <div className="inv-pareto-plot">
      <div className="inv-pareto-ref" style={{ bottom: '80%' }}><span>80%</span></div>
      <div className="inv-pareto-bars">
        {ordenados.map(p => <div key={p.id} className="inv-pareto-col" title={`${p.producto || p.sku}: ${formatoMoneda(p.valor)} (${abc[p.id].participacion.toFixed(1)}%)`}>
          <i className={`clase-${abc[p.id].clase}`} style={{ height: `${Math.max(3, (p.valor / maximo) * 100)}%` }}/>
        </div>)}
      </div>
      <svg className="inv-pareto-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points={puntos} fill="none" stroke="#1f2937" strokeWidth="1.6" vectorEffect="non-scaling-stroke"/></svg>
    </div>
    <div className="inv-pareto-labels">{ordenados.map(p => <span key={p.id} title={p.producto}><b className={`inv-abc clase-${abc[p.id].clase}`}>{abc[p.id].clase}</b>{p.sku || p.producto?.slice(0, 8) || '—'}</span>)}</div>
    <div className="inv-legend"><span><i className="clase-A"/>A · ~80% del valor</span><span><i className="clase-B"/>B · 15%</span><span><i className="clase-C"/>C · 5%</span><span><i className="line"/>% acumulado</span></div>
  </figure>;
}

export function ListaMovimientos({ movimientos, limite = 10 }) {
  return <div className="inv-moves">
    <span className="hf-section-label"><History size={13}/> Movimientos recientes</span>
    {movimientos.length ? <ul>{movimientos.slice(0, limite).map(m => <li key={m.id} className={m.tipo === 'Entrada' ? 'in' : 'out'}>
      <span className="inv-move-icon">{m.tipo === 'Entrada' ? <ArrowDownToLine size={13}/> : <ArrowUpFromLine size={13}/>}</span>
      <div><strong>{[m.sku, m.producto].filter(Boolean).join(' · ')}</strong><small>{new Date(m.fecha).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })}{m.almacen ? ` · ${m.almacen}` : ''}</small></div>
      <b>{m.tipo === 'Entrada' ? '+' : '−'}{entero.format(m.cantidad)}</b>
    </li>)}</ul> : <p className="hf-muted">Aún no hay movimientos. Registra entradas y salidas desde cada producto.</p>}
  </div>;
}
