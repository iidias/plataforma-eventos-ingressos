import { randomBytes } from 'node:crypto';
import prisma from '../lib/prisma.js';

const eventSelect = { id: true, title: true, imageUrl: true, eventDate: true, venue: true };

const ticketInclude = {
  reservation: { select: { id: true, quantity: true, createdAt: true } },
  event: { select: eventSelect },
};

// Alfabeto sem I, L, O e U: ninguém confunde 1 com I nem 0 com O ao digitar o
// código na portaria. São 8 caracteres sorteados entre 32, ou 40 bits. Como
// 256 é múltiplo exato de 32, o resto da divisão não distorce o sorteio.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function notFound() {
  const error = new Error('Ingresso não encontrado');
  error.status = 404;
  return error;
}

function generateCode() {
  const chars = Array.from(randomBytes(8), (byte) => ALPHABET[byte % 32]);

  return `IFM-${new Date().getFullYear()}-${chars.join('')}`;
}

// Monta os dados de um ingresso.
function buildTicketData(reservation) {
  return {
    reservationId: reservation.id,
    eventId: reservation.eventId,
    customerId: reservation.customerId,
    code: generateCode(),
    shareToken: randomBytes(24).toString('hex'),
    status: 'VALID',
  };
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
export function listCustomerTickets(customerId) {
  return prisma.ticket.findMany({
    where: { customerId, reservation: { status: 'PAID' } },
    include: ticketInclude,
    orderBy: [{ reservation: { createdAt: 'desc' } }, { createdAt: 'asc' }],
  });
}

// Ingresso de outro cliente é tratado como inexistente: quem não é dono não
// descobre nem que ele existe.
export async function getOwnedTicket(id, customerId) {
  const ticket = await prisma.ticket.findUnique({ where: { id }, include: ticketInclude });

  if (!ticket || ticket.customerId !== customerId) throw notFound();

  return ticket;
}

export async function buildShareUrl(id, customerId) {
  const ticket = await getOwnedTicket(id, customerId);
  const base = String(process.env.APP_PUBLIC_URL ?? '').replace(/\/$/, '');

  return { shareUrl: `${base}/i/${ticket.shareToken}` };
}

// Visão pública do ingresso, aberta por qualquer um que tenha o link.
export async function getPublicTicket(shareToken) {
  const ticket = await prisma.ticket.findUnique({
    where: { shareToken },
    select: {
      code: true,
      status: true,
      usedAt: true,
      event: { select: { title: true, imageUrl: true, eventDate: true, venue: true } },
    },
  });

  if (!ticket) throw notFound();

  return ticket;
}
