// src/components/dynamic-table/types.ts
import type { UniqueIdentifier } from "@dnd-kit/core";
import type { ColumnDef, Row, Table as ReactTableInstance, CellContext } from "@tanstack/react-table";
import type * as LucideIcons from "lucide-react";

// --- ALL TYPE DEFINITIONS FROM THE ORIGINAL FILE ---
// export type DataRow = Record<string, any>;
// export interface ActionConfig<TData extends DataRow = DataRow> { ... }
// ... and so on for all other types and interfaces
// For brevity, I'm not repeating all of them here, but they should be moved to this file.

// Ensure all necessary types are exported:
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
    dataKey: string; // Key in rowData that holds the array of chart data points
    xAxisDataKey: string; // Key within each chart data point for the x-axis value
    areaDataKey: string; // Key within each chart data point for the y-axis value (the area)
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
    enableFiltering?: boolean; // Note: Filtering is mostly global in this setup, column-specific might need more UI
    enableHiding?: boolean;
    size?: number;
    meta?: any; // For additional, non-standard column data
}

export interface PaginationConfig {
    enabled: boolean;
    initialPageSize?: number;
    availablePageSizes?: number[];
}

export interface SortingConfig {
    enabled: boolean;
    // Potentially add initialSortState here if needed
}

export interface FilteringConfig {
    enabled: boolean;
    globalFilterPlaceholder?: string;
    // columnFiltersEnabled?: boolean; // If you plan to add per-column filter inputs
}

export interface RowSelectionConfig {
    enabled: boolean;
    type: "single" | "multiple"; // "single" might require additional logic in onRowSelectionChange
}

export interface RowDndConfig {
    enabled: boolean;
    onOrderChangeActionId?: string; // Callback ID for when row order changes
}

export interface FeaturesConfig {
    pagination?: PaginationConfig;
    sorting?: SortingConfig;
    filtering?: FilteringConfig;
    rowSelection?: RowSelectionConfig;
    columnVisibility?: boolean; // Enables the "toggle columns" dropdown
    rowDnd?: RowDndConfig;
}

export interface FormFieldConfig<TData extends DataRow = DataRow> {
    name: string; // Corresponds to a key in the form data object
    label: string;
    fieldType: "text" | "number" | "select" | "textarea" | "switch" | "date"; // Add "date" if needed
    placeholder?: string;
    defaultValuePath?: string; // Path in rowData to get the default value (e.g., "profile.firstName")
    options?: Array<{ value: string | number; label: string }>; // For select type
    optionsPath?: string; // Path in rowData or elsewhere to dynamically load options (more complex)
    validation?: {
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        pattern?: string; // Regex pattern
        min?: number; // For number type
        max?: number; // For number type
    };
    className?: string; // Additional CSS classes for the field wrapper or input
    disabled?: boolean | ((formData: DataRow, rowData?: TData) => boolean);
    condition?: (formData: DataRow, rowData?: TData) => boolean; // If false, field is not rendered
    onValueChangeAction?: Pick<ActionConfig<TData>, "actionType" | "actionParams"> & { idSuffix?: string };
}

export interface FormConfig<TData extends DataRow = DataRow> {
    fields: FormFieldConfig<TData>[];
    layoutColumns?: 1 | 2; // Number of columns for the form layout
}

export interface SheetDefinition<TData extends DataRow = DataRow> {
    id: string; // Unique ID for this sheet definition
    triggerActionId: string; // Action ID that opens this sheet
    title: string | ((rowData?: TData) => string);
    description?: string | ((rowData?: TData) => string);
    form?: FormConfig<TData>;
    submitActionId?: string; // Action ID to call on form submission
    cancelActionLabel?: string;
    submitActionLabel?: string;
    size?: "default" | "sm" | "lg" | "xl" | "full"; // Sheet size
}


export interface DynamicTableConfig<TData extends DataRow = DataRow> {
    tableId: string; // Unique ID for the table, used for generating unique keys for elements
    title?: string; // Optional title displayed above the table
    dataKey?: keyof TData | ((row: TData) => UniqueIdentifier); // Key or function to get unique row ID for dnd and selection
    columns: ColumnConfig<TData>[];
    features?: FeaturesConfig;
    globalActions?: ActionConfig<TData>[]; // Actions available at the table level (e.g., "Add New")
    rowActions?: ActionConfig<TData>[]; // Actions available for each row (typically in a dropdown)
    sheetDefinitions?: SheetDefinition<TData>[]; // Definitions for side sheets/modals
    emptyStateMessage?: string;
    loadingStateMessage?: string;
}

