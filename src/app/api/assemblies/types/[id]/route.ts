import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//get to one assembly type
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const {id} = params;
    try {
        const assembliesType = await prisma.asb_assembliesTypes.findUnique({
            where:{
                id: id,
            }
        });
        return NextResponse.json({
            assembliesType: {
                id: assembliesType?.id,
                typeName: assembliesType?.typeName,
                typeDescription: assembliesType?.typeDescription,
            },
        })
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}

//update to one assembly type
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const {id} = params;
    const body = await request.json();
    try {
        const assembliesType = await prisma.asb_assembliesTypes.update({
            where:{
                id: id,
            },
            data:{
                typeName: body.typeName,
                typeDescription: body.typeDescription,
            }
        });
        return NextResponse.json({
            assembliesType: {
                id: assembliesType.id,
                typeName: assembliesType.typeName,
                typeDescription: assembliesType.typeDescription,
            },
        })
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}

//delete to one assembly type
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const {id} = params;
    try {
        const assembliesType = await prisma.asb_assembliesTypes.delete({
            where:{
                id: id,
            }
        });
        return NextResponse.json({
            assembliesType: {
                id: assembliesType.id,
                typeName: assembliesType.typeName,
                typeDescription: assembliesType.typeDescription,
            },
        })
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}
