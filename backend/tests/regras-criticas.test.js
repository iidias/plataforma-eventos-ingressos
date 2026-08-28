// As 4 regras que, se quebrarem, quebram o produto inteiro: vender além da
// capacidade, perder lugar num pagamento recusado, aceitar código inventado e
// deixar o mesmo ingresso entrar duas vezes.

// São testes de integração: falam com o banco de verdade, porque as duas
// primeiras regras acontecem dentro do UPDATE do Postgres (D18). Com o banco
// dublado eu estaria testando o dublê, não a regra.
import 'dotenv/config';
import { afterAll, beforeAll, expect, test, vi } from 'vitest';

import prisma from '../src/lib/prisma.js';
import { createReservation } from '../src/services/reservationService.js';
import { processPayment } from '../src/services/paymentService.js';
import { validateTicket } from '../src/services/gateService.js';
import { getPublicTicket } from '../src/services/ticketService.js';

// Sufixo pelo relógio: cada execução cria os seus próprios registros e não
// esbarra em e-mail repetido se uma limpeza anterior tiver falhado.
const sufixo = Date.now();

let cliente;
let evento;
let portaria;

beforeAll(async () => {
  const organizador = await prisma.user.create({
    data: {
      name: 'Organizador do teste',
      email: `organizador-${sufixo}@teste.com`,
      passwordHash: 'nao-usado',
      role: 'ORGANIZER',
    },
  });

  cliente = await prisma.user.create({
    data: {
      name: 'Cliente do teste',
      email: `cliente-${sufixo}@teste.com`,
      passwordHash: 'nao-usado',
      role: 'CUSTOMER',
    },
  });

  evento = await prisma.event.create({
    data: {
      organizerId: organizador.id,
      externalId: 'teste',
      title: 'Evento do teste',
      synopsis: 'Criado e apagado pelos testes.',
      eventDate: new Date('2030-01-01T20:00:00Z'),
      venue: 'Sala de teste',
      capacity: 5,
      priceCents: 1000,
      status: 'PUBLISHED',
    },
  });

  portaria = await prisma.user.create({
    data: {
      name: 'Portaria do teste',
      email: `portaria-${sufixo}@teste.com`,
      passwordHash: 'nao-usado',
      role: 'GATE',
      gateEventId: evento.id,
      gateExpiresAt: new Date('2030-01-03T00:00:00Z'),
    },
  });
});

// A ordem importa: a chave estrangeira não deixa apagar o evento antes do que
// aponta para ele.
afterAll(async () => {
  await prisma.ticket.deleteMany({ where: { eventId: evento.id } });
  await prisma.payment.deleteMany({ where: { reservation: { eventId: evento.id } } });
  await prisma.reservation.deleteMany({ where: { eventId: evento.id } });
  await prisma.user.delete({ where: { id: portaria.id } });
  await prisma.event.delete({ where: { id: evento.id } });
  await prisma.user.deleteMany({ where: { email: { endsWith: `-${sufixo}@teste.com` } } });
  await prisma.$disconnect();
});

test('reservar mais do que a capacidade é recusado', async () => {
  await expect(
    createReservation(cliente.id, { eventId: evento.id, quantity: evento.capacity + 1 }),
  ).rejects.toMatchObject({ status: 409 });
});

test('pagamento recusado não gera ingresso e devolve a capacidade', async () => {
  const antes = await prisma.event.findUnique({ where: { id: evento.id } });

  const reserva = await createReservation(cliente.id, { eventId: evento.id, quantity: 1 });
  const pagamento = await processPayment(reserva.id, cliente.id, 'reject');

  const depois = await prisma.event.findUnique({ where: { id: evento.id } });

  expect(pagamento.tickets).toHaveLength(0);
  expect(depois.soldCount).toBe(antes.soldCount);
});

test('código que não existe no banco é inválido', async () => {
  const resultado = await validateTicket('IFM-2026-NAOEXISTE', evento.id, portaria.id);

  expect(resultado.result).toBe('INVALID');
});

test('o mesmo ingresso não é validado duas vezes', async () => {
  const reserva = await createReservation(cliente.id, { eventId: evento.id, quantity: 1 });
  const { tickets } = await processPayment(reserva.id, cliente.id, 'approve');
  const { code } = tickets[0];

  const primeira = await validateTicket(code, evento.id, portaria.id);
  const segunda = await validateTicket(code, evento.id, portaria.id);

  expect(primeira.result).toBe('VALID');
  expect(segunda.result).toBe('ALREADY_USED');
});

// Alfabeto da credencial: os 32 símbolos sem I, L, O e U.
const CREDENCIAL = /^IFM-[0-9A-HJKMNP-TV-Z]{12}-[0-9A-HJKMNP-TV-Z]{6}$/;

// Troca o último caractere por outro do alfabeto, para adulterar sem sair do
// formato — é justamente o caso que a assinatura precisa pegar.
const adultera = (parte) => parte.slice(0, -1) + (parte.at(-1) === 'Z' ? 'Y' : 'Z');

test('credencial adulterada e invalida sem consultar o banco', async () => {
  const reserva = await createReservation(cliente.id, { eventId: evento.id, quantity: 1 });
  const { tickets } = await processPayment(reserva.id, cliente.id, 'approve');
  const credencial = tickets[0].code;

  expect(credencial).toMatch(CREDENCIAL);

  const [prefixo, payload, tag] = credencial.split('-');

  const adulteradas = [
    `${prefixo}-${adultera(payload)}-${tag}`, // payload alterado
    `${prefixo}-${payload}-${adultera(tag)}`, // tag alterada
    'IFM-2026-NAOEXISTE', //                     formato invalido
  ];

  const lookup = vi.spyOn(prisma.ticket, 'findUnique');

  for (const adulterada of adulteradas) {
    const resultado = await validateTicket(adulterada, evento.id, portaria.id);

    expect(resultado.result).toBe('INVALID');
  }

  // O ponto do HMAC: nenhuma das tres chegou ao banco.
  expect(lookup).not.toHaveBeenCalled();
  lookup.mockRestore();

  // E a credencial legitima continua valendo depois das tentativas.
  const legitima = await validateTicket(credencial, evento.id, portaria.id);

  expect(legitima.result).toBe('VALID');
});

test('o ingresso publico nao expoe o codigo de entrada', async () => {
  const reserva = await createReservation(cliente.id, { eventId: evento.id, quantity: 1 });
  const { tickets } = await processPayment(reserva.id, cliente.id, 'approve');

  const publico = await getPublicTicket(tickets[0].shareToken);

  // O contrato inteiro, e nao so a ausencia de um campo: a visao publica
  // devolve estado e evento, nada alem disso.
  expect(Object.keys(publico).sort()).toEqual(['event', 'status', 'usedAt']);
  expect(publico).not.toHaveProperty('code');
});
