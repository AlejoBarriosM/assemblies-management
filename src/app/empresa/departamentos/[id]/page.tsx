"use client"
import FormDepartment from "../_formDepartment"

export default function EditDepartment({ params }: { params: { id: string } }) {
    const { id } = params

    return (
        <main className="container mx-auto py-10 px-4">
            <FormDepartment mode="edit" id={id}/>
        </main>
    )
}