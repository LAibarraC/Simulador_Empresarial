import { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css"; // Importante: Estilos CSS de KaTeX

export default function Latex({ formula, inline = true }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(formula, containerRef.current, {
          throwOnError: false,
          displayMode: !inline, // false = en línea con texto, true = bloque centrado
        });
      } catch (error) {
        console.error("Error renderizando KaTeX:", error);
      }
    }
  }, [formula, inline]);

  // Usamos un span para inline o div para bloque
  return <span ref={containerRef} />;
}