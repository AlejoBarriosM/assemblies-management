import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//get to one customer
export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    try {
        const customer = await prisma.customers.findUnique({
            where: {
                id,
            },
            include: {
                persons: true,
                locations: true,
            },
        });
        if (!customer) {
            return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
        }
        return NextResponse.json({
            customer: {
                id: customer.id,
                personId: customer.person_id,
                customerType: customer.customerType,
                locationId: customer.location_id,
                email: customer.email,
                phone: customer.phone,
                logo: customer.logo,
                stocks: customer.stocks,
                percentage: customer.percentage,
                status: customer.status,
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

//update customer
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const body = await request.json();
    const { personId, customerType, locationId, email, phone, logo, stocks, percentage, status } = body;
    const { id } = params;

    try {
        const updatedCustomer = await prisma.customers.update({
            where: {
                id,
            },
            data: {
                person_id: personId,
                customerType,
                location_id: locationId,
                email,
                phone,
                logo,
                stocks,
                percentage,
                status
            },
        });
        return NextResponse.json(updatedCustomer);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}

//delete customer
export async function DELETE(request: Request, { params }: { params: { id: string } }) {

    const { id } = params;

    try {
        const deletedCustomer = await prisma.customers.delete({
            where: {
                id,
            },
        });
        return NextResponse.json(deletedCustomer);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}