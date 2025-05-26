// src/app/DynamicDataTableExample.tsx
"use client";
import React, { useState, useCallback } from 'react';
import { DynamicDataTable } from '@/components/dynamic-table/DynamicDataTable'; // Adjust path
import type { DynamicTableConfig, DataRow, CellRendererProps, ActionConfig } from '@/components/dynamic-table/types'; // Adjust path
import { Button } from '@/components/ui/button'; // For custom renderer example
import { toast } from 'sonner';

// Define a sample data type
interface UserData extends DataRow {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'editor';
    status: 'active' | 'pending' | 'banned';
    createdAt: string;
    logins: number;
    profileCompleteness: number; // 0 to 100
    // For chart cell
    performance: Array<{ month: string; value: number }>;
    // For custom cell
    customValue: string;
    // For sheet default value
    preferences: { theme: string; notifications: boolean };
    country?: string; // For conditional field in sheet
}

// Sample Data
const sampleUsers: UserData[] = [
    { id: 1, name: "Alice Wonderland", email: "alice@example.com", role: "admin", status: "active", createdAt: "2023-01-15", logins: 150, profileCompleteness: 80, performance: [{ month: 'Jan', value: 10 }, { month: 'Feb', value: 15 }, { month: 'Mar', value: 12 }], customValue: "Custom A", preferences: { theme: 'dark', notifications: true }, country: 'USA' },
    { id: 2, name: "Bob The Builder", email: "bob@example.com", role: "user", status: "pending", createdAt: "2023-02-20", logins: 25, profileCompleteness: 40, performance: [{ month: 'Jan', value: 5 }, { month: 'Feb', value: 8 }, { month: 'Mar', value: 13 }], customValue: "Custom B", preferences: { theme: 'light', notifications: false } },
    { id: 3, name: "Charlie Chaplin", email: "charlie@example.com", role: "editor", status: "active", createdAt: "2022-12-10", logins: 300, profileCompleteness: 95, performance: [{ month: 'Jan', value: 20 }, { month: 'Feb', value: 18 }, { month: 'Mar', value: 22 }], customValue: "Custom C", preferences: { theme: 'dark', notifications: true } },
    { id: 4, name: "Diana Prince", email: "diana@example.com", role: "user", status: "banned", createdAt: "2023-03-05", logins: 5, profileCompleteness: 20, performance: [{ month: 'Jan', value: 2 }, { month: 'Feb', value: 1 }, { month: 'Mar', value: 3 }], customValue: "Custom D", preferences: { theme: 'system', notifications: false }, country: 'Canada' },
    { id: 5, name: "Edward Scissorhands", email: "edward@example.com", role: "editor", status: "active", createdAt: "2023-04-01", logins: 75, profileCompleteness: 60, performance: [{ month: 'Jan', value: 12 }, { month: 'Feb', value: 10 }, { month: 'Mar', value: 14 }], customValue: "Custom E", preferences: { theme: 'light', notifications: true } },
];

// Custom Cell Renderer Example
const CustomButtonRenderer: React.FC<CellRendererProps<UserData>> = ({ value, row, column, config, table, myCustomProp }) => {
    return (
        <div className="flex items-center space-x-2">
            <span>{value}</span>
            <Button variant="outline" size="sm" onClick={() => alert(`Custom action for ${row.original.name}. My prop: ${myCustomProp}`)}>
                Info
            </Button>
        </div>
    );
};


