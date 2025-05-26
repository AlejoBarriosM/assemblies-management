import {NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
    const id = request.headers?.get("id");
    if (id) {
        try {
            const department = await prisma.emp_companyDepartments.findUnique({
                where: {
                    id: Number(id),
                },
                include: {
                    emp_companyDepartments: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                },
            });
            return NextResponse.json({
                department: {
                    id: department?.id,
                    name: department?.name,
                    description: department?.description,
                    departmentParentId: department?.emp_companyDepartments ?
                        {
                            id: department.emp_companyDepartments.id,
                            name: department.emp_companyDepartments.name,
                        } :
                        null,
                    bossId: department?.boss_id,
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
    try {
        const departments = await prisma.emp_companyDepartments.findMany({
            include: {
                emp_companyDepartments: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                emp_employees: {
                    select: {
                        id: true,

                    }
                }
            },
        });
        return NextResponse.json({
            departments: departments.map((department) => ({
                id: department.id,
                name: department.name,
                departmentParentId: department.emp_companyDepartments ?
                    {
                        id: department.emp_companyDepartments.id,
                        name: department.emp_companyDepartments.name,
                    } :
                    null,

                bossId: department.boss_id,
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
    const {name, description, departmentParent_id, boss_id, company_id} = body;

    try {
        const newDepartment = await prisma.emp_companyDepartments.create({
            data: {
                name,
                description,
                departmentParent_id,
                boss_id,
                company_id
            },
        });
        return NextResponse.json(newDepartment);
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
    const id= request.headers.get("id");

    const {name, description, departmentParent_id, boss_id} = body;

    try {
        const updatedDepartment = await prisma.emp_companyDepartments.update({
            where: {id: Number(id as string)},
            data: {
                name,
                description,
                departmentParent_id,
                boss_id
            },
        });
        return NextResponse.json(updatedDepartment);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}

export async function DELETE(request: Request) {
    const id = request.headers.get("id");

    try {
        const deletedDepartment = await prisma.emp_companyDepartments.delete({
            where: {id: Number(id as string)},
        });
        return NextResponse.json(deletedDepartment);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        } else {
            console.error("Error desconocido");
        }
    }
}