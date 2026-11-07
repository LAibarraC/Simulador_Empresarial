import { CheckCircle2, Gauge, Scale, TrendingDown, TrendingUp } from 'lucide-react';

/** Indicadores de la matriz EFI, cada uno con su explicación en palabras. */
export default function IndicadoresEfi({ totales, diagnostico }) {
  const puntaje = totales.totalPonderadoGlobal;
  const posicion = ((Math.min(4, Math.max(1, puntaje)) - 1) / 3) * 100;
  const diferencia = Math.round((1 - totales.sumaPesos) * 100) / 100;
  const tonoPesos = totales.esSumaValida ? 'ok' : Math.abs(diferencia) > 0.2 ? 'bad' : 'warn';

  return <section className="cjm-kpis efi-kpis" aria-label="Indicadores de la matriz">
    <article className="cjm-kpi">
      <span className="cjm-kpi-title"><Gauge size={13}/> Puntaje EFI</span>
      <strong className="cjm-kpi-value" style={{ color: diagnostico.color }}>{puntaje.toFixed(2)}<small> de 4,00</small></strong>
      <span className="cjm-kpi-scale efi-scale" aria-hidden="true"><i style={{ left: '50%' }}/><b style={{ left: `${posicion}%`, borderColor: diagnostico.color }}/></span>
      <p className="cjm-kpi-help"><strong style={{ color: diagnostico.color }}>{diagnostico.postura}.</strong> La media teórica es 2,50: arriba de ese valor la empresa es fuerte por dentro.</p>
    </article>

    <article className="cjm-kpi ok">
      <span className="cjm-kpi-title"><TrendingUp size={13}/> Fortalezas</span>
      <strong className="cjm-kpi-value">{totales.numFortalezas}<small> factores</small></strong>
      <p className="cjm-kpi-help">Suman <b>{totales.totalPonderadoFortalezas.toFixed(2)}</b> al puntaje y concentran {Math.round(totales.sumaPesosFortalezas * 100)}% del peso. Cuanto más pesen, mejor.</p>
    </article>

    <article className="cjm-kpi bad">
      <span className="cjm-kpi-title"><TrendingDown size={13}/> Debilidades</span>
      <strong className="cjm-kpi-value">{totales.numDebilidades}<small> factores</small></strong>
      <p className="cjm-kpi-help">Suman <b>{totales.totalPonderadoDebilidades.toFixed(2)}</b> y concentran {Math.round(totales.sumaPesosDebilidades * 100)}% del peso. Son lo primero que hay que corregir.</p>
    </article>

    <article className={`cjm-kpi ${tonoPesos === 'bad' ? 'bad' : tonoPesos === 'ok' ? 'ok' : ''}`}>
      <span className="cjm-kpi-title"><Scale size={13}/> Suma de pesos</span>
      <strong className="cjm-kpi-value">{totales.sumaPesos.toFixed(2)}<small> de 1,00</small></strong>
      <span className="efi-sum-bar" aria-hidden="true"><i className={tonoPesos} style={{ width: `${Math.min(100, totales.sumaPesos * 100)}%` }}/></span>
      <p className="cjm-kpi-help">{totales.esSumaValida
        ? <span className="efi-ok-text"><CheckCircle2 size={12}/> Correcta: el 100% de la importancia está repartido.</span>
        : diferencia > 0 ? `Faltan ${diferencia.toFixed(2)} para llegar a 1,00. Reparte el peso entre los factores.` : `Sobran ${Math.abs(diferencia).toFixed(2)}. Reduce el peso de algunos factores.`}</p>
    </article>
  </section>;
}
