import { obtenerEmocion } from '../../fase4-diagnostico-interno/customer-journey/calculosJourney';

/** Barras agrupadas por periodo (base frente a actual) para cifras financieras. */
export function BarrasPeriodos({ items, formato, periodos }) {
  const maximo = Math.max(1, ...items.flatMap(item => [Math.abs(item.anterior), Math.abs(item.actual)]));
  return <figure className="r5-gfx" aria-label="Comparación entre periodos">
    <div className="r5-vb">
      {items.map(item => <div key={item.nombre} className="r5-vb-col">
        <div className="r5-vb-bars">
          {[['base', item.anterior], ['actual', item.actual]].map(([tipo, valor]) => <span key={tipo} title={`${item.nombre} (${tipo === 'base' ? periodos.anterior : periodos.actual}): ${formato.moneda(valor)}`}>
            <b>{formato.moneda(valor)}</b>
            <i className={`${tipo}${valor < 0 ? ' neg' : ''}`} style={{ height: `${Math.max(2, (Math.abs(valor) / maximo) * 100)}%` }}/>
          </span>)}
        </div>
        <small>{item.nombre}</small>
      </div>)}
    </div>
    <div className="r5-legend"><span><i className="base"/>{periodos.anterior || 'Periodo base'}</span><span><i className="actual"/>{periodos.actual || 'Periodo actual'}</span></div>
  </figure>;
}

/** Barras horizontales con un icono opcional. items: [{ id, nombre, valor, etiqueta, icono?, color? }] */
export function BarrasHorizontales({ items, titulo }) {
  const maximo = Math.max(1, ...items.map(item => item.valor));
  return <figure className="r5-gfx" aria-label={titulo}>
    {titulo && <figcaption className="hf-section-label">{titulo}</figcaption>}
    <div className="r5-hb">
      {items.map(item => <div key={item.id} className="r5-hb-row">
        <span className="r5-hb-name">{item.icono}<span title={item.nombre}>{item.nombre}</span></span>
        <span className="r5-hb-track"><i style={{ width: `${Math.max(2, (item.valor / maximo) * 100)}%`, background: item.color || '#ea580c' }}/></span>
        <strong>{item.etiqueta}</strong>
      </div>)}
    </div>
  </figure>;
}

/** Curva emocional de un cliente (una carita de color por etapa). */
export function CurvaCliente({ cliente }) {
  const etapas = cliente.etapas;
  const ancho = Math.max(1, etapas.length) * 90;
  const y = v => 14 + ((5 - v) / 4) * 62;
  const puntos = etapas.map((e, i) => (e.emocion ? { x: 45 + i * 90, y: y(e.emocion), e } : null));
  const linea = puntos.filter(Boolean).map(p => `${p.x},${p.y}`).join(' ');
  return <figure className="r5-gfx r5-curva">
    <svg viewBox={`0 0 ${ancho} 92`} preserveAspectRatio="xMidYMid meet" aria-label={`Curva emocional de ${cliente.persona.nombre || 'cliente'}`} role="img">
      {[1, 3, 5].map(v => <line key={v} x1="0" x2={ancho} y1={y(v)} y2={y(v)} stroke="#cbd5e1" strokeDasharray={v === 3 ? '0' : '3 4'} strokeOpacity=".7"/>)}
      {linea && <polyline points={linea} fill="none" stroke={cliente.color || '#ea580c'} strokeWidth="3" strokeLinejoin="round"/>}
      {puntos.map((p, i) => p && <g key={i}><circle cx={p.x} cy={p.y} r="9" fill={obtenerEmocion(p.e.emocion).color} stroke="#fff" strokeWidth="2.5"/><text x={p.x} y={p.y + 3.5} textAnchor="middle" fontSize="9.5" fontWeight="900" fill="#fff">{p.e.emocion}</text></g>)}
    </svg>
    <div className="r5-curva-labels" style={{ gridTemplateColumns: `repeat(${etapas.length}, minmax(0, 1fr))` }}>{etapas.map((e, i) => <span key={e.id}>{e.nombre || `Etapa ${i + 1}`}</span>)}</div>
  </figure>;
}

/** Dona genérica. partes: [{ nombre, valor, color }] */
export function Dona({ partes, centro = 'total' }) {
  const total = partes.reduce((suma, parte) => suma + parte.valor, 0);
  const radio = 52;
  const circunferencia = 2 * Math.PI * radio;
  let acumulado = 0;
  return <figure className="r5-gfx r5-dona-wrap" aria-label={partes.map(p => `${p.valor} ${p.nombre}`).join(', ')}>
    <svg viewBox="0 0 140 140" className="r5-dona" role="img">
      <circle cx="70" cy="70" r={radio} fill="none" stroke="rgba(148,163,184,.25)" strokeWidth="22"/>
      {total > 0 && partes.filter(parte => parte.valor > 0).map(parte => {
        const largo = (parte.valor / total) * circunferencia;
        const desplazamiento = -acumulado;
        acumulado += largo;
        return <circle key={parte.nombre} cx="70" cy="70" r={radio} fill="none" stroke={parte.color} strokeWidth="22" strokeDasharray={`${largo} ${circunferencia - largo}`} strokeDashoffset={desplazamiento} transform="rotate(-90 70 70)"/>;
      })}
      <text x="70" y="68" textAnchor="middle" className="r5-dona-num">{total}</text>
      <text x="70" y="84" textAnchor="middle" className="r5-dona-lab">{centro}</text>
    </svg>
    <div className="r5-dona-leyenda">{partes.map(parte => <span key={parte.nombre}><i style={{ background: parte.color }}/><b>{parte.valor}</b> {parte.nombre}{total ? ` · ${Math.round((parte.valor / total) * 100)}%` : ''}</span>)}</div>
  </figure>;
}
