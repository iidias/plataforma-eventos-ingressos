import express from 'express';
import { getPublicTicket } from '../services/ticketService.js';

const router = express.Router();

// Sem auth: quem tem o link vê o ingresso. O que protege aqui é o próprio
// shareToken, 24 bytes aleatórios, e o select do service, que não devolve
// nada sobre o dono. Token inexistente responde 404.
router.get('/tickets/:shareToken', async (req, res, next) => {
  try {
    res.json(await getPublicTicket(req.params.shareToken));
  } catch (error) {
    next(error);
  }
});

export default router;
