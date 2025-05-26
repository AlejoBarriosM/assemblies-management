"use client"

import {useEffect, useState} from "react"
import {useRouter} from 'next/navigation'
import {DynamicForm, type FormConfig} from "@/components/dynamic-form"

interface Assemblies {
    id: string;
    customerId: string;
    assemblyTypeId: string;
    assemblyDate: string;
    description: string;
}

interface Customers {
    id: string;
    personName: string;
}

interface AssemblyType {
    id: string;
    name: string;
}

interface FormAssembliesProps {
    mode: "new" | "edit";
    id?: string | null;
}

export default function FormAssemblies({mode, id}: FormAssembliesProps) {
    const router = useRouter();
    const viewMode = mode

    const [customer, setCustomer] = useState<Customers[]>([]);       // <-- arreglo inicial
    const [assemblyType, setAssemblyType] = useState<AssemblyType[]>([]);
    const [assembly, setAssembly] = useState<Assemblies | null>(null);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {

        const fetchCustomers = async () => {
            try {
                const response = await fetch('/api/customers');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const {customers} = await response.json();
                setCustomer(customers);
            } catch (err: any) {
                setError(err.message);
                alert('Error fetching customers:' + error)
            }
        }

        const fetchAssemblyTypes = async () => {
            try {
                const response = await fetch('/api/assemblies/types');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const {assemblyTypes} = await response.json();
                console.log(assemblyTypes);
                setAssemblyType(assemblyTypes);
            } catch (err: any) {
                setError(err.message);
                alert('Error fetching assembly types:' + error)
            }
        }

        const fetchAssemblyById = async (id: string) => {
            try {
                const response = await fetch(`/api/assemblies/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const {assembly} = await response.json();
                setAssembly(assembly);
            } catch (err: any) {
                setError(err.message);
                alert('Error fetching assembly by ID:' + error)
            }
        }

        fetchCustomers();
        fetchAssemblyTypes();
        if (viewMode === "edit" && id) {
            fetchAssemblyById(id);
        }
    }, [error, id, viewMode]);

    const userFormConfig: FormConfig = {
        title: viewMode === "new" ? "Crear nueva asamblea" : "Editar Asamblea",
        description: viewMode === "new" ? "Crear asamblea para cliente" : "Modifique la información de la asamblea",
        submitLabel: "Guardar Cambios",
        cancelLabel: "Cancelar",
        onCancel: () => {
            router.push('/asambleas');
        },
        fields: [
            {
                name: "customerId",
                label: "Cliente",
                type: "select",
                placeholder: "Seleccione Cliente",
                validation: [
                    {
                        type: "required",
                        message: "El nombre es obligatorio",
                    },
                ],
                options: customer.map((customer) => ({
                    label: customer.personName,
                    value: customer.id,
                }))
            },
            {
                name: "assemblyTypeId",
                label: "Tipo de Asamblea",
                type: "select",
                placeholder: "Seleccione Tipo de Asamblea",
                validation: [
                    {
                        type: "required",
                        message: "El tipo de asamblea es obligatorio",
                    },
                ],
                options: assemblyType.map(type => ({
                    label: type.name,
                    value: type.id,
                }))
            },
            {
                name: "description",
                label: "Descripción",
                type: "text",
                placeholder: "Descripción",
            },
            {
                name: "date",
                label: "Fecha de Asamblea",
                type: "date",
                placeholder: "Seleccione Fecha",
                validation: [
                    {
                        type: "required",
                        message: "La fecha es obligatoria",
                    },
                ],
            }
        ],
    }

    // Manejar el envío del formulario
    const handleSubmit = async (data: Record<string, any>) => {

        if (mode === "edit") {
            await fetch(`/api/assemblies/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
        } else if (mode === "new") {
            await fetch('/api/assemblies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
        }


        router.push('/nomina/departamentos');
    }

    if (!assemblyType.length || !customer.length) {
        return <p>Cargando...</p>;
    }
    return (
        <DynamicForm
            config={userFormConfig}
            initialData={assembly}
            onSubmit={handleSubmit}
        />
    );
}

