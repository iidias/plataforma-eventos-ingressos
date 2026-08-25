import { randomBytes, randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

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

/**
 * Monta os dados de um ingresso.
 *
 * O `code` é um JWT assinado com TICKET_SECRET: é isso que impede o QR de ser
 * forjado. Qualquer um consegue ler o conteúdo, mas ninguém consegue produzir
 * um código válido sem o segredo, que só existe no servidor. Adulterou um
 * caractere, a verificação quebra.
 *
 * O `shareToken` é separado de propósito: o link de compartilhamento é público,
 * então não pode carregar o código que a portaria valida nem ser adivinhável.
 *
 * O id é gerado aqui, e não pelo banco, porque ele precisa estar dentro do
 * próprio código assinado.
 */
function buildTicketData(reservation) {
  if (!process.env.TICKET_SECRET) {
    throw new Error('TICKET_SECRET não configurado');
  }

  const id = randomUUID();

  return {
    id,
    reservationId: reservation.id,
    eventId: reservation.eventId,
    customerId: reservation.customerId,
    code: jwt.sign({ tid: id, eid: reservation.eventId }, process.env.TICKET_SECRET),
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

/**
 * Visão pública do ingresso, aberta por qualquer um que tenha o link.
 *
 * O select é a parte que importa: nada de e-mail, nome ou id do dono. Quem
 * recebeu o link vê o ingresso, não a pessoa que comprou.
 */
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
