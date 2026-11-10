import { useMemo, useRef } from 'react';
import PieNavegacion from '../../simulacion/PieNavegacion';
import { Award, BarChart3, Boxes, Building2, Radar, Route, Share2, ShieldCheck, Target, TrendingDown, TrendingUp, Workflow } from 'lucide-react';
import LogoRed from '../../fase4-diagnostico-interno/auditoria-redes/LogoRed';
import { BotonPdf } from '../../compartido/BotonPdf';
import { Etiqueta, Seccion, SinDatos, Tabla } from './ComponentesResumen';
import { BarrasHorizontales, BarrasPeriodos, CurvaCliente } from './GraficosResumenInterno';
import DiagramaCarriles from '../../fase4-diagnostico-interno/flujogramas/DiagramaCarriles';
import { BalanzaEfi, DesgloseAreasEfi } from '../../fase4-diagnostico-interno/matriz-efi/GraficosEfi';
import { MapaCalor360, RadarCompetencias } from '../../fase4-diagnostico-interno/evaluacion-360/GraficosEvaluacion360';
import ComparacionClientes from '../../fase4-diagnostico-interno/customer-journey/ComparacionClientes';
import IconoEmocion from '../../fase4-diagnostico-interno/customer-journey/IconoEmocion';
import useExportarResumen from '../../compartido/pdf/useExportarResumen';
import { resumirInterno } from './calculosResumenes';
import { ESCALA_RATING_EFI } from '../../fase4-diagnostico-interno/matriz-efi/calculosEfi';
import { obtenerEmocion } from '../../fase4-diagnostico-interno/customer-journey/calculosJourney';
import '../../compartido/estilos/EstilosHerramientaBase.css';
import '../../fase4-diagnostico-interno/matriz-efi/MatrizEFI.css';
import '../../fase4-diagnostico-interno/evaluacion-360/Evaluacion360.css';
import '../../fase4-diagnostico-interno/customer-journey/CustomerJourneyMap.css';
import '../../fase4-diagnostico-interno/flujogramas/Flujogramas.css';
import './Resumenes.css';
import '../../compartido/estilos/EstilosHerramientaTema.css';

const moneda = valor => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 0 }).format(valor || 0);
const numero = valor => new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 }).format(valor || 0);
const compacto = valor => new Intl.NumberFormat('es-BO', { notation: 'compact', maximumFractionDigits: 1 }).format(valor || 0);
const pct = valor => (valor === null || valor === undefined ? '—' : `${valor.toFixed(1)}%`);

