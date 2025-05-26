// src/components/dynamic-table/DraggableRow.tsx
import React from 'react';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableCell, TableRow } from "@/components/ui/table"; // Adjust path as needed
import { getLucideIcon } from "./utils"; // Adjust path
import type { Row } from "@tanstack/react-table";
import type { DataRow, FeaturesConfig } from "./types"; // Adjust path

interface DraggableRowProps<TData extends DataRow> extends React.HTMLAttributes<HTMLTableRowElement> {
    row: Row<TData>;
    features: FeaturesConfig | undefined;
}

export const DraggableRow = <TData extends DataRow>({ row, children, features, ...props }: DraggableRowProps<TData>) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
    const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.8 : 1, zIndex: isDragging ? 1 : 0, position: 'relative' };
    const GripIcon = getLucideIcon("GripVertical"); // Ensure this icon name is correct or use one from your list like "GripVerticalIcon"

    return (
        <TableRow ref={setNodeRef} style={style} {...props} className={`${isDragging ? "shadow-lg" : ""} ${props.className || ""}`} data-state={row.getIsSelected() && "selected"}>
            {features?.rowDnd?.enabled && GripIcon && (
                <TableCell className="w-12 cursor-grab px-2 py-2" {...attributes} {...listeners}>
                    <GripIcon className="h-5 w-5 text-muted-foreground" />
                </TableCell>
            )}
            {children}
        </TableRow>
    );
};