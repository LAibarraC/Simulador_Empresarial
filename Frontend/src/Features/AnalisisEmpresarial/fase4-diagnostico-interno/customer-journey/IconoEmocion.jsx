import { obtenerEmocion } from './calculosJourney';

const RASGO = '#3b1f0e';
const MEJILLA = '#ffffff';

/* Rasgos dibujados sobre una cara de 24×24 (ojos, cejas y boca según la emoción 1–5). */
function Rasgos({ valor }) {
  const trazo = { fill: 'none', stroke: RASGO, strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (valor) {
    case 1: return <>
      <path d="M6.4 7.6 L10.2 9.3 M17.6 7.6 L13.8 9.3" {...trazo} strokeWidth="1.8"/>
      <circle cx="8.9" cy="11.3" r="1.25" fill={RASGO}/><circle cx="15.1" cy="11.3" r="1.25" fill={RASGO}/>
      <path d="M7.8 17.6 Q12 13.6 16.2 17.6" {...trazo} strokeWidth="1.8"/>
    </>;
    case 2: return <>
      <path d="M6.9 8.4 Q8.6 7.6 10.2 8.2 M13.8 8.2 Q15.4 7.6 17.1 8.4" {...trazo} strokeWidth="1.3"/>
      <ellipse cx="8.9" cy="10.9" rx="1.15" ry="1.45" fill={RASGO}/><ellipse cx="15.1" cy="10.9" rx="1.15" ry="1.45" fill={RASGO}/>
      <path d="M8.6 16.6 Q12 14.4 15.4 16.6" {...trazo}/>
    </>;
    case 3: return <>
      <circle cx="8.9" cy="10.4" r="1.3" fill={RASGO}/><circle cx="15.1" cy="10.4" r="1.3" fill={RASGO}/>
      <path d="M8.6 15.6 L15.4 15.6" {...trazo}/>
    </>;
    case 4: return <>
      <circle cx="8.9" cy="10.2" r="1.3" fill={RASGO}/><circle cx="15.1" cy="10.2" r="1.3" fill={RASGO}/>
      <circle cx="6.4" cy="13.6" r="1.5" fill={MEJILLA} opacity=".35"/><circle cx="17.6" cy="13.6" r="1.5" fill={MEJILLA} opacity=".35"/>
      <path d="M8 14.2 Q12 18.4 16 14.2" {...trazo}/>
    </>;
    case 5: return <>
      <path d="M7.1 10.6 Q8.9 8.4 10.7 10.6 M13.3 10.6 Q15.1 8.4 16.9 10.6" {...trazo}/>
      <circle cx="6.2" cy="13.4" r="1.5" fill={MEJILLA} opacity=".4"/><circle cx="17.8" cy="13.4" r="1.5" fill={MEJILLA} opacity=".4"/>
      <path d="M7.4 13.4 L16.6 13.4 Q16.2 18.8 12 18.8 Q7.8 18.8 7.4 13.4 Z" fill={RASGO}/>
      <path d="M9.6 17.6 Q12 15.9 14.4 17.6 Q13.4 18.6 12 18.6 Q10.6 18.6 9.6 17.6 Z" fill="#f87171"/>
    </>;
    default: return null;
  }
}

/**
 * Carita ilustrada de la escala emocional (SVG propio, se ve igual en pantalla y en el PDF).
 * Sin `valor` dibuja una cara vacía punteada con un signo de pregunta.
 */
export default function IconoEmocion({ valor, size = 24, className = '', titulo }) {
  const emocion = obtenerEmocion(valor);
  if (!emocion) {
    return <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10.4" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.4" strokeDasharray="2.6 2.2"/>
      <text x="12" y="16.2" textAnchor="middle" fontSize="11" fontWeight="800" fill="#94a3b8" fontFamily="Arial, sans-serif">?</text>
    </svg>;
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" className={className} role={titulo ? 'img' : undefined} aria-hidden={titulo ? undefined : 'true'} aria-label={titulo}>
    <circle cx="12" cy="12.5" r="11" fill="#000000" opacity=".12"/>
    <circle cx="12" cy="12" r="11" fill={emocion.color}/>
    <ellipse cx="9" cy="6.4" rx="5.2" ry="3" fill="#ffffff" opacity=".22"/>
    <circle cx="12" cy="12" r="10.4" fill="none" stroke="#ffffff" strokeOpacity=".35" strokeWidth="1.2"/>
    <Rasgos valor={emocion.valor}/>
  </svg>;
}
