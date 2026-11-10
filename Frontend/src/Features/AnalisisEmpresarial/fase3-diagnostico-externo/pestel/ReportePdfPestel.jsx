import { forwardRef } from 'react';
import { Globe, CheckCircle2 } from 'lucide-react';
import { DIMENSIONES_PESTEL, calcularMetricasPestel } from './datosPestel';
import '../../fase2-identificacion-problema/ReportePdfFase2.css';

const ReportePdfPestel = forwardRef(({
  caso,
  datosPestel = {}
}, ref) => {
  const metricas = calcularMetricasPestel(datosPestel);
  const estadoDimensiones = datosPestel?.dimensiones || {};

  // Metadatos del Caso
  const nombreCaso = (caso?.titulo && caso.titulo.trim()) || 
                     (caso?.nombre && caso.nombre.trim()) || 
                     'Caso de Estudio';

  const sector = (caso?.sector && caso.sector.trim()) || 
                 (caso?.categoria && caso.categoria.trim()) || 
                 'Empresarial / General';

  const fechaFormateada = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div ref={ref} className="reporte-fase2-pdf-document">
      {/* 1. HEADER INSTITUCIONAL (IDÉNTICO A ÁRBOL DE PROBLEMAS) */}
      <header className="reporte-pdf-header">
        <div className="reporte-pdf-header-top">
          <div className="reporte-pdf-brand">
            <div className="reporte-pdf-logo-box">
              <span>SE</span>
            </div>
            <div className="reporte-pdf-title-block">
              <h1>DIAGNÓSTICO ESTRATÉGICO • FASE 3</h1>
              <p>ANÁLISIS DEL MACROENTORNO (PESTEL)</p>
            </div>
          </div>
          <div className="reporte-pdf-badge-tag">
            <span>Simulador Empresarial</span>
            <div style={{ color: '#ea580c', fontWeight: 800 }}>Reporte Académico Oficial</div>
          </div>
        </div>

        {/* Ficha de Metadatos del Caso en 3 columnas */}
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

      {/* 2. BANNER DE RESUMEN EJECUTIVO (PESTEL) */}
      <section className="reporte-pdf-section">
        <div className="reporte-pdf-factores-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color="#ea580c" />
            <span className="reporte-pdf-factores-titulo">
              EVALUACIÓN DE LAS 6 DIMENSIONES PESTEL
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.70rem', fontWeight: 750, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
              {metricas.oportunidades} Oportunidades
            </span>
            <span style={{ fontSize: '0.70rem', fontWeight: 750, color: '#dc2626', background: '#fef2f2', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fecaca' }}>
              {metricas.amenazas} Amenazas
            </span>
            <span style={{ fontSize: '0.70rem', fontWeight: 750, color: '#ea580c', background: '#fff7ed', padding: '2px 8px', borderRadius: '4px', border: '1px solid #ffedd5' }}>
              {metricas.totalFactores} Factores Totales
            </span>
          </div>
        </div>

        {/* CUADRÍCULA DE 2 COLUMNAS CON LAS 6 DIMENSIONES PESTEL */}
        <div className="reporte-pdf-pestel-grid">
          {DIMENSIONES_PESTEL.map((dim) => {
            const dimData = estadoDimensiones[dim.id] || {};
            const factores = dimData.factoresManuales || [];
            const listaCriteriosEvaluados = (dim.criterios || []).filter(c => Boolean(dimData.criteriosActivos?.[c.id]));
            const criteriosActivos = listaCriteriosEvaluados.length;
            const IconoDim = dim.icono || Globe;

            return (
              <div key={dim.id} className="reporte-pdf-pestel-card">
                {/* PILAR IZQUIERDO CON LETRA GIGANTE */}
                <div className="reporte-pdf-pillar">
                  <span className="reporte-pdf-pillar-letter">{dim.letra}</span>
                  <div style={{ color: '#ea580c', opacity: 0.9 }}>
                    <IconoDim size={14} />
                  </div>
                  <span className="reporte-pdf-pillar-name">{dim.tituloCorto}</span>
                </div>

                {/* CONTENIDO DE LA DIMENSIÓN */}
                <div className="reporte-pdf-dim-content">
                  <div className="reporte-pdf-dim-header">
                    <h4 className="reporte-pdf-dim-title">{dim.nombre}</h4>
                    <span className="reporte-pdf-dim-criterios-count">
                      {criteriosActivos} de {dim.criterios.length} criterios evaluados
                    </span>
                  </div>

                  <p className="reporte-pdf-dim-guia">{dim.guiaUso || dim.descripcion}</p>

                  {/* CRITERIOS DE EVALUACIÓN DIAGNOSTICADOS (SI CORRESPONDE) */}
                  {listaCriteriosEvaluados.length > 0 && (
                    <div className="reporte-pdf-criterios-box">
                      <div className="reporte-pdf-criterios-head">
                        <CheckCircle2 size={11} color="#059669" />
                        <span className="reporte-pdf-criterios-label">
                          Criterios de Evaluación Diagnosticados ({listaCriteriosEvaluados.length}):
                        </span>
                      </div>
                      <div className="reporte-pdf-criterios-items">
                        {listaCriteriosEvaluados.map((crit) => (
                          <div key={crit.id} className="reporte-pdf-criterio-row">
                            <span className="reporte-pdf-criterio-check">✓</span>
                            <span className="reporte-pdf-criterio-text">
                              <strong>{crit.label}:</strong> {crit.descripcion}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* LISTA DE FACTORES REGISTRADOS */}
                  <div className="reporte-pdf-factores-list">
                    {factores.length === 0 ? (
                      <div className="reporte-pdf-factor-empty">
                        Sin factores registrados en esta dimensión.
                      </div>
                    ) : (
                      factores.map((item, fIdx) => {
                        const isObj = typeof item === 'object' && item !== null;
                        const texto = isObj ? item.texto : item;
                        const tipo = isObj && item.tipo ? item.tipo : (dimData.tipo || 'Oportunidad');
                        const subdimension = isObj && item.subdimension ? item.subdimension : '';
                        const esOp = tipo === 'Oportunidad';

                        return (
                          <div
                            key={fIdx}
                            className={`reporte-pdf-factor-card ${esOp ? 'op' : 'am'}`}
                          >
                            <div className="reporte-pdf-factor-header">
                              <span className={esOp ? 'reporte-pdf-pill-op' : 'reporte-pdf-pill-am'}>
                                {esOp ? 'Oportunidad' : 'Amenaza'}
                              </span>
                              {subdimension && (
                                <span className="reporte-pdf-subdim-pill">
                                  {subdimension}
                                </span>
                              )}
                            </div>
                            <p className="reporte-pdf-factor-text">{texto}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. PIE DE PÁGINA INSTITUCIONAL DEL REPORTE */}
      <footer style={{ marginTop: '24px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.66rem', color: '#64748b' }}>
        <span>Simulador Empresarial • Plataforma de Diagnóstico y Toma de Decisiones Estratégicas</span>
        <span>Generado oficialmente el {fechaFormateada}</span>
      </footer>
    </div>
  );
});

ReportePdfPestel.displayName = 'ReportePdfPestel';

export default ReportePdfPestel;

