import { forwardRef } from 'react';
import { iniciales, obtenerEmocion, priorizarOportunidades } from './calculosJourney';
import { formatearTamano } from '../../compartido/documentos/archivosRespaldo';
import MapaJourney from './MapaJourney';
import IconoEmocion from './IconoEmocion';

/* Bloques de un cliente: ficha, mapa, lectura y plan, detalle y conclusión. */
function SeccionCliente({ cliente, metricas, numero }) {
  const { persona, etapas, conclusiones, color } = cliente;
  const oportunidades = priorizarOportunidades(etapas);
  const promedio = obtenerEmocion(Math.round(metricas.promedio || 0));
  return <>
    <div data-pdf-block>
      <div className="cjm-pdf-client" style={{ borderColor: color }}>
        <span className="cjm-avatar" style={{ background: color }}>{iniciales(persona.nombre)}</span>
        <div><small>Cliente {numero}</small><h2 style={{ borderLeft: 0, paddingLeft: 0, margin: 0 }}>{persona.nombre || 'Cliente sin nombre'}</h2></div>
      </div>
      <div className="cjm-pdf-row">
        <div className="cjm-pdf-persona" style={{ borderLeftColor: color }}>
          {persona.perfil && <p><b>Perfil:</b> {persona.perfil}</p>}
          {persona.objetivo && <p><b>Objetivo:</b> {persona.objetivo}</p>}
          {persona.escenario && <p><b>Escenario:</b> {persona.escenario}</p>}
          {!persona.perfil && !persona.objetivo && !persona.escenario && <p>Persona no detallada.</p>}
        </div>
        <div className="cjm-pdf-kpis">
          <div><small>Etapas</small><strong>{metricas.etapas}</strong></div>
          <div><small>Emoción promedio</small><strong style={{ color: promedio?.color, display: 'flex', alignItems: 'center', gap: 6 }}>{promedio && <IconoEmocion valor={promedio.valor} size={22}/>}{metricas.promedio ? `${metricas.promedio.toFixed(1)} / 5` : '—'}</strong></div>
          <div><small>Momentos críticos</small><strong>{metricas.criticas}</strong></div>
          <div><small>Mejoras · alta prioridad</small><strong>{metricas.oportunidades} · {metricas.altas}</strong></div>
        </div>
      </div>
    </div>

    {etapas.length > 0 && <div data-pdf-block><h2>Mapa del recorrido · {persona.nombre || 'Cliente'}</h2><MapaJourney etapas={etapas} color={color}/></div>}

    {etapas.length > 0 && <div data-pdf-block>
      <div>
        <h2>Plan de mejora priorizado</h2>
        <ol className="cjm-plan">{oportunidades.map(item => <li key={item.id}><div className="cjm-btn-plan">
          <span className="cjm-plan-emo"><IconoEmocion valor={item.emocion} size={24}/></span>
          <span className="cjm-plan-text"><small>{item.etiqueta}</small><strong>{item.oportunidad}</strong></span>
          {item.prioridad && <span className={`cjm-priority ${item.prioridad}`}>{item.prioridad}</span>}
        </div></li>)}</ol>
        {!oportunidades.length && <p>Sin oportunidades registradas.</p>}
      </div>
    </div>}

    {etapas.length > 0 && <div data-pdf-block>
      <h2>Detalle por etapa · {persona.nombre || 'Cliente'}</h2>
      <table className="cjm-pdf-table">
        <thead><tr><th>Etapa</th><th>Emoción</th><th>Acción del cliente</th><th>Punto de contacto</th><th>Pensamiento</th><th>Fricción</th><th>Oportunidad</th><th>Prioridad</th></tr></thead>
        <tbody>{etapas.map((etapa, i) => {
          const emocion = obtenerEmocion(etapa.emocion);
          return <tr key={etapa.id}>
            <td><b>{i + 1}. {etapa.nombre || `Etapa ${i + 1}`}</b></td>
            <td style={{ color: emocion?.color }}>{emocion ? `${emocion.valor} · ${emocion.nombre}` : '—'}</td>
            <td>{etapa.accion || '—'}</td><td>{[etapa.canal, etapa.contacto].filter(Boolean).join(' · ') || '—'}</td>
            <td>{etapa.pensamiento || '—'}</td><td>{etapa.dolor || '—'}</td><td>{etapa.oportunidad || '—'}</td><td>{etapa.prioridad || '—'}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>}

    <div data-pdf-block>
      <h2>Conclusión y propuesta de mejora · {persona.nombre || 'Cliente'}</h2>
      <p className="cjm-pdf-notes">{conclusiones.trim() || 'El estudiante aún no registró su conclusión para este cliente.'}</p>
    </div>
  </>;
}

/* Documento oculto (A4 horizontal) que se rasteriza por bloques [data-pdf-block]. */
const ReportePdfJourney = forwardRef(function ReportePdfJourney({ caso, journey, comparacion, imagenes = [] }, ref) {
  const { clientes, documentos } = journey;
  return <div ref={ref} className="cjm-report" aria-hidden="true">
    <div data-pdf-block>
      <header className="cjm-pdf-header">
        <div><span className="cjm-pdf-brand">CJ</span><div><h1>Customer Journey Map</h1><p>Diagnóstico empresarial interno · Experiencia del cliente</p></div></div>
        <span className="cjm-pdf-tag">REPORTE DEL RECORRIDO</span>
      </header>
      <div className="cjm-pdf-meta">
        <div><small>Caso de estudio</small><strong>{caso?.titulo || caso?.nombre || 'Caso empresarial'}</strong></div>
        <div><small>Sector</small><strong>{caso?.sector || caso?.categoria || 'No especificado'}</strong></div>
        <div><small>Clientes analizados</small><strong>{clientes.map(item => item.persona.nombre || 'Cliente').join(', ')}</strong></div>
        <div><small>Fecha</small><strong>{new Date().toLocaleDateString('es-BO')}</strong></div>
      </div>
    </div>

    {comparacion.map(({ cliente, metricas }, i) => <SeccionCliente key={cliente.id} cliente={cliente} metricas={metricas} numero={i + 1}/>)}


    {documentos.length > 0 && <div data-pdf-block>
      <h2>Documentación de respaldo</h2>
      <table className="cjm-pdf-table cjm-pdf-docs">
        <thead><tr><th>#</th><th>Archivo</th><th>Descripción</th><th>Tamaño</th></tr></thead>
        <tbody>{documentos.map((documento, i) => <tr key={documento.id}><td>{i + 1}</td><td>{documento.nombre}</td><td>{documento.descripcion || '—'}</td><td>{formatearTamano(documento.tamano)}</td></tr>)}</tbody>
      </table>
    </div>}
    {imagenes.map((imagen, i) => <div data-pdf-block key={imagen.id} className="cjm-pdf-image">
      <h2>Anexo {i + 1} · {imagen.nombre}</h2>
      {imagen.descripcion && <p>{imagen.descripcion}</p>}
      <img src={imagen.src} alt={imagen.nombre}/>
    </div>)}
  </div>;
});

export default ReportePdfJourney;
