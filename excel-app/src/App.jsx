import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Menu from "./components/ui/Menu";
import Pie_pagina from "./components/ui/Pie_pagina"; 
import { useState } from "react";
import { sileo, Toaster } from "sileo";

import Inicio from "./pages/Inicio";
import Archivos from "./pages/Archivos";
import Calculadora from "./pages/Calculadora";
import About from "./pages/About";
import Login from "./pages/Login";
import MAT251 from "./pages/MAT251/Pantalla";
import Registro from "./pages/Registro";
import Perfil from "./pages/Perfil";

// 👇 1. IMPORTAMOS EL DATAPROVIDER DE LA CARPETA EXCEL
import { DataProvider } from "./components/excel/DataContext"; 

import LtiTester from "./pages/LtiTester";
import Historial from "./pages/Historial";

import "./App.css"; 

function App() {
  // 🆕 1. Cambiamos el estado para que guarde los datos del usuario (null = nadie logueado)
  const [usuario, setUsuario] = useState(null);

  // 🆕 2. Variable derivada: Si usuario no es nulo, significa que alguien inició sesión
  const isAuth = usuario !== null;

  return (
    <Router>
      <DataProvider usuario={usuario}>
        <div className="App">
          <Toaster position="bottom-right" />
          
          {isAuth && (
            <header style={{ width: '100%' }}>
              <Menu usuario={usuario} /> 
            </header>
          )}

          <div className="content">
            <Routes>
              {!isAuth ? (
                <>
                  <Route path="/login" element={<Login onLogin={setUsuario} />} />
                  <Route path="/registro" element={<Registro />} />
                  <Route path="/lti-tester" element={<LtiTester onLogin={setUsuario} />} />
                  <Route path="*" element={<Navigate to="/login" />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<Inicio />} />
                  <Route path="/archivos" element={<Archivos usuario={usuario} />} />
                  <Route path="/calculadora" element={<Calculadora />} />
                  <Route path="/MAT251" element={<MAT251 usuario={usuario} />} />
                  <Route path="/historial" element={<Historial usuario={usuario} />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/perfil" element={<Perfil usuario={usuario} setUsuario={setUsuario} />} />

                  <Route path="/lti-tester" element={<Navigate to="/" />} />
                  <Route path="/login" element={<Navigate to="/" />} />
                  <Route path="/registro" element={<Navigate to="/" />} />
                </>
              )}
            </Routes>
          </div>
          
          {isAuth && <Pie_pagina />}
        </div>
      </DataProvider>
    </Router>
  );
}

export default App;