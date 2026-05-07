import React, { useState } from "react";
import Datos from "../Datos";
import { DataProvider } from "../../components/excel/DataContext";
import { useCalculadoraExcel } from "../../hooks/useCalculadoraExcel";
import Principal from '../../components/MAT251/Principal/Principal';
import "../../styles/pages/MAT251/Pantalla.css";

export default function Pantalla() {
  const [pestanaActiva, setPestanaActiva] = useState(0);
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedSheet, setSelectedSheet] = useState(0);

  const _stats = useCalculadoraExcel(selectedFile, selectedSheet);

  /*const nombresVentanas = [
    "Gestión de Datos",
    "Tema 1",
    "Tema 2",
    "Tema 3",
    "Tema 4",
    "Tema 5",
    "Tema 6"
  ];*/

  const nombresVentanas = [
    "Gestión de Datos",
    "Calculos"
  ];
  return (
    <DataProvider>
      <div className="mat251-contenedor">
        <div className="mat251-navegacion">
          {nombresVentanas.map((nombre, index) => (
            <button
              key={index}
              onClick={() => setPestanaActiva(index)}
              className={`mat251-tab-btn ${pestanaActiva === index ? 'active' : ''}`}
            >
              {nombre}
            </button>
          ))}
        </div>
        <div style={{ backgroundColor: 'var(--bg-body)', color: 'var(--text-main)' }}>
          <div style={{ display: pestanaActiva === 0 ? 'block' : 'none' }}>
            <Datos
              setSelectedFile={setSelectedFile}
              selectedFile={selectedFile}
              setSelectedSheet={setSelectedSheet}
            />
          </div>

          <div style={{ display: pestanaActiva === 1 ? 'block' : 'none' }}>
            <Principal />
          </div>

          {/* Resto de Temas */}
          <div style={{ display: pestanaActiva === 2 ? 'block' : 'none' }}><h2>{nombresVentanas[2]}</h2></div>
          <div style={{ display: pestanaActiva === 3 ? 'block' : 'none' }}><h2>{nombresVentanas[3]}</h2></div>
          <div style={{ display: pestanaActiva === 4 ? 'block' : 'none' }}><h2>{nombresVentanas[4]}</h2></div>
          <div style={{ display: pestanaActiva === 5 ? 'block' : 'none' }}><h2>{nombresVentanas[5]}</h2></div>
          <div style={{ display: pestanaActiva === 6 ? 'block' : 'none' }}><h2>{nombresVentanas[6]}</h2></div>

        </div>

        {/* ESTADO DEL ARCHIVO */}
        {selectedFile && (
          <div style={{
            marginTop: '20px',
            padding: '12px 20px',
            backgroundColor: '#dcfce7',
            borderRadius: '8px',
            border: '1px solid #86efac',
            color: '#166534',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
          </div>
        )}
      </div>
    </DataProvider>
  );
}