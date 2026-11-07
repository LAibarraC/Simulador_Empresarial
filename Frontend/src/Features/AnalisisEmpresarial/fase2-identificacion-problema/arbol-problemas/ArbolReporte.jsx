import { useLayoutEffect, useRef, useState } from 'react';
import { AlertOctagon, Leaf, Shovel, Sprout } from 'lucide-react';

const ANCHO = 1200;
const DIMENSIONES_INICIALES = { alto: 900, copa: 340, troncoArriba: 360, troncoAbajo: 580, suelo: 620 };

/** Ilustración de fondo: follaje, tronco, suelo y raíces (misma del Árbol de problemas). */
function FondoArbol({ dims }) {
  const { alto: ALTO, copa: COPA, troncoArriba: TRONCO_ARRIBA, troncoAbajo: TRONCO_ABAJO, suelo: SUELO } = dims;
  const profundidad = Math.max(ALTO - SUELO, 300);
  const gy = SUELO;
  const ch = Math.max(COPA, 220);
  const midY = ch * 0.48;
  const spreadY = ch * 0.28;
  const ry = Math.max(130, ch * 0.38);
  const medio = (TRONCO_ARRIBA + TRONCO_ABAJO) / 2;
  return <div className="r5-arbol-bg" aria-hidden="true">
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="r5Foliage" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.65"/><stop offset="30%" stopColor="#10b981" stopOpacity="0.55"/>
          <stop offset="70%" stopColor="#059669" stopOpacity="0.65"/><stop offset="100%" stopColor="#047857" stopOpacity="0.75"/>
        </linearGradient>
        <linearGradient id="r5Bark" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#78350f" stopOpacity="0.85"/><stop offset="25%" stopColor="#92400e" stopOpacity="0.75"/>
          <stop offset="50%" stopColor="#d97706" stopOpacity="0.95"/><stop offset="75%" stopColor="#92400e" stopOpacity="0.75"/><stop offset="100%" stopColor="#78350f" stopOpacity="0.85"/>
        </linearGradient>
        <linearGradient id="r5Roots" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d97706" stopOpacity="0.90"/><stop offset="40%" stopColor="#92400e" stopOpacity="0.95"/><stop offset="100%" stopColor="#451a03" stopOpacity="1"/>
        </linearGradient>
        <linearGradient id="r5Soil" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#15803d" stopOpacity="0.30"/><stop offset="8%" stopColor="#78350f" stopOpacity="0.25"/><stop offset="100%" stopColor="#451a03" stopOpacity="0.55"/>
        </linearGradient>
      </defs>
      <path d={`M 0,${gy} Q 300,${gy - 10} 600,${gy - 5} Q 900,${gy} 1200,${gy - 10} L 1200,${ALTO} L 0,${ALTO} Z`} fill="url(#r5Soil)"/>
      <path d={`M 0,${gy - 5} Q 250,${gy - 15} 500,${gy - 8} Q 600,${gy - 4} 700,${gy - 8} Q 950,${gy - 15} 1200,${gy - 5} L 1200,${gy + 8} Q 600,${gy + 12} 0,${gy + 8} Z`} fill="#22c55e" fillOpacity="0.35"/>
      <path d={`M 500,${gy} Q 530,${TRONCO_ABAJO} 535,${medio} Q 538,${TRONCO_ARRIBA + 20} 520,${ch + 20} Q 450,${ch - 10} 350,${ch - 40} L 380,${ch - 65} Q 490,${ch - 25} 565,${ch + 10} Q 590,${ch - 40} 600,${ch - 80} Q 610,${ch - 40} 635,${ch + 10} Q 710,${ch - 25} 820,${ch - 65} L 850,${ch - 40} Q 750,${ch - 10} 680,${ch + 20} Q 662,${TRONCO_ARRIBA + 20} 665,${medio} Q 670,${TRONCO_ABAJO} 700,${gy} Z`}
        fill="url(#r5Bark)" stroke="#78350f" strokeWidth="4" strokeOpacity="0.6"/>
      <path d={`M 560,${ch + 30} Q 570,${medio} 568,${gy - 60} Q 565,${gy - 20} 550,${gy}`} stroke="#d97706" strokeWidth="3" strokeOpacity="0.65" fill="none" strokeDasharray="6,4"/>
      <path d={`M 640,${ch + 30} Q 630,${medio} 632,${gy - 60} Q 635,${gy - 20} 650,${gy}`} stroke="#d97706" strokeWidth="3" strokeOpacity="0.65" fill="none" strokeDasharray="6,4"/>
      <path d={`M 600,${ch + 10} Q 598,${medio} 600,${gy - 60} Q 602,${gy - 20} 600,${gy}`} stroke="#92400e" strokeWidth="3" strokeOpacity="0.55" fill="none"/>
      <g stroke="url(#r5Roots)" fill="none" strokeLinecap="round">
        <path d={`M 600,${gy} Q 595,${gy + profundidad * 0.25} 600,${gy + profundidad * 0.5} Q 605,${gy + profundidad * 0.7} 585,${gy + profundidad * 0.92}`} strokeWidth="14"/>
        <path d={`M 600,${gy + profundidad * 0.4} Q 635,${gy + profundidad * 0.6} 660,${gy + profundidad * 0.82}`} strokeWidth="9"/>
        <path d={`M 535,${gy} Q 430,${gy + profundidad * 0.08} 320,${gy + profundidad * 0.18} Q 210,${gy + profundidad * 0.3} 120,${gy + profundidad * 0.45}`} strokeWidth="12"/>
        <path d={`M 410,${gy + profundidad * 0.1} Q 350,${gy + profundidad * 0.25} 270,${gy + profundidad * 0.45} Q 210,${gy + profundidad * 0.65} 160,${gy + profundidad * 0.85}`} strokeWidth="9"/>
        <path d={`M 470,${gy + profundidad * 0.05} Q 400,${gy + profundidad * 0.2} 380,${gy + profundidad * 0.45} Q 365,${gy + profundidad * 0.68} 330,${gy + profundidad * 0.92}`} strokeWidth="8"/>
        <path d={`M 665,${gy} Q 770,${gy + profundidad * 0.08} 880,${gy + profundidad * 0.18} Q 990,${gy + profundidad * 0.3} 1080,${gy + profundidad * 0.45}`} strokeWidth="12"/>
        <path d={`M 790,${gy + profundidad * 0.1} Q 850,${gy + profundidad * 0.25} 930,${gy + profundidad * 0.45} Q 990,${gy + profundidad * 0.65} 1040,${gy + profundidad * 0.85}`} strokeWidth="9"/>
        <path d={`M 730,${gy + profundidad * 0.05} Q 800,${gy + profundidad * 0.2} 820,${gy + profundidad * 0.45} Q 835,${gy + profundidad * 0.68} 870,${gy + profundidad * 0.92}`} strokeWidth="8"/>
      </g>
      <g fill="url(#r5Foliage)" stroke="#059669" strokeWidth="2.5" strokeOpacity="0.4">
        <ellipse cx="600" cy={midY - spreadY * 0.5} rx="260" ry={ry * 0.95}/><ellipse cx="600" cy={midY + spreadY * 0.4} rx="240" ry={ry * 0.9}/>
        <ellipse cx="440" cy={midY - spreadY * 0.4} rx="210" ry={ry * 0.88}/><ellipse cx="760" cy={midY - spreadY * 0.4} rx="210" ry={ry * 0.88}/>
        <ellipse cx="290" cy={midY} rx="180" ry={ry * 0.82}/><ellipse cx="910" cy={midY} rx="180" ry={ry * 0.82}/>
        <ellipse cx="170" cy={midY + spreadY * 0.3} rx="150" ry={ry * 0.75}/><ellipse cx="1030" cy={midY + spreadY * 0.3} rx="150" ry={ry * 0.75}/>
        <ellipse cx="370" cy={midY + spreadY * 0.5} rx="190" ry={ry * 0.82}/><ellipse cx="830" cy={midY + spreadY * 0.5} rx="190" ry={ry * 0.82}/>
      </g>
    </svg>
  </div>;
}

