import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

// Uma única instância do Prisma Client para todo o backend.
// Se cada arquivo criar a sua própria, o app abre conexões demais com o banco.
const prisma = new PrismaClient({ adapter });

export default prisma;
