import { useState, useMemo } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  DollarSign,
  Type,
  Star,
  Copy,
  Check,
  ExternalLink,
  Download
} from 'lucide-react';
import { obtenerDetalleCompletoCaso } from './detalleCaso';
import { obtenerParrafosContexto } from './textoContextoCaso';
import { sanitizarHtml } from './contextoRico';
import './EditorTextoRico.css';
import { BASE_URL } from '../../../services/api';

export default function DossierCaso({
  caso,
  defaultExpandido = true,
  className = ''
}) {
  const [expandido, setExpandido] = useState(defaultExpandido);
  const [tamanoFuente, setTamanoFuente] = useState('normal'); // 'normal' | 'grande'
  const [copiado, setCopiado] = useState(false);

  const casoDetalle = obtenerDetalleCompletoCaso(caso);
  const docAdjunto = casoDetalle?.archivoDocumento || caso?.detalles?.archivoDocumento;

  // Contexto con formato (editor enriquecido): se muestra limpio; si no existe se usan los párrafos de texto plano.
  const contextoHtml = useMemo(() => {
    let detalles = caso?.detalles;
    if (typeof detalles === 'string') { try { detalles = JSON.parse(detalles); } catch { detalles = null; } }
    return sanitizarHtml(detalles?.contextoHtml || '');
  }, [caso]);

  const parrafos = useMemo(() => {
    if (!casoDetalle) return [];
    const raw = casoDetalle.contexto || casoDetalle.enunciadoCompleto || '';
    const items = obtenerParrafosContexto(raw);
    // Si hay un documento adjunto, descartar cualquier línea que sea solo "Documento del caso: ..."
    return items.filter(p => !p.trim().toLowerCase().startsWith('documento del caso:'));
  }, [casoDetalle]);


  if (!casoDetalle) return null;

  const copiarContexto = (e) => {
    e.stopPropagation();
    const textoCompleto = parrafos.join('\n\n');
    if (textoCompleto && navigator?.clipboard) {
      navigator.clipboard.writeText(textoCompleto).then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      });
    }
  };

  const toggleTamanoFuente = (e) => {
    e.stopPropagation();
    setTamanoFuente(prev => (prev === 'normal' ? 'grande' : 'normal'));
  };

  const toggleExpandido = () => {
    setExpandido(prev => !prev);
  };

  return (
    <div
      className={`caso-dossier-card ${expandido ? 'expandido' : 'compacto'} fuente-${tamanoFuente} ${className}`}
      id="caso-estudio-dossier"
    >
      {/* 1. HERO HEADER: IDENTIDAD DEL CASO Y CONTROLES DE LECTURA */}
      <div className="caso-dossier-header" onClick={toggleExpandido}>
        <div className="caso-dossier-identity">
          <div className="caso-dossier-icon-wrapper">
            <BookOpen size={22} className="caso-header-icon" />
            <span className="caso-pulse-dot" />
          </div>

          <div className="caso-dossier-titles">
            <div className="caso-badge-row">
              <span className="caso-tag-pill sector">
                {casoDetalle.sector}
              </span>
              <span className="caso-tag-pill capital">
                <DollarSign size={12} style={{ marginRight: 2 }} />
                Presupuesto: {casoDetalle.capital}
              </span>
              <span className={`caso-tag-pill dificultad ${casoDetalle.dificultad?.toLowerCase()}`}>
                <span className="stars-mini">
                  {[...Array(casoDetalle.estrellas || 2)].map((_, i) => (
                    <Star key={i} size={11} fill="currentColor" />
                  ))}
                </span>
                {casoDetalle.dificultad}
              </span>
            </div>

            <h3 className="caso-dossier-title">
              {casoDetalle.nombreEmpresa || casoDetalle.tituloOriginal}
            </h3>

            {!expandido && (
              <p className="caso-dossier-summary-mini">
                {docAdjunto ? (
                  <><strong>Documento Oficial:</strong> {docAdjunto.nombre || 'Documento adjunto del caso'}</>
                ) : (
                  <><strong>Contexto:</strong> {(casoDetalle.contexto || casoDetalle.enunciadoCompleto)?.slice(0, 140)}...</>
                )}
              </p>
            )}
          </div>
        </div>

        {/* ACCIONES Y CONTROLES DEL ENCABEZADO */}
        <div className="caso-dossier-controls" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`btn-control-dossier btn-tamano-fuente ${tamanoFuente === 'grande' ? 'activo' : ''}`}
            onClick={toggleTamanoFuente}
            title={tamanoFuente === 'normal' ? 'Aumentar tamaño de letra para lectura cómoda' : 'Tamaño de letra estándar'}
          >
            <Type size={14} />
            <span>{tamanoFuente === 'normal' ? 'A+' : 'A'}</span>
          </button>

          <button
            type="button"
            className="btn-control-dossier btn-toggle-expand"
            onClick={toggleExpandido}
            title={expandido ? 'Minimizar contexto' : 'Leer contexto completo'}
          >
            {expandido ? (
              <>
                <ChevronUp size={16} />
                <span>Minimizar</span>
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                <span className="highlight-text">Leer Contexto Completo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. CUERPO COMPLETO DEL DOSSIER: INSTRUCCIONES Y CONTEXTO */}
      {expandido && (
        <div className="caso-dossier-body">
          {/* BANNER DE INSTRUCCIONES */}
          <div className="caso-callout-banner">
            <div className="callout-icon-col">
              <FileText size={20} />
            </div>
            <div className="callout-text-col">
              <h4 className="callout-title">Instrucciones</h4>
              <p className="callout-desc">
                {casoDetalle.instrucciones || (
                  <>
                    Lee atentamente el contexto y la situación de la empresa a continuación. Al finalizar tu lectura, pulsa el botón <strong>"Continuar lluvia de ideas(fase 2)"</strong> para comenzar a identificar y clasificar las evidencias y hechos clave.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* SI EL CASO TIENE UN DOCUMENTO SUBIDO */}
          {(() => {
            const docAdjunto = casoDetalle.archivoDocumento || caso?.detalles?.archivoDocumento;
            if (!docAdjunto) return null;
            const docUrl = docAdjunto.url ? (docAdjunto.url.startsWith('http') ? docAdjunto.url : `${BASE_URL}${docAdjunto.url}`) : null;
            const esPdf = docAdjunto.extension === '.pdf' || docAdjunto.nombre?.toLowerCase().endsWith('.pdf');

            return (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '8px',
                      backgroundColor: esPdf ? 'rgba(239, 68, 68, 0.12)' : 'rgba(37, 99, 235, 0.12)',
                      color: esPdf ? '#ef4444' : 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FileText size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {docAdjunto.nombre || 'Documento Oficial del Caso'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Documento oficial adjunto para el análisis • {docAdjunto.tamano_bytes ? `${(docAdjunto.tamano_bytes / 1024).toFixed(1)} KB` : 'Archivo listo'}
                      </div>
                    </div>
                  </div>

                  {docUrl && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--primary-color)',
                          color: '#fff',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          textDecoration: 'none'
                        }}
                      >
                        <ExternalLink size={14} />
                        <span>Abrir en Pestaña</span>
                      </a>
                      <a
                        href={docUrl}
                        download={docAdjunto.nombre || 'documento_caso'}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-input)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-main)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          textDecoration: 'none'
                        }}
                      >
                        <Download size={14} />
                        <span>Descargar</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Si es PDF, visor incrustado para lectura directa del estudiante */}
                {esPdf && docUrl && (
                  <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', marginTop: '4px' }}>
                    <iframe
                      src={`${docUrl}#toolbar=1`}
                      title="Visor de Documento del Caso"
                      style={{ width: '100%', height: '520px', border: 'none', background: '#525659' }}
                    />
                  </div>
                )}
              </div>
            );
          })()}

          {/* CONTEXTO NARRATIVO DEL CASO DE ESTUDIO (Solo si no hay documento o si hay texto narrativo real) */}
          {(!docAdjunto || parrafos.length > 0 || contextoHtml) && (
            <div className="caso-narrativa-lead-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <h4 className="caso-section-subtitle" style={{ margin: 0, padding: 0, border: 'none' }}>
                  <BookOpen size={16} />
                  <span>Contexto del Caso de Estudio</span>
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                  <button
                    type="button"
                    onClick={copiarContexto}
                    title="Copiar texto del contexto"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.74rem',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)',
                      background: copiado ? '#10b981' : 'var(--bg-input)',
                      color: copiado ? '#fff' : 'var(--text-main)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {copiado ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiado ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
              <div className="caso-narrativa-parrafos">
                {contextoHtml ? (
                  <div className="ter-contenido caso-parrafo" dangerouslySetInnerHTML={{ __html: contextoHtml }}/>
                ) : parrafos.length > 0 ? (
                  parrafos.map((parrafo, idx) => (
                    <p key={idx} className={`caso-parrafo ${idx === 0 ? 'primer-parrafo' : ''}`}>
                      {idx === 0 && <span className="caso-drop-cap">{parrafo.charAt(0)}</span>}
                      {idx === 0 ? parrafo.slice(1) : parrafo}
                    </p>
                  ))
                ) : (
                  <p className="caso-parrafo" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                    No se ha especificado un contexto detallado para este caso.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

