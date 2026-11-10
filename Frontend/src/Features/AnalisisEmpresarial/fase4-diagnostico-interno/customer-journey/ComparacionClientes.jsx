import { GitCompareArrows, NotebookPen, Trophy, TriangleAlert, WandSparkles } from 'lucide-react';
import { EMOCIONES, PLANTILLA_CONCLUSION_GENERAL, iniciales, obtenerEmocion } from './calculosJourney';
import IconoEmocion from './IconoEmocion';

const ANCHO = 440;
const ALTO = 180;
const IZQ = 74;
const DER = 14;
const SUP = 14;
const INF = 26;
const y = valor => SUP + ((5 - valor) / 4) * (ALTO - SUP - INF);
const x = (indice, total) => (total <= 1 ? (IZQ + ANCHO - DER) / 2 : IZQ + (indice / (total - 1)) * (ANCHO - IZQ - DER));

/** Curvas emocionales superpuestas: el eje X es el avance del recorrido (inicio → fin) de cada cliente. */
function CurvasComparadas({ comparacion }) {
  return <svg className="cjm-compare-chart" viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img" aria-label="Curvas emocionales de los clientes">
    {EMOCIONES.map(item => <g key={item.valor}>
      <line x1={IZQ} x2={ANCHO - DER} y1={y(item.valor)} y2={y(item.valor)} stroke="#cbd5e1" strokeOpacity={item.valor === 3 ? 0.9 : 0.5} strokeDasharray={item.valor === 3 ? '0' : '3 5'}/>
      <text x={IZQ - 10} y={y(item.valor) + 3.5} textAnchor="end" fontSize="11.5" fontWeight="800" fill={item.color}>{item.corto}</text>
    </g>)}
    <text x={IZQ} y={ALTO - 8} fontSize="10.5" fontWeight="700" fill="#94a3b8">Inicio del recorrido</text>
    <text x={ANCHO - DER} y={ALTO - 8} textAnchor="end" fontSize="10.5" fontWeight="700" fill="#94a3b8">Fin del recorrido</text>
    {comparacion.map(({ cliente }) => {
      const total = cliente.etapas.length;
      const puntos = cliente.etapas.map((etapa, i) => (etapa.emocion ? [x(i, total), y(etapa.emocion), etapa] : null)).filter(Boolean);
      if (!puntos.length) return null;
      return <g key={cliente.id}>
        {puntos.length > 1 && <polyline points={puntos.map(([px, py]) => `${px},${py}`).join(' ')} fill="none" stroke={cliente.color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" opacity=".9"/>}
        {puntos.map(([px, py, etapa]) => <circle key={etapa.id} cx={px} cy={py} r="5.5" fill={cliente.color} stroke="#ffffff" strokeWidth="2"><title>{`${cliente.persona.nombre} · ${etapa.nombre}: ${obtenerEmocion(etapa.emocion).nombre}`}</title></circle>)}
      </g>;
    })}
  </svg>;
}

/** Comparación entre clientes: curvas, tabla de indicadores y conclusión general. */
export default function ComparacionClientes({ comparacion, conclusiones, onConclusiones, onSeleccionar, soloDatos = false }) {
  const conPromedio = comparacion.filter(item => item.metricas.promedio);
  const mejor = conPromedio.length > 1 ? conPromedio.reduce((a, b) => (b.metricas.promedio > a.metricas.promedio ? b : a)) : null;
  const peor = conPromedio.length > 1 ? conPromedio.reduce((a, b) => (b.metricas.promedio < a.metricas.promedio ? b : a)) : null;
  const insertarPlantilla = () => onConclusiones?.(conclusiones.trim() ? `${conclusiones.trim()}\n\n${PLANTILLA_CONCLUSION_GENERAL}` : PLANTILLA_CONCLUSION_GENERAL);

  return <section className="cjm-card cjm-compare" aria-label="Comparación entre clientes">
    <div className="cjm-compare-head">
      <div>
        <h3 className="cjm-card-title"><GitCompareArrows size={16}/> Comparación entre clientes</h3>
        <small className="cjm-muted">Encuentra fricciones comunes y decide qué mejora beneficia a más clientes.</small>
      </div>
      {!soloDatos && mejor && peor && mejor.cliente.id !== peor.cliente.id && <div className="cjm-compare-callouts">
        <span className="ok" title="Cliente con la emoción media más alta"><Trophy size={13}/><small>Mejor</small><strong>{mejor.cliente.persona.nombre}</strong>{mejor.metricas.promedio.toFixed(1)}</span>
        <span className="bad" title="Cliente con la emoción media más baja"><TriangleAlert size={13}/><small>Atender</small><strong>{peor.cliente.persona.nombre}</strong>{peor.metricas.promedio.toFixed(1)}{peor.peor ? ` · ${peor.peor.nombre}` : ''}</span>
      </div>}
    </div>
    <div className="cjm-compare-grid">
      <div className="cjm-panel">
        <CurvasComparadas comparacion={comparacion}/>
        <div className="cjm-legend">{comparacion.map(({ cliente }) => <span key={cliente.id}><i style={{ background: cliente.color }}/>{cliente.persona.nombre || 'Cliente'}</span>)}</div>
      </div>
      <div className="cjm-panel">
        <div className="cjm-table-wrap">
          <table className="cjm-compare-table">
            <thead><tr><th>Cliente</th><th>Emoción</th><th>Críticos</th><th>Mejoras</th><th>Momento más difícil</th><th>Avance</th></tr></thead>
            <tbody>{comparacion.map(({ cliente, metricas, peor: momento }) => {
              const contenido = <>
                <span className="cjm-avatar xs" style={{ background: cliente.color }}>{iniciales(cliente.persona.nombre)}</span>
                <span>{cliente.persona.nombre || 'Cliente'}</span>
              </>;
              return <tr key={cliente.id}>
                <td>{onSeleccionar ? <button type="button" className="cjm-btn-rowclient" onClick={() => onSeleccionar(cliente.id)} title="Ver recorrido">{contenido}</button> : <span className="cjm-btn-rowclient">{contenido}</span>}</td>
                <td><span className="cjm-cell-emo"><IconoEmocion valor={metricas.promedio ? Math.round(metricas.promedio) : null} size={20}/>{metricas.promedio ? metricas.promedio.toFixed(1) : '—'}</span></td>
                <td className={metricas.criticas ? 'cjm-text-bad' : ''}>{metricas.criticas}</td>
                <td>{metricas.oportunidades}{metricas.altas ? <small> · {metricas.altas} alta</small> : null}</td>
                <td>{momento ? momento.nombre : '—'}</td>
                <td><span className="cjm-mini-bar"><i style={{ width: `${metricas.completitud}%`, background: cliente.color }}/></span><small>{metricas.completitud}%</small></td>
              </tr>;
            })}</tbody>
          </table>
        </div>
      </div>
    </div>
    {onConclusiones && <div className="cjm-notes">
      <div className="cjm-notes-head">
        <label htmlFor="cjm-conclusion-general" className="cjm-section-label"><NotebookPen size={13}/> Conclusión general entre clientes</label>
        <button type="button" className="cjm-btn-ghost" onClick={insertarPlantilla}><WandSparkles size={13}/> Plantilla</button>
      </div>
      <textarea id="cjm-conclusion-general" className="cjm-input cjm-textarea short" rows="3" value={conclusiones} onChange={e => onConclusiones(e.target.value)} placeholder="¿Qué tienen en común las experiencias de tus clientes y qué mejora priorizarías para todos?"/>
    </div>}
  </section>;
}
