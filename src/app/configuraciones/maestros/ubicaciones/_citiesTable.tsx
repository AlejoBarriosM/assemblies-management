'use client'
import {
    DynamicTableConfig,
    DynamicDataTable,
    ActionsCellConfig, DataRow,
} from "@/components/dinamic-data-table";
import {useEffect, useState} from "react";
import {useLoading} from "@/context/context";
import {toast} from "sonner";

interface Country {
    id: number;
    name: string;
}

interface State {
    id: number;
    name: string;
    countryId: Country.id;
}

interface City {
    id: number;
    name: string;
    stateId: State.id;
}

interface DataType extends DataRow {
    ID: number;
    countryId: Country.id;
    countryName: Country.name;
    stateId: State.id;
    stateName: State.name;
    cityId: City.id;
    cityName: City.name;
}


export default function CitiesTable() {
    const [data, setData] = useState<DataType[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const {hideLoading, showLoading, isLoading} = useLoading();
    const nombre = "Ciudad";
    const nombrePr = "Ciudades";


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/masters/vwCities");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const {cities} = await response.json();
                setData(cities);
            } catch (err: any) {
                console.error("Error fetching cities:", err);
            }
        };
        const fectchCountries = async () => {
            try {
                const response = await fetch("/api/masters/countries");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const {countries} = await response.json();
                setCountries(countries);
            } catch (err: any) {
                console.error("Error fetching countries:", err);
            }
        }
        const fetchStates = async () => {
            try {
                const response = await fetch("/api/masters/states");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const {states} = await response.json();
                setStates(states);
            } catch (err: any) {
                console.error("Error fetching states:", err);
            }
        }
        fetchData();
        fectchCountries();
        fetchStates();
    }, []);


    const CitiesTable = () => {
        const tableConfig: DynamicTableConfig<DataType> = {
            tableId: "citiesTable",
            title: `Listado de ${nombrePr}`,
            dataKey: "ID",
            columns: [
                {id: "countryName", accessorKey: "countryName", header: "País", cellType: "text", enableSorting: true},
                {
                    id: "stateName",
                    accessorKey: "stateName",
                    header: "Departamento",
                    cellType: "text",
                    enableSorting: true
                },
                {id: "cityName", accessorKey: "cityName", header: "Ciudad", cellType: "text", enableSorting: true},
                {
                    id: "actions",
                    accessorKey: "ID",
                    header: "Acciones",
                    cellType: "actions",
                    cellConfig: {
                        actions: [
                            {
                                id: "edit",
                                label: "Editar",
                                icon: "EditIcon",
                                actionType: "openSheet",
                                actionParams: {sheetId: "editSheet"}
                            },
                            {
                                id: "delete",
                                label: "Eliminar",
                                icon: "Trash2Icon",
                                actionType: "callback",
                                actionParams: {callbackId: "handleDelete"},
                                variant: "destructive",
                                confirmationRequired: `¿Estás seguro de que quieres eliminar esta ${nombre}?`
                            },
                        ],
                        displayType: "dropdown"
                    } as ActionsCellConfig<DataType>
                }
            ],
            features: {
                pagination: {enabled: true, initialPageSize: 10, availablePageSizes: [5, 10, 20]},
                sorting: {enabled: true},
                filtering: {enabled: true, globalFilterPlaceholder: "Buscar..."},
                rowSelection: {enabled: true, type: "single"},
                columnVisibility: true,
                rowDnd: {enabled: true, onOrderChangeActionId: "handleOrderChange"},
            },
            globalActions: [
                {
                    id: "addActionCity",
                    label: `Añadir ${nombre}`,
                    icon: "PlusCircleIcon",
                    actionType: "openSheet",
                    actionParams: {sheetId: "addSheet"}
                },
                {
                    id: "addActionCountry",
                    label: `Añadir País`,
                    icon: "PlusCircleIcon",
                    actionType: "openSheet",
                    actionParams: {sheetId: "addSheet"}
                },
                {
                    id: "addActionState",
                    label: `Añadir Departamento`,
                    icon: "PlusCircleIcon",
                    actionType: "openSheet",
                    actionParams: {sheetId: "addSheet"}
                }
            ],
            sheetDefinitions: [
                {
                    id: "addSheet",
                    triggerActionId: "addActionCity", // Coincide con globalAction
                    title: `Añadir Nueva ${nombre}`,
                    form: {
                        fields: [
                            {
                                name: "countryId",
                                label: "País",
                                fieldType: "select",
                                options: countries.map(country => ({
                                    value: country.id,
                                    label: country.name
                                })),
                                validation: {required: true},
                            },
                            {
                                name: "stateId",
                                label: "Departamento",
                                fieldType: "select",
                                options: states.map(state => ({
                                    value: state.id,
                                    label: state.name
                                })),
                                validation: {required: true}
                            },
                            {
                                name: "name",
                                label: `Nombre de la ${nombre}`,
                                fieldType: "text",
                                validation: {required: true}
                            },
                        ],
                        layoutColumns: 1,
                    },
                    submitActionId: "submitNewProduct", // Necesitas definir esta acción global
                    submitActionLabel: "Crear Producto"
                },
                {
                    id: "editSheet",
                    triggerActionId: "edit", // Coincide con rowAction
                    title: (rowData) => `Editar ${nombre}: ${rowData?.name}`,
                    form: {
                        fields: [
                            {
                                name: "name",
                                label: "Nombre del Producto",
                                fieldType: "text",
                                defaultValuePath: "name",
                                validation: {required: true}
                            },
                            {
                                name: "category",
                                label: "Categoría",
                                fieldType: "select",
                                defaultValuePath: "category",
                                options: [{value: "Electronics", label: "Electrónica"}, {
                                    value: "Books",
                                    label: "Libros"
                                }]
                            },
                            {
                                name: "price",
                                label: "Precio",
                                fieldType: "number",
                                defaultValuePath: "price",
                                validation: {required: true, min: 0}
                            },
                        ],
                    },
                    submitActionId: "submitEditProduct", // Necesitas definir esta acción global
                    submitActionLabel: "Guardar Cambios"
                }
            ],
            emptyStateMessage: "No hay productos para mostrar.",
        };

        const Callbacks = {
            handleDeleteProduct: async (params: { rowData?: DataType }) => {
                if (params.rowData) {
                    toast.success(`Ciudad "${params.rowData.name}" eliminada (simulado).`);
                    // setProducts(prev => prev.filter(p => p.ID !== params.rowData!.ID));
                }
            },
            handleOrderChange: async (params: { allRows?: DataType[] }) => {
                if (params.allRows) {
                    toast.info("Orden de productos actualizado (simulado).");
                    // Aquí podrías llamar a una API para guardar el nuevo orden
                    // console.log("Nuevo orden:", params.allRows.map(p => p.ID));
                }
            },
            // Callbacks para submit de los sheets (necesitarías acciones globales para ellos)
            // Ejemplo: si submitNewProduct y submitEditProduct son ActionConfig de tipo 'callback'
            // submitNewProductCallback: async (params: { formData?: DataRow }) => { ... },
            // submitEditProductCallback: async (params: { rowData?: DataType, formData?: DataRow }) => { ... },
        };

        // Necesitarías definir acciones globales para los submit de los sheets si son de tipo 'apiCall' o 'callback'
        // Por ejemplo, en tableConfig.globalActions:
        // { id: "submitNewProduct", label: "Interna", actionType: "apiCall", actionParams: { url: "/api/products", method: "POST" } },
        // { id: "submitEditProduct", label: "Interna", actionType: "apiCall", actionParams: { url: "/api/products/{{productId}}", method: "PUT" } },


        return (
            <div className="container mx-auto py-10">
                <DynamicDataTable
                    config={tableConfig}
                    data={data}
                    setData={setData} // Para que DND actualice el estado
                    callbacks={Callbacks}
                    isLoading={isLoading}
                />
            </div>
        );
    };
    return (
        <div>
            <CitiesTable/>
        </div>
    )

}