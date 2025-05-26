import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import * as LucideIcons from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts"; // Removed unused CartesianGrid, XAxis, YAxis, RechartsTooltip
import { toast } from "sonner";

// Shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"; // Removed SheetTrigger as it's used via Button
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

// Helper para obtener iconos de Lucide dinámicamente
const getLucideIcon = (iconName?: string): React.ElementType | null => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent || null;
};

// --- TIPOS (sin cambios respecto a la versión anterior con onValueChangeAction) ---
export type DataRow = Record<string, any>;

export interface ActionConfig<TData extends DataRow = DataRow> {
    id: string;
    label: string;
    icon?: keyof typeof LucideIcons;
    actionType: "toast" | "openSheet" | "callback" | "apiCall";
    actionParams?: any;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    confirmationRequired?: string;
}

export interface ColumnActionConfig<TData extends DataRow = DataRow> extends ActionConfig<TData> {}

export interface CellStyleRule<TData extends DataRow = DataRow> {
    condition: (value: any, row: TData) => boolean;
    className: string;
}

export interface BaseCellConfig<TData extends DataRow = DataRow> {
    className?: string;
    styleRules?: CellStyleRule<TData>[];
}

export interface TextCellConfig<TData extends DataRow = DataRow> extends BaseCellConfig<TData> {
    prefix?: string;
    suffix?: string;
    truncate?: boolean;
    maxLength?: number;
}

export interface BadgeCellConfig<TData extends DataRow = DataRow> extends BaseCellConfig<TData> {
    variantMapping?: Record<string, "default" | "secondary" | "destructive" | "outline" | string>;
    staticVariant?: "default" | "secondary" | "destructive" | "outline" | string;
}

export interface IconCellConfig<TData extends DataRow = DataRow> extends BaseCellConfig<TData> {
    iconMapping?: Record<string, keyof typeof LucideIcons>;
    staticIcon?: keyof typeof LucideIcons;
    iconColor?: string;
}

export interface ChartCellConfig<TData extends DataRow = DataRow> extends BaseCellConfig<TData> {
    chartType: "area";
    dataKey: string;
    xAxisDataKey: string;
    areaDataKey: string;
    strokeColor?: string;
    fillColor?: string;
    height?: number;
}

export interface CustomCellConfig<TData extends DataRow = DataRow> extends BaseCellConfig<TData> {
    rendererKey: string;
    props?: Record<string, any>;
}

export interface ActionsCellConfig<TData extends DataRow = DataRow> extends BaseCellConfig<TData> {
    actions: ColumnActionConfig<TData>[];
    displayType?: "dropdown" | "inline";
    dropdownTriggerIcon?: keyof typeof LucideIcons;
}

export type CellConfig<TData extends DataRow = DataRow> =
    | TextCellConfig<TData>
    | BadgeCellConfig<TData>
    | IconCellConfig<TData>
    | ChartCellConfig<TData>
    | CustomCellConfig<TData>
    | ActionsCellConfig<TData>;

export interface ColumnConfig<TData extends DataRow = DataRow> {
    id: string;
    accessorKey: string;
    header: string;
    cellType: "text" | "badge" | "icon" | "chart" | "custom" | "actions" | "checkbox";
    cellConfig?: CellConfig<TData>;
    enableSorting?: boolean;
    enableFiltering?: boolean;
    enableHiding?: boolean;
    size?: number;
    meta?: any;
}

export interface PaginationConfig {
    enabled: boolean;
    initialPageSize?: number;
    availablePageSizes?: number[];
}

export interface SortingConfig {
    enabled: boolean;
}

export interface FilteringConfig {
    enabled: boolean;
    globalFilterPlaceholder?: string;
    columnFiltersEnabled?: boolean;
}

export interface RowSelectionConfig {
    enabled: boolean;
    type: "single" | "multiple";
}

