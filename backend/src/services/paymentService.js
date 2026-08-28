import prisma from '../lib/prisma.js';
import { createTicketsForReservation, withCredential } from './ticketService.js';
import { releaseExpiredReservations } from './reservationService.js';

const REJECTION_REASON = 'Pagamento recusado pela operadora (simulado)';

function notFound() {
  const error = new Error('Reserva não encontrada');
  error.status = 404;
  return error;
}

function alreadyProcessed() {
  const error = new Error('Esta reserva já foi processada');
  error.status = 409;
  return error;
}

function expired() {
  const error = new Error('Sua reserva expirou e os lugares voltaram para a venda');
  error.status = 409;
  return error;
}

/**
 * Processa o pagamento simulado de uma reserva.
 *
 * Os dois caminhos rodam inteiros dentro de uma transação, porque cada um
 * toca em mais de uma tabela e um estado pela metade seria pior que o erro:
 *
 *   aprovado  -> Payment(APPROVED) + reserva PAID + N ingressos
 *   recusado  -> Payment(REJECTED) + reserva REJECTED + capacidade devolvida
 *
 * A devolução da capacidade no caminho recusado é o ponto que não pode falhar:
 * a reserva já tinha incrementado o soldCount no momento em que foi criada.
 * Se o pagamento cai e ninguém devolve, os lugares somem do estoque para
 * sempre, sem ingresso nenhum do outro lado.
 *
 * A troca de status usa updateMany com `status: 'PENDING'` no where, e não um
 * update direto: dois cliques simultâneos em "Simular recusa" leriam ambos
 * PENDING e devolveriam a capacidade duas vezes. Com a condição dentro do
 * UPDATE, só um recebe count === 1 — o mesmo raciocínio da reserva (D18).
 *
 * @param {string} reservationId
 * @param {string} customerId  vem do token, nunca do corpo da requisição
 * @param {'approve'|'reject'} outcome
 */
export async function processPayment(reservationId, customerId, outcome) {
  return prisma.$transaction(async (tx) => {
    await releaseExpiredReservations(tx);

    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
      include: { event: { select: { id: true, title: true, eventDate: true, venue: true } } },
    });

    // Reserva de outro cliente é tratada como inexistente: quem não é dono
    // não descobre nem que ela existe.
    if (!reservation || reservation.customerId !== customerId) throw notFound();
    if (reservation.status === 'EXPIRED') throw expired();
    if (reservation.status !== 'PENDING') throw alreadyProcessed();

    const novoStatus = outcome === 'approve' ? 'PAID' : 'REJECTED';

    const trocou = await tx.reservation.updateMany({
      where: { id: reservationId, status: 'PENDING' },
      data: { status: novoStatus },
    });

    if (trocou.count === 0) throw alreadyProcessed();

    if (outcome === 'reject') {
      // Devolve os lugares ao estoque. Sem isto, a capacidade reservada some.
      await tx.event.update({
        where: { id: reservation.eventId },
        data: { soldCount: { decrement: reservation.quantity } },
      });

      const payment = await tx.payment.create({
        data: { reservationId, status: 'REJECTED', reason: REJECTION_REASON },
      });

      return {
        outcome: 'rejected',
        payment,
        reservation: { ...reservation, status: 'REJECTED' },
        tickets: [],
      };
    }

    const payment = await tx.payment.create({
      data: { reservationId, status: 'APPROVED' },
    });

    const tickets = await createTicketsForReservation(tx, reservation);

    return {
      outcome: 'approved',
      payment,
      reservation: { ...reservation, status: 'PAID' },
      // O dono recebe a credencial assinada, não o payload que ficou no banco.
      tickets: tickets.map(withCredential),
    };
  });
}

/**
 * Reserva do cliente logado, com o resumo do evento. É o que a tela de
 * checkout precisa para montar o resumo do pedido.
 */
export async function getOwnedReservation(reservationId, customerId) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      event: {
        select: { id: true, title: true, imageUrl: true, eventDate: true, venue: true, priceCents: true },
      },
      payment: { select: { status: true, reason: true } },
    },
  });

  if (!reservation || reservation.customerId !== customerId) throw notFound();

  return reservation;
}
