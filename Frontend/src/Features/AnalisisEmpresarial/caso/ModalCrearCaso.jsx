/** Formulario para crear o editar un caso de análisis empresarial (datos, contexto, herramientas y hechos clave). */
import { useState, useEffect } from 'react';
import {
  Star,
  X,
  Plus,
  Trash2,
  Edit,
  UploadCloud,
  FileUp,
  Loader2,
  FileCheck,
  Clipboard
} from 'lucide-react';
import { alerta } from '../../../utils/Notificaciones';
import { TODAS_LAS_HERRAMIENTAS, herramientasClasicas, herramientasDelCaso, normalizarHerramientas } from './herramientasCaso';
import { limpiarYReconstruirTexto, PLANTILLA_CONTEXTO_CASO } from './textoContextoCaso';
import { htmlATexto, sanitizarHtml, textoAHtml } from './contextoRico';
import SelectorHerramientasCaso from './SelectorHerramientasCaso';
import EditorTextoRico from './EditorTextoRico';
import ModalConfirmarEliminacion from '../compartido/modales/ModalConfirmarEliminacion';
import api from '../../../services/api';

export default function ModalCrearCaso({ casoAEditar, onClose, onSuccess, categoriasDisponibles = [], onAgregarCategoria }) {
  const IMAGEN_DEFAULT_CASO = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';

  const imagenesPorCategoria = {
    'Gastronomía & Retail': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    'Tecnología & SaaS': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    'Manufactura & Logística': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    'Salud & Energía': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
  };

  const listaCategorias = (categoriasDisponibles && categoriasDisponibles.length > 0)
    ? categoriasDisponibles
    : ['Gastronomía & Retail', 'Tecnología & SaaS', 'Manufactura & Logística', 'Salud & Energía'];

  const categoriaInicial = casoAEditar?.categoria || listaCategorias[0] || 'Gastronomía & Retail';

  const [formData, setFormData] = useState({
    titulo: '', categoria: categoriaInicial, tag: '', dificultad: 'Media', capital: '',
    descripcion: '', 
    instrucciones: '',
    foco: '', 
    imagen: casoAEditar?.imagen || imagenesPorCategoria[categoriaInicial] || IMAGEN_DEFAULT_CASO,
    horizonteTiempo: 'Plan Operativo Anual'
  });
  
  const [modoCrearCat, setModoCrearCat] = useState(false);
  const [nuevaCatModal, setNuevaCatModal] = useState('');
  
  const [ideas, setIdeas] = useState(() => {
    if (casoAEditar?.detalles?.ideasLluvia && casoAEditar.detalles.ideasLluvia.length > 0) {
      return casoAEditar.detalles.ideasLluvia;
    }
    return [];
  }); 

  // Configuración de diagnóstico empresarial: 'todas' o 'personalizado'
  const [modoHerramientas, setModoHerramientas] = useState(() => (
    casoAEditar && herramientasDelCaso(casoAEditar).length < TODAS_LAS_HERRAMIENTAS.length ? 'personalizado' : 'todas'
  ));

  const [herramientasSeleccionadas, setHerramientasSeleccionadas] = useState(() => (casoAEditar ? herramientasDelCaso(casoAEditar) : [...TODAS_LAS_HERRAMIENTAS]));
  
  const [loading, setLoading] = useState(false);
  const [pasoActual, setPasoActual] = useState(1);
  const [modoContexto, setModoContexto] = useState('documento'); // 'documento' | 'manual'
  const [confirmarLimpiar, setConfirmarLimpiar] = useState(false);
  const [contextoHtml, setContextoHtml] = useState(() => casoAEditar?.detalles?.contextoHtml || '');
  const [versionEditor, setVersionEditor] = useState(0);
  const [subiendoDoc, setSubiendoDoc] = useState(false);
  const [progresoSubida, setProgresoSubida] = useState(0);
  const [nombreArchivoSubiendo, setNombreArchivoSubiendo] = useState('');
  const [infoDocExtraido, setInfoDocExtraido] = useState(null);
  const [isDragOverDoc, setIsDragOverDoc] = useState(false);

  useEffect(() => {
    if (casoAEditar) {
      const contextoExistente = casoAEditar.descripcion || casoAEditar.contexto || casoAEditar.detalles?.contexto || casoAEditar.detalles?.enunciadoCompleto || '';
      setContextoHtml(casoAEditar.detalles?.contextoHtml || '');
      setVersionEditor(v => v + 1);
      const instruccionesExistentes = casoAEditar.instrucciones || casoAEditar.detalles?.instrucciones || casoAEditar.foco || '';
      const docExistente = casoAEditar.detalles?.archivoDocumento || casoAEditar.archivoDocumento || null;

      if (docExistente) {
        setInfoDocExtraido(docExistente);
        setModoContexto('documento');
      } else if (contextoExistente) {
        setModoContexto('manual');
      }

      setFormData({
        titulo: casoAEditar.titulo || '',
        categoria: casoAEditar.categoria || 'Gastronomía & Retail',
        tag: casoAEditar.tag || '',
        dificultad: casoAEditar.dificultad || 'Media',
        capital: casoAEditar.capital || '',
        descripcion: contextoExistente,
        archivoDocumento: docExistente,
        instrucciones: instruccionesExistentes || '',
        foco: instruccionesExistentes || '',
        imagen: casoAEditar.imagen || imagenesPorCategoria['Gastronomía & Retail'],
        horizonteTiempo: casoAEditar.detalles?.horizonteTiempo || 'Plan Operativo Anual'
      });
      if (casoAEditar.detalles?.ideasLluvia && casoAEditar.detalles.ideasLluvia.length > 0) {
        setIdeas(casoAEditar.detalles.ideasLluvia);
      } else {
        setIdeas([]);
      }

      const habilitadas = herramientasDelCaso(casoAEditar);
      setModoHerramientas(habilitadas.length < TODAS_LAS_HERRAMIENTAS.length ? 'personalizado' : 'todas');
      setHerramientasSeleccionadas(habilitadas);
    }
  }, [casoAEditar]);

  const handleIdeaChange = (index, key, value) => {
    const nuevasIdeas = [...ideas];
    nuevasIdeas[index][key] = value;
    setIdeas(nuevasIdeas);
  };

  const agregarIdea = () => setIdeas([...ideas, { texto: '', ambito: 'Interno', categoria: 'Operaciones' }]);
  const eliminarIdea = (index) => {
    setIdeas(ideas.filter((_, i) => i !== index));
  };

  const procesarArchivoDocumento = async (file) => {
    if (!file) return;

    const nombre = file.name || '';
    const extension = nombre.slice(nombre.lastIndexOf('.')).toLowerCase();
    const extensionesPermitidas = ['.pdf', '.docx', '.doc', '.txt', '.md'];

    if (!extensionesPermitidas.includes(extension)) {
      alerta.advertencia(
        "Formato No Soportado",
        `El formato "${extension || 'desconocido'}" no es compatible. Por favor sube un documento PDF (.pdf), Word (.docx) o Texto (.txt).`
      );
      return;
    }

    setSubiendoDoc(true);
    setProgresoSubida(0);
    setNombreArchivoSubiendo(nombre);

    try {
      const res = await api.subirDocumentoCaso(file, (porcentaje) => {
        setProgresoSubida(porcentaje);
      });

      if (!res || !res.url) {
        throw new Error("No se recibió respuesta válida del servidor.");
      }

      setProgresoSubida(100);

      const docInfo = {
        nombre: res.nombre_archivo || nombre,
        archivo_guardado: res.archivo_guardado,
        url: res.url,
        extension: res.extension || extension,
        tamano_bytes: res.tamano_bytes || file.size
      };

      setInfoDocExtraido(docInfo);
      setFormData(prev => ({
        ...prev,
        archivoDocumento: docInfo,
        descripcion: (prev.descripcion && prev.descripcion.trim().length > 10 && !prev.descripcion.toLowerCase().startsWith('documento del caso:'))
          ? prev.descripcion
          : ''
      }));

      alerta.exito(
        "¡Documento Subido!",
        `"${docInfo.nombre}" se subió exitosamente. Estará disponible en la Fase 1 (Contexto).`
      );
    } catch (error) {
      console.error("Error al subir documento:", error);
      alerta.error(
        "Error al Subir",
        error.message || "No se pudo subir el archivo. Verifica tu conexión e inténtalo de nuevo."
      );
    } finally {
      setTimeout(() => {
        setSubiendoDoc(false);
      }, 500);
    }
  };

  // Pegar directamente desde portapapeles con limpieza automática
  // Reemplaza el contexto desde fuera del editor (pegar, limpiar, plantilla): se remonta con el nuevo contenido.
  const aplicarContextoTexto = (texto) => {
    setFormData(prev => ({ ...prev, descripcion: texto }));
    setContextoHtml(textoAHtml(texto));
    setVersionEditor(v => v + 1);
  };

  const pegarDesdePortapapeles = async () => {
    try {
      if (!navigator?.clipboard?.readText) {
        alerta.info("Pegar Texto", "Usa Ctrl + V para pegar tu texto directamente en el área de texto.");
        return;
      }
      const clipText = await navigator.clipboard.readText();
      if (!clipText || !clipText.trim()) {
        alerta.advertencia("Portapapeles Vacío", "No se detectó texto en el portapapeles. Copia el texto y presiona este botón.");
        return;
      }
      const textoFormateado = limpiarYReconstruirTexto(clipText);
      const palabras = textoFormateado.split(/\s+/).filter(Boolean).length;
      
      aplicarContextoTexto(formData.descripcion && formData.descripcion.trim().length > 10
        ? `${formData.descripcion.trim()}\n\n${textoFormateado}`
        : textoFormateado);
      setInfoDocExtraido(null);
      alerta.exito("Texto Pegado", `Se pegaron ${palabras} palabras con formato de párrafos optimizado.`);
    } catch {
      alerta.info("Pegar Texto", "Permite el acceso al portapapeles o usa Ctrl + V para pegar directamente.");
    }
  };

  // Limpiar todo el texto del contexto
  const limpiarTodoElTexto = () => {
    if (!formData.descripcion || !formData.descripcion.trim()) {
      aplicarContextoTexto('');
      setInfoDocExtraido(null);
      return;
    }
    setConfirmarLimpiar(true);
  };
  const confirmarLimpiarTexto = () => {
    setConfirmarLimpiar(false);
    aplicarContextoTexto('');
    setInfoDocExtraido(null);
    alerta.info("Texto Limpiado", "El área de contexto se ha limpiado por completo.");
  };

  // Cargar plantilla general estructurada para rellenar
  const cargarPlantillaGeneral = () => {
    if (formData.descripcion && formData.descripcion.trim().length > 20) {
      if (!window.confirm("¿Deseas reemplazar el texto actual con la plantilla general para rellenar?")) {
        return;
      }
    }
    aplicarContextoTexto(PLANTILLA_CONTEXTO_CASO);
    setInfoDocExtraido(null);
    alerta.exito("Plantilla Aplicada", "Se insertó la estructura general para rellenar.");
  };

  const validarPaso1 = () => {
    if (!formData.titulo || !formData.titulo.trim()) {
      alerta.advertencia("Título Requerido", "Debes ingresar el título del caso en Datos Generales.");
      return false;
    }
    if (!formData.capital || !formData.capital.trim()) {
      alerta.advertencia("Presupuesto Requerido", "Debes ingresar el presupuesto / capital en Datos Generales.");
      return false;
    }
    if (!formData.categoria || !formData.categoria.trim()) {
      alerta.advertencia("Categoría Requerida", "Debes seleccionar una categoría en Datos Generales.");
      return false;
    }
    return true;
  };

  const validarPaso2 = () => {
    if ((!formData.instrucciones || !formData.instrucciones.trim()) && (!formData.foco || !formData.foco.trim())) {
      alerta.advertencia("Instrucciones Requeridas", "Debes ingresar las instrucciones del caso en Instrucciones y Contexto.");
      return false;
    }
    if (modoContexto === 'documento') {
      if (!formData.archivoDocumento && !infoDocExtraido) {
        alerta.advertencia("Documento Requerido", "Debes seleccionar y subir un documento PDF o Word (.docx) para el caso.");
        return false;
      }
    } else {
      if (!formData.descripcion || !formData.descripcion.trim()) {
        alerta.advertencia("Contexto Requerido", "Debes redactar o pegar el contexto del caso.");
        return false;
      }
    }
    return true;
  };

  const validarPaso3 = () => {
    if (modoHerramientas === 'personalizado' && herramientasSeleccionadas.length === 0) {
      alerta.advertencia("Herramientas Requeridas", "Debes seleccionar al menos una herramienta para el Diagnóstico Empresarial.");
      return false;
    }
    return true;
  };

  const validarFormularioCompleto = () => {
    if (!validarPaso1()) {
      setPasoActual(1);
      return false;
    }
    if (!validarPaso2()) {
      setPasoActual(2);
      return false;
    }
    if (!validarPaso3()) {
      setPasoActual(3);
      return false;
    }
    return true;
  };

  const cambiarPaso = (nuevoPaso) => {
    if (nuevoPaso === pasoActual) return;
    setPasoActual(nuevoPaso);
  };

  const ejecutarGuardar = async (ideasAEnviar = ideas) => {
    if (!validarFormularioCompleto()) return;

    const ideasFiltradas = (ideasAEnviar || []).filter(i => i && i.texto && i.texto.trim() !== '');
    const archivoDoc = formData.archivoDocumento || (infoDocExtraido?.url ? infoDocExtraido : null);
    const textoContexto = modoContexto === 'documento'
      ? ''
      : (formData.descripcion?.toLowerCase().startsWith('documento del caso:') ? '' : (formData.descripcion || ''));
    const textoInstrucciones = (formData.instrucciones || formData.foco || '').trim() || 'Lee atentamente el contexto y la situación de la empresa a continuación. Al finalizar tu lectura, pulsa el botón "Continuar lluvia de ideas(fase 2)" para comenzar a identificar y clasificar las evidencias y hechos clave.';

    const herramientasFases = modoHerramientas === 'todas' ? [...TODAS_LAS_HERRAMIENTAS] : normalizarHerramientas(herramientasSeleccionadas);
    const herramientasFinales = herramientasClasicas(herramientasFases);

    setLoading(true);
    try {
      const payload = {
        ...formData,
        archivoDocumento: archivoDoc,
        instrucciones: textoInstrucciones,
        foco: textoInstrucciones,
        contexto: textoContexto,
        descripcion: textoContexto,
        estrellas: formData.dificultad === 'Alta' ? 3 : (formData.dificultad === 'Media' ? 2 : 1),
        modoHerramientas: modoHerramientas,
        herramientasDiagnostico: herramientasFinales,
        detalles: {
           sector: formData.categoria,
           etapa: 'Evaluación y Diagnóstico Estratégico',
           horizonteTiempo: formData.horizonteTiempo,
           antecedentes: textoContexto,
           contexto: textoContexto,
           enunciadoCompleto: textoContexto,
           contextoHtml: modoContexto === 'manual' && textoContexto && contextoHtml.trim() ? sanitizarHtml(contextoHtml) : '',
           archivoDocumento: archivoDoc,
           desafioPrincipal: textoInstrucciones,
           instrucciones: textoInstrucciones,
           fraseDestacada: '',
           misionOficial: '',
           imagen: formData.imagen,
           ideasLluvia: ideasFiltradas,
           fasesObligatorias: [1, 2],
           modoHerramientas: modoHerramientas,
           herramientasDiagnostico: herramientasFinales,
           herramientasFases,
           puntosCriticosAuditoria: [],
           preguntasReflexion: []
        }
      };

      if (casoAEditar) {
        await api.editarCasoEmpresarial(casoAEditar.id.toString().replace('db-', ''), payload);
        alerta.exito("Éxito", "Caso de estudio actualizado exitosamente");
      } else {
        await api.crearCasoEmpresarial(payload);
        alerta.exito("Éxito", "Caso de estudio creado y guardado exitosamente");
      }
      
      if (onSuccess) onSuccess();
      else onClose();
    } catch (error) {
      console.error(error);
      alerta.error("Error", error.message || (casoAEditar ? "Error al actualizar el caso" : "Error al crear el caso"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (pasoActual === 1) {
      setPasoActual(2);
      return;
    }

    if (pasoActual === 2) {
      setPasoActual(3);
      return;
    }

    if (pasoActual === 3) {
      setPasoActual(4);
      return;
    }

    if (!validarFormularioCompleto()) return;

    await ejecutarGuardar(ideas);
  };


  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '14px', maxWidth: '720px', width: '100%', padding: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={18} />
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>{casoAEditar ? 'Editar Caso de Estudio' : 'Crear Nuevo Caso de Estudio'}</h3>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* INDICADOR DE PASOS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '0 10px' }}>
            {[
              { num: 1, label: 'Datos Generales' },
              { num: 2, label: 'Instrucciones y Contexto' },
              { num: 3, label: 'Fases y Diagnóstico' },
              { num: 4, label: 'Hechos Auditados (Opcional)' }
            ].map(paso => (
              <div 
                key={paso.num} 
                onClick={() => cambiarPaso(paso.num)}
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  opacity: pasoActual === paso.num ? 1 : 0.5,
                  transition: 'opacity 0.2s'
                }}
              >
                <div style={{ 
                  width: '28px', height: '28px', borderRadius: '50%', 
                  backgroundColor: pasoActual === paso.num ? 'var(--primary-color)' : 'var(--bg-input)',
                  color: pasoActual === paso.num ? '#fff' : 'var(--text-muted)',
                  border: pasoActual === paso.num ? 'none' : '1px solid var(--border-color)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px'
                }}>
                  {paso.num}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-main)', fontWeight: pasoActual === paso.num ? '600' : '400' }}>
                  {paso.label}
                </span>
              </div>
            ))}
          </div>

          {/* PASO 1: DATOS GENERALES */}
          {pasoActual === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', backgroundColor: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--primary-color)', fontWeight: '600' }}>Información General</h4>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>Título del Caso <span style={{ color: '#ef4444' }}>*</span></label>
                  <input required type="text" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.9rem' }} placeholder="Ej: Café Tunari en Crisis" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>Presupuesto / Capital <span style={{ color: '#ef4444' }}>*</span></label>
                    <input required type="text" value={formData.capital} onChange={e => setFormData({...formData, capital: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.9rem' }} placeholder="Ej: $50,000 USD" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>Dificultad <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '38px', padding: '0 8px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      {[
                        { label: 'Principiante', value: 1 },
                        { label: 'Media', value: 2 },
                        { label: 'Alta', value: 3 }
                      ].map((nivel) => {
                        const isSelected = 
                          (formData.dificultad === 'Principiante' && nivel.value === 1) ||
                          (formData.dificultad === 'Media' && nivel.value <= 2) ||
                          (formData.dificultad === 'Alta' && nivel.value <= 3);
                        
                        return (
                          <button
                            key={nivel.label}
                            type="button"
                            onClick={() => setFormData({...formData, dificultad: nivel.label})}
                            title={nivel.label}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                              color: isSelected ? '#fbbf24' : 'var(--border-color)',
                              transition: 'color 0.2s', display: 'flex'
                            }}
                          >
                            <Star size={18} fill={isSelected ? '#fbbf24' : 'none'} />
                          </button>
                        );
                      })}
                      <span style={{ marginLeft: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                        {formData.dificultad}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', backgroundColor: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--primary-color)', fontWeight: '600' }}>Categoría y Diseño</h4>
                
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                      Selecciona una Categoría / Campo <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    {!modoCrearCat && (
                      <button
                        type="button"
                        onClick={() => setModoCrearCat(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}
                      >
                        <Plus size={13} /> Adicionar Campo
                      </button>
                    )}
                  </div>

                  {modoCrearCat && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '10px' }}>
                      <input
                        type="text"
                        autoFocus
                        placeholder="Nombre del nuevo campo o categoría..."
                        value={nuevaCatModal}
                        onChange={(e) => setNuevaCatModal(e.target.value)}
                        style={{ flex: 1, padding: '7px 10px', borderRadius: '6px', border: '1px solid var(--primary-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.8rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const catLimpia = nuevaCatModal.trim();
                          if (catLimpia) {
                            if (onAgregarCategoria) onAgregarCategoria(catLimpia);
                            setFormData(prev => ({ ...prev, categoria: catLimpia }));
                            setNuevaCatModal('');
                            setModoCrearCat(false);
                          }
                        }}
                        className="modal-standard-btn-confirm"
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => { setModoCrearCat(false); setNuevaCatModal(''); }}
                        className="modal-standard-btn-cancel"
                        style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                      >
                        Cancelar
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {listaCategorias.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          const esImagenDefault = Object.values(imagenesPorCategoria).includes(formData.imagen) || !formData.imagen || formData.imagen === IMAGEN_DEFAULT_CASO;
                          setFormData(prev => ({
                            ...prev, 
                            categoria: cat,
                            imagen: esImagenDefault ? (imagenesPorCategoria[cat] || IMAGEN_DEFAULT_CASO) : prev.imagen
                          }))
                        }}
                        style={{
                          padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer',
                          border: formData.categoria === cat ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                          backgroundColor: formData.categoria === cat ? 'var(--primary-color)' : 'var(--bg-card)',
                          color: formData.categoria === cat ? 'white' : 'var(--text-main)',
                          fontWeight: formData.categoria === cat ? '600' : '400',
                          transition: 'all 0.2s'
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>Imagen de Portada</label>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '110px', height: '70px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '2px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
                      <img 
                        src={formData.imagen} 
                        alt="Vista previa" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/130x80?text=Sin+Imagen' }} 
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 16px', backgroundColor: 'var(--bg-card)', border: '1px dashed var(--primary-color)', color: 'var(--primary-color)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(37,99,235,0.05)'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}>
                        Elegir Archivo desde PC
                        <input 
                          type="file" 
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={e => {
                            const file = e.target.files[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData({...formData, imagen: reader.result});
                              };
                              reader.readAsDataURL(file);
                            }
                          }} 
                        />
                      </label>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>O simplemente selecciona una categoría para usar su imagen sugerida.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: INSTRUCCIONES Y CONTEXTO */}
          {pasoActual === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', backgroundColor: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-color)', animation: 'fadeIn 0.3s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--primary-color)', fontWeight: '600' }}>Instrucciones y Contexto del Caso</h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '3px 10px', borderRadius: '20px', border: '1px solid var(--border-color)', fontWeight: 600 }}>
                  Paso 2 de 4
                </span>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500' }}>Instrucciones <span style={{ color: '#ef4444' }}>*</span></label>
                <textarea 
                  required 
                  rows="3" 
                  value={formData.instrucciones} 
                  onChange={e => setFormData({...formData, instrucciones: e.target.value, foco: e.target.value})} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.9rem', resize: 'vertical' }} 
                  placeholder="Ingresa las instrucciones para este caso..." 
                />
              </div>

              {/* SELECTOR DE 2 OPCIONES: SUBIR DOCUMENTO O ESCRIBIR A MANO */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                  ¿Cómo deseas definir el Contexto de este caso? <span style={{ color: '#ef4444' }}>*</span>
                </label>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  {/* OPCIÓN 1: SUBIR DOCUMENTO */}
                  <div
                    onClick={() => setModoContexto('documento')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: modoContexto === 'documento' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      backgroundColor: modoContexto === 'documento' ? 'rgba(37,99,235,0.06)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: modoContexto === 'documento' ? '0 0 0 1px var(--primary-color)' : 'none'
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: modoContexto === 'documento' ? 'var(--primary-color)' : 'var(--bg-input)',
                      color: modoContexto === 'documento' ? '#fff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <UploadCloud size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: modoContexto === 'documento' ? 'var(--primary-color)' : 'var(--text-main)' }}>
                        Opción 1: Subir Documento
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Subir archivo PDF o Word (.docx) del caso
                      </div>
                    </div>
                  </div>

                  {/* OPCIÓN 2: ESCRIBIR A MANO */}
                  <div
                    onClick={() => {
                      setModoContexto('manual');
                      if (!casoAEditar && (!formData.descripcion || !formData.descripcion.trim())) {
                        aplicarContextoTexto(PLANTILLA_CONTEXTO_CASO);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: modoContexto === 'manual' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      backgroundColor: modoContexto === 'manual' ? 'rgba(37,99,235,0.06)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: modoContexto === 'manual' ? '0 0 0 1px var(--primary-color)' : 'none'
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: modoContexto === 'manual' ? 'var(--primary-color)' : 'var(--bg-input)',
                      color: modoContexto === 'manual' ? '#fff' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Edit size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: modoContexto === 'manual' ? 'var(--primary-color)' : 'var(--text-main)' }}>
                        Opción 2: Escribir a Mano
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Redactar libremente o pegar texto directo
                      </div>
                    </div>
                  </div>
                </div>

                {/* VISTA SEGÚN LA OPCIÓN SELECCIONADA */}
                {modoContexto === 'documento' ? (
                  /* =======================================================
                     MODO 1: SUBIR DOCUMENTO (SIN EXTRACCIÓN DE TEXTO)
                     ======================================================= */
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileUp size={18} style={{ color: 'var(--primary-color)' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          Sube el documento del caso (.pdf, .docx, .txt)
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)' }}>PDF</span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.25)' }}>DOCX</span>
                        <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' }}>TXT</span>
                      </div>
                    </div>

                    {/* DROPZONE DE CARGA Y BARRA DE PROGRESO */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragOverDoc(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setIsDragOverDoc(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOverDoc(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          procesarArchivoDocumento(e.dataTransfer.files[0]);
                        }
                      }}
                      style={{
                        border: isDragOverDoc ? '2px dashed var(--primary-color)' : '1px dashed var(--border-color)',
                        backgroundColor: isDragOverDoc ? 'rgba(37,99,235,0.06)' : 'var(--bg-input)',
                        borderRadius: '8px',
                        padding: subiendoDoc ? '20px 18px' : '22px 16px',
                        textAlign: 'center',
                        cursor: subiendoDoc ? 'wait' : 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                    >
                      <input
                        type="file"
                        id="doc-contexto-input"
                        accept=".pdf,.docx,.doc,.txt,.md"
                        disabled={subiendoDoc}
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            procesarArchivoDocumento(e.target.files[0]);
                            e.target.value = '';
                          }
                        }}
                      />

                      {subiendoDoc ? (
                        /* BARRA DE PROGRESO DINÁMICA DE SUBIDA */
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Loader2 size={18} style={{ color: 'var(--primary-color)', animation: 'spin 1s linear infinite' }} />
                              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                Subiendo {nombreArchivoSubiendo || 'documento'}...
                              </span>
                            </div>
                            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                              {progresoSubida}%
                            </span>
                          </div>

                          {/* TRACK Y RELLENO ANIMADO */}
                          <div style={{
                            width: '100%',
                            height: '10px',
                            backgroundColor: 'var(--bg-card)',
                            borderRadius: '5px',
                            overflow: 'hidden',
                            border: '1px solid var(--border-color)',
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.08)'
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${progresoSubida}%`,
                              background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 50%, #10b981 100%)',
                              borderRadius: '5px',
                              transition: 'width 0.2s ease-out'
                            }} />
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            <span>Guardando archivo en el servidor</span>
                            <span>{progresoSubida >= 100 ? '¡Subida completada!' : 'Por favor espera...'}</span>
                          </div>
                        </div>
                      ) : (
                        <label htmlFor="doc-contexto-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                            <UploadCloud size={24} />
                          </div>
                          <div>
                            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--primary-color)' }}>
                              Haz clic aquí para seleccionar tu archivo
                            </span>
                            <span style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}> o arrástralo a esta zona</span>
                          </div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                            Admite documentos PDF (.pdf) y Word (.docx) • No altera ni extrae texto
                          </span>
                        </label>
                      )}
                    </div>

                    {/* FICHA DEL ARCHIVO SUBIDO */}
                    {(infoDocExtraido || formData.archivoDocumento) && !subiendoDoc && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '8px',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#10b981',
                            flexShrink: 0
                          }}>
                            <FileCheck size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                              {infoDocExtraido?.nombre || infoDocExtraido?.nombre_archivo || formData.archivoDocumento?.nombre || 'Documento del caso'}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                              {(infoDocExtraido?.tamano_bytes || formData.archivoDocumento?.tamano_bytes) ? `${(((infoDocExtraido?.tamano_bytes || formData.archivoDocumento?.tamano_bytes) / 1024)).toFixed(1)} KB • ` : ''}
                              Documento subido con éxito • Se mostrará íntegro en la <strong>Fase 1 (Contexto)</strong>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <label
                            htmlFor="doc-contexto-input"
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--primary-color)',
                              cursor: 'pointer',
                              fontWeight: 600,
                              textDecoration: 'underline'
                            }}
                          >
                            Cambiar documento
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, archivoDocumento: null, descripcion: '' }));
                              setInfoDocExtraido(null);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 6px'
                            }}
                            title="Quitar documento actual"
                          >
                            <Trash2 size={13} />
                            Quitar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* =======================================================
                     MODO 2: ESCRIBIR A MANO EL CONTEXTO
                     ======================================================= */
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Edit size={16} style={{ color: 'var(--primary-color)' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          Redacción Manual del Contexto del Caso <span style={{ color: '#ef4444' }}>*</span>
                        </span>
                      </div>

                      {/* HERRAMIENTAS RÁPIDAS PARA ESCRIBIR A MANO */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={pegarDesdePortapapeles}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            background: 'var(--bg-input)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          title="Pegar texto desde el portapapeles y limpiarlo"
                        >
                          <Clipboard size={13} style={{ color: 'var(--primary-color)' }} />
                          <span>Pegar</span>
                        </button>

                        <button
                          type="button"
                          onClick={limpiarTodoElTexto}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            background: 'var(--bg-input)',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.35)',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          title="Limpiar todo el texto del contexto"
                        >
                          <Trash2 size={13} />
                          <span>Limpiar</span>
                        </button>
                      </div>
                    </div>

                    <ModalConfirmarEliminacion abierto={confirmarLimpiar} titulo="Limpiar el contexto" mensaje="Se borrará todo el texto y el formato del contexto del caso."
                      perdidas={['El texto redactado o pegado', 'El formato aplicado (títulos, listas, enlaces)']} textoConfirmar="Limpiar todo" onConfirmar={confirmarLimpiarTexto} onCerrar={() => setConfirmarLimpiar(false)}/>
                    <EditorTextoRico
                      key={versionEditor}
                      valorInicial={contextoHtml || textoAHtml(formData.descripcion)}
                      onChange={(html) => { setContextoHtml(html); setFormData(prev => ({ ...prev, descripcion: htmlATexto(html) })); }}
                      placeholder="Escribe aquí el contexto del caso o usa la plantilla guía: antecedentes y perfil de la empresa, situación actual y entorno, problemática central y reto estratégico."
                      minAlto={300}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                      <span/>
                      {(!formData.descripcion || formData.descripcion.trim().length === 0) && (
                        <button
                          type="button"
                          onClick={cargarPlantillaGeneral}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary-color)',
                            fontSize: '0.74rem',
                            cursor: 'pointer',
                            padding: 0,
                            fontWeight: 600,
                            textDecoration: 'underline'
                          }}
                        >
                          Cargar plantilla general para rellenar
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Este contexto se guardará y se desplegará de forma íntegra y ordenada en la <strong>Fase 1: Contexto</strong>.
                </p>
              </div>
            </div>
          )}

          {/* PASO 3: CONFIGURACIÓN DE FASES Y DIAGNÓSTICO EMPRESARIAL */}
          {pasoActual === 3 && (
            <SelectorHerramientasCaso modo={modoHerramientas} onModo={setModoHerramientas} seleccionadas={herramientasSeleccionadas} onSeleccionadas={setHerramientasSeleccionadas}/>
          )}

          {/* PASO 4: HECHOS CLAVE PARA SIMULADOR */}
          {pasoActual === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', backgroundColor: 'var(--bg-input)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--primary-color)', fontWeight: '600' }}>
                    Hechos Auditados <span style={{ fontSize: '0.8rem', fontWeight: '400', color: 'var(--text-muted)' }}>(Opcional)</span>
                  </h4>
                  <button type="button" onClick={agregarIdea} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                    <Plus size={14} /> Agregar Hecho
                  </button>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <strong>Opcional:</strong> Si no agregas hechos auditados, el caso iniciará desde cero sin hechos predeterminados para que los estudiantes propongan y registren sus propios hallazgos durante la Lluvia de Ideas.
                </p>

                {ideas.length === 0 && (
                  <div style={{ padding: '16px', textAlign: 'center', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px dashed var(--border-color)', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    No has agregado hechos auditados. El caso iniciará desde cero sin hechos predeterminados, permitiendo que los estudiantes construyan sus propios hallazgos. Haz clic en <strong>+ Agregar Hecho</strong> si deseas predefinirlos.
                  </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                  {ideas.map((idea, index) => (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', width: '20px' }}>{index + 1}.</span>
                        <input 
                          type="text" 
                          value={idea.texto} 
                          onChange={e => handleIdeaChange(index, 'texto', e.target.value)} 
                          style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.85rem' }} 
                          placeholder="Texto del hallazgo..." 
                        />
                        <button type="button" onClick={() => eliminarIdea(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} title="Eliminar hecho">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginLeft: '28px' }}>
                        <select 
                          value={idea.ambito} 
                          onChange={e => handleIdeaChange(index, 'ambito', e.target.value)} 
                          style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.75rem' }}
                        >
                          <option value="Interno">Ámbito: Interno (F/D)</option>
                          <option value="Externo">Ámbito: Externo (O/A)</option>
                        </select>
                        <select 
                          value={idea.categoria} 
                          onChange={e => handleIdeaChange(index, 'categoria', e.target.value)} 
                          style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.75rem' }}
                        >
                          <option value="Operaciones">Operaciones / Producción</option>
                          <option value="Mercado">Mercado / Clientes</option>
                          <option value="Finanzas">Finanzas / Económico</option>
                          <option value="Talento Humano">Talento Humano / Cultura</option>
                          <option value="Tecnología">Tecnología / Infraestructura</option>
                          <option value="Legal">Legal / Político</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* BOTONES DE NAVEGACIÓN INFERIOR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', gap: '16px' }}>
            <button 
              type="button" 
              onClick={() => pasoActual > 1 ? setPasoActual(p => p - 1) : onClose()} 
              className="modal-standard-btn-cancel"
              style={{ flex: 1 }}
            >
              {pasoActual > 1 ? 'Atrás' : 'Cancelar'}
            </button>
            
            {pasoActual < 4 ? (
              <button 
                type="submit" 
                className="modal-standard-btn-confirm"
                style={{ flex: 1 }}
              >
                Siguiente
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={loading} 
                className="modal-standard-btn-confirm"
                style={{ flex: 1 }}
              >
                {loading ? 'Guardando...' : (casoAEditar ? 'Actualizar Caso' : 'Finalizar y Guardar Caso')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
