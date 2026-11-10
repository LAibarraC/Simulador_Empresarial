import { forwardRef } from 'react';
import { Swords, CheckCircle2 } from 'lucide-react';
import { FUERZAS_PORTER } from './datosPorter';
import '../../fase2-identificacion-problema/ReportePdfFase2.css';

const ReportePdfPorter = forwardRef(({
  caso,
  datosPorter = {}
}, ref) => {
  const estadoFuerzas = datosPorter?.fuerzas || (datosPorter?.rivalidad ? datosPorter : {}) || {};

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

  // Helper para renderizar cada tarjeta de la cruz de Porter
  const renderTarjetaFuerza = (fuerzaId, slotClass) => {
    const fuerza = FUERZAS_PORTER.find(f => f.id === fuerzaId);
    if (!fuerza) return null;

    const fuerzaData = estadoFuerzas[fuerza.id] || {};
    const factores = fuerzaData.factoresManuales || [];
    const listaCriteriosEvaluados = (fuerza.criterios || []).filter(c => Boolean(fuerzaData.criteriosActivos?.[c.id]));
    const criteriosActivos = listaCriteriosEvaluados.length;
    const IconoFuerza = fuerza.icono || Swords;

    let nivel = fuerzaData.nivel;
    if (!nivel) {
      if (criteriosActivos >= 3) nivel = 'Alta';
      else if (criteriosActivos === 2) nivel = 'Media';
      else nivel = 'Baja';
    }

    const nivelClass = (nivel || 'media').toLowerCase();
    const esCentro = fuerza.id === 'rivalidad';

    return (
      <div className={`reporte-pdf-cross-cell ${slotClass}`}>
        <div className={`reporte-pdf-porter-card ${fuerza.posicion.toLowerCase()} ${esCentro ? 'centro' : ''}`}>
          {/* CABECERA DE LA TARJETA */}
          <div className="reporte-pdf-porter-head">
            <div className="reporte-pdf-porter-meta-row">
              <span className="reporte-pdf-cardinal-tag" style={{ color: fuerza.color, borderColor: `${fuerza.color}40`, backgroundColor: `${fuerza.color}12` }}>
                <IconoFuerza size={11} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
                {fuerza.tituloCorto}
              </span>
              <span className={`reporte-pdf-pressure-badge ${nivelClass}`}>
                Presión: {nivel}
              </span>
            </div>
            <h4 className="reporte-pdf-porter-title">{fuerza.nombre}</h4>
            <p className="reporte-pdf-porter-desc">{fuerzaData.descripcion || fuerza.descripcion}</p>
          </div>

          {/* CRITERIOS DE RIESGO EVALUADOS */}
          {listaCriteriosEvaluados.length > 0 && (
            <div className="reporte-pdf-criterios-box">
              <div className="reporte-pdf-criterios-head">
                <CheckCircle2 size={10} color="#059669" />
                <span className="reporte-pdf-criterios-label">
                  Criterios de Riesgo ({listaCriteriosEvaluados.length} de {fuerza.criterios.length}):
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
          <div className="reporte-pdf-porter-factors-box">
            <span className="reporte-pdf-porter-section-label">
              Factores Registrados ({factores.length}):
            </span>
            {factores.length === 0 ? (
              <div className="reporte-pdf-factor-empty">
                Sin factores registrados en esta fuerza.
              </div>
            ) : (
              factores.map((item, fIdx) => {
                const isObj = typeof item === 'object' && item !== null;
                const texto = isObj ? item.texto : item;
                const tipo = isObj && item.tipo ? item.tipo : (nivel === 'Baja' ? 'Oportunidad' : 'Amenaza');
                const esOp = tipo === 'Oportunidad';

                return (
                  <div
                    key={fIdx}
                    className={`reporte-pdf-porter-factor-item ${esOp ? 'op' : 'am'}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <span className={esOp ? 'reporte-pdf-pill-op' : 'reporte-pdf-pill-am'} style={{ fontSize: '0.56rem' }}>
                        {esOp ? 'Oportunidad' : 'Amenaza'}
                      </span>
                    </div>
                    <p className="reporte-pdf-porter-factor-text">{texto}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={ref} className="reporte-fase2-pdf-document">
      {/* 1. HEADER INSTITUCIONAL (IDÉNTICO A PESTEL Y ÁRBOL) */}
      <header className="reporte-pdf-header">
        <div className="reporte-pdf-header-top">
          <div className="reporte-pdf-brand">
            <div className="reporte-pdf-logo-box">
              <span>SE</span>
            </div>
            <div className="reporte-pdf-title-block">
              <h1>DIAGNÓSTICO ESTRATÉGICO • FASE 3</h1>
              <p>LAS 5 FUERZAS DE MICHAEL PORTER (ATRACTIVO INDUSTRIAL)</p>
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

      {/* 2. BANNER DE RESUMEN EJECUTIVO (PORTER) */}
      <section className="reporte-pdf-section">
        <div className="reporte-pdf-factores-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Swords size={18} color="#ea580c" />
            <span className="reporte-pdf-factores-titulo">
              EVALUACIÓN ESTRUCTURAL DE LAS 5 FUERZAS
            </span>
          </div>
        </div>

        {/* 3. DIAGRAMA ESTRUCTURAL EN CRUZ DE LAS 5 FUERZAS DE PORTER */}
        <div className="reporte-pdf-porter-cross-arena">
          {/* NORTE (Fila 1, Columna 2): Amenaza de Nuevos Entrantes */}
          {renderTarjetaFuerza('entrantes', 'node-norte')}

          {/* OESTE (Fila 2, Columna 1): Poder de los Proveedores */}
          {renderTarjetaFuerza('proveedores', 'node-oeste')}

          {/* CENTRO (Fila 2, Columna 2): Rivalidad entre Competidores Existentes */}
          {renderTarjetaFuerza('rivalidad', 'node-centro')}

          {/* ESTE (Fila 2, Columna 3): Poder de los Clientes */}
          {renderTarjetaFuerza('clientes', 'node-este')}

          {/* SUR (Fila 3, Columna 2): Amenaza de Productos Sustitutos */}
          {renderTarjetaFuerza('sustitutos', 'node-sur')}
        </div>
      </section>

      {/* 4. PIE DE PÁGINA INSTITUCIONAL DEL REPORTE */}
      <footer style={{ marginTop: '24px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.66rem', color: '#64748b' }}>
        <span>Simulador Empresarial • Plataforma de Diagnóstico y Toma de Decisiones Estratégicas</span>
        <span>Generado oficialmente el {fechaFormateada}</span>
      </footer>
    </div>
  );
});

ReportePdfPorter.displayName = 'ReportePdfPorter';

export default ReportePdfPorter;
