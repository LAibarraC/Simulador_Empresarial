import React, { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconoGrafico, IconoMostrar, IconoOcultar, IconoMaximizar, IconoRestaurar, IconoCopiar } from '../../../ui/iconos';
import { copiarGrafico } from '../../MAT151/utils/exportUtils';

const IconoMover = () => (
  <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor" style={{ cursor: 'grab', opacity: 0.6 }}>
    <path d="M7 2a2 2 0 1 0 .001 4.001 A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001 A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001 A2 2 0 0 0 7 14zm6-12a2 2 0 1 0 .001 4.001 A2 2 0 0 0 13 2zm0 6a2 2 0 1 0 .001 4.001 A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001 A2 2 0 0 0 13 14z" />
  </svg>
);

const IconoArbol = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5" cy="12" r="2" fill="currentColor" />
    <circle cx="19" cy="6" r="2" fill="currentColor" />
    <circle cx="19" cy="18" r="2" fill="currentColor" />
    <path d="M7 11.5l10-5" />
    <path d="M7 12.5l10 5" />
  </svg>
);

export default function MarcoWidgetMAT251({ id, titulo, children, anchoCompleto = false, ancho, alto }) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const autoId = useRef(`widget-mat251-${Math.random().toString(36).substring(2, 9)}`);
  const widgetId = id || autoId.current;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widgetId, disabled: isMaximized });

  // 1. Estilo para la caja normal (atrapada en la grilla)
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    gridColumn: anchoCompleto ? "1 / -1" : "auto",
    zIndex: isDragging ? 999 : 1,
    width: anchoCompleto ? "100%" : (ancho ? ancho : undefined),
    height: alto ? alto : undefined,
    position: "relative",
    minWidth: 0,
    minHeight: 0,
    maxWidth: '100%',
  };

  const cloneWithMaximized = (node) => {
    if (!React.isValidElement(node)) return node;
    if (typeof node.type === 'string') {
      if (node.props && node.props.children) {
        return React.cloneElement(node, {
          children: React.Children.map(node.props.children, cloneWithMaximized)
        });
      }
      return node;
    }
    return React.cloneElement(node, { isMaximized });
  };

  const childrenConProps = React.Children.map(children, cloneWithMaximized);

  return (
    <>
      {/* ========================================================== */}
      {/* 📦 VISTA NORMAL: LA CAJA ATRAPADA EN LA CUADRÍCULA           */}
      {/* ========================================================== */}
      <div ref={setNodeRef} id={widgetId} style={style} className={`widget-grafico pdf-section ${isMinimized ? 'minimizada' : ''}`}>
        <div className="widget-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 15px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0, paddingRight: '8px' }}>
            <div
              {...attributes}
              {...listeners}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab', touchAction: 'none', padding: 0, flexShrink: 0 }}
              title="Arrastrar gráfico"
              data-html2canvas-ignore="true"
            >
              <IconoMover />
            </div>
            <h4 className="widget-titulo" style={{ margin: 0, color: 'var(--text-main)', minWidth: 0, display: 'inline-flex', alignItems: 'center', gap: '6px', lineHeight: 1 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                <IconoArbol />
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{titulo}</span>
            </h4>
          </div>

          <div className="widget-controles" data-html2canvas-ignore="true" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              className="widget-btn"
              onClick={() => copiarGrafico(widgetId)}
              title="Copiar Imagen"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <IconoCopiar />
            </button>
            <button className="widget-btn" onClick={() => setIsMinimized(!isMinimized)} title={isMinimized ? "Mostrar" : "Ocultar"} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isMinimized ? <IconoMostrar /> : <IconoOcultar />}
            </button>
            <button className="widget-btn" onClick={() => { setIsMaximized(true); setIsMinimized(false); }} title="Maximizar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconoMaximizar />
            </button>
          </div>
        </div>

        <div className={`widget-body ${isMinimized ? 'oculto' : ''}`} style={{ flex: 1, position: 'relative', minHeight: '300px', padding: 0 }}>
          {/* Si está maximizado, dejamos la caja vacía para que no se renderice dos veces el gráfico pesado */}
          {!isMaximized && (
            <div
              className="contenedor-grafico-interno thin-scrollbar"
              style={{ position: 'absolute', top: 10, left: 10, right: 10, bottom: 10, width: 'auto', height: 'auto', overflow: 'hidden' }}
            >
              {childrenConProps}
            </div>
          )}
          {isMaximized && (
            <div style={{ display: 'flex', height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center', color: '#999', fontStyle: 'italic' }}>
              Gráfico en vista detallada...
            </div>
          )}
        </div>
      </div>

      {/* ========================================================== */}
      {/* 🚀 VISTA MAXIMIZADA: EL MODAL PANTALLA COMPLETA              */}
      {/* ========================================================== */}
      {isMaximized && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.85)', // Fondo oscuro elegante
            zIndex: 999999, // Supera cualquier navbar o barra lateral
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '15px',
            boxSizing: 'border-box'
          }}
          onClick={() => setIsMaximized(false)} // Clic afuera cierra el gráfico
        >
          {/* La Tarjeta Blanca Gigante */}
          <div
            id={`${widgetId}-modal`}
            className="widget-grafico modal-grafico-gigante"
            style={{
              backgroundColor: 'var(--bg-card, #ffffff)',
              borderRadius: '5px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 15px 40px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()} // Evita que se cierre si haces clic dentro del gráfico
          >
            {/* Header del Modal */}
            <div className="widget-header modal-header-gigante" style={{ padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="widget-titulo-max" style={{ margin: 0, color: 'var(--text-main)', lineHeight: 1.35, minWidth: 0, flex: 1, paddingRight: '10px' }}>
                <span style={{ display: 'inline-flex', verticalAlign: '-2px', marginRight: '8px' }}>
                  <IconoArbol />
                </span>
                <span>{titulo}</span>
              </h3>
              <div className="widget-controles controles-modal-gigante" data-html2canvas-ignore="true" style={{ flexShrink: 0 }}>
                <button
                  className="widget-btn"
                  onClick={() => copiarGrafico(`${widgetId}-modal`)}
                  title="Copiar Imagen"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <IconoCopiar />
                </button>
                <button
                  className="widget-btn"
                  onClick={() => setIsMaximized(false)}
                  title="Restaurar"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <IconoRestaurar />
                </button>
              </div>
            </div>

            {/* Cuerpo Gigante del Gráfico */}
            <div
              className="thin-scrollbar cuerpo-grafico-gigante"
              style={{ flex: 1, position: 'relative', padding: '15px 20px', overflow: 'hidden' }}
            >
              {childrenConProps}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