// Props for custom cell renderers
export interface CellRendererProps<TData extends DataRow = DataRow> {
    value: any;
    row: Row<TData>;
    column: ColumnConfig<TData>; // The original column configuration
    config: DynamicTableConfig<TData>; // The full table configuration
    table: ReactTableInstance<TData>; // The TanStack Table instance
    // You can add any other props your custom renderer might need from its config
    [key: string]: any;
}

// Main props for the DynamicDataTable component
export interface DynamicDataTableProps<TData extends DataRow = DataRow> {
    config: DynamicTableConfig<TData>;
    data: TData[]; // The data to display
    setData?: React.Dispatch<React.SetStateAction<TData[]>>; // Optional: if data is managed externally (e.g., for DND)
    isLoading?: boolean;
    callbacks?: Record<string, (params: {
        rowData?: TData;
        formData?: DataRow;
        allRows?: TData[];
        actionParams?: any;
        table?: ReactTableInstance<TData> | null;
    }) => void | Promise<void>>;
    customCellRenderers?: Record<string, React.FC<CellRendererProps<TData>>>; // Key-value store for custom cell renderers
    className?: string; // Optional class name for the root div
}

export interface DraggableRowProps<TData extends DataRow> extends React.HTMLAttributes<HTMLTableRowElement> {
    row: Row<TData>;
    features: FeaturesConfig | undefined;
    // Add getLucideIcon if you are passing it as a prop
}

export interface SheetComponentProps<TData extends DataRow> {
    config: DynamicTableConfig<TData>;
    activeSheet: { sheetId: string; rowData?: TData } | null;
    setActiveSheet: (sheet: { sheetId: string; rowData?: TData } | null) => void;
    sheetFormData: DataRow;
    setSheetFormData: React.Dispatch<React.SetStateAction<DataRow>>;
    handleAction: (actionConfig: ActionConfig<TData>, rowData?: TData, currentFormData?: DataRow) => Promise<void>;
    // Add sheetFormDataRef if needed for FormFieldRenderer or pass relevant parts of it
    sheetFormDataRef: React.RefObject<DataRow>;
}

// Other specific props for sub-components can be defined here
// For DataTableToolbarProps, DataTablePaginationProps etc.
export interface DataTableToolbarProps<TData extends DataRow> {
    config: DynamicTableConfig<TData>;
    globalFilter: string;
    setGlobalFilter: (filter: string) => void;
    table: ReactTableInstance<TData> | null;
    handleAction: (actionConfig: ActionConfig<TData>, rowData?: TData, currentFormData?: DataRow) => Promise<void>;
}

export interface DataTablePaginationProps<TData extends DataRow> {
    config: DynamicTableConfig<TData>;
    table: ReactTableInstance<TData> | null;
}

export interface FormFieldRendererProps<TData extends DataRow = DataRow> {
    field: FormFieldConfig<TData>;
    currentSheetData: DataRow;
    // setSheetDataCB: React.Dispatch<React.SetStateAction<DataRow>>;
    // Pass sheetFormDataRef and setSheetFormData for direct update
    sheetFormDataRef: React.RefObject<DataRow>;
    setSheetFormData: React.Dispatch<React.SetStateAction<DataRow>>;
    rowData?: TData;
    handleAction: (actionConfig: ActionConfig<TData>, rowData?: TData, currentFormData?: DataRow) => Promise<void>;
    tableId: string;
    activeSheetId?: string;
}

export interface TableBodyRendererProps<TData extends DataRow> {
    table: ReactTableInstance<TData>;
    config: DynamicTableConfig<TData>;
    columns: ColumnDef<TData>[]; // The fully resolved columns for colSpan
    isLoading: boolean;
    data: TData[]; // The current data array for SortableContext items
    getRowId: (row: TData, index: number, parent?: Row<TData> | undefined) => string;
    handleDragEnd: (event: any) => void; // Adjust 'any' to DragEndEvent
    sensors: any; // Adjust 'any' to a more specific type if available from dnd-kit
}