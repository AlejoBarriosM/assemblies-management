import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//get all assembliesTypes from database
export async function GET() {
    try {
        const assembliesTypes = await prisma.asb_assembliesTypes.findMany();
        return NextResponse.json({
            assembliesTypes: assembliesTypes.map((type) => ({
                id: type.id,
                name: type.typeName,
                description: type.typeDescription,
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

//post
export async function POST(request: Request) {
    const body = await request.json();
    const { name, description } = body;

    try {
        const newAssemblyType = await prisma.asb_assembliesTypes.create({
            data: {
                typeName: name,
                typeDescription: description,
            },
        });
        return NextResponse.json(newAssemblyType);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}