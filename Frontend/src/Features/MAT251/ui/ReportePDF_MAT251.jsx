import React, { useState, useEffect } from "react";
import logoUSFX from "../../../assets/images/escudousfx.png";
import logoSiCE from "../../../assets/images/Logo-SiCE.png";

// ── IMPORTACIÓN DE LOS COMPONENTES HIJOS POR TEMA ──
import ReportePDF_Tema1 from "../Temas/Tema_1/Reportes/ReportePDF_Tema1";
import ReportePDF_Tema2 from "../Temas/Tema_2/Reportes/ReportePDF_Tema2";
import ReportePDF_Tema3 from "../Temas/Tema_3/Reportes/ReportePDF_Tema3";
import ReportePDF_Tema4 from "../Temas/Tema_4/Reportes/ReportePDF_Tema4";
import ReportePDF_Tema5 from "../Temas/Tema_5/Reportes/ReportePDF_Tema5";
import ReportePDF_Tema6 from "../Temas/Tema_6/Reportes/ReportePDF_Tema6";

export default function ReportePDF_MAT251({
    temaActivo = 1,
    filas = [],
    usuario,
    selectedFile,
    selectedSheet,
    operacion,
    subTipoProbabilidad = 'clasica',
    inputModeProb = 'matriz',
    varSeleccionada,
    colProbClasica,
    eventoFavorable = [],
    eventoCondicion = [],
    resConteo,
    tipoElementos = 'letras',
    elementosBase = [],
    resProbabilidad,
    resultadoAdicion,
    colAAdicion,
    valAAdicion,
    colBAdicion,
    valBAdicion,
    resultadoMult,
    resultadoSimulador,
    datosExperimento,
    // Tema 2
    datosDiscretos,
    datosContinuos,
    // Tema 3
    datosTema3,
    datosTema3Continuos,
    // Tema 4
    resultadoMuestral,
    // Tema 5
    paramEstimacion,
    modoEstimacion,
    paramIntervalos,
    modoIntervalos,
    confianzaIntervalos,
    resultadoEstimacion,
    // Tema 6
    prueba,
    pruebaHP,
    modoHP,
    pruebaHNP,
    modoHNP,
    resultadoHipotesis
}) {
    // Estado para los logos convertidos para impresión
    const [logoNegro, setLogoNegro] = useState(null);
    const [logoUSFXDataUrl, setLogoUSFXDataUrl] = useState(null);
    const [hipotesisRenderizada, setHipotesisRenderizada] = useState(null);

    useEffect(() => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            try {
                const c = document.createElement("canvas");
                c.width = img.width;
                c.height = img.height;
                const ctx = c.getContext("2d");
                ctx.drawImage(img, 0, 0);
                const imgData = ctx.getImageData(0, 0, c.width, c.height);
                const data = imgData.data;
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i + 3] > 15) {
                        data[i] = 0;     // R = 0
                        data[i + 1] = 0; // G = 0
                        data[i + 2] = 0; // B = 0
                    }
                }
                ctx.putImageData(imgData, 0, 0);
                setLogoNegro(c.toDataURL("image/png"));
            } catch (err) {
                console.error("Error al procesar logo a negro:", err);
            }
        };
        img.src = logoSiCE;

        const imgUSFX = new Image();
        imgUSFX.crossOrigin = "anonymous";
        imgUSFX.onload = () => {
            try {
                const c = document.createElement("canvas");
                c.width = imgUSFX.naturalWidth || imgUSFX.width;
                c.height = imgUSFX.naturalHeight || imgUSFX.height;
                const ctx = c.getContext("2d");
                ctx.drawImage(imgUSFX, 0, 0);
                setLogoUSFXDataUrl(c.toDataURL("image/png"));
            } catch (err) {
                console.warn("Error al procesar logo USFX:", err);
            }
        };
        imgUSFX.src = logoUSFX;
    }, []);

    // ── RESOLVER TEMA ACTIVO A PARTIR DE LA OPERACIÓN ──
    let resolvedTema = Number(temaActivo) || 1;
    if (operacion) {
        if (['conteo', 'probabilidad', 'Probabilidad_Total', 'simulador_total', 'regla_adicion', 'regla_multiplicacion', 'muestreo', 'dist_uniforme'].includes(operacion)) {
            resolvedTema = 1;
        } else if (['dist_discreta', 'dist_continua', 'dist_continua_v2'].includes(operacion)) {
            resolvedTema = 2;
        } else if (['Distribuciones_Discretas', 'Distribuciones_Continuas', 'discretas', 'continuas', 'distribuciones_discretas', 'distribuciones_continuas', 'modelos_discretos', 'modelos_continuos'].includes(operacion)) {
            resolvedTema = 3;
        } else if (['distribuciones_muestrales', 'tyf', 'tamanio_muestra', 'probabilidad_muestral'].includes(operacion)) {
            resolvedTema = 4;
        } else if (['Estimacion_puntual', 'Estimacion_intervalos'].includes(operacion)) {
            resolvedTema = 5;
        } else if (['Hipotesis_parametricas', 'Hipotesis_noparametricas'].includes(operacion)) {
            resolvedTema = 6;
        }
    }

    // ── DETERMINAR SI ES MODO SIMULACIÓN (NO EXPORTABLE A PDF) ──
    const modoEstimacionActivo = operacion === 'Estimacion_intervalos' ? modoIntervalos : modoEstimacion;
    const parametroEstimacionActivo = operacion === 'Estimacion_intervalos' ? paramIntervalos : paramEstimacion;
    const modoHipotesisActivo = operacion === 'Hipotesis_noparametricas' ? modoHNP : modoHP;
    const pruebaHipotesisActiva = operacion === 'Hipotesis_noparametricas' ? pruebaHNP : pruebaHP;
    const esModoSimulacion = ((operacion === 'probabilidad' || operacion === 'clasica' || !operacion) && inputModeProb === 'simulacion')
        || (resolvedTema === 5 && modoEstimacionActivo === 'simulacion')
        || (resolvedTema === 6 && modoHipotesisActivo === 'simulacion');
    const hipotesisExportable = resultadoHipotesis?.operacion === operacion
        && resultadoHipotesis?.modo === modoHipotesisActivo
        && resultadoHipotesis?.prueba === pruebaHipotesisActiva
        && ['matriz', 'manual'].includes(modoHipotesisActivo)
        && Number.isFinite(resultadoHipotesis?.resultados?.estadistico)
        && Number.isFinite(resultadoHipotesis?.resultados?.pValor)
        ? resultadoHipotesis : null;
    const estimacionExportable = resultadoEstimacion?.operacion === operacion
        && resultadoEstimacion?.modo === modoEstimacionActivo
        && resultadoEstimacion?.parametro === parametroEstimacionActivo
        && ['matriz', 'manual'].includes(modoEstimacionActivo)
        && !(operacion === 'Estimacion_puntual' && parametroEstimacionActivo === 'media' && modoEstimacionActivo === 'manual')
        && (operacion !== 'Estimacion_intervalos' || resultadoEstimacion?.confianza === confianzaIntervalos)
        && (operacion === 'Estimacion_intervalos'
            ? Number.isFinite(resultadoEstimacion?.resultados?.LI) && Number.isFinite(resultadoEstimacion?.resultados?.LS)
            : Number.isFinite(resultadoEstimacion?.resultados?.estimacion))
        ? resultadoEstimacion : null;

    // ── DETERMINAR SI HAY RESULTADO LISTO PARA EXPORTAR ──
    const esModoExperimentos = (operacion === 'probabilidad' || operacion === 'clasica' || !operacion) && inputModeProb === 'experimentos';

    let hayResultado = false;
    if (esModoSimulacion) {
        hayResultado = false;
    } else if (resolvedTema === 1) {
        hayResultado = Boolean(
            (operacion === 'conteo' && resConteo) ||
            (esModoExperimentos && datosExperimento?.resultado) ||
            ((operacion === 'probabilidad' || operacion === 'clasica' || !operacion) && !esModoExperimentos && resProbabilidad) ||
            (operacion === 'regla_adicion' && resultadoAdicion) ||
            (operacion === 'regla_multiplicacion' && resultadoMult) ||
            ((operacion === 'Probabilidad_Total' || operacion === 'simulador_total') && resultadoSimulador)
        );
    } else if (resolvedTema === 2) {
        hayResultado = Boolean(datosDiscretos || datosContinuos);
    } else if (resolvedTema === 3) {
        hayResultado = Boolean(datosTema3 || datosTema3Continuos);
    } else if (resolvedTema === 4) {
        hayResultado = Boolean(resultadoMuestral);
    } else if (resolvedTema === 5) {
        hayResultado = Boolean(estimacionExportable?.resultados);
    } else if (resolvedTema === 6) {
        hayResultado = Boolean(hipotesisExportable && hipotesisRenderizada === hipotesisExportable);
    }

    // ── TÍTULOS Y NOMBRES FORMALES ──
    let nombreTema = "Cálculo de probabilidades e introducción al muestreo";
    if (resolvedTema === 2) nombreTema = "Variables aleatorias";
    else if (resolvedTema === 3) nombreTema = "Distribuciones discretas y continuas importantes";
    else if (resolvedTema === 4) nombreTema = "Distribuciones en el muestreo estadístico";
    else if (resolvedTema === 5) nombreTema = "Estimación e inferencia estadística";
    else if (resolvedTema === 6) nombreTema = "Pruebas de hipótesis paramétricas y no paramétricas";

    let nombreOperacion = "Probabilidad Clásica y Espacio Muestral";
    let nombreArchivo = `MAT251_Tema${resolvedTema}`;

    if (operacion === 'conteo') {
        nombreOperacion = "Técnicas de Conteo";
        nombreArchivo = "MAT251_Tema1_Conteo";
    } else if (operacion === 'regla_adicion') {
        const sufijoModo = resultadoAdicion?.modo === 'manual' ? '_Manual' : '_Matriz';
        nombreOperacion = "Axiomas y Regla de la Adición";
        nombreArchivo = `MAT251_Tema1_ReglaAdicion${sufijoModo}`;
    } else if (operacion === 'regla_multiplicacion') {
        const sufijoModo = resultadoMult?.modo === 'manual' ? '_Manual' : '_Matriz';
        nombreOperacion = "Regla de la Multiplicación de Probabilidades";
        nombreArchivo = `MAT251_Tema1_ReglaMultiplicacion${sufijoModo}`;
    } else if (operacion === 'Probabilidad_Total' || operacion === 'simulador_total') {
        const tieneBayes = Boolean(resultadoSimulador?.causasBayes && resultadoSimulador.causasBayes.length > 0);
        const sufijoModo = resultadoSimulador?.modo === 'manual' ? '_Manual' : '_Matriz';
        const baseNombre = tieneBayes ? "ProbabilidadTotal_Bayes" : "ProbabilidadTotal";
        nombreOperacion = tieneBayes ? "Probabilidad Total y Teorema de Bayes" : "Teorema de la Probabilidad Total";
        nombreArchivo = `MAT251_Tema1_${baseNombre}${sufijoModo}`;
    } else if (resolvedTema === 1) {
        let sufijoArchivo = '_Matriz';
        if (inputModeProb === 'manual') {
            sufijoArchivo = '_Manual';
        } else if (inputModeProb === 'experimentos') {
            sufijoArchivo = `_Experimentos_${datosExperimento?.tipoExperimento === 'compuesto' ? 'Compuesto' : 'Simple'}`;
        }
        if (subTipoProbabilidad === 'frecuentista') {
            nombreOperacion = "Probabilidad Frecuentista";
            nombreArchivo = `MAT251_Tema1_Probabilidad_Frecuentista${sufijoArchivo}`;
        } else if (subTipoProbabilidad === 'condicional') {
            nombreOperacion = "Probabilidad Condicional";
            nombreArchivo = `MAT251_Tema1_Probabilidad_Condicional${sufijoArchivo}`;
        } else {
            nombreOperacion = "Probabilidad Clásica";
            nombreArchivo = `MAT251_Tema1_Probabilidad_Clasica${sufijoArchivo}`;
        }
    } else if (resolvedTema === 2) {
        nombreOperacion = operacion === 'dist_discreta' ? "Variables Aleatorias Discretas" : "Funciones Continuas";
        nombreArchivo = `MAT251_Tema2_${operacion || 'VariablesAleatorias'}`;
    } else if (resolvedTema === 3) {
        nombreOperacion = (operacion === 'Distribuciones_Continuas' || operacion === 'continuas') ? "Distribuciones Continuas" : "Distribuciones Discretas";
        nombreArchivo = `MAT251_Tema3_${operacion || 'Distribuciones'}`;
    } else if (resolvedTema === 4) {
        nombreOperacion = operacion === 'tyf' ? "Distribuciones T y F" : "Distribuciones Muestrales";
        nombreArchivo = `MAT251_Tema4_${operacion || 'Muestreo'}`;
    } else if (resolvedTema === 5) {
        nombreOperacion = operacion === 'Estimacion_intervalos' ? "Estimación por Intervalos" : "Estimación Puntual";
        nombreArchivo = `MAT251_Tema5_${operacion || 'Estimacion'}`;
    } else if (resolvedTema === 6) {
        nombreOperacion = operacion === 'Hipotesis_noparametricas' ? "Hipótesis No Paramétricas" : "Hipótesis Paramétricas";
        nombreArchivo = `MAT251_Tema6_${operacion || 'Hipotesis'}`;
    }

    const temaOperacion = `${nombreTema} — ${nombreOperacion}`;

    const nombreEstudiante = usuario?.nombre || usuario?.displayName || "Diego Armando Coa Veliz";
    const nombreDocente = usuario?.docente || usuario?.nombreDocente || usuario?.teacher || "No especificado";
    const nombreGrupo = usuario?.grupo || usuario?.group || "No especificado";

    const fechaEmision = new Date();
    const fechaActual = fechaEmision.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const horaActual = fechaEmision.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    return (
        <div style={{ position: "fixed", left: "200vw", top: "200vh", opacity: 0, pointerEvents: "none" }}>
            {/* Blindaje contra el modo oscuro y estilos específicos de impresión en negro puro */}
            <style>{`
                #reporte-formal-mat251 {
                    --bg-card: #ffffff !important;
                    --text-main: #000000 !important;
                    --text-pure: #000000 !important;
                    --border-color: #000000 !important;
                    display: block !important;
                    width: 17.6cm !important;
                    min-height: auto !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    box-sizing: border-box !important;
                    background-color: #ffffff !important;
                    color: #000000 !important;
                    font-family: Arial, Helvetica, sans-serif !important;
                }
                #reporte-formal-mat251, 
                #reporte-formal-mat251 * {
                    color: #000000 !important;
                }
                #reporte-formal-mat251 [style*="07865b"],
                #reporte-formal-mat251 [style*="07865b"] *,
                #reporte-formal-mat251 [style*="07865B"],
                #reporte-formal-mat251 [style*="07865B"] *,
                #reporte-formal-mat251 [style*="rgb(7, 134, 91)"],
                #reporte-formal-mat251 [style*="rgb(7, 134, 91)"] *,
                #reporte-formal-mat251 .textcolor,
                #reporte-formal-mat251 .textcolor *,
                #reporte-formal-mat251 .texto-verde-pdf,
                #reporte-formal-mat251 .texto-verde-pdf * {
                    color: #07865b !important;
                }
                #reporte-formal-mat251 .celda-verde-pdf,
                #reporte-formal-mat251 td.celda-verde-pdf {
                    background-color: #dcfce7 !important;
                    color: #07865b !important;
                    font-weight: bold !important;
                }
                #reporte-formal-mat251 .celda-verde-pdf * {
                    color: #07865b !important;
                }
                #reporte-formal-mat251 #pdf-header-mat251.pdf-section {
                    margin-bottom: 4px !important;
                }
                #reporte-formal-mat251 #pdf-ficha-mat251.pdf-section {
                    margin-bottom: 10px !important;
                }
                #reporte-formal-mat251 .pdf-section {
                    display: block;
                    width: 100% !important;
                    margin-top: 0 !important;
                    margin-bottom: 22px !important;
                    page-break-before: avoid !important;
                    page-break-after: auto !important;
                    page-break-inside: avoid !important;
                    color: #000000 !important;
                }
                #reporte-formal-mat251 table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    background-color: #ffffff !important;
                    color: #000000 !important;
                    margin-top: 10px !important;
                    margin-bottom: 15px !important;
                }
                #reporte-formal-mat251 th {
                    background-color: #ffffff !important;
                    color: #000000 !important;
                    border: 1px solid #000000 !important;
                    padding: 8px 10px !important;
                    font-size: 10pt !important;
                    text-align: center !important;
                    font-weight: bold !important;
                }
                #reporte-formal-mat251 td {
                    border: 1px solid #000000 !important;
                    padding: 7px 10px !important;
                    font-size: 9.5pt !important;
                    color: #000000 !important;
                    background-color: #ffffff !important;
                }
                #reporte-formal-mat251 #pdf-cuerpo-mat251,
                #reporte-formal-mat251 #pdf-cuerpo-mat251 *:not(.katex):not(.katex *) {
                    font-size: 9pt !important;
                }
                #reporte-formal-mat251 #pdf-cuerpo-mat251 .katex,
                #reporte-formal-mat251 #pdf-cuerpo-mat251 .katex-display {
                    font-size: 9pt !important;
                }
                #reporte-formal-mat251 #pdf-cuerpo-mat251 .tabla-datos-pdf th,
                #reporte-formal-mat251 #pdf-cuerpo-mat251 .tabla-datos-pdf td {
                    font-size: 8pt !important;
                }
                #reporte-formal-mat251 .tabla-datos-pdf th {
                    padding: 4px 6px !important;
                    font-size: 8pt !important;
                }
                #reporte-formal-mat251 .tabla-datos-pdf td {
                    padding: 3px 6px !important;
                    font-size: 8pt !important;
                }
                #reporte-formal-mat251 .katex, 
                #reporte-formal-mat251 .katex-display {
                    color: #000000 !important;
                    overflow: visible !important;
                    padding-top: 4px !important;
                    padding-bottom: 8px !important;
                }
                #reporte-formal-mat251 .katex * {
                    overflow: visible !important;
                }
                #reporte-formal-mat251 .tarjeta-resultado-pdf {
                    border: 1px solid #000000 !important;
                    border-radius: 6px;
                    padding: 14px;
                    background-color: #ffffff !important;
                    color: #000000 !important;
                    margin-bottom: 14px;
                }
            `}</style>

            <div
                id="reporte-formal-mat251"
                data-listo={hayResultado ? "true" : "false"}
                data-es-simulacion={esModoSimulacion ? "true" : "false"}
                data-nombre-archivo={nombreArchivo}
                style={{ width: "17.6cm", minHeight: "23.9cm", padding: "0", backgroundColor: "#ffffff", color: "#000000", boxSizing: "border-box" }}
            >
                {/* ── 1. ENCABEZADO INSTITUCIONAL ── */}
                <div id="pdf-header-mat251" className="pdf-section" style={{ position: "relative", paddingBottom: 0, marginBottom: "6px" }}>
                    <div style={{ position: "relative", minHeight: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {/* Logo Izquierdo: Escudo USFX */}
                        <div style={{ position: "absolute", left: 0, top: "50%", width: "0.68in", textAlign: "left", transform: "translateY(-50%)" }}>
                            <img id="pdf-logo-usfx" src={logoUSFXDataUrl || logoUSFX} crossOrigin="anonymous" style={{ width: "0.60in", height: "auto", display: "inline-block" }} alt="USFX" />
                        </div>

                        {/* Texto Institucional Central */}
                        <div id="pdf-institucion-mat251" style={{ width: "100%", textAlign: "center", padding: "0 0.98in", boxSizing: "border-box" }}>
                            <div style={{ fontSize: "12pt", lineHeight: 1.18, color: "#000000", margin: 0, fontWeight: 500 }}>
                                Universidad Mayor Real y Pontificia de San Francisco<br />Xavier de Chuquisaca
                            </div>
                            <div style={{ fontSize: "11pt", color: "#000000", margin: "3px 0 0 0" }}>
                                Facultad de Ciencias Económicas y Empresariales
                            </div>
                            <div style={{ fontSize: "10.5pt", fontWeight: "bold", color: "#000000", margin: "3px 0 0 0", letterSpacing: "0.03em" }}>
                                CARRERA DE ADMINISTRACIÓN DE EMPRESAS
                            </div>
                        </div>

                        {/* Logo Derecho: SiCE */}
                        <div style={{ position: "absolute", right: 0, top: "50%", width: "0.98in", textAlign: "right", transform: "translateY(-50%)" }}>
                            <img id="pdf-logo-sice" src={logoNegro || logoSiCE} style={{ width: "0.92in", height: "auto", display: "inline-block" }} alt="SiCE" />
                        </div>
                    </div>
                </div>

                {/* ── 2. DATOS DEL INFORME ── */}
                <div id="pdf-ficha-mat251" className="pdf-section" style={{ padding: "0 0 8px", borderBottom: "1px solid #000000", marginBottom: "10px" }}>
                    <div style={{ textAlign: "center", margin: "16px 0 8px" }}>
                        <div style={{ fontSize: "12pt", fontWeight: "bold", letterSpacing: "0.08em" }}>INFORME ACADÉMICO — MAT 251</div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", columnGap: "24px", rowGap: "4px", fontSize: "11pt", lineHeight: 1.35 }}>
                        <div style={{ gridColumn: "1 / -1" }}><strong>Docente:</strong> {nombreDocente}</div>
                        <div><strong>Estudiante:</strong> {nombreEstudiante}</div>
                        <div><strong>Grupo:</strong> {nombreGrupo}</div>
                        <div style={{ gridColumn: "1 / -1" }}><strong>Tema:</strong> {temaOperacion}</div>
                        <div><strong>Fecha:</strong> {fechaActual}</div>
                        <div><strong>Hora:</strong> {horaActual}</div>
                    </div>
                </div>

                {/* ── 3. CUERPO DEL REPORTE SEGÚN EL TEMA ACTIVO (HIJOS) ── */}
                <div id="pdf-cuerpo-mat251">
                    {resolvedTema === 1 && (
                        <ReportePDF_Tema1
                            operacion={operacion}
                            subTipoProbabilidad={subTipoProbabilidad}
                            inputModeProb={inputModeProb}
                            resConteo={resConteo}
                            tipoElementos={tipoElementos}
                            elementosBase={elementosBase}
                            resProbabilidad={resProbabilidad}
                            resultadoAdicion={resultadoAdicion}
                            colAAdicion={colAAdicion}
                            valAAdicion={valAAdicion}
                            colBAdicion={colBAdicion}
                            valBAdicion={valBAdicion}
                            resultadoMult={resultadoMult}
                            resultadoSimulador={resultadoSimulador}
                            varSeleccionada={varSeleccionada}
                            colProbClasica={colProbClasica}
                            filas={filas}
                            eventoFavorable={eventoFavorable}
                            eventoCondicion={eventoCondicion}
                            datosExperimento={datosExperimento}
                        />
                    )}

                    {resolvedTema === 2 && (
                        <ReportePDF_Tema2
                            operacion={operacion}
                            datosDiscretos={datosDiscretos}
                            datosContinuos={datosContinuos}
                            varSeleccionada={varSeleccionada}
                        />
                    )}

                    {resolvedTema === 3 && (
                        <ReportePDF_Tema3
                            operacion={operacion}
                            datosTema3={datosTema3}
                            datosTema3Continuos={datosTema3Continuos}
                        />
                    )}

                    {resolvedTema === 4 && (
                        <ReportePDF_Tema4
                            operacion={operacion}
                            resultadoMuestral={resultadoMuestral}
                        />
                    )}

                    {resolvedTema === 5 && (
                        <ReportePDF_Tema5
                            operacion={operacion}
                            paramEstimacion={parametroEstimacionActivo}
                            resultadoEstimacion={estimacionExportable}
                        />
                    )}

                    {resolvedTema === 6 && (
                        <ReportePDF_Tema6
                            operacion={operacion}
                            prueba={prueba}
                            resultadoHipotesis={hipotesisExportable}
                            onListo={setHipotesisRenderizada}
                        />
                    )}
                </div>

                {/* ── 4. PIE DE PÁGINA INSTITUCIONAL ── */}
                <div id="pdf-footer-mat251" className="pdf-section" style={{ marginTop: "30px", borderTop: "1px solid #000000", paddingTop: "10px", fontSize: "9pt", textAlign: "center", color: "#000000" }}>
                    Simulador y Cálculo Empresarial — SICE — USFX © 2026 MAT251 — Estadística Matemática
                </div>
            </div>
        </div>
    );
}
