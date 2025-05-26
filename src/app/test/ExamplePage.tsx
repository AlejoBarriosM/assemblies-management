'use client'
// Ejemplo de cómo podrías usarlo (esto iría en otro archivo, ej. tu página)

import {
    DynamicTableConfig,
    DynamicDataTable,
    ChartCellConfig,
    ActionsCellConfig, DataRow,
} from "@/components/dinamic-data-table";
import {useState} from "react";
import {toast} from "sonner";

const ExamplePage = () => {
  // Define tu configuración JSON aquí
  const tableConfig: DynamicTableConfig<MyDataType> = {
    tableId: "myProductsTable",
    title: "Listado de Productos",
    dataKey: "productId",
    columns: [
      { id: "name", accessorKey: "name", header: "Producto", cellType: "text", enableSorting: true },
      { id: "category", accessorKey: "category", header: "Categoría", cellType: "badge", cellConfig: { variantMapping: { "Electronics": "default", "Books": "secondary" } } },
      { id: "status", accessorKey: "status", header: "Estado", cellType: "icon", cellConfig: { iconMapping: { "active": "CheckCircle2Icon", "inactive": "XCircleIcon" } } },
      { id: "price", accessorKey: "price", header: "Precio", cellType: "text", cellConfig: { prefix: "$", suffix: " USD" } },
      { 
        id: "revenueChart", 
        accessorKey: "monthlyRevenue", // Suponiendo que monthlyRevenue es [{ month: "Jan", revenue: 100 }, ...]
        header: "Ingresos Mensuales", 
        cellType: "chart", 
        cellConfig: { 
          chartType: "area", 
          dataKey: "monthlyRevenue", 
          xAxisDataKey: "month", 
          areaDataKey: "revenue",
          strokeColor: "#22c55e",
          fillColor: "#86efac",
          height: 60,
        } as ChartCellConfig<MyDataType>
      },
      {
        id: "actions",
        accessorKey: "id", // No se usa para mostrar, solo para contexto de acción
        header: "Acciones",
        cellType: "actions",
        cellConfig: {
          actions: [
            { id: "editProduct", label: "Editar", icon: "EditIcon", actionType: "openSheet", actionParams: { sheetId: "editProductSheet" } },
            { id: "deleteProduct", label: "Eliminar", icon: "Trash2Icon", actionType: "callback", actionParams: { callbackId: "handleDeleteProduct" }, variant: "destructive", confirmationRequired: "¿Estás seguro de que quieres eliminar este producto?" },
          ],
          displayType: "dropdown"
        } as ActionsCellConfig<MyDataType>
      }
    ],
    features: {
      pagination: { enabled: true, initialPageSize: 5, availablePageSizes: [5, 10, 20] },
      sorting: { enabled: true },
      filtering: { enabled: true, globalFilterPlaceholder: "Buscar productos..." },
      rowSelection: { enabled: true, type: "multiple" },
      columnVisibility: true,
      rowDnd: { enabled: true, onOrderChangeActionId: "handleProductOrderChange" }
    },
    globalActions: [
      { id: "addProduct", label: "Añadir Producto", icon: "PlusCircleIcon", actionType: "openSheet", actionParams: { sheetId: "addProductSheet" } },
      { id: "addProduct", label: "Añadir Producto", icon: "PlusCircleIcon", actionType: "openSheet", actionParams: { sheetId: "addProductSheet" } }
    ],
    sheetDefinitions: [
      {
        id: "addProductSheet",
        triggerActionId: "addProduct", // Coincide con globalAction
        title: "Añadir Nuevo Producto",
        form: {
          fields: [
            { name: "name", label: "Nombre del Producto", fieldType: "text", validation: { required: true } },
            { name: "category", label: "Categoría", fieldType: "select", options: [{value: "Electronics", label: "Electrónica"}, {value: "Books", label: "Libros"}] },
            { name: "price", label: "Precio", fieldType: "number", validation: { required: true, min: 0 } },
          ],
          layoutColumns: 1,
        },
        submitActionId: "submitNewProduct", // Necesitas definir esta acción global
        submitActionLabel: "Crear Producto"
      },
      {
        id: "editProductSheet",
        triggerActionId: "editProduct", // Coincide con rowAction
        title: (rowData) => `Editar Producto: ${rowData?.name}`,
        form: {
          fields: [
            { name: "name", label: "Nombre del Producto", fieldType: "text", defaultValuePath: "name", validation: { required: true } },
            { name: "category", label: "Categoría", fieldType: "select", defaultValuePath: "category", options: [{value: "Electronics", label: "Electrónica"}, {value: "Books", label: "Libros"}] },
            { name: "price", label: "Precio", fieldType: "number", defaultValuePath: "price", validation: { required: true, min: 0 } },
          ],
        },
        submitActionId: "submitEditProduct", // Necesitas definir esta acción global
        submitActionLabel: "Guardar Cambios"
      }
    ],
    emptyStateMessage: "No hay productos para mostrar.",
  };

  // Define tus datos y callbacks
  interface MyDataType extends DataRow {
    productId: string;
    name: string;
    category: string;
    status: "active" | "inactive";
    price: number;
    monthlyRevenue: { month: string, revenue: number }[];
  }

  const [products, setProducts] = useState<MyDataType[]>([
    // ... tus datos iniciales
    { productId: "1", name: "Laptop Pro", category: "Electronics", status: "active", price: 1200, monthlyRevenue: [{month: 'Jan', revenue: 100}, {month: 'Feb', revenue: 150}] },
    { productId: "2", name: "Awesome Book", category: "Books", status: "active", price: 25, monthlyRevenue: [{month: 'Jan', revenue: 20}, {month: 'Feb', revenue: 25}] },
  ]);

  const myCallbacks = {
    handleDeleteProduct: async (params: { rowData?: MyDataType }) => {
      if (params.rowData) {
        toast.success(`Producto "${params.rowData.name}" eliminado (simulado).`);
        setProducts(prev => prev.filter(p => p.productId !== params.rowData!.productId));
      }
    },
    handleProductOrderChange: async (params: { allRows?: MyDataType[] }) => {
        if (params.allRows) {
            toast.info("Orden de productos actualizado (simulado).");
            // Aquí podrías llamar a una API para guardar el nuevo orden
            console.log("Nuevo orden:", params.allRows.map(p => p.productId));
        }
    },
    // Callbacks para submit de los sheets (necesitarías acciones globales para ellos)
    // Ejemplo: si submitNewProduct y submitEditProduct son ActionConfig de tipo 'callback'
    // submitNewProductCallback: async (params: { formData?: DataRow }) => { ... },
    // submitEditProductCallback: async (params: { rowData?: MyDataType, formData?: DataRow }) => { ... },
  };
  
  // Necesitarías definir acciones globales para los submit de los sheets si son de tipo 'apiCall' o 'callback'
  // Por ejemplo, en tableConfig.globalActions:
  // { id: "submitNewProduct", label: "Interna", actionType: "apiCall", actionParams: { url: "/api/products", method: "POST" } },
  // { id: "submitEditProduct", label: "Interna", actionType: "apiCall", actionParams: { url: "/api/products/{{productId}}", method: "PUT" } },


  return (
    <div className="container mx-auto py-10">
      <DynamicDataTable
        config={tableConfig}
        data={products}
        setData={setProducts} // Para que DND actualice el estado
        callbacks={myCallbacks}
        isLoading={false}
      />
    </div>
  );
};

export default ExamplePage;