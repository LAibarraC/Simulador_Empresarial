import React from "react";
import { IconoCohete } from "./iconos";

export default function BannerEntornoBeta() {
  return (
    <div 
      className="banner-entorno-beta" 
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "flex-start",
        gap: "15px",
        padding: "10px 16px",
        borderRadius: "8px",
        backgroundColor: "var(--bg-beta-banner, rgba(245, 158, 11, 0.06))",
        border: "1px solid var(--border-beta-banner, rgba(245, 158, 11, 0.2))",
        color: "var(--text-main, #374151)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.01)",
        marginBottom: "15px",
        width: "100%",
        boxSizing: "border-box",
        textAlign: "left",
        fontFamily: "inherit"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <IconoCohete style={{ color: "#d97706", width: "16px", height: "16px" }} />
          <strong style={{ fontSize: "0.95rem", color: "#d97706" }}>
            Entorno de Pruebas (Beta)
          </strong>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", fontSize: "0.85rem", lineHeight: "1.4", color: "var(--text-muted)" }}>
          <span style={{ minWidth: "250px", flex: "1 1 auto" }}>
            <strong>Reactivación:</strong> Por inactividad de 15 min, la carga inicial puede demorar hasta 60s.
          </span>
          <span style={{ minWidth: "250px", flex: "1 1 auto" }}>
            <strong>Archivos:</strong> Los archivos Excel no se almacenan permanentemente en el servidor gratuito.
          </span>
        </div>
      </div>
    </div>
  );
}
