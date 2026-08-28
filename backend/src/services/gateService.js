import prisma from '../lib/prisma.js';
import { verify } from '../lib/ticketCode.js';

const eventSelect = { id: true, title: true, eventDate: true, venue: true };

/**
 * Valida um ingresso na portaria, na ordem exata dos 4 estados.
 */
export async function validateTicket(code, gateEventId, gateUserId) {
  // Primeiro degrau: a assinatura. Credencial que o servidor não emitiu nem
  // chega ao banco — o lookup deixa de ser o que decide se o código é legítimo
  // e volta a decidir só o estado do ingresso.
  const credential = verify(code);

  if (!credential.ok) {
    // Formato quebrado é digitação errada. Formato certo com assinatura errada
    // é alguém mexendo nos caracteres de uma credencial: fica registrado no log
    // do servidor, que é onde os erros do projeto já são reportados. O valor
    // tentado vai junto porque, justamente por não ter assinatura válida, ele
    // não serve para entrar em lugar nenhum.
    if (credential.reason === 'SIGNATURE') {
      console.error('[gate] credencial com assinatura invalida', {
        gateUserId,
        gateEventId,
        tentativa: String(code).trim().toUpperCase(),
      });
    }

    return { result: 'INVALID' };
  }

  const ticket = await prisma.ticket.findUnique({
    where: { code: credential.payload },
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
