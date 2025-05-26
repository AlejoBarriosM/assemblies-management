import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const identTypes = await prisma.grl_personsIdenType.findMany();
        return NextResponse.json({
            identTypes: identTypes.map((identType) => ({
                id: identType.id,
                type: identType.type,
            })),
        });
    } catch (error) {
        console.error("Error fetching ident types:", error);
        return NextResponse.json({error: "Failed to fetch ident types"}, {status: 500});
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    const {type} = body;
    try {
        const newIdentType = await prisma.grl_personsIdenType.create({
            data: {
                type,
            },
        });
        return NextResponse.json({
            message: 'Ident type created successfully',
            identType: newIdentType,
        });
    } catch (error) {
        console.error("Error creating ident type:", error);
        return NextResponse.json({error: "Failed to create ident type"}, {status: 500});
    } finally {
        await prisma.$disconnect();
    }
}

// PUT request to update an existing ident type
export async function PUT(request: Request) {
    const body = await request.json();
    const {id, type} = body;
    try {
        const updatedIdentType = await prisma.grl_personsIdenType.update({
            where: {id},
            data: {
                type,
            },
        });
        return NextResponse.json({
            message: 'Ident type updated successfully',
            identType: updatedIdentType,
        });
    } catch (error) {
        console.error("Error updating ident type:", error);
        return NextResponse.json({error: "Failed to update ident type"}, {status: 500});
    } finally {
        await prisma.$disconnect();
    }
}

// DELETE request to delete an existing ident type
export async function DELETE(request: Request) {
    const body = await request.json();
    const {id} = body;
    try {
        const deletedIdentType = await prisma.grl_personsIdenType.delete({
            where: {id},
        });
        return NextResponse.json({
            message: 'Ident type deleted successfully',
            identType: deletedIdentType,
        });
    } catch (error) {
        console.error("Error deleting ident type:", error);
        return NextResponse.json({error: "Failed to delete ident type"}, {status: 500});
    } finally {
        await prisma.$disconnect();
    }
}