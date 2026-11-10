import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  FolderOpen,
  Target,
  Star,
  MapPin,
  Sliders,
  Factory,
  Play,
  Building2,
  X,
  SunMedium,
  Check,
  CheckCircle2,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Sparkles,
  GripVertical,
  Newspaper,
  ChevronRight,
  Plus,
  Trash2,
  Edit,
  Filter,
  CheckSquare,
  Square,
  Layers,
  ChevronDown,
  ChevronUp,
  Globe,
  PanelRightClose,
  PanelRightOpen,
  Search,
  Lock,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { alerta } from '../../utils/Notificaciones';
import MatrizPerfilCompetitivo from './fase3-diagnostico-externo/mpc/MatrizPerfilCompetitivo';
import DiagramaPOAM from './fase3-diagnostico-externo/poam/DiagramaPOAM';
import MatrizEFI from './fase4-diagnostico-interno/matriz-efi/MatrizEFI';
import AnalisisVerticalHorizontal from './fase4-diagnostico-interno/analisis-vertical-horizontal/AnalisisVerticalHorizontal';
import CustomerJourneyMap from './fase4-diagnostico-interno/customer-journey/CustomerJourneyMap';
import Flujogramas from './fase4-diagnostico-interno/flujogramas/Flujogramas';
import AuditoriaRedesSociales from './fase4-diagnostico-interno/auditoria-redes/AuditoriaRedesSociales';
import Evaluacion360 from './fase4-diagnostico-interno/evaluacion-360/Evaluacion360';
import InventariosAlmacenes from './fase4-diagnostico-interno/inventarios/InventariosAlmacenes';
import ResumenIdentificacionProblema from './fase5-analisis-resultados/resumenes/ResumenIdentificacionProblema';
import MatrizDafo from './fase6-planificacion/dafo/MatrizDafo';
import MatrizAnsoff from './fase6-planificacion/ansoff/MatrizAnsoff';
import { normalizarPlan, prepararFactoresFoda } from './fase6-planificacion/calculosPlanificacion';
import ResumenDiagnosticoExterno from './fase5-analisis-resultados/resumenes/ResumenDiagnosticoExterno';
import ResumenDiagnosticoInterno from './fase5-analisis-resultados/resumenes/ResumenDiagnosticoInterno';
import { HERRAMIENTAS_INTERNAS } from './fase4-diagnostico-interno/herramientasInternas';
import { LISTA_HERRAMIENTAS_DIAGNOSTICO } from './simulacion/catalogoHerramientasDiagnostico';
import LimiteErroresHerramienta from './simulacion/LimiteErroresHerramienta';
import { sincronizarDesdePasosPrevios } from './fase5-analisis-resultados/foda/sincronizacionFoda';
import ModalCrearCaso from './caso/ModalCrearCaso';
import {
  obtenerFactoresPoamIniciales,
  generarFactoresDesdePorterYPEST,
  DIMENSIONES_POAM,
  resolverSubdivisionRadar,
  normalizarCategoriaPoam
} from './fase3-diagnostico-externo/poam/datosPoam';
import DiagramaPorter from './fase3-diagnostico-externo/porter/DiagramaPorter';
import { obtenerDatosPorterIniciales } from './fase3-diagnostico-externo/porter/datosPorter';
import AnalisisPESTEL from './fase3-diagnostico-externo/pestel/AnalisisPESTEL';
import { obtenerDatosPestelIniciales, generarPayloadPoamDesdePestel } from './fase3-diagnostico-externo/pestel/datosPestel';
import ArbolProblemas from './fase2-identificacion-problema/arbol-problemas/ArbolProblemas';
import { obtenerDatosArbolIniciales } from './fase2-identificacion-problema/arbol-problemas/datosArbolProblemas';
import DossierCaso from './caso/DossierCaso';
import api from '../../services/api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReportePdfFase2 from './fase2-identificacion-problema/ReportePdfFase2';
import ReportePdfPestel from './fase3-diagnostico-externo/pestel/ReportePdfPestel';
import ReportePdfPorter from './fase3-diagnostico-externo/porter/ReportePdfPorter';
import ReportePdfMpc from './fase3-diagnostico-externo/mpc/ReportePdfMpc';
import { BotonPdf } from './compartido/BotonPdf';
import useExportarResumen from './compartido/pdf/useExportarResumen';
import { IDS_FASE4, NOMBRES_HERRAMIENTAS, TODAS_LAS_HERRAMIENTAS, herramientasClasicas, herramientasDelCaso } from './caso/herramientasCaso';
import ModalConfirmarEliminacion from './compartido/modales/ModalConfirmarEliminacion';
import { calcularEstadoFases } from './simulacion/progresoFases';
import { EncabezadoHerramienta } from './compartido/ComponentesHerramienta';
import PieNavegacion from './simulacion/PieNavegacion';
import RespaldoHerramienta from './compartido/documentos/RespaldoHerramienta';
import { RESPALDO_VACIO, RespaldoHerramientas } from './compartido/documentos/configRespaldo';
import { NavegacionPasos } from './simulacion/navegacionPasos';
import { ICONOS_HERRAMIENTAS } from './simulacion/iconosHerramientas';
import { NOMBRES_FASES, actualizarAvance, borrarAvance, claveCaso, guardarAvance, haceCuanto, leerAvance, leerAvances } from './simulacion/avanceSimulacion';
import './AnalisisEmpresarial.css';
import './compartido/estilos/EstilosReportePdf.css';

// Componente de cada herramienta de la Fase 4 (se elige según el paso activo)
const COMPONENTES_INTERNOS = {
  'interno-vertical-horizontal': AnalisisVerticalHorizontal,
  'customer-journey': CustomerJourneyMap,
  flujogramas: Flujogramas,
  'auditoria-redes': AuditoriaRedesSociales,
  'evaluacion-360': Evaluacion360,
  inventarios: InventariosAlmacenes
};

