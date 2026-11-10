import { useState, useMemo, useEffect } from 'react';
import RespaldoHerramienta from '../../compartido/documentos/RespaldoHerramienta';
import PieNavegacion from '../../simulacion/PieNavegacion';
import { EncabezadoHerramienta } from '../../compartido/ComponentesHerramienta';
import {
  Compass,
  Layers,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Award,
  Plus,
  Trash2,
  X,
  Sliders,
  RotateCcw,
  Building2,
  Pencil,
  Paperclip,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Link2,
  UploadCloud,
  ExternalLink
} from 'lucide-react';
import { alerta } from '../../../../utils/Notificaciones';
import {
  ESCALA_RATING,
  COMPETIDORES_INICIALES,
  calcularSumaPesos,
  esSumaPesosValida,
  equilibrarPesosEquitativamente,
  calcularPuntajePonderado,
  calcularTotalesCompetidores,
  calcularRankingCompetidores,
  validarTransicionFase6
} from './calculosMpc';
import './MatrizPerfilCompetitivo.css';


export default function MatrizPerfilCompetitivo({
  casoActivo,
  datosMpc,
  setDatosMpc,
  onContinuarAPoam,
  onVolverAPorter,
  onNavegarFase,
  onExportarPDF,
  exportandoPDF = false
}) {
  // =========================================================================
  // 1. ESTADOS LOCALES PRINCIPALES
  // =========================================================================

  // Inicializar competidores respetando el nombre del caso de estudio
  const competidoresIniciales = useMemo(() => {
    if (datosMpc?.competidores && datosMpc.competidores.length >= 1) {
      return datosMpc.competidores;
    }
    const nombreEmpresaActiva = casoActivo?.nombreEmpresa || casoActivo?.titulo || 'Nuestra Empresa';
    return COMPETIDORES_INICIALES.map(c =>
      c.esPropia ? { ...c, nombre: nombreEmpresaActiva } : { ...c, nombre: '' }
    );
  }, [casoActivo, datosMpc]);

  const [competidores, setCompetidores] = useState(competidoresIniciales);

  // Inicializar Factores Críticos de Éxito (FCE) - Vacío por defecto para trabajar desde cero
  const [factores, setFactores] = useState(() => {
    if (datosMpc?.factores && Array.isArray(datosMpc.factores) && datosMpc.factores.length > 0) {
      return datosMpc.factores;
    }
    return [];
  });

  // Inicializar matriz de calificaciones { [compId]: { [fceId]: rating } } - Vacío por defecto
  const [calificaciones, setCalificaciones] = useState(() => {
    if (datosMpc?.calificaciones && Object.keys(datosMpc.calificaciones).length > 0) {
      return datosMpc.calificaciones;
    }
    return {};
  });

  // Sincronizar si datosMpc se restablece externamente a null (ej: cambio de caso o reinicio)
  useEffect(() => {
    if (!datosMpc) {
      const nombreEmpresaActiva = casoActivo?.nombreEmpresa || casoActivo?.titulo || 'Nuestra Empresa';
      setCompetidores(
        COMPETIDORES_INICIALES.map(c =>
          c.esPropia ? { ...c, nombre: nombreEmpresaActiva } : { ...c, nombre: '' }
        )
      );
      setFactores([]);
      setCalificaciones({});
      setAdjuntosPorFactor({});
    }
  }, [datosMpc, casoActivo]);

  // Almacén de evidencias y fuentes por factor: { [factorId]: [ { id, tipo, nombre, url, tamano, fecha } ] }
  const [adjuntosPorFactor, setAdjuntosPorFactor] = useState(() => {
    const raw = datosMpc?.adjuntosPorFactor || {};
    const limpio = {};
    Object.entries(raw).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        const manuales = v.filter(adj => !adj.id?.startsWith('adj-porter-'));
        if (manuales.length > 0) {
          limpio[k] = manuales;
        }
      }
    });
    return limpio;
  });

  // Modal para subir / gestionar Evidencias y Fuentes del Factor
  const [modalAdjuntos, setModalAdjuntos] = useState({
    abierto: false,
    factor: null
  });
  const [tabTipoAdjunto, setTabTipoAdjunto] = useState('pdf');
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [nombreArchivoInput, setNombreArchivoInput] = useState('');
  const [urlEnlaceInput, setUrlEnlaceInput] = useState('');
  const [tituloEnlaceInput, setTituloEnlaceInput] = useState('');

  // Modales y vistas
  const [modalNuevoFceAbierto, setModalNuevoFceAbierto] = useState(false);

  // Formulario nuevo FCE
  const [nuevoFceNombre, setNuevoFceNombre] = useState('');
  const [nuevoFceDesc, setNuevoFceDesc] = useState('');
  const [nuevoFcePeso, setNuevoFcePeso] = useState(0.10);
  const [nuevoFceFuente, setNuevoFceFuente] = useState('');

  // Estado para edición de factor existente
  const [factorEnEdicion, setFactorEnEdicion] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategoria, setEditCategoria] = useState('');
  const [editPeso, setEditPeso] = useState(0.10);
  const [editFuente, setEditFuente] = useState('');

  // =========================================================================
  // 2. CÁLCULOS METODOLÓGICOS Y EN TIEMPO REAL
  // =========================================================================

  const sumaPesos = useMemo(() => calcularSumaPesos(factores), [factores]);
  const sumaValida = useMemo(() => esSumaPesosValida(factores), [factores]);

  // Totales por competidor
  const totalesCompetidores = useMemo(() => {
    return calcularTotalesCompetidores(factores, competidores, calificaciones);
  }, [factores, competidores, calificaciones]);

  // Ranking ordenado
  const ranking = useMemo(() => {
    return calcularRankingCompetidores(totalesCompetidores);
  }, [totalesCompetidores]);

  // Validación estricta para continuar a Fase 6 (POAM)
  const validacionFase6 = useMemo(() => {
    return validarTransicionFase6(factores, competidores, calificaciones);
  }, [factores, competidores, calificaciones]);

  // Sincronizar estado global al componente padre cuando cambie
  useEffect(() => {
    if (setDatosMpc) {
      setDatosMpc({
        factores,
        competidores,
        calificaciones,
        totalesCompetidores,
        ranking,
        sumaPesos,
        adjuntosPorFactor,
        esValido: validacionFase6.esValido
      });
    }
  }, [factores, competidores, calificaciones, totalesCompetidores, ranking, sumaPesos, adjuntosPorFactor, validacionFase6, setDatosMpc]);

  // =========================================================================
  // 3. HANDLERS DE INTERACCIÓN
  // =========================================================================

  // Modificar peso de un factor
  const handleCambioPeso = (factorId, nuevoValor) => {
    const valFloat = parseFloat(nuevoValor);
    const pesoLimpio = isNaN(valFloat) ? 0 : Math.max(0, Math.min(1.0, valFloat));

    setFactores(prev =>
      prev.map(f => (f.id === factorId ? { ...f, peso: Math.round(pesoLimpio * 100) / 100 } : f))
    );
  };

  // Asignar calificación (1-4)
  const handleCalificar = (competidorId, factorId, rating) => {
    setCalificaciones(prev => ({
      ...prev,
      [competidorId]: {
        ...(prev[competidorId] || {}),
        [factorId]: rating
      }
    }));
  };

  // Equilibrar pesos equitativamente
  const handleEquilibrarPesos = () => {
    if (factores.length === 0) {
      alerta.advertencia('Sin Factores', 'Agrega al menos un Factor Crítico antes de equilibrar pesos.');
      return;
    }
    const factoresEquilibrados = equilibrarPesosEquitativamente(factores);
    setFactores(factoresEquilibrados);
    alerta.exito(
      'Pesos Equilibrados',
      `Se distribuyó el 1.00 (100%) uniformemente entre los ${factores.length} Factores Críticos.`
    );
  };

  // Añadir competidor nuevo (sin límite de rivales)
  const handleAgregarCompetidor = () => {
    const nuevoId = `comp_${Date.now()}`;
    const coloresDisponibles = ['#818CF8', '#A855F7', '#EC4899', '#06B6D4', '#10B981', '#F59E0B', '#3B82F6', '#6366F1'];
    const rivalesExistentes = competidores.filter(c => !c.esPropia).length;
    const colorSeleccionado = coloresDisponibles[rivalesExistentes % coloresDisponibles.length];

    const nuevoCompetidor = {
      id: nuevoId,
      nombre: '',
      subtitulo: `Rival ${rivalesExistentes + 1}`,
      esPropia: false,
      colorAcento: colorSeleccionado,
      badge: `RIVAL ${rivalesExistentes + 1}`
    };

    setCompetidores(prev => [...prev, nuevoCompetidor]);
    alerta.exito('Competidor Añadido', `Se agregó RIVAL ${rivalesExistentes + 1}. Escribe su nombre en el encabezado.`);
  };

  // Eliminar competidor
  const handleEliminarCompetidor = (competidorId) => {
    const compAEliminar = competidores.find(c => c.id === competidorId);
    if (compAEliminar?.esPropia) {
      alerta.error('Acción Bloqueada', 'No puedes eliminar a Nuestra Empresa de la evaluación.');
      return;
    }

    setCompetidores(prev => prev.filter(c => c.id !== competidorId));
    setCalificaciones(prev => {
      const copia = { ...prev };
      delete copia[competidorId];
      return copia;
    });
    alerta.info('Competidor Removido', `Se removió "${compAEliminar?.nombre || compAEliminar?.badge || 'el competidor'}".`);
  };

  // Modificar nombre de un competidor
  const handleCambioNombreCompetidor = (competidorId, nuevoNombre) => {
    setCompetidores(prev =>
      prev.map(c => (c.id === competidorId ? { ...c, nombre: nuevoNombre } : c))
    );
  };

  // =========================================================================
  // GESTIÓN DE EVIDENCIAS Y FUENTES DOCUMENTALES POR FACTOR (MPC)
  // =========================================================================
  const abrirModalAdjuntos = (factor) => {
    setModalAdjuntos({
      abierto: true,
      factor
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
      factor: null
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

    const factor = modalAdjuntos.factor;
    if (!factor) return;

    const nuevoAdjunto = {
      id: 'adj-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      tipo: archivoSeleccionado.tipo,
      nombre: (nombreArchivoInput.trim() || archivoSeleccionado.nombre),
      archivoNombreOriginal: archivoSeleccionado.nombre,
      url: archivoSeleccionado.previewUrl || URL.createObjectURL(archivoSeleccionado.file),
      tamano: archivoSeleccionado.tamano,
      fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    setAdjuntosPorFactor(prev => {
      const listaActual = prev[factor.id] || [];
      return {
        ...prev,
        [factor.id]: [...listaActual, nuevoAdjunto]
      };
    });

    alerta.exito('Evidencia Adjuntada', `Se respaldó con éxito "${nuevoAdjunto.nombre}".`);
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

    const factor = modalAdjuntos.factor;
    if (!factor) return;

    const nuevoAdjunto = {
      id: 'adj-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      tipo: 'enlace',
      nombre: tituloEnlaceInput.trim() || urlFinal.replace(/^https?:\/\/(www\.)?/, '').slice(0, 35),
      url: urlFinal,
      tamano: 'Enlace web',
      fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    setAdjuntosPorFactor(prev => {
      const listaActual = prev[factor.id] || [];
      return {
        ...prev,
        [factor.id]: [...listaActual, nuevoAdjunto]
      };
    });

    alerta.exito('Fuente Vinculada', `Se vinculó la fuente externa "${nuevoAdjunto.nombre}".`);
    setUrlEnlaceInput('');
    setTituloEnlaceInput('');
  };

  const eliminarAdjunto = (factorId, adjuntoId) => {
    setAdjuntosPorFactor(prev => {
      const listaActual = prev[factorId] || [];
      return {
        ...prev,
        [factorId]: listaActual.filter(a => a.id !== adjuntoId)
      };
    });
    alerta.info('Evidencia Eliminada', 'Se ha retirado el respaldo documental.');
  };

  // Agregar FCE Manual
  const handleCrearFceManual = (e) => {
    e.preventDefault();
    if (!nuevoFceNombre.trim()) {
      alerta.advertencia('Nombre Obligatorio', 'Ingresa una denominación para el Factor Crítico.');
      return;
    }
    if (factores.length >= 8) {
      alerta.advertencia('Límite de Factores', 'La MPC permite un rango de 5 a 8 Factores Críticos de Éxito. Has alcanzado el límite máximo (8 FCE).');
      return;
    }

    const nuevoFce = {
      id: `fce-manual-${Date.now()}`,
      codigo: `FCE-M${factores.length + 1}`,
      nombre: nuevoFceNombre.trim(),
      descripcion: nuevoFceDesc.trim() || 'Factor crítico establecido manualmente por el equipo consultor.',
      categoria: 'Estratégico General',
      peso: Math.round(nuevoFcePeso * 100) / 100,
      origen: 'Agregado Manualmente',
      origenPorter: false,
      fuente: nuevoFceFuente.trim()
    };

    if (nuevoFceFuente.trim()) {
      const esUrl = /^https?:\/\//i.test(nuevoFceFuente.trim());
      const nuevoAdjunto = {
        id: 'adj-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        tipo: 'enlace',
        nombre: nuevoFceFuente.trim(),
        url: esUrl ? nuevoFceFuente.trim() : '#',
        tamano: 'Fuente informativa',
        fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      };
      setAdjuntosPorFactor(prev => ({
        ...prev,
        [nuevoFce.id]: [nuevoAdjunto]
      }));
    }

    setFactores(prev => [...prev, nuevoFce]);
    setNuevoFceNombre('');
    setNuevoFceDesc('');
    setNuevoFceFuente('');
    setModalNuevoFceAbierto(false);
    alerta.exito('Factor Creado', `Se añadió el FCE "${nuevoFce.nombre}".`);
  };

  // Eliminar FCE
  const handleEliminarFactor = (factorId) => {
    const fEliminado = factores.find(f => f.id === factorId);
    setFactores(prev => prev.filter(f => f.id !== factorId));
    setAdjuntosPorFactor(prev => {
      const copia = { ...prev };
      delete copia[factorId];
      return copia;
    });
    setCalificaciones(prev => {
      const copia = { ...prev };
      Object.keys(copia).forEach(compId => {
        if (copia[compId]?.[factorId]) {
          const factorCopy = { ...copia[compId] };
          delete factorCopy[factorId];
          copia[compId] = factorCopy;
        }
      });
      return copia;
    });
    alerta.info('Factor Eliminado', `Se removió "${fEliminado?.nombre || 'el factor'}". Recuerda ajustar los pesos.`);
  };

  // Iniciar edición de un factor existente
  const handleIniciarEdicionFactor = (factor) => {
    setFactorEnEdicion(factor);
    setEditNombre(factor.nombre);
    setEditDesc(factor.descripcion || '');
    setEditCategoria(factor.categoria || 'Estratégico General');
    setEditPeso(factor.peso);
    setEditFuente(factor.fuente || '');
  };

  // Guardar cambios del factor editado
  const handleGuardarEdicionFactor = (e) => {
    e.preventDefault();
    if (!editNombre.trim()) {
      alerta.advertencia('Nombre Obligatorio', 'Ingresa una denominación para el Factor Crítico.');
      return;
    }
    const pesoLimpio = Math.max(0.01, Math.min(1.0, parseFloat(editPeso) || 0.05));

    setFactores(prev => prev.map(f => {
      if (f.id === factorEnEdicion.id) {
        return {
          ...f,
          nombre: editNombre.trim(),
          descripcion: editDesc.trim(),
          categoria: editCategoria.trim() || f.categoria,
          peso: Math.round(pesoLimpio * 100) / 100,
          fuente: editFuente.trim()
        };
      }
      return f;
    }));
    setFactorEnEdicion(null);
    alerta.exito('Factor Actualizado', `Se guardaron los cambios del factor "${editNombre.trim()}".`);
  };


  // Vaciar / Limpiar matriz para reiniciar desde cero
  const handleLimpiarMatriz = () => {
    setFactores([]);
    setCalificaciones({});
    setAdjuntosPorFactor({});
    const nombreEmpresaActiva = casoActivo?.nombreEmpresa || casoActivo?.titulo || 'Nuestra Empresa';
    setCompetidores(
      COMPETIDORES_INICIALES.map(c =>
        c.esPropia ? { ...c, nombre: nombreEmpresaActiva } : { ...c, nombre: '' }
      )
    );
    if (setDatosMpc) {
      setDatosMpc(null);
    }
    alerta.exito('Matriz Limpia', 'Se ha vaciado la Matriz de Perfil Competitivo para trabajar desde cero.');
  };

  // Avanzar a la siguiente fase (Fase 6: POAM)
  const handleAvanzarFase6 = () => {
    if (onContinuarAPoam) {
      onContinuarAPoam();
    } else if (onNavegarFase) {
      onNavegarFase(6);
    } else {
      alerta.exito('Fase 5 Completada', 'Listo para avanzar a la Matriz POAM (Fase 6).');
    }
  };




  // =========================================================================
  // 5. RENDERIZADO DEL COMPONENTE
  // =========================================================================
  return (
    <div className="mpc-container">
      <EncabezadoHerramienta icono={Compass} titulo="Matriz de Perfil Competitivo · Rivales y factores críticos" exportando={exportandoPDF} onExportar={onExportarPDF}/>

      {/* -------------------------------------------------------------------
          BARRA DE CONTROL DE PESOS Y GESTIÓN MPC (SÓLO SI HAY FACTORES)
         ------------------------------------------------------------------- */}
      {factores.length > 0 && (
        <div className="mpc-weight-control-card">
          <div className="mpc-weight-header">
            <div className="mpc-weight-title-group">
              <div className="mpc-weight-icon-badge">
                <Sliders size={18} color="#F97316" />
              </div>
              <div className="mpc-weight-info-text">
                <div className="mpc-weight-title-row">
                  <h4 className="mpc-weight-title">Ponderación de Factores Críticos (MPC)</h4>

                  {/* Badge de cantidad de factores (Rango requerido: 5 a 8 FCE) */}
                  <div className={`mpc-weight-badge ${factores.length >= 5 && factores.length <= 8 ? 'valido' : (factores.length < 5 ? 'invalido-falta' : 'invalido-sobra')}`}>
                    {factores.length >= 5 && factores.length <= 8 ? (
                      <>
                        <CheckCircle2 size={13} />
                        <span>{factores.length} FCE (Rango óptimo 5-8)</span>
                      </>
                    ) : factores.length < 5 ? (
                      <>
                        <AlertTriangle size={13} />
                        <span>{factores.length} / 5 FCE (Mínimo 5 requeridos, faltan {5 - factores.length})</span>
                      </>
                    ) : (
                      <>
                        <AlertOctagon size={13} />
                        <span>{factores.length} FCE (Exceso: máximo 8)</span>
                      </>
                    )}
                  </div>

                  {/* Badge de sumatoria de pesos */}
                  <div className={`mpc-weight-badge ${sumaValida ? 'valido' : (sumaPesos < 1.0 ? 'invalido-falta' : 'invalido-sobra')}`}>
                    {sumaValida ? (
                      <>
                        <CheckCircle2 size={13} />
                        <span>∑ Pesos = 1.00 (100% Consistente)</span>
                      </>
                    ) : sumaPesos < 1.0 ? (
                      <>
                        <AlertTriangle size={13} />
                        <span>∑ = {sumaPesos.toFixed(2)} (Faltan {(1.0 - sumaPesos).toFixed(2)})</span>
                      </>
                    ) : (
                      <>
                        <AlertOctagon size={13} />
                        <span>∑ = {sumaPesos.toFixed(2)} (Exceso de {(sumaPesos - 1.0).toFixed(2)})</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="mpc-weight-help-text">
                  {factores.length < 5
                    ? `Regla MPC: Se requiere un mínimo de 5 Factores Críticos de Éxito (actualmente tienes ${factores.length}) y una sumatoria de pesos de 1.00 para avanzar a POAM.`
                    : factores.length > 8
                    ? `Regla MPC: La matriz admite un máximo de 8 factores (tienes ${factores.length}). Elimina ${factores.length - 8} factor${factores.length - 8 > 1 ? 'es' : ''} para mantener el enfoque estratégico.`
                    : sumaValida
                    ? 'Ponderación completa y matemáticamente consistente para comparar las ventajas competitivas (5 a 8 FCE definidos).'
                    : 'Regla: La sumatoria de todos los pesos debe ser exactamente 1.00 para avanzar a POAM.'}
                </span>
              </div>
            </div>

            <div className="mpc-weight-quick-actions">

              <button
                type="button"
                className="mpc-btn-action-primary"
                onClick={() => {
                  if (factores.length >= 8) {
                    alerta.advertencia('Límite de Factores', 'Ya has alcanzado el límite máximo de 8 Factores Críticos de Éxito (rango permitido: 5 a 8 FCE).');
                    return;
                  }
                  setModalNuevoFceAbierto(true);
                }}
                title={factores.length >= 8 ? 'Límite máximo de 8 FCE alcanzado' : 'Añadir un Factor Crítico de Éxito personalizado'}
              >
                <Plus size={14} />
                <span>Nuevo FCE</span>
              </button>

              <button
                type="button"
                className="mpc-btn-secondary mpc-btn-rival"
                onClick={handleAgregarCompetidor}
                title="Añadir un competidor rival para evaluar en la matriz"
              >
                <Plus size={14} color="#818CF8" />
                <span>Añadir Rival</span>
              </button>

              <button
                type="button"
                className="mpc-btn-secondary"
                onClick={handleEquilibrarPesos}
                title="Distribuir 1.00 uniformemente entre todos los factores"
              >
                <RotateCcw size={13} />
                <span>Equilibrar Pesos</span>
              </button>

              <button
                type="button"
                className="mpc-btn-secondary mpc-btn-reset"
                onClick={handleLimpiarMatriz}
                title="Vaciar todos los factores y calificaciones para empezar desde cero"
              >
                <Trash2 size={13} color="#EF4444" />
                <span>Limpiar Matriz</span>
              </button>
            </div>
          </div>

          {/* Progress bar visual */}
          <div className="mpc-progress-track">
            <div
              className={`mpc-progress-bar ${sumaValida ? 'valido' : (sumaPesos < 1.0 ? 'invalido-falta' : 'invalido-sobra')}`}
              style={{ width: `${Math.min(100, Math.round(sumaPesos * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------
          TABLA INTERACTIVA MATRIZ DE PERFIL COMPETITIVO (MPC) O ESTADO VACÍO LIMPIO
         ------------------------------------------------------------------- */}
      {factores.length === 0 ? (
        <div className="mpc-empty-state-card">
          <div className="mpc-empty-state-box">
            <div className="mpc-empty-state-icon">
              <Layers size={36} color="#F97316" />
            </div>
            <h4 className="mpc-empty-state-title">Matriz de Perfil Competitivo Vacía</h4>
            <p className="mpc-empty-state-desc">
              La pantalla está lista para que trabajes desde cero. Agrega entre 5 y 8 Factores Críticos de Éxito (FCE) para la industria, asigna sus pesos relativos e introduce los nombres de tus rivales para calificarlos.
            </p>
            <div className="mpc-empty-state-actions">
              <button
                type="button"
                className="mpc-btn-primary"
                onClick={() => setModalNuevoFceAbierto(true)}
              >
                <Plus size={14} />
                <span>Agregar Factor Manual</span>
              </button>
              <button
                type="button"
                className="mpc-btn-secondary mpc-btn-rival"
                onClick={handleAgregarCompetidor}
                title="Añadir competidor rival para comparar frente a Nuestra Empresa"
              >
                <Plus size={14} color="#818CF8" />
                <span>Añadir Rival</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mpc-table-wrapper">
          <table className="mpc-table">
            <thead>
              {/* Primera fila de encabezados */}
              <tr>
                <th rowSpan={2} className="mpc-col-fce">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span>Factores Críticos de Éxito (FCE)</span>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.15rem 0.55rem',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        backgroundColor: factores.length >= 5 && factores.length <= 8 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.18)',
                        color: factores.length >= 5 && factores.length <= 8 ? '#10b981' : '#f59e0b',
                        border: `1px solid ${factores.length >= 5 && factores.length <= 8 ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.4)'}`
                      }}
                      title="Rango metodológico: mínimo 5 y máximo 8 Factores Críticos de Éxito"
                    >
                      {factores.length} / 5-8 FCE
                    </span>
                  </div>
                </th>
                <th rowSpan={2} className="mpc-col-peso">
                  Peso
                </th>

                {competidores.map(comp => (
                  <th
                    key={comp.id}
                    className={`mpc-th-competidor ${comp.esPropia ? 'nuestra-empresa' : ''}`}
                  >
                    <div className="mpc-comp-header-box">
                      <div className="mpc-comp-tag-wrap">
                        <span className={`mpc-comp-tag ${comp.esPropia ? 'propia' : 'rival'}`}>
                          {comp.esPropia && <Building2 size={11} />}
                          <span>{comp.badge}</span>
                        </span>
                      </div>

                      <div className="mpc-comp-name-row">
                        <input
                          type="text"
                          value={comp.nombre}
                          onChange={(e) => handleCambioNombreCompetidor(comp.id, e.target.value)}
                          className={`mpc-comp-name-input ${(!comp.esPropia && !comp.nombre?.trim()) ? 'sin-nombre' : ''}`}
                          title={(!comp.esPropia && !comp.nombre?.trim()) ? "Debes ingresar el nombre de este competidor rival para avanzar a POAM" : "Haz clic para nombrar o renombrar al competidor"}
                          placeholder={comp.esPropia ? "Nuestra Empresa" : `Nombre ${comp.badge} (obligatorio)`}
                        />
                        {!comp.esPropia && (
                          <button
                            type="button"
                            className="mpc-btn-remove-comp"
                            onClick={() => handleEliminarCompetidor(comp.id)}
                            title="Eliminar este competidor"
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>

              {/* Subencabezados por competidor */}
              <tr className="sub-header">
                {competidores.map(comp => (
                  <th key={`sub-${comp.id}`} className={`mpc-sub-th-eval ${comp.esPropia ? 'nuestra-empresa' : ''}`}>
                    <div className="mpc-sub-th-labels">
                      <span>Calif. (1-4)</span>
                      <span className="mpc-sub-th-sep">•</span>
                      <span>Pond.</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {factores.map((factor) => {
                const pesoFloat = parseFloat(factor.peso) || 0;

                return (
                  <tr key={factor.id}>
                    {/* FCE */}
                    <td className="mpc-col-fce">
                      <div className="mpc-fce-cell">
                        {/* Fila superior: Código y Acciones */}
                        <div className="mpc-fce-header-row">
                          <div className="mpc-fce-meta-badges">
                            <span className="mpc-fce-codigo">{factor.codigo}</span>
                          </div>

                          <div className="mpc-fce-actions">
                            {/* Botón interactivo de Evidencias (solo icono) */}
                            <button
                              type="button"
                              className={`mpc-btn-fce-action evidencia ${(adjuntosPorFactor[factor.id]?.length > 0) ? 'has-evidencias' : ''}`}
                              onClick={() => abrirModalAdjuntos(factor)}
                              title={(adjuntosPorFactor[factor.id]?.length > 0)
                                ? `${adjuntosPorFactor[factor.id].length} evidencia(s) documental(es) registrada(s)`
                                : "Subir y gestionar evidencias documentales del factor"}
                            >
                              <Paperclip size={12} />
                              {(adjuntosPorFactor[factor.id]?.length > 0) && (
                                <span className="mpc-evidencia-badge-count">
                                  {adjuntosPorFactor[factor.id].length}
                                </span>
                              )}
                            </button>

                            <button
                              type="button"
                              className="mpc-btn-fce-action edit"
                              onClick={() => handleIniciarEdicionFactor(factor)}
                              title="Editar este Factor Crítico"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              type="button"
                              className="mpc-btn-fce-action delete"
                              onClick={() => handleEliminarFactor(factor.id)}
                              title="Eliminar este factor"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Fila central: Nombre / Título de la Evidencia */}
                        <div className="mpc-fce-nombre" title={factor.nombre}>
                          {factor.nombre}
                        </div>

                        {/* Fila inferior: Descripción del FCE */}
                        {factor.descripcion ? (
                          <div className="mpc-fce-desc" title={factor.descripcion}>
                            {factor.descripcion}
                          </div>
                        ) : null}
                      </div>
                    </td>

                    {/* Peso */}
                    <td className="mpc-peso-cell">
                      <div className={`mpc-peso-input-wrapper ${pesoFloat < 0.01 ? 'peso-invalido' : ''}`}>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="1.00"
                          value={factor.peso}
                          onChange={(e) => handleCambioPeso(factor.id, e.target.value)}
                          className="mpc-peso-input"
                          title={pesoFloat < 0.01 ? "El peso debe ser mayor o igual a 0.01 para avanzar a POAM" : `Peso asignado: ${factor.peso}`}
                        />
                        <span className="mpc-peso-pct">{(pesoFloat * 100).toFixed(0)}%</span>
                      </div>
                    </td>

                    {/* Columnas Unificadas de Competidores */}
                    {competidores.map(comp => {
                      const ratingActual = calificaciones[comp.id]?.[factor.id] || 0;
                      const puntajePond = calcularPuntajePonderado(pesoFloat, ratingActual);

                      return (
                        <td
                          key={`${comp.id}-${factor.id}`}
                          className={`mpc-td-eval ${comp.esPropia ? 'nuestra-empresa' : ''}`}
                        >
                          <div className="mpc-eval-cell-wrap">
                            <div className="mpc-rating-selector">
                              {[1, 2, 3, 4].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  className={`mpc-rating-btn ${ratingActual === val ? `active-${val}` : ''}`}
                                  onClick={() => handleCalificar(comp.id, factor.id, val)}
                                  title={`${val} - ${ESCALA_RATING[val].label}: ${ESCALA_RATING[val].descripcion}`}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>

                            <div
                              className={`mpc-eval-pond-badge ${ratingActual > 0 ? 'activo' : ''}`}
                              title={`Puntaje Ponderado: ${pesoFloat.toFixed(2)} × ${ratingActual} = ${puntajePond.toFixed(2)}`}
                            >
                              {puntajePond.toFixed(2)}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>

            {/* Fila de Totales Ponderados */}
            <tfoot>
              <tr className="mpc-tfoot-row">
                <td className="mpc-tfoot-td-label">
                  <div className="mpc-tfoot-label-box">
                    <div className="mpc-tfoot-icon-wrap">
                      <Award size={18} color="#F97316" />
                    </div>
                    <div>
                      <div className="mpc-tfoot-main-title">Totales Ponderados</div>
                      <div className="mpc-tfoot-sub-title">Postura Competitiva Relativa</div>
                    </div>
                  </div>
                </td>

                <td className="mpc-tfoot-td-peso">
                  <div className={`mpc-tfoot-peso-pill ${sumaValida ? 'valido' : (sumaPesos < 1.0 ? 'invalido-falta' : 'invalido-sobra')}`}>
                    <span className="mpc-tfoot-peso-val">{sumaPesos.toFixed(2)}</span>
                    <span className="mpc-tfoot-peso-base">/ 1.00</span>
                  </div>
                </td>

                {competidores.map(comp => {
                  const totalComp = totalesCompetidores[comp.id] || { totalPonderado: 0 };
                  const rankItem = ranking.find(r => r.id === comp.id) || {};
                  const esLider = rankItem.posicion === 1 && totalComp.totalPonderado > 0;

                  let medallaEmoji = '—';
                  if (totalComp.totalPonderado > 0) {
                    if (rankItem.posicion === 1) medallaEmoji = '🥇';
                    else if (rankItem.posicion === 2) medallaEmoji = '🥈';
                    else if (rankItem.posicion === 3) medallaEmoji = '🥉';
                    else if (rankItem.posicion) medallaEmoji = '🎖️';
                  }

                  return (
                    <td
                      key={`total-${comp.id}`}
                      className={`mpc-tfoot-td-comp ${comp.esPropia ? 'nuestra-empresa' : ''}`}
                    >
                      <div className={`mpc-tfoot-card ${comp.esPropia ? 'propia' : ''} ${esLider ? 'card-lider' : ''}`}>
                        <div className="mpc-tfoot-score-row">
                          <span className="mpc-tfoot-score-number">
                            {totalComp.totalPonderado.toFixed(2)}
                          </span>
                          <span className="mpc-tfoot-score-divider">/ 4.00</span>
                        </div>

                        <div className={`mpc-tfoot-posture-badge rank-${rankItem.posicion || 'sin-evaluar'}`}>
                          <span className="mpc-tfoot-posture-medal">{medallaEmoji}</span>
                          <span className="mpc-tfoot-posture-text">
                            {rankItem.posicion ? `${rankItem.posicion}º • ` : ''}
                            {rankItem.postura || 'Sin evaluar'}
                          </span>
                        </div>

                        {comp.esPropia && (
                          <span className="mpc-tfoot-tag-propia">Nuestra Empresa</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* =========================================================================
          FOOTER LIMPIO DE NAVEGACIÓN (IDÉNTICO A LAS DEMÁS PANTALLAS)
          ========================================================================= */}
      <RespaldoHerramienta id="mpc"/>
      <PieNavegacion onAnterior={() => (onVolverAPorter ? onVolverAPorter() : onNavegarFase && onNavegarFase(4))} onSiguiente={handleAvanzarFase6}/>

      {/* -------------------------------------------------------------------
          MODAL: AGREGAR FACTOR CRÍTICO MANUAL
         ------------------------------------------------------------------- */}
      {modalNuevoFceAbierto && (
        <div className="mpc-modal-overlay" onClick={() => setModalNuevoFceAbierto(false)}>
          <div className="mpc-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="mpc-modal-header">
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Plus size={20} color="var(--accent-color, #ea580c)" />
                  Añadir Factor Crítico de Éxito (FCE)
                </h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Rango metodológico: 5 a 8 factores ({factores.length}/8 creados)
                </p>
              </div>
              <button className="mpc-modal-close-btn" onClick={() => setModalNuevoFceAbierto(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCrearFceManual} className="mpc-modal-body">
              <div className="mpc-form-group">
                <label className="mpc-form-label">
                  Nombre del Factor:
                </label>
                <input
                  type="text"
                  className="mpc-form-input"
                  placeholder="Ej. Capacidad Financiera y Flujo de Caja"
                  value={nuevoFceNombre}
                  onChange={(e) => setNuevoFceNombre(e.target.value)}
                  required
                />
              </div>

              <div className="mpc-form-group">
                <label className="mpc-form-label">
                  Descripción Operativa:
                </label>
                <textarea
                  className="mpc-form-textarea"
                  placeholder="Explica qué mide este factor y cómo impacta en la cuota de mercado..."
                  value={nuevoFceDesc}
                  onChange={(e) => setNuevoFceDesc(e.target.value)}
                  rows={3}
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="mpc-form-group">
                <label className="mpc-form-label">
                  Peso Inicial sugerido (0.01 a 1.00):
                </label>
                <input
                  type="number"
                  className="mpc-form-input"
                  step="0.01"
                  min="0.01"
                  max="1.00"
                  value={nuevoFcePeso}
                  onChange={(e) => setNuevoFcePeso(parseFloat(e.target.value) || 0.05)}
                />
                <span className="mpc-form-help">
                  Nota: Recuerda equilibrar o reajustar los demás pesos para mantener la sumatoria en 1.00.
                </span>
              </div>


              <div className="mpc-modal-footer">
                <button
                  type="button"
                  className="mpc-btn-secondary"
                  onClick={() => setModalNuevoFceAbierto(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="mpc-btn-next" style={{ padding: '0.5rem 1.25rem' }}>
                  Crear Factor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------
          MODAL: EDITAR FACTOR CRÍTICO DE ÉXITO (FCE)
         ------------------------------------------------------------------- */}
      {factorEnEdicion && (
        <div className="mpc-modal-overlay" onClick={() => setFactorEnEdicion(null)}>
          <div className="mpc-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="mpc-modal-header">
              <h3>
                <Pencil size={18} color="var(--accent-color, #ea580c)" />
                Editar Factor Crítico: {factorEnEdicion.codigo}
              </h3>
              <button className="mpc-modal-close-btn" onClick={() => setFactorEnEdicion(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicionFactor} className="mpc-modal-body">
              <div className="mpc-form-group">
                <label className="mpc-form-label">
                  Nombre del Factor:
                </label>
                <input
                  type="text"
                  className="mpc-form-input"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  required
                />
              </div>

              <div className="mpc-form-group">
                <label className="mpc-form-label">
                  Descripción Operativa:
                </label>
                <textarea
                  className="mpc-form-textarea"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="mpc-form-group">
                <label className="mpc-form-label">
                  Peso Relativo (0.01 a 1.00):
                </label>
                <input
                  type="number"
                  className="mpc-form-input"
                  step="0.01"
                  min="0.01"
                  max="1.00"
                  value={editPeso}
                  onChange={(e) => setEditPeso(parseFloat(e.target.value) || 0.01)}
                  required
                />
                <span className="mpc-form-help">
                  Nota: Recuerda equilibrar o reajustar los demás pesos para mantener la sumatoria en 1.00.
                </span>
              </div>

              <div className="mpc-modal-footer">
                <button
                  type="button"
                  className="mpc-btn-secondary"
                  onClick={() => setFactorEnEdicion(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="mpc-btn-next" style={{ padding: '0.5rem 1.25rem' }}>
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------
          MODAL: EVIDENCIAS Y FUENTES DEL FACTOR (MPC)
         ------------------------------------------------------------------- */}
      {modalAdjuntos.abierto && modalAdjuntos.factor && (
        <div className="mpc-modal-overlay" onClick={cerrarModalAdjuntos}>
          <div className="mpc-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* CABECERA DEL MODAL */}
            <div className="mpc-modal-header-evidencias">
              <div className="mpc-modal-header-info">
                <div className="mpc-modal-pretitle">
                  <Paperclip size={13} className="mpc-modal-icon-badge" />
                  <span>Respaldo Documental • {modalAdjuntos.factor.codigo}</span>
                </div>
                <h3 className="mpc-modal-title">Evidencias y Fuentes del Factor</h3>
                <p className="mpc-modal-factor-quote">
                  "{modalAdjuntos.factor.nombre}"
                </p>
              </div>
              <button
                type="button"
                className="mpc-modal-btn-close"
                onClick={cerrarModalAdjuntos}
                title="Cerrar modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mpc-modal-body-evidencias">
              {/* SELECTOR DE TIPO DE EVIDENCIA SOLICITADO */}
              <div className="mpc-modal-type-tabs">
                <button
                  type="button"
                  className={`mpc-modal-tab-btn ${tabTipoAdjunto === 'pdf' ? 'active pdf' : ''}`}
                  onClick={() => { setTabTipoAdjunto('pdf'); setArchivoSeleccionado(null); }}
                >
                  <FileText size={14} />
                  <span>Documentos (.pdf)</span>
                </button>
                <button
                  type="button"
                  className={`mpc-modal-tab-btn ${tabTipoAdjunto === 'imagen' ? 'active img' : ''}`}
                  onClick={() => { setTabTipoAdjunto('imagen'); setArchivoSeleccionado(null); }}
                >
                  <ImageIcon size={14} />
                  <span>Imágenes</span>
                </button>
                <button
                  type="button"
                  className={`mpc-modal-tab-btn ${tabTipoAdjunto === 'hoja_calculo' ? 'active sheet' : ''}`}
                  onClick={() => { setTabTipoAdjunto('hoja_calculo'); setArchivoSeleccionado(null); }}
                >
                  <FileSpreadsheet size={14} />
                  <span>Hojas de cálculo</span>
                </button>
                <button
                  type="button"
                  className={`mpc-modal-tab-btn ${tabTipoAdjunto === 'enlace' ? 'active link' : ''}`}
                  onClick={() => { setTabTipoAdjunto('enlace'); setArchivoSeleccionado(null); }}
                >
                  <Link2 size={14} />
                  <span>Enlace web / Fuente</span>
                </button>
              </div>

              {/* ÁREA DE CARGA O INGRESO */}
              <div className="mpc-modal-upload-panel">
                {tabTipoAdjunto === 'enlace' ? (
                  <form onSubmit={guardarAdjuntoEnlace} className="mpc-modal-link-form">
                    <div className="mpc-modal-field">
                      <label>Enlace web / URL externa (ej: https://...):</label>
                      <div className="mpc-input-icon-wrap">
                        <Link2 size={14} className="input-icon" />
                        <input
                          type="url"
                          placeholder="https://ejemplo.com/estudio-o-benchmarking"
                          value={urlEnlaceInput}
                          onChange={(e) => setUrlEnlaceInput(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="mpc-modal-field">
                      <label>Título o Fuente informativa (opcional):</label>
                      <input
                        type="text"
                        placeholder="Ej: Reporte Sectorial de Competitividad, Diario Financiero"
                        value={tituloEnlaceInput}
                        onChange={(e) => setTituloEnlaceInput(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="mpc-modal-btn-submit">
                      <Plus size={13} />
                      <span>Vincular Fuente Web</span>
                    </button>
                  </form>
                ) : (
                  <div className="mpc-modal-file-upload-block">
                    <label className="mpc-modal-dropzone">
                      <input
                        type="file"
                        className="mpc-hidden-file-input"
                        accept={
                          tabTipoAdjunto === 'pdf'
                            ? '.pdf,application/pdf'
                            : tabTipoAdjunto === 'imagen'
                            ? 'image/*'
                            : '.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
                        }
                        onChange={(e) => handleFileChange(e, tabTipoAdjunto)}
                      />
                      <div className="mpc-dropzone-content">
                        <UploadCloud size={28} className="mpc-upload-icon" />
                        <span className="mpc-dropzone-title">
                          {tabTipoAdjunto === 'pdf' && 'Seleccionar documento PDF (.pdf)'}
                          {tabTipoAdjunto === 'imagen' && 'Seleccionar imagen (.png, .jpg, .webp)'}
                          {tabTipoAdjunto === 'hoja_calculo' && 'Seleccionar hoja de cálculo (.xlsx, .xls, .csv)'}
                        </span>
                        <span className="mpc-dropzone-sub">
                          Haz clic para explorar o arrastra y suelta tu archivo aquí
                        </span>
                      </div>
                    </label>

                    {archivoSeleccionado && (
                      <div className="mpc-selected-file-preview">
                        <div className="mpc-selected-file-info">
                          {archivoSeleccionado.tipo === 'imagen' && archivoSeleccionado.previewUrl ? (
                            <img
                              src={archivoSeleccionado.previewUrl}
                              alt="Vista previa"
                              className="mpc-img-thumb-preview"
                            />
                          ) : (
                            <div className={`mpc-file-icon-box ${archivoSeleccionado.tipo}`}>
                              {archivoSeleccionado.tipo === 'pdf' ? (
                                <FileText size={18} />
                              ) : (
                                <FileSpreadsheet size={18} />
                              )}
                            </div>
                          )}

                          <div className="mpc-file-meta-texts">
                            <input
                              type="text"
                              className="mpc-rename-input"
                              value={nombreArchivoInput}
                              onChange={(e) => setNombreArchivoInput(e.target.value)}
                              placeholder="Nombre descriptivo para esta evidencia"
                              title="Puedes renombrar este archivo para fácil identificación"
                            />
                            <span className="mpc-file-raw-meta">
                              {archivoSeleccionado.archivoNombreOriginal || archivoSeleccionado.nombre} • {archivoSeleccionado.tamano}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="mpc-modal-btn-submit"
                          onClick={guardarAdjuntoArchivo}
                        >
                          <Plus size={13} />
                          <span>Adjuntar Evidencia</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* LISTA DE EVIDENCIAS REGISTRADAS */}
              <div className="mpc-modal-attached-section">
                <div className="mpc-modal-attached-header">
                  <span className="mpc-attached-title">
                    Evidencias Registradas ({(adjuntosPorFactor[modalAdjuntos.factor.id] || []).length})
                  </span>
                  <span className="mpc-attached-help">
                    Respaldos que sustentan la calificación asignada
                  </span>
                </div>

                {(adjuntosPorFactor[modalAdjuntos.factor.id] || []).length === 0 ? (
                  <div className="mpc-modal-empty-attached">
                    <Paperclip size={24} style={{ opacity: 0.3 }} />
                    <p>No hay evidencias o fuentes adjuntas a este factor</p>
                    <span>
                      Sube un informe PDF, captura de mercado, balances o enlace web para validar la evaluación competitiva.
                    </span>
                  </div>
                ) : (
                  <div className="mpc-attached-cards-grid">
                    {(adjuntosPorFactor[modalAdjuntos.factor.id] || []).map((adj) => (
                      <div key={adj.id} className="mpc-attached-card">
                        <div className="mpc-attached-card-left">
                          <div className={`mpc-attached-icon-wrap ${adj.tipo}`}>
                            {adj.tipo === 'pdf' && <FileText size={15} />}
                            {adj.tipo === 'imagen' && <ImageIcon size={15} />}
                            {adj.tipo === 'hoja_calculo' && <FileSpreadsheet size={15} />}
                            {adj.tipo === 'enlace' && <Link2 size={15} />}
                          </div>

                          <div className="mpc-attached-card-info">
                            <span className="mpc-attached-card-name" title={adj.nombre}>
                              {adj.nombre}
                            </span>
                            <span className="mpc-attached-card-sub">
                              {adj.tamano} • {adj.fecha}
                            </span>
                          </div>
                        </div>

                        <div className="mpc-attached-card-actions">
                          {adj.url && adj.url !== '#' && (
                            <a
                              href={adj.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mpc-attached-btn-action view"
                              title="Abrir / Descargar evidencia"
                            >
                              <ExternalLink size={13} />
                            </a>
                          )}
                          <button
                            type="button"
                            className="mpc-attached-btn-action delete"
                            onClick={() => eliminarAdjunto(modalAdjuntos.factor.id, adj.id)}
                            title="Eliminar esta evidencia"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mpc-modal-footer">
              <button
                type="button"
                className="mpc-btn-secondary"
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
