// src/components/dynamic-table/DynamicDataTable.tsx
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
    ColumnDef,
    ColumnFiltersState,
    Row,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    Table as ReactTableInstance,
    CellContext,
} from "@tanstack/react-table";
import { toast } from "sonner";

// Shadcn/ui components (ensure paths are correct)
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

// Custom Sub-components
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTablePagination } from "./DataTablePagination";
import { SheetComponent } from "./SheetComponent";
import { TableBodyRenderer } from "./TableBodyRenderer";
import { getLucideIcon } from "./utils";
import type {
    DynamicDataTableProps, DataRow, ActionConfig, BaseCellConfig, TextCellConfig,
    BadgeCellConfig, IconCellConfig, ChartCellConfig, CustomCellConfig, ActionsCellConfig,
    ColumnConfig
} from "./types";

export function DynamicDataTable<TData extends DataRow>({
                                                            config,
                                                            data: initialDataProp,
                                                            setData: setExternalData,
                                                            isLoading = false,
                                                            callbacks = {},
                                                            customCellRenderers = {},
                                                            className,
                                                        }: DynamicDataTableProps<TData>) {
    const initialData = initialDataProp || [];
    const [internalData, setInternalData] = useState(initialData);

    useEffect(() => {
        if (!setExternalData) {
            setInternalData(initialDataProp || []);
        }
    }, [initialDataProp, setExternalData]);

    const data = setExternalData ? (initialDataProp || []) : internalData;
    const setData = setExternalData || setInternalData;

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState('');

    const [activeSheet, setActiveSheet] = useState<{ sheetId: string; rowData?: TData } | null>(null);
    const [sheetFormData, setSheetFormData] = useState<DataRow>({});
    const sheetFormDataRef = useRef(sheetFormData); // Ref to hold the latest sheet form data for callbacks

    useEffect(() => {
        sheetFormDataRef.current = sheetFormData;
    }, [sheetFormData]);

    const tableRef = useRef<ReactTableInstance<TData> | null>(null);

    const dataKey = useMemo(() => config.dataKey || 'id', [config.dataKey]);
    const getRowId = useCallback((row: TData, index: number, _parent?: Row<TData>) => {
        if (!row) return `row-undefined-${index}`;
        if (typeof dataKey === 'function') {
            return dataKey(row) as string;
        }
        const rowIdValue = row[dataKey as string];
        return rowIdValue !== undefined && rowIdValue !== null ? String(rowIdValue) : `row-${index}`;
    }, [dataKey]);


    const handleAction = useCallback(async (actionConfig: ActionConfig<TData>, rowData?: TData, currentFormData?: DataRow) => {
        if (actionConfig.confirmationRequired) {
            const confirmed = window.confirm(actionConfig.confirmationRequired);
            if (!confirmed) return;
        }

        const currentTableInstance = tableRef.current;
        // Use sheetFormDataRef.current if currentFormData is from a sheet, to ensure latest values
        const formDataForAction = currentFormData === sheetFormDataRef.current ? sheetFormDataRef.current : currentFormData;
        const paramsForCallback = { rowData, formData: formDataForAction, allRows: data, actionParams: actionConfig.actionParams, table: currentTableInstance };


        switch (actionConfig.actionType) {
            case "toast":
                toast(actionConfig.actionParams?.message || "Action executed", {
                    description: actionConfig.actionParams?.description,
                    action: actionConfig.actionParams?.toastAction ? {
                        label: actionConfig.actionParams.toastAction.label,
                        onClick: () => handleAction(actionConfig.actionParams.toastAction.action, rowData, formDataForAction),
                    } : undefined,
                });
                break;
            case "openSheet":
                const sheetIdToOpen = actionConfig.actionParams?.sheetId;
                const sheetDef = config.sheetDefinitions?.find(s => s.id === sheetIdToOpen);
                if (sheetDef) {
                    let initialSheetData: DataRow = {};
                    if (rowData && sheetDef.form) {
                        sheetDef.form.fields.forEach(field => {
                            if (field.defaultValuePath && (rowData as any)[field.defaultValuePath] !== undefined) {
                                initialSheetData[field.name] = (rowData as any)[field.defaultValuePath];
                            } else if (field.fieldType === 'switch') {
                                initialSheetData[field.name] = false;
                            } else {
                                // initialSheetData[field.name] = ''; // Or handle other defaults
                            }
                        });
                    }
                    // Reset form data for the new sheet
                    setSheetFormData(initialSheetData);
                    sheetFormDataRef.current = initialSheetData; // Also update ref
                    setActiveSheet({ sheetId: sheetIdToOpen, rowData });
                } else {
                    console.warn(`Sheet definition with id "${sheetIdToOpen}" not found.`);
                    toast.error(`Error: Sheet definition "${sheetIdToOpen}" not found.`);
                }
                break;
            case "callback":
                const callbackId = actionConfig.actionParams?.callbackId;
                if (callbackId && callbacks[callbackId]) {
                    try {
                        await callbacks[callbackId](paramsForCallback);
                    } catch (error) {
                        console.error(`Error in callback ${callbackId}:`, error);
                        toast.error(`Error executing action: ${ (error as Error).message }`);
                    }
                } else {
                    console.warn(`Callback with id "${callbackId}" not found.`);
                    toast.error(`Error: Callback "${callbackId}" not found.`);
                }
                break;
            case "apiCall":
                const { url, method, bodyTemplate } = actionConfig.actionParams || {};
                if (!url || !method) {
                    toast.error("API call configuration incomplete.");
                    return;
                }
                let body;
                const dataSourceForTemplate = formDataForAction || rowData || {};
                if (bodyTemplate && typeof bodyTemplate === 'string') {
                    try {
                        body = JSON.parse(
                            bodyTemplate.replace(/\{\{(.*?)\}\}/g, (_: any, key: string) => {
                                const K = key.trim();
                                const value = (dataSourceForTemplate as any)[K];
                                return value !== undefined ? JSON.stringify(value) : 'null';
                            })
                        );
                    } catch (e) {
                        console.error("Error parsing bodyTemplate:", e);
                        toast.error("Error processing request body template.");
                        return;
                    }
                } else if (formDataForAction) {
                    body = formDataForAction;
                }

                try {
                    toast.loading("Processing request...");
                    const response = await fetch(url, {
                        method,
                        headers: { "Content-Type": "application/json" },
                        body: body ? JSON.stringify(body) : undefined,
                    });
                    // Dismiss loading toast regardless of outcome before showing new toast
                    toast.dismiss(); // Assuming you have a loading toast ID system or dismiss all
                    // If sonner auto-dismisses loading on new toast, this might not be needed.

                    const responseData = await response.json().catch(() => ({ message: response.statusText || "Empty or non-JSON response" }));

                    if (!response.ok) {
                        throw new Error(responseData.message || `Error ${response.status}`);
                    }
                    toast.success(responseData.message || "Operation successful.");
                    if (actionConfig.actionParams?.onSuccessCallbackId && callbacks[actionConfig.actionParams.onSuccessCallbackId]) {
                        callbacks[actionConfig.actionParams.onSuccessCallbackId]({ ...paramsForCallback, actionParams: responseData });
                    }
                    // Close sheet only if the action was successful and not explicitly told to stay open
                    if (activeSheet && actionConfig.actionParams?.closeSheetOnSuccess !== false) {
                        setActiveSheet(null);
                    }
                } catch (error) {
                    toast.dismiss(); // Ensure loading is dismissed on error too
                    console.error("Error in API call:", error);
                    toast.error(`API Error: ${(error as Error).message}`);
                }
                break;
            default:
                console.warn("Unknown action type:", (actionConfig as any).actionType);
        }
    }, [callbacks, config.sheetDefinitions, data, activeSheet, config.tableId]); // Added config.tableId dependency

    const columns = useMemo<ColumnDef<TData>[]>(() => {
        const generatedColumns: ColumnDef<TData>[] = [];

        if (config.features?.rowSelection?.enabled) {
            generatedColumns.push({
                id: "select",
                header: ({ table: colTable }) => (
                    <Checkbox
                        checked={colTable.getIsAllPageRowsSelected() || (colTable.getIsSomePageRowsSelected() && "indeterminate")}
                        onCheckedChange={(value) => colTable.toggleAllPageRowsSelected(!!value)}
                        aria-label="Select all rows on current page"
                        className="translate-y-[2px]"
                    />
                ),
                cell: ({ row: cellRow }) => (
                    <Checkbox
                        checked={cellRow.getIsSelected()}
                        onCheckedChange={(value) => cellRow.toggleSelected(!!value)}
                        aria-label="Select row"
                        className="translate-y-[2px]"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
                size: 40,
            });
        }

        config.columns.forEach((colConfig: ColumnConfig<TData>) => { // Explicitly type colConfig
            const columnDef: ColumnDef<TData> = {
                id: colConfig.id,
                accessorKey: colConfig.accessorKey,
                header: () => colConfig.header,
                cell: (cellContext: CellContext<TData, any>) => {
                    const cellValue = cellContext.getValue();
                    const rowData = cellContext.row.original;
                    const cellConf = colConfig.cellConfig || ({} as BaseCellConfig<TData>);

                    let cellClassName = cellConf.className || "";
                    if (cellConf.styleRules) {
                        for (const rule of cellConf.styleRules) {
                            if (rule.condition(cellValue, rowData)) {
                                cellClassName += ` ${rule.className}`;
                                break;
                            }
                        }
                    }
                    const commonCellProps = { className: cellClassName };

                    switch (colConfig.cellType) {
                        case "text":
                            const textConf = cellConf as TextCellConfig<TData>;
                            let displayValue = cellValue === null || cellValue === undefined ? "" : String(cellValue);
                            if (textConf.truncate && displayValue.length > (textConf.maxLength || 50)) {
                                displayValue = displayValue.substring(0, textConf.maxLength || 50) + "...";
                            }
                            return <div {...commonCellProps}>{textConf.prefix}{displayValue}{textConf.suffix}</div>;
                        case "badge":
                            const badgeConf = cellConf as BadgeCellConfig<TData>;
                            let variant: any = badgeConf.staticVariant || "default";
                            if (badgeConf.variantMapping && badgeConf.variantMapping[String(cellValue)] !== undefined) {
                                variant = badgeConf.variantMapping[String(cellValue)];
                            }
                            return <Badge {...commonCellProps} variant={variant}>{String(cellValue)}</Badge>;
                        case "icon":
                            const iconConf = cellConf as IconCellConfig<TData>;
                            let iconName = iconConf.staticIcon;
                            if (iconConf.iconMapping && iconConf.iconMapping[String(cellValue)] !== undefined) {
                                iconName = iconConf.iconMapping[String(cellValue)];
                            }
                            const Icon = getLucideIcon(iconName as string);
                            return Icon ? <Icon {...commonCellProps} className={`${commonCellProps.className || ''} h-5 w-5`} style={{ color: iconConf.iconColor }} /> : null;
                        case "chart":
                            const chartConf = cellConf as ChartCellConfig<TData>;
                            const chartData = rowData[chartConf.dataKey] as any[];
                            if (chartConf.chartType === "area" && Array.isArray(chartData)) {
                                return (
                                    <div {...commonCellProps} style={{ height: chartConf.height || 75, width: '100%' }}>
                                        <ResponsiveContainer>
                                            <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                                                <Area
                                                    type="monotone"
                                                    dataKey={chartConf.areaDataKey}
                                                    stroke={chartConf.strokeColor || "#8884d8"}
                                                    fill={chartConf.fillColor || "#8884d8"}
                                                    fillOpacity={0.3}
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                );
                            }
                            return <div {...commonCellProps}>Invalid chart data</div>;
                        case "custom":
                            const customConf = cellConf as CustomCellConfig<TData>;
                            const CustomRenderer = customCellRenderers[customConf.rendererKey];
                            return CustomRenderer ? (
                                <CustomRenderer
                                    value={cellValue}
                                    row={cellContext.row}
                                    column={colConfig}
                                    config={config}
                                    table={cellContext.table}
                                    {...customConf.props} // Spread additional props from cellConfig
                                />
                            ) : (
                                <span className="text-red-500">Renderer '{customConf.rendererKey}' not found</span>
                            );
                        case "actions":
                            const actionsConf = cellConf as ActionsCellConfig<TData>;
                            const actionsToRender = actionsConf.actions;
                            const MoreIcon = getLucideIcon(actionsConf.dropdownTriggerIcon || "MoreHorizontal" as string);

                            if (actionsConf.displayType === "inline") {
                                return (
                                    <div {...commonCellProps} className={`flex space-x-1 items-center ${commonCellProps.className || ''}`}>
                                        {actionsToRender.map(act => {
                                            const ActionIcon = getLucideIcon(act.icon as string);
                                            return (
                                                <Button
                                                    key={act.id}
                                                    variant={act.variant || "ghost"}
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); handleAction(act, rowData);}}
                                                    className="h-8 px-2"
                                                >
                                                    {ActionIcon && <ActionIcon className={`h-4 w-4 ${act.label ? "mr-1" : ""}`} />}
                                                    {act.label}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                );
                            }
                            return (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0" {...commonCellProps} onClick={(e) => e.stopPropagation()}>
                                            <span className="sr-only">Open menu</span>
                                            {MoreIcon && <MoreIcon className="h-4 w-4" />}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>{colConfig.header || "Actions"}</DropdownMenuLabel>
                                        {actionsToRender.map(act => {
                                            const ActionIcon = getLucideIcon(act.icon as string);
                                            return (
                                                <DropdownMenuItem
                                                    key={act.id}
                                                    onClick={() => handleAction(act, rowData)}
                                                    className={act.variant === "destructive" ? "text-red-500 focus:text-red-500 focus:bg-red-50" : ""}
                                                >
                                                    {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
                                                    {act.label}
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            );
                        default:
                            return <div {...commonCellProps}>{String(cellValue)}</div>;
                    }
                },
                enableSorting: colConfig.enableSorting ?? config.features?.sorting?.enabled ?? true,
                enableHiding: colConfig.enableHiding ?? config.features?.columnVisibility ?? true,
                size: colConfig.size,
                meta: colConfig.meta,
            };
            generatedColumns.push(columnDef);
        });

        if (config.rowActions?.length && !config.columns.find(c => c.cellType === 'actions' && c.id === 'row-actions-global')) {
            const MoreIconDefault = getLucideIcon("MoreHorizontal" as string);
            generatedColumns.push({
                id: 'row-actions-global', // Ensure this ID is unique
                header: () => 'Actions',
                cell: ({ row: cellRow }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                <span className="sr-only">Open row actions menu</span>
                                {MoreIconDefault && <MoreIconDefault className="h-4 w-4" />}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {config.rowActions!.map(act => {
                                const ActionIcon = getLucideIcon(act.icon as string);
                                return (
                                    <DropdownMenuItem
                                        key={act.id}
                                        onClick={() => handleAction(act, cellRow.original)}
                                        className={act.variant === "destructive" ? "text-red-500 focus:text-red-500 focus:bg-red-50" : ""}
                                    >
                                        {ActionIcon && <ActionIcon className="mr-2 h-4 w-4" />}
                                        {act.label}
                                    </DropdownMenuItem>
                                );
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
                enableSorting: false,
                enableHiding: false, // Usually, row actions column is not hidden
                size: 80,
            });
        }
        return generatedColumns;
    }, [config, customCellRenderers, handleAction]); // Removed 'data' from dependencies as it's not directly used for column structure


    const table = useReactTable({
        data,
        columns,
        getRowId,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        enableRowSelection: config.features?.rowSelection?.enabled ?? false,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(), // For potential future column-specific filters
        getFacetedUniqueValues: getFacetedUniqueValues(), // For potential future column-specific filters
        manualPagination: false, // Set to true if server-side pagination
        debugTable: false,
    });

    useEffect(() => {
        tableRef.current = table;
    }, [table]);

    useEffect(() => {
        if (config.features?.pagination?.initialPageSize && tableRef.current) {
            tableRef.current.setPageSize(config.features.pagination.initialPageSize);
        }
        // Set initial column visibility based on config
        const initialVisibility: VisibilityState = {};
        config.columns.forEach(col => {
            if (col.enableHiding === false) { // Or some other property like "initiallyVisible: false"
                // This logic might need refinement based on how you want to define initial visibility
            }
        });
        if (Object.keys(initialVisibility).length > 0) {
            setColumnVisibility(initialVisibility);
        }

    }, [config.features?.pagination?.initialPageSize, config.columns]);


    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }), // Add activation constraint
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }), // Add activation constraint
        useSensor(KeyboardSensor, {})
    );

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setData((currentData) => {
                const oldIndex = currentData.findIndex(item => getRowId(item, 0, undefined) === active.id);
                const newIndex = currentData.findIndex(item => getRowId(item, 0, undefined) === over.id);
                if (oldIndex === -1 || newIndex === -1) return currentData; // Should not happen if IDs are correct

                const newData = arrayMove(currentData, oldIndex, newIndex);

                const dndConfig = config.features?.rowDnd;
                if (dndConfig?.onOrderChangeActionId && callbacks[dndConfig.onOrderChangeActionId]) {
                    callbacks[dndConfig.onOrderChangeActionId]({ allRows: newData, actionParams: { activeId: active.id, overId: over.id, oldIndex, newIndex }, table: tableRef.current });
                } else if (dndConfig?.onOrderChangeActionId) {
                    console.warn(`Callback for DND onOrderChangeActionId "${dndConfig.onOrderChangeActionId}" not found.`);
                }
                return newData;
            });
        }
    }, [setData, getRowId, config.features?.rowDnd, callbacks, tableRef]);


    return (
        <div className={`space-y-4 ${className || ''}`}>
            {config.title && <h2 className="text-2xl font-semibold">{config.title}</h2>}

            <DataTableToolbar
                config={config}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter}
                table={tableRef.current}
                handleAction={handleAction}
            />

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {tableRef.current?.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {config.features?.rowDnd?.enabled && <TableHead className="w-12 px-2 py-2"></TableHead>}
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    {/* TableBody is now rendered by TableBodyRenderer */}
                    <TableBodyRenderer
                        table={table} // Pass the live table instance
                        config={config}
                        columns={columns} // Pass the generated columns for colSpan calculation
                        isLoading={isLoading}
                        data={data} // Pass current data for DND items
                        getRowId={getRowId}
                        handleDragEnd={handleDragEnd}
                        sensors={sensors}
                    />
                </Table>
            </div>

            <DataTablePagination config={config} table={tableRef.current} />

            <SheetComponent
                config={config}
                activeSheet={activeSheet}
                setActiveSheet={setActiveSheet}
                sheetFormData={sheetFormData}
                setSheetFormData={setSheetFormData}
                handleAction={handleAction}
                sheetFormDataRef={sheetFormDataRef}
            />
        </div>
    );
}