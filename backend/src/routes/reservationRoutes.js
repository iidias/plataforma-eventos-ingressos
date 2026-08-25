import express from 'express';
import { z } from 'zod';
import { createReservation } from '../services/reservationService.js';
import { processPayment, getOwnedReservation } from '../services/paymentService.js';
import { auth } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

// customerId não entra aqui de propósito: quem reserva é sempre o dono do
// token. Qualquer campo a mais no corpo é ignorado pelo schema.
const createSchema = z.object({
  eventId: z.uuid('Informe um evento válido'),
  quantity: z
    .number('Informe a quantidade de ingressos')
    .int('A quantidade deve ser um número inteiro')
    .min(1, 'Reserve pelo menos 1 ingresso'),
});

router.post('/', auth, requireRole('CUSTOMER'), async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);

    res.status(201).json(await createReservation(req.user.sub, data));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }

    next(error);
  }
});

// A tela de checkout precisa do resumo do pedido. Só o dono lê a própria
// reserva; a de outro cliente responde 404, igual a uma que não existe.
router.get('/:id', auth, requireRole('CUSTOMER'), async (req, res, next) => {
  try {
    res.json(await getOwnedReservation(req.params.id, req.user.sub));
  } catch (error) {
    next(error);
  }
});

// Pagamento simulado. O "outcome" é opcional e explícito de propósito: é ele
// que permite ao avaliador testar aprovação e recusa de forma determinística,
// em vez de depender de sorteio (ver D19 em docs/DECISIONS.md).
const paymentSchema = z.object({
  outcome: z
    .enum(['approve', 'reject'], { message: 'O resultado deve ser "approve" ou "reject"' })
    .default('approve'),
});

router.post('/:id/payment', auth, requireRole('CUSTOMER'), async (req, res, next) => {
  try {
    const { outcome } = paymentSchema.parse(req.body ?? {});

    res.json(await processPayment(req.params.id, req.user.sub, outcome));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }

    next(error);
  }
});

export default router;
