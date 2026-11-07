import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { alerta } from '../../../utils/Notificaciones';



const buscarCorteEntreRenglones = (canvas, limite, inicioSeccion, escalaCanvasAPdf) => {
    const radioBusqueda = Math.max(8, Math.round(0.9 / escalaCanvasAPdf));
    const inicio = Math.max(Math.ceil(inicioSeccion + 2), Math.floor(limite - radioBusqueda));
    const fin = Math.min(canvas.height - 3, Math.floor(limite));
    if (fin - inicio < 6) return Math.round(limite);

    const contexto = canvas.getContext('2d', { willReadFrequently: true });
    const alto = fin - inicio;
    const pixeles = contexto.getImageData(0, inicio, canvas.width, alto).data;
    const tintaPorFila = new Uint32Array(alto);
    for (let y = 0; y < alto; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
            const indice = (y * canvas.width + x) * 4;
            if (pixeles[indice + 3] > 32 && pixeles[indice] < 190 && pixeles[indice + 1] < 190 && pixeles[indice + 2] < 190) {
                tintaPorFila[y] += 1;
            }
        }
    }

    const umbralTinta = Math.max(12, Math.ceil(canvas.width * 0.008));
    let ultimoRenglonVacio = -1;
    for (let y = 2; y < alto - 2; y += 1) {
        if (tintaPorFila[y - 2] <= umbralTinta &&
            tintaPorFila[y - 1] <= umbralTinta &&
            tintaPorFila[y] <= umbralTinta &&
            tintaPorFila[y + 1] <= umbralTinta &&
            tintaPorFila[y + 2] <= umbralTinta) {
            ultimoRenglonVacio = y;
        }
    }

    return ultimoRenglonVacio >= 0 ? inicio + ultimoRenglonVacio : Math.round(limite);
};


/**
 * Genera un reporte MAT251 con encabezado seleccionable y resultados como imagen.
 * @param {string} elementId ID del contenedor del reporte
 * @param {string} nombreArchivo Nombre base del archivo descargado
 */
