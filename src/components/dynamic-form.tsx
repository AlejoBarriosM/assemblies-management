"use client"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {Button} from "@/components/ui/button"
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Checkbox} from "@/components/ui/checkbox"
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group"
import {Switch} from "@/components/ui/switch"
import {toast} from "sonner"
import {useEffect} from "react"

// Define the field types our form will support
export type FieldType =
    | "text"
    | "email"
    | "password"
    | "number"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio"
    | "switch"
    | "date"

// Define the validation rules we support
export type ValidationRule = {
    type: "required" | "min" | "max" | "minLength" | "maxLength" | "pattern" | "email"
    value?: any
    message: string
}

// Define the structure of a field in our form configuration
export type FieldConfig = {
    name: string
    label: string
    type: FieldType
    placeholder?: string
    description?: string
    options?: { label: string; value: string }[]
    validation?: ValidationRule[]
    defaultValue?: any
}

// Define the form configuration
export type FormConfig = {
    title: string
    description?: string
    fields: FieldConfig[]
    submitLabel: string
    cancelLabel?: string
    onCancel?: () => void
}

// Actualizar la interfaz DynamicFormProps para incluir la propiedad readOnly
export type DynamicFormProps = {
    config: FormConfig
    initialData?: Record<string, any> | null
    onSubmit: (data: Record<string, any>) => Promise<void> | void
    isLoading?: boolean
    readOnly?: boolean
}

