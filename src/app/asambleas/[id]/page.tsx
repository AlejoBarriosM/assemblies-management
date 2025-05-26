import FormAssemblies from "@/app/asambleas/_formAssemblies";

export default function Page({params}: {params: {id: string}}) {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Editar Asamblea</h1>
            <FormAssemblies mode="edit" id={params.id} />
        </div>
    );
}