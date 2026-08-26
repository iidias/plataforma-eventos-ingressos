import prisma from '../lib/prisma.js';

const eventSelect = { id: true, title: true, eventDate: true, venue: true };

/**
 * Valida um ingresso na portaria, na ordem exata dos 4 estados.
 */
export async function validateTicket(code, gateEventId, gateUserId) {
  const ticket = await prisma.ticket.findUnique({
    where: { code: code.trim().toUpperCase() },
    include: { event: { select: eventSelect }, customer: { select: { name: true } } },
  });

  if (!ticket) return { result: 'INVALID' };

  // Devolve o evento certo para a portaria orientar a pessoa, nunca quem comprou.
  if (ticket.eventId !== gateEventId) {
    return { result: 'WRONG_EVENT', event: ticket.event };
  }

  if (ticket.status === 'USED') {
    return { result: 'ALREADY_USED', usedAt: ticket.usedAt, event: ticket.event };
  }

  // A condição vai dentro do UPDATE: dois leitores no mesmo instante, só um passa.
  const used = await prisma.ticket.updateMany({
    where: { code: ticket.code, status: 'VALID' },
    data: { status: 'USED', usedAt: new Date(), validatedById: gateUserId },
  });

  if (used.count === 0) {
    return { result: 'ALREADY_USED', event: ticket.event };
  }

  return { result: 'VALID', customerName: ticket.customer.name, event: ticket.event };
}
