import { useEffect, useState } from "react";
import { api } from "../services/api";

// Lee tramas SSE incluso cuando una línea llega repartida en varios paquetes.
async function consumirEventos(respuesta, recibir, actividad) {
  const lector = respuesta.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let evento = "message";
  let datos = [];

  const procesarLinea = linea => {
    if (linea === "") {
      if (datos.length) recibir(evento, JSON.parse(datos.join("\n")));
      evento = "message";
      datos = [];
      return;
    }
    if (linea.startsWith(":")) return; // Latido de conexión, sin datos nuevos.
    const separador = linea.indexOf(":");
    const campo = separador < 0 ? linea : linea.slice(0, separador);
    let valor = separador < 0 ? "" : linea.slice(separador + 1);
    if (valor.startsWith(" ")) valor = valor.slice(1);
    if (campo === "event") evento = valor;
    if (campo === "data") datos.push(valor);
  };

  try {
    while (true) {
      const { done, value } = await lector.read();
      if (done) break;
      actividad();
      buffer += decoder.decode(value, { stream: true });
      let salto;
      while ((salto = buffer.indexOf("\n")) !== -1) {
        const linea = buffer.slice(0, salto).replace(/\r$/, "");
        buffer = buffer.slice(salto + 1);
        procesarLinea(linea);
      }
    }
  } finally {
    lector.releaseLock();
  }
}

export function useNotificaciones(usuario) {
  const [notificaciones, setNotificaciones] = useState([]);
  const identidad = usuario?.id ?? usuario?.email ?? usuario?.nombre ?? null;
  const token = identidad ? localStorage.getItem("token") : null;

  useEffect(() => {
    setNotificaciones([]);
    if (!identidad || !token) return;

    let cerrado = false;
    let sesionInvalida = false;
    let controlador = null;
    let temporizador = null;
    let reintentos = 0;

    const detener = () => {
      clearTimeout(temporizador);
      temporizador = null;
      controlador?.abort();
    };

    const conectar = async () => {
      temporizador = null;
      if (cerrado || sesionInvalida || document.hidden || navigator.onLine === false || controlador) return;
      const conexion = new AbortController();
      controlador = conexion;
      let vigilancia;
      const actividad = () => {
        clearTimeout(vigilancia);
        vigilancia = setTimeout(() => conexion.abort(), 60000);
      };

      try {
        actividad();
        const respuesta = await api.abrirFlujoNotificaciones({ token, signal: conexion.signal });
        if (cerrado || conexion.signal.aborted) return;
        if (respuesta.status === 401 || respuesta.status === 403) {
          sesionInvalida = true;
          setNotificaciones([]);
          return;
        }
        if (!respuesta.ok || !respuesta.body
            || !respuesta.headers.get("content-type")?.includes("text/event-stream")) {
          throw new Error("No se pudo abrir el flujo de notificaciones");
        }
        await consumirEventos(respuesta, (evento, datos) => {
          if (cerrado || conexion.signal.aborted) return;
          if (evento === "sesion_expirada") {
            sesionInvalida = true;
            setNotificaciones([]);
            conexion.abort();
          } else if (evento === "notificaciones" && Array.isArray(datos)) {
            reintentos = 0;
            setNotificaciones(datos);
          }
        }, actividad);
      } catch (error) {
        if (!cerrado && !conexion.signal.aborted && reintentos === 0) {
          console.warn("Se reconectará el flujo de notificaciones:", error);
        }
      } finally {
        clearTimeout(vigilancia);
        conexion.abort();
        if (controlador === conexion) controlador = null;
        if (!cerrado && !sesionInvalida && !document.hidden && navigator.onLine !== false) {
          const espera = Math.min(1000 * (2 ** Math.min(reintentos++, 5)), 30000);
          temporizador = setTimeout(conectar, espera + Math.random() * 1000);
        }
      }
    };

    const reanudar = () => {
      if (document.hidden || navigator.onLine === false) {
        detener();
      } else if (!controlador && !sesionInvalida) {
        clearTimeout(temporizador);
        reintentos = 0;
        conectar();
      }
    };
    const cambioToken = event => {
      if (event.key === "token" && event.newValue !== token) {
        sesionInvalida = true;
        detener();
        setNotificaciones([]);
      }
    };

    document.addEventListener("visibilitychange", reanudar);
    window.addEventListener("online", reanudar);
    window.addEventListener("offline", reanudar);
    window.addEventListener("storage", cambioToken);
    conectar();

    return () => {
      cerrado = true;
      detener();
      document.removeEventListener("visibilitychange", reanudar);
      window.removeEventListener("online", reanudar);
      window.removeEventListener("offline", reanudar);
      window.removeEventListener("storage", cambioToken);
    };
  }, [identidad, token]);

  return { notificaciones, setNotificaciones };
}
