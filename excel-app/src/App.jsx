import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Menu from "./components/ui/Menu";
import Pie_pagina from "./components/ui/Pie_pagina"; 
import { useState, useEffect } from "react"; 
import { sileo, Toaster } from "sileo";

import Inicio from "./pages/Inicio";
import Archivos from "./pages/Archivos";
import Calculadora from "./pages/Calculadora";
import About from "./pages/About";
import Login from "./pages/Login";

import MAT251 from "./pages/MAT251/Pantalla"
import "./App.css"; 

function App() {
  // 👇 1. Modificamos el estado inicial para que lea el localStorage
  const [isAuth, setIsAuth] = useState(() => {
    const logueado = localStorage.getItem("isAuth");
    return logueado === "true"; 
  });

  // 👇 2. Agregamos un efecto para guardar cualquier cambio en localStorage
  useEffect(() => {
    localStorage.setItem("isAuth", isAuth);
  }, [isAuth]);

  return (
    <Router>
      <div className="App">
        <>
          <Toaster position="bottom-right" />
        </>
        
        {isAuth && (
          <header className="flex justify-between items-center p-4 shadow-md">
            <Menu /> 
          </header>
        )}

        <div className="content">
          <Routes>
            {!isAuth ? (
              <>
                <Route path="/login" element={<Login onLogin={setIsAuth} />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Inicio />} />
                <Route path="/archivos" element={<Archivos />} />
                <Route path="/calculadora" element={<Calculadora />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Navigate to="/" />} />
                <Route path="/MAT251" element={<MAT251 />} />
              </>
            )}
          </Routes>
        </div>
        
        {isAuth && <Pie_pagina />}

      </div>
    </Router>
  );
}

export default App;