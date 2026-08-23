import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma.js';

// Os 4 usuários de teste exigidos pelo desafio (tarefa 42).
const USERS = [
  { name: 'Organizador Teste', email: 'organizador@teste.com', password: 'senha123', role: 'ORGANIZER' },
  { name: 'Cliente 1', email: 'cliente1@teste.com', password: 'senha123', role: 'CUSTOMER' },
  { name: 'Cliente 2', email: 'cliente2@teste.com', password: 'senha123', role: 'CUSTOMER' },
  { name: 'Portaria Teste', email: 'portaria@teste.com', password: 'senha123', role: 'GATE' },
];

// Dados do filme fixos de propósito (tarefa 56): assim o seed funciona
// mesmo que o TMDb esteja fora do ar.
const EVENT = {
  externalId: '27205',
  title: 'A Origem',
  synopsis:
    'Dom Cobb é um ladrão com a rara habilidade de roubar segredos do inconsciente, obtidos durante o estado de sono. Impedido de retornar para sua família, ele recebe a oportunidade de se redimir ao realizar uma tarefa aparentemente impossível: plantar uma ideia na mente do herdeiro de um império.',
  imageUrl: 'https://image.tmdb.org/t/p/w500/9e3Dz7aCANy5aRUQF745IlNloJ1.jpg',
  venue: 'Cine Belas Artes — São Paulo/SP',
  capacity: 50,
  priceCents: 3500,
};

async function seedEvent(organizerId) {
  const existing = await prisma.event.findFirst({
    where: { organizerId, externalId: EVENT.externalId },
  });

  if (existing) {
    console.log(`Evento já existe: ${existing.title}`);
    return;
  }

  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 30);

  const event = await prisma.event.create({
    data: { ...EVENT, organizerId, eventDate, status: 'PUBLISHED' },
  });

  console.log(`Evento criado: ${event.title} (${event.capacity} lugares)`);
}

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

  const organizer = await prisma.user.findUnique({
    where: { email: 'organizador@teste.com' },
  });

  await seedEvent(organizer.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
