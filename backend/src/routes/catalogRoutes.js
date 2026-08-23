import express from 'express';
import { searchMovies, getMovie } from '../services/tmdbService.js';
import { auth } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/requireRole.js';

const router = express.Router();

// A chave do TMDb fica só no servidor: por isso o catálogo passa por aqui
// em vez de o front chamar a API externa direto.
router.get('/search', auth, requireRole('ORGANIZER'), async (req, res, next) => {
  try {
    const query = (req.query.q || '').trim();

    if (!query) {
      return res.status(400).json({ error: 'Informe o termo de busca' });
    }

    res.json(await searchMovies(query));
  } catch (error) {
    next(error);
  }
});

router.get('/:externalId', auth, requireRole('ORGANIZER'), async (req, res, next) => {
  try {
    res.json(await getMovie(req.params.externalId));
  } catch (error) {
    next(error);
  }
});

export default router;
