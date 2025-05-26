import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const id = request.headers?.get('id');
    if (id) {
        try {
            const country = await prisma.grl_countries.findUnique({
                where: {
                    id: Number(id),
                },
            });
            return NextResponse.json({
                country: {
                    id: country?.id,
                    name: country?.name,
                },
            });
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error:', error.message);
            } else {
                console.error('Error desconocido');
            }
        }
    }
    try {
        const countries = await prisma.grl_countries.findMany();
        return NextResponse.json({
            countries: countries.map((country) => ({
                id: country.id,
                name: country.name,
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
    const { name } = body;

    try {
        const country = await prisma.grl_countries.create({
            data: {
                name,
            },
        });
        return NextResponse.json({
            country: {
                id: country.id,
                name: country.name,
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

export async function PUT(request: Request) {
    const body = await request.json();
    const { id, name } = body;

    try {
        const country = await prisma.grl_countries.update({
            where: { id },
            data: { name },
        });
        return NextResponse.json({
            country: {
                id: country.id,
                name: country.name,
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

export async function DELETE(request: Request) {
    const body = await request.json();
    const { id } = body;

    try {
        const country = await prisma.grl_countries.delete({
            where: { id },
        });
        return NextResponse.json({
            country: {
                id: country.id,
                name: country.name,
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