export default function AnalisisEmpresarial({ usuario }) {
  const puedeCrearCasos = Boolean(usuario); // docentes y estudiantes con sesión iniciada pueden crear casos
  // El servidor solo entrega los casos del propio usuario y valida cada edición/eliminación (usuario.id es el correo, no el id numérico)
  const puedeGestionarCaso = (caso) => Boolean(usuario) && String(caso.id).startsWith('db-');
  
  const [modalCrearCaso, setModalCrearCaso] = useState(false);
  const [modalEditarCaso, setModalEditarCaso] = useState(null);

  // Estado del Laboratorio de Simulación Activo (Pantalla detallada de simulación)
  const [casoActivoSimulacion, setCasoActivoSimulacion] = useState(null);
  const [faseActual, setFaseActual] = useState(1); // 1: Contexto, 2: Identificación de Problema, 3: Diag. Externo, 4: Diag. Interno, 5: Análisis de Resultado, 6: Planificación y Decisiones
  const [modalEvaluacionFase, setModalEvaluacionFase] = useState(false);
  const [confirmarReinicio, setConfirmarReinicio] = useState(null); // caso cuyo avance se va a borrar
  const [versionAvances, setVersionAvances] = useState(0);
  const [respaldos, setRespaldos] = useState({}); // conclusión y documentos de las herramientas sin almacenamiento propio
  const actualizarRespaldo = useCallback((id, transformar) => setRespaldos(previos => ({ ...previos, [id]: transformar(previos[id] || RESPALDO_VACIO) })), []);
  const valorRespaldo = useMemo(() => ({ leer: id => respaldos[id] || RESPALDO_VACIO, actualizar: actualizarRespaldo }), [respaldos, actualizarRespaldo]);
  const [pasosVisitados, setPasosVisitados] = useState([]); // pasos abiertos (los reportes cuentan como usados al abrirlos)

  // Sub-paso activo dentro de la simulación: 'contexto' (Contexto del Caso), 'lluvia' (Lluvia de Ideas), 'porter' (5 Fuerzas de Porter), 'poam' (Diagrama POAM), 'foda' (Matriz FODA)
  const [subFase1, setSubFase1] = useState('contexto');

  // Factores del Perfil de Oportunidades y Amenazas del Medio (POAM)
  const [factoresPoam, setFactoresPoam] = useState([]);

  // Estado del Análisis PESTEL (Fase 3, Paso 3.1)
  const [datosPestel, setDatosPestel] = useState(() => obtenerDatosPestelIniciales('cafe-tunari'));

  // Estado del Análisis de las 5 Fuerzas de Michael Porter (Fase 3, Paso 3.2)
  const [datosPorter, setDatosPorter] = useState(() => obtenerDatosPorterIniciales('cafe-tunari'));

  // Estado de la Matriz de Perfil Competitivo (Fase 5 / Subfase MPC)
  const [datosMpc, setDatosMpc] = useState(null);

  // Estado de la Matriz EFI (Fase 4 / Subfase EFI - Evaluación de Factores Internos)
  const [datosEfi, setDatosEfi] = useState(null);
  const [datosDiagnosticoInterno, setDatosDiagnosticoInterno] = useState(() => {
    try { return JSON.parse(localStorage.getItem('simulador:diagnostico-interno:v1') || '{}'); }
    catch { return {}; }
  });
  const casoInternoKey = casoActivoSimulacion?.id || casoActivoSimulacion?._id || casoActivoSimulacion?.titulo || 'caso-activo';
  // Fase 6: estrategias DAFO e iniciativas Ansoff, guardadas por caso en este navegador
  const [datosPlanificacion, setDatosPlanificacion] = useState(() => {
    try { return JSON.parse(localStorage.getItem('simulador:planificacion:v1') || '{}'); }
    catch { return {}; }
  });
  useEffect(() => {
    try { localStorage.setItem('simulador:planificacion:v1', JSON.stringify(datosPlanificacion)); }
    catch (error) { console.warn('No se pudo guardar la planificación en este navegador:', error); }
  }, [datosPlanificacion]);
  const planCaso = useMemo(() => normalizarPlan(datosPlanificacion[casoInternoKey]), [datosPlanificacion, casoInternoKey]);
  const actualizarPlanCaso = (transformar) => setDatosPlanificacion(previo => ({ ...previo, [casoInternoKey]: transformar(normalizarPlan(previo[casoInternoKey])) }));
  useEffect(() => {
    try { localStorage.setItem('simulador:diagnostico-interno:v1', JSON.stringify(datosDiagnosticoInterno)); }
    catch (error) { console.warn('No se pudieron guardar los datos del diagnóstico interno en este navegador:', error); }
  }, [datosDiagnosticoInterno]);

  // Estado del Árbol de Problemas (Fase 2, Paso 2.2)
  const [datosArbol, setDatosArbol] = useState(() => obtenerDatosArbolIniciales('cafe-tunari'));

  // Exportación a PDF individual para Lluvia de Ideas (Paso 2.1)
  const reporteLluviaRef = useRef(null);
  const [exportandoLluviaPDF, setExportandoLluviaPDF] = useState(false);

  const exportarLluviaPDF = async () => {
    if (exportandoLluviaPDF) return;
    if (!reporteLluviaRef.current) {
      alerta.error("Error", "No se encontró el contenedor de Lluvia de Ideas para exportar.");
      return;
    }

    try {
      setExportandoLluviaPDF(true);
      alerta.info("Generando PDF", "Preparando documento de Lluvia de Ideas...");

      const elemento = reporteLluviaRef.current;
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1000
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const totalImgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = totalImgHeight;
      let position = 0;

      // Primera página
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Páginas adicionales automáticas
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const nombreCaso = (casoActivoSimulacion?.nombre || casoActivoSimulacion?.titulo || 'Caso')
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      const fechaHoy = new Date().toISOString().split('T')[0];
      pdf.save(`Reporte_Lluvia_de_Ideas_${nombreCaso}_${fechaHoy}.pdf`);

      alerta.exito("PDF Descargado", "El reporte de Lluvia de Ideas ha sido guardado correctamente.");
    } catch (err) {
      console.error("Error al exportar Lluvia a PDF:", err);
      alerta.error("Error al exportar", "No se pudo generar el documento PDF.");
    } finally {
      setExportandoLluviaPDF(false);
    }
  };

  // Exportación a PDF individual para Árbol de Problemas (Paso 2.2)
  const reporteArbolRef = useRef(null);
  const [exportandoArbolPDF, setExportandoArbolPDF] = useState(false);

  const exportarArbolPDF = async () => {
    if (exportandoArbolPDF) return;
    if (!reporteArbolRef.current) {
      alerta.error("Error", "No se encontró el contenedor del Árbol de Problemas para exportar.");
      return;
    }

    try {
      setExportandoArbolPDF(true);
      alerta.info("Generando PDF", "Preparando documento del Árbol de Problemas...");

      const elemento = reporteArbolRef.current;
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1000
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const totalImgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = totalImgHeight;
      let position = 0;

      // Primera página
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Páginas adicionales automáticas
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const nombreCaso = (casoActivoSimulacion?.nombre || casoActivoSimulacion?.titulo || 'Caso')
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      const fechaHoy = new Date().toISOString().split('T')[0];
      pdf.save(`Reporte_Arbol_de_Problemas_${nombreCaso}_${fechaHoy}.pdf`);

      alerta.exito("PDF Descargado", "El reporte del Árbol de Problemas ha sido guardado correctamente.");
    } catch (err) {
      console.error("Error al exportar Árbol a PDF:", err);
      alerta.error("Error al exportar", "No se pudo generar el documento PDF.");
    } finally {
      setExportandoArbolPDF(false);
    }
  };

  // Exportación a PDF individual para Análisis PESTEL (Paso 3.1)
  const reportePestelRef = useRef(null);
  const [exportandoPestelPDF, setExportandoPestelPDF] = useState(false);

  const exportarPestelPDF = async () => {
    if (exportandoPestelPDF) return;
    if (!reportePestelRef.current) {
      alerta.error("Error", "No se encontró el contenedor del Análisis PESTEL para exportar.");
      return;
    }

    try {
      setExportandoPestelPDF(true);
      alerta.info("Generando PDF", "Preparando documento del Análisis PESTEL...");

      const elemento = reportePestelRef.current;
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1000
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const totalImgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = totalImgHeight;
      let position = 0;

      // Primera página
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Páginas adicionales automáticas
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const nombreCaso = (casoActivoSimulacion?.nombre || casoActivoSimulacion?.titulo || 'Caso')
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      const fechaHoy = new Date().toISOString().split('T')[0];
      pdf.save(`Reporte_Analisis_PESTEL_${nombreCaso}_${fechaHoy}.pdf`);

      alerta.exito("PDF Descargado", "El reporte del Análisis PESTEL ha sido guardado correctamente.");
    } catch (err) {
      console.error("Error al exportar PESTEL a PDF:", err);
      alerta.error("Error al exportar", "No se pudo generar el documento PDF.");
    } finally {
      setExportandoPestelPDF(false);
    }
  };

  // Exportación a PDF individual para Las 5 Fuerzas de Porter (Paso 3.2)
  const reportePorterRef = useRef(null);
  const [exportandoPorterPDF, setExportandoPorterPDF] = useState(false);

  const exportarPorterPDF = async () => {
    if (exportandoPorterPDF) return;
    if (!reportePorterRef.current) {
      alerta.error("Error", "No se encontró el contenedor de las 5 Fuerzas de Porter para exportar.");
      return;
    }

    try {
      setExportandoPorterPDF(true);
      alerta.info("Generando PDF", "Preparando documento de las 5 Fuerzas de Porter...");

      const elemento = reportePorterRef.current;
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1000
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const totalImgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = totalImgHeight;
      let position = 0;

      // Primera página
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // Páginas adicionales automáticas
      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalImgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }

      const nombreCaso = (casoActivoSimulacion?.nombre || casoActivoSimulacion?.titulo || 'Caso')
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      const fechaHoy = new Date().toISOString().split('T')[0];
      pdf.save(`Reporte_5_Fuerzas_Porter_${nombreCaso}_${fechaHoy}.pdf`);

      alerta.exito("PDF Descargado", "El reporte de las 5 Fuerzas de Porter ha sido guardado correctamente.");
    } catch (err) {
      console.error("Error al exportar Porter a PDF:", err);
      alerta.error("Error al exportar", "No se pudo generar el documento PDF.");
    } finally {
      setExportandoPorterPDF(false);
    }
  };

  // Exportación de la Matriz de Perfil Competitivo en formato horizontal.
  const reporteMpcRef = useRef(null);
  const [exportandoMpcPDF, setExportandoMpcPDF] = useState(false);

  const exportarMpcPDF = async () => {
    if (exportandoMpcPDF) return;
    if (!reporteMpcRef.current) {
      alerta.error('Error', 'No se encontró la matriz de perfil competitivo para exportar.');
      return;
    }

    try {
      setExportandoMpcPDF(true);
      alerta.info('Generando PDF', 'Preparando la Matriz de Perfil Competitivo...');

      const canvas = await html2canvas(reporteMpcRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1000
      });
      const pdf = new jsPDF('l', 'mm', 'a4');
      const anchoPagina = pdf.internal.pageSize.getWidth();
      const altoPagina = pdf.internal.pageSize.getHeight();
      const altoImagen = (canvas.height * anchoPagina) / canvas.width;
      const imagen = canvas.toDataURL('image/png');

      let altoRestante = altoImagen;
      let posicion = 0;
      pdf.addImage(imagen, 'PNG', 0, posicion, anchoPagina, altoImagen, undefined, 'FAST');
      altoRestante -= altoPagina;

      while (altoRestante > 0) {
        posicion -= altoPagina;
        pdf.addPage();
        pdf.addImage(imagen, 'PNG', 0, posicion, anchoPagina, altoImagen, undefined, 'FAST');
        altoRestante -= altoPagina;
      }

      const nombreCaso = (casoActivoSimulacion?.nombre || casoActivoSimulacion?.titulo || 'Caso')
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      const fecha = new Date().toISOString().split('T')[0];
      pdf.save(`Matriz_Perfil_Competitivo_${nombreCaso}_${fecha}.pdf`);
      alerta.exito('PDF Descargado', 'La Matriz de Perfil Competitivo se exportó correctamente.');
    } catch (error) {
      console.error('Error al exportar la Matriz de Perfil Competitivo:', error);
      alerta.error('Error al exportar', 'No se pudo generar el documento PDF.');
    } finally {
      setExportandoMpcPDF(false);
    }
  };

  // Base de Ideas para el Taller de Lluvia de Ideas (Brainstorming)
  const ideasBaseLluvia = [
    {
      id: 'idea-1',
      fuente: 'Auditoría de Personal',
      texto: 'Personal barista con certificación SCA y alta fidelidad de clientes locales.',
      categoria: 'Talento Humano',
      tipoAmbito: 'Interno',
      cuadranteCorrecto: 'Fortalezas',
      seleccionada: true,
      esPersonalizada: false
    },
    {
      id: 'idea-2',
      fuente: 'Acuerdo Comercial',
      texto: 'Contrato de exclusividad con productores orgánicos de los Yungas.',
      categoria: 'Cadena de Suministro',
      tipoAmbito: 'Interno',
      cuadranteCorrecto: 'Fortalezas',
      seleccionada: true,
      esPersonalizada: false
    },
    {
      id: 'idea-3',
      fuente: 'Estudio Sectorial',
      texto: 'Crecimiento anual del 40% en consumo de café de especialidad en jóvenes profesionales.',
      categoria: 'Mercado',
      tipoAmbito: 'Externo',
      cuadranteCorrecto: 'Oportunidades',
      seleccionada: true,
      esPersonalizada: false
    },
    {
      id: 'idea-4',
      fuente: 'Reporte de Mantenimiento',
      texto: 'La máquina de espresso industrial falla el 20% del tiempo provocando demoras.',
      categoria: 'Operaciones',
      tipoAmbito: 'Interno',
      cuadranteCorrecto: 'Debilidades',
      seleccionada: true,
      esPersonalizada: false
    },
    {
      id: 'idea-5',
      fuente: 'Noticia Competitiva',
      texto: 'Apertura de una franquicia de Starbucks a 50 metros del local central.',
      categoria: 'Competencia',
      tipoAmbito: 'Externo',
      cuadranteCorrecto: 'Amenazas',
      seleccionada: true,
      esPersonalizada: false
    },
    {
      id: 'idea-6',
      fuente: 'Comunicado Inmobiliario',
      texto: 'Costo de alquiler del local céntrico subirá 25% el próximo mes de renovación.',
      categoria: 'Financiero',
      tipoAmbito: 'Macroentorno',
      cuadranteCorrecto: 'Amenazas',
      seleccionada: true,
      esPersonalizada: false
    },
    {
      id: 'idea-7',
      fuente: 'Auditoría Interna',
      texto: 'Elevada rotación del 40% en baristas por salarios poco competitivos frente al sector.',
      categoria: 'Talento Humano',
      tipoAmbito: 'Interno',
      cuadranteCorrecto: 'Debilidades',
      seleccionada: true,
      esPersonalizada: false
    },
    {
      id: 'idea-8',
      fuente: 'Informe de Operaciones',
      texto: 'Tiempos de espera promedio de 14 min en caja durante horas pico por cobro manual.',
      categoria: 'Operaciones',
      tipoAmbito: 'Interno',
      cuadranteCorrecto: 'Debilidades',
      seleccionada: false,
      esPersonalizada: false
    },
    {
      id: 'idea-9',
      fuente: 'Estudio de Mercado B2B',
      texto: 'Más de 40 empresas corporativas en el distrito demandan café tostado en grano mensual.',
      categoria: 'Mercado',
      tipoAmbito: 'Externo',
      cuadranteCorrecto: 'Oportunidades',
      seleccionada: true,
      esPersonalizada: false
    },
    {
      id: 'idea-10',
      fuente: 'Regulación Municipal',
      texto: 'Nueva normativa municipal exige transición obligatoria a empaques 100% compostables.',
      categoria: 'Entorno Legal',
      tipoAmbito: 'Macroentorno',
      cuadranteCorrecto: 'Amenazas',
      seleccionada: false,
      esPersonalizada: false
    }
  ];

  const [ideasLluvia, setIdeasLluvia] = useState(ideasBaseLluvia);
  // Mantener POAM sincronizado con PESTEL aunque el usuario cambie de herramienta.
  useEffect(() => {
    if (!casoActivoSimulacion) return;
    const factoresPestel = generarPayloadPoamDesdePestel(datosPestel, ideasLluvia);
    setFactoresPoam(actuales => {
      const existentes = new Map((actuales || []).filter(factor => factor.origenPestel).map(factor => [factor.id, factor]));
      const sincronizados = factoresPestel.map(factor => {
        const previo = existentes.get(factor.id);
        return previo ? {
          ...factor,
          impacto: previo.impactoConfiguradoPOAM ? previo.impacto : '',
          calificacion: previo.impactoConfiguradoPOAM ? previo.calificacion : '',
          impactoConfiguradoPOAM: Boolean(previo.impactoConfiguradoPOAM),
          justificacion: previo.justificacion,
          justificacionOriginal: previo.justificacionOriginal ?? factor.justificacionOriginal,
          ubicadoEnRadar: previo.impactoConfiguradoPOAM ? previo.ubicadoEnRadar : false,
          xRadar: previo.xRadar,
          yRadar: previo.yRadar,
          anguloRadar: previo.anguloRadar,
          radioRadar: previo.radioRadar,
          adjuntos: previo.adjuntos || factor.adjuntos,
          subdivisionRadar: resolverSubdivisionRadar(factor, factor.categoria)
        } : factor;
      });
      const sinCambios = sincronizados.length === (actuales || []).length && sincronizados.every((factor, index) => {
        const actual = actuales[index];
        return factor.id === actual?.id && factor.factor === actual?.factor && factor.categoria === actual?.categoria &&
          factor.subdivision === actual?.subdivision && factor.subdivisionRadar === actual?.subdivisionRadar && factor.tipo === actual?.tipo &&
          factor.dimensionPestel === actual?.dimensionPestel && factor.fuente === actual?.fuente;
      });
      return sinCambios ? actuales : sincronizados;
    });
  }, [datosPestel, casoActivoSimulacion, ideasLluvia]);
  const [nuevaIdeaTexto, setNuevaIdeaTexto] = useState('');
  const [nuevaIdeaAmbito, setNuevaIdeaAmbito] = useState('');
  const [nuevaIdeaCategoria, setNuevaIdeaCategoria] = useState('');
  const [nuevaIdeaCategoriaOtra, setNuevaIdeaCategoriaOtra] = useState('');
  const [modalNuevaIdeaAbierto, setModalNuevaIdeaAbierto] = useState(false);
  const [ideaEnEdicion, setIdeaEnEdicion] = useState(null);
  const [filtroLluvia, setFiltroLluvia] = useState('Todas');

  // Estado de Paginación y Filtrado de Casos en el Catálogo
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const casosPorPagina = 4;

  const [casos, setCasos] = useState([]);
  const [modalEliminarCaso, setModalEliminarCaso] = useState(null);

  const imagenesPorCategoria = {
    'Gastronomía & Retail': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    'Tecnología & SaaS': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    'Manufactura & Logística': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    'Salud & Energía': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
  };

  const cargarCasosDesdeDB = async () => {
    try {
      const casosDB = await api.obtenerCasosEmpresariales();
      if (casosDB && casosDB.length > 0) {
        // Formatear los casos que vienen de la DB para que coincidan con la estructura del frontend
        const casosFormateados = casosDB.map(c => ({
          ...c,
          id: `db-${c.id}`, // Evitar colisiones de IDs
          tag: c.tag || c.categoria,
          focoIcon: c.categoria?.includes('Gastronomía') ? MapPin : (c.categoria?.includes('Tecnología') ? Sliders : (c.categoria?.includes('Manufactura') ? Factory : SunMedium)),
          imagen: c.detalles?.imagen || imagenesPorCategoria[c.categoria] || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
        }));
        setCasos(casosFormateados);
      } else {
        setCasos([]);
      }
    } catch (error) {
      console.error("Error al cargar casos desde la BD:", error);
      setCasos([]);
    }
  };

  const confirmarEliminarCaso = async () => {
    if (!modalEliminarCaso) return;
    const idBackend = modalEliminarCaso.replace('db-', '');
    setModalEliminarCaso(null);
    try {
      await api.eliminarCasoEmpresarial(idBackend);
      alerta.exito("Éxito", "Caso eliminado correctamente");
      cargarCasosDesdeDB();
    } catch {
      alerta.error("Error", "No se pudo eliminar el caso");
    }
  };

  useEffect(() => {
    cargarCasosDesdeDB();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.id]); // al iniciar o cerrar sesión se recarga el catálogo del usuario

  const [evidenciasFoda, setEvidenciasFoda] = useState(() => {
    const poamInit = obtenerFactoresPoamIniciales('cafe-tunari');
    const porterInit = obtenerDatosPorterIniciales('cafe-tunari');
    const poamConsolidado = generarFactoresDesdePorterYPEST(porterInit, ideasBaseLluvia, { id: 'cafe-tunari' }, poamInit);
    const estado = sincronizarDesdePasosPrevios(ideasBaseLluvia, poamConsolidado, { autoPoblar: false });
    return estado.todos;
  });

  // Avance de la simulación: se guarda en cada cambio mientras hay un caso abierto
  useEffect(() => {
    if (!casoActivoSimulacion) return;
    guardarAvance(claveCaso(casoActivoSimulacion), { faseActual, subFase1, ideasLluvia, datosArbol, datosPestel, datosPorter, datosMpc, factoresPoam, datosEfi, evidenciasFoda, pasosVisitados, respaldos });
  }, [casoActivoSimulacion, faseActual, subFase1, ideasLluvia, datosArbol, datosPestel, datosPorter, datosMpc, factoresPoam, datosEfi, evidenciasFoda, pasosVisitados, respaldos]);
  useEffect(() => {
    if (casoActivoSimulacion) setPasosVisitados(previos => (previos.includes(subFase1) ? previos : [...previos, subFase1]));
  }, [casoActivoSimulacion, subFase1]);
  // Se relee al volver al catálogo (o tras reiniciar) para mostrar «Continuar trabajo»
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const avancesCasos = useMemo(() => (casoActivoSimulacion ? {} : leerAvances()), [casoActivoSimulacion, versionAvances]);

  // Iniciar la simulación activa para un caso seleccionado (reanudar: recupera el avance guardado)
  const abrirSimulacion = (caso, { reanudar = false } = {}) => {
    setCasoActivoSimulacion(caso);
    setFaseActual(1);
    setSubFase1('contexto');
    
    // Cargar ideas: si el caso tiene hechos auditados definidos, cargarlos;
    // Si es un caso creado por docente (o en BD) sin hechos auditados, inicia desde cero ([]) sin hechos predeterminados;
    // Solo los casos preconfigurados del sistema que no sean de BD usan ideasBaseLluvia por defecto.
    const esCasoDocente = Boolean(caso.id?.toString().startsWith('db-') || caso.esDocente || (caso.detalles && Array.isArray(caso.detalles.ideasLluvia)));
    
    let ideasParaLluvia = [];
    if (caso.detalles?.ideasLluvia && caso.detalles.ideasLluvia.length > 0) {
      ideasParaLluvia = caso.detalles.ideasLluvia.map((ideaObj, index) => ({
        id: `idea-${caso.id}-${index}`,
        texto: typeof ideaObj === 'string' ? ideaObj : (ideaObj.texto || ''),
        seleccionada: false,
        tipoAmbito: typeof ideaObj === 'string' ? 'Interno' : (ideaObj.ambito || 'Interno'),
        categoria: typeof ideaObj === 'string' ? 'Operaciones' : (ideaObj.categoria || 'Operaciones')
      }));
    } else if (!esCasoDocente) {
      ideasParaLluvia = ideasBaseLluvia;
    } else {
      // Inicia desde cero sin hechos predeterminados
      ideasParaLluvia = [];
    }

    setIdeasLluvia(ideasParaLluvia);
    
    const porterInit = obtenerDatosPorterIniciales(caso.id);
    const pestelInit = obtenerDatosPestelIniciales(caso.id);
    const arbolInit = obtenerDatosArbolIniciales(caso.id);
    setFactoresPoam(generarPayloadPoamDesdePestel(pestelInit, ideasParaLluvia));
    setDatosPorter(porterInit);
    setDatosPestel(pestelInit);
    setDatosArbol(arbolInit);
    setDatosMpc(null);
    setDatosEfi(null); // la EFI de otro caso o de un intento anterior no debe arrastrarse
    setPasosVisitados([]);
    setRespaldos({});
    
    const poamConsolidado = generarPayloadPoamDesdePestel(pestelInit, ideasParaLluvia);
    const estado = sincronizarDesdePasosPrevios(ideasParaLluvia, poamConsolidado, { autoPoblar: false });
    setEvidenciasFoda(estado.todos);
    setPaginaBandejaFoda(1);

    const guardado = reanudar ? leerAvance(claveCaso(caso)) : null;
    if (guardado) {
      if (Array.isArray(guardado.ideasLluvia)) setIdeasLluvia(guardado.ideasLluvia);
      if (guardado.datosArbol) setDatosArbol(guardado.datosArbol);
      if (guardado.datosPestel) setDatosPestel(guardado.datosPestel);
      if (guardado.datosPorter) setDatosPorter(guardado.datosPorter);
      if (Array.isArray(guardado.factoresPoam)) setFactoresPoam(guardado.factoresPoam);
      if ('datosMpc' in guardado) setDatosMpc(guardado.datosMpc);
      if ('datosEfi' in guardado) setDatosEfi(guardado.datosEfi);
      if (Array.isArray(guardado.evidenciasFoda)) setEvidenciasFoda(guardado.evidenciasFoda);
      if (Array.isArray(guardado.pasosVisitados)) setPasosVisitados(guardado.pasosVisitados);
      if (guardado.respaldos) setRespaldos(guardado.respaldos);
      const fase = guardado.faseActual || 1;
      setFaseActual(fase);
      setSubFase1(guardado.subFase1 || 'contexto');
      alerta.exito("Continuando trabajo", `Fase ${fase}: ${NOMBRES_FASES[fase] || ''} de ${caso.titulo}.`);
      return;
    }
    alerta.exito("Simulador Iniciado", `Iniciando Lluvia de Ideas para ${caso.titulo}...`);
  };

  // Borra todo el avance del caso (fases 1 a 6); el usuario sigue en el catálogo
  const reiniciarSimulacion = (caso) => {
    const clave = claveCaso(caso);
    const sinCaso = previo => { const copia = { ...previo }; delete copia[clave]; return copia; };
    borrarAvance(clave);
    setDatosDiagnosticoInterno(sinCaso);
    setDatosPlanificacion(sinCaso);
    setDatosEfi(null);
    setConfirmarReinicio(null);
    setVersionAvances(v => v + 1);
    alerta.exito("Simulación reiniciada", `El avance de ${caso.titulo} se borró. Pulsa «Iniciar Simulación» para empezar de nuevo.`);
  };

  // Acciones del Taller de Lluvia de Ideas
  const toggleSeleccionarIdea = (id) => {
    setIdeasLluvia(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, seleccionada: !item.seleccionada };
      }
      return item;
    }));
  };

  const seleccionarTodasIdeas = () => {
    setIdeasLluvia(prev => {
      const allSelected = prev.every(item => item.seleccionada);
      return prev.map(item => ({ ...item, seleccionada: !allSelected }));
    });
  };

  const seleccionarTodasInternas = () => {
    setIdeasLluvia(prev => {
      const internas = prev.filter(item => item.tipoAmbito === 'Interno');
      if (internas.length === 0) return prev;
      const allSelected = internas.every(item => item.seleccionada);
      return prev.map(item => 
        item.tipoAmbito === 'Interno' ? { ...item, seleccionada: !allSelected } : item
      );
    });
  };

  const seleccionarTodasExternas = () => {
    setIdeasLluvia(prev => {
      const externas = prev.filter(item => item.tipoAmbito === 'Externo' || item.tipoAmbito === 'Macroentorno');
      if (externas.length === 0) return prev;
      const allSelected = externas.every(item => item.seleccionada);
      return prev.map(item => 
        (item.tipoAmbito === 'Externo' || item.tipoAmbito === 'Macroentorno') ? { ...item, seleccionada: !allSelected } : item
      );
    });
  };

  const formularioNuevaIdeaValido = Boolean(
    nuevaIdeaTexto.trim() &&
    nuevaIdeaAmbito &&
    nuevaIdeaCategoria &&
    (nuevaIdeaCategoria !== 'Otro' || nuevaIdeaCategoriaOtra.trim())
  );

  const abrirEditarIdea = (idea) => {
    setIdeaEnEdicion(idea);
    setNuevaIdeaTexto(idea.texto || '');
    setNuevaIdeaAmbito(idea.tipoAmbito || 'Interno');
    const categoriasEstandar = ['Operaciones', 'Talento Humano', 'Financiero', 'Mercado', 'Competencia', 'Tecnología'];
    if (categoriasEstandar.includes(idea.categoria)) {
      setNuevaIdeaCategoria(idea.categoria);
      setNuevaIdeaCategoriaOtra('');
    } else {
      setNuevaIdeaCategoria('Otro');
      setNuevaIdeaCategoriaOtra(idea.categoria || '');
    }
    setModalNuevaIdeaAbierto(true);
  };

  const agregarNuevaIdea = (e) => {
    if (e) e.preventDefault();
    if (!formularioNuevaIdeaValido) {
      alerta.advertencia("Campos Incompletos", "Por favor completa todos los campos requeridos para continuar.");
      return;
    }
    if (!nuevaIdeaAmbito) {
      alerta.advertencia("Ámbito Requerido", "Por favor selecciona el ámbito (Interno o Externo).");
      return;
    }
    if (!nuevaIdeaCategoria) {
      alerta.advertencia("Área Requerida", "Por favor selecciona el área o categoría funcional.");
      return;
    }
    if (nuevaIdeaCategoria === 'Otro' && !nuevaIdeaCategoriaOtra.trim()) {
      alerta.advertencia("Área Requerida", "Por favor especifica el nombre de la otra área o categoría.");
      return;
    }

    const categoriaFinal = nuevaIdeaCategoria === 'Otro'
      ? nuevaIdeaCategoriaOtra.trim()
      : nuevaIdeaCategoria;

    if (ideaEnEdicion) {
      setIdeasLluvia(prev => prev.map(item => {
        if (item.id === ideaEnEdicion.id) {
          return {
            ...item,
            texto: nuevaIdeaTexto.trim(),
            categoria: categoriaFinal,
            tipoAmbito: nuevaIdeaAmbito,
            cuadranteCorrecto: nuevaIdeaAmbito === 'Interno' ? 'Fortalezas' : 'Oportunidades'
          };
        }
        return item;
      }));

      // Sincronizar en Árbol de Problemas si el factor ya fue posicionado
      setDatosArbol(prev => {
        if (!prev) return prev;
        const actualizarNodo = (node) => {
          if (!node || node.idIdeaOrigen !== ideaEnEdicion.id) return node;
          return {
            ...node,
            titulo: nuevaIdeaTexto.trim(),
            categoria: categoriaFinal
          };
        };
        return {
          ...prev,
          problemaCentral: actualizarNodo(prev.problemaCentral),
          causas: (prev.causas || []).map(actualizarNodo),
          ramificaciones: {
            ...prev.ramificaciones,
            efectosDirectos: (prev.ramificaciones?.efectosDirectos || []).map(actualizarNodo),
            efectosIndirectos: (prev.ramificaciones?.efectosIndirectos || []).map(actualizarNodo),
          }
        };
      });

      setModalNuevaIdeaAbierto(false);
      setIdeaEnEdicion(null);
      setNuevaIdeaTexto('');
      setNuevaIdeaAmbito('');
      setNuevaIdeaCategoria('');
      setNuevaIdeaCategoriaOtra('');
      alerta.exito("Idea Actualizada", "Se han guardado los cambios en tu idea propuesta.");
      return;
    }

    const nueva = {
      id: `idea-custom-${Date.now()}`,
      fuente: 'Aporte Propio',
      texto: nuevaIdeaTexto.trim(),
      categoria: categoriaFinal,
      tipoAmbito: nuevaIdeaAmbito,
      cuadranteCorrecto: nuevaIdeaAmbito === 'Interno' ? 'Fortalezas' : 'Oportunidades',
      seleccionada: true,
      esPersonalizada: true
    };

    setIdeasLluvia(prev => [nueva, ...prev]);
    setNuevaIdeaTexto('');
    setNuevaIdeaAmbito('');
    setNuevaIdeaCategoria('');
    setNuevaIdeaCategoriaOtra('');
    setModalNuevaIdeaAbierto(false);
    alerta.exito("Idea Agregada", "Se ha incorporado tu propuesta a la lluvia de ideas.");
  };

  const eliminarIdea = (id) => {
    setIdeasLluvia(prev => prev.filter(item => item.id !== id));
    setDatosArbol(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        problemaCentral: prev.problemaCentral?.idIdeaOrigen === id ? null : prev.problemaCentral,
        causas: (prev.causas || []).filter(c => c.idIdeaOrigen !== id),
        ramificaciones: {
          ...prev.ramificaciones,
          efectosDirectos: (prev.ramificaciones?.efectosDirectos || []).filter(e => e.idIdeaOrigen !== id),
          efectosIndirectos: (prev.ramificaciones?.efectosIndirectos || []).filter(e => e.idIdeaOrigen !== id),
        }
      };
    });
  };

  const ideasSeleccionadasLluvia = useMemo(() => {
    return ideasLluvia.filter(i => i.seleccionada);
  }, [ideasLluvia]);

  const ideasFiltradasLluvia = useMemo(() => {
    if (filtroLluvia === 'Seleccionadas') return ideasLluvia.filter(i => i.seleccionada);
    if (filtroLluvia === 'Internas') return ideasLluvia.filter(i => i.tipoAmbito === 'Interno');
    if (filtroLluvia === 'Externas') return ideasLluvia.filter(i => i.tipoAmbito === 'Externo' || i.tipoAmbito === 'Macroentorno');
    if (filtroLluvia === 'Personalizadas') return ideasLluvia.filter(i => i.esPersonalizada);
    return ideasLluvia;
  }, [ideasLluvia, filtroLluvia]);

  const ideasInternasFiltradas = useMemo(() => {
    return ideasFiltradasLluvia.filter(i => i.tipoAmbito === 'Interno');
  }, [ideasFiltradasLluvia]);

  const ideasExternasFiltradas = useMemo(() => {
    return ideasFiltradasLluvia.filter(i => i.tipoAmbito !== 'Interno');
  }, [ideasFiltradasLluvia]);

  const conteoInternasLluvia = useMemo(() => {
    return ideasSeleccionadasLluvia.filter(i => i.tipoAmbito === 'Interno').length;
  }, [ideasSeleccionadasLluvia]);

  const conteoExternasLluvia = useMemo(() => {
    return ideasSeleccionadasLluvia.filter(i => i.tipoAmbito === 'Externo' || i.tipoAmbito === 'Macroentorno').length;
  }, [ideasSeleccionadasLluvia]);

  const renderizarTarjetaIdea = (item) => (
    <div
      key={item.id}
      className={`lluvia-idea-card ${item.seleccionada ? 'seleccionada' : ''}`}
      onClick={() => toggleSeleccionarIdea(item.id)}
    >
      <div className="lluvia-card-top">
        <div className="lluvia-card-badges">
          <span className={`ambito-chip ${item.tipoAmbito === 'Interno' ? 'interno' : 'externo'}`}>
            {item.tipoAmbito}
          </span>
          <span className="categoria-chip">{item.categoria}</span>
        </div>

        <div className="lluvia-card-actions" onClick={(e) => e.stopPropagation()}>
          {item.esPersonalizada && (
            <>
              <button
                type="button"
                className="btn-editar-idea"
                onClick={() => abrirEditarIdea(item)}
                title="Editar idea o hallazgo personalizado"
              >
                <Edit size={13} />
              </button>
              <button
                type="button"
                className="btn-eliminar-idea"
                onClick={() => eliminarIdea(item.id)}
                title="Eliminar idea personalizada"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
          <button
            type="button"
            className={`btn-toggle-seleccion ${item.seleccionada ? 'activo' : ''}`}
            onClick={() => toggleSeleccionarIdea(item.id)}
            title={item.seleccionada ? 'Quitar selección' : (item.tipoAmbito === 'Interno' ? 'Incluir como insumo para Fase 4' : 'Incluir como insumo para Fase 3')}
          >
            {item.seleccionada ? <CheckSquare size={16} /> : <Square size={16} />}
          </button>
        </div>
      </div>

      <p className="lluvia-card-texto">{item.texto}</p>

      <div className="lluvia-card-footer">
        <span className="lluvia-fuente-tag">
          <Newspaper size={11} />
          {item.fuente}
        </span>
        <span className={`lluvia-seleccion-status ${item.seleccionada ? 'activo' : ''}`}>
          {item.seleccionada ? (
            <>
              <CheckCircle2 size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
              <span>{item.tipoAmbito === 'Interno' ? 'Insumo para Fase 4' : 'Insumo para Fase 3'}</span>
            </>
          ) : (
            <span>En espera</span>
          )}
        </span>
      </div>
    </div>
  );

  // =========================================================================
  // SINCRONIZACIÓN Y TRAZABILIDAD METODOLÓGICA DESDE PASOS PREVIOS
  // (Paso 1.1: Lluvia de Ideas [Interno] + Paso 1.3: Matriz POAM [Externo])
  // =========================================================================
  const sincronizarPasosPrevios = ({ silencioso = false, cambiarSubFase = false, autoPoblar = false, factoresPoamCustom = null, factoresEfiCustom = null } = {}) => {
    // La Matriz FODA recibe factores externos validados por PESTEL en el POAM.
    let listadoPoam = (factoresPoamCustom || factoresPoam || []).filter(factor => factor.origenPestel);
    if (!listadoPoam || listadoPoam.length === 0) {
      listadoPoam = generarPayloadPoamDesdePestel(datosPestel, ideasLluvia);
    }

    // 2. Ejecutar la sincronización estricta bajo el contrato de datos
    const estado = sincronizarDesdePasosPrevios(ideasSeleccionadasLluvia, listadoPoam, { autoPoblar });

    // 2.1 Si existen factores calibrados en la Matriz EFI, enriquecer fortalezas y debilidades con la EFI
    const listaEfi = factoresEfiCustom || datosEfi?.factores;
    if (listaEfi && Array.isArray(listaEfi) && listaEfi.length > 0) {
      const efiFortalezas = listaEfi.filter(f => f.tipo === 'Fortaleza').map((item, idx) => ({
        id: item.id || `f-efi-${idx + 1}`,
        codigo: item.codigo || `F${idx + 1}`,
        fuente: 'Matriz EFI (Interno)',
        texto: item.titulo,
        categoria: item.area || 'Capacidades Internas',
        tipoAmbito: 'Interno',
        cuadranteCorrecto: 'Fortalezas',
        cuadranteActual: autoPoblar ? 'Fortalezas' : null,
        origen: 'Matriz EFI',
        tagOrigen: 'Matriz EFI',
        origenPaso: 'Paso 5: Matriz EFI',
        pesoEfi: item.peso,
        calificacionEfi: item.calificacion,
        evidencias: item.evidencias || []
      }));

      const efiDebilidades = listaEfi.filter(f => f.tipo === 'Debilidad').map((item, idx) => ({
        id: item.id || `d-efi-${idx + 1}`,
        codigo: item.codigo || `D${idx + 1}`,
        fuente: 'Matriz EFI (Interno)',
        texto: item.titulo,
        categoria: item.area || 'Operaciones Internas',
        tipoAmbito: 'Interno',
        cuadranteCorrecto: 'Debilidades',
        cuadranteActual: autoPoblar ? 'Debilidades' : null,
        origen: 'Matriz EFI',
        tagOrigen: 'Matriz EFI',
        origenPaso: 'Paso 5: Matriz EFI',
        pesoEfi: item.peso,
        calificacionEfi: item.calificacion,
        evidencias: item.evidencias || []
      }));

      estado.fortalezas = efiFortalezas;
      estado.debilidades = efiDebilidades;
      // Internos (EFI) + externos (POAM): todos llegan a la bandeja para que el usuario los acomode.
      estado.todos = [...efiFortalezas, ...efiDebilidades, ...estado.oportunidades, ...estado.amenazas];
    }

    // 3. Poblar y actualizar la Matriz FODA (inicia en bandeja si autoPoblar es false).
    //    Lo que el usuario ya acomodó en un cuadrante se conserva al volver a sincronizar.
    setEvidenciasFoda(previas => estado.todos.map(ev => {
      const previa = autoPoblar ? null : previas.find(p => p.id === ev.id && p.tipoAmbito === ev.tipoAmbito);
      return previa?.cuadranteActual ? { ...ev, cuadranteActual: previa.cuadranteActual } : ev;
    }));
    setPaginaBandejaFoda(1);

    if (cambiarSubFase) {
      setSubFase1('foda');
    }

    // 4. Retroalimentación didáctica con Dr. Estrategia y alertas
    if (!silencioso) {
      alerta.exito(
        "Factores Listos en Bandeja",
        `Se han cargado ${estado.todos.length} evidencias en tu bandeja para clasificarlas en la Matriz FODA.`
      );
    }

    return estado;
  };

  // Mantener alias y handlers para compatibilidad de interfaces
  const consolidarEvidenciasParaFoda = (opts) => sincronizarPasosPrevios({ autoPoblar: false, ...opts });
  const pasarAMatrizFoda = () => {
    sincronizarPasosPrevios({ cambiarSubFase: true, silencioso: false, autoPoblar: false });
    setFaseActual(5);
  };

  // Asignar o mover una evidencia a un cuadrante FODA (bloquea combinaciones de ámbito incompatibles)
  const moverEvidencia = (idEvidencia, nuevoCuadrante) => {
    const ev = evidenciasFoda.find(item => item.id === idEvidencia);
    if (!ev) return;

    // Caso: Evidencia devuelta a la bandeja
    if (!nuevoCuadrante) {
      setEvidenciasFoda(prev => prev.map(item => {
        if (item.id === idEvidencia) {
          return { ...item, cuadranteActual: null };
        }
        return item;
      }));
      return;
    }

    const esInterno = ev.tipoAmbito === 'Interno';
    const esExterno = !esInterno;

    // =========================================================================
    // VALIDACIÓN METODOLÓGICA ESTRICTA:
    // 1. Factores Internos NO se pueden ubicar en Oportunidades o Amenazas
    // =========================================================================
    if (esInterno && (nuevoCuadrante === 'Oportunidades' || nuevoCuadrante === 'Amenazas')) {
      alerta.advertencia(
        "Ámbito Incompatible",
        `Este es un factor INTERNO (gobernanza de la empresa). No puede clasificarse en ${nuevoCuadrante}. Solo corresponde a Fortalezas (+F) o Debilidades (-D).`
      );
      return; // SE BLOQUEA EL MOVIMIENTO
    }

    // =========================================================================
    // 2. Factores Externos NO se pueden ubicar en Fortalezas o Debilidades
    // =========================================================================
    if (esExterno && (nuevoCuadrante === 'Fortalezas' || nuevoCuadrante === 'Debilidades')) {
      alerta.advertencia(
        "Ámbito Incompatible",
        `Este es un factor EXTERNO (fuerzas del entorno/mercado). No puede clasificarse en ${nuevoCuadrante}. Solo corresponde a Oportunidades (+O) o Amenazas (-A).`
      );
      return; // SE BLOQUEA EL MOVIMIENTO
    }

    // Si supera las validaciones metodológicas, se actualiza el cuadrante
    setEvidenciasFoda(prev => prev.map(item => {
      if (item.id === idEvidencia) {
        return { ...item, cuadranteActual: nuevoCuadrante };
      }
      return item;
    }));
  };

  // Categorías base por defecto
  const CATEGORIAS_DEFECTO = useMemo(() => [
    'Gastronomía & Retail',
    'Tecnología & SaaS',
    'Manufactura & Logística',
    'Salud & Energía'
  ], []);

  const [categoriasPersonalizadas, setCategoriasPersonalizadas] = useState(() => {
    try {
      const raw = localStorage.getItem('simulador_categorias_extra');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [mostrarInputNuevaCat, setMostrarInputNuevaCat] = useState(false);
  const [nuevaCatNombre, setNuevaCatNombre] = useState('');

  // Filtro de categorías dinámicas en catálogo (base + personalizadas + categorías de casos cargados)
  const categorias = useMemo(() => {
    const deCasos = casos.map(c => c.categoria).filter(Boolean);
    const combinadas = Array.from(new Set([
      ...CATEGORIAS_DEFECTO,
      ...categoriasPersonalizadas,
      ...deCasos
    ]));
    return ['Todos', ...combinadas];
  }, [casos, categoriasPersonalizadas, CATEGORIAS_DEFECTO]);

  const agregarCategoriaPersonalizada = (nombre) => {
    const nombreLimpio = (nombre || '').trim();
    if (!nombreLimpio) return;
    if (categorias.some(c => c.toLowerCase() === nombreLimpio.toLowerCase())) {
      alerta.advertencia("Categoría Existente", `El campo "${nombreLimpio}" ya existe.`);
      setCategoriaSeleccionada(categorias.find(c => c.toLowerCase() === nombreLimpio.toLowerCase()) || nombreLimpio);
      return;
    }
    const actualizadas = [...categoriasPersonalizadas, nombreLimpio];
    setCategoriasPersonalizadas(actualizadas);
    try {
      localStorage.setItem('simulador_categorias_extra', JSON.stringify(actualizadas));
    } catch (e) {
      console.error(e);
    }
    setCategoriaSeleccionada(nombreLimpio);
    alerta.exito("Campo Agregado", `Se adicionó el campo "${nombreLimpio}".`);
  };

  const eliminarCategoriaPersonalizada = (cat) => {
    const actualizadas = categoriasPersonalizadas.filter(c => c !== cat);
    setCategoriasPersonalizadas(actualizadas);
    try {
      localStorage.setItem('simulador_categorias_extra', JSON.stringify(actualizadas));
    } catch (e) {
      console.error(e);
    }
    if (categoriaSeleccionada === cat) {
      setCategoriaSeleccionada('Todos');
    }
    alerta.info("Campo Eliminado", `Se eliminó el campo "${cat}".`);
  };

  const casosFiltrados = useMemo(() => {
    if (categoriaSeleccionada === 'Todos') return casos;
    return casos.filter(c => c.categoria === categoriaSeleccionada);
  }, [categoriaSeleccionada, casos]);

  const totalPaginas = Math.max(1, Math.ceil(casosFiltrados.length / casosPorPagina));
  const paginaValida = Math.min(paginaActual, totalPaginas);

  const casosPaginados = useMemo(() => {
    const inicio = (paginaValida - 1) * casosPorPagina;
    return casosFiltrados.slice(inicio, inicio + casosPorPagina);
  }, [casosFiltrados, paginaValida, casosPorPagina]);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  const cambiarCategoria = (cat) => {
    setCategoriaSeleccionada(cat);
    setPaginaActual(1);
  };

  // Cálculo de métricas en tiempo real del diagnóstico FODA
  const evidenciasPendientes = useMemo(() => {
    return evidenciasFoda.filter(e => !e.cuadranteActual);
  }, [evidenciasFoda]);

  // Estado y Filtros de la Bandeja de Evidencias FODA (Estilo POAM)
  const [filtroBandejaFoda, setFiltroBandejaFoda] = useState('Todas');
  const [bandejaFodaColapsada, setBandejaFodaColapsada] = useState(false);
  const [busquedaBandejaFoda, setBusquedaBandejaFoda] = useState('');
  const [paginaBandejaFoda, setPaginaBandejaFoda] = useState(1);
  const itemsPorPaginaBandejaFoda = 3;

  // Un factor interno solo admite Fortalezas/Debilidades; uno externo, Oportunidades/Amenazas.
  const esInternoFoda = e => e.tipoAmbito === 'Interno';
  const esPositivoFoda = e => (esInternoFoda(e)
    ? e.cuadranteCorrecto !== 'Debilidades'
    : (e.cuadranteCorrecto === 'Oportunidades' || e.polaridad === 'Oportunidad' || e.tipo === 'Oportunidad' || e.tipo === 'Oportunidades'));
  const etiquetaFoda = e => (esInternoFoda(e) ? (esPositivoFoda(e) ? '+F' : '-D') : (esPositivoFoda(e) ? '+O' : '-A'));
  const cuadranteCompatible = (e, cuadrante) => (esInternoFoda(e) ? (cuadrante === 'Fortalezas' || cuadrante === 'Debilidades') : (cuadrante === 'Oportunidades' || cuadrante === 'Amenazas'));
  const infoChipFoda = e => {
    const bruto = e.dimensionPoam || e.categoria || '';
    if (esInternoFoda(e)) return { catNorm: bruto || 'Interno', dimInfo: { colorRgb: '100, 116, 139', color: '#64748b' } };
    const catNorm = normalizarCategoriaPoam ? normalizarCategoriaPoam(bruto) : (bruto || 'Económica');
    return { catNorm, dimInfo: (DIMENSIONES_POAM && DIMENSIONES_POAM.find(d => d.id === catNorm)) || (DIMENSIONES_POAM && DIMENSIONES_POAM[0]) };
  };

  const conteoPendientesInternos = useMemo(() => evidenciasPendientes.filter(esInternoFoda).length, [evidenciasPendientes]);
  const conteoPendientesExternos = evidenciasPendientes.length - conteoPendientesInternos;

  const evidenciasPendientesFiltradas = useMemo(() => {
    return evidenciasPendientes.filter(e => {
      const matchTipo = filtroBandejaFoda === 'Todas' ||
        (filtroBandejaFoda === 'Internos' && esInternoFoda(e)) ||
        (filtroBandejaFoda === 'Externos' && !esInternoFoda(e));
      const matchBusqueda = !busquedaBandejaFoda ||
        (e.texto && e.texto.toLowerCase().includes(busquedaBandejaFoda.toLowerCase())) ||
        (e.categoria && e.categoria.toLowerCase().includes(busquedaBandejaFoda.toLowerCase())) ||
        (e.dimensionPoam && e.dimensionPoam.toLowerCase().includes(busquedaBandejaFoda.toLowerCase())) ||
        (e.subdivisionPoam && e.subdivisionPoam.toLowerCase().includes(busquedaBandejaFoda.toLowerCase()));
      return matchTipo && matchBusqueda;
    });
  }, [evidenciasPendientes, filtroBandejaFoda, busquedaBandejaFoda]);

  const totalPaginasBandejaFoda = Math.max(1, Math.ceil(evidenciasPendientesFiltradas.length / itemsPorPaginaBandejaFoda));
  const paginaActualBandejaFoda = Math.min(paginaBandejaFoda, totalPaginasBandejaFoda);

  useEffect(() => {
    if (paginaBandejaFoda > totalPaginasBandejaFoda && totalPaginasBandejaFoda > 0) {
      setPaginaBandejaFoda(totalPaginasBandejaFoda);
    }
  }, [totalPaginasBandejaFoda, paginaBandejaFoda]);

  const evidenciasPaginadasFoda = useMemo(() => {
    const start = (paginaActualBandejaFoda - 1) * itemsPorPaginaBandejaFoda;
    return evidenciasPendientesFiltradas.slice(start, start + itemsPorPaginaBandejaFoda);
  }, [evidenciasPendientesFiltradas, paginaActualBandejaFoda, itemsPorPaginaBandejaFoda]);

  const evidenciasClasificadas = useMemo(() => {
    return evidenciasFoda.filter(e => !!e.cuadranteActual);
  }, [evidenciasFoda]);

  const aciertos = useMemo(() => {
    return evidenciasClasificadas.filter(e => e.cuadranteActual === e.cuadranteCorrecto).length;
  }, [evidenciasClasificadas]);

  const precisionDiagnostico = useMemo(() => {
    if (evidenciasClasificadas.length === 0) return 0;
    return Math.round((aciertos / evidenciasClasificadas.length) * 100);
  }, [aciertos, evidenciasClasificadas]);

  // Cuadrantes FODA
  const cuadrantesFODA = [
    {
      tipo: 'Fortalezas',
      sigla: 'F',
      titulo: 'FORTALEZAS (F)',
      subtitulo: 'Factores Internos (+)',
      tipoGobernanza: 'interno',
      colorClass: 'fortalezas',
      icono: CheckCircle2,
      textoDrop: 'Suelta evidencias internas positivas aquí'
    },
    {
      tipo: 'Oportunidades',
      sigla: 'O',
      titulo: 'OPORTUNIDADES (O)',
      subtitulo: 'Factores Externos (+)',
      tipoGobernanza: 'externo',
      colorClass: 'oportunidades',
      icono: TrendingUp,
      textoDrop: 'Suelta evidencias externas favorables aquí'
    },
    {
      tipo: 'Debilidades',
      sigla: 'D',
      titulo: 'DEBILIDADES (D)',
      subtitulo: 'Factores Internos (-)',
      tipoGobernanza: 'interno',
      colorClass: 'debilidades',
      icono: AlertTriangle,
      textoDrop: 'Suelta evidencias internas desfavorables aquí'
    },
    {
      tipo: 'Amenazas',
      sigla: 'A',
      titulo: 'AMENAZAS (A)',
      subtitulo: 'Factores Externos (-)',
      tipoGobernanza: 'externo',
      colorClass: 'amenazas',
      icono: ShieldAlert,
      textoDrop: 'Suelta riesgos y amenazas externas aquí'
    }
  ];

  // Estado y Handlers Drag & Drop reactivos para las evidencias y noticias
  const [dragOverCuadrante, setDragOverCuadrante] = useState(null);
  const [factorArrastradoFodaId, setFactorArrastradoFodaId] = useState(null);
  const fodaRef = useRef(null);
  const { exportando: exportandoFoda, exportar: exportarFodaBase } = useExportarResumen({ ref: fodaRef, caso: casoActivoSimulacion, nombreBase: 'Matriz_FODA', pie: 'Matriz FODA · Análisis Empresarial' });
  // El PDF siempre sale en tema claro: se quita 'dark' del documento solo durante la captura.
  const exportarFoda = async () => {
    const raiz = document.documentElement;
    const eraOscuro = raiz.classList.contains('dark');
    if (eraOscuro) raiz.classList.remove('dark');
    try { await exportarFodaBase(); } finally { if (eraOscuro) raiz.classList.add('dark'); }
  };

  const factorArrastradoFoda = useMemo(() => {
    if (!factorArrastradoFodaId) return null;
    return evidenciasFoda.find(ev => ev.id === factorArrastradoFodaId) || null;
  }, [factorArrastradoFodaId, evidenciasFoda]);

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setFactorArrastradoFodaId(id);
  };

  const handleDragEnd = () => {
    setFactorArrastradoFodaId(null);
    setDragOverCuadrante(null);
  };

  const handleDragOver = (e, targetCuadrante) => {
    e.preventDefault();
    if (targetCuadrante && targetCuadrante !== 'bandeja' && factorArrastradoFoda) {
      const esInterno = factorArrastradoFoda.tipoAmbito === 'Interno';
      const esInvalido = (esInterno && (targetCuadrante === 'Oportunidades' || targetCuadrante === 'Amenazas')) ||
                         (!esInterno && (targetCuadrante === 'Fortalezas' || targetCuadrante === 'Debilidades'));
      if (esInvalido) {
        e.dataTransfer.dropEffect = 'none';
        return;
      }
    }
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, targetCuadrante) => {
    e.preventDefault();
    setDragOverCuadrante(targetCuadrante);
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget && e.relatedTarget && e.currentTarget.contains(e.relatedTarget)) return;
    setDragOverCuadrante(null);
  };

  const handleDrop = (e, targetCuadrante) => {
    e.preventDefault();
    setDragOverCuadrante(null);
    const id = e.dataTransfer.getData('text/plain') || factorArrastradoFodaId;
    setFactorArrastradoFodaId(null);
    if (!id) return;
    const factor = evidenciasFoda.find(item => item.id === id);
    if (factor && targetCuadrante && !cuadranteCompatible(factor, targetCuadrante)) return; // solo se admite el ámbito correcto
    moverEvidencia(id, targetCuadrante);
  };

  // Helper para mover todas las noticias a la bandeja de evidencias
  const restablecerTodasABandeja = () => {
    setEvidenciasFoda(prev => prev.map(ev => ({ ...ev, cuadranteActual: null })));
    setPaginaBandejaFoda(1);
    alerta.info("Bandeja Restablecida", "Se han movido todas las noticias a la bandeja de evidencias para clasificarlas.");
  };

  // Herramientas configuradas para el caso activo en simulación
  const herramientasActivasCaso = useMemo(() => herramientasDelCaso(casoActivoSimulacion), [casoActivoSimulacion]);
  const herramientasDiagnosticoCaso = useMemo(() => herramientasClasicas(herramientasActivasCaso), [herramientasActivasCaso]);

  const ordenHerramientasDiagnostico = useMemo(() => {
    const ordenCompleto = ['pestel', 'poam', 'porter', 'mpc'];
    return ordenCompleto.filter(id => herramientasDiagnosticoCaso.includes(id));
  }, [herramientasDiagnosticoCaso]);

  const herramientasFase3Activas = useMemo(() => {
    const ordenFase3 = ['pestel', 'poam', 'porter', 'mpc'];
    return ordenFase3
      .filter(id => herramientasDiagnosticoCaso.includes(id))
      .map(id => LISTA_HERRAMIENTAS_DIAGNOSTICO.find(h => h.id === id))
      .filter(Boolean);
  }, [herramientasDiagnosticoCaso]);

  const obtenerSiguienteHerramienta = (actualId) => {
    const idx = ordenHerramientasDiagnostico.indexOf(actualId);
    if (idx !== -1 && idx + 1 < ordenHerramientasDiagnostico.length) {
      return ordenHerramientasDiagnostico[idx + 1];
    }
    return null;
  };

  const navegarAHerramienta = (toolId) => {
    if (!toolId) {
      setFaseActual(5);
      return;
    }
    if (toolId === 'efi') {
      setSubFase1('efi');
      setFaseActual(4);
    } else if (toolId === 'foda') {
      pasarAMatrizFoda();
      setFaseActual(5);
    } else {
      setSubFase1(toolId);
      setFaseActual(3);
      const toolMeta = LISTA_HERRAMIENTAS_DIAGNOSTICO.find(h => h.id === toolId);
      if (toolMeta) {
        if (toolId === 'porter') {
          const estadoActualizado = sincronizarDesdePasosPrevios(ideasSeleccionadasLluvia, factoresPoam, { autoPoblar: false });
          setEvidenciasFoda(estadoActualizado.todos);
        }
      }
    }
  };

  const navegarAHerramientaInterna = (toolId) => {
    setSubFase1(toolId);
    setFaseActual(4);
  };

  const HerramientaInternaActiva = COMPONENTES_INTERNOS[subFase1] || AnalisisVerticalHorizontal;

  // Fase 5: FODA → resumen del diagnóstico externo → resumen del diagnóstico interno
  const SUBFASES_FASE5 = [
    { id: 'foda', nombre: 'Matriz FODA', icon: ICONOS_HERRAMIENTAS.foda },
    { id: 'resumen-problema', nombre: 'Resumen identificación del problema', icon: ICONOS_HERRAMIENTAS['resumen-problema'] },
    { id: 'resumen-externo', nombre: 'Resumen diagnóstico externo', icon: ICONOS_HERRAMIENTAS['resumen-externo'] },
    { id: 'resumen-interno', nombre: 'Resumen diagnóstico interno', icon: ICONOS_HERRAMIENTAS['resumen-interno'] }
  ];
  const SUBFASES_FASE6 = [
    { id: 'dafo', nombre: 'Matriz DAFO', icon: ICONOS_HERRAMIENTAS.dafo },
    { id: 'ansoff', nombre: 'Matriz Ansoff', icon: ICONOS_HERRAMIENTAS.ansoff }
  ];
  const navegarFase6 = (id) => {
    setSubFase1(id);
    setFaseActual(6);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const factoresFoda = useMemo(() => prepararFactoresFoda(evidenciasFoda), [evidenciasFoda]);

  const navegarFase5 = (id) => {
    if (id === 'foda') { pasarAMatrizFoda(); setFaseActual(5); return; }
    setSubFase1(id);
    setFaseActual(5);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Rutas según las herramientas que el docente habilitó en el caso (fases 3 a 6)
  const internasActivas = IDS_FASE4.filter(id => herramientasActivasCaso.includes(id));
  const fase5Activas = SUBFASES_FASE5.filter(item => item.id === 'resumen-problema' || herramientasActivasCaso.includes(item.id));
  const fase6Activas = SUBFASES_FASE6.filter(item => herramientasActivasCaso.includes(item.id));
  const irAPaso = id => (id === 'dafo' || id === 'ansoff' ? navegarFase6(id) : navegarFase5(id));
  const estiloFaseSinHerramientas = { cursor: 'not-allowed', opacity: 0.45 };
  const irAFase5 = () => navegarFase5(fase5Activas[0].id);
  const despuesDeFase3 = () => { if (internasActivas[0]) navegarAHerramientaInterna(internasActivas[0]); else irAFase5(); };

  // ---- Navegación unificada entre pasos (contexto → fases 2 a 6) según las herramientas habilitadas del caso ----
  const META_RUTA = {
    contexto: { fase: 1, dest: 'a Contexto' },
    lluvia: { fase: 2, dest: 'a la Lluvia de Ideas' },
    arbol: { fase: 2, dest: 'al Árbol de Problemas' },
    pestel: { fase: 3, dest: 'al Análisis PESTEL' },
    poam: { fase: 3, dest: 'a la Matriz POAM' },
    porter: { fase: 3, dest: 'a las 5 Fuerzas de Porter' },
    mpc: { fase: 3, dest: 'a la Matriz de Perfil Competitivo' },
    'interno-vertical-horizontal': { fase: 4, dest: 'al Análisis vertical y horizontal' },
    'customer-journey': { fase: 4, dest: 'al Customer Journey Map' },
    flujogramas: { fase: 4, dest: 'a Flujogramas' },
    efi: { fase: 4, dest: 'a la Matriz EFI' },
    'auditoria-redes': { fase: 4, dest: 'a la Auditoría de redes sociales' },
    'evaluacion-360': { fase: 4, dest: 'a la Evaluación 360°' },
    inventarios: { fase: 4, dest: 'a Inventarios y almacenes' },
    foda: { fase: 5, dest: 'a la Matriz FODA' },
    'resumen-problema': { fase: 5, dest: 'al Resumen de la identificación del problema' },
    'resumen-externo': { fase: 5, dest: 'al Resumen del diagnóstico externo' },
    'resumen-interno': { fase: 5, dest: 'al Resumen del diagnóstico interno' },
    dafo: { fase: 6, dest: 'a la Matriz DAFO' },
    ansoff: { fase: 6, dest: 'a la Matriz Ansoff' }
  };
  const rutaPasos = ['contexto', 'lluvia', 'arbol', ...herramientasFase3Activas.map(item => item.id), ...internasActivas, ...fase5Activas.map(item => item.id), ...fase6Activas.map(item => item.id)];
  const irAPasoRuta = id => {
    if (id === 'contexto') { setSubFase1('contexto'); setFaseActual(1); return; }
    if (id === 'lluvia' || id === 'arbol') {
      setSubFase1(id);
      setFaseActual(2);
      return;
    }
    if (META_RUTA[id]?.fase === 3) { navegarAHerramienta(id); return; }
    if (META_RUTA[id]?.fase === 4) { navegarAHerramientaInterna(id); return; }
    irAPaso(id);
  };
  // Lo que cada herramienta debe consolidar antes de dejarla (hacia el FODA y el árbol)
  const salirDePaso = id => {
    if (id === 'arbol') {
      const estadoActualizado = sincronizarDesdePasosPrevios(ideasSeleccionadasLluvia, factoresPoam, { autoPoblar: false });
      setEvidenciasFoda(estadoActualizado.todos);
    } else if (id === 'porter') {
      consolidarEvidenciasParaFoda({ silencioso: true });
    } else if (id === 'poam') {
      consolidarEvidenciasParaFoda({ factoresPoamCustom: factoresPoam, cambiarSubFase: false, silencioso: true });
    }
  };
  const irAnteriorPaso = id => {
    const anterior = rutaPasos[rutaPasos.indexOf(id) - 1];
    if (anterior) irAPasoRuta(anterior); else if (id === 'contexto') setCasoActivoSimulacion(null);
  };
  const irSiguientePaso = id => {
    const siguiente = rutaPasos[rutaPasos.indexOf(id) + 1];
    salirDePaso(id);
    if (!siguiente) {
      if (META_RUTA[id]?.fase === 6) alerta.exito('Planificación registrada', 'Tus estrategias DAFO y tu plan de crecimiento Ansoff quedaron guardados para este caso.');
      else setModalEvaluacionFase(true);
      return;
    }
    if (META_RUTA[id].fase === 5 && META_RUTA[siguiente].fase === 6) { setModalEvaluacionFase(true); return; }
    irAPasoRuta(siguiente);
  };
  const etiquetaPaso = (verbo, destino, origen) => `${verbo} ${META_RUTA[destino].dest}${META_RUTA[destino].fase !== META_RUTA[origen].fase ? ` (Fase ${META_RUTA[destino].fase})` : ''}`;
  const posicionPaso = rutaPasos.indexOf(subFase1);
  const navegacionPasos = posicionPaso < 0 ? null : {
    anterior: posicionPaso > 0
      ? { texto: etiquetaPaso('Volver', rutaPasos[posicionPaso - 1], subFase1), onClick: () => irAnteriorPaso(subFase1) }
      : { texto: 'Volver a Casos', onClick: () => setCasoActivoSimulacion(null) },
    siguiente: posicionPaso < rutaPasos.length - 1
      ? { texto: etiquetaPaso('Continuar', rutaPasos[posicionPaso + 1], subFase1), onClick: () => irSiguientePaso(subFase1) }
      : { texto: META_RUTA[subFase1].fase === 6 ? 'Finalizar planificación' : 'Finalizar análisis de resultados', onClick: () => irSiguientePaso(subFase1) }
  };
  // Una fase se marca como completada solo si se usaron todas sus herramientas habilitadas
  const estadoFases = calcularEstadoFases({
    faseActual,
    habilitadas: herramientasActivasCaso,
    ctx: { ideasLluvia, datosArbol, datosPestel, datosPorter, datosMpc, factoresPoam, datosEfi, evidenciasFoda, datosInterno: datosDiagnosticoInterno[casoInternoKey], plan: planCaso, visitados: pasosVisitados }
  });
  const fasesCompletadas = Object.values(estadoFases).filter(f => f.estado === 'completado').length;
  useEffect(() => {
    if (casoActivoSimulacion) actualizarAvance(claveCaso(casoActivoSimulacion), { completadas: fasesCompletadas });
  }, [casoActivoSimulacion, fasesCompletadas]);
  const ETIQUETAS_ESTADO = { completado: 'COMPLETADO', 'en-curso': 'EN CURSO', incompleto: 'INCOMPLETO', pendiente: 'PENDIENTE', omitida: 'NO INCLUIDA' };
  const pasosStepper = [
    { fase: 1, titulo: 'Fase 1: Contexto', ayuda: 'Ir a Fase 1: Contexto', habilitado: true, ir: () => { setSubFase1('contexto'); setFaseActual(1); } },
    { fase: 2, titulo: 'Fase 2: Identificación de Problema', ayuda: 'Ir a Fase 2: Identificación de Problema (Lluvia de Ideas & Árbol de Problemas)', habilitado: true, ir: () => { if (subFase1 !== 'lluvia' && subFase1 !== 'arbol') setSubFase1('lluvia'); setFaseActual(2); } },
    { fase: 3, titulo: 'Fase 3: Diagnóstico Empresarial Externo', ayuda: 'Ir a Fase 3: Diagnóstico Empresarial Externo', habilitado: herramientasFase3Activas.length > 0, ir: () => { const primera = herramientasFase3Activas[0]?.id; if (primera) navegarAHerramienta(primera); } },
    { fase: 4, titulo: 'Fase 4: Diagnóstico Empresarial Interno', ayuda: 'Ir a Fase 4: Diagnóstico Empresarial Interno', habilitado: internasActivas.length > 0, ir: () => { if (internasActivas[0]) navegarAHerramientaInterna(internasActivas[0]); } },
    { fase: 5, titulo: 'Fase 5: Análisis de Resultado', ayuda: 'Ir a Fase 5: Análisis de Resultado', habilitado: true, ir: irAFase5 },
    { fase: 6, titulo: 'Fase 6: Planificación y Toma de Decisiones', ayuda: 'Ir a Fase 6: Planificación y Toma de Decisiones', habilitado: fase6Activas.length > 0, ir: () => { if (fase6Activas[0]) navegarFase6(fase6Activas[0].id); } }
  ];

  // =========================================================================
  // VISTA 1: ESPACIO DE SIMULACIÓN ACTIVO (PANTALLA SOLICITADA)
  // =========================================================================
  if (casoActivoSimulacion) {
    return (
      <NavegacionPasos.Provider value={navegacionPasos}>
      <RespaldoHerramientas.Provider value={valorRespaldo}>
      <div className="simulacion-workspace-container">

        {/* BARRA SUPERIOR DE FASES DE SIMULACIÓN CON TÍTULO DEL CASO Y PASO 'CASOS' */}
        <div className="simulacion-fases-card">
          <div className="simulacion-fases-header">
            <h2 className="fases-header-caso-nombre" style={{ color: '#ea580c' }}>
              {casoActivoSimulacion.titulo}
            </h2>
          </div>

          <div className="simulacion-stepper-bar">
            {pasosStepper.map((paso, indice) => {
              const { estado, faltan } = estadoFases[paso.fase];
              const ayuda = estado === 'incompleto' || (estado === 'pendiente' && faltan.length) || (estado === 'en-curso' && faltan.length && paso.fase > 1)
                ? `${paso.ayuda}. Falta usar: ${faltan.join(', ')}`
                : paso.ayuda;
              return <React.Fragment key={paso.fase}>
                {indice > 0 && <div className="stepper-connector" />}
                <div className={`stepper-step ${estado}`} onClick={paso.ir} style={paso.habilitado ? { cursor: 'pointer' } : estiloFaseSinHerramientas} title={ayuda}>
                  <div className="step-circle">
                    {estado === 'completado' ? <Check size={14} /> : estado === 'incompleto' ? <AlertTriangle size={14} /> : <span className="step-num">{paso.fase}</span>}
                  </div>
                  <div className="step-meta">
                    <span className="step-tag">{ETIQUETAS_ESTADO[estado]}</span>
                    <span className="step-title">{paso.titulo}</span>
                  </div>
                </div>
              </React.Fragment>;
            })}
          </div>

          {/* Herramientas de la fase activa: mismo bloque que las fases, con una flecha que señala a cuál pertenecen */}
          <div className="simulacion-subnav" style={{ '--col-fase': Math.max(1, faseActual) * 2 - 1 }}>
            <span className="simulacion-subnav-caret" aria-hidden="true"><i/></span>
            <div className="simulacion-subnav-label"><small>Herramientas</small><strong>Fase {faseActual}</strong></div>
            <div className="simulacion-subnav-body">
              {/* SUB-NAVEGACIÓN INTERNA SECUENCIAL: FASE 2 (LLUVIA DE IDEAS & ÁRBOL DE PROBLEMAS), mismo menú que las fases 3 y 4 */}
              {['lluvia', 'arbol'].includes(subFase1) && (
                <div className="subfases-nav-tabs pipeline-chain">
                  {[
                    { id: 'lluvia', nombre: 'Lluvia de Ideas', icon: ICONOS_HERRAMIENTAS.lluvia, titulo: 'Fase 2 (Paso 2.1): Lluvia de Ideas', mensaje: 'Identifica y clasifica hechos clave en factores internos y externos.' },
                    { id: 'arbol', nombre: 'Árbol de Problemas', icon: ICONOS_HERRAMIENTAS.arbol, titulo: 'Fase 2 (Paso 2.2): Árbol de Problemas', mensaje: 'Estructura el problema central, sus causas raíces y sus efectos y consecuencias.' }
                  ].map((paso, index) => {
                    const IconComponent = paso.icon;
                    return (
                      <React.Fragment key={paso.id}>
                        {index > 0 && (
                          <div className="pipeline-connector-node" aria-hidden="true">
                            <ChevronRight size={14} className="connector-chevron" />
                          </div>
                        )}
                        <button
                          type="button"
                          className={`subfase-tab ${subFase1 === paso.id ? 'active' : ''}`}
                          title={`${index + 1}. ${paso.nombre}`}
                          onClick={() => {
                            setSubFase1(paso.id);
                          }}
                        >
                          <div className="subfase-tab-prefix">
                            <span className="subfase-step-num">{`2.${index + 1}`}</span>
                            <div className="subfase-icon-wrapper">
                              <IconComponent size={16} />
                            </div>
                          </div>
                          <div className="subfase-tab-text">
                            <span className="subfase-title">{paso.nombre}</span>
                          </div>
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {/* SUB-NAVEGACIÓN INTERNA SECUENCIAL: DIAGNÓSTICO METODOLÓGICO FASE 3 (HERRAMIENTAS HABILITADAS) */}
              {['pestel', 'porter', 'mpc', 'poam'].includes(subFase1) && herramientasFase3Activas.length > 0 && (
                <div className="subfases-nav-tabs pipeline-chain">
                  {herramientasFase3Activas.map((herramienta, index) => {
                    const IconComponent = herramienta.icon;
                    const isActive = subFase1 === herramienta.id;
                    return (
                      <React.Fragment key={herramienta.id}>
                        {index > 0 && (
                          <div className="pipeline-connector-node" aria-hidden="true">
                            <ChevronRight size={14} className="connector-chevron" />
                          </div>
                        )}
                        <button
                          type="button"
                          className={`subfase-tab ${isActive ? 'active' : ''}`}
                          title={`${index + 1}. ${herramienta.nombre}`}
                          onClick={() => {
                            navegarAHerramienta(herramienta.id);
                          }}
                        >
                          <div className="subfase-tab-prefix">
                            <span className="subfase-step-num">{`3.${index + 1}`}</span>
                            <div className="subfase-icon-wrapper">
                              <IconComponent size={16} />
                            </div>
                          </div>
                          <div className="subfase-tab-text">
                            <span className="subfase-title">{herramienta.nombre}</span>
                          </div>
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {/* SUB-NAVEGACIÓN INTERNA SECUENCIAL: DIAGNÓSTICO METODOLÓGICO FASE 4 (DIAGNÓSTICO EMPRESARIAL INTERNO) */}
              {faseActual === 4 && (
                <div className="subfases-nav-tabs pipeline-chain diagnostico-interno-tabs">
                  {[
                    { id: 'interno-vertical-horizontal', nombre: 'Análisis vertical y horizontal', icon: ICONOS_HERRAMIENTAS['interno-vertical-horizontal'] },
                    { id: 'customer-journey', nombre: 'Customer Journey Map', icon: ICONOS_HERRAMIENTAS['customer-journey'] },
                    { id: 'flujogramas', nombre: 'Flujogramas', icon: ICONOS_HERRAMIENTAS.flujogramas },
                    { id: 'efi', nombre: 'Matriz EFI', icon: ICONOS_HERRAMIENTAS.efi },
                    { id: 'auditoria-redes', nombre: 'Auditoría de redes sociales', icon: ICONOS_HERRAMIENTAS['auditoria-redes'] },
                    { id: 'evaluacion-360', nombre: 'Evaluación 360 grados', icon: ICONOS_HERRAMIENTAS['evaluacion-360'] },
                    { id: 'inventarios', nombre: 'Inventarios y almacenes', icon: ICONOS_HERRAMIENTAS.inventarios }
                  ].filter(herramienta => herramientasActivasCaso.includes(herramienta.id)).map((herramienta, index) => {
                    const Icono = herramienta.icon;
                    return <button key={herramienta.id} type="button" className={`subfase-tab ${subFase1 === herramienta.id ? 'active' : ''}`} title={herramienta.nombre} onClick={() => navegarAHerramientaInterna(herramienta.id)}>
                      <div className="subfase-tab-prefix"><span className="subfase-step-num">{`4.${index + 1}`}</span><div className="subfase-icon-wrapper"><Icono size={16}/></div></div>
                      <div className="subfase-tab-text"><span className="subfase-title">{herramienta.nombre}</span></div>
                    </button>;
                  })}
                </div>
              )}

              {/* SUB-NAVEGACIÓN INTERNA SECUENCIAL: FASE 5 (FODA Y RESÚMENES DE DIAGNÓSTICO) */}
              {SUBFASES_FASE5.some(item => item.id === subFase1) && (
                <div className="subfases-nav-tabs pipeline-chain">
                  {fase5Activas.map((item, index) => {
                    const Icono = item.icon;
                    return <React.Fragment key={item.id}>
                      {index > 0 && <div className="pipeline-connector-node" aria-hidden="true"><ChevronRight size={14} className="connector-chevron"/></div>}
                      <button type="button" className={`subfase-tab ${subFase1 === item.id ? 'active' : ''}`} title={`${index + 1}. ${item.nombre}`} onClick={() => navegarFase5(item.id)}>
                        <div className="subfase-tab-prefix"><span className="subfase-step-num">{`5.${index + 1}`}</span><div className="subfase-icon-wrapper"><Icono size={16}/></div></div>
                        <div className="subfase-tab-text"><span className="subfase-title">{item.nombre}</span></div>
                      </button>
                    </React.Fragment>;
                  })}
                </div>
              )}

              {/* SUB-NAVEGACIÓN INTERNA SECUENCIAL: FASE 6 (PLANIFICACIÓN Y TOMA DE DECISIONES) */}
              {SUBFASES_FASE6.some(item => item.id === subFase1) && (
                <div className="subfases-nav-tabs pipeline-chain">
                  {fase6Activas.map((item, index) => {
                    const Icono = item.icon;
                    return <React.Fragment key={item.id}>
                      {index > 0 && <div className="pipeline-connector-node" aria-hidden="true"><ChevronRight size={14} className="connector-chevron"/></div>}
                      <button type="button" className={`subfase-tab ${subFase1 === item.id ? 'active' : ''}`} title={`${index + 1}. ${item.nombre}`} onClick={() => navegarFase6(item.id)}>
                        <div className="subfase-tab-prefix"><span className="subfase-step-num">{`6.${index + 1}`}</span><div className="subfase-icon-wrapper"><Icono size={16}/></div></div>
                        <div className="subfase-tab-text"><span className="subfase-title">{item.nombre}</span></div>
                      </button>
                    </React.Fragment>;
                  })}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* 3. CONTENIDO SEGÚN LA FASE ACTIVA */}
        {subFase1 === 'contexto' ? (
          /* ================================================================
             VISTA 1: CONTEXTO INTEGRAL DEL CASO DE ESTUDIO
             ================================================================ */
          <div className="caso-contexto-fase-container">
            <DossierCaso caso={casoActivoSimulacion} defaultExpandido={true} />

            {/* FOOTER DE FASE 1: VOLVER A CASOS Y CONTINUAR A LLUVIA DE IDEAS (FASE 2) */}
            <PieNavegacion onSiguiente={() => { alerta.exito("Fase 1 Concluida", "Iniciando Fase 2: Lluvia de Ideas."); irSiguientePaso('contexto'); }}/>
          </div>
        ) : subFase1 === 'lluvia' ? (
          /* ================================================================
             VISTA 1.1: TALLER DE LLUVIA DE IDEAS (BRAINSTORMING)
             ================================================================ */
          <div className="lluvia-simulator-container">
            <div className="simulacion-main-grid lluvia-grid-layout" style={{ gridTemplateColumns: '1fr', width: '100%' }}>
              <div className="simulacion-workspace-left" style={{ width: '100%', maxWidth: '100%' }}>

                <EncabezadoHerramienta icono={ICONOS_HERRAMIENTAS.lluvia} titulo="Lluvia de ideas · Hechos clave del caso" exportando={exportandoLluviaPDF} onExportar={exportarLluviaPDF}>
                  <span className="hf-toolbar-stat">{ideasSeleccionadasLluvia.length} de {ideasLluvia.length} seleccionadas</span>
                </EncabezadoHerramienta>

                {/* BARRA DE CONTROL ELEGANTE DE LA LLUVIA: FILTROS + SELECCIÓN RÁPIDA + AÑADIR A LA LLUVIA */}
                <div className="lluvia-control-bar">
                  <div className="lluvia-control-left">
                    <span className="lluvia-filtros-label">
                      <Filter size={14} />
                      Filtrar:
                    </span>
                    <div className="lluvia-filtros-chips">
                      {['Todas', 'Seleccionadas', 'Internas', 'Externas', 'Personalizadas'].map(f => (
                        <button
                          key={f}
                          type="button"
                          className={`btn-filtro-chip ${filtroLluvia === f ? 'activo' : ''}`}
                          onClick={() => setFiltroLluvia(f)}
                        >
                          {f}
                          {f === 'Todas' && ` (${ideasLluvia.length})`}
                          {f === 'Seleccionadas' && ` (${ideasSeleccionadasLluvia.length})`}
                          {f === 'Internas' && ` (${ideasLluvia.filter(i => i.tipoAmbito === 'Interno').length})`}
                          {f === 'Externas' && ` (${ideasLluvia.filter(i => i.tipoAmbito === 'Externo' || i.tipoAmbito === 'Macroentorno').length})`}
                          {f === 'Personalizadas' && ` (${ideasLluvia.filter(i => i.esPersonalizada).length})`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="lluvia-control-right">
                    <div className="lluvia-quick-select-wrap">
                      <button
                        type="button"
                        onClick={seleccionarTodasIdeas}
                        className="btn-lluvia-quick-tool"
                        title="Alternar selección de todas las ideas"
                      >
                        <CheckSquare size={13} />
                        <span>Todas</span>
                      </button>
                      <button
                        type="button"
                        onClick={seleccionarTodasInternas}
                        className="btn-lluvia-quick-tool"
                        title="Seleccionar todas las internas"
                      >
                        <CheckSquare size={13} />
                        <span>Internas</span>
                      </button>
                      <button
                        type="button"
                        onClick={seleccionarTodasExternas}
                        className="btn-lluvia-quick-tool"
                        title="Seleccionar todas las externas"
                      >
                        <CheckSquare size={13} />
                        <span>Externas</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="btn-anadir-lluvia-board"
                      onClick={() => {
                        setIdeaEnEdicion(null);
                        setNuevaIdeaTexto('');
                        setNuevaIdeaAmbito('');
                        setNuevaIdeaCategoria('');
                        setNuevaIdeaCategoriaOtra('');
                        setModalNuevaIdeaAbierto(true);
                      }}
                      id="btn-anadir-a-la-lluvia"
                      title="Proponer nueva idea o hallazgo clave en el caso"
                    >
                      <Plus size={15} />
                      <span>Añadir a la Lluvia</span>
                    </button>
                  </div>
                </div>

                {/* MODAL: AÑADIR A LA LLUVIA DE IDEAS */}
                {modalNuevaIdeaAbierto && createPortal(
                  <div
                    className="lluvia-modal-overlay animate-fade-in"
                    onClick={() => {
                      setModalNuevaIdeaAbierto(false);
                      setIdeaEnEdicion(null);
                      setNuevaIdeaTexto('');
                      setNuevaIdeaAmbito('');
                      setNuevaIdeaCategoria('');
                      setNuevaIdeaCategoriaOtra('');
                    }}
                  >
                    <div
                      className="lluvia-modal-box animate-scale-up"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="lluvia-modal-header">
                        <div className="lluvia-modal-header-left">
                          <div className="lluvia-modal-icon-badge">
                            {ideaEnEdicion ? <Edit size={20} /> : <Plus size={20} />}
                          </div>
                          <div>
                            <h3 className="lluvia-modal-title">
                              {ideaEnEdicion ? 'Editar Hecho o Idea Propuesta' : '¿Detectas otro hecho o idea clave en el caso?'}
                            </h3>
                            <p className="lluvia-modal-subtitle">
                              {ideaEnEdicion
                                ? 'Modifica la descripción, ámbito o área funcional de tu hallazgo.'
                                : 'Registra un hallazgo o propuesta estratégica para integrarla al taller de lluvia de ideas.'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="lluvia-modal-close-btn"
                          onClick={() => {
                            setModalNuevaIdeaAbierto(false);
                            setIdeaEnEdicion(null);
                            setNuevaIdeaTexto('');
                            setNuevaIdeaAmbito('');
                            setNuevaIdeaCategoria('');
                            setNuevaIdeaCategoriaOtra('');
                          }}
                          title="Cerrar modal"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <form onSubmit={agregarNuevaIdea} className="lluvia-modal-form">
                        <div className="lluvia-modal-field">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="lluvia-modal-label">Descripción del Hecho o Idea: *</label>
                            <span className="lluvia-modal-hint" style={{ fontSize: '0.72rem', fontWeight: '600', color: nuevaIdeaTexto.length > 450 ? '#ea580c' : 'var(--text-muted)' }}>
                              {nuevaIdeaTexto.length} / 500
                            </span>
                          </div>
                          <textarea
                            className="lluvia-modal-textarea"
                            rows={3}
                            maxLength={500}
                            placeholder="Ej: Implementar servicio de suscripción mensual de café tostado a oficinas..."
                            value={nuevaIdeaTexto}
                            onChange={(e) => setNuevaIdeaTexto(e.target.value)}
                            autoFocus
                            required
                          />
                        </div>

                        <div className="lluvia-modal-grid-fields">
                          <div className="lluvia-modal-field">
                            <label className="lluvia-modal-label">Ámbito: *</label>
                            <select
                              className="lluvia-modal-select"
                              value={nuevaIdeaAmbito}
                              onChange={(e) => setNuevaIdeaAmbito(e.target.value)}
                              required
                            >
                              <option value="">-- Seleccionar Ámbito --</option>
                              <option value="Interno">Interno (Bajo control directo)</option>
                              <option value="Externo">Externo (Fuerzas del mercado/entorno)</option>
                            </select>
                            <span className="lluvia-modal-hint">
                              {nuevaIdeaAmbito === 'Interno'
                                ? 'Gobernanza de la empresa (irá como insumo para Fase 4)'
                                : nuevaIdeaAmbito === 'Externo'
                                ? 'Proviene del mercado (irá como insumo para Fase 3)'
                                : 'Clasifica si este hecho es gobernado por la empresa o proviene del entorno'}
                            </span>
                          </div>

                          <div className="lluvia-modal-field">
                            <label className="lluvia-modal-label">Área / Categoría: *</label>
                            <select
                              className="lluvia-modal-select"
                              value={nuevaIdeaCategoria}
                              onChange={(e) => setNuevaIdeaCategoria(e.target.value)}
                              required
                            >
                              <option value="">-- Seleccionar Área / Categoría --</option>
                              <option value="Operaciones">Operaciones</option>
                              <option value="Talento Humano">Talento Humano</option>
                              <option value="Financiero">Financiero</option>
                              <option value="Mercado">Mercado</option>
                              <option value="Competencia">Competencia</option>
                              <option value="Tecnología">Tecnología</option>
                              <option value="Otro">Otro</option>
                            </select>
                            {nuevaIdeaCategoria === 'Otro' && (
                              <input
                                type="text"
                                className="lluvia-modal-select"
                                style={{ marginTop: '8px', width: '100%' }}
                                placeholder="Escribe el nombre de la otra área o categoría..."
                                value={nuevaIdeaCategoriaOtra}
                                onChange={(e) => setNuevaIdeaCategoriaOtra(e.target.value)}
                                autoFocus
                                required
                              />
                            )}
                            <span className="lluvia-modal-hint">Área funcional que gobierna o impacta el hallazgo</span>
                          </div>
                        </div>

                        <div className="lluvia-modal-footer">
                          <button
                            type="button"
                            className="lluvia-modal-btn-cancel"
                            onClick={() => {
                              setModalNuevaIdeaAbierto(false);
                              setIdeaEnEdicion(null);
                              setNuevaIdeaTexto('');
                              setNuevaIdeaAmbito('');
                              setNuevaIdeaCategoria('');
                              setNuevaIdeaCategoriaOtra('');
                            }}
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="lluvia-modal-btn-submit"
                            disabled={!formularioNuevaIdeaValido}
                            title={!formularioNuevaIdeaValido ? "Completa todos los campos requeridos" : (ideaEnEdicion ? "Guardar cambios" : "Añadir a la lluvia")}
                          >
                            {ideaEnEdicion ? <Check size={16} /> : <Plus size={16} />}
                            <span>{ideaEnEdicion ? 'Guardar Cambios' : 'Añadir a la Lluvia'}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>,
                  document.body
                )}

                {/* SI EL CASO NO TIENE NINGUNA IDEA INICIAL */}
                {ideasLluvia.length === 0 ? (
                  <div style={{ padding: '36px 20px', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px dashed var(--border-color)', margin: '14px 0' }}>
                    <Sparkles size={28} style={{ color: 'var(--primary-color)', marginBottom: '10px', opacity: 0.8 }} />
                    <h4 style={{ margin: '0 0 6px', fontSize: '1rem', color: 'var(--text-main)', fontWeight: '700' }}>
                      Muro de Lluvia de Ideas Inicial
                    </h4>
                    <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.5' }}>
                      Este caso inicia desde cero sin hechos predeterminados. Comienza proponiendo y registrando tus propios hallazgos y evidencias estratégicas para estructurar el diagnóstico.
                    </p>
                    <button
                      type="button"
                      className="modal-standard-btn-confirm"
                      onClick={() => {
                        setIdeaEnEdicion(null);
                        setNuevaIdeaTexto('');
                        setNuevaIdeaAmbito('');
                        setNuevaIdeaCategoria('');
                        setNuevaIdeaCategoriaOtra('');
                        setModalNuevaIdeaAbierto(true);
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
                    >
                      <Plus size={15} />
                      <span>Proponer Primer Hallazgo</span>
                    </button>
                  </div>
                ) : (
                  /* TABLERO DE CARRILES: FACTORES INTERNOS (IZQUIERDA) Y FACTORES EXTERNOS (DERECHA) */
                  <div className="lluvia-carriles-board">
                    {/* CARRIL 1: FACTORES INTERNOS */}
                    <div className="lluvia-carril carril-interno">
                      <div className="lluvia-carril-header">
                        <div className="lluvia-carril-header-top">
                          <div className="lluvia-carril-title-wrap">
                            <div className="lluvia-carril-icon">
                              <Building2 size={19} />
                            </div>
                            <div>
                              <h4 className="lluvia-carril-heading">Factores Internos</h4>
                              <p className="lluvia-carril-subheading">Capacidades, operaciones, finanzas • Insumo Fase 4</p>
                            </div>
                          </div>
                        </div>

                        <div className="lluvia-carril-meta">
                          <span className={`lluvia-carril-badge ${conteoInternasLluvia >= 4 ? 'cumplido' : 'pendiente'}`}>
                            {conteoInternasLluvia >= 4 ? (
                              <>
                                <CheckCircle2 size={13} />
                                <span>{conteoInternasLluvia} seleccionados (Meta cumplida)</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle size={13} />
                                <span>{conteoInternasLluvia}/4 seleccionados (Mínimo 4)</span>
                              </>
                            )}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {ideasInternasFiltradas.length} {ideasInternasFiltradas.length === 1 ? 'factor' : 'factores'}
                          </span>
                        </div>
                      </div>

                      <div className="lluvia-carril-cards">
                        {ideasInternasFiltradas.length > 0 ? (
                          ideasInternasFiltradas.map(renderizarTarjetaIdea)
                        ) : (
                          <div className="lluvia-carril-empty">
                            <Building2 size={24} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                            <p>
                              {filtroLluvia !== 'Todas' 
                                ? `No hay factores internos con el filtro "${filtroLluvia}".`
                                : 'No hay factores internos registrados aún.'}
                            </p>
                            <button
                              type="button"
                              className="btn-carril-select-all"
                              style={{ marginTop: 4 }}
                              onClick={() => {
                                setIdeaEnEdicion(null);
                                setNuevaIdeaTexto('');
                                setNuevaIdeaAmbito('Interno');
                                setNuevaIdeaCategoria('Operaciones');
                                setNuevaIdeaCategoriaOtra('');
                                setModalNuevaIdeaAbierto(true);
                              }}
                            >
                              <Plus size={13} />
                              <span>Añadir Factor Interno</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CARRIL 2: FACTORES EXTERNOS */}
                    <div className="lluvia-carril carril-externo">
                      <div className="lluvia-carril-header">
                        <div className="lluvia-carril-header-top">
                          <div className="lluvia-carril-title-wrap">
                            <div className="lluvia-carril-icon">
                              <Globe size={19} />
                            </div>
                            <div>
                              <h4 className="lluvia-carril-heading">Factores Externos</h4>
                              <p className="lluvia-carril-subheading">Mercado, competencia, entorno • Insumo Fase 3</p>
                            </div>
                          </div>
                        </div>

                        <div className="lluvia-carril-meta">
                          <span className={`lluvia-carril-badge ${conteoExternasLluvia >= 4 ? 'cumplido' : 'pendiente'}`}>
                            {conteoExternasLluvia >= 4 ? (
                              <>
                                <CheckCircle2 size={13} />
                                <span>{conteoExternasLluvia} seleccionados (Meta cumplida)</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle size={13} />
                                <span>{conteoExternasLluvia}/4 seleccionados (Mínimo 4)</span>
                              </>
                            )}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {ideasExternasFiltradas.length} {ideasExternasFiltradas.length === 1 ? 'factor' : 'factores'}
                          </span>
                        </div>
                      </div>

                      <div className="lluvia-carril-cards">
                        {ideasExternasFiltradas.length > 0 ? (
                          ideasExternasFiltradas.map(renderizarTarjetaIdea)
                        ) : (
                          <div className="lluvia-carril-empty">
                            <Globe size={24} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                            <p>
                              {filtroLluvia !== 'Todas' 
                                ? `No hay factores externos con el filtro "${filtroLluvia}".`
                                : 'No hay factores externos registrados aún.'}
                            </p>
                            <button
                              type="button"
                              className="btn-carril-select-all"
                              style={{ marginTop: 4 }}
                              onClick={() => {
                                setIdeaEnEdicion(null);
                                setNuevaIdeaTexto('');
                                setNuevaIdeaAmbito('Externo');
                                setNuevaIdeaCategoria('Económico');
                                setNuevaIdeaCategoriaOtra('');
                                setModalNuevaIdeaAbierto(true);
                              }}
                            >
                              <Plus size={13} />
                              <span>Añadir Factor Externo</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* FOOTER LIMPIO DE NAVEGACIÓN EN LLUVIA DE IDEAS (IDÉNTICO A PORTER Y POAM) */}
            <RespaldoHerramienta id="lluvia"/>
            <PieNavegacion idSiguiente="btn-pasar-arbol-problemas"/>
          </div>
        ) : subFase1 === 'arbol' ? (
          /* ================================================================
             VISTA 2.2: ÁRBOL DE PROBLEMAS (METODOLOGÍA MARCO LÓGICO)
             ================================================================ */
          <ArbolProblemas
            ideasLluvia={ideasLluvia}
            ideasSeleccionadasLluvia={ideasSeleccionadasLluvia}
            datosArbol={datosArbol}
            setDatosArbol={setDatosArbol}
            onVolverALluvia={() => irAnteriorPaso('arbol')}
            onContinuarAPorter={() => irSiguientePaso('arbol')}
            onExportarPDF={exportarArbolPDF}
            exportandoPDF={exportandoArbolPDF}
          />
        ) : subFase1 === 'pestel' ? (
          /* ================================================================
             VISTA 1.1: ANÁLISIS PESTEL (MACROENTORNO ESTRATÉGICO)
             ================================================================ */
          <AnalisisPESTEL
            casoActivo={casoActivoSimulacion}
            datosPestel={datosPestel}
            setDatosPestel={setDatosPestel}
            onExportarPDF={exportarPestelPDF}
            exportandoPDF={exportandoPestelPDF}
            onContinuarAPorter={() => irSiguientePaso('pestel')}
            onIrAArbol={() => irAnteriorPaso('pestel')}
          />
        ) : subFase1 === 'porter' ? (
          /* ================================================================
             VISTA 1.2: DIAGRAMA DE LAS 5 FUERZAS DE MICHAEL PORTER (Y ENTORNO PEST)
             ================================================================ */
          <DiagramaPorter
            casoActivo={casoActivoSimulacion}
            datosPorter={datosPorter}
            setDatosPorter={setDatosPorter}
            onExportarPDF={exportarPorterPDF}
            exportandoPDF={exportandoPorterPDF}
            onExportarAPoam={() => irSiguientePaso('porter')}
            onIrAPoam={() => { 
              const sig = obtenerSiguienteHerramienta('porter');
              if (sig) navegarAHerramienta(sig);
              else despuesDeFase3();
            }}
            onIrAPestel={() => irAnteriorPaso('porter')}
            onIrALluvia={() => { setSubFase1('pestel'); setFaseActual(3); }}
          />
        ) : subFase1 === 'mpc' ? (
          /* ================================================================
             VISTA 1.2.5: MATRIZ DE PERFIL COMPETITIVO (MPC - FASE 5 EN FLUJO)
             ================================================================ */
          <MatrizPerfilCompetitivo
            casoActivo={casoActivoSimulacion}
            datosMpc={datosMpc}
            setDatosMpc={setDatosMpc}
            onExportarPDF={exportarMpcPDF}
            exportandoPDF={exportandoMpcPDF}
            onVolverAPorter={() => irAnteriorPaso('mpc')}
            onContinuarAPoam={() => irSiguientePaso('mpc')}
            onNavegarFase={(num) => {
              if (num === 1) { setSubFase1('contexto'); setFaseActual(1); }
              else if (num === 2) { setSubFase1('lluvia'); setFaseActual(2); }
              else if (num === 3) { navegarAHerramienta('pestel'); }
              else if (num === 4) { navegarAHerramienta('porter'); }
              else if (num === 5) { navegarAHerramienta('mpc'); }
              else if (num === 6) { navegarAHerramienta('poam'); }
              else if (num === 7) { navegarAHerramienta('efi'); }
              else if (num === 8) { pasarAMatrizFoda(); setFaseActual(5); }
            }}
          />
        ) : subFase1 === 'poam' ? (
          /* ================================================================
             VISTA 1.3: DIAGRAMA Y PERFIL POAM (Y PCI PARA LO INTERNO)
             ================================================================ */
          <LimiteErroresHerramienta>
            <DiagramaPOAM
              casoActivo={casoActivoSimulacion}
              factoresPoam={factoresPoam.filter(factor => factor.origenPestel)}
              setFactoresPoam={(actualizar) => setFactoresPoam(previo => {
                const factoresPestel = (previo || []).filter(factor => factor.origenPestel);
                const siguientes = typeof actualizar === 'function' ? actualizar(factoresPestel) : actualizar;
                return (siguientes || []).filter(factor => factor.origenPestel);
              })}
              datosPestel={datosPestel}
              ideasLluvia={ideasLluvia}
              onSincronizarFoda={(factores, silencioso) => consolidarEvidenciasParaFoda({ factoresPoamCustom: factores, silencioso })}
              onIrAEfi={() => irSiguientePaso('poam')}
              onIrAFoda={() => irSiguientePaso('poam')}
              onIrAPorter={() => irAnteriorPaso('poam')}
            />
          </LimiteErroresHerramienta>
        ) : (faseActual === 4 || subFase1 === 'efi' || HERRAMIENTAS_INTERNAS.some(item => item.id === subFase1)) ? (
          subFase1 === 'efi' ? <MatrizEFI
            casoActivo={casoActivoSimulacion}
            datosEfi={datosEfi}
            setDatosEfi={setDatosEfi}
            onContinuarAFoda={(factoresEfiPayload) => {
              consolidarEvidenciasParaFoda({ factoresEfiCustom: factoresEfiPayload, cambiarSubFase: true, silencioso: false });
              irSiguientePaso('efi');
            }}
            onAnterior={() => irAnteriorPaso('efi')}
          /> : (() => {
            return <LimiteErroresHerramienta>
              <HerramientaInternaActiva
                casoActivo={casoActivoSimulacion}
                datos={datosDiagnosticoInterno[casoInternoKey] || {}}
                setDatos={(actualizar) => setDatosDiagnosticoInterno(previo => {
                  const datosCaso = previo[casoInternoKey] || {};
                  const nuevosDatos = typeof actualizar === 'function' ? actualizar(datosCaso) : actualizar;
                  return { ...previo, [casoInternoKey]: nuevosDatos };
                })}
              />
            </LimiteErroresHerramienta>;
          })()
        ) : subFase1 === 'foda' ? (
          /* ================================================================
             VISTA 1.2: MATRIZ FODA Y BANDEJA DE EVIDENCIAS
             ================================================================ */
          <div className="foda-simulator-container r5" ref={fodaRef}>
            <div className="hf-container foda-head" data-pdf-block>
              <div className="hf-toolbar">
                <div className="hf-toolbar-badge"><ClipboardList size={15}/><span>Matriz FODA · Fortalezas, debilidades, oportunidades y amenazas</span></div>
                <BotonPdf exportando={exportandoFoda} onClick={exportarFoda} texto="Exportar a PDF"/>
              </div>
            </div>
            <div className="simulacion-main-grid" style={{ gridTemplateColumns: '1fr', width: '100%' }}>

            {/* WORKSPACE GRID DE FODA (BANDEJA LATERAL + MATRIZ FODA) */}
            <div className="simulacion-workspace-left" style={{ width: '100%', maxWidth: '100%' }}>
              <div className={`foda-workspace-grid ${bandejaFodaColapsada ? 'collapsed' : ''}`}>

                {/* 1. SECCIÓN IZQUIERDA: BANDEJA/CARRUSEL DE EVIDENCIAS POR CLASIFICAR (ESTILO POAM) */}
                <div
                  className={`foda-left-carousel-card ${dragOverCuadrante === 'bandeja' ? 'cuadrante-drag-active' : ''}`}
                  onDragOver={(e) => handleDragOver(e, 'bandeja')}
                  onDragEnter={(e) => handleDragEnter(e, 'bandeja')}
                  onDragLeave={(e) => handleDragLeave(e, 'bandeja')}
                  onDrop={(e) => handleDrop(e, null)}
                >
                  {bandejaFodaColapsada ? (
                    <div className="foda-tray-collapsed-dock">
                      <button 
                        type="button" 
                        onClick={() => setBandejaFodaColapsada(false)}
                        className="poam-btn-mini-tool"
                        title="Expandir bandeja de evidencias"
                        style={{ padding: '10px 6px' }}
                      >
                        <PanelRightOpen size={20} />
                      </button>
                      <div className="foda-tray-collapsed-text">
                        Evidencias Pendientes ({evidenciasPendientes.length})
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
                              {evidenciasPendientes.length} Pendientes
                            </span>
                          </div>
                          <div className="foda-tray-actions">
                            <button
                              type="button"
                              className="foda-btn-icon-tool"
                              onClick={restablecerTodasABandeja}
                              title="Mover todas las noticias a la bandeja"
                            >
                              <RotateCcw size={13} />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setBandejaFodaColapsada(true)}
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
                            className={`poam-tray-tab ${filtroBandejaFoda === 'Todas' ? 'active' : ''}`}
                            onClick={() => { setFiltroBandejaFoda('Todas'); setPaginaBandejaFoda(1); }}
                            title="Ver todas las evidencias pendientes"
                          >
                            Todas ({evidenciasPendientes.length})
                          </button>
                          <button
                            type="button"
                            className={`poam-tray-tab int ${filtroBandejaFoda === 'Internos' ? 'active' : ''}`}
                            onClick={() => { setFiltroBandejaFoda('Internos'); setPaginaBandejaFoda(1); }}
                            title="Factores internos: solo van a Fortalezas (+F) o Debilidades (-D)"
                          >
                            <span style={{ fontWeight: 800, marginRight: '3px' }}>Internos</span>
                            ({conteoPendientesInternos})
                          </button>
                          <button
                            type="button"
                            className={`poam-tray-tab ext ${filtroBandejaFoda === 'Externos' ? 'active' : ''}`}
                            onClick={() => { setFiltroBandejaFoda('Externos'); setPaginaBandejaFoda(1); }}
                            title="Factores externos: solo van a Oportunidades (+O) o Amenazas (-A)"
                          >
                            <span style={{ fontWeight: 800, marginRight: '3px' }}>Externos</span>
                            ({conteoPendientesExternos})
                          </button>
                        </div>

                        {/* BUSCADOR DE EVIDENCIAS */}
                        <div className="poam-tray-search-input-wrap">
                          <Search size={13} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                          <input
                            type="text"
                            placeholder="Buscar evidencia..."
                            value={busquedaBandejaFoda}
                            onChange={(e) => { setBusquedaBandejaFoda(e.target.value); setPaginaBandejaFoda(1); }}
                            className="poam-tray-search-input"
                            style={{ width: '100%', padding: '6px 8px 6px 26px', fontSize: '0.74rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-main)', boxSizing: 'border-box' }}
                          />
                          {busquedaBandejaFoda && (
                            <button
                              type="button"
                              onClick={() => { setBusquedaBandejaFoda(''); setPaginaBandejaFoda(1); }}
                              className="poam-tray-clear-search"
                              title="Limpiar búsqueda"
                              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}
                            >
                              <X size={11} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* LISTADO VERTICAL DE TARJETAS TIPO CARRUSEL/TRACK ESTILO POAM */}
                      <div className="foda-tray-cards-container">
                        {evidenciasPendientes.length > 0 ? (
                          evidenciasPendientesFiltradas.length > 0 ? (
                            <div className="foda-tray-cards-viewport">
                              <div className="foda-tray-cards-list">
                                {evidenciasPaginadasFoda.map((ev) => {
                                  const esOp = esPositivoFoda(ev);
                                  const { catNorm, dimInfo } = infoChipFoda(ev);

                                  return (
                                    <div
                                      key={ev.id}
                                      className="evidencia-draggable-card noticia-card foda-tray-card"
                                      draggable
                                      onDragStart={(e) => handleDragStart(e, ev.id)}
                                      onDragEnd={handleDragEnd}
                                    >
                                      {/* ENCABEZADO DE LA TARJETA COMPACTO */}
                                      <div className="noticia-header">
                                        <div className="foda-header-tags-wrapper">
                                          <div className="noticia-grip-tag">
                                            <GripVertical size={13} className="noticia-grip-icon" />
                                            <span className={`foda-origen-etiqueta ${esOp ? 'origen-externo' : 'origen-amenaza'}`}>
                                              {etiquetaFoda(ev)}
                                            </span>
                                          </div>

                                          <span
                                            className="foda-header-chip chip-cat"
                                            title={`Dimensión: ${catNorm}`}
                                            style={{
                                              background: `rgba(${dimInfo?.colorRgb || '59, 130, 246'}, 0.12)`,
                                              borderColor: `rgba(${dimInfo?.colorRgb || '59, 130, 246'}, 0.35)`,
                                              color: dimInfo?.color || '#3b82f6',
                                              fontWeight: 700
                                            }}
                                          >
                                            <span className="foda-chip-text">{catNorm}</span>
                                          </span>
                                        </div>
                                      </div>

                                      {/* CONTENIDO Y TEXTO */}
                                      <div className="noticia-body">
                                        <p className="noticia-texto">{ev.texto}</p>
                                      </div>

                                      {/* PIE CON ACCIONES RÁPIDAS */}
                                      <div className="noticia-footer">
                                        <span className="quick-label">Ubicar en:</span>
                                        <div className="evidencia-quick-assign-row">
                                          {esInternoFoda(ev) ? (
                                            <>
                                              <button type="button" className="btn-quick-cuadrante f" title="Asignar a Fortalezas (+F)" onClick={() => moverEvidencia(ev.id, 'Fortalezas')}>+F</button>
                                              <button type="button" className="btn-quick-cuadrante d" title="Asignar a Debilidades (-D)" onClick={() => moverEvidencia(ev.id, 'Debilidades')}>-D</button>
                                            </>
                                          ) : (
                                            <>
                                              <button type="button" className="btn-quick-cuadrante o" title="Asignar a Oportunidades (+O)" onClick={() => moverEvidencia(ev.id, 'Oportunidades')}>+O</button>
                                              <button type="button" className="btn-quick-cuadrante a" title="Asignar a Amenazas (-A)" onClick={() => moverEvidencia(ev.id, 'Amenazas')}>-A</button>
                                            </>
                                          )}
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
                                No hay evidencias que coincidan con la búsqueda o filtro.
                              </p>
                            </div>
                          )
                        ) : evidenciasFoda.length === 0 ? (
                          <div className="bandeja-vacia-msg poam-carrusel-completed-msg" style={{ padding: '20px 10px', textAlign: 'center' }}>
                            <Clock size={24} style={{ color: 'var(--text-muted)', flexShrink: 0, margin: '0 auto 8px auto' }} />
                            <div>
                              {(() => {
                                const fuentes = [herramientasActivasCaso.includes('efi') && 'la Matriz EFI', herramientasActivasCaso.includes('pestel') && 'el PESTEL'].filter(Boolean);
                                const nombres = fuentes.length ? fuentes.join(' y ') : 'los pasos anteriores';
                                return <>
                                  <strong style={{ display: 'block', marginBottom: '3px', fontSize: '0.82rem' }}>Esperando factores de {nombres}</strong>
                                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                    Aún no hay factores para clasificar. Completa {nombres} y aparecerán aquí.
                                  </span>
                                </>;
                              })()}
                            </div>
                          </div>
                        ) : (
                          <div className="bandeja-vacia-msg" style={{ padding: '20px 10px', textAlign: 'center' }}>
                            <CheckCircle2 size={24} style={{ color: '#10b981', flexShrink: 0, margin: '0 auto 8px auto' }} />
                            <div>
                              <strong style={{ display: 'block', marginBottom: '3px', fontSize: '0.82rem' }}>¡Todas las noticias clasificadas!</strong>
                              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                Arrastra para reubicar o pulsa "Restablecer".
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* PAGINADOR VERTICAL ESTILO POAM */}
                      {totalPaginasBandejaFoda > 1 && (
                        <div className="foda-tray-paginator">
                          <button
                            type="button"
                            onClick={() => setPaginaBandejaFoda(p => Math.max(1, p - 1))}
                            disabled={paginaActualBandejaFoda === 1}
                            className="poam-btn-mini-tool foda-btn-page"
                          >
                            <ChevronUp size={15} />
                          </button>
                          <span className="foda-paginator-text">
                            {paginaActualBandejaFoda} / {totalPaginasBandejaFoda}
                          </span>
                          <button
                            type="button"
                            onClick={() => setPaginaBandejaFoda(p => Math.min(totalPaginasBandejaFoda, p + 1))}
                            disabled={paginaActualBandejaFoda === totalPaginasBandejaFoda}
                            className="poam-btn-mini-tool foda-btn-page"
                          >
                            <ChevronDown size={15} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

              {/* SECCIÓN B: MATRIZ ESTRATÉGICA FODA (SWOT) */}
              <div className="matriz-foda-card" data-pdf-block>

                {/* GRID 2x2 DE CUADRANTES FODA */}
                <div className="matriz-foda-grid">
                  {cuadrantesFODA.map((cuad) => {
                    const IconoCuadrante = cuad.icono;
                    const evidenciasEnCuadrante = evidenciasFoda.filter(e => e.cuadranteActual === cuad.tipo);
                    const isHovered = dragOverCuadrante === cuad.tipo;

                    // Validación de compatibilidad de ámbito (Interno solo a F/D, Externo solo a O/A)
                    const esInterno = factorArrastradoFoda?.tipoAmbito === 'Interno';
                    const esIncompatible = factorArrastradoFoda ? (
                      (esInterno && (cuad.tipo === 'Oportunidades' || cuad.tipo === 'Amenazas')) ||
                      (!esInterno && (cuad.tipo === 'Fortalezas' || cuad.tipo === 'Debilidades'))
                    ) : false;

                    const dragClass = isHovered
                      ? (esIncompatible ? 'cuadrante-drag-invalid' : 'cuadrante-drag-active')
                      : (esIncompatible ? 'cuadrante-incompatible-dim' : '');

                    return (
                      <div
                        key={cuad.tipo}
                        className={`cuadrante-box ${cuad.colorClass} ${dragClass}`}
                        onDragOver={(e) => handleDragOver(e, cuad.tipo)}
                        onDragEnter={(e) => handleDragEnter(e, cuad.tipo)}
                        onDragLeave={(e) => handleDragLeave(e)}
                        onDrop={(e) => handleDrop(e, cuad.tipo)}
                      >
                        <div className="cuadrante-header">
                          <div className="cuadrante-title-info">
                            <IconoCuadrante size={18} className="cuadrante-header-icon" />
                            <div>
                              <h4 className="cuadrante-name">{cuad.titulo}</h4>
                              <span className="cuadrante-subname">{cuad.subtitulo}</span>
                            </div>
                          </div>
                          <span className={`cuadrante-badge ${cuad.colorClass}`}>
                            {evidenciasEnCuadrante.length} {evidenciasEnCuadrante.length === 1 ? 'Ubicada' : 'Ubicadas'}
                          </span>
                        </div>

                        {/* CONTENEDOR DE ITEMS CLASIFICADOS EN EL CUADRANTE */}
                        <div className="cuadrante-items-list">
                          {evidenciasEnCuadrante.map((item) => {
                            const esOp = esPositivoFoda(item);
                            const { catNorm, dimInfo } = infoChipFoda(item);

                            return (
                              <div
                                key={item.id}
                                className="item-clasificado-card"
                                draggable
                                onDragStart={(e) => handleDragStart(e, item.id)}
                                onDragEnd={handleDragEnd}
                                title="Arrastra para reubicar en otro cuadrante o devolver a la bandeja"
                              >
                                <div className="item-clasificado-top">
                                  <div className="foda-header-tags-wrapper">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                      <GripVertical size={13} style={{ color: 'var(--text-muted)', cursor: 'grab' }} />
                                      <span className={`foda-origen-etiqueta ${esOp ? 'origen-externo' : 'origen-amenaza'}`}>
                                        {etiquetaFoda(item)}
                                      </span>
                                    </div>

                                    <span
                                      className="foda-header-chip chip-cat"
                                      title={`Dimensión: ${catNorm}`}
                                      style={{
                                        background: `rgba(${dimInfo?.colorRgb || '59, 130, 246'}, 0.12)`,
                                        borderColor: `rgba(${dimInfo?.colorRgb || '59, 130, 246'}, 0.35)`,
                                        color: dimInfo?.color || '#3b82f6',
                                        fontWeight: 700
                                      }}
                                    >
                                      <span className="foda-chip-text">{catNorm}</span>
                                    </span>
                                  </div>
                                  <button
                                    className="btn-retirar-item"
                                    onClick={() => moverEvidencia(item.id, null)}
                                    title="Devolver a la bandeja de pendientes"
                                  >
                                    <RotateCcw size={12} />
                                    <span>Retirar</span>
                                  </button>
                                </div>
                                <p className="item-clasificado-texto">{item.texto}</p>
                              </div>
                            );
                          })}

                          {/* ZONA DE SUELTA / INDICADOR DE CUADRANTE */}
                          <div className={`cuadrante-dropzone ${esIncompatible ? 'dropzone-bloqueada' : ''}`}>
                            {factorArrastradoFoda && esIncompatible ? (
                              <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.72rem' }}>
                                🚫 Bloqueado: Factor {esInterno ? 'Interno (solo F o D)' : 'Externo (solo O o A)'}
                              </span>
                            ) : factorArrastradoFoda ? (
                              <span style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.72rem' }}>
                                ⊕ Soltar en {cuad.titulo}
                              </span>
                            ) : (
                              <span>⊕ {cuad.textoDrop}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div> {/* Fin de foda-workspace-grid */}

          </div>

            </div>

            {/* FOOTER LIMPIO DE NAVEGACIÓN INFERIOR (RÉPLICA EXACTA DE POAM Y PORTER) */}
            <RespaldoHerramienta id="foda"/>
            <PieNavegacion idSiguiente="btn-avanzar-resumen-problema"/>
          </div>
        ) : subFase1 === 'resumen-problema' ? (
          <LimiteErroresHerramienta>
            <ResumenIdentificacionProblema
              casoActivo={casoActivoSimulacion}
              ideasLluvia={ideasLluvia}
              datosArbol={datosArbol}
              onIrAHerramienta={id => { setSubFase1(id); setFaseActual(2); }}
            />
          </LimiteErroresHerramienta>
        ) : subFase1 === 'resumen-externo' ? (
          <LimiteErroresHerramienta>
            <ResumenDiagnosticoExterno
              casoActivo={casoActivoSimulacion}
              datosPestel={datosPestel}
              datosPorter={datosPorter}
              datosMpc={datosMpc}
              factoresPoam={factoresPoam}
              herramientasActivas={herramientasFase3Activas.map(item => item.id)}
              onIrAHerramienta={navegarAHerramienta}
            />
          </LimiteErroresHerramienta>
        ) : subFase1 === 'resumen-interno' ? (
          <LimiteErroresHerramienta>
            <ResumenDiagnosticoInterno
              casoActivo={casoActivoSimulacion}
              datosInterno={datosDiagnosticoInterno[casoInternoKey] || {}}
              datosEfi={datosEfi}
              onIrAHerramienta={id => (id === 'efi' ? navegarAHerramienta('efi') : navegarAHerramientaInterna(id))}
            />
          </LimiteErroresHerramienta>
        ) : subFase1 === 'dafo' ? (
          <LimiteErroresHerramienta>
            <MatrizDafo
              casoActivo={casoActivoSimulacion}
              factores={factoresFoda}
              plan={planCaso}
              actualizarPlan={actualizarPlanCaso}
            />
          </LimiteErroresHerramienta>
        ) : subFase1 === 'ansoff' ? (
          <LimiteErroresHerramienta>
            <MatrizAnsoff
              casoActivo={casoActivoSimulacion}
              plan={planCaso}
              actualizarPlan={actualizarPlanCaso}
            />
          </LimiteErroresHerramienta>
        ) : null}

        {/* MODAL DE RESULTADO Y AVANCE A FASE 2 */}
        {modalEvaluacionFase && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '26px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', position: 'relative' }}>
              <button onClick={() => setModalEvaluacionFase(false)} style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Sparkles size={24} style={{ color: '#10b981' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>¡Análisis de resultados completado!</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', lineHeight: '1.5', marginBottom: '16px' }}>
                Has completado la matriz estratégica de <strong>{casoActivoSimulacion.titulo}</strong> con una precisión del <strong>{precisionDiagnostico}%</strong>. El FODA y los resúmenes del diagnóstico están consolidados y listos para formular las estrategias de la Fase 6.
              </p>
              <div style={{ backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
                <strong style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <CheckCircle2 size={14} />
                  <span>Fase 6 desbloqueada</span>
                </strong>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-main)' }}>Continúa con la Matriz DAFO y la Matriz Ansoff para planificar las estrategias y el crecimiento de la empresa.</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="modal-standard-btn-cancel" onClick={() => setModalEvaluacionFase(false)}>
                  Revisar resultados
                </button>
                <button
                  className="modal-standard-btn-confirm"
                  onClick={() => {
                    setModalEvaluacionFase(false);
                    if (fase6Activas[0]) navegarFase6(fase6Activas[0].id);
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <span>{fase6Activas.length ? 'Continuar a la Fase 6' : 'Entendido'}</span>
                    <ArrowRight size={14} />
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CONTENEDORES OCULTOS PARA EXPORTACIÓN INDIVIDUAL A PDF */}
        {casoActivoSimulacion && (
          <div
            style={{
              position: 'fixed',
              left: '-99999px',
              top: 0,
              zIndex: -999,
              pointerEvents: 'none',
              opacity: 1
            }}
            aria-hidden="true"
          >
            {/* Reporte individual de Lluvia de Ideas */}
            <ReportePdfFase2
              ref={reporteLluviaRef}
              tipoReporte="lluvia"
              caso={casoActivoSimulacion}
              ideasLluvia={ideasLluvia}
            />

            {/* Reporte individual de Árbol de Problemas */}
            <ReportePdfFase2
              ref={reporteArbolRef}
              tipoReporte="arbol"
              caso={casoActivoSimulacion}
              datosArbol={datosArbol}
            />

            {/* Reporte individual de Análisis PESTEL */}
            <ReportePdfPestel
              ref={reportePestelRef}
              caso={casoActivoSimulacion}
              datosPestel={datosPestel}
            />

            {/* Reporte individual de Las 5 Fuerzas de Porter */}
            <ReportePdfPorter
              ref={reportePorterRef}
              caso={casoActivoSimulacion}
              datosPorter={datosPorter}
            />

            {/* Reporte individual de Matriz de Perfil Competitivo */}
            <ReportePdfMpc
              ref={reporteMpcRef}
              caso={casoActivoSimulacion}
              datosMpc={datosMpc || {}}
            />
          </div>
        )}

      </div>
      </RespaldoHerramientas.Provider>
      </NavegacionPasos.Provider>
    );
  }

  // =========================================================================
  // VISTA 2: CATÁLOGO DE CASOS (INICIO DE ANÁLISIS EMPRESARIAL)
  // =========================================================================
  return (
    <div className="analisis-container">

      {/* LAYOUT PRINCIPAL DE 2 COLUMNAS */}
      <div className="analisis-main-grid">

        {/* COLUMNA IZQUIERDA: CASOS DISPONIBLES */}
        <div className="casos-column">

          {/* ENCABEZADO DE SECCIÓN DE CASOS */}
          <div className="casos-header">
            <div className="casos-title-box" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FolderOpen size={22} className="casos-title-icon" />
                <div>
                  <h2 className="casos-title">Casos Disponibles para Decisión</h2>
                  <span className="casos-subtitle">Explora diversos sectores y desafíos de gestión ejecutiva</span>
                </div>
              </div>
              {puedeCrearCasos && (
                <button
                  className="modal-standard-btn-confirm"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.9rem', width: 'auto' }}
                  onClick={() => setModalCrearCaso(true)}
                >
                  <Plus size={16} /> Crear Caso
                </button>
              )}
            </div>
          </div>

          {/* BARRA ELEGANTE DE FILTRADO POR CATEGORÍA */}
          <div className="casos-filter-bar">
            {categorias.map((cat) => {
              const conteo = cat === 'Todos' ? casos.length : casos.filter(c => c.categoria === cat).length;
              const esPersonalizada = categoriasPersonalizadas.includes(cat);
              const puedeEliminar = esPersonalizada && conteo === 0;

              return (
                <button
                  key={cat}
                  className={`casos-filter-pill ${categoriaSeleccionada === cat ? 'active' : ''}`}
                  onClick={() => cambiarCategoria(cat)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>{cat}</span>
                  <span className="filter-count">({conteo})</span>
                  {puedeEliminar && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarCategoriaPersonalizada(cat);
                      }}
                      title={`Eliminar campo ${cat}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: '2px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        fontSize: '11px',
                        opacity: 0.7,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                    >
                      ×
                    </span>
                  )}
                </button>
              );
            })}

            {mostrarInputNuevaCat ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (nuevaCatNombre.trim()) {
                    agregarCategoriaPersonalizada(nuevaCatNombre);
                    setNuevaCatNombre('');
                    setMostrarInputNuevaCat(false);
                  }
                }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <input
                  type="text"
                  autoFocus
                  placeholder="Nuevo campo / categoría..."
                  value={nuevaCatNombre}
                  onChange={(e) => setNuevaCatNombre(e.target.value)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    border: '1px solid var(--primary-color)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.75rem',
                    outline: 'none',
                    minWidth: '160px'
                  }}
                />
                <button
                  type="submit"
                  className="casos-filter-pill active"
                  style={{ padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  title="Guardar nuevo campo"
                >
                  <Check size={12} />
                  <span>Añadir</span>
                </button>
                <button
                  type="button"
                  className="casos-filter-pill"
                  onClick={() => {
                    setMostrarInputNuevaCat(false);
                    setNuevaCatNombre('');
                  }}
                  style={{ padding: '5px 8px' }}
                  title="Cancelar"
                >
                  <X size={12} />
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="casos-filter-pill btn-adicionar-campo"
                onClick={() => setMostrarInputNuevaCat(true)}
                title="Adicionar más campos o categorías de casos"
                style={{
                  borderStyle: 'dashed',
                  borderColor: 'var(--primary-color)',
                  color: 'var(--primary-color)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={13} />
                <span>Adicionar Campo</span>
              </button>
            )}
          </div>

          {/* LISTA PAGINADA DE CASOS (4 POR PÁGINA) */}
          <div className="casos-list" key={paginaValida}>
            {casosPaginados.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '48px 20px',
                background: 'var(--bg-card)',
                borderRadius: '12px',
                border: '1px dashed var(--border-color)',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <FolderOpen size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
                <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: 'var(--text-main)', fontWeight: 700 }}>
                  No hay casos empresariales disponibles
                </h4>
                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  {puedeCrearCasos
                    ? 'Aún no hay casos de estudio registrados. Haz clic en "Crear Caso" para añadir el primero.'
                    : 'Aún no se han registrado casos de estudio para realizar la simulación. Inicia sesión para crear uno.'}
                </p>
                {puedeCrearCasos && (
                  <button
                    className="modal-standard-btn-confirm"
                    style={{ margin: '16px auto 0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 18px', width: 'auto' }}
                    onClick={() => setModalCrearCaso(true)}
                  >
                    <Plus size={16} /> Crear Caso
                  </button>
                )}
              </div>
            ) : (
              casosPaginados.map((c) => {
                const FocoIconComponent = c.focoIcon || Target;
                return (
                  <div key={c.id} className="caso-card">
                    <div className="caso-image-container">
                      <img src={c.imagen} alt={c.titulo} className="caso-image" />
                      <span className="caso-tag">{c.tag}</span>
                    </div>

                    <div className="caso-content">
                      <div className="caso-header-row">
                        <div className="caso-titulo-bloque">
                          <h3 className="caso-name">{c.titulo}</h3>
                          <div className="caso-meta">
                            <span className="caso-dificultad">
                              {c.dificultad}
                              <span className="stars-container" aria-label={`Dificultad ${c.dificultad}`}>
                                {[...Array(3)].map((_, i) => (
                                  <Star key={i} size={12} fill={i < c.estrellas ? "#f97316" : "none"} color={i < c.estrellas ? "#f97316" : "#cbd5e1"} />
                                ))}
                              </span>
                            </span>
                            <span className="caso-chip fases" title="Fase 1 (Contexto e Inducción) y Fase 2 (Identificación de Problema) son obligatorias para todos los casos"><Lock size={11} /> Fases 1 y 2</span>
                            {(() => {
                              const tools = herramientasDelCaso(c);
                              const esTodas = tools.length >= TODAS_LAS_HERRAMIENTAS.length;
                              return <span className="caso-chip herramientas" title={`Herramientas habilitadas: ${tools.map(id => NOMBRES_HERRAMIENTAS[id] || id).join(', ')}`}>
                                <ShieldCheck size={11} /> {esTodas ? `Todas las herramientas (${tools.length})` : `${tools.length} de ${TODAS_LAS_HERRAMIENTAS.length} herramientas`}
                              </span>;
                            })()}
                          </div>
                        </div>
                        <div className="caso-capital">
                          <span className="capital-label">Capital inicial</span>
                          <span className="capital-amount">{c.capital}</span>
                        </div>
                      </div>

                      <p className="caso-description" title={c.descripcion}>{c.descripcion}</p>

                      {avancesCasos[claveCaso(c)] && (() => {
                        const avance = avancesCasos[claveCaso(c)];
                        const fase = avance.faseActual || 1;
                        const completadas = avance.completadas || 0;
                        return <div className="caso-avance" title={`${completadas} de 6 fases completadas (con todas sus herramientas usadas) · Guardado ${haceCuanto(avance.actualizado)}`}>
                          <span className="caso-avance-estado"><span className="caso-avance-punto"/>En curso · Fase {fase}: {NOMBRES_FASES[fase]}</span>
                          <div className="caso-avance-barra" role="progressbar" aria-valuenow={completadas} aria-valuemin={0} aria-valuemax={6} aria-label="Fases completadas"><span style={{ width: `${Math.round((completadas / 6) * 100)}%` }}/></div>
                          <small className="caso-avance-meta">{completadas}/6 completadas · {haceCuanto(avance.actualizado)}</small>
                        </div>;
                      })()}

                      <div className="caso-footer-row">
                        <div className="caso-foco">
                          <FocoIconComponent size={15} className="caso-foco-icon" />
                          <span>Foco: {c.foco}</span>
                        </div>

                        <div className="caso-acciones">
                          {avancesCasos[claveCaso(c)] && (
                            <button type="button" className="btn-reiniciar-caso" onClick={() => setConfirmarReinicio(c)} title="Borrar el avance y volver a empezar desde la Fase 1">
                              <RotateCcw size={12}/> Reiniciar
                            </button>
                          )}
                          {puedeGestionarCaso(c) && (
                            <>
                              <button className="btn-editar-caso" onClick={() => setModalEditarCaso(c)} title="Editar caso"><Edit size={14} /></button>
                              <button className="btn-eliminar-caso" onClick={() => setModalEliminarCaso(c.id)} title="Eliminar caso"><Trash2 size={14} /></button>
                            </>
                          )}
                          {avancesCasos[claveCaso(c)] ? (
                            <button className="btn-simulacion btn-continuar" onClick={() => abrirSimulacion(c, { reanudar: true })} title="Retomar donde lo dejaste">
                              <Play size={13} />
                              <span>Continuar trabajo</span>
                            </button>
                          ) : (
                            <button className="btn-simulacion" onClick={() => abrirSimulacion(c)}>
                              <Play size={13} />
                              <span>Iniciar Simulación</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* CONTROLES DE PAGINACIÓN IDÉNTICOS A HISTORIAL */}
          {totalPaginas > 1 && (
            <div className="casos-pagination-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
              <button
                onClick={() => cambiarPagina(paginaValida - 1)}
                disabled={paginaValida <= 1}
                className="btn-pagination"
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color, #d1d5db)",
                  background: paginaValida <= 1 ? "var(--bg-input, #f3f4f6)" : "transparent",
                  color: paginaValida <= 1 ? "#9ca3af" : "var(--text-main, #333)",
                  cursor: paginaValida <= 1 ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  fontSize: "0.85rem",
                  transition: "all 0.2s"
                }}
              >
                Anterior
              </button>

              <span className="pagination-info" style={{ fontSize: "0.85rem", color: "var(--text-muted, #6b7280)", fontWeight: "bold" }}>
                Página {paginaValida} de {totalPaginas}
              </span>

              <button
                onClick={() => cambiarPagina(paginaValida + 1)}
                disabled={paginaValida >= totalPaginas}
                className="btn-pagination"
                style={{
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid var(--border-color, #d1d5db)",
                  background: paginaValida >= totalPaginas ? "var(--bg-input, #f3f4f6)" : "transparent",
                  color: paginaValida >= totalPaginas ? "#9ca3af" : "var(--text-main, #333)",
                  cursor: paginaValida >= totalPaginas ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  fontSize: "0.85rem",
                  transition: "all 0.2s"
                }}
              >
                Siguiente
              </button>
            </div>
          )}

        </div>

      </div>

      <ModalConfirmarEliminacion abierto={Boolean(confirmarReinicio)} titulo="Reiniciar simulación" detalle={confirmarReinicio?.titulo}
        mensaje="Se borrará todo tu avance en este caso y empezarás otra vez desde la Fase 1."
        perdidas={['Lluvia de ideas, árbol de problemas y diagnóstico externo (PESTEL, Porter, MPC, POAM)', 'Diagnóstico interno y matrices FODA, DAFO y Ansoff', 'La fase en la que te quedaste']}
        textoConfirmar="Reiniciar y empezar" onConfirmar={() => reiniciarSimulacion(confirmarReinicio)} onCerrar={() => setConfirmarReinicio(null)}/>

      {/* MODAL CREAR CASO (DOCENTE) */}
      {modalCrearCaso && (
        <ModalCrearCaso 
          categoriasDisponibles={categorias.filter(c => c !== 'Todos')}
          onAgregarCategoria={agregarCategoriaPersonalizada}
          onClose={() => setModalCrearCaso(false)} 
          onSuccess={() => {
            setModalCrearCaso(false);
            cargarCasosDesdeDB(); // Recargar la lista tras crear
          }} 
        />
      )}

      {/* MODAL EDITAR CASO (DOCENTE) */}
      {modalEditarCaso && (
        <ModalCrearCaso 
          casoAEditar={modalEditarCaso}
          categoriasDisponibles={categorias.filter(c => c !== 'Todos')}
          onAgregarCategoria={agregarCategoriaPersonalizada}
          onClose={() => setModalEditarCaso(null)} 
          onSuccess={() => {
            setModalEditarCaso(null);
            cargarCasosDesdeDB();
          }} 
        />
      )}

      {modalEliminarCaso && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', maxWidth: '400px', width: '100%', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertTriangle size={24} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>Eliminar Caso de Estudio</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              ¿Seguro que deseas eliminar este caso? Esta acción no se puede deshacer y borrará toda la información relacionada.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setModalEliminarCaso(null)} className="modal-standard-btn-cancel" style={{ flex: 1, padding: '10px' }}>
                Cancelar
              </button>
              <button onClick={confirmarEliminarCaso} className="modal-standard-btn-confirm" style={{ flex: 1, padding: '10px', backgroundColor: '#ef4444', borderColor: '#ef4444' }}>
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
