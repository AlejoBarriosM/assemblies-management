import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//get to one assembly
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    try {
        const assembly = await prisma.asb_assemblies.findUnique({
            where: {
                id: id,
            },
            include: {
                cus_customers: true,
                asb_assembliesTypes: true,
            },
        });
        return NextResponse.json({
            assembly: {
                id: assembly?.id,
                customerId: assembly?.customer_id,
                assemblyTypeId: assembly?.assemblyType_id,
                assemblyDate: assembly?.assemblyDate.toISOString(),
                description: assembly?.description,
            },
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const body = await request.json();
    const { id } = params;
    const { customerId, assemblyTypeId, assemblyDate, description } = body;

    try {
        const updatedAssembly = await prisma.asb_assemblies.update({
            where: {
                id: id,
            },
            data: {
                customer_id: customerId,
                assemblyType_id: assemblyTypeId,
                assemblyDate: new Date(assemblyDate),
                description,
            },
        });
        return NextResponse.json(updatedAssembly);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    try {
        const deletedAssembly = await prisma.asb_assemblies.delete({
            where: {
                id: id,
            },
        });
        return NextResponse.json(deletedAssembly);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}