

/** Velocímetro del puntaje ponderado EFI (1 a 4, media teórica 2,50). */
export function BalanzaEfi({ totales }) {
  const f = totales.totalPonderadoFortalezas;
  const d = totales.totalPonderadoDebilidades;
  const total = f + d || 1;
  return <div className="efi-balance">
    <div className="efi-balance-bar" role="img" aria-label={`Fortalezas ${f.toFixed(2)}, debilidades ${d.toFixed(2)}`}>
      <i className="f" style={{ width: `${(f / total) * 100}%` }}>{f > 0 && <b>{f.toFixed(2)}</b>}</i>
      <i className="d" style={{ width: `${(d / total) * 100}%` }}>{d > 0 && <b>{d.toFixed(2)}</b>}</i>
    </div>
    <div className="efi-balance-legend">
      <span><i className="f"/>Fortalezas · {totales.numFortalezas} · peso {totales.sumaPesosFortalezas.toFixed(2)}</span>
      <span><i className="d"/>Debilidades · {totales.numDebilidades} · peso {totales.sumaPesosDebilidades.toFixed(2)}</span>
    </div>
  </div>;
}

/** Calificación media ponderada por área funcional (1 a 4). */
export function DesgloseAreasEfi({ areas }) {
  const visibles = areas.filter(area => area.totalFactores > 0);
  if (!visibles.length) return <p className="hf-muted">Asigna un área funcional a cada factor para ver el desglose.</p>;
  return <div className="efi-areas">
    {visibles.map(area => {
      const promedio = area.sumaPesos ? area.puntajePonderado / area.sumaPesos : 0;
      return <div className="efi-area-row" key={area.id}>
        <span className="efi-area-name"><i style={{ background: area.color }}/>{area.nombre}</span>
        <div className="efi-area-track"><i style={{ width: `${((promedio - 1) / 3) * 100}%`, background: promedio >= 2.5 ? '#10b981' : '#ef4444' }}/><b style={{ left: '50%' }}/></div>
        <span className="efi-area-value"><strong>{promedio.toFixed(2)}</strong><small>{area.fortalezas}F · {area.debilidades}D</small></span>
      </div>;
    })}
  </div>;
}
