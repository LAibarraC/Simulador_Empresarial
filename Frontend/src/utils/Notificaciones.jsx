import { sileo, Toaster } from "sileo";
import { confirmarComoPromise } from "./ConfirmHost";


const estilosExito = { title: "toast-titulo-exito", description: "toast-descripcion" };
const estilosError = { title: "toast-titulo-error", description: "toast-descripcion" };
const estilosAdvertencia = { title: "toast-titulo-advertencia", description: "toast-descripcion" };
const estilosInfo = { title: "toast-titulo-info", description: "toast-descripcion" };

export const alerta = {
  exito: (titulo, descripcion) => {
    sileo.success({
      title: titulo,
      description: descripcion,
      fill: "#171717",
      styles: estilosExito
    });
  },
  error: (titulo, descripcion) => {
    sileo.error({
      title: titulo,
      description: descripcion,
      fill: "#171717",
      styles: estilosError
    });
  },
  advertencia: (titulo, descripcion) => {
    sileo.warning({
      title: titulo,
      description: descripcion,
      fill: "#171717",
      styles: estilosAdvertencia
    });
  },
  warning: (titulo, descripcion) => {
    sileo.warning({
      title: titulo,
      description: descripcion,
      fill: "#171717",
      styles: estilosAdvertencia
    });
  },
  success: (titulo, descripcion) => {
    sileo.success({
      title: titulo,
      description: descripcion,
      fill: "#171717",
      styles: estilosExito
    });
  },
  info: (titulo, descripcion) => {
    if (sileo && typeof sileo.info === 'function') {
      sileo.info({
        title: titulo,
        description: descripcion,
        fill: "#171717",
        styles: estilosInfo
      });
    } else if (sileo && typeof sileo.show === 'function') {
      sileo.show({
        title: titulo,
        description: descripcion,
        fill: "#171717",
        styles: estilosInfo
      });
    } else {
      sileo.success({
        title: titulo,
        description: descripcion,
        fill: "#171717",
        styles: estilosInfo
      });
    }
  },
  /**
   * Muestra un modal de confirmación con el mismo diseño de la app y devuelve
   * una promesa que se resuelve con `true` si el usuario confirma o `false` si
   * cancela. Reemplaza a `window.confirm` para mantener la coherencia visual.
   *
   * @param {object} opciones
   * @param {string} opciones.titulo
   * @param {string} opciones.mensaje
   * @param {string} [opciones.textoConfirmar="Confirmar"]
   * @param {string} [opciones.textoCancelar="Cancelar"]
   * @param {"danger"|"primary"} [opciones.variant="danger"]
   * @returns {Promise<boolean>}
   */
  confirmar: (opciones) => confirmarComoPromise(opciones),
};

