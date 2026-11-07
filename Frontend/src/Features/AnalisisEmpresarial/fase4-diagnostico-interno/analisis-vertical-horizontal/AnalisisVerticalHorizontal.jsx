import { useMemo, useRef, useState } from 'react';
import PieNavegacion from '../../simulacion/PieNavegacion';
import { flushSync } from 'react-dom';
import { BarChart3, CheckCircle2, FileDown, Loader2, TrendingUp } from 'lucide-react';
import { alerta } from '../../../../utils/Notificaciones';
import ParametrosAnalisis from './ParametrosAnalisis';
import ResumenKpisFinancieros from './ResumenKpisFinancieros';
import TablaEstadosFinancieros from './TablaEstadosFinancieros';
import IndicadoresFinancieros from './IndicadoresFinancieros';
import ConclusionFinanciera from './ConclusionFinanciera';
import DocumentosFinancieros from './DocumentosFinancieros';
import ReportePdfFinanciero from './ReportePdfFinanciero';
import SelectorEstadoFinanciero from './SelectorEstadoFinanciero';
import DetalleAnalisisFinanciero from './DetalleAnalisisFinanciero';
import useDatosFinancieros from './useDatosFinancieros';
import { exportarReportePdf } from './exportarPdfFinanciero';
import { cargarImagenesAnexo } from '../../compartido/documentos/archivosRespaldo';
import {
  ESTADOS, analizarEstado, calcularIndicadores, calcularTotales, crearFormato, generarLecturaEstructura, obtenerEstado, tieneSaldos, validarCuadre
} from './calculosFinancieros';
import './AnalisisVerticalHorizontal.css';
import '../../compartido/estilos/EstilosHerramientaTema.css';

const SECCIONES = [
  { id: 'datos', numero: 1, nombre: 'Captura de datos', ayuda: 'Balance y resultados' },
  { id: 'analisis', numero: 2, nombre: 'Vertical y horizontal', ayuda: 'Estructura y evolución' },
  { id: 'indicadores', numero: 3, nombre: 'Indicadores', ayuda: 'Ratios con semáforo' },
  { id: 'diagnostico', numero: 4, nombre: 'Diagnóstico', ayuda: 'Conclusión y documentos' }
];

// Espera breve para que React pinte el reporte (sin requestAnimationFrame, que se pausa en pestañas en segundo plano).
const esperarPintado = () => new Promise(resolve => setTimeout(resolve, 120));

