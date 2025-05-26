import {NextResponse} from 'next/server';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const company = await prisma.grl_company.findMany();
        return NextResponse.json(company);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}

export async function PUT(request: Request) {
    const body = await request.json();
    const id = request.headers.get("id");

    const {nit, commercialName, legalName, email, website} = body;

    try {
        const company = await prisma.grl_company.update({
            where: {id: id as string},
            data: {
                nit,
                commercialName,
                legalName,
                email,
                website,
            },
        });
        return NextResponse.json(company);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }

}