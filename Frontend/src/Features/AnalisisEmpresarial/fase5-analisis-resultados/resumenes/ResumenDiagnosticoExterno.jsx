import { useMemo, useRef } from 'react';
import PieNavegacion from '../../simulacion/PieNavegacion';
import { Compass, Globe, Radar, Swords, Target, TrendingDown, TrendingUp, Trophy } from 'lucide-react';
import { BotonPdf } from '../../compartido/BotonPdf';
import { Etiqueta, Seccion, SinDatos, Tabla } from './ComponentesResumen';
import { DivergentePoam, DonaPoam, PestelGrafico, PodioMpc, PorterDiagrama } from './GraficosResumenExterno';
import useExportarResumen from '../../compartido/pdf/useExportarResumen';
import { resumirExterno } from './calculosResumenes';
import '../../compartido/estilos/EstilosHerramientaBase.css';
import './Resumenes.css';
import '../../compartido/estilos/EstilosHerramientaTema.css';

const tonoNivel = nivel => { const n = String(nivel || '').toLowerCase(); return n.startsWith('alt') ? 'alto' : n.startsWith('baj') ? 'bajo' : 'medio'; };

/** Fase 5 · Reporte del diagnóstico externo (Fase 3): solo datos, sin interpretación. */
export default function ResumenDiagnosticoExterno({ casoActivo, datosPestel, datosPorter, datosMpc, factoresPoam, herramientasActivas, onIrAHerramienta }) {
  const ref = useRef(null);
  const activas = useMemo(() => (herramientasActivas?.length ? herramientasActivas : ['pestel', 'porter', 'mpc', 'poam']), [herramientasActivas]);
  const r = useMemo(() => resumirExterno({ datosPestel, datosPorter, datosMpc, factoresPoam, activas }), [datosPestel, datosPorter, datosMpc, factoresPoam, activas]);
  const { exportando, exportar } = useExportarResumen({ ref, caso: casoActivo, nombreBase: 'Reporte_Diagnostico_Externo', pie: 'Reporte del diagnóstico externo · Análisis Empresarial' });
  const ir = id => (onIrAHerramienta ? () => onIrAHerramienta(id) : undefined);
  const mostrar = id => activas.includes(id);
  const fecha = new Date().toLocaleDateString('es-BO');
  let numero = 0;
  const siguiente = () => { numero += 1; return String(numero); };
  const nombreDimension = id => r.poam.porDimension.find(d => d.id === id)?.nombre || id || '—';

  return <div className="hf-container r5" ref={ref}>
    <div className="hf-toolbar" data-pdf-block>
      <div className="hf-toolbar-badge"><Globe size={15}/><span>Fase 5 · Reporte del diagnóstico externo (Fase 3)</span></div>
      <BotonPdf exportando={exportando} onClick={exportar}/>
    </div>

    <section className="hf-card r5-case azul" data-pdf-block>
      <div className="r5-case-meta"><span className="r5-case-label"><Target size={13}/> Diagnóstico externo</span><span>{fecha}</span></div>
      <h2 className="r5-case-title">{casoActivo?.titulo || casoActivo?.nombre || 'Caso de estudio'}</h2>
    </section>


    {mostrar('pestel') && <Seccion numero={siguiente()} icono={Compass} titulo="Análisis PESTEL" subtitulo="Macroentorno: seis dimensiones del entorno general" onIr={ir('pestel')}>
      {r.pestel.conDatos
        ? <>
          <PestelGrafico dimensiones={r.pestel.dimensiones}/>
          <Tabla columnas={[['Dimensión', '24%'], ['Oport.', '10%', 'r5-col-num'], ['Amen.', '10%', 'r5-col-num'], ['Factores registrados']]}
          filas={r.pestel.dimensiones.map(d => [<span key="d" className="r5-dim"><b style={{ background: d.color }}>{d.letra}</b>{d.nombre}</span>, d.oportunidades, d.amenazas,
            d.factores.length ? <ul key="f" className="r5-lista">{d.factores.map((f, i) => <li key={i}><Etiqueta tono={f.tipo === 'Amenaza' ? 'amenaza' : 'oportunidad'}>{f.tipo === 'Amenaza' ? 'A' : 'O'}</Etiqueta>{f.texto}</li>)}</ul> : '—'])} vacio="Sin datos."/>
        </>
        : <SinDatos onIr={ir('pestel')}/>}
    </Seccion>}

    {mostrar('porter') && <Seccion numero={siguiente()} icono={Swords} titulo="5 Fuerzas de Porter" subtitulo="Presión de cada fuerza competitiva del sector" onIr={ir('porter')}>
      {r.porter.conDatos
        ? <>
          <PorterDiagrama fuerzas={r.porter.fuerzas}/>
          <Tabla columnas={[['Fuerza', '24%'], ['Presión', '12%'], ['Descripción'], ['Factores registrados', '32%']]}
          filas={r.porter.fuerzas.map(f => [<b key="f">{f.nombre}</b>, <Etiqueta key="n" tono={tonoNivel(f.nivel)}>{f.nivel}</Etiqueta>, f.descripcion || '—',
            f.factores.length ? <ul key="l" className="r5-lista">{f.factores.map((t, i) => <li key={i}>{t}</li>)}</ul> : '—'])} vacio="Sin datos."/>
        </>
        : <SinDatos onIr={ir('porter')}/>}
    </Seccion>}

    {mostrar('mpc') && <Seccion numero={siguiente()} icono={Trophy} titulo="Matriz de Perfil Competitivo" subtitulo="Total ponderado de cada empresa (escala 1 a 4)" onIr={ir('mpc')}>
      {r.mpc.conDatos
        ? <>
          <PodioMpc ranking={r.mpc.ranking}/>
          <Tabla columnas={[['Pos.', '9%', 'r5-col-num'], ['Empresa'], ['Total ponderado', '20%', 'r5-col-num']]}
          filas={r.mpc.ranking.map(item => [<span key="p" className="r5-num">{item.posicion || '—'}</span>, <span key="e"><b>{item.nombre}</b>{item.esPropia && <> <Etiqueta tono="cat">Nuestra empresa</Etiqueta></>}</span>, <b key="t">{item.totalPonderado.toFixed(2)}</b>])} vacio="Sin datos."/>
        </>
        : <SinDatos onIr={ir('mpc')}/>}
    </Seccion>}

    {mostrar('poam') && <Seccion numero={siguiente()} icono={Radar} titulo="Matriz POAM" subtitulo="Oportunidades y amenazas registradas por dimensión" onIr={ir('poam')}>
      {r.poam.conDatos ? <>
        <div className="r5-gfx-row">
          <DonaPoam oportunidades={r.poam.oportunidades.length} amenazas={r.poam.amenazas.length}/>
          <DivergentePoam porDimension={r.poam.porDimension}/>
        </div>
        <div className="r5-rep-two">
          <div><span className="hf-section-label r5-pos"><TrendingUp size={13}/> Oportunidades ({r.poam.oportunidades.length})</span>
            <Tabla columnas={[['Oportunidad'], ['Dimensión', '26%'], ['Impacto', '18%']]} filas={r.poam.oportunidades.map(f => [f.texto, nombreDimension(f.categoria), <Etiqueta key="i" tono={tonoNivel(f.impacto)}>{f.impacto}</Etiqueta>])} vacio="Sin oportunidades."/></div>
          <div><span className="hf-section-label r5-neg"><TrendingDown size={13}/> Amenazas ({r.poam.amenazas.length})</span>
            <Tabla columnas={[['Amenaza'], ['Dimensión', '26%'], ['Impacto', '18%']]} filas={r.poam.amenazas.map(f => [f.texto, nombreDimension(f.categoria), <Etiqueta key="i" tono={tonoNivel(f.impacto)}>{f.impacto}</Etiqueta>])} vacio="Sin amenazas."/></div>
        </div>
      </> : <SinDatos onIr={ir('poam')}/>}
    </Seccion>}

    <PieNavegacion/>
  </div>;
}
