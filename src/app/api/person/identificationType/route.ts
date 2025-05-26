import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const identificationTypes = await prisma.personsIdenType.findMany();
        return NextResponse.json({
            identificationTypes: identificationTypes.map((type) => ({
                id: type.id,
                type: type.type,
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