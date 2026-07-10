import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { DataGrid } from "react-data-grid";
import { alerta } from '../../utils/Notificaciones';

import "../../styles/components/excel/ExcelReader.css";

// Función para convertir números a letras (0->A, 1->B, 26->AA) ¡Igual que Excel!
const getExcelColumnName = (colIndex) => {
  let dividend = colIndex + 1;
  let colName = '';
  let modulo;
  while (dividend > 0) {
    modulo = (dividend - 1) % 26;
    colName = String.fromCharCode(65 + modulo) + colName;
    dividend = Math.floor((dividend - modulo) / 26);
  }
  return colName;
};

export default function ExcelReader() {
  const [workbook, setWorkbook] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);

  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const resetearEstado = () => {
    setFileName("");
    setWorkbook(null);
    setSheets([]);
    setRows([]);
    setColumns([]);
    setLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // --- LÓGICA OPTIMIZADA ---
  const processSheet = (ws) => {
    try {
      if (!ws) throw new Error("La hoja está vacía o no existe.");

      const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      
      if (!jsonData || jsonData.length === 0) {
        setColumns([]);
        setRows([]);
        alerta.warning("Hoja vacía", "La hoja seleccionada no tiene datos.");
        setLoading(false);
        return;
      }

      let maxCols = 0;
      jsonData.forEach(row => {
        if (row.length > maxCols) maxCols = row.length;
      });

      if (maxCols === 0) {
        setColumns([]);
        setRows([]);
        setLoading(false);
        return;
      }

      const cols = [];
      for (let i = 0; i < maxCols; i++) {
        cols.push({
          key: i.toString(),
          name: getExcelColumnName(i),
          resizable: true,
          width: 150,
          minWidth: 80
        });
      }

      const rowsFormatted = jsonData.map((row) => {
        let rowObj = {};
        for (let i = 0; i < maxCols; i++) {
          const cellValue = row[i];
          rowObj[i.toString()] = cellValue !== undefined && cellValue !== null ? String(cellValue) : "";
        }
        return rowObj;
      });

      setColumns(cols);
      setRows(rowsFormatted);

    } catch (err) {
      console.error("Error al construir la tabla:", err);
      resetearEstado();
      alerta.error("Error de formato", "El contenido de esta hoja no se puede mostrar.");
    } finally {
      setLoading(false); 
    }
  };

  // --- LECTURA DE ARCHIVO ---
  const procesarArchivoLocal = (file) => {
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    if (extension !== "xlsx" && extension !== "xls") {
      alerta.warning("Formato incorrecto", "Por favor, selecciona solo archivos de Excel (.xlsx, .xls)");
      resetearEstado();
      return; 
    }

    setFileName(file.name);
    setLoading(true);

    const reader = new FileReader();

    reader.onerror = () => {
      alerta.error("Error del sistema", "No se pudo leer el archivo.");
      resetearEstado();
    };

    reader.onload = (evt) => {
      setTimeout(() => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: "binary" });

          if (!wb.SheetNames || wb.SheetNames.length === 0) {
            throw new Error("El archivo no tiene hojas válidas.");
          }

          setWorkbook(wb);
          setSheets(wb.SheetNames);
          setActiveSheetIndex(0);
          
          processSheet(wb.Sheets[wb.SheetNames[0]]);

        } catch (error) {
          console.error("Error crítico de XLSX:", error);
          alerta.error("Archivo no válido", "Asegúrate de que sea un Excel real y no esté corrupto.");
          resetearEstado();
        }
      }, 50);
    };
    
    reader.readAsBinaryString(file);
  };

  const handleFile = (e) => procesarArchivoLocal(e.target.files[0]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      procesarArchivoLocal(e.dataTransfer.files[0]);
    }
  };

  const handleSheetChange = (e) => {
    if (!workbook) return;
    setLoading(true);
    const newIndex = Number(e.target.value);
    setActiveSheetIndex(newIndex);
    setTimeout(() => {
        processSheet(workbook.Sheets[sheets[newIndex]]);
    }, 50);
  };

  return (
    <div className="container_reader">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="container_reader_lectura"
        style={{
          border: isDragging ? "2px dashed var(--accent-color)" : "2px dashed var(--border-color)",
          backgroundColor: isDragging ? "var(--bg-hover, transparent)" : "var(--bg-card)",
          cursor: isDragging ? "copy" : "default"
        }}
      >
        <input
          id="localFileInput"
          type="file"
          accept=".xlsx, .xls"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFile}
        />

        <div className="container_reader_campo">
          <h6>
            {isDragging ? "¡Suelta el archivo aquí!" : "Abre tu tabla local (Solo Lectura)"}
          </h6>
          <p>Formatos soportados: .xlsx, .xls</p>
        </div>

        <div className="container_reader_file">
          <label
            htmlFor="localFileInput"
            // Hover limpio con opacidad
            onMouseOver={(e) => e.target.style.opacity = "0.7"}
            onMouseOut={(e) => e.target.style.opacity = "1"}
          >
            Explorar archivos
          </label>
          <span style={{
            color: fileName ? "var(--accent-color)" : "var(--text-muted)",
            fontStyle: fileName ? "normal" : "italic",
            fontWeight: fileName ? "bold" : "normal",
          }}>
            {fileName ? `${fileName}` : "Ningún archivo seleccionado"}
          </span>
        </div>
      </div>

      {loading && (
        <div className="container_reader_loading">
           <h4 style={{ margin: 0 }}>Cargando y procesando datos...</h4>
           <p>Esto puede tardar unos segundos dependiendo del tamaño del archivo.</p>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="container_reader_vista">
          <div className="container_reader_subvista">
            {/*  Aplicamos text-main al título inferior */}
            <h4>Vista Local: <span>{fileName}</span></h4>
            {sheets.length > 0 && (
              <div className="container_reader_vistadatos">
                <label>Hoja:</label>
                <select
                  value={activeSheetIndex}
                  onChange={handleSheetChange}
                >
                  {sheets.map((name, index) => <option key={index} value={index}>{name}</option>)}
                </select>
              </div>
            )}
          </div>

          <DataGrid
            columns={columns}
            rows={rows}
            style={{ blockSize: '100%' }}
            className="rdg-light"
          />
        </div>
      )}

    </div>
  );
}