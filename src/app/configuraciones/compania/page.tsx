"use client"

import {useState} from "react"
import {DynamicForm, type FormConfig} from "@/components/dynamic-form"
import {useCompany} from "@/context/context";


export default function ViewCompany() {
    const [viewMode, setViewMode] = useState<"view" | "edit">("view")
    const {company} = useCompany()

    // Configuración del formulario de usuario
    const userFormConfig: FormConfig = {
        title: viewMode === "view" ? "Detalles de la empresa" : "Editar empresa",
        description: viewMode === "view" ? "Información de la empresa" : "Modifique la información de la empresa",
        submitLabel: "Guardar Cambios",
        cancelLabel: "Cancelar",
        onCancel: () => {
            setViewMode("view")
        },
        fields: [
            {
                name: "nit",
                label: "NIT",
                type: "number",
                placeholder: "Ingrese NIT",
                validation: [
                    {
                        type: "required",
                        message: "El NIT es obligatorio",
                    },
                ],
            },
            {
                name: "commercialName",
                label: "Nombre Comercial",
                type: "text",
                placeholder: "Ingrese nombre comercial",
                validation: [
                    {
                        type: "required",
                        message: "El nombre comercial es obligatorio",
                    },
                ],
            },
            {
                name: "legalName",
                label: "Nombre Legal",
                type: "text",
                placeholder: "Ingrese nombre legal",
                validation: [
                    {
                        type: "required",
                        message: "El nombre legal es obligatorio",
                    },
                ],
            },
            {
                name: "email",
                label: "Correo Electrónico",
                type: "email",
                placeholder: "Ingrese correo electrónico",
                validation: [
                    {
                        type: "email",
                        message: "Debe ser un correo electrónico válido",
                    },
                ],
            },
            {
                name: "website",
                label: "Sitio Web",
                type: "text",
                placeholder: "Ingrese sitio web",
            },

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

