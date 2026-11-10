
const ANCHO = 340;
const ALTO = 300;
const MARGEN = 50; // espacio lateral extra para que las etiquetas largas no se salgan del gráfico
const CENTRO = { x: ANCHO / 2, y: ALTO / 2 + 4 };
const RADIO = 100;

const punto = (i, total, valor) => {
  const angulo = (Math.PI * 2 * i) / total - Math.PI / 2;
  const r = (RADIO * valor) / 5;
  return { x: CENTRO.x + r * Math.cos(angulo), y: CENTRO.y + r * Math.sin(angulo), angulo };
};
const poligono = (valores) => valores.map((valor, i) => { const p = punto(i, valores.length, valor ?? 0); return `${p.x},${p.y}`; }).join(' ');

/** Radar de competencias: autoevaluación frente al promedio de los demás. */
export function RadarCompetencias({ competencias }) {
  const total = competencias.length;
  if (total < 3) return <p className="hf-muted ev-radar-empty">Añade al menos 3 competencias para ver el radar.</p>;
  const otros = competencias.map(c => c.otros);
  const auto = competencias.map(c => c.autoNota);
  return <figure className="ev-radar">
    <svg viewBox={`${-MARGEN} 0 ${ANCHO + MARGEN * 2} ${ALTO}`} role="img" aria-label="Radar de competencias: autoevaluación frente a la evaluación de los demás">
      {[1, 2, 3, 4, 5].map(nivel => <polygon key={nivel} points={poligono(Array(total).fill(nivel))} fill={nivel === 5 ? 'rgba(234,88,12,.03)' : 'none'} stroke="#cbd5e1" strokeOpacity={nivel === 3 ? 0.9 : 0.5} strokeDasharray={nivel === 3 ? '0' : '3 4'}/>)}
      {competencias.map((c, i) => { const p = punto(i, total, 5); return <line key={c.id} x1={CENTRO.x} y1={CENTRO.y} x2={p.x} y2={p.y} stroke="#cbd5e1" strokeOpacity=".6"/>; })}
      <polygon points={poligono(otros)} fill="rgba(37,99,235,.18)" stroke="#2563eb" strokeWidth="2.2" strokeLinejoin="round"/>
      <polygon points={poligono(auto)} fill="rgba(234,88,12,.08)" stroke="#ea580c" strokeWidth="2.2" strokeDasharray="6 4" strokeLinejoin="round"/>
      {competencias.map((c, i) => [c.otros !== null && <circle key={`o${c.id}`} {...(({ x, y }) => ({ cx: x, cy: y }))(punto(i, total, c.otros))} r="3.5" fill="#2563eb"/>,
        c.autoNota !== null && <circle key={`a${c.id}`} {...(({ x, y }) => ({ cx: x, cy: y }))(punto(i, total, c.autoNota))} r="3.5" fill="#ea580c"/>])}
      {competencias.map((c, i) => {
        const p = punto(i, total, 6.1);
        const ancla = Math.abs(Math.cos(p.angulo)) < 0.2 ? 'middle' : Math.cos(p.angulo) > 0 ? 'start' : 'end';
        const renglones = envolver(c.competencia || 'Competencia');
        return <text key={`t${c.id}`} x={p.x} y={p.y - ((renglones.length - 1) * 6)} textAnchor={ancla} dominantBaseline="middle" fontSize="10" fontWeight="700" fill="#64748b">
          <title>{c.competencia || 'Competencia'}</title>
          {renglones.map((linea, k) => <tspan key={k} x={p.x} dy={k === 0 ? 0 : 12}>{linea}</tspan>)}
        </text>;
      })}
      {[1, 3, 5].map(nivel => <text key={`n${nivel}`} x={CENTRO.x + 3} y={CENTRO.y - (RADIO * nivel) / 5} fontSize="8.5" fill="#94a3b8">{nivel}</text>)}
    </svg>
    <figcaption className="ev-legend"><span><i className="otros"/>Promedio de los demás</span><span><i className="auto"/>Autoevaluación</span></figcaption>
  </figure>;
}

