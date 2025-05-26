// src/components/dynamic-table/TableBodyRenderer.tsx
import React from 'react';
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { flexRender } from "@tanstack/react-table";
import { DraggableRow } from "./DraggableRow"; // Adjust path
import { getLucideIcon } from "./utils"; // Adjust path
import type { TableBodyRendererProps, DataRow } from './types'; // Adjust path

export const TableBodyRenderer = <TData extends DataRow>({
                                                             table,
                                                             config,
                                                             columns, // Pass resolved columns for colSpan
                                                             isLoading,
                                                             data, // Current data for DND items
                                                             getRowId,
                                                             handleDragEnd,
                                                             sensors,
                                                         }: TableBodyRendererProps<TData>) => {
    const LoaderIcon = getLucideIcon("Loader2"); // Or "LoaderIcon"

    if (isLoading && LoaderIcon) {
        return (
            <TableBody>
                <TableRow>
                    <TableCell colSpan={columns.length + (config.features?.rowDnd?.enabled ? 1 : 0)} className="h-24 text-center">
                        <div className="flex items-center justify-center py-10 text-muted-foreground">
                            <LoaderIcon className="mr-2 h-6 w-6 animate-spin" />
                            {config.loadingStateMessage || "Loading data..."}
                        </div>
                    </TableCell>
                </TableRow>
            </TableBody>
        );
    }

    if (!table.getRowModel().rows?.length) {
        return (
            <TableBody>
                <TableRow>
                    <TableCell colSpan={columns.length + (config.features?.rowDnd?.enabled ? 1 : 0)} className="h-24 text-center">
                        {config.emptyStateMessage || "No results found."}
                    </TableCell>
                </TableRow>
            </TableBody>
        );
    }

    const dndEnabled = config.features?.rowDnd?.enabled;
    const tableRows = table.getRowModel().rows.map(row => (
        dndEnabled ? (
            <DraggableRow<TData> key={row.id} row={row} features={config.features}>
                {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} style={{ width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                ))}
            </DraggableRow>
        ) : (
            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} style={{ width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                ))}
            </TableRow>
        )
    ));

    if (dndEnabled) {
        return (
            <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]}>
                <SortableContext items={data.map(item => getRowId(item, 0, undefined))} strategy={verticalListSortingStrategy}>
                    <TableBody>
                        {tableRows}
                    </TableBody>
                </SortableContext>
            </DndContext>
        );
    }

    return <TableBody>{tableRows}</TableBody>;
};