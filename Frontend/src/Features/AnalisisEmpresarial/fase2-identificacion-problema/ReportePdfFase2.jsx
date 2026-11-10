import { forwardRef, useRef, useState, useEffect } from 'react';
import {
  Building2,
  Globe,
  Leaf,
  Layers,
  TreeDeciduous
} from 'lucide-react';
import './ReportePdfFase2.css';

const ReportePdfFase2 = forwardRef(({
  tipoReporte = 'ambos', // 'lluvia' | 'arbol' | 'ambos'
  caso,
  ideasLluvia = [],
  datosArbol = {}
}, ref) => {
  // Procesamiento de Lluvia de Ideas (Mostrar todos los creados)
  const ideasInternas = ideasLluvia.filter(i => (i.tipoAmbito || 'Interno') === 'Interno');
  const ideasExternas = ideasLluvia.filter(i => (i.tipoAmbito || 'Interno') !== 'Interno');

  // Extracción blindada del Problema Central (soporta objeto, string, o distintas propiedades del árbol o caso)
  const extraerProblemaCentral = () => {
    let tituloEncontrado = '';
    let descripcionEncontrada = '';
    let categoriaEncontrada = 'Estratégica';

    // 1. Verificar si datosArbol tiene problemaCentral explícito
    const raw = datosArbol?.problemaCentral;
    if (raw) {
      if (typeof raw === 'string' && raw.trim()) {
        tituloEncontrado = raw.trim();
      } else if (typeof raw === 'object') {
        tituloEncontrado = (raw.titulo || raw.texto || raw.enunciado || raw.nombre || '').trim();
        descripcionEncontrada = (raw.descripcion && raw.descripcion !== tituloEncontrado ? raw.descripcion : '').trim();
        categoriaEncontrada = raw.categoria || raw.area || 'Estratégica';
      }
    }

    // 2. Si no se encontró en problemaCentral, buscar en causas/efectos de tipo 'tronco'
    if (!tituloEncontrado) {
      const troncoCausa = (datosArbol?.causas || []).find(c => c.tipo === 'tronco');
      const troncoEfecto = (datosArbol?.efectos || []).find(e => e.tipo === 'tronco');
      const nodoTronco = troncoCausa || troncoEfecto || datosArbol?.tronco || datosArbol?.problema;
      if (nodoTronco) {
        if (typeof nodoTronco === 'string' && nodoTronco.trim()) {
          tituloEncontrado = nodoTronco.trim();
        } else if (typeof nodoTronco === 'object') {
          tituloEncontrado = (nodoTronco.titulo || nodoTronco.texto || nodoTronco.enunciado || '').trim();
          descripcionEncontrada = (nodoTronco.descripcion || '').trim();
          categoriaEncontrada = nodoTronco.categoria || 'Estratégica';
        }
      }
    }

    // 3. Si aún no hay título, recuperar del caso activo (foco, desafío o problemática)
    if (!tituloEncontrado && caso) {
      tituloEncontrado = (
        caso.foco ||
        caso.detalles?.desafioPrincipal ||
        caso.detalles?.problemaCentral ||
        caso.detalles?.problematica ||
        caso.desafioPrincipal ||
        caso.problemaCentral ||
        caso.problema ||
        caso.arbolProblemas?.problemaCentral?.titulo ||
        caso.arbolProblemas?.problemaCentral ||
        caso.descripcion ||
        ''
      ).trim();

      if (caso.foco && caso.descripcion && caso.descripcion !== caso.foco) {
        descripcionEncontrada = caso.descripcion.length > 180 ? `${caso.descripcion.substring(0, 180)}...` : caso.descripcion;
      }
      categoriaEncontrada = caso.categoria || 'Estratégica';
    }

    // 4. Si aún estuviera vacío por alguna razón, utilizar el título descriptivo de la organización
    if (!tituloEncontrado) {
      tituloEncontrado = caso?.titulo ? `Desafío Estratégico y Cuello de Botella Operativo en ${caso.titulo}` : 'Optimización y Alineamiento Estratégico Integral';
    }

    return {
      titulo: tituloEncontrado,
      descripcion: descripcionEncontrada,
      categoria: categoriaEncontrada || 'General'
    };
  };

  const problemaCentralInfo = extraerProblemaCentral();
  const causas = datosArbol?.causas || [];
  const efectos = datosArbol?.efectos || [];

  const esDirecto = (t) => {
    const s = String(t || '').trim().toLowerCase();
    return s === 'directa' || s === 'directo';
  };
  const esIndirecto = (t) => {
    const s = String(t || '').trim().toLowerCase();
    return s === 'indirecta' || s === 'indirecto';
  };

  const causasDirectas = causas.filter(c => esDirecto(c.tipo) || (!esIndirecto(c.tipo) && !c.tipo));
  const causasIndirectas = causas.filter(c => esIndirecto(c.tipo));

  const efectosDirectos = efectos.filter(e => esDirecto(e.tipo) || (!esIndirecto(e.tipo) && !e.tipo));
  const efectosIndirectos = efectos.filter(e => esIndirecto(e.tipo));

  // Refs para medición y acomodo dinámico del fondo SVG según los factores (idéntico al sistema)
  const treeContainerRef = useRef(null);
  const canopyRef = useRef(null);
  const trunkRef = useRef(null);
  const rootsRef = useRef(null);

  // Estimación inicial armónica según factores presentes
  const numEfectos = Math.max(efectosDirectos.length, efectosIndirectos.length, 1);
  const numCausas = Math.max(causasDirectas.length, causasIndirectas.length, 1);
  const scaleRef = 1200 / 820;
  const canopyBottomInit = Math.max((120 + numEfectos * 64) * scaleRef, 240);
  const trunkTopInit = canopyBottomInit + 25 * scaleRef;
  const trunkBottomInit = trunkTopInit + 105 * scaleRef;
  const groundYInit = trunkBottomInit + 25 * scaleRef;
  const rootsHeightInit = Math.max((120 + numCausas * 64) * scaleRef, 260);
  const totalHeightInit = groundYInit + rootsHeightInit + 40;

  const [svgDims, setSvgDims] = useState({
    width: 1200,
    height: Math.max(totalHeightInit, 920),
    canopyH: canopyBottomInit,
    trunkTop: trunkTopInit,
    trunkBottom: trunkBottomInit,
    groundY: groundYInit
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

      const scale = 1200 / (cRect.width || 820);
      const totalH = Math.max(cRect.height * scale, 900);

      const canopyBottom = canopyRect ? Math.max((canopyRect.bottom - cRect.top) * scale, 220) : canopyBottomInit;
      const trunkTop = trunkRect ? (trunkRect.top - cRect.top) * scale : canopyBottom + 25;
      const trunkBottom = trunkRect ? (trunkRect.bottom - cRect.top) * scale : trunkTop + 105;
      const groundY = rootsRect ? Math.max((rootsRect.top - cRect.top) * scale, trunkBottom + 20) : trunkBottom + 25;

      // Mismo resultado → mismo estado: si no, cada render crea un objeto nuevo y el efecto entra en un ciclo infinito.
      const siguiente = { width: 1200, height: Math.round(totalH), canopyH: Math.round(canopyBottom), trunkTop: Math.round(trunkTop), trunkBottom: Math.round(trunkBottom), groundY: Math.round(groundY) };
      setSvgDims(previo => (Object.keys(siguiente).every(clave => previo[clave] === siguiente[clave]) ? previo : siguiente));
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
  }, [causas, efectos, problemaCentralInfo.titulo, problemaCentralInfo.descripcion, canopyBottomInit, trunkBottomInit, trunkTopInit, groundYInit]);

  const fechaFormateada = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const esSoloLluvia = tipoReporte === 'lluvia';
  const esSoloArbol = tipoReporte === 'arbol';

  const tituloPrincipal = esSoloLluvia 
    ? 'DIAGNÓSTICO ESTRATÉGICO • PASO 2.1' 
    : esSoloArbol 
      ? 'DIAGNÓSTICO ESTRATÉGICO • PASO 2.2' 
      : 'DIAGNÓSTICO ESTRATÉGICO • FASE 2';

  const subtituloPrincipal = esSoloLluvia
    ? 'Taller de Lluvia de Ideas'
    : esSoloArbol
      ? 'Árbol de Problemas'
      : 'Lluvia de Ideas & Metodología de Árbol de Problemas';

  // Ficha y Metadatos con fallbacks robustos para evitar campos vacíos
  const nombreCaso = (caso?.titulo && caso.titulo.trim()) || 
                     (caso?.nombre && caso.nombre.trim()) || 
                     'Caso de Estudio';


  const sector = (caso?.sector && caso.sector.trim()) || 
                 (caso?.categoria && caso.categoria.trim()) || 
                 'Gastronomía & Retail';

  return (
    <div ref={ref} className="reporte-fase2-pdf-document">
      {/* 1. HEADER INSTITUCIONAL */}
      <header className="reporte-pdf-header">
        <div className="reporte-pdf-header-top">
          <div className="reporte-pdf-brand">
            <div className="reporte-pdf-logo-box">
              <span>SE</span>
            </div>
            <div className="reporte-pdf-title-block">
              <h1>{tituloPrincipal}</h1>
              <p>{subtituloPrincipal}</p>
            </div>
          </div>
          <div className="reporte-pdf-badge-tag">
            <span>Simulador Empresarial</span>
            <div style={{ color: '#ea580c', fontWeight: 800 }}>Reporte Académico Oficial</div>
          </div>
        </div>

        {/* Ficha de Metadatos del Caso con distribución limpia en 3 columnas */}
        <div className="reporte-pdf-meta-grid">
          <div className="reporte-pdf-meta-item">
            <span className="reporte-pdf-meta-label">Caso de Estudio</span>
            <span className="reporte-pdf-meta-value">{nombreCaso}</span>
          </div>

          <div className="reporte-pdf-meta-item">
            <span className="reporte-pdf-meta-label">Sector / Industria</span>
            <span className="reporte-pdf-meta-value">{sector}</span>
          </div>

          <div className="reporte-pdf-meta-item">
            <span className="reporte-pdf-meta-label">Fecha de Emisión</span>
            <span className="reporte-pdf-meta-value">{fechaFormateada}</span>
          </div>
        </div>
      </header>

      {/* 2. SECCIÓN: FACTORES ENCONTRADOS */}
      {!esSoloArbol && (
        <section className="reporte-pdf-section">
          {/* Banner de Título en color naranja para los factores encontrados */}
          <div className="reporte-pdf-factores-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="reporte-pdf-factores-titulo">
                FACTORES ENCONTRADOS
              </span>
            </div>
          </div>

          {/* Tablero en 2 Columnas de Factores Internos y Externos */}
          <div className="reporte-pdf-carriles-grid">
            {/* Factores Internos */}
            <div className="reporte-pdf-carril carril-int">
              <div className="reporte-pdf-carril-head">
                <div className="reporte-pdf-carril-title">
                  <Building2 size={16} color="#10b981" />
                  <span>Factores Internos</span>
                </div>
                <span className="reporte-pdf-carril-badge">
                  {ideasInternas.length} {ideasInternas.length === 1 ? 'factor' : 'factores'}
                </span>
              </div>

              <div className="reporte-pdf-cards-list">
                {ideasInternas.length === 0 ? (
                  <div className="reporte-pdf-empty-state">No se registraron factores internos.</div>
                ) : (
                  ideasInternas.map((idea, idx) => (
                    <div key={idea.id || idx} className="reporte-pdf-idea-card">
                      <div className="reporte-pdf-idea-top">
                        <span className="reporte-pdf-cat-badge">{idea.categoria || 'General'}</span>
                        <span className="reporte-pdf-idea-num">#{idx + 1}</span>
                      </div>
                      <p className="reporte-pdf-idea-text">{idea.texto}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Factores Externos */}
            <div className="reporte-pdf-carril carril-ext">
              <div className="reporte-pdf-carril-head">
                <div className="reporte-pdf-carril-title">
                  <Globe size={16} color="#3b82f6" />
                  <span>Factores Externos</span>
                </div>
                <span className="reporte-pdf-carril-badge">
                  {ideasExternas.length} {ideasExternas.length === 1 ? 'factor' : 'factores'}
                </span>
              </div>

              <div className="reporte-pdf-cards-list">
                {ideasExternas.length === 0 ? (
                  <div className="reporte-pdf-empty-state">No se registraron factores externos.</div>
                ) : (
                  ideasExternas.map((idea, idx) => (
                    <div key={idea.id || idx} className="reporte-pdf-idea-card">
                      <div className="reporte-pdf-idea-top">
                        <span className="reporte-pdf-cat-badge">{idea.categoria || 'Macroentorno'}</span>
                        <span className="reporte-pdf-idea-num">#{idx + 1}</span>
                      </div>
                      <p className="reporte-pdf-idea-text">{idea.texto}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. SECCIÓN 2: DIAGNÓSTICO MEDIANTE ÁRBOL DE PROBLEMAS (MARCO LÓGICO) */}
      {!esSoloLluvia && (
        <section className="reporte-pdf-section" style={{ marginTop: esSoloArbol ? '0' : '28px' }}>
          {/* Banner de Título para el Árbol de Problemas con los mismos estilos */}
          <div className="reporte-pdf-factores-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TreeDeciduous size={18} color="#ea580c" />
              <span className="reporte-pdf-factores-titulo">
                ÁRBOL DE PROBLEMAS
              </span>        
            </div>
          </div>

          <div className="reporte-pdf-tree-container" ref={treeContainerRef}>
            {/* FONDO ILUSTRADO ORGÁNICO DEL ÁRBOL DINÁMICO SEGÚN FACTORES (TAL CUAL EN EL SISTEMA) */}
            <div className="reporte-pdf-tree-svg-backdrop" aria-hidden="true">
              <svg
                viewBox={`0 0 1200 ${svgDims.height}`}
                preserveAspectRatio="none"
                className="reporte-pdf-tree-svg-canvas"
              >
                <defs>
                  <linearGradient id="pdfFoliageGradLight" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34d399" stopOpacity="0.65" />
                    <stop offset="30%" stopColor="#10b981" stopOpacity="0.55" />
                    <stop offset="70%" stopColor="#059669" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#047857" stopOpacity="0.75" />
                  </linearGradient>
                  <linearGradient id="pdfBarkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#78350f" stopOpacity="0.85" />
                    <stop offset="25%" stopColor="#92400e" stopOpacity="0.75" />
                    <stop offset="50%" stopColor="#d97706" stopOpacity="0.95" />
                    <stop offset="75%" stopColor="#92400e" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#78350f" stopOpacity="0.85" />
                  </linearGradient>
                  <linearGradient id="pdfRootsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#d97706" stopOpacity="0.90" />
                    <stop offset="40%" stopColor="#92400e" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#451a03" stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="pdfSoilStratumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
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
                  fill="url(#pdfSoilStratumGrad)"
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
                  fill="url(#pdfBarkGrad)"
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
                    <g stroke="url(#pdfRootsGrad)" fill="none" strokeLinecap="round">
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
                    <g fill="url(#pdfFoliageGradLight)" stroke="#059669" strokeWidth="2.5" strokeOpacity="0.4">
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

            {/* A. LA COPA (EFECTOS Y CONSECUENCIAS) */}
            <div className="reporte-pdf-tree-canopy" ref={canopyRef}>
              <div className="reporte-pdf-zone-header">
                <div className="reporte-pdf-zone-title">
                  <Leaf size={16} />
                  <span>Copa del Árbol · Efectos y Consecuencias ({efectos.length})</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#15803d', fontWeight: 700 }}>
                  Impacto Operativo y Estratégico
                </span>
              </div>

              <div className="reporte-pdf-tree-grid">
                {/* Efectos Directos */}
                <div className="reporte-pdf-branch-box">
                  <div className="reporte-pdf-branch-title">
                    <span>🍃 Efectos Directos</span>
                    <span style={{ fontSize: '0.66rem', color: '#64748b' }}>({efectosDirectos.length})</span>
                  </div>
                  {efectosDirectos.length === 0 ? (
                    <div className="reporte-pdf-empty-state">Sin efectos directos registrados.</div>
                  ) : (
                    efectosDirectos.map((efecto, i) => (
                      <div key={efecto.id || i} className="reporte-pdf-node-card">
                        <div className="reporte-pdf-node-top">
                          <span className="reporte-pdf-node-cat">{efecto.categoria || 'Impacto'}</span>
                        </div>
                        <p className="reporte-pdf-node-text">{efecto.titulo || efecto.texto || efecto.descripcion}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Efectos Indirectos */}
                <div className="reporte-pdf-branch-box">
                  <div className="reporte-pdf-branch-title">
                    <span>🌿 Efectos Indirectos</span>
                    <span style={{ fontSize: '0.66rem', color: '#64748b' }}>({efectosIndirectos.length})</span>
                  </div>
                  {efectosIndirectos.length === 0 ? (
                    <div className="reporte-pdf-empty-state">Sin efectos indirectos registrados.</div>
                  ) : (
                    efectosIndirectos.map((efecto, i) => (
                      <div key={efecto.id || i} className="reporte-pdf-node-card">
                        <div className="reporte-pdf-node-top">
                          <span className="reporte-pdf-node-cat">{efecto.categoria || 'Proyección'}</span>
                        </div>
                        <p className="reporte-pdf-node-text">{efecto.titulo || efecto.texto || efecto.descripcion}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* B. EL TRONCO (PROBLEMA CENTRAL) */}
            <div 
              ref={trunkRef}
              className="reporte-pdf-tree-trunk"
              style={{
                position: 'relative',
                zIndex: 2,
                maxWidth: '520px',
                margin: '0 auto',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <div className="reporte-pdf-branch-box" style={{ border: '1.5px solid #ea580c', background: '#ffffff', boxShadow: '0 2px 8px rgba(234, 88, 12, 0.08)' }}>
                <div className="reporte-pdf-branch-title" style={{ color: '#ea580c' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TreeDeciduous size={15} color="#ea580c" />
                    <span>🌳 Problema Central</span>
                  </div>
                </div>

                <div className="reporte-pdf-node-card" style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
                  <div className="reporte-pdf-node-top">
                    <span className="reporte-pdf-node-cat" style={{ background: '#ffedd5', color: '#9a3412', borderColor: '#fed7aa' }}>
                      {problemaCentralInfo.categoria || 'Estratégica'}
                    </span>
                  </div>
                  <p className="reporte-pdf-node-text">{problemaCentralInfo.titulo}</p>
                  {problemaCentralInfo.descripcion && (
                    <p className="reporte-pdf-node-text" style={{ marginTop: '4px', fontSize: '0.68rem', color: '#64748b', fontWeight: 500 }}>
                      {problemaCentralInfo.descripcion}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* C. LAS RAÍCES (CAUSAS Y ORIGEN) */}
            <div className="reporte-pdf-tree-roots" ref={rootsRef}>
              <div className="reporte-pdf-zone-header">
                <div className="reporte-pdf-roots-title">
                  <Layers size={16} />
                  <span>Raíces del Árbol · Causas y Factores Críticos ({causas.length})</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#c2410c', fontWeight: 700 }}>
                  Origen y Factores Generadores
                </span>
              </div>

              <div className="reporte-pdf-tree-grid">
                {/* Causas Directas */}
                <div className="reporte-pdf-roots-branch-box">
                  <div className="reporte-pdf-roots-branch-title">
                    <span>🌱 Causas Directas</span>
                    <span style={{ fontSize: '0.66rem', color: '#64748b' }}>({causasDirectas.length})</span>
                  </div>
                  {causasDirectas.length === 0 ? (
                    <div className="reporte-pdf-empty-state">Sin causas directas registradas.</div>
                  ) : (
                    causasDirectas.map((causa, i) => (
                      <div key={causa.id || i} className="reporte-pdf-node-card">
                        <div className="reporte-pdf-node-top">
                          <span className="reporte-pdf-node-cat">{causa.categoria || 'Diagnóstico'}</span>
                        </div>
                        <p className="reporte-pdf-node-text">{causa.titulo || causa.texto || causa.descripcion}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Causas Indirectas */}
                <div className="reporte-pdf-roots-branch-box">
                  <div className="reporte-pdf-roots-branch-title">
                    <span>🌾 Causas Indirectas (Raíz)</span>
                    <span style={{ fontSize: '0.66rem', color: '#64748b' }}>({causasIndirectas.length})</span>
                  </div>
                  {causasIndirectas.length === 0 ? (
                    <div className="reporte-pdf-empty-state">Sin causas indirectas registradas.</div>
                  ) : (
                    causasIndirectas.map((causa, i) => (
                      <div key={causa.id || i} className="reporte-pdf-node-card">
                        <div className="reporte-pdf-node-top">
                          <span className="reporte-pdf-node-cat">{causa.categoria || 'Diagnóstico'}</span>
                        </div>
                        <p className="reporte-pdf-node-text">{causa.titulo || causa.texto || causa.descripcion}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. FOOTER INSTITUCIONAL */}
      <footer className="reporte-pdf-footer">
        <span className="reporte-pdf-footer-brand">
          Simulador Empresarial • Plataforma de Aprendizaje y Toma de Decisiones Estratégicas
        </span>
        <span>{esSoloLluvia ? 'Taller de Lluvia de Ideas' : 'Metodología de Marco Lógico'}</span>
      </footer>
    </div>
  );
});

ReportePdfFase2.displayName = 'ReportePdfFase2';

export default ReportePdfFase2;
