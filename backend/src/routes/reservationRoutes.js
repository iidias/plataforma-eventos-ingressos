import express from 'express';
import { z } from 'zod';
import { createReservation } from '../services/reservationService.js';
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
    .min(1, 'Reserve pelo menos 1 ingresso')
    .max(5, 'Máximo de 5 ingressos por compra'),
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

export default router;
