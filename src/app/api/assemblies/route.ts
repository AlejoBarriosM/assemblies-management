import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const assemblies = await prisma.asb_assemblies.findMany({
            include: {
                cus_customers: true,
                asb_assembliesTypes: true,
            },
        });
        return NextResponse.json({
            assemblies: assemblies.map((assembly) => ({
                id: assembly.id,
                customerId: assembly.customer_id,
                assemblyTypeId: assembly.assemblyType_id,
                assemblyDate: assembly.assemblyDate.toISOString(),
                description: assembly.description,
            })),
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    const { customerId, assemblyTypeId, assemblyDate, description } = body;

    try {
        const newAssembly = await prisma.asb_assemblies.create({
            data: {
                customer_id: customerId,
                assemblyType_id: assemblyTypeId,
                assemblyDate: new Date(assemblyDate),
                description,
            },
        });
        return NextResponse.json(newAssembly);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}
