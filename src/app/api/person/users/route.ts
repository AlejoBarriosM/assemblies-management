// import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
//
// const prisma = new PrismaClient();
//
// export async function GET() {
//     try {
//         const users = await prisma.users.findMany({
//             include: { books: true }, // Opcional: traer libros relacionados
//         });
//         return NextResponse.json(users);
//     } catch (error) {
//         return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
//     }
// }
