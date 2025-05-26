"use client"

import {useEffect, useState} from "react"
import {DynamicForm, type FormConfig} from "@/components/dynamic-form"
import {useCompany} from "@/context/context";


export default function NewEmployee() {
    const [viewMode, setViewMode] = useState<"view" | "edit">("edit")
    const {company} = useCompany()
    const [identificationType, setIdentificationType] = useState<{ label: string; value: string; }[]>([])
    const [countries, setCountries] = useState<{ label: string; value: string; }[]>([])

    useEffect(() => {
        const fetchIdentificationTypes = async () => {
            const response = await fetch('/api/person/identificationType', {
                method: 'GET',
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error('Error al obtener los tipos de identificación');
            }

            const data = await response.json();

            setIdentificationType(
                data.identificationTypes.map((type: { id: number; type: string }) => ({
                    label: type.type,
                    value: type.id.toString(),
                }))
            );
        };

        const fetchCountries = async () => {
            const response = await fetch('/api/locations/countries', {
                method: 'GET',
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error('Error al obtener los países');
            }

            const data = await response.json();

            setCountries(
                data.countries.map((country: { id: number; name: string }) => ({
                    label: country.name,
                    value: country.id.toString(),
                }))
            )
        }

        fetchIdentificationTypes().catch((error) => console.error(error));
        fetchCountries().catch((error) => console.error(error));
    }, []);


    // Configuración del formulario de usuario
    const userFormConfig: FormConfig = {
        title: viewMode === "view" ? "Detalles del empleado" : "Editar empresa",
        description: viewMode === "view" ? "Información de la empresa" : "Modifique la información de la empresa",
        submitLabel: "Guardar Cambios",
        cancelLabel: "Cancelar",
        onCancel: () => {
            setViewMode("view")
        },
        fields: [
            {
                name: "identificationType",
                label: "Tipo de Identificación",
                type: "select",
                placeholder: "Seleccione tipo de identificación",
                options: identificationType,
            },
            {
                name: "identificationNumber",
                label: "Número de Identificación",
                type: "number",
                placeholder: "Ingrese número de identificación",
                validation: [
                    {
                        type: "required",
                        message: "El número de identificación es obligatorio",
                    },
                ],
            },
            {
                name: "firstName",
                label: "Primer Nombre",
                type: "text",
                placeholder: "Ingrese el primer nombre",
                validation: [
                    {
                        type: "required",
                        message: "El primer nombre es obligatorio",
                    },
                ],
            },
            {
                name: "middleName",
                label: "Segundo Nombre",
                type: "text",
                placeholder: "Ingrese el segundo nombre",
            },
            {
                name: "lastName",
                label: "Primer Apellido",
                type: "text",
                placeholder: "Ingrese el primer apellido",
                validation: [
                    {
                        type: "required",
                        message: "El primer apellido es obligatorio",
                    },
                ],
            },
            {
                name: "secondLastName",
                label: "Segundo Apellido",
                type: "text",
                placeholder: "Ingrese el segundo apellido",
            },
            {
                name: "birthDate",
                label: "Fecha de Nacimiento",
                type: "date",
                placeholder: "Ingrese fecha de nacimiento",
                validation: [
                    {
                        type: "required",
                        message: "La fecha de nacimiento es obligatoria",
                    },
                ],
            },
            {
                name: "gender",
                label: "Género",
                type: "select",
                placeholder: "Seleccione género",
                options: [
                    { label: "Masculino", value: "M" },
                    { label: "Femenino", value: "F" },
                ],
            },
            {
                name: "country",
                label: "País",
                type: "select",
                placeholder: "Seleccione país",
                options: countries,
            }
        ],
    }

    // Manejar el envío del formulario
    const handleSubmit = async (data: Record<string, any>) => {

        // console.log("Formulario enviado:", data)
        await fetch('/api/company', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'id': company?.id || "",
            },
            body: JSON.stringify(data),
        });

        // const data = await response.json();
        // if (response.ok) {
        //     console.log('Empresa actualizada:', data);
        // } else {
        //     console.error('Error al actualizar la empresa:', data);
        // }
        setViewMode("view")
        window.location.reload();
    }

    return (
        <main className="container mx-auto py-10 px-4">
            <h1 className="text-2xl font-bold mb-8">Datos de la empresa </h1>

            <div className="mb-6">
                <p className="text-muted-foreground mb-4">
                    Datos generales de la empresa
                </p>

                <div className="flex gap-4 mb-8">
                    <button
                        onClick={() => viewMode === 'edit' ? setViewMode("view") : setViewMode("edit")}
                        className={`px-4 py-2 rounded-md ${
                            viewMode === "view" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                        disabled={viewMode === "edit"}
                    >
                        Editar
                    </button>
                </div>
            </div>

            <DynamicForm
                config={userFormConfig}
                initialData={company}
                onSubmit={handleSubmit}
                readOnly={viewMode === "view"}
            />
        </main>
    )
}

