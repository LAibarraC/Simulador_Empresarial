import { useMemo, useRef } from 'react';
import PieNavegacion from '../../simulacion/PieNavegacion';
import { ClipboardList, CloudLightning, Target, TreeDeciduous } from 'lucide-react';
import { BotonPdf } from '../../compartido/BotonPdf';
import ArbolReporte from '../../fase2-identificacion-problema/arbol-problemas/ArbolReporte';
import { Etiqueta, Seccion, Tabla } from './ComponentesResumen';
import { BarrasHorizontales, Dona } from './GraficosResumenInterno';
import useExportarResumen from '../../compartido/pdf/useExportarResumen';
import { resumirProblema } from './calculosResumenes';
import '../../compartido/estilos/EstilosHerramientaBase.css';
import './Resumenes.css';
import '../../compartido/estilos/EstilosHerramientaTema.css';

/** Cuenta los registros de una lista por su categoría (para las barras). */
function porCategoria(lista, color) {
  const cuenta = {};
  lista.forEach(item => { const nombre = item.categoria || 'General'; cuenta[nombre] = (cuenta[nombre] || 0) + 1; });
  return Object.entries(cuenta).sort((a, b) => b[1] - a[1]).map(([nombre, total]) => ({ id: nombre, nombre, valor: total, etiqueta: String(total), color }));
}

/** Fase 5 · Reporte de la Fase 2: identificación del problema (solo datos, sin interpretación). */
export default function ResumenIdentificacionProblema({ casoActivo, ideasLluvia, datosArbol, onIrAHerramienta }) {
  const ref = useRef(null);
  const r = useMemo(() => resumirProblema({ ideasLluvia, datosArbol }), [ideasLluvia, datosArbol]);
  const { exportando, exportar } = useExportarResumen({ ref, caso: casoActivo, nombreBase: 'Reporte_Identificacion_Problema', pie: 'Reporte de la identificación del problema · Análisis Empresarial' });
  const ir = id => (onIrAHerramienta ? () => onIrAHerramienta(id) : undefined);
  const fecha = new Date().toLocaleDateString('es-BO');

  return <div className="hf-container r5" ref={ref}>
    <div className="hf-toolbar" data-pdf-block>
      <div className="hf-toolbar-badge"><Target size={15}/><span>Fase 5 · Reporte de la identificación del problema (Fase 2)</span></div>
      <BotonPdf exportando={exportando} onClick={exportar}/>
    </div>

    <section className="hf-card r5-case" data-pdf-block>
      <div className="r5-case-meta"><span className="r5-case-label"><Target size={13}/> Problema central</span><span>{casoActivo?.titulo || casoActivo?.nombre || 'Caso de estudio'} · {fecha}</span></div>
      <h2 className={`r5-case-title${r.arbol.problema.titulo ? '' : ' vacio'}`}>{r.arbol.problema.titulo || 'Problema central sin formular: completa el Árbol de problemas'}</h2>
      {r.arbol.problema.categoria && <span className="hf-pill accent r5-case-cat">{r.arbol.problema.categoria}</span>}
    </section>


    <Seccion numero="1" icono={ClipboardList} titulo="Datos registrados" subtitulo="Lo que se registró en la Fase 2">
      <Tabla columnas={[['Dato', '30%', 'r5-col-dato'], ['Valor']]} vacio="Sin datos."
        filas={[
          ['Problema central', r.arbol.problema.titulo || 'Sin formular'],
          ['Categoría del problema', r.arbol.problema.categoria || '—'],
          ['Hechos identificados', `${r.ideas.length} (${r.seleccionadas.length} seleccionados)`],
          ['Hechos internos · externos', `${r.internas.length} · ${r.externas.length}`],
          ['Causas', `${r.causas.length} (${r.arbol.causasDirectas.length} directas · ${r.arbol.causasIndirectas.length} indirectas)`],
          ['Efectos', `${r.efectos.length} (${r.arbol.efectosDirectos.length} directos · ${r.arbol.efectosIndirectos.length} indirectos)`]
        ].map(([dato, valor]) => [<b key="d">{dato}</b>, valor])}/>
    </Seccion>

    <Seccion numero="2" icono={CloudLightning} titulo="Lluvia de ideas: hechos registrados" subtitulo="Hechos clave con su ámbito y categoría" onIr={ir('lluvia')}>
      {r.conDatos.lluvia ? <>
        <div className="r5-gfx-row">
          <Dona partes={[{ nombre: 'Internos', valor: r.internas.length, color: '#ea580c' }, { nombre: 'Externos', valor: r.externas.length, color: '#2563eb' }]} centro="hechos"/>
          <BarrasHorizontales titulo="Hechos por categoría" items={r.categorias.slice(0, 8).map(c => ({ id: c.nombre, nombre: c.nombre, valor: c.total, etiqueta: String(c.total) }))}/>
        </div>
        <Tabla columnas={[['N.º', '7%', 'r5-col-num'], ['Hecho'], ['Ámbito', '14%'], ['Categoría', '20%']]}
          filas={r.base.map((idea, i) => {
            const ambito = String(idea.tipoAmbito || idea.ambito || '');
            const interno = ambito.toLowerCase().startsWith('intern');
            return [<span key="n" className="r5-num">{i + 1}</span>, idea.texto, ambito ? <Etiqueta key="a" tono={interno ? 'interno' : 'externo'}>{ambito}</Etiqueta> : '—', <Etiqueta key="c" tono="cat">{idea.categoria || 'General'}</Etiqueta>];
          })} vacio="Sin hechos."/>
      </> : <p className="hf-muted r5-rep-vacio">Aún no hay hechos en la Lluvia de ideas. <button type="button" className="hf-btn-outline" onClick={ir('lluvia')} data-html2canvas-ignore>Completar ahora</button></p>}
    </Seccion>

    <Seccion numero="3" icono={TreeDeciduous} titulo="Árbol de problemas" subtitulo="Efectos en la copa, problema central en el tronco y causas en las raíces" onIr={ir('arbol')}>
      <ArbolReporte arbol={r.arbol}/>
      <div className="r5-gfx-row r5-gfx-igual">
        <BarrasHorizontales titulo="Causas por categoría" items={porCategoria(r.causas, '#d97706')}/>
        <BarrasHorizontales titulo="Efectos por categoría" items={porCategoria(r.efectos, '#dc2626')}/>
      </div>
      <div className="r5-rep-two">
        <div><span className="hf-section-label">Causas ({r.causas.length})</span>
          <Tabla columnas={[['Causa'], ['Tipo', '24%'], ['Categoría', '26%']]} filas={r.causas.map(c => [c.titulo, <Etiqueta key="t" tono={c.tipo === 'indirecta' ? 'indirecto' : 'directo'}>{c.tipo === 'indirecta' ? 'Indirecta' : 'Directa'}</Etiqueta>, <Etiqueta key="c" tono="cat">{c.categoria || 'General'}</Etiqueta>])} vacio="Sin causas registradas."/></div>
        <div><span className="hf-section-label">Efectos ({r.efectos.length})</span>
          <Tabla columnas={[['Efecto'], ['Tipo', '24%'], ['Categoría', '26%']]} filas={r.efectos.map(e => [e.titulo, <Etiqueta key="t" tono={e.tipo === 'indirecto' ? 'indirecto' : 'directo'}>{e.tipo === 'indirecto' ? 'Indirecto' : 'Directo'}</Etiqueta>, <Etiqueta key="c" tono="cat">{e.categoria || 'General'}</Etiqueta>])} vacio="Sin efectos registrados."/></div>
      </div>
    </Seccion>

    <PieNavegacion/>
  </div>;
}
