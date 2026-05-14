import { useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { generarColorAleatorio } from '../utils/excelHelpers';
import { alerta } from "../utils/Notificaciones";

export const useSimuladorLogic = (usuario) => {
  const location = useLocation();

  // 1. Identificamos el "cajón" (scope) basándonos en la URL
  const scope = useMemo(() => {
    return location.pathname.startsWith('/MAT251') ? 'mat251' : 'general';
  }, [location.pathname]);

  // 2. Estado maestro que guarda TODO por cajones para que no se pierda al navegar
  const [dataScopes, setDataScopes] = useState({
    general: { workbook: null, sheetNames: [], currentSheet: "", rowData: [], variables: [] },
    mat251: { workbook: null, sheetNames: [], currentSheet: "", rowData: [], variables: [] }
  });

  const [limiteFilas, setLimiteFilas] = useState(50);

  // Helper para actualizar solo el cajón actual
  const updateCurrentScope = (newData) => {
    setDataScopes(prev => ({
      ...prev,
      [scope]: { ...prev[scope], ...newData }
    }));
  };

  const { workbook, sheetNames, currentSheet, rowData, variables } = dataScopes[scope];

  const cargarHoja = useCallback((wb, sheetName, limite = limiteFilas) => {
    if (!wb) return;
    const ws = wb.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(ws, { header: "A", defval: "" }).slice(0, limite);
    
    updateCurrentScope({
      currentSheet: sheetName,
      rowData: data
    });
  }, [limiteFilas, scope]);

  const handleFileUpload = (e) => {
    const file = e.target?.files ? e.target.files[0] : null;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        
        updateCurrentScope({
          workbook: wb,
          sheetNames: wb.SheetNames,
          variables: [],
          currentSheet: wb.SheetNames[0]
        });

        // Cargamos la primera hoja automáticamente
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: "A", defval: "" }).slice(0, limiteFilas);
        updateCurrentScope({
          workbook: wb,
          sheetNames: wb.SheetNames,
          variables: [],
          currentSheet: wb.SheetNames[0],
          rowData: data
        });

        alerta.exito("Archivo cargado", `Se ha cargado "${file.name}" en el espacio ${scope.toUpperCase()}.`);
      } catch (error) {
        console.error("Error al leer el archivo Excel:", error);
        alerta.error("Error de lectura", "No se pudo procesar el archivo Excel.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const agregarVariable = () => {
    const nuevocolor = generarColorAleatorio(variables.length);
    const nuevaVar = {
      id: Date.now(),
      nombre: `Variable ${variables.length + 1}`,
      color: nuevocolor,
      datos: [],
      rangoLabel: "",
      coords: null,
      sheet: ""
    };
    updateCurrentScope({ variables: [...variables, nuevaVar] });
  };

  const eliminarVariable = (id) => {
    const variableAEliminar = variables.find(v => v.id === id);
    alerta.advertencia("Variable eliminada", `Se borró "${variableAEliminar?.nombre}"`);
    updateCurrentScope({ variables: variables.filter(v => v.id !== id) });
  };

  const actualizarVariable = (id, data) => {
    updateCurrentScope({
      variables: variables.map(v => v.id === id ? { ...v, ...data } : v)
    });
  };

  const setVariables = (newVars) => {
    const finalVars = typeof newVars === 'function' ? newVars(variables) : newVars;
    updateCurrentScope({ variables: finalVars });
  };

  return {
    workbook,
    sheetNames,
    currentSheet,
    rowData,
    variables,
    limiteFilas,
    usuario,
    setVariables,
    setLimiteFilas,
    handleFileUpload,
    cargarHoja,
    agregarVariable,
    eliminarVariable,
    actualizarVariable
  };
};