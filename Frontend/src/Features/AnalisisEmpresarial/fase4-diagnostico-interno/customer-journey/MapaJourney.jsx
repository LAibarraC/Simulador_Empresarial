import React, { useLayoutEffect, useRef, useState } from 'react';
import { AlertOctagon, HeartPulse, Lightbulb, MessageCircle, MousePointerClick, Radio } from 'lucide-react';
import { CARRILES, EMOCIONES, obtenerEmocion } from './calculosJourney';
import IconoEmocion from './IconoEmocion';

const ICONOS_CARRIL = { accion: MousePointerClick, contacto: Radio, pensamiento: MessageCircle, emocion: HeartPulse, dolor: AlertOctagon, oportunidad: Lightbulb };
const ALTO_CURVA = 176;
const RELLENO_SUP = 28;
const RELLENO_INF = 46;

function useAncho(ref, anchoFijo) {
  const [ancho, setAncho] = useState(anchoFijo || 0);
  useLayoutEffect(() => {
    if (anchoFijo || !ref.current) return undefined;
    setAncho(Math.round(ref.current.getBoundingClientRect().width));
    const observador = new ResizeObserver(([entrada]) => setAncho(Math.round(entrada.contentRect.width)));
    observador.observe(ref.current);
    return () => observador.disconnect();
  }, [ref, anchoFijo]);
  return ancho;
}

const posicionY = valor => RELLENO_SUP + ((5 - valor) / 4) * (ALTO_CURVA - RELLENO_SUP - RELLENO_INF);

/** Trazo suave (curvas cúbicas con tangentes horizontales) que se corta donde falta la emoción. */
function construirTrazos(puntos) {
  const tramos = [];
  let actual = [];
  puntos.forEach(punto => { if (punto) actual.push(punto); else if (actual.length) { tramos.push(actual); actual = []; } });
  if (actual.length) tramos.push(actual);
  return tramos.map(tramo => tramo.reduce((d, punto, i) => {
    if (i === 0) return `M ${punto.x} ${punto.y}`;
    const previo = tramo[i - 1];
    const control = (punto.x - previo.x) / 2;
    return `${d} C ${previo.x + control} ${previo.y}, ${punto.x - control} ${punto.y}, ${punto.x} ${punto.y}`;
  }, ''));
}