/** Rama o canal: grupo de nodos (efectos en la copa, causas en las raíces). */
function Rama({ titulo, items, tipo, directo }) {
  return <div className={`r5-bough ${tipo} ${directo ? 'direct' : 'indirect'}`}>
    <span className="r5-bough-title">{titulo}<b>{items.length}</b></span>
    <div className="r5-bough-nodes">
      {items.length ? items.map(item => <span key={item.id} className="r5-bough-node" title={item.categoria}>{item.titulo}{item.categoria && <em>{item.categoria}</em>}</span>)
        : <span className="r5-bough-node vacio">Sin registros</span>}
    </div>
  </div>;
}

/** Árbol de problemas con el mismo fondo ilustrado y estilos de la herramienta de la Fase 2. La copa, el tronco y las raíces crecen según su contenido. */
export default function ArbolReporte({ arbol }) {
  const contenedor = useRef(null);
  const copa = useRef(null);
  const tronco = useRef(null);
  const raices = useRef(null);
  const [dims, setDims] = useState(DIMENSIONES_INICIALES);

  useLayoutEffect(() => {
    const medir = () => {
      const c = contenedor.current?.getBoundingClientRect();
      if (!c || !c.width || !c.height) return;
      const escala = ANCHO / c.width;
      const rc = copa.current?.getBoundingClientRect();
      const rt = tronco.current?.getBoundingClientRect();
      const rr = raices.current?.getBoundingClientRect();
      const copaAbajo = rc ? Math.max((rc.bottom - c.top) * escala + 10, 220) : 340;
      const troncoArriba = rt ? (rt.top - c.top) * escala : copaAbajo + 25;
      const troncoAbajo = rt ? (rt.bottom - c.top) * escala : troncoArriba + 200;
      const suelo = rr ? Math.max((rr.top - c.top) * escala, troncoAbajo + 20) : troncoAbajo + 30;
      setDims(previo => {
        const nuevo = { alto: c.height * escala, copa: copaAbajo, troncoArriba, troncoAbajo, suelo };
        return Object.keys(nuevo).every(clave => Math.abs(nuevo[clave] - previo[clave]) < 1) ? previo : nuevo;
      });
    };
    medir();
    const observador = new ResizeObserver(medir);
    [contenedor, copa, tronco, raices].forEach(ref => { if (ref.current) observador.observe(ref.current); });
    return () => observador.disconnect();
  }, [arbol]);

  return <div className="r5-arbol" ref={contenedor}>
    <FondoArbol dims={dims}/>
    <section className="r5-arbol-zone" ref={copa}>
      <span className="r5-zone-pill canopy"><Leaf size={13}/> Copa · Efectos</span>
      <div className="r5-arbol-grid">
        <Rama titulo="Efectos indirectos" items={arbol.efectosIndirectos} tipo="efecto"/>
        <Rama titulo="Efectos directos" items={arbol.efectosDirectos} tipo="efecto" directo/>
      </div>
    </section>
    <section className="r5-arbol-zone trunk" ref={tronco}>
      <span className="r5-zone-pill trunk"><Sprout size={13}/> Tronco · Problema central</span>
      <div className={`r5-arbol-core${arbol.problema.titulo ? '' : ' vacio'}`}>
        <small><AlertOctagon size={13}/> Problema central</small>
        <strong>{arbol.problema.titulo || 'Aún no formulado'}</strong>
        {arbol.problema.categoria && <em>{arbol.problema.categoria}</em>}
      </div>
    </section>
    <section className="r5-arbol-zone" ref={raices}>
      <span className="r5-zone-pill roots"><Shovel size={13}/> Raíces · Causas</span>
      <div className="r5-arbol-grid">
        <Rama titulo="Causas directas" items={arbol.causasDirectas} tipo="causa" directo/>
        <Rama titulo="Causas indirectas" items={arbol.causasIndirectas} tipo="causa"/>
      </div>
    </section>
  </div>;
}
