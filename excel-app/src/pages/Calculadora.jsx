import React, { useState } from "react";
import Datos from "./Datos";
import Calculos from "./Calculos";
import TablaDinamica from "../components/excel/TablaDinamica";
import { useCalculadoraExcel } from "../hooks/useCalculadoraExcel";
import { DataProvider } from "../components/excel/DataContext";

import "../styles/pages/Calculadora.css";

export default function Calculadora() { 
    const [pestanaActiva, setPestanaActiva] = useState("crear_tabla");
    const [selectedFile, setSelectedFile] = useState("");
    const [selectedSheet, setSelectedSheet] = useState(0);
    const stats = useCalculadoraExcel(selectedFile, selectedSheet);

    return (
        <DataProvider>
            <div className="contenedor-principal-sistema">
                <div className="navegacion-superior">
                    <button
                        className={`tab-btn ${pestanaActiva === "crear_tabla" ? "active" : ""}`}
                        onClick={() => setPestanaActiva("crear_tabla")}
                    > Crear Tabla de Datos </button>
                    <button
                        className={`tab-btn ${pestanaActiva === "datos" ? "active" : ""}`}
                        onClick={() => setPestanaActiva("datos")}
                    > Gestión de Datos </button>
                    
                    <button
                        className={`tab-btn ${pestanaActiva === "calculos" ? "active" : ""}`}
                        onClick={() => setPestanaActiva("calculos")}
                    > Procesamiento y Cálculos </button>
                </div>

                <div className="ventana-contenido-principal">
                    <div style={{ display: pestanaActiva === "datos" ? "block" : "none" }}>
                        <Datos
                            setSelectedFile={setSelectedFile}
                            selectedFile={selectedFile}
                            setSelectedSheet={setSelectedSheet}
                        />
                    </div>

                    <div style={{ display: pestanaActiva === "crear_tabla" ? "block" : "none", padding: "20px" }}>
                        <TablaDinamica onTablaCreada={() => setPestanaActiva("datos")} />
                    </div>

                    <div style={{ display: pestanaActiva === "calculos" ? "block" : "none" }}>
                        <Calculos stats={stats} />
                    </div>
                </div>
            </div>
        </DataProvider>
    );
}