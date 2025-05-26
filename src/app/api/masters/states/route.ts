import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const id = request.headers?.get('id');
    if (id) {
        try {
            const states = await prisma.grl_states.findUnique({
                where: {
                    id: Number(id),
                },
            });
            return NextResponse.json({
                state: {
                    id: states?.id,
                    name: states?.name,
                    country_id: states?.country_id,
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
        const states = await prisma.grl_states.findMany();
        return NextResponse.json({
            states: states.map(state => ({
                id: state.id,
                country_id: state.country_id,
                name: state.name,
            }))
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
    const { country_id, name } = body;

    try {
        const state = await prisma.grl_states.create({
            data: {
                country_id,
                name,
            },
        });
        return NextResponse.json({
            state: {
                id: state.id,
                country_id: state.country_id,
                name: state.name,
            }
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
    const { id, country_id, name } = body;

    try {
        const state = await prisma.grl_states.update({
            where: { id },
            data: { country_id, name },
        });
        return NextResponse.json({
            state: {
                id: state.id,
                country_id: state.country_id,
                name: state.name,
            }
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
        const state = await prisma.grl_states.delete({
            where: { id },
        });
        return NextResponse.json({
            state: {
                id: state.id,
                name: state.name,
            }
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}


