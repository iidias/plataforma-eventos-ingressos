import prisma from '../src/lib/prisma.js';
import { hashPassword } from '../src/lib/password.js';
import { gateExpiresAtFor } from '../src/lib/gateCredential.js';

// Contas de teste exigidas pelo desafio (tarefa 42).
// A portaria NÃO entra aqui: ela depende do evento existir primeiro.
const USERS = [
  { name: 'Organizador Teste', email: 'organizador@teste.com', password: 'senha123', role: 'ORGANIZER' },
  { name: 'Cliente 1', email: 'cliente1@teste.com', password: 'senha123', role: 'CUSTOMER' },
  { name: 'Cliente 2', email: 'cliente2@teste.com', password: 'senha123', role: 'CUSTOMER' },
];

// Exceção de demonstração: em eventos normais a credencial de portaria é
// gerada com e-mail e senha aleatórios na publicação. Aqui ela é fixa, porque
// o atalho de portaria da tela de login depende de credenciais conhecidas.
const DEMO_GATE = {
  name: 'Portaria Teste',
  email: 'portaria@teste.com',
  password: 'senha123',
};

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
    return existing;
  }

  const eventDate = new Date();
  eventDate.setDate(eventDate.getDate() + 30);

  const event = await prisma.event.create({
    data: { ...EVENT, organizerId, eventDate, status: 'PUBLISHED' },
  });

  console.log(`Evento criado: ${event.title} (${event.capacity} lugares)`);

  return event;
}

// Cria (ou adota) a credencial de demonstração e a vincula ao evento do seed.
// O upsert também resolve o usuário GATE antigo, que existia solto no banco
// sem vínculo nenhum: ele passa a apontar para o evento de demonstração.
async function seedDemoGate(event) {
  const passwordHash = await hashPassword(DEMO_GATE.password);
  const gateExpiresAt = gateExpiresAtFor(event.eventDate);

  // Se outra credencial já ocupa este evento (gateEventId é @unique), ela é
  // desvinculada antes, para o seed continuar reexecutável.
  await prisma.user.updateMany({
    where: { gateEventId: event.id, email: { not: DEMO_GATE.email } },
    data: { gateEventId: null },
  });

  const gate = await prisma.user.upsert({
    where: { email: DEMO_GATE.email },
    update: {
      passwordHash,
      role: 'GATE',
      gateEventId: event.id,
      gateExpiresAt,
    },
    create: {
      name: DEMO_GATE.name,
      email: DEMO_GATE.email,
      passwordHash,
      role: 'GATE',
      gateEventId: event.id,
      gateExpiresAt,
    },
  });

  console.log(
    `Portaria de demonstração: ${gate.email} → evento "${event.title}" (válida até ${gate.gateExpiresAt.toISOString()})`,
  );
}

async function main() {
  for (const u of USERS) {
    const passwordHash = await hashPassword(u.password);

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

  // Ordem obrigatória: organizador -> evento -> portaria vinculada ao evento.
  const event = await seedEvent(organizer.id);

  await seedDemoGate(event);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
