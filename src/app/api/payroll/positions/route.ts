import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const positions = await prisma.companyPositions.findMany({
            include: {
                companyDepartments: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                companyPositions: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
        });
        return NextResponse.json({
            positions: positions.map((position) => ({
                id: position.id,
                name: position.name,
                description: position.description,
                department_id: position.companyDepartments ?
                    {
                        id: position.companyDepartments.id,
                        name: position.companyDepartments.name,
                    } :
                    null,
                positionParent: position.companyPositions ?
                    {
                        id: position.companyPositions.id,
                        name: position.companyPositions.name
                    } :
                    null,
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