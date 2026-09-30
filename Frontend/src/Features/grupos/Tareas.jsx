import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../components/Gestion_Datos/DataContext";
import { BASE_URL } from "../../services/api";
import escudoAdmin from "../../assets/images/escudoAdmin.png";
import PestaniaTareas from "./PestaniaTareas";

export default function Tareas() {
  const { usuario } = useData();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [cargandoCursos, setCargandoCursos] = useState(true);

  const correoUsuario = usuario?.email || usuario?.id;
  const esAdmin = usuario?.rol === "Administrador" || usuario?.isAdmin === true;
  const esDocente = usuario?.rol === "Docente";
  const esDocenteOAdmin = esDocente || esAdmin;

  const cargarCursos = async () => {
    if (!usuario) return;
    setCargandoCursos(true);
    try {
      if (esDocenteOAdmin) {
        const res = await fetch(`${BASE_URL}/mis_clases/${correoUsuario}`);
        if (res.ok) {
          const data = await res.json();
          setCursos(data);
        }
      } else {
        const res = await fetch(`${BASE_URL}/mis_inscripciones/${correoUsuario}`);
        if (res.ok) {
          const data = await res.json();
          setCursos(data);
        }
      }
    } catch (error) {
      console.error("Error al cargar cursos para tareas:", error);
    } finally {
      setCargandoCursos(false);
    }
  };

  useEffect(() => {
    if (!usuario) {
      navigate("/login");
      return;
    }
    cargarCursos();
  }, [usuario?.id, usuario?.rol]);

  if (!usuario) return null;

  return (
    <div className="page-container" style={{ position: "relative" }}>
      {/* Marca de agua de fondo */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "450px",
          height: "450px",
          backgroundImage: `url(${escudoAdmin})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          opacity: 0.04,
          zIndex: 0,
          pointerEvents: "none"
        }}
      />

      <PestaniaTareas 
        cursos={cursos} 
        esDocente={esDocenteOAdmin} 
        esAdmin={esAdmin}
        onActualizarCursos={cargarCursos}
      />
    </div>
  );
}
