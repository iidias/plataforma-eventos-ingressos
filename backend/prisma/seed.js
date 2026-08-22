import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma.js';

// Os 4 usuários de teste exigidos pelo desafio (tarefa 42).
const USERS = [
  { name: 'Organizador Teste', email: 'organizador@teste.com', password: 'senha123', role: 'ORGANIZER' },
  { name: 'Cliente 1', email: 'cliente1@teste.com', password: 'senha123', role: 'CUSTOMER' },
  { name: 'Cliente 2', email: 'cliente2@teste.com', password: 'senha123', role: 'CUSTOMER' },
  { name: 'Portaria Teste', email: 'portaria@teste.com', password: 'senha123', role: 'GATE' },
];

async function main() {
  for (const u of USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);

    // upsert em vez de create: rodar o seed de novo não quebra por e-mail duplicado.
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
      },
    });

    console.log(`Usuário garantido: ${u.email} (${u.role})`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
