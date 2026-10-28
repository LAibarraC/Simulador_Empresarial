import { HashRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Menu from "./ui/Menu";
import Pie_pagina from "./ui/Pie_pagina";
import { useState, useEffect } from "react";
import { sileo, Toaster } from "sileo";

import Inicio from "./features/start/Inicio";
import Archivos from "./features/archives/Archivos";
import Calculadora from "./features/MAT151/pages/Calculadora";
import Login from "./features/auth/Login";
import MAT251 from "./features/MAT251/pages/EstadisticaMatematica";
import Registro from "./features/auth/Registro";
import Perfil from "./features/auth/Perfil";
import ForgotPassword from "./features/auth/ForgotPassword";
import ResetPassword from "./features/auth/ResetPassword";
import Admin from "./features/admin/Admin";
import GestionDocente from "./features/user/docentes/GestionDocente";
import ReportesDocente from "./features/user/docentes/ReportesDocente";

import SelectorRol from './ui/SelectorRol';
import ModalSeleccionRolInicial from './ui/ModalSeleccionRolInicial';
import ModalConfigPrecuenta from './ui/ModalConfigPrecuenta';
import OscuroClaro from "./ui/oscuro_claro";

import { DataProvider, CalculadoraDataProvider, MAT251DataProvider, ActiveModuleContext } from "./components/gestion_datos/DataContext";

import LtiTester from "./pages/LtiTester";
import Historial from "./features/history/Historial";
import Grupos from './features/grupos/Grupos';
import Tareas from './features/grupos/Tareas';
import GenerarQR from "./features/qr/GenerarQR";
import Matricular from "./features/qr/Matricular";
import api from "./services/api";
 
import "./App.css";
import ConfirmHost from "./utils/ConfirmHost";

const ConditionalFooter = () => {
  const location = useLocation();
  const hidePaths = ['/login', '/registro', '/forgot-password', '/reset-password'];
  if (hidePaths.includes(location.pathname)) {
    return null;
  }
  return <Pie_pagina />;
};

const ConditionalGuestHeader = ({ isAuth, usuario, setUsuario }) => {
  const location = useLocation();
  const hideLinkPaths = ['/registro', '/forgot-password', '/reset-password'];
  const isHideLink = hideLinkPaths.includes(location.pathname);
  const isLogin = location.pathname === '/login';

  if (isAuth) {
    return (
      <header className="guest-header">
        <Menu usuario={usuario} setUsuario={setUsuario} />
      </header>
    );
  }

  return (
    <header className="guest-header">
      <div className="guest-actions">
        <OscuroClaro />
        {!isHideLink && (
          <Link
            to={isLogin ? "/" : "/login"}
            className="login-link"
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {isLogin ? "Inicio" : "Iniciar Sesión"}
          </Link>
        )}
      </div>
    </header>
  );
};

const ModuloNoAsignado = ({ modulo, rol }) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '65vh', padding: '20px' }}>
    <div className="grafico-card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '36px 24px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <h3 style={{ margin: '0 0 10px', color: 'var(--text-main)', fontSize: '1.2rem' }}>
        Módulo {modulo} no asignado
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5', margin: '0 0 24px' }}>
        {rol === 'Docente'
          ? `No tienes asignada la materia ${modulo}. Solicita al Administrador la habilitación de este módulo para gestionarlo.`
          : `Aún no has desbloqueado las herramientas de ${modulo}. Inscríbete a un curso de esta asignatura mediante su código o QR para obtener acceso libre y permanente.`}
      </p>
      <Link to="/" className="btn-azul" style={{ display: 'inline-flex', padding: '8px 20px', fontSize: '0.88rem', textDecoration: 'none' }}>
        Volver al Inicio
      </Link>
    </div>
  </div>
);

