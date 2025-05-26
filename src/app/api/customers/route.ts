import {NextResponse} from 'next/server';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();


export async function GET() {
    try {
        const customers = await prisma.customers.findMany({
            include: {
                persons: true,
                locations: true,
            },
        });
        return NextResponse.json({
            customers: customers.map((customer) => ({
                id: customer.id,
                person: customer.person_id,
                personName: customer.persons.legalName,
                customerType: customer.customerType,
                location: customer.location_id,
                email: customer.email,
                phone: customer.phone,
                logo: customer.logo,
                stocks: customer.stocks,
                percentage: customer.percentage,
                status: customer.status,
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
    const {personId, customerType, locationId, email, phone, logo, stocks, percentage, status} = body;

    try {
        const newCustomer = await prisma.customers.create({
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
        return NextResponse.json(newCustomer);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}