const DynamicTablePage = () => {
    const [usersData, setUsersData] = useState<UserData[]>(sampleUsers);
    const [isLoading, setIsLoading] = useState(false);

    // Define Callbacks
    const tableCallbacks = {
        greetUser: useCallback((params: { rowData?: UserData, formData?: DataRow, actionParams?: any }) => {
            if (params.rowData) {
                toast.success(`Hello, ${params.rowData.name}!`, { description: `Role: ${params.rowData.role}` });
            }
        }, []),
        deleteUser: useCallback((params: { rowData?: UserData }) => {
            if (params.rowData) {
                setUsersData(prev => prev.filter(user => user.id !== params.rowData!.id));
                toast.warning(`${params.rowData.name} has been "deleted".`);
            }
        }, []),
        logSelectedData: useCallback((params: { table?: ReactTableInstance<UserData> | null, actionParams?: any }) => {
            if (params.table) {
                const selectedRows = params.table.getSelectedRowModel().rows.map(r => r.original);
                console.log("Selected Rows Data:", selectedRows);
                toast.info(`${selectedRows.length} rows selected. Check console.`);
            }
        }, []),
        handleDndOrderChange: useCallback((params: { allRows?: UserData[], actionParams?: any }) => {
            console.log("New order after DND:", params.allRows);
            console.log("DND event details:", params.actionParams);
            toast.success("Row order changed!");
            // If not using external setData, DynamicDataTable handles this internally if setData prop is provided
            // If you are managing data completely externally, you would update your state here based on params.allRows
        }, []),
        handleFormSubmit: useCallback(async (params: { rowData?: UserData, formData?: DataRow, actionParams?: any }) => {
            setIsLoading(true); // Simulate API call
            console.log("Form submitted!");
            console.log("Row Data:", params.rowData);
            console.log("Form Data:", params.formData);
            console.log("Action Params:", params.actionParams);

            // Simulate API Call
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (params.rowData && params.formData) { // Editing existing user
                setUsersData(prev => prev.map(user => user.id === params.rowData!.id ? { ...user, ...params.formData, name: params.formData!.userName, email: params.formData!.userEmail, role: params.formData!.userRole, preferences: {theme: params.formData!.themePref, notifications: params.formData!.enableNotifications} } as UserData : user));
                toast.success(`User ${params.formData.userName} updated successfully!`);
            } else if (params.formData) { // Adding new user
                const newUser: UserData = {
                    id: Math.max(0, ...usersData.map(u => u.id)) + 1, // Ensure new ID is unique
                    name: params.formData.userName as string,
                    email: params.formData.userEmail as string,
                    role: params.formData.userRole as UserData['role'],
                    status: 'pending', // Default status
                    createdAt: new Date().toISOString().split('T')[0],
                    logins: 0,
                    profileCompleteness: 50, // Default
                    performance: [], // Default
                    customValue: 'New User Custom',
                    preferences: {theme: params.formData.themePref, notifications: params.formData.enableNotifications}
                };
                setUsersData(prev => [...prev, newUser]);
                toast.success(`User ${params.formData.userName} added successfully!`);
            }
            setIsLoading(false);
            // Sheet will close automatically by default on successful API call type actions or can be configured
        }, [usersData]), // Added usersData as dependency
        onCountryChange: useCallback((params: {formData?: DataRow, actionParams?: any}) => {
            if(params.formData && params.actionParams) {
                toast.info(`Country changed to ${params.actionParams.fieldValue}`, {description: `Field: ${params.actionParams.fieldName}`});
                // Example: if country is Canada, set a default city (if city field exists)
                // This requires sheetFormData to be updated and re-passed or managed via ref in FormFieldRenderer
                // For now, FormFieldRenderer updates its own state and calls this.
                // To update other fields, you'd need to manage sheetFormData more centrally from DynamicDataTable
                // or pass a setter to onValueChangeAction callbacks.
                // The current setup's handleAction uses sheetFormDataRef.current, so it's up-to-date.
            }
        }, []),
        apiSuccessCallback: useCallback((params: {actionParams?: any, rowData?: UserData, formData?: DataRow}) => {
            toast.info("API Success Callback Triggered!", {description: `Response: ${JSON.stringify(params.actionParams)}` });
            // Example: refresh data or trigger another action
            // This is called after a successful "apiCall" type action that has "onSuccessCallbackId"
        }, []),
    };

    // Define Table Configuration
    const tableConfig: DynamicTableConfig<UserData> = {
        tableId: "usersTable",
        title: "Manage Users",
        dataKey: "id", // Crucial for DND and selection state
        columns: [
            // Checkbox column is added automatically if rowSelection.enabled is true
            { id: "name", accessorKey: "name", header: "Full Name", cellType: "text", cellConfig: { truncate: true, maxLength: 20 }, enableSorting: true, size: 200 },
            { id: "email", accessorKey: "email", header: "Email Address", cellType: "text", enableSorting: true, size: 250 },
            {
                id: "role", accessorKey: "role", header: "Role", cellType: "badge",
                cellConfig: {
                    variantMapping: { admin: "destructive", user: "secondary", editor: "default" }
                } as BadgeCellConfig<UserData>, // Type assertion for clarity
                enableSorting: true,
                size: 100
            },
            {
                id: "status", accessorKey: "status", header: "Status", cellType: "icon",
                cellConfig: {
                    iconMapping: { active: "CheckCircle2", pending: "Clock", banned: "XOctagon" },
                    iconColorMapping: { active: "green", pending: "orange", banned: "red" } // Custom prop, handle in cell render
                } as IconCellConfig<UserData>, // Type assertion
                size: 80
            },
            {
                id: "performanceChart", accessorKey: "performance", header: "Performance", cellType: "chart",
                cellConfig: {
                    chartType: "area",
                    dataKey: "performance", // Key in UserData row that holds the array for the chart
                    areaDataKey: "value",  // Key in each performance object for Y-axis
                    xAxisDataKey: "month", // Key in each performance object for X-axis (not directly used by recharts Area, but good for context)
                    strokeColor: "#10b981", // emerald-500
                    fillColor: "#6ee7b7",   // emerald-300
                    height: 60,
                } as ChartCellConfig<UserData>,
                enableSorting: false,
                size: 150,
            },
            {
                id: "custom", accessorKey: "customValue", header: "Custom Cell", cellType: "custom",
                cellConfig: {
                    rendererKey: "customButtonCell",
                    props: { myCustomProp: "Hello from Config!" } // Props for your custom renderer
                } as CustomCellConfig<UserData>,
                size: 200
            },
            {
                id: "inlineActions", header: "Quick Actions", cellType: "actions",
                cellConfig: {
                    displayType: "inline",
                    actions: [
                        { id: "quickGreet", label: "", icon: "Smile", actionType: "callback", actionParams: { callbackId: "greetUser" }, variant: "ghost" },
                        { id: "quickEdit", label: "", icon: "Edit3", actionType: "openSheet", actionParams: { sheetId: "editUserSheet" }, variant: "ghost" },
                    ]
                } as ActionsCellConfig<UserData>, // Type assertion
                size: 100,
            }
        ],
        features: {
            pagination: { enabled: true, initialPageSize: 3, availablePageSizes: [3, 5, 10] },
            sorting: { enabled: true },
            filtering: { enabled: true, globalFilterPlaceholder: "Search users..." },
            rowSelection: { enabled: true, type: "multiple" },
            columnVisibility: true,
            rowDnd: { enabled: true, onOrderChangeActionId: "handleDndOrderChange" }
        },
        globalActions: [
            { id: "addUser", label: "Add User", icon: "UserPlus", actionType: "openSheet", actionParams: { sheetId: "addUserSheet" }, variant: "default" },
            { id: "logSelected", label: "Log Selected", icon: "Terminal", actionType: "callback", actionParams: { callbackId: "logSelectedData" }, variant: "outline" },
            {
                id: "mockApiPost", label: "Test API POST", icon: "Send", actionType: "apiCall",
                actionParams: {
                    url: "https://jsonplaceholder.typicode.com/posts", // Mock API
                    method: "POST",
                    bodyTemplate: JSON.stringify({ title: "Test Title", body: "Test body from {{name}}", userId: "{{id}}" }), // Example template
                    onSuccessCallbackId: "apiSuccessCallback",
                    closeSheetOnSuccess: true, // Default, can be omitted
                },
                variant: "secondary",
                confirmationRequired: "This will send a test API request with data from the first selected row (if any). Proceed?",
            }
        ],
        rowActions: [ // These will appear in the default 'Actions' column dropdown if no 'actions' type column is defined
            { id: "editUser", label: "Edit User", icon: "Edit", actionType: "openSheet", actionParams: { sheetId: "editUserSheet" } },
            { id: "greetFromMenu", label: "Greet User", icon: "MessageSquare", actionType: "callback", actionParams: { callbackId: "greetUser" } },
            { id: "deleteUser", label: "Delete User", icon: "Trash2", actionType: "callback", actionParams: { callbackId: "deleteUser" }, variant: "destructive", confirmationRequired: "Are you sure you want to delete this user?" },
        ],
        sheetDefinitions: [
            {
                id: "editUserSheet",
                triggerActionId: "editUser", // Matches action ID
                title: (rowData) => `Edit User: ${rowData?.name || ''}`,
                description: "Modify the details of the selected user.",
                form: {
                    layoutColumns: 2,
                    fields: [
                        { name: "userName", label: "Full Name", fieldType: "text", defaultValuePath: "name", validation: { required: true, minLength: 3 } },
                        { name: "userEmail", label: "Email", fieldType: "text", defaultValuePath: "email", validation: { required: true, pattern: "^\\S+@\\S+\\.\\S+$" } },
                        {
                            name: "userRole", label: "Role", fieldType: "select", defaultValuePath: "role",
                            options: [{ value: "admin", label: "Admin" }, { value: "user", label: "User" }, { value: "editor", label: "Editor" }],
                            validation: { required: true }
                        },
                        { name: "country", label: "Country", fieldType: "select", defaultValuePath: "country",
                            options: [{value: "USA", label: "United States"}, {value: "Canada", label: "Canada"}, {value: "Other", label: "Other"}],
                            onValueChangeAction: {
                                actionType: "callback",
                                actionParams: { callbackId: "onCountryChange" }, // This callback will get fieldName and fieldValue
                                idSuffix: "countryChanged"
                            }
                        },
                        { name: "city", label: "City (Conditional)", fieldType: "text", placeholder: "Enter city if Canada/USA",
                            condition: (formData) => formData.country === "Canada" || formData.country === "USA",
                            className: "md:col-span-2" // Example for layout
                        },
                        { name: "themePref", label: "Theme Preference", fieldType: "select", defaultValuePath: "preferences.theme",
                            options: [{value: "light", label: "Light"}, {value: "dark", label: "Dark"}, {value: "system", label: "System"}]
                        },
                        { name: "enableNotifications", label: "Enable Notifications", fieldType: "switch", defaultValuePath: "preferences.notifications" },
                    ]
                },
                submitActionId: "saveUserViaApi", // This should be an action defined in globalActions or rowActions
                submitActionLabel: "Save Changes",
                size: "lg"
            },
            {
                id: "addUserSheet",
                triggerActionId: "addUser",
                title: "Add New User",
                description: "Fill in the details for the new user.",
                form: {
                    fields: [
                        // Similar fields as editUserSheet, but without defaultValuePath or with different defaults
                        { name: "userName", label: "Full Name", fieldType: "text", validation: { required: true } },
                        { name: "userEmail", label: "Email", fieldType: "text", validation: { required: true, pattern: "^\\S+@\\S+\\.\\S+$" } },
                        {
                            name: "userRole", label: "Role", fieldType: "select",
                            options: [{ value: "admin", label: "Admin" }, { value: "user", label: "User" }, { value: "editor", label: "Editor" }],
                            validation: { required: true }
                        },
                        { name: "themePref", label: "Theme Preference", fieldType: "select",
                            options: [{value: "light", label: "Light"}, {value: "dark", label: "Dark"}, {value: "system", label: "System"}],
                            defaultValuePath: "light" // Default for new user
                        },
                        { name: "enableNotifications", label: "Enable Notifications", fieldType: "switch", defaultValuePath: "true"}, // Default for new user
                    ]
                },
                submitActionId: "saveUserViaApi", // Reusing the same API action
                submitActionLabel: "Create User",
                size: "default"
            }
        ],
        emptyStateMessage: "No users found. Try adding some!",
        loadingStateMessage: "Fetching latest user data...",
    };

    // Add the API action for saving/updating users if it's not already in global/row actions
    // For this example, let's assume it's a global action.
    if (!tableConfig.globalActions?.find(a => a.id === "saveUserViaApi")) {
        tableConfig.globalActions = [
            ...(tableConfig.globalActions || []),
            {
                id: "saveUserViaApi",
                label: "Save User (API)", // Not displayed on a button directly if only used by sheet
                actionType: "apiCall",
                actionParams: {
                    url: "https://jsonplaceholder.typicode.com/users", // Mock API endpoint
                    method: "POST", // Or PUT if you distinguish by rowData presence
                    // Body will be the sheetFormData. No bodyTemplate needed if sending the whole form.
                    // If you need to transform formData before sending, use bodyTemplate or do it in a callback.
                    onSuccessCallbackId: "handleFormSubmit", // This callback will handle UI updates
                    closeSheetOnSuccess: true,
                },
            } as ActionConfig<UserData>, // Type assertion
        ];
    }


    // Simulate loading
    const loadData = () => {
        setIsLoading(true);
        setTimeout(() => {
            // Simulate fetching new data or an empty state
            // setUsersData(Math.random() > 0.5 ? sampleUsers : []);
            setUsersData(sampleUsers); // For consistency in example
            setIsLoading(false);
            toast.info("Data reloaded (simulated).")
        }, 2000);
    };

    return (
        <div className="container mx-auto py-10">
            <Button onClick={loadData} className="mb-4">Reload Data (Simulate Loading)</Button>
            <DynamicDataTable<UserData>
                config={tableConfig}
                data={usersData}
                setData={setUsersData} // Provide if DND is enabled or data can change externally
                isLoading={isLoading}
                callbacks={tableCallbacks}
                customCellRenderers={{
                    customButtonCell: CustomButtonRenderer,
                }}
                className="shadow-xl p-4 rounded-lg bg-card"
            />
        </div>
    );
};

export default DynamicTablePage;