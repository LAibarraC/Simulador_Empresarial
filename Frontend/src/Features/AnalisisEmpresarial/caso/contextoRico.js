/**
 * Utilidades del contexto del caso con formato (editor de texto enriquecido).
 * El HTML se limpia con una lista blanca antes de guardarlo o mostrarlo.
 */
const ETIQUETAS = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'H2', 'H3', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'A', 'DIV', 'SPAN']);
const ELIMINAR = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META', 'NOSCRIPT']);
const ALINEACION = /^text-align:\s*(left|center|right|justify);?$/i;

function limpiarNodo(nodo) {
  Array.from(nodo.childNodes).forEach(hijo => {
    if (hijo.nodeType === 3) return;
    if (hijo.nodeType !== 1) { hijo.remove(); return; }
    if (ELIMINAR.has(hijo.tagName)) { hijo.remove(); return; }
    limpiarNodo(hijo);
    if (!ETIQUETAS.has(hijo.tagName)) { hijo.replaceWith(...Array.from(hijo.childNodes)); return; }
    Array.from(hijo.attributes).forEach(atributo => {
      const nombre = atributo.name.toLowerCase();
      const valor = atributo.value.trim();
      const permitido = (hijo.tagName === 'A' && nombre === 'href' && /^(https?:|mailto:)/i.test(valor)) || (nombre === 'style' && ALINEACION.test(valor));
      if (!permitido) hijo.removeAttribute(atributo.name);
    });
    if (hijo.tagName === 'A') { hijo.setAttribute('target', '_blank'); hijo.setAttribute('rel', 'noopener noreferrer'); }
  });
}

const analizar = html => new DOMParser().parseFromString(`<body>${html || ''}</body>`, 'text/html');

/** Devuelve el HTML sin scripts, estilos ni atributos peligrosos. */
export function sanitizarHtml(html) {
  if (!html) return '';
  const documento = analizar(html);
  limpiarNodo(documento.body);
  return documento.body.innerHTML;
}

const escapar = texto => texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Convierte texto plano (párrafos separados por línea en blanco) a HTML. */
export function textoAHtml(texto) {
  const limpio = (texto || '').trim();
  if (!limpio) return '';
  return limpio.split(/\n\s*\n/).map(parrafo => `<p>${escapar(parrafo.trim()).replace(/\n/g, '<br>')}</p>`).join('');
}

function textoDeBloque(elemento) {
  const copia = elemento.cloneNode(true);
  copia.querySelectorAll('br').forEach(salto => salto.replaceWith('\n'));
  return copia.textContent.trim();
}

/** Texto plano equivalente: un bloque por párrafo, con listas numeradas o con viñetas. */
export function htmlATexto(html) {
  if (!html) return '';
  const documento = analizar(html);
  const partes = [];
  documento.body.childNodes.forEach(nodo => {
    if (nodo.nodeType === 3) { if (nodo.textContent.trim()) partes.push(nodo.textContent.trim()); return; }
    if (nodo.nodeType !== 1 || nodo.tagName === 'BR') return;
    if (nodo.tagName === 'UL' || nodo.tagName === 'OL') {
      partes.push(Array.from(nodo.children).map((item, i) => `${nodo.tagName === 'OL' ? `${i + 1}.` : '•'} ${textoDeBloque(item)}`).join('\n'));
    } else {
      const texto = textoDeBloque(nodo);
      if (texto) partes.push(texto);
    }
  });
  return partes.join('\n\n');
}
