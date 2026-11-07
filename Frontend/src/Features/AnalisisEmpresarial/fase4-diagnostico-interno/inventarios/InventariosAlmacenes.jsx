import { useCallback, useMemo, useState } from 'react';
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Boxes, ChevronDown, Coins, PackageCheck, PackageX, Plus, Search, Trash2, Warehouse } from 'lucide-react';
import { alerta } from '../../../../utils/Notificaciones';
import { EstadoVacio, PieHerramienta, IndicadoresClave, NotasConPlantilla, EncabezadoPdf, BarraHerramienta } from '../../compartido/ComponentesHerramienta';
import { useExportarPdf, useRegistros } from '../../compartido/useRegistrosHerramienta';
import { useAccionesDocumentos } from '../../compartido/documentos/useDocumentosRespaldo';
import DocumentosRespaldo from '../../compartido/documentos/DocumentosRespaldo';
import { formatearTamano } from '../../compartido/documentos/archivosRespaldo';
import { BarraStock, ListaMovimientos, ParetoAbc } from './GraficosInventario';
import {
  ESTADOS_STOCK, ID_INVENTARIO, MAX_MOVIMIENTOS, PLANTILLA_CONCLUSION_INV, analizarProducto, aplicarMovimiento, calcularTotalesInventario, clasificarAbc, crearProducto
} from './calculosInventario';
import '../../compartido/estilos/EstilosHerramientaBase.css';
import '../customer-journey/CustomerJourneyMap.css';
import './InventariosAlmacenes.css';
import '../../compartido/estilos/EstilosHerramientaTema.css';

const moneda = valor => new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 0 }).format(valor || 0);
const entero = valor => new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 }).format(valor || 0);
const CAMPOS = [
  { id: 'sku', nombre: 'SKU' }, { id: 'producto', nombre: 'Producto' }, { id: 'almacen', nombre: 'Almacén', lista: 'inv-almacenes' }, { id: 'proveedor', nombre: 'Proveedor' },
  { id: 'existencia', nombre: 'Existencia', numero: true }, { id: 'reservado', nombre: 'Reservado', numero: true }, { id: 'minimo', nombre: 'Mínimo', numero: true },
  { id: 'maximo', nombre: 'Máximo', numero: true }, { id: 'costo', nombre: 'Costo unitario (Bs)', numero: true }
];
const FILTROS = [['todos', 'Todos'], ['alerta', 'Reponer'], ['exceso', 'Exceso'], ['normal', 'Óptimo']];
const SEMAFORO = [
  { id: 'alerta', titulo: 'Por reponer', ayuda: 'Agotados o bajo el mínimo: compra pronto', tono: 'bad', icono: PackageX },
  { id: 'normal', titulo: 'Nivel óptimo', ayuda: 'Entre el mínimo y el máximo', tono: 'ok', icono: PackageCheck },
  { id: 'exceso', titulo: 'En exceso', ayuda: 'Sobre el máximo: capital inmovilizado', tono: 'warn', icono: Warehouse }
];

function FilaProducto({ producto, abc, abierto, onAlternar, onEditar, onMovimiento, onEliminar }) {
  const [cantidad, setCantidad] = useState('');
  const estado = ESTADOS_STOCK[producto.estado];
  const mover = tipo => { if (onMovimiento(tipo, cantidad)) setCantidad(''); };
  return <article className={`inv-item ${producto.estado}${abierto ? ' open' : ''}`}>
    <div className="inv-item-main">
      <button type="button" className="inv-btn-toggle" onClick={onAlternar} aria-expanded={abierto} aria-label={`Editar ${producto.producto || 'producto'}`}>
        <span className="inv-sku">{producto.sku || 'SKU'}</span>
        <span className="inv-name"><strong>{producto.producto || 'Producto sin nombre'}</strong><small>{[producto.almacen, producto.proveedor].filter(Boolean).join(' · ') || 'Sin almacén'}</small></span>
        <ChevronDown size={15} className="inv-chevron"/>
      </button>
      <div className="inv-stock">
        <BarraStock producto={producto}/>
        <div className="inv-stock-nums"><span><b>{entero(producto.disponible)}</b> disp.</span>{producto.reservadoN > 0 && <span>{entero(producto.reservadoN)} res.</span>}<span>mín {entero(producto.minimoN)}{producto.maximoN ? ` · máx ${entero(producto.maximoN)}` : ''}</span></div>
      </div>
      <div className="inv-value"><strong>{moneda(producto.valor)}</strong>{abc && <span className={`inv-abc clase-${abc.clase}`} title={`${abc.participacion.toFixed(1)}% del valor`}>{abc.clase}</span>}</div>
      <span className={`hf-pill ${estado.tono}`}>{estado.nombre}{producto.sugerido > 0 ? ` · +${entero(producto.sugerido)}` : ''}</span>
      <div className="inv-move">
        <input className="hf-input hf-num" type="number" min="0" step="any" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="Cant." aria-label={`Cantidad para ${producto.producto || 'producto'}`}/>
        <button type="button" className="inv-btn-move in" onClick={() => mover('Entrada')} title="Registrar entrada" aria-label="Registrar entrada"><ArrowDownToLine size={14}/></button>
        <button type="button" className="inv-btn-move out" onClick={() => mover('Salida')} title="Registrar salida" aria-label="Registrar salida"><ArrowUpFromLine size={14}/></button>
      </div>
      <button type="button" className="hf-btn-icon danger sm" onClick={onEliminar} title="Eliminar producto" aria-label={`Eliminar ${producto.producto || 'producto'}`}><Trash2 size={14}/></button>
    </div>
    {abierto && <div className="inv-edit">
      {CAMPOS.map(campo => <label key={campo.id} className="hf-field"><span className="hf-field-label">{campo.nombre}</span>
        <input className={`hf-input${campo.numero ? ' hf-num' : ''}`} type={campo.numero ? 'number' : 'text'} min={campo.numero ? '0' : undefined} step={campo.numero ? 'any' : undefined} list={campo.lista} value={producto[campo.id] ?? ''} onChange={e => onEditar(campo.id, e.target.value)}/>
      </label>)}
      {producto.errores.length > 0 && <p className="inv-error"><AlertTriangle size={13}/> {producto.errores.join(' ')}</p>}
    </div>}
  </article>;
}

