import { useState, useMemo, useEffect } from 'react';
import RespaldoHerramienta from '../../compartido/documentos/RespaldoHerramienta';
import PieNavegacion from '../../simulacion/PieNavegacion';
import { EncabezadoHerramienta } from '../../compartido/ComponentesHerramienta';
import {
  Globe,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Check,
  X,
  Paperclip,
  FileText,
  Image,
  FileSpreadsheet,
  Link2,
  ExternalLink,
  Trash2,
  UploadCloud
} from 'lucide-react';
import { alerta } from '../../../../utils/Notificaciones';
import { DIMENSIONES_PESTEL, obtenerDatosPestelIniciales } from './datosPestel';
import './AnalisisPESTEL.css';

export default function AnalisisPESTEL({
  casoActivo,
  datosPestel,
  setDatosPestel,
  onContinuarAPorter,
  onIrAArbol,
  onExportarPDF,
  exportandoPDF = false
}) {
  // Acordeón de criterios por cada dimensión
  const [criteriosExpandidos, setCriteriosExpandidos] = useState({
    politico: false,
    economico: false,
    social: false,
    tecnologico: false,
    ecologico: false,
    legal: false
  });

  // Estado del Modal para Adicionar / Editar factor
  const [modalFactor, setModalFactor] = useState({
    abierto: false,
    modo: 'crear', // 'crear' | 'editar'
    dimId: null,
    factorIdx: null,
    factorId: null,
    tipo: 'Oportunidad',
    subdimension: '',
    subdimensionCustom: '',
    modoCustom: false,
    texto: ''
  });

  const abrirModalNuevoFactor = (dimId) => {
    const dimObj = DIMENSIONES_PESTEL.find(d => d.id === dimId);
    const primeraSub = dimObj?.subdimensionesComunes?.[0] || '';
    setModalFactor({
      abierto: true,
      modo: 'crear',
      dimId,
      factorIdx: null,
      factorId: null,
      tipo: 'Oportunidad',
      subdimension: primeraSub,
      subdimensionCustom: '',
      modoCustom: false,
      texto: ''
    });
  };

  const abrirModalEditarFactor = (dimId, idx, item) => {
    const isObj = typeof item === 'object' && item !== null;
    const factorTexto = isObj ? item.texto : item;
    const factorTipo = isObj && item.tipo ? item.tipo : 'Oportunidad';
    const factorSubdimension = isObj && item.subdimension ? item.subdimension : '';
    const factorId = isObj && item.id ? item.id : `pestel-${dimId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const dimObj = DIMENSIONES_PESTEL.find(d => d.id === dimId);
    const comunes = dimObj?.subdimensionesComunes || [];
    const esComun = comunes.includes(factorSubdimension);

    setModalFactor({
      abierto: true,
      modo: 'editar',
      dimId,
      factorIdx: idx,
      factorId,
      tipo: factorTipo,
      subdimension: esComun ? factorSubdimension : (factorSubdimension ? '__custom__' : (comunes[0] || '')),
      subdimensionCustom: esComun ? '' : factorSubdimension,
      modoCustom: !esComun && Boolean(factorSubdimension),
      texto: factorTexto || ''
    });
  };

  const cerrarModalFactor = () => {
    setModalFactor({
      abierto: false,
      modo: 'crear',
      dimId: null,
      factorIdx: null,
      factorId: null,
      tipo: 'Oportunidad',
      subdimension: '',
      subdimensionCustom: '',
      modoCustom: false,
      texto: ''
    });
  };

  const guardarFactorDesdeModal = (e) => {
    e?.preventDefault();
    const { modo, dimId, factorIdx, factorId, tipo, subdimension, subdimensionCustom, modoCustom, texto } = modalFactor;
    const textoLimpio = (texto || '').trim();
    if (!textoLimpio) {
      alerta.advertencia("Texto requerido", "Por favor ingresa la descripción del factor.");
      return;
    }

    const dimObj = DIMENSIONES_PESTEL.find(d => d.id === dimId);
    const subdimensionFinal = modoCustom
      ? (subdimensionCustom || '').trim() || 'General'
      : (subdimension || (dimObj?.subdimensionesComunes?.[0] || 'General'));

    if (modo === 'editar') {
      setDatosPestel(prev => {
        const prevDims = prev?.dimensiones || {};
        const target = prevDims[dimId] || {};
        const list = [...(target.factoresManuales || [])];
        const itemActual = list[factorIdx];

        const itemActualizado = {
          ...(typeof itemActual === 'object' && itemActual !== null ? itemActual : {}),
          id: factorId || `pestel-${dimId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          texto: textoLimpio,
          tipo: tipo || 'Oportunidad',
          subdimension: subdimensionFinal,
          fechaEdicion: new Date().toISOString()
        };

        list[factorIdx] = itemActualizado;

        return {
          ...prev,
          dimensiones: {
            ...prevDims,
            [dimId]: {
              ...target,
              factoresManuales: list
            }
          }
        };
      });

      alerta.exito("Factor Actualizado", `Se guardaron los cambios del factor en ${dimObj?.nombre || dimId}.`);
    } else {
      // Modo crear
      const nuevoFactor = {
        id: `pestel-${dimId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        texto: textoLimpio,
        tipo: tipo || 'Oportunidad',
        subdimension: subdimensionFinal,
        fechaCreacion: new Date().toISOString()
      };

      setDatosPestel(prev => {
        const prevDims = prev?.dimensiones || {};
        const target = prevDims[dimId] || {};
        return {
          ...prev,
          dimensiones: {
            ...prevDims,
            [dimId]: {
              ...target,
              factoresManuales: [...(target.factoresManuales || []), nuevoFactor]
            }
          }
        };
      });

      alerta.exito("Factor Registrado", `Has añadido el factor en ${dimObj?.nombre || dimId} como ${nuevoFactor.tipo}.`);
    }

    cerrarModalFactor();
  };

  // Modal de Evidencia Documental por Factor (.pdf, imágenes, hojas de cálculo, enlace web)
  const [modalAdjuntos, setModalAdjuntos] = useState({
    abierto: false,
    factorKey: null,
    factorTexto: '',
    dimensionNombre: ''
  });
  const [tabTipoAdjunto, setTabTipoAdjunto] = useState('pdf'); // 'pdf' | 'imagen' | 'hoja_calculo' | 'enlace'
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [nombreArchivoInput, setNombreArchivoInput] = useState('');
  const [urlEnlaceInput, setUrlEnlaceInput] = useState('');
  const [tituloEnlaceInput, setTituloEnlaceInput] = useState('');

  // Estado consolidado de las 6 dimensiones PESTEL
  const estadoDimensiones = useMemo(() => {
    if (datosPestel?.dimensiones) return datosPestel.dimensiones;
    const base = obtenerDatosPestelIniciales(casoActivo?.id);
    return base.dimensiones;
  }, [datosPestel, casoActivo]);

  // Garantizar que siempre se inicie sin criterios de evaluación seleccionados
  useEffect(() => {
    setDatosPestel(prev => {
      if (!prev?.dimensiones) return prev;
      let hayCriteriosActivos = false;
      const dims = { ...prev.dimensiones };
      Object.keys(dims).forEach(k => {
        if (dims[k]?.criteriosActivos && Object.values(dims[k].criteriosActivos).some(Boolean)) {
          hayCriteriosActivos = true;
          dims[k] = { ...dims[k], criteriosActivos: {} };
        }
      });
      if (!hayCriteriosActivos) return prev;
      return { ...prev, dimensiones: dims };
    });
  }, [casoActivo?.id, setDatosPestel]);



  // Modificar criterios activos
  const toggleCriterio = (dimId, critId) => {
    setDatosPestel(prev => {
      const prevDims = prev?.dimensiones || {};
      const target = prevDims[dimId] || {};
      const act = { ...(target.criteriosActivos || {}) };
      act[critId] = !act[critId];
      return {
        ...prev,
        dimensiones: {
          ...prevDims,
          [dimId]: {
            ...target,
            criteriosActivos: act
          }
        }
      };
    });
  };

  // Eliminar factor
  const eliminarFactorManual = (dimId, idx) => {
    setDatosPestel(prev => {
      const prevDims = prev?.dimensiones || {};
      const target = prevDims[dimId] || {};
      const list = [...(target.factoresManuales || [])];
      list.splice(idx, 1);
      return {
        ...prev,
        dimensiones: {
          ...prevDims,
          [dimId]: {
            ...target,
            factoresManuales: list
          }
        }
      };
    });
    alerta.info("Factor Eliminado", "Se retiró el factor de la dimensión.");
  };

  // ============================================================================
  // GESTIÓN DE EVIDENCIA DOCUMENTAL POR FACTOR (.pdf, imágenes, hojas de cálculo, URL)
  // ============================================================================
  const abrirModalAdjuntos = (factorKey, factorTexto, dimensionNombre) => {
    setModalAdjuntos({
      abierto: true,
      factorKey,
      factorTexto,
      dimensionNombre
    });
    setTabTipoAdjunto('pdf');
    setArchivoSeleccionado(null);
    setNombreArchivoInput('');
    setUrlEnlaceInput('');
    setTituloEnlaceInput('');
  };

  const cerrarModalAdjuntos = () => {
    setModalAdjuntos({
      abierto: false,
      factorKey: null,
      factorTexto: '',
      dimensionNombre: ''
    });
    setArchivoSeleccionado(null);
  };

  const formatearTamanoArchivo = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleFileChange = (e, tipoEsperado) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (tipoEsperado === 'pdf' && !file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alerta.error('Formato no válido', 'Por favor selecciona un archivo con extensión .pdf');
      return;
    }
    if (tipoEsperado === 'imagen' && !file.type.startsWith('image/')) {
      alerta.error('Formato no válido', 'Por favor selecciona una imagen (.png, .jpg, .webp, .svg)');
      return;
    }
    if (tipoEsperado === 'hoja_calculo' && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alerta.error('Formato no válido', 'Por favor selecciona una hoja de cálculo (.xlsx, .xls o .csv)');
      return;
    }

    setArchivoSeleccionado({
      file,
      tipo: tipoEsperado,
      nombre: file.name,
      tamano: formatearTamanoArchivo(file.size),
      previewUrl: tipoEsperado === 'imagen' ? URL.createObjectURL(file) : null
    });
    setNombreArchivoInput(file.name.replace(/\.[^/.]+$/, ''));
  };

  const guardarAdjuntoArchivo = () => {
    if (!archivoSeleccionado) {
      alerta.advertencia('Archivo no seleccionado', 'Por favor selecciona un archivo para adjuntar.');
      return;
    }

    const { factorKey } = modalAdjuntos;
    if (!factorKey) return;

    const nuevoAdjunto = {
      id: 'adj-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      tipo: archivoSeleccionado.tipo,
      nombre: (nombreArchivoInput.trim() || archivoSeleccionado.nombre),
      archivoNombreOriginal: archivoSeleccionado.nombre,
      url: archivoSeleccionado.previewUrl || URL.createObjectURL(archivoSeleccionado.file),
      tamano: archivoSeleccionado.tamano,
      fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    setDatosPestel(prev => {
      const prevAdjuntos = prev?.adjuntosPorFactor || {};
      const listaActual = prevAdjuntos[factorKey] || [];
      return {
        ...prev,
        adjuntosPorFactor: {
          ...prevAdjuntos,
          [factorKey]: [...listaActual, nuevoAdjunto]
        }
      };
    });

    alerta.exito('Evidencia Adjuntada', `Se ha respaldado con éxito "${nuevoAdjunto.nombre}".`);
    setArchivoSeleccionado(null);
    setNombreArchivoInput('');
  };

  const guardarAdjuntoEnlace = (e) => {
    e?.preventDefault();
    if (!urlEnlaceInput.trim()) {
      alerta.advertencia('URL Requerida', 'Por favor ingresa una URL válida (ej: https://...).');
      return;
    }

    let urlFinal = urlEnlaceInput.trim();
    if (!/^https?:\/\//i.test(urlFinal)) {
      urlFinal = 'https://' + urlFinal;
    }

    const { factorKey } = modalAdjuntos;
    if (!factorKey) return;

    const nuevoAdjunto = {
      id: 'adj-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      tipo: 'enlace',
      nombre: tituloEnlaceInput.trim() || urlFinal.replace(/^https?:\/\/(www\.)?/, '').slice(0, 35),
      url: urlFinal,
      tamano: 'Enlace web',
      fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    setDatosPestel(prev => {
      const prevAdjuntos = prev?.adjuntosPorFactor || {};
      const listaActual = prevAdjuntos[factorKey] || [];
      return {
        ...prev,
        adjuntosPorFactor: {
          ...prevAdjuntos,
          [factorKey]: [...listaActual, nuevoAdjunto]
        }
      };
    });

    alerta.exito('Enlace Adjuntado', `Se ha vinculado la fuente externa al factor.`);
    setUrlEnlaceInput('');
    setTituloEnlaceInput('');
  };

  const eliminarAdjunto = (factorKey, adjuntoId) => {
    setDatosPestel(prev => {
      const prevAdjuntos = prev?.adjuntosPorFactor || {};
      const listaActual = prevAdjuntos[factorKey] || [];
      return {
        ...prev,
        adjuntosPorFactor: {
          ...prevAdjuntos,
          [factorKey]: listaActual.filter(a => a.id !== adjuntoId)
        }
      };
    });
    alerta.info('Evidencia Eliminada', 'Se ha retirado el respaldo documental.');
  };

  return (
    <div className="pestel-spacious-container">
      {/* ÁREA PRINCIPAL: SECUENCIA DE 6 DIMENSIONES PESTEL */}
      <div className="pestel-workspace-main">
        {/* BARRA SUPERIOR: mismo encabezado que el resto de herramientas */}
        <EncabezadoHerramienta icono={Globe} titulo="Análisis PESTEL · Macroentorno" exportando={exportandoPDF} onExportar={onExportarPDF}/>

        <div className="pestel-dimensions-vertical">
          {DIMENSIONES_PESTEL.map((dim) => {
            const dimData = estadoDimensiones[dim.id] || {
              tipo: 'Oportunidad',
              nivel: 'Medio',
              descripcion: '',
              criteriosActivos: {},
              factoresManuales: []
            };

            const criteriosAbiertos = Boolean(criteriosExpandidos[dim.id]);
            const totalCriteriosActivos = Object.values(dimData.criteriosActivos || {}).filter(Boolean).length;
            const manualesList = dimData.factoresManuales || [];

            const IconoDim = dim.icono || Globe;

            return (
              <div
                key={dim.id}
                className="pestel-node-card pestel-vertical-card"
              >
                {/* PILAR IZQUIERDO: LETRA GIGANTE Y LLAMATIVA DE LA PALABRA PESTEL */}
                <div className="pestel-letter-pillar">
                  <span className="pestel-giant-letter">{dim.letra}</span>
                  <div className="pestel-pillar-icon-box">
                    <IconoDim size={15} />
                  </div>
                  <span className="pestel-pillar-name">{dim.tituloCorto}</span>
                </div>

                {/* CUERPO PRINCIPAL DEL NODO */}
                <div className="pestel-card-content">
                  {/* CABECERA: TÍTULO */}
                  <div className="pestel-node-header">
                    <div className="pestel-node-title-group">
                      <h4 className="pestel-node-title">{dim.nombre}</h4>
                    </div>
                  </div>

                  {/* GUÍA DE USO METODOLÓGICA PESTEL */}
                  <div className="pestel-statement-box">
                    <p className="pestel-statement-desc">
                      {dim.guiaUso || dim.descripcion}
                    </p>
                  </div>

                  {/* ACORDEÓN DE CRITERIOS DIAGNÓSTICOS */}
                  <div className="pestel-criterios-wrapper">
                    <div
                      className="pestel-criterios-toggle-btn"
                      onClick={() => setCriteriosExpandidos(p => ({ ...p, [dim.id]: !p[dim.id] }))}
                    >
                      <span className="pestel-criterios-toggle-label">
                        Criterios de Evaluación ({totalCriteriosActivos} de {dim.criterios.length})
                      </span>
                      {criteriosAbiertos ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </div>

                    {criteriosAbiertos && (
                      <div className="pestel-criterios-list">
                        {dim.criterios.map((crit) => {
                          const activo = Boolean(dimData.criteriosActivos?.[crit.id]);
                          return (
                            <label key={crit.id} className="pestel-criterio-row">
                              <input
                                type="checkbox"
                                checked={activo}
                                onChange={() => toggleCriterio(dim.id, crit.id)}
                              />
                              <div className="pestel-criterio-content">
                                <strong>{crit.label}:</strong> <span>{crit.descripcion}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ZONA DE FACTORES REGISTRADOS (DISEÑO TIPO TARJETA PREMIUM) */}
                  <div className="pestel-evidencias-section">
                    <div className="pestel-section-label-row">
                      <span className="pestel-section-label">
                        Factores Registrados ({manualesList.length})
                      </span>
                      <button
                        type="button"
                        className="pestel-btn-add-factor-pill"
                        onClick={() => abrirModalNuevoFactor(dim.id)}
                        title={`Adicionar nuevo factor en ${dim.nombre}`}
                      >
                        <Plus size={13} />
                        <span>Añadir Factor</span>
                      </button>
                    </div>

                    <div className="pestel-evidencias-chips-list">
                      {manualesList.map((txt, idx) => {
                        const isObj = typeof txt === 'object' && txt !== null;
                        const factorTexto = isObj ? txt.texto : txt;
                        const factorTipo = isObj && txt.tipo ? txt.tipo : (dimData.tipo || 'Oportunidad');
                        const factorSubdimension = isObj && txt.subdimension ? txt.subdimension : '';
                        const factorKey = isObj && txt.id ? txt.id : `${dim.id}-m-${idx}-${encodeURIComponent(String(factorTexto).slice(0, 20))}`;
                        const adjuntosFactor = (datosPestel?.adjuntosPorFactor || {})[factorKey] || [];
                        const numAdjuntos = adjuntosFactor.length;
                        const esOp = factorTipo === 'Oportunidad';

                        return (
                          <div
                            key={factorKey || idx}
                            className={`pestel-factor-card ${esOp ? 'tipo-op' : 'tipo-am'}`}
                          >
                            <div className="pestel-factor-card-header">
                              <div className="pestel-factor-card-tags">
                                {/* BADGE TIPO (OPORTUNIDAD / AMENAZA) - INFORMATIVO (NO BOTÓN) */}
                                <span
                                  className={`pestel-factor-tipo-pill ${esOp ? 'pill-op' : 'pill-am'}`}
                                >
                                  <span className={`pestel-tipo-dot ${esOp ? 'op' : 'am'}`} />
                                  {esOp ? 'Oportunidad' : 'Amenaza'}
                                </span>

                                {/* BADGE SUBDIMENSIÓN */}
                                {factorSubdimension && (
                                  <span className="pestel-factor-subdim-pill" title={`Subdimensión: ${factorSubdimension}`}>
                                    {factorSubdimension}
                                  </span>
                                )}
                              </div>

                              {/* ACCIONES: EDITAR (AMARILLO), ADJUNTOS, ELIMINAR */}
                              <div className="pestel-factor-card-actions">
                                <button
                                  type="button"
                                  className="pestel-btn-card-action edit"
                                  onClick={() => abrirModalEditarFactor(dim.id, idx, txt)}
                                  title="Editar factor (modificar tipo, subdimensión o texto)"
                                >
                                  <Pencil size={12} />
                                </button>

                                <button
                                  type="button"
                                  className={`pestel-btn-card-action attach ${numAdjuntos > 0 ? 'has-attachments' : ''}`}
                                  onClick={(e) => { e.stopPropagation(); abrirModalAdjuntos(factorKey, factorTexto, dim.nombre); }}
                                  title={numAdjuntos > 0 ? `${numAdjuntos} evidencias documentales adjuntas` : "Adjuntar evidencia documental (.pdf, imágenes, hojas de cálculo, enlace web)"}
                                >
                                  <Paperclip size={12} />
                                  {numAdjuntos > 0 && <span className="pestel-attach-count">{numAdjuntos}</span>}
                                </button>

                                <button
                                  type="button"
                                  className="pestel-btn-card-action delete"
                                  onClick={(e) => { e.stopPropagation(); eliminarFactorManual(dim.id, idx); }}
                                  title="Eliminar factor"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>

                            <div className="pestel-factor-card-body">
                              <p className="pestel-factor-card-text">{factorTexto}</p>
                            </div>
                          </div>
                        );
                      })}

                      {manualesList.length === 0 && (
                        <div className="pestel-empty-dropzone">
                          <div className="pestel-empty-left">
                            <IconoDim size={15} style={{ opacity: 0.65 }} />
                            <span>No hay factores registrados aún en esta dimensión.</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER LIMPIO DE NAVEGACIÓN */}
      <RespaldoHerramienta id="pestel"/>
      <PieNavegacion onAnterior={onIrAArbol} onSiguiente={onContinuarAPorter}/>

      {/* ============================================================== */}
      {/* MODAL PARA ADICIONAR / EDITAR FACTOR EN PESTEL                 */}
      {/* ============================================================== */}
      {modalFactor.abierto && (() => {
        const dimActual = DIMENSIONES_PESTEL.find(d => d.id === modalFactor.dimId);
        const esEdicion = modalFactor.modo === 'editar';

        return (
          <div className="pestel-modal-overlay" onClick={cerrarModalFactor}>
            <div className="pestel-modal-container pestel-modal-add-factor" onClick={(e) => e.stopPropagation()}>
              {/* CABECERA DEL MODAL */}
              <div className="pestel-modal-header">
                <div className="pestel-modal-header-info">
                  <div className="pestel-modal-pretitle">
                    <span className="pestel-chip-letter-badge">{dimActual?.letra}</span>
                    <span>
                      {esEdicion ? 'Edición de Factor Estratégico' : 'Nuevo Factor Estratégico'} • {dimActual?.nombre}
                    </span>
                  </div>
                  <h3 className="pestel-modal-title">
                    {esEdicion ? `Editar Factor en ${dimActual?.tituloCorto}` : `Adicionar Factor en ${dimActual?.tituloCorto}`}
                  </h3>
                </div>
                <button
                  type="button"
                  className="pestel-modal-btn-close"
                  onClick={cerrarModalFactor}
                  title="Cerrar modal"
                >
                  <X size={15} />
                </button>
              </div>

              {/* FORMULARIO DEL MODAL */}
              <form onSubmit={guardarFactorDesdeModal} className="pestel-modal-factor-form">
                <div className="pestel-modal-body">
                  {/* 1. SELECCIÓN DE TIPO: OPORTUNIDAD O AMENAZA (SIN MARCOS NI HOVERS AZULES) */}
                  <div className="pestel-modal-input-group">
                    <label className="pestel-modal-label">
                      <span>Tipo de Factor:</span>
                      <span className="pestel-modal-label-hint">Selecciona la naturaleza del impacto externo</span>
                    </label>
                    <div className="pestel-modal-tipo-grid">
                      <div
                        role="button"
                        tabIndex={0}
                        className={`pestel-modal-tipo-card op ${modalFactor.tipo === 'Oportunidad' ? 'active' : ''}`}
                        onClick={() => setModalFactor(p => ({ ...p, tipo: 'Oportunidad' }))}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setModalFactor(p => ({ ...p, tipo: 'Oportunidad' })); } }}
                      >
                        <div className="pestel-modal-tipo-radio op">
                          {modalFactor.tipo === 'Oportunidad' && <div className="pestel-modal-radio-inner op" />}
                        </div>
                        <div className="pestel-modal-tipo-text-group">
                          <strong className="pestel-modal-tipo-title op">Oportunidad</strong>
                          <span className="pestel-modal-tipo-desc">Tendencia favorable o ventaja externa aprovechable</span>
                        </div>
                      </div>

                      <div
                        role="button"
                        tabIndex={0}
                        className={`pestel-modal-tipo-card am ${modalFactor.tipo === 'Amenaza' ? 'active' : ''}`}
                        onClick={() => setModalFactor(p => ({ ...p, tipo: 'Amenaza' }))}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setModalFactor(p => ({ ...p, tipo: 'Amenaza' })); } }}
                      >
                        <div className="pestel-modal-tipo-radio am">
                          {modalFactor.tipo === 'Amenaza' && <div className="pestel-modal-radio-inner am" />}
                        </div>
                        <div className="pestel-modal-tipo-text-group">
                          <strong className="pestel-modal-tipo-title am">Amenaza</strong>
                          <span className="pestel-modal-tipo-desc">Riesgo externo, restricción o desafío sectorial</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. SUBDIMENSIÓN (SIN EMOJI ✏️) */}
                  <div className="pestel-modal-input-group">
                    <label className="pestel-modal-label" htmlFor="pestel-subdim-select-input">
                      <span>Subdimensión o Variable Clave:</span>
                      <span className="pestel-modal-label-hint">Categoría analítica del macroentorno</span>
                    </label>
                    <select
                      id="pestel-subdim-select-input"
                      value={modalFactor.modoCustom ? '__custom__' : modalFactor.subdimension}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setModalFactor(p => ({ ...p, modoCustom: true }));
                        } else {
                          setModalFactor(p => ({ ...p, modoCustom: false, subdimension: e.target.value }));
                        }
                      }}
                      className="pestel-modal-select"
                    >
                      <option value="" disabled>-- Selecciona una subdimensión común --</option>
                      {(dimActual?.subdimensionesComunes || []).map((sub, sIdx) => (
                        <option key={sIdx} value={sub}>{sub}</option>
                      ))}
                      <option value="__custom__">Otra subdimensión (personalizada)...</option>
                    </select>

                    {modalFactor.modoCustom && (
                      <div className="pestel-modal-custom-subdim-wrap">
                        <input
                          type="text"
                          placeholder="Ingresa el nombre de la nueva subdimensión..."
                          value={modalFactor.subdimensionCustom || ''}
                          onChange={(e) => setModalFactor(p => ({ ...p, subdimensionCustom: e.target.value }))}
                          className="pestel-modal-input"
                          autoFocus
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* 3. DESCRIPCIÓN DEL FACTOR */}
                  <div className="pestel-modal-input-group">
                    <label className="pestel-modal-label" htmlFor="pestel-desc-factor-input">
                      <span>Descripción o Hallazgo Estratégico:</span>
                      <span className="pestel-modal-label-hint">
                        {(modalFactor.texto || '').length}/350 caracteres
                      </span>
                    </label>
                    <textarea
                      id="pestel-desc-factor-input"
                      rows={3}
                      placeholder={`Describe el factor en ${dimActual?.tituloCorto}...`}
                      value={modalFactor.texto || ''}
                      onChange={(e) => setModalFactor(p => ({ ...p, texto: e.target.value }))}
                      maxLength={350}
                      className="pestel-modal-textarea"
                      required
                      autoFocus={!modalFactor.modoCustom}
                    />
                  </div>
                </div>

                {/* PIE DEL MODAL */}
                <div className="pestel-modal-footer">
                  <span className="pestel-modal-footer-hint">
                    {esEdicion
                      ? 'Los cambios se actualizarán en PESTEL y se sincronizarán con POAM.'
                      : `El factor se registrará en ${dimActual?.nombre}`}
                  </span>
                  <div className="pestel-modal-actions-group">
                    <button
                      type="button"
                      className="pestel-modal-btn-cancel"
                      onClick={cerrarModalFactor}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="pestel-modal-btn-save"
                    >
                      {esEdicion ? <Check size={14} /> : <Plus size={14} />}
                      <span>{esEdicion ? 'Guardar Cambios' : 'Añadir Factor'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ============================================================== */}
      {/* MODAL DE EVIDENCIA DOCUMENTAL POR FACTOR (.pdf, imágenes, excel, url) */}
      {/* ============================================================== */}
      {modalAdjuntos.abierto && (
        <div className="pestel-modal-overlay" onClick={cerrarModalAdjuntos}>
          <div className="pestel-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* CABECERA DEL MODAL */}
            <div className="pestel-modal-header">
              <div className="pestel-modal-header-info">
                <div className="pestel-modal-pretitle">
                  <Paperclip size={13} className="pestel-modal-icon-badge" />
                  <span>Respaldo Documental • {modalAdjuntos.dimensionNombre}</span>
                </div>
                <h3 className="pestel-modal-title">Evidencias y Fuentes del Factor</h3>
                <p className="pestel-modal-factor-quote">
                  "{modalAdjuntos.factorTexto}"
                </p>
              </div>
              <button
                type="button"
                className="pestel-modal-btn-close"
                onClick={cerrarModalAdjuntos}
                title="Cerrar modal"
              >
                <X size={15} />
              </button>
            </div>

            <div className="pestel-modal-body">
              {/* SELECTOR DE TIPO DE EVIDENCIA SOLICITADO */}
              <div className="pestel-modal-type-tabs">
                <button
                  type="button"
                  className={`pestel-modal-tab-btn ${tabTipoAdjunto === 'pdf' ? 'active pdf' : ''}`}
                  onClick={() => { setTabTipoAdjunto('pdf'); setArchivoSeleccionado(null); }}
                >
                  <FileText size={14} />
                  <span>Documentos (.pdf)</span>
                </button>
                <button
                  type="button"
                  className={`pestel-modal-tab-btn ${tabTipoAdjunto === 'imagen' ? 'active img' : ''}`}
                  onClick={() => { setTabTipoAdjunto('imagen'); setArchivoSeleccionado(null); }}
                >
                  <Image size={14} />
                  <span>Imágenes</span>
                </button>
                <button
                  type="button"
                  className={`pestel-modal-tab-btn ${tabTipoAdjunto === 'hoja_calculo' ? 'active sheet' : ''}`}
                  onClick={() => { setTabTipoAdjunto('hoja_calculo'); setArchivoSeleccionado(null); }}
                >
                  <FileSpreadsheet size={14} />
                  <span>Hojas de cálculo</span>
                </button>
                <button
                  type="button"
                  className={`pestel-modal-tab-btn ${tabTipoAdjunto === 'enlace' ? 'active link' : ''}`}
                  onClick={() => { setTabTipoAdjunto('enlace'); setArchivoSeleccionado(null); }}
                >
                  <Link2 size={14} />
                  <span>Enlace web / URL externa</span>
                </button>
              </div>

              {/* ÁREA DE CARGA O INGRESO */}
              <div className="pestel-modal-upload-panel">
                {tabTipoAdjunto === 'enlace' ? (
                  <form onSubmit={guardarAdjuntoEnlace} className="pestel-modal-link-form">
                    <div className="pestel-modal-field">
                      <label>Enlace web / URL externa (ej: https://ine.gob.bo/informe):</label>
                      <div className="pestel-input-icon-wrap">
                        <Link2 size={14} className="input-icon" />
                        <input
                          type="url"
                          placeholder="https://ejemplo.com/estudio-o-noticia"
                          value={urlEnlaceInput}
                          onChange={(e) => setUrlEnlaceInput(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="pestel-modal-field">
                      <label>Título o Fuente informativa (opcional):</label>
                      <input
                        type="text"
                        placeholder="Ej: Informe Anual de Comercio Exterior, Diario Oficial"
                        value={tituloEnlaceInput}
                        onChange={(e) => setTituloEnlaceInput(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="pestel-modal-btn-submit">
                      <Plus size={13} />
                      <span>Vincular Enlace Web</span>
                    </button>
                  </form>
                ) : (
                  <div className="pestel-modal-file-upload-block">
                    <label className="pestel-modal-dropzone">
                      <input
                        type="file"
                        className="pestel-hidden-file-input"
                        accept={
                          tabTipoAdjunto === 'pdf'
                            ? '.pdf,application/pdf'
                            : tabTipoAdjunto === 'imagen'
                            ? 'image/*'
                            : '.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv'
                        }
                        onChange={(e) => handleFileChange(e, tabTipoAdjunto)}
                      />
                      <div className="pestel-dropzone-content">
                        <UploadCloud size={22} className="pestel-upload-icon" />
                        <span className="pestel-dropzone-title">
                          {tabTipoAdjunto === 'pdf' && 'Seleccionar o arrastrar Documento PDF (.pdf)'}
                          {tabTipoAdjunto === 'imagen' && 'Seleccionar o arrastrar Imagen (.png, .jpg, .webp)'}
                          {tabTipoAdjunto === 'hoja_calculo' && 'Seleccionar o arrastrar Planilla (.xlsx, .xls, .csv)'}
                        </span>
                        <span className="pestel-dropzone-sub">
                          Haz clic para examinar archivos locales en tu equipo
                        </span>
                      </div>
                    </label>

                    {archivoSeleccionado && (
                      <div className="pestel-selected-file-preview">
                        <div className="pestel-selected-file-info">
                          {tabTipoAdjunto === 'imagen' && archivoSeleccionado.previewUrl ? (
                            <img src={archivoSeleccionado.previewUrl} alt="Vista previa" className="pestel-img-thumb-preview" />
                          ) : (
                            <div className={`pestel-file-icon-box ${tabTipoAdjunto}`}>
                              {tabTipoAdjunto === 'pdf' && <FileText size={18} />}
                              {tabTipoAdjunto === 'hoja_calculo' && <FileSpreadsheet size={18} />}
                              {tabTipoAdjunto === 'imagen' && <Image size={18} />}
                            </div>
                          )}
                          <div className="pestel-file-meta-texts">
                            <input
                              type="text"
                              value={nombreArchivoInput}
                              onChange={(e) => setNombreArchivoInput(e.target.value)}
                              placeholder="Nombre visible de la evidencia"
                              className="pestel-rename-input"
                              title="Puedes editar el nombre antes de guardar"
                            />
                            <span className="pestel-file-raw-meta">
                              {archivoSeleccionado.nombre} • {archivoSeleccionado.tamano}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="pestel-modal-btn-submit"
                          onClick={guardarAdjuntoArchivo}
                        >
                          <Plus size={13} />
                          <span>Adjuntar Archivo</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* LISTA DE EVIDENCIAS YA ASIGNADAS A ESTE FACTOR */}
              <div className="pestel-modal-attached-section">
                <div className="pestel-modal-attached-header">
                  <span className="pestel-attached-title">
                    Evidencias Registradas ({(modalAdjuntos.factorKey ? (datosPestel?.adjuntosPorFactor || {})[modalAdjuntos.factorKey] || [] : []).length})
                  </span>
                  <span className="pestel-attached-help">
                    Respaldo empírico del factor para análisis y auditoría estratégica
                  </span>
                </div>

                {(modalAdjuntos.factorKey ? (datosPestel?.adjuntosPorFactor || {})[modalAdjuntos.factorKey] || [] : []).length === 0 ? (
                  <div className="pestel-modal-empty-attached">
                    <Paperclip size={18} style={{ opacity: 0.35 }} />
                    <p>No hay evidencia documental registrada para este factor todavía.</p>
                    <span>Selecciona una pestaña arriba para subir PDFs, imágenes, planillas Excel/CSV o enlaces web externos.</span>
                  </div>
                ) : (
                  <div className="pestel-attached-cards-grid">
                    {(modalAdjuntos.factorKey ? (datosPestel?.adjuntosPorFactor || {})[modalAdjuntos.factorKey] || [] : []).map((adj) => (
                      <div key={adj.id} className={`pestel-attached-card ${adj.tipo}`}>
                        <div className="pestel-attached-card-left">
                          <div className={`pestel-attached-icon-wrap ${adj.tipo}`}>
                            {adj.tipo === 'pdf' && <FileText size={15} />}
                            {adj.tipo === 'imagen' && <Image size={15} />}
                            {adj.tipo === 'hoja_calculo' && <FileSpreadsheet size={15} />}
                            {adj.tipo === 'enlace' && <Link2 size={15} />}
                          </div>
                          <div className="pestel-attached-card-info">
                            <span className="pestel-attached-card-name" title={adj.nombre}>
                              {adj.nombre}
                            </span>
                            <div className="pestel-attached-card-sub">
                              <span className={`pestel-attached-type-tag ${adj.tipo}`}>
                                {adj.tipo === 'pdf' ? 'PDF' : adj.tipo === 'imagen' ? 'IMAGEN' : adj.tipo === 'hoja_calculo' ? 'PLANILLA' : 'ENLACE'}
                              </span>
                              <span className="pestel-attached-date">{adj.tamano} • {adj.fecha}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pestel-attached-card-actions">
                          {adj.url && (
                            <a
                              href={adj.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="pestel-btn-doc-action view"
                              title="Abrir / Ver archivo o enlace"
                            >
                              <ExternalLink size={12} />
                              <span>Abrir</span>
                            </a>
                          )}
                          <button
                            type="button"
                            className="pestel-btn-doc-action delete"
                            onClick={() => eliminarAdjunto(modalAdjuntos.factorKey, adj.id)}
                            title="Eliminar esta evidencia documental"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pestel-modal-footer">
              <span className="pestel-modal-footer-hint">
                Las evidencias respaldan la validez de los factores macroambientales ante la toma de decisiones.
              </span>
              <button
                type="button"
                className="pestel-modal-btn-done"
                onClick={cerrarModalAdjuntos}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
