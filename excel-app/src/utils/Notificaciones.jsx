import { sileo, Toaster } from "sileo";

const estilosBase = { title: "texto-blanco", description: "texto-gris" };
export const alerta = {
  exito: (titulo, descripcion) => {
    sileo.success({
      title: titulo,
      description: descripcion,
      fill: "#171717",
      styles: estilosBase
    });
  },
  error: (titulo, descripcion) => {
    sileo.error({
      title: titulo,
      description: descripcion,
      fill: "#474444",
      styles: estilosBase
    });
  },
  advertencia: (titulo, descripcion) => {
    sileo.warning({
      title: titulo,
      description: descripcion,
      fill: "#171717",
      styles: estilosBase
    });
  },
  warning: (titulo, descripcion) => {
    sileo.warning({
      title: titulo,
      description: descripcion,
      fill: "#171717",
      styles: estilosBase
    });
  },
  success: (titulo, descripcion) => {
    sileo.success({
      title: titulo,
      description: descripcion,
      fill: "#171717",
      styles: estilosBase
    });
  }
};