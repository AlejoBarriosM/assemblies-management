"use client"

// import {DynamicForm, type FieldDefinition} from "@/components/dynamic-form"
import {createRecord, updateRecord, getRecord} from "@/lib/actions"
import {z} from "zod"

// Example of a product form definition
const productFields: FieldDefinition[] = [
    {
        name: "name",
        label: "Product Name",
        type: "text",
        placeholder: "Enter product name",
        required: true,
        validation: z.string().min(3, "Product name must be at least 3 characters"),
    },
    {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Enter product description",
        description: "Detailed description of the product",
    },
    {
        name: "price",
        label: "Price",
        type: "number",
        placeholder: "0.00",
        required: true,
        min: 0,
        validation: z.number().min(0, "Price must be a positive number"),
    },
    {
        name: "category",
        label: "Category",
        type: "select",
        placeholder: "Select a category",
        required: true,
        options: [
            {label: "Electronics", value: "electronics"},
            {label: "Clothing", value: "clothing"},
            {label: "Books", value: "books"},
            {label: "Home & Kitchen", value: "home"},
        ],
    },
    {
        name: "tags",
        label: "Tags",
        type: "combobox",
        placeholder: "Select tags",
        options: [
            {label: "New Arrival", value: "new"},
            {label: "Best Seller", value: "bestseller"},
            {label: "Sale", value: "sale"},
            {label: "Limited Edition", value: "limited"},
        ],
    },
    {
        name: "releaseDate",
        label: "Release Date",
        type: "date",
        placeholder: "Select a date",
    },
    {
        name: "inStock",
        label: "In Stock",
        type: "switch",
        description: "Is this product currently in stock?",
        defaultValue: true,
    },
    {
        name: "featured",
        label: "Featured Product",
        type: "checkbox",
        description: "Display this product on the homepage",
        defaultValue: false,
    },
]

export default async function ProductFormPage({
                                                  params,
                                              }: {
    params: { id?: string }
}) {
    // For edit mode, fetch the product data
    let initialData = {}
    const isEditMode = params.id !== undefined

    if (isEditMode && params.id) {
        const result = await getRecord("product", params.id)
        if (result.success) {
            initialData = result.data
        }
    }

    // Handle form submission
    const handleSubmit = async (data: any) => {
        if (isEditMode) {
            return updateRecord("product", params.id!, data, "/products", ["/products"])
        } else {
            return createRecord("product", data, "/products", ["/products"])
        }
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">{isEditMode ? "Edit Product" : "Create New Product"}</h1>
            <div className="max-w-2xl">
                <h1 className="text-3xl font-bold text-center mb-8">Dynamic Form Component</h1>
            </div>
        </div>
    )
}

