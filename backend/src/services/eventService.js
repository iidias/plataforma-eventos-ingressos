import prisma from '../lib/prisma.js';
import { getMovie } from './tmdbService.js';

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

// Copia título, sinopse e imagem do TMDb para o banco (snapshot): depois
// disso o evento não depende mais da API externa estar no ar.
export async function createEvent(organizerId, data) {
  const movie = await getMovie(data.externalId);

  const event = await prisma.event.create({
    data: {
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
    },
  });

  return withAvailability(event);
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

export async function listByOrganizer(organizerId) {
  const events = await prisma.event.findMany({
    where: { organizerId },
    orderBy: { createdAt: 'desc' },
  });

  return events.map(withAvailability);
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

  const updated = await prisma.event.update({ where: { id }, data });

  return withAvailability(updated);
}

export async function publishEvent(id, organizerId) {
  await findOwnedEvent(id, organizerId);

  const published = await prisma.event.update({
    where: { id },
    data: { status: 'PUBLISHED' },
  });

  return withAvailability(published);
}
