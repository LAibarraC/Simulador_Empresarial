import { useState, useMemo } from 'react';
import RespaldoHerramienta from '../../compartido/documentos/RespaldoHerramienta';
import PieNavegacion from '../../simulacion/PieNavegacion';
import { EncabezadoHerramienta } from '../../compartido/ComponentesHerramienta';
import {
  Zap,
  ArrowRight,
  MoveLeft,
  CheckCircle2,
  Circle,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Flame,
  Radio,
  AlertTriangle,
  Info,
  Paperclip,
  Trash2,
  Pencil,
  Swords,
  FileText,
  Image,
  FileSpreadsheet,
  Link2,
  UploadCloud,
  ExternalLink
} from 'lucide-react';
import { alerta } from '../../../../utils/Notificaciones';
import { FUERZAS_PORTER, obtenerDatosPorterIniciales } from './datosPorter';

import './DiagramaPorter.css';

export default function DiagramaPorter({
    casoActivo,

    datosPorter,
    setDatosPorter,

    onExportarAPoam,

    onIrAPoam,
    onIrAPestel,
    onIrALluvia,
    onExportarPDF,
    exportandoPDF = false
}) {
    // Estado del Modal para Adicionar / Editar factor en Porter
    const [modalFactor, setModalFactor] = useState({
        abierto: false,
        modo: 'crear', // 'crear' | 'editar'
        fuerzaId: null,
        factorIdx: null,
        factorId: null,
        tipo: 'Amenaza', // 'Oportunidad' | 'Amenaza'
        ambito: 'Microentorno', // 'Microentorno' | 'Macroentorno' | 'Externo' | 'Interno'
        texto: ''
    });
    const [modalRadarAbierto, setModalRadarAbierto] = useState(false);
    const [tenazaInfoAbierta, setTenazaInfoAbierta] = useState(null);
    // Estado para expandir/colapsar criterios dentro de cada nodo
    const [criteriosExpandidos, setCriteriosExpandidos] = useState({
        rivalidad: true,
        entrantes: false,
        clientes: false,
        proveedores: false,
        sustitutos: false
    });

    // Modal de Evidencia Documental por Factor (.pdf, imágenes, hojas de cálculo, enlace web)
    const [modalAdjuntos, setModalAdjuntos] = useState({
        abierto: false,
        factorKey: null,
        factorTexto: '',
        fuerzaNombre: ''
    });
    const [tabTipoAdjunto, setTabTipoAdjunto] = useState('pdf');
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const [nombreArchivoInput, setNombreArchivoInput] = useState('');
    const [urlEnlaceInput, setUrlEnlaceInput] = useState('');
    const [tituloEnlaceInput, setTituloEnlaceInput] = useState('');

    // 1. RECOLECCIÓN DE EVIDENCIAS EXTERNAS DEL PASO 1 (LLUVIA DE IDEAS)

    // Estado de las 5 Fuerzas
    const estadoFuerzas = useMemo(() => {
        if (datosPorter?.fuerzas) return datosPorter.fuerzas;
        const base = obtenerDatosPorterIniciales(casoActivo?.id);
        return base.fuerzas;
    }, [datosPorter, casoActivo]);

    // Mapa de asignación rápida: { [evidenciaId]: fuerzaId }

    // Mapa de dimensión PESTEL asignada por evidencia: { [evidenciaId]: { id, label, color, nombre } }

    // Helper para obtener el badge de la evidencia: hereda de PESTEL si fue asignada a una dimensión, o muestra el área de Lluvia de Ideas

    // 2. MÉTRICAS TÁCTICAS Y CÁLCULO DE ATRACTIVO GENERAL
    const tactica = useMemo(() => {
        let sumaPuntos = 0;
        let fuerzaMax = { id: '', puntos: -1, nombre: '', tituloCorto: '' };
        let fuerzaMin = { id: '', puntos: 99, nombre: '', tituloCorto: '' };
        let totalCriterios = 0;
        let totalVinculadas = 0;
        const mapaValores = {};
        const mapaNiveles = {};

        let fuerzasCalibradas = 0;

        FUERZAS_PORTER.forEach(f => {
            const data = estadoFuerzas[f.id] || { nivel: '', puntos: 0 };
            const count = Object.values(data.criteriosActivos || {}).filter(Boolean).length;

            let nivelEfectivo = data.nivel;
            if (!nivelEfectivo) {
                if (count >= 3) nivelEfectivo = 'Alta';
                else if (count === 2) nivelEfectivo = 'Media';
                else nivelEfectivo = 'Baja';
            }

            const pts = nivelEfectivo === 'Alta' ? 3 : nivelEfectivo === 'Media' ? 2 : 1;
            sumaPuntos += pts;
            mapaValores[f.id] = pts;
            mapaNiveles[f.id] = nivelEfectivo;

            if (nivelEfectivo) {
                fuerzasCalibradas++;
            }

            if (pts > fuerzaMax.puntos) {
                fuerzaMax = { id: f.id, puntos: pts, nombre: f.nombre, tituloCorto: f.tituloCorto };
            }
            if (pts < fuerzaMin.puntos) {
                fuerzaMin = { id: f.id, puntos: pts, nombre: f.nombre, tituloCorto: f.tituloCorto };
            }

            totalCriterios += count;
            totalVinculadas += (data.factoresManuales || []).length;
        });

        const conteoNiveles = {
            alta: Object.values(mapaNiveles).filter(n => n === 'Alta').length,
            media: Object.values(mapaNiveles).filter(n => n === 'Media').length,
            baja: Object.values(mapaNiveles).filter(n => n === 'Baja').length
        };

        const getNivelEfectivo = (fuerzaId) => {
            const data = estadoFuerzas[fuerzaId] || {};
            if (data.nivel) return data.nivel;
            const count = Object.values(data.criteriosActivos || {}).filter(Boolean).length;
            if (count >= 3) return 'Alta';
            if (count === 2) return 'Media';
            return 'Baja';
        };

        const provNivel = getNivelEfectivo('proveedores');
        const cliNivel = getNivelEfectivo('clientes');
        const entNivel = getNivelEfectivo('entrantes');
        const susNivel = getNivelEfectivo('sustitutos');

        const esPresionAltaOMedia = (lvl) => lvl === 'Alta' || lvl === 'Media';

        // 1. Tenaza Horizontal: Margen (Proveedores + Clientes)
        const tenazaHorizontal = esPresionAltaOMedia(provNivel) && esPresionAltaOMedia(cliNivel);
        // 2. Tenaza Vertical: Mercado / Sustitución (Entrantes + Sustitutos)
        const tenazaVertical = esPresionAltaOMedia(entNivel) && esPresionAltaOMedia(susNivel);
        // 4. Tenaza Noreste: Captación Comercial (Entrantes + Clientes)
        const tenazaNoreste = esPresionAltaOMedia(entNivel) && esPresionAltaOMedia(cliNivel);
        // 5. Tenaza Suroeste: Inflexibilidad de Costos (Proveedores + Sustitutos)
        const tenazaSuroeste = esPresionAltaOMedia(provNivel) && esPresionAltaOMedia(susNivel);
        // 6. Tenaza Sureste: Deserción de Clientes (Clientes + Sustitutos) (REMOVED)

        // Doble Tenaza: Ambos ejes principales convergen
        const tenazaDoble = tenazaHorizontal && tenazaVertical;

        const tenazas = {
            horizontal: {
                id: 'horizontal',
                nombre: 'Tenaza de Margen',
                eje: 'Horizontal (Proveedores + Clientes)',
                fuerzas: ['Proveedores', 'Clientes'],
                activa: tenazaHorizontal,
                impacto: 'Proveedores encarecen insumos y clientes contraen precios de venta.',
                mensajeCorto: 'Proveedores encarecen insumos mientras los clientes exigen precios bajos, estrangulando el margen de ganancia.',
                estrategiaTutor: 'Evita competir por precios; fortalece la diferenciación de producto, segmenta clientes estratégicos y negocia acuerdos de exclusividad o volumen con proveedores clave.',
                color: '#f59e0b'
            },
            vertical: {
                id: 'vertical',
                nombre: 'Erosión de Demanda',
                eje: 'Vertical (Nuevos Entrantes + Sustitutos)',
                fuerzas: ['Nuevos Entrantes', 'Sustitutos'],
                activa: tenazaVertical,
                impacto: 'Entrantes saturan la oferta y sustitutos absorben la demanda.',
                mensajeCorto: 'Nuevos competidores aumentan la oferta disponible mientras los sustitutos absorben clientes o fijan un techo de precios insalvable.',
                estrategiaTutor: 'Eleva los costos de cambio para que los clientes no migren a sustitutos y consolida canales comerciales para bloquear el acceso a nuevos competidores.',
                color: '#8b5cf6'
            },
            noreste: {
                id: 'noreste',
                nombre: 'Canibalización de Cuota',
                eje: 'Noreste (Nuevos Entrantes + Clientes)',
                fuerzas: ['Nuevos Entrantes', 'Clientes'],
                activa: tenazaNoreste,
                impacto: 'Clientes exigentes tentados por ofertas agresivas de nuevos entrantes.',
                mensajeCorto: 'Clientes con alto poder negociador son captados por ofertas agresivas de nuevos entrantes, fragmentando la cuota de mercado.',
                estrategiaTutor: 'Implementa programas de lealtad basados en personalización, contratos con incentivos de retención y un servicio postventa superior difícil de imitar.',
                color: '#3b82f6'
            },
            suroeste: {
                id: 'suroeste',
                nombre: 'Trampa de Costo/Sustitución',
                eje: 'Suroeste (Proveedores + Sustitutos)',
                fuerzas: ['Proveedores', 'Sustitutos'],
                activa: tenazaSuroeste,
                impacto: 'Costos rígidos de proveedores ante un techo bajo fijado por sustitutos.',
                mensajeCorto: 'Insumos caros y rígidos impuestos por proveedores frente a un techo bajo de precios dictado por productos sustitutos.',
                estrategiaTutor: 'Rediseña la estructura de costos operativos, busca materias primas alternativas internas y optimiza la eficiencia de producción.',
                color: '#ec4899'
            }
        };

        // Orden explícito de los 4 vectores de presión cruzada
        const listaTenazas = [
            tenazas.horizontal,
            tenazas.vertical,
            tenazas.noreste,
            tenazas.suroeste
        ];
        const totalTenazasActivas = listaTenazas.filter(t => t.activa).length;

        let diagnostico = {
            estado: 'Atractivo Moderado',
            color: '#f59e0b',
            clase: 'badge-moderado',
            mensaje: 'Fuerzas competitivas en balance intermedio. Requiere diferenciación clara en propuesta de valor.'
        };

        if (sumaPuntos <= 8) {
            diagnostico = {
                estado: 'Altamente Atractivo',
                color: '#10b981',
                clase: 'badge-alto',
                mensaje: 'Bajas barreras competitivas. Entorno propicio para capturar márgenes altos y retornos estables.'
            };
        } else if (sumaPuntos >= 12) {
            diagnostico = {
                estado: 'Poco Atractivo / Hostil',
                color: '#ef4444',
                clase: 'badge-hostil',
                mensaje: 'Fuerte presión de precios y costos en múltiples frentes. Riesgo de compresión de utilidades.'
            };
        }

        const porcentajeAtractivo = Math.round(((15 - sumaPuntos) / 10) * 100);

        return {
            sumaPuntos,
            porcentajeAtractivo,
            diagnostico,
            tenazaMargen: tenazaHorizontal,
            tenazaHorizontal,
            tenazaVertical,
            tenazaNoreste,
            tenazaSuroeste,
            tenazaDoble,
            tenazas,
            listaTenazas,
            totalTenazasActivas,
            fuerzaMax,
            fuerzaMin,
            totalCriterios,
            totalVinculadas,
            fuerzasCalibradas,
            mapaValores,
            mapaNiveles,
            conteoNiveles,
            amenazasPoam: FUERZAS_PORTER.filter(f => ['Media', 'Alta'].includes(getNivelEfectivo(f.id))).length,
            oportunidadesPoam: FUERZAS_PORTER.filter(f => getNivelEfectivo(f.id) === 'Baja').length
        };
    }, [estadoFuerzas]);

    // 3. CALIBRACIÓN DIRECTA DESDE EL NODO

    const toggleCriterio = (fuerzaId, critId) => {
        const fuerza = estadoFuerzas[fuerzaId] || {};
        const actuales = fuerza.criteriosActivos || {};
        const nuevoValor = !actuales[critId];

        const actualizados = {
            ...actuales,
            [critId]: nuevoValor
        };

        // Sugerencia automática según densidad de criterios
        const count = Object.values(actualizados).filter(Boolean).length;
        let nivelSugerido = fuerza.nivel || '';
        if (count >= 3) nivelSugerido = 'Alta';
        else if (count === 2) nivelSugerido = 'Media';
        else if (count <= 1) nivelSugerido = 'Baja';

        setDatosPorter(prev => ({
            ...prev,
            fuerzas: {
                ...estadoFuerzas,
                [fuerzaId]: {
                    ...fuerza,
                    criteriosActivos: actualizados,
                    nivel: nivelSugerido,
                    puntos: nivelSugerido === 'Alta' ? 3 : nivelSugerido === 'Media' ? 2 : 1
                }
            }
        }));
    };

    const toggleExpandirCriterios = (fuerzaId) => {
        setCriteriosExpandidos(prev => ({
            ...prev,
            [fuerzaId]: !prev[fuerzaId]
        }));
    };

    // 4. GESTIÓN DE FACTORES EN PORTER (CREAR / EDITAR / ELIMINAR)
    const abrirModalNuevoFactor = (fuerzaId) => {
        const fuerzaData = estadoFuerzas[fuerzaId] || {};
        const nivel = fuerzaData.nivel || 'Media';
        const tipoDefecto = nivel === 'Baja' ? 'Oportunidad' : 'Amenaza';
        setModalFactor({
            abierto: true,
            modo: 'crear',
            fuerzaId,
            factorIdx: null,
            factorId: null,
            tipo: tipoDefecto,
            ambito: 'Microentorno',
            texto: ''
        });
    };
    const abrirModalEditarFactor = (fuerzaId, idx, item) => {
        const isObj = typeof item === 'object' && item !== null;
        const factorTexto = isObj ? item.texto : item;
        const factorTipo = isObj && item.tipo ? item.tipo : 'Amenaza';
        const factorAmbito = isObj && (item.ambito || item.tipoAmbito) ? (item.ambito || item.tipoAmbito) : 'Microentorno';
        const factorId = isObj && item.id ? item.id : `porter-${fuerzaId}-${idx}-${Date.now()}`;
        setModalFactor({
            abierto: true,
            modo: 'editar',
            fuerzaId,
            factorIdx: idx,
            factorId,
            tipo: factorTipo,
            ambito: factorAmbito,
            texto: factorTexto || ''
        });
    };
    const cerrarModalFactor = () => {
        setModalFactor({
            abierto: false,
            modo: 'crear',
            fuerzaId: null,
            factorIdx: null,
            factorId: null,
            tipo: 'Amenaza',
            ambito: 'Microentorno',
            texto: ''
        });
    };
    const guardarFactorDesdeModal = (e) => {
        e?.preventDefault();
        const { modo, fuerzaId, factorIdx, factorId, tipo, ambito, texto } = modalFactor;
        const textoLimpio = (texto || '').trim();
        if (!textoLimpio) {
            alerta.advertencia("Texto requerido", "Por favor ingresa la descripción del factor.");
            return;
        }
        const fuerzaObj = FUERZAS_PORTER.find(f => f.id === fuerzaId);
        const ambitoFinal = ambito || 'Microentorno';
        if (modo === 'editar' && factorIdx !== null) {
            setDatosPorter(prev => {
                const prevFuerzas = prev?.fuerzas || {};
                const target = prevFuerzas[fuerzaId] || {};
                const list = [...(target.factoresManuales || [])];
                const itemActual = list[factorIdx];
                const itemActualizado = {
                    ...(typeof itemActual === 'object' && itemActual !== null ? itemActual : {}),
                    id: factorId || (typeof itemActual === 'object' && itemActual?.id ? itemActual.id : `porter-${fuerzaId}-${Date.now()}`),
                    tipo,
                    ambito: ambitoFinal,
                    tipoAmbito: ambitoFinal,
                    texto: textoLimpio,
                    origen: 'manual'
                };
                list[factorIdx] = itemActualizado;
                return {
                    ...prev,
                    fuerzas: {
                        ...prevFuerzas,
                        [fuerzaId]: {
                            ...target,
                            factoresManuales: list
                        }
                    }
                };
            });
            alerta.exito("Factor Actualizado", `El factor en ${fuerzaObj?.tituloCorto || fuerzaId} ha sido actualizado correctamente.`);
        } else {
            const nuevoFactor = {
                id: `porter-${fuerzaId}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                tipo,
                ambito: ambitoFinal,
                tipoAmbito: ambitoFinal,
                texto: textoLimpio,
                origen: 'manual'
            };
            setDatosPorter(prev => {
                const prevFuerzas = prev?.fuerzas || {};
                const target = prevFuerzas[fuerzaId] || {};
                return {
                    ...prev,
                    fuerzas: {
                        ...prevFuerzas,
                        [fuerzaId]: {
                            ...target,
                            factoresManuales: [...(target.factoresManuales || []), nuevoFactor]
                        }
                    }
                };
            });
            alerta.exito("Factor Registrado", `Has añadido el factor en ${fuerzaObj?.tituloCorto || fuerzaId} como ${nuevoFactor.tipo}.`);
        }
        cerrarModalFactor();
    };
    const eliminarFactorManual = (fuerzaId, idx) => {
        setDatosPorter(prev => {
            const prevFuerzas = prev?.fuerzas || {};
            const target = prevFuerzas[fuerzaId] || {};
            const list = [...(target.factoresManuales || [])];
            list.splice(idx, 1);
            return {
                ...prev,
                fuerzas: {
                    ...prevFuerzas,
                    [fuerzaId]: {
                        ...target,
                        factoresManuales: list
                    }
                }
            };
        });
        alerta.informacion("Factor Eliminado", "Se retiró el factor de la fuerza.");
    };

    // ============================================================================
    // GESTIÓN DE EVIDENCIA DOCUMENTAL POR FACTOR (.pdf, imágenes, hojas de cálculo, URL)
    // ============================================================================
    const abrirModalAdjuntos = (factorKey, factorTexto, fuerzaNombre) => {
        setModalAdjuntos({
            abierto: true,
            factorKey,
            factorTexto,
            fuerzaNombre
        });
        setTabTipoAdjunto('pdf');
        setArchivoSeleccionado(null);
        setNombreArchivoInput('');
        setUrlEnlaceInput('');
        setTituloEnlaceInput('');
    };

    const cerrarModalAdjuntos = () => {
        setModalAdjuntos({
            abierto: false,
            factorKey: null,
            factorTexto: '',
            fuerzaNombre: ''
        });
        setArchivoSeleccionado(null);
    };

    const formatearTamanoArchivo = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handleFileChange = (e, tipoEsperado) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (tipoEsperado === 'pdf' && !file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
            alerta.error('Formato no válido', 'Por favor selecciona un archivo con extensión .pdf');
            return;
        }
        if (tipoEsperado === 'imagen' && !file.type.startsWith('image/')) {
            alerta.error('Formato no válido', 'Por favor selecciona una imagen (.png, .jpg, .webp, .svg)');
            return;
        }
        if (tipoEsperado === 'hoja_calculo' && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
            alerta.error('Formato no válido', 'Por favor selecciona una hoja de cálculo (.xlsx, .xls o .csv)');
            return;
        }

        setArchivoSeleccionado({
            file,
            tipo: tipoEsperado,
            nombre: file.name,
            tamano: formatearTamanoArchivo(file.size),
            previewUrl: tipoEsperado === 'imagen' ? URL.createObjectURL(file) : null
        });
        setNombreArchivoInput(file.name.replace(/\.[^/.]+$/, ''));
    };

    const guardarAdjuntoArchivo = () => {
        if (!archivoSeleccionado) {
            alerta.advertencia('Archivo no seleccionado', 'Por favor selecciona un archivo para adjuntar.');
            return;
        }

        const { factorKey } = modalAdjuntos;
        if (!factorKey) return;

        const nuevoAdjunto = {
            id: 'adj-porter-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            tipo: archivoSeleccionado.tipo,
            nombre: (nombreArchivoInput.trim() || archivoSeleccionado.nombre),
            archivoNombreOriginal: archivoSeleccionado.nombre,
            url: archivoSeleccionado.previewUrl || URL.createObjectURL(archivoSeleccionado.file),
            tamano: archivoSeleccionado.tamano,
            fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        };

        setDatosPorter(prev => {
            const prevAdjuntos = prev?.adjuntosPorFactor || {};
            const listaActual = prevAdjuntos[factorKey] || [];
            return {
                ...prev,
                adjuntosPorFactor: {
                    ...prevAdjuntos,
                    [factorKey]: [...listaActual, nuevoAdjunto]
                }
            };
        });

        alerta.exito('Evidencia Adjuntada', `Se ha respaldado con éxito "${nuevoAdjunto.nombre}".`);
        setArchivoSeleccionado(null);
        setNombreArchivoInput('');
    };

    const guardarAdjuntoEnlace = (e) => {
        e?.preventDefault();
        if (!urlEnlaceInput.trim()) {
            alerta.advertencia('URL Requerida', 'Por favor ingresa una URL válida (ej: https://...).');
            return;
        }

        let urlFinal = urlEnlaceInput.trim();
        if (!/^https?:\/\//i.test(urlFinal)) {
            urlFinal = 'https://' + urlFinal;
        }

        const { factorKey } = modalAdjuntos;
        if (!factorKey) return;

        const nuevoAdjunto = {
            id: 'adj-porter-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            tipo: 'enlace',
            nombre: tituloEnlaceInput.trim() || urlFinal.replace(/^https?:\/\/(www\.)?/, '').slice(0, 35),
            url: urlFinal,
            tamano: 'Enlace web',
            fecha: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        };

        setDatosPorter(prev => {
            const prevAdjuntos = prev?.adjuntosPorFactor || {};
            const listaActual = prevAdjuntos[factorKey] || [];
            return {
                ...prev,
                adjuntosPorFactor: {
                    ...prevAdjuntos,
                    [factorKey]: [...listaActual, nuevoAdjunto]
                }
            };
        });

        alerta.exito('Enlace Adjuntado', `Se ha vinculado la fuente externa al factor.`);
        setUrlEnlaceInput('');
        setTituloEnlaceInput('');
    };

    const eliminarAdjunto = (factorKey, adjuntoId) => {
        setDatosPorter(prev => {
            const prevAdjuntos = prev?.adjuntosPorFactor || {};
            const listaActual = prevAdjuntos[factorKey] || [];
            return {
                ...prev,
                adjuntosPorFactor: {
                    ...prevAdjuntos,
                    [factorKey]: listaActual.filter(a => a.id !== adjuntoId)
                }
            };
        });
        alerta.informacion('Evidencia Eliminada', 'Se ha retirado el respaldo documental.');
    };

    // 5. EXPORTAR AL POAM (PASO 3)
    const ejecutarExportacionPoam = () => {
        if (onExportarAPoam) onExportarAPoam();
        else if (onIrAPoam) onIrAPoam();
    };

    // 6. GENERACIÓN DEL GRÁFICO RADAR (SPIDER CHART SVG)

    const angulos = [-90, -18, 54, 126, 198];
    const fuerzasOrdenRadar = ['entrantes', 'clientes', 'sustitutos', 'rivalidad', 'proveedores'];

    return (
        <div className="porter-spacious-container" id="porter-spacious-container">
            <EncabezadoHerramienta icono={Swords} titulo="5 Fuerzas de Porter · Microentorno competitivo" exportando={exportandoPDF} onExportar={onExportarPDF}/>
            {/* =========================================================================
          WORKSPACE PRINCIPAL: 5 FUERZAS DE PORTER
          ========================================================================= */}
            <div className="porter-main-layout" style={{ gridTemplateColumns: '1fr' }}>

                {/* -----------------------------------------------------------------------
            COLUMNA IZQUIERDA: HEADER Y DIAGRAMA EN CRUZ (OCUPAN EL MISMO ANCHO)
            ----------------------------------------------------------------------- */}
                <div className="porter-workspace-left">
                    {/* BARRA TÁCTICA DE VECTORES DE PRESIÓN CRUZADA */}
                    <div className="porter-tenazas-radar-bar">
                        {/* 1. FILA SUPERIOR: TÍTULO, BALANCE DE ALERTAS Y BOTÓN RADAR 5D */}
                        <div className="radar-bar-header-row">
                            <div className="radar-bar-left">
                                <Zap size={16} className="radar-zap-icon" />
                                <span className="radar-bar-title">Vectores de Presión Cruzada:</span>
                                <span className={`radar-bar-count-badge ${tactica.totalTenazasActivas > 0 ? 'has-active' : 'all-clear'}`}>
                                    {tactica.totalTenazasActivas > 0 
                                        ? `${tactica.totalTenazasActivas} Alertas Activas / ${4 - tactica.totalTenazasActivas} Flancos Despejados`
                                        : '0 Alertas Activas / 4 Flancos Despejados'}
                                </span>
                            </div>

                            <div className="radar-bar-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <button
                                    type="button"
                                    className="btn-header-radar"
                                    onClick={() => setModalRadarAbierto(true)}
                                    title="Ver Geometría de Presión del Sector (Radar 5D)"
                                >
                                    <Radio size={15} />
                                    <span>Radar 5D: Presión</span>
                                </button>
                            </div>
                        </div>

                        {/* 2. FILA INFERIOR: LOS 4 VECTORES/TENAZAS EN CUADRÍCULA ESPACIOSA */}
                        <div className="radar-bar-chips-grid">
                            {(tactica.listaTenazas || []).map(t => (
                                <div
                                    key={t.id}
                                    className={`tenaza-chip-status ${t.activa ? 'active' : 'inactive'} ${tenazaInfoAbierta === t.id ? 'info-active' : ''}`}
                                >
                                    <div className="tenaza-chip-info-wrap">
                                        <span className="tenaza-dot-indicator" style={{ backgroundColor: t.activa ? t.color : 'var(--text-muted)' }} />
                                        <span className="tenaza-chip-name" title={t.nombre}>{t.nombre}</span>
                                    </div>
                                    <div className="tenaza-chip-actions-wrap">
                                        <span className="tenaza-chip-state">{t.activa ? 'ACTIVA' : 'SEGURA'}</span>
                                        <button
                                            type="button"
                                            className={`btn-tenaza-info ${tenazaInfoAbierta === t.id ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setTenazaInfoAbierta(prev => prev === t.id ? null : t.id);
                                            }}
                                            title={`Ver qué significa ${t.nombre}`}
                                            aria-label={`Ver qué significa ${t.nombre}`}
                                        >
                                            <Info size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* MENSAJE CORTO EXPLICATIVO AL APRETAR EL ICONO DE INFORMACIÓN (ℹ️) */}
                        {tenazaInfoAbierta && (() => {
                            const tInfo = (tactica.listaTenazas || []).find(t => t.id === tenazaInfoAbierta);
                            if (!tInfo) return null;
                            return (
                                <div className="tenaza-info-popover-banner animate-fade-in">
                                    <div className="tenaza-info-banner-left">
                                        <div className="tenaza-info-icon-badge" style={{ backgroundColor: `${tInfo.color}20`, color: tInfo.color }}>
                                            <Info size={14} />
                                        </div>
                                        <div className="tenaza-info-banner-text">
                                            <div className="tenaza-info-banner-title">
                                                <strong>{tInfo.nombre}</strong>
                                                <span className="tenaza-info-fuerzas-tag">({tInfo.fuerzas.join(' + ')})</span>
                                                <span className={`tenaza-info-status-pill ${tInfo.activa ? 'active' : 'safe'}`}>
                                                    {tInfo.activa ? 'ACTIVA' : 'SEGURA'}
                                                </span>
                                            </div>
                                            <p className="tenaza-info-banner-desc">{tInfo.mensajeCorto}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn-close-tenaza-info"
                                        onClick={() => setTenazaInfoAbierta(null)}
                                        title="Cerrar explicación"
                                        aria-label="Cerrar"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            );
                        })()}
                    </div>

                    {/* ÁREA HERO: DIAGRAMA ESTRUCTURAL EN CRUZ LIMPIO DE LAS 5 FUERZAS */}
                    <div className={`porter-cross-arena ${tactica.tenazaDoble ? 'arena-tenaza-doble' : ''} ${tactica.tenazaVertical ? 'arena-tenaza-vertical' : ''} ${tactica.tenazaHorizontal ? 'arena-tenaza-horizontal' : ''}`}>
                        {/* 1. NORTE (ARRIBA): AMENAZA DE NUEVOS ENTRANTES */}
                        <div className={`cross-cell node-norte ${tactica.tenazaVertical ? 'pincer-active-v' : ''}`}>
                            <NodoFuerzaTarjeta
                                fuerza={FUERZAS_PORTER.find(f => f.id === 'entrantes')}
                                posicion="Norte"
                                data={estadoFuerzas.entrantes || {}}
                                adjuntosPorFactor={datosPorter?.adjuntosPorFactor || {}}
                                onAbrirModalAdjuntos={abrirModalAdjuntos}
                                criteriosAbiertos={criteriosExpandidos.entrantes}
                                onToggleCriterios={() => toggleExpandirCriterios('entrantes')}
                                onToggleCriterio={(critId) => toggleCriterio('entrantes', critId)}
                                onAbrirModalNuevoFactor={() => abrirModalNuevoFactor('entrantes')}
                                onAbrirModalEditarFactor={(idx, factor) => abrirModalEditarFactor('entrantes', idx, factor)}
                                onEliminarFactor={(idx) => eliminarFactorManual('entrantes', idx)}
                                esParteTenazaVertical={tactica.tenazaVertical}
                            />
                        </div>

                        {/* 2. OESTE (IZQUIERDA): PODER DE LOS PROVEEDORES */}
                        <div className={`cross-cell node-oeste ${tactica.tenazaHorizontal ? 'pincer-active-h' : ''}`}>
                            <NodoFuerzaTarjeta
                                fuerza={FUERZAS_PORTER.find(f => f.id === 'proveedores')}
                                posicion="Oeste"
                                data={estadoFuerzas.proveedores || {}}
                                adjuntosPorFactor={datosPorter?.adjuntosPorFactor || {}}
                                onAbrirModalAdjuntos={abrirModalAdjuntos}
                                criteriosAbiertos={criteriosExpandidos.proveedores}
                                onToggleCriterios={() => toggleExpandirCriterios('proveedores')}
                                onToggleCriterio={(critId) => toggleCriterio('proveedores', critId)}
                                onAbrirModalNuevoFactor={() => abrirModalNuevoFactor('proveedores')}
                                onAbrirModalEditarFactor={(idx, factor) => abrirModalEditarFactor('proveedores', idx, factor)}
                                onEliminarFactor={(idx) => eliminarFactorManual('proveedores', idx)}
                                esParteTenazaHorizontal={tactica.tenazaHorizontal}
                            />
                        </div>

                        {/* 3. CENTRO: RIVALIDAD ENTRE COMPETIDORES (NÚCLEO BATTLEGROUND) */}
                        <div className={`cross-cell node-centro ${tactica.tenazaDoble ? 'pincer-active-doble' : tactica.tenazaVertical ? 'pincer-active-v' : tactica.tenazaHorizontal ? 'pincer-active-h' : ''}`}>
                            <NodoFuerzaTarjeta
                                fuerza={FUERZAS_PORTER.find(f => f.id === 'rivalidad')}
                                posicion="Centro"
                                data={estadoFuerzas.rivalidad || {}}
                                adjuntosPorFactor={datosPorter?.adjuntosPorFactor || {}}
                                onAbrirModalAdjuntos={abrirModalAdjuntos}
                                criteriosAbiertos={criteriosExpandidos.rivalidad}
                                onToggleCriterios={() => toggleExpandirCriterios('rivalidad')}
                                onToggleCriterio={(critId) => toggleCriterio('rivalidad', critId)}
                                onAbrirModalNuevoFactor={() => abrirModalNuevoFactor('rivalidad')}
                                onAbrirModalEditarFactor={(idx, factor) => abrirModalEditarFactor('rivalidad', idx, factor)}
                                onEliminarFactor={(idx) => eliminarFactorManual('rivalidad', idx)}
                                esCentro={true}
                                tenazaMargen={tactica.tenazaHorizontal}
                                tenazaVertical={tactica.tenazaVertical}
                                tenazaDoble={tactica.tenazaDoble}
                            />
                        </div>

                        {/* 4. ESTE (DERECHA): PODER DE LOS CLIENTES */}
                        <div className={`cross-cell node-este ${tactica.tenazaHorizontal ? 'pincer-active-h' : ''}`}>
                            <NodoFuerzaTarjeta
                                fuerza={FUERZAS_PORTER.find(f => f.id === 'clientes')}
                                posicion="Este"
                                data={estadoFuerzas.clientes || {}}
                                adjuntosPorFactor={datosPorter?.adjuntosPorFactor || {}}
                                onAbrirModalAdjuntos={abrirModalAdjuntos}
                                criteriosAbiertos={criteriosExpandidos.clientes}
                                onToggleCriterios={() => toggleExpandirCriterios('clientes')}
                                onToggleCriterio={(critId) => toggleCriterio('clientes', critId)}
                                onAbrirModalNuevoFactor={() => abrirModalNuevoFactor('clientes')}
                                onAbrirModalEditarFactor={(idx, factor) => abrirModalEditarFactor('clientes', idx, factor)}
                                onEliminarFactor={(idx) => eliminarFactorManual('clientes', idx)}
                                esParteTenazaHorizontal={tactica.tenazaHorizontal}
                            />
                        </div>

                        {/* 5. SUR (ABAJO): AMENAZA DE PRODUCTOS SUSTITUTOS */}
                        <div className={`cross-cell node-sur ${tactica.tenazaVertical ? 'pincer-active-v' : ''}`}>
                            <NodoFuerzaTarjeta
                                fuerza={FUERZAS_PORTER.find(f => f.id === 'sustitutos')}
                                posicion="Sur"
                                data={estadoFuerzas.sustitutos || {}}
                                adjuntosPorFactor={datosPorter?.adjuntosPorFactor || {}}
                                onAbrirModalAdjuntos={abrirModalAdjuntos}
                                criteriosAbiertos={criteriosExpandidos.sustitutos}
                                onToggleCriterios={() => toggleExpandirCriterios('sustitutos')}
                                onToggleCriterio={(critId) => toggleCriterio('sustitutos', critId)}
                                onAbrirModalNuevoFactor={() => abrirModalNuevoFactor('sustitutos')}
                                onAbrirModalEditarFactor={(idx, factor) => abrirModalEditarFactor('sustitutos', idx, factor)}
                                onEliminarFactor={(idx) => eliminarFactorManual('sustitutos', idx)}
                                esParteTenazaVertical={tactica.tenazaVertical}
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* =========================================================================
          3. FOOTER LIMPIO DE NAVEGACIÓN
          ========================================================================= */}
            <RespaldoHerramienta id="porter"/>
            <PieNavegacion onAnterior={onIrAPestel || onIrALluvia} onSiguiente={ejecutarExportacionPoam}/>

            {/* =========================================================================
          4. MODAL: ADICIONAR / EDITAR FACTOR EN LAS 5 FUERZAS DE PORTER
          ========================================================================= */}
            {modalFactor.abierto && (() => {
                const fuerzaActual = FUERZAS_PORTER.find(f => f.id === modalFactor.fuerzaId);
                const esEdicion = modalFactor.modo === 'editar';
                const IconoFuerza = fuerzaActual?.icono || Swords;

                return (
                    <div className="pestel-modal-overlay" onClick={cerrarModalFactor}>
                        <div className="pestel-modal-container pestel-modal-add-factor" onClick={(e) => e.stopPropagation()}>
                            {/* CABECERA DEL MODAL */}
                            <div className="pestel-modal-header">
                                <div className="pestel-modal-header-info">
                                    <div className="pestel-modal-pretitle" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <span
                                            className="porter-modal-force-pill"
                                            style={{
                                                backgroundColor: `rgba(${fuerzaActual?.colorRgb || '234, 88, 12'}, 0.15)`,
                                                color: fuerzaActual?.color || '#ea580c',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                padding: '3px 8px',
                                                borderRadius: '5px',
                                                fontSize: '0.70rem',
                                                fontWeight: '800',
                                                lineHeight: '1.2'
                                            }}
                                        >
                                            <IconoFuerza size={13} />
                                            <span>{fuerzaActual?.tituloCorto}</span>
                                        </span>
                                        <span className="porter-modal-pretitle-text">
                                            • {esEdicion ? 'Edición de Factor Estratégico' : 'Nuevo Factor Estratégico'}
                                        </span>
                                    </div>
                                    <h3 className="pestel-modal-title">
                                        {esEdicion ? `Editar Factor en ${fuerzaActual?.tituloCorto}` : `Adicionar Factor en ${fuerzaActual?.tituloCorto}`}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    className="pestel-modal-btn-close"
                                    onClick={cerrarModalFactor}
                                    title="Cerrar modal"
                                >
                                    <X size={15} />
                                </button>
                            </div>
                            {/* FORMULARIO DEL MODAL */}
                            <form onSubmit={guardarFactorDesdeModal} className="pestel-modal-factor-form">
                                <div className="pestel-modal-body">
                                    {/* 1. SELECCIÓN DE TIPO: OPORTUNIDAD O AMENAZA */}
                                    <div className="pestel-modal-input-group">
                                        <label className="pestel-modal-label">
                                            <span>Tipo de Factor:</span>
                                            <span className="pestel-modal-label-hint">Selecciona la naturaleza del impacto sectorial</span>
                                        </label>
                                        <div className="pestel-modal-tipo-grid">
                                            <div
                                                role="button"
                                                tabIndex={0}
                                                className={`pestel-modal-tipo-card op ${modalFactor.tipo === 'Oportunidad' ? 'active' : ''}`}
                                                onClick={() => setModalFactor(p => ({ ...p, tipo: 'Oportunidad' }))}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setModalFactor(p => ({ ...p, tipo: 'Oportunidad' })); } }}
                                            >
                                                <div className="pestel-modal-tipo-radio op">
                                                    {modalFactor.tipo === 'Oportunidad' && <div className="pestel-modal-radio-inner op" />}
                                                </div>
                                                <div className="pestel-modal-tipo-text-group">
                                                    <strong className="pestel-modal-tipo-title op">Oportunidad</strong>
                                                    <span className="pestel-modal-tipo-desc">Ventaja competitiva o factor favorable</span>
                                                </div>
                                            </div>
                                            <div
                                                role="button"
                                                tabIndex={0}
                                                className={`pestel-modal-tipo-card am ${modalFactor.tipo === 'Amenaza' ? 'active' : ''}`}
                                                onClick={() => setModalFactor(p => ({ ...p, tipo: 'Amenaza' }))}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setModalFactor(p => ({ ...p, tipo: 'Amenaza' })); } }}
                                            >
                                                <div className="pestel-modal-tipo-radio am">
                                                    {modalFactor.tipo === 'Amenaza' && <div className="pestel-modal-radio-inner am" />}
                                                </div>
                                                <div className="pestel-modal-tipo-text-group">
                                                    <strong className="pestel-modal-tipo-title am">Amenaza</strong>
                                                    <span className="pestel-modal-tipo-desc">Presión competitiva o riesgo sectorial</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* 2. DESCRIPCIÓN DEL FACTOR */}
                                    <div className="pestel-modal-input-group">
                                        <label className="pestel-modal-label" htmlFor="porter-desc-factor-input">
                                            <span>Descripción del Factor:</span>
                                            <span className="pestel-modal-label-hint">
                                                {(modalFactor.texto || '').length}/350 caracteres
                                            </span>
                                        </label>
                                        <textarea
                                            id="porter-desc-factor-input"
                                            rows={3}
                                            placeholder={`Describe el factor en ${fuerzaActual?.tituloCorto}...`}
                                            value={modalFactor.texto || ''}
                                            onChange={(e) => setModalFactor(p => ({ ...p, texto: e.target.value }))}
                                            maxLength={350}
                                            className="pestel-modal-textarea"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                {/* PIE DEL MODAL */}
                                <div className="pestel-modal-footer">
                                    <span className="pestel-modal-footer-hint">
                                        {esEdicion
                                            ? 'Los cambios se actualizarán en Porter y se sincronizarán con POAM.'
                                            : `El factor se registrará en ${fuerzaActual?.tituloCorto}`}
                                    </span>
                                    <div className="pestel-modal-actions-group">
                                        <button
                                            type="button"
                                            className="pestel-modal-btn-cancel"
                                            onClick={cerrarModalFactor}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="pestel-modal-btn-save"
                                        >
                                            {esEdicion ? <Check size={14} /> : <Plus size={14} />}
                                            <span>{esEdicion ? 'Guardar Cambios' : 'Añadir Factor'}</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                );
            })()}

            {/* =========================================================================
          6. MODAL: GEOMETRÍA DE PRESIÓN DEL SECTOR (RADAR 5D A DETALLE)
          ========================================================================= */}
            {modalRadarAbierto && (
                <div className="porter-modal-backdrop" onClick={() => setModalRadarAbierto(false)}>
                    <div className="radar-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-vincular">
                            <div className="flex items-center gap-2.5">
                                <div className="modal-icon-badge" style={{ backgroundColor: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                                    <Radio size={20} />
                                </div>
                                <div>
                                    <h3 className="modal-title-text">Geometría de Presión del Sector</h3>
                                    <span className="modal-sub-text">Radar 5D — Visualización Táctica de Fuerzas Competitivas</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="modal-close-icon"
                                onClick={() => setModalRadarAbierto(false)}
                                title="Cerrar modal"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="radar-modal-body">
                            {/* Contenedor del Gráfico SVG Ampliado */}
                            <div className="radar-modal-graphic-col">
                                <svg width="360" height="290" viewBox="0 0 380 290" className="radar-modal-svg">
                                    {/* Cuadrículas de referencia pentagonales concéntricas (Baja 33%, Media 66%, Alta 100%) */}
                                    {[0.33, 0.66, 1.0].map((scale, i) => (
                                        <polygon
                                            key={i}
                                            points={fuerzasOrdenRadar.map((_, idx) => {
                                                const r = scale * 85;
                                                const rad = (angulos[idx] * Math.PI) / 180;
                                                return `${190 + r * Math.cos(rad)},${145 + r * Math.sin(rad)}`;
                                            }).join(' ')}
                                            className="radar-modal-grid-poly"
                                        />
                                    ))}

                                    {/* Niveles concéntricos en texto */}
                                    <text x="194" y="120" className="radar-lvl-text">Baja</text>
                                    <text x="194" y="92" className="radar-lvl-text">Media</text>
                                    <text x="194" y="64" className="radar-lvl-text">Alta</text>

                                    {/* Ejes radiales */}
                                    {angulos.map((ang, i) => {
                                        const rad = (ang * Math.PI) / 180;
                                        return (
                                            <line
                                                key={i}
                                                x1={190}
                                                y1={145}
                                                x2={190 + 85 * Math.cos(rad)}
                                                y2={145 + 85 * Math.sin(rad)}
                                                className="radar-modal-axis-line"
                                            />
                                        );
                                    })}

                                    {/* Polígono de fuerza real */}
                                    <polygon
                                        points={fuerzasOrdenRadar.map((fId, idx) => {
                                            const pts = tactica.mapaValores[fId] || 2;
                                            const radio = (pts / 3) * 85;
                                            const rad = (angulos[idx] * Math.PI) / 180;
                                            const x = 190 + radio * Math.cos(rad);
                                            const y = 145 + radio * Math.sin(rad);
                                            return `${x},${y}`;
                                        }).join(' ')}
                                        className={`radar-modal-poly ${tactica.diagnostico.clase}`}
                                    />

                                    {/* Puntos en vértices */}
                                    {fuerzasOrdenRadar.map((fId, idx) => {
                                        const pts = tactica.mapaValores[fId] || 2;
                                        const radio = (pts / 3) * 85;
                                        const rad = (angulos[idx] * Math.PI) / 180;
                                        const cx = 190 + radio * Math.cos(rad);
                                        const cy = 145 + radio * Math.sin(rad);

                                        return (
                                            <circle
                                                key={fId}
                                                cx={cx}
                                                cy={cy}
                                                r="5"
                                                className="radar-modal-circle-vertex"
                                            />
                                        );
                                    })}

                                    {/* Etiquetas de los vértices (con margen generoso para evitar cortes) */}
                                    <text x="190" y="30" textAnchor="middle" className="radar-modal-axis-tag n">N: Entrantes</text>
                                    <text x="282" y="122" textAnchor="start" className="radar-modal-axis-tag e">E: Clientes</text>
                                    <text x="245" y="238" textAnchor="start" className="radar-modal-axis-tag s">S: Sustitutos</text>
                                    <text x="135" y="238" textAnchor="end" className="radar-modal-axis-tag so">SO: Rivalidad</text>
                                    <text x="98" y="122" textAnchor="end" className="radar-modal-axis-tag no">NO: Proveedores</text>
                                </svg>

                                <div className="radar-modal-summary-pill">
                                    <span>Diagnóstico:</span>
                                    <strong style={{ color: tactica.diagnostico.color }}>
                                        {tactica.diagnostico.estado} ({tactica.porcentajeAtractivo}% Rentable)
                                    </strong>
                                </div>
                            </div>

                            {/* Columna de Detalle de Fuerzas y Leyenda */}
                            <div className="radar-modal-detail-col">
                                <div className="radar-detail-header-row">
                                    <span className="text-xs uppercase font-extrabold text-gray-400 tracking-wider">
                                        Ejes del Radar (5 Fuerzas)
                                    </span>
                                    <span className="text-xs font-semibold text-gray-400">
                                        Presión Sectorial
                                    </span>
                                </div>

                                <div className="radar-detail-cards-stack">
                                    {/* N: Entrantes */}
                                    <div className="radar-force-detail-row">
                                        <div className="force-badge-prefix n">N</div>
                                        <div className="force-info-text">
                                            <div className="force-title-row">
                                                <strong>Nuevos Entrantes</strong>
                                                <span className={`pill-level ${(tactica.mapaValores['entrantes'] === 3 ? 'alta' : tactica.mapaValores['entrantes'] === 2 ? 'media' : 'baja')}`}>
                                                    Nivel {tactica.mapaValores['entrantes'] === 3 ? 'Alta' : tactica.mapaValores['entrantes'] === 2 ? 'Media' : 'Baja'}
                                                </span>
                                            </div>
                                            <p className="force-micro-desc">Barreras de escala, capital necesario y protección de marcas.</p>
                                        </div>
                                    </div>

                                    {/* E: Clientes */}
                                    <div className="radar-force-detail-row">
                                        <div className="force-badge-prefix e">E</div>
                                        <div className="force-info-text">
                                            <div className="force-title-row">
                                                <strong>Poder de Clientes</strong>
                                                <span className={`pill-level ${(tactica.mapaValores['clientes'] === 3 ? 'alta' : tactica.mapaValores['clientes'] === 2 ? 'media' : 'baja')}`}>
                                                    Nivel {tactica.mapaValores['clientes'] === 3 ? 'Alta' : tactica.mapaValores['clientes'] === 2 ? 'Media' : 'Baja'}
                                                </span>
                                            </div>
                                            <p className="force-micro-desc">Concentración de demanda y sensibilidad a precios y ofertas.</p>
                                        </div>
                                    </div>

                                    {/* S: Sustitutos */}
                                    <div className="radar-force-detail-row">
                                        <div className="force-badge-prefix s">S</div>
                                        <div className="force-info-text">
                                            <div className="force-title-row">
                                                <strong>Productos Sustitutos</strong>
                                                <span className={`pill-level ${(tactica.mapaValores['sustitutos'] === 3 ? 'alta' : tactica.mapaValores['sustitutos'] === 2 ? 'media' : 'baja')}`}>
                                                    Nivel {tactica.mapaValores['sustitutos'] === 3 ? 'Alta' : tactica.mapaValores['sustitutos'] === 2 ? 'Media' : 'Baja'}
                                                </span>
                                            </div>
                                            <p className="force-micro-desc">Propensión a cambiar por alternativas con mejor relación valor/precio.</p>
                                        </div>
                                    </div>

                                    {/* SO: Rivalidad */}
                                    <div className="radar-force-detail-row core-row">
                                        <div className="force-badge-prefix so">SO</div>
                                        <div className="force-info-text">
                                            <div className="force-title-row">
                                                <strong className="text-red-400">Rivalidad Competitiva</strong>
                                                <span className={`pill-level ${(tactica.mapaValores['rivalidad'] === 3 ? 'alta' : tactica.mapaValores['rivalidad'] === 2 ? 'media' : 'baja')}`}>
                                                    Nivel {tactica.mapaValores['rivalidad'] === 3 ? 'Alta' : tactica.mapaValores['rivalidad'] === 2 ? 'Media' : 'Baja'}
                                                </span>
                                            </div>
                                            <p className="force-micro-desc">Intensidad en cuota de mercado, ofertas agresivas y fidelización.</p>
                                        </div>
                                    </div>

                                    {/* NO: Proveedores */}
                                    <div className="radar-force-detail-row">
                                        <div className="force-badge-prefix no">NO</div>
                                        <div className="force-info-text">
                                            <div className="force-title-row">
                                                <strong>Poder de Proveedores</strong>
                                                <span className={`pill-level ${(tactica.mapaValores['proveedores'] === 3 ? 'alta' : tactica.mapaValores['proveedores'] === 2 ? 'media' : 'baja')}`}>
                                                    Nivel {tactica.mapaValores['proveedores'] === 3 ? 'Alta' : tactica.mapaValores['proveedores'] === 2 ? 'Media' : 'Baja'}
                                                </span>
                                            </div>
                                            <p className="force-micro-desc">Poder monopólico sobre materias primas y altos costos de cambio.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer-vincular">
                            <span className="text-xs text-gray-400">
                                Puntaje Global de Fuerzas: <strong className="text-white">{tactica.sumaPuntos} / 15 pts</strong>
                            </span>
                            <button
                                type="button"
                                className="btn-modal-done"
                                onClick={() => setModalRadarAbierto(false)}
                            >
                                Cerrar Detalle
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================== */}
            {/* MODAL DE EVIDENCIA DOCUMENTAL POR FACTOR (IDÉNTICO A PESTEL) */}
            {/* ============================================================== */}
            {modalAdjuntos.abierto && (
                <div className="pestel-modal-overlay" onClick={cerrarModalAdjuntos}>
                    <div className="pestel-modal-container" onClick={(e) => e.stopPropagation()}>
                        {/* CABECERA DEL MODAL */}
                        <div className="pestel-modal-header">
                            <div className="pestel-modal-header-info">
                                <div className="pestel-modal-pretitle">
                                    <Paperclip size={13} className="pestel-modal-icon-badge" />
                                    <span>Respaldo Documental • {modalAdjuntos.fuerzaNombre}</span>
                                </div>
                                <h3 className="pestel-modal-title">Evidencias y Fuentes del Factor</h3>
                                <p className="pestel-modal-factor-quote">
                                    "{modalAdjuntos.factorTexto}"
                                </p>
                            </div>
                            <button
                                type="button"
                                className="pestel-modal-btn-close"
                                onClick={cerrarModalAdjuntos}
                                title="Cerrar modal"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <div className="pestel-modal-body">
                            {/* SELECTOR DE TIPO DE EVIDENCIA */}
                            <div className="pestel-modal-type-tabs">
                                <button
                                    type="button"
                                    className={`pestel-modal-tab-btn ${tabTipoAdjunto === 'pdf' ? 'active pdf' : ''}`}
                                    onClick={() => { setTabTipoAdjunto('pdf'); setArchivoSeleccionado(null); }}
                                >
                                    <FileText size={14} />
                                    <span>Documentos (.pdf)</span>
                                </button>
                                <button
                                    type="button"
                                    className={`pestel-modal-tab-btn ${tabTipoAdjunto === 'imagen' ? 'active img' : ''}`}
                                    onClick={() => { setTabTipoAdjunto('imagen'); setArchivoSeleccionado(null); }}
                                >
                                    <Image size={14} />
                                    <span>Imágenes</span>
                                </button>
                                <button
                                    type="button"
                                    className={`pestel-modal-tab-btn ${tabTipoAdjunto === 'hoja_calculo' ? 'active sheet' : ''}`}
                                    onClick={() => { setTabTipoAdjunto('hoja_calculo'); setArchivoSeleccionado(null); }}
                                >
                                    <FileSpreadsheet size={14} />
                                    <span>Hojas de cálculo</span>
                                </button>
                                <button
                                    type="button"
                                    className={`pestel-modal-tab-btn ${tabTipoAdjunto === 'enlace' ? 'active link' : ''}`}
                                    onClick={() => { setTabTipoAdjunto('enlace'); setArchivoSeleccionado(null); }}
                                >
                                    <Link2 size={14} />
                                    <span>Enlace web / URL externa</span>
                                </button>
                            </div>

                            {/* ÁREA DE CARGA O INGRESO */}
                            <div className="pestel-modal-upload-panel">
                                {tabTipoAdjunto === 'enlace' ? (
                                    <form onSubmit={guardarAdjuntoEnlace} className="pestel-modal-link-form">
                                        <div className="pestel-modal-field">
                                            <label>Enlace web / URL externa (ej: https://...):</label>
                                            <div className="pestel-input-icon-wrap">
                                                <Link2 size={14} className="input-icon" />
                                                <input
                                                    type="url"
                                                    placeholder="https://ejemplo.com/estudio-o-noticia"
                                                    value={urlEnlaceInput}
                                                    onChange={(e) => setUrlEnlaceInput(e.target.value)}
                                                    required
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        <div className="pestel-modal-field">
                                            <label>Título o Fuente informativa (opcional):</label>
                                            <input
                                                type="text"
                                                placeholder="Ej: Informe Sectorial, Noticia del Mercado, Estudio Competitivo"
                                                value={tituloEnlaceInput}
                                                onChange={(e) => setTituloEnlaceInput(e.target.value)}
                                            />
                                        </div>
                                        <button type="submit" className="pestel-modal-btn-submit">
                                            <Plus size={13} />
                                            <span>Vincular Enlace Web</span>
                                        </button>
                                    </form>
                                ) : (
                                    <div className="pestel-modal-file-upload-block">
                                        <label className="pestel-modal-dropzone">
                                            <input
                                                type="file"
                                                className="pestel-hidden-file-input"
                                                accept={
                                                    tabTipoAdjunto === 'pdf'
                                                        ? '.pdf,application/pdf'
                                                        : tabTipoAdjunto === 'imagen'
                                                        ? 'image/*'
                                                        : '.xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv'
                                                }
                                                onChange={(e) => handleFileChange(e, tabTipoAdjunto)}
                                            />
                                            <div className="pestel-dropzone-content">
                                                <UploadCloud size={22} className="pestel-upload-icon" />
                                                <span className="pestel-dropzone-title">
                                                    {tabTipoAdjunto === 'pdf' && 'Seleccionar o arrastrar Documento PDF (.pdf)'}
                                                    {tabTipoAdjunto === 'imagen' && 'Seleccionar o arrastrar Imagen (.png, .jpg, .webp)'}
                                                    {tabTipoAdjunto === 'hoja_calculo' && 'Seleccionar o arrastrar Planilla (.xlsx, .xls, .csv)'}
                                                </span>
                                                <span className="pestel-dropzone-sub">
                                                    Haz clic para examinar archivos locales en tu equipo
                                                </span>
                                            </div>
                                        </label>

                                        {archivoSeleccionado && (
                                            <div className="pestel-selected-file-preview">
                                                <div className="pestel-selected-file-info">
                                                    {tabTipoAdjunto === 'imagen' && archivoSeleccionado.previewUrl ? (
                                                        <img src={archivoSeleccionado.previewUrl} alt="Vista previa" className="pestel-img-thumb-preview" />
                                                    ) : (
                                                        <div className={`pestel-file-icon-box ${tabTipoAdjunto}`}>
                                                            {tabTipoAdjunto === 'pdf' && <FileText size={18} />}
                                                            {tabTipoAdjunto === 'hoja_calculo' && <FileSpreadsheet size={18} />}
                                                            {tabTipoAdjunto === 'imagen' && <Image size={18} />}
                                                        </div>
                                                    )}
                                                    <div className="pestel-file-meta-texts">
                                                        <input
                                                            type="text"
                                                            value={nombreArchivoInput}
                                                            onChange={(e) => setNombreArchivoInput(e.target.value)}
                                                            placeholder="Nombre visible de la evidencia"
                                                            className="pestel-rename-input"
                                                            title="Puedes editar el nombre antes de guardar"
                                                        />
                                                        <span className="pestel-file-raw-meta">
                                                            {archivoSeleccionado.nombre} • {archivoSeleccionado.tamano}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="pestel-modal-btn-submit"
                                                    onClick={guardarAdjuntoArchivo}
                                                >
                                                    <Plus size={13} />
                                                    <span>Adjuntar Archivo</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* LISTA DE EVIDENCIAS YA ASIGNADAS A ESTE FACTOR */}
                            <div className="pestel-modal-attached-section">
                                <div className="pestel-modal-attached-header">
                                    <span className="pestel-attached-title">
                                        Evidencias Registradas ({(modalAdjuntos.factorKey ? (datosPorter?.adjuntosPorFactor || {})[modalAdjuntos.factorKey] || [] : []).length})
                                    </span>
                                    <span className="pestel-attached-help">
                                        Respaldo empírico del factor para análisis de las 5 Fuerzas de Porter
                                    </span>
                                </div>

                                {(modalAdjuntos.factorKey ? (datosPorter?.adjuntosPorFactor || {})[modalAdjuntos.factorKey] || [] : []).length === 0 ? (
                                    <div className="pestel-modal-empty-attached">
                                        <Paperclip size={18} style={{ opacity: 0.35 }} />
                                        <p>No hay evidencia documental registrada para este factor todavía.</p>
                                        <span>Selecciona una pestaña arriba para subir PDFs, imágenes, planillas Excel/CSV o enlaces web externos.</span>
                                    </div>
                                ) : (
                                    <div className="pestel-attached-cards-grid">
                                        {(modalAdjuntos.factorKey ? (datosPorter?.adjuntosPorFactor || {})[modalAdjuntos.factorKey] || [] : []).map((adj) => (
                                            <div key={adj.id} className={`pestel-attached-card ${adj.tipo}`}>
                                                <div className="pestel-attached-card-left">
                                                    <div className={`pestel-attached-icon-wrap ${adj.tipo}`}>
                                                        {adj.tipo === 'pdf' && <FileText size={15} />}
                                                        {adj.tipo === 'imagen' && <Image size={15} />}
                                                        {adj.tipo === 'hoja_calculo' && <FileSpreadsheet size={15} />}
                                                        {adj.tipo === 'enlace' && <Link2 size={15} />}
                                                    </div>
                                                    <div className="pestel-attached-card-info">
                                                        <span className="pestel-attached-card-name" title={adj.nombre}>
                                                            {adj.nombre}
                                                        </span>
                                                        <div className="pestel-attached-card-sub">
                                                            <span className={`pestel-attached-type-tag ${adj.tipo}`}>
                                                                {adj.tipo === 'pdf' ? 'PDF' : adj.tipo === 'imagen' ? 'IMAGEN' : adj.tipo === 'hoja_calculo' ? 'PLANILLA' : 'ENLACE'}
                                                            </span>
                                                            <span className="pestel-attached-date">{adj.tamano} • {adj.fecha}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pestel-attached-card-actions">
                                                    {adj.url && (
                                                        <a
                                                            href={adj.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="pestel-btn-doc-action view"
                                                            title="Abrir / Ver archivo o enlace"
                                                        >
                                                            <ExternalLink size={12} />
                                                            <span>Abrir</span>
                                                        </a>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="pestel-btn-doc-action delete"
                                                        onClick={() => eliminarAdjunto(modalAdjuntos.factorKey, adj.id)}
                                                        title="Eliminar esta evidencia documental"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pestel-modal-footer">
                            <span className="pestel-modal-footer-hint">
                                Las evidencias respaldan la validez de los factores de las 5 Fuerzas de Porter ante la toma de decisiones.
                            </span>
                            <button
                                type="button"
                                className="pestel-modal-btn-done"
                                onClick={cerrarModalAdjuntos}
                            >
                                Listo
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

// ============================================================================
// SUB-COMPONENTE: TARJETA DE NODO DE FUERZA ESPACIOSA Y ORDENADA
// ============================================================================
function NodoFuerzaTarjeta({
    fuerza,
    posicion,
    data = {},
    adjuntosPorFactor = {},
    onAbrirModalAdjuntos,
    criteriosAbiertos,
    onToggleCriterios,

    onToggleCriterio,
    onAbrirModalNuevoFactor,
    onAbrirModalEditarFactor,
    onEliminarFactor,
    esCentro = false,
    tenazaMargen = false,
    tenazaVertical = false,
    tenazaDoble = false,
    esParteTenazaVertical = false,
    esParteTenazaHorizontal = false
}) {
    const Icono = fuerza.icono;
    const factoresList = data.factoresManuales || [];
    const criteriosActivos = data.criteriosActivos || {};
    const criteriosActivosCount = Object.values(criteriosActivos).filter(Boolean).length;

    let nivel = data.nivel;
    if (!nivel) {
        if (criteriosActivosCount >= 3) nivel = 'Alta';
        else if (criteriosActivosCount === 2) nivel = 'Media';
        else nivel = 'Baja';
    }

    const esFlancoTenazaActivo =
        (esParteTenazaVertical && (posicion === 'Norte' || posicion === 'Sur')) ||
        (esParteTenazaHorizontal && (posicion === 'Oeste' || posicion === 'Este'));

    return (
        <div
            className={`node-force-card ${posicion.toLowerCase()} ${esCentro ? 'core-rivalry' : ''} ${esCentro && tenazaDoble ? 'tenaza-doble-active' :
                    esCentro && tenazaVertical ? 'tenaza-vertical-active' :
                        esCentro && tenazaMargen ? 'tenaza-active' : ''
                } ${esFlancoTenazaActivo ? 'tenaza-flanco-active' : ''}`}
            style={{ '--accent-color': fuerza.color }}
        >
            {/* CINTAS DE EFECTO TENAZA EN EL NODO CENTRO */}
            {esCentro && (
                <div className="tenazas-stack">
                    {tenazaDoble ? (
                        <div className="tenaza-ribbon doble">
                            <Flame size={12} className="mr-1 inline-block" />
                            <span>Doble Tenaza Activa (Asedio Total en 4 Flancos)</span>
                        </div>
                    ) : (
                        <>
                            {tenazaMargen && (
                                <div className="tenaza-ribbon horizontal">
                                    <AlertTriangle size={12} className="mr-1 inline-block" />
                                    <span>Tenaza Horizontal (Margen): Proveedores ⇄ Clientes</span>
                                </div>
                            )}
                            {tenazaVertical && (
                                <div className="tenaza-ribbon vertical">
                                    <Zap size={12} className="mr-1 inline-block" />
                                    <span>Tenaza Vertical (Mercado): Nuevos Entrantes ⇕ Sustitutos</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* INDICADORES EN LOS FLANCOS NORTE Y SUR (TENAZA VERTICAL) */}
            {posicion === 'Norte' && esParteTenazaVertical && (
                <div className="flanco-tenaza-banner vertical-norte">
                    <ChevronDown size={12} className="tenaza-arrow-icon" />
                    <span>Tenaza Vertical · Presión Descendente (Entrantes)</span>
                </div>
            )}
            {posicion === 'Sur' && esParteTenazaVertical && (
                <div className="flanco-tenaza-banner vertical-sur">
                    <ChevronUp size={12} className="tenaza-arrow-icon" />
                    <span>Tenaza Vertical · Presión Ascendente (Sustitutos)</span>
                </div>
            )}

            {/* INDICADORES EN LOS FLANCOS OESTE Y ESTE (TENAZA HORIZONTAL) */}
            {posicion === 'Oeste' && esParteTenazaHorizontal && (
                <div className="flanco-tenaza-banner horizontal-oeste">
                    <ArrowRight size={12} className="tenaza-arrow-icon" />
                    <span>Tenaza de Margen · Empuje de Costos</span>
                </div>
            )}
            {posicion === 'Este' && esParteTenazaHorizontal && (
                <div className="flanco-tenaza-banner horizontal-este">
                    <MoveLeft size={12} className="tenaza-arrow-icon" />
                    <span>Tenaza de Margen · Contracción de Precios</span>
                </div>
            )}

            {/* 1. CABECERA: AVATAR, POSICIÓN CARDINAL, TÍTULO ÚNICO Y POAM BADGE */}
            <div className="card-top-head">
                <div className="card-title-group">
                    <div
                        className="force-avatar"
                        style={{ backgroundColor: `rgba(${fuerza.colorRgb}, 0.15)`, color: fuerza.color }}
                    >
                        <Icono size={18} />
                    </div>
                    <div className="card-title-texts">
                        <div className="card-pre-header">
                            <span className="card-cardinal-pill">{posicion}</span>
                        </div>
                        <h3 className="card-force-title">{fuerza.tituloCorto}</h3>
                    </div>
                </div>
            </div>

            {/* 3. DESCRIPCIÓN CONTEXTUAL */}
            <div className="card-force-desc-box">
                <p className="card-force-desc">
                    {data.descripcion || fuerza.descripcion}
                </p>
            </div>

            {/* 2. SELECTOR SEGMENTADO DE PRESIÓN (BAJA / MEDIA / ALTA) */}
            <div className="card-level-block">
                <div className="card-level-meta">
                    <span className="level-block-title">Nivel de Presión:</span>
                </div>
                <div className="segmented-dial-grid">
                    {['Baja', 'Media', 'Alta'].map(lvl => (
                        <div
                            key={lvl}
                            className={`btn-dial-item dial-item ${lvl.toLowerCase()} btn-dial-${lvl.toLowerCase()} ${nivel === lvl ? 'active' : ''}`}
                            style={{ cursor: 'default', pointerEvents: 'none' }}
                        >
                            {lvl}
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. FACTORES REGISTRADOS (CON CREAR / EDITAR) */}
            <div className="card-evidences-section">
                <div className="card-evidences-header">
                    <span className="sec-label">Factores ({factoresList.length}):</span>
                    <button
                        type="button"
                        className="pestel-btn-add-factor-pill"
                        onClick={onAbrirModalNuevoFactor}
                        title={`Añadir factor a ${fuerza.tituloCorto}`}
                    >
                        <Plus size={11} />
                        <span>Añadir Factor</span>
                    </button>
                </div>

                {factoresList.length === 0 ? (
                    <div className="empty-factors-placeholder" style={{ textAlign: 'center', padding: '10px 8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        No hay factores registrados.
                    </div>
                ) : (
                    <div className="chips-wrapper">
                        {factoresList.map((item, idx) => {
                            const isObj = typeof item === 'object' && item !== null;
                            const factorTexto = isObj ? item.texto : item;
                            const factorTipo = isObj && item.tipo ? item.tipo : 'Amenaza';
                            const factorKey = isObj && item.id ? item.id : `porter-${fuerza.id}-${idx}`;
                            const adjuntosFactor = adjuntosPorFactor[factorKey] || [];
                            const numAdjuntos = adjuntosFactor.length;
                            const esOp = factorTipo === 'Oportunidad';
                            return (
                                <div
                                    key={factorKey || idx}
                                    className={`porter-factor-card ${esOp ? 'tipo-op' : 'tipo-am'}`}
                                >
                                    <div className="porter-factor-card-header">
                                        <span className={`pestel-factor-tipo-pill ${esOp ? 'pill-op' : 'pill-am'}`}>
                                            <span className={`pestel-tipo-dot ${esOp ? 'op' : 'am'}`} />
                                            {esOp ? 'Oportunidad' : 'Amenaza'}
                                        </span>
                                        <div className="porter-chip-actions pestel-chip-actions">
                                            <button
                                                type="button"
                                                className="pestel-btn-card-action edit"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAbrirModalEditarFactor(idx, item);
                                                }}
                                                title="Editar factor"
                                            >
                                                <Pencil size={11} />
                                            </button>
                                            <button
                                                type="button"
                                                className={`pestel-btn-card-action attach ${numAdjuntos > 0 ? 'has-attachments' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onAbrirModalAdjuntos) {
                                                        onAbrirModalAdjuntos(factorKey, factorTexto, fuerza.tituloCorto || fuerza.nombre);
                                                    }
                                                }}
                                                title={numAdjuntos > 0 ? `${numAdjuntos} evidencias documentales adjuntas` : "Adjuntar evidencia documental"}
                                            >
                                                <Paperclip size={11} />
                                                {numAdjuntos > 0 && <span className="pestel-attach-count">{numAdjuntos}</span>}
                                            </button>
                                            <button
                                                type="button"
                                                className="pestel-btn-card-action delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEliminarFactor(idx);
                                                }}
                                                title="Eliminar factor"
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="porter-factor-card-body">
                                        <p className="porter-factor-card-text">{factorTexto}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 5. CRITERIOS DE RIESGO TEÓRICOS */}
            <div className="card-criteria-section">
                <button
                    type="button"
                    className={`btn-criteria-accordion criteria-accordion-btn ${criteriosAbiertos ? 'is-open' : ''}`}
                    onClick={onToggleCriterios}
                >
                    <span>Criterios de Riesgo ({criteriosActivosCount}/4)</span>
                    {criteriosAbiertos ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {criteriosAbiertos && (
                    <div className="criteria-list-box">
                        {fuerza.criterios.map(crit => {
                            const marcado = !!criteriosActivos[crit.id];
                            return (
                                <label
                                    key={crit.id}
                                    className={`crit-checkbox-row ${marcado ? 'checked' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onToggleCriterio(crit.id);
                                    }}
                                >
                                    <div className="check-box-icon">
                                        {marcado ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Circle size={15} className="text-gray-600" />}
                                    </div>
                                    <span className="crit-label-text">{crit.label}</span>
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