function App() {
  const [usuario, setUsuario] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

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

  const isAuth = usuario !== null;
  const tieneMAT151 = usuario?.rol === "Administrador" || (usuario?.modulos || []).includes("MAT151");
  const tieneMAT251 = usuario?.rol === "Administrador" || (usuario?.modulos || []).includes("MAT251");

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
    <DataProvider usuario={usuario} setUsuario={setUsuario}>
      <CalculadoraDataProvider usuario={usuario}>
        <MAT251DataProvider usuario={usuario}>
          <HashRouter>
            {usuario?.requiere_configuracion && (
              <ModalConfigPrecuenta onActualizado={setUsuario} />
            )}
            {usuario && (usuario.requiere_rol || usuario.rol === 'Pendiente' || !usuario.rol) && (
              <ModalSeleccionRolInicial
                usuario={usuario}
                onRolAsignado={(usuarioActualizado) => setUsuario(usuarioActualizado)}
              />
            )}
            <SelectorRol />
            <div className="app-main" style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'fixed', zIndex: 99999, inset: 0, pointerEvents: 'none' }}>
                <Toaster position="bottom-right" />
              </div>

              <ConfirmHost />

              {/* 🆕 CONTROLES FLOTANTES MODERNOS PARA INVITADOS */}
              <ConditionalGuestHeader isAuth={isAuth} usuario={usuario} setUsuario={setUsuario} />

              <div className="content" style={{ flex: 1 }}>
                <Routes>
                  {!isAuth ? (
                    <>
                      <Route path="/" element={<Inicio />} />
                      <Route path="/login" element={<Login onLogin={setUsuario} />} />
                      <Route path="/registro" element={<Registro onLogin={setUsuario} />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/lti-tester" element={<LtiTester onLogin={setUsuario} />} />
                      <Route path="/matricular/:token" element={<Matricular />} />
                      <Route path="*" element={<Navigate to="/" />} />
                    </>
                  ) : (
                    <>
                      <Route path="/" element={<Inicio />} />
                      <Route path="/archivos" element={<Archivos usuario={usuario} />} />
                      <Route path="/calculadora" element={
                        tieneMAT151 ? (
                          <ActiveModuleContext.Provider value="calculadora">
                            <Calculadora />
                          </ActiveModuleContext.Provider>
                        ) : (
                          <ModuloNoAsignado modulo="MAT151" rol={usuario?.rol} />
                        )
                      } />
                      <Route path="/historial" element={<Historial />} />
                      <Route path="/grupos" element={<Grupos />} />
                      <Route path="/mis-cursos" element={<Grupos />} />
                      <Route path="/tareas" element={<Tareas />} />
                      <Route path="/matricular/:token" element={<Matricular />} />

                      <Route path="/lti-tester" element={<Navigate to="/" />} />
                      <Route path="/login" element={<Navigate to="/" />} />
                      <Route path="/registro" element={<Navigate to="/" />} />

                      <Route path="/MAT251" element={
                        tieneMAT251 ? (
                          <ActiveModuleContext.Provider value="mat251">
                            <MAT251 usuario={usuario} />
                          </ActiveModuleContext.Provider>
                        ) : (
                          <ModuloNoAsignado modulo="MAT251" rol={usuario?.rol} />
                        )
                      } />
                      <Route path="/MAT251/:operacionId" element={
                        tieneMAT251 ? (
                          <ActiveModuleContext.Provider value="mat251">
                            <MAT251 usuario={usuario} />
                          </ActiveModuleContext.Provider>
                        ) : (
                          <ModuloNoAsignado modulo="MAT251" rol={usuario?.rol} />
                        )
                      } />

                      <Route path="/perfil" element={<Perfil usuario={usuario} setUsuario={setUsuario} />} />
                      <Route path="/admin" element={usuario?.rol === "Administrador" ? <Admin /> : <Navigate to="/" />} />
                      <Route path="/gestion-docente" element={usuario?.rol === "Docente" || usuario?.rol === "Administrador" ? <GestionDocente usuario={usuario} /> : <Navigate to="/" />} />
                      <Route path="/reportes-docente" element={usuario?.rol === "Docente" || usuario?.rol === "Administrador" ? <ReportesDocente usuario={usuario} /> : <Navigate to="/" />} />
                      <Route path="/qr" element={usuario?.rol === "Docente" || usuario?.rol === "Administrador" ? <GenerarQR /> : <Navigate to="/" />} />
                    </>
                  )}
                </Routes>
              </div>

              <ConditionalFooter />

            </div>
          </HashRouter>
        </MAT251DataProvider>
      </CalculadoraDataProvider>
    </DataProvider>
  );
}

export default App;