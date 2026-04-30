const BASE_URL = "http://127.0.0.1:8000";

//Base url de Render
//const BASE_URL = "https://api-admin-shc170.onrender.com";
//uvicorn main:app --reload


export const api = {

    // Función para leer la hoja de Excel (Usada en useCalculadoraExcel)
    obtenerDatosHoja: async (filename, hojaIndex) => {
        try {
            // Usamos encodeURIComponent por si el archivo tiene espacios en el nombre
            // Añadimos cache: 'no-store' para que siempre traiga los datos frescos del servidor
            const res = await fetch(`${BASE_URL}/view/${encodeURIComponent(filename)}?hoja=${hojaIndex}`, {
                cache: 'no-store'
            });
            if (!res.ok) throw new Error("Error al leer la hoja del servidor");
            return await res.json();
        } catch (error) {
            console.error("Error en api.obtenerDatosHoja:", error);
            throw error;
        }
    },

    // --- Función para obtener las hojas de un Excel ---
    obtenerHojas: async (filename) => {
        try {
            const res = await fetch(`${BASE_URL}/sheets/${encodeURIComponent(filename)}`, {
                cache: 'no-store'
            });
            if (!res.ok) throw new Error("Error al obtener las hojas");
            return await res.json();
        } catch (error) {
            console.error("Error en api.obtenerHojas:", error);
            throw error;
        }
    },

    // --- Funciones para la Calculadora Manual ---

    calcularUnivariada: async (bodyData) => {
        try {
            const res = await fetch(`${BASE_URL}/calcular`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
            });
            if (!res.ok) throw new Error("Error en cálculo univariado");
            return await res.json();
        } catch (error) {
            console.error("Error en api.calcularUnivariada:", error);
            throw error;
        }
    },

    calcularBivariadaManual: async (bodyData) => {
        try {
            const res = await fetch(`${BASE_URL}/calcular_bivariada`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
            });
            if (!res.ok) throw new Error("Error en cálculo bivariado");
            return await res.json();
        } catch (error) {
            console.error("Error en api.calcularBivariadaManual:", error);
            throw error;
        }
    },

    calcularMultivariante: async (bodyData) => {
        try {
            const res = await fetch(`${BASE_URL}/calcular_multivariante`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
            });
            if (!res.ok) throw new Error("Error en cálculo multivariante");
            return await res.json();
        } catch (error) {
            console.error("Error en api.calcularMultivariante:", error);
            throw error;
        }
    },

    guardarTabla: async (nombre, datos) => {
        try {
            const res = await fetch(`${BASE_URL}/save_table`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombre: nombre, tabla: datos }),
            });
            if (!res.ok) throw new Error("Error al guardar la tabla");
            return await res.json();
        } catch (error) {
            console.error("Error en api.guardarTabla:", error);
            throw error;
        }
    },

    // --- SUBIR ARCHIVO ---
    subirArchivo: async (formData) => {
        try {
            const res = await fetch(`${BASE_URL}/upload`, {
                method: "POST",
                body: formData, // Fetch pone los headers correctos automáticamente para FormData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail?.[0]?.msg || "Error al subir el archivo");
            return data;
        } catch (error) {
            console.error("Error en api.subirArchivo:", error);
            throw error;
        }
    },

    // --- ELIMINAR ARCHIVO ---
    eliminarArchivo: async (filename) => {
        try {
            const res = await fetch(`${BASE_URL}/files/${encodeURIComponent(filename)}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Error al eliminar el archivo");
            return true;
        } catch (error) {
            console.error("Error en api.eliminarArchivo:", error);
            throw error;
        }
    },

    // --- OBTENER LISTA DE ARCHIVOS ---
    obtenerArchivos: async () => {
        try {
            const res = await fetch(`${BASE_URL}/files`, {
                cache: 'no-store'
            });
            if (!res.ok) throw new Error("Error al obtener la lista de archivos");
            return await res.json();
        } catch (error) {
            console.error("Error en api.obtenerArchivos:", error);
            throw error;
        }
    },

    actualizarExcel: async (filename, hojaindex, datos) => {
        try{
            const res = await fetch(`${BASE_URL}/update_excel`,{
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    filename: filename,
                    hoja_index: hojaindex,
                    datos: datos
                }),
            });
            if(!res.ok) throw new Error("Error al actualizar el excel");
                return await res.json();


        }catch (error){
            console.error("Error en api.actualizarExcel", error);
            throw error;
        }
    },

    descargarArchivoExcel: async (filename) => {
        try {
            const res = await fetch(`${BASE_URL}/files/${encodeURIComponent(filename)}`, {
                cache: 'no-store'
            });
            if (!res.ok) throw new Error("No se pudo descargar el archivo del servidor.");
            // Retornamos directamente el ArrayBuffer
            return await res.arrayBuffer();
        } catch (error) {
            console.error("Error en api.descargarArchivoExcel:", error);
            throw error;
        }
    },

};

export default api;
