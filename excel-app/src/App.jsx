import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Menu from "./components/ui/Menu";
import Pie_pagina from "./components/ui/Pie_pagina"; 
import { useState, useEffect } from "react";
import { sileo, Toaster } from "sileo";

import Inicio from "./pages/Inicio";
import Archivos from "./pages/Archivos";
import Calculadora from "./pages/Calculadora";
import About from "./pages/About";
import Login from "./pages/Login";
import MAT251 from "./pages/MAT251/Pantalla";
import Registro from "./pages/Registro";
import Perfil from "./pages/Perfil";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin"; 
import GestionDocente from "./pages/GestionDocente";

import SelectorRol from './components/ui/SelectorRol';

// 👇 1. IMPORTAMOS EL DATAPROVIDER DE LA CARPETA EXCEL
import { DataProvider, CalculadoraDataProvider, MAT251DataProvider, ActiveModuleContext } from "./components/excel/DataContext"; 

import LtiTester from "./pages/LtiTester";
import Historial from "./pages/Historial";
import Grupos from './pages/Grupos';
import api from "./services/api";

import "./App.css"; 

function App() {
  // 🆕 1. Cambiamos el estado para que guarde los datos del usuario (null = nadie logueado)
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // Intentar restaurar sesión desde localStorage al montar el componente (F5)
  useEffect(() => {
    const restaurarSesion = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const perfil = await api.obtenerPerfilActual();
          setUsuario(perfil);
        } catch (error) {
          console.error("Error al restaurar sesión:", error);
          localStorage.removeItem("token");
        }
      }
      setCargandoSesion(false);
    };

    restaurarSesion();
  }, []);

  // 🆕 2. Variable derivada: Si usuario no es nulo, significa que alguien inició sesión
  const isAuth = usuario !== null;

  if (cargandoSesion) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ fontWeight: 'bold' }}>Validando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    // 👇 2. ENVOLVEMOS TODA LA APLICACIÓN CON EL DATAPROVIDER Y LOS PROVIDERS DE MÓDULOS
    <DataProvider usuario={usuario} setUsuario={setUsuario}>
      <CalculadoraDataProvider usuario={usuario}>
        <MAT251DataProvider usuario={usuario}>
          <HashRouter>
            <SelectorRol />
            <div className="App">

              <div style={{ position: 'fixed', zIndex: 99999, inset: 0, pointerEvents: 'none' }}>
                <Toaster position="bottom-right" />
              </div>
              
              {/* Menú de navegación unificado */}
             {/* Menú de navegación unificado */}
              {isAuth && (
                <header style={{ width: '100%' }}>
                  {/* Le pasamos la variable 'usuario' como prop al componente Menu */}
                  <Menu usuario={usuario} setUsuario={setUsuario} /> 
                </header>
              )}

             {/* Contenido que cambia según la ruta */}
              <div className="content">
                <Routes>
                  {!isAuth ? (
                    <>
                      {/* 🆕 3. Pasamos setUsuario a tus puertas de acceso en lugar de setIsAuth */}
                      <Route path="/login" element={<Login onLogin={setUsuario} />} />
                      
                      {/* 🆕 NUEVO: Añadimos la ruta del Registro aquí */}
                      <Route path="/registro" element={<Registro onLogin={setUsuario} />} />

                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      
                      <Route path="/lti-tester" element={<LtiTester onLogin={setUsuario} />} />
                      
                      <Route path="*" element={<Navigate to="/login" />} />
                    </>
                  ) : (
                    <>
                      <Route path="/" element={<Inicio />} />
                      <Route path="/archivos" element={<Archivos usuario={usuario} />} />
                       <Route path="/calculadora" element={
                        <ActiveModuleContext.Provider value="calculadora">
                          <Calculadora />
                        </ActiveModuleContext.Provider>
                      } />
                      <Route path="/historial" element={<Historial />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/grupos" element={<Grupos />} />

                      <Route path="/lti-tester" element={<Navigate to="/" />} />
                      <Route path="/login" element={<Navigate to="/" />} />
                      
                      {/* 🆕 NUEVO: Si ya inició sesión y trata de registrarse, lo mandamos al inicio */}
                      <Route path="/registro" element={<Navigate to="/" />} />
                      
                      <Route path="/MAT251" element={
                        <ActiveModuleContext.Provider value="mat251">
                          <MAT251 usuario={usuario} />
                        </ActiveModuleContext.Provider>
                      } />

                      <Route path="/perfil" element={<Perfil usuario={usuario} setUsuario={setUsuario} />} />
                      <Route path="/admin" element={usuario?.rol === "Administrador" ? <Admin /> : <Navigate to="/" />} />
                      <Route path="/gestion-docente" element={usuario?.rol === "Docente" || usuario?.rol === "Administrador" ? <GestionDocente usuario={usuario} /> : <Navigate to="/" />} />
                    </>
                  )}
                </Routes>
              </div>
              
              {isAuth && <Pie_pagina />}

            </div>
          </HashRouter>
        </MAT251DataProvider>
      </CalculadoraDataProvider>
    </DataProvider>
  );
}

export default App;