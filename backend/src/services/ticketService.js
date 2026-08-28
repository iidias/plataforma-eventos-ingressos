import { randomBytes } from 'node:crypto';
import prisma from '../lib/prisma.js';
import { generatePayload, toCredential } from '../lib/ticketCode.js';

const eventSelect = { id: true, title: true, imageUrl: true, eventDate: true, venue: true };

const ticketInclude = {
  reservation: { select: { id: true, quantity: true, createdAt: true } },
  event: { select: eventSelect },
};

function notFound() {
  const error = new Error('Ingresso não encontrado');
  error.status = 404;
  return error;
}

// O que vai para a coluna `code` é só o payload da credencial. A assinatura
// não é gravada: ela é recalculada por toCredential quando o ingresso é
// entregue ao dono, e por verify quando a portaria confere (ver ticketCode.js).
function buildTicketData(reservation) {
  return {
    reservationId: reservation.id,
    eventId: reservation.eventId,
    customerId: reservation.customerId,
    code: generatePayload(),
    shareToken: randomBytes(24).toString('hex'),
    status: 'VALID',
  };
}

// Troca o payload guardado no banco pela credencial assinada completa. É esta
// forma que o dono vê na tela, leva no QR e dita para a portaria.
export function withCredential(ticket) {
  return { ...ticket, code: toCredential(ticket.code) };
}

/**
 * Gera um ingresso por unidade reservada: quantity 2 gera dois códigos, cada
 * um com o seu QR e o seu link (D21). Recebe o cliente da transação do
 * pagamento, porque só nasce ingresso junto com o pagamento aprovado.
 */
export async function createTicketsForReservation(tx, reservation) {
  const tickets = [];

  for (let i = 0; i < reservation.quantity; i += 1) {
    tickets.push(await tx.ticket.create({ data: buildTicketData(reservation) }));
  }

  return tickets;
}

// Ingressos do cliente logado. Só reserva paga tem ingresso, mas o filtro por
// status fica explícito para o dia em que existir cancelamento.
export async function listCustomerTickets(customerId) {
  const tickets = await prisma.ticket.findMany({
    where: { customerId, reservation: { status: 'PAID' } },
    include: ticketInclude,
    orderBy: [{ reservation: { createdAt: 'desc' } }, { createdAt: 'asc' }],
  });

  return tickets.map(withCredential);
}

// Ingresso de outro cliente é tratado como inexistente: quem não é dono não
// descobre nem que ele existe.
export async function getOwnedTicket(id, customerId) {
  const ticket = await prisma.ticket.findUnique({ where: { id }, include: ticketInclude });

  if (!ticket || ticket.customerId !== customerId) throw notFound();

  return withCredential(ticket);
}

export async function buildShareUrl(id, customerId) {
  const ticket = await getOwnedTicket(id, customerId);
  const base = String(process.env.APP_PUBLIC_URL ?? '').replace(/\/$/, '');

  return { shareUrl: `${base}/i/${ticket.shareToken}` };
}

// Visão pública do ingresso, aberta por qualquer um que tenha o link.
//
// O select não devolve o `code`: o link é público e circula por WhatsApp, então
// não pode carregar a credencial que a portaria valida — quem recebe o link
// veria o ingresso e poderia entrar no lugar do titular. Aqui só saem o estado
// do ingresso e os dados do evento, que é o que a página compartilhada precisa.
// Nada sobre o dono, também.
export async function getPublicTicket(shareToken) {
  const ticket = await prisma.ticket.findUnique({
    where: { shareToken },
    select: {
      status: true,
      usedAt: true,
      event: { select: { title: true, imageUrl: true, eventDate: true, venue: true } },
    },
  });

  if (!ticket) throw notFound();

  return ticket;
}
