import { forwardRef } from 'react';
import { Calendar, FileText, Layers } from 'lucide-react';
import '../../fase2-identificacion-problema/ReportePdfFase2.css';
import './ReportePdfPoam.css';

const ReportePdfPoam = forwardRef(({ caso, factores = [] }, ref) => {
  const paginas = [];
  for (let i = 0; i < factores.length; i += 8) paginas.push(factores.slice(i, i + 8));
  if (!paginas.length) paginas.push([]);

  const nombreCaso = caso?.titulo?.trim() || caso?.nombre?.trim() || 'Caso de Estudio';
  const sector = caso?.sector?.trim() || caso?.categoria?.trim() || 'Empresarial / General';
  const fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div ref={ref} className="poam-pdf-document">
      {paginas.map((pagina, pageIndex) => (
        <section className="poam-pdf-page" key={`poam-pdf-page-${pageIndex}`}>
          <header className="reporte-pdf-header poam-pdf-header">
            <div className="reporte-pdf-header-top">
              <div className="reporte-pdf-brand">
                <div className="reporte-pdf-logo-box"><span>SE</span></div>
                <div className="reporte-pdf-title-block">
                  <h1>DIAGNÓSTICO ESTRATÉGICO • FASE 3</h1>
                  <p>MATRIZ DE PERFIL DE OPORTUNIDADES Y AMENAZAS (POAM)</p>
                </div>
              </div>
              <div className="reporte-pdf-badge-tag">
                <span>Simulador Empresarial</span>
                <div>Reporte Académico Oficial</div>
              </div>
            </div>
            <div className="reporte-pdf-meta-grid">
              <div className="reporte-pdf-meta-item"><span className="reporte-pdf-meta-label">Caso de Estudio</span><span className="reporte-pdf-meta-value">{nombreCaso}</span></div>
              <div className="reporte-pdf-meta-item"><span className="reporte-pdf-meta-label">Sector / Industria</span><span className="reporte-pdf-meta-value">{sector}</span></div>
              <div className="reporte-pdf-meta-item"><span className="reporte-pdf-meta-label">Fecha de Emisión</span><span className="reporte-pdf-meta-value">{fecha}</span></div>
            </div>
          </header>

          <div className="poam-pdf-table-heading">
            <Layers size={17} />
            <strong>MATRIZ TABULAR POAM</strong>
            <span>{factores.length} factores</span>
          </div>
          <table className="poam-pdf-table">
            <colgroup>
              <col style={{ width: '25%' }} /><col style={{ width: '12%' }} /><col style={{ width: '13%' }} />
              <col style={{ width: '9%' }} /><col style={{ width: '8%' }} /><col style={{ width: '8%' }} />
              <col style={{ width: '8%' }} /><col style={{ width: '17%' }} />
            </colgroup>
            <thead><tr>
              <th>Factor del entorno</th><th>Dimensión</th><th>Subdimensión</th><th>Polaridad</th>
              <th>Oportunidad</th><th>Amenaza</th><th>Impacto</th><th>Justificación</th>
            </tr></thead>
            <tbody>{pagina.map((factor, index) => {
              const oportunidad = factor.tipo === 'Oportunidad';
              const calificacion = factor.calificacion || factor.impacto || '—';
              return <tr key={factor.id || `${pageIndex}-${index}`}>
                <td className="poam-pdf-factor">{factor.factor || '—'}{factor.fuente && <small>Fuente: {factor.fuente}</small>}</td>
                <td>{factor.categoria || '—'}</td><td>{factor.subdivision || '—'}</td>
                <td><span className={`poam-pdf-polarity ${oportunidad ? 'op' : 'am'}`}>{factor.tipo || '—'}</span></td>
                <td className={oportunidad ? 'poam-pdf-score op' : 'poam-pdf-score'}>{oportunidad ? calificacion : '—'}</td>
                <td className={!oportunidad ? 'poam-pdf-score am' : 'poam-pdf-score'}>{!oportunidad ? calificacion : '—'}</td>
                <td>{factor.impacto || '—'}</td><td>{factor.justificacion || '—'}</td>
              </tr>;
            })}</tbody>
          </table>
          <footer className="poam-pdf-footer"><span><FileText size={11} /> Simulador Empresarial • Diagnóstico y Toma de Decisiones Estratégicas</span><span><Calendar size={11} /> {fecha} • Página {pageIndex + 1} de {paginas.length}</span></footer>
        </section>
      ))}
    </div>
  );
});

ReportePdfPoam.displayName = 'ReportePdfPoam';
export default ReportePdfPoam;
