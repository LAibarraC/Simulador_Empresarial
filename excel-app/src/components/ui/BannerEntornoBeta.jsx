import React, { useState } from "react";
import { IconoCohete } from "./iconos";

export default function BannerEntornoBeta() {
  const [visible, setVisible] = useState(() => {
    return !sessionStorage.getItem("hideBetaBanner");
  });

  if (!visible) return null;

  const handleClose = () => {
    sessionStorage.setItem("hideBetaBanner", "true");
    setVisible(false);
  };

  return (
    <div 
      className="banner-entorno-beta" 
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        padding: "8px 32px 8px 14px",
        borderRadius: "8px",
        backgroundColor: "var(--bg-beta-banner, rgba(245, 158, 11, 0.05))",
        border: "1px solid var(--border-beta-banner, rgba(245, 158, 11, 0.2))",
        color: "var(--text-main, #374151)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.01)",
        marginBottom: "12px",
        width: "100%",
        boxSizing: "border-box",
        textAlign: "left",
        fontSize: "0.85rem",
        lineHeight: "1.4",
        fontFamily: "inherit"
      }}
    >
      <button
        onClick={handleClose}
        style={{
          position: "absolute",
          top: "6px",
          right: "8px",
          background: "none",
          border: "none",
          color: "#d97706",
          cursor: "pointer",
          fontSize: "1rem",
          fontWeight: "bold",
          padding: "4px",
          lineHeight: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.6,
          transition: "opacity 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
        onMouseLeave={(e) => e.currentTarget.style.opacity = "0.6"}
        title="Cerrar aviso"
        aria-label="Cerrar aviso"
      >
        ✕
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <IconoCohete size={16} color="#d97706" />
        <strong style={{ fontSize: "0.92rem", color: "#d97706" }}>
          Entorno de Pruebas (Beta)
        </strong>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
        <p style={{ margin: 0 }}>
          <strong>Reactivación:</strong> Por inactividad de 15 min, el primer cálculo o inicio de sesión puede demorar hasta 60 segundos.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Archivos:</strong> Los Excel se procesan al instante para los cálculos estadísticos, pero el archivo físico no se almacena permanentemente.
        </p>
      </div>
    </div>
  );
}

