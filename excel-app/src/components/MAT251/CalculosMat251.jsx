import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DataGrid } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { useData } from '../excel/DataContext';
import { calcularTecnicasConteo, calcularProbabilidadClasica } from './Matematicas/logica_Tema1';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import GraficosProbabilidad from './Graficas/GraficosEstadisticos';
import '../../styles/pages/MAT251/CalculosMat251.css';

const FONT = 'system-ui, -apple-system, sans-serif';
const FS = { xs: '0.75rem', sm: '0.85rem', base: '0.95rem', md: '1rem', lg: '1.1rem' };
const RADIUS = '5px';

const OPERACIONES = [
  {
    grupo: 'Tema 1: Probabilidad y Conteo',
    opciones: [
      { value: 'permutacion', label: 'Permutación (nPr)' },
      { value: 'combinacion', label: 'Combinación (nCr)' },
      { value: 'probabilidad', label: 'Probabilidad Clásica' },
    ],
  },
]

function textEditor({ row, column, onRowChange, onClose }) {
  return (
    <input
      className="editor_text"
      autoFocus
      value={row[column.key]}
      onChange={(e) => onRowChange({ ...row, [column.key]: e.target.value })}
      onBlur={() => onClose(true)}
      onKeyDown={(e) => {
        if (['Enter', 'ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          const teclaDestino = e.key === 'Enter' ? 'ArrowDown' : e.key;
          onClose(true);

          setTimeout(() => {
            const celdaViva = document.activeElement;
            if (celdaViva && celdaViva.classList.contains('rdg-cell')) {
              celdaViva.dispatchEvent(
                new KeyboardEvent('keydown', { key: teclaDestino, bubbles: true })
              );
            }
          }, 10);
        }
      }}
      style={{
        width: '100%', height: '100%', border: 'none',
        padding: '0 8px', outline: '2px solid #217346', boxSizing: 'border-box'
      }}
    />
  );
}



const filaVacia = (id) => ({ id, valor: '', origen: 'agregado' });

export default function CalculosMat251() {
  const { variables } = useData();

  // ── UI ───────────────────────────────────────────────────────────────────────
  const [panelAbierto, setPanelAbierto] = useState(true);
  const [operacion, setOperacion] = useState('permutacion');

  // ── Conteo ───────────────────────────────────────────────────────────────────
  const [n, setN] = useState('0');
  const [r, setR] = useState('0');
  const [resConteo, setResConteo] = useState(null);
  const formulaConteoRef = useRef(null);

  // ── Probabilidad ─────────────────────────────────────────────────────────────
  const [filas, setFilas] = useState([filaVacia(1), filaVacia(2), filaVacia(3)]);
  const [eventoFavorable, setEventoFavorable] = useState([]);
  const [resProbabilidad, setResProbabilidad] = useState(null);
  const [varSeleccionada, setVarSeleccionada] = useState(null);
  const [modalVars, setModalVars] = useState(false);
  const [modalEditor, setModalEditor] = useState(false);
  const [modalEvento, setModalEvento] = useState(false);
  const [filasTemp, setFilasTemp] = useState([]);   // copia editable en el modal
  const formulaProbRef = useRef(null);

  // Valores únicos del espacio muestral
  const valoresUnicos = useMemo(() => {
    const vals = filas.map(f => f.valor.toString().trim()).filter(Boolean);
    return [...new Set(vals)].sort();
  }, [filas]);

  // Conteos de datos (cargados vs agregados)
  const statsDatos = useMemo(() => {
    const validas = filas.filter(f => f.valor.toString().trim() !== '');
    const cargados = validas.filter(f => f.origen === 'cargado').length;
    const agregados = validas.filter(f => f.origen === 'agregado').length;
    return { cargados, agregados, total: validas.length };
  }, [filas]);

  // Detectar si hay cambios en el editor para habilitar/deshabilitar el botón Guardar
  const hayCambiosEditor = useMemo(() => {
    const limpiosOriginal = filas.filter(f => f.valor.toString().trim() !== '').map(f => f.valor.toString().trim());
    const limpiosTemp = filasTemp.filter(f => f.valor.toString().trim() !== '').map(f => f.valor.toString().trim());
    
    if (limpiosOriginal.length !== limpiosTemp.length) return true;
    return limpiosOriginal.some((val, idx) => val !== limpiosTemp[idx]);
  }, [filas, filasTemp]);

  // Frecuencias para el selector de eventos
  const statsEventos = useMemo(() => {
    const counts = {};
    const validas = filas.map(f => f.valor.toString().trim()).filter(Boolean);
    validas.forEach(v => {
      counts[v] = (counts[v] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([valor, count]) => ({ valor, count }))
      .sort((a, b) => a.valor.localeCompare(b.valor));
  }, [filas]);

  // Columnas dinámicas para el DataGrid (Editor)
  const columns = useMemo(() => [
    {
      key: 'id',
      name: 'Nº',
      width: 50,
      frozen: true,
      cellClass: 'rdg-cell-center'
    },
    {
      key: 'valor',
      name: varSeleccionada?.nombre ? ` ${varSeleccionada.nombre}` : 'Dato (Valor)',
      renderEditCell: textEditor,
      editable: true,
      cellClass: 'rdg-cell-center'
    }
  ], [varSeleccionada]);

  // Derivar inputDatos desde filas
  const inputDatos = filas.map(f => f.valor.toString().trim()).filter(Boolean).join(', ');

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const ajustar = (setFn, val, op) => {
    const v = parseInt(val) || 0;
    setFn(Math.max(0, op === '+' ? v + 1 : v - 1).toString());
  };

  const abrirEditor = () => {
    setFilasTemp([...filas, filaVacia(filas.length + 1)]);
    setModalEditor(true);
  };

  const guardarEditor = () => {
    const limpias = filasTemp.filter(f => f.valor.toString().trim() !== '');
    const renumeradas = limpias.map((f, i) => ({ ...f, id: i + 1 }));
    setFilas(renumeradas.length ? renumeradas : [filaVacia(1)]);
    setEventoFavorable([]);
    setResProbabilidad(null);
    setModalEditor(false);
  };

  const cargarVariable = (v) => {
    if (!v?.datos) return;
    const nuevas = v.datos.map((d, i) => ({ id: i + 1, valor: d.toString(), origen: 'cargado' }));
    setFilas(nuevas);
    setEventoFavorable([]);
    setResProbabilidad(null);
    setVarSeleccionada(v);
    setModalVars(false);
  };

  // ── KaTeX ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (formulaConteoRef.current && resConteo) {
      const esP = resConteo.simbolo === 'nPr';
      const latex = esP
        ? `P(${n},\\,${r})=\\dfrac{${n}!}{(${n}-${r})!}=${resConteo.resultado.toLocaleString()}`
        : `C(${n},\\,${r})=\\dfrac{${n}!}{${r}!(${n}-${r})!}=${resConteo.resultado.toLocaleString()}`;
      katex.render(latex, formulaConteoRef.current, { throwOnError: false, displayMode: true });
    }
  }, [resConteo, n, r]);

  useEffect(() => {
    if (formulaProbRef.current && resProbabilidad) {
      const latex = `P(A)=\\dfrac{n(A)}{N}=\\dfrac{${resProbabilidad.casosFavorables}}{${resProbabilidad.casosTotales}}=${resProbabilidad.probabilidadDecimal}`;
      katex.render(latex, formulaProbRef.current, { throwOnError: false, displayMode: true });
    }
  }, [resProbabilidad]);

  // ── Calcular ─────────────────────────────────────────────────────────────────
  const ejecutar = () => {
    if (operacion === 'permutacion' || operacion === 'combinacion') {
      const res = calcularTecnicasConteo(n, r, operacion === 'permutacion');
      if (res?.error) { alert(res.error); return; }
      setResConteo(res);
      setResProbabilidad(null);
    } else {
      if (!inputDatos) { alert('Agrega datos al espacio muestral'); return; }
      if (eventoFavorable.length === 0) { alert('Selecciona al menos un evento favorable'); return; }
      const arr = inputDatos.split(',').map(d => d.trim()).filter(Boolean);
      const res = calcularProbabilidadClasica(arr, eventoFavorable.join(','));
      if (!res) { alert('Error al calcular. Revisa los datos.'); return; }
      setResProbabilidad(res);
      setResConteo(null);
    }
  };

  const handleOperacion = (val) => {
    setOperacion(val);
    setResConteo(null);
    setResProbabilidad(null);
  };

  const hayResultado = resConteo || resProbabilidad;

  // ── Estilos reutilizables ────────────────────────────────────────────────────
  const cardStyle = { padding: '10px', border: '1px solid var(--border-color)', borderRadius: RADIUS, backgroundColor: 'var(--bg-card)', fontFamily: FONT };
  const labelStyle = { fontSize: FS.sm, fontWeight: 600, fontFamily: FONT, display: 'block', marginBottom: '4px', color: 'var(--primary-color)' };
  const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
  const modalBoxStyle = { background: 'var(--bg-card)', borderRadius: RADIUS, padding: '24px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', fontFamily: FONT };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className={`calculadora-layout ${panelAbierto ? '' : 'colapsado'}`} style={{ position: 'relative', fontFamily: FONT }}>

      {/* Estilos locales para el grid y modal */}
      <style>{`
        .rdg-cell-center {
          text-align: center !important;
          line-height: 35px !important;
        }
        .rdg-header-row .rdg-cell {
          text-align: center !important;
          font-weight: 700 !important;
          background-color: var(--bg-input) !important;
          line-height: 35px !important;
        }
        .btn-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
          border: none;
          color: white;
          cursor: pointer;
          font-weight: 600;
        }
        .btn-icon:hover {
          transform: translateY(-1px);
          filter: brightness(1.1);
        }
      `}</style>

      {/* Toggle */}
      <button onClick={() => setPanelAbierto(!panelAbierto)} className={`boton-toggle-medio ${panelAbierto ? 'abierto' : 'cerrado'}`} title={panelAbierto ? 'Ocultar panel' : 'Mostrar panel'}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: FS.base, color: '#fff', transform: panelAbierto ? 'scaleX(1)' : 'scaleX(-1)', transition: 'transform 0.3s ease', lineHeight: 0, marginTop: '-2px', marginLeft: '-1px' }}>❮</span>
      </button>

      {/* ══ PANEL IZQUIERDO ══ */}
      <div className="calculadora-datos" style={{ fontFamily: FONT }}>
        <div style={{ borderBottom: panelAbierto ? '1px solid var(--border-color)' : 'none', paddingBottom: '5px', marginBottom: panelAbierto ? '5px' : '0' }}>
          {panelAbierto && <h3 style={{ margin: 0, fontSize: FS.lg, fontFamily: FONT, fontWeight: 600 }}>Parámetros</h3>}
        </div>

        {panelAbierto && (
          <div className="panel-controles-excel" style={{ marginTop: '10px', fontFamily: FONT, display: 'flex', flexDirection: 'column' }}>
            <h3 className="panel-controles-excel_h3" style={{ fontSize: FS.lg, fontFamily: FONT, fontWeight: 600 }}>Calculadora</h3>

            {/* Selector operación */}
            <label style={labelStyle}>Operación:</label>
            <select value={operacion} onChange={(e) => handleOperacion(e.target.value)} className="container_operaciones" style={{ fontSize: FS.base, fontFamily: FONT, borderRadius: RADIUS }}>
              {OPERACIONES.map((g) => (
                <optgroup key={g.grupo} label={g.grupo}>
                  {g.opciones.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </optgroup>
              ))}
            </select>

            {/* Controles n / r */}
            {(operacion === 'permutacion' || operacion === 'combinacion') && (
              <div style={{ ...cardStyle, marginBottom: '15px' }}>
                <label style={{ ...labelStyle }}>Valores:</label>
                {[{ label: 'Total (n):', val: n, setVal: setN }, { label: 'Muestra (r):', val: r, setVal: setR }].map(({ label, val, setVal }) => (
                  <div key={label} style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: FS.sm, fontFamily: FONT, display: 'block', marginBottom: '4px' }}>{label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button onClick={() => ajustar(setVal, val, '-')} style={{ width: '32px', padding: '4px', borderRadius: RADIUS, fontSize: FS.md }}>−</button>
                      <input type="number" value={val} onChange={(e) => setVal(e.target.value)} className="container_cal_input" style={{ textAlign: 'center', flex: 1, borderRadius: RADIUS, fontSize: FS.base }} />
                      <button onClick={() => ajustar(setVal, val, '+')} style={{ width: '32px', padding: '4px', borderRadius: RADIUS, fontSize: FS.md }}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selector de variable (probabilidad) */}
            {operacion === 'probabilidad' && (
              <div style={{ marginBottom: '15px', display: 'flex', flexDirection: 'column' }}>
                <label style={labelStyle}>Variable (Opcional):</label>
                <button
                  onClick={() => setModalVars(true)}
                  className="btn-icon"
                  style={{ 
                    width: 'fit-content', 
                    alignSelf: 'center', 
                    marginBottom: '10px', 
                    background: 'var(--primary-color)', 
                    color: 'white',
                    borderRadius: RADIUS, 
                    fontSize: FS.sm, 
                    padding: '8px 20px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="3" y1="15" x2="21" y2="15"></line>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                    <line x1="15" y1="3" x2="15" y2="21"></line>
                  </svg>
                  {varSeleccionada ? `Cambiar Variable` : 'Importar Variable de Excel'}
                </button>

                {/* ── Tarjeta profesional de la variable ── */}
                {varSeleccionada && (() => {
                  const datos = varSeleccionada.datos || [];
                  const numeros = datos.map(d => parseFloat(d)).filter(d => !isNaN(d));
                  const esNum = numeros.length === datos.length;
                  const esMixto = numeros.length > 0 && numeros.length < datos.length;
                  const tipo = esNum ? 'Numérico' : esMixto ? 'Mixto' : 'Texto';
                  const unicos = [...new Set(datos.map(d => d.toString().trim()))].length;
                  const min = esNum ? Math.min(...numeros) : null;
                  const max = esNum ? Math.max(...numeros) : null;

                  const stats = [
                    { label: 'Nombre', val: varSeleccionada.nombre },
                    { label: 'Tipo', val: tipo },
                    { label: 'Total', val: `${datos.length} datos` },
                    { label: 'Únicos', val: `${unicos} valores` },
                    ...(esNum ? [
                      { label: 'Mínimo', val: min },
                      { label: 'Máximo', val: max },
                    ] : []),
                  ];

                  return (
                    <div style={{
                      border: '1px solid var(--primary-color)',
                      borderRadius: RADIUS,
                      overflow: 'hidden',
                      fontSize: FS.xs,
                      fontFamily: FONT,
                    }}>
                      <div style={{ background: 'var(--primary-color)', color: 'white', padding: '6px 10px', fontWeight: 700, fontSize: FS.sm }}>
                        ✓ Variable cargada
                      </div>
                      {stats.map(({ icon, label, val }, i) => (
                        <div key={label} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '5px 10px',
                          background: i % 2 === 0 ? 'var(--bg-body)' : 'var(--bg-card)',
                          borderTop: '1px solid var(--border-color)',
                        }}>
                          <span style={{ color: 'var(--text-muted)' }}>{icon} {label}</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)', maxWidth: '55%', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* CALCULAR (solo conteo) */}
            {operacion !== 'probabilidad' && (
              <button 
                onClick={ejecutar} 
                className="button_calcular btn-icon" 
                style={{ 
                  width: 'fit-content', 
                  alignSelf: 'center', 
                  padding: '8px 35px', 
                  borderRadius: RADIUS, 
                  fontSize: FS.md, 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                  <line x1="8" y1="6" x2="16" y2="6"></line>
                  <line x1="16" y1="14" x2="16" y2="18"></line>
                  <path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path>
                  <path d="M12 14h.01"></path><path d="M8 14h.01"></path>
                  <path d="M12 18h.01"></path><path d="M8 18h.01"></path>
                </svg>
                CALCULAR
              </button>
            )}
          </div>
        )}
      </div>

      {/* ══ PANEL DERECHO ══ */}
      <div className="calculadora-resultados" style={{ fontFamily: FONT }}>
        <div className="frecuencias" style={{ borderRadius: RADIUS }}>
          <h3 style={{ fontSize: FS.lg, fontFamily: FONT, fontWeight: 600 }}>
            Resultados: {operacion === 'permutacion' ? 'PERMUTACIÓN' : operacion === 'combinacion' ? 'COMBINACIÓN' : 'PROBABILIDAD CLÁSICA'}
          </h3>

          {/* ── Sección de entrada: Probabilidad ── */}
          {operacion === 'probabilidad' && (
            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column' }}>

              {/* Espacio Muestral */}
              <div style={{ ...cardStyle, marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <span style={{ ...labelStyle, margin: 0 }}>Espacio Muestral:</span>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
                      <small title="Datos provenientes de variables externas" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                        Cargados: <strong style={{ color: 'var(--primary-color)' }}>{statsDatos.cargados}</strong>
                      </small>
                      <small title="Datos ingresados manualmente" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                        Agregados: <strong style={{ color: '#3b82f6' }}>{statsDatos.agregados}</strong>
                      </small>
                      <small title="Total de datos válidos" style={{ color: 'var(--text-muted)', fontSize: FS.xs, cursor: 'help' }}>
                        Total: <strong>{statsDatos.total}</strong>
                      </small>
                    </div>
                  </div>
                  <button 
                    onClick={abrirEditor} 
                    className="btn-icon"
                    style={{ 
                      borderRadius: RADIUS, 
                      fontSize: FS.sm, 
                      padding: '6px 14px', 
                      background: 'var(--primary-color)', 
                      color: 'white', 
                      border: 'none', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    Editar Datos
                  </button>
                </div>

                {/* Vista previa compacta */}
                {valoresUnicos.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {valoresUnicos.slice(0, 10).map((v, i) => (
                      <span key={i} style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: RADIUS, padding: '2px 8px', fontSize: FS.xs, fontFamily: FONT }}>
                        {v}
                      </span>
                    ))}
                    {valoresUnicos.length > 10 && <span style={{ fontSize: FS.xs, color: 'var(--text-muted)' }}>+{valoresUnicos.length - 10} más...</span>}
                  </div>
                ) : (
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: FS.sm }}>Sin datos. Presiona "Editar Datos" para agregar.</p>
                )}
              </div>

              {/* Evento Favorable */}
              <div style={{ ...cardStyle, marginBottom: '12px' }}>
                <label style={labelStyle}>Evento Favorable (A):</label>
                {statsEventos.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                      onClick={() => setModalEvento(true)}
                      style={{
                        width: 'fit-content',
                        alignSelf: 'center',
                        padding: '5px 20px',
                        background: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        borderRadius: RADIUS,
                        fontSize: FS.sm,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                      {eventoFavorable.length > 0 ? 'Modificar Selección' : 'Configurar Eventos Favorables'}
                    </button>
                    
                    {eventoFavorable.length > 0 ? (
                      <div style={{ background: 'rgba(33, 115, 70, 0.03)', padding: '12px', borderRadius: RADIUS, border: '1.5px solid var(--primary-color)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Eventos Seleccionados ({eventoFavorable.length}):
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {eventoFavorable.map(v => (
                            <span key={v} style={{ color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(33, 115, 70, 0.1)', padding: '3px 12px', borderRadius: '5px', border: '1px solid rgba(33, 115, 70, 0.2)' }}>
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '10px', border: '1px dashed var(--border-color)', borderRadius: RADIUS }}>
                        <small style={{ color: 'var(--text-muted)', fontSize: FS.xs }}>
                          Ningún evento seleccionado aún.
                        </small>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: FS.sm }}>Primero agrega datos al espacio muestral.</p>
                )}
              </div>

              {/* Botón CALCULAR */}
              <button 
                onClick={ejecutar} 
                className="button_calcular btn-icon" 
                style={{ 
                  width: 'fit-content', 
                  alignSelf: 'center', 
                  padding: '8px 35px', 
                  borderRadius: RADIUS, 
                  fontSize: FS.md, 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                  <line x1="8" y1="6" x2="16" y2="6"></line>
                  <line x1="16" y1="14" x2="16" y2="18"></line>
                  <path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path>
                  <path d="M12 14h.01"></path><path d="M8 14h.01"></path>
                  <path d="M12 18h.01"></path><path d="M8 18h.01"></path>
                </svg>
                CALCULAR
              </button>
            </div>
          )}

          {/* Mensaje inicial (conteo) */}
          {!hayResultado && operacion !== 'probabilidad' && (
            <p style={{ color: 'var(--text-muted)', marginTop: '10px', fontSize: FS.base }}>
              Configura los parámetros a la izquierda y presiona <strong>CALCULAR</strong>.
            </p>
          )}

          {/* ── Resultado: Conteo ── */}
          {resConteo && (
            <div style={{ marginTop: '20px' }}>
              <div ref={formulaConteoRef} style={{ overflowX: 'auto' }} />
              <p style={{ marginTop: '15px', color: 'var(--text-muted)', fontStyle: 'italic', fontSize: FS.sm }}>{resConteo.explicacion}</p>
              <div style={{ marginTop: '20px', padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: RADIUS, textAlign: 'center' }}>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: FS.sm }}>{resConteo.simbolo === 'nPr' ? 'Permutaciones posibles' : 'Combinaciones posibles'}</p>
                <p style={{ margin: '8px 0 0', fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>{resConteo.resultado.toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* ── Resultado: Probabilidad ── */}
          {resProbabilidad && (
            <div style={{ marginTop: '20px' }}>
              <div ref={formulaProbRef} style={{ overflowX: 'auto' }} />
              <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                {[
                  { label: 'Eventos (A)', val: eventoFavorable.join(', ') },
                  { label: 'Casos n(A)', val: resProbabilidad.casosFavorables },
                  { label: 'Total N', val: resProbabilidad.casosTotales },
                  { label: 'Decimal', val: resProbabilidad.probabilidadDecimal },
                  { label: 'Porcentaje', val: `${resProbabilidad.probabilidadPorcentaje}%` },
                ].map(({ label, val }) => (
                  <div key={label} style={{ padding: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: RADIUS, textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: FS.xs, color: 'var(--text-muted)' }}>{label}</p>
                    <p style={{ margin: '4px 0 0', fontWeight: 700, color: 'var(--primary-color)', fontSize: FS.md }}>{val}</p>
                  </div>
                ))}
              </div>
              <GraficosProbabilidad resProbabilidad={resProbabilidad} datosArray={inputDatos.split(',').map(d => d.trim()).filter(Boolean)} />
            </div>
          )}
        </div>
      </div>

      {/* ══ MODAL: Editor Excel (Espacio Muestral) ══ */}
      {modalEditor && (
        <div style={overlayStyle} onClick={() => setModalEditor(false)}>
          <div style={{ ...modalBoxStyle, maxWidth: '480px', padding: '30px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 5px', fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                Editor de Espacio Muestral
              </h3>
              <div style={{ display: 'inline-block', padding: '4px 12px', background: 'var(--bg-body)', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: FS.xs, color: 'var(--text-muted)' }}>
                Total: <strong>{filasTemp.filter(f => f.valor.toString().trim()).length}</strong> datos detectados
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: FS.xs, textAlign: 'center', marginBottom: '15px', lineHeight: '1.4' }}>
              Ingresa los datos manualmente o edita los existentes.<br />
              <span style={{ color: 'var(--primary-color)' }}>Doble clic</span> para editar una celda.
            </p>

            <div style={{ height: '350px', border: '1px solid var(--border-color)', borderRadius: RADIUS, overflow: 'hidden', marginBottom: '20px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
              <DataGrid
                columns={columns}
                rows={filasTemp}
                onRowsChange={setFilasTemp}
                className="rdg-light"
                style={{ height: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
              <button
                className="btn-icon"
                onClick={() => setFilasTemp([...filasTemp, filaVacia(filasTemp.length + 1)])}
                style={{ background: '#3b82f6', borderRadius: RADIUS, fontSize: '0.85rem', padding: '6px 12px' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Añadir
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn-icon"
                  onClick={() => setModalEditor(false)}
                  style={{ background: '#ef4444', borderRadius: RADIUS, fontSize: '0.85rem', padding: '6px 12px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  Cancelar
                </button>
                <button
                  className="btn-icon"
                  onClick={guardarEditor}
                  disabled={!hayCambiosEditor}
                  style={{ 
                    background: hayCambiosEditor ? '#0b4420ff' : '#9ca3af', 
                    borderRadius: RADIUS, 
                    fontSize: '0.85rem', 
                    padding: '6px 14px',
                    cursor: hayCambiosEditor ? 'pointer' : 'not-allowed',
                    opacity: hayCambiosEditor ? 1 : 0.7
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Seleccionar Evento Favorable ══ */}
      {modalEvento && (
        <div style={overlayStyle} onClick={() => setModalEvento(false)}>
          <div style={{ ...modalBoxStyle, maxWidth: '420px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                Evento Favorable (A)
              </h3>
              <button onClick={() => setModalEvento(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <p style={{ fontSize: FS.sm, color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
              Selecciona uno o varios valores que definen tu evento <strong>favorable</strong>.
            </p>

            <div style={{ maxHeight: '350px', overflowY: 'auto', borderRadius: RADIUS, border: '1px solid var(--border-color)', background: 'var(--bg-body)' }}>
              {statsEventos.map(({ valor, count }) => {
                const isSelected = eventoFavorable.includes(valor);

                return (
                  <label
                    key={valor}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'all 0.2s',
                      gap: '14px',
                      background: isSelected ? 'rgba(33, 115, 70, 0.08)' : 'transparent'
                    }}
                    onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = 'var(--bg-input)')}
                    onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '4px',
                      border: `2px solid ${isSelected ? 'var(--primary-color)' : 'var(--border-color)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isSelected ? 'var(--primary-color)' : 'white',
                      transition: 'all 0.2s'
                    }}>
                      {isSelected && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        setEventoFavorable(prev => 
                          prev.includes(valor) 
                            ? prev.filter(v => v !== valor) 
                            : [...prev, valor]
                        );
                        setResProbabilidad(null);
                      }}
                      style={{ display: 'none' }}
                    />

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: isSelected ? 700 : 600, fontSize: FS.base, color: isSelected ? 'var(--primary-color)' : 'var(--text-main)' }}>
                        {valor}
                      </div>
                      <div style={{ fontSize: FS.xs, color: 'var(--text-muted)', marginTop: '2px' }}>
                        Aparece <strong>{count}</strong> veces
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => setModalEvento(false)}
                className="btn-icon"
                style={{
                  width: '100%',
                  background: 'var(--primary-color)',
                  color: 'white',
                  padding: '12px',
                  borderRadius: RADIUS,
                  fontWeight: 600,
                  fontSize: FS.base,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Confirmar Selección
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Gestor de Variables ══ */}
      {modalVars && (
        <div style={overlayStyle} onClick={() => setModalVars(false)}>
          <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px', fontSize: FS.lg, fontWeight: 600 }}>Selecciona una Variable</h3>
            {variables && variables.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {variables.map((v, i) => (
                  <div key={i} onClick={() => cargarVariable(v)}
                    style={{ padding: '12px 16px', borderRadius: RADIUS, cursor: 'pointer', border: '1px solid var(--border-color)', background: 'var(--bg-body)', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-input)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-body)'}
                  >
                    <strong style={{ fontSize: FS.base }}>{v.nombre}</strong>
                    <p style={{ margin: '2px 0 0', fontSize: FS.xs, color: 'var(--text-muted)' }}>{v.datos?.length || 0} datos disponibles</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: FS.base }}>No hay variables importadas.</p>
            )}
            <div style={{ textAlign: 'right', marginTop: '16px' }}>
              <button onClick={() => setModalVars(false)} style={{ background: '#6b7280', borderRadius: RADIUS, fontSize: FS.base, border: 'none', color: 'white', padding: '8px 16px', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