export default function InventariosAlmacenes({ casoActivo, datos = {}, setDatos }) {
  const { contenido, actualizar, actualizarFilas, editarFila, guardarExtra, eliminarConConfirmacion } = useRegistros(datos, setDatos, ID_INVENTARIO);
  const productos = useMemo(() => contenido.filas.map(analizarProducto), [contenido.filas]);
  const abc = useMemo(() => clasificarAbc(productos), [productos]);
  const totales = useMemo(() => calcularTotalesInventario(productos), [productos]);
  const [almacen, setAlmacen] = useState('todos');
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [abierto, setAbierto] = useState(null);
  const documentos = useMemo(() => (Array.isArray(contenido.documentos) ? contenido.documentos : []), [contenido.documentos]);
  const setDocumentos = useCallback(transformar => actualizar(c => ({ ...c, documentos: transformar(Array.isArray(c.documentos) ? c.documentos : []) })), [actualizar]);
  const accionesDocs = useAccionesDocumentos(documentos, setDocumentos);
  const conteo = { alerta: totales.reponer, normal: totales.optimos, exceso: totales.exceso };
  const pdf = useExportarPdf({ nombreBase: 'Inventarios_Almacenes', caso: casoActivo, pie: 'Inventarios y almacenes · Análisis Empresarial', mensaje: 'Se exportó el estado del inventario, la clasificación ABC, los movimientos y el diagnóstico.' });

  const visibles = productos.filter(p => (almacen === 'todos' || (p.almacen?.trim() || '') === almacen)
    && (filtro === 'todos' || (filtro === 'alerta' ? ['agotado', 'reponer'].includes(p.estado) : p.estado === filtro))
    && (!busqueda.trim() || `${p.sku} ${p.producto} ${p.proveedor}`.toLowerCase().includes(busqueda.trim().toLowerCase())));
  const agregar = () => { const nuevo = crearProducto({ almacen: almacen === 'todos' ? '' : almacen }); actualizarFilas(filas => [...filas, nuevo]); setAbierto(nuevo.id); };
  const registrar = (producto, tipo, cantidad) => {
    const resultado = aplicarMovimiento(producto, tipo, cantidad);
    if (resultado.error) { alerta.advertencia(...resultado.error); return false; }
    actualizar(c => ({
      ...c,
      filas: c.filas.map(f => (f.id === producto.id ? { ...f, existencia: resultado.fila.existencia } : f)),
      movimientos: [resultado.movimiento, ...c.movimientos].slice(0, MAX_MOVIMIENTOS)
    }));
    return true;
  };

  const kpis = [
    { icono: Boxes, label: 'Productos', valor: totales.productos, detalle: `${totales.almacenes.length} almacén(es)` },
    { icono: Coins, label: 'Valor del inventario', valor: moneda(totales.valor) },
    { icono: PackageX, label: 'Por reponer', valor: totales.reponer, tono: totales.reponer ? 'bad' : 'ok', detalle: totales.reposicion ? `Inversión ${moneda(totales.reposicion)}` : undefined },
    { icono: Warehouse, label: 'En exceso', valor: totales.exceso, tono: totales.exceso ? 'warn' : '', detalle: totales.excedente ? `${moneda(totales.excedente)} inmovilizado` : undefined },
    { icono: PackageCheck, label: 'Nivel óptimo', valor: totales.productos ? `${Math.round((totales.optimos / totales.productos) * 100)}%` : '—', tono: 'ok' }
  ];

  return <div className="hf-container inv-tool">
    <datalist id="inv-almacenes">{totales.almacenes.map(nombre => <option key={nombre} value={nombre}/>)}</datalist>
    <BarraHerramienta icono={Warehouse} titulo="Inventarios y almacenes · Control de existencias" exportando={pdf.exportando} onExportar={pdf.exportar}/>

    {productos.length > 0 && <section className="inv-semaforo" aria-label="Resumen del inventario">
      <article className="inv-btn-sem valor">
        <span className="inv-sem-icon"><Coins size={20}/></span>
        <span className="inv-sem-text"><strong>{moneda(totales.valor)}</strong><small>Valor del inventario · {totales.productos} producto(s) en {totales.almacenes.length || 1} almacén(es)</small></span>
        <span className="inv-sem-pct"><b>{totales.reposicion ? `Reponer: ${moneda(totales.reposicion)}` : 'Sin reposición pendiente'}</b></span>
      </article>
      {SEMAFORO.map(item => {
        const Icono = item.icono;
        const porcentaje = totales.productos ? Math.round((conteo[item.id] / totales.productos) * 100) : 0;
        return <button type="button" key={item.id} className={`inv-btn-sem ${item.tono}${filtro === item.id ? ' active' : ''}`} onClick={() => setFiltro(actual => (actual === item.id ? 'todos' : item.id))} aria-pressed={filtro === item.id} title="Clic para ver solo estos productos">
          <span className="inv-sem-icon"><Icono size={20}/></span>
          <span className="inv-sem-text"><strong>{conteo[item.id]} <small>{item.titulo}</small></strong><small>{item.ayuda}</small></span>
          <span className="inv-sem-pct"><b>{porcentaje}%</b><i style={{ width: `${porcentaje}%` }}/></span>
        </button>;
      })}
    </section>}

    <section className="hf-card" aria-label="Productos en inventario">
      <div className="hf-card-head">
        <div>
          <h3 className="hf-card-title"><Boxes size={16}/> Existencias por producto</h3>
          <p className="hf-statement">La barra muestra el disponible frente a la zona <b className="hf-bad">bajo mínimo</b>, la zona <b className="hf-ok">óptima</b> y el <b className="hf-warn">exceso</b>. Registra entradas y salidas con los botones de cada fila; haz clic en el producto para editarlo.</p>
        </div>
        <button type="button" className="hf-btn-add" onClick={agregar}><Plus size={14}/> Producto</button>
      </div>
      {productos.length > 0 && <div className="inv-filters">
        <div className="hf-segmented" role="group" aria-label="Almacén">
          <button type="button" className={`hf-btn-segment${almacen === 'todos' ? ' active' : ''}`} onClick={() => setAlmacen('todos')}>Todos</button>
          {totales.almacenes.map(nombre => <button type="button" key={nombre} className={`hf-btn-segment${almacen === nombre ? ' active' : ''}`} onClick={() => setAlmacen(nombre)}><Warehouse size={12}/>{nombre}</button>)}
        </div>
        <div className="hf-segmented" role="group" aria-label="Estado">
          {FILTROS.map(([id, nombre]) => <button type="button" key={id} className={`hf-btn-segment${filtro === id ? ' active' : ''}`} onClick={() => setFiltro(id)}>{nombre}</button>)}
        </div>
        <label className="inv-search"><Search size={13}/><input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar SKU, producto o proveedor" aria-label="Buscar producto"/></label>
      </div>}
      {productos.length ? <div className="inv-list">
        {visibles.map(p => <FilaProducto key={p.id} producto={p} abc={abc[p.id]} abierto={abierto === p.id} onAlternar={() => setAbierto(actual => (actual === p.id ? null : p.id))}
          onEditar={(campo, valor) => editarFila(p.id, campo, valor)} onMovimiento={(tipo, cantidad) => registrar(contenido.filas.find(f => f.id === p.id), tipo, cantidad)}
          onEliminar={() => eliminarConConfirmacion(p.id, p.producto || p.sku || 'producto')}/>)}
        {!visibles.length && <p className="hf-muted inv-none">Ningún producto coincide con los filtros.</p>}
      </div> : <EstadoVacio icono={Boxes} titulo="Aún no hay productos" texto="Registra los productos con su existencia, niveles mínimo y máximo y su costo unitario.">
        <button type="button" className="hf-btn-add" onClick={agregar}><Plus size={14}/> Añadir producto</button>
      </EstadoVacio>}
    </section>

    {productos.length > 0 && <div className="hf-grid-2">
      <section className="hf-card"><ParetoAbc productos={productos} abc={abc} formatoMoneda={moneda}/></section>
      <section className="hf-card"><ListaMovimientos movimientos={contenido.movimientos}/></section>
    </div>}

    {productos.length > 0 && <section className="hf-card" aria-label="Diagnóstico del inventario">
      <NotasConPlantilla id="inv-conclusiones" titulo="Conclusión y propuesta de mejora" valor={contenido.conclusiones || ''} onCambio={valor => guardarExtra('conclusiones', valor)} plantilla={PLANTILLA_CONCLUSION_INV} placeholder="¿Qué productos son críticos y qué política propones?"/>
    </section>}

    <DocumentosRespaldo documentos={documentos} acciones={accionesDocs}
      ayuda="Adjunta kardex, actas de conteo físico, facturas de compra o fotos del almacén. Puedes relacionar cada archivo con un producto."
      renderExtra={documento => <select className="inv-doc-step" value={documento.productoId || ''} onChange={e => accionesDocs.editarDocumento(documento.id, { productoId: e.target.value })} aria-label={`Producto relacionado con ${documento.nombre}`}>
        <option value="">Evidencia general</option>{productos.map(p => <option key={p.id} value={p.id}>{[p.sku, p.producto].filter(Boolean).join(' · ') || 'Producto sin nombre'}</option>)}
      </select>}/>

    <PieHerramienta/>

    <div ref={pdf.ref} className="hf-report inv-report" aria-hidden="true">
      <div data-pdf-block><EncabezadoPdf sigla="INV" titulo="Inventarios y almacenes" subtitulo="Control de existencias y reposición" etiqueta="ESTADO DEL INVENTARIO" caso={casoActivo} meta={[['Almacenes', totales.almacenes.join(', ') || '—']]}/><IndicadoresClave items={kpis}/></div>
      {productos.length > 0 && <div data-pdf-block>
        <h2>Existencias por producto</h2>
        <table className="hf-pdf-table">
          <thead><tr><th>SKU</th><th style={{ width: '17%' }}>Producto</th><th>Almacén</th><th>Exist.</th><th>Res.</th><th>Disp.</th><th>Mín.</th><th>Máx.</th><th>Costo</th><th>Valor</th><th>ABC</th><th>Estado</th><th>Reponer</th><th style={{ width: '15%' }}>Nivel</th></tr></thead>
          <tbody>{productos.map(p => <tr key={p.id}>
            <td>{p.sku || '—'}</td><td><b>{p.producto || '—'}</b></td><td>{p.almacen || '—'}</td>
            <td className="hf-num">{entero(p.existenciaN)}</td><td className="hf-num">{entero(p.reservadoN)}</td><td className="hf-num"><b>{entero(p.disponible)}</b></td><td className="hf-num">{entero(p.minimoN)}</td><td className="hf-num">{p.maximoN ? entero(p.maximoN) : '—'}</td>
            <td className="hf-num">{moneda(p.costoN)}</td><td className="hf-num">{moneda(p.valor)}</td><td>{abc[p.id]?.clase || '—'}</td>
            <td><span className={`hf-pill ${ESTADOS_STOCK[p.estado].tono}`}>{ESTADOS_STOCK[p.estado].nombre}</span></td><td className="hf-num">{p.sugerido ? entero(p.sugerido) : '—'}</td><td><BarraStock producto={p}/></td>
          </tr>)}</tbody>
        </table>
      </div>}
      {productos.length > 0 && <div data-pdf-block className="hf-grid-2"><section className="hf-card"><ParetoAbc productos={productos} abc={abc} formatoMoneda={moneda}/></section><section className="hf-card"><ListaMovimientos movimientos={contenido.movimientos} limite={14}/></section></div>}
      <div data-pdf-block><h2>Conclusión y propuesta de mejora</h2><p className="hf-pdf-notes">{contenido.conclusiones?.trim() || 'Sin conclusión registrada.'}</p></div>
      {documentos.length > 0 && <div data-pdf-block>
        <h2>Documentación de respaldo</h2>
        <table className="hf-pdf-table"><thead><tr><th>#</th><th>Archivo</th><th>Producto relacionado</th><th>Descripción</th><th>Tamaño</th></tr></thead>
          <tbody>{documentos.map((d, i) => { const prod = productos.find(p => p.id === d.productoId); return <tr key={d.id}><td>{i + 1}</td><td>{d.nombre}</td><td>{prod ? (prod.producto || prod.sku) : 'General'}</td><td>{d.descripcion || '—'}</td><td>{formatearTamano(d.tamano)}</td></tr>; })}</tbody>
        </table>
      </div>}
    </div>
  </div>;
}
