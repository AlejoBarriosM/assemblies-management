// src/components/dynamic-table/DataTablePagination.tsx
import React from "react";
import { Button } from "@/components/ui/button"; // Adjust path
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Adjust path
import { getLucideIcon } from "./utils"; // Adjust path
import type { DataTablePaginationProps, DataRow } from "./types"; // Adjust path

export const DataTablePagination = <TData extends DataRow>({
                                                               config,
                                                               table,
                                                           }: DataTablePaginationProps<TData>) => {
    if (!config.features?.pagination?.enabled || !table) return null;

    const ChevronLeft = getLucideIcon("ChevronLeft");
    const ChevronRight = getLucideIcon("ChevronRight");
    const ChevronsLeft = getLucideIcon("ChevronsLeft");
    const ChevronsRight = getLucideIcon("ChevronsRight");

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex items-center space-x-6 lg:space-x-8">
                {config.features.pagination.availablePageSizes && (
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Rows per page</p>
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
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                    {ChevronsLeft && <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><span className="sr-only">Go to first page</span><ChevronsLeft className="h-4 w-4" /></Button>}
                    {ChevronLeft && <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><span className="sr-only">Go to previous page</span><ChevronLeft className="h-4 w-4" /></Button>}
                    {ChevronRight && <Button variant="outline" className="h-8 w-8 p-0" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><span className="sr-only">Go to next page</span><ChevronRight className="h-4 w-4" /></Button>}
                    {ChevronsRight && <Button variant="outline" className="hidden h-8 w-8 p-0 lg:flex" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><span className="sr-only">Go to last page</span><ChevronsRight className="h-4 w-4" /></Button>}
                </div>
            </div>
        </div>
    );
};