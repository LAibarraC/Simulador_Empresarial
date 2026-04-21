import React from "react";
// 1. VOLVEMOS A USAR TU ARCHIVO ORIGINAL QUE SÍ EXISTE
import logoUsfx from "../../assets/images/logo_usfx.png";
import logo4Siglos from "../../assets/images/4_siglos.png";
import "../../styles/components/ui/Pie_pagina.css";   

export default function Pie_pagina() {
  return (
    <footer className="pie-pagina-institucional">
      
      <div className="pie-top">
        <div className="pie-col-izq">
          {/* Usamos la imagen original */}
          <img src={logoUsfx} alt="Escudo USFX" className="pie-logo-usfx" />
          <div className="pie-divisor"></div>
        </div>

        <div className="pie-col-centro">
          <img src={logo4Siglos} alt="4 Siglos de Ciencia e Innovación" className="pie-logo-siglos" />
        </div>

        <div className="pie-col-der">
          <svg className="icono-ojo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span className="texto-vistas">Gracias por visitarnos</span>
        </div>
      </div>

      <div className="pie-bottom">
        <div className="pie-copy">
          © 2026 Universidad Mayor Real y Pontificia de San Francisco Xavier de Chuquisaca
        </div>
        
        {/* ✨ AQUÍ ESTÁN TUS NUEVOS ICONOS PROFESIONALES ✨ */}
        <div className="pie-redes">
          
          {/* 1. Página Oficial (Icono de Globo) */}
          <a href="https://economicas.usfx.bo/adme/" target="_blank" rel="noopener noreferrer" className="red-icono" title="Página Oficial">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </a>

          {/* 2. Facebook */}
          <a href="https://www.facebook.com/profile.php?id=100063257556825" target="_blank" rel="noopener noreferrer" className="red-icono" title="Facebook">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
          </a>

          {/* 3. Instagram */}
          <a href="https://www.instagram.com/admideempresas_usfx/" target="_blank" rel="noopener noreferrer" className="red-icono" title="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>

          {/* 4. TikTok (Nota: TikTok tiene un SVG especial porque es una nota musical doble) */}
          <a href="https://www.tiktok.com/@admin.de.empresas.usfx" target="_blank" rel="noopener noreferrer" className="red-icono" title="TikTok">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
            </svg>
          </a>

        </div>
      </div>

    </footer>
  );
}