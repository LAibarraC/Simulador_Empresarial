import { useCallback, useEffect, useRef, useState } from 'react';
import { AlignCenter, AlignJustify, AlignLeft, Bold, Check, Eraser, Heading2, Heading3, Italic, Link2, List, ListOrdered, Pilcrow, Quote, Redo2, Strikethrough, Underline, Undo2, Unlink, X } from 'lucide-react';
import { sanitizarHtml, textoAHtml } from './contextoRico';
import './EditorTextoRico.css';

const ESTADOS = { bold: false, italic: false, underline: false, strikeThrough: false, insertUnorderedList: false, insertOrderedList: false, justifyLeft: false, justifyCenter: false, justifyFull: false };

function Boton({ icono, titulo, activo, onMouseDown }) {
  const Icono = icono;
  return <button type="button" className={`ter-btn${activo ? ' activo' : ''}`} title={titulo} aria-label={titulo} aria-pressed={activo ? 'true' : 'false'} onMouseDown={onMouseDown}><Icono size={15}/></button>;
}

/**
 * Editor de texto enriquecido (sin dependencias): negrita, cursiva, subrayado, tachado, títulos,
 * listas, cita, alineación, enlaces, deshacer/rehacer y limpiar formato. Emite HTML por `onChange`.
 * Es no controlado: el contenido inicial se lee una vez (remontar con `key` para reemplazarlo).
 */
