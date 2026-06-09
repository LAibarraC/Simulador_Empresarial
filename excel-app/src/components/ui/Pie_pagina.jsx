import React, { useState, useEffect } from "react";
import logoSimuledu from "../../assets/images/simuledu_logo.png";
import "../../styles/components/ui/Pie_pagina.css";
import { api } from "../../services/api";

export default function Pie_pagina() {
  const [visitas, setVisitas] = useState(null);

  useEffect(() => {
    const cargarVisitas = async () => {
      const numVisitas = await api.obtenerVisitas();
      if (numVisitas !== null) setVisitas(numVisitas);
    };
    cargarVisitas();
  }, []);

  return (
    <footer className="pie-pagina-institucional">

      {/* SECCIÓN PRINCIPAL */}
      <div className="pie-top">

        {/* Logo + Nombre */}
        <div className="pie-col-izq">
          <img src={logoSimuledu} alt="SimulEdu" className="pie-logo-usfx" />
          <div className="pie-divisor"></div>
          <div className="pie-marca">
            <span className="pie-nombre">SIMULEDU</span>
            <span className="pie-slogan">Plataforma de Simulación Educativa</span>
          </div>
        </div>

        {/* Slogan central */}
        <div className="pie-col-centro">
          <span className="pie-slogan-central">Visualizá tu conocimiento · Aprendé haciendo</span>
        </div>

        {/* Visitas */}
        <div className="pie-col-der">
          <svg className="icono-ojo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span className="texto-vistas">
            {visitas !== null ? `${visitas.toLocaleString()} visitas` : "Cargando..."}
          </span>
        </div>

      </div>

      {/* BARRA INFERIOR CENTRADA */}
      <div className="pie-bottom">
        <p className="pie-copy">
          © 2026 <strong>SimulEdu</strong> — Todos los derechos reservados &nbsp;|&nbsp; Plataforma académica de simulación estadística
        </p>
      </div>

    </footer>
  );
}