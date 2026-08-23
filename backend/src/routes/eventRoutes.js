import express from 'express';
import { z } from 'zod';
import {
  createEvent,
  listPublished,
  getPublishedById,
  updateEvent,
  publishEvent,
} from '../services/eventService.js';
import { auth } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

const futureDate = z.coerce
  .date('Informe uma data válida para o evento')
  .refine((date) => date > new Date(), 'A data do evento deve ser no futuro');

const venue = z.string('Informe o local do evento').min(1, 'Informe o local do evento');
const capacity = z
  .number('Informe a capacidade do evento')
  .int()
  .min(1, 'A capacidade deve ser de no mínimo 1');
const priceCents = z
  .number('Informe o preço do ingresso')
  .int()
  .min(0, 'O preço não pode ser negativo');

const createSchema = z.object({
  externalId: z.string('Informe o filme do catálogo').min(1, 'Informe o filme do catálogo'),
  eventDate: futureDate,
  venue,
  capacity,
  priceCents,
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
});

const updateSchema = z.object({
  eventDate: futureDate.optional(),
  venue: venue.optional(),
  capacity: capacity.optional(),
  priceCents: priceCents.optional(),
});

function handleValidation(error, res, next) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ error: error.issues[0].message });
  }

  next(error);
}

router.post('/', auth, requireRole('ORGANIZER'), async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    res.status(201).json(await createEvent(req.user.sub, data));
  } catch (error) {
    handleValidation(error, res, next);
  }
});

router.get('/', async (req, res, next) => {
  try {
    res.json(await listPublished());
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    res.json(await getPublishedById(req.params.id));
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', auth, requireRole('ORGANIZER'), async (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body);
    res.json(await updateEvent(req.params.id, req.user.sub, data));
  } catch (error) {
    handleValidation(error, res, next);
  }
});

router.post('/:id/publish', auth, requireRole('ORGANIZER'), async (req, res, next) => {
  try {
    res.json(await publishEvent(req.params.id, req.user.sub));
  } catch (error) {
    next(error);
  }
});

export default router;