/** Curva emocional alineada con las columnas de etapas. */
function CurvaEmocional({ etapas, seleccionada, onSeleccionar, anchoFijo, color = '#ea580c' }) {
  const ref = useRef(null);
  const ancho = useAncho(ref, anchoFijo);
  const columna = etapas.length ? ancho / etapas.length : 0;
  const puntos = etapas.map((etapa, i) => (etapa.emocion ? { x: columna * (i + 0.5), y: posicionY(etapa.emocion), etapa } : null));
  const trazos = construirTrazos(puntos);
  const area = trazos.length === 1 && puntos.every(Boolean) && puntos.length > 1 ? `${trazos[0]} L ${puntos[puntos.length - 1].x} ${ALTO_CURVA} L ${puntos[0].x} ${ALTO_CURVA} Z` : null;

  return <div className="cjm-curve" ref={ref} style={{ height: ALTO_CURVA }}>
    {ancho > 0 && <svg width={ancho} height={ALTO_CURVA} viewBox={`0 0 ${ancho} ${ALTO_CURVA}`} aria-hidden="true">
      <defs>
        <linearGradient id="cjm-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity=".18"/><stop offset="55%" stopColor="#eab308" stopOpacity=".08"/><stop offset="100%" stopColor="#dc2626" stopOpacity=".02"/>
        </linearGradient>
      </defs>
      {EMOCIONES.map(item => <line key={item.valor} x1="0" x2={ancho} y1={posicionY(item.valor)} y2={posicionY(item.valor)} stroke={item.valor === 3 ? '#94a3b8' : '#cbd5e1'} strokeOpacity={item.valor === 3 ? 0.7 : 0.45} strokeDasharray={item.valor === 3 ? '0' : '3 5'}/>)}
      {etapas.map((etapa, i) => i > 0 && <line key={etapa.id} x1={columna * i} x2={columna * i} y1="6" y2={ALTO_CURVA - 6} stroke="#cbd5e1" strokeOpacity=".35"/>)}
      {area && <path d={area} fill="url(#cjm-area)"/>}
      {trazos.map((d, i) => <path key={i} d={d} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"/>)}
    </svg>}
    {puntos.map((punto, i) => {
      const etapa = etapas[i];
      const x = columna * (i + 0.5);
      if (!punto) {
        return <button type="button" key={etapa.id} className="cjm-btn-point empty" style={{ left: x, top: posicionY(3) }} onClick={onSeleccionar ? () => onSeleccionar(etapa.id) : undefined} tabIndex={onSeleccionar ? 0 : -1} title="Asignar emoción" aria-label={`Asignar emoción a ${etapa.nombre}`}>
          <IconoEmocion size={30}/>
          {onSeleccionar && <span className="cjm-point-label">Asignar</span>}
        </button>;
      }
      const emocion = obtenerEmocion(etapa.emocion);
      return <button type="button" key={etapa.id} className={`cjm-btn-point${seleccionada === etapa.id ? ' selected' : ''}`} style={{ left: x, top: punto.y, '--cjm-emo': emocion.color }}
        onClick={onSeleccionar ? () => onSeleccionar(etapa.id) : undefined} tabIndex={onSeleccionar ? 0 : -1} title={`${etapa.nombre}: ${emocion.nombre}`}>
        <IconoEmocion valor={etapa.emocion} size={38}/>
        <span className="cjm-point-label" style={{ color: emocion.color }}>{emocion.corto}</span>
      </button>;
    })}
  </div>;
}

function Celda({ etapa, children, className, seleccionada, onSeleccionar }) {
  if (!onSeleccionar) return <div className={`cjm-btn-cell ${className}`}>{children}</div>;
  return <button type="button" className={`cjm-btn-cell ${className}${seleccionada === etapa.id ? ' selected' : ''}`} onClick={() => onSeleccionar(etapa.id)}>{children}</button>;
}

function contenidoCelda(carril, etapa) {
  if (carril === 'contacto') {
    if (!etapa.canal && !etapa.contacto?.trim()) return null;
    return <>{etapa.canal && <span className="cjm-chip">{etapa.canal}</span>}{etapa.contacto?.trim() && <span>{etapa.contacto}</span>}</>;
  }
  if (carril === 'oportunidad') {
    if (!etapa.oportunidad?.trim()) return null;
    return <>{etapa.prioridad && <span className={`cjm-priority ${etapa.prioridad}`}>Prioridad {etapa.prioridad}</span>}<span>{etapa.oportunidad}</span></>;
  }
  return etapa[carril]?.trim() ? <span>{etapa[carril]}</span> : null;
}

/**
 * Tablero del journey: una columna por etapa y un carril por dimensión.
 * Con `onSeleccionar` las celdas son interactivas; sin él (PDF) es de solo lectura.
 */
export default function MapaJourney({ etapas, seleccionada, onSeleccionar, anchoCurva, color }) {
  const interactivo = Boolean(onSeleccionar);
  const props = { seleccionada, onSeleccionar };

  return <div className="cjm-board" style={{ '--cjm-cols': etapas.length }} role="table" aria-label="Mapa del recorrido del cliente">
    <div className="cjm-corner" role="columnheader"><span>Etapas</span></div>
    {etapas.map((etapa, i) => <Celda key={etapa.id} {...props} etapa={etapa} className={`cjm-stage${i === etapas.length - 1 ? ' last' : ''}`}>
      <span className="cjm-stage-num">{i + 1}</span>
      <strong>{etapa.nombre || `Etapa ${i + 1}`}</strong>
    </Celda>)}

    {CARRILES.map(carril => {
      const Icono = ICONOS_CARRIL[carril.id];
      return <React.Fragment key={carril.id}>
        <div className={`cjm-lane-label ${carril.id}`} role="rowheader"><Icono size={15}/><div><strong>{carril.nombre}</strong><small>{carril.ayuda}</small></div></div>
        {carril.id === 'emocion'
          ? <div className="cjm-emotion-lane"><CurvaEmocional etapas={etapas} seleccionada={seleccionada} onSeleccionar={onSeleccionar} anchoFijo={anchoCurva} color={color}/></div>
          : etapas.map(etapa => {
            const contenido = contenidoCelda(carril.id, etapa);
            return <Celda key={etapa.id} {...props} etapa={etapa} className={`cjm-cell ${carril.id}${contenido ? '' : ' empty'}`}>
              {contenido || <em>{interactivo ? '+ Completar' : '—'}</em>}
            </Celda>;
          })}
      </React.Fragment>;
    })}
  </div>;
}
