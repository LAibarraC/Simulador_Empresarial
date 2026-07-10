import { useEffect } from "react";

import "../styles/utils/Modal.css";

export default function Modal({ isOpen, onClose, title, children}) {
    // Truco pro: Bloquear el scroll de la página de fondo cuando el modal se abre
    useEffect(() => {
        if (isOpen) {
            // Bloqueamos tanto el body como el html para asegurar que no haya scroll
            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";
        } else {
            // Restauramos cuando se cierra
            document.body.style.overflow = "auto";
            document.documentElement.style.overflow = ""; // Lo dejamos vacío para que tu CSS mande
        }

        // Limpieza al desmontar (si el usuario cambia de página de golpe)
        return () => {
            document.body.style.overflow = "auto";
            document.documentElement.style.overflow = "";
        };
    }, [isOpen]);

    // Si no está abierto, no renderiza absolutamente nada
    if (!isOpen) return null;

    return (
        <div
            // OVERLAY (El fondo oscuro)
            className="container_overlay"
            onClick={onClose} // Si haces clic afuera del cuadro, se cierra
        >
            <div
                // CONTENEDOR DEL MODAL (La caja blanca)
                className="container_modal"
                onClick={(e) => e.stopPropagation()} // Evita que al hacer clic ADENTRO se cierre
            >
                {/* HEADER */}
                <div
                    className="modal_header"
                >
                    <h3>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="modal_button"
                        onMouseOver={(e) => e.currentTarget.style.color = "#ef4444"} // Se pone rojo al pasar el ratón
                        onMouseOut={(e) => e.currentTarget.style.color = "#94a3b8"}
                    >
                        &times; {/* Entidad HTML para la 'X' */}
                    </button>
                </div>

                {/* BODY (El contenido dinámico) */}
                <div
                    className="modal_body "
                >
                    {children}
                </div>
            </div>
        </div>
    );
}