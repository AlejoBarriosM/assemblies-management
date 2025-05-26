'use client'
import CitiesTable from "./_citiesTable";

export default function Page() {
    return (
        <div className="container mx-auto py-10">
            <div className="space-y-12">
                <div>
                    <CitiesTable/>
                </div>
            </div>
        </div>
    )
}