export const generarPDFReporteMAT251 = async (elementId, nombreArchivo = "Reporte_MAT251_Tema1") => {
    const input = document.getElementById(elementId);
    const cuerpo = input?.querySelector('#pdf-cuerpo-mat251');
    if (!input || !cuerpo) {
        alerta.error("Error al exportar", "No se encontró el contenido del reporte formal.");
        return;
    }

    const toastId = "mat251-export-pdf";

    /**
     * Cede el hilo de ejecución al navegador para que React y el DOM
     * pinten la notificación y el compositor de GPU rote el spinner
     * sin saltos ni congelamientos.
     */
    const pausaUI = (ms = 60) => new Promise(resolve => setTimeout(resolve, ms));

    try {
        // ── 1. Toast INMEDIATO y sincronizado ─────────────────────────
        alerta.cargando("Preparando reporte PDF...", "Iniciando captura de datos...", toastId);
        await pausaUI(150);

        // ── 2. Extracción de datos del DOM (operación liviana) ──────────
        const ficha = input.querySelector('#pdf-ficha-mat251');
        const encabezado = input.querySelector('#pdf-header-mat251');
        const institutionalBlock = encabezado?.querySelector('#pdf-institucion-mat251') || encabezado?.firstElementChild?.children[1] || encabezado?.firstElementChild?.firstElementChild;
        const institutionRows = institutionalBlock ? Array.from(institutionalBlock.children) : [];
        const universidad = institutionRows[0]?.innerText?.split(/\r?\n/).map(text => text.trim().toLocaleUpperCase('es-BO')).filter(Boolean) || [];
        const faculty = institutionRows[1]?.innerText?.trim().toLocaleUpperCase('es-BO') || '';
        const career = institutionRows[2]?.innerText?.trim() || '';

        const getFieldValue = (label) => {
            const labelNode = Array.from(ficha?.querySelectorAll('strong') || [])
                .find(node => node.textContent.trim().replace(/:$/, '') === label);
            return labelNode?.parentElement?.textContent.replace(labelNode.textContent, '').trim() || '';
        };

        const docente = getFieldValue('Docente');
        const estudiante = getFieldValue('Estudiante');
        const grupo = getFieldValue('Grupo');
        const tema = getFieldValue('Tema');
        const fecha = getFieldValue('Fecha');
        const hora = getFieldValue('Hora');

        const secciones = Array.from(cuerpo.querySelectorAll('.pdf-section'));
        const cuerpoRect = cuerpo.getBoundingClientRect();
        const cuerpoTop = cuerpoRect.top + window.scrollY;
        const seccionesInfo = secciones.flatMap(seccion => {
            const rect = seccion.getBoundingClientRect();
            const top = rect.top + window.scrollY - cuerpoTop;
            if (seccion.dataset.pdfDivisible === 'formulas') {
                const renglones = [];
                seccion.querySelectorAll('.katex-display').forEach(formula => {
                    const tabla = formula.querySelector('.katex-html .mtable');
                    if (!tabla) return;
                    const columnas = Array.from(tabla.children).filter(columna =>
                        columna.matches('.col-align-l, .col-align-r, .col-align-c')
                    );
                    const filas = columnas.map(columna => Array.from(columna.querySelectorAll(
                        ':scope > .vlist-t > .vlist-r:first-child > .vlist > span > .mord'
                    )));
                    const cantidad = Math.max(0, ...filas.map(columna => columna.length));
                    for (let i = 0; i < cantidad; i++) {
                        const celdas = filas.map(columna => columna[i]?.getBoundingClientRect())
                            .filter(celda => celda && celda.width > 0 && celda.height > 0);
                        if (celdas.length) renglones.push({
                            top: Math.min(...celdas.map(celda => celda.top)),
                            bottom: Math.max(...celdas.map(celda => celda.bottom))
                        });
                    }
                });
                // Las fracciones y los límites permanecen completos; el título
                // y la fórmula general acompañan al primer paso del desarrollo.
                const grupos = [];
                renglones.sort((a, b) => a.top - b.top).forEach(renglon => {
                    const anterior = grupos[grupos.length - 1];
                    if (anterior && renglon.top <= anterior.bottom + 1) {
                        anterior.bottom = Math.max(anterior.bottom, renglon.bottom);
                    } else {
                        grupos.push({ ...renglon });
                    }
                });
                if (grupos.length) {
                    const cortes = [rect.top, ...grupos.slice(1).map((grupo, i) =>
                        (grupos[i].bottom + grupo.top) / 2
                    ), rect.bottom];
                    return grupos.map((_, i) => ({
                        top: cortes[i] + window.scrollY - cuerpoTop,
                        height: cortes[i + 1] - cortes[i]
                    }));
                }
            }
            if (seccion.dataset.pdfDivisible === 'filas') {
                const filas = Array.from(seccion.querySelectorAll('tbody > tr'));
                if (filas.length > 0) {
                    // El título y la cabecera acompañan a la primera fila;
                    // el total acompaña a la última. El resto puede cambiar de página.
                    return filas.map((fila, indice) => {
                        const filaRect = fila.getBoundingClientRect();
                        const inicio = indice === 0 ? rect.top : filaRect.top;
                        const fin = indice === filas.length - 1 ? rect.bottom : filaRect.bottom;
                        const borde = fila.cells[0] ? window.getComputedStyle(fila.cells[0]) : null;
                        return {
                            top: inicio + window.scrollY - cuerpoTop,
                            height: fin - inicio,
                            bordeContinuacion: indice > 0 ? {
                                izquierda: filaRect.left - cuerpoRect.left,
                                ancho: filaRect.width,
                                grosor: parseFloat(borde?.borderTopWidth) || 1,
                                color: borde?.borderTopColor || '#000000'
                            } : null
                        };
                    });
                }
            }
            return [{ top, height: rect.height }];
        });

        // ── 3. Captura html2canvas (operación pesada ~2-4 s) ────────────
        alerta.cargando("Capturando contenido...", "Procesando tablas y fórmulas...", toastId);
        await pausaUI(100);

        const escalaCaptura = 2;
        const canvas = await html2canvas(cuerpo, {
            scale: escalaCaptura,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            onclone: clonedDoc => {
                clonedDoc.querySelectorAll('.katex-mathml').forEach(node => node.remove());
                // Asegura desborde visible y espacio inferior para denominadores de fracciones en KaTeX
                clonedDoc.querySelectorAll('.katex-display').forEach(el => {
                    el.style.setProperty('overflow', 'visible', 'important');
                    const pb = parseFloat(window.getComputedStyle(el).paddingBottom) || 0;
                    if (pb < 6) el.style.setProperty('padding-bottom', '8px', 'important');
                });
                // Mantiene intactos los estilos de las fórmulas KaTeX y asegura color verde
                clonedDoc.querySelectorAll('[style*="07865b"], [style*="07865B"], [style*="rgb(7, 134, 91)"], .celda-verde-pdf, .texto-verde-pdf').forEach(el => {
                    el.style.setProperty('color', '#07865b', 'important');
                    el.querySelectorAll('*').forEach(child => {
                        child.style.setProperty('color', '#07865b', 'important');
                    });
                });
            }
        });
        await pausaUI(60);

        // ── 4. Construir PDF (post-captura) ─────────────────────────────
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'cm',
            format: [21.6, 27.9],
            compress: true
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const centerX = pdfWidth / 2;
        const marginHorizontal = 2.0;
        const marginTopFirstPage = 1.0;
        const marginTopContinuationPages = 2.0;
        const contentWidth = pdfWidth - (marginHorizontal * 2);
        const footerLineOffset = 1.6;
        const contentToFooterGap = 0.5;

        const universityFont = 11.5;
        const institutionalStartY = marginTopFirstPage + 0.62;
        let headerY = institutionalStartY;
        const maxHeaderWidth = contentWidth - 4.8;

        const textVisualTop = institutionalStartY - 0.28;
        let lastLineBaseline = institutionalStartY;

        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(universityFont);
        universidad.forEach(line => {
            const splitLines = pdf.splitTextToSize(line, maxHeaderWidth);
            splitLines.forEach(subLine => {
                pdf.text(subLine, centerX, headerY, { align: 'center' });
                lastLineBaseline = headerY;
                headerY += 0.44;
            });
        });

        headerY += 0.06;
        pdf.setFontSize(10.5);
        if (faculty) {
            const splitFaculty = pdf.splitTextToSize(faculty, maxHeaderWidth);
            splitFaculty.forEach(subLine => {
                pdf.text(subLine, centerX, headerY, { align: 'center' });
                lastLineBaseline = headerY;
                headerY += 0.44;
            });
        }

        headerY += 0.06;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        if (career) {
            const splitCareer = pdf.splitTextToSize(career, maxHeaderWidth);
            splitCareer.forEach(subLine => {
                pdf.text(subLine, centerX, headerY, { align: 'center' });
                lastLineBaseline = headerY;
                headerY += 0.44;
            });
        }

        const textVisualBottom = lastLineBaseline + 0.08;
        const institutionalCenterY = (textVisualTop + textVisualBottom) / 2;

        // Logo Izquierdo: Escudo USFX (centrado vertical óptico)
        try {
            const logoUSFX = encabezado?.querySelector('#pdf-logo-usfx');
            const srcUSFX = logoUSFX?.src || logoUSFX;
            if (srcUSFX && (logoUSFX?.complete !== false)) {
                const logoWidthUSFX = 1.60;
                const logoPropsUSFX = pdf.getImageProperties(srcUSFX);
                if (logoPropsUSFX && logoPropsUSFX.width > 0) {
                    const logoHeightUSFX = logoWidthUSFX * (logoPropsUSFX.height / logoPropsUSFX.width);
                    const logoYUSFX = institutionalCenterY - (logoHeightUSFX / 2);
                    pdf.addImage(srcUSFX, 'PNG', marginHorizontal, logoYUSFX, logoWidthUSFX, logoHeightUSFX);
                }
            }
        } catch (errUSFX) {
            console.warn("No se pudo agregar el logo USFX al PDF:", errUSFX);
        }

        // Logo Derecho: SiCE (centrado vertical óptico)
        try {
            const logoSiCE = encabezado?.querySelector('#pdf-logo-sice') || encabezado?.querySelector('img');
            const srcSiCE = logoSiCE?.src || logoSiCE;
            if (srcSiCE && (logoSiCE?.complete !== false)) {
                const logoWidthSiCE = 2.20;
                const logoPropsSiCE = pdf.getImageProperties(srcSiCE);
                if (logoPropsSiCE && logoPropsSiCE.width > 0) {
                    const logoHeightSiCE = logoWidthSiCE * (logoPropsSiCE.height / logoPropsSiCE.width);
                    const logoYSiCE = institutionalCenterY - (logoHeightSiCE / 2);
                    pdf.addImage(srcSiCE, 'PNG', pdfWidth - marginHorizontal - logoWidthSiCE, logoYSiCE, logoWidthSiCE, logoHeightSiCE);
                }
            }
        } catch (errSiCE) {
            console.warn("No se pudo agregar el logo SiCE al PDF:", errSiCE);
        }

        const reportTitleY = textVisualBottom + 1.05;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('INFORME ACADÉMICO - MAT 251', centerX, reportTitleY, { align: 'center' });

        const drawLabelValue = (label, value, x, y, maxWidth) => {
            const labelText = `${label}:`;
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(11);
            pdf.text(labelText, x, y);
            const valueX = x + pdf.getTextWidth(`${labelText} `);
            const lines = pdf.splitTextToSize(value || 'No especificado', Math.max(1, maxWidth - (valueX - x)));
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            pdf.text(lines, valueX, y);
            return Math.max(1, lines.length);
        };

        const columnGap = 0.55;
        const leftColumnWidth = 11.25;
        const rightColumnWidth = contentWidth - leftColumnWidth - columnGap;
        const rightColumnX = marginHorizontal + leftColumnWidth + columnGap;
        let dataY = reportTitleY + 0.62;
        let lineCount = drawLabelValue('Docente', docente, marginHorizontal, dataY, contentWidth);
        dataY += Math.max(1, lineCount) * 0.45 + 0.12;
        const studentLines = drawLabelValue('Estudiante', estudiante, marginHorizontal, dataY, leftColumnWidth);
        const groupLines = drawLabelValue('Grupo', grupo, rightColumnX, dataY, rightColumnWidth);
        dataY += Math.max(studentLines, groupLines) * 0.45 + 0.12;
        lineCount = drawLabelValue('Tema', tema, marginHorizontal, dataY, contentWidth);
        dataY += Math.max(1, lineCount) * 0.45 + 0.12;
        drawLabelValue('Fecha', fecha, marginHorizontal, dataY, leftColumnWidth);
        drawLabelValue('Hora', hora, rightColumnX, dataY, rightColumnWidth);

        const bodyStartY = dataY + 0.48;

        const imageData = canvas.toDataURL('image/jpeg', 1.0);
        const imageProps = pdf.getImageProperties(imageData);
        const canvasToPdfScale = contentWidth / imageProps.width;
        // html2canvas redondea el ancho del lienzo; la escala de las posiciones
        // sigue siendo la solicitada, incluso con anchos fraccionarios en cm.
        const domToCanvasScale = escalaCaptura;
        const sectionsInCanvas = seccionesInfo.map(section => ({
            topPx: section.top * domToCanvasScale,
            bottomPx: (section.top + section.height) * domToCanvasScale,
            heightPx: section.height * domToCanvasScale,
            bordeContinuacion: section.bordeContinuacion
        }));

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        const context = pageCanvas.getContext('2d');
        let sourceY = 0;
        let pageIndex = 0;

        while (sourceY < canvas.height) {
            alerta.cargando(`Generando página ${pageIndex + 1}...`, "Construyendo documento PDF...", toastId);
            await pausaUI(60);
            const imageY = pageIndex === 0 ? bodyStartY : marginTopContinuationPages;
            const availableHeight = pdfHeight - imageY - footerLineOffset - contentToFooterGap;
            const maxSliceHeight = availableHeight / canvasToPdfScale;
            let limit = Math.min(sourceY + maxSliceHeight, canvas.height);

            let seccionMantenida = false;
            if (limit < canvas.height) {
                const sectionToKeepTogether = sectionsInCanvas
                    .filter(section =>
                        section.topPx > sourceY + 1 &&
                        section.topPx < limit &&
                        section.bottomPx > limit &&
                        section.heightPx <= maxSliceHeight
                    )
                    .sort((a, b) => a.heightPx - b.heightPx)[0];
                if (sectionToKeepTogether) {
                    limit = sectionToKeepTogether.topPx;
                    seccionMantenida = true;
                }
                if (limit <= sourceY + 1) {
                    limit = Math.min(sourceY + maxSliceHeight, canvas.height);
                    seccionMantenida = false;
                }
            }

            if (!seccionMantenida && limit < canvas.height) limit = buscarCorteEntreRenglones(canvas, limit, sourceY, canvasToPdfScale);

            const sliceHeight = limit - sourceY;
            if (sliceHeight <= 0) break;
            if (pageIndex > 0) pdf.addPage([21.6, 27.9], 'portrait');

            pageCanvas.height = Math.max(1, Math.ceil(sliceHeight));
            context.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
            context.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, pageCanvas.height);
            // El corte puede dejar el borde compartido en la página anterior.
            // Se repone dentro de la imagen de continuación sin alterar las filas.
            const bordeContinuacion = pageIndex > 0
                ? sectionsInCanvas.find(section => Math.abs(section.topPx - sourceY) < 1)?.bordeContinuacion
                : null;
            if (bordeContinuacion) {
                const grosor = bordeContinuacion.grosor * domToCanvasScale;
                const izquierda = bordeContinuacion.izquierda * domToCanvasScale;
                context.save();
                context.beginPath();
                context.strokeStyle = bordeContinuacion.color;
                context.lineWidth = grosor;
                context.moveTo(izquierda, grosor / 2);
                context.lineTo(izquierda + bordeContinuacion.ancho * domToCanvasScale, grosor / 2);
                context.stroke();
                context.restore();
            }
            // El borde compartido también puede quedar fuera de la página que termina.
            // Cerrar la tabla antes del pie cuando la siguiente fila pasa a otra hoja.
            const bordeFinal = limit < canvas.height
                ? sectionsInCanvas.find(section => Math.abs(section.topPx - limit) < 1)?.bordeContinuacion
                : null;
            if (bordeFinal) {
                const grosor = bordeFinal.grosor * domToCanvasScale;
                const izquierda = bordeFinal.izquierda * domToCanvasScale;
                context.save();
                context.beginPath();
                context.strokeStyle = bordeFinal.color;
                context.lineWidth = grosor;
                context.moveTo(izquierda, pageCanvas.height - grosor / 2);
                context.lineTo(izquierda + bordeFinal.ancho * domToCanvasScale, pageCanvas.height - grosor / 2);
                context.stroke();
                context.restore();
            }
            const pageImage = pageCanvas.toDataURL('image/jpeg', 1.0);
            const pageImageHeight = pageCanvas.height * canvasToPdfScale;
            pdf.addImage(pageImage, 'JPEG', marginHorizontal, imageY, contentWidth, pageImageHeight, undefined, 'FAST');

            sourceY = limit;
            pageIndex += 1;
        }

        alerta.cargando("Finalizando documento...", "Preparando descarga...", toastId);
        await pausaUI(80);

        const totalPages = pdf.internal.getNumberOfPages();
        const footerDom = input.querySelector('#pdf-footer-mat251');
        const textoPie = footerDom?.innerText?.trim() || 'Simulador y Cálculo Empresarial - SICE — USFX © 2026 MAT251-Estadística Matemática';

        for (let page = 1; page <= totalPages; page += 1) {
            pdf.setPage(page);
            const footerLineY = pdfHeight - footerLineOffset;
            pdf.setDrawColor(0, 0, 0);
            pdf.setLineWidth(0.015);
            pdf.line(marginHorizontal, footerLineY, pdfWidth - marginHorizontal, footerLineY);
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.setTextColor(0, 0, 0);
            pdf.text(textoPie, centerX, pdfHeight - 1.1, { align: 'center' });
        }

        const cleanFileName = nombreArchivo.replace(/[^a-zA-Z0-9_-]/g, '_');
        pdf.save(`${cleanFileName}.pdf`);
        await pausaUI(120);

        // Sileo transforma automáticamente el estado a éxito mediante toastId
        alerta.exito('PDF Descargado', 'El reporte formal de MAT251 se descargó correctamente.', toastId);
    } catch (error) {
        console.error('Error al generar PDF en MAT251:', error);
        alerta.error('Error al exportar', 'Ocurrió un inconveniente al generar el archivo.', toastId);
    }
};