/** Fase 5 · Reporte del diagnóstico interno (Fase 4): solo datos, sin interpretación. */
export default function ResumenDiagnosticoInterno({ casoActivo, datosInterno, datosEfi, onIrAHerramienta }) {
  const ref = useRef(null);
  const r = useMemo(() => resumirInterno({ datosInterno, datosEfi }), [datosInterno, datosEfi]);
  const { exportando, exportar } = useExportarResumen({ ref, caso: casoActivo, nombreBase: 'Reporte_Diagnostico_Interno', pie: 'Reporte del diagnóstico interno · Análisis Empresarial' });
  const ir = id => (onIrAHerramienta ? () => onIrAHerramienta(id) : undefined);
  const fecha = new Date().toLocaleDateString('es-BO');
  const factoresEfi = r.efi.conDatos ? r.efi.factores : [];
  const fortalezasEfi = factoresEfi.filter(f => f.tipo === 'Fortaleza');
  const debilidadesEfi = factoresEfi.filter(f => f.tipo !== 'Fortaleza');

  const filasFactores = lista => lista.map(f => [<b key="c">{f.codigo}</b>, f.titulo || '—', <Etiqueta key="a" tono="cat">{f.area || 'General'}</Etiqueta>, `${f.calificacion} · ${ESCALA_RATING_EFI[f.calificacion]?.labelCorto || ''}`, Number(f.peso || 0).toFixed(2), <b key="p">{(Number(f.peso || 0) * Number(f.calificacion || 0)).toFixed(2)}</b>]);
  const columnasFactores = [['Cód.', '8%'], ['Factor interno'], ['Área', '22%'], ['Calificación', '17%'], ['Peso', '9%', 'r5-col-num'], ['Pond.', '9%', 'r5-col-num']];

  return <div className="hf-container r5" ref={ref}>
    <div className="hf-toolbar" data-pdf-block>
      <div className="hf-toolbar-badge"><Building2 size={15}/><span>Fase 5 · Reporte del diagnóstico interno (Fase 4)</span></div>
      <BotonPdf exportando={exportando} onClick={exportar}/>
    </div>

    <section className="hf-card r5-case verde" data-pdf-block>
      <div className="r5-case-meta"><span className="r5-case-label"><Building2 size={13}/> Diagnóstico interno</span><span>{fecha}</span></div>
      <h2 className="r5-case-title">{casoActivo?.titulo || casoActivo?.nombre || 'Caso de estudio'}</h2>
    </section>


    <Seccion numero="1" icono={ShieldCheck} titulo="Matriz EFI" subtitulo="Factores internos con su calificación, peso y aporte ponderado" onIr={ir('efi')}>
      {r.efi.conDatos ? <>
        <div className="r5-gfx-row">
          <figure className="r5-gfx"><figcaption className="hf-section-label"><TrendingUp size={13}/> Aporte ponderado</figcaption><BalanzaEfi totales={r.efi.totales}/></figure>
          <figure className="r5-gfx"><figcaption className="hf-section-label"><BarChart3 size={13}/> Calificación media por área</figcaption><DesgloseAreasEfi areas={r.efi.areas}/></figure>
        </div>
        <span className="hf-section-label r5-pos"><TrendingUp size={13}/> Fortalezas ({fortalezasEfi.length})</span>
        <Tabla columnas={columnasFactores} filas={filasFactores(fortalezasEfi)} vacio="Sin fortalezas registradas."/>
        <span className="hf-section-label r5-neg"><TrendingDown size={13}/> Debilidades ({debilidadesEfi.length})</span>
        <Tabla columnas={columnasFactores} filas={filasFactores(debilidadesEfi)} vacio="Sin debilidades registradas."/>
      </> : <SinDatos onIr={ir('efi')}/>}
    </Seccion>

    <Seccion numero="2" icono={BarChart3} titulo="Análisis vertical y horizontal" subtitulo="Cifras financieras de los dos periodos" onIr={ir('interno-vertical-horizontal')}>
      {r.finanzas.conDatos ? (() => {
        const { anterior, actual } = r.finanzas.totales;
        const { formato, periodos } = r.finanzas;
        const conceptos = [
          ['Activos totales', anterior.balance.activos, actual.balance.activos], ['Pasivos totales', anterior.balance.pasivos, actual.balance.pasivos], ['Patrimonio', anterior.balance.patrimonio, actual.balance.patrimonio],
          ['Ingresos netos', anterior.resultados.ingresos, actual.resultados.ingresos], ['Utilidad bruta', anterior.resultados.utilidadBruta, actual.resultados.utilidadBruta], ['Utilidad neta', anterior.resultados.utilidadNeta, actual.resultados.utilidadNeta]
        ];
        return <>
          <BarrasPeriodos items={[conceptos[0], conceptos[3], conceptos[5]].map(([nombre, a, b]) => ({ nombre, anterior: a, actual: b }))} formato={formato} periodos={periodos}/>
          <Tabla columnas={[['Concepto'], [periodos.anterior || 'Periodo base', '22%', 'r5-col-num'], [periodos.actual || 'Periodo actual', '22%', 'r5-col-num']]}
            filas={conceptos.map(([nombre, a, b]) => [<b key="n">{nombre}</b>, formato.moneda(a), formato.moneda(b)])} vacio="Sin datos."/>
          <span className="hf-section-label">Indicadores financieros</span>
          <Tabla columnas={[['Indicador'], [periodos.anterior || 'Periodo base', '22%', 'r5-col-num'], [periodos.actual || 'Periodo actual', '22%', 'r5-col-num']]}
            filas={r.finanzas.indicadores.map(ind => [<b key="n">{ind.nombre}</b>, formato.indicador(ind, ind.anterior), formato.indicador(ind, ind.actual)])} vacio="Sin indicadores."/>
        </>;
      })() : <SinDatos onIr={ir('interno-vertical-horizontal')}/>}
    </Seccion>

    <Seccion numero="3" icono={Route} titulo="Customer Journey Map" subtitulo="Recorrido y emoción del cliente en cada etapa" onIr={ir('customer-journey')}>
      {r.journey.conDatos ? r.journey.clientes.map(({ cliente }) => <div key={cliente.id} className="r5-cliente" style={{ '--r5-cliente': cliente.color }}>
        <h4><i/>{cliente.persona.nombre || 'Cliente sin nombre'}{cliente.persona.perfil && <small>{cliente.persona.perfil}</small>}</h4>
        <CurvaCliente cliente={cliente}/>
        <Tabla columnas={[['N.º', '6%', 'r5-col-num'], ['Etapa', '16%'], ['Emoción', '16%'], ['Fricción'], ['Oportunidad de mejora']]}
          filas={cliente.etapas.map((e, i) => [<span key="n" className="r5-num">{i + 1}</span>, <b key="e">{e.nombre || `Etapa ${i + 1}`}</b>,
            e.emocion ? <span key="m" className="r5-emo"><IconoEmocion valor={e.emocion} size={22}/>{obtenerEmocion(e.emocion).corto}</span> : '—', e.dolor || '—', e.oportunidad || '—'])} vacio="Sin etapas."/>
      </div>) : <SinDatos onIr={ir('customer-journey')}/>}
      {r.journey.conDatos && r.journey.clientes.length > 1 && <ComparacionClientes comparacion={r.journey.clientes} soloDatos/>}
    </Seccion>

    <Seccion numero="4" icono={Workflow} titulo="Flujograma" subtitulo={r.flujo.conDatos ? `Proceso: ${r.flujo.proceso}` : 'Pasos del proceso clave'} onIr={ir('flujogramas')}>
      {r.flujo.conDatos ? <>
        <figure className="r5-gfx r5-flujo" aria-label="Diagrama del flujograma">
          <div className="fl-legend"><span><i className="terminal"/>Inicio / fin</span><span><i className="proceso"/>Actividad</span><span><i className="decision"/>Decisión</span></div>
          <div className="fl-scroll"><DiagramaCarriles pasos={r.flujo.pasos}/></div>
        </figure>
        <Tabla columnas={[['N.º', '6%', 'r5-col-num'], ['Paso'], ['Tipo', '14%'], ['Responsable', '20%'], ['Tiempo', '11%', 'r5-col-num'], ['Crítico', '9%', 'r5-col-num']]}
          filas={r.flujo.pasos.map(p => [<span key="n" className="r5-num">{p.orden}</span>, <b key="a">{p.actividad || '—'}</b>, <Etiqueta key="t" tono="cat">{p.tipo}</Etiqueta>, p.responsable || '—', p.tiempo ? `${p.tiempo} min` : '—', p.critico ? <Etiqueta key="c" tono="alto">Sí</Etiqueta> : '—'])} vacio="Sin pasos."/>
      </> : <SinDatos onIr={ir('flujogramas')}/>}
    </Seccion>

    <Seccion numero="5" icono={Share2} titulo="Auditoría de redes sociales" subtitulo="Métricas de cada canal" onIr={ir('auditoria-redes')}>
      {r.redes.conDatos ? <>
        <BarrasHorizontales titulo="Seguidores por canal" items={r.redes.canales.map(c => ({ id: c.id, nombre: c.red || 'Canal', valor: Number(c.seguidores) || 0, etiqueta: compacto(Number(c.seguidores) || 0), icono: <LogoRed marca={c.marca} tamano={22}/>, color: c.marca.color === '#000000' ? '#475569' : c.marca.color }))}/>
        <Tabla columnas={[['Canal', '18%'], ['Seguid.', '10%', 'r5-col-num'], ['Alcance', '10%', 'r5-col-num'], ['Interac.', '10%', 'r5-col-num'], ['Clics', '9%', 'r5-col-num'], ['Conv.', '9%', 'r5-col-num'], ['Interacción', '11%', 'r5-col-num'], ['CTR', '8%', 'r5-col-num'], ['Conversión', '11%', 'r5-col-num']]}
          filas={r.redes.canales.map(c => [<span key="c" className="r5-dim"><LogoRed marca={c.marca} tamano={24}/>{c.red || '—'}</span>, numero(Number(c.seguidores) || 0), numero(Number(c.alcance) || 0), numero(Number(c.interacciones) || 0), numero(Number(c.clics) || 0), numero(Number(c.conversiones) || 0), pct(c.interaccion), pct(c.ctr), pct(c.conversion)])} vacio="Sin canales."/>
      </> : <SinDatos onIr={ir('auditoria-redes')}/>}
    </Seccion>

    <Seccion numero="6" icono={Radar} titulo="Evaluación 360°" subtitulo="Calificación promedio de cada persona por competencia (escala 1 a 5)" onIr={ir('evaluacion-360')}>
      {r.equipo.conDatos ? <>
        <div className="r5-radares">
          {r.equipo.personas.map(p => <div key={p.nombre} className="ev-radar-card r5-radar-card">
            <strong className="r5-radar-nombre">{p.nombre}</strong>
            <RadarCompetencias competencias={p.competencias}/>
            {p.fortaleza && <p className="ev-highlight ok"><Award size={13}/> Mayor fortaleza: <b>{p.fortaleza.competencia}</b> ({p.fortaleza.general.toFixed(1)})</p>}
            {p.mejora && <p className="ev-highlight warn"><Target size={13}/> Menor puntaje: <b>{p.mejora.competencia}</b> ({p.mejora.general.toFixed(1)})</p>}
          </div>)}
        </div>
        <MapaCalor360 mapa={r.equipo.mapa}/>
      </> : <SinDatos onIr={ir('evaluacion-360')}/>}
    </Seccion>

    <Seccion numero="7" icono={Boxes} titulo="Inventarios y almacenes" subtitulo="Existencias y valor de cada producto" onIr={ir('inventarios')}>
      {r.inventario.conDatos ? <>
        <BarrasHorizontales titulo="Valor del inventario por producto" items={[...r.inventario.productos].filter(p => p.valor > 0).sort((a, b) => b.valor - a.valor).slice(0, 10).map(p => ({ id: p.id, nombre: p.producto || p.sku || 'Producto', valor: p.valor, etiqueta: moneda(p.valor) }))}/>
        <Tabla columnas={[['SKU', '9%'], ['Producto'], ['Almacén', '15%'], ['Exist.', '9%', 'r5-col-num'], ['Mín.', '8%', 'r5-col-num'], ['Máx.', '8%', 'r5-col-num'], ['Costo', '11%', 'r5-col-num'], ['Valor', '13%', 'r5-col-num']]}
          filas={r.inventario.productos.map(p => [p.sku || '—', <b key="p">{p.producto || '—'}</b>, p.almacen || '—', numero(p.existenciaN), numero(p.minimoN), p.maximoN ? numero(p.maximoN) : '—', moneda(p.costoN), <b key="v">{moneda(p.valor)}</b>])} vacio="Sin productos."/>
      </> : <SinDatos onIr={ir('inventarios')}/>}
    </Seccion>

    <PieNavegacion/>
  </div>;
}