export interface RowDndConfig {
    enabled: boolean;
    onOrderChangeActionId?: string;
}

export interface FeaturesConfig {
    pagination?: PaginationConfig;
    sorting?: SortingConfig;
    filtering?: FilteringConfig;
    rowSelection?: RowSelectionConfig;
    columnVisibility?: boolean;
    rowDnd?: RowDndConfig;
}

export interface FormFieldConfig<TData extends DataRow = DataRow> {
    name: string;
    label: string;
    fieldType: "text" | "number" | "select" | "textarea" | "switch" | "date";
    placeholder?: string;
    defaultValuePath?: string;
    options?: Array<{ value: string | number; label: string }>;
    optionsPath?: string;
    validation?: {
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        pattern?: string;
        min?: number;
        max?: number;
    };
    className?: string;
    disabled?: boolean | ((formData: DataRow, rowData?: TData) => boolean);
    condition?: (formData: DataRow, rowData?: TData) => boolean;
    onValueChangeAction?: Pick<ActionConfig<TData>, "actionType" | "actionParams"> & { idSuffix?: string };
}

export interface FormConfig<TData extends DataRow = DataRow> {
    fields: FormFieldConfig<TData>[];
    layoutColumns?: 1 | 2;
}

export interface SheetDefinition<TData extends DataRow = DataRow> {
    id: string;
    triggerActionId: string;
    title: string | ((rowData?: TData) => string);
    description?: string | ((rowData?: TData) => string);
    form?: FormConfig<TData>;
    submitActionId?: string;
    cancelActionLabel?: string;
    submitActionLabel?: string;
    size?: "default" | "sm" | "lg" | "xl" | "full";
}

export interface DynamicTableConfig<TData extends DataRow = DataRow> {
    tableId: string;
    title?: string;
    dataKey?: keyof TData | ((row: TData) => UniqueIdentifier);
    columns: ColumnConfig<TData>[];
    features?: FeaturesConfig;
    globalActions?: ActionConfig<TData>[];
    rowActions?: ActionConfig<TData>[];
    sheetDefinitions?: SheetDefinition<TData>[];
    emptyStateMessage?: string;
    loadingStateMessage?: string;
}

export interface CellRendererProps<TData extends DataRow = DataRow> {
    value: any;
    row: Row<TData>;
    column: ColumnConfig<TData>;
    config: DynamicTableConfig<TData>;
    table: ReactTableInstance<TData>;
}

export interface DynamicDataTableProps<TData extends DataRow = DataRow> {
    config: DynamicTableConfig<TData>;
    data: TData[];
    setData?: React.Dispatch<React.SetStateAction<TData[]>>;
    isLoading?: boolean;
    callbacks?: Record<string, (params: { rowData?: TData; formData?: DataRow; allRows?: TData[]; actionParams?: any; table?: ReactTableInstance<TData> | null }) => void | Promise<void>>;
    customCellRenderers?: Record<string, React.FC<CellRendererProps<TData>>>;
    className?: string;
}

// --- COMPONENTE DRAGGABLE ROW (sin cambios) ---
interface DraggableRowProps<TData extends DataRow> extends React.HTMLAttributes<HTMLTableRowElement> {
    row: Row<TData>;
    features: FeaturesConfig | undefined;
}
const DraggableRow = <TData extends DataRow>({ row, children, features, ...props }: DraggableRowProps<TData>) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
    const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.8 : 1, zIndex: isDragging ? 1 : 0, position: 'relative' };
    const GripIcon = getLucideIcon("GripVerticalIcon");
    return (
        <TableRow ref={setNodeRef} style={style} {...props} className={`${isDragging ? "shadow-lg" : ""} ${props.className || ""}`} data-state={row.getIsSelected() && "selected"}>
            {features?.rowDnd?.enabled && GripIcon && (<TableCell className="w-12 cursor-grab px-2 py-2" {...attributes} {...listeners}><GripIcon className="h-5 w-5 text-muted-foreground" /></TableCell>)}
            {children}
        </TableRow>
    );
};


