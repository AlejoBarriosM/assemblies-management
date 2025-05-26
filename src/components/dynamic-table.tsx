"use client"

import * as React from "react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type AccessorKeyColumnDef,
    type AccessorFnColumnDef,
} from "@tanstack/react-table"
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Edit,
    Trash2,
    Eye,
    MoreHorizontal,
    Copy,
    Download,
    type LucideIcon,
} from "lucide-react"

import {Button} from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Badge} from "@/components/ui/badge"
import {cn} from "@/lib/utils"
import {IconPlus} from "@tabler/icons-react";

// Define the column types that the table can handle
type ColumnType = "text" | "number" | "date" | "badge" | "status" | "custom"

// Define the structure for an action
interface TableAction {
    id: string
    label: string
    icon?: keyof typeof ActionIcons
    onClick: (row: any) => void
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    showCondition?: (row: any) => boolean
}

// Define the structure of the JSON input
interface TableConfig {
    columns: {
        id: string
        header: string
        type: ColumnType
        format?: string
        accessorKey?: string
        enableSorting?: boolean
        enableFiltering?: boolean
        cell?: (info: any) => React.ReactNode
    }[]
    data: Record<string, any>[]
    pagination?: {
        enabled: boolean
        pageSizes?: number[]
        defaultPageSize?: number
    }
    sorting?: {
        enabled: boolean
        defaultSort?: { id: string; desc: boolean }[]
    }
    filtering?: {
        enabled: boolean
        globalFilter?: boolean
    }
    columnVisibility?: {
        enabled: boolean
        defaultHidden?: string[]
    }
    add?: {
        enabled: boolean
        title?: string
        onClick?: () => void
    }
    actions?: {
        position?: "end" | "start"
        display?: "buttons" | "icons" | "dropdown"
        maxDisplayed?: number
        items: TableAction[]
    }
}

// Map of action icons
const ActionIcons: Record<string, LucideIcon> = {
    edit: Edit,
    delete: Trash2,
    view: Eye,
    copy: Copy,
    download: Download,
    more: MoreHorizontal,
}

// Helper function to format values based on column type
const formatValue = (value: any, type: ColumnType, format?: string): string => {
    if (value === null || value === undefined) return ""

    switch (type) {
        case "number":
            return typeof value === "number"
                ? format
                    ? new Intl.NumberFormat(undefined, JSON.parse(format)).format(value)
                    : value.toString()
                : value
        case "date":
            return value instanceof Date || !isNaN(new Date(value).getTime())
                ? format
                    ? new Intl.DateTimeFormat(undefined, JSON.parse(format)).format(new Date(value))
                    : new Date(value).toLocaleDateString()
                : value
        default:
            return String(value)
    }
}

// Function to create column definitions from the JSON config
const createColumns = (columns: TableConfig["columns"], actions?: TableConfig["actions"]): ColumnDef<any>[] => {
    const columnDefs = columns.map((column) => {
        // Base properties for all column types
        const baseColumnProps = {
            id: column.id,
            header: column.header,
            enableSorting: column.enableSorting !== false,
            enableColumnFilter: column.enableFiltering !== false,
        }

        // Create the cell renderer function
        const cellRenderer = !column.cell
            ? ({row}: { row: any }) => {
                const value = column.accessorKey ? row.getValue(column.id) : row.original[column.id]

                switch (column.type) {
                    case "badge":
                        return (
                            <Badge variant="outline" className="font-normal">
                                {formatValue(value, "text")}
                            </Badge>
                        )
                    case "status":
                        return (
                            <div className="flex items-center">
                                <div
                                    className={`mr-2 h-2 w-2 rounded-full ${
                                        String(value).toLowerCase() === "active" || String(value).toLowerCase() === "completed"
                                            ? "bg-green-500"
                                            : String(value).toLowerCase() === "pending"
                                                ? "bg-yellow-500"
                                                : "bg-gray-500"
                                    }`}
                                />
                                {formatValue(value, "text")}
                            </div>
                        )
                    default:
                        return formatValue(value, column.type, column.format)
                }
            }
            : column.cell

        // Create the appropriate column definition based on whether accessorKey is provided
        let columnDef: ColumnDef<any>

        if (column.accessorKey) {
            // Create an AccessorKeyColumnDef when accessorKey is provided
            const accessorKeyColumnDef: AccessorKeyColumnDef<any, any> = {
                ...baseColumnProps,
                accessorKey: column.accessorKey,
                cell: cellRenderer,
            }
            columnDef = accessorKeyColumnDef
        } else {
            // Create an AccessorFnColumnDef when no accessorKey is provided
            const accessorFnColumnDef: AccessorFnColumnDef<any, any> = {
                ...baseColumnProps,
                accessorFn: (row) => row[column.id],
                cell: cellRenderer,
            }
            columnDef = accessorFnColumnDef
        }

        return columnDef
    })

    // Add actions column if configured
    if (actions && actions.items.length > 0) {
        const actionsColumn: ColumnDef<any> = {
            id: "acciones",
            header: "Acciones",
            enableSorting: false,
            enableColumnFilter: false,
            cell: ({row}) => <ActionCell row={row} actions={actions}/>,
        }

        // Add the actions column at the beginning or end based on position
        return actions.position === "start" ? [actionsColumn, ...columnDefs] : [...columnDefs, actionsColumn]
    }

    return columnDefs
}

