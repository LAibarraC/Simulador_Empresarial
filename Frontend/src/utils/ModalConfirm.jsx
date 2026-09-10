import { useEffect, useState } from "react";
import Modal from "./Modal";

/**
 * Modal de confirmación reutilizable, con el mismo estilo de eliminar archivos / Modal.
 *
 * Props:
 *  - open: boolean
 *  - titulo: string
 *  - mensaje: string | ReactNode
 *  - textoConfirmar: string  (default: "Eliminar")
 *  - textoCancelar: string   (default: "Cancelar")
 *  - variant: "danger" | "primary"  (default: "danger")
 *  - onConfirm: () => void | Promise<void>
 *  - onCancel: () => void
 */
export default function ModalConfirm({
  open,
  titulo = "Confirmar eliminación",
  mensaje,
  textoConfirmar = "Eliminar",
  textoCancelar = "Cancelar",
  variant = "danger",
  onConfirm,
  onCancel,
}) {
  const [procesando, setProcesando] = useState(false);

  // Reset del estado interno cada vez que el modal se reabre
  useEffect(() => {
    if (open) setProcesando(false);
  }, [open]);

  // Cerrar con tecla Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape" && !procesando) onCancel?.();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, procesando, onCancel]);

  if (!open) return null;

  const handleConfirm = async () => {
    if (procesando) return;
    try {
      setProcesando(true);
      await Promise.resolve(onConfirm?.());
    } finally {
      setProcesando(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={() => {
        if (!procesando) onCancel?.();
      }}
      title={titulo}
      maxWidth="400px"
    >
      <div className="modal_viewer">
        {typeof mensaje === "string" ? (
          <p>{mensaje}</p>
        ) : (
          mensaje
        )}
      </div>

      <div className="modal_viewer_button">
        <button
          type="button"
          onClick={onCancel}
          disabled={procesando}
          className="modal_viewer_button_si"
        >
          {textoCancelar}
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={procesando}
          className={variant === "danger" ? "modal_viewer_button_no" : "btn-azul"}
        >
          {procesando ? "Procesando…" : textoConfirmar}
        </button>
      </div>
    </Modal>
  );
}

