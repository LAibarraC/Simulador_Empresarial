import { useCallback, useMemo, useRef, useState } from 'react';
import PieNavegacion from '../../simulacion/PieNavegacion';
import { Clock, Coins, Flag, Gauge, Link2, Pencil, Plus, Rocket, Star, Trash2 } from 'lucide-react';
import EstrellasPotencial from './EstrellasPotencial';
import ModalIniciativaAnsoff from './ModalIniciativaAnsoff';
import ModalConfirmarEliminacion from '../../compartido/modales/ModalConfirmarEliminacion';
import DocumentosRespaldo from '../../compartido/documentos/DocumentosRespaldo';
import { useAccionesDocumentos } from '../../compartido/documentos/useDocumentosRespaldo';
import { formatearTamano } from '../../compartido/documentos/archivosRespaldo';
import { IndicadoresClave, NotasConPlantilla } from '../../compartido/ComponentesHerramienta';
import { BotonPdf } from '../../compartido/BotonPdf';
import useExportarResumen from '../../compartido/pdf/useExportarResumen';
import {
  CUADRANTES_ANSOFF, NIVELES_RIESGO, PLANTILLA_CONCLUSION_ANSOFF, PLAZOS, atractivoIniciativa, calcularResumenAnsoff, crearIniciativa, obtenerCuadranteAnsoff
} from '../calculosPlanificacion';
import '../../compartido/estilos/EstilosHerramientaBase.css';
import '../../fase5-analisis-resultados/resumenes/Resumenes.css';
import '../Planificacion.css';
import '../../fase4-diagnostico-interno/customer-journey/CustomerJourneyMap.css';
import '../../compartido/estilos/EstilosHerramientaTema.css';

const moneda = v => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 0 }).format(Number(v) || 0);

function Riesgo({ nivel }) {
  return <span className={`f6-risk r${nivel}`} title={`Riesgo ${NIVELES_RIESGO[nivel].toLowerCase()}`}>{[1, 2, 3].map(n => <i key={n} className={n <= nivel ? 'on' : ''}/>)}<em>Riesgo {NIVELES_RIESGO[nivel].toLowerCase()}</em></span>;
}

function CuadranteAnsoff({ c, iniciativas, principal, seleccion, estrategias, onSeleccionar, onEditar, onEliminar, onAgregar, onPrincipal }) {
  const lista = iniciativas.filter(i => i.cuadrante === c.id);
  const esPrincipal = principal === c.id;
  return <div className={`f6-ansoff-q q-${c.id}${esPrincipal ? ' principal' : ''}`} style={{ '--f6-c': c.color }}>
    <header>
      <div><strong>{c.nombre}</strong><small>Producto {c.producto} · Mercado {c.mercado}</small></div>
      <button type="button" className={`f6-btn-principal${esPrincipal ? ' active' : ''}`} onClick={onPrincipal} title={esPrincipal ? 'Estrategia principal elegida' : 'Elegir como estrategia de crecimiento principal'} data-html2canvas-ignore>
        <Star size={14}/>{esPrincipal ? 'Principal' : 'Elegir'}
      </button>
      {esPrincipal && <span className="f6-principal-tag">Estrategia principal</span>}
    </header>
    <Riesgo nivel={c.riesgo}/>
    <p className="f6-ansoff-desc">{c.descripcion}</p>
    <div className="f6-ansoff-list">
      {lista.map(i => {
        const estrategia = estrategias.find(e => e.id === i.estrategiaDafo);
        const plazo = PLAZOS.find(p => p.id === i.plazo)?.nombre.replace(' plazo', '');
        return <div key={i.id} className={`f6-ini-card${seleccion === i.id ? ' selected' : ''}`}>
          <button type="button" className="f6-btn-ini-body" onClick={() => onSeleccionar(i.id)} title="Resaltar iniciativa">
            <span className="f6-ini-head">
              <span className="f6-ini-name">{i.nombre.trim() || <em>Iniciativa sin nombre</em>}</span>
              <b className="f6-score" title="Atractivo (potencial frente a riesgo)">{atractivoIniciativa(i)}/10</b>
            </span>
            <span className="f6-ini-meta">
              <EstrellasPotencial valor={Number(i.potencial) || 0}/>
              {Number(i.inversion) > 0 && <span className="f6-ini-chip"><Coins size={10}/>{moneda(i.inversion)}</span>}
              {plazo && <span className="f6-ini-chip"><Clock size={10}/>{plazo}</span>}
              {estrategia && <span className="f6-ini-chip link"><Link2 size={10}/>DAFO {estrategia.cuadrante}</span>}
            </span>
          </button>
          <span className="f6-ini-actions" data-html2canvas-ignore>
            <button type="button" className="hf-btn-icon sm" onClick={() => onEditar(i.id)} title="Editar iniciativa" aria-label="Editar iniciativa"><Pencil size={12}/></button>
            <button type="button" className="hf-btn-icon sm danger" onClick={() => onEliminar(i.id)} title="Eliminar iniciativa" aria-label="Eliminar iniciativa"><Trash2 size={12}/></button>
          </span>
        </div>;
      })}
    </div>
    <div className="f6-tactics" data-html2canvas-ignore>
      <span>Ideas rápidas:</span>
      {c.tacticas.map(t => <button type="button" key={t} className="f6-btn-tactic" onClick={() => onAgregar({ nombre: t })}><Plus size={11}/>{t}</button>)}
    </div>
    <button type="button" className="f6-btn-add" onClick={() => onAgregar()} data-html2canvas-ignore><Plus size={13}/> Iniciativa propia</button>
  </div>;
}

