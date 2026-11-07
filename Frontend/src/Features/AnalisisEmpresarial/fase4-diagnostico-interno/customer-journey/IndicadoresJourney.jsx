import { AlertTriangle, CheckCircle2, ClipboardCheck, Gauge, Lightbulb, Route } from 'lucide-react';
import { MAX_ETAPAS, obtenerEmocion } from './calculosJourney';
import IconoEmocion from './IconoEmocion';

const nombre = (etapa, i) => etapa.nombre?.trim() || `Etapa ${i + 1}`;

/** Lectura en palabras de la emoción media. */
function lecturaEmocion(promedio) {
  if (!promedio) return 'Asigna una carita a cada etapa para calcularla.';
  if (promedio >= 4) return 'El cliente vive una experiencia positiva.';
  if (promedio >= 3) return 'Experiencia aceptable, con puntos por mejorar.';
  if (promedio >= 2) return 'El cliente termina insatisfecho: hay que actuar.';
  return 'Experiencia muy negativa: riesgo de perder al cliente.';
}

function Indicador({ icono, titulo, valor, extra, ayuda, tono = '', children }) {
  const Icono = icono;
  return <article className={`cjm-kpi ${tono}`}>
    <span className="cjm-kpi-title"><Icono size={13}/> {titulo}</span>
    <strong className="cjm-kpi-value">{valor}{extra && <small>{extra}</small>}</strong>
    {children}
    <p className="cjm-kpi-help">{ayuda}</p>
  </article>;
}

/** Indicadores del cliente activo, cada uno con su interpretación. */
export default function IndicadoresJourney({ metricas, etapas, color }) {
  const emocion = obtenerEmocion(Math.round(metricas.promedio || 0));
  const criticas = etapas.map((etapa, i) => ({ etapa, i })).filter(({ etapa }) => etapa.emocion && etapa.emocion <= 2);
  const sinMejora = etapas.filter(etapa => etapa.dolor?.trim() && !etapa.oportunidad?.trim()).length;
  const libres = MAX_ETAPAS - metricas.etapas;
  const posicion = metricas.promedio ? ((metricas.promedio - 1) / 4) * 100 : null;

  return <div className="cjm-kpis" style={{ '--cjm-client': color }}>
    <Indicador icono={Route} titulo="Etapas" valor={metricas.etapas} extra={` de ${MAX_ETAPAS}`}
      ayuda={metricas.etapas < 3 ? 'Un recorrido útil suele tener entre 4 y 6 etapas.' : libres ? `Momentos que vive el cliente. Puedes añadir ${libres} más.` : 'Alcanzaste el máximo de etapas.'}>
      <span className="cjm-kpi-steps" aria-hidden="true">{Array.from({ length: MAX_ETAPAS }, (_, i) => <i key={i} className={i < metricas.etapas ? 'on' : ''}/>)}</span>
    </Indicador>

    <Indicador icono={Gauge} titulo="Emoción media" tono="emo"
      valor={<><IconoEmocion valor={emocion?.valor} size={24}/>{metricas.promedio ? metricas.promedio.toFixed(1) : '—'}</>}
      extra={emocion ? ` / 5 · ${emocion.nombre}` : ''} ayuda={lecturaEmocion(metricas.promedio)}>
      <span className="cjm-kpi-scale" aria-hidden="true">{posicion !== null && <b style={{ left: `${posicion}%`, borderColor: emocion?.color }}/>}</span>
    </Indicador>

    <Indicador icono={AlertTriangle} titulo="Momentos críticos" tono={metricas.criticas ? 'bad' : 'ok'} valor={metricas.criticas}
      extra={metricas.criticas === 1 ? ' etapa' : ' etapas'}
      ayuda={metricas.criticas ? 'Etapas donde el cliente está frustrado o molesto (carita 1 o 2). Atiéndelas primero.' : 'Ninguna etapa con emoción baja (carita 1 o 2).'}>
      {criticas.length > 0
        ? <span className="cjm-kpi-tags">{criticas.slice(0, 3).map(({ etapa, i }) => <em key={etapa.id}>{nombre(etapa, i)}</em>)}{criticas.length > 3 && <em>+{criticas.length - 3}</em>}</span>
        : <span className="cjm-kpi-tags ok"><CheckCircle2 size={12}/> Sin alertas</span>}
    </Indicador>

    <Indicador icono={Lightbulb} titulo="Mejoras propuestas" valor={metricas.oportunidades}
      extra={metricas.altas ? ` · ${metricas.altas} alta` : ''}
      ayuda={sinMejora ? `${sinMejora} fricción(es) aún sin una mejora propuesta.` : metricas.oportunidades ? 'Acciones concretas para mejorar la experiencia.' : 'Propón una acción de mejora en cada fricción.'}>
      <span className="cjm-kpi-tags">{metricas.altas > 0 && <em className="alta">{metricas.altas} prioridad alta</em>}{sinMejora > 0 && <em>{sinMejora} pendiente(s)</em>}</span>
    </Indicador>

    <div className="cjm-progress" title="Campos clave completados: acción, contacto, emoción, fricción y mejora">
      <span><ClipboardCheck size={12}/> Completitud del mapa</span><b>{metricas.completitud}%</b>
      <div><i style={{ width: `${metricas.completitud}%`, background: color }}/></div>
      <small>{metricas.completitud >= 80 ? 'Mapa listo para el análisis.' : 'Completa acción, contacto, emoción, fricción y mejora en cada etapa.'}</small>
    </div>
  </div>;
}
