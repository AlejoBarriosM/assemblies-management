import {NextResponse} from 'next/server';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const roadTypes = await prisma.grl_roadTypes.findMany();
        return NextResponse.json({
            roadTypes: roadTypes.map((roadType) => ({
                id: roadType.id,
                name: roadType.name,
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

//POST function to create a new road type
export async function POST(request: Request) {
    const body = await request.json();
    const {name} = body;
    try {
        const newRoadType = await prisma.grl_roadTypes.create({
            data: {
                name,
            },
        });
        return NextResponse.json({
            message: 'Road type created successfully',
            roadType: newRoadType,
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}

//PUT function to update a road type
export async function PUT(request: Request) {
    const body = await request.json();
    const {id, name} = body;
    try {
        const updatedRoadType = await prisma.grl_roadTypes.update({
            where: {id},
            data: {
                name,
            },
        });
        return NextResponse.json({
            message: 'Road type updated successfully',
            roadType: updatedRoadType,
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}

//DELETE function to delete a road type
export async function DELETE(request: Request) {
    const body = await request.json();
    const {id} = body;
    try {
        const deletedRoadType = await prisma.grl_roadTypes.delete({
            where: {id},
        });
        return NextResponse.json({
            message: 'Road type deleted successfully',
            roadType: deletedRoadType,
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}