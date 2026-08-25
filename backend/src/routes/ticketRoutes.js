import express from 'express';
import {
  listCustomerTickets,
  getOwnedTicket,
  buildShareUrl,
} from '../services/ticketService.js';
import { auth } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

router.get('/me', auth, requireRole('CUSTOMER'), async (req, res, next) => {
  try {
    res.json(await listCustomerTickets(req.user.sub));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', auth, requireRole('CUSTOMER'), async (req, res, next) => {
  try {
    res.json(await getOwnedTicket(req.params.id, req.user.sub));
  } catch (error) {
    next(error);
  }
});

// O link é montado no backend porque o APP_PUBLIC_URL muda entre local e
// deploy, e é o servidor que sabe qual dos dois está rodando.
router.post('/:id/share', auth, requireRole('CUSTOMER'), async (req, res, next) => {
  try {
    res.json(await buildShareUrl(req.params.id, req.user.sub));
  } catch (error) {
    next(error);
  }
});

export default router;
