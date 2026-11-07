import { useCallback, useContext } from 'react';
import { NotebookPen } from 'lucide-react';
import DocumentosRespaldo from './DocumentosRespaldo';
import { NotasConPlantilla } from '../ComponentesHerramienta';
import { useAccionesDocumentos } from './useDocumentosRespaldo';
import { CONFIG_RESPALDO, RESPALDO_VACIO, RespaldoHerramientas } from './configRespaldo';

/**
 * «Conclusión y propuesta de mejora» + «Documentación de respaldo», con el mismo estilo que la Matriz EFI.
 * Los datos los guarda el contenedor de la simulación (por herramienta) y viajan con el avance del caso.
 */
export default function RespaldoHerramienta({ id }) {
  const respaldo = useContext(RespaldoHerramientas);
  const config = CONFIG_RESPALDO[id];
  const datos = respaldo?.leer(id) || RESPALDO_VACIO;
  const actualizar = respaldo?.actualizar;
  const setDocumentos = useCallback(cambio => actualizar?.(id, previo => ({ ...previo, documentos: typeof cambio === 'function' ? cambio(previo.documentos) : cambio })), [actualizar, id]);
  const acciones = useAccionesDocumentos(datos.documentos, setDocumentos);
  if (!respaldo || !config) return null;

  return <div className="hf-container hf-solo respaldo-herramienta">
    <section className="cjm-card" aria-label="Conclusión de la herramienta">
      <h3 className="cjm-card-title"><NotebookPen size={16}/> Conclusión y propuesta de mejora</h3>
      <NotasConPlantilla id={`${id}-conclusiones`} titulo="Tu conclusión" valor={datos.conclusiones} onCambio={valor => actualizar(id, previo => ({ ...previo, conclusiones: valor }))} plantilla={config.plantilla} placeholder={config.placeholder}/>
    </section>
    <DocumentosRespaldo documentos={datos.documentos} acciones={acciones} ayuda={config.ayuda}/>
  </div>;
}
