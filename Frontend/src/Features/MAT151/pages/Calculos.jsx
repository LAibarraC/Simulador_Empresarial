import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "react-data-grid/lib/styles.css";
import "../style/pages/Calculos.css";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// --- IMPORTS DE SERVICIOS Y CONTEXTO ---
import { useCalculadoraExcel } from "../hooks/useCalculadoraExcel";
import { useModuleData } from "../../../components/Gestion_Datos/DataContext";
import { api, BASE_URL } from "../../../services/api";
import { alerta } from "../../../utils/Notificaciones";
import { 
  BookOpenCheck, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  FileSpreadsheet, 
  Layers, 
  AlertCircle 
} from 'lucide-react';

// --- IMPORTS DE LOS PANELES MODULARES ---
import ReportePDF from "../components/Resultados/ReportePDF";
import PanelResultados from "../components/Resultados/PanelResultados";
import PanelConfiguracion from "../components/Resultados/PanelConfiguracion";

// Helpers para validación de temas de tarea en modo calculadora
const parseEjerciciosAsignadosCalc = (texto) => {
  if (!texto || typeof texto !== 'string') return null;

  const colonIndex = texto.indexOf(":");
  let modulo = "";
  let resto = texto;

  if (colonIndex !== -1 && !texto.trim().toLowerCase().startsWith("tema")) {
    modulo = texto.substring(0, colonIndex).trim();
    resto = texto.substring(colonIndex + 1).trim();
  }

  const esTodos = resto.toLowerCase().includes("todos los temas");

  if (esTodos) {
    return [
      { numero: "Tema 2", nombre: "Tabla de Frecuencias", calculoTipo: "frecuencias_completas" },
      { numero: "Tema 2", nombre: "Distribución por Intervalos", calculoTipo: "distribucion_intervalos" },
      { numero: "Tema 3", nombre: "Medidas de Tendencia Central", calculoTipo: "tendencia_y_posicion" },
      { numero: "Tema 4", nombre: "Medidas de Dispersión y Forma", calculoTipo: "variabilidad_y_forma" },
      { numero: "Tema 5", nombre: "Distribuciones Bivariantes", calculoTipo: "distribucion_bivariada_avanzada" },
      { numero: "Tema 6", nombre: "Análisis de Regresión", calculoTipo: "regresion_simple" },
      { numero: "Tema 7", nombre: "Series Temporales", calculoTipo: "series_tiempo" },
      { numero: "Tema 8", nombre: "Números Índices", calculoTipo: "numeros_indices" },
    ];
  }

  const partes = resto.split(/,\s*(?=Tema\s*\d+)/i);
  return partes.map(p => {
    const match = p.match(/^(Tema\s*\d+)[\s*:\-\–]+(.*)$/i);
    if (match) {
      const num = match[1].trim();
      const nom = match[2].trim();
      let calcTipo = "frecuencias_completas";
      if (num.includes("2")) {
        calcTipo = nom.toLowerCase().includes("intervalo") ? "distribucion_intervalos" : "frecuencias_completas";
      } else if (num.includes("3")) {
        calcTipo = "tendencia_y_posicion";
      } else if (num.includes("4")) {
        calcTipo = "variabilidad_y_forma";
      } else if (num.includes("5")) {
        calcTipo = "distribucion_bivariada_avanzada";
      } else if (num.includes("6")) {
        calcTipo = "regresion_simple";
      } else if (num.includes("7")) {
        calcTipo = "series_tiempo";
      } else if (num.includes("8")) {
        calcTipo = "numeros_indices";
      }
      return { numero: num, nombre: nom, calculoTipo: calcTipo };
    }
    return { numero: "", nombre: p.trim(), calculoTipo: "frecuencias_completas" };
  }).filter(t => t.nombre || t.numero);
};

const parseSnapshotDataCalc = (snapshot) => {
  if (!snapshot) return null;
  if (typeof snapshot === "object") return snapshot;
  try {
    const p1 = JSON.parse(snapshot);
    if (typeof p1 === "string") {
      try { return JSON.parse(p1); } catch (e) { return p1; }
    }
    return p1;
  } catch (e) {
    return null;
  }
};

const verificarTemaRealizadoCalc = (temaObj, historial, archivoRequerido, tareaIdActual) => {
  if (!historial || !Array.isArray(historial) || historial.length === 0) {
    return { realizado: false, record: null };
  }

  const num = (temaObj.numero || "").toLowerCase().trim();
  const nombre = (temaObj.nombre || "").toLowerCase().trim();
  const calculoEspecifico = (temaObj.calculoTipo || "").toLowerCase().trim();
  const reqNormalized = archivoRequerido ? archivoRequerido.toLowerCase().replace(/\.xlsx?$|\.xls$|\.csv$/i, "").trim() : "";

  for (const record of historial) {
    const snap = parseSnapshotDataCalc(record.snapshot);
    const recTareaId = snap?.tarea_id || snap?.configuracion?.tarea_id || record.tarea_id;

    if (tareaIdActual) {
      if (!recTareaId || String(recTareaId) !== String(tareaIdActual)) {
        continue;
      }
    }

    if (archivoRequerido) {
      const recFileNormalized = (record.archivo_origen || "").toLowerCase().replace(/\.xlsx?$|\.xls$|\.csv$/i, "").trim();
      const directMatch = record.archivo_origen && record.archivo_origen.toLowerCase() === archivoRequerido.toLowerCase();
      if (!directMatch && reqNormalized !== recFileNormalized) {
        continue;
      }
    }

    const calcType = (record.calculo || "").toLowerCase().trim();

    if (calculoEspecifico === "distribucion_intervalos" || nombre.includes("intervalo")) {
      if (calcType === "distribucion_intervalos" || calcType.includes("intervalo")) {
        return { realizado: true, record };
      }
      continue;
    }

    if (calculoEspecifico === "frecuencias_completas" || nombre.includes("tabla de frecuencias") || (num.includes("2") && !nombre.includes("intervalo"))) {
      if (calcType === "frecuencias_completas" || (calcType.includes("frecuencia") && !calcType.includes("intervalo"))) {
        return { realizado: true, record };
      }
      continue;
    }

    if (num.includes("3") || nombre.includes("tendencia") || nombre.includes("central")) {
      if (calcType.includes("tendencia") || calcType.includes("posicion") || calcType.includes("central") || calcType.includes("media")) return { realizado: true, record };
    }
    if (num.includes("4") || nombre.includes("dispersión") || nombre.includes("dispersion") || nombre.includes("forma") || nombre.includes("variabilidad")) {
      if (calcType.includes("variabilidad") || calcType.includes("forma") || calcType.includes("dispersion") || calcType.includes("varianza")) return { realizado: true, record };
    }
    if (num.includes("5") || nombre.includes("bivariante") || nombre.includes("bivariada")) {
      if (calcType.includes("bivariada") || calcType.includes("bivariante")) return { realizado: true, record };
    }
    if (num.includes("6") || nombre.includes("regresión") || nombre.includes("regresion")) {
      if (calcType.includes("regresion")) return { realizado: true, record };
    }
    if (num.includes("7") || nombre.includes("series") || nombre.includes("tiempo") || nombre.includes("temporales")) {
      if (calcType.includes("series") || calcType.includes("tiempo")) return { realizado: true, record };
    }
    if (num.includes("8") || nombre.includes("índices") || nombre.includes("indices")) {
      if (calcType.includes("indices") || calcType.includes("indice")) return { realizado: true, record };
    }
  }

  return { realizado: false, record: null };
};

