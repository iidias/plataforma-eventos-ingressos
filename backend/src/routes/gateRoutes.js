import express from 'express';
import { z } from 'zod';
import { validateTicket } from '../services/gateService.js';
import { auth } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

const validateSchema = z.object({
  code: z.string().trim().min(1, 'Informe o código do ingresso'),
});

// O evento vem de req.gateEventId, que o middleware auth preenche a partir da
// credencial. A portaria não escolhe qual evento validar.
router.post('/validate', auth, requireRole('GATE'), async (req, res, next) => {
  try {
    const { code } = validateSchema.parse(req.body);

    res.json(await validateTicket(code, req.gateEventId, req.user.sub));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0].message });
    }

    next(error);
  }
});

export default router;
