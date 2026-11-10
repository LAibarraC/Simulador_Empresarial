import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AlertTriangle, Clock, Copy, Link2Off, ListPlus, Paperclip, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { SIN_RESPONSABLE, construirAristas, formaDe, obtenerCarriles } from './calculosFlujo';

const ALTO_FILA = 104;
const ALTO_NODO = 62;
const DESPLAZAMIENTO = 30; // aire superior para la barra flotante del paso seleccionado
const COLORES = { flujo: '#94a3b8', si: '#059669', no: '#dc2626' };
const UMBRAL_ARRASTRE = 5;

/** Ancho del contenedor: medida síncrona al montar (también en reportes ocultos) y luego ResizeObserver. */
function useAncho(ref) {
  const [ancho, setAncho] = useState(0);
  useLayoutEffect(() => {
    if (!ref.current) return undefined;
    setAncho(Math.round(ref.current.getBoundingClientRect().width));
    const observador = new ResizeObserver(([entrada]) => setAncho(Math.round(entrada.contentRect.width)));
    observador.observe(ref.current);
    return () => observador.disconnect();
  }, [ref]);
  return ancho;
}

/** Calcula la geometría de nodos y conectores a partir del ancho disponible. */
function calcularDisposicion(pasos, ancho, ajuste) {
  const carriles = obtenerCarriles(pasos);
  const aristas = construirAristas(pasos);
  const indice = Object.fromEntries(pasos.map((paso, i) => [paso.id, i]));
  const saltos = aristas.filter(arista => indice[arista.hasta] !== indice[arista.desde] + 1);
  const margen = Math.min(70, 18 + saltos.length * 10);
  const anchoCarriles = Math.max(0, ancho - margen);
  const columna = anchoCarriles / carriles.length;
  const anchoNodo = Math.max(90, Math.min(columna - 24, 230));
  const nodos = Object.fromEntries(pasos.map((paso, fila) => {
    const carril = carriles.indexOf(paso.responsable?.trim() || SIN_RESPONSABLE);
    return [paso.id, { x: columna * (carril + 0.5), y: DESPLAZAMIENTO + ALTO_FILA * (fila + 0.5), w: anchoNodo, h: ALTO_NODO, carril }];
  }));

  let canal = 0;
  const trazos = aristas.map((arista, i) => {
    const a = nodos[arista.desde];
    const b = nodos[arista.hasta];
    const consecutivo = indice[arista.hasta] === indice[arista.desde] + 1;
    const guardada = (ajuste && ajuste.desde === arista.desde && ajuste.tipo === arista.tipo ? ajuste.ruta : pasos[indice[arista.desde]].ruta?.[arista.tipo]) || null;
    let d;
    let etiqueta;
    let medio;
    let clase;
    if (consecutivo && !(arista.tipo === 'no' && aristas.some(otra => otra.desde === arista.desde && otra.tipo === 'si' && otra.hasta === arista.hasta))) {
      const y1 = a.y + a.h / 2;
      const y2 = b.y - b.h / 2;
      if (a.x === b.x) {
        const dx = guardada?.dx || 0;
        clase = 'recto';
        d = dx ? `M ${a.x} ${y1} V ${y1 + 12} H ${a.x + dx} V ${y2 - 12} H ${a.x} V ${y2}` : `M ${a.x} ${y1} V ${y2}`;
        medio = { x: a.x + dx, y: (y1 + y2) / 2 };
      } else {
        const ym = y1 + (y2 - y1) * (guardada?.t ?? 0.5);
        clase = 'codo';
        d = `M ${a.x} ${y1} V ${ym} H ${b.x} V ${y2}`;
        medio = { x: (a.x + b.x) / 2, y: ym };
      }
      etiqueta = { x: a.x + 8, y: y1 + 14, ancla: 'start' };
    } else {
      const xCanal = guardada?.xr != null ? guardada.xr * ancho : anchoCarriles + 10 + (canal++ % 5) * 10;
      const x1 = a.x + a.w / 2;
      const x2 = b.x + b.w / 2;
      clase = 'canal';
      d = `M ${x1} ${a.y} H ${xCanal} V ${b.y} H ${x2 + 2}`;
      etiqueta = { x: x1 + 6, y: a.y - 6, ancla: 'start' };
      medio = { x: xCanal, y: (a.y + b.y) / 2 };
    }
    return { id: `${arista.desde}>${arista.hasta}:${arista.tipo}`, clave: `${arista.desde}>${arista.hasta}:${arista.tipo}:${i}`, desde: arista.desde, hasta: arista.hasta, d, tipo: arista.tipo, texto: arista.etiqueta, etiqueta, medio, clase, y1: a.y + a.h / 2, y2: b.y - b.h / 2, ax: a.x, personalizada: Boolean(guardada) };
  });
  return { carriles, columna, nodos, trazos, alto: DESPLAZAMIENTO + Math.max(ALTO_FILA, pasos.length * ALTO_FILA) + 8, anchoCarriles };
}