export default function Calculos() {
  const { variables, usuario } = useModuleData();
  const location = useLocation();
  const navigate = useNavigate();

  const iniciarTour = () => {
    // Si el modal de creación de tablas está abierto (se detecta por la presencia de #tour-crear-nombre)
    if (document.querySelector('#tour-crear-nombre')) {
      const tourCrearSteps = [
        {
          element: '#tour-crear-nombre',
          popover: {
            title: '1. Asignar un Nombre',
            description: 'Escribe un nombre descriptivo para tu conjunto de datos. Se guardará con formato Excel (.xlsx).',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-crear-generador',
          popover: {
            title: '2. Generar Matriz Rápida',
            description: 'Especifica la cantidad de Observaciones (filas) y Variables (columnas) que deseas crear inicialmente, y haz clic en "Generar". Esto creará la estructura vacía lista para usar.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-crear-herramientas',
          popover: {
            title: '3. Barra de Herramientas',
            description: 'Usa estos botones para agregar más filas, eliminar la última fila, o añadir nuevas columnas (variables). También puedes configurar el tipo de dato de cada columna (número, texto o categorías) haciendo clic en su cabecera.',
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#tour-crear-grilla',
          popover: {
            title: '4. Cuadrícula de Datos',
            description: 'Haz doble clic en cualquier celda para escribir tus datos estadísticos directamente. ¡También puedes copiar rangos de celdas desde un Excel real y pegarlos aquí usando Ctrl+V!',
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#tour-crear-guardar',
          popover: {
            title: '5. Guardar la Tabla',
            description: 'Una vez ingresados todos tus datos, haz clic en "Guardar Tabla" para guardarla en tu base de datos y empezar a analizarla en la calculadora.',
            side: 'left',
            align: 'start'
          }
        }
      ];

      const driverObj = driver({
        showProgress: true,
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        doneBtnText: 'Finalizar',
        progressText: '{{current}} de {{total}}',
        steps: tourCrearSteps
      });
      driverObj.drive();
      return;
    }

    // --- NUEVO: Tour exclusivo si el modal de "Gestión de Datos" está abierto ---
    if (document.querySelector('#tour-datos-archivos')) {
      const driverObj = driver({
        showProgress: true,
        nextBtnText: 'Siguiente',
        prevBtnText: 'Anterior',
        doneBtnText: 'Finalizar',
        progressText: '{{current}} de {{total}}',
        steps: [
            {
                element: '#tour-datos-archivos',
                popover: { title: 'Archivos Subidos', description: 'Aquí puedes seleccionar cualquier archivo Excel que ya hayas subido anteriormente a la base de datos.', side: 'bottom', align: 'start' }
            },
            {
                element: '#tour-datos-upload',
                popover: { title: 'Subir Nuevos Datos', description: 'Si tienes un nuevo archivo Excel, puedes arrastrarlo aquí o hacer clic para subirlo y poder analizarlo.', side: 'bottom', align: 'start' }
            },
            {
                element: '#tour-datos-variables',
                popover: { title: 'Definir Variables', description: 'Una vez cargada tu tabla, aquí puedes definir y nombrar tus variables para que el sistema sepa qué columnas analizar.', side: 'right', align: 'start' }
            },
            {
                element: '#tour-datos-tabla',
                popover: { title: 'Vista de Tabla', description: 'Aquí verás los datos de tu Excel. Selecciona los rangos de celdas para asignarlos a las variables que creaste.', side: 'top', align: 'start' }
            }
        ]
      });
      driverObj.drive();
      return;
    }
    // -------------------------------------------------------------------------

    const tourSteps = [
      {
        element: '#tour-origen-datos',
        popover: {
          title: 'Origen de los Datos',
          description: 'Elige entre "Mis Archivos" para tus hojas de cálculo personales, o "Cursos / Grupos" para usar los datos compartidos por tus docentes.',
          side: "right",
          align: 'start'
        }
      },
      {
        element: '#tour-seleccion-archivo',
        popover: {
          title: 'Selección de Archivo',
          description: 'Elige el libro de Excel y la hoja de trabajo en la que se encuentran los datos estadísticos que deseas analizar.',
          side: "right",
          align: 'start'
        }
      }
    ];

    if (document.querySelector('#tour-seleccion-operacion')) {
      tourSteps.push({
        element: '#tour-seleccion-operacion',
        popover: {
          title: 'Operación Estadística',
          description: 'Selecciona el tema de análisis que vas a realizar (Frecuencias, Intervalos, Regresión, Series de Tiempo, Números Índices, etc.). El tour se adaptará automáticamente a tu elección.',
          side: "right",
          align: 'start'
        }
      });
    }

    // Pasos específicos según la operación seleccionada
    switch (calculo) {
      case "frecuencias_completas":
        if (document.querySelector('#tour-seleccion-variables')) {
          tourSteps.push({
            element: '#tour-seleccion-variables',
            popover: {
              title: 'Variable de Frecuencias',
              description: 'Selecciona una única columna de tipo categórica o cuantitativa discreta para contar sus frecuencias absolutas y relativas.',
              side: "right",
              align: 'start'
            }
          });
        }
        break;

      case "distribucion_intervalos":
        if (document.querySelector('#tour-seleccion-variables')) {
          tourSteps.push({
            element: '#tour-seleccion-variables',
            popover: {
              title: 'Variable Continua e Intervalos',
              description: 'Selecciona una variable numérica continua. Podrás configurar el tipo de intervalo [semiabierto, cerrado, abierto] y el método para calcular el número de clases (como Sturges o manual).',
              side: "right",
              align: 'start'
            }
          });
        }
        break;

      case "tendencia_y_posicion":
        if (document.querySelector('#tour-seleccion-variables')) {
          tourSteps.push({
            element: '#tour-seleccion-variables',
            popover: {
              title: 'Variable y Medidas de Posición',
              description: 'Configura la variable a analizar. En la parte inferior de este panel podrás definir qué Percentil (de 1 a 99) deseas calcular específicamente.',
              side: "right",
              align: 'start'
            }
          });
        }
        break;

      case "variabilidad_y_forma":
        if (document.querySelector('#tour-seleccion-variables')) {
          tourSteps.push({
            element: '#tour-seleccion-variables',
            popover: {
              title: 'Variabilidad, Forma y Boxplot',
              description: 'Estudia la dispersión (Varianza, Desviación Estándar, Coeficiente de Variación) y la simetría de tus datos. Generará un diagrama de caja (Boxplot) interactivo.',
              side: "right",
              align: 'start'
            }
          });
        }
        break;

      case "distribucion_bivariada_avanzada":
        if (document.querySelector('#tour-seleccion-variables')) {
          tourSteps.push({
            element: '#tour-seleccion-variables',
            popover: {
              title: 'Variables Bidimensionales',
              description: 'Para la tabla de contingencia bivariante, debes seleccionar dos variables: la Variable X (filas) y la Variable Y (columnas).',
              side: "right",
              align: 'start'
            }
          });
        }
        break;

      case "regresion_simple":
        if (document.querySelector('#tour-seleccion-variables')) {
          tourSteps.push({
            element: '#tour-seleccion-variables',
            popover: {
              title: 'Regresión y Correlación',
              description: 'Selecciona la Variable X (independiente) y la Variable Y (dependiente) para analizar su relación matemática.',
              side: "right",
              align: 'start'
            }
          });
        }
        break;

      case "series_tiempo":
        if (document.querySelector('#tour-seleccion-variables')) {
          tourSteps.push({
            element: '#tour-seleccion-variables',
            popover: {
              title: 'Eje de Tiempo y Valores Históricos',
              description: 'Selecciona el Eje de Tiempo X (años, meses) y los Valores Históricos Y. Abajo podrás elegir el método de pronóstico (Promedio Móvil Simple, Ponderado o Suavizamiento Exponencial).',
              side: "right",
              align: 'start'
            }
          });
        }
        break;

      case "numeros_indices":
        if (document.querySelector('#tour-seleccion-variables')) {
          tourSteps.push({
            element: '#tour-seleccion-variables',
            popover: {
              title: 'Módulo de Números Índices',
              description: 'Selecciona si deseas calcular Índices Compuestos (Laspeyres, Paasche, Fisher), hacer un Empalme/Cambio de base o realizar una Deflación. Configura los precios y cantidades base y actuales correspondientes.',
              side: "right",
              align: 'start'
            }
          });
        }
        break;

      default:
        if (document.querySelector('#tour-seleccion-variables')) {
          tourSteps.push({
            element: '#tour-seleccion-variables',
            popover: {
              title: 'Configurar Variables',
              description: 'Define qué columnas actuarán como variables (X para análisis unidimensional, X e Y para análisis bidimensional o regresión).',
              side: "right",
              align: 'start'
            }
          });
        }
        break;
    }

    if (document.querySelector('#tour-tabla-grid')) {
      tourSteps.push({
        element: '#tour-tabla-grid',
        popover: {
          title: 'Editor de Datos en Tiempo Real',
          description: '¡Los cálculos se procesan de forma inmediata en la interfaz! Haz doble clic en cualquier celda para corregir o cambiar valores, y verás cómo los coeficientes y gráficos se actualizan automáticamente al presionar Calcular.',
          side: "right",
          align: 'start'
        }
      });
    }

    if (document.querySelector('#tour-btn-calcular')) {
      tourSteps.push({
        element: '#tour-btn-calcular',
        popover: {
          title: 'Procesar Cálculos',
          description: 'Haz clic aquí para ejecutar el motor estadístico sobre tus datos y rellenar el panel de resultados.',
          side: "right",
          align: 'start'
        }
      });
    }

    if (document.querySelector('#tour-btn-toggle-panel')) {
      tourSteps.push({
        element: '#tour-btn-toggle-panel',
        popover: {
          title: 'Ocultar/Mostrar Panel',
          description: 'Haz clic aquí para colapsar por completo el panel de configuración lateral y ampliar el área de resultados, brindando mayor espacio de visualización de tablas y gráficos.',
          side: "right",
          align: 'start'
        }
      });
    }

    tourSteps.push({
      element: '#tour-resultados-panel',
      popover: {
        title: 'Panel de Resultados',
        description: 'Aquí verás las tablas de distribución, estadígrafos calculados, fórmulas paso a paso y los gráficos dinámicos del análisis.',
        side: "left",
        align: 'start'
      }
    });

    if (document.querySelector('#tour-btn-gestion')) {
      tourSteps.push({
        element: '#tour-btn-gestion',
        popover: {
          title: 'Gestión de Datos',
          description: 'Abre el panel de administración de tus archivos de Excel, donde podrás subir nuevos libros, eliminar los antiguos o alternar entre el espacio personal y el de tus cursos asignados. (Versión de prueba (Beta) - Aún se encuentra en fase de desarrollo)',
          side: "left",
          align: 'start'
        }
      });
    }

    if (document.querySelector('#tour-btn-crear-tabla')) {
      tourSteps.push({
        element: '#tour-btn-crear-tabla',
        popover: {
          title: 'Crear Tabla',
          description: 'Diseña y crea tablas dinámicas personalizadas de datos desde cero, ingresando directamente valores en filas y columnas sin requerir un archivo de Excel previo.',
          side: "left",
          align: 'start'
        }
      });
    }

    if (document.querySelector('#tour-acciones-finales')) {
      tourSteps.push({
        element: '#tour-acciones-finales',
        popover: {
          title: 'Exportar y Guardar',
          description: 'Descarga un reporte académico formal en formato PDF o guarda este cálculo en tu Historial para reabrirlo más tarde.',
          side: "top",
          align: 'center'
        }
      });
    }

    if (document.querySelector('#tour-btn-guia-rapida')) {
      tourSteps.push({
        element: '#tour-btn-guia-rapida',
        popover: {
          title: 'Guía Rápida',
          description: 'Reinicia este tour interactivo en cualquier momento si necesitas recordar el propósito de algún componente.',
          side: "right",
          align: 'start'
        }
      });
    }

    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Finalizar',
      progressText: '{{current}} de {{total}}',
      steps: tourSteps
    });
    driverObj.drive();
  };

  const [files, setFiles] = useState([]);
  const [ordenGraficos, setOrdenGraficos] = useState([]);
  const [selectedFile, setSelectedFile] = useState(
    location.state?.sinArchivo ? "" : (location.state?.archivoReabrir || "")
  );
  const [selectedSheet, setSelectedSheet] = useState(0);
  const [mostrarTabla, _setMostrarTabla] = useState(true);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
  const [filtroFractil, setFiltroFractil] = useState("Cuartil");
  const [panelAbierto, setPanelAbierto] = useState(true);
  const [modoCreacion, setModoCreacion] = useState(false);

  // Estados para diferenciar origen de archivos y gestionar selección de cursos
  const [origenArchivos, setOrigenArchivos] = useState(location.state?.origenArchivos || "personal"); // "personal" o "curso"
  const [misCursos, setMisCursos] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(location.state?.cursoSeleccionado ? String(location.state.cursoSeleccionado) : "");

  // 1. ESTADO DEL HISTORIAL
  const snapshotInicial = location.state?.snapshot?.datosSnapshot || null;
  const [datosHistorial, setDatosHistorial] = useState(snapshotInicial);

  // Estado para controlar qué tablas de desarrollo se incluyen en el reporte PDF
  const [tablasDesarrolloReporte, setTablasDesarrolloReporte] = useState({});

  // Estado para controlar qué modelos de regresión están activos (visibles) en el gráfico y las tablas
  const [modelosVisibles, setModelosVisibles] = useState({});

  const {
    excelData, columns, selectedColumn, setSelectedColumn, selectedColumnY, setSelectedColumnY,
    resultado, calculo, setCalculo, tipoIntervalo, setTipoIntervalo, metodoK, setMetodoK,
    kPersonalizado, setKPersonalizado, percentilK, setPercentilK, handleChangeDato, ejecutarCalculo, errorNumerico,
    metodoSeries, setMetodoSeries, periodosK, setPeriodosK, pesos, setPesos, alfa, setAlfa,
    subTemaIndices, setSubTemaIndices, colPrecioBase, setColPrecioBase, colCantidadBase, setColCantidadBase,
    colPrecioActual, setColPrecioActual, colCantidadActual, setColCantidadActual, nuevoIndiceBase, setNuevoIndiceBase,
    conPonderacion, setConPonderacion, tipoIndiceSimple, setTipoIndiceSimple,
    conColumnaItem, setConColumnaItem, columnaItem, setColumnaItem,
    handleActualizarColumna, handleCrearColumna,
  } = useCalculadoraExcel(selectedFile, selectedSheet, datosHistorial, origenArchivos === "curso" ? cursoSeleccionado : "");


  // 🚀 2. EL BLINDAJE: Memoria interna para detectar cambios REALES
  const estadosActuales = useRef({
    archivo: selectedFile,
    hoja: selectedSheet,
    colX: selectedColumn,
    colY: selectedColumnY
  });

  // Mantenemos la memoria actualizada de forma silenciosa
  useEffect(() => {
    estadosActuales.current = { archivo: selectedFile, hoja: selectedSheet, colX: selectedColumn, colY: selectedColumnY };
  }, [selectedFile, selectedSheet, selectedColumn, selectedColumnY]);

  // Funciones protegidas: Solo rompen el historial si el usuario ELIGE algo diferente
  const handleCambioArchivo = useCallback((e) => {
    const valor = e?.target?.value !== undefined ? e.target.value : e;
    if (valor !== estadosActuales.current.archivo) {
      setSelectedFile(valor);
      setDatosHistorial(null);
    }
  }, []);

  const handleCambioHoja = useCallback((e) => {
    const valor = e?.target?.value !== undefined ? e.target.value : e;
    if (valor !== "" && valor !== undefined) {
      const numValor = Number(valor);
      if (numValor !== estadosActuales.current.hoja) {
        setSelectedSheet(numValor);
        setDatosHistorial(null);
      }
    }
  }, []);

  const handleCambioColX = useCallback((e) => {
    const valor = e?.target?.value !== undefined ? e.target.value : e;
    if (valor !== estadosActuales.current.colX) {
      setSelectedColumn(valor);
      setDatosHistorial(null);
    }
  }, [setSelectedColumn]);

  const handleCambioColY = useCallback((e) => {
    const valor = e?.target?.value !== undefined ? e.target.value : e;
    if (valor !== estadosActuales.current.colY) {
      setSelectedColumnY(valor);
      setDatosHistorial(null);
    }
  }, [setSelectedColumnY]);

  const salirModoHistorialManual = () => setDatosHistorial(null);

  // --- RESTO DEL CÓDIGO INTACTO ---
  const calculoPendiente = useRef(false);

  useEffect(() => {
    if (location.state && !calculoPendiente.current) {
      const { 
        archivoReabrir, 
        calculoReabrir, 
        snapshot, 
        sinArchivo,
        origenArchivos: navOrigen, 
        cursoSeleccionado: navCurso 
      } = location.state;

      if (navOrigen) {
        setOrigenArchivos(navOrigen);
      }
      if (navCurso) {
        setCursoSeleccionado(String(navCurso));
      }
      if (sinArchivo) {
        setSelectedFile("");
        setDatosHistorial(null);
      } else if (archivoReabrir) {
        setSelectedFile(archivoReabrir);
        if (snapshot?.datosSnapshot) {
          setDatosHistorial(snapshot.datosSnapshot);
        }
      }
      if (calculoReabrir) {
        setCalculo(calculoReabrir);
      }

      if (snapshot && snapshot.configuracion) {
        const conf = snapshot.configuracion;

        // Restaurar Columnas
        if (conf.columnasSeleccionadas && conf.columnasSeleccionadas.x) {
          setSelectedColumn(conf.columnasSeleccionadas.x);
          setSelectedColumnY(conf.columnasSeleccionadas.y || "");
        }

        // Restaurar Parámetros Tema 2, 3 y 4
        if (conf.tipoIntervalo) setTipoIntervalo(conf.tipoIntervalo);
        if (conf.metodoK) setMetodoK(conf.metodoK);
        if (conf.kPersonalizado) setKPersonalizado(conf.kPersonalizado);
        if (conf.percentilK) setPercentilK(conf.percentilK); // 👈 TEMA 3: PERCENTILES

        // Restaurar Parámetros Series de Tiempo
        if (conf.metodoSeries) setMetodoSeries(conf.metodoSeries);
        if (conf.periodosK) setPeriodosK(conf.periodosK);
        if (conf.pesos) setPesos(conf.pesos);
        if (conf.alfa) setAlfa(conf.alfa);

        // 👈 TEMA 8: NÚMEROS ÍNDICES COMPLETO
        if (conf.subTemaIndices) setSubTemaIndices(conf.subTemaIndices);
        if (conf.colPrecioBase) setColPrecioBase(conf.colPrecioBase);
        if (conf.colCantidadBase) setColCantidadBase(conf.colCantidadBase);
        if (conf.colPrecioActual) setColPrecioActual(conf.colPrecioActual);
        if (conf.colCantidadActual) setColCantidadActual(conf.colCantidadActual);
        if (conf.nuevoIndiceBase) setNuevoIndiceBase(conf.nuevoIndiceBase);
        if (conf.conPonderacion !== undefined) setConPonderacion(conf.conPonderacion);
        if (conf.tipoIndiceSimple) setTipoIndiceSimple(conf.tipoIndiceSimple);
        if (conf.conColumnaItem !== undefined) setConColumnaItem(conf.conColumnaItem);
        if (conf.columnaItem) setColumnaItem(conf.columnaItem);

        calculoPendiente.current = true;
      }
      window.history.replaceState({}, document.title);
    }
  }, [
    location.state, setCalculo, setSelectedColumn, setSelectedColumnY,
    setTipoIntervalo, setMetodoK, setKPersonalizado, setPercentilK,
    setMetodoSeries, setPeriodosK, setPesos, setAlfa,
    setSubTemaIndices, setColPrecioBase, setColCantidadBase, setColPrecioActual, setColCantidadActual, setNuevoIndiceBase,
    setConPonderacion, setTipoIndiceSimple, setConColumnaItem, setColumnaItem
  ]);

  useEffect(() => {
    if (calculoPendiente.current && excelData && excelData.length > 0) {
      const timer = setTimeout(() => {
        ejecutarCalculo();
        alerta.exito("Historial Cargado", "Se restauró el cálculo guardado.");
      }, 400);
      calculoPendiente.current = false;
      return () => clearTimeout(timer);
    }
  }, [excelData, ejecutarCalculo]);

  const formatearCelda = (valor) => {
    if (typeof valor === "number") return Number.isInteger(valor) ? valor : Number(valor).toFixed(2);
    if (!isNaN(parseFloat(valor)) && isFinite(valor)) {
      const num = Number(valor);
      return Number.isInteger(num) ? num : num.toFixed(2);
    }
    return valor;
  };

  const cargarCursos = async () => {
    if (!usuario) return;
    try {
      const correoUsuario = usuario.email || usuario.id;
      const esAdmin = usuario.rol === "Administrador" || usuario.isAdmin === true;
      const esDocente = usuario.rol === "Docente";

      let res;
      if (esDocente || esAdmin) {
        res = await fetch(`${BASE_URL}/mis_clases/${correoUsuario}`);
      } else {
        res = await fetch(`${BASE_URL}/mis_inscripciones/${correoUsuario}`);
      }

      if (res.ok) {
        const data = await res.json();
        setMisCursos(data);
      }
    } catch (error) {
      console.error("Error al cargar cursos para la calculadora:", error);
    }
  };

  const cargarArchivos = async (nuevoNombre = "") => {
    if (!usuario) return;
    try {
      let data;
      if (origenArchivos === "curso") {
        if (!cursoSeleccionado) {
          setFiles([]);
          return;
        }
        data = await api.obtenerArchivos(usuario.nombre, "privado", cursoSeleccionado);
      } else {
        data = await api.obtenerArchivos(usuario.nombre, "personal");
      }
      if (data && data.files) {
        setFiles(data.files);
        if (nuevoNombre) {
          const nombreCompleto = nuevoNombre.endsWith(".xlsx") ? nuevoNombre : `${nuevoNombre}.xlsx`;
          setSelectedFile(nombreCompleto);
        } else if (location.state?.sinArchivo) {
          setSelectedFile("");
        } else if (location.state?.archivoReabrir) {
          const targetName = location.state.archivoReabrir.toLowerCase().trim();
          const match = data.files.find(f => 
            (f.filename && f.filename.toLowerCase().trim() === targetName) ||
            (location.state.archivoSeleccionadoId && f.id === location.state.archivoSeleccionadoId)
          );
          if (match) {
            setSelectedFile(match.filename);
          } else if (data.files.length > 0 && !selectedFile) {
            setSelectedFile(data.files[0].filename);
          }
        } else if (!selectedFile && data.files.length > 0 && !location.state?.sinArchivo && !tareaContexto) {
          setSelectedFile(data.files[0].filename);
        }
      } else {
        setFiles([]);
      }
    } catch (error) {
      console.error("Error al cargar archivos:", error);
      setFiles([]);
    }
  };

  useEffect(() => {
    cargarCursos();
  }, [usuario]);

  useEffect(() => {
    cargarArchivos();
  }, [usuario, origenArchivos, cursoSeleccionado]);

  useEffect(() => {
    const handleTablaCreada = (e) => {
      const nuevoNombre = e.detail?.nombre;
      cargarArchivos(nuevoNombre);
    };
    window.addEventListener("tabla-creada", handleTablaCreada);
    return () => {
      window.removeEventListener("tabla-creada", handleTablaCreada);
    };
  }, [usuario, origenArchivos, cursoSeleccionado]);

  // Contexto de tarea si se abrió la calculadora desde una tarea específica
  const tareaContexto = useMemo(() => {
    if (location.state?.tareaId) {
      return {
        id: location.state.tareaId,
        titulo: location.state.tareaTitulo || "Tarea Asignada",
        claseId: location.state.cursoSeleccionado
      };
    }
    try {
      const stored = sessionStorage.getItem("tarea_contexto_calculadora");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
  }, [location.state]);

  const [tareaDetalle, setTareaDetalle] = useState(null);
  const [entregaTarea, setEntregaTarea] = useState(null);
  const [temasTareaEstado, setTemasTareaEstado] = useState([]);
  const [enviandoTarea, setEnviandoTarea] = useState(false);

  const cargarEstadoTarea = useCallback(async () => {
    const activeTareaId = tareaContexto?.id || tareaContexto?.tareaId;
    if (!activeTareaId || !usuario?.nombre) {
      setTareaDetalle(null);
      setEntregaTarea(null);
      setTemasTareaEstado([]);
      return;
    }

    try {
      let tareaObj = null;
      try {
        const resT = await fetch(`${BASE_URL}/tareas/${activeTareaId}`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
        });
        if (resT.ok) {
          tareaObj = await resT.json();
          setTareaDetalle(tareaObj);
        }
      } catch (e) {
        console.error("Error al cargar detalle de tarea:", e);
      }

      try {
        const resE = await fetch(`${BASE_URL}/tareas/entregas/${activeTareaId}/mi-entrega`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
        });
        if (resE.ok) {
          const entregaData = await resE.json();
          setEntregaTarea(entregaData);
        } else {
          setEntregaTarea(null);
        }
      } catch (e) {
        setEntregaTarea(null);
      }

      let hist = [];
      try {
        const resH = await api.obtenerHistorial(usuario.nombre);
        if (resH && resH.historial) {
          hist = resH.historial;
        }
      } catch (e) {
        console.error("Error cargando historial para tarea:", e);
      }

      const textoEjercicios = tareaObj?.ejercicios_seleccionados || tareaContexto?.ejercicios_seleccionados || "Todos los temas";
      const parsed = parseEjerciciosAsignadosCalc(textoEjercicios);
      
      let entregaBaseFile = "";
      if (entregaTarea?.datos_respuesta) {
        try {
          const p = JSON.parse(entregaTarea.datos_respuesta);
          entregaBaseFile = p.archivo_base || "";
        } catch (e) {}
      }

      const archivoDeHist = (hist || []).find(r => {
        const snap = parseSnapshotDataCalc(r.snapshot);
        const recTareaId = snap?.tarea_id || snap?.configuracion?.tarea_id || r.tarea_id;
        return recTareaId && String(recTareaId) === String(activeTareaId);
      })?.archivo_origen;

      const archivoReq = tareaObj?.archivo_nombre || entregaBaseFile || archivoDeHist || "";

      if ((tareaObj?.archivo_nombre || archivoReq) && !selectedFile && !location.state?.sinArchivo) {
        setSelectedFile(tareaObj?.archivo_nombre || archivoReq);
      }

      if (parsed && parsed.length > 0) {
        const evaluados = parsed.map(t => {
          const { realizado, record } = verificarTemaRealizadoCalc(t, hist, archivoReq, activeTareaId);
          return {
            ...t,
            realizado,
            calculoGuardado: record
          };
        });
        setTemasTareaEstado(evaluados);
      } else {
        setTemasTareaEstado([]);
      }
    } catch (err) {
      console.error("Error global cargando estado de tarea en calculadora:", err);
    }
  }, [tareaContexto, usuario, selectedFile]);

  useEffect(() => {
    cargarEstadoTarea();
  }, [cargarEstadoTarea]);

  const handleEnviarTareaDesdeCalculadora = async () => {
    if (tareaYaEntregada) {
      alerta.advertencia("Tarea ya entregada", "Esta tarea ya ha sido entregada y no se pueden realizar nuevas entregas.");
      return;
    }
    const activeTareaId = tareaContexto?.id || tareaContexto?.tareaId;
    if (!activeTareaId) return;

    if (tareaDetalle?.fecha_limite && new Date(tareaDetalle.fecha_limite).getTime() < Date.now()) {
      alerta.error("Plazo vencido", "La fecha límite para entregar esta tarea ha vencido.");
      return;
    }

    const incompletos = temasTareaEstado.filter(t => !t.realizado);
    if (incompletos.length > 0) {
      alerta.advertencia("Cálculos pendientes", `Aún faltan ${incompletos.length} cálculo(s) requeridos por guardar para esta tarea.`);
      return;
    }

    setEnviandoTarea(true);
    try {
      const resumenResultados = temasTareaEstado.map(t => ({
        numero: t.numero,
        nombre: t.nombre,
        calculoTipo: t.calculoGuardado?.calculo || t.calculoTipo,
        fechaCalculo: t.calculoGuardado?.fecha,
        horaCalculo: t.calculoGuardado?.hora,
        archivoOrigen: t.calculoGuardado?.archivo_origen,
        snapshot: t.calculoGuardado?.snapshot
      }));

      const datosRespuestaFinal = JSON.stringify({
        archivo_base: tareaDetalle?.archivo_nombre || selectedFile || "Sin archivo",
        fecha_entrega: new Date().toISOString(),
        temas_completados: resumenResultados
      });

      const res = await fetch(`${BASE_URL}/tareas/entregas/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          tarea_id: activeTareaId,
          datos_respuesta: datosRespuestaFinal
        })
      });

      const data = await res.json();
      if (res.ok) {
        alerta.success("¡Tarea Entregada!", "Has entregado la tarea con todos tus cálculos validados.");
        setEntregaTarea(data);
      } else {
        alerta.error("Error al entregar", data.detail || "No se pudo entregar la tarea");
      }
    } catch (err) {
      console.error(err);
      alerta.error("Error", "Ocurrió un error al enviar la tarea.");
    } finally {
      setEnviandoTarea(false);
    }
  };

  const handleGuardarResultado = async () => {
    if (!usuario) return;
    if (tareaYaEntregada) {
      alerta.advertencia("Tarea Entregada", "Los cálculos de esta tarea están congelados en modo solo lectura porque ya ha sido entregada.");
      return;
    }
    try {
      const activeTareaId = tareaContexto?.id || tareaContexto?.tareaId || null;
      const activeTareaTitulo = tareaContexto?.titulo || tareaContexto?.tareaTitulo || null;

      const snapshotCompleto = {
        datosSnapshot: excelData,
        configuracion: {
          calculo, tipoIntervalo, metodoK, kPersonalizado, percentilK,
          metodoSeries, periodosK, pesos, alfa, subTemaIndices,
          colPrecioBase, colCantidadBase, colPrecioActual, colCantidadActual, nuevoIndiceBase,
          columnasSeleccionadas: { x: selectedColumn, y: selectedColumnY },
          conPonderacion, tipoIndiceSimple, conColumnaItem, columnaItem,
          tarea_id: activeTareaId,
          tarea_titulo: activeTareaTitulo,
          curso_id: origenArchivos === "curso" ? cursoSeleccionado : (location.state?.cursoSeleccionado || null)
        },
        resultadoFinal: resultado,
        tarea_id: activeTareaId,
      };
      await api.guardarEnHistorial(usuario.nombre, calculo, selectedFile, snapshotCompleto);
      if (activeTareaId) {
        alerta.exito("¡Cálculo Guardado para la Tarea!", `El cálculo se guardó y vinculó exclusivamente a «${activeTareaTitulo || 'esta tarea'}».`);
        // Actualizar el estado de la tarea en la barra superior de inmediato
        await cargarEstadoTarea();
      } else {
        alerta.exito("¡Guardado Permanentemente!", "El cálculo completo está en el historial.");
      }
    } catch (error) {
      console.error(error);
      alerta.error("Error", "No se pudo guardar el snapshot.");
    }
  };

  const totalTemasTarea = temasTareaEstado.length;
  const temasCompletadosTarea = temasTareaEstado.filter(t => t.realizado).length;
  const todosTemasCompletados = totalTemasTarea > 0 && temasCompletadosTarea === totalTemasTarea;
  const porcentajeProgresoTarea = totalTemasTarea > 0 ? Math.round((temasCompletadosTarea / totalTemasTarea) * 100) : 0;
  const tareaYaEntregada = Boolean(entregaTarea) || Boolean(location.state?.tareaEntregada) || Boolean(location.state?.soloLectura) || Boolean(tareaContexto?.tareaEntregada);

  const esIntervalo = calculo === "distribucion_intervalos";
  const esUnidimensional = ["frecuencias_completas", "distribucion_intervalos", "estadistica_descriptiva", "tendencia_central", "medidas_posicion", "tendencia_y_posicion", "variabilidad_y_forma"].includes(calculo);
  const esBivariada = ["distribucion_bivariada", "distribucion_bivariada_avanzada"].includes(calculo);

  const handleGridChange = (newRows, { indexes, column }) => {
    if (tareaYaEntregada) return;
    indexes.forEach((index) => {
      handleChangeDato(index, column.key, newRows[index][column.key]);
    });
  };

  return (
    <>
      {/* Botón Flotante para Guía Rápida */}
      <button
        id="tour-btn-guia-rapida"
        onClick={iniciarTour}
        className="guia-rapida-flotante"
        style={{
          bottom: '20px',
          zIndex: 10000
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="guia-rapida-flotante-texto">Guía Rápida</span>
      </button>

      {/* Banner superior de tarea activa si está en modo resolución de tarea */}
      {tareaContexto && (
        <div style={{
          background: "linear-gradient(90deg, #0f172a, #1e293b)",
          borderBottom: "1px solid rgba(59, 130, 246, 0.35)",
          color: "#ffffff",
          padding: "10px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 3px 12px rgba(0,0,0,0.25)",
          zIndex: 60,
          fontSize: "0.86rem",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          {/* Lado izquierdo: Título y descripción limpia */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <span style={{ 
              background: tareaYaEntregada ? "rgba(39, 174, 96, 0.2)" : "rgba(59, 130, 246, 0.2)", 
              border: tareaYaEntregada ? "1px solid rgba(39, 174, 96, 0.45)" : "1px solid rgba(59, 130, 246, 0.45)", 
              color: tareaYaEntregada ? "#2ecc71" : "#60a5fa", 
              padding: "4px 10px", 
              borderRadius: "8px", 
              fontSize: "0.75rem", 
              fontWeight: "700", 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "6px",
              letterSpacing: "0.3px"
            }}>
              {tareaYaEntregada ? <><CheckCircle2 size={15} /> Tarea Entregada (Solo Lectura)</> : <><BookOpenCheck size={15} /> Modo Tarea</>}
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                {tareaYaEntregada ? "Cálculo entregado para:" : "Resolviendo para:"}
              </span>
              <span style={{ color: "#ffffff", fontWeight: "700", fontSize: "0.92rem" }}>
                {tareaContexto.titulo || tareaContexto.tareaTitulo}
              </span>
            </div>

            <span style={{ fontSize: "0.76rem", color: tareaYaEntregada ? "#a7f3d0" : "#94a3b8", display: "inline-flex", alignItems: "center", gap: "4px" }}>
              • {tareaYaEntregada ? "Esta tarea ya ha sido entregada. Los cálculos se encuentran en modo solo lectura." : "Los cálculos guardados se vincularán únicamente a esta tarea"}
            </span>
          </div>

          {/* Lado derecho: Progreso y Botones de Acción */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {/* Medidor de Progreso */}
            {totalTemasTarea > 0 && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                background: todosTemasCompletados || tareaYaEntregada ? "rgba(16, 185, 129, 0.18)" : "rgba(255, 255, 255, 0.08)",
                border: todosTemasCompletados || tareaYaEntregada ? "1px solid rgba(16, 185, 129, 0.45)" : "1px solid rgba(255, 255, 255, 0.15)",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: "600",
                color: todosTemasCompletados || tareaYaEntregada ? "#34d399" : "#e2e8f0"
              }}>
                {todosTemasCompletados || tareaYaEntregada ? (
                  <CheckCircle2 size={14} style={{ color: "#34d399" }} />
                ) : (
                  <Clock size={14} style={{ color: "#f59e0b" }} />
                )}
                <span>
                  Progreso: <b>{temasCompletadosTarea}</b> de <b>{totalTemasTarea}</b> {totalTemasTarea === 1 ? 'cálculo' : 'cálculos'} ({porcentajeProgresoTarea}%)
                </span>
              </div>
            )}

            {/* Badge de Tarea Entregada */}
            {tareaYaEntregada && (
              <span style={{
                background: "rgba(16, 185, 129, 0.2)",
                border: "1px solid #10b981",
                color: "#34d399",
                padding: "5px 12px",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: "700",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}>
                <CheckCircle2 size={14} /> Tarea Entregada
              </span>
            )}

            {/* Botón de Enviar Tarea cuando todos los cálculos están completos */}
            {!tareaYaEntregada && todosTemasCompletados && (
              <button
                type="button"
                onClick={handleEnviarTareaDesdeCalculadora}
                disabled={enviandoTarea}
                title="Entregar la tarea con todos los cálculos validados"
                style={{
                  background: "linear-gradient(135deg, #10b981, #059669)",
                  color: "#ffffff",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  cursor: enviandoTarea ? "not-allowed" : "pointer",
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 10px rgba(16, 185, 129, 0.35)",
                  transition: "all 0.2s ease"
                }}
              >
                <Send size={14} /> {enviandoTarea ? "Enviando..." : "Enviar Tarea"}
              </button>
            )}

            {/* Botón Volver a Tareas */}
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem("tarea_contexto_calculadora");
                navigate("/tareas");
              }}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                color: "#e2e8f0",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                padding: "6px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.8rem",
                fontWeight: "600",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.18)"; e.currentTarget.style.color = "#ffffff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"; e.currentTarget.style.color = "#e2e8f0"; }}
            >
              <ArrowLeft size={14} /> Volver a Tareas
            </button>
          </div>
        </div>
      )}

      <div className={`calculadora-layout ${panelAbierto ? "" : "colapsado"}`} style={{ position: "relative" }}>

        <PanelConfiguracion
          panelAbierto={panelAbierto} setPanelAbierto={setPanelAbierto}
          files={files}
          origenArchivos={origenArchivos} setOrigenArchivos={setOrigenArchivos}
          misCursos={misCursos}
          cursoSeleccionado={cursoSeleccionado} setCursoSeleccionado={setCursoSeleccionado}
          selectedFile={selectedFile} setSelectedFile={handleCambioArchivo}
          selectedSheet={selectedSheet} setSelectedSheet={handleCambioHoja}
          selectedColumn={selectedColumn} setSelectedColumn={handleCambioColX}
          selectedColumnY={selectedColumnY} setSelectedColumnY={handleCambioColY}
          usuario={usuario} columns={columns} variables={variables}
          calculo={calculo} setCalculo={setCalculo}
          subTemaIndices={subTemaIndices} setSubTemaIndices={setSubTemaIndices}
          colPrecioBase={colPrecioBase} setColPrecioBase={setColPrecioBase}
          colCantidadBase={colCantidadBase} setColCantidadBase={setColCantidadBase}
          colPrecioActual={colPrecioActual} setColPrecioActual={setColPrecioActual}
          colCantidadActual={colCantidadActual} setColCantidadActual={setColCantidadActual}
          nuevoIndiceBase={nuevoIndiceBase} setNuevoIndiceBase={setNuevoIndiceBase}
          conPonderacion={conPonderacion} setConPonderacion={setConPonderacion}
          tipoIndiceSimple={tipoIndiceSimple} setTipoIndiceSimple={setTipoIndiceSimple}
          conColumnaItem={conColumnaItem} setConColumnaItem={setConColumnaItem}
          columnaItem={columnaItem} setColumnaItem={setColumnaItem}
          esBivariada={esBivariada} esUnidimensional={esUnidimensional}
          metodoSeries={metodoSeries} setMetodoSeries={setMetodoSeries}
          periodosK={periodosK} setPeriodosK={setPeriodosK} pesos={pesos} setPesos={setPesos} alfa={alfa} setAlfa={setAlfa}
          tipoIntervalo={tipoIntervalo} setTipoIntervalo={setTipoIntervalo}
          metodoK={metodoK} setMetodoK={setMetodoK} kPersonalizado={kPersonalizado} setKPersonalizado={setKPersonalizado} percentilK={percentilK} setPercentilK={setPercentilK}
          mostrarTabla={mostrarTabla} excelData={excelData} handleGridChange={handleGridChange}
          ejecutarCalculo={ejecutarCalculo} modoCreacion={modoCreacion} setModoCreacion={setModoCreacion}
          mostrarCalculadora={mostrarCalculadora} setMostrarCalculadora={setMostrarCalculadora}
          handleActualizarColumna={handleActualizarColumna}
          handleCrearColumna={handleCrearColumna}
          tareaYaEntregada={tareaYaEntregada}
        />

        <PanelResultados
          modoCreacion={modoCreacion} setModoCreacion={setModoCreacion} cargarArchivos={cargarArchivos}
          resultado={resultado} errorNumerico={errorNumerico} calculo={calculo}
          esBivariada={esBivariada} esUnidimensional={esUnidimensional} esIntervalo={esIntervalo}
          formatearCelda={formatearCelda} filtroFractil={filtroFractil} setFiltroFractil={setFiltroFractil}
          ordenGraficos={ordenGraficos} setOrdenGraficos={setOrdenGraficos}
          handleGuardarResultado={handleGuardarResultado}
          selectedColumn={selectedColumn}
          selectedColumnY={selectedColumnY}
          tablasDesarrolloReporte={tablasDesarrolloReporte}
          setTablasDesarrolloReporte={setTablasDesarrolloReporte}
          modelosVisibles={modelosVisibles}
          setModelosVisibles={setModelosVisibles}
          tareaYaEntregada={tareaYaEntregada}
        />

        <ReportePDF
          usuario={usuario} calculo={calculo} selectedFile={selectedFile} selectedSheet={selectedSheet} selectedColumn={selectedColumn}
          selectedColumnY={selectedColumnY}
          resultado={resultado} esBivariada={esBivariada} esUnidimensional={esUnidimensional} esIntervalo={esIntervalo}
          formatearCelda={formatearCelda} filtroFractil={filtroFractil} setFiltroFractil={setFiltroFractil}
          ordenGraficos={ordenGraficos}
          tablasDesarrolloReporte={tablasDesarrolloReporte}
          modelosVisibles={modelosVisibles}
          parametros={{ tipoIntervalo, metodoK, kPersonalizado, percentilK, metodoSeries, periodosK, pesos, alfa, subTemaIndices, colPrecioBase, colCantidadBase, nuevoIndiceBase }}
        />
      </div>
    </>
  );
}