/** Divide un texto en hasta `lineas` renglones de `max` caracteres, sin cortar palabras (la última línea se abrevia). */
function envolver(texto, max = 15, lineas = 2) {
  const palabras = String(texto || '').trim().split(/\s+/).filter(Boolean);
  const resultado = [];
  let actual = '';
  palabras.forEach(palabra => {
    const candidato = actual ? `${actual} ${palabra}` : palabra;
    if (candidato.length <= max || !actual) actual = candidato; else { resultado.push(actual); actual = palabra; }
  });
  if (actual) resultado.push(actual);
  const visibles = resultado.slice(0, lineas).map(linea => (linea.length > max + 2 ? `${linea.slice(0, max + 1)}…` : linea));
  if (resultado.length > lineas) visibles[lineas - 1] = `${visibles[lineas - 1].replace(/…$/, '')}…`;
  return visibles.length ? visibles : [''];
}

const colorCalor = valor => (valor === null ? 'transparent' : valor < 2 ? '#fecaca' : valor < 3 ? '#fed7aa' : valor < 3.5 ? '#fef3c7' : valor < 4 ? '#d9f99d' : '#bbf7d0');

/** Mapa de calor del equipo (personas × competencias). */
export function MapaCalor360({ mapa, onSeleccionar }) {
  if (!mapa.competencias.length) return null;
  return <div className="ev-heat-wrap">
    <table className="ev-heat">
      <thead><tr><th>Persona</th>{mapa.competencias.map(nombre => <th key={nombre} title={nombre}>{nombre}</th>)}<th className="ev-heat-gap" aria-hidden="true"/><th className="ev-heat-media-head" title="Promedio general de cada persona">Media</th></tr></thead>
      <tbody>
        {mapa.filas.map(fila => <tr key={fila.nombre}>
          <th>{onSeleccionar ? <button type="button" className="ev-btn-heat-name" onClick={() => onSeleccionar(fila.nombre)}>{fila.nombre}</button> : fila.nombre}</th>
          {fila.celdas.map((valor, i) => <td key={mapa.competencias[i]} style={{ background: colorCalor(valor) }}>{valor === null ? '—' : valor.toFixed(1)}</td>)}
          <td className="ev-heat-gap" aria-hidden="true"/>
          <td className="ev-heat-total" style={{ background: colorCalor(fila.general) }} title="Media de la persona">{fila.general === null ? '—' : fila.general.toFixed(1)}</td>
        </tr>)}
        <tr className="ev-heat-sep" aria-hidden="true"><td colSpan={mapa.competencias.length + 3}/></tr>
        <tr className="ev-heat-avg"><th title="Promedio del equipo en cada competencia">Equipo</th>{mapa.promedios.map((valor, i) => <td key={mapa.competencias[i]} style={{ background: colorCalor(valor) }}>{valor === null ? '—' : valor.toFixed(1)}</td>)}<td className="ev-heat-gap" aria-hidden="true"/><td className="ev-heat-grand" title="Promedio de todo el equipo">{(() => { const v = mapa.filas.map(f => f.general).filter(x => x !== null); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : '—'; })()}</td></tr>
      </tbody>
    </table>
    <p className="ev-heat-note"><b>Media</b> = promedio de cada persona · <b>Equipo</b> = promedio de cada competencia · la esquina es el promedio de todo el equipo.</p>
    <div className="ev-heat-scale" aria-hidden="true"><span style={{ background: '#fecaca' }}>&lt; 2</span><span style={{ background: '#fed7aa' }}>2–3</span><span style={{ background: '#fef3c7' }}>3–3,5</span><span style={{ background: '#d9f99d' }}>3,5–4</span><span style={{ background: '#bbf7d0' }}>≥ 4</span></div>
  </div>;
}
