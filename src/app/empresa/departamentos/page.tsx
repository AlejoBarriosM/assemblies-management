"use client"

import {DynamicTable} from "@/components/dynamic-table"
import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation'
import {toast} from "sonner"


interface Department {
    id: number;
    name: string;
    departmentParentId?: { id: number; name: string } | null;
    bossId?: string | null;
}

export default function ActionsExamples() {
    const router = useRouter();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch('/api/payroll/departments');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);  // MDN recomienda checkear status :contentReference[oaicite:3]{index=3}
                }
                const {departments} = await response.json();               // extrae el array correctamente
                setDepartments(departments);
            } catch (err: any) {
                console.error('Error fetching departments:', err);
                setError(err.message);
            }
        };

        fetchDepartments();
    }, [error]);


    // Example with different action display modes
    const createActionConfig = {
        columns: [
            {
                id: "ID",
                header: "ID",
                type: "number",
                accessorKey: "id",
            },
            {
                id: "Nombre",
                header: "Nombre",
                type: "text",
                accessorKey: "name",
            },
            {
                id: "Descripción",
                header: "Descripción",
                type: "text",
                accessorKey: "description",
            },
            {
                id: "Dep. Padre",
                header: "Dep. Padre",
                type: "text",
                accessorKey: "departmentParentId.name",
            },
            {
                id: "Jefe",
                header: "Jefe",
                type: "text",
                accessorKey: "bossId",
            },
        ],
        data: departments,
        pagination: {
            enabled: true,
            defaultPageSize: 5,
        },
        sorting: {
            enabled: true,
        },
        filtering: {
            enabled: true,
            globalFilter: true,
        },
        columnVisibility: {
            enabled: true,
        },
        add: {
            enabled: true,
            title: "Agregar Departamento",
            onClick: () => {
                router.push('/nomina/departamentos/nuevo');
            },
        },
        actions: {
            display: "dropdown",
            maxDisplayed: 0,
            items: [
                {
                    id: "edit",
                    label: "Editar",
                    icon: "edit",
                    variant: "secondary",
                    onClick: (row: { id: any; }) => {
                        router.push(`/nomina/departamentos/${row.id}`);
                    },
                },
                {
                    id: "delete",
                    label: "Eliminar",
                    icon: "delete",
                    variant: "destructive",
                    onClick: (row: { id: any; }) => {
                        toast({
                            title: "Delete Product",
                            description: `Are you sure you want to delete ${row.id}?`,
                            variant: "destructive",
                        })
                    },
                }
            ],
        },
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-10">Departamentos</h1>
            <div className="space-y-12">
                <div>
                    <DynamicTable config={createActionConfig}/>
                </div>
            </div>
        </div>
    )
}