export default function AnalisisVerticalHorizontal({ casoActivo, datos = {}, setDatos }) {
  const reporteRef = useRef(null);
  const [exportando, setExportando] = useState(false);
  const [imagenesPdf, setImagenesPdf] = useState([]);
  const [estadoActivo, setEstadoActivo] = useState('balance');
  const [seccion, setSeccion] = useState('datos');
  const { contenido, filas, guardar, ...acciones } = useDatosFinancieros(datos, setDatos);
  const { moneda, umbral, hallazgos } = contenido;
  const periodos = useMemo(() => ({ anterior: contenido.periodoAnterior, actual: contenido.periodoActual }), [contenido.periodoAnterior, contenido.periodoActual]);

  const formato = useMemo(() => crearFormato(moneda), [moneda]);
  const totales = useMemo(() => calcularTotales(filas), [filas]);
  const indicadores = useMemo(() => calcularIndicadores(totales), [totales]);
  const analisis = useMemo(() => ESTADOS.map(estado => ({ estado, bloques: analizarEstado(filas, estado.id, totales, umbral) })), [filas, totales, umbral]);
  const estado = obtenerEstado(estadoActivo);
  const bloquesActivos = analisis.find(item => item.estado.id === estado.id).bloques;
  const lecturaEstructura = useMemo(() => generarLecturaEstructura(estado, bloquesActivos, formato, periodos), [estado, bloquesActivos, formato, periodos]);
  const conBalance = tieneSaldos(filas, 'balance');
  const conResultados = tieneSaldos(filas, 'resultados');
  const completado = {
    datos: conBalance && conResultados && validarCuadre(totales.actual.balance).cuadra,
    analisis: conBalance || conResultados,
    indicadores: conBalance && conResultados,
    diagnostico: hallazgos.trim().length > 0
  };
  const indice = SECCIONES.findIndex(item => item.id === seccion);
  const previa = SECCIONES[indice - 1];
  const proxima = SECCIONES[indice + 1];

  const exportarPdf = async () => {
    if (exportando || !reporteRef.current) return;
    setExportando(true);
    try {
      const imagenes = await cargarImagenesAnexo(contenido.documentos);
      flushSync(() => setImagenesPdf(imagenes));
      await esperarPintado();
      await exportarReportePdf(reporteRef.current, casoActivo?.titulo || casoActivo?.nombre || 'Caso');
      alerta.exito('PDF descargado', 'Se exportó el análisis completo: estados, gráficos, indicadores, diagnóstico y documentación.');
    } catch (error) {
      console.error('Error al exportar el análisis vertical y horizontal:', error);
      alerta.error('Error al exportar', 'No se pudo generar el documento PDF.');
    } finally {
      setImagenesPdf([]);
      setExportando(false);
    }
  };

  return <div className="avh-container">
    <div className="avh-toolbar">
      <div className="avh-toolbar-badge"><BarChart3 size={15}/><span>Análisis vertical y horizontal · Diagnóstico financiero</span></div>
      <button type="button" className="avh-btn-pdf" onClick={exportarPdf} disabled={exportando}>
        {exportando ? <Loader2 size={14} className="avh-spin"/> : <FileDown size={14}/>}<span>{exportando ? 'Exportando PDF…' : 'Exportar a PDF'}</span>
      </button>
    </div>
    <section className="avh-card avh-params-card" aria-label="Parámetros del análisis">
      <p className="avh-card-desc">Registra dos periodos y obtén al instante la estructura, la evolución, los indicadores y una lectura guiada del caso.</p>
      <ParametrosAnalisis contenido={contenido} onCambio={guardar}/>
    </section>

    <ResumenKpisFinancieros totales={totales} indicadores={indicadores} formato={formato}/>

    <nav className="avh-steps" aria-label="Pasos del análisis">
      {SECCIONES.map(item => <button type="button" key={item.id}
        className={`avh-btn-step${seccion === item.id ? ' active' : ''}${completado[item.id] ? ' done' : ''}`}
        aria-current={seccion === item.id ? 'step' : undefined} onClick={() => setSeccion(item.id)}>
        <span className="avh-step-num">{completado[item.id] && seccion !== item.id ? <CheckCircle2 size={14}/> : item.numero}</span>
        <span className="avh-step-text"><strong>{item.nombre}</strong><small>{item.ayuda}</small></span>
      </button>)}
    </nav>

    {seccion === 'datos' && <TablaEstadosFinancieros estadoActivo={estado.id} onEstadoChange={setEstadoActivo} filas={filas} bloques={bloquesActivos} totales={totales} formato={formato} periodos={periodos} umbral={umbral} acciones={acciones}/>}

    {seccion === 'analisis' && <section className="avh-card" aria-label="Gráficos de análisis vertical y horizontal">
      <div className="avh-card-head">
        <h3 className="avh-card-title"><TrendingUp size={16}/> Estructura y evolución · {estado.nombre}</h3>
        <SelectorEstadoFinanciero estadoActivo={estado.id} onCambio={setEstadoActivo} filas={filas}/>
      </div>
      <p className="avh-card-desc">Elige el estado y el tipo de análisis. <b>Vertical</b>: cuánto pesa cada cuenta. <b>Horizontal</b>: cuánto cambió frente al periodo base.</p>
      {tieneSaldos(filas, estado.id)
        ? <DetalleAnalisisFinanciero estado={estado} bloques={bloquesActivos} totales={totales} periodos={periodos} formato={formato} umbral={umbral} lectura={lecturaEstructura}/>
        : <div className="avh-empty"><TrendingUp size={22}/><p>Aún no hay saldos en {estado.nombre.toLocaleLowerCase('es')}. Captúralos para ver los gráficos.</p><div><button type="button" className="avh-btn-primary" onClick={() => setSeccion('datos')}>Ir a captura de datos</button></div></div>}
    </section>}

    {seccion === 'indicadores' && <IndicadoresFinancieros indicadores={indicadores} periodos={periodos} formato={formato}/>}

    {seccion === 'diagnostico' && <>
      <div className="avh-diag-grid">
        <ConclusionFinanciera notas={hallazgos} onNotasChange={valor => guardar({ hallazgos: valor })}/>
        <DocumentosFinancieros documentos={contenido.documentos} acciones={acciones}/>
      </div>
    </>}

    <PieNavegacion
      anterior={previa ? { texto: `Volver a ${previa.nombre}`, onClick: () => setSeccion(previa.id) } : undefined}
      siguiente={proxima ? { texto: `Continuar a ${proxima.nombre}`, onClick: () => setSeccion(proxima.id) } : undefined}
      centro={<span className="avh-footer-hint">Paso {indice + 1} de {SECCIONES.length} · Los cambios se guardan automáticamente</span>}/>

    <ReportePdfFinanciero ref={reporteRef} caso={casoActivo} contenido={contenido} periodos={periodos} formato={formato} totales={totales} analisis={analisis} indicadores={indicadores} imagenes={imagenesPdf}/>
  </div>;
}
