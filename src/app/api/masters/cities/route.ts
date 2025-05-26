import {NextResponse} from 'next/server';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const id = request.headers?.get('id');
    const stateId = request.headers?.get('stateId');
    if (stateId) {
        try {
            const cities = await prisma.grl_cities.findMany({
                where: {
                    state_id: Number(stateId),
                },
            });
            return NextResponse.json({
                cities: cities.map((citie) => ({
                    id: citie.id,
                    stateId: citie.state_id,
                    name: citie.name,
                })),
            });
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error:', error.message);
            } else {
                console.error('Error desconocido');
            }
        }
    }
    if (id) {
        try {
            const city = await prisma.grl_cities.findUnique({
                where: {
                    id: Number(id),
                },
            });
            return NextResponse.json({
                city: {
                    id: city?.id,
                    name: city?.name,
                    stateId: city?.state_id,
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
        const cities = await prisma.grl_cities.findMany();
        return NextResponse.json({
            cities: cities.map((citie) => ({
                id: citie.id,
                stateId: citie.state_id,
                name: citie.name,
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

export async function PUT(request: Request) {
    const body = await request.json();
    const {id, name, stateId} = body;
    try {
        const updatedCity = await prisma.grl_cities.update({
            where: {id},
            data: {
                name,
                state_id: stateId,
            },
        });
        return NextResponse.json({
            message: 'City updated successfully',
            city: updatedCity,
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
    const {name, stateId} = body;
    try {
        const newCity = await prisma.grl_cities.create({
            data: {
                name,
                state_id: stateId,
            },
        });
        return NextResponse.json({
            message: 'City created successfully',
            city: newCity,
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
    const {id} = body;
    try {
        const deletedCity = await prisma.grl_cities.delete({
            where: {id},
        });
        return NextResponse.json({
            message: 'City deleted successfully',
            city: deletedCity,
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}
