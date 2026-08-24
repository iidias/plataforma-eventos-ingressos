import prisma from '../lib/prisma.js';
import { getMovie } from './tmdbService.js';
import { hashPassword } from '../lib/password.js';
import {
  generateGateEmail,
  generateGatePassword,
  gateExpiresAtFor,
  gateSummary,
} from '../lib/gateCredential.js';

function withAvailability(event) {
  return { ...event, available: event.capacity - event.soldCount };
}

function notFound() {
  const error = new Error('Evento não encontrado');
  error.status = 404;
  return error;
}

// Só o dono do evento pode mexer nele.
async function findOwnedEvent(id, organizerId) {
  const event = await prisma.event.findUnique({ where: { id } });

  if (!event) throw notFound();

  if (event.organizerId !== organizerId) {
    const error = new Error('Acesso negado');
    error.status = 403;
    throw error;
  }

  return event;
}

/**
 * Cria a credencial de portaria do evento dentro de uma transação já aberta.
 *
 * Devolve a senha em texto puro porque este é o único instante em que ela
 * existe: no banco fica apenas o hash. Quem chama decide se repassa a senha
 * na resposta (só o organizador dono, no momento da geração).
 *
 * A unicidade de gateEventId no banco garante um único GATE por evento mesmo
 * se duas publicações chegarem juntas — a segunda falha em vez de duplicar.
 */
async function createGateUser(tx, event) {
  const password = generateGatePassword();

  const gate = await tx.user.create({
    data: {
      name: `Portaria — ${event.title}`,
      email: generateGateEmail(),
      passwordHash: await hashPassword(password),
      role: 'GATE',
      gateEventId: event.id,
      gateExpiresAt: gateExpiresAtFor(event.eventDate),
    },
  });

  return { ...gateSummary(gate), password };
}

// Copia título, sinopse e imagem do TMDb para o banco (snapshot): depois
// disso o evento não depende mais da API externa estar no ar.
export async function createEvent(organizerId, data) {
  const movie = await getMovie(data.externalId);

  const eventData = {
    organizerId,
    externalId: movie.externalId,
    title: movie.title,
    synopsis: movie.synopsis,
    imageUrl: movie.imageUrl,
    eventDate: data.eventDate,
    venue: data.venue,
    capacity: data.capacity,
    priceCents: data.priceCents,
    status: data.status,
  };

  // Rascunho não tem portaria: a credencial nasce só na publicação.
  if (eventData.status !== 'PUBLISHED') {
    const event = await prisma.event.create({ data: eventData });
    return withAvailability(event);
  }

  // Nascendo já publicado, evento e credencial precisam existir juntos —
  // ou nenhum dos dois.
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.create({ data: eventData });
    const gate = await createGateUser(tx, event);

    return { ...withAvailability(event), gate };
  });
}

export async function listPublished() {
  const events = await prisma.event.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { eventDate: 'asc' },
  });

  return events.map(withAvailability);
}

export async function getPublishedById(id) {
  const event = await prisma.event.findUnique({ where: { id } });

  if (!event || event.status !== 'PUBLISHED') throw notFound();

  return withAvailability(event);
}

// Visão do organizador: inclui os dados da credencial (e-mail, validade,
// estado), mas nunca o hash nem a senha — que não é recuperável.
export async function listByOrganizer(organizerId) {
  const events = await prisma.event.findMany({
    where: { organizerId },
    orderBy: { createdAt: 'desc' },
    include: {
      gateUser: {
        select: { id: true, email: true, gateExpiresAt: true },
      },
    },
  });

  return events.map(({ gateUser, ...event }) => ({
    ...withAvailability(event),
    gate: gateSummary(gateUser),
  }));
}

export async function updateEvent(id, organizerId, data) {
  const event = await findOwnedEvent(id, organizerId);

  // Capacidade abaixo do já vendido deixaria mais ingressos que lugares.
  if (data.capacity !== undefined && data.capacity < event.soldCount) {
    const error = new Error(
      `Capacidade não pode ser menor que os ${event.soldCount} ingressos já vendidos`,
    );
    error.status = 400;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.event.update({ where: { id }, data });

    // Se a data mudou, a validade da credencial acompanha. Rascunho não tem
    // credencial, então updateMany simplesmente não encontra nada.
    if (data.eventDate !== undefined) {
      await tx.user.updateMany({
        where: { gateEventId: id },
        data: { gateExpiresAt: gateExpiresAtFor(updated.eventDate) },
      });
    }

    const gateUser = await tx.user.findUnique({
      where: { gateEventId: id },
      select: { id: true, email: true, gateExpiresAt: true },
    });

    return { ...withAvailability(updated), gate: gateSummary(gateUser) };
  });
}

/**
 * Publica o evento e cria a credencial de portaria, se ainda não existir.
 * É idempotente: republicar não gera uma segunda credencial nem devolve a
 * senha de novo (ela só aparece na geração).
 */
export async function publishEvent(id, organizerId) {
  await findOwnedEvent(id, organizerId);

  return prisma.$transaction(async (tx) => {
    const published = await tx.event.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });

    const existing = await tx.user.findUnique({
      where: { gateEventId: id },
      select: { id: true, email: true, gateExpiresAt: true },
    });

    if (existing) {
      return { ...withAvailability(published), gate: gateSummary(existing) };
    }

    const gate = await createGateUser(tx, published);

    return { ...withAvailability(published), gate };
  });
}

/**
 * Gera uma nova senha para a credencial do evento. A anterior deixa de
 * funcionar no mesmo instante, porque o hash é substituído. A nova senha é
 * devolvida só aqui — não existe caminho para consultá-la depois.
 *
 * Se o evento está publicado mas ainda não tem credencial, ela é criada aqui.
 * Isso cobre os eventos publicados antes desta funcionalidade existir: sem
 * isso eles ficariam permanentemente sem portaria, já que "Publicar" só
 * aparece para rascunho. Rascunho continua sem credencial — ela nasce na
 * publicação, e é lá que o organizador recebe a senha pela primeira vez.
 */
export async function regenerateGatePassword(id, organizerId) {
  const event = await findOwnedEvent(id, organizerId);

  if (event.status !== 'PUBLISHED') {
    const error = new Error(
      'A credencial da portaria nasce quando o evento é publicado',
    );
    error.status = 409;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const gate = await tx.user.findUnique({ where: { gateEventId: id } });

    // Evento publicado sem credencial: cria agora, com a validade derivada
    // da data atual do evento. gateEventId é @unique, então duas chamadas
    // simultâneas não conseguem gerar duas credenciais.
    if (!gate) return createGateUser(tx, event);

    const password = generateGatePassword();

    const updated = await tx.user.update({
      where: { id: gate.id },
      data: { passwordHash: await hashPassword(password) },
    });

    return { ...gateSummary(updated), password };
  });
}
