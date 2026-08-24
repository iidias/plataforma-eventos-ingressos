import prisma from '../lib/prisma.js';

function notFound() {
  const error = new Error('Evento não encontrado');
  error.status = 404;
  return error;
}

function soldOut() {
  const error = new Error('Lugares insuficientes');
  error.status = 409;
  return error;
}

/**
 * Cria a reserva reservando os lugares no mesmo instante.
 *
 * O problema que esta função resolve: "ler soldCount, ver se cabe, depois
 * gravar" não segura concorrência. Entre a leitura e a escrita cabe outra
 * requisição, e as duas acham que cabe. Um `if` em JavaScript não tem como
 * impedir isso, porque as duas execuções já passaram pelo `if` antes de
 * qualquer uma gravar.
 *
 * A solução é não deixar a decisão no JavaScript: a condição de
 * disponibilidade vai dentro do WHERE do próprio UPDATE, e quem decide é o
 * banco. `updateMany` devolve quantas linhas casaram — se duas requisições
 * chegarem juntas, apenas uma encontra a linha no estado esperado e a outra
 * recebe `count === 0`.
 *
 * Tudo roda dentro de uma transação: se a criação da reserva falhar depois do
 * incremento, o soldCount volta atrás junto. Nunca sobra lugar vendido sem
 * reserva, nem reserva sem lugar vendido.
 *
 * @param {string} customerId  vem do token, nunca do corpo da requisição
 * @param {{ eventId: string, quantity: number }} data
 */
export async function createReservation(customerId, { eventId, quantity }) {
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({ where: { id: eventId } });

    // Rascunho é tratado como inexistente, igual a GET /events/:id: quem não
    // pode ver o evento também não descobre que ele existe.
    if (!event || event.status !== 'PUBLISHED') throw notFound();

    const updated = await tx.event.updateMany({
      where: {
        id: eventId,
        // Trava a linha no mesmo estado que foi lido. O Prisma não compara
        // duas colunas no where, então o limite abaixo precisa usar o
        // capacity que veio da leitura — e prender capacity e status aqui
        // garante que ele ainda é o valor válido. Se o organizador reduzir a
        // capacidade ou despublicar o evento nesse meio-tempo, nenhuma linha
        // casa e a reserva falha, em vez de vender além do novo limite.
        status: 'PUBLISHED',
        capacity: event.capacity,
        soldCount: { lte: event.capacity - quantity },
      },
      data: { soldCount: { increment: quantity } },
    });

    if (updated.count === 0) throw soldOut();

    // Preço vem do banco, não do frontend: o cliente escolhe a quantidade,
    // nunca quanto vai pagar.
    return tx.reservation.create({
      data: {
        eventId,
        customerId,
        quantity,
        totalCents: event.priceCents * quantity,
        status: 'PENDING',
      },
    });
  });
}
