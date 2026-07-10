import { useState } from "react";

import { api } from "../../services/api";

import "../../styles/components/excel/Calculator.css"

export default function Calculator() {
  // ==========================
  // ESTADOS DEL COMPONENTE
  // ==========================
  // Curso y tema seleccionado
  const [curso, setCurso] = useState("MAT151");
  const [tema, setTema] = useState("Tema2");

  // Tipo de cálculo dentro del tema
  const [tipo, setTipo] = useState("media");

  // Inputs de datos
  const [input, setInput] = useState("");
  const [resultado, setResultado] = useState(null);
  const [pesos, setPesos] = useState("");

  // Para Tema5 (bivariado)
  const [inputX, setInputX] = useState("");
  const [inputY, setInputY] = useState("");

  // Para Tema6 - Regresión Multivariante
  const [inputsX, setInputsX] = useState([[""]]); // lista de variables X
  const [inputYMulti, setInputYMulti] = useState([]); // variable dependiente

  // Función para agregar más variables X en multivariante
  const agregarVariableX = () => {
    setInputsX([...inputsX, [""]]);
  };

  // ==========================
  // FUNCIÓN PRINCIPAL DE CÁLCULO
  // ==========================
  const handleCalculate = async () => {
    // Limpiar resultado anterior
    setResultado(null);

    let bodyData = { tipo, tema };

    let calculoPromise;

    // ==========================
    // Tema5 y Tema6 (bivariado y multivariante)
    // ==========================
    if (tema === "Tema5" || tema === "Tema6") {
      if (tema === "Tema6" && tipo === "regresion_multivariante") {
        // Caso multivariante → endpoint especial
        bodyData = { X: inputsX, y: inputYMulti, tipo };
        calculoPromise = api.calcularMultivariante(bodyData);
      } else {
        // Tema5 o regresión simple de Tema6 → endpoint bivariado
        const datosX = inputX.split(",").map(Number).filter((x) => !isNaN(x));
        const datosY = inputY.split(",").map(Number).filter((x) => !isNaN(x));
        bodyData = { x: datosX, y: datosY, tipo };
        calculoPromise = api.calcularBivariadaManual(bodyData);
      }
    } else {
      // ==========================
      // Resto de temas (Tema2, Tema3, Tema4)           
      // =========================
      // Convertimos input a números
      let datosArray = input
        .split(",")
        .map(x => Number(x.trim()))
        .filter(x => !isNaN(x));

      // Media ponderada → enviamos pesos
      if (tipo === "media_ponderada") {
        const pesosList = pesos
          .split(",")
          .map(x => Number(x.trim()))
          .filter(x => !isNaN(x));
        bodyData.pesos = pesosList;
      }

      // Para cálculos agrupados del Tema3

      if (tema === "Tema3" && ["media_agrupada", "mediana_agrupada", "moda_agrupada"].includes(tipo)) {
        bodyData.datos = datosArray; // enviamos datos crudos, Tema3.py se encargará de crear la tabla de clases
      } else {
        bodyData.datos = datosArray; // lista simple para los otros cálculos
      }
      // DEBUG: Ver qué datos se enviarán
      console.log("bodyData a enviar:", bodyData);

      calculoPromise = api.calcularUnivariada(bodyData);
    }

    try {
      // Ejecutamos la promesa seleccionada
      const data = await calculoPromise;
      setResultado(data);
    } catch (err) {
      console.error("Error:", err);
      setResultado({ error: "No se pudo conectar con la API" });
    }
  };

  // ==========================
  // RENDER DEL COMPONENTE
  // ==========================
  return (
    <div>
      <h2>Calculadora Estadística</h2>

      {/* Selección de curso */}
      <label>Curso: </label>
      <select value={curso} onChange={(e) => setCurso(e.target.value)}>
        <option value="MAT151">MAT151 - Estadística General</option>
        <option value="MAT251">MAT251 - Estadística Matemática</option>
      </select>
      <br />

      {/* Selección de tema */}
      <label>Tema: </label>
      <select value={tema} onChange={(e) => setTema(e.target.value)}>
        <option value="Tema2">Tema 2 - Distribución de frecuencias</option>
        <option value="Tema3">Tema 3 - Tendencia central</option>
        <option value="Tema4">Tema 4 - Dispersión y forma</option>
        <option value="Tema5">Tema 5 - Distribuciones bivariantes</option>
        <option value="Tema6">Tema 6 - Análisis de Regresión</option>
      </select>
      <br />

      {/* Selección del cálculo */}
      <label>Cálculo: </label>
      <select
        value={tipo}
        onChange={(e) => {
          setTipo(e.target.value);
          setResultado(null);
        }}
      >
        {tema === "Tema2" && (
          <>
            <option value="frecuencia_absoluta">Frecuencia absoluta</option>
            <option value="frecuencia_relativa">Frecuencia relativa</option>
            <option value="frecuencia_acumulada">Frecuencia acumulada</option>
            <option value="frecuencia_acumulada_relativa">Frecuencia acumulada relativa</option>
            <option value="tabla_clases">Tabla por intervalos</option>
            <option value="minimo">Mínimo</option>
            <option value="maximo">Máximo</option>
            <option value="cuartiles">Cuartiles</option>
            <option value="rango_intercuartilico">Rango Intercuartílico (IQR)</option>
          </>
        )}
        {tema === "Tema3" && (
          <>
            <option value="media">Media</option>
            <option value="media_geometrica">Media Geométrica</option>
            <option value="media_ponderada">Media Ponderada</option>
            <option value="mediana">Mediana</option>
            <option value="moda">Moda</option>

            {/* Nuevos cálculos agrupados */}
            <option value="media_agrupada">Media Agrupada</option>
            <option value="mediana_agrupada">Mediana Agrupada</option>
            <option value="moda_agrupada">Moda Agrupada</option>
          </>
        )}
        {tema === "Tema4" && (
          <>
            <option value="varianza">Varianza</option>
            <option value="desviacion">Desviación estándar</option>
            <option value="coef_variacion">Coeficiente de variación</option>
          </>
        )}
        {tema === "Tema5" && (
          <>
            <option value="covarianza">Covarianza</option>
            <option value="correlacion">Coeficiente de correlación</option>
            <option value="regresion">Regresión lineal (Y sobre X)</option>
          </>
        )}
        {tema === "Tema6" && (
          <>
            <option value="regresion_lineal">Regresión Lineal</option>
            <option value="regresion_no_lineal">Regresión No Lineal</option>
            <option value="regresion_multivariante">Regresión Multivariante</option>
          </>
        )}
      </select>
      <br />

      {/* Inputs de datos */}
      {(tema === "Tema2" || tema === "Tema3" || tema === "Tema4") && (
        <>
          <textarea
            rows="4"
            cols="40"
            placeholder="Escribe los datos separados por coma, ej: 10,20,15,18"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <br />
        </>
      )}

      {/* Input adicional de pesos solo para media ponderada */}
      {tipo === "media_ponderada" && (
        <>
          <label>Pesos:</label>
          <textarea
            rows="2"
            cols="40"
            placeholder="Ej: 1,2,1,3"
            value={pesos}
            onChange={(e) => setPesos(e.target.value)}
          />
          <br />
        </>
      )}

      {/* Inputs para Tema5 o Tema6 (excepto multivariante) */}
      {(tema === "Tema5" || (tema === "Tema6" && tipo !== "regresion_multivariante")) && (
        <>
          <label>Variable X:</label>
          <textarea
            rows="2"
            cols="40"
            placeholder="Ej: 2,4,6,8"
            value={inputX}
            onChange={(e) => setInputX(e.target.value)}
          />
          <br />
          <label>Variable Y:</label>
          <textarea
            rows="2"
            cols="40"
            placeholder="Ej: 3,5,7,9"
            value={inputY}
            onChange={(e) => setInputY(e.target.value)}
          />
          <br />
        </>
      )}

      {/* Inputs para Tema6 - Regresión Multivariante */}
      {tema === "Tema6" && tipo === "regresion_multivariante" && (
        <>
          {inputsX.map((xArray, idx) => (
            <div key={idx}>
              <label>Variable X{idx + 1}:</label>
              <textarea
                rows="2"
                cols="40"
                placeholder="Ej: 2,4,6,8"
                value={xArray}
                onChange={(e) => {
                  const newInputs = [...inputsX];
                  newInputs[idx] = e.target.value.split(",").map(Number).filter(n => !isNaN(n));
                  setInputsX(newInputs);
                }}
              />
              <br />
            </div>
          ))}
          <button type="button" onClick={agregarVariableX}>Agregar otra variable X</button>
          <br />
          <label>Variable Y:</label>
          <textarea
            rows="2"
            cols="40"
            placeholder="Ej: 3,5,7,9"
            value={inputYMulti}
            onChange={(e) => setInputYMulti(e.target.value.split(",").map(Number).filter(n => !isNaN(n)))}
          />
          <br />
        </>
      )}

      {/* ==========================
          BOTÓN DE CÁLCULO
      ========================== */}
      <button onClick={handleCalculate}>Calcular</button>


      {/* ==========================
           MOSTRAR RESULTADO
      ========================== */}
      {resultado && (   // Solo renderiza esta sección si 'resultado' tiene algún valor
        <div>
          <h3>Resultado:</h3>

          {/* ==========================
              CASO 1: cálculos agrupados (Tema3)
              - 'resultado' contiene un objeto con tabla de clases + medias/mediana/moda agrupadas
          ========================== */}
          {resultado.tabla ? (
            <>
              {/* Mostrar resultados individuales si existen */}
              {resultado.media_agrupada !== undefined && (
                <p>
                  <b>Media Agrupada:</b> {resultado.media_agrupada.toFixed(5)}
                </p>
              )}
              {resultado.mediana_agrupada !== undefined && (
                <p>
                  <b>Mediana Agrupada:</b> {resultado.mediana_agrupada.toFixed(5)}
                </p>
              )}
              {resultado.moda_agrupada !== undefined && (
                <p>
                  <b>Moda Agrupada:</b> {resultado.moda_agrupada.toFixed(5)}
                </p>
              )}

              {/* Tabla de clases: mostramos LI, LS, Marca, Frecuencia */}
              <table border="1" cellPadding="5" className="table_resultado">
                <thead>
                  <tr>
                    <th>LI</th>       {/* Límite inferior */}
                    <th>LS</th>       {/* Límite superior */}
                    <th>Marca</th>    {/* Marca de clase */}
                    <th>Fi</th>       {/* Frecuencia absoluta */}
                  </tr>
                </thead>
                <tbody>
                  {resultado.tabla.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.li}</td>
                      <td>{row.ls}</td>
                      <td>{typeof row.marca === "number" ? row.marca.toFixed(2) : row.marca}</td>
                      <td>{row.fi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )
            // ==========================
            // CASO 2: array de objetos → tabla
            // - útil para Tema2, Tema4, etc.
            // ==========================
            : Array.isArray(resultado.resultado) ? (
              <table border="1" cellPadding="5" className="table_resultado">
                <thead>
                  <tr>
                    {Object.keys(resultado.resultado[0]).map((col) => (
                      <th key={col}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resultado.resultado.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((val, i) => (
                        <td key={i}>
                          {typeof val === "number" ? val.toFixed(5) : JSON.stringify(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )
              // ==========================
              // CASO 3: valor simple → párrafo
              // - útil para media, mediana, moda simples
              // ==========================
              : resultado.resultado !== undefined ? (
                <p>
                  {typeof resultado.resultado === "number"
                    ? resultado.resultado.toFixed(5)  // Formato decimal si es número
                    : resultado.resultado}
                </p>// Si no, mostrar tal cual
              )
                // ==========================
                // CASO 4: objeto con varios campos → tabla
                // - útil para regresión lineal/multivariante
                // ==========================
                : (
                  <table border="1" cellPadding="5" className="table_resultado">
                    <tbody>
                      {Object.entries(resultado).map(([key, value]) => (
                        <tr key={key}>
                          <td><b>{key}</b></td>
                          <td>
                            {typeof value === "number" ? value.toFixed(5) :    // Número → 5 decimales
                              Array.isArray(value) ?                              // Array → mostrar cada número formateado
                                value.map(v => (typeof v === "number" ? v.toFixed(5) : JSON.stringify(v))).join(", ")
                                : JSON.stringify(value)}
                          </td>
                        </tr> // Otros tipos → stringify
                      ))}
                    </tbody>
                  </table>
                )}
        </div>
      )}
    </div>
  )
}

