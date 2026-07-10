import React from 'react';
import { DataGrid } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { overlayStyle, modalBoxStyle, FS, RADIUS, filaVacia } from '../../../Principal/Constantes';

export function textEditor({ row, column, onRowChange, onClose }) {
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

export default function ModalEditor({ modalEditor, setModalEditor, filasTemp, setFilasTemp, columns, guardarEditor, hayCambiosEditor }) {
    if (!modalEditor) return null;

    const handlePaste = (e) => {
        const pasteData = e.clipboardData.getData('text');
        if (!pasteData) return;

        // Separamos por saltos de línea (filas)
        const filasPasted = pasteData.split(/[\r\n]+/).filter(v => v.trim() !== '');
        
        // Dentro de cada fila, reemplazamos las tabulaciones (columnas de Excel) por " | " para mantener la relación de la fila
        const valores = filasPasted.map(fila => fila.split('\t').map(v => v.trim()).filter(v => v !== '').join(' | '));
        
        // Si el usuario pegó más de un valor, lo interceptamos para ponerlo en múltiples celdas
        if (valores.length > 1) {
            e.preventDefault(); 
            e.stopPropagation();

            let nuevasFilas = [...filasTemp];
            
            // Buscamos la última fila que contenga algún dato para pegar inmediatamente abajo
            const ultimaValida = nuevasFilas.map(f => f.valor.toString().trim() !== '').lastIndexOf(true);
            let startIndex = ultimaValida >= 0 ? ultimaValida + 1 : 0;

            valores.forEach((val) => {
                if (startIndex < nuevasFilas.length) {
                    nuevasFilas[startIndex] = { ...nuevasFilas[startIndex], valor: val };
                } else {
                    nuevasFilas.push({ id: nuevasFilas.length + 1, valor: val, origen: 'agregado' });
                }
                startIndex++;
            });

            setFilasTemp(nuevasFilas);
        }
    };

    // Ajuste dinámico de ancho: si hay más de 2 columnas (matriz), expandimos hasta 900px
    const anchoModal = columns.length > 2 ? `${Math.min(950, 120 + columns.length * 180)}px` : '480px';

    return (
        <div style={overlayStyle} onClick={() => setModalEditor(false)}>
            <div style={{ ...modalBoxStyle, maxWidth: anchoModal, width: '90vw', padding: '30px', transition: 'max-width 0.3s ease' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: '0 0 5px', fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                        {columns.length > 2 ? 'Editor de Matriz' : 'Editor de Espacio Muestral'}
                    </h3>
                    <div style={{ display: 'inline-block', padding: '4px 12px', background: 'var(--bg-body)', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: FS.xs, color: 'var(--text-muted)' }}>
                        Total: <strong>{filasTemp.filter(f => {
                            if (columns.length > 2) {
                                return columns.some(col => col.key !== 'id' && (f[col.key] || '').toString().trim() !== '');
                            }
                            return (f.valor || '').toString().trim() !== '';
                        }).length}</strong> datos detectados
                    </div>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: FS.xs, textAlign: 'center', marginBottom: '15px', lineHeight: '1.4' }}>
                    Ingresa los datos manualmente o edita los existentes.<br />
                    <span style={{ color: 'var(--primary-color)' }}>Doble clic</span> para editar una celda.
                </p>

                <div 
                    onPaste={handlePaste}
                    style={{ height: columns.length > 2 ? '450px' : '380px', border: '1px solid var(--border-color)', borderRadius: RADIUS, overflow: 'hidden', marginBottom: '20px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}
                >
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
    )
}