import { forwardRef } from 'react';
import { Award } from 'lucide-react';
import '../../fase2-identificacion-problema/ReportePdfFase2.css';
import './ReportePdfMpc.css';

const ReportePdfMpc = forwardRef(({
  caso,
  datosMpc = {}
}, ref) => {
  const competidores = datosMpc?.competidores || [];
  const factores = datosMpc?.factores || [];
  const calificaciones = datosMpc?.calificaciones || {};
  const totalesCompetidores = datosMpc?.totalesCompetidores || {};
  const ranking = datosMpc?.ranking || [];
  const sumaPesos = datosMpc?.sumaPesos || 0;

  // Metadatos del Caso
  const nombreCaso =
    (caso?.titulo && caso.titulo.trim()) ||
    (caso?.nombre && caso.nombre.trim()) ||
    (caso?.nombreEmpresa && caso.nombreEmpresa.trim()) ||
    'Caso de Estudio';

  const sector =
    (caso?.sector && caso.sector.trim()) ||
    (caso?.categoria && caso.categoria.trim()) ||
    'Empresarial / General';

  const fechaFormateada = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const getRankingInfo = (compId) => ranking.find(r => r.id === compId) || {};

  return (
    <div ref={ref} className="reporte-fase2-pdf-document">

      {/* 1. HEADER INSTITUCIONAL (idéntico a Porter) */}
      <header className="reporte-pdf-header">
        <div className="reporte-pdf-header-top">
          <div className="reporte-pdf-brand">
            <div className="reporte-pdf-logo-box">
              <span>SE</span>
            </div>
            <div className="reporte-pdf-title-block">
              <h1>DIAGNÓSTICO ESTRATÉGICO • FASE 5</h1>
              <p>MATRIZ DE PERFIL COMPETITIVO (MPC)</p>
            </div>
          </div>
          <div className="reporte-pdf-badge-tag">
            <span>Simulador Empresarial</span>
            <div style={{ color: '#ea580c', fontWeight: 800 }}>Reporte Académico Oficial</div>
          </div>
        </div>

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

      {/* 2. BANNER Y TABLA MPC */}
      <section className="reporte-pdf-section">
        <div className="reporte-pdf-factores-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} color="#ea580c" />
            <span className="reporte-pdf-factores-titulo">
              MATRIZ DE PERFIL COMPETITIVO — {factores.length} FACTORES CRÍTICOS DE ÉXITO
            </span>
          </div>
        </div>

        <div className="reporte-pdf-mpc-table-wrapper">
          <table className="reporte-pdf-mpc-table">
            <colgroup>
              <col style={{ width: '31%' }} />
              <col style={{ width: '8%' }} />
              {competidores.map(comp => (
                <col key={`col-${comp.id}`} style={{ width: `${61 / Math.max(competidores.length, 1)}%` }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className="col-fce">Factor Crítico de Éxito (FCE)</th>
                <th className="col-peso">Peso</th>
                {competidores.map(comp => (
                  <th
                    key={comp.id}
                    className={`col-comp ${comp.esPropia ? 'propia' : ''}`}
                  >
                    <div className="comp-header">
                      <span className={`comp-badge ${comp.esPropia ? 'propia' : 'rival'}`}>
                        {comp.esPropia ? 'PROPIA' : 'RIVAL'}
                      </span>
                      <span className="comp-name">
                        {comp.nombre || comp.badge || '—'}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {factores.map(factor => {
                const peso = parseFloat(factor.peso) || 0;
                return (
                  <tr key={factor.id}>
                    <td className="col-fce">
                      <div className="fce-code">{factor.codigo}</div>
                      <div className="fce-name">{factor.nombre}</div>
                      {factor.descripcion && (
                        <div className="fce-desc">{factor.descripcion}</div>
                      )}
                    </td>
                    <td className="col-peso">
                      <div className="peso-val">{(peso * 100).toFixed(0)}%</div>
                      <div className="peso-dec">{peso.toFixed(2)}</div>
                    </td>
                    {competidores.map(comp => {
                      const rating = calificaciones[comp.id]?.[factor.id] || 0;
                      const pond = peso * rating;
                      return (
                        <td
                          key={`${comp.id}-${factor.id}`}
                          className={`col-comp ${comp.esPropia ? 'propia' : ''}`}
                        >
                          <div className="eval-cell">
                            <span className={`rating-badge rating-${rating}`}>
                              {rating || '—'}
                            </span>
                            <span className="pond-val">{pond.toFixed(2)}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="totals-row">
                <td className="col-fce total-label">
                  <div className="total-label-main">TOTAL PONDERADO</div>
                  <div className="total-label-sub">Postura Competitiva Relativa</div>
                </td>
                <td className="col-peso">
                  <div className="peso-val total-peso">{sumaPesos.toFixed(2)}</div>
                  <div className="peso-dec">/ 1.00</div>
                </td>
                {competidores.map(comp => {
                  const total = totalesCompetidores[comp.id]?.totalPonderado || 0;
                  const rank = getRankingInfo(comp.id);
                  const esLider = rank.posicion === 1 && total > 0;
                  return (
                    <td
                      key={`total-${comp.id}`}
                      className={`col-comp total-cell ${comp.esPropia ? 'propia' : ''} ${esLider ? 'lider' : ''}`}
                    >
                      <div className="total-score">{total.toFixed(2)}</div>
                      <div className="total-max">/ 4.00</div>
                      {rank.posicion && (
                        <div className="rank-line">
                          <span className="rank-pos">#{rank.posicion}</span>
                          <span className="rank-postura">{rank.postura || '—'}</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* 3. PIE DE PÁGINA (idéntico a Porter) */}
      <footer className="reporte-pdf-mpc-footer" style={{
        marginTop: '24px',
        paddingTop: '12px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.66rem',
        color: '#64748b'
      }}>
        <span>Simulador Empresarial • Plataforma de Diagnóstico y Toma de Decisiones Estratégicas</span>
        <span>Generado oficialmente el {fechaFormateada}</span>
      </footer>
    </div>
  );
});

ReportePdfMpc.displayName = 'ReportePdfMpc';

export default ReportePdfMpc;
