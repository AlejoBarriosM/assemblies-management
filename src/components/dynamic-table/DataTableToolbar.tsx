// src/components/dynamic-table/DataTableToolbar.tsx
import React from "react";
import { Button } from "@/components/ui/button"; // Adjust path
import { Input } from "@/components/ui/input"; // Adjust path
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"; // Adjust path
import { getLucideIcon } from "./utils"; // Adjust path
import type { DataTableToolbarProps, DataRow } from "./types"; // Adjust path

export const DataTableToolbar = <TData extends DataRow>({
                                                            config,
                                                            globalFilter,
                                                            setGlobalFilter,
                                                            table,
                                                            handleAction,
                                                        }: DataTableToolbarProps<TData>) => {
    const ColumnsIcon = getLucideIcon("Columns"); // Use "Columns" or "ColumnsIcon" as per your Lucide export

    return (
        <div className="flex items-center justify-between py-4">
            <div className="flex flex-1 items-center space-x-2">
                {config.features?.filtering?.enabled && (
                    <Input
                        placeholder={config.features.filtering.globalFilterPlaceholder || "Filter all..."}
                        value={globalFilter ?? ""}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="h-8 w-[150px] lg:w-[250px]"
                    />
                )}
            </div>
            <div className="flex items-center space-x-2">
                {config.globalActions?.map(action => {
                    const ActionIcon = getLucideIcon(action.icon as string);
                    return (
                        <Button
                            key={action.id}
                            variant={action.variant || "default"}
                            size="sm"
                            onClick={() => handleAction(action, undefined, {})}
                            className="h-8"
                        >
                            {ActionIcon && <ActionIcon className={`mr-2 h-4 w-4`} />}
                            {action.label}
                        </Button>
                    );
                })}
                {config.features?.columnVisibility && ColumnsIcon && table && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
                                <ColumnsIcon className="mr-2 h-4 w-4" />
                                Columns
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[150px]">
                            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {table
                                .getAllColumns()
                                .filter(
                                    (column) =>
                                        typeof column.accessorFn !== "undefined" && column.getCanHide()
                                )
                                .map((column) => {
                                    const colDef = config.columns.find(c => c.id === column.id || c.accessorKey === column.id);
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {colDef?.header || column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
};