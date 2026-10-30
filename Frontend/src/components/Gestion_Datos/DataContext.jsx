import React, { createContext, useContext, useCallback } from 'react';
import { useSimuladorLogic } from '../../hooks/usedatos';
import { api } from '../../services/api';

const DataContext = createContext(null);

// Contextos SEPARADOS por módulo
export const CalculadoraDataContext = createContext(null);
export const MAT251DataContext      = createContext(null);

// Provider global: solo usuario/setUsuario
export const DataProvider = ({ children, usuario, setUsuario }) => {
    const pDatos = useSimuladorLogic(usuario);
    const identidadUsuario = usuario?.email || usuario?.id;
    const actualizarModulosUsuario = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!identidadUsuario || !token) return false;
        try {
            const perfil = await api.obtenerPerfilActual();
            if (!Array.isArray(perfil.modulos)) {
                throw new Error("El perfil no contiene la lista de módulos");
            }
            if (localStorage.getItem("token") !== token) return false;
            setUsuario(actual => {
                if (!actual || (actual.email || actual.id) !== identidadUsuario) return actual;
                return { ...actual, modulos: perfil.modulos };
            });
            return true;
        } catch (error) {
            console.error("No se pudieron actualizar los módulos de la sesión:", error);
            return false;
        }
    }, [identidadUsuario, setUsuario]);
    const contextoGlobal = { ...pDatos, usuario, setUsuario, actualizarModulosUsuario };
    return (
        <DataContext.Provider value={contextoGlobal}>
            {children}
        </DataContext.Provider>
    );
};

// Provider para Estadística General (Calculadora)
export const CalculadoraDataProvider = ({ children, usuario }) => {
    const pDatos = useSimuladorLogic(usuario);
    return (
        <CalculadoraDataContext.Provider value={{ ...pDatos, usuario }}>
            {children}
        </CalculadoraDataContext.Provider>
    );
};

// Provider para Estadística Matemática (MAT-251)
export const MAT251DataProvider = ({ children, usuario }) => {
    const pDatos = useSimuladorLogic(usuario);
    return (
        <MAT251DataContext.Provider value={{ ...pDatos, usuario }}>
            {children}
        </MAT251DataContext.Provider>
    );
};

// Hook genérico (para usuario, historial, grupos — cosas globales)
export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        console.error('Error: useData debe estar dentro de DataProvider');
        return { variables: [] };
    }
    return context;
}

// Hook para Calculadora
export function useCalculadoraData() {
    const context = useContext(CalculadoraDataContext);
    if (!context) {
        console.error('Error: useCalculadoraData fuera de CalculadoraDataProvider');
        return { variables: [] };
    }
    return context;
}

// Hook para MAT-251
export function useMAT251Data() {
    const context = useContext(MAT251DataContext);
    if (!context) {
        console.error('Error: useMAT251Data fuera de MAT251DataProvider');
        return { variables: [] };
    }
    return context;
}

// Contexto para indicar qué módulo está activo en el sub-árbol actual
export const ActiveModuleContext = createContext("calculadora");

// Hook universal: detecta automáticamente si estamos en Calculadora o MAT-251
// y devuelve el contexto del módulo activo. Usar en componentes COMPARTIDOS
// como Datos.jsx y useCalculadoraExcel que se renderizan en ambos módulos.
export function useModuleData() {
    const activeModule = useContext(ActiveModuleContext);
    const calcCtx   = useContext(CalculadoraDataContext);
    const mat251Ctx = useContext(MAT251DataContext);
    const globalCtx = useContext(DataContext);
    
    // Seleccionamos el contexto adecuado según la ruta / sección activa
    const targetCtx = activeModule === "mat251" ? mat251Ctx : calcCtx;

    // Prioridad: módulo específico según activeModule → fallback global
    return targetCtx || globalCtx || {
        workbook: null,
        sheetNames: [],
        currentSheet: "",
        rowData: [],
        variables: [],
        limiteFilas: 50,
        handleFileUpload: () => {},
        cargarHoja: () => {},
        agregarVariable: () => {},
        eliminarVariable: () => {},
        actualizarVariable: () => {},
        setLimiteFilas: () => {},
        usuario: null
    };
}