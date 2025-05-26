// src/components/dynamic-table/FormFieldRenderer.tsx
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
// Import Textarea if you have one: import { Textarea } from "@/components/ui/textarea";
import type { FormFieldRendererProps, ActionConfig, DataRow } from './types'; // Adjust path

export const FormFieldRenderer = <TData extends DataRow>({
                                                             field,
                                                             currentSheetData,
                                                             sheetFormDataRef, // Use ref for latest data in callbacks
                                                             setSheetFormData,  // To update the state
                                                             rowData,
                                                             handleAction,
                                                             tableId,
                                                             activeSheetId,
                                                         }: FormFieldRendererProps<TData>) => {
    const value = currentSheetData[field.name] ?? (field.fieldType === 'switch' ? false : '');

    const handleChange = (val: any) => {
        // Update the ref immediately for actions
        const updatedData = { ...sheetFormDataRef.current, [field.name]: val };
        sheetFormDataRef.current = updatedData; // Update ref

        // Then update state to trigger re-render
        setSheetFormData(updatedData);


        if (field.onValueChangeAction) {
            const actionIdForChange = `${tableId}-${field.name}-${field.onValueChangeAction.idSuffix || 'onValueChange'}`;
            const actionConfigForChange: ActionConfig<TData> = {
                id: actionIdForChange,
                label: '', // Not displayed, but required by type
                actionType: field.onValueChangeAction.actionType,
                actionParams: {
                    ...(field.onValueChangeAction.actionParams || {}),
                    fieldName: field.name,
                    fieldValue: val,
                }
            };
            // Pass the most current form data from the ref
            handleAction(actionConfigForChange, rowData, sheetFormDataRef.current);
        }
    };

    const commonProps = {
        id: `${tableId}-sheetform-${activeSheetId || 'global'}-${field.name}`,
        name: field.name,
        placeholder: field.placeholder,
        className: `w-full ${field.className || ''}`,
        disabled: typeof field.disabled === 'function' ? field.disabled(currentSheetData, rowData) : field.disabled,
    };

    if (typeof field.condition === 'function' && !field.condition(currentSheetData, rowData)) {
        return null;
    }

    const fieldKey = `${activeSheetId || 'sheet'}-${field.name}`;

    switch (field.fieldType) {
        case "text":
            return (
                <div key={fieldKey} className="grid gap-2">
                    <Label htmlFor={commonProps.id}>{field.label} {field.validation?.required && <span className="text-red-500">*</span>}</Label>
                    <Input type="text" {...commonProps} value={value as string} onChange={e => handleChange(e.target.value)} />
                </div>
            );
        case "number":
            return (
                <div key={fieldKey} className="grid gap-2">
                    <Label htmlFor={commonProps.id}>{field.label} {field.validation?.required && <span className="text-red-500">*</span>}</Label>
                    <Input type="number" {...commonProps} value={value as number} onChange={e => handleChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} />
                </div>
            );
        case "textarea": // Assuming you have a Textarea component
            return (
                <div key={fieldKey} className="grid gap-2">
                    <Label htmlFor={commonProps.id}>{field.label} {field.validation?.required && <span className="text-red-500">*</span>}</Label>
                    {/* Replace Input with Textarea if available */}
                    <Input /* as={Textarea} */ {...commonProps} value={value as string} onChange={e => handleChange(e.target.value)} />
                </div>
            );
        case "select":
            return (
                <div key={fieldKey} className="grid gap-2">
                    <Label htmlFor={commonProps.id}>{field.label} {field.validation?.required && <span className="text-red-500">*</span>}</Label>
                    <Select value={String(value)} onValueChange={val => handleChange(val)} disabled={commonProps.disabled}>
                        <SelectTrigger id={commonProps.id} className={commonProps.className.replace('w-full', '')}>
                            <SelectValue placeholder={field.placeholder || "Select..."} />
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
                        className={commonProps.className.replace('w-full', '')} // Remove w-full if not needed
                    />
                    <Label htmlFor={commonProps.id} className="cursor-pointer select-none">
                        {field.label} {field.validation?.required && <span className="text-red-500">*</span>}
                    </Label>
                </div>
            );
        default:
            return <div key={fieldKey}>Unknown field type: {field.fieldType}</div>;
    }
};