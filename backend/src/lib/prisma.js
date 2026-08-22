import { PrismaClient } from '../../generated/prisma/client.js';

// Uma única instância do Prisma Client para todo o backend.
// Se cada arquivo criar a sua própria, o app abre conexões demais com o banco.
const prisma = new PrismaClient();

export default prisma;
