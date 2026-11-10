import { useCallback, useMemo, useRef, useState } from 'react';
import PieNavegacion from '../../simulacion/PieNavegacion';
import { Clock, Crosshair, Flag, Grid2x2, ListChecks, Pencil, Plus, Target, Trash2, User } from 'lucide-react';
import ModalEstrategiaDafo from './ModalEstrategiaDafo';
import ModalConfirmarEliminacion from '../../compartido/modales/ModalConfirmarEliminacion';
import DocumentosRespaldo from '../../compartido/documentos/DocumentosRespaldo';
import { useAccionesDocumentos } from '../../compartido/documentos/useDocumentosRespaldo';
import { formatearTamano } from '../../compartido/documentos/archivosRespaldo';
import { IndicadoresClave, NotasConPlantilla } from '../../compartido/ComponentesHerramienta';
import { BotonPdf } from '../../compartido/BotonPdf';
import useExportarResumen from '../../compartido/pdf/useExportarResumen';
import {
  CUADRANTES_DAFO, LETRAS_FODA, PLANTILLA_CONCLUSION_DAFO, PLAZOS, PRIORIDADES, calcularResumenDafo, crearEstrategia,
  obtenerCuadranteDafo, posicionEstrategica
} from '../calculosPlanificacion';
import '../../compartido/estilos/EstilosHerramientaBase.css';
import '../../fase5-analisis-resultados/resumenes/Resumenes.css';
import '../Planificacion.css';
import '../../fase4-diagnostico-interno/customer-journey/CustomerJourneyMap.css';
import '../../compartido/estilos/EstilosHerramientaTema.css';

const colorLetra = id => LETRAS_FODA.find(l => l.id === id)?.color;

function ChipFactor({ factor, activo, onClick }) {
  const props = { className: `f6-chip${activo ? ' active' : ''}`, style: { '--f6-c': colorLetra(factor.letra) }, title: factor.texto };
  const contenido = <><b>{factor.codigo}</b><span>{factor.texto}</span></>;
  return onClick ? <button type="button" {...props} onClick={onClick} aria-pressed={activo}>{contenido}</button> : <span {...props}>{contenido}</span>;
}

function TarjetaEstrategia({ estrategia, factoresUsados, seleccionada, onSeleccionar, onEditar, onEliminar }) {
  const prioridad = PRIORIDADES.find(p => p.id === estrategia.prioridad);
  const plazo = PLAZOS.find(p => p.id === estrategia.plazo);
  const responsable = estrategia.responsable?.trim();
  const indicador = estrategia.indicador?.trim();
  return <div className={`f6-btn-strategy f6-strategy-card${seleccionada ? ' selected' : ''}`}>
    <button type="button" className="f6-btn-strategy-body" onClick={onSeleccionar} title="Resaltar sus factores en la matriz">
      <span className="f6-strategy-text">{estrategia.texto.trim() || <em>Estrategia sin redactar</em>}</span>
      <span className="f6-strategy-meta">
        <span className={`f6-prio ${estrategia.prioridad}`}>{prioridad?.nombre}</span>
        <span className="f6-term"><Clock size={9}/> {plazo?.nombre.replace(' plazo', '')}</span>
        {factoresUsados.length
          ? factoresUsados.map(f => <b key={f.id} className="f6-sc-chip" style={{ '--f6-c': colorLetra(f.letra) }} title={f.texto}>{f.codigo}</b>)
          : <i>Sin factores</i>}
      </span>
    </button>
    <span className="f6-strategy-actions" data-html2canvas-ignore>
      <button type="button" className="hf-btn-icon sm" onClick={onEditar} title="Editar estrategia" aria-label="Editar estrategia"><Pencil size={12}/></button>
      <button type="button" className="hf-btn-icon sm danger" onClick={onEliminar} title="Eliminar estrategia" aria-label="Eliminar estrategia"><Trash2 size={12}/></button>
    </span>
    {(responsable || indicador) && <div className="f6-sc-foot">
      {responsable && <span title="Responsable"><User size={11}/> {responsable}</span>}
      {indicador && <span title="Indicador de éxito"><Target size={11}/> {indicador}</span>}
    </div>}
  </div>;
}

function CeldaDafo({ c, estrategias, recomendado, seleccion, factorDe, onSeleccionar, onEditar, onEliminar, onAgregar }) {
  const lista = estrategias.filter(e => e.cuadrante === c.id);
  return <div className={`f6-cell${recomendado ? ' recomendado' : ''}`} style={{ '--f6-c': c.color, '--f6-bg': c.fondo }}>
    <header>
      <span className="f6-quad-badge">{c.id}</span>
      <div><strong>{c.nombre}</strong><small>{c.alias} · {c.verbo}</small></div>
      {recomendado && <span className="f6-rec" title="Cuadrante que mejor encaja con la posición de la empresa">Sugerido</span>}
    </header>
    <div className="f6-cell-list">
      {lista.map(e => <TarjetaEstrategia key={e.id} estrategia={e} factoresUsados={e.factores.map(factorDe).filter(Boolean)} seleccionada={seleccion === e.id} onSeleccionar={() => onSeleccionar(e.id)} onEditar={() => onEditar(e.id)} onEliminar={() => onEliminar(e.id)}/>)}
      {!lista.length && <p className="f6-cell-empty">Cruza {c.interno === 'F' ? 'una fortaleza' : 'una debilidad'} con {c.externo === 'O' ? 'una oportunidad' : 'una amenaza'}.</p>}
    </div>
    <footer data-html2canvas-ignore>
      <button type="button" className="f6-btn-add" onClick={onAgregar}><Plus size={13}/> Estrategia</button>
    </footer>
  </div>;
}