// Modificar la función DynamicForm para aceptar el nuevo parámetro readOnly
export function DynamicForm({config, initialData, onSubmit, isLoading = false, readOnly = false}: DynamicFormProps) {
    // Build the Zod schema dynamically based on the form configuration
    const buildZodSchema = () => {
        const schema: Record<string, any> = {}

        config.fields.forEach((field) => {
            let fieldSchema: any = z.any()

            // Start with the appropriate base schema based on field type
            switch (field.type) {
                case "text":
                case "textarea":
                case "password":
                    fieldSchema = z.string()
                    break
                case "email":
                    fieldSchema = z.string().email("Invalid email address")
                    break
                case "number":
                    fieldSchema = z.coerce.number()
                    break
                case "checkbox":
                    fieldSchema = z.boolean()
                    break
                case "select":
                case "radio":
                    fieldSchema = z.string()
                    break
                case "switch":
                    fieldSchema = z.boolean()
                    break
                case "date":
                    fieldSchema = z.string()
                    break
                default:
                    fieldSchema = z.string()
            }

            // Apply validation rules
            if (field.validation) {
                field.validation.forEach((rule) => {
                    switch (rule.type) {
                        case "required":
                            fieldSchema = fieldSchema.min(1, rule.message)
                            break
                        case "min":
                            fieldSchema = fieldSchema.min(rule.value, rule.message)
                            break
                        case "max":
                            fieldSchema = fieldSchema.max(rule.value, rule.message)
                            break
                        case "minLength":
                            fieldSchema = fieldSchema.min(rule.value, rule.message)
                            break
                        case "maxLength":
                            fieldSchema = fieldSchema.max(rule.value, rule.message)
                            break
                        case "pattern":
                            fieldSchema = fieldSchema.regex(new RegExp(rule.value), rule.message)
                            break
                        case "email":
                            fieldSchema = fieldSchema.email(rule.message)
                            break
                    }
                })
            }

            schema[field.name] = fieldSchema
        })

        return z.object(schema)
    }

    const formSchema = buildZodSchema()

    // Set up the form with React Hook Form and Zod validation
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || getDefaultValues(),
    })

    // Reset form when initialData changes
    useEffect(() => {
        if (initialData) {
            // Convert the data to match expected types
            const formattedData = {...initialData}

            // Handle specific type conversions if needed
            config.fields.forEach((field) => {
                const fieldName = field.name
                if (fieldName in formattedData) {
                    // Convert string values to numbers for number fields
                    if (field.type === "number" && typeof formattedData[fieldName] === "string") {
                        formattedData[fieldName] = Number.parseFloat(formattedData[fieldName])
                    }

                    // Convert string "true"/"false" to boolean for checkbox/switch fields
                    if ((field.type === "checkbox" || field.type === "switch") && typeof formattedData[fieldName] === "string") {
                        formattedData[fieldName] = formattedData[fieldName] === "true"
                    }
                }
            })

            // Reset the form with the formatted data
            form.reset(formattedData)
        }
    }, [initialData, form, config.fields])

    // Generate default values based on field configuration
    function getDefaultValues() {
        const defaultValues: Record<string, any> = {}

        config.fields.forEach((field) => {
            switch (field.type) {
                case "checkbox":
                case "switch":
                    defaultValues[field.name] = field.defaultValue || false
                    break
                case "number":
                    defaultValues[field.name] = field.defaultValue || 0
                    break
                default:
                    defaultValues[field.name] = field.defaultValue || ""
            }
        })

        return defaultValues
    }

    // Handle form submission
    async function handleSubmit(data: z.infer<typeof formSchema>) {
        try {
            await onSubmit(data)
            toast("Success", {
                description: "Form submitted successfully",
            })
        } catch (error) {
            console.error("Form submission error:", error)
            toast("Error", {
                description: "Failed to submit form. Please try again.",
            })
        }
    }

    // Render the appropriate form field based on field type
    const renderField = (field: FieldConfig) => {
        switch (field.type) {
            case "text":
            case "email":
            case "password":
            case "number":
                return (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({field: formField}) => (
                            <FormItem>
                                <FormLabel>{field.label}</FormLabel>
                                <FormControl>
                                    <Input {...formField} type={field.type} placeholder={field.placeholder}
                                           disabled={readOnly}/>
                                </FormControl>
                                {field.description && <FormDescription>{field.description}</FormDescription>}
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                )

            case "textarea":
                return (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({field: formField}) => (
                            <FormItem>
                                <FormLabel>{field.label}</FormLabel>
                                <FormControl>
                                    <Textarea {...formField} placeholder={field.placeholder} disabled={readOnly}/>
                                </FormControl>
                                {field.description && <FormDescription>{field.description}</FormDescription>}
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                )

            case "select":
                return (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({field: formField}) => (
                            <FormItem>
                                <FormLabel>{field.label}</FormLabel>
                                <Select onValueChange={formField.onChange} defaultValue={formField.value}
                                        disabled={readOnly}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder={field.placeholder}/>
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {field.options?.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {field.description && <FormDescription>{field.description}</FormDescription>}
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                )

            case "checkbox":
                return (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({field: formField}) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox checked={formField.value} onCheckedChange={formField.onChange}
                                              disabled={readOnly}/>
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>{field.label}</FormLabel>
                                    {field.description && <FormDescription>{field.description}</FormDescription>}
                                </div>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                )

            case "radio":
                return (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({field: formField}) => (
                            <FormItem className="space-y-3">
                                <FormLabel>{field.label}</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={formField.onChange}
                                        defaultValue={formField.value}
                                        className="flex flex-col space-y-1"
                                        disabled={readOnly}
                                    >
                                        {field.options?.map((option) => (
                                            <FormItem key={option.value}
                                                      className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value={option.value} disabled={readOnly}/>
                                                </FormControl>
                                                <FormLabel className="font-normal">{option.label}</FormLabel>
                                            </FormItem>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                {field.description && <FormDescription>{field.description}</FormDescription>}
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                )

            case "switch":
                return (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({field: formField}) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">{field.label}</FormLabel>
                                    {field.description && <FormDescription>{field.description}</FormDescription>}
                                </div>
                                <FormControl>
                                    <Switch checked={formField.value} onCheckedChange={formField.onChange}
                                            disabled={readOnly}/>
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                )

            case "date":
                return (
                    <FormField
                        key={field.name}
                        control={form.control}
                        name={field.name}
                        render={({field: formField}) => (
                            <FormItem>
                                <FormLabel>{field.label}</FormLabel>
                                <FormControl>
                                    <Input {...formField} type="date" placeholder={field.placeholder}
                                           disabled={readOnly}/>
                                </FormControl>
                                {field.description && <FormDescription>{field.description}</FormDescription>}
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                )

            default:
                return null
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium">{config.title}</h3>
                    {config.description && <p className="text-sm text-muted-foreground mt-1">{config.description}</p>}
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                        {config.fields.map((field) => renderField(field))}
                        {!readOnly && (
                            <div className="flex justify-end gap-4">
                                {config.cancelLabel && config.onCancel && (
                                    <Button type="button" variant="outline" onClick={config.onCancel}
                                            disabled={isLoading}>
                                        {config.cancelLabel}
                                    </Button>
                                )}
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Processing..." : config.submitLabel}
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>
            </div>
        </div>
    )
}