import { useMemo } from 'react';
import { ArrowLeftRight, PieChart } from 'lucide-react';
import { COLORES_CATEGORIA, construirComposicion } from './calculosFinancieros';

/** Barras 100% apiladas: cómo se reparte cada total en ambos periodos. */
export function GraficoComposicion({ estado, totales, periodos, formato }) {
  const composicion = useMemo(() => construirComposicion(estado.id, totales), [estado.id, totales]);
  const leyenda = composicion[1].barras.flatMap(barra => barra.segmentos).filter((item, indice, lista) => lista.findIndex(otro => otro.id === item.id) === indice);
  const titulo = estado.id === 'balance' ? '¿Cómo se financian los activos?' : '¿En qué se va cada unidad vendida?';

  return <figure className="avh-chart-panel">
    <figcaption><PieChart size={14}/> Composición · {titulo}</figcaption>
    <div className="avh-stack-groups">
      {composicion[0].barras.map((barra, indiceBarra) => <div className="avh-stack-group" key={barra.id}>
        <span className="avh-stack-title">{barra.nombre}</span>
        {composicion.map(({ periodo, barras }) => {
          const actual = barras[indiceBarra];
          return <div className="avh-stack-row" key={periodo}>
            <span className="avh-stack-period">{periodos[periodo]}</span>
            <div className="avh-stack-bar" role="img" aria-label={`${barra.nombre} ${periodos[periodo]}: ${actual.segmentos.map(item => `${item.nombre} ${formato.pct(item.pct)}`).join(', ')}`}>
              {actual.segmentos.filter(item => item.pct > 0).map(item => <span key={item.id} className="avh-stack-seg" style={{ width: `${item.pct}%`, background: item.color }} title={`${item.nombre}: ${formato.moneda(item.valor)} (${formato.pct(item.pct)})`}>
                {item.pct >= 9 && <b>{item.pct.toFixed(0)}%</b>}
              </span>)}
              {actual.segmentos.every(item => !item.pct) && <em>Sin datos</em>}
            </div>
            {actual.nota && <small className="avh-stack-note">{actual.nota}</small>}
          </div>;
        })}
      </div>)}
    </div>
    <div className="avh-legend">{leyenda.map(item => <span key={item.id}><i style={{ background: item.color }}/>{item.nombre}</span>)}</div>
  </figure>;
}

/** Barras divergentes: variación absoluta por clasificación con su porcentaje. */
export function GraficoVariacion({ bloques, formato }) {
  const items = bloques.filter(bloque => bloque.cuentas.length).map(({ categoria, subtotal }) => ({ ...subtotal, id: categoria.id, nombre: categoria.nombre }))
    .concat(bloques.flatMap(bloque => bloque.calculadas).filter(linea => ['activos', 'utilidadNeta'].includes(linea.id)).map(linea => ({ ...linea, total: true })));
  const maximo = Math.max(1, ...items.map(item => Math.abs(item.cambio)));

  return <figure className="avh-chart-panel">
    <figcaption><ArrowLeftRight size={14}/> Variación · ¿qué creció y qué disminuyó?</figcaption>
    <div className="avh-diverge">
      <div className="avh-diverge-axis-labels" aria-hidden="true"><span/><span className="avh-axis-mid"><span>◀ Baja</span><span>Sube ▶</span></span><span/></div>
      {items.map(item => {
        const ancho = (Math.abs(item.cambio) / maximo) * 50;
        return <div className={`avh-diverge-row${item.total ? ' total' : ''}`} key={item.id}>
          <span className="avh-diverge-label" title={item.nombre}><i style={{ background: COLORES_CATEGORIA[item.id] || 'var(--avh-accent)' }}/>{item.nombre}</span>
          <div className="avh-diverge-track" title={`${item.nombre}: ${formato.monedaConSigno(item.cambio)} (${formato.pctConSigno(item.cambioPct)})`}>
            <b/>
            <i className={`avh-diverge-bar ${item.tono}`} style={{ width: `${ancho}%`, left: item.cambio < 0 ? `${50 - ancho}%` : '50%' }}/>
          </div>
          <span className={`avh-diverge-value ${item.tono}`}>{formato.monedaConSigno(item.cambio)}<small>{formato.pctConSigno(item.cambioPct)}</small></span>
        </div>;
      })}
    </div>
  </figure>;
}

export default function GraficosFinancieros(props) {
  return <div className="avh-charts-grid">
    <GraficoComposicion {...props}/>
    <GraficoVariacion {...props}/>
  </div>;
}
