// src/components/resultados/SortableItem.jsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableItem(props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        zIndex: isDragging ? 999 : 'auto',
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'auto',
        // Un pequeño efecto de sombra al levantar la tarjeta
        boxShadow: isDragging ? "0px 10px 20px rgba(0,0,0,0.15)" : "none",
        borderRadius: "8px"
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={`sortable-item ${props.anchoCompleto ? "ancho-completo-wrapper" : ""}`}
            {...attributes} 
            {...listeners}
        >
            {props.children}
        </div>
    );
}