/** Punto de anclaje (en el lienzo) del asa de conexión de un nodo. */
function anclaje(nodo, tipo, esDecision) {
  if (esDecision && tipo === 'no') return { x: nodo.x + nodo.w / 2, y: nodo.y };
  return { x: nodo.x, y: nodo.y + nodo.h / 2 };
}

/**
 * Diagrama de flujo de carriles (swimlanes).
 * Sin `acciones` es de solo lectura (PDF). Con `acciones` permite arrastrar pasos (cambiar de carril o de fila),
 * conectar pasos arrastrando desde el asa, y editar, duplicar, eliminar o insertar pasos desde la barra flotante.
 */
export default function DiagramaCarriles({ pasos, seleccionado, evidencias = {}, acciones }) {
  const ref = useRef(null);
  const lienzoRef = useRef(null);
  const ancho = useAncho(ref);
  const [ajuste, setAjuste] = useState(null); // ruta que se está arrastrando { desde, tipo, ruta }
  const disposicion = ancho ? calcularDisposicion(pasos, ancho, ajuste) : null;
  const interactivo = Boolean(acciones);
  const [arrastre, setArrastre] = useState(null); // { id, x, y, carril, fila }
  const [conexion, setConexion] = useState(null); // { desde, tipo, x, y, destino }
  const [aristaSel, setAristaSel] = useState(null);
  const vivo = useRef({});
  const seleccionar = useCallback(id => { setAristaSel(null); acciones?.seleccionar(id); }, [acciones]);
  useEffect(() => { vivo.current = { disposicion, pasos, acciones, seleccionar }; });

  const posicionEnLienzo = useCallback(evento => {
    const caja = lienzoRef.current.getBoundingClientRect();
    return { x: evento.clientX - caja.left, y: evento.clientY - caja.top };
  }, []);

  const destinoDeFila = useCallback((y, total) => Math.max(0, Math.min(total - 1, Math.floor((y - DESPLAZAMIENTO) / ALTO_FILA))), []);

  /* Arrastrar un paso: cambia de carril (responsable) y de fila (orden) manteniendo sus conexiones. */
  const iniciarArrastre = (evento, paso) => {
    if (!interactivo || evento.button !== 0 || evento.target.closest('.fl-handle, .fl-node-bar')) return;
    const inicio = { x: evento.clientX, y: evento.clientY };
    const nodo = disposicion.nodos[paso.id];
    let movido = false;
    let cancelado = false;
    const calcular = ev => {
      const { disposicion: disp, pasos: lista } = vivo.current;
      const punto = posicionEnLienzo(ev);
      const carril = Math.max(0, Math.min(disp.carriles.length - 1, Math.floor(punto.x / disp.columna)));
      return { id: paso.id, x: nodo.x + (ev.clientX - inicio.x), y: nodo.y + (ev.clientY - inicio.y), carril, fila: destinoDeFila(punto.y, lista.length) };
    };
    const mover = ev => {
      if (!movido && Math.hypot(ev.clientX - inicio.x, ev.clientY - inicio.y) < UMBRAL_ARRASTRE) return;
      movido = true;
      setArrastre(calcular(ev));
    };
    const teclado = ev => { if (ev.key === 'Escape') { cancelado = true; terminar(); } };
    const soltar = ev => {
      const destino = movido && !cancelado ? calcular(ev) : null;
      terminar();
      if (!movido) { vivo.current.seleccionar(paso.id); return; }
      if (destino) {
        const { disposicion: disp } = vivo.current;
        const carril = disp.carriles[destino.carril];
        vivo.current.acciones.mover(paso.id, { fila: destino.fila, responsable: carril === SIN_RESPONSABLE ? '' : carril });
        vivo.current.seleccionar(paso.id);
      }
    };
    function terminar() {
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltar);
      window.removeEventListener('keydown', teclado);
      setArrastre(null);
    }
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
    window.addEventListener('keydown', teclado);
  };

  /* Acomodar una flecha: arrastrarla con el ratón cambia su recorrido (tramo, desvío o canal). */
  const iniciarAjusteFlecha = (evento, trazo) => {
    if (!interactivo || evento.button !== 0) return;
    evento.stopPropagation();
    const inicio = { x: evento.clientX, y: evento.clientY };
    let movido = false;
    let ultima = null;
    const calcular = ev => {
      const punto = posicionEnLienzo(ev);
      const { disposicion: disp } = vivo.current;
      if (trazo.clase === 'codo') return { t: Math.max(0.12, Math.min(0.88, (punto.y - trazo.y1) / (trazo.y2 - trazo.y1))) };
      if (trazo.clase === 'recto') { const dx = Math.round(punto.x - trazo.ax); return Math.abs(dx) < 14 ? null : { dx }; }
      return { xr: Math.max(8, Math.min(disp.anchoCarriles + 46, punto.x)) / ancho };
    };
    const mover = ev => {
      if (!movido && Math.hypot(ev.clientX - inicio.x, ev.clientY - inicio.y) < UMBRAL_ARRASTRE) return;
      movido = true;
      ultima = calcular(ev);
      setAjuste({ desde: trazo.desde, tipo: trazo.tipo, ruta: ultima });
    };
    const teclado = ev => { if (ev.key === 'Escape') { movido = false; terminar(); } };
    const soltar = () => {
      terminar();
      if (!movido) { vivo.current.seleccionar(null); setAristaSel(trazo.clave); return; }
      vivo.current.acciones.ajustarRuta(trazo.desde, trazo.tipo, ultima);
      setAristaSel(trazo.clave);
    };
    function terminar() {
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltar);
      window.removeEventListener('keydown', teclado);
      setAjuste(null);
    }
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
    window.addEventListener('keydown', teclado);
  };

  /* Conectar: arrastrar desde el asa de un paso hasta otro paso. */
  const iniciarConexion = (evento, paso, tipo) => {
    if (!interactivo || evento.button !== 0) return;
    evento.stopPropagation();
    evento.preventDefault();
    const nodo = disposicion.nodos[paso.id];
    const origen = anclaje(nodo, tipo, paso.tipo === 'Decisión');
    const buscar = punto => {
      const { disposicion: disp, pasos: lista } = vivo.current;
      return lista.find(otro => {
        const n = disp.nodos[otro.id];
        return otro.id !== paso.id && Math.abs(punto.x - n.x) <= n.w / 2 && Math.abs(punto.y - n.y) <= n.h / 2;
      })?.id || null;
    };
    const mover = ev => { const punto = posicionEnLienzo(ev); setConexion({ desde: paso.id, tipo, origen, x: punto.x, y: punto.y, destino: buscar(punto) }); };
    const soltar = ev => {
      const destino = buscar(posicionEnLienzo(ev));
      terminar();
      if (destino) { vivo.current.acciones.conectar(paso.id, destino, tipo); vivo.current.seleccionar(paso.id); }
    };
    const teclado = ev => { if (ev.key === 'Escape') terminar(); };
    function terminar() {
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', soltar);
      window.removeEventListener('keydown', teclado);
      setConexion(null);
    }
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
    window.addEventListener('keydown', teclado);
    mover(evento);
  };

  const trazoSel = disposicion?.trazos.find(trazo => trazo.clave === aristaSel);
  const nodoSel = interactivo && disposicion && seleccionado && !arrastre ? disposicion.nodos[seleccionado] : null;
  const pasoSel = pasos.find(paso => paso.id === seleccionado);

  return <div className={`fl-diagram${interactivo ? ' interactivo' : ''}`} ref={ref}>
    {disposicion && <>
      <div className="fl-lanes-head" style={{ width: disposicion.anchoCarriles, gridTemplateColumns: `repeat(${disposicion.carriles.length}, minmax(0, 1fr))` }}>
        {disposicion.carriles.map((carril, i) => <span key={carril} className={`${carril === SIN_RESPONSABLE ? 'empty' : ''}${arrastre?.carril === i ? ' target' : ''}`}>{carril}</span>)}
      </div>
      <div className="fl-canvas" ref={lienzoRef} style={{ height: disposicion.alto }} onPointerDown={evento => { if (interactivo && evento.target === evento.currentTarget) { seleccionar(null); } }}>
        {disposicion.carriles.map((carril, i) => <div key={carril} className={`fl-lane${i % 2 ? ' alt' : ''}${arrastre?.carril === i ? ' target' : ''}`} style={{ left: disposicion.columna * i, width: disposicion.columna }}/>)}
        {arrastre && <div className="fl-drop-row" style={{ top: DESPLAZAMIENTO + ALTO_FILA * arrastre.fila, height: ALTO_FILA, width: disposicion.anchoCarriles }}><span>Fila {arrastre.fila + 1}</span></div>}

        <svg className="fl-edges" width={ancho} height={disposicion.alto} aria-hidden="true">
          <defs>{Object.entries(COLORES).map(([tipo, color]) => <marker key={tipo} id={`fl-flecha-${tipo}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill={color}/></marker>)}</defs>
          {disposicion.trazos.map(trazo => <g key={trazo.clave} className={aristaSel === trazo.clave ? 'fl-edge selected' : 'fl-edge'}>
            <path d={trazo.d} fill="none" stroke={COLORES[trazo.tipo]} strokeWidth={aristaSel === trazo.clave ? 3.4 : 2} strokeLinejoin="round" strokeDasharray={trazo.tipo === 'no' ? '6 4' : undefined} markerEnd={`url(#fl-flecha-${trazo.tipo})`}/>
            {trazo.tipo !== 'flujo' && <text x={trazo.etiqueta.x} y={trazo.etiqueta.y} fill={COLORES[trazo.tipo]} fontSize="10.5" fontWeight="800" textAnchor={trazo.etiqueta.ancla}>{trazo.texto}</text>}
            {interactivo && <path className="fl-edge-hit" d={trazo.d} fill="none" stroke="transparent" strokeWidth="22" pointerEvents="stroke" onPointerDown={evento => iniciarAjusteFlecha(evento, trazo)}><title>Arrastra para acomodar la flecha · clic para editarla</title></path>}
          </g>)}
          {conexion && <path d={`M ${conexion.origen.x} ${conexion.origen.y} L ${conexion.x} ${conexion.y}`} fill="none" stroke={COLORES[conexion.tipo]} strokeWidth="2.4" strokeDasharray="5 4" markerEnd={`url(#fl-flecha-${conexion.tipo})`}/>}
        </svg>

        {pasos.map(paso => {
          const nodo = disposicion.nodos[paso.id];
          const forma = formaDe(paso.tipo);
          const arrastrando = arrastre?.id === paso.id;
          const centro = arrastrando ? { x: arrastre.x, y: arrastre.y } : { x: nodo.x, y: nodo.y };
          const evidenciasPaso = evidencias[paso.id] || 0;
          const esFinal = paso.tipo === 'Inicio / fin' && paso.orden > 1;
          const contenido = <>
            {forma === 'decision' && <svg className="fl-diamond" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="50,2 98,50 50,98 2,50"/></svg>}
            <small>Paso {paso.orden}{paso.tiempo ? <><Clock size={10}/>{paso.tiempo} min</> : null}</small>
            <strong>{paso.actividad?.trim() || (forma === 'decision' ? '¿Condición?' : 'Sin nombre')}</strong>
            {paso.critico && <AlertTriangle className="fl-node-flag" size={14} aria-label="Punto crítico"/>}
            {evidenciasPaso > 0 && <span className="fl-node-evid" title={`${evidenciasPaso} evidencia(s) adjunta(s)`}><Paperclip size={10}/>{evidenciasPaso}</span>}
            {interactivo && !esFinal && (forma === 'decision'
              ? <>
                <span className="fl-handle si" title="Arrastra hasta otro paso para la salida «Sí»" onPointerDown={e => iniciarConexion(e, paso, 'si')}/>
                <span className="fl-handle no" title="Arrastra hasta otro paso para la salida «No»" onPointerDown={e => iniciarConexion(e, paso, 'no')}/>
              </>
              : <span className="fl-handle" title="Arrastra hasta otro paso para conectarlos" onPointerDown={e => iniciarConexion(e, paso, 'flujo')}/>)}
          </>;
          const clases = `fl-btn-node ${forma}${paso.critico ? ' critico' : ''}${seleccionado === paso.id ? ' selected' : ''}${arrastrando ? ' dragging' : ''}${conexion?.destino === paso.id ? ' drop' : ''}`;
          const estilo = { left: centro.x - nodo.w / 2, top: centro.y - nodo.h / 2, width: nodo.w, height: nodo.h };
          return interactivo
            ? <div key={paso.id} role="button" tabIndex={0} className={clases} style={estilo} title={paso.salida || paso.actividad || 'Arrastra para moverlo'}
              onPointerDown={evento => iniciarArrastre(evento, paso)} onDoubleClick={() => acciones.editar(paso.id)}
              onKeyDown={evento => { if (evento.key === 'Enter' || evento.key === ' ') { evento.preventDefault(); acciones.seleccionar(paso.id); } }}>{contenido}</div>
            : <div key={paso.id} className={clases} style={estilo}>{contenido}</div>;
        })}

        {nodoSel && pasoSel && <div className="fl-node-bar" role="toolbar" aria-label={`Acciones del paso ${pasoSel.orden}`}
          style={{ left: nodoSel.x, top: nodoSel.y - nodoSel.h / 2 - 34 }} onPointerDown={e => e.stopPropagation()}>
          <button type="button" className="fl-btn-bar" onClick={() => acciones.editar(pasoSel.id)} title="Editar paso" aria-label="Editar paso"><Pencil size={14}/></button>
          <button type="button" className="fl-btn-bar" onClick={() => acciones.agregarDebajo(pasoSel.id)} title="Añadir paso a continuación" aria-label="Añadir paso a continuación"><Plus size={14}/></button>
          <button type="button" className="fl-btn-bar" onClick={() => acciones.duplicar(pasoSel.id)} title="Duplicar paso" aria-label="Duplicar paso"><Copy size={14}/></button>
          <button type="button" className="fl-btn-bar danger" onClick={() => acciones.eliminar(pasoSel.id)} title="Eliminar paso" aria-label="Eliminar paso"><Trash2 size={14}/></button>
        </div>}

        {interactivo && trazoSel && <span className="fl-edge-grip" style={{ left: trazoSel.medio.x, top: trazoSel.medio.y }} onPointerDown={evento => iniciarAjusteFlecha(evento, trazoSel)} title="Arrastra para acomodar la flecha"/>}
        {interactivo && trazoSel && <div className="fl-node-bar edge" role="toolbar" aria-label="Acciones de la flecha" style={{ left: trazoSel.medio.x, top: trazoSel.medio.y + 22 }} onPointerDown={e => e.stopPropagation()}>
          <button type="button" className="fl-btn-bar" onClick={() => { acciones.insertarEnConexion(trazoSel.desde, trazoSel.hasta, trazoSel.tipo); setAristaSel(null); }} title="Insertar un paso en medio de esta flecha" aria-label="Insertar paso en la flecha"><ListPlus size={14}/></button>
          {trazoSel.personalizada && <button type="button" className="fl-btn-bar" onClick={() => { acciones.ajustarRuta(trazoSel.desde, trazoSel.tipo, null); }} title="Restablecer el recorrido automático" aria-label="Restablecer recorrido"><RotateCcw size={14}/></button>}
          <button type="button" className="fl-btn-bar danger" onClick={() => { acciones.quitarConexion(trazoSel.desde, trazoSel.tipo); setAristaSel(null); }} title="Quitar esta conexión" aria-label="Quitar conexión"><Link2Off size={14}/></button>
        </div>}
      </div>
    </>}
  </div>;
}
