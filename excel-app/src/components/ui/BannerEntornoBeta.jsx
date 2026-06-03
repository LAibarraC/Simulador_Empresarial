import React from "react";
import { IconoCohete } from "./iconos";

export default function BannerEntornoBeta() {
  return (
    <div 
      className="banner-entorno-beta" 
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "16px 20px",
        borderRadius: "10px",
        backgroundColor: "var(--bg-beta-banner, rgba(245, 158, 11, 0.08))",
        border: "1px solid var(--border-beta-banner, rgba(245, 158, 11, 0.25))",
        color: "var(--text-main, #374151)",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.02)",
        marginBottom: "20px",
        width: "100%",
        boxSizing: "border-box",
        textAlign: "left",
        fontFamily: "inherit"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <IconoCohete style={{ color: "#d97706" }} />
        <strong style={{ fontSize: "1.1rem", color: "#d97706" }}>
          Entorno de Pruebas (Beta)
        </strong>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.92rem", lineHeight: "1.5" }}>
        <p style={{ margin: 0 }}>
          <strong>Reactivación:</strong> Por inactividad de 15 min, el primer cálculo o inicio de sesión puede demorar hasta 60 segundos.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Archivos:</strong> Los Excel se procesan al instante para los cálculos estadísticos, pero por políticas del servidor gratuito, el archivo físico no se almacena permanentemente.
        </p>
      </div>
    </div>
  );
}
