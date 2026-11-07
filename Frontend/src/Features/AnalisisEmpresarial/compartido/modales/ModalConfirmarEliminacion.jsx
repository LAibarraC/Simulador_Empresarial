import { AlertTriangle, Trash2 } from 'lucide-react';
import VentanaModal from './VentanaModal';

/**
 * Confirmación de eliminación: explica qué se borra (resumen en `detalle`) y qué se pierde.
 * `perdidas` es una lista de textos cortos que se muestran como viñetas.
 */
export default function ModalConfirmarEliminacion({ abierto, titulo, mensaje, detalle, perdidas = [], textoConfirmar = 'Eliminar', onConfirmar, onCerrar }) {
  if (!abierto) return null;
  return <VentanaModal abierto onCerrar={onCerrar} icono={Trash2} acento="#dc2626" ancho={440} tono="danger" titulo={titulo} subtitulo="Esta acción no se puede deshacer."
    pie={<>
      <button type="button" className="cjm-btn-outline" onClick={onCerrar}>Cancelar</button>
      <button type="button" className="cjm-btn-danger" onClick={onConfirmar}><Trash2 size={14}/> {textoConfirmar}</button>
    </>}>
    <div className="cjm-confirm">
      {detalle && <div className="cjm-confirm-target">{detalle}</div>}
      {mensaje && <p>{mensaje}</p>}
      {perdidas.length > 0 && <ul className="cjm-confirm-list">
        {perdidas.map(item => <li key={item}><AlertTriangle size={13}/>{item}</li>)}
      </ul>}
    </div>
  </VentanaModal>;
}