// Component to render action buttons/icons
const ActionCell = ({
                        row,
                        actions,
                    }: {
    row: any
    actions: TableConfig["actions"]
}) => {
    // Filter actions based on showCondition
    const visibleActions = actions!.items.filter((action) => !action.showCondition || action.showCondition(row.original))

    // Determine how many actions to display directly vs in dropdown
    const maxDisplayed = actions!.maxDisplayed || 2
    const displayedActions = visibleActions.slice(0, maxDisplayed)
    const dropdownActions = visibleActions.slice(maxDisplayed)

    // Display mode
    const displayMode = actions!.display || "buttons"

    return (
        <div className="flex items-center gap-2 justify-end">
            {/* Directly displayed actions */}
            {displayedActions.map((action) => {
                const Icon = action.icon ? ActionIcons[action.icon] : undefined

                if (displayMode === "icons" && Icon) {
                    return (
                        <Button
                            key={action.id}
                            variant="ghost"
                            size="icon"
                            onClick={() => action.onClick(row.original)}
                            className="h-8 w-8"
                            title={action.label}
                        >
                            <Icon className="h-4 w-4"/>
                            <span className="sr-only">{action.label}</span>
                        </Button>
                    )
                }

                return (
                    <Button
                        key={action.id}
                        variant={action.variant || "outline"}
                        size="sm"
                        onClick={() => action.onClick(row.original)}
                        className={cn("h-8", action.variant === "destructive" && "hover:bg-destructive/90")}
                    >
                        {Icon && <Icon className="mr-2 h-4 w-4"/>}
                        {displayMode === "buttons" && action.label}
                    </Button>
                )
            })}

            {/* Dropdown for additional actions */}
            {dropdownActions.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4"/>
                            <span className="sr-only">Más acciones</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {dropdownActions.map((action, index) => {
                            const Icon = action.icon ? ActionIcons[action.icon] : undefined

                            // Add separator before destructive actions
                            const needsSeparator =
                                index > 0 && action.variant === "destructive" && dropdownActions[index - 1].variant !== "destructive"

                            return (
                                <React.Fragment key={action.id}>
                                    {needsSeparator && <DropdownMenuSeparator/>}
                                    <DropdownMenuItem
                                        onClick={() => action.onClick(row.original)}
                                        className={cn(action.variant === "destructive" && "text-destructive focus:text-destructive")}
                                    >
                                        {Icon && <Icon className="mr-2 h-4 w-4"/>}
                                        {action.label}
                                    </DropdownMenuItem>
                                </React.Fragment>
                            )
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    )
}

export function DynamicTable({config}: { config: TableConfig }) {
    const [sorting, setSorting] = React.useState<SortingState>(config.sorting?.defaultSort || [])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
        config.columnVisibility?.defaultHidden?.reduce(
            (acc, columnId) => {
                acc[columnId] = false
                return acc
            },
            {} as Record<string, boolean>,
        ) || {},
    )
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: config.pagination?.defaultPageSize || 10,
    })

    const columns = React.useMemo(() => createColumns(config.columns, config.actions), [config.columns, config.actions])

    const table = useReactTable({
        data: config.data,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            columnVisibility,
            pagination,
        },
        enableSorting: config.sorting?.enabled !== false,
        enableColumnFilters: config.filtering?.enabled !== false,
        enableGlobalFilter: config.filtering?.globalFilter !== false,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <div className="w-full space-y-4">
            {config.filtering?.enabled && (
                <div className="flex items-center justify-between">
                    {config.filtering.globalFilter && (
                        <div className="flex items-center">
                            <Input
                                placeholder="Filtrar todas las columnas..."
                                value={globalFilter ?? ""}
                                onChange={(event) => setGlobalFilter(event.target.value)}
                                className="max-w-sm"
                            />
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        {config.columnVisibility?.enabled && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="ml-auto">
                                        Columnas <ChevronDown className="ml-2 h-4 w-4"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {table
                                        .getAllColumns()
                                        .filter((column) => column.getCanHide())
                                        .map((column) => {
                                            return (
                                                <DropdownMenuCheckboxItem
                                                    key={column.id}
                                                    className="capitalize"
                                                    checked={column.getIsVisible()}
                                                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                                >
                                                    {column.id}
                                                </DropdownMenuCheckboxItem>
                                            )
                                        })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {config.add?.enabled && (
                            <Button variant="outline" size="lg" onClick={config.add.onClick}>
                                <IconPlus/>
                                <span className="hidden lg:inline">{config.add.title}</span>
                            </Button>
                        )}
                    </div>
                </div>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={row.index % 2 === 0 ? "bg-muted/50" : ""}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Sin resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {config.pagination?.enabled && (
                <div className="flex items-center justify-between space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Filas por página</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={table.getState().pagination.pageSize}/>
                            </SelectTrigger>
                            <SelectContent side="top">
                                {(config.pagination.pageSizes || [10, 20, 30, 40, 50]).map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                        Página {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Ir a la primera página</span>
                            <ChevronsLeft className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span className="sr-only">Ir a la página anterior</span>
                            <ChevronLeft className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Ir a la página siguiente</span>
                            <ChevronRight className="h-4 w-4"/>
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            <span className="sr-only">Ir a la última página</span>
                            <ChevronsRight className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

