import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// Pila de modales abiertos: Esc cierra solo el de arriba (p. ej. la confirmación sobre la ficha de etapa).
const pila = [];

/**
 * Modal accesible del Customer Journey Map: se monta en <body>, bloquea el scroll de fondo,
 * se cierra con Esc o al pulsar fuera y enfoca el primer campo al abrirse.
 */
export default function VentanaModal({ abierto, onCerrar, icono, titulo, subtitulo, acento, ancho = 560, pie, tono = '', children }) {
  const panelRef = useRef(null);
  const cerrarRef = useRef(onCerrar);
  useEffect(() => { cerrarRef.current = onCerrar; }, [onCerrar]);

  useEffect(() => {
    if (!abierto) return undefined;
    const token = {};
    pila.push(token);
    const anterior = document.body.style.overflow;
    const enfocado = document.activeElement;
    document.body.style.overflow = 'hidden';
    const alPulsar = evento => { if (evento.key === 'Escape' && pila[pila.length - 1] === token) { evento.stopPropagation(); cerrarRef.current?.(); } };
    document.addEventListener('keydown', alPulsar);
    const temporizador = setTimeout(() => panelRef.current?.querySelector('input:not([type="checkbox"]), textarea, select')?.focus(), 40);
    return () => {
      clearTimeout(temporizador);
      pila.splice(pila.indexOf(token), 1);
      document.body.style.overflow = pila.length ? 'hidden' : anterior;
      document.removeEventListener('keydown', alPulsar);
      if (enfocado && typeof enfocado.focus === 'function') enfocado.focus();
    };
  }, [abierto]);

  if (!abierto) return null;
  const Icono = icono;
  return createPortal(<div className="cjm-modal-overlay" onMouseDown={evento => { if (evento.target === evento.currentTarget) onCerrar(); }}>
    <div ref={panelRef} className={`cjm-modal${tono ? ` ${tono}` : ''}`} role="dialog" aria-modal="true" aria-label={titulo} style={{ maxWidth: ancho, '--cjm-modal-accent': acento || '#ea580c' }}>
      <header className="cjm-modal-head">
        {Icono && <span className="cjm-modal-icon"><Icono size={18}/></span>}
        <div><h3>{titulo}</h3>{subtitulo && <p>{subtitulo}</p>}</div>
        <button type="button" className="cjm-btn-close" onClick={onCerrar} aria-label="Cerrar"><X size={18}/></button>
      </header>
      <div className="cjm-modal-body">{children}</div>
      {pie && <footer className="cjm-modal-foot">{pie}</footer>}
    </div>
  </div>, document.body);
}
