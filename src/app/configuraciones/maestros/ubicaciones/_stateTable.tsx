'use client'

import {DynamicTable} from "@/components/dynamic-table";
import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

interface State {
    id: number;
    country_id: number;
    name: string;
}

export default function StateTable() {
    const router = useRouter();
    const [states, setStates] = useState<State[]>([]);

    useEffect(() => {
        const fetchStates = async () => {
            try {
                const response = await fetch("/api/masters/states");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const {states} = await response.json();
                setStates(states);
            } catch (err: any) {
                console.error("Error fetching countries:", err);
            }
        };

        fetchStates();
    }, []);

    const tableConfig = {
        columns: [
            {
                id: "country_id",
                header: "País ID",
                type: "number",
                accessorKey: "country_id",
            },
            {
                id: "state_id",
                header: "ID",
                type: "number",
                accessorKey: "id",
            },
            {
                id: "country_name",
                header: "Nombre",
                type: "text",
                accessorKey: "name",
            },
        ],
        data: states,
        pagination: {
            enabled: false,
        },
        sorting: {
            enabled: true,
        },
        filtering: {
            enabled: true,
            globalFilter: true,
        },
        columnVisibility: {
            enabled: false,
        },
        add: {
            enabled: true,
            title: "Agregar país",
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
                        toast("País eliminado", {
                            description: `Are you sure you want to delete ${row.id}?`,
                        })
                    },
                }
            ]
        }
    }

    return (
        <div>
            <DynamicTable config={tableConfig}/>
        </div>
    )
}