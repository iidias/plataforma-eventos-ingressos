import express from 'express';
import { listByOrganizer } from '../services/eventService.js';
import { auth } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

router.get('/events', auth, requireRole('ORGANIZER'), async (req, res, next) => {
  try {
    res.json(await listByOrganizer(req.user.sub));
  } catch (error) {
    next(error);
  }
});

export default router;
