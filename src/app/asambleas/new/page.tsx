import FormAssemblies from "@/app/asambleas/_formAssemblies";

export default function Page() {
    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">Nueva Asamblea</h1>
            <FormAssemblies mode="new" />
        </div>
    );
}