/** Fase 6 · Matriz Ansoff: estrategias de crecimiento según producto y mercado. */
export default function MatrizAnsoff({ casoActivo, plan, actualizarPlan }) {
  const ref = useRef(null);
  const [seleccion, setSeleccion] = useState(null);
  const [modal, setModal] = useState(null); // { tipo: 'nueva', cuadrante, inicial } | { tipo: 'editar', id }
  const [confirmacion, setConfirmacion] = useState(null); // id de la iniciativa a eliminar
  const { iniciativas, principal, conclusiones } = plan.ansoff;
  const documentos = plan.ansoff.documentos || [];
  const estrategias = plan.dafo.estrategias;
  const resumen = useMemo(() => calcularResumenAnsoff(iniciativas), [iniciativas]);
  const principalEfectiva = principal || (iniciativas.length ? resumen.recomendado : '');
  const { exportando, exportar } = useExportarResumen({ ref, caso: casoActivo, nombreBase: 'Matriz_Ansoff', pie: 'Matriz Ansoff · Análisis Empresarial' });
  const enEdicion = modal?.tipo === 'editar' ? iniciativas.find(i => i.id === modal.id) : null;
  const aEliminar = confirmacion ? iniciativas.find(i => i.id === confirmacion) : null;

  const editarAnsoff = transformar => actualizarPlan(p => ({ ...p, ansoff: transformar(p.ansoff) }));
  const editar = (id, cambios) => editarAnsoff(a => ({ ...a, iniciativas: a.iniciativas.map(i => (i.id === id ? { ...i, ...cambios } : i)) }));
  const seleccionar = id => setSeleccion(actual => (actual === id ? null : id));
  const crear = valores => {
    const { cuadrante, ...cambios } = valores;
    const nueva = crearIniciativa(cuadrante, cambios);
    editarAnsoff(a => ({ ...a, iniciativas: [...a.iniciativas, nueva] }));
    setSeleccion(nueva.id);
    setModal(null);
  };
  const confirmarEliminacion = () => {
    editarAnsoff(a => ({ ...a, iniciativas: a.iniciativas.filter(i => i.id !== confirmacion) }));
    if (seleccion === confirmacion) setSeleccion(null);
    if (modal?.id === confirmacion) setModal(null);
    setConfirmacion(null);
  };
  const propsCuadrante = id => ({
    c: obtenerCuadranteAnsoff(id), iniciativas, principal: principalEfectiva, seleccion, estrategias,
    onSeleccionar: seleccionar, onEditar: idIniciativa => setModal({ tipo: 'editar', id: idIniciativa }), onEliminar: idIniciativa => setConfirmacion(idIniciativa),
    onAgregar: inicial => setModal({ tipo: 'nueva', cuadrante: id, inicial }),
    onPrincipal: () => editarAnsoff(a => ({ ...a, principal: a.principal === id ? '' : id }))
  });
  const setDocumentos = useCallback(transformar => actualizarPlan(p => ({ ...p, ansoff: { ...p.ansoff, documentos: transformar(p.ansoff.documentos || []) } })), [actualizarPlan]);
  const accionesDocs = useAccionesDocumentos(documentos, setDocumentos);
  const kpis = [
    { icono: Rocket, label: 'Iniciativas', valor: resumen.total, detalle: CUADRANTES_ANSOFF.map(c => `${c.nombre.split(' ')[0]} ${resumen.cuadrantes.find(q => q.id === c.id).total}`).join(' · ') },
    { icono: Coins, label: 'Inversión estimada', valor: moneda(resumen.inversion) },
    { icono: Gauge, label: 'Riesgo de la cartera', valor: resumen.riesgoMedio === null ? '—' : NIVELES_RIESGO[Math.round(resumen.riesgoMedio)], tono: resumen.riesgoMedio === null ? '' : resumen.riesgoMedio >= 2.5 ? 'bad' : resumen.riesgoMedio >= 1.6 ? 'warn' : 'ok' },
    { icono: Flag, label: 'Estrategia principal', valor: principalEfectiva ? obtenerCuadranteAnsoff(principalEfectiva).nombre : '—', detalle: principal ? 'Elegida por ti' : iniciativas.length ? 'Sugerida por el análisis' : undefined }
  ];

  return <div className="hf-container r5 f6" ref={ref}>
    <div className="hf-toolbar" data-pdf-block>
      <div className="hf-toolbar-badge"><Rocket size={15}/><span>Matriz Ansoff · Estrategias de crecimiento</span></div>
      <BotonPdf exportando={exportando} onClick={exportar} texto="Exportar a PDF"/>
    </div>
    <div data-pdf-block><IndicadoresClave items={kpis}/></div>

    <section className="hf-card f6-ansoff-card" data-pdf-block>
      <div className="f6-ansoff">
        <div className="f6-ansoff-corner"/>
        <div className="f6-ansoff-axis top">Productos actuales</div>
        <div className="f6-ansoff-axis top nuevo">Productos nuevos</div>
        <div className="f6-ansoff-axis side"><span>Mercados actuales</span></div>
        {['penetracion', 'producto'].map(id => <CuadranteAnsoff key={id} {...propsCuadrante(id)}/>)}
        <div className="f6-ansoff-axis side nuevo"><span>Mercados nuevos</span></div>
        {['mercado', 'diversificacion'].map(id => <CuadranteAnsoff key={id} {...propsCuadrante(id)}/>)}
      </div>
      <div className="f6-risk-scale"><span>Menor riesgo</span><i/><span>Mayor riesgo</span></div>
    </section>


    <section className="hf-card" data-pdf-block>
      <NotasConPlantilla id="f6-ansoff-conclusiones" titulo="Conclusión de crecimiento" valor={conclusiones} onCambio={valor => editarAnsoff(a => ({ ...a, conclusiones: valor }))} plantilla={PLANTILLA_CONCLUSION_ANSOFF} placeholder="¿Qué estrategia de crecimiento elegiste y cuáles son los primeros pasos?"/>
    </section>

    <DocumentosRespaldo documentos={documentos} acciones={accionesDocs}
      ayuda="Adjunta estudios de mercado, cotizaciones, presupuestos o planes que respalden tus iniciativas. Puedes relacionar cada archivo con una iniciativa."
      renderExtra={documento => <select className="fl-doc-step" value={documento.iniciativaId || ''} onChange={e => accionesDocs.editarDocumento(documento.id, { iniciativaId: e.target.value })} aria-label={`Iniciativa relacionada con ${documento.nombre}`}>
        <option value="">Evidencia general</option>{iniciativas.map(i => <option key={i.id} value={i.id}>{obtenerCuadranteAnsoff(i.cuadrante).nombre}: {i.nombre.trim().slice(0, 60) || 'Iniciativa sin nombre'}</option>)}
      </select>}/>

    {documentos.length > 0 && <section className="hf-card f6-pdf-docs" data-pdf-block aria-hidden="true">
      <h3 className="hf-card-title">Evidencia adjunta</h3>
      <table className="hf-pdf-table">
        <thead><tr><th>#</th><th>Archivo</th><th>Iniciativa relacionada</th><th>Descripción</th><th>Tamaño</th></tr></thead>
        <tbody>{documentos.map((documento, i) => {
          const ini = iniciativas.find(x => x.id === documento.iniciativaId);
          return <tr key={documento.id}><td>{i + 1}</td><td>{documento.nombre}</td><td>{ini ? (ini.nombre.trim() || 'Sin nombre') : 'General'}</td><td>{documento.descripcion || '—'}</td><td>{formatearTamano(documento.tamano)}</td></tr>;
        })}</tbody>
      </table>
    </section>}

    <ModalIniciativaAnsoff abierto={Boolean(modal) && (modal.tipo === 'nueva' || Boolean(enEdicion))} iniciativa={enEdicion} cuadrante={modal?.cuadrante} inicial={modal?.inicial} estrategias={estrategias}
      onCrear={crear} onEditar={cambios => editar(enEdicion.id, cambios)} onEliminar={() => setConfirmacion(enEdicion.id)} onCerrar={() => setModal(null)}/>
    <ModalConfirmarEliminacion abierto={Boolean(aEliminar)} titulo="Eliminar iniciativa" textoConfirmar="Eliminar iniciativa" onConfirmar={confirmarEliminacion} onCerrar={() => setConfirmacion(null)}
      detalle={aEliminar && <><span className="f6-quad-badge" style={{ '--f6-c': obtenerCuadranteAnsoff(aEliminar.cuadrante).color }}><Rocket size={14}/></span><span><strong>{aEliminar.nombre.trim() || 'Iniciativa sin nombre'}</strong><small>{obtenerCuadranteAnsoff(aEliminar.cuadrante).nombre} · {atractivoIniciativa(aEliminar)}/10</small></span></>}
      mensaje="Se quitará de la matriz, del mapa y del ranking."/>

    <PieNavegacion/>
  </div>;
}
