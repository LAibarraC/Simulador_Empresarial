import { LOGOS_REDES } from './logosRedes';

/** Logotipo real de la red (glifo blanco sobre su color de marca). Para redes sin logo conocido muestra sus iniciales. */
export default function LogoRed({ marca, tamano = 38, className = '' }) {
  const logo = LOGOS_REDES[marca?.nombre];
  const estilo = { width: tamano, height: tamano, background: logo?.fondo || logo?.color || marca?.color || '#ea580c' };
  return <span className={`rd-logo ${className}`} style={estilo} role="img" aria-label={marca?.nombre || 'Canal'}>
    {logo
      ? <svg viewBox="0 0 24 24" width={tamano * 0.58} height={tamano * 0.58} aria-hidden="true"><path fill="#ffffff" d={logo.trazo}/></svg>
      : <b style={{ fontSize: tamano * 0.36 }}>{marca?.sigla}</b>}
  </span>;
}
