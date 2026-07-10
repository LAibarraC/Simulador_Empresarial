import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Datos from "../../../pages/Datos";
import Calculos from "../pages/Calculos";
import TablaDinamica from "../../../components/excel/TablaDinamica";
import { useCalculadoraExcel } from "../hooks/useCalculadoraExcel";


import "../style/pages/Calculadora.css";

export default function Calculadora() {
  const location = useLocation(); // 👈 2. CAPTURAMOS LOS DATOS DEL HISTORIAL
  const paramsReabrir = location.state || {};
  
  // 👈 3. EXTRAEMOS EL SNAPSHOT EXACTAMENTE COMO LO ENVIASTE DESDE HISTORIAL.JSX
  const { archivoReabrir, calculoReabrir, snapshot } = paramsReabrir;

  const [mostrarDatos, setMostrarDatos] = useState(false);
  const [mostrarCreacion, setMostrarCreacion] = useState(false);

  // Inicializamos con el archivo del historial si existe
  const [selectedFile, setSelectedFile] = useState(archivoReabrir || "");
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState("");

  // 🚀 4. PASAMOS EL SNAPSHOT AL HOOK (¡LA MAGIA SUCEDE AQUÍ!)
  const stats = useCalculadoraExcel(
    selectedFile,
    selectedSheet,
    snapshot, // Si viene del historial, esto llenará los datos al instante
    selectedCourse
  );

  return (
    <div className="contenedor-principal-sistema">

      <div className="ventana-contenido-principal">
        {/* Le pasamos paramsReabrir a Calculos para que sepa qué cálculo seleccionar */}
        <Calculos stats={stats} paramsReabrir={paramsReabrir} />
      </div>

      <div className="flotante-lateral-datos">
        <button
          id="tour-btn-gestion"
          className="btn-flotante-datos"
          onClick={() => setMostrarDatos(true)}
          title="Abrir Gestión de Datos"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
          </svg>
          <span className="texto-flotante">GESTIÓN DE DATOS</span>
        </button>

        <button
          id="tour-btn-crear-tabla"
          className="btn-flotante-datos btn-crear-tabla"
          onClick={() => setMostrarCreacion(true)}
          title="Crear Nueva Tabla de Datos"
          style={{ backgroundColor: "#3b82f6", marginTop: "10px" }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="3" y1="15" x2="21" y2="15"></line>
            <line x1="9" y1="3" x2="9" y2="21"></line>
          </svg>
          <span className="texto-flotante">CREAR TABLA</span>
        </button>
      </div>

      {mostrarDatos && (
        <div className="modal-overlay-datos">
          <div className="modal-content-datos">
            <button
              className="btn-cerrar-modal"
              onClick={() => setMostrarDatos(false)}
            >
              Cerrar
            </button>

            <Datos
              setSelectedFile={setSelectedFile}
              selectedFile={selectedFile}
              setSelectedSheet={setSelectedSheet}
              setSelectedCourse={setSelectedCourse}
              selectedCourse={selectedCourse}
            />
          </div>
        </div>
      )}

      {mostrarCreacion && (
        <div className="modal-overlay-datos">
          <div className="modal-content-datos">
            <button
              className="btn-cerrar-modal"
              onClick={() => setMostrarCreacion(false)}
            >
              Cerrar
            </button>
            <div style={{ height: "100%" }}>
              <TablaDinamica
                onTablaCreada={() => {
                  setMostrarCreacion(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}