export default function EditorTextoRico({ valorInicial = '', onChange, placeholder = 'Escribe aquí…', minAlto = 280 }) {
  const editorRef = useRef(null);
  const rangoRef = useRef(null);
  const [activos, setActivos] = useState(ESTADOS);
  const [bloque, setBloque] = useState('p');
  const [enlace, setEnlace] = useState(null); // { url } mientras el formulario de enlace está abierto
  const [conteo, setConteo] = useState({ palabras: 0, caracteres: 0 });

  const emitir = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.innerHTML === '<br>') editor.innerHTML = '';
    const texto = editor.textContent || '';
    setConteo({ palabras: texto.trim().split(/\s+/).filter(Boolean).length, caracteres: texto.length });
    onChange?.(editor.innerHTML);
  }, [onChange]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.innerHTML = sanitizarHtml(valorInicial);
    const texto = editor.textContent || '';
    setConteo({ palabras: texto.trim().split(/\s+/).filter(Boolean).length, caracteres: texto.length });
    // Solo al montar: el contenido posterior lo gobierna el propio editor.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const alCambiarSeleccion = () => {
      const editor = editorRef.current;
      const seleccion = window.getSelection();
      if (!editor || !seleccion?.rangeCount || !editor.contains(seleccion.anchorNode)) return;
      rangoRef.current = seleccion.getRangeAt(0).cloneRange();
      const siguiente = {};
      Object.keys(ESTADOS).forEach(comando => { try { siguiente[comando] = document.queryCommandState(comando); } catch { siguiente[comando] = false; } });
      setActivos(anterior => (Object.keys(siguiente).some(k => siguiente[k] !== anterior[k]) ? siguiente : anterior));
      let formato = 'p';
      try { formato = (document.queryCommandValue('formatBlock') || 'p').toLowerCase().replace(/[<>]/g, ''); } catch { /* sin formato */ }
      setBloque(['h2', 'h3', 'blockquote'].includes(formato) ? formato : 'p');
    };
    document.addEventListener('selectionchange', alCambiarSeleccion);
    return () => document.removeEventListener('selectionchange', alCambiarSeleccion);
  }, []);

  const ejecutar = (comando, valor = null) => {
    editorRef.current?.focus();
    document.execCommand(comando, false, valor);
    emitir();
  };
  const dar = (comando, valor) => ({ onMouseDown: evento => { evento.preventDefault(); ejecutar(comando, valor); } });
  // Una lista no puede vivir dentro de un título o una cita: se pasa antes a párrafo.
  const darLista = comando => ({ onMouseDown: evento => {
    evento.preventDefault();
    editorRef.current?.focus();
    if (bloque !== 'p') document.execCommand('formatBlock', false, '<p>');
    ejecutar(comando);
  } });
  const darBloque = etiqueta => ({ onMouseDown: evento => { evento.preventDefault(); ejecutar('formatBlock', `<${bloque === etiqueta ? 'p' : etiqueta}>`); } });

  const alPegar = evento => {
    evento.preventDefault();
    const html = evento.clipboardData.getData('text/html');
    const texto = evento.clipboardData.getData('text/plain');
    const contenido = html ? sanitizarHtml(html) : textoAHtml(texto);
    if (contenido) document.execCommand('insertHTML', false, contenido);
    emitir();
  };

  const abrirEnlace = () => {
    const seleccion = window.getSelection();
    const ancla = seleccion?.anchorNode?.parentElement?.closest('a');
    setEnlace({ url: ancla?.getAttribute('href') || '', error: false });
  };
  // Acepta «ejemplo.com» (agrega https://), http(s) y mailto; rechaza el resto.
  const normalizarUrl = bruta => {
    const texto = (bruta || '').trim();
    if (!texto) return '';
    if (/^(https?:\/\/|mailto:)/i.test(texto)) return texto;
    if (/^[a-z][a-z0-9+.-]*:/i.test(texto)) return '';
    return /^[^\s/]+\.[^\s]{2,}/.test(texto) || /^localhost/i.test(texto) ? `https://${texto}` : '';
  };
  const aplicarEnlace = () => {
    const url = normalizarUrl(enlace?.url);
    if (!url) { setEnlace(actual => ({ ...actual, error: true })); return; }
    setEnlace(null);
    const editor = editorRef.current;
    editor?.focus();
    const seleccion = window.getSelection();
    if (rangoRef.current && editor?.contains(rangoRef.current.commonAncestorContainer)) { seleccion.removeAllRanges(); seleccion.addRange(rangoRef.current); }
    if (seleccion.isCollapsed) document.execCommand('insertHTML', false, `<a href="${url.replace(/"/g, '&quot;')}">${url.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</a>&nbsp;`);
    else document.execCommand('createLink', false, url);
    emitir();
  };
  const alTeclearEnlace = evento => {
    if (evento.key === 'Enter') { evento.preventDefault(); evento.stopPropagation(); aplicarEnlace(); }
    else if (evento.key === 'Escape') { evento.preventDefault(); evento.stopPropagation(); setEnlace(null); editorRef.current?.focus(); }
  };

  return <div className="ter">
    <div className="ter-barra" role="toolbar" aria-label="Formato del texto">
      <div className="ter-grupo">
        <Boton icono={Undo2} titulo="Deshacer (Ctrl+Z)" {...dar('undo')}/>
        <Boton icono={Redo2} titulo="Rehacer (Ctrl+Y)" {...dar('redo')}/>
      </div>
      <div className="ter-grupo">
        <Boton icono={Pilcrow} titulo="Párrafo normal" activo={bloque === 'p'} onMouseDown={evento => { evento.preventDefault(); ejecutar('formatBlock', '<p>'); }}/>
        <Boton icono={Heading2} titulo="Título" activo={bloque === 'h2'} {...darBloque('h2')}/>
        <Boton icono={Heading3} titulo="Subtítulo" activo={bloque === 'h3'} {...darBloque('h3')}/>
      </div>
      <div className="ter-grupo">
        <Boton icono={Bold} titulo="Negrita (Ctrl+B)" activo={activos.bold} {...dar('bold')}/>
        <Boton icono={Italic} titulo="Cursiva (Ctrl+I)" activo={activos.italic} {...dar('italic')}/>
        <Boton icono={Underline} titulo="Subrayado (Ctrl+U)" activo={activos.underline} {...dar('underline')}/>
        <Boton icono={Strikethrough} titulo="Tachado" activo={activos.strikeThrough} {...dar('strikeThrough')}/>
      </div>
      <div className="ter-grupo">
        <Boton icono={List} titulo="Lista con viñetas" activo={activos.insertUnorderedList} {...darLista('insertUnorderedList')}/>
        <Boton icono={ListOrdered} titulo="Lista numerada" activo={activos.insertOrderedList} {...darLista('insertOrderedList')}/>
        <Boton icono={Quote} titulo="Cita" activo={bloque === 'blockquote'} {...darBloque('blockquote')}/>
      </div>
      <div className="ter-grupo">
        <Boton icono={AlignLeft} titulo="Alinear a la izquierda" activo={activos.justifyLeft} {...dar('justifyLeft')}/>
        <Boton icono={AlignCenter} titulo="Centrar" activo={activos.justifyCenter} {...dar('justifyCenter')}/>
        <Boton icono={AlignJustify} titulo="Justificar" activo={activos.justifyFull} {...dar('justifyFull')}/>
      </div>
      <div className="ter-grupo">
        <Boton icono={Link2} titulo="Insertar enlace" onMouseDown={evento => { evento.preventDefault(); abrirEnlace(); }}/>
        <Boton icono={Unlink} titulo="Quitar enlace" {...dar('unlink')}/>
        <Boton icono={Eraser} titulo="Limpiar formato" {...dar('removeFormat')}/>
      </div>
    </div>

    {enlace && <div className={`ter-enlace${enlace.error ? ' invalido' : ''}`} role="group" aria-label="Insertar enlace">
      <Link2 size={14}/>
      <input className="ter-enlace-url" autoFocus value={enlace.url} onChange={e => setEnlace({ url: e.target.value, error: false })} onKeyDown={alTeclearEnlace} placeholder="ejemplo.com o https://ejemplo.com" aria-label="Dirección del enlace" aria-invalid={enlace.error}/>
      {enlace.error && <span className="ter-enlace-error">Dirección no válida</span>}
      <button type="button" className="ter-btn activo" title="Aplicar enlace" onClick={aplicarEnlace}><Check size={15}/></button>
      <button type="button" className="ter-btn" title="Cancelar" onClick={() => { setEnlace(null); editorRef.current?.focus(); }}><X size={15}/></button>
    </div>}

    <div ref={editorRef} className="ter-area" contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label="Contexto del caso"
      data-placeholder={placeholder} style={{ minHeight: minAlto }} onInput={emitir} onPaste={alPegar} spellCheck/>

    <div className="ter-pie"><span>{conteo.palabras} palabras · {conteo.caracteres} caracteres</span><span className="ter-ayuda">Ctrl+B negrita · Ctrl+I cursiva · Ctrl+Z deshacer</span></div>
  </div>;
}
