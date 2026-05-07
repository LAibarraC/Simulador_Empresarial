import { useEffect } from "react";

import "../styles/utils/Modal.css";

export default function Modal({ isOpen, onClose, title, children}) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            document.documentElement.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
            document.documentElement.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "auto";
            document.documentElement.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="container_overlay"
            onClick={onClose} 
        >
            <div
                className="container_modal"
                onClick={(e) => e.stopPropagation()}
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
                        onMouseOver={(e) => e.currentTarget.style.color = "#ef4444"} 
                        onMouseOut={(e) => e.currentTarget.style.color = "#94a3b8"}
                    >
                        &times; 
                    </button>
                </div>

                {/* BODY */}
                <div
                    className="modal_body "
                >
                    {children}
                </div>
            </div>
        </div>
    );
}