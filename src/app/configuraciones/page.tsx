'use client"'

import {ChartAreaInteractive} from "@/components/chart-area-interactive"
import {DataTable} from "@/components/data-table"
import {SectionCards} from "@/components/section-cards"

import data from "./data.json"

export default function Page() {
    return (
        <div>
            <div className="px-4 lg:px-6">
                <a href="settings/company" className="text-sm text-muted-foreground">
                    Company Settings
                </a>
            </div>
        </div>
    )
}