// --- COMPONENTES DE UI INTERNOS (Toolbar, Pagination) ---
// Estos se definen fuera de DynamicDataTable para estabilidad de referencia del componente.

interface DataTableToolbarProps<TData extends DataRow> {
    config: DynamicTableConfig<TData>;
    globalFilter: string;
    setGlobalFilter: (filter: string) => void;
    table: ReactTableInstance<TData> | null; // Ahora table es ReactTableInstance<TData> | null
    handleAction: (actionConfig: ActionConfig<TData>, rowData?: TData, currentFormData?: DataRow) => Promise<void>;
}

const DataTableToolbarComponent = <TData extends DataRow>({
                                                              config,
                                                              globalFilter,
                                                              setGlobalFilter,
                                                              table,
                                                              handleAction,
                                                          }: DataTableToolbarProps<TData>) => {
    const ColumnsIcon = getLucideIcon("ColumnsIcon" as string);

    return (
        <div className="flex items-center justify-between py-4">
            <div className="flex flex-1 items-center space-x-2">
                {config.features?.filtering?.enabled && (
                    <Input
                        placeholder={config.features.filtering.globalFilterPlaceholder || "Filtrar todo..."}
                        value={globalFilter ?? ""}
                        onChange={(event) => setGlobalFilter(event.target.value)} // setGlobalFilter viene de useReactTable y es estable
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
                                Columnas
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[150px]">
                            <DropdownMenuLabel>Alternar columnas</DropdownMenuLabel>
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
const DataTableToolbar = React.memo(DataTableToolbarComponent) as typeof DataTableToolbarComponent;


interface DataTablePaginationProps<TData extends DataRow> {
    config: DynamicTableConfig<TData>;
    table: ReactTableInstance<TData> | null; // Ahora table es ReactTableInstance<TData> | null
}
const DataTablePaginationComponent = <TData extends DataRow>({
                                                                 config,
                                                                 table,
                                                             }: DataTablePaginationProps<TData>) => {
    if (!config.features?.pagination?.enabled || !table) return null;

    const ChevronLeft = getLucideIcon("ChevronLeftIcon" as string);
    const ChevronRight = getLucideIcon("ChevronRightIcon" as string);
    const ChevronsLeft = getLucideIcon("ChevronsLeftIcon" as string);
    const ChevronsRight = getLucideIcon("ChevronsRightIcon" as string);

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} de{" "}
                {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
                {config.features.pagination.availablePageSizes && (
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Filas por página</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value));
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {config.features.pagination.availablePageSizes.map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Página {table.getState().pagination.pageIndex + 1} de{" "}
                    {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                    {ChevronsLeft && <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><span className="sr-only">Ir a primera página</span><ChevronsLeft className="h-4 w-4" /></Button>}
                    {ChevronLeft && <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><span className="sr-only">Ir a página anterior</span><ChevronLeft className="h-4 w-4" /></Button>}
                    {ChevronRight && <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><span className="sr-only">Ir a página siguiente</span><ChevronRight className="h-4 w-4" /></Button>}
                    {ChevronsRight && <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><span className="sr-only">Ir a última página</span><ChevronsRight className="h-4 w-4" /></Button>}
                </div>
            </div>
        </div>
    );
};
const DataTablePagination = React.memo(DataTablePaginationComponent) as typeof DataTablePaginationComponent;


// --- COMPONENTE PRINCIPAL DynamicDataTable ---
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
    const [globalFilter, setGlobalFilter] = useState(''); // El estado del filtro global

    const [activeSheet, setActiveSheet] = useState<{ sheetId: string; rowData?: TData } | null>(null);
    const [sheetFormData, setSheetFormData] = useState<DataRow>({});
    const sheetFormDataRef = useRef(sheetFormData);
    useEffect(() => {
        sheetFormDataRef.current = sheetFormData;
    }, [sheetFormData]);

    const tableRef = useRef<ReactTableInstance<TData> | null>(null);

    const dataKey = useMemo(() => config.dataKey || 'id', [config.dataKey]);
    const getRowId = useCallback((row: TData, index: number, _parent?: Row<TData>) => { // _parent no se usa
        if (!row) return `row-undefined-${index}`;
        if (typeof dataKey === 'function') {
            return dataKey(row) as string;
        }
        return row[dataKey as string] as string || `row-${index}`;
    }, [dataKey]);

    const handleAction = useCallback(async (actionConfig: ActionConfig<TData>, rowData?: TData, currentFormData?: DataRow) => {
        if (actionConfig.confirmationRequired) {
            const confirmed = window.confirm(actionConfig.confirmationRequired);
            if (!confirmed) return;
        }

        const currentTableInstance = tableRef.current;
        const paramsForCallback = { rowData, formData: currentFormData, allRows: data, actionParams: actionConfig.actionParams, table: currentTableInstance };

        switch (actionConfig.actionType) {
            case "toast":
                toast(actionConfig.actionParams?.message || "Acción ejecutada", {
                    description: actionConfig.actionParams?.description,
                    action: actionConfig.actionParams?.toastAction ? {
                        label: actionConfig.actionParams.toastAction.label,
                        onClick: () => handleAction(actionConfig.actionParams.toastAction.action, rowData, currentFormData),
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
                            } else {
                                switch (field.fieldType) {
                                    case 'switch': initialSheetData[field.name] = false; break;
                                    default: initialSheetData[field.name] = '';
                                }
                            }
                        });
                    }
                    setSheetFormData(initialSheetData);
                    setActiveSheet({ sheetId: sheetIdToOpen, rowData });
                } else {
                    console.warn(`Sheet definition with id "${sheetIdToOpen}" not found.`);
                    toast.error(`Error: Hoja de datos "${sheetIdToOpen}" no encontrada.`);
                }
                break;
            case "callback":
                const callbackId = actionConfig.actionParams?.callbackId;
                if (callbackId && callbacks[callbackId]) {
                    try {
                        await callbacks[callbackId](paramsForCallback);
                    } catch (error) {
                        console.error(`Error en callback ${callbackId}:`, error);
                        toast.error(`Error al ejecutar la acción: ${ (error as Error).message }`);
                    }
                } else {
                    console.warn(`Callback with id "${callbackId}" not found.`);
                    toast.error(`Error: Callback "${callbackId}" no encontrado.`);
                }
                break;
            case "apiCall":
                const { url, method, bodyTemplate } = actionConfig.actionParams || {};
                if (!url || !method) {
                    toast.error("Configuración de API call incompleta.");
                    return;
                }
                let body;
                const dataSourceForTemplate = currentFormData || rowData || {};
                if (bodyTemplate) {
                    try {
                        body = JSON.parse(
                            bodyTemplate.replace(/\{\{(.*?)\}\}/g, (_: any, key: string) => {
                                const K = key.trim();
                                return dataSourceForTemplate[K] !== undefined ? JSON.stringify(dataSourceForTemplate[K]) : 'null';
                            })
                        );
                    } catch (e) {
                        console.error("Error parsing bodyTemplate:", e);
                        toast.error("Error al procesar plantilla del cuerpo de la petición.");
                        return;
                    }
                } else if (currentFormData) {
                    body = currentFormData;
                }

                try {
                    toast.loading("Procesando petición...");
                    const response = await fetch(url, {
                        method,
                        headers: { "Content-Type": "application/json" },
                        body: body ? JSON.stringify(body) : undefined,
                    });
                    toast.dismiss();
                    const responseData = await response.json().catch(() => ({ message: "Respuesta no es JSON o está vacía" }));

                    if (!response.ok) {
                        throw new Error(responseData.message || `Error ${response.status}`);
                    }
                    toast.success(responseData.message || "Operación exitosa.");
                    if (actionConfig.actionParams?.onSuccessCallbackId && callbacks[actionConfig.actionParams.onSuccessCallbackId]) {
                        callbacks[actionConfig.actionParams.onSuccessCallbackId]({ ...paramsForCallback, actionParams: responseData });
                    }
                    if (activeSheet && actionConfig.actionParams?.closeSheetOnSuccess !== false) setActiveSheet(null);
                } catch (error) {
                    toast.dismiss();
                    console.error("Error en API call:", error);
                    toast.error(`Error en API: ${(error as Error).message}`);
                }
                break;
            default:
                console.warn("Tipo de acción desconocido:", actionConfig.actionType);
        }
    }, [callbacks, config.sheetDefinitions, data, activeSheet]);

    const columns = useMemo<ColumnDef<TData>[]>(() => {
        const generatedColumns: ColumnDef<TData>[] = [];

        if (config.features?.rowSelection?.enabled) {
            generatedColumns.push({
                id: "select",
                header: ({ table: colTable }) => ( // Renombrar 'table' para evitar conflicto de alcance
                    <Checkbox
                        checked={
                            colTable.getIsAllPageRowsSelected() ||
                            (colTable.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) => colTable.toggleAllPageRowsSelected(!!value)}
                        aria-label="Seleccionar todas las filas"
                        className="translate-y-[2px]"
                    />
                ),
                cell: ({ row: cellRow }) => ( // Renombrar 'row'
                    <Checkbox
                        checked={cellRow.getIsSelected()}
                        onCheckedChange={(value) => cellRow.toggleSelected(!!value)}
                        aria-label="Seleccionar fila"
                        className="translate-y-[2px]"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
                size: 40,
            });
        }

        config.columns.forEach((colConfig) => {
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
                            if (badgeConf.variantMapping && badgeConf.variantMapping[cellValue] !== undefined) {
                                variant = badgeConf.variantMapping[cellValue];
                            }
                            return <Badge {...commonCellProps} variant={variant}>{String(cellValue)}</Badge>;
                        case "icon":
                            const iconConf = cellConf as IconCellConfig<TData>;
                            let iconName: keyof typeof LucideIcons | undefined = iconConf.staticIcon;
                            if (iconConf.iconMapping && iconConf.iconMapping[cellValue] !== undefined) {
                                iconName = iconConf.iconMapping[cellValue];
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
                            return null;
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
                                    {...customConf.props}
                                />
                            ) : (
                                <span className="text-red-500">Renderizador '{customConf.rendererKey}' no encontrado</span>
                            );
                        case "actions":
                            const actionsConf = cellConf as ActionsCellConfig<TData>;
                            const actionsToRender = actionsConf.actions;
                            const MoreIcon = getLucideIcon(actionsConf.dropdownTriggerIcon || "MoreHorizontalIcon" as string);

                            if (actionsConf.displayType === "inline") {
                                return (
                                    <div {...commonCellProps} className={`flex space-x-1 ${commonCellProps.className || ''}`}>
                                        {actionsToRender.map(act => {
                                            const ActionIcon = getLucideIcon(act.icon as string);
                                            return (
                                                <Button
                                                    key={act.id}
                                                    variant={act.variant || "ghost"}
                                                    size="sm"
                                                    onClick={() => handleAction(act, rowData)}
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
                                        <Button variant="ghost" className="h-8 w-8 p-0"  {...commonCellProps}>
                                            <span className="sr-only">Abrir menú</span>
                                            {MoreIcon && <MoreIcon className="h-4 w-4" />}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>{colConfig.header || "Acciones"}</DropdownMenuLabel>
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

        if (config.rowActions?.length && !config.columns.find(c => c.cellType === 'actions')) {
            const MoreIcon = getLucideIcon("MoreHorizontalIcon" as string);
            generatedColumns.push({
                id: 'row-actions-global',
                header: () => 'Acciones',
                cell: ({ row: cellRow }) => ( // Renombrar 'row'
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Abrir menú</span>
                                {MoreIcon && <MoreIcon className="h-4 w-4" />}
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
                enableHiding: false,
                size: 80,
            });
        }

        return generatedColumns;
    }, [config, customCellRenderers, handleAction]);


    const table = useReactTable({
        data,
        columns,
        getRowId,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter, // El estado del filtro global se pasa a la tabla
        },
        enableRowSelection: config.features?.rowSelection?.enabled ?? false,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter, // La tabla actualiza el estado del filtro global
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        manualPagination: false,
        debugTable: false,
        debugHeaders: false,
        debugColumns: false,
    });

    useEffect(() => {
        tableRef.current = table;
    }, [table]);


    useEffect(() => {
        if (config.features?.pagination?.initialPageSize && tableRef.current) {
            tableRef.current.setPageSize(config.features.pagination.initialPageSize);
        }
    }, [config.features?.pagination?.initialPageSize, tableRef]); // Depende de tableRef para asegurar que esté disponible

    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setData((currentData) => {
                const oldIndex = currentData.findIndex(item => getRowId(item,0) === active.id);
                const newIndex = currentData.findIndex(item => getRowId(item,0) === over.id);
                if (oldIndex === -1 || newIndex === -1) return currentData;
                const newData = arrayMove(currentData, oldIndex, newIndex);

                const dndConfig = config.features?.rowDnd;
                if (dndConfig?.onOrderChangeActionId && callbacks[dndConfig.onOrderChangeActionId]) {
                    callbacks[dndConfig.onOrderChangeActionId]({ allRows: newData, actionParams: { activeId: active.id, overId: over.id, oldIndex, newIndex }, table: tableRef.current });
                }
                return newData;
            });
        }
    };

    const selectedRowIds = useMemo(() => {
        if (!Array.isArray(data)) {
            return [];
        }
        const currentTable = tableRef.current;
        if (!currentTable) return [];

        return data.filter((item, index) => {
                const rowId = getRowId(item, index);
                if (rowId === undefined || rowId === null) return false;
                const tableRow = currentTable.getRowModel().rowsById[rowId];
                return tableRow?.getIsSelected();
            }
        ).map(row => row ? getRowId(row, 0) : undefined)
            .filter(id => id !== undefined) as string[];
    }, [rowSelection, data, getRowId, tableRef]); // Usar tableRef.current indirectamente a través de tableRef


    const renderFormField = useCallback((field: FormFieldConfig<TData>, currentSheetData: DataRow, setSheetDataCB: React.Dispatch<React.SetStateAction<DataRow>>, rowData?: TData) => {
        const value = currentSheetData[field.name] ?? (field.fieldType === 'switch' ? false : '');

        const handleChange = (val: any) => {
            const newFullSheetData = { ...sheetFormDataRef.current, [field.name]: val };
            setSheetDataCB(newFullSheetData);

            if (field.onValueChangeAction) {
                const actionIdForChange = `${config.tableId}-${field.name}-${field.onValueChangeAction.idSuffix || 'onValueChange'}`;
                const actionConfigForChange: ActionConfig<TData> = {
                    id: actionIdForChange,
                    label: '',
                    actionType: field.onValueChangeAction.actionType,
                    actionParams: {
                        ...(field.onValueChangeAction.actionParams || {}),
                        fieldName: field.name,
                        fieldValue: val,
                    }
                };
                handleAction(actionConfigForChange, activeSheet?.rowData, newFullSheetData);
            }
        };

        const commonProps = {
            id: `${config.tableId}-sheetform-${field.name}`,
            name: field.name,
            placeholder: field.placeholder,
            className: `w-full ${field.className || ''}`,
            disabled: typeof field.disabled === 'function' ? field.disabled(currentSheetData, rowData) : field.disabled,
        };

        if (typeof field.condition === 'function' && !field.condition(currentSheetData, rowData)) {
            return null;
        }

        const fieldKey = `${activeSheet?.sheetId || 'sheet'}-${field.name}`;

        switch (field.fieldType) {
            case "text":
                return (
                    <div key={fieldKey} className="grid gap-2">
                        <Label htmlFor={commonProps.id}>{field.label} {field.validation?.required && <span className="text-red-500">*</span>}</Label>
                        <Input type="text" {...commonProps} value={value} onChange={e => handleChange(e.target.value)} />
                    </div>
                );
            case "number":
                return (
                    <div key={fieldKey} className="grid gap-2">
                        <Label htmlFor={commonProps.id}>{field.label} {field.validation?.required && <span className="text-red-500">*</span>}</Label>
                        <Input type="number" {...commonProps} value={value} onChange={e => handleChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                    </div>
                );
            case "textarea":
                return (
                    <div key={fieldKey} className="grid gap-2">
                        <Label htmlFor={commonProps.id}>{field.label} {field.validation?.required && <span className="text-red-500">*</span>}</Label>
                        <Input type="text" {...commonProps} value={value} onChange={e => handleChange(e.target.value)} /> {/* Consider using actual Textarea component */}
                    </div>
                );
            case "select":
                return (
                    <div key={fieldKey} className="grid gap-2">
                        <Label htmlFor={commonProps.id}>{field.label} {field.validation?.required && <span className="text-red-500">*</span>}</Label>
                        <Select value={String(value)} onValueChange={val => handleChange(val)} disabled={commonProps.disabled}>
                            <SelectTrigger id={commonProps.id} className={commonProps.className.replace('w-full', '')}>
                                <SelectValue placeholder={field.placeholder || "Seleccionar..."} />
                            </SelectTrigger>
                            <SelectContent>
                                {(field.options || []).map(opt => (
                                    <SelectItem key={String(opt.value)} value={String(opt.value)}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                );
            case "switch":
                return (
                    <div key={fieldKey} className="flex items-center space-x-2 py-2">
                        <Switch
                            id={commonProps.id}
                            checked={Boolean(value)}
                            onCheckedChange={checked => handleChange(checked)}
                            disabled={commonProps.disabled}
                            className={commonProps.className.replace('w-full', '')}
                        />
                        <Label htmlFor={commonProps.id} className="cursor-pointer select-none">
                            {field.label} {field.validation?.required && <span className="text-red-500">*</span>}
                        </Label>
                    </div>
                );
            default:
                return <div key={fieldKey}>Tipo de campo desconocido: {field.fieldType}</div>;
        }
    }, [config.tableId, activeSheet?.rowData, handleAction, sheetFormDataRef]);


    const currentSheetDef = useMemo(() => {
        if (!activeSheet) return null;
        return config.sheetDefinitions?.find(s => s.id === activeSheet.sheetId);
    }, [activeSheet, config.sheetDefinitions]);


    const LoaderIcon = getLucideIcon("LoaderIcon" as string);

    const tableContent = () => {
        if (isLoading && LoaderIcon) {
            return (
                <TableRow>
                    <TableCell colSpan={columns.length + (config.features?.rowDnd?.enabled ? 1:0)} className="h-24 text-center">
                        <div className="flex items-center justify-center py-10 text-muted-foreground">
                            <LoaderIcon className="mr-2 h-6 w-6 animate-spin" />
                            {config.loadingStateMessage || "Cargando datos..."}
                        </div>
                    </TableCell>
                </TableRow>
            );
        }

        const currentTable = tableRef.current;
        if (!currentTable || !currentTable.getRowModel().rows?.length) {
            return (
                <TableRow>
                    <TableCell colSpan={columns.length + (config.features?.rowDnd?.enabled ? 1:0)} className="h-24 text-center">
                        {config.emptyStateMessage || "No se encontraron resultados."}
                    </TableCell>
                </TableRow>
            );
        }

        const dndEnabled = config.features?.rowDnd?.enabled;
        const TableComponentWrapper = dndEnabled ? DndContext : React.Fragment;
        const dndWrapperProps = dndEnabled ? { sensors, onDragEnd: handleDragEnd, collisionDetection: closestCenter, modifiers: [restrictToVerticalAxis] } : {};

        const tableRows = currentTable.getRowModel().rows.map(row => (
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

        return (
            <TableComponentWrapper {...(dndWrapperProps as any)}>
                {dndEnabled ? (
                    <SortableContext items={data.map(item => getRowId(item,0))} strategy={verticalListSortingStrategy}>
                        {tableRows}
                    </SortableContext>
                ) : tableRows}
            </TableComponentWrapper>
        );
    };


    return (
        <div className={`space-y-4 ${className || ''}`}>
            {config.title && <h2 className="text-2xl font-semibold">{config.title}</h2>}

            <DataTableToolbar
                config={config}
                globalFilter={globalFilter}
                setGlobalFilter={setGlobalFilter} // setGlobalFilter es estable de useState
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
                    <TableBody>
                        {tableContent()}
                    </TableBody>
                </Table>
            </div>

            <DataTablePagination config={config} table={tableRef.current} />

            {currentSheetDef && activeSheet && (
                <Sheet open={!!activeSheet} onOpenChange={(isOpen) => { if (!isOpen) setActiveSheet(null); }}>
                    <SheetContent className="sm:max-w-lg flex flex-col" size={currentSheetDef.size}>
                        <SheetHeader>
                            <SheetTitle>
                                {typeof currentSheetDef.title === 'function'
                                    ? currentSheetDef.title(activeSheet.rowData)
                                    : currentSheetDef.title}
                            </SheetTitle>
                            {currentSheetDef.description && (
                                <SheetDescription>
                                    {typeof currentSheetDef.description === 'function'
                                        ? currentSheetDef.description(activeSheet.rowData)
                                        : currentSheetDef.description}
                                </SheetDescription>
                            )}
                        </SheetHeader>
                        {currentSheetDef.form && (
                            <div className="flex-grow overflow-y-auto p-1 pr-6 space-y-4">
                                <div className={`grid gap-4 ${currentSheetDef.form.layoutColumns === 2 ? 'md:grid-cols-2' : ''}`}>
                                    {currentSheetDef.form.fields.map(field => renderFormField(field, sheetFormData, setSheetFormData, activeSheet.rowData))}
                                </div>
                            </div>
                        )}
                        <SheetFooter className="mt-auto pt-4 border-t">
                            <SheetClose asChild>
                                <Button variant="outline">{currentSheetDef.cancelActionLabel || "Cancelar"}</Button>
                            </SheetClose>
                            {currentSheetDef.submitActionId && (config.globalActions?.find(a => a.id === currentSheetDef.submitActionId!) || config.rowActions?.find(a=> a.id === currentSheetDef.submitActionId!)) && (
                                <Button
                                    onClick={() => {
                                        const submitActionFromGlobal = config.globalActions?.find(a => a.id === currentSheetDef.submitActionId!);
                                        const submitActionFromRow = config.rowActions?.find(a => a.id === currentSheetDef.submitActionId!);
                                        const submitAction = submitActionFromGlobal || submitActionFromRow;
                                        if (submitAction) {
                                            handleAction(submitAction, activeSheet.rowData, sheetFormData);
                                        } else {
                                            toast.error(`Acción de submit con ID '${currentSheetDef.submitActionId}' no encontrada.`);
                                        }
                                    }}
                                >
                                    {currentSheetDef.submitActionLabel || "Guardar"}
                                </Button>
                            )}
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            )}
        </div>
    );
}
