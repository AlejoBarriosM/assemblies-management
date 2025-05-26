"use client"

import type React from "react"

import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Fragment, useMemo } from "react"
import { ChevronRight, Home } from "lucide-react"

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface DynamicBreadcrumbProps {
    /**
     * Custom labels for path segments
     * e.g. { "products": "Our Products", "category-1": "Category One" }
     */
    customLabels?: Record<string, string>

    /**
     * Whether to show the home icon at the beginning
     */
    showHomeIcon?: boolean

    /**
     * Whether to show the query parameters in the last breadcrumb
     */
    showQueryParams?: boolean

    /**
     * Custom separator component
     */
    separator?: React.ReactNode
}

/**
 * Converts a URL path segment to a human-readable label
 */
function segmentToLabel(segment: string): string {
    // Handle dynamic route segments like [id] or [...slug]
    if (segment.startsWith("[") && segment.endsWith("]")) {
        return segment.slice(1, -1)
    }

    // Replace hyphens and underscores with spaces
    return (
        segment
            .replace(/[-_]/g, " ")
            // Capitalize first letter of each word
            .replace(/\b\w/g, (char) => char.toUpperCase())
    )
}

export function DynamicBreadcrumb({
                                      customLabels = {},
                                      showHomeIcon = true,
                                      showQueryParams = false,
                                      separator = <ChevronRight className="h-4 w-4" />,
                                  }: DynamicBreadcrumbProps) {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const breadcrumbItems = useMemo(() => {
        // Skip empty segments
        const segments = pathname.split("/").filter(Boolean)

        // Build up the breadcrumb items with their paths
        return segments.map((segment, index) => {
            // Calculate the href for this breadcrumb item
            const href = `/${segments.slice(0, index + 1).join("/")}`

            // Get the label for this segment (custom label or generated)
            const label = customLabels[segment] || segmentToLabel(segment)

            // Determine if this is the last item
            const isLastItem = index === segments.length - 1

            return {
                href,
                label,
                isLastItem,
            }
        })
    }, [pathname, customLabels])

    // Format query parameters for display
    const queryParamsString = useMemo(() => {
        if (!showQueryParams || !searchParams.size) return null

        const params: string[] = []
        searchParams.forEach((value, key) => {
            params.push(`${key}=${value}`)
        })

        return params.join("&")
    }, [searchParams, showQueryParams])

    return (
        <Breadcrumb className="w-full">
            <BreadcrumbList className="flex-wrap">
                {/* Home item */}
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/" aria-label="Home">
                            {showHomeIcon ? <Home className="h-4 w-4" /> : "Home"}
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {/* Only show separator if we have path segments */}
                {breadcrumbItems.length > 0 && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}

                {/* Path segments */}
                {breadcrumbItems.map((item, index) => (
                    <Fragment key={item.href}>
                        <BreadcrumbItem>
                            {item.isLastItem ? (
                                <BreadcrumbPage>
                                    {item.label}
                                    {queryParamsString && (
                                        <span className="ml-1 text-xs text-muted-foreground">?{queryParamsString}</span>
                                    )}
                                </BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link href={item.href}>{item.label}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>

                        {/* Add separator between items, but not after the last one */}
                        {!item.isLastItem && <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>}
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}

