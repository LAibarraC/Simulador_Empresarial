import { useState, useEffect, useRef } from "react";
import "./SelectorDatos.css";

export default function SelectorDatos({ id, value, onChange, options, disabled, placeholder }) {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef(null);
  const boton = useRef(null);
  const lista = useRef(null);
  const seleccionada = options.find((opcion) => opcion.value === String(value));

  useEffect(() => {
    if (!abierto) return;
    const cerrarFuera = (event) => {
      if (!contenedor.current?.contains(event.target)) setAbierto(false);
    };
    document.addEventListener("pointerdown", cerrarFuera);
    return () => document.removeEventListener("pointerdown", cerrarFuera);
  }, [abierto]);

  useEffect(() => {
    if (disabled) setAbierto(false);
  }, [disabled]);

  useEffect(() => {
    if (abierto) {
      const opciones = lista.current?.querySelectorAll('[role="option"]');
      const indice = options.findIndex((opcion) => opcion.value === String(value));
      opciones?.[Math.max(0, indice)]?.focus();
    }
  }, [abierto]);

  const elegir = (nuevoValor) => {
    onChange(nuevoValor);
    setAbierto(false);
    boton.current?.focus();
  };

  const manejarTeclado = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setAbierto(false);
      boton.current?.focus();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) || disabled) return;
    event.preventDefault();
    if (!abierto) {
      setAbierto(true);
      return;
    }
    const opciones = Array.from(lista.current?.querySelectorAll('[role="option"]') || []);
    const actual = opciones.indexOf(document.activeElement);
    let siguiente = event.key === "ArrowUp" ? actual - 1 : actual + 1;
    if (event.key === "Home") siguiente = 0;
    if (event.key === "End") siguiente = opciones.length - 1;
    opciones[(siguiente + opciones.length) % opciones.length]?.focus();
  };

  return (
    <div ref={contenedor} className="datos-select-container" onKeyDown={manejarTeclado}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setAbierto(false);
      }}>
      <button ref={boton} id={id} type="button" disabled={disabled}
        className={`btn-datos-select-header ${abierto ? "open" : ""}`}
        aria-haspopup="listbox" aria-expanded={abierto} aria-controls={`${id}-opciones`}
        onClick={() => setAbierto(!abierto)}>
        <span className="datos-select-text">{seleccionada?.label || placeholder}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`datos-select-chevron ${abierto ? "open" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {abierto && !disabled && (
        <div ref={lista} id={`${id}-opciones`} role="listbox" aria-labelledby={id}
          className="datos-select-dropdown">
          {options.map((opcion) => (
            <button key={opcion.value} type="button" role="option" tabIndex={-1}
              aria-selected={opcion.value === String(value)}
              className={`btn-datos-select-option ${opcion.value === String(value) ? "selected" : ""}`}
              onClick={() => elegir(opcion.value)}>
              {opcion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

