import { useState } from "react";
import ExcelUploader from "../components/excel/ExcelUploader";

// 1. IMPORTAMOS EL LOGO BLANCO
import escudoAdmin from "../assets/images/simuledu.png";

import "../styles/components/ui/Inicio.css"

export default function Inicio() {
  const [_refreshFiles, _setRefreshFiles] = useState(false);

  return (
    // Usamos el contenedor que centra todo
    <div className="inicio-container">
      
      {/* 2. AGREGAMOS LA IMAGEN CON SU CLASE ANIMADA */}
      <img 
        src={escudoAdmin} 
        alt="Escudo Administración" 
        className="logo-inicio" 
      />
      
    </div>
  );
}