"use client"

import {useEffect, useState} from "react"
import {useRouter} from 'next/navigation'
import {DynamicForm, type FormConfig} from "@/components/dynamic-form"
import {useCompany} from "@/context/context";


interface Department {
    id: number;
    name: string;
    departmentParentId?: { id: number; name: string } | null;
    bossId?: string | null;
}

interface FormDepartmentProps {
    mode: "new" | "edit";
    id?: string | null;
}

export default function FormDepartment({mode, id}: FormDepartmentProps) {
    const router = useRouter();
    const viewMode = mode
    const {company} = useCompany()

    const [departments, setDepartments] = useState<Department[]>([]);
    const [department, setDepartment] = useState<Department | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch('/api/payroll/departments');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const {departments} = await response.json();
                setDepartments(departments);
            } catch (err: any) {
                setError(err.message);
                alert('Error fetching departments:' + error)
            }
        };

        const fetchDepartmentById = async (id: string) => {
            try {
                const response = await fetch(`/api/payroll/departments/${id}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const {department} = await response.json();
                setDepartment(department);
            } catch (err: any) {
                setError(err.message);
                alert('Error fetching department by ID:' + error)
            }
        }
        fetchDepartmentById(id || "");
        fetchDepartments();
    }, [error, id]);

    const userFormConfig: FormConfig = {
        title: viewMode === "new" ? "Crear nuevo departamento" : "Editar Departamento",
        description: viewMode === "new" ? "Crear nuevo departamento de la empresa" : "Modifique la información del departamento",
        submitLabel: "Guardar Cambios",
        cancelLabel: "Cancelar",
        onCancel: () => {
            router.push('/nomina/departamentos');
        },
        fields: [
            {
                name: "name",
                label: "Nombre",
                type: "text",
                placeholder: "Ingrese Nombre",
                validation: [
                    {
                        type: "required",
                        message: "El nombre es obligatorio",
                    },
                ],
            },
            {
                name: "description",
                label: "Descripción",
                type: "text",
                placeholder: "Ingrese Descripción",
            },
            {
                name: "depParent",
                label: "Dep. Padre",
                type: "select",
                placeholder: "Seleccione Departamento",
                options: departments.map((department) => ({
                    label: department.name,
                    value: department.id.toString(),
                }))

            },
            {
                name: "boss",
                label: "Jefe del Departamento",
                type: "select",
                placeholder: "Seleccione Jefe",
                options: departments.map((department) => ({
                    label: department.name,
                    value: department.id.toString(),
                }))
            }
        ],
    }

    // Manejar el envío del formulario
    const handleSubmit = async (data: Record<string, any>) => {

        if (mode === "edit") {
            await fetch('/api/payroll/departments', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'id': company?.id || "",
                },
                body: JSON.stringify(data),
            });
        } else if (mode === "new") {
            await fetch('/api/payroll/departments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'id': company?.id || "",
                },
                body: JSON.stringify(data),
            });
        }


        router.push('/nomina/departamentos');
    }

    return (
        <DynamicForm
            config={userFormConfig}
            initialData={department}
            onSubmit={handleSubmit}
        />
    )
}

