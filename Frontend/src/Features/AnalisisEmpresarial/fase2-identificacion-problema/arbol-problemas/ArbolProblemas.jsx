import { useState, useMemo, useEffect, useRef } from 'react';
import RespaldoHerramienta from '../../compartido/documentos/RespaldoHerramienta';
import PieNavegacion from '../../simulacion/PieNavegacion';
import { EncabezadoHerramienta } from '../../compartido/ComponentesHerramienta';
import { createPortal } from 'react-dom';
import {
  Plus,
  Edit2,
  Check,
  X,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  TrendingDown,
  Layers,
  CheckCircle2,
  Leaf,
  Sprout,
  TreeDeciduous,
  PanelRightClose,
  PanelRightOpen,
  Building2,
  Globe,
  Search,
  RotateCcw,
  GripVertical,
  Trash2
} from 'lucide-react';
import { alerta } from '../../../../utils/Notificaciones';
import './ArbolProblemas.css';

const OPCIONES_AREA_CATEGORIA = [
  'Operaciones',
  'Talento Humano',
  'Financiero',
  'Mercado',
  'Competencia',
  'Tecnología',
  'Otro'
];

export default function ArbolProblemas({
  ideasLluvia = [],
  ideasSeleccionadasLluvia = [],
  datosArbol,
  setDatosArbol,
  onVolverALluvia,
  onContinuarAPorter,
  onExportarPDF,
  exportandoPDF
}) {
  // Estado local para modales de edición/creación
  const [modalCausaAbierto, setModalCausaAbierto] = useState(false);
  const [modalEfectoAbierto, setModalEfectoAbierto] = useState(false);
  const [modalProblemaAbierto, setModalProblemaAbierto] = useState(false);
  
  // Elemento en edición
  const [causaEnEdicion, setCausaEnEdicion] = useState(null);
  const [efectoEnEdicion, setEfectoEnEdicion] = useState(null);

  // Formulario temporal de causa
  const [formCausa, setFormCausa] = useState({
    titulo: '',
    tipo: '',
    categoria: '',
    categoriaOtra: ''
  });

  // Formulario temporal de efecto
  const [formEfecto, setFormEfecto] = useState({
    titulo: '',
    tipo: '',
    categoria: '',
    categoriaOtra: ''
  });

  // Formulario de edición del problema central
  const [formProblema, setFormProblema] = useState({
    titulo: datosArbol?.problemaCentral?.titulo || '',
    descripcion: datosArbol?.problemaCentral?.descripcion || '',
    categoria: datosArbol?.problemaCentral?.categoria || '',
    categoriaOtra: ''
  });

  // Menú Lateral (Bandeja idéntica a POAM)
  const [bandejaColapsada, setBandejaColapsada] = useState(false);
  const [filtroBandeja, setFiltroBandeja] = useState('Todas'); // 'Todas' | 'Internas' | 'Externas'
  const [busquedaBandeja, setBusquedaBandeja] = useState('');

  // Drag and Drop hacia el Árbol
  const [draggedIdea, setDraggedIdea] = useState(null);
  const [dragOverZone, setDragOverZone] = useState(null); // 'efecto-directo' | 'efecto-indirecto' | 'tronco' | 'causa-directa' | 'causa-indirecta'

  // Refs para acomodar dinámicamente el fondo SVG según los elementos arrastrados en copa, tronco y raíces
  const treeContainerRef = useRef(null);
  const canopyRef = useRef(null);
  const trunkRef = useRef(null);
  const rootsRef = useRef(null);

  const [svgDims, setSvgDims] = useState({
    width: 1200,
    height: 1250,
    canopyH: 340,
    trunkTop: 360,
    trunkBottom: 580,
    groundY: 620
  });

  useEffect(() => {
    if (!treeContainerRef.current) return;

    let frameId;
    const measureTree = () => {
      const cRect = treeContainerRef.current?.getBoundingClientRect();
      if (!cRect || cRect.height === 0 || cRect.width === 0) return;

      const canopyRect = canopyRef.current?.getBoundingClientRect();
      const trunkRect = trunkRef.current?.getBoundingClientRect();
      const rootsRect = rootsRef.current?.getBoundingClientRect();

      const scale = 1200 / (cRect.width || 860);
      const totalH = Math.max(cRect.height * scale, 900);

      const canopyBottom = canopyRect ? Math.max((canopyRect.bottom - cRect.top) * scale, 220) : 340;
      const trunkTop = trunkRect ? (trunkRect.top - cRect.top) * scale : canopyBottom + 25;
      const trunkBottom = trunkRect ? (trunkRect.bottom - cRect.top) * scale : trunkTop + 200;
      const groundY = rootsRect ? Math.max((rootsRect.top - cRect.top) * scale, trunkBottom + 20) : trunkBottom + 30;

      setSvgDims({
        width: 1200,
        height: totalH,
        canopyH: canopyBottom,
        trunkTop,
        trunkBottom,
        groundY
      });
    };

    const handleResize = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(measureTree);
    };

    measureTree();

    const ro = new ResizeObserver(handleResize);
    if (treeContainerRef.current) ro.observe(treeContainerRef.current);
    if (canopyRef.current) ro.observe(canopyRef.current);
    if (trunkRef.current) ro.observe(trunkRef.current);
    if (rootsRef.current) ro.observe(rootsRef.current);

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [datosArbol?.causas, datosArbol?.efectos, datosArbol?.problemaCentral]);

  // IDs de ideas ya asignadas en el árbol (en causas, efectos o en problema central)
  const idsIdeasAsignadas = useMemo(() => {
    const mapa = {};
    (datosArbol?.causas || []).forEach(c => {
      if (c.idIdeaOrigen) mapa[c.idIdeaOrigen] = 'causa';
    });
    (datosArbol?.efectos || []).forEach(e => {
      if (e.idIdeaOrigen) mapa[e.idIdeaOrigen] = 'efecto';
    });
    if (datosArbol?.problemaCentral?.idIdeaOrigen) {
      mapa[datosArbol.problemaCentral.idIdeaOrigen] = 'tronco';
    }
    return mapa;
  }, [datosArbol]);

  // Rescate de los factores seleccionados en Lluvia de Ideas
  const insumosDisponibles = useMemo(() => {
    if (Array.isArray(ideasSeleccionadasLluvia) && ideasSeleccionadasLluvia.length > 0) {
      return ideasSeleccionadasLluvia;
    }
    if (Array.isArray(ideasLluvia) && ideasLluvia.length > 0) {
      const sel = ideasLluvia.filter(i => i.seleccionada);
      if (sel.length > 0) return sel;
      return ideasLluvia;
    }
    return [];
  }, [ideasSeleccionadasLluvia, ideasLluvia]);

  // Helpers para resolver categoría estándar vs "Otro"
  const resolverCategoriaInicial = (categoriaGuardada) => {
    if (!categoriaGuardada) return { categoria: '', categoriaOtra: '' };
    const opcionesFijas = ['Operaciones', 'Talento Humano', 'Financiero', 'Mercado', 'Competencia', 'Tecnología'];
    if (opcionesFijas.includes(categoriaGuardada)) {
      return { categoria: categoriaGuardada, categoriaOtra: '' };
    }
    return { categoria: 'Otro', categoriaOtra: categoriaGuardada };
  };

  const resolverCategoriaFinal = (categoria, categoriaOtra, fallback = 'Operaciones') => {
    if (categoria === 'Otro') {
      return categoriaOtra?.trim() || 'Otro';
    }
    return categoria?.trim() || fallback;
  };

  // Factores PENDIENTES: Al arrastrar un factor, se queda ubicado en el árbol y ya no permanece en la bandeja
  const insumosPendientes = useMemo(() => {
    return insumosDisponibles.filter(idea => !idsIdeasAsignadas[idea.id]);
  }, [insumosDisponibles, idsIdeasAsignadas]);

  const esInterna = (idea) => (idea.tipoAmbito || 'Interno') === 'Interno';
  const esExterna = (idea) => idea.tipoAmbito === 'Externo' || idea.tipoAmbito === 'Macroentorno';

  const conteoInternas = useMemo(() => {
    return insumosPendientes.filter(esInterna).length;
  }, [insumosPendientes]);

  const conteoExternas = useMemo(() => {
    return insumosPendientes.filter(esExterna).length;
  }, [insumosPendientes]);

  const ideasFiltradas = useMemo(() => {
    return insumosPendientes.filter(idea => {
      if (filtroBandeja === 'Internas' && !esInterna(idea)) return false;
      if (filtroBandeja === 'Externas' && !esExterna(idea)) return false;
      if (busquedaBandeja.trim()) {
        const query = busquedaBandeja.toLowerCase();
        const coincideTexto = (idea.texto || '').toLowerCase().includes(query);
        const coincideCat = (idea.categoria || '').toLowerCase().includes(query);
        if (!coincideTexto && !coincideCat) return false;
      }
      return true;
    });
  }, [insumosPendientes, filtroBandeja, busquedaBandeja]);

  // Paginación idéntica a la matriz POAM (4 factores por página, evitando que se corten en la bandeja)
  const [paginaBandeja, setPaginaBandeja] = useState(1);
  const itemsPorPagina = 4;
  const totalPaginasBandeja = Math.max(1, Math.ceil(ideasFiltradas.length / itemsPorPagina));
  const paginaActual = Math.min(Math.max(1, paginaBandeja), totalPaginasBandeja);

  useEffect(() => {
    if (paginaBandeja > totalPaginasBandeja) {
      setPaginaBandeja(totalPaginasBandeja);
    }
  }, [totalPaginasBandeja, paginaBandeja]);

  useEffect(() => {
    setPaginaBandeja(1);
  }, [filtroBandeja, busquedaBandeja]);

  const ideasPaginadas = useMemo(() => {
    const start = (paginaActual - 1) * itemsPorPagina;
    return ideasFiltradas.slice(start, start + itemsPorPagina);
  }, [ideasFiltradas, paginaActual, itemsPorPagina]);

  // Manejo de Drag and Drop sin parpadeo (Anti-flicker)
  const handleDragStart = (e, idea) => {
    setDraggedIdea(idea);
    e.dataTransfer.setData('application/json', JSON.stringify(idea));
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDragEnd = () => {
    setDraggedIdea(null);
    setDragOverZone(null);
  };

  const handleDragOverZone = (e, zoneName) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (dragOverZone !== zoneName) {
      setDragOverZone(zoneName);
    }
  };

  const handleDragLeaveZone = (e, zoneName) => {
    e.preventDefault();
    e.stopPropagation();
    // Previene el parpadeo si el cursor se desplaza sobre elementos hijos de la zona
    if (e.currentTarget && e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) {
      return;
    }
    if (dragOverZone === zoneName) {
      setDragOverZone(null);
    }
  };

  // Ubicar o mover cualquier factor a cualquier destino del árbol
  const ubicarFactorEnArbol = (factor, destino, ubicacionActual = null) => {
    if (!factor || !destino) return;
    if (destino === ubicacionActual) return;

    const texto = factor.texto || factor.titulo || '';
    if (!texto.trim()) return;

    const idIdeaOrigen = factor.idIdeaOrigen || (factor.texto ? factor.id : null);
    const categoria = factor.categoria || (factor.tipoAmbito === 'Interno' ? 'Operaciones' : 'Mercado');
    const origen = factor.origen || 'Lluvia de Ideas';

    setDatosArbol(prev => {
      let nuevasCausas = [...(prev?.causas || [])];
      let nuevosEfectos = [...(prev?.efectos || [])];
      let nuevoProblema = { ...(prev?.problemaCentral || {}) };

      // 1. Remover de ubicación previa
      if (ubicacionActual) {
        if (ubicacionActual.startsWith('causa')) {
          nuevasCausas = nuevasCausas.filter(c => c.id !== factor.id);
        } else if (ubicacionActual.startsWith('efecto')) {
          nuevosEfectos = nuevosEfectos.filter(e => e.id !== factor.id);
        } else if (ubicacionActual === 'tronco') {
          nuevoProblema = {
            id: nuevoProblema.id || 'pc',
            titulo: '',
            descripcion: '',
            categoria: '',
            origen: '',
            idIdeaOrigen: null
          };
        }
      } else {
        // Si viene de la bandeja, prevenir duplicados
        if (idIdeaOrigen) {
          nuevasCausas = nuevasCausas.filter(c => c.idIdeaOrigen !== idIdeaOrigen);
          nuevosEfectos = nuevosEfectos.filter(e => e.idIdeaOrigen !== idIdeaOrigen);
          if (nuevoProblema.idIdeaOrigen === idIdeaOrigen) {
            nuevoProblema = {
              id: nuevoProblema.id || 'pc',
              titulo: '',
              descripcion: '',
              categoria: '',
              origen: '',
              idIdeaOrigen: null
            };
          }
        }
      }

      // 2. Ubicar en el nuevo destino
      if (destino === 'efecto-directo') {
        const nuevoEfecto = {
          id: factor.id && factor.id.startsWith('efecto-') && ubicacionActual?.startsWith('efecto')
            ? factor.id
            : `efecto-${idIdeaOrigen || Date.now()}-${Date.now()}`,
          titulo: texto,
          descripcion: factor.descripcion || '',
          tipo: 'directo',
          categoria: categoria || 'General',
          origen,
          idIdeaOrigen: idIdeaOrigen || null
        };
        nuevosEfectos.push(nuevoEfecto);
      } else if (destino === 'efecto-indirecto') {
        const nuevoEfecto = {
          id: factor.id && factor.id.startsWith('efecto-') && ubicacionActual?.startsWith('efecto')
            ? factor.id
            : `efecto-${idIdeaOrigen || Date.now()}-${Date.now()}`,
          titulo: texto,
          descripcion: factor.descripcion || '',
          tipo: 'indirecto',
          categoria: categoria || 'General',
          origen,
          idIdeaOrigen: idIdeaOrigen || null
        };
        nuevosEfectos.push(nuevoEfecto);
      } else if (destino === 'causa-directa') {
        const nuevaCausa = {
          id: factor.id && factor.id.startsWith('causa-') && ubicacionActual?.startsWith('causa')
            ? factor.id
            : `causa-${idIdeaOrigen || Date.now()}-${Date.now()}`,
          titulo: texto,
          descripcion: factor.descripcion || '',
          tipo: 'directa',
          categoria: categoria || 'Operaciones',
          origen,
          idIdeaOrigen: idIdeaOrigen || null
        };
        nuevasCausas.push(nuevaCausa);
      } else if (destino === 'causa-indirecta') {
        const nuevaCausa = {
          id: factor.id && factor.id.startsWith('causa-') && ubicacionActual?.startsWith('causa')
            ? factor.id
            : `causa-${idIdeaOrigen || Date.now()}-${Date.now()}`,
          titulo: texto,
          descripcion: factor.descripcion || '',
          tipo: 'indirecta',
          categoria: categoria || 'Operaciones',
          origen,
          idIdeaOrigen: idIdeaOrigen || null
        };
        nuevasCausas.push(nuevaCausa);
      } else if (destino === 'tronco') {
        nuevoProblema = {
          ...nuevoProblema,
          titulo: texto,
          descripcion: factor.descripcion || '',
          categoria: categoria || 'Estratégica',
          origen: origen || 'Lluvia de Ideas',
          idIdeaOrigen: idIdeaOrigen || null
        };
      }

      return {
        ...prev,
        causas: nuevasCausas,
        efectos: nuevosEfectos,
        problemaCentral: nuevoProblema
      };
    });

    const nombres = {
      'efecto-directo': 'Efecto Directo',
      'efecto-indirecto': 'Efecto Indirecto',
      'tronco': 'Problema Central',
      'causa-directa': 'Causa Directa',
      'causa-indirecta': 'Causa Indirecta'
    };
    alerta.exito("Factor Acomodado", `"${texto.substring(0, 30)}..." acomodado en ${nombres[destino] || destino}.`);
  };

  const handleDragStartNodo = (e, nodo, origenZona) => {
    const payload = {
      ...nodo,
      _origenZona: origenZona
    };
    setDraggedIdea(payload);
    try {
      e.dataTransfer.setData('application/json', JSON.stringify(payload));
    } catch (err) {
      console.error('Error serializando drag data:', err);
    }
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDropOnZone = (e, zoneName) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverZone(null);
    let ideaData = draggedIdea;
    if (!ideaData) {
      try {
        const raw = e.dataTransfer.getData('application/json');
        if (raw) ideaData = JSON.parse(raw);
      } catch (err) {
        console.error('Error parseando drag data:', err);
      }
    }
    if (!ideaData) return;

    ubicarFactorEnArbol(ideaData, zoneName, ideaData._origenZona || null);
    setDraggedIdea(null);
  };

  const handleDropOnTray = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let ideaData = draggedIdea;
    if (!ideaData) {
      try {
        const raw = e.dataTransfer.getData('application/json');
        if (raw) ideaData = JSON.parse(raw);
      } catch (err) {
        console.error('Error parseando drag data:', err);
      }
    }
    if (!ideaData || !ideaData._origenZona) return;

    const origenZona = ideaData._origenZona;
    setDatosArbol(prev => {
      if (origenZona.startsWith('causa')) {
        return {
          ...prev,
          causas: (prev?.causas || []).filter(c => c.id !== ideaData.id)
        };
      }
      if (origenZona.startsWith('efecto')) {
        return {
          ...prev,
          efectos: (prev?.efectos || []).filter(e => e.id !== ideaData.id)
        };
      }
      if (origenZona === 'tronco') {
        return {
          ...prev,
          problemaCentral: {
            id: prev.problemaCentral?.id || 'pc',
            titulo: '',
            descripcion: '',
            categoria: '',
            origen: '',
            idIdeaOrigen: null
          }
        };
      }
      return prev;
    });
    setDraggedIdea(null);
    alerta.info("Factor Devuelto", "El factor ha regresado a la bandeja de pendientes.");
  };

  // Desvincular todas las ideas de la bandeja del árbol
  const desvincularTodasDeBandeja = () => {
    const totalVinculadas = (datosArbol?.causas || []).filter(c => c.idIdeaOrigen).length +
      (datosArbol?.efectos || []).filter(e => e.idIdeaOrigen).length +
      (datosArbol?.problemaCentral?.idIdeaOrigen ? 1 : 0);
    if (totalVinculadas === 0) {
      alerta.info("Sin Asignaciones", "No hay ideas vinculadas actualmente en el árbol.");
      return;
    }
    setDatosArbol(prev => ({
      ...prev,
      causas: (prev?.causas || []).filter(c => !c.idIdeaOrigen),
      efectos: (prev?.efectos || []).filter(e => !e.idIdeaOrigen),
      problemaCentral: prev?.problemaCentral?.idIdeaOrigen
        ? {
            id: prev?.problemaCentral?.id || 'pc',
            titulo: '',
            descripcion: '',
            categoria: '',
            origen: '',
            idIdeaOrigen: null
          }
        : (prev?.problemaCentral || {
            id: 'pc',
            titulo: '',
            descripcion: '',
            categoria: '',
            origen: '',
            idIdeaOrigen: null
          })
    }));
    setPaginaBandeja(1);
    alerta.exito("Bandeja Restablecida", `Se han desvinculado ${totalVinculadas} ideas del árbol.`);
  };

  // Manejo de Causas
  const abrirCrearCausa = (tipo = '') => {
    setCausaEnEdicion(null);
    setFormCausa({
      titulo: '',
      tipo: typeof tipo === 'string' ? tipo : '',
      categoria: '',
      categoriaOtra: ''
    });
    setModalCausaAbierto(true);
  };

  const abrirEditarCausa = (causa) => {
    setCausaEnEdicion(causa);
    const { categoria, categoriaOtra } = resolverCategoriaInicial(causa.categoria);
    setFormCausa({
      titulo: causa.titulo || '',
      tipo: causa.tipo || '',
      categoria,
      categoriaOtra
    });
    setModalCausaAbierto(true);
  };

  const guardarCausa = (e) => {
    e.preventDefault();
    if (!formCausa.titulo.trim()) {
      alerta.advertencia("Campo Requerido", "Por favor ingresa la descripción de la causa.");
      return;
    }
    if (!formCausa.tipo) {
      alerta.advertencia("Campo Requerido", "Por favor selecciona el tipo de causa (Directa o Indirecta).");
      return;
    }
    if (!formCausa.categoria) {
      alerta.advertencia("Campo Requerido", "Por favor selecciona el área o categoría.");
      return;
    }
    if (formCausa.categoria === 'Otro' && !formCausa.categoriaOtra?.trim()) {
      alerta.advertencia("Campo Requerido", "Por favor especifica el área o categoría.");
      return;
    }

    const catFinal = resolverCategoriaFinal(formCausa.categoria, formCausa.categoriaOtra);

    if (causaEnEdicion) {
      // Editar
      setDatosArbol(prev => ({
        ...prev,
        causas: (prev?.causas || []).map(c => 
          c.id === causaEnEdicion.id 
            ? { ...c, titulo: formCausa.titulo.trim(), tipo: formCausa.tipo, categoria: catFinal } 
            : c
        )
      }));
      alerta.exito("Causa Actualizada", "Se ha actualizado la causa raíz.");
    } else {
      // Crear nueva
      const nuevaCausa = {
        id: `causa-custom-${Date.now()}`,
        titulo: formCausa.titulo.trim(),
        tipo: formCausa.tipo,
        categoria: catFinal,
        origen: 'Manual',
        idIdeaOrigen: null
      };
      setDatosArbol(prev => ({
        ...prev,
        causas: [...(prev?.causas || []), nuevaCausa]
      }));
      alerta.exito("Causa Agregada", "Nueva causa registrada en el Árbol de Problemas.");
    }

    setModalCausaAbierto(false);
  };

  const eliminarCausa = (id) => {
    const causa = (datosArbol?.causas || []).find(c => c.id === id);
    setDatosArbol(prev => ({
      ...prev,
      causas: prev.causas.filter(c => c.id !== id)
    }));
    if (causa?.idIdeaOrigen) {
      alerta.info("Factor Desvinculado", "El factor ha vuelto a la bandeja de factores pendientes.");
    } else {
      alerta.info("Causa Eliminada", "Se ha removido la causa del árbol.");
    }
  };

  // Manejo de Efectos
  const abrirCrearEfecto = (tipo = '') => {
    setEfectoEnEdicion(null);
    setFormEfecto({
      titulo: '',
      tipo: typeof tipo === 'string' ? tipo : '',
      categoria: '',
      categoriaOtra: ''
    });
    setModalEfectoAbierto(true);
  };

  const abrirEditarEfecto = (efecto) => {
    setEfectoEnEdicion(efecto);
    const { categoria, categoriaOtra } = resolverCategoriaInicial(efecto.categoria);
    setFormEfecto({
      titulo: efecto.titulo || '',
      tipo: efecto.tipo || '',
      categoria,
      categoriaOtra
    });
    setModalEfectoAbierto(true);
  };

  const guardarEfecto = (e) => {
    e.preventDefault();
    if (!formEfecto.titulo.trim()) {
      alerta.advertencia("Campo Requerido", "Por favor ingresa la descripción del efecto.");
      return;
    }
    if (!formEfecto.tipo) {
      alerta.advertencia("Campo Requerido", "Por favor selecciona el tipo de efecto (Directo o Indirecto).");
      return;
    }
    if (!formEfecto.categoria) {
      alerta.advertencia("Campo Requerido", "Por favor selecciona el área o categoría.");
      return;
    }
    if (formEfecto.categoria === 'Otro' && !formEfecto.categoriaOtra?.trim()) {
      alerta.advertencia("Campo Requerido", "Por favor especifica el área o categoría.");
      return;
    }

    const catFinal = resolverCategoriaFinal(formEfecto.categoria, formEfecto.categoriaOtra);

    if (efectoEnEdicion) {
      setDatosArbol(prev => ({
        ...prev,
        efectos: (prev?.efectos || []).map(ef => 
          ef.id === efectoEnEdicion.id 
            ? { ...ef, titulo: formEfecto.titulo.trim(), tipo: formEfecto.tipo, categoria: catFinal } 
            : ef
        )
      }));
      alerta.exito("Efecto Actualizado", "Se ha actualizado el efecto en el árbol.");
    } else {
      const nuevoEfecto = {
        id: `efecto-custom-${Date.now()}`,
        titulo: formEfecto.titulo.trim(),
        tipo: formEfecto.tipo,
        categoria: catFinal,
        origen: 'Manual',
        idIdeaOrigen: null
      };
      setDatosArbol(prev => ({
        ...prev,
        efectos: [...(prev?.efectos || []), nuevoEfecto]
      }));
      alerta.exito("Efecto Agregado", "Nuevo efecto registrado en el Árbol de Problemas.");
    }

    setModalEfectoAbierto(false);
  };

  const eliminarEfecto = (id) => {
    const efecto = (datosArbol?.efectos || []).find(ef => ef.id === id);
    setDatosArbol(prev => ({
      ...prev,
      efectos: prev.efectos.filter(ef => ef.id !== id)
    }));
    if (efecto?.idIdeaOrigen) {
      alerta.info("Factor Desvinculado", "El factor ha vuelto a la bandeja de factores pendientes.");
    } else {
      alerta.info("Efecto Eliminado", "Se ha removido el efecto del árbol.");
    }
  };

  // Manejo de Problema Central
  const abrirEditarProblema = () => {
    const { categoria, categoriaOtra } = resolverCategoriaInicial(datosArbol?.problemaCentral?.categoria);
    setFormProblema({
      titulo: datosArbol?.problemaCentral?.titulo || '',
      descripcion: datosArbol?.problemaCentral?.descripcion || '',
      categoria,
      categoriaOtra
    });
    setModalProblemaAbierto(true);
  };

  const guardarProblemaCentral = (e) => {
    e.preventDefault();
    if (!formProblema.titulo.trim()) {
      alerta.advertencia("Campo Requerido", "El problema central debe tener un título claro.");
      return;
    }
    if (!formProblema.categoria) {
      alerta.advertencia("Campo Requerido", "Por favor selecciona el área o categoría.");
      return;
    }
    if (formProblema.categoria === 'Otro' && !formProblema.categoriaOtra?.trim()) {
      alerta.advertencia("Campo Requerido", "Por favor especifica el área o categoría.");
      return;
    }

    const catFinal = resolverCategoriaFinal(formProblema.categoria, formProblema.categoriaOtra, 'General');

    setDatosArbol(prev => ({
      ...prev,
      problemaCentral: {
        ...prev.problemaCentral,
        titulo: formProblema.titulo.trim(),
        descripcion: (formProblema.descripcion || '').trim(),
        categoria: catFinal
      }
    }));

    setModalProblemaAbierto(false);
    alerta.exito("Problema Central Actualizado", "Has reformulado el Problema Central con éxito.");
  };

  const limpiarProblemaCentral = () => {
    const idIdeaOrigen = datosArbol?.problemaCentral?.idIdeaOrigen;
    setDatosArbol(prev => ({
      ...prev,
      problemaCentral: {
        id: prev?.problemaCentral?.id || 'pc',
        titulo: '',
        descripcion: '',
        categoria: '',
        origen: '',
        idIdeaOrigen: null
      }
    }));
    if (idIdeaOrigen) {
      alerta.info("Factor Desvinculado", "El problema central ha vuelto a la bandeja de factores pendientes.");
    } else {
      alerta.info("Problema Central Vaciado", "Se ha reiniciado el problema central.");
    }
  };



  // Causas separadas
  const causasDirectas = (datosArbol?.causas || []).filter(c => c.tipo === 'directa');
  const causasIndirectas = (datosArbol?.causas || []).filter(c => c.tipo === 'indirecta');

  // Efectos separados
  const efectosDirectos = (datosArbol?.efectos || []).filter(e => e.tipo === 'directo');
  const efectosIndirectos = (datosArbol?.efectos || []).filter(e => e.tipo === 'indirecto');

  // Métricas del árbol y problema central
  const totalCausas = (datosArbol?.causas || []).length;
  const totalEfectos = (datosArbol?.efectos || []).length;
  const tieneProblemaValido = Boolean(datosArbol?.problemaCentral?.titulo?.trim());

  // Validaciones para habilitar botón guardar en modales solo cuando todos los campos están rellenos
  const formularioCausaValido = Boolean(
    formCausa.titulo?.trim() &&
    formCausa.tipo?.trim() &&
    formCausa.categoria?.trim() &&
    (formCausa.categoria !== 'Otro' || formCausa.categoriaOtra?.trim())
  );

  const formularioEfectoValido = Boolean(
    formEfecto.titulo?.trim() &&
    formEfecto.tipo?.trim() &&
    formEfecto.categoria?.trim() &&
    (formEfecto.categoria !== 'Otro' || formEfecto.categoriaOtra?.trim())
  );

  const formularioProblemaValido = Boolean(
    formProblema.titulo?.trim() &&
    formProblema.categoria?.trim() &&
    (formProblema.categoria !== 'Otro' || formProblema.categoriaOtra?.trim())
  );

  return (
    <div className="arbol-problemas-container">
      {/* ESPACIO DE TRABAJO: MENÚ LATERAL A LA IZQUIERDA + ÁRBOL A LA DERECHA */}
      <div className={`arbol-workspace-grid ${bandejaColapsada ? 'tray-collapsed' : ''}`}>

        {/* ============================================================== */}
        {/* MENÚ LATERAL IZQUIERDO: BANDEJA DE INSUMOS IDÉNTICA A POAM     */}
        {/* ============================================================== */}
        <aside 
          className={`foda-left-carousel-card arbol-sidebar-tray ${bandejaColapsada ? 'colapsada' : ''}`}
          onDragOver={(e) => {
            if (draggedIdea?._origenZona) {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }
          }}
          onDrop={handleDropOnTray}
        >
          {bandejaColapsada ? (
            <div className="foda-tray-collapsed-dock">
              <button 
                type="button" 
                onClick={() => setBandejaColapsada(false)}
                className="foda-btn-icon-tool"
                title="Expandir menú lateral de insumos"
                style={{ width: '36px', height: '36px' }}
              >
                <PanelRightOpen size={18} />
              </button>
              <div className="foda-tray-collapsed-text">
                Insumos de Lluvia ({insumosDisponibles.length})
              </div>
            </div>
          ) : (
            <>
              {/* HEADER COMPACTO ESTILO POAM */}
              <div className="foda-tray-header">
                <div className="foda-tray-header-top">
                  <div className="foda-tray-counter-wrap">
                    <Layers size={16} className="foda-accent-icon" />
                    <span className="foda-tray-counter-pill">
                      {insumosPendientes.length} Pendientes
                    </span>
                  </div>
                  <div className="foda-tray-actions">
                    <button
                      type="button"
                      className="foda-btn-icon-tool"
                      onClick={desvincularTodasDeBandeja}
                      title="Regresar todas las ideas a la bandeja"
                    >
                      <RotateCcw size={13} />
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setBandejaColapsada(true)}
                      className="foda-btn-icon-tool"
                      title="Minimizar panel lateral"
                    >
                      <PanelRightClose size={15} />
                    </button>
                  </div>
                </div>

                {/* PESTAÑAS DE ORIGEN / TIPO IDÉNTICAS A POAM */}
                <div className="poam-tray-type-tabs">
                  <button
                    type="button"
                    className={`poam-tray-tab ${filtroBandeja === 'Todas' ? 'active' : ''}`}
                    onClick={() => { setFiltroBandeja('Todas'); setPaginaBandeja(1); }}
                  >
                    Todas ({insumosPendientes.length})
                  </button>
                  <button
                    type="button"
                    className={`poam-tray-tab int ${filtroBandeja === 'Internas' ? 'active' : ''}`}
                    onClick={() => { setFiltroBandeja('Internas'); setPaginaBandeja(1); }}
                  >
                    <Building2 size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                    Int ({conteoInternas})
                  </button>
                  <button
                    type="button"
                    className={`poam-tray-tab ext ${filtroBandeja === 'Externas' ? 'active' : ''}`}
                    onClick={() => { setFiltroBandeja('Externas'); setPaginaBandeja(1); }}
                  >
                    <Globe size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                    Ext ({conteoExternas})
                  </button>
                </div>

                {/* BUSCADOR DE INSUMOS */}
                <div className="poam-tray-search-input-wrap">
                  <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Buscar factor..."
                    value={busquedaBandeja}
                    onChange={(e) => { setBusquedaBandeja(e.target.value); setPaginaBandeja(1); }}
                    className="poam-tray-search-input"
                  />
                  {busquedaBandeja && (
                    <button
                      type="button"
                      onClick={() => { setBusquedaBandeja(''); setPaginaBandeja(1); }}
                      className="poam-tray-clear-search"
                      title="Limpiar búsqueda"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              </div>

              {/* LISTADO DE TARJETAS ARRASTRABLES ESTILO POAM */}
              <div className="foda-tray-cards-container arbol-tray-scroll">
                {insumosDisponibles.length === 0 ? (
                  <div className="poam-tray-empty-box" style={{ padding: '24px 12px', textAlign: 'center' }}>
                    <Info size={18} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      No tienes ideas seleccionadas en Lluvia de Ideas aún. Vuelve al Paso 2.1 para seleccionarlas.
                    </p>
                  </div>
                ) : insumosPendientes.length === 0 ? (
                  <div className="bandeja-vacia-msg poam-carrusel-completed-msg" style={{ padding: '24px 12px', textAlign: 'center' }}>
                    <CheckCircle2 size={26} style={{ color: '#10b981', margin: '0 auto 8px auto', display: 'block' }} />
                    <div>
                      <strong style={{ display: 'block', marginBottom: '4px', fontSize: '0.84rem' }}>¡Todos los factores ubicados en el Árbol!</strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Has vinculado los {insumosDisponibles.length} factores de la lluvia en causas, efectos o problema central.
                      </span>
                    </div>
                  </div>
                ) : ideasFiltradas.length === 0 ? (
                  <div className="poam-tray-empty-box" style={{ padding: '20px 10px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      No se encontraron factores con el filtro o búsqueda actual.
                    </p>
                  </div>
                ) : (
                  <div className="foda-tray-cards-viewport">
                    <div className="foda-tray-cards-list arbol-tray-cards-list">
                      {ideasPaginadas.map((idea) => {
                        const isDragging = draggedIdea?.id === idea.id;
                        return (
                          <div
                            key={idea.id}
                            className={`evidencia-draggable-card noticia-card foda-tray-card arbol-draggable-card ${isDragging ? 'is-dragging' : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, idea)}
                            onDragEnd={handleDragEnd}
                          >
                            <div className="noticia-header">
                              <div className="foda-header-tags-wrapper">
                                <div className="noticia-grip-tag">
                                  <GripVertical size={13} className="noticia-grip-icon" />
                                  <span className={`foda-origen-etiqueta ${(idea.tipoAmbito || 'Interno') === 'Interno' ? 'origen-interno' : 'origen-externo'}`}>
                                    {idea.tipoAmbito || 'Interno'}
                                  </span>
                                </div>
                                <span className="noticia-categoria-badge">
                                  {idea.categoria || 'Evidencia'}
                                </span>
                              </div>
                            </div>

                            <p className="noticia-texto-extracto">{idea.texto}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* PAGINADOR INFERIOR DE LA BANDEJA (ESTILO POAM) */}
              {ideasFiltradas.length > 0 && (
                <div className="foda-tray-paginator">
                  <button
                    type="button"
                    onClick={() => setPaginaBandeja(p => Math.max(1, p - 1))}
                    disabled={paginaActual <= 1}
                    className="foda-btn-page"
                    title="Página anterior"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="foda-paginator-text">
                    Página {paginaActual} de {totalPaginasBandeja}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPaginaBandeja(p => Math.min(totalPaginasBandeja, p + 1))}
                    disabled={paginaActual >= totalPaginasBandeja}
                    className="foda-btn-page"
                    title="Página siguiente"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </aside>

        {/* ============================================================== */}
        {/* ÁREA DERECHA: EL ÁRBOL DE PROBLEMAS (ÁRBOL LITERAL NATURAL)     */}
        {/* ============================================================== */}
        <main className="arbol-main-board-area">
          {/* BARRA SUPERIOR DE HERRAMIENTAS DEL ÁRBOL */}
          <EncabezadoHerramienta icono={TreeDeciduous} titulo="Árbol de problemas · Causas y efectos" exportando={exportandoPDF} onExportar={onExportarPDF}>
            <span className="hf-toolbar-stat">{totalCausas + totalEfectos + (tieneProblemaValido ? 1 : 0)} factores en el árbol</span>
          </EncabezadoHerramienta>

          <div className="arbol-literal-view">
            <div className="arbol-tree-structure" ref={treeContainerRef}>

                {/* SVG ILUSTRATIVO DECORATIVO DE FONDO DEL ÁRBOL DINÁMICO */}
                <div className="arbol-svg-backdrop" aria-hidden="true">
                  <svg
                    viewBox={`0 0 1200 ${svgDims.height}`}
                    preserveAspectRatio="none"
                    className="arbol-svg-canvas"
                  >
                    <defs>
                      <linearGradient id="foliageGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#34d399" stopOpacity="0.65" />
                        <stop offset="30%" stopColor="#10b981" stopOpacity="0.55" />
                        <stop offset="70%" stopColor="#059669" stopOpacity="0.65" />
                        <stop offset="100%" stopColor="#047857" stopOpacity="0.75" />
                      </linearGradient>
                      <linearGradient id="barkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#78350f" stopOpacity="0.85" />
                        <stop offset="25%" stopColor="#92400e" stopOpacity="0.75" />
                        <stop offset="50%" stopColor="#d97706" stopOpacity="0.95" />
                        <stop offset="75%" stopColor="#92400e" stopOpacity="0.75" />
                        <stop offset="100%" stopColor="#78350f" stopOpacity="0.85" />
                      </linearGradient>
                      <linearGradient id="rootsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#d97706" stopOpacity="0.90" />
                        <stop offset="40%" stopColor="#92400e" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#451a03" stopOpacity="1" />
                      </linearGradient>
                      <linearGradient id="soilStratumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#15803d" stopOpacity="0.30" />
                        <stop offset="8%" stopColor="#78350f" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#451a03" stopOpacity="0.55" />
                      </linearGradient>
                    </defs>

                    {/* ESTRATO SUBTERRÁNEO DINÁMICO */}
                    <path
                      d={`M 0,${svgDims.groundY} 
                         Q 300,${svgDims.groundY - 10} 600,${svgDims.groundY - 5} 
                         Q 900,${svgDims.groundY} 1200,${svgDims.groundY - 10} 
                         L 1200,${svgDims.height} 
                         L 0,${svgDims.height} Z`}
                      fill="url(#soilStratumGrad)"
                    />

                    {/* LÍNEA DE CÉSPED ORGÁNICO */}
                    <path
                      d={`M 0,${svgDims.groundY - 5} 
                         Q 250,${svgDims.groundY - 15} 500,${svgDims.groundY - 8} 
                         Q 600,${svgDims.groundY - 4} 700,${svgDims.groundY - 8} 
                         Q 950,${svgDims.groundY - 15} 1200,${svgDims.groundY - 5} 
                         L 1200,${svgDims.groundY + 8} 
                         Q 600,${svgDims.groundY + 12} 0,${svgDims.groundY + 8} Z`}
                      fill="#22c55e"
                      fillOpacity="0.35"
                    />

                    {/* SILUETA Y RAMAS DEL TRONCO CONECTADAS A COPA Y RAÍCES */}
                    <path
                      d={`M 500,${svgDims.groundY} 
                         Q 530,${svgDims.trunkBottom} 535,${(svgDims.trunkTop + svgDims.trunkBottom) / 2} 
                         Q 538,${svgDims.trunkTop + 20} 520,${svgDims.canopyH + 20} 
                         Q 450,${svgDims.canopyH - 10} 350,${svgDims.canopyH - 40} 
                         L 380,${svgDims.canopyH - 65} 
                         Q 490,${svgDims.canopyH - 25} 565,${svgDims.canopyH + 10} 
                         Q 590,${svgDims.canopyH - 40} 600,${svgDims.canopyH - 80} 
                         Q 610,${svgDims.canopyH - 40} 635,${svgDims.canopyH + 10} 
                         Q 710,${svgDims.canopyH - 25} 820,${svgDims.canopyH - 65} 
                         L 850,${svgDims.canopyH - 40} 
                         Q 750,${svgDims.canopyH - 10} 680,${svgDims.canopyH + 20} 
                         Q 662,${svgDims.trunkTop + 20} 665,${(svgDims.trunkTop + svgDims.trunkBottom) / 2} 
                         Q 670,${svgDims.trunkBottom} 700,${svgDims.groundY} 
                         Z`}
                      fill="url(#barkGrad)"
                      stroke="#78350f"
                      strokeWidth="4"
                      strokeOpacity="0.6"
                    />

                    {/* VETAS DE MADERA EN EL TRONCO */}
                    <path
                      d={`M 560,${svgDims.canopyH + 30} Q 570,${(svgDims.trunkTop + svgDims.trunkBottom) / 2} 568,${svgDims.groundY - 60} Q 565,${svgDims.groundY - 20} 550,${svgDims.groundY}`}
                      stroke="#d97706"
                      strokeWidth="3"
                      strokeOpacity="0.65"
                      fill="none"
                      strokeDasharray="6,4"
                    />
                    <path
                      d={`M 640,${svgDims.canopyH + 30} Q 630,${(svgDims.trunkTop + svgDims.trunkBottom) / 2} 632,${svgDims.groundY - 60} Q 635,${svgDims.groundY - 20} 650,${svgDims.groundY}`}
                      stroke="#d97706"
                      strokeWidth="3"
                      strokeOpacity="0.65"
                      fill="none"
                      strokeDasharray="6,4"
                    />
                    <path
                      d={`M 600,${svgDims.canopyH + 10} Q 598,${(svgDims.trunkTop + svgDims.trunkBottom) / 2} 600,${svgDims.groundY - 60} Q 602,${svgDims.groundY - 20} 600,${svgDims.groundY}`}
                      stroke="#92400e"
                      strokeWidth="3"
                      strokeOpacity="0.55"
                      fill="none"
                    />

                    {/* RED DE RAÍCES SUBTERRÁNEAS DINÁMICAS */}
                    {(() => {
                      const rootDepth = Math.max(svgDims.height - svgDims.groundY, 300);
                      const gy = svgDims.groundY;
                      return (
                        <g stroke="url(#rootsGrad)" fill="none" strokeLinecap="round">
                          <path
                            d={`M 600,${gy} Q 595,${gy + rootDepth * 0.25} 600,${gy + rootDepth * 0.5} Q 605,${gy + rootDepth * 0.7} 585,${gy + rootDepth * 0.92}`}
                            strokeWidth="14"
                          />
                          <path
                            d={`M 600,${gy + rootDepth * 0.4} Q 635,${gy + rootDepth * 0.6} 660,${gy + rootDepth * 0.82}`}
                            strokeWidth="9"
                          />
                          
                          <path
                            d={`M 535,${gy} Q 430,${gy + rootDepth * 0.08} 320,${gy + rootDepth * 0.18} Q 210,${gy + rootDepth * 0.3} 120,${gy + rootDepth * 0.45}`}
                            strokeWidth="12"
                          />
                          <path
                            d={`M 410,${gy + rootDepth * 0.1} Q 350,${gy + rootDepth * 0.25} 270,${gy + rootDepth * 0.45} Q 210,${gy + rootDepth * 0.65} 160,${gy + rootDepth * 0.85}`}
                            strokeWidth="9"
                          />
                          <path
                            d={`M 470,${gy + rootDepth * 0.05} Q 400,${gy + rootDepth * 0.2} 380,${gy + rootDepth * 0.45} Q 365,${gy + rootDepth * 0.68} 330,${gy + rootDepth * 0.92}`}
                            strokeWidth="8"
                          />
                          
                          <path
                            d={`M 665,${gy} Q 770,${gy + rootDepth * 0.08} 880,${gy + rootDepth * 0.18} Q 990,${gy + rootDepth * 0.3} 1080,${gy + rootDepth * 0.45}`}
                            strokeWidth="12"
                          />
                          <path
                            d={`M 790,${gy + rootDepth * 0.1} Q 850,${gy + rootDepth * 0.25} 930,${gy + rootDepth * 0.45} Q 990,${gy + rootDepth * 0.65} 1040,${gy + rootDepth * 0.85}`}
                            strokeWidth="9"
                          />
                          <path
                            d={`M 730,${gy + rootDepth * 0.05} Q 800,${gy + rootDepth * 0.2} 820,${gy + rootDepth * 0.45} Q 835,${gy + rootDepth * 0.68} 870,${gy + rootDepth * 0.92}`}
                            strokeWidth="8"
                          />
                        </g>
                      );
                    })()}

                    {/* NUBES DE FOLLAJE DE LA COPA DINÁMICAS */}
                    {(() => {
                      const ch = Math.max(svgDims.canopyH, 220);
                      const midY = ch * 0.48;
                      const spreadY = ch * 0.28;
                      const ry = Math.max(130, ch * 0.38);
                      return (
                        <g fill="url(#foliageGradLight)" stroke="#059669" strokeWidth="2.5" strokeOpacity="0.4">
                          <ellipse cx="600" cy={midY - spreadY * 0.5} rx="260" ry={ry * 0.95} />
                          <ellipse cx="600" cy={midY + spreadY * 0.4} rx="240" ry={ry * 0.9} />
                          <ellipse cx="440" cy={midY - spreadY * 0.4} rx="210" ry={ry * 0.88} />
                          <ellipse cx="760" cy={midY - spreadY * 0.4} rx="210" ry={ry * 0.88} />
                          <ellipse cx="290" cy={midY} rx="180" ry={ry * 0.82} />
                          <ellipse cx="910" cy={midY} rx="180" ry={ry * 0.82} />
                          <ellipse cx="170" cy={midY + spreadY * 0.3} rx="150" ry={ry * 0.75} />
                          <ellipse cx="1030" cy={midY + spreadY * 0.3} rx="150" ry={ry * 0.75} />
                          <ellipse cx="370" cy={midY + spreadY * 0.5} rx="190" ry={ry * 0.82} />
                          <ellipse cx="830" cy={midY + spreadY * 0.5} rx="190" ry={ry * 0.82} />
                          {ch > 360 && (
                            <>
                              <ellipse cx="500" cy={midY + spreadY * 0.85} rx="200" ry={ry * 0.75} />
                              <ellipse cx="700" cy={midY + spreadY * 0.85} rx="200" ry={ry * 0.75} />
                            </>
                          )}
                        </g>
                      );
                    })()}
                  </svg>
                </div>

                {/* ============================================================== */}
                {/* 1. COPA DEL ÁRBOL: EFECTOS Y CONSECUENCIAS (NIVEL SUPERIOR)    */}
                {/* ============================================================== */}
                <div className="arbol-canopy-section" ref={canopyRef}>
                  <div className="canopy-integrated-header">
                    <div className="tree-zone-pill pill-canopy">
                      <Leaf size={14} />
                      <span>Copa · Efectos y Consecuencias</span>
                    </div>

                    <button
                      type="button"
                      className="btn-tree-action btn-tree-efecto"
                      onClick={() => abrirCrearEfecto('')}
                      title="Añadir nuevo efecto en la copa del árbol"
                    >
                      <Plus size={14} />
                      <span>Agregar Efecto</span>
                    </button>
                  </div>

                  {/* BIFURCACIÓN DE RAMAS: EFECTOS DIRECTOS E INDIRECTOS (DROP ZONES) */}
                  <div className="canopy-boughs-grid">
                    {/* Rama Izquierda: Efectos Directos */}
                    <div
                      className={`tree-bough bough-direct ${dragOverZone === 'efecto-directo' ? 'zone-drag-over' : ''}`}
                      onDragOver={(e) => handleDragOverZone(e, 'efecto-directo')}
                      onDragLeave={(e) => handleDragLeaveZone(e, 'efecto-directo')}
                      onDrop={(e) => handleDropOnZone(e, 'efecto-directo')}
                    >
                      <div className="bough-header">
                        <div className="bough-title-box">
                          <span className="bough-leaf-icon">🍃</span>
                          <div>
                            <h4 className="bough-name">Efectos Directos</h4>
                            <span className="bough-desc">Impactos inmediatos en clientes y operaciones</span>
                          </div>
                        </div>
                        <span className="bough-counter">{efectosDirectos.length}</span>
                      </div>

                      {/* Drop Active Overlay */}
                      {dragOverZone === 'efecto-directo' && (
                        <div className="drag-zone-guide direct-effect-guide">
                          <Sparkles size={16} />
                          <span>Soltar aquí como Efecto Directo</span>
                        </div>
                      )}

                      <div className="bough-nodes-container">
                        {efectosDirectos.length === 0 ? (
                          <div className="tree-empty-card">
                            <Leaf size={18} className="empty-tree-icon" />
                            <span>Arrastra aquí un factor desde el menú lateral.</span>
                          </div>
                        ) : (
                          efectosDirectos.map(efecto => {
                            const isDragging = draggedIdea?.id === efecto.id;
                            return (
                              <div
                                key={efecto.id}
                                className={`tree-fruit-card fruit-efecto tree-draggable-node ${isDragging ? 'is-dragging' : ''}`}
                                draggable="true"
                                onDragStart={(e) => handleDragStartNodo(e, efecto, 'efecto-directo')}
                                onDragEnd={handleDragEnd}
                                onDoubleClick={() => abrirEditarEfecto(efecto)}
                                title="Arrastra para mover a otra zona del árbol • Doble clic para editar"
                              >
                                <div className="tree-card-top">
                                  <span className="nodo-badge-cat">
                                    {efecto.categoria || (efecto.severidad ? `Severidad ${efecto.severidad}` : 'General')}
                                  </span>
                                  <div className="nodo-actions">
                                    <button
                                      type="button"
                                      className="btn-node-icon btn-node-edit"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        abrirEditarEfecto(efecto);
                                      }}
                                      title="Editar efecto"
                                      aria-label="Editar efecto"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-node-icon btn-node-danger"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        eliminarEfecto(efecto.id);
                                      }}
                                      title="Quitar del árbol y volver a la bandeja de factores"
                                      aria-label="Quitar del árbol"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                                <p className="tree-card-text">{efecto.titulo}</p>
                                {efecto.descripcion && efecto.descripcion !== efecto.titulo && (
                                  <p className="tree-card-desc">{efecto.descripcion}</p>
                                )}
                                <div className="tree-card-bottom">
                                  <span className="tree-origin-pill">{efecto.origen || 'Lluvia de Ideas'}</span>
                                  <span className="tree-bough-tag">Efecto Directo</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Rama Derecha: Efectos Indirectos */}
                    <div
                      className={`tree-bough bough-indirect ${dragOverZone === 'efecto-indirecto' ? 'zone-drag-over' : ''}`}
                      onDragOver={(e) => handleDragOverZone(e, 'efecto-indirecto')}
                      onDragLeave={(e) => handleDragLeaveZone(e, 'efecto-indirecto')}
                      onDrop={(e) => handleDropOnZone(e, 'efecto-indirecto')}
                    >
                      <div className="bough-header">
                        <div className="bough-title-box">
                          <span className="bough-leaf-icon">🍂</span>
                          <div>
                            <h4 className="bough-name">Efectos Indirectos y Finales</h4>
                            <span className="bough-desc">Secuelas a largo plazo, solvencia y reputación</span>
                          </div>
                        </div>
                        <span className="bough-counter">{efectosIndirectos.length}</span>
                      </div>

                      {/* Drop Active Overlay */}
                      {dragOverZone === 'efecto-indirecto' && (
                        <div className="drag-zone-guide indirect-effect-guide">
                          <Sparkles size={16} />
                          <span>Soltar aquí como Efecto Indirecto</span>
                        </div>
                      )}

                      <div className="bough-nodes-container">
                        {efectosIndirectos.length === 0 ? (
                          <div className="tree-empty-card">
                            <Leaf size={18} className="empty-tree-icon" />
                            <span>Arrastra aquí un factor desde el menú lateral.</span>
                          </div>
                        ) : (
                          efectosIndirectos.map(efecto => {
                            const isDragging = draggedIdea?.id === efecto.id;
                            return (
                              <div
                                key={efecto.id}
                                className={`tree-fruit-card fruit-efecto tree-draggable-node ${isDragging ? 'is-dragging' : ''}`}
                                draggable="true"
                                onDragStart={(e) => handleDragStartNodo(e, efecto, 'efecto-indirecto')}
                                onDragEnd={handleDragEnd}
                                onDoubleClick={() => abrirEditarEfecto(efecto)}
                                title="Arrastra para mover a otra zona del árbol • Doble clic para editar"
                              >
                                <div className="tree-card-top">
                                  <span className="nodo-badge-cat">
                                    {efecto.categoria || (efecto.severidad ? `Severidad ${efecto.severidad}` : 'General')}
                                  </span>
                                  <div className="nodo-actions">
                                    <button
                                      type="button"
                                      className="btn-node-icon btn-node-edit"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        abrirEditarEfecto(efecto);
                                      }}
                                      title="Editar efecto"
                                      aria-label="Editar efecto"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-node-icon btn-node-danger"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        eliminarEfecto(efecto.id);
                                      }}
                                      title="Quitar del árbol y volver a la bandeja de factores"
                                      aria-label="Quitar del árbol"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                                <p className="tree-card-text">{efecto.titulo}</p>
                                {efecto.descripcion && efecto.descripcion !== efecto.titulo && (
                                  <p className="tree-card-desc">{efecto.descripcion}</p>
                                )}
                                <div className="tree-card-bottom">
                                  <span className="tree-origin-pill">{efecto.origen || 'Proyección'}</span>
                                  <span className="tree-bough-tag">Efecto Indirecto</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CONECTOR VERTICAL SAVIA (TRONCO -> COPA) */}
                <div className="tree-vertical-sap sap-upper" title="Savia ascendente: El Problema Central desata los Efectos en la Copa">
                  <div className="sap-dot" />
                  <ArrowUp size={13} className="sap-arrow" />
                  <span className="sap-label">Savia Causal</span>
                  <ArrowUp size={13} className="sap-arrow" />
                  <div className="sap-dot" />
                </div>

                {/* ============================================================== */}
                {/* 2. TRONCO DEL ÁRBOL: PROBLEMA CENTRAL (DROP ZONE)              */}
                {/* ============================================================== */}
                <div className="arbol-trunk-section" ref={trunkRef}>
                  <div className="trunk-bark-pillar">
                    <div
                      className={`tree-root-channel trunk-channel ${dragOverZone === 'tronco' ? 'zone-drag-over' : ''}`}
                      onDragOver={(e) => handleDragOverZone(e, 'tronco')}
                      onDragLeave={(e) => handleDragLeaveZone(e, 'tronco')}
                      onDrop={(e) => handleDropOnZone(e, 'tronco')}
                    >
                      <div className="channel-header">
                        <div className="channel-title-box">
                          <span className="channel-root-icon">🌳</span>
                          <div>
                            <h4 className="channel-name">Problema Central</h4>
                            <span className="channel-desc">Eje articulador del análisis</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                          <button
                            type="button"
                            className="btn-tree-action btn-tree-problema"
                            onClick={abrirEditarProblema}
                            title={tieneProblemaValido ? "Editar Problema Central" : "Añadir Problema Central"}
                          >
                            {tieneProblemaValido ? <Edit2 size={13} /> : <Plus size={13} />}
                            <span>{tieneProblemaValido ? "Editar" : "Añadir"}</span>
                          </button>
                          <span className="channel-counter">{tieneProblemaValido ? 1 : 0}</span>
                        </div>
                      </div>

                      {/* Drop Active Overlay */}
                      {dragOverZone === 'tronco' && (
                        <div className="drag-zone-guide direct-cause-guide">
                          <TreeDeciduous size={16} />
                          <span>Soltar aquí como Problema Central</span>
                        </div>
                      )}

                      <div className="channel-nodes-container">
                        {!tieneProblemaValido ? (
                          <div
                            className="tree-empty-card root-empty"
                            onClick={abrirEditarProblema}
                            style={{ cursor: 'pointer' }}
                            title="Clic para formular Problema Central"
                          >
                            <TreeDeciduous size={18} className="empty-tree-icon" />
                            <span>Arrastra aquí un factor desde el menú lateral.</span>
                          </div>
                        ) : (
                          <div
                            className={`tree-root-card root-causa trunk-card tree-draggable-node ${draggedIdea?.id === (datosArbol?.problemaCentral?.id || 'pc') ? 'is-dragging' : ''}`}
                            draggable="true"
                            onDragStart={(e) => handleDragStartNodo(e, { ...datosArbol.problemaCentral, id: datosArbol.problemaCentral.id || 'pc' }, 'tronco')}
                            onDragEnd={handleDragEnd}
                            onDoubleClick={abrirEditarProblema}
                            title="Arrastra para mover a otra zona del árbol • Doble clic para editar"
                          >
                            <div className="tree-card-top">
                              <span className="nodo-badge-cat nodo-badge-tronco">
                                {datosArbol?.problemaCentral?.categoria || 'General'}
                              </span>
                              <div className="nodo-actions">
                                <button
                                  type="button"
                                  className="btn-node-icon btn-node-edit"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    abrirEditarProblema();
                                  }}
                                  title="Editar Problema Central"
                                  aria-label="Editar Problema Central"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  type="button"
                                  className="btn-node-icon btn-node-danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    limpiarProblemaCentral();
                                  }}
                                  title="Quitar del árbol y volver a la bandeja de factores"
                                  aria-label="Quitar del árbol"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>

                            <p className="tree-card-text">{datosArbol.problemaCentral.titulo}</p>

                            {datosArbol?.problemaCentral?.descripcion && (
                              <p className="trunk-statement-desc">
                                {datosArbol.problemaCentral.descripcion}
                              </p>
                            )}

                            <div className="tree-card-bottom">
                              <span className="tree-origin-pill">{datosArbol?.problemaCentral?.origen || 'Marco Lógico'}</span>
                              <span className="tree-root-tag" style={{ color: '#d97706' }}>Problema Central</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* CONECTOR VERTICAL SAVIA (RAÍCES -> TRONCO) */}
                <div className="tree-vertical-sap sap-lower" title="Nutrición causal: Las raíces alimentan el Problema Central">
                  <div className="sap-dot" />
                  <ArrowUp size={13} className="sap-arrow" />
                  <span className="sap-label">Línea de Raíces · Nutrición del Problema</span>
                  <ArrowUp size={13} className="sap-arrow" />
                  <div className="sap-dot" />
                </div>

                {/* ============================================================== */}
                {/* 3. SISTEMA DE RAÍCES SUBTERRÁNEAS: CAUSAS RAÍZ (DROP ZONES)   */}
                {/* ============================================================== */}
                <div className="arbol-roots-section" ref={rootsRef}>
                  <div className="roots-integrated-header">
                    <div className="tree-zone-pill pill-roots">
                      <Sprout size={14} />
                      <span>Raíces · Causas del Problema</span>
                    </div>

                    <button
                      type="button"
                      className="btn-tree-action btn-tree-causa"
                      onClick={() => abrirCrearCausa('')}
                      title="Añadir nueva causa en las raíces del árbol"
                    >
                      <Plus size={14} />
                      <span>Agregar Causa</span>
                    </button>
                  </div>

                  {/* CANALES DE RAÍCES: CAUSAS DIRECTAS E INDIRECTAS (DROP ZONES) */}
                  <div className="roots-channels-grid">
                    {/* Canal Izquierdo: Causas Directas */}
                    <div
                      className={`tree-root-channel channel-direct ${dragOverZone === 'causa-directa' ? 'zone-drag-over' : ''}`}
                      onDragOver={(e) => handleDragOverZone(e, 'causa-directa')}
                      onDragLeave={(e) => handleDragLeaveZone(e, 'causa-directa')}
                      onDrop={(e) => handleDropOnZone(e, 'causa-directa')}
                    >
                      <div className="channel-header">
                        <div className="channel-title-box">
                          <span className="channel-root-icon">🪵</span>
                          <div>
                            <h4 className="channel-name">Causas Directas (Inmediatas)</h4>
                            <span className="channel-desc">Factores tangibles y visibles que provocan el problema</span>
                          </div>
                        </div>
                        <span className="channel-counter">{causasDirectas.length}</span>
                      </div>

                      {/* Drop Active Overlay */}
                      {dragOverZone === 'causa-directa' && (
                        <div className="drag-zone-guide direct-cause-guide">
                          <Sprout size={16} />
                          <span>Soltar aquí como Causa Directa</span>
                        </div>
                      )}

                      <div className="channel-nodes-container">
                        {causasDirectas.length === 0 ? (
                          <div className="tree-empty-card root-empty">
                            <Sprout size={18} className="empty-tree-icon" />
                            <span>Arrastra aquí un factor desde el menú lateral.</span>
                          </div>
                        ) : (
                          causasDirectas.map(causa => {
                            const isDragging = draggedIdea?.id === causa.id;
                            return (
                              <div
                                key={causa.id}
                                className={`tree-root-card root-causa tree-draggable-node ${isDragging ? 'is-dragging' : ''}`}
                                draggable="true"
                                onDragStart={(e) => handleDragStartNodo(e, causa, 'causa-directa')}
                                onDragEnd={handleDragEnd}
                                onDoubleClick={() => abrirEditarCausa(causa)}
                                title="Arrastra para mover a otra zona del árbol • Doble clic para editar"
                              >
                                <div className="tree-card-top">
                                  <span className="nodo-badge-cat">{causa.categoria || 'Operativa'}</span>
                                  <div className="nodo-actions">
                                    <button
                                      type="button"
                                      className="btn-node-icon btn-node-edit"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        abrirEditarCausa(causa);
                                      }}
                                      title="Editar causa"
                                      aria-label="Editar causa"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-node-icon btn-node-danger"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        eliminarCausa(causa.id);
                                      }}
                                      title="Quitar del árbol y volver a la bandeja de factores"
                                      aria-label="Quitar del árbol"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                                <p className="tree-card-text">{causa.titulo}</p>
                                {causa.descripcion && causa.descripcion !== causa.titulo && (
                                  <p className="tree-card-desc">{causa.descripcion}</p>
                                )}
                                <div className="tree-card-bottom">
                                  <span className="tree-origin-pill">{causa.origen || 'Lluvia de Ideas'}</span>
                                  <span className="tree-root-tag">Causa Directa</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Canal Derecho: Causas Indirectas / Estructurales */}
                    <div
                      className={`tree-root-channel channel-indirect ${dragOverZone === 'causa-indirecta' ? 'zone-drag-over' : ''}`}
                      onDragOver={(e) => handleDragOverZone(e, 'causa-indirecta')}
                      onDragLeave={(e) => handleDragLeaveZone(e, 'causa-indirecta')}
                      onDrop={(e) => handleDropOnZone(e, 'causa-indirecta')}
                    >
                      <div className="channel-header">
                        <div className="channel-title-box">
                          <span className="channel-root-icon">🌰</span>
                          <div>
                            <h4 className="channel-name">Causas Indirectas (Estructurales)</h4>
                            <span className="channel-desc">Razones de fondo o subcausas que originan las causas directas</span>
                          </div>
                        </div>
                        <span className="channel-counter">{causasIndirectas.length}</span>
                      </div>

                      {/* Drop Active Overlay */}
                      {dragOverZone === 'causa-indirecta' && (
                        <div className="drag-zone-guide indirect-cause-guide">
                          <Layers size={16} />
                          <span>Soltar aquí como Causa Indirecta</span>
                        </div>
                      )}

                      <div className="channel-nodes-container">
                        {causasIndirectas.length === 0 ? (
                          <div className="tree-empty-card root-empty">
                            <Layers size={18} className="empty-tree-icon" />
                            <span>Arrastra aquí un factor desde el menú lateral.</span>
                          </div>
                        ) : (
                          causasIndirectas.map(causa => {
                            const isDragging = draggedIdea?.id === causa.id;
                            return (
                              <div
                                key={causa.id}
                                className={`tree-root-card root-causa tree-draggable-node ${isDragging ? 'is-dragging' : ''}`}
                                draggable="true"
                                onDragStart={(e) => handleDragStartNodo(e, causa, 'causa-indirecta')}
                                onDragEnd={handleDragEnd}
                                onDoubleClick={() => abrirEditarCausa(causa)}
                                title="Arrastra para mover a otra zona del árbol • Doble clic para editar"
                              >
                                <div className="tree-card-top">
                                  <span className="nodo-badge-cat">{causa.categoria || 'Estructural'}</span>
                                  <div className="nodo-actions">
                                    <button
                                      type="button"
                                      className="btn-node-icon btn-node-edit"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        abrirEditarCausa(causa);
                                      }}
                                      title="Editar causa"
                                      aria-label="Editar causa"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-node-icon btn-node-danger"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        eliminarCausa(causa.id);
                                      }}
                                      title="Quitar del árbol y volver a la bandeja de factores"
                                      aria-label="Quitar del árbol"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
                                <p className="tree-card-text">{causa.titulo}</p>
                                {causa.descripcion && causa.descripcion !== causa.titulo && (
                                  <p className="tree-card-desc">{causa.descripcion}</p>
                                )}
                                <div className="tree-card-bottom">
                                  <span className="tree-origin-pill">{causa.origen || 'Diagnóstico'}</span>
                                  <span className="tree-root-tag">Causa Indirecta</span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
        </main>
      </div>

      {/* 4. FOOTER DE NAVEGACIÓN LIMPIO */}
      <RespaldoHerramienta id="arbol"/>
      <PieNavegacion onAnterior={onVolverALluvia} onSiguiente={onContinuarAPorter} idSiguiente="btn-continuar-fase3-desde-arbol"/>

      {/* ================================================================ */}
      {/* MODAL 1: AGREGAR / EDITAR CAUSA                                  */}
      {/* ================================================================ */}
      {modalCausaAbierto && createPortal(
        <div
          className="lluvia-modal-overlay animate-fade-in"
          onClick={() => setModalCausaAbierto(false)}
        >
          <div
            className="lluvia-modal-box animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="lluvia-modal-header">
              <div className="lluvia-modal-header-left">
                <div className="lluvia-modal-icon-badge">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="lluvia-modal-title">
                    {causaEnEdicion ? 'Editar Causa Raíz' : 'Nueva Causa Raíz'}
                  </h3>
                  <p className="lluvia-modal-subtitle">
                    Identifica la causa directa o subcausa que origina el problema.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="lluvia-modal-close-btn"
                onClick={() => setModalCausaAbierto(false)}
                title="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={guardarCausa} className="lluvia-modal-form">
              <div className="lluvia-modal-field">
                <label className="lluvia-modal-label">Enunciado o Hecho Causal *</label>
                <textarea
                  className="lluvia-modal-textarea"
                  rows={3}
                  value={formCausa.titulo}
                  onChange={e => setFormCausa({ ...formCausa, titulo: e.target.value })}
                  placeholder="Describe la causa raíz o factor que origina el problema..."
                  required
                />
              </div>

              <div className="lluvia-modal-grid-fields">
                <div className="lluvia-modal-field">
                  <label className="lluvia-modal-label">Tipo de Causa: *</label>
                  <select
                    className="lluvia-modal-select"
                    value={formCausa.tipo}
                    onChange={e => setFormCausa({ ...formCausa, tipo: e.target.value })}
                    required
                  >
                    <option value="">-- Seleccionar Tipo de Causa --</option>
                    <option value="directa">Causa Directa (Inmediata)</option>
                    <option value="indirecta">Causa Indirecta (Estructural / Subcausa)</option>
                  </select>
                </div>

                <div className="lluvia-modal-field">
                  <label className="lluvia-modal-label">Área / Categoría: *</label>
                  <select
                    className="lluvia-modal-select"
                    value={formCausa.categoria}
                    onChange={e => setFormCausa({ ...formCausa, categoria: e.target.value })}
                    required
                  >
                    <option value="">-- Seleccionar Área / Categoría --</option>
                    {OPCIONES_AREA_CATEGORIA.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {formCausa.categoria === 'Otro' && (
                    <input
                      type="text"
                      className="lluvia-modal-input"
                      style={{ marginTop: '8px' }}
                      placeholder="Especifica el área o categoría..."
                      value={formCausa.categoriaOtra}
                      onChange={e => setFormCausa({ ...formCausa, categoriaOtra: e.target.value })}
                      required
                      autoFocus
                    />
                  )}
                </div>
              </div>

              <div className="lluvia-modal-footer">
                <button
                  type="button"
                  className="lluvia-modal-btn-cancel"
                  onClick={() => setModalCausaAbierto(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="lluvia-modal-btn-submit"
                  disabled={!formularioCausaValido}
                  title={!formularioCausaValido ? "Completa todos los campos requeridos para guardar" : ""}
                >
                  <Check size={16} />
                  <span>{causaEnEdicion ? 'Actualizar Causa' : 'Guardar Causa'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ================================================================ */}
      {/* MODAL 2: AGREGAR / EDITAR EFECTO                                 */}
      {/* ================================================================ */}
      {modalEfectoAbierto && createPortal(
        <div
          className="lluvia-modal-overlay animate-fade-in"
          onClick={() => setModalEfectoAbierto(false)}
        >
          <div
            className="lluvia-modal-box animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="lluvia-modal-header">
              <div className="lluvia-modal-header-left">
                <div className="lluvia-modal-icon-badge">
                  <TrendingDown size={20} />
                </div>
                <div>
                  <h3 className="lluvia-modal-title">
                    {efectoEnEdicion ? 'Editar Efecto o Consecuencia' : 'Nuevo Efecto o Consecuencia'}
                  </h3>
                  <p className="lluvia-modal-subtitle">
                    Registra un impacto directo o indirecto provocado por el problema central.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="lluvia-modal-close-btn"
                onClick={() => setModalEfectoAbierto(false)}
                title="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={guardarEfecto} className="lluvia-modal-form">
              <div className="lluvia-modal-field">
                <label className="lluvia-modal-label">Descripción del Efecto *</label>
                <textarea
                  className="lluvia-modal-textarea"
                  rows={3}
                  value={formEfecto.titulo}
                  onChange={e => setFormEfecto({ ...formEfecto, titulo: e.target.value })}
                  placeholder="Describe el efecto o consecuencia resultante del problema..."
                  required
                />
              </div>

              <div className="lluvia-modal-grid-fields">
                <div className="lluvia-modal-field">
                  <label className="lluvia-modal-label">Tipo de Efecto: *</label>
                  <select
                    className="lluvia-modal-select"
                    value={formEfecto.tipo}
                    onChange={e => setFormEfecto({ ...formEfecto, tipo: e.target.value })}
                    required
                  >
                    <option value="">-- Seleccionar Tipo de Efecto --</option>
                    <option value="directo">Efecto Directo (Inmediato)</option>
                    <option value="indirecto">Efecto Indirecto (Largo Plazo / Final)</option>
                  </select>
                </div>

                <div className="lluvia-modal-field">
                  <label className="lluvia-modal-label">Área / Categoría: *</label>
                  <select
                    className="lluvia-modal-select"
                    value={formEfecto.categoria}
                    onChange={e => setFormEfecto({ ...formEfecto, categoria: e.target.value })}
                    required
                  >
                    <option value="">-- Seleccionar Área / Categoría --</option>
                    {OPCIONES_AREA_CATEGORIA.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {formEfecto.categoria === 'Otro' && (
                    <input
                      type="text"
                      className="lluvia-modal-input"
                      style={{ marginTop: '8px' }}
                      placeholder="Especifica el área o categoría..."
                      value={formEfecto.categoriaOtra}
                      onChange={e => setFormEfecto({ ...formEfecto, categoriaOtra: e.target.value })}
                      required
                      autoFocus
                    />
                  )}
                </div>
              </div>

              <div className="lluvia-modal-footer">
                <button
                  type="button"
                  className="lluvia-modal-btn-cancel"
                  onClick={() => setModalEfectoAbierto(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="lluvia-modal-btn-submit"
                  disabled={!formularioEfectoValido}
                  title={!formularioEfectoValido ? "Completa todos los campos requeridos para guardar" : ""}
                >
                  <Check size={16} />
                  <span>{efectoEnEdicion ? 'Actualizar Efecto' : 'Guardar Efecto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ================================================================ */}
      {/* MODAL 3: REFORMULAR PROBLEMA CENTRAL                             */}
      {/* ================================================================ */}
      {modalProblemaAbierto && createPortal(
        <div
          className="lluvia-modal-overlay animate-fade-in"
          onClick={() => setModalProblemaAbierto(false)}
        >
          <div
            className="lluvia-modal-box animate-scale-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="lluvia-modal-header">
              <div className="lluvia-modal-header-left">
                <div className="lluvia-modal-icon-badge">
                  <TreeDeciduous size={20} />
                </div>
                <div>
                  <h3 className="lluvia-modal-title">
                    Formulación del Problema Central
                  </h3>
                  <p className="lluvia-modal-subtitle">
                    Define el eje central que articula las causas y sus consecuencias.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="lluvia-modal-close-btn"
                onClick={() => setModalProblemaAbierto(false)}
                title="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={guardarProblemaCentral} className="lluvia-modal-form">
              <div className="lluvia-modal-field">
                <label className="lluvia-modal-label">Enunciado del Problema Central *</label>
                <textarea
                  className="lluvia-modal-textarea"
                  rows={3}
                  value={formProblema.titulo}
                  onChange={e => setFormProblema({ ...formProblema, titulo: e.target.value })}
                  placeholder="Describe el problema central identificado en el diagnóstico..."
                  required
                />
                <span className="lluvia-modal-hint">
                  Consejo metodológico: Evita formular soluciones encubiertas (ej. "Falta de..."). Enfócate en el estado negativo real a resolver.
                </span>
              </div>

              <div className="lluvia-modal-field">
                <label className="lluvia-modal-label">Área / Categoría: *</label>
                <select
                  className="lluvia-modal-select"
                  value={formProblema.categoria}
                  onChange={e => setFormProblema({ ...formProblema, categoria: e.target.value })}
                  required
                >
                  <option value="">-- Seleccionar Área / Categoría --</option>
                  {OPCIONES_AREA_CATEGORIA.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {formProblema.categoria === 'Otro' && (
                  <input
                    type="text"
                    className="lluvia-modal-input"
                    style={{ marginTop: '8px' }}
                    placeholder="Especifica el área o categoría..."
                    value={formProblema.categoriaOtra}
                    onChange={e => setFormProblema({ ...formProblema, categoriaOtra: e.target.value })}
                    required
                    autoFocus
                  />
                )}
              </div>

              <div className="lluvia-modal-footer">
                <button
                  type="button"
                  className="lluvia-modal-btn-cancel"
                  onClick={() => setModalProblemaAbierto(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="lluvia-modal-btn-submit"
                  disabled={!formularioProblemaValido}
                  title={!formularioProblemaValido ? "Completa todos los campos requeridos para guardar" : ""}
                >
                  <Check size={16} />
                  <span>Guardar Problema Central</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