function EncabezadoFoda({ letra, factores, resaltados }) {
  const info = LETRAS_FODA.find(l => l.id === letra);
  return <div className={`f6-head f6-head-${letra}`} style={{ '--f6-c': info.color }}>
    <strong><b>{letra}</b>{info.nombre}<em>{factores[letra].length}</em></strong>
    <div className="f6-chips">{factores[letra].length ? factores[letra].map(f => <ChipFactor key={f.id} factor={f} activo={resaltados.has(f.id)}/>) : <span className="hf-muted">Sin factores</span>}</div>
  </div>;
}

/** Fase 6 · Matriz DAFO: estrategias que cruzan los factores internos y externos del FODA. */
export default function MatrizDafo({ casoActivo, factores, plan, actualizarPlan }) {
  const ref = useRef(null);
  const [seleccion, setSeleccion] = useState(null);
  const [modal, setModal] = useState(null); // { tipo: 'nueva', cuadrante } | { tipo: 'editar', id }
  const [confirmacion, setConfirmacion] = useState(null); // id de la estrategia a eliminar
  const { estrategias, conclusiones } = plan.dafo;
  const documentos = plan.dafo.documentos || [];
  const posicion = useMemo(() => posicionEstrategica(factores), [factores]);
  const resumen = useMemo(() => calcularResumenDafo(estrategias, factores), [estrategias, factores]);
  const { exportando, exportar } = useExportarResumen({ ref, caso: casoActivo, nombreBase: 'Matriz_DAFO', pie: 'Matriz DAFO · Análisis Empresarial' });
  const todos = [...factores.F, ...factores.D, ...factores.O, ...factores.A];
  const factorDe = id => todos.find(f => f.id === id);
  const activa = estrategias.find(e => e.id === seleccion);
  const resaltados = new Set(activa?.factores || []);
  const enEdicion = modal?.tipo === 'editar' ? estrategias.find(e => e.id === modal.id) : null;
  const aEliminar = confirmacion ? estrategias.find(e => e.id === confirmacion) : null;

  const editarDafo = transformar => actualizarPlan(p => ({ ...p, dafo: transformar(p.dafo) }));
  const editar = (id, cambios) => editarDafo(d => ({ ...d, estrategias: d.estrategias.map(e => (e.id === id ? { ...e, ...cambios } : e)) }));
  const seleccionar = id => setSeleccion(actual => (actual === id ? null : id));
  const crear = valores => {
    const nueva = crearEstrategia(modal.cuadrante, valores);
    editarDafo(d => ({ ...d, estrategias: [...d.estrategias, nueva] }));
    setSeleccion(nueva.id);
    setModal(null);
  };
  const confirmarEliminacion = () => {
    editarDafo(d => ({ ...d, estrategias: d.estrategias.filter(e => e.id !== confirmacion) }));
    if (seleccion === confirmacion) setSeleccion(null);
    if (modal?.id === confirmacion) setModal(null);
    setConfirmacion(null);
  };
  const setDocumentos = useCallback(transformar => actualizarPlan(p => ({ ...p, dafo: { ...p.dafo, documentos: transformar(p.dafo.documentos || []) } })), [actualizarPlan]);
  const accionesDocs = useAccionesDocumentos(documentos, setDocumentos);
  const rec = obtenerCuadranteDafo(posicion.recomendado);
  const propsCelda = id => ({
    estrategias, recomendado: posicion.recomendado === id, seleccion, factorDe,
    onSeleccionar: seleccionar, onEditar: idEstrategia => setModal({ tipo: 'editar', id: idEstrategia }), onEliminar: idEstrategia => setConfirmacion(idEstrategia),
    onAgregar: () => setModal({ tipo: 'nueva', cuadrante: id })
  });

  const kpis = [
    { icono: ListChecks, label: 'Estrategias', valor: resumen.total, detalle: CUADRANTES_DAFO.map(c => `${c.id} ${resumen.porCuadrante[c.id]}`).join(' · ') },
    { icono: Flag, label: 'Prioridad alta', valor: resumen.altas, tono: resumen.altas ? 'ok' : '' },
    { icono: Grid2x2, label: 'Cobertura del FODA', valor: `${resumen.cobertura}%`, detalle: 'factores usados en alguna estrategia', tono: resumen.cobertura >= 80 ? 'ok' : resumen.cobertura >= 40 ? 'warn' : 'bad' },
    { icono: Crosshair, label: 'Postura sugerida', valor: rec.id, detalle: `Estrategias ${rec.nombre.toLowerCase()}` }
  ];

  return <div className="hf-container r5 f6" ref={ref}>
    <div className="hf-toolbar" data-pdf-block>
      <div className="hf-toolbar-badge"><Grid2x2 size={15}/><span>Matriz DAFO · Estrategias cruzadas</span></div>
      <BotonPdf exportando={exportando} onClick={exportar} texto="Exportar a PDF"/>
    </div>
    <div data-pdf-block><IndicadoresClave items={kpis}/></div>

    <section className="hf-card f6-matrix-card" data-pdf-block>
      <div className="f6-matrix">
        <div className="f6-corner"><Grid2x2 size={18}/><strong>DAFO</strong><small>Interno ↓ · Externo →</small></div>
        <EncabezadoFoda letra="O" factores={factores} resaltados={resaltados}/>
        <EncabezadoFoda letra="A" factores={factores} resaltados={resaltados}/>
        <EncabezadoFoda letra="F" factores={factores} resaltados={resaltados}/>
        <CeldaDafo c={obtenerCuadranteDafo('FO')} {...propsCelda('FO')}/>
        <CeldaDafo c={obtenerCuadranteDafo('FA')} {...propsCelda('FA')}/>
        <EncabezadoFoda letra="D" factores={factores} resaltados={resaltados}/>
        <CeldaDafo c={obtenerCuadranteDafo('DO')} {...propsCelda('DO')}/>
        <CeldaDafo c={obtenerCuadranteDafo('DA')} {...propsCelda('DA')}/>
      </div>
    </section>


    <section className="hf-card" data-pdf-block>
      <NotasConPlantilla id="f6-dafo-conclusiones" titulo="Conclusión estratégica" valor={conclusiones} onCambio={valor => editarDafo(d => ({ ...d, conclusiones: valor }))} plantilla={PLANTILLA_CONCLUSION_DAFO} placeholder="¿Cuál es la estrategia prioritaria y qué postura debe adoptar la empresa?"/>
    </section>

    <DocumentosRespaldo documentos={documentos} acciones={accionesDocs}
      ayuda="Adjunta informes, estudios de mercado, actas o fotos que respalden tus estrategias. Puedes relacionar cada archivo con una estrategia."
      renderExtra={documento => <select className="fl-doc-step" value={documento.estrategiaId || ''} onChange={e => accionesDocs.editarDocumento(documento.id, { estrategiaId: e.target.value })} aria-label={`Estrategia relacionada con ${documento.nombre}`}>
        <option value="">Evidencia general</option>{estrategias.map(e => <option key={e.id} value={e.id}>{e.cuadrante}: {e.texto.trim().slice(0, 60) || 'Estrategia sin redactar'}</option>)}
      </select>}/>

    {documentos.length > 0 && <section className="hf-card f6-pdf-docs" data-pdf-block aria-hidden="true">
      <h3 className="hf-card-title">Evidencia adjunta</h3>
      <table className="hf-pdf-table">
        <thead><tr><th>#</th><th>Archivo</th><th>Estrategia relacionada</th><th>Descripción</th><th>Tamaño</th></tr></thead>
        <tbody>{documentos.map((documento, i) => {
          const est = estrategias.find(e => e.id === documento.estrategiaId);
          return <tr key={documento.id}><td>{i + 1}</td><td>{documento.nombre}</td><td>{est ? `${est.cuadrante}: ${est.texto.trim() || 'Sin redactar'}` : 'General'}</td><td>{documento.descripcion || '—'}</td><td>{formatearTamano(documento.tamano)}</td></tr>;
        })}</tbody>
      </table>
    </section>}

    <ModalEstrategiaDafo abierto={Boolean(modal) && (modal.tipo === 'nueva' || Boolean(enEdicion))} estrategia={enEdicion} cuadrante={modal?.cuadrante} factores={factores}
      onCrear={crear} onEditar={cambios => editar(enEdicion.id, cambios)} onEliminar={() => setConfirmacion(enEdicion.id)} onCerrar={() => setModal(null)}/>
    <ModalConfirmarEliminacion abierto={Boolean(aEliminar)} titulo="Eliminar estrategia" textoConfirmar="Eliminar estrategia" onConfirmar={confirmarEliminacion} onCerrar={() => setConfirmacion(null)}
      detalle={aEliminar && <><span className="f6-quad-badge" style={{ '--f6-c': obtenerCuadranteDafo(aEliminar.cuadrante).color }}>{aEliminar.cuadrante}</span><span><strong>{aEliminar.texto.trim() || 'Estrategia sin redactar'}</strong><small>{PRIORIDADES.find(p => p.id === aEliminar.prioridad)?.nombre} prioridad · {PLAZOS.find(p => p.id === aEliminar.plazo)?.nombre}</small></span></>}
      mensaje="Se quitará de la matriz y del plan estratégico."/>

    <PieNavegacion/>
  </div>;
}
