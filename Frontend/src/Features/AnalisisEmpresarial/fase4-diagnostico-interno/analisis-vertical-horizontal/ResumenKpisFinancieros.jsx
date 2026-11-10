import { ArrowDownRight, ArrowUpRight, Droplets, Landmark, Minus, PiggyBank, TrendingUp } from 'lucide-react';
import { variacionPorcentual } from './calculosFinancieros';

const ESTADO_LIQUIDEZ = { bueno: 'Liquidez holgada', alerta: 'Liquidez ajustada', critico: 'Liquidez insuficiente' };

function Variacion({ anterior, actual, formato }) {
  const pct = variacionPorcentual(anterior, actual);
  if (pct === null) return <span className="avh-kpi-foot">Sin base de comparación</span>;
  const Icono = pct === 0 ? Minus : pct > 0 ? ArrowUpRight : ArrowDownRight;
  return <span className={`avh-kpi-foot avh-chip ${pct > 0 ? 'positivo' : pct < 0 ? 'negativo' : ''}`}><Icono size={12}/>{formato.pctConSigno(pct)} vs periodo base</span>;
}

function Kpi({ icono, titulo, valor, negativo, children }) {
  const Icono = icono;
  return <article className="avh-kpi">
    <div className="avh-kpi-head"><span className="avh-kpi-icon"><Icono size={15}/></span><span>{titulo}</span></div>
    <strong className={negativo ? 'negativo' : ''}>{valor}</strong>
    {children}
  </article>;
}

export default function ResumenKpisFinancieros({ totales, indicadores, formato }) {
  const { anterior, actual } = totales;
  const liquidez = indicadores.find(item => item.id === 'razon-corriente');
  const margen = actual.resultados.ingresos ? (actual.resultados.utilidadNeta / actual.resultados.ingresos) * 100 : null;
  return <section className="avh-kpis" aria-label="Resumen financiero del periodo de análisis">
    <Kpi icono={Landmark} titulo="Activos totales" valor={formato.moneda(actual.balance.activos)}><Variacion anterior={anterior.balance.activos} actual={actual.balance.activos} formato={formato}/></Kpi>
    <Kpi icono={TrendingUp} titulo="Ingresos netos" valor={formato.moneda(actual.resultados.ingresos)}><Variacion anterior={anterior.resultados.ingresos} actual={actual.resultados.ingresos} formato={formato}/></Kpi>
    <Kpi icono={PiggyBank} titulo="Utilidad neta" valor={formato.moneda(actual.resultados.utilidadNeta)} negativo={actual.resultados.utilidadNeta < 0}><span className="avh-kpi-foot">Margen neto {formato.pct(margen)}</span></Kpi>
    <Kpi icono={Droplets} titulo="Razón corriente" valor={formato.indicador(liquidez, liquidez.actual)}>
      <span className={`avh-kpi-foot ${liquidez.estado ? `avh-chip ${liquidez.estado}` : ''}`}>{ESTADO_LIQUIDEZ[liquidez.estado] || 'Sin datos suficientes'}</span>
    </Kpi>
  </section>;
}
