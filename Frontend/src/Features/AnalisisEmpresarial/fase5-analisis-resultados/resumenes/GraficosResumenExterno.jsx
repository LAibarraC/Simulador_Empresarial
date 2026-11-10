import { Crown, Medal, Trophy } from 'lucide-react';

const AREA_PORTER = { arriba: 'n', izquierda: 'w', centro: 'c', derecha: 'e', abajo: 's' };

/** PESTEL: barras de oportunidades (verde) y amenazas (rojo) por dimensión. */
export function PestelGrafico({ dimensiones }) {
  const maximo = Math.max(1, ...dimensiones.flatMap(d => [d.oportunidades, d.amenazas]));
  return <figure className="r5-gfx" aria-label="Oportunidades y amenazas por dimensión PESTEL">
    <div className="r5-pb">
      {dimensiones.map(d => <div key={d.id} className="r5-pb-col" title={`${d.nombre}: ${d.oportunidades} oportunidades, ${d.amenazas} amenazas`}>
        <div className="r5-pb-bars">
          <span><b>{d.oportunidades}</b><i className="o" style={{ height: `${(d.oportunidades / maximo) * 100}%` }}/></span>
          <span><b>{d.amenazas}</b><i className="a" style={{ height: `${(d.amenazas / maximo) * 100}%` }}/></span>
        </div>
        <em style={{ background: d.color }}>{d.letra}</em>
        <small>{d.nombre}</small>
      </div>)}
    </div>
    <div className="r5-legend"><span><i className="o"/>Oportunidades</span><span><i className="a"/>Amenazas</span></div>
  </figure>;
}

/** Porter: las cinco fuerzas en cruz con su nivel de presión (tres barras). */
export function PorterDiagrama({ fuerzas }) {
  return <figure className="r5-gfx" aria-label="Diagrama de las cinco fuerzas de Porter">
    <div className="r5-porter">
      {fuerzas.map(f => <div key={f.id} className={`r5-force ${AREA_PORTER[f.posicion] || 'c'} ${f.nivel.toLowerCase()}`} title={f.descripcion}>
        <strong>{f.nombre}</strong>
        <span className="r5-force-bar">{[1, 2, 3].map(n => <i key={n} className={n <= f.puntos ? 'on' : ''}/>)}</span>
        <em>Presión {f.nivel.toLowerCase()}</em>
      </div>)}
    </div>
  </figure>;
}

const PODIO = {
  1: { alto: 132, color: 'linear-gradient(180deg, #fde68a 0%, #f59e0b 100%)', borde: '#d97706' },
  2: { alto: 96, color: 'linear-gradient(180deg, #e2e8f0 0%, #94a3b8 100%)', borde: '#64748b' },
  3: { alto: 70, color: 'linear-gradient(180deg, #fed7aa 0%, #ea580c 100%)', borde: '#c2410c' }
};

/** MPC: podio con los tres primeros lugares; el resto se muestra en una lista. */
export function PodioMpc({ ranking }) {
  const tres = ranking.slice(0, 3);
  const resto = ranking.slice(3);
  // Orden visual del podio: 2.º · 1.º · 3.º
  const orden = [tres[1], tres[0], tres[2]].filter(Boolean);
  const Insignia = { 1: Crown, 2: Medal, 3: Medal };
  return <figure className="r5-gfx" aria-label="Podio del perfil competitivo">
    <div className="r5-podio">
      {orden.map(item => {
        const lugar = ranking.indexOf(item) + 1;
        const est = PODIO[lugar];
        const Icono = Insignia[lugar];
        return <div key={item.id} className={`r5-podio-col lugar-${lugar}${item.esPropia ? ' propia' : ''}`}>
          <span className="r5-podio-medal" style={{ background: est.borde }}><Icono size={lugar === 1 ? 20 : 17}/></span>
          <strong className="r5-podio-nombre" title={item.nombre}>{item.nombre}</strong>
          {item.esPropia && <em>Nuestra empresa</em>}
          <span className="r5-podio-total">{item.totalPonderado.toFixed(2)}</span>
          <div className="r5-podio-bloque" style={{ height: est.alto, background: est.color, borderColor: est.borde }}><b>{lugar}</b></div>
        </div>;
      })}
    </div>
    {resto.length > 0 && <ol className="r5-podio-resto" start={4}>
      {resto.map((item, i) => <li key={item.id} className={item.esPropia ? 'propia' : ''}><span>{i + 4}</span><b>{item.nombre}</b>{item.esPropia && <em>Nuestra empresa</em>}<strong>{item.totalPonderado.toFixed(2)}</strong></li>)}
    </ol>}
    <div className="r5-legend"><Trophy size={13}/> Total ponderado (escala 1 a 4)</div>
  </figure>;
}

/** POAM: dona con el total de oportunidades frente a amenazas. */
export function DonaPoam({ oportunidades, amenazas }) {
  const total = oportunidades + amenazas;
  const radio = 52;
  const circunferencia = 2 * Math.PI * radio;
  const largoO = total ? (oportunidades / total) * circunferencia : 0;
  return <figure className="r5-gfx r5-dona-wrap" aria-label={`${oportunidades} oportunidades y ${amenazas} amenazas`}>
    <svg viewBox="0 0 140 140" className="r5-dona" role="img">
      <circle cx="70" cy="70" r={radio} fill="none" stroke="#ef4444" strokeWidth="22"/>
      {total > 0 && <circle cx="70" cy="70" r={radio} fill="none" stroke="#10b981" strokeWidth="22" strokeDasharray={`${largoO} ${circunferencia - largoO}`} transform="rotate(-90 70 70)"/>}
      <text x="70" y="68" textAnchor="middle" className="r5-dona-num">{total}</text>
      <text x="70" y="84" textAnchor="middle" className="r5-dona-lab">factores</text>
    </svg>
    <div className="r5-dona-leyenda">
      <span><i className="o"/><b>{oportunidades}</b> Oportunidades{total ? ` · ${Math.round((oportunidades / total) * 100)}%` : ''}</span>
      <span><i className="a"/><b>{amenazas}</b> Amenazas{total ? ` · ${Math.round((amenazas / total) * 100)}%` : ''}</span>
    </div>
  </figure>;
}

/** POAM: barras opuestas por dimensión (amenazas a la izquierda, oportunidades a la derecha). */
export function DivergentePoam({ porDimension }) {
  const maximo = Math.max(1, ...porDimension.flatMap(d => [d.oportunidades, d.amenazas]));
  return <figure className="r5-gfx r5-diverge" aria-label="Oportunidades y amenazas por dimensión">
    <div className="r5-diverge-head"><span className="neg">◀ Amenazas</span><span className="pos">Oportunidades ▶</span></div>
    {porDimension.map(d => <div key={d.id} className="r5-diverge-row">
      <span className="r5-diverge-side neg"><b>{d.amenazas || ''}</b><i style={{ width: `${(d.amenazas / maximo) * 100}%` }}/></span>
      <span className="r5-diverge-label" style={{ color: d.color }}>{d.letra}<small>{d.nombre}</small></span>
      <span className="r5-diverge-side pos"><i style={{ width: `${(d.oportunidades / maximo) * 100}%` }}/><b>{d.oportunidades || ''}</b></span>
    </div>)}
  </figure>;
}
