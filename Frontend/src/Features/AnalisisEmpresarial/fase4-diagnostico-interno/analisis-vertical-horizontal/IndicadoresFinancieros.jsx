import { ArrowDownRight, ArrowUpRight, Droplets, Gauge, Landmark, Minus, PiggyBank, RefreshCw } from 'lucide-react';
import { GRUPOS_INDICADORES } from './calculosFinancieros';

const ETIQUETA_ESTADO = { bueno: 'Saludable', alerta: 'Vigilar', critico: 'Crítico' };
const ICONO_TENDENCIA = { mejora: ArrowUpRight, empeora: ArrowDownRight, igual: Minus, 'sin-base': Minus };

/** Tabla compacta de indicadores agrupada por dimensión. */
export function TablaIndicadores({ grupo, indicadores, periodos, formato, detallado = false, titulo = grupo.nombre }) {
  return <table className="avh-table avh-table-ratios">
    <colgroup><col/><col className="avh-col-ratio"/><col className="avh-col-ratio"/><col className="avh-col-trend"/><col className="avh-col-status"/></colgroup>
    <thead>
      <tr><th scope="col">{titulo}</th><th scope="col" className="avh-num" title={periodos.anterior}>Base</th><th scope="col" className="avh-num" title={periodos.actual}>Actual</th><th scope="col" className="avh-num">Cambio</th><th scope="col">Estado</th></tr>
    </thead>
    <tbody>
      {indicadores.map(item => {
        const Icono = ICONO_TENDENCIA[item.tendencia];
        return <tr key={item.id} className="avh-row" title={`${item.formula}. ${item.referencia}`}>
          <td className="avh-td-name"><strong>{item.nombre}</strong><small>{item.formula}</small>{detallado && <small>{item.referencia}</small>}</td>
          <td className="avh-num" data-label={periodos.anterior}>{formato.indicador(item, item.anterior)}</td>
          <td className="avh-num avh-strong" data-label={periodos.actual}>{formato.indicador(item, item.actual)}</td>
          <td className={`avh-num avh-trend ${item.tendencia}`} data-label="Cambio">{item.delta === null ? '—' : <><Icono size={12}/>{formato.deltaIndicador(item)}</>}</td>
          <td data-label="Estado">{item.estado ? <span className={`avh-pill ${item.estado}`}>{ETIQUETA_ESTADO[item.estado]}</span> : <span className="avh-pill neutro">Referencial</span>}</td>
        </tr>;
      })}
    </tbody>
  </table>;
}

const ICONOS_GRUPO = { liquidez: Droplets, endeudamiento: Landmark, rentabilidad: PiggyBank, eficiencia: RefreshCw };
const DESCRIPCION_GRUPO = {
  liquidez: 'Capacidad de cubrir las obligaciones de corto plazo con los activos corrientes.',
  endeudamiento: 'Qué parte de la empresa se financia con terceros y si las utilidades alcanzan para pagar los intereses.',
  rentabilidad: 'Cuánto queda de utilidad por cada unidad vendida y qué rendimiento obtienen los activos y el patrimonio.',
  eficiencia: 'Qué tan bien se usan los activos y el inventario para generar ventas.'
};
const LEYENDA = [
  ['bueno', 'Saludable', 'Dentro de la referencia sana.'],
  ['alerta', 'Vigilar', 'Aceptable, pero cerca del límite.'],
  ['critico', 'Crítico', 'Fuera de la referencia: requiere acción.'],
  ['neutro', 'Referencial', 'Sin umbral universal: compáralo con el sector.']
];

function resumen(items) {
  return ['bueno', 'alerta', 'critico'].map(estado => [estado, items.filter(item => item.estado === estado).length]).filter(([, total]) => total);
}

export default function IndicadoresFinancieros({ indicadores, periodos, formato }) {
  return <section className="avh-card" aria-label="Indicadores financieros">
    <div className="avh-card-head">
      <h3 className="avh-card-title"><Gauge size={16}/> Indicadores financieros</h3>
    </div>
    <p className="avh-card-desc">Los ratios resumen la salud financiera en <b>cuatro dimensiones</b>. Cada uno compara {periodos.anterior} con {periodos.actual}, indica si <b>mejora o empeora</b> y lo clasifica con un semáforo. Las referencias son orientativas: contrástalas con el sector, la estacionalidad y el modelo de negocio del caso.</p>
    <div className="avh-ratio-legend">{LEYENDA.map(([clase, nombre, texto]) => <span key={clase}><span className={`avh-pill ${clase}`}>{nombre}</span>{texto}</span>)}</div>
    <div className="avh-ratios-grid avh-ratios-full">
      {GRUPOS_INDICADORES.map(grupo => {
        const items = indicadores.filter(item => item.grupo === grupo.id);
        const Icono = ICONOS_GRUPO[grupo.id] || Gauge;
        return <div className="avh-table-card avh-ratio-block" key={grupo.id}>
          <header className="avh-ratio-block-head">
            <span className="avh-ratio-block-icon"><Icono size={15}/></span>
            <div><strong>{grupo.nombre}</strong><em>{grupo.pregunta}</em><small>{DESCRIPCION_GRUPO[grupo.id]}</small></div>
            <div className="avh-ratio-block-summary">{resumen(items).map(([estado, total]) => <span key={estado} className={`avh-pill ${estado}`}>{total} {ETIQUETA_ESTADO[estado].toLocaleLowerCase('es')}</span>)}</div>
          </header>
          <TablaIndicadores grupo={grupo} titulo="Indicador" indicadores={items} periodos={periodos} formato={formato} detallado/>
        </div>;
      })}
    </div>
  </section>;
}
