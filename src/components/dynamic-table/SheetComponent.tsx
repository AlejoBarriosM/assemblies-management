// src/components/dynamic-table/SheetComponent.tsx
import React, { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FormFieldRenderer } from './FormFieldRenderer'; // Adjust path
import { toast } from "sonner"; // Assuming sonner is used for toasts
import type { SheetComponentProps, DataRow } from './types'; // Adjust path

export const SheetComponent = <TData extends DataRow>({
                                                          config,
                                                          activeSheet,
                                                          setActiveSheet,
                                                          sheetFormData,
                                                          setSheetFormData,
                                                          handleAction,
                                                          sheetFormDataRef,
                                                      }: SheetComponentProps<TData>) => {

    const currentSheetDef = useMemo(() => {
        if (!activeSheet) return null;
        return config.sheetDefinitions?.find(s => s.id === activeSheet.sheetId);
    }, [activeSheet, config.sheetDefinitions]);

    if (!currentSheetDef || !activeSheet) return null;

    return (
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
                    <div className="flex-grow overflow-y-auto p-1 pr-6 space-y-4"> {/* Added p-1 pr-6 for scrollbar */}
                        <div className={`grid gap-4 ${currentSheetDef.form.layoutColumns === 2 ? 'md:grid-cols-2' : ''}`}>
                            {currentSheetDef.form.fields.map(field => (
                                <FormFieldRenderer
                                    key={`${activeSheet.sheetId}-${field.name}`}
                                    field={field}
                                    currentSheetData={sheetFormData} // Pass current state for rendering
                                    sheetFormDataRef={sheetFormDataRef} // Pass ref for up-to-date data in callbacks
                                    setSheetFormData={setSheetFormData} // Pass setter to update form state
                                    rowData={activeSheet.rowData}
                                    handleAction={handleAction}
                                    tableId={config.tableId}
                                    activeSheetId={activeSheet.sheetId}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <SheetFooter className="mt-auto pt-4 border-t">
                    <SheetClose asChild>
                        <Button variant="outline">{currentSheetDef.cancelActionLabel || "Cancel"}</Button>
                    </SheetClose>
                    {currentSheetDef.submitActionId &&
                        (config.globalActions?.find(a => a.id === currentSheetDef.submitActionId!) ||
                            config.rowActions?.find(a => a.id === currentSheetDef.submitActionId!)) && ( // Ensure action exists
                            <Button
                                onClick={() => {
                                    const submitActionFromGlobal = config.globalActions?.find(a => a.id === currentSheetDef.submitActionId!);
                                    const submitActionFromRow = config.rowActions?.find(a => a.id === currentSheetDef.submitActionId!);
                                    const submitAction = submitActionFromGlobal || submitActionFromRow;

                                    if (submitAction) {
                                        handleAction(submitAction, activeSheet.rowData, sheetFormDataRef.current); // Use ref for latest data
                                    } else {
                                        toast.error(`Submit action with ID '${currentSheetDef.submitActionId}' not found.`);
                                    }
                                }}
                            >
                                {currentSheetDef.submitActionLabel || "Save"}
                            </Button>
                        )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};