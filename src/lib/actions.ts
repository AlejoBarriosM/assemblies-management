"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Generic create action
export async function createRecord(model: string, data: any, redirectPath?: string, revalidatePaths: string[] = []) {
    try {
        // Dynamically call the appropriate Prisma model
        const result = await (prisma as any)[model].create({
            data,
        })

        // Revalidate paths if provided
        if (revalidatePaths.length > 0) {
            revalidatePaths.forEach((path) => revalidatePath(path))
        }

        // Redirect if path provided
        if (redirectPath) {
            redirect(redirectPath)
        }

        return { success: true, data: result }
    } catch (error) {
        console.error(`Error creating ${model}:`, error)
        return { success: false, error: `Failed to create ${model}` }
    }
}

// Generic update action
export async function updateRecord(
    model: string,
    id: string,
    data: any,
    redirectPath?: string,
    revalidatePaths: string[] = [],
) {
    try {
        // Dynamically call the appropriate Prisma model
        const result = await (prisma as any)[model].update({
            where: { id },
            data,
        })

        // Revalidate paths if provided
        if (revalidatePaths.length > 0) {
            revalidatePaths.forEach((path) => revalidatePath(path))
        }

        // Redirect if path provided
        if (redirectPath) {
            redirect(redirectPath)
        }

        return { success: true, data: result }
    } catch (error) {
        console.error(`Error updating ${model}:`, error)
        return { success: false, error: `Failed to update ${model}` }
    }
}

// Generic delete action
export async function deleteRecord(model: string, id: string, redirectPath?: string, revalidatePaths: string[] = []) {
    try {
        // Dynamically call the appropriate Prisma model
        await (prisma as any)[model].delete({
            where: { id },
        })

        // Revalidate paths if provided
        if (revalidatePaths.length > 0) {
            revalidatePaths.forEach((path) => revalidatePath(path))
        }

        // Redirect if path provided
        if (redirectPath) {
            redirect(redirectPath)
        }

        return { success: true }
    } catch (error) {
        console.error(`Error deleting ${model}:`, error)
        return { success: false, error: `Failed to delete ${model}` }
    }
}

// Generic get record action
export async function getRecord(model: string, id: string) {
    try {
        // Dynamically call the appropriate Prisma model
        const result = await (prisma as any)[model].findUnique({
            where: { id },
        })

        return { success: true, data: result }
    } catch (error) {
        console.error(`Error fetching ${model}:`, error)
        return { success: false, error: `Failed to fetch ${model}` }
    }
}

// Generic get records action
export async function getRecords(
    model: string,
    options: {
        where?: any
        orderBy?: any
        take?: number
        skip?: number
        include?: any
    } = {},
) {
    try {
        // Dynamically call the appropriate Prisma model
        const result = await (prisma as any)[model].findMany(options)

        return { success: true, data: result }
    } catch (error) {
        console.error(`Error fetching ${model} records:`, error)
        return { success: false, error: `Failed to fetch ${model} records` }
    }
}

