import {PrismaClient} from "@prisma/client";
import {NextResponse} from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const id = request.headers?.get('id');
    if (id) {
        try {
            const city = await prisma.vw_Cities.findUnique({
                where: {
                    ID: Number(id),
                },
            });
            return NextResponse.json(city);
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error:', error.message);
            } else {
                console.error('Error desconocido');
            }
        }
    }
    try {
        const cities = await prisma.vw_Cities.findMany()
        return NextResponse.json({cities});
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}