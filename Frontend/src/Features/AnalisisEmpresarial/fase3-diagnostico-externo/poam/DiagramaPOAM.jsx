import React, { useState, useMemo, useEffect } from 'react';
import RespaldoHerramienta from '../../compartido/documentos/RespaldoHerramienta';
import PieNavegacion from '../../simulacion/PieNavegacion';
import { EncabezadoHerramienta } from '../../compartido/ComponentesHerramienta';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createPortal } from 'react-dom';
import {
  Target,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Sliders,
  MapPin,
  Check,
  CheckCircle2,
  Layers,
  Scale,
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  BookOpen,
  RotateCcw,
  Settings2,
  FileText,
  Clock,
  Compass,
  PanelRightClose,
  PanelRightOpen,
  Wind,
  CloudLightning,
  Paperclip,
  Trash2,
  Image,
  FileSpreadsheet,
  Link2,
  UploadCloud,
  ExternalLink,
  Plus
} from 'lucide-react';
import { alerta } from '../../../../utils/Notificaciones';
import {
  DIMENSIONES_POAM,
  normalizarCategoriaPoam,
  obtenerSubdivisionesPorDimension,
  resolverDimensionPestel,
  resolverSubdivisionRadar
} from './datosPoam';
import './DiagramaPOAM.css';
import ReportePdfPoam from './ReportePdfPoam';
import '../../compartido/estilos/EstilosReportePdf.css';

