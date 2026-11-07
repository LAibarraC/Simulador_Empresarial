import { useState, useCallback, useRef } from "react";
import { api } from "../../../services/api";
import {
  obtenerFuenteHistorialMAT251, compactarRecetaMAT251, empaquetarRecetaMAT251,
  validarRecetaGuardableMAT251,
} from './historialMAT251';
import { alerta } from "../../../utils/Notificaciones";

export function useHistorialMAT251({ usuario, selectedFile }) {
  const [guardando, setGuardando] = useState(false);

  const guardandoRef = useRef(false);
  const guardarCalculoMAT251 = useCallback(async (datosCalculo, registroId = null) => {
    if (guardandoRef.current) return false;

    try {
      const operacion = String(datosCalculo?.operacion || '').toLowerCase();
      if (operacion === 'hipotesis_noparametricas' && datosCalculo.modoHNP === 'simulacion') {
        alerta.advertencia('Historial no disponible', 'Las simulaciones de hipótesis no paramétricas no se guardan en el historial.');
        return false;
      }
      if (operacion === 'hipotesis_parametricas' && datosCalculo.modoHP === 'simulacion') {
        alerta.advertencia('Historial no disponible', 'Las simulaciones de hipótesis paramétricas no se guardan en el historial.');
        return false;
      }
      const esSimulacionEstimacion = (operacion === 'estimacion_puntual' && datosCalculo.modoEstimacion === 'simulacion')
        || (operacion === 'estimacion_intervalos' && datosCalculo.modoIntervalos === 'simulacion');
      if (esSimulacionEstimacion) {
        alerta.advertencia('Historial no disponible', 'Las simulaciones de estimación no se guardan en el historial.');
        return false;
      }
      if (!validarRecetaGuardableMAT251(datosCalculo)) {
        alerta.advertencia(
          "Sin cálculo activo",
          "Calcula con los parámetros actuales antes de guardar. Si modificaste los datos, vuelve a calcular."
        );
        return false;
      }

      guardandoRef.current = true;
      setGuardando(true);
      const receta = compactarRecetaMAT251(empaquetarRecetaMAT251(datosCalculo));

      const nombreUsuario = usuario?.nombre || "Usuario";
      const calculo = datosCalculo.operacion || "MAT251_Calculo";

      // Un cálculo de matriz sin archivo sigue siendo de matriz.
      const archivoOrigen = obtenerFuenteHistorialMAT251(receta);

      const actualizando = registroId !== null;
      const res = actualizando
        ? await api.actualizarHistorial(registroId, {
            autor: nombreUsuario,
            calculo,
            archivo_origen: archivoOrigen,
            snapshot: receta,
            modulo: "MAT251",
          })
        : await api.guardarEnHistorial(nombreUsuario, calculo, archivoOrigen, receta, "MAT251");

      alerta.exito(
        actualizando ? "Historial actualizado" : "¡Historial Guardado!",
        actualizando ? "Los cambios se guardaron en el mismo registro." : "La configuración de tu cálculo se guardó exitosamente."
      );
      return res;
    } catch (error) {
      console.error("Error al guardar en historial MAT251:", error);
      alerta.error("Error al guardar", error.message || "No se pudo guardar el registro.");
      return false;
    } finally {
      guardandoRef.current = false;
      setGuardando(false);
    }
  }, [usuario, selectedFile]);

  return {
    guardando,
    guardarCalculoMAT251,
  };
}
