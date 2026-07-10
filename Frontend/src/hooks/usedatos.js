import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { generarColorAleatorio } from '../utils/excelHelpers';

import {alerta} from "../utils/Notificaciones";


export const useSimuladorLogic = (usuario) => {
  const [workbook, setWorkbook] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [currentSheet, setCurrentSheet] = useState("");
  const [rowData, setRowData] = useState([]);
  const [variables, setVariables] = useState([]);
  const [limiteFilas, setLimiteFilas] = useState(50);

  const cargarHoja = useCallback((wb, sheetName, limite = limiteFilas) => {
    if (!wb) return;
    setCurrentSheet(sheetName);
    const ws = wb.Sheets[sheetName];
    // Convertimos la hoja a JSON usando la fila A como cabecera (letras)
    const data = XLSX.utils.sheet_to_json(ws, { header: "A", defval: "" }).slice(0, limite);
    setRowData(data);
  }, [limiteFilas]);

  // MODIFICADO: Ahora acepta el evento tradicional o un archivo directo
  const handleFileUpload = (e) => {
    // Si viene de un drop manual (mockEvent), lo sacamos de target.files
    // Si es un evento nativo de input, también está ahí.
    const file = e.target?.files ? e.target.files[0] : null;

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        setWorkbook(wb);
        setSheetNames(wb.SheetNames);
        setVariables([]); // Limpiamos variables al cargar nuevo archivo
        cargarHoja(wb, wb.SheetNames[0], 50);
        alerta.exito("Archivo cargado", `Se ha cargado el archivo "${file.name}" con éxito.`);
      } catch (error) {
        console.error("Error al leer el archivo Excel:", error);
        alerta.error("Error de lectura", "No se pudo procesar el archivo Excel.");
      }
    };
    reader.readAsBinaryString(file);
  };



  const agregarVariable = () => {
    setVariables(prev => {
      const nuevocolor = generarColorAleatorio(prev.length)

      return [...prev, {
        id: Date.now(),
        nombre: `Variable ${prev.length + 1}`,
        color: nuevocolor,
        datos: [],
        rangoLabel: "",
        coords: null,
        sheet: ""
      }];
    });
  };

  const eliminarVariable = (id) => {
    setVariables(prev => {
        const variableAEliminar = prev.find(v => v.id === id);
        alerta.advertencia("Variable eliminada", `Se borró "${variableAEliminar?.nombre}"`);
        return prev.filter(v => v.id !== id);
    });
  };

  const actualizarVariable = (id, data) => {
    setVariables(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
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