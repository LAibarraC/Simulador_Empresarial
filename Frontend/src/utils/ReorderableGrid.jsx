// src/components/resultados/ReorderableGrid.jsx
import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';

export default function ReorderableGrid({ items }) {
    const [gridItems, setGridItems] = useState(items);

    // Si los datos cambian (ej. el usuario calcula otra cosa), actualizamos el grid
    useEffect(() => {
        setGridItems(items);
    }, [items]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setGridItems((currentItems) => {
                const oldIndex = currentItems.findIndex(i => i.id === active.id);
                const newIndex = currentItems.findIndex(i => i.id === over.id);
                return arrayMove(currentItems, oldIndex, newIndex);
            });
        }
    };

    return (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={gridItems.map(i => i.id)} strategy={rectSortingStrategy}>
                <div className="graficos-grid">
                    {gridItems.map((item) => (
                        <SortableItem key={item.id} id={item.id}>
                            {/* Aquí se renderiza la tarjeta del gráfico que enviaste */}
                            {item.content}
                        </SortableItem>
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}