export default function DiagramaPOAM({
  casoActivo,
  factoresPoam = [],
  setFactoresPoam,
  datosPestel,
  ideasLluvia = [],
  onSincronizarFoda,
  onIrAFoda,
  onIrAEfi,
  onIrAPorter,
}) {
  const [exportandoPDF, setExportandoPDF] = useState(false);
  const reportePDFRef = React.useRef(null);
  const exportarPDF = async () => {
    if (exportandoPDF) return;
    const paginas = reportePDFRef.current?.querySelectorAll('.poam-pdf-page');
    if (!paginas?.length) return;
    setExportandoPDF(true);
    try {
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth() - 8;
      const pageHeight = pdf.internal.pageSize.getHeight() - 8;
      for (const [index, pagina] of Array.from(paginas).entries()) {
        const canvas = await html2canvas(pagina, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff', windowWidth: 1120 });
        if (index > 0) pdf.addPage();
        const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
        const width = canvas.width * ratio;
        const height = canvas.height * ratio;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', (pdf.internal.pageSize.getWidth() - width) / 2, 4, width, height, undefined, 'FAST');
      }
      const nombre = (casoActivo?.nombre || casoActivo?.titulo || 'Caso').replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`Reporte_Matriz_POAM_${nombre}_${new Date().toISOString().slice(0, 10)}.pdf`);
      alerta.exito('PDF Descargado', 'La matriz tabular POAM se exportó correctamente.');
    } catch (error) {
      console.error('Error al exportar POAM a PDF:', error);
      alerta.error('Error al exportar', 'No se pudo generar el documento PDF.');
    } finally {
      setExportandoPDF(false);
    }
  };
  // Modo de visualización: 'radar' (Radar Táctico Concéntrico) o 'matriz' (Matriz Tabular Cuantitativa)
  const [vistaActiva, setVistaActiva] = useState('radar'); // 'radar' | 'matriz'

  // Filtros de navegación
  const [filtroDimension, setFiltroDimension] = useState('Todas');
  const [filtroSubdivision, setFiltroSubdivision] = useState('Todas');
  const [filtroTipo, setFiltroTipo] = useState('Todos'); // 'Todos' | 'Oportunidad' | 'Amenaza'
  const [busqueda, setBusqueda] = useState('');

  const [modalBalanzaAbierta, setModalBalanzaAbierta] = useState(false);
  const [factorSeleccionadoId, setFactorSeleccionadoId] = useState(null);
  const [factorConfigurandoId, setFactorConfigurandoId] = useState(null);
  const [borradorConfig, setBorradorConfig] = useState(null);
  const [hoveredFactorId, setHoveredFactorId] = useState(null);

  // Modal de Evidencia Documental por Factor (.pdf, imágenes, hojas de cálculo, enlace web)
  const [modalAdjuntos, setModalAdjuntos] = useState({
    abierto: false,
    factorId: null,
    factorTexto: '',
    dimensionNombre: ''
  });
  const [tabTipoAdjunto, setTabTipoAdjunto] = useState('pdf'); // 'pdf' | 'imagen' | 'hoja_calculo' | 'enlace'
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [nombreArchivoInput, setNombreArchivoInput] = useState('');
  const [urlEnlaceInput, setUrlEnlaceInput] = useState('');
  const [tituloEnlaceInput, setTituloEnlaceInput] = useState('');

  // Factor actualmente abierto en el Modal de Configuración (derivado reactivamente)
  const factorConfigurando = useMemo(() => {
    if (!factorConfigurandoId) return null;
    return (factoresPoam || []).find(f => f.id === factorConfigurandoId) || null;
  }, [factoresPoam, factorConfigurandoId]);

  // Al abrir el modal, inicializamos el borrador local sin tocar factoresPoam hasta confirmar ubicación
  useEffect(() => {
    if (factorConfigurandoId) {
      const fOriginal = (factoresPoam || []).find(f => f.id === factorConfigurandoId);
      if (fOriginal) {
        const catFija = normalizarCategoriaPoam(fOriginal.categoria) || resolverDimensionPestel(fOriginal, datosPestel, ideasLluvia);
        setBorradorConfig({
          ...fOriginal,
          categoria: catFija,
          subdivision: fOriginal.subdivision || '',
          tipo: fOriginal.tipo || 'Oportunidad',
          impacto: '',
          calificacion: '',
          impactoConfiguradoPOAM: false,
          justificacion: fOriginal.justificacion !== undefined ? fOriginal.justificacion : (fOriginal.justificacionOriginal || '')
        });
      }
    } else {
      setBorradorConfig(null);
    }
  }, [factorConfigurandoId]);

  const factorParaModal = borradorConfig || factorConfigurando;

  // Validación metodológica: Verifica si todos los campos requeridos están seleccionados en el borrador
  const { tieneDimension, tieneSubdivision, tieneTipo, tieneImpacto, camposCompletosModal } = useMemo(() => {
    if (!factorParaModal) {
      return { tieneDimension: false, tieneSubdivision: false, tieneTipo: false, tieneImpacto: false, camposCompletosModal: false };
    }
    const catNorm = normalizarCategoriaPoam(factorParaModal.categoria) || resolverDimensionPestel(factorParaModal, datosPestel, ideasLluvia);
    const tieneDim = Boolean(catNorm && DIMENSIONES_POAM.some(d => d.id === catNorm));
    const subdivsValidas = obtenerSubdivisionesPorDimension(catNorm);
    const subRadar = factorParaModal.subdivisionRadar || resolverSubdivisionRadar(factorParaModal, catNorm);
    const tieneSub = Boolean(factorParaModal.subdivision?.trim() && subdivsValidas.some(s => s.nombre === subRadar));
    const tieneTip = Boolean(factorParaModal.tipo === 'Oportunidad' || factorParaModal.tipo === 'Amenaza');
    const tieneImp = Boolean(factorParaModal.impactoConfiguradoPOAM && ['Bajo', 'Medio', 'Alto'].includes(factorParaModal.impacto));
    return {
      tieneDimension: tieneDim,
      tieneSubdivision: tieneSub,
      tieneTipo: tieneTip,
      tieneImpacto: tieneImp,
      camposCompletosModal: tieneDim && tieneSub && tieneTip && tieneImp
    };
  }, [factorParaModal, datosPestel, ideasLluvia]);
  const metadatosCompletosModal = tieneDimension && tieneSubdivision && tieneTipo;

  // Estados para la ubicación manual de factores en el radar (Drag & Drop y Click)
  const [factorArrastrandoId, setFactorArrastrandoId] = useState(null);
  const [zonaHoverRadar, setZonaHoverRadar] = useState(null);
  const [filtroTipoPendientes, setFiltroTipoPendientes] = useState('Todos');
  const [busquedaPendientes, setBusquedaPendientes] = useState('');
  const [paginaBandeja, setPaginaBandeja] = useState(1);
  const [bandejaColapsada, setBandejaColapsada] = useState(false);
  const svgRadarRef = React.useRef(null);
  const dragNodoRef = React.useRef(null);
  const justDraggedRef = React.useRef(false);


  // Asegurar que cada factor tenga su dimensión fijada por PESTEL, tagOrigen, subdivisión y estado de ubicadoEnRadar
  useEffect(() => {
    if (!factoresPoam || factoresPoam.length === 0) return;

    let requiereAjuste = false;
    const factoresAjustados = factoresPoam.map(item => {
      let modificado = false;
      let tagOrigen = item.tagOrigen;
      if (!tagOrigen) {
        if (item.origenPorter || item.categoria === 'Competitivos' || item.fuente?.includes('Porter')) {
          tagOrigen = '[Micro: Porter]';
        } else {
          tagOrigen = '[Macro: PESTEL]';
        }
        modificado = true;
      }

      // La dimensión en POAM para cada factor está definida por PESTEL
      const catPestel = resolverDimensionPestel(item, datosPestel, ideasLluvia);
      let catNorm = item.categoria ? normalizarCategoriaPoam(item.categoria) : catPestel;
      if (catPestel && catNorm !== catPestel) {
        catNorm = catPestel;
        modificado = true;
      } else if (!catNorm) {
        catNorm = catPestel || 'Económica';
        modificado = true;
      }

      const subdivision = item.subdivision || '';
      const subdivisionRadar = obtenerSubdivisionesPorDimension(catNorm).some(s => s.nombre === item.subdivisionRadar)
        ? item.subdivisionRadar
        : resolverSubdivisionRadar(item, catNorm);
      if (subdivisionRadar !== item.subdivisionRadar) modificado = true;

      let ubicadoEnRadar = item.ubicadoEnRadar;
      if (ubicadoEnRadar === undefined) {
        ubicadoEnRadar = false;
        modificado = true;
      }

      const tipoOriginal = item.tipoOriginal || item.tipo || 'Oportunidad';
      const justificacionOriginal = item.justificacionOriginal !== undefined ? item.justificacionOriginal : (item.justificacion || '');
      if (item.tipoOriginal === undefined || item.justificacionOriginal === undefined) {
        modificado = true;
      }

      if (modificado) {
        requiereAjuste = true;
        return {
          ...item,
          tagOrigen,
          categoria: catNorm,
          subdivision,
          subdivisionRadar,
          ubicadoEnRadar,
          tipoOriginal,
          justificacionOriginal
        };
      }
      return item;
    });

    if (requiereAjuste) {
      setFactoresPoam(factoresAjustados);
    }
  }, [factoresPoam, setFactoresPoam]);


  // Funciones de ponderación numérica (Alto = 3 pts, Medio = 2 pts, Bajo = 1 pt)
  const valorCalificacion = (cal) => {
    if (typeof cal === 'number') return cal;
    if (!cal) return 2;
    const str = String(cal).trim().toLowerCase();
    if (str.startsWith('alt') || str === '3' || str === 'a') return 3;
    if (str.startsWith('med') || str === '2' || str === 'm') return 2;
    if (str.startsWith('baj') || str === '1' || str === 'b') return 1;
    return 2;
  };


  // =========================================================================
  // CÁLCULOS METODOLÓGICOS DEL POAM Y BALANZA DE PRESIÓN (TUG OF WAR)
  // =========================================================================
  const metricas = useMemo(() => {
    let masaOportunidades = 0;
    let masaAmenazas = 0;
    let countOportunidades = 0;
    let countAmenazas = 0;
    let criticosNucleo = 0; // Impacto Alto
    let criticosPorter = 0; // Amenazas críticas en Competitivos
    let conJustificacion = 0;

    const conteoPorDimension = {};
    DIMENSIONES_POAM.forEach(dim => {
      conteoPorDimension[dim.id] = {
        total: 0,
        oportunidades: 0,
        amenazas: 0,
        masaOp: 0,
        masaAm: 0,
        criticos: 0
      };
    });

    factoresPoam.forEach(item => {
      if (item.justificacion && item.justificacion.trim().length > 10) {
        conJustificacion += 1;
      }

      if (!item.ubicadoEnRadar) return; // Sólo calcular balance para los ubicados en el radar

      // Puntos directos del factor según calificación/impacto (Bajo: 1 pt, Medio: 2 pts, Alto: 3 pts)
      const ptsFactor = valorCalificacion(item.calificacion || item.impacto);

      const catNorm = normalizarCategoriaPoam(item.categoria);
      if (!conteoPorDimension[catNorm]) {
        conteoPorDimension[catNorm] = {
          total: 0,
          oportunidades: 0,
          amenazas: 0,
          masaOp: 0,
          masaAm: 0,
          criticos: 0
        };
      }

      conteoPorDimension[catNorm].total += 1;

      const esCritico = (item.impacto && String(item.impacto).toLowerCase().startsWith('alt')) ||
                        (item.calificacion && String(item.calificacion).toLowerCase().startsWith('alt'));
      if (esCritico) {
        criticosNucleo += 1;
        conteoPorDimension[catNorm].criticos += 1;
        if ((item.origenPorter || catNorm === 'Competitivos') && item.tipo === 'Amenaza') {
          criticosPorter += 1;
        }
      }

      if (item.tipo === 'Oportunidad') {
        countOportunidades += 1;
        masaOportunidades += ptsFactor;
        conteoPorDimension[catNorm].oportunidades += 1;
        conteoPorDimension[catNorm].masaOp += ptsFactor;
      } else {
        countAmenazas += 1;
        masaAmenazas += ptsFactor;
        conteoPorDimension[catNorm].amenazas += 1;
        conteoPorDimension[catNorm].masaAm += ptsFactor;
      }
    });

    const masaTotal = masaOportunidades + masaAmenazas;
    const deltaMasa = masaOportunidades - masaAmenazas; // Positivo: Oportunidades dominan

    // Porcentajes de masa
    const pctMasaOp = masaTotal > 0 ? Math.round((masaOportunidades / masaTotal) * 100) : 50;
    const pctMasaAm = masaTotal > 0 ? Math.round((masaAmenazas / masaTotal) * 100) : 50;

    // Inclinación física de la Balanza tradicional de platillos (-15° a +15°)
    // Negativo: Oportunidades pesan más (platillo izquierdo desciende por gravedad)
    // Positivo: Amenazas pesan más (platillo derecho desciende por gravedad)
    let anguloBalanza = 0;
    let anguloAguja = 0;
    if (masaTotal > 0) {
      const ratio = deltaMasa / masaTotal;
      anguloBalanza = Math.max(-15, Math.min(15, -Math.round(ratio * 24)));
      const ratioAguja = (masaAmenazas - masaOportunidades) / masaTotal;
      anguloAguja = Math.max(-48, Math.min(48, Math.round(ratioAguja * 45)));
    }

    // Diagnóstico del Clima Exterior según Tug of War (Umbrales: +2, -2)
    let clima = {
      tipo: 'incierto',
      titulo: 'Entorno en Equilibrio / Incierto',
      subtitulo: 'Tensión balanceada entre fuerzas impulsoras y restrictivas.',
      descripcion: 'Las fuerzas positivas y negativas se neutralizan. El éxito o fracaso depende estrictamente de las fortalezas internas de la empresa.',
      icono: Scale,
      claseColor: 'clima-equilibrio',
      colorHex: '#f59e0b'
    };

    if (deltaMasa >= 2) {
      clima = {
        tipo: 'favorable',
        titulo: 'Entorno Favorable / Atractivo',
        subtitulo: 'El mercado ofrece viento a favor para crecer.',
        descripcion: 'Las oportunidades superan con claridad a las amenazas. Postura Ofensiva: Expandir canales, captar nuevos clientes e invertir en capacidad.',
        icono: Wind,
        claseColor: 'clima-favorable',
        colorHex: '#10b981'
      };
    } else if (deltaMasa <= -2) {
      clima = {
        tipo: 'hostil',
        titulo: 'Entorno Hostil / Amenazante',
        subtitulo: 'Fuerte presión externa con amenazas severas sobre la rentabilidad.',
        descripcion: 'Las amenazas dominan el medio ambiente. Postura Defensiva: Optimizar costos, proteger liquidez de caja y retener a clientes leales.',
        icono: CloudLightning,
        claseColor: 'clima-hostil',
        colorHex: '#ef4444'
      };
    }

    // Auditoría de importación
    const factoresPorterImportados = factoresPoam.filter(f => f.origenPorter || f.tagOrigen === '[Micro: Porter]').length;
    const factoresPestImportados = factoresPoam.filter(f => f.origenPest || f.tagOrigen === '[Macro: PEST]').length;
    const porterCompleto = factoresPorterImportados >= 5;
    const pestCompleto = factoresPestImportados >= 3;
    const pctJustificados = factoresPoam.length > 0 ? Math.round((conJustificacion / factoresPoam.length) * 100) : 0;

    return {
      total: factoresPoam.length,
      countOportunidades,
      countAmenazas,
      masaOportunidades,
      masaAmenazas,
      masaTotal,
      deltaMasa,
      pctMasaOp,
      pctMasaAm,
      anguloAguja,
      anguloBalanza,
      clima,
      criticosNucleo,
      criticosPorter,
      conteoPorDimension,
      porterCompleto,
      pestCompleto,
      pctJustificados,
      factoresPorterImportados,
      factoresPestImportados
    };
  }, [factoresPoam]);




  // Filtrado de factores para la visualización
  const factoresFiltrados = useMemo(() => {
    return factoresPoam.filter(item => {
      const catNorm = normalizarCategoriaPoam(item.categoria);
      const matchDim = filtroDimension === 'Todas' || catNorm === filtroDimension;
      const matchSub = filtroSubdivision === 'Todas' || item.subdivision === filtroSubdivision;
      const matchTipo = filtroTipo === 'Todos' || item.tipo === filtroTipo;
      const matchBusqueda = !busqueda.trim() ||
        ((item.factor || '').toLowerCase().includes(busqueda.toLowerCase())) ||
        (item.subdivision && item.subdivision.toLowerCase().includes(busqueda.toLowerCase())) ||
        (item.justificacion && item.justificacion.toLowerCase().includes(busqueda.toLowerCase())) ||
        (item.fuente && item.fuente.toLowerCase().includes(busqueda.toLowerCase()));
      return matchDim && matchSub && matchTipo && matchBusqueda;
    });
  }, [factoresPoam, filtroDimension, filtroSubdivision, filtroTipo, busqueda]);

  // =========================================================================
  // COORDENADAS RADIALES DEL RADAR TÁCTICO (5 SECTORES x 3 ANILLOS)
  // =========================================================================
  const radioCentroX = 300;
  const radioCentroY = 300;
  const radioNucleoAlto = 60;   // Núcleo central (Zona Crítica: Impacto Alto)
  const radioAnilloMedio = 125;  // Anillo Medio (Impacto Medio)
  const radioAnilloBajo = 190;   // Anillo Exterior (Impacto Bajo)
  const radioBaseRadar = 218;    // Límite exterior del disco del radar
  const radioEtiquetasDim = 258; // Radio de las etiquetas de dimensión

  // Factores divididos entre ubicados en radar y pendientes en la bandeja
  const factoresEnRadar = useMemo(() => {
    return (factoresPoam || []).filter(f => f.ubicadoEnRadar === true);
  }, [factoresPoam]);

  useEffect(() => {
    if (factorSeleccionadoId && !factoresPoam.some(factor => factor.id === factorSeleccionadoId)) {
      setFactorSeleccionadoId(null);
    }
  }, [factoresPoam, factorSeleccionadoId]);

  const factoresPendientes = useMemo(() => {
    return (factoresPoam || []).filter(f => !f.ubicadoEnRadar);
  }, [factoresPoam]);

  const conteoOpPendientes = useMemo(() => {
    return factoresPendientes.filter(f => f.tipo === 'Oportunidad').length;
  }, [factoresPendientes]);

  const conteoAmPendientes = useMemo(() => {
    return factoresPendientes.filter(f => f.tipo === 'Amenaza').length;
  }, [factoresPendientes]);

  const restablecerTodosABandeja = () => {
    setFactoresPoam(prev => prev.map(f => {
      let tipoInicial = f.tipoOriginal || f.tipo;
      if (f.origenPorter && f.nivelFuerza) {
        tipoInicial = (f.nivelFuerza === 'Alta' || f.nivelFuerza === 'Media') ? 'Amenaza' : 'Oportunidad';
      }
      const justInicial = f.justificacionOriginal !== undefined ? f.justificacionOriginal : (f.justificacion || '');
      const catPestel = resolverDimensionPestel(f, datosPestel, ideasLluvia);
      return {
        ...f,
        ubicadoEnRadar: false,
        categoria: catPestel || normalizarCategoriaPoam(f.categoria) || 'Económica',
        subdivision: f.subdivision,
        subdivisionRadar: f.subdivisionRadar || resolverSubdivisionRadar(f, catPestel || f.categoria),
        impacto: '',
        calificacion: '',
        impactoConfiguradoPOAM: false,
        tipo: tipoInicial,
        justificacion: justInicial,
        xRadar: undefined,
        yRadar: undefined,
        anguloRadar: undefined,
        radioRadar: undefined
      };
    }));
    setFactorConfigurandoId(null);
    alerta.exito("Bandeja Restablecida", "Todos los factores han regresado a su estado inicial en la bandeja de pendientes.");
  };

  const factoresPendientesFiltrados = useMemo(() => {
    return factoresPendientes.filter(f => {
      const matchTipo = filtroTipoPendientes === 'Todos' || f.tipo === filtroTipoPendientes;
      const matchBusqueda = !busquedaPendientes.trim() ||
        ((f.factor || '').toLowerCase().includes(busquedaPendientes.toLowerCase())) ||
        (f.categoria && f.categoria.toLowerCase().includes(busquedaPendientes.toLowerCase())) ||
        (f.tagOrigen && f.tagOrigen.toLowerCase().includes(busquedaPendientes.toLowerCase()));
      return matchTipo && matchBusqueda;
    });
  }, [factoresPendientes, filtroTipoPendientes, busquedaPendientes]);

  // Lógica de paginación vertical para factores pendientes (4 factores por vista)
  const itemsPorPagina = 4;
  const totalPaginasBandeja = Math.max(1, Math.ceil(factoresPendientesFiltrados.length / itemsPorPagina));
  
  useEffect(() => {
    if (paginaBandeja > totalPaginasBandeja) {
      setPaginaBandeja(Math.max(1, totalPaginasBandeja));
    }
  }, [totalPaginasBandeja, paginaBandeja]);

  useEffect(() => {
    setPaginaBandeja(1);
  }, [filtroTipoPendientes, busquedaPendientes]);

  const factoresPaginados = useMemo(() => {
    const start = (paginaBandeja - 1) * itemsPorPagina;
    return factoresPendientesFiltrados.slice(start, start + itemsPorPagina);
  }, [factoresPendientesFiltrados, paginaBandeja, itemsPorPagina]);


  // Mapear cada factor UBICADO a su posición angular y radial en el radar según su subdivisión e impacto
  const nodosRadar = useMemo(() => {
    // 1. Agrupar por [categoriaNormalizada + '_' + (subdivision || 'general') + '_' + impacto]
    const grupos = {};

    factoresEnRadar.forEach(item => {
      const catNorm = normalizarCategoriaPoam(item.categoria);
      const subNorm = item.subdivisionRadar || item.subdivision || 'sin_subdivision';
      const imp = item.impacto || 'Medio';
      const clave = `${catNorm}:::${subNorm}:::${imp}`;
      if (!grupos[clave]) grupos[clave] = [];
      grupos[clave].push(item);
    });

    const nodos = [];

    Object.entries(grupos).forEach(([clave, items]) => {
      const [catNorm, subNorm, impacto] = clave.split(':::');
      const dimInfo = DIMENSIONES_POAM.find(d => d.id === catNorm) || DIMENSIONES_POAM[0];

      // Radio base según impacto (Núcleo = Impacto Alto)
      let rBase = radioAnilloBajo - 14;
      if (impacto === 'Alto') rBase = radioNucleoAlto - 18;
      else if (impacto === 'Medio') rBase = radioAnilloMedio - 16;

      // Calcular ángulo base de la subdivisión dentro de su sector PESTEL.
      let anguloBase = dimInfo.anguloCentro;
      const numSubdivs = dimInfo.subdivisiones?.length || 1;
      const pasoAngulo = (dimInfo.anguloFin - dimInfo.anguloInicio) / numSubdivs;

      if (subNorm !== 'sin_subdivision') {
        const subIndex = dimInfo.subdivisiones.findIndex(s => s.nombre === subNorm);
        if (subIndex >= 0) {
          anguloBase = dimInfo.anguloInicio + subIndex * pasoAngulo + pasoAngulo / 2;
        }
      }

      const totalEnGrupo = items.length;

      items.forEach((factor, index) => {
        // Dispersión sutil dentro del sub-gajo de la subdivisión si hay múltiples factores
        let anguloOffset = 0;
        let rOffset = 0;
        if (totalEnGrupo > 1) {
          const maxSpread = Math.min(pasoAngulo * 0.7, (totalEnGrupo - 1) * 5.5);
          const paso = maxSpread / (totalEnGrupo - 1);
          anguloOffset = - (maxSpread / 2) + (index * paso);
          rOffset = (index % 2 === 0 ? 1 : -1) * (totalEnGrupo > 2 ? 8 : 6);
        }

        const rFinal = Math.max(26, Math.min(radioBaseRadar - 14, rBase + rOffset));
        const anguloFinal = anguloBase + anguloOffset;

        const rad = (anguloFinal * Math.PI) / 180;
        const x = radioCentroX + rFinal * Math.cos(rad);
        const y = radioCentroY + rFinal * Math.sin(rad);

        nodos.push({
          factor,
          x,
          y,
          r: rFinal,
          angulo: anguloFinal,
          dimInfo
        });
      });
    });

    // 2. FASE ANTI-COLISIÓN (Physics Relaxation): Garantiza CERO sobreposiciones visuales
    const MIN_DIST = 32; // Diámetro de esfera es 26px; 32px asegura separación clara y holgada
    for (let iter = 0; iter < 12; iter++) {
      let modificado = false;
      for (let i = 0; i < nodos.length; i++) {
        for (let j = i + 1; j < nodos.length; j++) {
          const dx = nodos[j].x - nodos[i].x;
          const dy = nodos[j].y - nodos[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MIN_DIST && dist > 0.001) {
            modificado = true;
            const push = (MIN_DIST - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            nodos[i].x -= nx * push;
            nodos[i].y -= ny * push;
            nodos[j].x += nx * push;
            nodos[j].y += ny * push;

            // Mantener nodos contenidos dentro del disco de radar
            const r1 = Math.sqrt((nodos[i].x - radioCentroX) ** 2 + (nodos[i].y - radioCentroY) ** 2);
            if (r1 > radioBaseRadar - 14) {
              const f1 = (radioBaseRadar - 14) / r1;
              nodos[i].x = radioCentroX + (nodos[i].x - radioCentroX) * f1;
              nodos[i].y = radioCentroY + (nodos[i].y - radioCentroY) * f1;
            }
            const r2 = Math.sqrt((nodos[j].x - radioCentroX) ** 2 + (nodos[j].y - radioCentroY) ** 2);
            if (r2 > radioBaseRadar - 14) {
              const f2 = (radioBaseRadar - 14) / r2;
              nodos[j].x = radioCentroX + (nodos[j].x - radioCentroX) * f2;
              nodos[j].y = radioCentroY + (nodos[j].y - radioCentroY) * f2;
            }
          }
        }
      }
      if (!modificado) break;
    }

    return nodos;
  }, [factoresEnRadar, radioCentroX, radioCentroY, radioAnilloBajo, radioNucleoAlto, radioAnilloMedio, radioBaseRadar]);

  // Nodos ordenados para que los activos / interactuados estén siempre en el tope del SVG
  const nodosOrdenados = useMemo(() => {
    return [...nodosRadar].sort((a, b) => {
      const aSelected = a.factor.id === factorSeleccionadoId;
      const bSelected = b.factor.id === factorSeleccionadoId;
      if (aSelected && !bSelected) return 1;
      if (!aSelected && bSelected) return -1;
      const aHovered = a.factor.id === hoveredFactorId;
      const bHovered = b.factor.id === hoveredFactorId;
      if (aHovered && !bHovered) return 1;
      if (!aHovered && bHovered) return -1;
      return 0;
    });
  }, [nodosRadar, factorSeleccionadoId, hoveredFactorId]);

  // =========================================================================
  // GEOMETRÍA Y DETECCIÓN MATEMÁTICA DE ZONA EN RADAR (DRAG & DROP)
  // =========================================================================
  const detectarZonaRadar = (svgX, svgY, factorEnArrastre = null) => {
    const dx = svgX - radioCentroX;
    const dy = svgY - radioCentroY;
    const r = Math.sqrt(dx * dx + dy * dy);

    if (r > radioBaseRadar + 14) return null; // Fuera del disco del radar

    let impacto = 'Bajo';
    if (r <= radioNucleoAlto + 10) impacto = 'Alto';
    else if (r <= radioAnilloMedio + 12) impacto = 'Medio';
    else impacto = 'Bajo';

    const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    const normDeg = (deg + 360) % 360;

    // Obtener el factor que se está arrastrando para fijar su dimensión según PESTEL
    const factorActivo = factorEnArrastre || (factoresPoam || []).find(f => f.id === factorArrastrandoId) || dragNodoRef.current?.factor;
    const dimFija = factorActivo ? (resolverDimensionPestel(factorActivo, datosPestel, ideasLluvia) || normalizarCategoriaPoam(factorActivo.categoria)) : null;

    let dimId = dimFija || DIMENSIONES_POAM[0].id;
    let spanOffset = 0;
    let subIdxFija = null;

    if (!dimFija) {
      const dimensionPorAngulo = DIMENSIONES_POAM.find(dim => {
        const inicio = (dim.anguloInicio + 360) % 360;
        const fin = (dim.anguloFin + 360) % 360;
        return inicio < fin ? normDeg >= inicio && normDeg < fin : normDeg >= inicio || normDeg < fin;
      }) || DIMENSIONES_POAM[0];
      dimId = dimensionPorAngulo.id;
      spanOffset = (normDeg - dimensionPorAngulo.anguloInicio + 360) % 360;
    } else {
      // La dimensión y subdimensión quedan fijadas por el factor de PESTEL.
      const dimInfoTemp = DIMENSIONES_POAM.find(d => d.id === dimFija) || DIMENSIONES_POAM[0];
      const subRadar = factorActivo?.subdivisionRadar || resolverSubdivisionRadar(factorActivo || {}, dimFija);
      subIdxFija = dimInfoTemp.subdivisiones.findIndex(sub => sub.nombre === subRadar);
      if (subIdxFija < 0) return null;
      spanOffset = ((subIdxFija + 0.5) * (dimInfoTemp.anguloFin - dimInfoTemp.anguloInicio)) / dimInfoTemp.subdivisiones.length;
    }

    const dimInfo = DIMENSIONES_POAM.find(d => d.id === dimId) || DIMENSIONES_POAM[0];
    const numSubdivs = dimInfo.subdivisiones?.length || 1;
    const pasoAngulo = (dimInfo.anguloFin - dimInfo.anguloInicio) / numSubdivs;
    const subIdx = subIdxFija !== null
      ? subIdxFija
      : Math.min(numSubdivs - 1, Math.max(0, Math.floor(spanOffset / pasoAngulo)));
    const subdivSeleccionada = dimInfo.subdivisiones[subIdx] || null;

    const subAnguloInicio = dimInfo.anguloInicio + subIdx * pasoAngulo;
    const subAnguloFin = subAnguloInicio + pasoAngulo;
    const subAnguloCentro = subAnguloInicio + pasoAngulo / 2;

    return {
      dimensionId: dimId,
      dimInfo,
      subdivision: subdivSeleccionada?.nombre || '',
      subInfo: subdivSeleccionada,
      subIdx,
      subAnguloInicio,
      subAnguloFin,
      subAnguloCentro,
      impacto,
      r,
      normDeg
    };
  };

  const generarPathSectorAnillo = (angInicioDeg, angFinDeg, rInner, rOuter, cx = radioCentroX, cy = radioCentroY) => {
    const rad1 = (angInicioDeg * Math.PI) / 180;
    const rad2 = (angFinDeg * Math.PI) / 180;

    const x1Out = cx + rOuter * Math.cos(rad1);
    const y1Out = cy + rOuter * Math.sin(rad1);
    const x2Out = cx + rOuter * Math.cos(rad2);
    const y2Out = cy + rOuter * Math.sin(rad2);

    if (rInner <= 0) {
      return `M ${cx} ${cy} L ${x1Out} ${y1Out} A ${rOuter} ${rOuter} 0 0 1 ${x2Out} ${y2Out} Z`;
    }

    const x1In = cx + rInner * Math.cos(rad1);
    const y1In = cy + rInner * Math.sin(rad1);
    const x2In = cx + rInner * Math.cos(rad2);
    const y2In = cy + rInner * Math.sin(rad2);

    return `M ${x1In} ${y1In} L ${x1Out} ${y1Out} A ${rOuter} ${rOuter} 0 0 1 ${x2Out} ${y2Out} L ${x2In} ${y2In} A ${rInner} ${rInner} 0 0 0 ${x1In} ${y1In} Z`;
  };

  // =========================================================================
  // HANDLERS DE UBICACIÓN MANUAL Y ARRASTRE
  // =========================================================================
  const ubicarFactorEnRadar = (
    factorId,
    dimensionId,
    nuevoImpacto,
    nuevaSubdivision = null,
    nuevoTipo = null,
    nuevaJustificacion = null,
    mostrarAviso = true
  ) => {
    if (!['Bajo', 'Medio', 'Alto'].includes(nuevoImpacto)) {
      alerta.advertencia('Impacto requerido', 'Selecciona el nivel de impacto antes de ubicar el factor en el radar.');
      return;
    }
    let factorActualizado = null;
    setFactorSeleccionadoId(factorId);

    setFactoresPoam(prev => prev.map(f => {
      if (f.id === factorId) {
        // La dimensión para cada factor está definida por PESTEL
        const dimPestel = resolverDimensionPestel(f, datosPestel, ideasLluvia);
        const catNorm = normalizarCategoriaPoam(dimPestel || f.categoria || dimensionId);
        const subdivs = obtenerSubdivisionesPorDimension(catNorm);
        const subSugerida = resolverSubdivisionRadar(f, catNorm);
        const subdivisionRadar = subdivs.find(s => s.nombre === nuevaSubdivision)?.nombre
          || subdivs.find(s => s.nombre === f.subdivisionRadar)?.nombre
          || subdivs.find(s => s.nombre === subSugerida)?.nombre;
        if (!subdivisionRadar || !f.subdivision) return f;

        const imp = nuevoImpacto || f.impacto || 'Alto';
        const tipoFinal = nuevoTipo || f.tipo || 'Oportunidad';
        const justFinal = nuevaJustificacion !== null && nuevaJustificacion !== undefined ? nuevaJustificacion : (f.justificacion || '');

        factorActualizado = {
          ...f,
          categoria: catNorm,
          subdivision: f.subdivision,
          subdivisionRadar,
          impacto: imp,
          calificacion: imp,
          impactoConfiguradoPOAM: true,
          tipo: tipoFinal,
          justificacion: justFinal,
          ubicadoEnRadar: true
        };
        return factorActualizado;
      }
      return f;
    }));

    if (factorActualizado && mostrarAviso) {
      const txtSub = factorActualizado.subdivision ? ` › ${factorActualizado.subdivision}` : '';
      alerta.exito(
        "Factor Ubicado en Radar",
        `"${(factorActualizado.factor || '').slice(0, 36)}..." situado en ${factorActualizado.categoria}${txtSub} (${factorActualizado.tipo} · Impacto ${factorActualizado.impacto}).`
      );
      setFactorConfigurandoId(null);
      setBorradorConfig(null);
    }
  };

  const desubicarFactor = (factorId) => {
    setFactoresPoam(prev => prev.map(f => {
      if (f.id === factorId) {
        let tipoInicial = f.tipoOriginal || f.tipo;
        if (f.origenPorter && f.nivelFuerza) {
          tipoInicial = (f.nivelFuerza === 'Alta' || f.nivelFuerza === 'Media') ? 'Amenaza' : 'Oportunidad';
        }
        const justInicial = f.origenPestel ? (f.justificacion || '') : (f.justificacionOriginal !== undefined ? f.justificacionOriginal : (f.justificacion || ''));
        const catPestel = resolverDimensionPestel(f, datosPestel, ideasLluvia);

        return {
          ...f,
          ubicadoEnRadar: false,
          categoria: catPestel || normalizarCategoriaPoam(f.categoria) || 'Económica',
          subdivision: f.subdivision,
          subdivisionRadar: f.subdivisionRadar || resolverSubdivisionRadar(f, catPestel || f.categoria),
          impacto: '',
          calificacion: '',
          impactoConfiguradoPOAM: false,
          tipo: tipoInicial,
          justificacion: justInicial,
          xRadar: undefined,
          yRadar: undefined,
          anguloRadar: undefined,
          radioRadar: undefined
        };
      }
      return f;
    }));
    setFactorConfigurandoId(null);
    setBorradorConfig(null);
    alerta.informacion(
      "Devuelto a Pendientes",
      "El factor ha salido del radar y sus selecciones han vuelto a su estado inicial."
    );
  };



  const handleDragOverRadar = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!svgRadarRef.current) return;

    const rect = svgRadarRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const svgX = ((e.clientX - rect.left) / rect.width) * 600;
    const svgY = ((e.clientY - rect.top) / rect.height) * 600;

    const factorArrastrado = (factoresPoam || []).find(f => f.id === factorArrastrandoId);
    const zona = detectarZonaRadar(svgX, svgY, factorArrastrado);
    setZonaHoverRadar(zona);
  };

  const handleDragLeaveRadar = () => {
    setZonaHoverRadar(null);
  };

  const handleDropOnRadar = (e) => {
    e.preventDefault();
    const factorId = e.dataTransfer.getData('text/plain') || factorArrastrandoId;
    const factor = (factoresPoam || []).find(item => item.id === factorId);
    let zonaDrop = zonaHoverRadar;
    if (factor && svgRadarRef.current) {
      const rect = svgRadarRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const svgX = ((e.clientX - rect.left) / rect.width) * 600;
        const svgY = ((e.clientY - rect.top) / rect.height) * 600;
        zonaDrop = detectarZonaRadar(svgX, svgY, factor);
      }
    }
    if (factorId && zonaDrop) {
      ubicarFactorEnRadar(
        factorId,
        zonaDrop.dimensionId,
        zonaDrop.impacto,
        zonaDrop.subdivision
      );
    }
    setFactorArrastrandoId(null);
    setZonaHoverRadar(null);
  };

  const handlePointerDownNodo = (e, factor) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    dragNodoRef.current = {
      factorId: factor.id,
      factor,
      startX: e.clientX,
      startY: e.clientY,
      hasMoved: false
    };
  };

  const handlePointerMoveCanvas = (e) => {
    if (!dragNodoRef.current) return;
    const dx = e.clientX - dragNodoRef.current.startX;
    const dy = e.clientY - dragNodoRef.current.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 6 && !dragNodoRef.current.hasMoved) {
      dragNodoRef.current.hasMoved = true;
      setFactorArrastrandoId(dragNodoRef.current.factorId);
    }

    if (dragNodoRef.current.hasMoved && svgRadarRef.current) {
      const rect = svgRadarRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const svgX = ((e.clientX - rect.left) / rect.width) * 600;
        const svgY = ((e.clientY - rect.top) / rect.height) * 600;
        const zona = detectarZonaRadar(svgX, svgY, dragNodoRef.current.factor);
        setZonaHoverRadar(zona);
      }
    }
  };

  const handlePointerUpCanvas = (e) => {
    if (!dragNodoRef.current) return;
    const { factorId, factor, hasMoved } = dragNodoRef.current;
    dragNodoRef.current = null;

    if (hasMoved) {
      justDraggedRef.current = true;
      setTimeout(() => {
        justDraggedRef.current = false;
      }, 150);

      let zonaDrop = zonaHoverRadar;
      if (e && svgRadarRef.current) {
        const rect = svgRadarRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const svgX = ((e.clientX - rect.left) / rect.width) * 600;
          const svgY = ((e.clientY - rect.top) / rect.height) * 600;
          zonaDrop = detectarZonaRadar(svgX, svgY, factor);
        }
      }
      if (zonaDrop) {
        ubicarFactorEnRadar(
          factorId,
          zonaDrop.dimensionId,
          zonaDrop.impacto,
          zonaDrop.subdivision
        );
      }
      setFactorArrastrandoId(null);
      setZonaHoverRadar(null);
    }
  };

  useEffect(() => {
    const handleGlobalPointerMove = (e) => {
      if (dragNodoRef.current?.hasMoved) {
        handlePointerMoveCanvas(e);
      } else if (dragNodoRef.current) {
        const dx = e.clientX - dragNodoRef.current.startX;
        const dy = e.clientY - dragNodoRef.current.startY;
        if (Math.sqrt(dx * dx + dy * dy) > 6) {
          dragNodoRef.current.hasMoved = true;
          setFactorArrastrandoId(dragNodoRef.current.factorId);
          handlePointerMoveCanvas(e);
        }
      }
    };

    const handleGlobalPointerUp = (e) => {
      if (dragNodoRef.current) {
        handlePointerUpCanvas(e);
      }
    };

    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [zonaHoverRadar]);


  // Handlers para el borrador del modal (no mutan factoresPoam hasta confirmar ubicación en radar)
  const cambiarSubdivisionModal = (subNombre) => {
    setBorradorConfig(prev => prev ? ({ ...prev, subdivision: subNombre }) : null);
  };

  const cambiarPolaridadModal = (nuevoTipo) => {
    setBorradorConfig(prev => prev ? ({ ...prev, tipo: nuevoTipo }) : null);
  };

  const cambiarImpactoModal = (nuevoImpacto) => {
    setBorradorConfig(prev => prev ? ({ ...prev, impacto: nuevoImpacto, calificacion: nuevoImpacto, impactoConfiguradoPOAM: true }) : null);
  };

  const cambiarJustificacionModal = (nuevaJustificacion) => {
    setBorradorConfig(prev => prev ? ({ ...prev, justificacion: nuevaJustificacion }) : null);
  };

  const cerrarModalConfig = () => {
    setFactorConfigurandoId(null);
    setBorradorConfig(null);
  };

  const confirmarYUbicarEnRadar = () => {
    if (!camposCompletosModal || !factorParaModal) {
      alerta.advertencia("Impacto requerido", "Selecciona el nivel de impacto antes de ubicar el factor en el radar.");
      return;
    }
    const catFija = normalizarCategoriaPoam(factorParaModal.categoria) || resolverDimensionPestel(factorParaModal, datosPestel, ideasLluvia);
    ubicarFactorEnRadar(
      factorParaModal.id,
      catFija,
      factorParaModal.impacto || 'Alto',
      factorParaModal.subdivision,
      factorParaModal.tipo,
      factorParaModal.justificacion
    );
  };

  const guardarCambiosFactorUbicado = () => {
    if (!factorParaModal) return;
    const catFija = normalizarCategoriaPoam(factorParaModal.categoria) || resolverDimensionPestel(factorParaModal, datosPestel, ideasLluvia);
    ubicarFactorEnRadar(
      factorParaModal.id,
      catFija,
      factorParaModal.impacto || 'Alto',
      factorParaModal.subdivision,
      factorParaModal.tipo,
      factorParaModal.justificacion
    );
    alerta.exito("Cambios Guardados", "Se han actualizado las calibraciones del factor en el radar.");
  };



  const cambiarImpactoRapido = (factorId, nuevoImpacto) => {
    const factor = factoresPoam.find(item => item.id === factorId);
    if (!factor) return;
    const categoria = normalizarCategoriaPoam(resolverDimensionPestel(factor, datosPestel, ideasLluvia) || factor.categoria);
    setFactorSeleccionadoId(factorId);
    ubicarFactorEnRadar(
      factorId,
      categoria,
      nuevoImpacto,
      resolverSubdivisionRadar(factor, categoria),
      factor.tipo,
      factor.justificacion,
      false
    );
  };








  // ============================================================================
  // GESTIÓN DE EVIDENCIA DOCUMENTAL POR FACTOR (.pdf, imágenes, excel, url)
  // ============================================================================
  const abrirModalAdjuntos = (factorId, factorTexto, dimensionNombre) => {
    setModalAdjuntos({
      abierto: true,
      factorId,
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
      factorId: null,
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

    const { factorId } = modalAdjuntos;
    if (!factorId) return;

    const nuevoAdjunto = {
      id: 'adj-poam-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      tipo: archivoSeleccionado.tipo,
      nombre: (nombreArchivoInput.trim() || archivoSeleccionado.nombre),
      archivoNombreOriginal: archivoSeleccionado.nombre,
      url: archivoSeleccionado.previewUrl || URL.createObjectURL(archivoSeleccionado.file),
      tamano: archivoSeleccionado.tamano,
      fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    setFactoresPoam(prev => prev.map(f => {
      if (f.id === factorId) {
        const listaActual = f.adjuntos || [];
        return {
          ...f,
          adjuntos: [...listaActual, nuevoAdjunto]
        };
      }
      return f;
    }));

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

    const { factorId } = modalAdjuntos;
    if (!factorId) return;

    const nuevoAdjunto = {
      id: 'adj-poam-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      tipo: 'enlace',
      nombre: tituloEnlaceInput.trim() || urlFinal.replace(/^https?:\/\/(www\.)?/, '').slice(0, 35),
      url: urlFinal,
      tamano: 'Enlace web',
      fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    setFactoresPoam(prev => prev.map(f => {
      if (f.id === factorId) {
        const listaActual = f.adjuntos || [];
        return {
          ...f,
          adjuntos: [...listaActual, nuevoAdjunto]
        };
      }
      return f;
    }));

    alerta.exito('Enlace Adjuntado', `Se ha vinculado la fuente externa al factor.`);
    setUrlEnlaceInput('');
    setTituloEnlaceInput('');
  };

  const eliminarAdjunto = (factorId, adjuntoId) => {
    setFactoresPoam(prev => prev.map(f => {
      if (f.id === factorId) {
        const listaActual = f.adjuntos || [];
        return {
          ...f,
          adjuntos: listaActual.filter(a => a.id !== adjuntoId)
        };
      }
      return f;
    }));
    alerta.informacion('Evidencia Eliminada', 'Se retiró el documento adjunto del factor.');
  };

  // Consolidar y Exportar directamente a la Matriz FODA
  const consolidarYExportarAFoda = () => {
    if (onSincronizarFoda) {
      onSincronizarFoda(factoresPoam);
    }

    if (onIrAFoda) {
      onIrAFoda();
    } else if (onIrAEfi) {
      onIrAEfi();
    }
  };

  // Coordenadas de los límites entre dimensiones PESTEL.
  const lineasRadiales = useMemo(() => {
    return DIMENSIONES_POAM.map(dim => {
      const rad = (dim.anguloInicio * Math.PI) / 180;
      const x1 = radioCentroX + 24 * Math.cos(rad);
      const y1 = radioCentroY + 24 * Math.sin(rad);
      const x2 = radioCentroX + radioBaseRadar * Math.cos(rad);
      const y2 = radioCentroY + radioBaseRadar * Math.sin(rad);

      // Posición de la etiqueta del sector
      const radCentro = (dim.anguloCentro * Math.PI) / 180;
      const xBadge = radioCentroX + radioEtiquetasDim * Math.cos(radCentro);
      const yBadge = radioCentroY + radioEtiquetasDim * Math.sin(radCentro);

      return {
        dim,
        x1, y1, x2, y2,
        xBadge, yBadge
      };
    });
  }, [radioCentroX, radioCentroY, radioBaseRadar, radioEtiquetasDim]);

  // Líneas radiales para las subdivisiones de cada dimensión PESTEL.
  const lineasSubdivisionesRadiales = useMemo(() => {
    const lineas = [];
    DIMENSIONES_POAM.forEach(dim => {
      const numSub = dim.subdivisiones.length;
      const paso = (dim.anguloFin - dim.anguloInicio) / numSub;
      for (let i = 1; i < numSub; i++) {
        const ang = dim.anguloInicio + i * paso;
        const rad = (ang * Math.PI) / 180;
        const x1 = radioCentroX + radioNucleoAlto * Math.cos(rad);
        const y1 = radioCentroY + radioNucleoAlto * Math.sin(rad);
        const x2 = radioCentroX + radioBaseRadar * Math.cos(rad);
        const y2 = radioCentroY + radioBaseRadar * Math.sin(rad);
        lineas.push({
          id: `${dim.id}-sub-${i}`,
          x1, y1, x2, y2,
          color: dim.color
        });
      }
    });
    return lineas;
  }, [radioCentroX, radioCentroY, radioNucleoAlto, radioBaseRadar]);

  return (
    <div className="poam-container poam-spacious-container" id="poam-spacious-container">
      <EncabezadoHerramienta icono={Sliders} titulo="Matriz POAM · Oportunidades y amenazas del medio" exportando={exportandoPDF} onExportar={exportarPDF}/>
      {/* =========================================================================
          WORKSPACE PRINCIPAL: RADAR TÁCTICO Y MATRIZ POAM
          ========================================================================= */}
      <div className="poam-main-layout" style={{ gridTemplateColumns: '1fr' }}>

        {/* -----------------------------------------------------------------------
            COLUMNA IZQUIERDA: HEADER, BALANZA TUG OF WAR, CONTROLES Y WORKSPACE
            ----------------------------------------------------------------------- */}
        <div className="poam-workspace-left">
          {/* =====================================================================
              1. BARRA DE CONTROL PRINCIPAL: CONMUTADOR DE VISTAS, FILTROS Y BALANZA
              ===================================================================== */}
          <div className="poam-control-bar">
            {/* CONMUTADOR DE VISTAS (VIEW SWITCHER) */}
            <div className="poam-view-switcher-pill">
              <button
                type="button"
                className={`poam-view-tab-btn ${vistaActiva === 'radar' ? 'active' : ''}`}
                onClick={() => setVistaActiva('radar')}
              >
                <Target size={15} />
                <span>Radar Táctico ({factoresPoam.length})</span>
              </button>

              <button
                type="button"
                className={`poam-view-tab-btn ${vistaActiva === 'matriz' ? 'active' : ''}`}
                onClick={() => setVistaActiva('matriz')}
              >
                <Sliders size={15} />
                <span>Matriz Tabular ({factoresPoam.length})</span>
              </button>
            </div>

            {/* Filtros de vista separados de las acciones permanentes */}
            <div className="poam-control-actions">
              <div className="poam-view-filters">
                {vistaActiva === 'matriz' && (
                  <>
                    <div className="poam-filter-pill">
                      <Filter size={13} className="poam-filter-icon" />
                      <select
                        value={filtroDimension}
                        onChange={(e) => {
                          setFiltroDimension(e.target.value);
                          setFiltroSubdivision('Todas');
                        }}
                        className="poam-select-native"
                      >
                        <option value="Todas">Todas las Dimensiones (6)</option>
                        {DIMENSIONES_POAM.map(dim => (
                          <option key={dim.id} value={dim.id}>{dim.nombreCorto || dim.nombre}</option>
                        ))}
                      </select>
                    </div>

                    {filtroDimension !== 'Todas' && (
                      <div className="poam-filter-pill">
                        <Layers size={13} className="poam-filter-icon" />
                        <select
                          value={filtroSubdivision}
                          onChange={(e) => setFiltroSubdivision(e.target.value)}
                          className="poam-select-native"
                        >
                          <option value="Todas">Todas las Subdivisiones</option>
                          {obtenerSubdivisionesPorDimension(filtroDimension).map(sub => (
                            <option key={sub.id} value={sub.nombre}>{sub.nombre}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="poam-filter-pill">
                      <select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className="poam-select-native"
                      >
                        <option value="Todos">Todos los Tipos</option>
                        <option value="Oportunidad">🟢 Solo Oportunidades</option>
                        <option value="Amenaza">🔴 Solo Amenazas</option>
                      </select>
                    </div>

                    <div className="poam-search-pill">
                      <Search size={14} className="poam-search-icon" />
                      <input
                        type="text"
                        placeholder="Buscar factor o subdivisión..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="poam-search-input"
                      />
                      {busqueda && (
                        <button
                          type="button"
                          onClick={() => setBusqueda('')}
                          className="poam-search-clear-btn"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="poam-fixed-actions">
                <button
                  type="button"
                  className="btn-header-radar btn-header-balanza"
                  onClick={() => {
                    setModalBalanzaAbierta(true);
                  }}
                  title="Ver Balanza de Platillos (Oportunidades vs Amenazas)"
                >
                  <Scale size={16} />
                  <span>Balanza de Platillos</span>
                </button>
              </div>
            </div>
          </div>


          {/* ===============================================================
              3. VISTA ACTIVA: RADAR TÁCTICO O MATRIZ TABULAR
              =============================================================== */}
          {vistaActiva === 'radar' ? (
            /* ===============================================================
               MODO 1: RADAR CONCÉNTRICO SECTORIZADO EN 5 DIMENSIONES
               =============================================================== */
            <div className="poam-radar-tactico-card">
              {/* WORKSPACE PRINCIPAL: CARRUSEL SUPERIOR + RADAR TÁCTICO INFERIOR */}
              <div className={`poam-radar-workspace-grid ${bandejaColapsada ? 'collapsed' : ''}`}>
                {/* 1. SECCIÓN SUPERIOR/IZQUIERDA: CARRUSEL DE FACTORES POR UBICAR */}
                <div className="foda-left-carousel-card poam-radar-top-carousel-card">
                  {bandejaColapsada ? (
                    <div className="foda-tray-collapsed-dock">
                      <button 
                        type="button" 
                        onClick={() => setBandejaColapsada(false)}
                        className="poam-btn-mini-tool"
                        title="Expandir bandeja de factores"
                        style={{ padding: '10px 6px' }}
                      >
                        <PanelRightOpen size={20} />
                      </button>
                      <div className="foda-tray-collapsed-text">
                        Factores Pendientes ({factoresPendientes.length})
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* HEADER COMPACTO ESTILO FODA */}
                      <div className="foda-tray-header">
                        <div className="foda-tray-header-top">
                          <div className="foda-tray-counter-wrap">
                            <Layers size={16} className="foda-accent-icon" />
                            <span className="foda-tray-counter-pill">
                              {factoresPendientes.length} Pendientes
                            </span>
                          </div>
                          <div className="foda-tray-actions">
                            <button
                              type="button"
                              className="foda-btn-icon-tool"
                              onClick={restablecerTodosABandeja}
                              title="Regresar todos los factores a la bandeja"
                            >
                              <RotateCcw size={13} />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setBandejaColapsada(true)}
                              className="foda-btn-icon-tool"
                              title="Minimizar bandeja"
                            >
                              <PanelRightClose size={15} />
                            </button>
                          </div>
                        </div>

                        {/* PESTAÑAS DE ORIGEN / TIPO */}
                        <div className="poam-tray-type-tabs">
                          <button
                            type="button"
                            className={`poam-tray-tab ${filtroTipoPendientes === 'Todos' ? 'active' : ''}`}
                            onClick={() => { setFiltroTipoPendientes('Todos'); setPaginaBandeja(1); }}
                          >
                            Todos ({factoresPendientes.length})
                          </button>
                          <button
                            type="button"
                            className={`poam-tray-tab op ${filtroTipoPendientes === 'Oportunidad' ? 'active' : ''}`}
                            onClick={() => { setFiltroTipoPendientes('Oportunidad'); setPaginaBandeja(1); }}
                          >
                            <TrendingUp size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                            Op ({conteoOpPendientes})
                          </button>
                          <button
                            type="button"
                            className={`poam-tray-tab am ${filtroTipoPendientes === 'Amenaza' ? 'active' : ''}`}
                            onClick={() => { setFiltroTipoPendientes('Amenaza'); setPaginaBandeja(1); }}
                          >
                            <TrendingDown size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
                            Am ({conteoAmPendientes})
                          </button>
                        </div>

                        {/* BUSCADOR DE FACTORES */}
                        <div className="poam-tray-search-input-wrap">
                          <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                          <input
                            type="text"
                            placeholder="Buscar factor..."
                            value={busquedaPendientes}
                            onChange={(e) => { setBusquedaPendientes(e.target.value); setPaginaBandeja(1); }}
                            className="poam-tray-search-input"
                          />
                          {busquedaPendientes && (
                            <button
                              type="button"
                              onClick={() => { setBusquedaPendientes(''); setPaginaBandeja(1); }}
                              className="poam-tray-clear-search"
                              title="Limpiar búsqueda"
                            >
                              <X size={11} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* LISTADO VERTICAL DE TARJETAS TIPO CARRUSEL/TRACK ESTILO FODA */}
                      <div className="foda-tray-cards-container">
                        {factoresPendientes.length > 0 ? (
                          factoresPendientesFiltrados.length > 0 ? (
                            <div className="foda-tray-cards-viewport">
                              <div className="foda-tray-cards-list">
                                {factoresPaginados.map((item) => {
                                  const esOp = item.tipo === 'Oportunidad';
                                  const catNorm = normalizarCategoriaPoam(item.categoria);
                                  const dimInfo = DIMENSIONES_POAM.find(d => d.id === catNorm) || DIMENSIONES_POAM[0];
                                  const subdivisionPoam = item.subdivisionRadar || resolverSubdivisionRadar(item, catNorm);

                                  return (
                                    <div
                                      key={item.id}
                                      className={`poam-factor-card ${factorArrastrandoId === item.id ? 'is-dragging' : ''} ${factorSeleccionadoId === item.id ? 'selected' : ''} ${esOp ? 'tipo-op' : 'tipo-am'}`}
                                      draggable="true"
                                      onDragStart={(e) => {
                                        e.dataTransfer.setData('text/plain', item.id);
                                        e.dataTransfer.effectAllowed = 'move';
                                        setFactorArrastrandoId(item.id);
                                      }}
                                      onDragEnd={() => {
                                        setFactorArrastrandoId(null);
                                        setZonaHoverRadar(null);
                                      }}
                                      onClick={() => setFactorSeleccionadoId(item.id)}
                                    >
                                      <div className="poam-factor-card-heading">
                                        <span className={`poam-factor-polarity ${esOp ? 'opportunity' : 'threat'}`}>
                                          {esOp ? 'Oportunidad' : 'Amenaza'}
                                        </span>
                                        <span className="poam-factor-dimension" style={{ '--dimension-color': dimInfo.color }}>
                                          {dimInfo.nombreCorto}
                                        </span>
                                      </div>
                                      <p className="poam-factor-card-text">{item.factor}</p>
                                      <div className="poam-factor-subdimension" title={subdivisionPoam}>
                                        <strong>{subdivisionPoam}</strong>
                                      </div>
                                      <div className="poam-factor-card-footer">
                                        <div className="poam-factor-card-status">
                                          <span className={`poam-factor-impact ${item.impactoConfiguradoPOAM && item.impacto ? `impact-${item.impacto.toLowerCase()}` : ''}`}>
                                            {item.impactoConfiguradoPOAM && item.impacto ? item.impacto : 'Sin impacto'}
                                          </span>
                                        </div>
                                        <div className="poam-factor-card-actions">
                                          <button
                                            type="button"
                                            className={`pestel-btn-attach-chip ${(item.adjuntos || []).length > 0 ? 'has-attachments' : ''}`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              abrirModalAdjuntos(item.id, item.factor, item.categoria || 'POAM');
                                            }}
                                            title={(item.adjuntos || []).length > 0 ? `${(item.adjuntos || []).length} evidencias adjuntas` : "Adjuntar evidencia documental"}
                                          >
                                            <Paperclip size={13} />
                                            {(item.adjuntos || []).length > 0 && <span className="pestel-attach-count">{(item.adjuntos || []).length}</span>}
                                          </button>

                                          <button
                                            type="button"
                                            className="poam-btn-tray-custom"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setFactorSeleccionadoId(item.id);
                                              setFactorConfigurandoId(item.id);
                                            }}
                                            title="Configurar y calibrar factor"
                                          >
                                            <Settings2 size={13} />
                                            <span>Configurar</span>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="poam-tray-empty-box" style={{ padding: '24px 12px', textAlign: 'center' }}>
                              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                No hay factores que coincidan con la búsqueda o filtro.
                              </p>
                            </div>
                          )
                        ) : factoresPoam.length === 0 ? (
                          <div className="bandeja-vacia-msg poam-carrusel-completed-msg" style={{ padding: '20px 10px', textAlign: 'center' }}>
                            <Clock size={24} style={{ color: 'var(--text-muted)', flexShrink: 0, margin: '0 auto 8px auto' }} />
                            <div>
                              <strong style={{ display: 'block', marginBottom: '3px', fontSize: '0.82rem' }}>Esperando factores del PESTEL</strong>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                Aún no hay factores para ubicar. Completa y clasifica el análisis PESTEL y aparecerán aquí.
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="bandeja-vacia-msg poam-carrusel-completed-msg" style={{ padding: '20px 10px', textAlign: 'center' }}>
                            <CheckCircle2 size={24} style={{ color: '#10b981', flexShrink: 0, margin: '0 auto 8px auto' }} />
                            <div>
                              <strong style={{ display: 'block', marginBottom: '3px', fontSize: '0.82rem' }}>¡Todos los factores en el radar!</strong>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                Has situado los {factoresPoam.length} factores. Pulsa en las esferas para inspeccionar.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* PAGINADOR VERTICAL ESTILO FODA */}
                      {totalPaginasBandeja > 1 && (
                        <div className="foda-tray-paginator">
                          <button
                            type="button"
                            onClick={() => setPaginaBandeja(p => Math.max(1, p - 1))}
                            disabled={paginaBandeja === 1}
                            className="poam-btn-mini-tool foda-btn-page"
                          >
                            <ChevronUp size={15} />
                          </button>
                          <span className="foda-paginator-text">
                            {paginaBandeja} / {totalPaginasBandeja}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPaginaBandeja(p => Math.min(totalPaginasBandeja, p + 1))}
                            disabled={paginaBandeja === totalPaginasBandeja}
                            className="poam-btn-mini-tool foda-btn-page"
                          >
                            <ChevronDown size={15} />
                          </button>
                        </div>
                      )}
                  </>
                  )}
                </div>

                {/* 2. SECCIÓN INFERIOR: ESCENARIO DEL RADAR TÁCTICO AMPLIADO */}
                <div className="poam-radar-stage poam-radar-stage-full">
                  {/* LEYENDA RÁPIDA CONCÉNTRICA EN CABECERA DEL RADAR */}
                  <div className="poam-radar-quick-legend-bar">
                    <div className="poam-legend-item">
                      <span className="poam-legend-dot op" />
                      <span>Oportunidad (+)</span>
                    </div>
                    <div className="poam-legend-item">
                      <span className="poam-legend-dot am" />
                      <span>Amenaza (!)</span>
                    </div>
                    <div className="poam-legend-item">
                      <span className="poam-legend-ring-badge nucleo" />
                      <span>Núcleo Crítico (Alto Impacto)</span>
                    </div>
                  </div>

                  {/* LIENZO SVG DEL RADAR INTERACTIVO CON DROPZONE */}
                  <div
                    className={`poam-radar-canvas-container large ${factorArrastrandoId ? 'radar-dropzone-active' : ''}`}
                    onDragOver={handleDragOverRadar}
                    onDragLeave={handleDragLeaveRadar}
                    onDrop={handleDropOnRadar}
                  >
                    <svg
                      ref={svgRadarRef}
                      viewBox="0 0 600 600"
                      className="poam-radar-svg-canvas large"
                    >
                      <defs>
                        {/* Resplandor suave del núcleo crítico (compatible con modo claro y oscuro) */}
                        <radialGradient id="nucleoGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.18" />
                          <stop offset="70%" stopColor="#ef4444" stopOpacity="0.06" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                        </radialGradient>

                        {/* Clip path para confinar ondas al disco del radar */}
                        <clipPath id="radarDiskClip">
                          <circle cx={radioCentroX} cy={radioCentroY} r={radioBaseRadar} />
                        </clipPath>

                        {/* Filtro para sombras en esferas */}
                        <filter id="sphereShadow" x="-30%" y="-30%" width="160%" height="160%">
                          <feDropShadow dx="0" dy="2.5" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.45" />
                        </filter>
                      </defs>

                      {/* CAPA 1: CÍRCULO BASE DE RADAR */}
                      <circle
                        cx={radioCentroX}
                        cy={radioCentroY}
                        r={radioBaseRadar}
                        className="poam-radar-base-circle"
                      />


                      {/* RESALTE VISUAL ACTIVO DE ZONA Y SUBDIVISIÓN AL ARRASTRAR UN FACTOR */}
                      {zonaHoverRadar && (
                        <g className="poam-radar-drop-highlight-layer" pointerEvents="none">
                          {/* 1. Halo suave de la dimensión padre (72°) */}
                          <path
                            d={generarPathSectorAnillo(
                              zonaHoverRadar.dimInfo.anguloInicio,
                              zonaHoverRadar.dimInfo.anguloFin,
                              radioNucleoAlto * 0.4,
                              radioBaseRadar
                            )}
                            fill={zonaHoverRadar.dimInfo.color}
                            fillOpacity="0.08"
                            stroke={zonaHoverRadar.dimInfo.color}
                            strokeWidth="1"
                            strokeDasharray="4 3"
                            opacity="0.75"
                          />

                          {/* 2. Resalte enfocado en la SUBDIVISIÓN y nivel de IMPACTO exactos */}
                          <path
                            d={generarPathSectorAnillo(
                              zonaHoverRadar.subAnguloInicio,
                              zonaHoverRadar.subAnguloFin,
                              zonaHoverRadar.impacto === 'Alto' ? 0 : zonaHoverRadar.impacto === 'Medio' ? radioNucleoAlto : radioAnilloMedio,
                              zonaHoverRadar.impacto === 'Alto' ? radioNucleoAlto : zonaHoverRadar.impacto === 'Medio' ? radioAnilloMedio : radioAnilloBajo
                            )}
                            fill={zonaHoverRadar.dimInfo.color}
                            fillOpacity="0.45"
                            stroke={zonaHoverRadar.dimInfo.color}
                            strokeWidth="2.5"
                            className="poam-active-drop-sector"
                          />
                        </g>
                      )}

                      {/* CAPA 2: ANILLOS CONCÉNTRICOS DE REFERENCIA */}
                      <circle cx={radioCentroX} cy={radioCentroY} r={radioAnilloBajo} className="poam-radar-ring ring-bajo" />
                      <circle cx={radioCentroX} cy={radioCentroY} r={radioAnilloMedio} className="poam-radar-ring ring-medio" />
                      <circle cx={radioCentroX} cy={radioCentroY} r={radioNucleoAlto} className="poam-radar-ring ring-alto" />
                      <circle cx={radioCentroX} cy={radioCentroY} r="8" className="poam-radar-center-dot" />

                      {/* CAPA 2.5: GUÍAS RADIALES DE SUBDIVISIONES */}
                      <g className="poam-radar-subdiv-axes-layer" pointerEvents="none">
                        {lineasSubdivisionesRadiales.map((sLine) => (
                          <line
                            key={sLine.id}
                            x1={sLine.x1}
                            y1={sLine.y1}
                            x2={sLine.x2}
                            y2={sLine.y2}
                            stroke={sLine.color}
                            strokeOpacity={factorArrastrandoId || zonaHoverRadar ? "0.35" : "0.14"}
                            strokeDasharray="2 3"
                            strokeWidth="1"
                          />
                        ))}
                      </g>

                      {/* CAPA 3: LÍNEAS RADIALES DIVISORIAS DE LAS DIMENSIONES PESTEL */}
                      <g className="poam-radar-axes-layer">
                        {lineasRadiales.map((lr) => (
                          <line
                            key={lr.dim.id}
                            x1={lr.x1}
                            y1={lr.y1}
                            x2={lr.x2}
                            y2={lr.y2}
                            className="poam-radar-axis-line"
                          />
                        ))}
                      </g>

                      {/* CAPA 4: ETIQUETAS DE ANILLOS EN EL EJE VERTICAL */}
                      <text x={radioCentroX + 8} y={radioCentroY - radioNucleoAlto + 14} className="poam-radar-ring-text critical">
                        🔴 Núcleo Crítico (Alto)
                      </text>
                      <text x={radioCentroX + 8} y={radioCentroY - radioAnilloMedio + 14} className="poam-radar-ring-text medium">
                        Impacto Medio
                      </text>
                      <text x={radioCentroX + 8} y={radioCentroY - radioAnilloBajo + 14} className="poam-radar-ring-text low">
                        Impacto Bajo
                      </text>

                      {/* CAPA 5: ETIQUETAS EXTERIORES DE LAS 5 DIMENSIONES */}
                      <g className="poam-dimensions-layer">
                        {DIMENSIONES_POAM.map((dim) => {
                          const radCentro = (dim.anguloCentro * Math.PI) / 180;
                          const xLabel = radioCentroX + radioEtiquetasDim * Math.cos(radCentro);
                          const yLabel = radioCentroY + radioEtiquetasDim * Math.sin(radCentro);
                          const countDim = factoresEnRadar.filter(f => normalizarCategoriaPoam(f.categoria) === dim.id).length;
                          const textoLabel = `${dim.nombreCorto || dim.nombre} (${countDim})`;
                          
                          // Ancho y dimensiones calculadas dinámicamente para que el texto NUNCA sobrepase el marco
                          const esLargo = textoLabel.length > 19;
                          const anchoBadge = Math.min(208, Math.max(150, Math.round(textoLabel.length * 7.2 + 24)));
                          const centroBadgeX = Math.max(anchoBadge / 2 + 4, Math.min(596 - anchoBadge / 2, xLabel));
                          const altoBadge = 30;

                          return (
                            <g key={`label-${dim.id}`} className="poam-dimension-badge-group">
                              <rect
                                x={centroBadgeX - anchoBadge / 2}
                                y={yLabel - altoBadge / 2}
                                width={anchoBadge}
                                height={altoBadge}
                                rx={altoBadge / 2}
                                className="poam-sector-badge-bg"
                                style={{
                                  stroke: dim.color,
                                  strokeWidth: 1.6,
                                  opacity: 1
                                }}
                              />
                              <text
                                x={centroBadgeX}
                                y={yLabel + 4.5}
                                textAnchor="middle"
                                className="poam-sector-badge-text"
                                style={{
                                  fontSize: esLargo ? '11.5px' : '12.5px',
                                  letterSpacing: esLargo ? '-0.02em' : 'normal'
                                }}
                              >
                                {textoLabel}
                              </text>
                            </g>
                          );
                        })}
                      </g>

                      {/* CAPA 6: ESFERAS FLOTANTES INTERACTIVAS (NODOS POAM UBICADOS) */}
                      <g className="poam-nodes-layer">
                        {nodosOrdenados.map((nodo) => {
                          const { factor, x, y } = nodo;
                          const esOp = factor.tipo === 'Oportunidad';
                          const esSeleccionado = factorSeleccionadoId === factor.id;
                          const esHovered = hoveredFactorId === factor.id;

                          const colorFondo = esOp ? '#10b981' : '#ef4444';
                          const colorBorde = esOp ? '#34d399' : '#f87171';
                          const radioEsfera = esSeleccionado ? 17 : esHovered ? 15 : 13;

                          return (
                            <g
                              key={factor.id}
                              className={`poam-node-item ${esSeleccionado ? 'seleccionado' : ''} ${esHovered ? 'hovered' : ''} ${factorArrastrandoId === factor.id ? 'arrastrando' : ''}`}
                              transform={`translate(${x}, ${y})`}
                              draggable={true}
                              onDragStart={(e) => {
                                e.stopPropagation();
                                e.dataTransfer.setData('text/plain', factor.id);
                                e.dataTransfer.effectAllowed = 'move';
                                setFactorArrastrandoId(factor.id);
                              }}
                              onDragEnd={() => {
                                setFactorArrastrandoId(null);
                                setZonaHoverRadar(null);
                              }}
                              onPointerDown={(e) => handlePointerDownNodo(e, factor)}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (justDraggedRef.current) {
                                  justDraggedRef.current = false;
                                  return;
                                }
                                setFactorSeleccionadoId(factor.id);
                                setFactorConfigurandoId(factor.id);
                              }}
                              onMouseEnter={() => {
                                if (!factorArrastrandoId) setHoveredFactorId(factor.id);
                              }}
                              onMouseLeave={() => setHoveredFactorId(null)}
                              style={{
                                cursor: factorArrastrandoId === factor.id ? 'grabbing' : 'grab',
                                transition: factorArrastrandoId === factor.id ? 'none' : 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                opacity: factorArrastrandoId === factor.id ? 0.75 : 1,
                                touchAction: 'none'
                              }}
                            >
                              {esSeleccionado && (
                                <circle
                                  r="26"
                                  fill="none"
                                  stroke={colorBorde}
                                  strokeWidth="2"
                                  strokeDasharray="4 2"
                                  className="poam-pulse-halo"
                                />
                              )}
                              <circle
                                r={radioEsfera}
                                fill={colorFondo}
                                stroke={colorBorde}
                                strokeWidth="2.5"
                                filter="url(#sphereShadow)"
                              />
                              <text
                                y="4.5"
                                textAnchor="middle"
                                fill="#ffffff"
                                fontSize={esSeleccionado ? "12" : "10"}
                                fontWeight="900"
                                pointerEvents="none"
                              >
                                {esOp ? '+' : '!'}
                              </text>
                              <circle
                                cx="9"
                                cy="-9"
                                r="5.5"
                                className="poam-node-badge-bg"
                                stroke={factor.origenPorter ? '#f59e0b' : '#10b981'}
                                strokeWidth="1.2"
                              />
                              <text
                                x="9"
                                y="-7"
                                textAnchor="middle"
                                className="poam-node-badge-text"
                              >
                                {factor.origenPorter ? 'P' : 'M'}
                              </text>
                            </g>
                          );
                        })}
                      </g>

                      {/* INDICADOR DE RADAR VACÍO */}
                      {nodosOrdenados.length === 0 && (
                        <g className="poam-radar-empty-watermark" pointerEvents="none">
                          <circle
                            cx={radioCentroX}
                            cy={radioCentroY}
                            r="48"
                            className="poam-watermark-disk"
                          />
                          <text
                            x={radioCentroX}
                            y={radioCentroY - 6}
                            textAnchor="middle"
                            className="poam-watermark-title"
                          >
                            Radar Limpio
                          </text>
                          <text
                            x={radioCentroX}
                            y={radioCentroY + 12}
                            textAnchor="middle"
                            className="poam-watermark-subtitle"
                          >
                            Arrastra factores aquí
                          </text>
                        </g>
                      )}
                    </svg>

                    {/* HUD FLOTANTE DURANTE EL ARRASTRE */}
                    {zonaHoverRadar && (
                      <div
                        className="poam-radar-drop-hud"
                        style={{ borderColor: zonaHoverRadar.dimInfo.color }}
                      >
                        <span className="poam-hud-dot" style={{ backgroundColor: zonaHoverRadar.dimInfo.color }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span><strong>{zonaHoverRadar.dimInfo.nombreCorto || zonaHoverRadar.dimInfo.nombre}</strong></span>
                          {zonaHoverRadar.subdivision && (
                            <>
                              <span style={{ opacity: 0.5 }}>›</span>
                              <span style={{ color: zonaHoverRadar.dimInfo.color, fontWeight: 700 }}>
                                {zonaHoverRadar.subdivision}
                              </span>
                            </>
                          )}
                          <span style={{ opacity: 0.5 }}>›</span>
                          <span>Impacto <strong>{zonaHoverRadar.impacto}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* TOOLTIP FLOTANTE AL PASAR EL RATÓN */}
                    {hoveredFactorId && (
                      <div className="poam-radar-quick-hover-tip">
                        {(() => {
                          const fHover = factoresPoam.find(f => f.id === hoveredFactorId);
                          if (!fHover) return null;
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <div className="poam-tip-header">
                                <span style={{ fontSize: '0.74rem', fontWeight: 'bold', color: fHover.tipo === 'Oportunidad' ? '#10b981' : '#ef4444', whiteSpace: 'nowrap' }}>
                                  {fHover.tipo === 'Oportunidad' ? '🟢 Oportunidad' : '🔴 Amenaza'}
                                </span>
                                <span style={{ fontSize: '0.7rem', opacity: 0.85, backgroundColor: 'rgba(128,128,128,0.2)', padding: '2px 7px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                                  {fHover.categoria}
                                </span>
                                {fHover.subdivision && (
                                  <span style={{ fontSize: '0.68rem', backgroundColor: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '2px 7px', borderRadius: '4px' }}>
                                    {fHover.subdivision}
                                  </span>
                                )}
                              </div>
                              <p style={{ margin: 0, fontWeight: '600', fontSize: '0.84rem', lineHeight: '1.4', color: 'var(--text-main, #ffffff)' }}>
                                {fHover.factor}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>


                </div>
              </div>
            </div>
          ) : (
            /* ===============================================================
               MODO 2: MATRIZ TABULAR CUANTITATIVA FORMAL
               =============================================================== */
            <div className="poam-matriz-tabular-card">
              <div className="poam-matriz-header">
                <div>
                  <h3 className="poam-matriz-title">
                    <Sliders size={18} className="poam-accent-icon" />
                    Matriz Cuantitativa Formal del POAM
                  </h3>
                </div>

                <div className="poam-matriz-meta-count">
                  <span>{factoresFiltrados.length} factores listados</span>
                </div>
              </div>

              {/* TABLA FORMAL POAM */}
              <div className="poam-table-scroll-wrapper">
                <table className="poam-formal-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45px' }}>#</th>
                      <th style={{ minWidth: '220px' }}>Factor del Entorno / Evidencia</th>
                      <th style={{ minWidth: '160px' }}>Dimensión</th>
                      <th style={{ minWidth: '220px' }}>Subdivisión / Variable</th>
                      <th style={{ width: '135px' }} className="th-center op">Oportunidad (O)</th>
                      <th style={{ width: '135px' }} className="th-center am">Amenaza (A)</th>
                      <th style={{ width: '70px' }} className="th-center">Impacto</th>
                      <th style={{ minWidth: '300px' }}>Justificación Cualitativa</th>
                      <th style={{ width: '80px' }} className="th-center">Evidencias</th>
                    </tr>
                  </thead>
                  <tbody>
                    {factoresFiltrados.map((item, idx) => {
                      const esOp = item.tipo === 'Oportunidad';
                      const esAm = item.tipo === 'Amenaza';


                      return (
                        <tr
                          key={item.id}
                          className={`poam-row ${item.tipo === 'Oportunidad' ? 'row-op' : 'row-am'} ${factorSeleccionadoId === item.id ? 'selected' : ''}`}
                          onClick={() => setFactorSeleccionadoId(item.id)}
                          aria-selected={factorSeleccionadoId === item.id}
                        >
                          {/* 1. NÚMERO */}
                          <td className="td-index">{idx + 1}</td>

                          {/* 2. FACTOR */}
                          <td className="td-factor">
                            <div className="poam-table-factor-box">
                              <span className="poam-factor-title-text">{item.factor}</span>
                              {item.fuente && (
                                <span className="poam-factor-source-text">Fuente: {item.fuente}</span>
                              )}
                            </div>
                          </td>

                          {/* 3. DIMENSIÓN (Fijada por PESTEL) */}
                          <td className="td-dim">
                            {(() => {
                              const catNorm = normalizarCategoriaPoam(item.categoria) || resolverDimensionPestel(item, datosPestel, ideasLluvia);
                              const dimInfo = DIMENSIONES_POAM.find(d => d.id === catNorm);
                              return (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span
                                    className="poam-badge-dimension"
                                    style={{
                                      fontSize: '0.75rem',
                                      fontWeight: 700,
                                      padding: '3px 8px',
                                      borderRadius: '6px',
                                      backgroundColor: `${dimInfo?.color || '#38bdf8'}18`,
                                      color: dimInfo?.color || 'var(--text-main)',
                                      border: `1px solid ${dimInfo?.color || '#38bdf8'}40`,
                                      whiteSpace: 'nowrap',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                    title="Dimensión definida por el diagnóstico PESTEL (no modificable)"
                                  >
                                    <span>{dimInfo?.nombreCorto || item.categoria || 'Económica'}</span>
                                  </span>
                                </div>
                              );
                            })()}
                          </td>

                          {/* 3.1 SUBDIVISIÓN METODOLÓGICA (Editable) */}
                          <td className="td-subdivision"><span className="poam-readonly-value">{item.subdivision || '—'}</span></td>

                          {/* 4. OPORTUNIDAD: CASILLAS B (1) | M (2) | A (3) */}
                          <td className="td-center">
                            <div className="poam-pill-segmented op" style={{ opacity: esOp ? 1 : 0.3, pointerEvents: esOp ? 'auto' : 'none' }}>
                              {['Bajo', 'Medio', 'Alto'].map(cal => {
                                const activo = esOp && item.impactoConfiguradoPOAM && item.calificacion === cal;
                                return (
                                  <button
                                    key={cal}
                                    type="button"
                                    className={`poam-seg-btn op ${activo ? 'active' : ''}`}
                                    onClick={() => cambiarImpactoRapido(item.id, cal)}
                                    title={`Oportunidad ${cal}`}
                                  >
                                    {cal === 'Alto' ? 'A(3)' : cal === 'Medio' ? 'M(2)' : 'B(1)'}
                                  </button>
                                );
                              })}
                            </div>
                          </td>

                          {/* 5. AMENAZA: CASILLAS B (1) | M (2) | A (3) */}
                          <td className="td-center">
                            <div className="poam-pill-segmented am" style={{ opacity: esAm ? 1 : 0.3, pointerEvents: esAm ? 'auto' : 'none' }}>
                              {['Bajo', 'Medio', 'Alto'].map(cal => {
                                const activo = esAm && item.impactoConfiguradoPOAM && item.calificacion === cal;
                                return (
                                  <button
                                    key={cal}
                                    type="button"
                                    className={`poam-seg-btn am ${activo ? 'active' : ''}`}
                                    onClick={() => cambiarImpactoRapido(item.id, cal)}
                                    title={`Amenaza ${cal}`}
                                  >
                                    {cal === 'Alto' ? 'A(3)' : cal === 'Medio' ? 'M(2)' : 'B(1)'}
                                  </button>
                                );
                              })}
                            </div>
                          </td>

                          {/* 6. IMPACTO (Lectura) */}
                          <td className="td-center">
                            <div
                              className={`poam-table-impact-pill ${item.impactoConfiguradoPOAM && item.impacto === 'Alto' ? 'alta' : item.impactoConfiguradoPOAM && item.impacto === 'Medio' ? 'media' : item.impactoConfiguradoPOAM && item.impacto === 'Bajo' ? 'baja' : 'nula'}`}
                              style={{ cursor: 'default', opacity: item.impactoConfiguradoPOAM && item.impacto ? 1 : 0.6, background: item.impactoConfiguradoPOAM && item.impacto ? undefined : 'rgba(148, 163, 184, 0.05)', color: item.impactoConfiguradoPOAM && item.impacto ? undefined : 'var(--text-muted)', border: item.impactoConfiguradoPOAM && item.impacto ? undefined : '1px dashed var(--border-color)' }}
                            >
                              {item.impactoConfiguradoPOAM ? item.impacto || '--' : '--'}
                            </div>
                          </td>

                          {/* 7. JUSTIFICACIÓN EDITABLE EN LÍNEA */}
                          <td className="td-justificacion"><span className="poam-readonly-value">{item.justificacion || '—'}</span></td>

                          {/* 8. EVIDENCIAS DOCUMENTALES */}
                          <td className="td-center">
                            <button
                              type="button"
                              className={`pestel-btn-attach-chip ${(item.adjuntos || []).length > 0 ? 'has-attachments' : ''}`}
                              onClick={() => abrirModalAdjuntos(item.id, item.factor, item.categoria || 'POAM')}
                              title={(item.adjuntos || []).length > 0 ? `${(item.adjuntos || []).length} evidencias adjuntas` : "Adjuntar evidencia documental"}
                            >
                              <Paperclip size={12} />
                              {(item.adjuntos || []).length > 0 && <span className="pestel-attach-count">{(item.adjuntos || []).length}</span>}
                            </button>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>

                  {/* FILA DE TOTALES CUANTITATIVOS */}
                  <tfoot>
                    <tr className="poam-total-row">
                      <td colSpan="4" style={{ textAlign: 'right', fontWeight: 800 }}>
                        TOTALES DE MASA POAM:
                      </td>
                      <td className="td-center op" style={{ fontWeight: 800, color: '#10b981' }}>
                        {metricas.masaOportunidades} pts ({metricas.countOportunidades} O)
                      </td>
                      <td className="td-center am" style={{ fontWeight: 800, color: '#ef4444' }}>
                        {metricas.masaAmenazas} pts ({metricas.countAmenazas} A)
                      </td>
                      <td className="td-center" style={{ fontWeight: 800 }}>
                        {metricas.criticosNucleo} Críticos
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                        Balance Neto: <strong>{metricas.deltaMasa >= 0 ? `+${metricas.deltaMasa}` : metricas.deltaMasa} pts</strong> — {metricas.clima?.titulo || 'Entorno en Equilibrio'}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>


      </div>

      {/* =========================================================================
          3. FOOTER LIMPIO DE NAVEGACIÓN (RÉPLICA EXACTA DE PORTER)
          ========================================================================= */}
      <RespaldoHerramienta id="poam"/>
      <PieNavegacion onAnterior={onIrAPorter} onSiguiente={consolidarYExportarAFoda} claseSiguiente="btn-footer-export-foda" idSiguiente="btn-consolidar-exportar-foda"/>



      {/* =====================================================================
          MODAL DE BALANZA TRADICIONAL DE PLATILLOS A DETALLE (POAM)
          ===================================================================== */}
      {modalBalanzaAbierta && createPortal(
        <div
          className="poam-modal-overlay poam-modal-backdrop animate-fade-in"
          onClick={() => setModalBalanzaAbierta(false)}
        >
          <div
            className="poam-modal-box poam-modal-dialog poam-modal-balanza-dialog animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="poam-modal-header">
              <div className="poam-modal-title-wrap">
                <div className="poam-modal-icon-badge balanza">
                  <Scale size={20} />
                </div>
                <div>
                  <h3 className="poam-modal-title">
                    Balanza Tradicional de Platillos — Diagnóstico Gravitacional POAM
                  </h3>
                  <span className="poam-modal-subtitle">
                    Ponderación física y tensión entre Fuerzas Impulsoras (Oportunidades) y Restrictivas (Amenazas)
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="poam-modal-close-btn"
                onClick={() => setModalBalanzaAbierta(false)}
                title="Cerrar Balanza"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cuerpo del Modal: La Balanza a Detalle */}
            <div className="poam-modal-body poam-balanza-modal-body">
              {/* TARJETA HERO DE LA BALANZA TRADICIONAL DE PLATILLOS */}
              <div className="poam-tow-hero-card poam-tow-modal-card">
                {/* LADO IZQUIERDO: MASA DE OPORTUNIDADES */}
                <div className="poam-tow-side favorable">
                  <div className="poam-tow-side-header">
                    <div className="poam-tow-pill-tag op">
                      <TrendingUp size={14} />
                      <span>Oportunidades (O)</span>
                    </div>
                    <span className="poam-tow-count">{metricas.countOportunidades} Factores</span>
                  </div>

                  <div className="poam-tow-mass-val">
                    <span className="poam-tow-mass-number">{metricas.masaOportunidades}</span>
                    <span className="poam-tow-mass-unit">puntos totales ({metricas.pctMasaOp}%)</span>
                  </div>

                  <p className="poam-tow-desc">
                    Fuerzas externas de tracción positiva y margen favorable para crecer.
                  </p>
                </div>

                {/* CENTRO: BALANZA TRADICIONAL DE PLATILLOS FÍSICA Y ESTADO DEL CLIMA */}
                <div className="poam-tow-center-balance">
                  <div className="poam-scale-pans-container">
                    {/* SVG Balanza clásica de platillos basculante con física gravitatoria */}
                    <svg viewBox="0 0 340 155" className="poam-scale-pans-svg">
                      <defs>
                        <linearGradient id="balanzaPillarGradModal" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#334155" />
                          <stop offset="50%" stopColor="#94a3b8" />
                          <stop offset="100%" stopColor="#1e293b" />
                        </linearGradient>

                        <linearGradient id="balanzaBeamGradModal" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="25%" stopColor="#cbd5e1" />
                          <stop offset="50%" stopColor="#f59e0b" />
                          <stop offset="75%" stopColor="#cbd5e1" />
                          <stop offset="100%" stopColor="#ef4444" />
                        </linearGradient>

                        <linearGradient id="panOpGradModal" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#065f46" />
                          <stop offset="100%" stopColor="#022c22" />
                        </linearGradient>

                        <linearGradient id="panAmGradModal" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#991b1b" />
                          <stop offset="100%" stopColor="#450a0a" />
                        </linearGradient>

                        <filter id="panGlowOpModal" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10b981" floodOpacity="0.45" />
                        </filter>

                        <filter id="panGlowAmModal" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#ef4444" floodOpacity="0.45" />
                        </filter>
                      </defs>

                      {/* 1. BASE Y PEDESTAL CENTRAL ESTÁTICO */}
                      <ellipse cx="170" cy="144" rx="42" ry="6.5" fill="url(#balanzaPillarGradModal)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
                      <path d="M 166 144 L 168 50 L 172 50 L 174 144 Z" fill="url(#balanzaPillarGradModal)" opacity="0.95" />
                      <line x1="163" y1="126" x2="177" y2="126" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                      <line x1="165" y1="75" x2="175" y2="75" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

                      {/* Arco graduado de calibración detrás del puntero */}
                      <path d="M 148 74 A 22 22 0 0 0 192 74" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                      <line x1="170" y1="70" x2="170" y2="76" stroke="#f59e0b" strokeWidth="1.5" />
                      <line x1="154" y1="70" x2="157" y2="73" stroke="#10b981" strokeWidth="1" />
                      <line x1="186" y1="70" x2="183" y2="73" stroke="#ef4444" strokeWidth="1" />

                      {/* 2. BRAZO HORIZONTAL BASCULANTE (VIGA DE LA BALANZA) */}
                      <g
                        transform={`rotate(${metricas.anguloBalanza}, 170, 50)`}
                        style={{ transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                      >
                        {/* Viga aerodinámica biselada */}
                        <path
                          d="M 45 50 Q 105 45 170 44 Q 235 45 295 50 Q 235 55 170 56 Q 105 55 45 50 Z"
                          fill="url(#balanzaBeamGradModal)"
                          stroke="rgba(255,255,255,0.35)"
                          strokeWidth="1"
                        />

                        {/* Puntero indicador que desciende desde el fulcro hacia el arco graduado */}
                        <polygon points="168.5,50 171.5,50 170,74" fill="#f59e0b" />

                        {/* Anillas de anclaje de las cadenas en los extremos */}
                        <circle cx="45" cy="50" r="3.5" fill="none" stroke="#34d399" strokeWidth="2" />
                        <circle cx="295" cy="50" r="3.5" fill="none" stroke="#f87171" strokeWidth="2" />

                        {/* 3. PLATILLO IZQUIERDO: OPORTUNIDADES (CONTRARROTADO PARA MANTENERSE SIEMPRE HORIZONTAL) */}
                        <g
                          transform={`rotate(${-metricas.anguloBalanza}, 45, 50)`}
                          style={{ transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                        >
                          {/* Cadenas de suspensión doradas/verdes */}
                          <line x1="45" y1="52" x2="22" y2="96" stroke="#34d399" strokeWidth="1.2" strokeDasharray="2,2" opacity="0.85" />
                          <line x1="45" y1="52" x2="45" y2="96" stroke="#34d399" strokeWidth="1.2" strokeDasharray="2,2" opacity="0.9" />
                          <line x1="45" y1="52" x2="68" y2="96" stroke="#34d399" strokeWidth="1.2" strokeDasharray="2,2" opacity="0.85" />

                          {/* Plato / Platillo cóncavo */}
                          <path
                            d="M 18 96 C 18 111, 72 111, 72 96 Z"
                            fill="url(#panOpGradModal)"
                            stroke="#10b981"
                            strokeWidth="1.8"
                            filter="url(#panGlowOpModal)"
                          />
                          <ellipse cx="45" cy="96" rx="27" ry="4.5" fill="#064e3b" stroke="#34d399" strokeWidth="1" />

                          {/* Pesas / Esferas de Oportunidades en el plato */}
                          <circle cx="45" cy="89" r="6.5" fill="#10b981" stroke="#34d399" strokeWidth="1.5" />
                          <text x="45" y="92.5" textAnchor="middle" fontSize="9" fontWeight="900" fill="#ffffff">+</text>
                          <circle cx="34" cy="91" r="5" fill="#059669" stroke="#34d399" strokeWidth="1" />
                          <circle cx="56" cy="91" r="5" fill="#059669" stroke="#34d399" strokeWidth="1" />
                          <text x="45" y="123" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#34d399">
                            {metricas.masaOportunidades} pts ({metricas.pctMasaOp}%)
                          </text>
                        </g>

                        {/* 4. PLATILLO DERECHO: AMENAZAS (CONTRARROTADO PARA MANTENERSE SIEMPRE HORIZONTAL) */}
                        <g
                          transform={`rotate(${-metricas.anguloBalanza}, 295, 50)`}
                          style={{ transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                        >
                          {/* Cadenas de suspensión */}
                          <line x1="295" y1="52" x2="272" y2="96" stroke="#f87171" strokeWidth="1.2" strokeDasharray="2,2" opacity="0.85" />
                          <line x1="295" y1="52" x2="295" y2="96" stroke="#f87171" strokeWidth="1.2" strokeDasharray="2,2" opacity="0.9" />
                          <line x1="295" y1="52" x2="318" y2="96" stroke="#f87171" strokeWidth="1.2" strokeDasharray="2,2" opacity="0.85" />

                          {/* Plato / Platillo cóncavo */}
                          <path
                            d="M 268 96 C 268 111, 322 111, 322 96 Z"
                            fill="url(#panAmGradModal)"
                            stroke="#ef4444"
                            strokeWidth="1.8"
                            filter="url(#panGlowAmModal)"
                          />
                          <ellipse cx="295" cy="96" rx="27" ry="4.5" fill="#7f1d1d" stroke="#f87171" strokeWidth="1" />

                          {/* Pesas / Esferas de Amenazas en el plato */}
                          <circle cx="295" cy="91" r="6.5" fill="#ef4444" stroke="#f87171" strokeWidth="1.5" />
                          <text x="295" y="92.5" textAnchor="middle" fontSize="9" fontWeight="900" fill="#ffffff">!</text>
                          <circle cx="284" cy="91" r="5" fill="#dc2626" stroke="#f87171" strokeWidth="1" />
                          <circle cx="306" cy="91" r="5" fill="#dc2626" stroke="#f87171" strokeWidth="1" />
                          <text x="295" y="123" textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#f87171">
                            {metricas.masaAmenazas} pts ({metricas.pctMasaAm}%)
                          </text>
                        </g>
                      </g>

                      {/* Tapa frontal del Fulcro Central */}
                      <circle cx="170" cy="50" r="7" fill="#0f172a" stroke="#f59e0b" strokeWidth="2.5" />
                      <circle cx="170" cy="50" r="3" fill="#ffffff" />
                    </svg>

                    {/* BADGE DEL CLIMA DINÁMICO */}
                    <div className={`poam-tow-climate-badge ${metricas.clima?.claseColor || 'clima-equilibrio'}`}>
                      {(() => {
                        const IconoClima = metricas.clima?.icono || Scale;
                        return <IconoClima size={16} className="poam-climate-icon" />;
                      })()}
                      <span className="poam-climate-title">«{metricas.clima?.titulo || 'Entorno en Equilibrio'}»</span>
                    </div>
                  </div>

                  {/* BARRA DE TENSIÓN CUERDA / TUG OF WAR */}
                  <div className="poam-tow-rope-wrapper">
                    <div className="poam-tow-rope-track">
                      <div
                        className="poam-tow-rope-fill-op"
                        style={{ width: `${metricas.pctMasaOp}%` }}
                      />
                      <div
                        className="poam-tow-rope-fill-am"
                        style={{ width: `${metricas.pctMasaAm}%` }}
                      />
                      <div
                        className="poam-tow-rope-knot"
                        style={{ left: `${metricas.pctMasaOp}%` }}
                        title={`Balance Neto: ${metricas.deltaMasa >= 0 ? '+' : ''}${metricas.deltaMasa} pts`}
                      />
                    </div>
                    <div className="poam-tow-rope-labels">
                      <span>{metricas.pctMasaOp}% Impulso</span>
                      <span className="poam-tow-delta-pill">
                        {metricas.deltaMasa >= 0 ? `+${metricas.deltaMasa}` : metricas.deltaMasa} pts Netos
                      </span>
                      <span>{metricas.pctMasaAm}% Presión</span>
                    </div>
                  </div>
                </div>

                {/* LADO DERECHO: MASA DE AMENAZAS */}
                <div className="poam-tow-side hostil">
                  <div className="poam-tow-side-header">
                    <div className="poam-tow-pill-tag am">
                      <ShieldAlert size={14} />
                      <span>Amenazas (A)</span>
                    </div>
                    <span className="poam-tow-count">{metricas.countAmenazas} Factores</span>
                  </div>

                  <div className="poam-tow-mass-val">
                    <span className="poam-tow-mass-number">{metricas.masaAmenazas}</span>
                    <span className="poam-tow-mass-unit">puntos totales ({metricas.pctMasaAm}%)</span>
                  </div>

                  <p className="poam-tow-desc">
                    Riesgos y presiones competitivas que exigen blindaje y escudos defensivos.
                  </p>
                </div>
              </div>

              {/* DESGLOSE A DETALLE: COMPARATIVA DE PLATILLOS */}
              <div className="poam-balanza-detail-grid">
                {/* COLUMNA OPORTUNIDADES */}
                <div className="poam-detail-col favorable">
                  <div className="poam-detail-col-header">
                    <div className="poam-tow-pill-tag op">
                      <TrendingUp size={14} />
                      <span>Platillo Oportunidades ({metricas.countOportunidades})</span>
                    </div>
                    <span className="poam-col-mass-badge">+{metricas.masaOportunidades} pts</span>
                  </div>
                  <div className="poam-factors-pan-list">
                    {factoresPoam.filter(f => f.tipo === 'Oportunidad').map(f => (
                      <div key={f.id} className="poam-pan-factor-card op">
                        <div className="poam-pan-factor-header">
                          <span className="factor-dim-tag">{f.categoria}</span>
                          <span className="factor-pts-badge op">+{valorCalificacion(f.calificacion || f.impacto)} pts</span>
                        </div>
                        <p className="factor-desc-text">{f.factor}</p>
                        {f.justificacion && (
                          <span className="factor-just-text">{f.justificacion}</span>
                        )}
                      </div>
                    ))}
                    {factoresPoam.filter(f => f.tipo === 'Oportunidad').length === 0 && (
                      <div className="poam-pan-empty">No hay oportunidades registradas en la matriz.</div>
                    )}
                  </div>
                </div>

                {/* COLUMNA AMENAZAS */}
                <div className="poam-detail-col hostil">
                  <div className="poam-detail-col-header">
                    <div className="poam-tow-pill-tag am">
                      <ShieldAlert size={14} />
                      <span>Platillo Amenazas ({metricas.countAmenazas})</span>
                    </div>
                    <span className="poam-col-mass-badge am">-{metricas.masaAmenazas} pts</span>
                  </div>
                  <div className="poam-factors-pan-list">
                    {factoresPoam.filter(f => f.tipo === 'Amenaza').map(f => (
                      <div key={f.id} className="poam-pan-factor-card am">
                        <div className="poam-pan-factor-header">
                          <span className="factor-dim-tag">{f.categoria}</span>
                          <span className="factor-pts-badge am">-{valorCalificacion(f.calificacion || f.impacto)} pts</span>
                        </div>
                        <p className="factor-desc-text">{f.factor}</p>
                        {f.justificacion && (
                          <span className="factor-just-text">{f.justificacion}</span>
                        )}
                      </div>
                    ))}
                    {factoresPoam.filter(f => f.tipo === 'Amenaza').length === 0 && (
                      <div className="poam-pan-empty">No hay amenazas registradas en la matriz.</div>
                    )}
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ===============================================================
          MODAL DE CONFIGURACIÓN DEL FACTOR ESTRATÉGICO
          Se abre exclusivamente cuando el usuario hace clic en un factor
          (en el radar SVG o en la bandeja de pendientes)
          =============================================================== */}
      {factorParaModal && createPortal(
        <div className="poam-modal-overlay" onClick={cerrarModalConfig}>
          <div className="poam-modal-dialog modal-config-factor animate-scale-up" onClick={e => e.stopPropagation()}>
            
            {/* CABECERA DEL MODAL */}
            <div className="poam-modal-header">
              <div className="poam-modal-title-group">
                <div className="poam-modal-icon-badge config">
                  <Settings2 size={20} />
                </div>
                <div>
                  <h3 className="poam-modal-title">Configuración del Factor</h3>
                  <span className="poam-modal-subtitle">
                    Ajusta la calibración estratégica y justificación antes de ubicar en el radar
                  </span>
                </div>
              </div>
              <div className="poam-modal-header-actions">
                <button
                  type="button"
                  className={`pestel-btn-attach-chip ${(factorParaModal.adjuntos || []).length > 0 ? 'has-attachments' : ''}`}
                  onClick={() => abrirModalAdjuntos(factorParaModal.id, factorParaModal.factor, factorParaModal.categoria || 'POAM')}
                  title="Gestionar evidencias documentales del factor"
                  style={{ height: '24px', padding: '0 8px', gap: '4px', fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center' }}
                >
                  <Paperclip size={12} />
                  <span>Evidencias {(factorParaModal.adjuntos || []).length > 0 && `(${(factorParaModal.adjuntos || []).length})`}</span>
                </button>
                <span className={`poam-pill-status ${factorParaModal.ubicadoEnRadar ? 'colocado' : 'pendiente'}`}>
                  {factorParaModal.ubicadoEnRadar ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> En Radar</div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> En Pendientes</div>
                  )}
                </span>
                <button
                  type="button"
                  className="poam-modal-close-btn"
                  onClick={cerrarModalConfig}
                  title="Cerrar modal"
                  aria-label="Cerrar modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* CUERPO DEL MODAL */}
            <div className="poam-modal-body poam-config-factor-body">
              
              {/* RESUMEN DEL FACTOR (CARD HERO) */}
              <div className="poam-config-hero-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} style={{ color: 'var(--accent-color, #ea580c)' }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '0.01em' }}>
                      Factor Evaluado:
                    </span>
                  </div>
                </div>
                <h4 className="poam-config-hero-text">{factorParaModal.factor}</h4>
              </div>

              {/* CONTROL 1: DIMENSIÓN DEL POAM (DEFINIDA POR PESTEL - FIJA) */}
              <div className="poam-config-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="poam-config-label" style={{ margin: 0 }}>
                    <Compass size={14} className="poam-label-icon" />
                    <span>Dimensión del POAM (Fijada por PESTEL):</span>
                  </label>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(234, 88, 12, 0.1)',
                      color: 'var(--accent-color, #ea580c)',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    🔒 Definida por PESTEL
                  </span>
                </div>

                {(() => {
                  const catNorm = normalizarCategoriaPoam(factorParaModal.categoria) || resolverDimensionPestel(factorParaModal, datosPestel, ideasLluvia);
                  const dimActual = DIMENSIONES_POAM.find(d => d.id === catNorm) || DIMENSIONES_POAM[0];
                  const IconoDim = dimActual.icono;
                  return (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: `1.5px solid ${dimActual.color}`,
                        backgroundColor: `${dimActual.color}14`
                      }}
                    >
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: `${dimActual.color}25`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: dimActual.color
                        }}
                      >
                        <IconoDim size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            Dimensión {dimActual.nombreCorto || dimActual.nombre}
                          </span>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              color: dimActual.color,
                              fontWeight: 700,
                              backgroundColor: `${dimActual.color}20`,
                              padding: '0.1rem 0.45rem',
                              borderRadius: '4px'
                            }}
                          >
                            {dimActual.subtitulo || 'Sector POAM'}
                          </span>
                        </div>
                        <p style={{ margin: '0.15rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {dimActual.descripcion}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* CONTROL 1.1: SUBDIVISIÓN METODOLÓGICA DE LA DIMENSIÓN */}
              {(() => {
                const catNorm = normalizarCategoriaPoam(factorParaModal.categoria) || resolverDimensionPestel(factorParaModal, datosPestel, ideasLluvia);
                const dimActual = DIMENSIONES_POAM.find(d => d.id === catNorm);
                const subdivs = obtenerSubdivisionesPorDimension(catNorm);

                return (
                  <div className="poam-config-section poam-config-section-subdiv">
                    <div className="poam-subdiv-section-header">
                      <label className="poam-config-label" style={{ margin: 0 }}>
                        <Layers size={15} className="poam-label-icon" />
                        <span>Subdivisión Metodológica / Variable Clave:</span>
                      </label>
                      {factorParaModal.subdivision ? (
                        <span className="poam-subdiv-active-tag">
                          Asignada:{' '}
                          <strong style={{ color: dimActual?.color || 'var(--accent-color, #ea580c)' }}>
                            {factorParaModal.subdivision}
                          </strong>
                        </span>
                      ) : (
                        <span className="poam-subdiv-active-tag" style={{ borderStyle: 'dashed', opacity: 0.85 }}>
                          <em>Esperando selección del usuario</em>
                        </span>
                      )}
                    </div>

                    {factorParaModal.origenPestel ? (
                      <div className="poam-readonly-field">
                        <span>{factorParaModal.subdivisionRadar || resolverSubdivisionRadar(factorParaModal, catNorm)}</span>
                        <small>Sincronizada desde PESTEL</small>
                      </div>
                    ) : <div className="poam-subdiv-selection-grid">
                      {subdivs.map((sub, idx) => {
                        const esActiva = factorParaModal.subdivision === sub.nombre;
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            disabled={factorParaModal.origenPestel}
                            className={`poam-subdiv-select-card ${esActiva ? 'active' : ''}`}
                            onClick={() => cambiarSubdivisionModal(sub.nombre)}
                            style={{
                              borderColor: esActiva ? dimActual?.color : undefined,
                              backgroundColor: esActiva ? `${dimActual?.color}16` : undefined
                            }}
                          >
                            <div className="poam-subdiv-card-content">
                              <span
                                className={`poam-subdiv-index-badge ${esActiva ? 'active' : ''}`}
                                style={{
                                  borderColor: esActiva ? dimActual?.color : undefined,
                                  backgroundColor: esActiva ? dimActual?.color : undefined,
                                  color: esActiva ? '#ffffff' : undefined
                                }}
                              >
                                {idx + 1}
                              </span>
                              <span
                                className="poam-subdiv-card-title"
                                style={{
                                  color: esActiva ? (dimActual?.color || 'var(--accent-color, #ea580c)') : 'var(--text-main)'
                                }}
                              >
                                {sub.nombre}
                              </span>
                            </div>
                            <div
                              className={`poam-subdiv-check-badge ${esActiva ? 'active' : ''}`}
                              style={{
                                borderColor: esActiva ? dimActual?.color : undefined,
                                backgroundColor: esActiva ? `${dimActual?.color}25` : undefined,
                                color: esActiva ? (dimActual?.color || 'var(--accent-color, #ea580c)') : undefined
                              }}
                            >
                              {esActiva ? (
                                <Check size={14} strokeWidth={3} />
                              ) : (
                                <span className="poam-subdiv-radio-placeholder" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                      {subdivs.length === 0 && (
                        <div className="poam-subdiv-empty-hint">
                          Selecciona primero una dimensión para ver y asignar sus subdivisiones.
                        </div>
                      )}
                    </div>}
                  </div>
                );
              })()}

              {/* CONTROL 2: CALIBRACIÓN TÁCTICA (POLARIDAD E IMPACTO/FUERZA) */}
              <div className="poam-config-section">
                <label className="poam-config-label">
                  <Sliders size={14} className="poam-label-icon" />
                  <span>Calibración y Ponderación Estratégica:</span>
                </label>

                <div className="poam-config-dials-grid">
                  
                  {/* POLARIDAD (SUGERENCIA EDITABLE) */}
                  <div className="poam-config-dial-box poam-polaridad-box">
                    <span className="poam-dial-box-title">
                      <Scale size={12} />
                      Polaridad del Factor:
                      <span
                        className="poam-polaridad-sugerencia-badge"
                        style={{
                          fontSize: '0.67rem',
                          fontWeight: 600,
                          marginLeft: 'auto',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#3b82f6',
                          border: '1px solid rgba(59, 130, 246, 0.25)'
                        }}
                        title={factorParaModal.origenPestel ? 'Polaridad definida en PESTEL' : 'Puedes modificar la polaridad del factor.'}
                      >
                        {factorParaModal.origenPestel ? 'Definida en PESTEL' : 'Editable'}
                      </span>
                    </span>
                    {factorParaModal.origenPestel ? (
                      <div className={`poam-readonly-field poam-readonly-polarity ${factorParaModal.tipo === 'Oportunidad' ? 'op' : 'am'}`}>
                        {factorParaModal.tipo === 'Oportunidad' ? '🟢 Oportunidad' : '🔴 Amenaza'}
                        <small>Sincronizada desde PESTEL</small>
                      </div>
                    ) : <div className="segmented-dial-grid poam-polaridad-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                      <button
                        type="button"
                        disabled={factorParaModal.origenPestel}
                        className={`btn-dial-item dial-item baja btn-dial-baja op poam-btn-polaridad ${factorParaModal.tipo === 'Oportunidad' ? 'active' : ''}`}
                        onClick={() => cambiarPolaridadModal('Oportunidad')}
                        title="Calibrar como Oportunidad (favorable para la empresa)"
                      >
                        🟢 Oportunidad
                      </button>
                      <button
                        type="button"
                        disabled={factorParaModal.origenPestel}
                        className={`btn-dial-item dial-item alta btn-dial-alta am poam-btn-polaridad ${factorParaModal.tipo === 'Amenaza' ? 'active' : ''}`}
                        onClick={() => cambiarPolaridadModal('Amenaza')}
                        title="Calibrar como Amenaza (riesgo o adverso para la empresa)"
                      >
                        🔴 Amenaza
                      </button>
                    </div>}
                  </div>

                  {/* ANILLO DE IMPACTO Y CALIFICACIÓN DE FUERZA (FUSIONADO) */}
                  <div className="poam-config-dial-box">
                    <span className="poam-dial-box-title">
                      <Target size={12} />
                      Anillo de Impacto y Calificación de Fuerza:
                    </span>
                    <div className="segmented-dial-grid">
                      {[
                        { id: 'Bajo', label: 'Bajo (1 pt · Periférico)', lvlKey: 'baja' },
                        { id: 'Medio', label: 'Medio (2 pts · Medio)', lvlKey: 'media' },
                        { id: 'Alto', label: 'Alto (3 pts · Núcleo)', lvlKey: 'alta' }
                      ].map(item => {
                        const lvlKey = item.lvlKey;
                        const activo = factorParaModal.impacto === item.id || factorParaModal.calificacion === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={`btn-dial-item dial-item ${lvlKey} btn-dial-${lvlKey} ${activo ? 'active' : ''}`}
                            onClick={() => cambiarImpactoModal(item.id)}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

              {/* CONTROL 3: JUSTIFICACIÓN ESTRATÉGICA */}
              <div className="poam-config-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="poam-config-label" style={{ margin: 0 }}>
                    <BookOpen size={14} className="poam-label-icon" />
                    <span>Justificación Estratégica:</span>
                  </label>
                  {!factorParaModal.origenPestel && factorParaModal.justificacionOriginal && factorParaModal.justificacionOriginal !== factorParaModal.justificacion && (
                    <button
                      type="button"
                      onClick={() => cambiarJustificacionModal(factorParaModal.justificacionOriginal)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-color, #ea580c)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Restablecer a la redacción sugerida por el diagnóstico base"
                    >
                      <RotateCcw size={11} /> Restaurar sugerencia base
                    </button>
                  )}
                </div>

                <textarea
                  rows="3"
                  className="poam-form-textarea"
                  style={{
                    fontSize: '0.82rem',
                    lineHeight: 1.45,
                    minHeight: '80px'
                  }}
                  placeholder="Argumenta el por qué de la asignación del impacto y calificación a este factor externo..."
                  value={factorParaModal.justificacion || ''}
                  onChange={(e) => cambiarJustificacionModal(e.target.value)}
                />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.68rem',
                    color: 'var(--text-muted)',
                    padding: '2px 2px 0'
                  }}
                >
                  <span>
                    {(factorParaModal.justificacion || '').trim().length >= 25 ? (
                      <span style={{ color: '#10b981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={11} /> Argumentación documentada
                      </span>
                    ) : (
                      <span style={{ color: '#f59e0b', fontWeight: 500 }}>
                        ℹ Se sugiere un argumento descriptivo de al menos 25 caracteres.
                      </span>
                    )}
                  </span>
                  <span>{(factorParaModal.justificacion || '').length} caracteres</span>
                </div>
              </div>

              {/* CONTROL 4: ESTADO Y CONTROL DE UBICACIÓN EN RADAR */}
              <div className="poam-config-location-banner">
                {factorParaModal.ubicadoEnRadar ? (
                  <div className="poam-location-status placed">
                    <div className="poam-location-text">
                      <Target size={18} className="poam-location-icon placed" />
                      <div>
                        <strong>Situado en el Radar Táctico</strong>
                        <p>Visible en el sector <em>{factorParaModal.categoria}</em> con impacto y fuerza <em>{factorParaModal.impacto} ({valorCalificacion(factorParaModal.calificacion)} pts)</em>.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="poam-btn-location-action unplace"
                      onClick={() => {
                        desubicarFactor(factorParaModal.id);
                        cerrarModalConfig();
                      }}
                      title="Quitar del radar y devolver a su estado inicial"
                    >
                      <RotateCcw size={14} />
                      <span>Quitar del Radar</span>
                    </button>
                  </div>
                ) : (
                  <div className="poam-location-status pending">
                    <div className="poam-location-text">
                      <Target size={18} className="poam-location-icon pending" />
                      <div>
                        <strong>Pendiente de Ubicar</strong>
                        <p>
                          {!tieneImpacto
                            ? 'Selecciona el Anillo de Impacto y Calificación de Fuerza para habilitar la ubicación en el radar.'
                            : 'Impacto seleccionado. Haz clic en Ubicar en Radar para situar este factor en su dimensión y subdimensión PESTEL.'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="poam-btn-location-action place"
                      disabled={!camposCompletosModal}
                      onClick={confirmarYUbicarEnRadar}
                      title={camposCompletosModal ? "Colocar inmediatamente este factor en el radar táctico" : "Debes seleccionar el Anillo de Impacto y Calificación de Fuerza"}
                    >
                      <Target size={14} />
                      <span>✓ Ubicar en Radar</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* PIE DE ACCIONES PRINCIPALES DEL MODAL (FIJO) */}
            <div className="poam-modal-footer poam-config-modal-footer">
              <div className="poam-auto-sync-status">
                {factorParaModal.ubicadoEnRadar ? (
                  <span className="poam-sync-indicator-live">
                    <span className="poam-sync-dot" />
                    Ubicado en el radar táctico
                  </span>
                ) : (
                  <span className="poam-sync-indicator-pending">
                    {!camposCompletosModal ? (
                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                        {!tieneImpacto ? 'Selecciona el nivel de impacto.' : !metadatosCompletosModal ? 'El factor requiere dimensión, subdimensión y polaridad válidas en PESTEL.' : 'Completa la evaluación del factor.'}
                      </span>
                    ) : (
                      <span style={{ color: '#10b981', fontWeight: 600 }}>
                        ✓ Todos los campos seleccionados (listo para ubicar)
                      </span>
                    )}
                  </span>
                )}
              </div>

              <div className="poam-modal-actions">
                {factorParaModal.ubicadoEnRadar && (
                  <button
                    type="button"
                    className="poam-btn-location-action unplace"
                    onClick={() => {
                      desubicarFactor(factorParaModal.id);
                      cerrarModalConfig();
                    }}
                    title="Quitar del radar y devolver a su estado inicial"
                    style={{ padding: '8px 14px' }}
                  >
                    <RotateCcw size={14} />
                    <span>Quitar del Radar</span>
                  </button>
                )}

                <button
                  type="button"
                  className="poam-modal-btn-cancel"
                  onClick={cerrarModalConfig}
                >
                  Cerrar
                </button>

                {factorParaModal.ubicadoEnRadar ? (
                  <button
                    type="button"
                    className="poam-modal-btn-save"
                    onClick={guardarCambiosFactorUbicado}
                    title="Guardar calibraciones del factor en el radar"
                  >
                    <Check size={16} />
                    <span>Guardar Cambios</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="poam-modal-btn-save"
                    disabled={!camposCompletosModal}
                    onClick={confirmarYUbicarEnRadar}
                    title={camposCompletosModal ? "Situar este factor en el radar táctico" : "Selecciona el Anillo de Impacto y Calificación de Fuerza"}
                  >
                    <Target size={16} />
                    <span>✓ Ubicar en Radar</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* MODAL DE EVIDENCIA DOCUMENTAL POR FACTOR (.pdf, imágenes, hojas de cálculo, URL) */}
      {modalAdjuntos.abierto && createPortal(
        <div className="pestel-modal-overlay" onClick={cerrarModalAdjuntos}>
          <div className="pestel-modal-container" onClick={(e) => e.stopPropagation()}>
            {/* CABECERA DEL MODAL */}
            <div className="pestel-modal-header">
              <div className="pestel-modal-header-info">
                <span className="pestel-modal-pretitle">
                  <Paperclip size={13} />
                  <span>Evidencia Documental • {modalAdjuntos.dimensionNombre || 'POAM'}</span>
                </span>
                <h3 className="pestel-modal-title">Respaldos del Factor</h3>
                <p className="pestel-modal-factor-quote">
                  «{modalAdjuntos.factorTexto}»
                </p>
              </div>
              <button
                type="button"
                className="pestel-modal-btn-close"
                onClick={cerrarModalAdjuntos}
                title="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* CUERPO DEL MODAL */}
            <div className="pestel-modal-body">
              {/* PESTAÑAS DE TIPOS DE DOCUMENTO */}
              <div className="pestel-modal-type-tabs">
                <button
                  type="button"
                  className={`pestel-modal-tab-btn ${tabTipoAdjunto === 'pdf' ? 'active pdf' : ''}`}
                  onClick={() => { setTabTipoAdjunto('pdf'); setArchivoSeleccionado(null); }}
                >
                  <FileText size={14} />
                  <span>Documento PDF</span>
                </button>

                <button
                  type="button"
                  className={`pestel-modal-tab-btn ${tabTipoAdjunto === 'imagen' ? 'active img' : ''}`}
                  onClick={() => { setTabTipoAdjunto('imagen'); setArchivoSeleccionado(null); }}
                >
                  <Image size={14} />
                  <span>Imagen / Captura</span>
                </button>

                <button
                  type="button"
                  className={`pestel-modal-tab-btn ${tabTipoAdjunto === 'hoja_calculo' ? 'active sheet' : ''}`}
                  onClick={() => { setTabTipoAdjunto('hoja_calculo'); setArchivoSeleccionado(null); }}
                >
                  <FileSpreadsheet size={14} />
                  <span>Planilla Excel / CSV</span>
                </button>

                <button
                  type="button"
                  className={`pestel-modal-tab-btn ${tabTipoAdjunto === 'enlace' ? 'active link' : ''}`}
                  onClick={() => { setTabTipoAdjunto('enlace'); setArchivoSeleccionado(null); }}
                >
                  <Link2 size={14} />
                  <span>Enlace Web Externo</span>
                </button>
              </div>

              {/* ÁREA DE CARGA O INGRESO SEGÚN EL TIPO */}
              <div className="pestel-modal-upload-panel">
                {tabTipoAdjunto === 'enlace' ? (
                  <form onSubmit={guardarAdjuntoEnlace} className="pestel-modal-link-form">
                    <div className="pestel-modal-field">
                      <label>URL o Enlace Web de la Fuente Externa *</label>
                      <div className="pestel-input-icon-wrap">
                        <Link2 size={14} className="input-icon" />
                        <input
                          type="url"
                          placeholder="https://ejemplo.com/estudio-o-noticia"
                          value={urlEnlaceInput}
                          onChange={(e) => setUrlEnlaceInput(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="pestel-modal-field">
                      <label>Nombre o Título Descriptivo de la Fuente (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ej: Reporte Sectorial de Competitividad 2026"
                        value={tituloEnlaceInput}
                        onChange={(e) => setTituloEnlaceInput(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="pestel-modal-btn-submit">
                      <Plus size={13} />
                      <span>Vincular Enlace</span>
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
              {(() => {
                const factorModal = (factoresPoam || []).find(f => f.id === modalAdjuntos.factorId);
                const listaAdjuntos = factorModal?.adjuntos || [];

                return (
                  <div className="pestel-modal-attached-section">
                    <div className="pestel-modal-attached-header">
                      <span className="pestel-attached-title">
                        Evidencias Registradas ({listaAdjuntos.length})
                      </span>
                      <span className="pestel-attached-help">
                        Respaldo empírico del factor para análisis de la Matriz POAM
                      </span>
                    </div>

                    {listaAdjuntos.length === 0 ? (
                      <div className="pestel-modal-empty-attached">
                        <Paperclip size={18} style={{ opacity: 0.35 }} />
                        <p>No hay evidencia documental registrada para este factor todavía.</p>
                        <span>Selecciona una pestaña arriba para subir PDFs, imágenes, planillas Excel/CSV o enlaces web externos.</span>
                      </div>
                    ) : (
                      <div className="pestel-attached-cards-grid">
                        {listaAdjuntos.map((adj) => (
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
                                onClick={() => eliminarAdjunto(modalAdjuntos.factorId, adj.id)}
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
                );
              })()}
            </div>

            {/* PIE DEL MODAL */}
            <div className="pestel-modal-footer">
              <span className="pestel-modal-footer-hint">
                Las evidencias respaldan la calificación de impacto y polaridad asignada en el POAM.
              </span>
              <button
                type="button"
                className="pestel-modal-btn-done"
                onClick={cerrarModalAdjuntos}
              >
                Listo
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      <ReportePdfPoam ref={reportePDFRef} caso={casoActivo} factores={factoresPoam.filter(factor => factor.origenPestel)} />
    </div>
  );
}
